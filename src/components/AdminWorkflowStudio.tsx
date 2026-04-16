
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, WorkflowEntry } from '../types';

interface AdminWorkflowStudioProps {
  lang: Language;
  workflow: WorkflowEntry;
  onBack: () => void;
}

interface WorkflowNode {
  id: string;
  name: string;
  icon: string;
  parentId?: string;
}

const INITIAL_NODES: WorkflowNode[] = [
  { id: 'n1', name: '节点1：目标井上下文加载', icon: 'fa-database' },
  { id: 'n2', name: '节点2：区块层位过滤', icon: 'fa-filter' },
  { id: 'n3', name: '节点3：空间邻井发现', icon: 'fa-map-marker-alt' },
  { id: 'n4', name: '节点4：储层属性相似性评分', icon: 'fa-chart-line' },
  { id: 'n5', name: '节点5：生产有效井过滤', icon: 'fa-check-circle' },
  { id: 'n6', name: '节点6：生产表现排序', icon: 'fa-sort-amount-down' },
  { id: 'n7', name: '节点7：最佳井参数抽取', icon: 'fa-file-export' },
  { id: 'n8', name: '节点8：新井推荐参数生成', icon: 'fa-magic' },
];

const MOCK_TOOLS = ['对象基本信息查询', '空间距离计算', '指标数据查询', '参数抽取'];
const MOCK_SKILLS = ['地震剖面识别', '邻井发现', '储层相似性评分', '生产评价'];

