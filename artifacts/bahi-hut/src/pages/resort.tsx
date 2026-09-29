import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { BedDouble, Wifi, Waves, CheckCircle2 } from 'lucide-react';
import heroImg from '@assets/generated_images/_MRZ1902.JPG';
import poolImg from '@assets/lost-at-sea-selects/pool-tiki-totem.jpg';

const AMENITIES = [
  { icon: Waves, title: '50-Foot Pool', description: 'Heated saltwater pool surrounded by palms.' },
  { icon: Wifi, title: 'Free Wi-Fi', description: 'Stay connected throughout the property.' },
  { icon: CheckCircle2, title: 'Check-In: 3PM - 10PM', description: 'Early check-in based on availability.' },
  { icon: CheckCircle2, title: 'Check-Out: 11AM', description: 'Late check-out upon request.' },
];

export default function Resort() {
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

  return (
    <div className="flex flex-col">
      <section ref={heroRef} className="relative h-[92vh] min-h-[560px] flex items-end overflow-hidden bg-secondary">
        <img
          ref={imgRef}
          src={heroImg}
          alt="Golden Host Resort Lobby"
          className="absolute inset-0 w-full object-cover will-change-transform"
          style={{ height: '140%', top: '-20%' }}
        />
        {/* base dark-to-secondary scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/50 to-secondary/10" />
        {/* warm amber highlight at the bottom edge */}
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-amber-900/55 via-amber-700/20 to-transparent" />
        {/* side vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />
        <div aria-hidden="true" className="grain absolute inset-0" />

        <div className="container relative z-10 mx-auto px-4 pb-20 md:pb-28">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="eyebrow text-white/90">Adjacent to the Bahi Hut</span>
            <h1 className="font-serif text-5xl md:text-7xl font-black text-white mt-4 drop-shadow-md">
              Golden Host Resort
            </h1>
            <p className="mt-6 max-w-[55ch] text-lg md:text-xl text-white/85 leading-relaxed">
              Midcentury modern architecture meets authentic Old Florida hospitality. Fully renovated in 2022.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <a
                  href="https://booking.hotelkeyapp.com/v2/index.html#/booking/search?pc=1055&property_id=dcb4a0ce-88b0-45b0-a4c8-e01bb6a6ad07&url=https%3A%2F%2Fwww.bahihut.com%2Fghresort"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BedDouble className="w-5 h-5 mr-2" /> Book Your Stay
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Intro: photo + copy only - the booking CTA now lives in the hero,
          so it isn't repeated here, and amenities get their own section
          below instead of crowding this one. */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <Reveal as="div" className="order-2 md:order-1 relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl relative z-10 border-8 border-white">
                <img src={poolImg} alt="Guests relaxing poolside by a carved tiki totem" className="w-full h-auto aspect-square object-cover" />
              </div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary/20 rounded-full -z-10 blur-3xl"></div>
            </Reveal>

            <Reveal as="div" delayMs={150} className="order-1 md:order-2 space-y-8">
              <span className="eyebrow">Stay With Us</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Your oasis on the Tamiami Trail.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The Golden Host Resort offers a uniquely Sarasota experience. Instead of a generic corporate hotel, stay in a lovingly preserved piece of midcentury modern architecture that celebrates the spirit of Old Florida.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Amenities: its own divided strip (echoing the Events schedule
          layout) instead of a cramped 2x2 grid squeezed under the intro
          copy - gives the property specifics room to breathe. */}
      <section className="py-20 md:py-24 px-4 bg-card border-y border-border">
        <div className="container mx-auto max-w-6xl">
          <Reveal>
            <span className="eyebrow">At the Property</span>
          </Reveal>
          <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 divide-border">
            {AMENITIES.map((item, i) => (
              <Reveal
                key={item.title}
                delayMs={i * 80}
                className="py-6 sm:py-0 sm:px-6 first:pl-0 sm:border-l sm:border-border first:sm:border-l-0"
              >
                <item.icon className="w-8 h-8 text-primary" aria-hidden="true" />
                <h4 className="mt-3 font-bold text-foreground">{item.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Tiki Fever Promo: grain-textured teal band, matching the CTA
          treatment used to close out the other pages. */}
      <section className="grain relative overflow-hidden bg-secondary px-4 py-16 text-secondary-foreground md:py-20">
        <div className="container relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <h2 className="font-serif text-2xl font-bold md:text-3xl">Home of Tiki Fever</h2>
            <p className="mt-3 max-w-md text-secondary-foreground/80">
              Sarasota's premier celebration of Polynesian pop culture, midcentury style, and tropical cocktails,
              hosted right here at the Golden Host.
            </p>
          </div>
          <Button size="lg" variant="glass" className="shrink-0" asChild>
            <a href="https://www.tikifever.com" target="_blank" rel="noopener noreferrer">
              Discover Tiki Fever
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
