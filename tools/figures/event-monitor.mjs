// Event sorter: one infeed lane, a diverter drum that routes each record by
// its key (userId) into one of three partition lanes, and two consumer
// gantries: one reads two lanes, the other reads one (3 partitions, 2 consumers).
export default function figure(k, W, H) {
  const PLATE = { x: -134, y: -70, w: 268, d: 140, r: 9 };
  const LANES = [-34, 0, 34];
  const CW = 3.6, CD = 13, STEP = 8.2;
  const DRUM = [-34, 0], DRUM_R = 15;
  const OUT_X0 = -12, OUT_X1 = 122;
  const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [64, -50, 46], [100, 52, 46]], W, H, { pad: 22, azimuth: 46 });
  const at = (p) => k.iso(p, P);
  const S = (paths, o) => k.solidSvg(paths, o);
  const L = (d, o) => k.lineSvg(d, o);
  const D = (pts, o) => k.dotsSvg(pts, o);
  const out = [];

  // base
  out.push(`<path class="iso-halo" d="${k.haloOf(PLATE, -15, 12, P)}"/>`);
  for (const [x, y] of k.corners(PLATE, 18).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) {
    out.push(S(k.cylinder(x, y, 6.5, -15, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5, -13.4, 2.4, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -11, 11, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.1, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.55 }));
  const strip = { x: OUT_X0, y: PLATE.y + PLATE.d - 13, w: OUT_X1 - OUT_X0, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 3, strip.x + strip.w - 3, 4, 5, strip.y + 0.8, 0.6, [1.8, 3.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  const label = { x: -124, y: 34, w: 44, d: 18, r: 1.5 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(D(k.corners(label, 2).map(([x, y]) => at([x, y, 0.8])), { size: 0.4 }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 4, label.y + 11], 0.8, P, "x"), "key: userId", { size: 4.2, tone: "mid" }));

  // channels: one infeed, three partitions
  const channel = (x0, x1, y) => {
    const ch = { x: x0, y: y - CD / 2 - 3, w: x1 - x0, d: CD + 6, r: 2 };
    return S(k.slabOf(ch, 0, 1.6, P, 4, 0.4), { tone: "mid" }) + L(k.lineOnTop([x0 + 3, y], [x1 - 3, y], 1.6, P), { tone: "faint" });
  };
  out.push(channel(-124, DRUM[0] - DRUM_R + 2, 0));
  for (const y of LANES) {
    out.push(channel(OUT_X0, OUT_X1, y));
    out.push(S(k.slabOf({ x: OUT_X1, y: y - CD / 2 - 3, w: 4, d: CD + 6, r: 1 }, 0, 6, P, 3, 0.4), { tone: "mid" }));
  }

  const items = [];
  const push = (pt, svg) => items.push({ d: k.depthOf(pt, P), svg });
  const card = (x, y, h, tab, tone = "mid", delay = null) => {
    const plan = { x, y: y - CD / 2, w: CW, d: CD, r: 0.7 };
    let svg = S(k.slabOf(plan, 1.6, h, P, 2, 0.3), { tone, crease: "lo" });
    if (tab !== null) svg += S(k.slabOf({ x, y: y - CD / 2 + 1.5 + tab * 3.6, w: CW, d: 3.4, r: 0.5 }, 1.6 + h, 2.2, P, 2), { tone: "mid", crease: "none" });
    if (delay !== null) {
      const [dx, dy] = k.axisVector(P, [-14, 0, 0]);
      svg = `<g class="event-monitor-in" style="--dx:${dx.toFixed(1)}px;--dy:${dy.toFixed(1)}px;animation-delay:${delay}s">${svg}</g>`;
    }
    push([x + CW / 2, y, 2], svg);
  };
  // infeed: mixed keys (tab position = key)
  for (let i = 0; i < 9; i++) card(-120 + i * STEP, 0, 15 - (i % 3), (i * 2) % 3);
  // partitions: each lane holds one key only, so tabs line up per lane
  LANES.forEach((y, lane) => {
    const n = [12, 10, 13][lane];
    for (let i = 0; i < n; i++) card(OUT_X0 + 5 + i * STEP, y, 15 - ((i + lane) % 3), lane, "mid", i === n - 1 ? lane * 0.9 : null);
  });

  // diverter drum: the hash that picks a lane (lit)
  {
    const [x, y] = DRUM;
    let svg = S(k.cylinder(x, y, DRUM_R + 3, 0, 3, P, 48, 0.4), { tone: "mid" });
    svg += S(k.cylinder(x, y, DRUM_R, 3, 12, P, 48, 0.6), { tone: "hi", lit: true });
    svg += L(k.ring(x, y, DRUM_R - 3, 15, P, 48), { tone: "lo" });
    const r = k.radialTicks(x, y, DRUM_R - 1.2, 3, 1, 15, [2.2, 2.2], P, -Math.PI / 4, Math.PI / 2);
    svg += L(r.major, { tone: "mid" });
    svg += L(k.lineOnTop([x, y], [x + DRUM_R - 4, y + 7], 15.2, P), { tone: "lit" });
    svg += L(k.ring(x, y, 2, 15.2, P, 16), { tone: "hi" });
    push([x, y, 6], svg);
  }

  // consumer gantries: A spans the back two lanes, B the front lane
  const gantry = (gx, y0, y1, lanes) => {
    for (const y of [y0, y1]) {
      push([gx, y, 0], S(k.slabOf({ x: gx - 5, y: y - 5, w: 10, d: 10, r: 2 }, 0, 3.5, P, 3, 0.5), { tone: "mid" }) +
        S(k.cylinder(gx, y, 2.6, 3.5, 34, P, 24), { tone: "mid", crease: "none" }));
    }
    const bar = { x: gx - 4.5, y: y0 - 4, w: 9, d: y1 - y0 + 8, r: 2 };
    push([gx, (y0 + y1) / 2, 40], S(k.slabOf(bar, 37.5, 5, P, 4, 0.5), { tone: "mid" }) +
      D([y0, y1].map((y) => at([gx, y, 42.5])), { size: 0.45 }));
    for (const y of lanes) {
      push([gx, y, 30], S(k.cylinder(gx, y, 1.6, 22, 15.5, P, 16), { tone: "mid", crease: "none" }) +
        S(k.cylinder(gx, y, 3, 19.5, 2.6, P, 24), { tone: "hi" }));
    }
  };
  gantry(64, -50, 15, [LANES[0], LANES[1]]);
  gantry(100, 19, 50, [LANES[2]]);

  items.sort((a, b) => a.d - b.d);
  out.push(...items.map((i) => i.svg));
  return { svg: `<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" overflow="visible">${out.join("")}</svg>`, css: ".event-monitor-in{animation:event-monitor-in 2.9s cubic-bezier(.32,.72,0,1) infinite both}@keyframes event-monitor-in{0%{transform:translate(var(--dx),var(--dy));opacity:0}20%{opacity:1}40%,100%{transform:none;opacity:1}}" };
}
