import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  lang: 'zh' | 'en';
  onComplete?: () => void;
}

const LayerItem: React.FC<{ name: string; hasChildren?: boolean; isLast?: boolean }> = ({ name, hasChildren, isLast }) => {
    const [isVisible, setIsVisible] = useState(true);
    return (
        <div className={`flex border-slate-200 ${!isLast ? 'border-b' : ''}`}>
            <div className="flex-1 py-3 px-4 flex items-center">
                {hasChildren && <i className="fas fa-caret-right text-slate-400 mr-2 text-sm"></i>}
                <span className={`text-slate-700 text-sm ${!hasChildren ? 'ml-5' : ''}`}>{name}</span>
            </div>
            <div 
                className="w-16 flex items-center justify-center border-l border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setIsVisible(!isVisible)}
            >
                <i className={`fas ${isVisible ? 'fa-eye text-slate-600' : 'fa-eye-slash text-slate-400'}`}></i>
            </div>
        </div>
    );
};

export const ProChartGenerationAgent: React.FC<Props> = ({ lang, onComplete }) => {
  const [status, setStatus] = useState<'running' | 'completed'>('running');
  const [isLayerSidebarOpen, setIsLayerSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('completed');
      if (onComplete) onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-row h-full bg-white relative overflow-hidden">
      {/* Content Area */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-2xl bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex-shrink-0 relative">
          {status === 'running' ? (
              <div className="h-64 flex items-center justify-center text-slate-400 font-bold">
                  <i className="fas fa-circle-notch fa-spin text-4xl mr-4"></i>
                  {lang === 'zh' ? '成图分析中...' : 'Analyzing data...'}
              </div>
          ) : (
              <div className="relative">
                  <div className="absolute top-2 right-2 z-10">
                       <button 
                         onClick={() => setIsLayerSidebarOpen(!isLayerSidebarOpen)}
                         className={`px-4 py-2 bg-white border shadow-sm text-sm font-medium transition-colors flex items-center gap-2 rounded ${isLayerSidebarOpen ? 'border-blue-500 text-blue-600' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                       >
                         <i className="fas fa-layer-group text-blue-500"></i>
                         {lang === 'zh' ? '图层设置' : 'Layer Settings'}
                       </button>
                  </div>
                  <img src="/src/assets/images/regenerated_image_1780629841532.png" alt="Chart" className="w-full h-auto rounded" />
              </div>
          )}
        </div>
      </div>

      {/* Layer Management Sidebar */}
      <AnimatePresence>
        {isLayerSidebarOpen && (
             <motion.div 
                 initial={{ width: 0, opacity: 0 }}
                 animate={{ width: 400, opacity: 1 }}
                 exit={{ width: 0, opacity: 0 }}
                 transition={{ duration: 0.3 }}
                 className="h-full border-l border-slate-200 bg-white flex flex-col shadow-[-4px_0_12px_rgba(0,0,0,0.03)] flex-shrink-0"
             >
                    <div className="flex justify-between items-center p-4 border-b border-slate-100 min-w-[400px]">
                        <span className="font-bold text-slate-800 text-lg">{lang === 'zh' ? '图层管理' : 'Layer Management'}</span>
                        <button 
                            onClick={() => setIsLayerSidebarOpen(false)}
                            className="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
                        >
                            <span className="text-xl leading-none">&times;</span>
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto min-w-[400px]">
                        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
                            <LayerItem name={lang === 'zh' ? '地层' : 'Stratum'} />
                            <LayerItem name={lang === 'zh' ? '曲线道' : 'Curve Track'} hasChildren />
                            <LayerItem name={lang === 'zh' ? '深度' : 'Depth'} />
                            <LayerItem name={lang === 'zh' ? '岩性剖面' : 'Lithological Profile'} />
                            <LayerItem name={lang === 'zh' ? '曲线道' : 'Curve Track'} hasChildren />
                            <LayerItem name={lang === 'zh' ? '层序旋回' : 'Sequence Cycle'} />
                            <LayerItem name={lang === 'zh' ? '沉积相' : 'Sedimentary Facies'} isLast />
                        </div>
                    </div>
             </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
