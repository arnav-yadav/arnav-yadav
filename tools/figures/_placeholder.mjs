// Generic figure for a project whose own figure isn't drawn yet: a sealed
// instrument case on the bench, lid latched, a small lit status lamp. Calm,
// complete, and clearly the same family as the other plates.
export default function figure(k, W, H) {
  const PLATE = { x: -96, y: -70, w: 192, d: 140, r: 9 };
  const CASE = { x: -58, y: -40, w: 116, d: 80, r: 6 };
  const CASE_H = 34, LID = 10;
  const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), ...k.boxCorners(CASE, 0, CASE_H + LID + 6)], W, H, { pad: 34, azimuth: 52 });
  const at = (p) => k.iso(p, P);
  const S = (paths, o) => k.solidSvg(paths, o);
  const L = (d, o) => k.lineSvg(d, o);
  const D = (pts, o) => k.dotsSvg(pts, o);
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(PLATE, -15, 11, P)}"/>`);
  for (const [x, y] of k.corners(PLATE, 18).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) {
    out.push(S(k.cylinder(x, y, 6.5, -15, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5, -13.4, 2.4, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -11, 11, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.1, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.55 }));
  // the case: body, lid with a seam, two latches, a handle, a label plate
  out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan(CASE, 2), 0, 0.1, P)}" style="filter:blur(5px)"/>`);
  out.push(S(k.slabOf(CASE, 0, CASE_H, P, 6, 1), { tone: "mid" }));
  out.push(S(k.slabOf(CASE, CASE_H, LID, P, 6, 1.2), { tone: "hi", crease: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(CASE, 6), CASE_H + LID, P), { tone: "faint" }));
  for (const y of [CASE.y + 18, CASE.y + CASE.d - 18]) {
    const latch = { x: CASE.x + CASE.w, y: y - 5, w: 2.4, d: 10, r: 0.8 };
    out.push(S(k.slabOf(latch, CASE_H - 7, 12, P, 2), { tone: "mid" }));
    out.push(D([at([latch.x + 2.4, y, CASE_H - 1])], { size: 0.5, tone: "hi" }));
  }
  const grip = { x: -16, y: -3, w: 32, d: 6, r: 3 };
  out.push(S(k.slabOf(grip, CASE_H + LID, 4, P, 4, 0.5), { tone: "mid" }));
  const label = { x: CASE.x + 10, y: CASE.y + CASE.d - 22, w: 36, d: 14, r: 1.2 };
  out.push(S(k.slabOf(label, CASE_H + LID, 0.6, P, 3), { tone: "lo", crease: "none" }));
  out.push(D(k.corners(label, 2).map(([x, y]) => at([x, y, CASE_H + LID + 0.6])), { size: 0.4 }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 4, label.y + 9], CASE_H + LID + 0.6, P, "x"), "in progress", { size: 4.2, tone: "mid" }));
  // status lamp: the one lit part
  out.push(S(k.cylinder(CASE.x + CASE.w - 14, CASE.y + 14, 4, CASE_H + LID, 2.4, P, 24), { tone: "hi", lit: true }));
  return { svg: `<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" overflow="visible">${out.join("")}</svg>`, css: "" };
}
