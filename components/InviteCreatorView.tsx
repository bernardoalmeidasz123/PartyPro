
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

  const getAIInstance = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      if (window.aistudio) await window.aistudio.openSelectKey();
      throw new Error("Chave de API não configurada.");
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
      return alert("Preencha Nome, Data e Local.");
    }
    
    setLoadingImage(true);
    setPreviewTab('visual');
    try {
      const ai = await getAIInstance();
      const palette = getActivePalette();
      
      const prompt = `Luxury event invitation design for Anfitrião ${formData.clientName}, Local ${formData.location}, Data ${formData.date}. 
      Palette: ${palette}. Professional flat-lay, high-end paper texture, cinematic lighting, 4K.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: { 
          imageConfig: { aspectRatio: "4:3", imageSize: "1K" },
          tools: [{ googleSearch: {} }]
        }
      });

      const parts = response.candidates?.[0]?.content?.parts;
      const partWithImage = parts?.find(p => p.inlineData);
      
      if (partWithImage?.inlineData) {
        setVisualPreview(`data:image/png;base64,${partWithImage.inlineData.data}`);
      } else {
        alert("Falha ao gerar imagem.");
      }
    } catch (error: any) {
      if (error?.message?.includes("Requested entity was not found") && window.aistudio) {
        await window.aistudio.openSelectKey();
      } else {
        console.error(error);
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
      
      let textPrompt = creationType === 'cake_table' 
        ? `Conceito de mesa de bolo luxo paleta ${palette} para ${formData.clientName} em ${formData.location}.`
        : `Texto convite luxo para ${formData.clientName}, data ${formData.date}, local ${formData.location}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: textPrompt }] }
      });

      setGeneratedContent(response.text || 'Falha na geração.');
    } catch (error: any) {
      if (error?.message?.includes("Requested entity was not found") && window.aistudio) {
        await window.aistudio.openSelectKey();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-display text-emerald-950">Atelier de Design AI</h2>
          <p className="text-slate-500 mt-2 text-sm">Crie convites exclusivos com Gemini 3 Pro.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl md:rounded-[24px] shadow-inner border border-slate-200 w-full md:w-auto">
          <button 
            onClick={() => setCreationType('invite')} 
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-2.5 rounded-xl md:rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${creationType === 'invite' ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400 hover:text-emerald-900'}`}
          >
            <span>📜</span> Convite
          </button>
          <button 
            onClick={() => setCreationType('cake_table')} 
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-2.5 rounded-xl md:rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${creationType === 'cake_table' ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400 hover:text-emerald-900'}`}
          >
            <span>🍰</span> Mesa
          </button>
        </div>
      </header>

      {/* API Selector Helper for Mobile */}
      {!loading && !generatedContent && !visualPreview && (
        <div className="md:hidden p-6 bg-champagne/5 rounded-[32px] border border-champagne/10 text-center space-y-4">
           <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">⚠️ Atenção Profissional</p>
           <p className="text-xs text-emerald-800 opacity-80 leading-relaxed">Para usar o gerador Pro no celular, certifique-se de que sua chave Gemini está ativa.</p>
           <button 
             onClick={() => window.aistudio?.openSelectKey()}
             className="w-full py-4 bg-emerald-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
           >
             Verificar Chave Agora
           </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-10">
        <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-slate-100 shadow-sm space-y-6 md:space-y-8">
          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-emerald-900 uppercase tracking-widest ml-1">Anfitrião</label>
                <input type="text" className="w-full p-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-emerald-900 uppercase tracking-widest ml-1">Data</label>
                <input type="date" className="w-full p-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 text-xs outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-emerald-900 uppercase tracking-widest ml-1">Local</label>
                <input type="text" className="w-full p-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-emerald-900 uppercase tracking-widest ml-1">Horário</label>
                <input type="time" className="w-full p-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 text-xs outline-none" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-emerald-900 uppercase tracking-widest ml-1">Paleta de Cores</label>
              <div className="flex flex-wrap gap-2 md:gap-3 p-3 md:p-4 bg-slate-50 rounded-2xl md:rounded-[32px] border border-slate-100">
                {palettes.map(p => (
                  <button key={p.name} type="button" onClick={() => {setIsCustomPalette(false); setFormData({...formData, palette: p.name});}} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${(!isCustomPalette && formData.palette === p.name) ? 'bg-white shadow-sm ring-1 ring-emerald-100' : 'opacity-40 hover:opacity-100'}`}>
                    <div className="flex -space-x-1">
                      {p.colors.map((c, i) => (<div key={i} className="w-5 h-5 rounded-full border border-white" style={{ backgroundColor: c }}></div>))}
                    </div>
                  </button>
                ))}
                <button type="button" onClick={() => setIsCustomPalette(true)} className={`flex flex-col items-center p-2 rounded-xl transition-all ${isCustomPalette ? 'bg-white shadow-sm ring-1 ring-emerald-100' : 'opacity-40'}`}>
                  <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px]">🎨</div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-emerald-900 uppercase tracking-widest ml-1">Instruções Extras</label>
              <div className="relative">
                <textarea rows={3} className="w-full p-4 md:p-5 pr-14 rounded-2xl md:rounded-[28px] bg-slate-50 border border-slate-100 outline-none text-sm resize-none" value={formData.additionalInfo} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} />
                <button type="button" onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} className={`absolute right-3 bottom-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg' : 'bg-emerald-50 text-emerald-600 active:scale-95'}`}>
                  {isRecording ? '⏺️' : '🎙️'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <button onClick={handleGenerateText} disabled={loading} className="py-4 md:py-5 bg-emerald-950 text-white rounded-xl md:rounded-[24px] font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
              {loading ? <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : '✨ Texto AI'}
            </button>
            <button onClick={generateVisualPreview} disabled={loadingImage} className="py-4 md:py-5 bg-champagne text-emerald-950 rounded-xl md:rounded-[24px] font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
              {loadingImage ? <span className="w-3 h-3 border-2 border-emerald-950/20 border-t-emerald-950 rounded-full animate-spin"></span> : '🎨 Design 4K'}
            </button>
          </div>
        </div>

        <div className="relative group min-h-[400px] md:min-h-[500px]">
          <div className="absolute -inset-1 bg-gradient-to-r from-champagne/10 to-emerald-500/10 rounded-[40px] md:rounded-[60px] blur opacity-25"></div>
          <div className="relative bg-white h-full rounded-[40px] md:rounded-[60px] border border-slate-100 shadow-xl overflow-hidden flex flex-col p-6 md:p-12 items-center justify-center text-center">
            
            <div className="absolute top-6 md:top-8 flex gap-2 bg-slate-50 p-1 rounded-full border border-slate-100 z-10">
               <button onClick={() => setPreviewTab('text')} className={`px-3 md:px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${previewTab === 'text' ? 'bg-white shadow-sm text-emerald-950' : 'text-slate-400'}`}>Texto</button>
               <button onClick={() => setPreviewTab('visual')} className={`px-3 md:px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${previewTab === 'visual' ? 'bg-white shadow-sm text-emerald-950' : 'text-slate-400'}`}>Design</button>
            </div>

            {previewTab === 'text' ? (
              loading ? (
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-full mx-auto animate-bounce flex items-center justify-center text-xl">🖋️</div>
                  <p className="font-display italic text-slate-400 text-sm">Consultando Atelier...</p>
                </div>
              ) : generatedContent ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 w-full">
                   <h5 className="text-[9px] font-black text-champagne uppercase tracking-[0.2em] mb-4 md:mb-6">Resultado do Estúdio</h5>
                   <div className="font-display text-base md:text-lg text-emerald-950 leading-relaxed whitespace-pre-wrap italic text-left max-h-[300px] overflow-y-auto pr-2">{generatedContent}</div>
                   <button onClick={() => navigator.clipboard.writeText(generatedContent)} className="mt-6 md:mt-10 text-[8px] font-black text-emerald-700 uppercase tracking-widest border-b border-emerald-100 pb-1">Copiar para Clipboard</button>
                </div>
              ) : (
                <div className="opacity-20 flex flex-col items-center">
                  <span className="text-5xl md:text-6xl mb-4">📜</span>
                  <p className="font-display italic text-sm">O design começa aqui.</p>
                </div>
              )
            ) : (
              loadingImage ? (
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-champagne/20 rounded-full mx-auto animate-pulse flex items-center justify-center text-xl">🎨</div>
                  <p className="font-display italic text-slate-400 text-sm">Criando visão 4K...</p>
                </div>
              ) : visualPreview ? (
                <div className="w-full h-full p-2 md:p-4 animate-in zoom-in">
                  <div className="relative w-full h-full rounded-[24px] md:rounded-[40px] overflow-hidden shadow-inner border-4 md:border-8 border-white">
                    <img src={visualPreview} className="w-full h-full object-cover" alt="Invitation" />
                  </div>
                </div>
              ) : (
                <div className="opacity-20 flex flex-col items-center">
                  <span className="text-5xl md:text-6xl mb-4">🖼️</span>
                  <p className="font-display italic text-sm">Visualização do Convite.</p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteCreatorView;
