
import React from 'react';
import { EventParty } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display text-slate-800 font-bold">Resumo Financeiro</h2>
          <p className="text-slate-500 mt-1">Apenas festas confirmadas são contabilizadas aqui.</p>
        </div>
      </header>

      {events.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-200 text-center">
          <p className="text-slate-400 text-lg">Você ainda não possui eventos cadastrados.</p>
          <button className="mt-4 text-amber-600 font-bold">Comece criando seu primeiro evento ✨</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Faturamento Bruto</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">R$ {totalRevenue.toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Custo Fornecedores</p>
              <p className="text-3xl font-bold text-red-500 mt-1">R$ {totalCosts.toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 bg-amber-50">
              <p className="text-xs text-amber-600 font-bold uppercase tracking-widest">Lucro Líquido</p>
              <p className="text-3xl font-bold text-green-600 mt-1">R$ {totalProfit.toLocaleString('pt-BR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            <div className="xl:col-span-3 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-8">Lucro por Evento (Top 5)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" hide />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `Lucro: R$ ${value.toLocaleString('pt-BR')}`} />
                    <Bar dataKey="lucro" fill="#10b981" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="xl:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Agenda Próxima</h3>
              <div className="space-y-4">
                {events.filter(e => e.status !== 'Finalizado').slice(0, 4).map(ev => (
                  <div key={ev.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{ev.title}</p>
                      <p className="text-xs text-slate-500">{new Date(ev.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-600">R$ {ev.totalBudget.toLocaleString('pt-BR')}</span>
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
