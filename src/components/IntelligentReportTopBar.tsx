import React, { useState, useMemo } from 'react';
import { Workspace } from '../types';
import { translations } from '../i18n';

interface IntelligentReportTopBarProps {
  lang: 'zh' | 'en';
  activeWorkspaceData?: Workspace;
  currentUser: string;
  onBackToList: () => void;
  onEditCurrentWorkspace: () => void;
  isResourcePanelOpen: boolean;
  setIsResourcePanelOpen: (open: boolean) => void;
  onOpenSettings?: () => void;
  isAssistantOpen?: boolean;
  onToggleAssistant?: () => void;
}

export const IntelligentReportTopBar: React.FC<IntelligentReportTopBarProps> = ({
  lang,
  activeWorkspaceData,
  currentUser,
  onBackToList,
  onEditCurrentWorkspace,
  isResourcePanelOpen,
  setIsResourcePanelOpen,
  onOpenSettings,
  isAssistantOpen = false,
  onToggleAssistant,
}) => {
  const t = translations[lang];

  const blocksOptions = useMemo(() => [
    { id: 'block-1', name_zh: '北海油田4区块', name_en: 'North Sea Block 4' },
    { id: 'block-2', name_zh: '锦州25-1南区块', name_en: 'Jinzhou 25-1 South Block' },
    { id: 'block-3', name_zh: '顺北区块', name_en: 'Shunbei Block' },
  ], []);

  const templatesOptions = useMemo(() => [
    { id: 'tpl-1', name_zh: '多井综合评价报告模板', name_en: 'Multi-Well Evaluation Template' },
    { id: 'tpl-2', name_zh: '钻井工程设计报告模板', name_en: 'Drilling Design Report Template' },
    { id: 'tpl-3', name_zh: '油藏描述及方案报告模板', name_en: 'Reservoir Description Template' },
  ], []);

  const [selectedBlock, setSelectedBlock] = useState(blocksOptions[0]);
  const [selectedTemplate, setSelectedTemplate] = useState(templatesOptions[0]);
  const [isBlockDropdownOpen, setIsBlockDropdownOpen] = useState(false);
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);

  return (
    <nav className="relative h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between flex-shrink-0 z-40 shadow-sm select-none" id="intelligent-report-top-bar">
      {/* LEFT SECTION: Workspace Info */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <button 
          onClick={onBackToList} 
          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
          title={lang === 'zh' ? '返回列表' : 'Back to List'}
          id="btn-back-to-list-report"
        >
          <i className="fas fa-arrow-left text-sm"></i>
        </button>
        
        <div className="h-6 w-px bg-slate-200"></div>
        
        {/* Workspace Name & Status */}
        <div className="flex flex-col min-w-[120px] max-w-[240px]">
          <div className="flex items-center gap-1.5 group">
            <span className="font-bold text-slate-900 tracking-tight truncate max-w-[150px]" id="workspace-detail-name-report" title={activeWorkspaceData?.name}>
              {activeWorkspaceData?.name}
            </span>
            {activeWorkspaceData?.owner === currentUser && (
              <button 
                onClick={onEditCurrentWorkspace}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-all"
                title={t.editWorkspace}
                id="btn-edit-workspace-name-report"
              >
                <i className="fas fa-edit text-xs"></i>
              </button>
            )}
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-600 uppercase tracking-wider border border-blue-100" id="workspace-detail-status-report">
              {activeWorkspaceData?.status || 'DRAFT'}
            </span>
          </div>
          {activeWorkspaceData?.description && (
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[220px]" id="workspace-detail-desc-report" title={activeWorkspaceData.description}>
              {activeWorkspaceData.description}
            </span>
          )}
        </div>
      </div>

      {/* CENTER SECTION: Active Agent Runtime Panel (Always Running) */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center gap-3 bg-slate-50/95 border border-slate-200/60 rounded-xl px-3 py-1 shadow-xs z-10">
        {/* Agent Info & Status */}
        <div className="flex items-center gap-2 pr-2.5 border-r border-slate-200 flex-shrink-0">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-100 flex-shrink-0 animate-pulse">
            <i className="fas fa-robot text-[11px]"></i>
          </div>
          <div className="min-w-0">
            <span className="text-[8px] text-slate-400 font-bold leading-none block uppercase tracking-wider">{lang === 'zh' ? '智能体' : 'Agent'}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <h2 className="text-xs font-bold text-slate-800 leading-none truncate max-w-[140px]">
                {activeWorkspaceData?.defaultAgent || (lang === 'zh' ? '智能报告编制智能体' : 'Smart Report Agent')}
              </h2>
              <div className="flex items-center gap-0.5 px-1 py-0.5 border bg-indigo-50 border-indigo-100 text-indigo-600 rounded-full flex-shrink-0 scale-90 origin-left">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                <span className="text-[7px] font-black uppercase tracking-[0.03em] text-indigo-600">
                  {activeWorkspaceData?.defaultAgent?.includes('校核') 
                    ? (lang === 'zh' ? '智能校核中...' : 'AI CHECKING...') 
                    : (lang === 'zh' ? '报告生成中...' : 'AI WRITING...')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Target Block Selector */}
        <div className="relative flex-shrink-0 flex items-center gap-1.5 pl-0.5">
          <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{lang === 'zh' ? '当前对象:' : 'Object:'}</span>
          <button 
            onClick={() => {
              setIsBlockDropdownOpen(!isBlockDropdownOpen);
              setIsTemplateDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-bold transition-all shadow-2xs"
            id="btn-top-bar-block-dropdown-report"
          >
            <i className="fas fa-bullseye text-blue-500 text-[10px]"></i>
            <span className="max-w-[100px] truncate">{lang === 'zh' ? selectedBlock.name_zh : selectedBlock.name_en}</span>
            <i className="fas fa-chevron-down text-[8px] text-slate-400"></i>
          </button>
          
          {isBlockDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsBlockDropdownOpen(false)} />
              <div className="absolute left-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {blocksOptions.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => {
                      setSelectedBlock(block);
                      setIsBlockDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 transition-colors flex items-center justify-between ${
                      selectedBlock.id === block.id ? 'text-blue-600 font-bold bg-blue-50/40' : 'text-slate-600'
                    }`}
                  >
                    <span className="truncate">{lang === 'zh' ? block.name_zh : block.name_en}</span>
                    {selectedBlock.id === block.id && <i className="fas fa-check text-[10px] text-blue-500"></i>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="h-4 w-px bg-slate-200 flex-shrink-0"></div>

        {/* Template Selector */}
        <div className="relative flex-shrink-0 flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{lang === 'zh' ? '当前模板:' : 'Template:'}</span>
          <button 
            onClick={() => {
              setIsTemplateDropdownOpen(!isTemplateDropdownOpen);
              setIsBlockDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-bold transition-all max-w-[180px] shadow-2xs"
            id="btn-top-bar-tpl-dropdown-report"
          >
            <i className="fas fa-file-alt text-amber-500 text-[10px]"></i>
            <span className="truncate max-w-[110px]">{lang === 'zh' ? selectedTemplate.name_zh : selectedTemplate.name_en}</span>
            <i className="fas fa-chevron-down text-[8px] text-slate-400"></i>
          </button>
          
          {isTemplateDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsTemplateDropdownOpen(false)} />
              <div className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {templatesOptions.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      setSelectedTemplate(tpl);
                      setIsTemplateDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 transition-colors flex items-center justify-between ${
                      selectedTemplate.id === tpl.id ? 'text-blue-600 font-bold bg-blue-50/40' : 'text-slate-600'
                    }`}
                  >
                    <span className="truncate">{lang === 'zh' ? tpl.name_zh : tpl.name_en}</span>
                    {selectedTemplate.id === tpl.id && <i className="fas fa-check text-[10px] text-blue-500"></i>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Integrated Actions for Agent: Assistant */}
        <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0"></div>

        {onToggleAssistant && (
          <button 
            onClick={onToggleAssistant}
            className={`px-2 py-1 h-7 flex items-center gap-1 rounded-lg transition-all font-bold text-[10px] uppercase tracking-wider shadow-xs flex-shrink-0 ${
              isAssistantOpen 
                ? 'bg-indigo-600 text-white' 
                : 'bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100'
            }`}
            id="btn-top-bar-toggle-assistant-integrated-report"
          >
            <i className={`fas ${isAssistantOpen ? 'fa-comment-dots' : 'fa-sparkles'} text-[9px]`}></i>
            <span>{lang === 'zh' ? '智能助手' : 'Assistant'}</span>
          </button>
        )}
      </div>

      {/* RIGHT SECTION: Standard Controls */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-1 text-slate-400">
          <button 
            className="hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors" 
            title={lang === 'zh' ? '成员管理' : 'Members'}
            id="btn-workspace-share-report"
          >
            <i className="fas fa-users"></i>
          </button>
          <button 
            onClick={onOpenSettings}
            className="hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors" 
            title={lang === 'zh' ? '工作空间目录' : 'Workspace Directory'}
            id="btn-workspace-settings-report"
          >
            <i className="fas fa-folder"></i>
          </button>
        </div>
      </div>
    </nav>
  );
};
