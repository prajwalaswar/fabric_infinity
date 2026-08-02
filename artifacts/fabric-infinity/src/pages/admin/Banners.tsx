import { AdminLayout } from '@/components/layout/AdminLayout';
import {
  useAdminListBanners,
  useAdminCreateBanner,
  useAdminUpdateBanner,
  useAdminDeleteBanner,
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, Loader2 } from 'lucide-react';

interface BannerFormState {
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  sortOrder: string;
}

const defaultForm: BannerFormState = { image: '', title: '', subtitle: '', ctaText: '', ctaLink: '/shop', isActive: true, sortOrder: '0' };

export default function AdminBanners() {
  const { data: banners, isLoading } = useAdminListBanners();
  const createBanner = useAdminCreateBanner();
  const updateBanner = useAdminUpdateBanner();
  const deleteBanner = useAdminDeleteBanner();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BannerFormState>(defaultForm);
  const [uploading, setUploading] = useState(false);

  const resetForm = () => { setForm(defaultForm); setIsAdding(false); setEditingId(null); };

  const handleEdit = (b: NonNullable<typeof banners>[number]) => {
    setForm({ image: b.image || '', title: b.title || '', subtitle: b.subtitle || '', ctaText: b.ctaText || '', ctaLink: b.ctaLink || '/shop', isActive: b.isActive, sortOrder: String(b.sortOrder) });
    setEditingId(b.id);
    setIsAdding(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd, credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm(p => ({ ...p, image: data.url }));
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Upload failed', description: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.image) { toast({ variant: 'destructive', title: 'Image is required' }); return; }
    try {
      const payload = { image: form.image, title: form.title || undefined, subtitle: form.subtitle || undefined, ctaText: form.ctaText || undefined, ctaLink: form.ctaLink || undefined, isActive: form.isActive, sortOrder: Number(form.sortOrder) };
      if (isAdding) {
        await createBanner.mutateAsync({ data: payload });
        toast({ title: 'Banner added' });
      } else if (editingId) {
        await updateBanner.mutateAsync({ id: editingId, data: payload });
        toast({ title: 'Banner updated' });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/admin/banners'] });
      resetForm();
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Error', description: err instanceof Error ? err.message : 'Unknown error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await deleteBanner.mutateAsync({ id });
      toast({ title: 'Banner deleted' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/banners'] });
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Error', description: err instanceof Error ? err.message : 'Unknown error' });
    }
  };

  const toggleActive = async (id: number, current: boolean) => {
    try {
      await updateBanner.mutateAsync({ id, data: { isActive: !current } });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/banners'] });
    } catch {}
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">Banners</h1>
          <p className="text-muted-foreground mt-1">Manage homepage carousel banners</p>
        </div>
        <Button onClick={() => { setIsAdding(true); setEditingId(null); setForm(defaultForm); }} className="gap-2" data-testid="button-add-banner">
          <Plus size={16} /> Add Banner
        </Button>
      </div>

      {(isAdding || editingId !== null) && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4">
          <h3 className="font-semibold">{isAdding ? 'New Banner' : 'Edit Banner'}</h3>

          <div className="space-y-2">
            <Label>Image *</Label>
            <div className="flex gap-4 items-center">
              {form.image && <img src={form.image} alt="" className="h-20 rounded-lg object-cover border border-border" />}
              <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors text-sm text-muted-foreground">
                {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
              <span className="text-xs text-muted-foreground">or paste URL:</span>
              <Input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="https://..." className="flex-1" data-testid="input-banner-image" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Banner headline" data-testid="input-banner-title" /></div>
            <div className="space-y-2"><Label>Subtitle</Label><Input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} placeholder="Subheading" data-testid="input-banner-subtitle" /></div>
            <div className="space-y-2"><Label>CTA Text</Label><Input value={form.ctaText} onChange={e => setForm(p => ({ ...p, ctaText: e.target.value }))} placeholder="Shop Now" data-testid="input-banner-cta-text" /></div>
            <div className="space-y-2"><Label>CTA Link</Label><Input value={form.ctaLink} onChange={e => setForm(p => ({ ...p, ctaLink: e.target.value }))} placeholder="/shop" data-testid="input-banner-cta-link" /></div>
            <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))} min="0" data-testid="input-banner-sort-order" /></div>
            <div className="flex items-center gap-3 pt-6"><Label>Active</Label><Switch checked={form.isActive} onCheckedChange={v => setForm(p => ({ ...p, isActive: v }))} data-testid="switch-banner-active" /></div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="gap-2" data-testid="button-save-banner"><Save size={16} /> Save</Button>
            <Button variant="outline" onClick={resetForm} className="gap-2"><X size={16} /> Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading banners...</div>
        ) : !banners?.length ? (
          <div className="p-16 text-center text-muted-foreground">No banners yet. Add your first banner above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4 text-left">Preview</th>
                <th className="px-6 py-4 text-left">Title</th>
                <th className="px-6 py-4 text-left">CTA</th>
                <th className="px-6 py-4 text-center">Order</th>
                <th className="px-6 py-4 text-center">Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {banners.map(b => (
                <tr key={b.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    <img src={b.image} alt="" className="h-16 w-28 object-cover rounded-md border border-border" />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{b.title || '-'}</p>
                    <p className="text-xs text-muted-foreground">{b.subtitle || ''}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{b.ctaText || '-'}</p>
                    <p className="text-xs text-muted-foreground">{b.ctaLink}</p>
                  </td>
                  <td className="px-6 py-4 text-center">{b.sortOrder}</td>
                  <td className="px-6 py-4 text-center">
                    <Switch checked={b.isActive} onCheckedChange={() => toggleActive(b.id, b.isActive)} data-testid={`switch-banner-active-${b.id}`} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(b)} data-testid={`button-edit-banner-${b.id}`}><Edit size={14} /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(b.id)} data-testid={`button-delete-banner-${b.id}`}><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
