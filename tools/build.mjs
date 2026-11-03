// v3 generator: draws every image in two inks. Fonts are embedded afterwards
// by tools/embed_fonts.py, which reads the data-f attribute on each text run.
import { mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
// The anatomy kit (MIT, by Ryan) is vendored so the daily Action can build without the skill installed.
const KIT = process.env.ANATOMY_KIT || join(ROOT, "vendor", "anatomy", "iso-kit.mjs");
const k = await import(KIT);
const config = JSON.parse(readFileSync(join(ROOT, "config.json"), "utf8"));
// Build date drives the fact of the day and the cache-busting ?v= on image URLs.
const LAYOUT = process.env.LAYOUT || config.layout || "full";
const BUILT = process.env.BUILD_DATE || new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const OUT = join(ROOT, process.argv[2] || "assets");
mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) if (f.endsWith(".svg")) unlinkSync(join(OUT, f)); // drop images from a previous layout

// ---------- inks ----------------------------------------------------------
const INKS = {
  dark: {
    panel: "#12110F", rule: "#2A2824", ink: "#F2EEE6", soft: "#C9C3B7", muted: "#8F897D", accent: "#FFB547",
    iso: {
      paper: "#171613", face: "#2A2824", top: "#2E2C28", "shade-0": "#161512", "shade-1": "#1B1A17", "shade-2": "#211F1C", "shade-3": "#272522",
      "lit-top": "#3B2C12", "lit-shade": "#2A200E", hi: "#E2DCD0", mid: "#9A9488", lo: "#5E5A52", faint: "#3A3832", lit: "#FFB547",
      halo: "#000000", "halo-opacity": ".9", dot: "#E6E1D6",
    },
  },
  light: {
    panel: "#F6F3EC", rule: "#DDD8CC", ink: "#1B1915", soft: "#3E3A33", muted: "#6F6A60", accent: "#B85F00",
    iso: {
      paper: "#FBF9F4", face: "#FFFFFF", top: "#FFFFFF", "shade-0": "#DCD7CC", "shade-1": "#E5E1D7", "shade-2": "#EDEAE2", "shade-3": "#F4F1EA",
      "lit-top": "#FFE7BF", "lit-shade": "#F5D29A", hi: "#2A2721", mid: "#8C877C", lo: "#B7B2A6", faint: "#D7D2C6", lit: "#B85F00",
      halo: "#7A7262", "halo-opacity": ".3", dot: "#3A372F",
    },
  },
};

