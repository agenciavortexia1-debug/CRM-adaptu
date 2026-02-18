
import React, { useMemo } from 'react';
import { Lead, Collaborator } from '../types';
import { STATUS_LABELS } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, LabelList
} from 'recharts';

interface KPIsProps {
  leads: Lead[];
  collaborators: Collaborator[];
  isDarkMode: boolean;
}

export const KPIs: React.FC<KPIsProps> = ({ leads, collaborators, isDarkMode }) => {
  const labelColor = isDarkMode ? '#cbd5e1' : '#475569';
  const gridColor = isDarkMode ? '#1e293b' : '#e2e8f0';

  // Tenta extrair um valor numérico do campo de faturamento médio
  const getNum = (val: any) => {
    if (typeof val === 'number') return val;
    const cleaned = String(val).replace(/[^\d.-]/g, '');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  const statsByStatus = useMemo(() => {
    return Object.keys(STATUS_LABELS).map(key => ({
      name: STATUS_LABELS[key as any].label,
      value: leads.filter(l => l.status === key).length,
    }));
  }, [leads]);

  const statsByCollaborator = useMemo(() => {
    return collaborators.map(c => ({
      name: c.name,
      leadsCount: leads.filter(l => l.collaboratorId === c.id).length,
      revenue: leads.filter(l => l.collaboratorId === c.id && l.status === 'ganho')
                   .reduce((acc, curr) => acc + (curr.proposalValue || getNum(curr.averageRevenue)), 0),
      color: c.color
    })).sort((a, b) => b.revenue - a.revenue);
  }, [leads, collaborators]);

  const wonLeads = useMemo(() => {
    return leads.filter(l => l.status === 'ganho');
  }, [leads]);

  const activeLeads = useMemo(() => {
    return leads.filter(l => l.status !== 'ganho' && l.status !== 'perda');
  }, [leads]);

  const totalRevenue = useMemo(() => {
    return wonLeads.reduce((acc, curr) => acc + (curr.proposalValue || getNum(curr.averageRevenue)), 0);
  }, [wonLeads]);

  const conversionRate = useMemo(() => {
    const total = leads.length;
    const won = wonLeads.length;
    return total > 0 ? ((won / total) * 100).toFixed(1) : 0;
  }, [leads, wonLeads]);

  // Custom Tick for X-Axis to use collaborator's specific color
  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const collab = collaborators.find(c => c.name === payload.value);
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={20}
          textAnchor="middle"
          fill={collab?.color || labelColor}
          className="text-[12px] font-black uppercase tracking-tight"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  const summaryCards = [
    { label: 'Leads Ativos', value: activeLeads.length, color: 'text-blue-500' },
    { label: 'Receita Ganha', value: `R$ ${totalRevenue.toLocaleString()}`, color: 'text-emerald-500' },
    { label: 'Taxa de Conversão', value: `${conversionRate}%`, color: 'text-purple-500' },
    { label: 'Ticket Médio', value: `R$ ${(totalRevenue / (wonLeads.length || 1)).toLocaleString()}`, color: 'text-amber-500' },
    { label: 'Clientes Conquistados', value: wonLeads.length, color: 'text-emerald-600' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* SUMMARY CARDS - STACKED FOR MOBILE, GRID FOR DESKTOP */}
      <div className="flex flex-col gap-1 md:grid md:grid-cols-5 md:gap-4">
        {summaryCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Table View */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-black uppercase mb-6 border-l-4 border-blue-500 pl-3 tracking-widest">Distribuição por Status</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Status</th>
                  <th className="py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">Quantidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {statsByStatus.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300">{item.name}</td>
                    <td className="py-3 text-xs font-black text-right text-slate-900 dark:text-white">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Consultant Revenue Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 h-[400px] flex flex-col shadow-sm">
          <h3 className="text-sm font-black uppercase mb-6 border-l-4 border-emerald-500 pl-3 tracking-widest">Receita por Consultor</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsByCollaborator} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="name" 
                  tick={<CustomXAxisTick />}
                  axisLine={{ stroke: gridColor }}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#0f172a' : '#fff', 
                    borderColor: isDarkMode ? '#1e293b' : '#e2e8f0',
                    borderRadius: '0px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }} 
                  cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc', opacity: 0.1 }}
                />
                <Bar dataKey="revenue" radius={[0, 0, 0, 0]}>
                  {/* Revenue value CENTERED inside the bar in WHITE with increased size */}
                  <LabelList 
                    dataKey="revenue" 
                    position="center" 
                    formatter={(val: number) => `R$ ${val.toLocaleString()}`}
                    fill="#ffffff"
                    fontSize={12}
                    fontWeight="black"
                  />
                  {statsByCollaborator.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
