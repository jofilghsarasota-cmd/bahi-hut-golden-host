import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import heroVideo from '@assets/generated_images/hero-tiki.mp4';
import heroPoster from '@assets/generated_images/hero-tiki-poster.jpg';
import loungeVideo from '@assets/generated_images/lounge-scrub.mp4';
import loungePoster from '@assets/generated_images/lounge-poster.jpg';

// The hero is one pinned scene that scrubs two videos in a row:
//
//   hero video  ->  hold ("since 1954")  ->  lounge video  ->  hold (the bar)
//
// Both videos are encoded with every frame a keyframe so scroll seeks are
// cheap. The hero video ends on the blue door and the lounge video starts on
// the same door; the swap happens while the frame is blurred, so it reads as
// one continuous camera move.
const HERO_SRC = heroVideo;
const HERO_POSTER = heroPoster;
const LOUNGE_SRC = loungeVideo;
const LOUNGE_POSTER = loungePoster;

// Scroll distances, in viewport heights of actual scrolling.
const HERO_SCRUB_VH = 200;
const HERO_HOLD_VH = 80;
const LOUNGE_SCRUB_VH = 180;
const LOUNGE_HOLD_VH = 80;

const LOUNGE_START_VH = HERO_SCRUB_VH + HERO_HOLD_VH;
const LOUNGE_END_VH = LOUNGE_START_VH + LOUNGE_SCRUB_VH;
const TOTAL_SCROLL_VH = LOUNGE_END_VH + LOUNGE_HOLD_VH;
// The wrapper also contains the pinned viewport itself (100vh).
const WRAPPER_VH = TOTAL_SCROLL_VH + 100;

// Start fetching the lounge video once the visitor is this far into the hero.
const LOUNGE_PRELOAD_AT_VH = HERO_SCRUB_VH * 0.4;

// How close (in vh of scroll) to the end of a video before its hold begins.
const HOLD_ENTER_VH = 1;

// When each lounge text beat enters and leaves, as fractions of the lounge
// video. The first ~18% (the door swinging open) is intentionally left bare.
const BEAT_TIMING = [
  { enter: [0.18, 0.32], exit: [0.44, 0.52] },
  { enter: [0.56, 0.68], exit: [0.84, 0.92] },
] as const;

// Kept a hair before the true end so the browser reliably renders the last
// frame instead of occasionally clamping/blanking exactly at duration.
const END_EPSILON_SECONDS = 0.05;

// How quickly the scene catches up to the scroll position each frame (0-1).
// Lower = smoother/laggier trailing motion, higher = snappier/closer to 1:1.
const SMOOTHING = 0.12;

// Once the eased position is this close to the target, snap and stop animating.
const SETTLE_THRESHOLD_VH = 0.01;

// Skip seeks smaller than half a frame - they wouldn't change the picture,
// just cost a decode.
const MIN_SEEK_DELTA_SECONDS = 1 / 60;

type Phase = 'intro' | 'hero-hold' | 'lounge' | 'lounge-hold';
const PHASE_ORDER: Phase[] = ['intro', 'hero-hold', 'lounge', 'lounge-hold'];

export interface LoungeBeat {
  // Each entry is revealed as its own masked line.
  lines: string[];
  body?: string;
}

interface ScrollScrubHeroProps {
  // Shown over the hero video while it scrubs.
  children?: ReactNode;
  // Shown on the blurred last frame of the hero video.
  endContent?: ReactNode;
  // Scroll-driven text shown over the lounge video, in order.
  loungeBeats?: LoungeBeat[];
  // Shown on the blurred last frame of the lounge video.
  loungeEndContent?: ReactNode;
}

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);

const smoothstep = (from: number, to: number, x: number) => {
  const t = clamp01((x - from) / (to - from));
  return t * t * (3 - 2 * t);
};

