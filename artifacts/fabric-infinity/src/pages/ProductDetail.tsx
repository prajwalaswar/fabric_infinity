import { StoreLayout } from '@/components/layout/StoreLayout';
import { useGetProduct, getGetProductQueryKey, useListReviews } from '@workspace/api-client-react';
import { useParams, Link } from 'wouter';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Minus, Plus, ChevronRight, Star, Truck, RefreshCcw, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function categorySlug(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id, 10);
  
  const { data: product, isLoading } = useGetProduct(productId, { 
    query: { enabled: !!id && !isNaN(productId), queryKey: getGetProductQueryKey(productId) } 
  });
  const { data: reviews } = useListReviews({ productId });
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-12 animate-pulse">
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <div className="w-full aspect-[4/5] bg-muted rounded-xl"></div>
              <div className="flex gap-4">
                {[1,2,3].map(i => <div key={i} className="w-20 aspect-square bg-muted rounded-md"></div>)}
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-6">
              <div className="h-10 bg-muted w-3/4 rounded"></div>
              <div className="h-6 bg-muted w-1/4 rounded"></div>
              <div className="h-8 bg-muted w-1/3 rounded"></div>
              <div className="h-32 bg-muted w-full rounded"></div>
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-32 text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">Product not found</h2>
          <Link href="/shop"><Button>Return to Shop</Button></Link>
        </div>
      </StoreLayout>
    );
  }

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.offerPrice || product.price,
      image: product.images[0],
      quantity,
    });
    toast({
      title: "Added to Cart",
      description: `${quantity} × ${product.name} has been added to your cart.`,
    });
  };

  const images = product.images?.length > 0 ? product.images : [];
  const discountPercent = product.offerPrice && product.price > product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  return (
    <StoreLayout>
      <div className="bg-muted/20 py-3 border-b border-border text-sm">
        <div className="container mx-auto px-4 md:px-6 flex items-center text-muted-foreground overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} className="mx-2 flex-shrink-0" />
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight size={14} className="mx-2 flex-shrink-0" />
          <Link href={`/shop?category=${categorySlug(product.categoryName)}`} className="hover:text-primary transition-colors">{product.categoryName}</Link>
          <ChevronRight size={14} className="mx-2 flex-shrink-0" />
          <span className="text-foreground font-medium">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col md:flex-row gap-10 lg:gap-16">
        {/* Images */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="relative aspect-[4/5] bg-muted rounded-xl overflow-hidden border border-border">
            {images[selectedImage] ? (
              <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image available</div>
            )}
            
            {discountPercent > 0 && (
              <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground font-bold px-3 py-1 rounded-sm shadow-md">
                {discountPercent}% OFF
              </div>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 aspect-square flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-primary shadow-sm' : 'border-transparent hover:border-primary/50'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 flex flex-col">
          <p className="text-accent font-semibold tracking-wider text-sm uppercase mb-2">{product.categoryName}</p>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-secondary">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} size={18} fill={(product.averageRating || 5) >= star ? "currentColor" : "none"} className={((product.averageRating || 5) >= star ? "text-secondary" : "text-muted-foreground")} />
              ))}
              <span className="text-muted-foreground text-sm ml-2">({product.reviewCount || 0} reviews)</span>
            </div>
          </div>

          <div className="flex items-baseline gap-4 mb-6 pb-6 border-b border-border">
            {product.offerPrice ? (
              <>
                <span className="text-3xl font-bold text-foreground">₹{product.offerPrice.toLocaleString('en-IN')}</span>
                <span className="text-xl text-muted-foreground line-through">₹{product.price.toLocaleString('en-IN')}</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-foreground">₹{product.price.toLocaleString('en-IN')}</span>
            )}
            <span className="text-sm text-muted-foreground uppercase">Taxes included</span>
          </div>

          <div className="prose prose-sm md:prose-base text-muted-foreground mb-8">
            <p>{product.description}</p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between">
              <span className="font-medium">Quantity</span>
              <span className={`text-sm font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-500' : 'text-destructive'}`}>
                {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border border-border rounded-md h-12 w-full sm:w-32 bg-background">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 h-full text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
                  disabled={quantity <= 1 || product.stock <= 0}
                >
                  <Minus size={16} />
                </button>
                <span className="flex-1 text-center font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="px-4 h-full text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
                  disabled={quantity >= product.stock || product.stock <= 0}
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <Button 
                size="lg" 
                className="flex-1 h-12 text-base font-semibold"
                disabled={product.stock <= 0}
                onClick={handleAddToCart}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border pt-6 mt-auto">
            <div className="flex flex-col items-center text-center gap-2 p-4 bg-muted/30 rounded-lg">
              <Truck className="text-primary" size={24} />
              <span className="text-xs font-medium uppercase tracking-wider">Free Shipping above ₹999</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-4 bg-muted/30 rounded-lg">
              <RefreshCcw className="text-primary" size={24} />
              <span className="text-xs font-medium uppercase tracking-wider">Easy 7-day Returns</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-4 bg-muted/30 rounded-lg">
              <ShieldCheck className="text-primary" size={24} />
              <span className="text-xs font-medium uppercase tracking-wider">100% Authentic Handcraft</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs section */}
      <div className="container mx-auto px-4 md:px-6 py-12 border-t border-border">
        <Tabs defaultValue="details" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50">
            <TabsTrigger value="details" className="text-base py-3">Fabric & Care</TabsTrigger>
            <TabsTrigger value="reviews" className="text-base py-3">Reviews ({reviews?.length || 0})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="bg-card p-6 md:p-8 rounded-xl border border-border prose max-w-none">
            <h3 className="font-serif">The Craft & Details</h3>
            <p className="whitespace-pre-line">{product.fabricDetails || "Authentic Indian handcraft. Pure material."}</p>
            <h4>Care Instructions</h4>
            <ul>
              <li>First wash dry clean recommended</li>
              <li>Hand wash separately in cold water</li>
              <li>Do not soak or bleach</li>
              <li>Dry in shade</li>
              <li>Colors may bleed in the first few washes due to natural dyes</li>
            </ul>
          </TabsContent>
          
          <TabsContent value="reviews" className="bg-card p-6 md:p-8 rounded-xl border border-border">
            {reviews?.length ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{review.customerName}</p>
                        <div className="flex text-secondary mt-1">
                          {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={review.rating >= s ? "currentColor" : "none"} className={review.rating >= s ? "text-secondary" : "text-muted"} />)}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    {review.comment && <p className="text-muted-foreground mt-3">{review.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Be the first to review this beautiful creation.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StoreLayout>
  );
}
