export type ProductCategory = 
  | 'Oversized T-Shirts'
  | 'Hoodies'
  | 'Shirts'
  | 'Cargo Pants'
  | 'Jeans'
  | 'Jackets'
  | 'Sweatshirts'
  | 'Accessories'
  | string;

export type GenderCategory = 'men' | 'women' | 'unisex';

export interface ProductColor {
  name: string;
  hex: string;
  bgClass?: string;
  inStock?: boolean;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  userLocation?: string;
}

export type ProductBadge = 'New' | 'Trending' | 'Sale' | 'Bestseller' | 'Limited' | 'None';
export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'in_stock' | 'low_stock' | 'preorder' | 'limited_edition';

export interface Product {
  id: string;
  name: string;
  slug?: string;
  subtitle?: string;
  category: string;
  gender?: GenderCategory;
  collection?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  image?: string; // Fallback primary image
  sizes: string[];
  colors: ProductColor[];
  rating: number;
  reviewsCount: number;
  reviews: ProductReview[];
  description: string;
  materials?: string;
  fitDetails?: string;
  shippingInfo?: string;
  stockStatus: StockStatus;
  badge?: ProductBadge;
  isTrending?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  isSale?: boolean;
  purchaseUrl: string; // External marketplace or shop URL (Amazon, Flipkart, Meesho, Official Store)
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
  tags: string[];
}

export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: string;
}

export interface FilterState {
  search: string;
  category: string;
  gender: 'all' | 'men' | 'women' | 'unisex';
  collection: string;
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'discount';
  inStockOnly: boolean;
  discountOnly: boolean;
}

export interface Address {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
}

export interface UserAccount {
  isLoggedIn: boolean;
  name: string;
  email: string;
  phone: string;
  addresses?: Address[];
  preferredSize?: string;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'wishlist' | 'info' | 'promo' | 'success' | 'warning' | 'error';
  image?: string;
  productName?: string;
  price?: number;
  size?: string;
}

export type ViewMode = 
  | 'home'
  | 'shop'
  | 'product-detail'
  | 'wishlist'
  | 'account'
  | 'admin'
  | 'lookbook'
  | 'about'
  | 'sustainability'
  | 'faq'
  | 'returns'
  | 'contact';

export type AdminTab = 
  | 'dashboard'
  | 'products'
  | 'add-product'
  | 'edit-product'
  | 'categories'
  | 'audit-logs'
  | 'users'
  | 'settings';

export interface AdminUser {
  id?: number;
  email: string;
  username?: string;
  name: string;
  role: 'super_admin' | 'editor' | string;
  avatar?: string;
  lastLoginAt?: string;
  isActive?: boolean;
}

export interface AuditLog {
  id: number;
  admin_id?: number;
  admin_username?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
  timestamp: string;
}

export interface AdminAccount {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'editor';
  is_active: number;
  created_at: string;
  last_login_at?: string;
}
