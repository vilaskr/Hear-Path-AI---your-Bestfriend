import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';

interface AuthProps {
  onAuth: (user: User) => void;
  onContinueGuest: () => void;
  isSupabaseMissing: boolean;
  onShowSetup: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuth, onContinueGuest, isSupabaseMissing, onShowSetup }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase is not configured yet. Please use Guest Mode or check setup.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) onAuth({ id: data.user.id, email: data.user.email! });
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) onAuth({ id: data.user.id, email: data.user.email! });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-black">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />

      <div className="max-w-md w-full p-8 rounded-[48px] border border-white/10 bg-zinc-900/40 backdrop-blur-3xl space-y-10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-[28px] mx-auto flex items-center justify-center text-4xl shadow-2xl shadow-indigo-500/20 float-slow">
            ❤️
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">HeartPath</h1>
            <p className="text-zinc-500 text-sm font-medium">Safe space developed by <span className="text-zinc-300">Vilas K R</span></p>
          </div>
        </div>

        {isSupabaseMissing && (
          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-5 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 text-center">Supabase Not Connected</p>
            <p className="text-[11px] text-zinc-400 text-center leading-relaxed">The cloud database is not configured. You can use the app in <b>Standalone Mode</b> (LocalStorage) or finish the setup.</p>
            <div className="flex gap-2">
              <button 
                onClick={onContinueGuest}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
              >
                Use Standalone
              </button>
              <button 
                onClick={onShowSetup}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg"
              >
                Setup Guide
              </button>
            </div>
          </div>
        )}

        {!isSupabaseMissing && (
          <>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-bold ml-2 text-zinc-500 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-3xl bg-black/40 border border-white/5 focus:border-indigo-500/50 transition-all outline-none text-[15px] placeholder:text-zinc-700"
                  placeholder="you@heartpath.ai"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold ml-2 text-zinc-500 uppercase tracking-widest">Secret Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 rounded-3xl bg-black/40 border border-white/5 focus:border-indigo-500/50 transition-all outline-none text-[15px] placeholder:text-zinc-700"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-white text-black rounded-3xl font-extrabold text-lg shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isLogin ? 'Enter Space' : 'Create Account')}
              </button>
            </form>

            <div className="text-center pt-2">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
              >
                {isLogin ? "New here? Create account" : "Already a member? Sign in"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;