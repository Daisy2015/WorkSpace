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
  externalLogs?: Array<{ 
    sender: 'user' | 'assistant'; 
    text: string; 
    wordReport?: { id: string; title: string; size: string; time: string };
    sourceInfo?: { docName: string; chapter: string };
  }>;
}

export const AssistantSidebar: React.FC<AssistantSidebarProps> = ({ 
  lang, 
  isOpen, 
  onClose,
  agentName,
  agentStatus,
  mode = 'fixed',
  offsetTop = 'top-16',
  onRefreshAgent,
  externalLogs
}) => {
  const isDocQaAgent = agentName.includes('文档') || agentName.includes('问答') || agentName.includes('Doc') || agentName.includes('QA');

  const defaultDocQaMessages: Array<{ 
    sender: 'user' | 'assistant'; 
    text: string; 
    wordReport?: { id: string; title: string; size: string; time: string };
    sourceInfo?: { docName: string; chapter: string };
  }> = [
    {
      sender: 'user',
      text: '合同中关于付款条款的具体约定是什么？'
    },
    {
      sender: 'assistant',
      text: '根据《原油采购合同》第4章“付款条件”的约定，付款相关条款如下：\n\n1. 付款方式：采用电汇方式支付；\n2. 付款期限：买方应在收到卖方提交的符合合同约定的发票后30个工作日内完成付款；\n3. 结算币种：本合同采用美元（USD）结算。',
      sourceInfo: {
        docName: '原油采购合同.docx',
        chapter: '第4章 付款条件'
      }
    }
  ];

  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ 
    sender: 'user' | 'assistant'; 
    text: string; 
    wordReport?: { id: string; title: string; size: string; time: string };
    sourceInfo?: { docName: string; chapter: string };
  }>>(() => isDocQaAgent ? defaultDocQaMessages : []);

  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (externalLogs && externalLogs.length > 0) {
      setMessages(externalLogs);
    } else if (isDocQaAgent && messages.length === 0) {
      setMessages(defaultDocQaMessages);
    }
  }, [externalLogs, isDocQaAgent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  const rawRecommendedQuestions = isDocQaAgent
    ? (lang === 'zh'
        ? [
            "这份合同的付款方式和期限是什么",
            "合同中约定的违约责任有哪些？",
            "供应商的主要义务有哪些？",
            "合同的结算币种和金额如何约定？",
            "如何解除或终止本合同？"
          ]
        : [
            "What are the payment terms and deadlines in this contract?",
            "What liabilities for breach of contract are specified?",
            "What are the main obligations of the supplier?",
            "How are settlement currency and amount agreed upon?",
            "How can this contract be terminated?"
          ]
      )
    : (agentName.includes('产量') || agentName.includes('Decline') || agentName.includes('well_decline'))
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
    : (agentName.includes('校核') || agentName.includes('Check') || agentName.includes('audit') || agentName.includes('审查'))
    ? (lang === 'zh'
        ? [
            "优先检查井身结构和井控章节",
            "不要使用V3版本数据，切换至最新V4",
            "仅校核技术参数与工程一致性"
          ]
        : [
            "Prioritize casing structure and well control sections",
            "Do not use V3 data; switch to latest V4",
            "Check technical parameters and engineering consistency only"
          ]
      )
    : (lang === 'zh'
        ? [
            "生成本周生产运行简报",
            "优化当前钻井方案并补充针对性的技术措施",
            "请检查当前报告中是否存在地质风险遗漏？"
          ]
        : [
            "Generate weekly production operation brief",
            "Optimize drilling plan and add technical measures",
            "Check for missing geological risks in current report"
          ]
      );

  const recommendedQuestions = rawRecommendedQuestions.slice(0, 3);

  const handleSendQuestion = (questionText: string) => {
    if (!questionText.trim()) return;
    const userText = questionText.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      let sourceInfo: { docName: string; chapter: string } | undefined = undefined;
      let isWeeklyReport = false;

      if (isDocQaAgent) {
        if (userText.includes('付款方式') || userText.includes('付款') || userText.includes('期限')) {
          reply = "根据《原油采购合同》第4章“付款条件”的约定，付款相关条款如下：\n\n1. 付款方式：采用电汇方式支付；\n2. 付款期限：买方应在收到卖方提交的符合合同约定的发票后30个工作日内完成付款；\n3. 结算币种：本合同采用美元（USD）结算。";
          sourceInfo = { docName: '原油采购合同.docx', chapter: '第4章 付款条件' };
        } else if (userText.includes('违约责任') || userText.includes('违约')) {
          reply = "根据《原油采购合同》第7章“违约责任”约定：\n\n1. 逾期交付：卖方若未按时交货，每逾期一日应按迟延部分货款的0.05%支付违约金；\n2. 质量不达标：买方有权拒绝收货并要求卖方在7日内退换或补足；\n3. 累计违约金上限为合同总金额的10%。";
          sourceInfo = { docName: '原油采购合同.docx', chapter: '第7章 违约责任' };
        } else if (userText.includes('义务') || userText.includes('供应商')) {
          reply = "根据《原油采购合同》第3章“卖方义务”约定：\n\n1. 按时完成原油品质化验并提供出厂合格证明；\n2. 配合买方完成海关报关及运输节点对接；\n3. 确保交付原油符合国家标准及合同附件技术规范。";
          sourceInfo = { docName: '原油采购合同.docx', chapter: '第3章 卖方义务' };
        } else if (userText.includes('结算币种') || userText.includes('金额')) {
          reply = "根据《原油采购合同》第4.3条约定：\n\n1. 本合同结算币种为美元（USD）；\n2. 最终发票开具金额按照离岸价（FOB）乘实际到货提单数量计算。";
          sourceInfo = { docName: '原油采购合同.docx', chapter: '第4章 付款条件 4.3' };
        } else if (userText.includes('解除') || userText.includes('终止')) {
          reply = "根据《原油采购合同》第8章“合同变更与解除”约定：\n\n1. 双方协商一致可以书面形式解除合同；\n2. 因不可抗力导致合同目的无法实现超60日的，任何一方均有权解除合同；\n3. 一方严重违约致使合同无法继续履行的，守约方有权单方发出解除通知。";
          sourceInfo = { docName: '原油采购合同.docx', chapter: '第8章 合同变更与解除' };
        } else {
          reply = `针对您提出的“${userText}”，智能问答引擎已检索了当前关联的合同文档，结果如下：\n\n经核查相关章节条款，文中明确规定了对应的业务规范与操作要求，请结合左侧文档原文进行比对确认。`;
          sourceInfo = { docName: '原油采购合同.docx', chapter: '综合参考条款' };
        }
      } else if (agentName.includes('成图') || agentName.includes('Mapping')) {
        if (userText.includes('美化')) {
          reply = lang === 'zh' 
            ? "已成功为您一键美化图件样式！本次优化自动调整了配色方案、增加了曲线平滑度并优化了图道边距。中间的成图区域已自动重新载入刷新，请查看最新效果。"
            : "Successfully beautified the chart style for you! This optimization automatically adjusted the color scheme, increased curve smoothness, and optimized track margins.";
        } else if (userText.includes('显示') || userText.includes('设置')) {
          reply = lang === 'zh'
            ? "图层显示设置已调整。我们重新优化了各个图层的叠加层次和显示对比度，确保地学特征一目了然。中间的成图区域已自动重新加载刷新。"
            : "Layer display settings adjusted. We optimized the stack order and contrast of each layer.";
        } else {
          reply = lang === 'zh'
            ? `收到关于“${userText}”的指令。专业成图引擎已完成参数调整与图件重构，中间显示区域已自动刷新！`
            : `Received command for "${userText}". Chart rendering area refreshed.`;
        }
      } else {
        if (userText.includes('生成本周生产运行简报') || userText.includes('生产运行简报')) {
          reply = lang === 'zh'
            ? "本周（2024年4月10日-4月16日）生产运行简报已生成。全区整体生产稳中有升，日产达成率超计划 2.5%。您可以点击下方卡片进行实时预览和深度编辑。"
            : "Weekly production operation brief has been generated. Click below to preview and edit.";
          isWeeklyReport = true;
        } else {
          reply = lang === 'zh'
            ? `已处理您的请求：“${userText}”。相关流程参数已按要求更新，中间界面已自动同步刷新。`
            : `Processed request for "${userText}". Central workspace has been updated.`;
        }
      }

      setMessages(prev => [...prev, { 
        sender: 'assistant', 
        text: reply,
        sourceInfo,
        wordReport: isWeeklyReport ? {
          id: 'report-weekly-001',
          title: lang === 'zh' ? '本周生产运行简报_20240416.docx' : 'Weekly_Production_Operation_Brief_20240416.docx',
          size: '1.4 MB',
          time: '刚刚'
        } : undefined
      }]);
      setIsTyping(false);

      if (onRefreshAgent) {
        onRefreshAgent();
      }
    }, 1200);
  };

  const handleSend = () => {
    handleSendQuestion(chatInput);
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
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 custom-scrollbar space-y-4">
            
            {/* Top Recommended Questions block for Doc QA Agent */}
            {isDocQaAgent && (
              <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-700 font-bold px-0.5">
                  <div className="flex items-center gap-1.5 text-blue-700">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    <span>推荐问题</span>
                  </div>
                  <button 
                    onClick={() => {
                      if (onRefreshAgent) onRefreshAgent();
                    }}
                    title="刷新推荐问题"
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <i className="fas fa-redo-alt text-xs"></i>
                  </button>
                </div>
                
                <div className="space-y-2">
                  {recommendedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendQuestion(q)}
                      className="w-full text-left bg-[#EEF4FF] hover:bg-[#E2EDFF] text-[#1E3A8A] border border-[#D0E2FF] rounded-2xl px-3.5 py-2 text-xs font-medium cursor-pointer transition-all flex items-center justify-between group shadow-2xs hover:shadow-xs"
                    >
                      <span className="line-clamp-1">{q}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-600 shrink-0 ml-1.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.length === 0 && !isDocQaAgent ? (
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
                      onClick={() => handleSendQuestion(q)}
                      className="w-full text-left p-4 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center justify-between hover:shadow-sm transition-all group"
                    >
                      <span className="text-xs text-slate-700 font-medium line-clamp-2">{q}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex flex-col gap-1.5 max-w-[85%]">
                      <div className={`rounded-2xl px-4 py-3 text-xs shadow-2xs whitespace-pre-line leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-[#DCE8FF] text-slate-800 border border-blue-200/60 font-medium' 
                          : 'bg-[#F4F8FF] text-slate-800 border border-[#D5E3FC]'
                      }`}>
                        {msg.text}

                        {/* Source document citation card */}
                        {msg.sourceInfo && (
                          <div className="mt-3 pt-2.5 border-t border-[#D5E3FC] flex flex-col gap-1.5">
                            <div className="text-[11px] font-bold text-slate-600">来源：</div>
                            <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-xl border border-blue-100 shadow-2xs">
                              <div className="flex items-center gap-1.5 text-slate-700 font-medium truncate text-[11px]">
                                <i className="far fa-file-alt text-blue-500 text-xs flex-shrink-0"></i>
                                <span className="truncate">《{msg.sourceInfo.docName}》{msg.sourceInfo.chapter}</span>
                              </div>
                              <button 
                                onClick={() => {
                                  window.dispatchEvent(new CustomEvent('highlight-contract-source', { detail: msg.sourceInfo }));
                                }}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-[10px] font-bold transition-all flex-shrink-0 shadow-2xs border border-blue-200/60 cursor-pointer"
                              >
                                查看原文
                              </button>
                            </div>
                          </div>
                        )}
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
                  <div className="flex gap-2.5 justify-start">
                    <div className="bg-[#F4F8FF] border border-[#D5E3FC] rounded-2xl px-4 py-3 text-xs text-slate-500 flex items-center gap-1 shadow-2xs">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce [animation-delay:0.2s]">●</span>
                      <span className="animate-bounce [animation-delay:0.4s]">●</span>
                      <span className="text-[11px] ml-2 text-slate-400">
                        正在检索相关合同条款...
                      </span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
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
