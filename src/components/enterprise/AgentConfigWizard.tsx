import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Agent, Language } from '../../types';
import { 
  User, 
  Zap, 
  Terminal, 
  Calendar, 
  ShieldCheck, 
  ChevronDown, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock,
  Layout,
  Plus,
  Trash2,
  Save,
  Send,
  X
} from 'lucide-react';

interface AgentConfigWizardProps {
  agent: Agent;
  onSave: (updatedAgent: Agent) => void;
  onCancel: () => void;
  lang?: Language;
}

export const AgentConfigWizard: React.FC<AgentConfigWizardProps> = ({ agent, onSave, onCancel, lang = 'zh' }) => {
  const [formData, setFormData] = useState<Agent>({ ...agent });
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    identity: true,
    tasks: true,
    execution: true,
    schedule: true,
    control: true
  });

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateFormData = (patch: Partial<Agent>) => {
    setFormData(prev => ({ ...prev, ...patch }));
  };

  const t = {
    zh: {
      title: '配置数字员工',
      subtitle: '定义任务触发机制、执行逻辑与成果处理规则',
      summaryTitle: '数字员工行为总览',
      summaryPrefix: '该数字员工将：',
      at: '在',
      timeAt: '时',
      autoExec: '自动执行',
      andGen: '，并生成',
      andSend: '，发送',
      needManual: '，在【异常时】需人工确认。',
      identity: '员工身份',
      identityDesc: '定义这个数字员工是谁',
      tasks: '触发与任务',
      tasksDesc: '定义员工在什么情况下开始工作，以及要做什么',
      execution: '执行方式',
      executionDesc: '定义员工的工作方式',
      schedule: '调度机制',
      scheduleDesc: '定义执行时间策略',
      control: '结果与管控',
      controlDesc: '定义输出、通知与审核机制',
      saveDraft: '保存为草稿',
      deploy: '保存并部署',
      validated: '配置校验结果：已通过',
      whenTrigger: '何时触发',
      whatTasks: '任务列表',
      roleRules: '角色规则 (System Prompt)',
      taskInstructions: '任务指令 (Task Prompt)',
      outputStructure: '输出结构',
      references: '参考信息',
      constraints: '行为约束',
      add: '添加',
      name: '员工名称',
      role: '角色职责',
      tags: '能力标签'
    },
    en: {
      title: 'Configure Agent',
      subtitle: 'Define trigger mechanisms, execution logic, and handling rules',
      summaryTitle: 'Agent Behavior Overview',
      summaryPrefix: 'This agent will:',
      at: 'At',
      timeAt: '',
      autoExec: 'automatically execute',
      andGen: ', generate',
      andSend: ', and send',
      needManual: ', requiring manual confirmation in case of anomalies.',
      identity: 'Identity',
      identityDesc: 'Define who this agent is',
      tasks: 'Triggers & Tasks',
      tasksDesc: 'Define when the agent starts and what tasks to perform',
      execution: 'Execution',
      executionDesc: 'Define how the agent works',
      schedule: 'Scheduling',
      scheduleDesc: 'Define execution time strategies',
      control: 'Results & Control',
      controlDesc: 'Define output, notifications, and audit mechanisms',
      saveDraft: 'Save Draft',
      deploy: 'Deploy Agent',
      validated: 'Validation Result: Passed',
      whenTrigger: 'Triggers',
      whatTasks: 'Tasks',
      roleRules: 'Role Rules (System Prompt)',
      taskInstructions: 'Task Instructions (Task Prompt)',
      outputStructure: 'Output Structure',
      references: 'References',
      constraints: 'Constraints',
      add: 'Add',
      name: 'Agent Name',
      role: 'Role & Responsibility',
      tags: 'Capabilities'
    }
  }[lang];

  // Real-time summary logic
  const behaviorSummary = useMemo(() => {
    const triggers = formData.scenarios?.flatMap(s => s.triggers).filter((v, i, a) => a.indexOf(v) === i) || [];
    const triggerText = triggers.length > 0 
      ? triggers.map(t => t === 'Data' ? (lang === 'zh' ? '数据更新' : 'Data Update') : 
                        t === 'Threshold' ? (lang === 'zh' ? '指标异常' : 'Threshold Alert') : 
                        t === 'Schedule' ? (lang === 'zh' ? '定时触发' : 'Scheduled') : 
                        (lang === 'zh' ? '手动' : 'Manual')).join(' / ')
      : '...';
    
    const taskText = formData.scenarios?.map(s => s.name).join('、') || '...';
    const outputType = formData.instructions?.outputFormat || (lang === 'zh' ? '分析报告' : 'Report');
    const notifyText = formData.resultHandling?.notifications?.join('、') || (lang === 'zh' ? '站内通知' : 'Site Notification');

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
        <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-[0.2em]">{t.summaryTitle}</p>
        <p className="text-xs font-bold text-slate-500 mb-2">{t.summaryPrefix}</p>
        <div className="text-slate-800 font-bold leading-relaxed text-sm">
          {lang === 'zh' ? (
            <>
              在【<span className="text-indigo-600 bg-indigo-50 px-1 rounded">{triggerText}</span>】时，
              自动执行【<span className="text-indigo-600 bg-indigo-50 px-1 rounded">{taskText}</span>】，
              并生成【<span className="text-indigo-600 bg-indigo-50 px-1 rounded">{outputType}</span>】，发送【<span className="text-indigo-600 bg-indigo-50 px-1 rounded">{notifyText}</span>】{t.needManual}
            </>
          ) : (
            <>
              At 【<span className="text-indigo-600 bg-indigo-50 px-1 rounded">{triggerText}</span>】,
              it will {t.autoExec} 【<span className="text-indigo-600 bg-indigo-50 px-1 rounded">{taskText}</span>】,
              generate 【<span className="text-indigo-600 bg-indigo-50 px-1 rounded">{outputType}</span>】, send 【<span className="text-indigo-600 bg-indigo-50 px-1 rounded">{notifyText}</span>】 {t.needManual}
            </>
          )}
        </div>
      </div>
    );
  }, [formData, lang, t]);

  const ModuleWrapper = ({ id, icon, title, description, children }: { id: string, icon: React.ReactNode, title: string, description: string, children: React.ReactNode }) => (
    <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden mb-6">
      <button 
        onClick={() => toggleModule(id)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            <p className="text-[10px] text-slate-400 font-medium">{description}</p>
          </div>
        </div>
        {expandedModules[id] ? <ChevronDown className="w-4 h-4 text-slate-300" /> : <ChevronRight className="w-4 h-4 text-slate-300" />}
      </button>
      <AnimatePresence initial={false}>
        {expandedModules[id] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-6 border-t border-slate-50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-white px-8 py-5 border-b border-slate-200 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="w-10 h-10 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.title}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {/* Summary Section */}
          {behaviorSummary}

          {/* Module 1: Identity */}
          <ModuleWrapper 
            id="identity" 
            icon={<User className="w-5 h-5" />} 
            title={t.identity} 
            description={t.identityDesc}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t.name}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t.role}</label>
                <textarea 
                  rows={2}
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t.tags}</label>
                <div className="flex flex-wrap gap-2">
                  {['产量分析', '异常诊断', '报告生成', '预警推送', '数据清洗', '阈值监控'].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => {
                        const tags = formData.tags || [];
                        const newTags = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
                        updateFormData({ tags: newTags });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                        (formData.tags || []).includes(tag) 
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-200' 
                          : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ModuleWrapper>

          {/* Module 2: Triggers & Tasks */}
          <ModuleWrapper 
            id="tasks" 
            icon={<Zap className="w-5 h-5" />} 
            title={t.tasks} 
            description={t.tasksDesc}
          >
            <div className="space-y-8">
              {/* Triggers */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t.whenTrigger}</h4>
                <div className="flex gap-4">
                  {[
                    { id: 'Data', name: '数据更新', icon: <Layout className="w-4 h-4" /> },
                    { id: 'Threshold', name: '指标异常', icon: <AlertCircle className="w-4 h-4" /> },
                    { id: 'Schedule', name: '定时触发', icon: <Clock className="w-4 h-4" /> }
                  ].map(trigger => {
                    const active = formData.scenarios?.[0]?.triggers.includes(trigger.id as any);
                    return (
                      <button 
                        key={trigger.id}
                        onClick={() => {
                          const scenarios = [...(formData.scenarios || [])];
                          if (scenarios.length === 0) {
                            scenarios.push({ id: '1', name: '产量波动归因分析', triggers: [trigger.id as any], isEnabled: true, priority: 10, description: '' });
                          } else {
                            const current = scenarios[0].triggers;
                            const next = current.includes(trigger.id as any) ? current.filter(t => t !== trigger.id) : [...current, trigger.id as any];
                            scenarios[0].triggers = next;
                          }
                          updateFormData({ scenarios });
                        }}
                        className={`flex-1 p-5 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                          active ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-50 text-slate-400 hover:bg-slate-100/50 hover:border-slate-200'
                        }`}
                      >
                        {trigger.icon}
                        <span className="text-xs font-bold">{trigger.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tasks List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.whatTasks}</h4>
                  <button className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                    <Plus className="w-3.5 h-3.5" />
                    {t.add}
                  </button>
                </div>
                <div className="space-y-3">
                  {(formData.scenarios && formData.scenarios.length > 0 ? formData.scenarios : [
                    { id: '1', name: '产量波动归因分析', priority: 10 },
                    { id: '2', name: '区块状态评估', priority: 5 }
                  ]).map((s, idx) => (
                    <div key={s.id} className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                        <span className="text-xs font-bold text-slate-700">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.priority && s.priority > 7 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                          优先级：{s.priority && s.priority > 7 ? '高' : '中'}
                        </span>
                        <button className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ModuleWrapper>

          {/* Module 3: Execution Mode */}
          <ModuleWrapper 
            id="execution" 
            icon={<Terminal className="w-5 h-5" />} 
            title={t.execution} 
            description={t.executionDesc}
          >
            <div className="space-y-8">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t.roleRules}</label>
                <textarea 
                  rows={4}
                  value={formData.instructions?.systemPrompt}
                  onChange={(e) => updateFormData({ instructions: { ...formData.instructions, systemPrompt: e.target.value } as any })}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none"
                  placeholder="请输入系统提示词..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t.taskInstructions}</label>
                <textarea 
                  rows={4}
                  value={formData.instructions?.taskPrompt}
                  onChange={(e) => updateFormData({ instructions: { ...formData.instructions, taskPrompt: e.target.value } as any })}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none"
                  placeholder="请输入具体任务指令..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t.outputStructure}</label>
                  <div className="space-y-2">
                    {[
                      { id: 'Report', name: '结构化报告' },
                      { id: 'Table', name: '数据表格' },
                      { id: 'Summary', name: '文本摘要' }
                    ].map(opt => (
                      <label key={opt.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-50 cursor-pointer hover:bg-slate-100 transition-all">
                        <input 
                           type="radio" 
                           name="outputType" 
                           checked={formData.instructions?.outputFormat === opt.id}
                           onChange={() => updateFormData({ instructions: { ...formData.instructions, outputFormat: opt.id as any } as any })}
                           className="w-4 h-4 text-indigo-600 border-slate-300" 
                        />
                        <span className="text-xs font-bold text-slate-700">{opt.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t.references}</label>
                  <div className="h-full min-h-[120px] p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-slate-100 hover:border-indigo-200 transition-all">
                    <Plus className="w-6 h-6 text-slate-300 group-hover:text-indigo-400" />
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">上传文件 / 粘贴内容</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t.constraints}</label>
                <textarea 
                  rows={2}
                  value={formData.instructions?.constraints}
                  onChange={(e) => updateFormData({ instructions: { ...formData.instructions, constraints: e.target.value } as any })}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none"
                  placeholder="限制该智能体的某些行为或输出边界..."
                />
              </div>
            </div>
          </ModuleWrapper>

          {/* Module 4: Schedule */}
          <ModuleWrapper 
            id="schedule" 
            icon={<Calendar className="w-5 h-5" />} 
            title={t.schedule} 
            description={t.scheduleDesc}
          >
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'Daily', name: '固定时间', desc: '每天 08:00', icon: <Clock className="w-4 h-4" /> },
                    { id: 'Weekly', name: '周期执行', desc: '每周 一/三/五', icon: <Calendar className="w-4 h-4" /> },
                    { id: 'Data', name: '数据触发', desc: '数据更新后执行', icon: <Layout className="w-4 h-4" /> },
                    { id: 'Threshold', name: '指标触发', desc: '当指标超过阈值时', icon: <AlertCircle className="w-4 h-4" /> }
                  ].map(mode => {
                    const active = formData.schedules?.some(s => s.mode === mode.id || (mode.id === 'Daily' && s.mode === 'Schedule'));
                    return (
                      <button 
                       key={mode.id}
                       onClick={() => {
                         const nextMode = mode.id === 'Daily' ? 'Schedule' : mode.id;
                         updateFormData({ schedules: [{ mode: nextMode as any, frequency: 'Daily', time: '08:00' }] });
                       }}
                       className={`p-5 bg-white border rounded-2xl hover:shadow-sm transition-all text-left flex items-start justify-between group ${
                         active ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 hover:border-indigo-300'
                       }`}
                      >
                        <div>
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all ${
                             active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50'
                           }`}>
                             {mode.icon}
                           </div>
                           <p className={`text-xs font-bold ${active ? 'text-indigo-700' : 'text-slate-800'}`}>{mode.name}</p>
                           <p className="text-[10px] text-slate-400 font-bold">{mode.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center transition-all ${
                          active ? 'border-indigo-500 bg-indigo-500' : 'border-slate-200'
                        }`}>
                          {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
               <button className="w-full py-4 border border-dashed border-slate-200 rounded-2xl text-[11px] font-bold text-slate-400 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all">
                 + {lang === 'zh' ? '添加调度规则' : 'Add Scheduling Rule'}
               </button>
            </div>
          </ModuleWrapper>

          {/* Module 5: Control */}
          <ModuleWrapper 
            id="control" 
            icon={<ShieldCheck className="w-5 h-5" />} 
            title={t.control} 
            description={t.controlDesc}
          >
            <div className="grid grid-cols-2 gap-10">
               <div className="space-y-8">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">输出方式</label>
                    <div className="space-y-3">
                      {['报告', '数据表', '消息推送'].map(opt => {
                        const actualOpt = opt === '报告' ? 'Report' : opt === '数据表' ? 'Table' : 'Push';
                        const checked = formData.resultHandling?.outputs?.includes(actualOpt as any);
                        return (
                          <label key={opt} className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-white hover:border-indigo-100 transition-all shadow-none hover:shadow-sm">
                            <input 
                              type="checkbox" 
                              checked={checked} 
                              onChange={() => {
                                const current = formData.resultHandling?.outputs || [];
                                const next = current.includes(actualOpt as any) ? current.filter(o => o !== actualOpt) : [...current, actualOpt as any];
                                updateFormData({ resultHandling: { ...formData.resultHandling, outputs: next } as any });
                              }}
                              className="w-4 h-4 border-slate-300 text-indigo-600 focus:ring-indigo-500 rounded" 
                            />
                            <span className="text-xs font-bold text-slate-700">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">人工确认</label>
                    <div className="space-y-3">
                      {[
                        { id: 'Always', name: '始终需要' },
                        { id: 'AnomalyOnly', name: '仅异常时需要' },
                        { id: 'Never', name: '不需要' }
                      ].map(opt => (
                        <label key={opt.id} className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-white hover:border-indigo-100 transition-all shadow-none hover:shadow-sm">
                          <input 
                            type="radio" 
                            name="approval" 
                            checked={formData.resultHandling?.approvalMode === opt.id} 
                            onChange={() => updateFormData({ resultHandling: { ...formData.resultHandling, approvalMode: opt.id as any } as any })}
                            className="w-4 h-4 border-slate-300 text-indigo-600" 
                          />
                          <span className="text-xs font-bold text-slate-700">{opt.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">通知方式</label>
                    <div className="space-y-3">
                       {['站内通知', '邮件'].map(opt => {
                         const checked = formData.resultHandling?.notifications?.includes(opt);
                         return (
                           <label key={opt} className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-white hover:border-indigo-100 transition-all shadow-none hover:shadow-sm">
                             <input 
                                type="checkbox" 
                                checked={checked} 
                                onChange={() => {
                                  const current = formData.resultHandling?.notifications || [];
                                  const next = current.includes(opt) ? current.filter(n => n !== opt) : [...current, opt];
                                  updateFormData({ resultHandling: { ...formData.resultHandling, notifications: next } as any });
                                }}
                                className="w-4 h-4 border-slate-300 text-indigo-600 rounded" 
                             />
                             <span className="text-xs font-bold text-slate-700">{opt}</span>
                           </label>
                         );
                       })}
                    </div>
                  </div>
                  <div>
                     <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">存储位置</label>
                     <div className="flex items-center gap-3 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-50">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span className="text-[11px] font-bold text-indigo-600 font-mono">{formData.resultHandling?.storagePath || '/成果空间/未分配'}</span>
                     </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">自动归档</label>
                    <div className="flex gap-4">
                       <label className="flex-1 flex items-center justify-center gap-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-white hover:border-indigo-100 transition-all shadow-none hover:shadow-sm">
                          <input 
                            type="radio" 
                            name="archive" 
                            checked={formData.resultHandling?.archiveMode === 'Date'} 
                            onChange={() => updateFormData({ resultHandling: { ...formData.resultHandling, archiveMode: 'Date' } as any })}
                            className="w-3.5 h-3.5" 
                          />
                          <span className="text-xs font-bold text-slate-700">按日期</span>
                       </label>
                       <label className="flex-1 flex items-center justify-center gap-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-white hover:border-indigo-100 transition-all shadow-none hover:shadow-sm">
                          <input 
                            type="radio" 
                            name="archive" 
                            checked={formData.resultHandling?.archiveMode === 'Scenario'} 
                            onChange={() => updateFormData({ resultHandling: { ...formData.resultHandling, archiveMode: 'Scenario' } as any })}
                            className="w-3.5 h-3.5" 
                          />
                          <span className="text-xs font-bold text-slate-700">按场景</span>
                       </label>
                    </div>
                  </div>
               </div>
            </div>
          </ModuleWrapper>

          {/* Validation Status */}
          <div className="flex items-center justify-center gap-2 py-10 mb-10">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-400">{t.validated}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate-200 px-10 py-6 flex items-center justify-end gap-6 z-20">
        <button 
          onClick={onCancel}
          className="text-sm font-bold text-slate-400 hover:text-slate-800 transition-all"
        >
          {t.saveDraft}
        </button>
        <button 
          onClick={() => onSave(formData)}
          className="bg-indigo-600 text-white px-10 py-3.5 rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3 active:scale-95"
        >
          <Send className="w-4 h-4" />
          {t.deploy}
        </button>
      </div>
    </div>
  );
};
