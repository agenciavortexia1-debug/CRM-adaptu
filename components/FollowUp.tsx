
import React, { useMemo } from 'react';
import { Lead, Collaborator, AppSettings, LeadStatus } from '../types';
import { LeadCard } from './LeadCard';

interface FollowUpProps {
  leads: Lead[];
  collaborators: Collaborator[];
  settings: AppSettings;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onAssignCollaborator: (leadId: string, collaboratorId: string) => void;
  // Fix: Added missing onViewHistory to FollowUpProps
  onViewHistory: (leadId: string) => void;
}

export const FollowUp: React.FC<FollowUpProps> = ({ 
  leads, 
  collaborators, 
  settings, 
  onStatusChange,
  onAssignCollaborator,
  // Fix: Added missing onViewHistory to destructuring
  onViewHistory
}) => {
  const staleLeads = useMemo(() => {
    const now = new Date();
    const thresholdMs = settings.followUpThresholdDays * 24 * 60 * 60 * 1000;
    
    return leads.filter(lead => {
      const lastUpdate = new Date(lead.lastUpdate);
      const diff = now.getTime() - lastUpdate.getTime();
      return diff > thresholdMs && lead.status !== 'ganho' && lead.status !== 'perda';
    });
  }, [leads, settings.followUpThresholdDays]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 border-l-4 border-amber-500 pl-4 py-2">
        <h2 className="text-2xl font-black uppercase">Fila de Reaquecimento</h2>
        <p className="text-slate-500 text-sm">Estes leads estão há mais de {settings.followUpThresholdDays} dias sem nenhuma atualização de status.</p>
      </div>

      {staleLeads.length === 0 ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-12 text-center">
          <p className="text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-widest">Pipeline em dia!</p>
          <p className="text-emerald-600/60 dark:text-emerald-400/60 text-xs mt-1 italic">Nenhum cliente precisando de atenção urgente no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {staleLeads.map(lead => (
            <LeadCard 
              key={lead.id}
              lead={lead}
              collaborators={collaborators}
              onStatusChange={onStatusChange}
              onAssignCollaborator={onAssignCollaborator}
              // Fix: Added missing onViewHistory to LeadCard
              onViewHistory={onViewHistory}
            />
          ))}
        </div>
      )}
    </div>
  );
};
