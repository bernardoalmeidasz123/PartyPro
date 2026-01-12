
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

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');

    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const val = await window.aistudio.hasSelectedApiKey();
          setHasKey(val);
        } catch (e) {
          setHasKey(false);
        }
      }
    };
    
    checkKey();
    const interval = setInterval(checkKey, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
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

  const MASTER_EMAIL = "bernardoalmeida19801955@gmail.com";
  const isAdmin = userEmail.toLowerCase() === MASTER_EMAIL.toLowerCase();

  if (isAdmin) {
    menuItems.push({ id: 'approvals', label: 'Novos Membros', icon: '💎' });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#fdfcfb]">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-emerald-950/70 backdrop-blur-md z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-emerald-950 text-white flex flex-col z-50 transition-transform duration-500 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-10 flex items-center gap-4">
          <Logo className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-display text-champagne tracking-widest">ATELIER</h1>
            <p className="text-[7px] text-emerald-500 uppercase tracking-[0.4em] font-black mt-1">Design Profissional</p>
          </div>
        </div>
        
        <nav className="flex-1 px-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id as ViewType); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-3xl transition-all ${
                activeView === item.id ? 'bg-white/5 text-champagne' : 'text-emerald-400/60 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-bold text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
              {item.id === 'approvals' && pendingCount > 0 && (
                <span className="absolute right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
          ))}
        </nav>

        {/* API Config Sidebar Section - Mobile Priority */}
        <div className="p-6 border-t border-white/5">
           <button 
             onClick={handleSelectKey}
             className={`w-full p-4 rounded-2xl flex items-center gap-3 border transition-all ${
               hasKey ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-champagne/10 border-champagne/20 text-champagne animate-pulse'
             }`}
           >
             <span className="text-xl">{hasKey ? '✅' : '🔑'}</span>
             <div className="text-left">
                <p className="text-[9px] font-black uppercase tracking-widest leading-none">Status da IA</p>
                <p className="text-[7px] font-bold uppercase opacity-60 mt-1">{hasKey ? 'Motor Conectado' : 'Configurar Chave'}</p>
             </div>
           </button>
        </div>

        <div className="p-8 space-y-4">
          <p className="text-[10px] font-bold text-center opacity-40 uppercase tracking-widest truncate">{userEmail}</p>
          <button onClick={onLogout} className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-emerald-700 hover:text-red-400">Sair</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-2xl border-b border-slate-100 h-20 md:h-24 flex items-center justify-between px-6 md:px-12 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-emerald-950 p-2 text-2xl">☰</button>
            <div className="truncate">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{greeting}, Membro ✨</p>
              <h2 className="text-lg md:text-xl font-display text-emerald-950 leading-none mt-1">Central de Design</h2>
            </div>
          </div>
          
          <button 
            onClick={handleSelectKey}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${
              hasKey ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-champagne/10 border-champagne/20 text-champagne animate-pulse'
            }`}
          >
            <span className="text-sm">{hasKey ? '✅' : '🔑'}</span>
            <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">{hasKey ? 'IA Ativa' : 'Configurar API'}</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#fdfcfb]">
          <div className="max-w-6xl mx-auto p-6 md:p-14">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
