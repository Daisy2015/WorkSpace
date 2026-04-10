import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ResourceNode, Language } from '../types';
import { translations } from '../i18n';

interface FactsPanelProps {
  treeData: ResourceNode[];
  selectedResources: Set<string>;
  onToggleResource: (id: string, node: ResourceNode) => void;
  onSelectNode: (node: ResourceNode) => void;
  selectedNodeId?: string;
  onAddResource: (parentId: string, resource: ResourceNode) => void;
  onDeleteResources: (ids: string[]) => void;
  onOpenAddResourcePage: () => void;
  onTogglePublic: (id: string, node: ResourceNode) => void;
  lang: Language;
  isReadOnly?: boolean;
  hideObjectInstance?: boolean;
  hideHeader?: boolean;
  hideOutcomes?: boolean;
  hideLeafNodes?: boolean;
}

// --- Helper for Tree IDs ---
const getAllIds = (nodes: ResourceNode[]): string[] => {
  let ids: string[] = [];
  nodes.forEach(node => {
    ids.push(node.id);
    if (node.children) {
      ids = ids.concat(getAllIds(node.children));
    }
  });
  return ids;
};

// --- Recursive filter function ---
const filterTree = (nodes: ResourceNode[], term: string, hideOutcomes?: boolean, hideLeafNodes?: boolean): ResourceNode[] => {
  return nodes.reduce((acc: ResourceNode[], node) => {
    // 1. Filter out outcomes if requested
    if (hideOutcomes && node.meta?.fileType === 'Outcome') return acc;
    
    // 2. If hideLeafNodes is true, skip nodes that have no children in the original data
    if (hideLeafNodes && (!node.children || node.children.length === 0)) {
      return acc;
    }

    const filteredChildren = node.children ? filterTree(node.children, term, hideOutcomes, hideLeafNodes) : [];
    
    const matches = term ? node.name.toLowerCase().includes(term.toLowerCase()) : true;
    
    if (matches || filteredChildren.length > 0) {
      acc.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children
      });
    }
    return acc;
  }, []);
};

