
import React, { useState, useEffect, useMemo } from 'react';
import { WorkspaceList } from './components/WorkspaceList';
import { FactsPanel } from './components/FactsPanel';
import { DirectoryTree } from './components/DirectoryTree';
import { ResourceTree } from './components/ResourceTree';
import { ChatPanel } from './components/ChatPanel';
import { TracePanel } from './components/TracePanel';
import { AddResourcePage } from './components/AddResourcePage';
import { ExecutionHistoryPage } from './components/enterprise/ExecutionHistoryPage';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { IntelligencePlatform } from './components/IntelligencePlatform';
import { PersonalCenter } from './components/PersonalCenter';
import { AssistantSidebar } from './components/AssistantSidebar';
import { KnowledgeBase } from './components/KnowledgeBase';
import { DocumentEditor } from './components/DocumentEditor';
import { WorkspaceTemplates } from './components/WorkspaceTemplates';
import { MultiAgentChatPanel } from './components/MultiAgentChatPanel';
import { AgentsPanel } from './components/AgentsPanel';
import { IntelligentConstruction } from './components/IntelligentConstruction';
import { IntelligentConstructionV2 } from './components/IntelligentConstructionV2';
import { IntelligentObjectDiscovery } from './components/IntelligentObjectDiscovery';
import WorkspaceStrategyConfig from './components/WorkspaceStrategyConfig';
import { MbuExplorer } from './components/MbuExplorer';
import { VersionComparisonModal } from './components/VersionComparisonModal';
import { ReportTemplateModal } from './components/ReportTemplateModal';
import { SaveOutcomeModal } from './components/SaveOutcomeModal';
import { EvidenceChainPanel } from './components/EvidenceChainPanel';
import { AgentConfigWizard } from './components/enterprise/AgentConfigWizard';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import { WorkspaceDetailTopBar } from './components/WorkspaceDetailTopBar';
import { IntelligentQueryWorkspaceDetail } from './components/IntelligentQueryWorkspaceDetail';
import { IntelligentChartWorkspaceDetail } from './components/IntelligentChartWorkspaceDetail';
import { IntelligentReportWorkspaceDetail } from './components/IntelligentReportWorkspaceDetail';
import { IntelligentDeclineWorkspaceDetail } from './components/IntelligentDeclineWorkspaceDetail';
import { HarnessFileExplorer } from './components/HarnessFileExplorer';
import { WellDeclineDiagnosis } from './components/WellDeclineDiagnosis';
import { ReportGenerationAgent } from './components/ReportGenerationAgent';
import { ProChartRequirementTree } from './components/ProChartRequirementTree';
import { WellDeclineRequirementTree } from './components/WellDeclineRequirementTree';
import { ProChartGenerationAgent } from './components/ProChartGenerationAgent';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { MOCK_RESOURCE_TREE, MOCK_WORKSPACES, EMPTY_RESOURCE_TREE, DRILLING_RESOURCE_TREE, MOCK_TEMPLATES } from './constants';
import { Message, ResourceNode, Language, Workspace, KnowledgeItem, WorkspaceStatus, WorkspaceTemplate, Agent } from './types';
import { translations } from './i18n';

type MainTab = 'dashboard' | 'workspaces' | 'admin' | 'intelligence' | 'knowledge' | 'templates' | 'construction' | 'construction-v2' | 'construction-completion' | 'profile';

const CURRENT_USER = '李明';

const getChapterFiles = (chapterId: string, title: string, lang: 'zh' | 'en'): ResourceNode[] => {
  const normalizedTitle = title.toLowerCase();
  
  if (normalizedTitle.includes('前言') || normalizedTitle.includes('preface') || chapterId === '1') {
    return [
      { id: 'curr-1', name: lang === 'zh' ? 'XX-1井钻井设计方案说明书.docx' : 'Well XX-1 Drilling Design Spec.docx', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } },
      { id: 'curr-2', name: lang === 'zh' ? '陆相碎屑岩地层划分国家标准.pdf' : 'Continental Siliciclastic Stratigraphy Standard.pdf', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
    ];
  }
  
  if (normalizedTitle.includes('区域地质') || normalizedTitle.includes('区域地层') || normalizedTitle.includes('geology') || chapterId === '2' || chapterId === '2.1') {
    return [
      { id: 'curr-3', name: lang === 'zh' ? '陆相碎屑岩地层划分国家标准.pdf' : 'Continental Siliciclastic Stratigraphy Standard.pdf', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } },
      { id: 'curr-4', name: lang === 'zh' ? '地层分层精细结果表.xlsx' : 'Fine Stratigraphy Result Table.xlsx', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
    ];
  }
  
  if (normalizedTitle.includes('构造特征') || normalizedTitle.includes('structural') || chapterId === '2.2') {
    return [
      { id: 'curr-5', name: lang === 'zh' ? 'XX区块三维地震解释成果.segy' : 'XX Block 3D Seismic Interpretation.segy', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } },
      { id: 'curr-6', name: lang === 'zh' ? '三维地震层位解释成果数据.csv' : '3D Seismic Horizon Interpretation Data.csv', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
    ];
  }
  
  if (normalizedTitle.includes('邻井') || normalizedTitle.includes('offset') || chapterId === '3') {
    return [
      { id: 'curr-7', name: lang === 'zh' ? '长庆XX-2井测井原始曲线.las' : 'Changqing XX-2 Original Logs.las', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } },
      { id: 'curr-8', name: lang === 'zh' ? '邻井测井综合解释图.pdf' : 'Offset Well Log Interpretation Chart.pdf', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
    ];
  }
  
  if (normalizedTitle.includes('地层预测') || normalizedTitle.includes('prediction') || chapterId === '4') {
    return [
      { id: 'curr-9', name: lang === 'zh' ? '一键分层成果专家会签.docx' : 'Expert Co-signature Report.docx', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } },
      { id: 'curr-10', name: lang === 'zh' ? '自动分层比对算法流.py' : 'Automated Layering Workflow.py', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } },
      { id: 'curr-11', name: lang === 'zh' ? '地层分层精细结果表.xlsx' : 'Fine Stratigraphy Result Table.xlsx', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
    ];
  }
  
  if (normalizedTitle.includes('完井') || normalizedTitle.includes('completion') || chapterId === '5') {
    return [
      { id: 'curr-12', name: lang === 'zh' ? 'XX-1井钻井设计方案说明书.docx' : 'Well XX-1 Drilling Design Spec.docx', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } },
      { id: 'curr-13', name: lang === 'zh' ? '地层流体物性实验分析报告.pdf' : 'Formation Fluid Physical Property Analysis.pdf', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
    ];
  }
  
  return [
    { id: 'curr-14', name: lang === 'zh' ? '陆相碎屑岩地层划分国家标准.pdf' : 'Continental Siliciclastic Stratigraphy Standard.pdf', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } },
    { id: 'curr-15', name: lang === 'zh' ? '地层分层精细结果表.xlsx' : 'Fine Stratigraphy Result Table.xlsx', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
  ];
};

