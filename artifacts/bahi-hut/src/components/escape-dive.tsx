import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import diveVideo from '@assets/generated_images/escape-dive.mp4';
import divePoster from '@assets/generated_images/escape-dive-poster.jpg';
import diveEnd from '@assets/generated_images/escape-dive-end.jpg';
import { clamp01, easeFactor, maxTime, primeVideo, seekTo, smoothstep } from '@/lib/scroll-scrub';
import type { LoungeBeat } from '@/components/scroll-scrub-hero';

// A pinned scene that scrubs one aerial video with the scroll, the same way
// the home hero does:
//
//   dive (neighborhood -> Tamiami Trail -> thatched entrance)  ->  hold
//
// Text beats ride over the dive; the hold shows `children` on the blurred
// last frame.

// Scroll distances, in viewport heights of actual scrolling.
const DIVE_VH = 200;
const HOLD_VH = 70;
const TOTAL_SCROLL_VH = DIVE_VH + HOLD_VH;
// The wrapper also contains the pinned viewport itself (100vh).
const WRAPPER_VH = TOTAL_SCROLL_VH + 100;

// How close (in vh of scroll) to the end of the video before the hold begins.
const HOLD_ENTER_VH = 1;

// Start fetching the video once the scene is this close to the viewport.
const PRELOAD_MARGIN = '150% 0px';

// When each beat enters and leaves, as fractions of the video: the first
// over the wide shot of the Trail, the second as the roofs come up close.
const BEAT_TIMING = [
  { enter: [0.1, 0.24], exit: [0.4, 0.48] },
  { enter: [0.56, 0.68], exit: [0.84, 0.92] },
] as const;

const SETTLE_THRESHOLD_VH = 0.01;

type Phase = 'dive' | 'hold';

interface EscapeDiveProps {
  // Scroll-driven text shown over the dive, in order.
  beats?: LoungeBeat[];
  // Shown on the blurred last frame.
  children?: ReactNode;
}

