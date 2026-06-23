import React, { useState } from 'react';

interface WellDeclineRequirementTreeProps {
    lang: 'zh' | 'en';
}

const TreeNode: React.FC<{ name: string; children?: string[]; level: number }> = ({ name, children, level }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = children && children.length > 0;

    return (
        <div className="select-none">
            <div 
                className="group flex items-center py-1.5 px-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-all duration-200"
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={() => hasChildren && setExpanded(!expanded)}
            >
                <div className="w-4 flex-shrink-0 flex justify-center mr-1">
                    {hasChildren && (
                        <i className={`fas fa-chevron-right text-[10px] text-slate-400 transform transition-transform ${expanded ? 'rotate-90' : ''}`}></i>
                    )}
                </div>
                <i className={`fas ${level === 0 ? 'fa-folder-open text-indigo-500' : 'fa-chart-line text-blue-500'} mr-2 text-[11px] w-4 text-center flex-shrink-0`}></i>
                <span className="text-[11px] text-slate-700 font-medium truncate">{name}</span>
            </div>
            {hasChildren && expanded && (
                <div>
                     {children!.map((child, i) => (
                        <div key={i} className="flex items-center py-1 px-2" style={{ paddingLeft: `${(level + 1) * 16 + 24}px` }}>
                            <i className="fas fa-database text-[10px] text-slate-400 mr-2"></i>
                            <span className="text-[10px] text-slate-500 truncate">{child}</span>
                        </div>
                     ))}
                </div>
            )}
        </div>
    );
};

export const WellDeclineRequirementTree: React.FC<WellDeclineRequirementTreeProps> = ({ lang }) => {
    const data = [
        { name: lang === 'zh' ? '生产动态数据' : 'Production Dynamic Data', children: [lang === 'zh' ? '日产液量历史' : 'Daily Liquid Production History', lang === 'zh' ? '日产油量历史' : 'Daily Oil Production History', lang === 'zh' ? '含水率历史' : 'Water Cut History'] },
        { name: lang === 'zh' ? '井史与措施' : 'Well History & Measures', children: [lang === 'zh' ? '修井记录' : 'Workover Records', lang === 'zh' ? '酸化压裂历史' : 'Acidizing/Fracturing History'] },
        { name: lang === 'zh' ? '油藏数据' : 'Reservoir Data', children: [lang === 'zh' ? '地层压力变化' : 'Formation Pressure Changes', lang === 'zh' ? '流体性质' : 'Fluid Properties'] },
        { name: lang === 'zh' ? '设备参数' : 'Equipment Parameters', children: [lang === 'zh' ? '泵效监测' : 'Pump Efficiency Monitoring', lang === 'zh' ? '管柱状态' : 'Tubing Status'] }
    ];

    return (
        <div className="h-full flex flex-col bg-white border-r border-slate-200">
             <div className="p-3 border-b border-slate-100 bg-slate-50/30">
                <h3 className="text-[11px] font-bold text-slate-800">{lang === 'zh' ? '诊断所需资源' : 'Required Resources'}</h3>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
                {data.map((item, i) => (
                    <TreeNode key={i} name={item.name} children={item.children} level={0} />
                ))}
            </div>
        </div>
    );
};
