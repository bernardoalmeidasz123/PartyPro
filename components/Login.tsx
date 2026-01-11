import React, { useState } from 'react';
import Logo from './Logo';

interface LoginProps {
  onLogin: (user: string) => void;
  onGoToRequest: () => void;
  onSupplierAccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToRequest, onSupplierAccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const MASTER_EMAIL = "bernardoalmeida01031981@gmail.com";
  const MASTER_PASS = "Bs01032012";
  
  const FREE_ACCESS_EMAIL = "szajnfarber@gmail.com";
  const FREE_ACCESS_PASS = "Ibertioga30";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsChecking(true);

    const inputEmail = email.toLowerCase().trim();

    setTimeout(() => {
      // Login Master
      if (inputEmail === MASTER_EMAIL.toLowerCase() && password === MASTER_PASS) {
        onLogin(email);
        setIsChecking(false);
        return;
      }

      // Acesso Cortesia
      if (inputEmail === FREE_ACCESS_EMAIL.toLowerCase() && password === FREE_ACCESS_PASS) {
        onLogin(email);
        setIsChecking(false);
        return;
      }

      // Verificação de credenciais aprovadas no LocalStorage
      const authorized = JSON.parse(localStorage.getItem('planparty_authorized_emails') || '[]');
      const credentials = JSON.parse(localStorage.getItem('planparty_credentials') || '{}');

      if (authorized.includes(inputEmail)) {
        if (credentials[inputEmail] === password) {
          onLogin(email);
        } else {
          setError('Senha incorreta.');
        }
      } else {
        setError('E-mail não autorizado. Aguarde aprovação manual do Administrador.');
      }
      setIsChecking(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fdfcfb]">
      {/* Branding Side */}
      <div className="md:w-1/2 bg-emerald-950 p-12 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="z-10 flex items-center gap-4">
          <Logo className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-display text-champagne tracking-tight">PlanParty</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-500 font-bold">Atelier Edition</p>
          </div>
        </div>

        <div className="z-10 space-y-6">
          <h2 className="text-5xl lg:text-6xl font-display leading-tight">
            Gestão de <span className="text-champagne italic">Elite</span> para grandes celebrações.
          </h2>
          <p className="text-emerald-300 max-w-md text-lg opacity-70 leading-relaxed">
            Plataforma dedicada a decoradores e organizadores de alto padrão.
          </p>
        </div>

        <div className="z-10 flex items-center gap-3">
           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
           <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Sessão Segura • Agenda 2026-2030</p>
        </div>
      </div>

      {/* Login Side */}
      <div className="md:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-sm space-y-12">
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-bold text-slate-800 font-display">Bem-vindo ao Atelier</h3>
            <p className="text-slate-400 text-sm mt-3">Acesse sua agenda de festas profissional.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">E-mail Profissional</label>
              <input
                type="email"
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-champagne outline-none transition-all bg-white"
                placeholder="exemplo@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Senha de Acesso</label>
              <input
                type="password"
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-champagne outline-none transition-all bg-white"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
            <button
              type="submit"
              disabled={isChecking}
              className="w-full py-4 rounded-2xl font-bold bg-emerald-950 text-white shadow-xl hover:bg-emerald-900 transition-all flex items-center justify-center gap-2"
            >
              {isChecking ? 'Verificando...' : 'Acessar Painel Master'}
            </button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#fdfcfb] px-4 text-slate-300 font-bold tracking-widest">OU</span></div>
          </div>

          <button 
            onClick={onSupplierAccess}
            className="w-full py-4 rounded-2xl bg-white border border-emerald-100 text-emerald-900 font-bold text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-sm"
          >
            Portal do Fornecedor Convidado
          </button>

          <div className="text-center">
            <p className="text-slate-400 text-xs">
              Ainda não possui acesso? <button onClick={onGoToRequest} className="text-emerald-700 font-bold hover:underline">Solicitar aprovação manual</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;