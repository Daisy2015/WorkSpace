
import React, { useState } from 'react';
import { Language } from '../types';

interface ObjectScopeSelectorProps {
  selectedObjects: string[];
  onChange: (objects: string[]) => void;
  onNavigateToStrategy?: () => void;
  lang: Language;
}

interface RecommendedObject {
  id: string;
  name: string;
  type: string;
  reason?: string;
}

interface SelectedObject {
  id: string;
  name: string;
  type: string;
}

const OBJECT_TYPES: Record<string, { label: string; icon: string }> = {
  oilfield: { label: '油气田', icon: 'fa-layer-group' },
  block: { label: '区块', icon: 'fa-vector-square' },
  well: { label: '井', icon: 'fa-bore-hole' },
};

const INSTANCE_DATA: Record<string, { id: string; label: string }[]> = {
  oilfield: [
    { id: 'f-01', label: '大庆油气田' },
    { id: 'f-02', label: '塔里木油气田' },
    { id: 'f-03', label: '胜利油气田' },
  ],
  block: [
    { id: 'b-01', label: '苏里格区块' },
    { id: 'b-02', label: '塔中区块' },
    { id: 'b-03', label: '玛湖区块' },
  ],
  well: [
    { id: 'w-01', label: '井-01' },
    { id: 'w-02', label: '井-02' },
    { id: 'w-03', label: '井-03' },
    { id: 'w-04', label: '井-04' },
    { id: 'w-05', label: '井-05' },
  ],
};

const RECOMMENDATION_STRATEGIES = [
  { label: '邻井', color: 'bg-blue-50 text-blue-500 border-blue-100' },
  { label: '同区块', color: 'bg-emerald-50 text-emerald-500 border-emerald-100' },
  { label: '同地质', color: 'bg-amber-50 text-amber-500 border-amber-100' },
];

