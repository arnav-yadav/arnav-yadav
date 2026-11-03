// Argus: an instrument panel on the bench. A rack of five heartbeat lamps
// (the simulator's five services) pulses one after another; one lamp stays
// dark because its service went silent, which is how Argus decides it is down.
// Beside the rack, an error-budget dial: its needle (the lit part) eases down
// as the budget burns and back up as the window rolls on.
export default function figure(k, W, H) {
  const PLATE = { x: -110, y: -64, w: 220, d: 128, r: 9 };
  const RACK = { x: -96, y: -44, w: 124, d: 30, r: 3 };
  const RACK_H = 12;
  const LAMPS = [0, 1, 2, 3, 4].map((i) => [RACK.x + 14 + i * 24, RACK.y + RACK.d / 2]);
  const SILENT = 3; // the service that stopped sending heartbeats
  const DIAL = [62, 22], DIAL_R = 30, POST_H = 16, DIAL_H = 8;
  const DIAL_TOP = POST_H + 3 + DIAL_H;
  const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [DIAL[0], DIAL[1], DIAL_TOP + 4], [RACK.x, RACK.y, RACK_H + 10]], W, H, { pad: 22, azimuth: 48 });
  const at = (p) => k.iso(p, P);
  const S = (paths, o) => k.solidSvg(paths, o);
  const L = (d, o) => k.lineSvg(d, o);
  const D = (pts, o) => k.dotsSvg(pts, o);
  const out = [];

  // base plate on feet, groove, screws, ruler, label plate
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
  const strip = { x: PLATE.x + 14, y: PLATE.y + PLATE.d - 13, w: 120, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 3, strip.x + strip.w - 3, 4, 5, strip.y + 0.8, 0.6, [1.8, 3.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  const label = { x: PLATE.x + 14, y: 6, w: 46, d: 16, r: 1.5 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(D(k.corners(label, 2).map(([x, y]) => at([x, y, 0.8])), { size: 0.4 }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 4, label.y + 10], 0.8, P, "x"), "slo 99.9%", { size: 4.4, tone: "mid" }));

  // lamp rack: a bevelled body with a groove, one housing and dome per service
  out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan(RACK, 2), 0, 0.1, P)}" style="filter:blur(4px)"/>`);
  out.push(S(k.slabOf(RACK, 0, RACK_H, P, 4, 0.8), { tone: "mid" }));
  out.push(L(k.lineOnTop([RACK.x + 4, RACK.y + RACK.d - 4], [RACK.x + RACK.w - 4, RACK.y + RACK.d - 4], RACK_H, P), { tone: "faint" }));
  out.push(D([RACK.x + 4, RACK.x + RACK.w - 4].map((x) => at([x, RACK.y + 4, RACK_H])), { size: 0.45 }));
  const pulse = [];
  LAMPS.forEach(([x, y], i) => {
    out.push(S(k.cylinder(x, y, 8.5, RACK_H, 3, P, 32, 0.4), { tone: "mid" }));
    out.push(L(k.ring(x, y, 7, RACK_H + 3, P, 32), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.6, RACK_H + 3, 3, P, 28), { tone: i === SILENT ? "lo" : "hi", crease: "none" }));
    // the silent lamp is dark: a shaded cap and no glow
    if (i === SILENT) out.push(`<path d="${k.ring(x, y, 5.6, RACK_H + 6, P, 28)}" fill="var(--anatomy-mid)" opacity=".7"/>`);
    // a heartbeat: the dome's top glows in turn; the silent service never does
    if (i !== SILENT)
      pulse.push(`<path class="argus-beat" d="${k.ring(x, y, 5.6, RACK_H + 6, P, 28)}" fill="var(--anatomy-lit)" style="animation-delay:${(i * 0.4).toFixed(1)}s"/>`);
  });
  out.push(...pulse);
  // a cable from the rack to the dial, ending on a terminal at each end
  out.push(k.wireSvg(at([RACK.x + RACK.w, RACK.y + 18, 4]), at([DIAL[0] - 14, DIAL[1] - 20, 2]), { via: [at([RACK.x + RACK.w + 14, RACK.y + 18, 1]), at([DIAL[0] - 14, RACK.y + 18, 1])], tone: "lo", size: 1.1 }));

  // error-budget dial on a pedestal
  const [cx, cy] = DIAL;
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: cx - 20, y: cy - 20, w: 40, d: 40, r: 20 }, 0, 0.1, P)}" style="filter:blur(5px)"/>`);
  out.push(S(k.cylinder(cx, cy, 18, 0, 3, P, 48, 0.5), { tone: "mid" }));
  out.push(S(k.cylinder(cx, cy, 4.5, 3, POST_H, P, 24), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(cx, cy, 8, POST_H + 3 - 2, 2, P, 28), { tone: "mid" }));
  out.push(S(k.cylinder(cx, cy, DIAL_R, POST_H + 3, DIAL_H, P, 72, 0.8), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(cx, cy, DIAL_R, DIAL_TOP - 3.4, DIAL_TOP, 90, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(cx, cy, DIAL_R - 2.6, DIAL_TOP, P, 72), { tone: "lo" }));
  // the scale spans 270°, from full budget to empty
  const FROM = Math.PI * 0.75, SPAN = Math.PI * 1.5;
  const r = k.radialTicks(cx, cy, DIAL_R - 4, 30, 5, DIAL_TOP, [1.6, 3.4], P, FROM, SPAN);
  out.push(L(r.minor, { tone: "lo" }), L(r.major, { tone: "mid" }));
  // the last fifth of the scale (budget nearly gone) is marked with a red-zone arc
  const zone = [];
  for (let i = 0; i <= 16; i++) {
    const a = FROM + SPAN * (0.8 + 0.2 * (i / 16));
    zone.push([cx + Math.cos(a) * (DIAL_R - 8.5), cy + Math.sin(a) * (DIAL_R - 8.5)]);
  }
  out.push(L(k.onTop(zone, DIAL_TOP, P), { tone: "hi" }));
  out.push(k.faceTextSvg(k.topMatrix([cx, cy + 12], DIAL_TOP, P, "x"), "budget", { size: 3.6, tone: "lo", anchor: "middle" }));
  // needle: share of the budget used, eased down and back with SMIL
  const needle = (used) => {
    const a = FROM + SPAN * used;
    return k.lineOnTop([cx - Math.cos(a) * 5, cy - Math.sin(a) * 5], [cx + Math.cos(a) * (DIAL_R - 7), cy + Math.sin(a) * (DIAL_R - 7)], DIAL_TOP + 0.2, P);
  };
  const REST = 0.42;
  const values = [REST, 0.68, 0.68, REST, REST].map(needle).join(";");
  out.push(`<path class="iso-line" data-tone="lit" style="stroke-width:1.6" d="${needle(REST)}"><animate attributeName="d" values="${values}" keyTimes="0;0.4;0.55;0.9;1" calcMode="spline" keySplines="0.45 0 0.25 1;0 0 1 1;0.45 0 0.25 1;0 0 1 1" dur="5s" repeatCount="indefinite"/></path>`);
  out.push(S(k.cylinder(cx, cy, 2.4, DIAL_TOP, 1.2, P, 20), { tone: "hi", lit: true }));

  const css =
    ".argus-beat{opacity:0;animation:argus-beat 2s ease-out infinite}" +
    "@keyframes argus-beat{0%,100%{opacity:0}8%{opacity:.85}40%{opacity:0}}";
  return { svg: `<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" overflow="visible">${out.join("")}</svg>`, css };
}
