
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

interface AdminAgentManagementProps {
  lang: Language;
}

interface ManagedAgent {
  id: string;
  name: string;
  type: 'Role' | 'Scenario' | 'General';
  version: '基础版' | '专业版' | '企业版';
  skillsCount: number;
  toolsCount: number;
  recentCalls: number;
  currentVersion: string;
  isEnabled: boolean;
  updateTime: string;
  description: string;
  prompt: string;
  roleConstraints?: string;
  roleAppointmentCount?: number;
  fewShotExamples?: string[];
  ioSchema: string;
  reasoningMode: string;
  tags: string[];
  industry: string;
  workflow?: {
    steps: string[];
    skills: string[];
  };
  selectedTemplate?: string;
  selectedSkills?: string[];
  selectedTools?: string[];
  fallbackStrategy?: string;
  selectedScenarioAgents?: string[];
  selectedGeneralAgents?: string[];
}

const MOCK_MANAGED_AGENTS: ManagedAgent[] = [
  {
    id: 'agent-001',
    name: 'Leader Agent',
    type: 'General',
    version: '企业版',
    skillsCount: 12,
    toolsCount: 8,
    recentCalls: 12500,
    currentVersion: 'v2.4.0',
    isEnabled: true,
    updateTime: '2024-05-20 10:00',
    description: '负责理解用户意图，拆解任务并分发给对应的数字专家。',
    prompt: '你是一个资深的石油行业专家，负责协调多个子智能体...',
    roleConstraints: '1. 必须保持专业严谨的语气；2. 严禁泄露未授权的生产数据；3. 优先调用专业工具进行计算。',
    roleAppointmentCount: 1250,
    fewShotExamples: ['用户：查询A井产量 -> 助手：正在为您查询A井产量数据...'],
    ioSchema: 'JSON Schema v7',
    reasoningMode: 'Chain-of-Thought',
    tags: ['Core', 'Routing'],
    industry: 'Oil & Gas',
    selectedTemplate: '通用调度模版',
    selectedSkills: ['意图识别', '任务拆解'],
    selectedTools: ['知识库检索', '计算器'],
    fallbackStrategy: 'Escalate to Human'
  },
  {
    id: 'agent-002',
    name: '邻井压裂参数优选 Agent',
    type: 'Scenario',
    version: '企业版',
    skillsCount: 4,
    toolsCount: 4,
    recentCalls: 850,
    currentVersion: 'v1.2.0',
    isEnabled: true,
    updateTime: '2024-05-21 09:00',
    description: '针对新井自动筛选最优邻井，继承最佳历史分段压裂参数，输出推荐参数包。',
    prompt: '你是一名压裂设计专家，请围绕目标井，按照同区块同层位、空间邻近、储层属性±10%、已投产、生产最优的规则筛选最优邻井，并抽取其段级压裂参数作为推荐依据。',
    roleConstraints: '角色：压裂设计专家\n必须优先同区块同层位\n储层属性误差默认 ±10%\n未投产井必须剔除\n输出必须包含参数来源解释',
    selectedTemplate: '新井压裂初设模板',
    selectedSkills: ['邻井发现 Skill', '储层评分 Skill', '生产评价 Skill', '参数抽取 Skill'],
    selectedTools: ['井信息查询 Tool', '距离计算 Tool', '生产聚合 Tool', '压裂参数解析 Tool'],
    ioSchema: 'Fracturing Params',
    reasoningMode: 'Expert Logic',
    tags: ['Fracturing', 'Optimization'],
    industry: 'Oil & Gas',
    selectedGeneralAgents: ['Leader Agent', '数据合规 Agent']
  },
  {
    id: 'agent-003',
    name: '类比井推荐 Agent',
    type: 'Scenario',
    version: '企业版',
    skillsCount: 3,
    toolsCount: 3,
    recentCalls: 420,
    currentVersion: 'v1.0.5',
    isEnabled: true,
    updateTime: '2024-05-21 10:30',
    description: '面向新区块或少井区，在全区范围推荐最成功的历史类比井。',
    prompt: '你是一名油藏压裂类比分析专家，请结合区块、层位、储层类型、改造方式和开发阶段，为目标井推荐最具参考价值的历史成功井。',
    roleConstraints: '允许跨平台邻井\n优先成功井模式\n强调改造模式一致性',
    selectedTemplate: '新区块评价模板',
    selectedSkills: ['全域类比检索 Skill', '地质模式识别 Skill', '成功井聚类 Skill'],
    selectedTools: ['全井库检索 Tool', '相似度计算 Tool', '聚类分析 Tool'],
    ioSchema: 'Analogy Well Report',
    reasoningMode: 'Pattern Matching',
    tags: ['Analogy', 'Exploration'],
    industry: 'Oil & Gas'
  },
  {
    id: 'agent-004',
    name: '压裂甜点评价 Agent',
    type: 'Scenario',
    version: '企业版',
    skillsCount: 3,
    toolsCount: 3,
    recentCalls: 2100,
    currentVersion: 'v2.1.0',
    isEnabled: true,
    updateTime: '2024-05-21 11:15',
    description: '识别目标井最值得优先改造的段位和甜点区。',
    prompt: '你是一名储层甜点评价专家，请综合孔隙度、饱和度、脆性、应力、天然裂缝和测井响应，对目标井进行段级甜点评分。',
    roleConstraints: '必须输出段级 Sweet Spot Score\n分段边界需可解释',
    selectedTemplate: '分段设计模板',
    selectedSkills: ['测井解释 Skill', '应力评价 Skill', '甜点综合评分 Skill'],
    selectedTools: ['测井曲线解析 Tool', '地应力计算 Tool', '裂缝识别 Tool'],
    ioSchema: 'Sweet Spot Map',
    reasoningMode: 'Geological Analysis',
    tags: ['Sweet Spot', 'Evaluation'],
    industry: 'Oil & Gas'
  },
  {
    id: 'agent-005',
    name: '分段分簇优化 Agent',
    type: 'Scenario',
    version: '企业版',
    skillsCount: 2,
    toolsCount: 2,
    recentCalls: 1500,
    currentVersion: 'v1.4.2',
    isEnabled: true,
    updateTime: '2024-05-21 13:45',
    description: '基于邻井和甜点结果，优化每段长度、簇数及簇间距。',
    prompt: '你是一名压裂工艺优化专家，请基于甜点评价和邻井参数，对目标井进行最优分段分簇设计。',
    roleConstraints: '必须输出段长和簇数\n优先提升 SRV\n控制施工复杂度',
    selectedTemplate: '分段分簇模板',
    selectedSkills: ['段边界优化 Skill', '簇间距优化 Skill'],
    selectedTools: ['几何优化 Tool', '压裂模拟 Tool'],
    ioSchema: 'Stage & Cluster Design',
    reasoningMode: 'Geometric Optimization',
    tags: ['Stage Design', 'Optimization'],
    industry: 'Oil & Gas'
  },
  {
    id: 'agent-006',
    name: '压裂规模优化 Agent',
    type: 'Scenario',
    version: '企业版',
    skillsCount: 2,
    toolsCount: 3,
    recentCalls: 3200,
    currentVersion: 'v3.0.1',
    isEnabled: true,
    updateTime: '2024-05-21 15:20',
    description: '优化液量、砂量、排量和支撑剂规模，实现成本收益最优。',
    prompt: '你是一名压裂经济优化专家，请在满足产能目标前提下，优化液量、砂量和排量规模，实现投入产出最优。',
    roleConstraints: '优先经济收益\n控制单井预算\n支持多目标优化',
    selectedTemplate: '压裂规模模板',
    selectedSkills: ['参数寻优 Skill', '经济评价 Skill'],
    selectedTools: ['产量预测 Tool', '成本测算 Tool', '优化求解 Tool'],
    ioSchema: 'Scale Optimization Package',
    reasoningMode: 'Economic Modeling',
    tags: ['Scale', 'Economics'],
    industry: 'Oil & Gas'
  },
  {
    id: 'agent-007',
    name: '压后产能预测 Agent',
    type: 'Scenario',
    version: '企业版',
    skillsCount: 2,
    toolsCount: 2,
    recentCalls: 5600,
    currentVersion: 'v2.0.0',
    isEnabled: true,
    updateTime: '2024-05-21 16:10',
    description: '预测推荐参数下的日产、首年产量和 EUR。',
    prompt: '你是一名压后产能预测专家，请结合地质属性、邻井表现和推荐压裂参数，预测目标井压后产量和 EUR。',
    roleConstraints: '输出日产 / 年产 / EUR\n必须附带置信区间',
    selectedTemplate: '产能预测模板',
    selectedSkills: ['递减分析 Skill', 'EUR 预测 Skill'],
    selectedTools: ['递减曲线 Tool', '机器学习预测 Tool'],
    ioSchema: 'Production Forecast',
    reasoningMode: 'Predictive Analytics',
    tags: ['Prediction', 'EUR'],
    industry: 'Oil & Gas'
  },
  {
    id: 'agent-008',
    name: '压裂效果复盘 Agent',
    type: 'Scenario',
    version: '企业版',
    skillsCount: 2,
    toolsCount: 3,
    recentCalls: 890,
    currentVersion: 'v1.1.0',
    isEnabled: true,
    updateTime: '2024-05-21 17:05',
    description: '分析压后效果偏差原因，输出下一井纠偏建议。',
    prompt: '你是一名压裂复盘专家，请结合施工曲线、压力异常和产量表现，分析本井压裂效果差异原因，并给出下一井优化建议。',
    roleConstraints: '必须归因到施工 / 地质 / 参数\n输出可执行纠偏建议',
    selectedTemplate: '压后复盘模板',
    selectedSkills: ['异常归因 Skill', '参数纠偏 Skill'],
    selectedTools: ['施工曲线分析 Tool', '异常检测 Tool', '对比分析 Tool'],
    ioSchema: 'Review & Correction Report',
    reasoningMode: 'Root Cause Analysis',
    tags: ['Review', 'Correction'],
    industry: 'Oil & Gas'
  },
  {
    id: 'agent-009',
    name: '平台井组协同压裂 Agent',
    type: 'Scenario',
    version: '企业版',
    skillsCount: 2,
    toolsCount: 3,
    recentCalls: 1100,
    currentVersion: 'v1.5.0',
    isEnabled: true,
    updateTime: '2024-05-21 18:00',
    description: '面向平台井组优化井距、缝距和施工顺序。',
    prompt: '你是一名平台井组协同优化专家，请从井距、缝距、施工顺序和井间干扰角度，优化平台井组整体压裂收益。',
    roleConstraints: '优先整体平台收益\n控制井间干扰\n输出井组级施工方案',
    selectedTemplate: '平台井组模板',
    selectedSkills: ['井组干扰分析 Skill', '排程优化 Skill'],
    selectedTools: ['井网分析 Tool', '干扰模拟 Tool', '排程求解 Tool'],
    ioSchema: 'Platform Optimization Plan',
    reasoningMode: 'Collaborative Optimization',
    tags: ['Platform', 'Synergy'],
    industry: 'Oil & Gas'
  },
  {
    id: 'agent-010',
    name: '智能问数 Agent',
    type: 'General',
    version: '专业版',
    skillsCount: 5,
    toolsCount: 3,
    recentCalls: 15600,
    currentVersion: 'v1.0.0',
    isEnabled: true,
    updateTime: '2024-05-22 09:00',
    description: '通过自然语言查询生产、地质、工程等各类数据库，自动生成查询结果。',
    prompt: '你是一个专业的数据查询专家，能够理解复杂的业务查询需求并转化为精准的数据库查询指令。',
    roleConstraints: '必须确保数据查询的准确性\n对敏感数据进行脱敏处理\n支持多表关联查询',
    selectedSkills: ['意图识别', 'SQL 生成', '数据清洗'],
    selectedTools: ['生产数据库', '地质数据库', '工程数据库'],
    ioSchema: 'Query Result JSON',
    reasoningMode: 'NL2SQL',
    tags: ['Data', 'Query'],
    industry: 'General'
  },
  {
    id: 'agent-011',
    name: '智能报告 Agent',
    type: 'General',
    version: '专业版',
    skillsCount: 4,
    toolsCount: 2,
    recentCalls: 8900,
    currentVersion: 'v1.0.0',
    isEnabled: true,
    updateTime: '2024-05-22 10:00',
    description: '基于给定的数据和分析结论，自动撰写专业的技术报告或周月报。',
    prompt: '你是一个资深的技术文档专家，能够根据数据分析结果撰写结构严谨、逻辑清晰的专业报告。',
    roleConstraints: '遵循行业报告标准格式\n语言表达专业、客观\n自动提取关键结论',
    selectedSkills: ['文本生成', '逻辑编排', '结论提取'],
    selectedTools: ['报告模板库', '文档导出工具'],
    ioSchema: 'Report Document',
    reasoningMode: 'Text Generation',
    tags: ['Report', 'Writing'],
    industry: 'General'
  },
  {
    id: 'agent-012',
    name: '智能 PPT Agent',
    type: 'General',
    version: '专业版',
    skillsCount: 3,
    toolsCount: 2,
    recentCalls: 4500,
    currentVersion: 'v1.0.0',
    isEnabled: true,
    updateTime: '2024-05-22 11:00',
    description: '将分析报告或核心观点自动转化为结构化的 PPT 演示文稿。',
    prompt: '你是一个幻灯片设计专家，能够将复杂的文字内容转化为易于理解、视觉美观的 PPT 结构。',
    roleConstraints: '每页 PPT 核心观点明确\n支持多种配色方案\n自动匹配合适的图表',
    selectedSkills: ['大纲生成', '视觉排版'],
    selectedTools: ['PPT 引擎', '图库插件'],
    ioSchema: 'PPTX File',
    reasoningMode: 'Structural Design',
    tags: ['PPT', 'Presentation'],
    industry: 'General'
  },
  {
    id: 'agent-013',
    name: '数据成图 Agent',
    type: 'General',
    version: '基础版',
    skillsCount: 6,
    toolsCount: 4,
    recentCalls: 25000,
    currentVersion: 'v1.0.0',
    isEnabled: true,
    updateTime: '2024-05-22 13:00',
    description: '根据用户提供的数据，自动推荐并生成最合适的统计图表。',
    prompt: '你是一个数据可视化专家，能够根据数据特征自动选择最优的图表类型进行展示。',
    roleConstraints: '图表类型必须符合数据特征\n支持交互式图表生成\n配色方案符合行业审美',
    selectedSkills: ['图表推荐', '数据转换'],
    selectedTools: ['ECharts 引擎', 'D3.js 库'],
    ioSchema: 'Chart Config JSON',
    reasoningMode: 'Visualization Logic',
    tags: ['Chart', 'Visualization'],
    industry: 'General'
  },
  {
    id: 'agent-014',
    name: '智能摘要 Agent',
    type: 'General',
    version: '基础版',
    skillsCount: 2,
    toolsCount: 1,
    recentCalls: 12000,
    currentVersion: 'v1.0.0',
    isEnabled: true,
    updateTime: '2024-05-22 14:00',
    description: '对长篇文档、会议纪要或实时对话进行核心摘要提取。',
    prompt: '你是一个信息提炼专家，能够从海量文本中快速提取核心观点和关键信息。',
    roleConstraints: '摘要内容必须客观准确\n支持不同长度的摘要生成\n保留关键的时间和人物信息',
    selectedSkills: ['文本摘要', '关键词提取'],
    selectedTools: ['NLP 引擎'],
    ioSchema: 'Summary Text',
    reasoningMode: 'Summarization',
    tags: ['Summary', 'NLP'],
    industry: 'General'
  },
  {
    id: 'agent-015',
    name: '生产管理专家',
    type: 'Role',
    version: '企业版',
    skillsCount: 8,
    toolsCount: 5,
    recentCalls: 3400,
    currentVersion: 'v1.0.0',
    isEnabled: true,
    updateTime: '2024-05-23 09:00',
    description: '负责油田生产全过程监控、异常诊断及优化调度，确保生产目标达成。',
    prompt: '你是一个资深的生产管理专家，负责监控油气田生产动态，识别生产瓶颈，制定日度/月度生产优化方案。',
    roleConstraints: '优先级：安全生产 > 产量达标 > 成本控制\n数据引用必须附带时间戳和井号\n异常报警需分类分级处理',
    selectedSkills: ['生产动态分析', '异常诊断', '调度优化'],
    selectedTools: ['实时监控系统', '生产调度平台', 'KPI 仪表盘'],
    ioSchema: 'Production Plan/Report',
    reasoningMode: 'Operational Logic',
    tags: ['Production', 'Management'],
    industry: 'Oil & Gas',
    selectedScenarioAgents: ['压后产能预测 Agent', '生产动态评价 Agent']
  },
  {
    id: 'agent-016',
    name: '勘探决策专家',
    type: 'Role',
    version: '企业版',
    skillsCount: 10,
    toolsCount: 6,
    recentCalls: 1200,
    currentVersion: 'v1.0.0',
    isEnabled: true,
    updateTime: '2024-05-23 10:00',
    description: '综合地质、地震、测井数据进行区块评估与井位部署建议，提升勘探成功率。',
    prompt: '你是一个勘探决策专家，负责在新区块或现有区块进行资源量评估、有利区优选、井位论证及勘探方案评审。',
    roleConstraints: '客观评估地质风险\n多评价体系交叉验证\n遵循行业标准评价规范',
    selectedSkills: ['区块评估', '评价准则制定', '风险概率模型'],
    selectedTools: ['地质建模软件', 'GIS 地图服务', '资源量计算器'],
    ioSchema: 'Exploration Strategy/Proposal',
    reasoningMode: 'Multi-Criteria Decision',
    tags: ['Exploration', 'Decision'],
    industry: 'Oil & Gas',
    selectedScenarioAgents: ['类比井推荐 Agent', '地质风险评估 Agent']
  },
  {
    id: 'agent-017',
    name: '钻井指挥专家',
    type: 'Role',
    version: '企业版',
    skillsCount: 7,
    toolsCount: 8,
    recentCalls: 2800,
    currentVersion: 'v1.0.0',
    isEnabled: true,
    updateTime: '2024-05-23 11:00',
    description: '实施钻井过程中的实时指令分发、复杂事故预警与工程进度管控。',
    prompt: '你是一个钻井指挥专家，负责钻井作业现场的实时指挥调度、工程风险预警、非生产时间 analysis 及优化建议。',
    roleConstraints: '实时性响应要求 < 1s\n事故预警必须包含应急处置方案建议\n工程作业记录精确到分钟',
    selectedSkills: ['实时指挥', '工程预警', '钻井工艺优化'],
    selectedTools: ['钻井仪表板', '预警系统', '进度看板'],
    ioSchema: 'Drilling Instruction/Log',
    reasoningMode: 'Real-time Control',
    tags: ['Drilling', 'Execution'],
    industry: 'Oil & Gas',
    selectedScenarioAgents: ['钻井工程预警 Agent', '施工参数优化 Agent']
  },
];

