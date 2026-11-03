// Website automation agent: a gantry plotter over a marked screen. Every
// element on the screen carries a numbered mark (set-of-marks grounding); the
// stylus is parked over one mark and taps it. The stylus tip is the lit part.
export default function figure(k, W, H) {
  const PLATE = { x: -112, y: -84, w: 224, d: 168, r: 9 };
  const SCREEN = { x: -76, y: -52, w: 136, d: 100, r: 5 };
  const ST = 7; // screen top
  const RAIL_Y = [-70, 64];
  const BX = 6; // bridge position along x
  const BRIDGE_Z = 50;
  const TARGET = [BX, 14]; // the mark the stylus is over
  const P = k.fitProjection(
    [...k.boxCorners(PLATE, -16, 0), [BX, RAIL_Y[0], BRIDGE_Z + 10], [BX, RAIL_Y[1], BRIDGE_Z + 10]],
    W, H, { pad: 22, azimuth: 50 },
  );
  const at = (p) => k.iso(p, P);
  const S = (paths, o) => k.solidSvg(paths, o);
  const L = (d, o) => k.lineSvg(d, o);
  const D = (pts, o) => k.dotsSvg(pts, o);
  const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  const out = [];

  // Motion: the stylus visits several marks in turn. The bridge rides the rails
  // (x), the carriage slides along the bridge (y), and the stylus drops to tap
  // (z). One SMIL timeline drives all three so they stay in step; every leg is
  // eased. The rest pose is the stylus down on TARGET, so a still frame reads.
  const UP = 9, MOVE = 0.75, DOWN = 0.18, HOLD = 0.14, LIFT = 0.22;
  const ease = "0.45 0 0.25 1";
  let STOPS = [TARGET];
  const frames = [];
  const taps = [];
  const timeline = () => {
    let t = 0;
    const mark = (x, y, z) => frames.push({ t, x: x - TARGET[0], y: y - TARGET[1], z });
    mark(...TARGET, 0);
    t += LIFT; mark(...TARGET, UP);
    [...STOPS.slice(1), TARGET].forEach((sp, i, all) => {
      t += MOVE; mark(...sp, UP);
      t += DOWN; mark(...sp, 0); taps.push({ at: sp, t });
      t += HOLD; mark(...sp, 0);
      if (i < all.length - 1) { t += LIFT; mark(...sp, UP); }
    });
    return t;
  };

  // base plate on feet: groove, corner screws, ruler strip, label plate
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
  const strip = { x: SCREEN.x, y: PLATE.y + PLATE.d - 13, w: SCREEN.w, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [1.8, 3.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));

  // rails along x carrying the bridge
  for (const y of RAIL_Y) {
    const rail = { x: -96, y: y - 3, w: 190, d: 6, r: 1.2 };
    out.push(S(k.slabOf(rail, 0, 4, P, 3, 0.4), { tone: "mid" }));
    out.push(D([rail.x + 5, rail.x + rail.w - 5].map((x) => at([x, y, 4])), { size: 0.45 }));
    for (const x of [rail.x - 4, rail.x + rail.w]) out.push(S(k.slabOf({ x, y: y - 5, w: 4, d: 10, r: 1 }, 0, 8, P, 3, 0.4), { tone: "mid" }));
  }
  // back post of the bridge stands behind the screen
  const post = (y) => S(k.slabOf({ x: BX - 7, y: y - 6, w: 14, d: 12, r: 2 }, 4, 5, P, 3, 0.5), { tone: "mid" }) +
    S(k.cylinder(BX, y, 3.2, 9, BRIDGE_Z - 9, P, 24), { tone: "mid", crease: "none" }) +
    L([22, 36].map((z) => k.sideArc(BX, y, 3.2, z, P, 14)).join(""), { tone: "faint" });
  const backPost = out.push("") - 1; // filled once the timeline exists

  // the screen: a tablet slab with a recessed display, a browser bar and
  // page elements, each carrying a small raised mark tile
  out.push(S(k.slabOf(SCREEN, 0, ST, P, 6, 0.8), { tone: "mid" }));
  const disp = k.insetPlan(SCREEN, 5);
  out.push(S(k.slabOf(disp, ST - 0.6, 0.6, P, 4), { tone: "lo", flat: true, crease: "none" }));
  out.push(L(k.planOutline(disp, ST, P, 4), { tone: "lo" }));
  const bar = { x: disp.x + 3, y: disp.y + 3, w: disp.w - 6, d: 9, r: 1.5 };
  out.push(L(k.planOutline(bar, ST, P, 3), { tone: "faint" }));
  out.push(D([0, 1, 2].map((i) => at([bar.x + 4 + i * 4, bar.y + 4.5, ST])), { size: 0.5, tone: "mid" }));
  const blocks = [
    { x: disp.x + 4, y: disp.y + 16, w: 52, d: 20, r: 1.5 },
    { x: disp.x + 62, y: disp.y + 16, w: 54, d: 20, r: 1.5 },
    { x: disp.x + 4, y: disp.y + 42, w: 34, d: 40, r: 1.5 },
    { x: disp.x + 44, y: disp.y + 42, w: 34, d: 40, r: 1.5 },
    { x: disp.x + 84, y: disp.y + 42, w: 32, d: 40, r: 1.5 },
  ];
  for (const b of blocks) {
    out.push(L(k.planOutline(b, ST, P, 3), { tone: "faint" }));
    for (let r = 0; r < Math.floor((b.d - 8) / 6); r++)
      out.push(L(k.lineOnTop([b.x + 9, b.y + 6 + r * 6], [b.x + b.w - 4 - (r % 2) * 8, b.y + 6 + r * 6], ST, P), { tone: "faint", free: true }));
  }
  // mark tiles: one per element, the targeted one raised in hi
  const marks = blocks.map((b) => [b.x + 3, b.y + 2]);
  const targetMark = [TARGET[0] - 3, TARGET[1] - 3];
  const markItems = [...marks, targetMark].map((m, i, all) => {
    const hit = i === all.length - 1;
    const plan = { x: m[0], y: m[1], w: hit ? 6 : 4.5, d: hit ? 6 : 4.5, r: 0.8 };
    return S(k.slabOf(plan, ST, hit ? 1.4 : 0.9, P, 2), { tone: hit ? "hi" : "mid", crease: "none" });
  });
  out.push(...markItems);
  // target ring the stylus rests in
  out.push(L(k.ring(TARGET[0], TARGET[1], 6, ST + 1.4, P, 32), { tone: "mid" }));
  STOPS = [TARGET, ...[0, 1, 4, 2].map((i) => [marks[i][0] + 2.25, marks[i][1] + 2.25])];
  const T = timeline();
  const kt = frames.map((f) => +(f.t / T).toFixed(4)).join(";");
  const splines = frames.slice(1).map(() => ease).join(";");
  const smil = (values) => `<animateTransform attributeName="transform" type="translate" values="${values.join(";")}" keyTimes="${kt}" calcMode="spline" keySplines="${splines}" dur="${T.toFixed(2)}s" repeatCount="indefinite"/>`;
  const v = (x, y, z) => k.axisVector(P, [x, y, z]).map((n) => n.toFixed(2)).join(" ");
  const alongX = smil(frames.map((f) => v(f.x, 0, 0)));
  const alongY = smil(frames.map((f) => v(0, f.y, 0)));
  const alongZ = smil(frames.map((f) => v(0, 0, f.z)));
  // a ripple spreads from each mark as the stylus lands on it
  for (const { at: [rx, ry], t } of taps) {
    const k0 = +(Math.max(0, t - 0.01) / T).toFixed(4), k1 = +(t / T).toFixed(4), k2 = +(Math.min(T, t + 0.5) / T).toFixed(4);
    const times = `0;${k0};${k1};${k2};1`;
    out.push(`<path class="iso-line" data-tone="lit" style="stroke-width:1.3" opacity="0" d="${k.ring(rx, ry, 3, ST + 1.4, P, 32)}">` +
      `<animate attributeName="opacity" values="0;0;1;0;0" keyTimes="${times}" dur="${T.toFixed(2)}s" repeatCount="indefinite"/>` +
      `<animate attributeName="d" values="${[3, 3, 3, 11, 11].map((r) => k.ring(rx, ry, r, ST + 1.4, P, 32)).join(";")}" keyTimes="${times}" dur="${T.toFixed(2)}s" repeatCount="indefinite"/></path>`);
  }

  // bridge, carriage and stylus
  const BAR = { x: BX - 5, y: RAIL_Y[0] - 4, w: 10, d: RAIL_Y[1] - RAIL_Y[0] + 8, r: 2 };
  const carriage = { x: BX - 8, y: TARGET[1] - 9, w: 16, d: 18, r: 2.5 };
  const stylus = [
    S(k.cylinder(TARGET[0], TARGET[1], 1.6, ST + 6, BRIDGE_Z - ST - 8, P, 18), { tone: "hi", crease: "none" }),
    S(k.cylinder(TARGET[0], TARGET[1], 2.6, ST + 14, 6, P, 20), { tone: "mid" }),
    S(k.cylinder(TARGET[0], TARGET[1], 1.2, ST + 2.2, 3.8, P, 16), { tone: "hi", lit: true }),
  ].join("");
  const bridge = [
    `<g><g>${stylus}${alongZ}</g>${alongY}</g>`,
    S(k.slabOf(BAR, BRIDGE_Z, 6, P, 4, 0.6), { tone: "mid" }),
    L(k.lineOnTop([BX, BAR.y + 6], [BX, BAR.y + BAR.d - 6], BRIDGE_Z + 6, P), { tone: "faint" }),
    D([BAR.y + 3, BAR.y + BAR.d - 3].map((y) => at([BX, y, BRIDGE_Z + 6])), { size: 0.45 }),
  ];
  const knob = [carriage.x + carriage.w / 2, carriage.y + carriage.d - 5];
  bridge.push(`<g>${S(k.slabOf(carriage, BRIDGE_Z - 6, 15, P, 4, 0.6), { tone: "mid" })}` +
    L(k.planOutline(k.insetPlan(carriage, 3), BRIDGE_Z + 9, P), { tone: "faint" }) +
    S(k.cylinder(knob[0], knob[1], 3.2, BRIDGE_Z + 9, 4, P, 24), { tone: "mid" }) +
    L(k.knurl(knob[0], knob[1], 3.2, BRIDGE_Z + 9, BRIDGE_Z + 13, 24, P), { tone: "lo" }) + `${alongY}</g>`);
  out.push(`<g>${bridge.join("")}${alongX}</g>`);
  out[backPost] = `<g>${post(RAIL_Y[0])}${alongX}</g>`;
  out.push(`<g>${post(RAIL_Y[1])}${alongX}</g>`);

  const css = "";
  return { svg: `<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" overflow="visible">${out.join("")}</svg>`, css };
}
