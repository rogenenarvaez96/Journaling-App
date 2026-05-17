import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';
import { Users, UserPlus, Power, LogOut, Search, Trash2, KeyRound, Settings as SettingsIcon, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SERVER_URL } from '../config';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { settings, fetchSettings } = useSettings();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'settings'
  
  // Settings Form State
  const [appName, setAppName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef(null);
  
  // New User Form State
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });

  useEffect(() => {
    if (settings) {
      setAppName(settings.appName || '');
      setSlogan(settings.slogan || '');
      setRegistrationEnabled(settings.registrationEnabled !== false);
    }
  }, [settings]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/users/${id}`, { active: !currentStatus });
      fetchUsers();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete");
      }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', formData);
      setShowModal(false);
      setFormData({ username: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create user");
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await api.put('/settings', { appName, slogan, registrationEnabled });
      await fetchSettings();
      alert("Settings saved successfully.");
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append("logo", file);

    try {
      await api.post('/settings/upload-logo', formData, {
        headers: { 'Content-Type': undefined } // let browser set boundary
      });
      await fetchSettings();
    } catch (err) {
      alert("Failed to upload logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone dark:bg-obsidian transition-colors duration-500 text-obsidian dark:text-stone p-6 md:p-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight mb-1">Admin Control</h1>
          <p className="text-sm opacity-60 flex items-center gap-2">
            <Users size={16} /> Managing system access
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-sm opacity-70 font-medium">Administrator {user?.username}</span>
          <button onClick={handleLogout} className="p-2.5 bg-white/50 dark:bg-white/5 rounded-full hover:bg-terracotta hover:text-white transition-all shadow-sm">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-6">
        
        {/* Tabs */}
        <div className="flex gap-4 border-b border-black/10 dark:border-white/10 mb-8">
          <button 
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-2 font-medium transition-all ${activeTab === 'users' ? 'border-b-2 border-terracotta text-terracotta' : 'opacity-60 hover:opacity-100'}`}
          >
            <Users size={18} className="inline mr-2" /> User Management
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-2 font-medium transition-all ${activeTab === 'settings' ? 'border-b-2 border-terracotta text-terracotta' : 'opacity-60 hover:opacity-100'}`}
          >
            <SettingsIcon size={18} className="inline mr-2" /> Global Settings
          </button>
        </div>

        {activeTab === 'users' ? (
          <>
            {/* Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 dark:bg-obsidian-elevated p-4 rounded-2xl shadow-sm border border-black/5 dark:border-white/5">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={18} />
            <input 
              type="text" 
              placeholder="Search accounts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:ring-2 focus:ring-terracotta/50 rounded-xl transition-all"
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-terracotta hover:bg-terracotta/90 text-white rounded-xl transition-all shadow-sm shadow-terracotta/20 spring-hover"
          >
            <UserPlus size={18} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white/50 dark:bg-obsidian-elevated rounded-3xl overflow-hidden shadow-xl border border-black/5 dark:border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 text-xs uppercase tracking-wider opacity-60">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Joined</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{u.username}</div>
                      <div className="text-xs opacity-60">{u.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-md ${u.role === 'admin' ? 'bg-amethyst/20 text-amethyst' : 'bg-black/10 dark:bg-white/10'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleToggleActive(u._id, u.active)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${u.active ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}
                      >
                        <Power size={12} />
                        {u.active ? 'Active' : 'Suspended'}
                      </button>
                    </td>
                    <td className="p-4 text-sm opacity-70">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      {/* Password Reset Placeholder Button */}
                      <button className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-70 hover:opacity-100" title="Reset Password">
                        <KeyRound size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(u._id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors opacity-70 hover:opacity-100" 
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center opacity-50">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
          </>
        ) : (
          <div className="bg-white/50 dark:bg-obsidian-elevated p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm max-w-2xl mx-auto">
            <h2 className="text-2xl font-serif font-bold mb-6">App Branding</h2>
            
            <div className="mb-8">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">App Logo</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center overflow-hidden">
                  {settings?.logoUrl ? (
                    <img src={`${SERVER_URL}${settings.logoUrl}`} alt="App Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={32} className="opacity-30" />
                  )}
                </div>
                <div>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleLogoUpload} />
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    disabled={isUploadingLogo}
                    className="px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
                  >
                    {isUploadingLogo ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                    Upload New Logo
                  </button>
                  <p className="text-xs opacity-50 mt-2">Publicly visible on the login page.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">App Name</label>
                <input 
                  type="text" 
                  value={appName} 
                  onChange={e => setAppName(e.target.value)} 
                  className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 rounded-xl focus:ring-2 focus:ring-terracotta/50 outline-none" 
                  placeholder="e.g. Journal."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Slogan</label>
                <input 
                  type="text" 
                  value={slogan} 
                  onChange={e => setSlogan(e.target.value)} 
                  className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 rounded-xl focus:ring-2 focus:ring-terracotta/50 outline-none" 
                  placeholder="e.g. Your private collection of memories"
                />
              </div>

              {/* Registration Toggle */}
              <div className="pt-4 border-t border-black/10 dark:border-white/10">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-semibold text-sm">Public Registration</div>
                    <div className="text-xs opacity-60 mt-0.5">Allow new users to sign up from the login page.</div>
                  </div>
                  <div className={`relative w-12 h-6 transition-colors rounded-full ${registrationEnabled ? 'bg-terracotta' : 'bg-black/20 dark:bg-white/20'}`}>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={registrationEnabled} 
                      onChange={(e) => setRegistrationEnabled(e.target.checked)} 
                    />
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${registrationEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isSavingSettings}
                className="w-full py-3 bg-terracotta hover:bg-terracotta/90 text-white rounded-xl font-medium shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {isSavingSettings ? <Loader2 size={18} className="animate-spin" /> : "Save Branding Settings"}
              </button>
            </form>
          </div>
        )}

      </main>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-stone dark:bg-obsidian-elevated w-full max-w-md rounded-3xl p-6 shadow-2xl border border-black/10 dark:border-white/10 scale-in-center">
            <h2 className="text-xl font-serif font-bold mb-6">Create New Account</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Username</label>
                <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/20 rounded-xl focus:ring-2 focus:ring-terracotta/50 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/20 rounded-xl focus:ring-2 focus:ring-terracotta/50 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Password</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/20 rounded-xl focus:ring-2 focus:ring-terracotta/50 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/20 rounded-xl focus:ring-2 focus:ring-terracotta/50 outline-none appearance-none">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-terracotta hover:bg-terracotta/90 text-white rounded-xl font-medium shadow-md transition-colors">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
