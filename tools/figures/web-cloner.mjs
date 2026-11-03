// Website cloner agent: a parallel-motion pantograph. A tracer rides over the
// source page on the left; the same bar carries a pen over a blank sheet on the
// right, which is drawing the same layout. The pen tip is the lit part.
export default function figure(k, W, H) {
  const PLATE = { x: -128, y: -80, w: 256, d: 150, r: 9 };
  const PAGE_W = 82, PAGE_D = 70, SPAN = 128; // tracer to pen
  const SRC = { x: -110, y: -24, w: PAGE_W, d: PAGE_D, r: 3 };
  const DST = { x: SRC.x + SPAN, y: SRC.y, w: PAGE_W, d: PAGE_D, r: 3 };
  const PT = 4; // page top
  const PIVOTS = [[-46, -62], [30, -62]];
  const ARM_Z = 26, BAR_Z = 30;
  // the pen is finishing the last block of the copy; the tracer sits on the
  // same corner of the source, one span to the left
  const PEN = [DST.x + 76, DST.y + 52];
  const TRACE = [PEN[0] - SPAN, PEN[1]];
  // arms are parallel: both run from a pivot by the same vector
  const ARM = [TRACE[0] + 30 - PIVOTS[0][0], TRACE[1] - PIVOTS[0][1]];
  const armEnd = (p) => [p[0] + ARM[0], p[1] + ARM[1]];
  const P = k.fitProjection(
    [...k.boxCorners(PLATE, -16, 0), [PIVOTS[0][0], PIVOTS[0][1], BAR_Z + 12], [PEN[0] + 8, PEN[1], BAR_Z + 10]],
    W, H, { pad: 20, azimuth: 46 },
  );
  const at = (p) => k.iso(p, P);
  const S = (paths, o) => k.solidSvg(paths, o);
  const L = (d, o) => k.lineSvg(d, o);
  const D = (pts, o) => k.dotsSvg(pts, o);
  const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  const barOf = (a, b, w) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
    const nx = (-dy / len) * w / 2, ny = (dx / len) * w / 2, ex = (dx / len) * w / 2, ey = (dy / len) * w / 2;
    return [[a[0] - ex + nx, a[1] - ey + ny], [b[0] + ex + nx, b[1] + ey + ny], [b[0] + ex - nx, b[1] + ey - ny], [a[0] - ex - nx, a[1] - ey - ny]];
  };
  const out = [];

  // base plate on feet with groove, screws, ruler and label plate
  out.push(`<path class="iso-halo" d="${k.haloOf(PLATE, -16, 12, P)}"/>`);
  for (const [x, y] of byDepth(k.corners(PLATE, 20))) {
    out.push(S(k.cylinder(x, y, 7, -16, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -14.4, 2.4, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -12, 12, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.55 }));
  const strip = { x: SRC.x, y: PLATE.y + PLATE.d - 12, w: DST.x + DST.w - SRC.x, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [1.8, 3.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));

  // pivot posts at the back, each on a square foot
  for (const [x, y] of PIVOTS) {
    out.push(S(k.slabOf({ x: x - 7, y: y - 7, w: 14, d: 14, r: 2 }, 0, 4, P, 3, 0.5), { tone: "mid" }));
    out.push(D(k.corners({ x: x - 7, y: y - 7, w: 14, d: 14 }, 2.4).map(([px, py]) => at([px, py, 4])), { size: 0.4 }));
    out.push(S(k.cylinder(x, y, 3.4, 4, ARM_Z - 4, P, 24), { tone: "mid", crease: "none" }));
  }

  // two pages: the source with raised layout blocks, the copy being drawn
  const layout = (pg) => [
    { x: pg.x + 6, y: pg.y + 6, w: pg.w - 12, d: 8, r: 1 },
    { x: pg.x + 6, y: pg.y + 19, w: pg.w - 12, d: 18, r: 1 },
    { x: pg.x + 6, y: pg.y + 42, w: 20, d: 22, r: 1 },
    { x: pg.x + 31, y: pg.y + 42, w: 20, d: 22, r: 1 },
    { x: pg.x + 56, y: pg.y + 42, w: 20, d: 22, r: 1 },
  ];
  for (const pg of [SRC, DST]) {
    out.push(S(k.slabOf({ x: pg.x - 4, y: pg.y - 4, w: pg.w + 8, d: pg.d + 8, r: 4 }, 0, 1.6, P, 4, 0.4), { tone: "mid" }));
    out.push(S(k.slabOf(pg, 1.6, PT - 1.6, P, 4, 0.4), { tone: "hi", crease: "lo" }));
    out.push(D(k.corners({ x: pg.x - 4, y: pg.y - 4, w: pg.w + 8, d: pg.d + 8 }, 2).map(([x, y]) => at([x, y, 1.6])), { size: 0.4 }));
  }
  for (const b of layout(SRC)) out.push(S(k.slabOf(b, PT, 1.2, P, 3), { tone: "mid", crease: "none" }));
  const copy = layout(DST);
  copy.forEach((b, i) => {
    const drawn = i < 4;
    if (drawn) out.push(L(k.planOutline(b, PT, P, 3), { tone: "mid" }));
  });
  // The pen traces the block it is drawing; the tracer follows the same path
  // on the source, and the arms swing from their pivots. Arms are solids, so
  // their outlines morph with SMIL (which plays inside GitHub's <img>) on the
  // same clock as the moving bar and the line being drawn. The rest pose is
  // the pen at the end of the stroke, so a still frame is complete.
  const live = copy[4];
  const route = [[live.x, live.y + live.d], [live.x, live.y], [live.x + live.w, live.y], PEN];
  const scr = route.map((q) => at([q[0], q[1], PT]));
  const segs = scr.slice(1).map((q, i) => Math.hypot(q[0] - scr[i][0], q[1] - scr[i][1]));
  const total = segs.reduce((x, y) => x + y, 0);
  const done = [0];
  segs.forEach((len) => done.push(done[done.length - 1] + len / total));
  const keyTimes = [...done.map((f) => +(f * 0.7).toFixed(3)), 0.85, 1];
  const offsets = [...route.map((q) => [q[0] - PEN[0], q[1] - PEN[1]]), [0, 0], [route[0][0] - PEN[0], route[0][1] - PEN[1]]];
  const DUR = "4.2s";
  // every leg eased: strokes slow into each corner, the return glides home
  const splines = keyTimes.slice(1).map((_, i) => (i === keyTimes.length - 2 ? "0.6 0 0.2 1" : "0.4 0 0.3 1")).join(";");
  const timing = `keyTimes="${keyTimes.join(";")}" calcMode="spline" keySplines="${splines}" dur="${DUR}" repeatCount="indefinite"`;
  const anim = (attr, values) => `<animate attributeName="${attr}" values="${values.join(";")}" ${timing}/>`;
  const ink = [...done.map((f) => +(1 - f).toFixed(3)), 0, 0];
  const fade = [...done.map(() => 1), 1, 0]; // ink fades while the pen returns, rather than rewinding
  out.push(`<path class="iso-line web-cloner-live" data-tone="lit" pathLength="1" style="stroke-width:1.5" d="${k.onTop(route, PT, P)}">${anim("stroke-dashoffset", ink)}${anim("opacity", fade)}</path>`);

  // arms: one solid per keyframe, merged into one set of paths whose d morphs
  const ds = (svg) => [...svg.matchAll(/ d="([^"]*)"/g)].map((m) => m[1]);
  for (const p of PIVOTS) {
    const frames = offsets.map(([ox, oy]) => { const e = armEnd(p); return S(k.extrude(barOf(p, [e[0] + ox, e[1] + oy], 6), ARM_Z, 3, P), { tone: "mid" }); });
    const rest = S(k.extrude(barOf(p, armEnd(p), 6), ARM_Z, 3, P), { tone: "mid" });
    const per = frames.map(ds);
    const same = per.every((list) => list.length === per[0].length);
    let i = 0;
    out.push(same ? rest.replace(/<path([^>]*) d="([^"]*)"\/>/g, (m0, attrs, d) => { const at_ = i++; return `<path${attrs} d="${d}">${anim("d", per.map((list) => list[at_]))}</path>`; }) : rest);
    out.push(S(k.cylinder(p[0], p[1], 4.4, ARM_Z + 3, 2.4, P, 24), { tone: "mid" }));
    out.push(D([at([p[0], p[1], ARM_Z + 5.4])], { size: 0.6, tone: "hi" }));
  }
  // bar, tracer, knobs and pen move as one piece
  const move = [];
  const a = [TRACE[0] - 6, TRACE[1]], b = [PEN[0] + 6, PEN[1]];
  move.push(S(k.cylinder(TRACE[0], TRACE[1], 1.4, PT + 1.2, BAR_Z - PT - 1.2, P, 16), { tone: "hi", crease: "none" }));
  move.push(S(k.cylinder(TRACE[0], TRACE[1], 3.2, BAR_Z - 10, 6, P, 20), { tone: "mid" }));
  move.push(S(k.extrude(barOf(a, b, 7), BAR_Z, 3.4, P), { tone: "mid" }));
  move.push(L(k.lineOnTop([a[0] + 8, a[1]], [b[0] - 8, b[1]], BAR_Z + 3.4, P), { tone: "faint" }));
  for (const p of PIVOTS) {
    const e = armEnd(p);
    move.push(S(k.cylinder(e[0], e[1], 3, BAR_Z + 3.4, 2, P, 20), { tone: "mid" }));
  }
  move.push(S(k.cylinder(PEN[0], PEN[1], 1.3, PT, 3.6, P, 16), { tone: "hi", lit: true }));
  move.push(S(k.cylinder(PEN[0], PEN[1], 2.4, PT + 3.6, BAR_Z - PT - 3.6, P, 20), { tone: "hi", crease: "none" }));
  move.push(S(k.cylinder(PEN[0], PEN[1], 4, BAR_Z + 3.4, 7, P, 24), { tone: "mid" }));
  move.push(L(k.knurl(PEN[0], PEN[1], 4, BAR_Z + 4, BAR_Z + 10.4, 28, P), { tone: "lo" }));
  const shift = offsets.map(([ox, oy]) => k.axisVector(P, [ox, oy, 0]).map((v) => v.toFixed(2)).join(" "));
  out.push(`<g>${move.join("")}<animateTransform attributeName="transform" type="translate" values="${shift.join(";")}" ${timing}/></g>`);

  const css = ".web-cloner-live{stroke-dasharray:1}";
  return { svg: `<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" overflow="visible">${out.join("")}</svg>`, css };
}
