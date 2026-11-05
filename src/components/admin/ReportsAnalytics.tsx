import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  DollarSign,
  Package,
  CreditCard,
  PieChart,
  RefreshCw,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import { AnalyticsData, DashboardMetrics } from '../../types.ts';
import { getAnalyticsData, analyzeAiTrends } from '../../services/api.ts';
import { useCart } from '../../context/CartContext.tsx';

interface ReportsAnalyticsProps {
  metrics: DashboardMetrics | null;
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({ metrics }) => {
  const { formatPrice } = useCart();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // AI Trends Analysis
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    executiveSummary: string;
    topTrends: string[];
    restockAlerts: string[];
    marketingRecommendations: string[];
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAnalyticsData();
      setAnalytics(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunAiAnalysis = async () => {
    setLoadingAi(true);
    try {
      const result = await analyzeAiTrends();
      setAiAnalysis(result);
    } catch (err: any) {
      alert(err.message || 'Error al analizar tendencias con Gemini');
    } finally {
      setLoadingAi(false);
    }
  };

  const maxDailySale = Math.max(
    ...(analytics?.dailySales.map((d) => d.total) || [100000]),
    100000
  );

  return (
    <div className="space-y-6">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            Reportes, Ventas y Analíticas
          </h2>
          <p className="text-xs text-gray-400">
            Estadísticas comerciales, inventario disponible y análisis predictivo con IA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-[#182030] hover:bg-[#273449] text-gray-300 border border-[#273449] transition-colors"
            title="Recargar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleRunAiAnalysis}
            disabled={loadingAi}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>{loadingAi ? 'Analizando con Gemini...' : 'Analizar Tendencias con IA'}</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#121824] border border-[#273449]">
          <span className="text-xs text-gray-400 block mb-1">Ingresos Totales</span>
          <div className="text-lg sm:text-xl font-bold text-emerald-400 font-mono">
            {formatPrice(metrics?.totalRevenue || 0)}
          </div>
          <span className="text-[11px] text-gray-500">Histórico de ventas</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121824] border border-[#273449]">
          <span className="text-xs text-gray-400 block mb-1">Inventario Valorizado</span>
          <div className="text-lg sm:text-xl font-bold text-amber-400 font-mono">
            {formatPrice(metrics?.totalInventoryValue || 0)}
          </div>
          <span className="text-[11px] text-gray-500">{metrics?.totalStockUnits || 0} unidades en stock</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121824] border border-[#273449]">
          <span className="text-xs text-gray-400 block mb-1">Margen Estimado Tienda</span>
          <div className="text-lg sm:text-xl font-bold text-white font-mono">
            35% - 40%
          </div>
          <span className="text-[11px] text-gray-500">Utilidad promedio</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121824] border border-[#273449]">
          <span className="text-xs text-gray-400 block mb-1">Catálogo Activo</span>
          <div className="text-lg sm:text-xl font-bold text-white font-mono">
            {metrics?.totalProducts || 0} refs
          </div>
          <span className="text-[11px] text-gray-500">En {analytics?.categoryCount || 0} categorías</span>
        </div>
      </div>

      {/* AI Trends Insights Panel (When generated) */}
      {aiAnalysis && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1E293D] via-[#151D2C] to-[#0B0E14] border border-amber-500/40 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <h3 className="font-bold text-white text-base">
              Análisis Predictivo de Tendencias — Gemini 3.8 Flash
            </h3>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed bg-[#0B0E14]/60 p-4 rounded-2xl border border-[#273449]">
            {aiAnalysis.executiveSummary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Tendencias */}
            <div className="p-4 rounded-2xl bg-[#0B0E14] border border-[#273449] space-y-2">
              <h4 className="font-bold text-amber-400 uppercase text-[11px] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Tendencias de Compra
              </h4>
              <ul className="space-y-1.5 text-gray-300 list-disc list-inside">
                {aiAnalysis.topTrends.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>

            {/* Alertas Restock */}
            <div className="p-4 rounded-2xl bg-[#0B0E14] border border-[#273449] space-y-2">
              <h4 className="font-bold text-red-400 uppercase text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Alertas de Inventario
              </h4>
              <ul className="space-y-1.5 text-gray-300 list-disc list-inside">
                {aiAnalysis.restockAlerts.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Estrategias de Marketing */}
            <div className="p-4 rounded-2xl bg-[#0B0E14] border border-[#273449] space-y-2">
              <h4 className="font-bold text-emerald-400 uppercase text-[11px] flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Recomendaciones Comerciales
              </h4>
              <ul className="space-y-1.5 text-gray-300 list-disc list-inside">
                {aiAnalysis.marketingRecommendations.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Daily Sales Chart */}
      <div className="p-5 rounded-2xl bg-[#121824] border border-[#273449]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Ventas Diarias (Últimos 14 días)</h3>
            <p className="text-xs text-gray-400">Comportamiento de facturación reciente</p>
          </div>
        </div>

        {analytics?.dailySales && analytics.dailySales.length > 0 ? (
          <div className="h-48 flex items-end gap-2 pt-6 pb-2 overflow-x-auto">
            {analytics.dailySales.map((day, idx) => {
              const heightPercent = Math.max(8, (day.total / maxDailySale) * 100);
              const label = day.date.slice(5); // MM-DD
              return (
                <div key={idx} className="flex-1 min-w-[28px] flex flex-col items-center gap-2 group">
                  <div className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                    {formatPrice(day.total)}
                  </div>
                  <div className="w-full bg-[#182030] rounded-t-lg h-36 flex items-end overflow-hidden p-0.5">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-orange-600 via-amber-500 to-yellow-400 group-hover:brightness-125 transition-all"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{label}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500 text-xs">
            Sin datos de facturación en este período.
          </div>
        )}
      </div>

      {/* Top Products & Payment Methods Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Best Sellers */}
        <div className="p-5 rounded-2xl bg-[#121824] border border-[#273449]">
          <h3 className="text-sm font-bold text-white mb-1">Productos Más Vendidos</h3>
          <p className="text-xs text-gray-400 mb-4">Ranking por volumen de unidades facturadas</p>

          <div className="space-y-3">
            {analytics?.topProducts && analytics.topProducts.length > 0 ? (
              analytics.topProducts.map((prod, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#273449] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 font-bold font-mono text-amber-400 text-center">
                      #{idx + 1}
                    </span>
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-[#273449]">
                      <img
                        src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-semibold text-white block truncate max-w-[160px]">
                        {prod.name}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">SKU: {prod.code}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-amber-400 font-mono">{prod.units} uds</div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {formatPrice(prod.revenue)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500 text-xs">
                Aún no hay ventas registradas para generar el ranking de productos.
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="p-5 rounded-2xl bg-[#121824] border border-[#273449]">
          <h3 className="text-sm font-bold text-white mb-1">Ventas por Método de Pago</h3>
          <p className="text-xs text-gray-400 mb-4">Canales preferidos por los clientes</p>

          <div className="space-y-3">
            {analytics?.paymentStats && analytics.paymentStats.length > 0 ? (
              analytics.paymentStats.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#0B0E14] border border-[#273449] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white uppercase block">{item.method}</span>
                    <span className="text-[10px] text-gray-400">{item.count} pedidos realizados</span>
                  </div>
                  <div className="text-right font-mono font-bold text-amber-400">
                    {formatPrice(item.total)}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500 text-xs">
                Sin datos de pagos registrados todavía.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
