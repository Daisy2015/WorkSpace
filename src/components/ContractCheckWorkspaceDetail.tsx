import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { IntelligentReportTopBar } from './IntelligentReportTopBar';
import { ResourceTree } from './ResourceTree';
import { ContractCheckAgent } from './ContractCheckAgent';
import { AssistantSidebar } from './AssistantSidebar';
import { EvidenceChainPanel } from './EvidenceChainPanel';
import { Workspace, ResourceNode, SavedOutcome } from '../types';
import { CONTRACT_CHECK_RESOURCE_TREE, REPORT_CHECK_RESOURCE_TREE } from '../constants';

interface ContractCheckWorkspaceDetailProps {
  lang: 'zh' | 'en';
  activeWorkspaceId: string;
  activeWorkspaceData: Workspace;
  currentUser: string;
  onBackToList: () => void;
  onEditCurrentWorkspace: () => void;
  onOpenSettings: () => void;
  
  // Resource Tree props
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
  onRenameOutcome?: (id: string, newName: string) => void;
  onShowOriginalChat?: (outcome: SavedOutcome) => void;
  onSelectOutcome?: (outcome: SavedOutcome) => void;
  onOpenInterestModal?: () => void;
  isResourceScopeInitialized?: boolean;
  interestTags?: {
    businessContent: string[];
    workTypes: string[];
    businessObjects: string[];
  };
  objects?: any[];
  onClearObjects?: () => void;
  onRemoveObject?: (obj: any) => void;
  onSaveOutcome?: (outcome: any) => void;
  onSaveReportOutcome?: (name: string) => void;
  
  // Panel states
  isResourcePanelOpen: boolean;
  setIsResourcePanelOpen: (open: boolean) => void;
}

export const ContractCheckWorkspaceDetail: React.FC<ContractCheckWorkspaceDetailProps> = ({
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
  onRenameOutcome,
  onShowOriginalChat,
  onSelectOutcome,
  onOpenInterestModal,
  isResourceScopeInitialized,
  interestTags,
  objects,
  onClearObjects,
  onRemoveObject,
  onSaveOutcome,
  onSaveReportOutcome,
  
  isResourcePanelOpen,
  setIsResourcePanelOpen,
}) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [assistantLogs, setAssistantLogs] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([]);

  const handleAssistantLog = (msg: string) => {
    setAssistantLogs(prev => [...prev, { sender: 'assistant', text: msg }]);
    setIsAssistantOpen(true);
  };

  const effectiveTreeData = useMemo(() => {
    const filtered = resourceTree.filter(node => node.name !== '智能构建过程' && node.name !== '智能构建过程V2');
    const hasContractNodes = filtered.some(node => 
      node.name.includes('合同') || node.name.includes('审查') || node.name.includes('强条') || node.name.includes('校核标准')
    );
    if (!hasContractNodes || filtered.length === 0) {
      return CONTRACT_CHECK_RESOURCE_TREE;
    }
    return filtered;
  }, [resourceTree]);

  const reportConfig = useMemo(() => ({
    isSmartReport: true,
    projectName: activeWorkspaceData?.name || (lang === 'zh' ? '采购合同审查与合规校核' : 'Procurement Contract Audit'),
    outlineConfirmRequired: activeWorkspaceData?.reportNeedOutline ?? false,
    outline: []
  }), [lang, activeWorkspaceData]);

  return (
    <div className="h-full relative flex flex-col" id="contract-check-workspace-detail">
      {/* Custom Top Bar */}
      <IntelligentReportTopBar
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
              <ResourceTree 
                treeData={effectiveTreeData}
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
                hideCheckboxes={true}
                isSmartReport={true}
                isReportCheck={true}
                savedOutcomes={savedOutcomes}
                onDeleteOutcome={onDeleteOutcome}
                onRenameOutcome={onRenameOutcome}
                onShowOriginalChat={onShowOriginalChat}
                onSelectOutcome={onSelectOutcome}
                onOpenInterestModal={onOpenInterestModal}
                isResourceScopeInitialized={isResourceScopeInitialized}
                interestTags={interestTags}
                objects={objects}
                onClearObjects={onClearObjects}
                onRemoveObject={onRemoveObject}
              />
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
            {/* Center Area: Procurement Contract Check Agent */}
            <div className="flex-1 h-full relative p-3">
              <ContractCheckAgent 
                key={`contract-check-${refreshKey}`}
                lang={lang}
                config={reportConfig}
                onCloseAgent={() => {}}
                onComplete={() => {}}
                onAssistantLog={handleAssistantLog}
                onSaveOutcome={(name) => {
                  if (onSaveReportOutcome) {
                    onSaveReportOutcome(name);
                  } else if (onSaveOutcome) {
                    onSaveOutcome(name);
                  }
                }}
              />
            </div>
          </div>
        </motion.div>
        
        {/* Assistant Sidebar */}
        <AssistantSidebar
          lang={lang}
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
          agentName={lang === 'zh' ? '采购合同校核智能体' : 'Procurement Contract Audit Agent'}
          agentStatus="Idle"
          mode="absolute"
          offsetTop="top-0"
          onRefreshAgent={() => setRefreshKey(prev => prev + 1)}
          externalLogs={assistantLogs}
        />
      </div>

      {/* Evidence Chain Panel */}
      <EvidenceChainPanel lang={lang} />
    </div>
  );
};
