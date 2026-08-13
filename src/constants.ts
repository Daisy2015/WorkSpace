
import { Workspace, WorkspaceStatus, ResourceNode, KnowledgeItem, WorkspaceTemplate } from './types';

export const MOCK_TEMPLATES: WorkspaceTemplate[] = [
  // 一、地质勘探类（Exploration）
  {
    id: 'tpl-expl-1',
    name: '风险勘探空间',
    description: '勘探目标风险识别与综合评价',
    mbuCount: 8,
    usageCount: 142,
    createdAt: '2024-03-12',
    owner: '王晓东',
    tags: ['风险', '勘探', '评价'],
    category: '地质勘探',
    icon: 'fa-exclamation-triangle',
    defaultAgent: '风险勘探智能体'
  },
  {
    id: 'tpl-expl-2',
    name: '地震解释空间',
    description: '地震资料解释、断层识别、构造分析',
    mbuCount: 6,
    usageCount: 189,
    createdAt: '2024-02-15',
    owner: '李志刚',
    tags: ['地震', '断层', '构造'],
    category: '地质勘探',
    icon: 'fa-project-diagram',
    defaultAgent: '地震解释智能体'
  },
  {
    id: 'tpl-expl-3',
    name: '地层评价空间',
    description: '地层划分、层系分析、沉积研究',
    mbuCount: 5,
    usageCount: 124,
    createdAt: '2024-04-10',
    owner: '王晓东',
    tags: ['地层', '层系', '沉积'],
    category: '地质勘探',
    icon: 'fa-layer-group',
    defaultAgent: '地层评价智能体'
  },
  {
    id: 'tpl-expl-4',
    name: '储层评价空间',
    description: '储层参数评价、甜点识别',
    mbuCount: 7,
    usageCount: 235,
    createdAt: '2024-05-20',
    owner: '王晓东',
    tags: ['储层', '甜点', '评价'],
    category: '地质勘探',
    icon: 'fa-gem',
    defaultAgent: '储层评价智能体'
  },
  {
    id: 'tpl-expl-5',
    name: '构造研究空间',
    description: '构造分析与构造解释',
    mbuCount: 4,
    usageCount: 95,
    createdAt: '2024-06-01',
    owner: '张建国',
    tags: ['构造', '解释', '分析'],
    category: '地质勘探',
    icon: 'fa-compass',
    defaultAgent: '构造研究智能体'
  },
  {
    id: 'tpl-expl-6',
    name: '圈闭评价空间',
    description: '圈闭识别、圈闭评价',
    mbuCount: 5,
    usageCount: 112,
    createdAt: '2024-01-20',
    owner: '张建国',
    tags: ['圈闭', '识别', '评价'],
    category: '地质勘探',
    icon: 'fa-circle-notch',
    defaultAgent: '圈闭评价智能体'
  },
  {
    id: 'tpl-expl-7',
    name: '有利区优选空间',
    description: '有利目标筛选与综合评价',
    mbuCount: 9,
    usageCount: 245,
    createdAt: '2024-07-02',
    owner: '李志刚',
    tags: ['优选', '筛选', '目标'],
    category: '地质勘探',
    icon: 'fa-award',
    defaultAgent: '有利区优选智能体'
  },
  {
    id: 'tpl-expl-8',
    name: '勘探部署空间',
    description: '勘探井部署方案研究',
    mbuCount: 6,
    usageCount: 156,
    createdAt: '2024-08-05',
    owner: '张建国',
    tags: ['部署', '井位', '设计'],
    category: '地质勘探',
    icon: 'fa-map-marked-alt',
    defaultAgent: '勘探部署智能体'
  },

  // 二、开发研究类（Development）
  {
    id: 'tpl-dev-1',
    name: '单井分析空间',
    description: '单井动态分析、产量诊断',
    mbuCount: 4,
    usageCount: 312,
    createdAt: '2024-02-18',
    owner: '陈力学',
    tags: ['单井', '产量', '诊断'],
    category: '开发研究',
    icon: 'fa-tint',
    defaultAgent: '单井产量诊断智能体'
  },
  {
    id: 'tpl-dev-2',
    name: '开发评价空间',
    description: '区块开发效果评价',
    mbuCount: 8,
    usageCount: 198,
    createdAt: '2024-03-05',
    owner: '赵敏',
    tags: ['开发', '区块', '评价'],
    category: '开发研究',
    icon: 'fa-chart-bar',
    defaultAgent: '开发评价智能体'
  },
  {
    id: 'tpl-dev-3',
    name: '注采分析空间',
    description: '注采关系分析与优化',
    mbuCount: 5,
    usageCount: 167,
    createdAt: '2024-04-25',
    owner: '赵敏',
    tags: ['注采', '优化', '关系'],
    category: '开发研究',
    icon: 'fa-sync-alt',
    defaultAgent: '注采分析智能体'
  },
  {
    id: 'tpl-dev-4',
    name: '剩余油分析空间',
    description: '剩余油分布分析',
    mbuCount: 6,
    usageCount: 224,
    createdAt: '2024-05-12',
    owner: '赵敏',
    tags: ['剩余油', '分布', '分析'],
    category: '开发研究',
    icon: 'fa-oil-can',
    defaultAgent: '剩余油分析智能体'
  },
  {
    id: 'tpl-dev-5',
    name: '措施评价空间',
    description: '压裂、酸化措施效果评价',
    mbuCount: 4,
    usageCount: 145,
    createdAt: '2024-01-30',
    owner: '陈力学',
    tags: ['压裂', '酸化', '措施', '评价'],
    category: '开发研究',
    icon: 'fa-clipboard-check',
    defaultAgent: '措施评价智能体'
  },
  {
    id: 'tpl-dev-6',
    name: '开发方案空间',
    description: '开发方案设计与优化',
    mbuCount: 10,
    usageCount: 289,
    createdAt: '2024-06-18',
    owner: '赵敏',
    tags: ['方案', '设计', '优化'],
    category: '开发研究',
    icon: 'fa-file-alt',
    defaultAgent: '开发方案智能体'
  },
  {
    id: 'tpl-dev-7',
    name: '调整方案空间',
    description: '开发调整方案研究',
    mbuCount: 7,
    usageCount: 134,
    createdAt: '2024-07-22',
    owner: '赵敏',
    tags: ['调整', '方案', '研究'],
    category: '开发研究',
    icon: 'fa-sliders-h',
    defaultAgent: '调整方案智能体'
  },
  {
    id: 'tpl-dev-8',
    name: '油藏动态空间',
    description: '油藏动态综合分析',
    mbuCount: 9,
    usageCount: 256,
    createdAt: '2024-08-11',
    owner: '赵敏',
    tags: ['油藏', '动态', '综合'],
    category: '开发研究',
    icon: 'fa-wave-square',
    defaultAgent: '油藏动态智能体'
  },

  // 三、生产运行类（Production）
  {
    id: 'tpl-prod-1',
    name: '生产运行分析空间',
    description: '日常生产运行监测、指标分析、异常识别',
    mbuCount: 12,
    usageCount: 421,
    createdAt: '2024-01-10',
    owner: '孙大海',
    tags: ['运行', '监测', '指标'],
    category: '生产运行',
    icon: 'fa-desktop',
    defaultAgent: '生产运行分析智能体'
  },
  {
    id: 'tpl-prod-2',
    name: '单井生产监控空间',
    description: '单井生产状态监测与异常分析',
    mbuCount: 5,
    usageCount: 389,
    createdAt: '2024-02-25',
    owner: '孙大海',
    tags: ['单井', '监控', '异常'],
    category: '生产运行',
    icon: 'fa-video',
    defaultAgent: '单井生产监控智能体'
  },
  {
    id: 'tpl-prod-3',
    name: '区块生产分析空间',
    description: '区块生产动态分析与运行评价',
    mbuCount: 8,
    usageCount: 245,
    createdAt: '2024-03-18',
    owner: '孙大海',
    tags: ['区块', '动态', '评价'],
    category: '生产运行',
    icon: 'fa-th-large',
    defaultAgent: '区块生产分析智能体'
  },
  {
    id: 'tpl-prod-4',
    name: '产量预测空间',
    description: '单井/区块产量预测分析',
    mbuCount: 6,
    usageCount: 335,
    createdAt: '2024-04-05',
    owner: '孙大海',
    tags: ['产量', '预测', '分析'],
    category: '生产运行',
    icon: 'fa-chart-line',
    defaultAgent: '产量预测智能体'
  },
  {
    id: 'tpl-prod-5',
    name: '含水分析空间',
    description: '含水变化趋势分析及诊断',
    mbuCount: 4,
    usageCount: 198,
    createdAt: '2024-05-15',
    owner: '孙大海',
    tags: ['含水', '趋势', '诊断'],
    category: '生产运行',
    icon: 'fa-water',
    defaultAgent: '含水分析智能体'
  },
  {
    id: 'tpl-prod-6',
    name: '压力分析空间',
    description: '地层压力、井口压力分析',
    mbuCount: 5,
    usageCount: 176,
    createdAt: '2024-06-08',
    owner: '孙大海',
    tags: ['压力', '地层', '井口'],
    category: '生产运行',
    icon: 'fa-tachometer-alt',
    defaultAgent: '压力分析智能体'
  },
  {
    id: 'tpl-prod-7',
    name: '注水运行空间',
    description: '注水效果分析与运行优化',
    mbuCount: 7,
    usageCount: 189,
    createdAt: '2024-07-12',
    owner: '孙大海',
    tags: ['注水', '效果', '优化'],
    category: '生产运行',
    icon: 'fa-shower',
    defaultAgent: '注水运行智能体'
  },
  {
    id: 'tpl-prod-8',
    name: '异常诊断空间',
    description: '生产异常识别与原因分析',
    mbuCount: 6,
    usageCount: 295,
    createdAt: '2024-08-01',
    owner: '孙大海',
    tags: ['异常', '识别', '原因'],
    category: '生产运行',
    icon: 'fa-user-md',
    defaultAgent: '生产异常诊断智能体'
  },
  {
    id: 'tpl-prod-9',
    name: '生产优化空间',
    description: '生产参数优化与运行优化',
    mbuCount: 8,
    usageCount: 267,
    createdAt: '2024-08-15',
    owner: '孙大海',
    tags: ['优化', '参数', '运行'],
    category: '生产运行',
    icon: 'fa-sliders-h',
    defaultAgent: '生产优化智能体'
  },

  // 四、工程技术类（Engineering）
  {
    id: 'tpl-eng-1',
    name: '压裂设计空间',
    description: '压裂方案设计与参数优化',
    mbuCount: 7,
    usageCount: 289,
    createdAt: '2024-02-14',
    owner: '陈力学',
    tags: ['压裂', '设计', '参数', '优化'],
    category: '工程技术',
    icon: 'fa-compress-arrows-alt',
    defaultAgent: '压裂设计智能体'
  },
  {
    id: 'tpl-eng-2',
    name: '修井分析空间',
    description: '修井方案分析与效果评价',
    mbuCount: 4,
    usageCount: 156,
    createdAt: '2024-03-22',
    owner: '陈力学',
    tags: ['修井', '方案', '评价'],
    category: '工程技术',
    icon: 'fa-wrench',
    defaultAgent: '修井分析智能体'
  },
  {
    id: 'tpl-eng-3',
    name: '钻井方案空间',
    description: '钻井方案设计与优化',
    mbuCount: 8,
    usageCount: 312,
    createdAt: '2024-04-11',
    owner: '陈力学',
    tags: ['钻井', '设计', '优化'],
    category: '工程技术',
    icon: 'fa-tools',
    defaultAgent: '钻井方案智能体'
  },
  {
    id: 'tpl-eng-4',
    name: '完井分析空间',
    description: '完井工艺分析与评价',
    mbuCount: 5,
    usageCount: 178,
    createdAt: '2024-05-19',
    owner: '陈力学',
    tags: ['完井', '工艺', '评价'],
    category: '工程技术',
    icon: 'fa-toolbox',
    defaultAgent: '完井分析智能体'
  },
  {
    id: 'tpl-eng-5',
    name: '工艺优化空间',
    description: '采油工艺优化分析',
    mbuCount: 6,
    usageCount: 194,
    createdAt: '2024-06-25',
    owner: '陈力学',
    tags: ['工艺', '采油', '优化'],
    category: '工程技术',
    icon: 'fa-cog',
    defaultAgent: '工艺优化智能体'
  },
  {
    id: 'tpl-eng-6',
    name: '措施设计空间',
    description: '增产增注措施设计',
    mbuCount: 5,
    usageCount: 143,
    createdAt: '2024-07-08',
    owner: '陈力学',
    tags: ['措施', '增产', '增注'],
    category: '工程技术',
    icon: 'fa-pencil-ruler',
    defaultAgent: '措施设计智能体'
  },
  {
    id: 'tpl-eng-7',
    name: '工程风险分析空间',
    description: '工程实施风险分析',
    mbuCount: 6,
    usageCount: 221,
    createdAt: '2024-07-30',
    owner: '陈力学',
    tags: ['风险', '工程', '分析'],
    category: '工程技术',
    icon: 'fa-exclamation-triangle',
    defaultAgent: '工程风险智能体'
  },
  {
    id: 'tpl-eng-8',
    name: '工程效果评价空间',
    description: '工程实施效果评价',
    mbuCount: 6,
    usageCount: 185,
    createdAt: '2024-08-18',
    owner: '陈力学',
    tags: ['效果', '评价', '实施'],
    category: '工程技术',
    icon: 'fa-star',
    defaultAgent: '工程评价智能体'
  },

  // 五、综合研究类（Integrated Study）
  {
    id: 'tpl-int-1',
    name: '综合研究空间',
    description: '多专业联合研究与分析',
    mbuCount: 12,
    usageCount: 345,
    createdAt: '2024-01-25',
    owner: '李明',
    tags: ['综合', '多专业', '联合'],
    category: '综合研究',
    icon: 'fa-users',
    defaultAgent: '综合研究智能体'
  },
  {
    id: 'tpl-int-2',
    name: '专题研究空间',
    description: '专题课题分析与成果整理',
    mbuCount: 8,
    usageCount: 211,
    createdAt: '2024-03-14',
    owner: '李明',
    tags: ['专题', '课题', '成果'],
    category: '综合研究',
    icon: 'fa-book-open',
    defaultAgent: '专题研究智能体'
  },
  {
    id: 'tpl-int-3',
    name: '方案论证空间',
    description: '开发方案、部署方案论证',
    mbuCount: 9,
    usageCount: 198,
    createdAt: '2024-04-28',
    owner: '李明',
    tags: ['论证', '方案', '部署'],
    category: '综合研究',
    icon: 'fa-balance-scale',
    defaultAgent: '方案论证智能体'
  },
  {
    id: 'tpl-int-4',
    name: '技术评价空间',
    description: '技术适用性与效果评价',
    mbuCount: 6,
    usageCount: 154,
    createdAt: '2024-05-22',
    owner: '李明',
    tags: ['技术', '适用性', '评价'],
    category: '综合研究',
    icon: 'fa-microscope',
    defaultAgent: '技术评价智能体'
  },
  {
    id: 'tpl-int-5',
    name: '对标分析空间',
    description: '区块、油藏、多方案对比分析',
    mbuCount: 8,
    usageCount: 187,
    createdAt: '2024-06-30',
    owner: '李明',
    tags: ['对标', '对比', '区块'],
    category: '综合研究',
    icon: 'fa-columns',
    defaultAgent: '对标分析智能体'
  },
  {
    id: 'tpl-int-6',
    name: '专家协同空间',
    description: '多专家联合分析与评审',
    mbuCount: 7,
    usageCount: 132,
    createdAt: '2024-07-15',
    owner: '李明',
    tags: ['专家', '协同', '评审'],
    category: '综合研究',
    icon: 'fa-user-friends',
    defaultAgent: '专家协同智能体'
  },
  {
    id: 'tpl-int-7',
    name: '决策支持空间',
    description: '综合决策分析与辅助决策',
    mbuCount: 10,
    usageCount: 265,
    createdAt: '2024-08-10',
    owner: '李明',
    tags: ['决策', '支持', '辅助'],
    category: '综合研究',
    icon: 'fa-gavel',
    defaultAgent: '决策支持智能体'
  },

  // 六、生产管理类（Management）
  {
    id: 'tpl-mgt-1',
    name: '经营分析空间',
    description: '生产经营指标综合分析',
    mbuCount: 8,
    usageCount: 298,
    createdAt: '2024-02-12',
    owner: '周安全',
    tags: ['经营', '指标', '综合'],
    category: '生产管理',
    icon: 'fa-calculator',
    defaultAgent: '经营分析智能体'
  },
  {
    id: 'tpl-mgt-2',
    name: 'KPI分析空间',
    description: '关键指标监控与分析',
    mbuCount: 5,
    usageCount: 212,
    createdAt: '2024-03-29',
    owner: '周安全',
    tags: ['KPI', '监控', '关键'],
    category: '生产管理',
    icon: 'fa-key',
    defaultAgent: 'KPI分析智能体'
  },
  {
    id: 'tpl-mgt-3',
    name: '生产调度空间',
    description: '日常生产调度与运行分析',
    mbuCount: 6,
    usageCount: 189,
    createdAt: '2024-05-04',
    owner: '周安全',
    tags: ['调度', '运行', '日常'],
    category: '生产管理',
    icon: 'fa-calendar-alt',
    defaultAgent: '生产调度智能体'
  },
  {
    id: 'tpl-mgt-4',
    name: '风险预警空间',
    description: '生产风险预警与处置建议',
    mbuCount: 6,
    usageCount: 245,
    createdAt: '2024-06-12',
    owner: '周安全',
    tags: ['风险', '预警', '处置'],
    category: '生产管理',
    icon: 'fa-shield-alt',
    defaultAgent: '风险预警智能体'
  },
  {
    id: 'tpl-mgt-5',
    name: '计划管理空间',
    description: '年度/月度生产计划分析',
    mbuCount: 5,
    usageCount: 134,
    createdAt: '2024-07-20',
    owner: '周安全',
    tags: ['计划', '年度', '月度'],
    category: '生产管理',
    icon: 'fa-tasks',
    defaultAgent: '计划管理智能体'
  },
  {
    id: 'tpl-mgt-6',
    name: '经营决策空间',
    description: '综合经营决策分析',
    mbuCount: 8,
    usageCount: 176,
    createdAt: '2024-08-08',
    owner: '周安全',
    tags: ['经营', '决策', '分析'],
    category: '生产管理',
    icon: 'fa-lightbulb',
    defaultAgent: '经营决策智能体'
  },

  // 七、成果编制类（Knowledge & Reporting）
  {
    id: 'tpl-rep-1',
    name: '数据分析空间',
    description: '自然语言查询数据、统计分析、指标分析',
    mbuCount: 6,
    usageCount: 456,
    createdAt: '2024-01-18',
    owner: '李明',
    tags: ['数据', '查询', '统计'],
    category: '成果编制',
    icon: 'fa-database',
    defaultAgent: '智能问数'
  },
  {
    id: 'tpl-rep-2',
    name: '报告编制空间',
    description: '自动生成日报、月报、专题报告、汇报材料',
    mbuCount: 5,
    usageCount: 512,
    createdAt: '2024-02-28',
    owner: '李明',
    tags: ['报告', '日报', '月报'],
    category: '成果编制',
    icon: 'fa-file-alt',
    defaultAgent: '智能报告'
  },
  {
    id: 'tpl-rep-3',
    name: '图件制作空间',
    description: '自动生成曲线图、专题图、统计图、汇报图',
    mbuCount: 4,
    usageCount: 389,
    createdAt: '2024-04-14',
    owner: '李明',
    tags: ['图件', '曲线图', '平面图'],
    category: '成果编制',
    icon: 'fa-chart-area',
    defaultAgent: '智能成图'
  },
  {
    id: 'tpl-rep-4',
    name: 'PPT制作空间',
    description: '自动生成汇报PPT及页面设计',
    mbuCount: 5,
    usageCount: 321,
    createdAt: '2024-05-25',
    owner: '李明',
    tags: ['PPT', '汇报', '页面设计'],
    category: '成果编制',
    icon: 'fa-file-powerpoint',
    defaultAgent: '智能成图'
  },
  {
    id: 'tpl-rep-5',
    name: '文档编写空间',
    description: '技术文档、制度文档、方案文档编写',
    mbuCount: 4,
    usageCount: 254,
    createdAt: '2024-07-02',
    owner: '李明',
    tags: ['文档', '技术', '制度'],
    category: '成果编制',
    icon: 'fa-file-word',
    defaultAgent: '智能报告'
  },
  {
    id: 'tpl-rep-6',
    name: '资料整理空间',
    description: '文档整理、知识归纳、成果汇编',
    mbuCount: 5,
    usageCount: 231,
    createdAt: '2024-08-12',
    owner: '李明',
    tags: ['资料', '整理', '知识', '成果'],
    category: '成果编制',
    icon: 'fa-archive',
    defaultAgent: '智能报告'
  },
  {
    id: 'tpl-rep-7',
    name: '钻完井报告校核空间',
    description: '钻完井报告、技术设计与方案规范性智能校核',
    mbuCount: 5,
    usageCount: 310,
    createdAt: '2024-08-15',
    owner: '李明',
    tags: ['报告校核', '钻完井', '合规检测'],
    category: '成果编制',
    icon: 'fa-check-double',
    defaultAgent: '报告校核'
  },
  {
    id: 'tpl-rep-8',
    name: '采购合同校核空间',
    description: '采购合同、商务标书及履约条款合规性与风险因子智能校核',
    mbuCount: 6,
    usageCount: 285,
    createdAt: '2024-08-16',
    owner: '李明',
    tags: ['合同校核', '采购管理', '报告校核'],
    category: '成果编制',
    icon: 'fa-file-signature',
    defaultAgent: '报告校核'
  }
];

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: 'ws-procurement-contract-check',
    name: '采购合同校核空间',
    mbuCount: 6,
    createdAt: '2026-08-12',
    status: WorkspaceStatus.DRAFT,
    owner: '李明',
    description: '用于采购合同、商务招投标书及履约条款的合规性、要素完整性、法律与财务风险及一致性自动校核，绑定“报告校核”。',
    defaultAgent: '报告校核'
  },
  {
    id: 'ws-doc-qa',
    name: '采购合同文档问答空间',
    mbuCount: 5,
    createdAt: '2026-08-11',
    status: WorkspaceStatus.DRAFT,
    owner: '李明',
    description: '面向法务与商务采购的合同文档智能问答及条款合规检索工作台，集成历史采购合同、履约条款规范并绑定“文档问答”。',
    defaultAgent: '文档问答'
  },
  {
    id: 'ws-drilling-report-check',
    name: '钻完井报告校核',
    mbuCount: 6,
    createdAt: '2026-08-08',
    status: WorkspaceStatus.DRAFT,
    owner: '李明',
    description: '专门用于钻完井地质设计、完井报告及施工技术方案的合规性、格式规范与数据逻辑一致性自动校核，绑定“报告校核”。',
    defaultAgent: '报告校核'
  },
  {
    id: 'ws-risk-evaluation',
    name: '顺北区块风险勘探目标评价空间',
    mbuCount: 8,
    createdAt: '2026-07-20',
    status: WorkspaceStatus.DRAFT,
    owner: '李明',
    description: '面向地质专家的顺北区块风险勘探目标智能评价空间，绑定“风险勘探目标评价智能体”。',
    defaultAgent: '勘探目标评价'
  },
  {
    id: 'ws-drilling-x1',
    name: 'X-1井钻井分析工作空间',
    mbuCount: 5,
    createdAt: '2024-05-21',
    status: WorkspaceStatus.DRAFT,
    owner: '陈力学',
    description: 'X-1 井钻井工程核心工作台，集成设计、日报、参数及复杂情况分析。',
    defaultAgent: '智能问数'
  },
  {
    id: 'ws-001',
    name: '北海油田分析 2024',
    mbuCount: 3,
    createdAt: '2026-05-10',
    status: WorkspaceStatus.DRAFT,
    owner: '李明',
    description: '针对第 4 区块地震数据的初步分析。',
    defaultAgent: '智能报告'
  },
  {
    id: 'ws-002',
    name: '钻井优化 - X1 号井',
    mbuCount: 12,
    createdAt: '2024-04-22',
    status: WorkspaceStatus.COMPLETED,
    owner: '陈莎拉',
    description: '深水钻井参数优化报告。',
    defaultAgent: '智能成图'
  },
  {
    id: 'ws-003',
    name: '第一季度产量回顾',
    mbuCount: 5,
    createdAt: '2024-01-15',
    status: WorkspaceStatus.ARCHIVED,
    owner: '李志刚',
    description: '东部扇区所有活跃油井的季度回顾。',
    defaultAgent: '智能问数'
  },
  {
    id: 'ws-004',
    name: 'B 区块地震解释任务',
    mbuCount: 8,
    createdAt: '2024-05-12',
    status: WorkspaceStatus.DRAFT,
    owner: '李明',
    description: '针对新采集的三维地震数据进行精细构造解释。',
    defaultAgent: '智能成图'
  },
  {
    id: 'ws-005',
    name: '深水油藏数值模拟',
    mbuCount: 15,
    createdAt: '2024-03-30',
    status: WorkspaceStatus.COMPLETED,
    owner: '赵丽',
    description: '模拟深水环境下不同注水方案的采收率预测。',
    defaultAgent: '单井产量诊断'
  },
  {
    id: 'ws-006',
    name: '管道完整性年度审计',
    mbuCount: 4,
    createdAt: '2024-02-10',
    status: WorkspaceStatus.ARCHIVED,
    owner: '周安全',
    description: '2023年度输油管道腐蚀检测与风险评估审计报告。',
    defaultAgent: '单井产量诊断'
  },
  {
    id: 'ws-007',
    name: '地球化学特征分析报告',
    mbuCount: 6,
    createdAt: '2024-05-15',
    status: WorkspaceStatus.DRAFT,
    owner: '李明',
    description: '源岩样品的热解分析与生物标志物特征研究。',
    defaultAgent: '智能报告'
  },
  {
    id: 'ws-008',
    name: '海上平台安全协议审查',
    mbuCount: 2,
    createdAt: '2024-04-05',
    status: WorkspaceStatus.COMPLETED,
    owner: '王健康',
    description: '更新海上作业安全操作规程以符合最新法规。',
    defaultAgent: '智能问数'
  },
  {
    id: 'ws-009',
    name: '勘探风险综合评估',
    mbuCount: 9,
    createdAt: '2024-05-18',
    status: WorkspaceStatus.DRAFT,
    owner: '李明',
    description: '结合地质风险与经济模型的新区块勘探可行性研究。',
    defaultAgent: '单井产量诊断'
  }
];

