
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { EventParty, BudgetItem } from '../types';

interface BudgetPlannerViewProps {
  events: EventParty[];
  setEvents: React.Dispatch<React.SetStateAction<EventParty[]>>;
}

const BudgetPlannerView: React.FC<BudgetPlannerViewProps> = ({ events, setEvents }) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(events[0]?.id || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const analyzeBudget = async () => {
    if (!selectedEvent) return;
    
    // Uso seguro da chave
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      alert("⚠️ SISTEMA: VITE_API_KEY não encontrada.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Atue como um analista financeiro de eventos (Python Data Expert). 
      Analise este evento: "${selectedEvent.title}", Tema: ${selectedEvent.theme}, Orçamento Atual: R$ ${selectedEvent.totalBudget}.
      Itens: ${JSON.stringify(selectedEvent.budgetItems)}.
      Forneça: 1. Estimativa de lucro ideal (30-40%). 2. Sugestão de 3 fornecedores genéricos para economizar 10%. 3. Alerta de risco financeiro. 
      Responda de forma executiva e curta em português.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setEvents(prev => prev.map(ev => ev.id === selectedEvent.id ? { ...ev, notes: response.text || '' } : ev));
    } catch (error: any) {
      console.error("Erro na análise:", error);
      alert("Ocorreu um erro na análise de dados. Tente novamente em instantes.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-display text-emerald-950 font-bold">Engenharia Financeira</h2>
          <p className="text-slate-500 italic mt-2">Gestão de custos e lucratividade para o ciclo 2026-2030.</p>
        </div>
        <select 
          className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm font-bold text-emerald-950 text-xs uppercase tracking-widest outline-none"
          value={selectedEventId || ''}
          onChange={(e) => setSelectedEventId(e.target.value)}
        >
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
        </select>
      </header>

      {selectedEvent ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-display text-emerald-950 italic">Planilha de Custos</h3>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-4 py-2 rounded-full uppercase tracking-widest">Ativo</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item / Serviço</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Custo Forn.</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço Venda</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Margem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedEvent.budgetItems.map(item => (
                      <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-6 font-medium text-emerald-950 text-sm">{item.description}</td>
                        <td className="py-6 text-slate-500 text-sm font-mono">R$ {item.supplierCost.toLocaleString('pt-BR')}</td>
                        <td className="py-6 text-emerald-900 font-bold text-sm">R$ {item.sellPrice.toLocaleString('pt-BR')}</td>
                        <td className="py-6">
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                            +{item.sellPrice > 0 ? (((item.sellPrice - item.supplierCost) / item.sellPrice) * 100).toFixed(0) : 0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-emerald-950 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-900 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-1000"></div>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-2">Lucro Projetado</p>
              <h4 className="text-5xl font-display text-champagne">R$ {(selectedEvent.totalBudget - selectedEvent.totalSupplierCost).toLocaleString('pt-BR')}</h4>
              <div className="mt-6 pt-6 border-t border-emerald-900 flex justify-between">
                <div>
                  <p className="text-[8px] uppercase text-emerald-500 font-black">ROI Evento</p>
                  <p className="text-lg font-bold">
                    {selectedEvent.totalSupplierCost > 0 ? (((selectedEvent.totalBudget - selectedEvent.totalSupplierCost) / selectedEvent.totalSupplierCost) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] uppercase text-emerald-500 font-black">Status Caixa</p>
                  <p className="text-lg font-bold">Saudável</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
              <button 
                onClick={analyzeBudget}
                disabled={isAnalyzing}
                className="w-full py-5 bg-champagne text-emerald-950 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-white hover:ring-2 hover:ring-champagne transition-all flex items-center justify-center gap-3"
              >
                {isAnalyzing ? 'Processando Dados...' : '📊 Consultar IA Financeira'}
              </button>
              
              {selectedEvent.notes && (
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Relatório do Arquiteto AI</p>
                  <p className="text-xs text-emerald-950 leading-relaxed italic">{selectedEvent.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-20 text-center bg-white rounded-[60px] border border-slate-100 text-slate-300 italic">
          Crie um evento para iniciar o planejamento financeiro.
        </div>
      )}
    </div>
  );
};

export default BudgetPlannerView;
