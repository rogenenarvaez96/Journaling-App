import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Book, Image as ImageIcon, BarChart2, Archive, LogOut, Shield, Sun, Moon, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { SERVER_URL } from '../config';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${
      isActive 
        ? 'bg-terracotta text-white shadow-md' 
        : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
    }`;

  return (
    <nav className="w-full bg-stone dark:bg-obsidian border-b border-black/5 dark:border-white/5 px-6 py-4 sticky top-0 z-50 flex items-center justify-between transition-colors duration-500 text-obsidian dark:text-stone">
      <div className="flex items-center gap-8">
        <div className="font-serif font-bold text-xl tracking-tight flex items-center gap-2">
          {settings?.logoUrl ? (
            <img src={`${SERVER_URL}${settings.logoUrl}`} alt="Logo" className="w-6 h-6 object-cover rounded-md" />
          ) : (
            <Book size={20} className="text-terracotta" />
          )}
          {settings?.appName || "Journal."}
        </div>
        
        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/journal" end className={navClass}><Book size={16} /> Journals</NavLink>
          <NavLink to="/gallery" className={navClass}><ImageIcon size={16} /> Gallery</NavLink>
          <NavLink to="/analytics" className={navClass}><BarChart2 size={16} /> Analytics</NavLink>
          <NavLink to="/archive" className={navClass}><Archive size={16} /> Archive</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navClass}><Shield size={16} /> Admin</NavLink>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Toggle Theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className="w-px h-6 bg-black/10 dark:bg-white/10"></div>
        <span className="text-sm opacity-60 hidden sm:block">{user?.username}</span>
        <button onClick={() => navigate('/settings')} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Settings">
          <Settings size={16} />
        </button>
        <button onClick={handleLogout} className="hidden sm:block p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-terracotta hover:text-white transition-colors" title="Log Out">
          <LogOut size={16} />
        </button>
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="md:hidden p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-stone dark:bg-obsidian border-b border-black/5 dark:border-white/5 p-4 flex flex-col gap-2 md:hidden shadow-xl shadow-black/5 animate-in slide-in-from-top-2">
          <NavLink to="/journal" end onClick={() => setIsMobileMenuOpen(false)} className={navClass}><Book size={16} /> Journals</NavLink>
          <NavLink to="/gallery" onClick={() => setIsMobileMenuOpen(false)} className={navClass}><ImageIcon size={16} /> Gallery</NavLink>
          <NavLink to="/analytics" onClick={() => setIsMobileMenuOpen(false)} className={navClass}><BarChart2 size={16} /> Analytics</NavLink>
          <NavLink to="/archive" onClick={() => setIsMobileMenuOpen(false)} className={navClass}><Archive size={16} /> Archive</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" onClick={() => setIsMobileMenuOpen(false)} className={navClass}><Shield size={16} /> Admin</NavLink>
          )}
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 mt-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-medium text-left">
            <LogOut size={16} /> Log Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
