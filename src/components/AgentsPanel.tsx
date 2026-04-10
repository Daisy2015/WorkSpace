import React, { useState } from 'react';
import { Agent, Language } from '../types';

interface AgentsPanelProps {
  agents: Agent[];
  onAddAgent: () => void;
  lang: Language;
}

export const AgentsPanel: React.FC<AgentsPanelProps> = ({ agents, onAddAgent, lang }) => {
  const [filter, setFilter] = useState('');

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(filter.toLowerCase()) || 
    a.role.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 w-80 flex-shrink-0">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-800 flex items-center">
          <i className="fas fa-users-cog mr-2 text-indigo-600"></i>
          {lang === 'zh' ? '数字专家团队' : 'Digital Experts'}
        </h3>
        <button 
          onClick={onAddAgent}
          className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors"
          title={lang === 'zh' ? '添加智能体' : 'Add Agent'}
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
          <input 
            type="text" 
            placeholder={lang === 'zh' ? '搜索专家...' : 'Search experts...'}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Leader Agent Section */}
        <div className="mb-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Leader</h4>
          {filteredAgents.filter(a => a.isLeader).map(agent => (
            <div key={agent.id} className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 flex items-start gap-3 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0 border border-indigo-200 shadow-sm">
                {agent.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h5 className="font-bold text-gray-900 text-sm truncate">{agent.name}</h5>
                  <i className="fas fa-crown text-yellow-500 text-xs" title="Leader Agent"></i>
                </div>
                <p className="text-xs text-indigo-600 font-medium mb-1 truncate">{agent.role}</p>
                <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{agent.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Expert Agents Section */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Experts</h4>
          <div className="space-y-2">
            {filteredAgents.filter(a => !a.isLeader).map(agent => (
              <div key={agent.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-start gap-3 hover:border-indigo-300 hover:shadow-sm transition-all group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 font-bold text-lg flex-shrink-0 border border-gray-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  {agent.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-gray-800 text-sm truncate group-hover:text-indigo-700 transition-colors">{agent.name}</h5>
                  <p className="text-xs text-gray-500 font-medium mb-1 truncate">{agent.role}</p>
                  <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{agent.description}</p>
                </div>
              </div>
            ))}
            {filteredAgents.filter(a => !a.isLeader).length === 0 && (
              <div className="text-center py-6 text-gray-400 text-xs border border-dashed border-gray-200 rounded-lg">
                {lang === 'zh' ? '未找到匹配的专家' : 'No matching experts found'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
