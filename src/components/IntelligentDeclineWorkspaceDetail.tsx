import React, { useState } from 'react';
import { motion } from 'motion/react';
import { IntelligentDeclineTopBar } from './IntelligentDeclineTopBar';
import { WellDeclineRequirementTree } from './WellDeclineRequirementTree';
import { WellDeclineDiagnosis } from './WellDeclineDiagnosis';
import { AssistantSidebar } from './AssistantSidebar';
import { EvidenceChainPanel } from './EvidenceChainPanel';
import { Workspace } from '../types';

interface IntelligentDeclineWorkspaceDetailProps {
  lang: 'zh' | 'en';
  activeWorkspaceId: string;
  activeWorkspaceData: Workspace;
  currentUser: string;
  onBackToList: () => void;
  onEditCurrentWorkspace: () => void;
  onOpenSettings: () => void;
  
  // Panel states
  isResourcePanelOpen: boolean;
  setIsResourcePanelOpen: (open: boolean) => void;
}

export const IntelligentDeclineWorkspaceDetail: React.FC<IntelligentDeclineWorkspaceDetailProps> = ({
  lang,
  activeWorkspaceId,
  activeWorkspaceData,
  currentUser,
  onBackToList,
  onEditCurrentWorkspace,
  onOpenSettings,
  
  isResourcePanelOpen,
  setIsResourcePanelOpen,
}) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="h-full relative flex flex-col" id="intelligent-decline-workspace-detail">
      {/* Custom Top Bar */}
      <IntelligentDeclineTopBar
        lang={lang}
        activeWorkspaceData={activeWorkspaceData}
        currentUser={currentUser}
        onBackToList={onBackToList}
        onEditCurrentWorkspace={onEditCurrentWorkspace}
        isResourcePanelOpen={isResourcePanelOpen}
        setIsResourcePanelOpen={setIsResourcePanelOpen}
        onOpenSettings={onOpenSettings}
        isAssistantOpen={isAssistantOpen}
        onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)}
      />
      
      {/* CONTENT CONTAINER */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Panel: Facts & Resources */}
        <div className={`${isResourcePanelOpen ? 'w-96 border-r' : 'w-0 border-none'} h-full flex-shrink-0 z-20 shadow-lg bg-white border-slate-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}>
          <div className="w-96 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden relative">
              <WellDeclineRequirementTree lang={lang} />
            </div>
          </div>
        </div>

        {/* Toggle button on Left Panel boundary */}
        <button 
          onClick={() => setIsResourcePanelOpen(!isResourcePanelOpen)}
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-12 bg-white border border-slate-200 shadow-md rounded-r-md flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all z-30 cursor-pointer ${isResourcePanelOpen ? 'left-[384px]' : 'left-0'}`}
          title={isResourcePanelOpen ? (lang === 'zh' ? '收起资源面板' : 'Collapse Resources') : (lang === 'zh' ? '展开资源面板' : 'Expand Resources')}
          style={{ transition: 'left 300ms ease-in-out' }}
        >
          <i className={`fas ${isResourcePanelOpen ? 'fa-chevron-left' : 'fa-chevron-right'} text-[10px]`}></i>
        </button>

        {/* Center / Right Section */}
        <motion.div 
          className="flex-1 min-w-0 z-0 bg-gray-50 flex flex-col overflow-hidden"
          animate={{ marginRight: isAssistantOpen ? 384 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className={`flex-1 relative flex flex-row`}>
            {/* Center Area: Well Decline Diagnosis Agent */}
            <div className="flex-1 h-full relative p-3">
              <WellDeclineDiagnosis 
                key={`decline-intelligent`}
                lang={lang}
                onClose={() => {}}
                onComplete={() => {}}
              />
            </div>
          </div>
        </motion.div>

        {/* Assistant Sidebar */}
        <AssistantSidebar
          lang={lang}
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
          agentName={lang === 'zh' ? '单井产量诊断智能体' : 'Well Decline Diagnostic Agent'}
          agentStatus="Idle"
          mode="absolute"
          offsetTop="top-0"
        />
      </div>

      {/* Evidence Chain Panel */}
      <EvidenceChainPanel lang={lang} />
    </div>
  );
};
