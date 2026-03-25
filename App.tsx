
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { JsonPreview } from './components/JsonPreview';
import { BasicsForm } from './components/BasicsForm';
import { SmartSplitter } from './components/SmartSplitter';
import { JsonImporter, ImportedJson } from './components/JsonImporter';
import { LessonPreviewModal } from './components/LessonPreviewModal';
import { NotesModal } from './components/NotesModal';
import { MetadataForm } from './components/MetadataForm';
import { ManualEntryForm } from './components/ManualEntryForm';
import { TablePreview } from './components/TablePreview';
import { downloadJSON, generateJSON, downloadCSV, generateCSV, downloadTXT, DEFAULT_HEADERS } from './utils/csvHelper';
import { processImageWithGemini, extractCSVDataFromImage } from './services/geminiService';
import { StudyMetadata, NoteEntry, CSVRow } from './types';
import { UILanguage, translations } from './utils/translations';
import { 
  TableCellsIcon, 
  PhotoIcon,
  PencilSquareIcon,
  ScissorsIcon,
  CommandLineIcon,
  TrashIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  LanguageIcon,
  ComputerDesktopIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
  EyeIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  FolderOpenIcon
} from '@heroicons/react/24/outline';

const DAY_MAP: Record<string, string> = {
  '1': 'Saturday', '2': 'Sunday', '3': 'Monday', '4': 'Tuesday', '5': 'Wednesday', '6': 'Thursday', '7': 'Friday',
};

const INITIAL_BASICS = {
  week_number: '', week_title: '', day_number: '', day_name: '', language: '', lesson_title: ''
};

const INITIAL_CSV_METADATA: StudyMetadata = {
  week_number: '', week_title: '', day_number: '', day_name: '', language: ''
};

interface SplitBlock {
  id: string;
  type: 't' | 'x' | 'q' | 'i';
  text: string;
}

