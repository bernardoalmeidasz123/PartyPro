
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

declare var process: { env: { [key: string]: string } };
declare var window: any;

const InviteCreatorView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [inviteText, setInviteText] = useState('');
  const [visualPreview, setVisualPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'text' | 'visual'>('text');
  const [isCustomPalette, setIsCustomPalette] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [formData, setFormData] = useState({
    eventTitle: '',
    clientName: '',
    date: '',
    time: '',
    location: '',
    theme: '',
    vibe: 'Clássico Sofisticado',
    palette: 'Esmeralda & Ouro',
    customPaletteText: '',
    additionalInfo: ''
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
      throw new Error("Chave de API não configurada. Por favor, siga as instruções no topo.");
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
    if (!formData.theme) return alert("Defina um tema primeiro.");
    
    setLoadingImage(true);
    setPreviewTab('visual');
    try {
      const ai = await checkAndGetAI();
      const palette = getActivePalette();
      const prompt = `Luxury event decoration for a party themed "${formData.theme}". Color palette: ${palette}. Style/Vibe: ${formData.vibe}. High-end professional photography, 8k, cinematic lighting, sophisticated atmosphere.`;

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
        alert("Não foi possível gerar a prévia visual no momento.");
      }
    } catch (error: any) {
      if (error?.message?.includes("Requested entity was not found") && window.aistudio) {
        await window.aistudio.openSelectKey();
      } else {
        alert(error?.message || "Erro ao gerar visual.");
      }
    } finally {
      setLoadingImage(false);
    }
  };

  const handleGenerateText = async () => {
    if (!formData.eventTitle || !formData.date) return alert("Preencha ao menos título e data.");
    
    setLoading(true);
    setPreviewTab('text');
    try {
      const ai = await checkAndGetAI();
      const palette = getActivePalette();
      const textPrompt = `Redija um convite de luxo exclusivo em português para o evento "${formData.eventTitle}" da cliente ${formData.clientName}. Tema: ${formData.theme}. Data: ${formData.date} às ${formData.time}. Local: ${formData.location}. Paleta: ${palette}. Estilo: ${formData.vibe}. Instruções extras: ${formData.additionalInfo}. Seja poético e sofisticado.`;

      const parts: any[] = [{ text: textPrompt }];
      if (audioBase64) {
        parts.push({ inlineData: { mimeType: 'audio/webm', data: audioBase64 } });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts }
      });

      setInviteText(response.text || 'O Oráculo da Redação está indisponível.');
    } catch (error: any) {
      if (error?.message?.includes("Requested entity was not found") && window.aistudio) {
        await window.aistudio.openSelectKey();
      } else {
        alert(error?.message || "Erro ao redigir convite.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-display text-emerald-950">Estúdio de Convites AI</h2>
          <p className="text-slate-500 mt-2">Harmonize dados e cores para criar a poesia da sua festa.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
           <button onClick={() => setPreviewTab('text')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${previewTab === 'text' ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400'}`}>Caligrafia</button>
           <button onClick={() => setPreviewTab('visual')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${previewTab === 'visual' ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400'}`}>Visual</button>
        </div>
      </header>

      {/* Tutorial Card */}
      <div className="p-8 bg-emerald-50/50 rounded-[40px] border border-emerald-100 flex flex-col md:flex-row items-center gap-8 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl shadow-sm border border-emerald-50 shrink-0">🗝️</div>
        <div className="space-y-2 text-center md:text-left">
          <h4 className="text-[11px] font-black text-emerald-900 uppercase tracking-widest">Ativação da Inteligência Atelier</h4>
          <p className="text-xs text-emerald-800 leading-relaxed opacity-80">
            Para redigir convites e gerar previews visuais, você precisa de uma chave Gemini. 
            Acesse <a href="https://ai.google.dev" target="_blank" rel="noreferrer" className="font-bold underline decoration-champagne">ai.google.dev</a>, gere sua chave e clique no botão de <strong>Chave</strong> no topo da página para colar.
          </p>
        </div>
        <button 
          onClick={() => window.aistudio?.openSelectKey()}
          className="px-8 py-3 bg-emerald-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-900 transition-all shadow-lg"
        >
          Configurar Chave Agora
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título</label>
                <input type="text" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm" value={formData.eventTitle} onChange={e => setFormData({...formData, eventTitle: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anfitrião</label>
                <input type="text" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tema</label>
                <input type="text" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm" value={formData.theme} onChange={e => setFormData({...formData, theme: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                <input type="date" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paleta de Cores</label>
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
                <input type="text" className="w-full p-4 mt-2 rounded-2xl bg-emerald-50 border border-emerald-100 text-sm outline-none" placeholder="Descreva sua paleta..." value={formData.customPaletteText} onChange={e => setFormData({...formData, customPaletteText: e.target.value})} />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instruções de Voz ou Texto</label>
              <div className="relative">
                <textarea rows={2} className="w-full p-5 pr-14 rounded-[28px] bg-slate-50 border border-slate-100 outline-none text-sm resize-none" placeholder="Desejos extras..." value={formData.additionalInfo} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} />
                <button type="button" onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} className={`absolute right-4 bottom-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : audioBase64 ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                  {isRecording ? '⏺️' : audioBase64 ? '✅' : '🎙️'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={handleGenerateText} disabled={loading} className="py-5 bg-emerald-950 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
              {loading ? <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : '✨ Redigir Texto'}
            </button>
            <button onClick={generateVisualPreview} disabled={loadingImage} className="py-5 bg-champagne text-emerald-950 rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
              {loadingImage ? <span className="w-3 h-3 border-2 border-emerald-950/20 border-t-emerald-950 rounded-full animate-spin"></span> : '🎨 Preview Visual'}
            </button>
          </div>
        </div>

        <div className="relative group min-h-[500px]">
          <div className="absolute -inset-1 bg-gradient-to-r from-champagne/10 to-emerald-500/10 rounded-[60px] blur opacity-25"></div>
          <div className="relative bg-white h-full rounded-[60px] border border-slate-100 shadow-xl overflow-hidden flex flex-col p-12 items-center justify-center text-center">
            {previewTab === 'text' ? (
              loading ? (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full mx-auto animate-bounce flex items-center justify-center text-xl">🖋️</div>
                  <p className="font-display italic text-slate-400">Consultando o Oráculo...</p>
                </div>
              ) : inviteText ? (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                   <div className="font-display text-xl text-emerald-950 leading-relaxed whitespace-pre-wrap italic">{inviteText}</div>
                   <button onClick={() => navigator.clipboard.writeText(inviteText)} className="mt-10 text-[9px] font-black text-emerald-700 uppercase tracking-widest">Copiar Caligrafia</button>
                </div>
              ) : (
                <div className="opacity-20 flex flex-col items-center">
                  <span className="text-6xl mb-4">📜</span>
                  <p className="font-display italic">Aguardando sua inspiração.</p>
                </div>
              )
            ) : (
              loadingImage ? (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-champagne/20 rounded-full mx-auto animate-pulse flex items-center justify-center text-xl">🎨</div>
                  <p className="font-display italic text-slate-400">Pintando sua visão...</p>
                </div>
              ) : visualPreview ? (
                <div className="w-full h-full p-4 animate-in zoom-in">
                  <div className="relative w-full h-full rounded-[40px] overflow-hidden shadow-inner border-8 border-white group">
                    <img src={visualPreview} className="w-full h-full object-cover" alt="Visual Theme" />
                  </div>
                </div>
              ) : (
                <div className="opacity-20 flex flex-col items-center">
                  <span className="text-6xl mb-4">🖼️</span>
                  <p className="font-display italic">Gere o conceito visual.</p>
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
