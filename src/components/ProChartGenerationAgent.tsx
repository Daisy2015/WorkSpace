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
        <div className="w-full max-w-2xl flex flex-col gap-4 flex-shrink-0">
          {status === 'running' ? (
              <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center justify-center h-64 text-slate-400 font-bold">
                  <i className="fas fa-circle-notch fa-spin text-4xl mr-4"></i>
                  {lang === 'zh' ? '成图分析中...' : 'Analyzing data...'}
              </div>
          ) : (
              <>
                  {/* Top Toolbar */}
                  <div className="w-full flex justify-end">
                       <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                           <button 
                             onClick={() => setIsLayerSidebarOpen(!isLayerSidebarOpen)}
                             title={lang === 'zh' ? '图层设置' : 'Layers'}
                             className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${isLayerSidebarOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                           >
                             <i className="fas fa-layer-group text-sm"></i>
                           </button>
                           <button 
                             title={lang === 'zh' ? '全屏' : 'Full Screen'}
                             className="w-8 h-8 flex items-center justify-center text-slate-500 rounded hover:bg-slate-50 hover:text-slate-700 transition-colors"
                           >
                             <i className="fas fa-expand text-sm"></i>
                           </button>
                           <button 
                             title={lang === 'zh' ? '下载' : 'Download'}
                             className="w-8 h-8 flex items-center justify-center text-slate-500 rounded hover:bg-slate-50 hover:text-slate-700 transition-colors"
                           >
                             <i className="fas fa-download text-sm"></i>
                           </button>
                       </div>
                  </div>
                  
                  {/* Chart Container */}
                  <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 relative">
                      <div className="relative border border-slate-200 rounded overflow-hidden">
                          <img src="/src/assets/images/regenerated_image_1780629841532.png" alt="Chart" className="w-full h-auto bg-slate-50" />
                      </div>

                      {/* Bottom Version Management */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                         <span className="text-sm text-slate-500 font-medium">{lang === 'zh' ? '历史版本' : 'History Versions'}</span>
                         <div className="flex items-center gap-2">
                             <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 shadow-sm">
                                 V2 ({lang === 'zh' ? '当前' : 'Current'})
                             </button>
                             <button className="px-4 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors">
                                 V1
                             </button>
                         </div>
                      </div>
                  </div>
              </>
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
