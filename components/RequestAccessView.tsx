
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
      <div className="max-w-4xl w-full bg-white rounded-[48px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-700">
        
        {/* Info Column */}
        <div className="md:w-1/3 bg-emerald-950 p-10 text-white space-y-8">
           <Logo className="w-12 h-12" />
           <div className="space-y-4">
             <h3 className="text-2xl font-display text-champagne">Benefícios Vitalícios</h3>
             <ul className="space-y-4">
               {[
                 'Acesso à Agenda 2026-2030',
                 'Dashboard de Lucro Real',
                 'Portal RSVP de Convidados',
                 'Rede de Fornecedores Master',
                 'Relatórios de Performance AI',
                 'Atualizações Gratuitas',
                 'Sem taxas mensais'
               ].map((item, idx) => (
                 <li key={idx} className="flex items-start gap-3 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                   <span className="text-emerald-500">✓</span> {item}
                 </li>
               ))}
             </ul>
           </div>
           
           <div className="pt-8 border-t border-emerald-900">
              <p className="text-[10px] font-black text-champagne uppercase tracking-widest">Valor do Investimento</p>
              <p className="text-3xl font-display mt-2">R$ 100,89</p>
              <p className="text-[9px] text-emerald-500 mt-1 uppercase font-bold">Pagamento Único Vitalício</p>
           </div>
        </div>

        {/* Form Column */}
        <div className="md:w-2/3 p-10 md:p-14 space-y-10 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -mr-10 -mt-10 opacity-50"></div>
          
          <div className="relative">
            <h2 className="text-3xl font-display text-emerald-950">Ativação Elite</h2>
            <p className="text-slate-400 text-[11px] mt-2 uppercase tracking-widest leading-relaxed">
              Anexe o comprovante PIX abaixo para validação imediata.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-emerald-900 uppercase ml-1 tracking-widest">E-mail para Acesso Profissional</label>
              <input 
                type="email" 
                required 
                placeholder="exemplo@atelier.com"
                className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-champagne focus:bg-white transition-all text-emerald-950 font-medium"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-emerald-900 uppercase ml-1 tracking-widest">Comprovante do Pagamento</label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  onChange={handleFileChange}
                />
                <div className={`w-full p-8 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center transition-all ${
                  preview ? 'bg-emerald-50/30 border-emerald-200' : 'bg-slate-50 border-slate-200 group-hover:bg-emerald-50 group-hover:border-emerald-200'
                }`}>
                  {preview ? (
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[10px] font-black text-emerald-700 uppercase">Recibo Anexado ✓</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl mb-4">💳</div>
                      <span className="text-sm font-bold text-slate-500">Enviar Comprovante</span>
                      <span className="text-[9px] text-slate-300 uppercase mt-1 tracking-widest">JPEG, PNG ou PDF</span>
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
                {loading ? 'Validando Pagamento...' : 'Ativar Minha Licença Vitalícia'}
              </button>
              <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                 <span className="text-2xl">🛡️</span>
                 <p className="text-[9px] text-emerald-800 font-bold uppercase leading-relaxed tracking-wider">
                   Liberação manual por Bernardo Almeida após conferência do PIX.
                 </p>
              </div>
            </div>
          </form>

          <button onClick={onBack} className="w-full text-slate-300 text-[10px] font-black uppercase tracking-widest hover:text-emerald-950 transition-colors">Cancelar e Voltar</button>
        </div>
      </div>
    </div>
  );
};

export default RequestAccessView;
