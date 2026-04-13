import React, { useState } from 'react';
import { Agent, Message } from '../types';
import ReactMarkdown from 'react-markdown';

// --- UserMessageCard ---
export const UserMessageCard = ({ message, avatar = 'ME' }: { message: Message, avatar?: string }) => {
  return (
    <div className="max-w-[720px] mx-auto mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0 mt-0.5">
          {avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm inline-block max-w-full">
            <div className="text-gray-800 text-sm leading-relaxed">
              {message.content}
            </div>
          </div>
          <div className="mt-1 ml-1 text-[10px] text-gray-400">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- LeaderCard ---
export const LeaderCard = ({ message, agent }: { message: Message, agent: Agent }) => {
  const [isThoughtExpanded, setIsThoughtExpanded] = useState(false);

  return (
    <div className="max-w-[720px] mx-auto mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white border border-orange-200 flex items-center justify-center text-lg shadow-sm flex-shrink-0 mt-0.5">
          {agent.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                {agent.name} <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded font-bold">LEADER</span>
              </div>
              <div className="text-[10px] text-gray-400">{new Date(message.timestamp).toLocaleTimeString()}</div>
            </div>

            {/* Collapsible Thought */}
            <div className="mb-0">
              <button 
                onClick={() => setIsThoughtExpanded(!isThoughtExpanded)}
                className="flex items-center gap-2 text-xs font-bold text-orange-800 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors w-full"
              >
                <i className={`fas fa-brain transition-transform ${isThoughtExpanded ? 'rotate-12' : ''}`}></i>
                任务理解与拆解
                <i className={`fas fa-chevron-${isThoughtExpanded ? 'up' : 'down'} ml-auto text-[10px]`}></i>
              </button>
              {isThoughtExpanded && (
                <div className="mt-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- AgentExecutionCard ---
export const AgentExecutionCard = ({ 
  agent, 
  status, 
  progress, 
  details, 
  version = 'foundation' 
}: { 
  agent: Agent, 
  status: string, 
  progress?: number,
  details?: any,
  version?: 'foundation' | 'professional' | 'enterprise' | 'flagship'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="max-w-[720px] mx-auto mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white border border-blue-200 flex items-center justify-center text-lg shadow-sm flex-shrink-0 mt-0.5 text-blue-600">
          {agent.avatar || <i className="fas fa-robot"></i>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-sm font-bold text-gray-800">{agent.name}</div>
                <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {status === 'completed' ? '已完成' : '执行中'}
                </div>
              </div>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
              >
                {isExpanded ? '收起详情' : '查看详情'}
                <i className={`fas fa-chevron-${isExpanded ? 'up' : 'right'} text-[8px]`}></i>
              </button>
            </div>

            {/* Progress Bar */}
            {status !== 'completed' && (
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500" 
                  style={{ width: `${progress || 30}%` }}
                ></div>
              </div>
            )}

            {/* Expanded Details */}
            {isExpanded && details && (
              <div className="mt-3 border-t border-gray-100 pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                {version === 'foundation' && details.type === 'loop' && (
                  <div className="space-y-3">
                    {details.thought && (
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                        <div className="text-[10px] font-bold text-purple-800 mb-1 flex items-center gap-2"><i className="fas fa-brain"></i> 思考</div>
                        <div className="text-xs text-gray-700">{details.thought}</div>
                      </div>
                    )}
                    {details.action && details.action.length > 0 && (
                      <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                        <div className="text-[10px] font-bold text-indigo-800 mb-1 flex items-center gap-2"><i className="fas fa-bolt"></i> 行动</div>
                        <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                          {details.action.map((a: string, i: number) => <li key={i}>{a}</li>)}
                        </ul>
                      </div>
                    )}
                    {details.observation && (
                      <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                        <div className="text-[10px] font-bold text-emerald-800 mb-1 flex items-center gap-2"><i className="fas fa-eye"></i> 观察</div>
                        <div className="text-xs text-gray-700">{details.observation}</div>
                      </div>
                    )}
                    {details.plan && (
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                        <div className="text-[10px] font-bold text-amber-800 mb-1 flex items-center gap-2"><i className="fas fa-arrow-right"></i> 下一步计划</div>
                        <div className="text-xs text-gray-700">{details.plan}</div>
                      </div>
                    )}
                  </div>
                )}

                {version === 'professional' && details.type === 'workflow' && (
                  <div className="space-y-3">
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                      <div className="text-[10px] font-bold text-indigo-800 mb-2 flex items-center gap-2">
                        <i className="fas fa-list-ol"></i> 标准 Workflow 步骤
                      </div>
                      <div className="space-y-2">
                        {details.steps.map((step: string, index: number) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                              index + 1 < details.currentStep ? 'bg-green-500 text-white' :
                              index + 1 === details.currentStep ? 'bg-indigo-600 text-white' :
                              'bg-gray-200 text-gray-500'
                            }`}>
                              {index + 1 < details.currentStep ? <i className="fas fa-check"></i> : index + 1}
                            </div>
                            <span className={`text-[11px] ${index + 1 === details.currentStep ? 'text-indigo-700 font-bold' : 'text-gray-600'}`}>
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {version === 'enterprise' && details.type === 'position' && (
                  <div className="grid grid-cols-2 gap-2">
                    {details.scenes.map((scene: any, i: number) => (
                      <div key={i} className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <div className="text-[10px] font-bold text-gray-800 mb-0.5">{scene.name}</div>
                        <div className="text-[9px] text-gray-500 mb-1 truncate">{scene.task}</div>
                        <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded w-fit ${scene.status === '已完成' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {scene.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- StageResultCard ---
export const StageResultCard = ({ title, finding, points }: { title: string, finding: string, points: string[] }) => {
  return (
    <div className="max-w-[720px] mx-auto p-4 md:p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl mb-4 shadow-sm">
      <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-3">
        <i className="fas fa-check-circle"></i> {title}
      </div>
      <div className="bg-white/80 rounded-lg p-3 border border-emerald-100 mb-3">
        <div className="text-sm font-bold text-gray-800 mb-1">关键发现</div>
        <div className="text-sm text-gray-700">{finding}</div>
      </div>
      {points && points.length > 0 && (
        <div className="bg-white/80 rounded-lg p-3 border border-emerald-100 mb-3">
          <div className="text-sm font-bold text-gray-800 mb-1">支撑依据</div>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {points.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}
      <div className="flex items-center gap-2 mt-4">
        <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 transition-colors">基于此继续分析</button>
        <button className="px-3 py-1.5 bg-white text-emerald-700 border border-emerald-200 text-xs font-bold rounded hover:bg-emerald-50 transition-colors">固化为规则</button>
        <button className="px-3 py-1.5 bg-white text-emerald-700 border border-emerald-200 text-xs font-bold rounded hover:bg-emerald-50 transition-colors">发送到能力区</button>
      </div>
    </div>
  );
};

// --- LoopCard ---
export const LoopCard = ({ title, status, thought, action, observation, plan }: { title: string, status: 'running' | 'completed', thought?: string, action?: string[], observation?: string, plan?: string }) => {
  const [isExpanded, setIsExpanded] = useState(status === 'running');

  return (
    <div className={`max-w-[720px] mx-auto border rounded-xl mb-4 shadow-sm transition-colors ${status === 'running' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
      <div 
        className="p-4 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${status === 'running' ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
            <i className="fas fa-sync-alt"></i>
          </div>
          <div className="font-bold text-sm text-gray-800">{title}</div>
          {status === 'running' && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
              <i className="fas fa-circle-notch fa-spin"></i> 执行中
            </span>
          )}
        </div>
        <div className="text-gray-400">
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-xs`}></i>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-3 border-t border-gray-100 mt-2">
          {thought && (
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
              <div className="text-xs font-bold text-purple-800 mb-1 flex items-center gap-2"><i className="fas fa-brain"></i> 思考</div>
              <div className="text-sm text-gray-700">{thought}</div>
            </div>
          )}
          {action && action.length > 0 && (
            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
              <div className="text-xs font-bold text-indigo-800 mb-1 flex items-center gap-2"><i className="fas fa-bolt"></i> 行动</div>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {action.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}
          {observation && (
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
              <div className="text-xs font-bold text-emerald-800 mb-1 flex items-center gap-2"><i className="fas fa-eye"></i> 观察</div>
              <div className="text-sm text-gray-700">{observation}</div>
            </div>
          )}
          {plan && (
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
              <div className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-2"><i className="fas fa-arrow-right"></i> 下一步计划</div>
              <div className="text-sm text-gray-700">{plan}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
// --- WorkflowCard ---
export const WorkflowCard = ({ title, steps, currentStep, status }: { title: string, steps: string[], currentStep: number, status: string }) => {
  return (
    <div className="max-w-[720px] mx-auto p-4 md:p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl mb-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-white border border-indigo-200 flex items-center justify-center text-lg shadow-sm text-indigo-600">
          <i className="fas fa-project-diagram"></i>
        </div>
        <div>
          <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
            场景智能体｜{title}
          </div>
          <div className="text-[10px] text-gray-500">标准 Workflow 执行中</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white/60 rounded-lg p-3 border border-indigo-100">
          <div className="text-xs font-bold text-indigo-800 mb-3 flex items-center gap-2">
            <i className="fas fa-list-ol"></i> 标准 Workflow 步骤
          </div>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  index + 1 < currentStep ? 'bg-green-500 text-white' :
                  index + 1 === currentStep ? 'bg-indigo-600 text-white animate-pulse' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1 < currentStep ? <i className="fas fa-check"></i> : index + 1}
                </div>
                <span className={`text-xs ${index + 1 === currentStep ? 'text-indigo-700 font-bold' : 'text-gray-600'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-600 text-white rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            <span className="text-xs font-bold uppercase tracking-wider">当前状态</span>
          </div>
          <span className="text-xs font-medium">{status}</span>
        </div>
      </div>
    </div>
  );
};

// --- ChartCard ---
export const ChartCard = ({ title, observation, data, type = 'line' }: { title: string, observation: string, data?: { label: string, values: number[], color: string }[], type?: 'line' | 'bar' }) => {
  const defaultData = [
    { label: '产量 (m³/d)', values: [102, 101, 99, 98, 97, 96, 95], color: '#4f46e5' },
    { label: '压力 (MPa)', values: [25, 24.5, 24, 23.8, 23.5, 23.2, 23], color: '#ef4444' },
    { label: '含水率 (%)', values: [15, 15.2, 15.5, 15.8, 16.2, 16.5, 16.8], color: '#10b981' }
  ];

  const chartData = data || defaultData;
  const days = ['04-04', '04-05', '04-06', '04-07', '04-08', '04-09', '04-10'];

  return (
    <div className="max-w-[720px] mx-auto p-4 md:p-6 bg-white border border-gray-200 rounded-xl mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
          <i className={`fas ${type === 'bar' ? 'fa-chart-bar' : 'fa-chart-line'} text-indigo-500`}></i> {title}
        </div>
        <div className="flex gap-3">
          {chartData.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
              <span className="text-[10px] text-gray-500 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="w-full h-56 bg-slate-50/50 rounded-lg border border-slate-100 p-4 mb-4 relative">
        <svg viewBox="0 0 400 200" className="w-full h-full overflow-visible">
          {/* Grid Lines */}
          {[0, 50, 100, 150, 200].map(y => (
            <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
          ))}
          
          {/* Data Visualization */}
          {type === 'bar' ? (
            <g>
              {chartData[0].values.map((v, i) => {
                const max = Math.max(...chartData[0].values);
                const barHeight = (v / max) * 160;
                const x = (i / chartData[0].values.length) * 400 + 10;
                const width = (400 / chartData[0].values.length) - 20;
                return (
                  <rect
                    key={i}
                    x={x}
                    y={180 - barHeight}
                    width={width}
                    height={barHeight}
                    fill={chartData[0].color}
                    rx="4"
                    className="transition-all duration-500 hover:opacity-80"
                  />
                );
              })}
            </g>
          ) : (
            chartData.map((series, sIdx) => {
              const max = Math.max(...series.values);
              const min = Math.min(...series.values);
              const range = max - min || 1;
              
              const points = series.values.map((v, i) => {
                const x = (i / (series.values.length - 1)) * 400;
                const y = 180 - ((v - min) / range) * 160;
                return `${x},${y}`;
              }).join(' ');

              return (
                <g key={sIdx}>
                  <polyline
                    points={points}
                    fill="none"
                    stroke={series.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-500"
                  />
                  {series.values.map((v, i) => {
                    const x = (i / (series.values.length - 1)) * 400;
                    const y = 180 - ((v - min) / range) * 160;
                    return (
                      <circle key={i} cx={x} cy={y} r="3.5" fill="white" stroke={series.color} strokeWidth="2" />
                    );
                  })}
                </g>
              );
            })
          )}
        </svg>
        
        <div className="flex justify-between w-full mt-2 text-[9px] text-slate-400 font-mono px-1">
          {days.map((d, i) => <span key={i}>{d}</span>)}
        </div>
      </div>

      <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
        <div className="text-xs font-bold text-indigo-800 mb-1 flex items-center gap-2">
          <i className="fas fa-eye"></i> 趋势识别结果
        </div>
        <div className="text-sm text-gray-700 leading-relaxed">{observation}</div>
      </div>
    </div>
  );
};

// --- UnifiedResponseCard ---
export const UnifiedResponseCard = ({ messages, agents, version }: { messages: Message[], agents: Agent[], version: string }) => {
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [expandedSteps, setExpandedSteps] = useState<Record<string, Record<number, boolean>>>({});
  const [expandedScenarios, setExpandedScenarios] = useState<Record<string, Record<number, boolean>>>({});
  const [expandedScenarioSteps, setExpandedScenarioSteps] = useState<Record<string, Record<number, Record<number, boolean>>>>({});
  const [isThoughtExpanded, setIsThoughtExpanded] = useState(false);

  const toggleDetails = (id: string) => {
    setExpandedDetails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStepDetails = (msgId: string, stepIdx: number) => {
    setExpandedSteps(prev => ({
      ...prev,
      [msgId]: {
        ...(prev[msgId] || {}),
        [stepIdx]: !(prev[msgId]?.[stepIdx])
      }
    }));
  };

  const toggleScenarioDetails = (msgId: string, scenarioIdx: number) => {
    setExpandedScenarios(prev => ({
      ...prev,
      [msgId]: {
        ...(prev[msgId] || {}),
        [scenarioIdx]: !(prev[msgId]?.[scenarioIdx])
      }
    }));
  };

  const toggleScenarioStepDetails = (msgId: string, scenarioIdx: number, stepIdx: number) => {
    setExpandedScenarioSteps(prev => ({
      ...prev,
      [msgId]: {
        ...(prev[msgId] || {}),
        [scenarioIdx]: {
          ...(prev[msgId]?.[scenarioIdx] || {}),
          [stepIdx]: !(prev[msgId]?.[scenarioIdx]?.[stepIdx])
        }
      }
    }));
  };

  return (
    <div className="max-w-[720px] mx-auto mb-8">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 space-y-6">
          {messages.map((msg, index) => {
            const agent = agents.find(a => a.id === msg.agentId);
            
            // 1. Thought Section (First model message usually)
            if (index === 0 && msg.status !== 'error') {
              return (
                <div key={msg.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <i className="fas fa-brain text-orange-400"></i> 思考
                    </div>
                    <button 
                      onClick={() => setIsThoughtExpanded(!isThoughtExpanded)}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                    >
                      {isThoughtExpanded ? '收起思考' : '查看思考'}
                      <i className={`fas fa-chevron-${isThoughtExpanded ? 'up' : 'right'} text-[8px]`}></i>
                    </button>
                  </div>
                  {isThoughtExpanded && (
                    <div className="text-sm text-gray-600 leading-relaxed bg-orange-50/30 p-3 rounded-xl border border-orange-100/50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              );
            }

            // 2. Workflow Card (Professional)
            if (msg.cardType === 'workflow') {
              return (
                <div key={msg.id} className="border-t border-gray-50 pt-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-sm border border-indigo-100 text-indigo-600">
                      <i className="fas fa-project-diagram"></i>
                    </div>
                    <div className="text-sm font-bold text-gray-800">
                      {msg.payload?.category ? `${msg.payload.category}｜` : '场景智能体｜'}{msg.payload?.title}
                    </div>
                  </div>
                  <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                    <div className="space-y-4">
                      {msg.payload?.steps.map((step: any, idx: number) => {
                        const stepName = typeof step === 'string' ? step : step.name;
                        const stepDetails = typeof step === 'object' ? step.details : null;
                        const isStepExpanded = expandedSteps[msg.id]?.[idx] || false;
                        const isCurrent = idx + 1 === msg.payload.currentStep;
                        const isCompleted = idx + 1 < msg.payload.currentStep;

                        return (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  isCompleted ? 'bg-green-500 text-white' :
                                  isCurrent ? 'bg-indigo-600 text-white animate-pulse' :
                                  'bg-gray-200 text-gray-500'
                                }`}>
                                  {isCompleted ? <i className="fas fa-check"></i> : idx + 1}
                                </div>
                                <span className={`text-xs ${isCurrent ? 'text-indigo-700 font-bold' : 'text-gray-600'}`}>
                                  {stepName}
                                </span>
                              </div>
                              {(stepDetails || isCurrent) && (
                                <button 
                                  onClick={() => toggleStepDetails(msg.id, idx)}
                                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-600 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                                >
                                  {isStepExpanded ? '收起详情' : '查看详情'}
                                  <i className={`fas fa-chevron-${isStepExpanded ? 'up' : 'right'} text-[8px]`}></i>
                                </button>
                              )}
                            </div>
                            
                            {isStepExpanded && stepDetails && (
                              <div className="ml-8 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                {stepDetails.thought && (
                                  <div className="bg-white/60 rounded-lg p-2 border border-purple-100/50">
                                    <div className="text-[9px] font-bold text-purple-800 mb-0.5 flex items-center gap-1.5"><i className="fas fa-brain"></i> 思考</div>
                                    <div className="text-[11px] text-gray-600">{stepDetails.thought}</div>
                                  </div>
                                )}
                                {stepDetails.action && stepDetails.action.length > 0 && (
                                  <div className="bg-white/60 rounded-lg p-2 border border-indigo-100/50">
                                    <div className="text-[9px] font-bold text-indigo-800 mb-0.5 flex items-center gap-1.5"><i className="fas fa-bolt"></i> 行动</div>
                                    <ul className="list-disc list-inside text-[11px] text-gray-600 space-y-0.5">
                                      {stepDetails.action.map((a: string, i: number) => <li key={i}>{a}</li>)}
                                    </ul>
                                  </div>
                                )}
                                {stepDetails.observation && (
                                  <div className="bg-white/60 rounded-lg p-2 border border-emerald-100/50">
                                    <div className="text-[9px] font-bold text-emerald-800 mb-0.5 flex items-center gap-1.5"><i className="fas fa-eye"></i> 观察</div>
                                    <div className="text-[11px] text-gray-600">{stepDetails.observation}</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">当前状态</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium">{msg.payload?.status}</span>
                    </div>
                  </div>
                </div>
              );
            }

            // 3. Position Card (Enterprise)
            if (msg.cardType === 'position') {
              return (
                <div key={msg.id} className="border-t border-gray-50 pt-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center text-sm border border-purple-100 text-purple-600">
                      <i className="fas fa-user-tie"></i>
                    </div>
                    <div className="text-sm font-bold text-gray-800">
                      岗位智能体｜{msg.payload?.title}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {msg.payload?.scenarios.map((sc: any, idx: number) => {
                        const isScenarioExpanded = expandedScenarios[msg.id]?.[idx] || false;
                        return (
                          <div key={idx} className="flex flex-col gap-2">
                            <div className={`p-3 bg-white border rounded-xl shadow-sm flex items-center justify-between group transition-all ${
                              isScenarioExpanded ? 'border-purple-300 ring-1 ring-purple-100' : 'border-gray-100 hover:border-purple-200'
                            }`}>
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  sc.status === 'completed' ? 'bg-green-500' : 
                                  sc.status === 'processing' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                                }`}></div>
                                <span className="text-xs text-gray-700 truncate font-medium">{sc.name}</span>
                              </div>
                              <button 
                                onClick={() => toggleScenarioDetails(msg.id, idx)}
                                className="text-[10px] font-bold text-purple-400 hover:text-purple-600 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                              >
                                {isScenarioExpanded ? '收起' : '详情'}
                                <i className={`fas fa-chevron-${isScenarioExpanded ? 'up' : 'right'} text-[8px]`}></i>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Expanded Scenario Details */}
                    {msg.payload?.scenarios.map((sc: any, scIdx: number) => {
                      const isScenarioExpanded = expandedScenarios[msg.id]?.[scIdx] || false;
                      if (!isScenarioExpanded || !sc.workflow) return null;

                      return (
                        <div key={`sc-detail-${scIdx}`} className="bg-purple-50/30 rounded-xl p-4 border border-purple-100 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center gap-2 mb-4">
                            <i className="fas fa-project-diagram text-purple-500 text-xs"></i>
                            <span className="text-xs font-bold text-purple-900">{sc.name} 执行流</span>
                          </div>
                          <div className="space-y-4">
                            {sc.workflow.steps.map((step: any, stepIdx: number) => {
                              const isStepExpanded = expandedScenarioSteps[msg.id]?.[scIdx]?.[stepIdx] || false;
                              const isCurrent = stepIdx + 1 === sc.workflow.currentStep;
                              const isCompleted = stepIdx + 1 < sc.workflow.currentStep;

                              return (
                                <div key={stepIdx} className="space-y-2">
                                  <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                        isCompleted ? 'bg-green-500 text-white' :
                                        isCurrent ? 'bg-purple-600 text-white animate-pulse' :
                                        'bg-gray-200 text-gray-500'
                                      }`}>
                                        {isCompleted ? <i className="fas fa-check"></i> : stepIdx + 1}
                                      </div>
                                      <span className={`text-[11px] ${isCurrent ? 'text-purple-700 font-bold' : 'text-gray-600'}`}>
                                        {step.name}
                                      </span>
                                    </div>
                                    {(step.details || isCurrent) && (
                                      <button 
                                        onClick={() => toggleScenarioStepDetails(msg.id, scIdx, stepIdx)}
                                        className="text-[9px] font-bold text-purple-400 hover:text-purple-600 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                                      >
                                        {isStepExpanded ? '收起详情' : '查看详情'}
                                        <i className={`fas fa-chevron-${isStepExpanded ? 'up' : 'right'} text-[7px]`}></i>
                                      </button>
                                    )}
                                  </div>
                                  
                                  {isStepExpanded && step.details && (
                                    <div className="ml-7 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                      {step.details.thought && (
                                        <div className="bg-white/80 rounded-lg p-2 border border-purple-100/50">
                                          <div className="text-[9px] font-bold text-purple-800 mb-0.5 flex items-center gap-1.5"><i className="fas fa-brain"></i> 思考</div>
                                          <div className="text-[10px] text-gray-600 leading-relaxed">{step.details.thought}</div>
                                        </div>
                                      )}
                                      {step.details.action && step.details.action.length > 0 && (
                                        <div className="bg-white/80 rounded-lg p-2 border border-indigo-100/50">
                                          <div className="text-[9px] font-bold text-indigo-800 mb-0.5 flex items-center gap-1.5"><i className="fas fa-bolt"></i> 行动</div>
                                          <ul className="list-disc list-inside text-[10px] text-gray-600 space-y-0.5">
                                            {step.details.action.map((a: string, i: number) => <li key={i}>{a}</li>)}
                                          </ul>
                                        </div>
                                      )}
                                      {step.details.observation && (
                                        <div className="bg-white/80 rounded-lg p-2 border border-emerald-100/50">
                                          <div className="text-[9px] font-bold text-emerald-800 mb-0.5 flex items-center gap-1.5"><i className="fas fa-eye"></i> 观察</div>
                                          <div className="text-[10px] text-gray-600 leading-relaxed">{step.details.observation}</div>
                                        </div>
                                      )}
                                      {step.details.plan && (
                                        <div className="bg-white/80 rounded-lg p-2 border border-amber-100/50">
                                          <div className="text-[9px] font-bold text-amber-800 mb-0.5 flex items-center gap-1.5"><i className="fas fa-arrow-right"></i> 下一步计划</div>
                                          <div className="text-[10px] text-gray-600 leading-relaxed">{step.details.plan}</div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // 4. Agent Execution (Loop)
            if (msg.cardType === 'loop' || (agent && !agent.isLeader && msg.cardType !== 'stage_result' && msg.cardType !== 'chart')) {
              const isExpanded = expandedDetails[msg.id] || false;
              const details = msg.cardType === 'loop' ? { type: 'loop', ...msg.payload } : msg.payload;

              return (
                <div key={msg.id} className="border-t border-gray-50 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-sm border border-blue-100 text-blue-600">
                        {agent?.avatar || <i className="fas fa-robot"></i>}
                      </div>
                      <div className="text-sm font-bold text-gray-800">
                        正在调用：{agent?.name || '智能助手'}
                      </div>
                      <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        msg.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {msg.status === 'completed' ? '已完成' : '执行中'}
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleDetails(msg.id)}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                    >
                      {isExpanded ? '收起详情' : '查看详情'}
                      <i className={`fas fa-chevron-${isExpanded ? 'up' : 'right'} text-[8px]`}></i>
                    </button>
                  </div>

                  {msg.status !== 'completed' && (
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-blue-500 animate-pulse" style={{ width: '45%' }}></div>
                    </div>
                  )}

                  {isExpanded && details && (
                    <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      {details.thought && (
                        <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-100/50">
                          <div className="text-[10px] font-bold text-purple-800 mb-1 flex items-center gap-2"><i className="fas fa-brain"></i> 思考</div>
                          <div className="text-xs text-gray-600">{details.thought}</div>
                        </div>
                      )}
                      {details.action && details.action.length > 0 && (
                        <div className="bg-indigo-50/50 rounded-lg p-3 border border-indigo-100/50">
                          <div className="text-[10px] font-bold text-indigo-800 mb-1 flex items-center gap-2"><i className="fas fa-bolt"></i> 行动</div>
                          <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                            {details.action.map((a: string, i: number) => <li key={i}>{a}</li>)}
                          </ul>
                        </div>
                      )}
                      {details.observation && (
                        <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-100/50">
                          <div className="text-[10px] font-bold text-emerald-800 mb-1 flex items-center gap-2"><i className="fas fa-eye"></i> 观察</div>
                          <div className="text-xs text-gray-600">{details.observation}</div>
                        </div>
                      )}
                      {details.plan && (
                        <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100/50">
                          <div className="text-[10px] font-bold text-amber-800 mb-1 flex items-center gap-2"><i className="fas fa-arrow-right"></i> 下一步计划</div>
                          <div className="text-xs text-gray-600">{details.plan}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            // 5. Stage Result (Natural language only)
            if (msg.cardType === 'stage_result') {
              return (
                <div key={msg.id} className="border-t border-gray-50 pt-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-2">
                    <i className="fas fa-check-circle"></i> 阶段结论
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {msg.payload?.finding}
                  </div>
                </div>
              );
            }

            // 6. Chart Card
            if (msg.cardType === 'chart') {
              return <ChartCard key={msg.id} {...msg.payload} />;
            }

            // 7. Final Result
            if (msg.payload?.conclusion || (index === messages.length - 1 && msg.status === 'completed')) {
              return (
                <div key={msg.id} className="border-t border-gray-100 pt-6 mt-4">
                  <div className="text-sm text-gray-800 leading-relaxed mb-6">
                    <ReactMarkdown>{msg.payload?.conclusion || msg.content}</ReactMarkdown>
                  </div>
                  
                  {msg.payload?.recommendations && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                      <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">建议方案</div>
                      <div className="space-y-2">
                        {msg.payload.recommendations.map((rec: string, i: number) => (
                          <div key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm">
                      <i className="fas fa-save"></i> 保存为成果
                    </button>
                    <div className="flex items-center gap-1">
                      <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors" title="重新生成"><i className="fas fa-redo-alt text-xs"></i></button>
                      <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors" title="复制"><i className="fas fa-copy text-xs"></i></button>
                      <div className="w-px h-3 bg-gray-200 mx-1"></div>
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="点赞"><i className="far fa-thumbs-up text-xs"></i></button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="点踩"><i className="far fa-thumbs-down text-xs"></i></button>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export const FinalResultCard = ({ message, agent }: { message: Message, agent: Agent }) => {
  return (
    <div className="max-w-[720px] mx-auto mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white border border-purple-200 flex items-center justify-center text-lg shadow-sm flex-shrink-0 mt-0.5">
          <i className="fas fa-trophy text-purple-500"></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            {message.payload ? (
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <div className="text-sm font-bold text-purple-800 mb-2 flex items-center gap-2">
                    <i className="fas fa-flag-checkered"></i> 核心结论 Conclusion
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed">{message.payload.conclusion}</div>
                </div>

                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                  <div className="text-sm font-bold text-indigo-800 mb-2 flex items-center gap-2">
                    <i className="fas fa-clipboard-list"></i> 建议方案 Recommendations
                  </div>
                  <div className="space-y-2">
                    {message.payload.recommendations.map((rec: string, i: number) => (
                      <div key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></div>
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <i className="fas fa-box-open"></i> 自动输出物 Outputs
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {message.payload.outputs.map((out: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-white text-blue-700 border border-blue-100 rounded text-xs font-medium">
                        {out}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all">
                    <i className="fas fa-magic mr-2"></i> 一键生成完整报告
                  </button>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors" title="保存为成果"><i className="fas fa-save"></i></button>
                    <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors" title="重新生成"><i className="fas fa-redo-alt"></i></button>
                    <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors" title="复制"><i className="fas fa-copy"></i></button>
                    <button className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="点赞"><i className="far fa-thumbs-up"></i></button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="点踩"><i className="far fa-thumbs-down"></i></button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-800 prose prose-sm max-w-none">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
