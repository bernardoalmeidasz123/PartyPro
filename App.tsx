
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import EventList from './components/EventList';
import Login from './components/Login';
import { EventParty, ViewType } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [events, setEvents] = useState<EventParty[]>([]);

  // Carregar dados
  useEffect(() => {
    const savedSession = localStorage.getItem('partypro_session');
    if (savedSession) {
      setIsLoggedIn(true);
      setUserEmail(savedSession);
    }

    const savedEvents = localStorage.getItem('partypro_events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      setEvents([]); // Começa vazio conforme solicitado
    }
  }, []);

  // Salvar dados
  useEffect(() => {
    localStorage.setItem('partypro_events', JSON.stringify(events));
  }, [events]);

  const handleLogin = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    localStorage.setItem('partypro_session', email);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    localStorage.removeItem('partypro_session');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard events={events} />;
      case 'calendar':
        return <CalendarView events={events} />;
      case 'events':
        return <EventList events={events} setEvents={setEvents} />;
      case 'ai-helper':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto p-6">
            <div className="w-24 h-24 bg-amber-100 rounded-3xl flex items-center justify-center text-5xl mb-8 shadow-inner animate-bounce">🤖</div>
            <h2 className="text-4xl font-display text-slate-800 mb-6">Assistente PartyPro</h2>
            <p className="text-slate-600 mb-10 text-xl leading-relaxed">
              Analiso seus custos de fornecedores e ajudo a maximizar seu lucro por festa.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <button onClick={() => setActiveView('events')} className="group p-6 bg-white border border-gray-200 rounded-3xl hover:border-amber-400 transition-all shadow-sm text-left">
                <div className="text-2xl mb-2">💰</div>
                <p className="font-bold text-slate-800">Calcular Margens</p>
                <p className="text-sm text-slate-500">Veja o lucro real de cada item da sua decoração.</p>
              </button>
              <button className="group p-6 bg-white border border-gray-200 rounded-3xl opacity-50 cursor-not-allowed shadow-sm text-left">
                <div className="text-2xl mb-2">🎨</div>
                <p className="font-bold text-slate-800">Tendências 2026</p>
                <p className="text-sm text-slate-500">Em breve: Novidades do mercado de festas.</p>
              </button>
            </div>
          </div>
        );
      default:
        return <Dashboard events={events} />;
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView} userEmail={userEmail} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;
