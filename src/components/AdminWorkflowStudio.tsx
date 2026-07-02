import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, WorkflowEntry } from '../types';
import { 
  ArrowLeft, Save, Rocket, Plus, ChevronLeft, ChevronRight, 
  ArrowUp, ArrowDown, Copy, Trash2, AlertTriangle, Info, 
  CheckCircle, Zap, Code, FileText, Database, BookOpen, 
  Layers, Eye, X, Sparkles
} from 'lucide-react';

interface AdminWorkflowStudioProps {
  lang: Language;
  workflow: WorkflowEntry;
  onBack: () => void;
}

interface ChapterNode {
  id: string;
  name: string;
  code: string;
  level: number; // 0 for main chapter, 1 for sub-chapter
  type: 'auto' | 'semi-auto' | 'manual';
  example: string;
  prompt: string;
  outputStructure: string[]; // 'text' | 'chart' | 'table' | 'diagnose'
  mbuIds: string[]; // Linked MBU IDs
  primaryMbuId?: string; // Primary MBU for this chapter
  objectConfig?: {
    relationType: 'parent' | 'child' | 'sibling' | 'self';
    targetType: string;
    limitType: 'none' | 'distance' | 'similarity';
    rangeValue: number;
    rangeUnit: string;
  };
}

interface MbuDefinition {
  id: string;
  name: string;
  description: string;
  type: string;
  tags: string[];
  ipomsq: {
    i: string[]; // Input
    p: string[]; // Processing methods ('LLM' | 'Algorithm' | 'Software' | 'Charts')
    o: string[]; // Output
    m: string[]; // Method
    s: string[]; // Standard
    q: string[]; // Exception / Question Handling
  };
}

