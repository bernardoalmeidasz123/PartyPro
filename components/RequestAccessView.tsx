
import React, { useState } from 'react';
import Logo from './Logo';
import { AccessRequest } from '../types';

interface RequestAccessViewProps {
  onBack: () => void;
  onSubmit: (request: AccessRequest) => void;
}

const RequestAccessView: React.FC<RequestAccessViewProps> = ({ onBack, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !file) {
      alert("Por favor, preencha o e-mail e anexe o comprovante PDF.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newRequest: AccessRequest = {
        id: Math.random().toString(36).substr(2, 9),
        email: email.toLowerCase().trim(),
        timestamp: Date.now(),
        status: 'Pendente',
        proofName: file.name
      };
      setLoading(false);
      alert("Solicitação enviada! O administrador Bernardo irá analisar seu comprovante e liberar seu acesso em breve.");
      onSubmit(newRequest);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 space-y-8 animate-in fade-in zoom-in duration-500 border border-slate-100">
        <div className="text-center">
          <Logo className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-display text-emerald-950">Solicitar Acesso</h2>
          <p className="text-slate-400 text-sm mt-2">Para quem comprou via Sunize sem link direto.</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">E-mail usado na compra</label>
            <input 
              type="email" 
              required 
              placeholder="ex: voce@email.com"
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-champagne transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Anexar Comprovante (PDF/JPG)</label>
            <div className="relative group">
              <input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png"
                required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
              <div className="w-full p-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all">
                <span className="text-3xl mb-2">📄</span>
                <span className="text-xs font-bold text-slate-400">
                  {file ? file.name : "Clique para selecionar o arquivo"}
                </span>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold bg-emerald-950 text-white shadow-xl hover:bg-emerald-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar para Aprovação"}
          </button>
        </form>

        <button onClick={onBack} className="w-full text-slate-400 text-sm font-bold">Voltar ao Login</button>
      </div>
    </div>
  );
};

export default RequestAccessView;
