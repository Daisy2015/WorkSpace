import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ContractCheckAgentProps {
  lang: 'zh' | 'en';
  config: any;
  onCloseAgent?: () => void;
  onComplete?: () => void;
  onSaveOutcome?: (name?: string) => void;
  onAssistantLog?: (message: string) => void;
}

export type CheckSeverity = 'severe' | 'general' | 'hint' | 'unexecuted';
export type IssueStatus = 'pending' | 'confirmed' | 'ignored' | 'false_positive' | 'expert';

export interface AuditIssue {
  id: string;
  severity: CheckSeverity;
  category: string;
  title: string;
  description: string;
  chapter: string;
  pageNum: number;
  ruleCode: string;
  ruleName: string;
  basisText: string;
  ruleOriginalText?: string;
  credibility: number;
  originalText: string;
  actualDataText: string;
  recommendation: string;
  status: IssueStatus;
  userNote?: string;
  timeline: { time: string; text: string }[];
}

export interface RuleItem {
  id: string;
  code: string;
  name: string;
  category: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'unexecuted' | 'skipped';
  duration: string;
  targetChapter: string;
  issuesCount: number;
  description: string;
  inputs: string[];
  steps: { text: string; done: boolean }[];
  dataSource: string;
}

export interface AuditTask {
  id: string;
  reportName: string;
  reportVersion: string;
  mainObject: string;
  auditStandard: string;
  runId: string;
  status: 'empty' | 'config' | 'parsing' | 'plan' | 'running' | 'waiting_user' | 'completed' | 'failed';
  progress: number;
  currentView: 'empty' | 'config' | 'parsing' | 'plan' | 'live' | 'issues' | 'rules' | 'doc' | 'report';
  issues: AuditIssue[];
  createdAt: string;
  duration?: string;
}

// Initial Mock Issues for Procurement Contract Audit
const mockIssuesTask1: AuditIssue[] = [
  {
    id: 'iss-1',
    severity: 'severe',
    category: '付款条款',
    title: '首期预付款比例与补充协议资金安排冲突',
    description: '主合同约定预付款支付比例为30%，而附件补充协议中资金到账安排约定为15%。',
    chapter: '第三条 付款方式与结算',
    pageNum: 8,
    ruleCode: 'CONTRACT-PAY-001',
    ruleName: '付款条件与进度条款一致性核查',
    basisText: '采购合同审查与合规强条标准 V1.0 第3.2条',
    credibility: 96,
    originalText: '“首期预付款为合同总金额的 30%，货到验收后支付 60%……”',
    actualDataText: '补充协议二 / 附件3 / 资金到账计划 (预付款 15%)',
    recommendation: '建议统一主合同与补充协议的预付款支付比例，避免执行阶段资金结算纠纷。',
    status: 'pending',
    timeline: [
      { time: '14:31:48', text: '从合同第8页提取预付款比例 30%' },
      { time: '14:31:51', text: '交叉检索补充协议二资金计划 15%' },
      { time: '14:31:52', text: 'CONTRACT-PAY-001 判定条款表述冲突' },
      { time: '14:32:12', text: '形成合同审计问题，可信度 96%' },
    ]
  },
  {
    id: 'iss-2',
    severity: 'severe',
    category: '合规强条',
    title: '逾期违约金比例无上限且免责声明覆盖范围超标',
    description: '第七条约定每日违约金按1%计算且未设封顶上限，超出民法典及行业采购合规指引。',
    chapter: '第七条 违约责任与赔偿',
    pageNum: 15,
    ruleCode: 'CONTRACT-LAW-002',
    ruleName: '违约金上限与法律风险提示规则',
    basisText: '民法典合同编第585条及国有企业采购审计强条',
    credibility: 98,
    originalText: '“乙方逾期交货按每日 1% 支付违约金，累积违约金不设上限……”',
    actualDataText: '采购合规强条：逾期违约金日率通常≤0.05%，且累积上限不超过合同总价20%~30%',
    recommendation: '强条不合规！建议修改违约金日利率为0.05%，并增设“累积违约金上限为合同总金额30%”。',
    status: 'pending',
    timeline: [
      { time: '14:31:55', text: '读取第15页违约金计算规则 1%/日' },
      { time: '14:32:00', text: '触发民法典合同编及企业采购审查强条' },
      { time: '14:32:02', text: '形成严重法律风险预警，可信度 98%' }
    ]
  },
  {
    id: 'iss-3',
    severity: 'severe',
    category: '履约一致性',
    title: '合同交货验收标准与技术规格书执行标准不相符',
    description: '第五条约定按照企业内控Q/PETRO标准验收，技术规格书要求执行API-5CT国际强条。',
    chapter: '第五条 质量标准与验收',
    pageNum: 12,
    ruleCode: 'CONTRACT-QUAL-003',
    ruleName: '交付标准与技术协议比对',
    basisText: '技术规格书 Annex A + API-5CT质量验收标准',
    credibility: 92,
    originalText: '“产品检验与质量验收按卖方企业内控标准 Q/PETRO-2024 执行……”',
    actualDataText: '技术协议第4章：“套管及管材须具备 API-5CT 认证及第三方高压试压报告”',
    recommendation: '建议在合同第五条增加“且须符合技术规格书所列 API-5CT 标准”条款。',
    status: 'pending',
    timeline: [
      { time: '14:31:40', text: '提取第12页验收标准条款' },
      { time: '14:31:44', text: '比对技术规格书 Annex A 标准要求' },
      { time: '14:31:46', text: '发现验收标准降格风险' }
    ]
  },
  {
    id: 'iss-4',
    severity: 'general',
    category: '法律条款',
    title: '争议解决途径表述模糊（同时约定仲裁与诉讼）',
    description: '第九条约定“可向买方所在地仲裁委员会申请仲裁或向人民法院起诉”，存在仲裁协议无效风险。',
    chapter: '第九条 争议解决与管辖',
    pageNum: 18,
    ruleCode: 'CONTRACT-JUR-004',
    ruleName: '争议解决条款明确性检测',
    basisText: '企业采购合同示范文本与司法解释指南',
    credibility: 90,
    originalText: '“双方发生争议可提交北京仲裁委员会仲裁，或向买方所在地法院起诉……”',
    actualDataText: '司法解释：同时约定仲裁与诉讼会导致仲裁协议无效',
    recommendation: '修改为明确的二选一管辖条款，如：“向买方所在地有管辖权的人民法院提起诉讼”。',
    status: 'pending',
    timeline: [{ time: '14:31:30', text: '管辖权条款法律合规性扫描' }]
  },
  {
    id: 'iss-5',
    severity: 'general',
    category: '财务条款',
    title: '质保金退还期限与质保期起算日逻辑矛盾',
    description: '第四条约定质保金在交货后12个月退还，而第五条约定质保期自竣工验收合格之日起算24个月。',
    chapter: '第四条 质保金与保证金',
    pageNum: 10,
    ruleCode: 'CONTRACT-FIN-005',
    ruleName: '质保金退还与质保期关联规则',
    basisText: '采购合同审查与合规强条标准 V1.0',
    credibility: 89,
    originalText: '“5%质保金自到货交付之日起满12个月后无息退还……”',
    actualDataText: '第5.1条约定：“质保期为安装调试验收合格之日起24个月”',
    recommendation: '修改质保金退还条件为：“安装调试验收合格且质保期届满后15个工作日内无息退还”。',
    status: 'pending',
    timeline: [{ time: '14:31:25', text: '财务与质保期限逻辑比对' }]
  },
  {
    id: 'iss-6',
    severity: 'hint',
    category: '主体核验',
    title: '乙方签署主体名称与营业执照存在缩写差异',
    description: '合同落款处乙方名称写为“中油装备制造公司”，营业执照正本为“中国石油天然气集团装备制造有限公司”。',
    chapter: '落款与签署页',
    pageNum: 22,
    ruleCode: 'CONTRACT-AUTH-005',
    ruleName: '签约主体资质与盖章有效性校验',
    basisText: '企业法人营业执照核验规则',
    credibility: 95,
    originalText: '乙方：中油装备制造公司（盖章）',
    actualDataText: '国家企业信用信息公示系统正规名称：中国石油天然气集团装备制造有限公司',
    recommendation: '要求乙方修正落款名称为企业法人全称，并加盖骑缝章与公章。',
    status: 'pending',
    timeline: [{ time: '14:31:10', text: '企业工商数据库主体验证' }]
  }
];

