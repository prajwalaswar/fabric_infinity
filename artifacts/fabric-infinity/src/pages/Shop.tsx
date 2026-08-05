import { StoreLayout } from '@/components/layout/StoreLayout';
import { ProductCard } from '@/components/store/ProductCard';
import { useListProducts, useListCategories, useAdminDeleteProduct } from '@workspace/api-client-react';
import { useLocation, useSearch } from 'wouter';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, SlidersHorizontal, ChevronRight, Search, Link, Trash2, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function Shop() {
  const [searchString, setSearchString] = useSearch();
  const searchParams = new URLSearchParams(searchString);
  
  const categoryParam = searchParams.get('category') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const searchTerm = searchParams.get('search') || '';

  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [ownerMode, setOwnerMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useListProducts({
    category: categoryParam,
    sort: sortParam as any,
    search: searchTerm,
    limit: 24,
  });

  const { data: categories } = useListCategories();
  const deleteProduct = useAdminDeleteProduct();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchString);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Update wouter search string
    window.history.pushState(null, '', `?${params.toString()}`);
    // wouter doesn't have a hook to just set search, so we trigger a soft reload of the component
    // or just let wouter catch the popstate if we dispatch it
    window.dispatchEvent(new Event('popstate'));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange('search', localSearch);
  };

  const handleDeleteRequest = (productId: number) => {
    setProductToDelete(productId);
    setDeletePassword('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    // Simple password check - in production, this should verify against backend
    const OWNER_PASSWORD = 'owner123'; // Change this to your secure password
    
    if (deletePassword !== OWNER_PASSWORD) {
      toast({ 
        variant: 'destructive', 
        title: 'Incorrect password', 
        description: 'Please enter the correct owner password.' 
      });
      return;
    }

    try {
      await deleteProduct.mutateAsync({ id: productToDelete });
      toast({ title: '✓ Product deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      setDeletePassword('');
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Failed to delete', 
        description: error.message || 'Something went wrong' 
      });
    }
  };

  return (
    <StoreLayout>
      <div className="bg-muted/30 py-8 border-b border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight size={14} className="mx-2" />
              <span className="text-foreground font-medium">Shop</span>
            </div>
            <Button
              variant={ownerMode ? "destructive" : "outline"}
              size="sm"
              onClick={() => setOwnerMode(!ownerMode)}
              className="gap-2"
            >
              <Lock size={14} />
              {ownerMode ? 'Exit Owner Mode' : 'Owner Mode'}
            </Button>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground">
            {categoryParam ? (
              categoryParam.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            ) : 'All Collection'}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8 md:sticky md:top-24">
          <div>
            <h3 className="font-serif font-semibold text-lg flex items-center gap-2 mb-4 border-b border-border pb-2">
              <Filter size={18} /> Filters
            </h3>
            
            <div className="space-y-6">
              {/* Search */}
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search products..." 
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </form>

              {/* Categories */}
              <div>
                <h4 className="font-medium mb-3">Categories</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => handleFilterChange('category', '')}
                    className={`block w-full text-left text-sm py-1 ${!categoryParam ? 'font-semibold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    All Categories
                  </button>
                  {categories?.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => handleFilterChange('category', cat.slug)}
                      className={`block w-full text-left text-sm py-1 ${categoryParam === cat.slug ? 'font-semibold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {cat.name} ({cat.productCount || 0})
                    </button>
                  ))}
                  <button 
                    onClick={() => handleFilterChange('category', 'new-arrivals')}
                    className={`block w-full text-left text-sm py-1 ${categoryParam === 'new-arrivals' ? 'font-semibold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    New Arrivals
                  </button>
                  <button 
                    onClick={() => handleFilterChange('category', 'bestsellers')}
                    className={`block w-full text-left text-sm py-1 ${categoryParam === 'bestsellers' ? 'font-semibold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Bestsellers
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Product Grid */}
        <main className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {productsData?.products.length || 0} products
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium whitespace-nowrap"><SlidersHorizontal size={16} className="inline mr-2" />Sort by:</span>
              <Select value={sortParam} onValueChange={(val) => handleFilterChange('sort', val)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse flex flex-col gap-3">
                  <div className="bg-muted aspect-[4/5] rounded-lg"></div>
                  <div className="h-4 bg-muted w-2/3 rounded"></div>
                  <div className="h-4 bg-muted w-1/3 rounded"></div>
                </div>
              ))}
            </div>
          ) : productsData?.products.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-lg border border-border border-dashed">
              <h3 className="font-serif text-2xl font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">We couldn't find any products matching your filters.</p>
              <Button onClick={() => { handleFilterChange('category', ''); handleFilterChange('search', ''); setLocalSearch(''); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {productsData?.products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  ownerMode={ownerMode}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Dialog with Password */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🔒 Owner Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the owner password to delete this product. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter owner password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleDeleteConfirm();
                }
              }}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Default password: <code className="bg-muted px-1 py-0.5 rounded">owner123</code> (change this in production!)
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeletePassword('');
              setProductToDelete(null);
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StoreLayout>
  );
}
