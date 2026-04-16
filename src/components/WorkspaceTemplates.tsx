import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { WorkspaceTemplate, Language } from '../types';
import { translations } from '../i18n';

interface WorkspaceTemplatesProps {
  templates: WorkspaceTemplate[];
  onCreateFromTemplate: (template: WorkspaceTemplate, name?: string, description?: string, objects?: any[]) => void;
  lang: Language;
}

export const WorkspaceTemplates: React.FC<WorkspaceTemplatesProps> = ({
  templates,
  onCreateFromTemplate,
  lang
}) => {
  const t = translations[lang];
  const [sortBy, setSortBy] = useState<'time' | 'usage'>('usage');
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'recommended' | 'recent' | 'my' | 'all'>('all');
  const [showAll, setShowAll] = useState(false);

  const filteredTemplates = useMemo(() => {
    let result = [...templates];
    
    // Tab filtering
    if (activeTab === 'my') {
      result = result.filter(tpl => tpl.owner === '钻井专家组' || tpl.owner === '地质研究所'); // Mocking "My"
    } else if (activeTab === 'recent') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeTab === 'recommended') {
      result = result.filter(tpl => tpl.usageCount > 100);
    }

    // Search Filter
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      result = result.filter(tpl => 
        tpl.name.toLowerCase().includes(lowerFilter) || 
        tpl.description.toLowerCase().includes(lowerFilter) ||
        tpl.tags?.some(tag => tag.toLowerCase().includes(lowerFilter))
      );
    }

    // Sort
    if (activeTab !== 'recent') {
      result.sort((a, b) => {
        if (sortBy === 'time') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else {
          return b.usageCount - a.usageCount;
        }
      });
    }

    return result;
  }, [templates, sortBy, filter, activeTab]);

  const displayedTemplates = showAll ? filteredTemplates : filteredTemplates.slice(0, 8);

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.templates}</h1>
            <p className="text-gray-500 text-sm">{t.templateSubtitle}</p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-4">
             <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                />
             </div>
             
             <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={() => setSortBy('time')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${sortBy === 'time' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {t.sortTime}
                </button>
                <button 
                  onClick={() => setSortBy('usage')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${sortBy === 'usage' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {t.sortUsage}
                </button>
             </div>
          </div>
        </div>

        {/* Tabs and Category Filter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8 border-b border-transparent">
            {[
              { id: 'recommended', name: t.recommendedForYou },
              { id: 'recent', name: t.recentlyUpdated },
              { id: 'my', name: t.myTemplates },
              { id: 'all', name: t.allTemplates },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab.name}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {displayedTemplates.map(tpl => (
            <div key={tpl.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all flex flex-col group relative overflow-hidden h-full">
               <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center mb-3 text-indigo-600">
                       <i className={`fas ${tpl.icon || 'fa-layer-group'} text-lg`}></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1" title={tpl.name}>{tpl.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{tpl.description}</p>
                  </div>
                  
                  <div className="mt-auto pt-2 text-xs text-gray-400 flex items-center gap-2">
                    <span className="font-medium text-gray-600">{tpl.owner}</span>
                    <span>•</span>
                    <span>{tpl.createdAt}</span>
                  </div>
               </div>

               {/* Footer */}
               <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-xs text-gray-500 font-medium flex items-center" title={t.usageCount}>
                     <i className="fas fa-fire text-orange-400 mr-1.5"></i>
                     {tpl.usageCount}
                  </div>
                  <button 
                    onClick={() => onCreateFromTemplate(tpl)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center group-hover:translate-x-1 transition-transform"
                  >
                    {t.createFromTemplate} <i className="fas fa-arrow-right ml-1"></i>
                  </button>
               </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {filteredTemplates.length > (showAll ? 0 : 8) && (
          <div className="flex justify-center pb-12">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-blue-300 transition-all shadow-sm flex items-center gap-2"
            >
              {showAll ? (
                <>
                  {t.showLess} <i className="fas fa-chevron-up text-xs"></i>
                </>
              ) : (
                <>
                  {t.showMore} <i className="fas fa-chevron-down text-xs"></i>
                </>
              )}
            </button>
          </div>
        )}

        {filteredTemplates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <i className="fas fa-folder-open text-5xl mb-4 opacity-20"></i>
            <p className="text-lg font-medium">{t.noWorkspaces}</p>
          </div>
        )}
      </div>
    </div>
  );
};
