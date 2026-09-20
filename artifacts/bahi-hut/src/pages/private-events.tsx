import { Button } from '@/components/ui/button';
import { Users, PartyPopper, Briefcase, CalendarHeart, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivateEvents() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <section className="bg-secondary pt-24 pb-24 text-center px-4 relative">
        <div className="container relative z-10 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl font-black text-white mb-6">
            Private Events
          </h1>
          <p className="text-xl text-white/90 font-medium max-w-2xl mx-auto">
            Host your next gathering at Sarasota's most iconic venue. From intimate celebrations to large-scale festivals.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
            <div className="space-y-6">
              <h2 className="font-serif text-4xl font-bold text-foreground">A Venue Like No Other</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you're looking to reserve a corner of the bar for a birthday, rent out the entire lounge for a corporate mixer, or utilize the Golden Host Resort pool deck for a wedding or festival, we offer flexible spaces to accommodate 20 to 350 guests.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="rounded-full px-8" asChild>
                  <a href="https://www.bahihut.com/eventspace" target="_blank" rel="noopener noreferrer">
                    Inquire Online
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
                  <a href="tel:9413555141">
                    <Phone className="w-4 h-4 mr-2" /> (941) 355-5141
                  </a>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card border-none shadow-lg">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <CalendarHeart className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold">Weddings</h3>
                  <p className="text-sm text-muted-foreground">Unique midcentury backdrops for ceremonies and receptions.</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-none shadow-lg mt-8">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <PartyPopper className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold">Birthdays</h3>
                  <p className="text-sm text-muted-foreground">Reserve tables or private areas for your crew.</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-none shadow-lg -mt-8">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold">Corporate</h3>
                  <p className="text-sm text-muted-foreground">Break out of the boardroom with tropical networking.</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-none shadow-lg">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold">Group Stays</h3>
                  <p className="text-sm text-muted-foreground">Combine event space with resort room blocks.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="bg-card rounded-3xl p-8 md:p-12 border border-border shadow-xl text-center max-w-4xl mx-auto">
            <h3 className="font-serif text-3xl font-bold mb-4">Capacity Details</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              We can scale our offerings based on your needs. The bar interior provides an intimate, moody setting, while the resort pool deck and grounds open up possibilities for large-scale outdoor events and festivals.
            </p>
            <div className="inline-block bg-background px-6 py-3 rounded-full border border-border text-foreground font-bold tracking-wide">
              Accommodating parties of 20 up to 350+ guests.
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
