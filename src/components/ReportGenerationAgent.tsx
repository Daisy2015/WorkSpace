import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Utility helpers for default sample and instruction content
const getDefaultSampleContent = (nodeId: string, nodeTitle: string, objectName: string, lang: 'zh' | 'en'): string => {
  if (lang === 'zh') {
    if (nodeTitle.includes('前言') || nodeTitle.includes('概况') || nodeId === '1') {
      return `针对 ${objectName} 开展了系统、全面的地质与工程综合评价。${objectName} 主要目的层为低渗、超低渗致密砂岩，储层非均质性极强。本报告将主要围绕地质构造、精细储层和开发动态展开多维解剖。`;
    }
    if (nodeTitle.includes('地质') || nodeTitle.includes('储层') || nodeId === '2') {
      return `目的层主要发育三角洲前缘砂体。根据测井与岩心物理分析，平均孔隙度在 11.2% - 13.5% 之间，平均空气渗透率 0.85 - 1.5 mD。微观孔隙结构以小孔-细喉为主，喉道半径中位数为 0.12 μm，含水饱和度平均 58.6%。`;
    }
    if (nodeTitle.includes('产量') || nodeTitle.includes('递减') || nodeId === '3') {
      return `该井投产首月原油日产达 15.6 吨，含水率 5%。连续开采 6 个月后进入典型稳定递减阶段。拟合 Arps 递减曲线显示，初期递减常数为 0.45，双曲递减指数 n 为 0.32。预计未来三年内递减将逐渐平缓，累积产油量预测可达 1.85 万吨。`;
    }
    if (nodeTitle.includes('结论') || nodeTitle.includes('建议') || nodeId === '4') {
      return `1. ${objectName} 储层主体物性较差，但局部发育裂缝性高产微相，具有一定的加密和提产潜力。\n2. 建议对该井后续实施大排量分段缝网压裂，改造体积预测应大于 1.5 万立方米以提高单井动用率。`;
    }
    return `这里是 ${nodeTitle} 章节的高质量编写范本。AI将严格参考此处的结构排版、句式长短和地质学术语风格进行报告生成。`;
  } else {
    if (nodeTitle.includes('Preface') || nodeTitle.includes('Overview') || nodeId === '1') {
      return `This report presents a comprehensive geological and engineering evaluation for ${objectName}. Drilled in 2025, ${objectName} targeted tight sandstone layers. This assessment covers structure, reservoir quality, and dynamic evaluation.`;
    }
    return `This is the high-quality writing sample template for ${nodeTitle}. The AI agent will follow this layout, tone, and formatting strictly during generation.`;
  }
};

const getDefaultInstructionContent = (nodeId: string, nodeTitle: string, lang: 'zh' | 'en'): string => {
  if (lang === 'zh') {
    if (nodeTitle.includes('前言') || nodeTitle.includes('概况') || nodeId === '1') {
      return `1. 概括基本井史，字数在400-500字左右。\n2. 重点突出钻探目的、基本位置坐标以及简化的完井数据。`;
    }
    if (nodeTitle.includes('地质') || nodeTitle.includes('储层') || nodeId === '2') {
      return `1. 采用专业学术风格，详细论述孔隙度、渗透率、喉道结构及饱和度等核心参数。\n2. 需插入储层物性级别评价对比标准，并得出准确结论。`;
    }
    if (nodeTitle.includes('产量') || nodeTitle.includes('递减') || nodeId === '3') {
      return `1. 结合生产数据进行Arps双曲递减曲线拟合分析，给出具体递减常数和油量预测。\n2. 用工程和经济视角对合理产量界限进行计算和推演。`;
    }
    if (nodeTitle.includes('结论') || nodeTitle.includes('建议') || nodeId === '4') {
      return `1. 分条理列出主要地质和工程评价结论。\n2. 明确给出具体的增产、防砂或压裂开采建议，要有具体的可操性参数指导。`;
    }
    return `请为 ${nodeTitle} 章节撰写详细的AI提示语：例如要求输出风格（精简/详细）、需要引用的专业参数指标、必须讨论的核心工程问题等。`;
  } else {
    if (nodeTitle.includes('Preface') || nodeTitle.includes('Overview') || nodeId === '1') {
      return `1. Outline basic drilling parameters and objectives.\n2. Keep length around 300 words with formal engineering style.`;
    }
    return `Provide prompt guidelines for AI report drafting for ${nodeTitle}. Specify terminology to include and sections to elaborate.`;
  }
};

interface ReportGenerationAgentProps {
  lang: 'zh' | 'en';
  config: any;
  onCloseAgent: () => void;
  onComplete?: () => void;
  onActiveChapterChange?: (chapterId: string, chapterTitle: string) => void;
  onSaveOutcome?: (name?: string) => void;
}

type ChapterStatus = 'completed' | 'running' | 'pending' | 'warning';

interface ChapterNode {
  id: string;
  title: string;
  level: 1 | 2;
  status: ChapterStatus;
  content: string;
  fullContentText: string;
  warning?: {
    reason: string;
    suggestion: string;
  };
}

