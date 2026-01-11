
import React, { useState } from 'react';
import { AccessRequest } from '../types';

interface AdminApprovalViewProps {
  requests: AccessRequest[];
  onApprove: (id: string) => void;
  onReject?: (id: string) => void;
}

const AdminApprovalView: React.FC<AdminApprovalViewProps> = ({ requests, onApprove, onReject }) => {
  const [filter, setFilter] = useState<'Pendente' | 'Aprovado' | 'Rejeitado'>('Pendente');

  const filteredRequests = requests.filter(r => r.status === filter);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display text-emerald-950">Gestão de Acessos</h2>
          <p className="text-slate-500 text-sm">Aprovação manual de membros via e-mail e comprovante Sunize.</p>
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
                <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                  <span className="text-emerald-600 font-bold text-xs uppercase">Comprovante:</span>
                  <span className="text-emerald-900 font-bold text-[11px] truncate max-w-[150px]">{req.proofName}</span>
                </div>
                
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
                
                {req.status === 'Aprovado' && (
                  <span className="bg-green-100 text-green-700 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest border border-green-200">
                    Membro Ativo ✅
                  </span>
                )}

                {req.status === 'Rejeitado' && (
                  <span className="bg-red-50 text-red-500 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest border border-red-100">
                    Rejeitado ❌
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Instruções Admin</h4>
        <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
          <li>Verifique se o e-mail da solicitação coincide com o e-mail da compra na Sunize.</li>
          <li>Confirme se o arquivo anexado é um comprovante de pagamento válido.</li>
          <li>Ao aprovar, o sistema enviará as credenciais automáticas baseadas no e-mail.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminApprovalView;
