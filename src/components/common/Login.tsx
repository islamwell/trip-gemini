import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { sendMagicLink, signInWithPassword } = useAuth();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      if (usePassword) {
        await signInWithPassword(email, password);
      } else {
        await sendMagicLink(email);
        setMessage('Magic link sent! Check your email to sign in.');
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md glass p-8 rounded-2xl shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mb-4">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xl">
              OG
            </div>
          </div>
          <h1 className="text-2xl font-bold">{t('auth.login')}</h1>
          <p className="text-slate-500 mt-2">Sign in to manage your trip details</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>

          {usePassword && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                {t('auth.password') || 'Password'}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-card-border bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed hover-lift"
            >
              {loading ? 'Processing...' : usePassword ? 'Sign In' : t('auth.send_link')}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setUsePassword(!usePassword);
                setMessage('');
              }}
              className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed hover-lift"
            >
              {usePassword ? 'Use Magic Link Login' : 'Login with Password'}
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm ${message.includes('Error') ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
