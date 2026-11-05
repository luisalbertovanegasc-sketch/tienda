import React from 'react';
import { ShoppingBag, Eye, Tag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Product } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart, formatPrice } = useCart();

  const hasOffer = product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.price;
  const discountPercent = hasOffer
    ? Math.round(((product.price - product.offerPrice!) / product.price) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 4;

  const displayPrice = hasOffer ? product.offerPrice! : product.price;

  return (
    <div className="group relative bg-[#121824] border border-[#273449] hover:border-amber-500/50 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-[#0B0E14] overflow-hidden flex items-center justify-center">
        {product.mainImage ? (
          <img
            src={product.mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500 p-4 text-center">
            <Tag className="w-10 h-10 mb-2 text-amber-500/40" />
            <span className="text-xs text-gray-400">Sin imagen</span>
          </div>
        )}

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {hasOffer && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md">
              -{discountPercent}% OFF
            </span>
          )}
          {product.categoryName && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#0B0E14]/80 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
              {product.categoryName}
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-950/80 border border-red-500 text-red-300 flex items-center gap-1 backdrop-blur-sm">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              Agotado
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 border border-amber-500 text-amber-300 flex items-center gap-1 backdrop-blur-sm">
              Últimas {product.stock}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-center gap-1 backdrop-blur-sm">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              Stock: {product.stock}
            </span>
          )}
        </div>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-4">
          <button
            onClick={() => onViewDetails(product)}
            className="px-4 py-2 bg-[#182030] hover:bg-amber-500 hover:text-black text-white text-xs font-semibold rounded-xl border border-amber-500/40 flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Ver Detalle
          </button>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
            <span className="font-mono text-amber-500/80">SKU: {product.code}</span>
          </div>

          <h3
            onClick={() => onViewDetails(product)}
            className="text-sm font-semibold text-gray-100 group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>

          <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description || 'Sin descripción detallada.'}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-[#273449]/60 flex items-center justify-between gap-2">
          <div>
            <div className="text-base sm:text-lg font-bold text-amber-400 font-mono">
              {formatPrice(displayPrice)}
            </div>
            {hasOffer && (
              <div className="text-xs text-gray-500 line-through font-mono">
                {formatPrice(product.price)}
              </div>
            )}
          </div>

          <button
            disabled={isOutOfStock}
            onClick={() => addToCart(product, 1)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
              isOutOfStock
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black cursor-pointer hover:shadow-orange-500/20 active:scale-95'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
