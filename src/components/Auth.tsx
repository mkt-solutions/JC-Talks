import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Mail, Lock, Sparkles, Loader2, Heart } from 'lucide-react';
import { Language } from '../types';

interface AuthProps {
  onAuthSuccess: (session: any) => void;
  t: (path: string) => string;
  lang: Language;
}

export function Auth({ onAuthSuccess, t, lang }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onAuthSuccess(data.session);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) {
          onAuthSuccess(data.session);
        } else {
          setError(t('auth.emailVerification'));
          setIsLogin(true); // Switch to login so they can try to sign in after confirming
        }
      }
    } catch (err: any) {
      setError(err.message || t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-[#E8D5C4]"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#B5835A] rounded-full mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#4A3728] mb-2">JC Talks</h1>
          <p className="text-[#8B735B]">{t(isLogin ? 'auth.welcome' : 'auth.join')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#4A3728] mb-1">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B5835A]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#FCF9F6] border border-[#E8D5C4] rounded-xl focus:ring-2 focus:ring-[#B5835A] focus:border-transparent transition-all outline-none"
                placeholder="exemplo@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A3728] mb-1">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B5835A]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#FCF9F6] border border-[#E8D5C4] rounded-xl focus:ring-2 focus:ring-[#B5835A] focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#B5835A] text-white rounded-xl font-semibold shadow-lg shadow-[#B5835A]/20 hover:bg-[#9A6D48] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {t(isLogin ? 'auth.signIn' : 'auth.signUp')}
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[#E8D5C4] pt-6">
          <p className="text-[#8B735B]">
            {t(isLogin ? 'auth.noAccount' : 'auth.hasAccount')}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#B5835A] font-semibold hover:underline"
            >
              {t(isLogin ? 'auth.signup' : 'auth.login')}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
