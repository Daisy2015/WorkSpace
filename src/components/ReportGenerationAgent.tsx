import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ReportGenerationAgentProps {
  lang: 'zh' | 'en';
  config: any;
  onCloseAgent: () => void;
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
  onCloseAgent
}) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isFollowMode, setIsFollowMode] = useState(true);
  const [chapters, setChapters] = useState<ChapterNode[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [highlightedChapterId, setHighlightedChapterId] = useState<string | null>(null);
  const [hoveredChapterId, setHoveredChapterId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  const objectName = config.well?.name || config.projectName || (lang === 'zh' ? '未命名工区' : 'Unnamed Block');

  // Initialize Chapters
  useEffect(() => {
    const defaultChapters: ChapterNode[] = [
      { 
        id: '1', title: lang === 'zh' ? '第一章 基础信息' : 'Chapter 1: Basic Info', level: 1, content: '', status: 'pending',
        fullContentText: lang === 'zh' 
          ? `${objectName}位于鄂尔多斯盆地XX区块，设计井深3500m，井别为评价井。该井主要勘探目的层为长6段，旨在评价区域含油气性及储层发育状况。本井由分公司承担钻探任务，预计于2026年第三季度开钻。`
          : `${objectName} is located in Ordos Basin, with a designed depth of 3500m. It is an appraisal well targeting the Chang 6 member.`
      },
      { 
        id: '1-1', title: lang === 'zh' ? '1.1 井基本情况' : '1.1 Well Basic Specs', level: 2, content: '', status: 'pending',
        fullContentText: lang === 'zh'
          ? '设计井身结构采用三开程序，一开封隔表层松散地层，二开进入主要含油层段，三开完钻并进行试油评价。钻井流体设计采用水基聚合物体系，以满足井壁稳定及环境保护要求。'
          : 'The well structure adopts a 3-stage program using water-based polymer system for drilling fluids.'
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
  }, [lang, objectName]);

  // Simulation Logic
  useEffect(() => {
    if (chapters.length === 0 || hasStarted.current) return;
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
    };

    runSimulation();
  }, [chapters.length]);

  useEffect(() => {
    if (isFollowMode && isGenerating && contentRef.current) {
        const container = contentRef.current;
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [isGenerating, isFollowMode]);

  const scrollToActiveChapter = (id: string, isSmooth = true) => {
    const el = document.getElementById(`doc-chapter-${id}`);
    const container = contentRef.current;
    if (el && container) {
        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Use the relative position of the writing head in the container
        const elementBottom = rect.bottom - containerRect.top;
        const viewportHeight = containerRect.height;
        
        // Threshold: Keep the "cursor" at about 70% of the screen height
        if (elementBottom > viewportHeight * 0.7) {
            const scrollAmount = elementBottom - (viewportHeight * 0.7);
            container.scrollBy({ 
                top: scrollAmount, 
                behavior: isSmooth ? 'smooth' : 'auto' 
            });
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
    scrollToChapterTop(id);
    setHighlightedChapterId(id);
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
               {objectName}{lang === 'zh' ? ' 钻井地质设计报告' : ' Drilling Geology Design'}.docx
             </h1>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-all" title={lang === 'zh' ? '下载' : 'Download'}>
              <i className="fas fa-download"></i>
            </button>
            <button 
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-all" 
              title={lang === 'zh' ? '全屏' : 'Fullscreen'}
            >
              <i className="fas fa-expand"></i>
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-all font-bold" title={lang === 'zh' ? '保存' : 'Save'}>
              <i className="fas fa-floppy-disk"></i>
            </button>
          </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Directory Sidebar */}
        <AnimatePresence>
          {isSidebarVisible && (
            <motion.div 
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              className="w-72 flex flex-col bg-white border-r border-slate-200 shadow-sm z-20"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '文档大纲' : 'OUTLINE'}</span>
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

              <div className="p-6 border-t border-slate-100 bg-slate-50/30">
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
          <div ref={contentRef} className="report-content-scroll-container flex-1 overflow-y-auto px-12 pt-4 pb-64 custom-scrollbar bg-slate-100/50">
            <div className="max-w-[816px] mx-auto bg-white shadow-xl min-h-[1056px] p-24 relative mb-20 ring-1 ring-slate-200">
              {/* Report Cover Elements */}
              <div className="text-center mb-32 space-y-6">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  {lang === 'zh' ? '钻井地质设计报告' : 'Drilling Geology Design Report'}
                </h1>
                <div className="w-32 h-1.5 bg-indigo-600 mx-auto rounded-full"></div>
                <div className="pt-4 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{objectName}</div>
              </div>

              <div className="space-y-16">
                {chapters.map((chapter) => {
                  const isWriting = activeChapterId === chapter.id;
                  const isHighlight = highlightedChapterId === chapter.id;
                  const showsContent = chapter.status !== 'pending' || isWriting;
                  const isH1 = chapter.level === 1;

                  return (
                    <motion.div 
                      id={`doc-chapter-${chapter.id}`}
                      key={chapter.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ 
                        opacity: 1, y: 0,
                        backgroundColor: isHighlight ? 'rgb(254 249 195)' : 'transparent'
                      }}
                      onMouseEnter={() => setHoveredChapterId(chapter.id)}
                      onMouseLeave={() => setHoveredChapterId(null)}
                      className="relative rounded-2xl p-4 -mx-4 transition-colors duration-1000 cursor-default"
                    >
                      {isH1 ? (
                        <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight border-b-2 border-slate-900/5 pb-4">
                          {chapter.title}
                        </h2>
                      ) : (
                        <h3 className="text-sm font-black text-slate-500 mb-6 uppercase tracking-[0.1em]">
                          {chapter.title}
                        </h3>
                      )}
                      
                      {showsContent && (
                        <div className="text-[17px] leading-[1.8] text-slate-700 font-medium text-justify">
                          {chapter.content}
                          {isWriting && (
                            <motion.span 
                              animate={{ opacity: [1, 0] }}
                              transition={{ repeat: Infinity, duration: 0.8 }}
                              className="inline-block w-1.5 h-6 bg-indigo-600 ml-1 translate-y-1"
                            />
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Persistent Completion Status Bar */}
          <AnimatePresence>
              {isCompleted && (
                  <motion.div 
                      initial={{ y: 80 }} animate={{ y: 0 }}
                      className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-10 py-5 bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl"
                  >
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-xl">
                          <i className="fas fa-file-circle-check"></i>
                      </div>
                      <div>
                          <h4 className="text-sm font-black text-slate-900 leading-none mb-1.5">{lang === 'zh' ? '报告编制全面完成' : 'Generation Complete'}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '文档已自动校对并归档至资源树' : 'Auto-audited & Archived'}</p>
                      </div>
                      <button onClick={onCloseAgent} className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[11px] font-black hover:bg-black transition-all">
                          {lang === 'zh' ? '退出协作空间' : 'Finish Session'}
                      </button>
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
