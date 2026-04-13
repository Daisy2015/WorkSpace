import React, { useState, useEffect } from 'react';
import { Message, ResourceNode, Language } from '../types';
import { translations } from '../i18n';
import { ReportTemplateModal } from './ReportTemplateModal';

interface TracePanelProps {
  selectedMessage: Message | null;
  resourceTree: ResourceNode[];
  lang: Language;
  onToggle?: () => void;
  workspaceVersion?: string;
  onCreateReport?: () => void;
}

export const TracePanel: React.FC<TracePanelProps> = ({ 
  selectedMessage, 
  resourceTree, 
  lang, 
  onToggle, 
  workspaceVersion = 'foundation',
  onCreateReport
}) => {
  const t = translations[lang];

  const isPro = workspaceVersion === 'professional';
  const isEnterprise = workspaceVersion === 'enterprise';
  const isFlagship = workspaceVersion === 'flagship';

  const tools = isFlagship ? [
    { id: 'geo_inst', name: lang === 'zh' ? '地质所' : 'Geological Inst.', desc: '', icon: 'fa-mountain', color: 'bg-emerald-50 text-emerald-600', isBeta: false },
    { id: 'drill_inst', name: lang === 'zh' ? '钻采院' : 'Drilling Inst.', desc: '', icon: 'fa-oil-well', color: 'bg-cyan-50 text-cyan-600', isBeta: false },
    { id: 'cockpit', name: lang === 'zh' ? '经营驾驶舱' : 'Mgmt Cockpit', desc: '', icon: 'fa-tachometer-alt', color: 'bg-blue-50 text-blue-600', isBeta: false },
  ] : isEnterprise ? [
    { id: 'prod_analysis', name: lang === 'zh' ? '生产分析岗' : 'Production Analysis', desc: '', icon: 'fa-chart-line', color: 'bg-indigo-50 text-indigo-600', isBeta: false },
    { id: 'anomaly_inspect', name: lang === 'zh' ? '异常巡检岗' : 'Anomaly Inspection', desc: '', icon: 'fa-search-location', color: 'bg-rose-50 text-rose-600', isBeta: false },
    { id: 'drilling_eng', name: lang === 'zh' ? '钻井工程师' : 'Drilling Engineer', desc: '', icon: 'fa-hard-hat', color: 'bg-amber-50 text-amber-600', isBeta: false },
  ] : isPro ? [
    { id: 'pro_report', name: lang === 'zh' ? '专业报告' : 'Pro Report', desc: '', icon: 'fa-file-alt', color: 'bg-blue-50 text-blue-600', isBeta: false },
    { id: 'pro_ppt', name: lang === 'zh' ? '专业PPT' : 'Pro PPT', desc: '', icon: 'fa-file-powerpoint', color: 'bg-orange-50 text-orange-600', isBeta: false },
    { id: 'anomaly', name: lang === 'zh' ? '异常诊断' : 'Anomaly Diagnosis', desc: '', icon: 'fa-stethoscope', color: 'bg-red-50 text-red-600', isBeta: false },
    { id: 'scheme', name: lang === 'zh' ? '方案优选' : 'Scheme Optimization', desc: '', icon: 'fa-check-double', color: 'bg-green-50 text-green-600', isBeta: false },
    { id: 'trap', name: lang === 'zh' ? '圈闭有效性评价' : 'Trap Effectiveness', desc: '', icon: 'fa-bullseye', color: 'bg-purple-50 text-purple-600', isBeta: false },
    { id: 'well', name: lang === 'zh' ? '井位优选' : 'Well Location', desc: '', icon: 'fa-map-marker-alt', color: 'bg-teal-50 text-teal-600', isBeta: false },
    { id: 'geomapx', name: 'GeoMapX', desc: '', icon: 'fa-map', color: 'bg-indigo-50 text-indigo-600', isBeta: false },
  ] : [
    { id: 'report', name: lang === 'zh' ? '智能报告' : 'Smart Report', desc: '', icon: 'fa-file-alt', color: 'bg-blue-50 text-blue-600', isBeta: false },
    { id: 'ppt', name: lang === 'zh' ? '智能PPT' : 'Smart PPT', desc: '', icon: 'fa-file-powerpoint', color: 'bg-orange-50 text-orange-600', isBeta: false },
    { id: 'summary', name: lang === 'zh' ? '智能摘要' : 'Smart Summary', desc: '', icon: 'fa-align-left', color: 'bg-green-50 text-green-600', isBeta: false },
    { id: 'chart', name: lang === 'zh' ? '数据成图' : 'Data Charting', desc: '', icon: 'fa-chart-pie', color: 'bg-pink-50 text-pink-600', isBeta: false },
  ];

  const initialSessions = isFlagship ? [
    { id: 'f1', title: lang === 'zh' ? '塔里木盆地年度勘探部署方案' : 'Tarim Basin Annual Exploration Plan', expertId: 'geo_inst', time: '1d ago' },
    { id: 'f2', title: lang === 'zh' ? '深水钻井关键技术攻关报告' : 'Deepwater Drilling Tech Report', expertId: 'drill_inst', time: '2d ago' },
    { id: 'f3', title: lang === 'zh' ? '集团第一季度经营效益分析' : 'Q1 Group Management Benefit Analysis', expertId: 'cockpit', time: '3d ago' },
  ] : isEnterprise ? [
    { id: 'e1', title: lang === 'zh' ? 'A井区日产气量异常分析' : 'Block A Daily Gas Production Anomaly', expertId: 'prod_analysis', time: '1h ago', pendingConfirm: true },
    { id: 'e2', title: lang === 'zh' ? 'B区块设备运行状态巡检报告' : 'Block B Equipment Status Inspection', expertId: 'anomaly_inspect', time: '3h ago', pendingConfirm: false },
    { id: 'e3', title: lang === 'zh' ? 'X-2井钻井参数实时优化建议' : 'X-2 Well Drilling Parameter Optimization', expertId: 'drilling_eng', time: '5h ago', pendingConfirm: true },
  ] : isPro ? [
    { id: 'p1', title: lang === 'zh' ? 'X-1井区圈闭有效性评价报告' : 'X-1 Well Area Trap Effectiveness Report', expertId: 'trap', time: '2h ago' },
    { id: 'p2', title: lang === 'zh' ? 'A区块钻井方案优选对比' : 'Block A Drilling Scheme Optimization', expertId: 'scheme', time: '5h ago' },
    { id: 'p3', title: lang === 'zh' ? '测井曲线异常诊断分析' : 'Well Logging Curve Anomaly Diagnosis', expertId: 'anomaly', time: '1d ago' },
    { id: 'p4', title: lang === 'zh' ? '年度勘探专业汇报PPT' : 'Annual Exploration Pro PPT', expertId: 'pro_ppt', time: '2d ago' },
    { id: 'p5', title: lang === 'zh' ? '区块构造地质图生成' : 'Block Structural Geological Map', expertId: 'geomapx', time: '3d ago' },
  ] : [
    { id: '1', title: lang === 'zh' ? '第一季度钻井工程总结报告' : 'Q1 Drilling Engineering Report', expertId: 'report', time: '4h ago' },
    { id: '2', title: lang === 'zh' ? '项目汇报演示文稿生成' : 'Project Presentation Generation', expertId: 'ppt', time: '21h ago' },
    { id: '3', title: lang === 'zh' ? '地质构造分析摘要' : 'Geological Structure Summary', expertId: 'summary', time: '41d ago' },
    { id: '4', title: lang === 'zh' ? '产量趋势数据可视化' : 'Production Trend Data Visualization', expertId: 'chart', time: '45d ago' },
  ];

  const [recentSessions, setRecentSessions] = useState(initialSessions);

  useEffect(() => {
    setRecentSessions(initialSessions);
  }, [workspaceVersion, lang]);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleAddToResource = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(lang === 'zh' ? '已添加到资源' : 'Added to resources');
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(lang === 'zh' ? '打开编辑窗口' : 'Open edit window');
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 border-l border-slate-200 w-96 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <i className={`fas ${isFlagship ? 'fa-globe text-violet-500' : isEnterprise ? 'fa-user-tie text-indigo-500' : isPro ? 'fa-brain text-purple-500' : 'fa-bolt text-blue-500'}`}></i>
          {isFlagship
            ? (lang === 'zh' ? '智能体生态' : 'Agent Ecosystem')
            : isEnterprise 
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
              {tools.map(tool => (
                  <div key={tool.id} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group relative flex flex-col items-center text-center h-full">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-2 ${tool.color}`}>
                          <i className={`fas ${tool.icon}`}></i>
                      </div>
                      <h3 className="font-bold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors mb-1 line-clamp-1">{tool.name}</h3>
                      {tool.isBeta && (
                          <span className="bg-slate-800 text-white text-[8px] px-1 py-0.5 rounded font-bold uppercase tracking-wider absolute top-1 left-1 transform scale-75 origin-top-left">{t.beta}</span>
                      )}
                      
                      {isEnterprise ? (
                          <div className="mt-2 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                              <button 
                                  className="flex-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 py-1 rounded transition-colors flex items-center justify-center"
                                  title={lang === 'zh' ? '设置定时任务' : 'Set Scheduled Task'}
                                  onClick={(e) => { e.stopPropagation(); alert(lang === 'zh' ? '设置定时任务' : 'Set Scheduled Task'); }}
                              >
                                  <i className="fas fa-clock text-[10px]"></i>
                              </button>
                              <button 
                                  className="flex-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 py-1 rounded transition-colors flex items-center justify-center"
                                  title={lang === 'zh' ? '查看执行记录' : 'View Execution Records'}
                                  onClick={(e) => { e.stopPropagation(); alert(lang === 'zh' ? '查看执行记录' : 'View Execution Records'); }}
                              >
                                  <i className="fas fa-history text-[10px]"></i>
                              </button>
                          </div>
                      ) : (
                          <button 
                            className="absolute top-1 right-1 text-slate-300 hover:text-indigo-600 p-1 rounded-full hover:bg-slate-50 transition-colors opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (tool.id === 'pro_report') {
                                onCreateReport?.();
                              } else {
                                handleEdit(e);
                              }
                            }}
                          >
                              <i className="fas fa-pencil-alt text-xs"></i>
                          </button>
                      )}
                  </div>
              ))}
          </div>

          {/* Recent Sessions List */}
          <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">{lang === 'zh' ? '成果记录' : 'Outcome Records'}</h3>
              {recentSessions.map(session => {
                  const expert = tools.find(t => t.id === session.expertId) || tools[0];
                  return (
                  <div key={session.id} className="relative flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-100 hover:shadow-sm transition-all group">
                      <div className={`mt-1 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${expert.color}`}>
                          <i className={`fas ${expert.icon} text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0 cursor-pointer">
                          <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium text-slate-700 group-hover:text-blue-600 truncate">{session.title}</h4>
                              {session.pendingConfirm && (
                                  <span className="flex-shrink-0 bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                                      {lang === 'zh' ? '待人工确认' : 'Pending Confirm'}
                                  </span>
                              )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                              <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{expert.name}</span>
                              <span>•</span>
                              <span>{session.time}</span>
                          </div>
                      </div>
                      
                      {/* Ellipsis Button */}
                      <button 
                          onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === session.id ? null : session.id);
                          }}
                          className="text-slate-300 hover:text-slate-600 p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                          <i className="fas fa-ellipsis-v px-1"></i>
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdownId === session.id && (
                          <>
                              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }}></div>
                              <div className="absolute right-2 top-10 w-36 bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                                  <button 
                                      onClick={(e) => { handleEdit(e); setOpenDropdownId(null); }}
                                      className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                                  >
                                      <i className="fas fa-edit w-3 text-center"></i>
                                      {lang === 'zh' ? '编辑' : 'Edit'}
                                  </button>
                                  <button 
                                      onClick={(e) => { handleAddToResource(e); setOpenDropdownId(null); }}
                                      className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-green-600 flex items-center gap-2 transition-colors"
                                  >
                                      <i className="fas fa-plus-circle w-3 text-center"></i>
                                      {lang === 'zh' ? '添加到资源' : 'Add to Resource'}
                                  </button>
                                  <div className="h-px bg-slate-100 my-1"></div>
                                  <button 
                                      onClick={(e) => { handleDelete(session.id, e); setOpenDropdownId(null); }}
                                      className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-red-600 flex items-center gap-2 transition-colors"
                                  >
                                      <i className="fas fa-trash-alt w-3 text-center"></i>
                                      {lang === 'zh' ? '删除' : 'Delete'}
                                  </button>
                              </div>
                          </>
                      )}
                  </div>
              )})}
          </div>

          {/* Today's To-Do List (Enterprise Only) */}
          {isEnterprise && (
              <div className="space-y-2 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">{lang === 'zh' ? '今日待办事项' : "Today's To-Do"}</h3>
                  {[
                      { id: 't1', task: lang === 'zh' ? '生成A井区日报' : 'Generate Block A Daily Report', time: '18:00', expertId: 'prod_analysis' },
                      { id: 't2', task: lang === 'zh' ? 'B区块全网巡检' : 'Block B Network Inspection', time: '20:00', expertId: 'anomaly_inspect' },
                      { id: 't3', task: lang === 'zh' ? '钻井参数预警扫描' : 'Drilling Parameter Warning Scan', time: '22:30', expertId: 'drilling_eng' },
                  ].map(todo => {
                      const expert = tools.find(t => t.id === todo.expertId) || tools[0];
                      return (
                          <div key={todo.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100 hover:shadow-sm transition-all group">
                              <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${expert.color.split(' ')[0].replace('-50', '-400')}`}></div>
                                  <div className="flex flex-col">
                                      <span className="text-sm font-medium text-slate-700">{todo.task}</span>
                                      <span className="text-[10px] text-slate-400">{expert.name}</span>
                                  </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">
                                  <i className="far fa-clock"></i>
                                  {todo.time}
                              </div>
                          </div>
                      );
                  })}
              </div>
          )}
      </div>
    </div>
  );
};
