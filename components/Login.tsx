
import React, { useState } from 'react';
import Logo from './Logo';

interface LoginProps {
  onLogin: (user: string) => void;
  onGoToRequest: () => void;
  onSupplierAccess: () => void;
  onGuestAccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToRequest, onSupplierAccess, onGuestAccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const MASTER_EMAIL = "bernardoalmeida01031981@gmail.com";
  const MASTER_PASS = "Bs01032012";
  
  const FREE_ACCESS_EMAIL = "szajnfarber@gmail.com";
  const FREE_ACCESS_PASS = "Ibertioga30";

  const SUNIZE_LINK = "https://pay.sunize.com.br/IwRuxnWY";

  const handleBuyClick = () => {
    window.open(SUNIZE_LINK, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsChecking(true);

    const inputEmail = email.toLowerCase().trim();

    setTimeout(() => {
      if (inputEmail === MASTER_EMAIL.toLowerCase() && password === MASTER_PASS) {
        onLogin(email);
        setIsChecking(false);
        return;
      }

      if (inputEmail === FREE_ACCESS_EMAIL.toLowerCase() && password === FREE_ACCESS_PASS) {
        onLogin(email);
        setIsChecking(false);
        return;
      }

      const authorized = JSON.parse(localStorage.getItem('planparty_authorized_emails') || '[]');
      const credentials = JSON.parse(localStorage.getItem('planparty_credentials') || '{}');

      if (authorized.includes(inputEmail)) {
        if (credentials[inputEmail] === password) {
          onLogin(email);
        } else {
          setError('Senha incorreta.');
        }
      } else {
        setError('Acesso não liberado. Adquira a licença para ativar sua conta no Atelier.');
      }
      setIsChecking(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fdfcfb]">
      {/* Branding Side - Luxury Context */}
      <div className="md:w-1/2 bg-emerald-950 p-12 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-900 rounded-full -mr-48 -mt-48 opacity-20 blur-3xl"></div>
        
        <div className="z-10 flex items-center gap-4">
          <Logo className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-display text-champagne tracking-tight">PlanParty</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-500 font-bold">Atelier Master</p>
          </div>
        </div>

        <div className="z-10 space-y-8">
          <h2 className="text-5xl lg:text-7xl font-display leading-tight max-w-lg">
            Sua agenda de festas <span className="text-champagne italic">2026-2030</span> com gestão total de lucro.
          </h2>
          
          <div className="bg-emerald-900/40 border border-emerald-800 p-8 rounded-[40px] backdrop-blur-md max-w-sm shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black text-champagne uppercase tracking-[0.3em]">Membro Exclusivo</span>
              <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">VITALÍCIO</span>
            </div>
            <p className="text-xl font-display">Licença Vitalícia Elite</p>
            <p className="text-emerald-300 text-xs mt-2 leading-relaxed opacity-80">
              Pagamento único para acesso ilimitado a todas as ferramentas de gestão, agenda 2026-2030 e atualizações.
            </p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-champagne text-4xl font-bold">R$ 100,89</span>
              <span className="text-emerald-600 text-xs line-through">R$ 399,00</span>
            </div>
            <button 
              onClick={handleBuyClick}
              className="mt-6 w-full py-4 bg-champagne text-emerald-950 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white hover:scale-[1.02] transition-all shadow-lg active:scale-95"
            >
              Adquirir Licença Elite
            </button>
          </div>
        </div>

        <div className="z-10 flex items-center gap-3">
           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
           <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Plataforma Ativa • Atelier Master Edition</p>
        </div>
      </div>

      {/* Login Side */}
      <div className="md:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-sm space-y-12">
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-bold text-slate-800 font-display">Entrar no Atelier</h3>
            <p className="text-slate-400 text-sm mt-3">Gerencie seus orçamentos e lucros com precisão.</p>
          </div>

          <div className="space-y-4">
             <button 
              onClick={onGuestAccess}
              className="group w-full py-5 rounded-3xl bg-emerald-50 border-2 border-emerald-100 text-emerald-950 flex items-center justify-between px-8 hover:border-emerald-200 transition-all"
            >
              <div className="text-left">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Área do Convidado</p>
                <p className="font-bold text-base">Confirmar Minha Presença</p>
              </div>
              <span className="text-2xl">🎟️</span>
            </button>

            <button 
              onClick={handleBuyClick}
              className="group w-full py-6 rounded-3xl bg-[#fcf8ef] border-2 border-champagne/20 text-emerald-950 flex items-center justify-between px-8 hover:border-champagne/60 transition-all shadow-xl shadow-champagne/5"
            >
              <div className="text-left">
                <p className="text-[10px] font-black text-champagne uppercase tracking-widest mb-1">Acesso Premium</p>
                <p className="font-bold text-base">Ativar Licença Vitalícia</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-emerald-900">R$ 100,89</p>
                <span className="text-2xl group-hover:translate-x-1 transition-transform inline-block">🚀</span>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">E-mail de Cadastro</label>
              <input
                type="email"
                required
                className="w-full px-6 py-5 rounded-3xl border border-slate-100 focus:ring-2 focus:ring-champagne outline-none transition-all bg-slate-50 font-medium"
                placeholder="exemplo@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Senha Privada</label>
              <input
                type="password"
                required
                className="w-full px-6 py-5 rounded-3xl border border-slate-100 focus:ring-2 focus:ring-champagne outline-none transition-all bg-slate-50 font-medium"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-red-500 text-[11px] font-bold text-center bg-red-50 p-4 rounded-2xl border border-red-100 animate-shake">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isChecking}
              className="w-full py-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] bg-emerald-950 text-white shadow-2xl shadow-emerald-950/30 hover:bg-emerald-900 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isChecking ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'Acessar Meu Atelier'}
            </button>
          </form>

          <button 
            onClick={onGoToRequest}
            className="w-full text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-emerald-900 transition-colors"
          >
            Já possui o recibo? <span className="text-emerald-700 underline underline-offset-4">Validar Pagamento</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
