import React from 'react';
import { motion } from 'motion/react';

interface AgentActionBarProps {
  lang: 'zh' | 'en';
  agentName: string;
  statusText?: string;
  isAssistantOpen: boolean;
  onToggleAssistant: () => void;
  onClose?: () => void;
}

export const AgentActionBar: React.FC<AgentActionBarProps> = ({ 
  lang, 
  agentName, 
  statusText, 
  isAssistantOpen,
  onToggleAssistant,
  onClose 
}) => {
  return (
    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-50 shadow-sm">
      <div className="flex items-center gap-6">
        {/* Agent Identity */}
        <div className="flex items-center gap-3 pr-6 border-r border-slate-200">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <i className="fas fa-robot text-sm"></i>
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 tracking-tight">{agentName}</h2>
          </div>
        </div>

        {/* Dynamic Status */}
        {statusText && (() => {
          const statusMap: Record<string, { text: string; textColor: string; bgColor: string; borderColor: string; dotColor: string }> = {
            'Running': { text: '运行中', textColor: 'text-indigo-500', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-100', dotColor: 'bg-indigo-500' },
            'Completed': { text: '已完成', textColor: 'text-emerald-500', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100', dotColor: 'bg-emerald-500' },
            'Failed': { text: '异常', textColor: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-100', dotColor: 'bg-red-500' },
            'Exception': { text: '异常', textColor: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-100', dotColor: 'bg-red-500' },
          };
          
          const status = statusMap[statusText] || { text: statusText, textColor: 'text-slate-500', bgColor: 'bg-slate-50', borderColor: 'border-slate-100', dotColor: 'bg-slate-500' };
          
          return (
            <div className={`flex items-center gap-2.5 px-3 py-1.5 ${status.bgColor} border ${status.borderColor} rounded-full`}>
              <div className={`w-2 h-2 ${status.dotColor} rounded-full ${statusText === 'Running' ? 'animate-pulse' : ''}`}></div>
              <span className={`text-[10px] font-black ${status.textColor} uppercase tracking-[0.1em]`}>{status.text}</span>
            </div>
          );
        })()}
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleAssistant}
          className={`px-5 h-10 flex items-center gap-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-sm ${
            isAssistantOpen 
              ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
              : 'bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100'
          }`}
        >
          <i className={`fas ${isAssistantOpen ? 'fa-comment-dots' : 'fa-sparkles'}`}></i>
          {lang === 'zh' ? '智能助手' : 'Call Assistant'}
        </button>

        {onClose && (
          <>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <i className="fas fa-times"></i>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
