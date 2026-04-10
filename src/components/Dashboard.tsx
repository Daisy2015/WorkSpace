import React from 'react';
import { Workspace, WorkspaceStatus, Language } from '../types';
import { translations } from '../i18n';

interface DashboardProps {
  workspaces: Workspace[];
  onNavigateToWorkspace: () => void;
  lang: Language;
}

// Simulated Data for "Top 5 High Value MBUs"
const MOCK_TOP_MBUs = [
    { id: '1', name: 'X-1 井钻井参数优化分析', domain: '钻井工程', owner: '陈莎拉', outcomes: 12, knowledge: 4 },
    { id: '2', name: 'A 区块深层构造解释', domain: '地质与地球物理', owner: '王建国', outcomes: 8, knowledge: 3 },
    { id: '3', name: '北海油田产量预测模型', domain: '油藏工程', owner: '李明', outcomes: 6, knowledge: 2 },
    { id: '4', name: '2024 第一季度腐蚀审计', domain: '安环 (HSE)', owner: '安全部', outcomes: 5, knowledge: 1 },
    { id: '5', name: '南海勘探风险评估', domain: '综合研究', owner: '张伟', outcomes: 4, knowledge: 1 },
];

export const Dashboard: React.FC<DashboardProps> = ({ workspaces, onNavigateToWorkspace, lang }) => {
  const t = translations[lang];

  // Dynamic KPI Calculations (Mixed with Mock Data for metrics not fully tracked)
  const activeWorkspacesCount = workspaces.filter(w => w.status !== WorkspaceStatus.ARCHIVED).length;
  // Mocked for visual demonstration as per PRD
  const kpiData = {
      conversion: '72%',
      aiCalls: '1,248',
      mbuCoverage: '128',
      evidenceCoverage: '91%'
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-8 custom-scrollbar font-sans text-slate-800">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* --- Header & Controls --- */}
        <div className="flex justify-between items-end border-b border-slate-200 pb-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t.dashboardTitle}</h1>
                <p className="text-sm text-slate-500 mt-2">{t.dashboardSubtitle}</p>
            </div>
            <div>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center">
                    <i className="fas fa-download mr-2"></i> {t.exportImage}
                </button>
            </div>
        </div>

        {/* --- 1. KPI Summary Cards (5 Columns) --- */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* KPI 1: Conversion Rate (Primary Highlight) */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.conversionRate}</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <i className="fas fa-chart-line"></i>
                    </div>
                </div>
                <div className="text-[14px] font-bold text-slate-900 font-mono tracking-tight">{kpiData.conversion}</div>
                <div className="text-xs text-slate-400 mt-2 flex items-center">
                    <span className="text-green-500 mr-1"><i className="fas fa-arrow-up"></i> 12%</span> {t.conversionRateSub}
                </div>
            </div>

            {/* KPI 2: Active Workspaces */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.activeWorkspaces}</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                        <i className="fas fa-folder-open"></i>
                    </div>
                </div>
                <div className="text-[14px] font-bold text-slate-900 font-mono tracking-tight">{activeWorkspacesCount}</div>
                <div className="text-xs text-slate-400 mt-2">{t.activeWorkspacesSub}</div>
            </div>

             {/* KPI 3: AI Calls */}
             <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.aiCalls}</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-100 transition-colors">
                        <i className="fas fa-robot"></i>
                    </div>
                </div>
                <div className="text-[14px] font-bold text-slate-900 font-mono tracking-tight">{kpiData.aiCalls}</div>
                <div className="text-xs text-slate-400 mt-2">{t.aiCallsSub}</div>
            </div>

             {/* KPI 4: MBU Coverage */}
             <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.mbuCoverage}</span>
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-100 transition-colors">
                        <i className="fas fa-cubes"></i>
                    </div>
                </div>
                <div className="text-[14px] font-bold text-slate-900 font-mono tracking-tight">{kpiData.mbuCoverage}</div>
                <div className="text-xs text-slate-400 mt-2">{t.mbuCoverageSub}</div>
            </div>

            {/* KPI 5: Evidence Coverage */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.evidenceCoverage}</span>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-100 transition-colors">
                        <i className="fas fa-shield-alt"></i>
                    </div>
                </div>
                <div className="text-[14px] font-bold text-slate-900 font-mono tracking-tight">{kpiData.evidenceCoverage}</div>
                <div className="text-xs text-slate-400 mt-2">{t.evidenceCoverageDesc}</div>
            </div>
        </div>

        {/* --- 2. Middle Section: Charts & Quick Start (2 Column Layout) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Charts (Span 2) */}
            <div className="lg:col-span-2">
                
                {/* Chart: MBU Coverage Trend */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 h-full hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-center mb-6">
                         <div className="flex items-center">
                            <div className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></div>
                            <h3 className="font-bold text-slate-800 text-lg">{t.mbuCoverageTrend}</h3>
                         </div>
                         <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
                             <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2"></span> 被引用 MBU</div>
                             <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-blue-200 mr-2"></span> 沉淀成果 MBU</div>
                         </div>
                    </div>
                    {/* Simulated Bar Chart Area */}
                    <div className="h-48 flex items-end justify-between gap-6 px-4">
                        {[40, 55, 45, 70, 60, 85, 90, 75, 80, 95, 85, 100].map((h, i) => (
                             <div key={i} className="flex-1 flex flex-col justify-end gap-1.5 h-full group relative cursor-pointer">
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                      Value: {h}
                                  </div>
                                  {/* Top Bar (Outcome MBU) */}
                                  <div className="w-full bg-indigo-500 rounded-sm opacity-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-y-105 origin-bottom shadow-sm" style={{ height: `${h * 0.4}%` }}></div>
                                  {/* Bottom Bar (Cited MBU) */}
                                  <div className="w-full bg-blue-100 rounded-sm opacity-90 transition-all duration-300 group-hover:bg-blue-200 group-hover:scale-y-105 origin-bottom" style={{ height: `${h * 0.6}%` }}></div>
                             </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-4 uppercase font-mono tracking-wider">
                         <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Quick Start (Span 1) */}
            <div className="lg:col-span-1">
                {/* Quick Start Card */}
                <div className="h-full bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden flex flex-col justify-center group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:opacity-10 transition-opacity duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-900 opacity-20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                    
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md shadow-inner border border-white/10">
                            <i className="fas fa-bolt text-yellow-300 text-xl"></i>
                        </div>
                        <h3 className="text-xl font-bold mb-2 tracking-tight">{t.quickStart}</h3>
                        <p className="text-indigo-100 text-sm mb-6 opacity-90 leading-relaxed font-medium">基于 MBU 方法论，快速构建可信、可溯源的 AI 分析工作空间。</p>
                        <button 
                            onClick={onNavigateToWorkspace} 
                            className="w-full bg-white text-indigo-600 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center transform hover:-translate-y-0.5"
                        >
                            <i className="fas fa-plus mr-2"></i> {t.createMbuWorkspace}
                        </button>
                    </div>
                </div>

            </div>
        </div>

        {/* --- 3. Bottom Section: High Value MBU Table --- */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
             <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800 text-base flex items-center">
                     <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center mr-3 text-yellow-500">
                        <i className="fas fa-trophy"></i>
                     </div>
                     {t.topValueList}
                 </h3>
                 <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline">View All</button>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                         <tr>
                             <th className="px-8 py-4 w-20 text-center">#</th>
                             <th className="px-8 py-4">{t.colName}</th>
                             <th className="px-8 py-4">{t.colDomain}</th>
                             <th className="px-8 py-4">{t.colOwner}</th>
                             <th className="px-8 py-4 text-right">{t.colOutcomes}</th>
                             <th className="px-8 py-4 text-right">{t.colKnowledge}</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                         {MOCK_TOP_MBUs.map((item, idx) => (
                             <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                                 <td className="px-8 py-5 text-center text-slate-400 font-mono text-xs">{idx + 1}</td>
                                 <td className="px-8 py-5">
                                     <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.name}</div>
                                 </td>
                                 <td className="px-8 py-5">
                                     <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs border border-slate-200 font-medium">
                                        {item.domain}
                                     </span>
                                 </td>
                                 <td className="px-8 py-5 text-slate-600">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600 font-bold border border-white shadow-sm">
                                            {item.owner.charAt(0)}
                                        </div>
                                        {item.owner}
                                    </div>
                                 </td>
                                 <td className="px-8 py-5 text-right font-mono text-slate-700 font-bold">{item.outcomes}</td>
                                 <td className="px-8 py-5 text-right font-mono text-slate-700 font-bold">{item.knowledge}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
        </div>

      </div>
    </div>
  );
};