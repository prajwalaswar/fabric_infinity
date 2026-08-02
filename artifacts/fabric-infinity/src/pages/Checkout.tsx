import { StoreLayout } from '@/components/layout/StoreLayout';
import { useCart } from '@/contexts/CartContext';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { 
  useCreateOrder, 
  useValidateCoupon,
  useVerifyRazorpayPayment,
  OrderInputPaymentMethod 
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { Tag } from 'lucide-react';

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().min(10, "Valid 10-digit phone number is required"),
  address: z.string().min(10, "Full delivery address is required"),
  paymentMethod: z.enum([OrderInputPaymentMethod.razorpay, OrderInputPaymentMethod.cod]),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [couponCode, setCouponCode] = useState('');
  const [discountData, setDiscountData] = useState<{ amount: number; code: string } | null>(null);
  
  const createOrder = useCreateOrder();
  const validateCoupon = useValidateCoupon();
  const verifyPayment = useVerifyRazorpayPayment();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      address: '',
      paymentMethod: OrderInputPaymentMethod.cod,
      notes: '',
    },
  });

  useEffect(() => {
    if (items.length === 0) {
      setLocation('/cart');
    }
  }, [items, setLocation]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      const res = await validateCoupon.mutateAsync({ 
        data: { code: couponCode, orderAmount: cartTotal } 
      });
      
      if (res.valid) {
        setDiscountData({ amount: res.discountAmount, code: couponCode });
        toast({ title: "Coupon Applied", description: `Discount of ₹${res.discountAmount} applied.` });
      } else {
        toast({ variant: "destructive", title: "Invalid Coupon", description: res.message });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Could not validate coupon" });
    }
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      const orderItems = items.map(i => ({
        productId: i.productId,
        productName: i.name,
        productImage: i.image,
        price: i.price,
        quantity: i.quantity,
        variant: i.variant
      }));

      const res = await createOrder.mutateAsync({
        data: {
          ...data,
          items: orderItems,
          couponCode: discountData?.code,
        }
      });

      if (data.paymentMethod === 'razorpay' && res.razorpayOrderId) {
        // Load razorpay script if not present
        if (!window.Razorpay) {
          await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = resolve;
            document.body.appendChild(script);
          });
        }

        const options = {
          key: res.razorpayKeyId,
          amount: res.amount,
          currency: "INR",
          name: "Fabric Infinity",
          description: `Order ${res.order.orderNumber}`,
          order_id: res.razorpayOrderId,
          handler: async function (response: any) {
            try {
              await verifyPayment.mutateAsync({
                data: {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  orderNumber: res.order.orderNumber
                }
              });
              clearCart();
              setLocation(`/order-confirmation/${res.order.orderNumber}`);
            } catch (err) {
              toast({ variant: "destructive", title: "Payment Verification Failed", description: "Please contact support." });
            }
          },
          prefill: {
            name: data.customerName,
            email: data.customerEmail,
            contact: data.customerPhone
          },
          theme: {
            color: "#2E3A6B" // primary color
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // COD
        clearCart();
        setLocation(`/order-confirmation/${res.order.orderNumber}`);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Order Failed', description: error.message || 'Something went wrong' });
    }
  };

  const subtotal = cartTotal;
  const shipping = subtotal > 999 ? 0 : 100;
  const discount = discountData?.amount || 0;
  const total = subtotal + shipping - discount;

  if (items.length === 0) return null;

  return (
    <StoreLayout>
      <div className="bg-muted/30 py-8 border-b border-border">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="font-serif text-3xl font-bold text-foreground">Checkout</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 flex flex-col lg:flex-row gap-12 lg:items-start">
        {/* Form */}
        <div className="lg:w-3/5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              
              {/* Contact Info */}
              <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm">
                <h2 className="font-serif text-2xl font-semibold mb-6 pb-2 border-b border-border">Contact Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="customerName" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="customerEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><Input type="email" placeholder="jane@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="customerPhone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input placeholder="9876543210" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm">
                <h2 className="font-serif text-2xl font-semibold mb-6 pb-2 border-b border-border">Delivery</h2>
                <div className="space-y-6">
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complete Address (with pincode)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="123 Artisan Block, Handloom Street, Jaipur, Rajasthan 302001" className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Leave at the front desk, call before arriving..." {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm">
                <h2 className="font-serif text-2xl font-semibold mb-6 pb-2 border-b border-border">Payment Method</h2>
                <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border border-border p-4 bg-background cursor-pointer hover:border-primary transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                          <FormControl><RadioGroupItem value="razorpay" /></FormControl>
                          <FormLabel className="font-medium flex-1 cursor-pointer">
                            Pay Online
                            <p className="text-xs text-muted-foreground font-normal mt-1">UPI, Credit/Debit Cards, NetBanking</p>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border border-border p-4 bg-background cursor-pointer hover:border-primary transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                          <FormControl><RadioGroupItem value="cod" /></FormControl>
                          <FormLabel className="font-medium flex-1 cursor-pointer">
                            Cash on Delivery
                            <p className="text-xs text-muted-foreground font-normal mt-1">Pay at your doorstep</p>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold" disabled={createOrder.isPending}>
                {createOrder.isPending ? 'Processing...' : `Place Order • ₹${total.toLocaleString('en-IN')}`}
              </Button>
            </form>
          </Form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:w-2/5">
          <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm sticky top-24">
            <h2 className="font-serif text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="divide-y divide-border mb-6">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variant}`} className="py-4 flex gap-4">
                  <div className="relative w-16 aspect-square bg-muted rounded-md overflow-hidden flex-shrink-0">
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                    {item.variant && <p className="text-xs text-muted-foreground mt-1">{item.variant}</p>}
                  </div>
                  <div className="font-medium text-sm">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-6 border-b border-border pb-6">
              <div className="relative flex-1">
                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Coupon code" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="pl-9"
                  disabled={!!discountData || validateCoupon.isPending}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handleApplyCoupon}
                disabled={!couponCode || !!discountData || validateCoupon.isPending}
              >
                Apply
              </Button>
            </div>
            
            <div className="space-y-3 mb-6 text-sm">
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
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({discountData?.code})</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-border pt-4 bg-muted/20 -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 md:p-8 rounded-b-xl">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-lg text-foreground">Total</span>
                <span className="font-bold text-3xl text-primary">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
