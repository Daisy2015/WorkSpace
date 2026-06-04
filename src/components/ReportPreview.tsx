import React from 'react';
import { motion } from 'motion/react';

interface ReportPreviewProps {
  title: string;
  lang: 'zh' | 'en';
  onClose: () => void;
  onDownload: () => void;
  references?: string[];
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ title, lang, onClose, onDownload, references = [] }) => {
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
            <span className="text-[10px] text-slate-400 font-medium">{lang === 'zh' ? '预览报告' : 'Preview Report'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onDownload}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
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
            <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full"></div>
            <div className="mt-3 flex flex-col items-center gap-1 text-[10px] text-slate-400 font-medium">
              <span>{lang === 'zh' ? '报告编号: RP-20240604' : 'ID: RP-20240604'}</span>
              <span>{lang === 'zh' ? '生成日期: 2024-06-04' : 'Date: 2024-06-04'}</span>
            </div>
          </header>

          <div className="space-y-6 text-slate-700 leading-relaxed text-xs">
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-800 border-l-4 border-blue-600 pl-2">
                {lang === 'zh' ? '1. 引言' : '1. Introduction'}
              </h2>
              <p className="text-slate-600">
                {lang === 'zh' 
                  ? '本报告基于对当前区块地质特征、历史钻井数据以及实时采集参数的深度分析，旨在为下一步开发决策提供科学依据。'
                  : 'This report is based on in-depth analysis of current block geological features and historical data.'}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-800 border-l-4 border-blue-600 pl-2">
                {lang === 'zh' ? '2. 地质特征评估' : '2. Geological Evaluation'}
              </h2>
              <p className="text-slate-600">
                {lang === 'zh'
                  ? '根据最新地震资料解释成果，目标井区储层发育稳定，物性特征良好。砂体连续性达到85%以上。'
                  : 'The reservoir development in the target well area is stable with good physical characteristics.'}
              </p>
              <div className="h-32 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center gap-2">
                <i className="fas fa-chart-area text-xl text-slate-300"></i>
                <span className="text-[9px] text-slate-400 font-medium">{lang === 'zh' ? '[ 地质剖面图 ]' : '[ Section View ]'}</span>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-800 border-l-4 border-blue-600 pl-2">
                {lang === 'zh' ? '3. 结论与建议' : '3. Conclusion'}
              </h2>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>{lang === 'zh' ? '建议在主体区域加密井网。' : 'Suggest infilling wells in the main area.'}</li>
                <li>{lang === 'zh' ? '需进一步获取更精准的物性参数。' : 'Further precise parameters are needed.'}</li>
              </ul>
            </section>

            {references.length > 0 && (
              <section className="space-y-2 pt-4 border-t border-slate-50">
                <h2 className="text-sm font-bold text-slate-800 border-l-4 border-blue-600 pl-2">
                  {lang === 'zh' ? '4. 引用来源' : '4. References'}
                </h2>
                <div className="bg-slate-50/50 rounded-lg p-3 space-y-1.5">
                  {references.map((ref, idx) => (
                    <div key={idx} className="flex gap-2 text-[10px] text-slate-500">
                      <span className="font-bold text-slate-400">[{idx + 1}]</span>
                      <span className="hover:text-blue-600 cursor-default">{ref}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-800">{lang === 'zh' ? '通用智能助手' : 'General Smart Assistant'}</p>
              <p className="text-[8px] text-slate-400 mt-0.5">System generated report v2.4</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
               <div className="w-16 h-16 bg-slate-50 rounded flex items-center justify-center border border-slate-100">
                  <i className="fas fa-qrcode text-slate-200 text-xl"></i>
               </div>
               <span className="text-[8px] text-slate-400">Scan to read</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
