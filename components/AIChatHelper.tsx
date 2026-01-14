
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const AIChatHelper: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'Olá! Sou o Concierge do Atelier. Como posso ajudar no planejamento do seu próximo evento de luxo?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initChat = () => {
    if (!chatRef.current) {
      // Uso direto da chave injetada
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: 'Você é um planejador de eventos de elite, sofisticado, criativo e prestativo. Ajude com tendências, logística, etiqueta e design.',
        },
      });
    }
    return chatRef.current;
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userMsg = inputText;
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const chat = initChat();
      const response: GenerateContentResponse = await chat.sendMessage({ message: userMsg });
      
      if (response.text) {
        setMessages(prev => [...prev, { role: 'model', text: response.text }]);
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.message?.includes('API Key') 
        ? '⚠️ Erro de Sistema: Chave de API não encontrada.' 
        : 'Perdão, tive um contratempo momentâneo. Tente novamente.';
      setMessages(prev => [...prev, { role: 'model', text: msg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-700">
      <header className="mb-6 flex-shrink-0">
        <h2 className="text-4xl font-display text-emerald-950 font-bold">Concierge AI</h2>
        <p className="text-slate-500 italic">Seu assistente pessoal disponível 24h para consultoria de eventos.</p>
      </header>

      <div className="flex-1 bg-white rounded-[48px] border border-slate-100 shadow-xl overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-6 rounded-[24px] text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-emerald-950 text-white rounded-tr-none' 
                  : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-slate-50 p-6 rounded-[24px] rounded-tl-none border border-slate-100">
                 <div className="flex gap-2">
                   <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
                   <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
                 </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
          <input 
            type="text" 
            placeholder="Pergunte sobre tendências, cronogramas ou ideias..." 
            className="flex-1 p-5 rounded-3xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all text-sm"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !inputText}
            className="w-16 h-16 bg-emerald-950 rounded-full text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:scale-100"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatHelper;
