import { StoreLayout } from '@/components/layout/StoreLayout';
import { useState } from 'react';
import { useTrackOrder } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Package, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { useSearch } from 'wouter';

const STATUS_STEPS = ['new', 'processing', 'packed', 'shipped', 'delivered'];

export default function TrackOrder() {
  const [searchString] = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialRef = searchParams.get('ref') || '';
  
  const [orderNumber, setOrderNumber] = useState(initialRef);
  const [searchQuery, setSearchQuery] = useState(initialRef);

  const { data: order, isLoading, isError, error } = useTrackOrder(searchQuery, {
    query: { enabled: !!searchQuery, retry: false }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      setSearchQuery(orderNumber.trim());
    }
  };

  const getStepStatus = (step: string) => {
    if (!order) return 'pending';
    if (order.orderStatus === 'cancelled') return 'cancelled';
    
    const currentIndex = STATUS_STEPS.indexOf(order.orderStatus);
    const stepIndex = STATUS_STEPS.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <StoreLayout>
      <div className="bg-primary text-primary-foreground py-16 md:py-24 border-b border-border relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-2xl">
          <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">Track Your Order</h1>
          <p className="text-primary-foreground/80 mb-8 text-lg">Enter your order number to see the current status of your handcrafted pieces.</p>
          
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input 
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Order Number (e.g. ORD-123...)"
                className="pl-12 h-14 bg-background text-foreground text-lg rounded-xl border-0 shadow-lg"
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-8 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg font-bold">
              Track
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 min-h-[40vh]">
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}

        {isError && (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground text-lg">Please check the order number and try again. It usually starts with ORD-.</p>
          </div>
        )}

        {order && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-10 mb-8">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-10 pb-6 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Order Number</p>
                  <h2 className="font-mono text-2xl font-bold text-foreground">{order.orderNumber}</h2>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Order Date</p>
                  <p className="text-lg font-medium">{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              {order.orderStatus === 'cancelled' ? (
                <div className="bg-destructive/10 text-destructive p-6 rounded-xl text-center border border-destructive/20">
                  <XCircle size={48} className="mx-auto mb-4" />
                  <h3 className="font-serif text-2xl font-bold mb-2">Order Cancelled</h3>
                  <p>This order has been cancelled. If you have questions, please contact our support team.</p>
                </div>
              ) : (
                <div className="py-8">
                  {/* Timeline Desktop */}
                  <div className="hidden md:flex justify-between relative">
                    <div className="absolute top-6 left-10 right-10 h-1 bg-muted rounded-full -z-10"></div>
                    <div 
                      className="absolute top-6 left-10 h-1 bg-primary rounded-full -z-10 transition-all duration-1000"
                      style={{ width: `${(STATUS_STEPS.indexOf(order.orderStatus) / (STATUS_STEPS.length - 1)) * 100}%` }}
                    ></div>
                    
                    {STATUS_STEPS.map((step, idx) => {
                      const status = getStepStatus(step);
                      let Icon = Clock;
                      if (step === 'new') Icon = Package;
                      if (step === 'packed') Icon = Package;
                      if (step === 'shipped') Icon = Truck;
                      if (step === 'delivered') Icon = CheckCircle2;
                      
                      return (
                        <div key={step} className="flex flex-col items-center relative z-10 w-24">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
                            status === 'completed' ? 'bg-primary text-primary-foreground shadow-lg' :
                            status === 'current' ? 'bg-secondary text-secondary-foreground shadow-lg ring-4 ring-secondary/30' :
                            'bg-muted text-muted-foreground border-2 border-background'
                          }`}>
                            <Icon size={20} />
                          </div>
                          <span className={`text-sm font-bold uppercase tracking-wider ${
                            status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
                          }`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Timeline Mobile */}
                  <div className="md:hidden space-y-8 relative pl-6">
                    <div className="absolute top-2 bottom-2 left-2 w-1 bg-muted rounded-full -z-10"></div>
                    <div 
                      className="absolute top-2 left-2 w-1 bg-primary rounded-full -z-10 transition-all duration-1000"
                      style={{ height: `${(STATUS_STEPS.indexOf(order.orderStatus) / (STATUS_STEPS.length - 1)) * 100}%` }}
                    ></div>
                    
                    {STATUS_STEPS.map((step) => {
                      const status = getStepStatus(step);
                      let Icon = Clock;
                      if (step === 'new') Icon = Package;
                      if (step === 'packed') Icon = Package;
                      if (step === 'shipped') Icon = Truck;
                      if (step === 'delivered') Icon = CheckCircle2;
                      
                      return (
                        <div key={step} className="flex items-center gap-6 relative z-10">
                          <div className={`w-10 h-10 -ml-[18px] rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                            status === 'completed' ? 'bg-primary text-primary-foreground shadow-lg' :
                            status === 'current' ? 'bg-secondary text-secondary-foreground shadow-lg ring-4 ring-secondary/30' :
                            'bg-muted text-muted-foreground border-2 border-background'
                          }`}>
                            <Icon size={16} />
                          </div>
                          <span className={`text-base font-bold uppercase tracking-wider ${
                            status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
                          }`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {order.trackingNumber && (
                <div className="mt-8 bg-muted/30 p-6 rounded-xl border border-border flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Truck className="text-primary" size={24} />
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Tracking via {order.shippingProvider}</p>
                      <p className="font-mono font-bold text-lg">{order.trackingNumber}</p>
                    </div>
                  </div>
                  <Button variant="outline">Track on Carrier Site</Button>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
              <h3 className="font-serif text-xl font-bold mb-6">Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Items</h4>
                  <div className="space-y-3 bg-muted/20 p-4 rounded-lg border border-border">
                    {(() => {
                      try {
                        const items = JSON.parse(order.items);
                        return items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="truncate pr-4">{item.quantity} × {item.productName}</span>
                            <span className="font-medium whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        ));
                      } catch { return null; }
                    })()}
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Payment Summary</h4>
                    <div className="bg-muted/20 p-4 rounded-lg border border-border space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">₹{order.subtotal.toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-medium">{order.shippingCharge === 0 ? 'Free' : `₹${order.shippingCharge}`}</span></div>
                      {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span className="font-medium">-₹{order.discount.toLocaleString('en-IN')}</span></div>}
                      <div className="flex justify-between pt-2 mt-2 border-t border-border font-bold text-base"><span>Total Paid</span><span>₹{order.total.toLocaleString('en-IN')}</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Delivery</h4>
                    <p className="bg-muted/20 p-4 rounded-lg border border-border text-sm leading-relaxed">
                      {order.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
