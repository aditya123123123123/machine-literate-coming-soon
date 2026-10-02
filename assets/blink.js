(() => {
  'use strict';
  const host = document.querySelector('.character-art');
  const image = host?.querySelector('img');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!image) return;

  // Measured on the approved 707 × 921 still. Only these eye patches change.
  const eyes = [[133, 288, 66, 48], [255, 283, 69, 51]];
  let canvas, context, patches, source, timer, frame, generation = 0;
  let visible = true;
  const allowed = () => !motion.matches && !document.hidden && visible;
  const stop = () => {
    generation++;
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    context?.clearRect(0, 0, 707, 921);
  };

  function prepare() {
    if (patches && source === image.currentSrc) return true;
    if (!image.complete || !image.naturalWidth) return false;
    try {
      const sample = document.createElement('canvas');
      sample.width = 707;
      sample.height = 921;
      const ctx = sample.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(image, 0, 0, 707, 921);
      patches = eyes.map(([x, y, width, height]) => {
        const pixels = ctx.getImageData(x, y, width, height);
        const clean = ctx.createImageData(width, height);
        const light = ctx.createImageData(width, height);
        for (let row = 0; row < height; row++) {
          for (let col = 0; col < width; col++) {
            const i = (row * width + col) * 4;
            const t = row / (height - 1);
            // Reconstruct only the lit pixels from the screen directly above/below.
            const bg = [0, 1, 2].map(c =>
              pixels.data[col * 4 + c] * (1 - t) +
              pixels.data[((height - 1) * width + col) * 4 + c] * t);
            const excess = Math.max(...bg.map((v, c) => pixels.data[i + c] - v));
            const alpha = Math.min(1, Math.max(0, (excess - 2) / 6));
            for (let c = 0; c < 3; c++) {
              clean.data[i + c] = pixels.data[i + c] * (1 - alpha) + bg[c] * alpha;
              light.data[i + c] = pixels.data[i + c];
            }
            clean.data[i + 3] = 255;
            light.data[i + 3] = Math.round(255 * alpha);
          }
        }
        const layer = document.createElement('canvas');
        layer.width = width;
        layer.height = height;
        layer.getContext('2d').putImageData(light, 0, 0);
        return { x, y, width, height, clean, layer };
      });
      source = image.currentSrc;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.width = 707;
        canvas.height = 921;
        canvas.className = 'blink-eyes';
        canvas.setAttribute('aria-hidden', 'true');
        host.append(canvas);
        context = canvas.getContext('2d');
      }
      return true;
    } catch {
      // An unreadable image/canvas leaves the original still fully intact.
      patches = null;
      return false;
    }
  }

  function draw(openness) {
    context.clearRect(0, 0, 707, 921);
    for (const p of patches) {
      context.putImageData(p.clean, p.x, p.y);
      const height = 3 + (p.height - 3) * openness;
      context.drawImage(p.layer, p.x, p.y + (p.height - height) / 2, p.width, height);
    }
  }

  function schedule() {
    stop();
    if (!allowed()) return;
    timer = setTimeout(blink, 5000 + Math.random() * 3000);
  }

  function blink() {
    if (!allowed() || !prepare()) return;
    const run = generation;
    // Sequential phases guarantee the brief closed pose is not skipped after a stall.
    const phases = [[80, 1, 0], [45, 0, 0], [110, 0, 1]];
    let phase = 0, start;
    const tick = now => {
      if (run !== generation || !allowed()) return;
      start ??= now;
      const [duration, from, to] = phases[phase];
      const t = Math.min(1, (now - start) / duration);
      const eased = t * t * (3 - 2 * t);
      draw(from + (to - from) * eased);
      if (t === 1) {
        phase++;
        start = undefined;
        if (phase === phases.length) return schedule();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  }

  motion.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', schedule);
  image.addEventListener('load', () => { patches = null; schedule(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }).observe(image);
  }
  schedule();
})();
