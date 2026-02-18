
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LeadHistory } from '../types';

const SUPABASE_URL = 'https://qxihfpviufppdscsetbs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aWhmcHZpdWZwcGRzY3NldGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzMxMzgsImV4cCI6MjA4NjUwOTEzOH0.YyvQh61ow7aP2670Ct157K_mBZjyvPZdvbtEdqkReB8';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface HistoryModalProps {
  leadId: string;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ leadId, onClose }) => {
  const [logs, setLogs] = useState<LeadHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('lead_history')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setLogs(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [leadId]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[80vh] flex flex-col border-t-8 border-slate-900 dark:border-white shadow-2xl">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-black uppercase tracking-tight">Histórico de Movimentações</h2>
          <button onClick={onClose} className="text-xs font-black uppercase text-slate-400 hover:text-slate-900 dark:hover:text-white">Fechar</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-xs font-black uppercase animate-pulse">Carregando histórico...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <span className="text-xs font-black uppercase tracking-widest italic">Nenhum registro encontrado</span>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-8">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-8">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 bg-slate-900 dark:bg-white" />
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-1">
                    {new Date(log.created_at).toLocaleString('pt-BR')} • {log.user_name || 'Sistema'}
                  </div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800">
                    {log.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
