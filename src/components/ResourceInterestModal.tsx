import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Workspace, Language } from '../types';

interface ResourceInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  workspaceData: Workspace;
  onConfirm: (selectedTags: {
    businessContent: string[];
    workTypes: string[];
    businessObjects: string[];
  }) => void;
  onPostpone?: () => void;
}

// Preset tags with recommendation metadata
const BUSINESS_CONTENT_TAGS = [
  { id: 'bc-1', name: '产量变化', recommended: true, reason: '任务描述包含“产量变化”' },
  { id: 'bc-2', name: '生产动态', recommended: true, reason: '采油工程师岗位推荐' },
  { id: 'bc-3', name: '含水变化', recommended: true, reason: '采油工程师岗位推荐' },
  { id: 'bc-4', name: '压力变化', recommended: false, reason: '相关业务主题' },
  { id: 'bc-5', name: '井筒工况', recommended: true, reason: '采油工程师岗位推荐' },
  { id: 'bc-6', name: '生产异常', recommended: false, reason: '相关业务主题' },
  { id: 'bc-7', name: '注采关系', recommended: false, reason: '相关业务主题' },
  { id: 'bc-8', name: '措施效果', recommended: false, reason: '相关业务主题' },
  { id: 'bc-9', name: '开发效果', recommended: false, reason: '相关业务主题' },
  { id: 'bc-10', name: '地质风险', recommended: false, reason: '相关业务主题' },
  { id: 'bc-11', name: '圈闭评价', recommended: false, reason: '相关业务主题' },
  { id: 'bc-12', name: '储层特征', recommended: false, reason: '相关业务主题' },
];

const BUSINESS_OBJECT_TAGS = [
  { id: 'bo-1', name: '区块', recommended: true, reason: '任务描述“A区块”匹配' },
  { id: 'bo-2', name: '井组', recommended: false, reason: '业务层级对象' },
  { id: 'bo-3', name: '单井', recommended: true, reason: '任务描述“重点井”匹配' },
  { id: 'bo-4', name: '层系', recommended: false, reason: '业务层级对象' },
  { id: 'bo-5', name: '储层', recommended: false, reason: '业务层级对象' },
  { id: 'bo-6', name: '圈闭', recommended: false, reason: '业务层级对象' },
  { id: 'bo-7', name: '井位', recommended: false, reason: '业务层级对象' },
  { id: 'bo-8', name: '油田', recommended: false, reason: '业务层级对象' },
  { id: 'bo-9', name: '图件', recommended: false, reason: '业务层级对象' },
];

