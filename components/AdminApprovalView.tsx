
import React, { useState } from 'react';
import { AccessRequest } from '../types';

interface AdminApprovalViewProps {
  requests: AccessRequest[];
  authorizedEmails: string[];
  onApprove: (id: string) => void;
  onManualAdd: (email: string) => void;
  onRevoke: (email: string) => void;
}

const AdminApprovalView: React.FC<AdminApprovalViewProps> = ({ requests, authorizedEmails, onApprove, onManualAdd, onRevoke }) => {
  const [tab, setTab] = useState<'pending' | 'authorized'>('pending');
  const [manualEmail, setManualEmail] = useState('');
  const [viewingRequest, setViewingRequest] = useState<AccessRequest | null>(null);

  const pendingRequests = requests.filter(r => r.status === 'Pendente');

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail) return;
    onManualAdd(manualEmail);
    setManualEmail('');
    alert(`E-mail ${manualEmail} autorizado com sucesso!`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Visualizador de Comprovante */}
      {viewingRequest && viewingRequest.proofData && (
        <div className="fixed inset-0 z-[100] bg-emerald-950/95 backdrop-blur-xl flex items-center justify-center p-8" onClick={() => setViewingRequest(null)}>
          <div className="bg-white rounded-[60px] p-8 max-w-2xl w-full animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
             <img src={viewingRequest.proofData} alt="Comprovante" className="w-full h-auto rounded-3xl shadow-2xl mb-8" />
             <button onClick={() => { onApprove(viewingRequest.id); setViewingRequest(null); }} className="w-full py-5 bg-emerald-950 text-white rounded-2xl font-black uppercase tracking-widest">Validar e Autorizar E-mail</button>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-display text-emerald-950">Controle de Acessos</h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie quem pode acessar o Atelier via whitelist de e-mail.</p>
        </div>
        <div className="bg-white p-2 rounded-2xl border flex shadow-sm">
          <button onClick={() => setTab('pending')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'pending' ? 'bg-emerald-950 text-white' : 'text-slate-400'}`}>
            Pedidos ({pendingRequests.length})
          </button>
          <button onClick={() => setTab('authorized')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'authorized' ? 'bg-emerald-950 text-white' : 'text-slate-400'}`}>
            Whitelist ({authorizedEmails.length})
          </button>
        </div>
      </header>

      {tab === 'authorized' && (
        <div className="space-y-8">
          <form onSubmit={handleManualAdd} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
             <input 
               type="email" 
               placeholder="Digitar e-mail para autorizar manualmente..." 
               className="flex-1 p-5 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-emerald-100 font-medium"
               value={manualEmail}
               onChange={e => setManualEmail(e.target.value)}
             />
             <button type="submit" className="bg-emerald-950 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-900 transition-all shadow-xl">
               Autorizar Acesso
             </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorizedEmails.map(email => (
              <div key={email} className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">👤</div>
                   <p className="font-bold text-emerald-950 text-sm truncate max-w-[160px]">{email}</p>
                </div>
                {email !== "bernardoalmeida19801955@gmail.com" && (
                  <button onClick={() => onRevoke(email)} className="text-red-300 hover:text-red-500 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Revogar</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'pending' && (
        <div className="grid grid-cols-1 gap-4">
          {pendingRequests.length === 0 ? (
            <div className="p-20 text-center bg-white rounded-[60px] border border-slate-100 text-slate-300 italic">Nenhum pedido pendente.</div>
          ) : (
            pendingRequests.map(req => (
              <div key={req.id} className="bg-white p-8 rounded-[40px] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl">📧</div>
                  <div>
                    <h4 className="font-bold text-emerald-950">{req.email}</h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Pedido em {new Date(req.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setViewingRequest(req)} className="px-6 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-[9px] uppercase tracking-widest">Ver Comprovante</button>
                  <button onClick={() => onApprove(req.id)} className="px-8 py-4 bg-emerald-950 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-900/20">Autorizar</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminApprovalView;
