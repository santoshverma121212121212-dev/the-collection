import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  Key, 
  Check, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminAccount } from '../../types';

export const AdminUsers: React.FC = () => {
  const { adminUser, csrfToken, showToast } = useStore();
  const [users, setUsers] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New user form modal/state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'super_admin' | 'editor'>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
          password: newPassword,
          role: newRole
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast({
          title: 'Account Created',
          message: `Administrator "${newUsername}" added to database.`,
          type: 'success'
        });
        setShowAddForm(false);
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        fetchUsers();
      } else {
        setErrorMsg(data.message || 'Failed to create user account.');
      }
    } catch {
      setErrorMsg('Server communication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: AdminAccount) => {
    if (!window.confirm(`Are you sure you want to revoke and delete admin account "${user.username}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {})
        },
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok) {
        showToast({
          title: 'Account Deleted',
          message: `Administrator "${user.username}" removed.`,
          type: 'info'
        });
        fetchUsers();
      } else {
        showToast({
          title: 'Action Failed',
          message: data.message || 'Could not delete user.',
          type: 'error'
        });
      }
    } catch {
      showToast({
        title: 'Error',
        message: 'Could not connect to server.',
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl font-light text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#c5a059]" />
            <span>Administrator Accounts & Roles</span>
          </h1>
          <p className="text-xs text-white/50 mt-1 font-sans">
            Manage staff credentials and role-based permissions (Super Admin / Editor) stored in the SQL database.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-[#c5a059] text-black font-accent font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-white transition-colors cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Administrator</span>
        </button>
      </div>

      {/* Add User Modal / Inline Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111116] border border-[#c5a059]/40 p-5 shadow-2xl"
        >
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <h2 className="text-sm font-accent uppercase tracking-wider text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#c5a059]" />
              <span>Create New Staff Administrator</span>
            </h2>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-white/50 hover:text-white"
            >
              Cancel
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="e.g. fashion_editor"
                className="w-full px-3 py-2 bg-[#070709] border border-white/15 text-white focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="editor@luxora.in"
                className="w-full px-3 py-2 bg-[#070709] border border-white/15 text-white focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1">
                Passcode (Min 6 Characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 bg-[#070709] border border-white/15 text-white focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-accent uppercase tracking-wider text-white/70 mb-1">
                Administrative Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#070709] border border-white/15 text-white focus:outline-none focus:border-[#c5a059]"
              >
                <option value="editor">Catalog Editor (Manage products & links)</option>
                <option value="super_admin">Super Administrator (Full system privileges)</option>
              </select>
            </div>

            <div className="sm:col-span-2 pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-accent uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#c5a059] text-black font-bold text-xs font-accent uppercase tracking-wider hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Saving to Database...' : 'Create Account'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Users Table */}
      <div className="bg-[#111116] border border-white/10 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-[#0a0a0d] border-b border-white/10 text-white/50 text-[10px] font-accent uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Last Active</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-white/40">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#c5a059]" />
                  <span>Loading administrators...</span>
                </td>
              </tr>
            ) : (
              users.map((usr) => (
                <tr key={usr.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#c5a059]/20 text-[#c5a059] font-bold text-xs flex items-center justify-center font-serif">
                      {usr.username[0].toUpperCase()}
                    </div>
                    <span>{usr.username}</span>
                  </td>
                  <td className="py-3.5 px-4 text-white/80">{usr.email}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 text-[10px] border uppercase tracking-wider font-accent ${
                      usr.role === 'super_admin'
                        ? 'bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/40 font-bold'
                        : 'bg-white/10 text-white/80 border-white/20'
                    }`}>
                      {usr.role === 'super_admin' ? 'Super Admin' : 'Editor'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-white/50 text-[11px] font-mono">
                    {usr.last_login_at ? new Date(usr.last_login_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {usr.username !== 'admin' && usr.id !== adminUser?.id && (
                      <button
                        onClick={() => handleDeleteUser(usr)}
                        title="Delete administrator"
                        className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
