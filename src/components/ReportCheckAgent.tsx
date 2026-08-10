import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ReportCheckAgentProps {
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
}

// Initial Mock Issues
const mockIssuesTask1: AuditIssue[] = [
  {
    id: 'iss-1',
    severity: 'severe',
    category: '准确性',
    title: '井身结构关键参数与正式设计数据不一致',
    description: '报告填写的技术套管下深为3200m，RC1井正式设计数据记录为3250m。',
    chapter: '5.2 井身结构设计',
    pageNum: 36,
    ruleCode: 'DRILL-032',
    ruleName: '井身结构参数一致性检查',
    basisText: '报告原文 + 设计数据V4 + 标准规则 DRILL-032',
    credibility: 94,
    originalText: '“技术套管设计下深为3200m，二开开钻井深1200m……”',
    actualDataText: '井身结构设计V4 / Sheet2 / 第18行 (3250m)',
    recommendation: '建议核实报告采用的数据版本。如以V4为准，将技术套管下深修改为3250m，并补充参数版本说明。',
    status: 'pending',
    timeline: [
      { time: '14:31:48', text: '从报告第36页提取参数 3200m' },
      { time: '14:31:51', text: '从井身结构设计V4提取参数 3250m' },
      { time: '14:31:52', text: 'DRILL-032 判定数值不一致' },
      { time: '14:32:03', text: '核对报告引用的数据版本' },
      { time: '14:32:10', text: '排除单位换算和对象混用' },
      { time: '14:32:12', text: '形成正式问题，可信度 94%' },
    ]
  },
  {
    id: 'iss-2',
    severity: 'severe',
    category: '合规性',
    title: '防喷器压力等级低于地层套管头预测压力强条',
    description: '第7.1章配置防喷器额定工作压力35MPa，低于设计最大关井井口压力42MPa要求。',
    chapter: '7.1 井控设备配置',
    pageNum: 48,
    ruleCode: 'WELL-CTRL-005',
    ruleName: '井控设备额定压力合规强条审查',
    basisText: '石油天然气钻井工程设计规范 GB/T 24971 第8.2条强条',
    credibility: 98,
    originalText: '“选用 21-35 环形防喷器及双闸板防喷器组，工作压力 35MPa……”',
    actualDataText: '高压气层预测地层压力 42MPa (井控标准强条要求 ≥ 70MPa)',
    recommendation: '强条不合规！请立即升级防喷器组压力等级至70MPa，并重新计算井控安全系数。',
    status: 'pending',
    timeline: [
      { time: '14:31:55', text: '读取第48页防喷器配置参数 35MPa' },
      { time: '14:31:58', text: '交叉比对高压气层预测压力 42MPa' },
      { time: '14:32:00', text: '触发国标GB/T 24971强条合规审查' },
      { time: '14:32:02', text: '形成严重合规风险预警，可信度 98%' }
    ]
  },
  {
    id: 'iss-3',
    severity: 'severe',
    category: '数据一致性',
    title: '全井钻井液密度上限与气层安全压差窗口冲突',
    description: '第4.2章钻井液密度上限1.45g/cm³，与第6.3章安全坍塌窗口1.52g/cm³不相符。',
    chapter: '4.2 钻井液体系设计',
    pageNum: 28,
    ruleCode: 'MUD-WIN-012',
    ruleName: '钻井液安全密度窗口逻辑比对',
    basisText: '钻井液设计规则 + 坍塌压力比对规则',
    credibility: 91,
    originalText: '“钻井液体系密度控制在 1.35~1.45 g/cm³ 范围内……”',
    actualDataText: '第6.3章“三开地层坍塌压力当量密度 1.50 g/cm³”',
    recommendation: '建议统一两章节的数据表述，将钻井液密度调整至 1.52~1.58 g/cm³，避免井壁失稳风险。',
    status: 'pending',
    timeline: [
      { time: '14:31:40', text: '提取第28页钻井液密度 1.45g/cm³' },
      { time: '14:31:44', text: '提取第63页坍塌压力 1.50g/cm³' },
      { time: '14:31:46', text: '发现钻井液密度低于坍塌压力窗口' }
    ]
  },
  {
    id: 'iss-4',
    severity: 'general',
    category: '规范性',
    title: '钻头类型专业术语缩写不符合行业标准',
    description: '报告第32页使用自定义缩写“PDC-X”，行业标准应为“PDC-1955”。',
    chapter: '5.1 钻头及钻具组合',
    pageNum: 32,
    ruleCode: 'NORM-BIT-003',
    ruleName: '钻头及工具术语规范',
    basisText: '钻完井设计报告校核标准 V2.1 规范性条款',
    credibility: 88,
    originalText: '“二开使用 PDC-X 复合片钻头配螺杆钻进……”',
    actualDataText: 'SY/T 5358 钻头分类与代码标准',
    recommendation: '修改为标准代码规范“PDC-1955”或注明标准型号含义。',
    status: 'pending',
    timeline: [{ time: '14:31:30', text: '术语匹配引擎扫描第32页' }]
  },
  {
    id: 'iss-5',
    severity: 'general',
    category: '完整性',
    title: '缺少固井水泥浆抗温抗盐试验数据附表',
    description: '第5.4章提到了高抗盐水泥浆体系，但未附实验室抗耐温试验曲线图表。',
    chapter: '5.4 固井工程方案',
    pageNum: 41,
    ruleCode: 'DOC-ATTACH-008',
    ruleName: '关键技术方案附表完整性检测',
    basisText: '钻完井基本设计编写规范 附录B',
    credibility: 85,
    originalText: '“固井采用高抗盐抗高温水泥浆体系（详见试验附表）……”',
    actualDataText: '附录列表中未包含“水泥浆抗温抗盐测试报告”',
    recommendation: '在报告附录三中补齐水泥浆稠化时间与抗压强度试验数据表。',
    status: 'pending',
    timeline: [{ time: '14:31:25', text: '附录交叉检索未命中文件' }]
  },
  {
    id: 'iss-6',
    severity: 'hint',
    category: '排版格式',
    title: '第3章表3-2表格列宽超出边框及页码不连续',
    description: '表3-2地层分层预测表右侧列被截断，且页脚页码出现跳页（第22页跳至24页）。',
    chapter: '3.2 地层预测表',
    pageNum: 23,
    ruleCode: 'FMT-TBL-001',
    ruleName: '文档表格排版与页码连续性',
    basisText: '企业报告通用规范 V1.4',
    credibility: 95,
    originalText: '表3-2 邻井地层对比预测表',
    actualDataText: '页面边距 2.5cm，表格总宽超出 1.8cm',
    recommendation: '调整表格自适应列宽或更改为横向版面布局，重排页码。',
    status: 'pending',
    timeline: [{ time: '14:31:10', text: 'Word排版引擎解析版面边界' }]
  },
  {
    id: 'iss-7',
    severity: 'hint',
    category: '引用规范',
    title: '邻井RC2井数据引用未标注数据来源出处',
    description: '第2.1章引用了RC2井邻井复核数据，但未标注测量日期或报告编号。',
    chapter: '2.1 区域地质背景',
    pageNum: 14,
    ruleCode: 'REF-CITE-004',
    ruleName: '数据出处与参考引文规范',
    basisText: '企业报告通用规范 V1.4',
    credibility: 82,
    originalText: '“根据 RC2 井实测孔隙度 12.4%……”',
    actualDataText: '缺少引文脚注或参考文献编号',
    recommendation: '添加脚注：引用自《RC2井完井总结报告（2025年）》。',
    status: 'pending',
    timeline: [{ time: '14:31:05', text: '引文归因检测' }]
  },
  {
    id: 'iss-8',
    severity: 'unexecuted',
    category: '准确性',
    title: '地层孔隙压力预测准确性检查（缺少预测数据）',
    description: '因空间中缺失“RC1井地层压力预测数据”，无法执行该规则比对。',
    chapter: '4.1 地层压力预测',
    pageNum: 26,
    ruleCode: 'PRESS-PRED-001',
    ruleName: '地层压力比对检测',
    basisText: '缺少 RC1 井测井地层压力预测源文件',
    credibility: 0,
    originalText: '“4.1 地层压力预测计算值”',
    actualDataText: '未加载测井地层压力数据库',
    recommendation: '请在空间资源中上传 RC1 井地层压力预测数据表后重新对该规则触发校核。',
    status: 'pending',
    timeline: [{ time: '14:31:00', text: '规则执行中断：源数据未就绪' }]
  }
];

