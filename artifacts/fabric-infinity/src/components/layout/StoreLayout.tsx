import { ReactNode, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, Search, Menu, X, ChevronDown, User, MapPin, LayoutDashboard } from 'lucide-react';
import { ChatWidget } from '@/components/store/ChatWidget';
import logoImg from '@assets/codex-clipboard-ba1642ba-86e7-4917-8383-f749aa153b92_1785595081553.jpg';

// Full category hierarchy
const NAV_CATEGORIES = [
  {
    label: 'Fabrics',
    href: '/shop?category=fabrics',
    mega: [
      {
        group: 'Hand Block Prints',
        href: '/shop?category=hand-block-prints',
        items: [
          { label: 'Ajrakh', href: '/shop?category=ajrakh', sub: ['Cotton Ajrakh', 'Modal Silk Ajrakh'] },
          { label: 'Indigo', href: '/shop?category=indigo' },
          { label: 'Dabu', href: '/shop?category=dabu' },
          { label: 'Bagru', href: '/shop?category=bagru' },
          { label: 'Vanaspati', href: '/shop?category=vanaspati' },
          { label: 'Rapid', href: '/shop?category=rapid' },
          { label: 'Kalamkari', href: '/shop?category=kalamkari' },
          { label: 'Bagh', href: '/shop?category=bagh' },
          { label: 'Pigment Prints', href: '/shop?category=pigment-prints' },
        ],
      },
      {
        group: 'Handloom Fabrics',
        href: '/shop?category=handloom-fabrics',
        items: [
          { label: 'Ikat', href: '/shop?category=ikat', sub: ['Single Ikat', 'Double Ikat', 'SICO Ikat', 'Mercerised Ikat'] },
          { label: 'Jamdani Cotton', href: '/shop?category=jamdani-cotton' },
          { label: 'Handloom Cotton', href: '/shop?category=handloom-cotton' },
        ],
      },
      {
        group: 'Plain Fabrics',
        href: '/shop?category=plain-fabrics',
        items: [
          { label: 'Cotton', href: '/shop?category=cotton', sub: ['Cambric Cotton (60×60)', 'Cotton Slub', 'Cotton Flex (Khadi)', 'Mule Cotton'] },
          { label: 'Cotton Blends', href: '/shop?category=cotton-blends', sub: ['Cotton Rayon', 'Cotton Silk'] },
          { label: 'Slub Silk', href: '/shop?category=slub-silk' },
        ],
      },
      {
        group: 'Screen Prints',
        href: '/shop?category=screen-prints',
        items: [
          { label: 'Kantha Cotton (60×60)', href: '/shop?category=kantha-cotton' },
        ],
      },
    ],
  },
  {
    label: 'Dress Materials',
    href: '/shop?category=dress-materials',
    mega: [
      {
        group: 'Suit Sets',
        href: '/shop?category=dress-materials',
        items: [
          { label: 'Jaipuri Handblock Suit', href: '/shop?category=jaipuri-handblock-suit' },
          { label: 'Kota Doria Suit', href: '/shop?category=kota-doria-suit' },
          { label: 'Modal Silk Suit', href: '/shop?category=modal-silk-suit' },
          { label: 'Cotton Linen Suit', href: '/shop?category=cotton-linen-suit' },
          { label: 'Maheshwari Silk Suit', href: '/shop?category=maheshwari-silk-suit' },
          { label: 'Cotton Print Suit', href: '/shop?category=cotton-print-suit' },
        ],
      },
    ],
  },
  {
    label: 'Sarees',
    href: '/shop?category=sarees',
    mega: [
      {
        group: 'All Sarees',
        href: '/shop?category=sarees',
        items: [
          { label: 'Modal Silk Sarees', href: '/shop?category=modal-silk-sarees' },
          { label: 'Kota Doria Sarees', href: '/shop?category=kota-doria-sarees' },
          { label: 'Dola Silk Sarees', href: '/shop?category=dola-silk-sarees' },
          { label: 'Georgette Sarees', href: '/shop?category=georgette-sarees' },
          { label: 'Maheshwari Sarees', href: '/shop?category=maheshwari-sarees' },
          { label: 'Cotton Handblock Sarees', href: '/shop?category=cotton-handblock-sarees' },
          { label: 'Chanderi Silk Sarees', href: '/shop?category=chanderi-silk-sarees' },
          { label: 'Cotton Linen Sarees', href: '/shop?category=cotton-linen-sarees' },
          { label: 'Chiffon Sarees', href: '/shop?category=chiffon-sarees' },
        ],
      },
    ],
  },
  {
    label: 'Dupattas',
    href: '/shop?category=dupattas',
    mega: [
      {
        group: 'All Dupattas',
        href: '/shop?category=dupattas',
        items: [
          { label: 'Ikkat Dupatta', href: '/shop?category=ikkat-dupatta' },
          { label: 'Banarasi Silk Dupatta', href: '/shop?category=banarasi-silk-dupatta' },
          { label: 'Kalamkari Dupatta', href: '/shop?category=kalamkari-dupatta' },
          { label: 'Ajrakh Modal Dupatta', href: '/shop?category=ajrakh-modal-dupatta' },
          { label: 'Bandhani Dupatta', href: '/shop?category=bandhani-dupatta' },
          { label: 'Orange Brush Print Dupatta', href: '/shop?category=brush-print-dupatta' },
        ],
      },
    ],
  },
  { label: 'New Arrivals', href: '/shop?category=new-arrivals' },
  { label: 'Sale', href: '/shop?sort=discount' },
];

