import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Users,
  Package,
  TrendingUp,
  Plus,
  ArrowRight,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { DashboardMetrics, Order, Product } from '../../types.ts';
import { useCart } from '../../context/CartContext.tsx';

interface AdminDashboardProps {
  metrics: DashboardMetrics | null;
  onNavigateTab: (tab: string) => void;
  onOpenNewProduct: () => void;
  onOpenInventoryModal: (productId?: number) => void;
  onSelectOrder: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  metrics,
  onNavigateTab,
  onOpenNewProduct,
  onOpenInventoryModal,
  onSelectOrder,
}) => {
  const { formatPrice } = useCart();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/50">Recibido</span>;
      case 'preparing':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-500/50">En preparación</span>;
      case 'shipped':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-950/80 text-purple-300 border border-purple-500/50">Enviado</span>;
      case 'delivered':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">Entregado</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-950/80 text-red-300 border border-red-500/50">Cancelado</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-800 text-gray-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#182030] via-[#1E293D] to-[#121824] border border-[#273449] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Panel de Control Fénix
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Gestión Integral del Comercio e Inventario
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Monitorea tus ventas en tiempo real, controla las existencias en bodega, procesa pedidos y maximiza tus utilidades con asistencia de IA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenNewProduct}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-orange-500/20 cursor-pointer transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>

            <button
              onClick={() => onOpenInventoryModal()}
              className="px-4 py-2.5 rounded-xl bg-[#273449] hover:bg-gray-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-gray-600 cursor-pointer transition-colors"
            >
              <Package className="w-4 h-4 text-amber-400" />
              <span>Entrada / Salida Stock</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ventas del Día */}
        <div className="p-5 rounded-2xl bg-[#121824] border border-[#273449] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">Ventas del Día</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">
            {formatPrice(metrics?.todaySales || 0)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{metrics?.todayOrdersCount || 0} órdenes hoy</span>
          </div>
        </div>

        {/* Pedidos Pendientes */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="p-5 rounded-2xl bg-[#121824] border border-[#273449] hover:border-amber-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">Pedidos Pendientes</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">
            {metrics?.pendingOrdersCount || 0}
          </div>
          <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <span>Por despachar o preparar</span>
          </div>
        </div>

        {/* Alertas de Stock Bajo / Agotados */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="p-5 rounded-2xl bg-[#121824] border border-[#273449] hover:border-red-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">Alertas de Stock</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-red-400 font-mono">
            {(metrics?.outOfStockCount || 0) + (metrics?.lowStockCount || 0)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {metrics?.outOfStockCount || 0} agotados / {metrics?.lowStockCount || 0} por agotar
          </div>
        </div>

        {/* Total Clientes */}
        <div
          onClick={() => onNavigateTab('customers')}
          className="p-5 rounded-2xl bg-[#121824] border border-[#273449] hover:border-purple-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">Clientes Registrados</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">
            {metrics?.totalCustomers || 0}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Directorio activo de compradores
          </div>
        </div>
      </div>

      {/* Secondary Metrics: Inventario Valorizado & Ventas Totales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#121824] border border-[#273449] flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 block mb-1">Valor Total de Inventario en Bodega</span>
            <div className="text-xl font-bold text-amber-300 font-mono">
              {formatPrice(metrics?.totalInventoryValue || 0)}
            </div>
            <span className="text-xs text-gray-500">
              {metrics?.totalStockUnits || 0} unidades disponibles en {metrics?.totalProducts || 0} referencias
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="p-3 rounded-xl bg-[#182030] hover:bg-[#273449] text-gray-300 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Ver Inventario</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-[#121824] border border-[#273449] flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 block mb-1">Ingresos Totales Acumulados</span>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {formatPrice(metrics?.totalRevenue || 0)}
            </div>
            <span className="text-xs text-gray-500">Histórico de órdenes completadas</span>
          </div>
          <button
            onClick={() => onNavigateTab('reports')}
            className="p-3 rounded-xl bg-[#182030] hover:bg-[#273449] text-gray-300 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Ver Reportes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Orders & Stock Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 columns) */}
        <div className="lg:col-span-2 bg-[#121824] border border-[#273449] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Últimos Pedidos Registrados</h3>
              <p className="text-xs text-gray-400">Órdenes recibidas recientemente en la tienda</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#273449] text-gray-400">
                    <th className="pb-2 font-medium">Pedido</th>
                    <th className="pb-2 font-medium">Cliente</th>
                    <th className="pb-2 font-medium">Método</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">Estado</th>
                    <th className="pb-2 font-medium text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#273449]/40">
                  {metrics.recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#182030]/50 transition-colors">
                      <td className="py-2.5 font-mono text-amber-400 font-semibold">{ord.orderNumber}</td>
                      <td className="py-2.5 text-gray-200">{ord.customerName}</td>
                      <td className="py-2.5 uppercase text-gray-400 text-[11px]">{ord.paymentMethod}</td>
                      <td className="py-2.5 font-mono text-white font-semibold">{formatPrice(ord.total)}</td>
                      <td className="py-2.5">{getStatusBadge(ord.status)}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => onSelectOrder(ord)}
                          className="px-2.5 py-1 rounded-lg bg-[#273449] hover:bg-amber-500 hover:text-black text-gray-200 text-[11px] font-semibold transition-colors"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-gray-500 text-xs">
                No hay pedidos registrados todavía. Cuando un cliente realice una compra aparecerá aquí.
              </div>
            )}
          </div>
        </div>

        {/* Stock Alerts (1 column) */}
        <div className="bg-[#121824] border border-[#273449] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Atención en Inventario
                </h3>
                <p className="text-xs text-gray-400">Productos por agotarse o agotados</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {metrics?.alertProducts && metrics.alertProducts.length > 0 ? (
                metrics.alertProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-[#182030]/60 border border-[#273449] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <h5 className="text-xs font-semibold text-gray-200 truncate">{p.name}</h5>
                      <span className="text-[10px] text-gray-400 font-mono">SKU: {p.code}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {p.stock <= 0 ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-950 text-red-300 border border-red-500/40">
                          0 stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                          {p.stock} uds
                        </span>
                      )}
                      <button
                        onClick={() => onOpenInventoryModal(p.id)}
                        className="p-1 rounded-lg bg-[#273449] hover:bg-amber-500 hover:text-black text-gray-300 text-xs"
                        title="Reabastecer producto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-gray-500 text-xs flex flex-col items-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500/40 mb-2" />
                  <span>Todos los productos tienen existencias saludables.</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="w-full mt-4 py-2.5 rounded-xl bg-[#182030] hover:bg-[#273449] text-gray-300 text-xs font-semibold border border-[#273449] transition-colors"
          >
            Ver Control de Existencias
          </button>
        </div>
      </div>
    </div>
  );
};
