import { useCallback, useEffect, useRef, useState } from 'react';
import tikiIcon from '@assets/generated_images/icons/tiki_mug_icon.png';

const MARGIN = 16;
const THUMB_SIZE = 80;

function scrollableHeight() {
  return document.documentElement.scrollHeight - window.innerHeight;
}

function trackHeight() {
  return Math.max(window.innerHeight - MARGIN * 2 - THUMB_SIZE, 0);
}

// Replaces the native scrollbar (hidden globally, see index.css) with a
// custom track + draggable thumb, since no browser will draw an image on
// the real one: Windows' fluent overlay scrollbars ignore
// ::-webkit-scrollbar entirely, and Firefox's scrollbar-color only takes
// flat colors.
export function ScrollProgressIcon() {
  const [top, setTop] = useState(MARGIN);
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ pointerY: 0, scrollY: 0 });

  const sync = useCallback(() => {
    const scrollable = scrollableHeight();
    const percent = scrollable > 0 ? window.scrollY / scrollable : 0;
    setTop(MARGIN + percent * trackHeight());
    setVisible(scrollable > THUMB_SIZE);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [sync]);

  const scrollToPointer = useCallback((clientY: number) => {
    const track = trackHeight();
    if (track <= 0) return;
    const percent = (clientY - MARGIN - THUMB_SIZE / 2) / track;
    window.scrollTo({ top: percent * scrollableHeight() });
  }, []);

  const handleThumbPointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { pointerY: e.clientY, scrollY: window.scrollY };
    setDragging(true);
  };

  const handleThumbPointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!dragging) return;
    const track = trackHeight();
    if (track <= 0) return;
    const deltaY = e.clientY - dragStart.current.pointerY;
    const deltaScroll = (deltaY / track) * scrollableHeight();
    window.scrollTo({ top: dragStart.current.scrollY + deltaScroll });
  };

  const handleThumbPointerUp = (e: React.PointerEvent<HTMLImageElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== trackRef.current) return;
    scrollToPointer(e.clientY);
  };

  if (!visible) return null;

  return (
    <div
      ref={trackRef}
      onPointerDown={handleTrackPointerDown}
      className="fixed inset-y-4 right-1 z-[60] hidden w-20 cursor-pointer md:block"
    >
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-foreground/15" />
      <img
        src={tikiIcon}
        alt=""
        aria-hidden="true"
        onPointerDown={handleThumbPointerDown}
        onPointerMove={handleThumbPointerMove}
        onPointerUp={handleThumbPointerUp}
        className="absolute left-1/2 h-20 w-20 -translate-x-1/2 touch-none object-contain drop-shadow-md active:cursor-grabbing"
        style={{ top: top - MARGIN, cursor: dragging ? 'grabbing' : 'grab' }}
      />
    </div>
  );
}