// Initial default chapters matching exact requirements
const INITIAL_CHAPTERS: ChapterNode[] = [
  {
    id: 'ch-1',
    name: '概述',
    code: '1',
    level: 0,
    type: 'auto',
    example: '【本井概述】本井为位于A区块的开发评价直井，主要目的层位为沙河街组。设计井深3500m，完钻井深3512m，钻遇泥岩、砂岩，其中油层显示厚度24m。本报告结合地质背景与邻井动态，提供压裂施工与产能估算方案。',
    prompt: '基于当前工作空间关联的油井基础元数据（如井位、井型、设计井深、目的层等），自动匹配数据源。提取地理位置、开发阶段、完钻层位等基本信息，撰写简练清晰的概述。要求合并各业务线最新汇总，字数控制在500字内，风格要求科学严谨。',
    outputStructure: ['text', 'table'],
    mbuIds: ['mbu-basic'],
    primaryMbuId: 'mbu-basic'
  },
  {
    id: 'ch-1-1',
    name: '项目背景',
    code: '1.1',
    level: 1,
    type: 'manual',
    example: '【项目背景】本项目旨在对沙河街组主力砂岩进行精细刻画，解决地层非均质性强、稳产难度大的矛盾，为下一步水平井部署奠定地质基础。',
    prompt: '阐述该项目立项的区域开发背景、前期探索结论及本次综合评价要解决的核心矛盾。',
    outputStructure: ['text'],
    mbuIds: ['mbu-basic'],
    primaryMbuId: 'mbu-basic'
  },
  {
    id: 'ch-1-2',
    name: '数据来源',
    code: '1.2',
    level: 1,
    type: 'auto',
    example: '【数据说明】本次研究采用A区块32口井的 LAS/DLIS 原始测井数据、450km² 三维 SEGY 地震反射流以及历史投产以来的日产油、日产液及动静压测试记录。',
    prompt: '盘点并结构化列举本项事务所加载的动静态数据源，包括测井资料、三维地震区块及油水井连续生产测定数据。',
    outputStructure: ['text', 'table'],
    mbuIds: ['mbu-basic', 'mbu-data-analysis'],
    primaryMbuId: 'mbu-basic'
  },
  {
    id: 'ch-2',
    name: '地质分析',
    code: '2',
    level: 0,
    type: 'semi-auto',
    example: '【地质分析】通过对目的层顶底反射界面的精细追踪与断层三维精细描述，研究表明目的层埋深3120-3180m，属于中低孔、低渗砂岩储层。三维断层精细描述模型显示断圈闭合良好，封堵性能极佳。测井曲线精细解释表明：平均孔隙度12.4%，平均含油饱和度58%。',
    prompt: '结合邻井储层相似度评分，分析当前地质构造框架与断层封闭性特征。请突出地化参数、岩心物性、及测井标准化解释曲线的综合反馈，针对储层脆性指数与地应力差异展开定量叙述。',
    outputStructure: ['text', 'chart'],
    mbuIds: ['mbu-seismic', 'mbu-logging'],
    primaryMbuId: 'mbu-seismic'
  },
  {
    id: 'ch-2-1',
    name: '构造特征',
    code: '2.1',
    level: 1,
    type: 'semi-auto',
    example: '【构造描述】研究区位于凹陷带中部，中断级断裂发育。精细地质解释表明地层倾角较平缓，局部存在微幅构造高点。',
    prompt: '基于三维地震构造解释成果，提炼并描述目的层段的构造形态、圈闭闭合度及微断层发育规律。',
    outputStructure: ['text'],
    mbuIds: ['mbu-seismic'],
    primaryMbuId: 'mbu-seismic'
  },
  {
    id: 'ch-2-2',
    name: '储层特征',
    code: '2.2',
    level: 1,
    type: 'auto',
    example: '【解释结论】对3150-3175m测井曲线进行标准化校正后，解释结果：有效厚度15.2m，孔隙度14.5%，饱和度55%。属于典型中孔、中渗碎屑岩储层。',
    prompt: '对标准校正后的测井曲线进行综合物性解释，输出厚度、孔隙度、饱和度等核心参数分布特征。',
    outputStructure: ['text', 'table'],
    mbuIds: ['mbu-logging'],
    primaryMbuId: 'mbu-logging'
  },
  {
    id: 'ch-3',
    name: '生产分析',
    code: '3',
    level: 0,
    type: 'auto',
    example: '【日产指标分析】本井自投产以来，初期日产液 42.5t，日产油 31.2t，含水率 26.5%。经历 180 天连续生产后，目前日产油降至 12.4t，综合含水率攀升至 54.2%。采用 Arps 递减法分析显示，双曲递减指数为 0.45，初始递减率为每年 32.1%。',
    prompt: '拉取投产以来的日产油量、日产水量、综合含水率、油压等连续测定曲线。采用 Arps 递减方法分析目前产液动态变化趋势，并计算阶段累产和预测 EUR。',
    outputStructure: ['text', 'chart', 'table'],
    mbuIds: ['mbu-dynamic', 'mbu-data-analysis'],
    primaryMbuId: 'mbu-dynamic'
  },
  {
    id: 'ch-3-1',
    name: '单井分析',
    code: '3.1',
    level: 1,
    type: 'semi-auto',
    example: '【精细井段分析】对3145m-3158m主要出油层段分析发现，该层段产液贡献率高达78%，但伴随含水率快速上升，说明可能存在局部水窜。而3162m-3170m次要层段出油贡献仅占12%，受地应力压制明显。',
    prompt: '针对单井层段内的产液剖面和吸水剖面，结合动静态参数，进行精细到小层级的生产表现排序，判断是否存在主力层动用不均、储层堵塞或提液空间。',
    outputStructure: ['text', 'chart', 'diagnose'],
    mbuIds: ['mbu-dynamic'],
    primaryMbuId: 'mbu-dynamic'
  },
  {
    id: 'ch-3-2',
    name: '区块分析',
    code: '3.2',
    level: 1,
    type: 'auto',
    example: '【区块分析结论】A区块共35口评价井，整体平均采收率28.5%，注采对标关系中，12口井处于注采平衡状态，18口井注水不足，5口井严重水淹。区块开发效果整体处于黄灯中等警告水平。',
    prompt: '结合本区块主力断块的水驱利用率和整体注采匹配雷达图，开展宏观区块开发动态多井联合分析，提炼高含水井及低效注水单元的空间分布规律。',
    outputStructure: ['text', 'chart'],
    mbuIds: ['mbu-evaluation'],
    primaryMbuId: 'mbu-evaluation'
  },
  {
    id: 'ch-4',
    name: '开发评价',
    code: '4',
    level: 0,
    type: 'auto',
    example: '【评价结论】依据SY/T 5367 水驱状况评价指标，该井目前处于中含水开发阶段，水驱利用率为58.3%（属于二级中等）。储层动用程度不均，井周存在部分剩余油未动用富集区，稳产评定为黄色预警。',
    prompt: '定量评估储层动用状况、注水利用率和阶段稳产能力，对照企业开发规范与行业标准，输出开发效果综合分级评定。',
    outputStructure: ['text', 'table', 'diagnose'],
    mbuIds: ['mbu-evaluation'],
    primaryMbuId: 'mbu-evaluation'
  },
  {
    id: 'ch-5',
    name: '结论建议',
    code: '5',
    level: 0,
    type: 'manual',
    example: '【实施对策】1. 针对泵阀漏失问题，建议近期进行洗井防垢作业，如无好转，计划于下周进行热洗或修井换泵。2. 针对沙河街组主力剩余油区，建议实施酸化提产，酸化方案设计酸量45方，排量3.5方/分。',
    prompt: '综合全篇地质背景、生产递减与问题诊断结论，提炼核心结论。为下步对策措施（如酸化、压裂、堵水、提液等）提供具体的工艺参数初设和实施建议。',
    outputStructure: ['text', 'diagnose'],
    mbuIds: ['mbu-anomaly', 'mbu-evaluation'],
    primaryMbuId: 'mbu-anomaly'
  }
];

