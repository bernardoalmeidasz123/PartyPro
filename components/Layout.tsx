
import React, { useState } from 'react';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  userEmail: string;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, userEmail, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'calendar', label: 'Agenda 2026-2040', icon: '📅' },
    { id: 'events', label: 'Meus Eventos', icon: '✨' },
    { id: 'ai-helper', label: 'Assistente IA', icon: '🤖' },
  ];

  const navigate = (view: ViewType) => {
    setActiveView(view);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 w-72 bg-slate-900 text-white flex flex-col z-50 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display text-amber-400">PartyPro</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Decor & Agenda</p>
          </div>
          <button className="md:hidden text-2xl" onClick={() => setIsSidebarOpen(false)}>×</button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id as ViewType)}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all ${
                activeView === item.id ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-sm font-bold shadow-lg">
              {userEmail.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{userEmail.split('@')[0]}</p>
              <p className="text-[10px] text-slate-400 truncate uppercase">Plano Pro Activo</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl border border-slate-700 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all text-sm font-bold"
          >
            <span>🚪</span>
            <span>Sair do App</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header Responsivo */}
        <header className="bg-white border-b border-gray-200 p-4 md:px-8 flex justify-between items-center h-16 shrink-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-slate-800 p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">
              {menuItems.find(m => m.id === activeView)?.label}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-amber-500 relative">
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              🔔
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="text-right hidden xs:block">
              <p className="text-xs font-bold text-slate-800">Jane Decor</p>
              <p className="text-[10px] text-green-500 font-bold uppercase">Online</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="max-w-7xl mx-auto w-full p-4 md:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
