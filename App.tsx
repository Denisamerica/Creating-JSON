
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { JsonPreview } from './components/JsonPreview';
import { BasicsForm } from './components/BasicsForm';
import { SmartSplitter } from './components/SmartSplitter';
import { downloadJSON, generateJSON } from './utils/csvHelper';
import { processImageWithGemini } from './services/geminiService';
import { StudyMetadata } from './types';
import { UILanguage, translations } from './utils/translations';
import { 
  TableCellsIcon, 
  PhotoIcon,
  PencilSquareIcon,
  ScissorsIcon,
  CommandLineIcon,
  TrashIcon,
  SparklesIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  LanguageIcon,
  ComputerDesktopIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
  ArrowRightIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const DAY_MAP: Record<string, string> = {
  '1': 'Saturday', '2': 'Sunday', '3': 'Monday', '4': 'Tuesday', '5': 'Wednesday', '6': 'Thursday', '7': 'Friday',
};

const INITIAL_BASICS = {
  week_number: '', week_title: '', day_number: '', day_name: '', language: '', lesson_title: ''
};

interface SplitBlock {
  id: string;
  type: 't' | 'x' | 'q';
  text: string;
}

const App: React.FC = () => {
  const [uiLanguage, setUiLanguage] = useState<UILanguage>('pt');
  const t = translations[uiLanguage];

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [forceDesktop, setForceDesktop] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Key to force re-render/reset components with local state
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [basics, setBasics] = useState<StudyMetadata & { lesson_title: string }>(INITIAL_BASICS);

  // Initial tab changed to 'smart' to reflect its new position on the far left
  const [activeTab, setActiveTab] = useState<'upload' | 'basics' | 'smart'>('smart');
  const [isLoading, setIsLoading] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [smartBlocks, setSmartBlocks] = useState<SplitBlock[]>([]);
  
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [focusEditText, setFocusEditText] = useState('');

  const hasAnyData = useMemo(() => {
    const hasBasics = Object.values(basics).some(v => typeof v === 'string' && v.trim() !== "");
    const hasBlocks = smartBlocks.length > 0;
    return hasBasics || hasBlocks;
  }, [basics, smartBlocks]);

  const handleBasicsChange = (field: string, value: string) => {
    setBasics(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'day_number') {
        const mappedName = DAY_MAP[value];
        if (mappedName) updated.day_name = mappedName;
      } else if (field === 'day_name') {
        const mappedNumber = Object.keys(DAY_MAP).find(key => DAY_MAP[key] === value);
        if (mappedNumber) updated.day_number = mappedNumber;
      }
      return updated;
    });
  };

  const handleImageProcess = async (base64: string) => {
    setIsLoading(true);
    setExtractionProgress(0);
    abortControllerRef.current = new AbortController();

    try {
      const blocks = await processImageWithGemini(
        base64, 
        abortControllerRef.current.signal,
        (prog) => setExtractionProgress(prog)
      );

      if (blocks && blocks.length > 0) {
        const newBlocks: SplitBlock[] = blocks.map(b => ({
            id: crypto.randomUUID(),
            type: b.type === 'title' ? 't' : b.type === 'question' ? 'q' : 'x',
            text: b.content
        }));

        const firstTitle = blocks.find(b => b.type === 'title')?.content;
        if (firstTitle) {
          setBasics(prev => ({ ...prev, lesson_title: firstTitle }));
        }

        setSmartBlocks(newBlocks);
        setActiveTab('smart');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        alert("Falha na extração: " + err.message);
      }
    } finally {
      setIsLoading(false);
      setExtractionProgress(0);
      abortControllerRef.current = null;
    }
  };

  const handleCancelProcess = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleGlobalReset = () => {
    if (confirm(t.table.confirmClear)) {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      setBasics(INITIAL_BASICS);
      setSmartBlocks([]);
      setIsLoading(false);
      setExtractionProgress(0);
      setEditingBlockId(null);
      setFocusEditText('');
      setResetKey(prev => prev + 1);
      setActiveTab('smart');
    }
  };

  const finalizeProcess = () => {
    setActiveTab('basics');
  };

  const addNewBlock = () => {
    const newBlock: SplitBlock = {
        id: crypto.randomUUID(),
        type: 'x',
        text: ''
    };
    setSmartBlocks(prev => [...prev, newBlock]);
  };

  const updateBlockText = (id: string, text: string) => {
    setSmartBlocks(prev => prev.map(b => b.id === id ? { ...b, text } : b));
  };

  const openFocusModal = (block: SplitBlock) => {
    setEditingBlockId(block.id);
    setFocusEditText(block.text);
  };

  const saveFocusEdit = () => {
    if (editingBlockId) {
      updateBlockText(editingBlockId, focusEditText);
      setEditingBlockId(null);
    }
  };

  const toggleBlockType = (id: string) => {
    const types: ('t' | 'x' | 'q')[] = ['t', 'x', 'q'];
    setSmartBlocks(prev => prev.map(b => {
        if (b.id === id) {
            const nextIdx = (types.indexOf(b.type) + 1) % types.length;
            return { ...b, type: types[nextIdx] };
        }
        return b;
    }));
  };

  const handleExportJSON = () => {
    if (!basics.week_number) {
        alert(t.export.weekRequired);
        return;
    }
    const jsonStr = generateJSON(basics, smartBlocks);
    const fileName = `${basics.week_number} - ${basics.week_title || 'No Title'} - ${basics.day_name || 'No Day'}.json`;
    downloadJSON(jsonStr, fileName);
  };

  if (isMobile && !forceDesktop) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col items-center max-w-lg">
          <div className="bg-indigo-50 p-6 rounded-full mb-8">
            <ComputerDesktopIcon className="w-16 h-16 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">{t.mobileBlock.title}</h2>
          <p className="text-gray-500 text-base leading-relaxed font-medium mb-8">{t.mobileBlock.message}</p>
          <button 
            onClick={() => setForceDesktop(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
          >
            {uiLanguage === 'pt' ? 'Estou no computador, continuar' : uiLanguage === 'es' ? 'Estoy en computadora, continuar' : 'I am on desktop, continue'}
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-100">
              <TableCellsIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">{t.appTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
             {hasAnyData && (
                <button
                  onClick={handleGlobalReset}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 group"
                  title={t.table.clear}
                >
                  <ArrowPathIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="hidden sm:inline">{t.table.clear}</span>
                </button>
             )}

             <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

             <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
               <LanguageIcon className="w-4 h-4 text-gray-400" />
               <select 
                 value={uiLanguage}
                 onChange={(e) => setUiLanguage(e.target.value as UILanguage)}
                 className="bg-transparent border-none focus:ring-0 text-xs font-bold uppercase text-gray-600 cursor-pointer"
               >
                 <option value="pt">Português</option>
                 <option value="en">English</option>
                 <option value="es">Español</option>
               </select>
             </div>
             {smartBlocks.length > 0 && (
                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 active:scale-95"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" /> {t.export.json}
                </button>
             )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-10rem)]">
          <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
            <div className="overflow-y-auto custom-scrollbar flex-1 space-y-6 pr-1">
              <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="flex border-b border-gray-200 bg-gray-50/50">
                  {/* Reordered Tabs: Smart -> Basics -> Upload (Disabled) */}
                  <button onClick={() => setActiveTab('smart')} className={`flex-1 py-3 text-[10px] font-black uppercase flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'smart' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
                    <ScissorsIcon className="w-3.5 h-3.5" /> {t.tabs.smart}
                  </button>
                  <button onClick={() => setActiveTab('basics')} className={`flex-1 py-3 text-[10px] font-black uppercase flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'basics' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
                    <PencilSquareIcon className="w-3.5 h-3.5" /> {t.tabs.basics}
                  </button>
                  <button 
                    disabled 
                    className="flex-1 py-3 text-[10px] font-black uppercase flex items-center justify-center gap-1.5 transition-colors text-gray-300 cursor-not-allowed bg-gray-100/50"
                  >
                    <PhotoIcon className="w-3.5 h-3.5" /> {t.tabs.upload}
                  </button>
                </div>

                <div className="p-5">
                  {activeTab === 'basics' && (
                    <BasicsForm 
                      key={`basics-${resetKey}`} 
                      metadata={basics} 
                      onChange={handleBasicsChange} 
                      disabled={isLoading} 
                      uiLanguage={uiLanguage} 
                    />
                  )}
                  {activeTab === 'smart' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{t.smart.blockEditor}</h3>
                        <div className="flex items-center gap-2">
                          <button onClick={() => confirm(t.table.confirmClear) && setSmartBlocks([])} className="p-1 text-gray-300 hover:text-red-500 transition-colors" title={t.table.clear}><TrashIcon className="w-4 h-4"/></button>
                          <span className="bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-lg text-[9px] font-black">{smartBlocks.length}</span>
                        </div>
                      </div>
                      <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                        {smartBlocks.length === 0 ? (
                          <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 text-center bg-gray-50/30">
                            <CommandLineIcon className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">{t.smart.emptyState}</p>
                          </div>
                        ) : (
                          smartBlocks.map((block, idx) => (
                            <div key={block.id} className="group bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:border-indigo-200 transition-all animate-in slide-in-from-bottom-2">
                              <div className="flex items-center justify-between mb-2">
                                <button 
                                    onClick={() => toggleBlockType(block.id)}
                                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${
                                        block.type === 't' ? 'bg-purple-100 text-purple-700' :
                                        block.type === 'q' ? 'bg-amber-100 text-amber-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}
                                >
                                    {block.type === 't' ? t.smart.t : block.type === 'q' ? t.smart.q : t.smart.x}
                                </button>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openFocusModal(block)} className="p-1 text-gray-300 hover:text-indigo-600" title={t.smart.focusEdit}>
                                      <ArrowsPointingOutIcon className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setSmartBlocks(prev => prev.filter(b => b.id !== block.id))} className="p-1 text-gray-300 hover:text-red-500 ml-1"><TrashIcon className="w-3 h-3"/></button>
                                </div>
                              </div>
                              <textarea 
                                value={block.text}
                                onChange={(e) => updateBlockText(block.id, e.target.value)}
                                onFocus={() => openFocusModal(block)}
                                readOnly
                                className="w-full bg-gray-50 rounded-lg p-2 text-[11px] text-gray-600 border-none focus:ring-1 focus:ring-indigo-100 resize-none min-h-[40px] custom-scrollbar cursor-pointer hover:bg-gray-100 transition-colors"
                              />
                            </div>
                          ))
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <button onClick={addNewBlock} className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-dashed border-gray-200 flex items-center justify-center gap-2 transition-all shadow-sm">
                            <PlusIcon className="w-3.5 h-3.5" /> {t.smart.addBlock}
                        </button>
                        {smartBlocks.length > 0 && (
                            <button onClick={finalizeProcess} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 animate-in zoom-in-95">
                                <SparklesIcon className="w-4 h-4" /> Finalizar Edição
                            </button>
                        )}
                      </div>
                    </div>
                  )}
                  {activeTab === 'upload' && (
                    <FileUpload 
                      key={`upload-${resetKey}`}
                      onFileSelect={handleImageProcess} 
                      onCancel={handleCancelProcess}
                      isLoading={isLoading} 
                      progress={extractionProgress}
                      uiLanguage={uiLanguage} 
                    />
                  )}
                </div>
              </section>
            </div>
          </div>

          <div className="lg:col-span-8 h-full">
            {activeTab === 'smart' ? (
              <SmartSplitter 
                key={`smart-${resetKey}`}
                onBlocksUpdate={setSmartBlocks}
                blocks={smartBlocks}
                uiLanguage={uiLanguage}
              />
            ) : smartBlocks.length > 0 ? (
              <JsonPreview basics={basics} blocks={smartBlocks} uiLanguage={uiLanguage} />
            ) : (
              <div className="h-full bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <CommandLineIcon className="w-12 h-12 text-indigo-100" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{t.welcome.title}</h3>
                <p className="text-gray-400 max-w-sm mt-4 text-sm leading-relaxed font-medium">
                  {t.welcome.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {editingBlockId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-xl text-white">
                  <PencilSquareIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{t.smart.modalTitle}</h3>
              </div>
              <button onClick={() => setEditingBlockId(null)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 p-8 bg-white">
              <textarea 
                autoFocus
                value={focusEditText}
                onChange={(e) => setFocusEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveFocusEdit();
                  if (e.key === 'Escape') setEditingBlockId(null);
                }}
                className="w-full h-full min-h-[400px] text-2xl font-medium leading-relaxed text-gray-800 placeholder-gray-200 focus:ring-0 border-none resize-none custom-scrollbar"
                placeholder="..."
              />
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end items-center gap-4 bg-gray-50/50">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:inline">Ctrl + Enter para salvar</span>
              <button onClick={saveFocusEdit} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95">
                {t.smart.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
