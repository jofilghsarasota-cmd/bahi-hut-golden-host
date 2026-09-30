import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { BookARoomButton } from '@/components/book-a-room-button';
import { ArrowRight, MapPin, Calendar, Clock, Users, GlassWater, Sparkles, PartyPopper } from 'lucide-react';
import { useTilt } from '@/hooks/use-tilt';
import AutoplayHero, { type LoungeBeat } from '@/components/autoplay-hero';
import WalkInSequence from '@/components/walk-in-sequence';
import EscapeDive from '@/components/escape-dive';
import FlamingBowl from '@/components/flaming-bowl';
import Reviews from '@/components/reviews';
import tikiMug from '@assets/generated_images/icons/tiki_mug_icon2.png';
import poolImg from '@assets/lost-at-sea-selects/guests-lifestyle.jpg';
import eventsImg from '@assets/lost-at-sea-selects/band-vocalist.jpg';
import privateEventsImg from '@assets/lost-at-sea-selects/interior-crowd.jpg';
import menuImg from '@assets/menu.avif';
import menu2Img from '@assets/menu2.avif';

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
  return { open: false, label: '1PM - 12AM' };
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
      <BookARoomButton
        href="https://booking.hotelkeyapp.com/v2/index.html#/booking/search?pc=1055&property_id=dcb4a0ce-88b0-45b0-a4c8-e01bb6a6ad07&url=https%3A%2F%2Fwww.bahihut.com%2Fghresort"
        target="_blank"
        rel="noopener noreferrer"
        size="lg"
        className="w-full sm:w-auto"
      />
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

