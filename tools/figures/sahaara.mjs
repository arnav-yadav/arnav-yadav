// Sahaara as a quiet corner: two armchairs turned toward each other on a rug,
// a small table with two cups between them, and a floor lamp that is the one
// lit part. Someone to talk to, drawn as furniture. Only motion: a slow glow.
export default function figure(k, W, H) {
  const RUG = { x: -78, y: -56, w: 156, d: 112, r: 12 };
  const TABLE = [0, -6];
  const LAMP = [-6, -50];
  const P = k.fitProjection(
    [...k.boxCorners(RUG, -2, 0), [LAMP[0], LAMP[1], 92], [-60, 0, 40], [60, 0, 40]],
    W, H, { pad: 34, azimuth: 50 },
  );
  const at = (p) => k.iso(p, P);
  const S = (paths, o) => k.solidSvg(paths, o);
  const L = (d, o) => k.lineSvg(d, o);
  const D = (pts, o) => k.dotsSvg(pts, o);
  const depth = (p) => k.depthOf(p, P);
  const out = [];

  // rug: a thin mat with a woven border and fringe at both short ends
  out.push(`<path class="iso-halo" d="${k.haloOf(RUG, -2, 2, P)}"/>`);
  out.push(S(k.slabOf(RUG, -2, 2, P, 8, 0.4), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(RUG, 6), 0, P), { tone: "faint" }));
  out.push(L(k.planOutline(k.insetPlan(RUG, 9), 0, P), { tone: "faint" }));
  const fringe = [];
  for (let y = RUG.y + 8; y <= RUG.y + RUG.d - 8; y += 4) {
    fringe.push(k.lineOnTop([RUG.x, y], [RUG.x - 4, y], -1, P));
    fringe.push(k.lineOnTop([RUG.x + RUG.w, y], [RUG.x + RUG.w + 4, y], -1, P));
  }
  out.push(L(fringe.join(""), { tone: "lo", free: "end" }));

  // a soft pool of lamplight on the rug (the one slow loop)
  out.push(`<ellipse class="sahaara-glow" cx="${at([LAMP[0] + 8, LAMP[1] + 30, 0])[0].toFixed(1)}" cy="${at([LAMP[0] + 8, LAMP[1] + 30, 0])[1].toFixed(1)}" rx="70" ry="30" fill="var(--anatomy-lit)" style="filter:blur(14px)"/>`);

  const items = [];
  const push = (pt, svg) => items.push({ d: depth(pt), svg });

  // rotate a plan about a pivot; returns an extruded solid
  const turned = (plan, angle, [px, py], z, h, steps = 6) => {
    const c = Math.cos(angle), s = Math.sin(angle);
    const ring = k.ringOf(plan, steps).map(([x, y]) => [px + x * c - y * s, py + x * s + y * c]);
    return k.extrude(ring, z, h, P, { convex: true, bevel: 0.5 });
  };
  const place = (x, y, angle, [px, py]) => {
    const c = Math.cos(angle), s = Math.sin(angle);
    return [px + x * c - y * s, py + x * s + y * c];
  };

  // armchair in local space: seat front faces +x
  const chair = (pivot, angle) => {
    const parts = [];
    const part = (local, svg) => parts.push({ p: [...place(local[0], local[1], angle, pivot), local[2]], svg });
    for (const [lx, ly] of [[-14, -14], [14, -14], [-14, 14], [14, 14]]) {
      const [x, y] = place(lx, ly, angle, pivot);
      part([lx, ly, 2], S(k.cylinder(x, y, 1.7, 0, 7, P, 16), { tone: "mid", crease: "none" }));
    }
    part([0, 0, 8], S(turned({ x: -18, y: -18, w: 36, d: 36, r: 3 }, angle, pivot, 7, 8), { tone: "mid" }));
    part([2, 0, 17], S(turned({ x: -12, y: -12, w: 28, d: 24, r: 4 }, angle, pivot, 15, 4), { tone: "hi", crease: "lo" }));
    part([-15, 0, 26], S(turned({ x: -18, y: -18, w: 7, d: 36, r: 2.5 }, angle, pivot, 15, 24), { tone: "mid" }));
    part([-11, 0, 30], S(turned({ x: -11, y: -11, w: 4, d: 22, r: 2 }, angle, pivot, 19, 16), { tone: "hi", crease: "lo" }));
    for (const side of [-1, 1]) {
      part([0, side * 15, 21], S(turned({ x: -18, y: side > 0 ? 12 : -18, w: 36, d: 6, r: 2.5 }, angle, pivot, 15, 11), { tone: "mid" }));
    }
    parts.forEach(({ p, svg }) => push(p, svg));
  };
  const turn = (20 * Math.PI) / 180;
  chair([-46, 6], turn);
  chair([46, 6], Math.PI - turn);

  // side table with two cups on saucers
  {
    const [x, y] = TABLE;
    let svg = S(k.cylinder(x, y, 8, 0, 1.6, P, 32), { tone: "mid" });
    svg += S(k.cylinder(x, y, 1.8, 1.6, 22, P, 16), { tone: "mid", crease: "none" });
    svg += S(k.cylinder(x, y, 14, 23.6, 2.2, P, 48, 0.5), { tone: "hi", crease: "lo" });
    svg += L(k.ring(x, y, 11.6, 25.8, P, 48), { tone: "faint" });
    for (const [cx, cy] of [[x - 5, y - 2], [x + 5, y + 3]].sort((a, b) => depth([...a, 0]) - depth([...b, 0]))) {
      svg += S(k.cylinder(cx, cy, 3.6, 25.8, 0.7, P, 24), { tone: "mid" });
      svg += S(k.cylinder(cx, cy, 2.5, 26.5, 4, P, 24), { tone: "hi", crease: "lo" });
      svg += L(k.ring(cx, cy, 1.9, 30.5, P, 20), { tone: "lo" });
    }
    push([x, y, 12], svg);
  }

  // floor lamp: weighted base, pole, lit drum shade
  {
    const [x, y] = LAMP;
    let svg = S(k.cylinder(x, y, 9, 0, 2.4, P, 40, 0.5), { tone: "mid" });
    svg += L(k.ring(x, y, 6.4, 2.4, P, 32), { tone: "faint" });
    svg += S(k.cylinder(x, y, 1.3, 2.4, 70, P, 14), { tone: "mid", crease: "none" });
    svg += S(k.cylinder(x, y, 2.4, 40, 3, P, 16), { tone: "mid" });
    svg += S(k.cylinder(x, y, 12, 70, 15, P, 48, 0.4), { tone: "hi", lit: true });
    svg += L(k.sideArc(x, y, 12, 73, P, 32), { tone: "lit" });
    svg += L(k.ring(x, y, 2.4, 85, P, 16), { tone: "mid" });
    push([x, y, 0], svg);
  }

  items.sort((a, b) => a.d - b.d);
  out.push(...items.map((i) => i.svg));

  return {
    svg: `<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" overflow="visible">${out.join("")}</svg>`,
    css: ".sahaara-glow{opacity:.12;animation:sahaara-glow 3.6s ease-in-out infinite}@keyframes sahaara-glow{50%{opacity:.38}}",
  };
}
