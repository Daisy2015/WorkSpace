import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SmartReportCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: { topic: string; outline: boolean; language: string }) => void;
  lang: 'zh' | 'en';
}

export const SmartReportCreateModal: React.FC<SmartReportCreateModalProps> = ({ isOpen, onClose, onGenerate, lang }) => {
  const [topic, setTopic] = useState('');
  const [outline, setOutline] = useState(true);
  const [language, setLanguage] = useState(lang === 'zh' ? '中文' : 'English');

  const handleGenerate = () => {
    if (!topic.trim()) return;
    onGenerate({ topic, outline, language });
    onClose();
    // Reset state for next use
    setTopic('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <i className="fas fa-file-alt"></i>
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  {lang === 'zh' ? '智能报告编写' : 'Smart Report Assistant'}
                </h2>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {lang === 'zh' ? '报告主题及要求' : 'Topic & Requirements'}
                </label>
                <textarea 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={lang === 'zh' ? '请输入报告的主题，以及具体的写作要求、核心关注点等...' : 'Enter the topic and specific writing requirements...'}
                  className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${outline ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
                    <i className="fas fa-list-ul text-xs"></i>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{lang === 'zh' ? '先生成大纲' : 'Generate Outline First'}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{lang === 'zh' ? '在开始正式编写前，先确认报告大纲结构' : 'Confirm the outline before starting the full report'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setOutline(!outline)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${outline ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${outline ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {lang === 'zh' ? '生成语言' : 'Output Language'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['中文', 'English'].map(l => (
                    <button 
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all text-xs font-bold ${language === l ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                    >
                      <i className={`fas ${l === '中文' ? 'fa-language' : 'fa-globe-americas'}`}></i>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-5 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button 
                disabled={!topic.trim()}
                onClick={handleGenerate}
                className="px-8 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
              >
                <i className="fas fa-magic text-xs"></i>
                {lang === 'zh' ? '开始生成' : 'Generate'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
