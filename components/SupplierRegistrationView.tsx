
import React, { useState } from 'react';
import { Supplier } from '../types';
import Logo from './Logo';

interface SupplierRegistrationViewProps {
  onBack: () => void;
  onSuccess: (supplier: Supplier) => void;
}

const SupplierRegistrationView: React.FC<SupplierRegistrationViewProps> = ({ onBack, onSuccess }) => {
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [isCodeValidated, setIsCodeValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Mobilário',
    phone: '',
    email: '',
    instagram: '',
    notes: ''
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleValidateCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    // Simulação de validação com delay para efeito de "conferência de lista"
    setTimeout(() => {
      const correctCode = localStorage.getItem('planparty_supplier_invite_code');
      
      if (inviteCodeInput.trim().toUpperCase() === correctCode?.toUpperCase()) {
        setIsCodeValidated(true);
      } else {
        setError("Chave de acesso não reconhecida em nosso Atelier.");
      }
      setIsValidating(false);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSupplier: Supplier = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      registeredAt: Date.now()
    };
    onSuccess(newSupplier);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[60px] shadow-2xl p-12 text-center space-y-8 animate-in zoom-in duration-500">
          <div className="text-6xl animate-bounce">✨</div>
          <div className="space-y-2">
            <h2 className="text-3xl font-display text-emerald-950">Seja bem-vindo!</h2>
            <p className="text-slate-500 text-sm leading-relaxed">Seus dados foram integrados ao ecossistema do Atelier. Bernardo Almeida analisará seu perfil em breve.</p>
          </div>
          <button onClick={onBack} className="w-full py-5 bg-emerald-950 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-emerald-900 transition-all">
            Ir para o Início
          </button>
        </div>
      </div>
    );
  }

  // TELA DE DIGITAR O CÓDIGO (Desejada pelo usuário)
  if (!isCodeValidated) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Elementos decorativos de luxo */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-champagne/5 rounded-full -mr-64 -mt-64 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-900/40 rounded-full -ml-32 -mb-32 blur-2xl"></div>

        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[60px] p-10 md:p-14 space-y-12 text-center animate-in fade-in zoom-in duration-700 relative z-10">
          <div className="space-y-6">
            <Logo className="w-20 h-20 mx-auto" color="#d4af37" />
            <div className="space-y-2">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Ecossistema Profissional</span>
              <h2 className="text-3xl font-display text-white">Chave de Acesso</h2>
              <p className="text-emerald-300/50 text-xs leading-relaxed max-w-[240px] mx-auto">
                Insira o código de convite enviado pelo seu decorador master para validar seu cadastro.
              </p>
            </div>
          </div>

          <form onSubmit={handleValidateCode} className="space-y-6">
            <div className="relative group">
              <input 
                type="text" 
                required 
                autoFocus
                placeholder="PRO-2026-XXXX"
                className="w-full py-6 bg-white/5 border-b-2 border-emerald-900 focus:border-champagne text-white outline-none text-center font-display text-2xl tracking-[0.2em] transition-all placeholder:text-emerald-900/30 uppercase"
                value={inviteCodeInput}
                onChange={e => setInviteCodeInput(e.target.value.toUpperCase())}
              />
              <div className="absolute -bottom-px left-0 w-0 h-[2px] bg-champagne transition-all duration-700 group-focus-within:w-full"></div>
            </div>

            {error && (
              <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest bg-red-950/30 p-4 rounded-2xl border border-red-900/20">
                {error}
              </p>
            )}

            <button 
              type="submit" 
              disabled={isValidating || !inviteCodeInput}
              className={`w-full py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${
                isValidating 
                  ? 'bg-emerald-900 text-emerald-700 cursor-wait' 
                  : 'bg-champagne text-emerald-950 shadow-2xl shadow-champagne/10 hover:bg-white hover:scale-[1.02] active:scale-95'
              }`}
            >
              {isValidating ? (
                <>
                  <span className="w-4 h-4 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin"></span>
                  Conferindo Lista...
                </>
              ) : 'Validar Minha Chave'}
            </button>
          </form>

          <button 
            onClick={onBack} 
            className="text-emerald-600 text-[9px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors"
          >
            Voltar para o Início
          </button>
        </div>
      </div>
    );
  }

  // TELA DE CADASTRO (Aparece após validar)
  return (
    <div className="min-h-screen bg-[#fdfcfb] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-[60px] shadow-2xl p-10 md:p-14 space-y-12 border border-slate-100 animate-in slide-in-from-bottom-6 duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-50 pb-8">
          <div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full uppercase tracking-widest">Acesso Autorizado</span>
            <h2 className="text-4xl font-display text-emerald-950 mt-4">Sua Ficha de Parceiro</h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">Conte-nos um pouco sobre a sua arte e especialidade.</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
             <span className="text-[8px] font-black text-slate-300 uppercase">Chave Ativa</span>
             <code className="text-xs font-bold text-emerald-950 tracking-widest">{inviteCodeInput}</code>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Empresa ou Profissional</label>
            <input required className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-2 focus:ring-champagne transition-all text-sm font-medium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Atelier das Flores" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sua Especialidade</label>
            <select className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-2 focus:ring-champagne transition-all text-sm font-medium appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option>Mobilário</option>
              <option>Flores</option>
              <option>Doces</option>
              <option>Iluminação</option>
              <option>Buffet</option>
              <option>Foto/Vídeo</option>
              <option>Outros</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp de Contato</label>
            <input required placeholder="(00) 00000-0000" className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-2 focus:ring-champagne transition-all text-sm font-medium" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
            <input type="email" required className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-2 focus:ring-champagne transition-all text-sm font-medium" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="contato@empresa.com" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Portfólio / Instagram</label>
            <input className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-2 focus:ring-champagne transition-all text-sm font-medium" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} placeholder="@seuinstagram" />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Apresentação / Experiência</label>
            <textarea rows={4} className="w-full p-6 rounded-[32px] bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-2 focus:ring-champagne transition-all text-sm font-medium resize-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Conte-nos um pouco sobre seu trabalho em eventos..." />
          </div>

          <div className="md:col-span-2 pt-6">
            <button type="submit" className="w-full py-6 bg-emerald-950 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-emerald-900 hover:-translate-y-1 transition-all active:scale-95">
              Enviar Solicitação de Parceria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierRegistrationView;
