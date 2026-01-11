
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import EventList from './components/EventList';
import Login from './components/Login';
import RequestAccessView from './components/RequestAccessView';
import AdminApprovalView from './components/AdminApprovalView';
import SupplierRegistrationView from './components/SupplierRegistrationView';
import SupplierListView from './components/SupplierListView';
import { EventParty, ViewType, AccessRequest, Supplier } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [events, setEvents] = useState<EventParty[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [authView, setAuthView] = useState<'login' | 'request' | 'supplier-reg'>('login');
  
  const MASTER_EMAIL = "bernardoalmeida01031981@gmail.com";

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'supplier-registration') {
      setAuthView('supplier-reg');
    }

    const savedSession = localStorage.getItem('planparty_session');
    if (savedSession) {
      setIsLoggedIn(true);
      setUserEmail(savedSession);
    }

    const savedEvents = localStorage.getItem('planparty_events');
    if (savedEvents) setEvents(JSON.parse(savedEvents));

    const savedRequests = localStorage.getItem('planparty_requests');
    if (savedRequests) setPendingRequests(JSON.parse(savedRequests));

    const savedSuppliers = localStorage.getItem('planparty_suppliers');
    if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
  }, []);

  useEffect(() => {
    localStorage.setItem('planparty_requests', JSON.stringify(pendingRequests));
  }, [pendingRequests]);

  useEffect(() => {
    localStorage.setItem('planparty_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('planparty_events', JSON.stringify(events));
  }, [events]);

  const isAdmin = userEmail.toLowerCase() === MASTER_EMAIL.toLowerCase();

  const handleLogin = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    localStorage.setItem('planparty_session', email);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    localStorage.removeItem('planparty_session');
    setActiveView('dashboard');
  };

  const handleApproveRequest = (requestId: string) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (!request) return;

    const authorized = JSON.parse(localStorage.getItem('planparty_authorized_emails') || '[]');
    if (!authorized.includes(request.email.toLowerCase())) {
      authorized.push(request.email.toLowerCase());
      localStorage.setItem('planparty_authorized_emails', JSON.stringify(authorized));
    }

    const credentials = JSON.parse(localStorage.getItem('planparty_credentials') || '{}');
    const defaultPass = request.email.split('@')[0] + '123';
    credentials[request.email.toLowerCase()] = defaultPass;
    localStorage.setItem('planparty_credentials', JSON.stringify(credentials));

    setPendingRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: 'Aprovado' } : r
    ));

    alert(`Acesso liberado para ${request.email}. Senha inicial: ${defaultPass}`);
  };

  const handleRejectRequest = (requestId: string) => {
    if (window.confirm("Tem certeza que deseja rejeitar esta solicitação?")) {
      setPendingRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: 'Rejeitado' } : r
      ));
    }
  };

  const handleAddSupplier = (supplier: Supplier) => {
    setSuppliers(prev => [...prev, supplier]);
  };

  if (!isLoggedIn) {
    if (authView === 'supplier-reg') {
      return (
        <SupplierRegistrationView 
          onBack={() => {
            window.history.replaceState({}, document.title, window.location.pathname);
            setAuthView('login');
          }}
          onSuccess={(s) => {
            handleAddSupplier(s);
          }}
        />
      );
    }
    if (authView === 'request') {
      return (
        <RequestAccessView 
          onBack={() => setAuthView('login')} 
          onSubmit={(req) => {
            setPendingRequests([...pendingRequests, req]);
            setAuthView('login');
          }}
        />
      );
    }
    return (
      <Login 
        onLogin={handleLogin} 
        onGoToRequest={() => setAuthView('request')} 
        onSupplierAccess={() => setAuthView('supplier-reg')}
      />
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard events={events} />;
      case 'calendar': return <CalendarView events={events} />;
      case 'events': return <EventList events={events} setEvents={setEvents} />;
      case 'suppliers': return <SupplierListView suppliers={suppliers} setSuppliers={setSuppliers} />;
      case 'approvals': 
        return <AdminApprovalView requests={pendingRequests} onApprove={handleApproveRequest} onReject={handleRejectRequest} />;
      case 'ai-helper':
        return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-2xl mx-auto space-y-6 animate-in fade-in duration-700">
            <div className="text-6xl">📈</div>
            <h2 className="text-3xl font-display text-emerald-950">Performance Atelier</h2>
            <p className="text-slate-500">Relatórios consolidados de fornecedores e lucratividade anual.</p>
          </div>
        );
      default: return <Dashboard events={events} />;
    }
  };

  return (
    <Layout 
      activeView={activeView} 
      setActiveView={setActiveView} 
      userEmail={userEmail} 
      onLogout={handleLogout}
      pendingCount={isAdmin ? pendingRequests.filter(r => r.status === 'Pendente').length : 0}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
