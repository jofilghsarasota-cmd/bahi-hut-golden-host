import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useReveal } from '@/hooks/use-reveal';

interface RevealProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  // Stagger companions within the same section, in ms.
  delayMs?: number;
}

// Fades and lifts content in the first time it scrolls into view. Distinct
// from the home hero's .reveal* classes (index.css), which are wired to the
// scroll-scrub story's data-active group and don't apply on a static page.
export function Reveal({ as: Tag = 'div', children, className, delayMs = 0 }: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref}
      data-visible={visible}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={cn(
        'opacity-0 translate-y-8 transition-all duration-700 ease-out',
        'data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
