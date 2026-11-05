import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  Tag,
  DollarSign,
  AlertTriangle,
  Image as ImageIcon,
  Check,
  X,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { Product, Category } from '../../types.ts';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  generateAiDescription,
  recommendAiPrice,
} from '../../services/api.ts';
import { useCart } from '../../context/CartContext.tsx';

interface ProductManagementProps {
  products: Product[];
  categories: Category[];
  onRefresh: () => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  categories,
  onRefresh,
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  const { formatPrice } = useCart();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Edit / Create State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [offerPrice, setOfferPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('0');
  const [mainImage, setMainImage] = useState('');
  const [galleryInput, setGalleryInput] = useState('');
  const [galleryList, setGalleryList] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // AI State
  const [isGeneratingAiDesc, setIsGeneratingAiDesc] = useState(false);
  const [aiHighlights, setAiHighlights] = useState('');
  const [showAiDescPrompt, setShowAiDescPrompt] = useState(false);

  const [isRecommendingPrice, setIsRecommendingPrice] = useState(false);
  const [baseCostInput, setBaseCostInput] = useState('');
  const [showAiPricePrompt, setShowAiPricePrompt] = useState(false);
  const [aiPriceRationale, setAiPriceRationale] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const resetForm = () => {
    setEditingProduct(null);
    setCode('');
    setName('');
    setDescription('');
    setCategoryId('');
    setPrice('');
    setOfferPrice('');
    setStock('0');
    setMainImage('');
    setGalleryInput('');
    setGalleryList([]);
    setStatus('active');
    setAiHighlights('');
    setShowAiDescPrompt(false);
    setShowAiPricePrompt(false);
    setAiPriceRationale('');
    setErrorMsg('');
  };

  const handleOpenCreate = () => {
    resetForm();
    // Sugerir un código SKU preliminar
    setCode(`FNX-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    resetForm();
    setEditingProduct(p);
    setCode(p.code);
    setName(p.name);
    setDescription(p.description || '');
    setCategoryId(p.categoryId ? String(p.categoryId) : '');
    setPrice(String(p.price));
    setOfferPrice(p.offerPrice ? String(p.offerPrice) : '');
    setStock(String(p.stock));
    setMainImage(p.mainImage || '');
    setStatus(p.status);

    let gallery: string[] = [];
    try {
      if (p.gallery) gallery = JSON.parse(p.gallery);
    } catch {
      gallery = [];
    }
    setGalleryList(gallery);
    setIsCreateModalOpen(true);
  };

  const handleAddGalleryImage = () => {
    if (galleryInput.trim()) {
      setGalleryList([...galleryList, galleryInput.trim()]);
      setGalleryInput('');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryList(galleryList.filter((_, idx) => idx !== index));
  };

  // Asistente IA 1: Generar Descripción
  const handleGenerateAiDescription = async () => {
    if (!name.trim()) {
      alert('Ingresa el nombre del producto primero para que la IA pueda redactar la descripción.');
      return;
    }
    const catName = categories.find((c) => String(c.id) === categoryId)?.name || 'General';

    setIsGeneratingAiDesc(true);
    try {
      const res = await generateAiDescription({
        name: name.trim(),
        category: catName,
        highlights: aiHighlights.trim(),
      });
      const bulletText = res.bulletPoints && res.bulletPoints.length > 0
        ? '\n\nCaracterísticas destacadas:\n• ' + res.bulletPoints.join('\n• ')
        : '';
      setDescription(`${res.description}${bulletText}`);
      setShowAiDescPrompt(false);
    } catch (err: any) {
      alert(err.message || 'Error al generar descripción con IA');
    } finally {
      setIsGeneratingAiDesc(false);
    }
  };

  // Asistente IA 2: Recomendar Precio
  const handleRecommendPrice = async () => {
    if (!name.trim()) {
      alert('Ingresa el nombre del producto primero.');
      return;
    }
    const catName = categories.find((c) => String(c.id) === categoryId)?.name || 'General';

    setIsRecommendingPrice(true);
    try {
      const res = await recommendAiPrice({
        name: name.trim(),
        category: catName,
        costOrBasePrice: Number(baseCostInput) || 0,
      });

      setPrice(String(res.suggestedRegularPrice));
      setOfferPrice(String(res.suggestedOfferPrice));
      setAiPriceRationale(`${res.strategyRationale} (Margen: ${res.profitMarginPercent}%)`);
      setShowAiPricePrompt(false);
    } catch (err: any) {
      alert(err.message || 'Error al recomendar precio con IA');
    } finally {
      setIsRecommendingPrice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!code.trim() || !name.trim()) {
      setErrorMsg('El código SKU y el nombre son obligatorios.');
      return;
    }
    if (price === '' || Number(price) < 0) {
      setErrorMsg('Ingresa un precio de venta válido.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim(),
        categoryId: categoryId ? Number(categoryId) : null,
        price: Number(price),
        offerPrice: offerPrice ? Number(offerPrice) : null,
        stock: Number(stock) || 0,
        mainImage: mainImage.trim(),
        gallery: JSON.stringify(galleryList),
        status,
        performedBy: 'Administrador Fénix',
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }

      setIsCreateModalOpen(false);
      resetForm();
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar producto');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, prodName: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el producto "${prodName}"? Esta acción borrará también su historial de inventario.`)) {
      try {
        await deleteProduct(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Error al eliminar el producto');
      }
    }
  };

  // Filtrado
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || String(p.categoryId) === selectedCategory;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-400" />
            Gestión de Productos
          </h2>
          <p className="text-xs text-gray-400">
            Administra los códigos, precios, fotos, inventario y descripciones con IA
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-orange-500/20 cursor-pointer transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Producto</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121824] border border-[#273449] flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código SKU o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-gray-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-gray-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todos los Estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-[#121824] border border-[#273449] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#273449] bg-[#182030]/60 text-gray-400">
                <th className="py-3 px-4 font-semibold">Producto</th>
                <th className="py-3 px-4 font-semibold">SKU</th>
                <th className="py-3 px-4 font-semibold">Categoría</th>
                <th className="py-3 px-4 font-semibold">Precio Venta</th>
                <th className="py-3 px-4 font-semibold">Oferta</th>
                <th className="py-3 px-4 font-semibold">Stock</th>
                <th className="py-3 px-4 font-semibold">Estado</th>
                <th className="py-3 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273449]/40">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <Tag className="w-8 h-8 text-amber-500/30 mx-auto mb-2" />
                    <p className="font-medium text-gray-300">No hay productos registrados</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Comienza agregando tus primeros artículos con el botón "Agregar Producto".
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#182030]/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-black border border-[#273449] flex-shrink-0">
                          <img
                            src={
                              p.mainImage ||
                              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
                            }
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <span className="font-semibold text-white block truncate" title={p.name}>
                            {p.name}
                          </span>
                          <span className="text-[10px] text-gray-400 line-clamp-1">
                            {p.description || 'Sin descripción'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-amber-400 font-semibold">{p.code}</td>
                    <td className="py-3 px-4 text-gray-300">{p.categoryName || '—'}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-white">
                      {formatPrice(p.price)}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400">
                      {p.offerPrice ? formatPrice(p.offerPrice) : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {p.stock <= 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-950 text-red-300 font-bold border border-red-500/40">
                          Agotado
                        </span>
                      ) : p.stock <= 4 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-950 text-amber-300 font-bold border border-amber-500/40">
                          {p.stock} uds
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40">
                          {p.stock} uds
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {p.status === 'active' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-800 text-gray-400 border border-gray-700">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg bg-[#273449] hover:bg-amber-500 hover:text-black text-gray-300 transition-colors"
                          title="Editar producto"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded-lg bg-[#273449] hover:bg-red-500 hover:text-white text-gray-400 transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar Producto */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#121824] border border-[#273449] rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="p-5 border-b border-[#273449] bg-[#182030]/80 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">Código / SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: CALZ-001"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white uppercase font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">Categoría</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Sin Categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-300 mb-1">Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Chaqueta Cuero Fénix Premium"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Precios con Asistente IA */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-gray-300">Precio Normal ($ COP) *</label>
                    <button
                      type="button"
                      onClick={() => setShowAiPricePrompt(!showAiPricePrompt)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                    >
                      <Sparkles className="w-3 h-3" />
                      Sugerir con IA
                    </button>
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Ej: 85000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">Precio de Oferta (Opcional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ej: 69900"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-emerald-400 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* AI Price Tool Card */}
                {showAiPricePrompt && (
                  <div className="sm:col-span-2 p-3 bg-[#0B0E14] border border-amber-500/40 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Recomendador de Precios con Gemini
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAiPricePrompt(false)}
                        className="text-gray-400 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Costo o precio base de compra (opcional)"
                        value={baseCostInput}
                        onChange={(e) => setBaseCostInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-[#121824] border border-[#273449] rounded-lg text-xs text-white"
                      />
                      <button
                        type="button"
                        disabled={isRecommendingPrice}
                        onClick={handleRecommendPrice}
                        className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold text-xs rounded-lg"
                      >
                        {isRecommendingPrice ? 'Calculando...' : 'Calcular'}
                      </button>
                    </div>
                    {aiPriceRationale && (
                      <p className="text-[11px] text-gray-300 italic">{aiPriceRationale}</p>
                    )}
                  </div>
                )}

                {!editingProduct && (
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Stock Inicial</label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-300 mb-1">Estado</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="active">Activo (Visible en tienda)</option>
                    <option value="inactive">Inactivo (Oculto)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-300 mb-1">URL Imagen Principal</label>
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/foto-producto.jpg"
                    value={mainImage}
                    onChange={(e) => setMainImage(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Galería de Imágenes adicionales */}
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-300 mb-1">Galería de Imágenes Adicionales</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="url"
                      placeholder="https://ejemplo.com/foto-adicional.jpg"
                      value={galleryInput}
                      onChange={(e) => setGalleryInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryImage}
                      className="px-3 py-1.5 bg-[#273449] hover:bg-gray-600 text-white text-xs font-semibold rounded-xl"
                    >
                      Añadir a Galería
                    </button>
                  </div>

                  {galleryList.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {galleryList.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#273449] group"
                        >
                          <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="absolute inset-0 bg-red-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Descripción con Asistente IA */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-gray-300">Descripción del Producto</label>
                    <button
                      type="button"
                      onClick={() => setShowAiDescPrompt(!showAiDescPrompt)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                    >
                      <Sparkles className="w-3 h-3" />
                      Redactar con IA
                    </button>
                  </div>

                  {/* AI Description Prompt Card */}
                  {showAiDescPrompt && (
                    <div className="mb-2 p-3 bg-[#0B0E14] border border-amber-500/40 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Redactor Comercial Gemini
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAiDescPrompt(false)}
                          className="text-gray-400 hover:text-white text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Palabras clave o características (ej: 100% cuero, térmico, importado)"
                        value={aiHighlights}
                        onChange={(e) => setAiHighlights(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#121824] border border-[#273449] rounded-lg text-xs text-white"
                      />
                      <button
                        type="button"
                        disabled={isGeneratingAiDesc}
                        onClick={handleGenerateAiDescription}
                        className="w-full py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold text-xs rounded-lg"
                      >
                        {isGeneratingAiDesc ? 'Generando redacción persuasiva...' : 'Generar Texto Comercial'}
                      </button>
                    </div>
                  )}

                  <textarea
                    rows={4}
                    placeholder="Escribe los detalles o usa el botón de IA para redactarla automáticamente..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#273449]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#273449] hover:bg-gray-700 text-gray-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-black text-xs font-bold shadow-md hover:scale-102 transition-transform cursor-pointer"
                >
                  {isSaving ? 'Guardando...' : editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
