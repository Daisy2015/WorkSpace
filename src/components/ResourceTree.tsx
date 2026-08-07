import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ResourceNode, Language, SavedOutcome } from '../types';
import { translations } from '../i18n';

interface ResourceTreeProps {
  treeData: ResourceNode[];
  selectedResources: Set<string>;
  onToggleResource: (id: string, node: ResourceNode) => void;
  onSelectNode: (node: ResourceNode) => void;
  selectedNodeId?: string;
  onAddResource: (parentId: string, resource: ResourceNode) => void;
  onDeleteResources: (ids: string[]) => void;
  onTogglePublic: (id: string, node: ResourceNode) => void;
  onOpenAddResourcePage: () => void;
  lang: Language;
  hideCheckboxes?: boolean;
  isSmartReport?: boolean;
  savedOutcomes?: SavedOutcome[];
  onDeleteOutcome?: (id: string) => void;
  onRenameOutcome?: (id: string, newName: string) => void;
  onShowOriginalChat?: (outcome: SavedOutcome) => void;
  onSelectOutcome?: (outcome: SavedOutcome) => void;
  onOpenInterestModal?: () => void;
  isResourceScopeInitialized?: boolean;
  interestTags?: {
    businessContent: string[];
    workTypes: string[];
    businessObjects: string[];
  };
  objects?: any[];
  onClearObjects?: () => void;
  onRemoveObject?: (id: string) => void;
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

const ResourceTreeNode: React.FC<{
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
  hideCheckboxes?: boolean;
}> = ({ node, level, selectedResources, onToggleResource, onSelectNode, selectedNodeId, onDelete, onUpload, onTogglePublic, lang, searchTerm, hideCheckboxes }) => {
  const [expanded, setExpanded] = useState(true);
  const isSelected = selectedResources.has(node.id);
  const isCurrent = selectedNodeId === node.id;
  const hasChildren = node.children && node.children.length > 0;
  const t = translations[lang];

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
    onSelectNode(node);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggleResource(node.id, node);
  };

  const getIcon = () => {
    if (node.meta?.customIcon) {
      return node.meta.customIcon;
    }
    if (node.meta?.isArtifactOutcome) {
      return 'fa-gem text-amber-500 shimmer-effect';
    }
    if (node.type === 'folder' || node.type === 'mbu' || node.type === 'domain') {
      if (node.id === 'mbu-resources' || node.id === 'current-chapter-resources') {
        return 'fa-briefcase text-indigo-500';
      }
      return 'fa-folder text-amber-500';
    }
    const name = node.name.toLowerCase();
    if (node.meta?.fileType === 'Outcome' || node.type === 'artifact') {
        if (name.includes('文档') || name.includes('.docx') || name.includes('.pdf')) return 'fa-file-alt text-blue-500';
        if (name.includes('表格') || name.includes('.xlsx') || name.includes('.csv')) return 'fa-file-excel text-green-600';
        if (name.includes('图片') || name.includes('.png') || name.includes('.jpg')) return 'fa-file-image text-purple-500';
        if (name.includes('.segy') || name.includes('.las')) return 'fa-wave-square text-cyan-500';
        if (name.includes('.py')) return 'fa-code text-teal-600';
        return 'fa-file text-slate-500';
    }
    return 'fa-map-marker-alt text-indigo-500';
  };

  const getSourceBadge = () => {
    const type = node.meta?.sourceType;
    if (type === 'web') return <i className="fas fa-globe text-cyan-500" title={t.typeWeb}></i>;
    if (type === 'local') return <i className="fas fa-arrow-up text-orange-500" title={t.local}></i>;
    if (type === 'system') return <i className="fas fa-server text-indigo-400" title={t.system}></i>;
    return null;
  };

