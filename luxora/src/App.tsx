import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { CustomCursor } from './components/CustomCursor';
import { ToastNotification } from './components/ToastNotification';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoryShowcase } from './components/CategoryShowcase';
import { NewArrivals } from './components/NewArrivals';
import { EditorialBanner } from './components/EditorialBanner';
import { TrendingSlider } from './components/TrendingSlider';
import { FeaturedCollection } from './components/FeaturedCollection';
import { BrandValues } from './components/BrandValues';
import { ShopPage } from './components/ShopPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { WishlistPage } from './components/WishlistPage';
import { AccountPage } from './components/AccountPage';
import { StaticPages } from './components/StaticPages';
import { Footer } from './components/Footer';
import { QuickViewModal } from './components/QuickViewModal';
import { SearchOverlay } from './components/SearchOverlay';
import { SizeGuideModal } from './components/SizeGuideModal';
import { AccountModal } from './components/AccountModal';
import { AdminPanel } from './components/Admin/AdminPanel';

const MainAppContent: React.FC = () => {
  const { currentView, selectedProduct } = useStore();

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex flex-col selection:bg-[#c5a059] selection:text-[#0c0c0e] font-sans antialiased">
        <CustomCursor />
        <ToastNotification />
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col selection:bg-[#c5a059] selection:text-[#0c0c0e] font-sans antialiased">
      {/* Magnetic Desktop Luxury Cursor */}
      <CustomCursor />

      {/* Global Toast Feedback System */}
      <ToastNotification />

      {/* Global Modals & Overlays */}
      <QuickViewModal />
      <SearchOverlay />
      <SizeGuideModal />
      <AccountModal />

      {/* Primary Sticky Header & Mega Menu */}
      <Navbar />

      {/* Dynamic View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <HeroSection />
            <CategoryShowcase />
            <NewArrivals />
            <EditorialBanner />
            <TrendingSlider />
            <FeaturedCollection />
            <BrandValues />
          </>
        )}

        {currentView === 'shop' && <ShopPage />}

        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetailPage product={selectedProduct} />
        )}

        {currentView === 'wishlist' && <WishlistPage />}

        {currentView === 'account' && <AccountPage />}

        {(currentView === 'about' ||
          currentView === 'lookbook' ||
          currentView === 'sustainability' ||
          currentView === 'faq' ||
          currentView === 'contact') && <StaticPages type={currentView} />}
      </main>

      {/* Multi-Column Editorial Footer */}
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}

export default App;
