import React, { useState } from 'react';
import { Agent, AgentRunHistory, Language } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, History, Settings, ExternalLink, ChevronLeft, CheckCircle, XCircle, RefreshCw, Star, Info, FileText, Clock, Database } from 'lucide-react';

interface AgentRunManagerProps {
  agent: Agent;
  onBack: () => void;
  onEditConfig: () => void;
  onViewAllHistory?: () => void;
  lang: Language;
}

export const AgentRunManager: React.FC<AgentRunManagerProps> = ({
  agent,
  onBack,
  onEditConfig,
  onViewAllHistory,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'config'>('history');
  const [selectedRun, setSelectedRun] = useState<AgentRunHistory | null>(null);
  const [isStopping, setIsStopping] = useState(false);

  const t = {
    zh: {
      status: '运行状态',
      role: '岗位角色',
      history: '执行记录',
      config: '运行配置',
      start: '启动',
      stop: '停止',
      edit: '编辑配置',
      viewResult: '查看结果',
      scenario: '执行场景',
      time: '执行时间',
      state: '状态',
      summary: '结果摘要',
      details: '详情',
      export: '导出',
      important: '标记重要',
      retry: '重试',
      approval: '人工确认',
      confirm: '通过',
      reject: '驳回',
      reExecute: '重新执行',
      feedback: '评分评价',
      metadata: '执行元数据',
      duration: '响应耗时',
      source: '数据源',
      content: '输出内容',
      Idle: '待命',
      Running: '运行中',
      Stopped: '已停止',
      Error: '异常'
    },
    en: {
      status: 'Status',
      role: 'Role',
      history: 'Execution History',
      config: 'Configuration',
      start: 'Start',
      stop: 'Stop',
      edit: 'Edit Config',
      viewResult: 'View Result',
      scenario: 'Scenario',
      time: 'Time',
      state: 'Status',
      summary: 'Summary',
      details: 'Details',
      export: 'Export',
      important: 'Mark Important',
      retry: 'Retry',
      approval: 'Approval',
      confirm: 'Confirm',
      reject: 'Reject',
      reExecute: 'Re-execute',
      feedback: 'Feedback',
      metadata: 'Metadata',
      duration: 'Duration',
      source: 'Data Sources',
      content: 'Output Content',
      Idle: 'Idle',
      Running: 'Running',
      Stopped: 'Stopped',
      Error: 'Error'
    }
  }[lang];

  // Mock History if not present
  const history = agent.runHistory || [
    {
      id: 'r1',
      timestamp: '2024-04-24 10:30',
      scenarioName: lang === 'zh' ? '日产气量波动诊断' : 'Daily Gas Production Diagnosis',
      status: 'PendingApproval',
      summary: lang === 'zh' ? '检测到B区块3口井产量下降超过15%，已定位可能原因为井底积液。' : 'Detected 15% drop in 3 wells of Block B, likely due to liquid loading.',
      fullContent: lang === 'zh' ? '详细分析报告内容：基于实时压力与产量数据对比，发现A-1, A-2, A-4井流压异常上升，初步判断为积液。建议调优气举压力或执行泡排工艺。' : 'Detailed report content: Based on real-time pressure comparison...',
      metadata: { duration: '45s', dataSources: ['实时生产数据库', '井下传感器'] }
    },
    {
      id: 'r2',
      timestamp: '2024-04-23 15:45',
      scenarioName: lang === 'zh' ? '异常状态主动巡检' : 'Active Anomaly Inspection',
      status: 'Success',
      summary: lang === 'zh' ? '完成全区域52个监控点位巡检，确认一切正常。' : 'Completed inspection of 52 monitoring points, everything normal.',
      fullContent: lang === 'zh' ? '巡检覆盖率100%，无告警触发。' : '100% coverage, no alarms.',
      metadata: { duration: '120s', dataSources: ['图像识别中心', 'SCADA系统'] },
      feedback: { rating: 5 }
    },
    {
      id: 'r3',
      timestamp: '2024-04-23 09:20',
      scenarioName: lang === 'zh' ? '钻井提速方案优选' : 'Drilling Speed Optimization',
      status: 'Failed',
      summary: lang === 'zh' ? '由于无法获取邻井动态力学参数，计算任务中断。' : 'Task interrupted due to missing offset well mechanical parameters.',
      metadata: { duration: '15s', dataSources: ['历史钻井库'] }
    }
  ] as AgentRunHistory[];

  const statusColors = {
    Idle: 'bg-slate-100 text-slate-600',
    Running: 'bg-green-100 text-green-600',
    Stopped: 'bg-gray-100 text-gray-500',
    Error: 'bg-red-100 text-red-600'
  };

  const runStatusColors = {
    Success: 'text-green-600 bg-green-50',
    Failed: 'text-red-600 bg-red-50',
    Timeout: 'text-amber-600 bg-amber-50',
    PendingApproval: 'text-blue-600 bg-blue-50',
    Rejected: 'text-rose-600 bg-rose-50'
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
             {typeof agent.avatar === 'string' ? <span>{agent.avatar}</span> : agent.avatar}
           </div>
           <div className="flex flex-col min-w-0">
             <h3 className="text-sm font-bold text-gray-800 truncate">{agent.name}</h3>
             <p className="text-[10px] text-gray-400 truncate font-medium">{agent.role}</p>
           </div>
        </div>
        <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-purple-600 transition-colors" onClick={onEditConfig} title={t.edit}>
              <Settings className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="p-4 bg-gray-50/50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[agent.status || 'Idle']}`}>
              {t[agent.status || 'Idle']}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {agent.status === 'Running' ? (
              <button 
                onClick={() => setIsStopping(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                {t.stop}
              </button>
            ) : (
              <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white hover:bg-purple-700 rounded-lg text-xs font-bold transition-all shadow-sm shadow-purple-200">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                {t.start}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-bold transition-all relative ${activeTab === 'history' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          {t.history}
          {activeTab === 'history' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />}
        </button>
        <button 
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 text-xs font-bold transition-all relative ${activeTab === 'config' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          {t.config}
          {activeTab === 'config' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'history' ? (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="p-4 space-y-3"
            >
              {history.map(run => (
                <div 
                  key={run.id}
                  onClick={() => setSelectedRun(run)}
                  className="group p-3 rounded-xl border border-gray-100 bg-white hover:border-purple-200 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 font-mono tracking-tight">{run.timestamp}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${runStatusColors[run.status]}`}>
                      {run.status}
                    </span>
                  </div>
                  <h4 className="text-[11px] font-bold text-gray-700 group-hover:text-purple-600 mb-1">{run.scenarioName}</h4>
                  <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{run.summary}</p>
                </div>
              ))}
              
              {onViewAllHistory && (
                <button 
                  onClick={onViewAllHistory}
                  className="w-full py-3 mt-4 border border-dashed border-gray-200 rounded-xl text-[11px] font-bold text-gray-400 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50/30 transition-all flex items-center justify-center gap-2"
                >
                  <History className="w-3.5 h-3.5" />
                  {lang === 'zh' ? '查看更多执行记录' : 'View All Execution Records'}
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="config"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-4 space-y-6"
            >
               <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Info className="w-3 h-3" />
                      {t.role}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">{agent.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {lang === 'zh' ? '调度配置' : 'Schedule Config'}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-white p-2 rounded-lg border border-gray-100 flex flex-col">
                         <span className="text-[9px] text-gray-400 uppercase">{lang === 'zh' ? '模式' : 'Mode'}</span>
                         <span className="text-xs font-bold text-gray-700">{agent.schedules?.[0]?.mode || 'Frequency'}</span>
                       </div>
                       <div className="bg-white p-2 rounded-lg border border-gray-100 flex flex-col">
                         <span className="text-[9px] text-gray-400 uppercase">{lang === 'zh' ? '频率' : 'Frequency'}</span>
                         <span className="text-xs font-bold text-gray-700">1h/次</span>
                       </div>
                    </div>
                  </div>

                  <div>
                     <button onClick={onEditConfig} className="w-full py-2 bg-white border border-dashed border-gray-200 rounded-xl text-xs text-gray-500 hover:text-purple-600 hover:border-purple-200 transition-all font-medium flex items-center justify-center gap-2">
                       <ExternalLink className="w-3.5 h-3.5" />
                       {lang === 'zh' ? '在配置中心打开' : 'Open in Config Center'}
                     </button>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Run Details Drawer/Modal */}
      <AnimatePresence>
        {selectedRun && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50 bg-white flex flex-col shadow-2xl"
          >
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
              <button onClick={() => setSelectedRun(null)} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-bold text-gray-800 flex-1 truncate">{selectedRun.scenarioName}</h3>
              <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${runStatusColors[selectedRun.status]}`}>
                {selectedRun.status}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              {/* Metadata Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-gray-400">
                     <Clock className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[9px] text-gray-400 uppercase font-bold">{t.duration}</span>
                     <span className="text-xs font-bold text-gray-700">{selectedRun.metadata?.duration || '30s'}</span>
                   </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-gray-400">
                     <Database className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[9px] text-gray-400 uppercase font-bold">{lang === 'zh' ? '数据源' : 'Sources'}</span>
                     <span className="text-xs font-bold text-gray-700">{(selectedRun.metadata?.dataSources?.length || 2)} {lang === 'zh' ? '个' : ''}</span>
                   </div>
                </div>
              </div>

              {/* Main Content */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <FileText className="w-3 h-3" />
                  {t.content}
                </h4>
                <div className="prose prose-sm max-w-none text-xs text-gray-600 leading-relaxed p-4 bg-gray-50/50 rounded-xl border border-gray-100 whitespace-pre-wrap">
                  {selectedRun.fullContent || selectedRun.summary}
                </div>
              </div>

              {/* Metadata Detail */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                   <Database className="w-3 h-3" />
                   {t.metadata}
                </h4>
                <div className="space-y-2">
                   {selectedRun.metadata?.dataSources?.map((ds, idx) => (
                     <div key={idx} className="flex items-center gap-2 text-[10px] text-gray-500 bg-white p-2 rounded-lg border border-gray-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        {ds}
                     </div>
                   ))}
                </div>
              </div>

              {/* Feedback if exists */}
              {selectedRun.feedback && (
                <div className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-xl">
                  <h4 className="text-[10px] font-bold text-yellow-600 uppercase mb-2">{t.feedback}</h4>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= (selectedRun.feedback?.rating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  {selectedRun.feedback.comment && <p className="text-xs text-gray-600">{selectedRun.feedback.comment}</p>}
                </div>
              )}
            </div>

            {/* Approval Footer */}
            {selectedRun.status === 'PendingApproval' && (
              <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-2 gap-3">
                <button className="py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {t.reject}
                </button>
                <button className="py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 text-xs font-bold transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {t.confirm}
                </button>
              </div>
            )}

            {/* Action Footer */}
            {(selectedRun.status === 'Success' || selectedRun.status === 'Failed') && (
              <div className="p-4 border-t border-gray-100 bg-white flex items-center gap-3">
                  <button className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition-all flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    {t.export}
                  </button>
                  <button className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-xs font-bold transition-all shadow-lg shadow-purple-100 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    {t.reExecute}
                  </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
