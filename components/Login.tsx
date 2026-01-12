
import React, { useState } from 'react';
import Logo from './Logo';

interface LoginProps {
  onLogin: (user: string) => void;
  onGoToRequest: () => void;
  onSupplierAccess: () => void;
  onGuestAccess: () => void;
  onSupplierLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToRequest, onSupplierAccess, onGuestAccess, onSupplierLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const MASTER_EMAIL = "bernardoalmeida01031981@gmail.com";
  const MASTER_PASS = "Bs01032012";
  const FREE_ACCESS_EMAIL = "szajnfarber@gmail.com";
  const FREE_ACCESS_PASS = "Ibertioga30";
  
  const PAYMENT_LINK = "https://pay.sunize.com.br/IwRuxnWY";

  const handleBuyClick = () => {
    window.open(PAYMENT_LINK, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsChecking(true);

    const inputEmail = email.toLowerCase().trim();

    setTimeout(() => {
      if ((inputEmail === MASTER_EMAIL.toLowerCase() && password === MASTER_PASS) || 
          (inputEmail === FREE_ACCESS_EMAIL.toLowerCase() && password === FREE_ACCESS_PASS)) {
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
          setError('Ops! A senha parece não estar correta. Verifique e tente de novo.');
        }
      } else {
        setError('Ainda não identificamos sua licença Elite. Adquira seu acesso para entrar no Atelier.');
      }
      setIsChecking(false);
    }, 800);
  };

  const benefits = [
    { icon: '📅', title: 'Agenda 2026-2030', desc: 'Visualize o futuro e garanta datas com anos de antecedência.' },
    { icon: '🖋️', title: 'Estúdio de Convites AI', desc: 'Crie textos deslumbrantes e poéticos com o poder do Gemini AI.' },
    { icon: '💎', title: 'Lucro de Atelier', desc: 'Controle de custos e venda com precisão de mestre.' },
    { icon: '🤝', title: 'Rede de Parceiros', desc: 'Organize seus fornecedores em um só ecossistema.' },
    { icon: '📈', title: 'Visão de Negócio', desc: 'Relatórios que mostram o crescimento real do seu trabalho.' },
    { icon: '♾️', title: 'Acesso Vitalício', desc: 'Pague uma vez, use para sempre. Sem mensalidades.' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fdfcfb]">
      {/* Lado Esquerdo - Humanização e Benefícios */}
      <div className="md:w-1/2 bg-emerald-950 p-8 lg:p-16 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent)] pointer-events-none"></div>
        
        <div className="z-10 flex items-center gap-4 animate-in fade-in duration-700">
          <Logo className="w-10 h-10" />
          <h1 className="text-2xl font-display text-champagne tracking-[0.3em]">PLANPARTY</h1>
        </div>

        <div className="z-10 mt-12 space-y-12 animate-in slide-in-from-left-6 duration-1000">
          <div className="space-y-4">
            <h2 className="text-5xl lg:text-7xl font-display leading-[1.1]">
              Onde o talento vira <span className="text-champagne italic">legado</span>.
            </h2>
            <p className="text-emerald-300/80 text-lg font-light max-w-md">
              Mais que um sistema, o Atelier é o seu braço direito na criação de festas memoráveis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group cursor-default">
                <span className="text-2xl group-hover:scale-125 transition-transform duration-500">{b.icon}</span>
                <div>
                  <h4 className="text-[10px] font-black text-champagne uppercase tracking-widest">{b.title}</h4>
                  <p className="text-[10px] text-emerald-300/60 mt-1 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Founder's Note */}
          <div className="pt-8 border-t border-emerald-900 flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-emerald-900 border border-emerald-800 flex items-center justify-center text-champagne font-display text-xl shadow-inner">BA</div>
            <div className="flex-1">
              <p className="text-[9px] uppercase tracking-[0.3em] text-emerald-500 font-black mb-1">Nota do Criador</p>
              <p className="text-sm italic text-white/80 leading-relaxed">"Desenvolvi cada detalhe pensando na liberdade que um decorador precisa para sonhar alto."</p>
              <p className="text-[10px] font-bold text-champagne mt-2 uppercase tracking-widest">— Bernardo Almeida</p>
            </div>
          </div>
        </div>

        <div className="z-10 pt-12 text-[9px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-4">
           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
           Plataforma Ativa • Atelier Master Edition
        </div>
      </div>

      {/* Lado Direito - Ação */}
      <div className="md:w-1/2 flex items-center justify-center p-8 lg:p-24 overflow-y-auto bg-white/50 backdrop-blur-xl">
        <div className="w-full max-w-sm space-y-12 animate-in fade-in zoom-in duration-700">
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-4xl font-display text-emerald-950">Seja bem-vindo.</h3>
            <p className="text-slate-400 text-sm">Acesse seu refúgio de planejamento e gestão.</p>
          </div>

          {/* Call to Action - Vitalício */}
          <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-champagne/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700"></div>
            <span className="bg-emerald-950 text-champagne text-[8px] font-black px-3 py-1 rounded-full tracking-widest uppercase">Oferta Vitalícia</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-emerald-950">R$ 100,89</span>
              <span className="text-slate-300 text-xs line-through italic">R$ 399,00</span>
            </div>
            <button 
              onClick={handleBuyClick}
              className="mt-6 w-full py-5 bg-emerald-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-900 hover:scale-[1.02] active:scale-95 transition-all"
            >
              💎 Ativar Meu Acesso Agora
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  required
                  className="w-full px-0 py-4 bg-transparent border-b border-slate-200 focus:border-champagne outline-none transition-all font-medium text-sm placeholder:text-slate-300"
                  placeholder="Seu e-mail de acesso"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  className="w-full px-0 py-4 bg-transparent border-b border-slate-200 focus:border-champagne outline-none transition-all font-medium text-sm placeholder:text-slate-300"
                  placeholder="Sua senha privada"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            {error && <div className="text-red-500 text-[10px] font-bold text-center bg-red-50 p-4 rounded-2xl border border-red-100 animate-in shake duration-500">{error}</div>}
            
            <button
              type="submit"
              disabled={isChecking}
              className="w-full py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] bg-emerald-950 text-white shadow-2xl hover:bg-emerald-900 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {isChecking ? 'Reconhecendo Membro...' : 'Entrar no Atelier'}
            </button>
          </form>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={onGuestAccess} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-950 flex items-center justify-center gap-2 transition-colors">
              <span>🎟️</span> Convidados
            </button>
            <button onClick={onSupplierLogin} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-950 flex items-center justify-center gap-2 transition-colors">
              <span>📦</span> Fornecedores
            </button>
          </div>

          <div className="pt-4 text-center">
            <button onClick={onGoToRequest} className="text-[10px] font-black text-emerald-900 uppercase tracking-widest hover:underline decoration-champagne underline-offset-8">
              Já paguei, quero validar meu PIX
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
