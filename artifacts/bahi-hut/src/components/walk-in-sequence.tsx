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
export interface WalkInFrame {
  src: string;
  alt: string;
  // Where the push-in heads: the next thing the eye should go to.
  focus: string;
  lines: string[];
  body?: string;
}

const FRAMES: WalkInFrame[] = [
  {
    src: entranceImg,
    alt: 'The Bahi Hut entrance at night, a tree wrapped in blue lights',
    focus: '50% 58%',
    lines: ['Follow the', 'blue lights.'],
    body: 'Just off the Tamiami Trail, next to the Golden Host Resort.',
  },
  {
    src: signImg,
    alt: 'The Bahi Hut sign on the lit block wall',
    focus: '66% 52%',
    lines: ['Look for', 'the sign.'],
    body: "Block letters on a block wall. You can't miss it after dark.",
  },
  {
    src: totemImg,
    alt: 'A carved tiki totem under string lights',
    focus: '40% 12%',
    lines: ['Say hello', 'to the doorman.'],
    body: 'Hand-carved tikis keep watch at the entrance.',
  },
  {
    src: alohaImg,
    alt: 'A carved tiki mask framed by palm fronds under an Aloha sign',
    focus: '57% 0%',
    lines: ['Aloha.'],
    body: 'Pull up a stool. The Mai Tais are strong.',
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
    };

    const tick = (timestamp: number) => {
      // Frame-rate independent easing, so 120Hz and 60Hz screens feel the same.
      const elapsed = lastTimestamp ? Math.min(timestamp - lastTimestamp, 100) : 16.67;
      lastTimestamp = timestamp;
      const factor = 1 - Math.pow(1 - SMOOTHING, elapsed / 16.67);

      const target = getTarget();
      const delta = target - eased;
      eased = Math.abs(delta) < SETTLE_THRESHOLD ? target : eased + delta * factor;

      render(eased);

      if (eased !== target) {
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

    eased = getTarget();
    render(eased);

    window.addEventListener('scroll', ensureAnimating, { passive: true });
    window.addEventListener('resize', ensureAnimating, { passive: true });
    return () => {
      window.removeEventListener('scroll', ensureAnimating);
      window.removeEventListener('resize', ensureAnimating);
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
        className="walk scroll-scrub-viewport sticky top-0 w-full overflow-hidden bg-[hsl(20_40%_6%)]"
      >
        {FRAMES.map((frame, i) => (
          <div
            key={frame.src}
            ref={(el) => {
              photoRefs.current[i] = el;
            }}
            className="walk-photo absolute inset-0"
          >
            <img
              src={frame.src}
              alt={frame.alt}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transformOrigin: frame.focus, objectPosition: frame.focus }}
            />
          </div>
        ))}

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
                  {frame.lines.map((line, li) => (
                    <span key={li} className="beat-line" style={{ '--i': li } as CSSProperties}>
                      <span>{line}</span>
                    </span>
                  ))}
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
