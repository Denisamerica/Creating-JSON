
import React, { useState, useEffect } from 'react';
import { CSVRow } from '../types';
import { 
  PlusCircleIcon, 
  TrashIcon, 
  DocumentTextIcon, 
  QuestionMarkCircleIcon,
  ArrowRightCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Block {
  id: string;
  type: 'text' | 'question';
  value: string;
}

interface ManualEntryFormProps {
  onSubmit: (row: Partial<CSVRow>) => void;
  initialData?: Partial<CSVRow>;
}

export const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ onSubmit, initialData }) => {
  const [lessonTitle, setLessonTitle] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([{ id: '1', type: 'text', value: '' }]);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setLessonTitle(initialData.lesson_title || '');
      const newBlocks: Block[] = [];
      
      const keys: (keyof CSVRow)[] = [
        'text_1', 'text_2', 'text_3', 'question_1', 'text_4', 'question_2', 
        'text_5', 'question_3', 'text_6', 'question_4', 'text_7', 'text_8'
      ];

      keys.forEach(key => {
        const val = initialData[key];
        if (val) {
          newBlocks.push({
            id: crypto.randomUUID(),
            type: key.startsWith('question') ? 'question' : 'text',
            value: val as string
          });
        }
      });

      if (newBlocks.length > 0) setBlocks(newBlocks);
    }
  }, [initialData]);

  const handleProcess = () => {
    if (!lessonTitle) return alert("Título obrigatório");
    const row: Partial<CSVRow> = { lesson_title: lessonTitle };
    let qIdx = 0, tIdx = 0;

    blocks.forEach(b => {
      if (b.type === 'question') {
        qIdx++;
        if (qIdx <= 4) row[`question_${qIdx}` as keyof CSVRow] = b.value;
      } else {
        tIdx++;
        if (tIdx <= 8) row[`text_${tIdx}` as keyof CSVRow] = b.value;
      }
    });
    onSubmit(row);
    setLessonTitle('');
    setBlocks([{ id: crypto.randomUUID(), type: 'text', value: '' }]);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
      <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Editor de Linha</h3>
        <button onClick={() => { setLessonTitle(''); setBlocks([{id:'1', type:'text', value:''}]); }}><ArrowPathIcon className="w-4 h-4 text-gray-400" /></button>
      </div>
      <div className="p-4 space-y-4">
        <input type="text" placeholder="Lesson Title" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} className="w-full border-gray-200 rounded-lg text-sm" />
        <div className="space-y-2">
          {blocks.map((b, idx) => (
            <div key={b.id} className="flex gap-2 items-start">
              <div className="flex-1">
                <textarea value={b.value} onChange={e => setBlocks(prev => prev.map(bl => bl.id === b.id ? {...bl, value: e.target.value} : bl))} className={`w-full text-xs rounded-lg border-gray-100 ${b.type === 'question' ? 'bg-amber-50/30' : 'bg-blue-50/30'}`} rows={2} />
              </div>
              <button onClick={() => setBlocks(p => p.filter(bl => bl.id !== b.id))} className="text-gray-300 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setBlocks(p => [...p, {id: crypto.randomUUID(), type:'text', value:''} ] )} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase"> + TEXT </button>
          <button onClick={() => setBlocks(p => [...p, {id: crypto.randomUUID(), type:'question', value:''} ] )} className="flex-1 py-2 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase"> + QUESTION </button>
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <button onClick={handleProcess} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-indigo-100">Adicionar à Tabela</button>
      </div>
    </div>
  );
};