const App: React.FC = () => {
  const [uiLanguage, setUiLanguage] = useState<UILanguage>('pt');
  const t = translations[uiLanguage];

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [leftPanelWidth, setLeftPanelWidth] = useState(33.33);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((mouseMoveEvent.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth > 20 && newWidth < 80) {
        setLeftPanelWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const [forceDesktop, setForceDesktop] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // APP MODES: 'json' (Smart Splitter) or 'csv' (CSV Table Tool)
  const [appMode, setAppMode] = useState<'json' | 'csv'>('json');

  const [resetKey, setResetKey] = useState(0);

  // --- JSON BUILDER STATES ---
  const [smartEditorText, setSmartEditorText] = useState('');
  const [basics, setBasics] = useState<StudyMetadata & { lesson_title: string }>(INITIAL_BASICS);
  const [activeTabJson, setActiveTabJson] = useState<'upload' | 'basics' | 'smart' | 'files'>('smart');
  const [smartBlocks, setSmartBlocks] = useState<SplitBlock[]>([]);
  const [customJson, setCustomJson] = useState<string | null>(null);
  const [importedJsonFiles, setImportedJsonFiles] = useState<ImportedJson[]>([]);
  const [loadedFileId, setLoadedFileId] = useState<string | null>(null);
  const globalJsonInputRef = useRef<HTMLInputElement>(null);

  // --- CSV BUILDER STATES ---
  const [csvMetadata, setCsvMetadata] = useState<StudyMetadata>(INITIAL_CSV_METADATA);
  const [csvTableData, setCsvTableData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<(keyof CSVRow)[]>(DEFAULT_HEADERS);
  const [activeTabCsv, setActiveTabCsv] = useState<'form' | 'upload'>('form');
  const [pendingCsvRow, setPendingCsvRow] = useState<Partial<CSVRow>>({});

  // --- NOTES STATES ---
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [noteHistory, setNoteHistory] = useState<NoteEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('notes_history');
    if (saved) try { setNoteHistory(JSON.parse(saved)); } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('notes_history', JSON.stringify(noteHistory));
  }, [noteHistory]);

  useEffect(() => {
    if (customJson === null) {
      setLoadedFileId(null);
    }
  }, [customJson]);

  const archiveCurrentNote = (source: 'reset' | 'export', relatedFile?: string) => {
    if (!currentNote.trim()) return;
    const newEntry: NoteEntry = { 
      id: crypto.randomUUID(), 
      timestamp: new Date().toISOString(), 
      content: currentNote, 
      source: source as any, 
      relatedFile 
    };
    setNoteHistory(prev => [newEntry, ...prev]);
    setCurrentNote(''); 
  };

  const handleBasicsChange = (field: string, value: string) => {
    setBasics(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'day_number') updated.day_name = DAY_MAP[value] || updated.day_name;
      else if (field === 'day_name') updated.day_number = Object.keys(DAY_MAP).find(k => DAY_MAP[k] === value) || updated.day_number;
      return updated;
    });
  };

  const [isLoading, setIsLoading] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const handleImageProcess = async (base64: string) => {
    setIsLoading(true);
    setExtractionProgress(0);
    abortControllerRef.current = new AbortController();

    try {
      if (appMode === 'json') {
        const blocks = await processImageWithGemini(base64, abortControllerRef.current.signal, setExtractionProgress);
        if (blocks.length > 0) {
          setSmartBlocks(blocks.map(b => ({ 
            id: crypto.randomUUID(), 
            type: b.type === 'title' ? 't' : b.type === 'question' ? 'q' : 'x', 
            text: b.content 
          })));
          setActiveTabJson('smart');
        }
      } else {
        // MODO CSV: Extração para Tabela
        const csvData = await extractCSVDataFromImage(base64, abortControllerRef.current.signal, setExtractionProgress);
        setPendingCsvRow(csvData);
        setActiveTabCsv('form');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') alert("Falha: " + err.message);
    } finally {
      setIsLoading(false);
      setExtractionProgress(0);
    }
  };

  const handleClearBlocks = () => {
    if (confirm(t.table.confirmClear)) {
      archiveCurrentNote('reset');
      setSmartBlocks([]);
      setSmartEditorText('');
      setEditingBlockId(null);
    }
  };

  const handleExportJSON = () => {
    const jsonStr = customJson || generateJSON(basics, smartBlocks);
    const sanitize = (s: string) => s.replace(/[^a-z0-9 \-_áéíóúâêîôûãõçñàäëïöü]/gi, '').trim();
    
    const weekPart = `${t.basics.week} ${sanitize(basics.week_number) || '1'}`;
    const dayPart = basics.day_name ? sanitize(basics.day_name) : `${t.basics.day} ${sanitize(basics.day_number) || '1'}`;
    const fileName = `${weekPart} - ${dayPart}.json`;
    
    downloadJSON(jsonStr, fileName);
    if (currentNote.trim()) {
        downloadTXT(currentNote, fileName.replace('.json', '.txt'));
        archiveCurrentNote('export', fileName);
    }
  };

  const handleSyncJsonToBlocks = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      const lesson = Array.isArray(parsed) ? parsed[0] : parsed;
      
      if (!lesson) return;

      // Update Basics
      setBasics(prev => ({
        ...prev,
        week_number: lesson.week_number?.toString() || prev.week_number,
        day_number: lesson.day_number?.toString() || prev.day_number,
        day_name: DAY_MAP[lesson.day_number?.toString()] || prev.day_name,
        lesson_title: lesson.title || prev.lesson_title,
        language: lesson.language || prev.language
      }));

      // Update Blocks
      if (lesson.content && Array.isArray(lesson.content)) {
        const newBlocks: SplitBlock[] = lesson.content
          .filter((item: any) => item.type !== 'input') // Skip auto-generated inputs
          .map((item: any) => ({
            id: crypto.randomUUID(),
            type: item.type === 'title' ? 't' : item.type === 'question' ? 'q' : 'x',
            text: item.text || item.question || item.content || ''
          }));
        
        setSmartBlocks(newBlocks);
        // We keep customJson so the button stays active as requested
        // We don't switch tabs automatically so the user can keep working with the code
      }
    } catch (e) {
      alert(uiLanguage === 'pt' ? "Erro ao processar JSON. Verifique o formato." : "Error processing JSON. Check the format.");
    }
  };

  // --- CSV TOOL HANDLERS ---
  const handleCsvMetadataChange = (field: keyof StudyMetadata, value: string) => {
    setCsvMetadata(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'day_number') updated.day_name = DAY_MAP[value] || updated.day_name;
      else if (field === 'day_name') updated.day_number = Object.keys(DAY_MAP).find(k => DAY_MAP[k] === value) || updated.day_number;
      return updated;
    });
  };

  const handleCsvSubmitRow = (rowData: Partial<CSVRow>) => {
    const newRow = { ...csvMetadata, ...rowData } as CSVRow;
    setCsvTableData(prev => [...prev, newRow]);
    setPendingCsvRow({});
  };

  const handleExportCSV = () => {
    if (csvTableData.length === 0) return;
    const csvContent = generateCSV(csvTableData, csvHeaders);
    const sanitize = (s: string) => s.replace(/[^a-z0-9 \-_áéíóúâêîôûãõçñàäëïöü]/gi, '').trim();
    
    const weekPart = `${t.basics.week} ${sanitize(csvMetadata.week_number) || '1'}`;
    const dayPart = csvMetadata.day_name ? sanitize(csvMetadata.day_name) : `${t.basics.day} ${sanitize(csvMetadata.day_number) || '1'}`;
    const fileName = `${weekPart} - ${dayPart}.csv`;
    
    downloadCSV(csvContent, fileName);
    if (currentNote.trim()) {
        downloadTXT(currentNote, fileName.replace('.csv', '.txt'));
        archiveCurrentNote('export', fileName);
    }
  };

  const handleClearCsv = () => {
    if (confirm(t.table.confirmClear)) {
      archiveCurrentNote('reset');
      setCsvTableData([]);
    }
  };

  const handleSaveAndViewJson = () => {
    const jsonStr = generateJSON(basics, smartBlocks);
    setCustomJson(jsonStr);
    setActiveTabJson('json');
  };

  const handleImportJsonFiles = (newFiles: ImportedJson[]) => {
    if (newFiles.length === 0) {
      setImportedJsonFiles([]);
    } else {
      setImportedJsonFiles(prev => [...newFiles, ...prev]);
    }
  };

  const handleLoadImportedFile = (file: ImportedJson) => {
    setCustomJson(file.content);
    setLoadedFileId(file.id);
    // Stay in 'files' tab so user can see the list
  };

  const handleRemoveImportedFile = (id: string) => {
    setImportedJsonFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleGlobalJsonOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: ImportedJson[] = [];
    const readers: Promise<void>[] = [];

    Array.from(files).forEach((file: File) => {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const reader = new FileReader();
        const promise = new Promise<void>((resolve) => {
          reader.onload = (event) => {
            const content = event.target?.result as string;
            newFiles.push({
              id: crypto.randomUUID(),
              name: file.name,
              content,
              timestamp: new Date().toISOString()
            });
            resolve();
          };
          reader.readAsText(file);
        });
        readers.push(promise);
      }
    });

    Promise.all(readers).then(() => {
      if (newFiles.length > 0) {
        setImportedJsonFiles(prev => [...newFiles, ...prev]);
        setActiveTabJson('files');
        // If only one file was opened, load it automatically
        if (newFiles.length === 1) {
          handleLoadImportedFile(newFiles[0]);
        }
      }
      if (globalJsonInputRef.current) globalJsonInputRef.current.value = '';
    });
  };

  if (isMobile && !forceDesktop) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col items-center max-w-lg">
          <div className="bg-indigo-50 p-6 rounded-full mb-8">
            <ComputerDesktopIcon className="w-16 h-16 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">Desktop Only</h2>
          <p className="text-gray-500 text-base leading-relaxed font-medium mb-8">This app is designed for desktop use.</p>
          <button onClick={() => setForceDesktop(true)} className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-100">
                <TableCellsIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">{t.appTitle}</h1>
            </div>
            
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setAppMode('json')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  appMode === 'json' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4" />
                {t.modeJson}
              </button>
              <button
                onClick={() => setAppMode('csv')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  appMode === 'csv' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <TableCellsIcon className="w-4 h-4" />
                {t.modeCsv}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button
               onClick={() => setIsNotesOpen(true)}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all border ${
                   currentNote ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
               }`}
             >
               <DocumentTextIcon className="w-4 h-4" />
               {t.notes.button}
             </button>

             <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
               <LanguageIcon className="w-4 h-4 text-gray-400" />
               <select 
                 value={uiLanguage} 
                 onChange={(e) => setUiLanguage(e.target.value as UILanguage)} 
                 className="bg-transparent border-none text-xs font-bold uppercase text-gray-600 focus:ring-0 cursor-pointer"
               >
                 <option value="pt">PT</option>
                 <option value="en">EN</option>
                 <option value="es">ES</option>
               </select>
             </div>

              {appMode === 'json' && (
                <button
                  onClick={() => globalJsonInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm"
                >
                  <FolderOpenIcon className="w-4 h-4" />
                  {t.importJson.button}
                </button>
              )}

              {appMode === 'json' && smartBlocks.length > 0 && (
                <button 
                  onClick={handleExportJSON} 
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  JSON
                </button>
             )}

             {appMode === 'csv' && csvTableData.length > 0 && (
                <button 
                  onClick={handleExportCSV} 
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  {t.table.exportCsv}
                </button>
             )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-hidden">
        <div ref={containerRef} className="max-w-7xl mx-auto flex gap-0 h-[calc(100vh-10rem)] relative">
          <div 
            style={{ width: `${leftPanelWidth}%` }}
            className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden z-10"
          >
            {appMode === 'json' ? (
              <>
                <div className="flex border-b border-gray-200 bg-gray-50/50 flex-shrink-0">
                  <button 
                    onClick={() => setActiveTabJson('smart')} 
                    className={`flex-1 py-3 text-[10px] font-black uppercase transition-all ${activeTabJson === 'smart' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <ScissorsIcon className="w-3.5 h-3.5 inline mr-1" /> {t.tabs.smart}
                  </button>
                  <button 
                    onClick={() => setActiveTabJson('basics')} 
                    className={`flex-1 py-3 text-[10px] font-black uppercase transition-all ${activeTabJson === 'basics' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <PencilSquareIcon className="w-3.5 h-3.5 inline mr-1" /> {t.tabs.basics}
                  </button>
                  <button 
                    onClick={() => setActiveTabJson('upload')} 
                    className={`flex-1 py-3 text-[10px] font-black uppercase transition-all ${activeTabJson === 'upload' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <PhotoIcon className="w-3.5 h-3.5 inline mr-1" /> {t.tabs.upload}
                  </button>
                  <button 
                    onClick={() => setActiveTabJson('files')} 
                    className={`flex-1 py-3 text-[10px] font-black uppercase transition-all ${activeTabJson === 'files' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FolderOpenIcon className="w-3.5 h-3.5 inline mr-1" /> {t.tabs.files}
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                  {activeTabJson === 'basics' && (
                    <BasicsForm metadata={basics} onChange={handleBasicsChange} disabled={isLoading} uiLanguage={uiLanguage} />
                  )}
                  {activeTabJson === 'smart' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{t.smart.blockEditor}</h3>
                        <span className="bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-lg text-[9px] font-black">{smartBlocks.length}</span>
                      </div>
                      <div className="space-y-3">
                        {smartBlocks.length === 0 ? (
                          <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 text-center bg-gray-50/30">
                            <CommandLineIcon className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">{t.smart.emptyState}</p>
                          </div>
                        ) : (
                          smartBlocks.map(b => (
                            <div key={b.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 group relative">
                              <div className="flex justify-between mb-1">
                                <button 
                                  onClick={() => {
                                    const types: SplitBlock['type'][] = ['t', 'x', 'q', 'i'];
                                    const nextType = types[(types.indexOf(b.type) + 1) % types.length];
                                    setSmartBlocks(prev => prev.map(block => block.id === b.id ? {...block, type: nextType} : block));
                                  }}
                                  className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full transition-all hover:scale-105 active:scale-95 ${
                                    b.type === 't' ? 'bg-purple-100 text-purple-700' : 
                                    b.type === 'q' ? 'bg-amber-100 text-amber-700' : 
                                    b.type === 'i' ? 'bg-green-100 text-green-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {b.type === 't' ? t.smart.t : b.type === 'q' ? t.smart.q : b.type === 'i' ? t.smart.i : t.smart.x}
                                </button>
                                <button 
                                  onClick={() => setSmartBlocks(prev => prev.filter(block => block.id !== b.id))}
                                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                                >
                                  <TrashIcon className="w-3 h-3" />
                                </button>
                              </div>
                              <div 
                                onClick={() => setEditingBlockId(b.id)} 
                                className="text-[11px] text-gray-600 line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors"
                              >
                                {b.text || t.table.empty}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        <button 
                          onClick={() => setSmartBlocks(prev => [...prev, { id: crypto.randomUUID(), type: 'x', text: '' }])} 
                          className="col-span-3 py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-dashed border-gray-200 flex items-center justify-center gap-2 transition-all"
                        >
                          <PlusIcon className="w-3.5 h-3.5" /> {t.smart.addBlock}
                        </button>
                        <button 
                          onClick={handleClearBlocks} 
                          className="col-span-1 py-3 bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-100 flex items-center justify-center transition-all"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {activeTabJson === 'upload' && (
                    <FileUpload 
                      onFileSelect={handleImageProcess} 
                      isLoading={isLoading} 
                      progress={extractionProgress} 
                      uiLanguage={uiLanguage} 
                      onCancel={() => abortControllerRef.current?.abort()} 
                    />
                  )}
                  {activeTabJson === 'files' && (
                    <JsonImporter
                      importedFiles={importedJsonFiles}
                      onFilesImport={handleImportJsonFiles}
                      onLoadFile={handleLoadImportedFile}
                      onRemoveFile={handleRemoveImportedFile}
                      uiLanguage={uiLanguage}
                      loadedFileId={loadedFileId}
                    />
                  )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0 grid grid-cols-2 gap-3">
                   <button 
                     onClick={() => setIsPreviewOpen(true)} 
                     className="w-full py-3 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2"
                   >
                     <EyeIcon className="w-4 h-4" /> {t.preview.button}
                   </button>
                   <button 
                     onClick={handleSaveAndViewJson} 
                     className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                   >
                     <CodeBracketIcon className="w-4 h-4" /> {t.smart.saveAndViewJson}
                   </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex border-b border-gray-200 bg-gray-50/50 flex-shrink-0">
                  <button 
                    onClick={() => setActiveTabCsv('form')} 
                    className={`flex-1 py-3 text-[10px] font-black uppercase transition-all ${activeTabCsv === 'form' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <TableCellsIcon className="w-3.5 h-3.5 inline mr-1" /> {t.tabs.csvEntry}
                  </button>
                  <button 
                    onClick={() => setActiveTabCsv('upload')} 
                    className={`flex-1 py-3 text-[10px] font-black uppercase transition-all ${activeTabCsv === 'upload' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <PhotoIcon className="w-3.5 h-3.5 inline mr-1" /> OCR
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
                  {activeTabCsv === 'form' ? (
                    <>
                      <MetadataForm 
                        metadata={csvMetadata} 
                        onChange={handleCsvMetadataChange} 
                        disabled={isLoading} 
                      />
                      <ManualEntryForm 
                        initialData={pendingCsvRow}
                        onSubmit={handleCsvSubmitRow} 
                      />
                    </>
                  ) : (
                    <FileUpload 
                      onFileSelect={handleImageProcess} 
                      isLoading={isLoading} 
                      progress={extractionProgress} 
                      uiLanguage={uiLanguage} 
                      onCancel={() => abortControllerRef.current?.abort()} 
                    />
                  )}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
                   <button
                     onClick={handleExportCSV}
                     disabled={csvTableData.length === 0}
                     className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-200 disabled:text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                   >
                     <DocumentArrowDownIcon className="w-4 h-4" />
                     {t.table.exportCsv}
                   </button>
                </div>
              </>
            )}
          </div>

          {/* Resizer */}
          <div
            onMouseDown={startResizing}
            className={`w-4 -mx-2 z-20 hover:w-4 group cursor-col-resize flex items-center justify-center transition-all ${isResizing ? 'bg-indigo-100/50' : ''}`}
          >
            <div className={`w-1 h-12 rounded-full transition-all ${isResizing ? 'bg-indigo-500' : 'bg-gray-200 group-hover:bg-indigo-300'}`} />
          </div>

          <div 
            style={{ width: `${100 - leftPanelWidth}%` }}
            className="flex flex-col h-full overflow-hidden"
          >
            {appMode === 'json' ? (
              activeTabJson === 'smart' ? (
                <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <SmartSplitter 
                    blocks={smartBlocks} 
                    onBlocksUpdate={setSmartBlocks} 
                    uiLanguage={uiLanguage} 
                    text={smartEditorText} 
                    onTextChange={setSmartEditorText} 
                    onSaveAndViewJson={handleSaveAndViewJson}
                  />
                </div>
              ) : (
                <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <JsonPreview 
                    basics={basics} 
                    blocks={smartBlocks} 
                    uiLanguage={uiLanguage} 
                    customJson={customJson}
                    onCustomJsonChange={setCustomJson}
                    onSyncToBlocks={handleSyncJsonToBlocks}
                  />
                </div>
              )
            ) : (
              <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <TablePreview 
                  data={csvTableData} 
                  columns={csvHeaders} 
                  onMoveColumn={(idx, dir) => {
                    const newHeaders = [...csvHeaders];
                    const target = dir === 'left' ? idx - 1 : idx + 1;
                    [newHeaders[idx], newHeaders[target]] = [newHeaders[target], newHeaders[idx]];
                    setCsvHeaders(newHeaders);
                  }} 
                  onDeleteColumn={(header) => {
                    if(confirm(t.table.deleteColConfirm)) {
                      setCsvHeaders(csvHeaders.filter(h => h !== header));
                    }
                  }} 
                  onClear={handleClearCsv}
                  uiLanguage={uiLanguage} 
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <NotesModal 
        isOpen={isNotesOpen} 
        onClose={() => setIsNotesOpen(false)} 
        currentNote={currentNote} 
        onNoteChange={setCurrentNote} 
        noteHistory={noteHistory} 
        onUpdateHistoryNote={(id, text) => setNoteHistory(p => p.map(n => n.id === id ? {...n, content: text} : n))} 
        onDeleteHistoryNote={(id) => setNoteHistory(p => p.filter(n => n.id !== id))} 
        onClearHistory={() => setNoteHistory([])} 
        uiLanguage={uiLanguage} 
      />

      {isPreviewOpen && (
        <LessonPreviewModal 
          blocks={smartBlocks} 
          basics={basics} 
          uiLanguage={uiLanguage} 
          onClose={() => setIsPreviewOpen(false)} 
          onUpdateBlock={(id, text) => setSmartBlocks(prev => prev.map(b => b.id === id ? {...b, text} : b))} 
          customJson={customJson}
        />
      )}
      <input
        type="file"
        ref={globalJsonInputRef}
        onChange={handleGlobalJsonOpen}
        accept=".json"
        multiple
        className="hidden"
      />
    </div>
  );
};

export default App;
