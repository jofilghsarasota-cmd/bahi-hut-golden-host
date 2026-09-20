import { Map, Sun, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LocalGuide() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <section className="bg-secondary pt-24 pb-24 text-center px-4 relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="container relative z-10 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl font-black text-white mb-6">
            The Local Guide
          </h1>
          <p className="text-xl text-white/90 font-medium max-w-2xl mx-auto">
            Make the most of your stay at the Golden Host Resort. Sarasota has a lot to offer outside the Hut (though we won't blame you if you stay put).
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-card p-8 rounded-3xl border border-border shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                <Sun className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-3xl font-bold mb-4">Beaches</h3>
              <p className="text-muted-foreground mb-6">
                We are a short drive from some of the best beaches in the country. Head west to Lido Key or Siesta Key for white quartz sand and Gulf Coast sunsets.
              </p>
              <ul className="space-y-3">
                <li className="flex justify-between items-center border-b border-border pb-2">
                  <span className="font-bold">Lido Key Beach</span>
                  <span className="text-sm text-muted-foreground">~10 min drive</span>
                </li>
                <li className="flex justify-between items-center border-b border-border pb-2">
                  <span className="font-bold">Siesta Key Beach</span>
                  <span className="text-sm text-muted-foreground">~20 min drive</span>
                </li>
              </ul>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-3xl font-bold mb-4">Arts & Culture</h3>
              <p className="text-muted-foreground mb-6">
                Sarasota is known as Florida's Cultural Coast. Explore world-class museums and gardens right in our backyard.
              </p>
              <ul className="space-y-3">
                <li className="flex justify-between items-center border-b border-border pb-2">
                  <span className="font-bold">The Ringling Museum</span>
                  <span className="text-sm text-muted-foreground">~5 min drive</span>
                </li>
                <li className="flex justify-between items-center border-b border-border pb-2">
                  <span className="font-bold">Sarasota Jungle Gardens</span>
                  <span className="text-sm text-muted-foreground">~5 min drive</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 bg-secondary text-secondary-foreground p-8 md:p-12 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="font-serif text-3xl font-bold mb-4 text-white">Need directions?</h3>
              <p className="text-secondary-foreground/80 max-w-md">
                Our front desk staff at the Golden Host Resort are happy to provide local recommendations, call taxis, or help you navigate the Sarasota transit system.
              </p>
            </div>
            <Button size="lg" className="rounded-full shrink-0" asChild>
              <a href="https://maps.google.com/?q=4675+N+Tamiami+Trail+Sarasota+FL+34234" target="_blank" rel="noopener noreferrer">
                <Map className="w-5 h-5 mr-2" /> Open Map
              </a>
            </Button>
          </div>

        </div>
      </section>
    </div>
  );
}
