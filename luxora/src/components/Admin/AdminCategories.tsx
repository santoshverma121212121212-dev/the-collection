import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowRight, 
  Check, 
  X, 
  AlertTriangle,
  Sparkles,
  Package
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminCategories: React.FC = () => {
  const { 
    categories, 
    products, 
    addCategory, 
    renameCategory, 
    deleteCategory, 
    setFilters, 
    setCurrentView,
    setAdminTab
  } = useStore();

  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const success = await addCategory(newCatName.trim());
    if (success) {
      setNewCatName('');
    }
  };

  const handleStartRename = (cat: string) => {
    setEditingCat(cat);
    setRenameInput(cat);
  };

  const handleSaveRename = async (oldName: string) => {
    if (renameInput.trim() && renameInput.trim() !== oldName) {
      await renameCategory(oldName, renameInput.trim());
    }
    setEditingCat(null);
    setRenameInput('');
  };

  const handleConfirmDelete = async (cat: string) => {
    await deleteCategory(cat);
    setDeleteTarget(null);
  };

  const getProductCountForCategory = (cat: string) => {
    return products.filter(p => p.category === cat).length;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="font-serif text-2xl text-white font-light">
            Category Management <span className="text-white/40 text-sm font-sans">({categories.length} Active Categories)</span>
          </h2>
          <p className="text-xs text-white/50 font-sans font-light">
            Organize wardrobe classifications, navigation headers, and collection hierarchies.
          </p>
        </div>
      </div>

      {/* Grid: Add Form (4 cols) + Category List (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Add New Category Form (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-[#111116] border border-white/10 p-6 space-y-4 sticky top-24">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Plus className="w-4 h-4 text-[#c5a059]" />
              <h3 className="font-serif text-lg text-white font-light">Add New Category</h3>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1.5">
                  Category Name <span className="text-[#c5a059]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g., Knitwear &amp; Cardigans"
                  className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#c5a059] text-black font-accent text-xs font-bold uppercase tracking-wider hover:bg-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Category</span>
              </button>
            </form>

            <div className="pt-4 border-t border-white/5 text-[11px] text-white/40 font-sans leading-relaxed">
              New categories immediately become available in the Product Creator, storefront filters, and navbar collection drawers.
            </div>
          </div>
        </div>

        {/* Right: Existing Categories List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#111116] border border-white/10 overflow-hidden">
            <div className="p-4 bg-[#0c0c0e] border-b border-white/10 flex items-center justify-between text-xs text-white/50 font-accent uppercase tracking-wider text-[10px]">
              <span>Category Title</span>
              <div className="flex items-center gap-6">
                <span>Products Count</span>
                <span className="w-20 text-right">Actions</span>
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {categories.map((category) => {
                const count = getProductCountForCategory(category);
                const isRenaming = editingCat === category;

                return (
                  <div key={category} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    {/* Title or Input */}
                    <div className="flex-1 pr-4">
                      {isRenaming ? (
                        <div className="flex items-center gap-2 max-w-sm">
                          <input
                            type="text"
                            autoFocus
                            value={renameInput}
                            onChange={(e) => setRenameInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(category);
                              if (e.key === 'Escape') setEditingCat(null);
                            }}
                            className="flex-1 px-3 py-1.5 bg-[#0a0a0c] border border-[#c5a059] text-xs text-white focus:outline-none font-sans"
                          />
                          <button
                            onClick={() => handleSaveRename(category)}
                            className="p-1.5 bg-[#c5a059] text-black hover:bg-white transition-colors"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingCat(null)}
                            className="p-1.5 bg-white/10 text-white hover:bg-white/20 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Layers className="w-4 h-4 text-[#c5a059]" />
                          <span className="font-medium text-white text-sm font-sans">{category}</span>
                        </div>
                      )}
                    </div>

                    {/* Count */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="font-mono text-xs text-white/80 bg-white/5 px-2.5 py-1 border border-white/10">
                          {count} pieces
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="w-20 flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStartRename(category)}
                          className="p-1.5 bg-white/5 hover:bg-[#c5a059] text-white hover:text-black transition-colors"
                          title="Rename Category"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(category)}
                          className="p-1.5 bg-white/5 hover:bg-red-600 text-white/50 hover:text-white transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Delete Category Warning Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#141419] border border-red-500/40 p-6 max-w-md w-full shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-serif text-lg text-white">Delete Category "{deleteTarget}"?</h3>
              </div>
              <p className="text-xs text-white/70 font-sans leading-relaxed">
                {getProductCountForCategory(deleteTarget) > 0 
                  ? `Notice: There are currently ${getProductCountForCategory(deleteTarget)} products assigned to this category. Deleting the category will remove it from future selections.`
                  : 'This category currently contains no products and can be safely removed.'}
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-accent uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmDelete(deleteTarget)}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-accent font-bold uppercase tracking-wider"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
