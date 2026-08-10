import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { translations } from '../i18n';

interface AgentSquareProps {
  lang: Language;
  onLaunchAgent?: (agentName: string) => void;
}

interface AgentSquareItem {
  id: string;
  name: string;
  description: string;
  category: string;
  usageCount: number;
  owner: string;
  createdAt: string;
  icon: string;
  techTags?: string[];
  version?: string;
  status?: 'active' | 'updating';
}

const CATEGORIES = [
  { field: '通用智能体', id: 'general', name: '通用智能体', icon: 'fa-robot', color: 'from-blue-500 to-indigo-500' },
  { field: '勘探评价', id: 'exploration', name: '勘探评价', icon: 'fa-compass', color: 'from-sky-500 to-blue-600' },
  { field: '地质研究', id: 'geology', name: '地质研究', icon: 'fa-globe', color: 'from-emerald-500 to-teal-600' },
  { field: '测录井解释', id: 'logging', name: '测录井解释', icon: 'fa-chart-bar', color: 'from-amber-500 to-orange-600' },
  { field: '钻井工程', id: 'drilling', name: '钻井工程', icon: 'fa-tools', color: 'from-rose-500 to-red-600' },
  { field: '完井压裂', id: 'fracturing', name: '完井压裂', icon: 'fa-water', color: 'from-cyan-500 to-blue-500' },
  { field: '开发生产', id: 'production', name: '开发生产', icon: 'fa-industry', color: 'from-indigo-500 to-purple-600' },
  { field: '油藏工程', id: 'reservoir', name: '油藏工程', icon: 'fa-database', color: 'from-violet-500 to-fuchsia-600' },
  { field: '生产运行', id: 'operations', name: '生产运行', icon: 'fa-cogs', color: 'from-amber-600 to-yellow-600' },
  { field: '设备运维', id: 'maintenance', name: '设备运维', icon: 'fa-wrench', color: 'from-slate-600 to-zinc-700' },
  { field: '安全环保', id: 'qhse', name: '安全环保(QHSE)', icon: 'fa-leaf', color: 'from-emerald-600 to-green-600' },
  { field: '经营管理', id: 'management', name: '经营管理', icon: 'fa-chart-pie', color: 'from-pink-500 to-rose-600' },
];

