
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, WorkflowEntry } from '../types';
import { AdminWorkflowStudio } from './AdminWorkflowStudio';

interface AdminWorkflowManagementProps {
  lang: Language;
}

const MOCK_WORKFLOWS: WorkflowEntry[] = [
  {
    id: 'wf-4',
    name: '新井压裂初设模板',
    type: 'Business',
    applicableAgent: 'Fracturing Expert',
    nodeCount: 8,
    skillRefs: 4,
    toolRefs: 6,
    successRate: '96.5%',
    avgDuration: '120s',
    workspaceRefs: 8,
    packageScope: ['Professional', 'Enterprise', 'Flagship'],
    status: 'Production',
    description: '为新井自动匹配历史邻井，抽取并优选压裂设计参数。',
    updatedAt: '2024-05-21 14:30',
    isEnabled: true
  },
  {
    id: 'wf-5',
    name: '类比井设计模板',
    type: 'Business',
    applicableAgent: 'Analogy Expert',
    nodeCount: 6,
    skillRefs: 3,
    toolRefs: 4,
    successRate: '94.2%',
    avgDuration: '85s',
    workspaceRefs: 12,
    packageScope: ['Enterprise', 'Flagship'],
    status: 'Production',
    description: '基于全域类比检索结果，生成类比井压裂设计方案。',
    updatedAt: '2024-05-21 15:00',
    isEnabled: true
  },
  {
    id: 'wf-6',
    name: '分段分簇模板',
    type: 'Business',
    applicableAgent: 'Optimization Expert',
    nodeCount: 5,
    skillRefs: 2,
    toolRefs: 3,
    successRate: '97.8%',
    avgDuration: '45s',
    workspaceRefs: 45,
    packageScope: ['Enterprise', 'Flagship'],
    status: 'Production',
    description: '优化每段长度、簇数及簇间距，提升 SRV。',
    updatedAt: '2024-05-21 16:00',
    isEnabled: true
  },
  {
    id: 'wf-7',
    name: '压裂规模模板',
    type: 'Business',
    applicableAgent: 'Economic Expert',
    nodeCount: 7,
    skillRefs: 2,
    toolRefs: 5,
    successRate: '95.1%',
    avgDuration: '110s',
    workspaceRefs: 28,
    packageScope: ['Enterprise', 'Flagship'],
    status: 'Production',
    description: '优化液量、砂量和排量规模，实现投入产出最优。',
    updatedAt: '2024-05-21 17:00',
    isEnabled: true
  },
  {
    id: 'wf-8',
    name: '产能预测模板',
    type: 'Report',
    applicableAgent: 'Prediction Expert',
    nodeCount: 4,
    skillRefs: 2,
    toolRefs: 3,
    successRate: '92.5%',
    avgDuration: '30s',
    workspaceRefs: 88,
    packageScope: ['Enterprise', 'Flagship'],
    status: 'Production',
    description: '预测推荐参数下的日产、首年产量和 EUR。',
    updatedAt: '2024-05-21 18:00',
    isEnabled: true
  },
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
    description: '自动汇总单井全月生产数据，生成包含趋势图、异常点分析及下月预测的完整报告。',
    updatedAt: '2024-05-20 10:00',
    isEnabled: true
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
    description: '实时监控生产数据，发现异常后自动触发诊断技能，并根据诊断结果向 OA 系统派发工单。',
    updatedAt: '2024-05-19 15:30',
    isEnabled: false
  }
];

export const AdminWorkflowManagement: React.FC<AdminWorkflowManagementProps> = ({ lang }) => {
  const [workflows, setWorkflows] = useState<WorkflowEntry[]>(MOCK_WORKFLOWS);
  const [selectedWfId, setSelectedWfId] = useState<string | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWfs = workflows.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleWorkflowStatus = (id: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === id ? { ...w, isEnabled: !w.isEnabled } : w
    ));
  };

  if (selectedWfId) {
    const wf = workflows.find(w => w.id === selectedWfId);
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
            {lang === 'zh' ? '流程模板管理' : 'Workflow Template Management'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input 
              type="text" 
              placeholder={lang === 'zh' ? '搜索流程模板...' : 'Search workflows...'} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
        {/* Middle: Workflow List */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '模板名称' : 'Template Name'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '使用场景' : 'Usage Scenario'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '状态' : 'Status'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '修改人' : 'Modified By'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '最近更新' : 'Updated'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{lang === 'zh' ? '操作' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWfs.map(wf => (
                    <tr 
                      key={wf.id} 
                      className="group hover:bg-indigo-50/30 transition-all"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                            wf.status === 'Production' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            <i className="fas fa-project-diagram"></i>
                          </div>
                          <div className="text-sm font-bold text-slate-800">{wf.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500 max-w-md truncate" title={wf.description}>
                          {wf.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWorkflowStatus(wf.id);
                          }}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                            wf.isEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              wf.isEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            A
                          </div>
                          <span className="text-xs text-slate-600">Admin</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{wf.updatedAt || '2024-05-20'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWfId(wf.id);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                            title={lang === 'zh' ? '编辑' : 'Edit'}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle delete logic
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                            title={lang === 'zh' ? '删除' : 'Delete'}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
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
      </div>
    </div>
  );
};
