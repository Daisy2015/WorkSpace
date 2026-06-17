import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ReportGenerationAgentProps {
  lang: 'zh' | 'en';
  config: any;
  onComplete: () => void;
}

type ChapterStatus = 'completed' | 'running' | 'pending' | 'warning' | 'error';

interface ChapterNode {
  id: string;
  title: string;
  level: number;
  status: ChapterStatus;
  content?: string;
  warning?: string;
  resources?: string[];
  processLogs?: string[];
}

export const ReportGenerationAgent: React.FC<ReportGenerationAgentProps> = ({ 
  lang, 
  config,
  onComplete 
}) => {
  const [chapters, setChapters] = useState<ChapterNode[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [selectedStatusChapterId, setSelectedStatusChapterId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  
  const contentRef = useRef<HTMLDivElement>(null);
  const activeChapterRef = useRef<HTMLDivElement>(null);

  // Initialize chapters
  useEffect(() => {
    if (config?.outline) {
      const initialChapters: ChapterNode[] = config.outline.map((node: any) => ({
        id: node.id,
        title: node.title,
        level: node.level,
        status: 'pending',
        resources: node.selectedMBUs?.map((m: any) => m.name || m.id) || [],
        processLogs: []
      }));
      setChapters(initialChapters);
    }
  }, [config]);

  const suggestedQuestions = [
    lang === 'zh' ? '当前地层预测的精度如何？' : 'What is the accuracy of the current stratigraphic prediction?',
    lang === 'zh' ? '报告中引用的邻井资料有哪些？' : 'Which offset well data is referenced in the report?',
    lang === 'zh' ? '针对资料不足的章节，建议如何补充？' : 'How should missing data for incomplete chapters be addressed?',
  ];

  const renderRichContent = (chapterTitle: string, index: number) => {
    if (index === 0) {
      return `
        <div class="mb-6 overflow-hidden border border-slate-100 rounded-xl">
          <table class="min-w-full divide-y divide-slate-100">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">${lang === 'zh' ? '参数名称' : 'Parameter'}</th>
                <th class="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">${lang === 'zh' ? '预测值' : 'Predicted'}</th>
                <th class="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">${lang === 'zh' ? '单位' : 'Unit'}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr><td class="px-4 py-2 text-[11px] font-bold text-slate-600">设计井深</td><td class="px-4 py-2 text-[11px] text-slate-500">3500.00</td><td class="px-4 py-2 text-[11px] text-slate-400">m</td></tr>
              <tr><td class="px-4 py-2 text-[11px] font-bold text-slate-600">目的层段</td><td class="px-4 py-2 text-[11px] text-slate-500">长6</td><td class="px-4 py-2 text-[11px] text-slate-400">-</td></tr>
              <tr><td class="px-4 py-2 text-[11px] font-bold text-slate-600">预测压降</td><td class="px-4 py-2 text-[11px] text-slate-500">2.41</td><td class="px-4 py-2 text-[11px] text-slate-400">MPa</td></tr>
            </tbody>
          </table>
        </div>
      `;
    }
    if (index === 2) {
        return `
            <div class="my-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                <div class="w-full h-32 flex items-end gap-2 mb-4 px-10">
                    <div class="flex-1 bg-indigo-500/10 border-t-2 border-indigo-500 h-[60%]"></div>
                    <div class="flex-1 bg-indigo-500/20 border-t-2 border-indigo-500 h-[80%]"></div>
                    <div class="flex-1 bg-indigo-500/10 border-t-2 border-indigo-500 h-[45%]"></div>
                    <div class="flex-1 bg-indigo-500/30 border-t-2 border-indigo-500 h-[95%]"></div>
                    <div class="flex-1 bg-indigo-500/10 border-t-2 border-indigo-500 h-[30%]"></div>
                </div>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${lang === 'zh' ? '图 3.1: 地层压力梯度演化模拟图' : 'Fig 3.1: Stratigraphic Pressure Gradient Simulation'}</span>
            </div>
        `;
    }
    return '';
  };

  // Simulation Logic
  useEffect(() => {
    if (chapters.length === 0) return;

    const runSimulation = async () => {
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        setActiveChapterId(chapter.id);
        
        setChapters(prev => prev.map(c => c.id === chapter.id ? { ...c, status: 'running', processLogs: [lang === 'zh' ? '正在连接资源中心...' : 'Connecting to resources...'] } : c));
        
        await new Promise(resolve => setTimeout(resolve, 800));
        setChapters(prev => prev.map(c => c.id === chapter.id ? { ...c, processLogs: [...(c.processLogs || []), lang === 'zh' ? '提取专业上下文并对齐中...' : 'Extracting and aligning context...'] } : c));

        const mockTexts = [
          lang === 'zh' ? '依据钻井基础设计要求，结合区块地质特征，本次设计重点关注地层划分的连续性与构造形态的稳定性。邻井资料分析显示，区域内长6层段发育稳定，厚度集中在20-35m之间。' : 'According to drilling design requirements and block geology, this design focuses on stratigraphic continuity. Offset well analysis shows stable development in the Chang 6 segment.',
          lang === 'zh' ? `针对${config.well?.name || '井：长庆XX-1井'}的工程目标，通过对比XX-2、XX-3井的测井曲线，精准锁定了目的层段的顶底界面，预测误差控制在合理范围内。` : `For the engineering objectives of ${config.well?.name || 'Well: Changqing XX-1'}, precision locking of top/bottom interfaces was achieved via target offset logs.`,
          lang === 'zh' ? '正在调用地层预测MBU进行深度拟合。当前模拟结果显示，地层界面起伏较为平缓，局部存在微幅度构造形变。建议在钻进过程中加强随钻监测。' : 'Calling stratigraphic prediction MBU for depth fitting. Current simulation shows gentle stratigraphic fluctuations with minor local structural deformation.',
          lang === 'zh' ? '通过多源数据融合分析，明确了目标区块的储层展布规律。储层平均孔隙度预测为12.4%，属于低孔低渗储层，需匹配相应的提产增产工艺。' : 'Fusion analysis determined reservoir distribution patterns. Average porosity predicted at 12.4%, typical low porosity and permeability behavior.',
        ];
        
        const baseText = mockTexts[i % mockTexts.length];
        const richExtra = renderRichContent(chapter.title, i);
        const fullContent = (i % 2 === 0 ? richExtra : '') + baseText + (i % 2 !== 0 ? richExtra : '');

        for (let charIdx = 0; charIdx <= baseText.length; charIdx++) {
          setStreamingText(baseText.substring(0, charIdx));
          await new Promise(resolve => setTimeout(resolve, 15));
          
          if (isAutoScroll && activeChapterRef.current) {
            activeChapterRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }
        }

        // Finish chapter
        const isWarning = chapter.title.includes('储层') || i === 3;
        setChapters(prev => prev.map(c => 
          c.id === chapter.id 
            ? { 
                ...c, 
                status: isWarning ? 'warning' : 'completed', 
                content: fullContent,
                warning: isWarning ? (lang === 'zh' ? '缺少 XX-3 井测井资料，已基于企业规范及邻井物性分布统计生成基础预测内容。' : 'Missing XX-3 log data, generated basic predictions based on enterprise standards and offset distributions.') : undefined,
                processLogs: [...(c.processLogs || []), lang === 'zh' ? '章节生成校验通过。' : 'Chapter generation verified.']
              } 
            : c
        ));
        setStreamingText('');
        setProgress(Math.floor(((i + 1) / chapters.length) * 100));
        
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      setActiveChapterId(null);
    };

    runSimulation();
  }, [chapters.length, lang]);

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* 顶部标题区 */}
      <div className="h-16 px-8 flex items-center justify-between border-b border-slate-100 z-30">
        <div className="flex items-center gap-6">
          <h2 className="text-sm font-black text-slate-800 tracking-wider">
            {lang === 'zh' ? '钻井地质设计报告智能生成系统' : 'Drilling Geo Design Report Agent'}
          </h2>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold ${
              activeChapterId ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${activeChapterId ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              {activeChapterId ? (lang === 'zh' ? '正在编写' : 'Processing') : (lang === 'zh' ? '已完成' : 'Completed')}
            </div>
            {activeChapterId && (
              <div className="flex items-center gap-2">
                 <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${progress}%` }} className="h-full bg-indigo-500" />
                 </div>
                 <span className="text-[10px] font-black text-indigo-600 tabular-nums">{progress}%</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
              isAssistantOpen ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'
            }`}
            title={lang === 'zh' ? '问答助手' : 'Chat Assistant'}
          >
            <i className="fas fa-robot text-lg"></i>
          </button>
          <div className="w-px h-6 bg-slate-100 mx-1"></div>
          <button 
            disabled={progress < 100}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
               progress === 100 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
            }`}
          >
            <i className="fas fa-save"></i>
            {lang === 'zh' ? '成果保存' : 'Save'}
          </button>
          <button 
            onClick={onComplete}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* 左侧目录 */}
        <motion.div 
            initial={false}
            animate={{ width: isSidebarOpen ? 320 : 0, opacity: isSidebarOpen ? 1 : 0 }}
            className="bg-[#f8f9fa] border-r border-slate-200 flex flex-col overflow-hidden"
        >
          <div className="p-6 flex-1 flex flex-col min-w-[320px]">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{lang === 'zh' ? '报告大纲' : 'OUTLINE'}</h3>
            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2">
                {chapters.map((chapter, idx) => (
                <div key={chapter.id} className="relative">
                    <div 
                    onClick={() => {
                        document.getElementById(`doc-chapter-${chapter.id}`)?.scrollIntoView({ behavior: 'smooth' });
                        setIsAutoScroll(false);
                    }}
                    style={{ paddingLeft: `${(chapter.level - 1) * 16 + 12}px` }}
                    className={`group flex items-start gap-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                        activeChapterId === chapter.id ? 'bg-white shadow-sm ring-1 ring-slate-200 border-white' : 'hover:bg-slate-100 border-transparent'
                    } border`}
                    >
                    <span className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">{idx + 1}.</span>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                        <span className={`text-[12px] truncate ${
                            activeChapterId === chapter.id ? 'font-black text-slate-900' : 'font-bold text-slate-600'
                        }`}>
                            {chapter.title}
                        </span>
                        <button 
                            onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStatusChapterId(selectedStatusChapterId === chapter.id ? null : chapter.id);
                            }}
                            className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                            chapter.status === 'completed' ? 'text-emerald-500 hover:bg-emerald-50' :
                            chapter.status === 'warning' ? 'text-amber-500 hover:bg-amber-50' :
                            chapter.status === 'running' ? 'text-indigo-600' :
                            'text-slate-300'
                            }`}
                        >
                            {chapter.status === 'completed' && <i className="fas fa-check-circle"></i>}
                            {chapter.status === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
                            {chapter.status === 'running' && <i className="fas fa-circle-notch fa-spin text-[10px]"></i>}
                            {chapter.status === 'pending' && <i className="far fa-circle text-[10px]"></i>}
                        </button>
                        </div>
                    </div>
                    </div>

                    {/* 状态详情卡片 */}
                    <AnimatePresence>
                    {selectedStatusChapterId === chapter.id && (
                        <motion.div 
                        initial={{ opacity: 0, x: 10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.95 }}
                        className="absolute left-[105%] top-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-40"
                        >
                        <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{lang === 'zh' ? '智能体运行详情' : 'AGENT DETAILS'}</h4>
                            <button onClick={() => setSelectedStatusChapterId(null)} className="text-slate-300 hover:text-slate-600"><i className="fas fa-times text-[10px]"></i></button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '生成过程' : 'PROCESS'}</span>
                            <div className="space-y-2">
                                {chapter.processLogs?.map((log, lidx) => (
                                    <div key={lidx} className="flex gap-2 text-[10px] text-slate-500 leading-relaxed font-medium">
                                    <span className="text-indigo-400 mt-0.5"><i className="fas fa-check text-[7px]"></i></span>
                                    <span>{log}</span>
                                    </div>
                                ))}
                                {chapter.status === 'running' && (
                                    <div className="flex gap-2 text-[10px] text-indigo-500 font-bold italic animate-pulse">
                                    <i className="fas fa-sync fa-spin text-[8px] mt-0.5"></i>
                                    <span>{lang === 'zh' ? '正在编写并检索知识库...' : 'Writing & Retrieving...'}</span>
                                    </div>
                                )}
                            </div>
                            </div>

                            {chapter.status === 'warning' && (
                            <div className="pt-2 border-t border-slate-50">
                                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">{lang === 'zh' ? '待关注的问题' : 'DETECTED ISSUES'}</span>
                                <div className="mt-2 p-2.5 bg-amber-50 rounded-xl text-[10px] text-amber-700 leading-normal font-medium border border-amber-100/50">
                                    {chapter.warning}
                                </div>
                            </div>
                            )}
                        </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
                ))}
            </div>
          </div>
        </motion.div>

        {/* 右侧正文区域 */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#f0f2f5]">
            {/* Sidebar toggle button - Fixed relative to the content area */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="absolute top-6 left-6 w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:shadow-md transition-all z-40"
            >
                <i className={`fas ${isSidebarOpen ? 'fa-indent' : 'fa-outdent'}`}></i>
            </button>

            <div className="flex-1 py-12 px-8 overflow-y-auto custom-scrollbar" ref={contentRef}>
                <div className="max-w-[840px] mx-auto bg-white min-h-[1180px] shadow-xl p-20 relative">
              
                    {/* 文档装饰 */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>
                    
                    {/* 文档头 */}
                    <div className="text-center mb-32 space-y-8">
                        <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">{lang === 'zh' ? '钻井地质设计报告' : 'Drilling Geo Design Report'}</h1>
                        <div className="w-16 h-1 bg-slate-200 mx-auto rounded-full"></div>
                        <div className="flex justify-center gap-10 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            <div className="flex flex-col items-center gap-1">
                                <span className="opacity-50">{lang === 'zh' ? '目标井号' : 'WELL ID'}</span>
                                <span className="text-slate-600">{config.well?.name || '长庆XX-1井'}</span>
                            </div>
                            <div className="w-px h-8 bg-slate-100"></div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="opacity-50">{lang === 'zh' ? '文件版本' : 'VERSION'}</span>
                                <span className="text-slate-600">V1.0.0 DRAFT</span>
                            </div>
                            <div className="w-px h-8 bg-slate-100"></div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="opacity-50">{lang === 'zh' ? '日期' : 'DATE'}</span>
                                <span className="text-slate-600">{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* 章节流 */}
                    <div className="space-y-16">
                        {chapters.map((chapter, idx) => (
                        <div 
                            key={chapter.id} 
                            id={`doc-chapter-${chapter.id}`}
                            ref={activeChapterId === chapter.id ? activeChapterRef : null}
                            className="relative"
                        >
                            <div className="mb-8">
                                <h2 className={`${chapter.level === 1 ? 'text-2xl font-bold border-b border-slate-100 pb-4' : 'text-lg font-bold'} text-slate-900 mb-6 flex items-baseline gap-4`}>
                                <span className="text-slate-300 font-serif italic text-3xl">{idx + 1}</span>
                                {chapter.title}
                                </h2>
                            </div>

                            <div className="text-slate-700 text-[15px] leading-[1.8] text-justify space-y-6 font-medium px-4">
                                {chapter.status === 'pending' && (
                                <div className="py-12 flex flex-col items-center gap-4 text-slate-200">
                                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                                        {lang === 'zh' ? '等待智能体生成...' : 'WAITING FOR AGENT'}
                                    </span>
                                </div>
                                )}

                                {chapter.content && (
                                <div dangerouslySetInnerHTML={{ __html: chapter.content.replace(/\n/g, '<br/>') }} className="prose prose-slate max-w-none prose-sm" />
                                )}

                                {activeChapterId === chapter.id && (
                                <div className="relative p-6 bg-indigo-50/20 rounded-2xl border border-indigo-100/30">
                                    <span className="whitespace-pre-wrap">{streamingText}</span>
                                    <motion.span 
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.8 }}
                                    className="inline-block w-1.5 h-4 bg-indigo-600 ml-1 translate-y-0.5"
                                    />
                                </div>
                                )}
                                
                                {chapter.status === 'warning' && (
                                <div className="mt-8 p-6 border-l-4 border-amber-400 bg-amber-50/30 rounded-r-2xl shadow-sm">
                                    <h4 className="text-[11px] font-black text-amber-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <i className="fas fa-exclamation-triangle"></i>
                                        {lang === 'zh' ? '业务偏差提示' : 'BUSINESS ALERT'}
                                    </h4>
                                    <p className="text-xs text-amber-700/80 leading-relaxed italic">{chapter.warning}</p>
                                </div>
                                )}
                            </div>
                        </div>
                        ))}
                    </div>

                    {/* 页脚 */}
                    <div className="mt-40 pt-10 border-t border-slate-50 text-center">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.4em] mb-2">
                            CONFIDENTIAL — MBU INTELLIGENCE WORKSPACE
                        </p>
                        <p className="text-[8px] text-slate-300">
                            Document identification: 2024-DR-001 | Powered by Gemini Multimodal Agent
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* 右侧助手侧边栏 */}
        <AnimatePresence>
          {isAssistantOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white border-l border-slate-200 flex flex-col overflow-hidden relative shadow-2xl"
            >
              <div className="flex-1 flex flex-col min-w-[320px]">
                {/* 助手头部 */}
                <div className="p-6 border-b border-slate-50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">
                        <i className="fas fa-robot"></i>
                      </div>
                      <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{lang === 'zh' ? '运行中智能体' : 'RUNNING AGENT'}</span>
                    </div>
                    <button onClick={() => setIsAssistantOpen(false)} className="text-slate-300 hover:text-slate-600">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-2">
                    <h4 className="text-[12px] font-black text-indigo-600 mb-1">{lang === 'zh' ? '钻井地质设计智能助手' : 'Drilling Geo Design AI'}</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                      {lang === 'zh' ? '我是当前正在执行报告编制的智能助手。您可以随时向我询问报告生成的细节或相关业务逻辑。' : 'I am the AI assistant currently preparing your report. Ask me about generation details or business logic.'}
                    </p>
                  </div>
                </div>

                {/* 推荐问题与对话区 */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  <div>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{lang === 'zh' ? '推荐问题' : 'SUGGESTED'}</h5>
                    <div className="space-y-2">
                      {suggestedQuestions.map((q, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setChatInput(q)}
                          className="w-full text-left p-3 rounded-xl bg-indigo-50/30 border border-indigo-100/50 hover:bg-indigo-50 transition-all text-[11px] font-bold text-indigo-700 leading-normal"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-50">
                     <div className="flex flex-col items-center justify-center py-10 opacity-30">
                        <i className="fas fa-comments text-2xl text-slate-300 mb-2"></i>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'zh' ? '暂无对话记录' : 'NO HISTORY'}</span>
                     </div>
                  </div>
                </div>

                {/* 输入框 */}
                <div className="p-6 border-t border-slate-100 bg-white">
                  <div className="relative">
                    <textarea 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={lang === 'zh' ? '在此输入您的问题...' : 'Type your question...'}
                      className="w-full h-24 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                    />
                    <button className="absolute bottom-3 right-3 w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                      <i className="fas fa-paper-plane text-[10px]"></i>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* 底部悬浮控制 */}
      <div className="fixed bottom-10 right-12 flex gap-3 z-30">
        <button 
          onClick={() => setIsAutoScroll(!isAutoScroll)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-2xl hover:scale-105 active:scale-95 ${
            isAutoScroll ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          <i className={`fas ${isAutoScroll ? 'fa-eye' : 'fa-eye-slash'}`}></i>
          {lang === 'zh' ? '跟随编写' : 'Auto Follow'}
        </button>
      </div>
    </div>
  );
};
