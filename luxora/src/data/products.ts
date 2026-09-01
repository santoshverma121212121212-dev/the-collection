import { Product } from '../types';

export const INITIAL_CATEGORIES: string[] = [
  'Jackets',
  'Oversized T-Shirts',
  'Hoodies',
  'Cargo Pants',
  'Jeans',
  'Shirts',
  'Sweatshirts',
  'Accessories'
];

export const LUXORA_PRODUCTS: Product[] = [
  {
    id: 'LX001',
    name: 'Sovereign Cashmere Trench Coat',
    subtitle: 'Double-breasted Italian wool & Mongolian cashmere outerwear',
    category: 'Jackets',
    gender: 'men',
    collection: 'Autumn/Winter 2026',
    price: 18999,
    originalPrice: 24999,
    discount: 24,
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85',
    ],
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Onyx Noir', hex: '#111112' },
      { name: 'Camel Vicuña', hex: '#b38b59' },
      { name: 'Slate Charcoal', hex: '#2c2d30' },
    ],
    rating: 4.9,
    reviewsCount: 48,
    reviews: [
      {
        id: 'rev-1',
        author: 'Vikramaditya S.',
        rating: 5,
        date: '2026-02-14',
        title: 'Architectural masterpiece',
        comment: 'The drape and hand-feel of the cashmere blend is unmatched. Feels every bit like Savile Row tailoring.',
        verifiedPurchase: true,
        userLocation: 'Mumbai'
      },
      {
        id: 'rev-2',
        author: 'Arjun M.',
        rating: 5,
        date: '2026-01-28',
        title: 'Worth every rupee',
        comment: 'Substantial weight, impeccable lining, and horn buttons that speak of true luxury.',
        verifiedPurchase: true,
        userLocation: 'New Delhi'
      }
    ],
    description: 'An enduring icon of contemporary sartorial elegance. Sculpted from a dense 680 GSM Italian virgin wool and Mongolian cashmere melange, the Sovereign Trench boasts a pronounced peak lapel, drop-shoulder volume, and custom horn-button closures.',
    materials: '70% Italian Virgin Wool, 30% Grade-A Mongolian Cashmere. Cupro jacquard monogram lining.',
    fitDetails: 'Relaxed tailored silhouette with architectural shoulder pads. Model is 6\'2" wearing size L.',
    shippingInfo: 'Available for immediate dispatch on external marketplace store.',
    stockStatus: 'In Stock',
    badge: 'Trending',
    isTrending: true,
    isNew: true,
    isBestseller: true,
    isPublished: true,
    purchaseUrl: 'https://www.amazon.in/dp/B08N5WRWNW?ref=luxora_sovereign_trench',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-02-25T14:30:00Z',
    tags: ['outerwear', 'cashmere', 'runway', 'winter', 'luxury']
  },
  {
    id: 'LX002',
    name: 'Architectural Boxy Heavyweight Tee',
    subtitle: '300 GSM combed Supima cotton with bonded micro-rib collar',
    category: 'Oversized T-Shirts',
    gender: 'unisex',
    collection: 'Essentials',
    price: 3499,
    originalPrice: 4299,
    discount: 18,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85'
    ],
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Raw Chalk Off-White', hex: '#ece9e2' },
      { name: 'Pitch Black', hex: '#0a0a0b' },
      { name: 'Washed Ash', hex: '#424245' },
    ],
    rating: 4.8,
    reviewsCount: 112,
    reviews: [
      {
        id: 'rev-3',
        author: 'Rohan K.',
        rating: 5,
        date: '2026-02-18',
        title: 'The holy grail basic',
        comment: 'Holds its boxy shape after multiple washes. The fabric weight is substantial without feeling stiff.',
        verifiedPurchase: true,
        userLocation: 'Bengaluru'
      }
    ],
    description: 'Constructed from extra-long staple Supima cotton, this structured t-shirt represents the pinnacle of modern minimalism. Features dropped shoulders, a high 32mm ribbed crewneck, and double-needle blind hem finishing.',
    materials: '100% California Supima Cotton (300 GSM Heavyweight Jersey). Pre-shrunk with enzyme wash.',
    fitDetails: 'Boxy, relaxed drop-shoulder cut. We recommend your standard size for an editorial oversized look.',
    shippingInfo: 'Express delivery available on Flipkart / Amazon partner stores.',
    stockStatus: 'In Stock',
    badge: 'Trending',
    isTrending: true,
    isNew: false,
    isBestseller: true,
    isPublished: true,
    purchaseUrl: 'https://www.flipkart.com/item/luxora-architectural-tee',
    createdAt: '2026-01-12T11:00:00Z',
    updatedAt: '2026-02-20T16:15:00Z',
    tags: ['essential', 'tee', 'supima', 'streetwear', 'oversized']
  },
  {
    id: 'LX003',
    name: 'Obsidian Raw Japanese Selvedge Denim',
    subtitle: '16oz Kurabo Mills shuttle-loom selvedge with custom brass shanks',
    category: 'Jeans',
    gender: 'men',
    collection: 'Artisan Denim',
    price: 12499,
    originalPrice: 15999,
    discount: 22,
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?auto=format&fit=crop&w=1200&q=85'
    ],
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=85',
    sizes: ['28', '30', '32', '34', '36'],
    colors: [
      { name: 'Raw Obsidian Indigo', hex: '#16233b' },
      { name: 'Washed Charcoal', hex: '#313238' }
    ],
    rating: 4.9,
    reviewsCount: 39,
    reviews: [
      {
        id: 'rev-4',
        author: 'Karan D.',
        rating: 5,
        date: '2026-02-02',
        title: 'Heirloom denim quality',
        comment: 'The pink selvedge ID line and the deep indigo dye crocking is phenomenal. Real denim connoisseurs will love this.',
        verifiedPurchase: true,
        userLocation: 'Pune'
      }
    ],
    description: 'Woven on vintage 1950s Toyoda shuttle looms in Kojima, Okayama. Features a red-line selvedge ticker, hidden back pocket rivets, hand-debossed vegetable-tanned leather patch, and chain-stitched union special hems.',
    materials: '100% Japanese Ring-Spun Cotton (16oz Unsanforized Raw Selvedge).',
    fitDetails: 'Relaxed straight leg with slight taper below the knee. Mid-high rise.',
    shippingInfo: 'Partner fulfillment with authenticated certificate.',
    stockStatus: 'In Stock',
    badge: 'Sale',
    isTrending: false,
    isNew: false,
    isSale: true,
    isPublished: true,
    purchaseUrl: 'https://www.meesho.com/luxora-selvedge-denim-16oz',
    createdAt: '2026-01-15T09:30:00Z',
    updatedAt: '2026-02-24T18:00:00Z',
    tags: ['denim', 'selvedge', 'japan', 'kurabo', 'raw']
  },
  {
    id: 'LX004',
    name: 'Monolith Dropped-Shoulder Hoodie',
    subtitle: '500 GSM loopback French terry with French double-layer hood',
    category: 'Hoodies',
    gender: 'unisex',
    collection: 'Streetwear Atelier',
    price: 6999,
    originalPrice: 8499,
    discount: 17,
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=85'
    ],
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Aged Slate', hex: '#26272b' },
      { name: 'Oatmeal Heather', hex: '#d6d2c4' },
      { name: 'Forest Espresso', hex: '#242a22' }
    ],
    rating: 4.8,
    reviewsCount: 84,
    reviews: [
      {
        id: 'rev-5',
        author: 'Siddharth N.',
        rating: 5,
        date: '2026-02-22',
        title: 'Incredible hood geometry',
        comment: 'The hood stands upright without a drawstring! Thick, cozy, and ultra heavy loopback interior.',
        verifiedPurchase: true,
        userLocation: 'Gurugram'
      }
    ],
    description: 'Cut from heavyweight 500 GSM loopback organic cotton terry. Designed without drawstrings for a pure, minimalist profile. Reinforced with flatlock stitching throughout and tight-rib side gussets for enhanced mobility.',
    materials: '100% GOTS-Certified Organic Cotton (500 GSM French Terry).',
    fitDetails: 'Oversized boxy silhouette with elongated rib cuffs. Drop shoulder seam.',
    shippingInfo: 'Fast dispatch directly from warehouse.',
    stockStatus: 'In Stock',
    badge: 'New',
    isTrending: true,
    isNew: true,
    isPublished: true,
    purchaseUrl: 'https://www.amazon.in/dp/B09Z7K82MN?ref=luxora_monolith_hoodie',
    createdAt: '2026-02-01T12:00:00Z',
    updatedAt: '2026-02-26T11:45:00Z',
    tags: ['hoodie', 'fleece', 'streetwear', 'oversized', 'luxury']
  },
  {
    id: 'LX005',
    name: 'Artisan Parachute Cargo Trouser',
    subtitle: 'High-density micro-ripstop with cobrax snaps & modular cord cinch',
    category: 'Cargo Pants',
    gender: 'unisex',
    collection: 'Streetwear Atelier',
    price: 8499,
    originalPrice: 10999,
    discount: 22,
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=85'
    ],
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=85',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Tactical Olive', hex: '#474d3f' },
      { name: 'Pitch Black', hex: '#0f1012' },
      { name: 'Sand Khaki', hex: '#9e917d' }
    ],
    rating: 4.7,
    reviewsCount: 52,
    reviews: [],
    description: 'Engineered for dramatic silhouette variation. Features double-pleated knees, waterproof sealed zip cargo compartments, and bungee ankle adjusters allowing immediate conversion from wide flow to tapered cuff.',
    materials: '65% Japanese Technical Cotton, 35% Recycled Ripstop Nylon with DWR coating.',
    fitDetails: 'Voluminous balloon fit with adjustable hem drawstrings.',
    shippingInfo: 'Official marketplace certified partner link.',
    stockStatus: 'In Stock',
    badge: 'Trending',
    isTrending: true,
    isNew: false,
    isPublished: true,
    purchaseUrl: 'https://www.flipkart.com/item/luxora-parachute-cargo',
    createdAt: '2026-01-20T14:20:00Z',
    updatedAt: '2026-02-23T10:10:00Z',
    tags: ['cargo', 'pants', 'tactical', 'streetwear', 'convertible']
  },
  {
    id: 'LX006',
    name: 'Sartorial Mulberry Silk Relaxed Shirt',
    subtitle: '22 Momme Sandwashed Mulberry Silk with mother-of-pearl buttons',
    category: 'Shirts',
    gender: 'men',
    collection: 'Runway Series 2026',
    price: 11999,
    originalPrice: 14499,
    discount: 17,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=85'
    ],
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Champagne Ivory', hex: '#e8dec8' },
      { name: 'Midnight Emerald', hex: '#162e26' },
      { name: 'Onyx Black', hex: '#141416' }
    ],
    rating: 4.9,
    reviewsCount: 31,
    reviews: [],
    description: 'Imbued with a matte, sandwashed peachskin finish, this silk shirt drapes like liquid across the shoulders. Finished with French seams, a relaxed camp collar, and genuine Australian mother-of-pearl buttons.',
    materials: '100% Grade-6A Sandwashed Mulberry Silk (22 Momme Weight).',
    fitDetails: 'Fluid relaxed fit. Sits softly off the chest and shoulders.',
    shippingInfo: 'Direct external store checkout with rapid shipping.',
    stockStatus: 'In Stock',
    badge: 'New',
    isTrending: false,
    isNew: true,
    isPublished: true,
    purchaseUrl: 'https://www.amazon.in/dp/B0A1293KFL?ref=luxora_silk_shirt',
    createdAt: '2026-02-05T08:00:00Z',
    updatedAt: '2026-02-27T09:00:00Z',
    tags: ['silk', 'shirt', 'luxury', 'runway', 'ivory']
  },
  {
    id: 'LX007',
    name: 'Sculptural Heavyweight Crewneck Sweatshirt',
    subtitle: '450 GSM diagonal-weave cotton with tonal micro-embroidered emblem',
    category: 'Sweatshirts',
    gender: 'unisex',
    collection: 'Essentials',
    price: 5499,
    originalPrice: 6999,
    discount: 21,
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=85'
    ],
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Warm Taupe', hex: '#8a7d72' },
      { name: 'Carbon Black', hex: '#1c1c1e' },
      { name: 'Chalk Bone', hex: '#ded9cf' }
    ],
    rating: 4.8,
    reviewsCount: 67,
    reviews: [],
    description: 'An architectural take on the classic athletic crewneck. Features articulated sleeve darts, high-density ribbing at the neck and waist that resists stretching, and a discrete tonal crest embroidered at the left wrist.',
    materials: '100% Combed Compact Cotton (450 GSM Heavy Fleece).',
    fitDetails: 'Slightly cropped body with extended sleeves for subtle stacking at the wrist.',
    shippingInfo: 'Available on partner shop.',
    stockStatus: 'In Stock',
    badge: 'Sale',
    isTrending: false,
    isNew: false,
    isSale: true,
    isPublished: true,
    purchaseUrl: 'https://www.meesho.com/luxora-heavyweight-crewneck',
    createdAt: '2026-01-18T16:00:00Z',
    updatedAt: '2026-02-21T13:20:00Z',
    tags: ['sweatshirt', 'crewneck', 'fleece', 'minimal', 'essential']
  },
  {
    id: 'LX008',
    name: 'Sovereign Full-Grain Calfskin Atelier Belt',
    subtitle: 'French full-grain box calf leather with brushed 24k gold-plated brass buckle',
    category: 'Accessories',
    gender: 'unisex',
    collection: 'Artisan Accessories',
    price: 4999,
    originalPrice: 6499,
    discount: 23,
    images: [
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85'
    ],
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=85',
    sizes: ['80cm', '85cm', '90cm', '95cm', '100cm'],
    colors: [
      { name: 'Obsidian Black / Gold', hex: '#111112' },
      { name: 'Saddle Cognac / Silver', hex: '#7a4522' }
    ],
    rating: 5.0,
    reviewsCount: 42,
    reviews: [],
    description: 'Hand-beveled edges, wax-burnished borders, and hand-stitched saddle thread. Custom sculptural buckle cast from solid jeweler\'s brass with brushed champagne gold electroplating.',
    materials: '100% French Full-Grain Box Calf Leather. Solid Brass Hardware with 24k Gold Electroplating.',
    fitDetails: '32mm width. Universal fit for tailored trousers and denim.',
    shippingInfo: 'External shop checkout.',
    stockStatus: 'In Stock',
    badge: 'Trending',
    isTrending: true,
    isNew: false,
    isPublished: true,
    purchaseUrl: 'https://www.flipkart.com/item/luxora-calfskin-belt-gold',
    createdAt: '2026-01-25T11:10:00Z',
    updatedAt: '2026-02-22T15:40:00Z',
    tags: ['belt', 'leather', 'accessories', 'gold', 'handcrafted']
  }
];

