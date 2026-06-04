import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SmartProReportCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: { topic: string; template: string; language: string }) => void;
  lang: 'zh' | 'en';
}

export const SmartProReportCreateModal: React.FC<SmartProReportCreateModalProps> = ({ isOpen, onClose, onGenerate, lang }) => {
  const [topic, setTopic] = useState('');
  const [template, setTemplate] = useState(lang === 'zh' ? '钻井地质设计' : 'Drilling Geological Design');
  const [language, setLanguage] = useState(lang === 'zh' ? '中文' : 'English');

  const templates = lang === 'zh' 
    ? ['钻井地质设计', '储量报告', '地面工程设计', '勘探动态分析', '油藏评估报告']
    : ['Drilling Geological Design', 'Reserve Report', 'Surface Engineering Design', 'Exploration Analysis', 'Reservoir Evaluation'];

  const handleGenerate = () => {
    if (!topic.trim()) return;
    onGenerate({ topic, template, language });
    onClose();
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
                  <i className="fas fa-file-invoice"></i>
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  {lang === 'zh' ? '专业报告编写' : 'Pro Report Assistant'}
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
                  {lang === 'zh' ? '报告主题' : 'Report Topic'}
                </label>
                <textarea 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={lang === 'zh' ? '请输入专业报告的主题，例如：X-1井区块地质稳定性分析...' : 'Enter the topic of the pro report...'}
                  className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {lang === 'zh' ? '选择报告模版' : 'Select Template'}
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto px-1 custom-scrollbar">
                  {templates.map(t => (
                    <button 
                      key={t}
                      onClick={() => setTemplate(t)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-xs font-bold ${template === t ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                    >
                      <span>{t}</span>
                      {template === t && <i className="fas fa-check-circle"></i>}
                    </button>
                  ))}
                </div>
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
                {lang === 'zh' ? '开始编写' : 'Start Writing'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
