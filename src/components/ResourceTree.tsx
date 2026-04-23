import React, { useState, useMemo, useRef } from 'react';
import { ResourceNode, Language } from '../types';
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
}> = ({ node, level, selectedResources, onToggleResource, onSelectNode, selectedNodeId, onDelete, onUpload, onTogglePublic, lang, searchTerm }) => {
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
    if (node.meta?.isArtifactOutcome) {
      return 'fa-gem text-amber-500 shimmer-effect';
    }
    if (node.meta?.fileType === 'Outcome') {
        const name = node.name.toLowerCase();
        if (name.includes('文档')) return 'fa-file-alt text-blue-500';
        if (name.includes('表格')) return 'fa-file-excel text-green-600';
        if (name.includes('图片')) return 'fa-file-image text-purple-500';
        return 'fa-chart-bar text-emerald-500';
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

        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          className="mr-2 h-3.5 w-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 flex-shrink-0"
        />

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
  lang
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetMbuId, setTargetMbuId] = useState<string | null>(null);

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
          const ext = file.name.split('.').pop()?.toLowerCase();
          let fType = 'File';
          if (['jpg','png','jpeg'].includes(ext || '')) fType = 'Image';
          else if (['xls','xlsx','csv'].includes(ext || '')) fType = 'Table';
          else if (['pdf','doc','docx'].includes(ext || '')) fType = 'Document';

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
    <div className="h-full flex flex-col bg-white border-r border-slate-200">
      <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col gap-3">
        <div className="relative group">
           <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-[10px] group-focus-within:text-blue-500 transition-colors"></i>
           <input 
             type="text" 
             className="w-full pl-9 pr-3 py-2 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
             placeholder={t.searchResources}
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex gap-2">
            <button 
              onClick={onOpenAddResourcePage}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] py-2 px-3 rounded-lg flex items-center justify-center transition-all shadow-sm font-bold active:scale-95"
            >
              <i className="fas fa-plus mr-1.5 text-[10px]"></i> {t.addResource}
            </button>
            <button 
                onClick={() => (window as any).dispatchEvent(new CustomEvent('bulk-select', { detail: getAllIds(displayedNodes) }))}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] py-2 px-3 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-95"
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
                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-[11px] py-2 px-3 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-95"
                    title={t.batchDelete}
                >
                <i className="fas fa-trash-alt text-[10px]"></i>
                </button>
            )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
        {displayedNodes.map(node => (
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
          />
        ))}
      </div>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
    </div>
  );
};
