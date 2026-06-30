import React, { useState, useMemo } from 'react';
import { Workspace } from '../types';
import { translations } from '../i18n';

interface WorkspaceDetailTopBarProps {
  lang: 'zh' | 'en';
  activeWorkspaceData?: Workspace;
  currentUser: string;
  onBackToList: () => void;
  onEditCurrentWorkspace: () => void;
  workspaceVersion: 'foundation' | 'professional' | 'enterprise';
  setWorkspaceVersion: (version: 'foundation' | 'professional' | 'enterprise') => void;
  isResourcePanelOpen: boolean;
  setIsResourcePanelOpen: (open: boolean) => void;
  isTracePanelOpen: boolean;
  setIsTracePanelOpen: (open: boolean) => void;
  setIsVersionModalOpen: (open: boolean) => void;

  // Optional Agent Running Props
  isAgentRunning?: boolean;
  agentName?: string;
  statusText?: string;
  isCompleted?: boolean;
  isAssistantOpen?: boolean;
  hideAssistantToggle?: boolean;
  onToggleAssistant?: () => void;
  onCloseAgent?: () => void;
}

export const WorkspaceDetailTopBar: React.FC<WorkspaceDetailTopBarProps> = ({
  lang,
  activeWorkspaceData,
  currentUser,
  onBackToList,
  onEditCurrentWorkspace,
  workspaceVersion,
  setWorkspaceVersion,
  isResourcePanelOpen,
  setIsResourcePanelOpen,
  isTracePanelOpen,
  setIsTracePanelOpen,
  setIsVersionModalOpen,

  // Agent Running Props
  isAgentRunning = false,
  agentName = '',
  statusText,
  isCompleted = false,
  isAssistantOpen = false,
  hideAssistantToggle = false,
  onToggleAssistant,
  onCloseAgent,
}) => {
  const t = translations[lang];
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);

  // Local state for Agent selectors
  const wellsOptions = useMemo(() => [
    { id: 'well-1', name_zh: 'X-1 井', name_en: 'Well X-1' },
    { id: 'well-2', name_zh: '锦州25-1南井', name_en: 'Jinzhou 25-1 South Well' },
    { id: 'well-3', name_zh: '顺北11井', name_en: 'Shunbei 11 Well' },
    { id: 'well-4', name_zh: '金科1井', name_en: 'Jinke 1 Well' },
  ], []);

  const templatesOptions = useMemo(() => [
    { id: 'tpl-1', name_zh: '常规录井设计模板', name_en: 'Standard Mud Logging Design Template' },
    { id: 'tpl-2', name_zh: '地层设计高精方案模板', name_en: 'High-Precision Formation Design Template' },
    { id: 'tpl-3', name_zh: '一键综合探井模板', name_en: 'One-click Comprehensive Exploration Well Template' },
    { id: 'tpl-4', name_zh: '标准完井总结模板', name_en: 'Standard Well Completion Summary Template' },
  ], []);

  const [selectedWell, setSelectedWell] = useState(wellsOptions[0]);
  const [selectedTemplate, setSelectedTemplate] = useState(templatesOptions[0]);
  const [isWellDropdownOpen, setIsWellDropdownOpen] = useState(false);
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);

  const versions = useMemo(() => [
    { id: 'foundation', name: '基础版', enName: 'Foundation', desc: '通用智能助手', icon: 'fa-bolt', tagClass: 'bg-slate-100 text-slate-700' },
    { id: 'professional', name: '专业版', enName: 'Professional', desc: '场景闭环 Agent', icon: 'fa-cube', tagClass: 'bg-blue-100 text-blue-700' },
    { id: 'enterprise', name: '企业版', enName: 'Enterprise', desc: '岗位数字员工', icon: 'fa-users', tagClass: 'bg-purple-100 text-purple-700' },
  ], []);

  const currentVersionData = useMemo(() => {
    return versions.find(v => v.id === workspaceVersion) || versions[0];
  }, [versions, workspaceVersion]);

  return (
    <nav className="relative h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between flex-shrink-0 z-40 shadow-sm select-none" id="workspace-detail-nav">
      {/* LEFT SECTION: Workspace Info */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <button 
          onClick={onBackToList} 
          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
          title={lang === 'zh' ? '返回列表' : 'Back to List'}
          id="btn-back-to-list"
        >
          <i className="fas fa-arrow-left text-sm"></i>
        </button>
        
        <div className="h-6 w-px bg-slate-200"></div>
        
        {/* Workspace Name & Status */}
        <div className="flex flex-col min-w-[120px] max-w-[240px]">
          <div className="flex items-center gap-1.5 group">
            <span className="font-bold text-slate-900 tracking-tight truncate max-w-[150px]" id="workspace-detail-name" title={activeWorkspaceData?.name}>
              {activeWorkspaceData?.name}
            </span>
            {activeWorkspaceData?.owner === currentUser && (
              <button 
                onClick={onEditCurrentWorkspace}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-all"
                title={t.editWorkspace}
                id="btn-edit-workspace-name"
              >
                <i className="fas fa-edit text-xs"></i>
              </button>
            )}
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-600 uppercase tracking-wider border border-blue-100" id="workspace-detail-status">
              {activeWorkspaceData?.status || 'DRAFT'}
            </span>
          </div>
          {activeWorkspaceData?.description && (
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[220px]" id="workspace-detail-desc" title={activeWorkspaceData.description}>
              {activeWorkspaceData.description}
            </span>
          )}
        </div>
      </div>

      {/* CENTER SECTION: Active Agent Runtime Panel (if running) */}
      {isAgentRunning && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center gap-3 bg-slate-50/95 border border-slate-200/60 rounded-xl px-3 py-1 shadow-xs z-10">
          {/* Agent Info & Status */}
          <div className="flex items-center gap-2 pr-2.5 border-r border-slate-200 flex-shrink-0">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-100 flex-shrink-0 animate-pulse">
              <i className="fas fa-robot text-[11px]"></i>
            </div>
            <div className="min-w-0">
              <span className="text-[8px] text-slate-400 font-bold leading-none block uppercase tracking-wider">{lang === 'zh' ? '智能体' : 'Agent'}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <h2 className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">{agentName}</h2>
                {statusText && (
                  <div className={`flex items-center gap-0.5 px-1 py-0.5 border ${isCompleted ? 'bg-green-50 border-green-100 text-green-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'} rounded-full flex-shrink-0 scale-90 origin-left`}>
                    {isCompleted ? (
                      <i className="fas fa-check text-[6px]"></i>
                    ) : (
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                    )}
                    <span className={`text-[7px] font-black uppercase tracking-[0.03em] ${isCompleted ? 'text-green-600' : 'text-indigo-600'}`}>{statusText}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Target Well Selector */}
          <div className="relative flex-shrink-0 flex items-center gap-1.5 pl-0.5">
            <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{lang === 'zh' ? '当前对象:' : 'Object:'}</span>
            <button 
              onClick={() => {
                setIsWellDropdownOpen(!isWellDropdownOpen);
                setIsTemplateDropdownOpen(false);
                setIsVersionDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-bold transition-all shadow-2xs"
              id="btn-top-bar-well-dropdown"
            >
              <i className="fas fa-bullseye text-blue-500 text-[10px]"></i>
              <span className="max-w-[100px] truncate">{lang === 'zh' ? selectedWell.name_zh : selectedWell.name_en}</span>
              <i className="fas fa-chevron-down text-[8px] text-slate-400"></i>
            </button>
            
            {isWellDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsWellDropdownOpen(false)} />
                <div className="absolute left-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {wellsOptions.map((well) => (
                    <button
                      key={well.id}
                      onClick={() => {
                        setSelectedWell(well);
                        setIsWellDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 transition-colors flex items-center justify-between ${
                        selectedWell.id === well.id ? 'text-blue-600 font-bold bg-blue-50/40' : 'text-slate-600'
                      }`}
                    >
                      <span className="truncate">{lang === 'zh' ? well.name_zh : well.name_en}</span>
                      {selectedWell.id === well.id && <i className="fas fa-check text-[10px] text-blue-500"></i>}
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
                setIsWellDropdownOpen(false);
                setIsVersionDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-bold transition-all max-w-[180px] shadow-2xs"
              id="btn-top-bar-tpl-dropdown"
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

          {/* Integrated Actions for Agent: Assistant & Exit */}
          <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0"></div>

          {/* Call Assistant integrated button */}
          {onToggleAssistant && !hideAssistantToggle && (
            <button 
              onClick={onToggleAssistant}
              className={`px-2 py-1 h-7 flex items-center gap-1 rounded-lg transition-all font-bold text-[10px] uppercase tracking-wider shadow-xs flex-shrink-0 ${
                isAssistantOpen 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100'
              }`}
              id="btn-top-bar-toggle-assistant-integrated"
            >
              <i className={`fas ${isAssistantOpen ? 'fa-comment-dots' : 'fa-sparkles'} text-[9px]`}></i>
              <span>{lang === 'zh' ? '智能助手' : 'Assistant'}</span>
            </button>
          )}

          {/* Exit/Close Agent integrated button */}
          {onCloseAgent && (
            <button 
              onClick={onCloseAgent}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex-shrink-0"
              title={lang === 'zh' ? '退出运行' : 'Exit Run'}
              id="btn-top-bar-close-agent-integrated"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          )}
        </div>
      )}

      {/* RIGHT SECTION: Standard Controls & Version Switcher on the Right */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Standard Controls: Share, Settings */}
        <div className="flex items-center gap-1 text-slate-400">
          <button 
            className="hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors" 
            title={lang === 'zh' ? '分享' : 'Share'}
            id="btn-workspace-share"
          >
            <i className="fas fa-share-alt"></i>
          </button>
          <button 
            className="hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors" 
            title={lang === 'zh' ? '设置' : 'Settings'}
            id="btn-workspace-settings"
          >
            <i className="fas fa-cog"></i>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200"></div>

        {/* Version Switcher placed on the Right */}
        <div className="relative" id="version-dropdown-container">
          <button 
            onClick={() => {
              setIsVersionDropdownOpen(!isVersionDropdownOpen);
              setIsWellDropdownOpen(false);
              setIsTemplateDropdownOpen(false);
            }}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 transition-all text-left"
            id="btn-toggle-version-dropdown"
          >
            <div className="w-5 h-5 rounded flex items-center justify-center bg-white border border-slate-200 shadow-xs text-slate-600">
              <i className={`fas ${currentVersionData.icon} text-[10px]`}></i>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-800 leading-tight">{currentVersionData.name}</span>
            </div>
            <i className={`fas fa-chevron-down text-[8px] text-slate-400 transition-transform duration-200 ${isVersionDropdownOpen ? 'rotate-180' : ''}`}></i>
          </button>

          {isVersionDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsVersionDropdownOpen(false)}></div>
              <div className="absolute top-full right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" id="version-dropdown-content">
                <div className="p-2.5 border-b border-slate-100 bg-slate-50/50">
                  <h4 className="text-xs font-bold text-slate-800">{lang === 'zh' ? '切换版本' : 'Switch Version'}</h4>
                </div>
                <div className="p-1.5 flex flex-col gap-1">
                  {versions.map(v => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setWorkspaceVersion(v.id as any);
                        setIsVersionDropdownOpen(false);
                      }}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-all text-left ${workspaceVersion === v.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50 border border-transparent'}`}
                      id={`btn-select-version-${v.id}`}
                    >
                      <div className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap ${v.tagClass}`}>
                        {v.name}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm font-bold truncate ${workspaceVersion === v.id ? 'text-blue-700' : 'text-slate-700'}`}>{v.enName}</span>
                        <span className="text-[10px] text-slate-500 truncate">{v.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div 
                  onClick={() => {
                    setIsVersionModalOpen(true);
                    setIsVersionDropdownOpen(false);
                  }}
                  className="p-3 border-t border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between"
                  id="btn-view-version-comparison"
                >
                  <span className="text-xs font-medium text-blue-600">{lang === 'zh' ? '查看版本对比详情' : 'View version comparison details'}</span>
                  <i className="fas fa-arrow-right text-[10px] text-blue-600"></i>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

