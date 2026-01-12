
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

declare var process: { env: { [key: string]: string } };
declare var window: any;

const InviteCreatorView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [visualPreview, setVisualPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [previewTab, setPreviewTab] = useState<'text' | 'visual'>('text');
  const [isCustomPalette, setIsCustomPalette] = useState(false);
  const [creationType, setCreationType] = useState<'invite' | 'cake_table'>('invite');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [formData, setFormData] = useState({
    clientName: '',
    date: '',
    time: '',
    location: '',
    palette: 'Esmeralda & Ouro',
    customPaletteText: '',
    additionalInfo: '',
    theme: ''
  });

  const palettes = [
    { name: 'Esmeralda & Ouro', colors: ['#022c22', '#d4af37'] },
    { name: 'Rose & Champagne', colors: ['#f4d7d7', '#f7e7ce'] },
    { name: 'Noite Estrelada', colors: ['#0c0c1d', '#c0c0c0'] },
    { name: 'Minimalista Branco', colors: ['#ffffff', '#e2e8f0'] },
    { name: 'Bordeaux & Prata', colors: ['#4c0519', '#e5e7eb'] }
  ];

  const getAIInstance = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      if (window.aistudio) await window.aistudio.openSelectKey();
      throw new Error("Chave de API não encontrada.");
    }
    return new GoogleGenAI({ apiKey });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        // Lógica de áudio para texto poderia ser implementada aqui se necessário
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Acesso ao microfone negado.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const getActivePalette = () => isCustomPalette ? (formData.customPaletteText || 'Personalizada') : formData.palette;

  const generateVisualPreview = async () => {
    if (!formData.clientName || !formData.date || !formData.location) {
      return alert("Preencha os dados básicos primeiro.");
    }
    setLoadingImage(true);
    setPreviewTab('visual');
    try {
      const ai = await getAIInstance();
      const palette = getActivePalette();
      const prompt = `Luxury event invitation for Anfitrião ${formData.clientName}, Location ${formData.location}, Date ${formData.date}. Colors: ${palette}. Style: Premium professional design, 4K high fidelity, gold foil details.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "4:3" } }
      });
      
      const candidate = response.candidates?.[0];
      const contentParts = candidate?.content?.parts || [];
      const imagePart = contentParts.find(p => p.inlineData);
      
      if (imagePart?.inlineData?.data) {
        setVisualPreview(`data:image/png;base64,${imagePart.inlineData.data}`);
      } else {
        alert("O atelier não pôde gerar a imagem agora. Tente um prompt mais simples.");
      }
    } catch (error: any) {
      if (error?.message?.includes("entity was not found") && window.aistudio) {
        await window.aistudio.openSelectKey();
      } else {
        console.error("Erro na geração de imagem:", error);
      }
    } finally {
      setLoadingImage(false);
    }
  };

  const handleGenerateText = async () => {
    if (!formData.clientName || !formData.date || !formData.location) {
      return alert("Preencha Nome, Data e Local.");
    }
    setLoading(true);
    setPreviewTab('text');
    try {
      const ai = await getAIInstance();
      const palette = getActivePalette();
      const textPrompt = creationType === 'cake_table' 
        ? `Descreva um conceito de mesa de bolo luxuosa na paleta ${palette} para ${formData.clientName} em ${formData.location}. Use tom poético e sofisticado.`
        : `Redija um convite de luxo para ${formData.clientName}, data ${formData.date}, local ${formData.location}, paleta ${palette}. O texto deve ser digno de um atelier de alta costura.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: textPrompt
      });
      
      setGeneratedContent(response.text || 'Falha na redação.');
    } catch (error: any) {
      if (error?.message?.includes("entity was not found") && window.aistudio) {
        await window.aistudio.openSelectKey();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-display text-emerald-950">Atelier de Design AI</h2>
          <p className="text-slate-500 mt-2 text-sm italic">Criações exclusivas com inteligência artificial para eventos de elite.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full md:w-auto">
          <button onClick={() => setCreationType('invite')} className={`flex-1 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${creationType === 'invite' ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400'}`}>Convite</button>
          <button onClick={() => setCreationType('cake_table')} className={`flex-1 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${creationType === 'cake_table' ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400'}`}>Conceito Mesa</button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-12">
        <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-slate-100 shadow-sm space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-emerald-900 uppercase tracking-widest ml-1">Anfitrião</label>
              <input type="text" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} placeholder="Ex: Família Cavalcanti" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-emerald-900 uppercase tracking-widest ml-1">Data</label>
              <input type="date" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-emerald-900 uppercase tracking-widest ml-1">Local</label>
              <input type="text" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Palácio das Artes" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-emerald-900 uppercase tracking-widest ml-1">Horário</label>
              <input type="time" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs outline-none" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-emerald-900 uppercase tracking-widest ml-1">Paleta de Cores</label>
            <div className="flex flex-wrap gap-2 md:gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              {palettes.map(p => (
                <button 
                  key={p.name} 
                  onClick={() => {setIsCustomPalette(false); setFormData({...formData, palette: p.name});}} 
                  className={`flex items-center p-2 rounded-xl transition-all ${(!isCustomPalette && formData.palette === p.name) ? 'bg-white shadow-sm ring-1 ring-emerald-200' : 'opacity-40 hover:opacity-100'}`}
                >
                  <div className="flex -space-x-1">
                    {p.colors.map((c, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border border-white" style={{ backgroundColor: c }}></div>
                    ))}
                  </div>
                </button>
              ))}
              <button 
                onClick={() => setIsCustomPalette(true)} 
                className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${isCustomPalette ? 'bg-white shadow-sm ring-1 ring-emerald-200' : 'bg-slate-200/50 opacity-40'}`}
              >
                🎨
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-emerald-900 uppercase tracking-widest ml-1">Instruções de Estilo</label>
            <div className="relative">
              <textarea 
                rows={3} 
                className="w-full p-4 pr-14 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm resize-none" 
                value={formData.additionalInfo} 
                onChange={e => setFormData({...formData, additionalInfo: e.target.value})} 
                placeholder="Ex: Estilo minimalista, toque de Art Déco..." 
              />
              <button 
                onMouseDown={startRecording} 
                onMouseUp={stopRecording} 
                onMouseLeave={stopRecording} 
                className={`absolute right-3 bottom-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-50 text-emerald-600'}`}
              >
                🎙️
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={handleGenerateText} 
              disabled={loading} 
              className="py-4 md:py-5 bg-emerald-950 text-white rounded-xl md:rounded-[24px] font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Consultando Atelier...' : '✨ Redigir Texto'}
            </button>
            <button 
              onClick={generateVisualPreview} 
              disabled={loadingImage} 
              className="py-4 md:py-5 bg-champagne text-emerald-950 rounded-xl md:rounded-[24px] font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loadingImage ? 'Desenhando...' : '🎨 Gerar Visual'}
            </button>
          </div>
        </div>

        <div className="relative bg-white min-h-[400px] rounded-[40px] md:rounded-[60px] border border-slate-100 shadow-xl overflow-hidden flex flex-col items-center justify-center text-center p-8 md:p-12">
          <div className="absolute top-8 flex gap-2 bg-slate-50 p-1 rounded-full border border-slate-100 z-10">
            <button onClick={() => setPreviewTab('text')} className={`px-5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${previewTab === 'text' ? 'bg-white shadow-sm text-emerald-950' : 'text-slate-400'}`}>Texto</button>
            <button onClick={() => setPreviewTab('visual')} className={`px-5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${previewTab === 'visual' ? 'bg-white shadow-sm text-emerald-950' : 'text-slate-400'}`}>Visual</button>
          </div>

          {previewTab === 'text' ? (
            loading ? (
              <div className="animate-pulse space-y-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-full mx-auto"></div>
                <p className="font-display italic text-slate-400">O redator está criando...</p>
              </div>
            ) : generatedContent ? (
              <div className="animate-in fade-in duration-500 w-full text-left">
                <h5 className="text-[9px] font-black text-champagne uppercase tracking-widest mb-6">Proposta Atelier</h5>
                <div className="font-display text-base md:text-lg text-emerald-950 leading-relaxed italic whitespace-pre-wrap max-h-[350px] overflow-y-auto pr-4 scrollbar-hide">{generatedContent}</div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedContent);
                    alert("Copiado para a área de transferência!");
                  }} 
                  className="mt-8 text-[8px] font-black text-emerald-700 uppercase tracking-widest border-b border-emerald-100 hover:border-emerald-500 transition-all"
                >
                  Copiar Texto para Prancheta
                </button>
              </div>
            ) : (
              <div className="opacity-20 flex flex-col items-center">
                <span className="text-6xl mb-4">📜</span>
                <p className="font-display italic text-emerald-950">Seu conceito aparecerá aqui.</p>
              </div>
            )
          ) : (
            loadingImage ? (
              <div className="animate-pulse space-y-4">
                <div className="w-12 h-12 bg-champagne/10 rounded-full mx-auto"></div>
                <p className="font-display italic text-slate-400">Renderizando visão 4K...</p>
              </div>
            ) : visualPreview ? (
              <div className="w-full h-full p-4 animate-in zoom-in duration-500">
                <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-inner border-4 border-white">
                  <img src={visualPreview} className="w-full h-full object-cover" alt="Visual Preview" />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 to-transparent pointer-events-none"></div>
                </div>
              </div>
            ) : (
              <div className="opacity-20 flex flex-col items-center">
                <span className="text-6xl mb-4">🖼️</span>
                <p className="font-display italic text-emerald-950">Gere um visual para encantar seu cliente.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteCreatorView;
