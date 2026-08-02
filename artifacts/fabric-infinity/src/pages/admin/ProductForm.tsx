import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { AdminLayout } from '@/components/layout/AdminLayout';
import {
  useAdminCreateProduct,
  useAdminUpdateProduct,
  useAdminGetProduct,
  getAdminGetProductQueryKey,
  useAdminListCategories,
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { Link } from 'wouter';

interface ProductFormState {
  name: string;
  description: string;
  fabricDetails: string;
  price: string;
  offerPrice: string;
  stock: string;
  categoryId: string;
  images: string[];
  variants: string;
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  isActive: boolean;
}

const defaultState: ProductFormState = {
  name: '',
  description: '',
  fabricDetails: '',
  price: '',
  offerPrice: '',
  stock: '0',
  categoryId: '',
  images: [],
  variants: '',
  isFeatured: false,
  isBestseller: false,
  isNewArrival: false,
  isActive: true,
};

export default function ProductForm() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<ProductFormState>(defaultState);
  const [uploading, setUploading] = useState(false);

  const { data: product, isLoading: productLoading } = useAdminGetProduct(
    Number(id),
    { query: { enabled: isEditing, queryKey: getAdminGetProductQueryKey(Number(id)) } }
  );
  const { data: categories } = useAdminListCategories();
  const createProduct = useAdminCreateProduct();
  const updateProduct = useAdminUpdateProduct();

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        fabricDetails: product.fabricDetails || '',
        price: product.price?.toString() || '',
        offerPrice: product.offerPrice?.toString() || '',
        stock: product.stock?.toString() || '0',
        categoryId: product.categoryId?.toString() || '',
        images: product.images || [],
        variants: product.variants || '',
        isFeatured: product.isFeatured || false,
        isBestseller: product.isBestseller || false,
        isNewArrival: product.isNewArrival || false,
        isActive: product.isActive !== false,
      });
    }
  }, [product]);

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
      setForm(prev => ({ ...prev, images: [...prev.images, data.url] }));
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Upload failed', description: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast({ variant: 'destructive', title: 'Name and price are required' });
      return;
    }

    const payload = {
      name: form.name,
      description: form.description || undefined,
      fabricDetails: form.fabricDetails || undefined,
      price: parseFloat(form.price),
      offerPrice: form.offerPrice ? parseFloat(form.offerPrice) : undefined,
      stock: parseInt(form.stock, 10) || 0,
      categoryId: form.categoryId ? parseInt(form.categoryId, 10) : 0,
      images: form.images,
      variants: form.variants || undefined,
      isFeatured: form.isFeatured,
      isBestseller: form.isBestseller,
      isNewArrival: form.isNewArrival,
      isActive: form.isActive,
    };

    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id: Number(id), data: payload });
        toast({ title: 'Product updated' });
      } else {
        await createProduct.mutateAsync({ data: payload });
        toast({ title: 'Product created' });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      setLocation('/admin/products');
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Save failed', description: err instanceof Error ? err.message : 'Unknown error' });
    }
  };

  if (isEditing && productLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" size={32} /></div>
      </AdminLayout>
    );
  }

  const isSaving = createProduct.isPending || updateProduct.isPending;

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/products">
            <Button variant="ghost" size="sm" className="gap-2"><ArrowLeft size={16} /> Back</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold">{isEditing ? 'Edit Product' : 'New Product'}</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <h2 className="font-semibold text-lg">Basic Information</h2>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Ajrakh Handblock Cotton Fabric" required data-testid="input-product-name" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input id="price" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="1499" required min="0" step="0.01" data-testid="input-price" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offerPrice">Offer Price (₹)</Label>
                <Input id="offerPrice" type="number" value={form.offerPrice} onChange={e => setForm(p => ({ ...p, offerPrice: e.target.value }))} placeholder="Optional" min="0" step="0.01" data-testid="input-offer-price" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input id="stock" type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} min="0" data-testid="input-stock" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.categoryId} onValueChange={val => setForm(p => ({ ...p, categoryId: val }))}>
                  <SelectTrigger data-testid="select-category"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="Describe the fabric, origin, use cases..." data-testid="textarea-description" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fabricDetails">Fabric Details</Label>
              <Input id="fabricDetails" value={form.fabricDetails} onChange={e => setForm(p => ({ ...p, fabricDetails: e.target.value }))} placeholder="e.g. 100% Cotton | Handblock Printed | Width: 44 inches" data-testid="input-fabric-details" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">Product Images</h2>
            <div className="flex flex-wrap gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative group w-24 h-24">
                  <img src={img} alt="" className="w-full h-full object-cover rounded-lg border border-border" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary transition-colors">
                {uploading ? <Loader2 className="animate-spin text-muted-foreground" size={20} /> : <><Upload size={20} className="text-muted-foreground" /><span className="text-xs text-muted-foreground">Upload</span></>}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} data-testid="input-image-upload" />
              </label>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">Labels & Visibility</h2>
            {[
              { key: 'isFeatured', label: 'Featured' },
              { key: 'isBestseller', label: 'Bestseller' },
              { key: 'isNewArrival', label: 'New Arrival' },
              { key: 'isActive', label: 'Active (visible to customers)' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label>{label}</Label>
                <Switch
                  checked={form[key as keyof ProductFormState] as boolean}
                  onCheckedChange={v => setForm(p => ({ ...p, [key]: v }))}
                  data-testid={`switch-${key}`}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSaving} className="px-8" data-testid="button-save-product">
              {isSaving ? <><Loader2 className="animate-spin mr-2" size={16} />Saving...</> : isEditing ? 'Update Product' : 'Create Product'}
            </Button>
            <Link href="/admin/products">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
