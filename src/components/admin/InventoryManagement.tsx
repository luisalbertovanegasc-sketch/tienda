import React, { useState } from 'react';
import {
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Search,
  History,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Product, InventoryMovement } from '../../types.ts';
import { registerInventoryMovement } from '../../services/api.ts';

interface InventoryManagementProps {
  products: Product[];
  movements: InventoryMovement[];
  onRefresh: () => void;
  isMovementModalOpen: boolean;
  setIsMovementModalOpen: (open: boolean) => void;
  selectedProductIdForModal?: number;
}

export const InventoryManagement: React.FC<InventoryManagementProps> = ({
  products,
  movements,
  onRefresh,
  isMovementModalOpen,
  setIsMovementModalOpen,
  selectedProductIdForModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'stock' | 'history'>('stock');
  const [search, setSearch] = useState('');

  // Form Movement State
  const [productId, setProductId] = useState<string>(
    selectedProductIdForModal ? String(selectedProductIdForModal) : ''
  );
  const [type, setType] = useState<'entry' | 'exit'>('entry');
  const [quantity, setQuantity] = useState<string>('1');
  const [reason, setReason] = useState<string>('Compra a proveedor');
  const [performedBy, setPerformedBy] = useState<string>('Administrador');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenMovementModal = (pId?: number) => {
    setProductId(pId ? String(pId) : products[0] ? String(products[0].id) : '');
    setType('entry');
    setQuantity('1');
    setReason('Compra a proveedor');
    setPerformedBy('Administrador');
    setErrorMsg('');
    setIsMovementModalOpen(true);
  };

  const handleSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const pId = Number(productId);
    const qty = Number(quantity);

    if (!pId || !qty || qty <= 0) {
      setErrorMsg('Selecciona un producto y una cantidad válida mayor a 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerInventoryMovement({
        productId: pId,
        type,
        quantity: qty,
        reason: reason.trim(),
        performedBy: performedBy.trim(),
      });
      setIsMovementModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar el movimiento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMovements = movements.filter(
    (m) =>
      (m.productName && m.productName.toLowerCase().includes(search.toLowerCase())) ||
      (m.productCode && m.productCode.toLowerCase().includes(search.toLowerCase())) ||
      m.reason.toLowerCase().includes(search.toLowerCase())
  );

  const outOfStockCount = products.filter((p) => p.stock <= 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            Control de Inventario y Existencias
          </h2>
          <p className="text-xs text-gray-400">
            Supervisa entradas, salidas de mercancía y alertas automáticas de reposición
          </p>
        </div>

        <button
          onClick={() => handleOpenMovementModal()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-orange-500/20 cursor-pointer transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Movimiento</span>
        </button>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#121824] border border-[#273449] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400">Unidades Totales</span>
            <div className="text-lg font-bold text-white font-mono">{totalUnits} uds</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121824] border border-[#273449] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400">Stock Bajo (&le; 5 uds)</span>
            <div className="text-lg font-bold text-amber-400 font-mono">{lowStockCount} refs</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121824] border border-[#273449] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400">Agotados (0 stock)</span>
            <div className="text-lg font-bold text-red-400 font-mono">{outOfStockCount} refs</div>
          </div>
        </div>
      </div>

      {/* Sub Tabs: Existencias vs Historial */}
      <div className="flex border-b border-[#273449] gap-4">
        <button
          onClick={() => setActiveSubTab('stock')}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'stock'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Existencias Actuales</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'history'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historial de Movimientos ({movements.length})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={activeSubTab === 'stock' ? 'Buscar producto o código...' : 'Buscar por motivo o producto...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-[#121824] border border-[#273449] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* SubTab 1: Stock actual */}
      {activeSubTab === 'stock' && (
        <div className="rounded-2xl bg-[#121824] border border-[#273449] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#273449] bg-[#182030]/60 text-gray-400">
                  <th className="py-3 px-4 font-semibold">Producto</th>
                  <th className="py-3 px-4 font-semibold">SKU</th>
                  <th className="py-3 px-4 font-semibold">Categoría</th>
                  <th className="py-3 px-4 font-semibold">Stock Actual</th>
                  <th className="py-3 px-4 font-semibold">Nivel de Alerta</th>
                  <th className="py-3 px-4 font-semibold text-right">Ajustar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#273449]/40">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500">
                      No hay productos registrados en bodega.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isOut = p.stock <= 0;
                    const isLow = p.stock > 0 && p.stock <= 5;
                    return (
                      <tr key={p.id} className="hover:bg-[#182030]/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">{p.name}</td>
                        <td className="py-3 px-4 font-mono text-amber-400">{p.code}</td>
                        <td className="py-3 px-4 text-gray-300">{p.categoryName || '—'}</td>
                        <td className="py-3 px-4 font-mono font-bold text-base text-white">
                          {p.stock}
                        </td>
                        <td className="py-3 px-4">
                          {isOut ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-300 border border-red-500/40 flex items-center gap-1 w-max">
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                              Agotado
                            </span>
                          ) : isLow ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40 flex items-center gap-1 w-max">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              Stock Bajo
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Óptimo
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenMovementModal(p.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#273449] hover:bg-amber-500 hover:text-black text-gray-200 text-xs font-semibold transition-colors"
                          >
                            + Movimiento
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 2: Historial de movimientos */}
      {activeSubTab === 'history' && (
        <div className="rounded-2xl bg-[#121824] border border-[#273449] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#273449] bg-[#182030]/60 text-gray-400">
                  <th className="py-3 px-4 font-semibold">Fecha / Hora</th>
                  <th className="py-3 px-4 font-semibold">Producto</th>
                  <th className="py-3 px-4 font-semibold">Tipo</th>
                  <th className="py-3 px-4 font-semibold">Cantidad</th>
                  <th className="py-3 px-4 font-semibold">Stock Ant. &rarr; Nuevo</th>
                  <th className="py-3 px-4 font-semibold">Motivo</th>
                  <th className="py-3 px-4 font-semibold">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#273449]/40">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500">
                      No se han registrado movimientos de inventario todavía.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-[#182030]/40 transition-colors">
                      <td className="py-3 px-4 text-gray-400">
                        {m.createdAt ? new Date(m.createdAt).toLocaleString('es-CO') : '—'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {m.productName || `ID ${m.productId}`}
                        <span className="block text-[10px] text-amber-500 font-mono">
                          {m.productCode}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {m.type === 'entry' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1">
                            <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
                            Entrada
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-300 border border-red-500/40 inline-flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3 text-red-400" />
                            Salida
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                        {m.type === 'entry' ? `+${m.quantity}` : `-${m.quantity}`}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-300">
                        {m.previousStock} &rarr; <strong className="text-amber-400">{m.newStock}</strong>
                      </td>
                      <td className="py-3 px-4 text-gray-200">{m.reason}</td>
                      <td className="py-3 px-4 text-gray-400">{m.performedBy || 'Admin'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Registrar Movimiento */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#121824] border border-[#273449] rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#273449] bg-[#182030]/80 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                Registrar Movimiento de Inventario
              </h3>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#273449]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitMovement} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-300 mb-1">Producto a Ajustar *</label>
                <select
                  required
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Selecciona un producto...</option>
                  {products.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name} ({p.code}) — Stock actual: {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Tipo de Movimiento *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setType('entry');
                      setReason('Compra a proveedor');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      type === 'entry'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md'
                        : 'bg-[#0B0E14] border-[#273449] text-gray-400 hover:text-white'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                    <span>Entrada (Sumar Stock)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setType('exit');
                      setReason('Ajuste manual');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      type === 'exit'
                        ? 'bg-red-500/20 border-red-500 text-red-300 shadow-md'
                        : 'bg-[#0B0E14] border-[#273449] text-gray-400 hover:text-white'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-red-400" />
                    <span>Salida (Restar Stock)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">Cantidad *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">Responsable</label>
                  <input
                    type="text"
                    value={performedBy}
                    onChange={(e) => setPerformedBy(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Motivo del Movimiento *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 mb-2"
                >
                  {type === 'entry' ? (
                    <>
                      <option value="Compra a proveedor">Compra a proveedor</option>
                      <option value="Devolución de cliente">Devolución de cliente</option>
                      <option value="Ajuste positivo por inventario físico">Ajuste positivo por inventario físico</option>
                      <option value="Ingreso de muestra comercial">Ingreso de muestra comercial</option>
                    </>
                  ) : (
                    <>
                      <option value="Venta manual directa">Venta manual directa</option>
                      <option value="Merma o producto dañado">Merma o producto dañado</option>
                      <option value="Ajuste negativo por inventario físico">Ajuste negativo por inventario físico</option>
                      <option value="Garantía / Reposición">Garantía / Reposición</option>
                    </>
                  )}
                </select>
                <input
                  type="text"
                  placeholder="Detalle o nota adicional..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0B0E14] border border-[#273449] rounded-lg text-xs text-gray-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#273449]">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#273449] hover:bg-gray-700 text-gray-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-black text-xs font-bold shadow-md hover:scale-102 transition-transform cursor-pointer"
                >
                  {isSubmitting ? 'Guardando...' : 'Confirmar Movimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
