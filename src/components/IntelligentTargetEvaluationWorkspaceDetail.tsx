import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Sliders, 
  Brain, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  Plus, 
  AlertTriangle,
  Award,
  FileText,
  Clock,
  Check,
  X,
  Sparkles,
  FileUp,
  GitBranch,
  Info
} from 'lucide-react';
import { Workspace } from '../types';
import { IntelligentTargetEvaluationTopBar } from './IntelligentTargetEvaluationTopBar';
import { ExplorationTargetRequirementTree } from './ExplorationTargetRequirementTree';
import { AssistantSidebar } from './AssistantSidebar';

interface IntelligentTargetEvaluationWorkspaceDetailProps {
  lang: 'zh' | 'en';
  activeWorkspaceId: string;
  activeWorkspaceData: Workspace;
  currentUser: string;
  onBackToList: () => void;
  onEditCurrentWorkspace: () => void;
  onOpenSettings: () => void;
  isResourcePanelOpen: boolean;
  setIsResourcePanelOpen: (open: boolean) => void;
  onOpenAddResourcePage?: () => void;
}

// Mock evaluation targets
interface EvaluationTarget {
  id: string;
  name: string;
  region: string;
  stage: string;
  type: string;
  status: string;
  recommendationStars: number;
  riskText: string;
  riskColor: string;
  geoScore: number;
  feasibility: string;
  feasibilityColor: string;
  subScores: {
    source: number;
    reservoir: number;
    caprock: number;
    trap: number;
    preservation: number;
  };
  engineeringRisks: string[];
  riskLevels: {
    geology: '高' | '中' | '低' | 'High' | 'Medium' | 'Low';
    engineering: '高' | '中' | '低' | 'High' | 'Medium' | 'Low';
    hse: '高' | '中' | '低' | 'High' | 'Medium' | 'Low';
    economy: '高' | '中' | '低' | 'High' | 'Medium' | 'Low';
  };
  pros: string[];
  cons: string[];
  suggestions: string[];
}

const MOCK_TARGETS: Record<string, EvaluationTarget> = {
  'target-1': {
    id: 'target-1',
    name: '顺北5号圈闭目标',
    region: '顺北区块',
    stage: '风险勘探',
    type: '构造目标',
    status: '综合评价中',
    recommendationStars: 3,
    riskText: '中高风险',
    riskColor: 'amber',
    geoScore: 75,
    feasibility: '中',
    feasibilityColor: 'amber',
    subScores: {
      source: 4,
      reservoir: 3,
      caprock: 4,
      trap: 2,
      preservation: 3
    },
    engineeringRisks: [
      '深层钻井风险（超深、超高温、易逸散漏失）',
      '储层改造难度大（断裂带非均质性强，应力复杂）',
      '工程成本预算偏高'
    ],
    riskLevels: {
      geology: '高',
      engineering: '中',
      hse: '低',
      economy: '中'
    },
    pros: [
      '成藏条件优越，紧邻沙雅深部生油凹陷，供烃充足。',
      '储量潜力可观，断控缝洞体发育规模大，地震储层反射特征明显。'
    ],
    cons: [
      '圈闭落实程度不足，断裂错综复杂，分支断层错动对圈闭封闭性造成一定隐患。',
      '储层非均质性强，深部超临界流体物性预测存在不确定性。'
    ],
    suggestions: [
      '补充三维地震大功率电磁测深资料，精细刻画分支断裂。',
      '开展新一轮压力预测与目标相控反演，优选第一口评价井井位。'
    ]
  },
  'target-2': {
    id: 'target-2',
    name: '顺北2号圈闭目标',
    region: '顺北区块',
    stage: '风险勘探',
    type: '岩性目标',
    status: '已完成评价',
    recommendationStars: 4,
    riskText: '中低风险',
    riskColor: 'emerald',
    geoScore: 85,
    feasibility: '高',
    feasibilityColor: 'emerald',
    subScores: {
      source: 5,
      reservoir: 4,
      caprock: 4,
      trap: 3,
      preservation: 4
    },
    engineeringRisks: [
      '地层研磨性高，钻头磨损较快',
      '层间压力过渡带窄'
    ],
    riskLevels: {
      geology: '中',
      engineering: '低',
      hse: '低',
      economy: '低'
    },
    pros: [
      '圈闭落实程度高，三维解释完全闭合。',
      '临近实钻丰产井，断裂连通性及疏导能力已被证实。'
    ],
    cons: [
      '目的层埋藏极深（>8200米），机械钻速面临巨大挑战。'
    ],
    suggestions: [
      '引入个性化提速工具，强化超深地层快速钻进。'
    ]
  },
  'target-3': {
    id: 'target-3',
    name: '顺裂1号圈闭目标',
    region: '顺北区块',
    stage: '风险勘探',
    type: '断块目标',
    status: '暂缓实施',
    recommendationStars: 2,
    riskText: '高风险',
    riskColor: 'rose',
    geoScore: 58,
    feasibility: '低',
    feasibilityColor: 'rose',
    subScores: {
      source: 3,
      reservoir: 2,
      caprock: 3,
      trap: 1,
      preservation: 2
    },
    engineeringRisks: [
      '超高压漏失层段众多',
      '硫化氢酸性腐蚀风险极高'
    ],
    riskLevels: {
      geology: '高',
      engineering: '高',
      hse: '中',
      economy: '高'
    },
    pros: [
      '局部构造高点清晰，具备一定的油气聚集空间。'
    ],
    cons: [
      '断层向上穿透主力盖层，存在严重的纵向逸散，油气保存完整性极低。',
      '井控储量规模不确定。'
    ],
    suggestions: [
      '暂缓实钻，等待区域盖层发育连通性专题研究成果出炉。'
    ]
  }
};

type EvidenceTabType = 'evidence' | 'logs' | 'versions';