const MOCK_AGENTS: AgentSquareItem[] = [
  { id: 'g1', name: '报告生成智能体', description: '自动生成业务报告、公文及专业文档，支持模板化输出。', category: '通用智能体', usageCount: 1250, owner: '系统平台', createdAt: '2023-10-01', icon: 'fa-file-alt', techTags: ['NLG', 'DocGen', 'Template'], version: 'v2.1', status: 'active' },
  { id: 'g2', name: '报告校核智能体', description: '自动校核钻完井报告、地质设计及技术方案中的数据逻辑、合规强条及格式规范。', category: '通用智能体', usageCount: 890, owner: '系统平台', createdAt: '2023-10-05', icon: 'fa-check-double', techTags: ['ReportCheck', 'RuleEngine', 'DataVerify'], version: 'v2.5', status: 'active' },
  { id: 'g3', name: '专业图件智能体', description: '自动生成各类专业的石油行业图件', category: '通用智能体', usageCount: 750, owner: '系统平台', createdAt: '2023-11-12', icon: 'fa-image', techTags: ['VectorGen', 'CAD-Bridge'], version: 'v1.5', status: 'active' },
  { id: 'g4', name: '智能问数智能体', description: '自然语言查询业务数据，自动完成统计分析及图表展示。', category: '通用智能体', usageCount: 2300, owner: '系统平台', createdAt: '2023-09-20', icon: 'fa-chart-line', techTags: ['Text-to-SQL', 'D3-Viz', 'MCP'], version: 'v3.0', status: 'active' },

  { id: 'b1_1', name: '构造解释智能体', description: '基于地震解释成果、构造模型及历史资料，辅助完成构造解释、断层分析及圈闭评价。', category: '勘探评价', usageCount: 420, owner: '勘探院', createdAt: '2023-12-01', icon: 'fa-layer-group', techTags: ['Seismic', 'FaultParse'], version: 'v1.2', status: 'active' },
  { id: 'b1_2', name: '勘探目标评价智能体', description: '综合地质、地震、钻井资料，对勘探目标进行综合评价并形成分析报告。', category: '勘探评价', usageCount: 380, owner: '勘探院', createdAt: '2023-12-05', icon: 'fa-bullseye', techTags: ['Multi-Source', 'RiskScore'], version: 'v1.4', status: 'active' },
  { id: 'b1_3', name: '勘探部署智能体', description: '基于已有研究成果，辅助生成勘探部署方案及论证材料。', category: '勘探评价', usageCount: 310, owner: '勘探院', createdAt: '2023-12-10', icon: 'fa-map-marked-alt', techTags: ['GeoJSON', 'DeployPlan'], version: 'v1.1', status: 'active' },
  { id: 'b1_4', name: '风险勘探智能体', description: '综合多源数据识别勘探风险，分析风险来源并提出规避建议。', category: '勘探评价', usageCount: 290, owner: '勘探院', createdAt: '2023-12-15', icon: 'fa-exclamation-triangle', techTags: ['Anomalies', 'Mitigation'], version: 'v1.0', status: 'active' },

  { id: 'b2_1', name: '地层对比智能体', description: '自动完成井间地层对比、层位划分及差异分析。', category: '地质研究', usageCount: 550, owner: '勘探院', createdAt: '2024-01-10', icon: 'fa-align-left', techTags: ['Well-Log', 'StratumMatch'], version: 'v2.0', status: 'active' },
  { id: 'b2_2', name: '沉积相分析智能体', description: '基于测录井、岩心及地震资料辅助完成沉积相分析。', category: '地质研究', usageCount: 460, owner: '勘探院', createdAt: '2024-01-12', icon: 'fa-water', techTags: ['Sedimentology', 'CoreParse'], version: 'v1.3', status: 'active' },
  { id: 'b2_3', name: '储层评价智能体', description: '综合储层参数、测录井及地质资料完成储层综合评价。', category: '地质研究', usageCount: 610, owner: '勘探院', createdAt: '2024-01-15', icon: 'fa-star', techTags: ['ReservoirQuality', 'Facies'], version: 'v2.2', status: 'active' },
  { id: 'b2_4', name: '地质成果智能体', description: '自动整理研究成果并生成地质研究报告。', category: '地质研究', usageCount: 520, owner: '勘探院', createdAt: '2024-01-18', icon: 'fa-book-open', techTags: ['ReportSync', 'GeoKnowledge'], version: 'v1.6', status: 'active' },

  { id: 'b3_1', name: '测井解释智能体', description: '自动解释测井曲线，辅助识别储层及流体性质。', category: '测录井解释', usageCount: 780, owner: '测井公司', createdAt: '2024-02-05', icon: 'fa-wave-square', techTags: ['LogCurve', 'FluidID'], version: 'v2.5', status: 'active' },
  { id: 'b3_2', name: '录井分析智能体', description: '自动分析录井资料、岩屑描述及油气显示信息。', category: '测录井解释', usageCount: 650, owner: '测井公司', createdAt: '2024-02-08', icon: 'fa-microscope', techTags: ['GasShow', 'Lithology'], version: 'v1.9', status: 'active' },
  { id: 'b3_3', name: '测录井综合评价智能体', description: '综合测井与录井成果形成评价结论。', category: '测录井解释', usageCount: 720, owner: '测井公司', createdAt: '2024-02-12', icon: 'fa-clipboard-check', techTags: ['CrossPlot', 'IntegratedInterpret'], version: 'v2.0', status: 'active' },

  { id: 'b4_1', name: '钻井地质设计智能体', description: '自动生成钻井地质设计方案及报告，完成知识引用、内容编写及成果输出。', category: '钻井工程', usageCount: 1150, owner: '钻井院', createdAt: '2024-03-01', icon: 'fa-drafting-compass', techTags: ['DrillDesign', 'AutoWrite', 'RAG'], version: 'v3.2', status: 'active' },
  { id: 'b4_2', name: '钻井风险分析智能体', description: '自动识别井漏、卡钻、地层压力等钻井风险，并提出应对建议。', category: '钻井工程', usageCount: 980, owner: '钻井院', createdAt: '2024-03-05', icon: 'fa-radiation', techTags: ['LostCirculation', 'StuckPipe', 'Alert'], version: 'v2.1', status: 'active' },
  { id: 'b4_3', name: '钻井参数分析智能体', description: '综合分析钻井施工参数，识别异常并提供优化建议。', category: '钻井工程', usageCount: 1050, owner: '钻井院', createdAt: '2024-03-10', icon: 'fa-tachometer-alt', techTags: ['ROP-Optimization', 'WOB', 'RPM'], version: 'v1.7', status: 'active' },
  { id: 'b4_4', name: '钻井施工监控智能体', description: '对钻井施工过程进行实时分析、异常监控及预警。', category: '钻井工程', usageCount: 1320, owner: '钻井院', createdAt: '2024-03-15', icon: 'fa-video', techTags: ['RealtimeStreaming', 'IoT-Sensors'], version: 'v4.0', status: 'active' },
  { id: 'b4_5', name: '报告校核', description: '自动校核钻完井报告、地质设计及技术方案中的数据逻辑、合规强条及格式规范。', category: '钻井工程', usageCount: 1080, owner: '钻井院', createdAt: '2024-03-20', icon: 'fa-check-double', techTags: ['ReportCheck', 'RuleEngine', 'DataVerify'], version: 'v2.5', status: 'active' },

  { id: 'b5_1', name: '压裂设计智能体', description: '基于储层特征辅助生成压裂设计方案。', category: '完井压裂', usageCount: 640, owner: '采油厂', createdAt: '2024-04-02', icon: 'fa-project-diagram', techTags: ['FracDesign', 'StressField'], version: 'v1.5', status: 'active' },
  { id: 'b5_2', name: '压裂效果评价智能体', description: '综合施工及生产数据，对压裂效果进行评价分析。', category: '完井压裂', usageCount: 590, owner: '采油厂', createdAt: '2024-04-06', icon: 'fa-chart-area', techTags: ['FracPerformance', 'Microseismic'], version: 'v1.8', status: 'active' },

  { id: 'b6_1', name: '单井分析智能体', description: '对单井生产动态进行综合分析，定位影响生产的关键因素。', category: '开发生产', usageCount: 1450, owner: '采油厂', createdAt: '2024-05-01', icon: 'fa-oil-can', techTags: ['NodalAnalysis', 'ProductionDecline'], version: 'v3.1', status: 'active' },
  { id: 'b6_2', name: '生产动态分析智能体', description: '综合产量、压力、含水等数据分析生产动态变化。', category: '开发生产', usageCount: 1380, owner: '采油厂', createdAt: '2024-05-05', icon: 'fa-chart-bar', techTags: ['DynamicWaterCut', 'PressureDecline'], version: 'v2.8', status: 'active' },
  { id: 'b6_3', name: '措施效果评价智能体', description: '对措施实施前后效果进行量化分析及评价。', category: '开发生产', usageCount: 1120, owner: '采油厂', createdAt: '2024-05-10', icon: 'fa-balance-scale', techTags: ['Pre-PostQuantify', 'EOR-Calc'], version: 'v2.0', status: 'active' },
  { id: 'b6_4', name: '开发方案智能体', description: '自动生成开发调整方案及技术建议。', category: '开发生产', usageCount: 950, owner: '采油厂', createdAt: '2024-05-15', icon: 'fa-file-invoice', techTags: ['DevAdjustment', 'EcoEval'], version: 'v1.9', status: 'active' },

  { id: 'b7_1', name: '注采分析智能体', description: '自动分析注采关系，评价开发效果并形成分析报告。', category: '油藏工程', usageCount: 820, owner: '勘探院', createdAt: '2024-06-02', icon: 'fa-exchange-alt', techTags: ['InjectionPatterns', 'VoidageRatio'], version: 'v2.1', status: 'active' },
  { id: 'b7_2', name: '油藏评价智能体', description: '综合油藏资料完成油藏综合评价。', category: '油藏工程', usageCount: 760, owner: '勘探院', createdAt: '2024-06-08', icon: 'fa-database', techTags: ['MaterialBalance', 'OOIP-Calc'], version: 'v1.8', status: 'active' },

  { id: 'b8_1', name: '生产监控智能体', description: '对生产运行状态进行实时监控并提示异常。', category: '生产运行', usageCount: 1250, owner: '信息中心', createdAt: '2024-07-01', icon: 'fa-desktop', techTags: ['LiveDashboard', 'AnomalyAlert'], version: 'v3.5', status: 'active' },
  { id: 'b8_2', name: '异常诊断智能体', description: '对停井、产量异常等问题进行原因分析。', category: '生产运行', usageCount: 1180, owner: '信息中心', createdAt: '2024-07-05', icon: 'fa-stethoscope', techTags: ['RootCause', 'ExpertRules'], version: 'v2.7', status: 'active' },
  { id: 'b8_3', name: '巡检助手智能体', description: '协助巡检人员完成巡检记录、隐患登记及问题分析。', category: '生产运行', usageCount: 1350, owner: '信息中心', createdAt: '2024-07-10', icon: 'fa-walking', techTags: ['OfflineSync', 'VoiceToText'], version: 'v2.4', status: 'active' },

  { id: 'b9_1', name: '设备健康诊断智能体', description: '综合设备运行数据分析设备健康状态。', category: '设备运维', usageCount: 890, owner: '装备部', createdAt: '2024-08-02', icon: 'fa-heartbeat', techTags: ['PredictiveMaintenance', 'FFT'], version: 'v2.2', status: 'active' },
  { id: 'b9_2', name: '智能维修助手', description: '根据故障信息生成维修建议及维修方案。', category: '设备运维', usageCount: 760, owner: '装备部', createdAt: '2024-08-08', icon: 'fa-tools', techTags: ['SOP-Guides', 'PartsLookup'], version: 'v1.4', status: 'active' },

  { id: 'b10_1', name: '风险识别智能体', description: '自动识别生产作业中的安全风险及隐患。', category: '安全环保', usageCount: 920, owner: 'QHSE部', createdAt: '2024-09-01', icon: 'fa-shield-alt', techTags: ['RiskMap', 'HazardAnalysis'], version: 'v2.0', status: 'active' },
  { id: 'b10_2', name: '隐患排查智能体', description: '根据检查记录自动分析隐患并提出整改建议。', category: '安全环保', usageCount: 850, owner: 'QHSE部', createdAt: '2024-09-05', icon: 'fa-search-plus', techTags: ['RectifyTrack', 'SeverityLevel'], version: 'v1.9', status: 'active' },
  { id: 'b10_3', name: 'HSE检查智能体', description: '自动生成检查记录及检查报告。', category: '安全环保', usageCount: 780, owner: 'QHSE部', createdAt: '2024-09-10', icon: 'fa-clipboard-list', techTags: ['ComplianceCheck', 'AutoDoc'], version: 'v1.5', status: 'active' },
  { id: 'b10_4', name: '合规校核智能体', description: '自动校核报告、制度及流程是否符合规范要求。', category: '安全环保', usageCount: 650, owner: 'QHSE部', createdAt: '2024-09-15', icon: 'fa-check-double', techTags: ['RuleEngine', 'GrammarCheck'], version: 'v2.3', status: 'active' },

  { id: 'b11_1', name: '经营分析智能体', description: '综合经营数据自动生成经营分析报告。', category: '经营管理', usageCount: 520, owner: '财务部', createdAt: '2024-10-02', icon: 'fa-chart-pie', techTags: ['KPI-Track', 'FinancialForecast'], version: 'v1.6', status: 'active' },
  { id: 'b11_2', name: '成本分析智能体', description: '分析成本构成、费用变化及降本增效空间。', category: '经营管理', usageCount: 490, owner: '财务部', createdAt: '2024-10-08', icon: 'fa-money-bill-wave', techTags: ['CAPEX-OPEX', 'ReductionPath'], version: 'v1.3', status: 'active' }
];