// Rich MBU definitions with complete IPOMSQ
const MBU_DEFINITIONS: MbuDefinition[] = [
  {
    id: 'mbu-basic',
    name: '井基本信息 MBU',
    description: '自动对齐、校验并治理油水井完井、井身结构等源头元数据。',
    type: '基础元数据类',
    tags: ['完井校正', '层位匹配', '智能提取'],
    ipomsq: {
      i: ['钻井设计书', '完井报告', '井身结构图', '基础数据库表（井表）'],
      p: ['大模型分析', '算法模型'],
      o: ['井基本信息结构化数据', '目的层位跨度定义'],
      m: ['文本匹配规则', '正则实体抽取（NLP）'],
      s: ['SY/T 5061-2018 钻井完井报告规范'],
      q: ['数据库表缺失时自动退避到钻井设计书抽取']
    }
  },
  {
    id: 'mbu-dynamic',
    name: '单井动态分析 MBU',
    description: '单井产油产水分析与Arps递减拟合，支持阶段EUR预测。',
    type: '生产动态类',
    tags: ['Arps拟合', '阶段EUR预测', '递减规律建模'],
    ipomsq: {
      i: ['日产液/产油量/产水量连续数据', '动/静面深数据', '含水率曲线', '历史井史大事记'],
      p: ['大模型分析', '算法模型', '图表组件'],
      o: ['生产动态趋势图', 'Arps 递减参数集', '阶段产能预测值'],
      m: ['Arps 双曲递减法', '连续油压/产量相关性分析'],
      s: ['SY/T 6169-2020 油藏动态分析规范', '企业稳产分级规范'],
      q: ['生产数据有小范围缺失时自动采用局部线性插补']
    }
  },
  {
    id: 'mbu-data-analysis',
    name: '生产数据分析 MBU',
    description: '通过高频遥测日产及流速参数，实时评估异常工况及井筒积液临界流速。',
    type: '数据诊断类',
    tags: ['高频滤波', '积液流速核算', '异常因子筛选'],
    ipomsq: {
      i: ['实时日产气/产水数据', '管柱受力参数', '油嘴/节流器开度'],
      p: ['算法模型', '图表组件'],
      o: ['气液比变化趋势图', '井筒积液临界流速曲线', '异常工况特征表'],
      m: ['多元线性回归', '气井井筒积液临界流速Turner计算模型'],
      s: ['GB/T 22513-2023 石油天然气钻采设备规范'],
      q: ['传感器遥测信号发生噪声级突变时启动中值滤波降噪']
    }
  },
  {
    id: 'mbu-anomaly',
    name: '异常诊断 MBU',
    description: '示功图诊断、故障归因与温压反演故障深度核算。',
    type: '智能分析类',
    tags: ['示功图识别', '故障深度反演', '出水层识别'],
    ipomsq: {
      i: ['生产历史突变参数', '机抽示功图点阵数据', '电泵频率与运行电流'],
      p: ['大模型分析', '算法模型', '专业软件'],
      o: ['漏失/出水深度预测', '示功图诊断报告', '泵效故障归因与置信度'],
      m: ['示功图智能诊断卷积神经网络模型（CNN）', '温压联合故障反演算法'],
      s: ['企业机抽井诊断规范第3部分', '中国石油勘探采油故障分类标准'],
      q: ['输入信号严重断档时，回溯并对标上个完整测定周期']
    }
  },
  {
    id: 'mbu-seismic',
    name: '地震构造解释 MBU',
    description: '三维SEGY地震解释和层位断层空间关系精细提取。',
    type: '物探解释类',
    tags: ['断层精细刻画', '层位智能追踪', '曲率属性计算'],
    ipomsq: {
      i: ['SEGY 原始地震数据', '初始层位构造框架', '区域断层几何参数'],
      p: ['算法模型', '专业软件'],
      o: ['三维精细断层描述模型', '层位顶底面构造网格图'],
      m: ['三维深度学习层位智能追踪算法', '地层曲率计算属性分析'],
      s: ['SY/T 5314 地震资料解释技术规程'],
      q: ['强相干噪声区切换为地震剖面专家交互人工修正模式']
    }
  },
  {
    id: 'mbu-logging',
    name: '测井曲线处理 MBU',
    description: 'LAS/DLIS校准、环境校正以及孔隙度饱和度连续曲线拟合。',
    type: '测井评价类',
    tags: ['环境校正', '物性连续反演', '测井标准化'],
    ipomsq: {
      i: ['LAS/DLIS 原始测井数据', '井径/泥浆配比参数', '刻度矫正表'],
      p: ['算法模型', '专业软件'],
      o: ['环境校正后的标准化测井曲线', '孔隙度/饱和度连续解释剖面'],
      m: ['环境校正经典经验公式', '基于梯度提升树的物性连续预测模型'],
      s: ['SY/T 5132 测井原始资料质量控制规范'],
      q: ['遇卡深段或信号异常畸变处，标识为无效段并进行趋势重构']
    }
  },
  {
    id: 'mbu-evaluation',
    name: '生产评价 MBU',
    description: '区块采收率对标、水驱规律、注采对标关系评估。',
    type: '开发评价类',
    tags: ['采收率评估', '水驱利用率', '注采匹配'],
    ipomsq: {
      i: ['开发阶段累产数据', '区块地质动用储量', '注采对标样本库'],
      p: ['大模型分析', '算法模型'],
      o: ['注采匹配关系雷达图', '水驱特征评价指标', '开发效果综合分级结论'],
      m: ['水驱特征曲线计算法', '经典物质平衡分析法'],
      s: ['SY/T 5367 油田开发水驱状况评价指标'],
      q: ['地质静态储量误差过大时，启用蒙特卡洛多概率方案对标']
    }
  }
];

