import React, { useState } from 'react';
import { translations } from '../i18n';
import { Language } from '../types';

interface IntelligentObjectDiscoveryProps {
  lang: Language;
  objectType: string;
  onClose?: () => void;
}

interface StrategyConfig {
  enabled: boolean;
  weight: number;
  params: any;
}

export const IntelligentObjectDiscovery: React.FC<IntelligentObjectDiscoveryProps> = ({ lang, objectType, onClose }) => {
  const t = translations[lang];

  const OBJECT_TYPES = [
    { id: 'oilfield', label: '油气田', icon: 'fa-layer-group', desc: '全局多级油气田资产推荐' },
    { id: 'block', label: '区块', icon: 'fa-vector-square', desc: '勘探开发区块关联推荐' },
    { id: 'well', label: '井', icon: 'fa-bore-hole', desc: '单井及井组关联发现策略' },
    { id: 'station', label: '站场', icon: 'fa-microchip', desc: '地面工程与站外管网推荐' },
  ];

  const currentType = OBJECT_TYPES.find(t => t.id === objectType) || OBJECT_TYPES[2];

  // State: Strategies
  const [hierarchical, setHierarchical] = useState<StrategyConfig>({
    enabled: true,
    weight: 20,
    params: {
      parent: true,
      child: true,
      sibling: true,
      depth: 2,
    }
  });

  const [spatial, setSpatial] = useState<StrategyConfig>({
    enabled: true,
    weight: 15,
    params: {
      mode: 'radius',
      radius: 5,
      nearestK: 10,
      depthRange: 100,
      crossBlock: true,
    }
  });

  const [geological, setGeological] = useState<StrategyConfig>({
    enabled: true,
    weight: 35,
    params: {
      formation: true,
      reservoir: true,
      sandbody: true,
      threshold: 80,
    }
  });

  const [engineering, setEngineering] = useState<StrategyConfig>({
    enabled: false,
    weight: 30,
    params: {
      processType: '体积压裂',
      timeRange: '近3年',
      threshold: 75
    }
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
      {/* Container (Removed backdrop, enabled interaction on modal only) */}
      <div className="relative w-full max-w-4xl h-[85vh] bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] ring-1 ring-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300 pointer-events-auto">
        
        {/* TOP HEADER */}
        <div className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <i className={`fas ${currentType.icon} text-base`}></i>
            </div>
            <h1 className="text-base font-bold text-slate-900">
              {lang === 'zh' ? `${currentType.label}推荐策略配置` : `${currentType.label} Strategy Config`}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="px-4 py-1.5 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all uppercase tracking-wider">
              {lang === 'zh' ? '重置' : 'Reset'}
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <i className="fas fa-check text-[10px]"></i>
              {lang === 'zh' ? '应用' : 'Apply'}
            </button>
            {onClose && (
               <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all ml-1"
               >
                 <i className="fas fa-times text-base"></i>
               </button>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-8 bg-[#FBFDFF]">
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-6">
            
            {/* Strategy: Hierarchical */}
            <div className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all hover:border-blue-100 ${!hierarchical.enabled && 'opacity-60 grayscale'}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                    <i className="fas fa-sitemap text-lg"></i>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">{lang === 'zh' ? '层级关系' : 'Hierarchical'}</h3>
                </div>
                <button 
                  onClick={() => setHierarchical(h => ({ ...h, enabled: !h.enabled }))}
                  className={`w-10 h-5 rounded-full relative transition-colors ${hierarchical.enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${hierarchical.enabled ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-2">
                  {['父级推荐', '同级推荐', '子级推荐'].map((label, idx) => {
                    const key = idx === 0 ? 'parent' : idx === 1 ? 'sibling' : 'child';
                    return (
                      <div 
                        key={label}
                        onClick={() => setHierarchical(h => ({ ...h, params: { ...h.params, [key]: !h.params[key] } }))}
                        className={`py-2 rounded-lg border text-center cursor-pointer transition-all ${hierarchical.params[key] ? 'border-blue-500 bg-blue-50/50 text-blue-600 font-bold' : 'border-slate-100 bg-slate-50 text-slate-500 text-[10px]'}`}
                      >
                        <span className="text-[10px]">{label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                   <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '搜深度' : 'Depth'}</span>
                      <span className="text-xs font-black text-blue-600">{hierarchical.params.depth} Levels</span>
                   </div>
                   <input 
                     type="range" min="1" max="5" value={hierarchical.params.depth} 
                     onChange={(e) => setHierarchical(h => ({ ...h, params: { ...h.params, depth: parseInt(e.target.value) } }))}
                     className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                   />
                </div>
              </div>
            </div>

            {/* Strategy: Spatial */}
            <div className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all hover:border-amber-100 ${!spatial.enabled && 'opacity-60 grayscale'}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
                    <i className="fas fa-compass text-lg"></i>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">{lang === 'zh' ? '空间邻近' : 'Spatial'}</h3>
                </div>
                <button 
                  onClick={() => setSpatial(s => ({ ...s, enabled: !s.enabled }))}
                  className={`w-10 h-5 rounded-full relative transition-colors ${spatial.enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${spatial.enabled ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="space-y-5">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setSpatial(s => ({ ...s, params: { ...s.params, mode: 'radius' } }))}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${spatial.params.mode === 'radius' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    半径
                  </button>
                  <button 
                    onClick={() => setSpatial(s => ({ ...s, params: { ...s.params, mode: 'nearest' } }))}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${spatial.params.mode === 'nearest' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    最近邻
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {spatial.params.mode === 'radius' ? (
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1.5">{lang === 'zh' ? '最大距离' : 'Distance'}</span>
                      <div className="flex items-center border border-slate-100 rounded-lg bg-slate-50 px-2 py-1.5">
                        <input 
                          type="number" 
                          value={spatial.params.radius} 
                          onChange={(e) => setSpatial(s => ({ ...s, params: { ...s.params, radius: parseInt(e.target.value) || 0 } }))}
                          className="w-full bg-transparent text-xs font-bold outline-none" 
                        />
                        <span className="text-[9px] font-black text-slate-400">KM</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1.5">{lang === 'zh' ? '推荐数量' : 'K-Value'}</span>
                      <div className="flex items-center border border-slate-100 rounded-lg bg-slate-50 px-2 py-1.5">
                        <input 
                          type="number" 
                          value={spatial.params.nearestK} 
                          onChange={(e) => setSpatial(s => ({ ...s, params: { ...s.params, nearestK: parseInt(e.target.value) || 0 } }))}
                          className="w-full bg-transparent text-xs font-bold outline-none" 
                        />
                        <span className="text-[9px] font-black text-slate-400">PCS</span>
                      </div>
                    </div>
                  )}
                  <div>
                     <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1.5">{lang === 'zh' ? '深度误差' : 'Depth'}</span>
                     <div className="flex items-center border border-slate-100 rounded-lg bg-slate-50 px-2 py-1.5">
                      <input 
                        type="number" 
                        value={spatial.params.depthRange} 
                        onChange={(e) => setSpatial(s => ({ ...s, params: { ...s.params, depthRange: parseInt(e.target.value) || 0 } }))}
                        className="w-full bg-transparent text-xs font-bold outline-none" 
                      />
                      <span className="text-[9px] font-black text-slate-400">M</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategy: Geological */}
            <div className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all hover:border-emerald-100 ${!geological.enabled && 'opacity-60 grayscale'}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                    <i className="fas fa-mountain text-lg"></i>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">{lang === 'zh' ? '地质特征' : 'Geological'}</h3>
                </div>
                <button 
                  onClick={() => setGeological(g => ({ ...g, enabled: !g.enabled }))}
                  className={`w-10 h-5 rounded-full relative transition-colors ${geological.enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${geological.enabled ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {['层位对齐', '储层相似', '砂体关联'].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-100 rounded-md text-[10px] font-medium hover:border-emerald-200 hover:text-emerald-600 transition-all cursor-pointer">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-2">
                   <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '相似度' : 'Similarity'}</span>
                      <span className="text-xs font-black text-blue-600">{geological.params.threshold}%</span>
                   </div>
                   <input 
                     type="range" min="50" max="100" value={geological.params.threshold} 
                     onChange={(e) => setGeological(g => ({ ...g, params: { ...g.params, threshold: parseInt(e.target.value) } }))}
                     className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                   />
                </div>
              </div>
            </div>

            {/* Strategy: Engineering */}
            <div className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all hover:border-rose-100 ${!engineering.enabled && 'opacity-60 grayscale'}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100">
                    <i className="fas fa-tools text-lg"></i>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">{lang === 'zh' ? '工程实施' : 'Engineering'}</h3>
                </div>
                <button 
                  onClick={() => setEngineering(e => ({ ...e, enabled: !e.enabled }))}
                  className={`w-10 h-5 rounded-full relative transition-colors ${engineering.enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${engineering.enabled ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                     <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1.5">{lang === 'zh' ? '工艺' : 'Process'}</span>
                     <select 
                       value={engineering.params.processType}
                       onChange={(e) => setEngineering(eng => ({ ...eng, params: { ...eng.params, processType: e.target.value } }))}
                       className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-600 outline-none"
                     >
                       <option value="体积压裂">体积压裂</option>
                       <option value="注水工艺">注水工艺</option>
                       <option value="修井作业">修井作业</option>
                     </select>
                  </div>
                  <div>
                     <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1.5">{lang === 'zh' ? '时间' : 'Time'}</span>
                     <select 
                       value={engineering.params.timeRange}
                       onChange={(e) => setEngineering(eng => ({ ...eng, params: { ...eng.params, timeRange: e.target.value } }))}
                       className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-600 outline-none"
                     >
                       <option value="近3年">近3年</option>
                       <option value="全部">全部</option>
                     </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                   {['排量', '砂量', '总液量'].map(p => (
                     <span key={p} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-100 rounded-md text-[9px] font-bold text-slate-600 shadow-sm">
                       <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                       {p}
                     </span>
                   ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
);
};
