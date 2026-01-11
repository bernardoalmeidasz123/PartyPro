
import React, { useState } from 'react';
import { AccessRequest } from '../types';

interface AdminApprovalViewProps {
  requests: AccessRequest[];
  onApprove: (id: string) => void;
  onReject?: (id: string) => void;
  onRevoke?: (id: string) => void;
}

const AdminApprovalView: React.FC<AdminApprovalViewProps> = ({ requests, onApprove, onReject, onRevoke }) => {
  const [filter, setFilter] = useState<'Pendente' | 'Aprovado' | 'Rejeitado'>('Pendente');
  const [viewingRequest, setViewingRequest] = useState<AccessRequest | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredRequests = requests.filter(r => r.status === filter);

  const handleCopyCredentials = (req: AccessRequest) => {
    const text = `Acesso PlanParty Atelier\nE-mail: ${req.email}\nSenha: ${req.generatedPassword}`;
    navigator.clipboard.writeText(text);
    setCopiedId(req.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (data: string, filename: string) => {
    const link = document.createElement('a');
    link.href = data;
    link.download = filename || 'comprovante-elite.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendEmail = (req: AccessRequest) => {
    const subject = encodeURIComponent("✨ Seu acesso exclusivo ao PlanParty Atelier chegou!");
    const body = encodeURIComponent(
      `Olá!\n\nÉ um prazer ter você conosco no PlanParty Atelier. Seu pagamento foi validado com sucesso e sua licença vitalícia está ativa.\n\n` +
      `Aqui estão seus dados para começar a planejar seus próximos sonhos:\n\n` +
      `Link de Acesso: ${window.location.origin}\n` +
      `Seu Login: ${req.email}\n` +
      `Sua Senha Privada: ${req.generatedPassword}\n\n` +
      `Qualquer dúvida, estou à disposição.\n\n` +
      `Com carinho,\nBernardo Almeida`
    );
    window.location.href = `mailto:${req.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Modal de Auditoria Master */}
      {viewingRequest && viewingRequest.proofData && (
        <div 
          className="fixed inset-0 z-[100] bg-emerald-950/98 backdrop-blur-3xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
          onClick={() => setViewingRequest(null)}
        >
          <div className="relative max-w-4xl w-full bg-white rounded-[60px] overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[92vh]" onClick={e => e.stopPropagation()}>
            <header className="px-12 py-10 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Auditoria de Pagamento</span>
                <h4 className="text-2xl font-display text-emerald-950">{viewingRequest.email}</h4>
              </div>
              <button 
                onClick={() => setViewingRequest(null)}
                className="w-12 h-12 bg-slate-50 text-emerald-950 rounded-full flex items-center justify-center font-bold hover:bg-slate-100 transition-all"
              >
                ✕
              </button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-12 bg-slate-50/30 flex items-center justify-center">
              <img 
                src={viewingRequest.proofData} 
                alt="Comprovante" 
                className="max-w-full h-auto rounded-[32px] shadow-2xl border-4 border-white"
              />
            </div>

            <footer className="p-10 bg-white border-t border-slate-100 flex justify-center items-center px-12 shrink-0">
              <div className="flex gap-4">
                {onReject && viewingRequest.status === 'Pendente' && (
                  <button 
                    onClick={() => { onReject(viewingRequest.id); setViewingRequest(null); }}
                    className="bg-white text-red-600 border border-red-100 px-10 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all"
                  >
                    Rejeitar Pagamento
                  </button>
                )}
                
                {viewingRequest.status === 'Pendente' && (
                  <button 
                    onClick={() => { onApprove(viewingRequest.id); setViewingRequest(null); }}
                    className="bg-emerald-950 text-white px-14 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-emerald-900 transition-all"
                  >
                    Aprovar Agora
                  </button>
                )}
              </div>
            </footer>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-display text-emerald-950">Central de Ativações</h2>
          <p className="text-slate-500 text-sm mt-1">Olá Bernardo, gerencie aqui os acessos e senhas dos membros Elite.</p>
        </div>
        <div className="bg-white p-2 rounded-[24px] border border-slate-200 flex shadow-xl shadow-slate-100/50">
          {(['Pendente', 'Aprovado', 'Rejeitado'] as const).map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {f === 'Pendente' ? `Novas (${requests.filter(r => r.status === 'Pendente').length})` : f}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-24 rounded-[48px] border border-slate-100 text-center shadow-sm">
            <div className="text-5xl mb-6 opacity-30">✨</div>
            <p className="font-display text-xl text-slate-300 italic">Nada para mostrar nesta categoria.</p>
          </div>
        ) : (
          filteredRequests.map(req => (
            <div key={req.id} className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-2xl shadow-inner ${
                    req.status === 'Aprovado' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {req.status === 'Aprovado' ? '💎' : '⏳'}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xl text-emerald-950">{req.email}</h4>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Registrado em {new Date(req.timestamp).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                {/* Bloco de Credenciais para Aprovados */}
                {req.status === 'Aprovado' && req.generatedPassword && (
                  <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex-1 max-w-2xl mx-auto">
                    <div className="flex-1 w-full md:w-auto">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Senha de Acesso</p>
                       <div className="flex items-center gap-3">
                          <code className="bg-white px-4 py-2 rounded-xl text-lg font-black text-emerald-950 font-mono tracking-[0.2em] border border-slate-200">
                             {req.generatedPassword}
                          </code>
                          <button 
                            onClick={() => handleCopyCredentials(req)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                              copiedId === req.id ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            }`}
                          >
                            {copiedId === req.id ? 'Copiado!' : 'Copiar Dados'}
                          </button>
                       </div>
                    </div>
                    <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
                    <button 
                      onClick={() => handleSendEmail(req)}
                      className="w-full md:w-auto px-8 py-5 bg-champagne text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-champagne/20"
                    >
                      <span>✉️</span> Enviar Convite p/ E-mail
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3 shrink-0">
                  <button 
                    onClick={() => req.proofData && setViewingRequest(req)}
                    className="p-5 rounded-2xl border border-slate-100 bg-white text-slate-400 hover:text-emerald-950 hover:bg-slate-50 transition-all"
                    title="Ver Comprovante"
                  >
                    🔍
                  </button>
                  
                  {req.status === 'Pendente' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onApprove(req.id)}
                        className="px-10 py-4 bg-emerald-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl"
                      >
                        Aprovar PIX
                      </button>
                      <button 
                        onClick={() => onReject && onReject(req.id)}
                        className="px-6 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100"
                      >
                        Recusar
                      </button>
                    </div>
                  )}

                  {req.status === 'Aprovado' && onRevoke && (
                    <button 
                      onClick={() => onRevoke(req.id)}
                      className="px-6 py-4 bg-white text-red-400 border border-red-50 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all"
                    >
                      Banir
                    </button>
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
