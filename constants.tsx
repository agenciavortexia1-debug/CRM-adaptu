
import { LeadStatus } from './types';

export const STATUS_LABELS: Record<LeadStatus, { label: string; color: string }> = {
  aguardando_atribuiçao: { label: 'Aguardando Atribuição', color: 'bg-slate-400' },
  conversa_iniciada: { label: 'Conversa Iniciada', color: 'bg-blue-500' },
  perda_interesse: { label: 'Perda de Interesse', color: 'bg-slate-600' },
  reuniao_agendada: { label: 'Reunião Agendada', color: 'bg-purple-500' },
  proposta_enviada: { label: 'Proposta Enviada', color: 'bg-amber-500' },
  ganho: { label: 'Ganho', color: 'bg-emerald-600' },
  perda: { label: 'Perda', color: 'bg-rose-600' },
};
