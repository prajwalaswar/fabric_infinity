import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdminListCategories, useAdminCreateCategory, useAdminUpdateCategory, useAdminDeleteCategory } from '@workspace/api-client-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminCategories() {
  const { data: categories, isLoading } = useAdminListCategories();
  const createCategory = useAdminCreateCategory();
  const updateCategory = useAdminUpdateCategory();
  const deleteCategory = useAdminDeleteCategory();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ name: '', image: '' });

  const resetForm = () => {
    setFormData({ name: '', image: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (cat: any) => {
    setFormData({ name: cat.name, image: cat.image || '' });
    setEditingId(cat.id);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ variant: "destructive", title: "Name is required" });
      return;
    }

    try {
      if (isAdding) {
        await createCategory.mutateAsync({ data: formData });
        toast({ title: "Category added" });
      } else if (editingId) {
        await updateCategory.mutateAsync({ id: editingId, data: formData });
        toast({ title: "Category updated" });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      resetForm();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This might affect products in this category.")) return;
    try {
      await deleteCategory.mutateAsync({ id });
      toast({ title: "Category deleted" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData(prev => ({ ...prev, image: data.url }));
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed" });
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-1">Organize your product catalogue</p>
        </div>
        {!isAdding && (
          <Button onClick={() => { resetForm(); setIsAdding(true); }} className="gap-2">
            <Plus size={16} /> Add Category
          </Button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium w-24">Image</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Products</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isAdding && (
                <tr className="bg-primary/5">
                  <td className="px-6 py-4">
                    <label className="cursor-pointer flex flex-col items-center justify-center w-12 h-12 bg-background border border-dashed border-border rounded hover:border-primary">
                      {formData.image ? <img src={formData.image} className="w-full h-full object-cover" alt="" /> : <ImageIcon size={16} className="text-muted-foreground" />}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </td>
                  <td className="px-6 py-4">
                    <Input value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="Category name..." autoFocus />
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">-</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={resetForm}><X size={16} /></Button>
                      <Button size="sm" onClick={handleSave} disabled={createCategory.isPending}><Save size={16} className="mr-2"/> Save</Button>
                    </div>
                  </td>
                </tr>
              )}

              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading categories...</td></tr>
              ) : categories?.length ? (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      {editingId === cat.id ? (
                        <label className="cursor-pointer flex flex-col items-center justify-center w-12 h-12 bg-background border border-dashed border-border rounded hover:border-primary">
                          {formData.image ? <img src={formData.image} className="w-full h-full object-cover" alt="" /> : <ImageIcon size={16} className="text-muted-foreground" />}
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded overflow-hidden flex items-center justify-center">
                          {cat.image ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-muted-foreground/50" />}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === cat.id ? (
                        <Input value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
                      ) : (
                        <span className="font-medium text-foreground">{cat.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {cat.productCount || 0} products
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingId === cat.id ? (
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={resetForm}><X size={16} /></Button>
                          <Button size="icon" onClick={handleSave} disabled={updateCategory.isPending}><Save size={16} /></Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(cat)}><Edit size={16} /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(cat.id)}><Trash2 size={16} /></Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : !isAdding && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No categories defined yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
