
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { translations } from '../i18n';

interface IntelligentConstructionProps {
  lang: Language;
  workspaceName?: string;
  onComplete?: () => void;
}

interface LogEntry {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

interface Stage {
  id: number;
  title: string;
  titleEn: string;
  status: 'pending' | 'processing' | 'completed';
  progress: number;
  duration: string;
  reasoning: string[];
}

export const IntelligentConstruction: React.FC<IntelligentConstructionProps> = ({ lang, workspaceName, onComplete }) => {
  const t = translations[lang];
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [discoveredResources, setDiscoveredResources] = useState({
    objects: ['A1井', 'B2井'],
    neighbors: ['A2', 'A3', 'B1'],
    documents: 12,
    figures: 5,
    knowledgeNodes: 24
  });

  const [stages, setStages] = useState<Stage[]>([
    { 
      id: 1, 
      title: '模板匹配', 
      titleEn: 'Template Matching', 
      status: 'pending', 
      progress: 0, 
      duration: '1.2s',
      reasoning: ['匹配到《地质设计模板》', '识别出业务上下文：钻井工程', '置信度：0.98']
    },
    { 
      id: 2, 
      title: 'I/O补全', 
      titleEn: 'I/O Completion', 
      status: 'pending', 
      progress: 0, 
      duration: '0.8s',
      reasoning: ['自动补全输入参数：井深、地层压力', '推断输出需求：邻井对比表', '来源：历史空间']
    },
    { 
      id: 3, 
      title: '子图构建', 
      titleEn: 'Subgraph Construction', 
      status: 'pending', 
      progress: 0, 
      duration: '2.5s',
      reasoning: ['抽取关联实体：15个', '构建关系边：42条', '知识图谱检索：成功']
    },
    { 
      id: 4, 
      title: '类比推荐', 
      titleEn: 'Analogy Recommendation', 
      status: 'pending', 
      progress: 0, 
      duration: '1.5s',
      reasoning: ['检索到相似方案：2个', '推荐理由：地层特征重合度85%', '来源：专家经验库']
    },
  ]);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const runProcess = async () => {
      for (let i = 0; i < stages.length; i++) {
        setCurrentStageIdx(i);
        
        // Update stage to processing
        setStages(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'processing' } : s));
        
        // Add start log
        addLog(`开始执行阶段：${lang === 'zh' ? stages[i].title : stages[i].titleEn}...`, 'info');

        // Simulate progress
        for (let p = 0; p <= 100; p += 10) {
          await new Promise(resolve => setTimeout(resolve, 400));
          setStages(prev => prev.map((s, idx) => idx === i ? { ...s, progress: p } : s));
          
          if (p === 30) {
            if (i === 0) addLog('正在识别业务边界 (BCM)...', 'info');
            if (i === 1) addLog('正在扫描输入输出接口...', 'info');
            if (i === 2) addLog('正在从知识图谱抽取关联子图...', 'info');
            if (i === 3) addLog('正在计算方案相似度...', 'info');
          }
          if (p === 70) {
            if (i === 0) addLog(`已匹配模板: ${lang === 'zh' ? '地质设计' : 'Geological Design'}`, 'success');
            if (i === 1) addLog('参数补全完成，置信度 95%', 'success');
            if (i === 2) addLog('子图构建完成，发现 15 个关联实体', 'success');
            if (i === 3) addLog('推荐相似方案 2 个', 'success');
          }
        }

        // Update stage to completed
        setStages(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'completed', progress: 100 } : s));
        addLog(`${lang === 'zh' ? stages[i].title : stages[i].titleEn} 执行完毕，耗时 ${stages[i].duration}`, 'success');
        
        // Update resources incrementally
        if (i === 0) setDiscoveredResources(prev => ({ ...prev, objects: ['A1井', 'B2井', 'C3井'] }));
        if (i === 2) setDiscoveredResources(prev => ({ ...prev, knowledgeNodes: 45, neighbors: ['A2', 'A3', 'B1', 'B2', 'C1'] }));
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      addLog('智能构建过程全部完成！', 'success');
      setIsFinished(true);
    };

    runProcess();
  }, []);

  const addLog = (text: string, type: LogEntry['type']) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setLogs(prev => [...prev, newLog]);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Header */}
      <div className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <i className="fas fa-magic text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {workspaceName || (lang === 'zh' ? '智能构建过程' : 'Intelligent Construction Process')}
            </h1>
            <p className="text-xs text-slate-500">
              {lang === 'zh' ? '正在为您构建智能研究空间...' : 'Building your intelligent workspace...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isFinished ? (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="px-6 py-2 rounded-xl bg-green-600 text-white text-sm font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all flex items-center gap-2"
            >
              <i className="fas fa-check-circle"></i>
              {lang === 'zh' ? '进入完成预览' : 'Enter Completion Preview'}
            </motion.button>
          ) : (
            <div className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              {lang === 'zh' ? '实时构建中' : 'Live Constructing'}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden p-8 gap-8">
        
        {/* Left: Stage Flow */}
        <div className="w-96 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {lang === 'zh' ? '阶段流程' : 'Stage Flow'}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
              {currentStageIdx + 1} / {stages.length}
            </span>
          </div>
          
          <div className="flex flex-col gap-4">
            {stages.map((stage, idx) => (
              <motion.div 
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-5 rounded-2xl border transition-all duration-500 ${
                  stage.status === 'processing' 
                    ? 'bg-white border-blue-500 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/20' 
                    : stage.status === 'completed'
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-slate-100/50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500 ${
                      stage.status === 'completed' ? 'bg-green-100 text-green-600' : 
                      stage.status === 'processing' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 
                      'bg-slate-200 text-slate-500'
                    }`}>
                      {stage.status === 'completed' ? <i className="fas fa-check"></i> : stage.id}
                    </div>
                    <span className={`font-bold text-sm ${stage.status === 'processing' ? 'text-blue-600' : 'text-slate-800'}`}>
                      {lang === 'zh' ? stage.title : stage.titleEn}
                    </span>
                  </div>
                  {stage.status === 'completed' && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{stage.duration}</span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.progress}%` }}
                    className={`h-full rounded-full transition-colors duration-500 ${
                      stage.status === 'completed' ? 'bg-green-500' : 'bg-blue-600'
                    }`}
                  />
                </div>

                {/* Reasoning Basis (Expandable) */}
                <AnimatePresence>
                  {stage.status !== 'pending' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          {lang === 'zh' ? '推理依据' : 'Reasoning Basis'}
                        </span>
                        {stage.reasoning.map((r, rIdx) => (
                          <div key={rIdx} className="flex items-start gap-2">
                            <i className="fas fa-info-circle text-[10px] text-blue-400 mt-1 shrink-0"></i>
                            <span className="text-[11px] text-slate-600 leading-relaxed">{r}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Middle: Real-time Logs */}
        <div className="flex-1 flex flex-col bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl relative">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="h-4 w-px bg-slate-800 mx-1" />
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                {lang === 'zh' ? '构建过程日志' : 'Construction Logs'}
              </h3>
            </div>
            <div className="px-2 py-1 rounded bg-slate-800 text-[9px] text-slate-400 font-mono">
              TTY: /dev/pts/0
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 font-mono scrollbar-hide">
            <div className="flex flex-col gap-2.5">
              {logs.map((log) => (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-4 text-[11px] group"
                >
                  <span className="text-slate-600 shrink-0 select-none">{log.timestamp}</span>
                  <span className={`shrink-0 font-bold ${
                    log.type === 'success' ? 'text-emerald-400' : 
                    log.type === 'warning' ? 'text-amber-400' : 
                    log.type === 'error' ? 'text-rose-400' : 
                    'text-sky-400'
                  }`}>
                    [{log.type.toUpperCase()}]
                  </span>
                  <span className={`${
                    log.type === 'success' ? 'text-slate-200' : 'text-slate-400'
                  }`}>
                    {log.text}
                  </span>
                </motion.div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

          {/* Terminal Overlay Gradient */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent pointer-events-none" />
        </div>

        {/* Right: Discovered Resources */}
        <div className="w-96 flex flex-col gap-8">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {lang === 'zh' ? '已构建资源' : 'Constructed Resources'}
            </h3>
          </div>

          {/* Resource Cards */}
          <div className="flex flex-col gap-6">
            
            {/* Objects */}
            <div className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner">
                  <i className="fas fa-cube text-lg"></i>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '核心对象' : 'Core Objects'}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{discoveredResources.objects.length} {lang === 'zh' ? '个已识别' : 'identified'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {discoveredResources.objects.map((obj, idx) => (
                  <motion.span 
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 font-medium shadow-sm"
                  >
                    {obj}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Neighbors */}
            <div className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                  <i className="fas fa-network-wired text-lg"></i>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '邻井关联' : 'Neighbor Wells'}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{discoveredResources.neighbors.length} {lang === 'zh' ? '个已关联' : 'linked'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {discoveredResources.neighbors.map((n, idx) => (
                  <motion.span 
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 font-medium shadow-sm"
                  >
                    {n}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-2">
                <span className="text-[14px] font-bold text-blue-600">{discoveredResources.documents}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{lang === 'zh' ? '关联文档' : 'Documents'}</span>
              </div>
              <div className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-2">
                <span className="text-[14px] font-bold text-green-600">{discoveredResources.figures}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{lang === 'zh' ? '图件资源' : 'Figures'}</span>
              </div>
              <div className="col-span-2 p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm flex items-center justify-between px-8">
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-indigo-600">{discoveredResources.knowledgeNodes}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{lang === 'zh' ? '知识图谱节点' : 'KG Nodes'}</span>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
