
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';

interface DocumentEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  lang: Language;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ initialContent, onSave, onCancel, lang }) => {
  const [content, setContent] = useState(initialContent);
  const t = translations[lang];

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col animate-[fadeIn_0.2s_ease-out]">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shadow-sm flex-shrink-0">
        <div className="flex items-center">
           <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mr-3">
             <i className="fas fa-file-alt text-xl"></i>
           </div>
           <div>
             <h1 className="text-lg font-bold text-gray-800">{t.documentEditor || "文档编辑器"}</h1>
             <p className="text-xs text-gray-500">Markdown / Rich Text Mode</p>
           </div>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={onCancel}
             className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-bold transition-colors"
           >
             {t.cancel}
           </button>
           <button 
             onClick={() => onSave(content)}
             className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-bold shadow-sm transition-colors"
           >
             <i className="fas fa-save mr-2"></i>
             {t.save || "保存"}
           </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-gray-50 p-8 overflow-hidden flex justify-center">
         <div className="bg-white shadow-lg border border-gray-200 w-full max-w-4xl h-full rounded-xl flex flex-col">
             {/* Toolbar (Mock) */}
             <div className="h-10 border-b border-gray-100 flex items-center px-4 gap-2 bg-gray-50/50 rounded-t-xl">
                 {['bold', 'italic', 'underline', 'strikethrough'].map(i => (
                     <button key={i} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded">
                         <i className={`fas fa-${i}`}></i>
                     </button>
                 ))}
                 <div className="w-px h-4 bg-gray-300 mx-2"></div>
                 {['list-ul', 'list-ol', 'quote-right'].map(i => (
                     <button key={i} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded">
                         <i className={`fas fa-${i}`}></i>
                     </button>
                 ))}
             </div>
             
             {/* Text Area */}
             <textarea
               className="flex-1 w-full p-8 resize-none focus:outline-none text-gray-800 leading-relaxed font-serif text-lg custom-scrollbar"
               value={content}
               onChange={e => setContent(e.target.value)}
               placeholder="Start typing..."
             ></textarea>
         </div>
      </div>
    </div>
  );
};