function MegaMenuPanel({ groups, onClose }: { groups: NonNullable<typeof NAV_CATEGORIES[0]['mega']>; onClose: () => void }) {
  return (
    <div className="mega-menu w-full bg-white border-t border-[#e8e0d6] shadow-xl py-8">
      <div className="container mx-auto px-6">
        <div className={`grid gap-8 ${groups.length === 1 ? 'grid-cols-2 max-w-lg' : groups.length === 2 ? 'grid-cols-2 max-w-2xl' : groups.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {groups.map((group) => (
            <div key={group.group}>
              <Link href={group.href} onClick={onClose}>
                <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7968] mb-3 hover:text-[hsl(220,40%,18%)] transition-colors">
                  {group.group}
                </h4>
              </Link>
              <ul className="space-y-1.5">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} onClick={onClose} className="text-sm text-[hsl(220,30%,18%)] hover:text-[hsl(16,65%,48%)] transition-colors font-medium">
                      {item.label}
                    </Link>
                    {'sub' in item && item.sub && (
                      <ul className="mt-1 ml-3 space-y-1">
                        {item.sub.map((s) => (
                          <li key={s}>
                            <Link
                              href={`/shop?category=${s.toLowerCase().replace(/[\s()×]+/g, '-')}`}
                              onClick={onClose}
                              className="text-xs text-[hsl(220,15%,50%)] hover:text-[hsl(16,65%,48%)] transition-colors"
                            >
                              {s}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Active mega-menu managed at header level so the panel spans full width
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const activeCategory = NAV_CATEGORIES.find((c) => c.label === activeMenu);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 w-full">
      {/* Announcement Bar */}
      <div className="bg-[hsl(220,40%,18%)] text-white py-2.5 px-4 text-center text-[11px] font-medium tracking-[0.15em] uppercase">
        Free shipping on all orders above ₹999 &nbsp;|&nbsp; 100% Handcrafted in India &nbsp;|&nbsp; Authentic Block Prints
      </div>

      {/* Main Header Bar */}
      <div className="bg-white border-b border-[#e8e0d6]">
        <div className="container mx-auto px-4 md:px-6 h-[68px] flex items-center justify-between">
          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 -ml-2 text-[hsl(220,30%,18%)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0" onClick={() => setActiveMenu(null)}>
            <img src={logoImg} alt="Fabric Infinity" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="font-serif text-[22px] font-semibold tracking-tight text-[hsl(220,40%,18%)]">
                Fabric Infinity
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#8a7968] font-sans">
                Woven in India
              </span>
            </div>
          </Link>

          {/* Desktop Nav — triggers managed at this level */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_CATEGORIES.map((item) =>
              item.mega ? (
                <button
                  key={item.label}
                  className={`flex items-center gap-1 text-[13px] font-medium tracking-wide uppercase transition-colors py-1 ${
                    activeMenu === item.label
                      ? 'text-[hsl(16,65%,48%)]'
                      : 'text-[hsl(220,30%,18%)] hover:text-[hsl(16,65%,48%)]'
                  }`}
                  onMouseEnter={() => setActiveMenu(item.label)}
                  onClick={() => setActiveMenu(activeMenu === item.label ? null : item.label)}
                >
                  {item.label}
                  <ChevronDown
                    size={13}
                    className={`transition-transform ${activeMenu === item.label ? 'rotate-180' : ''}`}
                  />
                </button>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setActiveMenu(null)}
                  className={`text-[13px] font-medium tracking-wide uppercase hover:text-[hsl(16,65%,48%)] transition-colors ${
                    item.label === 'Sale' ? 'text-[hsl(16,65%,48%)]' : 'text-[hsl(220,30%,18%)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {searchOpen ? (
              <div className="hidden md:flex items-center border border-[#e8e0d6] overflow-hidden">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
                    }
                    if (e.key === 'Escape') setSearchOpen(false);
                  }}
                  placeholder="Search fabrics…"
                  className="text-sm px-3 py-1.5 outline-none w-40 bg-white text-[hsl(220,30%,18%)]"
                />
                <button onClick={() => setSearchOpen(false)} className="px-2 text-[hsl(220,15%,50%)] hover:text-[hsl(16,65%,48%)]">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-1.5 text-[hsl(220,30%,18%)] hover:text-[hsl(16,65%,48%)] transition-colors"
                aria-label="Search"
              >
                <Search size={19} />
              </button>
            )}
            <Link href="/login" onClick={() => setActiveMenu(null)} className="p-1.5 text-[hsl(220,30%,18%)] hover:text-[hsl(16,65%,48%)] transition-colors hidden md:flex" aria-label="Account">
              <User size={19} />
            </Link>
            <Link href="/admin/login" onClick={() => setActiveMenu(null)} className="p-1.5 text-[hsl(220,30%,18%)] hover:text-[hsl(16,65%,48%)] transition-colors" aria-label="Owner dashboard" title="Owner dashboard">
              <LayoutDashboard size={19} />
            </Link>
            <Link href="/cart" onClick={() => setActiveMenu(null)} className="p-1.5 text-[hsl(220,30%,18%)] hover:text-[hsl(16,65%,48%)] transition-colors relative" aria-label="Cart">
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[hsl(16,65%,48%)] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Full-width Mega Menu Panel — anchored to header, spans 100% */}
      {activeMenu && activeCategory?.mega && (
        <div
          className="hidden md:block absolute left-0 w-full"
          onMouseLeave={() => setActiveMenu(null)}
        >
          <MegaMenuPanel groups={activeCategory.mega} onClose={() => setActiveMenu(null)} />
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[calc(68px+36px)] z-40 bg-white overflow-y-auto">
          <div className="py-4">
            {NAV_CATEGORIES.map((item) => (
              <div key={item.label} className="border-b border-[#f0ebe3]">
                {item.mega ? (
                  <>
                    <button
                      className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium tracking-wide uppercase text-[hsl(220,30%,18%)]"
                      onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                    >
                      {item.label}
                      <ChevronDown size={14} className={`transition-transform ${mobileExpanded === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileExpanded === item.label && (
                      <div className="px-6 pb-4 space-y-4 bg-[#faf8f4]">
                        {item.mega.map((group) => (
                          <div key={group.group}>
                            <p className="text-[10px] uppercase tracking-widest text-[#8a7968] font-semibold mb-2 pt-2">{group.group}</p>
                            <ul className="space-y-2">
                              {group.items.map((sub) => (
                                <li key={sub.label}>
                                  <Link
                                    href={sub.href}
                                    className="text-sm text-[hsl(220,30%,25%)] hover:text-[hsl(16,65%,48%)]"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {sub.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex px-6 py-4 text-sm font-medium tracking-wide uppercase ${item.label === 'Sale' ? 'text-[hsl(16,65%,48%)]' : 'text-[hsl(220,30%,18%)]'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            {/* Mobile search */}
            <div className="px-6 py-5">
              <div className="flex items-center border border-[#e8e0d6] px-3 py-2.5">
                <Search size={15} className="text-[#8a7968] mr-2" />
                <input
                  type="text"
                  placeholder="Search fabrics…"
                  className="text-sm w-full outline-none bg-transparent text-[hsl(220,30%,18%)]"
                  onKeyDown={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (e.key === 'Enter' && target.value.trim()) {
                      window.location.href = `/shop?search=${encodeURIComponent(target.value.trim())}`;
                      setMobileMenuOpen(false);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-[hsl(220,40%,13%)] text-white mt-auto">
      {/* Newsletter */}
      <div className="border-b border-white/10 py-12">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#c4a882] mb-2">Stay Connected</p>
          <h3 className="font-serif text-2xl md:text-3xl font-medium mb-4">Artisan Stories & New Collections</h3>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">Subscribe for updates on new arrivals, craft techniques, and exclusive offers.</p>
          <form className="flex gap-0 max-w-sm mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/10 border border-white/20 px-4 py-3 text-sm outline-none focus:border-[#c4a882] placeholder:text-white/40 transition-colors"
            />
            <button className="bg-[hsl(16,65%,48%)] hover:bg-[hsl(16,65%,42%)] text-white px-5 py-3 text-sm font-medium tracking-wide uppercase transition-colors">
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Links */}
      <div className="container mx-auto px-4 md:px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="mb-4">
            <p className="font-serif text-xl font-semibold">Fabric Infinity</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#c4a882]">Woven in India</p>
          </div>
          <p className="text-white/50 text-xs leading-relaxed max-w-[200px]">
            Authentic Indian handcrafted fabrics — block prints, Ajrakh, ikat, silk, and more. Celebrating artisan heritage since 2020.
          </p>
          <a
            href="https://www.google.com/maps/place/Shop+No.02,+Fabric+Infinity,+2,+Baner+-+Pashan+Link+Rd,+opp.+Orange+county+phase+-II,+Pashan,+Pune,+Maharashtra+411021/data=!4m2!3m1!1s0x3bc2bf007c72e309:0x59e258aa566971d3"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-start gap-2 group"
          >
            <MapPin size={13} className="text-[#c4a882] mt-0.5 flex-shrink-0" />
            <span className="text-white/50 text-xs leading-relaxed group-hover:text-white/80 transition-colors">
              Shop No. 02, Baner–Pashan Link Rd, Opp. Orange County Phase II, Pashan, Pune 411021
            </span>
          </a>
          <div className="mt-4 flex items-center gap-3">
            <a href="https://www.instagram.com/fabricinfinity.in?igsh=M2x1eXUzYnUxZml1" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/50 hover:text-[#E1306C] transition-colors">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
            </a>
            <a href="https://www.facebook.com/people/Fabric-Infinity/61588480363743/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white/50 hover:text-[#1877F2] transition-colors">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://api.whatsapp.com/send/?phone=918530361444&text=Hi+Fabric+Infinity%21&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-white/50 hover:text-[#25D366] transition-colors">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.124.556 4.118 1.528 5.845L.057 23.707a.5.5 0 0 0 .638.558l6.01-1.894A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.803 9.803 0 0 1-5.002-1.37l-.358-.214-3.707 1.167 1.098-3.61-.233-.373A9.815 9.815 0 0 1 2.182 12C2.182 6.575 6.575 2.182 12 2.182S21.818 6.575 21.818 12 17.425 21.818 12 21.818z"/></svg>
            </a>
          </div>
        </div>

        {[
          { title: 'Fabrics', links: [
            { label: 'Hand Block Prints', href: '/shop?category=hand-block-prints' },
            { label: 'Handloom Fabrics', href: '/shop?category=handloom-fabrics' },
            { label: 'Plain Fabrics', href: '/shop?category=plain-fabrics' },
            { label: 'Screen Prints', href: '/shop?category=screen-prints' },
          ]},
          { title: 'Collections', links: [
            { label: 'Dress Materials', href: '/shop?category=dress-materials' },
            { label: 'Sarees', href: '/shop?category=sarees' },
            { label: 'Dupattas', href: '/shop?category=dupattas' },
            { label: 'New Arrivals', href: '/shop?category=new-arrivals' },
          ]},
          { title: 'Support', links: [
            { label: 'Track Order', href: '/track-order' },
            { label: 'Shipping Policy', href: '#' },
            { label: 'Returns & Exchanges', href: '#' },
            { label: 'Contact Us', href: '/login' },
            { label: 'How to Order', href: '#' },
          ]},
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#c4a882] font-semibold mb-4">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-white/55 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Follow Us — external links need <a> not wouter <Link> */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#c4a882] font-semibold mb-4">Follow Us</h4>
          <ul className="space-y-2.5">
            <li>
              <a href="https://www.instagram.com/fabricinfinity.in?igsh=M2x1eXUzYnUxZml1" target="_blank" rel="noopener noreferrer" className="text-xs text-white/55 hover:text-white transition-colors">
                Instagram
              </a>
            </li>
            <li>
              <a href="https://api.whatsapp.com/send/?phone=918530361444&text=Hi+Fabric+Infinity%21&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="text-xs text-white/55 hover:text-white transition-colors">
                WhatsApp
              </a>
            </li>
            <li>
              <a href="https://www.facebook.com/people/Fabric-Infinity/61588480363743/" target="_blank" rel="noopener noreferrer" className="text-xs text-white/55 hover:text-white transition-colors">
                Facebook
              </a>
            </li>
            <li>
              <a href="https://www.google.com/maps/place/Shop+No.02,+Fabric+Infinity,+2,+Baner+-+Pashan+Link+Rd,+opp.+Orange+county+phase+-II,+Pashan,+Pune,+Maharashtra+411021/data=!4m2!3m1!1s0x3bc2bf007c72e309:0x59e258aa566971d3" target="_blank" rel="noopener noreferrer" className="text-xs text-white/55 hover:text-white transition-colors">
                Find Our Store
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-white/35">© {new Date().getFullYear()} Fabric Infinity. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((item) => (
              <a key={item} href="#" className="text-[11px] text-white/35 hover:text-white/70 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[hsl(38,30%,97%)]">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