interface RecommendedRole {
  id: string;
  nameZh: string;
  nameEn: string;
  icon: string;
  descZh: string;
  descEn: string;
  matches: {
    agentId: string;
    reasonZh: string;
    reasonEn: string;
    matchRate: number;
  }[];
}

const RECOMMENDED_ROLES: RecommendedRole[] = [
  {
    id: 'geology',
    nameZh: '地质研究专家',
    nameEn: 'Geology Specialist',
    icon: 'fa-globe',
    descZh: '致力于沉积相分析、地层对比及储层定量化评价，提供卓越的静态地学信息。',
    descEn: 'Focus on stratigraphy, reservoir quality assessments, and facies mapping.',
    matches: [
      { agentId: 'b2_3', matchRate: 99, reasonZh: '专属算法自动汇聚地质参数，支持层位多因素权重对比，一键产出高精度储层评价结论。', reasonEn: 'Aggregates reservoir logs and automatically drafts high-precision evaluations.', },
      { agentId: 'b2_1', matchRate: 96, reasonZh: '利用小波变换自动对齐井筒层位曲线，缩短人工拉对比剖面的时间达70%。', reasonEn: 'Uses advanced curves pattern matching to accelerate vertical well-to-well correlations.', },
      { agentId: 'g4', matchRate: 92, reasonZh: '支持基于知识库的大模型多维对话，可用口语秒级检索历史地层及井位档案。', reasonEn: 'Enables chat-driven natural language queries on legacy well archives.', }
    ]
  },
  {
    id: 'drilling',
    nameZh: '钻井工程专家',
    nameEn: 'Drilling Engineer',
    icon: 'fa-tools',
    descZh: '专注于地质工程一体化协同方案论证、异常风险实时感知及高效建井。',
    descEn: 'Focus on drill planning, real-time risk diagnostic, and rate-of-penetration tracking.',
    matches: [
      { agentId: 'b4_1', matchRate: 98, reasonZh: '基于大语言模型自适应提取邻井工程大纲，智能起草复合钻井地质设计。', reasonEn: 'Leverages LLM pattern extraction to draft drilling program outlines from offset wells.', },
      { agentId: 'b4_2', matchRate: 97, reasonZh: '实时监测大钩载荷及泥浆返出量，在发生卡钻或井漏前给出前瞻性处置决策。', reasonEn: 'Alerts and suggests countermeasures for drill hazards like stuck-pipes or mud loss.', },
      { agentId: 'b4_3', matchRate: 95, reasonZh: '结合地层硬度分布，自适应推荐钻压与转速的极值，实现机械钻速（ROP）最优化。', reasonEn: 'Recommends dynamic parameter curves (WOB/RPM) to maximize penetration rates.', }
    ]
  },
  {
    id: 'production',
    nameZh: '开发运行专家',
    nameEn: 'Production Specialist',
    icon: 'fa-industry',
    descZh: '专注于生产动态诊断、单井注采调控、减产因素解析以及高值设备健康监控。',
    descEn: 'Focus on operational dashboards, decline-curve diagnostics, and machinery health.',
    matches: [
      { agentId: 'b8_1', matchRate: 99, reasonZh: '对地面和井下油温、液量突变进行多级联动监控，敏捷输出减产或事故红牌告警。', reasonEn: 'Delivers dynamic multi-tiered alerts on sudden drop-offs in oil/fluid yield.', },
      { agentId: 'b8_2', matchRate: 94, reasonZh: '内嵌入行业经典泵况示功图专家判定规则，实现远程全天候油井工况智能会诊。', reasonEn: 'Integrates dynagraph diagnostics to isolate pump cards anomalies in real-time.', },
      { agentId: 'b6_1', matchRate: 91, reasonZh: '针对单井历史衰减模型进行自动匹配，预测阶段采出程度并量化提液潜力。', reasonEn: 'Applies decline-curve equations to calculate remaining recoverable reserve bounds.', }
    ]
  },
  {
    id: 'qhse',
    nameZh: '安全环保监察',
    nameEn: 'QHSE Inspector',
    icon: 'fa-shield-alt',
    descZh: '致力于作业规程安全比对、隐患治理跟踪及国家/行业法规标准穿透校核。',
    descEn: 'Focus on permit auditing, hazard remediation loops, and rule compliance checks.',
    matches: [
      { agentId: 'b10_1', matchRate: 97, reasonZh: '作业前置合规判断，输入现场工作任务即可自动映射出必要的危险源防护重点。', reasonEn: 'Scans text to isolate workplace hazard hotspots against corporate safety rulebooks.', },
      { agentId: 'b10_4', matchRate: 96, reasonZh: '依托多模态语义核查技术，自动标注工程报告或制度合规性冲突并给出修润话术。', reasonEn: 'Utilizes semantic parsers to flag conflicts in policy texts and operational files.', },
      { agentId: 'b10_2', matchRate: 93, reasonZh: '自动汇总以往检查，归纳高频复发隐患，协助现场安全检查实现闭环责任穿透。', reasonEn: 'Automates tracking of defects to eliminate repeat HSE infractions on lease.', }
    ]
  },
  {
    id: 'management',
    nameZh: '经营分析决策',
    nameEn: 'Management Analyst',
    icon: 'fa-chart-pie',
    descZh: '聚焦于全生命周期CAPEX与OPEX支出穿透、降本增效追踪以及行政公文底稿起草。',
    descEn: 'Focus on financial modeling, capital allocations, and official administration.',
    matches: [
      { agentId: 'b11_1', matchRate: 98, reasonZh: '打通日常日报生产台账，以高可读性多维驾驶舱图形汇报盈亏动态及项目进度。', reasonEn: 'Integrates operations with financial sheets, producing readable executive dashboards.', },
      { agentId: 'b11_2', matchRate: 95, reasonZh: '智能拆解材料与耗材细账，提供精细到作业班组的损耗追踪与节能增效路径图。', reasonEn: 'Dissects supply logs to identify excessive material expenditure segments.', },
      { agentId: 'g1', matchRate: 90, reasonZh: '输入关键纪要后自动填充标准的公文排版与词汇框架，缩短行政文本起草耗时。', reasonEn: 'Formats and structures official corporate briefs instantly using basic input items.', }
    ]
  }
];

