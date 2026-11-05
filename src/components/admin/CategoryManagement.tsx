import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, Tag, Image as ImageIcon, X } from 'lucide-react';
import { Category, Product } from '../../types.ts';
import { createCategory, updateCategory, deleteCategory } from '../../services/api.ts';

interface CategoryManagementProps {
  categories: Category[];
  products: Product[];
  onRefresh: () => void;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  products,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setDescription(c.description || '');
    setImageUrl(c.imageUrl || '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('El nombre de la categoría es obligatorio.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: name.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim(),
        });
      } else {
        await createCategory({
          name: name.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim(),
        });
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la categoría.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, catName: string) => {
    if (confirm(`¿Deseas eliminar la categoría "${catName}"? Los productos vinculados quedarán sin categoría pero no se borrarán.`)) {
      try {
        await deleteCategory(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Error al eliminar categoría');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            Gestión de Categorías
          </h2>
          <p className="text-xs text-gray-400">
            Organiza tus productos en categorías visuales con imágenes personalizadas
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-orange-500/20 cursor-pointer transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-[#121824] border border-[#273449] rounded-2xl text-gray-500">
            <Layers className="w-8 h-8 text-amber-500/30 mx-auto mb-2" />
            <p className="font-semibold text-gray-300">No hay categorías creadas aún</p>
            <p className="text-xs text-gray-500 mt-1">
              Haz clic en "Nueva Categoría" para clasificar tu catálogo.
            </p>
          </div>
        ) : (
          categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            return (
              <div
                key={cat.id}
                className="bg-[#121824] border border-[#273449] hover:border-amber-500/40 rounded-2xl overflow-hidden flex flex-col justify-between group transition-all"
              >
                <div>
                  <div className="relative aspect-video w-full bg-[#0B0E14] overflow-hidden flex items-center justify-center">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                    ) : (
                      <div className="text-gray-600 flex flex-col items-center">
                        <ImageIcon className="w-8 h-8 text-amber-500/30 mb-1" />
                        <span className="text-[10px]">Sin imagen</span>
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0B0E14]/80 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
                      {count} {count === 1 ? 'producto' : 'productos'}
                    </span>
                  </div>

                  <div className="p-4">
                    <h4 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {cat.description || 'Sin descripción ingresada.'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#182030]/60 border-t border-[#273449] flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg bg-[#273449] hover:bg-amber-500 hover:text-black text-gray-300 text-xs transition-colors"
                    title="Editar categoría"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 rounded-lg bg-[#273449] hover:bg-red-500 hover:text-white text-gray-400 text-xs transition-colors"
                    title="Eliminar categoría"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Crear / Editar Categoría */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#121824] border border-[#273449] rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#273449] bg-[#182030]/80 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
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
                <label className="block text-xs text-gray-300 mb-1">Nombre de la Categoría *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Calzado, Ropa, Tecnología..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">URL Imagen de Categoría</label>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/foto-categoria.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0E14] border border-[#273449] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  placeholder="Breve reseña sobre los productos de esta categoría..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  {isSaving ? 'Guardando...' : editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
