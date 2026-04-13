
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, ToolEntry } from '../types';
import { AdminToolStudio } from './AdminToolStudio';

interface AdminToolManagementProps {
  lang: Language;
}

const MOCK_TOOLS: ToolEntry[] = [
  {
    id: 'tool-1',
    name: 'SQL 查询工具',
    type: 'Data',
    endpoint: 'https://api.petro.com/v1/query',
    method: 'POST',
    authType: 'Bearer',
    skillRefs: 24,
    workflowRefs: 15,
    successRate: '99.8%',
    p95Latency: '450ms',
    costPerCall: '$0.002',
    status: 'Active',
    description: '支持自然语言转 SQL 并执行结构化数据库查询。'
  },
  {
    id: 'tool-2',
    name: 'GeoMapX 渲染器',
    type: 'Geo',
    endpoint: 'https://geo.petro.com/render',
    method: 'POST',
    authType: 'API Key',
    skillRefs: 8,
    workflowRefs: 5,
    successRate: '98.5%',
    p95Latency: '1.2s',
    costPerCall: '$0.05',
    status: 'Active',
    description: '高性能地质图件渲染引擎，支持多井剖面与平面图。'
  },
  {
    id: 'tool-3',
    name: '报告生成引擎',
    type: 'Report',
    endpoint: 'https://report.petro.com/gen',
    method: 'POST',
    authType: 'OAuth2',
    skillRefs: 12,
    workflowRefs: 20,
    successRate: '96.2%',
    p95Latency: '5.5s',
    costPerCall: '$0.12',
    status: 'Degraded',
    description: '基于模板的自动化报告生成工具，支持 PDF/Word 导出。'
  },
  {
    id: 'tool-4',
    name: '审批流网关',
    type: 'Approval',
    endpoint: 'https://oa.petro.com/approve',
    method: 'PUT',
    authType: 'Bearer',
    skillRefs: 4,
    workflowRefs: 32,
    successRate: '100%',
    p95Latency: '200ms',
    costPerCall: '$0.001',
    status: 'Active',
    description: '对接企业 OA 系统，处理各类业务审批请求。'
  }
];

