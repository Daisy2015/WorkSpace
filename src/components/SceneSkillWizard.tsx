
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

interface SceneSkillWizardProps {
  lang: Language;
  onBack: () => void;
}

type Step = 1 | 2 | 3 | 4;

export const SceneSkillWizard: React.FC<SceneSkillWizardProps> = ({ lang, onBack }) => {
  const [step, setStep] = useState<Step>(1);
  const [skillName, setSkillName] = useState('水平井压裂参数优选');
  const [sceneDescription, setSceneDescription] = useState('我要完成水平井压裂参数优选，分析邻井和施工参数，自动推荐压裂设计参数');

  // Step 3 state
  const [selectedTask, setSelectedTask] = useState('邻井筛选');

  const renderHeader = () => (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10 font-sans">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="h-4 w-px bg-slate-200 mx-1"></div>
        <h2 className="text-lg font-bold text-slate-800">
          {lang === 'zh' ? '场景技能包生成' : 'Scene Skill Package Generation'}
        </h2>
      </div>

      <div className="flex items-center gap-12">
        {[
          { s: 1, label: lang === 'zh' ? '创建技能包' : 'Create Package' },
          { s: 2, label: lang === 'zh' ? '场景理解' : 'Scene Understanding' },
          { s: 3, label: lang === 'zh' ? '任务拆解' : 'Task Deconstruction' },
          { s: 4, label: lang === 'zh' ? '技能包生成' : 'Package Generation' }
        ].map((item) => (
          <div key={item.s} className="flex items-center gap-3 relative">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
              step >= item.s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400'
            }`}>
              {step > item.s ? <i className="fas fa-check"></i> : item.s}
            </div>
            <span className={`text-xs font-bold transition-all ${
              step >= item.s ? 'text-slate-800' : 'text-slate-400'
            }`}>
              {item.label}
            </span>
            {item.s < 4 && (
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-4 h-px bg-slate-200"></div>
            )}
          </div>
        ))}
      </div>

      <div className="w-40 flex justify-end">
        {step === 4 && (
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
            {lang === 'zh' ? '发布到技能库' : 'Publish to Library'}
          </button>
        )}
      </div>
    </header>
  );

  const renderStep1 = () => (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-12 custom-scrollbar">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{lang === 'zh' ? '技能包名称' : 'Skill Package Name'}</label>
            <input 
              type="text" 
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-base text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none transition-all"
              placeholder={lang === 'zh' ? '例如：水平井压裂参数优选' : 'e.g., Horizontal Well Fracking Parameter Optimization'}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{lang === 'zh' ? '业务场景描述' : 'Business Scene Description'}</label>
            <div className="relative">
              <textarea 
                value={sceneDescription}
                onChange={(e) => setSceneDescription(e.target.value)}
                className="w-full h-48 bg-white border border-slate-200 rounded-2xl px-6 py-6 text-base text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none transition-all resize-none leading-relaxed"
                placeholder={lang === 'zh' ? '请描述您希望完成的工作...' : 'Describe what you want to achieve...'}
              />
              <div className="absolute right-4 bottom-4 flex gap-2">
                <button className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center">
                  <i className="fas fa-microphone"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700">{lang === 'zh' ? '辅助资料上传' : 'Supporting Materials Upload'}</label>
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center bg-white hover:bg-indigo-50/10 hover:border-indigo-300 transition-all cursor-pointer group shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                <i className="fas fa-cloud-upload-alt"></i>
              </div>
              <div className="text-sm font-bold text-slate-600 mb-2">{lang === 'zh' ? '点击或将文件拖拽至此处上传' : 'Click or drag files here to upload'}</div>
              <div className="text-xs text-slate-400 text-center max-w-sm leading-relaxed">
                {lang === 'zh' ? '支持 Excel, Word, PDF, SOP文档, 历史报告, 流程文档' : 'Supports Excel, Word, PDF, SOPs, Historical Reports, Process Docs'}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['场景流程梳理.xlsx', '压裂设计规范.docx'].map(file => (
                <div key={file} className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 flex items-center gap-2">
                  <i className="fas fa-file-alt text-indigo-400"></i> {file}
                  <button className="text-slate-400 hover:text-rose-500"><i className="fas fa-times"></i></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex justify-end pt-6 border-t border-slate-200">
          <button 
            onClick={() => setStep(2)}
            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-base shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 overflow-hidden"
          >
            {lang === 'zh' ? 'AI 生成技能包' : 'AI Generate Skill Package'}
            <i className="fas fa-chevron-right text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex-1 flex min-h-0 bg-slate-50 overflow-hidden font-sans">
      {/* Left: User Input */}
      <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fas fa-edit text-indigo-500 text-xs"></i>
            <h4 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '描述修改' : 'Modify Description'}</h4>
          </div>
          <span className="text-[10px] font-bold text-slate-400 italic">{lang === 'zh' ? 'AI将实时更新理解' : 'AI will update in real-time'}</span>
        </div>
        <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '原始描述' : 'Input Description'}</h5>
            <textarea 
              value={sceneDescription}
              onChange={(e) => setSceneDescription(e.target.value)}
              className="w-full h-64 text-sm text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none shadow-inner"
              placeholder={lang === 'zh' ? '输入描述...' : 'Enter description...'}
            />
          </div>
          <div className="space-y-4">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '上传资料' : 'Uploaded Materials'}</h5>
            <div className="space-y-3">
              {[
                { name: '场景流程梳理.xlsx', icon: 'fa-file-excel', color: 'text-emerald-500' },
                { name: '压裂设计规范.docx', icon: 'fa-file-word', color: 'text-indigo-500' },
                { name: '历史方案.pdf', icon: 'fa-file-pdf', color: 'text-rose-500' },
              ].map(file => (
                <div key={file.name} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <i className={`fas ${file.icon} ${file.color} text-lg`}></i>
                    <span className="text-xs font-medium text-slate-600">{file.name}</span>
                  </div>
                  <i className="fas fa-chevron-right text-[8px] text-slate-300"></i>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: AI Understanding */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
              <i className="fas fa-brain"></i>
            </div>
            <h4 className="text-sm font-bold text-slate-800">{lang === 'zh' ? 'AI 理解结果' : 'AI Understanding Results'}</h4>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
              <i className="fas fa-sync-alt text-[8px]"></i>
              {lang === 'zh' ? '重新理解' : 'Re-understand'}
            </button>
            <button 
              onClick={() => setStep(3)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              {lang === 'zh' ? '确认进入任务拆解' : 'Confirm for Task Deconstruction'}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-slate-50/50">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '场景名称' : 'Scene Name'}</label>
              <div className="text-base font-bold text-slate-800 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">{skillName}</div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '场景类型' : 'Scene Type'}</label>
              <div className="text-sm font-bold text-indigo-600 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 shadow-sm">{lang === 'zh' ? '方案设计' : 'Scheme Design'}</div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '业务目标' : 'Business Goal'}</label>
            <div className="text-sm text-slate-700 leading-bold bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              {lang === 'zh' ? '基于邻井和历史施工数据，自动生成压裂设计参数方案' : 'Based on neighboring wells and historical construction data, automatically generate fracturing design parameter schemes'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '适用范围' : 'Applicable Scope'}</label>
              <div className="flex flex-wrap gap-2">
                {['水平井', '压裂工程', '参数优化'].map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold">{tag}</span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '涉及对象' : 'Involved Objects'}</label>
              <div className="flex flex-wrap gap-2">
                {['井', '储层', '施工参数', '产量数据'].map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-[10px] font-bold">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '输入' : 'Input'}</label>
              <div className="text-sm font-bold text-slate-800 bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
                <i className="fas fa-arrow-right text-indigo-500 text-[10px]"></i>
                {lang === 'zh' ? '目标井' : 'Target Well'}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '输出' : 'Output'}</label>
              <div className="space-y-2">
                {['压裂参数推荐结果', '分析报告'].map(out => (
                  <div key={out} className="text-sm font-bold text-slate-800 bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
                    <i className="fas fa-arrow-left text-emerald-500 text-[10px]"></i>
                    {out}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 space-y-4">
            <div className="flex items-center gap-2 text-amber-700">
              <i className="fas fa-lightbulb"></i>
              <span className="text-xs font-bold uppercase tracking-wider">{lang === 'zh' ? 'AI 识别建议' : 'AI Recognition Suggestions'}</span>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                { zh: '建议补充邻井筛选范围', en: 'Suggest scope for neighbor screening' },
                { zh: '建议录入参数优选规则', en: 'Suggest rule entry for optimization' },
                { zh: '建议明确历史案例来源', en: 'Suggest source for historical cases' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5"></div>
                  <span className="text-xs text-amber-800 leading-relaxed font-medium">
                    {lang === 'zh' ? item.zh : item.en}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex-1 flex min-h-0 bg-slate-50 overflow-hidden font-sans">
      {/* Left: Task Tree */}
      <div className="w-64 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{lang === 'zh' ? '任务树' : 'Task Tree'}</h4>
          <button className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] hover:bg-indigo-100 transition-all">
            <i className="fas fa-plus"></i>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          <div className="px-4 py-3 flex items-center gap-2 text-xs font-bold text-slate-800 group">
            <i className="fas fa-folder-open text-indigo-500"></i>
            {lang === 'zh' ? '场景技能包' : 'Skill Package'}
          </div>
          <div className="space-y-0.5 pl-6">
            {[
              '邻井筛选', '地质相似分析', '工程参数分析', '产量分析', '参数优选', '报告生成'
            ].map(task => (
              <button 
                key={task}
                onClick={() => setSelectedTask(task)}
                className={`w-full flex items-center justify-between px-4 py-2 text-[11px] rounded-lg transition-all ${
                  selectedTask === task ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-1 h-1 rounded-full ${selectedTask === task ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                  {task}
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                   {/* icons for edit/delete */}
                </div>
              </button>
            ))}
            <button className="w-full flex items-center gap-2 px-4 py-2 text-[11px] text-indigo-500 font-bold hover:bg-indigo-50/50 rounded-lg transition-all mt-4 italic">
              <i className="fas fa-bolt text-[10px]"></i>
              AI 补全任务
            </button>
          </div>
        </div>
      </div>

      {/* Middle: Task Flow Canvas */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50 border-r border-slate-200">
        <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <i className="fas fa-project-diagram text-indigo-500"></i>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{lang === 'zh' ? '任务流程' : 'Task Flow'}</h4>
          </div>
          <div className="flex gap-2">
             <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"><i className="fas fa-expand"></i></button>
             <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"><i className="fas fa-redo"></i></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-12 flex flex-col items-center">
           {/* Simple Vertical Flow Mock */}
           <div className="flex flex-col items-center gap-6">
              <div className="w-32 h-10 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center uppercase tracking-widest shadow-lg">{lang === 'zh' ? '开始' : 'Start'}</div>
              <i className="fas fa-arrow-down text-slate-300"></i>
              {[
                { name: '邻井筛选', id: 1 },
                { name: '地质相似分析', id: 2 },
                { name: '工程参数分析', id: 3 },
                { name: '产量分析', id: 4 },
                { name: '参数优选', id: 5 },
                { name: '报告生成', id: 6 },
              ].map((task, i) => (
                <React.Fragment key={task.id}>
                  <div 
                    onClick={() => setSelectedTask(task.name)}
                    className={`w-48 p-4 rounded-2xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      selectedTask === task.name ? 'bg-indigo-600 text-white border-indigo-700 shadow-xl shadow-indigo-100 ring-4 ring-indigo-50 -translate-y-1' : 'bg-white text-slate-800 border-slate-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{task.name}</div>
                    <div className={`text-[8px] uppercase tracking-wider ${selectedTask === task.name ? 'text-indigo-100' : 'text-slate-400'}`}>Task {i+1}</div>
                  </div>
                  {i < 5 && <i className="fas fa-arrow-down text-slate-300"></i>}
                </React.Fragment>
              ))}
              <i className="fas fa-arrow-down text-slate-300"></i>
              <div className="w-32 h-10 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center uppercase tracking-widest shadow-lg">{lang === 'zh' ? '结束' : 'End'}</div>
           </div>
        </div>
      </div>

      {/* Right: Task Details Panel */}
      <div className="w-1/3 bg-white flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shadow-lg shadow-indigo-100">
               <i className="fas fa-edit"></i>
            </div>
            <h4 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '任务详情' : 'Task Details'}</h4>
          </div>
          <button className="text-slate-400 hover:text-slate-600 focus:outline-none"><i className="fas fa-ellipsis-h"></i></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '任务名称' : 'Task Name'}</label>
              <input type="text" value={selectedTask} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '任务目标' : 'Task Goal'}</label>
              <input type="text" defaultValue="寻找参考邻井" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '任务描述' : 'Task Description'}</label>
              <textarea defaultValue="根据目标井位置，筛选邻近井，形成候选井集合" className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 outline-none resize-none leading-relaxed" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '输入' : 'Input'}</label>
              <div className="p-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-800 shadow-sm flex items-center justify-between">
                <span>{lang === 'zh' ? '目标井' : 'Target Well'}</span>
                <i className="fas fa-link text-[8px] text-indigo-400"></i>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '输出' : 'Output'}</label>
              <div className="p-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-800 shadow-sm flex items-center justify-between">
                <span>{lang === 'zh' ? '邻井清单' : 'Neighbor Well List'}</span>
                <i className="fas fa-file-invoice text-[8px] text-emerald-400"></i>
              </div>
            </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '业务规则' : 'Business Rules'}</label>
             <div className="space-y-2">
                {['距离优先', '同层位优先', '同区块优先'].map(rule => (
                  <div key={rule} className="px-4 py-2.5 bg-slate-100 rounded-xl text-[11px] font-bold text-slate-600 border border-slate-200 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    {rule}
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 space-y-3">
             <div className="flex items-center gap-2 text-indigo-700">
               <i className="fas fa-sparkles"></i>
               <span className="text-[10px] font-bold uppercase tracking-wider">AI 建议</span>
             </div>
             <p className="text-xs text-indigo-800 font-medium leading-relaxed italic">"建议增加：异常井过滤逻辑，剔除数据异常、无法代表真实地层情况的井位，以提高分析准确性。"</p>
          </div>
        </div>
        <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex gap-4">
           <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">{lang === 'zh' ? '保存任务' : 'Save Task'}</button>
           <button 
             onClick={() => setStep(4)}
             className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
           >
             {lang === 'zh' ? '生成技能包' : 'Generate Package'}
           </button>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="flex-1 flex min-h-0 bg-slate-50 overflow-hidden font-sans">
      {/* Left: Directory */}
      <div className="w-72 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{lang === 'zh' ? '技能包目录' : 'Package Directory'}</h4>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
           <div className="space-y-4">
              <div className="space-y-1">
                 <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-2">
                    <i className="fas fa-box-open"></i>
                    {skillName}
                 </div>
                 {[
                   { name: '场景定义', icon: 'fa-info-circle' },
                   { name: '输入定义', icon: 'fa-sign-in-alt' },
                   { name: '输出定义', icon: 'fa-sign-out-alt' }
                 ].map(item => (
                   <div key={item.name} className="flex items-center gap-3 pl-6 py-2 text-[11px] font-bold text-slate-600 hover:text-indigo-600 cursor-pointer transition-all">
                      <i className={`fas ${item.icon} text-slate-400 w-4`}></i>
                      {item.name}
                   </div>
                 ))}
              </div>
              <div className="space-y-1">
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-800 py-1 pl-6">
                    <i className="fas fa-tasks text-indigo-400"></i>
                    {lang === 'zh' ? '任务树' : 'Task Tree'}
                 </div>
                 {[
                   '邻井筛选', '地质相似分析', '工程参数分析', '产量分析', '参数优选', '报告生成'
                 ].map(task => (
                   <div key={task} className="flex items-center gap-3 pl-12 py-1.5 text-[10px] font-medium text-slate-500 hover:text-indigo-500 cursor-pointer transition-all">
                      <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                      {task}
                   </div>
                 ))}
              </div>
              <div className="space-y-1">
                 <div className="flex items-center gap-3 pl-6 py-2 text-[11px] font-bold text-slate-600 hover:text-indigo-600 cursor-pointer transition-all">
                    <i className="fas fa-gavel text-slate-400 w-4"></i>
                    {lang === 'zh' ? '业务规则' : 'Business Rules'}
                 </div>
                 <div className="flex items-center gap-3 pl-6 py-2 text-[11px] font-bold text-slate-600 hover:text-indigo-600 cursor-pointer transition-all">
                    <i className="fas fa-database text-slate-400 w-4"></i>
                    {lang === 'zh' ? '元数据' : 'Metadata'}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Middle: Content Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white shadow-xl z-10">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-lg">
                <i className="fas fa-scroll"></i>
             </div>
             <div>
                <h4 className="text-sm font-bold text-slate-800">{skillName}</h4>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Fracturing Skill Package v1.0</div>
             </div>
          </div>
          <div className="flex gap-2">
             <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold hover:bg-slate-200 transition-all flex items-center gap-2">
                <i className="fas fa-download text-[10px]"></i>
                {lang === 'zh' ? '导出成果' : 'Export Results'}
             </button>
             <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
                <i className="fas fa-save text-[10px]"></i>
                {lang === 'zh' ? '保存技能包' : 'Save Package'}
             </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
           {/* Section: Scenario Definition */}
           <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                 <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
                 <h5 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '场景定义' : 'Scenario Definition'}</h5>
              </div>
              <div className="grid grid-cols-2 gap-10">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '技能名称' : 'Skill Name'}</label>
                    <div className="text-sm font-bold text-slate-800">{skillName}</div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '业务目标' : 'Business Goal'}</label>
                    <div className="text-sm font-bold text-slate-700 underline decoration-indigo-300 decoration-2 underline-offset-4">{lang === 'zh' ? '自动生成压裂参数推荐方案' : 'Auto generate recommendation plan'}</div>
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '场景描述' : 'Description'}</label>
                 <div className="text-xs text-slate-600 leading-relaxed max-w-2xl bg-slate-50 p-6 rounded-2xl border border-dotted border-slate-300">
                    {lang === 'zh' ? '基于目标井，结合邻井地质参数、施工参数、产量数据，完成压裂参数优选，并根据历史生产数据校核方案可靠性。' : 'Based on the target well, combine with neighbor geological, construction parameters and production data...'}
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '适用范围' : 'Applicable Scope'}</label>
                 <div className="flex gap-2">
                    {['水平井压裂设计', '深层非常规油气', '勘探区评估'].map(scope => (
                      <span key={scope} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold border border-indigo-100">{scope}</span>
                    ))}
                 </div>
              </div>
           </section>

           {/* Section: Task Tree Preview */}
           <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                 <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                 <h5 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '核心任务树' : 'Core Task Tree'}</h5>
              </div>
              <div className="space-y-1">
                 {[
                   { name: '邻井筛选', desc: '根据目标井坐标检索 3-5km 范围内最优生产井', icon: 'fa-filter' },
                   { name: '地质相似分析', desc: '对比层位、厚度、TOC 等关键指标相似度', icon: 'fa-microscope' },
                   { name: '参数优选', desc: '通过多目标算法推荐压裂液量、排量、砂量', icon: 'fa-vial' },
                 ].map((task, i) => (
                   <div key={i} className="group flex items-center gap-6 p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
                         <i className={`fas ${task.icon}`}></i>
                      </div>
                      <div className="flex-1">
                         <div className="text-[11px] font-bold text-slate-800">{task.name}</div>
                         <div className="text-[10px] text-slate-500 mt-0.5">{task.desc}</div>
                      </div>
                      <div className="text-[10px] font-bold text-slate-300">Phase 0{i+1}</div>
                   </div>
                 ))}
              </div>
           </section>
        </div>
      </div>

      {/* Right: Stats and Scores */}
      <div className="w-72 bg-slate-50 flex flex-col border-l border-slate-200">
         <div className="p-8 space-y-10">
            <div className="space-y-6">
               <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '基础统计' : 'Basic Stats'}</h5>
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: '任务数量', val: '6', color: 'bg-indigo-100 text-indigo-700' },
                    { label: '输入项', val: '12', color: 'bg-emerald-100 text-emerald-700' },
                    { label: '输出项', val: '8', color: 'bg-amber-100 text-amber-700' },
                    { label: '业务规则', val: '15', color: 'bg-rose-100 text-rose-700' },
                  ].map(stat => (
                    <div key={stat.label} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
                       <span className="text-[10px] font-bold text-slate-400">{lang === 'zh' ? stat.label : stat.label}</span>
                       <span className={`text-xl font-bold ${stat.color.split(' ')[1]}`}>{stat.val}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
               <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? 'AI 质量评分' : 'AI Quality Scores'}</h5>
               <div className="space-y-6">
                  {[
                    { label: '完整性', score: 92, zh: '完整性' },
                    { label: '规范性', score: 95, zh: '规范性' },
                    { label: '可复用性', score: 90, zh: '可复用性' },
                  ].map(item => (
                    <div key={item.label} className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-600">{lang === 'zh' ? item.zh : item.label}</span>
                          <span className="text-indigo-600">{item.score}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.score}%` }}
                            className="h-full bg-indigo-600 rounded-full"
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100 space-y-3">
               <div className="flex items-center gap-2 text-rose-600">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{lang === 'zh' ? '风险提示' : 'Risk Alert'}</span>
               </div>
               <p className="text-[10px] text-rose-800 font-medium leading-relaxed">
                  {lang === 'zh' ? '缺少参数优选规则的具体数据来源，在实际执行任务 3 时可能遇到检索性能瓶颈。' : 'Missing specific data sources for parameter optimization rules...'}
               </p>
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {renderHeader()}
      <AnimatePresence mode="wait">
        <motion.div
           key={step}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.3 }}
           className="flex-1 flex flex-col min-h-0"
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
