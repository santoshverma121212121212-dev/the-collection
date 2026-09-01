import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Lock, Mail, Phone, CheckCircle2, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AccountModal: React.FC = () => {
  const { isAccountModalOpen, setIsAccountModalOpen, user, loginUser, logoutUser, setCurrentView } = useStore();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isAccountModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    loginUser(email, name || undefined);
  };

  const handleDemoSignIn = () => {
    loginUser('devraj.kapoor@luxora.in', 'Devraj Kapoor');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsAccountModalOpen(false)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#101013] border border-[#c9a86a]/30 p-6 sm:p-8 shadow-2xl z-10 text-white"
        >
          {/* Close button */}
          <button
            onClick={() => setIsAccountModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo & Header */}
          <div className="text-center mb-6">
            <span className="font-display text-2xl tracking-[0.25em] text-white block">
              LUXORA
            </span>
            <span className="text-[10px] font-accent uppercase tracking-[0.3em] text-[#c9a86a] block mt-0.5">
              PATRON ATELIER PRIVILEGE
            </span>
          </div>

          {user.isLoggedIn ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#c9a86a]/15 border border-[#c9a86a]/40 mx-auto flex items-center justify-center text-[#c9a86a]">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-serif text-xl text-white font-medium">{user.name}</h4>
                <p className="text-xs text-white/60 font-sans mt-0.5">{user.email}</p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    setIsAccountModalOpen(false);
                    setCurrentView('account');
                  }}
                  className="w-full py-3 bg-[#c9a86a] text-[#0c0c0e] font-accent text-xs uppercase tracking-widest font-bold hover:bg-[#dfc38a]"
                >
                  View Order History & Addresses
                </button>
                <button
                  onClick={logoutUser}
                  className="w-full py-2.5 bg-white/5 text-white/70 hover:text-white font-accent text-xs uppercase tracking-widest border border-white/10"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Tab Switcher */}
              <div className="flex border-b border-white/10 mb-6">
                <button
                  onClick={() => setTab('login')}
                  className={`flex-1 pb-3 text-xs font-accent uppercase tracking-widest transition-colors relative ${
                    tab === 'login' ? 'text-[#c9a86a] font-bold' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Sign In
                  {tab === 'login' && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c9a86a]" />
                  )}
                </button>
                <button
                  onClick={() => setTab('register')}
                  className={`flex-1 pb-3 text-xs font-accent uppercase tracking-widest transition-colors relative ${
                    tab === 'register' ? 'text-[#c9a86a] font-bold' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Register
                  {tab === 'register' && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c9a86a]" />
                  )}
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {tab === 'register' && (
                  <div>
                    <label className="text-[10.5px] font-accent uppercase tracking-wider text-white/70 block mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Siddharth Singhania"
                        className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#c9a86a]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10.5px] font-accent uppercase tracking-wider text-white/70 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patron@example.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#c9a86a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10.5px] font-accent uppercase tracking-wider text-white/70 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#c9a86a]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#c9a86a] to-[#d8ba82] text-[#0c0c0e] font-accent font-bold text-xs tracking-widest uppercase hover:brightness-110 active:scale-[0.99] transition-all shadow-lg"
                >
                  {tab === 'login' ? 'SIGN IN TO ATELIER' : 'CREATE PATRON ACCOUNT'}
                </button>
              </form>

              {/* Demo Sign In Button */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-[#c9a86a]/30 text-[#c9a86a] font-accent text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>One-Click Demo Sign In</span>
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-[10.5px] font-sans text-white/40 flex items-center justify-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#c9a86a]" />
                  Protected by 256-Bit Patron Encryption
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
