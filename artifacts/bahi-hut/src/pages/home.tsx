import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Calendar, Clock, Users } from 'lucide-react';
import ScrollScrubHero, { type LoungeBeat } from '@/components/scroll-scrub-hero';
import WalkInSequence from '@/components/walk-in-sequence';
import EscapeDive from '@/components/escape-dive';
import FlamingBowl from '@/components/flaming-bowl';
import poolImg from '@assets/generated_images/resort-pool.jpg';

// Delay for a `.reveal*` element inside a hold (see index.css).
const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

// Bar hours (as listed on the Bahi Hut page), in Sarasota time:
// 1 PM to midnight, or to 2 AM on Friday and Saturday nights.
function getOpenStatus(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(now);
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? '';
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const lateNight = (day: string) => day === 'Fri' || day === 'Sat';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const yesterday = days[(days.indexOf(weekday) + 6) % 7];

  if (hour >= 13) {
    return { open: true, label: lateNight(weekday) ? 'Open now until 2 AM' : 'Open now until midnight' };
  }
  if (hour < 2 && lateNight(yesterday)) {
    return { open: true, label: 'Open now until 2 AM' };
  }
  return { open: false, label: 'Opens today at 1 PM' };
}

function OpenStatus() {
  const [status, setStatus] = useState(getOpenStatus);

  useEffect(() => {
    const id = window.setInterval(() => setStatus(getOpenStatus()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-white backdrop-blur-md border border-primary/30 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <span className="relative flex h-3 w-3">
        {status.open && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-3 w-3 ${status.open ? 'bg-primary' : 'bg-white/50'}`}></span>
      </span>
      <span className="text-sm font-medium tracking-wide">{status.label}</span>
    </div>
  );
}

function HeroActions() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Button size="lg" className="w-full sm:w-auto" asChild>
        <Link href="/bahi-hut">Explore The Bar</Link>
      </Button>
      <Button size="lg" variant="glass" className="w-full sm:w-auto" asChild>
        <a href="https://booking.hotelkeyapp.com/v2/index.html#/booking/search?pc=1055&property_id=dcb4a0ce-88b0-45b0-a4c8-e01bb6a6ad07&url=https%3A%2F%2Fwww.bahihut.com%2Fghresort" target="_blank" rel="noopener noreferrer">
          Book a Room
        </a>
      </Button>
    </div>
  );
}

// Text revealed while the camera moves through the lounge. Each beat is
// timed to what's on screen: the room reveal, then the shelves of mugs.
const LOUNGE_BEATS: LoungeBeat[] = [
  {
    lines: ["Sarasota's oldest", 'operating tiki bar.'],
    body: 'Pouring since before the tiki revival had a name.',
  },
  {
    lines: ['Every mug up there', 'is a souvenir', 'waiting to happen.'],
    body: 'Custom tiki mugs, including the famous Sneaky Tiki.',
  },
];

// Headlines of the two holds, each line rising out of its own mask.
const HOLD_HEADLINE = ["Sarasota's Historic", 'Tiki Escape'];
const BAR_HEADLINE = ['The Sneaky', 'Tiki'];

function RevealLines({ lines, startMs }: { lines: string[]; startMs: number }) {
  return lines.map((line, i) => (
    <span key={line} className="reveal-line">
      <span style={{ ...delay(startMs), '--i': i } as CSSProperties}>{line}</span>
    </span>
  ));
}

// A drink coaster whose ring of text states the house rule.
function LimitCoaster() {
  return (
    <div aria-hidden="true" className="coaster-in relative w-24 h-24 md:w-36 md:h-36">
      <div className="coaster-ripple absolute inset-0 rounded-full border-2 border-primary" />
      <div className="absolute inset-0 rounded-full bg-primary shadow-[0_10px_40px_-8px_hsl(var(--primary)/0.7)]" />
      <div className="absolute inset-[9%] rounded-full border border-white/40" />
      <svg viewBox="0 0 200 200" className="coaster-spin absolute inset-0 w-full h-full">
        <defs>
          <path id="coaster-ring" d="M100,100 m-64,0 a64,64 0 1,1 128,0 a64,64 0 1,1 -128,0" />
        </defs>
        <text fill="white" fontSize="14" fontWeight="600" textLength="398" lengthAdjust="spacing" className="font-sans">
          <textPath href="#coaster-ring">limit two per guest ✦ strictly enforced ✦</textPath>
        </text>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-serif font-black italic text-white text-4xl md:text-6xl">
        2
      </span>
    </div>
  );
}

// Ending of the lounge scene, shown on the blurred bar.
function BarHold() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <h2 className="font-serif font-light text-white text-6xl md:text-8xl lg:text-9xl leading-[0.95] tracking-[-0.015em] drop-shadow-[0_2px_30px_rgba(0,0,0,0.5)] [font-variation-settings:'opsz'_144]">
          <RevealLines lines={BAR_HEADLINE} startMs={200} />
        </h2>
        <div className="mt-6 flex justify-center md:mt-0 md:absolute md:-bottom-10 md:right-2">
          <LimitCoaster />
        </div>
      </div>

      <p className="reveal mt-10 max-w-xl text-balance text-lg md:text-xl text-white/90 leading-relaxed" style={delay(550)}>
        Our Mai Tai is famously strong. We limit you to two.
      </p>

      <p className="reveal mt-4 flex items-center gap-2 text-sm md:text-base text-white/70" style={delay(700)}>
        <Clock aria-hidden="true" className="w-4 h-4 text-primary" />
        Happy Hour Mon–Thu, 1–6 PM
      </p>

      <div className="reveal mt-10 w-full flex flex-col sm:flex-row items-center justify-center gap-4" style={delay(1000)}>
        <Button size="lg" className="w-full sm:w-auto" asChild>
          <a href="https://ghresort.square.site/#items" target="_blank" rel="noopener noreferrer">
            View Food Menu
          </a>
        </Button>
        <Button size="lg" variant="glass" className="w-full sm:w-auto" asChild>
          <Link href="/shop">Shop Mugs</Link>
        </Button>
      </div>
    </div>
  );
}

// Text revealed as the camera drops from the neighborhood to the door.
const ESCAPE_BEATS: LoungeBeat[] = [
  {
    lines: ['Right on the', 'Tamiami Trail.'],
    body: 'Next door to the Golden Host Resort.',
  },
  {
    lines: ['Look for the', 'thatched roofs.'],
    body: 'Walk in under the palms. The Mai Tais are waiting.',
  },
];

const ESCAPE_HEADLINE = ['Find Your', 'Escape'];

// Ending of the dive, shown on the blurred entrance.
function EscapeHold() {
  return (
    <div className="flex flex-col items-center">
      <h2 className="font-serif font-light text-white text-6xl md:text-8xl lg:text-9xl leading-[0.95] tracking-[-0.015em] drop-shadow-[0_2px_30px_rgba(0,0,0,0.5)] [font-variation-settings:'opsz'_144]">
        <RevealLines lines={ESCAPE_HEADLINE} startMs={200} />
      </h2>

      <p className="reveal mt-8 flex flex-col sm:flex-row items-center gap-2 text-lg md:text-xl text-white/90" style={delay(550)}>
        <MapPin aria-hidden="true" className="w-5 h-5 shrink-0 text-primary" />
        <span>
          4675 N Tamiami Trail, <span className="whitespace-nowrap">Sarasota FL 34234</span>
        </span>
      </p>

      <div className="reveal mt-10 w-full flex flex-col sm:flex-row items-center justify-center gap-4" style={delay(850)}>
        <Button size="lg" className="w-full sm:w-auto" asChild>
          <a href="https://maps.google.com/?q=4675+N+Tamiami+Trail+Sarasota+FL+34234" target="_blank" rel="noopener noreferrer">
            Get Directions
          </a>
        </Button>
        <Button size="lg" variant="glass" className="w-full sm:w-auto" asChild>
          <a href="tel:9413555141">(941) 355-5141</a>
        </Button>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <ScrollScrubHero
        endContent={
          <div className="relative flex flex-col items-center">
            <span
              aria-hidden="true"
              className="hero-year-outline pointer-events-none select-none absolute left-1/2 top-0 md:top-1/2 -translate-x-1/2 -translate-y-[96%] md:-translate-y-[58%] font-serif font-black text-[42vw] md:text-[18rem] lg:text-[24rem]"
            >
              1954
            </span>

            <h2 className="relative font-serif font-normal text-white text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-[-0.01em] max-w-3xl drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] [font-variation-settings:'opsz'_144]">
              <RevealLines lines={HOLD_HEADLINE} startMs={350} />
            </h2>

            <p className="relative mt-6 flex items-center gap-4 font-serif italic text-xl md:text-2xl text-white/90">
              <span aria-hidden="true" className="reveal-rule origin-right h-px w-10 md:w-16 bg-white/50" style={delay(700)} />
              <span className="reveal" style={delay(650)}>
                since 1954 <span aria-hidden="true">🌺</span>
              </span>
              <span aria-hidden="true" className="reveal-rule origin-left h-px w-10 md:w-16 bg-white/50" style={delay(700)} />
            </p>

            <div className="reveal relative mt-12 w-full" style={delay(950)}>
              <HeroActions />
            </div>
          </div>
        }
        loungeBeats={LOUNGE_BEATS}
        loungeEndContent={<BarHold />}
      >
        <div>
          <OpenStatus />

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-none drop-shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            Welcome to the<br />
            <span className="text-primary italic">Bahi Hut.</span>
          </h1>

          <p className="text-lg md:text-2xl text-white/90 max-w-2xl mx-auto mb-10 font-medium drop-shadow-md animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            Pouring legendary Mai Tais since 1954. Experience authentic Old Florida charm at the Golden Host Resort.
          </p>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <HeroActions />
          </div>
        </div>
      </ScrollScrubHero>

      {/* Intro / Vibe Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
                More than a bar.<br />An institution.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Step off the Tamiami Trail and into a perfectly preserved slice of midcentury paradise. Since 1954, the Bahi Hut has been Sarasota's premier destination for strong drinks, low lighting, and immaculate vibes.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you're a local regular or a weary traveler checking into the Golden Host Resort next door, our legendary Mai Tais are waiting.
              </p>
              <Button variant="link" className="h-auto p-0 text-lg font-bold group" asChild>
                <Link href="/bahi-hut" className="flex items-center gap-2">
                  Read our history <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <FlamingBowl className="aspect-[4/5] rounded-3xl shadow-2xl z-10 border-8 border-white" />
              <div className="absolute top-1/2 -right-8 w-48 h-48 bg-accent rounded-full -z-10 mix-blend-multiply opacity-50 blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-primary/20 rounded-full -z-10 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-Promo Grid */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* The Resort */}
            <div className="group relative rounded-3xl overflow-hidden bg-background shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full border border-border">
              <div className="aspect-video overflow-hidden">
                <img src={poolImg} alt="Golden Host Pool" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <MapPin className="w-5 h-5" />
                  <span className="font-bold tracking-wide uppercase text-sm">Stay With Us</span>
                </div>
                <h3 className="font-serif text-3xl font-bold mb-4">Golden Host Resort</h3>
                <p className="text-muted-foreground mb-8 flex-1">
                  Renovated in 2022. Enjoy our 50-foot heated saltwater pool, free WiFi, and vintage Florida architecture right next door.
                </p>
                <Button className="w-full" asChild>
                  <Link href="/resort">Explore the Resort</Link>
                </Button>
              </div>
            </div>

            {/* Events */}
            <div className="group relative rounded-3xl overflow-hidden bg-background shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full border border-border">
              <div className="aspect-video bg-secondary p-8 flex items-center justify-center text-secondary-foreground text-center">
                <h4 className="font-serif text-3xl font-bold rotate-[-2deg] drop-shadow-md">Tiki Fever &<br/>Live Music</h4>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <Calendar className="w-5 h-5" />
                  <span className="font-bold tracking-wide uppercase text-sm">Happening Now</span>
                </div>
                <h3 className="font-serif text-3xl font-bold mb-4">Weekly Events</h3>
                <p className="text-muted-foreground mb-8 flex-1">
                  Drag Queen Bingo on Sundays, Karaoke Thursdays, and live music all weekend. There's always a party at the hut.
                </p>
                <Button className="w-full" variant="secondary" asChild>
                  <Link href="/events">View Calendar</Link>
                </Button>
              </div>
            </div>

            {/* Private Events */}
            <div className="group relative rounded-3xl overflow-hidden bg-background shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full border border-border">
              <div className="grain aspect-video bg-primary p-8 flex items-center justify-center text-primary-foreground text-center relative overflow-hidden">
                <h4 className="font-serif text-4xl font-black italic relative z-10">20 to 350<br/>Guests</h4>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <Users className="w-5 h-5" />
                  <span className="font-bold tracking-wide uppercase text-sm">Host With Us</span>
                </div>
                <h3 className="font-serif text-3xl font-bold mb-4">Private Events</h3>
                <p className="text-muted-foreground mb-8 flex-1">
                  Reserve a corner of the bar for a birthday, rent the whole lounge for a mixer, or take over the resort pool deck for a wedding.
                </p>
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                  <Link href="/private-events">Plan an Event</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The real walk from the street to the door, leading into directions. */}
      <WalkInSequence />

      {/* Aerial dive from the neighborhood down to the door, leading into directions. */}
      <EscapeDive beats={ESCAPE_BEATS}>
        <EscapeHold />
      </EscapeDive>
    </div>
  );
}
