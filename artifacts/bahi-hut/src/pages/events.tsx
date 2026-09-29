import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import backbarImg from '@assets/lost-at-sea-selects/band-drummer.jpg';
import eventsHeroImg from '@assets/generated_images/MKD_2793.jpg';

type WeeklyEvent = {
  day: string;
  title: string;
  time: string;
  description: string;
  tags: string[];
  // The one recurring night the copy itself singles out ("always a packed
  // house"); it gets a distinct treatment instead of blending into the list.
  signature?: boolean;
};

// Grouped so the default (unfiltered) view can read as "every week" vs. "the
// weekend" instead of five identical rows in a row.
const WEEKNIGHTS: WeeklyEvent[] = [
  {
    day: 'Sunday',
    title: 'Drag Queen Bingo',
    time: '7:30 – 9:30 PM',
    description: 'End your weekend with laughs, prizes, and fabulous performances. Always a packed house, arrive early.',
    tags: ['Bingo', 'Entertainment'],
    signature: true,
  },
  {
    day: 'Mon – Thu',
    title: 'Happy Hour',
    time: '1:00 – 6:00 PM',
    description: 'The best daytime escape in Sarasota. Specials on select drinks and a perfectly relaxed afternoon vibe.',
    tags: ['Drink Specials'],
  },
  {
    day: 'Thursday',
    title: 'Karaoke Night',
    time: '7:00 – 10:00 PM',
    description: 'Grab a Mai Tai for liquid courage and take the mic. A supportive, raucous crowd guaranteed.',
    tags: ['Interactive'],
  },
];

const WEEKEND: WeeklyEvent[] = [
  {
    day: 'Friday',
    title: 'Live Music',
    time: '7:00 – 11:00 PM',
    description: 'Kick off the weekend with local bands playing surf rock, acoustic, and island vibes.',
    tags: ['Live Band'],
  },
  {
    day: 'Saturday',
    title: 'Live Music',
    time: '7:00 – 11:00 PM',
    description: 'The party peaks on Saturday night with more live performances to soundtrack your evening.',
    tags: ['Live Band'],
  },
];

const WEEKLY_EVENTS: WeeklyEvent[] = [...WEEKNIGHTS, ...WEEKEND];

function pillClass(active: boolean) {
  return cn(active ? '' : 'text-muted-foreground hover:text-foreground');
}

function EventRow({ event }: { event: WeeklyEvent }) {
  return (
    <li className="py-6">
      <div className="flex items-baseline justify-between gap-4">
        <span className="eyebrow">{event.day}</span>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-primary">{event.time}</span>
      </div>
      <h3 className="mt-2 font-serif text-2xl font-bold text-foreground">{event.title}</h3>
      <p className="mt-2 max-w-[60ch] text-muted-foreground leading-relaxed">{event.description}</p>
    </li>
  );
}

