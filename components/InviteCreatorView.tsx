
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

  const vibes = ['Clássico Sofisticado', 'Moderno Minimalista', 'Festa Explosiva', 'Boho Chic', 'Conto de Fadas'];
  
  const palettes = [
    { name: 'Esmeralda & Ouro', colors: ['#022c22', '#d4af37'] },
    { name: 'Rose & Champagne', colors: ['#f4d7d7', '#f7e7ce'] },
    { name: 'Noite Estrelada', colors: ['#0c0c1d', '#c0c0c0'] },
    { name: 'Minimalista Branco', colors: ['#ffffff', '#e2e8f0'] },
    { name: 'Bordeaux & Prata', colors: ['#4c0519', '#e5e7eb'] }
  ];

  const checkAndGetAI = async () => {
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const res = reader.result as string;
          const base64String = res.split(',')[1];
          setAudioBase64(base64String);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      alert("Permissão de microfone negada ou indisponível.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const getActivePalette = () => {
    return isCustomPalette ? formData.customPaletteText : formData.palette;
  };

  const generateVisualPreview = async () => {
    if (!formData.theme) {
      alert("Defina um tema antes de gerar a visualização do atelier.");
      return;
    }

    const palette = getActivePalette();
    if (isCustomPalette && !palette) {
      alert("Por favor, descreva sua paleta personalizada.");
      return;
    }

    setLoadingImage(true);
    setPreviewTab('visual');
    try {
      const ai = await checkAndGetAI();
      const prompt = `A high-end, luxury event decoration concept for a party themed "${formData.theme}". 
      Color palette: ${palette}. 
      Style: ${formData.vibe}. 
      The image should look like a professional event designer's 3D render or a high-fashion photograph of a ballroom. 
      Include elegant floral arrangements, sophisticated lighting, and premium furniture. Cinematic lighting, 8k resolution, ultra-detailed.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          imageConfig: { aspectRatio: "4:3" }
        }
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setVisualPreview(`data:image/png;base64,${part.inlineData.data}`);
          foundImage = true;
          break;
        }
      }
      
      if (!foundImage) {
        alert("O Oráculo não conseguiu gerar a imagem no momento. Tente novamente.");
      }
    } catch (error: any) {
      console.error("Erro ao gerar visual:", error);
      alert(`Falha no Preview Visual: ${error?.message || "Erro desconhecido"}.`);
    } finally {
      setLoadingImage(false);
    }
  };

  const handleGenerateText = async () => {
    if (!formData.eventTitle || !formData.date) {
      alert("Por favor, preencha pelo menos o título e a data do evento.");
      return;
    }

    const palette = getActivePalette();

    setLoading(true);
    setPreviewTab('text');
    try {
      const ai = await checkAndGetAI();
      
      const textPrompt = `Você é um redator de convites de luxo para um Atelier de Festas Elite. 
      Crie um convite deslumbrante em português para:
      Evento: ${formData.eventTitle}
      Cliente: ${formData.clientName}
      Data: ${formData.date} às ${formData.time}
      Local: ${formData.location}
      Tema: ${formData.theme}
      Vibe/Estilo: ${formData.vibe}
      Paleta de Cores: ${palette}
      ${formData.additionalInfo ? `Instruções Adicionais: ${formData.additionalInfo}` : ''}

      O texto deve ser poético, acolhedor e transmitir exclusividade. Use referências às cores selecionadas.`;

      const parts: any[] = [{ text: textPrompt }];

      if (audioBase64) {
        parts.push({
          inlineData: {
            mimeType: 'audio/webm',
            data: audioBase64,
          },
        });
        parts[0].text += "\n\nO áudio anexo contém o tom de voz e desejos específicos do cliente.";
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [ { text: textPrompt } ] },
      });

      setInviteText(response.text || 'O Oráculo está em silêncio. Tente novamente.');
    } catch (error: any) {
      console.error("Erro ao gerar convite:", error);
      alert(`Falha no Oráculo AI: ${error?.message || "Erro desconhecido"}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-display text-emerald-950">Estúdio de Convites AI</h2>
          <p className="text-slate-500 mt-2">Harmonize dados, cores e voz para criar a poesia da sua festa.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
           <button 
             onClick={() => setPreviewTab('text')}
             className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${previewTab === 'text' ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400'}`}
           >
             Caligrafia
           </button>
           <button 
             onClick={() => setPreviewTab('visual')}
             className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${previewTab === 'visual' ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400'}`}
           >
             Visual
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Evento</label>
                <input 
                  type="text" 
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white outline-none transition-all text-sm font-medium"
                  placeholder="Ex: Bodas de Ouro"
                  value={formData.eventTitle}
                  onChange={e => setFormData({...formData, eventTitle: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anfitrião</label>
                <input 
                  type="text" 
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white outline-none transition-all text-sm font-medium"
                  placeholder="Nome do cliente"
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tema da Celebração</label>
                <input 
                  type="text" 
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white outline-none transition-all text-sm font-medium"
                  placeholder="Ex: Jardim Encantado de Inverno"
                  value={formData.theme}
                  onChange={e => setFormData({...formData, theme: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data & Hora</label>
                <div className="flex gap-2">
                  <input type="date" className="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  <input type="time" className="w-24 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paleta de Cores</label>
              <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-[32px] border border-slate-100">
                {palettes.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setIsCustomPalette(false);
                      setFormData({...formData, palette: p.name});
                    }}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${(!isCustomPalette && formData.palette === p.name) ? 'bg-white shadow-sm ring-1 ring-emerald-100' : 'opacity-40 hover:opacity-100'}`}
                  >
                    <div className="flex -space-x-1.5">
                      {p.colors.map((c, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border border-white" style={{ backgroundColor: c }}></div>
                      ))}
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-tighter text-slate-500">{p.name}</span>
                  </button>
                ))}
                
                <button
                  type="button"
                  onClick={() => setIsCustomPalette(true)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${isCustomPalette ? 'bg-white shadow-sm ring-1 ring-emerald-100' : 'opacity-40 hover:opacity-100'}`}
                >
                  <div className="w-12 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">🎨</div>
                  <span className="text-[7px] font-black uppercase tracking-tighter text-slate-500">Outra</span>
                </button>
              </div>

              {isCustomPalette && (
                <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                  <input 
                    type="text" 
                    className="w-full p-4 rounded-2xl bg-emerald-50 border border-emerald-100 focus:bg-white outline-none transition-all text-sm font-medium placeholder:text-emerald-900/30"
                    placeholder="Descreva a paleta (ex: Tons pastéis e Prata)"
                    value={formData.customPaletteText}
                    onChange={e => setFormData({...formData, customPaletteText: e.target.value})}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instruções por Voz ou Texto</label>
              <div className="relative">
                <textarea 
                  rows={2}
                  className="w-full p-5 pr-14 rounded-[28px] bg-slate-50 border border-slate-100 focus:bg-white outline-none transition-all text-sm font-medium resize-none"
                  placeholder="Desejos específicos..."
                  value={formData.additionalInfo}
                  onChange={e => setFormData({...formData, additionalInfo: e.target.value})}
                />
                <button 
                  type="button"
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  className={`absolute right-4 bottom-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isRecording ? 'bg-red-500 text-white animate-pulse' : audioBase64 ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {isRecording ? '⏺️' : audioBase64 ? '✅' : '🎙️'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={handleGenerateText}
              disabled={loading}
              className="py-5 bg-emerald-950 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-900 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : '✨ Redigir Texto'}
            </button>
            <button 
              onClick={generateVisualPreview}
              disabled={loadingImage}
              className="py-5 bg-champagne text-emerald-950 rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-white transition-all flex items-center justify-center gap-2"
            >
              {loadingImage ? <span className="w-3 h-3 border-2 border-emerald-950/20 border-t-emerald-950 rounded-full animate-spin"></span> : '🎨 Preview Visual'}
            </button>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-champagne/10 to-emerald-500/10 rounded-[60px] blur opacity-25"></div>
          <div className="relative bg-white min-h-[500px] h-full rounded-[60px] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
            
            <div className="flex-1 p-12 flex flex-col items-center justify-center text-center">
              {previewTab === 'text' ? (
                loading ? (
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full mx-auto animate-bounce flex items-center justify-center text-xl">🖋️</div>
                    <p className="font-display italic text-slate-400">Consultando o Oráculo da Caligrafia...</p>
                  </div>
                ) : inviteText ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                     <div className="font-display text-xl md:text-2xl text-emerald-950 leading-relaxed whitespace-pre-wrap italic">
                       {inviteText}
                     </div>
                     <button 
                       type="button"
                       onClick={() => navigator.clipboard.writeText(inviteText)}
                       className="mt-10 text-[9px] font-black text-emerald-700 uppercase tracking-widest hover:text-emerald-950"
                     >
                       Copiar Caligrafia
                     </button>
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
                    <p className="font-display italic text-slate-400">Pintando sua visão artística...</p>
                  </div>
                ) : visualPreview ? (
                  <div className="w-full h-full p-4 animate-in zoom-in duration-700">
                    <div className="relative w-full h-full rounded-[40px] overflow-hidden shadow-inner border-8 border-white">
                      <img src={visualPreview} className="w-full h-full object-cover" alt="Visual Theme" />
                      <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/80 backdrop-blur-md rounded-2xl text-left border border-white/50">
                        <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Inspiration Board</p>
                        <p className="text-[9px] text-slate-500 font-medium">Conceito artístico gerado pelo Atelier AI para o tema: {formData.theme}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="opacity-20 flex flex-col items-center">
                    <span className="text-6xl mb-4">🖼️</span>
                    <p className="font-display italic">Gere um Preview Visual do tema.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteCreatorView;
