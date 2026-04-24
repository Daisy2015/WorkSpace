
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
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

interface BusinessNode {
  id: string;
  name: string;
  inputs: string[];
  outputs: string[];
  method: string;
  skillDescription: string;
}

const BUSINESS_NODES: BusinessNode[] = [
  {
    id: 'b1',
    name: '井基本信息',
    inputs: ['钻井设计书', '完井报告', '井身结构图', '录井资料', '井表'],
    outputs: ['井基本信息结构化数据'],
    method: '文档解析 + 结构化数据库读取',
    skillDescription: `# ✅ Skill名称

**井基本信息节点解析与语义描述 Skill**

---

# ✅ 一句话定义

对“井基本信息”节点进行结构化语义建模，完整描述其数据构成、来源、用途及可计算能力，为智能体提供标准化理解基础。

---

# ✅ Skill作用（系统视角）

用于把“井基本信息”从一个**静态节点**，转化为一个**可被大模型理解与调用的结构化数据对象**，支撑：

* 智能问数（问井相关问题）
* 报告生成（自动填充基础信息）
* 邻井分析（筛选对比对象）
* 参数推荐（作为基础约束条件）
* 数据校核（基础字段一致性校验）

---

# ✅ Skill核心能力拆解

### 1️⃣ 节点语义定义能力

明确该节点在整个工作空间中的定位：

* 属于：基础数据节点 / 元信息节点
* 粒度：井级
* 生命周期：全流程长期有效
* 是否可被引用：✅ 强引用节点

---

### 2️⃣ 成果资料挂载与解析能力

#### 📂 关联成果资料类型（示例）

* 钻井设计书
* 完井报告
* 井身结构图
* 录井资料
* 基础数据库表（井表）

#### 📑 每类资料需描述：

| 维度    | 内容               |
| ----- | ---------------- |
| 资料名称  | 如：钻井设计书          |
| 数据类型  | 文档 / 表格 / 图件     |
| 来源系统  | 如：勘探开发数据库 / 人工上传 |
| 更新方式  | 自动同步 / 人工维护      |
| 可信度等级 | 高 / 中 / 低        |

---

### 3️⃣ 数据项结构定义（核心）

#### 📊 数据项分类

**（1）基础属性类**

* 井名
* 井号
* 所属区块
* 井型（直井 / 定向井 / 水平井）
* 完井方式

**（2）空间位置类**

* 经度
* 纬度
* 构造位置
* 埋深

**（3）时间类**

* 开钻日期
* 完钻日期
* 投产日期

**（4）工程参数类**

* 设计井深
* 实际井深
* 水平段长度

---

#### 📌 每个数据项需描述（关键）

| 属性    | 示例          |
| ----- | ----------- |
| 字段名称  | well_depth  |
| 中文名称  | 井深          |
| 数据类型  | 数值          |
| 单位    | m           |
| 来源    | 钻井设计书 / 数据库 |
| 生成方式  | 文档解析 / 系统写入 |
| 是否可缺失 | 否           |
| 质量要求  | 精度±1m       |
| 用途    | 压裂设计 / 邻井筛选 |

---

### 4️⃣ 数据来源与生产路径（非常关键）

描述数据是**怎么来的**：

#### 🔄 数据产生路径类型：

* 文档解析（NLP抽取）
* 结构化数据库读取
* 人工录入
* 计算生成（如井深差）

#### 示例表达：

> 井深字段优先来源于数据库井表，如缺失则从钻井设计书中通过文档解析获取。

---

### 5️⃣ 数据使用场景（给大模型看的重点）

明确告诉模型：**这些数据可以用来干什么**

#### 🎯 可支撑场景：

* 邻井优选

  * 条件筛选：井型 + 深度 + 区块
* 压裂参数推荐

  * 作为约束条件（深度、水平段长度）
* 报告生成

  * 自动填充“井基本情况”章节
* 风险分析

  * 判断异常井（超深井、异常井型）

---

### 6️⃣ 规则与约束（可选但建议有）

#### ⚠️ 示例规则：

* 井深必须 > 0
* 完钻日期 ≥ 开钻日期
* 水平段长度 ≤ 总井深

用于：
👉 报告校核
👉 数据质量控制

---

### 7️⃣ 对外能力（给Agent调用）

这个 Skill 对外提供的能力应该是：

#### 🧠 可调用接口（逻辑层）

* 获取井基础信息（结构化输出）
* 按条件筛选井
* 获取某字段来源说明
* 校验井信息完整性`
  },
  {
    id: 'b2',
    name: '测井曲线处理',
    inputs: ['LAS/DLIS原始数据'],
    outputs: ['数字化曲线', '曲线解释结果'],
    method: '深度对齐 + 曲线标准化',
    skillDescription: '# ✅ Skill名称\n\n**测井曲线自动化处理与标准化 Skill**\n\n...'
  },
  {
    id: 'b3',
    name: '地震构造解释',
    inputs: ['SEGY数据', '层位框架'],
    outputs: ['构造图', '断层模型'],
    method: '深度学习识别 + 专家修正',
    skillDescription: '# ✅ Skill名称\n\n**地震智能解释与其空间建模 Skill**\n\n...'
  }
];

