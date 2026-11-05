import React, { useEffect, useState } from 'react';
import {
  X,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { Product } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';
import { suggestAiRelatedProducts } from '../services/api.ts';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectProduct,
}) => {
  const { addToCart, formatPrice } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [crossSellTip, setCrossSellTip] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.mainImage || '');
      setQuantity(1);
      setRelatedProducts([]);
      setCrossSellTip('');

      // Fetch related products with AI
      setLoadingAi(true);
      suggestAiRelatedProducts(product.id)
        .then((res) => {
          setRelatedProducts(res.relatedProducts || []);
          setCrossSellTip(res.tip || '');
        })
        .catch((err) => {
          console.warn('AI suggestions error:', err);
        })
        .finally(() => setLoadingAi(false));
    }
  }, [product]);

  if (!product) return null;

  let galleryImages: string[] = [];
  try {
    if (product.gallery) {
      galleryImages = JSON.parse(product.gallery);
    }
  } catch {
    galleryImages = [];
  }

  const allImages = [
    product.mainImage,
    ...galleryImages.filter((img) => img && img !== product.mainImage),
  ].filter(Boolean) as string[];

  const hasOffer = product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.price;
  const displayPrice = hasOffer ? product.offerPrice! : product.price;
  const isOutOfStock = product.stock <= 0;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Mira este producto en Tienda en Línea Fénix: ${product.name}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace del producto copiado al portapapeles');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#121824] border border-[#273449] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#182030]/80 hover:bg-amber-500 hover:text-black text-gray-300 transition-colors border border-[#273449]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Images Section */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#0B0E14] border border-[#273449] flex items-center justify-center">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                  }}
                />
              ) : (
                <div className="text-gray-500 flex flex-col items-center">
                  <Tag className="w-12 h-12 text-amber-500/40 mb-2" />
                  <span className="text-sm">Sin imagen disponible</span>
                </div>
              )}

              {hasOffer && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg">
                  OFERTA ESPECIAL
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                      selectedImage === img
                        ? 'border-amber-500 shadow-md shadow-amber-500/20'
                        : 'border-[#273449] hover:border-gray-500 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#273449]/60 text-center text-[11px] text-gray-400">
              <div className="flex flex-col items-center p-2 rounded-xl bg-[#182030]/50 border border-[#273449]/40">
                <ShieldCheck className="w-4 h-4 text-amber-400 mb-1" />
                <span>Garantía Fénix</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-[#182030]/50 border border-[#273449]/40">
                <Truck className="w-4 h-4 text-orange-400 mb-1" />
                <span>Envío Seguro</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-[#182030]/50 border border-[#273449]/40">
                <RotateCcw className="w-4 h-4 text-yellow-400 mb-1" />
                <span>Soporte 24/7</span>
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                {product.categoryName && (
                  <span className="px-2.5 py-1 rounded-md bg-[#182030] text-amber-300 border border-amber-500/30 font-medium">
                    {product.categoryName}
                  </span>
                )}
                <span className="font-mono text-gray-400">SKU: {product.code}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                {product.name}
              </h2>

              {/* Price & Discounts */}
              <div className="flex items-baseline gap-3 my-4 p-3 bg-[#182030]/60 rounded-2xl border border-[#273449]">
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                  {formatPrice(displayPrice)}
                </div>
                {hasOffer && (
                  <div className="text-sm sm:text-base text-gray-500 line-through font-mono">
                    {formatPrice(product.price)}
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {isOutOfStock ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-950/80 border border-red-500 text-red-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    Producto Agotado temporalmente
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Disponible: {product.stock} unidades en bodega
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="border-t border-[#273449] pt-4 mb-6">
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Descripción del Producto
                </h4>
                <div className="text-sm text-gray-300 leading-relaxed space-y-2 whitespace-pre-line max-h-48 overflow-y-auto pr-1">
                  {product.description || 'Sin descripción ingresada por el administrador.'}
                </div>
              </div>
            </div>

            {/* Actions: Quantity & Add to Cart */}
            <div className="space-y-4 pt-4 border-t border-[#273449]">
              {!isOutOfStock && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-300">Cantidad:</span>
                  <div className="flex items-center border border-[#273449] rounded-xl overflow-hidden bg-[#0B0E14]">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-gray-300 hover:bg-[#182030] text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-semibold text-amber-400 min-w-10 text-center font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="px-3 py-1.5 text-gray-300 hover:bg-[#182030] text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  disabled={isOutOfStock}
                  onClick={() => {
                    addToCart(product, quantity);
                    onClose();
                  }}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                    isOutOfStock
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-black cursor-pointer shadow-orange-500/20 active:scale-98'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isOutOfStock ? 'Agotado' : 'Añadir al Carrito'}
                </button>

                <button
                  onClick={handleShare}
                  className="p-3 rounded-xl bg-[#182030] hover:bg-[#273449] text-gray-300 border border-[#273449] transition-colors cursor-pointer"
                  title="Compartir producto"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations Section */}
        {relatedProducts.length > 0 && (
          <div className="p-6 bg-[#0B0E14] border-t border-[#273449]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                Sugerencias Inteligentes Fénix
              </h3>
              {crossSellTip && (
                <span className="text-xs text-gray-400 hidden sm:inline ml-auto italic">
                  💡 {crossSellTip}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectProduct(rel)}
                  className="p-3 bg-[#121824] border border-[#273449] hover:border-amber-500/50 rounded-xl cursor-pointer group transition-all"
                >
                  <div className="aspect-square w-full rounded-lg overflow-hidden bg-black mb-2">
                    <img
                      src={rel.mainImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h5 className="text-xs font-semibold text-gray-200 line-clamp-1 group-hover:text-amber-400">
                    {rel.name}
                  </h5>
                  <div className="text-xs font-bold text-amber-400 font-mono mt-1">
                    {formatPrice(rel.offerPrice && rel.offerPrice > 0 ? rel.offerPrice : rel.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
