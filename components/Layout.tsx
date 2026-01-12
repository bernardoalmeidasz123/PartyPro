
import React, { useState, useEffect } from 'react';
import { ViewType } from '../types';
import Logo from './Logo';

declare var window: any;

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  userEmail: string;
  onLogout: () => void;
  pendingCount?: number;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, userEmail, onLogout, pendingCount = 0 }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const MASTER_EMAIL = "bernardoalmeida19801955@gmail.com";
  const isAdmin = userEmail.toLowerCase() === MASTER_EMAIL.toLowerCase();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');

    if (window.aistudio) {
      window.aistudio.hasSelectedApiKey().then((val: boolean) => setHasKey(val));
    }
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      // Abre o diálogo oficial do Google AI Studio para o usuário colar a chave
      await window.aistudio.openSelectKey();
      // Assume-se que o usuário colou a chave com sucesso no diálogo
      setHasKey(true);
      setShowHelp(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Resumo', icon: '🍷' },
    { id: 'calendar', label: 'Minha Agenda', icon: '📅' },
    { id: 'events', label: 'Criações', icon: '✨' },
    { id: 'invite-creator', label: 'Estúdio AI', icon: '✍️' },
    { id: 'suppliers', label: 'Parceiros', icon: '🤝' },
    { id: 'ai-helper', label: 'Evolução', icon: '📈' },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'approvals', label: 'Novos Membros', icon: '💎' });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#fdfcfb]">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-emerald-950 text-white flex flex-col z-50 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-10 flex items-center gap-4">
          <Logo className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-display text-champagne tracking-widest">ATELIER</h1>
            <p className="text-[8px] text-emerald-500 uppercase tracking-[0.4em] font-black">Membro Profissional</p>
          </div>
        </div>
        
        <nav className="flex-1 px-6 space-y-1 mt-8 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id as ViewType); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-3xl transition-all relative group ${
                activeView === item.id ? 'bg-white/5 text-champagne shadow-inner shadow-black/20' : 'text-emerald-400/70 hover:text-white'
              }`}
            >
              <span className="text-lg group-hover:scale-125 transition-transform duration-500">{item.icon}</span>
              <span className="font-bold text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
              {item.id === 'approvals' && pendingCount > 0 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-8 space-y-6">
          <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 text-center">
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Bem-vindo(a) de volta</p>
            <p className="text-xs font-bold truncate text-white/90">{userEmail.split('@')[0]}</p>
          </div>
          <button onClick={onLogout} className="w-full py-4 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-700 hover:text-red-400 transition-colors">
            Encerrar Atelier
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/60 backdrop-blur-xl border-b border-slate-100 h-24 shrink-0 flex items-center justify-between px-8 md:px-12">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-emerald-950 p-2">☰</button>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{greeting}, {userEmail.split('@')[0]} ✨</p>
              <h2 className="text-xl font-display text-emerald-950 mt-1">Qual sonho vamos planejar hoje?</h2>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4 relative">
             <div className="relative group">
                <button 
                  onMouseEnter={() => setShowHelp(true)}
                  onMouseLeave={() => setShowHelp(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100"
                >
                  ?
                </button>
                {showHelp && (
                  <div className="absolute top-12 right-0 w-64 bg-white p-6 rounded-[32px] shadow-2xl border border-slate-100 z-[60] animate-in fade-in slide-in-from-top-2">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-4">Como Conectar a IA</p>
                    <div className="space-y-4 text-[10px] text-slate-500 leading-relaxed">
                      <p>1. Acesse <strong>ai.google.dev</strong></p>
                      <p>2. Clique em <strong>Get API Key</strong>.</p>
                      <p>3. Clique no botão ao lado e <strong>cole sua chave</strong> no campo que aparecer.</p>
                      <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="block pt-2 text-emerald-900 font-bold hover:underline italic">Ver docs de faturamento ↗</a>
                    </div>
                  </div>
                )}
             </div>
             
             <button 
               onClick={handleSelectKey}
               className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all ${hasKey ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-champagne/10 border-champagne/20 text-champagne animate-pulse'}`}
               title="Clique para abrir o campo e colar sua chave API"
             >
               <span className="text-sm">🔑</span>
               <div className="text-left">
                  <p className="text-[9px] font-black uppercase tracking-widest leading-none">{hasKey ? 'IA Conectada' : 'Configurar API'}</p>
                  <p className="text-[7px] font-bold uppercase opacity-60 leading-none mt-1">{hasKey ? 'Clique para trocar' : 'Cole sua chave aqui'}</p>
               </div>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#fdfcfb]">
          <div className="max-w-6xl mx-auto w-full p-8 md:p-14">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
