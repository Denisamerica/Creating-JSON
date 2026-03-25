
import React, { useMemo, useState, useEffect } from 'react';
import { UILanguage, translations } from '../utils/translations';
import { CommandLineIcon, DocumentDuplicateIcon, CheckIcon, PencilIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { generateJSON } from '../utils/csvHelper';

interface JsonPreviewProps {
  basics: any;
  blocks: any[];
  uiLanguage: UILanguage;
  customJson: string | null;
  onCustomJsonChange: (json: string | null) => void;
  onSyncToBlocks: (json: string) => void;
}

export const JsonPreview: React.FC<JsonPreviewProps> = ({ 
  basics, 
  blocks, 
  uiLanguage,
  customJson,
  onCustomJsonChange,
  onSyncToBlocks
}) => {
  const t = translations[uiLanguage];
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempJson, setTempJson] = useState('');
  
  const generatedJson = useMemo(() => {
    return generateJSON(basics, blocks);
  }, [basics, blocks]);

  const currentJson = customJson !== null ? customJson : generatedJson;

  const handleStartEdit = () => {
    setTempJson(currentJson);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onCustomJsonChange(tempJson);
    setIsEditing(false);
  };

  const handleSync = () => {
    if (confirm(uiLanguage === 'pt' ? 'Isso irá substituir todos os blocos atuais pelo conteúdo deste JSON. Continuar?' : 'This will replace all current blocks with the content of this JSON. Continue?')) {
      onSyncToBlocks(currentJson);
    }
  };

  const handleReset = () => {
    if (confirm(uiLanguage === 'pt' ? 'Resetar para o código gerado automaticamente?' : 'Reset to automatically generated code?')) {
      onCustomJsonChange(null);
      setIsEditing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      const textArea = document.createElement("textarea");
      textArea.value = currentJson;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        alert("Erro ao copiar. Por favor, selecione o texto e copie manualmente.");
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 overflow-hidden flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
      <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 p-2 rounded-lg">
            <CommandLineIcon className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-200 text-sm uppercase tracking-widest">JSON Output Preview</h3>
            {customJson !== null && !isEditing && (
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Customized</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700"
              >
                {uiLanguage === 'pt' ? 'Cancelar' : 'Cancel'}
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700"
              >
                {t.smart.save}
              </button>
              <button 
                onClick={() => {
                  onCustomJsonChange(tempJson);
                  onSyncToBlocks(tempJson);
                  setIsEditing(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
              >
                <ArrowPathIcon className="w-3.5 h-3.5" />
                {t.smart.syncToBlocks}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mr-2 pr-2 border-r border-gray-800">
                <button 
                  onClick={handleSync}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    customJson !== null 
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/30' 
                      : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                  }`}
                >
                  <ArrowPathIcon className="w-3.5 h-3.5" />
                  {t.smart.syncToBlocks}
                </button>
                {customJson !== null && (
                  <button 
                    onClick={handleReset}
                    title="Reset to generated"
                    className="p-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 transition-all"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button 
                onClick={handleStartEdit}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700"
              >
                <PencilIcon className="w-3.5 h-3.5" />
                {t.smart.editCode}
              </button>
              <button 
                onClick={copyToClipboard}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  copied 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                    : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border-indigo-500/30'
                }`}
              >
                {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <DocumentDuplicateIcon className="w-3.5 h-3.5" />}
                {copied 
                  ? (uiLanguage === 'pt' ? 'Copiado!' : 'Copied!') 
                  : (uiLanguage === 'pt' ? 'Copiar' : uiLanguage === 'es' ? 'Copiar' : 'Copy')
                }
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col">
        {isEditing ? (
          <textarea
            value={tempJson}
            onChange={(e) => setTempJson(e.target.value)}
            className="flex-1 w-full bg-gray-950 text-indigo-300 p-6 font-mono text-sm leading-relaxed focus:ring-0 border-none resize-none custom-scrollbar"
            spellCheck={false}
          />
        ) : (
          <div className="flex-1 overflow-auto custom-scrollbar p-6 font-mono text-sm leading-relaxed">
            <pre className="text-indigo-300 whitespace-pre-wrap break-words">
              {currentJson}
            </pre>
          </div>
        )}
      </div>

      <div className="px-6 py-3 bg-indigo-600/5 border-t border-gray-800 text-[9px] font-bold text-indigo-400/50 uppercase tracking-[0.2em] text-center">
        {isEditing ? 'Direct Code Editor' : 'Real-time Generated Data Structure'}
      </div>
    </div>
  );
};
