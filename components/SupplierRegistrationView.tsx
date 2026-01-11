
import React, { useState, useEffect } from 'react';
import { Supplier } from '../types';
import Logo from './Logo';

interface SupplierRegistrationViewProps {
  onBack: () => void;
  onSuccess: (supplier: Supplier) => void;
}

const SupplierRegistrationView: React.FC<SupplierRegistrationViewProps> = ({ onBack, onSuccess }) => {
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [isCodeValidated, setIsCodeValidated] = useState(false);
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
    const correctCode = localStorage.getItem('planparty_supplier_invite_code');
    
    if (inviteCodeInput.trim().toUpperCase() === correctCode?.toUpperCase()) {
      setIsCodeValidated(true);
    } else {
      alert("Código de convite inválido ou expirado.");
    }
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
        <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 text-center space-y-6 animate-in zoom-in duration-500">
          <div className="text-6xl">✨</div>
          <h2 className="text-3xl font-display text-emerald-950">Bem-vindo à Rede!</h2>
          <p className="text-slate-500">Seu cadastro foi enviado com sucesso para o Atelier. Entraremos em contato em breve.</p>
          <button onClick={onBack} className="w-full py-4 bg-emerald-950 text-white rounded-2xl font-bold">Concluir</button>
        </div>
      </div>
    );
  }

  if (!isCodeValidated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white rounded-[40px] shadow-2xl p-10 space-y-8 text-center animate-in fade-in duration-500">
          <Logo className="w-16 h-16 mx-auto" />
          <div>
            <h2 className="text-2xl font-display text-emerald-950">Acesso Restrito</h2>
            <p className="text-slate-400 text-sm mt-2">Insira o código enviado pelo decorador para se cadastrar.</p>
          </div>
          <form onSubmit={handleValidateCode} className="space-y-4">
            <input 
              type="text" 
              required 
              placeholder="CÓDIGO-IA-EXEMPLO"
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-champagne text-center font-bold tracking-widest"
              value={inviteCodeInput}
              onChange={e => setInviteCodeInput(e.target.value.toUpperCase())}
            />
            <button type="submit" className="w-full py-4 bg-emerald-950 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-900 transition-all">
              Validar Convite
            </button>
          </form>
          <button onClick={onBack} className="text-slate-300 text-xs font-bold uppercase tracking-widest hover:text-slate-500 transition-colors">Sair</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-[40px] shadow-2xl p-10 space-y-8 border border-slate-100 animate-in slide-in-from-bottom-6 duration-700">
        <div className="text-center">
          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Convite Validado</span>
          <h2 className="text-3xl font-display text-emerald-950 mt-4">Formulário Profissional</h2>
          <p className="text-slate-400 text-sm mt-2">Complete seus dados para integrar nossa lista de fornecedores elite.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nome da Empresa / Profissional</label>
            <input required className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-champagne" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Especialidade</label>
            <select className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-champagne" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option>Mobilário</option>
              <option>Flores</option>
              <option>Doces</option>
              <option>Iluminação</option>
              <option>Buffet</option>
              <option>Foto/Vídeo</option>
              <option>Outros</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">WhatsApp</label>
            <input required placeholder="(00) 00000-0000" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-champagne" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">E-mail</label>
            <input type="email" required className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-champagne" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Instagram (@)</label>
            <input className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-champagne" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Notas / Portfólio</label>
            <textarea rows={3} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-champagne resize-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>

          <div className="md:col-span-2 pt-4">
            <button type="submit" className="w-full py-4 bg-emerald-950 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-900 transition-all">Finalizar Cadastro</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierRegistrationView;
