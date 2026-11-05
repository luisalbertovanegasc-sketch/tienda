import React from 'react';
import {
  ShoppingBag,
  SlidersHorizontal,
  Store,
  Phone,
  MessageCircle,
  Search,
  User as UserIcon,
  LogIn,
  LogOut,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { StoreSettings } from '../types.ts';

interface HeaderProps {
  settings: StoreSettings | null;
  activeView: 'store' | 'admin';
  setActiveView: (view: 'store' | 'admin') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { firebaseUser, appUser, isAdmin, loginWithGoogle, logout, setAdminOverride } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#0B0E14]/90 backdrop-blur-md border-b border-[#273449]">
      {/* Top Banner with Contact Info */}
      <div className="bg-gradient-to-r from-[#182030] via-[#1F293D] to-[#182030] text-xs text-gray-300 py-1.5 px-4 border-b border-[#273449]/50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
              {settings?.storeName || 'Tienda en Línea Fénix'} — Renace tu estilo y calidad
            </span>
            {settings?.phone && (
              <span className="hidden sm:flex items-center gap-1 text-gray-400">
                <Phone className="w-3 h-3 text-amber-500" />
                {settings.phone}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {settings?.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp: {settings.whatsapp}</span>
              </a>
            )}
            <div className="flex items-center gap-2">
              {firebaseUser ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 font-medium">
                    {firebaseUser.displayName || firebaseUser.email}
                  </span>
                  <button
                    onClick={logout}
                    title="Cerrar sesión"
                    className="text-gray-400 hover:text-red-400 text-xs flex items-center gap-1 ml-1"
                  >
                    <LogOut className="w-3 h-3" />
                    Salir
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => loginWithGoogle().catch(() => {})}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Ingresar con Google</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div
          onClick={() => setActiveView('store')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.storeName}
              className="w-10 h-10 object-contain rounded-lg border border-amber-500/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-black fill-black" />
            </div>
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-white via-amber-200 to-orange-400 bg-clip-text text-transparent">
              {settings?.storeName || 'Tienda en Línea Fénix'}
            </h1>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              {settings?.description || 'Comercio Electrónico e Inventarios'}
            </p>
          </div>
        </div>

        {/* Search Bar (Visible in store view) */}
        {activeView === 'store' && (
          <div className="flex-1 max-w-md hidden md:block relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos por nombre, código o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#121824] border border-[#273449] rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Switcher: Storefront vs Admin */}
          <div className="flex bg-[#121824] p-1 rounded-xl border border-[#273449]">
            <button
              onClick={() => setActiveView('store')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'store'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tienda</span>
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'admin'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Administrar</span>
            </button>
          </div>

          {/* Cart Button */}
          {activeView === 'store' && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center p-2.5 bg-[#121824] hover:bg-[#1A2234] border border-[#273449] hover:border-amber-500/40 rounded-xl text-gray-200 transition-all cursor-pointer group"
              title="Ver Carrito de Compras"
            >
              <ShoppingBag className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Input */}
      {activeView === 'store' && (
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#121824] border border-[#273449] rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      )}
    </header>
  );
};
