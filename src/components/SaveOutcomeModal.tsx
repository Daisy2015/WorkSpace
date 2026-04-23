import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResourceNode, Language } from '../types';

interface SaveOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    mbuId: string;
    outcomeType: string;
    name: string;
    isPublic: boolean;
    objectId?: string;
    isArtifactOutcome?: boolean;
  }) => void;
  resourceTree: ResourceNode[];
  initialName?: string;
  lang: Language;
  objectScope?: { id: string; label: string; items: string[] }[];
}

export const SaveOutcomeModal: React.FC<SaveOutcomeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  resourceTree,
  initialName = '',
  lang,
  objectScope = []
}) => {
  const isZh = lang === 'zh';
  const [mbuId, setMbuId] = useState('');
  const [outcomeType, setOutcomeType] = useState('');
  const [name, setName] = useState(initialName);
  const [isPublic, setIsPublic] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState('');

  // Extract all MBU nodes from the tree
  const mbuNodes = useMemo(() => {
    const nodes: { id: string, name: string }[] = [];
    const traverse = (tree: ResourceNode[]) => {
      tree.forEach(node => {
        if (node.type === 'mbu') {
          nodes.push({ id: node.id, name: node.name });
        }
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(resourceTree);
    return nodes;
  }, [resourceTree]);

  // Derived Outcome Types based on selected MBU
  const availableOutcomeTypes = useMemo(() => {
    if (!mbuId) return [];
    const selectedMbu = mbuNodes.find(n => n.id === mbuId);
    if (!selectedMbu) return [];
    
    const mbuName = selectedMbu.name;
    const mapping: Record<string, string[]> = {
      '钻井': isZh ? ['钻井设计方案', '工程设计报告', '施工日报'] : ['Drilling Design', 'Eng Report', 'Daily Log'],
      '完井': isZh ? ['完井总结报告', '施工设计', '工具清单'] : ['Completion Summary', 'Completion Design', 'Tool List'],
      '录井': isZh ? ['录井数据表', '气相色谱日志', '录井总结'] : ['Logging Data', 'Gas Chrom Log', 'Logging Summary'],
      '测井': isZh ? ['测井原始数据', '测井解释成果', '曲线对比图'] : ['Raw Well Log', 'Log Interpretation', 'Curve Chart'],
      '测试': isZh ? ['试油测试报告', '井下压力记录'] : ['Oil Test Report', 'Downhole Pressure'],
      '地质': isZh ? ['地质研究报告', '构造评估结论', '岩性描述'] : ['Geo Research', 'Structural Eval', 'Lithology'],
      '油藏': isZh ? ['油藏评价方案', '动态分析月报', '产能预测'] : ['Reservoir Eval', 'Dynamic Monthly', 'Capacity Forecast'],
      '运营': isZh ? ['运营审计记录', '安全审查周报'] : ['Ops Audit', 'Safety Weekly'],
    };

    const matchedKey = Object.keys(mapping).find(key => mbuName.includes(key));
    const types = matchedKey ? mapping[matchedKey] : (isZh ? ['分析报告', '数据表格', '结论图件', '其他成果'] : ['Analysis Report', 'Data Table', 'Chart', 'Other']);
    
    return types.map(t => ({ value: t, label: t }));
  }, [mbuId, mbuNodes, isZh]);

  // Flattened object list
  const allObjects = useMemo(() => {
    const objects: string[] = [];
    objectScope.forEach(group => {
      group.items.forEach(item => {
        if (!objects.includes(item)) objects.push(item);
      });
    });
    return objects;
  }, [objectScope]);

  // Effects to set defaults
  React.useEffect(() => {
    if (mbuNodes.length > 0 && !mbuId) {
      setMbuId(mbuNodes[0].id);
    }
  }, [mbuNodes, mbuId]);

  React.useEffect(() => {
    if (availableOutcomeTypes.length > 0) {
      setOutcomeType(availableOutcomeTypes[0].value);
    }
  }, [availableOutcomeTypes]);

  React.useEffect(() => {
    if (allObjects.length > 0 && !selectedObjectId) {
      setSelectedObjectId(allObjects[0]);
    }
  }, [allObjects, selectedObjectId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <i className="fas fa-save text-sm"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-800">{isZh ? '保存为成果' : 'Save as Outcome'}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* MBU Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {isZh ? '所属业务节点' : 'Business Node (MBU)'}
            </label>
            <div className="relative">
              <select 
                value={mbuId}
                onChange={(e) => setMbuId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none"
              >
                {mbuNodes.map(node => (
                  <option key={node.id} value={node.id}>{node.name}</option>
                ))}
                {mbuNodes.length === 0 && (
                  <option value="">{isZh ? '暂无业务节点' : 'No MBU nodes available'}</option>
                )}
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
            </div>
          </div>

          {/* Outcome Type */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {isZh ? '成果类型' : 'Outcome Type'}
            </label>
            <div className="relative">
              <select 
                value={outcomeType}
                onChange={(e) => setOutcomeType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none"
              >
                {availableOutcomeTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
                {availableOutcomeTypes.length === 0 && (
                  <option value="">{isZh ? '请先选择业务节点' : 'Please select business node first'}</option>
                )}
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
            </div>
          </div>

          {/* Object Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {isZh ? '对象名称' : 'Object Name'}
            </label>
            <div className="relative">
              <select 
                value={selectedObjectId}
                onChange={(e) => setSelectedObjectId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none"
              >
                {allObjects.map(obj => (
                  <option key={obj} value={obj}>{obj}</option>
                ))}
                {allObjects.length === 0 && (
                  <option value="">{isZh ? '暂无关联对象' : 'No associated objects'}</option>
                )}
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {isZh ? '成果名称' : 'Outcome Name'}
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isZh ? '请输入成果名称' : 'Enter outcome name'}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            />
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">{isZh ? '公开设置' : 'Public Setting'}</span>
              <span className="text-[10px] text-slate-500">{isZh ? '公开后其他团队成员可见' : 'Visible to other team members'}</span>
            </div>
            <button 
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${isPublic ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            {isZh ? '取消' : 'Cancel'}
          </button>
          <button 
            disabled={!name || !mbuId}
            onClick={() => onConfirm({ 
              mbuId, 
              outcomeType, 
              name, 
              isPublic, 
              objectId: selectedObjectId,
              isArtifactOutcome: true // Special marker
            })}
            className={`flex-1 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all ${
              !name || !mbuId ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 active:scale-95'
            }`}
          >
            {isZh ? '完成保存' : 'Confirm Save'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
