import { useEffect, useRef, type CSSProperties } from 'react';
import flamingBowlImg from '@assets/generated_images/res/6.jpg';

// A still photo of the flaming pineapple bowl, brought to life with CSS: the
// flame's glow flickers, its light plays over the bartender and the bar, and
// embers drift up from the bowl. Nothing moves until the photo is on screen.
//
// Positions below are percentages of the 4:5 frame, with the photo cropped
// at object-position 45% (the flame sits at ~29% across, its base at ~72%).

// Seeded so the embers are the same on every render (and on the server).
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const rand = seeded(1954);
const EMBERS = Array.from({ length: 16 }, () => ({
  x: 18 + rand() * 22,
  rise: 28 + rand() * 34,
  drift: (rand() - 0.5) * 16,
  size: 2 + rand() * 3,
  duration: 1.8 + rand() * 2.2,
  delay: -rand() * 4,
}));

export default function FlamingBowl({ className = '' }: { className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        frame.dataset.inview = String(entry.isIntersecting);
      },
      { threshold: 0.25 },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} data-inview="false" className={`fire relative overflow-hidden bg-[hsl(20_40%_6%)] ${className}`}>
      <img
        src={flamingBowlImg}
        alt="A Bahi Hut bartender lighting a flaming pineapple bowl next to a tiki mug"
        loading="lazy"
        decoding="async"
        className="fire-photo absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: '45% 50%' }}
      />
      <div aria-hidden="true" className="fire-cast absolute inset-0 pointer-events-none" />
      <div aria-hidden="true" className="fire-glow absolute pointer-events-none" />
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className="fire-ember"
            style={
              {
                left: `${e.x}%`,
                '--rise': `${e.rise}cqh`,
                '--drift': `${e.drift}cqw`,
                '--size': `${e.size}px`,
                animationDuration: `${e.duration}s`,
                animationDelay: `${e.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
