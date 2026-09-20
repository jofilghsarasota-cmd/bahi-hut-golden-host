import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, GlassWater } from 'lucide-react';
import maiTaiImg from '@assets/generated_images/mai-tai.jpg';

export default function BahiHut() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="bg-secondary pt-24 pb-32 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/bamboo-texture.png')] mix-blend-overlay"></div>
        <div className="container relative z-10 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-md">
            The Bahi Hut
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium">
            Sarasota's oldest operating tiki bar, preserving authentic midcentury escapism since 1954.
          </p>
        </div>
      </section>

      {/* Content Layout */}
      <section className="py-16 bg-background relative -mt-16 z-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-card rounded-3xl shadow-xl p-8 md:p-12 border border-border grid md:grid-cols-12 gap-12">
            
            {/* Left Col - Info */}
            <div className="md:col-span-4 space-y-8">
              <div>
                <h3 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="text-primary w-6 h-6" /> Hours
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex justify-between">
                    <span>Monday - Thursday</span>
                    <span className="font-medium text-foreground">1:00 PM - 12:00 AM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Friday - Saturday</span>
                    <span className="font-medium text-foreground">1:00 PM - 2:00 AM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-medium text-foreground">1:00 PM - 12:00 AM</span>
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-accent/20 rounded-xl border border-accent">
                  <p className="text-sm font-bold text-accent-foreground text-center">
                    Happy Hour: Mon-Thu 1PM - 6PM
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="text-primary w-6 h-6" /> Location
                </h3>
                <p className="text-muted-foreground mb-4">
                  Adjacent to the Golden Host Resort.<br />
                  4675 N Tamiami Trail<br />
                  Sarasota, FL 34234
                </p>
                <Button variant="outline" className="w-full rounded-xl" asChild>
                  <a href="https://maps.google.com/?q=4675+N+Tamiami+Trail+Sarasota+FL+34234" target="_blank" rel="noopener noreferrer">
                    Get Directions
                  </a>
                </Button>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">
                  <GlassWater className="text-primary w-6 h-6" /> Food & Drink
                </h3>
                <p className="text-muted-foreground mb-4">
                  Hungry? Order delicious bites directly from our partner kitchen while you sip.
                </p>
                <Button className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                  <a href="https://ghresort.square.site/#items" target="_blank" rel="noopener noreferrer">
                    View Food Menu
                  </a>
                </Button>
              </div>
            </div>

            {/* Right Col - Story */}
            <div className="md:col-span-8 prose prose-lg prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground max-w-none">
              <h2 className="text-4xl font-bold mb-6 text-secondary">The Legend of the Sneaky Tiki</h2>
              
              <div className="float-right w-64 ml-8 mb-4 rounded-xl overflow-hidden shadow-lg border-4 border-white transform rotate-2">
                <img src={maiTaiImg} alt="Famous Bahi Hut Mai Tai" className="w-full h-auto" />
              </div>

              <p>
                If you know Sarasota, you know the Bahi Hut. Opened in 1954 alongside the Golden Host Resort, it stands as one of the oldest continuously operating tiki bars in Florida, predating the modern tiki revival by decades.
              </p>
              
              <p>
                Unlike generic modern lounges, the Bahi Hut retains its original, gloriously divey midcentury soul. The wood paneling is dark, the lighting is low, and the drinks are serious business.
              </p>

              <h3 className="text-2xl font-bold mt-8 mb-4">The Mai Tai (Limit 2)</h3>
              <p>
                We are famous for one thing above all else: our Mai Tai. Often referred to affectionately as the "Sneaky Tiki," this potent concoction is so notoriously strong that we strictly enforce a limit of two per customer. It's a rite of passage for locals and a badge of honor for visitors.
              </p>
              <p>
                Our recipe is a closely guarded secret, poured heavy and garnished simply. It’s not sweet, it’s not weak, and it demands respect.
              </p>

              <div className="bg-secondary/10 p-6 rounded-2xl border border-secondary/20 mt-8 not-prose">
                <h4 className="font-serif text-xl font-bold text-secondary mb-2">Take the Hut Home</h4>
                <p className="text-muted-foreground mb-4">Want a souvenir of your survival? We sell custom tiki mugs, including the famous Sneaky Tiki.</p>
                <Button variant="outline" asChild>
                  <Link href="/shop">Shop Merch</Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
