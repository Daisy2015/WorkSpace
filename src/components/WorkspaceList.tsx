import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Workspace, WorkspaceStatus, Language, WorkspaceTemplate } from '../types';
import { ShareWorkspaceModal } from './ShareWorkspaceModal';
import { templates as reportTemplates, ReportTemplate, getChapters, getUsageCount } from './SmartReportCreateModal';

interface WorkspaceListProps {
  workspaces: Workspace[];
  templates: WorkspaceTemplate[];
  onSelectWorkspace: (
    id: string,
    name?: string,
    description?: string,
    objects?: any[],
    autoOpenAddResource?: boolean,
    defaultAgent?: string
  ) => void;
  onUpdateWorkspace: (id: string, data: Partial<Workspace>) => void;
  onDeleteWorkspace: (id: string) => void;
  onSaveAsTemplate: (id: string) => void;
  onCreateFromTemplate: (template: WorkspaceTemplate, name?: string, description?: string, objects?: any[], defaultAgent?: string) => void;
  onStartIntelligentConstruction?: (name: string, description: string, objects: any[]) => void;
  lang: Language;
  initialLaunchAgentName?: string | null;
  onClearInitialLaunchAgent?: () => void;
}

const CURRENT_USER = '李明';

const WORKSPACE_OBJECT_TYPES = [
  { id: 'well', nameZh: '井', nameEn: 'Well', icon: 'fa-bore-hole' },
  { id: 'block', nameZh: '区块', nameEn: 'Block', icon: 'fa-vector-square' },
  { id: 'oilfield', nameZh: '油气田', nameEn: 'Oilfield', icon: 'fa-layer-group' },
  { id: 'reservoir', nameZh: '产层/地层', nameEn: 'Reservoir', icon: 'fa-mountain' },
];

const WORKSPACE_OBJECTS_REGISTRY: Record<string, string[]> = {
  well: [
    '井-01', '井-02', '井-03', '井-04', '井-05',
    '苏平-1井', '苏平-2井', '苏12-3井', '苏77-4井', '苏54-2井',
    '塔深-1井', '塔深-2井', '塔101井', '塔232井', '塔中-12井',
    '玛湖-1井', '玛平-4井', '玛33井',
    '长华-11井', '长56井'
  ],
  block: [
    '苏里格区块', '苏中区块', '苏西区块',
    '塔中区块', '塔北区块', '哈拉哈塘区块',
    '玛湖区块', '吉木萨尔区块',
    '靖边区块', '神木区块', '安塞区块'
  ],
  oilfield: [
    '大庆油田', '塔里木油田', '胜利油田', '长庆油田', '西南油气田', '新疆油田', '华北油田'
  ],
  reservoir: [
    '奥陶系马家沟组', '石炭系卡拉沙依组', '二叠系太原组', '三叠系延长组', '侏罗系延安组',
    '二叠系石盒子组', '侏罗系三间房组', '白垩系清水河组'
  ]
};

const CHART_TEMPLATES = [
  { id: '1', nameZh: '层序地层与沉积微相综合柱状图', nameEn: 'Sequence Stratigraphy Column', categoryZh: '单井柱状图', categoryEn: 'Well Log', image: '/src/assets/images/regenerated_image_1780629841532.png' },
  { id: '2', nameZh: '碳酸盐岩屑录井图', nameEn: 'Carbonate Cutting Log', categoryZh: '单井柱状图', categoryEn: 'Well Log', image: '/src/assets/images/regenerated_image_1780629664519.png' },
  { id: '3', nameZh: '层序旋回划分柱状图', nameEn: 'Sequence Cycle Column', categoryZh: '单井柱状图', categoryEn: 'Well Log', image: '/src/assets/images/regenerated_image_1780629650260.png' },
  { id: '4', nameZh: '碎屑岩岩心综合图', nameEn: 'Clastic Rock Core Chart', categoryZh: '单井柱状图', categoryEn: 'Well Log', image: '/src/assets/images/regenerated_image_1780629652826.png' },
  { id: '5', nameZh: '测井解释和测试成果综合图', nameEn: 'Logging & Testing Result Chart', categoryZh: '单井柱状图', categoryEn: 'Well Log', image: '/src/assets/images/regenerated_image_1780629656116.png' },
  { id: '6', nameZh: '综合录井图', nameEn: 'Comprehensive Well Log', categoryZh: '单井柱状图', categoryEn: 'Well Log', image: '/src/assets/images/regenerated_image_1780629659574.png' },
];

const AGENTS = [
  { id: '智能问数', name: '智能问数', desc: '基于测井、录井等多源异构数据，提供智能数据查询、统计分析和多轮问答服务。' },
  { id: '智能成图', name: '智能成图', desc: '支持自动生成专业版地质图表，包含连井剖面、小层平面及综合图表。' },
  { id: '智能报告', name: '智能报告', desc: '用于一键自动生成或在线辅助编辑标准完井及地质设计报告。' },
  { id: '单井产量诊断', name: '单井产量诊断', desc: '基于生产动态数据及工况参数，智能诊断单井产能发挥及递减主控因素。' },
];

const AGENT_CONFIGS: Record<string, {
  key: string;
  label: string;
  type: 'select' | 'text';
  defaultValue: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
}[]> = {
  '智能成图': [
    {
      key: 'chart_class',
      label: '图件类别',
      type: 'select',
      defaultValue: 'log_curve',
      options: [
        { value: 'log_curve', label: '测井综合曲线图' },
        { value: 'geology_profile', label: '油藏地质剖面图' },
        { value: 'well_profile', label: '连井对比剖面图' },
        { value: 'structure_map', label: '小层平面构造图' },
      ]
    },
    {
      key: 'map_scale',
      label: '出图比例尺',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '自动适应' },
        { value: '1_1000', label: '1:1000' },
        { value: '1_2000', label: '1:2000' },
        { value: '1_5000', label: '1:5000' },
      ]
    },
    {
      key: 'data_filter',
      label: '绘图数据源',
      type: 'select',
      defaultValue: 'all',
      options: [
        { value: 'all', label: '全部地质及录测井数据' },
        { value: 'logging', label: '仅限电测井数据' },
        { value: 'drilling', label: '仅限随钻录井数据' },
      ]
    }
  ],
  '智能报告': [
    {
      key: 'well_horizon',
      label: '钻井层位',
      type: 'select',
      defaultValue: 'all',
      options: [
        { value: 'all', label: '全部层位' },
        { value: 'shahejie', label: '沙河街组 (Shahejie)' },
        { value: 'dongying', label: '东营组 (Dongying)' },
        { value: 'guantao', label: '馆陶组 (Guantao)' },
      ]
    },
    {
      key: 'design_template',
      label: '设计模板',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { value: 'standard', label: '标准钻井分析模版' },
        { value: 'geology', label: '地质设计规范模版' },
        { value: 'completion', label: '完井工程设计模版' },
      ]
    },
    {
      key: 'analysis_scope',
      label: '分析范围',
      type: 'select',
      defaultValue: 'single',
      options: [
        { value: 'single', label: '单井详细分析' },
        { value: 'multi', label: '多井对比关联' },
        { value: 'block', label: '区块整体评估' },
      ]
    }
  ],
  '单井产量诊断': [
    {
      key: 'diagnosis_model',
      label: '诊断分析模型',
      type: 'select',
      defaultValue: 'decline',
      options: [
        { value: 'decline', label: 'Arps 递减分析模型' },
        { value: 'nodal', label: '节点系统流动效率分析' },
        { value: 'anomaly', label: '异常工况诊断分类模型' },
      ]
    },
    {
      key: 'time_step',
      label: '产量比对频次',
      type: 'select',
      defaultValue: 'daily',
      options: [
        { value: 'daily', label: '日频产液/产油数据' },
        { value: 'monthly', label: '月频累计产液量数据' },
      ]
    }
  ]
};