export const MOCK_RESOURCE_TREE: ResourceNode[] = [
  {
    id: 'dom-1',
    name: '地质与地球物理 (G&G)',
    type: 'domain',
    children: [
      {
        id: 'mbu-1',
        name: 'A 区块地震解释',
        type: 'mbu',
        children: [
          { id: 'art-1', name: '2D 地震测线.segy', type: 'artifact', meta: { sourceType: 'system', fileType: 'Data' } },
          { id: 'art-2', name: '层位报告.pdf', type: 'artifact', meta: { sourceType: 'system', fileType: 'PDF' } },
        ]
      },
      {
        id: 'mbu-2',
        name: '09 号井岩心分析',
        type: 'mbu',
        children: [
          { id: 'art-3', name: '孔隙度/渗透率数据.xlsx', type: 'artifact', meta: { sourceType: 'local', fileType: 'Excel' } }
        ]
      }
    ]
  },
  {
    id: 'dom-2',
    name: '钻井工程',
    type: 'domain',
    children: [
      {
        id: 'mbu-3',
        name: '实时录井',
        type: 'mbu',
        children: [
           { id: 'art-4', name: '气相色谱日志', type: 'artifact', meta: { sourceType: 'system', fileType: 'Log' } }
        ]
      }
    ]
  }
];

