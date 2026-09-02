import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  RefreshCw, 
  Search, 
  Clock, 
  User, 
  Globe, 
  FileText,
  Filter
} from 'lucide-react';
import { AuditLog } from '../../types';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs?limit=100', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.admin_username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entity_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes('FAILED') || action.includes('DELETED')) {
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
    if (action.includes('SUCCESS') || action.includes('CREATED')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (action.includes('UPDATED')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    return 'bg-white/10 text-white/80 border-white/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl font-light text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-[#c5a059]" />
            <span>Security & Audit Trails</span>
          </h1>
          <p className="text-xs text-white/50 mt-1 font-sans">
            Immutable server-side event logs recorded directly in the SQLite database for compliance and traceability.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs font-accent uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[#111116] border border-white/5 p-3.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, administrator, entity, or keyword..."
            className="w-full pl-9 pr-3 py-2 bg-[#070709] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#c5a059]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/40" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#070709] border border-white/10 text-xs text-white/80 py-2 px-3 focus:outline-none focus:border-[#c5a059]"
          >
            <option value="all">All Actions</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="PRODUCT_CREATED">PRODUCT_CREATED</option>
            <option value="PRODUCT_UPDATED">PRODUCT_UPDATED</option>
            <option value="PRODUCT_DELETED">PRODUCT_DELETED</option>
            <option value="CATEGORY_CREATED">CATEGORY_CREATED</option>
            <option value="CATALOG_FACTORY_RESET">CATALOG_FACTORY_RESET</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#111116] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#0a0a0d] border-b border-white/10 text-white/50 text-[10px] font-accent uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-white/40">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#c5a059]" />
                    <span>Loading security audit records...</span>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-white/40 font-sans">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-white/60 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[10px] border uppercase tracking-wider font-accent ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-medium whitespace-nowrap">
                      {log.admin_username || 'Guest / System'}
                    </td>
                    <td className="py-3 px-4 text-[#c5a059] whitespace-nowrap">
                      {log.entity_type} {log.entity_id ? `(${log.entity_id})` : ''}
                    </td>
                    <td className="py-3 px-4 text-white/80 max-w-xs truncate font-sans text-xs" title={log.details || ''}>
                      {log.details || '—'}
                    </td>
                    <td className="py-3 px-4 text-white/40 whitespace-nowrap">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
