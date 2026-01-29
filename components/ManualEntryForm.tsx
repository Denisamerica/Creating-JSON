import React, { useState, useRef, useEffect } from 'react';
import { CSVRow } from '../types';
import { 
  PlusCircleIcon, 
  TrashIcon, 
  DocumentTextIcon, 
  QuestionMarkCircleIcon,
  ArrowRightCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Block {
  id: string;
  type: 'text' | 'question';
  value: string;
}

interface ManualEntryFormProps {
  onSubmit: (row: Partial<CSVRow>) => void;
  initialData?: Partial<CSVRow>; // Data passed from the parent (e.g. from OCR results)
}

export const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ onSubmit, initialData }) => {
  const [lessonTitle, setLessonTitle] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', type: 'text', value: '' }
  ]);
  
  // Track the stringified version of initialData to prevent unnecessary resets
  const prevInitialDataRef = useRef<string>('');

  // Ref to handle auto-scroll or focus when adding blocks
  const blocksContainerRef = useRef<HTMLDivElement>(null);

  // REVERSE MAPPING: When initialData changes, populate the form
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
        // Create a signature of the content we care about to avoid resetting on reference changes
        // or metadata updates that don't affect content
        const contentSignature = JSON.stringify({
            t: initialData.lesson_title,
            t1: initialData.text_1, t2: initialData.text_2, t3: initialData.text_3,
            q1: initialData.question_1, t4: initialData.text_4,
            q2: initialData.question_2, t5: initialData.text_5,
            q3: initialData.question_3, t6: initialData.text_6,
            q4: initialData.question_4, t7: initialData.text_7, t8: initialData.text_8
        });

        if (contentSignature === prevInitialDataRef.current) {
            return; // Skip update if content is effectively the same
        }
        prevInitialDataRef.current = contentSignature;

        setLessonTitle(initialData.lesson_title || '');
        
        const newBlocks: Block[] = [];
        const add = (type: 'text' | 'question', value: string | undefined) => {
            if (value && value.trim()) {
                newBlocks.push({ id: crypto.randomUUID(), type, value });
            }
        };

        // 1. Initial Text Blocks
        add('text', initialData.text_1);
        add('text', initialData.text_2);
        add('text', initialData.text_3);

        // 2. Interaction 1
        add('question', initialData.question_1);

        // 3. Middle Text
        add('text', initialData.text_4);

        // 4. Interaction 2
        add('question', initialData.question_2);

        // 5. Middle Text
        add('text', initialData.text_5);

        // 6. Interaction 3
        add('question', initialData.question_3);
        
        // 7. Middle Text
        add('text', initialData.text_6);

        // 8. Interaction 4
        add('question', initialData.question_4);

        // 9. Final Text
        add('text', initialData.text_7);
        add('text', initialData.text_8);

        // If no blocks were found (empty row), default to one empty text block
        if (newBlocks.length === 0) {
            newBlocks.push({ id: crypto.randomUUID(), type: 'text', value: '' });
        }

        setBlocks(newBlocks);
    }
  }, [initialData]);

  const addBlock = (type: 'text' | 'question') => {
    setBlocks(prev => [...prev, { id: crypto.randomUUID(), type, value: '' }]);
    // Scroll to bottom functionality could be added here
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1 && blocks[0].id === id) {
        // Don't remove the last block, just clear it
        updateBlock(id, '');
        return;
    }
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const updateBlock = (id: string, value: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, value } : b));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the form?")) {
        setLessonTitle('');
        setBlocks([{ id: crypto.randomUUID(), type: 'text', value: '' }]);
        prevInitialDataRef.current = ''; 
    }
  };

  const handleProcess = () => {
    if (!lessonTitle.trim()) {
      alert("Lesson Title is required.");
      return;
    }

    // Initialize with existing inputs to preserve them (since we can't edit them here)
    const row: Partial<CSVRow> = {
      lesson_title: lessonTitle,
      input_1: initialData?.input_1 || "",
      input_2: initialData?.input_2 || "",
      input_3: initialData?.input_3 || "",
      input_4: initialData?.input_4 || "",
    };

    // Smart Mapping Logic to fit the rigid CSV structure
    let questionIndex = 0;
    let textIndexInGroup = 0;

    blocks.forEach((block) => {
      if (block.type === 'question') {
        questionIndex++;
        textIndexInGroup = 0; // Reset text counter for the next section

        // Map specific question slots
        if (questionIndex === 1) {
            row.question_1 = block.value;
            // Do NOT overwrite row.input_1 here
        } else if (questionIndex === 2) {
            row.question_2 = block.value;
        } else if (questionIndex === 3) {
            row.question_3 = block.value;
        } else if (questionIndex === 4) {
            row.question_4 = block.value;
        }
      } else {
        // It's a Text Block
        textIndexInGroup++;

        if (questionIndex === 0) {
          // Before any questions
          if (textIndexInGroup === 1) row.text_1 = (row.text_1 ? row.text_1 + '\n' : '') + block.value;
          else if (textIndexInGroup === 2) row.text_2 = block.value;
          else if (textIndexInGroup >= 3) row.text_3 = (row.text_3 ? row.text_3 + '\n' : '') + block.value;
        } 
        else if (questionIndex === 1) {
          // Between Q1 and Q2 -> text_4
          row.text_4 = (row.text_4 ? row.text_4 + '\n' : '') + block.value;
        }
        else if (questionIndex === 2) {
          // Between Q2 and Q3 -> text_5
          row.text_5 = (row.text_5 ? row.text_5 + '\n' : '') + block.value;
        }
        else if (questionIndex === 3) {
           // Between Q3 and Q4 -> text_6
           row.text_6 = (row.text_6 ? row.text_6 + '\n' : '') + block.value;
        }
        else if (questionIndex >= 4) {
           // After Q4 -> text_7, text_8
           if (!row.text_7) row.text_7 = block.value;
           else row.text_8 = (row.text_8 ? row.text_8 + '\n' : '') + block.value;
        }
      }
    });

    // Update the ref immediately to prevent the useEffect from undoing our work
    // when the parent passes back the data we just created
    prevInitialDataRef.current = JSON.stringify({
        t: row.lesson_title,
        t1: row.text_1, t2: row.text_2, t3: row.text_3,
        q1: row.question_1, t4: row.text_4,
        q2: row.question_2, t5: row.text_5,
        q3: row.question_3, t6: row.text_6,
        q4: row.question_4, t7: row.text_7, t8: row.text_8
    });

    onSubmit(row);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex-shrink-0 flex items-center justify-between">
            <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Content Builder</h3>
                <p className="text-xs text-gray-500 mt-1">Build your page structure. Blocks are mapped sequentially to the CSV.</p>
            </div>
            <button 
                onClick={handleClear}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Clear Form"
            >
                <ArrowPathIcon className="w-5 h-5" />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4" ref={blocksContainerRef}>
            {/* Lesson Title */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Lesson Title <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border"
                    placeholder="e.g. Introduction to Science"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                />
            </div>

            <hr className="border-gray-100" />

            {/* Dynamic Blocks */}
            <div className="space-y-3">
                {blocks.map((block, index) => (
                    <div key={block.id} className="relative group transition-all">
                         <div className="flex items-center justify-between mb-1">
                             <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                {block.type === 'question' ? (
                                    <>
                                        <QuestionMarkCircleIcon className="w-4 h-4 text-orange-500" />
                                        <span className="text-orange-700">Question Block</span>
                                    </>
                                ) : (
                                    <>
                                        <DocumentTextIcon className="w-4 h-4 text-blue-500" />
                                        <span className="text-blue-700">Text Block</span>
                                    </>
                                )}
                             </label>
                             
                             {/* Reordering Controls */}
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => moveBlock(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    title="Move Up"
                                >
                                    <ChevronUpIcon className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => moveBlock(index, 'down')}
                                    disabled={index === blocks.length - 1}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    title="Move Down"
                                >
                                    <ChevronDownIcon className="w-3 h-3" />
                                </button>
                                <div className="w-px h-3 bg-gray-200 mx-1"></div>
                                <button 
                                    onClick={() => removeBlock(block.id)}
                                    className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"
                                    title="Remove block"
                                >
                                    <TrashIcon className="w-3 h-3" />
                                </button>
                             </div>
                         </div>

                         <div className="relative">
                             <textarea 
                                className={`w-full rounded-lg shadow-sm text-sm p-3 border min-h-[80px] focus:ring-1 focus:ring-opacity-50 transition-colors ${
                                    block.type === 'question' 
                                    ? 'border-orange-200 focus:border-orange-500 focus:ring-orange-500 bg-orange-50/30' 
                                    : 'border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-blue-50/30'
                                }`}
                                placeholder={block.type === 'question' ? "Type the question..." : "Type content text..."}
                                value={block.value}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                             />
                             {block.type === 'question' && (
                                 <div className="absolute bottom-2 right-2 text-[10px] text-orange-400 bg-white/50 px-1.5 py-0.5 rounded border border-orange-100">
                                     + Input field added automatically
                                 </div>
                             )}
                         </div>
                         
                         {/* Visual Connector */}
                         {index < blocks.length - 1 && (
                            <div className="flex justify-center my-1">
                                <div className="w-0.5 h-3 bg-gray-200"></div>
                            </div>
                         )}
                    </div>
                ))}
            </div>

            {/* Add Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4 pb-2">
                <button 
                    onClick={() => addBlock('text')}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 border border-dashed border-blue-300 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all"
                >
                    <PlusCircleIcon className="w-4 h-4" />
                    Add Text
                </button>
                <button 
                    onClick={() => addBlock('question')}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 border border-dashed border-orange-300 rounded-lg text-xs font-semibold text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-all"
                >
                    <PlusCircleIcon className="w-4 h-4" />
                    Add Question
                </button>
            </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button 
                onClick={handleProcess}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm active:scale-[0.98]"
            >
                <ArrowRightCircleIcon className="w-5 h-5" />
                Update Table
            </button>
        </div>
    </div>
  );
};