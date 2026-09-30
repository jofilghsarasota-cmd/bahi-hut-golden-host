import { type AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import bookPlank from '@assets/cliparts/btn-plank.png';

type BookARoomButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  size?: 'default' | 'lg';
};

// A carved-plank CTA standing in for the pill Button wherever "Book a Room"
// appears, so the booking action reads as a piece of the tiki bar itself.
export function BookARoomButton({ size = 'default', className, children, ...props }: BookARoomButtonProps) {
  return (
    <a
      {...props}
      className={cn(
        'group relative inline-flex shrink-0 items-center justify-center bg-cover bg-center bg-no-repeat font-serif font-bold tracking-wide text-koa transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        size === 'lg' ? 'h-16 min-w-[188px] px-9 text-lg' : 'h-11 min-w-[136px] px-6 text-sm',
        className,
      )}
      style={{ backgroundImage: `url(${bookPlank})` }}
    >
      <span className="relative z-10 -translate-y-[2px] drop-shadow-[0_1px_1px_rgba(255,255,255,0.45)]">
        {children ?? 'Book a Room'}
      </span>
    </a>
  );
}
