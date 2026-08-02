import { Link } from 'wouter';
import { Product } from '@workspace/api-client-react';

export function ProductCard({ product }: { product: Product }) {
  const discountPercent = product.offerPrice && product.price > product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {product.images && product.images[0] ? (
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNewArrival && (
            <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-sm shadow-sm">
              NEW
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-sm shadow-sm">
              BESTSELLER
            </span>
          )}
        </div>
        
        {discountPercent > 0 && (
          <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-sm shadow-sm">
            {discountPercent}% OFF
          </div>
        )}

        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-foreground text-background font-bold px-4 py-2 rounded-sm uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.categoryName}</p>
        <h3 className="font-serif font-medium text-lg leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <div className="mt-auto flex items-baseline gap-2">
          {product.offerPrice ? (
            <>
              <span className="font-semibold text-lg">₹{product.offerPrice.toLocaleString('en-IN')}</span>
              <span className="text-sm text-muted-foreground line-through">₹{product.price.toLocaleString('en-IN')}</span>
            </>
          ) : (
            <span className="font-semibold text-lg">₹{product.price.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
