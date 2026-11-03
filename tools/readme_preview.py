"""Render README.md like a GitHub profile page and screenshot it full-length,
desktop and phone, light and dark (via prefers-color-scheme, so <picture>
switches exactly as it does on GitHub).

    python tools/readme_preview.py           # screenshots
    python tools/readme_preview.py --open    # write preview.html and open it in the browser
"""
import sys
import webbrowser
from pathlib import Path

import markdown
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
CSS = """
:root{color-scheme:light dark}
body{margin:0;font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#fff;color:#1f2328}
@media (prefers-color-scheme:dark){body{background:#0d1117;color:#e6edf3}a{color:#4493f8}}
a{color:#0969da;text-decoration:none}
article{max-width:880px;margin:0 auto;padding:24px 16px}
img{max-width:100%}
details{margin:8px 0 0}summary{cursor:pointer}
code{font-size:85%;padding:.2em .4em;border-radius:6px;background:rgba(129,139,152,.15)}
"""


def main():
    readme = next((a for a in sys.argv[1:] if a.endswith(".md")), "README.md")
    tag = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--tag=")), "")
    html = markdown.markdown((ROOT / readme).read_text(), extensions=["extra"])
    page_file = ROOT / "preview.html"
    page_file.write_text(f"<html><head><meta charset=utf-8><title>arnav-yadav README preview</title><style>{CSS}</style></head><body><article>{html}</article></body></html>")
    if "--open" in sys.argv:
        webbrowser.open(page_file.as_uri())
        return
    out = ROOT / "screenshots"
    out.mkdir(exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for scheme in ("light", "dark"):
            for name, width in (("desktop", 912), ("mobile", 390)):
                page = browser.new_page(viewport={"width": width, "height": 900}, color_scheme=scheme, device_scale_factor=1.5)
                page.goto(page_file.as_uri())
                page.wait_for_timeout(2500)
                path = out / f"readme{tag}-{scheme}-{name}.png"
                page.screenshot(path=str(path), full_page=True)
                page.close()
                print(path)
        browser.close()


if __name__ == "__main__":
    main()