export const IntelligentTargetEvaluationWorkspaceDetail: React.FC<IntelligentTargetEvaluationWorkspaceDetailProps> = ({
  lang,
  activeWorkspaceId,
  activeWorkspaceData,
  currentUser,
  onBackToList,
  onEditCurrentWorkspace,
  onOpenSettings,
  isResourcePanelOpen,
  setIsResourcePanelOpen,
  onOpenAddResourcePage,
}) => {
  const [selectedTargetKey, setSelectedTargetKey] = useState<string>('target-1');
  const target = useMemo(() => MOCK_TARGETS[selectedTargetKey] || MOCK_TARGETS['target-1'], [selectedTargetKey]);

  // Six-Stage business evaluation loop active step (0 means panorama/all)
  const [activeStep, setActiveStep] = useState<number>(0);

  // Versioning state
  const [activeVersion, setActiveVersion] = useState<'V1' | 'V2' | 'V3'>('V3');

  const targetVersionData = useMemo(() => {
    const base = { ...target };
    if (activeVersion === 'V1') {
      base.recommendationStars = Math.max(1, base.recommendationStars - 1);
      base.riskText = lang === 'zh' ? '高风险' : 'High Risk';
      base.riskColor = 'rose';
      base.geoScore = Math.max(40, base.geoScore - 15);
      base.subScores = { ...base.subScores, trap: 1, reservoir: 2 };
    } else if (activeVersion === 'V2') {
      base.riskText = lang === 'zh' ? '中高风险' : 'Medium-High Risk';
      base.riskColor = 'amber';
      base.geoScore = Math.min(95, base.geoScore - 5);
      base.subScores = { ...base.subScores, trap: 2, reservoir: 3 };
    }
    return base;
  }, [target, activeVersion, lang]);

  // Sidebar Assistant controls
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Bottom evidence panel controls
  const [isEvidenceExpanded, setIsEvidenceExpanded] = useState(false);
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<EvidenceTabType>('evidence');

  // Modals / Overlays
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [reEvaluating, setReEvaluating] = useState(false);
  const [evaluationSuccessToast, setEvaluationSuccessToast] = useState('');

  // Rules states
  const [ruleFaultSealing, setRuleFaultSealing] = useState<number>(70);
  const [ruleReservoirFactor, setRuleReservoirFactor] = useState<number>(85);
  const [ruleCaprockThickness, setRuleCaprockThickness] = useState<number>(120);

  const triggerToast = (msg: string) => {
    setEvaluationSuccessToast(msg);
    setTimeout(() => {
      setEvaluationSuccessToast('');
    }, 3000);
  };

  const handleReEvaluate = () => {
    setReEvaluating(true);
    setTimeout(() => {
      setReEvaluating(false);
      setActiveVersion('V3');
      triggerToast(lang === 'zh' ? '✅ 重新评价完成！AI智能体已载入最新资料并重新评分。' : '✅ Re-evaluation complete! AI agent has loaded the latest data.');
    }, 1500);
  };

  // Bottom Evidence Chain tabs rendering
  const renderEvidenceTab = () => (
    <div className="flex items-center justify-between gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100 overflow-x-auto custom-scrollbar h-full min-h-[160px]">
      {[
        { label: lang === 'zh' ? '结果 (Result)' : 'Result', val: lang === 'zh' ? '圈闭风险 高' : 'High Trap Risk', desc: lang === 'zh' ? '圈闭评分仅为2星' : 'Low 2-star score', color: 'text-rose-600 bg-rose-50 border-rose-100' },
        { label: lang === 'zh' ? '逻辑 (Logic)' : 'Logic', val: lang === 'zh' ? '圈闭闭合面积不足' : 'Closure Restricted', desc: lang === 'zh' ? '分支断裂存在连通逸散' : 'Fault sealing issues', color: 'text-amber-600 bg-amber-50 border-amber-100' },
        { label: lang === 'zh' ? '规则 (Rule)' : 'Rule', val: lang === 'zh' ? '风险评价标准V2.0' : 'Std Evaluation v2.0', desc: lang === 'zh' ? '断距小于20米折减权重' : 'Weight penalty applied', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
        { label: lang === 'zh' ? '资料 (Document)' : 'Document', val: lang === 'zh' ? '三维地震解释成果' : '3D Seismic Inversion', desc: lang === 'zh' ? '地震频段35-42Hz' : 'Frequency ranges', color: 'text-slate-600 bg-slate-100 border-slate-200' },
        { label: lang === 'zh' ? '证据 (Evidence)' : 'Evidence', val: lang === 'zh' ? '解释图件 第12页' : 'Interpretation Page 12', desc: lang === 'zh' ? '图3-2：奥陶系走向剖面' : 'Fault sealing profiles', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
      ].map((node, idx) => (
        <React.Fragment key={idx}>
          <div className={`p-3.5 rounded-xl border flex flex-col justify-between text-left min-w-[150px] h-28 flex-1 shadow-xs transition-all hover:scale-[1.02] ${node.color}`}>
            <span className="text-[9px] font-black uppercase tracking-wider opacity-70">{node.label}</span>
            <div>
              <div className="text-xs font-black truncate mt-1">{node.val}</div>
              <div className="text-[10px] opacity-80 mt-0.5 truncate">{node.desc}</div>
            </div>
          </div>
          {idx < 4 && (
            <span className="text-slate-300 font-extrabold text-sm px-0.5 flex-shrink-0">→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderLogsTab = () => (
    <div className="bg-slate-900 rounded-2xl p-4 h-full font-mono text-[11px] text-slate-300 overflow-y-auto space-y-1.5 text-left min-h-[160px]">
      <p className="text-slate-500">[{new Date().toISOString()}] <span className="text-indigo-400">INFO</span> Loading evaluation target model...</p>
      <p className="text-slate-500">[{new Date().toISOString()}] <span className="text-indigo-400">INFO</span> Successfully fetched geological & geophysical datasets for {targetVersionData.name}.</p>
      <p className="text-slate-500">[{new Date().toISOString()}] <span className="text-emerald-400">SUCCESS</span> 100% matched reservoir layers and trap boundaries.</p>
      <p className="text-slate-500">[{new Date().toISOString()}] <span className="text-indigo-400">INFO</span> Model active evaluation version: {activeVersion}. Score recalculation complete.</p>
      <p className="text-slate-500">[{new Date().toISOString()}] <span className="text-amber-400">WARN</span> Sealing boundary warning threshold set to {ruleCaprockThickness}m. Fault Sealing weight factor: {ruleFaultSealing}%.</p>
      <div className="w-1.5 h-3.5 bg-indigo-500 animate-pulse inline-block"></div>
    </div>
  );

  const renderVersionsTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-1 items-center min-h-[160px]">
      {[
        { ver: 'V1', label: lang === 'zh' ? '地质基础原始资料评价' : 'Base Geological assessment', author: '王工', date: '2026-07-15' },
        { ver: 'V2', label: lang === 'zh' ? '引入三维地震相控反演' : 'Superimposed 3D Inversion', author: 'AI智能体', date: '2026-07-18' },
        { ver: 'V3', label: lang === 'zh' ? '专家微调充填折减因子' : 'Expert fine-tuned rules', author: '李明', date: '2026-07-20' }
      ].map((v) => (
        <button
          key={v.ver}
          onClick={() => setActiveVersion(v.ver as any)}
          className={`px-4 py-3 rounded-2xl text-left border flex items-center justify-between transition-all cursor-pointer shadow-xs hover:shadow-sm ${
            activeVersion === v.ver 
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-100' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-1.5 py-0.5 text-[9px] font-black rounded ${activeVersion === v.ver ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{v.ver}</span>
              <span className="font-bold text-xs truncate max-w-[140px]">{v.label}</span>
            </div>
            <div className={`text-[10px] mt-1.5 ${activeVersion === v.ver ? 'text-indigo-100' : 'text-slate-400'}`}>
              {v.author} • {v.date}
            </div>
          </div>
          {activeVersion === v.ver && (
            <Check className="w-4 h-4 text-white flex-shrink-0" />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="h-full relative flex flex-col bg-slate-100/40 text-slate-800 font-sans select-none overflow-hidden" id="intelligent-target-evaluation-workspace-detail">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {evaluationSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] bg-indigo-600 border border-indigo-400 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{evaluationSuccessToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP BAR */}
      <IntelligentTargetEvaluationTopBar
        lang={lang}
        activeWorkspaceData={activeWorkspaceData}
        currentUser={currentUser}
        onBackToList={onBackToList}
        onEditCurrentWorkspace={onEditCurrentWorkspace}
        isResourcePanelOpen={isResourcePanelOpen}
        setIsResourcePanelOpen={setIsResourcePanelOpen}
        onOpenSettings={onOpenSettings}
        isAssistantOpen={isAssistantOpen}
        onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)}
        targets={Object.values(MOCK_TARGETS).map(t => ({ id: t.id, name: t.name }))}
        selectedTargetId={selectedTargetKey}
        onSelectTargetId={setSelectedTargetKey}
      />

      {/* 2. CONTENT CONTAINER */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        
        {/* Left Panel: collapsible ExplorationTargetRequirementTree */}
        <div className={`${isResourcePanelOpen ? 'w-96 border-r' : 'w-0 border-none'} h-full flex-shrink-0 z-20 shadow-lg bg-white border-slate-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}>
          <div className="w-96 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden relative">
              <ExplorationTargetRequirementTree lang={lang} onOpenAddResourcePage={onOpenAddResourcePage} />
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

        {/* Center Section: Core Business Results Display */}
        <motion.div 
          className="flex-1 min-w-0 z-0 bg-slate-50 flex flex-col overflow-hidden"
          animate={{ marginRight: isAssistantOpen ? 384 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="flex-1 relative flex flex-col overflow-y-auto p-4 space-y-4 custom-scrollbar">
            
            {/* Center Toolbar / Action Panel */}
            <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 pl-1">
                <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-slate-700">
                  {lang === 'zh' ? '智能体评价工作台 / 控制中心' : 'Agent Workspace / Evaluation Control Center'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={handleReEvaluate}
                  disabled={reEvaluating}
                  className="h-8 px-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${reEvaluating ? 'animate-spin' : ''}`} />
                  <span>{lang === 'zh' ? '重新评价' : 'Re-evaluate'}</span>
                </button>
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="h-8 px-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                  <span>{lang === 'zh' ? '补充资料' : 'Add Materials'}</span>
                </button>
                <button 
                  onClick={() => setIsRulesModalOpen(true)}
                  className="h-8 px-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 shadow-2xs"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>{lang === 'zh' ? '调整评价规则' : 'Rules Panel'}</span>
                </button>
                <button 
                  onClick={() => setIsReportModalOpen(true)}
                  className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '生成评价报告' : 'Report Output'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Six-Stage Workflow Stepper */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <GitBranch className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">{lang === 'zh' ? '通用业务评价闭环流程' : 'Universal Evaluation closed-loop Pipeline'}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{lang === 'zh' ? '以业务流程为主线、智能体全链路驱动的决策工作台' : 'Process-oriented, agent-driven expert decision workbench'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveStep(0)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeStep === 0 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
                >
                  {lang === 'zh' ? '全景视图' : 'Panorama View'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { step: 1, label: lang === 'zh' ? '① 目标建立' : '1. Target Def', icon: Award, desc: lang === 'zh' ? '定义评价任务' : 'Task Scope' },
                  { step: 2, label: lang === 'zh' ? '② 资料准备' : '2. Resource Prep', icon: FileUp, desc: lang === 'zh' ? '构建上下文' : 'Context' },
                  { step: 3, label: lang === 'zh' ? '③ 业务评价' : '3. Business Eval', icon: Compass, desc: lang === 'zh' ? '多维专业评价' : 'Multi-Eval' },
                  { step: 4, label: lang === 'zh' ? '④ 风险分析' : '4. Risk Assess', icon: AlertTriangle, desc: lang === 'zh' ? '不确定性识别' : 'Risk Map' },
                  { step: 5, label: lang === 'zh' ? '⑤ 综合判断' : '5. Comprehensive', icon: CheckCircle2, desc: lang === 'zh' ? '形成决策部署' : 'Decision' },
                  { step: 6, label: lang === 'zh' ? '⑥ 结果优化' : '6. Feedback Opt', icon: Sliders, desc: lang === 'zh' ? '灵敏度迭代' : 'Feedback' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeStep === item.step;
                  return (
                    <button
                      key={item.step}
                      onClick={() => setActiveStep(item.step)}
                      className={`p-2.5 rounded-xl border flex flex-col items-start text-left transition-all cursor-pointer select-none group ${
                        isActive 
                          ? 'bg-indigo-50/40 border-indigo-500 text-indigo-800 shadow-2xs font-extrabold ring-1 ring-indigo-500/10' 
                          : 'bg-slate-50/40 border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 w-full">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600 scale-110' : 'text-slate-400 group-hover:text-indigo-500'} transition-all`} />
                        <span className="text-[11px] font-bold truncate">{item.label}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-normal mt-1 leading-none">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STAGE-SPECIFIC DYNAMIC RENDERING */}

            {/* PANORAMA ALL-IN-ONE VIEW */}
            {activeStep === 0 && (
              <>
                {/* Target Profile Card */}
                <div className="bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 border border-indigo-100/50 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[45px] pointer-events-none group-hover:scale-125 transition-transform" />
                  
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                    <div className="text-left">
                      <div className="text-[10px] text-indigo-600 font-black tracking-widest uppercase mb-1 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>{lang === 'zh' ? '① 目标综合画像评估' : '1. Target Comprehensive Profile'}</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        {targetVersionData.name} {lang === 'zh' ? '评价结论' : 'Evaluation Profile'}
                        <span className="text-xs font-normal text-slate-400">({lang === 'zh' ? '版本' : 'Ver'} {activeVersion})</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                        {lang === 'zh' 
                          ? '本智能画像整合了地质、物探、钻井工程可行性以及区域经济边际效益，由 AI 核心推理链结合实钻井规则生成。'
                          : 'This smart profile is generated via structural AI reasoning chains integrating geology, geophysics, drilling, and NPV parameters.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/80 p-3.5 rounded-xl border border-slate-100 shadow-2xs self-stretch lg:self-auto items-center justify-items-stretch">
                      <div className="text-center px-2 border-r border-slate-100">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'zh' ? '推荐评级' : 'Recommend Grade'}</div>
                        <div className="flex items-center justify-center gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                              key={star} 
                              className={`text-xs ${star <= targetVersionData.recommendationStars ? 'text-amber-400' : 'text-slate-200'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-center px-2 border-r border-slate-100">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'zh' ? '综合风险' : 'Integrated Risk'}</div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black mt-1 ${
                          targetVersionData.riskColor === 'rose' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          targetVersionData.riskColor === 'amber' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {targetVersionData.riskText}
                        </span>
                      </div>
                      <div className="text-center px-2 border-r border-slate-100">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'zh' ? '地质成功率 Pg' : 'Geologic Success Pg'}</div>
                        <div className="text-xs font-black text-slate-800 mt-1.5">
                          {targetVersionData.geoScore - 40}%
                        </div>
                      </div>
                      <div className="text-center px-2">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'zh' ? '经济NPV(70美金)' : 'NPV @$70'}</div>
                        <div className="text-xs font-black text-emerald-600 mt-1.5">
                          {(targetVersionData.geoScore * 0.05 - 1.2).toFixed(2)} {lang === 'zh' ? '亿元' : 'B CNY'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Evaluation Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  
                  {/* Geological Evaluation Card */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-4.5 flex flex-col shadow-xs hover:border-indigo-100 transition-colors">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Compass className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">{lang === 'zh' ? '③ 地质与业务多维评价' : '3. Geological Evaluation'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold">{lang === 'zh' ? '评分：' : 'Score:'}</span>
                        <span className="text-sm font-black text-indigo-600">{targetVersionData.geoScore}</span>
                      </div>
                    </div>

                    <div className="mt-3.5 space-y-2.5 flex-1 text-left">
                      {[
                        { name: lang === 'zh' ? '烃源条件' : 'Source Rock', stars: targetVersionData.subScores.source, desc: lang === 'zh' ? '深生烃源充沛，进入晚期成熟' : 'Abundant mature source rock' },
                        { name: lang === 'zh' ? '储层条件' : 'Reservoir Quality', stars: targetVersionData.subScores.reservoir, desc: lang === 'zh' ? '埋深超深致密，受裂缝缝洞网控制' : 'Fracture/vug system in ultra depth' },
                        { name: lang === 'zh' ? '盖层条件' : 'Seal Integrity', stars: targetVersionData.subScores.caprock, desc: lang === 'zh' ? '上泥质盖层封闭强，无微渗隐患' : 'Thick shale seals with no gas shows' },
                        { name: lang === 'zh' ? '圈闭条件' : 'Trap Closure', stars: targetVersionData.subScores.trap, desc: lang === 'zh' ? '复杂走滑断裂，边界及溢漏点待敲定' : 'Intricate strike-slip fault branches' },
                        { name: lang === 'zh' ? '保存条件' : 'Preservation', stars: targetVersionData.subScores.preservation, desc: lang === 'zh' ? '垂向断层导通遮挡具有明显局限性' : 'Vertical faults cause transport leaks' }
                      ].map((item, i) => (
                        <div key={i} className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col gap-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">{item.name}</span>
                            <div className="flex text-[9px] text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <span key={s} className={s <= item.stars ? 'text-amber-400' : 'text-slate-200'}>★</span>
                              ))}
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 truncate">{item.desc}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-100 text-left">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{lang === 'zh' ? '分析逻辑及依据证据' : 'AI Reasoning Chain'}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <p><strong>{lang === 'zh' ? '过程：' : 'Process: '}</strong>{lang === 'zh' ? '深度缝洞相控反演，对比走滑断裂错动阻隔。' : 'Acoustic impedance inversion and fault seal factors.'}</p>
                        <p className="mt-1"><strong>{lang === 'zh' ? '依据：' : 'Basis: '}</strong>{lang === 'zh' ? '分支缝倾角大，易发生垂向导通，老版本扣减圈闭分。' : 'Steep faults prompt top leakage concerns in older versions.'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Engineering Feasibility Card */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-4.5 flex flex-col shadow-xs hover:border-indigo-100 transition-colors">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Sliders className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">{lang === 'zh' ? '③ 工程可行性评价' : '3. Engineering Feasibility'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold">{lang === 'zh' ? '可行性：' : 'Feasibility:'}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          targetVersionData.feasibilityColor === 'rose' ? 'bg-rose-50 text-rose-600' :
                          targetVersionData.feasibilityColor === 'amber' ? 'bg-amber-50 text-amber-600' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          {targetVersionData.feasibility}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3.5 flex-1 space-y-3 text-left">
                      <div className="bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100/30 text-[11px] text-slate-600 leading-relaxed">
                        <div className="font-bold text-indigo-600 mb-0.5">{lang === 'zh' ? '主要施工阻碍项' : 'Drilling Impedance Items'}</div>
                        {lang === 'zh' ? '超深井（>8200米）高温、高压，对套管抗拉强度与钻井液抗温提出挑战。' : 'Deep well (>8200m) demands heavy drill strings & specialized fluids.'}
                      </div>

                      <div className="space-y-2">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{lang === 'zh' ? '三大核心技术风险' : 'Top 3 Engineering Risks'}</div>
                        {targetVersionData.engineeringRisks.map((risk, idx) => (
                          <div key={idx} className="flex gap-2.5 items-start bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <span className="w-4 h-4 rounded-full bg-rose-50 text-rose-600 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-xs text-slate-600 leading-normal">{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-100 text-left text-[11px] space-y-1 text-slate-500">
                      <div className="flex justify-between">
                        <span>{lang === 'zh' ? '机械钻速 ROP' : 'Avg Drilling ROP'}</span>
                        <span className="font-bold text-slate-700">2.4 m/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{lang === 'zh' ? '复杂地表干扰指数' : 'Surfacing Factor'}</span>
                        <span className="font-bold text-slate-700">High / 85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{lang === 'zh' ? '邻区实钻借鉴井' : 'Offset Wells Reference'}</span>
                        <span className="font-bold text-slate-700">SB-501, SB-503D</span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Evaluation Card */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-4.5 flex flex-col shadow-xs hover:border-indigo-100 transition-colors">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">{lang === 'zh' ? '④ 综合风险细分评估' : '4. Integrated Risk Breakdown'}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 font-black text-slate-500">
                        {lang === 'zh' ? '多维度' : 'Multi-factor'}
                      </span>
                    </div>

                    <div className="mt-3.5 flex-1 flex flex-col justify-around gap-2 text-left">
                      {[
                        { name: lang === 'zh' ? '1. 地质风险 (Geology)' : '1. Geology Risk', level: targetVersionData.riskLevels.geology, color: targetVersionData.riskLevels.geology === '高' ? 'rose' : 'amber' },
                        { name: lang === 'zh' ? '2. 工程技术风险 (Engineering)' : '2. Engineering Risk', level: targetVersionData.riskLevels.engineering, color: 'amber' },
                        { name: lang === 'zh' ? '3. 安全环保风险 (HSE)' : '3. Safety & HSE Risk', level: targetVersionData.riskLevels.hse, color: 'emerald' },
                        { name: lang === 'zh' ? '4. 财务效益风险 (Economy)' : '4. Economic Risk', level: targetVersionData.riskLevels.economy, color: 'amber' }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600">{item.name}</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            item.color === 'rose' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            item.color === 'amber' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {item.level}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-100 text-left bg-rose-50/30 border border-rose-100/50 p-2.5 rounded-xl flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        <strong>{lang === 'zh' ? '警报：' : 'Warning: '}</strong>
                        {lang === 'zh' ? '若沙雅深层断裂错位>22米，本井存在 25% 的流体逸散水侵风险。' : 'Offsets >22m can trigger fluid invasion.'}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Comprehensive Evaluation Conclusion */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs text-left">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      {lang === 'zh' ? '⑤ 综合评价核心结论与决策' : '5. Integrated Evaluation Conclusions'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold">{lang === 'zh' ? '推荐等级：' : 'Recommendation:'}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black">
                        {lang === 'zh' ? '谨慎推荐' : 'Prudent Recommendation'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="text-xs font-bold text-emerald-600 mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {lang === 'zh' ? '主要优势 (Pros)' : 'Main Advantages'}
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-600 list-decimal list-inside">
                        {targetVersionData.pros.map((p, idx) => (
                          <li key={idx} className="leading-relaxed">{p}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="text-xs font-bold text-rose-600 mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        {lang === 'zh' ? '主要风险及劣势 (Risks/Cons)' : 'Main Risks & Cons'}
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-600 list-decimal list-inside">
                        {targetVersionData.cons.map((c, idx) => (
                          <li key={idx} className="leading-relaxed">{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-indigo-50/20 p-3.5 rounded-xl border border-indigo-100/40">
                      <div className="text-xs font-bold text-indigo-600 mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        {lang === 'zh' ? '下一步建议措施' : 'Next Step Suggestions'}
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                        {targetVersionData.suggestions.map((s, idx) => (
                          <li key={idx} className="leading-relaxed">{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* STAGE 1: ① 目标建立 (Target Definition) */}
            {activeStep === 1 && (
              <div className="space-y-4 text-left">
                <div className="bg-gradient-to-br from-indigo-50/30 to-blue-50/30 border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">{lang === 'zh' ? '阶段 ①：评价目标与维度定义' : 'Stage 1: Target & Task Scope Definition'}</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {lang === 'zh' 
                      ? '本智能体在工作区初始化时，已自动关联待评价对象，并根据《SY/T 5732 圈闭评价规范》自动建立以下标准评价场景。'
                      : 'The agent has automatically matched the evaluation target object and established standard scopes based on industrial standards.'}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3 shadow-2xs">
                      <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block border-b border-slate-100 pb-1.5">{lang === 'zh' ? '评价对象核心参数' : 'Target Target Core parameters'}</span>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block">{lang === 'zh' ? '评价对象名称' : 'Target Name'}</span>
                          <span className="font-bold text-slate-800">{targetVersionData.name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">{lang === 'zh' ? '地理区块' : 'Geographic Block'}</span>
                          <span className="font-bold text-slate-800">{lang === 'zh' ? '塔里木盆地顺北5号带' : 'Tarim Basin SB-5'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">{lang === 'zh' ? '勘探阶段' : 'Exploration Phase'}</span>
                          <span className="font-bold text-slate-800">{lang === 'zh' ? '风险勘探 / 预探阶段' : 'Risk Exploration'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">{lang === 'zh' ? '目的层系' : 'Target Formation'}</span>
                          <span className="font-bold text-slate-800">{lang === 'zh' ? '奥陶系一区一阶一维' : 'Ordovician Fault System'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3 shadow-2xs">
                      <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block border-b border-slate-100 pb-1.5">{lang === 'zh' ? '评价依据与范围' : 'Evaluation Bounds & Spec'}</span>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block">{lang === 'zh' ? '采用行业标准' : 'Standard Applied'}</span>
                          <span className="font-bold text-slate-800">SY/T 5732-2020</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">{lang === 'zh' ? '评价目的' : 'Evaluation Goal'}</span>
                          <span className="font-bold text-slate-800 truncate">{lang === 'zh' ? '明确断裂保存及钻孔部署' : 'Seal integrity & well deployment'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">{lang === 'zh' ? '三维断裂覆盖' : 'Seismic 3D Cov'}</span>
                          <span className="font-bold text-slate-800">1,240 km²</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">{lang === 'zh' ? '专家控制规则数' : 'Expert rules count'}</span>
                          <span className="font-bold text-slate-800">14 {lang === 'zh' ? '条活跃' : 'Active'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                    <Brain className="w-4 h-4 text-indigo-500" />
                    {lang === 'zh' ? '智能体自适应子任务拆解' : 'Agent Sub-task Auto-Decomposition'}
                  </span>
                  <div className="space-y-2.5">
                    {[
                      { title: lang === 'zh' ? '任务A: 多源地质测井、地震解释数据对齐' : 'Task A: Geologic Logs & Seismic Align', desc: lang === 'zh' ? '读取.segy及.las，自动重采样井斜并对齐三维储层层位深度。' : 'Load and resample curves in line with 3D seismic horizon.', done: true },
                      { title: lang === 'zh' ? '任务B: 断裂密封公式计算及折减评分' : 'Task B: Fault Sealing Computation', desc: lang === 'zh' ? '计算走滑断层水平/垂向错断距离，触发专家阈值阻抗折减公式。' : 'Calculate slip displacement and trigger sealing scaling factor.', done: true },
                      { title: lang === 'zh' ? '任务C: 工程阻抗与超深温度载荷模拟' : 'Task C: HPHT well friction simulation', desc: lang === 'zh' ? '结合邻井实钻，推算目的层高温高压条件下的套管机械拉力冗余系数。' : 'Deduce casing stress factors under extreme 8000m depth temperature.', done: true },
                      { title: lang === 'zh' ? '任务D: Pg 概率与财务 NPV 敏感度联合仿真' : 'Task D: Pg & Economic Sensitivity Simulation', desc: lang === 'zh' ? '综合五大地质条件，进行5000次蒙特卡洛地质成功率及NPV财务敏感计算。' : 'Execute 5000 Monte Carlo runs to couple Pg and Oil Price curves.', done: true }
                    ].map((task, i) => (
                      <div key={i} className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100/60">
                        <div className="w-5 h-5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{task.title}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{task.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 2: ② 资料准备 (Resource Preparation) */}
            {activeStep === 2 && (
              <div className="space-y-4 text-left">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                    <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <FileUp className="w-4 h-4 text-indigo-600" />
                      {lang === 'zh' ? '已加载评价资源清单与智能对齐状态' : 'Loaded Resource Files & Alignment Quality'}
                    </span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {lang === 'zh' ? '数据完整度：85%' : 'Completeness: 85%'}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { name: 'SB-5_Seismic_Inversion_Full.segy', type: lang === 'zh' ? '三维地震属性体' : '3D Seismic Volume', size: '12.4 GB', match: '100%', status: lang === 'zh' ? '完全对齐' : 'Fully Aligned', color: 'indigo' },
                      { name: 'SB-501_structural_logs_V3.las', type: lang === 'zh' ? '邻区井段实钻测井' : 'Wireline Well Logs', size: '154 MB', match: '95%', status: lang === 'zh' ? '深度对齐' : 'Matched', color: 'emerald' },
                      { name: 'SB-5_Fault_System_Tectonics.dwg', type: lang === 'zh' ? '走滑断裂层系成果' : 'Fault Structure Map', size: '42 MB', match: '100%', status: lang === 'zh' ? '完全融合' : 'Fully Fused', color: 'blue' }
                    ].map((file, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded bg-white border border-slate-100 flex items-center justify-center text-slate-500">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">{file.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{file.type} • {file.size}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="text-right">
                            <span className="text-slate-400 block text-[9px] uppercase">{lang === 'zh' ? '重采样匹配' : 'Match quality'}</span>
                            <span className="font-extrabold text-indigo-600">{file.match}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 block text-[9px] uppercase">{lang === 'zh' ? '智能体状态' : 'Agent Status'}</span>
                            <span className="font-bold text-emerald-600">✓ {file.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Warning: missing critical electrical micro-image log (FMI) */}
                  <div className="mt-4 bg-amber-50/50 border border-amber-100 p-3.5 rounded-xl flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-amber-900">{lang === 'zh' ? '提醒：缺少高分辨率电成像测井成果' : 'Notice: High-res electric micro-image log is missing'}</h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                        {lang === 'zh' 
                          ? '智能体检测到未载入顺北501井微观电成像资料（FMI），对碳酸盐岩溶洞裂缝发育密度预测可能存在 10% 误差。您可以通过“补充资料”一键上传或绑定。'
                          : 'FMI log is absent. This might introduce a 10% margin of error in cavern reservoir density prediction.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50/10 border border-indigo-100/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <span className="text-xs text-slate-600 font-bold leading-normal">
                      {lang === 'zh' ? '觉得评价参数不够完整？立即补充或者绑定新上传的文件' : 'Want to enrich evaluation inputs? Upload supplementary LAS/DWG now.'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '补充目标资料' : 'Upload materials'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 3: ③ 业务评价 (Evaluate Business) */}
            {activeStep === 3 && (
              <div className="space-y-4 text-left">
                <div className="bg-indigo-50/35 border border-indigo-100/40 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Compass className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">{lang === 'zh' ? '阶段 ③：多维专业业务评价指标' : 'Stage 3: Multi-Dimensional Professional Evaluation'}</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {lang === 'zh' 
                      ? '智能体在此阶段执行全套复杂力学与成藏分析，下面是地质指标和工程技术指标两个维度的深度展开。'
                      : 'At this stage, the agent executes full migration modeling and wellbore mechanics analysis.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Detailed Geology Card */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-indigo-600" />
                        {lang === 'zh' ? '地质条件分析维度（5项）' : 'Geological Attributes (5 items)'}
                      </span>
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{targetVersionData.geoScore} {lang === 'zh' ? '分' : 'Pts'}</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { name: lang === 'zh' ? '烃源条件 (Source Rock)' : 'Source Rock', stars: targetVersionData.subScores.source, desc: lang === 'zh' ? '寒武系深层生烃大、排烃历史充沛，晚期高产成熟。' : 'High mature deep organic carbon with great discharge history.' },
                        { name: lang === 'zh' ? '储层物性 (Reservoir)' : 'Reservoir', stars: targetVersionData.subScores.reservoir, desc: lang === 'zh' ? '奥陶系埋深特深碳酸盐岩，以大型溶洞、断裂裂缝缝洞相控为主。' : 'Controlled by vugs and faults network in Ordovician ultra depth.' },
                        { name: lang === 'zh' ? '主力盖层 (Seal)' : 'Seal', stars: targetVersionData.subScores.caprock, desc: lang === 'zh' ? '盖层厚度：184米，完全无渗漏性微裂纹，极佳阻滞区。' : '184m caprock thickness, perfect blockage with no micro-fractures.' },
                        { name: lang === 'zh' ? '圈闭闭合 (Trap)' : 'Trap', stars: targetVersionData.subScores.trap, desc: lang === 'zh' ? '走滑断相交叉面走向倾角陡峭，局部溢留点仍需精细三维物探校正。' : 'Steep strike-slip fault slope requires fine 3D seismic calibration.' },
                        { name: lang === 'zh' ? '保存完整 (Preservation)' : 'Preservation', stars: targetVersionData.subScores.preservation, desc: lang === 'zh' ? '垂向多期走滑，高压充水存在侧向液压不平衡溢流。' : 'Multi-stage faults present risk of lateral hydrodynamic imbalance.' }
                      ].map((attr, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700">{attr.name}</span>
                            <div className="flex text-xs text-amber-400">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} className={s <= attr.stars ? 'text-amber-400' : 'text-slate-200'}>★</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 leading-normal">{attr.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Engineering Card */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-indigo-600" />
                        {lang === 'zh' ? '工程可行性技术维度' : 'Engineering Feasibility Specs'}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        targetVersionData.feasibilityColor === 'rose' ? 'bg-rose-50 text-rose-600' :
                        targetVersionData.feasibilityColor === 'amber' ? 'bg-amber-50 text-amber-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>{targetVersionData.feasibility}</span>
                    </div>

                    <div className="bg-indigo-50/20 border border-indigo-100/30 p-3.5 rounded-xl space-y-2">
                      <h5 className="text-xs font-bold text-indigo-950">{lang === 'zh' ? '物理力学载荷估计' : 'Physical & Mechanical Load Estimation'}</h5>
                      <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600">
                        <div>
                          <span>{lang === 'zh' ? '主力目的层埋深' : 'Target Target Depth'}</span>
                          <strong className="block text-slate-800 mt-0.5">8,240 m</strong>
                        </div>
                        <div>
                          <span>{lang === 'zh' ? '最高孔隙流体压力' : 'Pore Fluid Pressure'}</span>
                          <strong className="block text-slate-800 mt-0.5">94.2 MPa</strong>
                        </div>
                        <div>
                          <span>{lang === 'zh' ? '地层极限高温度' : '极限 BHT'}</span>
                          <strong className="block text-slate-800 mt-0.5">172 °C</strong>
                        </div>
                        <div>
                          <span>{lang === 'zh' ? '预计套管抗拉裕度' : 'Casing Tensile Margin'}</span>
                          <strong className="block text-emerald-600 mt-0.5">1.35 {lang === 'zh' ? '(高安全)' : '(Safe)'}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">{lang === 'zh' ? '工程技术三大核心难点' : 'Drilling Technical Challenges'}</span>
                      {targetVersionData.engineeringRisks.map((risk, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex gap-2.5 items-start">
                          <span className="w-4 h-4 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{idx + 1}</span>
                          <span className="text-xs text-slate-600 leading-normal">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* STAGE 4: ④ 风险分析 (Risk Assessment) */}
            {activeStep === 4 && (
              <div className="space-y-4 text-left">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                    <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-indigo-600" />
                      {lang === 'zh' ? '阶段 ④：4大维度风险细分与专家减免预案' : 'Stage 4: Risk Register & Prevention Controls'}
                    </span>
                    <span className="text-xs text-rose-600 bg-rose-50 border border-rose-100 font-black px-2 py-0.5 rounded">
                      {lang === 'zh' ? '高风险警告' : 'High Risk Alert'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { 
                        area: lang === 'zh' ? '地质成藏风险 (Geology)' : 'Geology Risk', 
                        level: targetVersionData.riskLevels.geology, 
                        desc: lang === 'zh' ? '走滑断相分枝渗漏，多期地层应力不平衡导致部分层位有溢流风险。' : 'Fault leakages along strike-slip splays.',
                        action: lang === 'zh' ? '对策：利用三维地震频段开展断层两盘交叉密封敏感性数值计算。' : 'Action: numerical simulations on cross-fault seal parameters.',
                        color: targetVersionData.riskLevels.geology === '高' ? 'rose' : 'amber' 
                      },
                      { 
                        area: lang === 'zh' ? '工程施工风险 (Engineering)' : 'Engineering Risk', 
                        level: targetVersionData.riskLevels.engineering, 
                        desc: lang === 'zh' ? '埋深超8200米，深层钻井易发生井斜大、钻头寿命短、卡钻等特种复杂故障。' : 'Excessive torque drag, bit wear, and high BHT challenges.',
                        action: lang === 'zh' ? '对策：采用高硬度金刚石孕镶钻头，加入纳米润滑剂及新型高温钻井泥浆。' : 'Action: apply high-temp drilling muds and nano-lubricants.',
                        color: 'amber' 
                      },
                      { 
                        area: lang === 'zh' ? '安全与HSE合规风险 (HSE)' : 'HSE Compliance', 
                        level: targetVersionData.riskLevels.hse, 
                        desc: lang === 'zh' ? '局部含有酸性硫化氢气，对管鞋材质有腐蚀危险。' : 'Potential acidic H2S gas flow can corrode casings.',
                        action: lang === 'zh' ? '对策：井口配置自动脱硫装置、井筒防硫保护套，选用特种高合金防腐油管。' : 'Action: equip well with anti-H2S nickel alloys.',
                        color: 'emerald' 
                      },
                      { 
                        area: lang === 'zh' ? '财务经济效益风险 (Economy)' : 'Economic Risk', 
                        level: targetVersionData.riskLevels.economy, 
                        desc: lang === 'zh' ? '特超深单井建设投资偏大，若油价低于65美金/桶将导致折算财务回收周期拉长。' : 'Ultra-deep well drilling raises capital requirements.',
                        action: lang === 'zh' ? '对策：执行大斜度水平评价井，增加井周单筒一井多靶多向开采。' : 'Action: use directional side-track drilling.',
                        color: 'amber' 
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-800">{item.area}</span>
                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                              item.color === 'rose' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                              item.color === 'amber' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}>{item.level}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-normal">{item.desc}</p>
                          <div className="text-[11px] text-indigo-600 font-medium bg-indigo-50/20 p-2 rounded border border-indigo-100/10 mt-1">{item.action}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 5: ⑤ 综合判断 (Make Judgement) */}
            {activeStep === 5 && (
              <div className="space-y-4 text-left">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">{lang === 'zh' ? '阶段 ⑤：综合决策部署卡' : 'Stage 5: Comprehensive Decision Brief'}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between h-32">
                      <span className="text-slate-400 font-bold block">{lang === 'zh' ? '核心推荐星级' : 'Decision Recommend Grade'}</span>
                      <div className="flex items-center gap-0.5 my-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={`text-lg ${star <= targetVersionData.recommendationStars ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500">{lang === 'zh' ? '推荐等级：谨慎推荐勘探' : 'Grade: Prudent Recommendation'}</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between h-32">
                      <span className="text-slate-400 font-bold block">{lang === 'zh' ? '估算地质Pg概率' : 'Estimated Geological Pg'}</span>
                      <div className="text-2xl font-black text-slate-800 my-1">
                        {targetVersionData.geoScore - 40}%
                      </div>
                      <span className="text-[10px] text-indigo-600 font-medium">{lang === 'zh' ? '已结合构造完整度进行折减修正' : 'Modified with tectonic seal multipliers'}</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between h-32">
                      <span className="text-slate-400 font-bold block">{lang === 'zh' ? '财务估算可回收NPV' : 'Financial Expected NPV'}</span>
                      <div className="text-2xl font-black text-emerald-600 my-1">
                        {(targetVersionData.geoScore * 0.05 - 1.2).toFixed(2)} {lang === 'zh' ? '亿元' : 'B CNY'}
                      </div>
                      <span className="text-[10px] text-slate-500">{lang === 'zh' ? '按国际油价70美金/桶计算' : 'Calculated at $70/bbl oil price'}</span>
                    </div>
                  </div>

                  <div className="bg-indigo-50/20 border border-indigo-100/30 p-4 rounded-xl space-y-2 text-xs text-slate-600">
                    <span className="font-bold text-slate-900 block">{lang === 'zh' ? 'AI 智能体推荐首口井钻探部署方案' : 'AI Agent Recommended 1st Drilling Coordinates'}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white p-2.5 rounded border border-slate-100">
                        <span className="text-slate-400 text-[10px] block">{lang === 'zh' ? '建议部署井眼坐标' : 'Proposed Well Coordinates'}</span>
                        <strong className="text-slate-800 block mt-0.5">X: 38472911.2, Y: 4392812.5</strong>
                      </div>
                      <div className="bg-white p-2.5 rounded border border-slate-100">
                        <span className="text-slate-400 text-[10px] block">{lang === 'zh' ? '建议设计垂深' : 'Target Well Depth'}</span>
                        <strong className="text-slate-800 block mt-0.5">8,240 {lang === 'zh' ? '米' : 'meters'}</strong>
                      </div>
                      <div className="bg-white p-2.5 rounded border border-slate-100">
                        <span className="text-slate-400 text-[10px] block">{lang === 'zh' ? '预测初期平均日产规模' : 'Estimated Daily Capacity'}</span>
                        <strong className="text-emerald-600 block mt-0.5">65{lang === 'zh' ? '吨/天 (轻质油)' : ' t/d (Light Crude)'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compile standard reports button card */}
                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-left space-y-1">
                    <h5 className="text-xs font-bold text-slate-900">{lang === 'zh' ? '决策报告一键成果汇签' : 'One-Click Decision Report Compile'}</h5>
                    <p className="text-[10px] text-slate-400 leading-normal max-w-xl">
                      {lang === 'zh' 
                        ? '支持一键将本工作区中的评价参数、灵敏度测试结果、风险防范对策以及可信AI证据链，打包生成符合国家勘探标准规范的汇签成果报告(Word格式)。'
                        : 'Generate standard comprehensive report incorporating sensitivity results and trust evidence.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsReportModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-emerald-100 flex items-center gap-1.5 transition-all whitespace-nowrap self-start sm:self-auto"
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === 'zh' ? '生成成果报告' : 'Generate Report'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 6: ⑥ 结果优化 (Feedback Optimization) */}
            {activeStep === 6 && (
              <div className="space-y-4 text-left">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Sliders className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">{lang === 'zh' ? '阶段 ⑥：专家干预规则与阈值敏感性调整' : 'Stage 6: Expert Control Rules & Sensitivity Optimization'}</h3>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {lang === 'zh' 
                      ? '支持勘探专家人工修改下方的敏感性折减公式和物理阈值边界，智能体将实时重新评估全链路的参数，实现闭环持续迭代。'
                      : 'Allows expert intervention on sealing factors and physical limits. The agent recalculates values dynamically.'}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Slider 1 */}
                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100/80">
                      <div className="flex justify-between font-bold text-slate-700 text-xs">
                        <span>{lang === 'zh' ? '走滑断层水平错断因子' : 'Strike-slip Sealing Factor'}</span>
                        <span className="text-indigo-600 font-extrabold">{ruleFaultSealing}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={ruleFaultSealing}
                        onChange={(e) => setRuleFaultSealing(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="text-[10px] text-slate-400 leading-normal mt-1">
                        {lang === 'zh' ? '值越高，对因多期错位引起的微渗漏折减评分惩罚越小。' : 'Controls penalty sensitivity of fault leaks.'}
                      </div>
                    </div>

                    {/* Slider 2 */}
                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100/80">
                      <div className="flex justify-between font-bold text-slate-700 text-xs">
                        <span>{lang === 'zh' ? '深层成岩孔隙充填因子' : 'Source Rock Dissolution Factor'}</span>
                        <span className="text-indigo-600 font-extrabold">0.{ruleReservoirFactor}</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="99" 
                        value={ruleReservoirFactor}
                        onChange={(e) => setRuleReservoirFactor(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="text-[10px] text-slate-400 leading-normal mt-1">
                        {lang === 'zh' ? '影响高压溶孔充填系数。系数越高，预测物性空间越好。' : 'Tunes filling modifiers in pore modeling.'}
                      </div>
                    </div>

                    {/* Slider 3 */}
                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100/80">
                      <div className="flex justify-between font-bold text-slate-700 text-xs">
                        <span>{lang === 'zh' ? '盖层临界密封判定厚度' : 'Seal Critical Thickness'}</span>
                        <span className="text-indigo-600 font-extrabold">{ruleCaprockThickness} m</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="300" 
                        value={ruleCaprockThickness}
                        onChange={(e) => setRuleCaprockThickness(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="text-[10px] text-slate-400 leading-normal mt-1">
                        {lang === 'zh' ? '盖层实测厚度若低于此临界值，保存条件评分扣减。' : 'Forces savings deduction if thickness falls below limit.'}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button 
                      onClick={handleReEvaluate}
                      disabled={reEvaluating}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-100 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${reEvaluating ? 'animate-spin' : ''}`} />
                      <span>{lang === 'zh' ? '重算并更新评价链 (V3)' : 'Apply & Recalculate'}</span>
                    </button>
                  </div>
                </div>

                {/* History version comparison */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs text-left">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    {lang === 'zh' ? '历史评价版本对比（全链路可追溯）' : 'History Versions Comparison (Fully Auditable)'}
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { ver: 'V1', label: lang === 'zh' ? '初始基础资料评价' : 'Base Geological assessment', author: lang === 'zh' ? '王工' : 'Engineer Wang', date: '2026-07-15' },
                      { ver: 'V2', label: lang === 'zh' ? '引入三维相控物探解释' : 'Superimposed 3D Inversion', author: 'AI智能体', date: '2026-07-18' },
                      { ver: 'V3', label: lang === 'zh' ? '专家微调孔隙/断裂因子' : 'Expert fine-tuned rules', author: lang === 'zh' ? '李工' : 'Engineer Li', date: '2026-07-20' }
                    ].map((v) => (
                      <button
                        key={v.ver}
                        onClick={() => {
                          setActiveVersion(v.ver as any);
                          triggerToast(lang === 'zh' ? `已切换到评价版本: ${v.ver}` : `Switched to ${v.ver}`);
                        }}
                        className={`p-3.5 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer shadow-2xs ${
                          activeVersion === v.ver 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-100' 
                            : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.2 text-[9px] font-black rounded ${activeVersion === v.ver ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{v.ver}</span>
                            <span className="font-bold text-xs truncate max-w-[130px]">{v.label}</span>
                          </div>
                          <div className={`text-[10px] mt-1.5 ${activeVersion === v.ver ? 'text-indigo-100' : 'text-slate-400'}`}>
                            {v.author} • {v.date}
                          </div>
                        </div>
                        {activeVersion === v.ver && (
                          <Check className="w-4 h-4 text-white flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </motion.div>

        {/* 3. ASSISTANT SIDEBAR (Absolute positioned drawer) */}
        <AssistantSidebar
          lang={lang}
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
          agentName={lang === 'zh' ? '勘探目标评价智能体' : 'Exploration Target Evaluation Agent'}
          agentStatus={reEvaluating ? 'Running' : 'Idle'}
          mode="absolute"
          offsetTop="top-0"
          onRefreshAgent={handleReEvaluate}
        />
      </div>

      {/* 4. COLLAPSIBLE BOTTOM PANEL (Exact style reference to EvidenceChainPanel) */}
      <div className="w-full flex-shrink-0 bg-white border-t border-slate-200 flex flex-col shadow-[0_-12px_40px_rgba(0,0,0,0.06)] relative z-[30]">
        <div 
          className="h-12 flex items-center justify-between px-6 cursor-pointer bg-slate-900 text-white hover:bg-slate-800 transition-colors border-b border-white/10 w-full"
          onClick={() => setIsEvidenceExpanded(!isEvidenceExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-tight shadow-sm">
              <i className="fas fa-shield-alt"></i>
              <span>{lang === 'zh' ? '可信AI' : 'TRUSTABLE AI'}</span>
            </div>
            <h3 className="text-sm font-bold">
              {lang === 'zh' ? '证据链与运行状态' : 'Evidence Chain & Run Status'}
            </h3>
          </div>
          <i className={`fas ${isEvidenceExpanded ? 'fa-chevron-down' : 'fa-chevron-up'} text-xs text-slate-400`}></i>
        </div>
        
        <AnimatePresence>
          {isEvidenceExpanded && (
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 320 }}
              exit={{ height: 0 }}
              className="overflow-hidden flex flex-col"
            >
              <div className="flex border-b border-slate-200 bg-slate-100 px-4">
                 {[
                   { id: 'evidence', name: '评价可信证据链', enName: 'Decision Evidence Chain', icon: 'fa-link' },
                   { id: 'logs', name: 'Agent 运行步骤', enName: 'Agent Steps Log', icon: 'fa-terminal' },
                   { id: 'versions', name: '历史评价版本', enName: 'History Versions', icon: 'fa-history' },
                 ].map(tab => (
                   <button
                     key={tab.id}
                     onClick={() => setActiveEvidenceTab(tab.id as any)}
                     className={`px-4 h-10 text-xs font-bold transition-all relative flex items-center gap-2 ${activeEvidenceTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     <i className={`fas ${tab.icon} text-xs`}></i>
                     {lang === 'zh' ? tab.name : tab.enName}
                     {activeEvidenceTab === tab.id && (
                       <motion.div 
                         layoutId="activeEvidenceTabUnderline"
                         className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                       />
                     )}
                   </button>
                 ))}
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white p-4">
                 {activeEvidenceTab === 'evidence' && renderEvidenceTab()}
                 {activeEvidenceTab === 'logs' && renderLogsTab()}
                 {activeEvidenceTab === 'versions' && renderVersionsTab()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- MODAL DIALOGS (Light styled) --- */}
      
      {/* 1. RULE ADJUSTMENT MODAL */}
      <AnimatePresence>
        {isRulesModalOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRulesModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="relative w-full max-w-md bg-white border-l border-slate-200 h-full p-6 flex flex-col justify-between text-left shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <span className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-600" />
                    {lang === 'zh' ? '评价规则库及阈值调整' : 'Evaluation Rules & Thresholds'}
                  </span>
                  <button 
                    onClick={() => setIsRulesModalOpen(false)}
                    className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-6 text-xs text-slate-600">
                  <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/40">
                    <div className="font-bold text-indigo-900 mb-1">{lang === 'zh' ? '规则定义机制' : 'Rules Engine Spec'}</div>
                    <p className="text-indigo-950/80 leading-relaxed">
                      {lang === 'zh' 
                        ? '调整下方滑块将即时修改评价智能体对断裂密封和储集物性敏感性的折减公式，并会在重新评估时应用于全流程计算。'
                        : 'Adjusting these sliders updates the scaling formula applied by the evaluation agent in real-time.'}
                    </p>
                  </div>

                  {/* Slider 1 */}
                  <div className="space-y-2">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{lang === 'zh' ? '走滑断裂遮挡判定因子' : 'Strike-slip Sealing Factor'}</span>
                      <span className="text-indigo-600 font-extrabold">{ruleFaultSealing}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={ruleFaultSealing}
                      onChange={(e) => setRuleFaultSealing(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="text-[10px] text-slate-400 leading-normal">
                      {lang === 'zh' ? '影响圈闭评价中的断坪连通封闭计算权，值越高对微断层漏失惩罚越低。' : 'Controls penalty sensitivity of micro-fault leaks.'}
                    </div>
                  </div>

                  {/* Slider 2 */}
                  <div className="space-y-2">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{lang === 'zh' ? '烃源岩溶蚀折减折旧率' : 'Source Rock Dissolution Factor'}</span>
                      <span className="text-indigo-600 font-extrabold">0.{ruleReservoirFactor}</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="99" 
                      value={ruleReservoirFactor}
                      onChange={(e) => setRuleReservoirFactor(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="text-[10px] text-slate-400 leading-normal">
                      {lang === 'zh' ? '影响储层孔隙计算模型的充填修正。数值越高，预测的物性空间越好。' : 'Tunes filling modifiers in deep reservoir pores modeling.'}
                    </div>
                  </div>

                  {/* Slider 3 */}
                  <div className="space-y-2">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{lang === 'zh' ? '主力盖层临界密封厚度' : 'Seal Critical Thickness'}</span>
                      <span className="text-indigo-600 font-extrabold">{ruleCaprockThickness} m</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="300" 
                      value={ruleCaprockThickness}
                      onChange={(e) => setRuleCaprockThickness(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="text-[10px] text-slate-400 leading-normal">
                      {lang === 'zh' ? '盖层厚度低于此临界值时将强制扣减保存评分。推荐在100-150m。' : 'Forces savings deduction if caprock thickness falls below limit.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-6 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setIsRulesModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold text-xs rounded-xl transition-all cursor-pointer text-center border border-slate-100"
                >
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button 
                  onClick={() => {
                    setIsRulesModalOpen(false);
                    handleReEvaluate();
                  }}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-100 cursor-pointer text-center"
                >
                  {lang === 'zh' ? '应用并重新评估' : 'Apply & Re-evaluate'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. SUPPLEMENT MATERIALS MODAL */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white border border-slate-100 rounded-2xl p-6 shadow-2xl text-left text-slate-800"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <FileUp className="w-4 h-4 text-indigo-600" />
                  {lang === 'zh' ? '补充目标评价资料' : 'Upload Evaluation Data'}
                </span>
                <button 
                  onClick={() => setIsUploadModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Drag and Drop box */}
              <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/10 transition-all">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">{lang === 'zh' ? '点击或拖拽文件至此区域上传' : 'Drag and drop your file here, or click'}</p>
                  <p className="text-[10px] text-slate-400 mt-1">支持 LAS, PDF, Excel, Word 格式，大小不超过 50MB</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{lang === 'zh' ? '推荐补充的缺失资料：' : 'Recommended missing data:'}</span>
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs flex items-center justify-between text-slate-600">
                  <span className="truncate max-w-[240px]">🛰️ {lang === 'zh' ? '沙特顺北5井三维走滑层位闭合图.las' : 'SB-5 3D fault closure.las'}</span>
                  <button 
                    onClick={() => {
                      setIsUploadModalOpen(false);
                      triggerToast(lang === 'zh' ? '✓ LAS曲线加载成功，已自动融入圈闭反演模型。' : '✓ LAS curve loaded successfully.');
                    }}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-extrabold text-[10px] rounded border border-indigo-100 cursor-pointer transition-colors"
                  >
                    {lang === 'zh' ? '一键匹配' : 'Bind'}
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button 
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer transition-colors"
                >
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. REPORT GENERATION MODAL */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white border border-slate-100 rounded-2xl p-6 shadow-2xl text-left text-slate-800"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  {lang === 'zh' ? '生成目标综合评价报告' : 'Generate Comprehensive Report'}
                </span>
                <button 
                  onClick={() => setIsReportModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-600">
                <p className="leading-relaxed">
                  {lang === 'zh' 
                    ? 'AI智能体将一键汇总本工作空间中所有已加载的测井、物探解释曲线，综合评价结论与证据链条，打包输出为国家标准的成果汇签报告。'
                    : 'The AI Agent will automatically compile all well logs, geophysics, and reasoning evidence to generate a standardized report.'}
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex justify-between font-bold">
                    <span>{lang === 'zh' ? '报告名称' : 'Report Name'}</span>
                    <span className="text-slate-900">【{target.name}】风险综合评价报告.docx</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'zh' ? '包含图表' : 'Charts Included'}</span>
                    <span>14 {lang === 'zh' ? '张' : 'items'} (含走向剖面图、Pg概率曲线)</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>{lang === 'zh' ? '证据可信等级' : 'Evidence Credibility'}</span>
                    <span className="text-indigo-600">A级完全对齐</span>
                  </div>
                </div>

                <div className="border border-indigo-100 bg-indigo-50/30 p-3 rounded-xl flex gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5 animate-pulse" />
                  <span className="text-[10px] text-slate-400 leading-normal">
                    {lang === 'zh' ? '智能体将在后台渲染排版。此报告已深度融合您在 [V3 版本] 中对断层遮挡因子的修正。' : 'The agent will render this automatically incorporating your expert tweaks.'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button 
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer transition-colors"
                >
                  {lang === 'zh' ? '关闭' : 'Close'}
                </button>
                <button 
                  onClick={() => {
                    setIsReportModalOpen(false);
                    triggerToast(lang === 'zh' ? '🎉 报告生成成功！已触发浏览器下载。' : '🎉 Report compiled! Starting download.');
                  }}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer shadow-md shadow-indigo-100 transition-colors"
                >
                  {lang === 'zh' ? '一键生成并下载' : 'Generate & Download'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
