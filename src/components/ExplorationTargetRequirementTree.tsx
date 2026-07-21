import React, { useState } from 'react';

interface ExplorationTargetRequirementTreeProps {
    lang: 'zh' | 'en';
    onOpenAddResourcePage?: () => void;
}

const TreeNode: React.FC<{ name: string; children?: string[]; level: number; defaultExpanded?: boolean }> = ({ name, children, level, defaultExpanded = true }) => {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const hasChildren = children && children.length > 0;

    const getLeafIcon = (idx: number) => {
        return idx % 2 === 0 ? "fas fa-file-alt text-blue-500" : "fas fa-align-left text-emerald-500";
    };

    return (
        <div className="select-none text-[13px]">
            <div 
                className="group flex items-center py-2 hover:bg-slate-50 cursor-pointer pr-4 transition-colors text-slate-700"
                style={{ paddingLeft: `${level * 24 + 16}px` }}
                onClick={() => hasChildren && setExpanded(!expanded)}
            >
                <div className="w-5 flex-shrink-0 flex justify-center text-slate-400">
                    {hasChildren && (
                        <i className={`fas fa-chevron-right text-[10px] transform transition-transform ${expanded ? 'rotate-90' : ''}`}></i>
                    )}
                </div>
                <div className="mr-2.5" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="w-[14px] h-[14px] rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" defaultChecked={true} />
                </div>
                <i className={`fas fa-map-marker-alt text-blue-500 mr-2 text-[12px] flex-shrink-0`}></i>
                <span className="truncate">{name} {hasChildren ? `(${children.length})` : ''}</span>
            </div>
            {hasChildren && expanded && (
                <div>
                     {children!.map((child, i) => (
                        <div key={i} className="group flex items-center py-2 hover:bg-slate-50 cursor-pointer pr-4 transition-colors text-slate-700" style={{ paddingLeft: `${(level + 1) * 24 + 16}px` }}>
                            <div className="w-5 flex-shrink-0 flex justify-center"></div>
                            <div className="mr-2.5" onClick={(e) => e.stopPropagation()}>
                                <input type="checkbox" className="w-[14px] h-[14px] rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" defaultChecked={true} />
                            </div>
                            <i className={`${getLeafIcon(i)} mr-2 text-[13px] flex-shrink-0`}></i>
                            <span className="truncate flex-1">{child}</span>
                            <div className="w-6 h-6 rounded flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 group-hover:bg-red-50 transition-all flex-shrink-0 ml-2 cursor-pointer">
                                <i className="fas fa-trash-alt text-[12px]"></i>
                            </div>
                        </div>
                     ))}
                </div>
            )}
        </div>
    );
};

export const ExplorationTargetRequirementTree: React.FC<ExplorationTargetRequirementTreeProps> = ({ lang, onOpenAddResourcePage }) => {
    const data = [
        { 
            name: lang === 'zh' ? '① 目标建立 (Target Definition)' : '1. Target Definition', 
            children: [
                lang === 'zh' ? '评价对象与目的 (圈闭及钻探价值)' : 'Target Object & Goal (Trap/Drilling Value)', 
                lang === 'zh' ? '评价范围与边界 (层系、区域与断裂面)' : 'Scope & Boundary (Stratum/Region/Fault)', 
                lang === 'zh' ? '任务定义与评价标准规范 (SY/T 5732)' : 'Task Definition & Evaluation Specs'
            ] 
        },
        { 
            name: lang === 'zh' ? '② 资料准备 (Resource Preparation)' : '2. Resource Preparation', 
            children: [
                lang === 'zh' ? '地震解释成果与断裂体系 (SEGY/DWG)' : 'Seismic Inversion & Fault System (SEGY/DWG)', 
                lang === 'zh' ? '邻区实钻与测井解释成果 (LAS)' : 'Offset Well Logs & Interpretation (LAS)',
                lang === 'zh' ? '区域地质背景、盖层性质与专家先验规则' : 'Geology Context, Seals & Expert Prior Rules'
            ] 
        },
        { 
            name: lang === 'zh' ? '③ 业务评价 (Evaluate Business)' : '3. Evaluate Business', 
            children: [
                lang === 'zh' ? '烃源条件评价 (晚期成熟度与供烃充沛度)' : 'Source Rock Assessment (Maturity & Supply)', 
                lang === 'zh' ? '储层物性评价 (孔隙度与致密孔喉网)' : 'Reservoir Properties (Porosity & Pore Throat)',
                lang === 'zh' ? '圈闭闭合与断层密封保存性评价' : 'Trap Closure & Fault Sealing Preservation'
            ] 
        },
        { 
            name: lang === 'zh' ? '④ 风险分析 (Analyze Risk)' : '4. Analyze Risk', 
            children: [
                lang === 'zh' ? '地质成功率 Pg 概率及流体逸散风险' : 'Geological Pg & Fluid Leakage Risk', 
                lang === 'zh' ? '钻井工程高温高压摩擦阻抗技术瓶颈' : 'Drilling Engineering HPHT Friction Bottlenecks',
                lang === 'zh' ? '硫化氢 H2S 酸性腐蚀与 HSE 安全合规审定' : 'H2S Corrosion & HSE Safety Compliance'
            ] 
        },
        { 
            name: lang === 'zh' ? '⑤ 综合判断 (Make Judgement)' : '5. Make Judgement', 
            children: [
                lang === 'zh' ? '多维度全因子权重决策星级推荐' : 'Integrated Multi-factor Stars Recommendation', 
                lang === 'zh' ? '主要核心优势与关键限制缺陷清单' : 'Main Advantages & Key Cons Constraints',
                lang === 'zh' ? '第一口评价井设计坐标与勘探部署方案' : '1st Well Design Coordinates & Deploy Plan'
            ] 
        },
        { 
            name: lang === 'zh' ? '⑥ 结果优化 (Optimize Result)' : '6. Optimize Result', 
            children: [
                lang === 'zh' ? '新资料加载自动感知与重新触发机制' : 'Auto-sensing & Re-evaluation Trigger', 
                lang === 'zh' ? '历史评价版本差异对比 (V1/V2/V3 迭代)' : 'Version Comparison (V1/V2/V3 Iterations)',
                lang === 'zh' ? '成果归档与多维度国家标准汇签报告导出' : 'Archiving & Standardized Report Export'
            ] 
        }
    ];

    return (
        <div className="h-full flex flex-col bg-white border-r border-slate-200">
             <div className="p-3 border-b border-slate-100 flex flex-col gap-3">
                <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-[11px]"></i>
                    <input 
                        type="text" 
                        placeholder={lang === 'zh' ? "搜索业务评价流程..." : "Search evaluation pipeline..."}
                        className="w-full pl-8 pr-3 py-2 text-[13px] bg-white border border-slate-200 rounded shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-600 placeholder-slate-400"
                    />
                </div>
                <div className="flex gap-2 h-[34px]">
                    <button 
                        onClick={onOpenAddResourcePage}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 rounded text-[13px] font-medium transition-colors shadow-sm"
                    >
                        <i className="fas fa-plus text-[11px]"></i>
                        {lang === 'zh' ? '添加资源' : 'Add resource'}
                    </button>
                    <button className="w-10 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-500 hover:bg-slate-50 transition-colors shadow-sm focus:outline-none">
                        <i className="fas fa-angle-double-down text-[12px]"></i>
                    </button>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar py-2 border-t border-transparent shadow-[inset_0_2px_4px_-2px_rgba(0,0,0,0.05)]">
                {data.map((item, i) => (
                    <TreeNode key={i} name={item.name} children={item.children} level={0} />
                ))}
            </div>
        </div>
    );
};
