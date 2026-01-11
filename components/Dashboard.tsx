
import React from 'react';
import { EventParty } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  events: EventParty[];
}

const Dashboard: React.FC<DashboardProps> = ({ events }) => {
  const confirmedEvents = events.filter(e => e.status === 'Confirmado');
  const totalRevenue = confirmedEvents.reduce((acc, ev) => acc + (ev.totalBudget || 0), 0);
  const totalCosts = confirmedEvents.reduce((acc, ev) => acc + (ev.totalSupplierCost || 0), 0);
  const totalProfit = totalRevenue - totalCosts;

  const chartData = confirmedEvents.slice(0, 5).map(ev => ({
    name: ev.title,
    lucro: (ev.totalBudget || 0) - (ev.totalSupplierCost || 0),
  }));

  const inspirations = [
    "O luxo está na atenção aos detalhes que ninguém mais vê.",
    "Cada celebração é uma página da sua história de sucesso.",
    "Decoração não é sobre móveis, é sobre criar atmosferas de afeto.",
    "Seu talento transforma espaços vazios em templos de alegria.",
    "O mestre decorador planeja o futuro para viver o presente com arte."
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <header>
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Visão de Mestre</span>
          <h2 className="text-4xl font-display text-emerald-950 font-bold mt-2">Suas Conquistas</h2>
        </header>
        
        <div className="max-w-sm p-6 bg-white border border-slate-100 rounded-[32px] italic text-slate-400 text-sm shadow-xl shadow-slate-100/50 relative">
           <span className="absolute -top-4 left-6 text-4xl text-champagne opacity-20">"</span>
           {inspirations[Math.floor(Math.random() * inspirations.length)]}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="bg-white p-24 rounded-[60px] border-2 border-dashed border-slate-100 text-center space-y-8 shadow-sm">
          <div className="text-6xl animate-bounce">🥂</div>
          <div>
            <h3 className="text-3xl font-display text-emerald-950 italic">O Atelier está em silêncio...</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2 leading-relaxed">Sua próxima grande criação começa com um simples clique. Vamos transformar um sonho em orçamento?</p>
          </div>
          <button className="bg-emerald-950 text-white px-12 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-emerald-900 hover:-translate-y-1 transition-all">Criar Primeira Celebração</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm group hover:border-emerald-100 transition-all duration-500">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-4">Valor Movimentado</p>
              <p className="text-4xl font-display font-bold text-emerald-950">R$ {totalRevenue.toLocaleString('pt-BR')}</p>
              <div className="mt-4 flex items-center gap-2 text-[9px] text-emerald-600 font-black uppercase tracking-widest">
                 <span>✦</span> Capital de Giro
              </div>
            </div>
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm group hover:border-emerald-100 transition-all duration-500">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-4">Custo de Parceiros</p>
              <p className="text-4xl font-display font-bold text-slate-800">R$ {totalCosts.toLocaleString('pt-BR')}</p>
              <div className="mt-4 flex items-center gap-2 text-[9px] text-slate-400 font-black uppercase tracking-widest">
                 <span>✦</span> Investimento em Terceiros
              </div>
            </div>
            <div className="bg-emerald-950 p-10 rounded-[48px] shadow-2xl shadow-emerald-950/20 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-900 rounded-full -mr-16 -mt-16 opacity-40 group-hover:scale-125 transition-transform duration-1000"></div>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] mb-4">O Valor da Sua Arte</p>
              <p className="text-4xl font-display font-bold text-champagne">R$ {totalProfit.toLocaleString('pt-BR')}</p>
              <div className="mt-4 flex items-center gap-2 text-[9px] text-emerald-500 font-black uppercase tracking-widest">
                 <span>⭐</span> Lucro Líquido Real
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
            <div className="xl:col-span-3 bg-white p-12 rounded-[60px] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h3 className="text-2xl font-display text-emerald-950 italic">Sua Evolução Financeira</h3>
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">Margem de Lucro por Criação</p>
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Histórico Elite</span>
              </div>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" hide />
                    <YAxis axisLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '20px'}}
                      formatter={(value: any) => [`R$ ${Number(value || 0).toLocaleString('pt-BR')}`, 'Lucro Real']} 
                    />
                    <Bar dataKey="lucro" fill="#022c22" radius={[16, 16, 16, 16]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="xl:col-span-2 bg-slate-50/50 p-12 rounded-[60px] border border-slate-100 flex flex-col">
              <h3 className="text-2xl font-display text-emerald-950 mb-8 italic">Próximos Grandes Dias</h3>
              <div className="space-y-4 flex-1">
                {events.filter(e => e.status !== 'Finalizado').slice(0, 4).map(ev => (
                  <div key={ev.id} className="p-6 bg-white rounded-[32px] flex justify-between items-center shadow-sm border border-transparent hover:border-emerald-100 transition-all group">
                    <div>
                      <p className="font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors">{ev.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">📅 {new Date(ev.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-emerald-900">R$ {ev.totalBudget.toLocaleString('pt-BR')}</p>
                       <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">Valor de Venda</p>
                    </div>
                  </div>
                ))}
                {events.filter(e => e.status !== 'Finalizado').length === 0 && (
                   <p className="text-center text-slate-300 italic text-sm py-10">Agenda livre para novos sonhos.</p>
                )}
              </div>
              <button className="mt-8 w-full py-4 bg-emerald-50 text-emerald-900 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-colors">Visualizar Agenda Completa</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
