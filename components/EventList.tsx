
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
      clientName: newEvent.clientName || 'Cliente Genérico',
      date: newEvent.date!,
      time: newEvent.time || '00:00',
      location: newEvent.location || '',
      theme: newEvent.theme || '',
      status: newEvent.status as any || 'Pendente',
      budgetItems: [],
      totalBudget: 0,
      totalSupplierCost: 0,
      notes: ''
    };
    setEvents([...events, ev]);
    setIsAddingEvent(false);
    setNewEvent({ title: '', clientName: '', date: '', time: '', location: '', theme: '', status: 'Pendente' });
  };

  const addBudgetItem = () => {
    if (!selectedEventId || !newItem.description) return;
    
    const item: BudgetItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: newItem.description,
      category: newItem.category,
      supplierCost: newItem.supplierCost,
      sellPrice: newItem.sellPrice,
      paid: false,
    };

    setEvents(prev => prev.map(ev => {
      if (ev.id === selectedEventId) {
        return {
          ...ev,
          budgetItems: [...ev.budgetItems, item],
          totalBudget: ev.totalBudget + item.sellPrice,
          totalSupplierCost: ev.totalSupplierCost + item.supplierCost
        };
      }
      return ev;
    }));
    
    setNewItem({ description: '', category: 'Outros', supplierCost: 0, sellPrice: 0 });
    setIsAddingItem(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-display text-slate-800">Meus Eventos</h2>
          <button 
            onClick={() => setIsAddingEvent(true)}
            className="bg-amber-500 text-white px-3 py-1.5 rounded-xl text-sm font-bold hover:bg-amber-600 shadow-lg shadow-amber-500/20"
          >
            + Novo
          </button>
        </div>

        {isAddingEvent && (
          <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-xl space-y-3 animate-in fade-in zoom-in duration-300">
            <input type="text" placeholder="Nome da Festa" className="w-full p-2 border rounded-lg outline-none" onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
            <div className="grid grid-cols-2 gap-2">
              <input type="date" className="p-2 border rounded-lg outline-none" onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
              <input type="time" className="p-2 border rounded-lg outline-none" onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
            </div>
            <div className="flex space-x-2">
              <button onClick={createEvent} className="flex-1 bg-slate-900 text-white py-2 rounded-lg font-bold">Criar</button>
              <button onClick={() => setIsAddingEvent(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {events.map(ev => (
            <div 
              key={ev.id}
              onClick={() => setSelectedEventId(ev.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedEventId === ev.id ? 'bg-amber-50 border-amber-300 shadow-md ring-1 ring-amber-300' : 'bg-white border-gray-100 hover:shadow-lg'
              }`}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-800 truncate pr-2">{ev.title}</h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[ev.status]}`}>{ev.status}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{new Date(ev.date).toLocaleDateString('pt-BR')} • {ev.location || 'Sem local'}</p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <p className="text-sm font-bold text-slate-700">R$ {ev.totalBudget.toLocaleString('pt-BR')}</p>
                <p className="text-[10px] text-green-600 font-bold uppercase">Lucro: R$ {(ev.totalBudget - ev.totalSupplierCost).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          ))}
          {events.length === 0 && <p className="text-center text-slate-400 py-10 text-sm">Crie sua primeira festa para começar.</p>}
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedEvent ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
            <header className="p-8 border-b border-gray-100 bg-slate-50 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">{selectedEvent.title}</h3>
                <p className="text-slate-500 text-sm">Cliente: {selectedEvent.clientName} | Tema: {selectedEvent.theme}</p>
              </div>
              <div className="flex space-x-2">
                 <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-right">
                   <p className="text-[10px] text-slate-400 font-bold uppercase">Lucro Previsto</p>
                   <p className="text-lg font-bold text-green-600">R$ {(selectedEvent.totalBudget - selectedEvent.totalSupplierCost).toLocaleString('pt-BR')}</p>
                 </div>
              </div>
            </header>

            <div className="p-8 flex-1 overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase font-bold border-b border-gray-100">
                    <th className="pb-4">Item</th>
                    <th className="pb-4">Forn. (Custo)</th>
                    <th className="pb-4">Cliente (Venda)</th>
                    <th className="pb-4">Lucro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {selectedEvent.budgetItems.map(item => (
                    <tr key={item.id} className="group">
                      <td className="py-4">
                        <p className="text-sm font-bold text-slate-700">{item.description}</p>
                        <p className="text-[10px] text-slate-400 uppercase">{item.category}</p>
                      </td>
                      <td className="py-4 text-sm text-red-500 font-medium">R$ {item.supplierCost.toLocaleString('pt-BR')}</td>
                      <td className="py-4 text-sm text-slate-700 font-bold">R$ {item.sellPrice.toLocaleString('pt-BR')}</td>
                      <td className="py-4 text-sm text-green-600 font-bold">R$ {(item.sellPrice - item.supplierCost).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {isAddingItem ? (
                <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-gray-200 space-y-4 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Descrição (ex: Arco de Balões)" className="p-3 bg-white border rounded-xl outline-none shadow-sm" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                    <select className="p-3 bg-white border rounded-xl outline-none shadow-sm" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as any})}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Custo Fornecedor (R$)</label>
                      <input type="number" className="w-full p-3 bg-white border rounded-xl outline-none shadow-sm" value={newItem.supplierCost || ''} onChange={e => setNewItem({...newItem, supplierCost: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Preço Venda (R$)</label>
                      <input type="number" className="w-full p-3 bg-white border rounded-xl outline-none shadow-sm" value={newItem.sellPrice || ''} onChange={e => setNewItem({...newItem, sellPrice: parseFloat(e.target.value) || 0})} />
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button onClick={addBudgetItem} className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-amber-500/20">Adicionar Item</button>
                    <button onClick={() => setIsAddingItem(false)} className="px-6 py-3 text-slate-400 font-bold">Cancelar</button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingItem(true)}
                  className="mt-8 w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-slate-400 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50/30 transition-all font-bold text-sm"
                >
                  + Adicionar novo item ao orçamento
                </button>
              )}
            </div>

            <footer className="p-8 bg-slate-900 text-white flex justify-between items-center">
               <div className="space-y-1">
                 <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Total da Festa</p>
                 <p className="text-2xl font-bold">R$ {selectedEvent.totalBudget.toLocaleString('pt-BR')}</p>
               </div>
               <div className="text-right">
                 <p className="text-[10px] text-amber-400 uppercase font-bold tracking-widest">Seu Lucro</p>
                 <p className="text-2xl font-bold text-green-400">R$ {(selectedEvent.totalBudget - selectedEvent.totalSupplierCost).toLocaleString('pt-BR')}</p>
               </div>
            </footer>
          </div>
        ) : (
          <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-200 text-slate-300">
            <span className="text-6xl mb-4">🏠</span>
            <p className="text-lg font-medium">Selecione uma festa para gerenciar o lucro.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;
