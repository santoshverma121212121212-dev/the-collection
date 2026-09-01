import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Star, 
  ExternalLink, 
  Heart, 
  ArrowRight, 
  Ruler, 
  Truck, 
  ShieldCheck, 
  Sparkles,
  Store
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    handlePurchase,
    toggleWishlist,
    isInWishlist,
    setIsSizeGuideOpen,
    navigateToProduct
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  useEffect(() => {
    if (quickViewProduct) {
      setActiveImageIndex(0);
      setSelectedSize(quickViewProduct.sizes?.[0] || 'Standard');
      setSelectedColor(quickViewProduct.colors?.[0]?.name || 'Standard');
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const isWishlisted = isInWishlist(quickViewProduct.id);
  const images = (quickViewProduct.images && quickViewProduct.images.length > 0)
    ? quickViewProduct.images
    : [quickViewProduct.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85'];

  const hasPurchaseLink = quickViewProduct.purchaseUrl && quickViewProduct.purchaseUrl.trim().length > 5;

  const handleGoToDetail = () => {
    const prod = quickViewProduct;
    setQuickViewProduct(null);
    navigateToProduct(prod);
  };

  const onPurchase = () => {
    handlePurchase(quickViewProduct);
    setQuickViewProduct(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setQuickViewProduct(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          id="quick-view-modal-container"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-[#101013] border border-[#c5a059]/30 shadow-2xl z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            id="close-quick-view-modal-btn"
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Quick View"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto md:overflow-hidden">
            
            {/* Left: Gallery (5 cols) */}
            <div className="md:col-span-6 bg-[#151519] flex flex-col">
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover object-center transition-all duration-500"
                />
                
                {quickViewProduct.discount && (
                  <span className="absolute top-4 left-4 bg-[#8b2626] text-white font-accent text-[10px] font-bold tracking-widest px-3 py-1 uppercase shadow-md">
                    -{quickViewProduct.discount}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 bg-[#0c0c0e] border-t border-white/5 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`w-14 h-18 shrink-0 overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIndex === i ? 'border-[#c5a059]' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details (6 cols) */}
            <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                {/* Header Tags */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[10px] font-accent uppercase tracking-[0.25em] text-[#c5a059] font-semibold">
                    {quickViewProduct.category} &bull; {quickViewProduct.collection || 'Collection'}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-[#c5a059] fill-[#c5a059]" />
                    <span className="font-semibold text-white text-xs">{quickViewProduct.rating || 5.0}</span>
                    <span className="text-white/40 text-xs">({quickViewProduct.reviewsCount || 8} reviews)</span>
                  </div>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium mb-1">
                  {quickViewProduct.name}
                </h3>
                
                <p className="text-xs text-white/60 font-sans line-clamp-2 mb-4">
                  {quickViewProduct.subtitle}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mb-6 pb-4 border-b border-white/10">
                  <span className="font-serif text-3xl text-[#c5a059] font-bold">
                    ₹{quickViewProduct.price.toLocaleString('en-IN')}
                  </span>
                  {quickViewProduct.originalPrice && (
                    <span className="text-sm text-white/40 line-through font-sans">
                      ₹{quickViewProduct.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-[11px] font-accent uppercase tracking-wider text-[#c5a059] ml-auto">
                    {quickViewProduct.stockStatus || 'In Stock'}
                  </span>
                </div>

                {/* Color Selector */}
                {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
                  <div className="mb-5">
                    <label className="text-[11px] font-accent uppercase tracking-widest text-white/80 block mb-2">
                      Colorway: <strong className="text-[#c5a059]">{selectedColor}</strong>
                    </label>
                    <div className="flex items-center gap-3">
                      {quickViewProduct.colors.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedColor(c.name)}
                          className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                            selectedColor === c.name ? 'border-[#c5a059] scale-110' : 'border-white/20'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selector + Size Guide Link */}
                {quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-accent uppercase tracking-widest text-white/80">
                        Available Sizes
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsSizeGuideOpen(true)}
                        className="text-[10.5px] font-accent uppercase tracking-wider text-[#c5a059] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Ruler className="w-3 h-3" />
                        Size Guide
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {quickViewProduct.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3 py-1.5 text-xs font-sans font-semibold border transition-all cursor-pointer ${
                            selectedSize === sz
                              ? 'bg-[#c5a059] text-black border-[#c5a059]'
                              : 'bg-white/5 text-white border-white/10 hover:border-white/30'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {/* Purchase Now Button */}
                    <button
                      id="quick-view-purchase-btn"
                      type="button"
                      onClick={onPurchase}
                      className="flex-1 h-12 bg-[#c5a059] hover:bg-white text-black font-accent font-bold text-xs tracking-[0.22em] uppercase transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>{hasPurchaseLink ? 'PURCHASE NOW' : 'PURCHASE NOW'}</span>
                    </button>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(quickViewProduct)}
                      className={`w-12 h-12 border flex items-center justify-center transition-colors cursor-pointer ${
                        isWishlisted
                          ? 'border-[#c5a059] bg-[#c5a059] text-[#0c0c0e]'
                          : 'border-white/20 bg-white/5 text-white hover:border-[#c5a059]'
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* View Full Details link */}
                  <button
                    type="button"
                    onClick={handleGoToDetail}
                    className="w-full py-2.5 text-center text-xs font-accent uppercase tracking-widest text-white/60 hover:text-[#c5a059] transition-colors flex items-center justify-center gap-1.5 pt-1 cursor-pointer"
                  >
                    <span>View Complete Atelier Editorial &amp; Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* Bottom Feature Badges */}
              <div className="pt-4 border-t border-white/5 mt-4 grid grid-cols-2 gap-2 text-[10.5px] font-sans text-white/50">
                <div className="flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Verified Partner Fulfillment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Authentic Garment Guarantee</span>
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
