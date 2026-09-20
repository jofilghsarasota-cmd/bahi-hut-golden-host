import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Calendar, GlassWater } from 'lucide-react';
import heroImg from '@assets/generated_images/hero-tiki.jpg';
import poolImg from '@assets/generated_images/resort-pool.jpg';
import maiTaiImg from '@assets/generated_images/mai-tai.jpg';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImg} 
            alt="Bahi Hut Exterior" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/50 to-transparent" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary-foreground backdrop-blur-md border border-primary/30 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-sm font-medium tracking-wide">Sarasota's Historic Tiki Escape</span>
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-none drop-shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            Welcome to the<br />
            <span className="text-primary italic">Bahi Hut.</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-white/90 max-w-2xl mx-auto mb-10 font-medium drop-shadow-md animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            Pouring legendary Mai Tais since 1954. Experience authentic Old Florida charm at the Golden Host Resort.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <Button size="lg" className="text-lg px-8 py-6 rounded-full w-full sm:w-auto shadow-xl" asChild>
              <Link href="/bahi-hut">Explore The Bar</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full w-full sm:w-auto bg-white/10 text-white border-white/30 hover:bg-white hover:text-secondary backdrop-blur-sm" asChild>
              <a href="https://booking.hotelkeyapp.com/v2/index.html#/booking/search?pc=1055&property_id=dcb4a0ce-88b0-45b0-a4c8-e01bb6a6ad07&url=https%3A%2F%2Fwww.bahihut.com%2Fghresort" target="_blank" rel="noopener noreferrer">
                Book a Room
              </a>
            </Button>
          </div>
        </div>
      </section>

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
              <Button variant="link" className="text-primary font-bold text-lg p-0 h-auto group" asChild>
                <Link href="/bahi-hut" className="flex items-center gap-2">
                  Read our history <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative z-10 border-8 border-white">
                <img src={maiTaiImg} alt="Bahi Hut Mai Tai" className="w-full h-full object-cover" />
              </div>
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
                <Button className="w-full rounded-xl" asChild>
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
                <Button className="w-full rounded-xl" variant="secondary" asChild>
                  <Link href="/events">View Calendar</Link>
                </Button>
              </div>
            </div>

            {/* The Drink */}
            <div className="group relative rounded-3xl overflow-hidden bg-background shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full border border-border">
              <div className="aspect-video bg-primary p-8 flex items-center justify-center text-primary-foreground text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <h4 className="font-serif text-4xl font-black italic relative z-10">Limit 2<br/>Per Person</h4>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <GlassWater className="w-5 h-5" />
                  <span className="font-bold tracking-wide uppercase text-sm">The Legend</span>
                </div>
                <h3 className="font-serif text-3xl font-bold mb-4">The Sneaky Tiki</h3>
                <p className="text-muted-foreground mb-8 flex-1">
                  Our famous Mai Tai is notoriously strong and deliciously complex. We limit you to two for a reason. Grab a souvenir mug to remember it.
                </p>
                <Button className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                  <Link href="/shop">Shop Merch</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Location Banner */}
      <section className="bg-secondary text-secondary-foreground py-16 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">Find Your Escape</h2>
          <p className="text-xl mb-8 font-medium">4675 N Tamiami Trail, Sarasota FL 34234</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white hover:text-secondary rounded-full px-8" asChild>
              <a href="https://maps.google.com/?q=4675+N+Tamiami+Trail+Sarasota+FL+34234" target="_blank" rel="noopener noreferrer">
                Get Directions
              </a>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white hover:text-secondary rounded-full px-8" asChild>
              <a href="tel:9413555141">
                (941) 355-5141
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
