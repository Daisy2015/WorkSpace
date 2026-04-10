import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { Language } from '../types';

interface WorkspaceConstructionLoadingProps {
  workspaceName: string;
  lang: Language;
  onComplete: () => void;
}

const steps_zh = [
  "正在分析你的研究场景",
  "正在匹配标准流程模板",
  "正在获取MBU范围",
  "正在判断IO流程完整性",
  "正在进行图谱深度推理",
  "正在进行相似对象查询",
  "正在进行相邻对象查询",
  "正在进行相似成果推荐",
  "正在进行最后的验证确认"
];

const steps_en = [
  "Analyzing research scenario",
  "Matching standard process templates",
  "Retrieving MBU scope",
  "Validating I/O process integrity",
  "Performing deep graph reasoning",
  "Querying similar objects",
  "Querying adjacent objects",
  "Recommending similar outcomes",
  "Final verification and confirmation"
];

export const WorkspaceConstructionLoading: React.FC<WorkspaceConstructionLoadingProps> = ({ 
  workspaceName, 
  lang,
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = lang === 'zh' ? steps_zh : steps_en;

  useEffect(() => {
    const totalDuration = 6000; // 6 seconds
    const stepDuration = totalDuration / steps.length;

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, stepDuration);

    const timeout = setTimeout(() => {
      onComplete();
    }, totalDuration + 500);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col items-center justify-center p-8 overflow-hidden font-sans">
      <div className="max-w-5xl w-full flex flex-col items-center">
        
        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">{workspaceName}</h1>
          <p className="text-slate-500 font-medium text-lg">{lang === 'zh' ? '正在为你构建智能研究空间...' : 'Building your intelligent workspace...'}</p>
        </motion.div>
 
        {/* Visual Skeletons Grid (Restored) */}
        <div className="grid grid-cols-3 gap-8 w-full mb-12">
          {/* MBU Resource Scope Loading */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-200 flex flex-col h-64 relative overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-5 rounded-lg bg-blue-100 animate-pulse"></div>
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-100 animate-pulse"></div>
                  <div className="h-2 bg-slate-50 rounded animate-pulse" style={{ width: `${Math.random() * 40 + 40}%` }}></div>
                </div>
              ))}
            </div>
            <div className="mt-auto text-[10px] font-bold text-blue-600 uppercase tracking-widest text-center bg-blue-50 py-2 rounded-xl">
              {lang === 'zh' ? 'MBU 资源范围加载中' : 'MBU SCOPE LOADING'}
            </div>
          </div>

          {/* Outcome Area Skeleton */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-200 flex flex-col h-64 relative overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-5 rounded-lg bg-indigo-100 animate-pulse"></div>
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-14 bg-slate-50 rounded-xl border border-slate-100 animate-pulse flex flex-col p-3 gap-2">
                  <div className="h-1.5 w-full bg-slate-100 rounded"></div>
                  <div className="h-1.5 w-2/3 bg-slate-200/30 rounded"></div>
                </div>
              ))}
            </div>
            <div className="mt-auto text-[10px] font-bold text-indigo-600 uppercase tracking-widest text-center bg-indigo-50 py-2 rounded-xl">
              {lang === 'zh' ? '成果区域初始化' : 'OUTCOME INITIALIZING'}
            </div>
          </div>

          {/* Recommendation Area Skeleton */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-200 flex flex-col h-64 relative overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-5 rounded-lg bg-amber-100 animate-pulse"></div>
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse">
                  <div className="h-1.5 w-3/4 bg-slate-100 rounded mb-3"></div>
                  <div className="flex gap-2">
                    <div className="w-4 h-4 rounded-full bg-slate-200/50"></div>
                    <div className="w-4 h-4 rounded-full bg-slate-200/50"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto text-[10px] font-bold text-amber-600 uppercase tracking-widest text-center bg-amber-50 py-2 rounded-xl">
              {lang === 'zh' ? '推荐区域计算中' : 'RECOMMENDATION CALCULATING'}
            </div>
          </div>
        </div>

        {/* Steps List Container (New Design) */}
        <div className="w-full h-40 relative overflow-hidden mb-12">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="popLayout">
              {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const isPending = index > currentStep;

                if (index < currentStep - 1 || index > currentStep + 1) return null;

                return (
                  <motion.div 
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: isCurrent ? 1 : 0.3, 
                      y: 0,
                      scale: isCurrent ? 1 : 0.9
                    }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-start w-80 gap-5 py-3"
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                          <i className="fas fa-check text-[10px]"></i>
                        </div>
                      ) : (
                        <div className={`w-6 h-6 rounded-full border-2 ${isCurrent ? 'border-blue-600' : 'border-slate-300'} flex items-center justify-center transition-colors`}>
                          {isCurrent && <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>}
                        </div>
                      )}
                    </div>
                    <span className={`text-lg font-bold truncate tracking-tight ${isPending ? 'text-slate-300' : 'text-slate-800'}`}>
                      {step}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-slate-50 to-transparent z-10"></div>
          <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-slate-50 to-transparent z-10"></div>
        </div>

        {/* Estimated Time Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white shadow-xl px-8 py-4 rounded-[1.5rem] flex items-center gap-4 text-slate-900 font-bold border border-slate-100"
        >
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] shadow-lg shadow-blue-600/20">
            <i className="fas fa-clock"></i>
          </div>
          <span className="text-sm tracking-wide">{lang === 'zh' ? '预计耗时：5-10秒' : 'Estimated: 5-10s'}</span>
        </motion.div>

      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] opacity-40"></div>
      </div>
    </div>
  );
};
