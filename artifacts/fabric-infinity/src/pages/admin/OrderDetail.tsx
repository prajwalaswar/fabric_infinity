import { useParams } from 'wouter';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdminGetOrder, getAdminGetOrderQueryKey, useAdminUpdateOrder } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Loader2, Package, Truck, CheckCircle2, Clock } from 'lucide-react';

const ORDER_STATUSES = ['new', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-purple-100 text-purple-800 border-purple-200',
  packed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  shipped: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useAdminGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getAdminGetOrderQueryKey(orderId) }
  });
  const updateOrder = useAdminUpdateOrder();

  const [orderStatus, setOrderStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingProvider, setShippingProvider] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (order) {
      setOrderStatus(order.orderStatus || 'new');
      setTrackingNumber(order.trackingNumber || '');
      setShippingProvider(order.shippingProvider || '');
      setNotes(order.notes || '');
    }
  }, [order]);

  const handleSave = async () => {
    try {
      await updateOrder.mutateAsync({
        id: orderId,
        data: { orderStatus, trackingNumber: trackingNumber || undefined, shippingProvider: shippingProvider || undefined, notes: notes || undefined }
      });
      toast({ title: 'Order updated' });
      queryClient.invalidateQueries({ queryKey: getAdminGetOrderQueryKey(orderId) });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Update failed', description: err instanceof Error ? err.message : 'Unknown error' });
    }
  };

  if (isLoading) {
    return <AdminLayout><div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" size={32} /></div></AdminLayout>;
  }

  if (!order) {
    return <AdminLayout><div className="text-center py-16 text-muted-foreground">Order not found</div></AdminLayout>;
  }

  let items: { name: string; price: number; quantity: number; variant?: string }[] = [];
  try { items = JSON.parse(order.items); } catch {}

  let address: Record<string, string> = {};
  try { address = JSON.parse(order.address); } catch { address = { address: order.address }; }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/orders">
            <Button variant="ghost" size="sm" className="gap-2"><ArrowLeft size={16} /> Orders</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold">Order #{order.orderNumber}</h1>
            <p className="text-muted-foreground text-sm">{new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</p>
          </div>
          <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.orderStatus] || ''}`}>
            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between items-start py-3 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      {item.variant && <p className="text-xs text-muted-foreground mt-0.5">Variant: {item.variant}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{order.shippingCharge === 0 ? 'Free' : `₹${order.shippingCharge}`}</span></div>
                {(order.discount ?? 0) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount}</span></div>}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-border"><span>Total</span><span>₹{order.total?.toLocaleString('en-IN')}</span></div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-4">Customer Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Name</p><p className="font-medium">{order.customerName}</p></div>
                <div><p className="text-muted-foreground">Email</p><p className="font-medium">{order.customerEmail}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{order.customerPhone}</p></div>
                <div><p className="text-muted-foreground">Payment</p><p className="font-medium capitalize">{order.paymentMethod} — <span className={order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}>{order.paymentStatus}</span></p></div>
              </div>
              <div className="mt-4">
                <p className="text-muted-foreground text-sm mb-1">Delivery Address</p>
                <p className="text-sm font-medium whitespace-pre-line">
                  {typeof address === 'object' ? Object.values(address).filter(Boolean).join(', ') : order.address}
                </p>
              </div>
              {order.couponCode && (
                <div className="mt-3 text-sm"><p className="text-muted-foreground">Coupon Used</p><p className="font-medium text-green-600">{order.couponCode}</p></div>
              )}
            </div>
          </div>

          {/* Update Panel */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <h2 className="font-semibold">Update Order</h2>

              <div className="space-y-2">
                <Label>Order Status</Label>
                <Select value={orderStatus} onValueChange={setOrderStatus}>
                  <SelectTrigger data-testid="select-order-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tracking Number</Label>
                <Input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="AWB / Tracking ID" data-testid="input-tracking-number" />
              </div>

              <div className="space-y-2">
                <Label>Shipping Provider</Label>
                <Input value={shippingProvider} onChange={e => setShippingProvider(e.target.value)} placeholder="e.g. Delhivery, BlueDart" data-testid="input-shipping-provider" />
              </div>

              <div className="space-y-2">
                <Label>Internal Notes</Label>
                <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" data-testid="input-notes" />
              </div>

              <Button onClick={handleSave} disabled={updateOrder.isPending} className="w-full" data-testid="button-save-order">
                {updateOrder.isPending ? <><Loader2 className="animate-spin mr-2" size={16} />Saving...</> : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
