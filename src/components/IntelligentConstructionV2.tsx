import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { translations } from '../i18n';

interface IntelligentConstructionProps {
  lang: Language;
  workspaceName: string;
  onComplete?: () => void;
}

type FlowStep = 'selection' | 'parsing' | 'template' | 'positioning' | 'guiding' | 'inference' | 'confirmation';

interface Scenario {
  id: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
  input: {
    name: string;
    object: string;
    description: string;
  };
  targetStep: FlowStep;
  confidences: number[];
}

interface Coordinate {
  dim: string;
  dimEn: string;
  val: string;
  conf: number;
}

interface ResourceItem {
  id: string;
  name: string;
  type: string;
  status: 'required' | 'recommended' | 'optional';
}

interface CapabilityItem {
  id: string;
  name: string;
}

interface TemplateItem {
  id: string;
  name: string;
  similarity: number;
  description: string;
  usage: number;
}

interface MBN {
  id: string;
  name: string;
  objectDomain: string;
  businessDomain: string;
  workDomain: string;
  professionalDomain: string;
  resources: ResourceItem[];
}

export const IntelligentConstructionV2: React.FC<IntelligentConstructionProps> = ({ lang, workspaceName, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('selection');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [intentResult, setIntentResult] = useState<{intent: string, entities: string[]}>({ intent: '', entities: [] });
  const [guidingStep, setGuidingStep] = useState<number>(0);
  const [confLevel, setConfLevel] = useState<'high' | 'medium' | 'low'>('high');
  
  // Coordinates (4D)
  const [coordinates, setCoordinates] = useState<Coordinate[]>([
    { dim: '业务域', dimEn: 'Business', val: '开发阶段', conf: 0.95 },
    { dim: '对象域', dimEn: 'Object', val: '水平井 + 含硫井', conf: 0.98 },
    { dim: '工作域', dimEn: 'Work', val: '钻井工程部', conf: 0.55 },
    { dim: '专业域', dimEn: 'Professional', val: '井控安全专业', conf: 0.85 }
  ]);

  // Scopes & MBNs
  const [mbns, setMbns] = useState<MBN[]>([]);
  const [objectScope, setObjectScope] = useState<string[]>([]);
  const [capabilityScope, setCapabilityScope] = useState<CapabilityItem[]>([]);
  
  // Templates
  const [matchedTemplates, setMatchedTemplates] = useState<TemplateItem[]>([]);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const scenarios: Scenario[] = [
    {
      id: 's1',
      title: '高置信度自然语言创建 (全自动)',
      desc: '输入项明确，各维度置信度 ≥ 0.85，系统全自动执行资源推导与生成',
      icon: 'fa-bolt',
      color: 'indigo',
      input: { name: '产量预测分析', object: '胜利油田/采油一厂', description: '分析最近三个月产量变化趋势，预测下月产量' },
      targetStep: 'inference',
      confidences: [0.92, 0.95, 0.90, 0.88]
    },
    {
      id: 's2',
      title: '中置信度创建 (推荐确认)',
      desc: '意图识别存在模糊点，关键维度 0.6 ~ 0.85，引导用户进行一键确认或微调',
      icon: 'fa-hand-pointer',
      color: 'amber',
      input: { name: '设备健康分析', object: '胜利油田/采油一厂', description: '看看设备运行情况' },
      targetStep: 'positioning',
      confidences: [0.72, 0.95, 0.68, 0.70]
    },
    {
      id: 's3',
      title: '低置信度创建 (渐进式引导)',
      desc: '输入信息极简，坐标置信度 < 0.6，进入多步向导动态补全业务维度',
      icon: 'fa-route',
      color: 'rose',
      input: { name: '分析工作空间', object: '胜利油田', description: '做一些分析' },
      targetStep: 'guiding',
      confidences: [0.55, 0.90, 0.45, 0.52]
    },
    {
      id: 's4',
      title: '模板克隆创建 (快速复用)',
      desc: '识别到高度匹配的历史模板，支持一键载入并进行参数化对象动态替换',
      icon: 'fa-copy',
      color: 'emerald',
      input: { name: '月度产量预测', object: '胜利油田/采油二厂', description: '像之前一样做月度产量预测分析' },
      targetStep: 'template',
      confidences: [0.95, 0.92, 0.90, 0.93]
    }
  ];

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    let coords: Coordinate[] = [];
    
    if (scenario.id === 's1') {
      coords = [
        { dim: '业务域', dimEn: 'Business', val: '油田开发', conf: 0.92 },
        { dim: '对象域', dimEn: 'Object', val: '采油厂', conf: 0.95 },
        { dim: '工作域', dimEn: 'Work', val: '分析预测', conf: 0.90 },
        { dim: '专业域', dimEn: 'Professional', val: '油藏工程', conf: 0.88 }
      ];
    } else if (scenario.id === 's2') {
      coords = [
        { dim: '业务域', dimEn: 'Business', val: '设备管理', conf: 0.72 },
        { dim: '对象域', dimEn: 'Object', val: '采油厂', conf: 0.95 },
        { dim: '工作域', dimEn: 'Work', val: '监控分析', conf: 0.68 },
        { dim: '专业域', dimEn: 'Professional', val: '机械工程', conf: 0.70 }
      ];
    } else if (scenario.id === 's3') {
      coords = [
        { dim: '业务域', dimEn: 'Business', val: '未知业务线', conf: 0.35 },
        { dim: '对象域', dimEn: 'Object', val: '胜利油田', conf: 0.90 },
        { dim: '工作域', dimEn: 'Work', val: '待定义', conf: 0.30 },
        { dim: '专业域', dimEn: 'Professional', val: '通用专业', conf: 0.35 }
      ];
    } else if (scenario.id === 's4') {
      coords = [
        { dim: '业务域', dimEn: 'Business', val: '月度产量预测', conf: 0.95 },
        { dim: '对象域', dimEn: 'Object', val: '采油厂', conf: 0.92 },
        { dim: '工作域', dimEn: 'Work', val: '分析预测', conf: 0.90 },
        { dim: '专业域', dimEn: 'Professional', val: '油藏工程', conf: 0.93 }
      ];
    } else {
      coords = [
        { dim: '业务域', dimEn: 'Business', val: scenario.id === 's3' ? '未知业务线' : '设备管理', conf: scenario.confidences[0] },
        { dim: '对象域', dimEn: 'Object', val: scenario.id === 's3' ? '油田' : '采油厂', conf: scenario.confidences[1] },
        { dim: '工作域', dimEn: 'Work', val: scenario.id === 's3' ? '待定义' : '监控分析', conf: scenario.confidences[2] },
        { dim: '专业域', dimEn: 'Professional', val: scenario.id === 's3' ? '通用专业' : '机械工程', conf: scenario.confidences[3] }
      ];
    }
    
    setCoordinates(coords);
    setCurrentStep('parsing');
    setLogs(['初始化模拟场景: ' + scenario.title]);
  };

  // Phase 1: Parsing
  useEffect(() => {
    if (currentStep === 'parsing' && selectedScenario) {
      const texts = selectedScenario.id === 's1' ? [
        '语义解析: [产量趋势 + 预测]',
        '提取时间周期: [最近3个月 + 下次月]',
        '锁定物理对象: [采油一厂]',
        '坐标定位: {BD: 0.92, OD: 0.95, WD: 0.90, PD: 0.88}',
        '判定路径: 高置信度全自动路径'
      ] : selectedScenario.id === 's2' ? [
        '语义解析: [运行情况]',
        '意图匹配: 映射到多个可选子域 (状态监控/故障预警/效率分析)',
        '提取物理对象: [采油一厂]',
        '判定路径: 意图模糊，进入模板推荐与渐进式向导路径'
      ] : selectedScenario.id === 's3' ? [
        '语义解析: [做一些分析]',
        '意图匹配: 极度模糊，未发现明确业务动作或时间周期',
        '提取物理对象: [胜利油田]',
        '坐标定位: BD/WD/PD 维度置信度均低于临界值 (0.6)',
        '判定路径: 进入低置信度渐进式修正向导'
      ] : selectedScenario.id === 's4' ? [
        '语义解析: [月度产量预测]',
        '特征提取: 识别到“复用”关键词“像之前一样”',
        '提取物理对象: [采油二厂]',
        '模板预匹配: 锁定历史高频模板 [月度产量预测分析模板]',
        '判定路径: 模板复用适配路径'
      ] : [
        `正在捕获场景: [${selectedScenario.title}]`,
        `解析输入项: "${selectedScenario.input.description}"`,
        `提取物理对象: ${selectedScenario.input.object}`,
        '映射四域本体坐标系...',
        selectedScenario.id === 's3' ? '坐标置信度偏低，准备进行渐进式引导...' : '语义解析完成，正在进入下一步评估...'
      ];
      
      let i = 0;
      const timer = setInterval(() => {
        if (i < texts.length) {
          setLogs(prev => [...prev, texts[i]]);
          setParsingProgress((i + 1) * (100 / texts.length));
          i++;
        } else {
          clearInterval(timer);
          setIntentResult({
            intent: selectedScenario.id === 's4' ? '月度产量预测分析' : selectedScenario.title,
            entities: [selectedScenario.input.object, '开发阶段', '风险评估']
          });
          setTimeout(() => setCurrentStep('template'), 1000);
        }
      }, 700);
      return () => clearInterval(timer);
    }
  }, [currentStep, selectedScenario]);

  // Phase 2: Template matching
  useEffect(() => {
    if (currentStep === 'template' && selectedScenario) {
      if (selectedScenario.id === 's4') {
        setMatchedTemplates([
          { id: 't-res', name: '月度产量预测分析模板', similarity: 0.92, usage: 156, description: '包含产量历史对比、趋势拟合及未来30天产量预测算法组' },
          { id: 't2', name: '产量分析通用概况模板', similarity: 0.65, usage: 89, description: '基础产量统计与月度汇报表格配置' }
        ]);
      } else if (selectedScenario.id === 's3') {
        setMatchedTemplates([
          { id: 't-none', name: '通用分析概览模板', similarity: 0.35, usage: 12, description: '仅包含基础数据接入，缺乏具体业务逻辑。' }
        ]);
        // For s3, we move to template but immediately show low match and go to positioning/guiding
        setTimeout(() => {
          setLogs(prev => [...prev, '检测到模板匹配度极低 (0.35)，无法直接复用，正在回退至空域坐标定位...']);
          setCoordinates([
             { dim: '业务域', dimEn: 'Business', val: '未定义', conf: 0.35 },
             { dim: '对象域', dimEn: 'Object', val: '胜利油田', conf: 0.90 },
             { dim: '工作域', dimEn: 'Work', val: '未定义', conf: 0.42 },
             { dim: '专业域', dimEn: 'Professional', val: '未定义', conf: 0.31 }
          ]);
          setTimeout(() => {
             setLogs(prev => [...prev, '置信度评估: [业务/工作/专业] 维度缺失显著。启动渐进式向导进行语义对齐...']);
             setConfLevel('low');
             setCurrentStep('guiding');
          }, 1500);
        }, 1500);
      } else if (selectedScenario.id === 's1') {
        setMatchedTemplates([
          { id: 't-low', name: '产量监测基础看板', similarity: 0.65, usage: 42, description: '提供基础的产量报表与曲线展示，暂不支持深度预测推导。' }
        ]);
        // Auto-proceed for s1 because similarity is too low for the user's intent
        setTimeout(() => {
          setLogs(prev => [...prev, '检测到模板匹配度偏低 (0.65)，自动转入基于领域本体的四维坐标定位路径...']);
          setCurrentStep('positioning');
        }, 1500);
      } else if (selectedScenario.id === 's2') {
        setMatchedTemplates([
          { id: 't-eq', name: '设备状态监控模板', similarity: 0.75, usage: 312, description: '提供全站设备运行参数监控及基础健康评估图示' },
          { id: 't2', name: '设备故障诊断知识库模板', similarity: 0.42, usage: 56, description: '侧重于事后故障分析与处理经验沉淀' }
        ]);
      } else {
        setMatchedTemplates([
          { id: 't1', name: '含硫井全业务周期井控模板', similarity: 0.96, usage: 245, description: '包含钻井、采油、地面等全流程井控安全评估与响应机制' },
          { id: 't2', name: '钻井工程风险预警模板', similarity: 0.74, usage: 89, description: '通过历年钻井事故样本，建立实时作业风险预测模型' }
        ]);
      }
    }
  }, [currentStep, selectedScenario]);

  // Phase 3: Positioning & Path Selection
  useEffect(() => {
    if (currentStep === 'positioning' && selectedScenario) {
      const timer = setTimeout(() => {
        const minConf = Math.min(...coordinates.map(c => c.conf));
        
        if (selectedScenario.id === 's1') {
          setLogs(prev => [...prev, '检测到全域高置信度 (≥0.85)，执行全自动构建路径...']);
          setTimeout(() => setCurrentStep('inference'), 1500);
        } else if (selectedScenario.id === 's2') {
          setConfLevel('medium');
          setLogs(prev => [...prev, '检测到维度置信度不足 (业务域: 0.72, 专业域: 0.70)，推荐通过向导进行精度对齐...']);
        } else if (selectedScenario.id === 's3') {
          setConfLevel('low');
          setLogs(prev => [...prev, '各维度置信度均不足，启动分步补全向导...']);
          setTimeout(() => setCurrentStep('guiding'), 1500);
        } else {
           // Default fallback
           if (minConf >= 0.85) setCurrentStep('inference');
           else setCurrentStep('guiding');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, coordinates, selectedScenario]);

  // Phase 4: Inference & Completion (Step 3B-4)
  useEffect(() => {
    if (currentStep === 'inference') {
      const mockResources: ResourceItem[] = [
        { id: 'r1', name: '全周期产量历史数据库', type: 'Data', status: 'required' },
        { id: 'r2', name: '产量预测高阶算法引擎', type: 'Algorithm', status: 'required' },
        { id: 'r3', name: '数据质量自动诊断工具', type: 'Utility', status: 'recommended' },
        { id: 'r4', name: '对象域特征提取模型', type: 'Model', status: 'required' },
        { id: 'r5', name: '月度分析自动生成插件', type: 'Utility', status: 'optional' },
        { id: 'r6', name: '动态趋势可视化中心', type: 'UI', status: 'optional' }
      ];

      setLogs(prev => [...prev, '执行流水线构建...']);
      
      if (selectedScenario?.id === 's1' || (selectedScenario?.id === 's3' && coordinates.find(c => c.dim === '业务域')?.val === '产量')) {
        const t1 = setTimeout(() => {
          setLogs(prev => [...prev, '检索业务节点 [产量预测分析]']);
          const t2 = setTimeout(() => {
            setLogs(prev => [...prev, '自动化挂载物理资源与对象资产...']);
            const t3 = setTimeout(() => {
              setLogs(prev => [...prev, '递归推导依赖关系: [历史数据] -> [模型] -> [预测算子]']);
              const t4 = setTimeout(() => {
                setLogs(prev => [...prev, '资源包补全完成，已自动解决 [含水上升率计算] 模型冲突']);
                setMbns([
                  {
                    id: 'mbn-1',
                    name: selectedScenario?.id === 's3' ? '基于向导补全的产量趋势分析节点' : '采油一厂产量预测与趋势分析节点',
                    objectDomain: '采油厂: 采油一厂',
                    businessDomain: '油田开发',
                    workDomain: '分析预测',
                    professionalDomain: '油藏工程',
                    resources: mockResources
                  }
                ]);
                setObjectScope(['采油厂: 采油一厂', '产量历史库', '算法资源池', '对象元数据']);
                setCapabilityScope([
                  { id: 'c1', name: '产量趋势动态拟合' },
                  { id: 'c2', name: '月度产量智能预测' },
                  { id: 'c3', name: '异常数据诊断' }
                ]);
                setTimeout(() => setCurrentStep('confirmation'), 1200);
              }, 1000);
            }, 1000);
          }, 1000);
        }, 1000);
      } else if (selectedScenario?.id === 's4') {
        const t1 = setTimeout(() => {
          setLogs(prev => [...prev, '执行参数重映射: {对象ID} → 采油二厂']);
          const t2 = setTimeout(() => {
            setLogs(prev => [...prev, '校验采油二厂数据完整性...发现缺失流 [含水率]']);
            const t3 = setTimeout(() => {
              setLogs(prev => [...prev, '适配报告确认: 用户选择跳过缺失节点 [含水波动预警]']);
              const t4 = setTimeout(() => {
                setLogs(prev => [...prev, '资源图谱对等替换完成，生成空间配置环境...']);
                setMbns([
                  {
                    id: 'mbn-s4',
                    name: '采油二厂月度产量预测分析节点',
                    objectDomain: '采油厂: 采油二厂',
                    businessDomain: '产量预测',
                    workDomain: '分析预测',
                    professionalDomain: '油藏工程',
                    resources: mockResources.filter(r => r.id !== 'r2') // Simulate skipping model
                  }
                ]);
                setObjectScope(['采油二厂', '产量数据库', '预测算子组']);
                setCapabilityScope([
                  { id: 'c1', name: '月度产量趋势分析' },
                  { id: 'c2', name: '产量预测值智能推导' }
                ]);
                setTimeout(() => setCurrentStep('confirmation'), 1200);
              }, 1000);
            }, 1000);
          }, 1000);
        }, 1000);
      } else {
        const s2WorkVal = coordinates.find(c => c.dim === '工作域')?.val;
        const timer1 = setTimeout(() => {
          setLogs(prev => [...prev, selectedScenario?.id === 's2' ? `推导 ${s2WorkVal} 所需推理链: [传感器数据] -> [专家库] -> [预警核验]` : '递归推导资源输入依赖: [外部环境] -> [风险引擎]']);
          const timer2 = setTimeout(() => {
            setLogs(prev => [...prev, selectedScenario?.id === 's2' ? '自动化补全: 已挂载 [设备运行知识图谱] 与 [故障根因算子]' : '检测冲突: 无资源冲突。智能补全: 已添加 [质量检查工具]']);
            const timer3 = setTimeout(() => {
              if (selectedScenario?.id !== 's2') {
                setLogs(prev => [...prev, '数据质量检查建议: "建议添加质量检查资源以确保评估准确性"']);
              }
              setMbns([
                {
                  id: 'mbn-1',
                  name: selectedScenario?.id === 's2' ? (s2WorkVal === '故障预警' ? '设备故障预警与诊断节点' : '设备健康分析评估节点') : '通用业务分析节点',
                  objectDomain: selectedScenario?.input.object || '通用对象',
                  businessDomain: coordinates.find(c => c.dim === '业务域')?.val || '常规业务',
                  workDomain: s2WorkVal || '监控分析',
                  professionalDomain: coordinates.find(c => c.dim === '专业域')?.val || '工程技术',
                  resources: selectedScenario?.id === 's2' ? [
                    { id: 'r1', name: '实时生产数据库', type: 'Data', status: 'required' },
                    { id: 'r2', name: '故障预警核验引擎', type: 'Algorithm', status: 'required' },
                    { id: 'r3', name: '专家知识图谱', type: 'Data', status: 'recommended' },
                    { id: 'r4', name: '物理运行仿真模型', type: 'Model', status: 'optional' }
                  ] : mockResources
                }
              ]);
              setObjectScope(selectedScenario?.id === 's2' ? ['采油厂 (主体)', '关键转动设备', '传感监测点', '历史维修记录'] : [selectedScenario?.input.object || '通用对象', '附属设备', '监控资产库']);
              setCapabilityScope(selectedScenario?.id === 's2' ? [
                { id: 'c1', name: '多维参数实时监控' },
                { id: 'c2', name: '故障模式自动识别' },
                { id: 'c3', name: '预警阈值自适应调整' },
                { id: 'c4', name: '维修建议智能生成' }
              ] : [
                { id: 'c1', name: '基础状态监测' },
                { id: 'c2', name: '异常检测算法' },
                { id: 'c3', name: '标准效能评估' }
              ]);
              setTimeout(() => setCurrentStep('confirmation'), 1500);
            }, 800);
          }, 800);
        }, 800);
      }
    }
  }, [currentStep]);

  const handleStartStandardFlow = () => {
    setCurrentStep('positioning');
    setLogs(['正在基于意图解析结果定位 4D 坐标...']);
  };

  const handleCoordinateUpdate = (dim: string, newVal: string) => {
    setCoordinates(prev => prev.map(c => c.dim === dim ? { ...c, val: newVal, conf: 1.0 } : c));
    setLogs(prev => [...prev, `用户手动修正 [${dim}]: ${newVal}, 置信度更新为 1.0`]);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <div className="flex-1 flex overflow-hidden">
        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced Header V2 */}
          <div className="h-20 px-10 border-b border-indigo-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-20">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/30">
                <i className="fas fa-microchip text-white text-xl"></i>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-black tracking-tight text-slate-900">
                    {workspaceName || '智能创建引擎 V2'}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest">
                    AI 驱动
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
                  <i className="fas fa-circle text-[6px] text-emerald-500 animate-pulse"></i>
                  大模型语义映射与配置推理引擎
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex -space-x-2">
                {['A', 'B', 'C'].map(char => (
                  <div key={char} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[11px] font-black text-indigo-400 shadow-sm">
                    {char}
                  </div>
                ))}
              </div>
              <div className="h-8 w-px bg-slate-200" />
              {currentStep !== 'selection' && (
                <button 
                  onClick={() => setCurrentStep('selection')}
                  className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 hover:text-indigo-600 transition-all"
                >
                  <i className="fas fa-th-large"></i>
                  BACK TO SCENARIOS
                </button>
              )}
              <button className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 hover:text-indigo-600 transition-all">
                <i className="fas fa-cog"></i>
                CONFIRMATION
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Phase Tracker */}
            {currentStep !== 'selection' && (
              <div className="w-80 border-r border-indigo-50 bg-white p-8 px-10 flex flex-col gap-14 shrink-0 overflow-y-auto scrollbar-hide">
                <div>
                  <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] mb-8">
                    系统作业流水线
                  </h3>
                  <div className="relative space-y-12">
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100" />
                    {[
                      { id: 'parsing', label: '语意意图深度解析' },
                      { id: 'template', label: '历史空间相似推荐' },
                      { id: 'positioning', label: '四维坐标定位' },
                      { id: 'guiding', label: '渐进式向导' },
                      { id: 'inference', label: '资源推导补全' },
                      { id: 'confirmation', label: '空间组装生成' },
                    ].map((step, idx) => {
                      const isActive = currentStep === step.id;
                      const order = ['parsing', 'template', 'positioning', 'guiding', 'inference', 'confirmation'];
                      const currentIndex = order.indexOf(currentStep);
                      const stepIndex = order.indexOf(step.id);
                      const isCompleted = stepIndex < currentIndex;
                      
                      // Skip display of 'guiding' unless active or already passed
                      if (step.id === 'guiding' && currentIndex < stepIndex && confLevel !== 'low') return null;

                      return (
                        <div key={step.id} className="relative flex items-center gap-5">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all duration-500 z-10 ${
                            isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/40 scale-125' :
                            isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                            'bg-white border-slate-200 text-slate-300'
                          }`}>
                            {isCompleted ? <i className="fas fa-check"></i> : idx + 1}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-xs font-black tracking-tight ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                              {step.label}
                            </span>
                            {isActive && (
                              <span className="text-[9px] text-indigo-400 font-bold uppercase animate-pulse">正在处理...</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-auto p-5 rounded-3xl bg-slate-900 shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
                  <p className="text-[10px] text-indigo-300 leading-relaxed font-mono relative z-10">
                    {'>'} 引擎状态: 正在通过图谱进行子图推理，已发现 152 个关联节点数据...
                  </p>
                </div>
              </div>
            )}

            {/* Dynamic Center Panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <AnimatePresence mode="wait">
                
                {/* Scenario Selection Page */}
                {currentStep === 'selection' && (
                  <motion.div 
                    key="scenario-selection"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex-1 flex flex-col p-16 overflow-y-auto"
                  >
                    <div className="max-w-6xl mx-auto w-full">
                      <div className="mb-20 text-center">
                         <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
                           请选择一个预置场景，体验引擎在不同意图质量下的智能化分级响应策略。
                         </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                        {scenarios.map((s, idx) => (
                          <motion.button 
                            key={s.id}
                            whileHover={{ y: -10, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelectScenario(s)}
                            className="p-10 rounded-[4rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/30 text-left flex flex-col group relative overflow-hidden transition-all duration-500"
                          >
                            <div className={`absolute top-0 right-0 w-56 h-56 bg-${s.color}-500/5 -mr-20 -mt-20 rounded-full group-hover:bg-${s.color}-500/10 transition-all duration-500`} />
                            
                            <div className="flex items-center justify-between mb-10">
                               <div className={`w-20 h-20 rounded-[2.5rem] bg-${s.color}-50 flex items-center justify-center text-3xl text-${s.color}-600 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                  <i className={`fas ${s.icon}`}></i>
                               </div>
                               <div className="flex flex-col items-end gap-1">
                                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">EXAMPLE 0{idx + 1}</span>
                                 <div className={`h-1 w-12 rounded-full bg-${s.color}-500/20 group-hover:w-20 transition-all duration-500`} />
                               </div>
                            </div>

                            {/* Input Details Table Style */}
                            <div className="mb-8 p-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                               <div className="space-y-4">
                                  <div className="flex justify-between items-start gap-4">
                                     <span className="text-[10px] font-black text-slate-400 uppercase shrink-0 mt-1">空间名称</span>
                                     <span className="text-xs font-bold text-slate-700 text-right">{s.input.name}</span>
                                  </div>
                                  <div className="flex justify-between items-start gap-4">
                                     <span className="text-[10px] font-black text-slate-400 uppercase shrink-0 mt-1">对象名称</span>
                                     <span className="text-xs font-bold text-slate-700 text-right">{s.input.object}</span>
                                  </div>
                                  <div className="flex justify-between items-start gap-4">
                                     <span className="text-[10px] font-black text-slate-400 uppercase shrink-0 mt-1">空间描述</span>
                                     <span className="text-xs font-bold text-slate-500 text-right line-clamp-2">{s.input.description}</span>
                                  </div>
                               </div>
                            </div>

                          </motion.button>
                        ))}
                      </div>

                    </div>
                  </motion.div>
                )}

            {currentStep === 'parsing' && (
              <motion.div 
                key="step-parsing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col items-center justify-center p-20"
              >
                <div className="max-w-xl w-full text-center">
                  <div className="relative w-32 h-32 mx-auto mb-10">
                    <div className="absolute inset-0 bg-indigo-600/20 rounded-[2.5rem] animate-ping" />
                    <div className="relative w-full h-full bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-600/40">
                      <i className="fas fa-bolt text-white text-4xl"></i>
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                    业务意图深度捕获
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mb-12">
                    正在基于大模型理解您的空间描述，自动映射领域特征...
                  </p>

                  <div className="bg-slate-900 rounded-[2rem] p-8 text-left shadow-2xl border border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                      </div>
                      <div className="h-3 w-px bg-slate-700" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">会话解析器_v2.0</span>
                    </div>
                    <div className="space-y-4 font-mono text-[11px] h-48 overflow-y-auto scrollbar-hide">
                      {logs.map((log, lIdx) => (
                        <div key={lIdx} className="flex gap-4">
                          <span className="text-slate-600 shrink-0">步骤_{lIdx+1}</span>
                          <span className="text-indigo-400">{log}</span>
                        </div>
                      ))}
                      <div className="flex gap-1 items-center animate-pulse">
                        <span className="text-indigo-500">$</span>
                        <div className="w-2 h-4 bg-indigo-500" />
                      </div>
                      <div ref={logEndRef} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Template Selection */}
            {currentStep === 'template' && (
              <motion.div 
                key="step-template"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 flex flex-col p-16 overflow-y-auto"
              >
                <div className="max-w-5xl mx-auto w-full">
                  <div className="flex items-end justify-between mb-12 border-b border-slate-100 pb-8">
                    <div>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-[0.2em] mb-4 inline-block">
                        相似度检查
                      </span>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        检测到高度匹配的模板
                      </h2>
                      <p className="text-sm text-slate-500 font-medium mt-2">
                        已解析业务意图：
                        <span className="text-indigo-600 font-black">"{intentResult.intent}"</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-black uppercase mb-1">推荐理由</p>
                      <p className="text-xs text-slate-600 font-bold">基于四维坐标与对象关系类比推理</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {matchedTemplates.map((tpl) => (
                      <motion.div 
                        whileHover={{ y: -8 }}
                        key={tpl.id}
                        className="p-8 rounded-[3rem] bg-white border border-slate-200 shadow-sm flex flex-col group cursor-pointer hover:border-indigo-400 transition-all duration-300 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 -mr-16 -mt-16 rounded-full group-hover:bg-indigo-600 group-hover:scale-150 transition-all duration-500" />
                        <div className="relative z-10 flex flex-col h-full">
                          <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                              <i className="fas fa-file-invoice text-xl"></i>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-slate-900 text-white text-[9px] font-black">
                              {Math.round(tpl.similarity * 100)}% 匹配
                            </div>
                          </div>
                          <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tight leading-snug group-hover:text-white transition-colors">
                            {tpl.name}
                          </h3>
                          <p className="text-xs text-slate-500 mb-8 leading-relaxed font-medium group-hover:text-indigo-100 transition-colors">
                            {tpl.description}
                          </p>
                          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-6 group-hover:border-white/20">
                             <span className="text-[10px] font-black text-slate-400 group-hover:text-white/60">已使用 {tpl.usage} 次</span>
                             <button className="text-[10px] font-black text-indigo-600 group-hover:text-white flex items-center gap-1">
                               立即克隆 <i className="fas fa-chevron-right"></i>
                             </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Scenario 4: Template Adaptation Report */}
                  {selectedScenario?.id === 's4' && matchedTemplates.some(t => t.similarity >= 0.9) && (
                      <div className="mb-16 p-10 bg-emerald-50 shadow-xl rounded-[3rem] border border-emerald-100 text-emerald-900 font-sans">
                         <div className="flex items-center gap-4 mb-6">
                           <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                             <i className="fas fa-file-signature"></i>
                           </div>
                           <div>
                             <h4 className="text-base font-black">模板适配性报告 (采油二厂)</h4>
                             <p className="text-xs text-emerald-700 font-medium opacity-80">系统已自动重映射变量: {'{对象ID}'} → 采油二厂</p>
                           </div>
                         </div>
                         
                         <div className="bg-white/50 p-6 rounded-2xl border border-emerald-200/50 mb-6 space-y-3">
                            <p className="text-xs font-bold flex items-center gap-2">
                              <i className="fas fa-exclamation-circle text-amber-500"></i>
                              采油二厂缺少仪表层 [含水率] 实时数据流
                            </p>
                            <p className="text-[11px] text-emerald-700 leading-relaxed">
                              模板中包含的 “高频含水波动预警” 节点将无法正常工作。建议：跳过该子节点或使用 [月度静态含水] 替代。
                            </p>
                         </div>

                         <div className="flex gap-4">
                            <button 
                              onClick={() => {
                                setLogs(prev => [...prev, '用户选择跳过缺失数据节点，重构依赖图谱...']);
                                setCurrentStep('inference');
                              }}
                              className="px-8 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-black shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                            >
                              跳过并确认生成
                            </button>
                            <button 
                              className="px-8 py-3 rounded-2xl bg-white border border-emerald-200 text-emerald-700 text-xs font-black hover:bg-emerald-50 transition-all font-sans"
                            >
                              查看详细替换逻辑
                            </button>
                         </div>
                      </div>
                    )}

                  <div className="flex flex-col items-center p-12 rounded-[4rem] bg-indigo-600 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-indigo-900 opacity-50" />
                    <div className="relative z-10 text-center">
                      <h3 className="text-2xl font-black mb-4 tracking-tight">未找到匹配模板？开启自定义创建</h3>
                      <p className="text-indigo-100 text-sm mb-8 font-medium">大模型将根据您的专属业务上下文，为您从零组装研究空间</p>
                      <button 
                        onClick={handleStartStandardFlow}
                        className="px-12 py-4 bg-white text-indigo-700 rounded-2xl text-sm font-black shadow-xl hover:bg-slate-50 transition-all flex items-center gap-3 active:scale-95"
                      >
                        <i className="fas fa-wand-magic-sparkles"></i>
                        继续自定义智能创建
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3B-1: Positioning & Path Selection */}
            {currentStep === 'positioning' && (
              <motion.div 
                key="step-positioning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col p-16"
              >
                <div className="max-w-4xl mx-auto w-full">
                   <div className="mb-12">
                     <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-[0.2em] mb-4 inline-block">
                       坐标定位
                     </span>
                     <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                       四维坐标定位与置信度评估
                     </h2>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-6 mb-12">
                     {coordinates.map((c, i) => (
                       <div key={i} className={`p-8 rounded-[2.5rem] border-2 transition-all shadow-sm ${c.conf < 0.6 ? 'bg-rose-50 border-rose-200' : c.conf < 0.85 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.dim}</span>
                            <div className={`px-2 py-0.5 rounded text-[9px] font-black ${c.conf < 0.6 ? 'bg-rose-500 text-white' : c.conf < 0.85 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                              置信度 {Math.round(c.conf * 100)}%
                            </div>
                          </div>
                          <div className="text-xl font-black text-slate-900 mb-6">{c.val}</div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${c.conf * 100}%` }}
                               className={`h-full rounded-full ${c.conf < 0.6 ? 'bg-rose-500' : c.conf < 0.85 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                             />
                          </div>
                       </div>
                     ))}
                   </div>

                   {/* Path Selection Feedback */}
                   <div className="bg-slate-900 rounded-[2.5rem] p-10 font-mono text-[12px] shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-[60px]" />
                      <div className="space-y-3 relative z-10">
                        {logs.map((log, i) => (
                          <div key={i} className="flex gap-4">
                            <span className="text-slate-600 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                            <span className="text-white opacity-80">{log}</span>
                          </div>
                        ))}
                        
                        {confLevel === 'medium' && (
                          <div className="mt-8 p-10 bg-white shadow-2xl rounded-[3rem] border border-slate-100 text-slate-900 font-sans">
                             <div className="flex items-center gap-4 mb-6">
                               <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                                 <i className="fas fa-exclamation-triangle"></i>
                               </div>
                               <div>
                                 <h4 className="text-base font-black">检测到中等置信度</h4>
                                 <p className="text-xs text-slate-400 font-medium tracking-tight">意图映射到多个相关业务域，请选择执行路径</p>
                               </div>
                             </div>
                             
                             <div className="flex gap-4">
                                <button 
                                  onClick={() => setCurrentStep('inference')}
                                  className="flex-1 p-6 rounded-3xl bg-indigo-600 text-white text-left hover:bg-indigo-700 transition-all group"
                                >
                                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">路径 A</p>
                                  <h5 className="font-black mb-1">一键确认推荐配置</h5>
                                  <p className="text-[11px] text-white/70">基于历史高频方案，自动补充资源依赖</p>
                                </button>
                                <button 
                                  onClick={() => setCurrentStep('guiding')}
                                  className="flex-1 p-6 rounded-3xl bg-slate-50 border border-slate-200 text-slate-900 text-left hover:bg-slate-100 transition-all group"
                                >
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">路径 B</p>
                                  <h5 className="font-black mb-1">进入渐进式微调</h5>
                                  <p className="text-[11px] text-slate-500">手动修正识别偏差，确保最终配置精准度</p>
                                </button>
                             </div>
                          </div>
                        )}

                        <div className="flex gap-2 items-center animate-pulse pt-4">
                          <span className="text-indigo-500">$</span>
                          <div className="w-2 h-4 bg-indigo-500" />
                        </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {/* Step 3B-3: Progressive Guidance Wizard */}
            {currentStep === 'guiding' && (
              <motion.div 
                key="step-guiding"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 flex flex-col p-16 overflow-y-auto"
              >
                <div className="max-w-4xl mx-auto w-full">
                  <div className="mb-12">
                     <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-lg uppercase tracking-[0.2em] mb-4 inline-block">
                       向导补全 {selectedScenario?.id === 's3' && ` (1/3)`}
                     </span>
                     <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                       渐进式向导：修正低置信度维度
                     </h2>
                     <p className="text-sm text-slate-500 mt-2">系统需要您的进一步指示以确保配置精准度</p>
                  </div>

                  <div className="grid grid-cols-12 gap-10">
                    <div className="col-span-8 space-y-8">
                       <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                              <i className="fas fa-users-cog text-xl"></i>
                            </div>
                            <div>
                               <h4 className="text-sm font-black text-slate-900">
                                 {selectedScenario?.id === 's3' ? '请选择您要分析的业务领域' : '请选择具体工作职责 (工作域)'}
                               </h4>
                               <p className="text-xs text-slate-400 mt-1">系统置信度偏低，需要人工介入校准</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {selectedScenario?.id === 's3' ? [
                              { id: 'bd1', name: '产量', icon: 'fa-chart-line', desc: '关注单井、区块产量的历史统计与未来预测', confidence: 0.95 },
                              { id: 'bd2', name: '设备', icon: 'fa-tools', desc: '关注油气田生产设备的实时状态与故障预警', confidence: 0.92 },
                              { id: 'bd3', name: '油藏', icon: 'fa-water', desc: '关注储层压力、含水率及注水优化策略', confidence: 0.88 },
                              { id: 'bd4', name: '注水', icon: 'fa-tint', desc: '关注注水井组开发效率与动态平衡', confidence: 0.85 },
                            ].map(item => (
                              <button 
                                key={item.id}
                                onClick={() => {
                                  handleCoordinateUpdate('业务域', item.name);
                                  setLogs(prev => [...prev, `[向导 1/3] 已选 [${item.name}] 业务领域，业务域置信度提升至 ${item.confidence * 100}%`]);
                                  // Simulate step 2 and 3 in logs for demo
                                  setTimeout(() => {
                                      setLogs(prev => [...prev, `[向导 2/3] 系统询问分析维度... 用户选择: [采油厂], 对象域置信度提升至 95%`]);
                                      setCoordinates(prev => prev.map(c => c.dim === '对象域' ? { ...c, val: '采油厂', conf: 0.95 } : c));
                                      setTimeout(() => {
                                          setLogs(prev => [...prev, `[向导 3/3] 系统询问分析能力... 用户选择: [趋势分析, 产量预测], 工作域置信度提升至 90%`]);
                                          setLogs(prev => [...prev, `各维度置信度全面达标 (All ≥ 0.85)，退出向导，准备开始流水线推导...`]);
                                          // Update all coordinates for S3 to "high"
                                          setCoordinates([
                                            { dim: '业务域', dimEn: 'Business', val: '产量', conf: 0.95 },
                                            { dim: '对象域', dimEn: 'Object', val: '采油厂', conf: 0.95 },
                                            { dim: '工作域', dimEn: 'Work', val: '分析预测', conf: 0.90 },
                                            { dim: '专业域', dimEn: 'Professional', val: '油藏工程', conf: 0.88 }
                                          ]);
                                          setTimeout(() => setCurrentStep('inference'), 1500);
                                      }, 1200);
                                  }, 1200);
                                }}
                                className={`p-6 rounded-3xl border-2 text-left transition-all group ${coordinates.find(c => c.dim === '业务域')?.val === item.name ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-50 bg-white hover:border-slate-200'}`}
                              >
                                <i className={`fas ${item.icon} text-lg mb-4 ${coordinates.find(c => c.dim === '业务域')?.val === item.name ? 'text-indigo-600' : 'text-slate-300'}`}></i>
                                <h5 className="text-sm font-black text-slate-800 mb-1">{item.name}</h5>
                                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                              </button>
                            )) : [
                              { id: 'wd1', name: '故障预警', icon: 'fa-exclamation-circle', desc: '基于设备运行曲线，提前识别潜在安全隐患', confidence: 0.95 },
                              { id: 'wd2', name: '状态监控', icon: 'fa-video', desc: '实时展示现场生产设备的物理运行参数', confidence: 0.90 },
                              { id: 'wd3', name: '效率分析', icon: 'fa-tachometer-alt', desc: '综合评估设备能效比与运行负荷状态', confidence: 0.88 },
                              { id: 'wd4', name: '维保管理', icon: 'fa-wrench', desc: '负责设备维护计划生成的全流程管控', confidence: 0.85 },
                            ].map(item => (
                              <button 
                                key={item.id}
                                onClick={() => {
                                  handleCoordinateUpdate('工作域', item.name);
                                  if (selectedScenario?.id === 's2' && item.id === 'wd1') {
                                    setLogs(prev => [...prev, `已人工指定工作域为: [故障预警]，系统重构资源依赖图谱...`]);
                                    setCoordinates(prev => prev.map(c => 
                                      c.dim === '工作域' ? { ...c, val: '故障预警', conf: 1.0 } : 
                                      c.dim === '业务域' ? { ...c, val: '设备管理', conf: 0.95 } : 
                                      c.dim === '专业域' ? { ...c, val: '机械工程', conf: 0.92 } : c
                                    ));
                                    setTimeout(() => {
                                      setLogs(prev => [...prev, '置信度全面达标，系统自动进入推导完成阶段。']);
                                      setCurrentStep('inference');
                                    }, 800);
                                  }
                                }}
                                className={`p-6 rounded-3xl border-2 text-left transition-all group ${coordinates.find(c => c.dim === '工作域')?.val === item.name ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-50 bg-white hover:border-slate-200'}`}
                              >
                                <i className={`fas ${item.icon} text-lg mb-4 ${coordinates.find(c => c.dim === '工作域')?.val === item.name ? 'text-indigo-600' : 'text-slate-300'}`}></i>
                                <h5 className="text-sm font-black text-slate-800 mb-1">{item.name}</h5>
                                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                              </button>
                            ))}
                          </div>

                          <div className="mt-12 pt-10 border-t border-slate-100 flex justify-end">
                             <button 
                               onClick={() => setCurrentStep('inference')}
                               className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-600/30 flex items-center gap-2"
                             >
                               一键执行推导
                               <i className="fas fa-chevron-right"></i>
                             </button>
                          </div>
                       </div>
                    </div>

                    <div className="col-span-4 space-y-6">
                       <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                          <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-6">实时坐标对齐</h4>
                          <div className="space-y-4">
                            {coordinates.map((c, i) => (
                              <div key={i} className="flex items-center justify-between group">
                                <div>
                                  <p className="text-[9px] text-white/40 uppercase font-black">{c.dim}</p>
                                  <p className="text-xs font-bold text-white/90">{c.val}</p>
                                </div>
                                <div className={`w-1.5 h-1.5 rounded-full ${c.conf >= 0.85 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                              </div>
                            ))}
                          </div>
                       </div>
                       
                       <div className="p-8 rounded-[2.5rem] bg-indigo-50 border border-indigo-100">
                         <div className="flex items-center gap-3 mb-4">
                           <i className="fas fa-lightbulb text-indigo-500"></i>
                           <h5 className="text-xs font-black text-indigo-700">智能推荐</h5>
                         </div>
                         <p className="text-[11px] text-indigo-600 font-medium leading-relaxed">
                           由于输入提到了“采油一厂”，系统已自动锁定业务域为[生产环节]。建议重点关注后续资源推导中的[实时动态监控]节点。
                         </p>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3B-4: Inference & Completion */}
            {currentStep === 'inference' && (
              <motion.div 
                key="step-inference"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col p-16"
              >
                <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col items-center justify-center">
                   <div className="relative w-48 h-48 mb-16">
                     <div className="absolute inset-0 border-[16px] border-indigo-50 rounded-full" />
                     <div className="absolute inset-0 border-[16px] border-indigo-600 border-t-transparent rounded-full animate-spin" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <i className={`fas fa-project-diagram text-4xl text-indigo-600`}></i>
                     </div>
                     <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-[9px] font-black rounded-lg">
                        推理中...
                     </div>
                   </div>

                   <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                     资源推导与补全
                   </h2>
                   <p className="text-sm text-slate-500 mb-12">正在基于确定的坐标定位，递归推导所需资源图谱</p>
                   
                   <div className="w-full grid grid-cols-3 gap-6 mb-12">
                      {[
                        { label: '图谱推导', val: '深度 4 层', icon: 'fa-network-wired', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: '关系扫描', val: '1,248 节点', icon: 'fa-microscope', color: 'text-sky-600', bg: 'bg-sky-50' },
                        { label: '输入依赖', val: '14 项对齐', icon: 'fa-link', color: 'text-purple-600', bg: 'bg-purple-50' },
                      ].map((stat, si) => (
                        <div key={si} className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm text-center">
                          <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg`}>
                            <i className={`fas ${stat.icon}`}></i>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                          <p className="text-sm font-black text-slate-900">{stat.val}</p>
                        </div>
                      ))}
                   </div>

                   <div className="w-full bg-slate-900 rounded-[2.5rem] p-10 font-mono text-[12px] shadow-2xl relative overflow-hidden h-64">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-[60px]" />
                      <div className="space-y-4 relative z-10 scrollbar-hide overflow-y-auto h-full">
                        {logs.slice(-10).map((log, i) => (
                          <div key={i} className="flex gap-4">
                            <span className="text-slate-600 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                            <span className={log?.includes('建议') ? 'text-amber-400 italic' : 'text-white opacity-80'}>{log}</span>
                          </div>
                        ))}
                        <div className="flex gap-2 items-center animate-pulse">
                          <span className="text-indigo-500">$</span>
                          <div className="w-2 h-4 bg-indigo-500" />
                        </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Confirmation Layout */}
            {currentStep === 'confirmation' && (
              <motion.div 
                key="step-confirmation"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col p-16 overflow-y-auto"
              >
                <div className="max-w-7xl mx-auto w-full">
                  <div className="flex items-center justify-between mb-12">
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        全景配置确认
                      </h2>
                      <p className="text-base text-slate-500 font-medium mt-2">
                        基于四域定位自动组装的最小业务节点与关联资源
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">空间就绪度</p>
                          <p className="text-xl font-black text-emerald-500">98.5%</p>
                       </div>
                       <button 
                        onClick={onComplete}
                        className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center gap-3 active:scale-95"
                      >
                        立即开启空间
                        <i className="fas fa-rocket"></i>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Left: Resource Directory Tree (Framed as Device) */}
                    <div className="lg:col-span-4">
                      <div className="bg-[#f0f2f5] rounded-[3rem] p-6 shadow-sm border border-slate-200/50 aspect-[9/16] max-h-[800px] sticky top-10">
                        <div className="bg-white rounded-[2.5rem] shadow-inner h-full flex flex-col p-8 overflow-hidden relative">
                          <div className="flex items-center justify-between mb-8 shrink-0">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              资源关联目录
                            </h4>
                            <i className="fas fa-search text-slate-300 text-xs"></i>
                          </div>

                          {/* Tree Structure */}
                          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pr-2">
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-3 text-indigo-900/70">
                                <i className="fas fa-chevron-down text-[8px]"></i>
                                <div className="w-4 h-4 border border-indigo-200 rounded flex items-center justify-center bg-white">
                                  <div className="w-2.5 h-2.5 bg-indigo-500/10 rounded-sm border border-indigo-300" />
                                </div>
                                <i className="fas fa-map-marker-alt text-indigo-500 text-xs"></i>
                                <span className="text-xs font-semibold">勘探 (6903)</span>
                              </div>

                              <div className="ml-5 flex flex-col gap-4 border-l border-indigo-50 pl-4 py-1">
                                <div className="flex items-center gap-3 text-indigo-900/70">
                                  <i className="fas fa-chevron-down text-[8px]"></i>
                                  <div className="w-4 h-4 border border-indigo-200 rounded flex items-center justify-center bg-white shadow-sm">
                                      <div className="w-2.5 h-2.5 bg-indigo-500/20 rounded-sm border border-indigo-400" />
                                  </div>
                                  <i className="fas fa-map-marker-alt text-indigo-500 text-xs"></i>
                                  <span className="text-xs font-semibold underline underline-offset-4 decoration-indigo-200">勘探-作业 (251)</span>
                                </div>

                                <div className="ml-5 flex flex-col gap-5 border-l border-indigo-50 pl-4 py-1">
                                  {[
                                    { label: '勘探-作业-油气田', count: 42, active: true },
                                    { label: '勘探-作业-区域', count: 7 },
                                    { label: '勘探-作业-组织机构', count: 6 },
                                    { label: '勘探-作业-地震工区', count: 22 },
                                    { label: '勘探-作业-非地震工区', count: 6 },
                                    { label: '勘探-作业-地震线条', count: 8 },
                                    { label: '勘探-作业-区块', count: 15 },
                                    { label: '勘探-作业-剖面线', count: 17 },
                                    { label: '勘探-作业-井筒', count: 83 },
                                    { label: '勘探-作业-井', count: 45 },
                                  ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 group cursor-pointer transition-all">
                                      <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${item.active ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white group-hover:border-indigo-400'}`}>
                                         {item.active && <div className="w-2 h-2 bg-indigo-500 rounded-sm" />}
                                      </div>
                                      <i className="fas fa-map-marker-alt text-indigo-400/60 text-xs"></i>
                                      <span className="text-[11px] font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">
                                        {item.label} ({item.count})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Inner Shine Effect */}
                          <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] ring-1 ring-inset ring-white/20" />
                        </div>
                      </div>
                    </div>

                    {/* Right: MBN Detail & Capsule Resources */}
                    <div className="lg:col-span-8 flex flex-col gap-14">
                       
                       {/* MBN Detail Header Card (Indigo Gradient) */}
                       {mbns.map((mbn) => (
                          <div key={mbn.id} className="flex flex-col gap-14">
                            <div className="p-14 rounded-[3.5rem] bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-2xl shadow-indigo-900/40 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40" />
                              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-[80px] -ml-32 -mb-32" />
                              
                              <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                    <i className="fas fa-project-diagram text-xs"></i>
                                  </div>
                                  <span className="text-[10px] font-black tracking-[0.2em] text-indigo-100">MINIMUM BUSINESS NODE</span>
                                </div>
                                
                                <h4 className="text-3xl font-black tracking-tight leading-snug">{mbn.name}</h4>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                  {[
                                    { label: '对象域', val: mbn.objectDomain, icon: 'fa-cube' },
                                    { label: '业务域', val: mbn.businessDomain, icon: 'fa-history' },
                                    { label: '工作域', val: mbn.workDomain, icon: 'fa-users-cog' },
                                    { label: '专业域', val: mbn.professionalDomain, icon: 'fa-graduation-cap' }
                                  ].map((dim, di) => (
                                    <div key={di} className="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-colors group cursor-default">
                                      <div className="text-[9px] font-black text-indigo-200 uppercase mb-3 flex items-center gap-2">
                                        <i className={`fas ${dim.icon} opacity-60 group-hover:opacity-100 transition-opacity`}></i>
                                        {dim.label}
                                      </div>
                                      <div className="text-[11px] font-bold leading-relaxed">{dim.val}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Resource Capsule List */}
                            <div className="space-y-6">
                               <div className="flex items-center justify-between px-2 mb-8">
                                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                                     挂载资源清单
                                  </h4>
                                  <span className="text-[10px] text-slate-400 font-bold">已发现 {mbn.resources.length} 项资源</span>
                               </div>

                               <div className="flex flex-col gap-5">
                                  {mbn.resources.map((res, ri) => (
                                    <motion.div 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: ri * 0.05 }}
                                      key={res.id} 
                                      className="p-3 bg-[#e2e4e7] rounded-full flex items-center justify-between border border-white/40 shadow-sm group hover:scale-[1.01] transition-all"
                                    >
                                      <div className="flex items-center gap-6">
                                         <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm relative overflow-hidden">
                                            <div className="absolute inset-0 bg-slate-50 opacity-50" />
                                            <i className={`fas ${
                                               res.type === 'Data' ? 'fa-database text-sky-500' :
                                               res.type === 'Algorithm' ? 'fa-code-branch text-indigo-500' :
                                               res.type === 'Model' ? 'fa-microchip text-purple-500' :
                                               'fa-puzzle-piece text-slate-500'
                                            } text-xl relative z-10`}></i>
                                         </div>
                                         <div className="py-2">
                                            <h5 className="text-lg font-bold text-slate-800 leading-tight">{res.name}</h5>
                                            <div className="flex items-center gap-4 mt-1">
                                              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{res.type} 资源</span>
                                              <div className="w-1 h-1 rounded-full bg-slate-300" />
                                              <span className="text-[9px] text-slate-400 font-black uppercase">置信度 0.99</span>
                                            </div>
                                         </div>
                                      </div>
                                      <button className="mr-4 px-8 py-3 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg shadow-black/10">
                                         必选
                                      </button>
                                    </motion.div>
                                  ))}
                               </div>
                            </div>
                          </div>
                       ))}
                    </div>

                       {/* Extra Context / Analytics Summary Footer */}
                       <div className="lg:col-span-12 bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl mt-10">
                          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
                          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />
                          
                          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-16">
                             <div className="space-y-4">
                                <h5 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                                   <div className="w-1 h-1 rounded-full bg-indigo-400" />
                                   对象覆盖范围
                                </h5>
                                <div className="text-2xl font-black tracking-tight">{objectScope[0] || selectedScenario?.input.object || '含硫水平井群'}</div>
                                <div className="flex flex-wrap gap-2">
                                  {objectScope.slice(1, 4).map((tag, i) => (
                                    <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-white/60">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                             </div>
                             
                             <div className="space-y-4">
                                <h5 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                                   <div className="w-1 h-1 rounded-full bg-emerald-400" />
                                   资源聚合规模
                                </h5>
                                <div className="text-2xl font-black tracking-tight">{mbns.reduce((acc, m) => acc + m.resources.length, 0)} 项关联资产</div>
                                <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                                   包含 {capabilityScope.length} 项核心业务能力，已完成 100% 依赖性冲突校验
                                </p>
                             </div>

                             <div className="space-y-4">
                                <h5 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                                   <div className="w-1 h-1 rounded-full bg-amber-400" />
                                   空间定位校验
                                </h5>
                                <div className="text-2xl font-black tracking-tight">四域映射对齐</div>
                                <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                                   BD-OD-WD-PD 坐标集置信度峰值: 0.98 <br />
                                   已挂载节点: {mbns[0]?.name || '默认业务节点'}
                                </p>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  </div>
</div>
);
};
