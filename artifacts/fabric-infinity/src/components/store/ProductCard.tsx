import { Link } from 'wouter';
import { Product } from '@workspace/api-client-react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import type { CartItem } from '@/contexts/CartContext';

export function ProductCard({ product }: { product: Product }) {
  const discountPercent = product.offerPrice && product.price > product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;
  const { addItem } = useCart();

  return (
    <div className="group relative flex flex-col bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] transition-all duration-400">
      {/* Image */}
      <Link href={`/product/${product.id}`} className="block relative overflow-hidden aspect-[3/4] bg-[#f5f1ec]">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-107"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8a7968] text-sm">No image</div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNewArrival && (
            <span className="bg-[hsl(220,40%,18%)] text-white text-[10px] font-semibold px-2.5 py-1 uppercase tracking-wider">
              New
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-[hsl(16,65%,48%)] text-white text-[10px] font-semibold px-2.5 py-1 uppercase tracking-wider">
              Bestseller
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-white text-[hsl(16,65%,48%)] border border-[hsl(16,65%,48%)] text-[10px] font-semibold px-2.5 py-1 uppercase tracking-wider">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-[hsl(220,40%,18%)] text-white text-xs font-semibold px-4 py-2 uppercase tracking-widest">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick add button — appears on hover */}
        {product.stock > 0 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              const cartItem: CartItem = {
                productId: product.id,
                name: product.name,
                image: product.images?.[0] ?? null,
                price: product.offerPrice ?? product.price,
                quantity: 1,
              };
              addItem(cartItem);
            }}
            className="absolute bottom-0 left-0 right-0 bg-[hsl(220,40%,18%)] text-white py-3 text-[11px] font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          >
            <ShoppingBag size={13} />
            Quick Add
          </button>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-1">
        {product.categoryName && (
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8a7968]">{product.categoryName}</p>
        )}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-serif text-[15px] font-medium leading-snug text-[hsl(220,30%,18%)] hover:text-[hsl(16,65%,48%)] transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mt-1">
          {product.offerPrice ? (
            <>
              <span className="text-[15px] font-semibold text-[hsl(220,30%,18%)]">
                ₹{product.offerPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-[#8a7968] line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </>
          ) : (
            <span className="text-[15px] font-semibold text-[hsl(220,30%,18%)]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
