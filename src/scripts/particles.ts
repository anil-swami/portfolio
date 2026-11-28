// Grain particles: they form a shape in the hero (the AC logo, a growth chart, a check badge, one per
// slide), push away from the pointer, and scatter into a soft dust field behind the page as you scroll.
// Original implementation for Accounts Call. Off under reduced motion or without canvas support.

type Shape = { x: Float32Array; y: Float32Array; c: Uint8Array }; // points normalised to 0..1, colour index

const COLOURS = ['#daa92a', '#f6c443', '#44d2f6', '#ffffff', '#4f8df5']; // gold, light gold, cyan, white, blue
const DUST_ALPHA = 0.55;

export function startParticles(canvas: HTMLCanvasElement, getTarget: () => HTMLElement | null, hero: HTMLElement) {
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
    const heroBox = hero.getBoundingClientRect();
    // 0 at the top of the page, 1 once the hero has mostly scrolled away.
    const p = Math.min(1, Math.max(0, -heroBox.top / (heroBox.height * 0.75)));
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

  buildShapes(small ? 1400 : 3200, canvas.dataset.logo || '/logo.png').then((built) => {
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

const byColour = (r: number, g: number, b: number) => {
  if (r > 150 && g > 110 && b < 120) return Math.random() < 0.75 ? 0 : 1; // gold
  if (b > 180 && g > 160) return 2; // cyan
  if (b > 150 && r < 120) return 4; // blue
  return Math.random() < 0.7 ? 3 : 2; // dark logo strokes become white/cyan on the navy hero
};

async function buildShapes(n: number, logoUrl: string): Promise<Shape[]> {
  const logo = new Image();
  logo.src = logoUrl;
  await logo.decode().catch(() => {});

  const logoShape = sample((g) => {
    if (!logo.naturalWidth) return;
    // Only the "AC" mark: the bottom quarter of the file is the name text.
    const sw = logo.naturalWidth, sh = logo.naturalHeight * 0.74;
    const scale = Math.min((S * 0.92) / sw, (S * 0.92) / sh);
    const w = sw * scale, h = sh * scale;
    g.drawImage(logo, 0, 0, sw, sh, (S - w) / 2, (S - h) / 2, w, h);
  }, byColour, n);

  const chartShape = sample((g) => {
    const bars = [0.38, 0.52, 0.46, 0.66, 0.6, 0.82];
    bars.forEach((h, i) => {
      g.fillStyle = i % 2 ? '#daa92a' : '#44d2f6';
      const x = 40 + i * 56, top = S - 30 - h * 300;
      g.fillRect(x, top, 38, S - 30 - top);
    });
    g.strokeStyle = '#ffffff'; g.lineWidth = 12; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(40, 250); g.bezierCurveTo(120, 230, 170, 150, 240, 140); g.lineTo(340, 50); g.stroke();
    g.beginPath(); g.moveTo(300, 46); g.lineTo(346, 44); g.lineTo(344, 90); g.stroke();
  }, byColour, n);

  const checkShape = sample((g) => {
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = '#44d2f6'; g.lineWidth = 26;
    g.beginPath(); g.arc(S / 2, S / 2, 160, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = '#daa92a'; g.lineWidth = 34;
    g.beginPath(); g.moveTo(120, 205); g.lineTo(180, 265); g.lineTo(290, 140); g.stroke();
  }, byColour, n);

  return [logoShape, chartShape, checkShape];
}
