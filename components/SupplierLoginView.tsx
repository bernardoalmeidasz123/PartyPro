
import React, { useState } from 'react';
import Logo from './Logo';
import { Supplier } from '../types';

interface SupplierLoginViewProps {
  suppliers: Supplier[];
  onBack: () => void;
  onLogin: (supplier: Supplier) => void;
  onGoToRegistration: () => void;
}

const SupplierLoginView: React.FC<SupplierLoginViewProps> = ({ suppliers, onBack, onLogin, onGoToRegistration }) => {
  const [email, setEmail] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setError('');

    setTimeout(() => {
      const supplier = suppliers.find(s => s.email.toLowerCase().trim() === email.toLowerCase().trim());
      
      if (supplier) {
        onLogin(supplier);
      } else {
        setError('E-mail de fornecedor não encontrado em nossa rede.');
      }
      setIsChecking(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decoração de fundo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-900/20 rounded-full -mr-48 -mt-48 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-champagne/5 rounded-full -ml-32 -mb-32 blur-2xl"></div>
      
      <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-[48px] shadow-2xl p-10 md:p-14 space-y-10 animate-in fade-in zoom-in duration-500 relative z-10">
        <div className="text-center">
          <Logo className="w-16 h-16 mx-auto mb-6" color="#d4af37" />
          <h2 className="text-3xl font-display text-champagne">Painel do Parceiro</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Acesso Exclusivo Fornecedores</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail Corporativo</label>
            <input 
              type="email" 
              required 
              autoFocus
              placeholder="seu@email.com"
              className="w-full p-5 rounded-2xl bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-champagne transition-all placeholder:text-slate-700"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-400 text-[10px] font-bold text-center bg-red-950/20 p-4 rounded-xl border border-red-900/30 animate-in shake duration-300">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isChecking}
            className="w-full py-5 bg-champagne text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-white active:scale-95 transition-all"
          >
            {isChecking ? 'Reconhecendo...' : 'Entrar no Ecossistema'}
          </button>
        </form>

        <div className="pt-6 border-t border-slate-700/50 text-center space-y-6">
          <div className="space-y-2">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Ainda não é parceiro?</p>
            <button 
              onClick={onGoToRegistration}
              className="w-full py-4 border border-emerald-800 text-emerald-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-900/30 hover:text-white transition-all group"
            >
              💎 Cadastre-se com seu Código
            </button>
          </div>
          
          <button 
            onClick={onBack} 
            className="text-slate-600 text-[10px] font-black uppercase tracking-widest hover:text-slate-400 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierLoginView;
