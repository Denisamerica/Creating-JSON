import React from 'react';
import { CSVRow } from '../types';
import { UILanguage, translations } from '../utils/translations';
import { ChevronLeftIcon, ChevronRightIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';

interface TablePreviewProps {
  data: CSVRow[];
  columns: (keyof CSVRow)[];
  onMoveColumn: (index: number, direction: 'left' | 'right') => void;
  onDeleteColumn: (header: keyof CSVRow) => void;
  onEditHeader?: (key: keyof CSVRow) => void;
  onClear?: () => void;
  uiLanguage: UILanguage;
}

export const TablePreview: React.FC<TablePreviewProps> = ({ data, columns, onMoveColumn, onDeleteColumn, onEditHeader, onClear, uiLanguage }) => {
  const t = translations[uiLanguage];
  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full animate-in fade-in duration-500">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{t.table.preview}</h3>
        <div className="flex items-center gap-3">
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
            {data.length} {t.table.rows}
            </span>
            {onClear && (
                <button 
                    onClick={onClear} 
                    className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-100 shadow-sm"
                    title={t.table.clear}
                >
                    <TrashIcon className="w-3 h-3" />
                    {t.table.clear}
                </button>
            )}
        </div>
      </div>
      
      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              {columns.map((header, idx) => (
                <th
                  key={header}
                  scope="col"
                  className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap group hover:bg-white transition-colors relative"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between w-full">
                        <span className="text-gray-900">{header.replace(/_/g, ' ')}</span>
                        <PencilSquareIcon 
                            className="w-3.5 h-3.5 text-indigo-400 cursor-pointer hover:text-indigo-600 transition-colors" 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEditHeader?.(header); }}
                        />
                    </div>
                    
                    <div 
                        className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg w-fit"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} 
                    >
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onMoveColumn(idx, 'left'); }}
                        disabled={idx === 0}
                        className="p-1 hover:bg-white hover:shadow-sm rounded-md disabled:opacity-20 transition-all"
                      >
                        <ChevronLeftIcon className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onMoveColumn(idx, 'right'); }}
                        disabled={idx === columns.length - 1}
                        className="p-1 hover:bg-white hover:shadow-sm rounded-md disabled:opacity-20 transition-all"
                      >
                        <ChevronRightIcon className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      
                      <div className="w-px h-3.5 bg-gray-300 mx-0.5"></div>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDeleteColumn(header);
                        }}
                        className="p-1.5 hover:bg-red-500 hover:text-white rounded-md text-red-400 transition-all flex items-center justify-center group/btn"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                {columns.map((header) => (
                  <td key={`${idx}-${header}`} className="px-6 py-4 min-w-[200px] text-gray-600 align-top border-r border-gray-50 last:border-r-0">
                    <div className="line-clamp-4 hover:line-clamp-none transition-all text-[13px] leading-relaxed">
                      {row[header] || <span className="text-gray-200 italic font-medium">{t.table.empty}</span>}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};