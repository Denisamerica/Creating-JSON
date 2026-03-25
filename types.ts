
export interface StudyMetadata {
  week_number: string;
  week_title: string;
  day_number: string;
  day_name: string;
  language: string;
}

export interface CSVRow extends StudyMetadata {
  lesson_title: string;
  
  // Initial Text Blocks
  text_1: string;
  text_2: string;
  text_3: string;
  
  // Interaction 1
  question_1: string;
  input_1: string;
  
  // Text after Q1
  text_4: string;
  
  // Interaction 2
  question_2: string;
  input_2: string;
  
  // Text after Q2
  text_5: string;

  // Interaction 3
  question_3: string;
  input_3: string;

  // Text after Q3
  text_6: string;

  // Interaction 4
  question_4: string;
  input_4: string;

  // Final Text Blocks
  text_7: string;
  text_8: string;
}

export interface ExtractedData {
  rows: CSVRow[];
}

export interface NoteEntry {
  id: string;
  timestamp: string;
  content: string;
  source: 'manual' | 'reset' | 'export'; // Para saber se foi salvo por reset ou exportação
  relatedFile?: string; // Nome do arquivo associado se houver
}
