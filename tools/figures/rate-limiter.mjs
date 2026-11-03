// Pluggable rate limiter as a valve on a supply line: the call path is a
// pipe, the limiter is a valve whose bonnet takes a swappable cartridge (the
// strategy). One cartridge is seated; a spare with a different cut stands
// beside it. A counter dial on the valve face reads the window. The seated
// cartridge cap is the one lit part.
import * as G from "../../../.agents/skills/anatomy/kit/lathe.mjs";

export default function figure(k, W, H) {
  const BASE = { x: -104, y: -46, w: 208, d: 92, r: 7 };
  const PY = -12, PZ = 22, PR = 5.5; // pipe axis
  const SPARE = [62, 26];
  const P = k.fitProjection(
    [...k.boxCorners(BASE, -15, 0), [0, PY, 76], [SPARE[0], SPARE[1], 32]],
    W, H, { pad: 22, azimuth: 50 },
  );
  const at = (p) => k.iso(p, P);
  const S = (paths, o) => k.solidSvg(paths, o);
  const L = (d, o) => k.lineSvg(d, o);
  const D = (pts, o) => k.dotsSvg(pts, o);
  const X = (o) => G.frameAlong(o, [1, 0, 0]);
  const out = [];

  // base plate on feet, groove, screws, ruler, label plate
  out.push(`<path class="iso-halo" d="${k.haloOf(BASE, -15, 11, P)}"/>`);
  for (const [x, y] of k.corners(BASE, 18).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) {
    out.push(S(k.cylinder(x, y, 6.5, -15, 1.5, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5, -13.5, 2.5, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(BASE, -11, 11, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(BASE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(BASE, 9);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.1, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.55 }));
  const strip = { x: -96, y: BASE.y + BASE.d - 13, w: 118, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  const tag = { x: 26, y: BASE.y + BASE.d - 17, w: 22, d: 12, r: 1.5 };
  out.push(S(k.slabOf(tag, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(D(k.corners(tag, 2).map(([x, y]) => at([x, y, 0.8])), { size: 0.4 }));
  out.push(k.faceTextSvg(k.topMatrix([tag.x + 2.4, tag.y + 7.4], 0.8, P, "x"), "window", { size: 4, tone: "mid" }));

  const items = [];
  const put = (pt, svg) => items.push({ d: k.depthOf(pt, P), svg });

  // pipe stands: a block with a strap over the pipe
  for (const x of [-74, 70]) {
    put([x, PY, 8], S(k.slabOf({ x: x - 6, y: PY - 10, w: 12, d: 20, r: 1.5 }, 0, PZ - PR, P, 3, 0.5), { tone: "mid" }) +
      D([at([x, PY - 7, PZ - PR]), at([x, PY + 7, PZ - PR])], { size: 0.45 }));
  }
  // pipe runs with flanges into the valve
  const run = (x0, x1) => {
    const F = X([x0, PY, PZ]);
    let svg = S(G.disc(0, x1 - x0, PR, F, P), { tone: "mid", crease: "none" });
    for (const x of [-74, 70]) if (x > x0 && x < x1) svg += S(G.disc(x - x0 - 2.5, x - x0 + 2.5, PR + 0.9, F, P), { tone: "mid" });
    return svg;
  };
  const flange = (x) => S(G.disc(-2, 2, 10, X([x, PY, PZ]), P, { bevel: 0.4 }), { tone: "mid" }) +
    D(G.dotsOf(X([x, PY, PZ]), x < 0 ? -2 : 2, 7.6, 6, P, { all: true, phase: 0.5 }), { size: 0.5, tone: "mid" });
  put([-60, PY, PZ], run(-100, -24) + flange(-24));
  put([60, PY, PZ], flange(24) + run(24, 100));
  // open pipe ends
  put([-100, PY, PZ], L(G.circleOf(X([-100, PY, PZ]), 0, PR - 1.4, P, 32), { tone: "lo" }));

  // valve: a turned body on the pipe, a bonnet, a seated cartridge, a dial
  {
    const F = X([0, PY, PZ]);
    const bulge = [];
    for (let i = 0; i <= 12; i++) {
      const s = -22 + (44 * i) / 12;
      bulge.push([s, 9 + 7 * Math.sqrt(Math.max(0, 1 - (s / 22) ** 2)), 1]);
    }
    let svg = S(G.solidOf(bulge, F, P, { smooth: true }), { tone: "hi", crease: "lo" });
    const U = G.frameAlong([0, PY, PZ], [0, 0, 1]);
    svg += S(G.disc(12, 22, 10, U, P, { bevel: 0.5 }), { tone: "mid" });
    svg += S(G.disc(22, 26, 12, U, P, { bevel: 0.5 }), { tone: "mid" });
    svg += D(G.dotsOf(U, 26, 10, 6, P, { all: true, phase: 0.3 }), { size: 0.5, tone: "mid" });
    // seated cartridge: knurled body, two cut grooves, lit cap
    svg += S(G.disc(26, 46, 7.5, U, P), { tone: "hi", crease: "lo", inner: L(G.arcOf(U, 34, 7.5, P) + G.arcOf(U, 38, 7.5, P), { tone: "lo" }) });
    svg += L(G.ribsOf(U, 40, 45.4, 7.5, 40, P), { tone: "faint" });
    svg += S(G.solidOf([[46, 8.6], [50, 8.6], [51.4, 7, 1], [52, 4]], U, P, { steps: 64 }), { tone: "hi", lit: true });
    // counter dial on the valve face, looking toward the viewer
    const Y = G.frameAlong([0, PY + 15, PZ + 2], [0, 1, 0]);
    svg += S(G.disc(0, 4, 8.5, Y, P, { bevel: 0.4 }), { tone: "mid" });
    svg += L(G.circleOf(Y, 4, 7, P, 48), { tone: "lo" });
    svg += L(G.spokesOf(Y, 4, 5.4, 6.6, 20, P), { tone: "lo" });
    svg += L(G.spokesOf(Y, 4, 4.6, 6.6, 4, P), { tone: "mid" });
    svg += L(k.pathOf ? k.pathOf([at(G.pointOf(Y, 4, 0, 0)), at(G.pointOf(Y, 4, 5.6, 2.1))]) : "", { tone: "hi" });
    put([0, PY, PZ + 4], svg);
  }

  // spare cartridge on a holder, a different cut (four grooves)
  {
    const [x, y] = SPARE;
    const U = G.frameAlong([x, y, 0], [0, 0, 1]);
    let svg = S(k.cylinder(x, y, 11, 0, 2.5, P, 40, 0.4), { tone: "mid" });
    svg += L(k.ring(x, y, 8.4, 2.5, P, 40), { tone: "faint" });
    let part = S(G.disc(2.5, 24, 7.5, U, P), { tone: "hi", crease: "lo", inner: L([8, 11, 14, 17].map((s) => G.arcOf(U, s, 7.5, P)).join(""), { tone: "lo" }) });
    part += L(G.ribsOf(U, 18.6, 23.4, 7.5, 40, P), { tone: "faint" });
    part += S(G.solidOf([[24, 8.6], [28, 8.6], [29.4, 7, 1], [30, 4]], U, P, { steps: 64 }), { tone: "mid" });
    svg += `<g class="rate-limiter-lift">${part}</g>`;
    put([x, y, 6], svg);
  }

  items.sort((a, b) => a.d - b.d);
  out.push(...items.map((i) => i.svg));
  const [, dy] = k.axisVector(P, [0, 0, 4]);
  const css = `.rate-limiter-lift{animation:rate-limiter-lift 2.6s cubic-bezier(.32,.72,0,1) infinite}` +
    `@keyframes rate-limiter-lift{0%,100%{transform:none}40%,60%{transform:translateY(${dy.toFixed(2)}px)}}`;
  return { svg: `<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" overflow="visible">${out.join("")}</svg>`, css };
}
