import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, SkillEntry } from '../types';
import { MOCK_SKILLS as FALLBACK_SKILLS } from './AdminSkillManagement';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (agentData: {
    name: string;
    description: string;
    type: 'Role' | 'Scenario' | 'General';
    initPageUrl: string;
    runPageUrl: string;
    mcpAddress: string;
    mcpList: Array<{ id: string; name: string; url: string; protocol: string; description?: string }>;
    selectedSkills: string[];
    uploadedSkills?: Array<{ name: string; size: string; content?: string }>;
    selectedTools: string[];
    icon: string;
    businessCategory?: string;
    memoryConfig: {
      personaPrompt: string;
      userPreferences: {
        language: string;
        outputFormat: string;
        precision: string;
        userRole: string;
      };
      harnessConfig: {
        maxContextRounds: number;
        enableRagVectorMemory: boolean;
        enableReActSelfReflection: boolean;
        maxRetries: number;
      };
    };
  }) => void;
  editingAgent?: any;
  lang: Language;
}

export interface SystemToolOption {
  id: string;
  name: string;
  category: string;
  desc: string;
}

const SYSTEM_AVAILABLE_TOOLS: SystemToolOption[] = [
  { id: 'tool-1', name: '井信息查询 Tool', category: '数据查询', desc: '查询石油天然气各类对象的基础静态属性信息' },
  { id: 'tool-2', name: '距离计算 Tool', category: '地理空间', desc: '计算两个地理坐标或对象之间的空间直线距离及方位角' },
  { id: 'tool-3', name: '对比分析 Tool', category: '分析对比', desc: '对比多个同类对象的属性差异，支持差异项高亮显示' },
  { id: 'tool-5', name: '压裂参数解析 Tool', category: 'NLP解析', desc: '从非结构化文本中自动抽取压裂、钻井等关键技术参数' },
  { id: 'tool-6', name: '生产聚合 Tool', category: '数据聚合', desc: '对多井生产数据进行时序聚合分析' },
  { id: 'tool-7', name: '压裂模拟 Tool', category: '物理模拟', desc: '基于物理模型进行压裂缝网扩展模拟' },
  { id: 'tool-8', name: '产量预测 Tool', category: 'AI预测', desc: '利用机器学习模型预测单井压后产量' },
  { id: 'tool-9', name: '全井库检索 Tool', category: '数据查询', desc: '跨区域检索全油田历史井库档案' },
  { id: 'tool-10', name: '递减曲线拟合 Tool', category: '油藏计算', desc: 'Arps递减曲线与现代递减自动拟合分析' },
  { id: 'tool-11', name: 'GIS 地图服务 Tool', category: '地理空间', desc: '提供瓦片图层叠加与井位矢量标注服务' },
  { id: 'tool-12', name: 'PPT 报告导出 Tool', category: '报告生成', desc: '一键生成工业级工作总结与分析PPT' },
];

const SYSTEM_ICONS = [
  'fa-robot', 'fa-bolt', 'fa-cube', 'fa-user-tie', 'fa-clipboard-check', 
  'fa-drafting-compass', 'fa-radiation', 'fa-tachometer-alt', 'fa-video', 
  'fa-project-diagram', 'fa-chart-area', 'fa-oil-can', 'fa-chart-bar', 
  'fa-balance-scale', 'fa-file-invoice', 'fa-exchange-alt', 'fa-database', 
  'fa-desktop', 'fa-stethoscope', 'fa-walking', 'fa-heartbeat', 'fa-tools', 
  'fa-shield-alt', 'fa-search-plus', 'fa-clipboard-list', 'fa-check-double', 
  'fa-chart-pie', 'fa-money-bill-wave', 'fa-globe', 'fa-industry', 'fa-brain',
  'fa-magic', 'fa-cogs', 'fa-search', 'fa-microchip', 'fa-server'
];

