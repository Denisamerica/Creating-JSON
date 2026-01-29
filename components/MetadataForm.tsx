import React from 'react';
import { StudyMetadata } from '../types';
import { PencilSquareIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface MetadataFormProps {
  metadata: StudyMetadata;
  onChange: (field: keyof StudyMetadata, value: string) => void;
  disabled: boolean;
}

export const MetadataForm: React.FC<MetadataFormProps> = ({ metadata, onChange, disabled }) => {
  const isComplete = Object.values(metadata).every(val => typeof val === 'string' && val.trim().length > 0);

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 border transition-all duration-500 ${isComplete ? 'border-green-100 ring-4 ring-green-50' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isComplete ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
            <PencilSquareIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">1. Manual Context Data</h2>
            <p className="text-[10px] text-gray-400 font-medium">Informações básicas da lição</p>
          </div>
        </div>
        {isComplete ? (
          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold border border-green-100">
            <CheckCircleIcon className="w-3.5 h-3.5" />
            COMPLETO
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold border border-amber-100">
            <ExclamationCircleIcon className="w-3.5 h-3.5" />
            PENDENTE
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
        <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                Week Title
            </label>
            <input
                type="text"
                value={metadata.week_title}
                onChange={(e) => onChange('week_title', e.target.value)}
                disabled={disabled}
                placeholder="Ex: The Mind of Christ"
                className="w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:bg-white focus:ring-indigo-500 text-sm py-2.5 px-4 border transition-all"
            />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
            Week #
          </label>
          <input
            type="text"
            value={metadata.week_number}
            onChange={(e) => onChange('week_number', e.target.value)}
            disabled={disabled}
            placeholder="Ex: 1"
            className="w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:bg-white focus:ring-indigo-500 text-sm py-2.5 px-4 border transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
            Language
          </label>
          <input
            type="text"
            value={metadata.language}
            onChange={(e) => onChange('language', e.target.value)}
            disabled={disabled}
            placeholder="Ex: pt-br"
            className="w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:bg-white focus:ring-indigo-500 text-sm py-2.5 px-4 border transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
            Day #
          </label>
          <input
            type="text"
            value={metadata.day_number}
            onChange={(e) => onChange('day_number', e.target.value)}
            disabled={disabled}
            placeholder="Ex: 3"
            className="w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:bg-white focus:ring-indigo-500 text-sm py-2.5 px-4 border transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
            Day Name
          </label>
          <select
            value={metadata.day_name}
            onChange={(e) => onChange('day_name', e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:bg-white focus:ring-indigo-500 text-sm py-2.5 px-4 border transition-all bg-white cursor-pointer"
          >
            <option value="">Selecionar...</option>
            <option value="Saturday">Sábado</option>
            <option value="Sunday">Domingo</option>
            <option value="Monday">Segunda</option>
            <option value="Tuesday">Terça</option>
            <option value="Wednesday">Quarta</option>
            <option value="Thursday">Quinta</option>
            <option value="Friday">Sexta</option>
          </select>
        </div>
      </div>
    </div>
  );
};
