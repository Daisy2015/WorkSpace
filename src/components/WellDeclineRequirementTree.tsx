import React, { useState } from 'react';

interface WellDeclineRequirementTreeProps {
    lang: 'zh' | 'en';
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
                    <input type="checkbox" className="w-[14px] h-[14px] rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                </div>
                <i className={`fas fa-map-marker-alt text-indigo-500 mr-2 text-[12px] flex-shrink-0`}></i>
                <span className="truncate">{name} {hasChildren ? `(${children.length})` : ''}</span>
            </div>
            {hasChildren && expanded && (
                <div>
                     {children!.map((child, i) => (
                        <div key={i} className="group flex items-center py-2 hover:bg-slate-50 cursor-pointer pr-4 transition-colors text-slate-700" style={{ paddingLeft: `${(level + 1) * 24 + 16}px` }}>
                            <div className="w-5 flex-shrink-0 flex justify-center"></div>
                            <div className="mr-2.5" onClick={(e) => e.stopPropagation()}>
                                <input type="checkbox" className="w-[14px] h-[14px] rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
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

export const WellDeclineRequirementTree: React.FC<WellDeclineRequirementTreeProps> = ({ lang }) => {
    const data = [
        { name: lang === 'zh' ? '生产动态数据' : 'Production Dynamic Data', children: [lang === 'zh' ? '日产液量历史 (数据)' : 'Daily Liquid Production History (Data)', lang === 'zh' ? '日产油量历史 (数据)' : 'Daily Oil Production History (Data)', lang === 'zh' ? '含水率历史 (数据)' : 'Water Cut History (Data)'] },
        { name: lang === 'zh' ? '井史与措施' : 'Well History & Measures', children: [lang === 'zh' ? '修井记录 (文档)' : 'Workover Records (Document)', lang === 'zh' ? '酸化压裂历史 (数据)' : 'Acidizing/Fracturing History (Data)'] },
        { name: lang === 'zh' ? '油藏数据' : 'Reservoir Data', children: [lang === 'zh' ? '地层压力变化 (图像)' : 'Formation Pressure Changes (Image)', lang === 'zh' ? '流体性质 (报告)' : 'Fluid Properties (Report)'] },
        { name: lang === 'zh' ? '设备参数' : 'Equipment Parameters', children: [lang === 'zh' ? '泵效监测 (数据)' : 'Pump Efficiency Monitoring (Data)', lang === 'zh' ? '管柱状态 (文档)' : 'Tubing Status (Document)'] }
    ];

    return (
        <div className="h-full flex flex-col bg-white border-r border-slate-200">
             <div className="p-3 border-b border-slate-100 flex flex-col gap-3">
                <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-[11px]"></i>
                    <input 
                        type="text" 
                        placeholder={lang === 'zh' ? "搜索资源..." : "Search resources..."}
                        className="w-full pl-8 pr-3 py-2 text-[13px] bg-white border border-slate-200 rounded shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-600 placeholder-slate-400"
                    />
                </div>
                <div className="flex gap-2 h-[34px]">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 rounded text-[13px] font-medium transition-colors shadow-sm">
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
