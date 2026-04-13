
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { AdminAgentStudio } from './AdminAgentStudio';

interface AdminAgentManagementProps {
  lang: Language;
}

interface ManagedAgent {
  id: string;
  name: string;
  type: 'Leader' | 'Role' | 'Scenario' | 'General';
  version: 'Foundation' | 'Professional' | 'Enterprise' | 'Flagship';
  skillsCount: number;
  toolsCount: number;
  recentCalls: number;
  successRate: string;
  currentVersion: string;
  status: 'Published' | 'Draft' | 'Deprecated';
  updateTime: string;
  description: string;
  prompt: string;
  ioSchema: string;
  reasoningMode: string;
  tags: string[];
  industry: string;
}

const MOCK_MANAGED_AGENTS: ManagedAgent[] = [
  {
    id: 'agent-001',
    name: 'Leader Agent',
    type: 'Leader',
    version: 'Flagship',
    skillsCount: 12,
    toolsCount: 8,
    recentCalls: 12500,
    successRate: '98.5%',
    currentVersion: 'v2.4.0',
    status: 'Published',
    updateTime: '2024-05-20 10:00',
    description: '负责理解用户意图，拆解任务并分发给对应的数字专家。',
    prompt: '你是一个资深的石油行业专家，负责协调多个子智能体...',
    ioSchema: 'JSON Schema v7',
    reasoningMode: 'Chain-of-Thought',
    tags: ['Core', 'Routing'],
    industry: 'Oil & Gas'
  },
  {
    id: 'agent-002',
    name: '生产分析岗',
    type: 'Role',
    version: 'Enterprise',
    skillsCount: 5,
    toolsCount: 15,
    recentCalls: 8200,
    successRate: '96.2%',
    currentVersion: 'v1.8.2',
    status: 'Published',
    updateTime: '2024-05-19 15:30',
    description: '专注于油气田生产数据分析与异常诊断。',
    prompt: '你是一个生产分析工程师，擅长处理日产气量、压力等数据...',
    ioSchema: 'Structured Output',
    reasoningMode: 'ReAct',
    tags: ['Production', 'Analysis'],
    industry: 'Oil & Gas'
  },
  {
    id: 'agent-003',
    name: '产量下降诊断',
    type: 'Scenario',
    version: 'Professional',
    skillsCount: 3,
    toolsCount: 4,
    recentCalls: 4500,
    successRate: '94.8%',
    currentVersion: 'v1.2.0',
    status: 'Published',
    updateTime: '2024-05-18 09:15',
    description: '针对单井产量下降场景提供闭环诊断方案。',
    prompt: '当用户询问产量下降时，按照以下步骤进行诊断...',
    ioSchema: 'Workflow Schema',
    reasoningMode: 'Sequential',
    tags: ['Diagnosis', 'Well'],
    industry: 'Oil & Gas'
  },
  {
    id: 'agent-004',
    name: '智能问数',
    type: 'General',
    version: 'Foundation',
    skillsCount: 2,
    toolsCount: 10,
    recentCalls: 25000,
    successRate: '99.1%',
    currentVersion: 'v3.0.1',
    status: 'Published',
    updateTime: '2024-05-20 11:45',
    description: '通用型数据查询与统计助手。',
    prompt: '你是一个通用的 SQL 专家，能够根据自然语言生成查询语句...',
    ioSchema: 'SQL / Table',
    reasoningMode: 'Direct',
    tags: ['Data', 'SQL'],
    industry: 'Cross-Industry'
  }
];

