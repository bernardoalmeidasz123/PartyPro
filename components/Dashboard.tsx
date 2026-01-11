
import React from 'react';
import { EventParty } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  events: EventParty[];
}

const Dashboard: React.FC<DashboardProps> = ({ events }) => {
  const confirmedEvents = events.filter(e => e.status === 'Confirmado');
  const totalRevenue = confirmedEvents.reduce((acc, ev) => acc + ev.totalBudget, 0);
  const totalCosts = confirmedEvents.reduce((acc, ev) => acc + ev.totalSupplierCost, 0);
  const totalProfit = totalRevenue - totalCosts;

  const chartData = confirmedEvents.slice(0, 5).map(ev => ({
    name: ev.title,
    lucro: ev.totalBudget - ev.totalSupplierCost,
  }));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <header>
        <h2 className="text-4xl font-display text-emerald-950 font-bold">Resumo Atelier</h2>
        <p className="text-slate-400 mt-2 font-medium">Performance financeira das celebrações confirmadas.</p>
      </header>

      {events.length === 0 ? (
        <div className="bg-white p-20 rounded-[40px] border border-slate-100 text-center shadow-sm">
          <div className="text-5xl mb-6">🍃</div>
          <p className="text-slate-400 text-xl font-display">Inicie seu portfólio de eventos.</p>
          <button className="mt-6 text-emerald-700 font-bold hover:text-champagne transition-colors">Cadastrar Primeira Celebração →</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-emerald-950 p-10 rounded-[40px] shadow-2xl shadow-emerald-950/20 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-900 rounded-full -mr-10 -mt-10 opacity-50"></div>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] mb-2">Faturamento Total</p>
              <p className="text-4xl font-display font-bold">R$ {totalRevenue.toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2">Custos Operacionais</p>
              <p className="text-4xl font-display font-bold text-slate-800">R$ {totalCosts.toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-[#fcf8ef] p-10 rounded-[40px] border border-champagne/20 shadow-xl shadow-champagne/5">
              <p className="text-[10px] text-champagne font-bold uppercase tracking-[0.2em] mb-2">Lucro Líquido</p>
              <p className="text-4xl font-display font-bold text-emerald-800">R$ {totalProfit.toLocaleString('pt-BR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
            <div className="xl:col-span-3 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
              <h3 className="text-2xl font-display text-emerald-950 mb-10">Lucratividade por Projeto</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" hide />
                    <YAxis axisLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                      formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Lucro']} 
                    />
                    <Bar dataKey="lucro" fill="#022c22" radius={[15, 15, 15, 15]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="xl:col-span-2 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
              <h3 className="text-2xl font-display text-emerald-950 mb-8">Próximas Datas</h3>
              <div className="space-y-6">
                {events.filter(e => e.status !== 'Finalizado').slice(0, 4).map(ev => (
                  <div key={ev.id} className="group p-5 bg-slate-50 rounded-3xl flex justify-between items-center hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100">
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-emerald-900 transition-colors">{ev.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{new Date(ev.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">R$ {ev.totalBudget.toLocaleString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
