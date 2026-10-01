import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';
import heroVideo from '@assets/gemini_generated_video_4e714eb2.mp4';
import heroPoster from '@assets/generated_images/hero-tiki-poster.jpg';
import loungeVideo from '@assets/generated_images/lounge-60.mp4';
import loungePoster from '@assets/generated_images/lounge-poster.jpg';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { clamp01, maxTime, primeVideo, seekTo, smoothstep } from '@/lib/scroll-scrub';

// The hero is one screen that plays two videos in a row on its own clock:
//
//   intro  ->  hero video  ->  hold ("since 1954")  ->  lounge video  ->  hold (the bar)
//
// The hero video ends on the blue door and the lounge video starts on the
// same door; the swap happens while the frame is blurred, so it reads as one
// continuous camera move. Each video plays natively while its segment runs
// (the clock follows the video, so buffering holds the clock rather than
// skipping ahead) and is seeked while the clock is stopped or jumped. The
// files are de-duplicated (the source had pulldown repeats) and motion-
// interpolated to 60fps at their slowed-down length, so they play at ~1x.
const HERO_SRC = heroVideo;
const HERO_POSTER = heroPoster;
const LOUNGE_SRC = loungeVideo;
const LOUNGE_POSTER = loungePoster;

// Timeline, in ms.
const INTRO_HOLD_MS = 1000;
// Match the playable video lengths (hero 10.0s, lounge-60 13.73s, less
// maxTime's end margin) so playbackRate stays at ~1.
const HERO_PLAY_MS = 9950;
const HERO_HOLD_MS = 5500;
const LOUNGE_PLAY_MS = 13680;
// The bar hold, including the fade to dusk before the loop restarts.
const LOUNGE_HOLD_MS = 5200;
// The loop dips to the background colour and back over this long on each side.
const LOOP_FADE_MS = 1200;

const HERO_START = INTRO_HOLD_MS;
const HERO_END = HERO_START + HERO_PLAY_MS;
const LOUNGE_START = HERO_END + HERO_HOLD_MS;
const LOUNGE_END = LOUNGE_START + LOUNGE_PLAY_MS;
const TOTAL_MS = LOUNGE_END + LOUNGE_HOLD_MS;

// While a video plays, the clock runs on frame time and eases toward the
// video's reported position by this fraction per frame...
const CLOCK_CORRECTION = 0.05;
// ...and never runs more than this far (ms) ahead of it, so buffering holds it.
const CLOCK_LEAD_MS = 100;

// How close (in ms) to the end of a video before its hold begins.
const HOLD_ENTER_MS = 50;

// When each lounge text beat enters and leaves, as fractions of the lounge
// video. The first ~12% (the door swinging open) is intentionally left bare.
const BEAT_TIMING = [
  { enter: [0.12, 0.2], exit: [0.46, 0.52] },
  { enter: [0.56, 0.64], exit: [0.9, 0.96] },
] as const;

// Pause while less than this much of the hero is on screen.
const VISIBLE_THRESHOLD = 0.4;

const CHAPTERS = [
  { label: 'Welcome', start: 0, end: HERO_END },
  { label: 'Since 1954', start: HERO_END, end: LOUNGE_START },
  { label: 'The Lounge', start: LOUNGE_START, end: LOUNGE_END },
  { label: 'The Bar', start: LOUNGE_END, end: TOTAL_MS },
] as const;

type Phase = 'intro' | 'hero-hold' | 'lounge' | 'lounge-hold';
const PHASE_ORDER: Phase[] = ['intro', 'hero-hold', 'lounge', 'lounge-hold'];

type Status = 'playing' | 'paused';

export interface LoungeBeat {
  // Each entry is revealed as its own masked line.
  lines: string[];
  body?: string;
}

interface AutoplayHeroProps {
  // Shown over the hero video while it plays.
  children?: ReactNode;
  // Shown on the blurred last frame of the hero video.
  endContent?: ReactNode;
  // Timed text shown over the lounge video, in order.
  loungeBeats?: LoungeBeat[];
  // Shown on the blurred last frame of the lounge video.
  loungeEndContent?: ReactNode;
}

