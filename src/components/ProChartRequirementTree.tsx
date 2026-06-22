import React, { useState } from 'react';

interface ProChartRequirementTreeProps {
    lang: 'zh' | 'en';
}

const ProChartNode: React.FC<{ name: string; children?: string[]; level: number }> = ({ name, children, level }) => {
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
                <i className={`fas ${level === 0 ? 'fa-map-marker-alt text-indigo-500' : 'fa-layer-group text-blue-500'} mr-2 text-[11px] w-4 text-center flex-shrink-0`}></i>
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

export const ProChartRequirementTree: React.FC<ProChartRequirementTreeProps> = ({ lang }) => {
    const data = [
        { name: '深度道', children: ['深度刻度层 (Layer)', '井基础信息 (Well_Info)'] },
        { name: '地层道', children: ['地层界线层 (Layer) - 地层分层数据 (Formation_Interval)', '地层标签层 (Layer) - 地层分层数据 (Formation_Interval)'] },
        { name: '岩性道', children: ['岩性填充层 (Layer) - 岩性解释数据 (Lithology_Interpretation)', '岩性边界层 (Layer) - 岩性解释数据 (Lithology_Interpretation)', '岩性标签层 (Layer) - 岩性解释数据 (Lithology_Interpretation)'] },
        { name: '测井曲线道', children: ['GR曲线层 (Layer) - 测井曲线数据 (Log_Curve_Data)', '电阻率曲线层 (Layer) - 测井曲线数据 (Log_Curve_Data)', '曲线名称层 (Layer) - 测井曲线配置数据 (Log_Curve_Info)'] },
        { name: '层序地层道', children: ['层序界线层 (Layer) - 层序解释数据 (Sequence_Stratigraphy)', '体系域填充层 (Layer) - 层序解释数据 (Sequence_Stratigraphy)', '层序标签层 (Layer) - 层序解释数据 (Sequence_Stratigraphy)'] },
        { name: '沉积微相道', children: ['微相填充层 (Layer) - 沉积微相数据 (Sedimentary_Microfacies)', '微相边界层 (Layer) - 沉积微相数据 (Sedimentary_Microfacies)', '微相标签层 (Layer) - 沉积微相数据 (Sedimentary_Microfacies)'] },
    ];

    return (
        <div className="h-full flex flex-col bg-white border-r border-slate-200">
             <div className="p-3 border-b border-slate-100 bg-slate-50/30">
                <h3 className="text-[11px] font-bold text-slate-800">成图所需资源</h3>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
                {data.map((item, i) => (
                    <ProChartNode key={i} name={item.name} children={item.children} level={0} />
                ))}
            </div>
        </div>
    );
};
