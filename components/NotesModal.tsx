
import React, { useState } from 'react';
import { UILanguage, translations } from '../utils/translations';
import { NoteEntry } from '../types';
import { 
  XMarkIcon, 
  PencilIcon, 
  TrashIcon, 
  ClockIcon, 
  DocumentTextIcon, 
  ArrowDownTrayIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNote: string;
  onNoteChange: (text: string) => void;
  noteHistory: NoteEntry[];
  onUpdateHistoryNote: (id: string, text: string) => void;
  onDeleteHistoryNote: (id: string) => void;
  onClearHistory: () => void;
  uiLanguage: UILanguage;
}

export const NotesModal: React.FC<NotesModalProps> = ({
  isOpen, onClose, currentNote, onNoteChange, noteHistory, 
  onUpdateHistoryNote, onDeleteHistoryNote, onClearHistory, uiLanguage
}) => {
  const t = translations[uiLanguage];
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString(uiLanguage === 'pt' ? 'pt-BR' : uiLanguage === 'es' ? 'es-ES' : 'en-US');
  };

  const startEditing = (note: NoteEntry) => {
    setEditingId(note.id);
    setEditText(note.content);
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdateHistoryNote(editingId, editText);
      setEditingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="w-6 h-6" />
            <h2 className="font-bold text-lg">{t.notes.title}</h2>
          </div>
          <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded-lg transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest ${
              activeTab === 'current' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.notes.currentTab}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest ${
              activeTab === 'history' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.notes.historyTab} ({noteHistory.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          
          {activeTab === 'current' && (
            <div className="h-full flex flex-col p-4">
              <textarea
                value={currentNote}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder={t.notes.placeholder}
                className="flex-1 w-full border border-gray-200 rounded-xl p-4 text-gray-700 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 resize-none custom-scrollbar"
              />
              <p className="text-xs text-gray-400 mt-2 italic text-center">
                Autosave: Reset / Export
              </p>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="h-full flex flex-col">
              {noteHistory.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <ArchiveBoxIcon className="w-12 h-12 opacity-20" />
                  <p className="text-sm font-medium">{t.notes.emptyHistory}</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-100">
                        <tr>
                          <th className="p-3 font-bold text-gray-500 text-xs uppercase w-32">{t.notes.date}</th>
                          <th className="p-3 font-bold text-gray-500 text-xs uppercase">{t.notes.content}</th>
                          <th className="p-3 font-bold text-gray-500 text-xs uppercase w-20 text-right">{t.notes.actions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {noteHistory.map((note) => (
                          <tr key={note.id} className="hover:bg-gray-50 group">
                            <td className="p-3 align-top">
                              <div className="flex flex-col gap-1">
                                <span className="text-gray-600 font-medium text-xs">{formatDate(note.timestamp).split(',')[0]}</span>
                                <span className="text-gray-400 text-[10px]">{formatDate(note.timestamp).split(',')[1]}</span>
                                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded w-fit ${
                                    note.source === 'export' ? 'bg-green-100 text-green-700' : 
                                    note.source === 'reset' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {note.source}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 align-top">
                              {editingId === note.id ? (
                                <div className="flex flex-col gap-2">
                                  <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full border border-indigo-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-indigo-500"
                                    rows={3}
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1">Cancel</button>
                                    <button onClick={saveEdit} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">{t.notes.save}</button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                    <div className="whitespace-pre-wrap text-gray-700">{note.content}</div>
                                    {note.relatedFile && (
                                        <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                                            <ArrowDownTrayIcon className="w-3 h-3" /> {note.relatedFile}
                                        </div>
                                    )}
                                </div>
                              )}
                            </td>
                            <td className="p-3 align-top text-right">
                              {editingId !== note.id && (
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEditing(note)} className="p-1.5 hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 rounded">
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => onDeleteHistoryNote(note.id)} className="p-1.5 hover:bg-red-50 text-red-300 hover:text-red-500 rounded">
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <span className="text-xs text-gray-400">{noteHistory.length} archived items</span>
                    <button 
                      onClick={onClearHistory}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                      {t.notes.deleteAll}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
