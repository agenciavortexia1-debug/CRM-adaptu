
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User } from '../types';

const SUPABASE_URL = 'https://qxihfpviufppdscsetbs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aWhmcHZpdWZwcGRzY3NldGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzMxMzgsImV4cCI6MjA4NjUwOTEzOH0.YyvQh61ow7aP2670Ct157K_mBZjyvPZdvbtEdqkReB8';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('system_users')
        .select('*')
        .eq('password_hash', password)
        .single();

      if (fetchError || !data) {
        setError('SENHA INCORRETA');
      } else {
        onLogin(data);
      }
    } catch (err) {
      setError('ERRO DE CONEXÃO');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-8 md:p-12 border-t-8 border-slate-900 dark:border-white shadow-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
            CRM ADAPTU
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Acesso de Segurança
            </label>
            <input 
              autoFocus
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 px-5 py-4 text-center font-black tracking-[0.5em] focus:ring-0 focus:border-slate-900 dark:focus:border-white transition-all uppercase"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-[10px] font-black p-3 text-center border border-red-100 dark:border-red-900/50 uppercase tracking-widest">
              {error}
            </div>
          )}

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-5 text-xs uppercase tracking-[0.4em] shadow-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
          </button>
        </form>
      </div>
      <p className="mt-8 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
        © 2025 ADAPTU CRM - Todos os direitos reservados
      </p>
    </div>
  );
};
