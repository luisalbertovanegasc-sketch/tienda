import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Check,
  Truck,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discount,
    shippingCost,
    total,
    couponCode,
    applyCoupon,
    removeCoupon,
    formatPrice,
    setIsCheckoutOpen,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(false);
    setCouponSuccess(false);

    if (applyCoupon(inputCoupon)) {
      setCouponSuccess(true);
      setInputCoupon('');
    } else {
      setCouponError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-md h-full bg-[#121824] border-l border-[#273449] shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-[#273449] flex items-center justify-between bg-[#182030]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Carrito de Compras</h3>
              <p className="text-xs text-gray-400">
                {cart.length === 0
                  ? 'Tu carrito está vacío'
                  : `${cart.reduce((s, i) => s + i.quantity, 0)} artículos seleccionados`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#273449] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-[#273449]/40">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#182030] flex items-center justify-center text-amber-500/50">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-base font-semibold text-gray-200">No hay productos aún</h4>
              <p className="text-xs text-gray-400 max-w-xs">
                Explora el catálogo de la tienda y agrega los productos que desees comprar.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold text-xs rounded-xl shadow-md hover:scale-105 transition-transform cursor-pointer"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const unitPrice =
                item.product.offerPrice && item.product.offerPrice > 0
                  ? item.product.offerPrice
                  : item.product.price;
              const lineTotal = unitPrice * item.quantity;

              return (
                <div key={item.product.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-[#273449]">
                    <img
                      src={
                        item.product.mainImage ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
                      }
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-gray-200 truncate" title={item.product.name}>
                      {item.product.name}
                    </h4>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                      {formatPrice(unitPrice)} c/u
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-[#273449] rounded-lg bg-[#0B0E14] overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-[#182030] text-gray-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-amber-400 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-1 hover:bg-[#182030] text-gray-400 hover:text-white disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-amber-300 font-mono ml-auto">
                        {formatPrice(lineTotal)}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        title="Eliminar del carrito"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Calculations and Checkout Action */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[#273449] bg-[#182030]/80 space-y-4">
            {/* Free Shipping Progress */}
            <div className="p-2.5 bg-[#121824] rounded-xl border border-[#273449] text-xs">
              <div className="flex items-center justify-between text-gray-300 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  {subtotal >= 150000
                    ? '¡Tienes Envío Gratis!'
                    : `Faltan ${formatPrice(150000 - subtotal)} para Envío Gratis`}
                </span>
                <span className="font-mono text-[10px] text-gray-400">Meta: $150.000</span>
              </div>
              <div className="w-full bg-[#0B0E14] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-amber-400 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotal / 150000) * 100)}%` }}
                />
              </div>
            </div>

            {/* Coupon Code Input */}
            <div>
              {couponCode ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Cupón aplicado: <strong className="font-mono">{couponCode}</strong>
                  </span>
                  <button
                    onClick={removeCoupon}
                    className="text-gray-400 hover:text-red-400 text-xs font-semibold"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Cupón (ej: FENIX10)"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    className="flex-1 bg-[#121824] border border-[#273449] rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 uppercase focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#273449] hover:bg-amber-500 hover:text-black text-gray-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    Aplicar
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-red-400 mt-1">Cupón inválido. Prueba con FENIX10 o VIP</p>
              )}
              {couponSuccess && (
                <p className="text-[11px] text-emerald-400 mt-1">¡Cupón aplicado correctamente!</p>
              )}
            </div>

            {/* Financial Totals Breakdown */}
            <div className="space-y-1.5 text-xs text-gray-300 pt-2 border-t border-[#273449]/60">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-white">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuento aplicado</span>
                  <span className="font-mono">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Costo de Envío</span>
                <span className="font-mono">
                  {shippingCost === 0 ? (
                    <span className="text-emerald-400 font-semibold">GRATIS</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-white pt-2 border-t border-[#273449]">
                <span>Total a pagar</span>
                <span className="text-amber-400 font-mono">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-black shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <span>Proceder al Pago</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
