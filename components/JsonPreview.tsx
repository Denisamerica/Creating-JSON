
import React, { useMemo, useState } from 'react';
import { UILanguage, translations } from '../utils/translations';
import { CommandLineIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';
import { generateJSON } from '../utils/csvHelper';

interface JsonPreviewProps {
  basics: any;
  blocks: any[];
  uiLanguage: UILanguage;
}

export const JsonPreview: React.FC<JsonPreviewProps> = ({ basics, blocks, uiLanguage }) => {
  const t = translations[uiLanguage];
  const [copied, setCopied] = useState(false);
  
  const jsonContent = useMemo(() => {
    return generateJSON(basics, blocks);
  }, [basics, blocks]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback para navegadores antigos ou contextos inseguros
      const textArea = document.createElement("textarea");
      textArea.value = jsonContent;
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
          <h3 className="font-bold text-gray-200 text-sm uppercase tracking-widest">JSON Output Preview</h3>
        </div>
        <button 
          onClick={copyToClipboard}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
            copied 
              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
              : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border-gray-700'
          }`}
        >
          {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <DocumentDuplicateIcon className="w-3.5 h-3.5" />}
          {copied 
            ? (uiLanguage === 'pt' ? 'Copiado!' : 'Copied!') 
            : (uiLanguage === 'pt' ? 'Copiar' : uiLanguage === 'es' ? 'Copiar' : 'Copy')
          }
        </button>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar p-6 font-mono text-sm leading-relaxed">
        <pre className="text-indigo-300 whitespace-pre-wrap break-words">
          {jsonContent}
        </pre>
      </div>

      <div className="px-6 py-3 bg-indigo-600/5 border-t border-gray-800 text-[9px] font-bold text-indigo-400/50 uppercase tracking-[0.2em] text-center">
        Real-time Generated Data Structure
      </div>
    </div>
  );
};
