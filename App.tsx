
import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ViewMode, Lead, Collaborator, AppSettings, LeadStatus, User } from './types';
import { STATUS_LABELS } from './constants';
import { 
  IconKanban, IconChart, IconClock, IconSettings, IconSun, IconMoon, 
  IconChevronLeft, IconChevronRight, IconUsers, IconLogOut, IconHistory,
  IconDownload 
} from './components/Icons';
import { LeadCard } from './components/LeadCard';
import { KPIs } from './components/KPIs';
import { Settings } from './components/Settings';
import { FollowUp } from './components/FollowUp';
import { UserManagement } from './components/UserManagement';
import { HistoryGlobal } from './components/HistoryGlobal';
import { Login } from './components/Login';
import { HistoryModal } from './components/HistoryModal';

const SUPABASE_URL = 'https://qxihfpviufppdscsetbs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aWhmcHZpdWZwcGRzY3NldGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzMxMzgsImV4cCI6MjA4NjUwOTEzOH0.YyvQh61ow7aP2670Ct157K_mBZjyvPZdvbtEdqkReB8';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const IconBell = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ViewMode>(ViewMode.CRM);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ followUpThresholdDays: 7 });
  const [filter, setFilter] = useState('');
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const [proposalModal, setProposalModal] = useState<{leadId: string, visible: boolean}>({leadId: '', visible: false});
  const [historyModal, setHistoryModal] = useState<{leadId: string, visible: boolean}>({leadId: '', visible: false});

  const updateNotificationStatus = () => {
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  };

  const handleRequestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      if (permission === 'granted') {
        notifyNewLead('Alertas Ativados com Sucesso!');
      }
    } else {
      alert("Este navegador não suporta notificações.");
    }
  };

  const notifyNewLead = async (companyName: string) => {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      // Parâmetros cruciais para a notificação saltar na tela (Heads-up)
      registration.showNotification('🚀 NOVO LEAD RECEBIDO!', {
        body: `Empresa: ${companyName.toUpperCase()}\nToque para abrir o atendimento agora.`,
        icon: 'https://lh3.googleusercontent.com/d/1suIG32h-jC6OdCnx5Xfz9CzGi7gKqEkO',
        badge: 'https://lh3.googleusercontent.com/d/1suIG32h-jC6OdCnx5Xfz9CzGi7gKqEkO',
        // Padrão de vibração estilo "chamada" para Android
        vibrate: [500, 100, 500, 100, 500, 100, 500],
        tag: 'lead-alert-urgent',
        renotify: true,
        requireInteraction: true, // Garante que a notificação fique visível até o usuário clicar
        data: { url: '/' }
      } as any);
    }
  };

  useEffect(() => {
    fetchData();
    updateNotificationStatus();

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(standalone);

    const leadsSub = supabase
      .channel('public:leads')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
        notifyNewLead(payload.new.company_name);
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchData())
      .subscribe();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => { 
      supabase.removeChannel(leadsSub); 
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const fetchData = async () => {
    const { data: collabData } = await supabase.from('collaborators').select('*').order('name');
    const { data: leadsData } = await supabase.from('leads').select('*').order('last_update', { ascending: false });
    if (collabData) setCollaborators(collabData);
    if (leadsData) {
      setLeads(leadsData.map(l => ({
        id: l.id,
        companyName: l.company_name,
        segment: l.segment,
        averageRevenue: l.average_revenue,
        operationDescription: l.operation_description,
        contactNumber: l.contact_number,
        status: l.status as LeadStatus,
        collaboratorId: l.collaborator_id,
        createdAt: l.created_at,
        lastUpdate: l.last_update,
        proposalValue: l.proposal_value
      })));
    }
  };

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const handleInstallClick = async () => {
    if (isIOS) {
      alert("INSTALAÇÃO NO IPHONE:\n1. Clique no botão de Compartilhar (quadrado com seta pra cima)\n2. Role para baixo e clique em 'Adicionar à Tela de Início'\n3. Abra o app pela tela inicial para receber notificações.");
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      alert("Para instalar:\nAbra o menu do navegador (três pontinhos) e clique em 'Instalar Aplicativo'.");
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const oldLabel = STATUS_LABELS[lead.status].label;
    const newLabel = STATUS_LABELS[newStatus].label;
    await supabase.from('leads').update({ status: newStatus, last_update: new Date().toISOString() }).eq('id', leadId);
    await supabase.from('lead_history').insert([{ lead_id: leadId, description: `Status alterado de "${oldLabel}" para "${newLabel}"`, user_name: currentUser?.name || 'Sistema' }]);
    fetchData();
  };

  const handleAssignCollaborator = async (leadId: string, collaboratorId: string) => {
    const collaborator = collaborators.find(c => c.id === collaboratorId);
    await supabase.from('leads').update({ collaborator_id: collaboratorId || null, last_update: new Date().toISOString() }).eq('id', leadId);
    await supabase.from('lead_history').insert([{ lead_id: leadId, description: `Lead atribuído a: ${collaborator?.name || 'Ninguém'}`, user_name: currentUser?.name || 'Sistema' }]);
    fetchData();
  };

  const filteredLeads = useMemo(() => {
    const q = filter.toLowerCase();
    return leads.filter(l => l.companyName.toLowerCase().includes(q) || (l.segment && l.segment.toLowerCase().includes(q)));
  }, [leads, filter]);

  const navItems = [
    { id: ViewMode.CRM, icon: <IconKanban />, label: 'CRM', adminOnly: false },
    { id: ViewMode.KPIs, icon: <IconChart />, label: "KPI'S", adminOnly: true },
    { id: ViewMode.FOLLOW_UP, icon: <IconClock />, label: 'FOLLOW UP', adminOnly: false },
    { id: ViewMode.HISTORY, icon: <IconHistory />, label: 'HISTÓRICO', adminOnly: false },
    { id: ViewMode.USER_MANAGEMENT, icon: <IconUsers />, label: 'USUÁRIOS', adminOnly: true },
    { id: ViewMode.PERSONALIZATION, icon: <IconSettings />, label: 'AJUSTES', adminOnly: true },
  ].filter(item => !item.adminOnly || currentUser?.role === 'admin');

  if (!currentUser) return <Login onLogin={setCurrentUser} />;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Sidebar Desktop */}
      <aside className={`hidden md:flex relative bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex-col h-screen sticky top-0 z-40 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-20 lg:w-64'}`}>
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <span className={`font-black text-xl tracking-tighter uppercase italic whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}>ADAPTU</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === item.id ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'}`}>
              <div className="flex-shrink-0">{item.icon}</div>
              <span className={`whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'hidden lg:block'}`}>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 mt-auto border-t border-slate-100 dark:border-slate-800 space-y-2">
          {!isStandalone && (
            <button onClick={handleInstallClick} className="w-full flex items-center gap-4 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 hover:opacity-80 transition-opacity border-2 border-emerald-100 dark:border-emerald-900/50">
              <div className="flex-shrink-0"><IconDownload /></div>
              <span className={`whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'hidden lg:block'}`}>INSTALAR APP</span>
            </button>
          )}
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center gap-4 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900">
            <div className="flex-shrink-0">{isDarkMode ? <IconSun /> : <IconMoon />}</div>
            <span className={`whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'hidden lg:block'}`}>{isDarkMode ? 'MODO CLARO' : 'MODO ESCURO'}</span>
          </button>
          <button onClick={() => setCurrentUser(null)} className="w-full flex items-center gap-4 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
            <div className="flex-shrink-0"><IconLogOut /></div>
            <span className={`whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'hidden lg:block'}`}>SAIR</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden pb-20 md:pb-0">
        {/* Banner Global de Alerta */}
        {!isStandalone && (
          <div onClick={handleInstallClick} className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest py-3 px-4 flex items-center justify-between cursor-pointer z-50">
            <span>🔥 INSTALE O APP PARA RECEBER ALERTAS NO TOPO DO CELULAR</span>
            <IconDownload className="w-4 h-4 animate-bounce" />
          </div>
        )}
        
        {notificationStatus !== 'granted' && isStandalone && (
          <div onClick={handleRequestNotifications} className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest py-3 px-4 flex items-center justify-between cursor-pointer z-50">
            <span>⚠️ ATIVAR ALERTAS DE NOVOS LEADS</span>
            <IconBell className="w-4 h-4 animate-ping" />
          </div>
        )}

        <header className="h-16 md:h-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <span className="font-black text-xl tracking-tighter uppercase italic text-slate-900 dark:text-white">ADAPTU</span>
          </div>
          <div className="flex-1 max-w-xl mx-4">
            <input type="search" placeholder="PESQUISAR LEAD..." value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border-none px-4 py-2 md:px-6 md:py-3 text-[10px] md:text-xs font-bold focus:ring-1 focus:ring-slate-400 uppercase tracking-widest placeholder:text-slate-400" />
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={handleRequestNotifications}
              className={`p-2 transition-all ${notificationStatus === 'granted' ? 'text-emerald-500' : 'text-red-500 animate-pulse'}`}
            >
              <IconBell />
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
              {isDarkMode ? <IconSun /> : <IconMoon />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
          {activeTab === ViewMode.CRM && (
            <div className="flex flex-col md:flex-row gap-6 h-full overflow-x-auto snap-x snap-mandatory pb-8 no-scrollbar">
              {Object.entries(STATUS_LABELS).map(([statusKey, statusInfo]) => {
                const leadsInStatus = filteredLeads.filter(l => l.status === statusKey);
                return (
                  <div key={statusKey} className="flex-shrink-0 w-full md:w-80 flex flex-col snap-center">
                    <div className={`h-1 mb-3 md:mb-4 ${statusInfo.color}`} />
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] text-slate-700 dark:text-slate-300">{statusInfo.label}</h3>
                      <span className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1 text-[10px] font-black border border-slate-300 dark:border-slate-700">{leadsInStatus.length}</span>
                    </div>
                    <div className="space-y-4">
                      {leadsInStatus.map(lead => (
                        <LeadCard 
                          key={lead.id} 
                          lead={lead} 
                          collaborators={collaborators}
                          onStatusChange={handleStatusChange} 
                          onAssignCollaborator={handleAssignCollaborator}
                          onViewHistory={(id) => setHistoryModal({ leadId: id, visible: true })}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === ViewMode.KPIs && <KPIs leads={leads} collaborators={collaborators} isDarkMode={isDarkMode} />}
          {activeTab === ViewMode.USER_MANAGEMENT && <UserManagement />}
          {activeTab === ViewMode.HISTORY && <HistoryGlobal />}
          {activeTab === ViewMode.FOLLOW_UP && (
            <FollowUp 
              leads={leads} 
              collaborators={collaborators} 
              settings={settings} 
              onStatusChange={handleStatusChange} 
              onAssignCollaborator={handleAssignCollaborator} 
              onViewHistory={(id) => setHistoryModal({ leadId: id, visible: true })}
            />
          )}
          {activeTab === ViewMode.PERSONALIZATION && (
            <div className="space-y-8 pb-20">
              <Settings 
                collaborators={collaborators} 
                settings={settings} 
                onAddCollaborator={fetchData} 
                onRemoveCollaborator={fetchData} 
                onUpdateSettings={setSettings} 
              />
              <div className="bg-white dark:bg-slate-900 border-4 border-slate-900 dark:border-white p-8 shadow-xl">
                <h3 className="text-sm font-black uppercase mb-4 border-l-4 border-emerald-500 pl-3">Central de Alertas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => notifyNewLead('EMPRESA TESTE')} 
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
                  >
                    TESTAR NOTIFICAÇÃO ESTILO WHATSAPP
                  </button>
                  <button 
                    onClick={handleInstallClick} 
                    className="bg-emerald-600 text-white px-6 py-4 text-[10px] font-black uppercase tracking-widest shadow-lg"
                  >
                    AJUDA PARA INSTALAR NO CELULAR
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Nav Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-50">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 p-2 ${activeTab === item.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            {item.icon}
            <span className="text-[8px] font-black uppercase">{item.label}</span>
          </button>
        ))}
      </nav>

      {historyModal.visible && (
        <HistoryModal leadId={historyModal.leadId} onClose={() => setHistoryModal({ leadId: '', visible: false })} />
      )}
    </div>
  );
};

export default App;