// Recalculates outline codes like 1, 1.1, 1.2, 2, 2.1 depending on list hierarchy
const recalculateCodes = (nodes: ChapterNode[]): ChapterNode[] => {
  let mainIndex = 0;
  let subIndex = 0;
  return nodes.map((node) => {
    if (node.level === 0) {
      mainIndex++;
      subIndex = 0;
      return { ...node, code: `${mainIndex}` };
    } else {
      subIndex++;
      return { ...node, code: `${mainIndex || 1}.${subIndex}` };
    }
  });
};

const getPTypeBadge = (method: string) => {
  if (method.includes('大模型') || method.toLowerCase().includes('llm')) {
    return { icon: '🤖', label: 'LLM', colorClass: 'bg-violet-50 border-violet-200 text-violet-700' };
  }
  if (method.includes('算法') || method.toLowerCase().includes('algorithm')) {
    return { icon: '📊', label: '算法模型', colorClass: 'bg-emerald-50 border-emerald-200 text-emerald-700' };
  }
  if (method.includes('软件') || method.toLowerCase().includes('software')) {
    return { icon: '🧪', label: '专业软件', colorClass: 'bg-purple-50 border-purple-200 text-purple-700' };
  }
  if (method.includes('图表') || method.toLowerCase().includes('chart') || method.includes('组件')) {
    return { icon: '📈', label: '图表组件', colorClass: 'bg-blue-50 border-blue-200 text-blue-700' };
  }
  return { icon: '⚙', label: '工作流', colorClass: 'bg-amber-50 border-amber-200 text-amber-700' };
};

