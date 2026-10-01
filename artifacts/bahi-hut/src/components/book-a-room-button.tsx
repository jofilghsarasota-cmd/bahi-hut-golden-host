import { type AnchorHTMLAttributes, type CSSProperties } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import bookPlank from '@assets/cliparts/btn2.png';
import barFrame from '@assets/cliparts/btn1.png';

type PlankButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  size?: 'default' | 'lg';
  /** 'solid' is a filled carved board; 'frame' is a hollow rope-and-bamboo outline. */
  variant?: 'solid' | 'frame';
  /** Render the border-image styling onto a single child (e.g. wouter's Link) instead of an <a>. */
  asChild?: boolean;
};

// Border-image lets the carved-bamboo art stretch its straight edges to fit
// any button box while keeping the rope corners undistorted, so the plank
// never gets cropped the way a background-image cover/contain would.
const BORDER_SLICE = '300 fill';

const sizeStyles: Record<NonNullable<PlankButtonProps['size']>, { borderWidth: string; className: string }> = {
  default: { borderWidth: '18px 26px', className: 'min-h-[44px] min-w-[136px] text-sm' },
  lg: { borderWidth: '24px 36px', className: 'min-h-[64px] min-w-[188px] text-lg' },
};

// A carved-plank CTA standing in for the pill Button wherever a call to
// action appears, so it reads as a piece of the tiki bar itself.
export function PlankButton({
  size = 'default',
  variant = 'solid',
  asChild = false,
  className,
  children,
  ...props
}: PlankButtonProps) {
  const plankImage = variant === 'solid' ? bookPlank : barFrame;
  const { borderWidth, className: sizeClassName } = sizeStyles[size];
  const Comp = asChild ? Slot : 'a';

  const style: CSSProperties = {
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderWidth,
    borderImageSource: `url(${plankImage})`,
    borderImageSlice: BORDER_SLICE,
    borderImageWidth: 1,
    borderImageRepeat: 'stretch',
  };

  return (
    <Comp
      {...props}
      className={cn(
        'group relative inline-flex shrink-0 items-center justify-center font-serif font-bold tracking-wide text-koa transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        sizeClassName,
        size === 'lg' ? 'px-9' : 'px-6',
        className,
      )}
      style={style}
    >
      <span className={cn(
          'relative z-10 -translate-y-[2px]',
          variant === 'solid'
            ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]'
            : 'drop-shadow-[0_1px_1px_rgba(255,255,255,0.45)]',
        )}>
        {children}
      </span>
    </Comp>
  );
}

type BookARoomButtonProps = Omit<PlankButtonProps, 'variant'>;

export function BookARoomButton({ children, ...props }: BookARoomButtonProps) {
  return (
    <PlankButton {...props} variant="solid">
      {children ?? 'Book a Room'}
    </PlankButton>
  );
}
