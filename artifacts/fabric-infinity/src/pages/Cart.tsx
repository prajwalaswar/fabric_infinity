import { StoreLayout } from '@/components/layout/StoreLayout';
import { useCart } from '@/contexts/CartContext';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';

export default function Cart() {
  const { items, updateQuantity, removeItem, cartTotal } = useCart();
  const [, setLocation] = useLocation();

  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6">
            <Trash2 size={40} className="text-muted-foreground/50" />
          </div>
          <h1 className="font-serif text-3xl font-bold mb-4 text-foreground">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8 max-w-md">Looks like you haven't added any beautiful handcrafted pieces to your cart yet.</p>
          <Link href="/shop">
            <Button size="lg" className="px-8 font-semibold">Explore Collections</Button>
          </Link>
        </div>
      </StoreLayout>
    );
  }

  // Simplified computation for visual only, actual computation is done at checkout
  const subtotal = cartTotal;
  const shipping = subtotal > 999 ? 0 : 100;
  const total = subtotal + shipping;

  return (
    <StoreLayout>
      <div className="bg-muted/30 py-8 border-b border-border">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Your Cart</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 flex flex-col lg:flex-row gap-12">
        <div className="lg:w-2/3">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/30 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-1"></div>
            </div>
            
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variant}`} className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="col-span-1 md:col-span-6 flex gap-4">
                    <div className="w-20 md:w-24 aspect-[4/5] bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted"></div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <Link href={`/product/${item.productId}`} className="font-serif font-semibold text-lg hover:text-primary transition-colors">
                        {item.name}
                      </Link>
                      <p className="text-muted-foreground text-sm mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                      {item.variant && <p className="text-xs text-accent mt-1 bg-accent/10 inline-block px-2 py-0.5 rounded-sm">Variant: {item.variant}</p>}
                    </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-3 flex justify-start md:justify-center">
                    <div className="flex items-center border border-border rounded-md h-10 w-32 bg-background">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)}
                        className="px-3 h-full text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="flex-1 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)}
                        className="px-3 h-full text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 md:text-right font-semibold text-lg">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                  
                  <div className="col-span-1 absolute right-6 md:relative md:right-0 md:text-right mt-2 md:mt-0">
                    <button 
                      onClick={() => removeItem(item.productId, item.variant)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm sticky top-24">
            <h2 className="font-serif text-2xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="text-green-600 font-medium">Free</span>
                ) : (
                  <span className="text-foreground font-medium">₹{shipping.toLocaleString('en-IN')}</span>
                )}
              </div>
            </div>
            
            <div className="border-t border-border pt-4 mb-8">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-lg">Total</span>
                <span className="font-bold text-2xl">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-right">Tax included.</p>
            </div>
            
            <Button 
              className="w-full h-14 text-base font-semibold flex items-center justify-center gap-2"
              onClick={() => setLocation('/checkout')}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              Secure checkout • 100% Authentic Products
            </p>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
