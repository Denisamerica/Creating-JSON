
import React, { useState, useRef, useEffect } from 'react';
import { UILanguage, translations } from '../utils/translations';
import { 
  ScissorsIcon, 
  CommandLineIcon,
} from '@heroicons/react/24/outline';

interface SplitBlock {
  id: string;
  type: 't' | 'x' | 'q' | 'i';
  text: string;
}

interface SmartSplitterProps {
  onBlocksUpdate: (blocks: SplitBlock[]) => void;
  blocks: SplitBlock[];
  uiLanguage: UILanguage;
  // Novas props para controle externo do texto
  text: string;
  onTextChange: (text: string) => void;
  onSaveAndViewJson?: () => void;
}

export const SmartSplitter: React.FC<SmartSplitterProps> = ({ 
  onBlocksUpdate, 
  blocks, 
  uiLanguage, 
  text: currentText, 
  onTextChange: setCurrentText,
  onSaveAndViewJson
}) => {
  const t = translations[uiLanguage];
  // Removemos o estado interno 'currentText' e usamos as props
  const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);
  const [namingInput, setNamingInput] = useState('');
  const [splitIndex, setSplitIndex] = useState<number | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNamingModalOpen) {
      modalInputRef.current?.focus();
    }
  }, [isNamingModalOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      if (!currentText || currentText.trim().length === 0) return;

      const target = e.target as HTMLTextAreaElement;
      const cursorPosition = target.selectionStart;
      
      if (cursorPosition === 0 && currentText.length > 0) return;

      setSplitIndex(cursorPosition);
      setIsNamingModalOpen(true);
      setNamingInput('');
    }
  };

  const handleModalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateAndConfirm();
    }
    if (e.key === 'Escape') {
      setIsNamingModalOpen(false);
      setTimeout(() => textareaRef.current?.focus(), 10);
    }
  };

  const validateAndConfirm = () => {
    const input = namingInput.toLowerCase();
    if (!input) return;

    const validFirst = ['t', 'x', 'q', 'i'];
    const firstChar = input[0];

    if (!validFirst.includes(firstChar)) return;
    if (splitIndex === null) return;

    const blockText = currentText.slice(0, splitIndex).trim();
    const remainingText = currentText.slice(splitIndex).trim();

    const newBlock: SplitBlock = {
      id: crypto.randomUUID(),
      type: firstChar as 't' | 'x' | 'q' | 'i',
      text: blockText
    };

    onBlocksUpdate([...blocks, newBlock]);
    setCurrentText(remainingText); // Atualiza via prop do pai
    setIsNamingModalOpen(false);
    setSplitIndex(null);

    setTimeout(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.scrollTop = 0;
            const nextNewLine = remainingText.indexOf('\n');
            const targetPos = nextNewLine !== -1 ? nextNewLine : remainingText.length;
            textareaRef.current.setSelectionRange(targetPos, targetPos);
        }
    }, 10);
  };

  const getPreviewText = () => {
    if (splitIndex === null) return '';
    const text = currentText.slice(0, splitIndex).trim();
    if (text.length > 120) return text.slice(0, 117) + '...';
    return text;
  };

  return (
    <div className="h-full bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col animate-in fade-in duration-500">
      <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-indigo-100 shadow-xl">
             <CommandLineIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">{t.smart.title}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t.smart.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
             <kbd className="bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm text-indigo-600">TAB</kbd> {t.smart.divide}
           </div>
           {onSaveAndViewJson && (
             <button 
               onClick={onSaveAndViewJson}
               className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
             >
               <CommandLineIcon className="w-4 h-4" />
               {t.smart.saveAndViewJson}
             </button>
           )}
        </div>
      </div>

      <div className="flex-1 p-10 relative bg-white overflow-hidden">
        <textarea
          ref={textareaRef}
          className="w-full h-full resize-none border-none focus:ring-0 text-xl leading-relaxed text-gray-700 placeholder-gray-100 custom-scrollbar font-medium selection:bg-indigo-100 selection:text-indigo-900"
          placeholder="..."
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {!currentText && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
             <ScissorsIcon className="w-24 h-24 text-gray-400 mb-4" />
             <span className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">{t.smart.workspace}</span>
          </div>
        )}
      </div>

      {isNamingModalOpen && (
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white/20 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <h4 className="text-gray-900 font-black text-xs uppercase tracking-[0.2em] mb-4">{t.smart.classify}</h4>
              <div className="mb-8 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-left">
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-2">{t.smart.content}</p>
                <p className="text-sm text-indigo-900 italic line-clamp-3 leading-relaxed">
                   "{getPreviewText()}"
                </p>
              </div>

              <input
                ref={modalInputRef}
                type="text"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl px-4 py-8 text-6xl font-black text-indigo-600 text-center uppercase focus:border-indigo-500 focus:bg-white focus:ring-0 transition-all placeholder-gray-100 shadow-inner"
                placeholder="?"
                maxLength={1}
                value={namingInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^[tqxi]$/i.test(val)) {
                    setNamingInput(val.toUpperCase());
                  }
                }}
                onKeyDown={handleModalKeyDown}
              />
              <div className="mt-8 flex justify-center gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                <span>[T] {t.smart.t}</span>
                <span>[X] {t.smart.x}</span>
                <span>[Q] {t.smart.q}</span>
                <span>[I] {t.smart.i}</span>
              </div>
            </div>
            <button 
              onClick={() => {
                setIsNamingModalOpen(false);
                setTimeout(() => textareaRef.current?.focus(), 10);
              }}
              className="w-full py-6 bg-gray-50 text-gray-400 text-[10px] font-black uppercase hover:bg-red-50 hover:text-red-500 transition-all border-t border-gray-100 tracking-[0.4em]"
            >
              {t.smart.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