  return (
    <div className="select-none">
      <div 
        className={`group flex items-center py-2 px-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? 'bg-blue-50/50' : ''} ${isCurrent ? 'bg-white shadow-sm ring-1 ring-blue-200' : ''}`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => onSelectNode(node)}
      >
        <div className="w-4 flex-shrink-0 flex justify-center mr-1" onClick={handleToggle}>
          {hasChildren && (
            <i className={`fas fa-chevron-right text-xs text-slate-400 transform transition-transform ${expanded ? 'rotate-90' : ''}`}></i>
          )}
        </div>

        {!hideCheckboxes && (
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            className="mr-2 h-3.5 w-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 flex-shrink-0"
          />
        )}

        <div className="flex items-center flex-1 min-w-0">
          <i className={`fas ${getIcon()} mr-2 text-sm w-4 text-center flex-shrink-0`}></i>
          <span className={`text-sm truncate ${isCurrent ? 'text-blue-700 font-bold' : 'text-slate-700'}`}>
            {node.name}
          </span>
          {node.meta?.fileType === 'Outcome' && (
             <span className="ml-2 text-xs flex-shrink-0 opacity-70 scale-90">{getSourceBadge()}</span>
          )}
        </div>

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
          {node.type !== 'artifact' && (
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
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children!.map(child => (
            <ResourceTreeNode 
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
              hideCheckboxes={hideCheckboxes}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ResourceTree: React.FC<ResourceTreeProps> = ({ 
  treeData, 
  selectedResources, 
  onToggleResource, 
  onSelectNode,
  selectedNodeId,
  onAddResource, 
  onDeleteResources,
  onTogglePublic,
  onOpenAddResourcePage,
  lang,
  hideCheckboxes = false,
  isSmartReport = false,
  savedOutcomes = [],
  onDeleteOutcome,
  onRenameOutcome,
  onShowOriginalChat,
  onSelectOutcome,
  onOpenInterestModal,
  isResourceScopeInitialized = true,
  interestTags,
  objects,
  onClearObjects,
  onRemoveObject,
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetMbuId, setTargetMbuId] = useState<string | null>(null);

  // Section collapse states
  const [isObjectScopeExpanded, setIsObjectScopeExpanded] = useState(true);
  const [isOutcomesExpanded, setIsOutcomesExpanded] = useState(true);

  // Action menu and rename states for outcomes
  const [activeMenuOutcomeId, setActiveMenuOutcomeId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [renamingOutcome, setRenamingOutcome] = useState<SavedOutcome | null>(null);
  const [renameInput, setRenameInput] = useState('');

  // Default internal demo outcomes if none passed from props
  const [localOutcomes, setLocalOutcomes] = useState<SavedOutcome[]>([
    { id: 'outcome-1', name: '钻井工程设计与安全风险评估报告', date: '2026-08-04 14:30', isPublic: true },
    { id: 'outcome-2', name: '油藏动态分析及产能预测图表', date: '2026-08-05 09:15', isPublic: false }
  ]);

  const outcomesList = savedOutcomes !== undefined ? savedOutcomes : localOutcomes;

  useEffect(() => {
    if (!activeMenuOutcomeId) return;
    const handleOutsideClick = () => {
      setActiveMenuOutcomeId(null);
      setMenuPos(null);
    };
    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('scroll', handleOutsideClick, true);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('scroll', handleOutsideClick, true);
    };
  }, [activeMenuOutcomeId]);

  const handleDeleteOutcome = (id: string) => {
    if (onDeleteOutcome) {
      onDeleteOutcome(id);
    } else {
      setLocalOutcomes(prev => prev.filter(o => o.id !== id));
    }
  };

  const handleRenameOutcome = (id: string, newName: string) => {
    if (onRenameOutcome) {
      onRenameOutcome(id, newName);
    } else {
      setLocalOutcomes(prev => prev.map(o => o.id === id ? { ...o, name: newName } : o));
    }
  };

  const handleShowOriginalChat = (item: SavedOutcome) => {
    if (onShowOriginalChat) {
      onShowOriginalChat(item);
    } else {
      (window as any).dispatchEvent(new CustomEvent('show-original-chat', { detail: item }));
    }
  };

  // Group objects for Object Scope section
  const groupedObjects = useMemo<Record<string, any[]>>(() => {
    const rawObjects = (objects && objects.length > 0)
      ? objects
      : (interestTags?.businessObjects?.map(name => ({ id: `obj-${name}`, label: name })) || []);

    if (rawObjects.length === 0) return {};

    return rawObjects.reduce((acc: Record<string, any[]>, rawObj: any) => {
      let label = '';
      let id = '';
      let rawType = '';

      if (typeof rawObj === 'string') {
        label = rawObj;
        id = `obj-${rawObj}`;
      } else {
        label = rawObj.label || rawObj.name || (lang === 'zh' ? '未命名对象' : 'Unnamed Object');
        id = rawObj.id || `obj-${label}`;
        rawType = rawObj.type || '';
      }

      // Determine clean category / object type (filter out generic "关注对象" / "Focus Objects")
      let category = '';
      if (rawType && rawType !== '关注对象' && rawType !== 'Focus Objects' && rawType !== '通用对象' && rawType !== 'General') {
        category = rawType;
      } else {
        const lower = label.toLowerCase();
        if (label.includes('井') || lower.includes('well')) {
          category = lang === 'zh' ? '单井对象' : 'Wells';
        } else if (label.includes('区块') || lower.includes('block')) {
          category = lang === 'zh' ? '区块对象' : 'Blocks';
        } else if (label.includes('层') || label.includes('长') || lower.includes('formation')) {
          category = lang === 'zh' ? '地层对象' : 'Formations';
        } else if (label.includes('油藏') || lower.includes('reservoir')) {
          category = lang === 'zh' ? '油藏对象' : 'Reservoirs';
        } else if (label.includes('专家') || label.includes('局') || label.includes('组') || label.includes('院')) {
          category = lang === 'zh' ? '组织架构' : 'Organizations';
        } else {
          category = lang === 'zh' ? '业务对象' : 'Business Objects';
        }
      }

      if (!acc[category]) acc[category] = [];
      acc[category].push({ id, label, category });
      return acc;
    }, {});
  }, [objects, interestTags?.businessObjects, lang]);

  const objectsTotalCount = useMemo(() => {
    return Object.values(groupedObjects).reduce((sum, arr) => sum + arr.length, 0);
  }, [groupedObjects]);

  const displayedNodes = useMemo(() => {
    const filter = (nodes: ResourceNode[]): ResourceNode[] => {
      return nodes.reduce((acc: ResourceNode[], node) => {
        const matches = node.name.toLowerCase().includes(searchTerm.toLowerCase());
        const filteredChildren = node.children ? filter(node.children) : [];
        if (matches || filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children });
        }
        return acc;
      }, []);
    };
    return filter(treeData);
  }, [treeData, searchTerm]);

  const handleUploadClick = (mbuId: string) => {
      setTargetMbuId(mbuId);
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && targetMbuId) {
          const file = e.target.files[0];
          const newRes: ResourceNode = {
              id: `res-local-${Date.now()}`,
              name: file.name,
              type: 'artifact',
              meta: {
                  sourceType: 'local',
                  fileType: 'Outcome',
                  isPublic: false
              }
          };
          onAddResource(targetMbuId, newRes);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTargetMbuId(null);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 overflow-hidden">
      
      {/* ---------------------------------------------------- */}
      {/* SECTION 1: 数据资源 (Data Resources)                 */}
      {/* ---------------------------------------------------- */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Section Header */}
        <div className="px-3.5 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between flex-shrink-0 select-none">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 text-xs shadow-2xs">
              <i className="fas fa-database text-[11px]"></i>
            </div>
            <h3 className="text-xs font-bold text-slate-700 tracking-tight">
              {lang === 'zh' ? '数据资源' : 'Data Resources'}
            </h3>
            <span className="px-1.5 py-0.2 text-[10px] font-bold bg-indigo-100 text-indigo-800 rounded-full">
              {displayedNodes.length}
            </span>
          </div>
        </div>

        {/* Controls & Banner Area */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/30 flex flex-col gap-2.5 flex-shrink-0">
          {!isResourceScopeInitialized && onOpenInterestModal && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/90 rounded-xl p-2.5 shadow-xs flex flex-col gap-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                <span className="flex items-center gap-1.5 text-indigo-700">
                  <i className="fas fa-compass text-indigo-600"></i>
                  {lang === 'zh' ? '尚未设置资源范围' : 'Scope Not Set'}
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">
                  {lang === 'zh' ? '建议配置' : 'Recommended'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {lang === 'zh' ? '选择关注业务内容，系统将自动匹配准备相关业务资源。' : 'Select business content to auto-generate scope.'}
              </p>
              <button
                type="button"
                onClick={onOpenInterestModal}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <i className="fas fa-sliders-h text-[10px]"></i>
                <span>{lang === 'zh' ? '设置关注范围' : 'Set Focus Scope'}</span>
              </button>
            </div>
          )}

          <div className="relative group">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-[10px] group-focus-within:text-blue-500 transition-colors"></i>
            <input 
              type="text" 
              className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
              placeholder={t.searchResources}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-1.5">
            <button 
              onClick={onOpenAddResourcePage}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] py-1.5 px-2.5 rounded-lg flex items-center justify-center transition-all shadow-sm font-bold active:scale-95 cursor-pointer"
            >
              <i className="fas fa-plus mr-1 text-[10px]"></i> {t.addResource}
            </button>
            <button 
              onClick={() => (window as any).dispatchEvent(new CustomEvent('bulk-select', { detail: getAllIds(displayedNodes) }))}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] py-1.5 px-2.5 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
              title={t.selectAll}
            >
              <i className="fas fa-check-double text-[10px]"></i>
            </button>
            {selectedResources.size > 0 && (
              <button 
                onClick={() => {
                  if (window.confirm(t.confirmDelete || 'Confirm delete?')) {
                    onDeleteResources(Array.from(selectedResources));
                  }
                }}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-[11px] py-1.5 px-2.5 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
                title={t.batchDelete}
              >
                <i className="fas fa-trash-alt text-[10px]"></i>
              </button>
            )}
          </div>
        </div>

        {/* Tree List Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
          {displayedNodes.length > 0 ? (
            displayedNodes.map(node => (
              <ResourceTreeNode 
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
                hideCheckboxes={hideCheckboxes}
              />
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              <i className="fas fa-folder-open text-slate-300 text-lg mb-1 block"></i>
              {lang === 'zh' ? '暂无匹配数据资源' : 'No resources found'}
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 2: 对象范围 (Object Scope)                    */}
      {/* ---------------------------------------------------- */}
      <div className="border-t border-slate-200 bg-white flex flex-col flex-shrink-0">
        <div 
          onClick={() => setIsObjectScopeExpanded(!isObjectScopeExpanded)}
          className="px-3.5 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 text-xs shadow-2xs">
              <i className="fas fa-cubes text-[11px]"></i>
            </div>
            <h3 className="text-xs font-bold text-slate-700 tracking-tight">
              {lang === 'zh' ? '对象范围' : 'Object Scope'}
            </h3>
            <span className="px-1.5 py-0.2 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-full">
              {objectsTotalCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isObjectScopeExpanded && objectsTotalCount > 0 && onClearObjects && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearObjects();
                }}
                className="text-[10px] text-slate-400 hover:text-red-500 transition-colors"
                title={lang === 'zh' ? '清空全部对象' : 'Clear All'}
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            )}
            <i className={`fas fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${isObjectScopeExpanded ? 'rotate-180' : ''}`}></i>
          </div>
        </div>

        {isObjectScopeExpanded && (
          <div className="max-h-[320px] overflow-y-auto custom-scrollbar p-2.5 space-y-2.5 bg-slate-50/30">
            {Object.keys(groupedObjects).length > 0 ? (
              Object.entries(groupedObjects).map(([category, items]: [string, any]) => {
                let catIcon = 'fa-cube';
                if (category.includes('井') || category.toLowerCase().includes('well')) catIcon = 'fa-bore-hole';
                else if (category.includes('区块') || category.toLowerCase().includes('block')) catIcon = 'fa-vector-square';
                else if (category.includes('层') || category.toLowerCase().includes('formation')) catIcon = 'fa-layer-group';
                else if (category.includes('油藏') || category.toLowerCase().includes('reservoir')) catIcon = 'fa-water';
                else if (category.includes('组织') || category.includes('机构')) catIcon = 'fa-sitemap';

                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                      <i className={`fas ${catIcon} text-[10px] text-blue-500`}></i>
                      <span>{category}</span>
                      <span className="text-[10px] font-semibold text-slate-400">({items.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-2">
                      {items.map((obj: any) => (
                        <div 
                          key={obj.id}
                          className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs text-xs transition-all"
                        >
                          <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[140px]">{obj.label}</span>
                          {onRemoveObject && (
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onRemoveObject(obj.id); }}
                              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer opacity-70 group-hover:opacity-100"
                              title={lang === 'zh' ? '移除该对象' : 'Remove object'}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-3 text-center text-xs text-slate-400">
                <i className="fas fa-layer-group text-slate-300 text-sm mb-1 block"></i>
                {lang === 'zh' ? '暂未选择对象范围' : 'No object scope selected'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 3: 输出成果 (Output Artifacts)               */}
      {/* ---------------------------------------------------- */}
      <div className="border-t border-slate-200 bg-white flex flex-col flex-shrink-0">
        <div 
          onClick={() => setIsOutcomesExpanded(!isOutcomesExpanded)}
          className="px-3.5 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 text-xs shadow-2xs">
              <i className="fas fa-award text-[11px]"></i>
            </div>
            <h3 className="text-xs font-bold text-slate-700 tracking-tight">
              {lang === 'zh' ? '输出成果' : 'Output Artifacts'}
            </h3>
            <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
              {outcomesList.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <i className={`fas fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${isOutcomesExpanded ? 'rotate-180' : ''}`}></i>
          </div>
        </div>

        {isOutcomesExpanded && (
          <div className="max-h-[480px] min-h-[120px] overflow-y-auto custom-scrollbar p-2 pb-16 space-y-1.5 bg-slate-50/30">
            {outcomesList.length > 0 ? (
              outcomesList.map((item, index) => (
                <div 
                  key={item.id}
                  onClick={() => onSelectOutcome?.(item)}
                  className="group flex items-center justify-between p-2 bg-white hover:bg-amber-50/40 border border-slate-200/90 hover:border-amber-200/80 rounded-xl transition-all shadow-2xs cursor-pointer relative"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 text-xs flex-shrink-0 shadow-2xs">
                      <i className="fas fa-award text-[12px]"></i>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700 truncate">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>{item.date}</span>
                        {item.isPublic ? (
                          <span className="px-1 py-0.2 bg-emerald-50 text-emerald-600 border border-emerald-200/60 rounded text-[9px] font-medium">
                            {lang === 'zh' ? '公开' : 'Public'}
                          </span>
                        ) : (
                          <span className="px-1 py-0.2 bg-slate-100 text-slate-500 border border-slate-200 rounded text-[9px] font-medium">
                            {lang === 'zh' ? '私有' : 'Private'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Operation Menu Button */}
                  <div className="relative flex-shrink-0 ml-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeMenuOutcomeId === item.id) {
                          setActiveMenuOutcomeId(null);
                          setMenuPos(null);
                        } else {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const menuWidth = 144;
                          const menuHeight = 115;
                          const spaceBelow = window.innerHeight - rect.bottom;

                          let top = rect.bottom + 4;
                          if (spaceBelow < menuHeight) {
                            top = Math.max(8, rect.top - menuHeight);
                          }

                          let left = rect.right - menuWidth;
                          if (left < 8) left = 8;

                          setMenuPos({ top, left });
                          setActiveMenuOutcomeId(item.id);
                        }
                      }}
                      className="w-6 h-6 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                      title={lang === 'zh' ? '更多操作' : 'More options'}
                    >
                      <i className="fas fa-ellipsis-h text-xs"></i>
                    </button>

                    {activeMenuOutcomeId === item.id && menuPos && createPortal(
                      <div 
                        className="fixed z-[9999] w-36 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-1 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150"
                        style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuOutcomeId(null);
                            setMenuPos(null);
                            handleShowOriginalChat(item);
                          }}
                          className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                        >
                          <i className="far fa-comment-dots text-slate-500 text-xs w-4 text-center"></i>
                          <span>{lang === 'zh' ? '显示原始聊天' : 'Show Original Chat'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuOutcomeId(null);
                            setMenuPos(null);
                            setRenamingOutcome(item);
                            setRenameInput(item.name);
                          }}
                          className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                        >
                          <i className="fas fa-pen text-slate-500 text-xs w-4 text-center"></i>
                          <span>{lang === 'zh' ? '重命名' : 'Rename'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuOutcomeId(null);
                            setMenuPos(null);
                            handleDeleteOutcome(item.id);
                          }}
                          className="w-full px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                        >
                          <i className="fas fa-trash-alt text-rose-500 text-xs w-4 text-center"></i>
                          <span>{lang === 'zh' ? '移除' : 'Remove'}</span>
                        </button>
                      </div>,
                      document.body
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-3 text-center text-xs text-slate-400">
                <i className="fas fa-inbox text-slate-300 text-base mb-1 block"></i>
                {lang === 'zh' ? '暂无输出成果' : 'No output artifacts yet'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rename Modal */}
      {renamingOutcome && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setRenamingOutcome(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-pen text-amber-500"></i>
                {lang === 'zh' ? '重命名成果' : 'Rename Artifact'}
              </h3>
              <button 
                onClick={() => setRenamingOutcome(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors w-6 h-6 rounded-full flex items-center justify-center"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                {lang === 'zh' ? '成果名称' : 'Artifact Name'}
              </label>
              <input
                type="text"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && renameInput.trim()) {
                    handleRenameOutcome(renamingOutcome.id, renameInput.trim());
                    setRenamingOutcome(null);
                  }
                }}
                autoFocus
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
                placeholder={lang === 'zh' ? '请输入新的成果名称...' : 'Enter new name...'}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRenamingOutcome(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (renameInput.trim()) {
                    handleRenameOutcome(renamingOutcome.id, renameInput.trim());
                    setRenamingOutcome(null);
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                {lang === 'zh' ? '保存' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
    </div>
  );
};
