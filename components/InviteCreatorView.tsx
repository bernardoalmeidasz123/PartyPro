
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const InviteCreatorView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [inviteText, setInviteText] = useState('');
  const [formData, setFormData] = useState({
    eventTitle: '',
    clientName: '',
    date: '',
    time: '',
    location: '',
    theme: '',
    vibe: 'Clássico Sofisticado'
  });

  const vibes = ['Clássico Sofisticado', 'Moderno Minimalista', 'Festa Explosiva', 'Boho Chic', 'Conto de Fadas'];

  const handleGenerate = async () => {
    if (!formData.eventTitle || !formData.date) {
      alert("Por favor, preencha pelo menos o título e a data do evento.");
      return;
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Você é um redator de convites de luxo para um Atelier de Festas Elite. 
      Crie um convite deslumbrante em português para:
      Evento: ${formData.eventTitle}
      Cliente: ${formData.clientName}
      Data: ${formData.date} às ${formData.time}
      Local: ${formData.location}
      Tema: ${formData.theme}
      Vibe/Estilo: ${formData.vibe}

      O texto deve ser poético, acolhedor e transmitir exclusividade. Use uma estrutura elegante de parágrafos. 
      Não use placeholders como [Local], use exatamente os dados fornecidos.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setInviteText(response.text || '');
    } catch (error) {
      console.error("Erro ao gerar convite:", error);
      alert("Ocorreu um erro ao conectar com o Oráculo AI. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteText);
    alert("Convite copiado para o Atelier de sua escolha!");
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header>
        <h2 className="text-4xl font-display text-emerald-950">Estúdio de Convites AI</h2>
        <p className="text-slate-500 mt-2">A inteligência que transforma dados em poesia para seus convidados.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Painel de Configuração */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Evento</label>
                <input 
                  type="text" 
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-champagne outline-none transition-all text-sm font-medium"
                  placeholder="Ex: Bodas de Ouro"
                  value={formData.eventTitle}
                  onChange={e => setFormData({...formData, eventTitle: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anfitrião/Cliente</label>
                <input 
                  type="text" 
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-champagne outline-none transition-all text-sm font-medium"
                  placeholder="Nome do cliente"
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                <input 
                  type="date" 
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-champagne outline-none transition-all text-sm font-medium"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
                <input 
                  type="time" 
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-champagne outline-none transition-all text-sm font-medium"
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Localização</label>
              <input 
                type="text" 
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-champagne outline-none transition-all text-sm font-medium"
                placeholder="Endereço ou nome do espaço"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tema/Vibe da Decoração</label>
              <input 
                type="text" 
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-champagne outline-none transition-all text-sm font-medium"
                placeholder="Ex: Jardim Encantado com Rosas"
                value={formData.theme}
                onChange={e => setFormData({...formData, theme: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estilo do Convite</label>
              <div className="flex flex-wrap gap-2">
                {vibes.map(v => (
                  <button 
                    key={v}
                    onClick={() => setFormData({...formData, vibe: v})}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.vibe === v ? 'bg-emerald-950 text-champagne' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-6 bg-emerald-950 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-emerald-900 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Redigindo com IA...
              </>
            ) : '✨ Consagrar Convite'}
          </button>
        </div>

        {/* Preview do Convite */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-champagne/20 to-emerald-500/20 rounded-[60px] blur opacity-25"></div>
          <div className="relative bg-white min-h-[500px] h-full rounded-[60px] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
            <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Preview do Papel de Seda</span>
              {inviteText && (
                <button 
                  onClick={copyToClipboard}
                  className="text-[9px] font-black text-emerald-700 uppercase tracking-widest hover:text-emerald-950"
                >
                  Copiar Texto
                </button>
              )}
            </div>
            
            <div className="p-12 md:p-16 flex-1 flex flex-col items-center justify-center text-center">
              {loading ? (
                <div className="space-y-6 flex flex-col items-center">
                   <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center animate-pulse">
                     <span className="text-3xl">🖋️</span>
                   </div>
                   <p className="font-display italic text-slate-400 animate-pulse">A IA está escolhendo as melhores palavras...</p>
                </div>
              ) : inviteText ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                   <div className="w-12 h-px bg-champagne mx-auto mb-10"></div>
                   <div className="font-display text-xl md:text-2xl text-emerald-950 leading-relaxed whitespace-pre-wrap italic">
                     {inviteText}
                   </div>
                   <div className="w-12 h-px bg-champagne mx-auto mt-10"></div>
                </div>
              ) : (
                <div className="text-center space-y-4 opacity-20 grayscale">
                  <span className="text-7xl">📜</span>
                  <p className="font-display text-lg italic text-slate-400">Preencha os dados e peça para a IA redigir.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteCreatorView;
