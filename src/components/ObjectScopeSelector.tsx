
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';

interface ObjectScopeSelectorProps {
  selectedObjects: string[];
  onChange: (objects: string[]) => void;
  lang: Language;
}

const RECOMMENDATIONS = [
  {
    category: '相邻对象',
    items: ['X-3 井', 'X-4 井', 'B 区块', '大庆油气田', '塔里木油田']
  },
  {
    category: '相似对象',
    items: ['Y-1 井', 'C 区块', '胜利油气田', '长庆油田', '西南气田']
  },
  {
    category: '同区对象',
    items: ['X-5 井', 'D 区块', '辽河油田', '中原油田']
  }
];

const ALL_OBJECT_OPTIONS = [
    '井', '区块', '组织机构', '管线', '盆地', '油气藏', '油气田',
    'X-1 井', 'X-2 井', 'A 区块', '钻井作业队-001'
];

export const ObjectScopeSelector: React.FC<ObjectScopeSelectorProps> = ({ selectedObjects, onChange, lang }) => {
  const t = translations[lang];
  const [isRecommendOpen, setIsRecommendOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsRecommendOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleObject = (obj: string) => {
    if (selectedObjects.includes(obj)) {
      onChange(selectedObjects.filter(o => o !== obj));
    } else {
      onChange([...selectedObjects, obj]);
    }
  };

  const removeObject = (obj: string) => {
    onChange(selectedObjects.filter(o => o !== obj));
  };

  const filteredOptions = ALL_OBJECT_OPTIONS.filter(o => 
    o.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedObjects.includes(o)
  );

  return (
    <div className="flex flex-col gap-3" ref={dropdownRef}>
      <div className="flex items-center justify-end">
        <button 
          onClick={() => setIsRecommendOpen(!isRecommendOpen)}
          className={`text-[10px] px-2 py-1 rounded flex items-center transition-all ${
            isRecommendOpen ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <i className="fas fa-magic mr-1.5 text-[9px]"></i>
          智能推荐
        </button>
      </div>

      {/* Input & Dropdown Area */}
      <div className="relative">
        <div 
          className="w-full border border-gray-200 rounded-lg bg-white p-1.5 flex flex-wrap gap-1.5 min-h-[42px] cursor-text hover:border-gray-300 transition-colors focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
          onClick={() => setIsDropdownOpen(true)}
        >
          {selectedObjects.map(obj => (
            <span key={obj} className="inline-flex items-center bg-indigo-50 text-indigo-700 text-[11px] px-2 py-0.5 rounded-md border border-indigo-100 group">
              {obj}
              <button 
                onClick={(e) => { e.stopPropagation(); removeObject(obj); }}
                className="ml-1.5 text-indigo-300 hover:text-indigo-600 transition-colors"
              >
                <i className="fas fa-times text-[9px]"></i>
              </button>
            </span>
          ))}
          <input 
            type="text"
            className="flex-1 min-w-[60px] bg-transparent border-none outline-none text-xs p-1"
            placeholder={selectedObjects.length === 0 ? "输入或选择对象..." : ""}
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
          />
        </div>

        {/* Manual Selection Dropdown */}
        {isDropdownOpen && filteredOptions.length > 0 && (
          <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar p-1 animate-in fade-in slide-in-from-top-1 duration-200">
            {filteredOptions.map(opt => (
              <div 
                key={opt}
                onClick={() => {
                    toggleObject(opt);
                    setSearchTerm('');
                }}
                className="px-3 py-2 text-xs text-gray-700 hover:bg-slate-50 rounded-md cursor-pointer flex items-center justify-between group"
              >
                <span>{opt}</span>
                <i className="fas fa-plus text-[9px] text-gray-300 group-hover:text-indigo-500"></i>
              </div>
            ))}
          </div>
        )}

        {/* Recommendation Panel */}
        {isRecommendOpen && (
          <div className="absolute z-[70] w-full mt-1 bg-white border border-indigo-100 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-indigo-50/50 px-3 py-2 border-b border-indigo-100 flex justify-between items-center">
                <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
                    <i className="fas fa-sparkles mr-1.5"></i> 推荐相关对象
                </span>
                <button onClick={() => setIsRecommendOpen(false)} className="text-indigo-400 hover:text-indigo-600">
                    <i className="fas fa-times text-[10px]"></i>
                </button>
            </div>
            <div className="p-3 space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
                {RECOMMENDATIONS.map(cat => (
                    <div key={cat.category}>
                        <div className="text-[10px] text-gray-400 mb-2 font-medium flex items-center">
                            <span className="w-1 h-1 bg-indigo-400 rounded-full mr-2"></span>
                            {cat.category}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {cat.items.map(item => {
                                const isSelected = selectedObjects.includes(item);
                                return (
                                    <button 
                                        key={item}
                                        onClick={() => toggleObject(item)}
                                        className={`text-[10px] px-2.5 py-1.5 rounded-md transition-all border ${
                                            isSelected 
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30'
                                        }`}
                                    >
                                        {item}
                                        {isSelected && <i className="fas fa-check ml-1.5 text-[8px]"></i>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-slate-50 px-3 py-2 border-t border-slate-100 text-[9px] text-slate-400 italic">
                基于当前选择和业务关联度智能计算
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
