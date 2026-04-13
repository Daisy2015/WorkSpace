
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, SkillEntry } from '../types';

interface AdminSkillStudioProps {
  lang: Language;
  skill: SkillEntry;
  onBack: () => void;
}

type StudioTab = 'prompt' | 'schema' | 'reuse' | 'experiment';

export const AdminSkillStudio: React.FC<AdminSkillStudioProps> = ({ lang, skill, onBack }) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('prompt');
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const tabs = [
    { id: 'prompt', label: lang === 'zh' ? 'Skill Prompt Studio' : 'Prompt Studio', icon: 'fa-terminal' },
    { id: 'schema', label: lang === 'zh' ? '输入输出 Schema' : 'I/O Schema', icon: 'fa-code' },
    { id: 'reuse', label: lang === 'zh' ? '复用关系图谱' : 'Reuse Graph', icon: 'fa-project-diagram' },
    { id: 'experiment', label: lang === 'zh' ? 'A/B 实验中心' : 'A/B Experiment', icon: 'fa-flask' },
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
              <h2 className="text-xl font-bold text-slate-800">{skill.name}</h2>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase">{skill.category}</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">{skill.version}</span>
              <div className="flex items-center gap-1.5 ml-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{skill.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '7天调用:' : '7D Calls:'}</span>
                <span className="text-xs font-bold text-slate-700">12.4k</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '成功率:' : 'Success:'}</span>
                <span className="text-xs font-bold text-emerald-600">{skill.runtimeSuccess}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '复用 Agent:' : 'Reuse Agents:'}</span>
                <span className="text-xs font-bold text-blue-600">{skill.reusedByAgents}</span>
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
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all">
            <i className="fas fa-ellipsis-v"></i>
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
              <motion.div layoutId="studioTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Main Workspace */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
          <AnimatePresence mode="wait">
            {activeTab === 'prompt' && (
              <motion.div 
                key="prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex h-full divide-x divide-slate-200"
              >
                {/* Left: Editor */}
                <div className="flex-1 p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <i className="fas fa-edit text-indigo-500"></i>
                      {lang === 'zh' ? 'Prompt 编辑器' : 'Prompt Editor'}
                    </h3>
                    <button className="text-[10px] font-bold text-indigo-600 hover:underline">Prompt Diff</button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '技能目标定义' : 'Skill Goal'}</label>
                      <textarea 
                        className="w-full h-24 bg-slate-900 text-indigo-100 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        defaultValue={lang === 'zh' ? "定义该技能的核心目标：诊断油井产量异常并给出初步风险评估。" : "Define core goal: Diagnose well production anomalies and provide risk assessment."}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '规则约束 Prompt' : 'Constraints'}</label>
                      <textarea 
                        className="w-full h-32 bg-slate-900 text-indigo-100 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        defaultValue="1. Always refer to historical baseline.\n2. Flag deviations > 15%.\n3. Use industry standard terminology."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '输出格式模板' : 'Output Template'}</label>
                      <div className="bg-white border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-600">
                        {"{ \"diagnosis\": \"...\", \"risk_level\": \"...\", \"suggested_action\": \"...\" }"}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Right: Debugger */}
                <div className="w-[450px] bg-white p-8 space-y-6 overflow-y-auto custom-scrollbar">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-vial text-emerald-500"></i>
                    {lang === 'zh' ? '调试台' : 'Debugger'}
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '测试输入样例' : 'Test Input'}</label>
                      <textarea 
                        className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        placeholder="Enter test data..."
                      />
                    </div>
                    <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                      <i className="fas fa-play text-xs"></i>
                      {lang === 'zh' ? '运行测试' : 'Run Test'}
                    </button>
                    <div className="pt-6 border-t border-slate-100 space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '输出预览' : 'Output Preview'}</label>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 min-h-[150px] text-xs text-slate-600">
                        {lang === 'zh' ? '等待运行...' : 'Waiting for run...'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'schema' && (
              <motion.div 
                key="schema"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 space-y-8"
              >
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800">Input Schema</h3>
                      <button className="text-[10px] font-bold text-indigo-600 hover:underline">JSON Schema</button>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '参数名' : 'Param'}</th>
                            <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '类型' : 'Type'}</th>
                            <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '必填' : 'Req'}</th>
                            <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '来源' : 'Source'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="px-4 py-3 font-mono text-indigo-600">well_id</td>
                            <td className="px-4 py-3 text-slate-600">string</td>
                            <td className="px-4 py-3 text-emerald-500 font-bold">YES</td>
                            <td className="px-4 py-3 text-slate-500">Context</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-indigo-600">time_range</td>
                            <td className="px-4 py-3 text-slate-600">object</td>
                            <td className="px-4 py-3 text-slate-400">NO</td>
                            <td className="px-4 py-3 text-slate-500">User Input</td>
                          </tr>
                        </tbody>
                      </table>
                      <button className="w-full py-3 border-t border-slate-100 text-[10px] font-bold text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest">
                        + Add Parameter
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800">Output Schema</h3>
                      <button className="text-[10px] font-bold text-indigo-600 hover:underline">Mock Data</button>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '输出字段' : 'Field'}</th>
                            <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '结构' : 'Struct'}</th>
                            <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '可视化' : 'Visual'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="px-4 py-3 font-mono text-emerald-600">diagnosis</td>
                            <td className="px-4 py-3 text-slate-600">string</td>
                            <td className="px-4 py-3 text-slate-500">Markdown</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-emerald-600">metrics</td>
                            <td className="px-4 py-3 text-slate-600">array</td>
                            <td className="px-4 py-3 text-slate-500">Table</td>
                          </tr>
                        </tbody>
                      </table>
                      <button className="w-full py-3 border-t border-slate-100 text-[10px] font-bold text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest">
                        + Add Field
                      </button>
                    </div>
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
                <div className="bg-white border border-slate-200 rounded-3xl p-12 min-h-[500px] relative overflow-hidden flex flex-col items-center justify-center">
                  <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:40px_40px]"></div>
                  
                  {/* Reuse Graph Visualization */}
                  <div className="relative flex flex-col items-center gap-16">
                    <div className="flex gap-12">
                      <div className="px-6 py-3 bg-amber-50 border border-amber-200 rounded-xl shadow-sm text-center">
                        <div className="text-[10px] font-bold text-amber-600 uppercase mb-1">Leader Strategy</div>
                        <div className="text-xs font-bold text-slate-800">Orchestrator</div>
                      </div>
                      <div className="px-6 py-3 bg-indigo-50 border border-indigo-200 rounded-xl shadow-sm text-center">
                        <div className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Scenario Agent</div>
                        <div className="text-xs font-bold text-slate-800">Prod Diagnosis</div>
                      </div>
                    </div>

                    <div className="w-64 h-24 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center relative">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-8 bg-slate-200"></div>
                      <div className="px-8 py-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200 flex items-center gap-3">
                        <i className="fas fa-toolbox"></i>
                        <span className="font-bold">{skill.name}</span>
                      </div>
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-px h-8 bg-slate-200"></div>
                    </div>

                    <div className="flex gap-12">
                      <div className="px-6 py-3 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm text-center">
                        <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Skill</div>
                        <div className="text-xs font-bold text-slate-800">Report Gen</div>
                      </div>
                      <div className="px-6 py-3 bg-blue-50 border border-blue-200 rounded-xl shadow-sm text-center">
                        <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">Tool</div>
                        <div className="text-xs font-bold text-slate-800">GeoMapX</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'experiment' && (
              <motion.div 
                key="experiment"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 space-y-8"
              >
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                    <h3 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '实验配置' : 'Experiment Config'}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">A</div>
                          <span className="text-xs font-bold text-slate-700">Baseline Prompt</span>
                        </div>
                        <span className="text-xs font-bold text-slate-400">50% Traffic</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">B</div>
                          <span className="text-xs font-bold text-indigo-700">Optimized Prompt v2</span>
                        </div>
                        <span className="text-xs font-bold text-indigo-400">50% Traffic</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                    <h3 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '评估指标' : 'Evaluation Metrics'}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">{lang === 'zh' ? '成功率' : 'Success Rate'}</div>
                        <div className="text-lg font-bold text-emerald-700">+4.2%</div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">{lang === 'zh' ? '平均耗时' : 'Avg Latency'}</div>
                        <div className="text-lg font-bold text-blue-700">-120ms</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar: Mapping & Package */}
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Skill Package Mapping</h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'zh' ? '绑定位置' : 'Binding Locations'}</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Leader Agent</span>
                      <span className="font-bold text-slate-800">4</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Workflow Nodes</span>
                      <span className="font-bold text-slate-800">12</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'zh' ? '套餐可见性' : 'Package Visibility'}</div>
                  <div className="space-y-2">
                    {['Foundation', 'Professional', 'Enterprise', 'Flagship'].map(pkg => (
                      <div key={pkg} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{pkg}</span>
                        <i className={`fas fa-check-circle ${skill.visibility.includes(pkg) ? 'text-emerald-500' : 'text-slate-200'}`}></i>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Panel: Logs & Evaluation */}
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
              <i className="fas fa-terminal text-slate-400"></i>
              {lang === 'zh' ? '实验日志与质量评测' : 'Experiment Logs & Evaluation'}
            </span>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent 100 Samples:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                  <div key={i} className={`w-1.5 h-3 rounded-sm ${i === 7 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                ))}
              </div>
            </div>
          </div>
          <i className={`fas fa-chevron-${isLogsOpen ? 'down' : 'up'} text-slate-400 group-hover:text-indigo-600 transition-all`}></i>
        </button>
        <div className="flex-1 overflow-hidden flex divide-x divide-slate-100">
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group">
                <span className="text-[10px] font-mono text-slate-400 mt-1">10:02:{15 + i}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-700 truncate">Sample Call #{i} - {skill.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Success: <span className="text-emerald-500 font-bold">YES</span> • Latency: 0.8s • Tokens: 1.2k</div>
                </div>
              </div>
            ))}
          </div>
          <div className="w-80 p-6 space-y-4 bg-slate-50/50">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quality Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-xs"><span className="text-slate-600">Hallucination Rate</span><span className="font-bold text-emerald-600">0.2%</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-600">User Rating</span><span className="font-bold text-amber-500">4.8/5</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-600">ROI Contribution</span><span className="font-bold text-indigo-600">$1.2k</span></div>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};
