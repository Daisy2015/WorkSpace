
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, WorkflowEntry } from '../types';

interface AdminWorkflowStudioProps {
  lang: Language;
  workflow: WorkflowEntry;
  onBack: () => void;
}

type StudioTab = 'designer' | 'runtime' | 'reuse';

export const AdminWorkflowStudio: React.FC<AdminWorkflowStudioProps> = ({ lang, workflow, onBack }) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('designer');
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const tabs = [
    { id: 'designer', label: lang === 'zh' ? 'Designer' : 'Designer', icon: 'fa-drafting-compass' },
    { id: 'runtime', label: lang === 'zh' ? 'Runtime' : 'Runtime', icon: 'fa-play-circle' },
    { id: 'reuse', label: lang === 'zh' ? 'Reuse Graph' : 'Reuse Graph', icon: 'fa-project-diagram' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Sticky Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="h-10 w-px bg-slate-100"></div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-800">{workflow.name}</h2>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase">{workflow.type}</span>
              <div className="flex items-center gap-1.5 ml-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{workflow.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '节点数:' : 'Nodes:'}</span>
                <span className="text-xs font-bold text-slate-700">{workflow.nodeCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '成功率:' : 'Success:'}</span>
                <span className="text-xs font-bold text-emerald-600">{workflow.successRate}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '平均耗时:' : 'Avg Duration:'}</span>
                <span className="text-xs font-bold text-blue-600">{workflow.avgDuration}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            {lang === 'zh' ? '保存草稿' : 'Save Draft'}
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
            <i className="fas fa-rocket"></i>
            {lang === 'zh' ? '发布版本' : 'Publish'}
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 px-8 flex items-center gap-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as StudioTab)}
            className={`py-4 text-sm font-bold transition-all relative ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <i className={`fas ${tab.icon} text-xs`}></i>
              {tab.label}
            </div>
            {activeTab === tab.id && (
              <motion.div layoutId="wfStudioTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Main Workspace */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
          <AnimatePresence mode="wait">
            {activeTab === 'designer' && (
              <motion.div 
                key="designer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex h-full divide-x divide-slate-200"
              >
                {/* DAG Canvas Placeholder */}
                <div className="flex-1 p-8 relative overflow-hidden bg-white">
                  <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:30px_30px]"></div>
                  <div className="relative z-10 h-full border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center">
                    <i className="fas fa-drafting-compass text-6xl text-slate-100 mb-4"></i>
                    <p className="text-slate-400 font-bold">DAG 画布 (Designer Canvas)</p>
                    <p className="text-[10px] text-slate-300 mt-2 uppercase tracking-widest">Drag & Drop nodes to design workflow</p>
                  </div>
                </div>
                {/* Node Parameters */}
                <div className="w-80 bg-white p-6 space-y-6 overflow-y-auto custom-scrollbar">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '节点参数' : 'Node Parameters'}</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Timeout</div>
                      <input type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs" defaultValue="30s" />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Retry Strategy</div>
                      <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs">
                        <option>Exponential Backoff</option>
                        <option>Fixed Interval</option>
                        <option>None</option>
                      </select>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Fallback Node</div>
                      <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs">
                        <option>Human_Checkpoint_01</option>
                        <option>Error_Handler_Default</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'runtime' && (
              <motion.div 
                key="runtime"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 space-y-8"
              >
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                  <h3 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '实时执行时间线' : 'Runtime Timeline'}</h3>
                  <div className="space-y-4">
                    {[
                      { node: 'Start', duration: '10ms', status: 'Success' },
                      { node: 'SQL_Query_01', duration: '1.2s', status: 'Success' },
                      { node: 'Diagnosis_Skill', duration: '3.5s', status: 'Success' },
                      { node: 'Human_Check', duration: '2h', status: 'Pending' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-24 text-[10px] font-mono text-slate-400">{item.duration}</div>
                        <div className="flex-1 h-8 bg-slate-50 rounded-lg border border-slate-100 flex items-center px-4 justify-between">
                          <span className="text-xs font-bold text-slate-700">{item.node}</span>
                          <span className={`text-[10px] font-bold ${item.status === 'Success' ? 'text-emerald-500' : 'text-amber-500'}`}>{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reuse' && (
              <motion.div 
                key="reuse"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 space-y-8"
              >
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '被哪些 Agents 默认绑定' : 'Bound to Agents'}</h3>
                    <div className="space-y-2">
                      {['Production Analyst', 'Reservoir Engineer'].map(a => (
                        <div key={a} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                          <span className="text-slate-700 font-medium">{a}</span>
                          <i className="fas fa-link text-indigo-400"></i>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '被哪些空间模板复用' : 'Reused in Workspaces'}</h3>
                    <div className="text-2xl font-bold text-indigo-600">{workflow.workspaceRefs}</div>
                    <p className="text-xs text-slate-400">{lang === 'zh' ? '当前已在多租户环境中广泛复用' : 'Widely reused in multi-tenant environments'}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Panel: Execution Logs */}
        <motion.footer 
          initial={false}
          animate={{ height: isLogsOpen ? '300px' : '48px' }}
          className="bg-white border-t border-slate-200 flex flex-col flex-shrink-0 z-40 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]"
        >
          <button 
            onClick={() => setIsLogsOpen(!isLogsOpen)}
            className="h-12 px-8 flex items-center justify-between hover:bg-slate-50 transition-all group"
          >
            <div className="flex items-center gap-6">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-history text-slate-400"></i>
                {lang === 'zh' ? '执行日志与审计流水' : 'Execution Logs & Audit'}
              </span>
              <div className="h-4 w-px bg-slate-200"></div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Runs:</span>
                <span className="text-xs font-bold text-indigo-600">24</span>
              </div>
            </div>
            <i className={`fas fa-chevron-${isLogsOpen ? 'down' : 'up'} text-slate-400 group-hover:text-indigo-600 transition-all`}></i>
          </button>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-6 p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-slate-100">
                <span className="text-[10px] font-mono text-slate-400">10:30:{10 + i}</span>
                <div className="flex items-center gap-2 w-24">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">RUNNING</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-700 truncate">Execution ID: exec-wf-9921-{i}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">Current Node: Diagnosis_Skill • Elapsed: 4.5s • Progress: 65%</div>
                </div>
                <button className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all">Trace DAG</button>
              </div>
            ))}
          </div>
        </motion.footer>
      </div>
    </div>
  );
};