// Seek only once the previous seek has finished decoding. Seeking every frame
// cancels in-flight seeks before they paint, which makes scrubbing jittery.
const seekTo = (video: HTMLVideoElement, time: number) => {
  if (
    !video.seeking &&
    Number.isFinite(time) &&
    Math.abs(video.currentTime - time) > MIN_SEEK_DELTA_SECONDS
  ) {
    video.currentTime = time;
  }
};

const maxTime = (video: HTMLVideoElement) =>
  Math.max(video.duration - END_EPSILON_SECONDS, 0);

// iOS Safari won't render frames reached via `currentTime` seeks until the
// video has actually played at least once. A muted, near-instant play/pause
// "primes" the decoder so later scroll-driven seeks show up.
const primeVideo = (video: HTMLVideoElement, onPrimed: () => void) => {
  const playing = video.play();
  if (playing && typeof playing.then === 'function') {
    playing
      .then(() => {
        video.pause();
        onPrimed();
      })
      .catch(() => {
        /* Autoplay can be blocked; scrubbing still works once the user interacts. */
      });
  } else {
    video.pause();
  }
};

export default function ScrollScrubHero({
  children,
  endContent,
  loungeBeats = [],
  loungeEndContent,
}: ScrollScrubHeroProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const loungeVideoRef = useRef<HTMLVideoElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const heroEndRef = useRef<HTMLDivElement>(null);
  const loungeEndRef = useRef<HTMLDivElement>(null);
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
    const heroVid = heroVideoRef.current;
    const loungeVid = loungeVideoRef.current;
    if (!wrapper || !stage || !heroVid || !loungeVid) return;

    let heroReady = heroVid.readyState >= 1 && heroVid.duration > 0;
    let loungeReady = loungeVid.readyState >= 1 && loungeVid.duration > 0;
    let loungeRequested = false;
    let eased = 0;
    let rafId = 0;
    let isAnimating = false;
    let lastTimestamp = 0;
    let phase: Phase | null = null;
    // Last values written to CSS custom properties, to skip no-op writes.
    const written = new Map<string, string>();

    const setVar = (el: HTMLElement, name: string, value: number) => {
      const key = `${el.dataset.varKey ?? ''}${name}`;
      const str = value.toFixed(4);
      if (written.get(key) !== str) {
        written.set(key, str);
        el.style.setProperty(name, str);
      }
    };

    // Scroll position within the scene, in vh of scrolling.
    const getTarget = () => {
      const rect = wrapper.getBoundingClientRect();
      const pxPerVh = rect.height / WRAPPER_VH;
      return pxPerVh > 0 ? Math.min(Math.max(-rect.top / pxPerVh, 0), TOTAL_SCROLL_VH) : 0;
    };

    // data-side tells inactive content which way it left (or will arrive), so
    // it enters from below when scrolling down, from above when scrolling
    // back up, and always leaves in the direction of travel.
    const setActive = (el: HTMLElement | null, own: Phase, current: Phase) => {
      if (!el) return;
      const active = own === current;
      el.dataset.active = String(active);
      el.dataset.side = PHASE_ORDER.indexOf(current) > PHASE_ORDER.indexOf(own) ? 'after' : 'before';
      el.inert = !active;
    };

    const applyPhase = (next: Phase) => {
      if (next === phase) return;
      phase = next;
      stage.dataset.phase = next;
      setActive(introRef.current, 'intro', next);
      setActive(heroEndRef.current, 'hero-hold', next);
      setActive(loungeEndRef.current, 'lounge-hold', next);
    };

    const requestLounge = () => {
      if (loungeRequested) return;
      loungeRequested = true;
      loungeVid.preload = 'auto';
      loungeVid.load();
    };

    const render = (pos: number) => {
      if (pos >= LOUNGE_PRELOAD_AT_VH) requestLounge();

      if (heroReady) {
        seekTo(heroVid, clamp01(pos / HERO_SCRUB_VH) * maxTime(heroVid));
      }

      const loungeProgress = clamp01((pos - LOUNGE_START_VH) / LOUNGE_SCRUB_VH);
      if (loungeReady) {
        seekTo(loungeVid, loungeProgress * maxTime(loungeVid));
      }

      applyPhase(
        pos < HERO_SCRUB_VH - HOLD_ENTER_VH
          ? 'intro'
          : pos < LOUNGE_START_VH
            ? 'hero-hold'
            : pos < LOUNGE_END_VH - HOLD_ENTER_VH
              ? 'lounge'
              : 'lounge-hold',
      );

      let scrim = 0;
      beatRefs.current.forEach((el, i) => {
        const timing = BEAT_TIMING[i];
        if (!el || !timing) return;
        const enter = smoothstep(timing.enter[0], timing.enter[1], loungeProgress);
        const exit = smoothstep(timing.exit[0], timing.exit[1], loungeProgress);
        // 0 -> 1 across the beat's whole time on screen, for a slow parallax drift.
        const local = clamp01((loungeProgress - timing.enter[0]) / (timing.exit[1] - timing.enter[0]));
        setVar(el, '--enter', enter);
        setVar(el, '--exit', exit);
        setVar(el, '--local', local);
        scrim = Math.max(scrim, enter * (1 - exit));
      });
      setVar(stage, '--scrim', scrim);
      setVar(stage, '--hero', clamp01(pos / HERO_SCRUB_VH));
      setVar(stage, '--story', pos / TOTAL_SCROLL_VH);
    };

    const tick = (timestamp: number) => {
      // Frame-rate independent easing, so 120Hz and 60Hz screens feel the same.
      const elapsed = lastTimestamp ? Math.min(timestamp - lastTimestamp, 100) : 16.67;
      lastTimestamp = timestamp;
      const factor = 1 - Math.pow(1 - SMOOTHING, elapsed / 16.67);

      const target = getTarget();
      const delta = target - eased;
      eased = Math.abs(delta) < SETTLE_THRESHOLD_VH ? target : eased + delta * factor;

      render(eased);

      if (eased !== target || heroVid.seeking || loungeVid.seeking) {
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

    // Snap instantly to the current scroll position - no easing in from 0,
    // so the first frame shown after a (re)load is already correct.
    const snap = () => {
      eased = getTarget();
      render(eased);
    };

    const handleHeroMetadata = () => {
      heroReady = true;
      snap();
      primeVideo(heroVid, snap);
    };

    const handleLoungeMetadata = () => {
      loungeReady = true;
      snap();
      primeVideo(loungeVid, snap);
    };

    // Only reveal the lounge video once it has a frame to show; until then the
    // blurred hero frame stays up instead of a blank.
    const handleLoungeData = () => {
      stage.dataset.lounge = 'ready';
    };

    const handleScroll = () => ensureAnimating();

    heroVid.addEventListener('loadedmetadata', handleHeroMetadata);
    loungeVid.addEventListener('loadedmetadata', handleLoungeMetadata);
    loungeVid.addEventListener('loadeddata', handleLoungeData);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    if (loungeVid.readyState >= 2) handleLoungeData();
    snap();

    return () => {
      heroVid.removeEventListener('loadedmetadata', handleHeroMetadata);
      loungeVid.removeEventListener('loadedmetadata', handleLoungeMetadata);
      loungeVid.removeEventListener('loadeddata', handleLoungeData);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    // Static fallback: the opening hero, then the bar with its ending.
    return (
      <>
        <section className="scroll-scrub-viewport relative w-full overflow-hidden bg-secondary">
          <img src={HERO_POSTER} alt="Bahi Hut entrance" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/50 to-transparent" />
          <div className="container relative z-10 mx-auto px-4 h-full flex items-center justify-center text-center">
            {children}
          </div>
        </section>
        {loungeEndContent && (
          <section className="scroll-scrub-viewport relative w-full overflow-hidden bg-secondary">
            <img src={LOUNGE_POSTER} alt="The Bahi Hut bar" className="absolute inset-0 w-full h-full object-cover" />
            <div className="story-tint absolute inset-0" />
            <div className="container relative z-10 mx-auto px-4 h-full flex items-center justify-center text-center">
              <div data-active="true" className="group w-full">
                {loungeEndContent}
              </div>
            </div>
          </section>
        )}
      </>
    );
  }

  return (
    <div ref={wrapperRef} className="relative" style={{ height: `${WRAPPER_VH}vh` }}>
      <div
        ref={stageRef}
        data-phase="intro"
        className="story scroll-scrub-viewport sticky top-0 w-full overflow-hidden bg-secondary"
      >
        <div className="story-media absolute inset-0 z-0 overflow-hidden">
          <video
            ref={heroVideoRef}
            src={HERO_SRC}
            muted
            playsInline
            webkit-playsinline="true"
            preload="auto"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <video
            ref={loungeVideoRef}
            src={LOUNGE_SRC}
            muted
            playsInline
            webkit-playsinline="true"
            preload="none"
            aria-hidden="true"
            className="story-lounge-video absolute inset-0 w-full h-full object-cover"
          />
          <div className="story-base-gradient absolute inset-0 bg-gradient-to-t from-secondary via-secondary/50 to-transparent" />
        </div>

        {/* Dusk tint + vignette that settles over each blurred hold frame. */}
        <div aria-hidden="true" className="story-tint absolute inset-0 z-[1] pointer-events-none" />
        {/* Darkens the side of the frame the lounge text sits on. */}
        <div aria-hidden="true" className="story-scrim absolute inset-0 z-[1] pointer-events-none" />
        <div aria-hidden="true" className="story-grain absolute z-[2] pointer-events-none" />

        {/* Lounge beats: revealed and dismissed by scroll position. */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="container mx-auto px-4 h-full grid">
            {loungeBeats.map((beat, i) => (
              <div
                key={i}
                ref={(el) => {
                  beatRefs.current[i] = el;
                }}
                data-var-key={`beat${i}`}
                className="story-beat [grid-area:1/1] self-end md:self-center pb-28 md:pb-0 max-w-xl"
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

        <div className="container relative z-10 mx-auto px-4 h-full grid place-items-center text-center">
          <div ref={introRef} data-active="true" data-side="before" className="story-intro [grid-area:1/1]">
            {children}
          </div>
          {endContent && (
            // `group` + data-active/data-side drive the `.reveal*` classes
            // (index.css) that stagger the end content in and out.
            <div ref={heroEndRef} data-active="false" data-side="before" className="group [grid-area:1/1] w-full">
              {endContent}
            </div>
          )}
          {loungeEndContent && (
            <div ref={loungeEndRef} data-active="false" data-side="before" className="group [grid-area:1/1] w-full">
              {loungeEndContent}
            </div>
          )}
        </div>

        {/* Invites the first scroll; gone as soon as the camera starts moving. */}
        <div aria-hidden="true" className="story-cue absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="flex flex-col items-center gap-3 text-white/75 text-xs md:text-sm tracking-wide">
            <span>Scroll to step inside</span>
            <span className="story-cue-line" />
          </div>
        </div>

        {/* Progress through the whole scene, with a mark at each hold. */}
        <div aria-hidden="true" className="story-rail hidden md:block absolute right-8 top-1/2 -translate-y-1/2 z-20">
          <span className="story-rail-fill" />
          <span
            className="story-rail-mark"
            style={{ '--at': HERO_SCRUB_VH / TOTAL_SCROLL_VH } as CSSProperties}
          />
          <span
            className="story-rail-mark"
            style={{ '--at': LOUNGE_END_VH / TOTAL_SCROLL_VH } as CSSProperties}
          />
        </div>
      </div>
    </div>
  );
}
