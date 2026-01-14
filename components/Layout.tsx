
import React, { useState, useEffect } from 'react';
import { ViewType } from '../types';
import Logo from './Logo';

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

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Resumo', icon: '🍷' },
    { id: 'calendar', label: 'Agenda 26-30', icon: '📅' },
    { id: 'events', label: 'Criações', icon: '✨' },
    { id: 'ai-helper', label: 'Orçamentos', icon: '📊' },
    { id: 'invite-creator', label: 'Estúdio AI', icon: '✍️' },
    { id: 'chat-helper', label: 'Concierge AI', icon: '💬' },
    { id: 'suppliers', label: 'Parceiros', icon: '🤝' },
  ];

  const isAdmin = userEmail === "bernardoalmeida19801955@gmail.com";
  if (isAdmin) menuItems.push({ id: 'approvals', label: 'Admin', icon: '💎' });

  return (
    <div className="flex h-screen overflow-hidden bg-[#fdfcfb]">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-emerald-950/70 backdrop-blur-md z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-emerald-950 text-white flex flex-col z-50 transition-transform duration-500 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-10 flex items-center gap-4">
          <Logo className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-display text-champagne tracking-widest">ATELIER</h1>
            <p className="text-[7px] text-emerald-500 uppercase tracking-[0.4em] font-black mt-1">Gestão de Elite</p>
          </div>
        </div>
        
        <nav className="flex-1 px-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id as ViewType); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-3xl transition-all ${
                activeView === item.id ? 'bg-white/10 text-champagne shadow-inner ring-1 ring-white/10' : 'text-emerald-400/60 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-bold text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5 space-y-4">
          <p className="text-[10px] font-bold text-center opacity-40 uppercase tracking-widest truncate">{userEmail}</p>
          <button onClick={onLogout} className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-emerald-700 hover:text-red-400 transition-colors">Sair</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-2xl border-b border-slate-100 h-20 md:h-24 flex items-center justify-between px-6 md:px-12 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-emerald-950 p-2 text-2xl">☰</button>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{greeting}, Membro Elite</p>
              <h2 className="text-lg md:text-xl font-display text-emerald-950 leading-none mt-1">
                {menuItems.find(i => i.id === activeView)?.label || 'Dashboard'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
             <span className="text-lg">⚡</span>
             <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase tracking-widest text-emerald-800">Fast AI Active</span>
               <span className="text-[6px] font-bold uppercase tracking-widest text-emerald-600/60">Gemini Flash Lite</span>
             </div>
          </div>
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
