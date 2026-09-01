import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  Filter, 
  ExternalLink, 
  Edit3, 
  Copy, 
  Trash2, 
  Eye, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Tag, 
  Layers, 
  ArrowUpDown,
  SlidersHorizontal,
  Flame,
  Star,
  Check,
  AlertTriangle,
  Package
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

export const AdminProducts: React.FC = () => {
  const { 
    products, 
    categories, 
    setAdminTab, 
    startEditingProduct, 
    deleteProduct, 
    duplicateProduct, 
    toggleProductPublish,
    navigateToProduct,
    handlePurchase,
    resetCatalogToDefaults
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedBadge, setSelectedBadge] = useState('all');
  const [selectedStock, setSelectedStock] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'name' | 'rating'>('newest');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewLayout, setViewLayout] = useState<'table' | 'cards'>('table');

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.purchaseUrl && p.purchaseUrl.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Category
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Status
      if (selectedStatus === 'published' && !p.isPublished) return false;
      if (selectedStatus === 'draft' && p.isPublished) return false;

      // Badge
      if (selectedBadge !== 'all') {
        if (selectedBadge === 'Trending' && !p.isTrending && p.badge !== 'Trending') return false;
        if (selectedBadge === 'New' && !p.isNew && p.badge !== 'New') return false;
        if (selectedBadge === 'Sale' && !p.isSale && p.badge !== 'Sale') return false;
        if (selectedBadge === 'Bestseller' && !p.isBestseller && p.badge !== 'Bestseller') return false;
      }

      // Stock
      if (selectedStock !== 'all' && p.stockStatus !== selectedStock) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      }
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus, selectedBadge, selectedStock, sortBy]);

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="font-serif text-2xl text-white font-light">
            Product Catalog <span className="text-white/40 text-sm font-sans">({filteredProducts.length} of {products.length})</span>
          </h2>
          <p className="text-xs text-white/50 font-sans font-light">
            Edit garment specifications, prices, images, and external purchase URLs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAdminTab('add-product')}
            className="px-5 py-2.5 bg-[#c5a059] text-black font-accent text-xs font-bold uppercase tracking-wider hover:bg-white transition-all flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#111116] border border-white/10 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Input (5 cols) */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID, category, or purchase URL..."
              className="w-full pl-9 pr-4 py-2 bg-[#0a0a0c] border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          {/* Category Dropdown (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/15 text-xs text-white/80 focus:outline-none focus:border-[#c5a059]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/15 text-xs text-white/80 focus:outline-none focus:border-[#c5a059]"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published Only</option>
              <option value="draft">Draft Only</option>
            </select>
          </div>

          {/* Badge Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={selectedBadge}
              onChange={(e) => setSelectedBadge(e.target.value)}
              className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/15 text-xs text-white/80 focus:outline-none focus:border-[#c5a059]"
            >
              <option value="all">All Badges</option>
              <option value="Trending">Trending</option>
              <option value="New">New Arrivals</option>
              <option value="Sale">On Sale</option>
              <option value="Bestseller">Bestseller</option>
            </select>
          </div>

          {/* Sort By (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/15 text-xs text-white/80 focus:outline-none focus:border-[#c5a059]"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Alphabetical</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>

        </div>

        {/* Quick Filter Reset */}
        {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedBadge !== 'all') && (
          <div className="flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/5">
            <span>Filters active: showing {filteredProducts.length} results</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedBadge('all');
              }}
              className="text-[#c5a059] hover:underline cursor-pointer text-[11px] font-accent uppercase"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
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
                <h3 className="font-serif text-lg text-white">Confirm Product Deletion</h3>
              </div>
              <p className="text-xs text-white/70 font-sans leading-relaxed">
                Are you sure you wish to delete <strong className="text-white">"{products.find(p => p.id === deleteConfirmId)?.name}"</strong>? This will remove the piece immediately from the storefront and customer wishlists.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-accent uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-accent font-bold uppercase tracking-wider"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product List Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#111116] border border-white/10 p-12 text-center">
          <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h3 className="font-serif text-xl text-white">No creations match your query</h3>
          <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto font-sans">
            Try adjusting your search criteria or add a new piece to the atelier catalog.
          </p>
          <button
            onClick={() => setAdminTab('add-product')}
            className="mt-6 px-6 py-2.5 bg-[#c5a059] text-black font-accent text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#111116] border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0c0c0e] border-b border-white/10 text-white/40 font-accent uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 pl-4">Piece Details</th>
                  <th className="py-3.5 px-3">Category &amp; Gender</th>
                  <th className="py-3.5 px-3">Price &amp; MRP</th>
                  <th className="py-3.5 px-3">Badge &amp; Stock</th>
                  <th className="py-3.5 px-3">Purchase URL / Target</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((product) => {
                  const hasLink = product.purchaseUrl && product.purchaseUrl.trim().length > 5;
                  
                  return (
                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                      
                      {/* 1. Details & Image */}
                      <td className="py-4 pl-4">
                        <div className="flex items-center gap-3.5 max-w-xs sm:max-w-sm">
                          <div className="relative w-12 h-16 bg-black border border-white/10 shrink-0 overflow-hidden group-hover:border-[#c5a059]/40 transition-colors">
                            <img 
                              src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85'} 
                              alt={product.name} 
                              className="w-full h-full object-cover" 
                            />
                            {product.images && product.images.length > 1 && (
                              <span className="absolute bottom-0 right-0 bg-black/80 text-[9px] px-1 text-white/60 font-mono">
                                +{product.images.length - 1}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white group-hover:text-[#c5a059] transition-colors line-clamp-1">
                              {product.name}
                            </div>
                            <div className="text-[10px] text-white/40 font-mono flex items-center gap-2 mt-0.5">
                              <span>{product.id}</span>
                              <span>&bull;</span>
                              <span>{product.sizes?.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Category & Gender */}
                      <td className="py-4 px-3 text-white/70">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 bg-white/5 border border-white/10 text-[10px] uppercase font-accent">
                            {product.category}
                          </span>
                          <div className="text-[10px] text-white/40 uppercase font-accent">
                            {product.gender || 'unisex'}
                          </div>
                        </div>
                      </td>

                      {/* 3. Price & Discount */}
                      <td className="py-4 px-3">
                        <div className="font-mono text-white font-semibold">
                          ₹{product.price.toLocaleString('en-IN')}
                        </div>
                        {product.originalPrice && (
                          <div className="text-[10px] text-white/30 line-through font-mono">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                            {product.discount && (
                              <span className="text-emerald-400 font-bold ml-1.5 no-underline">
                                -{product.discount}%
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 4. Badge & Stock */}
                      <td className="py-4 px-3">
                        <div className="space-y-1">
                          {product.badge && product.badge !== 'None' ? (
                            <span className={`inline-block px-2 py-0.5 text-[9px] font-accent uppercase font-bold tracking-wider ${
                              product.badge === 'Trending' ? 'bg-amber-950/50 text-amber-300 border border-amber-500/40' :
                              product.badge === 'New' ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40' :
                              product.badge === 'Sale' ? 'bg-rose-950/50 text-rose-300 border border-rose-500/40' :
                              'bg-purple-950/50 text-purple-300 border border-purple-500/40'
                            }`}>
                              {product.badge}
                            </span>
                          ) : (
                            <span className="text-[10px] text-white/30 font-accent">—</span>
                          )}

                          <div className="text-[10px]">
                            <span className={`${
                              product.stockStatus === 'Out of Stock' ? 'text-red-400' :
                              product.stockStatus === 'Low Stock' ? 'text-amber-400' :
                              'text-white/50'
                            }`}>
                              {product.stockStatus || 'In Stock'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 5. Purchase URL */}
                      <td className="py-4 px-3">
                        {hasLink ? (
                          <div className="space-y-0.5">
                            <button
                              onClick={() => handlePurchase(product)}
                              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors group/link"
                              title={product.purchaseUrl}
                            >
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate max-w-[130px] font-mono text-[11px] underline underline-offset-2">
                                {product.purchaseUrl.includes('amazon') ? 'Amazon' : 
                                 product.purchaseUrl.includes('flipkart') ? 'Flipkart' : 
                                 product.purchaseUrl.includes('meesho') ? 'Meesho' : 'External Shop'}
                              </span>
                            </button>
                            <div className="text-[9px] text-white/30 truncate max-w-[140px] font-mono">
                              {product.purchaseUrl}
                            </div>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-[10px] text-amber-400/80 bg-amber-950/20 px-2 py-0.5 border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Link Pending</span>
                          </div>
                        )}
                      </td>

                      {/* 6. Published Toggle */}
                      <td className="py-4 px-3">
                        <button
                          onClick={() => toggleProductPublish(product.id)}
                          className={`px-2.5 py-1 text-[10px] font-accent uppercase tracking-wider cursor-pointer transition-all ${
                            product.isPublished 
                              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60' 
                              : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {product.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </td>

                      {/* 7. Action Buttons */}
                      <td className="py-4 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit */}
                          <button
                            onClick={() => startEditingProduct(product)}
                            className="p-1.5 bg-white/5 hover:bg-[#c5a059] text-white hover:text-black transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => duplicateProduct(product.id)}
                            className="p-1.5 bg-white/5 hover:bg-white text-white/70 hover:text-black transition-colors"
                            title="Duplicate Product"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* View On Store */}
                          <button
                            onClick={() => navigateToProduct(product)}
                            className="p-1.5 bg-white/5 hover:bg-white text-white/70 hover:text-black transition-colors"
                            title="View on Customer Storefront"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="p-1.5 bg-white/5 hover:bg-red-600 text-white/50 hover:text-white transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
