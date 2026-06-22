import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, History, Lightbulb, ChevronRight, Send, ShieldCheck } from 'lucide-react';

interface AssistantSidebarProps {
  lang: 'zh' | 'en';
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentStatus?: 'Running' | 'Idle' | 'Stopped' | 'Error';
  mode?: 'fixed' | 'absolute';
}

export const AssistantSidebar: React.FC<AssistantSidebarProps> = ({ 
  lang, 
  isOpen, 
  onClose,
  agentName,
  agentStatus,
  mode = 'fixed'
}) => {
  const [chatInput, setChatInput] = useState('');
  
  const recommendedQuestions = agentName === '专业成图智能体' || agentName === 'Pro Mapping Agent'
    ? [
        "一键美化图件样式",
        "调整图层显示设置",
        "删除不需要的图层"
      ]
    : [
        "优化当前钻井方案并补充针对性的技术措施",
        "请检查当前报告中是否存在地质风险遗漏？",
        "请总结一下关键地质认识和主要设计建议"
      ];

  const getStatusDisplay = (status?: string) => {
    switch (status) {
      case 'Running':
        return { text: '运行中', color: 'bg-emerald-500' };
      case 'Idle':
      case 'Stopped':
        return { text: '已完成', color: 'bg-slate-500' };
      case 'Error':
        return { text: '异常', color: 'bg-red-500' };
      default:
        return { text: '未知', color: 'bg-slate-500' };
    }
  };

  const statusDisplay = getStatusDisplay(agentStatus);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ x: mode === 'fixed' ? 400 : 0 }}
          animate={{ x: 0 }}
          exit={{ x: mode === 'fixed' ? 400 : 0 }}
          className={`${mode === 'fixed' ? 'fixed right-0 top-[100px] bottom-[48px]' : 'absolute right-0 top-[100px] bottom-[48px]'} w-[400px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[100] flex flex-col`}
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between bg-white border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-800">智能助手</h2>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                <div className={`w-2 h-2 rounded-full ${statusDisplay.color}`} />
                <span className="text-[10px] font-medium text-slate-600">{statusDisplay.text}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <History className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6 custom-scrollbar">
            {/* Recommended Questions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Lightbulb className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-medium">你可能想问</h3>
              </div>
              
              <div className="space-y-3">
                {recommendedQuestions.map((q, i) => (
                  <button 
                    key={i}
                    className="w-full text-left p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-indigo-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-slate-700 font-medium">{q}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pr-14 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all resize-none"
                rows={3}
              />
              <button className="absolute right-3 bottom-3 w-10 h-10 bg-indigo-500 text-white rounded-lg shadow-lg flex items-center justify-center hover:bg-indigo-600 transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AI生成内容仅供参考</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
