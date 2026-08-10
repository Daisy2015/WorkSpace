import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Workspace, Language } from '../types';

interface ResourceInterestModalProps {
  isOpen: boolean;
  onClose?: () => void;
  lang: Language;
  workspaceData: Workspace;
  onConfirm: (selectedTags: {
    businessContent: string[];
    workTypes: string[];
    businessObjects: string[];
  }) => void;
}

// Preset primary focus tags (6-10 high relevance items)
const PRIMARY_BUSINESS_CONTENT = [
  '产量变化',
  '生产动态',
  '含水变化',
  '压力变化',
  '生产异常',
  '井筒工况',
  '措施效果',
  '注采关系',
];

// More candidate tags (expanded when clicking "更多")
const EXTENDED_BUSINESS_CONTENT = [
  '开发效果',
  '地质风险',
  '圈闭评价',
  '储层特征',
];

// Target object type tags (Types, NOT specific instances)
const OBJECT_TYPE_TAGS = [
  '区块',
  '井组',
  '单井',
  '层系',
];

export const ResourceInterestModal: React.FC<ResourceInterestModalProps> = ({
  isOpen,
  lang,
  workspaceData,
  onConfirm,
}) => {
  const isZh = lang === 'zh';

  // Modal State: 'loading' | 'confirm' | 'preparing' | 'failed'
  const [modalState, setModalState] = useState<'loading' | 'confirm' | 'preparing' | 'failed'>('loading');

  // Selected state for interest tags
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);

  // Expanded "更多" tags toggle
  const [showMoreContent, setShowMoreContent] = useState(false);

  // Warning for no matched resources
  const [noMatchWarning, setNoMatchWarning] = useState<string | null>(null);

  // Task description expansion
  const [isTaskExpanded, setIsTaskExpanded] = useState(false);

  // Initial loading effect on open
  useEffect(() => {
    if (isOpen) {
      setModalState('loading');
      setNoMatchWarning(null);

      // Initialize pre-selected tags from saved tags or default system recommendations
      if (workspaceData?.interestTags?.businessContent?.length) {
        setSelectedContent(workspaceData.interestTags.businessContent);
      } else {
        // Default pre-selected high-confidence tags
        setSelectedContent(['产量变化', '生产动态']);
      }

      if (workspaceData?.interestTags?.businessObjects?.length) {
        setSelectedObjects(workspaceData.interestTags.businessObjects);
      } else {
        setSelectedObjects(['单井']);
      }

      // Simulate quick "正在了解你的工作需求..." state transition
      const timer = setTimeout(() => {
        setModalState('confirm');
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [isOpen, workspaceData]);

  // Toggle helpers
  const toggleContentTag = (name: string) => {
    setNoMatchWarning(null);
    if (selectedContent.includes(name)) {
      setSelectedContent(selectedContent.filter(item => item !== name));
    } else {
      setSelectedContent([...selectedContent, name]);
    }
  };

  const toggleObjectTag = (name: string) => {
    setNoMatchWarning(null);
    if (selectedObjects.includes(name)) {
      setSelectedObjects(selectedObjects.filter(item => item !== name));
    } else {
      setSelectedObjects([...selectedObjects, name]);
    }
  };

  // Handle clicking "确定"
  const handleConfirm = () => {
    if (selectedContent.length === 0) return;

    // Transition to 'preparing' state
    setModalState('preparing');

    // Simulate system background MBU filtering and IPOMSQ resource binding
    setTimeout(() => {
      // Complete initialization
      onConfirm({
        businessContent: selectedContent,
        workTypes: [],
        businessObjects: selectedObjects,
      });
    }, 1800);
  };

  // Handle retry when initialization fails
  const handleRetry = () => {
    handleConfirm();
  };

  // Calculate Summary Text
  const totalSelectedCount = selectedContent.length + selectedObjects.length;
  const summaryText = useMemo(() => {
    const allSelected = [...selectedContent, ...selectedObjects];
    if (allSelected.length === 0) return isZh ? '暂未选择' : 'None';
    if (allSelected.length <= 5) {
      return allSelected.join(' · ');
    }
    return `${allSelected.slice(0, 3).join(' · ')} · 等${allSelected.length}项`;
  }, [selectedContent, selectedObjects, isZh]);

  if (!isOpen) return null;

  // Workspace context fields
  const userRole = workspaceData?.userRole || (isZh ? '采油工程师' : 'Production Engineer');
  const boundAgent = workspaceData?.defaultAgent || (isZh ? '智能问数' : 'Intelligent Query');
  const taskDesc = workspaceData?.description || (isZh
    ? '分析A区块重点井近期生产变化'
    : 'Analyze recent production changes of key wells in Block A');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-[760px] overflow-hidden flex flex-col max-h-[90vh] relative"
      >
        {/* ================= STATE 1: RECOMMENDATION LOADING (推荐加载中) ================= */}
        {modalState === 'loading' && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[380px]">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-md">
              <i className="fas fa-brain text-2xl animate-pulse"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {isZh ? '正在了解你的工作需求…' : 'Understanding your work requirements...'}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-md">
                {isZh
                  ? '将结合岗位、空间任务和当前智能体推荐关注内容'
                  : 'Combining role, workspace task, and agent to recommend focus topics'}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
              <span className="text-xs text-indigo-600 font-medium">
                {isZh ? '正在生成推荐标签' : 'Generating recommendations'}
              </span>
            </div>
          </div>
        )}

        {/* ================= STATE 2: TAG CONFIRMATION (标签确认) ================= */}
        {modalState === 'confirm' && (
          <>
            {/* Header Area */}
            <div className="px-7 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 via-indigo-50/20 to-blue-50/30 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 flex-shrink-0">
                  <i className="fas fa-sliders text-sm"></i>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800 tracking-tight">
                    {isZh ? '选择关注内容' : 'Select Focus Topics'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isZh
                      ? '选择本空间关注的内容，我们将为你准备相关业务资源。'
                      : 'Select topics for this workspace, and we will prepare relevant business resources for you.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-7 space-y-6 custom-scrollbar">
              {/* Warning Banner if No Matching Resources found */}
              {noMatchWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800 font-medium">
                  <i className="fas fa-exclamation-triangle text-amber-600 flex-shrink-0"></i>
                  <span>{noMatchWarning}</span>
                </div>
              )}

              {/* ① Current Workspace Context Card */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100/80">
                    {userRole}
                  </span>
                  <span className="text-slate-300 font-bold">·</span>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-100/80">
                    {boundAgent}
                  </span>
                </div>

                <div className="text-xs text-slate-700 font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200/60">
                  <div className="flex items-start justify-between">
                    <p className={`${!isTaskExpanded ? 'line-clamp-2' : ''} text-slate-800`}>
                      {taskDesc}
                    </p>
                    {taskDesc.length > 50 && (
                      <button
                        type="button"
                        onClick={() => setIsTaskExpanded(!isTaskExpanded)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold ml-2 flex-shrink-0 cursor-pointer"
                      >
                        {isTaskExpanded ? (isZh ? '收起' : 'Collapse') : (isZh ? '完整内容' : 'Expand')}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ② Core Focus Tags ("你关注什么？") */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 rounded-full bg-indigo-600 inline-block"></span>
                    <span>{isZh ? '你关注什么？' : 'What is your focus?'}</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-normal">
                    {isZh ? '可多选' : 'Multiple choices'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {PRIMARY_BUSINESS_CONTENT.map(name => {
                    const isSelected = selectedContent.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleContentTag(name)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center gap-1.5 border cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-semibold'
                            : 'bg-slate-50 hover:bg-slate-100/80 text-slate-700 border-slate-200/80'
                        }`}
                      >
                        {isSelected && <i className="fas fa-check text-[10px]"></i>}
                        <span>{name}</span>
                      </button>
                    );
                  })}

                  {/* Extended Tags if showMoreContent is true */}
                  {showMoreContent &&
                    EXTENDED_BUSINESS_CONTENT.map(name => {
                      const isSelected = selectedContent.includes(name);
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => toggleContentTag(name)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center gap-1.5 border cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-semibold'
                              : 'bg-slate-50 hover:bg-slate-100/80 text-slate-700 border-slate-200/80'
                          }`}
                        >
                          {isSelected && <i className="fas fa-check text-[10px]"></i>}
                          <span>{name}</span>
                        </button>
                      );
                    })}

                  {/* Toggle More Button */}
                  <button
                    type="button"
                    onClick={() => setShowMoreContent(!showMoreContent)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 bg-white border border-dashed border-slate-300 hover:border-slate-400 hover:text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{showMoreContent ? (isZh ? '收起' : 'Less') : (isZh ? '更多' : 'More')}</span>
                    <i className={`fas fa-chevron-${showMoreContent ? 'up' : 'down'} text-[10px]`}></i>
                  </button>
                </div>

                {selectedContent.length === 0 && (
                  <p className="text-[11px] text-rose-500 font-medium pt-0.5 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle text-[10px]"></i>
                    {isZh ? '请至少选择 1 项关注的内容' : 'Please select at least 1 topic'}
                  </p>
                )}
              </div>

              {/* ③ Target Objects ("关注哪些对象？") */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span>{isZh ? '关注哪些对象？' : 'Which object types?'}</span>
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {OBJECT_TYPE_TAGS.map(name => {
                    const isSelected = selectedObjects.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleObjectTag(name)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center gap-1.5 border cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-semibold'
                            : 'bg-slate-50 hover:bg-slate-100/80 text-slate-700 border-slate-200/80'
                        }`}
                      >
                        {isSelected && <i className="fas fa-check text-[10px]"></i>}
                        <span>{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ④ Selected Summary Bar */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-slate-900 flex-shrink-0">
                    {isZh ? `已选择 ${totalSelectedCount} 项` : `Selected ${totalSelectedCount} items`}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600 truncate font-medium">
                    {summaryText}
                  </span>
                </div>
              </div>
            </div>

            {/* ⑤ Footer Action Area (Only ONE [ 确定 ] Button) */}
            <div className="px-7 py-4 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-end flex-shrink-0">
              <button
                type="button"
                disabled={selectedContent.length === 0}
                onClick={handleConfirm}
                className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                  selectedContent.length === 0
                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 active:scale-95'
                }`}
              >
                <span>{isZh ? '确定' : 'Confirm'}</span>
              </button>
            </div>
          </>
        )}

        {/* ================= STATE 3: RESOURCE PREPARING (资源准备中) ================= */}
        {modalState === 'preparing' && (
          <div className="p-14 flex flex-col items-center justify-center text-center space-y-5 min-h-[360px]">
            <div className="w-12 h-12 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin flex items-center justify-center"></div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {isZh ? '正在准备工作空间资源' : 'Preparing workspace resources'}
              </h3>
              <p className="text-xs text-slate-500 mt-2">
                {isZh ? '请稍候……' : 'Please wait...'}
              </p>
            </div>
          </div>
        )}

        {/* ================= STATE 4: INITIALIZATION FAILED (初始化失败) ================= */}
        {modalState === 'failed' && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-5 min-h-[360px]">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl font-bold">
              !
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {isZh ? '工作空间资源准备失败' : 'Failed to prepare workspace resources'}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5">
                {isZh ? '请重新尝试准备相关资源' : 'Please try preparing resources again'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              {isZh ? '重新准备' : 'Retry Preparation'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
