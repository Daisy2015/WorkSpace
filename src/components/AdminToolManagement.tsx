
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, ToolEntry } from '../types';

interface AdminToolManagementProps {
  lang: Language;
}

const MOCK_TOOLS: ToolEntry[] = [
  {
    id: 'tool-1',
    name: '井信息查询 Tool',
    type: 'Data',
    endpoint: 'https://api.petro.com/v1/object/info',
    method: 'POST',
    authType: 'Bearer',
    skillRefs: 24,
    workflowRefs: 15,
    successRate: '99.8%',
    p95Latency: '450ms',
    costPerCall: '$0.002',
    status: 'Active',
    description: '查询石油天然气各类对象（如井、区块、层位）的基础静态属性信息。',
    createdAt: '2024-05-10 10:00',
    inputSchema: '{"type": "object", "properties": {"objectId": {"type": "string"}}}',
    outputSchema: '{"type": "object", "properties": {"name": {"type": "string"}, "type": {"type": "string"}}}'
  },
  {
    id: 'tool-2',
    name: '距离计算 Tool',
    type: 'Geo',
    endpoint: 'https://api.petro.com/v1/geo/distance',
    method: 'POST',
    authType: 'API Key',
    skillRefs: 8,
    workflowRefs: 5,
    successRate: '98.5%',
    p95Latency: '1.2s',
    costPerCall: '$0.05',
    status: 'Active',
    description: '计算两个地理坐标或对象之间的空间直线距离及方位角。',
    createdAt: '2024-05-12 14:30',
    inputSchema: '{"type": "object", "properties": {"fromId": {"type": "string"}, "toId": {"type": "string"}}}',
    outputSchema: '{"type": "object", "properties": {"distance": {"type": "number"}, "unit": {"type": "string"}}}'
  },
  {
    id: 'tool-3',
    name: '对比分析 Tool',
    type: 'Analysis',
    endpoint: 'https://api.petro.com/v1/object/compare',
    method: 'POST',
    authType: 'OAuth2',
    skillRefs: 12,
    workflowRefs: 20,
    successRate: '96.2%',
    p95Latency: '5.5s',
    costPerCall: '$0.12',
    status: 'Active',
    description: '对比多个同类对象的属性差异，支持差异项高亮显示。',
    createdAt: '2024-05-15 09:15',
    inputSchema: '{"type": "object", "properties": {"objectIds": {"type": "array", "items": {"type": "string"}}}}',
    outputSchema: '{"type": "object", "properties": {"diff": {"type": "array"}}}'
  },
  {
    id: 'tool-5',
    name: '压裂参数解析 Tool',
    type: 'NLP',
    endpoint: 'https://api.petro.com/v1/nlp/extract',
    method: 'POST',
    authType: 'Bearer',
    skillRefs: 15,
    workflowRefs: 10,
    successRate: '97.5%',
    p95Latency: '800ms',
    costPerCall: '$0.01',
    status: 'Active',
    description: '从非结构化文本中自动抽取压裂、钻井等关键技术参数。',
    createdAt: '2024-05-20 16:20',
    inputSchema: '{"type": "object", "properties": {"text": {"type": "string"}}}',
    outputSchema: '{"type": "object", "properties": {"parameters": {"type": "object"}}}'
  },
  {
    id: 'tool-6',
    name: '生产聚合 Tool',
    type: 'Data',
    endpoint: 'https://api.petro.com/v1/data/aggregate',
    method: 'POST',
    authType: 'Bearer',
    skillRefs: 5,
    workflowRefs: 8,
    successRate: '99.1%',
    p95Latency: '600ms',
    costPerCall: '$0.005',
    status: 'Active',
    description: '对多井生产数据进行时序聚合分析。',
    createdAt: '2024-05-21 09:00',
    inputSchema: '{"type": "object", "properties": {"wellIds": {"type": "array"}}}',
    outputSchema: '{"type": "object", "properties": {"aggregatedData": {"type": "object"}}}'
  },
  {
    id: 'tool-7',
    name: '压裂模拟 Tool',
    type: 'Simulation',
    endpoint: 'https://api.petro.com/v1/sim/frac',
    method: 'POST',
    authType: 'API Key',
    skillRefs: 3,
    workflowRefs: 12,
    successRate: '94.5%',
    p95Latency: '15s',
    costPerCall: '$2.50',
    status: 'Active',
    description: '基于物理模型进行压裂缝网扩展模拟。',
    createdAt: '2024-05-21 10:00',
    inputSchema: '{"type": "object", "properties": {"params": {"type": "object"}}}',
    outputSchema: '{"type": "object", "properties": {"mesh": {"type": "object"}}}'
  },
  {
    id: 'tool-8',
    name: '产量预测 Tool',
    type: 'AI',
    endpoint: 'https://api.petro.com/v1/ai/predict',
    method: 'POST',
    authType: 'Bearer',
    skillRefs: 10,
    workflowRefs: 25,
    successRate: '92.0%',
    p95Latency: '2.5s',
    costPerCall: '$0.50',
    status: 'Active',
    description: '利用机器学习模型预测单井压后产量。',
    createdAt: '2024-05-21 11:00',
    inputSchema: '{"type": "object", "properties": {"features": {"type": "object"}}}',
    outputSchema: '{"type": "object", "properties": {"forecast": {"type": "array"}}}'
  }
];

