import { useCallback, useRef, type MouseEvent, type CSSProperties } from 'react';

const PERSPECTIVE = 800;
const MAX_DEG = 12;
const TRANSITION_OUT = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';

export function useTilt() {
  const ref = useRef<HTMLElement>(null);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transition = 'none';
    el.style.transform =
      `perspective(${PERSPECTIVE}px) rotateX(${-y * MAX_DEG}deg) rotateY(${x * MAX_DEG}deg) scale3d(1.03, 1.03, 1.03)`;
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = TRANSITION_OUT;
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }, []);

  const style: CSSProperties = {
    transformStyle: 'preserve-3d',
    willChange: 'transform',
  };

  return { ref, onMouseMove, onMouseLeave, style } as const;
}
