import React, { useState } from 'react';
import {
  ShoppingBag,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Check,
  Building2,
  Smartphone,
  DollarSign,
  CreditCard,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types.ts';
import { updateOrderStatus } from '../../services/api.ts';
import { useCart } from '../../context/CartContext.tsx';

interface OrderManagementProps {
  orders: Order[];
  onRefresh: () => void;
  selectedOrderModal: Order | null;
  setSelectedOrderModal: (order: Order | null) => void;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({
  orders,
  onRefresh,
  selectedOrderModal,
  setSelectedOrderModal,
}) => {
  const { formatPrice } = useCart();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('received');
  const [notes, setNotes] = useState('');

  const handleOpenDetail = (order: Order) => {
    setSelectedOrderModal(order);
    setNewStatus(order.status);
    setNotes(order.notes || '');
  };

  const handleSaveStatus = async () => {
    if (!selectedOrderModal) return;
    setIsUpdating(true);
    try {
      await updateOrderStatus(selectedOrderModal.id, newStatus, notes);
      onRefresh();
      setSelectedOrderModal(null);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar el estado del pedido');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-500/40 flex items-center gap-1 w-max">
            <Clock className="w-3 h-3 text-amber-400" />
            Recibido
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-500/40 flex items-center gap-1 w-max">
            <Package className="w-3 h-3 text-blue-400" />
            En preparación
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-950 text-purple-300 border border-purple-500/40 flex items-center gap-1 w-max">
            <Truck className="w-3 h-3 text-purple-400" />
            Enviado
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 w-max">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Entregado
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-950 text-red-300 border border-red-500/40 flex items-center gap-1 w-max">
            <XCircle className="w-3 h-3 text-red-400" />
            Cancelado
          </span>
        );
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'transfer':
        return <Building2 className="w-3.5 h-3.5 text-amber-400" />;
      case 'nequi':
        return <Smartphone className="w-3.5 h-3.5 text-fuchsia-400" />;
      case 'daviplata':
        return <Smartphone className="w-3.5 h-3.5 text-red-400" />;
      case 'cash_on_delivery':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
      case 'card':
        return <CreditCard className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      search === '' ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          Gestión de Pedidos
        </h2>
        <p className="text-xs text-gray-400">
          Controla los estados de los pedidos: recibido, en preparación, enviado, entregado y cancelado
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        <div className="flex overflow-x-auto border-b border-[#273449] gap-2 pb-1">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'received', label: 'Recibidos' },
            { id: 'preparing', label: 'En Preparación' },
            { id: 'shipped', label: 'Enviados' },
            { id: 'delivered', label: 'Entregados' },
            { id: 'cancelled', label: 'Cancelados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-[#182030]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número de pedido o nombre de cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#121824] border border-[#273449] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-[#121824] border border-[#273449] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#273449] bg-[#182030]/60 text-gray-400">
                <th className="py-3 px-4 font-semibold">No. Pedido</th>
                <th className="py-3 px-4 font-semibold">Fecha</th>
                <th className="py-3 px-4 font-semibold">Cliente</th>
                <th className="py-3 px-4 font-semibold">Destino</th>
                <th className="py-3 px-4 font-semibold">Método de Pago</th>
                <th className="py-3 px-4 font-semibold">Total</th>
                <th className="py-3 px-4 font-semibold">Estado</th>
                <th className="py-3 px-4 font-semibold text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273449]/40">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <ShoppingBag className="w-8 h-8 text-amber-500/30 mx-auto mb-2" />
                    <p className="font-semibold text-gray-300">No hay pedidos en este estado</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#182030]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('es-CO') : '—'}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">{ord.customerName}</td>
                    <td className="py-3 px-4 text-gray-300">
                      {ord.customerCity || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5 uppercase font-medium text-gray-300">
                        {getPaymentMethodIcon(ord.paymentMethod)}
                        {ord.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                      {formatPrice(ord.total)}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(ord.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(ord)}
                        className="px-3 py-1.5 rounded-xl bg-[#273449] hover:bg-amber-500 hover:text-black text-gray-200 text-xs font-semibold flex items-center gap-1 ml-auto transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalle de Pedido & Cambio de Estado */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#121824] border border-[#273449] rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="p-5 border-b border-[#273449] bg-[#182030]/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  {selectedOrderModal.orderNumber}
                </span>
                <h3 className="font-bold text-white text-base">Detalle del Pedido</h3>
              </div>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#273449]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer & Shipping Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#0B0E14] border border-[#273449] text-xs">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-amber-400 uppercase text-[11px] mb-1">
                    Datos del Cliente
                  </h4>
                  <div className="text-white font-semibold text-sm">{selectedOrderModal.customerName}</div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Mail className="w-3.5 h-3.5 text-amber-500" />
                    {selectedOrderModal.customerEmail}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    {selectedOrderModal.customerPhone || 'Sin teléfono'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-amber-400 uppercase text-[11px] mb-1">
                    Dirección de Entrega
                  </h4>
                  <div className="flex items-start gap-1.5 text-gray-300">
                    <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {selectedOrderModal.customerAddress}, {selectedOrderModal.customerCity}
                    </span>
                  </div>
                  {selectedOrderModal.notes && (
                    <div className="p-2 rounded-lg bg-[#182030] text-gray-400 italic mt-1">
                      Nota: "{selectedOrderModal.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Items Purchased List */}
              <div>
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Productos Comprados ({selectedOrderModal.items?.length || 0})
                </h4>
                <div className="rounded-xl border border-[#273449] bg-[#0B0E14] divide-y divide-[#273449]/40 overflow-hidden">
                  {selectedOrderModal.items?.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-[#273449]">
                          <img
                            src={item.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{item.productName}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            SKU: {item.productCode} • Cantidad: {item.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="font-bold text-amber-400">{formatPrice(item.subtotal)}</div>
                        <div className="text-[10px] text-gray-500">{formatPrice(item.unitPrice)} c/u</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals Breakdown */}
              <div className="p-4 rounded-xl bg-[#182030] text-xs space-y-1.5 border border-[#273449]">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatPrice(selectedOrderModal.subtotal)}</span>
                </div>
                {selectedOrderModal.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Descuento</span>
                    <span className="font-mono">-{formatPrice(selectedOrderModal.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-300">
                  <span>Envío</span>
                  <span className="font-mono">{formatPrice(selectedOrderModal.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-[#273449]">
                  <span>Total Pedido</span>
                  <span className="text-amber-400 font-mono">{formatPrice(selectedOrderModal.total)}</span>
                </div>
              </div>

              {/* Status Update Form */}
              <div className="p-4 rounded-2xl bg-[#0B0E14] border border-[#273449] space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Actualizar Estado del Pedido
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Estado</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="w-full px-3 py-2 bg-[#121824] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="received">Recibido</option>
                      <option value="preparing">En preparación</option>
                      <option value="shipped">Enviado</option>
                      <option value="delivered">Entregado</option>
                      <option value="cancelled">Cancelado (Reingresa stock a inventario)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Notas internas de seguimiento</label>
                    <input
                      type="text"
                      placeholder="Ej: Despachado por Servientrega guía #..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-[#121824] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveStatus}
                    disabled={isUpdating}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-black text-xs font-bold shadow-md hover:scale-102 transition-transform cursor-pointer"
                  >
                    {isUpdating ? 'Actualizando...' : 'Guardar Estado'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
