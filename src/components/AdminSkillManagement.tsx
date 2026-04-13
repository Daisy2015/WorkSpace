
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, SkillEntry } from '../types';
import { AdminSkillStudio } from './AdminSkillStudio';

interface AdminSkillManagementProps {
  lang: Language;
}

const MOCK_SKILLS: SkillEntry[] = [
  {
    id: 'skill-1',
    name: '异常诊断技能',
    domain: '生产分析',
    category: 'Analysis',
    triggerConditions: 'intent == "diagnosis"',
    boundTools: ['SQL_Query', 'Vector_Search'],
    reusedByAgents: 12,
    workflowRefs: 8,
    version: 'v2.1.0',
    runtimeSuccess: '98.5%',
    visibility: ['Foundation', 'Professional', 'Enterprise'],
    updatedAt: '2024-05-20 10:00',
    status: 'Production',
    description: '用于分析油井产量下降、压力异常等生产问题的核心诊断技能。'
  },
  {
    id: 'skill-2',
    name: '地质报告生成',
    domain: '文档自动化',
    category: 'Document',
    triggerConditions: 'action == "generate_report"',
    boundTools: ['Doc_Generator', 'Chart_Tool'],
    reusedByAgents: 5,
    workflowRefs: 3,
    version: 'v1.4.2',
    runtimeSuccess: '95.2%',
    visibility: ['Professional', 'Enterprise', 'Flagship'],
    updatedAt: '2024-05-19 15:30',
    status: 'Production',
    description: '自动汇总测井、录井数据并生成标准格式的地质评价报告。'
  },
  {
    id: 'skill-3',
    name: '地震剖面识别',
    domain: '图件识别',
    category: 'Image',
    triggerConditions: 'input_type == "seismic_image"',
    boundTools: ['CV_Model_X', 'OCR_Tool'],
    reusedByAgents: 3,
    workflowRefs: 2,
    version: 'v0.9.5',
    runtimeSuccess: '88.0%',
    visibility: ['Enterprise', 'Flagship'],
    updatedAt: '2024-05-18 09:15',
    status: 'Testing',
    description: '识别地震剖面中的层位、断层及特殊地质体。'
  }
];

