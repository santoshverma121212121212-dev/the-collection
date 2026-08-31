import React from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Sparkles, 
  ExternalLink, 
  ArrowRight, 
  TrendingUp, 
  Plus, 
  Eye, 
  Layers, 
  Tag, 
  ShoppingBag,
  Percent,
  SlidersHorizontal
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { 
    products, 
    categories, 
    setAdminTab, 
    startEditingProduct, 
    setCurrentView,
    toggleProductPublish,
    handlePurchase 
  } = useStore();

  const totalProducts = products.length;
  const publishedProducts = products.filter(p => p.isPublished).length;
  const draftProducts = totalProducts - publishedProducts;
  const trendingCount = products.filter(p => p.isTrending || p.badge === 'Trending').length;
  const newArrivalsCount = products.filter(p => p.isNew || p.badge === 'New').length;
  const onSaleCount = products.filter(p => p.isSale || p.badge === 'Sale' || (p.discount && p.discount > 0)).length;
  const outOfStockCount = products.filter(p => p.stockStatus === 'Out of Stock').length;

  const averagePrice = totalProducts > 0 
    ? Math.round(products.reduce((acc, p) => acc + p.price, 0) / totalProducts)
    : 0;

  // Platform link distribution
  const platformStats = products.reduce((acc, p) => {
    const url = p.purchaseUrl?.toLowerCase() || '';
    if (url.includes('amazon')) acc.amazon += 1;
    else if (url.includes('flipkart')) acc.flipkart += 1;
    else if (url.includes('meesho')) acc.meesho += 1;
    else if (url.includes('myntra')) acc.myntra += 1;
    else if (url.length > 5) acc.other += 1;
    else acc.unlinked += 1;
    return acc;
  }, { amazon: 0, flipkart: 0, meesho: 0, myntra: 0, other: 0, unlinked: 0 });

  const recentProducts = [...products].slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Banner Greeting */}
      <div className="bg-gradient-to-r from-[#141419] to-[#101014] border border-[#c5a059]/25 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-accent uppercase tracking-[0.3em] text-[#c5a059] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OPERATIONAL STATUS &bull; LIVE RUNWAY SYNC</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-white font-light">
            Catalog &amp; Product <span className="italic text-[#c5a059] font-serif">Command</span>
          </h2>
          <p className="mt-1 text-xs text-white/50 font-sans max-w-xl font-light">
            Manage your fashion catalog, update real external purchase destinations, configure pricing, and organize luxury categories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setAdminTab('add-product')}
            className="px-5 py-2.5 bg-[#c5a059] text-black font-accent text-xs font-bold uppercase tracking-wider hover:bg-white transition-all flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
          
          <button
            onClick={() => setCurrentView('shop')}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-accent uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#c5a059]" />
            <span>Preview Storefront</span>
          </button>
        </div>
      </div>

      {/* Key Metric Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1 */}
        <div className="bg-[#111116] border border-white/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-accent uppercase tracking-wider text-white/50">Total Creations</span>
            <div className="p-2 bg-white/5 text-[#c5a059]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl text-white font-light">{totalProducts}</div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-white/40">
            <span className="text-emerald-400 font-medium">{publishedProducts} published</span>
            <span>&bull;</span>
            <span>{draftProducts} draft</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#111116] border border-white/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-accent uppercase tracking-wider text-white/50">Active Categories</span>
            <div className="p-2 bg-white/5 text-[#c5a059]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl text-white font-light">{categories.length}</div>
          <div className="mt-2 text-[11px] text-[#c5a059] hover:underline cursor-pointer" onClick={() => setAdminTab('categories')}>
            Manage categories &rarr;
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#111116] border border-white/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-accent uppercase tracking-wider text-white/50">Average Piece Price</span>
            <div className="p-2 bg-white/5 text-[#c5a059]">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl text-white font-light">₹{averagePrice.toLocaleString('en-IN')}</div>
          <div className="mt-2 text-[11px] text-white/40">
            Across active collection
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#111116] border border-white/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-accent uppercase tracking-wider text-white/50">Marketplace Linked</span>
            <div className="p-2 bg-white/5 text-emerald-400">
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl text-white font-light">
            {totalProducts - platformStats.unlinked} / {totalProducts}
          </div>
          <div className="mt-2 text-[11px] text-emerald-400">
            {Math.round(((totalProducts - platformStats.unlinked) / (totalProducts || 1)) * 100)}% purchase ready
          </div>
        </div>

      </div>

      {/* 2-Column: Destination Distribution & Quick Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: External Purchase Channels (5 cols) */}
        <div className="lg:col-span-5 bg-[#111116] border border-white/10 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div>
                <h3 className="font-serif text-lg text-white font-light">Purchase Routing</h3>
                <p className="text-[11px] text-white/40">Where "Purchase Now" redirects patrons</p>
              </div>
              <ExternalLink className="w-4 h-4 text-[#c5a059]" />
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span className="flex items-center gap-2 text-white/80">
                  <span className="w-2 h-2 bg-[#ff9900] rounded-full" />
                  Amazon Storefront
                </span>
                <span className="font-mono text-white font-medium">{platformStats.amazon} pieces</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span className="flex items-center gap-2 text-white/80">
                  <span className="w-2 h-2 bg-[#2874f0] rounded-full" />
                  Flipkart Storefront
                </span>
                <span className="font-mono text-white font-medium">{platformStats.flipkart} pieces</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span className="flex items-center gap-2 text-white/80">
                  <span className="w-2 h-2 bg-[#f43397] rounded-full" />
                  Meesho Storefront
                </span>
                <span className="font-mono text-white font-medium">{platformStats.meesho} pieces</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span className="flex items-center gap-2 text-white/80">
                  <span className="w-2 h-2 bg-[#c5a059] rounded-full" />
                  Direct / Other Shop Link
                </span>
                <span className="font-mono text-white font-medium">{platformStats.other} pieces</span>
              </div>

              {platformStats.unlinked > 0 && (
                <div className="flex items-center justify-between text-xs py-1.5 bg-amber-950/20 px-2 border border-amber-500/30 text-amber-300">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Unlinked / Link Coming Soon
                  </span>
                  <span className="font-mono font-medium">{platformStats.unlinked} pieces</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-white/5">
            <p className="text-[11px] text-white/40 leading-relaxed font-light">
              Patrons clicking <strong className="text-white">"PURCHASE NOW"</strong> are immediately redirected to the direct product listing on your external partner store without intermediate carts or payments.
            </p>
          </div>
        </div>

        {/* Right: Curated Badges & Highlights (7 cols) */}
        <div className="lg:col-span-7 bg-[#111116] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div>
              <h3 className="font-serif text-lg text-white font-light">Badges &amp; Curation Status</h3>
              <p className="text-[11px] text-white/40">Visual tags displayed on product cards</p>
            </div>
            <button
              onClick={() => setAdminTab('products')}
              className="text-xs font-accent text-[#c5a059] hover:text-white transition-colors"
            >
              View All Products &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3 bg-[#0a0a0c] border border-white/5 text-center">
              <span className="text-[10px] uppercase font-accent tracking-wider text-amber-400 block mb-1">Trending</span>
              <span className="font-serif text-2xl text-white">{trendingCount}</span>
            </div>

            <div className="p-3 bg-[#0a0a0c] border border-white/5 text-center">
              <span className="text-[10px] uppercase font-accent tracking-wider text-emerald-400 block mb-1">New Arrivals</span>
              <span className="font-serif text-2xl text-white">{newArrivalsCount}</span>
            </div>

            <div className="p-3 bg-[#0a0a0c] border border-white/5 text-center">
              <span className="text-[10px] uppercase font-accent tracking-wider text-rose-400 block mb-1">On Sale</span>
              <span className="font-serif text-2xl text-white">{onSaleCount}</span>
            </div>

            <div className="p-3 bg-[#0a0a0c] border border-white/5 text-center">
              <span className="text-[10px] uppercase font-accent tracking-wider text-gray-400 block mb-1">Out of Stock</span>
              <span className="font-serif text-2xl text-white">{outOfStockCount}</span>
            </div>
          </div>

          <div className="p-4 bg-[#0d0d10] border border-[#c5a059]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#c5a059]/10 text-[#c5a059]">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-medium text-white">Full Catalog Operations</div>
                <div className="text-[11px] text-white/40">Search, filter, edit prices, update images &amp; links</div>
              </div>
            </div>
            <button
              onClick={() => setAdminTab('products')}
              className="px-4 py-2 bg-white/10 hover:bg-white text-white hover:text-black font-accent text-xs uppercase tracking-wider transition-colors"
            >
              Open Catalog
            </button>
          </div>
        </div>

      </div>

      {/* Recent Products Overview */}
      <div className="bg-[#111116] border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
          <div>
            <h3 className="font-serif text-xl text-white font-light">Recent Creations</h3>
            <p className="text-xs text-white/40">Latest products configured in the system</p>
          </div>

          <button
            onClick={() => setAdminTab('products')}
            className="text-xs font-accent text-[#c5a059] hover:text-white transition-colors"
          >
            View All ({totalProducts}) &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 font-accent uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Product</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Purchase Target</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentProducts.map((product) => {
                const isLinked = product.purchaseUrl && product.purchaseUrl.length > 5;
                return (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-3">
                        <img 
                          src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85'} 
                          alt="" 
                          className="w-10 h-12 object-cover bg-black border border-white/10 shrink-0" 
                        />
                        <div>
                          <div className="font-medium text-white group-hover:text-[#c5a059] transition-colors">
                            {product.name}
                          </div>
                          <div className="text-[10px] text-white/40 font-mono">{product.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 text-white/70">
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[10px] uppercase font-accent">
                        {product.category}
                      </span>
                    </td>

                    <td className="py-3.5">
                      <span className="font-mono text-white font-medium">₹{product.price.toLocaleString('en-IN')}</span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-white/30 line-through ml-2 font-mono">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5">
                      {isLinked ? (
                        <button
                          onClick={() => handlePurchase(product)}
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                          title={product.purchaseUrl}
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate max-w-[140px]">
                            {product.purchaseUrl.includes('amazon') ? 'Amazon' : 
                             product.purchaseUrl.includes('flipkart') ? 'Flipkart' : 
                             product.purchaseUrl.includes('meesho') ? 'Meesho' : 'External Shop'}
                          </span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-amber-400/80 font-accent uppercase">
                          No URL set
                        </span>
                      )}
                    </td>

                    <td className="py-3.5">
                      <button
                        onClick={() => toggleProductPublish(product.id)}
                        className={`px-2 py-0.5 text-[10px] font-accent uppercase tracking-wider cursor-pointer transition-colors ${
                          product.isPublished 
                            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-white/5 text-white/40 border border-white/10'
                        }`}
                      >
                        {product.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEditingProduct(product)}
                          className="px-3 py-1 bg-white/5 hover:bg-[#c5a059] text-white hover:text-black font-accent text-[10px] uppercase tracking-wider transition-all"
                        >
                          Edit
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
    </div>
  );
};
