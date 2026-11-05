import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  DollarSign,
  X,
} from 'lucide-react';
import { Customer, Order } from '../../types.ts';
import { createCustomer } from '../../services/api.ts';
import { useCart } from '../../context/CartContext.tsx';

interface CustomerManagementProps {
  customers: Customer[];
  orders: Order[];
  onRefresh: () => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  customers,
  orders,
  onRefresh,
}) => {
  const { formatPrice } = useCart();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerOrders, setSelectedCustomerOrders] = useState<Order[] | null>(null);
  const [customerModalTitle, setCustomerModalTitle] = useState('');

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenCreate = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCity('');
    setNotes('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Nombre y correo son requeridos.');
      return;
    }

    setIsSaving(true);
    try {
      await createCustomer({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        notes: notes.trim(),
      });
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar cliente');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewOrders = (c: Customer) => {
    const custOrders = orders.filter((o) => o.customerId === c.id || o.customerEmail.toLowerCase() === c.email.toLowerCase());
    setSelectedCustomerOrders(custOrders);
    setCustomerModalTitle(c.name);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.city && c.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Directorio de Clientes
          </h2>
          <p className="text-xs text-gray-400">
            Registro, direcciones habituales e historial de compras de tus compradores
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-orange-500/20 cursor-pointer transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Cliente</span>
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar cliente por nombre, email, teléfono o ciudad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-[#121824] border border-[#273449] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl bg-[#121824] border border-[#273449] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#273449] bg-[#182030]/60 text-gray-400">
                <th className="py-3 px-4 font-semibold">Cliente</th>
                <th className="py-3 px-4 font-semibold">Contacto</th>
                <th className="py-3 px-4 font-semibold">Dirección de Envío</th>
                <th className="py-3 px-4 font-semibold">Ciudad</th>
                <th className="py-3 px-4 font-semibold text-center">Compras</th>
                <th className="py-3 px-4 font-semibold">Gasto Acumulado</th>
                <th className="py-3 px-4 font-semibold text-right">Historial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273449]/40">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Users className="w-8 h-8 text-amber-500/30 mx-auto mb-2" />
                    <p className="font-semibold text-gray-300">No hay clientes registrados</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Los clientes se registrarán automáticamente al realizar compras o puedes crearlos manualmente.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#182030]/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-amber-500" />
                        {c.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        {c.phone || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300 max-w-xs truncate">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-400 flex-shrink-0" />
                        <span>{c.address || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{c.city || '—'}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-amber-400">
                      {c.orderCount || 0}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {formatPrice(c.totalSpent || 0)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleViewOrders(c)}
                        className="px-3 py-1.5 rounded-xl bg-[#273449] hover:bg-amber-500 hover:text-black text-gray-200 text-xs font-semibold transition-colors"
                      >
                        Ver Compras
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#121824] border border-[#273449] rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#273449] bg-[#182030]/80 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Registrar Nuevo Cliente
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#273449]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Martínez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="laura@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="Ej: 310 987 6543"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">Ciudad</label>
                  <input
                    type="text"
                    placeholder="Ej: Medellín"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Dirección de Envío</label>
                <input
                  type="text"
                  placeholder="Ej: Cra 45 # 12-34, Apto 201"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Notas del Cliente</label>
                <input
                  type="text"
                  placeholder="Observaciones de preferencias o notas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#273449]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#273449] hover:bg-gray-700 text-gray-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-black text-xs font-bold shadow-md hover:scale-102 transition-transform cursor-pointer"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Historial de Compras del Cliente */}
      {selectedCustomerOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-[#121824] border border-[#273449] rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#273449] bg-[#182030]/80 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Historial de Compras</h3>
                <p className="text-xs text-amber-400 font-semibold">{customerModalTitle}</p>
              </div>
              <button
                onClick={() => setSelectedCustomerOrders(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#273449]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto space-y-3">
              {selectedCustomerOrders.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-xs">
                  Este cliente no tiene pedidos registrados todavía.
                </div>
              ) : (
                selectedCustomerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 rounded-xl bg-[#0B0E14] border border-[#273449] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-amber-400 font-bold block">
                        {ord.orderNumber}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('es-CO') : '—'} • Estado: {ord.status}
                      </span>
                    </div>

                    <div className="font-mono font-bold text-white text-sm">
                      {formatPrice(ord.total)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
