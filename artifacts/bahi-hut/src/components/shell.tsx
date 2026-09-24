import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Palmtree, MapPin, Calendar, ShoppingBag, GlassWater, BedDouble, Info, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { themeForPath } from '@/lib/page-theme';
import logoImg from '@assets/generated_images/logo/BAHI_HUT_LOGO.jpg';

export function Shell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const theme = themeForPath(location);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { href: '/', label: 'Home', icon: Palmtree },
    { href: '/bahi-hut', label: 'The Bar', icon: GlassWater },
    { href: '/resort', label: 'The Resort', icon: BedDouble },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/private-events', label: 'Private Events', icon: Info },
    { href: '/shop', label: 'Shop', icon: ShoppingBag },
    { href: '/local-guide', label: 'Local Guide', icon: Map },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background selection:bg-primary/20 selection:text-foreground">
      {/* Navigation */}
      <header data-theme={theme} className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 lg:px-8 flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
            <img src={logoImg} alt="Bahi Hut Cocktail Lounge" className="h-16 w-16 rounded-full object-contain" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold tracking-wide transition-colors hover:text-primary ${
                  location === link.href ? 'text-primary' : 'text-foreground/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="font-bold tracking-wide rounded-full px-6">
              <a href="https://booking.hotelkeyapp.com/v2/index.html#/booking/search?pc=1055&property_id=dcb4a0ce-88b0-45b0-a4c8-e01bb6a6ad07&url=https%3A%2F%2Fwww.bahihut.com%2Fghresort" target="_blank" rel="noopener noreferrer">
                Book a Room
              </a>
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-[80px] left-0 w-full bg-background border-b shadow-xl animate-in slide-in-from-top-2">
            <nav className="flex flex-col p-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 text-lg font-medium p-2 rounded-md ${
                    location === link.href ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-muted'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t">
                <Button asChild className="w-full font-bold text-lg h-12 rounded-xl">
                  <a href="https://booking.hotelkeyapp.com/v2/index.html#/booking/search?pc=1055&property_id=dcb4a0ce-88b0-45b0-a4c8-e01bb6a6ad07&url=https%3A%2F%2Fwww.bahihut.com%2Fghresort" target="_blank" rel="noopener noreferrer">
                    Book a Room
                  </a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main data-theme={theme} className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer data-theme="lounge" className="bg-secondary text-secondary-foreground pt-16 pb-8 border-t-4 border-primary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="inline-flex items-center mb-6">
                <img src={logoImg} alt="Bahi Hut Cocktail Lounge" className="h-28 w-28 rounded-full object-contain" />
              </Link>
              <p className="text-secondary-foreground/80 mb-6 max-w-sm">
                Sarasota's oldest tiki bar and midcentury modern resort. Serving legendary Mai Tais since 1954.
              </p>
              <div className="flex flex-col space-y-2 text-sm text-secondary-foreground/80">
                <a href="tel:9413555141" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="font-semibold text-white">P:</span> (941) 355-5141
                </a>
                <a href="https://maps.google.com/?q=4675+N+Tamiami+Trail+Sarasota+FL+34234" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  4675 N Tamiami Trail, Sarasota FL 34234
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold mb-6 text-white">Explore</h3>
              <ul className="space-y-3">
                <li><Link href="/bahi-hut" className="text-secondary-foreground/80 hover:text-white transition-colors">The Bar</Link></li>
                <li><Link href="/resort" className="text-secondary-foreground/80 hover:text-white transition-colors">Golden Host Resort</Link></li>
                <li><Link href="/events" className="text-secondary-foreground/80 hover:text-white transition-colors">Events & Live Music</Link></li>
                <li><Link href="/private-events" className="text-secondary-foreground/80 hover:text-white transition-colors">Private Events</Link></li>
                <li><Link href="/shop" className="text-secondary-foreground/80 hover:text-white transition-colors">Shop Merch</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold mb-6 text-white">Hours</h3>
              <ul className="space-y-3 text-secondary-foreground/80">
                <li className="flex justify-between border-b border-white/10 pb-2">
                  <span>Happy Hour</span>
                  <span className="text-white">Mon-Thu 1pm-6pm</span>
                </li>
                <li className="flex justify-between border-b border-white/10 pb-2">
                  <span>Resort Check-in</span>
                  <span className="text-white">3:00 PM</span>
                </li>
                <li className="flex justify-between border-b border-white/10 pb-2">
                  <span>Resort Check-out</span>
                  <span className="text-white">11:00 AM</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold mb-6 text-white">Sister Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="https://ghresort.square.site/#items" target="_blank" rel="noopener noreferrer" className="text-secondary-foreground/80 hover:text-white transition-colors flex items-center gap-2">
                    Food Ordering ↗
                  </a>
                </li>
                <li>
                  <a href="https://www.tikifever.com" target="_blank" rel="noopener noreferrer" className="text-secondary-foreground/80 hover:text-white transition-colors flex items-center gap-2">
                    Tiki Fever ↗
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-secondary-foreground/60">
            <p>© {new Date().getFullYear()} Bahi Hut & Golden Host Resort. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="https://www.bahihut.com/privacypolicy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <span className="italic">Note: Some imagery is conceptual illustration.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