// --- Specific Tree for Contract Checking Scenario ---
export const CONTRACT_CHECK_RESOURCE_TREE: ResourceNode[] = [
  {
    id: 'cc-folder-1',
    name: '待校核合同文件',
    type: 'folder',
    children: [
      {
        id: 'cc-doc-1',
        name: '油气装备年度采购框架合同协议_V3.docx',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      },
      {
        id: 'cc-doc-2',
        name: '钻采设备技术服务采购招标响应文件_招投标标书.pdf',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      }
    ]
  },
  {
    id: 'cc-folder-2',
    name: '校核标准与审查强条',
    type: 'folder',
    children: [
      {
        id: 'cc-std-1',
        name: '采购合同审查与合规强条标准 V1.0',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      },
      {
        id: 'cc-std-2',
        name: '中华人民共和国民法典（合同编）合规指引',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      },
      {
        id: 'cc-std-3',
        name: '企业采购与招标违约责任及防范规范',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      },
      {
        id: 'cc-std-4',
        name: '国有企业采购与招投标合规审计强条',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      }
    ]
  },
  {
    id: 'cc-folder-3',
    name: '合同关联规则库',
    type: 'folder',
    children: [
      {
        id: 'cc-rule-1',
        name: '付款条件与履约节点一致性规则',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      },
      {
        id: 'cc-rule-2',
        name: '违约金上限与法律风险提示规则',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      },
      {
        id: 'cc-rule-3',
        name: '供应商资质与主体盖章核验规则',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      },
      {
        id: 'cc-rule-4',
        name: '争议解决管辖地与仲裁条款规则',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      },
      {
        id: 'cc-rule-5',
        name: '质保金与验收标准一致性强条',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      }
    ]
  }
];

