/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Store,
  SlidersHorizontal,
  Package,
  Layers,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  Flame,
  ArrowRight,
  Plus,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { Header } from './components/Header.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';

// Admin Modules
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { ProductManagement } from './components/admin/ProductManagement.tsx';
import { InventoryManagement } from './components/admin/InventoryManagement.tsx';
import { CategoryManagement } from './components/admin/CategoryManagement.tsx';
import { OrderManagement } from './components/admin/OrderManagement.tsx';
import { CustomerManagement } from './components/admin/CustomerManagement.tsx';
import { ReportsAnalytics } from './components/admin/ReportsAnalytics.tsx';
import { StoreSettingsView } from './components/admin/StoreSettingsView.tsx';

// API Services & Types
import {
  getStoreSettings,
  getCategories,
  getProducts,
  getInventoryMovements,
  getCustomers,
  getOrders,
  getDashboardMetrics,
} from './services/api.ts';
import {
  StoreSettings,
  Category,
  Product,
  InventoryMovement,
  Customer,
  Order,
  DashboardMetrics,
} from './types.ts';

function MainStoreApp() {
  const [activeView, setActiveView] = useState<'store' | 'admin'>('store');
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | 'all'>('all');

  // Core Data State
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedProductIdForMovement, setSelectedProductIdForMovement] = useState<number | undefined>(undefined);
  const [selectedOrderModal, setSelectedOrderModal] = useState<Order | null>(null);

  const fetchAllData = async () => {
    try {
      const [
        settingsData,
        categoriesData,
        productsData,
        movementsData,
        customersData,
        ordersData,
        metricsData,
      ] = await Promise.all([
        getStoreSettings().catch(() => null),
        getCategories().catch(() => []),
        getProducts().catch(() => []),
        getInventoryMovements().catch(() => []),
        getCustomers().catch(() => []),
        getOrders().catch(() => []),
        getDashboardMetrics().catch(() => null),
      ]);

      if (settingsData) setSettings(settingsData);
      setCategories(categoriesData);
      setProducts(productsData);
      setMovements(movementsData);
      setCustomers(customersData);
      setOrders(ordersData);
      setDashboardMetrics(metricsData);
    } catch (err) {
      console.error('Error fetching store data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter products for the store catalog
  const filteredCatalog = products.filter((p) => {
    if (p.status !== 'active') return false;
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategoryFilter === 'all' || p.categoryId === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenMovementModalForProduct = (productId?: number) => {
    setSelectedProductIdForMovement(productId);
    setIsMovementModalOpen(true);
    setAdminTab('inventory');
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-gray-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Header */}
      <Header
        settings={settings}
        activeView={activeView}
        setActiveView={setActiveView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6">
        {activeView === 'store' ? (
          /* ========================================================
             VISTA 1: TIENDA PÚBLICA (CATÁLOGO PARA COMPRADORES)
             ======================================================== */
          <div className="space-y-8">
            {/* Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden border border-[#273449] bg-gradient-to-r from-[#182030] via-[#1E293D] to-[#121824] p-6 sm:p-10 shadow-2xl">
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" />
                  <span>{settings?.storeName || 'Tienda en Línea Fénix'}</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Calidad que <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 bg-clip-text text-transparent">Renace</span> en Cada Detalle
                </h1>

                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  {settings?.description ||
                    'Explora nuestro catálogo exclusivo. Envíos seguros a nivel nacional y múltiples métodos de pago fáciles e instantáneos.'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      const el = document.getElementById('catalog-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-black font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer transition-transform active:scale-95"
                  >
                    <span>Ver Catálogo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('admin');
                      setAdminTab('dashboard');
                    }}
                    className="px-5 py-3 rounded-xl bg-[#182030] hover:bg-[#273449] text-gray-300 text-xs sm:text-sm font-semibold border border-[#273449] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                    <span>Panel de Gestión</span>
                  </button>
                </div>
              </div>

              {/* Decorative Phoenix Glow in Background */}
              <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Categorías Horizontales */}
            {categories.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    Categorías de la Tienda
                  </h3>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  <button
                    onClick={() => setSelectedCategoryFilter('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategoryFilter === 'all'
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-[#121824] text-gray-300 border border-[#273449] hover:border-gray-500'
                    }`}
                  >
                    Todas ({products.filter((p) => p.status === 'active').length})
                  </button>

                  {categories.map((cat) => {
                    const count = products.filter(
                      (p) => p.categoryId === cat.id && p.status === 'active'
                    ).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryFilter(cat.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          selectedCategoryFilter === cat.id
                            ? 'bg-amber-500 text-black shadow-md'
                            : 'bg-[#121824] text-gray-300 border border-[#273449] hover:border-gray-500'
                        }`}
                      >
                        {cat.imageUrl && (
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            className="w-5 h-5 rounded-md object-cover"
                          />
                        )}
                        <span>{cat.name}</span>
                        <span className="text-[10px] opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Catálogo de Productos */}
            <div id="catalog-section" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                    Catálogo de Productos
                  </h3>
                  <p className="text-xs text-gray-400">
                    {filteredCatalog.length} productos disponibles para entrega inmediata
                  </p>
                </div>
              </div>

              {/* Si la tienda está completamente vacía (Requerimiento inicial) */}
              {products.length === 0 ? (
                <div className="p-8 sm:p-14 text-center rounded-3xl bg-[#121824] border border-[#273449] space-y-4 max-w-2xl mx-auto my-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                    <Flame className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    ¡Bienvenido a Tienda en Línea Fénix!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    La aplicación ha iniciado completamente limpia y sin datos de prueba, lista para que ingreses la información real de tu negocio. Puedes personalizar la configuración de la tienda, crear categorías e ingresar tus primeros productos con apoyo de Inteligencia Artificial.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <button
                      onClick={() => {
                        setActiveView('admin');
                        setAdminTab('settings');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#273449] hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      <Settings className="w-4 h-4 text-amber-400" />
                      <span>Configurar Datos de Tienda</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveView('admin');
                        setAdminTab('products');
                        setIsCreateProductModalOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Crear Primer Producto</span>
                    </button>
                  </div>
                </div>
              ) : filteredCatalog.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-[#121824] border border-[#273449] text-gray-400 space-y-2">
                  <Package className="w-8 h-8 text-amber-500/30 mx-auto" />
                  <p className="font-semibold text-gray-200">No se encontraron productos coincidentes</p>
                  <p className="text-xs text-gray-500">Prueba ajustando el término de búsqueda o la categoría.</p>
                </div>
              ) : (
                /* Grid de Tarjetas de Productos */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredCatalog.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={(p) => setDetailProduct(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================
             VISTA 2: PANEL DE ADMINISTRACIÓN (BACKOFFICE)
             ======================================================== */
          <div className="space-y-6">
            {/* Admin Tabs Navigation */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#273449] scrollbar-none">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'products', label: 'Productos', icon: TagIcon },
                { id: 'inventory', label: 'Inventario', icon: Package },
                { id: 'categories', label: 'Categorías', icon: Layers },
                { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
                { id: 'customers', label: 'Clientes', icon: Users },
                { id: 'reports', label: 'Reportes e IA', icon: Sparkles },
                { id: 'settings', label: 'Configuración', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      adminTab === tab.id
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-[#182030]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Admin Module Content */}
            {adminTab === 'dashboard' && (
              <AdminDashboard
                metrics={dashboardMetrics}
                onNavigateTab={(tab) => setAdminTab(tab)}
                onOpenNewProduct={() => {
                  setAdminTab('products');
                  setIsCreateProductModalOpen(true);
                }}
                onOpenInventoryModal={handleOpenMovementModalForProduct}
                onSelectOrder={(ord) => setSelectedOrderModal(ord)}
              />
            )}

            {adminTab === 'products' && (
              <ProductManagement
                products={products}
                categories={categories}
                onRefresh={fetchAllData}
                isCreateModalOpen={isCreateProductModalOpen}
                setIsCreateModalOpen={setIsCreateProductModalOpen}
              />
            )}

            {adminTab === 'inventory' && (
              <InventoryManagement
                products={products}
                movements={movements}
                onRefresh={fetchAllData}
                isMovementModalOpen={isMovementModalOpen}
                setIsMovementModalOpen={setIsMovementModalOpen}
                selectedProductIdForModal={selectedProductIdForMovement}
              />
            )}

            {adminTab === 'categories' && (
              <CategoryManagement
                categories={categories}
                products={products}
                onRefresh={fetchAllData}
              />
            )}

            {adminTab === 'orders' && (
              <OrderManagement
                orders={orders}
                onRefresh={fetchAllData}
                selectedOrderModal={selectedOrderModal}
                setSelectedOrderModal={setSelectedOrderModal}
              />
            )}

            {adminTab === 'customers' && (
              <CustomerManagement
                customers={customers}
                orders={orders}
                onRefresh={fetchAllData}
              />
            )}

            {adminTab === 'reports' && <ReportsAnalytics metrics={dashboardMetrics} />}

            {adminTab === 'settings' && (
              <StoreSettingsView settings={settings} onRefresh={fetchAllData} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#273449] bg-[#0B0E14] text-xs text-gray-400 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-white">
              {settings?.storeName || 'Tienda en Línea Fénix'}
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">Comercio Electrónico y Gestión de Inventarios</span>
          </div>

          <div className="flex items-center gap-4 text-gray-400">
            {settings?.instagram && (
              <span className="flex items-center gap-1 hover:text-amber-400">
                <Instagram className="w-3.5 h-3.5" />
                {settings.instagram}
              </span>
            )}
            {settings?.facebook && (
              <span className="flex items-center gap-1 hover:text-amber-400">
                <Facebook className="w-3.5 h-3.5" />
                {settings.facebook}
              </span>
            )}
            {settings?.address && (
              <span className="hidden md:inline text-gray-500">
                • {settings.address}
              </span>
            )}
          </div>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <CartDrawer />

      <CheckoutModal
        settings={settings}
        onOrderCompleted={() => {
          fetchAllData();
        }}
      />

      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onSelectProduct={(p) => setDetailProduct(p)}
      />
    </div>
  );
}

// Helper icon component
function TagIcon(props: any) {
  return <Package {...props} />;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainStoreApp />
      </CartProvider>
    </AuthProvider>
  );
}
