import React from 'react';
import { ResourceTree } from './ResourceTree';
import { ResourceNode, SavedOutcome } from '../types';

interface WellDeclineRequirementTreeProps {
    lang: 'zh' | 'en';
    onOpenAddResourcePage?: () => void;
    treeData?: ResourceNode[];
    selectedResources?: Set<string>;
    onToggleResource?: (id: string, node: ResourceNode) => void;
    onSelectNode?: (node: ResourceNode) => void;
    onAddResource?: (parentId: string, resource: ResourceNode) => void;
    onDeleteResources?: (ids: string[]) => void;
    onTogglePublic?: (id: string, node: ResourceNode) => void;
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
    onRemoveObject?: (id: string) => void;
}

export const WELL_DECLINE_RESOURCE_TREE: ResourceNode[] = [
    {
        id: 'decline-data-1',
        name: '生产动态数据',
        type: 'folder',
        children: [
            { id: 'decline-d1-1', name: '日产液量历史 (数据)', type: 'artifact', meta: { customIcon: 'fa-chart-line text-blue-500' } },
            { id: 'decline-d1-2', name: '日产油量历史 (数据)', type: 'artifact', meta: { customIcon: 'fa-chart-area text-emerald-500' } },
            { id: 'decline-d1-3', name: '含水率历史 (数据)', type: 'artifact', meta: { customIcon: 'fa-tint text-indigo-500' } }
        ]
    },
    {
        id: 'decline-data-2',
        name: '井史与措施',
        type: 'folder',
        children: [
            { id: 'decline-d2-1', name: '修井记录 (文档)', type: 'artifact', meta: { customIcon: 'fa-file-alt text-amber-500' } },
            { id: 'decline-d2-2', name: '酸化压裂历史 (数据)', type: 'artifact', meta: { customIcon: 'fa-bolt text-rose-500' } }
        ]
    },
    {
        id: 'decline-data-3',
        name: '油藏数据',
        type: 'folder',
        children: [
            { id: 'decline-d3-1', name: '地层压力变化 (图像)', type: 'artifact', meta: { customIcon: 'fa-mountain text-purple-500' } },
            { id: 'decline-d3-2', name: '流体性质 (报告)', type: 'artifact', meta: { customIcon: 'fa-vial text-teal-500' } }
        ]
    },
    {
        id: 'decline-data-4',
        name: '设备参数',
        type: 'folder',
        children: [
            { id: 'decline-d4-1', name: '泵效监测 (数据)', type: 'artifact', meta: { customIcon: 'fa-cogs text-slate-500' } },
            { id: 'decline-d4-2', name: '管柱状态 (文档)', type: 'artifact', meta: { customIcon: 'fa-align-left text-sky-500' } }
        ]
    }
];

export const WellDeclineRequirementTree: React.FC<WellDeclineRequirementTreeProps> = ({ 
    lang, 
    onOpenAddResourcePage,
    treeData,
    selectedResources,
    onToggleResource,
    onSelectNode,
    onAddResource,
    onDeleteResources,
    onTogglePublic,
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
}) => {
    // Default objects for single well diagnosis if none passed
    const defaultObjects = objects && objects.length > 0 ? objects : [
      { id: 'well-001', label: 'XX-1井', category: '单井对象', type: '单井对象' },
      { id: 'well-002', label: 'A-02井', category: '单井对象', type: '单井对象' }
    ];

    return (
        <ResourceTree
            treeData={treeData || WELL_DECLINE_RESOURCE_TREE}
            selectedResources={selectedResources || new Set()}
            onToggleResource={onToggleResource || (() => {})}
            onSelectNode={onSelectNode || (() => {})}
            onAddResource={onAddResource || (() => {})}
            onDeleteResources={onDeleteResources || (() => {})}
            onTogglePublic={onTogglePublic || (() => {})}
            onOpenAddResourcePage={onOpenAddResourcePage || (() => {})}
            lang={lang}
            savedOutcomes={savedOutcomes}
            onDeleteOutcome={onDeleteOutcome}
            onRenameOutcome={onRenameOutcome}
            onShowOriginalChat={onShowOriginalChat}
            onSelectOutcome={onSelectOutcome}
            onOpenInterestModal={onOpenInterestModal}
            isResourceScopeInitialized={isResourceScopeInitialized}
            interestTags={interestTags}
            objects={defaultObjects}
            onClearObjects={onClearObjects}
            onRemoveObject={onRemoveObject}
        />
    );
};

