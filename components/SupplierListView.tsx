
import React, { useState, useEffect } from 'react';
import { Supplier } from '../types';
import { generateAiInviteCode } from '../services/geminiService';

interface SupplierListViewProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
}

const SupplierListView: React.FC<SupplierListViewProps> = ({ suppliers, setSuppliers }) => {
  const [activeCode, setActiveCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const registrationLink = `${window.location.origin}/?mode=supplier-registration`;

  useEffect(() => {
    const savedCode = localStorage.getItem('planparty_supplier_invite_code');
    if (savedCode) setActiveCode(savedCode);
  }, []);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    const newCode = await generateAiInviteCode("PlanParty Atelier");
    localStorage.setItem('planparty_supplier_invite_code', newCode);
    setActiveCode(newCode);
    setIsGenerating(false);
  };

  const copyLink = () => {
    if (!activeCode) {
      alert("Gere um código de convite primeiro!");
      return;
    }
    const fullMessage = `Olá! Gostaria de convidar você para se cadastrar como fornecedor oficial do nosso Atelier.\n\nLink: ${registrationLink}\nCódigo de Acesso: ${activeCode}`;
    navigator.clipboard.writeText(fullMessage);
    alert("Mensagem de convite copiada com sucesso!");
  };

  const removeSupplier = (id: string) => {
    if (window.confirm("Remover este fornecedor da sua lista?")) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display text-emerald-950">Rede Profissional</h2>
          <p className="text-slate-500 text-sm">Gerencie fornecedores e convites inteligentes.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleGenerateCode}
            disabled={isGenerating}
            className={`px-6 py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center gap-2 ${
              isGenerating ? 'bg-slate-100 text-slate-400' : 'bg-white border border-emerald-100 text-emerald-950 hover:bg-emerald-50'
            }`}
          >
            {isGenerating ? "Gerando..." : "🤖 Gerar Código IA"}
          </button>
          <button 
            onClick={copyLink}
            className="bg-champagne text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:opacity-90 transition-all flex items-center gap-3"
          >
            <span>🔗</span> Copiar Convite
          </button>
        </div>
      </header>

      {activeCode && (
        <div className="bg-emerald-950 p-6 rounded-3xl text-white flex items-center justify-between">
          <div>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Código Ativo gerado por IA:</p>
            <p className="text-2xl font-display text-champagne">{activeCode}</p>
          </div>
          <p className="text-[10px] text-emerald-500 text-right max-w-[200px]">Os fornecedores precisarão deste código para acessar o formulário.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 bg-white p-20 rounded-[40px] border border-slate-100 text-center text-slate-300">
            <p className="font-display text-xl italic">Nenhum fornecedor cadastrado ainda.</p>
            <p className="text-sm mt-2">Gere um código acima e envie para seus parceiros.</p>
          </div>
        ) : (
          suppliers.map(s => (
            <div key={s.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
                  {s.category === 'Flores' ? '🌸' : s.category === 'Buffet' ? '🍽️' : '📦'}
                </div>
                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{s.category}</span>
              </div>
              
              <h4 className="font-bold text-lg text-emerald-950 truncate">{s.name}</h4>
              <p className="text-slate-400 text-xs mb-6">Desde {new Date(s.registeredAt).toLocaleDateString()}</p>
              
              <div className="space-y-3">
                <p className="flex items-center gap-3 text-sm text-slate-600">📱 {s.phone}</p>
                <p className="flex items-center gap-3 text-sm text-slate-600 truncate">📧 {s.email}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => removeSupplier(s.id)}
                  className="text-red-400 text-[10px] font-bold uppercase hover:text-red-600"
                >
                  Remover
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SupplierListView;