// Initial Rules List for Contract Check
const mockRulesList: RuleItem[] = [
  {
    id: 'r-1',
    code: 'CONTRACT-PAY-001',
    name: '付款条件与进度条款一致性核查',
    category: '财务结算',
    status: 'failed',
    duration: '1.0s',
    targetChapter: '第三条 付款方式与结算',
    issuesCount: 1,
    description: '核查合同正文预付款、进度款比例与补充协议、资金计划表的数值一致性。',
    inputs: ['合同第8页 第三条', '补充协议二资金计划', '采购合规标准 V1.0'],
    steps: [
      { text: '定位合同第三条预付款比例: 30%', done: true },
      { text: '提取补充协议二到账计划: 15%', done: true },
      { text: '计算数值逻辑偏差: 15%', done: true },
      { text: '生成合同审计风险记录', done: true }
    ],
    dataSource: '采购合同审查与合规强条标准 V1.0'
  },
  {
    id: 'r-2',
    code: 'CONTRACT-LAW-002',
    name: '违约金上限与法律风险提示规则',
    category: '合规强条',
    status: 'failed',
    duration: '0.8s',
    targetChapter: '第七条 违约责任与赔偿',
    issuesCount: 1,
    description: '审查逾期违约金计算标准与最高上限是否符合民法典及国有企业采购强条。',
    inputs: ['合同第15页', '民法典合同编585条', '采购审计强条'],
    steps: [
      { text: '提取违约金规则: 按日1%且不封顶', done: true },
      { text: '比对法律上限: 不得超过30%', done: true },
      { text: '判定合规状态: 不合规（条款无效风险）', done: true }
    ],
    dataSource: '国有企业采购与招投标合规审计强条'
  },
  {
    id: 'r-3',
    code: 'CONTRACT-QUAL-003',
    name: '交付标准与技术协议比对',
    category: '履约质量',
    status: 'failed',
    duration: '1.2s',
    targetChapter: '第五条 质量标准与验收',
    issuesCount: 1,
    description: '比对合同验收条款与技术规格书交货要求的标准差异。',
    inputs: ['合同第12页', '技术规格书 Annex A'],
    steps: [
      { text: '提取合同验收标准: Q/PETRO-2024', done: true },
      { text: '提取技术规格书标准: API-5CT', done: true },
      { text: '判定标准不匹配风险', done: true }
    ],
    dataSource: '采购物资技术规格书与质量标准'
  },
  {
    id: 'r-4',
    code: 'CONTRACT-JUR-004',
    name: '争议解决条款明确性检测',
    category: '法律风险',
    status: 'failed',
    duration: '0.6s',
    targetChapter: '第九条 争议解决',
    issuesCount: 1,
    description: '校验管辖法院或仲裁机构约定是否明确排他，防止管辖权争议。',
    inputs: ['合同第18页', '仲裁法司法解释'],
    steps: [
      { text: '扫描管辖条款关键字: 仲裁与诉讼并存', done: true },
      { text: '判定协议有效性: 无效风险', done: true }
    ],
    dataSource: '民法典合同编合规指引'
  },
  {
    id: 'r-5',
    code: 'CONTRACT-AUTH-005',
    name: '签约主体资质与盖章有效性校验',
    category: '主体核验',
    status: 'failed',
    duration: '0.9s',
    targetChapter: '落款与签署页',
    issuesCount: 1,
    description: '核验乙方企业全称是否与工商登记完全一致，印章名称是否相符。',
    inputs: ['合同落款', '工商企查数据库'],
    steps: [
      { text: '提取乙方落款: 中油装备制造公司', done: true },
      { text: '比对企查数据库正规名称: 中国石油天然气集团装备制造有限公司', done: true },
      { text: '判定名称简写存在法律漏洞', done: true }
    ],
    dataSource: '国家企业信用信息公示系统'
  }
];

const INITIAL_MOCK_TASKS: AuditTask[] = [
  {
    id: 'task-1',
    reportName: '油气装备年度采购框架合同协议_V3.docx',
    reportVersion: 'V3.0',
    mainObject: '中石油采购部',
    auditStandard: '采购合同审查与合规强条标准 V1.0',
    runId: 'RUN-2026-0812-001',
    status: 'completed',
    progress: 100,
    currentView: 'issues',
    issues: mockIssuesTask1,
    createdAt: '2026-08-12 14:31',
    duration: '38s'
  },
  {
    id: 'task-2',
    reportName: '钻采设备技术服务采购招标响应文件_招投标标书.pdf',
    reportVersion: 'V1.2',
    mainObject: '华东机械制造有限公司',
    auditStandard: '采购合同审查与合规强条标准 V1.0',
    runId: 'RUN-2026-0811-042',
    status: 'completed',
    progress: 100,
    currentView: 'issues',
    issues: [],
    createdAt: '2026-08-11 09:15',
    duration: '1min 05s'
  },
  {
    id: 'task-3',
    reportName: '管道阀门物资框架采购补充协议_V1.docx',
    reportVersion: 'V1.0',
    mainObject: '蓝海物资集团',
    auditStandard: '国有企业采购与招投标合规审计强条',
    runId: 'RUN-2026-0810-019',
    status: 'completed',
    progress: 100,
    currentView: 'issues',
    issues: [],
    createdAt: '2026-08-10 16:20',
    duration: '45s'
  }
];

