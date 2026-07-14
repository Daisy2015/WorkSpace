import React, { useState } from 'react';
import { ResourceTree } from './ResourceTree';
import { ResourceNode } from '../types';

interface ProChartRequirementTreeProps {
    lang: 'zh' | 'en';
    onOpenAddResourcePage?: () => void;
}

export const ProChartRequirementTree: React.FC<ProChartRequirementTreeProps> = ({ lang, onOpenAddResourcePage }) => {
    const [selectedResources] = useState<Set<string>>(new Set());

    const proChartResources: ResourceNode[] = [
        {
            id: 'pro-template',
            name: lang === 'zh' ? '图件模板' : 'Chart Templates',
            type: 'folder',
            children: [
                {
                    id: 'pro-temp-1',
                    name: lang === 'zh' ? '沉积微相综合柱状图模板' : 'Sedimentary Microfacies Columnar Template',
                    type: 'artifact',
                    meta: { customIcon: 'fa-palette text-indigo-500' }
                }
            ]
        },
        {
            id: 'pro-data',
            name: lang === 'zh' ? '数据准备' : 'Data Preparation',
            type: 'folder',
            children: [
                {
                    id: 'pro-data-1',
                    name: lang === 'zh' ? '测井数据' : 'Well Log Data',
                    type: 'artifact',
                    meta: { customIcon: 'fa-database text-slate-500' }
                },
                {
                    id: 'pro-data-2',
                    name: lang === 'zh' ? '录井数据' : 'Mud Log Data',
                    type: 'artifact',
                    meta: { customIcon: 'fa-file-alt text-slate-500' }
                },
                {
                    id: 'pro-data-3',
                    name: lang === 'zh' ? '岩心数据' : 'Core Data',
                    type: 'artifact',
                    meta: { customIcon: 'fa-file-image text-slate-500' }
                },
                {
                    id: 'pro-data-4',
                    name: lang === 'zh' ? '分层数据' : 'Layering Data',
                    type: 'artifact',
                    meta: { customIcon: 'fa-table text-slate-500' }
                }
            ]
        },
        {
            id: 'pro-structure',
            name: lang === 'zh' ? '图件结构' : 'Chart Structure',
            type: 'folder',
            children: [
                {
                    id: 'pro-layers',
                    name: lang === 'zh' ? '图层（8）' : 'Layers (8)',
                    type: 'folder',
                    children: [
                        {
                            id: 'layer-depth',
                            name: lang === 'zh' ? '深度层' : 'Depth Layer',
                            type: 'folder',
                            meta: { customIcon: 'fa-folder-open text-slate-400' },
                            children: [
                                {
                                    id: 'track-depth',
                                    name: lang === 'zh' ? '深度图道' : 'Depth Track',
                                    type: 'artifact',
                                    meta: { customIcon: 'fa-columns text-slate-400' }
                                }
                            ]
                        },
                        {
                            id: 'layer-lithology',
                            name: lang === 'zh' ? '岩性层' : 'Lithology Layer',
                            type: 'folder',
                            meta: { customIcon: 'fa-folder-open text-slate-400' },
                            children: [
                                {
                                    id: 'track-lithology',
                                    name: lang === 'zh' ? '岩性图道' : 'Lithology Track',
                                    type: 'artifact',
                                    meta: { customIcon: 'fa-columns text-slate-400' }
                                }
                            ]
                        },
                        {
                            id: 'layer-electric',
                            name: lang === 'zh' ? '电测层' : 'Electric Logging Layer',
                            type: 'folder',
                            meta: { customIcon: 'fa-folder-open text-slate-400' },
                            children: [
                                {
                                    id: 'track-gr',
                                    name: lang === 'zh' ? 'GR曲线图道' : 'GR Curve Track',
                                    type: 'artifact',
                                    meta: { customIcon: 'fa-columns text-slate-400' }
                                },
                                {
                                    id: 'track-rt',
                                    name: lang === 'zh' ? 'RT曲线图道' : 'RT Curve Track',
                                    type: 'artifact',
                                    meta: { customIcon: 'fa-columns text-slate-400' }
                                },
                                {
                                    id: 'track-ac',
                                    name: lang === 'zh' ? 'AC曲线图道' : 'AC Curve Track',
                                    type: 'artifact',
                                    meta: { customIcon: 'fa-columns text-slate-400' }
                                }
                            ]
                        },
                        {
                            id: 'layer-sediment',
                            name: lang === 'zh' ? '沉积相层' : 'Sedimentary Facies Layer',
                            type: 'folder',
                            meta: { customIcon: 'fa-folder-open text-slate-400' },
                            children: [
                                {
                                    id: 'track-micro',
                                    name: lang === 'zh' ? '微相图道' : 'Microfacies Track',
                                    type: 'artifact',
                                    meta: { customIcon: 'fa-columns text-slate-400' }
                                },
                                {
                                    id: 'track-assoc',
                                    name: lang === 'zh' ? '相组合图道' : 'Facies Association Track',
                                    type: 'artifact',
                                    meta: { customIcon: 'fa-columns text-slate-400' }
                                }
                            ]
                        },
                        {
                            id: 'layer-formation',
                            name: lang === 'zh' ? '地层层' : 'Stratigraphy Layer',
                            type: 'folder',
                            meta: { customIcon: 'fa-folder-open text-slate-400' },
                            children: [
                                {
                                    id: 'track-boundary',
                                    name: lang === 'zh' ? '地层界线图道' : 'Stratigraphic Boundary Track',
                                    type: 'artifact',
                                    meta: { customIcon: 'fa-columns text-slate-400' }
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
            treeData={proChartResources}
            selectedResources={selectedResources}
            onToggleResource={() => {}}
            onSelectNode={() => {}}
            onAddResource={() => {}}
            onDeleteResources={() => {}}
            onTogglePublic={() => {}}
            onOpenAddResourcePage={onOpenAddResourcePage || (() => {})}
            lang={lang}
            hideCheckboxes={true}
            isSmartReport={true}
        />
    );
};
