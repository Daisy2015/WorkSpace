import React, { useState } from 'react';
import { ResourceTree } from './ResourceTree';
import { ResourceNode, SavedOutcome } from '../types';

interface ProDocQaRequirementTreeProps {
    lang: 'zh' | 'en';
    onOpenAddResourcePage?: () => void;
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
}

export const ProDocQaRequirementTree: React.FC<ProDocQaRequirementTreeProps> = ({ 
    lang, 
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
}) => {
    const [selectedResources] = useState<Set<string>>(new Set(['crude-payment-4.2']));

    const docQaResources: ResourceNode[] = [
        {
            id: 'supplier-mgmt',
            name: lang === 'zh' ? '供应商管理' : 'Supplier Management',
            type: 'folder',
            meta: { customIcon: 'fa-folder text-blue-500 font-medium' },
            children: []
        },
        {
            id: 'purchase-contract',
            name: lang === 'zh' ? '采购合同' : 'Procurement Contract',
            type: 'folder',
            meta: { customIcon: 'fa-folder-open text-blue-500 font-medium' },
            children: [
                {
                    id: 'contract-clauses',
                    name: lang === 'zh' ? '合同条款' : 'Contract Clauses',
                    type: 'folder',
                    meta: { customIcon: 'fa-folder-open text-blue-500 font-medium' },
                    children: [
                        {
                            id: 'clause-general',
                            name: lang === 'zh' ? '通用条款' : 'General Clauses',
                            type: 'folder',
                            meta: { customIcon: 'fa-folder text-blue-500 font-medium' }
                        },
                        {
                            id: 'clause-payment',
                            name: lang === 'zh' ? '付款条款' : 'Payment Clauses',
                            type: 'folder',
                            meta: { customIcon: 'fa-folder text-blue-500 font-medium' }
                        },
                        {
                            id: 'clause-delivery',
                            name: lang === 'zh' ? '交付条款' : 'Delivery Clauses',
                            type: 'folder',
                            meta: { customIcon: 'fa-folder text-blue-500 font-medium' }
                        },
                        {
                            id: 'clause-liability',
                            name: lang === 'zh' ? '违约责任' : 'Liability for Breach',
                            type: 'folder',
                            meta: { customIcon: 'fa-folder text-blue-500 font-medium' }
                        }
                    ]
                },
                {
                    id: 'contract-fragments',
                    name: lang === 'zh' ? '合同文档片段' : 'Contract Document Snippets',
                    type: 'folder',
                    meta: { customIcon: 'fa-folder-open text-blue-500 font-medium' },
                    children: [
                        {
                            id: 'crude-oil-contract',
                            name: lang === 'zh' ? '《原油采购合同》' : '《Crude Oil Purchase Contract》',
                            type: 'folder',
                            meta: { customIcon: 'fa-file-alt text-blue-500 font-medium' },
                            children: [
                                {
                                    id: 'crude-payment-ch4',
                                    name: lang === 'zh' ? '第4章 付款条件' : 'Chapter 4 Payment Conditions',
                                    type: 'artifact',
                                    meta: { customIcon: 'fa-file-alt text-blue-500 font-medium' }
                                },
                                {
                                    id: 'crude-payment-4.2',
                                    name: lang === 'zh' ? '4.2 付款方式与期限' : '4.2 Payment Method & Period',
                                    type: 'artifact',
                                    meta: { customIcon: 'fa-circle text-[6px] text-blue-500 mr-1.5 mt-0.5' }
                                },
                                {
                                    id: 'crude-liability-ch7',
                                    name: lang === 'zh' ? '第7章 违约责任' : 'Chapter 7 Liability for Breach',
                                    type: 'artifact',
                                    meta: { customIcon: 'fa-file-alt text-blue-500 font-medium' }
                                },
                                {
                                    id: 'crude-delivery-7.3',
                                    name: lang === 'zh' ? '第7.3 延迟交付' : 'Section 7.3 Delayed Delivery',
                                    type: 'artifact',
                                    meta: { customIcon: 'fa-file-alt text-blue-500 font-medium' }
                                }
                            ]
                        },
                        {
                            id: 'device-contract',
                            name: lang === 'zh' ? '《设备采购合同》' : '《Equipment Purchase Contract》',
                            type: 'folder',
                            meta: { customIcon: 'fa-file-alt text-blue-500 font-medium' },
                            children: [
                                {
                                    id: 'device-acceptance-ch5',
                                    name: lang === 'zh' ? '第5章 验收条款' : 'Chapter 5 Acceptance Clauses',
                                    type: 'artifact',
                                    meta: { customIcon: 'fa-file-alt text-blue-500 font-medium' }
                                },
                                {
                                    id: 'device-acceptance-5.1',
                                    name: lang === 'zh' ? '第5.1 验收标准' : 'Section 5.1 Acceptance Criteria',
                                    type: 'artifact',
                                    meta: { customIcon: 'fa-file-alt text-blue-500 font-medium' }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ];

    return (
        <ResourceTree
            treeData={docQaResources}
            selectedResources={selectedResources}
            onToggleResource={() => {}}
            onSelectNode={() => {}}
            selectedNodeId="crude-payment-4.2"
            onAddResource={() => {}}
            onDeleteResources={() => {}}
            onTogglePublic={() => {}}
            onOpenAddResourcePage={onOpenAddResourcePage || (() => {})}
            lang={lang}
            hideCheckboxes={true}
            isSmartReport={true}
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
    );
};
