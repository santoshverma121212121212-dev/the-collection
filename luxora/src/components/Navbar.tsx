import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Heart, 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  Store,
  ArrowRight,
  ExternalLink,
  Settings
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const ANNOUNCEMENTS = [
  'DIRECT OFFICIAL PARTNER STORE PURCHASES • 100% AUTHENTIC CREATIONS',
  'AUTUMN / WINTER 2026 RUNWAY COLLECTION NOW AVAILABLE',
  'LUXURY EDITORIAL CATALOG • AMAZON, FLIPKART & PARTNER REDIRECTIONS',
  'BLACK LABEL ATELIER ACCESS & BESPOKE WARDROBE CURATION'
];

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    navigateToCategory,
    wishlistCount,
    setIsSearchOpen,
    setIsAccountModalOpen,
    user,
    isAdminAuthenticated,
    categories
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [collectionsDropdown, setCollectionsDropdown] = useState(false);

  // Rotate announcement bar every 4.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Sticky header on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (category: string) => {
    setMobileMenuOpen(false);
    setCollectionsDropdown(false);
    if (category === 'home') {
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigateToCategory(category);
    }
  };

  return (
    <>
      {/* 1. Announcement Bar */}
      <div 
        id="announcement-bar"
        className="w-full bg-[#111] py-2 text-[10px] tracking-[0.3em] uppercase text-center border-b border-white/5 opacity-90 text-[#c5a059] px-4 relative z-40 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden lg:flex items-center gap-2 text-white/50 text-[10px] tracking-[0.25em]">
            <Store className="w-3 h-3 text-[#c5a059]" />
            <span>Direct Partner Fulfillment</span>
          </div>

          <div className="flex-1 text-center overflow-hidden h-4.5 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={announcementIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="font-medium tracking-[0.3em] uppercase inline-block text-[10px] sm:text-[10.5px] text-[#c5a059]"
              >
                {ANNOUNCEMENTS[announcementIndex]}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-white/50 text-[10px] tracking-[0.25em]">
            <ShieldCheck className="w-3 h-3 text-[#c5a059]" />
            <span>100% Certified Authentic</span>
          </div>
        </div>
      </div>

      {/* 2. Main Luxury Header */}
      <header
        id="main-navbar-header"
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'luxury-glass py-3.5 shadow-2xl border-b border-white/10'
            : 'bg-[#0a0a0a]/95 backdrop-blur-md py-6 border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between">
          
          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center lg:hidden">
            <button
              id="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-white hover:text-[#c5a059] transition-colors focus:outline-none cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              id="mobile-search-btn"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-white/80 hover:text-[#c5a059] transition-colors ml-1 cursor-pointer"
              aria-label="Search Collection"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-[11px] uppercase tracking-widest font-medium text-white/70">
            <button
              id="nav-new-arrivals"
              onClick={() => handleNavClick('new')}
              className="hover:text-white transition-colors relative py-1 group cursor-pointer"
            >
              New Arrivals
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#c5a059] transition-all duration-300 group-hover:w-full" />
            </button>

            <button
              id="nav-men"
              onClick={() => handleNavClick('men')}
              className="hover:text-white transition-colors relative py-1 group cursor-pointer"
            >
              Men
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#c5a059] transition-all duration-300 group-hover:w-full" />
            </button>

            <button
              id="nav-women"
              onClick={() => handleNavClick('women')}
              className="hover:text-white transition-colors relative py-1 group cursor-pointer"
            >
              Women
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#c5a059] transition-all duration-300 group-hover:w-full" />
            </button>

            {/* Collections with Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setCollectionsDropdown(true)}
              onMouseLeave={() => setCollectionsDropdown(false)}
            >
              <button
                id="nav-collections"
                onClick={() => handleNavClick('all')}
                className="hover:text-white transition-colors relative py-1 flex items-center gap-1.5 group cursor-pointer"
              >
                Collections
                <ChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180 text-white/40 group-hover:text-white" />
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#c5a059] transition-all duration-300 group-hover:w-full" />
              </button>

              <AnimatePresence>
                {collectionsDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-64 bg-[#111] border border-white/10 py-3 shadow-2xl z-50 mt-2"
                  >
                    <div className="px-4 py-2 border-b border-white/5 mb-1">
                      <span className="text-[10px] uppercase font-accent tracking-[0.3em] text-[#c5a059] block">
                        Signature Wardrobe
                      </span>
                    </div>
                    {categories.slice(0, 5).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleNavClick(cat)}
                        className="w-full text-left px-4 py-2 text-xs font-sans text-white/80 hover:text-[#c5a059] hover:bg-white/5 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>{cat}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => handleNavClick('all')}
                      className="w-full text-left px-4 py-2 text-xs font-sans text-[#c5a059] hover:bg-white/5 transition-colors flex items-center justify-between border-t border-white/5 mt-1 cursor-pointer"
                    >
                      <span>Explore Full Runway</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              id="nav-trending"
              onClick={() => handleNavClick('all')}
              className="hover:text-white transition-colors relative py-1 group flex items-center gap-1.5 cursor-pointer"
            >
              Runway Edit
              <span className="w-1 h-1 bg-[#c5a059] rounded-full" />
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#c5a059] transition-all duration-300 group-hover:w-full" />
            </button>
          </nav>

          {/* Center Brand Logo with Artistic Flair */}
          <div className="text-center">
            <button
              id="brand-logo-btn"
              onClick={() => handleNavClick('home')}
              className="group inline-flex flex-col items-center focus:outline-none cursor-pointer"
            >
              <span className="text-2xl sm:text-3xl lg:text-4xl font-serif tracking-[0.25em] font-light italic text-[#fdfcfb] group-hover:text-[#c5a059] transition-colors duration-300">
                LUXORA
              </span>
              <span className="text-[8px] sm:text-[9px] font-accent tracking-[0.5em] uppercase text-[#c5a059] pl-[0.5em] -mt-0.5 opacity-80">
                ATELIER 2026
              </span>
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-6 text-[11px] uppercase tracking-widest font-medium">
            
            {/* Search */}
            <button
              id="desktop-search-trigger"
              onClick={() => setIsSearchOpen(true)}
              className="hidden lg:flex items-center gap-2 text-white/70 hover:text-white transition-colors group cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
              <span className="hidden xl:inline">Search</span>
            </button>

            {/* Account Icon */}
            <button
              id="account-btn-nav"
              onClick={() => {
                if (user?.isLoggedIn) {
                  setCurrentView('account');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setIsAccountModalOpen(true);
                }
              }}
              className="text-white/70 hover:text-white transition-colors relative flex items-center gap-1.5 cursor-pointer"
              aria-label="Account"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
              {user?.isLoggedIn && (
                <span className="w-1.5 h-1.5 bg-[#c5a059] rounded-full" />
              )}
            </button>

            {/* Wishlist */}
            <button
              id="wishlist-btn-nav"
              onClick={() => {
                setCurrentView('wishlist');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-1 text-white/70 hover:text-white transition-colors relative cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className="w-4.5 h-4.5" />
              {wishlistCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-[#c5a059] text-black font-bold text-[8px] px-1.5 py-0.5 rounded-full flex items-center justify-center leading-none"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 lg:hidden"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-sm bg-[#0a0a0a] border-r border-white/10 z-50 flex flex-col p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <span className="font-serif text-2xl tracking-[0.25em] font-light italic text-[#fdfcfb]">
                  LUXORA
                </span>
                <button
                  id="close-mobile-menu-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-white/60 hover:text-white cursor-pointer"
                  aria-label="Close Navigation Menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Links */}
              <div className="py-6 space-y-4 flex-1">
                <button
                  onClick={() => handleNavClick('home')}
                  className={`w-full text-left font-serif text-2xl tracking-wide py-2 transition-colors flex items-center justify-between cursor-pointer ${
                    currentView === 'home' ? 'text-[#c5a059]' : 'text-white/90'
                  }`}
                >
                  <span>Home Runway</span>
                  <ArrowRight className="w-4 h-4 text-white/30" />
                </button>

                <button
                  onClick={() => handleNavClick('new')}
                  className="w-full text-left font-serif text-2xl tracking-wide py-2 text-white/90 hover:text-[#c5a059] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>New Arrivals</span>
                  <span className="text-[10px] font-accent uppercase bg-[#c5a059]/20 text-[#c5a059] px-2 py-0.5">2026</span>
                </button>

                <button
                  onClick={() => handleNavClick('men')}
                  className="w-full text-left font-serif text-2xl tracking-wide py-2 text-white/90 hover:text-[#c5a059] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Men’s Collection</span>
                  <ArrowRight className="w-4 h-4 text-white/30" />
                </button>

                <button
                  onClick={() => handleNavClick('women')}
                  className="w-full text-left font-serif text-2xl tracking-wide py-2 text-white/90 hover:text-[#c5a059] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Women’s Collection</span>
                  <ArrowRight className="w-4 h-4 text-white/30" />
                </button>

                <button
                  onClick={() => handleNavClick('unisex')}
                  className="w-full text-left font-serif text-2xl tracking-wide py-2 text-white/90 hover:text-[#c5a059] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Streetwear Atelier</span>
                  <ArrowRight className="w-4 h-4 text-white/30" />
                </button>

                <button
                  onClick={() => handleNavClick('all')}
                  className="w-full text-left font-serif text-2xl tracking-wide py-2 text-[#c5a059] hover:text-white transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Explore Full Runway</span>
                  <Sparkles className="w-4 h-4 text-[#c5a059]" />
                </button>
              </div>

              {/* Mobile Footer Area */}
              <div className="pt-6 border-t border-white/10 space-y-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCurrentView('account');
                  }}
                  className="w-full py-3 bg-white/5 border border-white/10 text-white font-accent text-xs tracking-widest uppercase hover:bg-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#c5a059]" />
                  <span>{user?.isLoggedIn ? `Account (${user.name})` : 'Sign In / Register'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
