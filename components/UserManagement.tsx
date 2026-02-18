
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, UserRole } from '../types';
import { IconTrash } from './Icons';

const SUPABASE_URL = 'https://qxihfpviufppdscsetbs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aWhmcHZpdWZwcGRzY3NldGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzMxMzgsImV4cCI6MjA4NjUwOTEzOH0.YyvQh61ow7aP2670Ct157K_mBZjyvPZdvbtEdqkReB8';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    const { data } = await supabase.from('system_users').select('*').order('name');
    if (data) setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) return;
    setLoading(true);
    await supabase.from('system_users').insert([{ name, password_hash: password, role }]);
    setName('');
    setPassword('');
    setRole('user');
    fetchUsers();
    setLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Deseja realmente remover este acesso?')) return;
    await supabase.from('system_users').delete().eq('id', id);
    fetchUsers();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <h3 className="text-lg font-black uppercase mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">Cadastrar Acesso</h3>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Nome do Usuário</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 px-4 py-3 text-sm font-bold focus:ring-0 focus:border-slate-900 dark:focus:border-white uppercase" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Senha de Acesso</label>
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 px-4 py-3 text-sm font-bold focus:ring-0 focus:border-slate-900 dark:focus:border-white" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Nível de Permissão</label>
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 px-4 py-3 text-sm font-bold focus:ring-0 focus:border-slate-900 dark:focus:border-white uppercase">
              <option value="user">Colaborador (Sem KPIs/Acessos)</option>
              <option value="admin">Administrador (Acesso Total)</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-4 text-xs uppercase tracking-[0.3em] shadow-lg disabled:opacity-50">Criar Usuário</button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <h3 className="text-lg font-black uppercase mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">Usuários Ativos</h3>
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-4 border-2 border-slate-100 dark:border-slate-800">
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-tight">{u.name}</span>
                <span className={`text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'text-amber-500' : 'text-slate-400'}`}>
                  {u.role === 'admin' ? 'Administrador' : 'Colaborador'}
                </span>
              </div>
              <button onClick={() => handleDeleteUser(u.id)} className="text-slate-400 hover:text-red-500 transition-colors"><IconTrash /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
