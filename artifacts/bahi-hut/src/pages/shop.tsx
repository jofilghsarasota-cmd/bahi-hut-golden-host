import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import shopMugImg from '@assets/generated_images/shop-mug.jpg';

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
      <section className="bg-secondary pt-24 pb-20 text-center px-4 relative">
        <div className="container relative z-10 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl font-black text-white mb-6">
            The Hut Shop
          </h1>
          <p className="text-xl text-white/90 font-medium max-w-2xl mx-auto">
            Take a piece of the legend home with you. Official Bahi Hut and Golden Host merchandise.
          </p>
        </div>
      </section>

      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                onClick={() => setActiveCategory(cat)}
                className="capitalize"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredItems.map(item => (
              <div key={item.id} className="group relative bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                
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

          <div className="mt-16 text-center bg-accent/20 border border-accent/30 rounded-2xl p-8">
            <h3 className="font-serif text-2xl font-bold mb-2">Looking for more?</h3>
            <p className="text-muted-foreground mb-6">Our full inventory, including limited edition Tiki Fever merch, is available at the bar.</p>
            <Button variant="outline" className="bg-background" asChild>
              <a href="https://www.bahihut.com/shop" target="_blank" rel="noopener noreferrer">
                Visit Official Store
              </a>
            </Button>
          </div>

        </div>
      </section>
    </div>
  );
}
