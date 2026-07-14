import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, History, Lightbulb, ChevronRight, Send, ShieldCheck, Plus } from 'lucide-react';

interface AssistantSidebarProps {
  lang: 'zh' | 'en';
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentStatus?: 'Running' | 'Idle' | 'Stopped' | 'Error';
  mode?: 'fixed' | 'absolute';
  offsetTop?: string;
  onRefreshAgent?: () => void;
}

export const AssistantSidebar: React.FC<AssistantSidebarProps> = ({ 
  lang, 
  isOpen, 
  onClose,
  agentName,
  agentStatus,
  mode = 'fixed',
  offsetTop = 'top-16',
  onRefreshAgent
}) => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ 
    sender: 'user' | 'assistant'; 
    text: string; 
    wordReport?: { id: string; title: string; size: string; time: string };
  }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      setMessages([]);
      setChatInput('');
      setIsTyping(false);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  const recommendedQuestions = (agentName.includes('产量') || agentName.includes('Decline') || agentName.includes('well_decline'))
    ? (lang === 'zh' 
        ? [
            "依据诊断结果，推荐当前最佳治理措施",
            "对比相似井的治理效果与经验",
            "生成单井诊断优化报告"
          ]
        : [
            "Recommend the best treatment based on diagnosis",
            "Compare treatment results and experience of offset wells",
            "Generate single well decline optimization report"
          ]
      )
    : (agentName.includes('成图') || agentName.includes('Mapping'))
    ? (lang === 'zh'
        ? [
            "一键美化图件样式",
            "调整图层显示设置",
            "删除不需要的图层"
          ]
        : [
            "Beautify chart style with one click",
            "Adjust layer display settings",
            "Remove unnecessary layers"
          ]
      )
    : (agentName.includes('勘探') || agentName.includes('Exploration'))
    ? (lang === 'zh'
        ? [
            "分析目标区的油气成藏潜力",
            "评估当前勘探目标的资源量",
            "建议钻探部署顺序"
          ]
        : [
            "Analyze oil and gas accumulation potential",
            "Assess resource volume of exploration targets",
            "Recommend drilling sequence"
          ]
      )
    : (lang === 'zh'
        ? [
            "生成本周生产运行简报",
            "优化当前钻井方案并补充针对性的技术措施",
            "请检查当前报告中是否存在地质风险遗漏？",
            "请总结一下关键地质认识和主要设计建议"
          ]
        : [
            "Generate weekly production operation brief",
            "Optimize drilling plan and add technical measures",
            "Check for missing geological risks in current report",
            "Summarize key geological insights and design suggestions"
          ]
      );

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setIsTyping(true);

    // Simulate smart analysis and trigger refresh of the middle workspace/agent
    setTimeout(() => {
      let reply = '';
      let isWeeklyReport = false;
      
      if (agentName.includes('成图') || agentName.includes('Mapping')) {
        if (userText.includes('美化')) {
          reply = lang === 'zh' 
            ? "已成功为您一键美化图件样式！本次优化自动调整了配色方案、增加了曲线平滑度并优化了图道边距。中间的成图区域已自动重新载入刷新，请查看最新效果。"
            : "Successfully beautified the chart style for you! This optimization automatically adjusted the color scheme, increased curve smoothness, and optimized track margins. The central mapping area has refreshed automatically.";
        } else if (userText.includes('显示') || userText.includes('设置')) {
          reply = lang === 'zh'
            ? "图层显示设置已调整。我们重新优化了各个图层的叠加层次和显示对比度，确保地学特征一目了然。中间的成图区域已自动重新加载刷新。"
            : "Layer display settings adjusted. We optimized the stack order and contrast of each layer to ensure geological features are perfectly visible. The central mapping area has refreshed.";
        } else if (userText.includes('删除')) {
          reply = lang === 'zh'
            ? "已在后台为您精简并删除了不必要的冗余图层，使整体柱状图更具可读性。成图结果已重构并自动刷新展示。"
            : "Unnecessary redundant layers have been removed in the background, making the overall columnar chart highly readable. The mapping result has been reconstructed and refreshed.";
        } else {
          reply = lang === 'zh'
            ? `收到关于“${userText}”的优化指令。专业成图引擎已完成参数调整与图件重构，中间的智能体成图显示区域已自动刷新！`
            : `Received optimization command for "${userText}". The pro mapping engine has updated parameters and reconstructed the chart. The central rendering area has refreshed automatically!`;
        }
      } else if (agentName.includes('产量') || agentName.includes('Decline') || agentName.includes('well_decline')) {
        if (userText.includes('措施')) {
          reply = lang === 'zh'
            ? "根据当前的单井生产及物理诊断结果，推荐优先进行“高能气体压裂+酸化解堵”联合治理措施。预计可提升日产液量15%以上。主诊断与治理流程已完成重新加载刷新！"
            : "Based on the production and physical diagnosis, we recommend combined 'High-energy Gas Fracturing + Acidizing' measures. Daily production is expected to increase by over 15%. The main diagnosis and treatment workflow has refreshed!";
        } else if (userText.includes('相似')) {
          reply = lang === 'zh'
            ? "已在邻井数据库中成功检索到3口具有相似产量下降特征（层段含水上升、压力衰减）的对比井。治理经验及对比分析模块已为您重新加载刷新！"
            : "Successfully retrieved 3 offset wells with similar decline patterns (water-cut rise, pressure depletion) in the database. The treatment experience and comparison module has refreshed!";
        } else if (userText.includes('报告')) {
          reply = lang === 'zh'
            ? "已自动为您生成并输出详尽的“单井产量下降诊断与治理优化报告.pdf”。诊断主界面与分析看板已同步更新刷新！"
            : "Detailed 'Single Well Decline Diagnosis & Treatment Optimization Report.pdf' has been generated. The main dashboard and analysis panels have synchronized and refreshed!";
        } else {
          reply = lang === 'zh'
            ? `收到关于“${userText}”的诊断优化请求。诊断引擎已重新调取测井与生产历史数据进行综合运算，中间诊断仪表盘已自动刷新！`
            : `Received diagnosis optimization request for "${userText}". The engine has re-fetched logging and production histories. The central dashboard has refreshed automatically!`;
        }
      } else {
        // Report or Geo-Design Expert or General Mode
        if (userText.includes('生成本周生产运行简报') || userText.includes('生产运行简报')) {
          reply = lang === 'zh'
            ? "本周（2024年4月10日-4月16日）生产运行简报已生成。全区整体生产稳中有升，日产达成率超计划 2.5%。您可以点击下方卡片进行实时预览和深度编辑。"
            : "Weekly production operation brief has been generated. The overall production is steady with a 2.5% increase over plan. Click below to preview and edit.";
          isWeeklyReport = true;
        } else if (userText.includes('方案') || userText.includes('措施')) {
          reply = lang === 'zh'
            ? "方案优化建议已成功应用！我们调整了三开井段的钻井液密度安全窗口（1.15g/cm³ - 1.25g/cm³），并增加了断层破碎带随钻防漏失段落。报告文档内容已自动刷新。"
            : "Optimization advice applied! Adjusted the mud density safety window (1.15-1.25g/cm³) for the 3rd section and added on-the-fly mud loss prevention for fault zones. The report has refreshed.";
        } else if (userText.includes('风险') || userText.includes('遗漏')) {
          reply = lang === 'zh'
            ? "经过全面合规性安全扫描，已为您识别出邻区存在高压水淹层风险。报告的地质设计与安全预案章节已自动补充该条地质风险分析并重构刷新。"
            : "Safety scan complete. Identified a high-pressure flooded layer risk in the adjacent zone. Geological design and risk mitigation chapters have been updated and refreshed with this analysis.";
        } else if (userText.includes('总结') || userText.includes('建议')) {
          reply = lang === 'zh'
            ? "已将最新的关键地质认识（分层界线微调、储层含油性复核）与主要设计建议（一开套管加深至210m）深度融合进报告的结论与建议章节。报告已自动刷新。"
            : "Fused the latest geo-cognition (formation boundary micro-tuning, oil saturation check) and casing advice (1st stage casing deepened to 210m) into the conclusions. The report has refreshed.";
        } else {
          reply = lang === 'zh'
            ? `收到关于“${userText}”的修改指令。钻井地质设计专家Agent已在后台重构了对应段落，中间报告编辑/预览页面已自动刷新！`
            : `Received editing command for "${userText}". The expert agent has rewritten the corresponding sections in the background, and the report preview has refreshed automatically!`;
        }
      }

      setMessages(prev => [...prev, { 
        sender: 'assistant', 
        text: reply,
        wordReport: isWeeklyReport ? {
          id: 'report-weekly-001',
          title: lang === 'zh' ? '本周生产运行简报_20240416.docx' : 'Weekly_Production_Operation_Brief_20240416.docx',
          size: '1.4 MB',
          time: '刚刚'
        } : undefined
      }]);
      setIsTyping(false);

      // Trigger the refresh of the central agent running area!
      if (onRefreshAgent) {
        onRefreshAgent();
      }
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ x: 384 }}
          animate={{ x: 0 }}
          exit={{ x: 384 }}
          transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
          className={`${mode === 'fixed' ? `fixed right-0 ${offsetTop} bottom-0` : `absolute right-0 ${offsetTop} bottom-0`} w-96 bg-white border-l border-slate-200 shadow-[-10px_0_35px_rgba(0,0,0,0.03)] z-[40] flex flex-col`}
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between bg-white border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-800">
                {lang === 'zh' ? '智能助手' : 'Smart Assistant'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setMessages([]);
                    setChatInput('');
                    setIsTyping(false);
                  }}
                  title={lang === 'zh' ? '新建会话' : 'New Chat'} 
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <History className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center py-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4 animate-bounce">
                  <Bot className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-2">
                  {lang === 'zh' ? '我是您的专业数字助手' : 'I am your professional digital assistant'}
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mb-8">
                  {lang === 'zh' 
                    ? '您可以随时向我提问，或者点击下方推荐问题开始交流。我会协助您自动调整、优化中间的智能体运行任务。'
                    : 'Feel free to ask me questions, or click a recommended question below to begin. I will assist you in adjusting and optimizing the central agent running task.'}
                </p>
                
                {/* Recommended Questions */}
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-2 text-slate-500 mb-2 px-1">
                    <Lightbulb className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider">
                      {lang === 'zh' ? '你可能想问' : 'You might want to ask'}
                    </h3>
                  </div>
                  {recommendedQuestions.map((q, i) => (
                    <button 
                      key={i}
                      onClick={() => setChatInput(q)}
                      className="w-full text-left p-4 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center justify-between hover:shadow-sm transition-all group"
                    >
                      <span className="text-xs text-slate-700 font-medium line-clamp-2">{q}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender !== 'user' && (
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex flex-col gap-2 max-w-[80%]">
                      <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        msg.sender === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none leading-relaxed'
                      }`}>
                        {msg.text}
                      </div>
                      {msg.wordReport && (
                        <div 
                          className="mt-1 p-3 bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/25 rounded-xl flex items-center gap-3 transition-all cursor-pointer group shadow-sm"
                          onClick={() => {
                            const event = new CustomEvent('preview-report', { detail: msg.wordReport });
                            window.dispatchEvent(event);
                          }}
                        >
                          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
                            <i className="fas fa-file-word text-lg"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-850 truncate">{msg.wordReport.title}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{msg.wordReport.size}</span>
                              <span>•</span>
                              <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                                <i className="fas fa-eye text-[8px]"></i> {lang === 'zh' ? '预览' : 'Preview'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-slate-500 flex items-center gap-1 shadow-sm">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce [animation-delay:0.2s]">●</span>
                      <span className="animate-bounce [animation-delay:0.4s]">●</span>
                      <span className="text-xs ml-2 text-slate-400">
                        {lang === 'zh' ? '正在处理并更新中间运行区域...' : 'Processing and refreshing middle area...'}
                      </span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
                
                {/* Compact Recommended Questions when messages exist */}
                <div className="pt-6 border-t border-slate-200/60 mt-4 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block px-1">
                    {lang === 'zh' ? '继续提问：' : 'Keep asking:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {recommendedQuestions.map((q, i) => (
                      <button 
                        key={i}
                        onClick={() => setChatInput(q)}
                        className="text-xs px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-full text-slate-600 hover:text-indigo-600 transition-all text-left truncate max-w-full"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Chat Input */}
          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="relative">
              <textarea 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={lang === 'zh' ? '输入你的问题，我会尽力为你解答...' : 'Enter your question, I will do my best to answer...'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pr-14 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all resize-none"
                rows={3}
              />
              <button 
                onClick={handleSend}
                disabled={!chatInput.trim() || isTyping}
                className="absolute right-3 bottom-3 w-10 h-10 bg-indigo-500 text-white rounded-lg shadow-lg flex items-center justify-center hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:hover:bg-indigo-500"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? 'AI生成内容仅供参考' : 'AI-generated content is for reference only'}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
