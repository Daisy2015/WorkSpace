import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface Props {
  lang: 'zh' | 'en';
  onComplete?: () => void;
}

export const ProChartGenerationAgent: React.FC<Props> = ({ lang, onComplete }) => {
  const [status, setStatus] = useState<'running' | 'completed'>('running');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('completed');
      if (onComplete) onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Content Area */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-50">
        <div className="w-full max-w-2xl bg-white p-4 rounded-xl shadow-lg border border-slate-100">
          {status === 'running' ? (
              <div className="h-64 flex items-center justify-center text-slate-400 font-bold">
                  <i className="fas fa-circle-notch fa-spin text-4xl mr-4"></i>
                  {lang === 'zh' ? '成图分析中...' : 'Analyzing data...'}
              </div>
          ) : (
              <img src="/src/assets/images/regenerated_image_1780629841532.png" alt="Chart" className="w-full h-auto" />
          )}
        </div>
      </div>
    </div>
  );
};
