
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
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
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

  const checkAndGetAI = async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Chave de API não detectada. Por favor, cole sua chave no botão 'Configurar API' no topo.");
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const res = reader.result as string;
          setAudioBase64(res.split(',')[1]);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Acesso ao microfone negado ou não suportado.");
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
      return alert("Por favor, preencha o Nome, Data e Local para gerar o design.");
    }
    
    setLoadingImage(true);
    setPreviewTab('visual');
    try {
      const ai = await checkAndGetAI();
      const palette = getActivePalette();
      
      // O prompt agora foca estritamente no DESIGN DO CONVITE
      const prompt = `Luxury wedding/event invitation card design. 
      Details to include in the visual style:
      - Client Name: ${formData.clientName}
      - Event Date: ${formData.date}
      - Location: ${formData.location}
      - Color Palette: ${palette}
      - Extra Details: ${formData.additionalInfo}
      The image should be a professional high-end flat lay of a physical invitation card. 
      Premium paper texture, elegant typography, minimalist gold or silver foil accents, 
      sophisticated and cinematic lighting, 8k resolution, artistic composition.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }] }],
        config: { imageConfig: { aspectRatio: "4:3" } }
      });

      const parts = response.candidates?.[0]?.content?.parts;
      const partWithImage = parts?.find(p => p.inlineData);
      
      if (partWithImage?.inlineData) {
        setVisualPreview(`data:image/png;base64,${partWithImage.inlineData.data}`);
      } else {
        alert("Não foi possível gerar o design do convite no momento.");
      }
    } catch (error: any) {
      if ((error?.message?.includes("Requested entity was not found") || error?.message?.includes("API key")) && window.aistudio) {
        await window.aistudio.openSelectKey();
      } else {
        alert(error?.message || "Erro ao gerar design.");
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
      const ai = await checkAndGetAI();
      const palette = getActivePalette();
      
      let textPrompt = "";
      if (creationType === 'cake_table') {
        textPrompt = `Descreva um conceito de mesa de bolo de luxo que harmonize perfeitamente com um convite na paleta ${palette}. 
        Anfitrião: ${formData.clientName}. 
        Data: ${formData.date}. 
        Local: ${formData.location}. 
        Instruções adicionais: ${formData.additionalInfo}. 
        Fale sobre flores, doces e iluminação de forma poética.`;
      } else {
        textPrompt = `Redija o texto de um convite de luxo para ${formData.clientName}. 
        Data: ${formData.date} às ${formData.time}. 
        Local: ${formData.location}. 
        Paleta sugerida: ${palette}. 
        Instruções extras: ${formData.additionalInfo}. 
        Use uma caligrafia verbal sofisticada e emocionante.`;
      }

      const parts: any[] = [{ text: textPrompt }];
      if (audioBase64) {
        parts.push({ inlineData: { mimeType: 'audio/webm', data: audioBase64 } });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts }
      });

      setGeneratedContent(response.text || 'O Oráculo está indisponível.');
    } catch (error: any) {
      if ((error?.message?.includes("Requested entity was not found") || error?.message?.includes("API key")) && window.aistudio) {
        await window.aistudio.openSelectKey();
      } else {
        alert(error?.message || "Erro ao gerar texto.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-display text-emerald-950">Atelier de Design AI</h2>
          <p className="text-slate-500 mt-2">Criação de convites e conceitos de mesa com inteligência de luxo.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-[24px] shadow-inner border border-slate-200">
          <button 
            onClick={() => setCreationType('invite')} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${creationType === 'invite' ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400 hover:text-emerald-900'}`}
          >
            <span>📜</span> Convite
          </button>
          <button 
            onClick={() => setCreationType('cake_table')} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${creationType === 'cake_table' ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400 hover:text-emerald-900'}`}
          >
            <span>🍰</span> Mesa do Bolo
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-900 uppercase tracking-widest ml-1">Nome do Anfitrião</label>
                <input type="text" placeholder="Ex: Maria e João" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm focus:ring-1 focus:ring-champagne transition-all" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-900 uppercase tracking-widest ml-1">Data do Evento</label>
                <input type="date" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs outline-none focus:ring-1 focus:ring-champagne transition-all" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-900 uppercase tracking-widest ml-1">Local da Festa</label>
                <input type="text" placeholder="Ex: Villa Toscana" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm focus:ring-1 focus:ring-champagne transition-all" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-900 uppercase tracking-widest ml-1">Horário</label>
                <input type="time" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs outline-none focus:ring-1 focus:ring-champagne transition-all" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-900 uppercase tracking-widest ml-1">Paleta de Cores</label>
              <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-[32px] border border-slate-100">
                {palettes.map(p => (
                  <button key={p.name} type="button" onClick={() => {setIsCustomPalette(false); setFormData({...formData, palette: p.name});}} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${(!isCustomPalette && formData.palette === p.name) ? 'bg-white shadow-sm ring-1 ring-emerald-100' : 'opacity-40 hover:opacity-100'}`}>
                    <div className="flex -space-x-1.5">
                      {p.colors.map((c, i) => (<div key={i} className="w-6 h-6 rounded-full border border-white" style={{ backgroundColor: c }}></div>))}
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-tighter text-slate-500">{p.name}</span>
                  </button>
                ))}
                <button type="button" onClick={() => setIsCustomPalette(true)} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${isCustomPalette ? 'bg-white shadow-sm ring-1 ring-emerald-100' : 'opacity-40 hover:opacity-100'}`}>
                  <div className="w-12 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">🎨</div>
                  <span className="text-[7px] font-black uppercase tracking-tighter text-slate-500">Outra</span>
                </button>
              </div>
              {isCustomPalette && (
                <input type="text" className="w-full p-4 mt-2 rounded-2xl bg-emerald-50 border border-emerald-100 text-sm outline-none" placeholder="Descreva sua paleta personalizada..." value={formData.customPaletteText} onChange={e => setFormData({...formData, customPaletteText: e.target.value})} />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-900 uppercase tracking-widest ml-1">Instruções de Estilo</label>
              <div className="relative">
                <textarea rows={3} className="w-full p-5 pr-14 rounded-[28px] bg-slate-50 border border-slate-100 outline-none text-sm resize-none focus:ring-1 focus:ring-champagne transition-all" placeholder="Ex: Toque campestre, flores secas, estilo boho chic..." value={formData.additionalInfo} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} />
                <button type="button" onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} className={`absolute right-4 bottom-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : audioBase64 ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                  {isRecording ? '⏺️' : audioBase64 ? '✅' : '🎙️'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={handleGenerateText} disabled={loading} className="py-5 bg-emerald-950 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
              {loading ? <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : `✨ Redigir ${creationType === 'invite' ? 'Convite' : 'Conceito'}`}
            </button>
            <button onClick={generateVisualPreview} disabled={loadingImage} className="py-5 bg-champagne text-emerald-950 rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
              {loadingImage ? <span className="w-3 h-3 border-2 border-emerald-950/20 border-t-emerald-950 rounded-full animate-spin"></span> : '🎨 Gerar Design do Convite'}
            </button>
          </div>
        </div>

        <div className="relative group min-h-[500px]">
          <div className="absolute -inset-1 bg-gradient-to-r from-champagne/10 to-emerald-500/10 rounded-[60px] blur opacity-25"></div>
          <div className="relative bg-white h-full rounded-[60px] border border-slate-100 shadow-xl overflow-hidden flex flex-col p-12 items-center justify-center text-center">
            
            <div className="absolute top-8 flex gap-2 bg-slate-50 p-1 rounded-full border border-slate-100 z-10">
               <button onClick={() => setPreviewTab('text')} className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${previewTab === 'text' ? 'bg-white shadow-sm text-emerald-950' : 'text-slate-400'}`}>Texto</button>
               <button onClick={() => setPreviewTab('visual')} className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${previewTab === 'visual' ? 'bg-white shadow-sm text-emerald-950' : 'text-slate-400'}`}>Design</button>
            </div>

            {previewTab === 'text' ? (
              loading ? (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full mx-auto animate-bounce flex items-center justify-center text-xl">🖋️</div>
                  <p className="font-display italic text-slate-400">Consultando o Atelier...</p>
                </div>
              ) : generatedContent ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 w-full">
                   <h5 className="text-[10px] font-black text-champagne uppercase tracking-[0.2em] mb-6">{creationType === 'invite' ? 'Sugestão de Caligrafia' : 'Descrição do Conceito'}</h5>
                   <div className="font-display text-lg text-emerald-950 leading-relaxed whitespace-pre-wrap italic text-left max-h-[400px] overflow-y-auto pr-4">{generatedContent}</div>
                   <button onClick={() => navigator.clipboard.writeText(generatedContent)} className="mt-10 text-[9px] font-black text-emerald-700 uppercase tracking-widest border-b border-emerald-100 pb-1">Copiar Texto</button>
                </div>
              ) : (
                <div className="opacity-20 flex flex-col items-center">
                  <span className="text-6xl mb-4">📜</span>
                  <p className="font-display italic">Os dados da festa darão vida à poesia.</p>
                </div>
              )
            ) : (
              loadingImage ? (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-champagne/20 rounded-full mx-auto animate-pulse flex items-center justify-center text-xl">🎨</div>
                  <p className="font-display italic text-slate-400">Criando o design perfeito...</p>
                </div>
              ) : visualPreview ? (
                <div className="w-full h-full p-4 animate-in zoom-in">
                  <div className="relative w-full h-full rounded-[40px] overflow-hidden shadow-inner border-8 border-white group">
                    <img src={visualPreview} className="w-full h-full object-cover" alt="Invitation Design" />
                    <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <p className="text-white text-[10px] font-black uppercase tracking-widest">Design Exclusivo Atelier</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="opacity-20 flex flex-col items-center">
                  <span className="text-6xl mb-4">🖼️</span>
                  <p className="font-display italic">Gere o design para visualizar o convite.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteCreatorView;
