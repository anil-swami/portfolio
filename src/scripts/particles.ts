// Grain particles: they form the "AS" monogram in the hero, push away from the pointer, wander gently at rest,
// and scatter into a soft dust field behind the page as you scroll. Adapted from the Accounts Call design kit.
// Off under reduced motion, Save-Data, or without canvas support.

type Shape = { x: Float32Array; y: Float32Array; c: Uint8Array }; // points normalised to 0..1, colour index

const COLOURS = ['#ff6b4a', '#ffa07a', '#2dd4bf', '#ffffff', '#8b85ff']; // coral, light coral, mint, white, indigo
const DUST_ALPHA = 0.55;

export function startParticles(canvas: HTMLCanvasElement, getTarget: () => HTMLElement | null) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const small = innerWidth < 760;
  const COUNT = small ? 1800 : 4200;
  const dpr = Math.min(devicePixelRatio || 1, 2);

  // Particle state (flat arrays keep 4k particles cheap).
  const px = new Float32Array(COUNT), py = new Float32Array(COUNT);
  const vx = new Float32Array(COUNT), vy = new Float32Array(COUNT);
  const tx = new Float32Array(COUNT), ty = new Float32Array(COUNT); // shape target (0..1 in the box)
  const col = new Uint8Array(COUNT);
  const dustX = new Float32Array(COUNT), dustY = new Float32Array(COUNT); // scatter home (0..1 of viewport)
  const seed = new Float32Array(COUNT);
  const keep = new Uint8Array(COUNT); // which grains stay visible as background dust
  const size = new Float32Array(COUNT);
  const speed = new Float32Array(COUNT); // idle wander speed per grain

  let W = 0, H = 0;
  const resize = () => {
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener('resize', resize);

  for (let i = 0; i < COUNT; i++) {
    px[i] = Math.random() * W; py[i] = Math.random() * H;
    dustX[i] = Math.random(); dustY[i] = Math.random();
    seed[i] = Math.random() * Math.PI * 2;
    keep[i] = Math.random() < 0.32 ? 1 : 0;
    size[i] = 0.8 + Math.random() * (small ? 1.1 : 1.3);
    speed[i] = 0.6 + Math.random() * 0.9;
  }

  let shapes: Shape[] = [];
  const setShape = (n: number) => {
    const s = shapes[n % shapes.length];
    if (!s) return;
    const m = s.x.length;
    for (let i = 0; i < COUNT; i++) {
      const k = (i * 7919) % m; // spread particles over the sampled points
      tx[i] = s.x[k] + (Math.random() - 0.5) * 0.006;
      ty[i] = s.y[k] + (Math.random() - 0.5) * 0.006;
      col[i] = s.c[k];
    }
  };

  // Pointer (mouse or finger), in viewport pixels.
  let mx = -9999, my = -9999;
  const onMove = (e: PointerEvent) => { mx = e.clientX; my = e.clientY; };
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerleave', () => { mx = my = -9999; });
  document.addEventListener('pointerout', (e) => { if (!e.relatedTarget) mx = my = -9999; });

  let raf = 0;
  const frame = (t: number) => {
    raf = requestAnimationFrame(frame);
    const target = getTarget();
    if (!target) return;
    const box = target.getBoundingClientRect();
    // Scatter follows the shape itself: 0 while its box sits in the lower half of the screen or below,
    // 1 once it has scrolled off the top. On tall phone heroes the shape stays whole while you read past it.
    const p = Math.min(1, Math.max(0, (H * 0.5 - box.bottom) / (H * 0.5)));
    const ease = p * p * (3 - 2 * p);
    const side = Math.min(box.width, box.height); // keep the shape square inside the box
    const ox = box.left + (box.width - side) / 2, oy = box.top + (box.height - side) / 2;
    const radius = small ? 70 : 110;
    const time = t * 0.00025;
    // Idle life: every grain wanders a few pixels around its spot, the whole shape floats slowly,
    // and grains twinkle, so the shape is never perfectly still.
    const wander = small ? 2.4 : 3.6, tw = t * 0.0011;
    const floatX = Math.cos(t * 0.00045) * 4, floatY = Math.sin(t * 0.0006) * 6;

    ctx.clearRect(0, 0, W, H);
    for (let c = 0; c < COLOURS.length; c++) {
      ctx.fillStyle = COLOURS[c];
      for (let i = 0; i < COUNT; i++) {
        if (col[i] !== c) continue;
        // Where this grain wants to be: the shape, the dust field, or between them while scrolling.
        const sx = ox + tx[i] * side + floatX + Math.sin(tw * speed[i] + seed[i]) * wander;
        const sy = oy + ty[i] * side + floatY + Math.cos(tw * speed[i] * 0.9 + seed[i] * 1.7) * wander;
        const dx = (dustX[i] + Math.sin(time + seed[i]) * 0.02) * W;
        const dy = (dustY[i] + Math.cos(time * 0.8 + seed[i]) * 0.02) * H;
        const gx = sx + (dx - sx) * ease, gy = sy + (dy - sy) * ease;

        // Spring toward the goal, pushed away by the pointer.
        let ax = (gx - px[i]) * 0.045, ay = (gy - py[i]) * 0.045;
        const rx = px[i] - mx, ry = py[i] - my, d2 = rx * rx + ry * ry;
        if (d2 < radius * radius) {
          const d = Math.sqrt(d2) || 1, f = (1 - d / radius) * 9;
          ax += (rx / d) * f; ay += (ry / d) * f;
        }
        vx[i] = (vx[i] + ax) * 0.82; vy[i] = (vy[i] + ay) * 0.82;
        px[i] += vx[i]; py[i] += vy[i];

        // Most grains fade out as they scatter; a third stay as background dust.
        const twinkle = 0.78 + 0.22 * Math.sin(tw * 2.2 * speed[i] + seed[i] * 3);
        const a = (keep[i] ? 1 - ease * (1 - DUST_ALPHA) : 1 - ease) * twinkle;
        if (a <= 0.02) continue;
        ctx.globalAlpha = a;
        const s = size[i];
        ctx.fillRect(px[i], py[i], s, s);
      }
    }
    ctx.globalAlpha = 1;
  };

  buildShapes(small ? 1400 : 3200).then((built) => {
    shapes = built;
    setShape(0);
    raf = requestAnimationFrame(frame);
  });

  return {
    setShape,
    stop() { cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('pointermove', onMove); },
  };
}

