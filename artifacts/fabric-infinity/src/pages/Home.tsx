import { StoreLayout } from '@/components/layout/StoreLayout';
import { ProductCard } from '@/components/store/ProductCard';
import { Link } from 'wouter';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useCallback, useState } from 'react';
import {
  useListBanners,
  useGetFeaturedProducts,
  useGetNewArrivalProducts,
  useGetBestsellerProducts,
  useListCategories,
} from '@workspace/api-client-react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

import banner1 from '@assets/banner-slide-1-dupatta-story_1785595081552.png';
import banner2 from '@assets/banner-slide-2-softness-perfection_1785595081560.png';
import banner3 from '@assets/banner-slide-3-festive-vibes_1785595081549.png';
import banner4 from '@assets/banner-slide-4-elevate-creation_1785595081561.png';

// Product images for static category tiles
import indigoImg from '@assets/WhatsApp-Image-2026-06-24-at-2.26.13-PM-1_1785643101793.jpeg';
import indigoFloral from '@assets/WhatsApp-Image-2026-06-24-at-2.26.13-PM-3_1785643101795.jpeg';
import indigoWave from '@assets/WhatsApp-Image-2026-06-24-at-2.26.14-PM-1_1785643101795.jpeg';
import indigoLeaf from '@assets/WhatsApp-Image-2026-06-24-at-2.26.14-PM-2_1785643101796.jpeg';
import vanaspati from '@assets/WhatsApp-Image-2026-06-24-at-2.26.40-PM_1785643101797.jpeg';
import fabric1 from '@assets/WhatsApp-Image-2026-06-24-at-2.26.42-PM_1785643101798.jpeg';
import fabric2 from '@assets/WhatsApp-Image-2026-06-24-at-2.26.42-PM-2_1785643101799.jpeg';
import fabric3 from '@assets/WhatsApp-Image-2026-06-24-at-2.27.18-PM_1785643101800.jpeg';
import fabric4 from '@assets/WhatsApp-Image-2026-06-24-at-2.27.19-PM-1_1785643101801.jpeg';
import fabric5 from '@assets/WhatsApp-Image-2026-06-24-at-2.27.19-PM-2_1785643101802.jpeg';
import fabric6 from '@assets/WhatsApp-Image-2026-06-24-at-2.28.02-PM_1785643101803.jpeg';
import fabric7 from '@assets/WhatsApp-Image-2026-06-24-at-2.24.37-PM_1785643101804.jpeg';
import fabric8 from '@assets/WhatsApp-Image-2026-06-24-at-2.25.43-PM_1785643101804.jpeg';
import fabric9 from '@assets/WhatsApp-Image-2026-06-24-at-2.25.44-PM-1_1785643101805.jpeg';

const LOCAL_BANNERS = [
  { id: 1, image: banner1, title: 'The Dupatta Story', subtitle: 'Woven by hand, styled by you', ctaText: 'Shop Dupattas', ctaLink: '/shop?category=dupattas' },
  { id: 2, image: banner2, title: 'Softness & Perfection', subtitle: 'Pure cotton comfort', ctaText: 'Discover Fabrics', ctaLink: '/shop?category=fabrics' },
  { id: 3, image: banner3, title: 'Festive Vibes', subtitle: 'Rich colours for the season', ctaText: 'Shop Sarees', ctaLink: '/shop?category=sarees' },
  { id: 4, image: banner4, title: 'Elevate Your Creation', subtitle: 'Authentic block prints from Rajasthan', ctaText: 'Explore Now', ctaLink: '/shop?category=hand-block-prints' },
];

const CATEGORY_TILES = [
  { label: 'Hand Block Prints', sub: 'Ajrakh · Indigo · Dabu · Bagru', href: '/shop?category=hand-block-prints', img: indigoImg },
  { label: 'Handloom Fabrics', sub: 'Ikat · Jamdani · Cotton', href: '/shop?category=handloom-fabrics', img: fabric3 },
  { label: 'Dress Materials', sub: 'Suits · Kota Doria · Modal Silk', href: '/shop?category=dress-materials', img: fabric7 },
  { label: 'Sarees', sub: 'Silk · Chanderi · Georgette', href: '/shop?category=sarees', img: fabric8 },
  { label: 'Dupattas', sub: 'Ikkat · Banarasi · Kalamkari', href: '/shop?category=dupattas', img: fabric4 },
  { label: 'Plain Fabrics', sub: 'Cotton · Cambric · Mule', href: '/shop?category=plain-fabrics', img: fabric5 },
];

