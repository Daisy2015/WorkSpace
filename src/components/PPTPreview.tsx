import React from 'react';
import { motion } from 'motion/react';

interface PPTPreviewProps {
  title: string;
  lang: 'zh' | 'en';
  onClose: () => void;
  onDownload: () => void;
  references?: string[];
}

export const PPTPreview: React.FC<PPTPreviewProps> = ({ title, lang, onClose, onDownload, references = [] }) => {
  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-20 bg-white flex flex-col shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="flex flex-col">
            <h2 className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{title}</h2>
            <span className="text-[10px] text-slate-400 font-medium">{lang === 'zh' ? '预览PPT' : 'Preview PPT'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onDownload}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all"
            title={lang === 'zh' ? '下载' : 'Download'}
          >
            <i className="fas fa-download"></i>
          </button>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-4 custom-scrollbar">
        <div className="space-y-4 max-w-xl mx-auto">
          {/* Slide 1 - Title */}
          <div className="aspect-[16/9] bg-white rounded-lg shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-12 -mt-12" />
            <div className="w-12 h-1 bg-orange-500 mb-6" />
            <h1 className="text-xl font-bold text-slate-900 mb-4">{title}</h1>
            <p className="text-[10px] text-slate-400 font-medium">
              {lang === 'zh' ? '主讲人: 智能助手' : 'Presenter: Smart Assistant'} | 2024-06-04
            </p>
          </div>

          {/* Slide 2 - Outline */}
          <div className="aspect-[16/9] bg-white rounded-lg shadow-sm border border-slate-200 p-8 flex flex-col relative">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-4 bg-orange-500 rounded-full" />
                <h2 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '报告大纲' : 'Outline'}</h2>
             </div>
             <div className="flex-1 grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="flex gap-3">
                    <span className="text-orange-500 font-mono text-[10px]">0{idx}</span>
                    <div className="space-y-1">
                      <div className="h-2 w-24 bg-slate-100 rounded" />
                      <div className="h-1.5 w-16 bg-slate-50 rounded" />
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Slide 3 - Data Viz */}
          <div className="aspect-[16/9] bg-white rounded-lg shadow-sm border border-slate-200 p-8 flex flex-col relative">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-orange-500 rounded-full" />
                <h2 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '核心数据分析' : 'Data Analysis'}</h2>
             </div>
             <div className="flex-1 flex gap-4">
                <div className="flex-1 bg-slate-50 rounded flex items-center justify-center">
                  <i className="fas fa-chart-bar text-slate-200 text-4xl"></i>
                </div>
                <div className="w-1/3 space-y-3">
                   <div className="h-2 w-full bg-slate-100 rounded" />
                   <div className="h-2 w-full bg-slate-100 rounded" />
                   <div className="h-2 w-3/4 bg-slate-100 rounded" />
                </div>
             </div>
          </div>

          {/* Slide 4 - Conclusion */}
          <div className="aspect-[16/9] bg-white rounded-lg shadow-sm border border-slate-200 p-8 flex flex-col relative">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-4 bg-orange-500 rounded-full" />
                <h2 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '结论与行动' : 'Conclusion & Action'}</h2>
             </div>
             <ul className="space-y-4">
                {[1, 2, 3].map(i => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                    <div className="h-2 w-full bg-slate-50 rounded" />
                  </li>
                ))}
             </ul>
          </div>

          {/* References Slide */}
          {references.length > 0 && (
            <div className="aspect-[16/9] bg-white rounded-lg shadow-sm border border-slate-200 p-8 flex flex-col relative">
               <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-4 bg-orange-500 rounded-full" />
                  <h2 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '引用来源' : 'References'}</h2>
               </div>
               <div className="space-y-2">
                 {references.slice(0, 4).map((ref, idx) => (
                   <div key={idx} className="flex gap-2 text-[9px] text-slate-500 items-center">
                     <span className="font-bold text-orange-400">[{idx + 1}]</span>
                     <span className="truncate">{ref}</span>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 mb-4 text-center">
          <p className="text-[10px] text-slate-400">{lang === 'zh' ? 'PPT 共 5 页' : 'Total 5 Slides'}</p>
        </div>
      </div>
    </motion.div>
  );
};