interface Player {
  toggle: () => void;
  seek: (ms: number) => void;
}

export default function AutoplayHero({
  children,
  endContent,
  loungeBeats = [],
  loungeEndContent,
}: AutoplayHeroProps) {
  const stageRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const loungeVideoRef = useRef<HTMLVideoElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const heroEndRef = useRef<HTMLDivElement>(null);
  const loungeEndRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chapterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const loopFadeRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [status, setStatus] = useState<Status>('playing');
  const [chapter, setChapter] = useState(0);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const stage = stageRef.current;
    const heroVid = heroVideoRef.current;
    const loungeVid = loungeVideoRef.current;
    if (!stage || !heroVid || !loungeVid) return;

    let heroReady = heroVid.readyState >= 1 && heroVid.duration > 0;
    let loungeReady = loungeVid.readyState >= 1 && loungeVid.duration > 0;
    let loungeHasFrame = false;
    let loungeRequested = false;
    let time = 0;
    // Set once the clock wraps, so only a restart fades in (not the first load).
    let looped = false;
    let userPaused = false;
    let inView = true;
    let rafId = 0;
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

    // data-side tells inactive content which way it left (or will arrive), so
    // it enters from below going forward, from above after a jump back, and
    // always leaves in the direction of travel.
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
      setChapter(PHASE_ORDER.indexOf(next));
    };

    const requestLounge = () => {
      if (loungeRequested) return;
      loungeRequested = true;
      loungeVid.preload = 'auto';
      loungeVid.load();
    };

    // A video that can't autoplay (e.g. iOS Low Power Mode) falls back to
    // being seeked from the clock.
    let heroCanPlay = true;
    let loungeCanPlay = true;

    const segments = [
      { video: heroVid, start: HERO_START, dur: HERO_PLAY_MS },
      { video: loungeVid, start: LOUNGE_START, dur: LOUNGE_PLAY_MS },
    ];
    const isReady = (v: HTMLVideoElement) => (v === heroVid ? heroReady : loungeReady);
    const canPlay = (v: HTMLVideoElement) => (v === heroVid ? heroCanPlay : loungeCanPlay);
    const targetTime = (seg: (typeof segments)[number], t: number) =>
      clamp01((t - seg.start) / seg.dur) * maxTime(seg.video);

    const pauseVideos = () => segments.forEach(({ video }) => video.paused || video.pause());

    // Put each paused video on the frame for time t. `force` skips seekTo's
    // wait for an in-flight seek, for jumps that must land exactly.
    const syncFrames = (t: number, force = false) => {
      segments.forEach((seg) => {
        if (!isReady(seg.video) || !seg.video.paused) return;
        const target = targetTime(seg, t);
        if (force) seg.video.currentTime = target;
        else seekTo(seg.video, target);
      });
    };

    const render = (t: number) => {
      const loungeProgress = clamp01((t - LOUNGE_START) / LOUNGE_PLAY_MS);
      syncFrames(t);

      applyPhase(
        t < HERO_END - HOLD_ENTER_MS
          ? 'intro'
          : t < LOUNGE_START
            ? 'hero-hold'
            : t < LOUNGE_END - HOLD_ENTER_MS
              ? 'lounge'
              : 'lounge-hold',
      );

      let scrim = 0;
      beatRefs.current.forEach((el, i) => {
        const timing = BEAT_TIMING[i];
        if (!el || !timing) return;
        const enter = smoothstep(timing.enter[0], timing.enter[1], loungeProgress);
        const exit = smoothstep(timing.exit[0], timing.exit[1], loungeProgress);
        setVar(el, '--enter', enter);
        setVar(el, '--exit', exit);
        scrim = Math.max(scrim, enter * (1 - exit));
      });
      setVar(stage, '--scrim', scrim);

      // Dip to the background colour across the loop point so the bar never
      // hard-cuts back to the welcome frame.
      const loopFade = loopFadeRef.current;
      if (loopFade) {
        const fadeOut = smoothstep(TOTAL_MS - LOOP_FADE_MS, TOTAL_MS, t);
        const fadeIn = looped ? 1 - smoothstep(0, LOOP_FADE_MS, t) : 0;
        setVar(loopFade, '--loop-fade', Math.max(fadeOut, fadeIn));
      }

      chapterRefs.current.forEach((el, i) => {
        const c = CHAPTERS[i];
        if (el && c) setVar(el, '--fill', clamp01((t - c.start) / (c.end - c.start)));
      });
    };

    const reportStatus = () => setStatus(userPaused ? 'paused' : 'playing');

    const canRun = () => heroReady && !userPaused && inView && !document.hidden;

    const tick = (timestamp: number) => {
      const elapsed = lastTimestamp ? Math.min(timestamp - lastTimestamp, 100) : 0;
      lastTimestamp = timestamp;

      // Hold at the door until the lounge video has a frame to show, rather
      // than running its text over the blurred hero frame.
      const stalled = time >= LOUNGE_START && !loungeHasFrame;
      const seg = segments.find((s) => time >= s.start && time < s.start + s.dur);
      const vid = seg?.video;
      if (stalled) {
        // Hold the clock where it is.
      } else if (seg && vid && isReady(vid) && canPlay(vid) && vid.currentTime < maxTime(vid)) {
        // Native playback leads; the clock follows the video's position.
        if (vid.paused) {
          vid.playbackRate = maxTime(vid) / (seg.dur / 1000);
          vid.play().catch(() => {
            if (vid === heroVid) heroCanPlay = false;
            else loungeCanPlay = false;
          });
        } else {
          // currentTime only updates in coarse steps, so following it directly
          // makes clock-driven motion (text drift, chapter bars) stutter.
          // Advance by frame time instead, easing toward the video's position.
          const videoClock = seg.start + (vid.currentTime / maxTime(vid)) * seg.dur;
          const next = time + elapsed + (videoClock - time) * CLOCK_CORRECTION;
          time = Math.max(time, Math.min(next, videoClock + CLOCK_LEAD_MS));
        }
      } else {
        time += elapsed;
      }
      // Loop: after the bar hold, start again from the welcome frame.
      if (time >= TOTAL_MS) {
        time = 0;
        looped = true;
        pauseVideos();
        syncFrames(time, true);
      }
      render(time);

      if (canRun()) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rafId = 0;
      }
    };

    // Start or stop the clock to match the current conditions.
    const update = () => {
      if (canRun()) {
        if (!rafId) {
          lastTimestamp = 0;
          rafId = window.requestAnimationFrame(tick);
        }
      } else {
        if (rafId) window.cancelAnimationFrame(rafId);
        rafId = 0;
        pauseVideos();
      }
    };

    playerRef.current = {
      toggle: () => {
        userPaused = !userPaused;
        reportStatus();
        update();
      },
      seek: (ms) => {
        time = Math.min(Math.max(ms, 0), TOTAL_MS - 1);
        looped = false;
        pauseVideos();
        syncFrames(time, true);
        render(time);
        reportStatus();
        update();
      },
    };

    const handleHeroMetadata = () => {
      heroReady = true;
      render(time);
      primeVideo(heroVid, () => render(time));
      requestLounge();
      update();
    };

    const handleLoungeMetadata = () => {
      loungeReady = true;
      render(time);
      primeVideo(loungeVid, () => render(time));
    };

    // Only reveal the lounge video once it has a frame to show; until then the
    // blurred hero frame stays up instead of a blank.
    const handleLoungeData = () => {
      loungeHasFrame = true;
      stage.dataset.lounge = 'ready';
    };

    // A seek skipped while the previous one was decoding still needs to land
    // when the clock is stopped (paused, or after a chapter jump).
    const handleSeeked = () => {
      if (!rafId) render(time);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.intersectionRatio >= VISIBLE_THRESHOLD;
        update();
      },
      { threshold: [0, VISIBLE_THRESHOLD, 1] },
    );
    observer.observe(stage);

    heroVid.addEventListener('loadedmetadata', handleHeroMetadata);
    heroVid.addEventListener('seeked', handleSeeked);
    loungeVid.addEventListener('loadedmetadata', handleLoungeMetadata);
    loungeVid.addEventListener('loadeddata', handleLoungeData);
    loungeVid.addEventListener('seeked', handleSeeked);
    document.addEventListener('visibilitychange', update);

    if (loungeVid.readyState >= 2) handleLoungeData();
    render(time);
    if (heroReady) handleHeroMetadata();

    return () => {
      observer.disconnect();
      heroVid.removeEventListener('loadedmetadata', handleHeroMetadata);
      heroVid.removeEventListener('seeked', handleSeeked);
      loungeVid.removeEventListener('loadedmetadata', handleLoungeMetadata);
      loungeVid.removeEventListener('loadeddata', handleLoungeData);
      loungeVid.removeEventListener('seeked', handleSeeked);
      document.removeEventListener('visibilitychange', update);
      if (rafId) window.cancelAnimationFrame(rafId);
      playerRef.current = null;
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    // Static fallback: the opening hero, then the bar with its ending.
    return (
      <>
        <section data-header-overlay className="scroll-scrub-viewport relative w-full overflow-hidden bg-secondary">
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

  const ToggleIcon = status === 'paused' ? Play : Pause;
  const toggleLabel = status === 'paused' ? 'Play intro' : 'Pause intro';

  return (
    <section
      ref={stageRef}
      data-header-overlay
      data-phase="intro"
      aria-label="Welcome to the Bahi Hut"
      className="story scroll-scrub-viewport relative w-full overflow-hidden bg-secondary"
    >
      <div className="story-media absolute inset-0 z-0 overflow-hidden">
        <video
          ref={heroVideoRef}
          src={HERO_SRC}
          poster={HERO_POSTER}
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

      {/* Lounge beats: revealed and dismissed by the clock. */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="container mx-auto px-4 h-full grid">
          {loungeBeats.map((beat, i) => (
            <div
              key={i}
              ref={(el) => {
                beatRefs.current[i] = el;
              }}
              data-var-key={`beat${i}`}
              className="story-beat [grid-area:1/1] self-end md:self-center pb-32 md:pb-0 max-w-xl"
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

      {/* Covers the loop point: fades in over the bar hold, out over the welcome frame. */}
      <div
        ref={loopFadeRef}
        aria-hidden="true"
        data-var-key="loop"
        className="absolute inset-0 z-[15] bg-secondary pointer-events-none opacity-[var(--loop-fade,0)]"
      />

      {/* Playback controls: pause/play, and one progress bar per chapter. */}
      <div className="story-controls absolute inset-x-0 bottom-5 md:bottom-8 z-20">
        <div className="container mx-auto px-4 flex items-center gap-3 md:gap-5">
          <Button
            variant="glass"
            size="icon"
            className="shrink-0 rounded-full"
            aria-label={toggleLabel}
            onClick={() => playerRef.current?.toggle()}
          >
            <ToggleIcon aria-hidden="true" className="w-4 h-4" />
          </Button>
          <ol className="flex-1 grid grid-cols-4 gap-2 md:gap-3">
            {CHAPTERS.map((c, i) => (
              <li key={c.label}>
                <button
                  type="button"
                  aria-label={`Go to ${c.label}`}
                  aria-current={chapter === i ? 'step' : undefined}
                  onClick={() => playerRef.current?.seek(c.start)}
                  className={cn(
                    'story-chapter w-full py-4 sm:py-2 text-left focus-visible:outline-none',
                    chapter === i ? 'text-white' : 'text-white/60 hover:text-white/90',
                  )}
                >
                  <span className="hidden sm:block mb-2 text-xs tracking-wide transition-colors">{c.label}</span>
                  <span
                    ref={(el) => {
                      chapterRefs.current[i] = el;
                    }}
                    data-var-key={`chapter${i}`}
                    className="story-chapter-bar block"
                  />
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
