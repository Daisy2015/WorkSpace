import React, { useState, useMemo } from 'react';
import { WorkspaceTemplate, Language } from '../types';
import { translations } from '../i18n';

interface WorkspaceTemplatesProps {
  templates: WorkspaceTemplate[];
  onCreateFromTemplate: (template: WorkspaceTemplate, name?: string, description?: string, objects?: any[]) => void;
  lang: Language;
}

const CATEGORIES = [
  { field: '地质勘探', id: 'exploration', name: '地质勘探类', icon: 'fa-compass' },
  { field: '开发研究', id: 'development', name: '开发研究类', icon: 'fa-tint' },
  { field: '生产运行', id: 'production', name: '生产运行类', icon: 'fa-desktop' },
  { field: '工程技术', id: 'engineering', name: '工程技术类', icon: 'fa-tools' },
  { field: '综合研究', id: 'integrated', name: '综合研究类', icon: 'fa-users' },
  { field: '生产管理', id: 'management', name: '生产管理类', icon: 'fa-calculator' },
  { field: '成果编制', id: 'reporting', name: '成果编制类', icon: 'fa-file-alt' },
];

export const WorkspaceTemplates: React.FC<WorkspaceTemplatesProps> = ({
  templates,
  onCreateFromTemplate,
  lang
}) => {
  const t = translations[lang];
  const [sortBy, setSortBy] = useState<'time' | 'usage'>('usage');
  const [filter, setFilter] = useState('');

  // Filter & Search templates
  const filteredTemplates = useMemo(() => {
    let result = [...templates];
    
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      result = result.filter(tpl => 
        tpl.name.toLowerCase().includes(lowerFilter) || 
        tpl.description.toLowerCase().includes(lowerFilter) ||
        tpl.tags?.some(tag => tag.toLowerCase().includes(lowerFilter)) ||
        tpl.defaultAgent?.toLowerCase().includes(lowerFilter) ||
        tpl.category?.toLowerCase().includes(lowerFilter)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'time') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.usageCount - a.usageCount;
      }
    });

    return result;
  }, [templates, sortBy, filter]);

  // Map of categorized templates
  const categoriesMap = useMemo(() => {
    const map: Record<string, WorkspaceTemplate[]> = {};
    filteredTemplates.forEach(tpl => {
      const cat = tpl.category || '其他';
      if (!map[cat]) map[cat] = [];
      map[cat].push(tpl);
    });
    return map;
  }, [filteredTemplates]);

  // Recommended Templates (top 4 used templates)
  const recommendedTemplates = useMemo(() => {
    return [...filteredTemplates]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 4);
  }, [filteredTemplates]);

  const renderCard = (tpl: WorkspaceTemplate) => {
    return (
      <div 
        key={tpl.id} 
        onClick={() => onCreateFromTemplate(tpl)}
        className="bg-white rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_24px_rgba(59,130,246,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col p-5 space-y-3.5 relative group h-full justify-between"
      >
        <div className="space-y-3.5 flex-1 flex flex-col justify-start">
          {/* Top Row: Title & "去创建" Button */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug flex-1 min-w-0" title={tpl.name}>
              {tpl.name}
            </h3>
            
            <button className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm shrink-0 duration-200">
              <span>去创建</span>
              <i className="fas fa-arrow-right text-[9px]"></i>
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed" title={tpl.description}>
            {tpl.description}
          </p>

          {/* AI Agent Tag styled identically to WorkspaceList */}
          {tpl.defaultAgent && (
            <div className="inline-flex items-center gap-1.5 bg-[#EDF3FF] border border-[#D9E6FF] rounded-full px-2.5 py-1 text-[11px] font-bold text-blue-600 w-fit">
              <span className="text-xs">🤖</span>
              <span className="truncate max-w-[160px]" title={tpl.defaultAgent}>
                {tpl.defaultAgent}
              </span>
            </div>
          )}
        </div>

        {/* Footer Row: Owner, Date, Usage count all in one single line */}
        <div className="border-t border-slate-100/60 pt-3 flex items-center gap-2 text-[11px] text-gray-400 font-medium shrink-0 whitespace-nowrap overflow-hidden">
          <span className="text-gray-500 font-semibold truncate max-w-[85px]" title={tpl.owner}>{tpl.owner}</span>
          <span>·</span>
          <span>{tpl.createdAt}</span>
          <span>·</span>
          <span className="flex items-center gap-0.5 shrink-0 text-orange-500/90 font-semibold">
            <i className="fas fa-fire text-[10px]"></i>
            <span>{tpl.usageCount}</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 flex-shrink-0 shadow-sm">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">{t.templates}</h1>
            <p className="text-slate-400 text-sm font-medium">{t.templateSubtitle}</p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-4">
             <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs"></i>
                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs w-64 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                />
             </div>
             
             <div className="flex items-center bg-slate-100/80 rounded-lg p-0.5 border border-slate-200/50">
                <button 
                  onClick={() => setSortBy('time')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${sortBy === 'time' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {t.sortTime}
                </button>
                <button 
                  onClick={() => setSortBy('usage')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${sortBy === 'usage' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {t.sortUsage}
                </button>
             </div>
          </div>
        </div>

        {/* Category anchors navigation (only shown when not searching) */}
        {!filter && (
          <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 no-scrollbar border-t border-slate-100 pt-4">
            <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap mr-2">分类导航:</span>
            {CATEGORIES.map(cat => {
              const count = categoriesMap[cat.field]?.length || 0;
              if (count === 0) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    const el = document.getElementById(`cat-sec-${cat.id}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-200/50 hover:border-blue-200 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-all whitespace-nowrap shadow-sm hover:shadow"
                >
                  <i className={`fas ${cat.icon} text-slate-400 text-[10px]`}></i>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
        {filter ? (
          /* Search Results */
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5 border-b border-slate-200/60 pb-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <i className="fas fa-search text-sm"></i>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">搜索结果</h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">找到 {filteredTemplates.length} 个匹配的模板</p>
              </div>
            </div>
            
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredTemplates.map(tpl => renderCard(tpl))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <i className="fas fa-folder-open text-5xl mb-4 opacity-20 text-slate-300"></i>
                <p className="text-base font-semibold text-slate-400">{t.noWorkspaces}</p>
              </div>
            )}
          </div>
        ) : (
          /* Default Layout: Recommendations -> Categorized All */
          <div>
            {/* 1. 为我推荐 (Recommended for You) */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-5 border-b border-slate-200/60 pb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/40">
                  <i className="fas fa-fire text-sm"></i>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">为我推荐</h2>
                </div>
              </div>
              {recommendedTemplates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {recommendedTemplates.map(tpl => renderCard(tpl))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200/80 p-8 text-center text-slate-400 max-w-full">
                  <i className="far fa-thumbs-up text-xl mb-2 opacity-40 text-slate-300"></i>
                  <p className="text-xs font-medium text-slate-400">暂无推荐的模板</p>
                </div>
              )}
            </div>

            {/* 2. 全部分类模板 (All Categorized Templates) */}
            {CATEGORIES.map(cat => {
              let items = categoriesMap[cat.field] || [];
              if (items.length === 0) return null;
              
              // 异常类 (生产运行)、预测类 (生产运行/生产管理)、决策类 (综合研究/生产管理)、成果编制类仅保留前三个空间
              const limitThreeCategories = ['生产运行', '综合研究', '生产管理', '成果编制'];
              if (limitThreeCategories.includes(cat.field)) {
                items = items.slice(0, 3);
              }

              return (
                <div key={cat.id} id={`cat-sec-${cat.id}`} className="mb-10 scroll-mt-6">
                  {/* Category Section Header - Description & Count Removed */}
                  <div className="flex items-center justify-between mb-5 border-b border-slate-200/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50/80 flex items-center justify-center text-blue-600">
                        <i className={`fas ${cat.icon} text-sm`}></i>
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-800">{cat.name}</h2>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {items.map(tpl => renderCard(tpl))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
