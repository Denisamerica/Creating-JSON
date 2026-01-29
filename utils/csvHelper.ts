import { CSVRow } from '../types';

export const DEFAULT_HEADERS: (keyof CSVRow)[] = [
  // 1. Context Metadata (Manual Inputs)
  'week_number',
  'week_title',
  'day_number',
  'day_name',
  'lesson_title',
  'language',
  
  // 2. First Block of Text
  'text_1',
  'text_2',
  'text_3',
  
  // 3. First Interaction Pair
  'question_1',
  'input_1',
  
  // 4. Second Block
  'text_4',
  'question_2',
  'input_2',
  
  // 5. Third Block
  'text_5',
  'question_3',
  'input_3',

  // 6. Fourth Block
  'text_6',
  'question_4',
  'input_4',
  
  // 7. Remaining Text
  'text_7',
  'text_8'
];

export const generateCSV = (data: CSVRow[], customHeaders?: (keyof CSVRow)[]): string => {
  const headers = customHeaders || DEFAULT_HEADERS;

  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => {
      return headers.map(fieldName => {
        const value = row[fieldName] || ''; 
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',');
    })
  ];

  return csvRows.join('\n');
};

export const downloadCSV = (csvContent: string, filename: string = 'study-guide-export.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Converte blocos do Smart Split e metadados no formato JSON solicitado.
 * Estrutura: [{ week_number, day_number, title, content: [], language }]
 */
export const generateJSON = (basics: any, blocks: any[]): string => {
  const content: any[] = [];
  
  blocks.forEach(block => {
    if (block.type === 't') {
      content.push({
        type: "title",
        text: block.text
      });
    } else if (block.type === 'x') {
      content.push({
        type: "text", // Replaced "paragraph" with "text" as requested
        text: block.text
      });
    } else if (block.type === 'q') {
      // Question block with double fields as per example
      content.push({
        type: "question",
        question: block.text,
        content: block.text
      });
      // Automatic input field after every question
      content.push({
        type: "input",
        placeholder: "Write your thoughts here..."
      });
    }
  });

  // Language normalization: en, es, pt
  let lang = (basics.language || 'en').toLowerCase();
  if (lang.includes('pt') || lang.includes('port')) lang = 'pt';
  else if (lang.includes('es') || lang.includes('span')) lang = 'es';
  else lang = 'en';

  const jsonObject = [
    {
      week_number: parseInt(basics.week_number) || 1,
      day_number: parseInt(basics.day_number) || 1,
      title: basics.lesson_title || (blocks.find(b => b.type === 't')?.text || 'Untitled Lesson'),
      content: content,
      language: lang
    }
  ];

  // JSON.stringify automatically handles the "last comma" rule correctly (no trailing comma)
  return JSON.stringify(jsonObject, null, 2);
};

export const downloadJSON = (jsonString: string, filename: string = 'study-guide-export.json') => {
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
