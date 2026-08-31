import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Product, 
  WishlistItem, 
  ToastNotification, 
  ViewMode, 
  FilterState, 
  UserAccount, 
  AdminTab, 
  AdminUser 
} from '../types';
import { LUXORA_PRODUCTS, INITIAL_CATEGORIES } from '../data/products';

interface StoreContextType {
  // Products Data Layer (Dynamic & Persisted via SQL Database)
  products: Product[];
  categories: string[];
  refreshCatalog: () => Promise<void>;
  addProduct: (productData: Partial<Product>) => Promise<boolean>;
  updateProduct: (id: string, updatedData: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  duplicateProduct: (id: string) => void;
  toggleProductPublish: (id: string) => void;
  addCategory: (categoryName: string) => Promise<boolean>;
  renameCategory: (oldName: string, newName: string) => Promise<boolean>;
  deleteCategory: (categoryName: string) => Promise<boolean>;
  resetCatalogToDefaults: () => Promise<void>;

  // External Purchase Redirection (Valid URL only)
  handlePurchase: (product: Product) => void;

  // Navigation & View
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  navigateToProduct: (product: Product) => void;
  navigateToCategory: (categoryOrGender: string) => void;

  // Wishlist
  wishlist: WishlistItem[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  wishlistCount: number;

  // Search & Filters
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;

  // Quick View & Modals
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  isSizeGuideOpen: boolean;
  setIsSizeGuideOpen: (open: boolean) => void;
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;

  // Toast System
  toast: ToastNotification | null;
  showToast: (notification: Omit<ToastNotification, 'id'>) => void;
  hideToast: () => void;

  // Customer Account
  user: UserAccount;
  loginUser: (email: string, name?: string) => void;
  logoutUser: () => void;

  // Server-Side Admin Management Portal
  isAdminAuthenticated: boolean;
  adminUser: AdminUser | null;
  csrfToken: string | null;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  adminLogout: () => Promise<void>;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  editingProductId: string | null;
  setEditingProductId: (id: string | null) => void;
  startEditingProduct: (product: Product) => void;
}

const initialFilters: FilterState = {
  search: '',
  category: '',
  gender: 'all',
  collection: '',
  sizes: [],
  colors: [],
  minPrice: 0,
  maxPrice: 35000,
  sortBy: 'featured',
  inStockOnly: false,
  discountOnly: false,
};

const initialUser: UserAccount = {
  isLoggedIn: true,
  name: 'Aarav Singhania',
  email: 'aarav.singhania@luxora.in',
  phone: '+91 98765 43210',
  preferredSize: 'M',
  addresses: [
    {
      id: 'addr-1',
      fullName: 'Aarav Singhania',
      email: 'aarav.singhania@luxora.in',
      phone: '+91 98765 43210',
      addressLine1: 'Penthouse 42B, The Imperial Towers',
      addressLine2: 'Altamount Road, Cumballa Hill',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400026',
      isDefault: true,
    }
  ]
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. PRODUCTS & CATEGORIES (FETCHED FROM SQL BACKEND)
  const [products, setProducts] = useState<Product[]>(LUXORA_PRODUCTS);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);

  // 2. NAVIGATION & ROUTING
  const [currentView, setCurrentViewState] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/spadmin' || path.startsWith('/spadmin/')) {
        return 'admin';
      }
    }
    return 'home';
  });

  const setCurrentView = (view: ViewMode) => {
    setCurrentViewState(view);
    if (view === 'admin') {
      window.history.pushState(null, '', '/spadmin');
    } else if (window.location.pathname.startsWith('/spadmin')) {
      window.history.pushState(null, '', '/');
    }
  };

  // Sync with browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/spadmin' || path.startsWith('/spadmin/')) {
        setCurrentViewState('admin');
      } else {
        setCurrentViewState('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 3. WISHLIST (CLIENT-SIDE GUEST EXPERIENCE)
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('luxora_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('luxora_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error saving wishlist:', e);
    }
  }, [wishlist]);

  // 4. SEARCH & FILTERS
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('luxora_search_history');
      return saved ? JSON.parse(saved) : ['Cashmere Trench', 'Oversized Supima Tee', 'Selvedge Denim', 'Mulberry Silk'];
    } catch {
      return ['Cashmere Trench', 'Oversized Supima Tee', 'Selvedge Denim', 'Mulberry Silk'];
    }
  });
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // 5. MODALS
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);

  // 6. TOAST NOTIFICATIONS
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // 7. PATRON USER ACCOUNT
  const [user, setUser] = useState<UserAccount>(() => {
    try {
      const saved = localStorage.getItem('luxora_user');
      return saved ? JSON.parse(saved) : initialUser;
    } catch {
      return initialUser;
    }
  });

  // 8. SERVER-SIDE ADMIN STATE (NO INSECURE LOCALSTORAGE CREDENTIALS)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Toast Helpers
  const showToast = useCallback((notification: Omit<ToastNotification, 'id'>) => {
    const id = `toast-${Date.now()}`;
    setToast({ ...notification, id });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 9. FETCH SQL PRODUCTS & CATEGORIES FROM API
  const refreshCatalog = useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData) && prodData.length > 0) {
          setProducts(prodData);
        }
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        if (Array.isArray(catData) && catData.length > 0) {
          setCategories(catData.map((c: any) => c.name));
        }
      }
    } catch (err) {
      console.warn('[LUXORA STOREFRONT] API sync offline, using local memory cache.');
    }
  }, []);

  // Check initial server session & fetch catalog on boot
  useEffect(() => {
    refreshCatalog();

    // Check if admin session cookie is active on the server
    const checkServerAdminAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth/me', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setIsAdminAuthenticated(true);
            setAdminUser(data.user);
            setCsrfToken(data.csrfToken || null);
          }
        } else {
          setIsAdminAuthenticated(false);
          setAdminUser(null);
          setCsrfToken(null);
        }
      } catch {
        // Session check silently skipped
      }
    };

    checkServerAdminAuth();
  }, [refreshCatalog]);

  // Wishlist Helpers
  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlist.some(item => item.productId === productId);
  }, [wishlist]);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.productId === product.id);
      if (exists) {
        showToast({
          title: 'Removed from Wishlist',
          message: `${product.name} removed from your private curation.`,
          type: 'info'
        });
        return prev.filter(item => item.productId !== product.id);
      } else {
        showToast({
          title: 'Saved to Wishlist',
          message: `${product.name} added to your private curation.`,
          type: 'wishlist',
          image: product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
          productName: product.name,
          price: product.price
        });
        return [{ productId: product.id, product, addedAt: new Date().toISOString() }, ...prev];
      }
    });
  }, [showToast]);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist(prev => prev.filter(item => item.productId !== productId));
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    showToast({
      title: 'Wishlist Cleared',
      message: 'All items removed from your private collection.',
      type: 'info'
    });
  }, [showToast]);

  // External Purchase Redirection (Validates URL Before Opening)
  const handlePurchase = useCallback((product: Product) => {
    const rawUrl = product.purchaseUrl;
    if (!rawUrl || typeof rawUrl !== 'string') {
      showToast({
        title: 'Partner Link Unavailable',
        message: 'Direct acquisition link is currently being updated by the atelier.',
        type: 'warning'
      });
      return;
    }

    const trimmed = rawUrl.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      showToast({
        title: 'Security Notice',
        message: 'Invalid partner destination URL rejected by security protocols.',
        type: 'error'
      });
      return;
    }

    // Direct opening of verified link in separate secure tab
    window.open(trimmed, '_blank', 'noopener,noreferrer');

    showToast({
      title: 'Redirecting to Official Partner',
      message: `Navigating to checkout for ${product.name}.`,
      type: 'promo',
      image: product.images?.[0] || product.image,
      productName: product.name,
      price: product.price
    });
  }, [showToast]);

  // Navigation Helpers
  const navigateToProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToCategory = useCallback((catOrGender: string) => {
    const clean = catOrGender.toLowerCase();
    if (clean === 'men' || clean === 'women' || clean === 'unisex') {
      setFilters(prev => ({ ...prev, gender: clean as any, category: '' }));
    } else {
      setFilters(prev => ({ ...prev, category: catOrGender, gender: 'all' }));
    }
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const addSearchHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== query.toLowerCase());
      const updated = [query.trim(), ...filtered].slice(0, 8);
      localStorage.setItem('luxora_search_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('luxora_search_history');
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const loginUser = useCallback((email: string, name?: string) => {
    const newUser: UserAccount = {
      isLoggedIn: true,
      name: name || email.split('@')[0] || 'Patron Client',
      email: email,
      phone: '+91 98765 43210',
      preferredSize: 'M',
      addresses: user?.addresses || initialUser.addresses
    };
    setUser(newUser);
    localStorage.setItem('luxora_user', JSON.stringify(newUser));
    showToast({
      title: 'Welcome to LUXORA',
      message: `Signed in as ${newUser.name}.`,
      type: 'success'
    });
  }, [user, showToast]);

  const logoutUser = useCallback(() => {
    const guestUser: UserAccount = {
      isLoggedIn: false,
      name: 'Guest Patron',
      email: '',
      phone: '',
      addresses: []
    };
    setUser(guestUser);
    localStorage.setItem('luxora_user', JSON.stringify(guestUser));
    showToast({
      title: 'Signed Out',
      message: 'You have been signed out of your patron portfolio.',
      type: 'info'
    });
  }, [showToast]);

  // ----------------------------------------------------
  // SERVER-SIDE ADMIN AUTHENTICATION & OPERATIONS
  // ----------------------------------------------------

  const adminLogin = useCallback(async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password: pass })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        setAdminUser(data.user);
        setCsrfToken(data.csrfToken);
        showToast({
          title: 'Admin Access Granted',
          message: 'Server-side session authenticated via SQL database.',
          type: 'success'
        });
        await refreshCatalog();
        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || 'Invalid credentials. Access denied.'
        };
      }
    } catch (err) {
      return {
        success: false,
        message: 'Could not connect to authentication server. Please check backend status.'
      };
    }
  }, [showToast, refreshCatalog]);

  const adminLogout = useCallback(async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {})
        },
        credentials: 'include'
      });
    } catch {
      // Ignored
    } finally {
      setIsAdminAuthenticated(false);
      setAdminUser(null);
      setCsrfToken(null);
      showToast({
        title: 'Logged Out',
        message: 'Admin session terminated safely on server.',
        type: 'info'
      });
    }
  }, [csrfToken, showToast]);

  const addProduct = useCallback(async (productData: Partial<Product>): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {})
        },
        credentials: 'include',
        body: JSON.stringify(productData)
      });

      const data = await res.json();
      if (res.ok) {
        showToast({
          title: 'Product Published',
          message: data.message || 'New creation saved to SQL database and live.',
          type: 'success'
        });
        await refreshCatalog();
        return true;
      } else {
        showToast({
          title: 'Validation Error',
          message: data.message || 'Failed to create product.',
          type: 'error'
        });
        return false;
      }
    } catch (err) {
      showToast({
        title: 'Server Error',
        message: 'Could not reach server to create product.',
        type: 'error'
      });
      return false;
    }
  }, [csrfToken, showToast, refreshCatalog]);

  const updateProduct = useCallback(async (id: string, updatedData: Partial<Product>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {})
        },
        credentials: 'include',
        body: JSON.stringify(updatedData)
      });

      const data = await res.json();
      if (res.ok) {
        showToast({
          title: 'Product Updated',
          message: data.message || 'Modifications saved to SQL database.',
          type: 'success'
        });
        await refreshCatalog();
        return true;
      } else {
        showToast({
          title: 'Update Error',
          message: data.message || 'Failed to update product.',
          type: 'error'
        });
        return false;
      }
    } catch (err) {
      showToast({
        title: 'Server Error',
        message: 'Could not reach server to update product.',
        type: 'error'
      });
      return false;
    }
  }, [csrfToken, showToast, refreshCatalog]);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {})
        },
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok) {
        showToast({
          title: 'Product Deleted',
          message: data.message || 'Item removed from SQL database.',
          type: 'info'
        });
        await refreshCatalog();
        return true;
      } else {
        showToast({
          title: 'Deletion Failed',
          message: data.message || 'Could not delete product.',
          type: 'error'
        });
        return false;
      }
    } catch (err) {
      showToast({
        title: 'Server Error',
        message: 'Could not communicate with server.',
        type: 'error'
      });
      return false;
    }
  }, [csrfToken, showToast, refreshCatalog]);

  const duplicateProduct = useCallback(async (id: string) => {
    const item = products.find(p => p.id === id);
    if (!item) return;

    await addProduct({
      ...item,
      name: `${item.name} (Copy)`
    });
  }, [products, addProduct]);

  const toggleProductPublish = useCallback(async (id: string) => {
    const item = products.find(p => p.id === id);
    if (!item) return;

    await updateProduct(id, {
      isPublished: !item.isPublished
    });
  }, [products, updateProduct]);

  const addCategory = useCallback(async (categoryName: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ name: categoryName })
      });

      const data = await res.json();
      if (res.ok) {
        showToast({
          title: 'Category Added',
          message: data.message || 'Category saved to SQL database.',
          type: 'success'
        });
        await refreshCatalog();
        return true;
      } else {
        showToast({
          title: 'Category Error',
          message: data.message || 'Could not create category.',
          type: 'warning'
        });
        return false;
      }
    } catch {
      return false;
    }
  }, [csrfToken, showToast, refreshCatalog]);

  const renameCategory = useCallback(async (oldName: string, newName: string): Promise<boolean> => {
    try {
      // Find category ID from server categories
      const catRes = await fetch('/api/admin/categories', { credentials: 'include' });
      if (!catRes.ok) return false;
      const catList = await catRes.json();
      const target = catList.find((c: any) => c.name.toLowerCase() === oldName.toLowerCase());
      if (!target) return false;

      const res = await fetch(`/api/admin/categories/${target.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ name: newName })
      });

      if (res.ok) {
        showToast({
          title: 'Category Renamed',
          message: `Category updated to "${newName}".`,
          type: 'success'
        });
        await refreshCatalog();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [csrfToken, showToast, refreshCatalog]);

  const deleteCategory = useCallback(async (categoryName: string): Promise<boolean> => {
    try {
      const catRes = await fetch('/api/admin/categories', { credentials: 'include' });
      if (!catRes.ok) return false;
      const catList = await catRes.json();
      const target = catList.find((c: any) => c.name.toLowerCase() === categoryName.toLowerCase());
      if (!target) return false;

      const res = await fetch(`/api/admin/categories/${target.id}`, {
        method: 'DELETE',
        headers: {
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {})
        },
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok) {
        showToast({
          title: 'Category Removed',
          message: data.message || 'Category deleted from SQL.',
          type: 'info'
        });
        await refreshCatalog();
        return true;
      } else {
        showToast({
          title: 'Action Blocked',
          message: data.message || 'Could not delete category.',
          type: 'error'
        });
        return false;
      }
    } catch {
      return false;
    }
  }, [csrfToken, showToast, refreshCatalog]);

  const resetCatalogToDefaults = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/system/reset', {
        method: 'POST',
        headers: {
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {})
        },
        credentials: 'include'
      });

      if (res.ok) {
        showToast({
          title: 'Catalog Restored',
          message: 'Factory showcase catalog re-seeded in SQL database.',
          type: 'info'
        });
        await refreshCatalog();
      }
    } catch {
      showToast({
        title: 'Reset Failed',
        message: 'Could not perform factory reset on server.',
        type: 'error'
      });
    }
  }, [csrfToken, showToast, refreshCatalog]);

  const startEditingProduct = useCallback((product: Product) => {
    setEditingProductId(product.id);
    setAdminTab('edit-product');
  }, []);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        refreshCatalog,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        toggleProductPublish,
        addCategory,
        renameCategory,
        deleteCategory,
        resetCatalogToDefaults,

        handlePurchase,

        currentView,
        setCurrentView,
        selectedProduct,
        setSelectedProduct,
        navigateToProduct,
        navigateToCategory,

        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
        wishlistCount: wishlist.length,

        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        searchHistory,
        addSearchHistory,
        clearSearchHistory,
        filters,
        setFilters,
        resetFilters,

        quickViewProduct,
        setQuickViewProduct,
        isSizeGuideOpen,
        setIsSizeGuideOpen,
        isAccountModalOpen,
        setIsAccountModalOpen,

        toast,
        showToast,
        hideToast,

        user,
        loginUser,
        logoutUser,

        isAdminAuthenticated,
        adminUser,
        csrfToken,
        adminLogin,
        adminLogout,
        adminTab,
        setAdminTab,
        editingProductId,
        setEditingProductId,
        startEditingProduct
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
