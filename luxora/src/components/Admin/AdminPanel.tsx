import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  Layers, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Eye, 
  Sparkles, 
  Menu, 
  X, 
  Shield, 
  Search,
  Bell,
  ChevronRight,
  Store
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminProductForm } from './AdminProductForm';
import { AdminCategories } from './AdminCategories';
import { AdminSettings } from './AdminSettings';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminUsers } from './AdminUsers';
import { AdminTab } from '../../types';

export const AdminPanel: React.FC = () => {
  const { 
    isAdminAuthenticated, 
    adminUser, 
    adminLogout, 
    adminTab, 
    setAdminTab, 
    setCurrentView,
    products,
    setEditingProductId
  } = useStore();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If not authenticated, display luxury admin login screen
  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }

  const handleNavTab = (tab: AdminTab) => {
    if (tab === 'add-product') {
      setEditingProductId(null);
    }
    setAdminTab(tab);
    setMobileSidebarOpen(false);
  };

  const isSuperAdmin = adminUser?.role === 'super_admin' || adminUser?.username === 'admin';

  const navItems = [
    { tab: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { tab: 'products' as AdminTab, label: 'Products Catalog', icon: Package, badge: products.length },
    { tab: 'add-product' as AdminTab, label: 'Add New Product', icon: PlusCircle },
    { tab: 'categories' as AdminTab, label: 'Categories', icon: Layers },
    ...(isSuperAdmin ? [
      { tab: 'audit-logs' as AdminTab, label: 'Audit Trails', icon: Shield },
      { tab: 'users' as AdminTab, label: 'Staff Admins', icon: Bell }
    ] : []),
    { tab: 'settings' as AdminTab, label: 'System & Backup', icon: Settings }
  ];

  return (
    <div id="luxora-admin-portal" className="min-h-screen bg-[#070709] text-white flex flex-col">
      
      {/* Top Banner Bar for Admin Mode */}
      <div className="bg-[#111116] border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 text-white/70 hover:text-white lg:hidden"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <span className="font-serif text-lg tracking-[0.2em] font-light text-white">LUXORA</span>
            <span className="text-[9px] font-accent uppercase tracking-widest bg-[#c5a059]/20 text-[#c5a059] px-2 py-0.5 border border-[#c5a059]/40">
              OPERATIONS PORTAL
            </span>
          </div>
        </div>

        {/* Right quick actions */}
        <div className="flex items-center gap-4 text-xs font-accent">
          <button
            onClick={() => setCurrentView('home')}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 text-[11px] uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Live Storefront</span>
          </button>

          <button
            onClick={adminLogout}
            className="text-white/60 hover:text-[#ff6b6b] text-[11px] uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (Desktop) */}
        <aside className="w-64 bg-[#0c0c0f] border-r border-white/10 flex-col justify-between hidden lg:flex shrink-0">
          <div className="p-5 space-y-6">
            
            {/* Admin Profile Info */}
            <div className="p-3.5 bg-[#121217] border border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] font-serif font-bold text-sm">
                A
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-medium text-white truncate">{adminUser?.name || 'Administrator'}</div>
                <div className="text-[10px] text-[#c5a059] font-accent uppercase tracking-wider truncate">
                  {adminUser?.role || 'Super Admin'}
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = adminTab === item.tab || (item.tab === 'products' && adminTab === 'edit-product');

                return (
                  <button
                    key={item.tab}
                    onClick={() => handleNavTab(item.tab)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-accent uppercase tracking-wider transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#c5a059] text-black font-bold shadow-md' 
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#c5a059]'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-black text-white' : 'bg-white/10 text-white/80'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-5 border-t border-white/5 space-y-3">
            <div className="p-3 bg-[#070709] border border-white/5 space-y-1">
              <div className="text-[10px] font-accent uppercase tracking-widest text-[#c5a059]">LUXORA ENGINE</div>
              <div className="text-[10px] text-white/40 font-mono">v3.4.0 &bull; Catalog Mode</div>
              <div className="text-[9px] text-emerald-400 font-mono">Direct Partner Routing</div>
            </div>

            <button
              onClick={() => setCurrentView('home')}
              className="w-full py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-accent uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3 h-3 text-[#c5a059]" />
              <span>Customer Storefront</span>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className="fixed top-0 bottom-0 left-0 w-72 bg-[#0c0c0f] border-r border-white/10 z-50 flex flex-col justify-between p-6"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <span className="font-serif text-xl tracking-widest text-white">LUXORA ADMIN</span>
                    <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-white/70">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="space-y-1.5">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = adminTab === item.tab;
                      return (
                        <button
                          key={item.tab}
                          onClick={() => handleNavTab(item.tab)}
                          className={`w-full flex items-center justify-between px-3.5 py-3 text-xs font-accent uppercase tracking-wider ${
                            isActive ? 'bg-[#c5a059] text-black font-bold' : 'text-white/70 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge !== undefined && (
                            <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 text-white">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="pt-6 border-t border-white/10 space-y-3">
                  <button
                    onClick={() => {
                      setMobileSidebarOpen(false);
                      setCurrentView('home');
                    }}
                    className="w-full py-2.5 bg-white/5 text-white text-xs font-accent uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Store className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Storefront</span>
                  </button>
                  <button
                    onClick={adminLogout}
                    className="w-full py-2 bg-red-950/30 text-red-300 text-xs font-accent uppercase tracking-wider flex items-center justify-center gap-2 border border-red-500/20"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#070709]">
          <div className="max-w-7xl mx-auto">
            {adminTab === 'dashboard' && <AdminDashboard />}
            {adminTab === 'products' && <AdminProducts />}
            {adminTab === 'add-product' && <AdminProductForm isEditing={false} />}
            {adminTab === 'edit-product' && <AdminProductForm isEditing={true} />}
            {adminTab === 'categories' && <AdminCategories />}
            {adminTab === 'audit-logs' && <AdminAuditLogs />}
            {adminTab === 'users' && <AdminUsers />}
            {adminTab === 'settings' && <AdminSettings />}
          </div>
        </main>

      </div>
    </div>
  );
};
