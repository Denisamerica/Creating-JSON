
import React, { useRef } from 'react';
import { UILanguage, translations } from '../utils/translations';
import { 
  FolderOpenIcon, 
  DocumentTextIcon, 
  TrashIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

export interface ImportedJson {
  id: string;
  name: string;
  content: string;
  timestamp: string;
}

interface JsonImporterProps {
  importedFiles: ImportedJson[];
  onFilesImport: (files: ImportedJson[]) => void;
  onLoadFile: (file: ImportedJson) => void;
  onRemoveFile: (id: string) => void;
  uiLanguage: UILanguage;
  loadedFileId?: string | null;
}

export const JsonImporter: React.FC<JsonImporterProps> = ({
  importedFiles,
  onFilesImport,
  onLoadFile,
  onRemoveFile,
  uiLanguage,
  loadedFileId
}) => {
  const t = translations[uiLanguage];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        onFilesImport(newFiles);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,application/json"
          multiple
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-8 border-2 border-dashed border-indigo-200 rounded-3xl bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-400 transition-all flex flex-col items-center justify-center gap-3 group"
        >
          <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-all">
            <FolderOpenIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-indigo-900 uppercase tracking-widest">{t.importJson.button}</p>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">JSON Files Only</p>
          </div>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t.importJson.title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {importedFiles.length}
            </span>
            {importedFiles.length > 0 && (
              <button
                onClick={() => {
                  onFilesImport([]);
                }}
                className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all rounded-lg"
                title={t.table.clear}
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {importedFiles.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
            <DocumentTextIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.importJson.empty}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {importedFiles.map((file) => (
              <div 
                key={file.id}
                className={`group p-4 bg-white border rounded-2xl hover:shadow-md transition-all flex items-center justify-between ${
                  loadedFileId === file.id ? 'border-indigo-500 bg-indigo-50/10' : 'border-gray-100 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-xl transition-all ${
                    loadedFileId === file.id ? 'bg-indigo-600' : 'bg-gray-50 group-hover:bg-indigo-50'
                  }`}>
                    <DocumentTextIcon className={`w-5 h-5 ${
                      loadedFileId === file.id ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'
                    }`} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold truncate ${loadedFileId === file.id ? 'text-indigo-900' : 'text-gray-700'}`}>
                        {file.name}
                      </p>
                      {loadedFileId === file.id && (
                        <span className="text-[8px] font-black text-white bg-indigo-600 px-1.5 py-0.5 rounded-md uppercase tracking-widest">
                          Loaded
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-gray-400 font-medium uppercase tracking-tighter">
                      {new Date(file.timestamp).toLocaleString(uiLanguage === 'pt' ? 'pt-BR' : uiLanguage === 'es' ? 'es-ES' : 'en-US')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => onLoadFile(file)}
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    title={t.importJson.load}
                  >
                    <ArrowUpTrayIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemoveFile(file.id)}
                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
                    title={t.importJson.remove}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