export const AdminAgentManagement: React.FC<AdminAgentManagementProps> = ({ lang }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<ManagedAgent | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'capabilities'>('basic');
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredAgents = useMemo(() => {
    return MOCK_MANAGED_AGENTS.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            agent.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !filterType || agent.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, filterType]);

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* 1) Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-robot text-indigo-600"></i>
            {lang === 'zh' ? '智能体管理' : 'Agent Management'}
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
              { id: 'General', label: lang === 'zh' ? '通用' : 'General', icon: 'fa-bolt' },
              { id: 'Scenario', label: lang === 'zh' ? '场景' : 'Scenario', icon: 'fa-cube' },
              { id: 'Role', label: lang === 'zh' ? '岗位' : 'Role', icon: 'fa-user-tie' },
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
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '智能体名称' : 'Agent Name'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '类型' : 'Type'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{lang === 'zh' ? '技能/工具' : 'Skills/Tools'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '状态' : 'Status'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '修改人' : 'Modified By'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '最近更新' : 'Updated'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{lang === 'zh' ? '操作' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAgents.map(agent => (
                    <tr 
                      key={agent.id} 
                      className={`hover:bg-indigo-50/30 transition-colors group ${selectedAgent?.id === agent.id ? 'bg-indigo-50/50' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                            agent.type === 'Role' ? 'bg-indigo-100 text-indigo-600' :
                            agent.type === 'Scenario' ? 'bg-purple-100 text-purple-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <i className={`fas ${
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
                        <span className="text-xs font-medium text-slate-600">
                          {agent.type === 'Role' ? (lang === 'zh' ? '岗位' : 'Role') : 
                           agent.type === 'Scenario' ? (lang === 'zh' ? '场景' : 'Scenario') : 
                           (lang === 'zh' ? '通用' : 'General')}
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
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // In a real app, we'd update the state here
                          }}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                            agent.isEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              agent.isEnabled ? 'translate-x-6' : 'translate-x-1'
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
                      <td className="px-6 py-4 text-xs text-slate-500">{agent.updateTime}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAgent(agent);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                            title={lang === 'zh' ? '编辑' : 'Edit'}
                          >
                            <i className="fas fa-edit"></i>
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
                      selectedAgent.type === 'Role' ? 'bg-indigo-100 text-indigo-600' :
                      selectedAgent.type === 'Scenario' ? 'bg-purple-100 text-purple-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <i className={`fas ${
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
                    { id: 'capabilities', label: lang === 'zh' ? '能力绑定' : 'Capability Binding' },
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
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '类型' : 'Type'}</label>
                        <select defaultValue={selectedAgent.type} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="Role">{lang === 'zh' ? '岗位' : 'Role'}</option>
                          <option value="Scenario">{lang === 'zh' ? '场景' : 'Scenario'}</option>
                          <option value="General">{lang === 'zh' ? '通用' : 'General'}</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '描述' : 'Description'}</label>
                        <textarea defaultValue={selectedAgent.description} className="w-full h-20 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '系统提示词' : 'System Prompt'}</label>
                        <textarea defaultValue={selectedAgent.prompt} className="w-full h-32 bg-slate-900 text-indigo-100 font-mono text-xs rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '角色与约束' : 'Role & Constraints'}</label>
                        <textarea defaultValue={selectedAgent.roleConstraints} className="w-full h-32 bg-slate-900 text-indigo-100 font-mono text-xs rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? 'Few-shot 示例' : 'Few-shot Examples'}</label>
                        <div className="space-y-3">
                          {(selectedAgent.fewShotExamples || []).map((ex, i) => (
                            <div key={i} className="flex gap-2">
                              <textarea defaultValue={ex} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                              <button className="p-2 text-slate-300 hover:text-rose-500"><i className="fas fa-minus-circle"></i></button>
                            </div>
                          ))}
                          <button className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-all font-bold">
                            + {lang === 'zh' ? '添加示例' : 'Add Example'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'capabilities' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      {selectedAgent.type === 'Scenario' && (
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '模版选择' : 'Template Selection'}</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                              <option>{selectedAgent.selectedTemplate || (lang === 'zh' ? '请选择模版' : 'Select Template')}</option>
                              <option>通用调度模版</option>
                              <option>新井邻井压裂参数优选</option>
                              <option>单井产量分析模版</option>
                            </select>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '通用智能体选择' : 'General Agent Selection'}</label>
                              <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700">+ {lang === 'zh' ? '添加通用智能体' : 'Add General Agent'}</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(selectedAgent.selectedGeneralAgents || []).map(ga => (
                                <span key={ga} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-2">
                                  {ga}
                                  <i className="fas fa-times cursor-pointer hover:text-blue-800"></i>
                                </span>
                              ))}
                              {(selectedAgent.selectedGeneralAgents || []).length === 0 && (
                                <div className="text-xs text-slate-400 italic py-2">{lang === 'zh' ? '尚未绑定通用智能体' : 'No general agents bound'}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedAgent.type === 'Role' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '场景智能体选择' : 'Scenario Agent Selection'}</label>
                            <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700">+ {lang === 'zh' ? '添加场景智能体' : 'Add Scenario Agent'}</button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(selectedAgent.selectedScenarioAgents || []).map(sa => (
                              <span key={sa} className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold flex items-center gap-2">
                                {sa}
                                <i className="fas fa-times cursor-pointer hover:text-purple-800"></i>
                              </span>
                            ))}
                            {(selectedAgent.selectedScenarioAgents || []).length === 0 && (
                              <div className="text-xs text-slate-400 italic py-2">{lang === 'zh' ? '尚未绑定场景智能体' : 'No scenario agents bound'}</div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '技能选择' : 'Skill Selection'}</label>
                          <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700">+ {lang === 'zh' ? '添加技能' : 'Add Skill'}</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(selectedAgent.selectedSkills || []).map(skill => (
                            <span key={skill} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold flex items-center gap-2">
                              {skill}
                              <i className="fas fa-times cursor-pointer hover:text-indigo-800"></i>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '工具选择' : 'Tool Selection'}</label>
                          <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700">+ {lang === 'zh' ? '添加工具' : 'Add Tool'}</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(selectedAgent.selectedTools || []).map(tool => (
                            <span key={tool} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold flex items-center gap-2">
                              {tool}
                              <i className="fas fa-times cursor-pointer hover:text-emerald-800"></i>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '回退策略' : 'Fallback Strategy'}</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                          <option>{selectedAgent.fallbackStrategy || (lang === 'zh' ? '请选择策略' : 'Select Strategy')}</option>
                          <option>{lang === 'zh' ? '重试通用智能体' : 'Retry with General Agent'}</option>
                          <option>{lang === 'zh' ? '人工接管' : 'Escalate to Human'}</option>
                          <option>{lang === 'zh' ? '返回默认响应' : 'Return Default Response'}</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Drawer Footer */}
                <div className="p-6 border-t border-slate-100 bg-white flex justify-end items-center">
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
                      className="px-8 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
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
