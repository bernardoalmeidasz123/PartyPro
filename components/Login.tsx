
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (user: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10">
        <div className="bg-amber-500 p-8 text-center text-white">
          <h1 className="text-4xl font-display font-bold">PartyPro</h1>
          <p className="mt-2 text-amber-100 uppercase tracking-widest text-xs font-semibold">Decor & Management</p>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            {isRegistering ? 'Criar sua conta' : 'Acesse sua agenda'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                placeholder="exemplo@partypro.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {!isRegistering && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-amber-600 font-semibold hover:underline">Esqueceu a senha?</button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transform active:scale-[0.98] transition-all shadow-lg"
            >
              {isRegistering ? 'Registrar Agora' : 'Entrar no Painel'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              {isRegistering ? 'Já possui conta?' : 'Ainda não é membro?'}
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="ml-2 text-amber-600 font-bold hover:underline"
              >
                {isRegistering ? 'Fazer Login' : 'Cadastre-se'}
              </button>
            </p>
          </div>
        </div>
      </div>
      
      <p className="absolute bottom-4 text-slate-500 text-[10px] uppercase tracking-widest">
        Plataforma Profissional v2.0 • 2026-2040
      </p>
    </div>
  );
};

export default Login;