export const ContractCheckAgent: React.FC<ContractCheckAgentProps> = ({
  lang,
  config,
  onCloseAgent,
  onComplete,
  onSaveOutcome,
  onAssistantLog
}) => {

  // Multi-Task Management
  const [tasks, setTasks] = useState<AuditTask[]>(INITIAL_MOCK_TASKS);
  const [activeTaskId, setActiveTaskId] = useState<string>('task-1');

  // Pagination & search for All Tasks Modal
  const [allTasksPage, setAllTasksPage] = useState(1);
  const [allTasksSearch, setAllTasksSearch] = useState('');
  const allTasksPageSize = 5;

  const filteredAllTasks = useMemo(() => {
    return tasks.filter(t => {
      const q = allTasksSearch.toLowerCase();
      return (
        (t.reportName && t.reportName.toLowerCase().includes(q)) ||
        (t.mainObject && t.mainObject.toLowerCase().includes(q)) ||
        (t.auditStandard && t.auditStandard.toLowerCase().includes(q))
      );
    });
  }, [tasks, allTasksSearch]);

  const totalAllTasksPages = Math.ceil(filteredAllTasks.length / allTasksPageSize);

  const paginatedAllTasks = useMemo(() => {
    const start = (allTasksPage - 1) * allTasksPageSize;
    return filteredAllTasks.slice(start, start + allTasksPageSize);
  }, [filteredAllTasks, allTasksPage, allTasksPageSize]);

  // Fallback for empty state
  const emptyTaskFallback: AuditTask = useMemo(() => ({
    id: 'empty-initial',
    reportName: '',
    reportVersion: 'V1',
    mainObject: '中石油采购部',
    auditStandard: '采购合同审查与合规强条标准 V1.0',
    runId: '',
    status: 'empty',
    progress: 0,
    currentView: 'empty',
    issues: [],
    createdAt: ''
  }), []);

  // Active Task Helper
  const activeTask = useMemo(() => {
    return tasks.find(t => t.id === activeTaskId) || tasks[0] || emptyTaskFallback;
  }, [tasks, activeTaskId, emptyTaskFallback]);

  // Initial welcome message in assistant sidebar when opened with no tasks
  useEffect(() => {
    if (tasks.length === 0 && onAssistantLog) {
      onAssistantLog(
        `🤖 **采购合同智能校核已就绪**\n` +
        `请在中间页面上传待校核的采购合同（如《油气装备年度采购框架合同协议_V3.docx》）。\n` +
        `我将协助您建立条款校核依据，并在右侧实时展示每一步的识别、拆解与合规比对日志。`
      );
    }
  }, []);

  // Modals & Controls
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showAllTasksDrawer, setShowAllTasksDrawer] = useState(false);
  const [showSaveOutcomeModal, setShowSaveOutcomeModal] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);

  // Selected Issue for Drawer
  const [selectedIssue, setSelectedIssue] = useState<AuditIssue | null>(null);
  
  // Selected Rule for Detail Drawer
  const [selectedRule, setSelectedRule] = useState<RuleItem | null>(null);

  // Issue View Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [checkTypeFilter, setCheckTypeFilter] = useState<'all' | 'completeness' | 'consistency' | 'compliance'>('all');
  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<string>>(new Set());
  const [isIssuesMaximized, setIsIssuesMaximized] = useState(false);

  // Review Mode Sub-tabs
  const [reviewMode, setReviewMode] = useState<'issues' | 'doc' | 'rules'>('issues');

  // Live Execution View States (校核现场)
  const [liveProcessMode, setLiveProcessMode] = useState<'running' | 'completed'>('running');
  const [liveStage, setLiveStage] = useState<'parsing' | 'checking' | 'completed'>('parsing');
  const [liveFilter, setLiveFilter] = useState<'all' | 'issues'>('all');
  const [liveGroupBy, setLiveGroupBy] = useState<'chapter' | 'time'>('chapter');
  const [isParsingCardOpen, setIsParsingCardOpen] = useState(true);
  const [isRuleCheckCardOpen, setIsRuleCheckCardOpen] = useState(true);
  const [openChapterIds, setOpenChapterIds] = useState<Set<string>>(new Set(['ch-3', 'ch-4']));
  const [simDynamicCount, setSimDynamicCount] = useState(0);

  // Sync liveProcessMode & liveStage with activeTask status
  useEffect(() => {
    if (activeTask.status === 'completed') {
      setLiveProcessMode('completed');
      setLiveStage('completed');
      setSimDynamicCount(128);
    } else {
      setLiveProcessMode('running');
      setLiveStage('parsing');
      setSimDynamicCount(0);
    }
  }, [activeTaskId, activeTask.status]);

  // Stage 1: 5-second parsing timer
  useEffect(() => {
    let timer: any;
    if (activeTask.currentView === 'live' && liveStage === 'parsing' && !isPaused) {
      timer = setTimeout(() => {
        setLiveStage('checking');
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [activeTask.currentView, liveStage, isPaused]);

  // Stage 2: Real-time dynamic rule checking simulation (increasing 1 by 1)
  useEffect(() => {
    let interval: any;
    if (activeTask.currentView === 'live' && liveStage === 'checking' && !isPaused) {
      interval = setInterval(() => {
        setSimDynamicCount(prev => {
          if (prev >= 128) {
            setLiveStage('completed');
            setLiveProcessMode('completed');
            return 128;
          }
          return prev + 1;
        });
      }, 850);
    }
    return () => clearInterval(interval);
  }, [activeTask.currentView, liveStage, isPaused]);

  // Upload state mock for State 1
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'failed' | 'success'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Task configuration form for State 2
  const [selectedFileName, setSelectedFileName] = useState<string>('油气装备年度采购框架合同协议_V3.docx');
  const [configTaskName, setConfigTaskName] = useState('油气装备年度采购框架合同校核');
  const [configObject, setConfigObject] = useState('中石油采购部');
  const [configStandard, setConfigStandard] = useState('采购合同审查与合规强条标准 V1.0');

  // Save Outcome Form
  const [saveOutcomeName, setSaveOutcomeName] = useState('');
  const [saveOptions, setSaveOptions] = useState({
    conclusion: true,
    issues: true,
    rules: true,
    evidence: true,
    dataSnapshot: true,
    userConfirm: true
  });

  // Global Toast Alert
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Mutators for Active Task
  const setCurrentView = (view: AuditTask['currentView']) => {
    setTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, currentView: view } : t));
  };

  const setRunStatus = (status: AuditTask['status']) => {
    setTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, status: status } : t));
  };

  const setTaskIssues = (updater: (prevIssues: AuditIssue[]) => AuditIssue[]) => {
    setTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, issues: updater(t.issues) } : t));
  };

  // Step 1: Simulate File Upload in State 1
  const triggerMockUpload = (fileName: string) => {
    setUploadState('uploading');
    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          setUploadState('success');

          const newId = `task-${Date.now()}`;
          const cleanName = fileName || '油气装备年度采购框架合同协议_V3.docx';
          const newTask: AuditTask = {
            id: newId,
            reportName: cleanName,
            reportVersion: 'V1',
            mainObject: '中石油采购部',
            auditStandard: '采购合同审查与合规强条标准 V1.0',
            runId: `RUN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
            status: 'config',
            progress: 0,
            currentView: 'config',
            issues: [],
            createdAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
          };

          setTasks(prev => [newTask, ...prev]);
          setActiveTaskId(newId);
          setConfigTaskName(`${cleanName.replace(/\.[^/.]+$/, "")} 校核`);

          if (onAssistantLog) {
            onAssistantLog(
              `📄 **合同文件上传成功：《${cleanName}》** (4.2MB)\n` +
              `• 解析状态：合同格式与电子签章校验通过，全书共 24 页\n` +
              `• 识别资产：包含 12 个关键条款章节，86 项判定要素与履约节点\n` +
              `请在中间界面确认【签约主体】与引用的【合同审查标准】后开启任务。`
            );
          }

          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  // Confirm Config & Start Task directly into Live Field
  const handleConfirmCreateTask = () => {
    const fileToUse = selectedFileName || '油气装备年度采购框架合同协议_V3.docx';
    const taskName = configTaskName || `${fileToUse.replace(/\.[^/.]+$/, "")} 校核`;
    
    const newId = `task-${Date.now()}`;
    const newTask: AuditTask = {
      id: newId,
      reportName: fileToUse,
      reportVersion: 'V1',
      mainObject: configObject,
      auditStandard: configStandard,
      runId: `RUN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      status: 'running',
      progress: 100,
      currentView: 'live',
      issues: mockIssuesTask1,
      createdAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      duration: '38s'
    };

    setTasks(prev => [newTask, ...prev.filter(t => t.id !== 'empty-initial')]);
    setActiveTaskId(newId);
    setUploadState('idle');

    if (onAssistantLog) {
      onAssistantLog(
        `🚀 **采购合同智能校核任务已启动！**\n` +
        `• 合同文档：《${fileToUse}》\n` +
        `• 签约主体：${configObject}\n` +
        `• 引用标准：${configStandard}\n` +
        `正在依次发起：【合同解析】→【条款拆解】→【合规强条比对】→【风险汇总】...`
      );

      setTimeout(() => {
        onAssistantLog(
          `📄 **【阶段一：合同解析完成】**\n` +
          `• 结构识别：12 个正文主条款章节，4 个附录补充协议\n` +
          `• 特征提取：86 项履约结算节点与强条约束，全书条款锚点定位率 100%`
        );
      }, 1000);

      setTimeout(() => {
        onAssistantLog(
          `📋 **【阶段二：校核规划完成】**\n` +
          `• 关联规程：《${configStandard}》\n` +
          `• 规则编排：已生成 5 项审查任务，匹配 86 条审查规则（付款条件 24 条、违约责任 22 条、质量验收 18 条、主体资质 22 条）`
        );
      }, 2200);

      setTimeout(() => {
        onAssistantLog(
          `⚙️ **【阶段三：计划执行完成】**\n` +
          `• 规则比对：86 条规则全量执行完毕\n` +
          `• 执行结论：80 条校验通过，6 条存在付款冲突或法律与合规强条风险`
        );
      }, 3400);

      setTimeout(() => {
        setTasks(prev => prev.map(t => t.id === newId ? {
          ...t,
          status: 'completed',
          currentView: 'issues',
          progress: 100
        } : t));

        if (onAssistantLog) {
          onAssistantLog(
            `📊 **【阶段四：结果汇总完成】**\n` +
            `• 汇总结果：发现 6 项候选问题（严重 2 项、一般 3 项、提示 1 项）\n` +
            `• 状态变更：智能体校核已完成！\n` +
            `• 审阅就绪：可随时切换至「结果审阅」选项卡查阅具体问题与原文修订批注`
          );
        }
      }, 4600);
    }
  };

  // Step 3: Run Rules Engine (Plan -> Live -> Completed)
  const handleStartRunningFromPlan = () => {
    setTasks(prev => prev.map(t => t.id === activeTaskId ? {
      ...t,
      status: 'running',
      currentView: 'live',
      progress: 15,
      issues: mockIssuesTask1.slice(0, 2)
    } : t));

    if (onAssistantLog) {
      onAssistantLog(
        `⚡ **第三步：合同审查规则引擎已启动**\n` +
        `正在并行分发 86 条合规审查规则...\n` +
        `• [CONTRACT-PAY-001] 提取第8页预付款比例 (30%) 与 补充协议二 (15%) 交叉比对...\n` +
        `• [CONTRACT-LAW-002] 正在审查违约金条款 (1%/日无上限) 与民法典和国有企业采购强条...`
      );
    }

    let currentProg = 15;
    const progInterval = setInterval(() => {
      currentProg += 25;
      if (currentProg >= 100) {
        clearInterval(progInterval);
        setTasks(prev => prev.map(t => t.id === activeTaskId ? {
          ...t,
          status: 'completed',
          currentView: 'issues',
          progress: 100,
          issues: mockIssuesTask1
        } : t));

        if (onAssistantLog) {
          onAssistantLog(
            `🎉 **第四步：采购合同校核全部完成！**\n` +
            `• 规则比对：86 条合规与法律规则 100% 校验完成\n` +
            `• 识别问题：共发现 6 项候选审查问题（严重问题 2 项，一般问题 3 项，提示 1 项）\n` +
            `请在中间界面逐项审阅判定条款风险，或将校核成果归档至空间资源。`
          );
        }
      } else {
        setTasks(prev => prev.map(t => t.id === activeTaskId ? {
          ...t,
          progress: currentProg,
          issues: currentProg > 50 ? mockIssuesTask1.slice(0, 5) : mockIssuesTask1.slice(0, 2)
        } : t));
      }
    }, 1500);
  };

  // Save Outcome Execution
  const handleDoSaveOutcome = () => {
    const finalName = saveOutcomeName || `${activeTask.reportName.replace(/\.[^/.]+$/, "")}_校核成果报告`;
    if (onSaveOutcome) {
      onSaveOutcome(finalName);
    }
    setShowSaveOutcomeModal(false);
    showToast(`已保存至左侧“输出成果”：${finalName}`);

    if (onAssistantLog) {
      onAssistantLog(
        `💾 **成果归档完毕**\n` +
        `成果文件《${finalName}》已保存至左侧「输出成果」文件夹，包含完整问题列表与原文定位批注。`
      );
    }
  };

  // Calculation of Issues stats
  const issues = activeTask.issues || [];
  const filteredIssues = useMemo(() => {
    return issues.filter(item => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!item.title.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q) && !item.chapter.toLowerCase().includes(q) && !item.ruleCode.toLowerCase().includes(q)) return false;
      }
      if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

      // 校核类型过滤：全部、完整性、一致性、合规性
      if (checkTypeFilter === 'completeness') {
        if (!item.category.includes('完整')) return false;
      } else if (checkTypeFilter === 'consistency') {
        if (!item.category.includes('一致')) return false;
      } else if (checkTypeFilter === 'compliance') {
        if (!item.category.includes('合规')) return false;
      }

      return true;
    });
  }, [issues, searchQuery, severityFilter, statusFilter, categoryFilter, checkTypeFilter]);

  const stats = useMemo(() => {
    const severeCount = issues.filter(i => i.severity === 'severe').length;
    const generalCount = issues.filter(i => i.severity === 'general').length;
    const hintCount = issues.filter(i => i.severity === 'hint').length;
    const unexecutedCount = issues.filter(i => i.severity === 'unexecuted').length;
    const pendingCount = issues.filter(i => i.status === 'pending').length;
    const confirmedCount = issues.filter(i => i.status === 'confirmed').length;
    return { severeCount, generalCount, hintCount, unexecutedCount, pendingCount, confirmedCount, totalCount: issues.length };
  }, [issues]);

  // Batch Selection Helper
  const toggleSelectBatch = (id: string) => {
    const next = new Set(selectedBatchIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedBatchIds(next);
  };

  const applyBatchAction = (newStatus: IssueStatus) => {
    setTaskIssues(prev => prev.map(item => selectedBatchIds.has(item.id) ? { ...item, status: newStatus } : item));
    setSelectedBatchIds(new Set());
    showToast(`已批量更新 ${selectedBatchIds.size} 项问题状态`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-sans text-slate-900 relative">

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 backdrop-blur-md"
          >
            <i className="fas fa-circle-check text-emerald-400"></i>
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────
          LAYER 1: TOP TASK CONTEXT BAR & MULTI-TASK SWITCHER
         ────────────────────────────────────────────────────────────── */}
      <div className="w-full bg-white border-b border-slate-200/80 px-5 py-3 flex items-center justify-between shadow-2xs z-30 flex-shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100/80 text-teal-600 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-2xs">
            <i className="fas fa-file-circle-check text-teal-600"></i>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap relative">
              {/* TASK SWITCHER BUTTON */}
              <button
                onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl hover:bg-slate-100 border border-slate-200/70 hover:border-slate-300 transition-all cursor-pointer text-left group"
              >
                <span className="text-slate-400 font-bold text-xs">报告校核 /</span>
                <h1 className="text-sm font-black text-slate-800 leading-snug truncate max-w-[220px]" title={activeTask.reportName}>
                  {activeTask.reportName}
                </h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                  activeTask.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  activeTask.status === 'parsing' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                  'bg-teal-50 text-teal-700 border border-teal-200'
                }`}>
                  {activeTask.status === 'completed' ? '已完成' :
                   activeTask.status === 'parsing' ? '解析中' : '校核中'}
                </span>
                <i className="fas fa-chevron-down text-slate-400 text-xs group-hover:text-slate-600 transition-all"></i>
              </button>

              {/* TASK SWITCHER DROPDOWN */}
              {showTaskDropdown && (
                <div className="absolute left-0 top-10 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-700">校核任务</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">共 {tasks.length} 项</span>
                      <button
                        onClick={() => {
                          setShowTaskDropdown(false);
                          setShowAllTasksDrawer(true);
                        }}
                        className="text-[10px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-0.5 cursor-pointer"
                      >
                        查看更多 <i className="fas fa-chevron-right text-[8px]"></i>
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto py-1 space-y-1 custom-scrollbar">
                    {tasks.map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveTaskId(t.id);
                          setShowTaskDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all ${
                          t.id === activeTaskId ? 'bg-teal-50/80 border border-teal-200/80 font-bold text-teal-900' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <i className="fas fa-file-lines text-slate-400"></i>
                          <span className="truncate max-w-[150px]">{t.reportName}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          t.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          t.status === 'parsing' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}>
                          {t.status === 'completed' ? '已完成' :
                           t.status === 'parsing' ? '解析中' : '校核中'}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 mt-1">
                    <button
                      onClick={() => {
                        setShowTaskDropdown(false);
                        setCurrentView('empty');
                      }}
                      className="w-full py-2 bg-teal-600 text-white font-bold rounded-xl text-center hover:bg-teal-700 transition-all flex items-center justify-center gap-1.5"
                    >
                      <i className="fas fa-plus text-[10px]"></i>
                      新建校核任务
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 truncate">
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <i className="fas fa-book-bookmark text-slate-400 text-[10px]"></i>
                {activeTask.auditStandard || '钻完井设计报告校核标准 V2.1'}
              </span>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-[10px] text-slate-400">ID: {activeTask.runId}</span>
            </div>
          </div>
        </div>

        {/* TOP RIGHT ACTIONS */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => setCurrentView('empty')}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <i className="fas fa-plus text-[11px]"></i>
            新建校核任务
          </button>

          {activeTask.status === 'running' && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-2.5 py-1.5 border rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 ${
                isPaused 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <i className={`fas ${isPaused ? 'fa-play' : 'fa-pause'} text-[10px]`}></i>
              {isPaused ? '继续' : '暂停'}
            </button>
          )}
        </div>
      </div>



      {/* ──────────────────────────────────────────────────────────────
          NAV SUB-TABS (一级视图状态导航) - 只保留校核现场和结果审阅
         ────────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200/80 px-5 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentView('live')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTask.currentView === 'live' || activeTask.currentView === 'parsing' || activeTask.currentView === 'plan'
                ? 'border-teal-600 text-teal-700 bg-teal-50/40' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <i className="fas fa-satellite-dish text-[11px]"></i>
            校核现场
          </button>

          <button
            onClick={() => setCurrentView('issues')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTask.currentView === 'issues' || activeTask.currentView === 'doc' || activeTask.currentView === 'report' || activeTask.currentView === 'rules'
                ? 'border-teal-600 text-teal-700 bg-teal-50/40' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <i className="fas fa-clipboard-check text-[11px]"></i>
            结果审阅
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {stats.totalCount}
            </span>
          </button>
        </div>

        {(activeTask.currentView === 'issues' || activeTask.currentView === 'doc' || activeTask.currentView === 'report' || activeTask.currentView === 'rules') && (
          <div className="flex items-center gap-2 py-1.5">
            <button
              onClick={() => {
                setSaveOutcomeName(`${activeTask.reportName.replace(/\.[^/.]+$/, "")}_校核报告`);
                setShowSaveOutcomeModal(true);
              }}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <i className="fas fa-floppy-disk text-[11px]"></i>
              保存成果
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
              >
                <i className="fas fa-download text-[11px] text-slate-500"></i>
                下载报告
                <i className="fas fa-chevron-down text-[10px] text-slate-400"></i>
              </button>

              {showDownloadDropdown && (
                <div className="absolute right-0 top-9 w-48 bg-white border border-slate-200 shadow-xl rounded-xl p-1 z-50 text-xs font-medium space-y-0.5">
                  <button onClick={() => { setShowDownloadDropdown(false); showToast('开始下载 PDF 格式校核报告'); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                    <i className="fas fa-file-pdf text-rose-500"></i> PDF 格式校核报告
                  </button>
                  <button onClick={() => { setShowDownloadDropdown(false); showToast('开始下载 Word 格式校核报告'); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                    <i className="fas fa-file-word text-blue-500"></i> Word 格式校核报告
                  </button>
                  <button onClick={() => { setShowDownloadDropdown(false); showToast('开始下载 Excel 问题清单'); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                    <i className="fas fa-file-excel text-emerald-500"></i> Excel 格式问题清单
                  </button>
                  <button onClick={() => { setShowDownloadDropdown(false); showToast('开始下载原报告批注版 (.docx)'); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                    <i className="fas fa-file-circle-check text-teal-600"></i> 原报告带批注版
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button onClick={() => { setShowDownloadDropdown(false); showToast('开始打包下载完整证据链 (.zip)'); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-slate-600">
                    <i className="fas fa-box-archive text-amber-500"></i> 证据链附件包 (.zip)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────
          LAYER 3: MAIN WORKSPACE CONTAINER (内容展现区)
         ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-5 relative custom-scrollbar">

        {/* ------------------------------------------------------------
            COMBINED ENTRY VIEW: 上传文档与新建校核任务 (MERGED)
           ------------------------------------------------------------ */}
        {(activeTask.currentView === 'empty' || activeTask.currentView === 'config' || tasks.length === 0) && (
          <div className="max-w-3xl mx-auto my-4 space-y-6 bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center font-bold text-lg shadow-2xs">
                  <i className="fas fa-file-circle-plus"></i>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">新建报告校核任务</h2>
                  <p className="text-xs text-slate-500 mt-0.5">上传待校核的工程报告，并配置对应的校核标准依据</p>
                </div>
              </div>
            </div>

            {/* Section 1: 报告文件选择与上传 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <i className="fas fa-file-lines text-teal-600"></i>
                  1. 待校核报告文档 <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">支持 .docx, .pdf, .doc 格式 (50MB内)</span>
              </div>

              {uploadState === 'success' || selectedFileName ? (
                <div className="p-4 bg-teal-50/40 border border-teal-200/80 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">
                      <i className="fas fa-file-word text-lg"></i>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{selectedFileName || '油气装备年度采购框架合同协议_V3.docx'}</h4>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold flex-shrink-0">已就绪</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">4.2 MB · 24 页 · 识别 12 个条款章节与 86 项审查要素</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedFileName(''); setUploadState('idle'); }}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl font-bold transition-all flex-shrink-0"
                  >
                    重新选择
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setSelectedFileName('油气装备年度采购框架合同协议_V3.docx');
                    setUploadState('success');
                    setConfigTaskName('油气装备年度采购框架合同校核');
                  }}
                  className="border-2 border-dashed border-slate-200 hover:border-teal-400 bg-slate-50/70 hover:bg-teal-50/20 rounded-2xl p-6 text-center transition-all cursor-pointer group space-y-2"
                >
                  <i className="fas fa-cloud-arrow-up text-2xl text-slate-400 group-hover:text-teal-600 transition-all"></i>
                  <p className="text-xs font-bold text-slate-700 group-hover:text-teal-800">点击或拖拽上传合同文件</p>
                  <p className="text-[11px] text-slate-400">也可直接选择系统预置文档：</p>
                  <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFileName('油气装备年度采购框架合同协议_V3.docx');
                        setUploadState('success');
                        setConfigTaskName('油气装备年度采购框架合同校核');
                      }}
                      className="px-3 py-1 bg-white border border-slate-200 hover:bg-teal-50 hover:border-teal-300 text-slate-700 text-[11px] font-bold rounded-lg transition-all"
                    >
                      📄 油气装备年度采购框架合同协议_V3.docx
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFileName('钻采设备技术服务采购招标响应文件_招投标标书.pdf');
                        setUploadState('success');
                        setConfigTaskName('钻采设备技术服务采购招标响应文件校核');
                      }}
                      className="px-3 py-1 bg-white border border-slate-200 hover:bg-teal-50 hover:border-teal-300 text-slate-700 text-[11px] font-bold rounded-lg transition-all"
                    >
                      📄 钻采设备技术服务采购招标响应文件_招投标标书.pdf
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: 校核配置参数 */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <i className="fas fa-sliders text-teal-600"></i>
                2. 校核参数与标准依据
              </label>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">校核任务名称 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={configTaskName}
                    onChange={e => setConfigTaskName(e.target.value)}
                    placeholder="例如：油气装备年度采购框架合同校核"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/30 text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">引用校核标准 <span className="text-rose-500">*</span></label>
                  <select
                    value={configStandard}
                    onChange={e => setConfigStandard(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium"
                  >
                    <option value="采购合同审查与合规强条标准 V1.0">采购合同审查与合规强条标准 V1.0 (86条规则)</option>
                    <option value="国有企业采购与招投标合规审计强条">国有企业采购与招投标合规审计强条 (52条规则)</option>
                    <option value="中华人民共和国民法典（合同编）合规指引">中华人民共和国民法典（合同编）合规指引 (40条规则)</option>
                    <option value="企业采购与招标违约责任及防范规范">企业采购与招标违约责任及防范规范 (28条规则)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">点击开启后，将直达「校核现场」查看实时校核过程</span>
              <button
                onClick={() => {
                  if (!selectedFileName) {
                    setSelectedFileName('油气装备年度采购框架合同协议_V3.docx');
                  }
                  handleConfirmCreateTask();
                }}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <i className="fas fa-play"></i>
                开启智能校核任务
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            INTEGRATED EXECUTION VIEW: 校核现场 (MATCHING DESIGN IMAGES)
           ------------------------------------------------------------ */}
        {(activeTask.currentView === 'live' || activeTask.currentView === 'parsing' || activeTask.currentView === 'plan') && (
          <div className="max-w-6xl mx-auto flex gap-5 items-stretch">
            {/* ==========================================
                LEFT TIMELINE SIDEBAR: 阶段步骤进度 (3 STEPS)
               ========================================== */}
            <div className="w-72 sm:w-80 bg-white border border-slate-200/90 rounded-2xl p-5 flex-shrink-0 flex flex-col justify-between shadow-2xs self-stretch min-h-[480px]">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-list-check text-teal-600"></i>
                    校核阶段进度
                  </h3>
                  <span className="text-[11px] font-medium text-slate-400">共 3 个阶段</span>
                </div>

                <div className="relative pl-3 space-y-8 before:absolute before:left-[21px] before:top-3.5 before:h-[160px] before:w-[2px] before:bg-slate-200">
                  {/* Step 1: 文档解析 */}
                  <div className="relative flex items-start gap-3.5">
                    {liveStage === 'parsing' ? (
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold z-10 shadow-2xs animate-pulse">
                        <i className="fas fa-spinner fa-spin text-[11px]"></i>
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold z-10 shadow-2xs">
                        <i className="fas fa-check text-[11px]"></i>
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">文档解析</span>
                        {liveStage === 'parsing' ? (
                          <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                            解析中
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">已完成</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 space-y-0.5 leading-tight pt-0.5">
                        <p>开始时间: 2023-11-15 09:25</p>
                        {liveStage === 'parsing' ? (
                          <p className="text-blue-600 font-medium">状态: 正在提取结构与数据 (5s)...</p>
                        ) : (
                          <>
                            <p>完成时间: 2023-11-15 09:25</p>
                            <p>耗时: 5秒</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 2: 规则校核 */}
                  <div className="relative flex items-start gap-3.5">
                    {liveStage === 'parsing' ? (
                      <div className="w-7 h-7 rounded-full border-2 border-slate-300 bg-white text-slate-400 flex items-center justify-center text-xs font-bold z-10">
                        2
                      </div>
                    ) : liveStage === 'checking' ? (
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold z-10 shadow-2xs animate-pulse">
                        2
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold z-10 shadow-2xs">
                        <i className="fas fa-check text-[11px]"></i>
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">规则校核</span>
                        {liveStage === 'parsing' ? (
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">等待中</span>
                        ) : liveStage === 'checking' ? (
                          <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                            进行中
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">已完成</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 space-y-0.5 leading-tight pt-0.5">
                        {liveStage === 'parsing' ? (
                          <p>等待解析完成后自动开始...</p>
                        ) : liveStage === 'checking' ? (
                          <>
                            <p>开始时间: 2023-11-15 09:25</p>
                            <p>已执行: <strong className="text-blue-600 font-bold">{simDynamicCount}/128</strong> 条</p>
                            <p>发现问题: <strong className="text-rose-600 font-bold">{Math.min(16, Math.floor((simDynamicCount / 128) * 16))}</strong> 项</p>
                          </>
                        ) : (
                          <>
                            <p>开始时间: 2023-11-15 09:25</p>
                            <p>完成时间: 2023-11-15 09:27</p>
                            <p>耗时: 2分 12秒</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: 结果生成 */}
                  <div className="relative flex items-start gap-3.5">
                    {liveStage === 'completed' ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold z-10 shadow-2xs">
                        <i className="fas fa-check text-[11px]"></i>
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full border-2 border-slate-300 bg-white text-slate-400 flex items-center justify-center text-xs font-bold z-10">
                        3
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">结果生成</span>
                        {liveStage === 'completed' ? (
                          <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">已完成</span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">等待中</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 space-y-0.5 leading-tight pt-0.5">
                        {liveStage === 'completed' ? (
                          <>
                            <p>开始时间: 2023-11-15 09:27</p>
                            <p>完成时间: 2023-11-15 09:27</p>
                            <p>耗时: 10秒</p>
                          </>
                        ) : (
                          <>
                            <p>开始时间: —</p>
                            <p>预计耗时: 约 10 秒</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==========================================
                RIGHT MAIN AREA: 直接从文档解析开始
               ========================================== */}
            <div className="flex-1 space-y-4 min-w-0">
              {/* CARD 1: 文档解析 */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div 
                  onClick={() => setIsParsingCardOpen(!isParsingCardOpen)}
                  className="p-4 bg-white hover:bg-slate-50/50 flex items-center justify-between cursor-pointer border-b border-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {liveStage === 'parsing' ? (
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                        <i className="fas fa-spinner fa-spin text-[10px]"></i>
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                        <i className="fas fa-check text-[10px]"></i>
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-slate-900">文档解析</h3>
                    {liveStage === 'parsing' ? (
                      <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                        <i className="fas fa-spinner fa-spin text-blue-600"></i> 解析中 (约5秒)...
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                        解析完成
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{liveStage === 'parsing' ? '解析中...' : '耗时: 5秒'}</span>
                    <i className={`fas fa-chevron-up transition-transform ${isParsingCardOpen ? '' : 'rotate-180'}`}></i>
                  </div>
                </div>

                {isParsingCardOpen && (
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      {/* Left File Card */}
                      <div className="md:col-span-5 bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base flex-shrink-0 shadow-2xs">
                          W
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{activeTask.reportName || '钻完井基本设计报告.docx'}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">12.6 MB · 86页</p>
                        </div>
                      </div>

                      {/* Right Metrics Grid */}
                      <div className="md:col-span-7 grid grid-cols-4 gap-2 text-center">
                        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-medium">识别章节</span>
                          <span className="font-bold text-slate-800 text-xs">9 章 / 52 节</span>
                        </div>
                        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-medium">表格</span>
                          <span className="font-bold text-slate-800 text-xs">16 张</span>
                        </div>
                        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-medium">图片</span>
                          <span className="font-bold text-slate-800 text-xs">24 张</span>
                        </div>
                        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-medium">关键参数</span>
                          <span className="font-bold text-slate-800 text-xs">138 项</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 2: 规则校核 (DYNAMIC TIMELINE / CHAPTER TREE) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div 
                  onClick={() => setIsRuleCheckCardOpen(!isRuleCheckCardOpen)}
                  className="p-4 bg-white hover:bg-slate-50/50 flex items-center justify-between cursor-pointer border-b border-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {liveStage === 'parsing' ? (
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                    ) : liveStage === 'checking' ? (
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                        <i className="fas fa-bars-staggered text-[10px]"></i>
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                        <i className="fas fa-check text-[10px]"></i>
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-slate-900">规则校核</h3>
                    
                    {liveStage === 'parsing' ? (
                      <span className="text-xs text-slate-400">等待文档解析完成后自动开启...</span>
                    ) : liveStage === 'checking' ? (
                      <span className="text-xs text-slate-500 flex items-center gap-2">
                        <span>已执行 <strong className="text-blue-600 font-bold">{simDynamicCount}/128</strong> 条</span>
                        <span>·</span>
                        <span className="text-rose-600 font-bold">发现问题 {Math.min(16, Math.floor((simDynamicCount / 128) * 16))} 项</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 flex items-center gap-2">
                        <span>已执行 <strong className="text-slate-800">128/128</strong> 条</span>
                        <span>·</span>
                        <span className="text-emerald-600 font-bold">通过 108 条</span>
                        <span>·</span>
                        <span className="text-rose-600 font-bold">发现问题 16 项</span>
                        <span>·</span>
                        <span className="text-slate-400">无法执行 4 条</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs font-medium" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setLiveFilter('all')}
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                          liveFilter === 'all' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        全部记录
                      </button>
                      <button
                        onClick={() => setLiveFilter('issues')}
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                          liveFilter === 'issues' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        仅看问题
                      </button>
                    </div>
                    <span className="text-slate-400">耗时: {liveProcessMode === 'running' ? '4分 18秒' : '12分 18秒'}</span>
                    <i className={`fas fa-chevron-up text-slate-400 transition-transform ${isRuleCheckCardOpen ? '' : 'rotate-180'}`}></i>
                  </div>
                </div>

                {isRuleCheckCardOpen && (
                  <div className="divide-y divide-slate-100 bg-white">
                    {/* Chapter 0: 全文与目录 */}
                    <div className="p-3.5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-check-circle text-emerald-500 text-sm"></i>
                          <span className="font-bold text-slate-800">全文与目录</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">8/8 条</span>
                          <span className="text-rose-600 font-bold">· 1项问题</span>
                          <i className="fas fa-chevron-right text-slate-300 text-[10px] ml-1"></i>
                        </div>
                      </div>
                    </div>

                    {/* Chapter 1: 1 项目概况 */}
                    <div className="p-3.5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-check-circle text-emerald-500 text-sm"></i>
                          <span className="font-bold text-slate-800">1 项目概况</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">12/12 条</span>
                          <span className="text-emerald-600 font-bold">· 全部通过</span>
                          <i className="fas fa-chevron-right text-slate-300 text-[10px] ml-1"></i>
                        </div>
                      </div>
                    </div>

                    {/* Chapter 2: 2 设计依据 */}
                    <div className="p-3.5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-check-circle text-emerald-500 text-sm"></i>
                          <span className="font-bold text-slate-800">2 设计依据</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">15/15 条</span>
                          <span className="text-rose-600 font-bold">· 2项问题</span>
                          <i className="fas fa-chevron-right text-slate-300 text-[10px] ml-1"></i>
                        </div>
                      </div>
                    </div>

                    {/* Chapter 3: 3 地质概况 (Expanded in Running State) */}
                    <div className="p-3.5 bg-slate-50/40">
                      <div 
                        onClick={() => {
                          const next = new Set(openChapterIds);
                          if (next.has('ch-3')) next.delete('ch-3'); else next.add('ch-3');
                          setOpenChapterIds(next);
                        }}
                        className="flex items-center justify-between text-xs cursor-pointer pb-2.5"
                      >
                        <div className="flex items-center gap-2">
                          {liveProcessMode === 'running' ? (
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                          ) : (
                            <i className="fas fa-check-circle text-emerald-500 text-sm"></i>
                          )}
                          <span className="font-bold text-slate-900 text-xs">3 地质概况</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {liveProcessMode === 'running' ? (
                            <span className="text-blue-600 font-bold">正在校核 9/18 条</span>
                          ) : (
                            <>
                              <span className="text-slate-500">18/18 条</span>
                              <span className="text-rose-600 font-bold">· 3项问题</span>
                            </>
                          )}
                          <i className={`fas fa-chevron-up text-slate-400 text-[10px] ml-1 transition-transform ${openChapterIds.has('ch-3') ? '' : 'rotate-180'}`}></i>
                        </div>
                      </div>

                      {openChapterIds.has('ch-3') && (
                        <div className="space-y-2 pt-1 pl-2">
                          {/* Item 1: Passed */}
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs gap-3 shadow-2xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <i className="fas fa-circle-check text-emerald-500 text-sm flex-shrink-0"></i>
                              <span className="text-slate-400 font-mono text-[11px] flex-shrink-0">[10:15:28]</span>
                              <span className="font-bold text-slate-800 truncate">3.1 地层信息 · 完整性</span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-emerald-600 font-bold text-[11px]">通过</span>
                              <span className="bg-slate-100 text-slate-500 font-mono text-[10px] px-1.5 py-0.5 rounded">RULE-041</span>
                              <span className="text-slate-500 text-[11px] hidden sm:inline">必填地层名称及深度范围</span>
                            </div>
                          </div>

                          {/* Item 2: Failed */}
                          <div className="p-2.5 bg-white rounded-xl border border-rose-200/80 flex items-center justify-between text-xs gap-3 shadow-2xs bg-rose-50/20">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <i className="fas fa-circle-xmark text-rose-500 text-sm flex-shrink-0"></i>
                              <span className="text-slate-400 font-mono text-[11px] flex-shrink-0">[10:15:30]</span>
                              <span className="font-bold text-slate-800 truncate">3.1 地层信息 · 准确性</span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-rose-600 font-bold text-[11px]">未通过</span>
                              <span className="bg-rose-50 text-rose-700 font-mono text-[10px] px-1.5 py-0.5 rounded border border-rose-200/60">RULE-042</span>
                              <span className="text-slate-600 text-[11px] hidden md:inline truncate max-w-xs">地层压力值与设计数据不一致</span>
                              <button 
                                onClick={() => setCurrentView('issues')}
                                className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded border border-rose-200 transition-colors"
                              >
                                查看问题
                              </button>
                            </div>
                          </div>

                          {/* Item 3: Checking / Dynamic */}
                          {liveProcessMode === 'running' && (
                            <div className="p-2.5 bg-blue-50/40 rounded-xl border border-blue-200/80 flex items-center justify-between text-xs gap-3 shadow-2xs">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <i className="fas fa-spinner fa-spin text-blue-600 text-sm flex-shrink-0"></i>
                                <span className="text-slate-400 font-mono text-[11px] flex-shrink-0">[10:15:33]</span>
                                <span className="font-bold text-blue-900 truncate">3.2 压力参数 · 一致性</span>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-blue-600 font-bold text-[11px]">校核中</span>
                                <span className="text-blue-700 text-[11px] animate-pulse">正在比对井筒数据与报告参数...</span>
                              </div>
                            </div>
                          )}

                          {/* Item 4: Pending */}
                          {liveProcessMode === 'running' && (
                            <div className="p-2.5 bg-white/60 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs gap-3 opacity-60">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <i className="far fa-circle text-slate-300 text-sm flex-shrink-0"></i>
                                <span className="text-slate-400 font-mono text-[11px] flex-shrink-0">[10:15:35]</span>
                                <span className="font-medium text-slate-700 truncate">3.3 风险提示 · 完整性</span>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-slate-400 text-[11px]">等待执行</span>
                                <span className="text-slate-300 text-[11px]">-</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Chapter 4: 4 工程设计 (Expanded in Completed State) */}
                    <div className="p-3.5 bg-slate-50/40">
                      <div 
                        onClick={() => {
                          const next = new Set(openChapterIds);
                          if (next.has('ch-4')) next.delete('ch-4'); else next.add('ch-4');
                          setOpenChapterIds(next);
                        }}
                        className="flex items-center justify-between text-xs cursor-pointer pb-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <i className="fas fa-check-circle text-emerald-500 text-sm"></i>
                          <span className="font-bold text-slate-900 text-xs">4 工程设计</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">{liveProcessMode === 'running' ? '0/36 条' : '36/36 条'}</span>
                          <span className="text-rose-600 font-bold">· 7项问题</span>
                          <i className={`fas fa-chevron-up text-slate-400 text-[10px] ml-1 transition-transform ${openChapterIds.has('ch-4') ? '' : 'rotate-180'}`}></i>
                        </div>
                      </div>

                      {openChapterIds.has('ch-4') && (
                        <div className="space-y-2 pt-1 pl-2">
                          {/* Item 3.1: Passed */}
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs gap-3 shadow-2xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <i className="fas fa-circle-check text-emerald-500 text-sm flex-shrink-0"></i>
                              <span className="text-slate-400 font-mono text-[11px] flex-shrink-0">[09:36:12]</span>
                              <span className="font-bold text-slate-800 truncate">3.1 预付款条款 · 完整性</span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-emerald-600 font-bold text-[11px]">通过</span>
                              <span className="bg-slate-100 text-slate-500 font-mono text-[10px] px-1.5 py-0.5 rounded">RULE-063</span>
                              <span className="text-slate-500 text-[11px] hidden sm:inline">付款条件要素完整</span>
                            </div>
                          </div>

                          {/* Item 3.2: Failed 1 */}
                          <div className="p-2.5 bg-white rounded-xl border border-rose-200/80 flex items-center justify-between text-xs gap-3 shadow-2xs bg-rose-50/20">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <i className="fas fa-circle-xmark text-rose-500 text-sm flex-shrink-0"></i>
                              <span className="text-slate-400 font-mono text-[11px] flex-shrink-0">[09:36:18]</span>
                              <span className="font-bold text-slate-800 truncate">3.2 付款节点 · 准确性</span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-rose-600 font-bold text-[11px]">未通过</span>
                              <span className="bg-rose-50 text-rose-700 font-mono text-[10px] px-1.5 py-0.5 rounded border border-rose-200/60">RULE-071</span>
                              <span className="text-slate-600 text-[11px] hidden md:inline truncate max-w-xs">主合同预付款30%与补充协议15%不一致</span>
                              <button 
                                onClick={() => setCurrentView('issues')}
                                className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded border border-rose-200 transition-colors"
                              >
                                查看问题
                              </button>
                            </div>
                          </div>

                          {/* Item 3.2: Failed 2 */}
                          <div className="p-2.5 bg-white rounded-xl border border-rose-200/80 flex items-center justify-between text-xs gap-3 shadow-2xs bg-rose-50/20">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <i className="fas fa-circle-xmark text-rose-500 text-sm flex-shrink-0"></i>
                              <span className="text-slate-400 font-mono text-[11px] flex-shrink-0">[09:36:24]</span>
                              <span className="font-bold text-slate-800 truncate">3.2 付款节点 · 一致性</span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-rose-600 font-bold text-[11px]">未通过</span>
                              <span className="bg-rose-50 text-rose-700 font-mono text-[10px] px-1.5 py-0.5 rounded border border-rose-200/60">RULE-072</span>
                              <span className="text-slate-600 text-[11px] hidden md:inline truncate max-w-xs">质保金比例与尾款支付时间存在表述矛盾</span>
                              <button 
                                onClick={() => setCurrentView('issues')}
                                className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded border border-rose-200 transition-colors"
                              >
                                查看问题
                              </button>
                            </div>
                          </div>

                          {/* Item 3.3: Unexecutable */}
                          <div className="p-2.5 bg-white rounded-xl border border-amber-200/80 flex items-center justify-between text-xs gap-3 shadow-2xs bg-amber-50/20">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <i className="fas fa-triangle-exclamation text-amber-500 text-sm flex-shrink-0"></i>
                              <span className="text-slate-400 font-mono text-[11px] flex-shrink-0">[09:36:31]</span>
                              <span className="font-bold text-slate-800 truncate">3.3 结算计税 · 完整性</span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-amber-700 font-bold text-[11px]">无法执行</span>
                              <span className="bg-amber-50 text-amber-800 font-mono text-[10px] px-1.5 py-0.5 rounded border border-amber-200/60">RULE-078</span>
                              <span className="text-slate-600 text-[11px] hidden md:inline truncate max-w-xs">缺少增值税专票开具资质文件</span>
                              <button className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] rounded border border-amber-200 transition-colors">
                                补充说明
                              </button>
                            </div>
                          </div>

                          {/* Item 3.4: Passed */}
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs gap-3 shadow-2xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <i className="fas fa-circle-check text-emerald-500 text-sm flex-shrink-0"></i>
                              <span className="text-slate-400 font-mono text-[11px] flex-shrink-0">[09:36:40]</span>
                              <span className="font-bold text-slate-800 truncate">3.4 履约发票 · 规范性</span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-emerald-600 font-bold text-[11px]">通过</span>
                              <span className="bg-slate-100 text-slate-500 font-mono text-[10px] px-1.5 py-0.5 rounded">RULE-084</span>
                              <span className="text-slate-500 text-[11px] hidden sm:inline">发票抬头与税率条款规范</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chapter 5: 7 违约责任与赔偿 */}
                    <div className="p-3.5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-check-circle text-emerald-500 text-sm"></i>
                          <span className="font-bold text-slate-800">7 违约责任与赔偿</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">22/22 条</span>
                          <span className="text-rose-600 font-bold">· 2项问题</span>
                          <i className="fas fa-chevron-right text-slate-300 text-[10px] ml-1"></i>
                        </div>
                      </div>
                    </div>

                    {/* Chapter 6: 9 争议解决与管辖 */}
                    <div className="p-3.5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-check-circle text-emerald-500 text-sm"></i>
                          <span className="font-bold text-slate-800">9 争议解决与管辖</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">12/12 条</span>
                          <span className="text-slate-400">· 1条未执行</span>
                          <i className="fas fa-chevron-right text-slate-300 text-[10px] ml-1"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 3: BOTTOM COMPLETION BANNER (Appears when completed) */}
              {liveProcessMode === 'completed' && (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      <i className="fas fa-check"></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">校核完成</h3>
                        <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium border border-amber-200/60">
                          建议修改后提交
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[11px] rounded">
                          严重问题 2 项
                        </span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[11px] rounded">
                          一般问题 10 项
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-[11px] rounded">
                          提示 4 项
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentView('issues')}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    进入结果审阅
                    <i className="fas fa-arrow-right text-[11px]"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            STATE 7: 校核结果审阅 (INTEGRATED SINGLE VIEW WITH IN-AREA ISSUE LIST MAXIMIZATION)
           ------------------------------------------------------------ */}
        {(activeTask.currentView === 'issues' || activeTask.currentView === 'doc' || activeTask.currentView === 'report' || activeTask.currentView === 'rules') && (
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-4 items-start">
              
              {/* 左侧：文档内容与章节定位 (仅在非全屏问题清单时显示) */}
              {!isIssuesMaximized && (
                <div className="col-span-12 lg:col-span-8 flex flex-col sm:grid sm:grid-cols-12 gap-3 lg:h-[calc(100vh-220px)] lg:min-h-[480px] lg:max-h-[820px] h-auto min-h-0 w-full">
                  {/* 章节目录 (COL-SPAN-12/4) */}
                  <div className="col-span-12 sm:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-3.5 flex flex-col space-y-3 shadow-2xs h-[250px] sm:h-full min-h-0 w-full">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-shrink-0">
                      <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <i className="fas fa-list-tree text-teal-600"></i>
                        章节目录
                      </h3>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">86页</span>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto text-xs space-y-1 text-slate-600 custom-scrollbar pr-1">
                      <div className="p-2 rounded-xl bg-slate-50 font-bold text-slate-800 text-[11px]">第三条 付款方式与结算</div>
                      <div className="pl-3 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600">3.1 预付款支付条件</div>
                      <div className="pl-3 p-1.5 rounded-lg bg-teal-50 text-teal-800 font-bold border border-teal-100/80 flex items-center justify-between">
                        <span>3.2 进度款与结算方式</span>
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      </div>
                      <div className="pl-3 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600">3.3 发票与税费开具</div>
                      <div className="p-2 rounded-xl bg-slate-50 font-bold text-slate-800 text-[11px] mt-2">第四条 质保金与保证金</div>
                      <div className="pl-3 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600">4.1 质保金扣留比例</div>
                      <div className="pl-3 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600">4.2 质保期退还条件</div>
                      <div className="p-2 rounded-xl bg-slate-50 font-bold text-slate-800 text-[11px] mt-2">第七条 违约责任与赔偿</div>
                      <div className="pl-3 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600">7.1 逾期交货违约金</div>
                      <div className="pl-3 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600">7.2 损害赔偿与免责</div>
                    </div>
                  </div>

                  {/* 文档正文与定位高亮 (COL-SPAN-12/8) */}
                  <div className="col-span-12 sm:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-4 flex flex-col justify-between shadow-2xs h-[400px] sm:h-full min-h-0 overflow-hidden space-y-3 w-full">
                    <div className="flex-1 min-h-0 flex flex-col">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3 text-xs font-bold text-slate-600 flex-shrink-0">
                        <span className="flex items-center gap-1.5 text-slate-800">
                          <i className="fas fa-file-invoice text-teal-600"></i>
                          合同正文 · 第 8 / 24 页
                        </span>
                        <div className="flex items-center gap-2 text-teal-700 text-[11px]">
                          <button className="hover:underline flex items-center gap-1 cursor-pointer">
                            <i className="fas fa-chevron-left text-[9px]"></i> 上一问题
                          </button>
                          <span className="text-slate-300">|</span>
                          <button className="hover:underline flex items-center gap-1 cursor-pointer">
                            下一问题 <i className="fas fa-chevron-right text-[9px]"></i>
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-3.5 text-xs leading-relaxed text-slate-800 pr-1">
                        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between">
                          <span>第三条 付款方式与结算</span>
                          <span className="text-[10px] font-normal text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">发现 1 项条款表述冲突</span>
                        </h2>
                        <p className="text-slate-600">
                          合同生效后，买方按照项目履约进度安排向卖方支付相应的合同款项。各期付款均须提供合法有效的增值税专用发票。
                        </p>
                        
                        {/* 问题原文高亮框 */}
                        <div className="p-3.5 bg-rose-50/80 border-l-4 border-rose-500 rounded-r-2xl text-rose-950 space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold flex items-center gap-1 text-rose-900">
                              <i className="fas fa-location-dot text-rose-600"></i>
                              问题高亮定位
                            </span>
                            <span className="font-mono text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">P.8</span>
                          </div>
                          <p className="text-xs leading-relaxed font-medium">
                            “……首期预付款为合同总金额的 <mark className="bg-rose-200 text-rose-950 font-bold px-1.5 py-0.5 rounded border border-rose-300/80">30%</mark>，货到验收合格后支付 60%，余款10%留作质保金。”
                          </p>
                        </div>

                        <p className="text-slate-600">
                          补充协议（附件三）资金到账计划记载预付款支付比例为 15%。全过程须符合《采购合同审查与合规强条标准 V1.0》强条规定。
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 flex-shrink-0">
                      <span>当前展示：油气装备年度采购框架合同协议_V3.docx</span>
                      <span className="text-teal-700 font-medium">点击右侧问题卡片可准确定位与办理</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 右侧：问题清单 (全屏时为 col-span-12 填满审阅区，否则 col-span-12 lg:col-span-4) */}
              <div className={`${isIssuesMaximized ? 'col-span-12' : 'col-span-12 lg:col-span-4'} bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-2xs flex flex-col h-[500px] lg:h-[calc(100vh-220px)] lg:min-h-[480px] lg:max-h-[820px] transition-all w-full`}>
                {/* Header & Filter Options */}
                <div className="space-y-2.5 border-b border-slate-100 pb-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <i className="fas fa-list-check text-teal-600"></i>
                      问题清单
                      <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full text-[11px] font-bold border border-teal-200/60">
                        {filteredIssues.length} / {stats.totalCount} 项
                      </span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500">
                        已处理：<strong className="text-teal-700">{stats.confirmedCount}</strong>
                      </span>
                      <button
                        onClick={() => setIsIssuesMaximized(!isIssuesMaximized)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isIssuesMaximized ? 'bg-teal-600 text-white' : 'bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600'
                        }`}
                        title={isIssuesMaximized ? '退出全屏' : '全屏展示问题清单'}
                      >
                        <i className={`fas ${isIssuesMaximized ? 'fa-compress-arrows-alt' : 'fa-expand-arrows-alt'}`}></i>
                        <span className="text-[10px]">{isIssuesMaximized ? '退出全屏' : '全屏展示'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter Bar Layout */}
                  <div className={`grid gap-2 ${isIssuesMaximized ? 'grid-cols-12' : 'grid-cols-1'}`}>
                    {/* Search Box */}
                    <div className={`relative ${isIssuesMaximized ? 'col-span-6' : 'col-span-1'}`}>
                      <i className="fas fa-search absolute left-2.5 top-2.5 text-slate-400 text-[11px]"></i>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="搜索问题、章节或规则..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all"
                      />
                    </div>

                    {/* Dropdown Filters: 校核类型 & 严重程度 */}
                    <div className={`grid grid-cols-2 gap-2 ${isIssuesMaximized ? 'col-span-6' : 'col-span-1'}`}>
                      <select
                        value={checkTypeFilter}
                        onChange={e => setCheckTypeFilter(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-teal-500 transition-all cursor-pointer"
                      >
                        <option value="all">全部分类 (完整/一致/合规)</option>
                        <option value="completeness">完整性</option>
                        <option value="consistency">一致性</option>
                        <option value="compliance">合规性</option>
                      </select>

                      <select
                        value={severityFilter}
                        onChange={e => setSeverityFilter(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-teal-500 transition-all cursor-pointer"
                      >
                        <option value="all">所有等级</option>
                        <option value="severe">严重 ({stats.severeCount})</option>
                        <option value="general">一般 ({stats.generalCount})</option>
                        <option value="hint">提示 ({stats.hintCount})</option>
                      </select>
                    </div>
                  </div>

                  {/* Batch Actions Bar */}
                  {selectedBatchIds.size > 0 && (
                    <div className="flex items-center justify-between text-xs bg-teal-50 p-2 rounded-xl border border-teal-200/80">
                      <span className="text-teal-900 font-bold text-[11px]">已勾选 {selectedBatchIds.size} 项</span>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => applyBatchAction('confirmed')} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer text-[10px]">批量确认</button>
                        <button onClick={() => applyBatchAction('ignored')} className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer text-[10px]">批量忽略</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scrollable Issues List */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar pr-1 ${isIssuesMaximized ? 'grid grid-cols-2 gap-3 space-y-0 auto-rows-max' : 'space-y-2.5'}`}>
                  {filteredIssues.map(issue => (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssue(issue)}
                      className={`p-3 bg-white rounded-xl border transition-all cursor-pointer hover:shadow-md hover:border-teal-400 flex items-start justify-between gap-2.5 ${
                        issue.severity === 'severe' ? 'border-rose-200/90 bg-rose-50/20' : 'border-slate-200/90'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedBatchIds.has(issue.id)}
                          onChange={e => { e.stopPropagation(); toggleSelectBatch(issue.id); }}
                          className="mt-1 rounded text-teal-600 cursor-pointer"
                        />

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              issue.severity === 'severe' ? 'bg-rose-100 text-rose-700' :
                              issue.severity === 'general' ? 'bg-amber-100 text-amber-800' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {issue.severity === 'severe' ? '严重' : issue.severity === 'general' ? '一般' : '提示'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              {issue.category}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">{issue.title}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2">{issue.description}</p>
                          <div className="flex items-center gap-2.5 text-[10px] text-slate-400 font-medium">
                            <span>{issue.chapter}</span>
                            <span>P.{issue.pageNum}</span>
                            <span className="font-mono text-slate-500">{issue.ruleCode}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          issue.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {issue.status === 'confirmed' ? '已确认' : '待处理'}
                        </span>
                        <i className="fas fa-chevron-right text-slate-300 text-[10px] mt-1"></i>
                      </div>
                    </div>
                  ))}

                  {filteredIssues.length === 0 && (
                    <div className={`${isIssuesMaximized ? 'col-span-2' : ''} text-center py-12 text-slate-400 space-y-2`}>
                      <i className="fas fa-inbox text-2xl text-slate-300"></i>
                      <p className="text-xs font-medium">暂无匹配的问题项</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────
          MODAL 1: 保存成果至空间 MODAL (STATE 8)
         ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSaveOutcomeModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                    <i className="fas fa-floppy-disk"></i>
                  </div>
                  <h3 className="text-base font-bold text-slate-800">保存校核成果至工作空间</h3>
                </div>
                <button onClick={() => setShowSaveOutcomeModal(false)} className="text-slate-400 hover:text-slate-600">
                  <i className="fas fa-xmark text-sm"></i>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">成果名称</label>
                  <input
                    type="text"
                    value={saveOutcomeName}
                    onChange={e => setSaveOutcomeName(e.target.value)}
                    placeholder="采购合同审查与合规校核报告"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-bold"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-slate-600">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>来源任务：{activeTask.reportName}</span>
                    <span>校核对象：{activeTask.mainObject}</span>
                  </div>
                  <p className="text-[11px]">校验标准：{activeTask.auditStandard}</p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">成果包含内容快照：</label>
                  <div className="grid grid-cols-2 gap-2 text-slate-700 font-medium">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={saveOptions.conclusion} onChange={e => setSaveOptions({...saveOptions, conclusion: e.target.checked})} className="rounded text-teal-600" />
                      校核结论与总体评价
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={saveOptions.issues} onChange={e => setSaveOptions({...saveOptions, issues: e.target.checked})} className="rounded text-teal-600" />
                      完整问题清单 ({stats.totalCount}项)
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={saveOptions.rules} onChange={e => setSaveOptions({...saveOptions, rules: e.target.checked})} className="rounded text-teal-600" />
                      全量 128 条规则执行结果
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={saveOptions.evidence} onChange={e => setSaveOptions({...saveOptions, evidence: e.target.checked})} className="rounded text-teal-600" />
                      报告原文高亮定位锚点
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setShowSaveOutcomeModal(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold">
                  取消
                </button>
                <button onClick={handleDoSaveOutcome} className="px-5 py-2 bg-teal-600 text-white rounded-xl font-bold shadow-md">
                  保存至“输出成果”
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────
          DRAWER 1: ISSUE DETAIL DRAWER (问题处理与规则比对抽屉)
         ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedIssue && (
          <motion.div
            initial={{ x: 480 }}
            animate={{ x: 0 }}
            exit={{ x: 480 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute right-0 top-0 bottom-0 w-[460px] bg-white border-l border-slate-200 shadow-2xl z-40 flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedIssue.severity === 'severe' ? 'bg-rose-100 text-rose-700' :
                  selectedIssue.severity === 'general' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'
                }`}>
                  {selectedIssue.severity === 'severe' ? '严重问题' : selectedIssue.severity === 'general' ? '一般问题' : '提示'}
                </span>
                <span className="px-2 py-0.5 bg-slate-200/80 text-slate-700 rounded text-[10px] font-bold">
                  {selectedIssue.category}
                </span>
              </div>
              <button onClick={() => setSelectedIssue(null)} className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer">
                <i className="fas fa-xmark text-sm"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs custom-scrollbar">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{selectedIssue.title}</h3>
                <p className="text-slate-500 mt-1">章节：{selectedIssue.chapter} (第 {selectedIssue.pageNum} 页)</p>
              </div>

              {/* 规则原文展示 */}
              <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-200/80 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
                    <i className="fas fa-book-bookmark text-indigo-600"></i>
                    规则原文
                  </span>
                  <span className="font-mono text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold border border-indigo-200">
                    {selectedIssue.ruleCode}
                  </span>
                </div>
                <p className="text-indigo-950 font-medium leading-relaxed text-[11px] bg-white/90 p-3 rounded-xl border border-indigo-100 shadow-2xs">
                  {selectedIssue.ruleOriginalText || `【${selectedIssue.ruleCode} · ${selectedIssue.ruleName}】依据《民法典合同编》及《${selectedIssue.basisText || '采购合同审查与合规强条标准'}》，需要对对应条款与风险要素进行精确定位。`}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">报告原文：</span>
                <p className="text-slate-800 italic">{selectedIssue.originalText}</p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1 font-mono">
                <span className="font-bold text-amber-900 block font-sans">比对依据 / 官方设计数据：</span>
                <p className="text-amber-900">{selectedIssue.actualDataText}</p>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 space-y-1">
                <span className="font-bold text-teal-900 block">智能修改建议：</span>
                <p className="text-teal-900">{selectedIssue.recommendation}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center gap-2 font-bold">
                <button
                  onClick={() => {
                    setTaskIssues(prev => prev.map(i => i.id === selectedIssue.id ? { ...i, status: 'confirmed' } : i));
                    setSelectedIssue(null);
                    showToast('已确认该校核问题');
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
                >
                  确认此问题
                </button>
                <button
                  onClick={() => {
                    setTaskIssues(prev => prev.map(i => i.id === selectedIssue.id ? { ...i, status: 'ignored' } : i));
                    setSelectedIssue(null);
                    showToast('已标记该问题为忽略/误报');
                  }}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl"
                >
                  标记误报/忽略
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────
          DRAWER 2: RULE DETAIL DRAWER (规则比对详情抽屉)
         ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedRule && (
          <motion.div
            initial={{ x: 480 }}
            animate={{ x: 0 }}
            exit={{ x: 480 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute right-0 top-0 bottom-0 w-[460px] bg-white border-l border-slate-200 shadow-2xl z-40 flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="font-mono font-bold text-xs text-slate-700">规则详情：{selectedRule.code}</span>
              <button onClick={() => setSelectedRule(null)} className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-500">
                <i className="fas fa-xmark text-sm"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs custom-scrollbar">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{selectedRule.name}</h3>
                <p className="text-slate-500 mt-1">{selectedRule.description}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">数据来源：</span>
                <p className="text-slate-800">{selectedRule.dataSource}</p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 block">执行步骤验证清单：</span>
                <div className="space-y-2">
                  {selectedRule.steps.map((st, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                      <i className={`fas ${st.done ? 'fa-check-circle text-emerald-500' : 'fa-circle text-slate-300'}`}></i>
                      <span className="text-slate-700 font-medium">{st.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────
          ALL CHECK TASKS MODAL (所有校核任务列表分页弹窗)
         ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAllTasksDrawer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center font-bold">
                    <i className="fas fa-list-check"></i>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">校核任务列表</h3>
                    <p className="text-xs text-slate-500">查看所有历史及当前校核任务与状态分页</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAllTasksDrawer(false)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                >
                  <i className="fas fa-xmark text-sm"></i>
                </button>
              </div>

              {/* Search & Filters */}
              <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                  <input
                    type="text"
                    placeholder="搜索校核任务名称或报告名称..."
                    value={allTasksSearch}
                    onChange={(e) => {
                      setAllTasksSearch(e.target.value);
                      setAllTasksPage(1);
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-teal-500 transition-all"
                  />
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  共找到 <span className="font-bold text-slate-800">{filteredAllTasks.length}</span> 个任务
                </div>
              </div>

              {/* Tasks Table */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {filteredAllTasks.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    <i className="fas fa-folder-open text-3xl mb-2 text-slate-300"></i>
                    <p>未找到匹配的校核任务</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                          <th className="p-3">校核任务名称 / 报告名称</th>
                          <th className="p-3">校核标准</th>
                          <th className="p-3">状态</th>
                          <th className="p-3">执行耗时</th>
                          <th className="p-3">创建时间</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedAllTasks.map(t => (
                          <tr 
                            key={t.id} 
                            onClick={() => {
                              setActiveTaskId(t.id);
                              setShowAllTasksDrawer(false);
                            }}
                            className={`hover:bg-teal-50/40 transition-colors cursor-pointer ${t.id === activeTaskId ? 'bg-teal-50/70 font-medium' : ''}`}
                          >
                            <td className="p-3">
                              <div className="font-bold text-slate-900 truncate max-w-[280px] flex items-center gap-2">
                                {t.id === activeTaskId && <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0"></span>}
                                {t.reportName || '未命名报告'}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">ID: {t.runId || t.id}</div>
                            </td>
                            <td className="p-3 text-slate-600 truncate max-w-[220px]">{t.auditStandard}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                t.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                t.status === 'parsing' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                'bg-teal-50 text-teal-700 border border-teal-200'
                              }`}>
                                {t.status === 'completed' ? '已完成' :
                                 t.status === 'parsing' ? '解析中' : '校核中'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-700 font-mono text-[11px] font-semibold">{t.duration || '45s'}</td>
                            <td className="p-3 text-slate-500 text-[11px]">{t.createdAt || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-bold">
                <div>共 {filteredAllTasks.length} 项任务，每页 {allTasksPageSize} 项</div>
                
                <div className="flex items-center gap-1">
                  <button 
                    disabled={allTasksPage === 1}
                    onClick={() => setAllTasksPage(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg bg-white hover:border-teal-500 hover:text-teal-600 disabled:opacity-30 transition-all font-bold cursor-pointer"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  {[...Array(totalAllTasksPages || 1)].map((_, i) => (
                     <button
                      key={i}
                      onClick={() => setAllTasksPage(i + 1)}
                      className={`w-8 h-8 flex items-center justify-center border transition-all font-bold rounded-lg cursor-pointer ${
                        allTasksPage === i + 1 
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    disabled={allTasksPage === totalAllTasksPages || totalAllTasksPages === 0}
                    onClick={() => setAllTasksPage(prev => Math.min(totalAllTasksPages, prev + 1))}
                    className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg bg-white hover:border-teal-500 hover:text-teal-600 disabled:opacity-30 transition-all font-bold cursor-pointer"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
