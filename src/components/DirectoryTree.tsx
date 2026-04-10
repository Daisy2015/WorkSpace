import React, { useState, useMemo } from 'react';
import { ResourceNode, Language } from '../types';
import { translations } from '../i18n';

interface DirectoryTreeProps {
  treeData: ResourceNode[];
  selectedResources: Set<string>;
  onToggleResource: (id: string, node: ResourceNode) => void;
  onSelectNode: (node: ResourceNode) => void;
  selectedNodeId?: string;
  lang: Language;
  maxLevel?: number;
}

const filterTreeByLevel = (nodes: ResourceNode[], currentLevel: number, maxLevel: number): ResourceNode[] => {
  if (currentLevel >= maxLevel) return [];
  return nodes.map(node => ({
    ...node,
    children: node.children ? filterTreeByLevel(node.children, currentLevel + 1, maxLevel) : undefined
  })).filter(node => node.type !== 'artifact' || (node.children && node.children.length > 0)); 
};

const DirectoryTreeNode: React.FC<{
  node: ResourceNode;
  level: number;
  selectedResources: Set<string>;
  onToggleResource: (id: string, node: ResourceNode) => void;
  onSelectNode: (node: ResourceNode) => void;
  selectedNodeId?: string;
  lang: Language;
}> = ({ node, level, selectedResources, onToggleResource, onSelectNode, selectedNodeId, lang }) => {
  const [expanded, setExpanded] = useState(true);
  const isSelected = selectedResources.has(node.id);
  const isCurrent = selectedNodeId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
    onSelectNode(node);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggleResource(node.id, node);
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
          <i className="fas fa-map-marker-alt mr-2 text-sm w-4 text-center flex-shrink-0 text-indigo-500"></i>
          <span className={`text-sm truncate ${isCurrent ? 'text-blue-700 font-bold' : 'text-slate-700'}`}>
            {node.name}
          </span>
        </div>
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children!.map(child => (
            <DirectoryTreeNode 
              key={child.id} 
              node={child} 
              level={level + 1}
              selectedResources={selectedResources}
              onToggleResource={onToggleResource}
              onSelectNode={onSelectNode}
              selectedNodeId={selectedNodeId}
              lang={lang}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const DirectoryTree: React.FC<DirectoryTreeProps> = ({ 
  treeData, 
  selectedResources, 
  onToggleResource, 
  onSelectNode,
  selectedNodeId,
  lang,
  maxLevel = 4
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');

  const displayedNodes = useMemo(() => {
    const levelFiltered = filterTreeByLevel(treeData, 0, maxLevel);
    if (!searchTerm) return levelFiltered;
    
    const searchFilter = (nodes: ResourceNode[]): ResourceNode[] => {
      return nodes.reduce((acc: ResourceNode[], node) => {
        const matches = node.name.toLowerCase().includes(searchTerm.toLowerCase());
        const filteredChildren = node.children ? searchFilter(node.children) : [];
        if (matches || filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children });
        }
        return acc;
      }, []);
    };
    return searchFilter(levelFiltered);
  }, [treeData, searchTerm, maxLevel]);

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200">
      <div className="p-3 border-b border-slate-100 bg-white">
        <div className="relative">
           <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs"></i>
           <input 
             type="text" 
             className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
             placeholder={t.searchResources}
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {displayedNodes.map(node => (
          <DirectoryTreeNode 
            key={node.id} 
            node={node} 
            level={0}
            selectedResources={selectedResources}
            onToggleResource={onToggleResource}
            onSelectNode={onSelectNode}
            selectedNodeId={selectedNodeId}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
};
