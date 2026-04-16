
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, SkillEntry } from '../types';

interface AdminSkillManagementProps {
  lang: Language;
}

const MOCK_SKILLS: SkillEntry[] = [
  {
    id: 'skill-4',
    name: '邻井发现 Skill',
    scope: 'Project',
    description: '基于地理位置和地质特征自动发现并匹配相邻参考井。',
    instructions: '邻井发现的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-21 11:00',
    category: 'Engineering'
  },
  {
    id: 'skill-5',
    name: '储层评分 Skill',
    scope: 'Project',
    description: '多维度计算储层特征相似度，辅助井位部署决策。',
    instructions: '储层评分的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-21 11:15',
    category: 'Engineering'
  },
  {
    id: 'skill-6',
    name: '生产评价 Skill',
    scope: 'Global',
    description: '综合分析油气井生产历史，评估产能及衰减趋势。',
    instructions: '生产评价的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-21 11:30',
    category: 'Engineering'
  },
  {
    id: 'skill-7',
    name: '参数抽取 Skill',
    scope: 'Project',
    description: '从历史压裂施工文档中自动抽取关键工程参数。',
    instructions: '压裂参数抽取的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-21 11:45',
    category: 'Engineering'
  },
  {
    id: 'skill-9',
    name: '全域类比检索 Skill',
    scope: 'Global',
    description: '在全区范围内检索最具参考价值的历史成功井。',
    instructions: '全域类比检索的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-21 12:15',
    category: 'Analysis'
  },
  {
    id: 'skill-10',
    name: '甜点综合评分 Skill',
    scope: 'Project',
    description: '综合孔隙度、饱和度、脆性等指标进行段级甜点评分。',
    instructions: '甜点综合评分的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-21 12:30',
    category: 'Engineering'
  },
  {
    id: 'skill-11',
    name: '参数寻优 Skill',
    scope: 'Global',
    description: '基于多目标优化算法，寻找最优压裂施工参数组合。',
    instructions: '参数寻优的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-21 12:45',
    category: 'Optimization'
  },
  {
    id: 'skill-12',
    name: 'EUR 预测 Skill',
    scope: 'Global',
    description: '结合地质属性和生产数据，预测单井最终可采储量。',
    instructions: 'EUR 预测的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-21 13:00',
    category: 'Analysis'
  },
  {
    id: 'skill-3',
    name: '地震剖面识别',
    scope: 'Project',
    description: '识别地震剖面中的层位、断层及特殊地质体。',
    instructions: '识别地震剖面的详细指令...',
    isEnabled: false,
    updatedAt: '2024-05-18 09:15',
    category: 'Image'
  }
];

