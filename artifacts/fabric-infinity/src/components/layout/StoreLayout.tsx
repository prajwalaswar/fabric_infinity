import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, Search, Menu, X, Infinity as InfinityIcon } from 'lucide-react';
import { useState } from 'react';
import logo from '@assets/codex-clipboard-ba1642ba-86e7-4917-8383-f749aa153b92_1785595081553.jpg';

export function Navbar() {
  const { cartCount } = useCart();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/track-order', label: 'Track Order' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-border">
      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-xs font-medium tracking-wide">
        Free shipping on all orders above ₹999 | 100% Handcrafted in India
      </div>

      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 -ml-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src={logo} alt="Fabric Infinity" className="h-8 w-8 rounded-full object-cover" />
          <span className="font-serif font-bold text-xl tracking-tight text-primary">Fabric Infinity</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-sm font-medium hover:text-primary transition-colors ${
                location === link.href ? 'text-primary border-b-2 border-primary py-1' : 'text-foreground/80'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link href="/shop" className="p-2 text-foreground hover:text-primary transition-colors">
            <Search size={20} />
          </Link>
          <Link href="/cart" className="p-2 text-foreground hover:text-primary transition-colors relative">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center translate-x-1 -translate-y-1">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border shadow-lg py-4 px-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-lg font-medium py-2 border-b border-border/50 ${
                location === link.href ? 'text-primary' : 'text-foreground'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12 mt-auto">
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif font-bold text-2xl tracking-tight text-background">Fabric Infinity</span>
          </Link>
          <p className="text-background/70 text-sm max-w-xs">
            Premium Indian handcrafted fabrics, block prints, Ajrakh, and silk dupattas. Elevate your creations with authentic artistry.
          </p>
        </div>
        
        <div>
          <h4 className="font-serif font-semibold text-lg mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-background/70">
            <li><Link href="/shop" className="hover:text-background transition-colors">All Products</Link></li>
            <li><Link href="/shop?category=new-arrivals" className="hover:text-background transition-colors">New Arrivals</Link></li>
            <li><Link href="/shop?category=bestsellers" className="hover:text-background transition-colors">Bestsellers</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-serif font-semibold text-lg mb-4">Support</h4>
          <ul className="space-y-2 text-sm text-background/70">
            <li><Link href="/track-order" className="hover:text-background transition-colors">Track Order</Link></li>
            <li><a href="#" className="hover:text-background transition-colors">Shipping Policy</a></li>
            <li><a href="#" className="hover:text-background transition-colors">Returns & Exchanges</a></li>
            <li><a href="#" className="hover:text-background transition-colors">Contact Us</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-serif font-semibold text-lg mb-4">Newsletter</h4>
          <p className="text-sm text-background/70 mb-4">Subscribe for updates on new collections and artisan stories.</p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Your email" 
              className="bg-background/10 border border-background/20 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-background/50 placeholder:text-background/50"
            />
            <button className="bg-background text-foreground px-4 py-2 rounded text-sm font-medium hover:bg-background/90 transition-colors">
              Join
            </button>
          </form>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 mt-12 pt-6 border-t border-background/20 text-center text-sm text-background/50">
        <p>&copy; {new Date().getFullYear()} Fabric Infinity. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
