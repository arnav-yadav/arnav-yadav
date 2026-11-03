// RetrievAI as a sieve stack: four trays, each mesh finer than the one above
// (query translation, hybrid retrieval, rerank, judge). Grains thin out on the
// way down and the few that pass land in the lit dish. A stopwatch lies beside
// the stand, because every stage is timed.
export default function figure(k, W, H) {
  const PLATE = { x: -70, y: -62, w: 156, d: 124, r: 9 };
  const C = [-14, -8];
  const R = 27;
  const POST_R = 34;
  // painted bottom to top; the top tray is the coarsest and holds the most
  const TRAYS = [
    { z: 32, gap: 2.5, grains: 2 },
    { z: 58, gap: 3.4, grains: 4 },
    { z: 84, gap: 4.6, grains: 7 },
    { z: 110, gap: 6.2, grains: 12 },
  ];
  const TOP = 124;
  const WATCH = [50, 32];
  const P = k.fitProjection(
    [...k.boxCorners(PLATE, -14, 0), [C[0], C[1], TOP + 4], [C[0] - POST_R, C[1], TOP], [C[0] + POST_R, C[1], TOP]],
    W, H, { pad: 34, azimuth: 50 },
  );
  const at = (p) => k.iso(p, P);
  const S = (paths, o) => k.solidSvg(paths, o);
  const L = (d, o) => k.lineSvg(d, o);
  const D = (pts, o) => k.dotsSvg(pts, o);
  const depth = (p) => k.depthOf(p, P);
  const out = [];

  // seeded scatter inside a circle
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const scatter = (n, r) => Array.from({ length: n }, () => {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * r;
    return [C[0] + Math.cos(a) * d, C[1] + Math.sin(a) * d];
  });

  // base plate on feet, groove, corner screws
  out.push(`<path class="iso-halo" d="${k.haloOf(PLATE, -14, 10, P)}"/>`);
  for (const [x, y] of k.corners(PLATE, 16).sort((a, b) => depth([...a, 0]) - depth([...b, 0]))) {
    out.push(S(k.cylinder(x, y, 6, -14, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 4.6, -12.4, 2.4, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -10, 10, P, 8, 1.4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 9);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // a ruler strip along the front edge
  const strip = { x: PLATE.x + 14, y: PLATE.y + PLATE.d - 13, w: 70, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 3, strip.x + strip.w - 3, 4, 5, strip.y + 0.8, 0.6, [1.8, 3.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));

  // round foot plate for the stand
  out.push(S(k.cylinder(C[0], C[1], POST_R + 6, 0, 3, P, 64, 0.6), { tone: "mid" }));
  out.push(L(k.ring(C[0], C[1], POST_R + 2, 3, P, 64), { tone: "faint" }));

  // three posts: split into back and front so trays sit between them
  const posts = [90, 210, 330].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return [C[0] + Math.cos(a) * POST_R, C[1] + Math.sin(a) * POST_R];
  });
  const centre = depth([C[0], C[1], 0]);
  const back = posts.filter((p) => depth([...p, 0]) <= centre);
  const front = posts.filter((p) => depth([...p, 0]) > centre);
  const post = ([x, y]) =>
    S(k.cylinder(x, y, 3.4, 3, 2, P, 20), { tone: "mid" }) +
    S(k.cylinder(x, y, 1.9, 5, TOP - 5, P, 20), { tone: "mid", crease: "none" }) +
    S(k.cylinder(x, y, 2.8, TOP, 3, P, 20), { tone: "mid" });
  back.forEach((p) => out.push(post(p)));

  // the dish that collects what passes every tray
  out.push(S(k.cylinder(C[0], C[1], 18, 3, 5, P, 56, 0.6), { tone: "hi", lit: true }));
  out.push(L(k.ring(C[0], C[1], 15.6, 8, P, 56), { tone: "lit" }));
  out.push(D(scatter(1, 6).map(([x, y]) => at([x, y, 8])), { size: 1.3, tone: "hi" }));

  // mesh: chords across the tray floor in both directions, ending on the rim
  const mesh = (z, r, gap) => {
    const lines = [];
    for (let o = -r + gap / 2; o < r; o += gap) {
      const h = Math.sqrt(r * r - o * o);
      lines.push(k.lineOnTop([C[0] - h, C[1] + o], [C[0] + h, C[1] + o], z, P));
      lines.push(k.lineOnTop([C[0] + o, C[1] - h], [C[0] + o, C[1] + h], z, P));
    }
    return lines.join("");
  };

  TRAYS.forEach(({ z, gap, grains }) => {
    // brackets from each post to the tray rim
    posts.forEach(([x, y]) => {
      const mx = (x + C[0]) / 2 + (x - C[0]) * 0.18, my = (y + C[1]) / 2 + (y - C[1]) * 0.18;
      out.push(S(k.slabOf({ x: mx - 2.5, y: my - 2.5, w: 5, d: 5, r: 1 }, z - 1.5, 3, P, 2), { tone: "mid", crease: "none" }));
    });
    out.push(`<path class="iso-halo" d="${k.haloOf({ x: C[0] - R + 4, y: C[1] - R + 4, w: 2 * R - 8, d: 2 * R - 8, r: R - 4 }, z - 6, 0.1, P)}" style="filter:blur(5px);opacity:.35"/>`);
    out.push(S(k.cylinder(C[0], C[1], R, z, 5, P, 64, 0.6), { tone: "hi", crease: "lo" }));
    out.push(L(k.ring(C[0], C[1], R - 2.4, z + 5, P, 64), { tone: "lo" }));
    out.push(L(mesh(z + 5, R - 2.4, gap), { tone: "faint" }));
    out.push(D(scatter(grains, R - 7).map(([x, y]) => at([x, y, z + 5.4])), { size: 1.3, tone: "hi" }));
  });
  front.forEach((p) => out.push(post(p)));

  // stopwatch lying flat beside the stand
  {
    const [x, y] = WATCH, z = 0, r = 18;
    out.push(`<path class="iso-halo" d="${k.haloOf({ x: x - r, y: y - r, w: 2 * r, d: 2 * r, r }, z, 0.1, P)}" style="filter:blur(4px)"/>`);
    // crown and button at the -x side, drawn before the case (they sit behind it)
    out.push(S(k.slabOf({ x: x - r - 3, y: y - 1.6, w: 4, d: 3.2, r: 0.8 }, z + 2, 3, P, 2), { tone: "mid", crease: "none" }));
    out.push(S(k.cylinder(x - r - 5, y, 2.6, z + 1.6, 4, P, 20), { tone: "mid" }));
    out.push(L(k.knurl(x - r - 5, y, 2.6, z + 1.6, z + 5.6, 16, P), { tone: "lo" }));
    out.push(S(k.cylinder(x - 10, y - 11, 1.6, z + 2, 3.2, P, 16), { tone: "mid" }));
    out.push(S(k.cylinder(x, y, r, z, 6, P, 64, 0.8), { tone: "hi", crease: "lo" }));
    out.push(L(k.ring(x, y, r - 1.8, z + 6, P, 64), { tone: "lo" }));
    const rt = k.radialTicks(x, y, r - 2.6, 60, 5, z + 6, [1, 2.4], P);
    out.push(L(rt.minor, { tone: "faint" }), L(rt.major, { tone: "mid" }));
    // small sub-dial
    out.push(L(k.ring(x, y + 6, 3.6, z + 6, P, 28), { tone: "lo" }));
    out.push(L(k.lineOnTop([x, y + 6], [x + 2.4, y + 4], z + 6.1, P), { tone: "mid" }));
    // hand
    out.push(L(k.lineOnTop([x + 2, y + 1], [x - 9, y - 6.5], z + 6.2, P), { tone: "hi" }));
    out.push(L(k.ring(x, y, 1.2, z + 6.2, P, 12), { tone: "hi" }));
  }

  const drops = [];
  // two grains fall from the last tray into the dish, one after the other
  {
    const [dx, dy] = k.axisVector(P, [0, 0, -20]);
    [[-4, 3], [5, -2]].forEach(([ox, oy], i) => {
      const [gx, gy] = at([C[0] + ox, C[1] + oy, 29]);
      drops.push(`<circle class="retrievai-drop" cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="2.2" fill="var(--anatomy-lit)" style="--dx:${dx.toFixed(1)}px;--dy:${dy.toFixed(1)}px;animation-delay:${i * 0.9}s"/>`);
    });
  }
  out.push(...drops);
  return {
    svg: `<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" overflow="visible">${out.join("")}</svg>`,
    css: ".retrievai-drop{opacity:0;animation:retrievai-drop 1.8s cubic-bezier(.55,0,.8,.4) infinite}@keyframes retrievai-drop{0%{opacity:0;transform:none}12%{opacity:1}85%{opacity:1;transform:translate(var(--dx),var(--dy))}100%{opacity:0;transform:translate(var(--dx),var(--dy))}}",
  };
}