export const AdminSkillManagement: React.FC<AdminSkillManagementProps> = ({ lang }) => {
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerSkill, setDrawerSkill] = useState<SkillEntry | null>(null);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(true);

  const categories = [
    { id: 'All', label: lang === 'zh' ? '全部技能' : 'All Skills', icon: 'fa-th-large' },
    { id: 'Analysis', label: lang === 'zh' ? '分析类 Skills' : 'Analysis Skills', icon: 'fa-chart-line' },
    { id: 'Document', label: lang === 'zh' ? '文档类 Skills' : 'Document Skills', icon: 'fa-file-alt' },
    { id: 'Image', label: lang === 'zh' ? '图件类 Skills' : 'Image Skills', icon: 'fa-image' },
    { id: 'SOP', label: lang === 'zh' ? '岗位 SOP Skills' : 'SOP Skills', icon: 'fa-tasks' },
    { id: 'Collaboration', label: lang === 'zh' ? '协同 Skills' : 'Collaboration Skills', icon: 'fa-users' },
    { id: 'Official', label: lang === 'zh' ? '官方认证 Skills' : 'Official Skills', icon: 'fa-certificate' },
    { id: 'Customer', label: lang === 'zh' ? '客户沉淀 Skills' : 'Customer Skills', icon: 'fa-user-tie' },
  ];

  const filteredSkills = MOCK_SKILLS.filter(s => activeCategory === 'All' || s.category === activeCategory);

  if (selectedSkillId) {
    const skill = MOCK_SKILLS.find(s => s.id === selectedSkillId);
    if (skill) {
      return <AdminSkillStudio lang={lang} skill={skill} onBack={() => setSelectedSkillId(null)} />;
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden relative">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800">
            {lang === 'zh' ? 'Skill Registry｜企业级业务能力资产注册中心' : 'Skill Registry | Enterprise Capability Assets'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input 
              type="text" 
              placeholder={lang === 'zh' ? '搜索技能资产...' : 'Search skills...'} 
              className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-xs w-64 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
            <i className="fas fa-plus"></i>
            {lang === 'zh' ? '注册新技能' : 'Register Skill'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Category Tree */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
          <div className="p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">
              {lang === 'zh' ? '能力分类树' : 'Capability Tree'}
            </div>
            <nav className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeCategory === cat.id 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <i className={`fas ${cat.icon} w-4 text-center ${activeCategory === cat.id ? 'text-indigo-500' : 'text-slate-400'}`}></i>
                  {cat.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Middle: Asset List */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? 'Skill 名称' : 'Skill Name'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capability Domain</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trigger</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tools</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reuse</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Success</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '最近更新' : 'Updated'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{lang === 'zh' ? '操作' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSkills.map(skill => (
                    <tr 
                      key={skill.id} 
                      className="group hover:bg-indigo-50/30 transition-all cursor-pointer"
                      onClick={() => {
                        setDrawerSkill(skill);
                        setIsDrawerOpen(true);
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                            skill.status === 'Production' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            <i className="fas fa-toolbox"></i>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{skill.name}</div>
                            <div className="text-[10px] text-slate-400">{skill.version}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{skill.domain}</span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{skill.triggerConditions}</code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {skill.boundTools.map((tool, i) => (
                            <div key={i} title={tool} className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[8px] text-slate-400 shadow-sm">
                              <i className="fas fa-link"></i>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-xs font-bold text-slate-800">{skill.reusedByAgents}</div>
                            <div className="text-[8px] text-slate-400 uppercase">Agents</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs font-bold text-slate-800">{skill.workflowRefs}</div>
                            <div className="text-[8px] text-slate-400 uppercase">Workflows</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: skill.runtimeSuccess }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600">{skill.runtimeSuccess}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{skill.updatedAt}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSkillId(skill.id);
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                        >
                          {lang === 'zh' ? '进入 Studio' : 'Enter Studio'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom: Running Heatmap */}
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
                <div className="h-4 w-px bg-slate-200"></div>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '高频场景:' : 'High Freq:'}</span>
                    <span className="text-xs font-bold text-slate-600">{lang === 'zh' ? '产量诊断' : 'Prod Diagnosis'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ROI:</span>
                    <span className="text-xs font-bold text-emerald-600">+24%</span>
                  </div>
                </div>
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
                <div className="text-[10px] text-slate-400 mt-1">{lang === 'zh' ? '本月节省人工成本' : 'Labor cost saved this month'}</div>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Right: Skill Manifest Drawer */}
        <AnimatePresence>
          {isDrawerOpen && drawerSkill && (
            <motion.aside 
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-[400px] bg-white border-l border-slate-200 flex flex-col flex-shrink-0 z-30 shadow-2xl"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800">{lang === 'zh' ? 'Skill Manifest 注册详情' : 'Skill Manifest Details'}</h3>
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
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold uppercase">{drawerSkill.status}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{drawerSkill.description}</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Trigger 条件</label>
                    <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-indigo-300 border border-slate-800">
                      {drawerSkill.triggerConditions}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Allowed Agents</div>
                      <div className="text-sm font-bold text-slate-800">{drawerSkill.reusedByAgents}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Allowed Tools</div>
                      <div className="text-sm font-bold text-slate-800">{drawerSkill.boundTools.length}</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Safety Constraints</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <i className="fas fa-check-circle text-emerald-500"></i>
                        {lang === 'zh' ? '数据脱敏校验' : 'Data Masking Check'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <i className="fas fa-check-circle text-emerald-500"></i>
                        {lang === 'zh' ? 'Token 消耗限制' : 'Token Usage Limit'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Industry Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {['Oil & Gas', 'Production', 'Diagnosis', 'Real-time'].map(tag => (
                        <span key={tag} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-medium">#{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Package Scope</label>
                    <div className="space-y-2">
                      {['Foundation', 'Professional', 'Enterprise', 'Flagship'].map(pkg => (
                        <div key={pkg} className="flex items-center justify-between">
                          <span className="text-xs text-slate-600">{pkg}</span>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            drawerSkill.visibility.includes(pkg) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                          }`}>
                            {drawerSkill.visibility.includes(pkg) && <i className="fas fa-check text-[8px]"></i>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex gap-3">
                <button 
                  onClick={() => setSelectedSkillId(drawerSkill.id)}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  {lang === 'zh' ? '进入 Studio' : 'Enter Studio'}
                </button>
                <button className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">
                  <i className="fas fa-share-alt"></i>
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