export const AdminWorkflowStudio: React.FC<AdminWorkflowStudioProps> = ({ lang, workflow, onBack }) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>(INITIAL_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(INITIAL_NODES[0].id);
  const [processingMethod, setProcessingMethod] = useState<'Component' | 'Software' | 'LLM' | 'Tool' | 'Skill'>('LLM');

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const handleAddNode = (parentId?: string) => {
    const newNode: WorkflowNode = {
      id: `n-${Date.now()}`,
      name: lang === 'zh' ? '新节点' : 'New Node',
      icon: parentId ? 'fa-level-up-alt fa-rotate-90' : 'fa-circle',
      parentId
    };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const handleDeleteNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodes.length <= 1) return;
    
    const getIdsToDelete = (nodeId: string): string[] => {
      const children = nodes.filter(n => n.parentId === nodeId);
      return [nodeId, ...children.flatMap(c => getIdsToDelete(c.id))];
    };

    const idsToDelete = getIdsToDelete(id);
    const newNodes = nodes.filter(n => !idsToDelete.includes(n.id));
    
    setNodes(newNodes);
    if (idsToDelete.includes(selectedNodeId)) {
      setSelectedNodeId(newNodes[0].id);
    }
  };

  const renderNodes = (parentId?: string, level = 0) => {
    return nodes
      .filter(n => n.parentId === parentId)
      .map(node => (
        <React.Fragment key={node.id}>
          <div className="relative group">
            <button
              onClick={() => setSelectedNodeId(node.id)}
              style={{ paddingLeft: `${level * 16 + 12}px` }}
              className={`w-full flex items-center gap-2 py-2 pr-3 rounded-lg text-[11px] font-medium transition-all text-left ${
                selectedNodeId === node.id 
                ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100' 
                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${selectedNodeId === node.id ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                <i className={`fas ${node.icon} text-[9px]`}></i>
              </div>
              <span className="flex-1 truncate">{node.name}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                {!node.parentId && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAddNode(node.id); }}
                    className="w-4 h-4 rounded hover:bg-indigo-100 hover:text-indigo-600 flex items-center justify-center"
                    title={lang === 'zh' ? '添加子节点' : 'Add Child'}
                  >
                    <i className="fas fa-plus text-[7px]"></i>
                  </button>
                )}
                <button 
                  onClick={(e) => handleDeleteNode(node.id, e)}
                  className="w-4 h-4 rounded hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center"
                  title={lang === 'zh' ? '删除' : 'Delete'}
                >
                  <i className="fas fa-times text-[8px]"></i>
                </button>
              </div>
            </button>
          </div>
          {renderNodes(node.id, level + 1)}
        </React.Fragment>
      ));
  };

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
              <div className="flex items-center gap-1.5 ml-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{workflow.status}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">{workflow.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            {lang === 'zh' ? '保存草稿' : 'Save Draft'}
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
            <i className="fas fa-rocket"></i>
            {lang === 'zh' ? '发布模板' : 'Publish'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Node Tree */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              {lang === 'zh' ? '流程节点目录' : 'Workflow Nodes'}
            </div>
            <button 
              onClick={() => handleAddNode()}
              className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all"
              title={lang === 'zh' ? '添加节点' : 'Add Node'}
            >
              <i className="fas fa-plus text-[8px]"></i>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
            {renderNodes()}
          </div>
        </aside>

        {/* Right: Node Detail Editor */}
        <main className="flex-1 bg-slate-50 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                    <i className={`fas ${selectedNode?.icon}`}></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{selectedNode?.name}</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">Node Configuration</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">关联最小业务节点</label>
                    <input 
                      type="text" 
                      placeholder="选择或输入业务节点名称..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">处理方式</label>
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                      {[
                        { id: 'Component', label: '组件' },
                        { id: 'Software', label: '专业软件' },
                        { id: 'Tool', label: '工具' },
                        { id: 'Skill', label: '技能包' },
                        { id: 'LLM', label: '大模型' }
                      ].map(method => (
                        <button
                          key={method.id}
                          onClick={() => setProcessingMethod(method.id as any)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            processingMethod === method.id 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Input/Output */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">输入成果</label>
                    <div className="min-h-[100px] bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 text-[10px] text-slate-600 font-bold">
                        <span>井位坐标数据.json</span>
                        <i className="fas fa-times cursor-pointer hover:text-rose-500"></i>
                      </div>
                      <button className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-[10px] text-slate-400 hover:bg-white hover:border-indigo-300 hover:text-indigo-500 transition-all">
                        + 添加输入成果
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">输出成果</label>
                    <div className="min-h-[100px] bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 text-[10px] text-slate-600 font-bold">
                        <span>邻井筛选结果.csv</span>
                        <i className="fas fa-times cursor-pointer hover:text-rose-500"></i>
                      </div>
                      <button className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-[10px] text-slate-400 hover:bg-white hover:border-indigo-300 hover:text-indigo-500 transition-all">
                        + 添加输出成果
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dynamic Parameters */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-sliders-h text-indigo-500"></i>
                    处理参数配置
                  </h4>
                  
                  {processingMethod === 'LLM' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">选择模型</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                          <option>Gemini 1.5 Pro (Petroleum Optimized)</option>
                          <option>GPT-4o</option>
                          <option>Claude 3.5 Sonnet</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">处理指令 (Prompt)</label>
                        <textarea 
                          className="w-full h-48 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-indigo-100 font-mono placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                          placeholder="请输入大模型处理指令，例如：基于输入的邻井列表，结合储层厚度、渗透率等参数，计算相似性评分..."
                        />
                      </div>
                    </div>
                  )}

                  {processingMethod === 'Component' && (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">组件名称</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                          <option>空间距离计算组件</option>
                          <option>数据清洗组件</option>
                          <option>格式转换组件</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">超时时间 (s)</label>
                        <input type="number" defaultValue={30} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                      </div>
                    </div>
                  )}

                  {processingMethod === 'Tool' && (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">选择工具</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                          {MOCK_TOOLS.map(tool => <option key={tool}>{tool}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">调用参数 (JSON)</label>
                        <input type="text" placeholder='{"key": "value"}' className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                      </div>
                    </div>
                  )}

                  {processingMethod === 'Skill' && (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">选择技能包</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                          {MOCK_SKILLS.map(skill => <option key={skill}>{skill}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">执行优先级</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                          <option>High</option>
                          <option>Medium</option>
                          <option>Low</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all">
                {lang === 'zh' ? '重置节点' : 'Reset Node'}
              </button>
              <button className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                {lang === 'zh' ? '保存节点配置' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