export interface CategoryShowcaseItem {
  id: string;
  title: string;
  categoryFilter: string;
  image: string;
  itemCount: string;
  tagline: string;
  linkText: string;
}

export const CATEGORIES_DATA: CategoryShowcaseItem[] = [
  {
    id: 'cat-outerwear',
    title: 'Outerwear & Coats',
    categoryFilter: 'Jackets',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=85',
    itemCount: '12 Creations',
    tagline: 'Architectural trench coats, virgin wool blazers, and double-faced cashmere.',
    linkText: 'Explore Outerwear'
  },
  {
    id: 'cat-streetwear',
    title: 'Streetwear Atelier',
    categoryFilter: 'unisex',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=85',
    itemCount: '18 Creations',
    tagline: 'Drop-shoulder heavyweight tees, 500 GSM loopback hoodies, and parachute cargos.',
    linkText: 'Discover Streetwear'
  },
  {
    id: 'cat-denim',
    title: 'Artisan Denim',
    categoryFilter: 'Jeans',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=85',
    itemCount: '9 Creations',
    tagline: 'Shuttle-loom Kurabo Japanese selvedge denim in raw obsidian indigo.',
    linkText: 'Shop Selvedge'
  },
  {
    id: 'cat-shirts',
    title: 'Silk & Tailoring',
    categoryFilter: 'Shirts',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=85',
    itemCount: '14 Creations',
    tagline: 'Sandwashed Mulberry silk shirts, pleated dress trousers, and mother-of-pearl hardware.',
    linkText: 'View Tailoring'
  }
];

