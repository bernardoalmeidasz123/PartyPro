
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

  // Credenciais Hardcoded
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
      // 1. Admin Master
      if (inputEmail === MASTER_EMAIL.toLowerCase() && password === MASTER_PASS) {
        onLogin(email);
        setIsChecking(false);
        return;
      }

      // 2. Acesso Gratuito szajnfarber
      if (inputEmail === FREE_ACCESS_EMAIL.toLowerCase() && password === FREE_ACCESS_PASS) {
        onLogin(email);
        setIsChecking(false);
        return;
      }

      // 3. Assinantes Autorizados no LocalStorage
      const authorized = JSON.parse(localStorage.getItem('planparty_authorized_emails') || '[]');
      const credentials = JSON.parse(localStorage.getItem('planparty_credentials') || '{}');

      if (authorized.includes(inputEmail)) {
        if (credentials[inputEmail] === password) {
          onLogin(email);
        } else {
          setError('Senha incorreta.');
        }
      } else {
        setError('E-mail não autorizado ou aguardando aprovação do admin.');
      }
      setIsChecking(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Coluna Esquerda - Identidade Visual */}
      <div className="md:w-1/2 bg-emerald-950 p-12 text-white flex flex-col justify-between overflow-hidden relative">
        <div className="z-10 flex items-center gap-4">
          <Logo className="w-12 h-12" />
          <h1 className="text-3xl font-display text-champagne">PlanParty Elite</h1>
        </div>
        <div className="z-10">
          <h2 className="text-5xl font-display mb-6 leading-tight">Onde as melhores festas <span className="text-champagne italic">começam.</span></h2>
          <p className="text-emerald-300 max-w-sm text-lg opacity-80">A plataforma definitiva para decoradores de alto padrão e fornecedores elite.</p>
        </div>
        <div className="z-10 flex items-center gap-2">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Servidor Seguro 2026-2040</p>
        </div>
      </div>

      {/* Coluna Direita - Login/Ações */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-slate-50/30">
        <div className="w-full max-w-sm space-y-10">
          
          <div className="text-center">
            <h3 className="text-3xl font-bold text-slate-800 font-display">Acesso ao Atelier</h3>
            <p className="text-slate-400 text-sm mt-2">Escolha seu portal de entrada.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <input
                type="email"
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-champagne outline-none transition-all bg-white"
                placeholder="E-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="group">
              <input
                type="password"
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-champagne outline-none transition-all bg-white"
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-xs font-bold px-2 text-center">{error}</p>}
            <button
              type="submit"
              disabled={isChecking}
              className="w-full py-4 rounded-2xl font-bold bg-emerald-950 text-white shadow-xl hover:bg-emerald-900 active:scale-[0.98] transition-all"
            >
              {isChecking ? 'Verificando Credenciais...' : 'Entrar no Painel'}
            </button>
          </form>

          {/* Área de Fornecedor */}
          <div className="bg-white p-6 rounded-[32px] border border-emerald-100 shadow-lg shadow-emerald-950/5 text-center space-y-4">
             <div className="text-xs font-black text-emerald-600 uppercase tracking-widest">Área de Parceiros</div>
             <p className="text-slate-500 text-xs px-4">É um fornecedor convidado? Use seu código IA para se cadastrar.</p>
             <button 
                onClick={onSupplierAccess}
                className="w-full py-3 rounded-xl border border-emerald-200 text-emerald-900 font-bold text-xs uppercase hover:bg-emerald-50 transition-all"
             >
                Sou Fornecedor
             </button>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
            <p className="text-slate-400 text-xs font-medium">Não tem acesso? <button onClick={onGoToRequest} className="text-emerald-700 font-bold hover:underline">Solicitar agora</button></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
