import React, { useState, useMemo } from 'react';
import { Workspace } from '../types';
import { translations } from '../i18n';

interface IntelligentQueryTopBarProps {
  lang: 'zh' | 'en';
  activeWorkspaceData?: Workspace;
  currentUser: string;
  onBackToList: () => void;
  onEditCurrentWorkspace: () => void;
  isResourcePanelOpen: boolean;
  setIsResourcePanelOpen: (open: boolean) => void;
  onOpenSettings?: () => void;
}

export const IntelligentQueryTopBar: React.FC<IntelligentQueryTopBarProps> = ({
  lang,
  activeWorkspaceData,
  currentUser,
  onBackToList,
  onEditCurrentWorkspace,
  isResourcePanelOpen,
  setIsResourcePanelOpen,
  onOpenSettings,
}) => {
  const t = translations[lang];

  return (
    <nav className="relative h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between flex-shrink-0 z-40 shadow-sm select-none" id="intelligent-query-top-bar">
      {/* LEFT SECTION: Workspace Info */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <button 
          onClick={onBackToList} 
          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
          title={lang === 'zh' ? '返回列表' : 'Back to List'}
          id="btn-back-to-list-query"
        >
          <i className="fas fa-arrow-left text-sm"></i>
        </button>
        
        <div className="h-6 w-px bg-slate-200"></div>
        
        {/* Workspace Name & Status */}
        <div className="flex flex-col min-w-[120px] max-w-[240px]">
          <div className="flex items-center gap-1.5 group">
            <span className="font-bold text-slate-900 tracking-tight truncate max-w-[150px]" id="workspace-detail-name-query" title={activeWorkspaceData?.name}>
              {activeWorkspaceData?.name}
            </span>
            {activeWorkspaceData?.owner === currentUser && (
              <button 
                onClick={onEditCurrentWorkspace}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-all"
                title={t.editWorkspace}
                id="btn-edit-workspace-name-query"
              >
                <i className="fas fa-edit text-xs"></i>
              </button>
            )}
          </div>
          {activeWorkspaceData?.description && (
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[220px]" id="workspace-detail-desc-query" title={activeWorkspaceData.description}>
              {activeWorkspaceData.description}
            </span>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Standard Controls (No Version Switcher) */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-1 text-slate-400">
          <button 
            className="hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors" 
            title={lang === 'zh' ? '成员管理' : 'Members'}
            id="btn-workspace-share-query"
          >
            <i className="fas fa-users"></i>
          </button>
          <button 
            onClick={onOpenSettings}
            className="hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors" 
            title={lang === 'zh' ? '工作空间目录' : 'Workspace Directory'}
            id="btn-workspace-settings-query"
          >
            <i className="fas fa-folder"></i>
          </button>
        </div>
      </div>
    </nav>
  );
};
