import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Eye, ExternalLink, Star, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const { 
    navigateToProduct, 
    toggleWishlist, 
    isInWishlist, 
    handlePurchase, 
    setQuickViewProduct 
  } = useStore();

  const [isHovered, setIsHovered] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const secondImage = product.images?.[1] || product.images?.[0] || product.image;
  const primaryImage = product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85';

  const hasPurchaseLink = product.purchaseUrl && product.purchaseUrl.trim().length > 5;

  const onPurchaseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handlePurchase(product);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      data-product-card="true"
      data-cursor="view"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigateToProduct(product)}
      className="group relative cursor-pointer flex flex-col bg-[#111] border border-white/5 hover:border-[#c5a059]/50 transition-all duration-500 overflow-hidden"
    >
      {/* 1. Image Container with Dual Image Hover Swap */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#161616]">
        {/* Primary Image */}
        <img
          src={primaryImage}
          alt={product.name}
          loading={priority ? 'eager' : 'lazy'}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 ease-out ${
            isHovered && secondImage !== primaryImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
        />

        {/* Alternate Hover Image */}
        {secondImage && secondImage !== primaryImage && (
          <img
            src={secondImage}
            alt={`${product.name} alternate angle`}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
          />
        )}

        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25 pointer-events-none opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges & Wishlist */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10 pointer-events-none">
          <div className="flex flex-col gap-1.5 pointer-events-auto">
            {product.badge && product.badge !== 'None' && (
              <span className={`font-accent text-[9px] font-bold tracking-widest px-2.5 py-0.5 uppercase shadow-md ${
                product.badge === 'Trending' ? 'bg-[#c5a059] text-black' :
                product.badge === 'New' ? 'bg-emerald-400 text-black' :
                product.badge === 'Sale' ? 'bg-[#8b2626] text-white' :
                product.badge === 'Bestseller' ? 'bg-white text-black' :
                'bg-purple-900 text-white'
              }`}>
                {product.badge}
              </span>
            )}
            {product.discount && product.discount > 0 && product.badge !== 'Sale' && (
              <span className="bg-white text-black font-accent text-[9px] font-bold tracking-widest px-2 py-0.5 uppercase shadow-md">
                -{product.discount}%
              </span>
            )}
            {product.stockStatus === 'Low Stock' && (
              <span className="bg-amber-900/90 text-amber-200 border border-amber-500/40 font-accent text-[8.5px] font-semibold tracking-widest px-2 py-0.5 uppercase">
                LOW STOCK
              </span>
            )}
            {product.stockStatus === 'Out of Stock' && (
              <span className="bg-black/90 text-red-400 border border-red-500/40 font-accent text-[8.5px] font-semibold tracking-widest px-2 py-0.5 uppercase">
                OUT OF STOCK
              </span>
            )}
          </div>

          {/* Wishlist Heart Button */}
          <button
            id={`wishlist-toggle-${product.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`pointer-events-auto p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
              isWishlisted
                ? 'bg-[#c5a059] text-black shadow-lg scale-110'
                : 'bg-black/60 text-white/80 hover:text-white hover:bg-black/90 hover:scale-105'
            }`}
            aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Action Buttons (Floats up on hover) */}
        <div className="absolute bottom-3 left-3 right-3 z-10 transition-all duration-300 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              id={`quick-view-btn-${product.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuickViewProduct(product);
              }}
              className="py-2.5 px-2 bg-black/90 hover:bg-white hover:text-black text-white text-[10px] font-accent uppercase tracking-wider backdrop-blur-md border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>

            <button
              id={`purchase-btn-${product.id}`}
              type="button"
              onClick={onPurchaseClick}
              className={`py-2.5 px-2 text-[10px] font-accent font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                hasPurchaseLink 
                  ? 'bg-[#c5a059] hover:bg-white text-black' 
                  : 'bg-white/10 text-white/50 border border-white/10 hover:bg-white/20'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{hasPurchaseLink ? 'Purchase Now' : 'Link Soon'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Product Information Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-white/50 mb-1.5 font-sans">
            <span className="text-[9.5px] font-accent tracking-[0.25em] uppercase text-[#c5a059]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-[11px]">
              <Star className="w-3 h-3 text-[#c5a059] fill-[#c5a059]" />
              <span className="font-semibold text-white/80">{product.rating}</span>
              <span className="text-white/40">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-base sm:text-lg font-medium text-[#fdfcfb] group-hover:text-[#c5a059] transition-colors leading-snug line-clamp-1">
            {product.name}
          </h3>

          {/* Subtitle / Fabric info */}
          <p className="text-xs text-white/50 line-clamp-1 mt-1 font-sans font-light">
            {product.subtitle}
          </p>
        </div>

        {/* Price & Available Color Dots */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-lg sm:text-xl font-medium text-[#fdfcfb]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-white/40 line-through font-sans">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Color Dots */}
          <div className="flex items-center -space-x-1">
            {product.colors?.slice(0, 3).map((col, i) => (
              <span
                key={i}
                title={col.name}
                className="w-3.5 h-3.5 rounded-full border border-black ring-1 ring-white/20 inline-block"
                style={{ backgroundColor: col.hex }}
              />
            ))}
            {product.colors && product.colors.length > 3 && (
              <span className="text-[9px] text-white/50 pl-1.5 font-sans">
                +{product.colors.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