// --- Specific Tree for Report Checking Scenario ---
export const REPORT_CHECK_RESOURCE_TREE: ResourceNode[] = [
  {
    id: 'rc-folder-2',
    name: '校核标准',
    type: 'folder',
    children: [
      {
        id: 'rc-std-1',
        name: '钻完井设计报告校核标准',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      },
      {
        id: 'rc-std-2',
        name: '石油天然气钻井工程设计规范 GB/T 24971',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      },
      {
        id: 'rc-std-3',
        name: '井身结构与完井质量验收技术规程',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      },
      {
        id: 'rc-std-4',
        name: '钻井工程强条合规审查细则',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      }
    ]
  },
  {
    id: 'rc-folder-3',
    name: '关联规则',
    type: 'folder',
    children: [
      {
        id: 'rc-rule-1',
        name: '井身结构设计规则',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      },
      {
        id: 'rc-rule-2',
        name: '钻井液设计规则',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      },
      {
        id: 'rc-rule-3',
        name: '固井套管强度计算规则',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      },
      {
        id: 'rc-rule-4',
        name: '地层压力与气防安全比对规则',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      },
      {
        id: 'rc-rule-5',
        name: '井控安全强条约束规范',
        type: 'artifact',
        meta: { sourceType: 'system', fileType: 'Outcome' }
      }
    ]
  }
];

