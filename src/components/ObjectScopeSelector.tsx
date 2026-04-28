
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';

interface ObjectScopeSelectorProps {
  selectedObjects: string[];
  onChange: (objects: string[]) => void;
  lang: Language;
}

type ObjectType = 'oilfield' | 'block' | 'well' | '';

interface SelectionRow {
  id: string;
  type: ObjectType;
  instances: string[];
}

const OBJECT_TYPES = [
  { id: 'oilfield', label: '油气田', icon: 'fa-layer-group' },
  { id: 'block', label: '区块', icon: 'fa-vector-square' },
  { id: 'well', label: '井', icon: 'fa-bore-hole' },
];

const INSTANCE_DATA: Record<string, string[]> = {
  oilfield: ['大庆油气田', '塔里木油气田', '胜利油气田', '长庆油气田', '西南气田'],
  block: ['苏里格区块', '塔中区块', '哈拉哈塘区块', '玛湖区块'],
  well: ['X-1 井', 'X-2 井', 'X-3 井', 'Y-1 井', 'Y-2 井', 'Z-101 井'],
};

export const ObjectScopeSelector: React.FC<ObjectScopeSelectorProps> = ({ selectedObjects, onChange, lang }) => {
  const [rows, setRows] = useState<SelectionRow[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Initialize from props if empty
  useEffect(() => {
    if (rows.length === 0 && selectedObjects.length > 0) {
      // Map existing strings to rows by proximity
      const typeGroups: Record<ObjectType, string[]> = { oilfield: [], block: [], well: [], '': [] };
      selectedObjects.forEach(obj => {
        if (obj.includes('油气田')) typeGroups.oilfield.push(obj);
        else if (obj.includes('区块')) typeGroups.block.push(obj);
        else if (obj.includes('井')) typeGroups.well.push(obj);
      });

      const initialRows: SelectionRow[] = Object.entries(typeGroups)
        .filter(([type, items]) => items.length > 0)
        .map(([type, items], idx) => ({
          id: `row-${idx}`,
          type: type as ObjectType,
          instances: items
        }));
      
      setRows(initialRows.length > 0 ? initialRows : [{ id: 'row-0', type: '', instances: [] }]);
    } else if (rows.length === 0) {
      setRows([{ id: 'row-0', type: '', instances: [] }]);
    }
  }, []);

  const handleAddRow = () => {
    const usedTypes = rows.map(r => r.type);
    const available = OBJECT_TYPES.find(t => !usedTypes.includes(t.id as any));
    if (!available) return;
    
    setRows([...rows, { id: `row-${Date.now()}`, type: '', instances: [] }]);
  };

  const handleRemoveRow = (id: string) => {
    const newRows = rows.filter(r => r.id !== id);
    setRows(newRows.length > 0 ? newRows : [{ id: `row-${Date.now()}`, type: '', instances: [] }]);
    updateParent(newRows);
  };

  const handleTypeChange = (id: string, type: ObjectType) => {
    const newRows = rows.map(r => r.id === id ? { ...r, type, instances: [] } : r);
    setRows(newRows);
    updateParent(newRows);
  };

  const toggleInstance = (rowId: string, instance: string) => {
    const newRows = rows.map(r => {
      if (r.id === rowId) {
        const next = r.instances.includes(instance) 
          ? r.instances.filter(i => i !== instance)
          : [...r.instances, instance];
        return { ...r, instances: next };
      }
      return r;
    });
    setRows(newRows);
    updateParent(newRows);
  };

  const updateParent = (currentRows: SelectionRow[]) => {
    const allSelected = currentRows.flatMap(r => r.instances);
    onChange(allSelected);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">对象范围配置</label>
        <button 
          onClick={handleAddRow}
          disabled={rows.length >= OBJECT_TYPES.length}
          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-30 flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-all"
        >
          <i className="fas fa-plus-circle"></i>
          添加对象选择
        </button>
      </div>

      <div className="space-y-4">
        {rows.map((row) => {
          const usedTypes = rows.filter(r => r.id !== row.id).map(r => r.type);
          const availableOptions = OBJECT_TYPES.filter(t => !usedTypes.includes(t.id as any));
          const instancesList = row.type ? INSTANCE_DATA[row.type] : [];

          return (
            <div key={row.id} className="bg-slate-50/50 border border-slate-200 rounded-2xl p-3 space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="flex items-center gap-3">
                {/* Type Select */}
                <div className="w-[100px] relative group shrink-0">
                  <select
                    value={row.type}
                    onChange={(e) => handleTypeChange(row.id, e.target.value as ObjectType)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">选择类型</option>
                    {availableOptions.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                    {row.type && !availableOptions.find(o => o.id === row.type) && (
                      <option value={row.type}>{OBJECT_TYPES.find(ot => ot.id === row.type)?.label}</option>
                    )}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <i className="fas fa-chevron-down text-[10px]"></i>
                  </div>
                </div>

                {/* Multi-Instance Selection Visual */}
                <div className="flex-1 min-w-0">
                  <div 
                    onClick={() => row.type && setActiveDropdown(activeDropdown === row.id ? null : row.id)}
                    className={`min-h-[36px] bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex flex-wrap gap-1.5 cursor-pointer hover:border-slate-300 transition-all ${!row.type ? 'opacity-50 cursor-not-allowed' : ''} ${activeDropdown === row.id ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}`}
                  >
                    {row.instances.length > 0 ? (
                      row.instances.map(inst => (
                        <span key={inst} className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5 whitespace-nowrap">
                          {inst}
                          <i 
                            className="fas fa-times hover:text-indigo-800" 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleInstance(row.id, inst);
                            }}
                          ></i>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 py-1">{row.type ? '选择对象实例...' : '请先选择类型'}</span>
                    )}
                  </div>

                  {/* Dropdown for Instances */}
                  {activeDropdown === row.id && row.type && (
                    <div className="absolute z-20 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-2 min-w-[200px] animate-in fade-in zoom-in-95 duration-200">
                      <div className="max-h-48 overflow-y-auto custom-scrollbar">
                        {instancesList.map(inst => (
                          <div 
                            key={inst}
                            onClick={() => toggleInstance(row.id, inst)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${row.instances.includes(inst) ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'}`}
                          >
                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${row.instances.includes(inst) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                              {row.instances.includes(inst) && <i className="fas fa-check text-[8px]"></i>}
                            </div>
                            <span className="text-xs font-medium">{inst}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                <button 
                  onClick={() => handleRemoveRow(row.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all shrink-0"
                >
                  <i className="fas fa-trash-alt text-xs"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {rows.length === 0 && (
        <div className="p-8 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
            <i className="fas fa-object-group text-2xl"></i>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">尚未配置对象范围，点击上方“添加”开始配置</p>
        </div>
      )}

      {/* Global Click Handler to close dropdown */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};


