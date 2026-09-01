import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Filter, 
  SlidersHorizontal, 
  Grid2X2, 
  Grid3X3, 
  LayoutGrid, 
  List, 
  X, 
  Check, 
  ChevronDown, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { LUXORA_PRODUCTS } from '../data/products';
import { ProductCard } from './ProductCard';
import { ProductCategory, GenderCategory, Product } from '../types';

const CATEGORIES: ProductCategory[] = [
  'Jackets',
  'Oversized T-Shirts',
  'Hoodies',
  'Cargo Pants',
  'Jeans',
  'Shirts',
  'Sweatshirts',
  'Accessories'
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '39', '40', '41', '42', '43', '44'];
const COLORS = [
  { name: 'Black', hex: '#111112' },
  { name: 'Off-White / Cream', hex: '#ece9e2' },
  { name: 'Charcoal / Slate', hex: '#2c2d30' },
  { name: 'Camel / Tan', hex: '#b38b59' },
  { name: 'Indigo Blue', hex: '#16233b' },
  { name: 'Olive / Moss', hex: '#474d3f' },
];

export const ShopPage: React.FC = () => {
  const { filters, setFilters, resetFilters } = useStore();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3 | 4 | 1>(3);
  const [visibleCount, setVisibleCount] = useState(12);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return LUXORA_PRODUCTS.filter((product) => {
      // Search term
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match = 
          product.name.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q) ||
          product.tags.some(t => t.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Category
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Gender
      if (filters.gender !== 'all') {
        if (product.gender !== filters.gender && product.gender !== 'unisex') {
          return false;
        }
      }

      // Price range
      if (product.price < filters.minPrice || product.price > filters.maxPrice) {
        return false;
      }

      // Sizes
      if (filters.sizes.length > 0) {
        const hasSize = filters.sizes.some(s => product.sizes.includes(s));
        if (!hasSize) return false;
      }

      // Colors
      if (filters.colors.length > 0) {
        const hasColor = filters.colors.some(c => 
          product.colors.some(pc => pc.name.toLowerCase().includes(c.toLowerCase()))
        );
        if (!hasColor) return false;
      }

      // In stock
      if (filters.inStockOnly && product.stockStatus !== 'in_stock') {
        return false;
      }

      // Discount
      if (filters.discountOnly && (!product.discount || product.discount <= 0)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'discount') return (b.discount || 0) - (a.discount || 0);
      if (filters.sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return 0; // featured default
    });
  }, [filters]);

  const toggleSizeFilter = (size: string) => {
    setFilters(prev => {
      const exists = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
      };
    });
  };

  const toggleColorFilter = (colorName: string) => {
    setFilters(prev => {
      const exists = prev.colors.includes(colorName);
      return {
        ...prev,
        colors: exists ? prev.colors.filter(c => c !== colorName) : [...prev.colors, colorName]
      };
    });
  };

  const hasActiveFilters = 
    filters.category !== '' ||
    filters.gender !== 'all' ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.discountOnly ||
    filters.maxPrice < 35000;

  const currentProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div id="shop-catalog-page" className="min-h-screen bg-[#0a0a0c] pt-8 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Banner / Header */}
        <div className="py-8 sm:py-12 border-b border-white/10 mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-accent uppercase tracking-[0.3em] text-[#c9a86a] block mb-2">
              CATALOGUE RAISONNÉ
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl uppercase font-light tracking-wide text-white">
              {filters.gender === 'men' ? 'Men’s Atelier' : filters.gender === 'women' ? 'Women’s Atelier' : filters.discountOnly ? 'Private Sale' : filters.category ? filters.category : 'The Collection'}
            </h1>
            <p className="mt-2 text-xs sm:text-sm font-sans text-white/60 max-w-xl">
              Precision crafted luxury fashion, tailored with Italian virgin wool, Californian Supima, and Japanese shuttle-loom denim.
            </p>
          </div>

          <div className="text-xs font-mono text-white/60">
            Showing <strong className="text-white font-serif text-base">{filteredProducts.length}</strong> creations
          </div>
        </div>

        {/* Action Bar (Filters toggle, Sort By, Layout Grid Switcher) */}
        <div className="bg-[#101013] border border-white/10 p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
          
          {/* Mobile & Desktop Filter Toggle */}
          <div className="flex items-center gap-3">
            <button
              id="filter-toggle-btn"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-accent text-xs tracking-widest uppercase flex items-center gap-2 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#c9a86a]" />
              <span>Filters {hasActiveFilters && `(${filters.sizes.length + filters.colors.length + (filters.category ? 1 : 0) + (filters.gender !== 'all' ? 1 : 0)})`}</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#c9a86a] hover:text-[#e7cf9e] font-accent uppercase tracking-wider flex items-center gap-1.5 px-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </button>
            )}
          </div>

          {/* Right Controls: Sort & Grid View Switcher */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-accent uppercase tracking-wider text-white/50 hidden sm:inline">
                Sort:
              </span>
              <select
                id="shop-sort-select"
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="bg-black/60 border border-white/15 px-3 py-2 text-xs font-sans text-white focus:outline-none focus:border-[#c9a86a]"
              >
                <option value="featured">Featured Runway</option>
                <option value="newest">Newest Additions</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rating</option>
                <option value="discount">Largest Privilege</option>
              </select>
            </div>

            {/* Grid Layout Switcher (Desktop) */}
            <div className="hidden lg:flex items-center border border-white/15 bg-black/40 p-0.5">
              <button
                onClick={() => setGridCols(2)}
                className={`p-1.5 ${gridCols === 2 ? 'bg-[#c9a86a] text-[#0c0c0e]' : 'text-white/60 hover:text-white'}`}
                title="2 Columns"
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(3)}
                className={`p-1.5 ${gridCols === 3 ? 'bg-[#c9a86a] text-[#0c0c0e]' : 'text-white/60 hover:text-white'}`}
                title="3 Columns"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-1.5 ${gridCols === 4 ? 'bg-[#c9a86a] text-[#0c0c0e]' : 'text-white/60 hover:text-white'}`}
                title="4 Columns"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(1)}
                className={`p-1.5 ${gridCols === 1 ? 'bg-[#c9a86a] text-[#0c0c0e]' : 'text-white/60 hover:text-white'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-[11px] font-accent uppercase tracking-wider text-white/50 mr-1">
              Active:
            </span>
            {filters.category && (
              <span className="inline-flex items-center gap-1.5 bg-[#c9a86a]/15 border border-[#c9a86a]/40 text-[#c9a86a] text-xs px-3 py-1 font-accent">
                {filters.category}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(p => ({ ...p, category: '' }))} />
              </span>
            )}
            {filters.gender !== 'all' && (
              <span className="inline-flex items-center gap-1.5 bg-[#c9a86a]/15 border border-[#c9a86a]/40 text-[#c9a86a] text-xs px-3 py-1 font-accent uppercase">
                {filters.gender}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(p => ({ ...p, gender: 'all' }))} />
              </span>
            )}
            {filters.sizes.map(sz => (
              <span key={sz} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs px-2.5 py-1 font-mono">
                Size {sz}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleSizeFilter(sz)} />
              </span>
            ))}
            {filters.colors.map(col => (
              <span key={col} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs px-2.5 py-1 font-sans">
                {col}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleColorFilter(col)} />
              </span>
            ))}
          </div>
        )}

        {/* Main Grid Layout with Collapsible Filter Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Filter Sidebar (Desktop Collapsible / Mobile Modal) */}
          <AnimatePresence>
            {mobileFilterOpen && (
              <motion.aside
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="lg:col-span-3 bg-[#111115] border border-white/10 p-6 space-y-7 mb-8 lg:mb-0"
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="font-serif text-lg tracking-wider text-white">
                    Refine Selection
                  </h3>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 text-white/50 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Gender Category */}
                <div>
                  <h4 className="text-[11px] font-accent uppercase tracking-widest text-[#c9a86a] font-semibold mb-3">
                    Universe / Gender
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {(['all', 'men', 'women'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setFilters(p => ({ ...p, gender: g }))}
                        className={`py-2 text-xs font-accent uppercase tracking-wider transition-colors border ${
                          filters.gender === g
                            ? 'bg-[#c9a86a] text-[#0c0c0e] font-bold border-[#c9a86a]'
                            : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category List */}
                <div>
                  <h4 className="text-[11px] font-accent uppercase tracking-widest text-[#c9a86a] font-semibold mb-3">
                    Category
                  </h4>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setFilters(p => ({ ...p, category: '' }))}
                      className={`w-full text-left px-3 py-2 text-xs font-sans transition-colors flex items-center justify-between ${
                        filters.category === '' ? 'bg-[#c9a86a]/15 text-[#c9a86a] font-semibold' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <span>All Pieces</span>
                      <span className="text-white/40 font-mono">({LUXORA_PRODUCTS.length})</span>
                    </button>
                    {CATEGORIES.map((cat) => {
                      const count = LUXORA_PRODUCTS.filter(p => p.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setFilters(p => ({ ...p, category: cat }))}
                          className={`w-full text-left px-3 py-2 text-xs font-sans transition-colors flex items-center justify-between ${
                            filters.category === cat ? 'bg-[#c9a86a]/15 text-[#c9a86a] font-semibold' : 'text-white/70 hover:text-white'
                          }`}
                        >
                          <span>{cat}</span>
                          <span className="text-white/40 font-mono">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Filter Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-accent uppercase tracking-wider mb-2">
                    <span className="text-[#c9a86a] font-semibold">Max Price</span>
                    <span className="font-mono text-white font-bold">
                      ₹{filters.maxPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3000"
                    max="35000"
                    step="1000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(p => ({ ...p, maxPrice: Number(e.target.value) }))}
                    className="w-full accent-[#c9a86a] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-white/40 mt-1">
                    <span>₹3,000</span>
                    <span>₹35,000</span>
                  </div>
                </div>

                {/* Size Filter */}
                <div>
                  <h4 className="text-[11px] font-accent uppercase tracking-widest text-[#c9a86a] font-semibold mb-3">
                    Size
                  </h4>
                  <div className="grid grid-cols-4 gap-1.5">
                    {SIZES.map((sz) => {
                      const isSelected = filters.sizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          onClick={() => toggleSizeFilter(sz)}
                          className={`py-2 text-xs font-sans font-semibold border transition-all ${
                            isSelected
                              ? 'bg-[#c9a86a] text-[#0c0c0e] border-[#c9a86a]'
                              : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Swatches */}
                <div>
                  <h4 className="text-[11px] font-accent uppercase tracking-widest text-[#c9a86a] font-semibold mb-3">
                    Color Palette
                  </h4>
                  <div className="space-y-2">
                    {COLORS.map((col) => {
                      const isSelected = filters.colors.includes(col.name);
                      return (
                        <button
                          key={col.name}
                          onClick={() => toggleColorFilter(col.name)}
                          className={`w-full px-3 py-1.5 text-xs font-sans flex items-center justify-between border transition-all ${
                            isSelected ? 'bg-white/10 border-[#c9a86a] text-white font-medium' : 'border-white/5 text-white/70 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-3.5 h-3.5 rounded-full border border-black" style={{ backgroundColor: col.hex }} />
                            <span>{col.name}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#c9a86a]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Toggles: In Stock & Sale */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <label className="flex items-center justify-between text-xs text-white/80 cursor-pointer">
                    <span>In Stock Only</span>
                    <input
                      type="checkbox"
                      checked={filters.inStockOnly}
                      onChange={(e) => setFilters(p => ({ ...p, inStockOnly: e.target.checked }))}
                      className="accent-[#c9a86a] w-4 h-4 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-white/80 cursor-pointer">
                    <span>Privilege Sale Only</span>
                    <input
                      type="checkbox"
                      checked={filters.discountOnly}
                      onChange={(e) => setFilters(p => ({ ...p, discountOnly: e.target.checked }))}
                      className="accent-[#c9a86a] w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>

              </motion.aside>
            )}
          </AnimatePresence>

          {/* Product Grid Area */}
          <main className={`${mobileFilterOpen ? 'lg:col-span-9' : 'lg:col-span-12'}`}>
            {currentProducts.length === 0 ? (
              <div className="py-24 text-center border border-white/10 p-8 bg-[#111114]">
                <Sparkles className="w-8 h-8 text-[#c9a86a] mx-auto mb-4 opacity-70" />
                <h3 className="font-serif text-2xl text-white font-light mb-2">
                  No matching creations
                </h3>
                <p className="text-xs text-white/60 max-w-md mx-auto mb-6">
                  We could not find any items matching your selected criteria. Try adjusting your filters or price thresholds.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 bg-[#c9a86a] text-[#0c0c0e] font-accent text-xs uppercase tracking-widest font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div>
                <div
                  className={`grid gap-6 ${
                    gridCols === 1
                      ? 'grid-cols-1'
                      : gridCols === 2
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : gridCols === 4
                      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  }`}
                >
                  {currentProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load More Button */}
                {visibleCount < filteredProducts.length && (
                  <div className="mt-16 text-center">
                    <p className="text-xs font-mono text-white/50 mb-3">
                      Showing {visibleCount} of {filteredProducts.length} items
                    </p>
                    <button
                      id="load-more-products-btn"
                      onClick={() => setVisibleCount(prev => prev + 8)}
                      className="px-10 py-4 bg-white/5 hover:bg-[#c9a86a] hover:text-[#0c0c0e] text-white border border-white/20 transition-all font-accent text-xs tracking-[0.25em] uppercase font-bold"
                    >
                      LOAD MORE RUNWAY PIECES
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
};
