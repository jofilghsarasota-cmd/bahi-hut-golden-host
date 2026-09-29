import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface HeroCarouselSlide {
  src: string;
  alt: string;
  label: string;
}

interface HeroCarouselProps {
  slides: HeroCarouselSlide[];
  // How long each slide holds before auto-advancing.
  intervalMs?: number;
}

const SWIPE_THRESHOLD_PX = 50;

// Full-bleed crossfade carousel for the hero: autoplay with a pause-on-
// hover/focus that preserves elapsed progress (not just a fresh timer), a
// swipe/keyboard/click-through progress line to match, and a one-shot Ken
// Burns zoom per slide. Built on framer-motion (already a project
// dependency, unused elsewhere) rather than embla-carousel-react, since the
// existing Carousel primitive is a translate-based slider and this needs a
// crossfade + scale treatment instead.
export function HeroCarousel({ slides, intervalMs = 5500 }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const paused = hovering || manuallyPaused;
  const [reducedMotion, setReducedMotion] = useState(false);
  const pointerStartX = useRef<number | null>(null);
  const remainingMs = useRef(intervalMs);
  const runStartedAt = useRef(0);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      remainingMs.current = intervalMs;
      setIndex(((next % slides.length) + slides.length) % slides.length);
    },
    [intervalMs, slides.length],
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Autoplay: tracks true elapsed time so a hover-pause resumes from where it
  // left off (matching the progress line's animation-play-state pause)
  // instead of restarting a fresh interval and drifting out of sync with it.
  useEffect(() => {
    if (reducedMotion || paused) return;
    runStartedAt.current = performance.now();
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % slides.length), remainingMs.current);
    return () => {
      window.clearTimeout(id);
      remainingMs.current = Math.max(0, remainingMs.current - (performance.now() - runStartedAt.current));
    };
  }, [index, paused, reducedMotion, slides.length]);

  useEffect(() => {
    remainingMs.current = intervalMs;
  }, [index, intervalMs]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    }
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = e.clientX;
  };
  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current == null) return;
    const delta = e.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      if (delta < 0) next();
      else prev();
    }
  };

  const slide = slides[index];
  const kenburnsStyle = { '--duration': `${intervalMs + 1000}ms` } as CSSProperties;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Photos of the Bahi Hut"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="absolute inset-0 outline-none touch-pan-y"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.15 : 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 overflow-hidden"
        >
          <img
            src={slide.src}
            alt={slide.alt}
            className={cn('w-full h-full object-cover', !reducedMotion && 'hero-kenburns-once')}
            style={!reducedMotion ? kenburnsStyle : undefined}
          />
        </motion.div>
      </AnimatePresence>

      {/* Preload the rest so switching slides never shows a blank frame. */}
      <div className="sr-only" aria-hidden="true">
        {slides.map((s) => (
          <img key={s.src} src={s.src} alt="" loading="eager" />
        ))}
      </div>

      <div className="absolute inset-y-0 left-2 right-2 z-20 hidden md:flex items-center justify-between pointer-events-none">
        <Button
          variant="glass"
          size="icon"
          className="pointer-events-auto"
          aria-label="Previous photo"
          onClick={prev}
        >
          <ChevronLeft aria-hidden="true" className="w-4 h-4" />
        </Button>
        <Button variant="glass" size="icon" className="pointer-events-auto" aria-label="Next photo" onClick={next}>
          <ChevronRight aria-hidden="true" className="w-4 h-4" />
        </Button>
      </div>

      <div className="absolute bottom-6 md:bottom-8 right-6 z-20 flex items-center justify-end gap-4">
        <div className="flex gap-2">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              aria-label={`Go to ${s.label}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
              className="relative h-1 w-10 md:w-14 rounded-full bg-white/25 overflow-hidden"
            >
              <span
                className={cn(
                  'absolute inset-y-0 left-0 bg-white rounded-full',
                  i === index && !reducedMotion && 'hero-progress-fill',
                )}
                style={
                  i === index
                    ? ({ '--duration': `${intervalMs}ms`, '--play-state': paused ? 'paused' : 'running' } as CSSProperties)
                    : { width: i < index ? '100%' : '0%' }
                }
              />
            </button>
          ))}
        </div>
        <Button
          variant="glass"
          size="icon"
          className="shrink-0"
          aria-label={manuallyPaused ? 'Resume slideshow' : 'Pause slideshow'}
          onClick={() => setManuallyPaused((p) => !p)}
        >
          {manuallyPaused ? (
            <Play aria-hidden="true" className="w-3.5 h-3.5" />
          ) : (
            <Pause aria-hidden="true" className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
