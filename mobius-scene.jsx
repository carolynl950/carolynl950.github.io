/* Möbius intro — computed parametric geometry, projected to SVG line work.
   Everything renders from the authored clock T, so seeks and video export
   are deterministic. Token values mirror Nocturne's styles.css. */

const W = 1920, H = 1080, CX = W / 2, CY = H / 2;
const TOK = {
  bg: '#161826', text: '#e9e9ed', accent: '#9184d9',
  a300: '#d2cefd', a500: '#968ae0', a800: '#423a6a',
  n300: '#cfd3e5', n600: '#75798c', n800: '#3f424d'
};
const hexLerp = (a, b, t) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * clamp(t, 0, 1)));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
};

/* ---------- vectors ---------- */
const V = {
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
};

/* ---------- the surface ----------
   k half-twists: k=1 is the Möbius band (one edge, one side),
   k=2 is an ordinary annulus, k=3 triple-twists.       */
const RAD = 1.38, HW = 0.46;
const MP = (u, v, k) => {
  const c = Math.cos(k * u / 2), r = RAD + v * c;
  return [r * Math.cos(u), r * Math.sin(u), v * Math.sin(k * u / 2)];
};
const dU = (u, v, k) => { const e = 1e-3; return V.mul(V.sub(MP(u + e, v, k), MP(u - e, v, k)), 1 / (2 * e)); };
const dV = (u, k) => { const c = Math.cos(k * u / 2); return [c * Math.cos(u), c * Math.sin(u), Math.sin(k * u / 2)]; };
const NRM = (u, v, k) => V.norm(V.cross(dU(u, v, k), dV(u, k)));
const TAU = Math.PI * 2;

/* ---------- camera ---------- */
function makeCam(eye, target, up, f) {
  const fwd = V.norm(V.sub(target, eye));
  let right = V.cross(fwd, up);
  if (Math.hypot(right[0], right[1], right[2]) < 1e-5) right = V.cross(fwd, [0, 0, 1]);
  right = V.norm(right);
  const upv = V.cross(right, fwd);
  return (p) => {
    const d = V.sub(p, eye);
    const z = V.dot(d, fwd);
    const s = f / Math.max(z, 0.06);
    return [CX + V.dot(d, right) * s, CY - V.dot(d, upv) * s, z];
  };
}
// the band's centreline lies in the XY plane, so world up is Z
const rotZ = (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];

/* ---------- three motion helpers, nothing else ---------- */
const MOTION = {
  glide: (kf, vals) => interpolate(kf, vals, Easing.easeInOutCubic),
  rush: (kf, vals) => interpolate(kf, vals, Easing.linear),
  pop: (o) => animate({ ...o, ease: Easing.easeOutBack })
};

const LIGHT = V.norm([-0.45, 0.75, 0.5]);

/* ================= geometry layer ================= */

