import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
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
  // Tech badges to give a professional "intelligence" look
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
  { id: 'g2', name: 'PPT生成智能体', description: '根据报告或业务内容自动生成汇报PPT。', category: '通用智能体', usageCount: 890, owner: '系统平台', createdAt: '2023-10-05', icon: 'fa-file-powerpoint', techTags: ['AI-Slides', 'LayoutParse'], version: 'v1.8', status: 'active' },
  { id: 'g3', name: '专业图件智能体', description: '自动生成各类专业的石油行业图件', category: '通用智能体', usageCount: 750, owner: '系统平台', createdAt: '2023-11-12', icon: 'fa-image', techTags: ['VectorGen', 'CAD-Bridge'], version: 'v1.5', status: 'active' },
  { id: 'g4', name: '智能问数智能体', description: '自然语言查询业务数据，自动完成统计分析及图表展示。', category: '通用智能体', usageCount: 2300, owner: '系统平台', createdAt: '2023-09-20', icon: 'fa-chart-line', techTags: ['Text-to-SQL', 'D3-Viz', 'MCP'], version: 'v3.0', status: 'active' },

  { id: 'b1_1', name: '构造解释智能体', description: '基于地震解释成果、构造模型及历史资料，辅助完成构造解释、断层分析及圈闭评价。', category: '勘探评价', usageCount: 420, owner: '勘探院', createdAt: '2023-12-01', icon: 'fa-layer-group', techTags: ['Seismic', 'FaultParse'], version: 'v1.2', status: 'active' },
  { id: 'b1_2', name: '勘探目标评价智能体', description: '综合地质、地震、钻井资料，对勘探目标进行综合评价并形成分析报告。', category: '勘探评价', usageCount: 380, owner: '勘探院', createdAt: '2023-12-05', icon: 'fa-bullseye', techTags: ['Multi-Source', 'RiskScore'], version: 'v1.4', status: 'active' },
  { id: 'b1_3', name: '勘探部署智能体', description: '基于已有研究成果，辅助生成勘探部署方案及论证材料。', category: '勘探评价', usageCount: 310, owner: '勘探院', createdAt: '2023-12-10', icon: 'fa-map-marked-alt', techTags: ['GeoJSON', 'DeployPlan'], version: 'v1.1', status: 'active' },
  { id: 'b1_4', name: '风险勘探智能体', description: '综合多源数据识别勘探风险，分析风险来源并提出规避建议。', category: '勘探评价', usageCount: 290, owner: '勘探院', createdAt: '2023-12-15', icon: 'fa-exclamation-triangle', techTags: ['Anomalies', 'Mitigation'], version: 'v1.0', status: 'active' },

  { id: 'b2_1', name: '地层对比智能体', description: '自动完成井间地层对比、层位划分及差异 analysis。', category: '地质研究', usageCount: 550, owner: '勘探院', createdAt: '2024-01-10', icon: 'fa-align-left', techTags: ['Well-Log', 'StratumMatch'], version: 'v2.0', status: 'active' },
  { id: 'b2_2', name: '沉积相分析智能体', description: '基于测录井、岩心及地震资料辅助完成沉积相分析。', category: '地质研究', usageCount: 460, owner: '勘探院', createdAt: '2024-01-12', icon: 'fa-water', techTags: ['Sedimentology', 'CoreParse'], version: 'v1.3', status: 'active' },
  { id: 'b2_3', name: '储层评价智能体', description: '综合储层参数、测录井及地质资料完成储层综合评价。', category: '地质研究', usageCount: 610, owner: '勘探院', createdAt: '2024-01-15', icon: 'fa-star', techTags: ['ReservoirQuality', 'Facies'], version: 'v2.2', status: 'active' },
  { id: 'b2_4', name: '地质成果智能体', description: '自动整理研究成果并生成地质研究报告。', category: '地质研究', usageCount: 520, owner: '勘探院', createdAt: '2024-01-18', icon: 'fa-book-open', techTags: ['ReportSync', 'GeoKnowledge'], version: 'v1.6', status: 'active' },

  { id: 'b3_1', name: '测井解释智能体', description: '自动解释测井曲线，辅助识别储层及流体性质。', category: '测录井解释', usageCount: 780, owner: '测井公司', createdAt: '2024-02-05', icon: 'fa-wave-square', techTags: ['LogCurve', 'FluidID'], version: 'v2.5', status: 'active' },
  { id: 'b3_2', name: '录井分析智能体', description: '自动分析录井资料、岩屑描述及油气显示信息。', category: '测录井解释', usageCount: 650, owner: '测井公司', createdAt: '2024-02-08', icon: 'fa-microscope', techTags: ['GasShow', 'Lithology'], version: 'v1.9', status: 'active' },
  { id: 'b3_3', name: '测录井综合评价智能体', description: '综合测井与录井成果形成评价结论。', category: '测录井解释', usageCount: 720, owner: '测井公司', createdAt: '2024-02-12', icon: 'fa-clipboard-check', techTags: ['CrossPlot', 'IntegratedInterpret'], version: 'v2.0', status: 'active' },

  { id: 'b4_1', name: '钻井地质设计智能体', description: '自动生成钻井地质设计方案及报告，完成知识引用、内容编写及成果输出。', category: '钻井工程', usageCount: 1150, owner: '钻井院', createdAt: '2024-03-01', icon: 'fa-drafting-compass', techTags: ['DrillDesign', 'AutoWrite', 'RAG'], version: 'v3.2', status: 'active' },
  { id: 'b4_2', name: '钻井风险分析智能体', description: '自动识别井漏、卡钻、地层压力等钻井风险，并提出应对建议。', category: '钻井工程', usageCount: 980, owner: '钻井院', createdAt: '2024-03-05', icon: 'fa-radiation', techTags: ['LostCirculation', 'StuckPipe', 'Alert'], version: 'v2.1', status: 'active' },
  { id: 'b4_3', name: '钻井参数分析智能体', description: '综合分析钻井施工参数，识别异常并提供优化建议。', category: '钻井工程', usageCount: 1050, owner: '钻井院', createdAt: '2024-03-10', icon: 'fa-tachometer-alt', techTags: ['ROP-Optimization', 'WOB', 'RPM'], version: 'v1.7', status: 'active' },
  { id: 'b4_4', name: '钻井施工监控智能体', description: '对钻井施工过程进行实时 analysis、异常监控及预警。', category: '钻井工程', usageCount: 1320, owner: '钻井院', createdAt: '2024-03-15', icon: 'fa-video', techTags: ['RealtimeStreaming', 'IoT-Sensors'], version: 'v4.0', status: 'active' },

  { id: 'b5_1', name: '压裂设计智能体', description: '基于储层特征辅助生成压裂设计方案。', category: '完井压裂', usageCount: 640, owner: '采油厂', createdAt: '2024-04-02', icon: 'fa-project-diagram', techTags: ['FracDesign', 'StressField'], version: 'v1.5', status: 'active' },
  { id: 'b5_2', name: '压裂效果评价智能体', description: '综合施工及生产数据，对压裂效果进行评价分析。', category: '完井压裂', usageCount: 590, owner: '采油厂', createdAt: '2024-04-06', icon: 'fa-chart-area', techTags: ['FracPerformance', 'Microseismic'], version: 'v1.8', status: 'active' },

  { id: 'b6_1', name: '单井分析智能体', description: '对单井生产动态进行综合 analysis，定位影响生产的关键因素。', category: '开发生产', usageCount: 1450, owner: '采油厂', createdAt: '2024-05-01', icon: 'fa-oil-can', techTags: ['NodalAnalysis', 'ProductionDecline'], version: 'v3.1', status: 'active' },
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

