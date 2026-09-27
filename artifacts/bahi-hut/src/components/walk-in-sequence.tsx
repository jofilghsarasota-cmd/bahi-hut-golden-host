import { useEffect, useRef, useState, type CSSProperties } from 'react';
import entranceImg from '@assets/generated_images/res/12.jpg';
import signImg from '@assets/generated_images/res/8.avif';
import totemImg from '@assets/generated_images/res/2.avif';
import alohaImg from '@assets/generated_images/res/3.avif';

// A pinned, scroll-driven walk from the street to the door, in real photos:
//
//   blue-lit entrance  ->  the sign  ->  the totem  ->  the Aloha mask
//
// Each photo pushes in slowly while it's on screen and the next one fades in
// over it, so the sequence reads as one camera walking forward. Captions use
// the same masked-line reveal as the lounge beats in the hero.
//
// On top of the photos: the real bulbs in each shot twinkle, light sources
// breathe or buzz like neon, soft bokeh drifts past at different depths (its
// color follows the walk from blue to warm to red), a light leak sweeps across
// each cut, and the camera sways a little with every step.

// A point of light sitting on a real bulb, in % of the photo.
type Glint = [x: number, y: number];

interface GlintSet {
  hue: string; // hsl() components
  size: number; // rem
  points: Glint[];
  // Every nth glint gets a cross flare.
  flareEvery?: number;
}

interface Glow {
  x: number;
  y: number;
  w: number;
  h: number;
  hue: string;
  kind: 'breathe' | 'neon';
}

export interface WalkInFrame {
  src: string;
  alt: string;
  // Where the push-in heads: the next thing the eye should go to.
  focus: string;
  lines: string[];
  body?: string;
  // Photo aspect ratio, so light effects stay pinned to the right spots.
  aspect: number;
  // Hue the ambient light shifts toward while this photo is up.
  hue: number;
  // Makes the last caption line glow in this color.
  glow?: string;
  glints?: GlintSet[];
  glows?: Glow[];
}

const FRAMES: WalkInFrame[] = [
  {
    src: entranceImg,
    alt: 'The Bahi Hut entrance at night, a tree wrapped in blue lights',
    focus: '50% 58%',
    lines: ['Follow the', 'blue lights.'],
    body: 'Just off the Tamiami Trail, next to the Golden Host Resort.',
    aspect: 1496 / 1000,
    hue: 225,
    glow: '222 100% 66%',
    glints: [
      {
        hue: '222 100% 72%',
        size: 1.6,
        flareEvery: 3,
        points: [
          [25.4, 7.5], [34.8, 6], [31.4, 10], [42.8, 12], [10, 11], [22, 16], [16.7, 23], [26.7, 20],
          [6, 25], [20, 30], [13.4, 38], [23.4, 42], [8.7, 44], [17.4, 50], [26, 56], [11.4, 60],
          [5.3, 65], [20, 65], [15.4, 72], [8, 76], [22.7, 76], [17.4, 85], [12, 82], [4, 56], [27.4, 47],
        ],
      },
      {
        hue: '42 100% 76%',
        size: 0.8,
        points: [[62.2, 33], [67.5, 36], [73.5, 31], [80.2, 30], [86.9, 29], [90.9, 35], [90.9, 45], [90.2, 60], [58.2, 39.5]],
      },
    ],
    glows: [{ x: 48.8, y: 49, w: 26, h: 34, hue: '330 85% 62%', kind: 'breathe' }],
  },
  {
    src: signImg,
    alt: 'The Bahi Hut sign on the lit block wall',
    focus: '66% 52%',
    lines: ['Look for', 'the sign.'],
    body: "Block letters on a block wall. You can't miss it after dark.",
    aspect: 780 / 446,
    hue: 398,
    glints: [
      {
        hue: '42 100% 76%',
        size: 1.1,
        flareEvery: 3,
        points: [[85, 8.8], [90, 2.2], [87.5, 19.7], [93.8, 13], [96.3, 26], [92.5, 33], [86.3, 26], [82.5, 4.4], [94.4, 20.8]],
      },
    ],
    glows: [
      { x: 44, y: 78, w: 42, h: 55, hue: '40 90% 62%', kind: 'breathe' },
      { x: 66, y: 55, w: 30, h: 30, hue: '38 80% 60%', kind: 'breathe' },
    ],
  },
  {
    src: totemImg,
    alt: 'A carved tiki totem under string lights',
    focus: '40% 12%',
    lines: ['Say hello', 'to the doorman.'],
    body: 'Hand-carved tikis keep watch at the entrance.',
    aspect: 1320 / 1977,
    hue: 398,
    glints: [
      {
        hue: '44 100% 78%',
        size: 1.3,
        flareEvery: 3,
        points: [
          [11.3, 1.7], [16.3, 7.9], [21.3, 7.5], [30, 1.3], [53.8, 5.4], [61.3, 5.4], [70, 9.2], [75, 3.3],
          [82.5, 2.5], [88.8, 5.8], [95, 5.4], [58.8, 23], [65, 24.6], [72.5, 26.7], [80, 28.8], [87.5, 29.2],
          [10, 43], [15, 44.7], [67.5, 12.5], [12.5, 5],
        ],
      },
    ],
    glows: [{ x: 37.5, y: 24, w: 24, h: 18, hue: '225 90% 60%', kind: 'breathe' }],
  },
  {
    src: alohaImg,
    alt: 'A carved tiki mask framed by palm fronds under an Aloha sign',
    focus: '57% 0%',
    lines: ['Aloha.'],
    body: 'Pull up a stool. The Mai Tais are strong.',
    aspect: 1320 / 1191,
    hue: 350,
    glow: '350 95% 62%',
    glints: [{ hue: '0 0% 100%', size: 0.9, flareEvery: 1, points: [[51, 48], [64.5, 48.5], [57.8, 25]] }],
    glows: [
      { x: 55.6, y: 11, w: 44, h: 22, hue: '350 95% 58%', kind: 'neon' },
      { x: 57, y: 66, w: 26, h: 16, hue: '215 95% 60%', kind: 'breathe' },
      { x: 96, y: 22, w: 14, h: 22, hue: '220 95% 60%', kind: 'breathe' },
      { x: 97, y: 62, w: 14, h: 26, hue: '38 95% 60%', kind: 'breathe' },
    ],
  },
];