// ---------- Shapes: draw on a hidden canvas, then sample the filled pixels ----------

const S = 400; // sampling canvas size

function sample(draw: (g: CanvasRenderingContext2D) => void, colourOf: (r: number, g: number, b: number) => number, n: number): Shape {
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  draw(g);
  const d = g.getImageData(0, 0, S, S).data;
  const xs: number[] = [], ys: number[] = [], cs: number[] = [];
  for (let y = 0; y < S; y += 2) {
    for (let x = 0; x < S; x += 2) {
      const i = (y * S + x) * 4;
      if (d[i + 3] < 140) continue;
      xs.push(x / S); ys.push(y / S); cs.push(colourOf(d[i], d[i + 1], d[i + 2]));
    }
  }
  // Pick n points at random so every shape has the same density.
  const out: Shape = { x: new Float32Array(n), y: new Float32Array(n), c: new Uint8Array(n) };
  for (let k = 0; k < n; k++) {
    const j = Math.floor(Math.random() * xs.length);
    out.x[k] = xs[j]; out.y[k] = ys[j]; out.c[k] = cs[j];
  }
  return out;
}

// Brand colours: coral and light coral for "A", mint and white for "S", indigo for the ring.
const byColour = (r: number, g: number, b: number) => {
  if (r > 200 && g < 160) return Math.random() < 0.72 ? 0 : 1; // coral
  if (g > 170 && b > 150 && r < 120) return Math.random() < 0.7 ? 2 : 3; // mint / white
  return 4; // indigo
};

async function buildShapes(n: number): Promise<Shape[]> {
  // The monogram uses Poppins Bold; wait for it so the letters are drawn in the right font.
  await document.fonts.load('700 100px Poppins').catch(() => {});
  const monogram = sample((g) => {
    g.textBaseline = 'middle';
    g.font = '700 250px Poppins, system-ui, sans-serif';
    const wA = g.measureText('A').width, wS = g.measureText('S').width, gap = -6;
    const left = (S - (wA + wS + gap)) / 2;
    g.fillStyle = '#ff6b4a';
    g.fillText('A', left, S / 2 + 10);
    g.fillStyle = '#2dd4bf';
    g.fillText('S', left + wA + gap, S / 2 + 10);
    // A soft ring under the letters, in indigo.
    g.strokeStyle = '#8b85ff'; g.lineWidth = 6; g.lineCap = 'round';
    g.beginPath(); g.arc(S / 2, S / 2, 188, 0.18 * Math.PI, 0.82 * Math.PI); g.stroke();
  }, byColour, n);
  return [monogram];
}