export const POPULAR_SEARCH_TERMS: string[] = [
  'Cashmere Trench',
  'Supima Oversized Tee',
  'Japanese Selvedge Denim',
  'Heavyweight Hoodie',
  'Parachute Cargo Pants',
  'Mulberry Silk Shirt',
  'Box Calfskin Belt',
  'Autumn Winter 2026'
];

export interface LookbookItem {
  id: string;
  season: string;
  title: string;
  description: string;
  image: string;
  credits: string;
  palette: string[];
}

export const LUXORA_LOOKBOOK_ITEMS: LookbookItem[] = [
  {
    id: 'lb-1',
    season: 'AW 2026 RUNWAY EDITORIAL',
    title: 'Look 01: The Monolith Trench in Vicuña',
    description: 'Double-breasted cashmere tailored over raw obsidian selvedge denim, framed by brushed 24k gold hardware.',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
    credits: 'Photographed in Milan • Styled with Kurabo Selvedge & 24k Belt',
    palette: ['#b38b59', '#111112', '#2c2d30']
  },
  {
    id: 'lb-2',
    season: 'AW 2026 RUNWAY EDITORIAL',
    title: 'Look 02: Architectural Volume & Raw Chalk Supima',
    description: '300 GSM combed Supima cotton tee paired with convertible technical parachute cargos in tactical olive.',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=85',
    credits: 'Photographed in Tokyo Atelier • Styled with Tactical Cargo',
    palette: ['#ece9e2', '#474d3f', '#0a0a0b']
  },
  {
    id: 'lb-3',
    season: 'AW 2026 RUNWAY EDITORIAL',
    title: 'Look 03: Fluid Sandwashed Mulberry Silk',
    description: '22 Momme Sandwashed Mulberry silk relaxed camp collar shirt with Australian mother-of-pearl buttons.',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85',
    credits: 'Photographed in Paris • Styled with Double-Pleated Trousers',
    palette: ['#e8dec8', '#162e26', '#141416']
  }
];

