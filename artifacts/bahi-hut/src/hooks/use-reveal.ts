import { useEffect, useRef, useState } from 'react';

// Reveals once the element reaches ~90% down the viewport, and stays revealed.
// Driven by a scroll/resize listener rather than IntersectionObserver: an
// instant jump (browser back-navigation restoring scroll position, a
// keyboard "End" press) can move an element from below the viewport to
// above it without ever intersecting it, and IntersectionObserver simply
// never fires for that case, leaving the content stuck at opacity 0. A
// scroll-position check re-runs on every scroll/resize (including the one
// event an instant jump still fires) and on mount, so it can't get stuck.
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    let frame = 0;
    const check = () => {
      frame = 0;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
        setVisible(true);
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
      }
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(check);
    };

    check();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return { ref, visible };
}