// --- TreeNode Component ---
const TreeNode: React.FC<{
  node: ResourceNode;
  level: number;
  selectedResources: Set<string>;
  onToggleResource: (id: string, node: ResourceNode) => void;
  onSelectNode: (node: ResourceNode) => void;
  selectedNodeId?: string;
  onDelete: (id: string) => void;
  onUpload: (id: string) => void;
  onTogglePublic: (id: string, node: ResourceNode) => void;
  lang: Language;
  searchTerm: string;
  isReadOnly?: boolean;
}> = ({ node, level, selectedResources, onToggleResource, onSelectNode, selectedNodeId, onDelete, onUpload, onTogglePublic, lang, searchTerm, isReadOnly }) => {
  // CHANGED: Default expanded to true for all nodes
  const [expanded, setExpanded] = useState(true); 
  const isExpanded = searchTerm ? true : expanded;
  const t = translations[lang];
  const isSelected = selectedResources.has(node.id);
  const isCurrent = selectedNodeId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!searchTerm) {
      setExpanded(!expanded);
    }
    onSelectNode(node);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggleResource(node.id, node);
  };

  const displayName = useMemo(() => {
    return node.name.replace(/\.[^/.]+$/, "");
  }, [node.name]);

  const getSourceBadge = () => {
    const type = node.meta?.sourceType;
    if (type === 'web') return <i className="fas fa-globe text-cyan-500" title={t.typeWeb}></i>;
    if (type === 'local') return <i className="fas fa-arrow-up text-orange-500" title={t.local}></i>;
    if (type === 'system') return <i className="fas fa-server text-indigo-400" title={t.system}></i>;
    return null;
  };

  const getIcon = () => {
    if (node.type === 'domain') {
        if (node.id === 'root-web') return 'fa-cloud text-cyan-600';
        if (node.id === 'root-system') return 'fa-server text-indigo-600';
        return 'fa-folder-open text-blue-600';
    }
    if (node.type === 'mbu') return 'fa-cubes text-indigo-500';
    if (node.type === 'artifact') {
        if (node.id.startsWith('art-1-1-')) return 'fa-cubes text-indigo-500'; // Consistency for Drilling Tree level 4
        if (node.meta?.fileType === 'Outcome') return 'fa-chart-bar text-emerald-500';
        const name = node.name.toLowerCase();
        if (node.meta?.sourceType === 'web') return 'fa-link text-cyan-500';
        if (name.endsWith('.pdf')) return 'fa-file-pdf text-red-500';
        if (name.endsWith('.doc') || name.endsWith('.docx')) return 'fa-file-word text-blue-600';
        if (name.endsWith('.txt') || name.endsWith('.md')) return 'fa-file-alt text-gray-500';
        if (name.endsWith('.ppt') || name.endsWith('.pptx')) return 'fa-file-powerpoint text-orange-500';
        if (name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) return 'fa-file-excel text-green-600';
        if (name.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/)) return 'fa-file-image text-purple-500';
        if (name.endsWith('.segy') || name.endsWith('.las') || name.endsWith('.dlis')) return 'fa-database text-amber-600';
        if (node.meta?.fileType === 'Log') return 'fa-wave-square text-indigo-400';
        if (node.meta?.fileType === 'Outcome') return 'fa-chart-bar text-yellow-500';
        return 'fa-file text-gray-400';
    }
    return 'fa-file';
  };

  return (
    <div className="select-none">
      <div 
        className={`group flex items-center py-1.5 px-2 hover:bg-slate-100 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50' : ''} ${isCurrent ? 'bg-blue-50 ring-1 ring-blue-200' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelectNode(node)}
      >
        <div className="w-4 flex-shrink-0 flex justify-center mr-1" onClick={handleToggle}>
          {hasChildren && (
            <i className={`fas fa-chevron-right text-xs text-slate-400 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}></i>
          )}
        </div>

        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          className="mr-2 h-3.5 w-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 flex-shrink-0"
        />

        <div className="flex items-center flex-1 min-w-0">
          <i className={`fas ${getIcon()} mr-2 text-sm w-4 text-center flex-shrink-0`}></i>
          <span className={`text-sm truncate ${node.type === 'domain' ? 'font-semibold text-slate-800' : 'text-slate-700'} ${isCurrent ? 'text-blue-700 font-bold' : ''}`}>
            {displayName}
          </span>
          {node.type === 'artifact' && (
             <span className="ml-2 text-xs flex-shrink-0 opacity-70 scale-90">{getSourceBadge()}</span>
          )}
        </div>

        {/* Node Actions */}
        {!isReadOnly && (
          <div className="ml-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {node.meta?.sourceType === 'local' && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onTogglePublic(node.id, node); }} 
                    title={node.meta.isPublic ? t.publicTooltip : t.privateTooltip}
                    className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${node.meta.isPublic ? 'text-green-600 hover:bg-green-100' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                >
                  <i className={`fas ${node.meta.isPublic ? 'fa-globe' : 'fa-lock'} text-xs`}></i>
                </button>
            )}
            {node.type === 'mbu' && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onUpload(node.id); }} 
                    title={t.upload}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <i className="fas fa-cloud-upload-alt text-xs"></i>
                </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} 
              title={t.delete}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
            >
              <i className="fas fa-trash-alt text-xs"></i>
            </button>
          </div>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children!.map(child => (
            <TreeNode 
              key={child.id} 
              node={child} 
              level={level + 1}
              selectedResources={selectedResources}
              onToggleResource={onToggleResource}
              onSelectNode={onSelectNode}
              selectedNodeId={selectedNodeId}
              onDelete={onDelete}
              onUpload={onUpload}
              onTogglePublic={onTogglePublic}
              lang={lang}
              searchTerm={searchTerm}
              isReadOnly={isReadOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main FactsPanel Component ---
export const FactsPanel: React.FC<FactsPanelProps> = ({ 
  treeData, 
  selectedResources, 
  onToggleResource, 
  onSelectNode,
  selectedNodeId,
  onAddResource, 
  onDeleteResources,
  onOpenAddResourcePage,
  onTogglePublic,
  lang,
  isReadOnly,
  hideObjectInstance,
  hideHeader,
  hideOutcomes,
  hideLeafNodes
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetMbuId, setTargetMbuId] = useState<string | null>(null);
  
  // Object Instance Multi-select State
  const [selectedInstances, setSelectedInstances] = useState<string[]>(['x1']);
  const [isInstanceDropdownOpen, setIsInstanceDropdownOpen] = useState(false);
  const instanceDropdownRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];

  // Close dropdown when clicking outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (instanceDropdownRef.current && !instanceDropdownRef.current.contains(event.target as Node)) {
              setIsInstanceDropdownOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, []);

  const toggleInstance = (value: string) => {
      setSelectedInstances(prev => 
          prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
      );
  };

  const instanceOptions = [
      { value: 'x1', label: t.wellX1 },
      { value: 'x2', label: t.wellX2 }
  ];

  const getSelectedLabel = () => {
      if (selectedInstances.length === 0) return t.selectInstance;
      return selectedInstances.map(v => instanceOptions.find(o => o.value === v)?.label).join(', ');
  };

  const displayedNodes = useMemo(() => {
    return filterTree(treeData, searchTerm, hideOutcomes, hideLeafNodes);
  }, [searchTerm, treeData, hideOutcomes, hideLeafNodes]);

  const handleBatchDelete = () => {
    if (window.confirm(t.confirmDelete || 'Confirm delete?')) {
        onDeleteResources(Array.from(selectedResources));
    }
  };

  const handleUploadClick = (mbuId: string) => {
      setTargetMbuId(mbuId);
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && targetMbuId) {
          const file = e.target.files[0];
          // Simple detection logic since detecting full types is complex here without duplicating code
          const ext = file.name.split('.').pop()?.toLowerCase();
          let fType = 'File';
          if (['jpg','png','jpeg'].includes(ext || '')) fType = 'Image';
          else if (['xls','xlsx','csv'].includes(ext || '')) fType = 'Table';
          else if (['pdf','doc','docx'].includes(ext || '')) fType = 'Document';

          // Create resource node
          const newRes: ResourceNode = {
              id: `res-local-${Date.now()}`,
              name: file.name,
              type: 'artifact',
              meta: {
                  sourceType: 'local',
                  fileType: fType
              }
          };
          onAddResource(targetMbuId, newRes);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTargetMbuId(null);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 relative">
      {!hideHeader && (
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">
            <i className="fas fa-database mr-2"></i> {t.factsPanel}
          </h2>
          <p className="text-xs text-slate-500">{t.factsSubtitle}</p>
        </div>
      )}

      <div className="p-3 border-b border-slate-100 flex flex-col gap-3 bg-white">
        <div className="relative">
           <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs"></i>
           <input 
             type="text" 
             className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 transition-all"
             placeholder={t.searchResources}
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        {!isReadOnly && (
          <div className="flex gap-2">
              <button 
                onClick={onOpenAddResourcePage}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 px-3 rounded-md flex items-center justify-center transition-colors shadow-sm font-medium"
              >
                <i className="fas fa-plus mr-1.5"></i> {t.addResource}
              </button>
              <button 
                  onClick={() => (window as any).dispatchEvent(new CustomEvent('bulk-select', { detail: getAllIds(displayedNodes) }))}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs py-2 px-3 rounded-md flex items-center justify-center transition-colors shadow-sm"
                  title={t.selectAll}
              >
               <i className="fas fa-check-double"></i>
              </button>
              {selectedResources.size > 0 && (
                  <button 
                      onClick={handleBatchDelete}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-xs py-2 px-3 rounded-md flex items-center justify-center transition-colors shadow-sm"
                      title={t.batchDelete}
                  >
                  <i className="fas fa-trash-alt"></i>
                  </button>
              )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
         {displayedNodes.map(node => (
            <TreeNode 
              key={node.id} 
              node={node} 
              level={0}
              selectedResources={selectedResources}
              onToggleResource={onToggleResource}
              onSelectNode={onSelectNode}
              selectedNodeId={selectedNodeId}
              onDelete={(id) => onDeleteResources([id])}
              onUpload={handleUploadClick}
              onTogglePublic={onTogglePublic}
              lang={lang}
              searchTerm={searchTerm}
              isReadOnly={isReadOnly}
            />
         ))}
      </div>

      {/* Object Instance Selection */}
      {!hideObjectInstance && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 relative" ref={instanceDropdownRef}>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t.objectInstance}</label>
            <div className="relative">
                <i className="fas fa-bullseye absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-500 z-10"></i>
                
                <button 
                    onClick={() => setIsInstanceDropdownOpen(!isInstanceDropdownOpen)}
                    className="w-full pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm text-left truncate font-medium text-slate-700 min-h-[38px]"
                >
                    {getSelectedLabel()}
                </button>
                
                <i className={`fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs pointer-events-none transition-transform ${isInstanceDropdownOpen ? 'rotate-180' : ''}`}></i>
  
                {isInstanceDropdownOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                        {instanceOptions.map(opt => (
                            <div 
                                key={opt.value}
                                className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center"
                                onClick={() => toggleInstance(opt.value)}
                            >
                                <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center transition-colors ${selectedInstances.includes(opt.value) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                    {selectedInstances.includes(opt.value) && <i className="fas fa-check text-white text-[10px]"></i>}
                                </div>
                                <span className="text-sm text-slate-700">{opt.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      )}
      
      <div className="p-2 bg-slate-100 text-[10px] text-slate-400 border-t border-slate-200 text-center font-medium">
        {selectedResources.size} {t.itemsSelected}
      </div>

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
    </div>
  );
};