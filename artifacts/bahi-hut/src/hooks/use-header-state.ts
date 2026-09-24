import { useEffect, useState } from 'react';

// Header heights in px (h-16, and h-14 once scrolled).
const HEADER_HEIGHT = 64;
const SCROLLED_AFTER = 8;

// True while the element spans the header's strip at the top of the viewport.
export function isUnderHeader(rect: { top: number; bottom: number }, headerHeight: number) {
  return rect.top <= 0 && rect.bottom > headerHeight;
}

// `overlaid`: a [data-header-overlay] element (the home hero) is behind the
// header, so the header goes transparent. `scrolled`: the page has left the top.
export function useHeaderState(overlayEnabled: boolean) {
  const [state, setState] = useState({ overlaid: overlayEnabled, scrolled: false });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = overlayEnabled ? document.querySelector<HTMLElement>('[data-header-overlay]') : null;
      const overlaid = el ? isUnderHeader(el.getBoundingClientRect(), HEADER_HEIGHT) : false;
      const scrolled = window.scrollY > SCROLLED_AFTER;
      setState((prev) => (prev.overlaid === overlaid && prev.scrolled === scrolled ? prev : { overlaid, scrolled }));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [overlayEnabled]);

  return state;
}