const BUSINESS_CATEGORIES = [
  '地质研究', '测录井解释', '钻井工程', '完井压裂', 
  '开发生产', '油藏工程', '生产运行', '设备运维', 
  '安全环保', '经营管理'
];

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ isOpen, onClose, onSubmit, editingAgent, lang }) => {
  // Active Form Section Tab
  const [activeTab, setActiveTab] = useState<'basic' | 'memory' | 'capabilities' | 'urls'>('basic');

  // Basic Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'General' as 'Role' | 'Scenario' | 'General',
    initPageUrl: '',
    runPageUrl: '',
    icon: 'fa-robot',
    businessCategory: '',
  });

  // Memory & Harness State (Pre-filled with rich Defaults)
  const [memoryConfig, setMemoryConfig] = useState({
    personaPrompt: '你是一个专为油气勘探与开发领域设计的AI智能体。你具备深厚的地质研究、工程设计与生产优化专业知识。交互中请严格遵循 SY/T 行业规程，输出包含数据推导链、风险提示及结论。',
    userPreferences: {
      language: '中文（工业严谨）',
      outputFormat: '结构化 Markdown + JSON 数据块',
      precision: '保留 3 位小数',
      userRole: '现场工程师 / 采油厂专家',
    },
    harnessConfig: {
      maxContextRounds: 10,
      enableRagVectorMemory: true,
      enableReActSelfReflection: true,
      maxRetries: 3,
    }
  });

  // Multiple MCP Services State
  const [mcpList, setMcpList] = useState<Array<{ id: string; name: string; url: string; protocol: string; description?: string }>>([
    {
      id: 'mcp-1',
      name: '油气生产历史 MCP 服务',
      url: 'https://api.petro.com/mcp/production',
      protocol: 'sse',
      description: '提供单井与区块生产数据调取'
    }
  ]);

  // Skills State (From Library)
  const [availableSkills, setAvailableSkills] = useState<SkillEntry[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Selected Tools State
  const [selectedTools, setSelectedTools] = useState<string[]>([
    '井信息查询 Tool', '距离计算 Tool', '对比分析 Tool'
  ]);

  // Search queries for Skills & Tools
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [toolSearchQuery, setToolSearchQuery] = useState('');

  // Free-text user preferences state with guidance directions
  const [userPreferencesText, setUserPreferencesText] = useState(
    '1. 语言与表达：中文（工业严谨），语言简洁清晰，保留推导逻辑链。\n2. 输出格式：采用结构化 Markdown，包含 JSON 数据块或工程表格。\n3. 数值与精度：浮点数保留 3 位小数，统一采用 SI 国际标准单位制。\n4. 角色与边界：面向现场工程专家与采油厂技术人员；严格遵循 SY/T 行业规范，附带风险提示。'
  );

  // Dropdown & Picker UI States
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
  const [isToolDropdownOpen, setIsToolDropdownOpen] = useState(false);
  const [showMcpPreviewId, setShowMcpPreviewId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('mbu_skills');
      if (stored) {
        try {
          setAvailableSkills(JSON.parse(stored));
        } catch (e) {
          console.error(e);
          setAvailableSkills(FALLBACK_SKILLS);
        }
      } else {
        setAvailableSkills(FALLBACK_SKILLS);
      }

      if (editingAgent) {
        setFormData({
          name: editingAgent.name || '',
          description: editingAgent.description || '',
          type: editingAgent.type || 'General',
          initPageUrl: editingAgent.initPageUrl || '',
          runPageUrl: editingAgent.runPageUrl || '',
          icon: editingAgent.icon || 'fa-robot',
          businessCategory: editingAgent.businessCategory || '',
        });
        if (editingAgent.prompt) {
          setMemoryConfig(prev => ({
            ...prev,
            personaPrompt: editingAgent.prompt
          }));
        }
        if (editingAgent.selectedSkills) {
          setSelectedSkills(editingAgent.selectedSkills);
        }
        if (editingAgent.selectedTools) {
          setSelectedTools(editingAgent.selectedTools);
        }
      } else {
        // Default random icon on open
        const randomIndex = Math.floor(Math.random() * SYSTEM_ICONS.length);
        setFormData({
          name: '',
          description: '',
          type: 'General',
          initPageUrl: '',
          runPageUrl: '',
          icon: SYSTEM_ICONS[randomIndex],
          businessCategory: '',
        });
        setSelectedSkills([]);
        setSelectedTools(['井信息查询 Tool', '距离计算 Tool', '对比分析 Tool']);
      }
    }
  }, [isOpen, editingAgent]);

  // Add MCP Row
  const handleAddMcp = () => {
    const newId = `mcp-${Date.now()}`;
    setMcpList(prev => [
      ...prev,
      { id: newId, name: `MCP服务-${prev.length + 1}`, url: 'https://api.example.com/mcp/service', protocol: 'sse', description: '自定义多模态工具上下文' }
    ]);
  };

  // Remove MCP Row
  const handleRemoveMcp = (id: string) => {
    setMcpList(prev => prev.filter(m => m.id !== id));
  };

  // Handle Form Submission
  const handleRegister = () => {
    if (!formData.name.trim()) {
      alert(lang === 'zh' ? '请输入智能体名称' : 'Please enter agent name');
      setActiveTab('basic');
      return;
    }
    if (!formData.description.trim()) {
      alert(lang === 'zh' ? '请输入智能体描述' : 'Please enter agent description');
      setActiveTab('basic');
      return;
    }
    if (formData.type === 'Scenario' && !formData.businessCategory.trim()) {
      alert(lang === 'zh' ? '请输入或选择场景所属业务分类' : 'Please enter or select business category');
      setActiveTab('basic');
      return;
    }

    if (onSubmit) {
      onSubmit({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        initPageUrl: formData.initPageUrl,
        runPageUrl: formData.runPageUrl,
        mcpAddress: mcpList.map(m => m.url).join(', '),
        mcpList,
        selectedSkills,
        selectedTools,
        icon: formData.icon,
        businessCategory: formData.type === 'Scenario' ? formData.businessCategory : undefined,
        memoryConfig: {
          ...memoryConfig,
          userPreferences: {
            ...memoryConfig.userPreferences,
            userRole: userPreferencesText,
          }
        },
      });
    }

    // Reset Form
    setFormData({
      name: '',
      description: '',
      type: 'General',
      initPageUrl: '',
      runPageUrl: '',
      icon: 'fa-robot',
      businessCategory: '',
    });
    setSelectedSkills([]);
    setSelectedTools(['井信息查询 Tool', '距离计算 Tool']);
    setSkillSearchQuery('');
    setToolSearchQuery('');
    onClose();
  };

  // Helper for filtering skills
  const filteredAvailableSkills = availableSkills.filter(s => {
    if (!skillSearchQuery.trim()) return true;
    const q = skillSearchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      (s.category && s.category.toLowerCase().includes(q))
    );
  });

  // Helper for filtering tools
  const filteredTools = SYSTEM_AVAILABLE_TOOLS.filter(t => {
    if (!toolSearchQuery.trim()) return true;
    const q = toolSearchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="relative w-full max-w-4xl bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 my-auto"
          >
            {/* Header - Sticky */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <i className="fas fa-robot text-lg"></i>
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    {lang === 'zh' ? (editingAgent ? '编辑智能体' : '注册智能体') : (editingAgent ? 'Edit Agent' : 'Register Agent')}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400">
                    {lang === 'zh' 
                      ? (editingAgent ? '修改智能体基本认知、记忆身份与能力集' : '配置智能体基本认知、记忆身份与能力集') 
                      : (editingAgent ? 'Modify Agent Identity, Memory & Capabilities' : 'Configure Agent Identity, Memory & Capabilities')}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>

            {/* Navigation Tabs Header */}
            <div className="px-6 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2 pt-2 z-10 overflow-x-auto custom-scrollbar">
              {[
                { id: 'basic', label: lang === 'zh' ? '1. 基础信息' : '1. Basic Info', icon: 'fa-id-card' },
                { id: 'memory', label: lang === 'zh' ? '2. 智能体记忆与偏好' : '2. Identity & Preferences', icon: 'fa-brain' },
                { id: 'capabilities', label: lang === 'zh' ? '3. 技能、工具 & MCP' : '3. Skills, Tools & MCP', icon: 'fa-cogs' },
                { id: 'urls', label: lang === 'zh' ? '4. 运行与页面地址' : '4. Page URLs', icon: 'fa-link' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-600 border-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-white/50'
                  }`}
                >
                  <i className={`fas ${tab.icon} text-[11px]`}></i>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar space-y-6">

              {/* TAB 1: BASIC INFO */}
              {activeTab === 'basic' && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  {/* Row 1: Agent Name + Agent Icon Side-by-Side */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Agent Name (10 Cols) */}
                    <div className="md:col-span-10 space-y-1.5">
                      <label className="text-[11px] font-black text-slate-600 ml-1 flex items-center gap-1">
                        <span>{lang === 'zh' ? '智能体名称' : 'Agent Name'}</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder={lang === 'zh' ? '请输入智能体名称，例如：邻井压裂参数优选 Agent' : 'Enter agent name'}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 px-4 text-xs font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white outline-none transition-all shadow-sm"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    {/* Agent Icon Selection (2 Cols) */}
                    <div className="md:col-span-2 space-y-1.5 relative">
                      <label className="text-[11px] font-black text-slate-600 ml-1 flex items-center justify-between">
                        <span>{lang === 'zh' ? '图标' : 'Icon'} <span className="text-rose-500">*</span></span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                          className="w-12 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:border-indigo-300 transition-all shadow-sm cursor-pointer relative"
                        >
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-sm shadow-inner">
                            <i className={`fas ${formData.icon}`}></i>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const randomIndex = Math.floor(Math.random() * SYSTEM_ICONS.length);
                            setFormData(prev => ({ ...prev, icon: SYSTEM_ICONS[randomIndex] }));
                          }}
                          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 flex items-center justify-center transition-all cursor-pointer border border-slate-200 shrink-0"
                          title={lang === 'zh' ? '随机更换图标' : 'Random Icon'}
                        >
                          <i className="fas fa-random text-xs"></i>
                        </button>
                      </div>

                      {/* Icon Picker Popover */}
                      <AnimatePresence>
                        {isIconPickerOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 space-y-2"
                          >
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                              <span>{lang === 'zh' ? '系统图标库' : 'System Icons'}</span>
                              <button onClick={() => setIsIconPickerOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <i className="fas fa-times text-xs"></i>
                              </button>
                            </div>
                            <div className="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto custom-scrollbar p-1">
                              {SYSTEM_ICONS.map(ic => (
                                <button
                                  key={ic}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, icon: ic }));
                                    setIsIconPickerOpen(false);
                                  }}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all ${
                                    formData.icon === ic
                                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100'
                                  }`}
                                >
                                  <i className={`fas ${ic}`}></i>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Agent Description - PLACED ABOVE AGENT TYPE */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-600 ml-1 flex items-center justify-between">
                      <span>{lang === 'zh' ? '智能体描述' : 'Agent Description'} <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-medium">{formData.description.length}/300</span>
                    </label>
                    <textarea 
                      placeholder={lang === 'zh' ? '请详细描述该智能体解决哪些业务问题，服务于哪些岗位或场景，以及包含的主要决策逻辑...' : 'Describe what business problem this agent solves...'}
                      className="w-full h-24 bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white outline-none transition-all resize-none shadow-sm"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  {/* Agent Type Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-600 ml-1">
                      {lang === 'zh' ? '智能体类型' : 'Agent Type'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl gap-1">
                      {[
                        { id: 'General', label: lang === 'zh' ? '通用助手' : 'General', desc: '基础通用问答与常识引擎', icon: 'fa-bolt' },
                        { id: 'Scenario', label: lang === 'zh' ? '场景智能体' : 'Scenario', desc: '针对特定工业场景闭环决策', icon: 'fa-cube' },
                        { id: 'Role', label: lang === 'zh' ? '岗位智能体' : 'Role', desc: '对口岗位职责协同代理', icon: 'fa-user-tie' },
                      ].map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: item.id as any })}
                          className={`p-3 rounded-lg text-left transition-all flex flex-col gap-1 cursor-pointer ${
                            formData.type === item.id 
                              ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60' 
                              : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <i className={`fas ${item.icon} text-[11px]`}></i>
                            <span>{item.label}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal leading-snug">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scenario Category Selection (Shown if Scenario selected) */}
                  <AnimatePresence>
                    {formData.type === 'Scenario' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1.5 relative"
                      >
                        <label className="text-[11px] font-black text-slate-600 ml-1 flex justify-between items-center">
                          <span>{lang === 'zh' ? '场景所属业务分类' : 'Scenario Business Category'} <span className="text-rose-500">*</span></span>
                          <span className="text-[9px] font-bold text-slate-400">({lang === 'zh' ? '可直接输入或从下拉选择' : 'Input or select'})</span>
                        </label>
                        <div className="relative flex">
                          <input 
                            type="text" 
                            placeholder={lang === 'zh' ? '请输入或选择所属业务分类，如：完井压裂' : 'Select or enter business category'}
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 px-4 text-xs font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white outline-none transition-all pr-10 shadow-sm"
                            value={formData.businessCategory}
                            onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <i className={`fas fa-chevron-down text-xs transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}></i>
                          </button>
                        </div>

                        {isCategoryDropdownOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 max-h-40 overflow-y-auto custom-scrollbar">
                            {BUSINESS_CATEGORIES.map(cat => (
                              <div 
                                key={cat}
                                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                                onClick={() => {
                                  setFormData({ ...formData, businessCategory: cat });
                                  setIsCategoryDropdownOpen(false);
                                }}
                              >
                                {cat}
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* TAB 2: AGENT MEMORY & PREFERENCES */}
              {activeTab === 'memory' && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                  {/* 1. Default System Persona */}
                  <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <i className="fas fa-user-shield text-indigo-600"></i>
                        {lang === 'zh' ? '智能体身份' : 'System Persona'}
                      </span>
                    </label>
                    <textarea 
                      className="w-full h-28 bg-white border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none shadow-inner"
                      value={memoryConfig.personaPrompt}
                      onChange={(e) => setMemoryConfig({
                        ...memoryConfig,
                        personaPrompt: e.target.value
                      })}
                      placeholder={lang === 'zh' ? '输入智能体的系统身份定位、角色能力与基本行为约定...' : 'Enter system persona prompt...'}
                    />
                  </div>

                  {/* 2. User Preferences (Free Text) */}
                  <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <i className="fas fa-user-cog text-indigo-600"></i>
                        {lang === 'zh' ? '用户偏好' : 'User Preferences'}
                      </span>
                    </label>
                    <textarea
                      className="w-full h-28 bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner resize-none"
                      value={userPreferencesText}
                      onChange={(e) => setUserPreferencesText(e.target.value)}
                      placeholder={lang === 'zh' ? '输入用户偏好（如对话语气、回答简练程度、格式约束等）...' : 'Enter user preferences...'}
                    />
                  </div>
                </motion.div>
              )}

              {/* TAB 3: SKILLS, TOOLS & MCP */}
              {activeTab === 'capabilities' && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                  {/* 1. SKILLS SECTION WITH SEARCHABLE MULTI-SELECT DROPDOWN */}
                  <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-magic text-indigo-600"></i>
                        <h4 className="text-xs font-black text-slate-800">{lang === 'zh' ? '技能配置' : 'Skills Config'}</h4>
                        <span className="text-[10px] font-bold text-slate-400">({selectedSkills.length} {lang === 'zh' ? '已选' : 'selected'})</span>
                      </div>
                    </div>

                    {/* Searchable Multi-Select Dropdown */}
                    <div className="space-y-2 relative">
                      <div 
                        className="min-h-[42px] w-full bg-white border border-slate-200 focus-within:border-indigo-500 rounded-xl p-1.5 flex flex-wrap items-center gap-1.5 cursor-text shadow-2xs transition-all"
                        onClick={() => setIsSkillDropdownOpen(true)}
                      >
                        {selectedSkills.map(sId => {
                          const sk = availableSkills.find(s => s.id === sId);
                          return (
                            <span key={sId} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0">
                              <i className="fas fa-cube text-[10px] text-indigo-500"></i>
                              {sk?.name || sId}
                              <i 
                                className="fas fa-times text-slate-400 hover:text-rose-500 cursor-pointer ml-1 text-[10px]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSkills(prev => prev.filter(id => id !== sId));
                                }}
                              ></i>
                            </span>
                          );
                        })}

                        <input 
                          type="text"
                          placeholder={selectedSkills.length === 0 ? (lang === 'zh' ? '点击或输入搜索 Skill 技能...' : 'Search or select skills...') : ''}
                          value={skillSearchQuery}
                          onChange={(e) => {
                            setSkillSearchQuery(e.target.value);
                            setIsSkillDropdownOpen(true);
                          }}
                          onFocus={() => setIsSkillDropdownOpen(true)}
                          className="flex-1 min-w-[140px] bg-transparent text-xs text-slate-700 outline-none px-1 py-0.5"
                        />

                        <div className="flex items-center gap-1 ml-auto shrink-0">
                          {selectedSkills.length > 0 && (
                            <button 
                              type="button" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSkills([]);
                              }}
                              className="text-[10px] font-bold text-slate-400 hover:text-rose-600 px-1.5 py-0.5"
                            >
                              {lang === 'zh' ? '清空' : 'Clear'}
                            </button>
                          )}
                          <i className={`fas fa-chevron-down text-slate-400 text-xs px-1.5 transition-transform ${isSkillDropdownOpen ? 'rotate-180' : ''}`}></i>
                        </div>
                      </div>

                      {/* Skill Multi-Select Dropdown Menu */}
                      {isSkillDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setIsSkillDropdownOpen(false)}></div>
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-100">
                              <span>{lang === 'zh' ? '可选技能列表 (勾选多选)' : 'Select Skills'}</span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const allFilteredIds = filteredAvailableSkills.map(s => s.id);
                                    setSelectedSkills(prev => Array.from(new Set([...prev, ...allFilteredIds])));
                                  }}
                                  className="text-indigo-600 hover:underline cursor-pointer"
                                >
                                  {lang === 'zh' ? '全选匹配' : 'Select All'}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSkills([]);
                                  }}
                                  className="text-slate-500 hover:underline cursor-pointer"
                                >
                                  {lang === 'zh' ? '取消全选' : 'Deselect'}
                                </button>
                              </div>
                            </div>

                            {filteredAvailableSkills.length === 0 ? (
                              <div className="p-3 text-center text-xs text-slate-400">
                                {lang === 'zh' ? '未找到匹配的 Skill 技能' : 'No matching skills'}
                              </div>
                            ) : (
                              filteredAvailableSkills.map(skill => {
                                const isSelected = selectedSkills.includes(skill.id);
                                return (
                                  <div
                                    key={skill.id}
                                    onClick={() => {
                                      setSelectedSkills(prev => 
                                        isSelected ? prev.filter(id => id !== skill.id) : [...prev, skill.id]
                                      );
                                    }}
                                    className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                                      isSelected ? 'bg-indigo-50/80 text-indigo-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                                      <input type="checkbox" checked={isSelected} readOnly className="accent-indigo-600 cursor-pointer" />
                                      <span className="truncate font-medium">{skill.name}</span>
                                      <span className="text-[10px] text-slate-400 truncate hidden sm:inline">{skill.description}</span>
                                    </div>
                                    <span className="text-[9px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded shrink-0">
                                      {skill.category || '通用'}
                                    </span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 2. TOOL SCOPE SELECTION SECTION WITH SEARCHABLE MULTI-SELECT DROPDOWN */}
                  <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-tools text-indigo-600"></i>
                        <h4 className="text-xs font-black text-slate-800">{lang === 'zh' ? '工具范围授权' : 'Tool Scope Selection'}</h4>
                        <span className="text-[10px] font-bold text-slate-400">({selectedTools.length} {lang === 'zh' ? '已选' : 'selected'})</span>
                      </div>
                    </div>

                    {/* Tool Searchable Multi-Select Combobox */}
                    <div className="space-y-2 relative">
                      <div 
                        className="min-h-[42px] w-full bg-white border border-slate-200 focus-within:border-indigo-500 rounded-xl p-1.5 flex flex-wrap items-center gap-1.5 cursor-text shadow-2xs transition-all"
                        onClick={() => setIsToolDropdownOpen(true)}
                      >
                        {selectedTools.map(tName => (
                          <span key={tName} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0">
                            <i className="fas fa-wrench text-[10px] text-indigo-500"></i>
                            {tName}
                            <i 
                              className="fas fa-times text-slate-400 hover:text-rose-500 cursor-pointer ml-1 text-[10px]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTools(prev => prev.filter(t => t !== tName));
                              }}
                            ></i>
                          </span>
                        ))}

                        <input 
                          type="text"
                          placeholder={selectedTools.length === 0 ? (lang === 'zh' ? '点击或输入搜索 Tool 工具...' : 'Search or select tools...') : ''}
                          value={toolSearchQuery}
                          onChange={(e) => {
                            setToolSearchQuery(e.target.value);
                            setIsToolDropdownOpen(true);
                          }}
                          onFocus={() => setIsToolDropdownOpen(true)}
                          className="flex-1 min-w-[140px] bg-transparent text-xs text-slate-700 outline-none px-1 py-0.5"
                        />

                        <div className="flex items-center gap-1 ml-auto shrink-0">
                          {selectedTools.length > 0 && (
                            <button 
                              type="button" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTools([]);
                              }}
                              className="text-[10px] font-bold text-slate-400 hover:text-rose-600 px-1.5 py-0.5"
                            >
                              {lang === 'zh' ? '清空' : 'Clear'}
                            </button>
                          )}
                          <i className={`fas fa-chevron-down text-slate-400 text-xs px-1.5 transition-transform ${isToolDropdownOpen ? 'rotate-180' : ''}`}></i>
                        </div>
                      </div>

                      {/* Tool Multi-Select Dropdown Menu */}
                      {isToolDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setIsToolDropdownOpen(false)}></div>
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-100">
                              <span>{lang === 'zh' ? '可选 Tool 工具列表 (勾选多选)' : 'Select Tools'}</span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const allFilteredNames = filteredTools.map(t => t.name);
                                    setSelectedTools(prev => Array.from(new Set([...prev, ...allFilteredNames])));
                                  }}
                                  className="text-indigo-600 hover:underline cursor-pointer"
                                >
                                  {lang === 'zh' ? '全选匹配' : 'Select All'}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTools([]);
                                  }}
                                  className="text-slate-500 hover:underline cursor-pointer"
                                >
                                  {lang === 'zh' ? '取消全选' : 'Deselect'}
                                </button>
                              </div>
                            </div>

                            {filteredTools.length === 0 ? (
                              <div className="p-3 text-center text-xs text-slate-400">
                                {lang === 'zh' ? '未找到匹配的 Tool 工具' : 'No matching tools'}
                              </div>
                            ) : (
                              filteredTools.map(tool => {
                                const isSelected = selectedTools.includes(tool.name);
                                return (
                                  <div
                                    key={tool.id}
                                    onClick={() => {
                                      setSelectedTools(prev => 
                                        isSelected ? prev.filter(t => t !== tool.name) : [...prev, tool.name]
                                      );
                                    }}
                                    className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                                      isSelected ? 'bg-indigo-50/80 text-indigo-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                                      <input type="checkbox" checked={isSelected} readOnly className="accent-indigo-600 cursor-pointer" />
                                      <span className="truncate font-medium">{tool.name}</span>
                                      <span className="text-[10px] text-slate-400 truncate hidden sm:inline">{tool.desc}</span>
                                    </div>
                                    <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                      {tool.category}
                                    </span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 3. MULTIPLE MCP CONFIGURATION SECTION WITH SIMPLIFIED INTERFACE LIST PREVIEW */}
                  <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-network-wired text-indigo-600"></i>
                        <h4 className="text-xs font-black text-slate-800">{lang === 'zh' ? 'MCP 服务配置' : 'MCP Services'}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddMcp}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <i className="fas fa-plus text-[10px]"></i>
                        {lang === 'zh' ? '添加 MCP 服务' : 'Add MCP Server'}
                      </button>
                    </div>

                    {/* Dynamic MCP List */}
                    <div className="space-y-3">
                      {mcpList.map((mcp, idx) => (
                        <div key={mcp.id} className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-2xs relative">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px]">
                                {idx + 1}
                              </span>
                              {lang === 'zh' ? `MCP 服务节点 #${idx + 1}` : `MCP Server #${idx + 1}`}
                            </span>
                            
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setShowMcpPreviewId(showMcpPreviewId === mcp.id ? null : mcp.id)}
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 cursor-pointer transition-all ${
                                  showMcpPreviewId === mcp.id 
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'text-indigo-600 hover:text-indigo-800 bg-indigo-50 border-indigo-100'
                                }`}
                              >
                                <i className={`fas ${showMcpPreviewId === mcp.id ? 'fa-eye-slash' : 'fa-list-ul'}`}></i>
                                {showMcpPreviewId === mcp.id ? (lang === 'zh' ? '收起接口列表' : 'Hide Interfaces') : (lang === 'zh' ? '预览 MCP 接口列表' : 'Preview Interfaces')}
                              </button>
                              
                              {mcpList.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMcp(mcp.id)}
                                  className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                                  title="删除此 MCP"
                                >
                                  <i className="fas fa-trash-alt text-xs"></i>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Input Fields Row */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                            <div className="sm:col-span-4 space-y-1">
                              <label className="text-[10px] font-bold text-slate-500">{lang === 'zh' ? '服务名称' : 'Server Name'}</label>
                              <input 
                                type="text" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                                value={mcp.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMcpList(prev => prev.map(m => m.id === mcp.id ? { ...m, name: val } : m));
                                }}
                              />
                            </div>

                            <div className="sm:col-span-5 space-y-1">
                              <label className="text-[10px] font-bold text-slate-500">{lang === 'zh' ? 'MCP 服务地址' : 'Endpoint URL'}</label>
                              <input 
                                type="text" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-800 outline-none focus:border-indigo-500"
                                value={mcp.url}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMcpList(prev => prev.map(m => m.id === mcp.id ? { ...m, url: val } : m));
                                }}
                              />
                            </div>

                            <div className="sm:col-span-3 space-y-1">
                              <label className="text-[10px] font-bold text-slate-500">{lang === 'zh' ? '传输协议' : 'Protocol'}</label>
                              <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                                value={mcp.protocol}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMcpList(prev => prev.map(m => m.id === mcp.id ? { ...m, protocol: val } : m));
                                }}
                              >
                                <option value="sse">SSE (Server-Sent Events)</option>
                                <option value="http">HTTP / REST</option>
                                <option value="stdio">Stdio Process</option>
                              </select>
                            </div>
                          </div>

                          {/* Simplified MCP Exposed Interfaces List Preview */}
                          {showMcpPreviewId === mcp.id && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-fadeIn"
                            >
                              <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between pb-1.5 border-b border-slate-200">
                                <span className="flex items-center gap-1.5">
                                  <i className="fas fa-code text-indigo-600"></i>
                                  {lang === 'zh' ? 'MCP接口列表' : 'MCP Exposed Interfaces'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-normal">
                                  {lang === 'zh' ? '共 4 个接口' : '4 interfaces'}
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                {[
                                  {
                                    name: 'get_well_production_data',
                                    desc: '按时间序列检索指定井的日产油、日产水、套压与油压数据',
                                  },
                                  {
                                    name: 'query_fracturing_curves',
                                    desc: '查询压裂施工过程中的泵注压力曲线、施工排量及支撑剂加砂剖面',
                                  },
                                  {
                                    name: 'execute_decline_analysis',
                                    desc: '基于 Arps 递减模型算法拟合油藏递减规律并预测未来 12 个月产能',
                                  },
                                  {
                                    name: 'export_mcp_engineering_report',
                                    desc: '一键生成符合油气田标准规范的工程分析与诊断报告 (Markdown / PDF)',
                                  }
                                ].map((iface, iIdx) => (
                                  <div key={iIdx} className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                                    <div className="font-mono font-bold text-indigo-700 text-[11px] shrink-0 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                      {iface.name}
                                    </div>
                                    <div className="text-[11px] text-slate-600 sm:text-right">
                                      {iface.desc}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: PAGE URLS CONFIG */}
              {activeTab === 'urls' && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="space-y-4">
                    {/* Init Page URL */}
                    <div className="space-y-1.5 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <label className="text-xs font-black text-slate-800 block">
                        {lang === 'zh' ? '智能体初始化页面地址' : 'Init Page URL'}
                      </label>
                      <input 
                        type="text" 
                        placeholder="https://init.example.com/agent-init"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 px-4 text-xs font-mono font-medium text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                        value={formData.initPageUrl}
                        onChange={(e) => setFormData({ ...formData, initPageUrl: e.target.value })}
                      />
                      <p className="text-[10px] text-slate-400">
                        {lang === 'zh' ? '首期加载该智能体时展示的引导交互或前置配置 URL' : 'Optional URL rendered during agent initialization phase'}
                      </p>
                    </div>

                    {/* Run Page URL */}
                    <div className="space-y-1.5 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <label className="text-xs font-black text-slate-800 block">
                        {lang === 'zh' ? '智能体运行页面地址' : 'Running Visual Page URL'}
                      </label>
                      <input 
                        type="text" 
                        placeholder="https://run.example.com/agent-run"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 px-4 text-xs font-mono font-medium text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                        value={formData.runPageUrl}
                        onChange={(e) => setFormData({ ...formData, runPageUrl: e.target.value })}
                      />
                      <p className="text-[10px] text-slate-400">
                        {lang === 'zh' ? '对话主窗口旁协同渲染的嵌入式交互/三维/报表页面' : 'Visual web canvas embedded during active agent execution'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

            </div>

            {/* Footer Sticky Bar */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between z-20">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{lang === 'zh' ? '步骤填写完整度：正常' : 'Ready to register'}</span>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
                >
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button 
                  onClick={handleRegister}
                  className="px-8 py-2.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 cursor-pointer"
                >
                  <i className="fas fa-check text-xs"></i>
                  {lang === 'zh' ? '确认注册智能体' : 'Register Agent'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