export const AdminToolManagement: React.FC<AdminToolManagementProps> = ({ lang }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTool, setDrawerTool] = useState<ToolEntry | null>(null);
  const [isSlaOpen, setIsSlaOpen] = useState(false);

  const filteredTools = MOCK_TOOLS.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden relative">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800">
            {lang === 'zh' ? '工具管理' : 'Tool Management'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input 
              type="text" 
              placeholder={lang === 'zh' ? '搜索工具...' : 'Search tools...'} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
        {/* Registry List - Sidebar Removed */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '工具名称' : 'Tool Name'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '描述' : 'Description'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '状态' : 'Status'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '修改人' : 'Modified By'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '最近更新' : 'Updated'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{lang === 'zh' ? '操作' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTools.map(tool => (
                    <tr 
                      key={tool.id} 
                      className="group hover:bg-indigo-50/30 transition-all"
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
                        <div className="text-xs text-slate-500 max-w-md truncate">{tool.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // In a real app, we'd update the state here
                          }}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                            tool.status === 'Active' ? 'bg-indigo-600' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              tool.status === 'Active' ? 'translate-x-6' : 'translate-x-1'
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
                      <td className="px-6 py-4 text-xs text-slate-500">{tool.updatedAt || tool.createdAt}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrawerTool(tool);
                              setIsDrawerOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                            title={lang === 'zh' ? '详情' : 'Details'}
                          >
                            <i className="fas fa-info-circle"></i>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle delete
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

          {/* Bottom Panel Removed or Simplified if needed, keeping it for now but closed by default */}
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
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'zh' ? '错误率' : 'Error Rate'}</div>
                <div className="text-2xl font-bold text-rose-500">0.02%</div>
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
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'zh' ? '平均延迟' : 'Avg Latency'}</div>
                <div className="text-2xl font-bold text-slate-800">450ms</div>
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
                <h3 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '工具详情' : 'Tool Details'}</h3>
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
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">API Endpoint</label>
                    <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs border border-slate-800 flex items-center gap-3">
                      <span className="text-indigo-400 font-bold">{drawerTool.method}</span>
                      <span className="text-slate-400 truncate">{drawerTool.endpoint}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">{lang === 'zh' ? '输入参数 (Input)' : 'Input Schema'}</label>
                    <div className="bg-slate-50 rounded-xl p-4 font-mono text-[10px] border border-slate-200 text-slate-600">
                      {drawerTool.inputSchema || '{}'}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">{lang === 'zh' ? '输出参数 (Output)' : 'Output Schema'}</label>
                    <div className="bg-slate-50 rounded-xl p-4 font-mono text-[10px] border border-slate-200 text-slate-600">
                      {drawerTool.outputSchema || '{}'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'zh' ? '鉴权方式' : 'Auth Type'}</div>
                      <div className="text-sm font-bold text-slate-800">{drawerTool.authType}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'zh' ? '创建时间' : 'Created At'}</div>
                      <div className="text-sm font-bold text-slate-800">{drawerTool.createdAt}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
