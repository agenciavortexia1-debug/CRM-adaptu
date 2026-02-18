
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Collaborator, AppSettings } from '../types';
import { IconTrash, IconPlus } from './Icons';

const supabase = createClient('https://qxihfpviufppdscsetbs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aWhmcHZpdWZwcGRzY3NldGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzMxMzgsImV4cCI6MjA4NjUwOTEzOH0.YyvQh61ow7aP2670Ct157K_mBZjyvPZdvbtEdqkReB8');

interface SettingsProps {
  collaborators: Collaborator[];
  settings: AppSettings;
  onAddCollaborator: () => void;
  onRemoveCollaborator: () => void;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  collaborators,
  settings,
  onAddCollaborator,
  onRemoveCollaborator,
  onUpdateSettings,
}) => {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      await supabase.from('collaborators').insert([{ name: newName, color: newColor }]);
      onAddCollaborator();
      setNewName('');
    }
  };

  const handleRemove = async (id: string) => {
    if (confirm('Remover este consultor? Leads atribuídos ficarão órfãos.')) {
      await supabase.from('collaborators').delete().eq('id', id);
      onRemoveCollaborator();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <h3 className="text-lg font-black uppercase mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">Equipe (Etiquetas)</h3>
        <form onSubmit={handleSubmit} className="mb-8 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Nome do Consultor</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 px-4 py-3 text-sm font-bold focus:ring-0 focus:border-slate-900 dark:focus:border-white" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Cor da Etiqueta</label>
            <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-full h-12 p-1 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800" />
          </div>
          <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-4 text-xs uppercase tracking-[0.3em] shadow-lg">Adicionar Colaborador</button>
        </form>

        <div className="space-y-3">
          {collaborators.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 border-2 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4" style={{ backgroundColor: c.color }} />
                <span className="text-sm font-black uppercase tracking-tight">{c.name}</span>
              </div>
              <button onClick={() => handleRemove(c.id)} className="text-slate-400 hover:text-red-500 transition-colors"><IconTrash /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <h3 className="text-lg font-black uppercase mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">Regras de Automação</h3>
        <div className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-4">Threshold de Follow-up ({settings.followUpThresholdDays} dias)</label>
            <input type="range" min="1" max="60" value={settings.followUpThresholdDays} onChange={(e) => onUpdateSettings({ ...settings, followUpThresholdDays: parseInt(e.target.value) })} className="w-full accent-slate-900 dark:accent-white" />
            <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest italic leading-relaxed">* Leads inativos por este período serão movidos automaticamente para a aba de Follow-up.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
