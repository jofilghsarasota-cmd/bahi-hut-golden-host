import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, Palmtree, MapPin, Calendar, ShoppingBag, GlassWater, BedDouble, Info, Map, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useHeaderState } from '@/hooks/use-header-state';
import { themeForPath } from '@/lib/page-theme';
import { cn } from '@/lib/utils';
import logoImg from '@assets/generated_images/logo/BAHI_HUT_LOGO.jpg';

const BOOKING_URL =
  'https://booking.hotelkeyapp.com/v2/index.html#/booking/search?pc=1055&property_id=dcb4a0ce-88b0-45b0-a4c8-e01bb6a6ad07&url=https%3A%2F%2Fwww.bahihut.com%2Fghresort';

const primaryLinks = [
  { href: '/bahi-hut', label: 'The Bar', icon: GlassWater },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/resort', label: 'Resort', icon: BedDouble },
  { href: '/shop', label: 'Shop', icon: ShoppingBag },
];
const moreLinks = [
  { href: '/private-events', label: 'Private Events', icon: Info },
  { href: '/local-guide', label: 'Local Guide', icon: Map },
];
const mobileLinks = [{ href: '/', label: 'Home', icon: Palmtree }, ...primaryLinks, ...moreLinks];

// Desktop link: a torch underline that draws in on hover and stays on the
// current page.
function navLinkClass(active: boolean, overlaid: boolean) {
  return cn(
    'relative inline-flex h-9 items-center px-3 text-sm font-semibold tracking-wide transition-colors',
    'after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-primary after:transition-transform after:duration-300 motion-reduce:after:transition-none',
    active ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100',
    overlaid ? 'text-white/85 hover:text-white' : active ? 'text-foreground' : 'text-foreground/70 hover:text-foreground',
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const theme = themeForPath(location);
  const isHome = location === '/';
  const { overlaid, scrolled } = useHeaderState(isHome);
  const moreActive = moreLinks.some((link) => link.href === location);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background selection:bg-primary/20 selection:text-foreground">
      {/* Fixed over the home hero (transparent until it scrolls past), sticky elsewhere. */}
      <header
        data-theme={theme}
        className={cn(
          'top-0 z-50 w-full border-b transition-[background-color,border-color,color] duration-300 motion-reduce:transition-none',
          isHome ? 'fixed inset-x-0' : 'sticky',
          overlaid
            ? 'border-transparent bg-transparent text-white'
            : 'border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70',
        )}
      >
        <div
          className={cn(
            'container mx-auto flex items-center justify-between px-4 transition-[height] duration-300 motion-reduce:transition-none lg:px-8',
            scrolled ? 'h-14' : 'h-16',
          )}
        >
          <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
            <img
              src={logoImg}
              alt="Bahi Hut Cocktail Lounge"
              className={cn(
                'rounded-full object-contain transition-[width,height] duration-300 motion-reduce:transition-none',
                scrolled ? 'h-10 w-10' : 'h-12 w-12',
              )}
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-6 lg:flex">
            <NavigationMenu>
              <NavigationMenuList className="gap-1 space-x-0">
                {primaryLinks.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink asChild active={location === link.href}>
                      <Link href={link.href} className={navLinkClass(location === link.href, overlaid)}>
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      navLinkClass(moreActive, overlaid),
                      'bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:hover:bg-transparent',
                      overlaid && 'hover:text-white focus:text-white data-[state=open]:text-white',
                    )}
                  >
                    More
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-60 gap-1 p-2">
                      {moreLinks.map((link) => (
                        <li key={link.href}>
                          <NavigationMenuLink asChild active={location === link.href}>
                            <Link
                              href={link.href}
                              className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted focus:bg-muted focus:outline-none',
                                location === link.href ? 'text-primary' : 'text-popover-foreground',
                              )}
                            >
                              <link.icon className="h-4 w-4 text-primary" />
                              {link.label}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <Button asChild>
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                Book a Room
              </a>
            </Button>
          </div>

          {/* Mobile Nav: Radix Dialog gives focus trap, Esc and scroll lock. */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className={cn('lg:hidden [&_svg]:size-6', overlaid && 'text-white hover:bg-white/10')}
              >
                <Menu />
              </Button>
            </SheetTrigger>
            {/* The sheet portals to <body>, so it carries its own theme. */}
            <SheetContent data-theme="lounge" side="right" className="grain flex w-[85vw] flex-col gap-0 p-0 sm:max-w-sm">
              <SheetHeader className="px-6 pb-4 pt-6 text-left">
                <SheetTitle className="eyebrow">Bahi Hut · Since 1954</SheetTitle>
                <SheetDescription className="sr-only">Site navigation</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4">
                {mobileLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-4 rounded-xl px-3 py-3 font-serif text-2xl font-semibold transition-colors',
                      location === link.href ? 'bg-primary/15 text-primary' : 'text-foreground/85 hover:bg-muted',
                    )}
                  >
                    <link.icon className="h-5 w-5 shrink-0" />
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="grid gap-3 border-t border-border p-6">
                <Button asChild size="lg" className="w-full">
                  <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                    Book a Room
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full">
                  <a href="tel:9413555141">
                    <Phone /> (941) 355-5141
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
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