// Static gallery products from the uploaded images
const GALLERY_PRODUCTS = [
  { img: indigoImg, label: 'Indigo Handblock', sub: 'Leaf Motif Cotton', href: '/shop?category=indigo' },
  { img: indigoFloral, label: 'Indigo Handblock', sub: 'Floral Motif Cotton', href: '/shop?category=indigo' },
  { img: indigoWave, label: 'Indigo Handblock', sub: 'Wave Pattern Cotton', href: '/shop?category=indigo' },
  { img: indigoLeaf, label: 'Indigo Handblock', sub: 'Bold Leaf Print', href: '/shop?category=indigo' },
  { img: vanaspati, label: 'Vanaspati Ajrakh', sub: 'Natural Dye Cotton', href: '/shop?category=vanaspati' },
  { img: fabric1, label: 'Ajrakh Block Print', sub: 'Hand-stamped Cotton', href: '/shop?category=ajrakh' },
  { img: fabric2, label: 'Kalamkari Fabric', sub: 'Natural Dye Motifs', href: '/shop?category=kalamkari' },
  { img: fabric6, label: 'Dabu Print', sub: 'Mud-resist Technique', href: '/shop?category=dabu' },
];

function SectionLoading() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e8e0d6]">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse bg-white p-4 flex flex-col gap-4">
          <div className="bg-[#f5f1ec] aspect-[3/4]"></div>
          <div className="h-3 bg-[#f0ebe3] w-2/3 rounded-sm"></div>
          <div className="h-3 bg-[#f0ebe3] w-1/3 rounded-sm"></div>
        </div>
      ))}
    </div>
  );
}

