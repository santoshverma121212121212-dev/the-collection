import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  HelpCircle, 
  Leaf, 
  Scissors, 
  ChevronDown, 
  Send,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { LUXORA_LOOKBOOK_ITEMS } from '../data/products';

interface StaticPagesProps {
  type: 'about' | 'lookbook' | 'sustainability' | 'faq' | 'contact';
}

export const StaticPages: React.FC<StaticPagesProps> = ({ type }) => {
  const { setCurrentView, showToast } = useStore();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  
  // Contact Form
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast({
      title: 'Concierge Inquiry Dispatched',
      message: 'A LUXORA Private Client Concierge will contact you within 4 hours.',
      type: 'success'
    });
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  const FAQS = [
    {
      q: 'How does LUXORA ensure the quality of raw fibers?',
      a: 'Every batch of virgin wool, Mongolian cashmere, and Californian Supima cotton undergoes rigorous spectroscopic fiber-length verification. We partner exclusively with multi-generational family mills in Biella (Italy), Okayama (Japan), and Ulaanbaatar.'
    },
    {
      q: 'What is included in the Complimentary Tailoring Alterations?',
      a: 'Every LUXORA outerwear or tailored trouser acquisition includes an alteration certificate valid for 90 days. You may visit any of our partner ateliers in Mumbai, Delhi, Bengaluru, London, or Dubai for complimentary hem, waist, and sleeve tailoring adjustments.'
    },
    {
      q: 'How does White-Glove Courier delivery work?',
      a: 'Your garment is hand-inspected, steam-pressed, and packaged in a matte presentation box with a breathable anti-static garment bag. Domestic orders in metro areas arrive in 2–3 business days via carbon-neutral insured courier.'
    },
    {
      q: 'What is your returns and exchanges policy?',
      a: 'We offer hassle-free 15-day complimentary doorstep returns. Garments must be unworn with atelier security ribbons intact. We provide either immediate size exchanges or 100% store credit with an additional 5% loyalty bonus.'
    },
    {
      q: 'Do you offer bespoke private sizing or custom embroidery?',
      a: 'Yes, our Black Label patrons enjoy access to custom monogramming, bespoke sleeve adjustments, and private in-suite styling consultations. Contact our concierge at concierge@luxora.in.'
    }
  ];

  return (
    <div id={`static-page-${type}`} className="min-h-screen bg-[#0a0a0c] pt-8 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. ABOUT US / ATELIER MANIFESTO */}
        {type === 'about' && (
          <div className="space-y-16">
            <div className="text-center max-w-3xl mx-auto py-10">
              <span className="text-[11px] font-accent uppercase tracking-[0.3em] text-[#c9a86a] block mb-3">
                THE LUXORA HERITAGE
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl uppercase font-light tracking-wide text-white">
                Architectural <span className="italic font-serif text-[#c9a86a]">Sartorialism</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg font-sans text-white/70 font-light leading-relaxed">
                Founded with a singular conviction: that modern luxury lies not in loud logos, but in the tactile weight of pure fibers, sculptural proportions, and generational tailoring.
              </p>
            </div>

            {/* Split Visual Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6 text-sm font-sans text-white/80 leading-relaxed">
                <h2 className="font-serif text-3xl text-white">The Architecture of Silence</h2>
                <p>
                  At LUXORA, every silhouette is drafted as an architectural study. We reject the frenetic 52-season churn of disposable fashion in favor of curated seasonal capsules designed to withstand the test of decades.
                </p>
                <p>
                  Our tailoring studio unites Japanese raw denim looms, Scottish cashmere spinners, and master Italian cutters to engineer garments that drape with natural gravitational fluidity.
                </p>
                <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="font-serif text-3xl text-[#c9a86a] font-bold block">100%</span>
                    <span className="text-[10px] font-accent uppercase tracking-wider text-white/60">Traceable Fibers</span>
                  </div>
                  <div>
                    <span className="font-serif text-3xl text-[#c9a86a] font-bold block">680 GSM</span>
                    <span className="text-[10px] font-accent uppercase tracking-wider text-white/60">Heavy Virgin Wool</span>
                  </div>
                  <div>
                    <span className="font-serif text-3xl text-[#c9a86a] font-bold block">0%</span>
                    <span className="text-[10px] font-accent uppercase tracking-wider text-white/60">Synthetic Fillers</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 relative aspect-[4/5] overflow-hidden border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85"
                  alt="LUXORA Atelier"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. LOOKBOOK */}
        {type === 'lookbook' && (
          <div className="space-y-16">
            <div className="text-center max-w-3xl mx-auto py-10">
              <span className="text-[11px] font-accent uppercase tracking-[0.3em] text-[#c9a86a] block mb-3">
                EDITORIAL RUNWAY ARCHIVE
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl uppercase font-light tracking-wide text-white">
                Autumn / Winter <span className="italic font-serif text-[#c9a86a]">2026 Lookbook</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base font-sans text-white/70">
                Photographed in atmospheric light. Exploring heavy drape, tactile shearling, and monolithic cuts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {LUXORA_LOOKBOOK_ITEMS.map((item) => (
                <div key={item.id} className="group relative overflow-hidden bg-[#111115] border border-white/10">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-90" />
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] font-accent uppercase tracking-widest text-[#c9a86a] block mb-1">
                      LOOK {item.id.replace('look-', '')} • {item.season}
                    </span>
                    <h3 className="font-serif text-2xl text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-white/60 font-sans leading-relaxed mb-4">{item.description}</p>
                    <button
                      onClick={() => setCurrentView('shop')}
                      className="text-xs font-accent uppercase tracking-wider text-white group-hover:text-[#c9a86a] flex items-center gap-1.5 transition-colors"
                    >
                      <span>Shop Look Pieces</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. SUSTAINABILITY */}
        {type === 'sustainability' && (
          <div className="space-y-16">
            <div className="text-center max-w-3xl mx-auto py-10">
              <span className="text-[11px] font-accent uppercase tracking-[0.3em] text-[#c9a86a] block mb-3">
                CIRCULAR LUXURY MANDATE
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl uppercase font-light tracking-wide text-white">
                Intentional <span className="italic font-serif text-[#c9a86a]">Permanence</span>
              </h1>
              <p className="mt-4 text-base font-sans text-white/70">
                True luxury is inherently sustainable: garments built with exceptional raw materials that endure for decades without entering landfills.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-[#111115] border border-white/10 space-y-4">
                <Leaf className="w-8 h-8 text-[#c9a86a]" />
                <h3 className="font-serif text-2xl text-white">Zero Synthetic Fibers</h3>
                <p className="text-xs text-white/60 leading-relaxed font-sans">
                  We eliminate petroleum-derived polyester and acrylic blends. Our garments utilize 100% natural, biodegradable fibers including Grade-A Mongolian cashmere, mulberry silk, and organic long-staple cotton.
                </p>
              </div>

              <div className="p-8 bg-[#111115] border border-white/10 space-y-4">
                <Scissors className="w-8 h-8 text-[#c9a86a]" />
                <h3 className="font-serif text-2xl text-white">Small-Batch Tailoring</h3>
                <p className="text-xs text-white/60 leading-relaxed font-sans">
                  We manufacture strictly in micro-batches of 50–200 numbered units per silhouette. This eliminates deadstock inventory and ensures master tailors can dedicate meticulous attention to every single seam.
                </p>
              </div>

              <div className="p-8 bg-[#111115] border border-white/10 space-y-4">
                <ShieldCheck className="w-8 h-8 text-[#c9a86a]" />
                <h3 className="font-serif text-2xl text-white">Lifetime Atelier Care</h3>
                <p className="text-xs text-white/60 leading-relaxed font-sans">
                  We provide complimentary lifetime seam repairs, button replacements, and garment care instructions for all LUXORA creations. A garment should be passed on to future generations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. FAQ */}
        {type === 'faq' && (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center py-10">
              <span className="text-[11px] font-accent uppercase tracking-[0.3em] text-[#c9a86a] block mb-3">
                CLIENT SERVICE ASSISTANCE
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl uppercase font-light tracking-wide text-white">
                Frequently Asked <span className="italic font-serif text-[#c9a86a]">Questions</span>
              </h1>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="bg-[#111115] border border-white/10">
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between font-serif text-lg sm:text-xl text-white hover:text-[#c9a86a] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180 text-[#c9a86a]' : 'text-white/40'}`} />
                  </button>
                  <AnimatePresence>
                    {activeFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden px-6 pb-6 text-xs sm:text-sm font-sans text-white/70 leading-relaxed"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. CONTACT & PRIVATE CONCIERGE */}
        {type === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-[11px] font-accent uppercase tracking-[0.3em] text-[#c9a86a] block mb-2">
                  CLIENT RELATIONS & ATELIER
                </span>
                <h1 className="font-serif text-4xl sm:text-5xl uppercase font-light tracking-wide text-white">
                  Contact <span className="italic font-serif text-[#c9a86a]">Concierge</span>
                </h1>
                <p className="mt-3 text-xs sm:text-sm font-sans text-white/60">
                  Our private client advisors are available 7 days a week for sizing recommendations, bespoke orders, and order status updates.
                </p>
              </div>

              <div className="space-y-6 text-xs font-sans text-white/80">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-[#c9a86a] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-accent uppercase tracking-wider text-[11px]">Flagship Atelier</strong>
                    <p className="text-white/60 mt-0.5">The Oberoi Pavilion, Nariman Point, Mumbai 400021</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-[#c9a86a] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-accent uppercase tracking-wider text-[11px]">Private Client Line</strong>
                    <p className="text-white/60 mt-0.5">+91 (022) 8900 4500 (Mon–Sat, 10:00 – 20:00 IST)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-[#c9a86a] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-accent uppercase tracking-wider text-[11px]">Electronic Inquiries</strong>
                    <p className="text-white/60 mt-0.5">concierge@luxora.in • press@luxora.in</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-7 bg-[#111115] border border-white/10 p-8 sm:p-10">
              <h3 className="font-serif text-2xl text-white mb-6">Send an Atelier Message</h3>
              
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[11px] font-accent uppercase tracking-wider text-white/70 block mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Yashvardhan Singhania"
                      className="w-full p-3 bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#c9a86a]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-accent uppercase tracking-wider text-white/70 block mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="patron@example.com"
                      className="w-full p-3 bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#c9a86a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-accent uppercase tracking-wider text-white/70 block mb-1.5">
                    Nature of Inquiry
                  </label>
                  <select className="w-full p-3 bg-[#18181d] border border-white/10 text-xs text-white focus:outline-none focus:border-[#c9a86a]">
                    <option>Sizing & Fit Advice</option>
                    <option>Order Tracking & Delivery</option>
                    <option>Private Atelier Appointment</option>
                    <option>Bespoke Tailoring Request</option>
                    <option>Press & Editorial Collaboration</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-accent uppercase tracking-wider text-white/70 block mb-1.5">
                    Your Message
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="How may our atelier concierge assist you?"
                    className="w-full p-3 bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#c9a86a]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#c9a86a] to-[#d8ba82] text-[#0c0c0e] font-accent font-bold text-xs tracking-[0.25em] uppercase hover:brightness-110 shadow-xl flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>TRANSMIT CONCIERGE DISPATCH</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
