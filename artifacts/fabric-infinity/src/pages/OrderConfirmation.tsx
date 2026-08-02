import { StoreLayout } from '@/components/layout/StoreLayout';
import { useParams, Link } from 'wouter';
import { useTrackOrder, getTrackOrderQueryKey } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag, Package } from 'lucide-react';

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  
  const { data: order, isLoading } = useTrackOrder(orderNumber || '', { 
    query: { queryKey: getTrackOrderQueryKey(orderNumber || ''), enabled: !!orderNumber } 
  });

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-32 flex justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </StoreLayout>
    );
  }

  if (!order) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-32 text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">Order not found</h2>
          <Link href="/shop"><Button>Return to Shop</Button></Link>
        </div>
      </StoreLayout>
    );
  }

  let items = [];
  try {
    items = JSON.parse(order.items);
  } catch (e) {}

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-3xl">
        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden text-center">
          {/* Header */}
          <div className="bg-primary/5 py-12 px-6 border-b border-border">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-primary" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-2">Thank you for your order!</h1>
            <p className="text-muted-foreground text-lg mb-6">Your beautifully handcrafted pieces are getting ready.</p>
            <div className="inline-flex items-center gap-2 bg-background px-4 py-2 rounded-full border border-border font-mono text-sm font-semibold tracking-wider">
              <Package size={16} className="text-muted-foreground" />
              Order # {order.orderNumber}
            </div>
          </div>

          {/* Details */}
          <div className="p-8 md:p-12 text-left">
            <h3 className="font-serif font-semibold text-xl mb-6">Order Details</h3>
            
            <div className="divide-y divide-border mb-8 bg-muted/20 rounded-xl p-6 border border-border">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  <div className="w-16 aspect-square bg-background rounded border border-border overflow-hidden">
                    {item.productImage ? (
                      <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-medium">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
              
              <div className="pt-6 space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{order.shippingCharge === 0 ? 'Free' : `₹${order.shippingCharge}`}</span>
                </div>
                {(order.discount ?? 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount!.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between pt-4 mt-2 border-t border-border font-bold text-lg text-foreground">
                  <span>Total Paid</span>
                  <span>₹{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div>
                <h4 className="font-medium text-muted-foreground mb-2 uppercase tracking-wider text-xs">Delivery Address</h4>
                <p className="text-foreground leading-relaxed whitespace-pre-line bg-muted/20 p-4 rounded-lg border border-border h-full">
                  <span className="font-semibold block mb-1">{order.customerName}</span>
                  {order.address}<br/>
                  Phone: {order.customerPhone}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-muted-foreground mb-2 uppercase tracking-wider text-xs">Payment Method</h4>
                <div className="bg-muted/20 p-4 rounded-lg border border-border h-full">
                  <p className="font-semibold uppercase">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                  <p className="text-muted-foreground mt-1">Status: <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>{order.paymentStatus.toUpperCase()}</span></p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/track-order?ref=${order.orderNumber}`}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12">Track Status</Button>
              </Link>
              <Link href="/shop">
                <Button size="lg" className="w-full sm:w-auto h-12 gap-2"><ShoppingBag size={18} /> Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
