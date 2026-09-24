import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Music, Mic, PartyPopper } from 'lucide-react';

const WEEKLY_EVENTS = [
  {
    day: 'Sunday',
    title: 'Drag Queen Bingo',
    time: '7:30 PM - 9:30 PM',
    description: 'End your weekend with laughs, prizes, and fabulous performances. Always a packed house, arrive early.',
    icon: PartyPopper,
    tags: ['Bingo', 'Entertainment']
  },
  {
    day: 'Mon - Thu',
    title: 'Happy Hour',
    time: '1:00 PM - 6:00 PM',
    description: 'The best daytime escape in Sarasota. Specials on select drinks and a perfectly relaxed afternoon vibe.',
    icon: CalendarIcon,
    tags: ['Drink Specials']
  },
  {
    day: 'Thursday',
    title: 'Karaoke Night',
    time: '7:00 PM - 10:00 PM',
    description: 'Grab a Mai Tai for liquid courage and take the mic. A supportive, raucous crowd guaranteed.',
    icon: Mic,
    tags: ['Interactive']
  },
  {
    day: 'Friday',
    title: 'Live Music',
    time: '7:00 PM - 11:00 PM',
    description: 'Kick off the weekend with local bands playing surf rock, acoustic, and island vibes.',
    icon: Music,
    tags: ['Live Band']
  },
  {
    day: 'Saturday',
    title: 'Live Music',
    time: '7:00 PM - 11:00 PM',
    description: 'The party peaks on Saturday night with more live performances to soundtrack your evening.',
    icon: Music,
    tags: ['Live Band']
  }
];

export default function Events() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Get unique tags
  const allTags = Array.from(new Set(WEEKLY_EVENTS.flatMap(e => e.tags)));

  const filteredEvents = activeFilter 
    ? WEEKLY_EVENTS.filter(e => e.tags.includes(activeFilter))
    : WEEKLY_EVENTS;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <section className="bg-secondary pt-24 pb-24 text-center px-4 relative">
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
        <div className="container relative z-10 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl font-black text-white mb-6">
            Weekly Events
          </h1>
          <p className="text-xl text-white/90 font-medium max-w-2xl mx-auto">
            There's always something happening at the Hut. Note: Events and times are subject to change.
          </p>
        </div>
      </section>

      <section className="py-12 bg-card border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground mr-4">Filter:</span>
            <Button 
              variant={activeFilter === null ? "default" : "outline"} 
              onClick={() => setActiveFilter(null)}
            >
              All Events
            </Button>
            {allTags.map(tag => (
              <Button 
                key={tag}
                variant={activeFilter === tag ? "default" : "outline"}
                onClick={() => setActiveFilter(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid gap-6">
            {filteredEvents.map((event, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-md hover:shadow-lg transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="bg-primary/10 p-4 rounded-full text-primary shrink-0">
                  <event.icon className="w-8 h-8" />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                    <Badge variant="accent" className="w-fit">
                      {event.day}
                    </Badge>
                    <span className="text-primary font-bold text-sm tracking-wide tabular-nums">
                      {event.time}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground mb-2">{event.title}</h3>
                  <p className="text-muted-foreground">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No events match that filter.</p>
              <Button variant="link" onClick={() => setActiveFilter(null)} className="mt-4">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