// --- Specific Tree for Drilling Engineer Scenario ---
export const DRILLING_RESOURCE_TREE: ResourceNode[] = [
  {
    id: 'dom-1',
    name: '勘探 (6903)',
    type: 'domain',
    children: [
      {
        id: 'mbu-1',
        name: '勘探-作业 (251)',
        type: 'mbu',
        children: [
          {
            id: 'mbu-1-1',
            name: '勘探-作业-油气田 (42)',
            type: 'mbu',
            children: [
              { 
                id: 'art-1-1-1', 
                name: '勘探-作业-油气田-钻井 (5)', 
                type: 'artifact',
                children: [
                  { id: 'art-1-1-1-out', name: '钻井设计方案 (文档)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
                ]
              },
              { 
                id: 'art-1-1-2', 
                name: '勘探-作业-油气田-完井 (2)', 
                type: 'artifact',
                children: [
                  { id: 'art-1-1-2-out', name: '完井总结报告 (报告)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
                ]
              },
              { 
                id: 'art-1-1-3', 
                name: '勘探-作业-油气田-录井 (3)', 
                type: 'artifact',
                children: [
                  { id: 'art-1-1-3-out', name: '录井数据表 (数据)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
                ]
              },
              { 
                id: 'art-1-1-4', 
                name: '勘探-作业-油气田-测井 (4)', 
                type: 'artifact',
                children: [
                  { id: 'art-1-1-4-out', name: '测井曲线图 (图像)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
                ]
              },
              { 
                id: 'art-1-1-5', 
                name: '勘探-作业-油气田-测试 (3)', 
                type: 'artifact',
                children: [
                  { id: 'art-1-1-5-out', name: '试油测试报告 (报告)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
                ]
              },
              { 
                id: 'art-1-1-6', 
                name: '勘探-作业-油气田-物化探 (5)', 
                type: 'artifact',
                children: [
                  { id: 'art-1-1-6-out', name: '物探成果图 (图像)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
                ]
              },
              { 
                id: 'art-1-1-7', 
                name: '勘探-作业-油气田-试油 (4)', 
                type: 'artifact',
                children: [
                  { id: 'art-1-1-7-out', name: '试油作业记录 (文档)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
                ]
              },
              { 
                id: 'art-1-1-8', 
                name: '勘探-作业-油气田-油藏工程 (4)', 
                type: 'artifact',
                children: [
                  { id: 'art-1-1-8-out', name: '油藏评价方案 (方案)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
                ]
              },
              { 
                id: 'art-1-1-9', 
                name: '勘探-作业-油气田-地质 (11)', 
                type: 'artifact',
                children: [
                  { id: 'art-1-1-9-out', name: '地质研究报告 (报告)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
                ]
              },
              { 
                id: 'art-1-1-10', 
                name: '勘探-作业-油气田-运营保障 (1)', 
                type: 'artifact',
                children: [
                  { id: 'art-1-1-10-out', name: '运营周报 (报表)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
                ]
              },
            ]
          },
          { 
            id: 'mbu-1-2', 
            name: '勘探-作业-区域 (7)', 
            type: 'mbu',
            children: [
              { id: 'mbu-1-2-out', name: '区域地质评价 (文档)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
            ]
          },
          { 
            id: 'mbu-1-3', 
            name: '勘探-作业-组织机构 (6)', 
            type: 'mbu',
            children: [
              { id: 'mbu-1-3-out', name: '组织架构图 (图像)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
            ]
          },
          { 
            id: 'mbu-1-4', 
            name: '勘探-作业-地震工区 (22)', 
            type: 'mbu',
            children: [
              { id: 'mbu-1-4-out', name: '地震工区范围 (数据)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
            ]
          },
          { 
            id: 'mbu-1-5', 
            name: '勘探-作业-非地震工区 (6)', 
            type: 'mbu',
            children: [
              { id: 'mbu-1-5-out', name: '非地震资料汇总 (报表)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
            ]
          },
          { 
            id: 'mbu-1-6', 
            name: '勘探-作业-地震线束 (8)', 
            type: 'mbu',
            children: [
              { id: 'mbu-1-6-out', name: '地震线束分布 (图像)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
            ]
          },
          { 
            id: 'mbu-1-7', 
            name: '勘探-作业-区块 (15)', 
            type: 'mbu',
            children: [
              { id: 'mbu-1-7-out', name: '区块评价报告 (报告)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
            ]
          },
          { 
            id: 'mbu-1-8', 
            name: '勘探-作业-剖面线 (17)', 
            type: 'mbu',
            children: [
              { id: 'mbu-1-8-out', name: '地质剖面图 (图像)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
            ]
          },
          { 
            id: 'mbu-1-9', 
            name: '勘探-作业-井筒 (83)', 
            type: 'mbu',
            children: [
              { id: 'mbu-1-9-out', name: '井筒结构图 (图像)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
            ]
          },
          { 
            id: 'mbu-1-10', 
            name: '勘探-作业-井 (45)', 
            type: 'mbu',
            children: [
              { id: 'mbu-1-10-out', name: '单井评价报告 (报告)', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
            ]
          },
        ]
      }
    ]
  }
];

export const EMPTY_RESOURCE_TREE: ResourceNode[] = [];

export const MOCK_KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    id: 'kb-1',
    title: 'X-1井 完井设计方案初稿.docx',
    type: 'doc',
    source: 'workspace',
    mbuTag: '完井工程',
    refWorkspaceName: '钻井优化 - X1 号井',
    createdAt: '2024-05-18 10:30',
    size: '2.4 MB',
    tags: ['重要', '设计'],
    description: '由工作空间 AI 辅助生成的完井设计草案，包含管柱图。',
    isPublic: false
  },
  {
    id: 'kb-2',
    title: '区域地质构造图_v2.png',
    type: 'img',
    source: 'upload',
    mbuTag: '地质研究',
    createdAt: '2024-05-15 14:20',
    size: '5.1 MB',
    tags: ['图件'],
    description: '手动上传的区域构造图扫描件。',
    isPublic: true
  },
  {
    id: 'kb-3',
    title: '2024 Q1 生产数据汇总.xlsx',
    type: 'xls',
    source: 'workspace',
    mbuTag: '生产运行',
    refWorkspaceName: '第一季度产量回顾',
    createdAt: '2024-04-10 09:15',
    size: '1.8 MB',
    tags: ['数据', '月报'],
    description: '季度生产数据清洗后的结果表。',
    isPublic: false
  },
  {
    id: 'kb-4',
    title: '测井解释标准规范 2023版.pdf',
    type: 'pdf',
    source: 'upload',
    mbuTag: '测井',
    createdAt: '2024-01-05 11:00',
    size: '8.5 MB',
    tags: ['规范', '参考'],
    description: '集团发布的最新测井解释操作规范。',
    isPublic: true
  },
  {
    id: 'kb-5',
    title: 'B区块 风险评估报告 (AI Outcome)',
    type: 'outcome',
    source: 'workspace',
    mbuTag: '风险管理',
    refWorkspaceName: '勘探风险综合评估',
    createdAt: '2024-05-19 16:45',
    size: '150 KB',
    tags: ['成果', 'AI生成'],
    description: 'AI 根据地质参数自动生成的风险评估摘要。',
    isPublic: true
  }
];
