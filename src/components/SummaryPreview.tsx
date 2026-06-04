import React from 'react';
import { motion } from 'motion/react';

interface SummaryPreviewProps {
  title: string;
  lang: 'zh' | 'en';
  onClose: () => void;
  onDownload: () => void;
  references?: string[];
}

export const SummaryPreview: React.FC<SummaryPreviewProps> = ({ title, lang, onClose, onDownload, references = [] }) => {
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
            <span className="text-[10px] text-slate-400 font-medium">{lang === 'zh' ? '预览摘要' : 'Preview Summary'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onDownload}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all"
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
      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
        <div className="w-full bg-white p-5 min-h-full">
          <header className="mb-6 text-center">
            <h1 className="text-lg font-bold text-slate-900 mb-2">{title}</h1>
            <div className="w-12 h-1 bg-green-500 mx-auto rounded-full"></div>
            <div className="mt-3 flex flex-col items-center gap-1 text-[10px] text-slate-400 font-medium">
              <span>{lang === 'zh' ? '摘要日期: 2024-06-04' : 'Date: 2024-06-04'}</span>
            </div>
          </header>

          <div className="space-y-6 text-slate-700 leading-relaxed text-xs">
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-800 border-l-4 border-green-500 pl-2">
                {lang === 'zh' ? '核心观点' : 'Key Findings'}
              </h2>
              <p className="text-slate-600">
                {lang === 'zh' 
                  ? '本摘要提取了当前工作空间资源库中的核心信息。主要分析表明，目标区块展示了极高的增产潜力，但同时也面临复杂的地应力环境。'
                  : 'This summary extracts key information from the current workspace repository.'}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-800 border-l-4 border-green-500 pl-2">
                {lang === 'zh' ? '数据洞察' : 'Data Insights'}
              </h2>
              <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                 <div className="flex justify-between items-center">
                    <span className="text-slate-500">{lang === 'zh' ? '数据覆盖度' : 'Data Coverage'}</span>
                    <span className="font-bold text-green-600">92%</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-500">{lang === 'zh' ? '异常检测' : 'Anomaly Detection'}</span>
                    <span className="font-bold text-amber-500">4 Low Priority</span>
                 </div>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-800 border-l-4 border-green-500 pl-2">
                {lang === 'zh' ? '行动建议' : 'Actionable Items'}
              </h2>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>{lang === 'zh' ? '审核第 [1] 号引用的地质数据一致性。' : 'Review consistency of geological data in ref [1].'}</li>
                <li>{lang === 'zh' ? '建议启动第二阶段的风险评估流程。' : 'Initiate second phase risk assessment.'}</li>
              </ul>
            </section>

            {references.length > 0 && (
              <section className="space-y-2 pt-4 border-t border-slate-50">
                <h2 className="text-sm font-bold text-slate-800 border-l-4 border-green-500 pl-2">
                  {lang === 'zh' ? '参考资源' : 'References'}
                </h2>
                <div className="bg-slate-50/50 rounded-lg p-3 space-y-1.5">
                  {references.slice(0, 3).map((ref, idx) => (
                    <div key={idx} className="flex gap-2 text-[10px] text-slate-500">
                      <span className="font-bold text-green-400">[{idx + 1}]</span>
                      <span className="truncate">{ref}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-800">{lang === 'zh' ? '智能摘要专家' : 'Smart Summary Expert'}</p>
              <p className="text-[8px] text-slate-400 mt-0.5">Automated extraction v1.2</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
