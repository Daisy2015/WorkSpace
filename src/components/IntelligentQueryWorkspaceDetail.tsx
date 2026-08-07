import React from 'react';
import { IntelligentQueryTopBar } from './IntelligentQueryTopBar';
import { ResourceTree } from './ResourceTree';
import { MultiAgentChatPanel } from './MultiAgentChatPanel';
import { EvidenceChainPanel } from './EvidenceChainPanel';
import { Workspace, ResourceNode, Message, SavedOutcome } from '../types';

interface IntelligentQueryWorkspaceDetailProps {
  lang: 'zh' | 'en';
  activeWorkspaceId: string;
  activeWorkspaceData: Workspace;
  currentUser: string;
  onBackToList: () => void;
  onEditCurrentWorkspace: () => void;
  onOpenSettings: () => void;
  
  // Resource Tree
  resourceTree: ResourceNode[];
  selectedResources: Set<string>;
  onToggleResource: (id: string, node: ResourceNode) => void;
  onSelectResourceForDetail: (node: ResourceNode) => void;
  onAddResource: (parentId: string, newResource: ResourceNode) => void;
  onDeleteResources: (idsToDelete: string[]) => void;
  onTogglePublic: (id: string, node: ResourceNode) => void;
  onOpenAddResourcePage: () => void;
  savedOutcomes?: SavedOutcome[];
  onDeleteOutcome?: (id: string) => void;
  onSelectOutcome?: (outcome: SavedOutcome) => void;
  onOpenInterestModal?: () => void;
  isResourceScopeInitialized?: boolean;
  interestTags?: {
    businessContent: string[];
    workTypes: string[];
    businessObjects: string[];
  };
  
  // Object scope
  isObjectScopeExpanded: boolean;
  setIsObjectScopeExpanded: (expanded: boolean) => void;
  groupedObjects: Record<string, any[]>;
  
  // Chat
  multiAgentMessages: Message[];
  setMultiAgentMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onSelectMessage: (msg: Message | null) => void;
  onUpdateWorkspaceName: (name: string) => void;
  onEditReport: (content: string, msgId: string) => void;
  displayAgents: any[];
  workspaceVersion: 'foundation' | 'professional' | 'enterprise';
  onSaveOutcome: (outcome: any) => void;
  
  // Panel States
  isResourcePanelOpen: boolean;
  setIsResourcePanelOpen: (open: boolean) => void;
}

export const IntelligentQueryWorkspaceDetail: React.FC<IntelligentQueryWorkspaceDetailProps> = ({
  lang,
  activeWorkspaceId,
  activeWorkspaceData,
  currentUser,
  onBackToList,
  onEditCurrentWorkspace,
  onOpenSettings,
  
  resourceTree,
  selectedResources,
  onToggleResource,
  onSelectResourceForDetail,
  onAddResource,
  onDeleteResources,
  onTogglePublic,
  onOpenAddResourcePage,
  savedOutcomes,
  onDeleteOutcome,
  onSelectOutcome,
  onOpenInterestModal,
  isResourceScopeInitialized,
  interestTags,
  
  isObjectScopeExpanded,
  setIsObjectScopeExpanded,
  groupedObjects,
  
  multiAgentMessages,
  setMultiAgentMessages,
  onSelectMessage,
  onUpdateWorkspaceName,
  onEditReport,
  displayAgents,
  workspaceVersion,
  onSaveOutcome,
  
  isResourcePanelOpen,
  setIsResourcePanelOpen,
}) => {
  const evidencePanelRef = React.useRef<any>(null);

  const toggleEvidencePanel = (expand: boolean) => {
    evidencePanelRef.current?.toggle(expand);
  };
  return (
    <div className="h-full relative flex flex-col" id="intelligent-query-workspace-detail">
      {/* Custom Top Bar */}
      <IntelligentQueryTopBar
        lang={lang}
        activeWorkspaceData={activeWorkspaceData}
        currentUser={currentUser}
        onBackToList={onBackToList}
        onEditCurrentWorkspace={onEditCurrentWorkspace}
        isResourcePanelOpen={isResourcePanelOpen}
        setIsResourcePanelOpen={setIsResourcePanelOpen}
        onOpenSettings={onOpenSettings}
      />
      
      {/* Content Area */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Resource Panel */}
        <div className={`${isResourcePanelOpen ? 'w-96 border-r' : 'w-0 border-none'} h-full flex-shrink-0 z-20 shadow-lg bg-white border-slate-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}>
          <div className="w-96 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden relative">
              <ResourceTree 
                treeData={resourceTree.filter(node => node.name !== '智能构建过程' && node.name !== '智能构建过程V2')}
                selectedResources={selectedResources} 
                onToggleResource={onToggleResource} 
                onSelectNode={(node) => {
                  if (node.type === 'artifact') {
                    onSelectResourceForDetail(node);
                  }
                }}
                onAddResource={onAddResource}
                onDeleteResources={onDeleteResources}
                onTogglePublic={onTogglePublic}
                onOpenAddResourcePage={onOpenAddResourcePage}
                lang={lang}
                hideCheckboxes={false}
                isSmartReport={false}
                savedOutcomes={savedOutcomes}
                onDeleteOutcome={onDeleteOutcome}
                onSelectOutcome={onSelectOutcome}
                onOpenInterestModal={onOpenInterestModal}
                isResourceScopeInitialized={isResourceScopeInitialized}
                interestTags={interestTags}
                objects={activeWorkspaceData?.objects}
              />
            </div>
          </div>
        </div>

        {/* Left panel collapse/expand button */}
        <button 
          onClick={() => setIsResourcePanelOpen(!isResourcePanelOpen)}
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-12 bg-white border border-slate-200 shadow-md rounded-r-md flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all z-30 cursor-pointer ${isResourcePanelOpen ? 'left-[384px]' : 'left-0'}`}
          title={isResourcePanelOpen ? (lang === 'zh' ? '收起资源面板' : 'Collapse Resources') : (lang === 'zh' ? '展开资源面板' : 'Expand Resources')}
          style={{ transition: 'left 300ms ease-in-out' }}
        >
          <i className={`fas ${isResourcePanelOpen ? 'fa-chevron-left' : 'fa-chevron-right'} text-[10px]`}></i>
        </button>

        {/* Center Chat Panel (Large/Full Screen width because there is no right TracePanel) */}
        <div className="flex-1 min-w-0 z-0 bg-gray-50 flex flex-col overflow-hidden">
          <div className="flex-1 relative flex flex-row">
            <div className="flex-1 h-full relative p-3">
              <MultiAgentChatPanel 
                messages={multiAgentMessages}
                setMessages={setMultiAgentMessages}
                selectedResources={selectedResources}
                allResources={resourceTree}
                onSelectMessage={onSelectMessage}
                onChatStart={() => {}}
                onAddResource={onAddResource}
                currentWorkspace={activeWorkspaceData}
                onUpdateWorkspaceName={onUpdateWorkspaceName}
                lang={lang}
                onEditReport={onEditReport}
                onToggleTracePanel={() => {}}
                isTracePanelOpen={false}
                agents={displayAgents}
                workspaceVersion={workspaceVersion}
                onSaveOutcome={onSaveOutcome}
                onViewEvidence={() => toggleEvidencePanel(true)}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Evidence Chain Panel */}
      <EvidenceChainPanel 
        lang={lang} 
        ref={evidencePanelRef}
      />
    </div>
  );
};