export const AdminAgentManagement: React.FC<AdminAgentManagementProps> = ({ lang }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<ManagedAgent | null>(null);
  const [studioAgent, setStudioAgent] = useState<ManagedAgent | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'skills' | 'tools' | 'workflow' | 'mapping'>('basic');
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredAgents = useMemo(() => {
    return MOCK_MANAGED_AGENTS.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            agent.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !filterType || agent.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, filterType]);

  if (studioAgent) {
    return (
      <AdminAgentStudio 
        lang={lang} 
        agent={studioAgent} 
        onBack={() => setStudioAgent(null)} 
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* 1) Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-robot text-indigo-600"></i>
            Agent Console
          </h2>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input 
              type="text" 
              placeholder={lang === 'zh' ? '搜索智能体...' : 'Search agents...'}
              className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'Leader', label: 'Leader', icon: 'fa-crown' },
              { id: 'Role', label: lang === 'zh' ? '岗位' : 'Role', icon: 'fa-user-tie' },
              { id: 'Scenario', label: lang === 'zh' ? '场景' : 'Scenario', icon: 'fa-cube' },
              { id: 'General', label: lang === 'zh' ? '通用' : 'General', icon: 'fa-bolt' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setFilterType(filterType === item.id ? null : item.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  filterType === item.id 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <i className={`fas ${item.icon} text-[10px]`}></i>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100">
            <i className="fas fa-plus"></i>
            {lang === 'zh' ? '新建智能体' : 'New Agent'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* 3) Middle: Agent List Workbench */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">{lang === 'zh' ? '智能体名称' : 'Agent Name'}</th>
                    <th className="px-6 py-4">{lang === 'zh' ? '类型' : 'Type'}</th>
                    <th className="px-6 py-4">{lang === 'zh' ? '版本' : 'Version'}</th>
                    <th className="px-6 py-4 text-center">{lang === 'zh' ? '技能/工具' : 'Skills/Tools'}</th>
                    <th className="px-6 py-4">{lang === 'zh' ? '调用量' : 'Calls'}</th>
                    <th className="px-6 py-4">{lang === 'zh' ? '成功率' : 'Success'}</th>
                    <th className="px-6 py-4">{lang === 'zh' ? '状态' : 'Status'}</th>
                    <th className="px-6 py-4">{lang === 'zh' ? '更新时间' : 'Update Time'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAgents.map(agent => (
                    <tr 
                      key={agent.id} 
                      onClick={() => setSelectedAgent(agent)}
                      onDoubleClick={() => setStudioAgent(agent)}
                      className={`hover:bg-indigo-50/30 transition-colors cursor-pointer group ${selectedAgent?.id === agent.id ? 'bg-indigo-50/50' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
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
                            <div className="font-bold text-slate-800">{agent.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{agent.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-600">{agent.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          agent.version === 'Flagship' ? 'bg-violet-600 text-white' :
                          agent.version === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                          agent.version === 'Professional' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {agent.version}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xs text-slate-600 flex items-center gap-1" title="Skills">
                            <i className="fas fa-toolbox text-[10px] text-slate-400"></i>
                            {agent.skillsCount}
                          </span>
                          <span className="text-xs text-slate-600 flex items-center gap-1" title="Tools">
                            <i className="fas fa-tools text-[10px] text-slate-400"></i>
                            {agent.toolsCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-slate-600">{agent.recentCalls.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: agent.successRate }}></div>
                          </div>
                          <span className="text-xs font-bold text-emerald-600">{agent.successRate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-bold ${
                          agent.status === 'Published' ? 'text-emerald-600' : 
                          agent.status === 'Draft' ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            agent.status === 'Published' ? 'bg-emerald-500 animate-pulse' : 
                            agent.status === 'Draft' ? 'bg-amber-500' : 'bg-slate-400'
                          }`}></span>
                          {agent.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-400">{agent.updateTime}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5) Bottom: Running Observation Area */}
          <footer className="h-20 bg-white border-t border-slate-200 px-8 flex items-center justify-between flex-shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-12">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{lang === 'zh' ? '今日调用量' : "Today's Calls"}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-slate-800">42,850</span>
                  <span className="text-xs text-emerald-500 font-bold flex items-center">
                    <i className="fas fa-caret-up mr-1"></i> 12%
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{lang === 'zh' ? '平均耗时' : 'Avg Latency'}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-slate-800">1.2s</span>
                  <span className="text-xs text-emerald-500 font-bold flex items-center">
                    <i className="fas fa-caret-down mr-1"></i> 0.3s
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{lang === 'zh' ? 'Token 成本' : 'Token Cost'}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-slate-800">$124.50</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{lang === 'zh' ? '用户满意度' : 'Satisfaction'}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-slate-800">4.8/5.0</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{lang === 'zh' ? 'Top 失败原因' : 'Top Failures'}</span>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[10px] font-bold border border-rose-100">Tool Timeout (42%)</span>
                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[10px] font-bold border border-rose-100">Auth Error (18%)</span>
              </div>
            </div>
          </footer>
        </main>

        {/* 4) Right: Detail Configuration Drawer */}
        <AnimatePresence>
          {selectedAgent && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedAgent(null)}
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] z-30"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute right-0 top-0 bottom-0 w-[600px] bg-white shadow-2xl z-40 flex flex-col border-l border-slate-200"
              >
                {/* Drawer Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                      selectedAgent.type === 'Leader' ? 'bg-amber-100 text-amber-600' : 
                      selectedAgent.type === 'Role' ? 'bg-indigo-100 text-indigo-600' :
                      selectedAgent.type === 'Scenario' ? 'bg-purple-100 text-purple-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <i className={`fas ${
                        selectedAgent.type === 'Leader' ? 'fa-crown' : 
                        selectedAgent.type === 'Role' ? 'fa-user-tie' :
                        selectedAgent.type === 'Scenario' ? 'fa-cube' :
                        'fa-bolt'
                      }`}></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{selectedAgent.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400 font-mono">{selectedAgent.id}</span>
                        <span className="text-slate-200">•</span>
                        <span className="text-xs font-bold text-indigo-600">{selectedAgent.currentVersion}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedAgent(null)}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                  >
                    <i className="fas fa-times text-lg"></i>
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 border-b border-slate-100 bg-slate-50/50">
                  {[
                    { id: 'basic', label: lang === 'zh' ? '基础信息' : 'Basic Info' },
                    { id: 'skills', label: 'Skills' },
                    { id: 'tools', label: 'Tools' },
                    { id: 'workflow', label: 'Workflow' },
                    { id: 'mapping', label: 'Mapping' },
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-3 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                  {activeTab === 'basic' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '名称' : 'Name'}</label>
                        <input type="text" defaultValue={selectedAgent.name} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '描述' : 'Description'}</label>
                        <textarea defaultValue={selectedAgent.description} className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prompt</label>
                        <textarea defaultValue={selectedAgent.prompt} className="w-full h-48 bg-slate-900 text-indigo-100 font-mono text-xs rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">IO Schema</label>
                          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                            <option>{selectedAgent.ioSchema}</option>
                            <option>JSON Schema v7</option>
                            <option>Structured Output</option>
                            <option>Markdown Only</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '推理模式' : 'Reasoning Mode'}</label>
                          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                            <option>{selectedAgent.reasoningMode}</option>
                            <option>Chain-of-Thought</option>
                            <option>ReAct</option>
                            <option>Sequential</option>
                            <option>Direct</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'skills' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '已绑定技能包' : 'Bound Skills'}</h4>
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                          <i className="fas fa-plus-circle"></i> {lang === 'zh' ? '添加技能' : 'Add Skill'}
                        </button>
                      </div>
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between group hover:border-indigo-200 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                <i className="fas fa-toolbox text-sm"></i>
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-800">Skill Package #{i}</div>
                                <div className="text-[10px] text-slate-400">v1.2.0 • Updated 2d ago</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-slate-300 hover:text-slate-600"><i className="fas fa-cog"></i></button>
                              <button className="p-2 text-slate-300 hover:text-rose-500"><i className="fas fa-trash-alt"></i></button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">{lang === 'zh' ? '回退策略' : 'Fallback Strategy'}</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none">
                          <option>Retry with General Agent</option>
                          <option>Return Error Message</option>
                          <option>Human-in-the-loop</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activeTab === 'tools' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '工具权限' : 'Tool Permissions'}</h4>
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                          <i className="fas fa-plus-circle"></i> {lang === 'zh' ? '添加工具' : 'Add Tool'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {['DataQuery', 'ReportGen', 'ChartMaker', 'WebSearch', 'FileParser', 'EmailSender'].map(tool => (
                          <div key={tool} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-sm text-slate-700">{tool}</span>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">SLA (ms)</label>
                          <input type="number" defaultValue={5000} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '超时设置' : 'Timeout (s)'}</label>
                          <input type="number" defaultValue={30} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'workflow' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">{lang === 'zh' ? '调用链' : 'Call Chain'}</label>
                        <div className="bg-slate-900 rounded-2xl p-6 relative overflow-hidden">
                          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:20px_20px]"></div>
                          <div className="relative flex flex-col items-center gap-8">
                            <div className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20">Input</div>
                            <i className="fas fa-arrow-down text-slate-600"></i>
                            <div className="px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold">Reasoning</div>
                            <i className="fas fa-arrow-down text-slate-600"></i>
                            <div className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/20">Output</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">{lang === 'zh' ? '子智能体关系' : 'Sub-Agent Relationships'}</label>
                        <div className="space-y-2">
                          {['数据分析专家', '文档检索专家', '报告生成专家'].map(name => (
                            <div key={name} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-sm">
                              <span className="text-slate-700">{name}</span>
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Child</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2 pt-4 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Leader {lang === 'zh' ? '路由策略' : 'Routing Strategy'}</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none">
                          <option>Semantic Similarity</option>
                          <option>Keyword Matching</option>
                          <option>LLM Intent Analysis</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activeTab === 'mapping' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <h4 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '前台展示映射' : 'Frontend Mapping'}</h4>
                      <div className="space-y-4">
                        {[
                          { id: 'shelf', label: lang === 'zh' ? '右侧能力货架' : 'Right Capability Shelf', icon: 'fa-shopping-bag' },
                          { id: 'card', label: lang === 'zh' ? 'Workflow Card' : 'Workflow Card', icon: 'fa-id-card' },
                          { id: 'tree', label: lang === 'zh' ? '岗位任务树' : 'Role Task Tree', icon: 'fa-network-wired' },
                          { id: 'network', label: lang === 'zh' ? 'Agent Network' : 'Agent Network', icon: 'fa-project-diagram' },
                        ].map(item => (
                          <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 transition-all group cursor-pointer">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                <i className={`fas ${item.icon}`}></i>
                              </div>
                              <span className="text-sm font-bold text-slate-700">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Mapped</span>
                              <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-indigo-500 transition-all">
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 scale-0 group-hover:scale-100 transition-transform"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Drawer Footer */}
                <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
                  <button 
                    onClick={() => setStudioAgent(selectedAgent)}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all flex items-center gap-2"
                  >
                    <i className="fas fa-rocket"></i>
                    {lang === 'zh' ? '进入 Agent Studio' : 'Enter Studio'}
                  </button>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSelectedAgent(null)}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                    >
                      {lang === 'zh' ? '取消' : 'Cancel'}
                    </button>
                    <button 
                      onClick={() => {
                        alert(lang === 'zh' ? '保存成功' : 'Saved successfully');
                        setSelectedAgent(null);
                      }}
                      className="px-8 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                    >
                      {lang === 'zh' ? '保存配置' : 'Save Config'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
