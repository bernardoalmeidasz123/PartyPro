import React, { useState } from 'react';
import { EventParty, BudgetItem } from '../types';
import { CATEGORIES, STATUS_COLORS } from '../constants';

interface EventListProps {
  events: EventParty[];
  setEvents: React.Dispatch<React.SetStateAction<EventParty[]>>;
}

const EventList: React.FC<EventListProps> = ({ events, setEvents }) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  
  const [newEvent, setNewEvent] = useState<Partial<EventParty>>({
    title: '', clientName: '', date: '', time: '', location: '', theme: '', status: 'Pendente'
  });

  const [newItem, setNewItem] = useState({ description: '', category: 'Outros' as BudgetItem['category'], supplierCost: 0, sellPrice: 0 });

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const createEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    const ev: EventParty = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title!,
      clientName: newEvent.clientName || 'Cliente Particular',
      date: newEvent.date!,
      time: newEvent.time || '18:00',
      location: newEvent.location || '',
      theme: newEvent.theme || '',
      status: 'Pendente',
      budgetItems: [],
      totalBudget: 0,
      totalSupplierCost: 0,
      notes: ''
    };
    setEvents([...events, ev]);
    setIsAddingEvent(false);
    setNewEvent({ title: '', clientName: '', date: '', time: '', location: '', theme: '', status: 'Pendente' });
    setSelectedEventId(ev.id);
  };

  const addBudgetItem = () => {
    if (!selectedEventId || !newItem.description) return;
    
    const item: BudgetItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: newItem.description,
      category: newItem.category,
      supplierCost: Number(newItem.supplierCost),
      sellPrice: Number(newItem.sellPrice),
      paid: false,
    };

    setEvents(prev => prev.map(ev => {
      if (ev.id === selectedEventId) {
        const updatedItems = [...ev.budgetItems, item];
        return {
          ...ev,
          budgetItems: updatedItems,
          totalBudget: updatedItems.reduce((acc, i) => acc + i.sellPrice, 0),
          totalSupplierCost: updatedItems.reduce((acc, i) => acc + i.supplierCost, 0)
        };
      }
      return ev;
    }));
    
    setNewItem({ description: '', category: 'Outros', supplierCost: 0, sellPrice: 0 });
    setIsAddingItem(false);
  };

  const deleteEvent = (id: string) => {
    if(confirm("Deseja realmente excluir este evento?")) {
      setEvents(events.filter(e => e.id !== id));
      setSelectedEventId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-display text-emerald-950">Minhas Festas</h2>
          <button 
            onClick={() => setIsAddingEvent(true)}
            className="bg-emerald-950 text-white px-5 py-2.5 rounded-2xl text-xs font-bold hover:bg-emerald-900 shadow-xl transition-all"
          >
            + NOVO EVENTO
          </button>
        </div>

        {isAddingEvent && (
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-2xl space-y-4 animate-in zoom-in duration-300">
            <input type="text" placeholder="Nome da Celebração" className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none text-sm font-medium" onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" className="p-3 bg-slate-50 border-none rounded-xl outline-none text-xs font-bold text-slate-500" onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
              <input type="time" className="p-3 bg-slate-50 border-none rounded-xl outline-none text-xs font-bold text-slate-500" onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
            </div>
            <div className="flex space-x-2 pt-2">
              <button onClick={createEvent} className="flex-1 bg-emerald-950 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg">Confirmar</button>
              <button onClick={() => setIsAddingEvent(false)} className="px-4 py-3 text-slate-400 font-bold text-xs uppercase">Cancelar</button>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {events.map(ev => (
            <div 
              key={ev.id}
              onClick={() => setSelectedEventId(ev.id)}
              className={`p-6 rounded-[32px] border transition-all cursor-pointer relative overflow-hidden group ${
                selectedEventId === ev.id ? 'bg-white border-emerald-200 shadow-2xl ring-1 ring-emerald-100' : 'bg-white/50 border-slate-100 hover:bg-white hover:shadow-lg'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-emerald-950 truncate max-w-[150px]">{ev.title}</h4>
                <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${STATUS_COLORS[ev.status]}`}>{ev.status}</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                {new Date(ev.date).toLocaleDateString('pt-BR')} • {ev.time}
              </p>
              
              <div className="flex justify-between items-end pt-4 border-t border-slate-50">
                <div>
                  <p className="text-[9px] text-slate-300 font-bold uppercase mb-1">Faturamento</p>
                  <p className="text-sm font-black text-emerald-900">R$ {ev.totalBudget.toLocaleString('pt-BR')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-emerald-300 font-bold uppercase mb-1">Lucro</p>
                  <p className="text-sm font-black text-champagne">R$ {(ev.totalBudget - ev.totalSupplierCost).toLocaleString('pt-BR')}</p>
                </div>
              </div>

              {selectedEventId === ev.id && (
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id); }}
                  className="absolute top-2 right-2 p-2 text-red-100 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {events.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[40px]">
              <p className="text-slate-300 font-display italic">Nenhuma festa agendada.</p>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedEvent ? (
          <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col min-h-[700px] animate-in slide-in-from-right-4 duration-500">
            <header className="p-10 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
              <div>
                <h3 className="text-3xl font-display text-emerald-950">{selectedEvent.title}</h3>
                <div className="flex gap-4 mt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente: <span className="text-slate-600">{selectedEvent.clientName}</span></span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tema: <span className="text-slate-600">{selectedEvent.theme || 'N/A'}</span></span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="bg-emerald-950 px-6 py-4 rounded-3xl shadow-xl shadow-emerald-950/20">
                   <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-[0.2em] mb-1">Lucro Estimado</p>
                   <p className="text-2xl font-display font-bold text-champagne">R$ {(selectedEvent.totalBudget - selectedEvent.totalSupplierCost).toLocaleString('pt-BR')}</p>
                 </div>
              </div>
            </header>

            <div className="p-10 flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-slate-300 uppercase font-black tracking-widest border-b border-slate-50">
                      <th className="pb-6">Descrição do Item</th>
                      <th className="pb-6">Custo Forn.</th>
                      <th className="pb-6">Preço Cliente</th>
                      <th className="pb-6 text-right">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedEvent.budgetItems.map(item => (
                      <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-5">
                          <p className="text-sm font-bold text-emerald-950">{item.description}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.category}</p>
                        </td>
                        <td className="py-5 text-sm text-slate-400 font-medium">R$ {item.supplierCost.toLocaleString('pt-BR')}</td>
                        <td className="py-5 text-sm text-emerald-950 font-bold">R$ {item.sellPrice.toLocaleString('pt-BR')}</td>
                        <td className="py-5 text-sm text-champagne font-black text-right">R$ {(item.sellPrice - item.supplierCost).toLocaleString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isAddingItem ? (
                <div className="mt-10 p-8 bg-emerald-50/50 rounded-[32px] border border-emerald-100 space-y-6 animate-in slide-in-from-top-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-emerald-800 uppercase tracking-widest ml-1">Descrição</label>
                      <input type="text" placeholder="Ex: Painel de Led 4k" className="w-full p-4 bg-white border-none rounded-2xl outline-none shadow-sm text-sm" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-emerald-800 uppercase tracking-widest ml-1">Categoria</label>
                      <select className="w-full p-4 bg-white border-none rounded-2xl outline-none shadow-sm text-sm font-bold text-emerald-950" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as any})}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-emerald-800 uppercase tracking-widest ml-1">Custo do Fornecedor (R$)</label>
                      <input type="number" className="w-full p-4 bg-white border-none rounded-2xl outline-none shadow-sm text-sm" value={newItem.supplierCost || ''} onChange={e => setNewItem({...newItem, supplierCost: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-emerald-800 uppercase tracking-widest ml-1">Preço para o Cliente (R$)</label>
                      <input type="number" className="w-full p-4 bg-white border-none rounded-2xl outline-none shadow-sm text-sm" value={newItem.sellPrice || ''} onChange={e => setNewItem({...newItem, sellPrice: parseFloat(e.target.value) || 0})} />
                    </div>
                  </div>
                  <div className="flex space-x-4 pt-4">
                    <button onClick={addBudgetItem} className="flex-1 bg-emerald-950 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-900 transition-all">Lançar no Orçamento</button>
                    <button onClick={() => setIsAddingItem(false)} className="px-8 py-4 text-emerald-900 font-bold text-xs uppercase tracking-widest">Cancelar</button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingItem(true)}
                  className="mt-10 w-full py-6 border-2 border-dashed border-slate-100 rounded-[32px] text-slate-300 hover:text-emerald-900 hover:border-emerald-200 hover:bg-emerald-50 transition-all font-bold text-xs uppercase tracking-[0.2em]"
                >
                  + ADICIONAR ITEM AO PROJETO
                </button>
              )}
            </div>

            <footer className="p-10 bg-emerald-950 text-white flex justify-between items-center">
               <div>
                 <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest mb-1">Total do Projeto</p>
                 <p className="text-3xl font-display font-bold">R$ {selectedEvent.totalBudget.toLocaleString('pt-BR')}</p>
               </div>
               <div className="text-right">
                 <p className="text-[10px] text-champagne uppercase font-black tracking-widest mb-1">Margem de Lucro</p>
                 <p className="text-3xl font-display font-bold text-champagne">R$ {(selectedEvent.totalBudget - selectedEvent.totalSupplierCost).toLocaleString('pt-BR')}</p>
               </div>
            </footer>
          </div>
        ) : (
          <div className="h-full min-h-[700px] flex flex-col items-center justify-center bg-white rounded-[40px] border border-slate-100 text-slate-200 shadow-sm">
            <div className="text-7xl mb-6 opacity-20">💎</div>
            <p className="text-xl font-display italic text-slate-300">Selecione uma celebração para gerenciar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;