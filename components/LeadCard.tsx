
import React from 'react';
import { Lead, Collaborator, LeadStatus } from '../types';
import { STATUS_LABELS } from '../constants';
import { IconHistory } from './Icons';

interface LeadCardProps {
  lead: Lead;
  collaborators: Collaborator[];
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onAssignCollaborator: (leadId: string, collaboratorId: string) => void;
  onViewHistory: (leadId: string) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ 
  lead, 
  collaborators, 
  onStatusChange, 
  onAssignCollaborator,
  onViewHistory 
}) => {
  const currentCollaborator = collaborators.find(c => c.id === lead.collaboratorId);

  const formatRevenue = (val: string) => {
    const num = parseFloat(val.replace(/[^\d.-]/g, ''));
    if (!isNaN(num) && /^\d+$/.test(val.trim())) {
      return `R$ ${num.toLocaleString('pt-BR')}`;
    }
    if (val.toLowerCase().includes('k') || val.toLowerCase().includes('m')) {
        return val.toUpperCase();
    }
    return val;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-black text-sm leading-tight text-slate-950 dark:text-white uppercase tracking-tight">
          {lead.companyName}
        </h3>
        <button 
          onClick={() => onViewHistory(lead.id)}
          className="p-1 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Ver Histórico"
        >
          <IconHistory />
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-[9px] font-black px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
          {lead.segment}
        </span>
        <span className="text-[9px] font-black px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
          FATU. {formatRevenue(lead.averageRevenue)}
        </span>
      </div>

      <div className="mb-6">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic border-l-2 border-slate-200 dark:border-slate-800 pl-3 leading-relaxed">
          "{lead.operationDescription || 'Sem descrição'}"
        </p>
      </div>

      <div className="space-y-2 mb-4 border-t border-slate-50 dark:border-slate-800/50 pt-4">
        <div className="flex items-center justify-between">
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Responsável</span>
           <select
              value={lead.collaboratorId || ''}
              onChange={(e) => onAssignCollaborator(lead.id, e.target.value)}
              className="text-[10px] font-black border-none bg-transparent text-slate-900 dark:text-slate-100 focus:ring-0 cursor-pointer uppercase text-right p-0"
           >
              <option value="">NÃO ATRIBUÍDO</option>
              {collaborators.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
           </select>
        </div>

        <div className="flex items-center justify-between">
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
           <select
            value={lead.status}
            onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
            className="text-[10px] font-black border-none bg-transparent text-slate-900 dark:text-slate-100 focus:ring-0 cursor-pointer uppercase text-right p-0"
          >
            {Object.entries(STATUS_LABELS).map(([key, value]) => (
              <option key={key} value={key} className="bg-white dark:bg-slate-900">
                {value.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-800/50">
        <span className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
          ATT: {new Date(lead.lastUpdate).toLocaleDateString('pt-BR')}
        </span>
        <a 
          href={`tel:${lead.contactNumber}`} 
          className="text-[10px] font-black text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 tracking-tight"
        >
          {lead.contactNumber}
        </a>
      </div>
    </div>
  );
};
