
import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, SkillEntry } from '../types';
import JSZip from 'jszip';

interface AdminSkillManagementProps {
  lang: Language;
  onCreateSceneSkill?: () => void;
}

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

const MOCK_SKILL_FILES: FileNode[] = [
  {
    name: 'skill-package',
    type: 'folder',
    children: [
      { name: 'SKILL.md', type: 'file' },
      { name: 'README.md', type: 'file' },
      { 
        name: 'src', 
        type: 'folder',
        children: [
          { name: 'index.ts', type: 'file' },
          { name: 'utils.ts', type: 'file' },
          { name: 'schema.json', type: 'file' }
        ]
      },
      {
        name: 'assets',
        type: 'folder',
        children: [
          { name: 'icon.png', type: 'file' }
        ]
      }
    ]
  }
];

const FileTreeNode: React.FC<{ node: FileNode; level?: number }> = ({ node, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 py-1.5 px-2 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors ${level > 0 ? 'ml-2' : ''}`}
        onClick={() => node.type === 'folder' && setIsOpen(!isOpen)}
      >
        <i className={`fas ${node.type === 'folder' ? (isOpen ? 'fa-folder-open text-indigo-400' : 'fa-folder text-indigo-400') : 'fa-file-alt text-slate-400'} w-4 text-center text-xs`}></i>
        <span className="text-xs text-slate-700 font-medium">{node.name}</span>
      </div>
      {node.type === 'folder' && isOpen && node.children && (
        <div className="border-l border-slate-300 ml-4 pl-2 mt-1 space-y-1">
          {node.children.map((child, idx) => (
            <FileTreeNode key={idx} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const MOCK_SKILLS: SkillEntry[] = [
  {
    id: 'skill-4',
    name: '邻井发现 Skill',
    scope: 'Project',
    description: '基于地理位置和地质特征自动发现并匹配相邻参考井。',
    instructions: '邻井发现的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-21 11:00',
    category: 'Business'
  },
  {
    id: 'skill-5',
    name: '储层评分 Skill',
    scope: 'Project',
    description: '多维度计算储层特征相似度，辅助井位部署决策。',
    instructions: '储层评分的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-21 11:15',
    category: 'Business'
  },
  {
    id: 'skill-6',
    name: '生产评价 Skill',
    scope: 'Global',
    description: '综合分析油气井生产历史，评估产能及衰减趋势。',
    instructions: '生产评价的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-21 11:30',
    category: 'Business'
  },
  {
    id: 'skill-7',
    name: '参数抽取 Skill',
    scope: 'Project',
    description: '从历史压裂施工文档中自动抽取关键工程参数。',
    instructions: '压裂参数抽取的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-21 11:45',
    category: 'Business'
  },
  {
    id: 'skill-9',
    name: '全域类比检索 Skill',
    scope: 'Global',
    description: '在全区范围内检索最具参考价值的历史成功井。',
    instructions: '全域类比检索的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-21 12:15',
    category: 'Business'
  },
  {
    id: 'skill-10',
    name: '甜点综合评分 Skill',
    scope: 'Project',
    description: '综合孔隙度、饱和度、脆性等指标进行段级甜点评分。',
    instructions: '甜点综合评分的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-21 12:30',
    category: 'Business'
  },
  {
    id: 'skill-11',
    name: '参数寻优 Skill',
    scope: 'Global',
    description: '基于多目标优化算法，寻找最优压裂施工参数组合。',
    instructions: '参数寻优的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-21 12:45',
    category: 'Business'
  },
  {
    id: 'skill-12',
    name: 'EUR 预测 Skill',
    scope: 'Global',
    description: '结合地质属性和生产数据，预测单井最终可采储量。',
    instructions: 'EUR 预测的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-21 13:00',
    category: 'Business'
  },
  {
    id: 'skill-3',
    name: '地震剖面识别',
    scope: 'Project',
    description: '识别地震剖面中的层位、断层及特殊地质体。',
    instructions: '识别地震剖面的详细指令...',
    isEnabled: false,
    updatedAt: '2024-05-18 09:15',
    category: 'Business'
  },
  {
    id: 'skill-creator',
    name: 'Skill Creator',
    scope: 'Global',
    description: '智能技能创建助手，辅助用户定义技能范围、指令和描述。',
    instructions: 'Skill Creator 的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-23 09:00',
    category: 'General'
  },
  {
    id: 'skill-finder',
    name: 'Skill Finder',
    scope: 'Global',
    description: '智能技能检索助手，在技能库中快速寻找匹配业务场景的技能。',
    instructions: 'Skill Finder 的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-23 09:10',
    category: 'General'
  },
  {
    id: 'docx',
    name: 'DOCX Handler',
    scope: 'Global',
    description: 'Word 文档处理技能，支持文档读取、内容分析和结构化导出。',
    instructions: 'DOCX Handler 的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-23 09:20',
    category: 'General'
  },
  {
    id: 'ppt',
    name: 'PPT Generator',
    scope: 'Global',
    description: 'PPT 演示文稿生成技能，根据分析结论自动构建幻灯片大纲和内容。',
    instructions: 'PPT Generator 的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-23 09:30',
    category: 'General'
  },
  {
    id: 'xlsx',
    name: 'XLSX Analyst',
    scope: 'Global',
    description: 'Excel 报表分析技能，自动从复杂表格中提取关键指标并进行横向对比。',
    instructions: 'XLSX Analyst 的详细指令...',
    isEnabled: true,
    updatedAt: '2024-05-23 09:40',
    category: 'General'
  }
];

export const AdminSkillManagement: React.FC<AdminSkillManagementProps> = ({ lang, onCreateSceneSkill }) => {
  const [skills, setSkills] = useState<SkillEntry[]>(() => {
    const stored = localStorage.getItem('mbu_skills');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return MOCK_SKILLS;
  });

  React.useEffect(() => {
    localStorage.setItem('mbu_skills', JSON.stringify(skills));
  }, [skills]);

  const [activeCategory, setActiveCategory] = useState<'All' | 'Business' | 'General'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillEntry | null>(null);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerSkill, setDrawerSkill] = useState<SkillEntry | null>(null);

  // Form States
  const [formScope, setFormScope] = useState<'Global' | 'Project'>('Project');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<string>('Business');
  const [formDescription, setFormDescription] = useState('');
  const [formInstructions, setFormInstructions] = useState('');

  // ZIP upload and parsing states
  const [parsingState, setParsingState] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [parsingError, setParsingError] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processZipFile = async (file: File) => {
    setUploadedFileName(file.name);
    setParsingState('parsing');
    setParsingError('');

    // Simulate short local reading delay for smooth UX
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!file.name.toLowerCase().endsWith('.zip') && !file.name.toLowerCase().endsWith('.skill')) {
      setParsingState('error');
      setParsingError(lang === 'zh' 
        ? '上传文件格式错误：必须为 .zip 或 .skill 格式的技能包！' 
        : 'File format error: Must be a .zip or .skill file!');
      return;
    }

    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);
      
      // Look for skill.md or SKILL.md
      const skillFilePath = Object.keys(loadedZip.files).find(
        path => path.toLowerCase().endsWith('skill.md')
      );

      if (!skillFilePath) {
        setParsingState('error');
        setParsingError(lang === 'zh' 
          ? '解析失败：未在技能包中检测到 skill.md 或 SKILL.md 文件！' 
          : 'Parsing failed: skill.md or SKILL.md file was not found in the archive!');
        return;
      }

      const content = await loadedZip.files[skillFilePath].async('string');
      parseSkillMarkdown(content);

    } catch (err: any) {
      console.error(err);
      setParsingState('error');
      setParsingError(lang === 'zh' 
        ? `解析 zip 文件出错: ${err.message || '未知错误'}` 
        : `Error reading zip file: ${err.message || 'Unknown error'}`);
    }
  };

  const parseSkillMarkdown = (content: string) => {
    let name = '';
    let description = '';
    let instructions = content;

    // Standard YAML frontmatter extraction
    const yamlMatch = content.match(/^---\r?\n([\s\S]+?)\r?\n---/);
    if (yamlMatch) {
      const yamlContent = yamlMatch[1];
      const nameMatch = yamlContent.match(/^name:\s*(["']?)(.*?)\1\s*$/m);
      const descMatch = yamlContent.match(/^description:\s*(["']?)(.*?)\1\s*$/m);
      if (nameMatch) name = nameMatch[2].trim();
      if (descMatch) description = descMatch[2].trim();
      
      instructions = content.replace(/^---\r?\n[\s\S]+?\r?\n---/, '').trim();
    }

    if (!name || !description) {
      setParsingState('error');
      const missing = [];
      if (!name) missing.push(lang === 'zh' ? '技能名称' : 'name');
      if (!description) missing.push(lang === 'zh' ? '技能描述' : 'description');
      setParsingError(lang === 'zh' 
        ? `解析失败：skill.md 中未包含完整的 ${missing.join(' 和 ')}（请确保文件开头包含 YAML 格式的 name 和 description 信息）！` 
        : `Parsing failed: skill.md is missing YAML formatted ${missing.join(' and ')} metadata in frontmatter.`);
      return;
    }

    setFormName(name);
    setFormDescription(description);
    setFormInstructions(instructions);
    setParsingState('success');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processZipFile(file);
  };

  const simulateUpload = async (type: 'success' | 'no-skill-md' | 'missing-meta') => {
    setParsingState('parsing');
    setParsingError('');
    setUploadedFileName(type === 'success' ? 'reservoir_score_skill.zip' : 'faulty_package.zip');

    await new Promise(resolve => setTimeout(resolve, 600));

    if (type === 'success') {
      const content = `---
name: "地层相似性推荐 Skill"
description: "深度挖掘沉积相、构造要素、岩心物性、完井特征等多维时空变量，精准输出最相似对比邻井列表。"
---
# 地层相似性推荐指令
## 目标
自动匹配当前目标井的最优邻井。
## 执行步骤
1. 解析本井的岩性剖面数据。
2. 计算 10 公里范围内候选井的地质结构相似度得分。
3. 过滤并推荐排名前三的优质邻井，生成对比图表。`;
      parseSkillMarkdown(content);
    } else if (type === 'no-skill-md') {
      setParsingState('error');
      setParsingError(lang === 'zh' 
        ? '解析失败：未在压缩包中检测到 skill.md 或 SKILL.md 文件！' 
        : 'Parsing failed: skill.md or SKILL.md file was not found in the archive!');
    } else if (type === 'missing-meta') {
      const content = `# Invalid Skill
This is an invalid skill because it doesn't contain a clear YAML header with name and description.`;
      parseSkillMarkdown(content);
    }
  };

  // Drawer Edit States
  const [drawerName, setDrawerName] = useState('');
  const [drawerCategory, setDrawerCategory] = useState('Business');
  const [drawerDescription, setDrawerDescription] = useState('');
  const [drawerInstructions, setDrawerInstructions] = useState('');

  const downloadSkillZip = async (skill: SkillEntry) => {
    try {
      const zip = new JSZip();
      const yamlHeader = `---
name: "${skill.name}"
description: "${skill.description}"
---
`;
      const skillMdContent = yamlHeader + (skill.instructions || '');
      zip.file('SKILL.md', skillMdContent);
      zip.file('README.md', `# ${skill.name}\n\n${skill.description}`);
      
      const srcFolder = zip.folder('src');
      if (srcFolder) {
        srcFolder.file('index.ts', `// Auto-generated module for ${skill.name}\nexport const run = () => {\n  console.log("Running ${skill.name}");\n};`);
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${skill.id || 'skill'}_package.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate zip", error);
    }
  };

  const handleOpenDrawer = (skill: SkillEntry) => {
    setDrawerSkill(skill);
    setDrawerName(skill.name);
    setDrawerCategory(skill.category || 'Business');
    setDrawerDescription(skill.description);
    setDrawerInstructions(skill.instructions || '');
    setIsDrawerOpen(true);
  };

  const handleSaveDrawer = () => {
    if (!drawerSkill) return;
    setSkills(prev => prev.map(s => s.id === drawerSkill.id ? {
      ...s,
      name: drawerName,
      category: drawerCategory,
      description: drawerDescription,
      instructions: drawerInstructions,
      updatedAt: new Date().toLocaleString()
    } : s));
    setIsDrawerOpen(false);
  };

  const filteredSkills = useMemo(() => {
    return skills.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = activeCategory === 'All' || s.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [skills, searchQuery, activeCategory]);

  const handleOpenModal = (skill?: SkillEntry) => {
    setParsingState('idle');
    setParsingError('');
    setUploadedFileName('');
    if (skill) {
      setEditingSkill(skill);
      setFormScope(skill.scope);
      setFormName(skill.name);
      setFormCategory(skill.category || 'Business');
      setFormDescription(skill.description);
      setFormInstructions(skill.instructions);
    } else {
      setEditingSkill(null);
      setFormScope('Project');
      setFormName('');
      setFormCategory(activeCategory === 'All' ? 'Business' : activeCategory);
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
        category: formCategory,
        description: formDescription,
        instructions: formInstructions,
        updatedAt: new Date().toLocaleString()
      } : s));
    } else {
      const newSkill: SkillEntry = {
        id: `skill-${Date.now()}`,
        name: formName,
        scope: formScope,
        category: formCategory,
        description: formDescription,
        instructions: formInstructions,
        isEnabled: true,
        updatedAt: new Date().toLocaleString(),
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
        <div className="flex items-center gap-8">
          <h2 className="text-lg font-bold text-slate-800">
            {lang === 'zh' ? '技能管理' : 'Skill Management'}
          </h2>
          
          <nav className="flex items-center gap-6">
            {[
              { id: 'All', zh: '全部', en: 'All' },
              { id: 'Business', zh: '业务', en: 'Business' },
              { id: 'General', zh: '通用', en: 'General' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`relative py-5 text-sm font-bold transition-all ${
                  activeCategory === cat.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {lang === 'zh' ? cat.zh : cat.en}
                {activeCategory === cat.id && (
                  <motion.div 
                    layoutId="activeCategory"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" 
                  />
                )}
              </button>
            ))}
          </nav>
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
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '分类' : 'Category'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '描述' : 'Description'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '创建人' : 'Created By'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '创建时间' : 'Created Time'}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{lang === 'zh' ? '操作' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSkills.map(skill => (
                    <tr 
                      key={skill.id} 
                      className="group hover:bg-slate-50/80 transition-all"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-slate-100 text-slate-500">
                            <i className="fas fa-toolbox"></i>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{skill.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-600 font-medium">
                          {skill.category === 'Business' ? (lang === 'zh' ? '业务' : 'Business') : (lang === 'zh' ? '通用' : 'General')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500 max-w-md truncate" title={skill.description}>
                          {skill.description}
                        </div>
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
                        <div className="flex items-center justify-end gap-4">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDrawer(skill);
                            }}
                            className="text-slate-400 hover:text-indigo-600 transition-colors"
                            title={lang === 'zh' ? '详情' : 'Details'}
                          >
                            <i className="fas fa-eye text-xs"></i>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadSkillZip(skill);
                            }}
                            className="text-slate-400 hover:text-emerald-600 transition-colors"
                            title={lang === 'zh' ? '下载' : 'Download'}
                          >
                            <i className="fas fa-download text-xs"></i>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(skill.id);
                            }}
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                            title={lang === 'zh' ? '删除' : 'Delete'}
                          >
                            <i className="fas fa-trash-alt text-xs"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Skill Icon and Header */}
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center text-xl border border-slate-200/50 shadow-sm">
                    <i className="fas fa-toolbox"></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{drawerSkill.name}</h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold">
                        {drawerSkill.category === 'Business' ? (lang === 'zh' ? '业务' : 'Business') : (lang === 'zh' ? '通用' : 'General')}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">ID: {drawerSkill.id}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    {lang === 'zh' ? '描述' : 'Description'}
                  </span>
                  <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200/50 rounded-xl px-4 py-2.5 leading-relaxed whitespace-pre-wrap">
                    {drawerSkill.description}
                  </div>
                </div>

                {/* Package Directory */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    {lang === 'zh' ? '压缩包目录' : 'Package Directory'}
                  </span>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-60 overflow-y-auto custom-scrollbar">
                    <div className="min-w-max">
                      {MOCK_SKILL_FILES.map((node, i) => (
                        <FileTreeNode key={i} node={node} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex gap-3">
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all"
                >
                  {lang === 'zh' ? '关闭' : 'Close'}
                </button>
                <button 
                  onClick={() => downloadSkillZip(drawerSkill)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-download text-xs"></i>
                  {lang === 'zh' ? '下载技能包' : 'Download Package'}
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
                  {lang === 'zh' ? '注册新技能' : 'Register Skill'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                {/* Upload Area / Dropzone */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      await processZipFile(file);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    parsingState === 'success' 
                      ? 'bg-emerald-50/40 border-emerald-300' 
                      : parsingState === 'error' 
                        ? 'bg-rose-50/40 border-rose-300' 
                        : 'bg-slate-50 hover:bg-indigo-50/40 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".zip,.skill"
                    className="hidden"
                  />
                  
                  {parsingState === 'parsing' ? (
                    <div className="flex flex-col items-center py-4">
                      <div className="w-10 h-10 border-4 border-indigo-500/25 border-t-indigo-600 rounded-full animate-spin mb-4" />
                      <div className="text-sm font-bold text-indigo-600 mb-1">{lang === 'zh' ? '正在智能解析压缩包...' : 'Parsing ZIP archive...'}</div>
                      <div className="text-[10px] text-slate-400">{uploadedFileName}</div>
                    </div>
                  ) : parsingState === 'success' ? (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mb-3 shadow-sm">
                        <i className="fas fa-check-circle"></i>
                      </div>
                      <div className="text-sm font-bold text-emerald-600 mb-1">{lang === 'zh' ? '技能包解析成功' : 'Parsing Successful'}</div>
                      <div className="text-[10px] text-slate-400 mb-2">{uploadedFileName}</div>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-100">
                        {lang === 'zh' ? '包含符合规范的 skill.md' : 'Valid skill.md found'}
                      </span>
                    </div>
                  ) : parsingState === 'error' ? (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl mb-3 shadow-sm">
                        <i className="fas fa-exclamation-circle"></i>
                      </div>
                      <div className="text-sm font-bold text-rose-600 mb-1">{lang === 'zh' ? '解析失败' : 'Parsing Failed'}</div>
                      <div className="text-[10px] text-slate-400 mb-2">{uploadedFileName}</div>
                      <div className="text-xs text-rose-500 font-medium max-w-md bg-white border border-rose-100 px-3 py-1.5 rounded-xl shadow-sm mb-4">
                        {parsingError}
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setParsingState('idle');
                        }}
                        className="text-[10px] text-indigo-600 font-bold hover:underline"
                      >
                        {lang === 'zh' ? '重新上传' : 'Try Again'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl mb-3 shadow-md">
                        <i className="fas fa-cloud-upload-alt"></i>
                      </div>
                      <div className="text-sm font-bold text-slate-600 mb-1">{lang === 'zh' ? '点击或拖拽上传技能 ZIP 压缩包' : 'Click or Drag & Drop Skill ZIP Archive'}</div>
                      <div className="text-[10px] text-slate-400 max-w-sm leading-relaxed mb-4">
                        {lang === 'zh' ? '系统将自动读取根目录下的 SKILL.md 或 skill.md 文件，并解析其中的技能名称与描述，验证其规范性。' : 'The system will automatically extract skill.md, validate format, and parse name & description.'}
                      </div>
                      <div className="text-[9px] text-indigo-500 font-bold bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100/50">
                        {lang === 'zh' ? '支持 .zip / .skill 格式' : 'Supports .zip / .skill formats'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Simulation controls for robust UI interactive validation */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <i className="fas fa-vial text-indigo-400"></i>
                    {lang === 'zh' ? '调试与极速测试通道 (快速模拟上传)' : 'Quick Simulation & Debug Channel'}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        simulateUpload('success');
                      }}
                      className="py-2 px-3 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <i className="fas fa-check-circle text-emerald-500"></i>
                      <span>{lang === 'zh' ? '模拟：解析成功' : 'Simulate: Success'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        simulateUpload('no-skill-md');
                      }}
                      className="py-2 px-3 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <i className="fas fa-times-circle text-rose-500"></i>
                      <span>{lang === 'zh' ? '模拟：缺失 skill.md' : 'Simulate: No skill.md'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        simulateUpload('missing-meta');
                      }}
                      className="py-2 px-3 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 hover:border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <i className="fas fa-exclamation-triangle text-amber-500"></i>
                      <span>{lang === 'zh' ? '模拟：缺少名称描述' : 'Simulate: Missing Meta'}</span>
                    </button>
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                    <span className="text-rose-500">*</span> {lang === 'zh' ? '所属分类' : 'Category'}
                  </label>
                  <div className="flex gap-4">
                    {[
                      { id: 'Business', zh: '业务', en: 'Business' },
                      { id: 'General', zh: '通用', en: 'General' },
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormCategory(cat.id)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          formCategory === cat.id 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {lang === 'zh' ? cat.zh : cat.en}
                      </button>
                    ))}
                  </div>
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
                  disabled={parsingState !== 'success' || !formName || !formDescription}
                  className="px-8 py-2 bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 disabled:shadow-none hover:bg-indigo-700 transition-all"
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
