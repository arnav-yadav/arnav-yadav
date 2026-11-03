// Jailbreak Arena as a test rig: an attacker probe on a sliding carriage
// pushes toward a defender shield held on two coil springs. A dial between
// them reads the push. The probe tip is the one lit part.
import * as G from "../../../.agents/skills/anatomy/kit/lathe.mjs";

export default function figure(k, W, H) {
  const BASE = { x: -104, y: -44, w: 208, d: 88, r: 7 };
  const AX = 30; // height of the push axis
  const P = k.fitProjection(
    [...k.boxCorners(BASE, -15, 0), [-92, -30, 56], [-92, 30, 56], [56, 0, 40]],
    W, H, { pad: 22, azimuth: 52 },
  );
  const at = (p) => k.iso(p, P);
  const S = (paths, o) => k.solidSvg(paths, o);
  const L = (d, o) => k.lineSvg(d, o);
  const D = (pts, o) => k.dotsSvg(pts, o);
  const out = [];

  // base plate on feet, groove, corner screws, ruler and label plate
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
  const strip = { x: -96, y: BASE.y + BASE.d - 13, w: 120, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  const tag = { x: 46, y: BASE.y + BASE.d - 17, w: 46, d: 12, r: 1.5 };
  out.push(S(k.slabOf(tag, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(D(k.corners(tag, 2).map(([x, y]) => at([x, y, 0.8])), { size: 0.4 }));
  out.push(k.faceTextSvg(k.topMatrix([tag.x + 5, tag.y + 7.6], 0.8, P, "x"), "self-play", { size: 4.4, tone: "mid" }));

  // attacker rails with end stops
  for (const y of [-11, 8]) {
    out.push(S(k.slabOf({ x: -20, y, w: 106, d: 3.6, r: 1 }, 0, 3, P, 3, 0.4), { tone: "mid" }));
    out.push(D([-14, 80].map((x) => at([x, y + 1.8, 3])), { size: 0.4 }));
  }
  for (const x of [-25, 86]) out.push(S(k.slabOf({ x, y: -14, w: 5, d: 28, r: 1.2 }, 0, 7, P, 3, 0.5), { tone: "mid" }));

  const items = [];
  const put = (pt, svg) => items.push({ d: k.depthOf(pt, P), svg });

  // defender: back wall, two guide rods inside coil springs, the shield
  const WALL = { x: -96, y: -32, w: 10, d: 64, r: 2 };
  put([-91, 0, 20], S(k.slabOf(WALL, 0, 56, P, 4, 0.8), { tone: "mid" }) +
    L(k.planOutline(k.insetPlan(WALL, 2.4), 56, P), { tone: "faint" }) +
    D([-20, 20].map((y) => at([-91, y, 56])), { size: 0.45 }));
  for (const y of [-19, 19]) {
    const F = G.frameAlong([-86, y, AX], [1, 0, 0]);
    const spring = k.coil(-84, -56, [y, AX], 5.2, 7, "x", P, 18);
    put([-70, y, AX], L(spring.back, { tone: "lo" }) +
      S(G.disc(0, 34, 1.7, F, P), { tone: "mid", crease: "none" }) +
      L(spring.front, { tone: "hi" }) +
      S(G.disc(0, 2, 3.6, G.frameAlong([-86, y, AX], [1, 0, 0]), P), { tone: "mid" }));
  }
  const SHIELD = { x: -56, y: -30, w: 5, d: 60, r: 2 };
  put([-53, 0, 26], S(k.slabOf({ x: -60, y: -18, w: 13, d: 36, r: 2 }, 0, 6, P, 4, 0.6), { tone: "mid" }) +
    S(k.slabOf(SHIELD, 6, 48, P, 4, 0.8), { tone: "hi", crease: "lo" }) +
    S(G.disc(0, 1.6, 12, G.frameAlong([-51, 0, AX], [1, 0, 0]), P), { tone: "mid" }) +
    L(G.circleOf(G.frameAlong([-51, 0, AX], [1, 0, 0]), 1.6, 7.5, P, 48), { tone: "lo" }) +
    L(G.circleOf(G.frameAlong([-51, 0, AX], [1, 0, 0]), 1.6, 3, P, 32), { tone: "lo" }) +
    D([-24, 24].flatMap((y) => [at([-51, y, 12]), at([-51, y, 48])]), { size: 0.45 }));

  // dial gauge on a post, between the two
  {
    const [x, y] = [-30, 28];
    let svg = S(k.cylinder(x, y, 5.5, 0, 3, P, 28), { tone: "mid" });
    svg += S(k.cylinder(x, y, 2.2, 3, 20, P, 20), { tone: "mid", crease: "none" });
    svg += S(k.cylinder(x, y, 12, 23, 5, P, 64, 0.8), { tone: "hi", crease: "lo" });
    svg += L(k.knurl(x, y, 12, 25.4, 28, 60, P, 0.3), { tone: "lo" });
    svg += L(k.ring(x, y, 10.2, 28, P, 48), { tone: "lo" });
    const r = k.radialTicks(x, y, 9.6, 30, 5, 28, [1.1, 2.4], P);
    svg += L(r.minor, { tone: "lo" }) + L(r.major, { tone: "mid" });
    svg += L(k.lineOnTop([x - 1.5, y + 1.5], [x + 6, y - 5.5], 28.2, P), { tone: "hi" });
    svg += L(k.ring(x, y, 1.2, 28.2, P, 12), { tone: "hi" });
    put([x, y, 10], svg);
  }

  // attacker: carriage with a motor block, gland, probe rod and lit tip
  {
    const CAR = { x: 22, y: -16, w: 38, d: 32, r: 3 };
    let svg = `<path class="iso-halo" d="${k.haloOf(k.insetPlan(CAR, 3), 3, 0.1, P)}" style="filter:blur(4px)"/>`;
    svg += S(k.slabOf(CAR, 3, 7, P, 5, 0.6), { tone: "mid" });
    svg += D([28, 40, 54].map((x) => at([x, CAR.y + CAR.d - 2.6, 10])), { size: 0.4, tone: "lo" });
    const BOX = { x: 28, y: -12, w: 26, d: 24, r: 2.5 };
    svg += S(k.slabOf(BOX, 10, 30, P, 4, 0.8), { tone: "mid" });
    svg += L(k.planOutline(k.insetPlan(BOX, 3), 40, P), { tone: "faint" });
    svg += D(k.corners(BOX, 3).map(([x, y]) => at([x, y, 40])), { size: 0.45 });
    for (let i = 0; i < 4; i++) svg += L(k.lineOnTop([BOX.x + 6 + i * 4, BOX.y + 5], [BOX.x + 6 + i * 4, BOX.y + BOX.d - 5], 40, P), { tone: "faint" });
    const knob = G.frameAlong([54, 0, AX], [1, 0, 0]);
    svg += S(G.disc(0, 5, 6, knob, P), { tone: "mid" });
    svg += L(G.ribsOf(knob, 0.6, 4.4, 6, 30, P), { tone: "lo" });
    const F = G.frameAlong([28, 0, AX], [-1, 0, 0]);
    svg += S(G.disc(0, 3, 6.5, F, P, { bevel: 0.4 }), { tone: "mid" });
    svg += S(G.disc(3, 66, 2.2, F, P), { tone: "hi", crease: "none" });
    svg += S(G.disc(30, 33, 3.4, F, P), { tone: "mid" });
    svg += S(G.solidOf([[66, 3.2], [69, 3.2], [72, 1.2]], F, P, { steps: 48 }), { tone: "hi", lit: true });
    put([40, 0, 18], `<g class="jailbreak-arena-push">${svg}</g>`);
  }

  items.sort((a, b) => a.d - b.d);
  out.push(...items.map((i) => i.svg));
  const [dx, dy] = k.axisVector(P, [-4, 0, 0]);
  const css = `.jailbreak-arena-push{animation:jailbreak-arena-push 2.4s cubic-bezier(.32,.72,0,1) infinite}` +
    `@keyframes jailbreak-arena-push{0%,100%{transform:none}45%,60%{transform:translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px)}}`;
  return { svg: `<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" overflow="visible">${out.join("")}</svg>`, css };
}
