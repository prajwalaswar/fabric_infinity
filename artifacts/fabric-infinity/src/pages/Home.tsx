import { StoreLayout } from '@/components/layout/StoreLayout';
import { ProductCard } from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect } from 'react';
import { 
  useListBanners, 
  useGetFeaturedProducts, 
  useGetNewArrivalProducts, 
  useGetBestsellerProducts,
  useListCategories
} from '@workspace/api-client-react';

import banner1 from '@assets/banner-slide-1-dupatta-story_1785595081552.png';
import banner2 from '@assets/banner-slide-2-softness-perfection_1785595081560.png';
import banner3 from '@assets/banner-slide-3-festive-vibes_1785595081549.png';
import banner4 from '@assets/banner-slide-4-elevate-creation_1785595081561.png';

const LOCAL_BANNERS = [
  { id: 1, image: banner1, title: "The Dupatta Story", subtitle: "Woven by hand, styled by you", ctaText: "Shop Collection", ctaLink: "/shop" },
  { id: 2, image: banner2, title: "Softness & Perfection", subtitle: "Pure cotton comfort", ctaText: "Discover More", ctaLink: "/shop" },
  { id: 3, image: banner3, title: "Festive Vibes", subtitle: "Rich colors for the season", ctaText: "Shop Festive", ctaLink: "/shop" },
  { id: 4, image: banner4, title: "Elevate Your Creation", subtitle: "Authentic block prints", ctaText: "Explore Now", ctaLink: "/shop" },
];

function HeroCarousel() {
  const { data: apiBanners } = useListBanners();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });

  useEffect(() => {
    if (emblaApi) {
      const autoplay = setInterval(() => {
        emblaApi.scrollNext();
      }, 5000);
      return () => clearInterval(autoplay);
    }
  }, [emblaApi]);

  const banners = apiBanners?.length ? apiBanners : LOCAL_BANNERS;

  return (
    <div className="relative overflow-hidden w-full h-[60vh] md:h-[80vh]" ref={emblaRef}>
      <div className="flex w-full h-full">
        {banners.map((banner) => (
          <div key={banner.id} className="relative flex-[0_0_100%] min-w-0 h-full">
            <img 
              src={banner.image} 
              alt={banner.title || "Banner"} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center text-white p-6 max-w-2xl">
                {banner.subtitle && (
                  <p className="text-sm md:text-base uppercase tracking-[0.2em] mb-4 opacity-90">{banner.subtitle}</p>
                )}
                {banner.title && (
                  <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                    {banner.title}
                  </h2>
                )}
                {banner.ctaText && (
                  <Link href={banner.ctaLink || "/shop"}>
                    <Button size="lg" className="bg-white text-black hover:bg-white/90 rounded-none px-8 font-semibold uppercase tracking-wider text-sm">
                      {banner.ctaText}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionLoading() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="animate-pulse flex flex-col gap-4">
          <div className="bg-muted aspect-[4/5] rounded-lg"></div>
          <div className="h-4 bg-muted w-2/3 rounded"></div>
          <div className="h-4 bg-muted w-1/3 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { data: featured, isLoading: loadingFeatured } = useGetFeaturedProducts();
  const { data: newArrivals, isLoading: loadingNew } = useGetNewArrivalProducts();
  const { data: categories, isLoading: loadingCategories } = useListCategories();

  return (
    <StoreLayout>
      <HeroCarousel />
      
      {/* Featured Section */}
      <section className="py-16 md:py-24 container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">Artisan's Choice</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Handpicked selections featuring authentic craft techniques passed down through generations.</p>
        </div>
        
        {loadingFeatured ? (
          <SectionLoading />
        ) : featured?.length ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {featured.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </section>

      {/* Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">Shop by Craft</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loadingCategories ? (
              <SectionLoading />
            ) : categories?.slice(0, 4).map(category => (
              <Link 
                key={category.id} 
                href={`/shop?category=${category.slug}`}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border"
              >
                <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/40 transition-colors z-10" />
                {category.image ? (
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">No image</div>
                )}
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <h3 className="text-white font-serif text-xl md:text-2xl font-semibold bg-black/40 px-6 py-2 rounded-sm backdrop-blur-sm">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 md:py-24 container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-serif text-3xl font-bold text-foreground">New Arrivals</h2>
            <p className="text-muted-foreground mt-2">Fresh from the artisans</p>
          </div>
          <Link href="/shop?category=new-arrivals">
            <Button variant="outline" className="hidden md:flex border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              View All
            </Button>
          </Link>
        </div>
        
        {loadingNew ? (
          <SectionLoading />
        ) : newArrivals?.length ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {newArrivals.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
        
        <div className="mt-8 text-center md:hidden">
          <Link href="/shop?category=new-arrivals">
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              View All New Arrivals
            </Button>
          </Link>
        </div>
      </section>

      {/* Craftsmanship USP */}
      <section className="py-20 bg-primary text-primary-foreground text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">Rooted in Tradition</h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed font-light">
            Every thread woven, every block stamped, carries the legacy of Indian artisans. We bring you authentic textiles that celebrate the beautiful imperfections of human hands.
          </p>
        </div>
      </section>
    </StoreLayout>
  );
}
