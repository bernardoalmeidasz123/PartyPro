
import React, { useState } from 'react';
import Logo from './Logo';

interface LoginProps {
  onLogin: (user: string) => void;
  onGoToRequest: () => void;
  onSupplierAccess: () => void;
  onGuestAccess: () => void;
  onSupplierLogin: () => void;
  authorizedEmails: string[];
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToRequest, onSupplierAccess, onGuestAccess, onSupplierLogin, authorizedEmails }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const PAYMENT_LINK = "https://pay.sunize.com.br/IwRuxnWY";
  const ADMIN_EMAIL = "bernardoalmeida19801955@gmail.com";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputEmail = email.toLowerCase().trim();
    
    // 1. Verifica se o e-mail está na whitelist
    if (!authorizedEmails.includes(inputEmail)) {
      setError("Este e-mail não possui autorização de acesso. Adquira uma licença ou aguarde a aprovação do admin.");
      return;
    }

    // 2. Se for o admin master
    if (inputEmail === ADMIN_EMAIL && password === "Ibertioga30") {
      onLogin(inputEmail);
      return;
    }

    // 3. Se for um usuário comum autorizado
    const credentials = JSON.parse(localStorage.getItem('planparty_credentials') || '{}');
    if (credentials[inputEmail] === password) {
      onLogin(inputEmail);
    } else {
      setError("Senha incorreta para este e-mail autorizado.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fdfcfb]">
      <div className="md:w-1/2 bg-emerald-950 p-16 text-white flex flex-col justify-between">
        <div className="flex items-center gap-4">
          <Logo className="w-12 h-12" />
          <h1 className="text-3xl font-display text-champagne tracking-widest">PLANPARTY</h1>
        </div>
        
        <div className="space-y-8 max-w-md">
          <h2 className="text-6xl font-display leading-tight">O Atelier da <span className="text-champagne italic">Elite</span>.</h2>
          <p className="text-emerald-300/60 leading-relaxed">Gerencie o orçamento e a agenda das festas mais luxuosas de 2026 a 2030 com ativação exclusiva por e-mail.</p>
          
          <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
             <div className="flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-champagne">R$ 100,89</span>
                <span className="text-emerald-500/40 text-xs uppercase font-black">Acesso Vitalício</span>
             </div>
             <a 
               href={PAYMENT_LINK} 
               target="_blank" 
               rel="noopener noreferrer"
               className="block w-full py-5 bg-champagne text-emerald-950 rounded-2xl font-black text-center text-[10px] uppercase tracking-widest shadow-2xl hover:bg-white transition-all"
             >
               💎 Adquirir Licença Atelier
             </a>
             <button onClick={onGoToRequest} className="w-full text-center text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:text-white transition-colors">
               Já paguei, enviar comprovante
             </button>
          </div>
        </div>

        <div className="text-[9px] font-black text-emerald-700 uppercase tracking-[0.4em]">© 2026 PlanParty Master Edition</div>
      </div>

      <div className="md:w-1/2 flex items-center justify-center p-12">
        <div className="w-full max-w-sm space-y-10 animate-in fade-in duration-700">
           <div className="space-y-2">
              <h3 className="text-3xl font-display text-emerald-950">Acessar Sistema</h3>
              <p className="text-slate-400 text-sm">Insira seu e-mail autorizado para entrar.</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              <input type="email" required className="w-full py-4 bg-transparent border-b border-slate-200 outline-none focus:border-emerald-950 transition-all" placeholder="Seu e-mail autorizado" value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" required className="w-full py-4 bg-transparent border-b border-slate-200 outline-none focus:border-emerald-950 transition-all" placeholder="Sua senha privada" value={password} onChange={e => setPassword(e.target.value)} />
              {error && <p className="text-red-500 text-[10px] font-bold bg-red-50 p-3 rounded-xl">{error}</p>}
              <button type="submit" className="w-full py-5 bg-emerald-950 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl">Entrar no Atelier</button>
           </form>

           <div className="pt-6 text-center">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">E-mail autorizado mas sem senha?</p>
              <a href="?mode=activation" className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-950 transition-colors">Ativar agora</a>
           </div>

           <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-8">
              <button onClick={onGuestAccess} className="p-4 border border-slate-100 rounded-2xl text-[9px] font-black uppercase text-slate-400 hover:text-emerald-950 hover:bg-slate-50 transition-all">🎟️ RSVP Convidados</button>
              <button onClick={onSupplierLogin} className="p-4 border border-slate-100 rounded-2xl text-[9px] font-black uppercase text-slate-400 hover:text-emerald-950 hover:bg-slate-50 transition-all">📦 Fornecedores</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
