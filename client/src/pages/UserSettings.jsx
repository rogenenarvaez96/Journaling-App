import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Settings, KeyRound, Save, Download, Upload, ShieldCheck, Loader2, X, AlertTriangle } from 'lucide-react';

const UserSettings = () => {
  const { user } = useAuth();
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Backup State
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [backupPassword, setBackupPassword] = useState('');
  const [importStrategy, setImportStrategy] = useState('merge');
  const [importFile, setImportFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMsg({ type: '', text: '' });

    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordMsg({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update password.' 
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportBackup = async (e) => {
    e.preventDefault();
    if (!backupPassword) return alert("Please enter a password to lock your backup.");
    
    setIsExporting(true);
    try {
      const response = await api.post('/settings/backup/export', { password: backupPassword }, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `journal_backup_${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setShowExportModal(false);
      setBackupPassword('');
    } catch (error) {
      alert("Failed to export backup. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
      setShowImportModal(true);
    }
  };

  const handleImportBackup = async (e) => {
    e.preventDefault();
    if (!importFile || !backupPassword) return alert("Please provide both the backup file and its password.");
    
    setIsImporting(true);
    const formData = new FormData();
    formData.append('backup', importFile);
    formData.append('password', backupPassword);
    formData.append('strategy', importStrategy);

    try {
      await api.post('/settings/backup/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Backup successfully restored!");
      setShowImportModal(false);
      setImportFile(null);
      setBackupPassword('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      alert(error.response?.data?.message || "Failed to restore backup. Check your password.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone dark:bg-obsidian transition-colors duration-500 text-obsidian dark:text-stone p-6 md:p-12">
      <header className="mb-12 max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-bold tracking-tight mb-1">User Settings</h1>
        <p className="text-sm opacity-60 flex items-center gap-2">
          <Settings size={16} /> Manage your account and data
        </p>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Security / Password Panel */}
        <section className="bg-white/50 dark:bg-obsidian-elevated p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amethyst/10 flex items-center justify-center text-amethyst">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-xl font-serif font-semibold">Security</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Current Password</label>
              <input 
                type="password" 
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/20 rounded-xl focus:ring-2 focus:ring-terracotta/50 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">New Password</label>
              <input 
                type="password" 
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/20 rounded-xl focus:ring-2 focus:ring-terracotta/50 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Confirm New Password</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/20 rounded-xl focus:ring-2 focus:ring-terracotta/50 outline-none transition-all" 
              />
            </div>

            {passwordMsg.text && (
              <div className={`p-3 rounded-xl text-sm font-medium ${passwordMsg.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                {passwordMsg.text}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isChangingPassword}
              className="w-full py-3 mt-2 bg-terracotta hover:bg-terracotta/90 text-white rounded-xl font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {isChangingPassword ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
              Update Password
            </button>
          </form>
        </section>

        {/* Data Management Panel */}
        <section className="bg-white/50 dark:bg-obsidian-elevated p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-terracotta/10 flex items-center justify-center text-terracotta">
              <Save size={20} />
            </div>
            <h2 className="text-xl font-serif font-semibold">Data & Backup</h2>
          </div>

          <p className="text-sm opacity-70 mb-8 leading-relaxed">
            Ensure your memories are safely backed up, or import entries from a previous archive.
          </p>

          <div className="space-y-4">
            <button 
              onClick={() => setShowExportModal(true)}
              className="w-full px-4 py-3 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Download size={18} />
              Export Journal Backup
            </button>
            
            <input 
              type="file" 
              accept=".zip" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Upload size={18} />
              Import Journal Backup
            </button>
          </div>
        </section>
      </main>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-stone dark:bg-obsidian-elevated w-full max-w-md p-8 rounded-3xl shadow-2xl relative border border-black/10 dark:border-white/10">
            <button onClick={() => setShowExportModal(false)} className="absolute top-6 right-6 opacity-50 hover:opacity-100 transition-opacity">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-serif font-bold mb-2">Secure Backup</h3>
            <p className="text-sm opacity-70 mb-6 leading-relaxed">
              Your backup file will be encrypted. Please set a password to lock this .zip file. You will need this password to restore it.
            </p>
            <form onSubmit={handleExportBackup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Backup Password</label>
                <input 
                  type="password" 
                  required
                  value={backupPassword}
                  onChange={e => setBackupPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/20 rounded-xl focus:ring-2 focus:ring-terracotta/50 outline-none transition-all" 
                />
              </div>
              <button 
                type="submit" 
                disabled={isExporting}
                className="w-full py-3 bg-terracotta hover:bg-terracotta/90 text-white rounded-xl font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {isExporting ? 'Generating Archive...' : 'Download Secure Backup'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-stone dark:bg-obsidian-elevated w-full max-w-md p-8 rounded-3xl shadow-2xl relative border border-black/10 dark:border-white/10">
            <button onClick={() => { setShowImportModal(false); setImportFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-6 right-6 opacity-50 hover:opacity-100 transition-opacity">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-serif font-bold mb-2">Restore Backup</h3>
            <p className="text-sm opacity-70 mb-6 leading-relaxed flex items-center gap-2">
              File: <span className="font-semibold">{importFile?.name}</span>
            </p>
            
            <form onSubmit={handleImportBackup} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Backup Password</label>
                <input 
                  type="password" 
                  required
                  value={backupPassword}
                  onChange={e => setBackupPassword(e.target.value)}
                  placeholder="Enter archive password"
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/20 rounded-xl focus:ring-2 focus:ring-terracotta/50 outline-none transition-all" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">Import Strategy</label>
                <div className="space-y-3">
                  <label className={`block border rounded-xl p-3 cursor-pointer transition-colors ${importStrategy === 'merge' ? 'border-terracotta bg-terracotta/5' : 'border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="strategy" value="merge" checked={importStrategy === 'merge'} onChange={() => setImportStrategy('merge')} className="accent-terracotta" />
                      <div>
                        <div className="font-semibold text-sm">Smart Merge (Recommended)</div>
                        <div className="text-xs opacity-60 mt-0.5">Keeps recent edits and prevents duplicates.</div>
                      </div>
                    </div>
                  </label>

                  <label className={`block border rounded-xl p-3 cursor-pointer transition-colors ${importStrategy === 'rollback' ? 'border-red-500 bg-red-500/5' : 'border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="strategy" value="rollback" checked={importStrategy === 'rollback'} onChange={() => setImportStrategy('rollback')} className="accent-red-500" />
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-1 text-red-500"><AlertTriangle size={12}/> Force Rollback</div>
                        <div className="text-xs opacity-60 mt-0.5">Wipes current journal and forces exact backup state.</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isImporting}
                className="w-full py-3 bg-terracotta hover:bg-terracotta/90 text-white rounded-xl font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                {isImporting ? 'Restoring Data...' : 'Confirm Restore'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserSettings;
