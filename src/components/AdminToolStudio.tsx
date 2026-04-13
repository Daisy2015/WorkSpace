
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, ToolEntry } from '../types';

interface AdminToolStudioProps {
  lang: Language;
  tool: ToolEntry;
  onBack: () => void;
}

type StudioTab = 'contract' | 'permission' | 'sla' | 'dependency';

export const AdminToolStudio: React.FC<AdminToolStudioProps> = ({ lang, tool, onBack }) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('contract');
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const tabs = [
    { id: 'contract', label: lang === 'zh' ? 'API Contract' : 'API Contract', icon: 'fa-file-code' },
    { id: 'permission', label: lang === 'zh' ? 'Permission' : 'Permission', icon: 'fa-user-shield' },
    { id: 'sla', label: lang === 'zh' ? 'SLA Runtime' : 'SLA Runtime', icon: 'fa-heartbeat' },
    { id: 'dependency', label: lang === 'zh' ? 'Dependency Graph' : 'Dependency Graph', icon: 'fa-project-diagram' },
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
              <h2 className="text-xl font-bold text-slate-800">{tool.name}</h2>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase">{tool.type}</span>
              <div className="flex items-center gap-1.5 ml-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${tool.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${tool.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'}`}>{tool.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">P95 Latency:</span>
                <span className="text-xs font-bold text-slate-700">{tool.p95Latency}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Success Rate:</span>
                <span className="text-xs font-bold text-emerald-600">{tool.successRate}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cost/Call:</span>
                <span className="text-xs font-bold text-blue-600">{tool.costPerCall}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            {lang === 'zh' ? '密钥轮换' : 'Rotate Keys'}
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
            <i className="fas fa-vial"></i>
            {lang === 'zh' ? '在线调试' : 'Debug API'}
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
              <motion.div layoutId="toolStudioTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Main Workspace */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
          <AnimatePresence mode="wait">
            {activeTab === 'contract' && (
              <motion.div 
                key="contract"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 space-y-8"
              >
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <i className="fas fa-sign-in-alt text-indigo-500"></i>
                      {lang === 'zh' ? '请求协议 (Request)' : 'Request Contract'}
                    </h3>
                    <div className="bg-slate-900 rounded-2xl p-6 font-mono text-xs text-indigo-100 border border-slate-800 space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                        <span className="text-indigo-400 font-bold">{tool.method}</span>
                        <span className="text-slate-400 truncate">{tool.endpoint}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">Headers</div>
                        <div className="text-indigo-300">{"{ \"Authorization\": \"Bearer ****\", \"Content-Type\": \"application/json\" }"}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">Body Schema</div>
                        <div className="text-indigo-300">{"{ \"query\": \"string\", \"filters\": \"object\", \"limit\": \"number\" }"}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <i className="fas fa-sign-out-alt text-emerald-500"></i>
                      {lang === 'zh' ? '响应协议 (Response)' : 'Response Contract'}
                    </h3>
                    <div className="bg-slate-900 rounded-2xl p-6 font-mono text-xs text-emerald-100 border border-slate-800 space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                        <span className="text-emerald-400 font-bold">200</span>
                        <span className="text-slate-400">OK</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">Response Body</div>
                        <div className="text-emerald-300">{"{ \"status\": \"success\", \"data\": [], \"execution_time\": \"ms\" }"}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800">{lang === 'zh' ? 'Mock 测试' : 'Mock Testing'}</h3>
                  <div className="flex gap-4">
                    <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all">Generate Mock</button>
                    <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all">Run Mock Test</button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'permission' && (
              <motion.div 
                key="permission"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 space-y-8"
              >
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><i className="fas fa-building"></i></div>
                      <h4 className="font-bold text-slate-800 text-sm">{lang === 'zh' ? '租户权限' : 'Tenant Auth'}</h4>
                    </div>
                    <div className="space-y-2">
                      {['North Oil', 'South Exploration', 'Deep Sea Tech'].map(t => (
                        <div key={t} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">{t}</span>
                          <i className="fas fa-check-circle text-emerald-500"></i>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><i className="fas fa-user-tag"></i></div>
                      <h4 className="font-bold text-slate-800 text-sm">{lang === 'zh' ? '岗位权限' : 'Role Auth'}</h4>
                    </div>
                    <div className="space-y-2">
                      {['Geologist', 'Drilling Engineer', 'Production Manager'].map(r => (
                        <div key={r} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">{r}</span>
                          <i className="fas fa-check-circle text-emerald-500"></i>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><i className="fas fa-database"></i></div>
                      <h4 className="font-bold text-slate-800 text-sm">{lang === 'zh' ? '数据域权限' : 'Data Domain'}</h4>
                    </div>
                    <div className="space-y-2">
                      {['Production DB', 'Seismic Archive', 'Well Logs'].map(d => (
                        <div key={d} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">{d}</span>
                          <i className="fas fa-check-circle text-emerald-500"></i>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sla' && (
              <motion.div 
                key="sla"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 space-y-8"
              >
                <div className="grid grid-cols-4 gap-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">P95 Latency</div>
                    <div className="text-2xl font-bold text-slate-800">{tool.p95Latency}</div>
                    <div className="text-[10px] text-emerald-600 mt-1 font-bold">Stable</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Error Rate</div>
                    <div className="text-2xl font-bold text-rose-600">0.05%</div>
                    <div className="text-[10px] text-slate-400 mt-1">Last 24h</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Retry Success</div>
                    <div className="text-2xl font-bold text-emerald-600">92%</div>
                    <div className="text-[10px] text-slate-400 mt-1">Avg 3 retries</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Circuit Breaks</div>
                    <div className="text-2xl font-bold text-slate-800">0</div>
                    <div className="text-[10px] text-slate-400 mt-1">Healthy</div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'dependency' && (
              <motion.div 
                key="dependency"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 space-y-8"
              >
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '被哪些 Skills 调用' : 'Used by Skills'}</h3>
                    <div className="space-y-2">
                      {['Diagnosis Skill', 'Report Gen Skill', 'Seismic Analysis'].map(s => (
                        <div key={s} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                          <span className="text-slate-700 font-medium">{s}</span>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Active</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '被哪些 Workflows 使用' : 'Used by Workflows'}</h3>
                    <div className="space-y-2">
                      {['Auto Daily Report', 'Risk Warning Flow', 'Well Batch Proc'].map(w => (
                        <div key={w} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                          <span className="text-slate-700 font-medium">{w}</span>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Production</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Panel: Call Logs */}
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
                <i className="fas fa-list-ul text-slate-400"></i>
                {lang === 'zh' ? '实时调用日志' : 'Real-time Call Logs'}
              </span>
              <div className="h-4 w-px bg-slate-200"></div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status:</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-bold text-emerald-600">Healthy</span>
                </div>
              </div>
            </div>
            <i className={`fas fa-chevron-${isLogsOpen ? 'down' : 'up'} text-slate-400 group-hover:text-indigo-600 transition-all`}></i>
          </button>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="flex items-center gap-6 p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-slate-100">
                <span className="text-[10px] font-mono text-slate-400">10:24:{10 + i}</span>
                <div className="flex items-center gap-2 w-20">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">200 OK</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-700 truncate">Request ID: req-9823-{i}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">Caller: Diagnosis Skill • Latency: 420ms • Payload: 4.2KB</div>
                </div>
                <button className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all">View Payload</button>
              </div>
            ))}
          </div>
        </motion.footer>
      </div>
    </div>
  );
};