export default function EscapeDive({ beats = [], children }: EscapeDiveProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const holdRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
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
    const video = videoRef.current;
    if (!wrapper || !stage || !video) return;

    let ready = video.readyState >= 1 && video.duration > 0;
    let eased = 0;
    let rafId = 0;
    let isAnimating = false;
    let lastTimestamp = 0;
    let phase: Phase | null = null;
    // Last values written to CSS custom properties, to skip no-op writes.
    const written = new Map<string, string>();

    const setVar = (el: HTMLElement, key: string, name: string, value: number) => {
      const str = value.toFixed(4);
      if (written.get(key + name) !== str) {
        written.set(key + name, str);
        el.style.setProperty(name, str);
      }
    };

    // Scroll position within the scene, in vh of scrolling.
    const getTarget = () => {
      const rect = wrapper.getBoundingClientRect();
      const pxPerVh = rect.height / WRAPPER_VH;
      return pxPerVh > 0 ? Math.min(Math.max(-rect.top / pxPerVh, 0), TOTAL_SCROLL_VH) : 0;
    };

    const applyPhase = (next: Phase) => {
      if (next === phase) return;
      phase = next;
      stage.dataset.phase = next;
      const hold = holdRef.current;
      if (hold) {
        hold.dataset.active = String(next === 'hold');
        hold.inert = next !== 'hold';
      }
    };

    const render = (pos: number) => {
      const progress = clamp01(pos / DIVE_VH);
      if (ready) seekTo(video, progress * maxTime(video));

      applyPhase(pos < DIVE_VH - HOLD_ENTER_VH ? 'dive' : 'hold');

      let scrim = 0;
      beatRefs.current.forEach((el, i) => {
        const timing = BEAT_TIMING[i];
        if (!el || !timing) return;
        const enter = smoothstep(timing.enter[0], timing.enter[1], progress);
        const exit = smoothstep(timing.exit[0], timing.exit[1], progress);
        // 0 -> 1 across the beat's whole time on screen, for a slow parallax drift.
        const local = clamp01((progress - timing.enter[0]) / (timing.exit[1] - timing.enter[0]));
        setVar(el, `b${i}`, '--enter', enter);
        setVar(el, `b${i}`, '--exit', exit);
        setVar(el, `b${i}`, '--local', local);
        scrim = Math.max(scrim, enter * (1 - exit));
      });
      setVar(stage, 's', '--scrim', scrim);
    };

    const tick = (timestamp: number) => {
      const elapsed = lastTimestamp ? Math.min(timestamp - lastTimestamp, 100) : 16.67;
      lastTimestamp = timestamp;
      const factor = easeFactor(elapsed);

      const target = getTarget();
      const delta = target - eased;
      eased = Math.abs(delta) < SETTLE_THRESHOLD_VH ? target : eased + delta * factor;

      render(eased);

      if (eased !== target || video.seeking) {
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

    // Snap instantly to the current scroll position, so the first frame shown
    // after a (re)load is already correct.
    const snap = () => {
      eased = getTarget();
      render(eased);
    };

    const handleMetadata = () => {
      ready = true;
      snap();
      primeVideo(video, snap);
    };

    // The video sits far down the page; only fetch it as the scene nears.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          video.preload = 'auto';
          video.load();
        }
      },
      { rootMargin: PRELOAD_MARGIN },
    );
    observer.observe(wrapper);

    video.addEventListener('loadedmetadata', handleMetadata);
    window.addEventListener('scroll', ensureAnimating, { passive: true });
    window.addEventListener('resize', ensureAnimating, { passive: true });

    snap();

    return () => {
      observer.disconnect();
      video.removeEventListener('loadedmetadata', handleMetadata);
      window.removeEventListener('scroll', ensureAnimating);
      window.removeEventListener('resize', ensureAnimating);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    // Static fallback: the hold content on the last frame of the dive.
    return (
      <section className="escape scroll-scrub-viewport relative w-full overflow-hidden bg-secondary">
        <img src={diveEnd} alt="The thatched entrance of the Bahi Hut from the Tamiami Trail" className="absolute inset-0 w-full h-full object-cover" />
        <div className="escape-tint absolute inset-0" />
        <div className="container relative z-10 mx-auto px-4 h-full flex items-center justify-center text-center">
          <div data-active="true" className="group w-full">
            {children}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div ref={wrapperRef} className="relative" style={{ height: `${WRAPPER_VH}vh` }}>
      <div
        ref={stageRef}
        data-phase="dive"
        className="escape scroll-scrub-viewport sticky top-0 w-full overflow-hidden bg-secondary"
      >
        <div className="escape-media absolute inset-0 z-0 overflow-hidden">
          <video
            ref={videoRef}
            src={diveVideo}
            poster={divePoster}
            muted
            playsInline
            webkit-playsinline="true"
            preload="none"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Sunlit teal wash + vignette that settles over the blurred hold. */}
        <div aria-hidden="true" className="escape-tint absolute inset-0 z-[1] pointer-events-none" />
        {/* Shades the side of the frame the beat text sits on. */}
        <div aria-hidden="true" className="escape-scrim absolute inset-0 z-[1] pointer-events-none" />
        <div aria-hidden="true" className="story-grain absolute z-[2] pointer-events-none" />

        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="container mx-auto px-4 h-full grid">
            {beats.map((beat, i) => (
              <div
                key={i}
                ref={(el) => {
                  beatRefs.current[i] = el;
                }}
                className="story-beat [grid-area:1/1] self-end pb-24 md:pb-28 max-w-xl"
              >
                <h2 className="font-serif font-light text-white text-4xl md:text-6xl leading-[1.04] tracking-[-0.01em]">
                  {beat.lines.map((line, li) => (
                    <span key={li} className="beat-line" style={{ '--i': li } as CSSProperties}>
                      <span>{line}</span>
                    </span>
                  ))}
                </h2>
                {beat.body && (
                  <div className="beat-body mt-6 flex items-center gap-4">
                    <span aria-hidden="true" className="beat-rule h-px w-12 shrink-0 bg-primary" />
                    <p className="text-base md:text-lg text-white/85 leading-relaxed">{beat.body}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {children && (
          <div className="container relative z-10 mx-auto px-4 h-full grid place-items-center text-center">
            {/* `group` + data-active drive the `.reveal*` classes (index.css). */}
            <div ref={holdRef} data-active="false" data-side="before" className="group w-full">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
