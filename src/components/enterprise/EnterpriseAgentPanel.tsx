import React, { useState } from 'react';
import { Agent, AgentRunHistory } from '../../types';

interface EnterpriseAgentPanelProps {
  agents: Agent[];
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
  onViewAllHistory?: () => void;
  lang: Language;
}

type Language = 'zh' | 'en';

export const EnterpriseAgentPanel: React.FC<EnterpriseAgentPanelProps> = ({ 
  agents, 
  selectedAgentId, 
  onSelectAgent,
  onViewAllHistory,
  lang
}) => {
  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
  
  const mockHistory: AgentRunHistory[] = [
    { id: '1', timestamp: '2024-04-09 14:30', scenarioName: '产量波动归因分析', status: 'Success', summary: '识别出 X-1 井压力降低主因为酸化措施衰减，建议实施二次酸化。', metadata: { duration: '45s', dataSources: ['生产数据库', '措施记录库'] } },
    { id: '2', timestamp: '2024-04-09 08:30', scenarioName: '晨间巡检', status: 'Success', summary: '完成全区 128 口井自动巡检，发现 3 口井参数异常并已分发预警。', metadata: { duration: '120s', dataSources: ['图像识别中心'] } },
    { id: '3', timestamp: '2024-04-08 17:00', scenarioName: '生产运行日报生成', status: 'PendingApproval', summary: '日报内容已生成，包含今日产量汇总、异常井统计及明日计划建议。', metadata: { duration: '30s', dataSources: ['各级日报库'] } },
    { id: '4', timestamp: '2024-04-08 14:00', scenarioName: '场景模拟', status: 'Failed', summary: '数据源连接超时（A503），任务自动中断，请检查网络配置。', metadata: { duration: '12s', dataSources: ['模拟环境'] } },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'text-green-500 bg-green-50';
      case 'Failed': return 'text-red-500 bg-red-50';
      case 'PendingApproval': return 'text-blue-500 bg-blue-50';
      case 'Timeout': return 'text-orange-500 bg-orange-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    if (lang === 'en') return status;
    switch (status) {
      case 'Success': return '成功';
      case 'Failed': return '失败';
      case 'PendingApproval': return '待确认';
      case 'Timeout': return '超时';
      default: return '未知';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Upper Area: Agent List */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-users-cog text-purple-600"></i>
          {lang === 'zh' ? '数字员工列表' : 'Digital Employee List'}
        </h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          {agents.map(agent => (
            <div 
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                selectedAgentId === agent.id 
                  ? 'border-purple-500 bg-purple-50/50 shadow-sm' 
                  : 'border-gray-100 bg-gray-50/50 hover:border-purple-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center text-lg relative flex-shrink-0">
                  {agent.avatar}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    agent.status === 'Running' ? 'bg-green-500 animate-pulse' : 
                    agent.status === 'Idle' ? 'bg-amber-400' : 'bg-gray-300'
                  }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-800 truncate">{agent.name}</h4>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAgent(agent.id);
                      }}
                      className="p-1 hover:bg-purple-100 rounded transition-all opacity-0 group-hover:opacity-100"
                    >
                      <i className="fas fa-cog text-[10px] text-gray-400 hover:text-purple-600 transition-all"></i>
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">{agent.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lower Area: Run History Timeline */}
      <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
        <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <i className="fas fa-history"></i>
            {lang === 'zh' ? '运行状态与历史' : 'Run Status & History'}
          </h3>
          <button className="text-[10px] font-bold text-purple-600 hover:underline">
            {lang === 'zh' ? '查看更多' : 'View All'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {!selectedAgentId ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4 text-center px-8">
               <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-2xl">
                 <i className="fas fa-user-clock opacity-40"></i>
               </div>
               <p className="text-xs font-medium tracking-tight">请在上方选择一位员工查看其工作履历</p>
             </div>
          ) : (
            <div className="relative pl-6 space-y-6">
              {/* Timeline Line */}
              <div className="absolute top-0 bottom-0 left-[7px] w-0.5 bg-gray-100 -z-0"></div>

              {mockHistory.map((item, idx) => (
                <div key={item.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ring-2 ring-gray-50 z-10 ${
                    item.status === 'Success' ? 'bg-green-500' :
                    item.status === 'Failed' ? 'bg-red-500' :
                    item.status === 'PendingApproval' ? 'bg-blue-500' : 'bg-gray-400'
                  }`}></div>

                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-gray-400 font-mono tracking-tight">{item.timestamp}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-gray-800 mb-1 leading-snug">{item.scenarioName}</h5>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-3">
                      {item.summary}
                    </p>
                    
                    <div className="flex items-center justify-between border-t border-gray-50 pt-2">
                       <div className="flex items-center gap-3">
                         <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1">
                           <i className="far fa-clock"></i> {item.metadata?.duration}
                         </span>
                         {item.metadata?.dataSources && (
                           <span className="text-[9px] font-bold text-purple-400 flex items-center gap-1">
                             <i className="fas fa-layer-group"></i> {item.metadata.dataSources.length}
                           </span>
                         )}
                       </div>
                       <button className="text-[10px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-0.5">
                         {lang === 'zh' ? '详情' : 'Detail'}
                         <i className="fas fa-chevron-right text-[8px]"></i>
                       </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {onViewAllHistory && (
                <button 
                  onClick={onViewAllHistory}
                  className="w-full py-2.5 mt-4 bg-gray-50 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-history"></i>
                  {lang === 'zh' ? '查看更多执行记录' : 'View All Execution Records'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