const App: React.FC = () => {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<MainTab>('dashboard');
  
  // Workspace Detail State (if ID exists, we are in detail view)
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [expandedObjectCategories, setExpandedObjectCategories] = useState<Set<string>>(new Set());
  
  const [lang, setLang] = useState<Language>('zh');
  
  // Shared Workspace State
  const [workspaces, setWorkspaces] = useState<Workspace[]>(MOCK_WORKSPACES);
  const [templates, setTemplates] = useState<WorkspaceTemplate[]>(MOCK_TEMPLATES);
  
  // Detail View Specific State
  const [resourceTree, setResourceTree] = useState<ResourceNode[]>(DRILLING_RESOURCE_TREE);
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Message[]>([]);
  const [multiAgentMessages, setMultiAgentMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isAddResourcePageOpen, setIsAddResourcePageOpen] = useState(false);
  const [isExecutionHistoryPageOpen, setIsExecutionHistoryPageOpen] = useState(false);
  const [isTracePanelOpen, setIsTracePanelOpen] = useState(true);
  const [isResourcePanelOpen, setIsResourcePanelOpen] = useState(true);
  const [isHarnessExplorerOpen, setIsHarnessExplorerOpen] = useState(false);
  const [isProChartGenerating, setIsProChartGenerating] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isStrategyConfirmationOpen, setIsStrategyConfirmationOpen] = useState(false);
  const [configAgentId, setConfigAgentId] = useState<string | null>(null);

  // User Profile States
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Edit Workspace State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // MBU Explorer State (for construction completion)
  const [constructionTreeNode, setConstructionTreeNode] = useState<ResourceNode | null>(null);
  const [constructionMbuIds, setConstructionMbuIds] = useState<Set<string>>(new Set());
  const [constructionWorkspaceName, setConstructionWorkspaceName] = useState<string>('');
  const [isObjectScopeExpanded, setIsObjectScopeExpanded] = useState(false);
  const [constructionObjectScope, setConstructionObjectScope] = useState([
    { id: 'filled', label: lang === 'zh' ? '填写的对象' : 'Filled Objects', items: ['A1井', 'B2井'], color: 'blue', deletable: false },
    { id: 'neighbors', label: lang === 'zh' ? '推荐邻近对象' : 'Recommended Neighbors', items: ['A2', 'A3', 'B1'], color: 'emerald', deletable: true },
    { id: 'similar', label: lang === 'zh' ? '相似对象' : 'Similar Objects', items: ['C1', 'D4'], color: 'purple', deletable: true },
    { id: 'associated', label: lang === 'zh' ? '关联对象' : 'Associated Objects', items: ['区块-X', '断层-F1'], color: 'amber', deletable: true },
  ]);

  // Document Editor State
  const [editingDoc, setEditingDoc] = useState<{ content: string, msgId: string } | null>(null);
  
  const [workspaceVersion, setWorkspaceVersion] = useState<'foundation' | 'professional' | 'enterprise'>('foundation');
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSaveOutcomeModalOpen, setIsSaveOutcomeModalOpen] = useState(false);
  const [outcomeToSave, setOutcomeToSave] = useState<{ name: string } | null>(null);
  const [activeAgentAppId, setActiveAgentAppId] = useState<string | null>(null);
  const [isAssistantExpanded, setIsAssistantExpanded] = useState(true);

  // Pro Report Generation State
  const [isReportModeActive, setIsReportModeActive] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState<any>(null);
  const [originalResourceTree, setOriginalResourceTree] = useState<ResourceNode[]>([]);
  const [originalObjectScope, setOriginalObjectScope] = useState<any[]>([]);
  const [agentRunStatus, setAgentRunStatus] = useState<'running' | 'completed'>('running');
  const [agentRefreshKey, setAgentRefreshKey] = useState(0);

  // Resource Detail Modal State
  const [selectedResourceForDetail, setSelectedResourceForDetail] = useState<ResourceNode | null>(null);
  const [isResourceDetailModalOpen, setIsResourceDetailModalOpen] = useState(false);

  const versions = useMemo(() => [
    { id: 'foundation', name: '基础版', enName: 'Foundation', desc: '通用智能助手', icon: 'fa-bolt', tagClass: 'bg-slate-100 text-slate-700' },
    { id: 'professional', name: '专业版', enName: 'Professional', desc: '场景闭环 Agent', icon: 'fa-cube', tagClass: 'bg-blue-100 text-blue-700' },
    { id: 'enterprise', name: '企业版', enName: 'Enterprise', desc: '岗位数字员工', icon: 'fa-users', tagClass: 'bg-purple-100 text-purple-700' },
  ], []);

  const currentVersionData = versions.find(v => v.id === workspaceVersion) || versions[0];

  const [agents, setAgents] = useState<Agent[]>([
    { id: 'agent-1', name: 'Leader', role: '需求理解与任务调度', avatar: '👑', description: '负责理解用户意图，拆解任务并分发给对应的数字专家，最后汇总答案。', isLeader: true, status: 'Idle' },
    { id: 'agent-2', name: '智能问数', role: '数据查询与统计', avatar: '📊', description: '精通SQL和数据分析，能够快速从海量数据中提取关键指标。' },
    { id: 'agent-3', name: '文档检索专家', role: '知识库问答', avatar: '📚', description: '熟悉各类技术文档和规范，能够准确回答专业问题。' },
    { id: 'agent-4', name: '智能报告', role: '内容总结与排版', avatar: '📝', description: '擅长将零散的信息整理成结构清晰、格式规范的报告。' },
    { id: 'agent-chart', name: '数据成图', role: '可视化成图', avatar: <i className="fas fa-chart-bar"></i>, description: '擅长将数据转化为直观的图表和可视化看板。' },
    
    // Pro specific
    { id: 'agent-pro-1', name: '生产分析岗', role: '场景智能体', avatar: '🏭', description: '专注于生产动态分析、产量波动诊断及稳产方案建议。' },
    { id: 'agent-pro-2', name: '勘探评价岗', role: '场景智能体', avatar: '🔍', description: '负责圈闭评价、资源量估算及勘探风险识别。' },
    { id: 'agent-pro-3', name: '钻井工程岗', role: '场景智能体', avatar: '🏗️', description: '提供钻井设计优化、复杂情况预警及提速提效建议。' },
    { id: 'agent-pro-4', name: '邻井压裂参数优选', role: '场景智能体', avatar: '🧪', description: '针对新井自动筛选最优邻井，继承最佳历史分段压裂参数，输出推荐参数包。' },
    
    // Enterprise specific
    { 
      id: 'agent-ent-1', 
      name: '生产管理专家', 
      role: '岗位数字员工', 
      avatar: '👨‍💼', 
      description: '全面负责生产管理业务，协同多个场景智能体完成复杂任务。', 
      status: 'Running', 
      tags: ['产量分析', '单井产量下降诊断', '报告生成'],
      scenarios: [
        { 
          id: 's1', 
          name: '产量波动归因分析', 
          triggers: ['Data', 'Threshold', 'Schedule'], 
          isEnabled: true, 
          priority: 10,
          description: '当产量数据波动超过±5%时自动触发' 
        },
        { 
          id: 's2', 
          name: '区块状态评估', 
          triggers: ['Schedule'], 
          isEnabled: true, 
          priority: 5,
          description: '每周定期对全区块生产效率进行综合评分' 
        }
      ],
      instructions: {
        systemPrompt: '由大模型驱动的资深生产管理专家，具备深厚的油气田开发背景。你将作为数字化岗位的核心，协调各场景智能体进行数据深度挖掘，并在发现异常时自动展开下钻分析。',
        taskPrompt: '1. 检索昨日全区生产动态；2. 识别日产波动超过10%的单井；3. 协同产量分析Agent进行压力与液量关联分析；4. 输出含有根因定位与措施建议的日报。',
        outputFormat: 'Report',
        constraints: '严禁在未获得实时压力数据的情况下进行产量预测。所有措施建议需备注对应的作业安全规范编号。'
      },
      resultHandling: {
        outputs: ['Report', 'Table'],
        notifications: ['站内通知'],
        approvalMode: 'AnomalyOnly',
        storagePath: '/成果空间/生产分析',
        archiveMode: 'Date'
      }
    },
    { id: 'agent-ent-2', name: '勘探决策专家', role: '岗位数字员工', avatar: '🧠', description: '辅助勘探决策，集成地质、物探、钻井多学科分析能力。', status: 'Idle', tags: ['圈闭评价', '资源估算'] },
    { id: 'agent-ent-3', name: '钻井指挥专家', role: '岗位数字员工', avatar: '📡', description: '实时指挥钻井作业，确保安全高效，实现岗位级业务闭环。', status: 'Stopped', tags: ['安全预警', '参数优化'] },
  ]);

  const displayAgents = useMemo(() => {
    if (workspaceVersion === 'foundation') {
      return agents.filter(a => ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-chart'].includes(a.id));
    }
    if (workspaceVersion === 'professional') {
      return agents.filter(a => ['agent-1', 'agent-pro-1', 'agent-pro-2', 'agent-pro-3', 'agent-pro-4'].includes(a.id));
    }
    if (workspaceVersion === 'enterprise') {
      return agents.filter(a => ['agent-1', 'agent-ent-1', 'agent-ent-2', 'agent-ent-3'].includes(a.id));
    }
    return agents;
  }, [workspaceVersion, agents]);

  const t = translations[lang];

  // Listen for bulk select events
  useEffect(() => {
    const handleBulkSelect = (e: any) => {
      const ids: string[] = e.detail;
      setSelectedResources(prev => {
        const next = new Set(prev);
        const allAreSelected = ids.every(id => next.has(id));
        if (allAreSelected) {
          ids.forEach(id => next.delete(id));
        } else {
          ids.forEach(id => next.add(id));
        }
        return next;
      });
    };
    window.addEventListener('bulk-select', handleBulkSelect);
    return () => window.removeEventListener('bulk-select', handleBulkSelect);
  }, []);

  // Listen for global preview-report events
  useEffect(() => {
    const handlePreviewReportGlobal = (e: any) => {
      const reportData = e.detail;
      if (reportData?.title?.includes('本周生产运行简报') || reportData?.id === 'report-weekly-001') {
        setIsReportModeActive(true);
        setAgentRunStatus('completed');
        setReportConfig({
          isSmartReport: true,
          isWeeklyBrief: true,
          projectName: lang === 'zh' ? '本周生产运行简报' : 'Weekly Production Operation Brief',
          outline: []
        });
        setIsTracePanelOpen(false);
        setIsResourcePanelOpen(false);
      }
    };
    window.addEventListener('preview-report', handlePreviewReportGlobal);
    return () => window.removeEventListener('preview-report', handlePreviewReportGlobal);
  }, [lang]);

  const handleLaunchReport = (data: any) => {
    setIsReportModeActive(true);
    setAgentRunStatus('running');
    setReportConfig(data);
    setOriginalResourceTree([...resourceTree]);
    setOriginalObjectScope([...constructionObjectScope]);
    
    // Collect all objects from outline for the left sidebar
    const allWells = new Set<string>();
    const allBlocks = new Set<string>();
    const allStructures = new Set<string>();
    const allHorizons = new Set<string>();
    const allUnits = new Set<string>();

    if (data.well) allWells.add(data.well.name);
    
    data.outline.forEach((node: any) => {
      node.objectScope.wells.forEach((w: string) => allWells.add(w.replace(/^井：/, '')));
      node.objectScope.blocks.forEach((b: string) => allBlocks.add(b));
      node.objectScope.structures.forEach((s: string) => allStructures.add(s));
      node.objectScope.horizons.forEach((h: string) => allHorizons.add(h));
      node.objectScope.reservoirUnits.forEach((r: string) => allUnits.add(r));
    });

    const reportObjects = [
      { id: 'wells', label: lang === 'zh' ? '井' : 'Wells', items: Array.from(allWells), color: 'blue', deletable: false },
      { id: 'blocks', label: lang === 'zh' ? '区块' : 'Blocks', items: Array.from(allBlocks), color: 'emerald', deletable: false },
      { id: 'structures', label: lang === 'zh' ? '构造' : 'Structures', items: Array.from(allStructures), color: 'purple', deletable: false },
      { id: 'horizons', label: lang === 'zh' ? '层位' : 'Horizons', items: Array.from(allHorizons), color: 'amber', deletable: false },
      { id: 'units', label: lang === 'zh' ? '单元' : 'Units', items: Array.from(allUnits), color: 'rose', deletable: false },
    ].filter(cat => cat.items.length > 0);

    setConstructionObjectScope(reportObjects);

    // Transform MBU resources for the left sidebar
    const reportResources: ResourceNode[] = data.isSmartReport ? [
      {
        id: 'current-chapter-resources',
        name: lang === 'zh' ? '当前章节相关资料' : 'Current Chapter Materials',
        type: 'folder',
        children: [
          { id: 'curr-1', name: lang === 'zh' ? 'XX-1井钻井设计方案说明书.docx' : 'Well XX-1 Drilling Design Spec.docx', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } },
          { id: 'curr-2', name: lang === 'zh' ? '陆相碎屑岩地层划分国家标准.pdf' : 'Continental Siliciclastic Stratigraphy Standard.pdf', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
        ]
      },
      {
        id: 'all-materials',
        name: lang === 'zh' ? '全部资料' : 'All Materials',
        type: 'folder',
        children: [
          {
            id: 'basic-materials',
            name: lang === 'zh' ? '基础资料' : 'Basic Data',
            type: 'folder',
            children: [
              { id: 'basic-1', name: lang === 'zh' ? '陆相碎屑岩地层划分国家标准.pdf' : 'Continental Siliciclastic Stratigraphy Standard.pdf', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } },
              { id: 'basic-2', name: lang === 'zh' ? '地层分层精细结果表.xlsx' : 'Fine Stratigraphy Result Table.xlsx', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
            ]
          },
          {
            id: 'seismic-materials',
            name: lang === 'zh' ? '地震资料' : 'Seismic Data',
            type: 'folder',
            children: [
              { id: 'seismic-1', name: lang === 'zh' ? 'XX区块三维地震解释成果.segy' : 'XX Block 3D Seismic Interpretation.segy', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } },
              { id: 'seismic-2', name: lang === 'zh' ? '三维地震层位解释成果数据.csv' : '3D Seismic Horizon Interpretation Data.csv', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
            ]
          },
          {
            id: 'log-materials',
            name: lang === 'zh' ? '测井资料' : 'Well Log Data',
            type: 'folder',
            children: [
              { id: 'log-1', name: lang === 'zh' ? '长庆XX-2井测井原始曲线.las' : 'Changqing XX-2 Original Logs.las', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } },
              { id: 'log-2', name: lang === 'zh' ? '邻井测井综合解释图.pdf' : 'Offset Well Log Interpretation Chart.pdf', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
            ]
          },
          {
            id: 'mud-log-materials',
            name: lang === 'zh' ? '录井资料' : 'Mud Log Data',
            type: 'folder',
            children: [
              { id: 'mud-1', name: lang === 'zh' ? 'XX-1井录井日得原始记录.xlsx' : 'Well XX-1 Mud Log Daily Record.xlsx', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } },
              { id: 'mud-2', name: lang === 'zh' ? '井底岩屑录井特征数据.csv' : 'Bottom Cuttings Mud Log Characteristics.csv', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
            ]
          },
          {
            id: 'drilling-materials',
            name: lang === 'zh' ? '钻井资料' : 'Drilling Data',
            type: 'folder',
            children: [
              { id: 'drilling-1', name: lang === 'zh' ? 'XX-1井钻井设计方案说明书.docx' : 'Well XX-1 Drilling Design Spec.docx', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } },
              { id: 'drilling-2', name: lang === 'zh' ? '邻井钻头使用及进尺记录.xlsx' : 'Offset Well Drill Bit & Footage Record.xlsx', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
            ]
          },
          {
            id: 'experimental-materials',
            name: lang === 'zh' ? '实验分析资料' : 'Experimental Analysis Data',
            type: 'folder',
            children: [
              { id: 'exp-1', name: lang === 'zh' ? '岩芯压汞测试及孔隙结构分析.xlsx' : 'Core Mercury Injection Test & Pore Structure Analysis.xlsx', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } },
              { id: 'exp-2', name: lang === 'zh' ? '地层流体物性实验分析报告.pdf' : 'Formation Fluid Physical Property Analysis.pdf', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
            ]
          },
          {
            id: 'historical-reports',
            name: lang === 'zh' ? '历史报告' : 'Historical Reports',
            type: 'folder',
            children: [
              { id: 'hist-1', name: lang === 'zh' ? '一键分层成果专家会签.docx' : 'Expert Co-signature Report.docx', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } },
              { id: 'hist-2', name: lang === 'zh' ? '自动分层比对算法流.py' : 'Automated Layering Workflow.py', type: 'artifact', meta: { sourceType: 'system', fileType: 'Outcome' } }
            ]
          }
        ]
      }
    ] : [
      {
        id: 'mbu-resources',
        name: lang === 'zh' ? '确定的MBU数字化成果' : 'Determined MBU Resources',
        type: 'mbu',
        children: data.outline.map((node: any, idx: number) => ({
            id: `outline-node-${idx}`,
            name: node.title,
            type: 'mbu',
            children: node.selectedMBUs.map((mbu: any, midx: number) => ({
                id: `mbu-res-${idx}-${midx}`,
                name: mbu.name || mbu.id,
                type: 'artifact',
                meta: { sourceType: 'system', fileType: 'MBU' }
            }))
        })).filter((node: any) => node.children.length > 0)
      }
    ];

    setResourceTree(reportResources);
    setIsTracePanelOpen(false); 
    setIsResourcePanelOpen(true); 
  };

  const handleActiveChapterChange = (chapterId: string, chapterTitle: string) => {
    setResourceTree(prevTree => {
      const currentChapterNode = prevTree.find(n => n.id === 'current-chapter-resources');
      const newFiles = getChapterFiles(chapterId, chapterTitle, lang);
      if (currentChapterNode) {
        const currentChildrenIds = currentChapterNode.children?.map(c => c.id).join(',') || '';
        const newChildrenIds = newFiles.map(c => c.id).join(',');
        if (currentChildrenIds === newChildrenIds) {
          return prevTree;
        }
      }
      return prevTree.map(node => {
        if (node.id === 'current-chapter-resources') {
          return {
            ...node,
            children: newFiles
          };
        }
        return node;
      });
    });
  };

  // Navigation Handlers
  const handleTabChange = (tab: MainTab) => {
      setCurrentTab(tab);
      if (tab === 'dashboard' || tab === 'admin' || tab === 'knowledge' || tab === 'construction' || tab === 'profile') {
          setActiveWorkspaceId(null);
      }
  };

  const handleSelectWorkspace = (id: string, name?: string, description?: string, objects?: any[], autoOpenAddResource: boolean = false, defaultAgent?: string) => {
    let finalId = id;
    
    if (id === 'new-demo') {
        const newId = `ws-${Date.now()}`;
        const newWorkspace: Workspace = {
            id: newId,
            name: name || (lang === 'zh' ? '新工作空间' : 'New Workspace'),
            description: description || '',
            objects: objects || [],
            mbuCount: 0,
            createdAt: new Date().toISOString().split('T')[0],
            status: WorkspaceStatus.DRAFT,
            owner: '李明',
            defaultAgent: defaultAgent || '报告生成Agent',
        };
        setWorkspaces(prev => [newWorkspace, ...prev]);
        finalId = newId;
    } else if (name && description) {
        // Update the workspace with name, description, objects if provided
        setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, name, description, objects: objects || [], defaultAgent: defaultAgent || w.defaultAgent } : w));
    }

    setActiveWorkspaceId(finalId);
    setCurrentTab('workspaces'); 
    setWorkspaceVersion('foundation'); // Default to Basic Edition
    
    // Auto-expand categories if objects exist
    if (objects && objects.length > 0) {
        const categories = Array.from(new Set(objects.map(obj => {
            if (obj.category) return obj.category;
            const label = obj.label || (typeof obj === 'string' ? obj : '');
            if (label.includes('油气田') || label.includes('Oilfield')) return lang === 'zh' ? '油气田' : 'Oil Field';
            if (label.includes('区块') || label.includes('Block')) return lang === 'zh' ? '区块' : 'Block';
            if (label.includes('井') || label.includes('Well')) return lang === 'zh' ? '井' : 'Well';
            return lang === 'zh' ? '其它' : 'Others';
        }))) as string[];
        setExpandedObjectCategories(new Set(categories));
    } else {
        const ws = workspaces.find(w => w.id === id);
        if (ws?.objects) {
            const categories = Array.from(new Set(ws.objects.map((obj: any) => {
                if (obj.category) return obj.category;
                const label = obj.label || (typeof obj === 'string' ? obj : '');
                if (label.includes('油气田') || label.includes('Oilfield')) return lang === 'zh' ? '油气田' : 'Oil Field';
                if (label.includes('区块') || label.includes('Block')) return lang === 'zh' ? '区块' : 'Block';
                if (label.includes('井') || label.includes('Well')) return lang === 'zh' ? '井' : 'Well';
                return lang === 'zh' ? '其它' : 'Others';
            }))) as string[];
            setExpandedObjectCategories(new Set(categories));
        }
    }
    
    // Reset state for new workspace
    if (id === 'new-demo') {
        setResourceTree(JSON.parse(JSON.stringify(EMPTY_RESOURCE_TREE)));
        setMessages([]); // Empty messages to show summary/recommendations
        setIsAddResourcePageOpen(autoOpenAddResource);
    } else {
        setResourceTree(JSON.parse(JSON.stringify(DRILLING_RESOURCE_TREE)));
        setMessages([]); // Empty messages to show summary/recommendations
        setIsAddResourcePageOpen(autoOpenAddResource);
    }
    setSelectedMessage(null);
    setIsTracePanelOpen(true);
    setIsResourcePanelOpen(true);
    setEditingDoc(null);
  };

  const handleBackToList = () => {
    setActiveWorkspaceId(null);
    setIsAddResourcePageOpen(false);
    setEditingDoc(null);
  };

  const handleEditCurrentWorkspace = () => {
    if (activeWorkspaceData) {
      setEditName(activeWorkspaceData.name);
      setEditDesc(activeWorkspaceData.description || '');
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateCurrentWorkspace = () => {
    if (activeWorkspaceId && editName.trim()) {
      handleUpdateWorkspace(activeWorkspaceId, {
        name: editName,
        description: editDesc
      });
      setIsEditModalOpen(false);
    }
  };

  useEffect(() => {
    setMultiAgentMessages([]);
    setMessages([]);
    setConfigAgentId(null);
  }, [workspaceVersion]);

  // Global Workspace Handlers
  const handleUpdateWorkspace = (id: string, data: Partial<Workspace>) => {
    setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
  };

  const handleDeleteWorkspace = (id: string) => {
    setWorkspaces(prev => prev.filter(w => w.id !== id));
  };

  const handleToggleResource = (id: string, node: ResourceNode) => {
    const newSelected = new Set(selectedResources);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedResources(newSelected);
  };

  const handleTogglePublic = (id: string, node: ResourceNode) => {
      const updateNode = (nodes: ResourceNode[]): ResourceNode[] => {
          return nodes.map(n => {
              if (n.id === id) {
                  return {
                      ...n,
                      meta: { ...n.meta, isPublic: !n.meta?.isPublic }
                  };
              }
              if (n.children) {
                  return { ...n, children: updateNode(n.children) };
              }
              return n;
          });
      };
      setResourceTree(prev => updateNode(prev));
  };

  const handleAddResource = (parentId: string, newResource: ResourceNode) => {
    const addNode = (nodes: ResourceNode[]): ResourceNode[] => {
      return nodes.map(node => {
        if (node.id === parentId) return { ...node, children: [...(node.children || []), newResource] };
        if (node.children) return { ...node, children: addNode(node.children) };
        return node;
      });
    };
    setResourceTree(prev => addNode(prev));
  };

  const detectFileType = (name: string): string => {
      const lowerName = name.toLowerCase();
      if (lowerName.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/)) return 'Image';
      if (lowerName.match(/\.(xlsx|xls|csv|numbers)$/)) return 'Table';
      if (lowerName.match(/\.(pdf|doc|docx|ppt|pptx|txt|md)$/)) return 'Document';
      if (lowerName.match(/\.(segy|las|dlis)$/)) return 'Data';
      return 'File';
  };

  const [saveTemplateId, setSaveTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleSaveAsTemplate = (workspaceId: string) => {
    const ws = workspaces.find(w => w.id === workspaceId);
    if (!ws) return;
    setSaveTemplateId(workspaceId);
    setTemplateName(ws.name + ' Template');
    setTemplateDesc(ws.description || '');
  };

  const confirmSaveTemplate = () => {
    if (saveTemplateId) {
      const ws = workspaces.find(w => w.id === saveTemplateId);
      if (!ws) return;
      
      const newTemplate: WorkspaceTemplate = {
        id: `tpl-${Date.now()}`,
        name: templateName,
        description: templateDesc || '',
        mbuCount: ws.mbuCount,
        usageCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        owner: ws.owner,
        category: '全部类型', // Default category
        tags: ['User Generated']
      };
      setTemplates(prev => [newTemplate, ...prev]);
      setSaveTemplateId(null);
      setAlertMessage('Template saved successfully!');
    }
  };

  const handleCreateFromTemplate = (template: WorkspaceTemplate, name?: string, description?: string, objects?: any[], defaultAgent?: string) => {
    const newWorkspace: Workspace = {
      id: `ws-${Date.now()}`,
      name: name || `${template.name} (Copy)`,
      mbuCount: template.mbuCount || 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: WorkspaceStatus.DRAFT,
      owner: '当前用户',
      description: description || template.description,
      objects: objects || [],
      defaultAgent: defaultAgent || template.defaultAgent
    };

    setWorkspaces(prev => [newWorkspace, ...prev]);
    
    // Increment usage count
    setTemplates(prev => prev.map(t => 
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
    ));

    handleSelectWorkspace(newWorkspace.id, name, description, objects, true, defaultAgent || template.defaultAgent);
  };

  // Knowledge Base Integration Handler
  const handleAddToWorkspaceFromKB = (workspaceId: string, items: KnowledgeItem[]) => {
      // In a real app, we would update the backend.
      // Here, if the active workspace is the target, we update the live tree.
      
      if (activeWorkspaceId === workspaceId) {
          const newResources: ResourceNode[] = items.map(item => ({
              id: `kb-import-${Date.now()}-${item.id}`,
              name: item.title,
              type: 'artifact',
              meta: {
                  sourceType: 'local', // Treated as user upload/local for now
                  fileType: detectFileType(item.title),
                  date: new Date().toISOString()
              }
          }));

          setResourceTree(prev => {
              const newTree = JSON.parse(JSON.stringify(prev));
              // Find or create a "Local Resources" domain for KB imports
              let localDomain = newTree.find((n: ResourceNode) => n.name === '本地资源' && n.type === 'domain');
              if (!localDomain) {
                  localDomain = { id: 'dom-local-auto', name: '本地资源', type: 'domain', children: [] };
                  newTree.push(localDomain);
              }
              localDomain.children = [...(localDomain.children || []), ...newResources];
              return newTree;
          });
      }
      
      // Update mbuCount mock
      handleUpdateWorkspace(workspaceId, { 
          mbuCount: (workspaces.find(w => w.id === workspaceId)?.mbuCount || 0) + items.length 
      });
  };

  const handleConfirmAddResource = (data: { mbus: any[], resources: any[], sourceType: string, selectedObjects?: any[] }) => {
     const newSystemMbusCount = data.mbus.filter(m => m.id !== 'local-mbu').length;
     if (activeWorkspaceId) {
        setWorkspaces(prev => prev.map(w => {
            if (w.id === activeWorkspaceId) {
                const updatedObjects = data.selectedObjects && data.selectedObjects.length > 0 
                    ? [...(w.objects || []), ...data.selectedObjects.filter(newObj => !(w.objects || []).some((oldObj: any) => oldObj.id === newObj.id))]
                    : w.objects;
                return { ...w, mbuCount: w.mbuCount + newSystemMbusCount, objects: updatedObjects };
            }
            return w;
        }));
     }
     setResourceTree(prevTree => {
         const newTree = JSON.parse(JSON.stringify(prevTree)) as ResourceNode[];

         data.mbus.forEach((mbu: any) => {
             if (mbu.id === 'local-mbu') {
                 const localResources = data.resources.filter((r: any) => r.parentMbuId === mbu.id);
                 if (localResources.length > 0) {
                     // Find or create a "Local Uploads" domain
                     let localDomain = newTree.find(n => n.name === '本地资源' && n.type === 'domain');
                     if (!localDomain) {
                         localDomain = { id: 'dom-local-uploads', name: '本地资源', type: 'domain', children: [] };
                         newTree.push(localDomain);
                     }
                     
                     localResources.forEach((res: any, idx: number) => {
                         const newResource: ResourceNode = {
                             id: `res-local-${Date.now()}-${idx}`,
                             name: res.name,
                             type: 'artifact',
                             meta: { sourceType: 'local', fileType: detectFileType(res.name) },
                             children: []
                         };

                         if (res.fragments && res.fragments.length > 0) {
                             newResource.children = res.fragments.map((frag: any, fIdx: number) => ({
                                 id: `frag-${Date.now()}-${idx}-${fIdx}`,
                                 name: frag.name,
                                 type: 'artifact',
                                 meta: { 
                                     sourceType: 'local', 
                                     fileType: 'Fragment',
                                     content: frag.content,
                                     page: frag.page
                                 }
                             }));
                         }

                         localDomain!.children?.push(newResource);
                     });
                 }
             } else {
                 const workDomainName = mbu.workDomain || '未分类域';
                 let domainNode = newTree.find(c => c.name === workDomainName && c.type === 'domain');
                 if (!domainNode) {
                     domainNode = { id: `dom-${workDomainName}-${Date.now()}`, name: workDomainName, type: 'domain', children: [] };
                     newTree.push(domainNode);
                 }
                 let targetMbuNode = domainNode.children?.find(c => c.id === mbu.id);
                 if (!targetMbuNode) {
                     targetMbuNode = { id: mbu.id, name: mbu.name, type: 'mbu', children: [] };
                     if (!domainNode.children) domainNode.children = [];
                     domainNode.children.push(targetMbuNode);
                 }
                 const mbuResources = data.resources.filter((r: any) => r.parentMbuId === mbu.id);
                 mbuResources.forEach((res: any, idx: number) => {
                     if (!targetMbuNode!.children?.some(c => c.name === res.name)) {
                         const meta: any = { 
                             sourceType: res.sourceType || 'system', 
                             fileType: res.fileType || detectFileType(res.name) 
                         };
                         if (res.content) meta.content = res.content;
                         if (res.page) meta.page = res.page;

                         targetMbuNode!.children?.push({
                             id: `res-sys-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
                             name: res.name,
                             type: 'artifact',
                             meta: meta
                         });
                     }
                 });
             }
         });
         return newTree;
     });
     setIsAddResourcePageOpen(false);
  };

  const handleDeleteResources = (idsToDelete: string[]) => {
    const idsSet = new Set(idsToDelete);
    // No protected IDs anymore as we removed the root wrappers
    const deleteNodes = (nodes: ResourceNode[]): ResourceNode[] => {
      return nodes.filter(node => !idsSet.has(node.id)).map(node => ({
        ...node,
        children: node.children ? deleteNodes(node.children) : undefined
      }));
    };
    setResourceTree(prev => deleteNodes(prev));
    setSelectedResources(prev => {
        const next = new Set(prev);
        idsToDelete.forEach(id => next.delete(id));
        return next;
    });
  };

  const handleEditReport = (content: string, msgId: string) => {
      setEditingDoc({ content, msgId });
  };

  const handleOpenSaveOutcome = (name: string) => {
    setOutcomeToSave({ name });
    setIsSaveOutcomeModalOpen(true);
  };

  const handleSaveDoc = (newContent: string) => {
      if (editingDoc) {
          setMessages(prev => prev.map(m => m.id === editingDoc.msgId ? { ...m, content: newContent } : m));
          setEditingDoc(null);
      }
  };

  const handleHistoryClick = (item: any) => {
    const timestamp = Date.now();
    
    // 1. User Query
    const userMsg: Message = {
      id: `msg-h-u-${timestamp}`,
      role: 'user',
      content: lang === 'zh' ? '作为生产管理专家，请复盘本月全区稳产情况' : 'As a production management expert, please review the stable production situation of the entire area this month.',
      timestamp: timestamp
    };

    // 2. Expert Thought
    const thoughtMsg: Message = {
      id: `msg-h-t-${timestamp + 100}`,
      role: 'model',
      agentId: 'leader-agent',
      content: lang === 'zh' 
        ? `**问题理解**：针对全区本月稳产情况进行深度复盘。涉及产量达成率、异常损耗分析、重点措施井贡献及下月稳产风险预警。\n\n**意图识别**：\n- 岗位职责：全区生产分析与辅助协调。\n- 业务闭环：从“现状分析”到“归因诊断”再到“措施指导”。`
        : `**Understanding**: Deep review of the area's stable production this month...`,
      timestamp: timestamp + 200,
      status: 'completed'
    };

    // 3. Position Decomposition
    const decompMsg: Message = {
      id: `msg-h-d-${timestamp + 300}`,
      role: 'model',
      agentId: 'agent-ent-1',
      content: lang === 'zh' ? '已启动岗位协同复盘流程。正在整合多场景智能体分析结果...' : 'Initiating position collaborative review...',
      timestamp: timestamp + 400,
      status: 'completed',
      payload: {
        scenes: [
          { 
            name: '场景1: 全区产量达成分析', 
            task: '计算计划完成率', 
            status: 'completed',
            workflow: {
              currentStep: 1,
              steps: [{ name: '指标获取', details: { observation: '本月累计产油 42.5 万吨，进度达成率 98.2%。' } }]
            }
          },
          { name: '场景2: 关停井归因统计', task: '量化停产损失', status: 'completed' },
          { name: '场景3: 重点稳产措施评估', task: '评价增产有效性', status: 'completed' },
          { name: '场景4: 跨岗位协同预警', task: '识别供应链/设备风险', status: 'completed' }
        ],
        interimAnswer: lang === 'zh' ? '全区本月生产整体稳定，但 B 区块由于管网维护导致 3.5% 的产量缺口。' : 'Overall stable, but Block B has 3.5% gap due to maintenance.'
      }
    };

    // 4. Final Conclusion
    const finalMsg: Message = {
      id: `msg-h-f-${timestamp + 500}`,
      role: 'model',
      agentId: 'leader-agent',
      content: lang === 'zh' ? '复盘完成' : 'Review completed',
      timestamp: timestamp + 600,
      status: 'completed',
      payload: {
        conclusion: lang === 'zh' 
          ? '本月全区稳产态势良好，累计产量达成率 98.2%。主要影响因素为 B 区中旬的管网例行停产维护。东部新区新井投产贡献超预期，抵消了由于 X 区块老井自然递减带来的压力。'
          : 'Stable production at 98.2% achievement...',
        recommendations: [
          '① 【调控】下月建议加大东部新区排采强度，冲刺 105% 目标',
          '② 【维护】B 区管网已恢复，建议下周补齐缺失产量',
          '③ 【预警】关注 C 区高含水井组，预防突发性淹没风险'
        ],
        outputs: ['月度生产复盘周报.pdf', '全区产量贡献矩阵图', '下月潜力井排名清单']
      }
    };

    if (workspaceVersion === 'enterprise') {
      setMultiAgentMessages([userMsg, thoughtMsg, decompMsg, finalMsg]);
    } else {
      setMessages([userMsg, finalMsg]);
    }
  };

  const currentWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  // Fallback for new-demo workspace if not found in mock list
  const activeWorkspaceData = currentWorkspace || (activeWorkspaceId === 'new-demo' ? {
      id: 'new-demo',
      name: 'New Workspace',
      mbuCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'DRAFT',
      owner: '当前用户',
      description: ''
  } as Workspace : undefined);

  const groupedObjects = useMemo(() => {
    if (!activeWorkspaceData?.objects) return {};
    return activeWorkspaceData.objects.reduce((acc: Record<string, any[]>, rawObj: any) => {
      // Standardize object structure
      const obj = typeof rawObj === 'string' 
        ? { id: rawObj, label: rawObj } 
        : { ...rawObj, label: rawObj.label || rawObj.id };
        
      // Infer category
      let cat = obj.category;
      if (!cat) {
        const label = obj.label || '';
        if (label.includes('油气田') || label.includes('Oilfield')) cat = lang === 'zh' ? '油气田' : 'Oil Field';
        else if (label.includes('区块') || label.includes('Block')) cat = lang === 'zh' ? '区块' : 'Block';
        else if (label.includes('井') || label.includes('Well')) cat = lang === 'zh' ? '井' : 'Well';
        else cat = lang === 'zh' ? '其它' : 'Others';
      }
      
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(obj);
      return acc;
    }, {});
  }, [activeWorkspaceData?.objects, lang]);

  const toggleObjectCategory = (category: string) => {
    setExpandedObjectCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex overflow-hidden text-slate-900 font-sans">
      
      {/* LEFT SIDEBAR - Global Navigation */}
      {currentTab !== 'admin' && currentTab !== 'intelligence' && (
        <div className={`${isSidebarExpanded ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 z-50 shadow-sm relative`}>
            
            {/* Logo & Toggle */}
            <div className="h-16 flex items-center justify-between px-3 mb-6 mt-2">
                <div className="flex items-center gap-3 cursor-pointer overflow-hidden" onClick={(e) => { e.stopPropagation(); handleTabChange('dashboard'); }}>
                    <div className="w-10 h-10 min-w-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                        <span className="font-bold text-white text-lg">J</span>
                    </div>
                    {isSidebarExpanded && (
                        <span className="font-bold text-gray-800 text-xl tracking-tight whitespace-nowrap opacity-100 transition-opacity duration-300">
                            JuraWorkSpace
                        </span>
                    )}
                </div>
            </div>
  
            {/* Nav Items */}
            <div className="flex flex-col gap-2 w-full px-2 flex-1">
                <button 
                  onClick={() => handleTabChange('dashboard')}
                  className={`w-full h-10 rounded-lg flex items-center transition-all ${currentTab === 'dashboard' ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'} ${isSidebarExpanded ? 'px-3 justify-start' : 'justify-center'}`}
                  title={isSidebarExpanded ? '' : t.dashboard}
                >
                    <i className="fas fa-chart-pie text-lg min-w-[1.25rem] text-center"></i>
                    {isSidebarExpanded && <span className="ml-3 text-sm font-medium truncate">{t.dashboard}</span>}
                </button>
                <button 
                  onClick={() => handleTabChange('templates')}
                  className={`w-full h-10 rounded-lg flex items-center transition-all ${currentTab === 'templates' ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'} ${isSidebarExpanded ? 'px-3 justify-start' : 'justify-center'}`}
                  title={isSidebarExpanded ? '' : t.templates}
                >
                    <i className="fas fa-layer-group text-lg min-w-[1.25rem] text-center"></i>
                    {isSidebarExpanded && <span className="ml-3 text-sm font-medium truncate">{t.templates}</span>}
                </button>
                <button 
                  onClick={() => handleTabChange('workspaces')}
                  className={`w-full h-10 rounded-lg flex items-center transition-all ${currentTab === 'workspaces' ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'} ${isSidebarExpanded ? 'px-3 justify-start' : 'justify-center'}`}
                  title={isSidebarExpanded ? '' : t.workspaceManagement}
                >
                    <i className="fas fa-project-diagram text-lg min-w-[1.25rem] text-center"></i>
                    {isSidebarExpanded && <span className="ml-3 text-sm font-medium truncate">{t.workspaceManagement}</span>}
                </button>
                <button 
                  onClick={() => handleTabChange('knowledge')}
                  className={`w-full h-10 rounded-lg flex items-center transition-all ${currentTab === 'knowledge' ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'} ${isSidebarExpanded ? 'px-3 justify-start' : 'justify-center'}`}
                  title={isSidebarExpanded ? '' : t.kbTab}
                >
                    <i className="fas fa-book text-lg min-w-[1.25rem] text-center"></i>
                    {isSidebarExpanded && <span className="ml-3 text-sm font-medium truncate">{t.kbTab}</span>}
                </button>
          </div>

          {/* Bottom Actions */}
          <div className="mt-auto flex flex-col gap-3 w-full px-2 mb-4">
             {/* Toggle Button */}
             <button 
                 onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                 className="w-full h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
             >
                 <i className={`fas fa-chevron-${isSidebarExpanded ? 'left' : 'right'} text-sm`}></i>
             </button>

             <div 
                 onClick={(e) => {
                     e.stopPropagation();
                     setIsProfileDropdownOpen(!isProfileDropdownOpen);
                 }}
                 className={`w-full rounded-xl border flex items-center cursor-pointer transition-colors overflow-hidden ${
                     currentTab === 'profile'
                       ? 'bg-blue-50/80 border-blue-200 text-blue-800 shadow-sm ring-1 ring-blue-100'
                       : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                 } ${isSidebarExpanded ? 'p-2 gap-3' : 'aspect-square justify-center p-0'} relative`} 
                 title={lang === 'zh' ? '当前用户: 李明' : 'Current User: Li Ming'}
             >
                 <div className="w-8 h-8 min-w-[2rem] rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    李
                 </div>
                 {isSidebarExpanded && (
                     <div className="flex flex-col overflow-hidden flex-1">
                         <span className={`text-sm font-bold truncate ${currentTab === 'profile' ? 'text-blue-700' : 'text-gray-800'}`}>李明</span>
                         <span className={`text-[10px] truncate ${currentTab === 'profile' ? 'text-blue-500' : 'text-gray-500'}`}>Drilling Engineer</span>
                     </div>
                 )}
                 {isSidebarExpanded && (
                     <i className={`fas fa-chevron-up text-[10px] transition-transform duration-200 ${currentTab === 'profile' ? 'text-blue-400' : 'text-gray-400'} ${isProfileDropdownOpen ? 'rotate-180' : ''} mr-1`}></i>
                 )}
             </div>
          </div>

          {/* Profile Dropdown Backdrop */}
          {isProfileDropdownOpen && (
              <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileDropdownOpen(false);
                  }}
              />
          )}

          {/* Profile Dropdown */}
          {isProfileDropdownOpen && (
              <div 
                  className={`absolute z-50 bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col p-2 min-w-[180px] ${
                      isSidebarExpanded ? 'bottom-16 left-2 right-2' : 'bottom-2 left-16 w-48'
                  } animate-[fadeIn_0.15s_ease-out]`}
                  onClick={(e) => e.stopPropagation()}
              >
                  <div className="px-3 py-2 border-b border-slate-100 flex flex-col">
                      <span className="text-xs font-bold text-slate-800">{lang === 'zh' ? '李明' : 'Li Ming'}</span>
                      <span className="text-[10px] text-slate-400">{lang === 'zh' ? '钻井工程师' : 'Drilling Engineer'}</span>
                  </div>
                  <button
                      onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleTabChange('profile');
                      }}
                      className="w-full flex items-center px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-left mt-1"
                  >
                      <i className="fas fa-user-circle mr-2.5 text-slate-400 text-sm"></i>
                      {lang === 'zh' ? '个人中心' : 'Personal Center'}
                  </button>
                  <button
                      onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleTabChange('intelligence');
                      }}
                      className="w-full flex items-center px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-left"
                  >
                      <i className="fas fa-brain mr-2.5 text-slate-400 text-sm"></i>
                      {lang === 'zh' ? '智能平台' : 'Intelligence Platform'}
                  </button>
                  <button
                      onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleTabChange('admin');
                      }}
                      className="w-full flex items-center px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-left"
                  >
                      <i className="fas fa-shield-alt mr-2.5 text-slate-400 text-sm"></i>
                      {lang === 'zh' ? '后台管理' : 'Backend Admin'}
                  </button>
              </div>
          )}
       </div>
      )}

      {/* RIGHT CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 relative">
        
        {/* Scenario 1: Dashboard View */}
        {currentTab === 'dashboard' && (
            <Dashboard 
                workspaces={workspaces} 
                onNavigateToWorkspace={() => handleTabChange('workspaces')} 
                lang={lang} 
            />
        )}

        {/* Scenario 2: Admin View */}
        {currentTab === 'admin' && (
            <AdminPanel lang={lang} onExit={() => handleTabChange('workspaces')} />
        )}

        {/* Scenario: Intelligence Platform View */}
        {currentTab === 'intelligence' && (
            <IntelligencePlatform lang={lang} onExit={() => handleTabChange('workspaces')} />
        )}

        {/* Scenario: Personal Center View */}
        {currentTab === 'profile' && (
            <PersonalCenter lang={lang} onExit={() => handleTabChange('workspaces')} onLangChange={setLang} />
        )}

        {/* Scenario 3: Knowledge Base View */}
        {currentTab === 'knowledge' && (
            <KnowledgeBase 
                lang={lang} 
                workspaces={workspaces}
                onAddToWorkspace={handleAddToWorkspaceFromKB}
            />
        )}

        {/* Scenario 6: Templates View */}
        {currentTab === 'templates' && (
            <WorkspaceTemplates 
                templates={templates}
                onCreateFromTemplate={handleCreateFromTemplate}
                lang={lang}
            />
        )}

        {/* Scenario 7: Intelligent Construction View */}
        {currentTab === 'construction' && (
            <IntelligentConstruction 
                lang={lang}
                workspaceName={constructionWorkspaceName}
                onComplete={() => handleTabChange('construction-completion')}
            />
        )}

        {/* Scenario 7.1: Intelligent Construction V2 View */}
        {currentTab === 'construction-v2' && (
            <IntelligentConstructionV2 
                lang={lang}
                workspaceName={constructionWorkspaceName}
                onComplete={() => handleTabChange('construction-completion')}
            />
        )}

        {/* Scenario 8: Construction Completion / Confirmation View */}
        {currentTab === 'construction-completion' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
                {/* Header for Construction Result */}
                <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {lang === 'zh' ? '空间资源构建完成' : 'Space Resources Constructed'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {lang === 'zh' ? '请预览并确认生成的业务节点与资源结构' : 'Please preview and confirm the generated business nodes and resource structure'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => handleTabChange('workspaces')}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {lang === 'zh' ? '取消' : 'Cancel'}
                        </button>
                        <button 
                            onClick={() => {
                                // Flatten the object scope into the format expected by Workspace
                                const flattenedObjects = constructionObjectScope.flatMap(group => 
                                    group.items.map((item: string, idx: number) => ({
                                        id: `${group.id}-${idx}`,
                                        label: item,
                                        type: 'Object',
                                        category: group.label
                                    }))
                                );

                                // Mock creating a new workspace from the result
                                const newWsId = `ws-${Date.now()}`;
                                const newWs: Workspace = {
                                    id: newWsId,
                                    name: constructionWorkspaceName || (lang === 'zh' ? '新构建的钻井空间' : 'New Drilling Workspace'),
                                    description: lang === 'zh' ? '由智能构建生成的空间' : 'Workspace generated by intelligent construction',
                                    status: WorkspaceStatus.DRAFT,
                                    owner: '李明',
                                    createdAt: new Date().toLocaleDateString(),
                                    lastModified: new Date().toISOString(),
                                    resourceCount: 42,
                                    mbuCount: 156,
                                    objects: flattenedObjects
                                };
                                
                                setWorkspaces(prev => [newWs, ...prev]);
                                handleSelectWorkspace(newWsId, newWs.name, newWs.description, flattenedObjects);
                            }}
                            className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
                        >
                            {lang === 'zh' ? '确认并进入空间' : 'Confirm & Enter Workspace'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Generated Tree */}
                    <div className="w-80 h-full border-r border-gray-200 overflow-y-auto">
                        <DirectoryTree 
                            treeData={DRILLING_RESOURCE_TREE}
                            selectedResources={new Set()} 
                            onToggleResource={() => {}} 
                            onSelectNode={setConstructionTreeNode}
                            selectedNodeId={constructionTreeNode?.id}
                            lang={lang}
                            maxLevel={4}
                        />
                    </div>

                    {/* Right: MBU Explorer */}
                    <div className="flex-1 h-full bg-gray-50 overflow-hidden">
                        <MbuExplorer 
                            lang={lang}
                            selectedNode={constructionTreeNode}
                            onSelectMbus={(ids) => setConstructionMbuIds(new Set(ids))}
                            selectedMbuIds={constructionMbuIds}
                            objectScope={constructionObjectScope}
                            setObjectScope={setConstructionObjectScope}
                        />
                    </div>
                </div>
            </div>
        )}

        {/* Scenario 4: Workspaces View */}
        {currentTab === 'workspaces' && (
            <>
                {activeWorkspaceId ? (
                    activeWorkspaceData?.defaultAgent === '智能问数' ? (
                        <>
                            <IntelligentQueryWorkspaceDetail
                                lang={lang}
                                activeWorkspaceId={activeWorkspaceId}
                                activeWorkspaceData={activeWorkspaceData}
                                currentUser={CURRENT_USER}
                                onBackToList={handleBackToList}
                                onEditCurrentWorkspace={handleEditCurrentWorkspace}
                                onOpenSettings={() => setIsHarnessExplorerOpen(true)}
                                resourceTree={resourceTree}
                                selectedResources={selectedResources}
                                onToggleResource={handleToggleResource}
                                onSelectResourceForDetail={(node) => {
                                    setSelectedResourceForDetail(node);
                                    setIsResourceDetailModalOpen(true);
                                }}
                                onAddResource={handleAddResource}
                                onDeleteResources={handleDeleteResources}
                                onTogglePublic={handleTogglePublic}
                                onOpenAddResourcePage={() => setIsAddResourcePageOpen(true)}
                                isObjectScopeExpanded={isObjectScopeExpanded}
                                setIsObjectScopeExpanded={setIsObjectScopeExpanded}
                                groupedObjects={groupedObjects}
                                multiAgentMessages={multiAgentMessages}
                                setMultiAgentMessages={setMultiAgentMessages}
                                onSelectMessage={setSelectedMessage}
                                onUpdateWorkspaceName={(name) => activeWorkspaceId && handleUpdateWorkspace(activeWorkspaceId, { name })}
                                onEditReport={handleEditReport}
                                displayAgents={displayAgents}
                                workspaceVersion={workspaceVersion}
                                onSaveOutcome={handleOpenSaveOutcome}
                                isResourcePanelOpen={isResourcePanelOpen}
                                setIsResourcePanelOpen={setIsResourcePanelOpen}
                            />
                            {isAddResourcePageOpen && (
                                <AddResourcePage 
                                    onClose={() => setIsAddResourcePageOpen(false)} 
                                    onConfirm={handleConfirmAddResource}
                                    lang={lang}
                                    initialTree={resourceTree}
                                    workspaceId={activeWorkspaceId}
                                />
                            )}
                        </>
                    ) : activeWorkspaceData?.defaultAgent === '智能成图' ? (
                        <IntelligentChartWorkspaceDetail
                            lang={lang}
                            activeWorkspaceId={activeWorkspaceId}
                            activeWorkspaceData={activeWorkspaceData}
                            currentUser={CURRENT_USER}
                            onBackToList={handleBackToList}
                            onEditCurrentWorkspace={handleEditCurrentWorkspace}
                            onOpenSettings={() => setIsHarnessExplorerOpen(true)}
                            multiAgentMessages={multiAgentMessages}
                            setMessages={setMultiAgentMessages}
                            onSelectMessage={setSelectedMessage}
                            displayAgents={displayAgents}
                            workspaceVersion={workspaceVersion}
                            onSaveOutcome={handleOpenSaveOutcome}
                            isResourcePanelOpen={isResourcePanelOpen}
                            setIsResourcePanelOpen={setIsResourcePanelOpen}
                        />
                    ) : activeWorkspaceData?.defaultAgent === '智能报告' ? (
                        <IntelligentReportWorkspaceDetail
                            lang={lang}
                            activeWorkspaceId={activeWorkspaceId}
                            activeWorkspaceData={activeWorkspaceData}
                            currentUser={CURRENT_USER}
                            onBackToList={handleBackToList}
                            onEditCurrentWorkspace={handleEditCurrentWorkspace}
                            onOpenSettings={() => setIsHarnessExplorerOpen(true)}
                            resourceTree={resourceTree}
                            selectedResources={selectedResources}
                            onToggleResource={handleToggleResource}
                            onSelectResourceForDetail={setSelectedResourceForDetail}
                            onAddResource={handleAddResource}
                            onDeleteResources={handleDeleteResources}
                            onTogglePublic={handleTogglePublic}
                            onOpenAddResourcePage={() => setIsAddResourcePageOpen(true)}
                            isResourcePanelOpen={isResourcePanelOpen}
                            setIsResourcePanelOpen={setIsResourcePanelOpen}
                        />
                    ) : activeWorkspaceData?.defaultAgent === '单井产量诊断' ? (
                        <IntelligentDeclineWorkspaceDetail
                            lang={lang}
                            activeWorkspaceId={activeWorkspaceId}
                            activeWorkspaceData={activeWorkspaceData}
                            currentUser={CURRENT_USER}
                            onBackToList={handleBackToList}
                            onEditCurrentWorkspace={handleEditCurrentWorkspace}
                            onOpenSettings={() => setIsHarnessExplorerOpen(true)}
                            isResourcePanelOpen={isResourcePanelOpen}
                            setIsResourcePanelOpen={setIsResourcePanelOpen}
                        />
                    ) : (
                        // Workspace Detail View (Editor Mode)
                        <div className="h-full relative flex flex-col">
                        {/* Top Bar for Workspace Detail */}
                        <WorkspaceDetailTopBar
                            lang={lang}
                            activeWorkspaceData={activeWorkspaceData}
                            currentUser={CURRENT_USER}
                            onBackToList={handleBackToList}
                            onEditCurrentWorkspace={handleEditCurrentWorkspace}
                            workspaceVersion={workspaceVersion}
                            setWorkspaceVersion={setWorkspaceVersion}
                            isResourcePanelOpen={isResourcePanelOpen}
                            setIsResourcePanelOpen={setIsResourcePanelOpen}
                            isTracePanelOpen={isTracePanelOpen}
                            setIsTracePanelOpen={setIsTracePanelOpen}
                            setIsVersionModalOpen={setIsVersionModalOpen}
                            onOpenSettings={() => setIsHarnessExplorerOpen(true)}
                            isAgentRunning={isReportModeActive || isProChartGenerating || activeAgentAppId === 'well_decline'}
                            agentName={activeAgentAppId === 'well_decline'
                                ? (lang === 'zh' ? '单井产量下降诊断智能体' : 'Single Well Decline Diagnosis Agent')
                                : isProChartGenerating 
                                ? (lang === 'zh' ? '专业成图智能体' : 'Pro Mapping Agent')
                                : (isReportModeActive && reportConfig?.isSmartReport)
                                ? (lang === 'zh' ? '智能报告' : 'Smart Report')
                                : (lang === 'zh' ? '钻井地质设计专家' : 'Drilling Geo-Design Expert')}
                            statusText={
                                agentRunStatus === 'completed'
                                ? (lang === 'zh' ? '已完成' : 'COMPLETED')
                                : activeAgentAppId === 'well_decline'
                                    ? (lang === 'zh' ? '智能诊断中...' : 'AI DIAGNOSING...')
                                    : isProChartGenerating 
                                        ? (lang === 'zh' ? '智能成图...' : 'AI MAPPING...')
                                        : (lang === 'zh' ? '智能编写中...' : 'AI DRAFTING...')
                            }
                            isCompleted={agentRunStatus === 'completed'}
                            isAssistantOpen={isAssistantOpen}
                            onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)}
                            onCloseAgent={() => {
                                if (activeAgentAppId === 'well_decline') {
                                    setActiveAgentAppId(null);
                                } else if (isReportModeActive) {
                                    setIsReportModeActive(false);
                                    setResourceTree(originalResourceTree);
                                    setConstructionObjectScope(originalObjectScope);
                                } else {
                                    setIsProChartGenerating(false);
                                }
                                setIsTracePanelOpen(true);
                            }}
                        />
                        
                        {/* CONTENT CONTAINER */}
                        <div className="flex-1 flex flex-row overflow-hidden relative">
                            {/* Left Panel: Facts & Resources */}
                            <div className={`${isResourcePanelOpen ? 'w-96 border-r' : 'w-0 border-none'} h-full flex-shrink-0 z-20 shadow-lg bg-white border-slate-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}>
                                <div className="w-96 flex-1 flex flex-col overflow-hidden">
                                    <div className="flex-1 overflow-hidden relative">
                                        {isProChartGenerating ? (
                                            <ProChartRequirementTree lang={lang} />
                                        ) : activeAgentAppId === 'well_decline' ? (
                                            <WellDeclineRequirementTree lang={lang} />
                                        ) : (
                                            <ResourceTree 
                                            treeData={resourceTree.filter(node => node.name !== '智能构建过程' && node.name !== '智能构建过程V2')}
                                            selectedResources={selectedResources} 
                                            onToggleResource={handleToggleResource} 
                                            onSelectNode={(node) => {
                                                if (node.type === 'artifact') {
                                                    setSelectedResourceForDetail(node);
                                                    setIsResourceDetailModalOpen(true);
                                                }
                                            }}
                                            onAddResource={handleAddResource}
                                            onDeleteResources={handleDeleteResources}
                                            onTogglePublic={handleTogglePublic}
                                            onOpenAddResourcePage={() => setIsAddResourcePageOpen(true)}
                                            lang={lang}
                                            hideCheckboxes={isReportModeActive || isProChartGenerating || activeAgentAppId === 'well_decline'}
                                            isSmartReport={isReportModeActive && reportConfig?.isSmartReport}
                                        />
                                        )}
                                    </div>
                                    
                                    {/* Selected Object Scope Section */}
                                    <div className={`border-t border-slate-200 flex flex-col bg-white overflow-hidden transition-all duration-300 ${isObjectScopeExpanded ? 'flex-1' : 'h-11'}`}>
                                        <div 
                                            className="px-4 py-2.5 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                            onClick={() => setIsObjectScopeExpanded(!isObjectScopeExpanded)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-[0_2px_4px_rgba(59,130,246,0.3)]">
                                                    <i className="fas fa-check text-[10px] text-white"></i>
                                                </div>
                                                <h3 className="text-sm font-bold text-slate-700 tracking-tight">
                                                    {lang === 'zh' ? '已选对象范围' : 'Selected Objects'}
                                                </h3>
                                                <span className="ml-1 text-sm font-medium text-slate-500">
                                                    ({activeWorkspaceData?.objects?.length || 0})
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {isObjectScopeExpanded && activeWorkspaceData?.objects && activeWorkspaceData.objects.length > 0 && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Logic to clear all objects would go here
                                                            // For now, we'll keep it as a UI action that could be wired up
                                                        }}
                                                        className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 transition-colors group"
                                                    >
                                                        <i className="fas fa-trash-alt text-xs"></i>
                                                        <span className="text-xs font-medium">{lang === 'zh' ? '清空全部' : 'Clear All'}</span>
                                                    </button>
                                                )}
                                                <i className={`fas fa-chevron-down text-xs text-slate-400 transition-transform duration-300 ${isObjectScopeExpanded ? 'rotate-180' : ''}`}></i>
                                            </div>
                                        </div>
                                        
                                        {isObjectScopeExpanded && (
                                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                {activeWorkspaceData?.objects && activeWorkspaceData.objects.length > 0 ? (
                                                    <div className="flex flex-col">
                                                        {Object.entries(groupedObjects).map(([category, items]: [string, any], idx, arr) => (
                                                            <div key={category} className={`${idx !== arr.length - 1 ? 'border-b border-slate-100 mb-4 pb-4' : ''}`}>
                                                                <div 
                                                                    className="flex items-center gap-3 mb-3"
                                                                >
                                                                    <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-blue-500 text-sm border border-blue-50">
                                                                        <i className="fas fa-cubes"></i>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-sm font-bold text-slate-700">{category}</span>
                                                                        <span className="text-sm font-medium text-slate-400">({items.length})</span>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="flex flex-wrap gap-2 pl-9">
                                                                    {items.map((obj: any) => (
                                                                        <div 
                                                                            key={obj.id}
                                                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 group transition-all hover:bg-blue-100/50"
                                                                        >
                                                                            <span className="text-xs font-medium text-blue-600 truncate max-w-[120px]">{obj.label}</span>
                                                                            <button 
                                                                                className="text-blue-400 hover:text-blue-600 transition-colors"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    // Link individual remove logic here
                                                                                }}
                                                                            >
                                                                                <i className="fas fa-times text-[10px]"></i>
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                                                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-200">
                                                            <i className="fas fa-layer-group text-2xl"></i>
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-400">{lang === 'zh' ? '暂未选择对象' : 'No objects selected'}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Toggle button on Left Panel boundary */}
                            <button 
                                onClick={() => setIsResourcePanelOpen(!isResourcePanelOpen)}
                                className={`absolute top-1/2 -translate-y-1/2 w-5 h-12 bg-white border border-slate-200 shadow-md rounded-r-md flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all z-30 cursor-pointer ${isResourcePanelOpen ? 'left-[384px]' : 'left-0'}`}
                                title={isResourcePanelOpen ? (lang === 'zh' ? '收起资源面板' : 'Collapse Resources') : (lang === 'zh' ? '展开资源面板' : 'Expand Resources')}
                                style={{ transition: 'left 300ms ease-in-out' }}
                            >
                                <i className={`fas ${isResourcePanelOpen ? 'fa-chevron-left' : 'fa-chevron-right'} text-[10px]`}></i>
                            </button>

                            <div className="flex-1 min-w-0 z-0 bg-gray-50 flex flex-col overflow-hidden">
                                <div className={`flex-1 relative flex flex-row ${isAssistantOpen && (isReportModeActive || isProChartGenerating || activeAgentAppId === 'well_decline') ? 'pr-[400px]' : ''}`}>
                                    <div className="flex-1 h-full relative p-3">
                                        {isReportModeActive ? (
                                            <ReportGenerationAgent 
                                                key={`report-${agentRefreshKey}`}
                                                lang={lang}
                                                config={reportConfig}
                                                onCloseAgent={() => {
                                                    setIsReportModeActive(false);
                                                    setResourceTree(originalResourceTree);
                                                    setConstructionObjectScope(originalObjectScope);
                                                }}
                                                onComplete={() => setAgentRunStatus('completed')}
                                                onActiveChapterChange={handleActiveChapterChange}
                                            />
                                        ) : isProChartGenerating ? (
                                            <ProChartGenerationAgent 
                                                key={`pro-chart-${agentRefreshKey}`}
                                                lang={lang}
                                                onComplete={() => setAgentRunStatus('completed')}
                                            />
                                        ) : workspaceVersion === 'enterprise' && configAgentId ? (
                                        <AgentConfigWizard 
                                            agent={displayAgents.find(a => a.id === configAgentId) || displayAgents[1]}
                                            onSave={(updated) => {
                                                setAgents(prev => prev.map(a => a.id === updated.id ? { ...updated, status: 'Running' } : a));
                                                setAlertMessage(`数字员工 ${updated.name} 的运行任务已成功部署！`);
                                                setConfigAgentId(null);
                                            }}
                                            onCancel={() => setConfigAgentId(null)}
                                        />
                                    ) : activeAgentAppId === 'well_decline' ? (
                                        <WellDeclineDiagnosis 
                                            key={`well-decline-${agentRefreshKey}`}
                                            lang={lang} 
                                            onClose={() => { setActiveAgentAppId(null); setIsTracePanelOpen(true); }} 
                                            onComplete={() => setAgentRunStatus('completed')}
                                        />
                                    ) : (
                                        <MultiAgentChatPanel 
                                            messages={multiAgentMessages}
                                            setMessages={setMultiAgentMessages}
                                            selectedResources={selectedResources}
                                            allResources={resourceTree}
                                            onSelectMessage={setSelectedMessage}
                                            onChatStart={() => setIsTracePanelOpen(true)}
                                            onAddResource={handleAddResource}
                                            currentWorkspace={activeWorkspaceData}
                                            onUpdateWorkspaceName={(name) => activeWorkspaceId && handleUpdateWorkspace(activeWorkspaceId, { name })}
                                            lang={lang}
                                            onEditReport={handleEditReport}
                                            onToggleTracePanel={() => setIsTracePanelOpen(!isTracePanelOpen)}
                                            isTracePanelOpen={isTracePanelOpen}
                                            agents={displayAgents}
                                            workspaceVersion={workspaceVersion}
                                            onSaveOutcome={handleOpenSaveOutcome}
                                        />
                                    )}
                                </div>

                                {/* Assistant moved to right in App Mode */}
                                {activeAgentAppId && activeAgentAppId !== 'well_decline' && (
                                    <div className={`${isAssistantExpanded ? 'w-[320px]' : 'w-0'} h-full border-l border-slate-200 shadow-[-4px_0_12px_rgba(0,0,0,0.03)] bg-white transition-all duration-500 ease-in-out relative flex flex-col`}>
                                        {/* Toggle button ball on the left */}
                                        <button 
                                            onClick={() => setIsAssistantExpanded(!isAssistantExpanded)}
                                            className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all z-20 group"
                                            title={isAssistantExpanded ? (lang === 'zh' ? '收起助手' : 'Collapse Assistant') : (lang === 'zh' ? '展开助手' : 'Expand Assistant')}
                                        >
                                            <i className={`fas ${isAssistantExpanded ? 'fa-chevron-right' : 'fa-message'} transition-transform duration-500 ${!isAssistantExpanded ? 'group-hover:scale-110' : ''}`}></i>
                                        </button>

                                        <div className="flex-1 overflow-hidden">
                                            <MultiAgentChatPanel 
                                                messages={multiAgentMessages}
                                                setMessages={setMultiAgentMessages}
                                                selectedResources={selectedResources}
                                                allResources={resourceTree}
                                                onSelectMessage={setSelectedMessage}
                                                onChatStart={() => {}}
                                                onAddResource={handleAddResource}
                                                currentWorkspace={activeWorkspaceData}
                                                onUpdateWorkspaceName={() => {}}
                                                lang={lang}
                                                onEditReport={handleEditReport}
                                                onToggleTracePanel={() => {}}
                                                isTracePanelOpen={true}
                                                agents={displayAgents}
                                                workspaceVersion={workspaceVersion}
                                                onSaveOutcome={handleOpenSaveOutcome}
                                                isMiniAssistant={true}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Panel: Trace & Audit or Enterprise Agents Panel */}
                            {(workspaceVersion === 'enterprise' || workspaceVersion === 'professional' || workspaceVersion === 'foundation') && !activeAgentAppId ? (
                                <div className={`${isTracePanelOpen ? 'w-96 border-l' : 'w-0 border-none'} h-full flex-shrink-0 border-gray-200 z-10 bg-white transition-all duration-300 ease-in-out overflow-hidden`}>
                                    <div className="w-96 h-full">
                                        <TracePanel 
                                            selectedMessage={selectedMessage} 
                                            resourceTree={resourceTree} 
                                            lang={lang} 
                                            onToggle={() => setIsTracePanelOpen(!isTracePanelOpen)}
                                            workspaceVersion={workspaceVersion}
                                            onCreateReport={() => setIsReportModalOpen(true)}
                                            onSelectAgent={(id) => {
                                                if (id === 'well_decline') {
                                                    setAgentRunStatus('running');
                                                    setActiveAgentAppId('well_decline');
                                                    setIsTracePanelOpen(false);
                                                    setIsResourcePanelOpen(true);
                                                } else {
                                                    setConfigAgentId(id);
                                                }
                                            }}
                                            onViewAllHistory={() => setIsExecutionHistoryPageOpen(true)}
                                            onUpdateAgentStatus={(id, status) => setAgents(prev => prev.map(a => a.id === id ? { ...a, status } : a))}
                                            onHistoryClick={handleHistoryClick}
                                            agents={displayAgents}
                                            onCollapseResourcePanel={() => setIsResourcePanelOpen(false)}
                                            onStartProChartGeneration={() => {
                                                setAgentRunStatus('running');
                                                setIsProChartGenerating(true);
                                                setIsResourcePanelOpen(true);
                                                setIsTracePanelOpen(false);
                                            }}
                                            onOpenProReport={() => setIsResourcePanelOpen(false)}
                                            onLaunchReport={handleLaunchReport}
                                        />
                                    </div>
                                </div>
                            ) : null}

                            {/* Toggle button on Right Panel boundary */}
                            {(workspaceVersion === 'enterprise' || workspaceVersion === 'professional' || workspaceVersion === 'foundation') && !activeAgentAppId && (
                                <button 
                                    onClick={() => setIsTracePanelOpen(!isTracePanelOpen)}
                                    className={`absolute top-1/2 -translate-y-1/2 w-5 h-12 bg-white border border-slate-200 shadow-md rounded-l-md flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all z-30 cursor-pointer ${isTracePanelOpen ? 'right-[384px]' : 'right-0'}`}
                                    title={isTracePanelOpen ? (lang === 'zh' ? '收起智能面板' : 'Collapse Intelligent Panel') : (lang === 'zh' ? '展开智能面板' : 'Expand Intelligent Panel')}
                                    style={{ transition: 'right 300ms ease-in-out' }}
                                >
                                    <i className={`fas ${isTracePanelOpen ? 'fa-chevron-right' : 'fa-chevron-left'} text-[10px]`}></i>
                                </button>
                            )}
                        </div>

                        {/* Evidence Chain Panel */}
                        <EvidenceChainPanel lang={lang} />

                        {/* Modal Overlay for Add Resource */}
                        {isAddResourcePageOpen && (
                            <AddResourcePage 
                                onClose={() => setIsAddResourcePageOpen(false)} 
                                onConfirm={handleConfirmAddResource}
                                lang={lang}
                                initialTree={resourceTree}
                                workspaceId={activeWorkspaceId}
                            />
                        )}

                        {isExecutionHistoryPageOpen && (
                            <div className="absolute inset-0 z-[100] bg-white animate-in slide-in-from-right-10 duration-500">
                                <ExecutionHistoryPage 
                                    agents={agents}
                                    onBack={() => setIsExecutionHistoryPageOpen(false)}
                                    lang={lang}
                                />
                            </div>
                        )}

                        {/* Full Screen Document Editor */}
                        {editingDoc && (
                            <DocumentEditor
                                initialContent={editingDoc.content}
                                onSave={handleSaveDoc}
                                onCancel={() => setEditingDoc(null)}
                                lang={lang}
                            />
                        )}
                    </div>
                    )
                ) : (
                    // Workspace List View
                    <div className="h-full overflow-y-auto bg-gray-50">
                        <WorkspaceList 
                            workspaces={workspaces}
                            templates={templates}
                            onSelectWorkspace={handleSelectWorkspace} 
                            onUpdateWorkspace={handleUpdateWorkspace}
                            onDeleteWorkspace={handleDeleteWorkspace}
                            onSaveAsTemplate={handleSaveAsTemplate}
                            onCreateFromTemplate={handleCreateFromTemplate}
            onStartIntelligentConstruction={(name) => {
                setConstructionWorkspaceName(name);
                handleTabChange('construction');
            }}
                            lang={lang} 
                        />
                    </div>
                )}
                <AssistantSidebar 
                    lang={lang}
                    isOpen={isAssistantOpen}
                    onClose={() => setIsAssistantOpen(false)}
                    agentName={activeAgentAppId === 'well_decline' 
                      ? (lang === 'zh' ? '单井产量下降诊断智能体' : 'Single Well Decline Diagnosis Agent')
                      : isProChartGenerating 
                        ? (lang === 'zh' ? '专业成图智能体' : 'Pro Mapping Agent')
                        : isReportModeActive 
                          ? (reportConfig?.isSmartReport 
                            ? (lang === 'zh' ? '智能报告' : 'Smart Report')
                            : (lang === 'zh' ? '钻井地质设计专家' : 'Drilling Geo-Design Expert')) 
                          : 'AI Agent'}
                    agentStatus={agents.find(a => a.status === 'Running')?.status || 'Idle'}
                    mode="absolute"
                    onRefreshAgent={() => setAgentRefreshKey(prev => prev + 1)}
                />
            </>
        )}
        <AnimatePresence>
          {saveTemplateId && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSaveTemplateId(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">{t.saveAsTemplate}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t.templateNamePlaceholder}</label>
                    <input 
                      type="text" 
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t.templateDescPlaceholder}</label>
                    <textarea 
                      value={templateDesc}
                      onChange={(e) => setTemplateDesc(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => setSaveTemplateId(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-bold hover:bg-gray-50"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    onClick={confirmSaveTemplate}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-100"
                  >
                    {t.save}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
          {alertMessage && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAlertMessage(null)}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-xs w-full text-center"
              >
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl mx-auto mb-4">
                  <i className="fas fa-check"></i>
                </div>
                <p className="text-gray-800 font-medium mb-6">{alertMessage}</p>
                <button 
                  onClick={() => setAlertMessage(null)}
                  className="w-full py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors"
                >
                  {t.confirm}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Version Comparison Modal */}
        <VersionComparisonModal 
            isOpen={isVersionModalOpen}
            onClose={() => setIsVersionModalOpen(false)}
            currentVersion={workspaceVersion}
        />

        {/* Report Template Modal */}
        <ReportTemplateModal 
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            lang={lang}
        />

        {isSaveOutcomeModalOpen && (
          <SaveOutcomeModal 
            isOpen={isSaveOutcomeModalOpen}
            onClose={() => setIsSaveOutcomeModalOpen(false)}
            lang={lang}
            resourceTree={resourceTree}
            initialName={outcomeToSave?.name || ''}
            objectScope={constructionObjectScope}
            onConfirm={(data) => {
              const newOutcome: ResourceNode = {
                id: `outcome-${Date.now()}`,
                name: data.name,
                type: 'artifact',
                meta: {
                  sourceType: 'system',
                  fileType: 'Outcome',
                  isPublic: data.isPublic,
                  date: new Date().toISOString(),
                  outcomeType: data.outcomeType,
                  objectId: data.objectId,
                  isArtifactOutcome: data.isArtifactOutcome
                }
              };
              handleAddResource(data.mbuId, newOutcome);
              setIsSaveOutcomeModalOpen(false);
              setAlertMessage(lang === 'zh' ? '成果保存成功！已添加到资源树，并标记为深度分析成果。' : 'Outcome saved successfully! Added to resource tree and marked as deep analysis artifact.');
            }}
          />
        )}

        {/* Global Strategy Confirmation Dialog */}
        {isStrategyConfirmationOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-[900px] h-[800px] flex flex-col overflow-hidden border border-white/20"
            >
                {/* Modal Header */}
                <div className="p-8 border-b border-slate-100 bg-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                            <i className="fas fa-cog fa-spin text-xl"></i>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">智能构建策略确认</h2>
                            <p className="text-sm text-slate-500 font-medium">系统将基于以下策略自动化生产协作研究空间</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsStrategyConfirmationOpen(false)}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Modal Content - Scrollable area */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 custom-scrollbar">
                    <WorkspaceStrategyConfig onChange={() => {}} />
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400">
                        <i className="fas fa-shield-check text-indigo-500"></i>
                        <span className="text-xs font-medium italic">所选策略将应用于本次智能构建全过程</span>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsStrategyConfirmationOpen(false)}
                            className="px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                        >
                            取消构建
                        </button>
                        <button 
                            onClick={() => {
                                setIsStrategyConfirmationOpen(false);
                                handleTabChange('construction');
                            }}
                            className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3"
                        >
                            确认策略并开始构建
                            <i className="fas fa-arrow-right text-xs"></i>
                        </button>
                    </div>
                </div>
            </motion.div>
          </div>
        )}

        {isResourceDetailModalOpen && selectedResourceForDetail && (
          <ResourceDetailModal 
            isOpen={isResourceDetailModalOpen}
            onClose={() => setIsResourceDetailModalOpen(false)}
            resourceName={selectedResourceForDetail.name}
            hasData={!selectedResourceForDetail.missing}
          />
        )}

        <HarnessFileExplorer 
          isOpen={isHarnessExplorerOpen} 
          onClose={() => setIsHarnessExplorerOpen(false)} 
          lang={lang} 
        />
      </div>
      {/* Edit Workspace Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">{t.editWorkspace}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {t.workspaceName}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
                    placeholder={t.placeholderTitle}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {t.workspaceDesc}
                  </label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none resize-none"
                    rows={4}
                    placeholder={t.placeholderDesc}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 px-4 border border-gray-100 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={handleUpdateCurrentWorkspace}
                  disabled={!editName.trim()}
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-lg shadow-indigo-100 transition-all"
                >
                  {t.update}
                </button>
              </div>
            </motion.div>
          </div>
        )}


      </AnimatePresence>
      </div>
  );
};

export default App;
