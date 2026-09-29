import type { CSSProperties } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { HeroCarousel, type HeroCarouselSlide } from '@/components/hero-carousel';
import { Clock, MapPin, GlassWater, ChevronDown } from 'lucide-react';
import maiTaiImg from '@assets/generated_images/mai-tai.jpg';
import backbarShelfImg from '@assets/generated_images/res/5.avif';
import barCounterImg from '@assets/generated_images/res/10.avif';
import exteriorLightsImg from '@assets/generated_images/res/12.jpg';
import alohaImg from '@assets/generated_images/res/3.avif';
import totemImg from '@assets/generated_images/res/2.avif';
import diningImg from '@assets/generated_images/res/7.avif';
import sconceImg from '@assets/generated_images/res/11.avif';
import entranceSignImg from '@assets/lost-at-sea-selects/entrance-tiki-sign.jpg';
import bartenderImg from '@assets/lost-at-sea-selects/bartender-pouring.jpg';
import tikiMugImg from '@assets/lost-at-sea-selects/tiki-mug-cocktail-1.jpg';
import tikiMotif from '@assets/bg.avif';

const motifStyle = { '--motif-image': `url(${tikiMotif})` } as CSSProperties;

// The hero carousel's three shots; kept out of the gallery below so the same
// photo never appears twice on the page.
const HERO_SLIDES: HeroCarouselSlide[] = [
  { src: exteriorLightsImg, alt: 'The Bahi Hut at night, wrapped in string lights', label: 'The Building' },
  { src: barCounterImg, alt: 'The bamboo bar counter under a glowing neon sign', label: 'The Bar' },
  { src: backbarShelfImg, alt: 'The backbar, stocked deep and lit in neon pink and blue', label: 'The Backbar' },
];

const GALLERY = [
  { src: alohaImg, alt: 'A carved and flower-crowned Aloha tiki mask by the entrance', span: 'md:row-span-2' },
  { src: totemImg, alt: 'A carved totem strung with café lights out front', span: '' },
  { src: diningImg, alt: 'Rattan chairs and low lighting in the dining room', span: '' },
  { src: tikiMugImg, alt: "A carved tiki mug cocktail on the bar, garnished and ready to serve", span: 'md:row-span-2' },
  { src: sconceImg, alt: 'A carved wall sconce glowing against the stone', span: '' },
];

