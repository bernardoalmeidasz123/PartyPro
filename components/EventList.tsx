
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
  const [activeTab, setActiveTab] = useState<'budget' | 'guests'>('budget');
  
  const [newEvent, setNewEvent] = useState<Partial<EventParty>>({
    title: '', clientName: '', date: '', time: '', location: '', theme: '', status: 'Pendente'
  });

  const [newItem, setNewItem] = useState({ description: '', category: 'Outros' as BudgetItem['category'], supplierCost: 0, sellPrice: 0 });

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const generateCode = () => {
    return "#PARTY-" + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

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
      notes: '',
      inviteCode: generateCode(),
      confirmedGuests: []
    };
    setEvents([...events, ev]);
    setIsAddingEvent(false);
    setSelectedEventId(ev.id);
    setNewEvent({ title: '', clientName: '', date: '', time: '', location: '', theme: '', status: 'Pendente' });
  };

  const deleteEvent = (id: string) => {
    if (window.confirm("Tem certeza que deseja CANCELAR e EXCLUIR permanentemente este evento do Atelier?")) {
      setEvents(prev => prev.filter(e => e.id !== id));
      setSelectedEventId(null);
    }
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

  const sortedGuests = selectedEvent?.confirmedGuests 
    ? [...selectedEvent.confirmedGuests].sort((a, b) => a.localeCompare(b))
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-display text-slate-800">Meus Eventos</h2>
          <button 
            onClick={() => setIsAddingEvent(true)}
            className="bg-emerald-950 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-900 shadow-xl"
          >
            + Novo
          </button>
        </div>

        {isAddingEvent && (
          <div className="bg-white p-6 rounded-[32px] border-2 border-emerald-100 shadow-xl space-y-4 animate-in fade-in zoom-in duration-300">
            <input type="text" placeholder="Nome da Festa" className="w-full p-4 border rounded-2xl outline-none bg-slate-50 focus:bg-white transition-all text-sm" onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
            <div className="grid grid-cols-2 gap-2">
              <input type="date" className="p-4 border rounded-2xl outline-none bg-slate-50 focus:bg-white text-xs" onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
              <input type="time" className="p-4 border rounded-2xl outline-none bg-slate-50 focus:bg-white text-xs" onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
            </div>
            <div className="flex space-x-2">
              <button onClick={createEvent} className="flex-1 bg-emerald-950 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Criar Festa</button>
              <button onClick={() => setIsAddingEvent(false)} className="px-4 py-2 text-slate-400 text-xs font-bold">Voltar</button>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {events.map(ev => (
            <div 
              key={ev.id}
              onClick={() => setSelectedEventId(ev.id)}
              className={`p-6 rounded-[32px] border transition-all cursor-pointer ${
                selectedEventId === ev.id ? 'bg-emerald-50 border-emerald-200 shadow-xl ring-1 ring-emerald-200' : 'bg-white border-slate-100 hover:shadow-lg'
              }`}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-800 truncate pr-2">{ev.title}</h4>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${STATUS_COLORS[ev.status]}`}>{ev.status}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">{new Date(ev.date).toLocaleDateString('pt-BR')} • {ev.location || 'Sem local'}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <p className="text-sm font-bold text-emerald-950">R$ {ev.totalBudget.toLocaleString('pt-BR')}</p>
                <div className="flex items-center gap-1">
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">{ev.confirmedGuests?.length || 0}</span>
                   <span className="text-[9px] text-slate-300 font-bold uppercase">RSVP</span>
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-slate-200">
               <span className="text-3xl block mb-4">🥂</span>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Crie sua primeira festa</p>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedEvent ? (
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[600px] animate-in slide-in-from-right-4 duration-500">
            <header className="p-8 border-b border-gray-100 bg-slate-50/50 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-950 text-white flex items-center justify-center rounded-2xl text-2xl shadow-xl">✨</div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-emerald-950">{selectedEvent.title}</h3>
                  <div className="flex gap-4 mt-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cliente: {selectedEvent.clientName}</p>
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200">
                       <span className="text-[9px] font-black text-emerald-600 uppercase">Código RSVP:</span>
                       <span className="text-[10px] font-black text-emerald-950 font-mono tracking-widest">{selectedEvent.inviteCode || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex bg-white p-1 rounded-2xl border border-slate-100">
                  <button onClick={() => setActiveTab('budget')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'budget' ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Financeiro</button>
                  <button onClick={() => setActiveTab('guests')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'guests' ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Convidados</button>
                </div>
                <button 
                  onClick={() => deleteEvent(selectedEvent.id)}
                  className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-2xl border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  title="Cancelar Evento"
                >
                  🗑️
                </button>
              </div>
            </header>

            <div className="p-10 flex-1">
              {activeTab === 'budget' ? (
                <div className="animate-in fade-in duration-500">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] text-slate-300 uppercase font-black tracking-[0.2em] border-b border-slate-50">
                        <th className="pb-4">Item Operacional</th>
                        <th className="pb-4">Forn. (Custo)</th>
                        <th className="pb-4">Cliente (Venda)</th>
                        <th className="pb-4">Lucro Líquido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedEvent.budgetItems.map(item => (
                        <tr key={item.id} className="group">
                          <td className="py-5">
                            <p className="text-sm font-bold text-emerald-950">{item.description}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{item.category}</p>
                          </td>
                          <td className="py-5 text-sm text-red-400 font-medium">R$ {item.supplierCost.toLocaleString('pt-BR')}</td>
                          <td className="py-5 text-sm text-emerald-950 font-bold">R$ {item.sellPrice.toLocaleString('pt-BR')}</td>
                          <td className="py-5 text-sm text-emerald-600 font-bold">R$ {(item.sellPrice - item.supplierCost).toLocaleString('pt-BR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {isAddingItem ? (
                    <div className="mt-8 p-8 bg-slate-50 rounded-[32px] border border-slate-200 space-y-6 animate-in slide-in-from-top-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
                          <input type="text" placeholder="Arco de Balões Luxo" className="w-full p-4 bg-white border rounded-2xl outline-none shadow-sm focus:ring-2 focus:ring-champagne text-sm" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                          <select className="w-full p-4 bg-white border rounded-2xl outline-none shadow-sm focus:ring-2 focus:ring-champagne text-sm" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as any})}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custo Fornecedor (R$)</label>
                          <input type="number" className="w-full p-4 bg-white border rounded-2xl outline-none shadow-sm focus:ring-2 focus:ring-champagne text-sm" value={newItem.supplierCost || ''} onChange={e => setNewItem({...newItem, supplierCost: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço Venda (R$)</label>
                          <input type="number" className="w-full p-4 bg-white border rounded-2xl outline-none shadow-sm focus:ring-2 focus:ring-champagne text-sm" value={newItem.sellPrice || ''} onChange={e => setNewItem({...newItem, sellPrice: parseFloat(e.target.value) || 0})} />
                        </div>
                      </div>
                      <div className="flex space-x-3 pt-4">
                        <button onClick={addBudgetItem} className="flex-1 bg-emerald-950 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-900 transition-all">Adicionar ao Orçamento</button>
                        <button onClick={() => setIsAddingItem(false)} className="px-8 py-5 text-slate-400 font-bold text-xs">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsAddingItem(true)}
                      className="mt-10 w-full py-6 border-2 border-dashed border-slate-100 rounded-[32px] text-slate-300 hover:text-emerald-900 hover:border-emerald-100 hover:bg-emerald-50/50 transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                      + Novo item de serviço
                    </button>
                  )}
                </div>
              ) : (
                <div className="animate-in fade-in duration-500 space-y-8">
                   <div className="flex items-center justify-between">
                      <h4 className="text-xl font-display text-emerald-950">Lista de Presença <span className="text-sm font-normal text-slate-400">(A-Z)</span></h4>
                      <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                         {selectedEvent.confirmedGuests?.length || 0} Confirmados
                      </div>
                   </div>

                   {sortedGuests.length === 0 ? (
                     <div className="p-20 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                        <p className="text-slate-400 font-display italic text-lg">Nenhuma confirmação recebida até o momento.</p>
                        <p className="text-[10px] font-bold text-slate-300 uppercase mt-4 tracking-widest leading-loose">
                           Compartilhe o nome da festa "{selectedEvent.title}"<br/>
                           e o código "{selectedEvent.inviteCode}" com os convidados.
                        </p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sortedGuests.map((guest, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                             <div className="w-10 h-10 rounded-full bg-emerald-950 text-champagne flex items-center justify-center font-black text-xs">
                                {guest.charAt(0).toUpperCase()}
                             </div>
                             <span className="font-bold text-emerald-950">{guest}</span>
                             <span className="ml-auto text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase opacity-0 group-hover:opacity-100 transition-opacity">Confirmado</span>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              )}
            </div>

            <footer className="p-10 bg-emerald-950 text-white flex justify-between items-center rounded-t-[40px] shadow-2xl">
               <div className="space-y-1">
                 <p className="text-[10px] text-emerald-500 uppercase font-black tracking-[0.2em]">Total do Orçamento</p>
                 <p className="text-3xl font-display font-bold">R$ {selectedEvent.totalBudget.toLocaleString('pt-BR')}</p>
               </div>
               <div className="text-right">
                 <p className="text-[10px] text-champagne uppercase font-black tracking-[0.2em]">Lucro Líquido Atelier</p>
                 <p className="text-3xl font-display font-bold text-emerald-400">R$ {(selectedEvent.totalBudget - selectedEvent.totalSupplierCost).toLocaleString('pt-BR')}</p>
               </div>
            </footer>
          </div>
        ) : (
          <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-[48px] border-2 border-dashed border-slate-100 text-slate-300 animate-pulse">
            <span className="text-7xl mb-6">🥂</span>
            <p className="text-xl font-display italic text-slate-400">Selecione uma celebração no menu lateral.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;
