
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
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !file || !preview) {
      alert("Por favor, preencha o e-mail e anexe o comprovante de pagamento.");
      return;
    }

    setLoading(true);
    
    const newRequest: AccessRequest = {
      id: Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase().trim(),
      timestamp: Date.now(),
      status: 'Pendente',
      proofName: file.name,
      proofData: preview
    };
    
    setTimeout(() => {
      setLoading(false);
      alert("Comprovante enviado com sucesso! Bernardo irá analisar seu pagamento de R$ 100,89 e liberar seu acesso Elite em instantes.");
      onSubmit(newRequest);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-[48px] shadow-2xl p-12 space-y-10 animate-in fade-in zoom-in duration-700 border border-slate-100 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -mr-10 -mt-10 opacity-50"></div>
        
        <div className="text-center relative">
          <Logo className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-display text-emerald-950">Ativação Vitalícia</h2>
          <p className="text-emerald-600 font-bold text-lg mt-2">Valor: R$ 100,89</p>
          <p className="text-slate-400 text-[11px] mt-4 max-w-xs mx-auto uppercase tracking-widest leading-relaxed">
            Realize o PIX para o administrador e anexe o comprovante abaixo.
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-emerald-900 uppercase ml-1 tracking-widest">E-mail que terá acesso</label>
            <input 
              type="email" 
              required 
              placeholder="seu@email.com"
              className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-champagne focus:bg-white transition-all text-emerald-950 font-medium"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-emerald-900 uppercase ml-1 tracking-widest">Comprovante de R$ 100,89</label>
            <div className="relative group">
              <input 
                type="file" 
                accept="image/*,.pdf"
                required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                onChange={handleFileChange}
              />
              <div className={`w-full p-10 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center transition-all ${
                preview ? 'bg-emerald-50/30 border-emerald-200' : 'bg-slate-50 border-slate-200 group-hover:bg-emerald-50 group-hover:border-emerald-200'
              }`}>
                {preview ? (
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs font-bold text-emerald-700">Comprovante anexado ✨</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Toque para alterar o arquivo</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl mb-4">💳</div>
                    <span className="text-sm font-bold text-slate-500">Anexar Recibo de Pagamento</span>
                    <span className="text-[10px] text-slate-300 uppercase mt-2 tracking-widest">JPG, PNG ou PDF</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading || !file}
              className={`w-full py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 ${
                loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-950 text-white hover:bg-emerald-900 hover:-translate-y-1 active:scale-95 shadow-emerald-950/20'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-emerald-950 rounded-full animate-spin"></div>
                  Validando...
                </>
              ) : (
                <>Finalizar Compra & Ativar</>
              )}
            </button>
            <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
               <span className="text-2xl">🛡️</span>
               <p className="text-[9px] text-emerald-800 font-bold uppercase leading-relaxed tracking-wider">
                 Seus dados estão protegidos. A liberação ocorrerá manualmente por Bernardo Almeida após a conferência.
               </p>
            </div>
          </div>
        </form>

        <button onClick={onBack} className="w-full text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors">Voltar para Login</button>
      </div>
    </div>
  );
};

export default RequestAccessView;
