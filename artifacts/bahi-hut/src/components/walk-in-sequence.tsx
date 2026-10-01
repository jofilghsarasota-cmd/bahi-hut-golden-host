import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import entranceImg from '@assets/generated_images/res/12.jpg';
import signImg from '@assets/generated_images/res/8.avif';
import totemImg from '@assets/generated_images/res/2.avif';
import alohaImg from '@assets/generated_images/res/3.avif';

// A walk from the street to the door, in real photos, browsed as a carousel:
//
//   blue-lit entrance  ->  the sign  ->  the totem  ->  the Aloha mask
//
// The active photo gets a slow Ken Burns push-in while it's shown and
// crossfades into the next on navigation. Captions use the same
// masked-line reveal as the lounge beats in the hero.
//
// On top of the photos: the real bulbs in each shot twinkle, light sources
// breathe or buzz like neon, soft bokeh drifts past at different depths (its
// color follows the walk from blue to warm to red), and the camera sways a
// little while a slide is active.

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
  // Ambient hue while this photo is active.
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

// How long an untouched slide stays up before the carousel advances.
const AUTOPLAY_MS = 6000;
// A swipe past this fraction of the stage width changes slides.
const SWIPE_THRESHOLD = 0.12;

export default function WalkInSequence() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(true);
  const [paused, setPaused] = useState(false);
  const [drag, setDrag] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragInfo = useRef<{ id: number; startX: number; width: number } | null>(null);
  const last = FRAMES.length - 1;

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  const goTo = useCallback(
    (next: number) => setIndex(((next % FRAMES.length) + FRAMES.length) % FRAMES.length),
    [],
  );
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  // Pause every looping light, and autoplay, while the carousel is off screen.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || !inView || paused) return;
    const id = window.setTimeout(() => goNext(), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [reducedMotion, inView, paused, index, goNext]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    stage.addEventListener('keydown', onKey);
    return () => stage.removeEventListener('keydown', onKey);
  }, [goPrev, goNext]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const width = stageRef.current?.getBoundingClientRect().width ?? 1;
    dragInfo.current = { id: e.pointerId, startX: e.clientX, width };
    setPaused(true);
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    const info = dragInfo.current;
    if (!info || info.id !== e.pointerId) return;
    setDrag((e.clientX - info.startX) / info.width);
  };
  const endDrag = (e: React.PointerEvent) => {
    const info = dragInfo.current;
    if (!info || info.id !== e.pointerId) return;
    dragInfo.current = null;
    if (drag > SWIPE_THRESHOLD) goPrev();
    else if (drag < -SWIPE_THRESHOLD) goNext();
    setDrag(0);
    setIsDragging(false);
    setPaused(false);
  };

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

  const dragPct = drag * 100;

  return (
    <div
      ref={stageRef}
      data-inview={inView}
      data-dragging={isDragging}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="A walk from the street to the Bahi Hut door"
      className="walk relative w-full aspect-[4/5] md:aspect-[16/9] overflow-hidden bg-[hsl(20_40%_6%)] outline-none touch-pan-y select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="walk-camera absolute inset-0">
        {FRAMES.map((frame, i) => {
          const [fx, fy] = frame.focus.split(' ');
          const active = i === index;
          // Shortest circular distance from the active slide, so the carousel wraps both ways.
          const delta = (((i - index + FRAMES.length / 2) % FRAMES.length) + FRAMES.length) % FRAMES.length - FRAMES.length / 2;
          // Neighbors sit just off-stage so a swipe-in-progress shows a sliver of the next photo.
          if (Math.abs(delta) > 1) return null;
          const offset = delta + dragPct / 100;
          return (
            <div
              key={frame.src}
              data-on={active ? 'true' : 'false'}
              className="walk-photo absolute inset-0"
              style={{ '--shown': active ? 1 : 0, transform: `translateX(${offset * 100}%)` } as CSSProperties}
            >
              {/* Sized like object-fit: cover, so the lights stay on their bulbs. */}
              <div
                className="walk-cover"
                style={{ '--ar': frame.aspect, '--fx': fx, '--fy': fy, '--push': active ? 1 : 0 } as CSSProperties}
              >
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

      <div
        aria-hidden="true"
        className="walk-bokeh absolute inset-x-0 z-[1] pointer-events-none"
        style={{ '--glow-h': FRAMES[index].hue } as CSSProperties}
      >
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
          {FRAMES.map((frame, i) => {
            const active = i === index;
            return (
              <div
                key={frame.src}
                className="story-beat [grid-area:1/1] self-end pb-24 md:pb-28 max-w-xl transition-opacity duration-500"
                style={
                  {
                    opacity: active ? 1 : 0,
                    '--enter': active ? 1 : 0,
                    '--exit': 0,
                    '--local': 1,
                  } as CSSProperties
                }
                aria-hidden={!active}
              >
                <h2 className="font-serif font-light text-white text-4xl md:text-6xl leading-[1.04] tracking-[-0.01em]">
                  {frame.lines.map((line, li) => {
                    const glow = frame.glow && li === frame.lines.length - 1;
                    return (
                      <span key={li} className="beat-line" style={{ '--i': active ? li : 0 } as CSSProperties}>
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
            );
          })}
        </div>
      </div>

      {/* Carousel controls. */}
      <button
        type="button"
        onClick={goPrev}
        aria-label="Previous photo"
        className="walk-nav absolute left-3 md:left-6 top-1/2 z-20 -translate-y-1/2 grid place-items-center rounded-full"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label="Next photo"
        className="walk-nav absolute right-3 md:right-6 top-1/2 z-20 -translate-y-1/2 grid place-items-center rounded-full"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      <div className="absolute bottom-6 md:bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5">
        {FRAMES.map((frame, i) => (
          <button
            key={frame.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to photo ${i + 1} of ${FRAMES.length}`}
            aria-current={i === index}
            className="walk-dot"
            data-active={i === index}
          />
        ))}
      </div>

      {/* Frame counter, like a slate in the corner of the shot. */}
      <div aria-hidden="true" className="absolute bottom-6 md:bottom-8 right-4 md:right-8 z-20 flex items-center gap-3 text-white/70 text-xs md:text-sm tracking-[0.2em] tabular-nums">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <span className="walk-bar" style={{ '--walk': (index + 1) / FRAMES.length } as CSSProperties} />
        <span>{String(last + 1).padStart(2, '0')}</span>
      </div>
    </div>
  );
}
