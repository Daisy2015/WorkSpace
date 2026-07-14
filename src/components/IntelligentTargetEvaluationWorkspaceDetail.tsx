import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Sliders, 
  TrendingUp, 
  Brain, 
  RefreshCw, 
  Download, 
  CheckCircle, 
  Trash2, 
  Layers, 
  MapPin, 
  ChevronRight, 
  Plus, 
  Save, 
  Send, 
  DollarSign, 
  AlertTriangle,
  HelpCircle,
  FileSpreadsheet,
  Award,
  Maximize2
} from 'lucide-react';
import { Workspace } from '../types';
import { AssistantSidebar } from './AssistantSidebar';
import { IntelligentTargetEvaluationTopBar } from './IntelligentTargetEvaluationTopBar';
import { ExplorationTargetRequirementTree } from './ExplorationTargetRequirementTree';
import { EvidenceChainPanel } from './EvidenceChainPanel';

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

// MOCK DATA FOR THE TARGETS
interface ExplorationTarget {
  id: string;
  name: string;
  type: string;
  formation: string;
  // Geologic characteristics
  area: number;          // km²
  closureHeight: number;  // m
  porosity: number;       // %
  permeability: number;   // mD
  geologicPg: number;     // %
  riskLevel: '低风险' | '中风险' | '高风险' | 'Low' | 'Medium' | 'High';
  // Resource characteristics
  estimatedResources: number; // 万吨 (10k tons)
  p90: number;               // 万吨
  potentialGrade: '特大型' | '大型' | '中型' | '小型' | 'Super Large' | 'Large' | 'Medium' | 'Small';
  recoveryFactor: number;     // %
  // Economic characteristics
  drillingInvestment: number; // 亿元 (100M CNY)
  expectedAnnualProd: number; // 万吨/年
  baseIrr: number;            // % at $70
  npv70: number;              // 亿元 at $70
  // Strategic characteristics
  offsetFittedRate: number;   // %
  layerProvedLevel: '高' | '中' | '低' | 'High' | 'Medium' | 'Low';
  demonstrationEffect: '强' | '中' | '弱' | 'Strong' | 'Medium' | 'Weak';
  // Category origin
  origin: '构造圈闭' | '岩性圈闭' | '断块圈闭' | '断控缝洞型' | 'Structural' | 'Lithologic' | 'Fault-blocked' | 'Fault-controlled';
  resourceType: '常规油' | '致密气' | '页岩油' | '致密油' | '常规气' | 'Conventional Oil' | 'Tight Gas' | 'Shale Oil' | 'Tight Oil' | 'Conventional Gas';
  maturity: '已探明' | '已控制' | '潜在' | 'Proved' | 'Controlled' | 'Potential';
  oilfield: string;
}

const INITIAL_TARGETS: ExplorationTarget[] = [
  {
    id: 'target-1',
    name: '顺北5号缝洞体',
    type: '断控缝洞型',
    formation: '奥陶系',
    area: 32.4,
    closureHeight: 280,
    porosity: 12.5,
    permeability: 4.8,
    geologicPg: 34.6,
    riskLevel: '中风险',
    estimatedResources: 3800,
    p90: 1200,
    potentialGrade: '大型',
    recoveryFactor: 24.5,
    drillingInvestment: 1.85,
    expectedAnnualProd: 35,
    baseIrr: 14.8,
    npv70: 2.45,
    offsetFittedRate: 94,
    layerProvedLevel: '高',
    demonstrationEffect: '强',
    origin: '断控缝洞型',
    resourceType: '常规油',
    maturity: '已探明',
    oilfield: '吉林油田'
  },
  {
    id: 'target-2',
    name: '哈得6号砂岩',
    type: '砂岩透镜体',
    formation: '石炭系',
    area: 18.5,
    closureHeight: 120,
    porosity: 18.2,
    permeability: 12.4,
    geologicPg: 45.0,
    riskLevel: '低风险',
    estimatedResources: 2400,
    p90: 850,
    potentialGrade: '中型',
    recoveryFactor: 28.0,
    drillingInvestment: 1.20,
    expectedAnnualProd: 22,
    baseIrr: 16.5,
    npv70: 1.95,
    offsetFittedRate: 88,
    layerProvedLevel: '高',
    demonstrationEffect: '中',
    origin: '岩性圈闭',
    resourceType: '致密气',
    maturity: '已探明',
    oilfield: '吉林油田'
  },
  {
    id: 'target-3',
    name: '高石102井深层气',
    type: '背斜构造',
    formation: '震旦系',
    area: 45.2,
    closureHeight: 310,
    porosity: 6.8, // Critical Porosity < 10%
    permeability: 0.45, // Critical Permeability < 1mD
    geologicPg: 28.5,
    riskLevel: '高风险',
    estimatedResources: 4200,
    p90: 1500,
    potentialGrade: '大型',
    recoveryFactor: 18.5,
    drillingInvestment: 2.40,
    expectedAnnualProd: 40,
    baseIrr: 11.2,
    npv70: 1.10,
    offsetFittedRate: 75,
    layerProvedLevel: '中',
    demonstrationEffect: '强',
    origin: '构造圈闭',
    resourceType: '常规气',
    maturity: '已控制',
    oilfield: '吉林油田'
  },
  {
    id: 'target-4',
    name: '吉木11号致密油',
    type: '页岩层系',
    formation: '二叠系',
    area: 55.0,
    closureHeight: 80,
    porosity: 9.2, // Critical Porosity < 10%
    permeability: 0.12, // Critical Permeability < 1mD
    geologicPg: 55.0,
    riskLevel: '中风险',
    estimatedResources: 6200,
    p90: 2100,
    potentialGrade: '特大型',
    recoveryFactor: 12.0,
    drillingInvestment: 3.10,
    expectedAnnualProd: 48,
    baseIrr: 10.4,
    npv70: 0.95,
    offsetFittedRate: 82,
    layerProvedLevel: '高',
    demonstrationEffect: '强',
    origin: '岩性圈闭',
    resourceType: '页岩油',
    maturity: '潜在',
    oilfield: '吉林油田'
  },
  {
    id: 'target-5',
    name: '英台503缝洞体',
    type: '火山岩缝洞',
    formation: '白垩系',
    area: 12.8,
    closureHeight: 150,
    porosity: 11.0,
    permeability: 1.5,
    geologicPg: 22.4,
    riskLevel: '高风险',
    estimatedResources: 1500,
    p90: 420,
    potentialGrade: '小型',
    recoveryFactor: 15.0,
    drillingInvestment: 1.50,
    expectedAnnualProd: 12,
    baseIrr: 8.2,
    npv70: 0.25,
    offsetFittedRate: 68,
    layerProvedLevel: '低',
    demonstrationEffect: '弱',
    origin: '断块圈闭',
    resourceType: '页岩油',
    maturity: '潜在',
    oilfield: '吉林油田'
  },
];

