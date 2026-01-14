
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const InviteCreatorView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [visualPreview, setVisualPreview] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'text' | 'visual'>('text');
  const [paletteMode, setPaletteMode] = useState<'prebuilt' | 'custom'>('prebuilt');
  const [selectedPalette, setSelectedPalette] = useState('Esmeralda & Ouro');
  const [customPalette, setCustomPalette] = useState('');
  
  // Configurações UI
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');

  const [formData, setFormData] = useState({
    clientName: '',
    theme: '',
    date: '',
    time: '',
    location: '',
    elements: '',
    tone: 'Sofisticado'
  });

  const getAI = () => {
    // A chave é injetada pelo vite.config.ts
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  };

  const handleGenerate = async (type: 'text' | 'visual') => {
    if (!formData.clientName || !formData.theme) {
      alert("Para o Atelier trabalhar, preencha pelo menos o Nome e o Tema!");
      return;
    }
    
    const ai = getAI();
    setLoading(true);
    setPreviewTab(type);
    
    try {
      const paletteStr = paletteMode === 'prebuilt' ? selectedPalette : customPalette;
      
      if (type === 'text') {
        const prompt = `Atue como um designer e redator de convites de altíssimo luxo. 
        Crie o texto de um convite exclusivo e poético:
        - Anfitrião: ${formData.clientName}
        - Tema: ${formData.theme}
        - Localização Exata: ${formData.location || 'Espaço Secreto'}
        - Horário: ${formData.time || 'A definir'}
        - Data: ${formData.date || 'Em breve'}
        - Elementos Especiais: ${formData.elements || 'Festa tradicional de gala'}
        - Paleta: ${paletteStr}
        - Tom: ${formData.tone}
        
        Instrução: Integre o Local, a Hora e os Elementos Especiais organicamente no texto. O convite deve ser magnético e luxuoso.`;

        // Modelo Lite para resposta rápida
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-lite-preview',
          contents: prompt
        });
        setGeneratedContent(response.text || 'O Atelier não conseguiu redigir o texto no momento. Tente novamente.');
      } else {
        // Geração Visual com Nano Banana (Flash) - Modelo mais rápido e eficiente para imagem
        const prompt = `Hyper-realistic professional event design for "${formData.theme}". 
        The scene should reflect a high-end luxury party at ${formData.location || 'a magnificent venue'}.
        Visual details: ${formData.elements}.
        Color theme: ${paletteStr}.
        Cinematic lighting, elegant atmosphere, highly detailed, photorealistic.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image', // Modelo Flash (Nano Banana)
          contents: { parts: [{ text: prompt }] },
          config: { 
            imageConfig: { 
              aspectRatio: "16:9"
            } 
          }
        });

        let imageFound = false;
        if (response.candidates && response.candidates[0].content.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              setVisualPreview(`data:image/png;base64,${part.inlineData.data}`);
              imageFound = true;
              break;
            }
          }
        }
        if (!imageFound) alert("O Atelier não conseguiu gerar a imagem. Tente novamente.");
        setIsEditing(false); 
      }
    } catch (e: any) {
      console.error("Erro na IA:", e);
      alert(`O Atelier encontrou um obstáculo: ${e.message || 'Verifique a conexão.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditImage = async () => {
    if (!visualPreview || !editPrompt) return;
    
    const ai = getAI();
    setLoading(true);

    try {
      const base64Data = visualPreview.split(',')[1];

      // Edição com Gemini 2.5 Flash Image (Nano Banana)
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/png',
              },
            },
            {
              text: `Edit this image: ${editPrompt}. Maintain high luxury quality.`,
            },
          ],
        },
      });

      let imageFound = false;
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            setVisualPreview(`data:image/png;base64,${part.inlineData.data}`);
            imageFound = true;
            break;
          }
        }
      }
      if (!imageFound) alert("Não foi possível editar a imagem.");
      
    } catch (e: any) {
      console.error(e);
      alert("Erro ao editar imagem.");
    } finally {
      setLoading(false);
      setEditPrompt('');
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      <header>
        <div className="flex items-center gap-3 mb-2">
           <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-widest">Estúdio de Criação</span>
        </div>
        <h2 className="text-4xl font-display text-emerald-950 font-bold">Atelier Digital</h2>
        <p className="text-slate-500 italic">Preencha os dados e peça para a IA projetar seu evento.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anfitrião</label>
              <input className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-medium" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} placeholder="Ex: Família Cavalcanti" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tema</label>
              <input className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-medium" value={formData.theme} onChange={e => setFormData({...formData, theme: e.target.value})} placeholder="Ex: Noite das Esmeraldas" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
              <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-100 transition-all text-xs" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
              <input type="time" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-100 transition-all text-xs" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estilo</label>
              <select className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-100 transition-all text-xs font-bold" value={formData.tone} onChange={e => setFormData({...formData, tone: e.target.value})}>
                <option>Sofisticado</option>
                <option>Poético</option>
                <option>Minimalista</option>
                <option>Festivo</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Local</label>
            <input className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-medium" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Ex: Palácio de Versalhes" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Elementos Extras</label>
            <textarea rows={3} className="w-full p-5 bg-slate-50 rounded-[32px] border-none outline-none focus:ring-2 focus:ring-emerald-100 transition-all text-sm font-medium resize-none" value={formData.elements} onChange={e => setFormData({...formData, elements: e.target.value})} placeholder="Ex: Arranjos altos de orquídeas, buffet de lagosta..." />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Formato (Padrão Flash)</label>
            <div className="flex gap-4">
              {['1K', '2K', '4K'].map((size) => (
                <button
                  key={size}
                  onClick={() => setImageSize(size as any)}
                  className={`flex-1 py-3 rounded-xl text-xs font-black transition-all border ${
                    imageSize === size 
                      ? 'bg-emerald-950 text-champagne border-emerald-950' 
                      : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-emerald-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <button onClick={() => handleGenerate('text')} disabled={loading} className="py-6 bg-slate-100 text-emerald-950 rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] shadow-sm hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50">
              {loading && previewTab === 'text' ? 'Redigindo...' : '✍️ Redigir Convite'}
            </button>
            <button onClick={() => handleGenerate('visual')} disabled={loading} className="py-6 bg-emerald-950 text-white rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-900 transition-all active:scale-95 disabled:opacity-50">
              {loading && previewTab === 'visual' ? 'Desenhando...' : '🖼️ Gerar Imagem'}
            </button>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[60px] p-12 text-white relative overflow-hidden flex flex-col items-center justify-center shadow-2xl min-h-[500px]">
           {loading ? (
             <div className="text-center space-y-6 relative z-10">
                <div className="w-16 h-16 border-4 border-champagne border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="font-display italic text-xl text-champagne">O Atelier está trabalhando...</p>
             </div>
           ) : previewTab === 'text' && generatedContent ? (
             <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
               <p className="font-display text-2xl leading-relaxed italic pr-4 whitespace-pre-wrap">{generatedContent}</p>
             </div>
           ) : previewTab === 'visual' && visualPreview ? (
             <div className="w-full h-full flex flex-col relative z-10">
                <div className="relative group rounded-[40px] overflow-hidden shadow-2xl flex-1">
                   <img src={visualPreview} className="w-full h-full object-cover animate-in zoom-in duration-700" alt="Preview Visual" />
                   
                   {!isEditing && (
                     <button 
                       onClick={() => setIsEditing(true)}
                       className="absolute bottom-6 right-6 bg-white/90 backdrop-blur text-emerald-950 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
                     >
                       ✏️ Editar Imagem
                     </button>
                   )}
                </div>

                {isEditing && (
                  <div className="mt-6 bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 animate-in slide-in-from-bottom-2">
                    <p className="text-[10px] font-black text-champagne uppercase tracking-widest mb-2">Editor Nano Banana</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="Ex: Adicionar filtro vintage, remover cadeira..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-champagne"
                      />
                      <button 
                        onClick={handleEditImage}
                        disabled={loading || !editPrompt}
                        className="bg-champagne text-emerald-950 px-6 rounded-xl font-bold text-xs uppercase tracking-wide hover:bg-white transition-colors"
                      >
                        Aplicar
                      </button>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="text-white/50 px-3 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
             </div>
           ) : (
             <div className="text-center opacity-20 relative z-10">
               <span className="text-6xl">✨</span>
               <p className="mt-4 font-display italic text-lg">Seu design aparecerá aqui.</p>
             </div>
           )}
           
           {/* Background Grid Decoration */}
           <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-5 pointer-events-none">
              {Array.from({length: 36}).map((_, i) => (
                <div key={i} className="border border-white/20"></div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default InviteCreatorView;