export const ResourceInterestModal: React.FC<ResourceInterestModalProps> = ({
  isOpen,
  onClose,
  lang,
  workspaceData,
  onConfirm,
  onPostpone,
}) => {
  const isZh = lang === 'zh';

  // State for selected tags
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);

  // Task description toggle expand
  const [isTaskExpanded, setIsTaskExpanded] = useState(false);

  // Generation / Loading animation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  // Initialize pre-selected tags from recommendations or workspace saved tags
  useEffect(() => {
    if (workspaceData?.interestTags) {
      setSelectedContent(workspaceData.interestTags.businessContent || []);
      setSelectedObjects(workspaceData.interestTags.businessObjects || []);
    } else {
      // Default pre-select recommended ones
      setSelectedContent(BUSINESS_CONTENT_TAGS.filter(t => t.recommended).map(t => t.name));
      setSelectedObjects(BUSINESS_OBJECT_TAGS.filter(t => t.recommended).map(t => t.name));
    }
  }, [workspaceData, isOpen]);

  // Toggle helper
  const toggleTag = (
    name: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(name)) {
      setList(list.filter(item => item !== name));
    } else {
      setList([...list, name]);
    }
  };

  // Handle generation sequence
  const handleConfirmGenerate = () => {
    if (selectedContent.length === 0) return;

    setIsGenerating(true);
    setGenerationStep(1);

    const steps = [
      { step: 2, delay: 500 },
      { step: 3, delay: 1000 },
      { step: 4, delay: 1500 },
      { step: 5, delay: 2000 },
    ];

    steps.forEach(({ step, delay }) => {
      setTimeout(() => {
        setGenerationStep(step);
      }, delay);
    });

    setTimeout(() => {
      setIsGenerating(false);
      setGenerationStep(0);
      onConfirm({
        businessContent: selectedContent,
        workTypes: [],
        businessObjects: selectedObjects,
      });
    }, 2300);
  };

  // Summary list calculation
  const allSelectedCount = selectedContent.length + selectedObjects.length;
  const summaryTags = useMemo(() => {
    return [...selectedContent, ...selectedObjects];
  }, [selectedContent, selectedObjects]);

  if (!isOpen) return null;

  const defaultRole = workspaceData?.userRole || (isZh ? '采油工程师' : 'Production Engineer');
  const taskDesc = workspaceData?.description || (isZh 
    ? '分析A区块重点井近半年的产量变化情况，并形成趋势图与动态评估报告。' 
    : 'Analyze production changes of key wells in Block A for the past 6 months.');

  const stepsList = isZh ? [
    '正在分析关注内容...',
    '正在匹配相关 MBU 业务范围...',
    '正在检查资源访问权限...',
    '正在构建资源导航...',
    '资源范围准备完成！'
  ] : [
    'Analyzing interest tags...',
    'Matching MBU business scope...',
    'Checking access permissions...',
    'Building navigation tree...',
    'Scope prepared successfully!'
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-blue-50/40 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 flex-shrink-0">
              <i className="fas fa-compass text-base"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                {isZh ? '为你准备相关业务资源' : 'Preparing Business Resources'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isZh
                  ? '请选择本次工作关注的方向，系统将自动匹配并生成相关业务资源。'
                  : 'Select your focus areas to auto-generate business resources.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {/* ① Recommendation Basis Summary Area */}
          <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <i className="fas fa-lightbulb text-amber-500"></i>
              <span>{isZh ? '推荐依据' : 'Recommendation Basis'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-200/60 flex items-center gap-2">
                <i className="fas fa-user-tag text-indigo-500 text-xs"></i>
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 block">{isZh ? '岗位' : 'Role'}</span>
                  <span className="font-bold text-slate-700">{defaultRole}</span>
                </div>
              </div>

              <div className="sm:col-span-2 bg-white p-2 rounded-lg border border-slate-200/60 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] text-slate-400 block">{isZh ? '空间任务' : 'Task'}</span>
                  {taskDesc.length > 35 && (
                    <button
                      type="button"
                      onClick={() => setIsTaskExpanded(!isTaskExpanded)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                    >
                      {isTaskExpanded ? (isZh ? '收起' : 'Collapse') : (isZh ? '展开' : 'Expand')}
                    </button>
                  )}
                </div>
                <p className={`font-medium text-slate-700 mt-0.5 text-[11px] leading-snug ${!isTaskExpanded ? 'line-clamp-1' : ''}`}>
                  {taskDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Group 1: Business Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                <h3 className="text-xs font-bold text-slate-800">
                  {isZh ? '你关注的业务内容' : 'Interested Business Content'}
                </h3>
                <span className="text-xs text-rose-500 font-semibold">*</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {BUSINESS_CONTENT_TAGS.map(tag => {
                const isSelected = selectedContent.includes(tag.name);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.name, selectedContent, setSelectedContent)}
                    title={tag.reason}
                    className={`relative px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center gap-1.5 border cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs shadow-indigo-200 font-semibold'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <i className="fas fa-check text-[10px]"></i>}
                    <span>{tag.name}</span>
                    {tag.recommended && !isSelected && (
                      <span className="px-1 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">
                        {isZh ? '推荐' : 'Rec'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedContent.length === 0 && (
              <p className="text-[11px] text-rose-500 font-medium pt-0.5 flex items-center gap-1">
                <i className="fas fa-exclamation-circle text-[10px]"></i>
                {isZh ? '请至少选择 1 项关注的业务内容' : 'Please select at least 1 topic'}
              </p>
            )}
          </div>

          {/* Group 2: Business Objects */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <h3 className="text-xs font-bold text-slate-800">
                  {isZh ? '你关注的业务对象' : 'Target Business Objects'}
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {BUSINESS_OBJECT_TAGS.map(tag => {
                const isSelected = selectedObjects.includes(tag.name);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.name, selectedObjects, setSelectedObjects)}
                    title={tag.reason}
                    className={`relative px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center gap-1.5 border cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs shadow-emerald-200 font-semibold'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <i className="fas fa-check text-[10px]"></i>}
                    <span>{tag.name}</span>
                    {tag.recommended && !isSelected && (
                      <span className="px-1 py-0.2 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded">
                        {isZh ? '推荐' : 'Rec'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Summary Area */}
          <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs flex-shrink-0 shadow-xs">
                <i className="fas fa-tags text-[11px]"></i>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <span>{isZh ? `已选择 ${allSelectedCount} 项：` : `Selected ${allSelectedCount} items:`}</span>
                  <span className="font-normal text-indigo-700 truncate max-w-md">
                    {summaryTags.length > 0 ? summaryTags.join('、') : (isZh ? '暂未选择' : 'None')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              if (onPostpone) onPostpone();
              onClose();
            }}
            disabled={isGenerating}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {isZh ? '稍后设置' : 'Postpone'}
          </button>

          <button
            type="button"
            disabled={selectedContent.length === 0 || isGenerating}
            onClick={handleConfirmGenerate}
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer ${
              selectedContent.length === 0 || isGenerating
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 active:scale-95'
            }`}
          >
            {isGenerating ? (
              <>
                <i className="fas fa-spinner fa-spin text-xs"></i>
                <span>{isZh ? '生成中...' : 'Generating...'}</span>
              </>
            ) : (
              <>
                <i className="fas fa-magic text-xs"></i>
                <span>{isZh ? '确定并生成资源范围' : 'Confirm & Generate Scope'}</span>
              </>
            )}
          </button>
        </div>

        {/* Loading Overlay when generating */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center space-y-4"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-xl shadow-indigo-200 animate-pulse">
                  <i className="fas fa-cubes text-xl"></i>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow-md border-2 border-white">
                  <i className="fas fa-cog fa-spin"></i>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {isZh ? '正在准备你的工作空间' : 'Preparing Your Workspace'}
                </h3>
              </div>

              {/* Progress Steps */}
              <div className="w-full max-w-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-left">
                {stepsList.map((st, idx) => {
                  const stepNum = idx + 1;
                  const isDone = generationStep > stepNum;
                  const isCurrent = generationStep === stepNum;
                  return (
                    <div
                      key={st}
                      className={`flex items-center gap-2.5 text-xs transition-colors duration-200 ${
                        isDone
                          ? 'text-emerald-600 font-medium'
                          : isCurrent
                          ? 'text-indigo-600 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">
                        {isDone ? (
                          <i className="fas fa-check-circle text-emerald-500 text-xs"></i>
                        ) : isCurrent ? (
                          <i className="fas fa-spinner fa-spin text-indigo-500 text-xs"></i>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        )}
                      </div>
                      <span className="truncate">{st}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

