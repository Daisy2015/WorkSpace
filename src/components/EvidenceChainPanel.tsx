
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

interface EvidenceChainPanelProps {
  lang: Language;
}

type TabType = 'evidence' | 'dataSource' | 'toolCall' | 'runLog' | 'userConfirm' | 'auditRecord';

export const EvidenceChainPanel: React.FC<EvidenceChainPanelProps> = ({ lang }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('evidence');

  const tabs: { id: TabType; name: string; enName: string; icon: string }[] = [
    { id: 'evidence', name: '证据链', enName: 'Evidence Chain', icon: 'fa-link' },
    { id: 'dataSource', name: '数据来源', enName: 'Data Source', icon: 'fa-database' },
    { id: 'toolCall', name: '工具调用', enName: 'Tool Call', icon: 'fa-tools' },
    { id: 'runLog', name: '运行日志', enName: 'Run Log', icon: 'fa-terminal' },
    { id: 'userConfirm', name: '用户确认', enName: 'User Confirmation', icon: 'fa-user-check' },
    { id: 'auditRecord', name: '审核记录', enName: 'Audit Record', icon: 'fa-clipboard-check' },
  ];

  const renderEvidenceChain = () => (
    <div className="flex flex-col gap-6 p-4">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-3">
          <i className="fas fa-lightbulb"></i>
          结论：J-102井产量下降主导原因为井筒工况异常
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fas fa-file-invoice text-blue-400"></i>
              数据证据
            </h5>
            <ul className="text-xs text-slate-600 space-y-1.5 bg-white/50 p-2 rounded-lg border border-white">
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></span>
                泵效由72%下降至38%
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></span>
                产液量同步下降
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></span>
                动液面异常变化
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fas fa-chart-line text-emerald-400"></i>
              图表证据
            </h5>
            <ul className="text-xs text-slate-600 space-y-1.5 bg-white/50 p-2 rounded-lg border border-white">
              <li className="flex items-center gap-2 text-emerald-600 font-medium cursor-pointer hover:underline">
                <i className="far fa-chart-bar"></i>
                泵效变化曲线
              </li>
              <li className="flex items-center gap-2 text-emerald-600 font-medium cursor-pointer hover:underline">
                <i className="fas fa-wave-square"></i>
                生产动态曲线
              </li>
              <li className="flex items-center gap-2 text-emerald-600 font-medium cursor-pointer hover:underline">
                <i className="fas fa-history"></i>
                工况参数时间线
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fas fa-gavel text-purple-400"></i>
              规则证据
            </h5>
            <div className="text-xs text-slate-600 p-2 rounded-lg border border-purple-100 bg-purple-50/30">
              触发<span className="text-purple-700 font-bold mx-1">“泵效下降超过30%且产液同步下降”</span>规则
            </div>
          </div>
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fas fa-file-alt text-amber-400"></i>
              文档证据
            </h5>
            <div className="text-xs text-slate-600 p-2 rounded-lg border border-amber-100 bg-amber-50/30">
              <span className="font-medium">2026年3月检泵记录</span> 显示泵况异常
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-blue-100/50 flex items-center gap-4">
           <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">置信度：</span>
              <div className="flex items-center gap-1">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                 <span className="text-xs font-bold text-emerald-600">高</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderDataSource = () => (
    <div className="p-4 overflow-hidden">
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="py-2 px-3 text-slate-400 font-bold uppercase tracking-wider">名称</th>
            <th className="py-2 px-3 text-slate-400 font-bold uppercase tracking-wider">类型</th>
            <th className="py-2 px-3 text-slate-400 font-bold uppercase tracking-wider">来源</th>
            <th className="py-2 px-3 text-slate-400 font-bold uppercase tracking-wider">状态</th>
          </tr>
        </thead>
        <tbody className="text-slate-600">
          <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
            <td className="py-2.5 px-3 font-medium">J-102_2026_Production_Data.csv</td>
            <td className="py-2.5 px-3">结构化数据</td>
            <td className="py-2.5 px-3 text-slate-400">生产管理系统</td>
            <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold">已挂载</span></td>
          </tr>
          <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
            <td className="py-2.5 px-3 font-medium">检泵记录回放_202603.pdf</td>
            <td className="py-2.5 px-3">非结构化文档</td>
            <td className="py-2.5 px-3 text-slate-400">本地工作空间</td>
            <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold">已挂载</span></td>
          </tr>
          <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
            <td className="py-2.5 px-3 font-medium">区块工况预警规则库 v2.1</td>
            <td className="py-2.5 px-3">规则知识</td>
            <td className="py-2.5 px-3 text-slate-400">全局知识库</td>
            <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold">已挂载</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderToolCall = () => (
    <div className="p-4 space-y-3">
      {[1, 2].map(i => (
        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                <i className={`fas ${i === 1 ? 'fa-calculator' : 'fa-chart-area'} text-sm`}></i>
             </div>
             <div>
                <p className="text-xs font-bold text-slate-700">{i === 1 ? 'Pump_Efficiency_Calculator' : 'Production_Trend_Analyzer'}</p>
                <p className="text-[10px] text-slate-400">v1.0.2 • Python Runtime</p>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">耗时</p>
                <p className="text-xs font-mono text-slate-600">{i === 1 ? '420ms' : '1,250ms'}</p>
             </div>
             <div className="w-px h-6 bg-slate-200"></div>
             <button className="text-indigo-600 text-xs font-bold hover:underline">查看I/O记录</button>
          </div>
        </div>
      ))}
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

  const renderUserConfirm = () => (
    <div className="p-4 h-full flex flex-col items-center justify-center text-slate-400 italic text-xs">
      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 text-slate-200">
        <i className="fas fa-user-edit text-xl"></i>
      </div>
      暂无手动确认或干预记录
    </div>
  );

  const renderAuditRecord = () => (
    <div className="p-4">
      <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-4 ring-indigo-50">
          王
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h5 className="text-sm font-bold text-slate-800">王总 (高级专家)</h5>
            <span className="text-[10px] text-slate-400">2026-03-15 14:30</span>
          </div>
          <div className="px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100 flex items-center gap-2 mb-2 w-fit">
            <i className="fas fa-check-circle"></i>
            审核通过：分析逻辑准确，符合地质规律
          </div>
          <p className="text-xs text-slate-500 leading-relaxed italic border-l-2 border-slate-200 pl-3 py-1">
            “J-102井的泵效下降数据与动液面变化具有极强的正相关性，此次归因诊断证据充分，建议同步生成作业计划单。”
          </p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'evidence': return renderEvidenceChain();
      case 'dataSource': return renderDataSource();
      case 'toolCall': return renderToolCall();
      case 'runLog': return renderRunLog();
      case 'userConfirm': return renderUserConfirm();
      case 'auditRecord': return renderAuditRecord();
      default: return null;
    }
  };

  return (
    <div className="w-full flex-shrink-0 bg-white border-t border-slate-200 flex flex-col shadow-[0_-12px_40px_rgba(0,0,0,0.1)] relative z-[100]">
      {/* Header / Toggle */}
      <div 
        className="h-12 flex items-center justify-between px-6 cursor-pointer bg-slate-900 text-white hover:bg-slate-800 transition-colors border-b border-white/10 w-full"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-tight shadow-sm">
            <i className="fas fa-shield-alt"></i>
            <span>{lang === 'zh' ? '可信AI' : 'TRUSTABLE AI'}</span>
          </div>
          <h3 className="text-sm font-bold">
            {lang === 'zh' ? '证据链与运行状态' : 'Evidence Chain & Run Status'}
          </h3>
          <div className="flex items-center gap-2 ml-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
              {lang === 'zh' ? '系统运行正常' : 'All Systems Operational'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2 mr-2">
             {[1,2,3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[8px] text-slate-300">
                   {i === 1 ? <i className="fas fa-database"></i> : i === 2 ? <i className="fas fa-tools"></i> : <i className="fas fa-link"></i>}
                </div>
             ))}
          </div>
          <i className={`fas fa-chevron-${isExpanded ? 'down' : 'up'} text-xs text-slate-400 transition-transform duration-300`}></i>
        </div>
      </div>

      {/* Tabs & Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 320 }}
            exit={{ height: 0 }}
            className="overflow-hidden flex flex-col"
          >
            {/* Tabs Sidebar/Header */}
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

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
               {renderContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
