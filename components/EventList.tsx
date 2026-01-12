
import React, { useState } from 'react';
import { EventParty, BudgetItem } from '../types';
import { STATUS_COLORS } from '../constants';
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
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("Chave de API necessária.");
    return new GoogleGenAI({ apiKey });
  };

  const generateInviteWithAI = async () => {
    if (!selectedEvent) return;
    setIsGeneratingInvite(true);
    try {
      const ai = await checkAndGetAI();
      const prompt = `Crie um convite de luxo para "${selectedEvent.title}" de ${selectedEvent.clientName}. Tema: ${selectedEvent.theme}. Data: ${selectedEvent.date}. Horário: ${selectedEvent.time}. Local: ${selectedEvent.location}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const text = response.text || '';
      setEvents(prev => prev.map(ev => ev.id === selectedEvent.id ? { ...ev, aiInviteText: text } : ev));
    } catch (error: any) {
      if (error?.message?.includes("Requested entity was not found") && window.aistudio) {
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

      const mapUri = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.find((c: any) => c.maps?.uri)?.maps?.uri;
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
          <div className="bg-white p-6 rounded-[32px] border-2 border-emerald-100 shadow-xl space-y-4">
            <input type="text" placeholder="Festa" className="w-full p-4 border rounded-2xl" onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
            <input type="date" className="w-full p-4 border rounded-2xl" onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
            <div className="flex gap-2"><button onClick={createEvent} className="flex-1 bg-emerald-950 text-white py-4 rounded-2xl font-black text-[10px] uppercase">Criar</button></div>
          </div>
        )}
        <div className="space-y-3">
          {events.map(ev => (
            <div key={ev.id} onClick={() => setSelectedEventId(ev.id)} className={`p-6 rounded-[32px] border cursor-pointer ${selectedEventId === ev.id ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
              <h4 className="font-bold text-slate-800">{ev.title}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">{ev.date}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-2">
        {selectedEvent ? (
          <div className="bg-white rounded-[40px] shadow-sm border overflow-hidden flex flex-col min-h-[600px]">
            <header className="p-8 border-b bg-slate-50/50 flex flex-col md:flex-row justify-between gap-4">
              <h3 className="text-2xl font-display font-bold text-emerald-950">{selectedEvent.title}</h3>
              <div className="flex bg-white p-1 rounded-2xl border">
                <button onClick={() => setActiveTab('budget')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${activeTab === 'budget' ? 'bg-emerald-950 text-white' : 'text-slate-400'}`}>Financeiro</button>
                <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${activeTab === 'ai' ? 'bg-emerald-950 text-white' : 'text-slate-400'}`}>IA & Mapa</button>
              </div>
            </header>
            <div className="p-10 flex-1">
              {activeTab === 'budget' && (
                <div className="space-y-6">
                  {selectedEvent.budgetItems.map(item => (
                    <div key={item.id} className="flex justify-between py-2 border-b">
                      <span>{item.description}</span>
                      <span className="font-bold">R$ {item.sellPrice}</span>
                    </div>
                  ))}
                  <button onClick={() => setIsAddingItem(true)} className="w-full py-6 border-2 border-dashed rounded-[32px] text-slate-300 uppercase font-black text-[10px]">+ Novo Item</button>
                </div>
              )}
              {activeTab === 'ai' && (
                <div className="space-y-6">
                  <button onClick={generateInviteWithAI} className="w-full bg-emerald-950 text-white py-4 rounded-2xl font-black uppercase text-[10px]">Gerar Convite</button>
                  {selectedEvent.aiInviteText && <p className="p-4 bg-slate-50 rounded-2xl italic">{selectedEvent.aiInviteText}</p>}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[600px] flex items-center justify-center text-slate-300">Selecione um evento</div>
        )}
      </div>
    </div>
  );
};

export default EventList;
