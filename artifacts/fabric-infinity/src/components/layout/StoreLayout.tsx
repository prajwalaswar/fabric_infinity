import { ReactNode, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, Search, Menu, X, ChevronDown, User } from 'lucide-react';
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
            { label: 'Contact Us', href: '#' },
            { label: 'How to Order', href: '#' },
          ]},
          { title: 'Follow Us', links: [
            { label: 'Instagram', href: '#' },
            { label: 'WhatsApp', href: '#' },
            { label: 'Facebook', href: '#' },
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
