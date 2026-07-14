import React, { useState } from 'react';
import { motion } from 'motion/react';
import { IntelligentChartTopBar } from './IntelligentChartTopBar';
import { ProChartRequirementTree } from './ProChartRequirementTree';
import { ProChartGenerationAgent } from './ProChartGenerationAgent';
import { AssistantSidebar } from './AssistantSidebar';
import { EvidenceChainPanel } from './EvidenceChainPanel';
import { Workspace, Message } from '../types';

interface IntelligentChartWorkspaceDetailProps {
  lang: 'zh' | 'en';
  activeWorkspaceId: string;
  activeWorkspaceData: Workspace;
  currentUser: string;
  onBackToList: () => void;
  onEditCurrentWorkspace: () => void;
  onOpenSettings: () => void;
  
  // Chat / Assistant state
  multiAgentMessages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onSelectMessage: (msg: Message | null) => void;
  displayAgents: any[];
  workspaceVersion: 'foundation' | 'professional' | 'enterprise';
  onSaveOutcome: (outcome: any) => void;
  
  // Panel states
  isResourcePanelOpen: boolean;
  setIsResourcePanelOpen: (open: boolean) => void;
  onOpenAddResourcePage?: () => void;
}

export const IntelligentChartWorkspaceDetail: React.FC<IntelligentChartWorkspaceDetailProps> = ({
  lang,
  activeWorkspaceId,
  activeWorkspaceData,
  currentUser,
  onBackToList,
  onEditCurrentWorkspace,
  onOpenSettings,
  
  multiAgentMessages,
  setMessages,
  onSelectMessage,
  displayAgents,
  workspaceVersion,
  onSaveOutcome,
  
  isResourcePanelOpen,
  setIsResourcePanelOpen,
  onOpenAddResourcePage,
}) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="h-full relative flex flex-col" id="intelligent-chart-workspace-detail">
      {/* Custom Top Bar */}
      <IntelligentChartTopBar
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
              <ProChartRequirementTree lang={lang} onOpenAddResourcePage={onOpenAddResourcePage} />
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
            {/* Center Area: Professional Chart Generation */}
            <div className="flex-1 h-full relative p-3">
              <ProChartGenerationAgent 
                key={`pro-chart-intelligent-${refreshKey}`}
                lang={lang}
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
          agentName={lang === 'zh' ? '专业成图智能体' : 'Pro Mapping Agent'}
          agentStatus="Idle"
          mode="absolute"
          offsetTop="top-0"
          onRefreshAgent={() => setRefreshKey(prev => prev + 1)}
        />
      </div>
      {/* Evidence Chain Panel */}
      <EvidenceChainPanel lang={lang} />
    </div>
  );
};
