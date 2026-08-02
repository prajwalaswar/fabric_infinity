import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdminListProducts, useAdminDeleteProduct } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useAdminListProducts({ search, page, limit: 10 });
  const deleteProduct = useAdminDeleteProduct();

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct.mutateAsync({ id });
      toast({ title: "Product deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed to delete", description: e.message });
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your catalogue</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2"><Plus size={16} /> Add Product</Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/10">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading products...</td></tr>
              ) : data?.products.length ? (
                data.products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-md overflow-hidden flex-shrink-0">
                          {product.images && product.images[0] && (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">{product.name}</p>
                          <div className="flex gap-2 mt-1">
                            {product.isFeatured && <span className="text-[10px] bg-secondary/20 text-secondary-foreground px-1.5 rounded uppercase font-bold tracking-wider">Featured</span>}
                            {product.isBestseller && <span className="text-[10px] bg-primary/10 text-primary px-1.5 rounded uppercase font-bold tracking-wider">Bestseller</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{product.categoryName}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-foreground">₹{product.price.toLocaleString()}</span>
                      {product.offerPrice && <span className="text-xs text-destructive ml-2 line-through">₹{product.offerPrice.toLocaleString()}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stock > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.isActive ? (
                        <CheckCircle2 size={18} className="text-green-500 mx-auto" />
                      ) : (
                        <XCircle size={18} className="text-muted-foreground mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Edit size={16} /></Button>
                        </Link>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 size={16} /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{product.name}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No products found. Add your first piece.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {data && data.total > data.limit && (
          <div className="p-4 border-t border-border flex justify-between items-center bg-muted/10">
            <span className="text-sm text-muted-foreground">Showing {(page-1)*data.limit + 1} to {Math.min(page*data.limit, data.total)} of {data.total} entries</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p=>Math.max(1, p-1))} disabled={page===1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p=>p+1)} disabled={page*data.limit >= data.total}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