function Surface({ project, k, ribs, shaded }) {
  const quads = [];
  const du = TAU / ribs;
  for (let i = 0; i < ribs; i++) {
    const u0 = i * du, u1 = (i + 1) * du;
    const pts = [MP(u0, -HW, k), MP(u0, HW, k), MP(u1, HW, k), MP(u1, -HW, k)].map(project);
    if (pts.some((p) => p[2] < 0.16 || !isFinite(p[0]))) continue;
    const n = NRM(u0 + du / 2, 0, k);
    // one-sided: light it by |n·L| so both faces read the same
    const shade = Math.abs(V.dot(n, LIGHT));
    const z = (pts[0][2] + pts[2][2]) / 2;
    const depth = clamp(2.1 / z, 0.22, 1);
    quads.push({ d: pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '), shade, z, depth, i });
  }
  quads.sort((a, b) => b.z - a.z);
  return (
    <g>
      {quads.map((q) => (
        <polygon
          key={q.i}
          points={q.d}
          fill={shaded ? TOK.a500 : 'none'}
          fillOpacity={shaded ? (0.03 + q.shade * 0.15) * q.depth : 0}
          stroke={TOK.a300}
          strokeOpacity={(0.07 + q.shade * 0.3) * q.depth}
          strokeWidth={1.1}
        />
      ))}
    </g>
  );
}

/* The boundary. For an odd number of half-twists it is ONE closed curve of
   length 2·2π — tracing it is the proof that the band has a single edge. */
function EdgeCurve({ project, k }) {
  const span = (k % 2 === 1) ? TAU * 2 : TAU;
  const N = 340;
  let d = '', pen = false, prev = null;
  for (let i = 0; i <= N; i++) {
    const u = (i / N) * span;
    const p = project(MP(u, HW, k));
    if (p[2] < 0.18 || !isFinite(p[0])) { pen = false; prev = null; continue; }
    if (prev && Math.hypot(p[0] - prev[0], p[1] - prev[1]) > 1400) pen = false;
    prev = p;
    d += (pen ? ' L ' : ' M ') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
    pen = true;
  }
  return (
    <g>
      <path d={d} fill="none" stroke={TOK.a300} strokeOpacity={0.55} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}

/* A ball rolls along the band. The camera rides behind it, so the whole
   piece stays in first person — no zoom out. */
const BALL_R = 0.082;
const FOCAL = 760;
const LEAD = 1.55; // how far ahead of the camera the ball rolls, in u
const ballAt = (T, total, k) => {
  const u = (T / total) * TAU * 2 + LEAD;
  const v = 0.2 * Math.sin((T / total) * TAU * 3);
  const n = NRM(u, v, k);
  return { u, v, p: V.add(MP(u, v, k), V.mul(n, BALL_R)), n };
};
const ballPointFromUV = (u, v, k) => V.add(MP(u, v, k), V.mul(NRM(u, v, k), BALL_R));

function Ball({ project, point, surfacePoint, trailPts, opacity = 1, scaleMul = 1, stretchAngle = 0, stretchAmt = 0, hot = 0 }) {
  const p = project(point);
  if (p[2] < 0.12 || opacity <= 0.01) return null;
  const r = Math.max(3, (BALL_R * FOCAL) / p[2]) * scaleMul;
  const rx = r * (1 + stretchAmt), ry = r * (1 - stretchAmt * 0.55);
  const c = surfacePoint ? project(surfacePoint) : null;
  const trailColor = hexLerp(TOK.a300, TOK.accent, hot);
  const trail = (trailPts || []).map((tp, i) => {
    const s = project(tp);
    return s[2] > 0.12 ? { x: s[0], y: s[1], r: r * (1 - (i + 1) * 0.07), o: (0.24 + hot * 0.16) * (1 - (i + 1) / 9) } : null;
  }).filter(Boolean);
  return (
    <g opacity={opacity}>
      {trail.map((t, i) => <circle key={i} cx={t.x} cy={t.y} r={t.r} fill={trailColor} opacity={t.o} />)}
      {c && c[2] > 0.12 && <ellipse cx={c[0]} cy={c[1]} rx={r * 1.15} ry={r * 0.42} fill={TOK.bg} opacity={0.55} />}
      <g transform={`rotate(${stretchAngle.toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)})`}>
        <ellipse cx={p[0]} cy={p[1]} rx={r * 1.9} ry={r * 1.9} fill={TOK.accent} opacity={0.16} />
        <ellipse cx={p[0]} cy={p[1]} rx={rx} ry={ry} fill={TOK.n300} />
        <circle cx={p[0] - r * 0.3} cy={p[1] - r * 0.34} r={r * 0.52} fill={TOK.text} opacity={0.9} />
        <ellipse cx={p[0]} cy={p[1]} rx={rx} ry={ry} fill="none" stroke={TOK.a300} strokeOpacity={0.7} strokeWidth={1.2} />
      </g>
    </g>
  );
}

/* The cursor becomes a paw. Get it near the ball and it bats the ball's
   path sideways — a damped spring pulls the ball back onto its course the
   moment you back off, so the loop always recovers. */
const REPEL_R = 320, REPEL_FORCE = 10, SPRING_K = 13, SPRING_D = 5;
function CursorPaw({ x, y, active, punch }) {
  if (!active) return null;
  const scale = 0.92 + punch * 0.22;
  const rot = -10 - punch * 10;
  const clawLen = clamp((punch - 0.5) / 0.5, 0, 1) * 9;
  return (
    <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${scale.toFixed(3)})`} opacity={0.94}>
      <defs>
        <radialGradient id="pawFur" cx="38%" cy="28%" r="78%">
          <stop offset="0%" stopColor={TOK.n300} />
          <stop offset="55%" stopColor={TOK.text} />
          <stop offset="100%" stopColor={TOK.n600} />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="86" rx="80" ry="26" fill={TOK.bg} opacity={0.35} />
      <g transform="rotate(-18) translate(-15,-14)">
        <ellipse cx="0" cy="0" rx="17" ry="23" fill="url(#pawFur)" />
        <ellipse cx="1" cy="6" rx="7" ry="9" fill={TOK.n600} opacity={0.4} />
        {clawLen > 0.3 && <path d={`M -3 -22 L -3 ${-22 - clawLen}`} stroke={TOK.text} strokeWidth={1.3} strokeLinecap="round" opacity={clawLen / 9} />}
      </g>
      <g transform="rotate(-4) translate(6,-24)">
        <ellipse cx="0" cy="0" rx="18" ry="24" fill="url(#pawFur)" />
        <ellipse cx="1" cy="7" rx="7.5" ry="9.5" fill={TOK.n600} opacity={0.4} />
        {clawLen > 0.3 && <path d={`M -1 -23 L -1 ${-23 - clawLen}`} stroke={TOK.text} strokeWidth={1.3} strokeLinecap="round" opacity={clawLen / 9} />}
      </g>
      <g transform="rotate(12) translate(27,-20)">
        <ellipse cx="0" cy="0" rx="17" ry="23" fill="url(#pawFur)" />
        <ellipse cx="1" cy="6" rx="7" ry="9" fill={TOK.n600} opacity={0.4} />
        {clawLen > 0.3 && <path d={`M 1 -22 L 1 ${-22 - clawLen}`} stroke={TOK.text} strokeWidth={1.3} strokeLinecap="round" opacity={clawLen / 9} />}
      </g>
      <g transform="rotate(28) translate(44,-4)">
        <ellipse cx="0" cy="0" rx="15" ry="20" fill="url(#pawFur)" />
        <ellipse cx="1" cy="5" rx="6" ry="7.5" fill={TOK.n600} opacity={0.4} />
        {clawLen > 0.3 && <path d={`M 1 -19 L 1 ${-19 - clawLen}`} stroke={TOK.text} strokeWidth={1.2} strokeLinecap="round" opacity={clawLen / 9} />}
      </g>
      <ellipse cx="12" cy="26" rx="46" ry="42" fill="url(#pawFur)" />
      <ellipse cx="8" cy="34" rx="16" ry="13" fill={TOK.n600} opacity={0.35} />
    </g>
  );
}

/* The boundary brightens near the ball as it's pushed toward the edge —
   telegraphs the fall before it happens. */
function EdgeWarning({ project, k, u, side, intensity }) {
  if (intensity <= 0.02) return null;
  const N = 40, span = 1.0;
  let d = '', pen = false;
  for (let i = 0; i <= N; i++) {
    const uu = u - span / 2 + (i / N) * span;
    const p = project(MP(uu, side * HW, k));
    if (p[2] < 0.15 || !isFinite(p[0])) { pen = false; continue; }
    d += (pen ? ' L ' : ' M ') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
    pen = true;
  }
  return <path d={d} fill="none" stroke={TOK.accent} strokeOpacity={intensity * 0.85} strokeWidth={2.5 + intensity * 4} strokeLinecap="round" />;
}

/* A quick bright ring right where the paw actually connects — gives the
   hit a discrete beat instead of a continuous push. */
function ContactFlash({ x, y, t, active }) {
  if (!active) return null;
  const dur = 0.32;
  const p = clamp(t / dur, 0, 1);
  const r = 14 + p * 68;
  return <circle cx={x} cy={y} r={r} fill="none" stroke={TOK.text} strokeOpacity={(1 - p) * 0.85} strokeWidth={3 - p * 2} />;
}

/* ================= overlays ================= */

function Equations({ T, CUES, total, k, on }) {
  if (!on) return null;
  const base = interpolate([CUES.Rise - 0.5, CUES.Rise + 0.4, CUES.Home + 0.2, total - 0.15], [0, 1, 1, 0], Easing.easeInOutCubic)(T);
  const line = (i) => clamp((T - (CUES.Rise - 0.1) - i * 0.34) / 0.5, 0, 1);
  const rows = [
    ['x(u,v) = (R + v·cos(', 'ku/2', ')) cos u'],
    ['y(u,v) = (R + v·cos(', 'ku/2', ')) sin u'],
    ['z(u,v) = v·sin(', 'ku/2', ')']
  ];
  return (
    <div style={{
      position: 'absolute', left: 96, top: 300, opacity: base,
      fontFamily: '"Inter", system-ui, sans-serif', color: TOK.n300,
      fontSize: 30, lineHeight: 1.72, fontVariantNumeric: 'tabular-nums'
    }}>
      {rows.map((r, i) => (
        <div key={i} style={{ opacity: line(i), transform: `translateX(${(1 - line(i)) * -14}px)` }}>
          <span>{r[0]}</span>
          <span style={{ color: TOK.accent }}>{r[1].replace('k', k === 1 ? '' : k + '·')}</span>
          <span>{r[2]}</span>
        </div>
      ))}
      <div style={{
        marginTop: 26, fontSize: 21, letterSpacing: '0.26em', textTransform: 'uppercase',
        color: TOK.n600, opacity: line(3)
      }}>
        {k % 2 === 1 ? 'one edge · one side' : `${k} half-twists · two sides`}
      </div>
    </div>
  );
}

function Wordmark({ title, subtitle }) {
  return (
    <div style={{ position: 'absolute', left: 96, bottom: 88, color: TOK.text, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <div style={{ fontSize: 46, fontWeight: 500, letterSpacing: '-0.025em' }}>{title}</div>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 16, fontSize: 19, letterSpacing: '0.28em', textTransform: 'uppercase', color: TOK.n300 }}>
        <span style={{ width: 56, height: 1, background: TOK.accent }} />
        {subtitle}
      </div>
    </div>
  );
}

/* ================= the piece ================= */

function Piece({ t }) {
  const { T, CUES, authoredTotal } = useComposition();
  const total = authoredTotal || 8;
  const k = t.twists;

  // The ball leads; the camera rides the surface just behind it. Two circuits
  // of u (0 → 4π) is what it takes to come back the same way up, so the loop
  // closes exactly — that IS the one-sidedness. Camera aim stays on this
  // deterministic path even when the cursor bats the ball off it.
  const b = ballAt(T, total, k);
  const uCam = MOTION.rush([0, total], [0, TAU * 2])(T);
  const nCam = NRM(uCam, 0, k), tCam = V.norm(dU(uCam, 0, k));
  const bob = 0.022 * Math.sin(Math.PI * T) + 0.014 * Math.sin(Math.PI * T * 2.5);
  const lift = MOTION.glide([0, CUES.Rise, CUES.Flip, CUES.Home, total], [0.24, 0.32, 0.28, 0.24, 0.24])(T);
  const eye = V.add(MP(uCam, 0, k), V.mul(nCam, lift + bob));
  const tgt = V.lerp(b.p, V.add(MP(uCam, 0, k), V.mul(tCam, 2.6)), 0.3);
  const up = V.norm(V.add(nCam, V.mul(tCam, 0.05)));
  const project = makeCam(eye, tgt, up, FOCAL);

  const deflRef = React.useRef({ v: 0, vel: 0, lastT: null });
  const mouseRef = React.useRef({ x: 0, y: 0, active: false });
  const trailRef = React.useRef([]);
  const fallRef = React.useRef({ phase: 'normal', t: 0, origin: null, dir: null });
  const flashRef = React.useRef({ active: false, t: 0, x: 0, y: 0, prevPunch: 0 });

  // The interactive paw must keep painting even if the composition clock
  // isn't advancing (paused/idle) \u2014 drive our own render loop independent of it.
  const [, forceTick] = React.useState(0);
  React.useEffect(() => {
    let raf;
    const loop = () => { forceTick((x) => (x + 1) % 1e9); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const dfl = deflRef.current;
  const fall = fallRef.current;
  const now = performance.now();
  const dt = clamp(dfl.lastT == null ? 0 : (now - dfl.lastT) / 1000, 0, 0.05);
  dfl.lastT = now;

  const FALL_LIMIT = HW * 0.85, FALL_DUR = 0.7, POPIN_DUR = 0.35, GRAVITY = 2.4;
  let punch = 0, ballPoint, surfacePoint, opacity = 1, scaleMul = 1, stretchAngle = 0, stretchAmt = 0, hot = 0, edgeIntensity = 0, edgeSide = 1;

  if (fall.phase === 'normal') {
    let cur = null;
    if (t.interactivePaw && mouseRef.current.active) {
      const eps = 0.05;
      const curV = clamp(b.v + dfl.v, -HW * 0.95, HW * 0.95);
      cur = project(ballPointFromUV(b.u, curV, k));
      if (cur[2] > 0.1) {
        const dCur = Math.hypot(cur[0] - mouseRef.current.x, cur[1] - mouseRef.current.y);
        if (dCur < REPEL_R) {
          const s1 = project(ballPointFromUV(b.u, clamp(curV + eps, -HW * 0.95, HW * 0.95), k));
          const s2 = project(ballPointFromUV(b.u, clamp(curV - eps, -HW * 0.95, HW * 0.95), k));
          const d1 = Math.hypot(s1[0] - mouseRef.current.x, s1[1] - mouseRef.current.y);
          const d2 = Math.hypot(s2[0] - mouseRef.current.x, s2[1] - mouseRef.current.y);
          const dir = d1 > d2 ? 1 : -1;
          punch = 1 - dCur / REPEL_R;
          dfl.vel += dir * punch * REPEL_FORCE * dt;
        }
      }
    }
    const flash = flashRef.current;
    if (punch > 0.78 && flash.prevPunch <= 0.78 && cur) {
      flash.active = true; flash.t = 0; flash.x = cur[0]; flash.y = cur[1];
    }
    flash.prevPunch = punch;
    dfl.vel += (-SPRING_K * dfl.v - SPRING_D * dfl.vel) * dt;
    const tentative = dfl.v + dfl.vel * dt;
    if (Math.abs(tentative) > FALL_LIMIT) {
      fall.phase = 'falling'; fall.t = 0;
      fall.origin = ballPointFromUV(b.u, clamp(tentative, -HW * 0.95, HW * 0.95), k);
      fall.dir = NRM(b.u, tentative, k);
      dfl.v = 0; dfl.vel = 0;
    } else {
      dfl.v = tentative;
    }
    const vFinal = clamp(b.v + dfl.v, -HW * 0.95, HW * 0.95);
    ballPoint = ballPointFromUV(b.u, vFinal, k);
    surfacePoint = MP(b.u, vFinal, k);
    trailRef.current = [ballPoint, ...trailRef.current].slice(0, 9);

    const eps2 = 0.04;
    const sA = project(ballPointFromUV(b.u, clamp(vFinal + eps2, -HW * 0.95, HW * 0.95), k));
    const sB = project(ballPointFromUV(b.u, clamp(vFinal - eps2, -HW * 0.95, HW * 0.95), k));
    stretchAngle = Math.atan2(sA[1] - sB[1], sA[0] - sB[0]) * 180 / Math.PI;
    stretchAmt = clamp(Math.abs(dfl.vel) * 0.06, 0, 0.5);
    hot = clamp(Math.abs(dfl.v) / (HW * 0.7), 0, 1);
    edgeIntensity = clamp(Math.pow(Math.abs(dfl.v) / FALL_LIMIT, 2), 0, 1);
    edgeSide = dfl.v >= 0 ? 1 : -1;
  } else if (fall.phase === 'falling') {
    fall.t += dt;
    const ft = fall.t;
    ballPoint = V.add(V.add(fall.origin, V.mul(fall.dir, 0.5 * ft)), [0, 0, -0.5 * GRAVITY * ft * ft]);
    surfacePoint = null;
    opacity = clamp(1 - ft / FALL_DUR, 0, 1);
    scaleMul = clamp(1 - 0.5 * (ft / FALL_DUR), 0.4, 1);
    if (fall.t >= FALL_DUR) { fall.phase = 'popin'; fall.t = 0; }
  } else {
    fall.t += dt;
    const pt = clamp(fall.t / POPIN_DUR, 0, 1);
    ballPoint = ballPointFromUV(b.u, b.v, k);
    surfacePoint = MP(b.u, b.v, k);
    opacity = pt;
    scaleMul = 0.5 + 0.6 * Math.sin(pt * Math.PI * 0.6);
    trailRef.current = [];
    if (fall.t >= POPIN_DUR) fall.phase = 'normal';
  }

  if (flashRef.current.active) {
    flashRef.current.t += dt;
    if (flashRef.current.t > 0.32) flashRef.current.active = false;
  }

  const toLocal = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / rect.width * W, y: (e.clientY - rect.top) / rect.height * H };
  };

  return (
    <div
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: TOK.bg, cursor: t.interactivePaw ? 'none' : 'default' }}
      onMouseMove={(e) => { if (!t.interactivePaw) return; const p = toLocal(e); mouseRef.current.x = p.x; mouseRef.current.y = p.y; mouseRef.current.active = true; }}
      onMouseLeave={() => { mouseRef.current.active = false; }}
    >
      <div style={{
        position: 'absolute', left: '50%', top: '54%', width: 1700, height: 1400,
        transform: 'translate(-50%,-50%)', pointerEvents: 'none',
        background: `radial-gradient(closest-side, ${TOK.a800}, rgba(0,0,0,0) 70%)`, opacity: 0.45
      }} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Surface project={project} k={k} ribs={t.ribs} shaded={t.shaded} />
        <EdgeCurve project={project} k={k} />
        <EdgeWarning project={project} k={k} u={b.u} side={edgeSide} intensity={edgeIntensity} />
        <Ball project={project} point={ballPoint} surfacePoint={surfacePoint} trailPts={trailRef.current.slice(1)} opacity={opacity} scaleMul={scaleMul} stretchAngle={stretchAngle} stretchAmt={stretchAmt} hot={hot} />
        <ContactFlash x={flashRef.current.x} y={flashRef.current.y} t={flashRef.current.t} active={flashRef.current.active} />
        <CursorPaw x={mouseRef.current.x} y={mouseRef.current.y} active={t.interactivePaw && mouseRef.current.active} punch={punch} />
      </svg>
      <Equations T={T} CUES={CUES} total={total} k={k} on={t.showEquations} />
      <Wordmark title={t.title} subtitle={t.subtitle} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(120% 92% at 50% 48%, rgba(0,0,0,0) 44%, ${TOK.bg} 100%)`, opacity: 0.82
      }} />
    </div>
  );
}

