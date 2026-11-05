import React, { useState } from 'react';
import {
  Settings,
  Store,
  Image as ImageIcon,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Share2,
  Building2,
  Smartphone,
  Save,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { StoreSettings } from '../../types.ts';
import { updateStoreSettings } from '../../services/api.ts';

interface StoreSettingsViewProps {
  settings: StoreSettings | null;
  onRefresh: () => void;
}

export const StoreSettingsView: React.FC<StoreSettingsViewProps> = ({ settings, onRefresh }) => {
  const [storeName, setStoreName] = useState(settings?.storeName || 'Tienda en Línea Fénix');
  const [logoUrl, setLogoUrl] = useState(settings?.logoUrl || '');
  const [description, setDescription] = useState(settings?.description || '');
  const [address, setAddress] = useState(settings?.address || '');
  const [phone, setPhone] = useState(settings?.phone || '');
  const [whatsapp, setWhatsapp] = useState(settings?.whatsapp || '');
  const [email, setEmail] = useState(settings?.email || '');
  const [facebook, setFacebook] = useState(settings?.facebook || '');
  const [instagram, setInstagram] = useState(settings?.instagram || '');
  const [tiktok, setTiktok] = useState(settings?.tiktok || '');
  const [bankDetails, setBankDetails] = useState(settings?.bankDetails || '');
  const [nequiNumber, setNequiNumber] = useState(settings?.nequiNumber || '');
  const [daviplataNumber, setDaviplataNumber] = useState(settings?.daviplataNumber || '');
  const [lowStockThreshold, setLowStockThreshold] = useState(
    String(settings?.lowStockThreshold || 5)
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMsg('');

    try {
      await updateStoreSettings({
        storeName: storeName.trim(),
        logoUrl: logoUrl.trim(),
        description: description.trim(),
        address: address.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        facebook: facebook.trim(),
        instagram: instagram.trim(),
        tiktok: tiktok.trim(),
        bankDetails: bankDetails.trim(),
        nequiNumber: nequiNumber.trim(),
        daviplataNumber: daviplataNumber.trim(),
        lowStockThreshold: Number(lowStockThreshold) || 5,
      });
      setSaveSuccess(true);
      onRefresh();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar los ajustes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          Configuración General de la Tienda
        </h2>
        <p className="text-xs text-gray-400">
          Personaliza la identidad de la tienda, datos de contacto, cuentas de pago y parámetros de inventario
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {saveSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Configuración de la tienda actualizada con éxito.</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs">
            {errorMsg}
          </div>
        )}

        {/* 1. Identidad de Marca */}
        <div className="p-6 rounded-3xl bg-[#121824] border border-[#273449] space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4" />
            1. Identidad de Marca
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-300 mb-1">Nombre de la Tienda *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">URL del Logo</label>
              <input
                type="url"
                placeholder="https://ejemplo.com/logo-fenix.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-300 mb-1">Lema o Descripción de la Tienda</label>
              <textarea
                rows={2}
                placeholder="Escribe el lema o propósito comercial de tu tienda..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Contacto & Ubicación */}
        <div className="p-6 rounded-3xl bg-[#121824] border border-[#273449] space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-4 h-4" />
            2. Contacto y Ubicación Física
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-300 mb-1">Teléfono Principal</label>
              <input
                type="tel"
                placeholder="Ej: +57 300 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">WhatsApp Comercial (para pedidos)</label>
              <input
                type="tel"
                placeholder="Ej: 573001234567"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-emerald-400 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">Correo Electrónico de Contacto</label>
              <input
                type="email"
                placeholder="contacto@tiendafenix.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">Dirección Física o Sede</label>
              <input
                type="text"
                placeholder="Ej: Calle 72 # 10-34, Bogotá"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Redes Sociales */}
        <div className="p-6 rounded-3xl bg-[#121824] border border-[#273449] space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            3. Redes Sociales
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-300 mb-1">Instagram (@usuario)</label>
              <input
                type="text"
                placeholder="@tiendafenix"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">Facebook (URL o página)</label>
              <input
                type="text"
                placeholder="facebook.com/tiendafenix"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">TikTok (@usuario)</label>
              <input
                type="text"
                placeholder="@tiendafenix"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* 4. Métodos de Pago y Datos Bancarios */}
        <div className="p-6 rounded-3xl bg-[#121824] border border-[#273449] space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            4. Cuentas para Recepción de Pagos
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-300 mb-1">Número de Cuenta Nequi</label>
              <input
                type="text"
                placeholder="Ej: 3001234567"
                value={nequiNumber}
                onChange={(e) => setNequiNumber(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-fuchsia-400 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">Número Daviplata</label>
              <input
                type="text"
                placeholder="Ej: 3109876543"
                value={daviplataNumber}
                onChange={(e) => setDaviplataNumber(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-red-400 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-300 mb-1">Datos para Transferencias Bancarias</label>
              <textarea
                rows={3}
                placeholder="Banco: Bancolombia&#10;Tipo: Ahorros&#10;Número: 123-456789-01&#10;Titular: Tienda Fénix SAS - NIT: 900.123.456-7"
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* 5. Alertas de Inventario */}
        <div className="p-6 rounded-3xl bg-[#121824] border border-[#273449] space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            5. Parámetros de Alerta de Inventario
          </h3>

          <div className="max-w-xs">
            <label className="block text-xs text-gray-300 mb-1">
              Umbral de Stock Bajo (Unidades mínimas)
            </label>
            <input
              type="number"
              min="1"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              El sistema generará una advertencia cuando un producto tenga igual o menos unidades de este valor.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/25 hover:scale-102 transition-transform cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Guardando Ajustes...' : 'Guardar Configuración'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
