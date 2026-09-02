import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ShoppingBag, Heart, Sparkles, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ToastNotification: React.FC = () => {
  const { toast, hideToast, setIsCartOpen } = useStore();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          id="toast-notification-banner"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full luxury-glass border border-[#c9a86a]/30 p-4 shadow-2xl rounded-none text-white overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#c9a86a] to-[#8f7035]" />
          
          <div className="flex items-start gap-3.5 pl-2">
            {toast.image ? (
              <img
                src={toast.image}
                alt={toast.productName || 'Product'}
                className="w-12 h-15 object-cover object-center border border-white/10 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#c9a86a]/20 border border-[#c9a86a]/40 flex items-center justify-center shrink-0 text-[#c9a86a]">
                {toast.type === 'bag' && <ShoppingBag className="w-5 h-5" />}
                {toast.type === 'wishlist' && <Heart className="w-5 h-5 fill-current" />}
                {toast.type === 'promo' && <Sparkles className="w-5 h-5" />}
                {toast.type === 'info' && <CheckCircle2 className="w-5 h-5" />}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-accent text-[11px] tracking-widest uppercase text-[#c9a86a] font-semibold">
                  {toast.title}
                </p>
                <button
                  id="close-toast-btn"
                  onClick={hideToast}
                  className="text-white/40 hover:text-white transition-colors p-1"
                  aria-label="Close Notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="font-sans text-xs text-white/90 font-medium truncate mt-0.5">
                {toast.message}
              </p>

              {toast.price !== undefined && (
                <p className="font-serif text-sm text-[#c9a86a] font-bold mt-1">
                  ₹{toast.price.toLocaleString('en-IN')}
                </p>
              )}

              {toast.type === 'bag' && (
                <div className="mt-2.5 flex items-center gap-3">
                  <button
                    id="toast-view-bag-btn"
                    onClick={() => {
                      hideToast();
                      setIsCartOpen(true);
                    }}
                    className="text-[11px] font-accent uppercase tracking-wider text-[#c9a86a] hover:text-[#e7cf9e] underline underline-offset-4 transition-colors"
                  >
                    View Bag & Checkout →
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
