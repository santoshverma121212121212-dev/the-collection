import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  Mail, 
  Key, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminLogin: React.FC = () => {
  const { adminLogin, setCurrentView } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const result = await adminLogin(email, password);
      if (!result.success) {
        setErrorMsg(result.message || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setErrorMsg('An unexpected communication error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient luxury lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-white/5 rounded-full blur-2xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[#101014] border border-[#c5a059]/30 p-8 sm:p-10 shadow-2xl relative z-10"
      >
        {/* Back to store button */}
        <button
          onClick={() => setCurrentView('home')}
          className="inline-flex items-center gap-2 text-xs font-accent text-white/50 hover:text-[#c5a059] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Storefront</span>
        </button>

        {/* Brand header */}
        <div className="text-center mb-8">
          <span className="font-serif text-3xl sm:text-4xl tracking-[0.25em] font-light italic text-[#fdfcfb] block">
            LUXORA
          </span>
          <span className="text-[10px] font-accent tracking-[0.4em] uppercase text-[#c5a059] block mt-1">
            ATELIER OPERATIONS &amp; CATALOG HUB
          </span>
          <p className="text-xs text-white/50 mt-3 font-sans font-light">
            Server-side authenticated portal for managing luxury creations, partner links, and atelier inventory.
          </p>
        </div>

        {/* Error notice */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1.5">
              Administrator Email / Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter administrator email or username"
                className="w-full pl-10 pr-4 py-3 bg-[#0a0a0c] border border-white/15 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#c5a059] transition-colors"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1.5">
              Passcode
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#0a0a0c] border border-white/15 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#c5a059] transition-colors"
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 bg-[#c5a059] text-[#0a0a0c] font-accent text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <span>VERIFYING CREDENTIALS...</span>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>ACCESS OPERATIONS HUB</span>
              </>
            )}
          </button>
        </form>

        {/* Security watermark */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-white/30 tracking-widest uppercase font-accent">
          <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>SERVER-SIDE SQL AUTHENTICATED &bull; RATE LIMITED</span>
        </div>
      </motion.div>
    </div>
  );
};
