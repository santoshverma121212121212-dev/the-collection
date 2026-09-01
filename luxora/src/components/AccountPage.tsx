import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Heart, 
  MapPin, 
  Shield, 
  LogOut, 
  Sparkles, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  Settings,
  ExternalLink,
  Crown
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';

export const AccountPage: React.FC = () => {
  const { 
    user, 
    logoutUser, 
    setCurrentView, 
    saveAddress, 
    showToast,
    accountTab,
    setAccountTab,
    wishlist,
    products,
    isAdminAuthenticated
  } = useStore();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: user?.name || 'Patron Client',
    email: user?.email || 'patron@luxora.in',
    phone: '+91 98765 43210',
    addressLine1: '',
    addressLine2: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  });

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.addressLine1 || !newAddr.pincode) return;

    saveAddress({
      id: `addr-${Date.now()}`,
      fullName: newAddr.name,
      email: newAddr.email,
      phone: newAddr.phone,
      addressLine1: newAddr.addressLine1,
      addressLine2: newAddr.addressLine2,
      city: newAddr.city,
      state: newAddr.state,
      pinCode: newAddr.pincode,
      isDefault: (user?.addresses || []).length === 0
    });

    showToast({
      title: 'Residence Saved',
      message: 'New delivery residence recorded in your patron portfolio.',
      type: 'promo'
    });

    setShowAddressForm(false);
  };

  return (
    <div id="patron-account-hub" className="min-h-screen bg-[#0a0a0a] pt-8 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="py-8 sm:py-12 border-b border-white/10 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-accent uppercase tracking-[0.35em] text-[#c5a059] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BLACK LABEL PATRON MEMBERSHIP</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl uppercase font-light tracking-wide text-[#fdfcfb]">
              {user?.name || 'Patron Client'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-sans text-white/50 font-light">
              Patron Member &bull; Exclusive Atelier Access Active &bull; {user?.email || 'patron@luxora.in'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                logoutUser();
                setCurrentView('home');
              }}
              className="text-xs font-accent uppercase tracking-wider text-white/60 hover:text-[#ff6b6b] flex items-center gap-2 transition-colors self-start sm:self-auto border border-white/10 px-4 py-2 hover:border-[#ff6b6b]/40 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 mb-10 overflow-x-auto no-scrollbar gap-2 sm:gap-4">
          
          <button
            onClick={() => setAccountTab('profile')}
            className={`pb-4 px-5 text-xs font-accent uppercase tracking-[0.2em] transition-colors relative whitespace-nowrap cursor-pointer ${
              accountTab === 'profile' ? 'text-[#c5a059] font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Patron Profile</span>
            </div>
            {accountTab === 'profile' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c5a059]" />
            )}
          </button>

          <button
            onClick={() => setAccountTab('wishlist')}
            className={`pb-4 px-5 text-xs font-accent uppercase tracking-[0.2em] transition-colors relative whitespace-nowrap cursor-pointer ${
              accountTab === 'wishlist' ? 'text-[#c5a059] font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#c5a059]" />
              <span>Curated Wishlist ({wishlist.length})</span>
            </div>
            {accountTab === 'wishlist' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c5a059]" />
            )}
          </button>

          <button
            onClick={() => setAccountTab('addresses')}
            className={`pb-4 px-5 text-xs font-accent uppercase tracking-[0.2em] transition-colors relative whitespace-nowrap cursor-pointer ${
              accountTab === 'addresses' ? 'text-[#c5a059] font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Saved Residences ({(user?.addresses || []).length})</span>
            </div>
            {accountTab === 'addresses' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c5a059]" />
            )}
          </button>

        </div>

        {/* Tab 1: Profile */}
        {accountTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-[#111115] border border-white/10 p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-serif text-2xl text-white">Patron Credentials</h3>
                  <p className="text-xs text-white/50 font-sans mt-0.5">Verified atelier profile and high-fashion privilege status</p>
                </div>
                <Crown className="w-6 h-6 text-[#c5a059]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans">
                <div>
                  <span className="text-white/50 block font-accent uppercase text-[10px] tracking-wider mb-1">Full Name</span>
                  <p className="text-base text-white font-serif">{user?.name || 'Aarav Singhania'}</p>
                </div>

                <div>
                  <span className="text-white/50 block font-accent uppercase text-[10px] tracking-wider mb-1">Email Address</span>
                  <p className="text-base text-white font-serif">{user?.email || 'aarav.singhania@luxora.in'}</p>
                </div>

                <div>
                  <span className="text-white/50 block font-accent uppercase text-[10px] tracking-wider mb-1">Membership Tier</span>
                  <p className="text-base text-[#c5a059] font-serif font-bold">LUXORA Black Label Privileged</p>
                </div>

                <div>
                  <span className="text-white/50 block font-accent uppercase text-[10px] tracking-wider mb-1">Personal Concierge</span>
                  <p className="text-base text-white font-serif">concierge@luxora.in</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="p-4 bg-white/5 border border-white/5 flex items-center gap-3 text-xs text-white/70">
                  <ShieldCheck className="w-5 h-5 text-[#c5a059] shrink-0" />
                  <span>Direct partner acquisition system active. Your profile entitles you to prioritized external runway stock allocation.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="bg-[#111115] border border-[#c5a059]/30 p-6 space-y-3">
                <div className="text-[10px] font-accent uppercase tracking-widest text-[#c5a059]">PRIVATE SALON SERVICE</div>
                <h4 className="font-serif text-lg text-white">Dedicated Concierge</h4>
                <p className="text-xs text-white/60 font-sans leading-relaxed">
                  Connect directly with your private stylist for bespoke sizing consultations, confidential showroom viewings, and priority partner allocations.
                </p>
                <button
                  onClick={() => setCurrentView('contact')}
                  className="w-full py-2.5 bg-[#c5a059] text-black font-accent text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors cursor-pointer mt-2"
                >
                  Contact Concierge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Wishlist */}
        {accountTab === 'wishlist' && (
          <div className="space-y-6">
            {wishlistedProducts.length === 0 ? (
              <div className="py-16 text-center border border-white/10 p-8 bg-[#111114]">
                <Heart className="w-12 h-12 text-[#c5a059] mx-auto mb-4 opacity-60" />
                <h3 className="font-serif text-2xl text-white font-light mb-2">
                  Your Wishlist is Empty
                </h3>
                <p className="text-xs text-white/60 max-w-sm mx-auto mb-6">
                  Save your favorite runway creations by clicking the heart icon on any product card.
                </p>
                <button
                  onClick={() => setCurrentView('shop')}
                  className="px-8 py-3 bg-[#c5a059] text-black font-accent text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-white transition-colors"
                >
                  Explore Creations
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Saved Residences */}
        {accountTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl text-white">Delivery Residences</h3>
              <button
                onClick={() => setShowAddressForm(true)}
                className="px-5 py-2.5 bg-[#c5a059] text-black font-accent text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:bg-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Residence</span>
              </button>
            </div>

            {/* Add Address Form */}
            {showAddressForm && (
              <form onSubmit={handleSaveAddress} className="p-6 bg-[#121216] border border-[#c5a059]/40 space-y-4 max-w-2xl">
                <h4 className="font-serif text-lg text-white">Add New Delivery Residence</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/70 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newAddr.name}
                      onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                      className="w-full p-2.5 bg-white/5 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/70 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="w-full p-2.5 bg-white/5 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/70 block mb-1">Address Line 1</label>
                  <input
                    type="text"
                    required
                    value={newAddr.addressLine1}
                    onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                    placeholder="Penthouse, Wing, Street"
                    className="w-full p-2.5 bg-white/5 border border-white/10 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-white/70 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="w-full p-2.5 bg-white/5 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/70 block mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="w-full p-2.5 bg-white/5 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/70 block mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className="w-full p-2.5 bg-white/5 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-2 text-xs font-accent uppercase text-white/60 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#c5a059] text-black font-accent text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-white transition-colors"
                  >
                    Save Residence
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(user?.addresses || []).map((addr) => (
                <div key={addr.id} className="p-6 bg-[#111115] border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-serif text-lg text-white font-medium">{addr.fullName}</h4>
                      {addr.isDefault && (
                        <span className="text-[10px] font-accent uppercase tracking-widest bg-[#c5a059]/20 text-[#c5a059] px-2 py-0.5 border border-[#c5a059]/30">
                          Primary Residence
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/70 font-sans leading-relaxed">
                      {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                      {addr.city}, {addr.state} - {addr.pinCode}
                    </p>
                    <p className="text-xs text-white/50 font-mono mt-2">
                      Tel: {addr.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
