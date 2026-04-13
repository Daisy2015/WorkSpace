
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

interface AdminAgentStudioProps {
  lang: Language;
  agent: any;
  onBack: () => void;
}

export const AdminAgentStudio: React.FC<AdminAgentStudioProps> = ({ lang, agent, onBack }) => {
  const [currentLang, setCurrentLang] = useState<Language>(lang);
  const [activeTab, setActiveTab] = useState<'prompt' | 'skills' | 'tools' | 'workflow'>('prompt');
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden relative">
      {/* 1) Sticky Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
              agent.type === 'Leader' ? 'bg-amber-100 text-amber-600' : 
              agent.type === 'Role' ? 'bg-indigo-100 text-indigo-600' :
              agent.type === 'Scenario' ? 'bg-purple-100 text-purple-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              <i className={`fas ${
                agent.type === 'Leader' ? 'fa-crown' : 
                agent.type === 'Role' ? 'fa-user-tie' :
                agent.type === 'Scenario' ? 'fa-cube' :
                'fa-bolt'
              }`}></i>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900">{agent.name}</h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  agent.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {agent.status}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1"><i className="fas fa-layer-group"></i> {agent.type}</span>
                <span className="flex items-center gap-1"><i className="fas fa-gem"></i> {agent.version}</span>
                <span className="flex items-center gap-1 font-mono text-indigo-600 font-bold">{agent.currentVersion}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-lg transition-all">
              {currentLang === 'zh' ? '保存草稿' : 'Save Draft'}
            </button>
            <button className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-sm hover:bg-indigo-100 rounded-lg transition-all">
              {currentLang === 'zh' ? '灰度测试' : 'Canary Test'}
            </button>
            <button className="px-6 py-2 bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 rounded-lg transition-all shadow-lg shadow-indigo-100">
              {currentLang === 'zh' ? '发布生产' : 'Publish'}
            </button>
            <div className="w-px h-8 bg-slate-200 mx-2"></div>
            <button 
              onClick={() => setCurrentLang(currentLang === 'zh' ? 'en' : 'zh')}
              className="px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all text-xs font-bold flex items-center gap-2"
            >
              <i className="fas fa-language text-base"></i>
              {currentLang === 'zh' ? 'English' : '中文'}
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-all" title="More Actions">
              <i className="fas fa-ellipsis-h"></i>
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-8 pt-2 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentLang === 'zh' ? '最近7天调用量' : '7D Calls'}</span>
            <span className="text-sm font-bold text-slate-700">12,480 <span className="text-emerald-500 text-[10px] ml-1">+5.2%</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentLang === 'zh' ? '成功率' : 'Success Rate'}</span>
            <span className="text-sm font-bold text-slate-700">98.2%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentLang === 'zh' ? '平均耗时' : 'Avg Latency'}</span>
            <span className="text-sm font-bold text-slate-700">1.45s</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Work Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex px-8 bg-white border-b border-slate-200 z-20">
            {[
              { id: 'prompt', label: currentLang === 'zh' ? 'Prompt 工作台' : 'Prompt Studio', icon: 'fa-terminal' },
              { id: 'skills', label: currentLang === 'zh' ? '技能绑定' : 'Skills Binding', icon: 'fa-toolbox' },
              { id: 'tools', label: currentLang === 'zh' ? '工具链' : 'Tool Chain', icon: 'fa-link' },
              { id: 'workflow', label: currentLang === 'zh' ? '工作流与调用图谱' : 'Workflow & Call Graph', icon: 'fa-project-diagram' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <i className={`fas ${tab.icon} text-xs`}></i>
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="studioTab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-slate-50">
            {activeTab === 'prompt' && (
              <div className="flex h-full divide-x divide-slate-200">
                {/* Left: Editor */}
                <div className="w-1/2 flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-code text-indigo-500"></i>
                        {currentLang === 'zh' ? 'Prompt 编辑器' : 'Prompt Editor'}
                      </h3>
                      <button className="text-[10px] font-bold text-indigo-600 hover:underline">
                        {currentLang === 'zh' ? '版本对比' : 'Prompt Diff'}
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {currentLang === 'zh' ? '系统提示词' : 'System Prompt'}
                        </label>
                        <textarea 
                          className="w-full h-32 bg-slate-900 text-indigo-100 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                          defaultValue={currentLang === 'zh' ? `你是一个专业的 ${agent.name} 专家，深耕石油天然气行业...` : `You are a professional ${agent.name} expert in the Oil & Gas industry...`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {currentLang === 'zh' ? '角色与约束' : 'Role & Constraints'}
                        </label>
                        <textarea 
                          className="w-full h-32 bg-slate-900 text-indigo-100 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                          defaultValue={currentLang === 'zh' ? "1. 仅使用提供的数据源。\n2. 保持专业语气。\n3. 明确指出风险。" : "1. Only use provided data sources.\n2. Maintain a professional tone.\n3. Highlight risks clearly."}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {currentLang === 'zh' ? 'Few-shot 示例' : 'Few-shot Examples'}
                        </label>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 italic">
                            {currentLang === 'zh' ? '示例 1: 输入 -> 输出...' : 'Example 1: Input -> Output...'}
                          </div>
                          <button className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-all font-bold">
                            + {currentLang === 'zh' ? '添加示例' : 'Add Example'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Debugger */}
                <div className="w-1/2 flex flex-col p-6 space-y-6 bg-white overflow-y-auto custom-scrollbar">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-vial text-emerald-500"></i>
                    {currentLang === 'zh' ? 'Prompt 调试台' : 'Prompt Debugger'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {currentLang === 'zh' ? '测试输入' : 'Test Input'}
                      </label>
                      <textarea 
                        className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        placeholder={currentLang === 'zh' ? '在此输入测试查询...' : 'Enter test query here...'}
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                        <i className="fas fa-play text-xs"></i>
                        {currentLang === 'zh' ? '运行测试' : 'Run Test'}
                      </button>
                      <button className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">
                        <i className="fas fa-history"></i>
                      </button>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {currentLang === 'zh' ? '输出预览' : 'Output Preview'}
                        </label>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {currentLang === 'zh' ? '成功' : 'Success'}
                        </span>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 min-h-[200px]">
                        <div className="prose prose-sm text-slate-700">
                          <p>
                            {currentLang === 'zh' 
                              ? '根据对 Block A-3 的分析，产量下降的主要原因是...' 
                              : 'Based on the analysis of Block A-3, the production decline is primarily caused by...'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {currentLang === 'zh' ? '推理过程' : 'Reasoning Trace'}
                      </label>
                      <div className="bg-slate-900 rounded-xl p-4 font-mono text-[10px] text-indigo-300 space-y-2">
                        <div className="flex gap-2"><span className="text-slate-500">[10:02:15]</span> <span className="text-emerald-400">{currentLang === 'zh' ? '意图:' : 'Intent:'}</span> Production Analysis</div>
                        <div className="flex gap-2"><span className="text-slate-500">[10:02:16]</span> <span className="text-blue-400">{currentLang === 'zh' ? '工具:' : 'Tool:'}</span> SQL_Query(well_id="A-3")</div>
                        <div className="flex gap-2"><span className="text-slate-500">[10:02:17]</span> <span className="text-purple-400">{currentLang === 'zh' ? '推理:' : 'Reasoning:'}</span> Comparing pressure trends...</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="p-8 space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{currentLang === 'zh' ? '技能绑定' : 'Skills Binding'}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {currentLang === 'zh' ? '为该智能体配置业务逻辑与专家技能。' : 'Configure business logic and expert skills for this agent.'}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
                    <i className="fas fa-plus"></i>
                    {currentLang === 'zh' ? '添加技能包' : 'Add Skill Package'}
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    { name: currentLang === 'zh' ? '数据分析技能' : 'Data Analysis Skill', priority: 'High', order: 1, status: 'Active' },
                    { name: currentLang === 'zh' ? '地质评价' : 'Geological Evaluation', priority: 'Medium', order: 2, status: 'Active' },
                    { name: currentLang === 'zh' ? '报告生成' : 'Report Generation', priority: 'Low', order: 3, status: 'Active' },
                  ].map((skill, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between group hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-move">
                      <div className="flex items-center gap-6">
                        <div className="text-slate-300 group-hover:text-indigo-400 transition-colors">
                          <i className="fas fa-grip-vertical"></i>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                          <i className="fas fa-toolbox"></i>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{skill.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {currentLang === 'zh' ? '顺序:' : 'Order:'} {skill.order}
                            </span>
                            <span className="text-slate-200">•</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              skill.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {skill.priority === 'High' ? (currentLang === 'zh' ? '高优先级' : 'High Priority') : (currentLang === 'zh' ? '中优先级' : 'Medium Priority')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right mr-4">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                            {currentLang === 'zh' ? '触发规则' : 'Trigger Rule'}
                          </div>
                          <div className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">intent == "analysis"</div>
                        </div>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
                          <i className="fas fa-cog"></i>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-800">{currentLang === 'zh' ? '回退策略' : 'Fallback Strategy'}</h4>
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{currentLang === 'zh' ? '技能失败时' : 'On Skill Failure'}</span>
                        <select className="bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 outline-none">
                          <option>{currentLang === 'zh' ? '重试并补偿' : 'Retry with Compensation'}</option>
                          <option>{currentLang === 'zh' ? '升级至 Leader' : 'Escalate to Leader'}</option>
                          <option>{currentLang === 'zh' ? '返回错误' : 'Return Error'}</option>
                        </select>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                        <i className="fas fa-info-circle text-amber-500 mt-1"></i>
                        <p className="text-xs text-amber-700 leading-relaxed">
                          {currentLang === 'zh' 
                            ? '如果主技能失败超过 2 次，将触发补偿技能。' 
                            : 'Compensation skill will be triggered if the primary skill fails more than 2 times.'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-800">{currentLang === 'zh' ? 'A/B 实验' : 'A/B Experiment'}</h4>
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                          <i className="fas fa-flask"></i>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">{currentLang === 'zh' ? '实验模式' : 'Experiment Mode'}</div>
                          <div className="text-xs text-slate-500">
                            {currentLang === 'zh' ? '对比 v1.2 与 v1.3 的性能' : 'Compare v1.2 vs v1.3 performance'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">OFF</span>
                        <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer">
                          <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                        </div>
                        <span className="text-xs font-bold text-slate-400">ON</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="p-8 space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{currentLang === 'zh' ? '工具链' : 'Tool Chain'}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {currentLang === 'zh' ? '管理底层工具执行与 SLA 策略。' : 'Manage underlying tool execution and SLA policies.'}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
                    <i className="fas fa-link"></i>
                    {currentLang === 'zh' ? '连接新工具' : 'Connect New Tool'}
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-8 min-h-[400px] relative overflow-hidden flex flex-col items-center justify-center">
                  <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:30px_30px]"></div>
                  
                  {/* Mock DAG Flow */}
                  <div className="relative flex flex-col items-center gap-12">
                    <div className="w-48 p-4 bg-indigo-50 border border-indigo-200 rounded-xl shadow-sm flex flex-col items-center text-center">
                      <i className="fas fa-database text-indigo-600 mb-2"></i>
                      <div className="text-xs font-bold text-slate-800">{currentLang === 'zh' ? 'SQL 查询' : 'SQL Query'}</div>
                      <div className="text-[10px] text-slate-400 mt-1">SLA: 2000ms • {currentLang === 'zh' ? '重试:' : 'Retry:'} 3</div>
                    </div>
                    
                    <div className="h-12 w-px bg-slate-200 relative">
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-r-2 border-slate-200 -rotate-45"></div>
                    </div>

                    <div className="flex gap-12">
                      <div className="w-48 p-4 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm flex flex-col items-center text-center">
                        <i className="fas fa-search text-emerald-600 mb-2"></i>
                        <div className="text-xs font-bold text-slate-800">{currentLang === 'zh' ? '向量搜索' : 'Vector Search'}</div>
                        <div className="text-[10px] text-slate-400 mt-1">SLA: 1500ms • {currentLang === 'zh' ? '重试:' : 'Retry:'} 2</div>
                      </div>
                      <div className="w-48 p-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm flex flex-col items-center text-center">
                        <i className="fas fa-map text-blue-600 mb-2"></i>
                        <div className="text-xs font-bold text-slate-800">GeoMapX</div>
                        <div className="text-[10px] text-slate-400 mt-1">SLA: 5000ms • {currentLang === 'zh' ? '重试:' : 'Retry:'} 1</div>
                      </div>
                    </div>

                    <div className="h-12 w-px bg-slate-200 relative">
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-r-2 border-slate-200 -rotate-45"></div>
                    </div>

                    <div className="w-48 p-4 bg-purple-50 border border-purple-200 rounded-xl shadow-sm flex flex-col items-center text-center">
                      <i className="fas fa-file-alt text-purple-600 mb-2"></i>
                      <div className="text-xs font-bold text-slate-800">{currentLang === 'zh' ? '报告生成' : 'Report Gen'}</div>
                      <div className="text-[10px] text-slate-400 mt-1">SLA: 10000ms • {currentLang === 'zh' ? '重试:' : 'Retry:'} 0</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      {currentLang === 'zh' ? '平均耗时' : 'Avg Latency'}
                    </div>
                    <div className="text-2xl font-bold text-slate-800">1.24s</div>
                    <div className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                      <i className="fas fa-arrow-down"></i> 
                      {currentLang === 'zh' ? '较上一版本下降 12%' : '12% vs last version'}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      {currentLang === 'zh' ? 'Token 成本' : 'Token Cost'}
                    </div>
                    <div className="text-2xl font-bold text-slate-800">$0.042</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {currentLang === 'zh' ? '单次调用平均成本' : 'Per average call'}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      {currentLang === 'zh' ? '可靠性' : 'Reliability'}
                    </div>
                    <div className="text-2xl font-bold text-slate-800">99.95%</div>
                    <div className="text-xs text-emerald-500 mt-1">
                      {currentLang === 'zh' ? '符合 SLA 标准' : 'SLA Compliant'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'workflow' && (
              <div className="p-8 space-y-8 animate-in fade-in duration-300">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800">{currentLang === 'zh' ? '工作流 DAG' : 'Workflow DAG'}</h3>
                  <div className="bg-slate-900 rounded-3xl p-12 min-h-[300px] relative overflow-hidden flex flex-col items-center">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:40px_40px]"></div>
                    <div className="relative flex items-center gap-12">
                      <div className="w-32 h-32 rounded-full border-4 border-indigo-500/30 flex items-center justify-center bg-indigo-500/10 shadow-[0_0_50px_rgba(79,70,229,0.2)]">
                        <div className="text-center">
                          <div className="text-[10px] font-bold text-indigo-300 uppercase">{currentLang === 'zh' ? '开始' : 'Start'}</div>
                          <i className="fas fa-play text-white mt-1"></i>
                        </div>
                      </div>
                      <i className="fas fa-chevron-right text-slate-700 text-2xl"></i>
                      <div className="w-48 p-6 bg-slate-800 border border-slate-700 rounded-2xl text-center">
                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">{currentLang === 'zh' ? '任务拆解' : 'Task Breakdown'}</div>
                        <div className="text-sm font-bold text-white">{currentLang === 'zh' ? 'Leader 路由' : 'Leader Routing'}</div>
                      </div>
                      <i className="fas fa-chevron-right text-slate-700 text-2xl"></i>
                      <div className="flex flex-col gap-4">
                        <div className="px-6 py-3 bg-indigo-600 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-500/20">{currentLang === 'zh' ? '技能: 分析' : 'Skill: Analysis'}</div>
                        <div className="px-6 py-3 bg-indigo-600 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-500/20">{currentLang === 'zh' ? '技能: 评价' : 'Skill: Evaluation'}</div>
                      </div>
                      <i className="fas fa-chevron-right text-slate-700 text-2xl"></i>
                      <div className="w-32 h-32 rounded-full border-4 border-emerald-500/30 flex items-center justify-center bg-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                        <div className="text-center">
                          <div className="text-[10px] font-bold text-emerald-300 uppercase">{currentLang === 'zh' ? '结束' : 'End'}</div>
                          <i className="fas fa-check text-white mt-1"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800">{currentLang === 'zh' ? '调用图谱 (依赖关系)' : 'Call Graph (Dependency Map)'}</h3>
                  <div className="bg-white border border-slate-200 rounded-3xl p-12 min-h-[400px] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    <div className="relative flex flex-col items-center gap-16">
                      <div className="px-8 py-4 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm text-center">
                        <div className="text-[10px] font-bold text-amber-600 uppercase mb-1">Leader</div>
                        <div className="text-sm font-bold text-slate-800">{currentLang === 'zh' ? '全局编排器' : 'Global Orchestrator'}</div>
                      </div>
                      
                      <div className="flex gap-24 relative">
                        {/* Connecting Lines (Mock) */}
                        <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-[400px] h-10 border-t-2 border-x-2 border-slate-100 rounded-t-3xl"></div>
                        
                        <div className="px-6 py-3 bg-indigo-50 border border-indigo-200 rounded-xl shadow-sm text-center z-10">
                          <div className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Role</div>
                          <div className="text-xs font-bold text-slate-800">{currentLang === 'zh' ? '生产分析专家' : 'Production Analyst'}</div>
                        </div>
                        <div className="px-6 py-3 bg-purple-50 border border-purple-200 rounded-xl shadow-sm text-center z-10">
                          <div className="text-[10px] font-bold text-purple-600 uppercase mb-1">Scenario</div>
                          <div className="text-xs font-bold text-slate-800">{currentLang === 'zh' ? '产量下降诊断' : 'Decline Diagnosis'}</div>
                        </div>
                        <div className="px-6 py-3 bg-blue-50 border border-blue-200 rounded-xl shadow-sm text-center z-10">
                          <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">General</div>
                          <div className="text-xs font-bold text-slate-800">{currentLang === 'zh' ? '智能问数' : 'Smart Query'}</div>
                        </div>
                      </div>

                      <div className="flex gap-12">
                        {['Skill: SQL', 'Skill: RAG', 'Tool: GeoMap', 'Tool: API'].map((item, idx) => (
                          <div key={idx} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Mapping & Package */}
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                {currentLang === 'zh' ? '前台展示映射' : 'Frontend Mapping'}
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'shelf', label: currentLang === 'zh' ? '右侧能力货架' : 'Capability Shelf', icon: 'fa-shopping-bag', active: true },
                  { id: 'card', label: 'Workflow Card', icon: 'fa-id-card', active: true },
                  { id: 'tree', label: currentLang === 'zh' ? '岗位任务树' : 'Role Task Tree', icon: 'fa-network-wired', active: false },
                  { id: 'network', label: 'Agent Network', icon: 'fa-project-diagram', active: false },
                ].map(item => (
                  <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${item.active ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <div className="flex items-center gap-3">
                      <i className={`fas ${item.icon} text-sm ${item.active ? 'text-indigo-600' : 'text-slate-400'}`}></i>
                      <span className={`text-xs font-bold ${item.active ? 'text-slate-800' : 'text-slate-500'}`}>{item.label}</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-all ${item.active ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${item.active ? 'right-0.5' : 'left-0.5'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                {currentLang === 'zh' ? '套餐可见性' : 'Package Visibility'}
              </h3>
              <div className="space-y-4">
                {[
                  { id: 'f', label: 'Foundation', active: true },
                  { id: 'p', label: 'Professional', active: true },
                  { id: 'e', label: 'Enterprise', active: true },
                  { id: 'fl', label: 'Flagship', active: true },
                ].map(pkg => (
                  <div key={pkg.id} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">{pkg.label}</span>
                    <input type="checkbox" defaultChecked={pkg.active} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                {currentLang === 'zh' ? '快速统计' : 'Quick Stats'}
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {currentLang === 'zh' ? 'ROI 贡献度' : 'ROI Contribution'}
                  </div>
                  <div className="text-xl font-bold text-slate-800">84%</div>
                  <div className="text-[10px] text-emerald-500 font-bold mt-1">
                    {currentLang === 'zh' ? '高价值影响' : 'High Impact'}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {currentLang === 'zh' ? '用户评分' : 'User Rating'}
                  </div>
                  <div className="text-xl font-bold text-slate-800">4.92/5</div>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(i => <i key={i} className="fas fa-star text-[8px] text-amber-400"></i>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 4) Bottom Panel: Logs & Evaluation */}
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
              {currentLang === 'zh' ? '运行日志与评测' : 'Running Logs & Evaluation'}
            </span>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {currentLang === 'zh' ? '最近 100 次调用:' : 'Recent 100 Calls:'}
              </span>
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
                  <div className="text-xs font-bold text-slate-700 truncate">
                    {currentLang === 'zh' ? '用户: "为什么 A-3 井的产量在下降？"' : 'User: "Why is production declining in well A-3?"'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {currentLang === 'zh' ? '状态:' : 'Status:'} <span className="text-emerald-500 font-bold">{currentLang === 'zh' ? '已完成' : 'Completed'}</span> • {currentLang === 'zh' ? '耗时:' : 'Latency:'} 1.2s • {currentLang === 'zh' ? '成本:' : 'Cost:'} $0.004
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                  <i className="fas fa-external-link-alt text-[10px]"></i>
                </button>
              </div>
            ))}
          </div>
          <div className="w-80 p-6 space-y-4 bg-slate-50/50">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {currentLang === 'zh' ? 'Top 失败技能' : 'Top Failure Skills'}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">{currentLang === 'zh' ? 'SQL 生成' : 'SQL Generation'}</span>
                <span className="text-xs font-bold text-rose-500">12%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: '12%' }}></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">{currentLang === 'zh' ? 'RAG 检索' : 'RAG Retrieval'}</span>
                <span className="text-xs font-bold text-amber-500">4%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: '4%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};