// Initial Rules List
const mockRulesList: RuleItem[] = [
  {
    id: 'r-1',
    code: 'DRILL-032',
    name: '套管下深与正式设计一致性检查',
    category: '参数准确性',
    status: 'failed',
    duration: '1.2s',
    targetChapter: '5.2 井身结构设计',
    issuesCount: 1,
    description: '检查报告正文、表格中的套管下深参数是否与RC1井官方设计数据库相符。',
    inputs: ['报告第36页 5.2节', 'RC1井正式设计参数V4', '校核标准 DRILL-032'],
    steps: [
      { text: '定位报告第5.2节参数表', done: true },
      { text: '提取技术套管下深数值: 3200m', done: true },
      { text: '匹配空间资源 RC1井正式设计V4: 3250m', done: true },
      { text: '判断数值偏差: 50m (超过阈值0m)', done: true },
      { text: '生成发现问题记录', done: true }
    ],
    dataSource: 'RC1井井身结构设计V4 · 钻井工程数据库'
  },
  {
    id: 'r-2',
    code: 'WELL-CTRL-005',
    name: '井控防喷器压力等级合规审查',
    category: '合规性',
    status: 'failed',
    duration: '0.8s',
    targetChapter: '7.1 井控设备配置',
    issuesCount: 1,
    description: '审查防喷器额定工作压力是否满足最高气层地层压力安全包络线。',
    inputs: ['报告第48页 7.1节', '高压气层预测地层压力 42MPa', 'GB/T 24971强条'],
    steps: [
      { text: '读取7.1节防喷器参数: 35MPa', done: true },
      { text: '读取气层地层压力: 42MPa', done: true },
      { text: '比对国标强条要求: 防喷器 ≥ 70MPa', done: true },
      { text: '判定合规状态: 不合规', done: true }
    ],
    dataSource: '石油天然气钻井工程设计规范 GB/T 24971'
  },
  {
    id: 'r-3',
    code: 'MUD-WIN-012',
    name: '钻井液密度与地层坍塌窗口比对',
    category: '数据逻辑',
    status: 'failed',
    duration: '1.5s',
    targetChapter: '4.2 钻井液体系设计',
    issuesCount: 1,
    description: '对比钻井液密度设计上限与坍塌压力当量密度，避免井壁坍塌漏失。',
    inputs: ['报告4.2节', '报告6.3节', '地层坍塌压力窗口数据'],
    steps: [
      { text: '提取4.2节钻井液密度: 1.45g/cm³', done: true },
      { text: '提取6.3节坍塌压力: 1.50g/cm³', done: true },
      { text: '计算压差安全窗口', done: true },
      { text: '判定逻辑冲突: 密度低于坍塌压力', done: true }
    ],
    dataSource: '地层三压力预测报告 V2'
  },
  {
    id: 'r-4',
    code: 'DOC-STRUCT-001',
    name: '报告一级与二级大纲目录完整性',
    category: '结构完整性',
    status: 'passed',
    duration: '0.4s',
    targetChapter: '全文目录',
    issuesCount: 0,
    description: '校验报告是否包含规范要求的12个一级必填章节和46个二级子章节。',
    inputs: ['报告目录树', '钻完井设计报告校核标准大纲模板'],
    steps: [
      { text: '解析报告目录树', done: true },
      { text: '与标准大纲做集合映射', done: true },
      { text: '校验必填章节覆盖率: 100%', done: true }
    ],
    dataSource: '钻完井设计报告校核标准 V2.1'
  },
  {
    id: 'r-5',
    code: 'NORM-BIT-003',
    name: '钻头与下井工具代码术语规范',
    category: '规范性',
    status: 'failed',
    duration: '0.6s',
    targetChapter: '5.1 钻头及钻具组合',
    issuesCount: 1,
    description: '校验钻头分类代码是否使用 SY/T 5358 标准术语。',
    inputs: ['报告第32页 5.1节', 'SY/T 5358标准'],
    steps: [
      { text: '分词扫描钻头名称: PDC-X', done: true },
      { text: '查询标准代码库: 未匹配', done: true }
    ],
    dataSource: 'SY/T 5358 钻头代码标准'
  },
  {
    id: 'r-6',
    code: 'PRESS-PRED-001',
    name: '地层孔隙压力预测准确性比对',
    category: '准确性',
    status: 'unexecuted',
    duration: '0.1s',
    targetChapter: '4.1 地层压力预测',
    issuesCount: 1,
    description: '因缺少依赖数据源“RC1井测井地层压力数据”，未能执行。',
    inputs: ['报告第26页', '缺少 RC1井地层压力数据库'],
    steps: [
      { text: '检查依赖数据资源', done: true },
      { text: '数据资源缺失，判定未执行', done: false }
    ],
    dataSource: '未就绪数据源'
  }
];

