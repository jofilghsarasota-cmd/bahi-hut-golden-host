import { useState, type CSSProperties } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import shopMugImg from '@assets/generated_images/shop-mug.jpg';
import tikiMotif from '@assets/bg.avif';

const motifStyle = { '--motif-image': `url(${tikiMotif})` } as CSSProperties;

const SHOP_ITEMS = [
  {
    id: 'sneaky-tiki',
    name: 'Sneaky Tiki Mug',
    price: 19.00,
    originalPrice: 28.00,
    category: 'mugs',
    image: shopMugImg,
    inStock: true,
    sale: true,
  },
  {
    id: 'bamboo-mug',
    name: 'Bamboo Mug',
    price: 8.00,
    category: 'mugs',
    inStock: true,
  },
  {
    id: 'coconut-cup',
    name: 'Coconut Cup',
    price: 9.00,
    category: 'mugs',
    inStock: true,
  },
  {
    id: 'tiki-fever-24',
    name: 'Tiki Fever 24 Mug',
    price: 35.00, // estimated
    category: 'mugs',
    inStock: false,
  },
  {
    id: 'wood-necklace',
    name: 'Tiki Wood Necklace',
    price: 9.00,
    category: 'apparel',
    inStock: true,
  },
  {
    id: 'postcard',
    name: 'Bahi Hut Postcard',
    price: 0.50,
    category: 'souvenirs',
    inStock: true,
  },
  {
    id: 'bumper-sticker',
    name: 'Bumper Sticker',
    price: 0.50,
    category: 'souvenirs',
    inStock: true,
  }
];

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(SHOP_ITEMS.map(i => i.category)))];

  const filteredItems = activeCategory === 'all'
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter(i => i.category === activeCategory);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero: left-aligned grain surface, matching Local Guide's sun-theme
          treatment instead of the flat teal band. */}
      <section className="grain motif relative overflow-hidden pt-28 pb-16 px-4 md:pt-36 md:pb-24" style={motifStyle}>
        <div className="container relative z-10 mx-auto max-w-4xl">
          <span className="eyebrow animate-in fade-in slide-in-from-bottom-2 duration-700">Take It Home</span>
          <h1 className="type-display mt-4 text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            The Hut Shop
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Take a piece of the legend home with you. Official Bahi Hut and Golden Host merchandise.
          </p>
        </div>
      </section>

      <section className="pt-0 pb-8">
        <div className="container mx-auto px-4">
          {/* Filter: quiet pill toggles instead of a row of bordered buttons. */}
          <div className="flex flex-wrap justify-center gap-2 border-b border-border pb-8">
            {categories.map(cat => (
              <Button
                key={cat}
                size="sm"
                variant={activeCategory === cat ? "default" : "ghost"}
                onClick={() => setActiveCategory(cat)}
                className="capitalize"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredItems.map(item => (
              <div key={item.id} className="group relative bg-card rounded-2xl overflow-hidden ring-1 ring-border/60 transition-shadow duration-300 hover:shadow-xl flex flex-col">

                {/* Image Area */}
                <div className="aspect-square bg-muted relative overflow-hidden flex items-center justify-center p-4">
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                      <Badge variant="muted">Out of Stock</Badge>
                    </div>
                  )}
                  {item.sale && item.inStock && (
                    <Badge className="absolute right-4 top-4 z-10 shadow-sm">Sale</Badge>
                  )}

                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className={`w-full h-full object-contain ${!item.inStock ? 'opacity-50' : 'group-hover:scale-105 transition-transform duration-500'}`}
                    />
                  ) : (
                    <div className="w-full h-full border-4 border-dashed border-border/50 rounded-xl flex items-center justify-center text-muted-foreground font-serif italic">
                      Image coming soon
                    </div>
                  )}
                </div>

                {/* Details Area */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-serif font-bold text-lg text-foreground mb-1 leading-tight">{item.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-bold text-lg text-primary tabular-nums">
                      ${item.price.toFixed(2)}
                    </span>
                    {item.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through tabular-nums">
                        ${item.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto">
                    <Button
                      className="w-full"
                      variant={item.inStock ? "default" : "secondary"}
                      disabled={!item.inStock}
                      asChild={item.inStock}
                    >
                      {item.inStock ? (
                        <a href="https://www.bahihut.com/shop" target="_blank" rel="noopener noreferrer">
                          <ShoppingCart className="w-4 h-4" /> Buy on Official Store
                        </a>
                      ) : (
                        <span><ShoppingCart className="w-4 h-4" /> Unavailable</span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA: grain teal band, matching the treatment used to close the
          other pages instead of a flat accent-tinted box. */}
      <section className="grain relative overflow-hidden bg-secondary px-4 py-16 text-secondary-foreground md:py-20">
        <div className="container relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <h3 className="font-serif text-2xl font-bold md:text-3xl">Looking for more?</h3>
            <p className="mt-3 max-w-md text-secondary-foreground/80">
              Our full inventory, including limited edition Tiki Fever merch, is available at the bar.
            </p>
          </div>
          <Button size="lg" variant="glass" className="shrink-0" asChild>
            <a href="https://www.bahihut.com/shop" target="_blank" rel="noopener noreferrer">
              Visit Official Store
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
