
import React, { useState } from 'react';
import { EventParty, BudgetItem } from '../types';
import { GoogleGenAI } from "@google/genai";

declare var process: { env: { [key: string]: string } };
declare var window: any;

interface EventListProps {
  events: EventParty[];
  setEvents: React.Dispatch<React.SetStateAction<EventParty[]>>;
}

const EventList: React.FC<EventListProps> = ({ events, setEvents }) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [activeTab, setActiveTab] = useState<'budget' | 'guests' | 'ai'>('budget');
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const [newEvent, setNewEvent] = useState<Partial<EventParty>>({
    title: '', clientName: '', date: '', time: '', location: '', theme: '', status: 'Pendente'
  });

  const [newItem, setNewItem] = useState({ description: '', category: 'Outros' as BudgetItem['category'], supplierCost: 0, sellPrice: 0 });

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const checkAndGetAI = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) await window.aistudio.openSelectKey();
      }
      throw new Error("Chave de API necessária.");
    }
    return new GoogleGenAI({ apiKey });
  };

  const generateInviteWithAI = async () => {
    if (!selectedEvent) return;
    setIsGeneratingInvite(true);
    try {
      const ai = await checkAndGetAI();
      const prompt = `Crie um convite de luxo para "${selectedEvent.title}" de ${selectedEvent.clientName}. Tema: ${selectedEvent.theme}. Data: ${selectedEvent.date}. Horário: ${selectedEvent.time}. Local: ${selectedEvent.location}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
      });

      const text = response.text || '';
      setEvents(prev => prev.map(ev => ev.id === selectedEvent.id ? { ...ev, aiInviteText: text } : ev));
    } catch (error: any) {
      if (error?.message?.includes("entity was not found") && window.aistudio) {
        await window.aistudio.openSelectKey();
      } else {
        alert("Erro na IA: " + error.message);
      }
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const locateEventWithMaps = async () => {
    if (!selectedEvent || !selectedEvent.location) return;
    setIsLocating(true);
    try {
      const ai = await checkAndGetAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite-latest",
        contents: `Localize "${selectedEvent.location}". Forneça Maps URL.`,
        config: { tools: [{ googleMaps: {} }] },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const mapUri = chunks?.find((c: any) => c.maps?.uri)?.maps?.uri;
      
      setEvents(prev => prev.map(ev => ev.id === selectedEvent.id ? { 
        ...ev, 
        locationMapUrl: mapUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.location)}`
      } : ev));
    } catch (error: any) {
      setEvents(prev => prev.map(ev => ev.id === selectedEvent.id ? { 
        ...ev, 
        locationMapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.location)}`
      } : ev));
    } finally {
      setIsLocating(false);
    }
  };

  const createEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    const ev: EventParty = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title!,
      clientName: newEvent.clientName || 'Cliente',
      date: newEvent.date!,
      time: newEvent.time || '00:00',
      location: newEvent.location || '',
      theme: newEvent.theme || '',
      status: (newEvent.status as any) || 'Pendente',
      budgetItems: [],
      totalBudget: 0,
      totalSupplierCost: 0,
      notes: '',
      inviteCode: "#PARTY-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
      confirmedGuests: []
    };
    setEvents([...events, ev]);
    setIsAddingEvent(false);
    setSelectedEventId(ev.id);
    setNewEvent({ title: '', clientName: '', date: '', time: '', location: '', theme: '', status: 'Pendente' });
  };

  const addBudgetItem = () => {
    if (!selectedEventId || !newItem.description) return;
    const item: BudgetItem = { id: Math.random().toString(36).substr(2, 9), ...newItem, paid: false };
    setEvents(prev => prev.map(ev => ev.id === selectedEventId ? {
      ...ev,
      budgetItems: [...ev.budgetItems, item],
      totalBudget: ev.totalBudget + item.sellPrice,
      totalSupplierCost: ev.totalSupplierCost + item.supplierCost
    } : ev));
    setNewItem({ description: '', category: 'Outros', supplierCost: 0, sellPrice: 0 });
    setIsAddingItem(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-display text-slate-800">Meus Eventos</h2>
          <button onClick={() => setIsAddingEvent(true)} className="bg-emerald-950 text-white px-4 py-2 rounded-xl text-xs font-black uppercase"> + Novo </button>
        </div>
        {isAddingEvent && (
          <div className="bg-white p-6 rounded-[32px] border-2 border-emerald-100 shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-500">
            <input type="text" placeholder="Nome da Festa" className="w-full p-4 border rounded-2xl outline-none focus:ring-1 focus:ring-emerald-200" onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
            <input type="date" className="w-full p-4 border rounded-2xl outline-none" onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
            <div className="flex gap-2"><button onClick={createEvent} className="flex-1 bg-emerald-950 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Criar Evento</button></div>
          </div>
        )}
        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-10">Inicie seu primeiro projeto elite.</p>
          ) : (
            events.map(ev => (
              <div key={ev.id} onClick={() => setSelectedEventId(ev.id)} className={`p-6 rounded-[32px] border transition-all cursor-pointer ${selectedEventId === ev.id ? 'bg-emerald-50 border-emerald-200 shadow-md translate-x-1' : 'bg-white hover:bg-slate-50'}`}>
                <h4 className="font-bold text-slate-800">{ev.title}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">{new Date(ev.date).toLocaleDateString('pt-BR')}</p>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="lg:col-span-2">
        {selectedEvent ? (
          <div className="bg-white rounded-[40px] shadow-sm border overflow-hidden flex flex-col min-h-[600px] animate-in fade-in duration-700">
            <header className="p-8 border-b bg-slate-50/50 flex flex-col md:flex-row justify-between gap-4">
              <div>
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{selectedEvent.status}</span>
                <h3 className="text-2xl font-display font-bold text-emerald-950 mt-1">{selectedEvent.title}</h3>
              </div>
              <div className="flex bg-white p-1 rounded-2xl border shadow-inner">
                <button onClick={() => setActiveTab('budget')} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'budget' ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400'}`}>Financeiro</button>
                <button onClick={() => setActiveTab('ai')} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'ai' ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400'}`}>IA & Mapa</button>
              </div>
            </header>
            <div className="p-10 flex-1">
              {activeTab === 'budget' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 p-6 rounded-3xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Orçamento Venda</p>
                      <p className="text-2xl font-display font-bold text-emerald-950">R$ {selectedEvent.totalBudget.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Custo Fornecedores</p>
                      <p className="text-2xl font-display font-bold text-slate-600">R$ {selectedEvent.totalSupplierCost.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {selectedEvent.budgetItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-4 bg-white border rounded-2xl hover:border-emerald-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg uppercase font-black tracking-tighter">{item.category}</span>
                          <span className="text-sm font-medium text-slate-700">{item.description}</span>
                        </div>
                        <span className="font-bold text-emerald-950">R$ {item.sellPrice.toLocaleString('pt-BR')}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setIsAddingItem(true)} className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-300 uppercase font-black text-[10px] tracking-widest hover:border-emerald-200 hover:text-emerald-300 transition-all">+ Adicionar Item de Orçamento</button>
                </div>
              )}
              {activeTab === 'ai' && (
                <div className="space-y-8">
                  <div className="flex flex-col gap-4">
                    <button onClick={generateInviteWithAI} disabled={isGeneratingInvite} className="bg-emerald-950 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3">
                      {isGeneratingInvite ? 'Consultando Oráculo...' : '✨ Gerar Redação do Convite'}
                    </button>
                    {selectedEvent.aiInviteText && (
                      <div className="p-8 bg-emerald-50 rounded-[32px] border border-emerald-100 italic text-emerald-950 font-display text-lg leading-relaxed whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-2">
                        {selectedEvent.aiInviteText}
                      </div>
                    )}
                  </div>
                  <div className="h-px bg-slate-100"></div>
                  <div className="flex flex-col gap-4">
                    <button onClick={locateEventWithMaps} disabled={isLocating} className="bg-white border border-slate-200 text-slate-600 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                      {isLocating ? 'Mapeando...' : '📍 Localizar no Google Maps'}
                    </button>
                    {selectedEvent.locationMapUrl && (
                      <a href={selectedEvent.locationMapUrl} target="_blank" rel="noopener noreferrer" className="text-center text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline decoration-champagne underline-offset-4">
                        Abrir Mapa da Celebração ↗
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
            <span className="text-6xl">✨</span>
            <p className="font-display italic">Selecione uma criação para gerenciar detalhes.</p>
          </div>
        )}
      </div>

      {isAddingItem && (
        <div className="fixed inset-0 z-[100] bg-emerald-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[48px] p-10 space-y-6 animate-in zoom-in duration-300">
             <h3 className="text-2xl font-display text-emerald-950">Novo Item</h3>
             <div className="space-y-4">
               <input type="text" placeholder="Descrição (Ex: Buquê da Noiva)" className="w-full p-4 border rounded-2xl outline-none" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
               <select className="w-full p-4 border rounded-2xl outline-none" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as any})}>
                 <option>Mobilário</option>
                 <option>Flores</option>
                 <option>Iluminação</option>
                 <option>Doces</option>
                 <option>Outros</option>
               </select>
               <div className="grid grid-cols-2 gap-4">
                 <input type="number" placeholder="Custo (R$)" className="w-full p-4 border rounded-2xl outline-none" value={newItem.supplierCost} onChange={e => setNewItem({...newItem, supplierCost: parseFloat(e.target.value) || 0})} />
                 <input type="number" placeholder="Venda (R$)" className="w-full p-4 border rounded-2xl outline-none" value={newItem.sellPrice} onChange={e => setNewItem({...newItem, sellPrice: parseFloat(e.target.value) || 0})} />
               </div>
             </div>
             <div className="flex gap-3">
               <button onClick={() => setIsAddingItem(false)} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Cancelar</button>
               <button onClick={addBudgetItem} className="flex-1 py-4 bg-emerald-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Adicionar</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;
