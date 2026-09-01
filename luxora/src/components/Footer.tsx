import React, { useState } from 'react';
import { 
  ArrowRight, 
  Instagram, 
  Twitter, 
  Sparkles, 
  ShieldCheck, 
  Store,
  Settings
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { setCurrentView, navigateToCategory, showToast, setIsSizeGuideOpen } = useStore();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    showToast({
      title: 'Private Invitation Confirmed',
      message: 'You have been enrolled in the LUXORA Private Atelier Circle.',
      type: 'promo'
    });
    setEmail('');
  };

  return (
    <footer id="main-footer-section" className="bg-[#0a0a0a] border-t border-white/10 text-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Newsletter Card (Privilege Invitation) */}
        <div className="p-8 sm:p-12 bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#c5a059]/30 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7">
              <span className="text-[10px] font-accent uppercase tracking-[0.35em] text-[#c5a059] block mb-2">
                EXCLUSIVE PATRON PRIVILEGES
              </span>
              <h3 className="font-serif text-2xl sm:text-4xl text-[#fdfcfb] font-light">
                Join the <span className="italic font-serif text-[#c5a059]">LUXORA Salon</span>
              </h3>
              <p className="mt-2 text-xs sm:text-sm font-sans text-white/50 max-w-lg leading-relaxed font-light">
                Receive private invitations to confidential seasonal previews, limited atelier drops, and verified purchase link updates directly to your inbox.
              </p>
            </div>

            <div className="lg:col-span-5">
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter patron email address..."
                    className="flex-1 px-4 py-3.5 bg-black/80 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#c5a059]"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-[#c5a059] text-black font-accent text-xs font-bold uppercase tracking-widest hover:bg-white transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>JOIN</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-white/40 font-sans">
                  By joining, you agree to receive confidential editorial dispatches.
                </p>
              </form>
            </div>

          </div>
        </div>

        {/* 4-Column Editorial Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-white/10 text-xs font-sans">
          
          {/* Col 1: Brand Info (2 cols wide on LG) */}
          <div className="lg:col-span-2 space-y-4">
            <span className="font-serif text-2xl sm:text-3xl tracking-[0.25em] text-[#fdfcfb] block">
              LUXORA
            </span>
            <p className="text-white/50 font-light leading-relaxed max-w-sm">
              Haute sartorialism engineered with architectural precision. Handcrafted luxury garments curated and purchased through verified global fulfillment partners.
            </p>
            <div className="pt-2 flex items-center gap-4 text-white/60">
              <a href="#" className="p-2 bg-white/5 hover:bg-white hover:text-black transition-colors border border-white/10" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/5 hover:bg-white hover:text-black transition-colors border border-white/10" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <span className="text-[10px] font-mono text-white/40 tracking-wider">
                MUMBAI &bull; TOKYO &bull; MILAN &bull; LONDON
              </span>
            </div>
          </div>

          {/* Col 2: The Collections */}
          <div className="space-y-3">
            <h4 className="font-accent uppercase tracking-[0.2em] text-[11px] text-[#c5a059] font-bold">
              Collections
            </h4>
            <ul className="space-y-2 text-white/70">
              <li>
                <button onClick={() => navigateToCategory('men')} className="hover:text-[#c5a059] transition-colors cursor-pointer">
                  Men’s Atelier
                </button>
              </li>
              <li>
                <button onClick={() => navigateToCategory('women')} className="hover:text-[#c5a059] transition-colors cursor-pointer">
                  Women’s Couture
                </button>
              </li>
              <li>
                <button onClick={() => navigateToCategory('streetwear')} className="hover:text-[#c5a059] transition-colors cursor-pointer">
                  Elevated Streetwear
                </button>
              </li>
              <li>
                <button onClick={() => navigateToCategory('essentials')} className="hover:text-[#c5a059] transition-colors cursor-pointer">
                  Core Essentials
                </button>
              </li>
              <li>
                <button onClick={() => navigateToCategory('Jackets')} className="hover:text-[#c5a059] transition-colors cursor-pointer">
                  Outerwear &amp; Coats
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Client Services */}
          <div className="space-y-3">
            <h4 className="font-accent uppercase tracking-[0.2em] text-[11px] text-[#c5a059] font-bold">
              Client Services
            </h4>
            <ul className="space-y-2 text-white/70">
              <li>
                <button onClick={() => setIsSizeGuideOpen(true)} className="hover:text-[#c5a059] transition-colors cursor-pointer">
                  Atelier Size Guide
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('account')} className="hover:text-[#c5a059] transition-colors cursor-pointer">
                  Patron Portfolio
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('wishlist')} className="hover:text-[#c5a059] transition-colors cursor-pointer">
                  Curated Wishlist
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('contact')} className="hover:text-[#c5a059] transition-colors cursor-pointer">
                  Private Concierge
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('faq')} className="hover:text-[#c5a059] transition-colors cursor-pointer">
                  Partner Fulfilment FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Atelier & Editorial */}
          <div className="space-y-3">
            <h4 className="font-accent uppercase tracking-[0.2em] text-[11px] text-[#c5a059] font-bold">
              The Maison
            </h4>
            <ul className="space-y-2 text-white/70">
              <li>
                <button onClick={() => setCurrentView('about')} className="hover:text-[#c5a059] transition-colors cursor-pointer">
                  Atelier Manifesto
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('lookbook')} className="hover:text-[#c5a059] transition-colors cursor-pointer">
                  AW 2026 Lookbook
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('sustainability')} className="hover:text-[#c5a059] transition-colors cursor-pointer">
                  Circular Permanence
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('contact')} className="hover:text-[#c5a059] transition-colors cursor-pointer">
                  Press &amp; Collaborations
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal & Partner Badges */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-white/50">
          <div className="flex items-center gap-4">
            <span>&copy; {new Date().getFullYear()} LUXORA HAUTE SARTORIALISM. ALL RIGHTS RESERVED.</span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-accent tracking-widest text-[#c5a059]/80 uppercase">
            <span>AMAZON</span>
            <span>&bull;</span>
            <span>FLIPKART</span>
            <span>&bull;</span>
            <span>MEESHO</span>
            <span>&bull;</span>
            <span>OFFICIAL PARTNER ATELIERS</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