const INITIAL_OBJECTS = [
  { value: 'daqing', label: '大庆油气田' },
  { value: 'tarim', label: '塔里木油气田' },
  { value: 'sulige', label: '苏里格区块' },
  { value: 'tazhong', label: '塔中区块' },
  { value: 'well-x1', label: 'X-1 井' },
  { value: 'well-x2', label: 'X-2 井' },
];

const INITIAL_TEMPLATES = [
  { value: 'tpl-drilling', label: '标准钻井分析模版' },
  { value: 'tpl-risk', label: '勘探风险评估模版' },
  { value: 'tpl-daily', label: '个人日报模版' },
  { value: 'tpl-geo', label: '井位部署与地质设计' },
];

const INITIAL_TIMES = [
  { value: 'week', label: '最近一周' },
  { value: 'month', label: '最近一月' },
  { value: 'quarter', label: '最近一季度' },
  { value: 'year', label: '最近一年' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: '最近更新', labelEn: 'Recently Updated' },
  { value: 'created', label: '创建时间', labelEn: 'Created Time' },
  { value: 'name-az', label: '名称(A-Z)', labelEn: 'Name (A-Z)' },
  { value: 'name-za', label: '名称(Z-A)', labelEn: 'Name (Z-A)' },
];

const getAgentDetailText = (id: string) => {
  switch (id) {
    case '智能问数':
      return '基于测井、录井及开发生产等多源数据，提供智能数据查询、分析和智能交互问答服务。';
    case '智能成图':
      return '自动生成专业版地质图表，支持多套样式、连井对比剖面和小层平面图，可导出及在线协作编辑。';
    case '智能报告':
      return '智能生成标准钻井、地质设计和完井报告，支持一键生成、智能纠错及大纲结构化定制。';
    case '单井产量诊断':
      return '自动诊断单井产量递减及产能发挥的主控因素，智能甄别异常并生成诊断与治理建议。';
    default:
      return '用于自动处理专属业务，保存业务上下文并自动提供 AI 协助。';
  }
};

