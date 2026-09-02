import { Product } from '../types';

export const INITIAL_CATEGORIES = [
  'Jackets',
  'Oversized T-Shirts',
  'Hoodies',
  'Pants',
  'Knitwear',
  'Footwear',
  'Accessories'
];

export const CATEGORIES_DATA = [
  {
    id: 'cat-jackets',
    title: 'Jackets & Coats',
    categoryFilter: 'Jackets',
    itemCount: '12 Pieces',
    tagline: 'Hand-tailored double-faced cashmere and structured virgin wool silhouettes.',
    linkText: 'Explore Outerwear',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85'
  },
  {
    id: 'cat-tees',
    title: 'Oversized Tees',
    categoryFilter: 'Oversized T-Shirts',
    itemCount: '18 Pieces',
    tagline: '320 GSM organic Peruvian Pima cotton cut in boxy architectural fits.',
    linkText: 'Explore T-Shirts',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85'
  },
  {
    id: 'cat-hoodies',
    title: 'Heavyweight Hoodies',
    categoryFilter: 'Hoodies',
    itemCount: '10 Pieces',
    tagline: '500 GSM loopback cotton fleece crafted with seamless drawstringless hoods.',
    linkText: 'Explore Hoodies',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85'
  },
  {
    id: 'cat-knitwear',
    title: 'Cashmere Knitwear',
    categoryFilter: 'Knitwear',
    itemCount: '8 Pieces',
    tagline: 'Grade-A Mongolian cashmere sweaters knit in lightweight, warm textures.',
    linkText: 'Explore Knitwear',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=85'
  }
];

export const POPULAR_SEARCH_TERMS = [
  'Cashmere Overcoat',
  'Heavyweight Tee',
  'French Terry Hoodie',
  'Wool Pants',
  'Oversized',
  'Autumn 2026',
  'Mulberry Silk'
];

export const LUXORA_LOOKBOOK_ITEMS = [
  {
    id: 'look-01',
    title: 'Monolithic Structure Overcoat',
    season: 'Autumn / Winter 2026',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85',
    description: 'Double-faced cashmere drape paired with tailored wool trousers and monolithic footwear.'
  },
  {
    id: 'look-02',
    title: 'Atmospheric Heavyweight Foundation',
    season: 'Autumn / Winter 2026',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
    description: 'Sculptural 320 GSM organic Pima cotton silhouette with seamless collar construction.'
  },
  {
    id: 'look-03',
    title: 'Architectural French Terry',
    season: 'Autumn / Winter 2026',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
    description: '500 GSM loopback cotton hoodie designed with a drawstringless hood and structured torso.'
  }
];

export const LUXORA_PRODUCTS: Product[] = [
  {
    id: 'LX001',
    name: 'Cashmere Sartorial Overcoat',
    slug: 'cashmere-sartorial-overcoat',
    subtitle: 'Hand-Tailored Virgin Wool & Double-Faced Cashmere',
    category: 'Jackets',
    gender: 'unisex',
    collection: 'Autumn/Winter 2026',
    price: 34500,
    originalPrice: 42000,
    discount: 18,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Onyx Noir', hex: '#111111' },
      { name: 'Camel Vicuña', hex: '#C19A6B' }
    ],
    tags: ['Runway', 'Handmade', 'Cashmere', 'Outerwear'],
    rating: 4.95,
    reviewsCount: 28,
    reviews: [],
    description: 'Crafted in limited atelier batches, this sculptural overcoat pairs Italian virgin wool with unlined double-faced cashmere for weightless structural warmth.',
    materials: '85% Double-Faced Cashmere, 15% Mulberry Silk Lining',
    fitDetails: 'Structured drop-shoulder silhouette; tailored for layering over knitwear.',
    shippingInfo: 'Complimentary white-glove courier delivery with insured tracking.',
    stockStatus: 'In Stock',
    badge: 'Bestseller',
    isTrending: true,
    isNew: true,
    isBestseller: true,
    isPublished: true,
    purchaseUrl: 'https://www.amazon.in'
  },
  {
    id: 'LX002',
    name: 'Architectural Boxy Heavyweight Tee',
    slug: 'architectural-boxy-heavyweight-tee',
    subtitle: '320 GSM Organic Combed Peruvian Pima Cotton',
    category: 'Oversized T-Shirts',
    gender: 'unisex',
    collection: 'Autumn/Winter 2026',
    price: 6800,
    originalPrice: 8500,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=85'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Chalk White', hex: '#F5F5F0' },
      { name: 'Charcoal Slag', hex: '#2B2B2B' }
    ],
    tags: ['Essentials', 'Heavyweight', 'Pima Cotton'],
    rating: 4.88,
    reviewsCount: 42,
    reviews: [],
    description: 'A heavyweight luxury foundation piece cut with dropped shoulders, high neckline ribbing, and a clean architectural drape.',
    materials: '100% Ultra-Dense Peruvian Pima Cotton (320 GSM)',
    fitDetails: 'Relaxed boxy silhouette with reinforced collar band.',
    shippingInfo: 'Dispatched within 24 hours in signature presentation box.',
    stockStatus: 'In Stock',
    badge: 'Bestseller',
    isTrending: true,
    isNew: false,
    isBestseller: true,
    isPublished: true,
    purchaseUrl: 'https://www.amazon.in'
  },
  {
    id: 'LX003',
    name: 'Sculpted Monolith French Terry Hoodie',
    slug: 'sculpted-monolith-french-terry-hoodie',
    subtitle: '500 GSM Double-Layer Heavy Terry',
    category: 'Hoodies',
    gender: 'unisex',
    collection: 'Autumn/Winter 2026',
    price: 14200,
    originalPrice: 16500,
    discount: 14,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=85'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Basalt Black', hex: '#1C1C1E' },
      { name: 'Heather Stone', hex: '#9E9E9E' }
    ],
    tags: ['Streetwear Couture', 'Heavyweight', 'Hoodie'],
    rating: 4.92,
    reviewsCount: 19,
    reviews: [],
    description: 'Double-layered hood without drawstrings, hidden seam pockets, and a custom garment wash producing a matte mineral finish.',
    materials: '100% Organic Loopback French Terry (500 GSM)',
    fitDetails: 'Slightly cropped torso with voluminous arms for structural drape.',
    shippingInfo: 'Complimentary insured worldwide courier express delivery.',
    stockStatus: 'In Stock',
    badge: 'New',
    isTrending: true,
    isNew: true,
    isBestseller: false,
    isPublished: true,
    purchaseUrl: 'https://www.amazon.in'
  }
];
