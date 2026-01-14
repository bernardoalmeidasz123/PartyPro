
import React, { useState } from 'react';
import Logo from './Logo';

interface RegisterViewProps {
  onBack: () => void;
  onSuccess: (email: string) => void;
  authorizedEmails: string[];
}

const RegisterView: React.FC<RegisterViewProps> = ({ onBack, onSuccess, authorizedEmails }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const inputEmail = email.toLowerCase().trim();

    // Validação da Whitelist
    if (!authorizedEmails.includes(inputEmail)) {
      setError('Este e-mail ainda não foi autorizado pelo administrador. Envie seu comprovante primeiro.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Salva as credenciais do usuário autorizado
      const credentials = JSON.parse(localStorage.getItem('planparty_credentials') || '{}');
      credentials[inputEmail] = password;
      localStorage.setItem('planparty_credentials', JSON.stringify(credentials));

      setLoading(false);
      onSuccess(inputEmail);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl overflow-hidden p-10 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center">
          <Logo className="w-16 h-16 mb-4" />
          <h2 className="text-3xl font-display text-emerald-950">Ativação de Membro</h2>
          <p className="text-slate-400 text-sm mt-2">Crie sua senha para o e-mail autorizado.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">E-mail Autorizado</label>
            <input
              type="email"
              required
              className="w-full px-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-champagne outline-none transition-all"
              placeholder="Digite seu e-mail cadastrado"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Criar Senha Privada</label>
            <input
              type="password"
              required
              className="w-full px-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-champagne outline-none transition-all"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Confirmar Senha</label>
            <input
              type="password"
              required
              className="w-full px-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-champagne outline-none transition-all"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3 ${
              loading ? 'bg-slate-100 text-slate-400' : 'bg-emerald-950 text-white hover:bg-emerald-900 active:scale-[0.98]'
            }`}
          >
            {loading ? 'Validando Autorização...' : 'Ativar Meu Acesso'}
          </button>
        </form>

        <button onClick={onBack} className="w-full text-slate-400 text-sm hover:text-emerald-950 font-medium">
          Voltar para o Login
        </button>
      </div>
    </div>
  );
};

export default RegisterView;
