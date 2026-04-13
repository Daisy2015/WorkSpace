
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, WorkflowEntry } from '../types';
import { AdminWorkflowStudio } from './AdminWorkflowStudio';

interface AdminWorkflowManagementProps {
  lang: Language;
}

const MOCK_WORKFLOWS: WorkflowEntry[] = [
  {
    id: 'wf-1',
    name: '单井产量月度分析报告',
    type: 'Report',
    applicableAgent: 'Production Analyst',
    nodeCount: 8,
    skillRefs: 3,
    toolRefs: 5,
    successRate: '98.2%',
    avgDuration: '45s',
    workspaceRefs: 124,
    packageScope: ['Professional', 'Enterprise', 'Flagship'],
    status: 'Production',
    description: '自动汇总单井全月生产数据，生成包含趋势图、异常点分析及下月预测的完整报告。'
  },
  {
    id: 'wf-2',
    name: '异常井自动预警与工单派发',
    type: 'Business',
    applicableAgent: 'Leader Agent',
    nodeCount: 12,
    skillRefs: 5,
    toolRefs: 8,
    successRate: '95.5%',
    avgDuration: '12s',
    workspaceRefs: 56,
    packageScope: ['Enterprise', 'Flagship'],
    status: 'Production',
    description: '实时监控生产数据，发现异常后自动触发诊断技能，并根据诊断结果向 OA 系统派发工单。'
  },
  {
    id: 'wf-3',
    name: '多井压力恢复试井批处理',
    type: 'Batch',
    applicableAgent: 'Reservoir Engineer',
    nodeCount: 6,
    skillRefs: 2,
    toolRefs: 4,
    successRate: '92.0%',
    avgDuration: '180s',
    workspaceRefs: 12,
    packageScope: ['Flagship'],
    status: 'Testing',
    description: '支持对区块内多口井的试井曲线进行批量拟合与参数解释。'
  }
];