export const AdminSkillManagement: React.FC<AdminSkillManagementProps> = ({ lang }) => {
  const [skills, setSkills] = useState<SkillEntry[]>(MOCK_SKILLS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillEntry | null>(null);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerSkill, setDrawerSkill] = useState<SkillEntry | null>(null);

  // Form States
  const [formScope, setFormScope] = useState<'Global' | 'Project'>('Project');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formInstructions, setFormInstructions] = useState('');

  const filteredSkills = useMemo(() => {
    return skills.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [skills, searchQuery]);

  const handleOpenModal = (skill?: SkillEntry) => {
    if (skill) {
      setEditingSkill(skill);
      setFormScope(skill.scope);
      setFormName(skill.name);
      setFormDescription(skill.description);
      setFormInstructions(skill.instructions);
    } else {
      setEditingSkill(null);
      setFormScope('Project');
      setFormName('');
      setFormDescription('');
      setFormInstructions('');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingSkill) {
      setSkills(prev => prev.map(s => s.id === editingSkill.id ? {
        ...s,
        name: formName,
        scope: formScope,
        description: formDescription,
        instructions: formInstructions,
        updatedAt: new Date().toLocaleString()
      } : s));
    } else {
      const newSkill: SkillEntry = {
        id: `skill-${Date.now()}`,
        name: formName,
        scope: formScope,
        description: formDescription,
        instructions: formInstructions,
        isEnabled: true,
        updatedAt: new Date().toLocaleString(),
        category: 'Analysis'
      };
      setSkills(prev => [newSkill, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(lang === 'zh' ? '确定删除该技能吗？' : 'Are you sure you want to delete this skill?')) {
      setSkills(prev => prev.filter(s => s.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, isEnabled: !s.isEnabled } : s));
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden relative">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800">
            {lang === 'zh' ? '技能管理' : 'Skill Management'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input 
              type="text" 
              placeholder={lang === 'zh' ? '搜索技能...' : 'Search skills...'} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-xs w-64 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            {lang === 'zh' ? '注册新技能' : 'Register Skill'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Asset List - Sidebar Removed */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '技能名称' : 'Skill Name'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '描述' : 'Description'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '状态' : 'Status'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '修改人' : 'Modified By'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '最近更新' : 'Updated'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{lang === 'zh' ? '操作' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSkills.map(skill => (
                    <tr 
                      key={skill.id} 
                      className="group hover:bg-indigo-50/30 transition-all"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                            skill.isEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            <i className="fas fa-toolbox"></i>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{skill.name}</div>
                            <div className="text-[10px] text-slate-400">{skill.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500 max-w-md truncate" title={skill.description}>
                          {skill.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStatus(skill.id);
                          }}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                            skill.isEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              skill.isEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {skill.updatedBy?.[0] || 'A'}
                          </div>
                          <span className="text-xs text-slate-600">{skill.updatedBy || 'Admin'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{skill.updatedAt}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrawerSkill(skill);
                              setIsDrawerOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                            title={lang === 'zh' ? '详情' : 'Details'}
                          >
                            <i className="fas fa-info-circle"></i>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(skill.id);
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                            title={lang === 'zh' ? '删除' : 'Delete'}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom: Running Heatmap (Simplified) */}
          <motion.div 
            initial={false}
            animate={{ height: isHeatmapOpen ? '200px' : '48px' }}
            className="bg-white border-t border-slate-200 flex flex-col z-20 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]"
          >
            <button 
              onClick={() => setIsHeatmapOpen(!isHeatmapOpen)}
              className="h-12 px-8 flex items-center justify-between hover:bg-slate-50 transition-all group"
            >
              <div className="flex items-center gap-6">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <i className="fas fa-fire text-orange-500"></i>
                  {lang === 'zh' ? '运行热度与资产效能' : 'Running Heatmap & Asset Efficiency'}
                </span>
              </div>
              <i className={`fas fa-chevron-${isHeatmapOpen ? 'down' : 'up'} text-slate-400 group-hover:text-indigo-600 transition-all`}></i>
            </button>
            <div className="flex-1 p-6 grid grid-cols-4 gap-6 overflow-hidden">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'zh' ? '调用热度趋势' : 'Call Trend'}</div>
                <div className="h-16 flex items-end gap-1">
                  {[40, 60, 45, 70, 90, 65, 80, 55, 75, 95].map((h, i) => (
                    <div key={i} className="flex-1 bg-indigo-200 rounded-t-sm hover:bg-indigo-500 transition-all" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'zh' ? 'Top 复用 Agent' : 'Top Reused Agents'}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]"><span className="text-slate-600">Leader Agent</span><span className="font-bold">42%</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-slate-600">Prod Analyst</span><span className="font-bold">28%</span></div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'zh' ? 'Top 失败原因' : 'Top Failure Reasons'}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]"><span className="text-slate-600">Tool Timeout</span><span className="font-bold text-rose-500">54%</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-slate-600">Schema Mismatch</span><span className="font-bold text-amber-500">22%</span></div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">ROI {lang === 'zh' ? '贡献' : 'Contribution'}</div>
                <div className="text-2xl font-bold text-emerald-600">$12.4k</div>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Right: Skill Details Drawer */}
        <AnimatePresence>
          {isDrawerOpen && drawerSkill && (
            <motion.aside 
              initial={{ x: 450 }}
              animate={{ x: 0 }}
              exit={{ x: 450 }}
              className="w-[450px] bg-white border-l border-slate-200 flex flex-col flex-shrink-0 z-30 shadow-2xl"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '技能详情' : 'Skill Details'}</h3>
                <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-200">
                      <i className="fas fa-toolbox"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{drawerSkill.name}</h4>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold uppercase">{drawerSkill.isEnabled ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{drawerSkill.description}</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">{lang === 'zh' ? '技能指令' : 'Instructions'}</label>
                    <div className="bg-slate-900 rounded-xl p-4 font-mono text-[10px] border border-slate-800 text-indigo-100 whitespace-pre-wrap">
                      {drawerSkill.instructions}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'zh' ? '适用范围' : 'Scope'}</div>
                      <div className="text-sm font-bold text-slate-800">{drawerSkill.scope}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'zh' ? '最近更新' : 'Updated At'}</div>
                      <div className="text-sm font-bold text-slate-800">{drawerSkill.updatedAt}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex gap-3">
                <button 
                  onClick={() => {
                    setIsDrawerOpen(false);
                    handleOpenModal(drawerSkill);
                  }}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  {lang === 'zh' ? '编辑技能' : 'Edit Skill'}
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Create/Edit Skill Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">
                  {editingSkill ? (lang === 'zh' ? '编辑技能' : 'Edit Skill') : (lang === 'zh' ? '注册新技能' : 'Register Skill')}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all cursor-pointer group">
                  <i className="fas fa-file-upload text-3xl text-slate-300 group-hover:text-indigo-500 mb-3"></i>
                  <div className="text-sm font-bold text-slate-600 mb-1 group-hover:text-indigo-600">{lang === 'zh' ? '上传进行智能解析' : 'Upload for Intelligent Parsing'}</div>
                  <div className="text-[10px] text-slate-400 text-center max-w-sm">
                    {lang === 'zh' ? '包含 SKILL.md 文件的 .zip 或 .skill 文件，SKILL.md 位于根目录，包含 YAML 格式的技能名称和描述。' : 'A .zip or .skill file containing SKILL.md at the root, with YAML formatted name and description.'}
                  </div>
                </div>

                {/* Skill Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                    <span className="text-rose-500">*</span> {lang === 'zh' ? '技能名称' : 'Skill Name'}
                  </label>
                  <input 
                    type="text" 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={lang === 'zh' ? '为这个 Skill 起一个简短的名称，例如：邻井发现' : 'Give this skill a short name, e.g., Neighbor Well Discovery'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                    <span className="text-rose-500">*</span> {lang === 'zh' ? '描述' : 'Description'}
                  </label>
                  <textarea 
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder={lang === 'zh' ? '简单描述这个 Skill 应该在什么情况下被触发，例如：基于地理位置和地质特征自动发现并匹配相邻参考井' : 'Briefly describe when this skill should be triggered...'}
                    className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  />
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                    <span className="text-rose-500">*</span> {lang === 'zh' ? '指令' : 'Instructions'}
                  </label>
                  <textarea 
                    value={formInstructions}
                    onChange={(e) => setFormInstructions(e.target.value)}
                    placeholder={lang === 'zh' ? '当这个 Skill 被触发时，你希望模型遵循哪些规则或信息，例如：\n\n# 邻井发现指令\n## 目标\n为目标井寻找最匹配的参考邻井。\n## 逻辑\n1. 确定目标井所在的区块和层位。\n2. 在 5km 范围内搜索同层位的生产井。' : 'What rules or info should the model follow when this skill is triggered...'}
                    className="w-full h-64 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-indigo-100 font-mono placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all"
                >
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!formName || !formDescription || !formInstructions}
                  className="px-8 py-2 bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  {lang === 'zh' ? '确认' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