export default function BahiHut() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero: a three-photo crossfade carousel (see HeroCarousel) rather
          than a single static shot or the home page's scroll-scrubbed
          video story - this page gets its own, simpler cinematic treatment. */}
      <section className="relative h-[92vh] min-h-[560px] flex items-end overflow-hidden bg-koa">
        <HeroCarousel slides={HERO_SLIDES} />
        <div className="absolute inset-0 bg-gradient-to-t from-koa via-koa/50 to-koa/10" />
        <div aria-hidden="true" className="grain absolute inset-0" />

        <div className="container relative z-10 mx-auto px-4 pb-20 md:pb-28">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="eyebrow text-white/90">Sarasota's Oldest Tiki Bar</span>
            <h1 className="type-display mt-4 text-white drop-shadow-md">The Bahi Hut</h1>
            <p className="mt-6 max-w-[55ch] text-lg md:text-xl text-white/85 leading-relaxed">
              Opened in 1954 alongside the Golden Host Resort, preserving authentic midcentury escapism one Mai Tai at
              a time.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <a href="https://ghresort.square.site/#items" target="_blank" rel="noopener noreferrer">
                  View Food Menu
                </a>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <a
                  href="https://maps.google.com/?q=4675+N+Tamiami+Trail+Sarasota+FL+34234"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Directions
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/70 animate-bounce hidden md:block"
        >
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* Since 1954: the legacy stat, paired with the exterior sign so the
          number lands next to the actual building it's describing. */}
      <section className="py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <Reveal>
            <span className="eyebrow">Est.</span>
            <div className="font-serif text-8xl md:text-9xl font-black leading-none mt-2 text-foreground">1954</div>
            <p className="mt-6 max-w-[50ch] text-lg text-muted-foreground leading-relaxed">
              Predating the modern tiki revival by decades, the Bahi Hut stands as one of the oldest continuously
              operating tiki bars in Florida. Unlike generic modern lounges, it retains its original, gloriously
              divey midcentury soul: dark wood paneling, low light, and drinks that are serious business.
            </p>
          </Reveal>
          <Reveal delayMs={150}>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src={entranceSignImg}
                alt="The Bahi Hut's glowing tiki-mask entrance sign at night"
                className="w-full h-auto object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* The legend: kept as the site's one long-form editorial read, now
          with a pull-quote and a second photo instead of a single float. */}
      <section className="py-20 md:py-28 px-4 bg-card border-y border-border">
        <div className="container mx-auto max-w-3xl">
          <Reveal>
            <span className="eyebrow">The House Drink</span>
            <h2 className="type-display mt-4 text-foreground" style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}>
              The Legend of the Sneaky Tiki
            </h2>
          </Reveal>

          <Reveal delayMs={100} className="mt-10 grid sm:grid-cols-2 gap-4">
            <img
              src={maiTaiImg}
              alt="The Bahi Hut's famous Mai Tai"
              className="w-full h-64 object-cover rounded-2xl shadow-lg"
            />
            <img
              src={bartenderImg}
              alt="A Bahi Hut bartender pouring a cocktail behind the bamboo bar"
              className="w-full h-64 object-cover rounded-2xl shadow-lg"
            />
          </Reveal>

          <Reveal delayMs={200} className="mt-10 space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              We are famous for one thing above all else: our Mai Tai. Often referred to affectionately as the
              "Sneaky Tiki," this potent concoction is so notoriously strong that we strictly enforce a limit of two
              per customer. It's a rite of passage for locals and a badge of honor for visitors.
            </p>
            <blockquote className="font-serif text-2xl md:text-3xl text-foreground font-medium leading-snug border-l-4 border-primary pl-6 py-2">
              Our recipe is a closely guarded secret, poured heavy and garnished simply. It's not sweet, it's not
              weak, and it demands respect.
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* Atmosphere gallery: real photography carrying the "immersive"
          weight instead of another block of copy. */}
      <section className="py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-6xl">
          <Reveal className="max-w-2xl">
            <span className="eyebrow">The Atmosphere</span>
            <h2 className="type-display mt-4 text-foreground" style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}>
              A room built to disappear into
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 md:auto-rows-[160px]">
            {GALLERY.map((item, i) => (
              <Reveal
                key={item.src}
                delayMs={i * 80}
                className={`group relative overflow-hidden rounded-2xl ${item.span}`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full min-h-40 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Visit: hours, location and the food/shop CTAs, on the same grain
          teal band used to close every other page. */}
      <section className="grain motif relative overflow-hidden bg-secondary px-4 py-16 text-secondary-foreground md:py-20" style={motifStyle}>
        <div className="container relative z-10 mx-auto max-w-5xl grid md:grid-cols-2 gap-12">
          <Reveal>
            <span className="eyebrow text-secondary-foreground/80">Visit</span>
            <h2 className="type-display mt-4" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}>
              Come find us
            </h2>
            <h3 className="mt-8 font-serif text-xl font-bold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 shrink-0" aria-hidden="true" /> Hours
            </h3>
            <ul className="space-y-3 text-secondary-foreground/90">
              <li className="flex justify-between border-b border-secondary-foreground/15 pb-3">
                <span>Monday – Thursday</span>
                <span className="font-medium">1:00 PM – 12:00 AM</span>
              </li>
              <li className="flex justify-between border-b border-secondary-foreground/15 pb-3">
                <span>Friday – Saturday</span>
                <span className="font-medium">1:00 PM – 2:00 AM</span>
              </li>
              <li className="flex justify-between border-b border-secondary-foreground/15 pb-3">
                <span>Sunday</span>
                <span className="font-medium">1:00 PM – 12:00 AM</span>
              </li>
            </ul>
            <div className="mt-4 p-4 rounded-xl border border-secondary-foreground/30">
              <p className="text-sm font-bold text-center">Happy Hour: Mon–Thu 1PM – 6PM</p>
            </div>
          </Reveal>

          <Reveal delayMs={150} className="space-y-8">
            <div>
              <h3 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 shrink-0" aria-hidden="true" /> Location
              </h3>
              <p className="text-secondary-foreground/85 mb-4">
                Adjacent to the Golden Host Resort.
                <br />
                4675 N Tamiami Trail, Sarasota, FL 34234
              </p>
              <Button variant="glass" asChild>
                <a
                  href="https://maps.google.com/?q=4675+N+Tamiami+Trail+Sarasota+FL+34234"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Directions
                </a>
              </Button>
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
                <GlassWater className="w-5 h-5 shrink-0" aria-hidden="true" /> Food & Drink
              </h3>
              <p className="text-secondary-foreground/85 mb-4">
                Order delicious bites directly from our partner kitchen while you sip.
              </p>
              <Button variant="glass" asChild>
                <a href="https://ghresort.square.site/#items" target="_blank" rel="noopener noreferrer">
                  View Food Menu
                </a>
              </Button>
            </div>

            <div className="pt-2">
              <p className="text-secondary-foreground/85 mb-4">
                Want a souvenir of your survival? Take home a custom tiki mug, including the famous Sneaky Tiki.
              </p>
              <Button variant="outline" className="border-secondary-foreground/40 text-secondary-foreground" asChild>
                <Link href="/shop">Shop Merch</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
