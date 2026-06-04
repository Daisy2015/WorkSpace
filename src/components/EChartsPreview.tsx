import React from 'react';
import { motion } from 'motion/react';
import ReactECharts from 'echarts-for-react';

interface EChartsPreviewProps {
  title: string;
  lang: 'zh' | 'en';
  onClose: () => void;
  onDownload: () => void;
  references?: string[];
}

export const EChartsPreview: React.FC<EChartsPreviewProps> = ({ title, lang, onClose, onDownload, references = [] }) => {
  const getOption = () => {
    return {
      title: {
        text: lang === 'zh' ? '产量趋势分析' : 'Production Trend',
        left: 'center',
        textStyle: {
          fontSize: 14,
          color: '#334155'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: lang === 'zh' ? ['日产气量', '日产水量'] : ['Daily Gas', 'Daily Water'],
        top: '10%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: lang === 'zh' ? '日产气量' : 'Daily Gas',
          type: 'line',
          smooth: true,
          data: [120, 132, 101, 134, 90, 230, 210],
          itemStyle: { color: '#ec4899' }
        },
        {
          name: lang === 'zh' ? '日产水量' : 'Daily Water',
          type: 'line',
          smooth: true,
          data: [220, 182, 191, 234, 290, 330, 310],
          itemStyle: { color: '#0ea5e9' }
        }
      ]
    };
  };

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
            <span className="text-[10px] text-slate-400 font-medium">{lang === 'zh' ? '预览成图' : 'Preview Plot'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onDownload}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-all"
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
      <div className="flex-1 overflow-y-auto bg-white p-6 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <ReactECharts option={getOption()} style={{ height: '400px' }} />
          </div>

          <div className="space-y-4">
             <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-info-circle text-pink-500"></i>
                {lang === 'zh' ? '图表说明' : 'Chart Description'}
             </h3>
             <p className="text-xs text-slate-600 leading-relaxed">
                {lang === 'zh' 
                  ? '该图表展示了近一周内的日产气量与日产水量的波动情况。通过对关键时间点的异常值检测，发现周六的产量增幅与新井投产呈正相关。' 
                  : 'This chart shows the fluctuations of daily gas and water production over the past week.'}
             </p>
          </div>

          {references.length > 0 && (
            <div className="pt-6 border-t border-slate-100">
               <h3 className="text-sm font-bold text-slate-800 mb-4">{lang === 'zh' ? '数据源引用' : 'Data Sources'}</h3>
               <div className="grid grid-cols-1 gap-2">
                 {references.slice(0, 3).map((ref, idx) => (
                   <div key={idx} className="flex gap-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg items-center">
                     <span className="font-bold text-pink-400">[{idx + 1}]</span>
                     <span className="truncate">{ref}</span>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
