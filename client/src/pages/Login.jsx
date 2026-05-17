import React, { useState } from 'react';
import { BookKey, ArrowRight, Moon, Sun, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useNavigate, Link } from 'react-router-dom';
import { SERVER_URL } from '../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSettings();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      // Role-based routing is handled by the ProtectedRoute if they go to /journal, 
      // but let's push them directly for better UX
      navigate('/journal');
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-terracotta/10 dark:bg-terracotta/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amethyst/10 dark:bg-amethyst/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="w-full max-w-md bg-white/50 dark:bg-obsidian-elevated/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-black/5 dark:border-white/5 spring-hover">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-terracotta text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-terracotta/30 rotate-3 overflow-hidden">
            {settings?.logoUrl ? (
              <img src={`${SERVER_URL}${settings.logoUrl}`} alt="App Logo" className="w-full h-full object-cover -rotate-3 scale-110" />
            ) : (
              <BookKey size={32} className="-rotate-3" />
            )}
          </div>
          <h1 className="font-serif text-3xl font-semibold text-center tracking-tight mb-2">{settings?.appName || "Private Journal"}</h1>
          <p className="font-sans text-sm opacity-60 text-center">{settings?.slogan || "Enter your credentials to continue"}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm font-sans border border-red-500/20">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-all font-sans"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-all font-sans"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-terracotta hover:bg-terracotta/90 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-terracotta/20 hover:shadow-lg hover:shadow-terracotta/30 group"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
            {!isSubmitting && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 text-center space-y-2">
          {(settings?.registrationEnabled || settings?.isFirstRun) && (
            <p className="text-sm opacity-70 font-sans mb-4">
              Don't have an account? <Link to="/register" className="text-terracotta hover:underline font-semibold">Register here</Link>
            </p>
          )}
          <p className="text-xs opacity-50 font-sans">Access is strictly limited to authorized personnel.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
