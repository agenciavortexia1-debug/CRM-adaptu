
-- 1. Habilitar a extensão de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Usuários do Sistema
CREATE TABLE IF NOT EXISTS system_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Colaboradores (Etiquetas)
CREATE TABLE IF NOT EXISTS collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  segment TEXT,
  average_revenue TEXT,
  operation_description TEXT,
  contact_number TEXT,
  status TEXT DEFAULT 'aguardando_atribuiçao',
  collaborator_id UUID REFERENCES collaborators(id) ON DELETE SET NULL,
  proposal_value NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_update TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Histórico de Movimentações
CREATE TABLE IF NOT EXISTS lead_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  user_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela para Push Notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription JSONB NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INSERIR SEU ACESSO ADMIN INICIAL (admin123)
-- O comando ON CONFLICT evita o erro se o usuário já existir
INSERT INTO system_users (name, password_hash, role)
VALUES ('ADMINISTRADOR', 'admin123', 'admin')
ON CONFLICT (name) DO NOTHING;