export const ObjectScopeSelector: React.FC<ObjectScopeSelectorProps> = ({ selectedObjects, onChange, onNavigateToStrategy, lang }) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  
  // Selected (manual) items
  const [selectedItems, setSelectedItems] = useState<SelectedObject[]>([]);
  
  // Suggested items from recommendations
  const [recommendations, setRecommendations] = useState<RecommendedObject[]>([]);
  const [isRecsExpanded, setIsRecsExpanded] = useState(true);

  const handleAddObject = () => {
    if (!selectedInstance) return;
    const instanceObj = INSTANCE_DATA[selectedType]?.find(i => i.id === selectedInstance);
    if (!instanceObj) return;

    if (selectedItems.find(o => o.id === instanceObj.id)) return;

    const newList = [...selectedItems, { 
      id: instanceObj.id, 
      name: instanceObj.label, 
      type: selectedType 
    }];
    setSelectedItems(newList);
    syncToParent(newList, recommendations);
    setSelectedInstance('');
  };

  const handleRecommendForObject = (obj: SelectedObject) => {
    // Mock recommendations based on the specific object
    const newRecs: RecommendedObject[] = [
      { id: `rec-${obj.id}-1`, name: `${obj.name}-RC1`, type: 'well', reason: '邻井' },
      { id: `rec-${obj.id}-2`, name: `${obj.name}-RC2`, type: 'well', reason: '同区块' },
    ];

    const currentIds = new Set(recommendations.map(r => r.id));
    const filtered = newRecs.filter(r => !currentIds.has(r.id));
    
    const nextRecs = [...recommendations, ...filtered];
    setRecommendations(nextRecs);
    syncToParent(selectedItems, nextRecs);
    setIsRecsExpanded(true);
  };

  const handleRemoveItem = (id: string) => {
    const newList = selectedItems.filter(o => o.id !== id);
    setSelectedItems(newList);
    syncToParent(newList, recommendations);
  };

  const handleRemoveRec = (id: string) => {
    const nextRecs = recommendations.filter(r => r.id !== id);
    setRecommendations(nextRecs);
    syncToParent(selectedItems, nextRecs);
  };

  const syncToParent = (items: SelectedObject[], recs: RecommendedObject[]) => {
    const allNames = [
      ...items.map(i => i.name),
      ...recs.map(r => r.name)
    ];
    onChange(allNames);
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Search & Add Section */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative group">
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setSelectedInstance('');
            }}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">{lang === 'zh' ? '对象类型' : 'Object Type'}</option>
            {Object.entries(OBJECT_TYPES).map(([id, info]) => (
              <option key={id} value={id}>{info.label}</option>
            ))}
          </select>
          <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none transition-colors group-hover:text-slate-600"></i>
        </div>

        <div className="relative group flex gap-2">
          <div className="flex-1 relative">
            <select
              value={selectedInstance}
              onChange={(e) => setSelectedInstance(e.target.value)}
              disabled={!selectedType}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed"
            >
              <option value="">{lang === 'zh' ? '对象名称' : 'Object Name'}</option>
              {selectedType && INSTANCE_DATA[selectedType]?.map(i => (
                <option key={i.id} value={i.id}>{i.label}</option>
              ))}
            </select>
            <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none transition-colors group-hover:text-slate-600"></i>
          </div>
          <button 
            onClick={handleAddObject}
            disabled={!selectedInstance}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-600 disabled:bg-slate-200 disabled:shadow-none transition-all"
          >
            {lang === 'zh' ? '添加' : 'Add'}
          </button>
        </div>
      </div>

      {/* Selected Items (Manual List) */}
      {selectedItems.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '已添加对象' : 'Added Objects'}</span>
          <div className="flex flex-col gap-1.5">
            {selectedItems.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 hover:border-blue-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase tracking-tighter">{OBJECT_TYPES[item.type]?.label}</span>
                  <span className="text-xs font-bold text-slate-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onNavigateToStrategy?.()}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title={lang === 'zh' ? '推设置推荐策略' : 'Strategy Settings'}
                  >
                    <i className="fas fa-cog text-[10px]"></i>
                  </button>
                  <button 
                    onClick={() => handleRecommendForObject(item)}
                    className="h-7 px-2 text-blue-600 bg-blue-50/50 hover:bg-blue-600 hover:text-white rounded-lg transition-all flex items-center gap-1.5"
                    title={lang === 'zh' ? '基于此对象推荐' : 'Recommend based on this'}
                  >
                    <i className="fas fa-magic text-[9px]"></i>
                    <span className="text-[9px] font-black uppercase">{lang === 'zh' ? '推荐' : 'REC'}</span>
                  </button>
                  <button 
                    onClick={() => handleRemoveItem(item.id)}
                    className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <i className="fas fa-times text-[10px]"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Section (Collapsible) */}
      <div className="flex flex-col gap-3 mt-2">
        <div 
          onClick={() => setIsRecsExpanded(!isRecsExpanded)}
          className="flex items-center justify-between cursor-pointer group px-1"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{lang === 'zh' ? '推荐关联对象' : 'Associated Recs'}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          </div>
          <i className={`fas fa-chevron-down text-[10px] text-slate-300 transition-transform duration-300 ${isRecsExpanded ? '' : '-rotate-90'}`}></i>
        </div>

        {isRecsExpanded && (
          <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1 animate-in fade-in slide-in-from-top-1 duration-300">
            {recommendations.length > 0 ? (
              recommendations.map((obj) => (
                <div 
                  key={obj.id} 
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-100 hover:bg-white transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="px-2 py-0.5 bg-blue-50 rounded text-[9px] font-bold text-blue-500 uppercase tracking-tighter">{OBJECT_TYPES[obj.type]?.label}</span>
                    <span className="text-xs font-bold text-slate-700 truncate">{obj.name}</span>
                    {obj.reason && (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border whitespace-nowrap ml-auto shrink-0 ${
                        RECOMMENDATION_STRATEGIES.find(s => s.label === obj.reason)?.color || 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {obj.reason}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleRemoveRec(obj.id)}
                    className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                  >
                    <i className="fas fa-times text-[10px]"></i>
                  </button>
                </div>
              ))
            ) : (
              <div className="py-8 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300 gap-2">
                <i className="fas fa-wand-magic-sparkles text-xl opacity-20"></i>
                <p className="text-[10px] font-medium uppercase tracking-widest">{lang === 'zh' ? '点击对象的“推荐”按钮生成列表' : 'Click "Rec" on objects to generate list'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