export const AgentSquare: React.FC<AgentSquareProps> = ({
  lang,
  onLaunchAgent
}) => {
  const t = translations[lang];
  const [sortBy, setSortBy] = useState<'time' | 'usage'>('usage');
  const [filter, setFilter] = useState('');

  // Local user profile state loaded from localStorage (defaults match PersonalCenter)
  const [profile, setProfile] = useState({
    name: '李明',
    position: '高级钻井地质专家',
    department: '勘探开发研究院 - 地质研究所',
    avatar: null as string | null
  });

  // Sync profile details on mount
  useEffect(() => {
    const handleProfileSync = () => {
      setProfile({
        name: localStorage.getItem('profile-name') || '李明',
        position: localStorage.getItem('profile-position') || '高级钻井地质专家',
        department: localStorage.getItem('profile-department') || '勘探开发研究院 - 地质研究所',
        avatar: localStorage.getItem('profile-avatar') || null
      });
    };

    handleProfileSync();
    // Listen to storage events to stay synchronized
    window.addEventListener('storage', handleProfileSync);
    return () => window.removeEventListener('storage', handleProfileSync);
  }, []);

  // Determine user's simulated role based on actual position keywords
  const mappedRoleId = useMemo(() => {
    const pos = profile.position.toLowerCase();
    if (pos.includes('地质') || pos.includes('勘探') || pos.includes('geology')) {
      return 'geology';
    }
    if (pos.includes('钻井') || pos.includes('工程') || pos.includes('drilling') || pos.includes('完井')) {
      return 'drilling';
    }
    if (pos.includes('运行') || pos.includes('生产') || pos.includes('调度') || pos.includes('设备') || pos.includes('运维') || pos.includes('production')) {
      return 'production';
    }
    if (pos.includes('安全') || pos.includes('环保') || pos.includes('qhse') || pos.includes('监察') || pos.includes('hstd')) {
      return 'qhse';
    }
    if (pos.includes('管理') || pos.includes('经营') || pos.includes('财务') || pos.includes('分析') || pos.includes('decision') || pos.includes('finance')) {
      return 'management';
    }
    return 'geology';
  }, [profile.position]);

  // Active Simulated Role State
  const [activeSimulatedRole, setActiveSimulatedRole] = useState<string>('geology');

  // Align active simulated role with user profile map when profile loads
  useEffect(() => {
    if (mappedRoleId) {
      setActiveSimulatedRole(mappedRoleId);
    }
  }, [mappedRoleId]);

  // Retrieve matching details for active simulated role
  const activeRoleData = useMemo(() => {
    return RECOMMENDED_ROLES.find(r => r.id === activeSimulatedRole) || RECOMMENDED_ROLES[0];
  }, [activeSimulatedRole]);

  // Extract recommended templates
  const recommendedAgents = useMemo(() => {
    return activeRoleData.matches.map(m => {
      const agent = MOCK_AGENTS.find(a => a.id === m.agentId);
      if (!agent) return null;
      return {
        ...agent,
        matchRate: m.matchRate,
        reason: lang === 'zh' ? m.reasonZh : m.reasonEn
      };
    }).filter(Boolean) as (AgentSquareItem & { matchRate: number; reason: string })[];
  }, [activeRoleData, lang]);

  // Extract recently released agents (top 4 sorted by createdAt descending)
  const recentlyAddedAgents = useMemo(() => {
    return [...MOCK_AGENTS]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, []);

  // Filter & Search templates
  const filteredAgents = useMemo(() => {
    let result = [...MOCK_AGENTS];
    
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      result = result.filter(tpl => 
        tpl.name.toLowerCase().includes(lowerFilter) || 
        tpl.description.toLowerCase().includes(lowerFilter) ||
        tpl.category?.toLowerCase().includes(lowerFilter) ||
        tpl.techTags?.some(tag => tag.toLowerCase().includes(lowerFilter))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'time') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.usageCount - a.usageCount;
      }
    });
    
    return result;
  }, [filter, sortBy]);

  // Group by category
  const categoriesMap = useMemo(() => {
    const map: Record<string, AgentSquareItem[]> = {};
    filteredAgents.forEach(tpl => {
      const cat = tpl.category || '通用智能体';
      if (!map[cat]) map[cat] = [];
      map[cat].push(tpl);
    });
    return map;
  }, [filteredAgents]);

  // Card renderers
  const renderCard = (tpl: AgentSquareItem, categoryTheme: string) => {
    return (
      <motion.div 
        key={tpl.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6, scale: 1.015 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={() => onLaunchAgent?.(tpl.name)}
        className="group relative bg-white border border-slate-200/95 rounded-2xl p-6 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all flex flex-col justify-between cursor-pointer overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f011_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f011_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
        <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${categoryTheme} opacity-70 group-hover:opacity-100 transition-opacity`} />

        <div className="relative mb-5">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50/80 to-blue-50/30 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/40 group-hover:scale-110 group-hover:shadow-indigo-100 group-hover:shadow-md transition-all duration-300`}>
              <i className={`fas ${tpl.icon} text-lg`}></i>
            </div>
            
            <button 
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100/50 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300 shadow-sm opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
            >
              {lang === 'zh' ? '开启任务' : 'Launch'}
            </button>
          </div>
          
          <h3 className="text-base font-bold text-slate-800 mb-2.5 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
            {tpl.name}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-medium">
            {tpl.description}
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-1.5 truncate max-w-[120px]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span className="text-slate-600 font-bold truncate" title={tpl.owner}>{tpl.owner}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span>{tpl.createdAt}</span>
            <span>·</span>
            <span className="flex items-center gap-0.5 text-amber-500 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
              <i className="fas fa-bolt text-[9px]"></i>
              <span>{tpl.usageCount}</span>
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderRecommendedCard = (tpl: AgentSquareItem) => {
    const catColorTheme = CATEGORIES.find(c => c.field === tpl.category)?.color || 'from-indigo-500 to-blue-500';
    return (
      <motion.div 
        key={tpl.id}
        whileHover={{ y: -6, scale: 1.015 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={() => onLaunchAgent?.(tpl.name)}
        className="group relative bg-gradient-to-b from-indigo-50/15 via-white to-white border border-indigo-100 rounded-2xl p-6 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-400/80 transition-all flex flex-col justify-between cursor-pointer overflow-hidden shadow-sm"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f005_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f005_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />
        <div className={`absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b ${catColorTheme} opacity-80 group-hover:opacity-100 transition-opacity`} />

        <div className="relative pl-2">
          <div className="flex items-start justify-between mb-4">
            {/* Beautiful Dual-Ring Icon Container */}
            <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${catColorTheme} text-white flex items-center justify-center text-lg shadow-md shadow-indigo-500/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border-2 border-white`}>
              <i className={`fas ${tpl.icon}`}></i>
            </div>

            <button 
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 py-1.5 rounded-xl text-[11px] font-black bg-indigo-50/80 text-indigo-600 border border-indigo-100/60 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 flex items-center gap-1.5 shadow-sm"
            >
              <span>{lang === 'zh' ? '开启任务' : 'Launch'}</span>
              <i className="fas fa-play text-[8px]"></i>
            </button>
          </div>

          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-[9px] font-black tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-2 py-0.5 rounded-md uppercase">
              {tpl.category}
            </span>
          </div>

          <h3 className="text-base font-black text-slate-800 mb-2 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
            {tpl.name}
          </h3>
          
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-medium mb-4">
            {tpl.description}
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-slate-100 pt-3.5 text-[11px] text-slate-400 font-medium pl-2 mt-2">
          <div className="flex items-center gap-1.5 truncate max-w-[120px]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <span className="text-slate-600 font-bold truncate" title={tpl.owner}>{tpl.owner}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span>{tpl.createdAt}</span>
            <span>·</span>
            <span className="flex items-center gap-0.5 text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100/40">
              <i className="fas fa-bolt text-[9px]"></i>
              <span>{tpl.usageCount}</span>
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderNewReleaseCard = (tpl: AgentSquareItem) => {
    const catColorTheme = CATEGORIES.find(c => c.field === tpl.category)?.color || 'from-emerald-500 to-teal-500';
    return (
      <motion.div 
        key={tpl.id}
        whileHover={{ y: -6, scale: 1.015 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={() => onLaunchAgent?.(tpl.name)}
        className="group relative bg-gradient-to-br from-emerald-50/10 via-white to-white border border-emerald-100/90 rounded-2xl p-6 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-400/80 transition-all flex flex-col justify-between cursor-pointer overflow-hidden shadow-sm"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />
        <div className={`absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b ${catColorTheme} opacity-80 group-hover:opacity-100 transition-opacity`} />

        <div className="relative pl-2">
          <div className="flex items-start justify-between mb-4">
            {/* Beautiful Dual-Ring Icon Container with pulse dot */}
            <div className="relative">
              <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${catColorTheme} text-white flex items-center justify-center text-lg shadow-md shadow-emerald-500/10 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 border-2 border-white`}>
                <i className={`fas ${tpl.icon}`}></i>
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-50 flex items-center justify-center border border-white shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                <span className="w-1 h-1 rounded-full bg-indigo-600 animate-ping"></span>
                {lang === 'zh' ? '新上架' : 'NEW'}
              </span>
              <button 
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 py-1.5 rounded-xl text-[11px] font-black bg-emerald-50/80 text-emerald-600 border border-emerald-100/60 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 flex items-center gap-1.5 shadow-sm"
              >
                <span>{lang === 'zh' ? '开启任务' : 'Launch'}</span>
                <i className="fas fa-play text-[8px]"></i>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-[9px] font-black tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded-md uppercase">
              {tpl.category}
            </span>
          </div>

          <h3 className="text-base font-black text-slate-800 mb-2 leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
            {tpl.name}
          </h3>
          
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-medium mb-4">
            {tpl.description}
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-slate-100 pt-3.5 text-[11px] text-slate-400 font-medium pl-2 mt-2">
          <div className="flex items-center gap-1.5 truncate max-w-[120px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 font-bold truncate" title={tpl.owner}>{tpl.owner}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span>{tpl.createdAt}</span>
            <span>·</span>
            <span className="flex items-center gap-0.5 text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100/40">
              <i className="fas fa-bolt text-[9px]"></i>
              <span>{tpl.usageCount}</span>
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden relative">
      {/* Background Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-8 py-5 flex-shrink-0 shadow-sm relative z-10 backdrop-blur-md bg-white/95">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <i className="fas fa-cubes text-indigo-600 text-lg"></i>
            {lang === 'zh' ? '智能体广场' : 'Agent Square'}
          </h1>
          <p className="text-slate-400 text-xs font-medium mt-0.5">
            {lang === 'zh' ? '探索由大模型和油气行业核心知识联合驱动的专业智能体群落' : 'Discover specialized full-stack neural agents backed by domain models'}
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 scroll-smooth relative z-10">
        
        {/* Only show personalized recommendation block when NOT filtering/searching */}
        {!filter && (
          <div className="space-y-10 mb-10">
            
            {/* "为你推荐" Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-3.5 bg-indigo-600 rounded-full" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {lang === 'zh' ? '为你推荐' : 'Recommended'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendedAgents.map(agent => renderRecommendedCard(agent))}
              </div>
            </div>

            {/* "最近上新" - Newly Added Row */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {lang === 'zh' ? '最近上新' : 'Newly Released'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentlyAddedAgents.map(agent => renderNewReleaseCard(agent))}
              </div>
            </div>

          </div>
        )}

        {/* 全部智能体 Section with Left Sticky Vertical Sidebar Navigation */}
        <div className="space-y-6">
          {/* Header Row with Title, Search & Sort */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-full" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                {lang === 'zh' ? '全部智能体' : 'All Agents'}
              </h3>
            </div>
            
            {/* Search & Sort Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs"></i>
                <input 
                  type="text" 
                  placeholder={lang === 'zh' ? '搜索智能体、领域、标签...' : t.searchPlaceholder}
                  className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs w-64 bg-slate-50/50 hover:bg-slate-50 transition-colors shadow-inner font-medium"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                />
              </div>
              
              <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200/50">
                <button 
                  onClick={() => setSortBy('time')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'time' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {t.sortTime}
                </button>
                <button 
                  onClick={() => setSortBy('usage')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'usage' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {lang === 'zh' ? '热度排行' : t.sortUsage}
                </button>
              </div>
            </div>
          </div>

          {/* Two-Column Layout */}
          <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
            {/* Left Column: Vertical Category Menu (Sticky) */}
            {!filter && (
              <div className="w-full md:w-52 lg:w-56 flex-shrink-0 bg-white border border-slate-200/60 rounded-2xl p-4 sticky top-4 max-h-[calc(100vh-12rem)] overflow-y-auto no-scrollbar shadow-sm">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3.5 px-1.5 select-none">
                  {lang === 'zh' ? '分类导航' : 'Categories'}
                </div>
                <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 no-scrollbar">
                  {CATEGORIES.map(cat => {
                    const count = categoriesMap[cat.field]?.length || 0;
                    if (count === 0) return null;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          const el = document.getElementById(`cat-sec-${cat.id}`);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/30 hover:border-indigo-200/60 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-all text-left whitespace-nowrap md:whitespace-normal group shadow-sm hover:shadow"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <i className={`fas ${cat.icon} text-slate-400 group-hover:text-indigo-500 text-[10px] w-4 text-center`}></i>
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200/50 text-slate-500 group-hover:bg-indigo-100/50 group-hover:text-indigo-600 ml-1.5">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Right Column: Catalog Grid / Search Results */}
            <div className="flex-1 min-w-0 w-full">
              {filter ? (
                /* Search Results */
                <div>
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-200/60 pb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 shadow-sm">
                      <i className="fas fa-search text-sm animate-pulse"></i>
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-800">检索系统匹配结果</h2>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">找到 {filteredAgents.length} 个就绪的智能体系统</p>
                    </div>
                  </div>
                  
                  {filteredAgents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredAgents.map(tpl => {
                        const catTheme = CATEGORIES.find(c => c.field === tpl.category)?.color || 'from-indigo-500 to-blue-500';
                        return renderCard(tpl, catTheme);
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                      <i className="fas fa-robot text-5xl mb-4 opacity-20 text-slate-300"></i>
                      <p className="text-base font-semibold text-slate-400">未检索到匹配的智能体组件</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Default Catalog Grid organized by Category */
                <div className="space-y-6">
                  {CATEGORIES.map(cat => {
                    let items = categoriesMap[cat.field] || [];
                    if (items.length === 0) return null;
                    
                    return (
                      <div key={cat.id} id={`cat-sec-${cat.id}`} className="scroll-mt-6 pb-6">
                        {/* Category Section Header */}
                        <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow`}>
                              <i className={`fas ${cat.icon} text-xs`}></i>
                            </div>
                            <h4 className="text-sm font-black text-slate-800 tracking-tight">
                              {cat.name}
                              <span className="ml-1.5 text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                {items.length}
                              </span>
                            </h4>
                          </div>
                        </div>
                        
                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {items.map(tpl => renderCard(tpl, cat.color))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
