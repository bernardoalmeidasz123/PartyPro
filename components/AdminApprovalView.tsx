
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
    link.download = filename || 'comprovante-elite.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Modal de Análise Master - Agora com Rejeitar e Aprovar juntos */}
      {viewingRequest && viewingRequest.proofData && (
        <div 
          className="fixed inset-0 z-[100] bg-emerald-950/98 backdrop-blur-3xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
          onClick={() => setViewingRequest(null)}
        >
          <div className="relative max-w-6xl w-full bg-white rounded-[60px] overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[92vh]" onClick={e => e.stopPropagation()}>
            <header className="px-12 py-10 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Auditoria de Pagamento</span>
                <h4 className="text-3xl font-display text-emerald-950">Analisar: {viewingRequest.email}</h4>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => handleDownload(viewingRequest.proofData!, viewingRequest.proofName)}
                  className="px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-3xl font-bold text-xs flex items-center gap-3 transition-all shadow-sm border border-slate-200"
                >
                  📥 Baixar Comprovante
                </button>
                <button 
                  onClick={() => setViewingRequest(null)}
                  className="w-14 h-14 bg-emerald-50 text-emerald-950 rounded-full flex items-center justify-center font-bold hover:bg-emerald-100 transition-all shadow-md"
                >
                  ✕
                </button>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50 flex items-center justify-center">
              {viewingRequest.proofData.startsWith('data:application/pdf') ? (
                <div className="text-center p-24 bg-white rounded-[48px] border-2 border-dashed border-slate-200 shadow-xl max-w-md">
                  <span className="text-7xl block mb-6">📄</span>
                  <p className="text-slate-500 font-bold mb-8 text-xl">Arquivo em PDF</p>
                  <button 
                    onClick={() => handleDownload(viewingRequest.proofData!, viewingRequest.proofName)}
                    className="bg-emerald-950 text-white px-10 py-5 rounded-3xl font-bold shadow-2xl shadow-emerald-950/20 hover:scale-105 transition-all"
                  >
                    Visualizar / Baixar PDF
                  </button>
                </div>
              ) : (
                <div className="relative group max-w-3xl">
                   <img 
                    src={viewingRequest.proofData} 
                    alt="Proof" 
                    className="w-full h-auto rounded-[32px] shadow-2xl border-8 border-white ring-1 ring-slate-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px] pointer-events-none"></div>
                </div>
              )}
            </div>

            <footer className="p-10 bg-white border-t border-slate-100 flex flex-col md:flex-row justify-between items-center px-12 shrink-0">
               <button 
                onClick={() => setViewingRequest(null)}
                className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
              >
                Voltar sem alterar
              </button>

              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                {onReject && viewingRequest.status === 'Pendente' && (
                  <button 
                    onClick={() => { onReject(viewingRequest.id); setViewingRequest(null); }}
                    className="bg-white text-red-600 border-2 border-red-100 px-10 py-5 rounded-[32px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 transition-all active:scale-95"
                  >
                    Rejeitar Solicitação
                  </button>
                )}
                
                {viewingRequest.status === 'Pendente' && (
                  <button 
                    onClick={() => { onApprove(viewingRequest.id); setViewingRequest(null); }}
                    className="bg-emerald-950 text-white px-16 py-5 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-950/30 hover:bg-emerald-900 active:scale-95 transition-all flex items-center justify-center gap-4"
                  >
                    <span className="text-xl">💎</span> Aprovar Acesso
                  </button>
                )}
              </div>
            </footer>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-display text-emerald-950">Aprovações Pendentes</h2>
          <p className="text-slate-500 text-sm mt-1">Olá Bernardo, analise cuidadosamente as solicitações recebidas.</p>
        </div>
        <div className="bg-white p-2 rounded-[24px] border border-slate-200 flex shadow-xl shadow-slate-100/50">
          {(['Pendente', 'Aprovado', 'Rejeitado'] as const).map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {f === 'Pendente' ? `Novos (${requests.filter(r => r.status === 'Pendente').length})` : f}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-32 rounded-[56px] border border-slate-100 text-center shadow-sm">
            <div className="text-6xl mb-6 opacity-30">✨</div>
            <p className="font-display text-2xl text-slate-300 italic">Sem solicitações no momento.</p>
          </div>
        ) : (
          filteredRequests.map(req => (
            <div key={req.id} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="flex items-center gap-8">
                  <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center text-3xl shadow-inner transition-transform group-hover:scale-110 duration-500 ${
                    req.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-700' : 
                    req.status === 'Rejeitado' ? 'bg-red-50 text-red-400' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {req.status === 'Aprovado' ? '👑' : req.status === 'Rejeitado' ? '🚫' : '📸'}
                  </div>
                  <div>
                    <h4 className="font-bold text-2xl text-emerald-950">{req.email}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-full">Recibo #{req.id.toUpperCase()}</span>
                      <span className="text-[10px] text-slate-300 font-bold uppercase">{new Date(req.timestamp).toLocaleDateString('pt-BR')} às {new Date(req.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => req.proofData && setViewingRequest(req)}
                    className="flex-1 md:flex-none px-8 py-5 rounded-3xl border-2 border-emerald-50 bg-white text-emerald-900 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 hover:border-emerald-100 transition-all flex items-center justify-center gap-3 shadow-sm"
                  >
                    <span>Analisar e Validar</span>
                    <span className="text-lg">🔍</span>
                  </button>
                  
                  {req.status === 'Pendente' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onApprove(req.id)}
                        className="px-8 py-5 bg-emerald-950 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-950/20 hover:bg-emerald-900 transition-all active:scale-95"
                      >
                        Aprovar
                      </button>
                      {onReject && (
                        <button 
                          onClick={() => onReject(req.id)}
                          className="px-6 py-5 bg-white text-red-500 border border-red-50 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all"
                        >
                          Rejeitar
                        </button>
                      )}
                    </div>
                  )}

                  {req.status !== 'Pendente' && (
                    <div className={`px-8 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-sm ${
                      req.status === 'Aprovado' ? 'bg-emerald-950 text-champagne' : 'bg-red-50 text-red-500'
                    }`}>
                      {req.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminApprovalView;
