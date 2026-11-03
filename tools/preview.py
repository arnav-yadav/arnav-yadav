"""Screenshot images on a GitHub-like page, desktop 880 and phone 380, both themes.

    python tools/preview.py mockups hero-a hero-b      # one page per name
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

PAGE = {"light": "#ffffff", "dark": "#0d1117"}
TEXT = {"light": "#1f2328", "dark": "#e6edf3"}


def html(folder, names, theme, width):
    imgs = "".join(
        f'<p><img src="{(folder / f"{n}-{theme}.svg").resolve().as_uri()}" style="width:100%;display:block"></p>'
        for n in names
    )
    return (f"<html><body style='margin:0;background:{PAGE[theme]};color:{TEXT[theme]};"
            f"font:16px -apple-system,sans-serif'><article style='width:{width - 32}px;padding:16px'>{imgs}</article></body></html>")


def main():
    folder = Path(sys.argv[1]).resolve()
    names = sys.argv[2:]
    shots = folder / "shots"
    shots.mkdir(exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name in names:
            for theme in ("dark", "light"):
                for width in (912, 412):
                    page = browser.new_page(viewport={"width": width, "height": 800}, device_scale_factor=2)
                    tmp = shots / f"_{name}-{theme}-{width}.html"
                    tmp.write_text(html(folder, name.split("+"), theme, width))
                    page.goto(tmp.as_uri())
                    page.wait_for_timeout(2600)
                    out = shots / f"{name.replace('+', '_')}-{theme}-{'desktop' if width > 500 else 'mobile'}.png"
                    page.screenshot(path=str(out), full_page=True)
                    tmp.unlink()
                    page.close()
                    print(out)
        browser.close()


if __name__ == "__main__":
    main()
