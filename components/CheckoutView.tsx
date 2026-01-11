
import React, { useState } from 'react';
import { EventParty } from '../types';

interface CheckoutViewProps {
  onBack: () => void;
}

const CheckoutView: React.FC<CheckoutViewProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  const REGISTRATION_LINK = `${window.location.origin}/?mode=activation`;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStep('processing');
    
    // Simulação de Webhook/Aprovação
    const savedEvents = JSON.parse(localStorage.getItem('planparty_events') || '[]');
    
    const newActivationEvent: EventParty = {
      id: Math.random().toString(36).substr(2, 9),
      title: `💎 Ativação: ${email.split('@')[0]}`,
      clientName: email,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      location: 'Checkout Sunize',
      theme: 'Venda Vitalícia',
      status: 'Pendente', // Inicia pendente para aprovação (IA ou Manual)
      budgetItems: [],
      totalBudget: 99.90,
      totalSupplierCost: 0,
      notes: `Aguardando ativação de credenciais. Comprovante anexado via sistema.`,
      externalLink: REGISTRATION_LINK
    };

    localStorage.setItem('planparty_events', JSON.stringify([...savedEvents, newActivationEvent]));
    
    setTimeout(() => {
      setStep('success');
    }, 1500);
  };

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 border-4 border-champagne border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-display text-white">Processando Comprovante...</h2>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="text-7xl mb-4">👑</div>
          <h2 className="text-4xl font-display text-emerald-950">Venda e Comprovante Enviados!</h2>
          
          <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 text-left space-y-6 shadow-sm">
            <p className="text-slate-500 text-sm">
              Um novo item de <strong>Ativação Pendente</strong> foi inserido na sua programação. 
              Você ou a IA Gemini podem aprová-lo agora para liberar o acesso.
            </p>
            
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Link Gerado para Programação:</p>
              <code className="text-xs text-emerald-900 break-all">{REGISTRATION_LINK}</code>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button 
              onClick={onBack}
              className="px-8 py-4 bg-emerald-950 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-900 transition-all text-sm"
            >
              Ir para Programação
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-white text-emerald-950 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm"
            >
              Nova Simulação
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl overflow-hidden p-10">
        <h3 className="text-2xl font-bold text-slate-800 font-display mb-6">Simulador de Aprovação</h3>
        <form onSubmit={handlePayment} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">E-mail da Compra Aprovada</label>
            <input 
              type="email" 
              required 
              placeholder="cliente@email.com"
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-champagne"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-emerald-950 text-white py-4 rounded-2xl font-bold shadow-xl">
            Aprovar e Enviar p/ Programação
          </button>
          <button type="button" onClick={onBack} className="w-full text-slate-400 text-sm font-bold">Cancelar</button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutView;
