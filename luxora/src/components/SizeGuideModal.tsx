import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ruler, Sparkles, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen } = useStore();
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [activeCategory, setActiveCategory] = useState<'tops' | 'bottoms' | 'footwear'>('tops');

  if (!isSizeGuideOpen) return null;

  const topsSizesInches = [
    { size: 'XS', chest: '34 - 36', length: '27.5', shoulder: '18.5', sleeve: '8.5' },
    { size: 'S', chest: '36 - 38', length: '28.5', shoulder: '19.5', sleeve: '9.0' },
    { size: 'M', chest: '38 - 40', length: '29.5', shoulder: '20.5', sleeve: '9.5' },
    { size: 'L', chest: '40 - 43', length: '30.5', shoulder: '21.5', sleeve: '10.0' },
    { size: 'XL', chest: '43 - 46', length: '31.5', shoulder: '22.5', sleeve: '10.5' },
    { size: 'XXL', chest: '46 - 49', length: '32.5', shoulder: '23.5', sleeve: '11.0' },
  ];

  const topsSizesCm = [
    { size: 'XS', chest: '86 - 91', length: '70', shoulder: '47', sleeve: '21.5' },
    { size: 'S', chest: '91 - 96', length: '72', shoulder: '49', sleeve: '23.0' },
    { size: 'M', chest: '96 - 102', length: '75', shoulder: '52', sleeve: '24.0' },
    { size: 'L', chest: '102 - 109', length: '77', shoulder: '55', sleeve: '25.5' },
    { size: 'XL', chest: '109 - 117', length: '80', shoulder: '57', sleeve: '26.5' },
    { size: 'XXL', chest: '117 - 124', length: '82', shoulder: '60', sleeve: '28.0' },
  ];

  const bottomsSizesInches = [
    { size: '28', waist: '28 - 29', hips: '36 - 37', thigh: '22.0', inseam: '32.0' },
    { size: '30', waist: '30 - 31', hips: '38 - 39', thigh: '23.0', inseam: '32.5' },
    { size: '32', waist: '32 - 33', hips: '40 - 41', thigh: '24.0', inseam: '33.0' },
    { size: '34', waist: '34 - 35', hips: '42 - 43', thigh: '25.0', inseam: '33.5' },
    { size: '36', waist: '36 - 37', hips: '44 - 45', thigh: '26.0', inseam: '34.0' },
  ];

  const bottomsSizesCm = [
    { size: '28', waist: '71 - 74', hips: '91 - 94', thigh: '56', inseam: '81' },
    { size: '30', waist: '76 - 79', hips: '96 - 99', thigh: '58', inseam: '82' },
    { size: '32', waist: '81 - 84', hips: '101 - 104', thigh: '61', inseam: '84' },
    { size: '34', waist: '86 - 89', hips: '106 - 109', thigh: '63', inseam: '85' },
    { size: '36', waist: '91 - 94', hips: '111 - 114', thigh: '66', inseam: '86' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSizeGuideOpen(false)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#101013] border border-[#c9a86a]/40 p-6 sm:p-8 shadow-2xl z-10 text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Ruler className="w-5 h-5 text-[#c9a86a]" />
              <h3 className="font-serif text-2xl text-white font-medium">
                Atelier Sizing Guide
              </h3>
            </div>
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="p-1 text-white/60 hover:text-white"
              aria-label="Close Size Guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls: Category & Unit Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 my-6">
            <div className="flex bg-white/5 border border-white/10 p-1">
              <button
                onClick={() => setActiveCategory('tops')}
                className={`px-4 py-1.5 text-xs font-accent uppercase tracking-wider transition-colors ${
                  activeCategory === 'tops' ? 'bg-[#c9a86a] text-[#0c0c0e] font-bold' : 'text-white/70 hover:text-white'
                }`}
              >
                Tops & Coats
              </button>
              <button
                onClick={() => setActiveCategory('bottoms')}
                className={`px-4 py-1.5 text-xs font-accent uppercase tracking-wider transition-colors ${
                  activeCategory === 'bottoms' ? 'bg-[#c9a86a] text-[#0c0c0e] font-bold' : 'text-white/70 hover:text-white'
                }`}
              >
                Trousers & Denim
              </button>
            </div>

            <div className="flex bg-white/5 border border-white/10 p-1">
              <button
                onClick={() => setUnit('inches')}
                className={`px-3 py-1.5 text-xs font-accent uppercase transition-colors ${
                  unit === 'inches' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                Inches (IN)
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1.5 text-xs font-accent uppercase transition-colors ${
                  unit === 'cm' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                Centimeters (CM)
              </button>
            </div>
          </div>

          {/* Sizing Table */}
          <div className="overflow-x-auto border border-white/10">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#15151a] font-accent uppercase text-[10px] tracking-widest text-[#c9a86a] border-b border-white/10">
                <tr>
                  <th className="p-3">Size</th>
                  {activeCategory === 'tops' ? (
                    <>
                      <th className="p-3">Chest</th>
                      <th className="p-3">Length</th>
                      <th className="p-3">Shoulder</th>
                      <th className="p-3">Sleeve</th>
                    </>
                  ) : (
                    <>
                      <th className="p-3">Waist</th>
                      <th className="p-3">Hips</th>
                      <th className="p-3">Thigh</th>
                      <th className="p-3">Inseam</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {activeCategory === 'tops'
                  ? (unit === 'inches' ? topsSizesInches : topsSizesCm).map((row) => (
                      <tr key={row.size} className="hover:bg-white/5">
                        <td className="p-3 font-bold text-white">{row.size}</td>
                        <td className="p-3 text-white/80">{row.chest}</td>
                        <td className="p-3 text-white/80">{row.length}</td>
                        <td className="p-3 text-white/80">{row.shoulder}</td>
                        <td className="p-3 text-white/80">{row.sleeve}</td>
                      </tr>
                    ))
                  : (unit === 'inches' ? bottomsSizesInches : bottomsSizesCm).map((row) => (
                      <tr key={row.size} className="hover:bg-white/5">
                        <td className="p-3 font-bold text-white">{row.size}</td>
                        <td className="p-3 text-white/80">{row.waist}</td>
                        <td className="p-3 text-white/80">{row.hips}</td>
                        <td className="p-3 text-white/80">{row.thigh}</td>
                        <td className="p-3 text-white/80">{row.inseam}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Measurement Advice */}
          <div className="mt-6 p-4 bg-white/5 border border-white/10 text-xs font-sans text-white/70 space-y-1.5">
            <p className="font-accent uppercase text-[10px] tracking-widest text-[#c9a86a] font-bold">
              Fit Recommendation:
            </p>
            <p>
              • <strong>Oversized Items:</strong> Tailored with a generous silhouette. Order your standard size for an intentional runway drape, or size down for a conventional regular fit.
            </p>
            <p>
              • <strong>Bespoke Tailoring:</strong> Need custom alterations? Every order includes a complimentary tailoring voucher redeemable at our atelier partners.
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="px-6 py-2.5 bg-[#c9a86a] text-[#0c0c0e] font-accent text-xs uppercase tracking-widest font-bold hover:bg-[#dfc38a]"
            >
              Close Guide
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
