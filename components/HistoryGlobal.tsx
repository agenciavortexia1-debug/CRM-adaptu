
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LeadHistory } from '../types';

const SUPABASE_URL = 'https://qxihfpviufppdscsetbs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aWhmcHZpdWZwcGRzY3NldGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzMxMzgsImV4cCI6MjA4NjUwOTEzOH0.YyvQh61ow7aP2670Ct157K_mBZjyvPZdvbtEdqkReB8';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const HistoryGlobal: React.FC = () => {
  const [logs, setLogs] = useState<LeadHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('lead_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (!error && data) setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
    const sub = supabase.channel('history_global').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lead_history' }, () => fetchHistory()).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-8 border-l-4 border-slate-900 dark:border-white pl-4 py-2">
        <h2 className="text-2xl font-black uppercase">Fluxo de Atividades</h2>
        <p className="text-slate-500 text-sm italic">Últimas 50 movimentações registradas no sistema.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center font-black uppercase text-xs animate-pulse">Carregando fluxo...</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {logs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{log.description}</span>
                  <span className="text-[10px] font-black uppercase text-slate-400 mt-1 tracking-widest">
                    Por: {log.user_name || 'Sistema'}
                  </span>
                </div>
                <div className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 self-start md:self-center">
                  {new Date(log.created_at).toLocaleString('pt-BR')}
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="p-20 text-center text-slate-400 font-bold uppercase text-xs italic">Nenhuma atividade registrada ainda.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