const isoVars = (ink) => Object.entries(ink.iso).map(([key, value]) => `--anatomy-${key}:${value}`).join(";");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// A text run. Family/weight go in data-f so the embedder can subset per face.
// Typographic punctuation for prose (better-typography): curly quotes and
// apostrophes. Mono runs are code-like and keep straight quotes.
const smart = (t) => t.replace(/(^|[\s(])"/g, "$1\u201C").replace(/"/g, "\u201D").replace(/(^|[\s(])'/g, "$1\u2018").replace(/'/g, "\u2019");

function T(x, y, text, { f = "sans", w = 400, size = 16, fill = "ink", anchor, track, cls, extra = "" } = {}) {
  const family = f === "mono" ? "'AY Mono',ui-monospace,monospace" : "'AY Sans',system-ui,sans-serif";
  return `<text x="${x}" y="${y}" data-f="${f}-${w}" class="c-${fill}${cls ? " " + cls : ""}" font-family="${family}" font-weight="${w}" font-size="${size}"${anchor ? ` text-anchor="${anchor}"` : ""}${track ? ` letter-spacing="${track}"` : ""}${extra}>${esc(f === "sans" ? smart(text) : text)}</text>`;
}

function svgDoc({ width, height, ink, label, body, css = "", iso = false }) {
  const style = [
    "/*@fonts*/",
    `.c-ink{fill:${ink.ink}}.c-soft{fill:${ink.soft}}.c-muted{fill:${ink.muted}}.c-accent{fill:${ink.accent}}`,
    iso ? k.ISO_CSS.replace(/\.iso\[data-theme="light"\]\{[^}]*\}/, "") + `.iso{${isoVars(ink)}}.iso-face-text{font-family:'AY Mono',ui-monospace,monospace}` : "",
    css,
    "@media (prefers-reduced-motion:reduce){*{animation:none!important}}",
  ].join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${esc(label)}"${iso ? ' class="iso"' : ""}><title>${esc(label)}</title><style>${style}</style>` +
    `<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="14" fill="${ink.panel}" stroke="${ink.rule}"/>${body}</svg>`;
}

// ---------- the log machine (anatomy-style figure) ------------------------
// A topic as a bench instrument: three partition tracks of records, a
// producer hopper appending at the head, and a consumer gantry whose read
// heads sit over the newest record of every track. The dial reads lag 0.
function logMachine(W, H, { n = 26, azimuth = 62, callouts = false } = {}) {
  const N = n, STEP = 9.5, RW = 4.2, RD = 17, RH = 19, X0 = -150;
  const PLATE = { x: X0 - 26, y: -64, w: N * STEP + 80, d: 128, r: 9 };
  const TRACKS = [-32, 0, 32];
  const GX = X0 + (N - 1) * STEP + RW / 2; // over the newest record
  const TAB = (i, t) => (i * 7 + t * 3) % 5 === 0; // a few cards carry a raised tab
  const HOP = { x: GX + 16, y: -46, w: 20, d: 92, r: 3 };
  const P = k.fitProjection(
    [...k.boxCorners(PLATE, -16, 0), [GX, -56, 66], [GX, 56, 66], [HOP.x + HOP.w, 0, 40]],
    W, H, { pad: 10, azimuth },
  );
  const at = (p) => k.iso(p, P);
  const S = (paths, o) => k.solidSvg(paths, o);
  const L = (d, o) => k.lineSvg(d, o);
  const D = (pts, o) => k.dotsSvg(pts, o);
  const out = [];

  // base plate on feet, with groove, corner screws and an offset ruler
  out.push(`<path class="iso-halo" d="${k.haloOf(PLATE, -16, 12, P)}"/>`);
  for (const [x, y] of k.corners(PLATE, 20).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) {
    out.push(S(k.cylinder(x, y, 7, -16, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -14.4, 2.4, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -12, 12, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.55 }));
  const strip = { x: X0 - 4, y: PLATE.y + PLATE.d - 15, w: N * STEP + 4, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(X0 + RW / 2, X0 + RW / 2 + (N - 1) * STEP + 0.1, STEP / 2, 2, strip.y + 0.8, 0.6, [2, 3.8], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  // label plate with three rule lines (stands for engraved text)
  const plateL = { x: PLATE.x + 8, y: -58, w: 50, d: 16, r: 1.5 };
  out.push(S(k.slabOf(plateL, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(D(k.corners(plateL, 2).map(([x, y]) => at([x, y, 0.8])), { size: 0.4 }));
  out.push(k.faceTextSvg(k.topMatrix([plateL.x + 4, plateL.y + 10], 0.8, P, "x"), "topic: events", { size: 4.6, tone: "mid" }));

  // tracks: a shallow channel per partition with end stops
  for (const y of TRACKS) {
    const ch = { x: X0 - 6, y: y - RD / 2 - 3, w: N * STEP + 8, d: RD + 6, r: 2 };
    out.push(S(k.slabOf(ch, 0, 1.6, P, 4, 0.4), { tone: "mid" }));
    out.push(L(k.lineOnTop([ch.x + 3, y], [ch.x + ch.w - 3, y], 1.6, P), { tone: "faint" }));
    out.push(S(k.slabOf({ x: ch.x - 4, y: ch.y, w: 4, d: ch.d, r: 1 }, 0, 6, P, 3, 0.4), { tone: "mid" }));
  }

  // everything that stands on the plate, painted by depth
  const items = [];
  const push = (pt, svg) => items.push({ d: k.depthOf(pt, P), svg });
  TRACKS.forEach((y, t) => {
    for (let i = 0; i < N; i++) {
      const plan = { x: X0 + i * STEP, y: y - RD / 2, w: RW, d: RD, r: 0.8 };
      const newest = i === N - 1;
      const h = RH - ((i * 5 + t * 2) % 3);
      let svg = S(k.slabOf(plan, 1.6, h, P, 2, 0.3), { tone: newest ? "hi" : "mid", crease: "lo" });
      if (TAB(i, t)) svg += S(k.slabOf({ x: plan.x, y: y - RD / 2 + 2 + ((i + t) % 3) * 4, w: RW, d: 4, r: 0.6 }, 1.6 + h, 2.4, P, 2), { tone: "mid", crease: "none" });
      if (newest) {
        const [dx, dy] = k.axisVector(P, [16, 0, 0]);
        svg = `<g class="append" style="--dx:${dx.toFixed(1)}px;--dy:${dy.toFixed(1)}px;animation-delay:${t * 1.1}s">${svg}</g>`;
      }
      push([plan.x + RW / 2, y, 2], svg);
    }
  });
  // producer hopper: a block with three outlet slots and a knurled crank
  {
    let svg = S(k.slabOf(HOP, 0, 22, P, 4, 0.8), { tone: "mid" });
    svg += S(k.slabOf(k.insetPlan(HOP, 3), 22, 4, P, 4, 0.6), { tone: "mid" });
    svg += L(k.planOutline(k.insetPlan(HOP, 7), 26, P), { tone: "faint" });
    svg += D(k.corners(HOP, 4).map(([x, y]) => at([x, y, 26])), { size: 0.45 });
    const knob = [HOP.x + HOP.w / 2, HOP.y + HOP.d - 14];
    svg += S(k.cylinder(knob[0], knob[1], 5, 26, 5, P, 32), { tone: "mid" });
    svg += L(k.knurl(knob[0], knob[1], 5, 26, 31, 36, P), { tone: "lo" });
    svg += L(k.lineOnTop(knob, [knob[0] + 5, knob[1]], 31, P), { tone: "hi" });
    svg += k.faceTextSvg(k.topMatrix([HOP.x + 7, HOP.y + 10], 26, P, "y"), "producer", { size: 4.4, tone: "mid" });
    push([HOP.x, 0, 0], svg);
  }
  // consumer gantry: two posts, a crossbar, a read head per track, a dial
  const BAR = { x: GX - 5, y: -54, w: 10, d: 108, r: 2 };
  for (const y of [-50, 50]) {
    push([GX, y, 0], S(k.slabOf({ x: GX - 6, y: y - 6, w: 12, d: 12, r: 2 }, 0, 4, P, 3, 0.5), { tone: "mid" }) +
      S(k.cylinder(GX, y, 3, 4, 40, P, 24), { tone: "mid", crease: "none" }));
  }
  push([GX, 0, 40], S(k.slabOf(BAR, 44, 6, P, 4, 0.6), { tone: "mid" }) +
    D([-44, 44].map((y) => at([GX, y, 50])), { size: 0.45 }));
  TRACKS.forEach((y) => {
    push([GX, y, 30], S(k.cylinder(GX, y, 1.8, 24, 20, P, 20), { tone: "mid", crease: "none" }) +
      `<g class="head">${S(k.cylinder(GX, y, 3.2, 22, 3, P, 24), { tone: "hi", lit: true })}</g>`);
  });
  {
    const [x, y, z] = [GX, 0, 50];
    let svg = S(k.cylinder(x, y, 15, z, 6, P, 64, 0.8), { tone: "hi", crease: "lo" });
    svg += L(k.knurl(x, y, 15, z + 3.4, z + 6, 72, P, 0.3), { tone: "lo" });
    svg += L(k.ring(x, y, 13, z + 6, P, 64), { tone: "lo" });
    const r = k.radialTicks(x, y, 12.2, 40, 5, z + 6, [1.2, 2.6], P);
    svg += L(r.minor, { tone: "lo" }) + L(r.major, { tone: "mid" });
    svg += k.faceTextSvg(k.topMatrix([x - 3, y + 6.5], z + 6, P, "x"), "lag", { size: 3, tone: "mid", anchor: "middle" });
    svg += L(k.lineOnTop([x + 2, y], [x - 10, y], z + 6.2, P), { tone: "lit" });
    svg += L(k.ring(x, y, 1.4, z + 6.2, P, 12), { tone: "hi" });
    push([x, y, 60], svg);
  }
  items.sort((a, b) => a.d - b.d);
  out.push(...items.map((i) => i.svg));
  if (callouts) {
    // Three mono callouts say what the machine is: a leader from a dot on the
    // part up to a label in the clear band above the machine.
    const tag = ([x, y], dy, text, anchor = "start") => {
      const ty = 16; // one shared baseline in the band above the machine
      return `<line x1="${x.toFixed(1)}" y1="${(y - 3).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(ty + 6).toFixed(1)}" stroke="var(--anatomy-mid)" stroke-width="1"/>` +
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="var(--anatomy-lit)"/>` +
        T(x + (anchor === "end" ? 8 : -8), ty, text, { f: "mono", w: 500, size: 14, fill: "muted", anchor });
    };
    out.push(tag(at([X0 + 4 * STEP + RW / 2, TRACKS[0], 1.6 + RH]), 40, "append-only log"));
    out.push(tag(at([HOP.x + HOP.w / 2, HOP.y + 10, 34]), 40, "producer"));
    out.push(tag(at([GX, -8, 56]), 40, "consumer · lag 0", "end"));
  }
  return `<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" overflow="visible">${out.join("")}</svg>`;
}

const MACHINE_CSS =
  ".append{animation:append 3.3s cubic-bezier(.32,.72,0,1) infinite both}" +
  "@keyframes append{0%{transform:translate(var(--dx),var(--dy));opacity:0}18%{opacity:1}34%,100%{transform:none;opacity:1}}" +
  ".cursor{animation:blink 1.1s steps(1) infinite}@keyframes blink{50%{opacity:0}}";

// ---------- project plates ---------------------------------------------------
// One template for every project: no numbers, no ranking, order from config.
// Figures live in tools/figures/<slug>.mjs and export default (k, W, H) =>
// { svg, css }, drawn in a W x H box with the anatomy kit.
const FIG_W = 400, FIG_H = 330;
async function figureFor(slug) {
  // A project without its own figure yet gets the generic sealed case, so a
  // new plate never looks broken while its real figure is being drawn.
  const own = join(HERE, "figures", `${slug}.mjs`);
  const file = existsSync(own) ? own : join(HERE, "figures", "_placeholder.mjs");
  return (await import(pathToFileURL(file).href)).default;
}

// Greedy wrap for stat labels: at most two lines of ~max characters.
function wrap(text, max) {
  const lines = [""];
  for (const word of text.split(" ")) {
    const cur = lines[lines.length - 1];
    if (cur && (cur + " " + word).length > max && lines.length < 2) lines.push(word);
    else lines[lines.length - 1] = cur ? cur + " " + word : word;
  }
  return lines;
}

function plate(ink, project, fig) {
  const W = 880, H = 400;
  const { svg, css = "" } = fig(k, FIG_W, FIG_H);
  let y = 66;
  const body = [
    `<circle cx="53" cy="${y - 5}" r="4" fill="${ink.accent}"/>`,
    T(66, y, project.domain, { f: "mono", w: 500, size: 15, fill: "muted", track: 1.8 }),
  ];
  y += 52;
  project.title.forEach((line) => { body.push(T(46, y, line, { w: 700, size: 38, track: -1.2 })); y += 42; });
  y += 4;
  project.hook.forEach((line) => { body.push(T(48, y, line, { w: 500, size: 20, fill: "soft", track: -0.2 })); y += 27; });
  body.push(T(48, y + 8, project.stack, { f: "mono", w: 400, size: 13, fill: "muted" }));
  if (project.credit) body.push(T(48, y + 32, project.credit, { f: "mono", w: 500, size: 14, fill: "accent" }));
  body.push(`<line class="draw" x1="48" x2="440" y1="292" y2="292" stroke="${ink.rule}" pathLength="1"/>`);
  project.stats.forEach(([value, label], i) => {
    const x = 48 + i * (project.stats.length === 2 ? 196 : 130);
    body.push(T(x, 332, value, { w: 700, size: 34, track: -1 }));
    wrap(label, project.stats.length === 2 ? 26 : 16).forEach((line, j) => body.push(T(x, 356 + j * 18, line, { size: 14, fill: "muted" })));
  });
  body.push(`<g transform="translate(462 18)" style="color:${ink.muted}">${svg}</g>`);
  body.push(T(842, 374, project.object, { f: "mono", w: 400, size: 13, fill: "muted", anchor: "end" }));
  const label = `${project.title.join(" ")}. ${project.hook.join(" ")} ${project.stats.map(([v, l]) => `${v} ${l}`).join(", ")}.`;
  const plateCss = ".draw{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.2s .2s cubic-bezier(.32,.72,0,1) forwards}@keyframes draw{to{stroke-dashoffset:0}}@media (prefers-reduced-motion:reduce){.draw{stroke-dashoffset:0}}";
  return svgDoc({ width: W, height: H, ink, iso: true, css: plateCss + css, label, body: body.join("") });
}

// Two denser layouts, chosen by config.layout (or LAYOUT): "grid" is a
// two-up gallery card, "compact" a shorter full-width plate. Same rules as
// the plate: identical template for every project, order from config only.
function card(ink, project, fig) {
  const W = 440, H = 486;
  const { svg, css = "" } = fig(k, 400, 236);
  const body = [
    `<g transform="translate(20 12)" style="color:${ink.muted}">${svg}</g>`,
    `<circle cx="29" cy="${278 - 4.5}" r="3.5" fill="${ink.accent}"/>`,
    T(40, 278, project.domain, { f: "mono", w: 500, size: 13, fill: "muted", track: 1.6 }),
    T(23, 316, project.title.join(" "), { w: 700, size: 27, track: -0.8 }),
    ...project.hook.map((line, i) => T(24, 346 + i * 22, line, { w: 500, size: 16, fill: "soft" })),
    `<line class="draw" x1="24" x2="416" y1="398" y2="398" stroke="${ink.rule}" pathLength="1"/>`,
  ];
  project.stats.forEach(([value, label], i) => {
    const x = 24 + i * (project.stats.length === 2 ? 196 : 136);
    body.push(T(x, 434, value, { w: 700, size: 25, track: -0.6 }));
    wrap(label, project.stats.length === 2 ? 28 : 19).forEach((line, j) => body.push(T(x, 455 + j * 15, line, { size: 12.5, fill: "muted" })));
  });
  const plateCss = ".draw{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.2s .2s cubic-bezier(.32,.72,0,1) forwards}@keyframes draw{to{stroke-dashoffset:0}}@media (prefers-reduced-motion:reduce){.draw{stroke-dashoffset:0}}";
  const label = `${project.title.join(" ")}. ${project.hook.join(" ")} ${project.stats.map(([v, l]) => `${v} ${l}`).join(", ")}.`;
  return svgDoc({ width: W, height: H, ink, iso: true, css: plateCss + css, label, body: body.join("") });
}

function compactPlate(ink, project, fig) {
  const W = 880, H = 272;
  const { svg, css = "" } = fig(k, 380, 244);
  const body = [
    `<circle cx="53" cy="${54 - 5}" r="4" fill="${ink.accent}"/>`,
    T(66, 54, project.domain, { f: "mono", w: 500, size: 14, fill: "muted", track: 1.8 }),
    T(46, 98, project.title.join(" "), { w: 700, size: 30, track: -0.9 }),
    ...project.hook.map((line, i) => T(48, 130 + i * 24, line, { w: 500, size: 18, fill: "soft" })),
    `<line class="draw" x1="48" x2="440" y1="184" y2="184" stroke="${ink.rule}" pathLength="1"/>`,
    `<g transform="translate(476 14)" style="color:${ink.muted}">${svg}</g>`,
  ];
  project.stats.forEach(([value, label], i) => {
    const x = 48 + i * (project.stats.length === 2 ? 196 : 130);
    body.push(T(x, 220, value, { w: 700, size: 28, track: -0.8 }));
    wrap(label, project.stats.length === 2 ? 26 : 17).forEach((line, j) => body.push(T(x, 241 + j * 16, line, { size: 13, fill: "muted" })));
  });
  const plateCss = ".draw{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.2s .2s cubic-bezier(.32,.72,0,1) forwards}@keyframes draw{to{stroke-dashoffset:0}}@media (prefers-reduced-motion:reduce){.draw{stroke-dashoffset:0}}";
  const label = `${project.title.join(" ")}. ${project.hook.join(" ")} ${project.stats.map(([v, l]) => `${v} ${l}`).join(", ")}.`;
  return svgDoc({ width: W, height: H, ink, iso: true, css: plateCss + css, label, body: body.join("") });
}

// Two cards in one image: side by side for wide screens, stacked for phones.
// Each card is a full SVG document; their styles are joined under one
// /*@fonts*/ marker so the font embedder subsets once per file.
function pairSvg(cards, stacked) {
  const parts = cards.map((svg) => ({ style: svg.match(/<style>([\s\S]*?)<\/style>/)[1].replace("/*@fonts*/", ""), body: svg.slice(svg.indexOf("</style>") + 8, svg.lastIndexOf("</svg>")) }));
  // Concatenated whole: splitting rules apart would break nested @keyframes/@media blocks.
  const styles = [...new Set(parts.map((p) => p.style))].join("");
  const CW = 440, CH = 486, GAP = 14, S = (880 - GAP) / 2 / CW;
  const place = parts.map((p, i) => stacked
    ? `<g transform="translate(0 ${i * (CH + GAP)})">${p.body}</g>`
    : `<g transform="translate(${i * (CW * S + GAP)} 0) scale(${S.toFixed(4)})">${p.body}</g>`).join("");
  const [w, h] = stacked ? [CW, CH * cards.length + GAP * (cards.length - 1)] : [880, Math.ceil(CH * S)];
  const label = cards.map((svg) => svg.match(/aria-label="([^"]*)"/)[1]).join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}" class="iso"><title>${label}</title><style>/*@fonts*/${styles}</style>${place}</svg>`;
}

// ---------- heroes ---------------------------------------------------------
const id = config.identity;

function heroA(ink) {
  const W = 880, H = 570;
  const body = [
    T(48, 62, id.eyebrow, { f: "mono", w: 500, size: 16, fill: "muted", track: 2.4 }),
    T(44, 150, id.name, { w: 700, size: 92, track: -3.5 }),
    `<rect x="48" y="184" width="28" height="3" fill="${ink.accent}"/>`,
    ...id.hook.map((line, i) => T(48, 228 + i * 34, line, { w: 500, size: 28, track: -0.6 })),
    ...id.about.map((line, i) => T(600, 222 + i * 26, line, { size: 18, fill: "soft" })),
    `<g transform="translate(0 300)">${logMachine(880, 252, { n: 40, azimuth: 66, callouts: true })}</g>`,
  ];
  return svgDoc({ width: W, height: H, ink, iso: true, css: MACHINE_CSS, label: `${id.name}. ${id.hook.join(" ")} ${id.about.join(" ")}`, body: body.join("") });
}

// Phone version of the hero: same content restacked at 440 wide so the type
// stays readable when GitHub shrinks it to a ~360px column.
function heroPhone(ink) {
  const W = 440, H = 430;
  const body = [
    T(26, 44, id.eyebrow, { f: "mono", w: 500, size: 13, fill: "muted", track: 2 }),
    T(23, 104, id.name, { w: 700, size: 58, track: -2.2 }),
    `<rect x="26" y="126" width="24" height="3" fill="${ink.accent}"/>`,
    ...id.hook.map((line, i) => T(26, 164 + i * 28, line, { w: 500, size: 24, track: -0.5 })),
    T(26, 230, id.about.join(" ").replace("School of Technology and", "School of Technology and"), { size: 14.5, fill: "soft" }),
    `<g transform="translate(0 250)">${logMachine(440, 170, { n: 24, azimuth: 64 })}</g>`,
  ];
  return svgDoc({ width: W, height: H, ink, iso: true, css: MACHINE_CSS, label: `${id.name}. ${id.hook.join(" ")} ${id.about.join(" ")}`, body: body.join("") });
}

// ---------- idle loop -----------------------------------------------------------
// The personal bits: puzzles, films, facts, mentoring, a Wordle solve and the
// fact of the day (rotates daily through data/facts.json).
const WORDLE = { dark: { hit: "#538D4E", near: "#B59F3B", miss: "#3A3A3C" }, light: { hit: "#6AAA64", near: "#C9B458", miss: "#787C7E" } };
function wordleRows({ answer, guesses }) {
  return guesses.map((g) => {
    const res = Array(5).fill("miss"), pool = [...answer];
    [...g].forEach((ch, i) => { if (answer[i] === ch) { res[i] = "hit"; pool[pool.indexOf(ch)] = null; } });
    [...g].forEach((ch, i) => { if (res[i] !== "hit" && pool.includes(ch)) { res[i] = "near"; pool[pool.indexOf(ch)] = null; } });
    return [...g].map((ch, i) => [ch, res[i]]);
  });
}

function offKeyboard(ink, theme) {
  const W = 880, H = 352;
  const facts = JSON.parse(readFileSync(join(ROOT, "data", "facts.json"), "utf8"));
  const day = Math.floor(Date.parse(BUILT) / 864e5);
  const fact = facts[day % facts.length];
  const body = [
    T(46, 84, "Idle loop", { w: 700, size: 38, track: -1.2 }),
    ...config.personal.rows.map(([k, v], i) => T(48, 132 + i * 32, k, { f: "mono", w: 400, size: 14, fill: "muted" }) + T(140, 132 + i * 32, v, { size: 18, fill: "soft" })),
  ];
  const t = 34, gap = 5, wx = 832 - (5 * t + 4 * gap), wy = 52;
  wordleRows(config.personal.wordle).forEach((row, r) => row.forEach(([ch, res], i) => {
    const x = wx + i * (t + gap), y = wy + r * (t + gap);
    body.push(`<rect x="${x}" y="${y}" width="${t}" height="${t}" rx="3" fill="${WORDLE[theme][res]}"/>` +
      T(x + t / 2, y + 24, ch, { w: 700, size: 18, fill: "tile", anchor: "middle" }));
  }));
  body.push(T(832, wy + 3 * (t + gap) + 18, "Wordle 3/6", { f: "mono", w: 400, size: 13, fill: "muted", anchor: "end" }));
  body.push(`<line x1="48" x2="832" y1="262" y2="262" stroke="${ink.rule}"/>`);
  body.push(T(48, 296, "FACT OF THE DAY", { f: "mono", w: 500, size: 13, fill: "accent", track: 1.6 }));
  wrap2(fact, 62).forEach((line, i) => body.push(T(220, 296 + i * 24, line, { size: 18, fill: "ink" })));
  return svgDoc({ width: W, height: H, ink, css: ".c-tile{fill:#FFFFFF}", label: `Idle loop. ${config.personal.rows.map(([k, v]) => `${k} ${v}`).join("; ")}. Fact of the day: ${fact}`, body: body.join("") });
}

// Wrap to as many lines as needed at ~max characters.
function wrap2(text, max) {
  const lines = [""];
  for (const word of text.split(" ")) {
    const cur = lines[lines.length - 1];
    if (cur && (cur + " " + word).length > max) lines.push(word);
    else lines[lines.length - 1] = cur ? cur + " " + word : word;
  }
  return lines;
}

// ---------- link buttons ------------------------------------------------------
const BUTTONS = [["linkedin", "linkedin", id.links.linkedin], ["email", "email", id.links.email], ["repos", "repositories", `${id.links.github}?tab=repositories`]];
// Links as log-style tags: square corners, mono, an amber arrow leading.
function button(ink, label) {
  const w = Math.round(label.length * 9 + 58), h = 36;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title><style>/*@fonts*/.c-ink{fill:${ink.ink}}.c-accent{fill:${ink.accent}}</style>` +
    `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="5" fill="${ink.panel}" stroke="${ink.rule}"/>` +
    T(16, 23, "→", { f: "mono", w: 600, size: 15, fill: "accent" }) + T(38, 23, label, { f: "mono", w: 500, size: 15 }) + `</svg>`;
}

const figs = {};
for (const p of config.projects) figs[p.slug] = await figureFor(p.slug);
for (const theme of ["light", "dark"]) {
  if (LAYOUT === "grid") {
    for (let i = 0; i < config.projects.length; i += 2) {
      const cards = config.projects.slice(i, i + 2).map((p) => card(INKS[theme], p, figs[p.slug]));
      writeFileSync(join(OUT, `row-${i / 2 + 1}-${theme}.svg`), pairSvg(cards, false));
      writeFileSync(join(OUT, `row-${i / 2 + 1}-phone-${theme}.svg`), pairSvg(cards, true));
    }
  } else {
    const draw = { full: plate, compact: compactPlate }[LAYOUT];
    for (const p of config.projects) writeFileSync(join(OUT, `plate-${p.slug}-${theme}.svg`), draw(INKS[theme], p, figs[p.slug]));
  }
  writeFileSync(join(OUT, `hero-a-${theme}.svg`), heroA(INKS[theme]));
  writeFileSync(join(OUT, `hero-a-phone-${theme}.svg`), heroPhone(INKS[theme]));
  writeFileSync(join(OUT, `off-keyboard-${theme}.svg`), offKeyboard(INKS[theme], theme));
  for (const [slug, label] of BUTTONS) writeFileSync(join(OUT, `btn-${slug}-${theme}.svg`), button(INKS[theme], label));
}

// ---------- README -------------------------------------------------------------
const pic = (name, alt, href, width = "100%") => {
  const v = BUILT;
  const img = `<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/${name}-dark.svg?v=${v}"><img alt="${esc(alt)}" src="./assets/${name}-light.svg?v=${v}" width="${width}"></picture>`;
  return href ? `<a href="${href}">${img}</a>` : img;
};
const phonePic = (name, alt) => `<picture>` +
  `<source media="(prefers-color-scheme: dark) and (max-width: 640px)" srcset="./assets/${name}-phone-dark.svg?v=${BUILT}">` +
  `<source media="(max-width: 640px)" srcset="./assets/${name}-phone-light.svg?v=${BUILT}">` +
  `<source media="(prefers-color-scheme: dark)" srcset="./assets/${name}-dark.svg?v=${BUILT}">` +
  `<img alt="${esc(alt)}" src="./assets/${name}-light.svg?v=${BUILT}" width="100%"></picture>`;
const md = [phonePic("hero-a", `${id.name}. ${id.hook.join(" ")} ${id.about.join(" ")}`), "",
  `<p>${BUTTONS.map(([slug, label, href]) => `<a href="${href}"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/btn-${slug}-dark.svg?v=${BUILT}"><img alt="${label}" src="./assets/btn-${slug}-light.svg?v=${BUILT}" height="36"></picture></a>`).join("&nbsp;")}</p>`, ""];
const repoOf = (p) => (p.repo ? `https://github.com/${p.repo}` : undefined);
const repoLink = (p) => (p.repo ? `<a href="${repoOf(p)}">${p.repo.split("/")[1]} ↗</a>` : "");
const notes = (p) => [...p.details.map((d) => `- ${d}`), ...(p.live ? [`- [Live demo](${p.live})`] : [])];
// One collapsed line per group: the summary carries the repo links (the one
// thing the images can't), the body says how each project works.
const details = (group) => {
  const links = group.map(repoLink).filter(Boolean).join(" · ");
  const body = group.length === 1 ? notes(group[0]) : group.flatMap((p) => [`**${p.title.join(" ")}**`, "", ...notes(p), ""]);
  return [`<details><summary><b>How ${group.length === 1 ? "it works" : "these work"}</b>${links ? ` · ${links}` : ""}</summary>`, "", ...body, "", `</details>`];
};
if (LAYOUT === "grid") {
  // One image per pair of projects. <picture> picks the stacked version on
  // narrow screens and the side-by-side one otherwise, in either theme. The
  // How-it-works notes (with repo links) follow each row.
  for (let i = 0; i < config.projects.length; i += 2) {
    const row = config.projects.slice(i, i + 2), n = i / 2 + 1, v = BUILT;
    const alt = row.map((p) => `${p.title.join(" ")}: ${p.hook.join(" ")}`).join(" | ");
    md.push(`<picture>` +
      `<source media="(prefers-color-scheme: dark) and (max-width: 640px)" srcset="./assets/row-${n}-phone-dark.svg?v=${v}">` +
      `<source media="(max-width: 640px)" srcset="./assets/row-${n}-phone-light.svg?v=${v}">` +
      `<source media="(prefers-color-scheme: dark)" srcset="./assets/row-${n}-dark.svg?v=${v}">` +
      `<img alt="${esc(alt)}" src="./assets/row-${n}-light.svg?v=${v}" width="100%"></picture>`, "");
    md.push(...details(row), "");
    md.push("<br>", "");
  }
} else {
  for (const p of config.projects) {
    md.push(pic(`plate-${p.slug}`, `${p.title.join(" ")}: ${p.hook.join(" ")}`, repoOf(p)), "");
    md.push(...details([p]), "", LAYOUT === "full" ? "<br>" : "", "");
  }
}
md.push(pic("off-keyboard", "Idle loop: the puzzles I solve, films, random facts, and mentoring as a buddy / TA."), "");
md.push(`<sub>Every image here is drawn by <code>tools/build.mjs</code>. Figures are made with the <a href="https://github.com/wheresryan22/anatomy">anatomy</a> kit (MIT). Type: Schibsted Grotesk and JetBrains Mono, SIL Open Font License.</sub>`, "");
writeFileSync(join(OUT, "..", "README.md"), md.join("\n"));
console.log("built", OUT);