export const ReportGenerationAgent: React.FC<ReportGenerationAgentProps> = ({ 
  lang, 
  config,
  onCloseAgent,
  onComplete,
  onActiveChapterChange,
  onSaveOutcome
}) => {
  const [currentPhase, setCurrentPhase] = useState<'confirm_outline' | 'writing'>(
    config?.isWeeklyBrief ? 'writing' : (config?.outlineConfirmRequired ? 'confirm_outline' : 'writing')
  );

  const [isSaved, setIsSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSaveReport = () => {
    const reportTitleName = config?.isWeeklyBrief 
      ? (lang === 'zh' ? '本周生产运行简报_20240416' : 'Weekly_Production_Operation_Brief_20240416')
      : `${objectName}${lang === 'zh' ? ' 钻井地质设计报告' : ' Drilling Geology Design'}`;
    
    if (onSaveOutcome) {
      onSaveOutcome(reportTitleName);
    }
    setIsSaved(true);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const [outlineNodes, setOutlineNodes] = useState<any[]>(config?.outline || []);
  const [activeConfigChapterId, setActiveConfigChapterId] = useState<string>('1');
  const [expandedMBUId, setExpandedMBUId] = useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [isAddMbuOpen, setIsAddMbuOpen] = useState(false);

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isFollowMode, setIsFollowMode] = useState(true);
  const [chapters, setChapters] = useState<ChapterNode[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [highlightedChapterId, setHighlightedChapterId] = useState<string | null>(null);
  const [hoveredChapterId, setHoveredChapterId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectionPopup, setSelectionPopup] = useState<{ x: number, y: number, text: string } | null>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);
  const lastNotifiedChapterId = useRef<string | null>(null);

  const getMbuDefinitions = (l: 'zh' | 'en') => [
    { id: 'MBU-01', name: l === 'zh' ? '地层资料' : 'Stratigraphic Data' },
    { id: 'MBU-02', name: l === 'zh' ? '构造资料' : 'Structural Data' },
    { id: 'MBU-03', name: l === 'zh' ? '储层资料' : 'Reservoir Data' }
  ];

  const getResourceDatabase = (l: 'zh' | 'en'): Record<string, any> => ({
    '地震解释资料': {
      name: l === 'zh' ? 'XX区块三维地震解释成果' : 'XX Block 3D Seismic Interpretation',
      type: l === 'zh' ? '地震成果' : 'Seismic Outcome',
      time: '2025-03-15',
      objects: l === 'zh' ? 'XX区块、长6层' : 'XX Block, Chang 6',
      summary: l === 'zh' ? '包含主要断层解释、层位构造图和目标层预测结果。' : 'Includes major fault interpretation, horizon maps and target layer predictions.'
    },
    '邻井测井曲线': {
      name: l === 'zh' ? '长庆XX-2井测井原始曲线' : 'Changqing XX-2 Original Logs',
      type: l === 'zh' ? '测井资料' : 'Well Log',
      time: '2024-11-20',
      objects: 'XX-2井',
      summary: l === 'zh' ? 'XX-2井全井段常规测井曲线。' : 'Standard logs for the entire well XX-2.'
    },
    '地层划分流程': {
      name: l === 'zh' ? '自动分层比对算法流' : 'Automated Layering Workflow',
      type: l === 'zh' ? '处理流程' : 'Process Workflow',
      time: '2025-01-10',
      objects: l === 'zh' ? '全区块' : 'All blocks',
      summary: l === 'zh' ? '基于深度学习的测井曲线地层分界点自动识别算法流程。' : 'Deep learning based boundary identification workflow.'
    },
    '地层分层结果': {
      name: l === 'zh' ? '地层分层精细结果表' : 'Fine Stratigraphy Result Table',
      type: l === 'zh' ? '分层数据' : 'Stratigraphy Data',
      time: '2025-06-25',
      objects: l === 'zh' ? 'XX-1井' : 'Well XX-1',
      summary: l === 'zh' ? '经过专家校对的最终地层对比划分深度表。' : 'Expert-verified stratigraphic division depths.'
    },
    '专家审核记录': {
      name: l === 'zh' ? '一键分层成果专家会签' : 'Expert Co-signature Report',
      type: l === 'zh' ? '管理记录' : 'Management Record',
      time: '2025-06-28',
      objects: l === 'zh' ? '项目专家组' : 'Expert Panel',
      summary: l === 'zh' ? '专家组对地层对比和预测深度成果的审核签署意见。' : 'Sign-off and approval on stratigraphy by expert panel.'
    },
    '地层划分规范': {
      name: l === 'zh' ? '陆相碎屑岩地层划分国家标准' : 'Continental Siliciclastic Stratigraphy Standard',
      type: l === 'zh' ? '标准规范' : 'Standard Norm',
      time: '2020-12-01',
      objects: l === 'zh' ? '国家能源局' : 'National Energy Board',
      summary: l === 'zh' ? '标准号GB/T-31024。规定了陆相湖盆地层对比的基本原则和技术要求。' : 'GB/T-31024 standards for continental basin correlation.'
    }
  });

  const moveNode = (id: string, direction: 'up' | 'down') => {
    const index = outlineNodes.findIndex(n => n.id === id);
    if (index === -1) return;
    const newNodes = [...outlineNodes];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newNodes.length) return;
    [newNodes[index], newNodes[targetIndex]] = [newNodes[targetIndex], newNodes[index]];
    setOutlineNodes(newNodes);
  };

  const changeLevel = (id: string, delta: number) => {
    setOutlineNodes(prev => prev.map(n => {
      if (n.id === id) {
        const newLevel = Math.max(1, Math.min(3, (n.level || 1) + delta));
        return { ...n, level: newLevel };
      }
      return n;
    }));
  };

  const addNode = (id: string, type: 'sibling' | 'child') => {
    const index = outlineNodes.findIndex(n => n.id === id);
    if (index === -1) return;
    const refNode = outlineNodes[index];
    const newNode = {
      id: Math.random().toString(36).substr(2, 9),
      title: lang === 'zh' ? '新章节' : 'New Chapter',
      level: type === 'sibling' ? (refNode.level || 1) : (refNode.level || 1) + 1,
      isOpen: true,
      objectScope: { wells: [], blocks: [], structures: [], horizons: [], reservoirUnits: [] },
      selectedMBUs: []
    };
    const newNodes = [...outlineNodes];
    newNodes.splice(index + 1, 0, newNode);
    setOutlineNodes(newNodes);
  };

  const deleteNode = (id: string) => {
    setOutlineNodes(prev => prev.filter(n => n.id !== id));
    if (activeConfigChapterId === id) {
      const remaining = outlineNodes.filter(n => n.id !== id);
      if (remaining.length > 0) {
        setActiveConfigChapterId(remaining[0].id);
      }
    }
  };

  const handleAddMbu = (mbuDef: any) => {
    setOutlineNodes(prev => prev.map(n => {
      if (n.id === activeConfigChapterId) {
        return {
          ...n,
          selectedMBUs: [
            ...(n.selectedMBUs || []),
            {
              id: mbuDef.id,
              categories: { inputs: [], process: [], outcome: [], management: [], standards: [], questions: [] }
            }
          ]
        };
      }
      return n;
    }));
  };

  useEffect(() => {
    if (config?.outline && config.outline.length > 0) {
      setOutlineNodes(config.outline);
      const firstId = config.outline[0]?.id;
      if (firstId) {
        setActiveConfigChapterId(firstId);
      }
    }
  }, [config]);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionPopup({ x: rect.left + rect.width / 2, y: rect.top - 10, text: selection.toString().trim() });
    } else {
      setSelectionPopup(null);
    }
  };

  const objectName = config.selectedReportObjectInstance || config.well?.name || config.projectName || (lang === 'zh' ? 'X-1井' : 'X-1 Well');

  // Initialize Chapters
  useEffect(() => {
    if (currentPhase === 'confirm_outline') {
      return;
    }

    const initialOutline = outlineNodes.length > 0 ? outlineNodes : (config?.outline || []);
    
    if (config?.isWeeklyBrief) {
      const briefChapters: ChapterNode[] = [
        {
          id: '1', title: lang === 'zh' ? '第一章 生产整体概况' : 'Chapter 1: Overall Production Summary', level: 1, content: '', status: 'pending',
          fullContentText: lang === 'zh'
            ? '本周全区整体生产稳中有升，日产达成率超计划 2.5%。各单位认真落实生产计划，紧密配合，实现全区原油产量稳步增长。全区平均日产油 1.25 万吨，累产油 8.75 万吨，整体运行平稳有序。'
            : 'Overall production across the district saw steady growth this week, with the daily target execution exceeding plans by 2.5%. District average daily oil production reached 12.5 thousand tons, with cumulative production of 87.5 thousand tons.'
        },
        {
          id: '2', title: lang === 'zh' ? '第二章 重点井与异常井 analysis' : 'Chapter 2: Key & Abnormal Wells Analysis', level: 1, content: '', status: 'pending',
          fullContentText: lang === 'zh'
            ? '本周针对异常下降和突发减产井启动了智能诊断巡检。其中，A1井由于地面输油管线短时故障维护，日产量曾短时下降；经在4月14日进行抢修后，已完全恢复满产，目前生产状况优良。B5井目前压力微幅波动，整体平稳。'
            : 'Intelligent anomaly inspection was triggered this week. Well A1 experienced a brief drop in daily production due to surface pipeline maintenance. Following repairs on April 14, full capacity has been restored, and its current status is excellent. Well B5 remains steady with minor pressure fluctuations.'
        },
        {
          id: '3', title: lang === 'zh' ? '第三章 后续生产治理与管理建议' : 'Chapter 3: Management Recommendations', level: 1, content: '', status: 'pending',
          fullContentText: lang === 'zh'
            ? '根据智能问数及产量下降诊断大模型分析结果，建议采取以下对策：\n1. 持续跟踪关注 A1 井管线修复后的压力与液量波动情况，防止发生二次泄漏或故障。\n2. 建议下周加大对老井递减区的稳产注水监控力度，精细调节各井组注水配额，延缓产量递减。\n3. 提早准备下月原油生产计划的滚动预测与动态排产，对重点增产层位进行前瞻性技术论证。'
            : 'Based on diagnosis: 1. Monitor well A1 closely after pipeline repairs to prevent recurring issues. 2. Increase water flooding monitoring next week in mature areas to delay natural decline. 3. Prepare predictive rolling plan for next month.'
        }
      ];
      setChapters(briefChapters);
    } else if (initialOutline.length > 0) {
      const mappedChapters: ChapterNode[] = initialOutline.map((node: any) => {
        const targetWells = node.objectScope?.wells?.map((w: string) => w.replace(/^井：/, '')) || [];
        const mbus = node.selectedMBUs?.map((m: any) => m.id) || [];
        
        let fullContentText = node.fullContentText || '';
        if (!fullContentText) {
          const sample = node.sampleContent || getDefaultSampleContent(node.id, node.title, objectName, lang);
          const instructions = node.instructionContent || getDefaultInstructionContent(node.id, node.title, lang);
          if (lang === 'zh') {
            fullContentText = `${node.title}相关的地质要素已准备就绪。编写已严格遵循您指定的【指令要求】：\n${instructions}\n\n【生成章节内容】：\n${sample}\n\n该章节涉及的关联地质对象涵盖：[${
              targetWells.length > 0 ? targetWells.join(', ') : objectName
            }]。编写过程中系统深度分析关联了数字化成果MBU：[${
              mbus.length > 0 ? mbus.join(', ') : '系统标准地层构造数据库'
            }]，所得出的各项压力指数与井身参数完全符合国家级和企业级勘探安全技术规程。数据质量满足后续工程建设及安全施工要求。`;
          } else {
            fullContentText = `We have verified all operational factors for ${node.title}. Writing followed your specified prompts:\n${instructions}\n\n[Generated Section Content]:\n${sample}\n\nThis chapter focuses on geological target: [${
              targetWells.length > 0 ? targetWells.join(', ') : objectName
            }]. Fully synced with MBU nodes: [${
              mbus.length > 0 ? mbus.join(', ') : 'standard knowledge base'
            }]. The precision meets safety and enterprise design requirements.`;
          }
        }

        return {
          id: node.id,
          title: node.title,
          level: Math.min(2, Math.max(1, node.level || 1)) as 1 | 2,
          status: 'pending' as const,
          content: '',
          fullContentText,
          warning: (node.selectedMBUs || []).length === 0 ? {
            reason: lang === 'zh' ? '本章暂未关联到参考MBU数字化成果' : 'No MBU referenced for this chapter',
            suggestion: lang === 'zh' ? '该章节已采用系统默认标准模板进行编写。若有相关地勘、测井等成果，建议在左侧配置关联MBU以获取极高精准度的生成文本。' : 'Default knowledge base was used for report generation. Adding real MBU records is suggested.'
          } : undefined
        };
      });
      setChapters(mappedChapters);
    } else {
      const defaultChapters: ChapterNode[] = [
        { 
          id: '1', title: lang === 'zh' ? '第一章 基础信息' : 'Chapter 1: Basic Info', level: 1, content: '', status: 'pending',
          fullContentText: lang === 'zh' 
            ? `${objectName}位于鄂尔多斯盆地XX区块，设计井深3500m，井别为评价井。该井主要勘探目的层为长6段，旨在评价区域含油气性及储层发育状况。本井由分公司承担钻探任务，预计于2026年第三季度开钻。`
            : `${objectName} is located in Ordos Basin, with a designed depth of 3500m. It is an appraisal well targeting the Chang 6 member.`
        },
        { 
          id: '1-1', title: lang === 'zh' ? '1.1 井基本情况' : '1.1 Well Basic Specs', level: 2, content: '', status: 'warning',
          fullContentText: lang === 'zh'
            ? '设计井身结构采用三开程序，一开封隔表层松散地层，二开进入主要含油层段，三开完钻并进行试油评价。钻井流体设计采用水基聚合物体系，以满足井壁稳定及环境保护要求。'
            : 'The well structure adopts a 3-stage program using water-based polymer system for drilling fluids.',
          warning: {
            reason: lang === 'zh' ? '缺少输入的资料' : 'Missing input data',
            suggestion: lang === 'zh' ? '建议补充井基本信息表' : 'Suggest adding well basic info table'
          }
        },
        { 
          id: '2', title: lang === 'zh' ? '第二章 区域地质' : 'Chapter 2: Regional Geology', level: 1, content: '', status: 'pending',
          fullContentText: lang === 'zh'
            ? '研究区块位于鄂尔多斯盆地伊陕斜坡中段，构造平缓。区域盖层条件优质，发育多套生油层系，具备良好的成藏背景。地层自上而下发育白垩系、侏罗系及三叠系，厚度变化规律。'
            : 'The block is situated in the central Yishan Slope of Ordos Basin. It features gentle structures and high-quality regional seals.'
        },
        { 
          id: '3', title: lang === 'zh' ? '第三章 地层预测' : 'Chapter 3: Formation Prediction', level: 1, content: '', status: 'pending',
          fullContentText: lang === 'zh'
            ? '根据三维地震资料解释，目标井区地层发育齐全。通过邻井对比及变速成图技术，对目的层深度进行了精细预测，误差控制在合理范围内。'
            : 'Seismic interpretation shows a complete stratigraphic sequence. Depth prediction was refined using offset well correlation.'
        },
        { 
          id: '3-1', title: lang === 'zh' ? '3.1 地层划分' : '3.1 Stratigraphy', level: 2, content: '', status: 'pending',
          fullContentText: lang === 'zh'
            ? '根据测井响应特征，本区块地层划分方案明确。自地壳表层向下，地层序列稳定，主要目的层长6段预计在钻遇深度3250m处呈现明显的岩性突变。'
            : 'Based on log responses, the stratigraphic scheme is clear. The primary target Chang 6 is expected at 3250m.'
        },
        { 
          id: '3-2', title: lang === 'zh' ? '3.2 地层界面预测' : '3.2 Interface Prediction', level: 2, content: '', status: 'pending',
          fullContentText: lang === 'zh'
            ? '预测结果显示，陆相碎屑岩盖层与储集层界面清晰。预计目标井将在3250m进入长6层，预测深度准确率超过98%。'
            : 'Predicted entry into Chang 6 is at 3250m with high accuracy.'
        },
        { 
          id: '4', title: lang === 'zh' ? '第四章 压力预测' : 'Chapter 4: Pressure Prediction', level: 1, content: '', status: 'pending',
          fullContentText: lang === 'zh'
            ? '根据声波时差及电阻率测井资料，结合邻井钻探压力测试，预测该井地层压力梯度为1.02-1.08 MPa/100m。破裂压力预测值约为2.15 MPa/100m，为井控安全提供重要参考。'
            : 'Predicted formation pressure gradient is 1.02-1.08 MPa/100m.',
          warning: {
            reason: lang === 'zh' ? '缺少该区块实测压力资料' : 'Missing actual pressure data',
            suggestion: lang === 'zh' ? '已采用标准模板完成基础生成，建议审阅阶段补充资料后重新生成。' : 'Basic generation completed using templates. Review recommended.'
          }
        },
        { 
          id: '5', title: lang === 'zh' ? '第五章 完井设计' : 'Chapter 5: Completion Design', level: 1, content: '', status: 'pending',
          fullContentText: lang === 'zh'
            ? '完井方式推荐采用套管固井射孔完井，选用P110级套管，以应对主力油层的地层强度与后期增产措施的需求。'
            : 'P110 casing and cemented completion with perforation is recommended.'
        }
      ];
      setChapters(defaultChapters);
    }
  }, [lang, objectName, currentPhase]);

  // Simulation Logic
  useEffect(() => {
    if (chapters.length === 0 || hasStarted.current || currentPhase !== 'writing') return;
    hasStarted.current = true;

    const runSimulation = async () => {
      setIsGenerating(true);
      let chapterStates = [...chapters];

      for (let i = 0; i < chapterStates.length; i++) {
        const chapter = chapterStates[i];
        setActiveChapterId(chapter.id);
        setChapters(prev => prev.map(c => c.id === chapter.id ? { ...c, status: 'running' } : c));

        const text = chapter.fullContentText;
        let displayed = '';
        for (let j = 0; j < text.length; j++) {
          displayed += text[j];
          setChapters(prev => prev.map(c => c.id === chapter.id ? { ...c, content: displayed } : c));
          
          await new Promise(r => setTimeout(r, 10 + Math.random() * 15));
        }

        const isWarning = !!chapter.warning;
        setChapters(prev => prev.map(c => c.id === chapter.id ? { ...c, status: isWarning ? 'warning' : 'completed' } : c));
        
        await new Promise(r => setTimeout(r, 400));
      }

      setIsCompleted(true);
      setActiveChapterId(null);
      setIsGenerating(false);
      if (onComplete) {
        onComplete();
      }
    };

    runSimulation();
  }, [chapters.length, currentPhase]);

  useEffect(() => {
    if (isFollowMode && isGenerating && activeChapterId) {
      scrollToActiveChapter(activeChapterId);
    }
  }, [activeChapterId, chapters, isGenerating, isFollowMode]);

  useEffect(() => {
    if (activeChapterId && onActiveChapterChange && lastNotifiedChapterId.current !== activeChapterId) {
      const ch = chapters.find(c => c.id === activeChapterId);
      if (ch) {
        lastNotifiedChapterId.current = activeChapterId;
        onActiveChapterChange(activeChapterId, ch.title);
      }
    }
  }, [activeChapterId, chapters, onActiveChapterChange]);
  
  const scrollToActiveChapter = (id: string, isSmooth = false) => {
    const el = document.getElementById(`doc-chapter-${id}`);
    const container = contentRef.current;
    if (el && container) {
        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Use the relative position of the writing head in the container
        const elementBottom = rect.bottom - containerRect.top;
        const viewportHeight = containerRect.height;
        
        // Threshold: Keep the "cursor" at about 60% of the screen height
        if (elementBottom > viewportHeight * 0.6) {
            const scrollAmount = elementBottom - (viewportHeight * 0.6);
            container.scrollTop = container.scrollTop + scrollAmount;
        }
    }
  };

  const scrollToChapterTop = (id: string) => {
    const el = document.getElementById(`doc-chapter-${id}`);
    const container = contentRef.current;
    if (el && container) {
        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Absolute scroll position = Current Scroll + Element Top Offset - Header Margin
        const targetScrollTop = container.scrollTop + (rect.top - containerRect.top) - 20;
        
        container.scrollTo({ 
            top: targetScrollTop, 
            behavior: 'smooth' 
        });
    }
  };

  const handleDirectoryClick = (id: string) => {
    setIsFollowMode(false);
    scrollToChapterTop(id);
    setHighlightedChapterId(id);
    setActiveChapterId(id);
    setTimeout(() => setHighlightedChapterId(null), 3000);
  };

  const getStatusIcon = (status: ChapterStatus) => {
    switch (status) {
      case 'completed': return <i className="fas fa-check-circle text-green-500"></i>;
      case 'running': return <i className="fas fa-circle-notch fa-spin text-indigo-500"></i>;
      case 'warning': return <i className="fas fa-exclamation-triangle text-amber-500"></i>;
      default: return <i className="far fa-circle text-slate-300"></i>;
    }
  };

  if (currentPhase === 'confirm_outline') {
    const activeNode = outlineNodes.find(n => n.id === activeConfigChapterId) || outlineNodes[0] || {
      id: '1', title: 'Preface', level: 1, objectScope: { wells: [], blocks: [], structures: [], horizons: [], reservoirUnits: [] }, selectedMBUs: []
    };
    const activeSelectedResource = selectedResourceId ? getResourceDatabase(lang)[selectedResourceId] : null;

    return (
      <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-sans text-slate-900" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="w-full h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <i className="fas fa-file-invoice text-sm"></i>
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-800 leading-none flex items-center gap-2">
                {lang === 'zh' ? '智能报告编写编制准备' : 'Smart Report Preparation'}
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase border border-indigo-100">
                  {lang === 'zh' ? '人机大纲确认' : 'Confirming Outline'}
                </span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                {lang === 'zh' ? `当前对象：${objectName}` : `Target: ${objectName}`}
              </p>
            </div>
          </div>
          
          {/* Close/Cancel not supported on preparation page per user request */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 shadow-sm">
              <i className="fas fa-lock text-[9px]"></i>
              {lang === 'zh' ? '编制确认流程中' : 'Preparation process locked'}
            </span>
          </div>
        </div>

        {/* Content Workspace */}
        <div className="flex-1 flex overflow-hidden p-6 gap-6 relative">
          
          {/* Left Column: Outline Tree */}
          <div className="w-[38%] flex flex-col bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-3.5 bg-indigo-500 rounded-full"></div>
                <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  {lang === 'zh' ? '报告大纲目录' : 'Report Structure Outline'}
                </h2>
              </div>
              <button
                onClick={() => {
                  const id = Math.random().toString(36).substr(2, 9);
                  const newNode = {
                    id,
                    title: lang === 'zh' ? '新章节' : 'New Chapter',
                    level: 1,
                    isOpen: true,
                    objectScope: { wells: [objectName], blocks: [], structures: [], horizons: [], reservoirUnits: [] },
                    selectedMBUs: []
                  };
                  setOutlineNodes([...outlineNodes, newNode]);
                  setActiveConfigChapterId(id);
                }}
                className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-all flex items-center gap-1 shadow-sm"
              >
                <i className="fas fa-plus text-[8px]"></i>
                {lang === 'zh' ? '新增章节' : 'Add Chapter'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
              {outlineNodes.map((node, index) => {
                const isActive = activeConfigChapterId === node.id;
                return (
                  <div 
                    key={node.id}
                    onClick={() => setActiveConfigChapterId(node.id)}
                    className={`group flex items-center gap-2 py-2 px-3 rounded-xl cursor-pointer transition-all border ${
                      isActive 
                        ? 'bg-indigo-50/80 border-indigo-100 text-indigo-700 shadow-sm' 
                        : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-100'
                    }`}
                    style={{ marginLeft: `${((node.level || 1) - 1) * 20}px` }}
                  >
                    <div className="flex items-center gap-1.5 text-slate-300 group-hover:text-slate-400">
                      <i className="fas fa-bars text-[10px]"></i>
                    </div>
                    <span className="text-[10px] font-mono opacity-40 font-bold w-4">{index + 1}</span>
                    <div className="flex-1 flex items-center gap-1 min-w-0" title={lang === 'zh' ? '直接修改文本可重命名' : 'Edit to rename'}>
                      <input 
                        type="text"
                        value={node.title}
                        onClick={e => e.stopPropagation()}
                        onChange={(e) => {
                          setOutlineNodes(prev => prev.map(n => n.id === node.id ? { ...n, title: e.target.value } : n));
                        }}
                        className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-inherit focus:ring-1 focus:ring-indigo-300 focus:bg-white/80 rounded px-1.5 py-0.5 min-w-0 transition-all"
                        placeholder={lang === 'zh' ? '输入章节名称...' : 'Chapter Title...'}
                      />
                      <i className="fas fa-edit text-[9px] text-slate-300 group-hover:text-slate-400 opacity-30 group-hover:opacity-100 transition-opacity flex-shrink-0"></i>
                    </div>

                    {/* Quick controls on hover */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => moveNode(node.id, 'up')}
                        className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-all"
                      >
                        <i className="fas fa-arrow-up text-[8px]"></i>
                      </button>
                      <button 
                        onClick={() => moveNode(node.id, 'down')}
                        className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-all"
                      >
                        <i className="fas fa-arrow-down text-[8px]"></i>
                      </button>
                      <button 
                        onClick={() => changeLevel(node.id, 1)}
                        title={lang === 'zh' ? '降级' : 'Indent'}
                        className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-all"
                      >
                        <i className="fas fa-indent text-[8px]"></i>
                      </button>
                      <button 
                        onClick={() => changeLevel(node.id, -1)}
                        title={lang === 'zh' ? '升级' : 'Outdent'}
                        className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-all"
                      >
                        <i className="fas fa-outdent text-[8px]"></i>
                      </button>
                      <button 
                        onClick={() => deleteNode(node.id)}
                        className="w-5 h-5 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                      >
                        <i className="fas fa-trash-alt text-[8px]"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Material Config */}
          <div className="flex-1 flex flex-col bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-3.5 bg-emerald-500 rounded-full"></div>
                <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  {lang === 'zh' ? '章节资料与对象范围配置' : 'Chapter Resource Config'}
                </h2>
              </div>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100/50 rounded-lg text-[10px] font-black">
                {activeNode.title}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Object scope list */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <i className="fas fa-bullseye text-slate-300"></i>
                  {lang === 'zh' ? '本章关联地质对象与对象范围' : 'Related Geological Objects'}
                </h3>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-wrap items-center gap-2">
                  {/* Core chosen object (always visible & highlighted) */}
                  <div className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                    <span className="px-1 py-0.5 bg-indigo-600 text-white rounded text-[8px] font-black uppercase">
                      {lang === 'zh' ? '核心对象' : 'Core Object'}
                    </span>
                    {objectName}
                  </div>

                  {/* Customizable sub-wells */}
                  {(activeNode.objectScope?.wells || []).filter((w: string) => w !== objectName).map((w: string, idx: number) => (
                    <div key={`well-${idx}`} className="px-2.5 py-1 bg-white border border-slate-200/60 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-1.5 shadow-sm">
                      <span className="px-1 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-black uppercase">{lang === 'zh' ? '井' : 'Well'}</span>
                      {w}
                      <button 
                        onClick={() => {
                          setOutlineNodes(prev => prev.map(n => {
                            if (n.id === activeNode.id) {
                              return {
                                ...n,
                                objectScope: {
                                  ...n.objectScope,
                                  wells: (n.objectScope?.wells || []).filter((item: string) => item !== w)
                                }
                              };
                            }
                            return n;
                          }));
                        }}
                        className="text-slate-300 hover:text-red-500 text-[8px] ml-1 transition-colors"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}

                  {/* Other scopes */}
                  {['blocks', 'structures', 'horizons', 'reservoirUnits'].map(key => {
                    const label = key === 'blocks' ? (lang === 'zh' ? '区块' : 'Block') :
                                  key === 'structures' ? (lang === 'zh' ? '构造' : 'Structure') :
                                  key === 'horizons' ? (lang === 'zh' ? '层位' : 'Horizon') : (lang === 'zh' ? '单元' : 'Unit');
                    return (activeNode.objectScope?.[key] || []).map((val: string, idx: number) => (
                      <div key={`${key}-${idx}`} className="px-2.5 py-1 bg-white border border-slate-200/60 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-1.5 shadow-sm">
                        <span className="px-1 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-black uppercase">{label}</span>
                        {val}
                        <button 
                          onClick={() => {
                            setOutlineNodes(prev => prev.map(n => {
                              if (n.id === activeNode.id) {
                                return {
                                  ...n,
                                  objectScope: {
                                    ...n.objectScope,
                                    [key]: (n.objectScope?.[key] || []).filter((item: string) => item !== val)
                                  }
                                };
                              }
                              return n;
                            }));
                          }}
                          className="text-slate-300 hover:text-red-500 text-[8px] ml-1 transition-colors"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ));
                  })}

                  {/* Add Custom Scope Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const additionalName = prompt(lang === 'zh' ? '输入该章节关联的其他范围名称(例如：储层段名、邻区或区块):' : 'Enter additional range/target name:');
                      if (additionalName && additionalName.trim()) {
                        setOutlineNodes(prev => prev.map(n => {
                          if (n.id === activeNode.id) {
                            const currentBlocks = n.objectScope?.blocks || [];
                            return {
                              ...n,
                              objectScope: {
                                ...(n.objectScope || {}),
                                blocks: [...currentBlocks, additionalName.trim()]
                              }
                            };
                          }
                          return n;
                        }));
                      }
                    }}
                    className="px-2.5 py-1 bg-white/60 border border-dashed border-slate-300 rounded-lg text-[10px] text-slate-400 font-bold flex items-center gap-1 cursor-pointer hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                  >
                    <i className="fas fa-plus text-[8px]"></i>
                    {lang === 'zh' ? '关联其他地质对象/范围' : 'Add Geological Target'}
                  </button>
                </div>
              </div>

              {/* MBU resource items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <i className="fas fa-folder-open text-slate-300"></i>
                    {lang === 'zh' ? '关联数字化成果 (MBU)' : 'Linked MBU Resources'}
                  </h3>

                  <div className="relative">
                    <button 
                      onClick={() => setIsAddMbuOpen(!isAddMbuOpen)}
                      className="text-[10px] bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1"
                    >
                      <i className="fas fa-plus text-[8px]"></i>
                      {lang === 'zh' ? '添加 MBU' : 'Add MBU'}
                    </button>
                    {isAddMbuOpen && (
                      <div className="absolute right-0 top-7 z-50 bg-white shadow-xl rounded-xl border border-slate-100 p-1.5 w-48 space-y-0.5">
                        {getMbuDefinitions(lang).filter(m => !(activeNode.selectedMBUs || []).find((s: any) => s.id === m.id)).map(m => (
                          <button 
                            key={m.id} 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddMbu(m);
                              setIsAddMbuOpen(false);
                            }} 
                            className="w-full text-left text-[11px] p-2 hover:bg-slate-50 font-bold text-slate-700 rounded-lg transition-all"
                          >
                            {m.id} {m.name}
                          </button>
                        ))}
                        {getMbuDefinitions(lang).filter(m => !(activeNode.selectedMBUs || []).find((s: any) => s.id === m.id)).length === 0 && (
                          <p className="text-[10px] text-slate-400 p-2 text-center">{lang === 'zh' ? '无可用MBU' : 'No MBU available'}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {(activeNode.selectedMBUs || []).map((mbuEntry: any) => {
                    const mbuDef = getMbuDefinitions(lang).find(d => d.id === mbuEntry.id) || { id: mbuEntry.id, name: 'Unknown' };
                    const isExpanded = expandedMBUId === mbuEntry.id;
                    const mbuData = mbuEntry.categories || { inputs: [], process: [], outcome: [], management: [], standards: [], questions: [] };

                    const ipomsq = [
                      { key: 'I', val: (mbuData.inputs || []).length > 0 },
                      { key: 'P', val: (mbuData.process || []).length > 0 },
                      { key: 'O', val: (mbuData.outcome || []).length > 0 },
                      { key: 'M', val: (mbuData.management || []).length > 0 },
                      { key: 'S', val: (mbuData.standards || []).length > 0 },
                      { key: 'Q', val: (mbuData.questions || []).length > 0 },
                    ];

                    return (
                      <div key={mbuEntry.id} className="bg-slate-50 border border-slate-200/60 rounded-xl overflow-hidden transition-all shadow-sm">
                        <div 
                          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/50 transition-all"
                          onClick={() => setExpandedMBUId(isExpanded ? null : mbuEntry.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
                              {mbuEntry.id.split('-')[1]}
                            </div>
                            <div>
                              <h4 className="text-[11px] font-bold text-slate-700">{mbuEntry.id} {mbuDef.name}</h4>
                              <div className="flex gap-2.5 mt-1">
                                {ipomsq.map(cat => (
                                  <div key={cat.key} className="flex items-center gap-1 font-bold">
                                    <div className={`w-1.5 h-1.5 rounded-full ${cat.val ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'border border-slate-300'}`}></div>
                                    <span className={`text-[8px] font-black ${cat.val ? 'text-slate-600' : 'text-slate-300'}`}>{cat.key}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-slate-400">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOutlineNodes(prev => prev.map(n => {
                                  if (n.id === activeConfigChapterId) {
                                    return { ...n, selectedMBUs: (n.selectedMBUs || []).filter((m: any) => m.id !== mbuEntry.id) };
                                  }
                                  return n;
                                }));
                              }} 
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <i className="fas fa-trash-alt text-[10px]"></i>
                            </button>
                            <i className={`fas fa-chevron-down text-[10px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                          </div>
                        </div>

                        {/* MBU Sub-categories expansion */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-slate-100 bg-white"
                            >
                              <div className="p-4 space-y-4">
                                {[
                                  { key: 'inputs', label: lang === 'zh' ? 'Inputs（输入依据）' : 'Inputs' },
                                  { key: 'process', label: lang === 'zh' ? 'Process（处理过程）' : 'Process' },
                                  { key: 'outcome', label: lang === 'zh' ? 'Outcome（输出成果）' : 'Outcome' },
                                  { key: 'management', label: lang === 'zh' ? 'Management（管理确认）' : 'Management' },
                                  { key: 'standards', label: lang === 'zh' ? 'Standards（标准规则）' : 'Standards' },
                                  { key: 'questions', label: lang === 'zh' ? 'Questions（缺陷不确定）' : 'Questions' }
                                ].map(cat => {
                                  const items = mbuData[cat.key] || [];
                                  if (items.length === 0) return null;
                                  
                                  return (
                                    <div key={cat.key} className="space-y-2">
                                      <div className="flex items-center justify-between border-b border-slate-50 pb-1.5">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{cat.label}</span>
                                        <span className="text-[9px] font-bold text-slate-400">{items.length}</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-1.5">
                                        {items.map((item: string) => (
                                          <div 
                                            key={item} 
                                            onClick={() => setSelectedResourceId(item)}
                                            className="group flex items-center gap-2 p-2 bg-slate-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg cursor-pointer transition-all"
                                          >
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                                            <span className="flex-1 text-[10px] font-bold text-slate-600 group-hover:text-indigo-600 truncate">{item}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}

                  {(activeNode.selectedMBUs || []).length === 0 && (
                    <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-400">
                      <i className="fas fa-folder-closed text-lg mb-2 text-slate-300"></i>
                      <p className="text-[10px] font-bold">{lang === 'zh' ? '本章暂未配置数字化成果 MBU' : 'No MBU referenced for this chapter'}</p>
                      <p className="text-[9px] text-slate-400/80 mt-1">{lang === 'zh' ? '点击右上角【添加 MBU】推荐核心专业成果资料' : 'Click Add MBU to import core geological data'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Write Guides: Sample & Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                {/* 示例内容 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <i className="fas fa-file-alt text-indigo-400"></i>
                      {lang === 'zh' ? '章节写作示例内容 (风格范本)' : 'Chapter Sample Content (Style guide)'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const defaultVal = getDefaultSampleContent(activeNode.id, activeNode.title, objectName, lang);
                        setOutlineNodes(prev => prev.map(n => n.id === activeNode.id ? { ...n, sampleContent: defaultVal } : n));
                      }}
                      className="text-[9px] text-indigo-500 hover:text-indigo-700 font-bold bg-indigo-50/50 hover:bg-indigo-50 px-2 py-0.5 rounded transition-all"
                      title={lang === 'zh' ? '重置为系统行业推荐范本' : 'Reset to system default template'}
                    >
                      {lang === 'zh' ? '使用行业范本' : 'Load Standard'}
                    </button>
                  </div>
                  <div className="relative">
                    <textarea 
                      value={activeNode.sampleContent !== undefined ? activeNode.sampleContent : getDefaultSampleContent(activeNode.id, activeNode.title, objectName, lang)}
                      onChange={(e) => {
                        setOutlineNodes(prev => prev.map(n => n.id === activeNode.id ? { ...n, sampleContent: e.target.value } : n));
                      }}
                      placeholder={lang === 'zh' ? '请输入该章节编写的高质量示例或样例内容，AI将严格参考此处的结构、语气、格式排版以及学术用语规范进行拟真化生成...' : 'Enter sample text or template example here...'}
                      className="w-full h-44 p-3.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none shadow-inner leading-relaxed text-slate-700 font-medium custom-scrollbar"
                    />
                    <div className="absolute right-2 bottom-2 text-[9px] text-slate-300 font-bold select-none bg-white px-1.5 py-0.5 rounded border border-slate-100 shadow-sm">
                      {lang === 'zh' ? '格式约束器' : 'Format Guide'}
                    </div>
                  </div>
                </div>

                {/* 指令内容 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <i className="fas fa-magic text-emerald-400"></i>
                      {lang === 'zh' ? '章节 AI 写作指令 (控制Prompt)' : 'Chapter Prompt Instructions'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const defaultVal = getDefaultInstructionContent(activeNode.id, activeNode.title, lang);
                        setOutlineNodes(prev => prev.map(n => n.id === activeNode.id ? { ...n, instructionContent: defaultVal } : n));
                      }}
                      className="text-[9px] text-emerald-600 hover:text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100/80 px-2 py-0.5 rounded transition-all"
                      title={lang === 'zh' ? '重置为系统专业指令' : 'Reset to system standard instructions'}
                    >
                      {lang === 'zh' ? '使用专业指令' : 'Load Prompt'}
                    </button>
                  </div>
                  <div className="relative">
                    <textarea 
                      value={activeNode.instructionContent !== undefined ? activeNode.instructionContent : getDefaultInstructionContent(activeNode.id, activeNode.title, lang)}
                      onChange={(e) => {
                        setOutlineNodes(prev => prev.map(n => n.id === activeNode.id ? { ...n, instructionContent: e.target.value } : n));
                      }}
                      placeholder={lang === 'zh' ? '请输入该章节的核心写作诉求：例如字数在500-800字、多采用对比表、避免口语化词汇等...' : 'Enter prompt requirements for report generator...'}
                      className="w-full h-44 p-3.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none shadow-inner leading-relaxed text-slate-700 font-medium custom-scrollbar"
                    />
                    <div className="absolute right-2 bottom-2 text-[9px] text-slate-300 font-bold select-none bg-white px-1.5 py-0.5 rounded border border-slate-100 shadow-sm">
                      {lang === 'zh' ? '深度控制阀' : 'Detail Controller'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Tip bar */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-[10px] text-slate-400 text-center font-bold">
              {lang === 'zh' ? '核对大纲节点并配置核心生产依据，实现业务与AI在编制前的深度确认' : 'Verify the nodes and inputs to fully guide the automated report writing.'}
            </div>
          </div>

          {/* Side Panel: Resource Details */}
          <AnimatePresence>
            {activeSelectedResource && (
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="absolute top-0 right-0 w-80 h-full bg-white shadow-2xl border-l border-slate-200/80 z-[60] p-5 flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">{lang === 'zh' ? '资源详情' : 'Resource Details'}</h5>
                  <button 
                    onClick={() => setSelectedResourceId(null)}
                    className="w-7 h-7 rounded-full hover:bg-slate-50 text-slate-400 transition-all flex items-center justify-center"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className="flex-1 space-y-5 font-bold">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{lang === 'zh' ? '资源成果名称' : 'Resource Name'}</label>
                    <p className="text-xs font-black text-slate-800 leading-snug">{activeSelectedResource.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{lang === 'zh' ? '资源类型' : 'Type'}</label>
                      <p className="text-[10px] text-slate-600">{activeSelectedResource.type}</p>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{lang === 'zh' ? '同步时间' : 'Synced Time'}</label>
                      <p className="text-[10px] text-slate-600">{activeSelectedResource.time}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{lang === 'zh' ? '关联井对象' : 'Related Objects'}</label>
                    <p className="text-[10px] text-slate-600">{activeSelectedResource.objects}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{lang === 'zh' ? '核心提炼/摘要' : 'Extracted Summary'}</label>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-bold">{activeSelectedResource.summary}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button className="w-full py-2.5 bg-indigo-600 text-white text-[10px] font-black rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5">
                    <i className="fas fa-external-link-alt"></i>
                    {lang === 'zh' ? '打开原始数字化MBU' : 'Open MBU Asset'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Bottom Wizard Controls */}
        <div className="w-full h-16 bg-white border-t border-slate-200/80 px-6 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <i className="fas fa-circle-info text-indigo-500 animate-bounce"></i>
            <span className="font-bold">{lang === 'zh' ? '大纲及编写素材已确认，智能体整装待命' : 'Outline & source materials verified. Ready to write.'}</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrentPhase('writing');
              }}
              className="px-8 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-1.5"
            >
              <i className="fas fa-file-signature text-[10px]"></i>
              {lang === 'zh' ? '确认并开始编写' : 'Confirm & Start Writing'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden font-sans text-slate-900" onClick={e => e.stopPropagation()}>
      {/* Universal Document Header */}
      <div className="w-full h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-30 shadow-sm">
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isSidebarVisible ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
                title={lang === 'zh' ? '报告目录' : 'Directory'}
             >
                <i className="fas fa-bars"></i>
             </button>
             <div className="h-4 w-px bg-slate-200"></div>
             <h1 className="text-xs font-black text-slate-600 tracking-tight flex items-center gap-2">
               <i className="fas fa-file-word text-blue-600"></i>
               {config?.isWeeklyBrief 
                 ? (lang === 'zh' ? '本周生产运行简报_20240416' : 'Weekly_Production_Operation_Brief_20240416')
                 : `${objectName}${lang === 'zh' ? ' 钻井地质设计报告' : ' Drilling Geology Design'}`
               }.docx
             </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {!config?.isWeeklyBrief && (
              <button
                onClick={() => setCurrentPhase('confirm_outline')}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all flex items-center gap-1.5"
                title={lang === 'zh' ? '返回大纲与写作指令配置页面' : 'Return to Outline and Prompts Configuration'}
              >
                <i className="fas fa-arrow-left text-[9px]"></i>
                <span>{lang === 'zh' ? '返回大纲编辑' : 'Back to Outline'}</span>
              </button>
            )}
            <button 
              onClick={handleSaveReport}
              title={lang === 'zh' ? '保存生成报告至左侧输出成果' : 'Save generated report to output artifacts'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                isSaved 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
              }`}
            >
              <i className={`fas ${isSaved ? 'fa-check text-emerald-600' : 'fa-bookmark'} text-xs`}></i>
              <span>{isSaved ? (lang === 'zh' ? '已保存成果' : 'Saved') : (lang === 'zh' ? '保存成果' : 'Save Report')}</span>
            </button>
            <div className="h-4 w-px bg-slate-200 mx-0.5"></div>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-all" title={lang === 'zh' ? '下载' : 'Download'}>
              <i className="fas fa-download text-xs"></i>
            </button>
            <button 
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-all" 
              title={lang === 'zh' ? '全屏' : 'Fullscreen'}
            >
              <i className="fas fa-expand text-xs"></i>
            </button>
          </div>
      </div>

      {/* Toast Alert */}
      {showToast && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mx-4 mt-2 bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center justify-between text-xs font-semibold z-30"
        >
          <div className="flex items-center gap-2">
            <i className="fas fa-check-circle text-sm"></i>
            <span>{lang === 'zh' ? '已成功将生成报告保存至左侧【输出成果】！' : 'Saved report to Output Artifacts on the left!'}</span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">{lang === 'zh' ? '已记录' : 'Recorded'}</span>
        </motion.div>
      )}

      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Directory Sidebar */}
        <AnimatePresence>
          {isSidebarVisible && (
            <motion.div 
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              className="w-72 h-full max-h-full flex flex-col bg-white border-r border-slate-200 shadow-sm z-20 shrink-0 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '文档大纲' : 'OUTLINE'}</span>
                {!config?.isWeeklyBrief && (
                  <button
                    onClick={() => setCurrentPhase('confirm_outline')}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-white border border-slate-200 hover:border-indigo-200 px-2 py-1 rounded-lg transition-all shadow-sm"
                    title={lang === 'zh' ? '返回编辑大纲与提示词' : 'Edit Outline & Prompts'}
                  >
                    <i className="fas fa-edit text-[9px]"></i>
                    <span>{lang === 'zh' ? '大纲配置' : 'Edit Outline'}</span>
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
                {chapters.map((chapter) => {
                  const isActive = activeChapterId === chapter.id;
                  const isSub = chapter.level === 2;
                  
                  return (
                    <div key={chapter.id} className="mb-0.5">
                      <button
                        onClick={() => handleDirectoryClick(chapter.id)}
                        onMouseEnter={() => setHoveredChapterId(chapter.id)}
                        onMouseLeave={() => setHoveredChapterId(null)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          isActive ? 'bg-indigo-50/80' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-4 h-4 flex items-center justify-center shrink-0">
                          {getStatusIcon(chapter.status)}
                        </div>
                        <div className={`text-left overflow-hidden ${isSub ? 'pl-4 border-l border-slate-100' : ''}`}>
                          <p className={`text-[11px] truncate font-bold ${
                            isActive ? 'text-indigo-600' : chapter.status === 'pending' ? 'text-slate-400' : 'text-slate-700'
                          }`}>
                            {chapter.title}
                          </p>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="shrink-0 p-5 border-t border-slate-100 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 tracking-widest">{lang === 'zh' ? '视窗跟随' : 'FOLLOW'}</span>
                  <button 
                    onClick={() => setIsFollowMode(!isFollowMode)}
                    className={`w-9 h-5 rounded-full transition-all relative ${isFollowMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <motion.div animate={{ x: isFollowMode ? 16 : 0 }} className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paper Workspace */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <div ref={contentRef} className="report-content-scroll-container flex-1 overflow-y-auto custom-scrollbar bg-slate-100/50 py-[10px]">
            <div className="max-w-[816px] mx-auto bg-white shadow-xl min-h-[900px] p-10 relative mb-10 ring-1 ring-slate-200">
              <div className="space-y-[10px]">
                {chapters.map((chapter) => {
                  const isWriting = activeChapterId === chapter.id;
                  const isHighlight = highlightedChapterId === chapter.id;
                  const showsContent = chapter.status !== 'pending' || isWriting;
                  const isH1 = chapter.level === 1;

                  return (
                    <motion.div 
                      id={`doc-chapter-${chapter.id}`}
                      key={chapter.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ 
                        opacity: 1, y: 0,
                        backgroundColor: isHighlight ? 'rgb(254 249 195)' : 'transparent'
                      }}
                      onMouseEnter={() => setHoveredChapterId(chapter.id)}
                      onMouseLeave={() => setHoveredChapterId(null)}
                      className="relative rounded-xl p-3 -mx-3 transition-colors duration-1000 cursor-default"
                    >
                      {isH1 ? (
                        <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight border-b-2 border-slate-900/5 pb-2">
                          {chapter.title}
                        </h2>
                      ) : (
                        <h3 className="text-xs font-black text-slate-500 mb-3 uppercase tracking-[0.1em]">
                          {chapter.title}
                        </h3>
                      )}
                      
                      {showsContent && (
                        <div 
                          className="text-[15px] leading-[1.6] text-slate-700 font-medium text-justify"
                          onMouseUp={handleMouseUp}
                        >
                          {chapter.content}
                          {isWriting && (
                            <motion.span 
                              animate={{ opacity: [1, 0] }}
                              transition={{ repeat: Infinity, duration: 0.8 }}
                              className="inline-block w-1 h-5 bg-indigo-600 ml-1 translate-y-0.5"
                            />
                          )}
                          {chapter.id === '2' && (
                              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 group relative">
                                  <div className="h-32 bg-slate-200 rounded flex items-center justify-center text-slate-500 font-bold mb-2 text-sm italic">构造图</div>
                                  <button className="hidden group-hover:flex absolute top-2 right-2 p-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold">替换</button>
                              </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Persistent Completion Status Bar removed per user request */}

          {/* AI Rewriting Popup */}
          <AnimatePresence>
            {selectionPopup && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                className="fixed z-[100] bg-white border border-slate-200 shadow-xl rounded-lg p-1 flex gap-1 -translate-x-1/2 -translate-y-full"
                style={{ left: selectionPopup.x, top: selectionPopup.y }}
              >
                {['润色', '扩写', '缩写'].map(action => (
                    <button key={action} className="px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 rounded-md">
                        {action}
                    </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Global Detail Overlays for Warnings */}
      <AnimatePresence>
          {hoveredChapterId && chapters.find(c => c.id === hoveredChapterId)?.status === 'warning' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: 20 }}
                className="fixed right-12 top-1/2 -translate-y-1/2 w-80 bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2rem] p-8 z-[100]"
              >
                  <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                        <i className="fas fa-triangle-exclamation"></i>
                      </div>
                      <h4 className="text-sm font-black text-slate-800 tracking-tight">
                        {lang === 'zh' ? '该章节存在生成提示' : 'Chapter Notice'}
                      </h4>
                  </div>
                  <div className="space-y-6 text-xs font-bold leading-relaxed">
                      <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5">{lang === 'zh' ? '情况说明' : 'DESCRIPTION'}</p>
                          <p className="text-slate-600">
                            {chapters.find(c => c.id === hoveredChapterId)?.warning?.reason}
                          </p>
                      </div>
                      <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                          <p className="text-[10px] text-indigo-500 uppercase tracking-widest mb-1.5">{lang === 'zh' ? '协同建议' : 'ADVICE'}</p>
                          <p className="text-indigo-700 italic">
                            {chapters.find(c => c.id === hoveredChapterId)?.warning?.suggestion}
                          </p>
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};
