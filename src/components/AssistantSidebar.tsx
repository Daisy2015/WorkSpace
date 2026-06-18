import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, History, Lightbulb, ChevronRight, Send, ShieldCheck } from 'lucide-react';

interface AssistantSidebarProps {
  lang: 'zh' | 'en';
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  onSendMessage: (message: string) => void;
  mode?: 'fixed' | 'absolute';
}

export const AssistantSidebar: React.FC<AssistantSidebarProps> = ({ 
  lang, 
  isOpen, 
  onClose,
  agentName,
  onSendMessage,
  mode = 'fixed'
}) => {
  const [chatInput, setChatInput] = useState('');

  const recommendedQuestions = [
    "优化当前钻井方案并补充针对性的技术措施",
    "请检查当前报告中是否存在地质风险遗漏？",
    "请总结一下关键地质认识和主要设计建议"
  ];
  
  const handleSend = () => {
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput('');
  };
  
  const handleRecommendedClick = (q: string) => {
    setChatInput(q);
    onSendMessage(q);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ x: mode === 'fixed' ? 400 : 0 }}
          animate={{ x: 0 }}
          exit={{ x: mode === 'fixed' ? 400 : 0 }}
          className={`${mode === 'fixed' ? 'fixed right-0 top-0 bottom-0' : 'absolute right-0 top-0 bottom-0'} w-[400px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[100] flex flex-col`}
        >
          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between bg-white border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-800">智能助手</h2>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-semibold text-emerald-600">在线</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                    <History className="w-4.5 h-4.5" />
                </button>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                    <X className="w-4.5 h-4.5" />
                </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6 custom-scrollbar">
            {/* Recommended Questions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Lightbulb className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">你可能想问</h3>
              </div>
              
              <div className="space-y-3">
                {recommendedQuestions.map((q, i) => (
                  <button 
                    key={i}
                    onClick={() => handleRecommendedClick(q)}
                    className="w-full text-left p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:border-indigo-200 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                        <Bot className="w-5 h-5" />
                      </div>
                      <span className="text-sm text-slate-700 font-medium leading-relaxed">{q}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Chat Input */}
          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="relative">
              <textarea 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="输入你的问题，我会尽力为你解答..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 pr-16 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all resize-none shadow-inner"
                rows={3}
              />
              <button 
                onClick={handleSend}
                className="absolute right-3 bottom-3 w-10 h-10 bg-indigo-500 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-indigo-600 transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AI生成内容仅供参考</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