export const AdminWorkflowManagement: React.FC<AdminWorkflowManagementProps> = ({ lang }) => {
  const [selectedWfId, setSelectedWfId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerWf, setDrawerWf] = useState<WorkflowEntry | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(true);

  const categories = [
    { id: 'All', label: lang === 'zh' ? '全部模板' : 'All Templates', icon: 'fa-th-list' },
    { id: 'Report', label: lang === 'zh' ? '报告模板' : 'Report Templates', icon: 'fa-file-alt' },
    { id: 'Business', label: lang === 'zh' ? '业务处理模板' : 'Business Templates', icon: 'fa-cogs' },
    { id: 'SOP', label: lang === 'zh' ? '岗位 SOP' : 'Role SOP', icon: 'fa-clipboard-list' },
    { id: 'Collaboration', label: lang === 'zh' ? '多 Agent 协同' : 'Multi-Agent', icon: 'fa-users-cog' },
    { id: 'Batch', label: lang === 'zh' ? '多井批处理' : 'Batch Processing', icon: 'fa-layer-group' },
  ];

  const filteredWfs = MOCK_WORKFLOWS.filter(w => activeCategory === 'All' || w.type === activeCategory);

  if (selectedWfId) {
    const wf = MOCK_WORKFLOWS.find(w => w.id === selectedWfId);
    if (wf) {
      return <AdminWorkflowStudio lang={lang} workflow={wf} onBack={() => setSelectedWfId(null)} />;
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden relative">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800">
            {lang === 'zh' ? 'Workflow Registry｜业务流程模板中心' : 'Workflow Registry | Business Templates'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input 
              type="text" 
              placeholder={lang === 'zh' ? '搜索流程模板...' : 'Search workflows...'} 
              className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-xs w-64 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
            <i className="fas fa-plus"></i>
            {lang === 'zh' ? '创建新模板' : 'Create Template'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Category Tree */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
          <div className="p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">
              {lang === 'zh' ? '模板分类' : 'Template Categories'}
            </div>
            <nav className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeCategory === cat.id 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <i className={`fas ${cat.icon} w-4 text-center ${activeCategory === cat.id ? 'text-indigo-500' : 'text-slate-400'}`}></i>
                  {cat.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Middle: Workflow List */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? 'Workflow 名称' : 'Workflow Name'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '适用 Agent' : 'Agent'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '节点/引用' : 'Nodes/Refs'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '执行效能' : 'Performance'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '引用数' : 'Usage'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '状态' : 'Status'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{lang === 'zh' ? '操作' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWfs.map(wf => (
                    <tr 
                      key={wf.id} 
                      className="group hover:bg-indigo-50/30 transition-all cursor-pointer"
                      onClick={() => {
                        setDrawerWf(wf);
                        setIsDrawerOpen(true);
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                            wf.status === 'Production' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            <i className="fas fa-project-diagram"></i>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{wf.name}</div>
                            <div className="text-[10px] text-slate-400">{wf.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{wf.applicableAgent}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-xs font-bold text-slate-800">{wf.nodeCount}</div>
                            <div className="text-[8px] text-slate-400 uppercase">Nodes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs font-bold text-slate-800">{wf.skillRefs}</div>
                            <div className="text-[8px] text-slate-400 uppercase">Skills</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-600">{wf.successRate}</span>
                            <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: wf.successRate }}></div>
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-400">Avg: {wf.avgDuration}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-building text-slate-300 text-[10px]"></i>
                          <span className="text-xs font-bold text-slate-700">{wf.workspaceRefs}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          wf.status === 'Production' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>{wf.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWfId(wf.id);
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                        >
                          {lang === 'zh' ? '进入 Studio' : 'Enter Studio'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom: Running Stats */}
          <motion.div 
            initial={false}
            animate={{ height: isStatsOpen ? '200px' : '48px' }}
            className="bg-white border-t border-slate-200 flex flex-col z-20 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]"
          >
            <button 
              onClick={() => setIsStatsOpen(!isStatsOpen)}
              className="h-12 px-8 flex items-center justify-between hover:bg-slate-50 transition-all group"
            >
              <div className="flex items-center gap-6">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <i className="fas fa-chart-pie text-indigo-500"></i>
                  {lang === 'zh' ? '流程运行统计与效能分析' : 'Workflow Stats & Efficiency'}
                </span>
                <div className="h-4 w-px bg-slate-200"></div>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '人工接管率:' : 'Human Handover:'}</span>
                    <span className="text-xs font-bold text-amber-600">4.2%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '高频入口:' : 'Top Entry:'}</span>
                    <span className="text-xs font-bold text-slate-600">{lang === 'zh' ? '月报生成' : 'Monthly Report'}</span>
                  </div>
                </div>
              </div>
              <i className={`fas fa-chevron-${isStatsOpen ? 'down' : 'up'} text-slate-400 group-hover:text-indigo-600 transition-all`}></i>
            </button>
            <div className="flex-1 p-6 grid grid-cols-4 gap-6 overflow-hidden">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'zh' ? 'Top 失败节点' : 'Top Failed Nodes'}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]"><span className="text-slate-600">SQL_Query_01</span><span className="font-bold text-rose-500">42%</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-slate-600">Doc_Render_X</span><span className="font-bold text-amber-500">18%</span></div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'zh' ? '平均耗时分布' : 'Avg Duration'}</div>
                <div className="h-16 flex items-end gap-1">
                  {[20, 40, 30, 50, 70, 45, 60, 35, 55, 75].map((h, i) => (
                    <div key={i} className="flex-1 bg-indigo-200 rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'zh' ? '人工接管趋势' : 'Human Takeover Trend'}</div>
                <div className="h-16 flex items-end gap-1">
                  {[60, 50, 40, 35, 30, 25, 20, 15, 10, 5].map((h, i) => (
                    <div key={i} className="flex-1 bg-amber-200 rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">ROI {lang === 'zh' ? '提升' : 'Boost'}</div>
                <div className="text-2xl font-bold text-emerald-600">+32%</div>
                <div className="text-[10px] text-slate-400 mt-1">{lang === 'zh' ? '对比人工处理效率' : 'Vs manual processing'}</div>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Right: DAG Preview Drawer */}
        <AnimatePresence>
          {isDrawerOpen && drawerWf && (
            <motion.aside 
              initial={{ x: 500 }}
              animate={{ x: 0 }}
              exit={{ x: 500 }}
              className="w-[500px] bg-white border-l border-slate-200 flex flex-col flex-shrink-0 z-30 shadow-2xl"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800">{lang === 'zh' ? 'Workflow DAG 预览' : 'Workflow DAG Preview'}</h3>
                <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-200">
                      <i className="fas fa-project-diagram"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{drawerWf.name}</h4>
                      <span className="text-xs text-slate-400">{drawerWf.type}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{drawerWf.description}</p>
                </div>

                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 min-h-[400px] flex flex-col items-center gap-6 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:20px_20px]"></div>
                  
                  {/* Mock DAG Visualization */}
                  <div className="relative z-10 flex flex-col items-center gap-8">
                    <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-[10px] font-bold text-slate-600 flex items-center gap-2">
                      <i className="fas fa-play text-emerald-500"></i> Start
                    </div>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <div className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm text-[10px] font-bold text-indigo-700 flex items-center gap-2">
                      <i className="fas fa-robot"></i> Agent Node
                    </div>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <div className="flex gap-8">
                      <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg shadow-sm text-[10px] font-bold text-emerald-700 flex items-center gap-2">
                        <i className="fas fa-toolbox"></i> Skill Node
                      </div>
                      <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg shadow-sm text-[10px] font-bold text-blue-700 flex items-center gap-2">
                        <i className="fas fa-plug"></i> Tool Node
                      </div>
                    </div>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-sm text-[10px] font-bold text-amber-700 flex items-center gap-2">
                      <i className="fas fa-user-check"></i> Human Checkpoint
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">套餐范围 (Package Scope)</label>
                  <div className="flex flex-wrap gap-2">
                    {['Foundation', 'Professional', 'Enterprise', 'Flagship'].map(pkg => (
                      <span key={pkg} className={`px-2 py-1 rounded-lg text-[10px] font-medium ${
                        drawerWf.packageScope.includes(pkg) ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-300 border border-slate-100'
                      }`}>{pkg}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex gap-3">
                <button 
                  onClick={() => setSelectedWfId(drawerWf.id)}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  {lang === 'zh' ? '进入 Studio' : 'Enter Studio'}
                </button>
                <button className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">
                  <i className="fas fa-share-alt"></i>
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
