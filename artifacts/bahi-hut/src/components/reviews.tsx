import { type CSSProperties } from 'react';
import { Star, Flame, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import tikiMotif from '@assets/bg.avif';

const motifStyle = { '--motif-image': `url(${tikiMotif})` } as CSSProperties;

const GOOGLE_REVIEWS_URL =
  'https://www.google.com/maps/place/Bahi+Hut+Tiki+Cocktail+Lounge/@27.3732672,-82.5567966,17z/data=!3m1!4b1!4m6!3m5!1s0x88c33fe7702eefbd:0x5fb0150d842253bc!8m2!3d27.3732672!4d-82.5542217!16s%2Fg%2F1v2pq_gs';

type Review = {
  quote: string;
  author: string;
  timeAgo: string;
  featured?: boolean;
};

const REVIEWS: Review[] = [
  {
    quote: "We came for the history and stayed for the delicious cocktails. Who could pass up Florida's oldest tiki bar? (opened in 1954)",
    author: 'Bob',
    timeAgo: '6 months ago',
  },
  {
    quote: "This place has been here since the 1950s and it's both a timewarp throwback and an absolute experience. Rum is currency here; even the standard old fashioned is made with rum, and it's pretty good by the way.",
    author: 'Eddie C.',
    timeAgo: '11 months ago',
  },
  {
    quote: 'Tyler is amazing! What a spectacular bartender with excellent suggestions. The drinks were perfect and a lovely stop in Sarasota — we are so lucky to have this institution in the city.',
    author: 'Sandy P.',
    timeAgo: '2 months ago',
    featured: true,
  },
  {
    quote: 'The drinks were OUTSTANDING! Such a cool vibe and decor. Paul is a great bartender! We will definitely be back for happy hour and music in the evenings. 100% recommend this little historical Florida bar.',
    author: 'Chris H.',
    timeAgo: '7 months ago',
  },
  {
    quote: 'Such a fun time at this iconic tiki bar — the most historic one in all of Florida! Tyler took care of us with the best drinks.',
    author: 'Lyn V.',
    timeAgo: '3 months ago',
  },
];

function Stars({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5 text-amber-400" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${cls} fill-current`} />
      ))}
    </div>
  );
}

function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function Avatar({ name, featured = false }: { name: string; featured?: boolean }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-serif font-bold shrink-0 border ${
        featured
          ? 'w-11 h-11 text-base border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.18)]'
          : 'w-10 h-10 text-sm border-primary/50'
      }`}
      style={{
        background: featured
          ? 'radial-gradient(circle at 32% 28%, hsl(var(--primary) / 0.75), hsl(var(--primary)) 130%)'
          : 'radial-gradient(circle at 32% 28%, hsl(24 40% 32%), hsl(20 45% 14%) 75%)',
        color: featured ? 'hsl(var(--primary-foreground))' : 'hsl(38 40% 90%)',
      }}
    >
      {initial}
    </span>
  );
}

function ReviewCard({ review, featured = false }: { review: Review; featured?: boolean }) {
  const body = (
    <div
      className={`group relative flex h-full flex-col rounded-2xl border transition-all duration-300 ${
        featured
          ? 'border-white/10 bg-gradient-to-br from-koa/85 to-secondary/85 p-8'
          : 'border-white/15 bg-white/8 p-6 backdrop-blur-sm hover:border-white/30 hover:bg-white/12'
      }`}
    >
      {featured && (
        <Flame
          className="absolute -top-3.5 right-6 h-7 w-7 text-primary drop-shadow-[0_2px_6px_hsl(var(--primary)/0.5)]"
          fill="currentColor"
          aria-hidden="true"
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <Stars size={featured ? 'lg' : 'sm'} />
        <GoogleG className={`w-5 h-5 transition-opacity ${featured ? 'text-primary/70' : 'text-secondary-foreground/35 group-hover:text-secondary-foreground/60'}`} />
      </div>

      <p
        className={`flex-1 leading-relaxed text-secondary-foreground/90 ${
          featured ? 'text-lg md:text-xl font-serif italic' : 'text-sm'
        }`}
      >
        &ldquo;{review.quote}&rdquo;
      </p>

      <div className={`relative z-10 mt-6 flex items-center gap-3 pt-4 border-t ${featured ? 'border-primary/20' : 'border-white/10'}`}>
        <Avatar name={review.author} featured={featured} />
        <div className="flex flex-col">
          <span className="font-bold text-sm text-secondary-foreground">{review.author}</span>
          <span className="text-xs text-secondary-foreground/50">{review.timeAgo}</span>
        </div>
      </div>
    </div>
  );

  if (!featured) return body;

  return (
    <div className="h-full rounded-[20px] p-[3px] bg-gradient-to-br from-primary/70 via-bamboo/25 to-primary/15 shadow-[0_18px_44px_-18px_hsl(20_60%_5%/0.55)]">
      {body}
    </div>
  );
}

export default function Reviews() {

  return (
    <section className="grain motif relative overflow-hidden bg-secondary px-4 py-24 text-secondary-foreground" style={motifStyle}>
      <div className="container relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="eyebrow text-secondary-foreground/70">Loved Since 1954</span>
          <h2 className="font-serif mt-4 text-4xl md:text-5xl font-bold">What Sarasota&rsquo;s Saying</h2>

          <div
            className="mt-6 inline-flex items-center gap-4 rounded-full border border-primary/35 px-6 py-3"
            style={{
              background: 'linear-gradient(180deg, hsl(20 38% 7% / 0.35), hsl(20 38% 7% / 0.2))',
              boxShadow: 'inset 0 1px 0 hsl(var(--secondary-foreground) / 0.08)',
            }}
          >
            <div className="flex items-center gap-2 pr-4 border-r border-secondary-foreground/15">
              <Stars size="lg" />
              <span className="font-serif font-bold text-lg">4.6</span>
              <span className="text-secondary-foreground/55 text-xs">· 1,295 reviews</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary-foreground/75">
              <GoogleG className="w-3.5 h-3.5 text-primary" />
              Verified on Google
            </div>
          </div>
        </div>

        {/* Infinite marquee — duplicated cards for seamless loop */}
        <div className="overflow-hidden -mx-4">
          <div className="marquee-track gap-5 px-4" style={{ '--marquee-duration': '50s' } as CSSProperties}>
            {[...REVIEWS, ...REVIEWS].map((review, i) => (
              <div
                key={`${review.author}-${i}`}
                className="shrink-0 w-[85vw] sm:w-[340px] lg:w-[380px]"
              >
                <ReviewCard review={review} featured={review.featured} />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <Button size="lg" variant="default" asChild>
            <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer">
              Read More on Google
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