export const WorkspaceList: React.FC<WorkspaceListProps> = ({
  workspaces,
  templates = [],
  onSelectWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace,
  onSaveAsTemplate,
  onCreateFromTemplate,
  onStartIntelligentConstruction,
  lang,
  initialLaunchAgentName,
  onClearInitialLaunchAgent,
}) => {
  // Classification Tabs: 'my' | 'shared' (Default is 'my')
  const [activeTab, setActiveTab] = useState<'my' | 'shared'>('my');

  // Search query & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recent');

  // Creation Mode & States
  const [creationTab, setCreationTab] = useState<'blank' | 'template'>('blank');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Creation Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [creationStep, setCreationStep] = useState<'basic' | 'config'>('basic');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAgent, setNewAgent] = useState('智能问数');
  const [initObject, setInitObject] = useState('');
  const [initTemplate, setInitTemplate] = useState('');
  const [initTimeRange, setInitTimeRange] = useState('');
  const [nameError, setNameError] = useState('');
  const [configureLater, setConfigureLater] = useState(false);
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [agentSearchQuery, setAgentSearchQuery] = useState('');

  // Agent Specific Configuration State
  const [agentConfig, setAgentConfig] = useState<Record<string, string>>({
    data_scope: 'all',
    query_depth: 'hybrid',
  });

  // Workspace Objects selection state
  const [selectedWorkspaceObjects, setSelectedWorkspaceObjects] = useState<{ type: string; name: string }[]>([]);
  const [activeObjectType, setActiveObjectType] = useState<string>('well');
  const [objectSearchQuery, setObjectSearchQuery] = useState<string>('');
  const [isObjectDropdownOpen, setIsObjectDropdownOpen] = useState<boolean>(false);

  // Reset step on drawer close
  React.useEffect(() => {
    if (!isDrawerOpen) {
      setCreationStep('basic');
      setSelectedWorkspaceObjects([]);
      setActiveObjectType('well');
      setObjectSearchQuery('');
      setIsObjectDropdownOpen(false);
      setChartObject('');
      setSelectedChartTemplate('1');
      setChartActiveCategory(lang === 'zh' ? '单井柱状图' : 'Well Log');
    }
  }, [isDrawerOpen]);

  React.useEffect(() => {
    if (initialLaunchAgentName) {
      setIsDrawerOpen(true);
      setNewName(lang === 'zh' ? `${initialLaunchAgentName}工作空间` : `${initialLaunchAgentName} Workspace`);
      
      let targetAgent = '智能问数';
      if (initialLaunchAgentName.includes('报告') || initialLaunchAgentName.includes('设计') || initialLaunchAgentName.includes('Report')) {
        targetAgent = '智能报告';
      } else if (initialLaunchAgentName.includes('成图') || initialLaunchAgentName.includes('图件') || initialLaunchAgentName.includes('Chart') || initialLaunchAgentName.includes('Mapping')) {
        targetAgent = '智能成图';
      } else if (initialLaunchAgentName.includes('产量') || initialLaunchAgentName.includes('单井') || initialLaunchAgentName.includes('诊断') || initialLaunchAgentName.includes('Decline')) {
        targetAgent = '单井产量诊断';
      }
      
      setNewAgent(targetAgent);
      const configs = AGENT_CONFIGS[targetAgent] || [];
      const initialConfig: Record<string, string> = {};
      configs.forEach((field) => {
        initialConfig[field.key] = field.defaultValue;
      });
      setAgentConfig(initialConfig);
      
      onClearInitialLaunchAgent?.();
    }
  }, [initialLaunchAgentName, lang, onClearInitialLaunchAgent]);

  // Translate active chart category when language toggles
  React.useEffect(() => {
    if (lang === 'zh') {
      if (chartActiveCategory === 'Well Log') setChartActiveCategory('单井柱状图');
      else if (chartActiveCategory === 'Map') setChartActiveCategory('平面图');
      else if (chartActiveCategory === 'Stats') setChartActiveCategory('统计图');
      else if (chartActiveCategory === 'Engineering') setChartActiveCategory('工程管柱图');
      else if (chartActiveCategory === '3D') setChartActiveCategory('三维图');
    } else {
      if (chartActiveCategory === '单井柱状图') setChartActiveCategory('Well Log');
      else if (chartActiveCategory === '平面图') setChartActiveCategory('Map');
      else if (chartActiveCategory === '统计图') setChartActiveCategory('Stats');
      else if (chartActiveCategory === '工程管柱图') setChartActiveCategory('Engineering');
      else if (chartActiveCategory === '三维图') setChartActiveCategory('3D');
    }
  }, [lang]);

  // Special interactive configurations for different agents (Step 2)
  const [reportTopic, setReportTopic] = useState('');
  const [selectedReportTemplateId, setSelectedReportTemplateId] = useState('A1');
  const [reportActiveCategory, setReportActiveCategory] = useState(lang === 'zh' ? '钻井地质' : 'Drilling & Geology');
  const [reportNeedOutline, setReportNeedOutline] = useState(true);

  React.useEffect(() => {
    if (newAgent === '智能报告' && selectedReportTemplateId) {
      const t = reportTemplates.find(item => item.id === selectedReportTemplateId);
      if (t) {
        setReportTopic(lang === 'zh' ? t.defaultTopic : t.defaultTopicEn);
      }
    }
  }, [selectedReportTemplateId, lang, newAgent]);

  const [reportOutline, setReportOutline] = useState<string[]>(['intro', 'structure', 'fluid', 'risk']);
  const [reportVibe, setReportVibe] = useState<string>('professional');
  const [chartLayers, setChartLayers] = useState<string[]>(['boundaries', 'curves', 'pressures']);
  const [chartTheme, setChartTheme] = useState<string>('geology_blue');
  const [chartObject, setChartObject] = useState('');
  const [selectedChartTemplate, setSelectedChartTemplate] = useState('1');
  const [chartActiveCategory, setChartActiveCategory] = useState(lang === 'zh' ? '单井柱状图' : 'Well Log');
  const [diagnosticPipelines, setDiagnosticPipelines] = useState<string[]>(['denoise', 'shutin', 'sensitivity']);
  const [diagnosticDepth, setDiagnosticDepth] = useState<string>('deep');

  const availableAgents = useMemo(() => {
    return AGENTS;
  }, []);

  const filteredDropdownAgents = useMemo(() => {
    return availableAgents.filter((agent) =>
      agent.name.toLowerCase().includes(agentSearchQuery.toLowerCase())
    );
  }, [availableAgents, agentSearchQuery]);

  const getAgentEmoji = (id: string) => {
    switch (id) {
      case '智能问数':
        return '💬';
      case '智能成图':
        return '🎨';
      case '智能报告':
        return '✍️';
      case '单井产量诊断':
        return '📈';
      default:
        return '🤖';
    }
  };

  const getAgentColorStyles = (id: string) => {
    switch (id) {
      case '智能问数':
        return {
          bg: 'bg-indigo-50/50',
          border: 'border-indigo-100/80',
          text: 'text-indigo-600',
          gradient: 'from-indigo-500 to-sky-500'
        };
      case '智能成图':
        return {
          bg: 'bg-purple-50/50',
          border: 'border-purple-100/80',
          text: 'text-purple-600',
          gradient: 'from-purple-500 to-indigo-500'
        };
      case '智能报告':
        return {
          bg: 'bg-emerald-50/50',
          border: 'border-emerald-100/80',
          text: 'text-emerald-600',
          gradient: 'from-emerald-500 to-teal-500'
        };
      case '单井产量诊断':
        return {
          bg: 'bg-rose-50/50',
          border: 'border-rose-100/80',
          text: 'text-rose-600',
          gradient: 'from-orange-500 to-rose-500'
        };
      default:
        return {
          bg: 'bg-blue-50/50',
          border: 'border-blue-100/80',
          text: 'text-blue-600',
          gradient: 'from-blue-500 to-indigo-500'
        };
    }
  };

  const renderSection1 = () => {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50/50 flex items-center justify-center text-blue-600 flex-shrink-0">
            <i className="fas fa-folder text-lg"></i>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              {lang === 'zh' ? '工作空间信息' : 'Workspace Info'}
            </h4>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              {lang === 'zh' ? '工作空间名称' : 'Workspace Name'}
              <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={50}
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (e.target.value.trim()) setNameError('');
                }}
                placeholder={lang === 'zh' ? '请输入工作空间名称' : 'Enter workspace name'}
                className={`w-full pl-4 pr-16 py-3 bg-slate-50/30 border ${
                  nameError ? 'border-red-400 focus:ring-red-100' : 'border-slate-200/60 focus:ring-blue-100'
                } rounded-xl text-xs focus:bg-white focus:ring-4 outline-none transition-all placeholder:text-gray-400 text-slate-800 font-medium`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-medium font-mono">
                {newName.length} / 50
              </span>
            </div>
            {nameError && <p className="text-red-500 text-[11px] mt-1 font-medium">{nameError}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {lang === 'zh' ? '工作空间描述' : 'Workspace Description'}
            </label>
            <div className="relative">
              <textarea
                maxLength={300}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder={lang === 'zh' ? '请输入工作空间描述' : 'Enter workspace description'}
                className="w-full pl-4 pr-4 pt-3 pb-8 bg-slate-50/30 border border-slate-200/60 rounded-xl text-xs focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none resize-none transition-all placeholder:text-slate-400 text-slate-800 leading-relaxed font-medium"
                rows={4}
              />
              <span className="absolute right-4 bottom-3 text-[11px] text-slate-400 font-medium font-mono">
                {newDesc.length} / 300
              </span>
            </div>
          </div>

          {/* Workspace Objects Selector */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              {lang === 'zh' ? '工作空间对象' : 'Workspace Objects'}
              <span className="text-slate-400 font-normal text-[10px]">
                {lang === 'zh' ? '(先选类型，再搜并添加对象)' : '(Select type first, then search and add)'}
              </span>
            </label>

            <div className="flex gap-2 items-center">
              {/* Dropdown 1: Object Type */}
              <div className="relative w-1/3 min-w-[90px]">
                <select
                  value={activeObjectType}
                  onChange={(e) => {
                    setActiveObjectType(e.target.value);
                    setObjectSearchQuery('');
                    setIsObjectDropdownOpen(false);
                  }}
                  className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs outline-none focus:bg-white focus:ring-4 focus:ring-blue-100/30 transition-all text-slate-800 font-bold appearance-none cursor-pointer"
                >
                  {WORKSPACE_OBJECT_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {lang === 'zh' ? type.nameZh : type.nameEn}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>

              {/* Dropdown/Input 2: Search corresponding names */}
              <div className="relative flex-1">
                <div className="relative">
                  <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                  <input
                    type="text"
                    value={objectSearchQuery}
                    onChange={(e) => {
                      setObjectSearchQuery(e.target.value);
                      setIsObjectDropdownOpen(true);
                    }}
                    onFocus={() => setIsObjectDropdownOpen(true)}
                    placeholder={lang === 'zh' ? '输入或检索对象名称...' : 'Search or enter name...'}
                    className="w-full pl-9 pr-12 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs outline-none focus:bg-white focus:ring-4 focus:ring-blue-100/30 transition-all text-slate-800 font-medium placeholder:text-slate-400"
                  />
                  {objectSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setObjectSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>

                {/* Suggestions dropdown popup list */}
                {isObjectDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setIsObjectDropdownOpen(false)} 
                    />
                    
                    <div className="absolute left-0 right-0 mt-1.5 max-h-48 overflow-y-auto bg-white border border-slate-200/80 rounded-xl shadow-lg z-40 custom-scrollbar py-1 divide-y divide-slate-50">
                      {(() => {
                        const availableList = WORKSPACE_OBJECTS_REGISTRY[activeObjectType] || [];
                        const query = objectSearchQuery.trim().toLowerCase();
                        
                        const filtered = availableList.filter((name) => {
                          const isAlreadySelected = selectedWorkspaceObjects.some(
                            (o) => o.type === activeObjectType && o.name === name
                          );
                          return !isAlreadySelected && name.toLowerCase().includes(query);
                        });

                        const handleAddObj = (name: string) => {
                          setSelectedWorkspaceObjects((prev) => [
                            ...prev,
                            { type: activeObjectType, name }
                          ]);
                          setObjectSearchQuery('');
                          setIsObjectDropdownOpen(false);
                        };

                        return (
                          <>
                            {filtered.map((name) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => handleAddObj(name)}
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center justify-between"
                              >
                                <span>{name}</span>
                                <span className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">
                                  {lang === 'zh' ? '推荐' : 'REC'}
                                </span>
                              </button>
                            ))}
                            
                            {query && !selectedWorkspaceObjects.some(o => o.type === activeObjectType && o.name.toLowerCase() === query) && (
                              <button
                                type="button"
                                onClick={() => handleAddObj(objectSearchQuery.trim())}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50/50 transition-colors flex items-center gap-1.5"
                              >
                                <i className="fas fa-plus text-[10px]"></i>
                                <span>{lang === 'zh' ? `添加自定义 "${objectSearchQuery.trim()}"` : `Add custom "${objectSearchQuery.trim()}"`}</span>
                              </button>
                            )}

                            {filtered.length === 0 && !query && (
                              <div className="px-4 py-3 text-center text-slate-400 text-[11px] font-medium">
                                {lang === 'zh' ? '暂无可选择的对象' : 'No options available'}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Selected Objects categorized list badges */}
            {selectedWorkspaceObjects.length > 0 && (
              <div className="mt-4 p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {lang === 'zh' ? '已添加对象' : 'Added Objects'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedWorkspaceObjects([])}
                    className="text-[10px] text-slate-400 hover:text-rose-500 font-bold transition-colors flex items-center gap-1"
                  >
                    <i className="fas fa-trash-alt text-[9px]"></i>
                    <span>{lang === 'zh' ? '清空' : 'Clear All'}</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-36 overflow-y-auto custom-scrollbar">
                  {WORKSPACE_OBJECT_TYPES.map((typeObj) => {
                    const items = selectedWorkspaceObjects.filter((o) => o.type === typeObj.id);
                    if (items.length === 0) return null;

                    return (
                      <div key={typeObj.id} className="flex items-start gap-2 text-xs">
                        <div className="flex items-center gap-1 flex-shrink-0 w-16 py-0.5 text-slate-500 font-bold text-[11px]">
                          <i className={`fas ${typeObj.icon} text-[10px] opacity-75`}></i>
                          <span>{lang === 'zh' ? typeObj.nameZh : typeObj.nameEn}:</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 flex-1">
                          {items.map((item) => (
                            <div
                              key={item.name}
                              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] text-slate-700 font-bold shadow-sm"
                            >
                              <span>{item.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedWorkspaceObjects((prev) =>
                                    prev.filter((o) => !(o.type === typeObj.id && o.name === item.name))
                                  );
                                }}
                                className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-slate-50 transition-colors"
                              >
                                <i className="fas fa-times text-[8px]"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSection2 = () => {
    // Filter agents based on name or description/detail-text matching the search query
    const filteredAgents = availableAgents.filter((agent) =>
      agent.name.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
      getAgentDetailText(agent.id).toLowerCase().includes(agentSearchQuery.toLowerCase())
    );

    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col h-[520px]">
        {/* Title Block */}
        <div className="flex gap-3 items-center flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50/50 flex items-center justify-center text-blue-600 flex-shrink-0">
            <i className="fas fa-robot text-lg"></i>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800">
              {lang === 'zh' ? '选择协同智能体' : 'Select Collaborative Agent'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'zh'
                ? '支持从海量智能体中搜索并选择，一键绑定至工作空间。'
                : 'Search and select from hundreds of agents to bind.'}
            </p>
          </div>
        </div>

        {/* Sticky Search bar directly inside the section */}
        <div className="mt-4 flex-shrink-0 relative">
          <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={agentSearchQuery}
            onChange={(e) => setAgentSearchQuery(e.target.value)}
            placeholder={lang === 'zh' ? '快速检索智能体名称或功能描述...' : 'Search agent name or descriptions...'}
            className="w-full pl-9 pr-24 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 font-medium placeholder:text-slate-400"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {agentSearchQuery && (
              <button
                type="button"
                onClick={() => setAgentSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 text-xs transition-colors"
                title={lang === 'zh' ? '清空' : 'Clear'}
              >
                <i className="fas fa-times-circle"></i>
              </button>
            )}
            <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md font-bold font-mono">
              {lang === 'zh' ? `共 ${filteredAgents.length} 项` : `${filteredAgents.length} found`}
            </span>
          </div>
        </div>

        {/* Scrollable List Container */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-2 custom-scrollbar">
          {filteredAgents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
                <i className="fas fa-folder-open text-lg"></i>
              </div>
              <p className="text-xs font-bold text-slate-600">
                {lang === 'zh' ? '未找到匹配的智能体' : 'No matching agents found'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {lang === 'zh' ? '尝试调整您的搜索关键字' : 'Try adjusting your search terms'}
              </p>
            </div>
          ) : (
            filteredAgents.map((agent) => {
              const isSelected = agent.id === newAgent;
              const styles = getAgentColorStyles(agent.id);
              const emoji = getAgentEmoji(agent.id);
              const detailText = getAgentDetailText(agent.id);
              
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => handleAgentChange(agent.id)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all duration-200 flex items-start gap-3.5 relative group cursor-pointer ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50/10 shadow-[0_4px_16px_rgba(59,130,246,0.06)] ring-1 ring-blue-500/20' 
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/40 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${styles.gradient} flex items-center justify-center text-lg shadow-sm text-white flex-shrink-0 transition-transform group-hover:scale-105 duration-200`}>
                    {emoji}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-6">
                    <h5 className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                      {agent.name}
                    </h5>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5 font-medium line-clamp-2">
                      {detailText}
                    </p>
                  </div>

                  <div className="absolute top-4 right-4 flex-shrink-0">
                    {isSelected ? (
                      <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
                        <i className="fas fa-check text-[8px] font-black"></i>
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 bg-white transition-colors group-hover:border-slate-400" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderSection3 = () => {
    return (
      <div className="space-y-6">
            {newAgent === '智能报告' && (() => {
              const reportCategories = lang === 'zh' 
                ? ['钻井地质', '开发方案', '工程设计', '动态分析', '储量评估']
                : ['Drilling & Geology', 'Development Scheme', 'Engineering Design', 'Dynamic Analysis', 'Reserve Assessment'];

              const filteredTemplates = reportTemplates.filter(t => {
                if (lang === 'zh') {
                  return t.category === reportActiveCategory;
                } else {
                  const idx = reportCategories.indexOf(reportActiveCategory);
                  const zhCat = ['钻井地质', '开发方案', '工程设计', '动态分析', '储量评估'][idx];
                  return t.category === zhCat;
                }
              });

              return (
                <div className="space-y-6 animate-fadeIn">
                  {/* TOP SECTION: Natural Language Inputs */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex gap-3 items-center mb-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                        <i className="fas fa-file-invoice text-base"></i>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {lang === 'zh' ? '智能报告：编写需求描述' : 'Report Requirements Description'}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {lang === 'zh' ? '请描述您的编写需求，或在下方选择报告模板自动生成默认描述' : 'Describe your writing requirements or pick a template below'}
                        </p>
                      </div>
                    </div>

                    <textarea 
                      value={reportTopic}
                      onChange={(e) => setReportTopic(e.target.value)}
                      placeholder={lang === 'zh' ? '请描述您的编写需求，例如：生成X-101井浅海大位移水平井钻井地质设计，重点刻画靶区断裂带发育特征，并提供合理的井身结构与安全窗口范围...' : 'Describe what you want to write...'}
                      className="w-full h-20 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none shadow-inner leading-relaxed text-slate-700 font-medium"
                    />
                  </div>

                  {/* BOTTOM SECTION: Existing Templates */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {lang === 'zh' ? '已有报告模板' : 'Existing Report Templates'}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {lang === 'zh' ? '选择一个基础模板开始您的报告生成定制' : 'Select a starting template for your custom report'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl w-fit">
                      {reportCategories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setReportActiveCategory(cat)}
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            reportActiveCategory === cat ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Templates Grid (Bento Style) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredTemplates.map(t => {
                        const isSelected = selectedReportTemplateId === t.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => {
                              setSelectedReportTemplateId(t.id);
                              setReportTopic(lang === 'zh' ? t.defaultTopic : t.defaultTopicEn);
                            }}
                            className={`group relative flex flex-col justify-between p-4 rounded-xl bg-white border-2 transition-all cursor-pointer ${
                              isSelected 
                                ? 'border-indigo-500 ring-4 ring-indigo-500/10' 
                                : 'border-slate-100 hover:border-slate-200'
                            }`}
                          >
                            {/* Selected Indicator */}
                            {isSelected && (
                              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] shadow-sm">
                                <i className="fas fa-check"></i>
                              </div>
                            )}

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] ${
                                  isSelected ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-500'
                                } transition-colors`}>
                                  <i className="fas fa-file-alt"></i>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <h4 className={`text-xs font-black tracking-tight leading-snug ${isSelected ? 'text-indigo-600' : 'text-slate-800'}`}>
                                  {lang === 'zh' ? t.name : t.nameEn}
                                </h4>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed line-clamp-2">
                                  {lang === 'zh' ? t.description : t.descriptionEn}
                                </p>
                              </div>
                            </div>

                            {/* Metadata Footer */}
                            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-wider">
                              <div className="flex items-center gap-1">
                                <i className="fas fa-list-ol text-slate-300"></i>
                                <span>{getChapters(t.id, t.pages)} {lang === 'zh' ? '章' : 'Chapters'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <i className="fas fa-chart-line text-slate-300"></i>
                                <span>{getUsageCount(t.id)} {lang === 'zh' ? '次使用' : 'Uses'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <i className="fas fa-calendar-alt text-slate-300"></i>
                                <span>{t.date}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* OUTLINE SETTING */}
                  <div className="flex items-center justify-between p-4 bg-white border border-slate-200/60 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${reportNeedOutline ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-400 border border-slate-200/50'}`}>
                        <i className="fas fa-list-ul text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          {lang === 'zh' ? '是否需要先进行大纲和编写素材确认' : 'Confirm outline and writing materials first'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {lang === 'zh' ? '开启后，系统在开始正式编写前，会先生成详细的大纲与参考素材供您确认和微调' : 'The system will generate a detailed outline and source materials for you to verify first'}
                        </p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setReportNeedOutline(!reportNeedOutline)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${reportNeedOutline ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${reportNeedOutline ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              );
            })()}

            {newAgent === '智能成图' && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <i className="fas fa-oil-well text-lg"></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {lang === 'zh' ? '智能成图：专业地质图件初始化' : 'Smart Plotting: Professional Strata Map Initialization'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {lang === 'zh' ? '请描述您要生成的图件内容，或选择经典出图模版。' : 'Describe your mapping requirement or choose a professional template.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {lang === 'zh' ? '成图描述' : 'Mapping Description'}
                    </label>
                    <textarea 
                      value={chartObject}
                      onChange={(e) => setChartObject(e.target.value)}
                      placeholder={lang === 'zh' ? '请描述您想生成的图件，例如：生成X-1井的长序地层与沉积微相综合柱状图，包含GR、LLS和LLD三条曲线...' : 'Describe what you want to plot...'}
                      className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none shadow-inner text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      {lang === 'zh' ? '已有图件模版' : 'Existing Chart Templates'}
                    </label>
                    
                    {/* Tabs */}
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl w-fit mb-4">
                      {(lang === 'zh' ? ['单井柱状图', '平面图', '统计图', '工程管柱图', '三维图'] : ['Well Log', 'Map', 'Stats', 'Engineering', '3D']).map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setChartActiveCategory(cat)}
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            chartActiveCategory === cat ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Template Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {(() => {
                        const filteredTemplates = CHART_TEMPLATES.filter(t => 
                          (lang === 'zh' ? t.categoryZh : t.categoryEn) === chartActiveCategory
                        );

                        if (filteredTemplates.length > 0) {
                          return filteredTemplates.map(t => (
                            <div 
                              key={t.id}
                              onClick={() => {
                                setSelectedChartTemplate(t.id);
                                setChartObject(lang === 'zh' ? `生成${t.nameZh}。` : `Generate ${t.nameEn}.`);
                              }}
                              className={`group relative flex flex-col rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                selectedChartTemplate === t.id ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-100 hover:border-slate-200'
                              }`}
                            >
                              <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                                <img 
                                  referrerPolicy="no-referrer"
                                  src={t.image} 
                                  alt={lang === 'zh' ? t.nameZh : t.nameEn}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                />
                                {selectedChartTemplate === t.id && (
                                  <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                                      <i className="fas fa-check"></i>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="p-2.5 bg-white">
                                <p className={`text-[10px] font-bold leading-tight ${selectedChartTemplate === t.id ? 'text-indigo-600' : 'text-slate-600'}`}>
                                  {lang === 'zh' ? t.nameZh : t.nameEn}
                                </p>
                              </div>
                            </div>
                          ));
                        } else {
                          return (
                            <div className="col-span-3 py-10 flex flex-col items-center justify-center text-slate-300">
                              <i className="fas fa-layer-group text-3xl mb-3"></i>
                              <p className="text-xs font-semibold">{lang === 'zh' ? '该分类下暂无模版' : 'No templates in this category'}</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {newAgent === '单井产量诊断' && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-xl bg-rose-50/50 flex items-center justify-center text-rose-600 flex-shrink-0">
                    <i className="fas fa-diagnoses text-lg"></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {lang === 'zh' ? '产量诊断：智能诊断分析管线' : 'Yield Diagnostics: Pipeline Engineering'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {lang === 'zh' ? '定义多源生产动态数据融合分析的处理阶段' : 'Specify analysis pipelines and deep backtracking parameters'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-600">
                    {lang === 'zh' ? '分析处理工序流程（推荐全选）' : 'Diagnostic Pipeline Operations (Select all recommended)'}
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'denoise', title: '1. 生产多参数历史滤波与毛刺剔除', desc: '自动平滑异常测试波动、回压扰动及高频噪点。' },
                      { id: 'shutin', title: '2. 间歇式关井与油嘴调节阶段消除', desc: '智能关联开关井历史，自动矫正产量阶梯式跃变。' },
                      { id: 'sensitivity', title: '3. 多维多主控因素敏感度智能拟合', desc: '全维度拟合注水响应、压力水平及层间连通贡献。' },
                    ].map((step) => {
                      const isActive = diagnosticPipelines.includes(step.id);
                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => setDiagnosticPipelines(prev =>
                            prev.includes(step.id)
                              ? prev.filter(x => x !== step.id)
                              : [...prev, step.id]
                          )}
                          className={`w-full p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex gap-3 items-start relative ${
                            isActive
                              ? 'border-rose-500 bg-rose-50/10'
                              : 'border-slate-100 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center ${
                            isActive ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-300'
                          }`}>
                            {isActive && <i className="fas fa-check text-[9px]"></i>}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{step.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{step.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-600 mb-2">
                      {lang === 'zh' ? '诊断溯源计算深度' : 'Decline Backtracking Depth'}
                    </label>
                    <div className="flex gap-3">
                      {[
                        { id: 'fast', label: '快速快照诊断', desc: '10秒快速诊断出主控因素' },
                        { id: 'deep', label: '全回溯多重深度拟合', desc: '3-5分钟深度诊断与递减精细拟合' },
                      ].map((depthItem) => (
                        <button
                          key={depthItem.id}
                          type="button"
                          onClick={() => setDiagnosticDepth(depthItem.id)}
                          className={`flex-1 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer relative ${
                            diagnosticDepth === depthItem.id
                              ? 'border-rose-500 bg-rose-50/10 text-rose-700'
                              : 'border-slate-100 text-slate-500 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <p className="text-xs font-bold">{depthItem.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{depthItem.desc}</p>
                          {diagnosticDepth === depthItem.id && (
                            <div className="absolute right-3 top-3.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[8px]">
                              <i className="fas fa-check"></i>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
      </div>
    );
  };

  // Editing States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAgent, setEditAgent] = useState('报告生成Agent');
  const [editError, setEditError] = useState('');

  // Sharing States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharingWorkspace, setSharingWorkspace] = useState<Workspace | null>(null);

  // Delete Confirm States
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // General Alert message
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Counts for My and Shared
  const myCount = useMemo(() => workspaces.filter((w) => w.owner === CURRENT_USER).length, [workspaces]);
  const sharedCount = useMemo(() => workspaces.filter((w) => w.owner !== CURRENT_USER).length, [workspaces]);

  // Filtered & Sorted Workspaces list
  const filteredWorkspaces = useMemo(() => {
    let result = workspaces.filter((ws) => {
      // Classification Tab Filter
      const matchesTab = activeTab === 'my' ? ws.owner === CURRENT_USER : ws.owner !== CURRENT_USER;

      // Fuzzy search by Name, Description, and Default Agent Name
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        ws.name.toLowerCase().includes(searchLower) ||
        (ws.description || '').toLowerCase().includes(searchLower) ||
        (ws.defaultAgent || '智能问数').toLowerCase().includes(searchLower);

      // Default Agent selection filter
      const matchesAgent =
        selectedAgentFilter === 'all' || (ws.defaultAgent || '智能问数') === selectedAgentFilter;

      return matchesTab && matchesSearch && matchesAgent;
    });

    // Sorting options logic
    if (selectedSort === 'recent') {
      result.sort((a, b) => {
        const dateA = a.lastModified || a.createdAt;
        const dateB = b.lastModified || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    } else if (selectedSort === 'created') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (selectedSort === 'name-az') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (selectedSort === 'name-za') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [workspaces, searchQuery, selectedAgentFilter, selectedSort, activeTab]);

  // Actions
  const handleAgentChange = (agentId: string) => {
    setNewAgent(agentId);
    const configs = AGENT_CONFIGS[agentId] || [];
    const initialConfig: Record<string, string> = {};
    configs.forEach((field) => {
      initialConfig[field.key] = field.defaultValue;
    });
    setAgentConfig(initialConfig);
  };

  const handleCreateWorkspace = () => {
    const formattedObjects = selectedWorkspaceObjects.map((obj, index) => {
      let categoryName = '';
      if (obj.type === 'oilfield') {
        categoryName = lang === 'zh' ? '油气田' : 'Oil Field';
      } else if (obj.type === 'block') {
        categoryName = lang === 'zh' ? '区块' : 'Block';
      } else if (obj.type === 'well') {
        categoryName = lang === 'zh' ? '井' : 'Well';
      } else if (obj.type === 'reservoir') {
        categoryName = lang === 'zh' ? '产层' : 'Reservoir';
      }
      return {
        id: `${obj.type}-${index}-${Date.now()}`,
        label: obj.name,
        category: categoryName
      };
    });

    if (creationTab === 'template') {
      const selectedTpl = templates.find((t) => t.id === selectedTemplateId);
      if (!selectedTpl) {
        setNameError(lang === 'zh' ? '请选择一个模板' : 'Please select a template');
        return;
      }
      if (!newName.trim()) {
        setNameError(lang === 'zh' ? '工作空间名称不能为空' : 'Workspace name cannot be empty');
        return;
      }

      // Create from template with custom name, description, objects and agent
      onCreateFromTemplate(selectedTpl, newName.trim(), newDesc.trim(), formattedObjects, newAgent);
      
      // Reset
      setSelectedTemplateId('');
      setNewName('');
      setNewDesc('');
      setNewAgent('智能问数');
      setSelectedWorkspaceObjects([]);
      setAgentConfig({
        data_scope: 'all',
        query_depth: 'hybrid',
      });
      setNameError('');
      setIsDrawerOpen(false);
      return;
    }

    if (!newName.trim()) {
      setNameError(lang === 'zh' ? '工作空间名称不能为空' : 'Workspace name cannot be empty');
      return;
    }

    // Create success: enter workspace directly (calls App.tsx handler)
    onSelectWorkspace('new-demo', newName.trim(), newDesc.trim(), formattedObjects, false, newAgent);

    // Reset fields & close
    setNewName('');
    setNewDesc('');
    setNewAgent('智能问数');
    setInitObject('');
    setInitTemplate('');
    setInitTimeRange('');
    setSelectedWorkspaceObjects([]);
    setAgentConfig({
      data_scope: 'all',
      query_depth: 'hybrid',
    });
    setNameError('');
    setIsDrawerOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent, ws: Workspace) => {
    e.stopPropagation();
    setEditingWorkspace(ws);
    setEditName(ws.name);
    setEditDesc(ws.description || '');
    setEditAgent(ws.defaultAgent || '智能问数');
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    if (!editName.trim()) {
      setEditError(lang === 'zh' ? '工作空间名称不能为空' : 'Workspace name cannot be empty');
      return;
    }
    if (editingWorkspace) {
      onUpdateWorkspace(editingWorkspace.id, {
        name: editName.trim(),
        description: editDesc.trim(),
        defaultAgent: editAgent,
        lastModified: new Date().toISOString(),
      });
      setIsEditModalOpen(false);
      setEditingWorkspace(null);
    }
  };

  const handleShareClick = (e: React.MouseEvent, ws: Workspace) => {
    e.stopPropagation();
    setSharingWorkspace(ws);
    setIsShareModalOpen(true);
  };

  const handleCopyClick = (e: React.MouseEvent, ws: Workspace) => {
    e.stopPropagation();
    // Copy copies name, description, default agent, initialization configuration
    // Default Name is XXX（副本）
    const copiedName = `${ws.name}（副本）`;
    onSelectWorkspace('new-demo', copiedName, ws.description, ws.objects || [], false, ws.defaultAgent);
    setAlertMessage(lang === 'zh' ? '复制成功，已自动创建并打开工作空间副本。' : 'Copied successfully! A new workspace duplicate has been created.');
  };

  const handleDeleteClick = (e: React.MouseEvent, ws: Workspace) => {
    e.stopPropagation();
    setConfirmDeleteId(ws.id);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      onDeleteWorkspace(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#F6F8FC] to-[#F9FBFF] overflow-hidden font-sans">
      {/* Top Header Section */}
      <div className="bg-white/70 backdrop-blur-md border-b border-slate-100 px-8 py-6 flex-shrink-0">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            {lang === 'zh' ? '工作空间管理' : 'Workspace Management'}
          </h1>
          <p className="text-gray-400 text-xs mt-1 font-medium">
            {lang === 'zh'
              ? '管理所有业务工作空间，持续沉淀业务上下文与AI协作成果'
              : 'Manage all business workspaces, continuously saving context and AI outcomes'}
          </p>
        </div>

        {/* Division Tab Category */}
        <div className="border-b border-gray-100 flex items-center gap-8">
          <button
            onClick={() => setActiveTab('my')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'my' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {lang === 'zh' ? `我的（${myCount}）` : `My Workspaces (${myCount})`}
            {activeTab === 'my' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'shared' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {lang === 'zh' ? `分享给我的（${sharedCount}）` : `Shared with Me (${sharedCount})`}
            {activeTab === 'shared' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
        </div>

        {/* Filters and Creating actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-5">
          {/* Left search & filters selection */}
          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            {/* Search inputs */}
            <div className="relative flex-1 max-w-xs">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'zh' ? '搜索工作空间...' : 'Search workspaces...'}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Default Agent selector filter */}
            <div className="relative">
              <select
                value={selectedAgentFilter}
                onChange={(e) => setSelectedAgentFilter(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-gray-600 font-medium cursor-pointer"
              >
                <option value="all">{lang === 'zh' ? '全部智能体' : 'All Agents'}</option>
                {AGENTS.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <i className="fas fa-chevron-down text-[10px]"></i>
              </div>
            </div>

            {/* Sorter selector filter */}
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-gray-600 font-medium cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {lang === 'zh' ? opt.label : opt.labelEn}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <i className="fas fa-chevron-down text-[10px]"></i>
              </div>
            </div>
          </div>

          {/* Right Click new workspace trigger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm shadow-blue-500/10"
          >
            <i className="fas fa-plus text-[10px]"></i>
            <span>{lang === 'zh' ? '新建工作空间' : 'New Workspace'}</span>
          </button>
        </div>
      </div>

      {/* Workspace Cards Layout Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        {filteredWorkspaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWorkspaces.map((ws) => {
              const isOwner = ws.owner === CURRENT_USER;

              return (
                <div
                  key={ws.id}
                  onClick={() => onSelectWorkspace(ws.id)}
                  className="bg-white rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_24px_rgba(59,130,246,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col p-6 space-y-4 relative group"
                >
                  {/* Folder icon + Name */}
                  <div className="flex items-start gap-3">
                    <span className="text-xl text-blue-500 mt-0.5">📁</span>
                    <h3
                      className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug"
                      title={ws.name}
                    >
                      {ws.name}
                    </h3>
                  </div>

                  {/* Workspace Description */}
                  {ws.description ? (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed" title={ws.description}>
                      {ws.description}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic line-clamp-2 leading-relaxed">
                      {lang === 'zh' ? '暂无工作空间描述' : 'No workspace description available'}
                    </p>
                  )}

                  {/* Shallow blue AI Tag */}
                  <div className="inline-flex items-center gap-1.5 bg-[#EDF3FF] border border-[#D9E6FF] rounded-full px-3 py-1 text-[11px] font-bold text-blue-600 w-fit">
                    <span className="text-xs">🤖</span>
                    <span className="truncate max-w-[180px]" title={ws.defaultAgent || '智能问数'}>
                      {ws.defaultAgent || '智能问数'}
                    </span>
                  </div>

                  {/* Divider and Secondary Controls Section */}
                  <div className="border-t border-slate-100/60 pt-3 mt-auto flex items-center justify-between">
                    {/* Owner · Date */}
                    <div className="text-[11px] text-gray-400 font-medium">
                      {ws.owner} · {ws.createdAt}
                    </div>

                    {/* Secondary Actions with Tooltips */}
                    <div className="flex items-center gap-1">
                      {isOwner ? (
                        <>
                          {/* Edit Workspace */}
                          <div className="relative group/btn">
                            <button
                              onClick={(e) => handleEditClick(e, ws)}
                              className="w-7 h-7 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50/60 active:scale-95 flex items-center justify-center transition-all"
                            >
                              <i className="fas fa-edit text-xs"></i>
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity duration-150 whitespace-nowrap z-30 shadow-md">
                              {lang === 'zh' ? '编辑' : 'Edit'}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                            </div>
                          </div>

                          {/* Share Workspace */}
                          <div className="relative group/btn">
                            <button
                              onClick={(e) => handleShareClick(e, ws)}
                              className="w-7 h-7 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50/60 active:scale-95 flex items-center justify-center transition-all"
                            >
                              <i className="fas fa-share-alt text-xs"></i>
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity duration-150 whitespace-nowrap z-30 shadow-md">
                              {lang === 'zh' ? '分享' : 'Share'}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                            </div>
                          </div>

                          {/* Copy Workspace */}
                          <div className="relative group/btn">
                            <button
                              onClick={(e) => handleCopyClick(e, ws)}
                              className="w-7 h-7 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50/60 active:scale-95 flex items-center justify-center transition-all"
                            >
                              <i className="fas fa-copy text-xs"></i>
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity duration-150 whitespace-nowrap z-30 shadow-md">
                              {lang === 'zh' ? '复制' : 'Copy'}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                            </div>
                          </div>

                          {/* Delete Workspace */}
                          <div className="relative group/btn">
                            <button
                              onClick={(e) => handleDeleteClick(e, ws)}
                              className="w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50/60 active:scale-95 flex items-center justify-center transition-all"
                            >
                              <i className="fas fa-trash-alt text-xs"></i>
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity duration-150 whitespace-nowrap z-30 shadow-md">
                              {lang === 'zh' ? '删除' : 'Delete'}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Only Copy for shared workspaces */
                        <div className="relative group/btn">
                          <button
                            onClick={(e) => handleCopyClick(e, ws)}
                            className="w-7 h-7 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50/60 active:scale-95 flex items-center justify-center transition-all"
                          >
                            <i className="fas fa-copy text-xs"></i>
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity duration-150 whitespace-nowrap z-30 shadow-md">
                            {lang === 'zh' ? '复制工作空间' : 'Copy Workspace'}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center text-gray-400 border border-dashed border-gray-300 rounded-xl bg-white flex flex-col items-center justify-center">
            <i className="fas fa-folder-open text-4xl mb-3 text-gray-300"></i>
            <p className="text-sm font-medium">
              {lang === 'zh' ? '暂无匹配的工作空间' : 'No matching workspaces found.'}
            </p>
          </div>
        )}
      </div>

      {/* Six: Creation Modal */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Centered Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden z-10"
            >
              {/* Header */}
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span>{lang === 'zh' ? '新建工作空间' : 'New Workspace'}</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {creationStep === 'basic' ? (
                      lang === 'zh'
                        ? '请填写工作空间基本信息，并从下方列表中检索并选择适合的协同智能体。'
                        : 'Enter basic workspace details and select a collaborative agent.'
                    ) : (
                      lang === 'zh'
                        ? '请配置所选智能体的高级参数、生成大纲与分析流程以完成初始化。'
                        : 'Configure custom parameters, outlines, or analytic flows to finish initialization.'
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <i className="fas fa-times text-sm"></i>
                </button>
              </div>

              {/* Form fields */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 custom-scrollbar">
                {creationStep === 'basic' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto w-full">
                    {/* Left Column: Workspace Info */}
                    <div className="lg:col-span-5">
                      {renderSection1()}
                    </div>
                    
                    {/* Right Column: Collaborative Agent Search & Selector List */}
                    <div className="lg:col-span-7">
                      {renderSection2()}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto w-full space-y-6">
                    {/* Top: Simplified Previous Step Info */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Workspace Name */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                          <i className="fas fa-folder"></i>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {lang === 'zh' ? '空间名称' : 'Workspace Name'}
                          </p>
                          <h4 className="text-xs font-black text-slate-800 mt-0.5">
                            {newName.trim()}
                          </h4>
                        </div>
                      </div>

                      {/* Divider line for desktop */}
                      <div className="hidden sm:block h-8 w-px bg-slate-100" />

                      {/* Agent Name */}
                      <div className="flex items-center gap-3 flex-1 sm:justify-start">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAgentColorStyles(newAgent).gradient} flex items-center justify-center text-sm text-white shadow-sm flex-shrink-0`}>
                          {getAgentEmoji(newAgent)}
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {lang === 'zh' ? '关联智能体' : 'Associated Agent'}
                          </p>
                          <h4 className="text-xs font-black text-slate-800 mt-0.5">
                            {newAgent}
                          </h4>
                        </div>
                      </div>

                      {/* Selected Objects Count */}
                      {selectedWorkspaceObjects.length > 0 && (
                        <>
                          {/* Divider line for desktop */}
                          <div className="hidden sm:block h-8 w-px bg-slate-100" />

                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">
                              <i className="fas fa-cubes"></i>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                {lang === 'zh' ? '关联业务对象' : 'Associated Objects'}
                              </p>
                              <h4 className="text-xs font-black text-slate-800 mt-0.5">
                                {lang === 'zh' ? `共 ${selectedWorkspaceObjects.length} 个对象` : `${selectedWorkspaceObjects.length} Objects`}
                              </h4>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Bottom: Agent custom configs */}
                    <div className="space-y-6">
                      {renderSection3()}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer buttons */}
              <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-end gap-3 bg-white flex-shrink-0">
                {creationStep === 'basic' ? (
                  <>
                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="px-5 py-2 border border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                    >
                      {lang === 'zh' ? '取消' : 'Cancel'}
                    </button>
                    
                    {(() => {
                      const hasConfigs = (AGENT_CONFIGS[newAgent] || []).length > 0;
                      return hasConfigs ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!newName.trim()) {
                              setNameError(lang === 'zh' ? '工作空间名称不能为空' : 'Workspace name cannot be empty');
                              return;
                            }
                            setNameError('');
                            setCreationStep('config');
                          }}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-98 cursor-pointer"
                        >
                          <span>{lang === 'zh' ? '下一步：智能体初始化' : 'Next: Agent Initialization'}</span>
                          <i className="fas fa-chevron-right text-[10px]"></i>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleCreateWorkspace}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-98 cursor-pointer"
                        >
                          <span>{lang === 'zh' ? '立即创建' : 'Create Now'}</span>
                          <i className="fas fa-check text-[10px]"></i>
                        </button>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setCreationStep('basic')}
                      className="px-5 py-2 border border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {lang === 'zh' ? '上一步' : 'Back'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleCreateWorkspace}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-98 cursor-pointer"
                    >
                      <span>{lang === 'zh' ? '确认创建' : 'Confirm and Create'}</span>
                      <i className="fas fa-check text-[10px]"></i>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Editing dialog modal */}
      <AnimatePresence>
        {isEditModalOpen && editingWorkspace && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
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
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-5"
            >
              <h3 className="text-base font-bold text-gray-900">
                {lang === 'zh' ? '编辑工作空间' : 'Edit Workspace'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    {lang === 'zh' ? '工作空间名称 *' : 'Workspace Name *'}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      if (e.target.value.trim()) setEditError('');
                    }}
                    className={`w-full px-4 py-2.5 bg-gray-50 border ${
                      editError ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:ring-blue-100'
                    } rounded-xl text-xs focus:bg-white focus:ring-4 outline-none transition-all placeholder:text-gray-400`}
                    placeholder={lang === 'zh' ? '请输入名称' : 'Enter name'}
                  />
                  {editError && <p className="text-red-500 text-[11px] mt-1 font-semibold">{editError}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    {lang === 'zh' ? '工作空间描述' : 'Workspace Description'}
                  </label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none resize-none transition-all placeholder:text-gray-400"
                    rows={3}
                    placeholder={lang === 'zh' ? '请输入描述' : 'Enter description'}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    {lang === 'zh' ? '智能体 *' : 'Agent *'}
                  </label>
                  <div className="relative">
                    <select
                      value={editAgent}
                      onChange={(e) => setEditAgent(e.target.value)}
                      className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-800 cursor-pointer pr-10 font-medium"
                    >
                      {AGENTS.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <i className="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-all"
                >
                  {lang === 'zh' ? '保存修改' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete double check confirmation dialog modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center space-y-4"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl mx-auto">
                <i className="fas fa-trash-alt"></i>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">
                  {lang === 'zh' ? '确认删除工作空间？' : 'Confirm Delete Workspace?'}
                </h3>
                <p className="text-gray-500 text-xs">
                  {lang === 'zh' ? '删除后不可恢复。' : 'This action cannot be undone.'}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50"
                >
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-md"
                >
                  {lang === 'zh' ? '确认删除' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* General Information feedback notice alert */}
      <AnimatePresence>
        {alertMessage && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAlertMessage(null)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-xs w-full text-center space-y-4"
            >
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-lg mx-auto">
                <i className="fas fa-check"></i>
              </div>
              <p className="text-gray-800 text-xs font-semibold leading-relaxed">{alertMessage}</p>
              <button
                onClick={() => setAlertMessage(null)}
                className="w-full py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all"
              >
                {lang === 'zh' ? '确认' : 'Confirm'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sharing modal window */}
      {sharingWorkspace && (
        <ShareWorkspaceModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setSharingWorkspace(null);
          }}
          workspaceName={sharingWorkspace.name}
          lang={lang}
        />
      )}
    </div>
  );
};
