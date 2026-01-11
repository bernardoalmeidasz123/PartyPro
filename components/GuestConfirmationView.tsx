
import React, { useState } from 'react';
import Logo from './Logo';
import { EventParty } from '../types';

interface GuestConfirmationViewProps {
  events: EventParty[];
  onConfirm: (eventId: string, guestName: string) => void;
  onBack: () => void;
}

const GuestConfirmationView: React.FC<GuestConfirmationViewProps> = ({ events, onConfirm, onBack }) => {
  const [step, setStep] = useState<'validate' | 'confirm' | 'success'>('validate');
  const [partyNameInput, setPartyNameInput] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [guestName, setGuestName] = useState('');
  const [validatedEvent, setValidatedEvent] = useState<EventParty | null>(null);
  const [error, setError] = useState('');

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const event = events.find(ev => 
      ev.title.toLowerCase().trim() === partyNameInput.toLowerCase().trim() && 
      ev.inviteCode?.toUpperCase() === inviteCodeInput.toUpperCase().trim()
    );

    if (event) {
      setValidatedEvent(event);
      setStep('confirm');
    } else {
      setError('Festa ou código não encontrados. Verifique seu convite.');
    }
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !validatedEvent) return;
    onConfirm(validatedEvent.id, guestName);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 text-center space-y-8 animate-in zoom-in duration-500">
          <div className="text-6xl">✨</div>
          <div>
            <h2 className="text-3xl font-display text-emerald-950">Confirmado!</h2>
            <p className="text-slate-500 mt-2">Sua presença em <strong>{validatedEvent?.title}</strong> foi registrada com sucesso.</p>
          </div>
          <button 
            onClick={onBack}
            className="w-full py-5 bg-emerald-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-champagne/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      
      <div className="max-w-md w-full bg-white rounded-[48px] shadow-2xl p-10 md:p-14 space-y-10 border border-slate-100 animate-in slide-in-from-bottom-6 duration-700">
        <div className="text-center">
          <Logo className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl font-display text-emerald-950">RSVP Elite</h2>
          <p className="text-slate-400 text-xs uppercase tracking-widest mt-2">Portal de Confirmação</p>
        </div>

        {step === 'validate' ? (
          <form onSubmit={handleValidate} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Festa</label>
              <input 
                required 
                placeholder="Ex: Casamento Luísa & Pedro"
                className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-champagne transition-all"
                value={partyNameInput}
                onChange={e => setPartyNameInput(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código do Convite</label>
              <input 
                required 
                placeholder="#PARTY-XXXX"
                className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-champagne font-mono text-center tracking-widest"
                value={inviteCodeInput}
                onChange={e => setInviteCodeInput(e.target.value.toUpperCase())}
              />
            </div>
            {error && <p className="text-red-500 text-[10px] font-bold text-center bg-red-50 p-3 rounded-xl">{error}</p>}
            <button className="w-full py-5 bg-emerald-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-950/20 hover:scale-[1.02] active:scale-95 transition-all">
              Acessar Convite
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirm} className="space-y-6">
            <div className="text-center p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
               <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Você está em:</span>
               <p className="text-xl font-display text-emerald-950 mt-1">{validatedEvent?.title}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu Nome Completo</label>
              <input 
                required 
                autoFocus
                placeholder="Como deve aparecer na lista"
                className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-champagne transition-all"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
              />
            </div>
            <button className="w-full py-5 bg-emerald-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-950/20 hover:scale-[1.02] active:scale-95 transition-all">
              Confirmar Agora
            </button>
          </form>
        )}

        <button onClick={onBack} className="w-full text-slate-300 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
      </div>
    </div>
  );
};

export default GuestConfirmationView;