const OILFIELDS = [
  { name: '大庆油田', count: 2 },
  { name: '吉林油田', count: 4 },
  { name: '辽河油田', count: 0 },
  { name: '新疆油田', count: 2 },
];

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
  const [activeSubTab, setActiveSubTab] = useState<'evaluation' | 'optimization' | 'pool'>('evaluation');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Targets State
  const [targets, setTargets] = useState<ExplorationTarget[]>(INITIAL_TARGETS);
  
  // Tab 1: Selected Exploration Target
  const [selectedTargetId, setSelectedTargetId] = useState<string>('target-1');
  const currentTarget = useMemo(() => {
    return targets.find(t => t.id === selectedTargetId) || targets[0];
  }, [targets, selectedTargetId]);

  // Parameters Card Tab State (地质 / 资源 / 经济 / 战略匹配)
  const [paramTab, setParamTab] = useState<'geology' | 'resource' | 'economics' | 'strategy'>('geology');

  // Interactive Oil Price Slider & Micro sensitivity engine
  const [oilPrice, setOilPrice] = useState<number>(70); // Base $70
  
  // Real-time recalculated financial metrics
  const financialMetrics = useMemo(() => {
    const baseIrr = currentTarget.baseIrr;
    const baseNpv = currentTarget.npv70;
    
    // Sensitivity formula: 
    // Oil price change factor: (Price - 70) / 70
    // Every $10 increase/decrease changes IRR by ~2.2% and NPV by ~0.4 Billion CNY
    const priceDiff = oilPrice - 70;
    const irrChange = priceDiff * 0.22;
    const npvChange = priceDiff * 0.04;
    
    const calculatedIrr = Math.max(1.5, parseFloat((baseIrr + irrChange).toFixed(1)));
    const calculatedNpv = Math.max(-0.5, parseFloat((baseNpv + npvChange).toFixed(2)));
    const breakEvenBuffer = parseFloat((oilPrice - (70 - baseIrr / 0.22)).toFixed(1));

    return {
      irr: calculatedIrr,
      npv: calculatedNpv,
      buffer: breakEvenBuffer > 0 ? `+$${breakEvenBuffer}/bbl` : `-$${Math.abs(breakEvenBuffer)}/bbl`
    };
  }, [oilPrice, currentTarget]);

  // AI Model Selector
  const [selectedModel, setSelectedModel] = useState<string>('DeepSeek-R1');
  const [aiTimestamp, setAiTimestamp] = useState<string>('12:30');
  const [isAiRefreshing, setIsAiRefreshing] = useState<boolean>(false);

  // Generated AI insights
  const aiInsights = useMemo(() => {
    if (selectedModel === 'DeepSeek-R1') {
      return {
        conclusion: `${currentTarget.name}的地质成功率(Pg)为${currentTarget.geologicPg}%，奥陶系缝洞体构造发育完整，断控裂缝带规模宏大。虽然在低油价情景（例如$55以下）下，其内部收益率(IRR)可能逼近经济红线，但目前在基准油价下展现出突出的财务抗风险能力。由于邻井符合度高达${currentTarget.offsetFittedRate}%，地质确定性强。`,
        suggestion: `首口评价井建议部署在该缝洞体发育的断裂破碎带中段，靶点优选深部压力通道交汇区。建议采用多段酸压联作工艺以实现对深层天然储集空间的主动沟通，降低早期出水及压力急剧衰减的开发风险。`
      };
    } else if (selectedModel === 'Qwen-2.5') {
      return {
        conclusion: `评级结论：【优先优选储备】。${currentTarget.name}潜力等级为【${currentTarget.potentialGrade}】，预测资源量达到${currentTarget.estimatedResources}万吨。财务效益极其稳定。高密度的裂缝缝洞网保障了可采系数（当前设定${currentTarget.recoveryFactor}%）。战略示范意义极其强烈，契合油田分公司深层滚动勘探总体部署。`,
        suggestion: `建议第一轮部署方案中锁定该目标的两个核心块，引入三维大功率电磁测深及相控反演定位。评价井钻遇后应立即开展长周期试油试采，获取第一手温压及渗流参数。`
      };
    } else {
      return {
        conclusion: `【Gemini 评价】Pg 处于行业中高水平，断裂空间刻画清晰。当油价滑移至$${oilPrice}/桶时，IRR为${financialMetrics.irr}%，表现出极佳的盈利安全边界。整体风控评级为中，主要地质风险来源于深层缝洞充填程度的不确定性。`,
        suggestion: `下一步实钻应在缝洞核部边缘布置斜井以扩大单井泄油面积。同时，必须对邻近火山岩和碳酸盐接触界面进行岩心加密提取，以验证地质边界的密封性。`
      };
    }
  }, [currentTarget, selectedModel, oilPrice, financialMetrics]);

  const handleRefreshAi = () => {
    setIsAiRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      setAiTimestamp(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      setIsAiRefreshing(false);
    }, 800);
  };

  // --- TAB 2: TARGET OPTIMIZATION ---
  const [optTab, setOptTab] = useState<'weight' | 'boston' | 'radar' | 'frontier'>('weight');
  
  // Weights state: must sum to 100%
  const [weights, setWeights] = useState({
    geology: 35,
    resource: 30,
    economics: 20,
    strategy: 15
  });

  const handleWeightChange = (key: 'geology' | 'resource' | 'economics' | 'strategy', value: number) => {
    setWeights(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Presets
  const applyPreset = (type: 'geology' | 'resource') => {
    if (type === 'geology') {
      setWeights({
        geology: 50,
        resource: 20,
        economics: 15,
        strategy: 15
      });
    } else {
      setWeights({
        geology: 20,
        resource: 50,
        economics: 15,
        strategy: 15
      });
    }
  };

  // Weight Balancer (Normalize to 100%)
  const balanceWeights = () => {
    const total = weights.geology + weights.resource + weights.economics + weights.strategy;
    if (total === 0) {
      setWeights({ geology: 25, resource: 25, economics: 25, strategy: 25 });
      return;
    }
    const factor = 100 / total;
    setWeights({
      geology: Math.round(weights.geology * factor),
      resource: Math.round(weights.resource * factor),
      economics: Math.round(weights.economics * factor),
      strategy: 100 - Math.round(weights.geology * factor) - Math.round(weights.resource * factor) - Math.round(weights.economics * factor)
    });
  };

  // Active metrics in table, recalculating dynamic composite score
  const sortedTargets = useMemo(() => {
    const scored = targets.map(t => {
      // Norm scores 0 - 100
      // Geology Score: Pg * 2 + 15
      const geologyScore = Math.min(100, Math.round(t.geologicPg * 2.2 + 10));
      // Resource Score: Estimated Resource normalized (max ~ 8000)
      const resourceScore = Math.min(100, Math.round((t.estimatedResources / 6500) * 80 + 20));
      // Economics Score: IRR normalized (max ~ 20)
      const economicsScore = Math.min(100, Math.round((t.baseIrr / 18) * 85 + 15));
      // Strategy Score: Based on demonstration, offset fitted rate
      const strategyScore = Math.min(100, Math.round(t.offsetFittedRate * 0.9 + 10));

      const composite = parseFloat((
        (geologyScore * weights.geology +
         resourceScore * weights.resource +
         economicsScore * weights.economics +
         strategyScore * weights.strategy) / 100
      ).toFixed(1));

      // Recommendation Grade
      let grade: 'A类优先' | 'B类跟进' | 'C类暂缓' = 'B类跟进';
      if (composite >= 80) grade = 'A类优先';
      else if (composite < 65) grade = 'C类暂缓';

      // Decision Ref
      let decisionRef = '资源规模大';
      if (geologyScore > 85) decisionRef = '低风险、成功率极高';
      else if (economicsScore > 85) decisionRef = '财务效益表现优异';
      else if (strategyScore > 85) decisionRef = '战略示范效应显著';

      return {
        ...t,
        geologyScore,
        resourceScore,
        economicsScore,
        strategyScore,
        compositeScore: composite,
        grade,
        decisionRef
      };
    });

    return scored.sort((a, b) => b.compositeScore - a.compositeScore);
  }, [targets, weights]);

  // Selected checkboxes for batch actions / Preferred Pool
  const [selectedTargetIds, setSelectedTargetIds] = useState<Record<string, boolean>>({
    'target-1': true,
    'target-2': true,
    'target-4': true,
  });

  const toggleSelectTarget = (id: string) => {
    setSelectedTargetIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleSelectAll = () => {
    const allSelected = targets.every(t => selectedTargetIds[t.id]);
    const next: Record<string, boolean> = {};
    targets.forEach(t => {
      next[t.id] = !allSelected;
    });
    setSelectedTargetIds(next);
  };

  // Knapsack algorithm budget allocation upper limit (3.5 Billion CNY)
  const [budgetLimit, setBudgetLimit] = useState<number>(3.5); // 3.5 亿元

  // Auto solve recommendation pool under 3.5 Billion Budget
  const handleKnapsackSolve = () => {
    // Greedy solver: sort by dynamic value-to-cost ratio (Resource / Budget)
    const sortedByRatio = [...sortedTargets].sort((a, b) => {
      const ratioA = a.estimatedResources / a.drillingInvestment;
      const ratioB = b.estimatedResources / b.drillingInvestment;
      return ratioB - ratioA;
    });

    let currentBudget = 0;
    const solvedIds: Record<string, boolean> = {};
    sortedByRatio.forEach(t => {
      if (currentBudget + t.drillingInvestment <= budgetLimit) {
        solvedIds[t.id] = true;
        currentBudget += t.drillingInvestment;
      } else {
        solvedIds[t.id] = false;
      }
    });

    setSelectedTargetIds(solvedIds);
  };

  // --- TAB 3: PREFERRED POOL MANAGEMENT ---
  const [selectedOilfield, setSelectedOilfield] = useState<string>('吉林油田');
  const [selectedScheme, setSelectedScheme] = useState<string>('滚动');
  const [newSchemeName, setNewSchemeName] = useState<string>('');

  // Items currently inside Preferred Pool (only checked targets from list)
  const poolTargets = useMemo(() => {
    return sortedTargets.filter(t => selectedTargetIds[t.id]);
  }, [sortedTargets, selectedTargetIds]);

  // Summary Metrics of Pool Items
  const poolSummary = useMemo(() => {
    let totalGeologyReserve = 0;
    let estimatedTotal = 0;
    let totalInvestment = 0;

    poolTargets.forEach(t => {
      totalGeologyReserve += t.estimatedResources * 2.5; // Estimated total reserves
      estimatedTotal += t.estimatedResources;
      totalInvestment += t.drillingInvestment;
    });

    return {
      geology: Math.round(totalGeologyReserve),
      resources: Math.round(estimatedTotal),
      ratio: poolTargets.length > 0 ? '31.4%' : '0%',
      budget: parseFloat(totalInvestment.toFixed(2))
    };
  }, [poolTargets]);

  const handleRevokeFromPool = (id: string) => {
    setSelectedTargetIds(prev => ({
      ...prev,
      [id]: false
    }));
  };

  return (
    <div className="h-full relative flex flex-col" id="intelligent-target-eval-workspace-detail">
      {/* Custom Top Bar */}
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
        targets={targets}
        selectedTargetId={selectedTargetId}
        onSelectTargetId={(id) => setSelectedTargetId(id)}
      />
      
      {/* CONTENT CONTAINER */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Panel: Facts & Resources */}
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
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-12 bg-white border border-slate-200 shadow-md rounded-r-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-all z-30 cursor-pointer ${isResourcePanelOpen ? 'left-[384px]' : 'left-0'}`}
          title={isResourcePanelOpen ? (lang === 'zh' ? '收起资源面板' : 'Collapse Resources') : (lang === 'zh' ? '展开资源面板' : 'Expand Resources')}
          style={{ transition: 'left 300ms ease-in-out' }}
        >
          <i className={`fas ${isResourcePanelOpen ? 'fa-chevron-left' : 'fa-chevron-right'} text-[10px]`}></i>
        </button>

        {/* Center / Right Section */}
        <motion.div 
          className="flex-1 min-w-0 z-0 bg-slate-50 flex flex-col overflow-hidden"
          animate={{ marginRight: isAssistantOpen ? 384 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {/* Sub-tab Selector inside target evaluation area */}
          <div className="flex-shrink-0 flex items-center justify-center border-b border-slate-200 bg-white px-6 py-3 select-none">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveSubTab('evaluation')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                  activeSubTab === 'evaluation' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                {lang === 'zh' ? '目标精细评价' : 'Target Fine Evaluation'}
              </button>
              <button
                onClick={() => setActiveSubTab('optimization')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                  activeSubTab === 'optimization' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                {lang === 'zh' ? '目标优选与组合' : 'Target Selection & Portfolio'}
              </button>
              <button
                onClick={() => setActiveSubTab('pool')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 relative ${
                  activeSubTab === 'pool' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {lang === 'zh' ? '优选池管理' : 'Preferred Pool'}
                {poolTargets.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                    {poolTargets.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            <AnimatePresence mode="wait">
            
            {/* SUB-VIEW 1: TARGET EVALUATION */}
            {activeSubTab === 'evaluation' && (
              <motion.div
                key="evaluation-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"
              >
                {/* Full Width: Parameters and Compass/Stress Testing (Cols 12) */}
                <div className="xl:col-span-12 space-y-6">
                  
                  {/* WORKSTATION CARD PANEL HEADER */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                          [目标评价工作台]
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-lg font-black text-slate-800">
                            当前对象: {currentTarget.name}{lang === 'zh' ? '评价工区' : ' Eval Area'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200">
                            {currentTarget.type} | {currentTarget.formation}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Switch Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">{lang === 'zh' ? '切换评价工区:' : 'Switch Area:'}</span>
                      <select 
                        value={selectedTargetId}
                        onChange={(e) => setSelectedTargetId(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-black text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                      >
                        {targets.map(t => (
                          <option key={t.id} value={t.id}>{t.name}{lang === 'zh' ? '评价工区' : ' Eval Area'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* A) PARAMETERS CARD GROUP with Tab Selection */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                    <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 justify-between items-center">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setParamTab('geology')}
                          className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                            paramTab === 'geology' 
                              ? 'bg-white text-slate-800 shadow-xs border border-slate-100' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          地质特征
                        </button>
                        <button
                          onClick={() => setParamTab('resource')}
                          className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                            paramTab === 'resource' 
                              ? 'bg-white text-slate-800 shadow-xs border border-slate-100' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          资源规模
                        </button>
                        <button
                          onClick={() => setParamTab('economics')}
                          className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                            paramTab === 'economics' 
                              ? 'bg-white text-slate-800 shadow-xs border border-slate-100' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          经济评估
                        </button>
                        <button
                          onClick={() => setParamTab('strategy')}
                          className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                            paramTab === 'strategy' 
                              ? 'bg-white text-slate-800 shadow-xs border border-slate-100' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          战略匹配
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold mr-3 uppercase tracking-widest">
                        四性参数校验
                      </span>
                    </div>

                    <div className="p-6">
                      <AnimatePresence mode="wait">
                        {paramTab === 'geology' && (
                          <motion.div 
                            key="geology-tab"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-4 gap-6"
                          >
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
                              <span className="text-xs text-slate-400 font-bold">圈闭面积</span>
                              <span className="text-2xl font-black text-slate-800 font-mono mt-2">{currentTarget.area} <span className="text-xs font-medium text-slate-400">km²</span></span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
                              <span className="text-xs text-slate-400 font-bold">闭合高度</span>
                              <span className="text-2xl font-black text-slate-800 font-mono mt-2">{currentTarget.closureHeight} <span className="text-xs font-medium text-slate-400">m</span></span>
                            </div>
                            
                            {/* Critical limits triggers visual warning */}
                            <div className={`border rounded-xl p-4 flex flex-col justify-between transition-all ${
                              currentTarget.porosity < 10 
                                ? 'bg-red-50 border-red-200 text-red-900 shadow-sm shadow-red-100 animate-pulse' 
                                : 'bg-slate-50 border-slate-100 text-slate-800'
                            }`}>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400">平均孔隙度</span>
                                {currentTarget.porosity < 10 && <AlertTriangle className="w-4.5 h-4.5 text-red-500" />}
                              </div>
                              <div className="mt-2">
                                <span className="text-2xl font-black font-mono">{currentTarget.porosity}%</span>
                                {currentTarget.porosity < 10 && (
                                  <span className="block text-[9px] font-bold text-red-500 mt-1">
                                    [红牌警告] 临界极低孔隙
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className={`border rounded-xl p-4 flex flex-col justify-between transition-all ${
                              currentTarget.permeability < 1 
                                ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-sm shadow-amber-100' 
                                : 'bg-slate-50 border-slate-100 text-slate-800'
                            }`}>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400">平均渗透率</span>
                                {currentTarget.permeability < 1 && <AlertTriangle className="w-4.5 h-4.5 text-amber-500 animate-bounce" />}
                              </div>
                              <div className="mt-2">
                                <span className="text-2xl font-black font-mono">{currentTarget.permeability} mD</span>
                                {currentTarget.permeability < 1 && (
                                  <span className="block text-[9px] font-bold text-amber-600 mt-1">
                                    [黄牌预警] 特低渗透储层
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {paramTab === 'resource' && (
                          <motion.div 
                            key="resource-tab"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-4 gap-6"
                          >
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                              <span className="text-xs text-slate-400 font-bold block">预测资源量</span>
                              <span className="text-2xl font-black text-emerald-600 font-mono mt-2 block">{currentTarget.estimatedResources} <span className="text-xs font-medium text-slate-400">万吨</span></span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                              <span className="text-xs text-slate-400 font-bold block">地质成功率 Pg</span>
                              <span className="text-2xl font-black text-blue-600 font-mono mt-2 block">{currentTarget.geologicPg}%</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                              <span className="text-xs text-slate-400 font-bold block">潜力等级</span>
                              <span className="text-2xl font-black text-slate-800 mt-2 block">{currentTarget.potentialGrade}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                              <span className="text-xs text-slate-400 font-bold block">可采系数</span>
                              <span className="text-2xl font-black text-slate-800 font-mono mt-2 block">{currentTarget.recoveryFactor}%</span>
                            </div>
                          </motion.div>
                        )}

                        {paramTab === 'economics' && (
                          <motion.div 
                            key="economics-tab"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-4 gap-6"
                          >
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                              <span className="text-xs text-slate-400 font-bold block">基本钻井投资</span>
                              <span className="text-2xl font-black text-slate-800 font-mono mt-2 block">{currentTarget.drillingInvestment} <span className="text-xs font-medium text-slate-400">亿元</span></span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                              <span className="text-xs text-slate-400 font-bold block">预期年产量</span>
                              <span className="text-2xl font-black text-slate-800 font-mono mt-2 block">{currentTarget.expectedAnnualProd} <span className="text-xs font-medium text-slate-400">万吨</span></span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                              <span className="text-xs text-slate-400 font-bold block">IRR (油价$70)</span>
                              <span className="text-2xl font-black text-blue-600 font-mono mt-2 block">{currentTarget.baseIrr}%</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                              <span className="text-xs text-slate-400 font-bold block">期望净现值 NPV</span>
                              <span className="text-2xl font-black text-emerald-600 font-mono mt-2 block">{currentTarget.npv70} <span className="text-xs font-medium text-slate-400">亿元</span></span>
                            </div>
                          </motion.div>
                        )}

                        {paramTab === 'strategy' && (
                          <motion.div 
                            key="strategy-tab"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-4 gap-6"
                          >
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                              <span className="text-xs text-slate-400 font-bold block">邻井符合度</span>
                              <span className="text-2xl font-black text-slate-800 font-mono mt-2 block">{currentTarget.offsetFittedRate}%</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                              <span className="text-xs text-slate-400 font-bold block">层系探明度</span>
                              <span className="text-2xl font-black text-slate-800 mt-2 block">{currentTarget.layerProvedLevel}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                              <span className="text-xs text-slate-400 font-bold block">突破示范效应</span>
                              <span className="text-2xl font-black text-emerald-600 mt-2 block">{currentTarget.demonstrationEffect}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                              <span className="text-xs text-slate-400 font-bold block">风险总评估</span>
                              <span className="text-2xl font-black text-amber-600 mt-2 block">{currentTarget.riskLevel}</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* B) RADAR AND STRESS TESTING GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* B-1: extreme polar attributes radar */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase">
                            极坐标四维属性罗盘 (Radar Chart)
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] text-blue-600 font-bold">
                            基准阈值: 75
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">
                          虚线为75分标准值。若落入虚线内部，即代表该圈闭存在对应维度的“木桶短板”。
                        </p>
                      </div>

                      {/* SVG Radar Compass Graph */}
                      <div className="flex justify-center my-6 relative">
                        <svg className="w-56 h-56 overflow-visible" viewBox="0 0 200 200">
                          {/* Radial background grids */}
                          <circle cx="100" cy="100" r="75" fill="none" stroke="#e2e8f0" strokeDasharray="4" strokeWidth="1" />
                          <circle cx="100" cy="100" r="50" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                          <circle cx="100" cy="100" r="25" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                          
                          {/* Cross axes */}
                          <line x1="100" y1="20" x2="100" y2="180" stroke="#f1f5f9" strokeWidth="1.5" />
                          <line x1="20" y1="100" x2="180" y2="100" stroke="#f1f5f9" strokeWidth="1.5" />

                          {/* Reference threshold 75 points boundary circle (dotted) */}
                          <circle cx="100" cy="100" r="60" fill="none" stroke="#ef4444" strokeDasharray="3" strokeWidth="1.2" opacity="0.4" />
                          
                          {/* Radar points mapping */}
                          {/* Top: 吸引力 (Estimated Resources Score)
                              Right: 可靠性 (Pg Score)
                              Bottom: 经济性 (IRR Score)
                              Left: 战略性 (Demonstration & Fit) */}
                          {(() => {
                            // Let's compute actual mapping points
                            // Scale 0 - 100 mapping to 0 - 80px radius
                            const attScore = Math.min(100, Math.round((currentTarget.estimatedResources / 6500) * 80 + 20));
                            const relScore = Math.min(100, Math.round(currentTarget.geologicPg * 2.2 + 10));
                            const ecoScore = Math.min(100, Math.round((currentTarget.baseIrr / 18) * 85 + 15));
                            const strScore = Math.min(100, Math.round(currentTarget.offsetFittedRate * 0.9 + 10));

                            const pTop = { x: 100, y: 100 - (attScore * 0.8) };
                            const pRight = { x: 100 + (relScore * 0.8), y: 100 };
                            const pBottom = { x: 100, y: 100 + (ecoScore * 0.8) };
                            const pLeft = { x: 100 - (strScore * 0.8), y: 100 };

                            const pathStr = `M ${pTop.x} ${pTop.y} L ${pRight.x} ${pRight.y} L ${pBottom.x} ${pBottom.y} L ${pLeft.x} ${pLeft.y} Z`;

                            return (
                                <>
                                 {/* Blue Shaded Area */}
                                 <path d={pathStr} fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeWidth="2.5" />
                                 
                                 {/* Points */}
                                 <circle cx={pTop.x} cy={pTop.y} r="4" fill="#3b82f6" />
                                 <circle cx={pRight.x} cy={pRight.y} r="4" fill="#3b82f6" />
                                 <circle cx={pBottom.x} cy={pBottom.y} r="4" fill="#3b82f6" />
                                 <circle cx={pLeft.x} cy={pLeft.y} r="4" fill="#3b82f6" />

                                 {/* Labels */}
                                 <text x="100" y="14" textAnchor="middle" className="text-[10px] font-black fill-slate-700">吸引力 ({attScore})</text>
                                 <text x="184" y="103" textAnchor="start" className="text-[10px] font-black fill-slate-700">可靠性 ({relScore})</text>
                                 <text x="100" y="195" textAnchor="middle" className="text-[10px] font-black fill-slate-700">经济性 ({ecoScore})</text>
                                 <text x="15" y="103" textAnchor="end" className="text-[10px] font-black fill-slate-700">战略性 ({strScore})</text>
                               </>
                            );
                          })()}
                        </svg>
                      </div>

                      {/* Legends */}
                      <div className="flex justify-around items-center bg-slate-50 border border-slate-100 rounded-xl p-2 text-[10px] font-bold text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-blue-500 rounded-xs"></span>
                          当前圈闭指标
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 border-t-2 border-red-400 border-dashed"></span>
                          75分预警红线
                        </div>
                      </div>
                    </div>

                    {/* B-2: Oil price sensitivity stress testing */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase">
                          油价变动敏感性压力测试
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium">
                          左右滑动油价，模拟并重算在超低、极高油价环境下，项目的财务风险和回报。
                        </p>
                      </div>

                      {/* Interactive range slider */}
                      <div className="my-5 bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-600">模拟基准油价</span>
                          <span className="text-lg font-mono font-black text-blue-600">${oilPrice}/桶</span>
                        </div>
                        <input 
                          type="range"
                          min="40"
                          max="100"
                          step="1"
                          value={oilPrice}
                          onChange={(e) => setOilPrice(parseInt(e.target.value))}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                          <span>$40 极低阻抗</span>
                          <span>$70 基准价</span>
                          <span>$100 高额回报</span>
                        </div>
                      </div>

                      {/* Financial results instant linkage updates */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-500">期望净现值 (NPV):</span>
                          <span className="font-mono font-black text-emerald-600">
                            {financialMetrics.npv} 亿元 <span className="text-[10px] font-medium text-slate-400">(原{currentTarget.npv70}亿)</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-500">内部收益率 (IRR):</span>
                          <span className="font-mono font-black text-blue-600">
                            {financialMetrics.irr}% <span className="text-[10px] font-medium text-slate-400">(原{currentTarget.baseIrr}%)</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-500">盈亏平衡油价安全垫:</span>
                          <span className={`font-mono font-black ${financialMetrics.irr >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                            {financialMetrics.buffer}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <button 
                        onClick={() => alert(`成功导出《${currentTarget.name} 地质经济综合评估报告.pdf》`)}
                        className="mt-5 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-100"
                      >
                        <Download className="w-3.5 h-3.5" />
                        生成并导出详细评价报告
                      </button>
                    </div>

                  </div>

                </div>

              </motion.div>
            )}

            {/* SUB-VIEW 2: TARGET OPTIMIZATION */}
            {activeSubTab === 'optimization' && (
              <motion.div
                key="optimization-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                
                {/* ALGORITHM SWITCH TOP TAB BAR */}
                <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setOptTab('weight')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        optTab === 'weight' 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      综合权重排名
                    </button>
                    <button
                      onClick={() => setOptTab('boston')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        optTab === 'boston' 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      波士顿矩阵定位
                    </button>
                    <button
                      onClick={() => setOptTab('radar')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        optTab === 'radar' 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      多维蛛网分析
                    </button>
                    <button
                      onClick={() => setOptTab('frontier')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        optTab === 'frontier' 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      效益前沿优选
                    </button>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 mr-3 uppercase tracking-widest">
                    决策权重算法切换项
                  </span>
                </div>

                {/* A) DYNAMIC RANKING WEIGHT REGULATOR */}
                {optTab === 'weight' && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-blue-500" />
                        <h4 className="text-xs font-black text-slate-800">
                          排队权重智能调节配置
                        </h4>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => applyPreset('geology')}
                          className="px-2.5 py-1 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition-all"
                        >
                          突出地质成功率(Pg)
                        </button>
                        <button 
                          onClick={() => applyPreset('resource')}
                          className="px-2.5 py-1 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition-all"
                        >
                          突出储量规模(P50)
                        </button>
                        <button 
                          onClick={balanceWeights}
                          className="px-2.5 py-1 text-[10px] font-bold bg-blue-50 hover:bg-blue-100 border border-blue-150 text-blue-600 rounded-lg transition-all"
                        >
                          智能权重配平 (100%)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span>地质风险权重:</span>
                          <span className="font-mono text-blue-600 font-black">{weights.geology}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" value={weights.geology}
                          onChange={(e) => handleWeightChange('geology', parseInt(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span>资源规模权重:</span>
                          <span className="font-mono text-blue-600 font-black">{weights.resource}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" value={weights.resource}
                          onChange={(e) => handleWeightChange('resource', parseInt(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span>经济效益权重:</span>
                          <span className="font-mono text-blue-600 font-black">{weights.economics}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" value={weights.economics}
                          onChange={(e) => handleWeightChange('economics', parseInt(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span>战略权重:</span>
                          <span className="font-mono text-blue-600 font-black">{weights.strategy}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" value={weights.strategy}
                          onChange={(e) => handleWeightChange('strategy', parseInt(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* B) MULTI-METRIC SORT TABLE */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <span className="text-xs font-black text-slate-800">多指标智能排序数据表</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      已选中 {poolTargets.length} / {targets.length} 个目标加入优选方案
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                          <th className="py-3 px-6 w-12 text-center">
                            <input 
                              type="checkbox" 
                              checked={targets.every(t => selectedTargetIds[t.id])}
                              onChange={toggleSelectAll}
                              className="rounded accent-blue-600 cursor-pointer"
                            />
                          </th>
                          <th className="py-3 px-4 w-16 text-center">排名</th>
                          <th className="py-3 px-4">目标名称</th>
                          <th className="py-3 px-4">地质Pg分</th>
                          <th className="py-3 px-4">资源分</th>
                          <th className="py-3 px-4">经济分</th>
                          <th className="py-3 px-4">战略分</th>
                          <th className="py-3 px-4 font-black text-blue-600">综合得分</th>
                          <th className="py-3 px-4">推荐等级</th>
                          <th className="py-3 px-6">决策参考</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                        {sortedTargets.map((t, idx) => (
                          <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-6 text-center">
                              <input 
                                type="checkbox"
                                checked={!!selectedTargetIds[t.id]}
                                onChange={() => toggleSelectTarget(t.id)}
                                className="rounded accent-blue-600 cursor-pointer"
                              />
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono font-black text-slate-400">{idx + 1}</td>
                            <td className="py-3.5 px-4 font-black text-slate-800 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => { setSelectedTargetId(t.id); setActiveSubTab('evaluation'); }}>
                              {t.name}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-semibold">{t.geologyScore}</td>
                            <td className="py-3.5 px-4 font-mono font-semibold">{t.resourceScore}</td>
                            <td className="py-3.5 px-4 font-mono font-semibold">{t.economicsScore}</td>
                            <td className="py-3.5 px-4 font-mono font-semibold">{t.strategyScore}</td>
                            <td className="py-3.5 px-4 font-mono font-black text-blue-600">{t.compositeScore}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                                t.grade === 'A类优先' 
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                  : t.grade === 'B类跟进'
                                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                  : 'bg-red-50 text-red-600 border border-red-100'
                              }`}>
                                {t.grade}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 font-medium text-slate-400">{t.decisionRef}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* C) DUAL-CHANNEL VISUALIZATION DASHBOARD */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* View A or Other Alg Switches */}
                  {optTab === 'boston' ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase">
                          波士顿四象限决策定位图 (Boston Matrix)
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold">X轴: 地质Pg  Y轴: 经济效益</span>
                      </div>
                      
                      {/* Interactive Boston 4 quadrant grid */}
                      <div className="relative w-full h-64 border border-slate-200 bg-slate-50/50 rounded-xl overflow-hidden">
                        {/* Center axes */}
                        <div className="absolute top-1/2 left-0 right-0 h-px border-t border-slate-300 border-dashed"></div>
                        <div className="absolute left-1/2 top-0 bottom-0 w-px border-l border-slate-300 border-dashed"></div>

                        {/* Quadrant labels */}
                        <span className="absolute top-3 right-3 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          明星区 (Stars) - 高成功高回报
                        </span>
                        <span className="absolute bottom-3 right-3 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          现金牛区 (Cows) - 高成功稳健
                        </span>
                        <span className="absolute top-3 left-3 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                          问号区 (Questions) - 高投入待甄别
                        </span>
                        <span className="absolute bottom-3 left-3 text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                          瘦狗区 (Dogs) - 建议搁置
                        </span>

                        {/* Plot points for each target */}
                        {sortedTargets.map((t, idx) => {
                          // Coordinates centered on 50%
                          // mapped to percentage: 10% to 90%
                          const xPercent = 10 + (t.geologicPg / 70) * 80;
                          const yPercent = 90 - (t.baseIrr / 20) * 80;

                          return (
                            <motion.div
                              key={t.id}
                              style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                              whileHover={{ scale: 1.2 }}
                              onClick={() => { setSelectedTargetId(t.id); setActiveSubTab('evaluation'); }}
                            >
                              <div className="w-4 h-4 bg-blue-600 hover:bg-blue-700 text-white font-mono text-[9px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                                {idx + 1}
                              </div>
                              <span className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-black text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-xs">
                                {t.name}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ) : optTab === 'radar' ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase">
                          多维度蛛网重叠对比 (Overlay Radar)
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold">全选进行一键覆盖展示</span>
                      </div>
                      
                      <div className="flex justify-center">
                        <svg className="w-56 h-56 overflow-visible" viewBox="0 0 200 200">
                          <circle cx="100" cy="100" r="75" fill="none" stroke="#e2e8f0" strokeDasharray="3" />
                          <circle cx="100" cy="100" r="50" fill="none" stroke="#f1f5f9" />
                          <line x1="100" y1="20" x2="100" y2="180" stroke="#f1f5f9" />
                          <line x1="20" y1="100" x2="180" y2="100" stroke="#f1f5f9" />

                          {/* Render overlapping polygons with distinct colors */}
                          {sortedTargets.slice(0, 3).map((t, idx) => {
                            const colors = ['rgba(6, 182, 212, 0.1)', 'rgba(16, 185, 129, 0.1)', 'rgba(139, 92, 246, 0.1)'];
                            const strokeColors = ['#06b6d4', '#10b981', '#8b5cf6'];
                            
                            const attScore = Math.min(100, Math.round((t.estimatedResources / 6500) * 80 + 20));
                            const relScore = Math.min(100, Math.round(t.geologicPg * 2.2 + 10));
                            const ecoScore = Math.min(100, Math.round((t.baseIrr / 18) * 85 + 15));
                            const strScore = Math.min(100, Math.round(t.offsetFittedRate * 0.9 + 10));

                            const pTop = { x: 100, y: 100 - (attScore * 0.8) };
                            const pRight = { x: 100 + (relScore * 0.8), y: 100 };
                            const pBottom = { x: 100, y: 100 + (ecoScore * 0.8) };
                            const pLeft = { x: 100 - (strScore * 0.8), y: 100 };

                            const pathStr = `M ${pTop.x} ${pTop.y} L ${pRight.x} ${pRight.y} L ${pBottom.x} ${pBottom.y} L ${pLeft.x} ${pLeft.y} Z`;

                            return (
                              <g key={t.id}>
                                <path d={pathStr} fill={colors[idx]} stroke={strokeColors[idx]} strokeWidth="2" opacity="0.8" />
                              </g>
                            );
                          })}

                          <text x="100" y="14" textAnchor="middle" className="text-[10px] font-black fill-slate-500">吸引力</text>
                          <text x="184" y="103" textAnchor="start" className="text-[10px] font-black fill-slate-500">可靠性</text>
                          <text x="100" y="195" textAnchor="middle" className="text-[10px] font-black fill-slate-500">经济性</text>
                          <text x="15" y="103" textAnchor="end" className="text-[10px] font-black fill-slate-500">战略性</text>
                        </svg>
                      </div>

                      <div className="flex justify-around text-[10px] font-bold mt-4">
                        <span className="text-blue-500">● {targets[0].name}</span>
                        <span className="text-emerald-500">● {targets[1].name}</span>
                        <span className="text-purple-500">● {targets[2].name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase">
                          综合排队得分分布直方图
                        </h4>
                        <select className="bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold px-2 py-1">
                          <option>综合排序值</option>
                          <option>地质Pg分</option>
                          <option>资源储备</option>
                        </select>
                      </div>

                      {/* Histogram of scores */}
                      <div className="h-48 flex items-end justify-around gap-2 px-2 border-b border-slate-200 relative">
                        {sortedTargets.map((t, idx) => {
                          const heightPct = Math.min(100, Math.max(10, t.compositeScore));
                          return (
                            <div key={t.id} className="group relative flex flex-col items-center w-12">
                              {/* Hover Tooltip */}
                              <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-slate-900 text-slate-100 text-[10px] font-bold px-2 py-1 rounded shadow-md z-10 whitespace-nowrap">
                                得分: {t.compositeScore} 分
                              </div>
                              <div 
                                style={{ height: `${heightPct * 1.5}px` }}
                                className="w-8 bg-blue-600 hover:bg-blue-500 transition-all rounded-t-lg shadow-sm"
                              ></div>
                              <span className="text-[10px] font-mono font-black text-blue-600 mt-1.5">
                                {t.compositeScore}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-around text-[10px] font-black text-slate-500 mt-3">
                        {sortedTargets.map(t => (
                          <span key={t.id} className="truncate max-w-[50px]" title={t.name}>{t.name.substring(0, 3)}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View B: Knapsack solvers efficient frontier */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                      <h4 className="text-xs font-black text-slate-800 uppercase">
                        资金配置效益前沿边界曲线 (投资规划)
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                        <span>预算控制上限:</span>
                        <input 
                          type="number"
                          step="0.1"
                          value={budgetLimit}
                          onChange={(e) => setBudgetLimit(parseFloat(e.target.value))}
                          className="w-14 bg-slate-50 border border-slate-200 rounded px-1 text-center font-mono text-red-500 font-black"
                        />
                        <span>亿</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-medium mb-3">
                      基于背包算法，计算在有限勘探预算下累计储量最优化组合。红色虚线代表当前最大资金上限。
                    </div>

                    {/* SVG Curve display */}
                    <div className="relative h-44 border-b border-l border-slate-200 bg-slate-50/20 rounded-bl-lg overflow-visible">
                      
                      {/* Budget Limit line */}
                      {(() => {
                        // Max cost is ~10.1 Billion
                        const limitPct = (budgetLimit / 10.1) * 100;
                        return (
                          <div 
                            style={{ left: `${limitPct}%` }}
                            className="absolute top-0 bottom-0 border-l-2 border-red-500 border-dashed z-10 flex flex-col justify-start"
                          >
                            <span className="text-[8px] bg-red-500 text-white font-black px-1 py-0.5 rounded -translate-x-1/2">
                              上限: {budgetLimit} 亿
                            </span>
                          </div>
                        );
                      })()}

                      {/* Cumulative curves plotter */}
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150">
                        {/* Draw curves path */}
                        {(() => {
                          // Accumulate reserve and cost greedy-wise
                          const greedyTargets = [...sortedTargets].sort((a, b) => {
                            const ratioA = a.estimatedResources / a.drillingInvestment;
                            const ratioB = b.estimatedResources / b.drillingInvestment;
                            return ratioB - ratioA;
                          });

                          let currentCost = 0;
                          let currentReserve = 0;
                          const points = [{ x: 0, y: 150 }];

                          greedyTargets.forEach(t => {
                            currentCost += t.drillingInvestment;
                            currentReserve += t.estimatedResources;
                            // scale to 300 x 150
                            const px = (currentCost / 10.1) * 300;
                            const py = 150 - (currentReserve / 18100) * 150;
                            points.push({ x: px, y: py });
                          });

                          let pathStr = "M 0 150";
                          points.forEach(p => {
                            pathStr += ` L ${p.x} ${p.y}`;
                          });

                          return (
                            <>
                              {/* Green frontier path */}
                              <path d={pathStr} fill="none" stroke="#10b981" strokeWidth="3" />
                              {points.map((p, i) => (
                                <circle key={i} cx={p.x} cy={p.y} r="4" fill="#10b981" />
                              ))}
                            </>
                          );
                        })()}
                      </svg>

                      <span className="absolute bottom-1 right-2 text-[8px] text-slate-400 font-bold">累计预算资金 (亿元)</span>
                      <span className="absolute top-1 left-2 text-[8px] text-slate-400 font-bold">累计储量规模 (万吨)</span>
                    </div>

                    {/* Planning Solvers Action Panel */}
                    <div className="flex gap-4 items-center mt-4">
                      <button 
                        onClick={handleKnapsackSolve}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-100"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        规划求解：一键生成最优部署组合
                      </button>
                    </div>

                  </div>

                </div>

              </motion.div>
            )}

            {/* SUB-VIEW 3: PREFERRED POOL MANAGEMENT */}
            {activeSubTab === 'pool' && (
              <motion.div
                key="pool-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col md:flex-row h-full gap-6 items-stretch"
              >
                
                {/* (A) LEFT SIDEBAR: Oilfields Categorized Tree */}
                <div className="w-full md:w-64 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex-shrink-0 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      优选方案分类库 (A)
                    </div>

                    <div className="space-y-2">
                      {OILFIELDS.map(f => {
                        const isSelected = selectedOilfield === f.name;
                        return (
                          <div
                            key={f.name}
                            onClick={() => setSelectedOilfield(f.name)}
                            className={`p-3 rounded-xl border text-xs font-black flex items-center justify-between cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-xs' 
                                : 'bg-slate-50 hover:bg-slate-100/70 border-slate-150 text-slate-600'
                            }`}
                          >
                            <span>{f.name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-white border text-[10px]">
                              {f.name === '吉林油田' ? poolTargets.length : f.count} 个
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {selectedOilfield === '吉林油田' && (
                      <div className="pl-4 border-l border-slate-200 space-y-2 mt-2">
                        <div 
                          onClick={() => setSelectedScheme('滚动')}
                          className={`p-2 rounded text-xs font-bold flex items-center gap-2 cursor-pointer ${
                            selectedScheme === '滚动' ? 'text-blue-600 font-black' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <ChevronRight className="w-3 h-3" />
                          方案-1: 滚动勘探方案 (当前)
                        </div>
                        <div 
                          onClick={() => setSelectedScheme('浅层')}
                          className={`p-2 rounded text-xs font-bold flex items-center gap-2 cursor-pointer ${
                            selectedScheme === '浅层' ? 'text-blue-600 font-black' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <ChevronRight className="w-3 h-3" />
                          方案-2: 浅层构造评价方案
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions for schema */}
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <div className="flex gap-1.5">
                      <input 
                        type="text"
                        placeholder="新方案名称..."
                        value={newSchemeName}
                        onChange={(e) => setNewSchemeName(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 flex-1"
                      />
                      <button 
                        onClick={() => {
                          if (!newSchemeName.trim()) return;
                          alert(`成功新建方案：${newSchemeName}`);
                          setNewSchemeName('');
                        }}
                        className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="新建方案"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedTargetIds({});
                        alert('优选池已成功清空');
                      }}
                      className="w-full py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-[11px] font-black transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      清空 / 归档优选池
                    </button>
                  </div>
                </div>

                {/* (B) RIGHT CONTENT: Aggregate KPI Metrics and Table */}
                <div className="flex-1 flex flex-col justify-start space-y-6">
                  
                  {/* (B) Indicators Micro Dashboard with Pulse Animation on checked change */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between relative overflow-hidden group">
                      <div className="text-[10px] text-slate-400 font-black uppercase">总地质储量</div>
                      <span className="text-2xl font-black text-slate-800 font-mono mt-2 block group-hover:scale-105 transition-transform">
                        {poolSummary.geology} <span className="text-xs font-medium text-slate-400">万吨</span>
                      </span>
                      {poolTargets.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between relative overflow-hidden group">
                      <div className="text-[10px] text-slate-400 font-black uppercase">预测资源总量</div>
                      <span className="text-2xl font-black text-slate-800 font-mono mt-2 block group-hover:scale-105 transition-transform">
                        {poolSummary.resources} <span className="text-xs font-medium text-slate-400">万吨</span>
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between relative overflow-hidden group">
                      <div className="text-[10px] text-slate-400 font-black uppercase">已探明储量比</div>
                      <span className="text-2xl font-black text-blue-600 font-mono mt-2 block group-hover:scale-105 transition-transform">
                        {poolSummary.ratio}
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between relative overflow-hidden group">
                      <div className="text-[10px] text-slate-400 font-black uppercase">需建井总资金</div>
                      <span className="text-2xl font-black text-emerald-600 font-mono mt-2 block group-hover:scale-105 transition-transform">
                        {poolSummary.budget} <span className="text-xs font-medium text-slate-400">亿元</span>
                      </span>
                    </div>
                  </div>

                  {/* (C) PREFERRED POOL DETAIL TABLE */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex-1 flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <span className="text-xs font-black text-slate-800">当前方案：吉林油田深层气藏滚动优选方案 (已评审)</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        精细优选池列表 ({poolTargets.length})
                      </span>
                    </div>

                    {poolTargets.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
                        <AlertTriangle className="w-12 h-12 text-slate-300 mb-3 animate-bounce" />
                        <span className="text-sm font-black">优选池为空，请在「目标优选」中选择加入目标</span>
                      </div>
                    ) : (
                      <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                              <th className="py-3 px-6 w-16 text-center">序号</th>
                              <th className="py-3 px-4">圈闭/砂体名称</th>
                              <th className="py-3 px-4">资源类型</th>
                              <th className="py-3 px-4">储量发现度</th>
                              <th className="py-3 px-4">圈闭成因</th>
                              <th className="py-3 px-4">建井投资</th>
                              <th className="py-3 px-6 w-24 text-center">操作选择</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {poolTargets.map((t, index) => (
                              <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3.5 px-6 text-center font-mono font-black text-slate-400">{index + 1}</td>
                                <td 
                                  className="py-3.5 px-4 font-black text-blue-600 cursor-pointer hover:underline"
                                  onClick={() => { setSelectedTargetId(t.id); setActiveSubTab('evaluation'); }}
                                >
                                  {t.name}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 border text-[10px] font-bold text-slate-600">
                                    {t.resourceType}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="font-bold text-slate-700">{t.maturity}</span>
                                </td>
                                <td className="py-3.5 px-4 text-slate-500 font-medium">{t.origin}</td>
                                <td className="py-3.5 px-4 font-mono font-black text-slate-700">{t.drillingInvestment} 亿</td>
                                <td className="py-3.5 px-6 text-center">
                                  <button 
                                    onClick={() => handleRevokeFromPool(t.id)}
                                    className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg hover:text-red-700 transition-colors"
                                    title="撤销 / 移除"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Master Actions Footer */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 justify-end">
                      <button 
                        onClick={() => alert('成功导出 Excel 报表：吉林油田深层气藏滚动优选方案数据表.xlsx')}
                        className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        批量导出 Excel.xlsx
                      </button>
                      <button 
                        onClick={() => {
                          const name = prompt('请输入新方案另存名称:', '吉林油田深层气藏滚动优选方案-副本');
                          if (name) alert(`成功另存新方案为：${name}`);
                        }}
                        className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Save className="w-4 h-4 text-indigo-500" />
                        另存为新方案
                      </button>
                      <button 
                        onClick={() => alert('已成功向总部专家在线评审组递交方案审核材料。')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-100"
                      >
                        <Send className="w-4 h-4" />
                        提交总部在线评审
                      </button>
                    </div>

                  </div>

                </div>

              </motion.div>
            )}

          </AnimatePresence>
          </div>
        </motion.div>

        {/* ASSISTANT SIDEBAR */}
        <AssistantSidebar
          lang={lang}
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
          agentName={lang === 'zh' ? '勘探目标评价智能体' : 'Exploration Target Evaluation Agent'}
          agentStatus="Idle"
          mode="absolute"
          offsetTop="top-0"
          onRefreshAgent={handleRefreshAi}
        />

      </div>

      {/* Evidence Chain Panel */}
      <EvidenceChainPanel lang={lang} />

    </div>
  );
};
