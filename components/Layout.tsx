
import React, { useState } from 'react';
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
  const MASTER_EMAIL = "bernardoalmeida01031981@gmail.com";
  const isAdmin = userEmail.toLowerCase() === MASTER_EMAIL.toLowerCase();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'calendar', label: 'Agenda Pro', icon: '📅' },
    { id: 'events', label: 'Eventos', icon: '✨' },
    { id: 'suppliers', label: 'Fornecedores', icon: '🤝' },
    { id: 'ai-helper', label: 'Performance', icon: '📈' },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'approvals', label: 'Aprovações', icon: '⚖️' });
  }

  const navigate = (view: ViewType) => {
    setActiveView(view);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#fdfcfb]">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-emerald-950/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-emerald-950 text-white flex flex-col z-50 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-10 flex items-center gap-4 border-b border-emerald-900/50">
          <Logo className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-display text-champagne">PlanParty</h1>
            <p className="text-[9px] text-emerald-500 uppercase tracking-[0.3em] font-bold">Atelier Edition</p>
          </div>
        </div>
        
        <nav className="flex-1 px-6 space-y-2 mt-8 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id as ViewType)}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all relative ${
                activeView === item.id ? 'bg-emerald-900 text-champagne border border-emerald-800 shadow-xl' : 'text-emerald-400 hover:bg-emerald-900 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-semibold text-sm">{item.label}</span>
              {item.id === 'approvals' && pendingCount > 0 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse shadow-lg">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-emerald-900">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-champagne flex items-center justify-center text-emerald-950 font-bold shadow-lg">
              {userEmail.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-bold truncate text-white">{userEmail.split('@')[0]}</p>
              <p className="text-[9px] text-emerald-500 truncate uppercase font-bold tracking-widest">{isAdmin ? "Admin Master" : "Membro Elite"}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full py-3 rounded-xl border border-emerald-900 text-emerald-600 hover:bg-red-500/10 hover:text-red-400 transition-all text-[10px] font-bold uppercase tracking-widest">
            Sair do Atelier
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 md:px-10 flex justify-between items-center h-20 shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-emerald-950 p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {menuItems.find(m => m.id === activeView)?.label || 'Painel'}
          </h2>
          <div className="flex items-center space-x-6">
             <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Vitalício • 2026-2040</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full p-6 md:p-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