// The one recurring night the copy itself singles out, called out as its
// own card instead of a bordered row inside the divided list - a border-left
// accent on a `divide-y` item reads as a stray, unclosed rectangle rather
// than a deliberate highlight.
function SignatureCallout({ event }: { event: WeeklyEvent }) {
  return (
    <div className="rounded-2xl bg-primary/10 border border-primary/25 p-6 md:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <span className="eyebrow">Signature Night</span>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-primary">{event.time}</span>
      </div>
      <h3 className="mt-2 font-serif text-3xl font-bold text-foreground">{event.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{event.day}</p>
      <p className="mt-3 max-w-[60ch] text-muted-foreground leading-relaxed">{event.description}</p>
    </div>
  );
}

function GroupHeading({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 pt-10 pb-2 first:pt-0">
      <span className="eyebrow text-muted-foreground">{children}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  );
}

export default function Events() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const img = imgRef.current;
    if (!hero || !img) return;

    const onScroll = () => {
      const { top, height } = hero.getBoundingClientRect();
      const progress = -top / (height + window.innerHeight);
      img.style.transform = `translateY(${progress * 40}%)`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const allTags = Array.from(new Set(WEEKLY_EVENTS.flatMap((e) => e.tags)));
  const filteredEvents = activeFilter ? WEEKLY_EVENTS.filter((e) => e.tags.includes(activeFilter)) : WEEKLY_EVENTS;
  const signatureEvent = WEEKLY_EVENTS.find((e) => e.signature);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero: dark, grain-textured surface instead of a flat teal band -
          reads as after-dark nightlife rather than a repeat of the old
          centered hero used on every page. */}
      <section ref={heroRef} className="relative overflow-hidden pt-28 pb-16 px-4 md:pt-36 md:pb-20">
        <img
          ref={imgRef}
          src={eventsHeroImg}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full object-cover object-center will-change-transform"
          style={{ height: '140%', top: '-20%' }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-amber-900/60 via-amber-700/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />
        <div className="container relative z-10 mx-auto max-w-4xl">
          <span className="eyebrow animate-in fade-in slide-in-from-bottom-2 duration-700 text-white/70">Live at the Hut</span>
          <h1 className="type-display mt-4 text-white animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Weekly Events
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg text-white/80 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            There's always something happening at the Hut. Events and times are subject to change.
          </p>
        </div>
      </section>

      <section className="pt-8 pb-20 md:pb-28">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-[1fr_320px] gap-10 md:gap-14 items-start">
            <div className="max-w-4xl">
              {/* Filter: quiet pill toggles instead of a row of bordered buttons. */}
              <div className="flex flex-wrap items-center gap-2 border-b border-border pb-8 mb-4">
                <Button size="sm" variant={activeFilter === null ? 'default' : 'ghost'} className={pillClass(activeFilter === null)} onClick={() => setActiveFilter(null)}>
                  All Events
                </Button>
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    size="sm"
                    variant={activeFilter === tag ? 'default' : 'ghost'}
                    className={pillClass(activeFilter === tag)}
                    onClick={() => setActiveFilter(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>

              {/* Schedule as a divided list: day/title/time are a real weekly
                  sequence, so a schedule-board layout is earned here (unlike a
                  generic numbered list). Grouped into weeknights/weekend only
                  in the default view - a filtered subset is usually a couple
                  of items, where grouping would just add noise. */}
              {activeFilter === null ? (
                <>
                  {signatureEvent && <SignatureCallout event={signatureEvent} />}
                  <GroupHeading>Every Week</GroupHeading>
                  <ul className="divide-y divide-border">
                    {WEEKNIGHTS.filter((event) => !event.signature).map((event) => (
                      <EventRow key={event.day + event.title} event={event} />
                    ))}
                  </ul>
                  <GroupHeading>The Weekend</GroupHeading>
                  <ul className="divide-y divide-border">
                    {WEEKEND.map((event) => (
                      <EventRow key={event.day + event.title} event={event} />
                    ))}
                  </ul>
                </>
              ) : (
                <ul className="divide-y divide-border">
                  {filteredEvents.map((event) => (
                    <EventRow key={event.day + event.title} event={event} />
                  ))}
                </ul>
              )}

              {filteredEvents.length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-lg text-muted-foreground">No events match that filter.</p>
                  <Button variant="link" onClick={() => setActiveFilter(null)} className="mt-4">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Companion photo: real atmosphere instead of the empty column
                the schedule used to leave on wide screens, and it stays put
                as the list scrolls past it. */}
            <div className="md:sticky md:top-24">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={backbarImg}
                  alt="A drummer performing live under the Bahi Hut's thatched roof"
                  className="w-full h-64 md:h-[420px] object-cover"
                />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Come see it for yourself - the bar's open every night, no cover, no reservations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA: same compact teal band used to close every other
          page, so Events stops feeling like the one unfinished page. */}
      <section className="grain relative overflow-hidden bg-secondary px-4 py-16 text-secondary-foreground md:py-20">
        <div className="container relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <h3 className="font-serif text-2xl font-bold md:text-3xl">Don't miss it</h3>
            <p className="mt-3 max-w-md text-secondary-foreground/80">
              No cover, no reservations - just show up. Doors open at 1PM daily, and the lineup above runs every
              week, rain or shine.
            </p>
          </div>
          <Button size="lg" variant="glass" className="shrink-0" asChild>
            <a
              href="https://maps.google.com/?q=4675+N+Tamiami+Trail+Sarasota+FL+34234"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