export const AdminWorkflowStudio: React.FC<AdminWorkflowStudioProps> = ({ lang, workflow, onBack }) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>(INITIAL_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(INITIAL_NODES[0].id);
  const [processingMethod, setProcessingMethod] = useState<'Component' | 'Software' | 'LLM' | 'Tool' | 'Skill'>('LLM');
  const [selectedBusinessNodeId, setSelectedBusinessNodeId] = useState<string>('');
  const [isEditingSkill, setIsEditingSkill] = useState(false);
  const [currentSkillDesc, setCurrentSkillDesc] = useState('');

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selectedBusinessNode = BUSINESS_NODES.find(b => b.id === selectedBusinessNodeId);

  const handleBusinessNodeChange = (id: string) => {
    setSelectedBusinessNodeId(id);
    const bNode = BUSINESS_NODES.find(b => b.id === id);
    if (bNode) {
      setCurrentSkillDesc(bNode.skillDescription);
    } else {
      setCurrentSkillDesc('');
    }
  };

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
                    <select 
                      value={selectedBusinessNodeId}
                      onChange={(e) => handleBusinessNodeChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                      <option value="">请选择业务节点...</option>
                      {BUSINESS_NODES.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">处理方式</label>
                    <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1">
                      {[
                        { id: 'logic', label: '逻辑处理' },
                        { id: 'math', label: '数学运算' },
                        { id: 'ai', label: '人工智能' }
                      ].map(method => (
                        <button
                          key={method.id}
                          onClick={() => setProcessingMethod(method.id as any)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            (selectedBusinessNode ? selectedBusinessNode.method.includes(method.label) : processingMethod === method.id)
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

                {/* Input/Output Display */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">输入成果</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      {selectedBusinessNode ? (
                        <div className="flex items-center gap-2 p-2 bg-indigo-50/50 rounded-lg border border-indigo-100 text-[10px] text-indigo-700 font-bold">
                          <i className="fas fa-file-alt"></i>
                          <span>{selectedBusinessNode.inputs[0]}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic font-medium p-2 text-center bg-white border border-dashed border-slate-200 rounded-lg">未关联节点</div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">输出成果</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      {selectedBusinessNode ? (
                        <div className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100 text-[10px] text-emerald-700 font-bold">
                          <i className="fas fa-check-circle"></i>
                          <span>{selectedBusinessNode.outputs[0]}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic font-medium p-2 text-center bg-white border border-dashed border-slate-200 rounded-lg">未关联节点</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skill Description Editor (Editable directly) */}
                {selectedBusinessNode && (
                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">业务节点 Skill 描述 (Markdown)</label>
                    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                      <textarea
                        value={currentSkillDesc}
                        onChange={(e) => setCurrentSkillDesc(e.target.value)}
                        className="w-full h-[500px] p-8 text-xs font-mono leading-relaxed bg-transparent text-indigo-100 focus:outline-none transition-all resize-none custom-scrollbar"
                        placeholder="输入 Skill Markdown 描述..."
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 italic text-right">* 支持实时编辑，Markdown 内容将用于 Agent 语义寻址</p>
                  </div>
                )}
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
