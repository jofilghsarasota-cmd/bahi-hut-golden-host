import type { CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import tikiMotif from '@assets/bg.avif';
import venueImg from '@assets/lost-at-sea-selects/interior-thatched-roof.jpg';

const motifStyle = { '--motif-image': `url(${tikiMotif})` } as CSSProperties;

type VenueType = { title: string; description: string };

const VENUE_TYPES: VenueType[] = [
  { title: 'Weddings', description: 'Unique midcentury backdrops for ceremonies and receptions.' },
  { title: 'Birthdays', description: 'Reserve tables or private areas for your crew.' },
  { title: 'Corporate', description: 'Break out of the boardroom with tropical networking.' },
  { title: 'Group Stays', description: 'Combine event space with resort room blocks.' },
];

export default function PrivateEvents() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero: dark grain surface, left-aligned, matching Events instead of
          the flat teal band shared by every page before this pass. */}
      <section className="grain motif relative overflow-hidden pt-28 pb-16 px-4 md:pt-36 md:pb-24" style={motifStyle}>
        <div className="container relative z-10 mx-auto max-w-4xl">
          <span className="eyebrow animate-in fade-in slide-in-from-bottom-2 duration-700">Host With Us</span>
          <h1 className="type-display mt-4 text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Private Events
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Host your next gathering at Sarasota's most iconic venue, from intimate celebrations to large-scale
            festivals.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div className="space-y-6">
              <h2 className="font-serif text-4xl font-bold text-foreground">A Venue Like No Other</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you're looking to reserve a corner of the bar for a birthday, rent out the entire lounge
                for a corporate mixer, or use the Golden Host Resort pool deck for a wedding or festival, we offer
                flexible spaces to accommodate 20 to 350 guests.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <a href="https://www.bahihut.com/eventspace" target="_blank" rel="noopener noreferrer">
                    Inquire Online
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="tel:9413555141">
                    <Phone className="w-4 h-4 mr-2" /> (941) 355-5141
                  </a>
                </Button>
              </div>
            </div>

            {/* Venue photo above the types list: real atmosphere from a
                packed night under the thatched roof, in place of a fifth
                text card. */}
            <div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={venueImg}
                  alt="Guests filling the Bahi Hut's lounge during a live event"
                  className="w-full h-56 object-cover md:h-64"
                />
              </div>
              <ul className="mt-8 divide-y divide-border md:border-t md:border-border">
                {VENUE_TYPES.map((venue) => (
                  <li key={venue.title} className="py-6">
                    <h3 className="font-serif text-xl font-bold text-foreground">{venue.title}</h3>
                    <p className="mt-2 text-muted-foreground leading-relaxed">{venue.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Capacity: the single most persuasive fact gets the big-number
          treatment, on the same grain teal band used to close other pages. */}
      <section className="grain relative overflow-hidden bg-secondary px-4 py-16 text-secondary-foreground md:py-20">
        <div className="container relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center md:flex-row md:items-center md:gap-16 md:text-left">
          <div className="flex shrink-0 items-baseline gap-3">
            <span className="font-serif text-6xl font-black md:text-7xl">20–350</span>
            <span className="eyebrow">guests</span>
          </div>
          <p className="max-w-md text-secondary-foreground/80">
            The bar interior suits an intimate, moody gathering; the resort pool deck and grounds open up for
            large-scale outdoor events and festivals.
          </p>
          <Button size="lg" variant="glass" className="shrink-0" asChild>
            <a href="tel:9413555141">
              <Phone className="mr-2 h-5 w-5" /> Call to Inquire
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