export const AdminToolManagement: React.FC<AdminToolManagementProps> = ({ lang }) => {
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTool, setDrawerTool] = useState<ToolEntry | null>(null);
  const [isSlaOpen, setIsSlaOpen] = useState(true);

  const categories = [
    { id: 'All', label: lang === 'zh' ? '全部工具' : 'All Tools', icon: 'fa-th' },
    { id: 'Data', label: 'Data Tools', icon: 'fa-database' },
    { id: 'Search', label: 'Search Tools', icon: 'fa-search' },
    { id: 'Geo', label: 'Geo Tools', icon: 'fa-map-marked-alt' },
    { id: 'Report', label: 'Report Tools', icon: 'fa-file-invoice' },
    { id: 'Notification', label: 'Notification Tools', icon: 'fa-bell' },
    { id: 'Approval', label: 'Approval Tools', icon: 'fa-check-double' },
    { id: 'External', label: 'External APIs', icon: 'fa-plug' },
  ];

  const filteredTools = MOCK_TOOLS.filter(t => activeCategory === 'All' || t.type === activeCategory);

  if (selectedToolId) {
    const tool = MOCK_TOOLS.find(t => t.id === selectedToolId);
    if (tool) {
      return <AdminToolStudio lang={lang} tool={tool} onBack={() => setSelectedToolId(null)} />;
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden relative">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800">
            {lang === 'zh' ? 'Tool Registry｜工具平台注册中心' : 'Tool Registry | Platform Assets'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input 
              type="text" 
              placeholder={lang === 'zh' ? '搜索工具资产...' : 'Search tools...'} 
              className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-xs w-64 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
            <i className="fas fa-plus"></i>
            {lang === 'zh' ? '注册新工具' : 'Register Tool'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Category Tree */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
          <div className="p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">
              {lang === 'zh' ? '工具分类' : 'Tool Categories'}
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

        {/* Middle: Registry List */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? 'Tool 名称' : 'Tool Name'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">API Endpoint</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '鉴权' : 'Auth'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usage</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">SLA (P95)</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cost</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '状态' : 'Status'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{lang === 'zh' ? '操作' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTools.map(tool => (
                    <tr 
                      key={tool.id} 
                      className="group hover:bg-indigo-50/30 transition-all cursor-pointer"
                      onClick={() => {
                        setDrawerTool(tool);
                        setIsDrawerOpen(true);
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                            tool.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            <i className="fas fa-plug"></i>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{tool.name}</div>
                            <div className="text-[10px] text-slate-400">{tool.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">{tool.method}</span>
                          <code className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">{tool.endpoint}</code>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-medium text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">{tool.authType}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-xs font-bold text-slate-800">{tool.skillRefs}</div>
                            <div className="text-[8px] text-slate-400 uppercase">Skills</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs font-bold text-slate-800">{tool.workflowRefs}</div>
                            <div className="text-[8px] text-slate-400 uppercase">Flows</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700">{tool.p95Latency}</span>
                          <span className="text-[10px] text-emerald-600 font-bold">({tool.successRate})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-slate-600">{tool.costPerCall}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            tool.status === 'Active' ? 'bg-emerald-500' : 
                            tool.status === 'Degraded' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}></div>
                          <span className="text-[10px] font-bold text-slate-600">{tool.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedToolId(tool.id);
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

          {/* Bottom: SLA & Cost Monitoring */}
          <motion.div 
            initial={false}
            animate={{ height: isSlaOpen ? '200px' : '48px' }}
            className="bg-white border-t border-slate-200 flex flex-col z-20 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]"
          >
            <button 
              onClick={() => setIsSlaOpen(!isSlaOpen)}
              className="h-12 px-8 flex items-center justify-between hover:bg-slate-50 transition-all group"
            >
              <div className="flex items-center gap-6">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <i className="fas fa-chart-bar text-indigo-500"></i>
                  {lang === 'zh' ? 'SLA 实时监控与成本分析' : 'SLA Runtime & Cost Analysis'}
                </span>
                <div className="h-4 w-px bg-slate-200"></div>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg QPS:</span>
                    <span className="text-xs font-bold text-slate-600">124.5</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Error Rate:</span>
                    <span className="text-xs font-bold text-rose-600">0.02%</span>
                  </div>
                </div>
              </div>
              <i className={`fas fa-chevron-${isSlaOpen ? 'down' : 'up'} text-slate-400 group-hover:text-indigo-600 transition-all`}></i>
            </button>
            <div className="flex-1 p-6 grid grid-cols-4 gap-6 overflow-hidden">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'zh' ? 'QPS 趋势' : 'QPS Trend'}</div>
                <div className="h-16 flex items-end gap-1">
                  {[30, 50, 40, 60, 80, 55, 70, 45, 65, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-indigo-200 rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'zh' ? '错误码分布' : 'Error Codes'}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]"><span className="text-slate-600">401 Unauthorized</span><span className="font-bold">62%</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-slate-600">504 Gateway Timeout</span><span className="font-bold">28%</span></div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'zh' ? '成本趋势' : 'Cost Trend'}</div>
                <div className="h-16 flex items-end gap-1">
                  {[20, 30, 25, 40, 50, 35, 45, 30, 40, 55].map((h, i) => (
                    <div key={i} className="flex-1 bg-emerald-200 rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'zh' ? '热点调用来源' : 'Top Callers'}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]"><span className="text-slate-600">Diagnosis Skill</span><span className="font-bold">45%</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-slate-600">Auto Report Flow</span><span className="font-bold">32%</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Right: API Config Drawer */}
        <AnimatePresence>
          {isDrawerOpen && drawerTool && (
            <motion.aside 
              initial={{ x: 450 }}
              animate={{ x: 0 }}
              exit={{ x: 450 }}
              className="w-[450px] bg-white border-l border-slate-200 flex flex-col flex-shrink-0 z-30 shadow-2xl"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800">{lang === 'zh' ? 'API 配置详情' : 'API Configuration'}</h3>
                <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-200">
                      <i className="fas fa-plug"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{drawerTool.name}</h4>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold uppercase">{drawerTool.status}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{drawerTool.description}</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Endpoint & Method</label>
                    <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs border border-slate-800 flex items-center gap-3">
                      <span className="text-indigo-400 font-bold">{drawerTool.method}</span>
                      <span className="text-slate-400 truncate">{drawerTool.endpoint}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Timeout</div>
                      <div className="text-sm font-bold text-slate-800">30s</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Retry</div>
                      <div className="text-sm font-bold text-slate-800">3 Times</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">熔断策略 (Circuit Breaker)</label>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex justify-between text-xs"><span className="text-slate-500">Threshold</span><span className="font-bold">5% Error</span></div>
                      <div className="flex justify-between text-xs"><span className="text-slate-500">Recovery</span><span className="font-bold">60s</span></div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">鉴权与权限 (Auth & Permission)</label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                        <span className="text-slate-600">Auth Type</span>
                        <span className="font-bold text-indigo-600">{drawerTool.authType}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                        <span className="text-slate-600">{lang === 'zh' ? '租户权限' : 'Tenant Permission'}</span>
                        <span className="text-emerald-600 font-bold">All Tenants</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">数据源白名单</label>
                    <div className="flex flex-wrap gap-2">
                      {['MySQL_Prod', 'ES_Logs', 'HDFS_Seismic'].map(ds => (
                        <span key={ds} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-medium">{ds}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex gap-3">
                <button 
                  onClick={() => setSelectedToolId(drawerTool.id)}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  {lang === 'zh' ? '进入 Studio' : 'Enter Studio'}
                </button>
                <button className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">
                  <i className="fas fa-cog"></i>
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
