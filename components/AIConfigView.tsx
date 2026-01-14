
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

const AIConfigView: React.FC = () => {
  // Estado para a Chave de API do Usuário
  const [userApiKey, setUserApiKey] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(true);

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

  useEffect(() => {
    const savedKey = localStorage.getItem('atelier_api_key');
    if (savedKey) {
      setUserApiKey(savedKey);
      setIsKeySaved(true);
      setShowKeyInput(false);
    }
  }, []);

  const saveApiKey = () => {
    if (!userApiKey.startsWith('AIza')) {
      alert("A chave parece inválida. Ela geralmente começa com 'AIza'.");
      return;
    }
    localStorage.setItem('atelier_api_key', userApiKey);
    setIsKeySaved(true);
    setShowKeyInput(false);
    addLog("Chave de API configurada com sucesso. Sistema Online.");
  };

  const clearApiKey = () => {
    localStorage.removeItem('atelier_api_key');
    setUserApiKey('');
    setIsKeySaved(false);
    setShowKeyInput(true);
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleRun = async () => {
    if (!userApiKey) {
      alert("Configure sua API Key primeiro.");
      return;
    }

    setIsRunning(true);
    setActiveTab('logs');
    addLog("Iniciando execução do motor customizado...");

    try {
      // Usa a chave fornecida pelo usuário
      const ai = new GoogleGenAI({ apiKey: userApiKey });
      
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
      if (error.message.includes('403') || error.message.includes('key')) {
         addLog("ALERTA: Sua API Key parece inválida ou expirada.");
      }
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

  // Código pronto para exportação
  const readyToUseCode = `import google.generativeai as genai

# CONFIGURAÇÃO MASTER ATELIER
# Use este script para rodar sua IA fora do navegador

API_KEY = "${userApiKey || 'SUA_CHAVE_AQUI'}"

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

  // TELA DE CONFIGURAÇÃO DE CHAVE (BLOQUEIO)
  if (showKeyInput) {
    return (
      <div className="max-w-4xl mx-auto py-20 animate-in zoom-in duration-500">
        <div className="bg-white rounded-[60px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-emerald-950 p-12 text-white flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-display text-champagne mb-4">Motor Gemini AI</h2>
              <p className="text-emerald-300/60 text-sm leading-relaxed">
                Para ativar a inteligência artificial do Atelier, você precisa conectar sua própria chave de processamento Google.
              </p>
            </div>
            <div className="space-y-4 mt-12">
               <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center font-bold">1</div>
                 <span className="text-xs">Acesse <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-champagne underline">Google AI Studio</a></span>
               </div>
               <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center font-bold">2</div>
                 <span className="text-xs">Clique em "Create API Key"</span>
               </div>
               <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center font-bold">3</div>
                 <span className="text-xs">Cole o código ao lado</span>
               </div>
            </div>
          </div>
          
          <div className="md:w-1/2 p-12 flex flex-col justify-center space-y-6">
            <h3 className="text-2xl font-display text-emerald-950">Ativar Sistema</h3>
            <input 
              type="password" 
              placeholder="Cole sua API Key aqui (AIza...)" 
              className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-950 transition-all font-mono text-sm"
              value={userApiKey}
              onChange={e => setUserApiKey(e.target.value)}
            />
            <button 
              onClick={saveApiKey}
              disabled={!userApiKey}
              className="w-full py-5 bg-emerald-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-900 disabled:opacity-50 transition-all"
            >
              Conectar e Programar
            </button>
            <p className="text-[9px] text-slate-400 text-center">Sua chave é salva apenas no seu navegador.</p>
          </div>
        </div>
      </div>
    );
  }

  // TELA DO EDITOR (QUANDO LOGADO)
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
             <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Conectado via Gemini</p>
             <button onClick={clearApiKey} className="ml-4 text-[9px] text-red-400 underline hover:text-red-600">Desconectar Chave</button>
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
