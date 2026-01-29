import React, { useRef, useState } from 'react';
import { UILanguage, translations } from '../utils/translations';
import { CloudArrowUpIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface FileUploadProps {
  onFileSelect: (base64: string, previewUrl: string) => void;
  onCancel?: () => void;
  isLoading: boolean;
  progress?: number;
  uiLanguage: UILanguage;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onCancel, isLoading, progress = 0, uiLanguage }) => {
  const t = translations[uiLanguage];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      onFileSelect(base64, result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!isLoading && e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all text-center overflow-hidden ${
        dragActive 
          ? 'border-indigo-500 bg-indigo-50' 
          : 'border-gray-300 hover:border-gray-400 bg-white'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={isLoading}
      />
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-2 animate-in fade-in duration-300">
           <div className="relative mb-4">
             <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-75"></div>
             <div className="relative bg-white p-3 rounded-full shadow-sm z-10">
               <SparklesIcon className="w-8 h-8 text-indigo-600 animate-pulse" />
             </div>
           </div>
           
           <h3 className="text-lg font-medium text-gray-900">{t.upload.analyzing}</h3>
           <p className="text-sm text-gray-500 mt-1 mb-6">{t.upload.extracting}</p>

           <div className="w-full max-w-xs mb-6">
             <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">
               <span>{t.upload.processing}</span>
               <span>{Math.round(progress)}%</span>
             </div>
             <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200">
               <div
                 className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                 style={{ width: `${progress}%` }}
               ></div>
             </div>
           </div>
           
           {onCancel && (
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 onCancel();
               }}
               className="flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 rounded-full text-xs font-semibold hover:bg-red-50 transition-colors border border-red-200 shadow-sm"
             >
               <XCircleIcon className="w-4 h-4" />
               {t.upload.cancel}
             </button>
           )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="bg-indigo-100 p-3 rounded-full">
            <CloudArrowUpIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{t.upload.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{t.upload.subtitle}</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            {t.upload.selectFile}
          </button>
          <p className="text-xs text-gray-400 mt-2">{t.upload.support}</p>
        </div>
      )}
    </div>
  );
};