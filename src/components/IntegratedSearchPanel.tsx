import React, { useState } from 'react';
import { Language, ResourceNode } from '../types';
import { translations } from '../i18n';

interface IntegratedSearchPanelProps {
  lang: Language;
  onAddResource: (resource: ResourceNode) => void;
}

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  source: string;
  url?: string;
  type: string;
  date: string;
}

// Mock Data for Search Results
const MOCK_SEARCH_RESULTS: SearchResult[] = [
  {
    id: 'ext-1',
    title: 'Global Oil Market Report 2024',
    snippet: 'Comprehensive analysis of global oil supply, demand, and trade flows...',
    source: 'IEA',
    url: 'https://www.iea.org/reports/oil-market-report',
    type: 'Report',
    date: '2024-01-15'
  },
  {
    id: 'ext-2',
    title: 'Deepwater Drilling Technologies',
    snippet: 'Overview of latest advancements in deepwater drilling equipment and techniques...',
    source: 'SPE OnePetro',
    type: 'Paper',
    date: '2023-11-20'
  },
  {
    id: 'ext-3',
    title: 'Seismic Data - North Sea Block 4',
    snippet: 'Raw seismic data set for Block 4 exploration...',
    source: 'Internal DB',
    type: 'Data',
    date: '2023-12-05'
  },
  {
    id: 'ext-4',
    title: 'Environmental Impact Assessment - Project X',
    snippet: 'Detailed EIA report for the proposed Project X development...',
    source: 'Gov Portal',
    type: 'Document',
    date: '2024-02-01'
  },
  {
    id: 'ext-5',
    title: 'Crude Oil Price Forecast Q2 2024',
    snippet: 'Market trends and price predictions for the upcoming quarter...',
    source: 'Bloomberg',
    type: 'News',
    date: '2024-02-10'
  }
];

export const IntegratedSearchPanel: React.FC<IntegratedSearchPanelProps> = ({ lang, onAddResource }) => {
  const t = translations[lang];
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>(MOCK_SEARCH_RESULTS);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleSearch = () => {
    // In a real app, this would call an API
    if (!query.trim()) {
      setResults(MOCK_SEARCH_RESULTS);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = MOCK_SEARCH_RESULTS.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      item.snippet.toLowerCase().includes(lowerQuery) ||
      item.source.toLowerCase().includes(lowerQuery)
    );
    setResults(filtered);
  };

  const handleAdd = (item: SearchResult) => {
    const newResource: ResourceNode = {
      id: `integrated-${Date.now()}-${item.id}`,
      name: item.title,
      type: 'artifact',
      meta: {
        sourceType: 'web', // Or a new 'integrated' type if supported
        fileType: item.type,
        url: item.url,
        date: item.date
      }
    };
    onAddResource(newResource);
    setAddedIds(prev => new Set(prev).add(item.id));
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            <i className="fas fa-search mr-2 text-blue-500"></i>
            {lang === 'zh' ? '集成搜索' : 'Integrated Search'}
        </h2>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <input 
            type="text" 
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={lang === 'zh' ? '搜索外部资源...' : 'Search external resources...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <i className="fas fa-search absolute left-3 top-2.5 text-gray-400 text-xs"></i>
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {results.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            {lang === 'zh' ? '未找到结果' : 'No results found'}
          </div>
        ) : (
          <div className="space-y-3">
            {results.map(item => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-bold text-gray-800 leading-tight">{item.title}</h3>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap ml-2">
                    {item.source}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.snippet}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 flex items-center">
                    <i className="far fa-calendar-alt mr-1"></i> {item.date}
                  </span>
                  <button 
                    onClick={() => handleAdd(item)}
                    disabled={addedIds.has(item.id)}
                    className={`text-xs px-2 py-1 rounded flex items-center transition-colors ${
                      addedIds.has(item.id) 
                        ? 'bg-green-100 text-green-700 cursor-default' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    {addedIds.has(item.id) ? (
                      <>
                        <i className="fas fa-check mr-1"></i> {lang === 'zh' ? '已添加' : 'Added'}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus mr-1"></i> {lang === 'zh' ? '添加' : 'Add'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
