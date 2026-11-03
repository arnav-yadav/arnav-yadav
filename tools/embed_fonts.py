"""Embed subsetted woff2 fonts into SVGs, in place.

Each SVG built by build.mjs carries a `/*@fonts*/` marker inside its <style>.
For every SVG we collect the characters used per family (sans or mono) and
weight, subset the variable font to that weight and those characters, and
replace the marker with base64 @font-face rules. GitHub renders SVGs in a
sandboxed <img>, so fonts must travel inside the file.

    python tools/embed_fonts.py assets/*.svg
"""
import base64
import io
import re
import sys
import xml.etree.ElementTree as ET
from functools import lru_cache
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

FONTS = Path(__file__).resolve().parent.parent / "assets" / "src" / "fonts"
FAMILIES = {
    "sans": ("AY Sans", FONTS / "SchibstedGrotesk.ttf"),
    "mono": ("AY Mono", FONTS / "JetBrainsMono.ttf"),
}
MARKER = "/*@fonts*/"
# <text|tspan ... data-f="sans-600">content</...>
RUN = re.compile(r'<(text|tspan)\b[^>]*\bdata-f="(sans|mono)-(\d{3})"[^>]*>(.*?)</\1>', re.S)


@lru_cache(maxsize=None)
def instance(family, weight):
    font = TTFont(FAMILIES[family][1])
    return instancer.instantiateVariableFont(font, {"wght": weight}), font


def woff2(family, weight, chars):
    font, _ = instance(family, weight)
    buf = io.BytesIO()
    font.save(buf)
    buf.seek(0)
    sub = TTFont(buf)
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["kern", "liga", "calt", "tnum"]
    opts.name_IDs = []
    opts.notdef_outline = True
    s = subset.Subsetter(opts)
    s.populate(text=chars)
    s.subset(sub)
    out = io.BytesIO()
    sub.flavor = "woff2"
    sub.save(out)
    return out.getvalue()


def unescape(text):
    text = re.sub(r"<[^>]+>", "", text)
    return (text.replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"')
            .replace("&#39;", "'").replace("&amp;", "&"))


def embed(path):
    svg = path.read_text()
    if MARKER not in svg:
        return 0
    used = {}
    for _, family, weight, content in RUN.findall(svg):
        used.setdefault((family, int(weight)), set()).update(unescape(content))
    rules = []
    for (family, weight), chars in sorted(used.items()):
        chars.update(" ")
        data = base64.b64encode(woff2(family, weight, "".join(sorted(chars)))).decode()
        rules.append(
            f"@font-face{{font-family:'{FAMILIES[family][0]}';font-weight:{weight};"
            f"src:url(data:font/woff2;base64,{data}) format('woff2')}}"
        )
    path.write_text(svg.replace(MARKER, "".join(rules)))
    ET.parse(path)  # a malformed SVG renders as a broken image on GitHub: fail the build instead
    return len(rules)


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        p = Path(arg)
        n = embed(p)
        print(f"{p.name}: {n} faces, {p.stat().st_size // 1024} KB")
