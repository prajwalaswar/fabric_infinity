import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetSettings, useUpdateSettings } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';

type SettingsState = {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  freeShippingThreshold: string;
  standardShippingCharge: string;
  razorpayEnabled: boolean;
  codEnabled: boolean;
  instagramUrl: string;
  facebookUrl: string;
  whatsappNumber: string;
  metaTitle: string;
  metaDescription: string;
  announcementBar: string;
};

const toStr = (v: unknown) => (v === null || v === undefined ? '' : String(v));
const toBool = (v: unknown) => v === true || v === 'true';

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState<SettingsState>({
    storeName: 'Fabric Infinity', storeEmail: '', storePhone: '', storeAddress: '',
    freeShippingThreshold: '999', standardShippingCharge: '60',
    razorpayEnabled: true, codEnabled: true,
    instagramUrl: '', facebookUrl: '', whatsappNumber: '',
    metaTitle: 'Fabric Infinity', metaDescription: '', announcementBar: '',
  });

  useEffect(() => {
    if (data) {
      setForm({
        storeName: toStr(data.storeName),
        storeEmail: toStr(data.storeEmail),
        storePhone: toStr(data.storePhone),
        storeAddress: toStr(data.storeAddress),
        freeShippingThreshold: toStr(data.freeShippingThreshold),
        standardShippingCharge: toStr(data.standardShippingCharge),
        razorpayEnabled: toBool(data.razorpayEnabled),
        codEnabled: toBool(data.codEnabled),
        instagramUrl: toStr(data.instagramUrl),
        facebookUrl: toStr(data.facebookUrl),
        whatsappNumber: toStr(data.whatsappNumber),
        metaTitle: toStr(data.metaTitle),
        metaDescription: toStr(data.metaDescription),
        announcementBar: toStr(data.announcementBar),
      });
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        data: {
          ...form,
          freeShippingThreshold: Number(form.freeShippingThreshold),
          standardShippingCharge: Number(form.standardShippingCharge),
        } as Record<string, unknown>
      });
      toast({ title: 'Settings saved' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Save failed', description: err instanceof Error ? err.message : 'Unknown error' });
    }
  };

  if (isLoading) {
    return <AdminLayout><div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" size={32} /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Store configuration and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={updateSettings.isPending} className="gap-2" data-testid="button-save-settings">
          {updateSettings.isPending ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : <><Save size={16} /> Save Changes</>}
        </Button>
      </div>

      <div className="space-y-8 max-w-2xl">
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-lg">Store Information</h2>
          <div className="space-y-2"><Label>Store Name</Label><Input value={form.storeName} onChange={e => setForm(p => ({...p, storeName: e.target.value}))} data-testid="input-store-name" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.storeEmail} onChange={e => setForm(p => ({...p, storeEmail: e.target.value}))} placeholder="support@..." data-testid="input-store-email" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.storePhone} onChange={e => setForm(p => ({...p, storePhone: e.target.value}))} placeholder="+91 98765 43210" data-testid="input-store-phone" /></div>
          </div>
          <div className="space-y-2"><Label>Address</Label><Textarea value={form.storeAddress} onChange={e => setForm(p => ({...p, storeAddress: e.target.value}))} rows={3} data-testid="textarea-store-address" /></div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-lg">Shipping</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Free Shipping Threshold (₹)</Label><Input type="number" value={form.freeShippingThreshold} onChange={e => setForm(p => ({...p, freeShippingThreshold: e.target.value}))} min="0" data-testid="input-free-shipping-threshold" /></div>
            <div className="space-y-2"><Label>Standard Shipping Charge (₹)</Label><Input type="number" value={form.standardShippingCharge} onChange={e => setForm(p => ({...p, standardShippingCharge: e.target.value}))} min="0" data-testid="input-shipping-charge" /></div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-lg">Payment Methods</h2>
          <div className="flex items-center justify-between">
            <div><p className="font-medium">Razorpay (Online)</p><p className="text-xs text-muted-foreground">Cards, UPI, Net Banking, Wallets</p></div>
            <Switch checked={form.razorpayEnabled} onCheckedChange={v => setForm(p => ({...p, razorpayEnabled: v}))} data-testid="switch-razorpay-enabled" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div><p className="font-medium">Cash on Delivery</p><p className="text-xs text-muted-foreground">Pay when the order arrives</p></div>
            <Switch checked={form.codEnabled} onCheckedChange={v => setForm(p => ({...p, codEnabled: v}))} data-testid="switch-cod-enabled" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-lg">Social Media</h2>
          <div className="space-y-2"><Label>Instagram URL</Label><Input value={form.instagramUrl} onChange={e => setForm(p => ({...p, instagramUrl: e.target.value}))} placeholder="https://instagram.com/..." data-testid="input-instagram-url" /></div>
          <div className="space-y-2"><Label>Facebook URL</Label><Input value={form.facebookUrl} onChange={e => setForm(p => ({...p, facebookUrl: e.target.value}))} placeholder="https://facebook.com/..." data-testid="input-facebook-url" /></div>
          <div className="space-y-2"><Label>WhatsApp Number</Label><Input value={form.whatsappNumber} onChange={e => setForm(p => ({...p, whatsappNumber: e.target.value}))} placeholder="919876543210" data-testid="input-whatsapp-number" /></div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-lg">SEO & Announcement</h2>
          <div className="space-y-2"><Label>Meta Title</Label><Input value={form.metaTitle} onChange={e => setForm(p => ({...p, metaTitle: e.target.value}))} data-testid="input-meta-title" /></div>
          <div className="space-y-2"><Label>Meta Description</Label><Textarea value={form.metaDescription} onChange={e => setForm(p => ({...p, metaDescription: e.target.value}))} rows={3} data-testid="textarea-meta-description" /></div>
          <div className="space-y-2"><Label>Announcement Bar Text</Label><Input value={form.announcementBar} onChange={e => setForm(p => ({...p, announcementBar: e.target.value}))} placeholder="Free shipping on orders above ₹999 | COD available" data-testid="input-announcement-bar" /></div>
        </div>
      </div>
    </AdminLayout>
  );
}
