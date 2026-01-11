
import React, { useState } from 'react';
import Logo from './Logo';
import { Supplier } from '../types';

interface SupplierLoginViewProps {
  suppliers: Supplier[];
  onBack: () => void;
  onLogin: (supplier: Supplier) => void;
}

const SupplierLoginView: React.FC<SupplierLoginViewProps> = ({ suppliers, onBack, onLogin }) => {
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
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-900/20 rounded-full -mr-48 -mt-48 blur-3xl"></div>
      
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-[48px] shadow-2xl p-10 md:p-14 space-y-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <Logo className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl font-display text-champagne">Painel do Parceiro</h2>
          <p className="text-slate-400 text-xs uppercase tracking-widest mt-2">Acesso Restrito a Fornecedores</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail Cadastrado</label>
            <input 
              type="email" 
              required 
              autoFocus
              placeholder="fornecedor@empresa.com"
              className="w-full p-5 rounded-2xl bg-slate-900 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-champagne transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {error && <p className="text-red-400 text-[10px] font-bold text-center bg-red-900/20 p-4 rounded-xl border border-red-900/30">{error}</p>}

          <button 
            type="submit" 
            disabled={isChecking}
            className="w-full py-5 bg-champagne text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-white active:scale-95 transition-all"
          >
            {isChecking ? 'Verificando...' : 'Acessar Painel'}
          </button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            Ainda não é parceiro?<br/>
            Peça o link de convite ao decorador.
          </p>
          <button onClick={onBack} className="w-full text-slate-600 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Voltar</button>
        </div>
      </div>
    </div>
  );
};

export default SupplierLoginView;
