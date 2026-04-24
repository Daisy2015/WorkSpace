import React, { useState, useEffect } from 'react';
import { Message, ResourceNode, Language, Agent } from '../types';
import { translations } from '../i18n';
import { ReportTemplateModal } from './ReportTemplateModal';
import { AgentRunManager } from './enterprise/AgentRunManager';

interface TracePanelProps {
  selectedMessage: Message | null;
  resourceTree: ResourceNode[];
  lang: Language;
  onToggle?: () => void;
  workspaceVersion?: string;
  onCreateReport?: () => void;
  onSelectAgent?: (agentId: string) => void;
  onViewAllHistory?: () => void;
  agents?: Agent[];
}

export const TracePanel: React.FC<TracePanelProps> = ({ 
  selectedMessage, 
  resourceTree, 
  lang, 
  onToggle, 
  workspaceVersion = 'foundation',
  onCreateReport,
  onSelectAgent,
  onViewAllHistory,
  agents = []
}) => {
  const t = translations[lang];

  const isPro = workspaceVersion === 'professional';
  const isEnterprise = workspaceVersion === 'enterprise';

  const [managedAgentId, setManagedAgentId] = useState<string | null>(null);

  const managedAgent = agents.find(a => a.id === managedAgentId);

  const tools = isEnterprise ? [
    { id: 'prod_analysis', name: lang === 'zh' ? '生产分析岗' : '生产分析专家', icon: 'fa-chart-line', color: 'bg-purple-50 text-purple-600' },
    { id: 'anomaly_inspect', name: lang === 'zh' ? '异常巡检岗' : '异常巡检专家', icon: 'fa-search-location', color: 'bg-rose-50 text-rose-600' },
    { id: 'drilling_eng', name: lang === 'zh' ? '钻井工程师' : '钻井工程专家', icon: 'fa-hard-hat', color: 'bg-amber-50 text-amber-600' },
    { id: 'well_expert', name: lang === 'zh' ? '井位部署岗' : '井位部署专家', icon: 'fa-map-marker-alt', color: 'bg-blue-50 text-blue-600' },
    { id: 'res_eval', name: lang === 'zh' ? '储层评价岗' : '储层评价专家', icon: 'fa-layer-group', color: 'bg-emerald-50 text-emerald-600' },
    { id: 'safety_off', name: lang === 'zh' ? '安全监督岗' : '安全监督专家', icon: 'fa-shield-alt', color: 'bg-red-50 text-red-600' },
  ] : isPro ? [
    { id: 'pro_report', name: lang === 'zh' ? '专业报告' : 'Pro Report', icon: 'fa-file-alt', color: 'bg-blue-50 text-blue-600' },
    { id: 'pro_ppt', name: lang === 'zh' ? '专业PPT' : 'Pro PPT', icon: 'fa-file-powerpoint', color: 'bg-orange-50 text-orange-600' },
    { id: 'anomaly', name: lang === 'zh' ? '异常诊断' : 'Anomaly Diagnosis', icon: 'fa-stethoscope', color: 'bg-red-50 text-red-600' },
    { id: 'scheme', name: lang === 'zh' ? '方案优选' : 'Scheme Selection', icon: 'fa-check-double', color: 'bg-green-50 text-green-600' },
    { id: 'trap', name: lang === 'zh' ? '圈闭评价' : 'Trap Eval', icon: 'fa-bullseye', color: 'bg-purple-50 text-purple-600' },
    { id: 'well', name: lang === 'zh' ? '井位优选' : 'Well Selection', icon: 'fa-map-marker-alt', color: 'bg-teal-50 text-teal-600' },
    { id: 'offset_well', name: lang === 'zh' ? '邻井优选' : 'Offset Well', icon: 'fa-oil-well', color: 'bg-amber-50 text-amber-600' },
    { id: 'geomapx', name: 'GeoMapX', icon: 'fa-map', color: 'bg-purple-50 text-purple-600' },
  ] : [
    { id: 'report', name: lang === 'zh' ? '智能报告' : 'Smart Report', icon: 'fa-file-alt', color: 'bg-blue-50 text-blue-600' },
    { id: 'ppt', name: lang === 'zh' ? '智能PPT' : 'Smart PPT', icon: 'fa-file-powerpoint', color: 'bg-orange-50 text-orange-600' },
    { id: 'summary', name: lang === 'zh' ? '智能摘要' : 'Smart Summary', icon: 'fa-align-left', color: 'bg-green-50 text-green-600' },
    { id: 'chart', name: lang === 'zh' ? '数据成图' : 'Data Plot', icon: 'fa-chart-pie', color: 'bg-pink-50 text-pink-600' },
  ];

  const initialSessions = isEnterprise ? [
    { id: 'e1', title: lang === 'zh' ? 'A井区日产气量异常分析' : 'Block A Daily Anomaly', expertId: 'prod_analysis', time: '1h ago', pendingConfirm: true },
    { id: 'e2', title: lang === 'zh' ? 'B区块状态巡检报告' : 'Block B Status Report', expertId: 'anomaly_inspect', time: '3h ago', pendingConfirm: false },
    { id: 'e3', title: lang === 'zh' ? 'X-2井钻井参数优化建议' : 'X-2 Drilling Optimization', expertId: 'drilling_eng', time: '5h ago', pendingConfirm: true },
  ] : isPro ? [
    { id: 'p1', title: lang === 'zh' ? 'X-1井区圈闭有效性评价' : 'X-1 Well Trap Eval', expertId: 'trap', time: '2h ago' },
    { id: 'p2', title: lang === 'zh' ? 'A区块钻井方案优选对比' : 'Block A Scheme Selection', expertId: 'scheme', time: '5h ago' },
    { id: 'p3', title: lang === 'zh' ? '测井曲线异常诊断分析' : 'Logging Anomaly Diagnosis', expertId: 'anomaly', time: '1d ago' },
    { id: 'p4', title: lang === 'zh' ? '年度勘探专业汇报PPT' : 'Annual Exploration PPT', expertId: 'pro_ppt', time: '2d ago' },
  ] : [
    { id: '1', title: lang === 'zh' ? '第一季度钻井总结报告' : 'Q1 Summary Report', expertId: 'report', time: '4h ago' },
    { id: '2', title: lang === 'zh' ? '项目汇报演示文稿' : 'Project Presentation', expertId: 'ppt', time: '21h ago' },
    { id: '3', title: lang === 'zh' ? '地质构造分析摘要' : 'Geological Summary', expertId: 'summary', time: '4d ago' },
  ];

  const [recentSessions, setRecentSessions] = useState(initialSessions);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    setRecentSessions(initialSessions);
  }, [workspaceVersion, lang]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(lang === 'zh' ? '编辑中...' : 'Editing...');
  };

  if (isEnterprise && managedAgent) {
    return (
      <div className="h-full border-l border-gray-200 w-96 overflow-hidden">
        <AgentRunManager 
          agent={managedAgent} 
          lang={lang} 
          onBack={() => setManagedAgentId(null)}
          onEditConfig={() => onSelectAgent?.(managedAgentId!)}
          onViewAllHistory={onViewAllHistory}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 border-l border-gray-200 w-96 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <i className={`fas ${isEnterprise ? 'fa-user-tie text-purple-600' : isPro ? 'fa-brain text-purple-600' : 'fa-bolt text-blue-600'}`}></i>
          {isEnterprise 
            ? (lang === 'zh' ? '岗位数字员工' : 'Role Digital Employee')
            : isPro 
            ? (lang === 'zh' ? '场景智能中心' : 'Scenario Intelligence Center')
            : (lang === 'zh' ? '通用智能助手' : 'General Smart Assistant')
          }
        </h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Tools Grid */}
        <div className="grid grid-cols-3 gap-3">
          {isEnterprise ? agents.filter(a => !a.isLeader).map(agent => (
            <div key={agent.id} onClick={() => setManagedAgentId(agent.id)} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group relative flex flex-col items-center text-center h-full">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-2 bg-purple-50 text-purple-600 relative`}>
                {typeof agent.avatar === 'string' ? <span>{agent.avatar}</span> : agent.avatar}
                <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  agent.status === 'Running' ? 'bg-green-500 animate-pulse' : 
                  agent.status === 'Stopped' ? 'bg-gray-400' : 
                  agent.status === 'Error' ? 'bg-red-500' : 'bg-slate-300'
                }`} />
              </div>
              <h3 className="font-bold text-[11px] text-gray-800 group-hover:text-purple-600 transition-colors mb-1 line-clamp-1">{agent.name}</h3>
              
              <div className="mt-2 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                <button className="flex-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 py-1 rounded transition-colors flex items-center justify-center" title={t.history}>
                  <i className="fas fa-history text-[10px]"></i>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAgent?.(agent.id);
                  }}
                  className="flex-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 py-1 rounded transition-colors flex items-center justify-center" 
                  title={t.config}
                >
                  <i className="fas fa-cog text-[10px]"></i>
                </button>
              </div>
            </div>
          )) : tools.map(tool => (
            <div key={tool.id} onClick={() => isEnterprise && onSelectAgent?.(tool.id)} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group relative flex flex-col items-center text-center h-full">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-2 ${tool.color}`}>
                <i className={`fas ${tool.icon}`}></i>
              </div>
              <h3 className="font-bold text-[11px] text-gray-800 group-hover:text-purple-600 transition-colors mb-1 line-clamp-1">{tool.name}</h3>
              
              {isEnterprise ? (
                <div className="mt-2 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                  <button className="flex-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 py-1 rounded transition-colors flex items-center justify-center">
                    <i className="fas fa-clock text-[10px]"></i>
                  </button>
                  <button className="flex-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 py-1 rounded transition-colors flex items-center justify-center">
                    <i className="fas fa-history text-[10px]"></i>
                  </button>
                </div>
              ) : (
                <button className="absolute top-1 right-1 text-gray-300 hover:text-purple-600 p-1 rounded-full hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100">
                  <i className="fas fa-pencil-alt text-[10px]"></i>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Recent Sessions */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{lang === 'zh' ? '成果记录' : 'Outcomes'}</h3>
          <div className="space-y-2">
            {recentSessions.map(session => {
              const expert = tools.find(t => t.id === session.expertId) || tools[0];
              return (
                <div key={session.id} className="relative flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:shadow-sm hover:border-purple-200 transition-all group cursor-pointer">
                  <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${expert.color}`}>
                    <i className={`fas ${expert.icon} text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[11px] font-bold text-gray-700 group-hover:text-purple-600 truncate">{session.title}</h4>
                      {session.pendingConfirm && (
                        <span className="flex-shrink-0 bg-amber-50 text-amber-700 text-[8px] px-1.5 py-0.5 rounded font-bold">{lang === 'zh' ? '待确认' : 'Pending'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[9px] text-gray-400 font-medium">
                      <span className="bg-gray-50 px-1.5 py-0.5 rounded text-gray-500">{expert.name}</span>
                      <span>•</span>
                      <span>{session.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* To-Do List (Enterprise Only) */}
        {isEnterprise && (
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{lang === 'zh' ? '今日待办事项' : 'To-Do List'}</h3>
            <div className="space-y-2">
              {[
                { id: 't1', task: lang === 'zh' ? '生产分析日报生成' : 'Daily Production Analysis', time: '11:30', expertId: 'prod_analysis' },
                { id: 't2', task: lang === 'zh' ? '区域设备异常点位巡检' : 'Regional Equipment Inspection', time: '14:00', expertId: 'anomaly_inspect' },
                { id: 't3', task: lang === 'zh' ? '实钻地质动态报告汇总' : 'Drilling Dynamics Report', time: '17:30', expertId: 'drilling_eng' },
              ].map(todo => {
                const expert = tools.find(t => t.id === todo.expertId) || tools[0];
                return (
                  <div key={todo.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 hover:shadow-sm hover:border-purple-200 transition-all group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${expert.color.replace('bg-', 'bg-').split(' ')[0].replace('-50', '-500')}`}></div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-700">{todo.task}</span>
                        <span className="text-[9px] text-gray-400 font-medium">{expert.name}</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-50">
                      {todo.time}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