export const AdminWorkflowStudio: React.FC<AdminWorkflowStudioProps> = ({ lang, workflow, onBack }) => {
  // --- States ---
  const [templateName, setTemplateName] = useState(workflow.name);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // Chapters & Selection
  const [chapters, setChapters] = useState<ChapterNode[]>(recalculateCodes(INITIAL_CHAPTERS));
  const [activeChapterId, setActiveChapterId] = useState<string>(INITIAL_CHAPTERS[0].id);

  // MBU & IPOMSQ Definitions and Edits
  const [mbus, setMbus] = useState<MbuDefinition[]>(MBU_DEFINITIONS);
  const [expandedMbuId, setExpandedMbuId] = useState<string | null>('mbu-basic');

  // Toast / Messages
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Selected Chapter Node
  const selectedChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];

  const triggerToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Chapter Operations ---
  const handleSelectChapter = (id: string) => {
    setActiveChapterId(id);
    const chap = chapters.find(c => c.id === id);
    if (chap && chap.primaryMbuId) {
      setExpandedMbuId(chap.primaryMbuId);
    } else if (chap && chap.mbuIds.length > 0) {
      setExpandedMbuId(chap.mbuIds[0]);
    }
  };

  const handleUpdateChapter = <K extends keyof ChapterNode>(id: string, key: K, value: ChapterNode[K]) => {
    setChapters(prev => prev.map(ch => ch.id === id ? { ...ch, [key]: value } : ch));
  };

  const handleAddChapter = (parentId?: string) => {
    const newId = `ch-${Date.now()}`;
    const parent = parentId ? chapters.find(c => c.id === parentId) : null;
    
    const newChap: ChapterNode = {
      id: newId,
      name: parentId ? '新大纲子章节' : '新大纲主章节',
      code: '', // Calculated on fly
      level: parentId ? 1 : 0,
      type: 'semi-auto',
      example: '【示例内容】请在此输入章节的标准格式与样例...',
      prompt: '【撰写指令】输入针对此章节的智能体大语言模型Prompt指令模板...',
      outputStructure: ['text'],
      mbuIds: parent ? [...parent.mbuIds] : ['mbu-basic'],
      primaryMbuId: parent ? parent.primaryMbuId : 'mbu-basic'
    };

    let newChapters = [...chapters];
    if (parent) {
      const pIndex = chapters.findIndex(c => c.id === parentId);
      let insertIndex = pIndex;
      for (let i = pIndex + 1; i < chapters.length; i++) {
        if (chapters[i].level > parent.level) {
          insertIndex = i;
        } else {
          break;
        }
      }
      newChapters.splice(insertIndex + 1, 0, newChap);
    } else {
      newChapters.push(newChap);
    }

    const updated = recalculateCodes(newChapters);
    setChapters(updated);
    setActiveChapterId(newId);
    if (newChap.primaryMbuId) {
      setExpandedMbuId(newChap.primaryMbuId);
    }
    triggerToast('大纲章节创建成功');
  };

  const handleDeleteChapter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (chapters.length <= 1) {
      triggerToast('至少保留一个章节节点', 'error');
      return;
    }
    const filtered = chapters.filter(c => c.id !== id);
    const updated = recalculateCodes(filtered);
    setChapters(updated);
    if (activeChapterId === id) {
      setActiveChapterId(updated[0].id);
    }
    triggerToast('章节删除成功', 'info');
  };

  const handleCopyChapter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const source = chapters.find(c => c.id === id);
    if (!source) return;
    const newId = `ch-${Date.now()}`;
    const newChap: ChapterNode = {
      ...source,
      id: newId,
      name: `${source.name} (副本)`,
      code: ''
    };
    const index = chapters.findIndex(c => c.id === id);
    const newChapters = [...chapters];
    newChapters.splice(index + 1, 0, newChap);
    const updated = recalculateCodes(newChapters);
    setChapters(updated);
    setActiveChapterId(newId);
    triggerToast('章节复制成功');
  };

  const handleMoveChapter = (id: string, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const index = chapters.findIndex(c => c.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === chapters.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newChapters = [...chapters];
    const temp = newChapters[index];
    newChapters[index] = newChapters[targetIndex];
    newChapters[targetIndex] = temp;

    const updated = recalculateCodes(newChapters);
    setChapters(updated);
    triggerToast('章节顺序已调整');
  };

  const handleAdjustLevel = (id: string, direction: 'promote' | 'demote', e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLevel = direction === 'promote' ? 0 : 1;
    setChapters(prev => {
      const updated = prev.map(ch => ch.id === id ? { ...ch, level: nextLevel } : ch);
      return recalculateCodes(updated);
    });
    triggerToast(direction === 'promote' ? '已升级为主章节' : '已降级为子章节');
  };

  // --- MBU operations for chapter ---
  const handleToggleMbuInChapter = (mbuId: string) => {
    const isLinked = selectedChapter.mbuIds.includes(mbuId);
    let updatedMbuIds = [...selectedChapter.mbuIds];
    let primary = selectedChapter.primaryMbuId;

    if (isLinked) {
      updatedMbuIds = updatedMbuIds.filter(id => id !== mbuId);
      if (primary === mbuId) {
        primary = updatedMbuIds[0] || undefined;
      }
    } else {
      updatedMbuIds.push(mbuId);
      if (!primary) {
        primary = mbuId;
      }
    }

    handleUpdateChapter(selectedChapter.id, 'mbuIds', updatedMbuIds);
    handleUpdateChapter(selectedChapter.id, 'primaryMbuId', primary);
  };

  const handleSetPrimaryMbu = (mbuId: string) => {
    handleUpdateChapter(selectedChapter.id, 'primaryMbuId', mbuId);
    triggerToast(`已设置主驱MBU: ${mbus.find(m => m.id === mbuId)?.name}`);
  };

  // --- Toggle outputs ---
  const handleToggleOutputStructure = (structureId: string) => {
    const current = [...selectedChapter.outputStructure];
    const idx = current.indexOf(structureId);
    if (idx !== -1) {
      current.splice(idx, 1);
    } else {
      current.push(structureId);
    }
    handleUpdateChapter(selectedChapter.id, 'outputStructure', current);
  };

  // --- Insert variable into Prompt ---
  const insertVariable = (variable: string) => {
    const currentPrompt = selectedChapter.prompt || '';
    handleUpdateChapter(selectedChapter.id, 'prompt', currentPrompt + ' ' + variable);
    triggerToast(`已插入变量: ${variable}`);
  };

  // --- Status and Alerts for Active Chapter ---
  const getChapterStatus = (ch: ChapterNode) => {
    if (ch.mbuIds.length === 0) {
      return {
        label: '● 未绑定MBU',
        colorClass: 'text-rose-500 bg-rose-50 border-rose-100',
        dotColor: 'bg-rose-500'
      };
    }
    if (ch.mbuIds.length > 0 && ch.prompt && ch.prompt.trim() !== '' && ch.example && ch.example.trim() !== '') {
      return {
        label: '● 已配置完成',
        colorClass: 'text-blue-600 bg-blue-50 border-blue-100',
        dotColor: 'bg-blue-600'
      };
    }
    return {
      label: '✔ 已绑定MBU',
      colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      dotColor: 'bg-emerald-500'
    };
  };

  const getChapterStatusHint = (ch: ChapterNode) => {
    if (ch.mbuIds.length === 0) {
      return {
        text: '未绑定MBU：本章节尚未关联业务分析小段，请在右侧选择并绑定主驱动MBU。',
        colorClass: 'bg-rose-50 border-rose-200 text-rose-800',
        icon: <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
      };
    }
    if (!ch.prompt || ch.prompt.trim() === '') {
      return {
        text: 'Prompt生成指令未配置：大模型智能撰写指引为空，建议在下方配置核心 Prompt 规则。',
        colorClass: 'bg-amber-50 border-amber-200 text-amber-800',
        icon: <Info className="w-4 h-4 text-amber-500 shrink-0" />
      };
    }
    return {
      text: 'IPOMSQ关联已就绪：大纲数据及算法方法配置完整。主驱动MBU已注入智能体。',
      colorClass: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
    };
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 text-slate-800 overflow-hidden relative">
      
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] shadow-xl px-5 py-3 rounded-xl flex items-center gap-2.5 text-xs font-bold border bg-white border-slate-150"
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER AREA (Header - Extremely Minimal) */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex-shrink-0 z-30 shadow-sm flex items-center justify-between">
        
        {/* Left: Back button + Template name + Status toggle */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <button 
            onClick={onBack}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all cursor-pointer shrink-0"
            title="返回流程模板"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-4 w-full">
            <div className="flex flex-col min-w-[200px] flex-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                模板名称
              </label>
              <input 
                type="text" 
                value={templateName} 
                onChange={(e) => setTemplateName(e.target.value)}
                className="font-black text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none w-full text-sm py-0.5"
                placeholder="请输入模板名称"
              />
            </div>
            
            {/* Status switcher */}
            <div className="flex flex-col shrink-0">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                模板状态
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setStatus('draft')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    status === 'draft'
                      ? 'bg-white text-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  草稿
                </button>
                <button
                  onClick={() => setStatus('published')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    status === 'published'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  已发布
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => triggerToast('报告生成模板草稿已成功保存')}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>保存</span>
          </button>
          
          <div className="w-px h-6 bg-slate-200 mx-1.5" />
          
          <button 
            onClick={onBack}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-250 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            取消
          </button>
        </div>
      </header>

      {/* THREE-PANEL CORE CONTAINER */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* ========================================================= */}
        {/* LEFT PANEL: Multi-level Chapter Outline Tree */}
        {/* ========================================================= */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              结构编辑区大纲树 ({chapters.length})
            </span>
            <button 
              onClick={() => handleAddChapter()}
              className="w-5 h-5 rounded bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all cursor-pointer shadow"
              title="添加大纲主章节"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 px-1.5 space-y-0.5 custom-scrollbar bg-white">
            {chapters.map((ch, idx) => {
              const isActive = ch.id === activeChapterId;
              const indentLevel = ch.level || 0;

              return (
                <div 
                  key={ch.id}
                  onClick={() => handleSelectChapter(ch.id)}
                  style={{ paddingLeft: `${indentLevel * 18 + 12}px` }}
                  className={`group relative py-2 pr-4 transition-all text-left cursor-pointer border-l-2 select-none flex items-center justify-between ${
                    isActive 
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold' 
                      : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Index numbering (Word Style) */}
                    <span className={`font-mono text-xs shrink-0 ${
                      isActive ? 'text-indigo-600 font-bold' : 'text-slate-400 font-medium'
                    }`}>
                      {ch.code}
                    </span>

                    {/* Chapter Name */}
                    <span className={`text-xs truncate ${
                      indentLevel === 0 
                        ? 'font-semibold text-slate-800' 
                        : 'font-normal text-slate-600'
                    } ${isActive ? '!text-indigo-700 font-bold' : ''}`}>
                      {ch.name}
                    </span>
                  </div>

                  {/* Hover Actions Bar */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden transition-all gap-px py-0.5 px-1 z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAddChapter(ch.id); }}
                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-indigo-600"
                      title="添加子章节"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* Level promo/demote adjust buttons */}
                    {indentLevel > 0 ? (
                      <button 
                        onClick={(e) => handleAdjustLevel(ch.id, 'promote', e)}
                        className="p-1 hover:bg-slate-100 text-slate-400 hover:text-indigo-600"
                        title="升级为主章节"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => handleAdjustLevel(ch.id, 'demote', e)}
                        className="p-1 hover:bg-slate-100 text-slate-400 hover:text-indigo-600"
                        title="降级为子章节"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button 
                      onClick={(e) => handleMoveChapter(ch.id, 'up', e)}
                      disabled={idx === 0}
                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-35 disabled:hover:bg-transparent"
                      title="上移排序"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => handleMoveChapter(ch.id, 'down', e)}
                      disabled={idx === chapters.length - 1}
                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-35 disabled:hover:bg-transparent"
                      title="下移排序"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => handleCopyChapter(ch.id, e)}
                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-indigo-600"
                      title="复制章节"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteChapter(ch.id, e)}
                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-rose-600"
                      title="删除章节"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed shrink-0">
            <div className="font-bold text-slate-500 mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              节点说明
            </div>
            点击任意大纲章节以配置其专属Prompt指令及绑定的MBU最小业务节点。
          </div>
        </aside>

        {/* ========================================================= */}
        {/* MIDDLE PANEL: Chapter Logical Editor (章节逻辑编辑区) */}
        {/* ========================================================= */}
        <main className="flex-1 bg-slate-50 overflow-y-auto p-5 custom-scrollbar flex flex-col gap-5 border-r border-slate-200">
          
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    章节逻辑配置
                  </h2>
                  <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded text-[11px]">章节 {selectedChapter.code}</span>
                  </div>
                </div>
              </div>
              
              {/* Chapter Type Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">章节生成类型:</span>
                <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex gap-0.5">
                  {(['auto', 'semi-auto', 'manual'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => handleUpdateChapter(selectedChapter.id, 'type', type)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        selectedChapter.type === type
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {type === 'auto' ? '自动生成' : type === 'semi-auto' ? '半自动生成' : '人工编写'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chapter Name Input */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                章节名称
              </label>
              <input 
                type="text"
                value={selectedChapter.name}
                onChange={(e) => handleUpdateChapter(selectedChapter.id, 'name', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                placeholder="请输入章节标题"
              />
            </div>

            {/* Analysis Object Selector (基于当前模板对象类型) */}
            <div className="space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-indigo-500 rounded-sm" />
                  分析对象配置 (当前基准对象：油水井)
                </label>
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  动态数据锚定
                </span>
              </div>

              {/* Relationship Selector */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { key: 'self', label: '本级对象 (Self)', desc: '当前分析主井（如：本井）' },
                  { key: 'parent', label: '父级对象 (Parent)', desc: '隶属的高级单元（如：区块/油藏）' },
                  { key: 'sibling', label: '兄弟级对象 (Sibling)', desc: '同级对照单元（如：邻近参考井）' },
                  { key: 'child', label: '子级对象 (Child)', desc: '细分物理层段（如：生产层段/小层）' }
                ].map(rel => {
                  const currentRel = selectedChapter.objectConfig?.relationType || 'self';
                  const isActive = currentRel === rel.key;
                  return (
                    <button
                      key={rel.key}
                      onClick={() => {
                        const prevConfig = selectedChapter.objectConfig || {
                          relationType: 'self',
                          targetType: '本井',
                          limitType: 'none',
                          rangeValue: 3000,
                          rangeUnit: 'm'
                        };
                        handleUpdateChapter(selectedChapter.id, 'objectConfig', {
                          ...prevConfig,
                          relationType: rel.key as any,
                          targetType: rel.key === 'self' ? '本井' : rel.key === 'parent' ? '所属区块' : rel.key === 'sibling' ? '邻近参考井' : '开发小层'
                        });
                      }}
                      className={`flex flex-col p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        isActive 
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm ring-1 ring-indigo-500/10' 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="text-xs font-bold block">{rel.label}</span>
                      <span className="text-[8.5px] text-slate-400 mt-1 leading-normal">{rel.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Range limit / Constraints selector */}
              <div className="pt-2.5 border-t border-slate-150 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Range Type */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 block">范围限制：</span>
                  <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
                    {[
                      { key: 'none', label: '不限范围' },
                      { key: 'distance', label: '距离限制' },
                      { key: 'similarity', label: '相似度限制' }
                    ].map(lim => {
                      const currentLimit = selectedChapter.objectConfig?.limitType || 'none';
                      const isActive = currentLimit === lim.key;
                      return (
                        <button
                          key={lim.key}
                          onClick={() => {
                            const prevConfig = selectedChapter.objectConfig || {
                              relationType: 'self',
                              targetType: '本井',
                              limitType: 'none',
                              rangeValue: 3000,
                              rangeUnit: 'm'
                            };
                            handleUpdateChapter(selectedChapter.id, 'objectConfig', {
                              ...prevConfig,
                              limitType: lim.key as any,
                              rangeValue: lim.key === 'similarity' ? 85 : 3000,
                              rangeUnit: lim.key === 'similarity' ? '%' : 'm'
                            });
                          }}
                          className={`flex-1 py-1 rounded text-[10px] font-bold transition-all cursor-pointer text-center ${
                            isActive 
                              ? 'bg-slate-900 text-white shadow-sm' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {lim.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Range Value Slider / Input */}
                {selectedChapter.objectConfig?.limitType && selectedChapter.objectConfig.limitType !== 'none' ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500">
                        {selectedChapter.objectConfig.limitType === 'distance' ? '最大分析距离限制' : '最小物性相似度要求'}：
                      </span>
                      <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.2 rounded">
                        {selectedChapter.objectConfig.rangeValue} {selectedChapter.objectConfig.rangeUnit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="range"
                        min={selectedChapter.objectConfig.limitType === 'distance' ? 100 : 50}
                        max={selectedChapter.objectConfig.limitType === 'distance' ? 10000 : 100}
                        step={selectedChapter.objectConfig.limitType === 'distance' ? 100 : 1}
                        value={selectedChapter.objectConfig.rangeValue}
                        onChange={(e) => {
                          const prevConfig = selectedChapter.objectConfig!;
                          handleUpdateChapter(selectedChapter.id, 'objectConfig', {
                            ...prevConfig,
                            rangeValue: parseInt(e.target.value)
                          });
                        }}
                        className="flex-1 accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-[10px] text-slate-400 font-medium pl-1 self-center pt-4">
                    💡 未开启范围限制，将默认计算并提取该关系下的所有目标节点数据
                  </div>
                )}
              </div>
            </div>

            {/* Example content Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  示例内容 & 标准结构参考
                </label>
                <span className="text-[9.5px] text-slate-400 font-medium">用于约束输出风格</span>
              </div>
              <textarea 
                value={selectedChapter.example}
                onChange={(e) => handleUpdateChapter(selectedChapter.id, 'example', e.target.value)}
                className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 leading-relaxed focus:outline-none focus:border-indigo-500 transition-all resize-none shadow-inner"
                placeholder="请输入章节撰写示例，作为少样本约束..."
              />
            </div>

            {/* Generation Prompt */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-500" />
                  章节生成指令
                </label>
                <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-bold border border-indigo-100">
                  系统内置生成指令
                </span>
              </div>
              <textarea 
                value={selectedChapter.prompt}
                onChange={(e) => handleUpdateChapter(selectedChapter.id, 'prompt', e.target.value)}
                className="w-full h-32 bg-slate-900 text-indigo-100 border border-slate-850 rounded-xl p-3.5 text-xs font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none font-mono shadow-inner"
                placeholder="请输入大模型(LLM)在此章节的写作引导和推理规范..."
              />
            </div>
          </div>
        </main>

        {/* ========================================================= */}
        {/* RIGHT PANEL: MBU + IPOMSQ Read-only Explanatory Panel */}
        {/* ========================================================= */}
        <aside className="w-[360px] bg-white border-l border-slate-200 flex flex-col flex-shrink-0">
          
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex-shrink-0 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              最小业务节点透明计算层
            </span>
            
            {/* Quick MBU bind selector */}
            <select 
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  handleToggleMbuInChapter(val);
                  e.target.value = '';
                }
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg text-[10px] px-2 py-1 font-bold text-slate-600 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">+ 绑定 MBU 节点...</option>
              {mbus.filter(m => !selectedChapter.mbuIds.includes(m.id)).map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            
            {/* 1. MBU Display section */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                当前章节关联最小业务节点 ({selectedChapter.mbuIds.length})
              </label>

              {selectedChapter.mbuIds.length === 0 ? (
                <div className="text-[10px] text-slate-400 italic text-center p-5 bg-rose-50/30 rounded-xl border border-dashed border-rose-150">
                  ⚠️ 尚未绑定任何最小业务节点。大模型无法取得数据支撑，请点击上方绑定。
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedChapter.mbuIds.map(mbuId => {
                    const mDef = mbus.find(m => m.id === mbuId);
                    if (!mDef) return null;
                    const isPrimary = selectedChapter.primaryMbuId === mbuId;

                    return (
                      <div 
                        key={mbuId} 
                        onClick={() => setExpandedMbuId(expandedMbuId === mbuId ? null : mbuId)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          expandedMbuId === mbuId 
                            ? 'border-indigo-300 bg-indigo-50/20 shadow-sm' 
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <ChevronRight className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                              expandedMbuId === mbuId ? 'rotate-90 text-indigo-500' : ''
                            }`} />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-800 block truncate">{mDef.name}</span>
                            </div>
                          </div>
                          
                          {/* Unbind only */}
                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggleMbuInChapter(mbuId)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="解除绑定"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 mt-2 pl-5 leading-relaxed">
                          {mDef.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Read-only IPOMSQ Explanatory Area */}
            {expandedMbuId && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                {(() => {
                  const mDef = mbus.find(m => m.id === expandedMbuId);
                  if (!mDef) return null;

                  return (
                    <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-250 pb-2">
                        <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-sm">
                          <Database className="w-3.5 h-3.5 text-indigo-500" />
                          核心最小业务节点资产 (只读)
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">ID: {mDef.id}</span>
                      </div>

                      {/* --- I: Input --- */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-500 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-[10px] font-black flex items-center justify-center text-slate-600">I</span>
                          I：输入数据
                        </div>
                        <div className="pl-5.5 space-y-1">
                          {mDef.ipomsq.i.map((item, idx) => (
                            <div key={idx} className="text-[10px] text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200/80 flex items-center gap-1.5 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                              <span className="truncate">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* --- P: Processing --- */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-500 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-[10px] font-black flex items-center justify-center text-slate-600">P</span>
                          P：处理方式
                        </div>
                        <div className="pl-5.5 flex flex-wrap gap-1.5">
                          {mDef.ipomsq.p.slice(0, 1).map((method, idx) => {
                            const b = getPTypeBadge(method);
                            return (
                              <span key={idx} className={`text-[10px] px-2 py-0.5 rounded-md border font-bold flex items-center gap-1.5 ${b.colorClass} shadow-sm`}>
                                <span>{b.icon}</span>
                                <span>{method}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* --- O: Output --- */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-500 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-[10px] font-black flex items-center justify-center text-slate-600">O</span>
                          O：输出结果
                        </div>
                        <div className="pl-5.5 space-y-1">
                          {mDef.ipomsq.o.slice(0, 1).map((item, idx) => (
                            <div key={idx} className="text-[10px] text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200/80 flex items-center gap-1.5 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                              <span className="truncate">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* --- M: Method --- */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-500 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-[10px] font-black flex items-center justify-center text-slate-600">M</span>
                          M：分析方法
                        </div>
                        <div className="pl-5.5 space-y-1">
                          {mDef.ipomsq.m.map((item, idx) => (
                            <div key={idx} className="text-[10px] text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200/80 flex items-center gap-1.5 font-mono font-bold">
                              ⚙️ <span className="truncate">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* --- S: Standard --- */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-500 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-[10px] font-black flex items-center justify-center text-slate-600">S</span>
                          S：相关标准规范
                        </div>
                        <div className="pl-5.5 space-y-1">
                          {mDef.ipomsq.s.map((item, idx) => (
                            <div key={idx} className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-150 flex items-center gap-1.5 font-bold">
                              📑 <span className="truncate">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* --- Q: Quality/Exception --- */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-500 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-[10px] font-black flex items-center justify-center text-slate-600">Q</span>
                          Q：异常防御与质量保障
                        </div>
                        <div className="pl-5.5 space-y-1">
                          {mDef.ipomsq.q.map((item, idx) => (
                            <div key={idx} className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-150 flex items-center gap-1.5 font-semibold">
                              ⚠️ <span className="truncate leading-tight">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