// Scroll distance per photo, in viewport heights.
const FRAME_VH = 90;
const TOTAL_SCROLL_VH = FRAME_VH * FRAMES.length;
// The wrapper also contains the pinned viewport itself (100vh).
const WRAPPER_VH = TOTAL_SCROLL_VH + 100;

// Same feel as the hero: the scene trails the scroll a little.
const SMOOTHING = 0.12;
const SETTLE_THRESHOLD = 0.0005;

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);

const smoothstep = (from: number, to: number, x: number) => {
  const t = clamp01((x - from) / (to - from));
  return t * t * (3 - 2 * t);
};

// Deterministic pseudo-random, so the lights look the same on every render.
const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Out-of-focus lights drifting between the camera and the scene.
const BOKEH = Array.from({ length: 18 }, (_, i) => {
  const depth = rand(i + 1);
  return {
    x: rand(i + 20) * 100,
    y: rand(i + 40) * 100,
    size: 2 + depth * 7, // rem: nearer is bigger
    depth,
    drift: 9 + rand(i + 60) * 8,
    delay: -rand(i + 80) * 12,
    alpha: 0.25 + (1 - depth) * 0.35,
  };
});

export default function WalkInSequence() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    if (!wrapper || !stage) return;

    let eased = 0;
    // Pointer position, -1..1 on each axis, and the camera's eased copy of it.
    const pointer = { x: 0, y: 0 };
    const pointerEased = { x: 0, y: 0 };
    let rafId = 0;
    let isAnimating = false;
    let lastTimestamp = 0;
    const last = FRAMES.length - 1;
    // Last values written to CSS custom properties, to skip no-op writes.
    const written = new Map<string, string>();

    const setVar = (el: HTMLElement, key: string, name: string, value: number) => {
      const str = value.toFixed(4);
      if (written.get(key + name) !== str) {
        written.set(key + name, str);
        el.style.setProperty(name, str);
      }
    };

    // Progress through the sequence, 0 -> FRAMES.length.
    const getTarget = () => {
      const rect = wrapper.getBoundingClientRect();
      const pxPerVh = rect.height / WRAPPER_VH;
      if (pxPerVh <= 0) return 0;
      const vh = Math.min(Math.max(-rect.top / pxPerVh, 0), TOTAL_SCROLL_VH);
      return vh / FRAME_VH;
    };

    const render = (f: number) => {
      photoRefs.current.forEach((el, i) => {
        if (!el) return;
        // Each photo fades in over the previous one as its turn begins...
        const shown = i === 0 ? 1 : smoothstep(i - 0.3, i + 0.05, f);
        // ...and keeps pushing in until the next one has fully covered it.
        const push = clamp01((f - i + 0.3) / 1.4);
        setVar(el, `p${i}`, '--shown', shown);
        setVar(el, `p${i}`, '--push', push);
        // Only the photos on screen keep their lights animating.
        const on = String(shown > 0.01 && (i === last || f < i + 1.05));
        if (el.dataset.on !== on) el.dataset.on = on;
      });

      captionRefs.current.forEach((el, i) => {
        if (!el) return;
        const enter = smoothstep(i + 0.02, i + 0.32, f);
        const exit = i === last ? 0 : smoothstep(i + 0.62, i + 0.88, f);
        const local = clamp01((f - i) / 0.9);
        setVar(el, `c${i}`, '--enter', enter);
        setVar(el, `c${i}`, '--exit', exit);
        setVar(el, `c${i}`, '--local', local);
      });

      const current = Math.min(Math.floor(f + 0.1), last);
      stage.dataset.frame = String(current);
      setVar(stage, 's', '--walk', f / FRAMES.length);

      // The ambient hue follows the crossfades from photo to photo, and a
      // light leak flares across each cut, gone again once it lands.
      let hue = FRAMES[0].hue;
      let leak = 0;
      let leakX = 0;
      for (let i = 1; i <= last; i++) {
        hue += smoothstep(i - 0.3, i + 0.05, f) * (FRAMES[i].hue - FRAMES[i - 1].hue);
        const t = clamp01((f - (i - 0.42)) / 0.6);
        if (t > 0 && t < 1) {
          leak = Math.sin(Math.PI * t);
          leakX = t;
        }
      }
      setVar(stage, 's', '--glow-h', hue);
      setVar(stage, 's', '--leak', leak);
      setVar(stage, 's', '--leak-x', leakX);

      // Two footsteps per photo: a small dip and a sway side to side.
      const step = f * Math.PI * 2;
      setVar(stage, 's', '--bob', -Math.abs(Math.sin(step)));
      setVar(stage, 's', '--sway', Math.sin(step));
      setVar(stage, 's', '--mx', pointerEased.x);
      setVar(stage, 's', '--my', pointerEased.y);
    };

    const tick = (timestamp: number) => {
      // Frame-rate independent easing, so 120Hz and 60Hz screens feel the same.
      const elapsed = lastTimestamp ? Math.min(timestamp - lastTimestamp, 100) : 16.67;
      lastTimestamp = timestamp;
      const factor = 1 - Math.pow(1 - SMOOTHING, elapsed / 16.67);

      const target = getTarget();
      const delta = target - eased;
      eased = Math.abs(delta) < SETTLE_THRESHOLD ? target : eased + delta * factor;

      // The camera follows the pointer more lazily than the scroll.
      let pointerSettled = true;
      for (const axis of ['x', 'y'] as const) {
        const d = pointer[axis] - pointerEased[axis];
        if (Math.abs(d) < 0.001) {
          pointerEased[axis] = pointer[axis];
        } else {
          pointerEased[axis] += d * factor * 0.5;
          pointerSettled = false;
        }
      }

      render(eased);

      if (eased !== target || !pointerSettled) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        isAnimating = false;
        lastTimestamp = 0;
      }
    };

    const ensureAnimating = () => {
      if (!isAnimating) {
        isAnimating = true;
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handlePointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      ensureAnimating();
    };
    const resetPointer = () => {
      pointer.x = 0;
      pointer.y = 0;
      ensureAnimating();
    };
    // Touch screens get the scroll effects only.
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    // Pause every looping light while the section is off screen.
    const observer = new IntersectionObserver(([entry]) => {
      stage.dataset.inview = String(entry.isIntersecting);
    });
    observer.observe(stage);

    eased = getTarget();
    render(eased);

    window.addEventListener('scroll', ensureAnimating, { passive: true });
    window.addEventListener('resize', ensureAnimating, { passive: true });
    if (finePointer) {
      stage.addEventListener('pointermove', handlePointer, { passive: true });
      stage.addEventListener('pointerleave', resetPointer);
    }
    return () => {
      window.removeEventListener('scroll', ensureAnimating);
      window.removeEventListener('resize', ensureAnimating);
      stage.removeEventListener('pointermove', handlePointer);
      stage.removeEventListener('pointerleave', resetPointer);
      observer.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    // Static fallback: the four photos with their captions.
    return (
      <section className="bg-[hsl(20_40%_6%)] py-20">
        <div className="container mx-auto px-4 grid gap-10 md:grid-cols-2">
          {FRAMES.map((frame) => (
            <figure key={frame.src}>
              <img src={frame.src} alt={frame.alt} loading="lazy" className="w-full aspect-[4/3] object-cover rounded-2xl" />
              <figcaption className="mt-4">
                <p className="font-serif text-2xl text-white">{frame.lines.join(' ')}</p>
                {frame.body && <p className="mt-1 text-white/70">{frame.body}</p>}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div ref={wrapperRef} className="relative" style={{ height: `${WRAPPER_VH}vh` }}>
      <div
        ref={stageRef}
        data-frame="0"
        data-inview="true"
        className="walk scroll-scrub-viewport sticky top-0 w-full overflow-hidden bg-[hsl(20_40%_6%)]"
      >
        <div className="walk-camera absolute inset-0">
          {FRAMES.map((frame, i) => {
            const [fx, fy] = frame.focus.split(' ');
            return (
              <div
                key={frame.src}
                ref={(el) => {
                  photoRefs.current[i] = el;
                }}
                data-on={i === 0 ? 'true' : 'false'}
                className="walk-photo absolute inset-0"
              >
                {/* Sized like object-fit: cover, so the lights stay on their bulbs. */}
                <div className="walk-cover" style={{ '--ar': frame.aspect, '--fx': fx, '--fy': fy } as CSSProperties}>
                  <img
                    src={frame.src}
                    alt={frame.alt}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="absolute inset-0 w-full h-full"
                  />
                  <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                    {frame.glows?.map((g, gi) => (
                      <span
                        key={`g${gi}`}
                        className="walk-glow"
                        data-kind={g.kind}
                        style={
                          {
                            left: `${g.x}%`,
                            top: `${g.y}%`,
                            width: `${g.w}%`,
                            height: `${g.h}%`,
                            '--c': g.hue,
                            '--d': `${-gi * 1.7}s`,
                          } as CSSProperties
                        }
                      />
                    ))}
                    {frame.glints?.flatMap((set, si) =>
                      set.points.map(([x, y], pi) => (
                        <span
                          key={`${si}-${pi}`}
                          className="walk-glint"
                          data-flare={set.flareEvery && pi % set.flareEvery === 0 ? 'true' : undefined}
                          style={
                            {
                              left: `${x}%`,
                              top: `${y}%`,
                              '--c': set.hue,
                              '--s': `${set.size * (0.75 + rand(pi + si * 50) * 0.5)}rem`,
                              '--t': `${1.8 + rand(pi + 7) * 2.6}s`,
                              '--d': `${-rand(pi + 13) * 4}s`,
                            } as CSSProperties
                          }
                        />
                      )),
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div aria-hidden="true" className="walk-leak absolute z-[1] pointer-events-none" />
        <div aria-hidden="true" className="walk-bokeh absolute inset-x-0 z-[1] pointer-events-none">
          {BOKEH.map((b, i) => (
            <span
              key={i}
              style={
                {
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  '--s': `${b.size}rem`,
                  '--z': b.depth,
                  '--a': b.alpha,
                  '--t': `${b.drift}s`,
                  '--d': `${b.delay}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div aria-hidden="true" className="walk-shade absolute inset-0 z-[1] pointer-events-none" />
        <div aria-hidden="true" className="story-grain absolute z-[2] pointer-events-none" />

        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="container mx-auto px-4 h-full grid">
            {FRAMES.map((frame, i) => (
              <div
                key={frame.src}
                ref={(el) => {
                  captionRefs.current[i] = el;
                }}
                className="story-beat [grid-area:1/1] self-end pb-24 md:pb-28 max-w-xl"
              >
                <h2 className="font-serif font-light text-white text-4xl md:text-6xl leading-[1.04] tracking-[-0.01em]">
                  {frame.lines.map((line, li) => {
                    const glow = frame.glow && li === frame.lines.length - 1;
                    return (
                      <span key={li} className="beat-line" style={{ '--i': li } as CSSProperties}>
                        <span
                          className={glow ? 'beat-glow' : undefined}
                          style={glow ? ({ '--c': frame.glow } as CSSProperties) : undefined}
                        >
                          {line}
                        </span>
                      </span>
                    );
                  })}
                </h2>
                {frame.body && (
                  <div className="beat-body mt-6 flex items-center gap-4">
                    <span aria-hidden="true" className="beat-rule h-px w-12 shrink-0 bg-primary" />
                    <p className="text-base md:text-lg text-white/85 leading-relaxed">{frame.body}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Frame counter, like a slate in the corner of the shot. */}
        <div aria-hidden="true" className="absolute bottom-6 md:bottom-8 right-4 md:right-8 z-20 flex items-center gap-3 text-white/70 text-xs md:text-sm tracking-[0.2em] tabular-nums">
          <span className="walk-count">
            {FRAMES.map((_, i) => (
              <span key={i} data-n={i}>
                {String(i + 1).padStart(2, '0')}
              </span>
            ))}
          </span>
          <span className="walk-bar" />
          <span>{String(FRAMES.length).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  );
}