export const ReportCheckAgent: React.FC<ReportCheckAgentProps> = ({
  lang,
  config,
  onCloseAgent,
  onComplete,
  onSaveOutcome,
  onAssistantLog
}) => {

  // Multi-Task Management - Start with EMPTY tasks initially
  const [tasks, setTasks] = useState<AuditTask[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string>('');

  // Fallback for empty state
  const emptyTaskFallback: AuditTask = useMemo(() => ({
    id: 'empty-initial',
    reportName: '',
    reportVersion: 'V1',
    mainObject: 'RC1井',
    auditStandard: '钻完井设计报告校核标准 V2.1',
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
        `🤖 **钻完井报告校核已就绪**\n` +
        `请在中间页面上传待校核的钻完井设计报告（如《钻完井基本设计报告 V3.docx》）。\n` +
        `我将协助您建立校核依据，并在右侧实时展示每一步的识别、拆解与规则比对日志。`
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
  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<string>>(new Set());

  // Review Mode Sub-tabs
  const [reviewMode, setReviewMode] = useState<'issues' | 'doc' | 'rules'>('issues');

  // Upload state mock for State 1
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'failed' | 'success'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Task configuration form for State 2
  const [selectedFileName, setSelectedFileName] = useState<string>('钻完井基本设计报告 V3.docx');
  const [configTaskName, setConfigTaskName] = useState('钻完井基本设计报告 V3 校核');
  const [configObject, setConfigObject] = useState('RC1井');
  const [configStandard, setConfigStandard] = useState('钻完井设计报告校核标准 V2.1');

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
          const cleanName = fileName || '钻完井基本设计报告 V3.docx';
          const newTask: AuditTask = {
            id: newId,
            reportName: cleanName,
            reportVersion: 'V1',
            mainObject: 'RC1井',
            auditStandard: '钻完井设计报告校核标准 V2.1',
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
              `📄 **报告上传成功：《${cleanName}》** (8.6MB)\n` +
              `• 解析状态：文档格式与编码校验通过，全书共 86 页\n` +
              `• 识别资产：包含 28 张工程表格与 167 个判定参数\n` +
              `请在中间界面确认【校核对象】与引用的【校核标准】后开启任务。`
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
    const fileToUse = selectedFileName || '钻完井基本设计报告 V3.docx';
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
      createdAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    setTasks(prev => [newTask, ...prev.filter(t => t.id !== 'empty-initial')]);
    setActiveTaskId(newId);
    setUploadState('idle');

    if (onAssistantLog) {
      onAssistantLog(
        `🚀 **钻完井报告智能校核任务已启动！**\n` +
        `• 报告文档：《${fileToUse}》\n` +
        `• 校核对象：${configObject}\n` +
        `• 引用标准：${configStandard}\n` +
        `正在依次发起：【报告解析】→【校核规划】→【计划执行】→【结果汇总】...`
      );

      setTimeout(() => {
        onAssistantLog(
          `📄 **【阶段一：报告解析完成】**\n` +
          `• 结构识别：7 个大纲章节，36 个二级小节\n` +
          `• 特征提取：28 张工程技术表格，167 项关键判定参数，全文锚点定位率 100%`
        );
      }, 1000);

      setTimeout(() => {
        onAssistantLog(
          `📋 **【阶段二：校核规划完成】**\n` +
          `• 关联规程：《${configStandard}》\n` +
          `• 规则编排：已生成 5 项子任务，匹配 128 条审查规则（完整性 32 条、准确性 48 条、一致性 36 条、规范性 12 条）`
        );
      }, 2200);

      setTimeout(() => {
        onAssistantLog(
          `⚙️ **【阶段三：计划执行完成】**\n` +
          `• 规则比对：128 条规则全量执行完毕\n` +
          `• 执行结论：122 条校验通过，6 条存在工程数值与规程不一致或缺少数据`
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
        `⚡ **第三步：规则比对引擎已启动**\n` +
        `正在并行分发 128 条规则...\n` +
        `• [DRILL-032] 提取第36页套管下深 (3200m) 与 RC1井设计V4 (3250m) 交叉比对...\n` +
        `• [WELL-CTRL-005] 正在审查防喷器额定工作压力 (35MPa) 与预测地层压力包络线...`
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
            `🎉 **第四步：报告校核全部完成！**\n` +
            `• 规则比对：128 条规则 100% 校验完成\n` +
            `• 识别问题：共发现 8 项候选问题（严重问题 2 项，一般问题 4 项，提示 2 项）\n` +
            `请在中间界面逐项审阅判定问题，或将校核成果归档至空间资源。`
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
      return true;
    });
  }, [issues, searchQuery, severityFilter, statusFilter, categoryFilter]);

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
                  activeTask.status === 'waiting_user' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                  activeTask.status === 'parsing' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                  activeTask.status === 'running' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                  'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {activeTask.status === 'completed' ? '✓ 校核完成' :
                   activeTask.status === 'waiting_user' ? '⚠ 待确认' :
                   activeTask.status === 'parsing' ? '解析中 32%' :
                   activeTask.status === 'plan' ? '规划中' :
                   activeTask.status === 'running' ? `● 校核中 ${activeTask.progress}%` :
                   '未开始'}
                </span>
                <i className="fas fa-chevron-down text-slate-400 text-xs group-hover:text-slate-600 transition-all"></i>
              </button>

              {/* TASK SWITCHER DROPDOWN */}
              {showTaskDropdown && (
                <div className="absolute left-0 top-10 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-700">当前空间的校核任务</span>
                    <span className="text-[10px] text-slate-400">共 {tasks.length} 项</span>
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
                        <span className="text-[10px] font-bold text-slate-500">{t.mainObject}</span>
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
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <i className="fas fa-plus text-[11px]"></i>
            新建校核任务
          </button>

          <button
            onClick={() => setCurrentView('config')}
            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1"
          >
            <i className="fas fa-sliders text-[11px] text-slate-500"></i>
            配置
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
          LAYER 2: AGENT STATUS BANNER (根据任务状态动态展示)
         ────────────────────────────────────────────────────────────── */}
      {activeTask.currentView !== 'empty' && activeTask.currentView !== 'config' && (
        <div className="w-full border-b border-slate-200/80 px-5 py-3 flex-shrink-0 transition-all bg-white">
          {activeTask.status === 'running' && (
            <div className="p-3.5 bg-gradient-to-r from-teal-50/90 via-emerald-50/50 to-white border border-teal-100 rounded-2xl flex items-center justify-between shadow-2xs">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse shadow-sm">
                  <i className="fas fa-cog fa-spin text-sm"></i>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
                      报告校核正在工作
                    </span>
                    <span className="text-[11px] font-bold text-slate-600">
                      正在执行校核流程...
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 truncate">
                    已提取技术套管下深，正在与 <strong className="text-slate-800">{activeTask.mainObject} 正式设计数据</strong> 进行版本交叉验证。
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button
                  onClick={() => setRunStatus('waiting_user')}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all"
                >
                  模拟触发决策点
                </button>
                <button
                  onClick={() => setCurrentView('live')}
                  className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <i className="fas fa-eye text-[11px]"></i>
                  查看当前现场
                </button>
              </div>
            </div>
          )}

          {activeTask.status === 'parsing' && (
            <div className="p-3.5 bg-indigo-50/90 border border-indigo-200/80 rounded-2xl flex items-center justify-between shadow-2xs">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <i className="fas fa-file-waveform fa-spin text-sm"></i>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    智能体正在解析报告文本与结构...
                  </span>
                  <p className="text-xs text-indigo-800 mt-0.5">
                    正在识别46个大纲章节、参数表格和关键强条规则，并自动推荐参考标准。
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setRunStatus('running');
                  setCurrentView('live');
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs"
              >
                跳过解析并开始校核
              </button>
            </div>
          )}

          {activeTask.status === 'waiting_user' && (
            <div className="p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex items-center justify-between shadow-2xs">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <i className="fas fa-triangle-exclamation text-sm"></i>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    需要确认校核依据（人机决策节点）
                  </span>
                  <p className="text-xs text-amber-800 mt-0.5">
                    报告中的套管下深为 3200m，空间中存在两条可用业务数据，影响 6 条规则判定。
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setRunStatus('running');
                    setCurrentView('live');
                    showToast('已确认选用设计数据 (3250m) 继续校核');
                  }}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-2xs"
                >
                  确认依据并继续
                </button>
              </div>
            </div>
          )}

          {activeTask.status === 'completed' && (
            <div className="p-3.5 bg-emerald-50/90 border border-emerald-200/80 rounded-2xl flex items-center justify-between shadow-2xs">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <i className="fas fa-check text-sm"></i>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      ✓ 报告校核已完成
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                      阶段四：结果汇总完毕
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-1 truncate">
                    128 条规则 100% 校验完成，识别出 {activeTask.issues.length} 项候选问题。请在「结果审阅」中查阅问题清单与原文批注。
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button
                  onClick={() => setCurrentView('issues')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fas fa-list-check text-[11px]"></i>
                  查看结果审阅
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
                  <p className="text-xs text-slate-500 mt-0.5">上传待校核的工程报告，并配置对应的校核对象与标准依据</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200/60 rounded-xl text-xs font-bold">
                智能人机协同模式
              </span>
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
                        <h4 className="text-xs font-bold text-slate-800 truncate">{selectedFileName || '钻完井基本设计报告 V3.docx'}</h4>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold flex-shrink-0">已就绪</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">8.6 MB · 86 页 · 识别 28 张工程数据表与 167 项关键参数</p>
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
                    setSelectedFileName('钻完井基本设计报告 V3.docx');
                    setUploadState('success');
                    setConfigTaskName('钻完井基本设计报告 V3 校核');
                  }}
                  className="border-2 border-dashed border-slate-200 hover:border-teal-400 bg-slate-50/70 hover:bg-teal-50/20 rounded-2xl p-6 text-center transition-all cursor-pointer group space-y-2"
                >
                  <i className="fas fa-cloud-arrow-up text-2xl text-slate-400 group-hover:text-teal-600 transition-all"></i>
                  <p className="text-xs font-bold text-slate-700 group-hover:text-teal-800">点击或拖拽上传报告文件</p>
                  <p className="text-[11px] text-slate-400">也可直接选择系统预置文档：</p>
                  <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFileName('钻完井基本设计报告 V3.docx');
                        setUploadState('success');
                        setConfigTaskName('钻完井基本设计报告 V3 校核');
                      }}
                      className="px-3 py-1 bg-white border border-slate-200 hover:bg-teal-50 hover:border-teal-300 text-slate-700 text-[11px] font-bold rounded-lg transition-all"
                    >
                      📄 钻完井基本设计报告 V3.docx
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFileName('井控专项设计报告 V1.docx');
                        setUploadState('success');
                        setConfigTaskName('井控专项设计报告 V1 校核');
                      }}
                      className="px-3 py-1 bg-white border border-slate-200 hover:bg-teal-50 hover:border-teal-300 text-slate-700 text-[11px] font-bold rounded-lg transition-all"
                    >
                      📄 井控专项设计报告 V1.docx
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
                    placeholder="例如：钻完井基本设计报告 V3 校核"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/30 text-slate-800 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">校核对象 <span className="text-rose-500">*</span></label>
                    <select
                      value={configObject}
                      onChange={e => setConfigObject(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium"
                    >
                      <option value="RC1井">RC1井 (区块核心开发井)</option>
                      <option value="RC2井">RC2井 (评估井)</option>
                      <option value="RC3井">RC3井 (探井)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">引用校核标准 <span className="text-rose-500">*</span></label>
                    <select
                      value={configStandard}
                      onChange={e => setConfigStandard(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium"
                    >
                      <option value="钻完井设计报告校核标准 V2.1">钻完井设计报告校核标准 V2.1 (128条规则)</option>
                      <option value="企业报告通用规范 V1.4">企业报告通用规范 V1.4 (32条规则)</option>
                      <option value="井控工程设计强条审查规范">井控工程设计强条审查规范 (24条强条)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">规则映射快照</label>
                  <div className="p-3 bg-teal-50/50 border border-teal-200/60 rounded-2xl space-y-1.5 text-teal-900">
                    <div className="flex items-center justify-between font-bold">
                      <span>预匹配规则总计：128 条强条与审查项</span>
                      <span className="text-[10px] text-teal-700 font-mono">规则库 Snapshot 就绪</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-medium text-teal-800">
                      <span>完整性 32条</span>
                      <span>·</span>
                      <span>准确性 48条</span>
                      <span>·</span>
                      <span>一致性 36条</span>
                      <span>·</span>
                      <span>规范性 12条</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">点击开启后，将直达「校核现场」实时观看智能体比对过程</span>
              <button
                onClick={() => {
                  if (!selectedFileName) {
                    setSelectedFileName('钻完井基本设计报告 V3.docx');
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
            INTEGRATED EXECUTION VIEW: 校核现场 (INCORPORATES PARSING, PLAN & LIVE)
           ------------------------------------------------------------ */}
        {(activeTask.currentView === 'live' || activeTask.currentView === 'parsing' || activeTask.currentView === 'plan') && (
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Top Field Header */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  <i className="fas fa-microchip animate-pulse"></i>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">智能体校核工作现场</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    正在校核《{activeTask.reportName}》 · 对接对象 [{activeTask.mainObject}] · 标准 [{activeTask.auditStandard}]
                  </p>
                </div>
              </div>
            </div>

            {/* Stage 1: 报告解析 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <i className="fas fa-file-waveform text-indigo-500"></i>
                    阶段一：报告解析
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ✓ 解析完成
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 text-[10px] block">大纲章节</span>
                  <span className="font-bold text-slate-800 text-sm">7章 36节</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 text-[10px] block">工程技术表</span>
                  <span className="font-bold text-slate-800 text-sm">28 张</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 text-[10px] block">关键判定参数</span>
                  <span className="font-bold text-slate-800 text-sm">167 项</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 text-[10px] block">全文锚点覆盖</span>
                  <span className="font-bold text-emerald-600 text-sm">100%</span>
                </div>
              </div>
            </div>

            {/* Stage 2: 校核规划 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <i className="fas fa-route text-teal-600"></i>
                    阶段二：校核规划
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  ✓ 规划完成 (128条标准规则)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-medium text-slate-700 truncate">1. 报告结构与完整性</span>
                  <span className="font-bold text-teal-700 font-mono text-[11px]">12条</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-medium text-slate-700 truncate">2. 井身结构参数比对</span>
                  <span className="font-bold text-teal-700 font-mono text-[11px]">32条</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-medium text-slate-700 truncate">3. 井控与压力强条审查</span>
                  <span className="font-bold text-teal-700 font-mono text-[11px]">29条</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-medium text-slate-700 truncate">4. 钻井液安全密度包络</span>
                  <span className="font-bold text-teal-700 font-mono text-[11px]">36条</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-medium text-slate-700 truncate">5. 术语与排版格式规范</span>
                  <span className="font-bold text-teal-700 font-mono text-[11px]">19条</span>
                </div>
              </div>
            </div>

            {/* Stage 3: 计划执行 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <i className="fas fa-satellite-dish text-amber-500"></i>
                    阶段三：计划执行
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ✓ 规则引擎全量比对完成
                </span>
              </div>

              <div className="space-y-2.5">
                {mockRulesList.map(rule => (
                  <div
                    key={rule.id}
                    onClick={() => setSelectedRule(rule)}
                    className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer hover:shadow-md flex items-center justify-between gap-4 ${
                      rule.status === 'failed' ? 'border-rose-200 bg-rose-50/10' :
                      rule.status === 'running' ? 'border-teal-300 bg-teal-50/20' :
                      'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        rule.status === 'failed' ? 'bg-rose-100 text-rose-700' :
                        rule.status === 'passed' ? 'bg-emerald-100 text-emerald-700' :
                        rule.status === 'unexecuted' ? 'bg-slate-100 text-slate-500' :
                        'bg-teal-100 text-teal-700 animate-pulse'
                      }`}>
                        {rule.status === 'failed' ? <i className="fas fa-xmark"></i> :
                         rule.status === 'passed' ? <i className="fas fa-check"></i> :
                         rule.status === 'unexecuted' ? <i className="fas fa-ban"></i> :
                         <i className="fas fa-spinner fa-spin"></i>}
                      </span>

                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-500 text-[11px]">{rule.code}</span>
                          <h4 className="text-xs font-bold text-slate-800 truncate">{rule.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {rule.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{rule.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {rule.issuesCount > 0 && (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                          {rule.issuesCount} 项问题
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">{rule.duration}</span>
                      <i className="fas fa-chevron-right text-slate-300 text-xs"></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage 4: 结果汇总 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <i className="fas fa-clipboard-check text-emerald-600"></i>
                    阶段四：结果汇总
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  ✓ 结果汇总完成
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between flex-wrap gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-bold text-xs rounded-md">
                      严重问题 2 项
                    </span>
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-bold text-xs rounded-md">
                      一般问题 3 项
                    </span>
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-bold text-xs rounded-md">
                      提示项 1 项
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    校核规则已 100% 校验完毕，发现 6 项候选问题并生成针对性修订建议与原文标注。
                  </p>
                </div>

                <button
                  onClick={() => setCurrentView('issues')}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <i className="fas fa-arrow-right"></i>
                  切换至「结果审阅」
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            STATE 7: 校核结果审阅 (REVIEW STATE - 3 SUB MODES)
           ------------------------------------------------------------ */}
        {(activeTask.currentView === 'issues' || activeTask.currentView === 'doc' || activeTask.currentView === 'report' || activeTask.currentView === 'rules') && (
          <div className="space-y-4">
            
            {/* Review Mode Switcher Bar */}
            <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setReviewMode('issues'); setCurrentView('issues'); }}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${reviewMode === 'issues' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <i className="fas fa-list-check mr-1.5"></i> 问题清单 ({stats.totalCount})
                </button>
                <button
                  onClick={() => { setReviewMode('doc'); setCurrentView('doc'); }}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${reviewMode === 'doc' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <i className="fas fa-file-invoice mr-1.5"></i> 文档定位审阅
                </button>
                <button
                  onClick={() => { setReviewMode('rules'); setCurrentView('rules'); }}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${reviewMode === 'rules' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <i className="fas fa-list-ol mr-1.5"></i> 规则执行结果
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 pr-2">
                <span>审阅进度：<strong className="text-teal-700">{stats.confirmedCount} / {stats.totalCount}</strong> 已处理</span>
              </div>
            </div>

            {/* MODE 1: 问题清单 (ISSUES LIST) */}
            {reviewMode === 'issues' && (
              <div className="space-y-4">
                {/* Conclusion Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white p-5 rounded-3xl shadow-md space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-md text-xs font-bold">
                          校核结论：建议修改后重新提交
                        </span>
                        <span className="text-xs text-slate-300">规则完成率 97.5%</span>
                      </div>
                      <h3 className="text-base font-bold text-white">{activeTask.reportName}</h3>
                      <p className="text-xs text-slate-200">
                        执行 154/158 条规则，发现 <strong className="text-amber-400 font-bold text-sm">{stats.totalCount} 项问题</strong>。其中 {stats.severeCount} 项严重问题影响报告正式提交。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filters & Search */}
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="relative">
                      <i className="fas fa-search absolute left-2.5 top-2.5 text-slate-400 text-[11px]"></i>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="搜索问题、章节或规则..."
                        className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs w-48 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      />
                    </div>

                    <select
                      value={severityFilter}
                      onChange={e => setSeverityFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="all">所有严重程度</option>
                      <option value="severe">严重 ({stats.severeCount})</option>
                      <option value="general">一般 ({stats.generalCount})</option>
                      <option value="hint">提示 ({stats.hintCount})</option>
                      <option value="unexecuted">未执行 ({stats.unexecutedCount})</option>
                    </select>
                  </div>

                  {selectedBatchIds.size > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-teal-800 font-bold">已选 {selectedBatchIds.size} 项</span>
                      <button onClick={() => applyBatchAction('confirmed')} className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg">批量确认</button>
                      <button onClick={() => applyBatchAction('ignored')} className="px-2.5 py-1 bg-slate-200 text-slate-700 font-bold rounded-lg">批量忽略</button>
                    </div>
                  )}
                </div>

                {/* Issue Item Cards */}
                <div className="space-y-2.5">
                  {filteredIssues.map(issue => (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssue(issue)}
                      className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer hover:shadow-md flex items-center justify-between gap-4 ${
                        issue.severity === 'severe' ? 'border-rose-200/90' : 'border-slate-200/90'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedBatchIds.has(issue.id)}
                          onChange={e => { e.stopPropagation(); toggleSelectBatch(issue.id); }}
                          className="mt-1 rounded text-teal-600"
                        />

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              issue.severity === 'severe' ? 'bg-rose-100 text-rose-700' :
                              issue.severity === 'general' ? 'bg-amber-100 text-amber-800' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {issue.severity === 'severe' ? '严重' : issue.severity === 'general' ? '一般' : '提示'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {issue.category}
                            </span>
                            <h4 className="text-xs font-bold text-slate-800 truncate">{issue.title}</h4>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1">{issue.description}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <span>章节: {issue.chapter}</span>
                            <span>P.{issue.pageNum}</span>
                            <span className="font-mono">规则: {issue.ruleCode}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          issue.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {issue.status === 'confirmed' ? '已确认' : '待处理'}
                        </span>
                        <i className="fas fa-chevron-right text-slate-300 text-xs"></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODE 2: 文档定位审阅 (DOCUMENT PREVIEW) */}
            {reviewMode === 'doc' && (
              <div className="h-[520px] grid grid-cols-12 gap-4">
                <div className="col-span-3 bg-white rounded-2xl border border-slate-200 p-4 flex flex-col space-y-3">
                  <h3 className="font-bold text-xs text-slate-800">章节目录</h3>
                  <div className="flex-1 overflow-y-auto text-xs space-y-1.5 text-slate-600 custom-scrollbar">
                    <div className="p-2 rounded bg-slate-50 font-bold text-slate-800">5. 钻井工程设计</div>
                    <div className="pl-4 p-1.5 rounded hover:bg-slate-50 cursor-pointer">5.1 钻头及钻具组合</div>
                    <div className="pl-4 p-1.5 rounded bg-teal-50 text-teal-800 font-bold">5.2 井身结构设计 (1问题)</div>
                    <div className="pl-4 p-1.5 rounded hover:bg-slate-50 cursor-pointer">5.3 钻井水力学计算</div>
                  </div>
                </div>

                <div className="col-span-6 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-xs font-bold text-slate-600">
                    <span>第 36 / 86 页</span>
                    <div className="flex items-center gap-2 text-teal-700">
                      <button className="hover:underline">上一问题</button>
                      <span>|</span>
                      <button className="hover:underline">下一问题</button>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs leading-relaxed text-slate-800">
                    <h2 className="text-sm font-bold text-slate-900 border-b pb-1">5.2 井身结构设计</h2>
                    <p>
                      根据RC1井邻井地层开采特点，井身结构采用三开方案。一开导管下深100m，二开技术套管下至下干沟组顶界。
                    </p>
                    <div className="p-3 bg-rose-50 border-l-4 border-rose-500 rounded-r-xl text-rose-900 space-y-1">
                      <span className="font-bold block">【问题高亮定位】</span>
                      <p>
                        “……技术套管设计下深为 <mark className="bg-rose-200 text-rose-900 font-bold px-1 rounded">3200m</mark>，套管外径244.5mm，采用P110钢级全长固井。”
                      </p>
                    </div>
                    <p>
                      三开生产套管预计钻至3850m完钻。固井水泥浆体系采用抗高温体系，确保气层封隔质量。
                    </p>
                  </div>
                </div>

                <div className="col-span-3 bg-slate-900 text-white rounded-2xl p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-bold">
                      严重 · 准确性
                    </span>
                    <h4 className="text-xs font-bold text-amber-300">井身结构关键参数与正式设计数据不一致</h4>
                    <div className="space-y-1.5 text-xs text-slate-300 bg-slate-800 p-3 rounded-xl font-mono">
                      <div>报告值：<span className="font-bold text-rose-400">3200m</span></div>
                      <div>正式设计值：<span className="font-bold text-emerald-400">3250m</span></div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedIssue(issues[0])}
                    className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs"
                  >
                    查看推演与建议
                  </button>
                </div>
              </div>
            )}

            {/* MODE 3: 规则执行结果 (RULES MATRIX) */}
            {reviewMode === 'rules' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b pb-3">
                  <span>全量规则执行结果 (128 条规则)</span>
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="text-emerald-600">通过 118</span>
                    <span className="text-rose-600">问题 6</span>
                    <span className="text-slate-400">未执行 4</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {mockRulesList.map(rule => (
                    <div key={rule.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-500">{rule.code}</span>
                        <span className="font-bold text-slate-800">{rule.name}</span>
                        <span className="text-[10px] text-slate-400">{rule.targetChapter}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        rule.status === 'passed' ? 'bg-emerald-100 text-emerald-800' :
                        rule.status === 'failed' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {rule.status === 'passed' ? '✓ 通过' : rule.status === 'failed' ? '发现问题' : '未执行'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                    placeholder="钻完井基本设计报告校核报告"
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
          DRAWER 1: ISSUE DETAIL DRAWER (问题推演与审阅抽屉)
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
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedIssue.severity === 'severe' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}`}>
                {selectedIssue.severity === 'severe' ? '严重问题' : '一般问题'}
              </span>
              <button onClick={() => setSelectedIssue(null)} className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-500">
                <i className="fas fa-xmark text-sm"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs custom-scrollbar">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{selectedIssue.title}</h3>
                <p className="text-slate-500 mt-1">章节：{selectedIssue.chapter} (第 {selectedIssue.pageNum} 页)</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">报告原文：</span>
                <p className="text-slate-800 italic">{selectedIssue.originalText}</p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1 font-mono">
                <span className="font-bold text-amber-900 block">比对依据 / 官方设计数据：</span>
                <p className="text-amber-900">{selectedIssue.actualDataText}</p>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 space-y-1">
                <span className="font-bold text-teal-900 block">智能修改建议：</span>
                <p className="text-teal-900">{selectedIssue.recommendation}</p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 block">问题形成推演逻辑：</span>
                <div className="space-y-1.5 font-mono text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedIssue.timeline.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-slate-400">{t.time}</span>
                      <span>{t.text}</span>
                    </div>
                  ))}
                </div>
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

    </div>
  );
};
