import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { translations } from '../i18n';

interface IntelligentObjectDiscoveryProps {
  lang: Language;
}

interface StrategyConfig {
  enabled: boolean;
  weight: number;
  params: any;
}

interface RecommendationResult {
  id: string;
  name: string;
  type: string;
  score: number;
  reasons: string[];
  strategies: string[];
  details: {
    basicInfo: any;
    scoreBreakdown: Record<string, number>;
    path: string[];
  };
}

export const IntelligentObjectDiscovery: React.FC<IntelligentObjectDiscoveryProps> = ({ lang }) => {
  const t = translations[lang];

  // State: Current Object
  const [currentObject, setCurrentObject] = useState({
    id: 'well-x1',
    name: 'X-1井',
    type: '井',
    location: '长庆油田 / A区块 / A1平台'
  });

  // State: Strategies
  const [hierarchical, setHierarchical] = useState<StrategyConfig>({
    enabled: true,
    weight: 20,
    params: {
      parent: true,
      child: true,
      sibling: true,
      parentLevels: ['平台', '区块', '油田'],
      childLevels: ['压裂段', '设备', '施工任务'],
      siblingLevels: ['同平台', '同区块', '同井组'],
      depth: 2,
      maxCount: 50
    }
  });

  const [spatial, setSpatial] = useState<StrategyConfig>({
    enabled: true,
    weight: 15,
    params: {
      mode: 'radius', // 'radius' | 'nearest'
      radius: 5,
      depthRange: 100,
      crossBlock: true,
      maxCount: 20,
      nearestK: 10,
      maxDist: 10
    }
  });

  const [geological, setGeological] = useState<StrategyConfig>({
    enabled: true,
    weight: 35,
    params: {
      formation: true,
      reservoir: true,
      sandbody: true,
      structuralBelt: true,
      structuralTypes: ['背斜', '断块', '鼻状构造'],
      allowCrossFault: false,
      faciesTypes: ['河道砂', '三角洲前缘', '深水浊积'],
      distributionDir: 'NE-SW',
      params: ['孔隙度', '渗透率', '含油气性', '脆性指数', '埋深'],
      threshold: 80,
      paramWeights: { poro: 30, perm: 25, depth: 20, hc: 15, brittle: 10 },
      algorithm: 'Cosine Similarity',
      useEmbedding: true
    }
  });

  const [engineering, setEngineering] = useState<StrategyConfig>({
    enabled: false,
    weight: 30,
    params: {
      processType: '体积压裂',
      timeRange: '近3年',
      params: ['排量', '砂量', '液量', '水平段长度', '分段数量', '套管规格'],
      threshold: 75
    }
  });

  // State: Results & Selection
  const [results, setResults] = useState<RecommendationResult[]>([
    {
      id: 'well-x2',
      name: 'X-2井',
      type: '井',
      score: 92,
      reasons: ['同层位', '邻井'],
      strategies: ['地质', '空间'],
      details: {
        basicInfo: { name: 'X-2井', type: '井', platform: 'A1平台', block: 'A区块', layer: '长7' },
        scoreBreakdown: { hierarchical: 20, spatial: 18, geological: 35, engineering: 19 },
        path: ['长庆油田', 'A区块', 'A1平台', 'X-2井']
      }
    },
    {
      id: 'well-x8',
      name: 'X-8井',
      type: '井',
      score: 88,
      reasons: ['压裂参数相似'],
      strategies: ['工程'],
      details: {
        basicInfo: { name: 'X-8井', type: '井', platform: 'A1平台', block: 'A区块', layer: '长7' },
        scoreBreakdown: { hierarchical: 15, spatial: 15, geological: 25, engineering: 33 },
        path: ['长庆油田', 'A区块', 'A1平台', 'X-8井']
      }
    },
    {
      id: 'plat-a1',
      name: 'A1平台',
      type: '平台',
      score: 80,
      reasons: ['父级平台'],
      strategies: ['层级'],
      details: {
        basicInfo: { name: 'A1平台', type: '平台', platform: '-', block: 'A区块', layer: '-' },
        scoreBreakdown: { hierarchical: 50, spatial: 10, geological: 10, engineering: 10 },
        path: ['长庆油田', 'A区块', 'A1平台']
      }
    },
    {
      id: 'seg-3',
      name: '压裂段3',
      type: '工艺段',
      score: 75,
      reasons: ['子级对象'],
      strategies: ['层级'],
      details: {
        basicInfo: { name: '压裂段3', type: '工艺段', platform: 'A1平台', block: 'A区块', layer: '长7' },
        scoreBreakdown: { hierarchical: 60, spatial: 5, geological: 5, engineering: 5 },
        path: ['长庆油田', 'A区块', 'A1平台', 'X-1井', '压裂段3']
      }
    }
  ]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['well-x1']));
  const [activeResultId, setActiveResultId] = useState<string | null>('well-x2');

  const activeResult = results.find(r => r.id === activeResultId);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectedObjects = results.filter(r => selectedIds.has(r.id));
  // Include current object in selected objects list if not there
  const allSelected = useMemo(() => {
    const list = [...selectedObjects];
    if (selectedIds.has(currentObject.id) && !list.find(o => o.id === currentObject.id)) {
        list.unshift({
            id: currentObject.id,
            name: currentObject.name,
            type: currentObject.type,
            score: 100,
            reasons: ['当前对象'],
            strategies: [],
            details: {
                basicInfo: { name: currentObject.name, type: currentObject.type, platform: 'A1平台', block: 'A区块', layer: '长7' },
                scoreBreakdown: {},
                path: ['长庆油田', 'A区块', 'A1平台', 'X-1井']
            }
        });
    }
    return list;
  }, [selectedObjects, currentObject, selectedIds]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 font-sans">
      
      {/* TOP HEADER */}
      <div className="h-24 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
            <i className="fas fa-radar text-xl"></i>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">对象推荐发现</h1>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase">Discovery Engine</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">当前对象:</span>
                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{currentObject.name}</span>
                <span className="px-1.5 py-0.5 border border-slate-200 rounded text-[9px] font-medium">{currentObject.type}</span>
              </div>
              <div className="w-px h-3 bg-slate-200"></div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">所属:</span>
                <span className="text-slate-600">{currentObject.location}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2">
            <i className="fas fa-bolt text-[10px]"></i>
            执行推荐计算
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: STRATEGY CONFIG (340px) */}
        <div className="w-[340px] border-r border-slate-200 bg-white flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">推荐策略配置</span>
            <i className="fas fa-sliders-h text-slate-400 hover:text-indigo-600 cursor-pointer"></i>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Strategy Card: Hierarchical */}
            <div className={`rounded-2xl border-2 transition-all p-4 ${hierarchical.enabled ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-100 bg-slate-50/50 grayscale opacity-60'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${hierarchical.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <i className="fas fa-sitemap text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 italic tracking-tight uppercase">层级关系</h3>
                    <p className="text-[10px] text-slate-400 font-medium leading-none">基于父子对象结构扩展</p>
                  </div>
                </div>
                <button 
                  onClick={() => setHierarchical(h => ({ ...h, enabled: !h.enabled }))}
                  className={`w-10 h-5 rounded-full relative transition-colors ${hierarchical.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${hierarchical.enabled ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>

              {hierarchical.enabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-3 gap-2">
                    {['父级', '子级', '同级'].map(label => (
                      <label key={label} className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-3 h-3 rounded-sm border flex items-center justify-center transition-all ${hierarchical.params[label === '父级' ? 'parent' : label === '子级' ? 'child' : 'sibling'] ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                          <i className="fas fa-check text-[6px] text-white"></i>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">{label}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">层级深度</span>
                        <span className="text-xs font-black text-indigo-600">{hierarchical.params.depth} 层</span>
                     </div>
                     <input 
                       type="range" min="1" max="5" value={hierarchical.params.depth} 
                       onChange={(e) => setHierarchical(h => ({ ...h, params: { ...h.params, depth: parseInt(e.target.value) } }))}
                       className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                     />
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">策略权重</span>
                     <div className="flex items-center gap-2 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        <span className="text-xs font-black text-indigo-600">{hierarchical.weight}%</span>
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Strategy Card: Spatial */}
            <div className={`rounded-2xl border-2 transition-all p-4 ${spatial.enabled ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-100 bg-slate-50/50 grayscale opacity-60'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${spatial.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <i className="fas fa-compass text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 italic tracking-tight uppercase">空间关系</h3>
                    <p className="text-[10px] text-slate-400 font-medium leading-none">基于物理邻近扩展</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSpatial(s => ({ ...s, enabled: !s.enabled }))}
                  className={`w-10 h-5 rounded-full relative transition-colors ${spatial.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${spatial.enabled ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>

              {spatial.enabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setSpatial(s => ({ ...s, params: { ...s.params, mode: 'radius' } }))}
                      className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all ${spatial.params.mode === 'radius' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      半径范围
                    </button>
                    <button 
                      onClick={() => setSpatial(s => ({ ...s, params: { ...s.params, mode: 'nearest' } }))}
                      className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all ${spatial.params.mode === 'nearest' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      最近邻
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">搜索半径</span>
                      <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-2 py-1.5 bg-slate-50/50">
                        <input 
                           type="number" value={spatial.params.radius} 
                           onChange={(e) => setSpatial(s => ({ ...s, params: { ...s.params, radius: parseInt(e.target.value) } }))}
                           className="w-full text-xs font-bold outline-none bg-transparent" 
                        />
                        <span className="text-[10px] text-slate-400 font-bold">km</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">深度范围</span>
                      <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-2 py-1.5 bg-slate-50/50">
                        <input 
                           type="number" value={spatial.params.depthRange} 
                           onChange={(e) => setSpatial(s => ({ ...s, params: { ...s.params, depthRange: parseInt(e.target.value) } }))}
                           className="w-full text-xs font-bold outline-none bg-transparent" 
                        />
                        <span className="text-[10px] text-slate-400 font-bold">m</span>
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-3 h-3 rounded-sm border flex items-center justify-center transition-all ${spatial.params.crossBlock ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                      <i className="fas fa-check text-[6px] text-white"></i>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">允许跨区块搜索</span>
                  </label>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">策略权重</span>
                     <div className="flex items-center gap-2 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        <span className="text-xs font-black text-indigo-600">{spatial.weight}%</span>
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Strategy Card: Geological */}
            <div className={`rounded-2xl border-2 transition-all p-4 ${geological.enabled ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-100 bg-slate-50/50 grayscale opacity-60'}`}>
               <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${geological.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <i className="fas fa-mountain text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 italic tracking-tight uppercase">地质相似</h3>
                    <p className="text-[10px] text-slate-400 font-medium leading-none">基于地下地质关联扩展</p>
                  </div>
                </div>
                <button 
                  onClick={() => setGeological(g => ({ ...g, enabled: !g.enabled }))}
                  className={`w-10 h-5 rounded-full relative transition-colors ${geological.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${geological.enabled ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>

              {geological.enabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase block tracking-widest">约束条件</span>
                    <div className="flex flex-wrap gap-2">
                      {['同层位', '同储层', '同砂体', '同构造带'].map(tag => (
                        <span key={tag} className="px-2 py-1 bg-white text-slate-600 text-[9px] font-black rounded-lg border border-slate-200 transition-all hover:border-indigo-400 hover:text-indigo-600 cursor-pointer">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">相似度阈值</span>
                        <span className="text-xs font-black text-indigo-600">{geological.params.threshold}%</span>
                     </div>
                     <input 
                       type="range" min="50" max="100" value={geological.params.threshold} 
                       onChange={(e) => setGeological(g => ({ ...g, params: { ...g.params, threshold: parseInt(e.target.value) } }))}
                       className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                     />
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">策略权重</span>
                     <div className="flex items-center gap-2 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        <span className="text-xs font-black text-indigo-600">{geological.weight}%</span>
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Strategy Card: Engineering */}
            <div className={`rounded-2xl border-2 transition-all p-4 ${engineering.enabled ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-100 bg-slate-50/50 grayscale opacity-60'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${engineering.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <i className="fas fa-tools text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 italic tracking-tight uppercase">工程相似</h3>
                    <p className="text-[10px] text-slate-400 font-medium leading-none">基于工程实施相似扩展</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEngineering(e => ({ ...e, enabled: !e.enabled }))}
                  className={`w-10 h-5 rounded-full relative transition-colors ${engineering.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${engineering.enabled ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>

              {engineering.enabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">工艺类型</span>
                      <select className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 outline-none focus:border-indigo-400">
                        <option>体积压裂</option>
                        <option>直井压裂</option>
                        <option>酸化作业</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">时间范围</span>
                      <select className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 outline-none focus:border-indigo-400">
                        <option>近1年</option>
                        <option>近3年</option>
                        <option>全部历史</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">策略权重</span>
                     <div className="flex items-center gap-2 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        <span className="text-xs font-black text-indigo-600">{engineering.weight}%</span>
                     </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* MIDDLE: RECOMMENDATION RESULTS */}
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
          
          {/* TOOLBAR */}
          <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4 flex-1 max-w-md">
                <div className="relative flex-1">
                  <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs text-center"></i>
                  <input 
                    type="text" placeholder="搜索推荐对象..." 
                    className="w-full h-8 pl-9 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:border-indigo-300 transition-all font-medium"
                  />
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-slate-400 uppercase">排序</span>
                   <select className="text-xs font-bold bg-transparent outline-none cursor-pointer text-indigo-600">
                      <option>推荐得分</option>
                      <option>距离远近</option>
                      <option>地质相似度</option>
                   </select>
                </div>
                <div className="w-px h-3 bg-slate-200"></div>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-slate-400 uppercase">筛选</span>
                   <select className="text-xs font-bold bg-transparent outline-none cursor-pointer text-indigo-600">
                      <option>全部类型</option>
                      <option>井</option>
                      <option>平台</option>
                   </select>
                </div>
             </div>
          </div>

          {/* RESULTS TABLE */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                       <th className="py-4 pl-6 pr-4 w-12">
                          <div className="w-4 h-4 rounded border border-slate-300 flex items-center justify-center cursor-pointer">
                             <div className="w-2.5 h-2.5 bg-indigo-600 rounded-[2px] opacity-10"></div>
                          </div>
                       </th>
                       <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">推荐对象</th>
                       <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">类型</th>
                       <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center focus:text-indigo-600">推荐分</th>
                       <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">推荐原因</th>
                       <th className="py-4 px-4 pr-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">来源策略</th>
                    </tr>
                 </thead>
                 <tbody>
                    {results.map((item) => (
                      <tr 
                        key={item.id} 
                        onClick={() => setActiveResultId(item.id)}
                        className={`group border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors cursor-pointer ${activeResultId === item.id ? 'bg-indigo-50/40 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-indigo-600' : ''}`}
                      >
                         <td className="py-4 pl-6 pr-4" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => toggleSelection(item.id)}
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedIds.has(item.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}
                            >
                               {selectedIds.has(item.id) && <i className="fas fa-check text-[8px] text-white"></i>}
                            </button>
                         </td>
                         <td className="py-4 px-4">
                            <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{item.name}</span>
                         </td>
                         <td className="py-4 px-4 text-center">
                            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-black text-slate-500">{item.type}</span>
                         </td>
                         <td className="py-4 px-4 text-center">
                            <span className={`text-sm font-black ${item.score >= 90 ? 'text-indigo-600' : 'text-slate-700'}`}>{item.score}</span>
                         </td>
                         <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1">
                               {item.reasons.map(reason => (
                                 <span key={reason} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded-md">
                                    {reason}
                                 </span>
                               ))}
                            </div>
                         </td>
                         <td className="py-4 px-4 pr-6">
                            <div className="flex flex-wrap gap-1">
                               {item.strategies.map(s => (
                                 <span key={s} className="px-1.5 py-0.5 text-[9px] font-black rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                                    {s}
                                 </span>
                               ))}
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT: OBJECT DETAILS (320px) */}
        <div className="w-[320px] border-l border-slate-200 bg-white flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">关联分析报告</span>
          </div>

          {activeResult ? (
            <div className="flex-1 overflow-y-auto p-5 space-y-8">
              
              {/* Basic Info */}
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                   <i className="fas fa-info-circle text-indigo-600"></i> 基础信息
                </h4>
                <div className="space-y-2">
                   {[
                     { label: '对象名称', value: activeResult.details.basicInfo.name },
                     { label: '对象类型', value: activeResult.details.basicInfo.type },
                     { label: '所属平台', value: activeResult.details.basicInfo.platform },
                     { label: '所属区块', value: activeResult.details.basicInfo.block },
                     { label: '地质层位', value: activeResult.details.basicInfo.layer },
                   ].map(row => (
                     <div key={row.label} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0 border-dashed">
                       <span className="text-[10px] text-slate-400">{row.label}</span>
                       <span className="text-[10px] font-black text-slate-700">{row.value}</span>
                     </div>
                   ))}
                </div>
              </div>

              {/* Recommendation Reason */}
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                   <i className="fas fa-lightbulb text-indigo-600"></i> 推荐原因
                </h4>
                <div className="space-y-2 bg-indigo-50/30 rounded-2xl p-4 border border-indigo-100/50">
                   {[
                     `✓ 距离当前井 1.2km (空间)`,
                     `✓ 同属于${activeResult.details.basicInfo.layer}层位 (地质)`,
                     `✓ 同一构造单元 (地质)`,
                     `✓ 压裂规模与施工参数一致 (工程)`
                   ].map((item, idx) => (
                     <div key={idx} className="text-[10px] text-slate-600 font-bold leading-relaxed mb-1 last:mb-0">
                        {item}
                     </div>
                   ))}
                </div>
              </div>

              {/* Score Breakdown */}
              <div>
                 <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                   <i className="fas fa-chart-pie text-indigo-600"></i> 得分拆解 (Total: {activeResult.score})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                   {[
                     { label: '层级关系', val: activeResult.details.scoreBreakdown.hierarchical },
                     { label: '空间关系', val: activeResult.details.scoreBreakdown.spatial },
                     { label: '地质相似', val: activeResult.details.scoreBreakdown.geological },
                     { label: '工程参数', val: activeResult.details.scoreBreakdown.engineering },
                   ].map(card => (
                      <div key={card.label} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center transition-all hover:bg-white hover:border-indigo-100 hover:shadow-sm">
                         <span className="text-lg font-black text-indigo-600">{card.val}</span>
                         <span className="text-[9px] font-black text-slate-400 tracking-tighter uppercase">{card.label}</span>
                      </div>
                   ))}
                </div>
              </div>

              {/* Relation Tree */}
              <div>
                 <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                   <i className="fas fa-network-wired text-indigo-600"></i> 对象关系图谱
                </h4>
                <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-2 font-mono">
                   <div className="text-[10px] text-slate-600 flex items-center gap-2">
                      <i className="fas fa-globe text-[8px] text-slate-400"></i> 长庆油田
                   </div>
                   <div className="text-[10px] text-slate-600 pl-4 border-l-2 border-slate-200 ml-1 py-1 flex items-center gap-2">
                      <i className="fas fa-layer-group text-[8px] text-slate-400"></i> A区块
                   </div>
                   <div className="text-[10px] text-slate-600 pl-8 border-l-2 border-slate-200 ml-1 py-1 flex items-center gap-2">
                      <i className="fas fa-cubes text-[8px] text-slate-400"></i> A1平台
                   </div>
                   <div className="pl-12 border-l-2 border-slate-200 ml-1 space-y-2 py-2">
                      <div className="text-[10px] text-indigo-600 font-black flex items-center gap-2">
                         <i className="fas fa-map-marker-alt text-[8px]"></i> {currentObject.name} (当前)
                      </div>
                      <div className="text-[10px] text-slate-900 font-black bg-white border border-indigo-100 px-2 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                         <i className="fas fa-circle text-[7px] text-indigo-500 animate-pulse"></i> {activeResult.name}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 pl-2">
                         <i className="fas fa-circle text-[6px] text-slate-200"></i> X-8井
                      </div>
                   </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                  <i className="fas fa-mouse-pointer text-2xl"></i>
               </div>
               <p className="text-xs text-slate-400 font-medium">点击列表项目查看深度分析</p>
            </div>
          )}
        </div>

      </div>

      {/* BOTTOM SELECTED BAR */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="h-20 bg-white border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.08)] px-8 flex items-center justify-between shrink-0 z-20"
          >
            <div className="flex items-center gap-6 overflow-hidden">
               <div className="shrink-0 flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-slate-900/20">
                     {selectedIds.size}
                  </div>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">已选对象</span>
               </div>
               <div className="w-px h-8 bg-slate-200 shrink-0"></div>
               <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar py-2">
                  {allSelected.map(obj => (
                    <div key={obj.id} className="shrink-0 group flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-white transition-all cursor-default">
                       <span className="text-[10px] font-black text-slate-800">{obj.name}</span>
                       <span className="px-1.5 py-0.5 bg-slate-200/50 rounded text-[8px] text-slate-500 uppercase font-black tracking-tight">{obj.type}</span>
                       <button 
                        onClick={() => toggleSelection(obj.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 flex items-center justify-center text-slate-400 hover:text-rose-600"
                       >
                          <i className="fas fa-times text-[9px]"></i>
                       </button>
                    </div>
                  ))}
               </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-8">
               <button 
                onClick={() => setSelectedIds(new Set(['well-x1']))}
                className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all font-black uppercase tracking-wider"
               >
                 清空
               </button>
               <button className="px-10 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow-2xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center gap-3">
                 添加
                 <i className="fas fa-plus text-[10px] opacity-60"></i>
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
