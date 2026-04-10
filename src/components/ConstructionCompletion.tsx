
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { translations } from '../i18n';

interface ConstructionCompletionProps {
  lang: Language;
  onConfirm: () => void;
}

interface ResourceItem {
  id: string;
  name: string;
  type: 'doc' | 'figure' | 'model' | 'data';
  serviceObject: string;
  mbu: string;
  sourceStage: string;
  extensionType: string;
  reason: string;
  status: 'kept' | 'removed';
}

interface TreeNode {
  id: string;
  label: string;
  type: 'object' | 'mbu' | 'mbu-child';
  children?: TreeNode[];
  impactCount: number;
  recommendedCount: number;
  sourceDistribution: { stage: string; count: number }[];
}

export const ConstructionCompletion: React.FC<ConstructionCompletionProps> = ({ lang, onConfirm }) => {
  const t = translations[lang];
  
  const [selectedNodeId, setSelectedNodeId] = useState<string>('exploration');
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<string | null>(null);

  // Mock Data
  const summary = {
    core: '钻井',
    extended: '勘探 / 开发 / 生产',
    mbuNodes: 8,
    resources: 8,
    sources: [
      { label: lang === 'zh' ? '模板' : 'Template', count: 28, color: 'bg-blue-500' },
      { label: lang === 'zh' ? 'I/O补全' : 'I/O', count: 16, color: 'bg-purple-500' },
      { label: lang === 'zh' ? '子图' : 'Subgraph', count: 22, color: 'bg-indigo-500' },
      { label: lang === 'zh' ? '类比' : 'Analogy', count: 20, color: 'bg-emerald-500' },
    ]
  };

  const [treeData] = useState<TreeNode[]>([
    {
      id: 'public',
      label: lang === 'zh' ? '公共业务 (384)' : 'Public Business (384)',
      type: 'object',
      impactCount: 384,
      recommendedCount: 0,
      sourceDistribution: []
    },
    {
      id: 'exploration',
      label: lang === 'zh' ? '勘探 (95)' : 'Exploration (95)',
      type: 'object',
      impactCount: 95,
      recommendedCount: 12,
      sourceDistribution: [],
      children: [
        { id: 'exp-op', label: lang === 'zh' ? '勘探-作业 (15)' : 'Exploration-Operation (15)', type: 'object', impactCount: 15, recommendedCount: 2, sourceDistribution: [] },
        { id: 'exp-res', label: lang === 'zh' ? '勘探-研究 (52)' : 'Exploration-Research (52)', type: 'object', impactCount: 52, recommendedCount: 5, sourceDistribution: [] },
        {
          id: 'exp-mgmt',
          label: lang === 'zh' ? '勘探-管理 (28)' : 'Exploration-Management (28)',
          type: 'object',
          impactCount: 28,
          recommendedCount: 5,
          sourceDistribution: [],
          children: [
            { id: 'exp-mgmt-trap', label: lang === 'zh' ? '勘探-管理-圈闭 (12)' : 'Trap (12)', type: 'object', impactCount: 12, recommendedCount: 1, sourceDistribution: [] },
            { id: 'exp-mgmt-uncon', label: lang === 'zh' ? '勘探-管理-非常规油气区 (11)' : 'Unconventional (11)', type: 'object', impactCount: 11, recommendedCount: 1, sourceDistribution: [] },
            { id: 'exp-mgmt-field', label: lang === 'zh' ? '勘探-管理-油气田 (0)' : 'Oil/Gas Field (0)', type: 'object', impactCount: 0, recommendedCount: 0, sourceDistribution: [] },
            { id: 'exp-mgmt-org', label: lang === 'zh' ? '勘探-管理-组织机构 (0)' : 'Organization (0)', type: 'object', impactCount: 0, recommendedCount: 0, sourceDistribution: [] },
            { id: 'exp-mgmt-block', label: lang === 'zh' ? '勘探-管理-区块 (0)' : 'Block (0)', type: 'object', impactCount: 0, recommendedCount: 0, sourceDistribution: [] },
            { id: 'exp-mgmt-wellbore', label: lang === 'zh' ? '勘探-管理-井筒 (5)' : 'Wellbore (5)', type: 'object', impactCount: 5, recommendedCount: 1, sourceDistribution: [] },
            { id: 'exp-mgmt-well', label: lang === 'zh' ? '勘探-管理-井 (0)' : 'Well (0)', type: 'object', impactCount: 0, recommendedCount: 0, sourceDistribution: [] },
            { id: 'exp-mgmt-sample', label: lang === 'zh' ? '勘探-管理-样品 (0)' : 'Sample (0)', type: 'object', impactCount: 0, recommendedCount: 0, sourceDistribution: [] },
          ]
        }
      ]
    },
    {
      id: 'exp-biz',
      label: lang === 'zh' ? '勘探-经营 (0)' : 'Exploration-Business (0)',
      type: 'object',
      impactCount: 0,
      recommendedCount: 0,
      sourceDistribution: []
    },
    {
      id: 'dev-prod',
      label: lang === 'zh' ? '开发生产 (171)' : 'Development & Production (171)',
      type: 'object',
      impactCount: 171,
      recommendedCount: 15,
      sourceDistribution: []
    }
  ]);

  const [resources, setResources] = useState<any[]>([
    { id: 1, node: '单井钻井地质设计井基础信息记录', dataset: '单井钻井地质设计基本数据表' },
    { id: 2, node: '井筒钻井地质总结_建议编制', dataset: '钻井地质总结建议描述' },
    { id: 3, node: '井筒钻井地质总结_结论编制', dataset: '钻井地质总结结论描述' },
    { id: 4, node: '井筒钻井地质总结_结论与建议编制', dataset: '钻井地质总结结论与建议描述' },
    { id: 5, node: '录井跟踪钻井地质日报总结', dataset: '钻井地质日报' },
    { id: 6, node: '录井跟踪钻井地质作业动态记录', dataset: '钻井地质作业动态表' },
    { id: 7, node: '钻井地质设计技术总结', dataset: '钻井地质设计报告' },
    { id: 8, node: '钻井地质总结报告_引言编制', dataset: '钻井地质总结报告引言' },
  ]);

  const filteredResources = useMemo(() => {
    if (!filterSource) return resources;
    return resources.filter(r => r.sourceStage.includes(filterSource));
  }, [resources, filterSource]);

  const selectedResource = useMemo(() => 
    resources.find(r => r.id === selectedResourceId), 
  [resources, selectedResourceId]);

  const renderTree = (nodes: TreeNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id} className="flex flex-col">
        <div 
          className={`group flex items-center gap-2 py-2 px-3 rounded-xl cursor-pointer transition-all relative ${selectedNodeId === node.id ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' : 'hover:bg-slate-50 text-slate-600'}`}
          onClick={() => setSelectedNodeId(node.id)}
          style={{ marginLeft: `${level * 16}px` }}
        >
          <i className={`fas ${node.type === 'object' ? 'fa-cube text-purple-400' : 'fa-project-diagram text-blue-400'} text-xs`}></i>
          <span className="text-sm font-medium flex-1 truncate">{node.label}</span>
          
          {/* Hover Stats Tooltip */}
          <div className="hidden group-hover:flex items-center gap-2 ml-2">
             <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded" title="Impact Count">{node.impactCount}</span>
             <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded" title="Recommended Count">+{node.recommendedCount}</span>
          </div>

          {/* Advanced Hover Preview */}
          <div className="absolute left-full ml-2 top-0 z-50 hidden group-hover:block w-48 p-3 bg-white border border-slate-200 rounded-xl shadow-xl pointer-events-none">
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{lang === 'zh' ? '范围预览' : 'Scope Preview'}</div>
             <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                   <span className="text-slate-500">{lang === 'zh' ? '影响资源' : 'Impacted'}</span>
                   <span className="font-bold text-slate-800">{node.impactCount}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                   <span className="text-slate-500">{lang === 'zh' ? '推荐新增' : 'Recommended'}</span>
                   <span className="font-bold text-green-600">+{node.recommendedCount}</span>
                </div>
                {node.sourceDistribution.length > 0 && (
                   <div className="pt-2 border-t border-slate-100">
                      <div className="text-[9px] font-bold text-slate-400 mb-1 uppercase">{lang === 'zh' ? '来源分布' : 'Sources'}</div>
                      {node.sourceDistribution.map((sd, i) => (
                         <div key={i} className="flex justify-between text-[10px]">
                            <span className="text-slate-500">{sd.stage}</span>
                            <span className="font-mono text-slate-700">{sd.count}</span>
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </div>
        </div>
        {node.children && renderTree(node.children, level + 1)}
      </div>
    ));
  };

  const selectedNode = useMemo(() => {
    const findNode = (nodes: TreeNode[]): TreeNode | undefined => {
      for (const node of nodes) {
        if (node.id === selectedNodeId) return node;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
    };
    return findNode(treeData);
  }, [treeData, selectedNodeId]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 text-slate-900 overflow-hidden font-sans">
      
      {/* Top: Space Scope Summary Bar */}
      <div className="h-20 bg-white border-b border-slate-200 flex items-center px-8 gap-12 shadow-sm z-20">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '空间范围摘要' : 'Space Scope Summary'}</span>
            <div className="h-4 w-px bg-slate-200 mx-2" />
            <span className="text-sm font-bold text-slate-800">{summary.core} × {lang === 'zh' ? '地质设计' : 'Geo Design'} × {lang === 'zh' ? '方案对比' : 'Plan Comp'}</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors">
              <span className="text-xs text-slate-500">{lang === 'zh' ? '对象范围' : 'Objects'}:</span>
              <span className="text-sm font-bold text-blue-600">12</span>
            </button>
            <button className="flex items-center gap-1.5 hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors">
              <span className="text-xs text-slate-500">{lang === 'zh' ? 'MBU范围' : 'MBUs'}:</span>
              <span className="text-sm font-bold text-indigo-600">{summary.mbuNodes}</span>
            </button>
            <button className="flex items-center gap-1.5 hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors">
              <span className="text-xs text-slate-500">{lang === 'zh' ? '资源范围' : 'Resources'}:</span>
              <span className="text-sm font-bold text-emerald-600">{summary.resources}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'zh' ? '来源分布' : 'Sources'}:</span>
          <div className="flex items-center gap-2">
            {summary.sources.map((s, idx) => (
              <button 
                key={idx}
                onClick={() => setFilterSource(filterSource === s.label ? null : s.label)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${filterSource === s.label ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:border-slate-400'}`}
              >
                <div className={`w-2 h-2 rounded-full ${s.color}`} />
                <span className="text-[11px] font-bold">{s.label}</span>
                <span className={`text-[10px] font-mono ${filterSource === s.label ? 'text-slate-400' : 'text-slate-500'}`}>{s.count}</span>
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={onConfirm}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
        >
          {lang === 'zh' ? '确认并进入空间' : 'Confirm & Enter Workspace'}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        
        {/* Left: Scope Definition Tree */}
        <div className="w-80 flex flex-col bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {lang === 'zh' ? '范围定义树' : 'Scope Definition Tree'}
              </h3>
              <button className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                <i className="fas fa-plus text-[10px]"></i>
              </button>
            </div>
            {/* Search Bar */}
            <div className="relative">
              <input 
                type="text" 
                placeholder={lang === 'zh' ? '钻井' : 'Drilling'} 
                className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400">
                <i className="fas fa-times-circle text-xs cursor-pointer hover:text-slate-600"></i>
                <i className="fas fa-search text-xs"></i>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {renderTree(treeData)}
          </div>

          {/* Node Recommendation Footer (Dynamic) */}
          <div className="p-4 bg-slate-50 border-t border-slate-100">
             <div className="flex items-center gap-2 mb-3">
                <i className="fas fa-sparkles text-blue-500 text-xs"></i>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {selectedNode?.type === 'object' ? (lang === 'zh' ? '对象扩展推荐' : 'Object Expansion') : (lang === 'zh' ? 'MBU扩展推荐' : 'MBU Expansion')}
                </span>
             </div>
             <div className="flex flex-col gap-2">
                {selectedNode?.type === 'object' ? (
                  <>
                    <button className="text-left px-3 py-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 hover:border-blue-400 transition-all flex items-center justify-between group">
                       <span>{lang === 'zh' ? '推荐更多邻井' : 'More Neighbors'}</span>
                       <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">+4</span>
                    </button>
                    <button className="text-left px-3 py-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 hover:border-blue-400 transition-all flex items-center justify-between group">
                       <span>{lang === 'zh' ? '同层位井推荐' : 'Same Stratum Wells'}</span>
                       <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">+2</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="text-left px-3 py-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 hover:border-blue-400 transition-all flex items-center justify-between group">
                       <span>{lang === 'zh' ? '上游输入节点推荐' : 'Upstream Nodes'}</span>
                       <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">+3</span>
                    </button>
                    <button className="text-left px-3 py-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 hover:border-blue-400 transition-all flex items-center justify-between group">
                       <span>{lang === 'zh' ? '下游产出节点推荐' : 'Downstream Nodes'}</span>
                       <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">+2</span>
                    </button>
                  </>
                )}
             </div>
          </div>
        </div>

        {/* Right: Resource Scope Confirmation Center */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          
          {/* Horizontal Scopes Display */}
          <div className="flex items-center gap-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <i className="fas fa-cube text-lg"></i>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'zh' ? '对象范围' : 'Object Scope'}</div>
                <div className="text-sm font-bold text-slate-800">钻井 × 井筒 × 井</div>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <i className="fas fa-project-diagram text-lg"></i>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'zh' ? 'MBU范围' : 'MBU Scope'}</div>
                <div className="text-sm font-bold text-slate-800">勘探管理-井筒 × 钻井地质</div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            {/* Filter Bar */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 whitespace-nowrap">{lang === 'zh' ? '数据集名称' : 'Dataset Name'}</span>
                  <input 
                    type="text" 
                    defaultValue="钻井地质" 
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-48"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 whitespace-nowrap">{lang === 'zh' ? '数据层次' : 'Data Level'}</span>
                  <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-40 appearance-none">
                    <option>{lang === 'zh' ? '请选择' : 'Select'}</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 whitespace-nowrap">{lang === 'zh' ? '数据类型' : 'Data Type'}</span>
                  <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-40 appearance-none">
                    <option>{lang === 'zh' ? '请选择' : 'Select'}</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                    {lang === 'zh' ? '查询' : 'Search'}
                  </button>
                  <button className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
                    {lang === 'zh' ? '重置' : 'Reset'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-20">{lang === 'zh' ? '序号' : 'No.'}</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '最小业务节点' : 'MBU'}</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '业务数据集名称' : 'Dataset Name'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {resources.map((res, idx) => (
                      <tr 
                        key={res.id} 
                        className={`hover:bg-blue-50/30 transition-colors cursor-pointer ${idx % 2 === 1 ? 'bg-slate-50/20' : ''} ${idx === 3 ? 'bg-blue-50/50' : ''}`}
                      >
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">{res.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">{res.node}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{res.dataset}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bottom: Secondary Recommendation Panel (Deep Recommendations) */}
          <AnimatePresence>
            {selectedResourceId && (
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="h-72 bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col"
              >
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                      <i className="fas fa-sparkles text-xs"></i>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">{lang === 'zh' ? '单资源深度推荐' : 'Deep Recommendations'}</h3>
                      <p className="text-[10px] text-slate-500 font-medium">{lang === 'zh' ? '基于' : 'Based on'} "{selectedResource?.name}" {lang === 'zh' ? '的关联发现' : 'discovery'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                        <button className="hover:text-blue-600 transition-colors uppercase tracking-wider">{lang === 'zh' ? '同对象版本' : 'Versions'}</button>
                        <button className="hover:text-blue-600 transition-colors uppercase tracking-wider">{lang === 'zh' ? '上下游成果' : 'I/O Results'}</button>
                        <button className="hover:text-blue-600 transition-colors uppercase tracking-wider">{lang === 'zh' ? '相似井成果' : 'Similar Wells'}</button>
                     </div>
                     <div className="h-4 w-px bg-slate-200 mx-2" />
                     <button 
                       onClick={() => setSelectedResourceId(null)}
                       className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                     >
                       <i className="fas fa-times"></i>
                     </button>
                  </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                  <div className="flex-1 overflow-x-auto p-4 flex gap-4 custom-scrollbar">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-72 shrink-0 p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:border-blue-300 transition-all flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                            <i className="fas fa-file-alt text-sm"></i>
                          </div>
                          <div className="flex-1">
                            <h5 className="text-[11px] font-bold text-slate-800 truncate">邻井历史日报_2023Q4.pdf</h5>
                            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">{lang === 'zh' ? '同对象不同版本' : 'Different Version'}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 bg-white/50 p-2 rounded-lg border border-slate-100">
                           <div className="flex items-center gap-2">
                             <span className="text-[9px] font-bold text-slate-400 w-12">{lang === 'zh' ? '推荐来源' : 'Source'}:</span>
                             <span className="text-[9px] text-blue-600 font-bold">{lang === 'zh' ? '第二阶段 I/O推理' : 'Stage 2 I/O'}</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="text-[9px] font-bold text-slate-400 w-12">{lang === 'zh' ? '扩展类型' : 'Type'}:</span>
                             <span className="text-[9px] text-slate-600 font-bold">{lang === 'zh' ? '下游产出补全' : 'Downstream Output'}</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="text-[9px] font-bold text-slate-400 w-12">{lang === 'zh' ? '服务节点' : 'Service'}:</span>
                             <span className="text-[9px] text-slate-600 font-bold">{lang === 'zh' ? '方案设计' : 'Plan Design'}</span>
                           </div>
                        </div>
                        <div className="mt-auto flex gap-2">
                          <button className="flex-1 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 transition-all">
                            {lang === 'zh' ? '单个加入' : 'Add'}
                          </button>
                          <button className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 transition-all">
                            <i className="fas fa-bookmark text-[10px]"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
