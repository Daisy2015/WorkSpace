import React, { useState, useMemo } from 'react';
import { Agent, AgentRunHistory, Language } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  ChevronDown,
  ArrowUpDown,
  Download,
  X,
  Eye,
  RotateCcw
} from 'lucide-react';

interface ExtendedHistory extends AgentRunHistory {
  agentName: string;
  agentAvatar: any;
}

interface ExecutionHistoryPageProps {
  agents: Agent[];
  onBack: () => void;
  lang: Language;
}

export const ExecutionHistoryPage: React.FC<ExecutionHistoryPageProps> = ({
  agents,
  onBack,
  lang
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [agentFilter, setAgentFilter] = useState<string>('All');
  const [timeFilter, setTimeFilter] = useState<string>('All');
  const [selectedRun, setSelectedRun] = useState<ExtendedHistory | null>(null);

  const t = {
    zh: {
      title: '任务执行全景视图',
      subtitle: '跨智能体的全时段执行审计与成果追溯',
      filters: '筛选条件',
      searchPlaceholder: '搜索执行场景或记录摘要...',
      status: '执行状态',
      agent: '执行智能体',
      timeRange: '时间范围',
      export: '导出审计报告',
      reset: '重置',
      all: '全部',
      today: '今天',
      last7Days: '最近7天',
      last30Days: '最近30天',
      success: '成功',
      failed: '失败',
      pending: '待确认',
      rejected: '被驳回',
      noData: '未找到符合条件的执行记录',
      details: '结果详情',
      timestamp: '执行时间',
      scenario: '执行场景'
    },
    en: {
      title: 'Execution History',
      subtitle: 'Comprehensive audit and traceability across all agents',
      filters: 'Filters',
      searchPlaceholder: 'Search scenario or summary...',
      status: 'Status',
      agent: 'Agent',
      timeRange: 'Time Range',
      export: 'Export Audit',
      reset: 'Reset',
      all: 'All',
      today: 'Today',
      last7Days: 'Last 7 Days',
      last30Days: 'Last 30 Days',
      success: 'Success',
      failed: 'Failed',
      pending: 'Pending',
      rejected: 'Rejected',
      noData: 'No execution records found',
      details: 'Details',
      timestamp: 'Timestamp',
      scenario: 'Scenario'
    }
  }[lang];

  // Consolidate history from all agents + some mock data
  const allHistory = useMemo(() => {
    let history: ExtendedHistory[] = [];
    agents.forEach(agent => {
      const agentHistory = (agent.runHistory || []).map(h => ({
        ...h,
        agentName: agent.name,
        agentAvatar: agent.avatar
      }));
      history = [...history, ...agentHistory];
    });

    // Add some extra mocks if history is sparse
    if (history.length < 5) {
      history.push(
        {
          id: 'mock-1',
          timestamp: '2024-04-24 09:15',
          scenarioName: '实时地质导向分析',
          status: 'Success',
          summary: '实时伽马曲线与预测模型吻合度98%，建议维持当前倾角。',
          agentName: '勘探决策专家',
          agentAvatar: '🧠',
          metadata: { duration: '12s', dataSources: ['随钻测井'] }
        },
        {
          id: 'mock-2',
          timestamp: '2024-04-24 08:00',
          scenarioName: '早盘产量自动汇总',
          status: 'Success',
          summary: '全区产量统计完成，昨日总值5.2万方。',
          agentName: '生产管理专家',
          agentAvatar: '👨‍💼',
          metadata: { duration: '45s', dataSources: ['实时生产库'] }
        },
        {
          id: 'mock-3',
          timestamp: '2024-04-23 22:30',
          scenarioName: '压力系统风险评估',
          status: 'Failed',
          summary: '传感器读取失败 (Sensor-A02 Timeout)',
          agentName: '钻井指挥专家',
          agentAvatar: '📡',
          metadata: { duration: '5s', dataSources: ['下井仪'] }
        }
      );
    }

    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [agents]);

  const filteredHistory = allHistory.filter(run => {
    const matchesSearch = run.scenarioName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         run.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || run.status === statusFilter;
    const matchesAgent = agentFilter === 'All' || run.agentName === agentFilter;
    
    // Time filter logic (simplified for mockup)
    let matchesTime = true;
    if (timeFilter === 'Today') {
      matchesTime = run.timestamp.includes('2024-04-24');
    }

    return matchesSearch && matchesStatus && matchesAgent && matchesTime;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Success': return { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
      case 'Failed': return { icon: <XCircle className="w-3.5 h-3.5" />, color: 'text-rose-600 bg-rose-50 border-rose-100' };
      case 'PendingApproval': return { icon: <Clock className="w-3.5 h-3.5" />, color: 'text-amber-600 bg-amber-50 border-amber-100' };
      case 'Rejected': return { icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'text-slate-600 bg-slate-100 border-slate-200' };
      default: return { icon: <Filter className="w-3.5 h-3.5" />, color: 'text-gray-600 bg-gray-50 border-gray-100' };
    }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col relative overflow-hidden font-sans">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.title}</h2>
              <p className="text-sm text-slate-500 font-medium">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all">
               <Download className="w-4 h-4" />
               {t.export}
             </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-3 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
            />
          </div>

          <div className="h-6 w-px bg-slate-200 mx-2" />

          {/* Agent Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.agent}</span>
            <select 
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none hover:border-indigo-500 transition-colors"
            >
              <option value="All">{t.all}</option>
              {agents.filter(a => !a.isLeader).map(a => (
                <option key={a.id} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.status}</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none hover:border-indigo-500 transition-colors"
            >
              <option value="All">{t.all}</option>
              <option value="Success">{t.success}</option>
              <option value="Failed">{t.failed}</option>
              <option value="PendingApproval">{t.pending}</option>
              <option value="Rejected">{t.rejected}</option>
            </select>
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.timeRange}</span>
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none hover:border-indigo-500 transition-colors"
            >
              <option value="All">{t.all}</option>
              <option value="Today">{t.today}</option>
              <option value="Last7Days">{t.last7Days}</option>
              <option value="Last30Days">{t.last30Days}</option>
            </select>
          </div>

          <button 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('All');
              setAgentFilter('All');
              setTimeFilter('All');
            }}
            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
            title={t.reset}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area - Table */}
      <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {filteredHistory.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t.timestamp}</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t.agent}</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t.scenario}</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t.status}</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.map((run, idx) => {
                    const statusInfo = getStatusInfo(run.status);
                    return (
                      <motion.tr 
                        key={run.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700 font-mono italic">{run.timestamp.split(' ')[0]}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{run.timestamp.split(' ')[1]}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs">
                               {typeof run.agentAvatar === 'string' ? run.agentAvatar : '🤖'}
                             </div>
                             <span className="text-xs font-bold text-slate-700">{run.agentName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-[280px]">
                            <p className="text-xs font-bold text-slate-800 mb-0.5 truncate">{run.scenarioName}</p>
                            <p className="text-[10px] text-slate-400 truncate font-medium">{run.summary}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border ${statusInfo.color} text-[10px] font-bold`}>
                            {statusInfo.icon}
                            {run.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setSelectedRun(run)}
                            className="bg-white border border-slate-200 p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-500 transition-all shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed py-24 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400">{t.noData}</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                  setAgentFilter('All');
                }}
                className="mt-4 text-xs font-bold text-indigo-600 hover:underline"
              >
                重置搜索
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Details Side Drawer */}
      <AnimatePresence>
        {selectedRun && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRun(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[480px] bg-white shadow-2xl z-[110] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <History className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{t.details}</h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedRun.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedRun(null)}
                  className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Status Bar */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${getStatusInfo(selectedRun.status).color}`}>
                  <div className="flex items-center gap-2">
                    {getStatusInfo(selectedRun.status).icon}
                    <span className="font-bold text-sm">{selectedRun.status}</span>
                  </div>
                  <span className="text-xs font-bold opacity-60 font-mono tracking-tighter">{selectedRun.timestamp}</span>
                </div>

                {/* Scenario & Agent */}
                <div className="space-y-4">
                   <div>
                     <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t.scenario}</h4>
                     <p className="text-base font-bold text-slate-900">{selectedRun.scenarioName}</p>
                   </div>
                   <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center">
                       {typeof selectedRun.agentAvatar === 'string' ? selectedRun.agentAvatar : '🤖'}
                     </div>
                     <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.agent}</p>
                       <p className="text-xs font-bold text-slate-700">{selectedRun.agentName}</p>
                     </div>
                   </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      响应时长
                    </h5>
                    <p className="text-sm font-bold text-slate-700 font-mono">{selectedRun.metadata?.duration || '--'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                      <Search className="w-3 h-3" />
                      数据源
                    </h5>
                    <p className="text-sm font-bold text-slate-700">{selectedRun.metadata?.dataSources?.length || 0} Sources</p>
                  </div>
                </div>

                {/* Content */}
                <div>
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">输出内容摘要</h4>
                   <div className="p-5 bg-slate-900 rounded-2xl text-slate-300 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                     {selectedRun.fullContent || selectedRun.summary}
                   </div>
                </div>

                {/* Sources List */}
                {selectedRun.metadata?.dataSources && selectedRun.metadata.dataSources.length > 0 && (
                   <div className="space-y-3">
                     <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">关联数据足迹</h4>
                     <div className="flex flex-wrap gap-2">
                       {selectedRun.metadata.dataSources.map((ds, i) => (
                         <span key={i} className="px-2.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100">
                           {ds}
                         </span>
                       ))}
                     </div>
                   </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 grid grid-cols-2 gap-4">
                 <button className="py-3 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                   <RotateCcw className="w-4 h-4" />
                   重新执行
                 </button>
                 <button className="py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                   <Download className="w-4 h-4" />
                   下载结果
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
