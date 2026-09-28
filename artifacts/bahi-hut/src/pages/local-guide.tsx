import type { CSSProperties } from 'react';
import { Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import tikiMotif from '@assets/bg.avif';

const motifStyle = { '--motif-image': `url(${tikiMotif})` } as CSSProperties;

type GuideEntry = { name: string; distance: string };
type GuideCategory = {
  label: string;
  ruleClass: string;
  heading: string;
  body: string;
  entries: GuideEntry[];
};

// Same copy as before, restructured as itinerary entries rather than a pair
// of matching icon cards.
const CATEGORIES: GuideCategory[] = [
  {
    label: 'Beaches',
    ruleClass: 'bg-secondary',
    heading: 'Gulf Coast sand, ten minutes out',
    body: "We're a short drive from some of the best beaches in the country. Head west to Lido Key or Siesta Key for white quartz sand and Gulf Coast sunsets.",
    entries: [
      { name: 'Lido Key Beach', distance: '~10 min drive' },
      { name: 'Siesta Key Beach', distance: '~20 min drive' },
    ],
  },
  {
    label: 'Arts & Culture',
    ruleClass: 'bg-accent',
    heading: "Florida's Cultural Coast",
    body: 'Sarasota is known as the Cultural Coast. Explore world-class museums and gardens right in our backyard.',
    entries: [
      { name: 'The Ringling Museum', distance: '~5 min drive' },
      { name: 'Sarasota Jungle Gardens', distance: '~5 min drive' },
    ],
  },
];

export default function LocalGuide() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero: left-aligned and set on the plain grain surface, not a flat
          color band, so this page reads as its own thing rather than a
          repeat of Shop's or Events' centered hero. */}
      <section className="grain motif relative overflow-hidden pt-28 pb-16 px-4 md:pt-36 md:pb-24" style={motifStyle}>
        <div className="container relative z-10 mx-auto max-w-4xl">
          <span className="eyebrow animate-in fade-in slide-in-from-bottom-2 duration-700">
            Around the Golden Host
          </span>
          <h1 className="type-display mt-4 text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            The Local Guide
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Make the most of your stay at the Golden Host Resort. Sarasota has a lot to offer outside the Hut
            (though we won't blame you if you stay put).
          </p>
        </div>
      </section>

      {/* Itinerary entries: a colored rule and category label stand in for
          the repeated icon-in-circle card, and each place is a row rather
          than a boxed card. */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-5xl px-4 space-y-16 md:space-y-20">
          {CATEGORIES.map((cat) => (
            <div key={cat.label} className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-16">
              <div>
                <div className={`h-1 w-12 rounded-full mb-4 ${cat.ruleClass}`} />
                <span className="eyebrow">{cat.label}</span>
                <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">{cat.heading}</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">{cat.body}</p>
              </div>
              <ul className="divide-y divide-border">
                {cat.entries.map((entry) => (
                  <li key={entry.name} className="flex items-baseline justify-between gap-4 py-4">
                    <span className="font-serif text-lg font-semibold text-foreground">{entry.name}</span>
                    <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{entry.distance}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Directions CTA, given the same grain texture as the hero so the
          page opens and closes on matching surfaces. */}
      <section className="grain relative overflow-hidden bg-secondary px-4 py-16 text-secondary-foreground md:py-20">
        <div className="container relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <h3 className="font-serif text-2xl font-bold md:text-3xl">Need directions?</h3>
            <p className="mt-3 max-w-md text-secondary-foreground/80">
              Our front desk staff at the Golden Host Resort are happy to provide local recommendations, call
              taxis, or help you navigate the Sarasota transit system.
            </p>
          </div>
          <Button size="lg" className="shrink-0" asChild>
            <a href="https://maps.google.com/?q=4675+N+Tamiami+Trail+Sarasota+FL+34234" target="_blank" rel="noopener noreferrer">
              <Map className="mr-2 h-5 w-5" /> Open Map
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
