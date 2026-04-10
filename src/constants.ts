
import { Workspace, WorkspaceStatus, ResourceNode, KnowledgeItem, WorkspaceTemplate } from './types';

export const MOCK_TEMPLATES: WorkspaceTemplate[] = [
  {
    id: 'tpl-risk-eval',
    name: '风险目标评价',
    description: '集成区域构造、烃源岩、砂体及地震属性等多维度风险评估工具，支持历史失利井分析与资源量参数计算。',
    mbuCount: 8,
    usageCount: 0,
    createdAt: '2024-08-15',
    owner: '勘探研究部',
    tags: ['风险', '评价', '勘探'],
    category: '地质研究',
    icon: 'fa-exclamation-triangle'
  },
  {
    id: 'tpl-1',
    name: '标准钻井分析模版',
    description: '包含钻井设计、日报、参数分析的标准工作流配置。',
    mbuCount: 5,
    usageCount: 128,
    createdAt: '2024-01-15',
    owner: '系统管理员',
    tags: ['钻井', '标准'],
    category: '钻完井工程',
    icon: 'fa-tools'
  },
  {
    id: 'tpl-2',
    name: '勘探风险评估模版',
    description: '预置地质风险与经济模型分析框架。',
    mbuCount: 8,
    usageCount: 45,
    createdAt: '2024-02-20',
    owner: '地质专家组',
    tags: ['勘探', '风险'],
    category: '地质研究',
    icon: 'fa-chart-line'
  },
  {
    id: 'tpl-3',
    name: '个人日报模版',
    description: '简单的个人工作日报结构。',
    mbuCount: 2,
    usageCount: 12,
    createdAt: '2024-05-01',
    owner: '李明',
    tags: ['个人', '日报'],
    category: '生产管理',
    icon: 'fa-calendar-alt'
  },
  {
    id: 'tpl-4',
    name: '井位部署与地质设计',
    description: '基于地震资料、邻井数据和构造解释结果，反复编制井位部署方案及地质设计报告，用于指导钻井实施。',
    mbuCount: 4,
    usageCount: 88,
    createdAt: '2024-06-01',
    owner: '地质专家组',
    tags: ['地质', '钻井'],
    category: '地质研究',
    icon: 'fa-map-marked-alt'
  },
  {
    id: 'tpl-5',
    name: '测井解释与储层评价',
    description: '对测井曲线进行解释，识别储层并计算孔隙度、含油气饱和度等关键参数，形成评价结论。',
    mbuCount: 3,
    usageCount: 72,
    createdAt: '2024-06-05',
    owner: '地质专家组',
    tags: ['测井', '评价'],
    category: '地质研究',
    icon: 'fa-database'
  },
  {
    id: 'tpl-6',
    name: '类比井与区块分析',
    description: '从历史井和相似区块中筛选可参考对象，进行参数对比与经验复用，支撑新井设计或评价。',
    mbuCount: 5,
    usageCount: 56,
    createdAt: '2024-06-10',
    owner: '地质专家组',
    tags: ['分析', '经验'],
    category: '地质研究',
    icon: 'fa-chart-area'
  },
  {
    id: 'tpl-7',
    name: '地质综合研究报告编制',
    description: '整合多源地质资料，周期性输出研究报告，用于阶段性成果汇报与决策支持。',
    mbuCount: 6,
    usageCount: 30,
    createdAt: '2024-06-15',
    owner: '地质专家组',
    tags: ['报告', '研究'],
    category: '地质研究',
    icon: 'fa-file-alt'
  },
  {
    id: 'tpl-8',
    name: '钻井工程设计编制',
    description: '制定井身结构、钻具组合、泥浆方案等内容，形成标准化钻井设计文件。',
    mbuCount: 5,
    usageCount: 95,
    createdAt: '2024-06-20',
    owner: '钻井专家组',
    tags: ['钻井', '设计'],
    category: '钻完井工程',
    icon: 'fa-tools'
  },
  {
    id: 'tpl-9',
    name: '完井方案设计',
    description: '根据储层特征制定完井方式（如射孔、压裂等），并输出设计方案文档。',
    mbuCount: 4,
    usageCount: 60,
    createdAt: '2024-06-25',
    owner: '钻井专家组',
    tags: ['完井', '设计'],
    category: '钻完井工程',
    icon: 'fa-tools'
  },
  {
    id: 'tpl-10',
    name: '施工日报与作业记录整理',
    description: '对每日钻井或完井施工数据进行记录、整理和归档，形成连续作业日志。',
    mbuCount: 2,
    usageCount: 150,
    createdAt: '2024-06-30',
    owner: '钻井专家组',
    tags: ['施工', '日报'],
    category: '钻完井工程',
    icon: 'fa-clipboard-check'
  },
  {
    id: 'tpl-11',
    name: '完井总结报告编制',
    description: '在施工结束后，对全过程进行总结分析，形成标准化完井总结报告。',
    mbuCount: 3,
    usageCount: 40,
    createdAt: '2024-07-05',
    owner: '钻井专家组',
    tags: ['完井', '总结'],
    category: '钻完井工程',
    icon: 'fa-file-signature'
  },
  {
    id: 'tpl-12',
    name: '油田开发方案编制',
    description: '制定油田整体开发策略，包括井网部署、产量预测和开发节奏安排。',
    mbuCount: 7,
    usageCount: 25,
    createdAt: '2024-07-10',
    owner: '油藏专家组',
    tags: ['开发', '方案'],
    category: '油气藏工程',
    icon: 'fa-industry'
  },
  {
    id: 'tpl-13',
    name: '产量动态分析与递减预测',
    description: '对油井历史产量进行分析，建立递减模型并预测未来生产趋势。',
    mbuCount: 4,
    usageCount: 50,
    createdAt: '2024-07-15',
    owner: '油藏专家组',
    tags: ['产量', '分析'],
    category: '油气藏工程',
    icon: 'fa-chart-line'
  },
  {
    id: 'tpl-14',
    name: '措施效果评价分析',
    description: '对压裂、酸化等增产措施进行效果评估，分析投入产出比并形成报告。',
    mbuCount: 3,
    usageCount: 35,
    createdAt: '2024-07-20',
    owner: '油藏专家组',
    tags: ['评价', '措施'],
    category: '油气藏工程',
    icon: 'fa-check-circle'
  },
  {
    id: 'tpl-15',
    name: '生产日报与月报汇总',
    description: '自动汇总全区生产数据，生成日报、月报及趋势分析图表。',
    mbuCount: 3,
    usageCount: 200,
    createdAt: '2024-07-25',
    owner: '生产管理组',
    tags: ['生产', '报表'],
    category: '生产管理',
    icon: 'fa-file-alt'
  },
  {
    id: 'tpl-16',
    name: '生产异常诊断与预警',
    description: '基于实时生产曲线，自动识别停产、含水突升等异常情况。',
    mbuCount: 4,
    usageCount: 150,
    createdAt: '2024-07-30',
    owner: '生产管理组',
    tags: ['异常', '预警'],
    category: '生产管理',
    icon: 'fa-bell'
  },
  {
    id: 'tpl-17',
    name: '注采系统效率分析',
    description: '评估注采系统各环节效率，识别低效井并提供优化建议。',
    mbuCount: 3,
    usageCount: 80,
    createdAt: '2024-08-05',
    owner: '生产管理组',
    tags: ['效率', '优化'],
    category: '生产管理',
    icon: 'fa-cogs'
  },
  {
    id: 'tpl-18',
    name: '生产调度与指令下达',
    description: '集成调度会议记录、生产指令下达及执行情况跟踪。',
    mbuCount: 4,
    usageCount: 120,
    createdAt: '2024-08-10',
    owner: '生产管理组',
    tags: ['调度', '指令'],
    category: '生产管理',
    icon: 'fa-clipboard-list'
  }
];

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: 'ws-drilling-x1',
    name: 'X-1井钻井分析工作空间',
    mbuCount: 5,
    createdAt: '2024-05-21',
    status: WorkspaceStatus.DRAFT,
    owner: '钻井工程师',
    description: 'X-1 井钻井工程核心工作台，集成设计、日报、参数及复杂情况分析。'
  },
  {
    id: 'ws-001',
    name: '北海油田分析 2024',
    mbuCount: 3,
    createdAt: '2024-05-10',
    status: WorkspaceStatus.DRAFT,
    owner: '李明',
    description: '针对第 4 区块地震数据的初步分析。'
  },
  {
    id: 'ws-002',
    name: '钻井优化 - X1 号井',
    mbuCount: 12,
    createdAt: '2024-04-22',
    status: WorkspaceStatus.COMPLETED,
    owner: '陈莎拉',
    description: '深水钻井参数优化报告。'
  },
  {
    id: 'ws-003',
    name: '第一季度产量回顾',
    mbuCount: 5,
    createdAt: '2024-01-15',
    status: WorkspaceStatus.ARCHIVED,
    owner: '管理员',
    description: '东部扇区所有活跃油井的季度回顾。'
  },
  {
    id: 'ws-004',
    name: 'B 区块地震解释任务',
    mbuCount: 8,
    createdAt: '2024-05-12',
    status: WorkspaceStatus.DRAFT,
    owner: '王建国',
    description: '针对新采集的三维地震数据进行精细构造解释。'
  },
  {
    id: 'ws-005',
    name: '深水油藏数值模拟',
    mbuCount: 15,
    createdAt: '2024-03-30',
    status: WorkspaceStatus.COMPLETED,
    owner: '赵丽',
    description: '模拟深水环境下不同注水方案的采收率预测。'
  },
  {
    id: 'ws-006',
    name: '管道完整性年度审计',
    mbuCount: 4,
    createdAt: '2024-02-10',
    status: WorkspaceStatus.ARCHIVED,
    owner: '安全部',
    description: '2023年度输油管道腐蚀检测与风险评估审计报告。'
  },
  {
    id: 'ws-007',
    name: '地球化学特征分析报告',
    mbuCount: 6,
    createdAt: '2024-05-15',
    status: WorkspaceStatus.DRAFT,
    owner: '刘洋',
    description: '源岩样品的热解分析与生物标志物特征研究。'
  },
  {
    id: 'ws-008',
    name: '海上平台安全协议审查',
    mbuCount: 2,
    createdAt: '2024-04-05',
    status: WorkspaceStatus.COMPLETED,
    owner: 'HSE 团队',
    description: '更新海上作业安全操作规程以符合最新法规。'
  },
  {
    id: 'ws-009',
    name: '勘探风险综合评估',
    mbuCount: 9,
    createdAt: '2024-05-18',
    status: WorkspaceStatus.DRAFT,
    owner: '张伟',
    description: '结合地质风险与经济模型的新区块勘探可行性研究。'
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
