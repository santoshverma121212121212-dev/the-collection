import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  Heart, 
  ExternalLink, 
  Ruler, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  ChevronDown, 
  Share2, 
  Check, 
  ArrowLeft,
  Sparkles,
  Layers,
  ShoppingBag,
  Store
} from 'lucide-react';
import { Product, ProductReview } from '../types';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';

interface ProductDetailPageProps {
  product: Product;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product }) => {
  const {
    toggleWishlist,
    isInWishlist,
    setIsSizeGuideOpen,
    setCurrentView,
    handlePurchase,
    showToast,
    products
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0]?.name || 'Standard');
  const [openAccordion, setOpenAccordion] = useState<'details' | 'materials' | 'fit' | 'shipping' | 'reviews'>('details');

  // Review submission state
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [localReviews, setLocalReviews] = useState<ProductReview[]>(product.reviews || []);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const productImages = (product.images && product.images.length > 0) 
    ? product.images 
    : [product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85'];

  const hasPurchaseLink = product.purchaseUrl && product.purchaseUrl.trim().length > 5;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor || !reviewComment) return;

    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      author: reviewAuthor,
      rating: reviewRating,
      date: new Date().toISOString().split('T')[0],
      title: 'Atelier Experience',
      comment: reviewComment,
      verifiedPurchase: true,
      userLocation: 'Verified Client'
    };

    setLocalReviews([newRev, ...localReviews]);
    setReviewAuthor('');
    setReviewComment('');
    setShowReviewForm(false);

    showToast({
      title: 'Review Submitted',
      message: 'Thank you for sharing your atelier experience.',
      type: 'info'
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast({
        title: 'Link Copied',
        message: 'Product link copied to clipboard.',
        type: 'info'
      });
    }
  };

  // Related products from dynamic store catalog
  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.gender === product.gender))
    .slice(0, 4);

  return (
    <div id="product-detail-view" className="min-h-screen bg-[#0c0c0e] pt-6 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Back Link */}
        <div className="flex items-center justify-between py-4 text-xs font-accent uppercase tracking-widest text-white/50 border-b border-white/5 mb-8">
          <button
            onClick={() => setCurrentView('shop')}
            className="hover:text-[#c5a059] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Atelier Collection</span>
          </button>

          <div className="flex items-center gap-2">
            <span>{product.gender || 'Collection'}</span>
            <span>/</span>
            <span className="text-[#c5a059]">{product.category}</span>
          </div>
        </div>

        {/* Main Product Layout (Gallery + Information) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left: Interactive Multi-Image Gallery (7 cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            
            {/* Vertical Thumbnail Strip */}
            {productImages.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[640px] shrink-0 no-scrollbar">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-18 sm:w-20 aspect-[3/4] overflow-hidden border-2 transition-all relative shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#c5a059] ring-2 ring-[#c5a059]/30'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main High-Res Image Canvas */}
            <div className="relative flex-1 aspect-[3/4] overflow-hidden bg-[#151519] border border-white/10 group">
              <img
                src={productImages[activeImageIndex] || productImages[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
              />
              
              {product.discount && product.discount > 0 && (
                <span className="absolute top-4 left-4 bg-[#8b2626] text-white font-accent text-xs font-bold tracking-widest px-3 py-1 uppercase shadow-xl">
                  -{product.discount}% PRIVILEGE
                </span>
              )}

              <button
                onClick={handleShare}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Share Piece"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Product Specifications & Order Actions (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              
              {/* Collection & Category */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[11px] font-accent uppercase tracking-[0.25em] text-[#c5a059] font-semibold">
                  {product.collection || 'Atelier Collection'}
                </span>
                
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-[#c5a059] fill-[#c5a059]" />
                  <span className="font-semibold text-white text-xs">{product.rating || 5.0}</span>
                  <span className="text-white/40 text-xs">({localReviews.length} Reviews)</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h1 className="font-serif text-3xl sm:text-4xl text-white font-normal leading-tight mb-2">
                {product.name}
              </h1>

              <p className="text-sm font-sans text-white/70 font-light leading-relaxed mb-6">
                {product.subtitle}
              </p>

              {/* Pricing Section */}
              <div className="flex items-baseline gap-4 py-4 border-y border-white/10 mb-6">
                <span className="font-serif text-3xl sm:text-4xl text-[#c5a059] font-bold">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-white/40 line-through font-sans">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs text-white/50 font-sans ml-auto">
                  Direct official fulfillment
                </span>
              </div>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs font-accent uppercase tracking-wider mb-2.5">
                    <span className="text-white/80">
                      Colorway: <strong className="text-[#c5a059]">{selectedColor}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`w-9 h-9 rounded-full border-2 transition-all relative flex items-center justify-center cursor-pointer ${
                          selectedColor === c.name ? 'border-[#c5a059] scale-110' : 'border-white/20 hover:border-white/50'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {selectedColor === c.name && (
                          <Check className={`w-4 h-4 ${c.hex === '#ece9e2' || c.hex === '#dfdcd5' ? 'text-black' : 'text-white'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="font-accent uppercase tracking-wider text-white/80">
                      Select Size: <strong className="text-white">{selectedSize}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="font-accent text-[11px] uppercase tracking-wider text-[#c5a059] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      Size Guide
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-4 py-2.5 text-xs font-sans font-semibold border transition-all cursor-pointer ${
                          selectedSize === sz
                            ? 'bg-[#c5a059] text-black border-[#c5a059] shadow-md font-bold'
                            : 'bg-white/5 text-white border-white/10 hover:border-white/30'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main External Purchase Call-to-Action (CRITICAL) */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <button
                    id="pdp-purchase-btn"
                    type="button"
                    onClick={() => handlePurchase(product)}
                    className="flex-1 h-14 bg-[#c5a059] hover:bg-white text-black font-accent font-bold text-xs tracking-[0.22em] uppercase transition-all flex items-center justify-center gap-2 shadow-2xl cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>PURCHASE NOW</span>
                  </button>

                  {/* Wishlist */}
                  <button
                    id="pdp-wishlist-toggle-btn"
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className={`w-14 h-14 border flex items-center justify-center transition-colors cursor-pointer ${
                      isWishlisted
                        ? 'border-[#c5a059] bg-[#c5a059] text-[#0c0c0e]'
                        : 'border-white/20 bg-white/5 text-white hover:border-[#c5a059]'
                    }`}
                    aria-label="Save to Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Direct External Target Notice */}
                <div className="p-3 bg-[#111116] border border-white/10 text-center">
                  <span className="text-[11px] text-white/60 font-sans">
                    {hasPurchaseLink ? (
                      <>
                        Direct partner fulfillment via{' '}
                        <strong className="text-[#c5a059]">
                          {product.purchaseUrl?.includes('amazon') ? 'Amazon' : 
                           product.purchaseUrl?.includes('flipkart') ? 'Flipkart' : 
                           product.purchaseUrl?.includes('meesho') ? 'Meesho' : 'Verified Partner Platform'}
                        </strong>
                      </>
                    ) : (
                      <span className="text-amber-400">External purchase link is being configured by the atelier.</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Guarantees Badges */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-[#121216] border border-white/5 text-center text-[10.5px] font-sans text-white/70">
                <div className="flex flex-col items-center gap-1.5">
                  <Store className="w-4 h-4 text-[#c5a059]" />
                  <span className="font-accent uppercase tracking-wider text-[9.5px] text-white">GENUINE PRODUCT</span>
                  <span>100% Authentic Piece</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 border-x border-white/10">
                  <RefreshCw className="w-4 h-4 text-[#c5a059]" />
                  <span className="font-accent uppercase tracking-wider text-[9.5px] text-white">EASY EXCHANGE</span>
                  <span>Partner Return Policy</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
                  <span className="font-accent uppercase tracking-wider text-[9.5px] text-white">SECURE ROUTING</span>
                  <span>Direct Encrypted Link</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Collapsible Luxury Accordions Section */}
        <div className="mt-16 sm:mt-24 border-t border-white/10 pt-10 max-w-4xl mx-auto">
          
          {/* Accordion 1: Description & Tailoring */}
          <div className="border-b border-white/10">
            <button
              onClick={() => setOpenAccordion(openAccordion === 'details' ? '' as any : 'details')}
              className="w-full py-5 flex items-center justify-between text-left font-serif text-xl sm:text-2xl text-white hover:text-[#c5a059] transition-colors cursor-pointer"
            >
              <span>Product Description & Silhouette</span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openAccordion === 'details' ? 'rotate-180 text-[#c5a059]' : 'text-white/40'}`} />
            </button>
            <AnimatePresence>
              {openAccordion === 'details' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden pb-6 text-sm font-sans text-white/70 leading-relaxed space-y-3"
                >
                  <p>{product.description}</p>
                  <p>
                    Every piece is crafted in limited numbers at our specialized tailoring atelier to ensure zero overproduction and unmatched attention to stitch density.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion 2: Materials & Origin */}
          <div className="border-b border-white/10">
            <button
              onClick={() => setOpenAccordion(openAccordion === 'materials' ? '' as any : 'materials')}
              className="w-full py-5 flex items-center justify-between text-left font-serif text-xl sm:text-2xl text-white hover:text-[#c5a059] transition-colors cursor-pointer"
            >
              <span>Materials, Composition & Care</span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openAccordion === 'materials' ? 'rotate-180 text-[#c5a059]' : 'text-white/40'}`} />
            </button>
            <AnimatePresence>
              {openAccordion === 'materials' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden pb-6 text-sm font-sans text-white/70 leading-relaxed space-y-2"
                >
                  <p><strong>Composition:</strong> {product.materials || 'Luxury combed fibers'}</p>
                  <p><strong>Care Instructions:</strong> Dry clean or gentle wash in cold water with pH-neutral silk/wool detergent. Do not tumble dry. Steam press on low heat.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion 3: Fit & Sizing */}
          <div className="border-b border-white/10">
            <button
              onClick={() => setOpenAccordion(openAccordion === 'fit' ? '' as any : 'fit')}
              className="w-full py-5 flex items-center justify-between text-left font-serif text-xl sm:text-2xl text-white hover:text-[#c5a059] transition-colors cursor-pointer"
            >
              <span>Size & Fit Details</span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openAccordion === 'fit' ? 'rotate-180 text-[#c5a059]' : 'text-white/40'}`} />
            </button>
            <AnimatePresence>
              {openAccordion === 'fit' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden pb-6 text-sm font-sans text-white/70 leading-relaxed space-y-2"
                >
                  <p>{product.fitDetails || 'Contemporary relaxed drape.'}</p>
                  <p>
                    For detailed chest, shoulder, and waist measurements across all sizes, consult our interactive Size Guide.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion 4: Reviews */}
          <div className="border-b border-white/10">
            <button
              onClick={() => setOpenAccordion(openAccordion === 'reviews' ? '' as any : 'reviews')}
              className="w-full py-5 flex items-center justify-between text-left font-serif text-xl sm:text-2xl text-white hover:text-[#c5a059] transition-colors cursor-pointer"
            >
              <span>Client Reviews ({localReviews.length})</span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openAccordion === 'reviews' ? 'rotate-180 text-[#c5a059]' : 'text-white/40'}`} />
            </button>
            <AnimatePresence>
              {openAccordion === 'reviews' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden pb-6 space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/5 border border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-3xl text-white font-bold">{product.rating || 5.0}</span>
                        <div className="flex text-[#c5a059]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-white/60 mt-0.5">
                        Based on {localReviews.length} verified atelier patron reviews
                      </p>
                    </div>

                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-5 py-2.5 bg-[#c5a059] text-[#0c0c0e] font-accent text-xs uppercase tracking-wider font-bold hover:bg-white transition-colors cursor-pointer"
                    >
                      Write A Review
                    </button>
                  </div>

                  {/* Review Submission Form */}
                  {showReviewForm && (
                    <form onSubmit={handleReviewSubmit} className="p-6 bg-[#131317] border border-[#c5a059]/30 space-y-4">
                      <h4 className="font-serif text-lg text-white">Write Your Atelier Review</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-white/70 block mb-1">Your Name</label>
                          <input
                            type="text"
                            required
                            value={reviewAuthor}
                            onChange={(e) => setReviewAuthor(e.target.value)}
                            placeholder="e.g. Radhika M."
                            className="w-full p-2.5 bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/70 block mb-1">Rating</label>
                          <select
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                            className="w-full p-2.5 bg-[#1a1a20] border border-white/10 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                          >
                            <option value={5}>5 Stars — Exceptional</option>
                            <option value={4}>4 Stars — Very Good</option>
                            <option value={3}>3 Stars — Average</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-white/70 block mb-1">Your Review</label>
                        <textarea
                          rows={3}
                          required
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Describe the fabric quality, silhouette drape, and styling versatility..."
                          className="w-full p-2.5 bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="px-4 py-2 text-xs font-accent uppercase text-white/60 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-[#c5a059] text-[#0c0c0e] font-accent text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Submit Review
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {localReviews.map((rev) => (
                      <div key={rev.id} className="p-4 bg-white/5 border border-white/5">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-semibold text-sm text-white">{rev.author}</span>
                            {rev.verifiedPurchase && (
                              <span className="text-[10px] font-accent uppercase bg-[#c5a059]/20 text-[#c5a059] px-2 py-0.5">
                                Verified Patron
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-white/40 font-mono">{rev.date}</span>
                        </div>
                        <div className="flex text-[#c5a059] mb-2">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs font-sans text-white/80 leading-relaxed">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Complete The Look / Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-white/10">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-[11px] font-accent uppercase tracking-[0.25em] text-[#c5a059] block mb-2">
                STYLED BY LUXORA
              </span>
              <h3 className="font-serif text-3xl uppercase font-light text-white">
                Complete <span className="italic font-serif text-[#c5a059]">The Look</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