function TiltMenuCard({ img, onZoom }: { img: { src: string; alt: string }; onZoom: (v: { src: string; alt: string }) => void }) {
  const { ref, onMouseMove, onMouseLeave, style } = useTilt();
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onClick={() => onZoom(img)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={style}
      className="group relative rounded-3xl overflow-hidden shadow-2xl border border-border/50 cursor-zoom-in text-left"
    >
      <img
        src={img.src}
        alt={img.alt}
        className="w-full h-full object-cover"
      />
    </button>
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

// Autonomous waypoints the tiki mug drifts between when no cursor is present.
const TIKI_WAYPOINTS = [
  { xPct: 0.08, yPct: 0.15 },
  { xPct: 0.75, yPct: 0.10 },
  { xPct: 0.85, yPct: 0.65 },
  { xPct: 0.45, yPct: 0.80 },
  { xPct: 0.15, yPct: 0.55 },
  { xPct: 0.55, yPct: 0.25 },
];

export default function Home() {
  const tikiRef = useRef<HTMLImageElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const tikiPos = useRef({ x: 0, y: 0 });
  const tikiCursor = useRef<{ x: number; y: number } | null>(null);
  const tikiRaf = useRef<number | null>(null);
  const waypointIdx = useRef(0);
  const tikiScale = useRef(1);
  const initialized = useRef(false);
  const [zoomedImg, setZoomedImg] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const ease = 0.012;
    const cursorEase = 0.035;
    let wpProgress = 0;

    const getWaypointTarget = () => {
      const section = sectionRef.current;
      if (!section) return { x: 200, y: 200 };
      const w = section.offsetWidth;
      const h = section.offsetHeight;
      const wp = TIKI_WAYPOINTS[waypointIdx.current % TIKI_WAYPOINTS.length];
      return { x: wp.xPct * w, y: wp.yPct * h };
    };

    if (!initialized.current) {
      const t = getWaypointTarget();
      tikiPos.current = { x: t.x, y: t.y };
      initialized.current = true;
    }

    const tick = () => {
      const el = tikiRef.current;
      if (!el) { tikiRaf.current = requestAnimationFrame(tick); return; }

      const cursor = tikiCursor.current;
      let targetX: number, targetY: number, lerpRate: number;

      if (cursor) {
        targetX = cursor.x;
        targetY = cursor.y;
        lerpRate = cursorEase;
      } else {
        const wp = getWaypointTarget();
        targetX = wp.x;
        targetY = wp.y;
        lerpRate = ease;
      }

      tikiPos.current.x += (targetX - tikiPos.current.x) * lerpRate;
      tikiPos.current.y += (targetY - tikiPos.current.y) * lerpRate;

      const dx = targetX - tikiPos.current.x;
      const dy = targetY - tikiPos.current.y;
      const rot = dx * 0.12;

      const targetScale = cursor ? 1.6 : 1;
      tikiScale.current += (targetScale - tikiScale.current) * 0.03;
      const s = tikiScale.current;

      el.style.transform = `translate(${tikiPos.current.x - 90}px, ${tikiPos.current.y - 90}px) rotate(${rot}deg) scale(${s})`;
      el.style.opacity = '0.2';

      if (!cursor && Math.abs(dx) < 2 && Math.abs(dy) < 2) {
        wpProgress++;
        if (wpProgress > 60) {
          waypointIdx.current = (waypointIdx.current + 1) % TIKI_WAYPOINTS.length;
          wpProgress = 0;
        }
      } else {
        wpProgress = 0;
      }

      tikiRaf.current = requestAnimationFrame(tick);
    };

    tikiRaf.current = requestAnimationFrame(tick);
    return () => { if (tikiRaf.current) cancelAnimationFrame(tikiRaf.current); };
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <AutoplayHero
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

            <div className="reveal relative mt-12 md:mt-24 lg:mt-32 w-full" style={delay(950)}>
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
      </AutoplayHero>

      {/* Intro / Vibe Section */}
      <section
        ref={sectionRef}
        className="py-24 bg-background relative overflow-hidden"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          tikiCursor.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
        }}
        onMouseLeave={() => { tikiCursor.current = null; }}
      >
        {/* Ambient tropical leaf parallax */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' fill='none'><path d='M60 10c-8 20-30 35-50 40 25 0 42 15 50 35 8-20 25-35 50-35-20-5-42-20-50-40z' fill='currentColor' opacity='0.5'/></svg>")`,
            backgroundSize: '120px 120px',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Tiki mug — follows cursor or roams autonomously */}
        <img
          ref={tikiRef}
          src={tikiMug}
          alt=""
          aria-hidden
          className="absolute pointer-events-none select-none blur-[1.5px]"
          style={{
            top: 0,
            left: 0,
            width: 180,
            height: 'auto',
            opacity: 0.2,
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
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

      {/* Guest Reviews */}
      <Reviews />

      {/* Cross-Promo Grid */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* The Resort */}
            <div className="group relative rounded-3xl overflow-hidden bg-background shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full border border-border">
              <div className="relative aspect-video overflow-hidden">
                <img src={poolImg} alt="Guests enjoying the Golden Host Resort poolside" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out bg-gradient-to-t from-koa/90 via-koa/70 to-transparent p-4 pt-8">
                  <p className="flex items-center gap-2 text-sm font-semibold text-white"><Sparkles className="w-4 h-4 text-primary" /> 50-foot heated saltwater pool</p>
                </div>
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
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={eventsImg}
                  alt="A vocalist performing live under the Bahi Hut's thatched roof"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-secondary/60" />
                <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-secondary-foreground">
                  <h4 className="font-serif text-3xl font-bold rotate-[-2deg] drop-shadow-md">Tiki Fever &<br/>Live Music</h4>
                </div>
                <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out bg-gradient-to-t from-koa/90 via-koa/70 to-transparent p-4 pt-8">
                  <p className="flex items-center gap-2 text-sm font-semibold text-white"><GlassWater className="w-4 h-4 text-primary" /> Drag Queen Bingo every Sunday</p>
                </div>
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
              <div className="grain relative aspect-video overflow-hidden">
                <img
                  src={privateEventsImg}
                  alt="A crowd filling the Bahi Hut's lounge during a private party"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="rounded-2xl bg-primary px-6 py-4 text-center text-primary-foreground shadow-lg">
                    <h4 className="font-serif text-4xl font-black italic">20 to 350<br/>Guests</h4>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out bg-gradient-to-t from-koa/90 via-koa/70 to-transparent p-4 pt-8">
                  <p className="flex items-center gap-2 text-sm font-semibold text-white"><PartyPopper className="w-4 h-4 text-primary" /> Weddings, birthdays & pool deck parties</p>
                </div>
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

      {/* Menu Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="font-bold tracking-widest uppercase text-sm text-primary mb-3">What We Pour</p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
                The Menu
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                Classic tiki drinks and island bites. Our legendary Mai Tai is two-per-person for a reason.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
              {[{ src: menuImg, alt: 'Bahi Hut drink menu' }, { src: menu2Img, alt: 'Bahi Hut food menu' }].map((img) => (
                <TiltMenuCard key={img.alt} img={img} onZoom={setZoomedImg} />
              ))}
            </div>

            {/* Lightbox */}
            {zoomedImg && (
              <div
                role="dialog"
                aria-label="Menu image preview"
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                onClick={() => setZoomedImg(null)}
                onKeyDown={(e) => { if (e.key === 'Escape') setZoomedImg(null); }}
              >
                <img
                  src={zoomedImg.src}
                  alt={zoomedImg.alt}
                  className="max-w-[95vw] max-h-[95vh] object-contain rounded-xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  className="absolute top-4 right-4 text-white/80 hover:text-white text-4xl leading-none"
                  onClick={() => setZoomedImg(null)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            )}

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
