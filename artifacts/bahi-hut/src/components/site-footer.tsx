import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { MapPin, Phone } from 'lucide-react';
import logoImg from '@assets/generated_images/logo/BAHI_HUT_LOGO.jpg';

const exploreLinks = [
  { href: '/bahi-hut', label: 'The Bar' },
  { href: '/resort', label: 'Golden Host Resort' },
  { href: '/events', label: 'Events & Live Music' },
  { href: '/private-events', label: 'Private Events' },
  { href: '/shop', label: 'Shop Merch' },
  { href: '/local-guide', label: 'Local Guide' },
];

const hours = [
  { label: 'Happy Hour', value: 'Mon–Thu 1pm–6pm' },
  { label: 'Resort Check-in', value: '3:00 PM' },
  { label: 'Resort Check-out', value: '11:00 AM' },
];

const sisterLinks = [
  { href: 'https://ghresort.square.site/#items', label: 'Food Ordering' },
  { href: 'https://www.tikifever.com', label: 'Tiki Fever' },
];

const linkClass = 'text-muted-foreground transition-colors hover:text-foreground';

function FooterColumn({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-2">{eyebrow}</p>
      <h3 className="mb-6 text-xl font-bold">{title}</h3>
      {children}
    </div>
  );
}

// Every page ends after dark.
export function SiteFooter() {
  return (
    <footer data-theme="lounge" className="grain relative overflow-hidden pb-10 pt-20">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="mb-14 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="mb-6 inline-flex items-center">
              <img src={logoImg} alt="Bahi Hut Cocktail Lounge" className="h-24 w-24 rounded-full object-contain" />
            </Link>
            <p className="mb-2 font-serif text-xl italic text-foreground">Since 1954.</p>
            <p className="mb-6 max-w-sm text-muted-foreground">
              Sarasota's oldest tiki bar and midcentury modern resort. Serving legendary Mai Tais since 1954.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a href="tel:9413555141" className={`${linkClass} flex items-center gap-2 tabular-nums`}>
                <Phone className="h-4 w-4 shrink-0 text-primary" /> (941) 355-5141
              </a>
              <a
                href="https://maps.google.com/?q=4675+N+Tamiami+Trail+Sarasota+FL+34234"
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClass} flex items-center gap-2`}
              >
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                4675 N Tamiami Trail, Sarasota FL 34234
              </a>
            </div>
          </div>

          <FooterColumn eyebrow="Around the hut" title="Explore">
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn eyebrow="Plan your visit" title="Hours">
            <ul className="space-y-3">
              {hours.map((row) => (
                <li key={row.label} className="flex justify-between gap-4 border-b border-border pb-2">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="tabular-nums text-foreground">{row.value}</span>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn eyebrow="Friends of the hut" title="Sister Links">
            <ul className="space-y-3">
              {sisterLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </FooterColumn>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Bahi Hut & Golden Host Resort. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="https://www.bahihut.com/privacypolicy" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">
              Privacy Policy
            </a>
            <span className="italic">Note: Some imagery is conceptual illustration.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
