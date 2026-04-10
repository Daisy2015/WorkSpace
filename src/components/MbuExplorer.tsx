
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, ResourceNode } from '../types';
import { translations } from '../i18n';

interface MbuExplorerProps {
  lang: Language;
  selectedNode: ResourceNode | null;
  onSelectMbus: (ids: string[]) => void;
  selectedMbuIds: Set<string>;
  objectScope: any[];
  setObjectScope: React.Dispatch<React.SetStateAction<any[]>>;
}

type GenerationMethod = 'template' | 'missing_input' | 'subgraph' | 'similar' | 'version' | 'all';

interface MbuItem {
  id: string;
  nodeName: string;
  outcomeName: string;
  method: Exclude<GenerationMethod, 'all'>;
}

export const MbuExplorer: React.FC<MbuExplorerProps> = ({ 
  lang, 
  selectedNode, 
  onSelectMbus,
  selectedMbuIds,
  objectScope,
  setObjectScope
}) => {
  const t = translations[lang];
  const [filterMethod, setFilterMethod] = useState<GenerationMethod>('all');

  // Mock data for MBUs based on the selected node
  const [localMbuData, setLocalMbuData] = useState<MbuItem[]>([]);

  React.useEffect(() => {
    if (!selectedNode) {
      setLocalMbuData([]);
      return;
    }
    
    // Generate some mock MBUs for the selected domain/directory
    const baseName = selectedNode.name.split(' (')[0]; // Remove count from name
    setLocalMbuData([
      { id: `${selectedNode.id}-m1`, nodeName: baseName, outcomeName: `${baseName} - 基础参数集`, method: 'template' },
      { id: `${selectedNode.id}-m2`, nodeName: baseName, outcomeName: `${baseName} - 缺失项补全`, method: 'missing_input' },
      { id: `${selectedNode.id}-m3`, nodeName: baseName, outcomeName: `${baseName} - 关联子图节点`, method: 'subgraph' },
      { id: `${selectedNode.id}-m4`, nodeName: baseName, outcomeName: `${baseName} - 相似方案参考`, method: 'similar' },
      { id: `${selectedNode.id}-m5`, nodeName: baseName, outcomeName: `${baseName} - 历史版本对比`, method: 'version' },
    ]);
  }, [selectedNode]);

  const filteredMbus = useMemo(() => {
    if (filterMethod === 'all') return localMbuData;
    return localMbuData.filter(m => m.method === filterMethod);
  }, [localMbuData, filterMethod]);

  const handleDeleteMbu = (id: string) => {
    setLocalMbuData(prev => prev.filter(m => m.id !== id));
    if (selectedMbuIds.has(id)) {
      const next = new Set(selectedMbuIds);
      next.delete(id);
      onSelectMbus(Array.from(next));
    }
  };

  const handleBatchDelete = () => {
    setLocalMbuData(prev => prev.filter(m => !selectedMbuIds.has(m.id)));
    onSelectMbus([]);
  };

  const handleDeleteObject = (groupId: string, itemIndex: number) => {
    setObjectScope(prev => prev.map(group => {
      if (group.id === groupId) {
        const nextItems = [...group.items];
        nextItems.splice(itemIndex, 1);
        return { ...group, items: nextItems };
      }
      return group;
    }));
  };

  const handleToggleMbu = (id: string) => {
    const next = new Set(selectedMbuIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectMbus(Array.from(next));
  };

  const getMethodLabel = (method: GenerationMethod) => {
    switch (method) {
      case 'template': return lang === 'zh' ? '来自模版' : 'From Template';
      case 'missing_input': return lang === 'zh' ? '来自缺失输入' : 'From Missing Input';
      case 'subgraph': return lang === 'zh' ? '来自子图推理' : 'From Subgraph';
      case 'similar': return lang === 'zh' ? '来自相似方案' : 'From Similar';
      case 'version': return lang === 'zh' ? '不同版本' : 'Different Versions';
      default: return lang === 'zh' ? '全部方式' : 'All Methods';
    }
  };

  const getMethodColor = (method: GenerationMethod) => {
    switch (method) {
      case 'template': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'missing_input': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'subgraph': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'similar': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'version': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden h-full">
      {/* Top Section: Object Scope */}
      <div className="p-6 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-bullseye text-indigo-500"></i>
            {lang === 'zh' ? '对象范围' : 'Object Scope'}
          </h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors">
              {lang === 'zh' ? '添加对象' : 'Add Object'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          {objectScope.map((group) => (
            <div key={group.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">{group.label}</span>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((item, iIdx) => (
                  <span key={iIdx} className={`group/item relative px-2 py-0.5 rounded text-[10px] font-medium bg-${group.color}-50 text-${group.color}-600 border border-${group.color}-100 flex items-center gap-1`}>
                    {item}
                    {group.deletable && (
                      <button 
                        onClick={() => handleDeleteObject(group.id, iIdx)}
                        className="opacity-0 group-hover/item:opacity-100 hover:text-red-600 transition-opacity"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </span>
                ))}
                {group.items.length === 0 && (
                  <span className="text-[10px] text-slate-300 italic">{lang === 'zh' ? '暂无对象' : 'No objects'}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Section: MBU List */}
      <div className="flex-1 flex flex-col overflow-hidden p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-bold text-slate-800">
              {selectedNode ? `${selectedNode.name} - ${lang === 'zh' ? '业务节点列表' : 'MBU List'}` : (lang === 'zh' ? '请选择目录' : 'Select a directory')}
            </h3>
            <div className="h-4 w-px bg-slate-300 mx-1" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{lang === 'zh' ? '产生方式筛选:' : 'Filter by Method:'}</span>
              <select 
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value as GenerationMethod)}
                className="text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">{getMethodLabel('all')}</option>
                <option value="template">{getMethodLabel('template')}</option>
                <option value="missing_input">{getMethodLabel('missing_input')}</option>
                <option value="subgraph">{getMethodLabel('subgraph')}</option>
                <option value="similar">{getMethodLabel('similar')}</option>
                <option value="version">{getMethodLabel('version')}</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{selectedMbuIds.size} {lang === 'zh' ? '项已选择' : 'items selected'}</span>
            <button 
              onClick={handleBatchDelete}
              className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              disabled={selectedMbuIds.size === 0}
            >
              <i className="fas fa-trash-alt"></i>
              {lang === 'zh' ? '批量删除' : 'Batch Delete'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <th className="p-4 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={filteredMbus.length > 0 && filteredMbus.every(m => selectedMbuIds.has(m.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onSelectMbus([...Array.from(selectedMbuIds), ...filteredMbus.map(m => m.id)]);
                      } else {
                        onSelectMbus(Array.from(selectedMbuIds).filter(id => !filteredMbus.some(m => m.id === id)));
                      }
                    }}
                  />
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === 'zh' ? '节点名称' : 'Node Name'}</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === 'zh' ? '成果名称' : 'Outcome Name'}</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === 'zh' ? '产生方式' : 'Method'}</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-20 text-center">{lang === 'zh' ? '操作' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredMbus.map((mbu) => (
                <tr 
                  key={mbu.id} 
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group/row ${selectedMbuIds.has(mbu.id) ? 'bg-indigo-50/30' : ''}`}
                  onClick={() => handleToggleMbu(mbu.id)}
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedMbuIds.has(mbu.id)}
                      onChange={() => handleToggleMbu(mbu.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{mbu.nodeName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{mbu.id}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">{mbu.outcomeName}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getMethodColor(mbu.method)}`}>
                      {getMethodLabel(mbu.method)}
                    </span>
                  </td>
                  <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => handleDeleteMbu(mbu.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover/row:opacity-100"
                      title={lang === 'zh' ? '删除' : 'Delete'}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMbus.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 italic text-sm">
                    {lang === 'zh' ? '暂无业务节点' : 'No business nodes found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