export const AgentSquare: React.FC<AgentSquareProps> = ({
  lang,
  onLaunchAgent
}) => {
  const t = translations[lang];
  const [sortBy, setSortBy] = useState<'time' | 'usage'>('usage');
  const [filter, setFilter] = useState('');

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

  const activeCategoryCount = useMemo(() => {
    return CATEGORIES.reduce((acc, cat) => {
      const count = categoriesMap[cat.field]?.length || 0;
      if (count > 0) acc += 1;
      return acc;
    }, 0);
  }, [categoriesMap]);

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
        {/* Subtle grid accent background overlay inside card */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f011_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f011_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
        
        {/* Glowing visual accent line on top of card */}
        <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${categoryTheme} opacity-70 group-hover:opacity-100 transition-opacity`} />

        <div className="relative mb-5">
          <div className="flex items-start justify-between mb-4">
            {/* Intelligent glowing icon circle */}
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

        {/* Footer Row: Owner, Date, Usage count with elegant details */}
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

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden relative">
      {/* Absolute faint grid pattern overlay on the workspace */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-8 py-6 flex-shrink-0 shadow-sm relative z-10 backdrop-blur-md bg-white/95">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {lang === 'zh' ? '智能体广场' : 'Agent Square'}
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              {lang === 'zh' ? '发现并一键调配覆盖勘探、地质、工程及生产的专业智能体集群' : 'Discover and instantly provision domain-specific neural agents'}
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
             <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs"></i>
                <input 
                  type="text" 
                  placeholder={lang === 'zh' ? '搜索智能体、领域、标签...' : t.searchPlaceholder}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs w-64 bg-slate-50/50 hover:bg-slate-50 transition-colors shadow-inner"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                />
             </div>
             
             <div className="flex items-center bg-slate-100/80 rounded-xl p-0.5 border border-slate-200/50">
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

        {/* Category anchors navigation (only shown when not searching) */}
        {!filter && (
          <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 no-scrollbar border-t border-slate-100 pt-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 whitespace-nowrap">分类导航:</span>
            {CATEGORIES.filter(cat => cat.field !== '通用智能体').map(cat => {
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
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 hover:border-indigo-200 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-all whitespace-nowrap shadow-sm hover:shadow"
                >
                  <i className={`fas ${cat.icon} text-slate-400 group-hover:text-indigo-500 text-[10px]`}></i>
                  <span>{cat.name}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200/60 text-slate-500 font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 scroll-smooth relative z-10">
        {filter ? (
          /* Search Results */
          <div className="mb-10">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
          /* Default Layout: Categorized All */
          <div>
            {CATEGORIES.map(cat => {
              let items = categoriesMap[cat.field] || [];
              if (items.length === 0) return null;
              
              return (
                <div key={cat.id} id={`cat-sec-${cat.id}`} className="mb-12 scroll-mt-6">
                  {/* Category Section Header with Beautiful Smart UI lines */}
                  <div className="flex items-center justify-between mb-6 border-b border-slate-200/50 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-md shadow-slate-100`}>
                        <i className={`fas ${cat.icon} text-sm`}></i>
                      </div>
                      <div>
                        <h2 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
                          {cat.name}
                        </h2>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {items.map(tpl => renderCard(tpl, cat.color))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
