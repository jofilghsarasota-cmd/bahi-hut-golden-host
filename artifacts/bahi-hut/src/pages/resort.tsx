import { Button } from '@/components/ui/button';
import { BedDouble, Wifi, Waves, CheckCircle2 } from 'lucide-react';
import poolImg from '@assets/generated_images/resort-pool.jpg';
import heroImg from '@assets/generated_images/hero-tiki.jpg';

export default function Resort() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImg} 
            alt="Golden Host Resort Exterior" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="font-serif text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-md">
            Golden Host Resort
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium max-w-2xl mx-auto">
            Midcentury modern architecture meets authentic Old Florida hospitality. Fully renovated in 2022.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl relative z-10 border-8 border-white">
                <img src={poolImg} alt="50-foot heated saltwater pool" className="w-full h-auto aspect-square object-cover" />
              </div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary/20 rounded-full -z-10 blur-3xl"></div>
            </div>
            
            <div className="order-1 md:order-2 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/30 text-accent-foreground text-sm font-bold tracking-wide">
                Established 1954 • Renovated 2022
              </div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Your oasis on the Tamiami Trail.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The Golden Host Resort offers a uniquely Sarasota experience. Instead of a generic corporate hotel, stay in a lovingly preserved piece of midcentury modern architecture that celebrates the spirit of Old Florida.
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="flex flex-col gap-2">
                  <Waves className="w-8 h-8 text-primary" />
                  <h4 className="font-bold text-foreground">50-Foot Pool</h4>
                  <p className="text-sm text-muted-foreground">Heated saltwater pool surrounded by palms.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Wifi className="w-8 h-8 text-primary" />
                  <h4 className="font-bold text-foreground">Free Wi-Fi</h4>
                  <p className="text-sm text-muted-foreground">Stay connected throughout the property.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                  <h4 className="font-bold text-foreground">Check-In: 3PM</h4>
                  <p className="text-sm text-muted-foreground">Early check-in based on availability.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                  <h4 className="font-bold text-foreground">Check-Out: 11AM</h4>
                  <p className="text-sm text-muted-foreground">Late check-out upon request.</p>
                </div>
              </div>

              <div className="pt-8">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <a href="https://booking.hotelkeyapp.com/v2/index.html#/booking/search?pc=1055&property_id=dcb4a0ce-88b0-45b0-a4c8-e01bb6a6ad07&url=https%3A%2F%2Fwww.bahihut.com%2Fghresort" target="_blank" rel="noopener noreferrer">
                    <BedDouble className="w-5 h-5 mr-2" /> Book Your Stay
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tiki Fever Promo */}
      <section className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-serif text-4xl font-bold text-foreground mb-6">Home of Tiki Fever</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            The Golden Host Resort is the official home of Tiki Fever, Sarasota's premier celebration of Polynesian pop culture, midcentury style, and tropical cocktails.
          </p>
          <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
            <a href="https://www.tikifever.com" target="_blank" rel="noopener noreferrer">
              Discover Tiki Fever
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
