
import React, { useState, useEffect } from 'react';
import { UILanguage, translations } from '../utils/translations';
import { StudyMetadata } from '../types';
import { XMarkIcon, DevicePhoneMobileIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

interface SplitBlock {
  id: string;
  type: 't' | 'x' | 'q' | 'i';
  text: string;
}

interface LessonPreviewModalProps {
  blocks: SplitBlock[];
  basics: StudyMetadata & { lesson_title: string };
  uiLanguage: UILanguage;
  onClose: () => void;
  onUpdateBlock: (id: string, text: string) => void;
  customJson?: string | null;
}

export const LessonPreviewModal: React.FC<LessonPreviewModalProps> = ({ 
  blocks, 
  basics, 
  uiLanguage, 
  onClose, 
  onUpdateBlock,
  customJson
}) => {
  const t = translations[uiLanguage];
  const [editingId, setEditingId] = useState<string | null>(null);

  // Parse custom JSON if available
  const parsedData = React.useMemo(() => {
    if (!customJson) return null;
    try {
      const parsed = JSON.parse(customJson);
      // We expect an array with at least one lesson object
      return Array.isArray(parsed) ? parsed[0] : parsed;
    } catch (e) {
      console.error("Failed to parse custom JSON for preview", e);
      return null;
    }
  }, [customJson]);

  const displayBasics = parsedData ? {
    week_number: parsedData.week_number?.toString() || '',
    day_name: basics.day_name, // Day name might not be in JSON, keep from basics
    lesson_title: parsedData.title || ''
  } : basics;

  const displayBlocks = parsedData && parsedData.content ? 
    parsedData.content.map((item: any, index: number) => ({
      id: `custom-${index}`,
      type: item.type === 'title' ? 't' : item.type === 'question' ? 'q' : item.type === 'text' ? 'x' : item.type === 'input' ? 'i' : 'other',
      text: item.text || item.question || item.content || '',
      placeholder: item.placeholder || t.preview.inputPlaceholder,
      isInput: item.type === 'input'
    })) : 
    blocks.map(b => ({ ...b, isInput: b.type === 'i' }));

  // Fecha o modal ao pressionar ESC
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Se estiver editando um bloco, talvez queira apenas sair da edição primeiro?
        // Neste caso, fecharemos o modal diretamente conforme solicitado.
        onClose();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onClose]);

  const handleBlur = () => {
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        setEditingId(null);
    }
    // Opcional: Impedir propagação se quiser que o ESC cancele apenas a edição e não feche o modal
    // mas a regra global acima terá precedência a menos que paremos a propagação aqui.
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 bg-white flex items-center justify-between shadow-sm z-10">
           <div className="flex items-center gap-4">
             <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200">
               <DevicePhoneMobileIcon className="w-6 h-6" />
             </div>
             <div>
               <h2 className="text-xl font-black text-gray-900 tracking-tight">{t.preview.title}</h2>
               <p className="text-xs text-gray-400 font-medium">{t.preview.subtitle}</p>
             </div>
           </div>
           <button 
             onClick={onClose} 
             className="group flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl transition-all font-bold text-xs uppercase tracking-widest border border-gray-100"
           >
             {t.preview.close}
             <XMarkIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
           </button>
        </div>

        {/* Content Area - Simulated App View */}
        <div className="flex-1 overflow-y-auto bg-gray-50 custom-scrollbar p-8 flex justify-center">
            <div className="w-full max-w-2xl bg-white min-h-full shadow-lg rounded-t-3xl border-x border-t border-gray-200 flex flex-col">
                
                {/* Fake App Header */}
                <div className="bg-indigo-600 text-white p-6 rounded-t-3xl">
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
                        {displayBasics.week_number ? `${t.basics.weekNumber} ${displayBasics.week_number}` : 'Week 1'} • {displayBasics.day_name || 'Today'}
                    </div>
                    <h1 className="text-2xl font-bold leading-tight">
                        {displayBasics.lesson_title || 'Lesson Title'}
                    </h1>
                </div>

                {/* Blocks */}
                <div className="p-8 space-y-8">
                    {displayBlocks.map((block: any) => (
                        <div key={block.id} className="relative group transition-all">
                            
                            {/* Edit Indicator - Only for non-custom mode */}
                            {!customJson && (
                                <div className="absolute -left-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                                    <PencilSquareIcon className="w-4 h-4 text-gray-300" />
                                </div>
                            )}

                            {editingId === block.id && !customJson ? (
                                <textarea
                                    autoFocus
                                    className={`w-full p-4 rounded-xl border-2 focus:ring-0 resize-none shadow-lg animate-in fade-in duration-200 text-base leading-relaxed ${
                                        block.type === 't' ? 'border-purple-500 font-bold text-xl' :
                                        block.type === 'q' ? 'border-amber-500 font-medium' :
                                        'border-blue-500 text-gray-700'
                                    }`}
                                    value={block.text}
                                    onChange={(e) => onUpdateBlock(block.id, e.target.value)}
                                    onBlur={handleBlur}
                                    onKeyDown={(e) => handleKeyDown(e, block.id)}
                                    rows={block.text.length > 100 ? 5 : 2}
                                />
                            ) : (
                                <div onClick={() => !customJson && setEditingId(block.id)} className={!customJson ? "cursor-pointer" : ""}>
                                    {/* TITLE RENDER */}
                                    {block.type === 't' && (
                                        <h2 className="text-xl font-black text-gray-900 leading-tight hover:text-indigo-700 transition-colors border-l-4 border-transparent hover:border-purple-200 pl-0 hover:pl-4 duration-300">
                                            {block.text || <span className="text-gray-300 italic">Empty Title...</span>}
                                        </h2>
                                    )}

                                    {/* TEXT RENDER */}
                                    {block.type === 'x' && (
                                        <p className="text-gray-600 leading-7 text-base hover:bg-blue-50/50 rounded-lg p-0 hover:p-2 transition-all duration-300">
                                            {block.text || <span className="text-gray-300 italic">Empty Paragraph...</span>}
                                        </p>
                                    )}

                                    {/* QUESTION RENDER */}
                                    {block.type === 'q' && (
                                        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 hover:shadow-md hover:border-amber-200 transition-all duration-300 group/card">
                                            <p className="font-bold text-gray-800 text-base mb-4 flex gap-2">
                                                <span className="text-amber-500">Q.</span> 
                                                {block.text || <span className="text-gray-400 font-normal italic">Empty Question...</span>}
                                            </p>
                                            {/* We don't render the input here if it's a separate block in custom mode */}
                                            {!customJson && (
                                                <div className="w-full h-24 bg-white border border-gray-200 rounded-xl p-3">
                                                    <p className="text-sm text-gray-400 italic pointer-events-none">
                                                        {t.preview.inputPlaceholder}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* INPUT RENDER */}
                                    {(block.isInput || block.type === 'i') && (
                                        <div className="w-full h-24 bg-white border border-gray-200 rounded-xl p-3">
                                            <p className="text-sm text-gray-400 italic pointer-events-none">
                                                {block.placeholder || t.preview.inputPlaceholder}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {displayBlocks.length === 0 && (
                        <div className="text-center py-20 text-gray-400">
                            No content blocks to display.
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Footer info */}
        <div className="bg-white p-4 border-t border-gray-100 flex justify-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {customJson ? 'Previewing Custom JSON Code' : 'Live Preview Mode • Edits are saved automatically'}
        </div>
      </div>
    </div>
  );
};
