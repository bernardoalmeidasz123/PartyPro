
import React, { useState } from 'react';
import { EventParty, BudgetItem } from '../types';
import { STATUS_COLORS } from '../constants';
import { GoogleGenAI } from "@google/genai";

declare var process: { env: { [key: string]: string } };

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

  const generateInviteWithAI = async () => {
    if (!selectedEvent) return;
    setIsGeneratingInvite(true);
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API_KEY não configurada nas variáveis de ambiente.");
      
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Crie um convite de luxo para o evento "${selectedEvent.title}" da cliente ${selectedEvent.clientName}. 
      Tema: ${selectedEvent.theme}. 
      Data: ${new Date(selectedEvent.date).toLocaleDateString('pt-BR')}. 
      Horário: ${selectedEvent.time}. 
      Local: ${selectedEvent.location}. 
      Escreva em um tom sofisticado, poético e acolhedor, típico de um atelier de festas elite. Não use placeholders, use os dados fornecidos.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const text = response.text || '';
      setEvents(prev => prev.map(ev => ev.id === selectedEvent.id ? { ...ev, aiInviteText: text } : ev));
    } catch (error: any) {
      console.error("Erro ao gerar convite:", error);
      alert(`O Atelier AI falhou: ${error?.message || "Erro de conexão"}. Verifique se sua API Key está correta na Vercel.`);
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const locateEventWithMaps = async () => {
    if (!selectedEvent || !selectedEvent.location) return;
    setIsLocating(true);
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API_KEY não configurada.");

      const ai = new GoogleGenAI({ apiKey });
      
      let lat: number | undefined, lng: number | undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (e) { /* ignore */ }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite-latest",
        contents: `Encontre o local exato para este evento: "${selectedEvent.location}". Forneça o link do Google Maps e uma breve descrição do local.`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: lat && lng ? { latitude: lat, longitude: lng } : undefined
            }
          }
        },
      });

      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const mapUri = grounding?.find((c: any) => c.maps?.uri)?.maps?.uri;
      const details = response.text || '';

      setEvents(prev => prev.map(ev => ev.id === selectedEvent.id ? { 
        ...ev, 
        locationMapUrl: mapUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.location)}`,
        locationDetails: details
      } : ev));
    } catch (error: any) {
      console.error("Erro ao localizar:", error);
      setEvents(prev => prev.map(ev => ev.id === selectedEvent.id ? { 
        ...ev, 
        locationMapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.location)}`
      } : ev));
    } finally {
      setIsLocating(false);
    }
  };

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
      status: (newEvent.status as any) || 'Pendente',
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
            <input type="text" placeholder="Local do Evento" className="w-full p-4 border rounded-2xl outline-none bg-slate-50 focus:bg-white transition-all text-sm" onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
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
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${STATUS_COLORS[ev.status as keyof typeof STATUS_COLORS]}`}>{ev.status}</span>
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
                       <span className="text-[9px] font-black text-emerald-600 uppercase">RSVP:</span>
                       <span className="text-[10px] font-black text-emerald-950 font-mono tracking-widest">{selectedEvent.inviteCode || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex bg-white p-1 rounded-2xl border border-slate-100">
                  <button onClick={() => setActiveTab('budget')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'budget' ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Financeiro</button>
                  <button onClick={() => setActiveTab('guests')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'guests' ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Convidados</button>
                  <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'ai' ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Atelier AI & Mapa</button>
                </div>
              </div>
            </header>

            <div className="p-10 flex-1">
              {activeTab === 'budget' && (
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
                  {isAddingItem && (
                    <div className="mt-8 p-6 bg-slate-50 rounded-[32px] border border-slate-200 space-y-4 animate-in slide-in-from-bottom-2">
                       <input type="text" placeholder="Descrição do Item" className="w-full p-4 border rounded-2xl outline-none" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                       <div className="grid grid-cols-2 gap-4">
                          <input type="number" placeholder="Custo (Fornecedor)" className="p-4 border rounded-2xl outline-none" onChange={e => setNewItem({...newItem, supplierCost: Number(e.target.value)})} />
                          <input type="number" placeholder="Venda (Cliente)" className="p-4 border rounded-2xl outline-none" onChange={e => setNewItem({...newItem, sellPrice: Number(e.target.value)})} />
                       </div>
                       <div className="flex gap-2">
                          <button onClick={addBudgetItem} className="flex-1 bg-emerald-950 text-white py-4 rounded-2xl font-black text-[10px] uppercase">Salvar Item</button>
                          <button onClick={() => setIsAddingItem(false)} className="px-6 text-slate-400 text-[10px] font-black uppercase">Cancelar</button>
                       </div>
                    </div>
                  )}
                  <button 
                    onClick={() => setIsAddingItem(true)}
                    className="mt-10 w-full py-6 border-2 border-dashed border-slate-100 rounded-[32px] text-slate-300 hover:text-emerald-900 hover:border-emerald-100 transition-all font-black text-[10px] uppercase tracking-widest"
                  >
                    + Novo item de serviço
                  </button>
                </div>
              )}

              {activeTab === 'guests' && (
                <div className="animate-in fade-in duration-500 space-y-8 text-center">
                   <div className="flex items-center justify-between mb-8">
                      <h4 className="text-xl font-display text-emerald-950">Lista de Presença</h4>
                      <div className="px-4 py-2 bg-emerald-50 rounded-xl text-[10px] font-black text-emerald-700 uppercase">
                         {selectedEvent.confirmedGuests?.length || 0} Confirmados
                      </div>
                   </div>
                   {sortedGuests.length === 0 ? (
                     <div className="p-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                        <p className="text-slate-400 font-display italic">Nenhuma confirmação recebida.</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-2 gap-4 text-left">
                        {sortedGuests.map((guest, idx) => (
                          <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-emerald-950 text-champagne flex items-center justify-center font-black text-[10px]">{guest.charAt(0)}</div>
                             <span className="font-bold text-sm text-emerald-950">{guest}</span>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="animate-in fade-in duration-700 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-display text-emerald-950">Localização Master</h4>
                        <button 
                          onClick={locateEventWithMaps}
                          disabled={isLocating || !selectedEvent.location}
                          className="text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-900 flex items-center gap-2"
                        >
                          {isLocating ? 'Buscando...' : '📍 Validar Local'}
                        </button>
                      </div>
                      
                      <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">📅</div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Data & Horário</p>
                            <p className="text-sm font-bold text-emerald-950">
                              {new Date(selectedEvent.date).toLocaleDateString('pt-BR')} às {selectedEvent.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">📍</div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Endereço</p>
                            <p className="text-sm font-bold text-emerald-950">{selectedEvent.location || 'Não definido'}</p>
                          </div>
                        </div>
                        
                        {selectedEvent.locationMapUrl && (
                          <div className="pt-4">
                            <a 
                              href={selectedEvent.locationMapUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block w-full py-4 bg-emerald-100 text-emerald-900 rounded-2xl text-center font-black text-[10px] uppercase tracking-widest hover:bg-emerald-200 transition-all"
                            >
                              Abrir no Google Maps ↗
                            </a>
                            {selectedEvent.locationDetails && (
                              <p className="mt-4 text-[10px] text-slate-500 italic leading-relaxed">{selectedEvent.locationDetails}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="h-[300px] bg-slate-100 rounded-[32px] overflow-hidden border border-slate-200 shadow-inner relative">
                      {selectedEvent.location ? (
                        <iframe 
                          width="100%" 
                          height="100%" 
                          frameBorder="0" 
                          style={{ border: 0 }}
                          src={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.location)}&output=embed`}
                          allowFullScreen
                          className="grayscale opacity-80"
                        ></iframe>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-[10px] uppercase font-black tracking-widest">
                          Defina um local para ver o mapa
                        </div>
                      )}
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/10 to-transparent"></div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-10 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-display text-emerald-950">Oráculo de Convites</h4>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Redação criativa via Gemini AI</p>
                      </div>
                      <button 
                        onClick={generateInviteWithAI}
                        disabled={isGeneratingInvite}
                        className="bg-emerald-950 text-champagne px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-900 transition-all flex items-center gap-2"
                      >
                        {isGeneratingInvite ? (
                          <><span className="w-3 h-3 border-2 border-champagne border-t-transparent rounded-full animate-spin"></span> Criando...</>
                        ) : '✨ Gerar com IA'}
                      </button>
                    </div>

                    {selectedEvent.aiInviteText ? (
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-champagne/20 to-emerald-500/20 rounded-[40px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-6 min-h-[200px]">
                           <div className="font-display text-emerald-950 text-lg leading-relaxed whitespace-pre-wrap italic">
                             {selectedEvent.aiInviteText}
                           </div>
                           <div className="pt-6 border-t border-slate-50 flex justify-end gap-4">
                             <button 
                               onClick={() => navigator.clipboard.writeText(selectedEvent.aiInviteText || '')}
                               className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-950 transition-colors"
                             >
                               Copiar Texto
                             </button>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 text-center space-y-4">
                         <div className="text-4xl">✍️</div>
                         <p className="text-slate-400 font-display italic">Aguardando seu comando para redigir a perfeição.</p>
                      </div>
                    )}
                  </div>
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
