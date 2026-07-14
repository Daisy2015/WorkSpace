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
            name: lang === 'zh' ? '圈闭与地震解释' : 'Trap & Seismic Interpretation', 
            children: [
                lang === 'zh' ? '顶底构造图 (dwg格式)' : 'Top-Bottom Structure Map (dwg)', 
                lang === 'zh' ? '三维地震数据体 (segy)' : '3D Seismic Data Volume (segy)', 
                lang === 'zh' ? '构造断裂体系解释 (报告)' : 'Fault System Interpretation (Report)'
            ] 
        },
        { 
            name: lang === 'zh' ? '储层物性参数' : 'Reservoir Properties', 
            children: [
                lang === 'zh' ? '孔隙度与渗透率测试 (数据)' : 'Porosity & Permeability Logs (Data)', 
                lang === 'zh' ? '含油气饱和度分析 (图表)' : 'Oil/Gas Saturation Analysis (Chart)',
                lang === 'zh' ? '压汞分析及微观孔喉 (报告)' : 'Mercury Injection & Pore Throat (Report)'
            ] 
        },
        { 
            name: lang === 'zh' ? '储量估算与地质风险' : 'Reserves & Geological Risk', 
            children: [
                lang === 'zh' ? '地质成功率(Pg)概率评估 (模型)' : 'Geological Success Rate (Pg) Evaluation', 
                lang === 'zh' ? '采收率预测模型 (数据)' : 'Recovery Factor Predictive Model'
            ] 
        },
        { 
            name: lang === 'zh' ? '开发部署与经济指标' : 'Development & Economics', 
            children: [
                lang === 'zh' ? '单井设计与投资概算 (表)' : 'Well Design & Investment Estimate (Sheet)', 
                lang === 'zh' ? '油价敏感性财务评价 (模型)' : 'Oil Price Sensitivity Evaluation Model'
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
                        placeholder={lang === 'zh' ? "搜索评价资源..." : "Search evaluation resources..."}
                        className="w-full pl-8 pr-3 py-2 text-[13px] bg-white border border-slate-200 rounded shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-600 placeholder-slate-400"
                    />
                </div>
                <div className="flex gap-2 h-[34px]">
                    <button 
                        onClick={onOpenAddResourcePage}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 rounded text-[13px] font-medium transition-colors shadow-sm"
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
