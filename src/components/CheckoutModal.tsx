import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Building2,
  Smartphone,
  CreditCard,
  DollarSign,
  MessageCircle,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { StoreSettings, PaymentMethod, Order } from '../types.ts';
import { createOrder } from '../services/api.ts';

interface CheckoutModalProps {
  settings: StoreSettings | null;
  onOrderCompleted?: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ settings, onOrderCompleted }) => {
  const {
    cart,
    subtotal,
    discount,
    shippingCost,
    total,
    clearCart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    formatPrice,
  } = useCart();

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [notes, setNotes] = useState('');

  // Card simulation fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  if (!isCheckoutOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || !customerEmail.trim() || !customerAddress.trim() || !customerCity.trim()) {
      setErrorMessage('Por favor completa todos los campos obligatorios de envío.');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('El carrito no contiene productos.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        customerCity: customerCity.trim(),
        paymentMethod,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        discount,
        shippingCost,
        notes: notes.trim(),
      };

      const res = await createOrder(payload);
      setCreatedOrder(res.order);
      clearCart();
      setStep('success');
      if (onOrderCompleted) {
        onOrderCompleted(res.order);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar el pedido. Verifica el stock disponible.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppMessage = (order: Order) => {
    const phone = (settings?.whatsapp || settings?.phone || '').replace(/\D/g, '');
    const itemsText = (order.items || [])
      .map((it) => `• ${it.quantity}x ${it.productName} ($${it.subtotal.toLocaleString('es-CO')})`)
      .join('%0A');

    const msg = `🔥 *Nuevo Pedido en Tienda en Línea Fénix*%0A%0A` +
      `*No. de Pedido:* ${order.orderNumber}%0A` +
      `*Cliente:* ${order.customerName}%0A` +
      `*Ciudad:* ${order.customerCity}%0A` +
      `*Dirección:* ${order.customerAddress}%0A` +
      `*Teléfono:* ${order.customerPhone || 'N/A'}%0A%0A` +
      `*Productos:*%0A${itemsText}%0A%0A` +
      `*Total a pagar:* $${order.total.toLocaleString('es-CO')}%0A` +
      `*Método de Pago:* ${order.paymentMethod.toUpperCase()}%0A%0A` +
      `Adjunto comprobante de pago para procesar mi orden. ¡Muchas gracias!`;

    return `https://wa.me/${phone}?text=${msg}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#121824] border border-[#273449] rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Top Header */}
        <div className="p-5 border-b border-[#273449] bg-[#182030]/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-black">
              <Flame className="w-5 h-5 fill-black" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {step === 'form' ? 'Finalizar Pedido — Tienda Fénix' : '¡Pedido Confirmado con Éxito!'}
              </h3>
              <p className="text-xs text-gray-400">
                {step === 'form' ? 'Ingresa tus datos de entrega y método de pago' : 'Gracias por tu compra'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#273449] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs">
                {errorMessage}
              </div>
            )}

            {/* 1. Datos del Cliente & Envío */}
            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">
                  1
                </span>
                Datos del Cliente y Dirección de Entrega
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Carlos Gómez"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="carlos@correo.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej: 300 123 4567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">Ciudad / Municipio *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Bogotá, Medellín, Cali..."
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-300 mb-1">Dirección Exacta de Envío *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Calle 100 # 15-20, Apto 402, Torre 2"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-300 mb-1">Notas o Indicaciones de Entrega</label>
                  <input
                    type="text"
                    placeholder="Ej: Dejar en portería, timbre no funciona..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Métodos de Pago */}
            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">
                  2
                </span>
                Selecciona tu Método de Pago
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {/* Transferencia Bancaria */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'transfer'
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow-md'
                      : 'border-[#273449] bg-[#0B0E14] text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-amber-400 mb-2" />
                  <div>
                    <span className="text-xs font-bold block">Transferencia</span>
                    <span className="text-[10px] text-gray-400">Bancolombia / Otros</span>
                  </div>
                </button>

                {/* Nequi */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nequi')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'nequi'
                      ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white shadow-md'
                      : 'border-[#273449] bg-[#0B0E14] text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-fuchsia-400 mb-2" />
                  <div>
                    <span className="text-xs font-bold block">Nequi</span>
                    <span className="text-[10px] text-gray-400">Transferencia móvil</span>
                  </div>
                </button>

                {/* Daviplata */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('daviplata')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'daviplata'
                      ? 'border-red-500 bg-red-500/10 text-white shadow-md'
                      : 'border-[#273449] bg-[#0B0E14] text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-red-400 mb-2" />
                  <div>
                    <span className="text-xs font-bold block">Daviplata</span>
                    <span className="text-[10px] text-gray-400">Transferencia móvil</span>
                  </div>
                </button>

                {/* Contra Entrega */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_on_delivery')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-md'
                      : 'border-[#273449] bg-[#0B0E14] text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <DollarSign className="w-5 h-5 text-emerald-400 mb-2" />
                  <div>
                    <span className="text-xs font-bold block">Contra Entrega</span>
                    <span className="text-[10px] text-gray-400">Efectivo al recibir</span>
                  </div>
                </button>

                {/* Pasarela Tarjeta */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between sm:col-span-2 ${
                    paymentMethod === 'card'
                      ? 'border-cyan-500 bg-cyan-500/10 text-white shadow-md'
                      : 'border-[#273449] bg-[#0B0E14] text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-cyan-400 mb-2" />
                  <div>
                    <span className="text-xs font-bold block">Pasarela de Pagos</span>
                    <span className="text-[10px] text-gray-400">Tarjeta Débito / Crédito</span>
                  </div>
                </button>
              </div>

              {/* Dynamic Payment Details Display */}
              <div className="mt-3 p-3.5 rounded-2xl bg-[#0B0E14] border border-[#273449] text-xs space-y-2">
                {paymentMethod === 'transfer' && (
                  <div>
                    <span className="text-amber-400 font-bold block mb-1">Datos para Transferencia:</span>
                    <div className="p-2.5 rounded-xl bg-[#182030] text-gray-300 font-mono text-[11px] whitespace-pre-line flex items-center justify-between">
                      <span>{settings?.bankDetails || 'Datos bancarios pendientes por configurar por el administrador.'}</span>
                      {settings?.bankDetails && (
                        <button
                          type="button"
                          onClick={() => handleCopy(settings.bankDetails!, 'banco')}
                          className="ml-2 text-amber-400 hover:text-white"
                          title="Copiar datos bancarios"
                        >
                          {copiedText === 'banco' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {paymentMethod === 'nequi' && (
                  <div>
                    <span className="text-fuchsia-400 font-bold block mb-1">Número de Cuenta Nequi:</span>
                    <div className="p-2.5 rounded-xl bg-[#182030] text-gray-300 font-mono text-[12px] flex items-center justify-between">
                      <span>{settings?.nequiNumber || 'Número no configurado'}</span>
                      {settings?.nequiNumber && (
                        <button
                          type="button"
                          onClick={() => handleCopy(settings.nequiNumber!, 'nequi')}
                          className="text-fuchsia-400 hover:text-white"
                          title="Copiar Nequi"
                        >
                          {copiedText === 'nequi' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {paymentMethod === 'daviplata' && (
                  <div>
                    <span className="text-red-400 font-bold block mb-1">Número Daviplata:</span>
                    <div className="p-2.5 rounded-xl bg-[#182030] text-gray-300 font-mono text-[12px] flex items-center justify-between">
                      <span>{settings?.daviplataNumber || 'Número no configurado'}</span>
                      {settings?.daviplataNumber && (
                        <button
                          type="button"
                          onClick={() => handleCopy(settings.daviplataNumber!, 'daviplata')}
                          className="text-red-400 hover:text-white"
                          title="Copiar Daviplata"
                        >
                          {copiedText === 'daviplata' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {paymentMethod === 'cash_on_delivery' && (
                  <p className="text-gray-300">
                    Pagas en efectivo al mensajero en el momento de recibir tu paquete en la puerta de tu casa.
                  </p>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-2 pt-1">
                    <p className="text-gray-400 text-[11px]">
                      Pasarela integrada segura con encriptación SSL de 256 bits.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Número de Tarjeta (16 dígitos)"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="col-span-3 px-3 py-1.5 bg-[#182030] border border-[#273449] rounded-lg text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="col-span-2 px-3 py-1.5 bg-[#182030] border border-[#273449] rounded-lg text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="px-3 py-1.5 bg-[#182030] border border-[#273449] rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Resumen y Total */}
            <div className="p-4 rounded-2xl bg-[#182030] border border-[#273449] space-y-2">
              <div className="flex justify-between text-xs text-gray-300">
                <span>Subtotal ({cart.length} productos)</span>
                <span className="font-mono">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>Descuento aplicado</span>
                  <span className="font-mono">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-300">
                <span>Costo de envío</span>
                <span className="font-mono">
                  {shippingCost === 0 ? <strong className="text-emerald-400">GRATIS</strong> : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-[#273449]">
                <span>Total Final</span>
                <span className="text-amber-400 font-mono text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-black shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Procesando Pedido...</span>
              ) : (
                <>
                  <span>Confirmar y Realizar Pedido</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step Success */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Número de Pedido: {createdOrder?.orderNumber}
              </span>
              <h3 className="text-2xl font-bold text-white mt-3">¡Muchas gracias por tu compra!</h3>
              <p className="text-xs text-gray-300 max-w-md mx-auto mt-2 leading-relaxed">
                Hemos registrado tu pedido con estado <strong>Recibido</strong>. Te mantendremos informado sobre la preparación y despacho de tu paquete.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="p-4 rounded-2xl bg-[#0B0E14] border border-[#273449] max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Cliente:</span>
                <strong className="text-white">{createdOrder?.customerName}</strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Destino:</span>
                <strong className="text-white">{createdOrder?.customerAddress}, {createdOrder?.customerCity}</strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Total cancelado:</span>
                <strong className="text-amber-400 font-mono text-sm">{formatPrice(createdOrder?.total || 0)}</strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Método de pago:</span>
                <strong className="text-white uppercase">{createdOrder?.paymentMethod}</strong>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              {createdOrder && (
                <a
                  href={getWhatsAppMessage(createdOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-102"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Comprobante por WhatsApp</span>
                </a>
              )}

              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setStep('form');
                }}
                className="px-5 py-3 rounded-xl bg-[#273449] hover:bg-gray-700 text-gray-200 text-xs font-semibold"
              >
                Cerrar y Volver a la Tienda
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
