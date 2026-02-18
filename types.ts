
export type LeadStatus = 'aguardando_atribuiçao' | 'conversa_iniciada' | 'perda_interesse' | 'reuniao_agendada' | 'proposta_enviada' | 'ganho' | 'perda';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  password_hash: string;
  role: UserRole;
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
}

export interface Lead {
  id: string;
  companyName: string;
  segment: string;
  averageRevenue: string;
  operationDescription: string;
  contactNumber: string;
  status: LeadStatus;
  collaboratorId: string | null;
  createdAt: string;
  lastUpdate: string;
  proposalValue?: number;
}

export interface LeadHistory {
  id: string;
  lead_id: string;
  description: string;
  created_at: string;
  user_name: string;
}

export interface AppSettings {
  followUpThresholdDays: number;
}

export enum ViewMode {
  CRM = 'CRM',
  KPIs = 'KPIs',
  FOLLOW_UP = 'Follow Up',
  HISTORY = 'Histórico',
  USER_MANAGEMENT = 'Usuários',
  PERSONALIZATION = 'Ajustes'
}
