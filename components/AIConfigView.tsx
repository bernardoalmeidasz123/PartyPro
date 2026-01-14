
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

const AIConfigView: React.FC = () => {
  // Estado do Editor
  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem('atelier_logic_code');
    return saved || `# MOTOR DE INTELIGÊNCIA PLANPARTY v3.0
# PROGRAME O CÉREBRO DO SEU ATELIER AQUI

INSTRUCAO_SISTEMA = """
Você é o Mentor do Atelier, um assistente de elite para decoradores.
Seu tom deve ser sofisticado, minimalista e focado em luxo.
Sempre sugira elementos que aumentem a percepção de valor.
"""

def processar_evento(tema, detalhes):
    # Esta função simula como a IA verá seus dados
    return f"Processando {tema} com a diretriz: {INSTRUCAO_SISTEMA}"

# TESTE SEU PROMPT ABAIXO:
print("Iniciando simulação de convite para Baile de Gala...")`;
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'logs'>('editor');
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleRun = async () => {
    // Chave injetada
    const apiKey = process.env.API_KEY;
    
    setIsRunning(true);
    setActiveTab('logs');
    addLog("Iniciando execução do motor customizado...");

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Considere este código Python de configuração:
      ${code}
      
      Atue como um interpretador Python. Execute a lógica acima.
      1. Se houver erro de sintaxe, avise.
      2. Se houver um comando 'print', retorne APENAS o texto impresso.
      3. Use a variável INSTRUCAO_SISTEMA para moldar sua resposta se solicitado.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      addLog(`SAÍDA DO TERMINAL:`);
      addLog(`> ${response.text}`);
      addLog("Execução finalizada.");
    } catch (error: any) {
      addLog(`ERRO CRÍTICO: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('atelier_logic_code', code);
    
    // Extrai a instrução do código para usar no site
    const match = code.match(/INSTRUCAO_SISTEMA\s*=\s*"""([\s\S]*?)"""/);
    if (match && match[1]) {
      localStorage.setItem('atelier_global_instruction', match[1].trim());
    }

    setTimeout(() => {
      setIsSaving(false);
      addLog("Sistema atualizado: A nova lógica foi implantada globalmente.");
      alert("Lógica integrada! Agora os convites e orçamentos seguirão suas regras.");
    }, 800);
  };

  const readyToUseCode = `import google.generativeai as genai

# CONFIGURAÇÃO MASTER ATELIER
API_KEY = "${process.env.API_KEY}"
genai.configure(api_key=API_KEY)

# Instrução vinda do seu Editor no Site
SYSTEM_PROMPT = """${localStorage.getItem('atelier_global_instruction') || 'Você é o Mentor do Atelier.'}"""

model = genai.GenerativeModel(
    model_name='gemini-2.0-flash',
    system_instruction=SYSTEM_PROMPT
)

def gerar(prompt):
    return model.generate_content(prompt).text

if __name__ == "__main__":
    print(gerar("Crie uma ideia de festa..."))`;

  const copySnippet = () => {
    navigator.clipboard.writeText(readyToUseCode);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-block px-4 py-1 bg-emerald-950 rounded-full border border-emerald-800 mb-2">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Atelier Dev Studio</span>
          </div>
          <h2 className="text-4xl font-display text-emerald-950 font-bold">Programação & Integração</h2>
          <div className="flex items-center gap-2 mt-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Conectado ao Sistema Central</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleRun}
            disabled={isRunning}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl ${
              isRunning ? 'bg-slate-200 text-slate-400' : 'bg-emerald-950 text-white hover:scale-105 active:scale-95'
            }`}
          >
            {isRunning ? 'Compilando...' : '▶ Rodar Código'}
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl ${
              isSaving ? 'bg-slate-200 text-slate-400' : 'bg-champagne text-emerald-950 hover:scale-105 active:scale-95'
            }`}
          >
            {isSaving ? 'Salvando...' : '💾 Salvar Lógica no Site'}
          </button>
        </div>
      </header>

      {/* EDITOR DE CÓDIGO */}
      <div className="bg-[#1e1e1e] rounded-[48px] shadow-2xl border border-white/5 overflow-hidden flex flex-col h-[600px]">
        <div className="bg-[#2d2d2d] px-8 py-3 flex items-center justify-between">
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'editor' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Script Python (Lógica do Sistema)
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'logs' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Console / Logs
            </button>
          </div>
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'editor' ? (
            <div className="flex-1 flex relative">
              <div className="w-12 bg-[#1e1e1e] border-r border-white/5 flex flex-col items-center pt-8 text-[11px] font-mono text-slate-700 select-none">
                {Array.from({ length: Math.max(lineCount, 20) }).map((_, i) => (
                  <div key={i} className="h-6 leading-6">{i + 1}</div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 bg-transparent p-8 text-emerald-100 font-mono text-sm leading-6 outline-none resize-none"
                spellCheck={false}
              />
            </div>
          ) : (
            <div className="flex-1 bg-black/40 p-8 font-mono text-xs overflow-y-auto space-y-2">
              {logs.length === 0 ? (
                <p className="text-slate-600 italic">Console limpo. Execute seu código para ver a saída.</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`${log.includes('ERRO') || log.includes('ALERTA') ? 'text-red-400' : log.includes('SAÍDA') ? 'text-champagne' : 'text-emerald-500/60'}`}>
                    {log}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="bg-[#007acc] px-8 py-1.5 flex justify-between text-[10px] text-white font-medium uppercase tracking-widest">
          <div className="flex gap-6">
            <span>Python 3.10 Syntax</span>
            <span>UTF-8</span>
          </div>
          <span>Atelier Engine v3.1</span>
        </div>
      </div>

      {/* SCRIPT EXPORT */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display font-bold text-emerald-950">Script de Produção</h3>
          <button 
            onClick={copySnippet}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              snippetCopied ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            {snippetCopied ? 'Copiado! ✓' : 'Copiar Código Pronto'}
          </button>
        </div>

        <div className="bg-emerald-950 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group min-h-[200px]">
           <div className="absolute top-4 right-8 flex items-center gap-2">
             <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Auto-Generated</span>
           </div>
           <pre className="text-emerald-400 font-mono text-xs leading-relaxed overflow-x-auto">
             {readyToUseCode}
           </pre>
        </div>
      </div>
    </div>
  );
};

export default AIConfigView;
