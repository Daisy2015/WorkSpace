import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

interface EvidenceChainPanelProps {
  lang: Language;
}

type TabType = 'evidence' | 'dataSource' | 'toolCall' | 'runLog' | 'userConfirm' | 'auditRecord' | 'outputFiles';

export const EvidenceChainPanel = React.forwardRef<any, EvidenceChainPanelProps>(({ lang }, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dataSource');

  React.useImperativeHandle(ref, () => ({
    toggle: (expand: boolean) => setIsExpanded(expand)
  }));
  
  const togglePanel = (expand: boolean) => {
    setIsExpanded(expand);
  };

  const tabs: { id: TabType; name: string; enName: string; icon: string }[] = [
    { id: 'dataSource', name: '数据来源', enName: 'Data Source', icon: 'fa-database' },
    { id: 'outputFiles', name: '输出文件', enName: 'Output Files', icon: 'fa-file-export' },
    { id: 'runLog', name: '运行日志', enName: 'Run Log', icon: 'fa-terminal' },
  ];

  const renderDataSource = () => (
    <div className="p-4 overflow-hidden">
        <h4 className="text-xs font-bold text-slate-800 mb-3">引用数据源 (Reference Data Sources)</h4>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-2 px-3 text-slate-400 font-bold uppercase tracking-wider">数据源名称</th>
              <th className="py-2 px-3 text-slate-400 font-bold uppercase tracking-wider">所属MBU</th>
            </tr>
          </thead>
          <tbody className="text-slate-600">
            <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="py-2.5 px-3 font-medium">J-102_Production_Data.csv</td>
              <td className="py-2.5 px-3">MBU-Data-Central</td>
            </tr>
          </tbody>
        </table>
    </div>
  );

  const renderOutputFiles = () => (
    <div className="p-4 overflow-hidden">
        <h4 className="text-xs font-bold text-slate-800 mb-3">输出文件 (Output Files)</h4>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-2 px-3 text-slate-400 font-bold uppercase tracking-wider">文件名称</th>
              <th className="py-2 px-3 text-slate-400 font-bold uppercase tracking-wider">所属MBU</th>
            </tr>
          </thead>
          <tbody className="text-slate-600">
            <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="py-2.5 px-3 font-medium">J-102_Analysis_Result.csv</td>
              <td className="py-2.5 px-3">MBU-Production-01</td>
            </tr>
          </tbody>
        </table>
    </div>
  );

  const renderRunLog = () => (
    <div className="p-4 bg-slate-900 h-full font-mono text-[10px] text-slate-300 overflow-y-auto space-y-1">
      <p className="text-slate-500">[{new Date().toISOString()}] <span className="text-indigo-400">INFO</span> Initiating trace for Workspace J-102 analysis...</p>
      <p className="text-slate-500">[{new Date().toISOString()}] <span className="text-indigo-400">INFO</span> Fetching 3 related data sources from local storage...</p>
      <p className="text-slate-500">[{new Date().toISOString()}] <span className="text-emerald-400">SUCCESS</span> Data fetch completed. Starting semantic parsing...</p>
      <p className="text-slate-500">[{new Date().toISOString()}] <span className="text-indigo-400">INFO</span> Calling tool: Pump_Efficiency_Calculator with params {'{well_id: "J-102"}'}...</p>
      <p className="text-slate-500">[{new Date().toISOString()}] <span className="text-amber-400">WARN</span> Well J-102 shows fluid level anomaly. Re-validating pressure data...</p>
      <div className="w-1 h-3 bg-indigo-500 animate-pulse inline-block"></div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dataSource': return renderDataSource();
      case 'outputFiles': return renderOutputFiles();
      case 'runLog': return renderRunLog();
      default: return null;
    }
  };

  return (
    <div className="w-full flex-shrink-0 bg-white border-t border-slate-200 flex flex-col shadow-[0_-12px_40px_rgba(0,0,0,0.1)] relative z-[100]">
      <div 
        className="h-12 flex items-center justify-between px-6 cursor-pointer bg-slate-900 text-white hover:bg-slate-800 transition-colors border-b border-white/10 w-full"
        onClick={() => togglePanel(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-tight shadow-sm">
            <i className="fas fa-shield-alt"></i>
            <span>{lang === 'zh' ? '可信AI' : 'TRUSTABLE AI'}</span>
          </div>
          <h3 className="text-sm font-bold">
            {lang === 'zh' ? '证据链与运行状态' : 'Evidence Chain & Run Status'}
          </h3>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 320 }}
            exit={{ height: 0 }}
            className="overflow-hidden flex flex-col"
          >
            <div className="flex border-b border-slate-200 bg-slate-100 px-4">
               {tabs.map(tab => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 h-10 text-xs font-bold transition-all relative flex items-center gap-2 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   <i className={`fas ${tab.icon} text-sm`}></i>
                   {lang === 'zh' ? tab.name : tab.enName}
                   {activeTab === tab.id && (
                     <motion.div 
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                     />
                   )}
                 </button>
               ))}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
               {renderContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