function MobiusScene() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const stage = React.useRef(null);
  const hint = React.useRef(null);

  React.useEffect(() => {
    const onScroll = () => {
      const p = clamp(window.scrollY / Math.max(1, window.innerHeight), 0, 1);
      if (stage.current) {
        stage.current.style.transform = `translate3d(0, ${-p * 14}vh, 0) scale(${1 + p * 0.07})`;
        stage.current.style.opacity = String(1 - p * 1.1);
      }
      if (hint.current) hint.current.style.opacity = String(clamp(1 - p * 4, 0, 1));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <React.Fragment>
      <div ref={stage} style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg, #161826)', willChange: 'transform, opacity'
      }}>
        <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg="var(--color-bg, #161826)">
          <Piece t={t} />
        </CompositionStage>
      </div>
      <div ref={hint} style={{
        position: 'absolute', right: 40, bottom: 26, display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 10, pointerEvents: 'none',
        fontFamily: 'var(--font-body, Inter), system-ui, sans-serif', fontSize: 11,
        letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-accent, #9184d9)'
      }}>
        <span>Scroll</span>
        <span style={{ width: 1, height: 32, background: `linear-gradient(180deg, ${TOK.accent}, rgba(0,0,0,0))` }} />
      </div>
      <TweaksPanel>
        <TweakSection label="Surface" />
        <TweakRadio label="Half-twists" value={t.twists} options={[1, 2, 3]} onChange={(v) => setTweak('twists', Number(v))} />
        <TweakSlider label="Ribs" value={t.ribs} min={24} max={140} step={4} onChange={(v) => setTweak('ribs', v)} />
        <TweakToggle label="Shaded faces" value={t.shaded} onChange={(v) => setTweak('shaded', v)} />
        <TweakToggle label="Interactive paw" value={t.interactivePaw} onChange={(v) => setTweak('interactivePaw', v)} />
        <TweakSection label="Type" />
        <TweakToggle label="Show equations" value={t.showEquations} onChange={(v) => setTweak('showEquations', v)} />
        <TweakText label="Name" value={t.title} onChange={(v) => setTweak('title', v)} />
        <TweakText label="Tagline" value={t.subtitle} onChange={(v) => setTweak('subtitle', v)} />
        <TweakSection label="Editing" />
        <TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => setTweak('motionEditor', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

window.MobiusScene = MobiusScene;
