import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  Download, 
  Upload, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles,
  Info,
  Server
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminSettings: React.FC = () => {
  const { 
    products, 
    categories, 
    resetCatalogToDefaults, 
    showToast,
    adminUser 
  } = useStore();

  const [showResetModal, setShowResetModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);

  const handleExportJson = async () => {
    try {
      const res = await fetch('/api/admin/system/export', { credentials: 'include', method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `luxora_sql_catalog_backup_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        showToast({
          title: 'Database Exported',
          message: 'Downloaded complete SQL database backup JSON.',
          type: 'success'
        });
      }
    } catch {
      showToast({ title: 'Export Failed', message: 'Could not export from server.', type: 'error' });
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify({ products, categories }, null, 2));
    setCopied(true);
    showToast({
      title: 'Copied to Clipboard',
      message: 'Full catalog JSON data copied to clipboard.',
      type: 'info'
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExecuteReset = async () => {
    await resetCatalogToDefaults();
    setShowResetModal(false);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (parsed.products && Array.isArray(parsed.products)) {
        localStorage.setItem('luxora_products_catalog', JSON.stringify(parsed.products));
        if (parsed.categories && Array.isArray(parsed.categories)) {
          localStorage.setItem('luxora_categories_catalog', JSON.stringify(parsed.categories));
        }
        window.location.reload();
      } else if (Array.isArray(parsed)) {
        localStorage.setItem('luxora_products_catalog', JSON.stringify(parsed));
        window.location.reload();
      } else {
        showToast({
          title: 'Invalid JSON Structure',
          message: 'JSON must contain a "products" array or be an array of products.',
          type: 'warning'
        });
      }
    } catch (err) {
      showToast({
        title: 'JSON Parse Error',
        message: 'Could not parse the provided JSON string.',
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <h2 className="font-serif text-2xl text-white font-light">
          Atelier System &amp; Catalog Settings
        </h2>
        <p className="text-xs text-white/50 font-sans font-light">
          Backup, restore, and configure storefront operations and external partner routing.
        </p>
      </div>

      {/* 1. External Partner Redirection Overview */}
      <div className="bg-[#111116] border border-[#c5a059]/30 p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <ExternalLink className="w-4 h-4 text-[#c5a059]" />
          <h3 className="font-serif text-lg text-white font-light">External Purchase Architecture</h3>
        </div>

        <p className="text-xs text-white/70 font-sans leading-relaxed">
          LUXORA operates as an exclusive editorial catalog storefront with direct external fulfillment. All payments, checkout processing, and shipping tracking occur on certified partner platforms (such as Amazon, Flipkart, Meesho, or your custom merchant site).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3 bg-[#0a0a0c] border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-accent text-emerald-400 font-bold block">1. Zero Payment Burden</span>
            <p className="text-[11px] text-white/50">No credit card credentials, bank APIs, or payment gateways stored on this server.</p>
          </div>

          <div className="p-3 bg-[#0a0a0c] border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-accent text-[#c5a059] font-bold block">2. Direct Affiliate / Store Routing</span>
            <p className="text-[11px] text-white/50">Customers clicking "PURCHASE NOW" immediately open the destination URL in a new tab.</p>
          </div>

          <div className="p-3 bg-[#0a0a0c] border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-accent text-purple-400 font-bold block">3. Full Dynamic Catalog</span>
            <p className="text-[11px] text-white/50">Every piece added or updated in this admin portal syncs live to all customer views.</p>
          </div>
        </div>
      </div>

      {/* 2. Catalog Backup & Export */}
      <div className="bg-[#111116] border border-white/10 p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <Server className="w-4 h-4 text-[#c5a059]" />
          <h3 className="font-serif text-lg text-white font-light">Catalog Backup &amp; Data Portability</h3>
        </div>

        <p className="text-xs text-white/70 font-sans leading-relaxed">
          Export your current collection of <strong className="text-white">{products.length} products</strong> and <strong className="text-white">{categories.length} categories</strong> for backup, migration, or external spreadsheet sync.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExportJson}
            className="px-5 py-2.5 bg-white/10 hover:bg-white text-white hover:text-black font-accent text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Catalog JSON</span>
          </button>

          <button
            onClick={handleCopyJson}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-accent uppercase tracking-wider border border-white/10 transition-colors flex items-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy JSON Data'}</span>
          </button>

          <button
            onClick={() => setShowImportBox(!showImportBox)}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-accent uppercase tracking-wider border border-white/10 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{showImportBox ? 'Hide Import Box' : 'Import JSON Data'}</span>
          </button>
        </div>

        {/* Import JSON Box */}
        {showImportBox && (
          <div className="p-4 bg-[#0a0a0c] border border-white/15 space-y-3 mt-4">
            <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70">
              Paste JSON Catalog Payload
            </label>
            <textarea
              rows={5}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{ "products": [...], "categories": [...] }'
              className="w-full p-3 bg-[#111116] border border-white/10 text-xs text-white font-mono focus:outline-none"
            />
            <button
              onClick={handleImportJson}
              className="px-5 py-2 bg-[#c5a059] text-black font-accent text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
            >
              Apply JSON Import
            </button>
          </div>
        )}
      </div>

      {/* 3. Factory Reset */}
      <div className="bg-[#111116] border border-red-500/20 p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <RotateCcw className="w-4 h-4 text-red-400" />
          <h3 className="font-serif text-lg text-white font-light">Restore Factory Catalog Defaults</h3>
        </div>

        <p className="text-xs text-white/70 font-sans leading-relaxed">
          Restore the initial luxury Autumn/Winter 2026 showcase collection (8 mastercrafted runway pieces with preconfigured Amazon, Flipkart, and Meesho demo purchase destinations).
        </p>

        <div>
          <button
            onClick={() => setShowResetModal(true)}
            className="px-5 py-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-accent uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Catalog to Factory State</span>
          </button>
        </div>
      </div>

      {/* Factory Reset Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#141419] border border-red-500/40 p-6 max-w-md w-full shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-serif text-lg text-white">Reset to Default Catalog?</h3>
              </div>
              <p className="text-xs text-white/70 font-sans leading-relaxed">
                This action will restore the original 8 curated LUXORA creations and reset categories. Any custom products you created will be replaced with initial default values.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-accent uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteReset}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-accent font-bold uppercase tracking-wider"
                >
                  Reset Catalog
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
