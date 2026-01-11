
import React, { useState } from 'react';
import { AccessRequest } from '../types';

interface AdminApprovalViewProps {
  requests: AccessRequest[];
  onApprove: (id: string) => void;
  onReject?: (id: string) => void;
}

const AdminApprovalView: React.FC<AdminApprovalViewProps> = ({ requests, onApprove, onReject }) => {
  const [filter, setFilter] = useState<'Pendente' | 'Aprovado' | 'Rejeitado'>('Pendente');
  const [viewingRequest, setViewingRequest] = useState<AccessRequest | null>(null);

  const filteredRequests = requests.filter(r => r.status === filter);

  const handleDownload = (data: string, filename: string) => {
    const link = document.createElement('a');
    link.href = data;
    link.download = filename || 'comprovante.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Modal de Análise Detalhada */}
      {viewingRequest && viewingRequest.proofData && (
        <div 
          className="fixed inset-0 z-[100] bg-emerald-950/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
          onClick={() => setViewingRequest(null)}
        >
          <div className="relative max-w-5xl w-full bg-white rounded-[48px] overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <header className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h4 className="text-2xl font-display text-emerald-950">Analisar Comprovante</h4>
                <p className="text-slate-400 text-sm">{viewingRequest.email}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleDownload(viewingRequest.proofData!, viewingRequest.proofName)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all"
                >
                  📥 Baixar Arquivo
                </button>
                <button 
                  onClick={() => setViewingRequest(null)}
                  className="w-12 h-12 bg-emerald-50 text-emerald-950 rounded-full flex items-center justify-center font-bold hover:bg-emerald-100 transition-all"
                >
                  ✕
                </button>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-10 bg-slate-50 flex items-center justify-center">
              {viewingRequest.proofData.startsWith('data:application/pdf') ? (
                <div className="text-center p-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                  <span className="text-6xl block mb-4">📄</span>
                  <p className="text-slate-500 font-bold mb-4">Documento PDF</p>
                  <button 
                    onClick={() => handleDownload(viewingRequest.proofData!, viewingRequest.proofName)}
                    className="bg-emerald-950 text-white px-8 py-3 rounded-xl font-bold"
                  >
                    Abrir/Baixar PDF
                  </button>
                </div>
              ) : (
                <img 
                  src={viewingRequest.proofData} 
                  alt="Proof" 
                  className="max-w-full h-auto rounded-2xl shadow-2xl border border-white"
                />
              )}
            </div>

            <footer className="p-8 bg-white border-t border-slate-100 flex justify-center gap-4 shrink-0">
               <button 
                onClick={() => { onApprove(viewingRequest.id); setViewingRequest(null); }}
                className="bg-emerald-950 text-white px-12 py-4 rounded-2xl font-bold shadow-xl hover:bg-emerald-900 transition-all"
              >
                APROVAR ACESSO AGORA
              </button>
              <button 
                onClick={() => setViewingRequest(null)}
                className="px-8 py-4 text-slate-400 font-bold"
              >
                Fechar Visualização
              </button>
            </footer>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display text-emerald-950">Fila de Aprovação</h2>
          <p className="text-slate-500 text-sm">Auditoria manual de comprovantes enviados.</p>
        </div>
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex shadow-sm">
          {(['Pendente', 'Aprovado', 'Rejeitado'] as const).map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-emerald-950 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {f === 'Pendente' ? `Pendentes (${requests.filter(r => r.status === 'Pendente').length})` : f}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-24 rounded-[48px] border border-slate-100 text-center text-slate-300">
            <div className="text-5xl mb-4">✅</div>
            <p className="font-display text-xl italic">Tudo limpo! Nenhuma solicitação {filter.toLowerCase()}.</p>
          </div>
        ) : (
          filteredRequests.map(req => (
            <div key={req.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-2xl shadow-inner">
                  📩
                </div>
                <div>
                  <h4 className="font-bold text-xl text-slate-800">{req.email}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                    Enviado em {new Date(req.timestamp).toLocaleDateString('pt-BR')} às {new Date(req.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => req.proofData && setViewingRequest(req)}
                  className={`px-6 py-4 rounded-2xl border flex items-center gap-3 transition-all ${
                    req.proofData ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-50 border-slate-100 text-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-widest">Analisar Comprovante</span>
                  <span className="text-lg">🔍</span>
                </button>
                
                {req.status === 'Pendente' && (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => onApprove(req.id)}
                      className="bg-emerald-950 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-emerald-900 active:scale-95 transition-all text-xs tracking-widest"
                    >
                      APROVAR
                    </button>
                    {onReject && (
                      <button 
                        onClick={() => onReject(req.id)}
                        className="bg-white text-red-500 border border-red-100 px-6 py-4 rounded-2xl font-bold hover:bg-red-50 transition-all text-xs uppercase tracking-widest"
                      >
                        Rejeitar
                      </button>
                    )}
                  </div>
                )}

                {req.status !== 'Pendente' && (
                  <div className={`px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] ${
                    req.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-400'
                  }`}>
                    {req.status}
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
