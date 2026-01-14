
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
import GuestConfirmationView from './components/GuestConfirmationView';
import SupplierLoginView from './components/SupplierLoginView';
import InviteCreatorView from './components/InviteCreatorView';
import BudgetPlannerView from './components/BudgetPlannerView';
import RegisterView from './components/RegisterView';
import AIChatHelper from './components/AIChatHelper';
import { EventParty, ViewType, AccessRequest, Supplier } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [events, setEvents] = useState<EventParty[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>([]);
  const [authView, setAuthView] = useState<'login' | 'request' | 'activation' | 'guest-rsvp' | 'supplier-login' | 'supplier-reg'>('login');
  
  const MASTER_EMAIL = "bernardoalmeida19801955@gmail.com";

  useEffect(() => {
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

    const savedAuthorized = localStorage.getItem('planparty_authorized_emails');
    if (savedAuthorized) {
      setAuthorizedEmails(JSON.parse(savedAuthorized));
    } else {
      setAuthorizedEmails([MASTER_EMAIL]);
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'activation') setAuthView('activation');
  }, []);

  useEffect(() => {
    localStorage.setItem('planparty_requests', JSON.stringify(pendingRequests));
  }, [pendingRequests]);

  useEffect(() => {
    localStorage.setItem('planparty_authorized_emails', JSON.stringify(authorizedEmails));
  }, [authorizedEmails]);

  useEffect(() => {
    localStorage.setItem('planparty_suppliers', JSON.stringify(suppliers));
    localStorage.setItem('planparty_events', JSON.stringify(events));
  }, [suppliers, events]);

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
    setAuthView('login');
  };

  const authorizeNewEmail = (email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    if (!authorizedEmails.includes(cleanEmail)) {
      setAuthorizedEmails(prev => [...prev, cleanEmail]);
    }
  };

  const revokeEmail = (email: string) => {
    if (email === MASTER_EMAIL) return; 
    setAuthorizedEmails(prev => prev.filter(e => e !== email));
  };

  if (!isLoggedIn) {
    switch (authView) {
      case 'request': 
        return <RequestAccessView onBack={() => setAuthView('login')} onSubmit={(req) => setPendingRequests([...pendingRequests, req])} />;
      case 'activation': 
        return <RegisterView onBack={() => setAuthView('login')} onSuccess={handleLogin} authorizedEmails={authorizedEmails} />;
      case 'guest-rsvp':
        return <GuestConfirmationView events={events} onBack={() => setAuthView('login')} onConfirm={(eid, name) => {
          setEvents(events.map(ev => ev.id === eid ? { ...ev, confirmedGuests: [...(ev.confirmedGuests || []), name] } : ev));
        }} />;
      case 'supplier-login':
        return <SupplierLoginView suppliers={suppliers} onBack={() => setAuthView('login')} onLogin={(s) => { handleLogin(s.email); setActiveView('suppliers'); }} onGoToRegistration={() => setAuthView('supplier-reg')} />;
      case 'supplier-reg':
        return <SupplierRegistrationView onBack={() => setAuthView('supplier-login')} onSuccess={(s) => setSuppliers([...suppliers, s])} />;
      default: 
        return <Login onLogin={handleLogin} onGoToRequest={() => setAuthView('request')} onGuestAccess={() => setAuthView('guest-rsvp')} onSupplierLogin={() => setAuthView('supplier-login')} onSupplierAccess={() => setAuthView('supplier-reg')} authorizedEmails={authorizedEmails} />;
    }
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard events={events} />;
      case 'calendar': return <CalendarView events={events} />;
      case 'events': return <EventList events={events} setEvents={setEvents} />;
      case 'invite-creator': return <InviteCreatorView />;
      case 'ai-helper': return <BudgetPlannerView events={events} setEvents={setEvents} />;
      case 'suppliers': return <SupplierListView suppliers={suppliers} setSuppliers={setSuppliers} />;
      case 'chat-helper': return <AIChatHelper />;
      case 'approvals': 
        return (
          <AdminApprovalView 
            requests={pendingRequests} 
            authorizedEmails={authorizedEmails}
            onApprove={(id) => {
              const req = pendingRequests.find(r => r.id === id);
              if (req) authorizeNewEmail(req.email);
              setPendingRequests(pendingRequests.map(r => r.id === id ? { ...r, status: 'Aprovado' } : r));
            }}
            onManualAdd={authorizeNewEmail}
            onRevoke={revokeEmail}
          />
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
      pendingCount={userEmail === MASTER_EMAIL ? pendingRequests.filter(r => r.status === 'Pendente').length : 0}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