function HeroCarousel() {
  const { data: apiBanners } = useListBanners();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 25 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    const autoplay = setInterval(() => emblaApi.scrollNext(), 5500);
    return () => {
      clearInterval(autoplay);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const banners = apiBanners?.length ? apiBanners : LOCAL_BANNERS;

  return (
    <div className="relative overflow-hidden w-full h-[62vh] md:h-[70vh] lg:h-[75vh] max-h-[720px]" ref={emblaRef}>
      <div className="flex w-full h-full">
        {banners.map((banner) => (
          <div key={banner.id} className="relative flex-[0_0_100%] min-w-0 h-full">
            <img
              src={(banner as any).image || (banner as any).imageUrl}
              alt={(banner as any).title || 'Banner'}
              className="w-full h-full object-cover object-top"
            />
            {/* Gradient overlay — bottom-up, darker at bottom for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {/* Text — bottom left, FabricRoot style */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-3xl">
              {(banner as any).subtitle && (
                <p className="text-[11px] md:text-xs uppercase tracking-[0.3em] text-white/75 mb-3 font-sans">
                  {(banner as any).subtitle}
                </p>
              )}
              {(banner as any).title && (
                <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-white mb-7 leading-tight">
                  {(banner as any).title}
                </h1>
              )}
              {(banner as any).ctaText && (
                <Link
                  href={(banner as any).ctaLink || '/shop'}
                  className="inline-flex items-center gap-2 bg-white text-[hsl(220,40%,18%)] hover:bg-[hsl(16,65%,48%)] hover:text-white px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300"
                >
                  {(banner as any).ctaText}
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 flex items-center justify-center text-white transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 flex items-center justify-center text-white transition-colors"
        aria-label="Next"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 right-8 md:right-16 flex items-center gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`carousel-dot ${i === selectedIndex ? 'active' : ''}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-10 md:mb-14">
      {eyebrow && (
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#8a7968] mb-2 font-sans">{eyebrow}</p>
      )}
      <h2 className="font-serif text-3xl md:text-4xl font-light text-[hsl(220,30%,18%)]">{title}</h2>
      {subtitle && (
        <p className="text-sm text-[#8a7968] mt-3 max-w-lg mx-auto leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}

export default function Home() {
  const { data: featured, isLoading: loadingFeatured } = useGetFeaturedProducts();
  const { data: newArrivals, isLoading: loadingNew } = useGetNewArrivalProducts();
  const { data: bestsellers, isLoading: loadingBest } = useGetBestsellerProducts();

  return (
    <StoreLayout>
      {/* Hero */}
      <HeroCarousel />

      {/* Category Tiles */}
      <section className="py-16 md:py-20 bg-[hsl(38,30%,97%)]">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading
            eyebrow="Our Collections"
            title="Shop by Craft"
            subtitle="From ancient block printing traditions to delicate handloom weaves — explore India's finest textile heritage."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {CATEGORY_TILES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group relative overflow-hidden aspect-[3/4] block"
              >
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-serif text-white text-base font-medium leading-tight">{cat.label}</h3>
                  <p className="text-white/65 text-[10px] mt-0.5 font-sans leading-snug">{cat.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center justify-center py-2">
        <div className="h-px bg-[#e8e0d6] flex-1 max-w-24" />
        <span className="mx-4 text-[#c4a882] text-lg">✦</span>
        <div className="h-px bg-[#e8e0d6] flex-1 max-w-24" />
      </div>

      {/* Featured Products */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-10">
            <SectionHeading
              eyebrow="Artisan's Choice"
              title="Featured Collection"
            />
            <Link href="/shop" className="hidden md:flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-[hsl(220,30%,18%)] hover:text-[hsl(16,65%,48%)] transition-colors font-semibold mb-14">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {loadingFeatured ? (
            <SectionLoading />
          ) : featured?.length ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e8e0d6]">
              {featured.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Static gallery when no API products */
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e8e0d6]">
              {GALLERY_PRODUCTS.slice(0, 4).map((p) => (
                <Link key={p.label + p.sub} href={p.href} className="group relative bg-white overflow-hidden">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f1ec]">
                    <img src={p.img} alt={p.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-107" />
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#8a7968]">Hand Block Print</p>
                    <h3 className="font-serif text-[15px] text-[hsl(220,30%,18%)] mt-0.5 group-hover:text-[hsl(16,65%,48%)] transition-colors">{p.label}</h3>
                    <p className="text-sm font-medium text-[hsl(220,30%,18%)] mt-1">₹450 / metre</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Full-width banner CTA */}
      <section className="relative overflow-hidden h-[320px] md:h-[420px]">
        <img src={fabric9} alt="Block Print Fabric" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-[hsl(220,40%,18%)]/70" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4a882] mb-3 font-sans">Heritage Craft</p>
            <h2 className="font-serif text-3xl md:text-5xl font-light text-white mb-6 max-w-2xl">
              Every Thread Tells a Story
            </h2>
            <p className="text-white/70 text-sm mb-8 max-w-lg mx-auto leading-relaxed font-sans">
              Authentic Indian textiles crafted by master artisans. Each piece carries the legacy of centuries-old techniques.
            </p>
            <Link href="/shop" className="inline-flex items-center gap-2 border border-white text-white hover:bg-white hover:text-[hsl(220,40%,18%)] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-300">
              Explore All Fabrics <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 md:py-20 bg-[hsl(38,30%,97%)]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-10">
            <SectionHeading
              eyebrow="Fresh from the Artisans"
              title="New Arrivals"
            />
            <Link href="/shop?category=new-arrivals" className="hidden md:flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-[hsl(220,30%,18%)] hover:text-[hsl(16,65%,48%)] transition-colors font-semibold mb-14">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {loadingNew ? (
            <SectionLoading />
          ) : newArrivals?.length ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e8e0d6]">
              {newArrivals.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e8e0d6]">
              {GALLERY_PRODUCTS.slice(4).map((p) => (
                <Link key={p.label + p.sub} href={p.href} className="group relative bg-white overflow-hidden">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f1ec]">
                    <img src={p.img} alt={p.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-107" />
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#8a7968]">Hand Block Print</p>
                    <h3 className="font-serif text-[15px] text-[hsl(220,30%,18%)] mt-0.5 group-hover:text-[hsl(16,65%,48%)] transition-colors">{p.label}</h3>
                    <p className="text-sm font-medium text-[hsl(220,30%,18%)] mt-1">₹450 / metre</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/shop?category=new-arrivals" className="inline-flex items-center gap-2 border border-[hsl(220,40%,18%)] text-[hsl(220,40%,18%)] px-6 py-3 text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-[hsl(220,40%,18%)] hover:text-white transition-colors">
              View All New Arrivals <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      {(loadingBest || (bestsellers && bestsellers.length > 0)) && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <SectionHeading eyebrow="Customer Favourites" title="Bestsellers" />
            {loadingBest ? (
              <SectionLoading />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e8e0d6]">
                {bestsellers!.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Why Us */}
      <section className="py-14 md:py-16 bg-[hsl(220,40%,18%)] text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: '✦', title: '100% Handcrafted', body: 'Every piece made by skilled artisans across Rajasthan & Gujarat' },
              { icon: '✦', title: 'Natural Dyes', body: 'Plant-based dyes — indigo, dabu, ajrakh — safe for skin and earth' },
              { icon: '✦', title: 'Direct from Weavers', body: 'No middlemen. Fair wages to artisan families we work with' },
              { icon: '✦', title: 'Secure Shipping', body: 'Carefully packed and shipped across India within 3–7 days' },
            ].map((item) => (
              <div key={item.title}>
                <p className="text-[#c4a882] text-xl mb-3">{item.icon}</p>
                <h3 className="font-serif text-lg font-medium mb-2">{item.title}</h3>
                <p className="text-white/55 text-xs leading-relaxed font-sans">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram-style image grid */}
      <section className="py-16 md:py-20 bg-[hsl(38,30%,97%)]">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading
            eyebrow="Fabric Gallery"
            title="Indigo Handblock Collection"
            subtitle="Authentic indigo prints — each piece unique, each fold a work of art."
          />
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {[indigoImg, indigoFloral, indigoWave, indigoLeaf, vanaspati, fabric1, fabric2, fabric3, fabric4, fabric6].map((img, i) => (
              <Link
                key={i}
                href="/shop?category=hand-block-prints"
                className="group relative aspect-square overflow-hidden block"
              >
                <img
                  src={img}
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] uppercase tracking-[0.2em] font-semibold transition-opacity duration-300">
                    Shop Now
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/shop?category=hand-block-prints" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[hsl(220,30%,18%)] hover:text-[hsl(16,65%,48%)] font-semibold transition-colors border-b border-current pb-0.5">
              View Full Collection <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
