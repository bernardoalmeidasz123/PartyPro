
import React, { useState } from 'react';
import { AccessRequest } from '../types';

interface AdminApprovalViewProps {
  requests: AccessRequest[];
  onApprove: (id: string) => void;
  onReject?: (id: string) => void;
}

const AdminApprovalView: React.FC<AdminApprovalViewProps> = ({ requests, onApprove, onReject }) => {
  const [filter, setFilter] = useState<'Pendente' | 'Aprovado' | 'Rejeitado'>('Pendente');
  const [viewingProof, setViewingProof] = useState<string | null>(null);

  const filteredRequests = requests.filter(r => r.status === filter);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Modal de Visualização */}
      {viewingProof && (
        <div 
          className="fixed inset-0 z-[100] bg-emerald-950/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
          onClick={() => setViewingProof(null)}
        >
          <div className="relative max-w-4xl w-full bg-white rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setViewingProof(null)}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-emerald-50 text-emerald-950 rounded-full flex items-center justify-center font-bold text-xl transition-all z-10"
            >
              ✕
            </button>
            <div className="p-10 overflow-y-auto max-h-[85vh] flex flex-col items-center">
              <h4 className="text-xl font-display text-emerald-950 mb-6">Comprovante de Pagamento</h4>
              {viewingProof.startsWith('data:application/pdf') ? (
                <div className="w-full aspect-[4/3] bg-slate-100 flex items-center justify-center rounded-3xl">
                  <p className="text-slate-500 font-bold">Documento PDF (Visualização indisponível em Base64 direto)</p>
                  <a href={viewingProof} download="comprovante.pdf" className="ml-4 text-emerald-600 underline">Baixar PDF</a>
                </div>
              ) : (
                <img src={viewingProof} alt="Proof" className="w-full h-auto rounded-3xl shadow-lg border border-slate-100" />
              )}
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display text-emerald-950">Gestão de Acessos</h2>
          <p className="text-slate-500 text-sm">Analise os comprovantes e libere os membros Elite.</p>
        </div>
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex shadow-sm">
          {(['Pendente', 'Aprovado', 'Rejeitado'] as const).map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-emerald-950 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {f === 'Pendente' ? `Pendentes (${requests.filter(r => r.status === 'Pendente').length})` : f}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] border border-slate-100 text-center text-slate-300">
            <p className="font-display text-xl italic">Nenhuma solicitação {filter.toLowerCase()} no momento.</p>
          </div>
        ) : (
          filteredRequests.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl">
                  📧
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{req.email}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {new Date(req.timestamp).toLocaleDateString('pt-BR')} às {new Date(req.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <button 
                  onClick={() => req.proofData && setViewingProof(req.proofData)}
                  className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${
                    req.proofData ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-bold uppercase">Ver Imagem</span>
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-current">👁️</span>
                </button>
                
                {req.status === 'Pendente' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onApprove(req.id)}
                      className="bg-emerald-950 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:bg-emerald-900 active:scale-95 transition-all text-xs"
                    >
                      APROVAR
                    </button>
                    {onReject && (
                      <button 
                        onClick={() => onReject(req.id)}
                        className="bg-white text-red-500 border border-red-100 px-4 py-3 rounded-2xl font-bold hover:bg-red-50 transition-all text-xs"
                      >
                        REJEITAR
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminApprovalView;
