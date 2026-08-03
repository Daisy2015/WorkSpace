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
    selectedSkills: string[];
    icon: string;
    businessCategory?: string;
  }) => void;
  lang: Language;
}

const MOCK_MCP_SERVICES = [
  { name: 'get_well_production', desc: '查询单井产量', path: '/api/v1/production/well' },
  { name: 'get_frac_params', desc: '获取压裂参数', path: '/api/v1/frac/params' },
  { name: 'generate_optimization_suggest', desc: '生成优化建议', path: '/api/v1/optimization/suggest' },
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
  '地质研究',
  '测录井解释',
  '钻井工程',
  '完井压裂',
  '开发生产',
  '油藏工程',
  '生产运行',
  '设备运维',
  '安全环保',
  '经营管理'
];

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ isOpen, onClose, onSubmit, lang }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'General' as 'Role' | 'Scenario' | 'General',
    mcpAddress: '',
    initPageUrl: '', // New field
    runPageUrl: '', // Renamed from visualPageUrl
    selectedSkills: [] as string[],
    icon: 'fa-robot',
    businessCategory: '',
  });

  const [availableSkills, setAvailableSkills] = useState<SkillEntry[]>([]);

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
      // Pick a random icon on modal open to make it interactive and delightful!
      const randomIndex = Math.floor(Math.random() * SYSTEM_ICONS.length);
      setFormData(prev => ({
        ...prev,
        icon: SYSTEM_ICONS[randomIndex],
        businessCategory: '',
      }));
    }
  }, [isOpen]);

  const [showMcpPreview, setShowMcpPreview] = useState(false);
  const [showVisualPreview, setShowVisualPreview] = useState(false);
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const handleRegister = () => {
    if (!formData.name.trim()) {
      alert(lang === 'zh' ? '请输入智能体名称' : 'Please enter agent name');
      return;
    }
    if (!formData.description.trim()) {
      alert(lang === 'zh' ? '请输入智能体描述' : 'Please enter agent description');
      return;
    }
    if (formData.type === 'Scenario' && !formData.businessCategory.trim()) {
      alert(lang === 'zh' ? '请输入或选择场景所属业务分类' : 'Please enter or select business category');
      return;
    }
    if (onSubmit) {
      onSubmit({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        initPageUrl: formData.initPageUrl,
        runPageUrl: formData.runPageUrl,
        mcpAddress: formData.mcpAddress,
        selectedSkills: formData.selectedSkills,
        icon: formData.icon,
        businessCategory: formData.type === 'Scenario' ? formData.businessCategory : undefined,
      });
    }
    setFormData({
      name: '',
      description: '',
      type: 'General',
      mcpAddress: '',
      initPageUrl: '',
      runPageUrl: '',
      selectedSkills: [],
      icon: 'fa-robot',
      businessCategory: '',
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header - Sticky */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <i className="fas fa-robot text-sm"></i>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">{lang === 'zh' ? '注册智能体' : 'Register Agent'}</h3>
                  <p className="text-[10px] font-bold text-slate-400">
                    {lang === 'zh' ? '配置智能体基本信息' : 'Basic Configuration'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
              <div className="space-y-5">
                {/* Basic Info Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-indigo-600 rounded-full"></div>
                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{lang === 'zh' ? '基本信息' : 'Basic Info'}</h4>
                  </div>
                  
                  <div className="grid gap-4">
                    {/* Agent Icon Configuration */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-500 ml-1">
                        {lang === 'zh' ? '智能体图标' : 'Agent Icon'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-3 bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl flex items-center justify-center text-xl shadow-inner">
                          <i className={`fas ${formData.icon}`}></i>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="text-xs font-bold text-slate-700">
                            {lang === 'zh' ? `当前图标: ${formData.icon}` : `Current Icon: ${formData.icon}`}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const randomIndex = Math.floor(Math.random() * SYSTEM_ICONS.length);
                                setFormData(prev => ({ ...prev, icon: SYSTEM_ICONS[randomIndex] }));
                              }}
                              className="px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 transition-all text-[11px] font-black rounded-lg flex items-center gap-1.5 shadow-sm"
                            >
                              <i className="fas fa-random text-[10px]"></i>
                              {lang === 'zh' ? '从系统已有图标中随机选择一个' : 'Random Selection'}
                            </button>
                            
                            {/* Quick selection of some popular icons */}
                            <div className="flex gap-1 items-center ml-2 border-l border-slate-200 pl-3">
                              {['fa-robot', 'fa-brain', 'fa-cube', 'fa-user-tie', 'fa-tools'].map(ic => (
                                <button
                                  key={ic}
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, icon: ic }))}
                                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] transition-all ${
                                    formData.icon === ic 
                                      ? 'bg-indigo-100 text-indigo-600 border border-indigo-200' 
                                      : 'bg-white hover:bg-slate-100 text-slate-400 border border-slate-100'
                                  }`}
                                >
                                  <i className={`fas ${ic}`}></i>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-500 ml-1">
                        {lang === 'zh' ? '智能体名称' : 'Agent Name'} <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder={lang === 'zh' ? '请输入智能体名称' : 'Please enter agent name'}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-xl p-2.5 px-4 text-xs font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 bg-white outline-none transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-500 ml-1">
                        {lang === 'zh' ? '智能体类型' : 'Agent Type'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                        {[
                          { id: 'General', label: lang === 'zh' ? '通用' : 'General', icon: 'fa-bolt' },
                          { id: 'Scenario', label: lang === 'zh' ? '场景' : 'Scenario', icon: 'fa-cube' },
                          { id: 'Role', label: lang === 'zh' ? '岗位' : 'Role', icon: 'fa-user-tie' },
                        ].map(item => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, type: item.id as 'Role' | 'Scenario' | 'General' })}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                              formData.type === item.id 
                                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/20' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                            }`}
                          >
                            <i className={`fas ${item.icon} text-[10px]`}></i>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scenario Business Category (only visible for Scenario type) */}
                    <AnimatePresence>
                      {formData.type === 'Scenario' && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5 relative overflow-visible"
                        >
                          <label className="text-[11px] font-black text-slate-500 ml-1 flex justify-between items-center">
                            <span>{lang === 'zh' ? '场景所属业务分类' : 'Scenario Business Category'} <span className="text-rose-500">*</span></span>
                            <span className="text-[9px] font-bold text-slate-400">({lang === 'zh' ? '支持手动输入或下拉选择' : 'Supports manual input or select'})</span>
                          </label>
                          <div className="relative flex">
                            <input 
                              type="text" 
                              placeholder={lang === 'zh' ? '请输入或选择所属业务分类' : 'Enter or select business category'}
                              className="w-full bg-slate-50/50 border border-slate-100 rounded-xl p-2.5 px-4 text-xs font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 bg-white outline-none transition-all pr-10"
                              value={formData.businessCategory}
                              onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                            />
                            <button
                              type="button"
                              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <i className={`fas fa-chevron-down text-[10px] transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}></i>
                            </button>
                          </div>
                          
                          {isCategoryDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1 max-h-40 overflow-y-auto custom-scrollbar">
                              {BUSINESS_CATEGORIES.map(cat => (
                                <div 
                                  key={cat}
                                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
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

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-500 ml-1">
                        {lang === 'zh' ? '智能体描述' : 'Agent Description'} <span className="text-rose-500">*</span>
                      </label>
                      <textarea 
                        placeholder={lang === 'zh' ? '请描述该智能体解决什么业务问题，服务于哪些用户，适用场景是什么...' : 'Please describe what business problem this agent solves...'}
                        className="w-full h-20 bg-slate-50/50 border border-slate-100 rounded-xl p-2.5 px-4 text-xs font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 bg-white outline-none transition-all resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Page URLs Configuration Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-indigo-600 rounded-full"></div>
                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{lang === 'zh' ? '页面地址配置' : 'Page URLs Config'}</h4>
                  </div>
                  
                  {/* Init Page URL */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 ml-1">
                      {lang === 'zh' ? '智能体初始化页面地址' : 'Agent Initialization Page URL'}
                    </label>
                    <input 
                      type="text" 
                      placeholder="https://init.example.com/agent-init"
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-xl p-2.5 px-4 text-xs font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 bg-white outline-none transition-all"
                      value={formData.initPageUrl}
                      onChange={(e) => setFormData({ ...formData, initPageUrl: e.target.value })}
                    />
                  </div>

                  {/* Run Page URL */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 ml-1">
                      {lang === 'zh' ? '智能体运行页面地址' : 'Agent Running Page URL'}
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="https://run.example.com/agent-run"
                        className="flex-1 bg-slate-50/50 border border-slate-100 rounded-xl p-2.5 px-4 text-xs font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 bg-white outline-none transition-all"
                        value={formData.runPageUrl}
                        onChange={(e) => setFormData({ ...formData, runPageUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* MCP Service Config Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-indigo-600 rounded-full"></div>
                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{lang === 'zh' ? 'MCP服务地址配置' : 'MCP Config'}</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="https://api.example.com/mcp/service"
                        className="flex-1 bg-slate-50/50 border border-slate-100 rounded-xl p-2.5 px-4 text-xs font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 bg-white outline-none transition-all"
                        value={formData.mcpAddress}
                        onChange={(e) => setFormData({ ...formData, mcpAddress: e.target.value })}
                      />
                      {formData.mcpAddress && (
                        <button 
                          onClick={() => setShowMcpPreview(!showMcpPreview)}
                          className={`px-4 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                            showMcpPreview 
                              ? 'bg-indigo-600 text-white shadow-sm' 
                              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                          }`}
                        >
                          <i className="fas fa-eye"></i>
                          {lang === 'zh' ? '预览服务' : 'Preview'}
                        </button>
                      )}
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 ml-1">
                      {lang === 'zh' ? '配置该智能体封装的MCP服务访问地址' : 'Configure the MCP service access address'}
                    </p>
                  </div>
                  
                  {/* MCP Preview Area */}
                  <AnimatePresence>
                    {showMcpPreview && formData.mcpAddress && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-2">
                          <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                            <i className="fas fa-list-ul text-slate-400"></i>
                            {lang === 'zh' ? '已发现服务列表' : 'Discovered Services'}
                          </h5>
                          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                            {MOCK_MCP_SERVICES.map((srv, idx) => (
                              <div key={idx} className={`flex items-center px-4 py-3 ${idx !== MOCK_MCP_SERVICES.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50 transition-colors`}>
                                <span className="w-1/3 text-xs font-bold text-slate-700 truncate pr-4">{srv.name}</span>
                                <span className="flex-1 text-xs text-slate-500 truncate" title={srv.desc}>{srv.desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Skill Package Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-indigo-600 rounded-full"></div>
                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{lang === 'zh' ? 'skills配置（选填）' : 'Skills Config (Optional)'}</h4>
                  </div>
                  
                  <div className="relative">
                    <div 
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-xl p-2.5 px-4 min-h-[42px] flex flex-wrap items-center gap-2 cursor-pointer transition-all hover:bg-slate-50 focus-within:ring-4 focus-within:ring-indigo-500/5 focus-within:border-indigo-500 bg-white"
                      onClick={() => setIsSkillDropdownOpen(!isSkillDropdownOpen)}
                    >
                      {formData.selectedSkills.length === 0 && (
                        <span className="text-xs text-slate-400 font-medium ml-1">
                          {lang === 'zh' ? '请选择skills配置（可多选，选填）' : 'Select skills (optional)...'}
                        </span>
                      )}
                      {formData.selectedSkills.map(skillId => {
                        const skill = availableSkills.find(s => s.id === skillId);
                        return (
                          <span key={skillId} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-[11px] font-bold flex items-center gap-1.5 border border-indigo-200">
                            {skill?.name}
                            <i 
                              className="fas fa-times cursor-pointer hover:text-indigo-900 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData(prev => ({
                                  ...prev,
                                  selectedSkills: prev.selectedSkills.filter(id => id !== skillId)
                                }));
                              }}
                            ></i>
                          </span>
                        );
                      })}
                      <i className={`fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-transform ${isSkillDropdownOpen ? 'rotate-180' : ''}`}></i>
                    </div>
                    
                    <AnimatePresence>
                      {isSkillDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-2 max-h-48 overflow-y-auto custom-scrollbar"
                        >
                          {availableSkills.map(skill => {
                            const isSelected = formData.selectedSkills.includes(skill.id);
                            return (
                              <div 
                                key={skill.id}
                                className={`px-4 py-2.5 text-xs font-bold cursor-pointer flex items-center justify-between transition-colors ${
                                  isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData(prev => ({
                                    ...prev,
                                    selectedSkills: isSelected 
                                      ? prev.selectedSkills.filter(id => id !== skill.id)
                                      : [...prev.selectedSkills, skill.id]
                                  }));
                                }}
                              >
                                <span>{skill.name}</span>
                                {isSelected && <i className="fas fa-check text-indigo-500"></i>}
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Sticky */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 z-10">
              <button 
                onClick={onClose}
                className="px-6 py-2 rounded-xl text-[11px] font-black text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button 
                onClick={handleRegister}
                className="px-8 py-2 rounded-xl text-[11px] font-black text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
              >
                <i className="fas fa-check text-[10px]"></i>
                {lang === 'zh' ? '注册智能体' : 'Register'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
