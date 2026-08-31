import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  Eye, 
  AlertCircle,
  Tag,
  Layers,
  Palette,
  Ruler
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory, GenderCategory, ProductBadge, StockStatus, ProductColor } from '../../types';
import { ProductCard } from '../ProductCard';

const SAMPLE_PRESET_IMAGES = [
  { label: 'Trench Coat', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Supima Tee', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Denim Pants', url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Hoodie Fleece', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Cargo Trouser', url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Silk Shirt', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Crewneck', url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Leather Belt', url: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=85' }
];

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const WAIST_SIZES = ['28', '30', '32', '34', '36', '38'];

interface AdminProductFormProps {
  isEditing?: boolean;
}

export const AdminProductForm: React.FC<AdminProductFormProps> = ({ isEditing = false }) => {
  const { 
    products, 
    categories, 
    editingProductId, 
    setAdminTab, 
    addProduct, 
    updateProduct,
    showToast 
  } = useStore();

  const existingProduct = isEditing && editingProductId 
    ? products.find(p => p.id === editingProductId) 
    : null;

  // Form State
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState<GenderCategory>('unisex');
  const [collection, setCollection] = useState('Autumn/Winter 2026');
  const [price, setPrice] = useState<number | ''>(2999);
  const [originalPrice, setOriginalPrice] = useState<number | ''>(3999);
  const [purchaseUrl, setPurchaseUrl] = useState('');
  const [stockStatus, setStockStatus] = useState<StockStatus>('In Stock');
  const [badge, setBadge] = useState<ProductBadge>('None');
  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [colors, setColors] = useState<ProductColor[]>([
    { name: 'Onyx Noir', hex: '#111112' },
    { name: 'Off-White Cream', hex: '#ece9e2' }
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#b38b59');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState('');
  const [fitDetails, setFitDetails] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [tags, setTags] = useState<string[]>(['luxury', 'atelier', 'garment']);
  const [newTagInput, setNewTagInput] = useState('');

  // Populate on editing product load
  useEffect(() => {
    if (isEditing && existingProduct) {
      setName(existingProduct.name);
      setSubtitle(existingProduct.subtitle || '');
      setCategory(existingProduct.category);
      setGender(existingProduct.gender || 'unisex');
      setCollection(existingProduct.collection || 'Autumn/Winter 2026');
      setPrice(existingProduct.price);
      setOriginalPrice(existingProduct.originalPrice || '');
      setPurchaseUrl(existingProduct.purchaseUrl || '');
      setStockStatus(existingProduct.stockStatus || 'In Stock');
      setBadge(existingProduct.badge || 'None');
      setSizes(existingProduct.sizes || ['S', 'M', 'L']);
      setColors(existingProduct.colors?.length ? existingProduct.colors : [{ name: 'Onyx Noir', hex: '#111112' }]);
      setImages(existingProduct.images?.length ? existingProduct.images : [existingProduct.image || '']);
      setDescription(existingProduct.description);
      setMaterials(existingProduct.materials || '');
      setFitDetails(existingProduct.fitDetails || '');
      setIsPublished(existingProduct.isPublished !== undefined ? existingProduct.isPublished : true);
      setTags(existingProduct.tags || ['luxury', 'atelier']);
    } else {
      // Defaults for new product
      setCategory(categories[0] || 'Oversized T-Shirts');
      setDescription('An elevated creation sculpted with architectural tailoring and pure luxury fibers.');
      setMaterials('100% Ultra-Fine Combed Long-Staple Fibers.');
      setFitDetails('Relaxed contemporary drape. Fits true to atelier dimensions.');
    }
  }, [isEditing, existingProduct, categories]);

  // Derived discount calculation
  const calculatedDiscount = (price && originalPrice && Number(originalPrice) > Number(price))
    ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)
    : 0;

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast({ title: 'Name Required', message: 'Please enter a product title.', type: 'warning' });
      return;
    }

    if (!price || Number(price) <= 0) {
      showToast({ title: 'Valid Price Required', message: 'Please provide a valid price.', type: 'warning' });
      return;
    }

    const cleanImages = images.filter(img => img.trim().length > 0);
    if (cleanImages.length === 0) {
      cleanImages.push('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85');
    }

    const productPayload: Partial<Product> = {
      name: name.trim(),
      subtitle: subtitle.trim() || 'Bespoke Atelier Creation',
      category: category || categories[0] || 'Oversized T-Shirts',
      gender,
      collection: collection.trim() || 'Autumn/Winter 2026',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discount: calculatedDiscount > 0 ? calculatedDiscount : undefined,
      images: cleanImages,
      image: cleanImages[0],
      sizes: sizes.length > 0 ? sizes : ['Standard'],
      colors: colors.length > 0 ? colors : [{ name: 'Standard', hex: '#111112' }],
      stockStatus,
      badge,
      isTrending: badge === 'Trending',
      isNew: badge === 'New',
      isSale: badge === 'Sale' || calculatedDiscount > 0,
      isBestseller: badge === 'Bestseller',
      purchaseUrl: purchaseUrl.trim(),
      isPublished,
      description: description.trim(),
      materials: materials.trim(),
      fitDetails: fitDetails.trim(),
      tags: tags.length > 0 ? tags : ['luxury', 'atelier']
    };

    let success = false;
    if (isEditing && existingProduct) {
      success = await updateProduct(existingProduct.id, productPayload);
    } else {
      success = await addProduct(productPayload);
    }

    if (success) {
      setAdminTab('products');
    }
  };

  // Size helper functions
  const toggleSize = (sz: string) => {
    setSizes(prev => prev.includes(sz) ? prev.filter(s => s !== sz) : [...prev, sz]);
  };

  const addCustomSize = () => {
    if (customSizeInput.trim() && !sizes.includes(customSizeInput.trim().toUpperCase())) {
      setSizes(prev => [...prev, customSizeInput.trim().toUpperCase()]);
      setCustomSizeInput('');
    }
  };

  // Color helper functions
  const addColor = () => {
    if (newColorName.trim()) {
      setColors(prev => [...prev, { name: newColorName.trim(), hex: newColorHex }]);
      setNewColorName('');
      setNewColorHex('#b38b59');
    }
  };

  const removeColor = (index: number) => {
    setColors(prev => prev.filter((_, i) => i !== index));
  };

  // Image helper functions
  const addImage = () => {
    if (newImageUrl.trim() && !images.includes(newImageUrl.trim())) {
      setImages(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const setAsPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  // Preview Product Object for Real-Time Render
  const previewProduct: Product = {
    id: existingProduct?.id || 'LX-PREVIEW',
    name: name || 'Garment Name Preview',
    subtitle: subtitle || 'Bespoke Atelier Creation',
    category: category || categories[0] || 'Oversized T-Shirts',
    gender,
    collection,
    price: Number(price) || 2999,
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    discount: calculatedDiscount > 0 ? calculatedDiscount : undefined,
    images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85'],
    image: images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
    sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L'],
    colors: colors.length > 0 ? colors : [{ name: 'Onyx Noir', hex: '#111112' }],
    rating: existingProduct?.rating || 5.0,
    reviewsCount: existingProduct?.reviewsCount || 12,
    reviews: existingProduct?.reviews || [],
    description: description || 'Mastercrafted garment preview.',
    materials: materials || 'Pure luxury fibers.',
    fitDetails: fitDetails || 'Relaxed drape.',
    stockStatus,
    badge,
    isTrending: badge === 'Trending',
    isNew: badge === 'New',
    isSale: badge === 'Sale' || calculatedDiscount > 0,
    isBestseller: badge === 'Bestseller',
    purchaseUrl: purchaseUrl.trim(),
    isPublished,
    tags: tags.length > 0 ? tags : ['luxury']
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAdminTab('products')}
            className="p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-serif text-2xl text-white font-light">
              {isEditing ? `Edit: ${existingProduct?.name || 'Product'}` : 'Craft New Product'}
            </h2>
            <p className="text-xs text-white/50 font-sans font-light">
              {isEditing ? 'Modify piece details and external purchase URL' : 'Add a new garment to the customer storefront catalog'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAdminTab('products')}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-accent uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-[#c5a059] text-black font-accent text-xs font-bold uppercase tracking-wider hover:bg-white transition-all flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Save Changes' : 'Publish Product'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Form (7 cols) + Real-Time Live Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Product Form (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Basic Information */}
          <div className="bg-[#111116] border border-white/10 p-6 space-y-4">
            <h3 className="font-serif text-lg text-white font-light flex items-center gap-2 pb-2 border-b border-white/10">
              <Tag className="w-4 h-4 text-[#c5a059]" />
              <span>Garment Identification</span>
            </h3>

            <div>
              <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1.5">
                Product Title / Name <span className="text-[#c5a059]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sovereign Cashmere Trench Coat"
                className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-white/15 text-sm text-white focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1.5">
                Subtitle / Atelier Tagline
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g., Double-breasted Italian wool & cashmere outerwear"
                className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-white/15 text-xs text-white focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0a0a0c] border border-white/15 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1.5">
                  Gender Target
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as GenderCategory)}
                  className="w-full px-3 py-2.5 bg-[#0a0a0c] border border-white/15 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="unisex">Unisex</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1.5">
                  Collection
                </label>
                <input
                  type="text"
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  placeholder="Autumn/Winter 2026"
                  className="w-full px-3 py-2.5 bg-[#0a0a0c] border border-white/15 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: External Purchase Destination URL (CRITICAL) */}
          <div className="bg-[#111116] border border-[#c5a059]/40 p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-[#c5a059]" />
                <h3 className="font-serif text-lg text-white font-light">External Purchase Routing</h3>
              </div>
              <span className="text-[10px] font-accent uppercase tracking-wider px-2 py-0.5 bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/30">
                Direct Redirect
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1.5">
                External Product Purchase URL <span className="text-[#c5a059]">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={purchaseUrl}
                  onChange={(e) => setPurchaseUrl(e.target.value)}
                  placeholder="https://www.amazon.in/dp/... or https://www.flipkart.com/... or https://www.meesho.com/..."
                  className="flex-1 px-3.5 py-2.5 bg-[#0a0a0c] border border-white/15 text-xs text-white focus:outline-none focus:border-[#c5a059] font-mono"
                />
                {purchaseUrl && (
                  <a
                    href={purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-white/10 hover:bg-white text-white hover:text-black text-xs font-accent uppercase tracking-wider flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <span>Test Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p className="text-[11px] text-white/40 mt-1.5 font-sans leading-relaxed">
                Paste the full product listing URL from Amazon, Flipkart, Meesho, Myntra, or your private store. When patrons click <strong>"PURCHASE NOW"</strong>, they will be taken directly to this destination.
              </p>
            </div>

            {/* Quick Demo Templates */}
            <div className="pt-2">
              <span className="text-[10px] text-white/40 font-accent uppercase block mb-1.5">Quick fill sample marketplace link:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPurchaseUrl(`https://www.amazon.in/dp/B0${Math.floor(10000000 + Math.random() * 90000000)}?ref=luxora_atelier`)}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[10px] font-mono text-white/70 hover:text-[#ff9900] border border-white/10 transition-colors"
                >
                  Amazon Store Sample
                </button>
                <button
                  type="button"
                  onClick={() => setPurchaseUrl(`https://www.flipkart.com/item/luxora-${name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'garment'}`)}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[10px] font-mono text-white/70 hover:text-[#2874f0] border border-white/10 transition-colors"
                >
                  Flipkart Store Sample
                </button>
                <button
                  type="button"
                  onClick={() => setPurchaseUrl(`https://www.meesho.com/luxora-${name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'piece'}`)}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[10px] font-mono text-white/70 hover:text-[#f43397] border border-white/10 transition-colors"
                >
                  Meesho Store Sample
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Pricing & Inventory Curation */}
          <div className="bg-[#111116] border border-white/10 p-6 space-y-4">
            <h3 className="font-serif text-lg text-white font-light flex items-center gap-2 pb-2 border-b border-white/10">
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
              <span>Pricing, Badges &amp; Stock</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1.5">
                  Display Price (₹) <span className="text-[#c5a059]">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="2999"
                  className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-white/15 text-sm font-mono text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1.5">
                  Original MRP / Strikethrough Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="3999"
                  className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-white/15 text-sm font-mono text-white focus:outline-none focus:border-[#c5a059]"
                />
                {calculatedDiscount > 0 && (
                  <span className="inline-block mt-1 text-[11px] text-emerald-400 font-accent">
                    Auto-calculated savings: -{calculatedDiscount}% OFF
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1.5">
                  Curated Badge Tag
                </label>
                <select
                  value={badge}
                  onChange={(e) => setBadge(e.target.value as ProductBadge)}
                  className="w-full px-3 py-2.5 bg-[#0a0a0c] border border-white/15 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="None">None</option>
                  <option value="Trending">Trending</option>
                  <option value="New">New Arrival</option>
                  <option value="Sale">Private Sale</option>
                  <option value="Bestseller">Bestseller</option>
                  <option value="Limited">Limited Edition</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1.5">
                  Stock Availability Status
                </label>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                  className="w-full px-3 py-2.5 bg-[#0a0a0c] border border-white/15 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Published Toggle */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-white block">Storefront Visibility</span>
                <span className="text-[11px] text-white/40">If disabled, this creation will be saved as a draft and hidden from customers.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`px-4 py-1.5 text-xs font-accent uppercase tracking-wider transition-colors cursor-pointer ${
                  isPublished 
                    ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-white/5 text-white/40 border border-white/10'
                }`}
              >
                {isPublished ? 'Published' : 'Draft'}
              </button>
            </div>
          </div>

          {/* Section 4: Imagery & Visual Assets */}
          <div className="bg-[#111116] border border-white/10 p-6 space-y-4">
            <h3 className="font-serif text-lg text-white font-light flex items-center gap-2 pb-2 border-b border-white/10">
              <ImageIcon className="w-4 h-4 text-[#c5a059]" />
              <span>High-Resolution Imagery ({images.length})</span>
            </h3>

            {/* Current Images List */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative group bg-[#0a0a0c] border border-white/10 overflow-hidden aspect-[3/4]">
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-[#c5a059] text-black text-[8px] font-accent uppercase font-bold px-1.5 py-0.5 shadow">
                      Primary
                    </span>
                  )}

                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => setAsPrimaryImage(idx)}
                        className="px-2 py-1 bg-white/20 hover:bg-white text-white hover:text-black text-[9px] font-accent uppercase tracking-wider"
                      >
                        Make Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Image Input */}
            <div className="pt-2">
              <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1.5">
                Add Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-3 py-2 bg-[#0a0a0c] border border-white/15 text-xs text-white focus:outline-none focus:border-[#c5a059] font-mono"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2 bg-white/10 hover:bg-[#c5a059] text-white hover:text-black text-xs font-accent uppercase tracking-wider transition-colors shrink-0"
                >
                  Add Image
                </button>
              </div>
            </div>

            {/* Presets */}
            <div className="pt-2">
              <span className="text-[10px] text-white/40 font-accent uppercase block mb-1.5">Quick luxury fashion image presets:</span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PRESET_IMAGES.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (!images.includes(preset.url)) {
                        setImages(prev => [...prev, preset.url]);
                      }
                    }}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[10px] text-white/70 hover:text-[#c5a059] border border-white/10 transition-colors"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Sizes & Colors */}
          <div className="bg-[#111116] border border-white/10 p-6 space-y-6">
            
            {/* Sizes */}
            <div>
              <h3 className="font-serif text-base text-white font-light flex items-center gap-2 pb-2 border-b border-white/10 mb-3">
                <Ruler className="w-4 h-4 text-[#c5a059]" />
                <span>Available Sizing ({sizes.join(', ')})</span>
              </h3>

              <div className="flex flex-wrap gap-2 mb-3">
                {STANDARD_SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className={`px-3 py-1.5 text-xs font-accent uppercase tracking-wider transition-all ${
                      sizes.includes(sz)
                        ? 'bg-[#c5a059] text-black font-bold'
                        : 'bg-[#0a0a0c] text-white/60 border border-white/15 hover:border-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
                {WAIST_SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className={`px-3 py-1.5 text-xs font-accent uppercase tracking-wider transition-all ${
                      sizes.includes(sz)
                        ? 'bg-[#c5a059] text-black font-bold'
                        : 'bg-[#0a0a0c] text-white/60 border border-white/15 hover:border-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 max-w-xs">
                <input
                  type="text"
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  placeholder="Custom (e.g. 90cm)"
                  className="flex-1 px-3 py-1.5 bg-[#0a0a0c] border border-white/15 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomSize}
                  className="px-3 py-1.5 bg-white/10 text-xs font-accent uppercase text-white hover:bg-white hover:text-black transition-colors"
                >
                  Add Size
                </button>
              </div>
            </div>

            {/* Colors */}
            <div className="pt-4 border-t border-white/5">
              <h3 className="font-serif text-base text-white font-light flex items-center gap-2 pb-2 border-b border-white/10 mb-3">
                <Palette className="w-4 h-4 text-[#c5a059]" />
                <span>Color Swatches ({colors.length})</span>
              </h3>

              <div className="flex flex-wrap gap-2.5 mb-3">
                {colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0c] border border-white/10 text-xs text-white">
                    <span className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: c.hex }} />
                    <span>{c.name}</span>
                    <button
                      type="button"
                      onClick={() => removeColor(i)}
                      className="text-white/40 hover:text-red-400 ml-1"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-9 h-8 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                />
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Color Name (e.g. Vintage Charcoal)"
                  className="flex-1 px-3 py-1.5 bg-[#0a0a0c] border border-white/15 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="px-3 py-1.5 bg-white/10 text-xs font-accent uppercase text-white hover:bg-white hover:text-black transition-colors shrink-0"
                >
                  Add Color
                </button>
              </div>
            </div>

          </div>

          {/* Section 6: Editorial Narrative & Material Composition */}
          <div className="bg-[#111116] border border-white/10 p-6 space-y-4">
            <h3 className="font-serif text-lg text-white font-light flex items-center gap-2 pb-2 border-b border-white/10">
              <Layers className="w-4 h-4 text-[#c5a059]" />
              <span>Editorial Details &amp; Materials</span>
            </h3>

            <div>
              <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1.5">
                Garment Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Editorial narrative describing cut, tailoring, and character..."
                className="w-full px-3.5 py-2 bg-[#0a0a0c] border border-white/15 text-xs text-white focus:outline-none focus:border-[#c5a059] leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1.5">
                  Material Composition
                </label>
                <input
                  type="text"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="e.g., 70% Italian Virgin Wool, 30% Cashmere"
                  className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/15 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1.5">
                  Fit &amp; Silhouette
                </label>
                <input
                  type="text"
                  value={fitDetails}
                  onChange={(e) => setFitDetails(e.target.value)}
                  placeholder="e.g., Relaxed architectural drop-shoulder cut"
                  className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/15 text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bottom Submit Bar */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setAdminTab('products')}
              className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-accent uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-[#c5a059] text-black font-accent text-xs font-bold uppercase tracking-widest hover:bg-white transition-all shadow-xl flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Update & Sync Creation' : 'Publish to Storefront'}</span>
            </button>
          </div>

        </form>

        {/* Right: Live Customer Card Preview (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#c5a059]" />
                <span className="font-accent text-xs uppercase tracking-wider text-white">Live Storefront Card Preview</span>
              </div>
              <span className="text-[10px] font-mono text-white/40">Real-time sync</span>
            </div>

            <p className="text-[11px] text-white/40 font-sans font-light">
              This interactive card reflects exactly how customers experience your creation on the runway catalog.
            </p>

            <div className="p-4 bg-[#070709] border border-[#c5a059]/30 shadow-2xl">
              <ProductCard product={previewProduct} />
            </div>

            <div className="p-4 bg-[#111116] border border-white/10 text-xs space-y-2 font-sans">
              <div className="font-medium text-white flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>External Purchase Redirection Active</span>
              </div>
              <p className="text-white/50 text-[11px] leading-relaxed">
                When clicked, the <strong className="text-white">"PURCHASE NOW"</strong> button will direct patrons to:
                <br />
                <span className="font-mono text-[10px] text-emerald-400 break-all">
                  {purchaseUrl || '(No URL provided - will show "Link coming soon")'}
                </span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
