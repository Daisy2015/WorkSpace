import React, { useState, useMemo } from 'react';
import { translations } from '../i18n';
import { Language, CorpusTemplate, VariablePool, GeneratedSample } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AdminCorpusManagementProps {
  lang: Language;
}

const MOCK_VARIABLE_POOL: VariablePool = {
  '对象名称': ['A1井', 'B2井', 'C3井', 'D4井'],
  '数据集名称': ['2023测井报告', '重点区块地震数据', '井下施工照片'],
  '数据项': ['压力指标', '地层描述', '开工日期'],
  '组件名称': ['套管', '钻头', '井口装置', '泥浆泵'],
  '成果名称': ['测井曲线', '录井报告', '试油报告'],
  '工序': ['钻井', '完井', '固井', '测井'],
  '工具': ['PDC钻头', '牙轮钻头', '螺杆钻具'],
};

const MOCK_TEMPLATES: CorpusTemplate[] = [
  { id: 't1', name: '施工记录模板', rawTemplate: '{对象名称}在{工序}阶段使用{工具}进行施工。', varCount: 3, genCount: 36, tagTypes: ['井名', '工序', '工具'], updateTime: '2024-05-20 10:00' },
  { id: 't2', name: '成果产出模板', rawTemplate: '{对象名称}的{组件名称}产生了{成果名称}。', varCount: 3, genCount: 24, tagTypes: ['井名', '组件', '成果'], updateTime: '2024-05-21 14:30' },
];

export const AdminCorpusManagement: React.FC<AdminCorpusManagementProps> = ({ lang }) => {
  const t = translations[lang];
  const [templates, setTemplates] = useState<CorpusTemplate[]>(MOCK_TEMPLATES);
  const [variablePool, setVariablePool] = useState<VariablePool>(MOCK_VARIABLE_POOL);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(templates[0].id);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [isSelectingVersion, setIsSelectingVersion] = useState(false);
  const [showValueConstraint, setShowValueConstraint] = useState(false);
  const [showDatasetValueConstraint, setShowDatasetValueConstraint] = useState(false);
  const [showDataItemValueConstraint, setShowDataItemValueConstraint] = useState(false);
  const [isObjectDropdownOpen, setIsObjectDropdownOpen] = useState(false);
  const [isDatasetDropdownOpen, setIsDatasetDropdownOpen] = useState(false);
  const [isDataItemDropdownOpen, setIsDataItemDropdownOpen] = useState(false);
  const [objectTypeSearch, setObjectTypeSearch] = useState('');
  const [dataTypeSearch, setDataTypeSearch] = useState('');
  const [fieldTypeSearch, setFieldTypeSearch] = useState('');
  const [datasetSelectSearch, setDatasetSelectSearch] = useState('');
  const [objectValueSearch, setObjectValueSearch] = useState('');
  const [datasetValueSearch, setDatasetValueSearch] = useState('');
  const [dataItemValueSearch, setDataItemValueSearch] = useState('');
  const [newTemplateRaw, setNewTemplateRaw] = useState('');

  // Constraint and Config Modes
  const [objectConstraints, setObjectConstraints] = useState<Record<string, {mode: 'include' | 'exclude', config: 'dropdown' | 'regex', regex: string}>>({});
  const [datasetConstraints, setDatasetConstraints] = useState<Record<string, {mode: 'include' | 'exclude', config: 'dropdown' | 'regex', regex: string}>>({});
  const [dataItemConstraints, setDataItemConstraints] = useState<Record<string, {mode: 'include' | 'exclude', config: 'dropdown' | 'regex', regex: string}>>({});
  
  const [objectConstraintMode, setObjectConstraintMode] = useState<'include' | 'exclude'>('include');
  const [objectConfigMode, setObjectConfigMode] = useState<'dropdown' | 'regex'>('dropdown');
  const [objectRegex, setObjectRegex] = useState('');
  
  const [datasetConstraintMode, setDatasetConstraintMode] = useState<'include' | 'exclude'>('include');
  const [datasetConfigMode, setDatasetConfigMode] = useState<'dropdown' | 'regex'>('dropdown');
  const [datasetRegex, setDatasetRegex] = useState('');

  const [dataItemConstraintMode, setDataItemConstraintMode] = useState<'include' | 'exclude'>('include');
  const [dataItemConfigMode, setDataItemConfigMode] = useState<'dropdown' | 'regex'>('regex');
  const [dataItemRegex, setDataItemRegex] = useState('');

  // New multi-select states
  const [selectedObjectTypes, setSelectedObjectTypes] = useState<string[]>(['油气田', '井筒']);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['结构化']);
  const [selectedDataSets, setSelectedDataSets] = useState<string[]>(['油气田产量记录表']);
  const [selectedFieldTypes, setSelectedFieldTypes] = useState<string[]>(['指标类']);

  const [isObjectTypeDropdownOpen, setIsObjectTypeDropdownOpen] = useState(false);
  const [isDataTypeDropdownOpen, setIsDataTypeDropdownOpen] = useState(false);
  const [isDataSetSelectDropdownOpen, setIsDataSetSelectDropdownOpen] = useState(false);
  const [isFieldTypeDropdownOpen, setIsFieldTypeDropdownOpen] = useState(false);

  const [newTemplateName, setNewTemplateName] = useState('');
  const [templateFilters, setTemplateFilters] = useState({
    '对象名称': { type: '全部', regex: '' },
    '数据集名称': { type: '全部', regex: '' },
    '数据项': { type: '全部', regex: '' }
  });

  const hasVar = (varName: string) => new RegExp(`{${varName}([}_])`).test(newTemplateRaw);

  const getVarInstances = (varName: string) => {
    const instances = [];
    if (new RegExp(`{${varName}}`).test(newTemplateRaw)) {
        instances.push(varName);
    }
    const matches = [...newTemplateRaw.matchAll(new RegExp(`{${varName}_(\\d+)}`, 'g'))];
    matches.sort((a, b) => parseInt(a[1]) - parseInt(b[1])).forEach(m => instances.push(`${varName}_${m[1]}`));
    return instances;
  };

  const getVarLabel = (instanceId: string) => {
      const parts = instanceId.split('_');
      if (parts.length === 1) return parts[0];
      return `${parts[0]} (序号 ${parts[1]})`;
  };

  const updateDatasetConstraint = (id: string, updates: Partial<{mode: 'include' | 'exclude', config: 'dropdown' | 'regex', regex: string}>) => {
    setDatasetConstraints(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {mode: 'include', config: 'dropdown', regex: ''}), ...updates }
    }));
  };

  const updateDataItemConstraint = (id: string, updates: Partial<{mode: 'include' | 'exclude', config: 'dropdown' | 'regex', regex: string}>) => {
    setDataItemConstraints(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {mode: 'include', config: 'dropdown', regex: ''}), ...updates }
    }));
  };

  const selectedTemplate = useMemo(() => 
    templates.find(t => t.id === selectedTemplateId) || null
  , [templates, selectedTemplateId]);

  const generatedSamples = useMemo(() => {
    if (!selectedTemplate) return [];
    
    // Simple generation logic for demo
    const vars = selectedTemplate.rawTemplate.match(/\{([^}]+)\}/g) || [];
    if (vars.length === 0) return [{ id: 's1', text: selectedTemplate.rawTemplate, sourceTemplateId: selectedTemplate.id, tags: selectedTemplate.tagTypes }];

    // Just generate a few samples for preview
    const samples: GeneratedSample[] = [];
    const varNames = vars.map(v => v.slice(1, -1));
    
    // Cartesian product (simplified for first 5)
    const combinations: string[][] = [[]];
    for (const varName of varNames) {
        const values = variablePool[varName] || ['[MISSING]'];
        const newCombos: string[][] = [];
        for (const combo of combinations) {
            for (const val of values) {
                newCombos.push([...combo, val]);
            }
        }
        combinations.splice(0, combinations.length, ...newCombos);
        if (combinations.length > 20) break; // Limit for preview
    }

    return combinations.slice(0, 10).map((combo, idx) => {
        let text = selectedTemplate.rawTemplate;
        varNames.forEach((name, i) => {
            text = text.replace(`{${name}}`, combo[i]);
        });
        return {
            id: `s-${idx}`,
            text,
            sourceTemplateId: selectedTemplate.id,
            tags: selectedTemplate.tagTypes
        };
    });
  }, [selectedTemplate, variablePool]);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleInsertVar = (varName: string) => {
    const baseExists = new RegExp(`{${varName}}`).test(newTemplateRaw);
    if (!baseExists) {
        setNewTemplateRaw(prev => prev + `{${varName}}`);
    } else {
        const matches = [...newTemplateRaw.matchAll(new RegExp(`{${varName}_(\\d+)}`, 'g'))];
        let maxIndex = 1;
        matches.forEach(m => {
            const idx = parseInt(m[1], 10);
            if (idx > maxIndex) maxIndex = idx;
        });
        setNewTemplateRaw(prev => prev + `{${varName}_${maxIndex + 1}}`);
    }
  };

  const toggleSelectAll = () => {
    if (selectedTemplateIds.length === templates.length) {
      setSelectedTemplateIds([]);
    } else {
      setSelectedTemplateIds(templates.map(t => t.id));
    }
  };

  const toggleSelectTemplate = (id: string) => {
    if (selectedTemplateIds.includes(id)) {
      setSelectedTemplateIds(selectedTemplateIds.filter(tid => tid !== id));
    } else {
      setSelectedTemplateIds([...selectedTemplateIds, id]);
    }
  };

  const closeAddModal = () => {
    setIsAddingTemplate(false);
    setNewTemplateName('');
    setNewTemplateRaw('');
    setSelectedObjectTypes(['油气田', '井筒']);
    setSelectedDataTypes(['结构化']);
    setSelectedDataSets(['油气田产量记录表']);
    setSelectedFieldTypes(['指标类']);
    setIsObjectTypeDropdownOpen(false);
    setIsDataTypeDropdownOpen(false);
    setIsDataSetSelectDropdownOpen(false);
    setIsFieldTypeDropdownOpen(false);
    setTemplateFilters({
      '对象名称': { type: '全部', regex: '' },
      '数据集名称': { type: '全部', regex: '' },
      '数据项': { type: '全部', regex: '' }
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-database text-blue-600 mr-3"></i>
              {t.corpusManagement}
            </h1>
            <p className="text-sm text-gray-500 mt-1">统一管理训练语料模板，支持变量插入与自动样本生成</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all flex items-center">
              <i className="fas fa-file-import mr-2"></i> {t.batchImport}
            </button>
            <button 
              onClick={() => setIsAddingTemplate(true)}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 flex items-center"
            >
              <i className="fas fa-plus mr-2"></i> {t.newTemplate}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Two Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Middle: Template List */}
        <div className="flex-1 flex flex-col border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-700 flex items-center">
              <i className="fas fa-list-alt text-blue-500 mr-2"></i>
              {t.templateList}
            </h3>
            <div className="flex gap-4 items-center">
               <span className="text-xs text-gray-400">已选择 {selectedTemplateIds.length} 项</span>
               <button className="text-xs text-red-500 font-bold hover:underline">{t.batchDelete}</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 w-12">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      checked={selectedTemplateIds.length === templates.length && templates.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3">{t.colTemplateName}</th>
                  <th className="px-4 py-3">{t.colRawTemplate}</th>
                  <th className="px-4 py-3">{t.colUpdateTime}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {templates.map(template => (
                  <tr 
                    key={template.id} 
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`cursor-pointer transition-colors ${selectedTemplateId === template.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                        checked={selectedTemplateIds.includes(template.id)}
                        onChange={() => toggleSelectTemplate(template.id)}
                      />
                    </td>
                    <td className="px-4 py-4 font-bold text-gray-900">{template.name}</td>
                    <td className="px-4 py-4 text-gray-500 font-mono text-xs max-w-xs truncate">{template.rawTemplate}</td>
                    <td className="px-4 py-4 text-gray-400 text-xs">{template.updateTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Preview Results */}
        <div className="w-96 bg-gray-50 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-700 flex items-center">
              <i className="fas fa-eye text-blue-500 mr-2"></i>
              {t.previewResults}
            </h3>
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-[10px] font-bold hover:bg-blue-700 transition-all">
              {t.generateDataset}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {generatedSamples.map(sample => (
              <div key={sample.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                <p className="text-xs text-gray-800 leading-relaxed">{sample.text}</p>
              </div>
            ))}
            {generatedSamples.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
                <i className="fas fa-ghost text-4xl mb-4 opacity-20"></i>
                <p className="text-xs">选择模板查看预览</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200 bg-white">
             <button 
                onClick={() => setIsSelectingVersion(true)}
                className="w-full py-2 bg-green-600 text-white rounded-lg font-bold text-xs hover:bg-green-700 transition-all shadow-lg shadow-green-100"
             >
                <i className="fas fa-plus-circle mr-2"></i> {t.addToTraining}
             </button>
          </div>
        </div>
      </div>

      {/* Add Template Modal */}
      <AnimatePresence>
        {isAddingTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAddModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden"
            >
              <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">{t.newTemplate}</h2>
                <button onClick={closeAddModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>
              
              <div className="p-8 space-y-8 overflow-y-auto max-h-[80vh] custom-scrollbar bg-[#f8fafc]">
                {/* 1. Basic Info Section */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                      <i className="fas fa-info-circle text-lg"></i>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-800">基础信息配置</h3>
                      <p className="text-[10px] text-gray-400 font-medium italic">Configure the name and content of your corpus template</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        模板名称 <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        placeholder="例如：井位施工记录查询模板"
                        className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-gray-50/50 text-sm transition-all font-medium" 
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">模板内容 <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                          {['对象名称', '数据集名称', '数据项'].map(label => (
                            <button 
                              key={label}
                              onClick={() => handleInsertVar(label)}
                              className="px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl text-[10px] font-bold hover:bg-blue-100 hover:scale-105 transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <i className="fas fa-plus text-[8px]"></i> {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="relative group">
                        <textarea 
                          rows={1}
                          value={newTemplateRaw}
                          onChange={(e) => setNewTemplateRaw(e.target.value)}
                          placeholder="请输入查询需求，点击上方变量按钮进行插入"
                          className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white text-sm min-h-[52px] h-[52px] resize-none shadow-sm transition-all font-mono"
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none">
                            <i className="fas fa-keyboard text-gray-300 group-focus-within:text-blue-400 transition-colors"></i>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 italic">提示：使用 &#123;变量名&#125; 格式手动插入，或点击上方按钮插入 👆</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center py-4">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <div className="mx-6 p-2 rounded-full bg-gray-100/50 border border-gray-200 shadow-inner">
                        <i className="fas fa-chevron-down text-gray-400 text-xs animate-bounce"></i>
                    </div>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                {/* 2. Variable Constraints Section */}
                {(getVarInstances('对象名称').length > 0 || hasVar('数据集名称') || hasVar('数据项')) && (
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-8 relative overflow-hidden pb-12">
                     <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                                <i className="fas fa-sliders-h text-lg"></i>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-800">变量约束配置</h3>
                                <p className="text-[10px] text-gray-400 font-medium italic">Define strict rules for each variable instance</p>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 border border-gray-200 uppercase tracking-widest shadow-sm">
                            Detected {
                                getVarInstances('对象名称').length + 
                                (hasVar('数据集名称') ? 1 : 0) + 
                                (hasVar('数据项') ? 1 : 0)
                            } Variable(s)
                        </div>
                    </div>

                    <div className="space-y-6">
                      {getVarInstances('对象名称').map(instanceId => {

                          const constraint = objectConstraints[instanceId] || {mode: 'include', config: 'dropdown', regex: ''};
                          return (
                      <div key={instanceId} className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
                        <div className="px-4 py-1.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center gap-2 rounded-t-xl">
                          <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>
                          <span className="text-xs font-bold text-blue-600 uppercase">{getVarLabel(instanceId)}</span>
                        </div>
                      <div className="p-4 space-y-4">
                          <div className={`bg-gray-50/50 rounded-xl border border-gray-100 p-4 relative group ${isObjectTypeDropdownOpen ? 'z-30' : ''}`}>
                            <div className="flex items-center justify-between gap-6">
                              <div className="flex items-center gap-8 flex-1 text-xs">
                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  <span className="font-bold text-gray-700">范围过滤</span>
                                </div>
                                <div className="flex items-center gap-4 flex-1">
                                  <label className="text-gray-400 font-medium whitespace-nowrap">对象类型：</label>
                                  <div className="relative flex-1 max-w-[240px]">
                                    <div 
                                      onClick={() => setIsObjectTypeDropdownOpen(!isObjectTypeDropdownOpen)}
                                      className="h-8 w-full px-2 border border-gray-200 rounded bg-white flex items-center gap-1.5 pr-8 cursor-pointer hover:border-blue-400 transition-colors overflow-hidden"
                                    >
                                      {selectedObjectTypes.length > 0 ? (
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                          <div className="px-1.5 py-0.5 bg-blue-50 border border-blue-100 rounded flex items-center gap-1 text-[10px] text-blue-700 whitespace-nowrap">
                                            <span>{selectedObjectTypes[0]}</span>
                                            <i 
                                              className="fas fa-times text-[8px] text-blue-400 hover:text-blue-600 transition-colors"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedObjectTypes(selectedObjectTypes.filter(t => t !== selectedObjectTypes[0]));
                                              }}
                                            ></i>
                                          </div>
                                          {selectedObjectTypes.length > 1 && (
                                            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 py-0.5 rounded border border-blue-100 flex-shrink-0">
                                              +{selectedObjectTypes.length - 1}
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-[10px] text-gray-400">请选择</span>
                                      )}
                                    </div>
                                    <i className="fas fa-caret-down absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none"></i>
                                    
                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                      {isObjectTypeDropdownOpen && (
                                        <motion.div 
                                          initial={{ opacity: 0, y: 5 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: 5 }}
                                          className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1"
                                        >
                                          <div className="px-2 py-1.5 border-b border-gray-100 mb-1">
                                            <div className="relative">
                                              <i className="fas fa-search absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-[8px]"></i>
                                              <input 
                                                type="text"
                                                value={objectTypeSearch}
                                                onChange={(e) => setObjectTypeSearch(e.target.value)}
                                                placeholder="搜索类型..."
                                                className="w-full pl-6 pr-2 py-1 text-[10px] border border-gray-100 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                                              />
                                            </div>
                                          </div>
                                          {['油气田', '井筒', '站场', '管线'].filter(type => type.includes(objectTypeSearch)).map(type => (
                                            <div 
                                              key={type}
                                              onClick={() => {
                                                if (selectedObjectTypes.includes(type)) {
                                                  setSelectedObjectTypes(selectedObjectTypes.filter(t => t !== type));
                                                } else {
                                                  setSelectedObjectTypes([...selectedObjectTypes, type]);
                                                }
                                              }}
                                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                            >
                                              <span className={`text-[10px] ${selectedObjectTypes.includes(type) ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>{type}</span>
                                              {selectedObjectTypes.includes(type) && <i className="fas fa-check text-[8px] text-blue-600"></i>}
                                            </div>
                                          ))}
                                          {['油气田', '井筒', '站场', '管线'].filter(type => type.includes(objectTypeSearch)).length === 0 && (
                                            <div className="px-3 py-4 text-center">
                                              <span className="text-[10px] text-gray-400">无匹配结果</span>
                                            </div>
                                          )}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => setShowValueConstraint(!showValueConstraint)}
                                className="text-[10px] text-blue-600 font-bold hover:underline whitespace-nowrap"
                              >
                                {showValueConstraint ? '取消变量值约束' : '添加变量值约束'}
                              </button>
                            </div>
                          </div>

                          {showValueConstraint && (
                            <div className="bg-blue-50/30 rounded-xl border border-blue-50/50 p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-3 bg-blue-400 rounded-full"></div>
                                  <span className="text-xs font-bold text-gray-700">变量值约束</span>
                                </div>
                                <div className="flex items-center gap-8">
                                  <div className="flex items-center gap-3">
                                    <label className="text-[10px] text-gray-400 font-medium">约束模式：</label>
                                    <div className="flex p-0.5 bg-gray-100 rounded-md">
                                      <button 
                                        onClick={() => setObjectConstraintMode('include')}
                                        className={`px-3 py-1 rounded-[4px] text-[10px] font-bold transition-all ${objectConstraintMode === 'include' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                      >
                                        包含
                                      </button>
                                      <button 
                                        onClick={() => setObjectConstraintMode('exclude')}
                                        className={`px-3 py-1 rounded-[4px] text-[10px] font-bold transition-all ${objectConstraintMode === 'exclude' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                      >
                                        不包含
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <label className="text-[10px] text-gray-400 font-medium">配置方式：</label>
                                    <div className="flex p-0.5 bg-gray-100 rounded-md">
                                      <button 
                                        onClick={() => setObjectConfigMode('dropdown')}
                                        className={`px-3 py-1 rounded-[4px] text-[10px] font-bold transition-all ${objectConfigMode === 'dropdown' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                      >
                                        下拉选择
                                      </button>
                                      <button 
                                        onClick={() => setObjectConfigMode('regex')}
                                        className={`px-3 py-1 rounded-[4px] text-[10px] font-bold transition-all ${objectConfigMode === 'regex' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                      >
                                        正则匹配
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {objectConfigMode === 'dropdown' ? (
                                <div className="space-y-3">
                                  <div className="relative">
                                    <div 
                                      onClick={() => setIsObjectDropdownOpen(!isObjectDropdownOpen)}
                                      className="h-9 w-full px-3 border border-gray-200 rounded bg-white flex items-center gap-1.5 pr-8 cursor-pointer hover:border-blue-400 transition-colors overflow-hidden shrink-0"
                                    >
                                      {[ '胜利油田', '长庆油田', '西南油气田' ].length > 0 ? (
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                          <div className="px-1.5 py-0.5 bg-blue-50 border border-blue-100 rounded flex items-center gap-1 text-[10px] text-blue-700 whitespace-nowrap">
                                            <span>胜利油田</span>
                                            <i className="fas fa-times text-[8px] text-blue-400 hover:text-blue-600 transition-colors"></i>
                                          </div>
                                          <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 py-0.5 rounded border border-blue-100 flex-shrink-0">
                                            +2
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-xs text-gray-400">请选择...</span>
                                      )}
                                    </div>
                                    <i className="fas fa-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none"></i>
                                    
                                    <AnimatePresence>
                                      {isObjectDropdownOpen && (
                                        <motion.div 
                                          initial={{ opacity: 0, y: 5 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: 5 }}
                                          className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1"
                                        >
                                          <div className="px-2 py-1.5 border-b border-gray-100 mb-1">
                                            <div className="relative">
                                              <i className="fas fa-search absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-[8px]"></i>
                                              <input 
                                                type="text"
                                                value={objectValueSearch}
                                                onChange={(e) => setObjectValueSearch(e.target.value)}
                                                placeholder="搜索变量值..."
                                                className="w-full pl-6 pr-2 py-1 text-[10px] border border-gray-100 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                                              />
                                            </div>
                                          </div>
                                          {['大庆油田', '胜利油田', '长庆油田', '塔里木油田', '西南油气田'].filter(item => item.includes(objectValueSearch)).map(item => (
                                            <div 
                                              key={item}
                                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                            >
                                              <span className={`text-[10px] ${['胜利油田', '长庆油田', '西南油气田'].includes(item) ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>{item}</span>
                                              {['胜利油田', '长庆油田', '西南油气田'].includes(item) && <i className="fas fa-check text-[8px] text-blue-600"></i>}
                                            </div>
                                          ))}
                                          {['大庆油田', '胜利油田', '长庆油田', '塔里木油田', '西南油气田'].filter(item => item.includes(objectValueSearch)).length === 0 && (
                                            <div className="px-3 py-4 text-center">
                                              <span className="text-[10px] text-gray-400">无匹配结果</span>
                                            </div>
                                          )}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <label className="text-[10px] text-gray-400 font-medium ml-1">正则表达式 <span className="text-red-500">*</span></label>
                                      <input 
                                        type="text" 
                                        value={objectRegex}
                                        onChange={(e) => setObjectRegex(e.target.value)}
                                        placeholder="例如：/^井[0-9]+$/"
                                        className="w-full h-9 px-3 border border-gray-200 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] text-gray-400 font-medium ml-1">常用正则模版</label>
                                      <div className="flex flex-wrap gap-2">
                                        {[
                                          { label: '以XX开头', value: '/^XX/' },
                                          { label: '以XX结尾', value: '/XX$/' },
                                          { label: '包含XX', value: '/.*XX.*/' },
                                          { label: '纯数字', value: '/^[0-9]+$/' }
                                        ].map((p, i) => (
                                          <button 
                                            key={i} 
                                            onClick={() => setObjectRegex(p.value)}
                                            className="px-2.5 py-1.5 bg-white border border-gray-200 rounded text-[10px] text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
                                          >
                                            {p.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50 flex items-start gap-2">
                                    <i className="fas fa-info-circle text-blue-400 text-xs mt-0.5"></i>
                                    <p className="text-[10px] text-blue-600 leading-relaxed">
                                      系统将使用该正则表达式对变量值进行校验。例如：<code className="bg-blue-100 px-1 rounded">/^[0-9]+$/</code> 表示只允许数字。
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );})}
                    {/* Variable: 数据集名称 */}
                    {hasVar('数据集名称') && (() => {
                      const constraint = datasetConstraints['1'] || {mode: 'include', config: 'dropdown', regex: ''};
                      const datasetConstraintMode = constraint.mode;
                      const datasetConfigMode = constraint.config;
                      const datasetRegex = constraint.regex;
                      const setDatasetConstraintMode = (mode: 'include' | 'exclude') => updateDatasetConstraint('1', {mode});
                      const setDatasetConfigMode = (config: 'dropdown' | 'regex') => updateDatasetConstraint('1', {config});
                      const setDatasetRegex = (regex: string) => updateDatasetConstraint('1', {regex});
                      return (
                      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
                        <div className="px-4 py-1.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center gap-2 rounded-t-xl">
                          <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>
                          <span className="text-xs font-bold text-blue-600 uppercase">数据集名称</span>
                        </div>
                      <div className="p-4 space-y-4">
                          <div className={`bg-gray-50/50 rounded-xl border border-gray-100 p-4 relative group ${isObjectTypeDropdownOpen || isDataTypeDropdownOpen ? 'z-30' : ''}`}>
                            <div className="flex items-center justify-between gap-6">
                              <div className="flex items-center gap-8 flex-1 text-xs">
                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  <span className="font-bold text-gray-700">范围过滤</span>
                                </div>
                                <div className="flex items-center gap-4 flex-1">
                                  {/* Data Type First */}
                                  <div className="flex items-center gap-3 w-56">
                                    <label className="text-gray-400 font-medium whitespace-nowrap">数据类型：</label>
                                    <div className="relative flex-1">
                                      <div 
                                        onClick={() => setIsDataTypeDropdownOpen(!isDataTypeDropdownOpen)}
                                        className="h-8 w-full px-2 border border-gray-200 rounded bg-white flex items-center gap-1.5 pr-8 cursor-pointer hover:border-blue-400 transition-colors overflow-hidden"
                                      >
                                        {selectedDataTypes.length > 0 ? (
                                          <div className="flex items-center gap-1.5 overflow-hidden">
                                            <div className="px-1.5 py-0.5 bg-blue-50 border border-blue-100 rounded flex items-center gap-1 text-[10px] text-blue-700 whitespace-nowrap">
                                              <span>{selectedDataTypes[0]}</span>
                                              <i 
                                                className="fas fa-times text-[8px] text-blue-400 hover:text-blue-600 transition-colors"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedDataTypes(selectedDataTypes.filter(t => t !== selectedDataTypes[0]));
                                                }}
                                              ></i>
                                            </div>
                                            {selectedDataTypes.length > 1 && (
                                              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 py-0.5 rounded border border-blue-100 flex-shrink-0">
                                                +{selectedDataTypes.length - 1}
                                              </span>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-[10px] text-gray-400">请选择</span>
                                        )}
                                      </div>
                                      <i className="fas fa-caret-down absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none"></i>
                                      
                                      <AnimatePresence>
                                        {isDataTypeDropdownOpen && (
                                          <motion.div 
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1"
                                          >
                                            <div className="px-2 py-1.5 border-b border-gray-100 mb-1">
                                              <div className="relative">
                                                <i className="fas fa-search absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-[8px]"></i>
                                                <input 
                                                  type="text"
                                                  value={dataTypeSearch}
                                                  onChange={(e) => setDataTypeSearch(e.target.value)}
                                                  placeholder="搜索数据类型..."
                                                  className="w-full pl-6 pr-2 py-1 text-[10px] border border-gray-100 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                                                />
                                              </div>
                                            </div>
                                            {['结构化', '半结构化', '非结构化'].filter(type => type.includes(dataTypeSearch)).map(type => (
                                              <div 
                                                key={type}
                                                onClick={() => {
                                                  if (selectedDataTypes.includes(type)) {
                                                    setSelectedDataTypes(selectedDataTypes.filter(t => t !== type));
                                                  } else {
                                                    setSelectedDataTypes([...selectedDataTypes, type]);
                                                  }
                                                }}
                                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                              >
                                                <span className={`text-[10px] ${selectedDataTypes.includes(type) ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>{type}</span>
                                                {selectedDataTypes.includes(type) && <i className="fas fa-check text-[8px] text-blue-600"></i>}
                                              </div>
                                            ))}
                                            {['结构化', '半结构化', '非结构化'].filter(type => type.includes(dataTypeSearch)).length === 0 && (
                                              <div className="px-3 py-4 text-center">
                                                <span className="text-[10px] text-gray-400">无匹配结果</span>
                                              </div>
                                            )}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </div>

                                  {/* Object Type Second */}
                                  <div className="flex items-center gap-2.5 flex-1 max-w-sm">
                                    <label className="text-[10px] text-gray-400 font-medium whitespace-nowrap">对象类型：</label>
                                    <div className="relative flex-1">
                                      <div 
                                        onClick={() => setIsObjectTypeDropdownOpen(!isObjectTypeDropdownOpen)}
                                        className="h-8 w-full px-2 border border-gray-200 rounded bg-white flex items-center gap-1.5 pr-8 cursor-pointer hover:border-blue-400 transition-colors overflow-hidden"
                                      >
                                        {selectedObjectTypes.length > 0 ? (
                                          <div className="flex items-center gap-1.5 overflow-hidden">
                                            <div className="px-1.5 py-0.5 bg-blue-50 border border-blue-100 rounded flex items-center gap-1 text-[10px] text-blue-700 whitespace-nowrap">
                                              <span>{selectedObjectTypes[0]}</span>
                                              <i 
                                                className="fas fa-times text-[8px] text-blue-400 hover:text-blue-600 transition-colors"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedObjectTypes(selectedObjectTypes.filter(t => t !== selectedObjectTypes[0]));
                                                }}
                                              ></i>
                                            </div>
                                            {selectedObjectTypes.length > 1 && (
                                              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 py-0.5 rounded border border-blue-100 flex-shrink-0">
                                                +{selectedObjectTypes.length - 1}
                                              </span>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-[10px] text-gray-400">请选择</span>
                                        )}
                                      </div>
                                      <i className="fas fa-caret-down absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none"></i>
                                      
                                      <AnimatePresence>
                                        {isObjectTypeDropdownOpen && (
                                          <motion.div 
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1"
                                          >
                                            <div className="px-2 py-1.5 border-b border-gray-100 mb-1">
                                              <div className="relative">
                                                <i className="fas fa-search absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-[8px]"></i>
                                                <input 
                                                  type="text"
                                                  value={objectTypeSearch}
                                                  onChange={(e) => setObjectTypeSearch(e.target.value)}
                                                  placeholder="搜索类型..."
                                                  className="w-full pl-6 pr-2 py-1 text-[10px] border border-gray-100 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                                                />
                                              </div>
                                            </div>
                                            {['油气田', '井筒', '站场', '管线'].filter(type => type.includes(objectTypeSearch)).map(type => (
                                              <div 
                                                key={type}
                                                onClick={() => {
                                                  if (selectedObjectTypes.includes(type)) {
                                                    setSelectedObjectTypes(selectedObjectTypes.filter(t => t !== type));
                                                  } else {
                                                    setSelectedObjectTypes([...selectedObjectTypes, type]);
                                                  }
                                                }}
                                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                              >
                                                <span className={`text-[10px] ${selectedObjectTypes.includes(type) ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>{type}</span>
                                                {selectedObjectTypes.includes(type) && <i className="fas fa-check text-[8px] text-blue-600"></i>}
                                              </div>
                                            ))}
                                            {['油气田', '井筒', '站场', '管线'].filter(type => type.includes(objectTypeSearch)).length === 0 && (
                                              <div className="px-3 py-4 text-center">
                                                <span className="text-[10px] text-gray-400">无匹配结果</span>
                                              </div>
                                            )}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => setShowDatasetValueConstraint(!showDatasetValueConstraint)}
                                className="text-[10px] text-blue-600 font-bold hover:underline whitespace-nowrap"
                              >
                                {showDatasetValueConstraint ? '取消变量值约束' : '添加变量值约束'}
                              </button>
                            </div>
                          </div>

                          {showDatasetValueConstraint && (
                            <div className="bg-blue-50/30 rounded-xl border border-blue-50/50 p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-3 bg-blue-400 rounded-full"></div>
                                  <span className="text-xs font-bold text-gray-700">变量值约束</span>
                                </div>
                                <div className="flex items-center gap-8">
                                  <div className="flex items-center gap-3">
                                    <label className="text-[10px] text-gray-400 font-medium">约束模式：</label>
                                    <div className="flex p-0.5 bg-gray-100 rounded-md">
                                      <button 
                                        onClick={() => setDatasetConstraintMode('include')}
                                        className={`px-3 py-1 rounded-[4px] text-[10px] font-bold transition-all ${datasetConstraintMode === 'include' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                      >
                                        包含
                                      </button>
                                      <button 
                                        onClick={() => setDatasetConstraintMode('exclude')}
                                        className={`px-3 py-1 rounded-[4px] text-[10px] font-bold transition-all ${datasetConstraintMode === 'exclude' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                      >
                                        不包含
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <label className="text-[10px] text-gray-400 font-medium">配置方式：</label>
                                    <div className="flex p-0.5 bg-gray-100 rounded-md">
                                      <button 
                                        onClick={() => setDatasetConfigMode('dropdown')}
                                        className={`px-3 py-1 rounded-[4px] text-[10px] font-bold transition-all ${datasetConfigMode === 'dropdown' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                      >
                                        下拉选择
                                      </button>
                                      <button 
                                        onClick={() => setDatasetConfigMode('regex')}
                                        className={`px-3 py-1 rounded-[4px] text-[10px] font-bold transition-all ${datasetConfigMode === 'regex' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                      >
                                        正则匹配
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                            {datasetConfigMode === 'dropdown' ? (
                              <div className="space-y-3">
                                <div className="relative">
                                  <div 
                                    onClick={() => setIsDatasetDropdownOpen(!isDatasetDropdownOpen)}
                                    className="h-9 w-full px-3 border border-gray-200 rounded bg-white flex items-center gap-1.5 pr-8 cursor-pointer hover:border-blue-400 transition-colors overflow-hidden shrink-0"
                                  >
                                    {[ '施工记录表', '项目进度表' ].length > 0 ? (
                                      <div className="flex items-center gap-1.5 overflow-hidden">
                                        <div className="px-1.5 py-0.5 bg-blue-50 border border-blue-100 rounded flex items-center gap-1 text-[10px] text-blue-700 whitespace-nowrap">
                                          <span>施工记录表</span>
                                          <i className="fas fa-times text-[8px] text-blue-400 hover:text-blue-600 transition-colors"></i>
                                        </div>
                                        <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 py-0.5 rounded border border-blue-100 flex-shrink-0">
                                          +1
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-400">请选择...</span>
                                    )}
                                  </div>
                                  <i className="fas fa-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none"></i>
                                  
                                  <AnimatePresence>
                                    {isDatasetDropdownOpen && (
                                      <motion.div 
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1"
                                      >
                                        <div className="px-2 py-1.5 border-b border-gray-100 mb-1">
                                          <div className="relative">
                                            <i className="fas fa-search absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-[8px]"></i>
                                            <input 
                                              type="text"
                                              value={datasetValueSearch}
                                              onChange={(e) => setDatasetValueSearch(e.target.value)}
                                              placeholder="搜索变量值..."
                                              className="w-full pl-6 pr-2 py-1 text-[10px] border border-gray-100 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                                            />
                                          </div>
                                        </div>
                                        {[
                                          '油气田基本信息表', '油气田产量记录表', '施工记录表', '项目进度表', '质量检测报告'
                                        ].filter(item => item.includes(datasetValueSearch)).map(item => (
                                          <div 
                                            key={item}
                                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                          >
                                            <span className={`text-[10px] ${['施工记录表', '项目进度表'].includes(item) ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>{item}</span>
                                            {['施工记录表', '项目进度表'].includes(item) && <i className="fas fa-check text-[8px] text-blue-600"></i>}
                                          </div>
                                        ))}
                                        {[
                                          '油气田基本信息表', '油气田产量记录表', '施工记录表', '项目进度表', '质量检测报告'
                                        ].filter(item => item.includes(datasetValueSearch)).length === 0 && (
                                          <div className="px-3 py-4 text-center">
                                            <span className="text-[10px] text-gray-400">无匹配结果</span>
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-[10px] text-gray-400 font-medium ml-1">正则表达式 <span className="text-red-500">*</span></label>
                                    <input 
                                      type="text" 
                                      value={datasetRegex}
                                      onChange={(e) => setDatasetRegex(e.target.value)}
                                      placeholder="例如：/.*记录.*/"
                                      className="w-full h-9 px-3 border border-gray-200 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[10px] text-gray-400 font-medium ml-1">常用正则模版</label>
                                    <div className="flex flex-wrap gap-2">
                                      {[
                                        { label: '以XX开头', value: '/^XX/' },
                                        { label: '以XX结尾', value: '/XX$/' },
                                        { label: '包含XX', value: '/.*XX.*/' },
                                        { label: '纯数字', value: '/^[0-9]+$/' }
                                      ].map((p, i) => (
                                        <button 
                                          key={i} 
                                          onClick={() => setDatasetRegex(p.value)}
                                          className="px-2.5 py-1.5 bg-white border border-gray-200 rounded text-[10px] text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
                                        >
                                          {p.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            </div>
                          )}
                        </div>
                      </div>
                    );})()}

                    {hasVar('数据项') && (() => {
                      const constraint = dataItemConstraints['1'] || {mode: 'include', config: 'dropdown', regex: ''};
                      const dataItemConstraintMode = constraint.mode;
                      const dataItemConfigMode = constraint.config;
                      const dataItemRegex = constraint.regex;
                      const setDataItemConstraintMode = (mode: 'include' | 'exclude') => updateDataItemConstraint('1', {mode});
                      const setDataItemConfigMode = (config: 'dropdown' | 'regex') => updateDataItemConstraint('1', {config});
                      const setDataItemRegex = (regex: string) => updateDataItemConstraint('1', {regex});
                      return (
                      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
                        <div className="px-4 py-1.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center gap-2 rounded-t-xl">
                          <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>
                          <span className="text-xs font-bold text-blue-600 uppercase">数据项</span>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className={`bg-gray-50/50 rounded-xl border border-gray-100 p-4 relative group ${isFieldTypeDropdownOpen || isDataSetSelectDropdownOpen ? 'z-30' : ''}`}>
                            <div className="flex items-center justify-between gap-6">
                              <div className="flex items-center gap-8 flex-1 text-xs">
                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  <span className="font-bold text-gray-700">范围过滤</span>
                                </div>
                                <div className="flex items-center gap-4 flex-1">
                                  {/* Field Type First */}
                                  <div className="flex items-center gap-3 w-56">
                                    <label className="text-gray-400 font-medium whitespace-nowrap">字段类型：</label>
                                    <div className="relative flex-1">
                                      <div 
                                        onClick={() => setIsFieldTypeDropdownOpen(!isFieldTypeDropdownOpen)}
                                        className="h-8 w-full px-2 border border-gray-200 rounded bg-white flex items-center gap-1.5 pr-8 cursor-pointer hover:border-blue-400 transition-colors overflow-hidden"
                                      >
                                        {selectedFieldTypes.length > 0 ? (
                                          <div className="flex items-center gap-1.5 overflow-hidden">
                                            <div className="px-1.5 py-0.5 bg-blue-50 border border-blue-100 rounded flex items-center gap-1 text-[10px] text-blue-700 whitespace-nowrap">
                                              <span>{selectedFieldTypes[0]}</span>
                                              <i 
                                                className="fas fa-times text-[8px] text-blue-400 hover:text-blue-600 transition-colors"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedFieldTypes(selectedFieldTypes.filter(t => t !== selectedFieldTypes[0]));
                                                }}
                                              ></i>
                                            </div>
                                            {selectedFieldTypes.length > 1 && (
                                              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 py-0.5 rounded border border-blue-100 flex-shrink-0">
                                                +{selectedFieldTypes.length - 1}
                                              </span>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-[10px] text-gray-400">请选择</span>
                                        )}
                                      </div>
                                      <i className="fas fa-caret-down absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none"></i>
                                      
                                      <AnimatePresence>
                                        {isFieldTypeDropdownOpen && (
                                          <motion.div 
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1"
                                          >
                                            <div className="px-2 py-1.5 border-b border-gray-100 mb-1">
                                              <div className="relative">
                                                <i className="fas fa-search absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-[8px]"></i>
                                                <input 
                                                  type="text"
                                                  value={fieldTypeSearch}
                                                  onChange={(e) => setFieldTypeSearch(e.target.value)}
                                                  placeholder="搜索字段类型..."
                                                  className="w-full pl-6 pr-2 py-1 text-[10px] border border-gray-100 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                                                />
                                              </div>
                                            </div>
                                            {['指标类', '分类类', '描述类'].filter(type => type.includes(fieldTypeSearch)).map(type => (
                                              <div 
                                                key={type}
                                                onClick={() => {
                                                  if (selectedFieldTypes.includes(type)) {
                                                    setSelectedFieldTypes(selectedFieldTypes.filter(t => t !== type));
                                                  } else {
                                                    setSelectedFieldTypes([...selectedFieldTypes, type]);
                                                  }
                                                }}
                                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                              >
                                                <span className={`text-[10px] ${selectedFieldTypes.includes(type) ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>{type}</span>
                                                {selectedFieldTypes.includes(type) && <i className="fas fa-check text-[8px] text-blue-600"></i>}
                                              </div>
                                            ))}
                                            {['指标类', '分类类', '描述类'].filter(type => type.includes(fieldTypeSearch)).length === 0 && (
                                              <div className="px-3 py-4 text-center">
                                                <span className="text-[10px] text-gray-400">无匹配结果</span>
                                              </div>
                                            )}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </div>

                                  {/* Dataset Second */}
                                  <div className="flex items-center gap-2.5 flex-1 max-sm">
                                    <label className="text-[10px] text-gray-400 font-medium whitespace-nowrap">数据集：</label>
                                    <div className="relative flex-1">
                                      <div 
                                        onClick={() => setIsDataSetSelectDropdownOpen(!isDataSetSelectDropdownOpen)}
                                        className="h-8 w-full px-2 border border-gray-200 rounded bg-white flex items-center gap-1.5 pr-8 cursor-pointer hover:border-blue-400 transition-colors overflow-hidden"
                                      >
                                        {selectedDataSets.length > 0 ? (
                                          <div className="flex items-center gap-1.5 overflow-hidden">
                                            <div className="px-1.5 py-0.5 bg-blue-50 border border-blue-100 rounded flex items-center gap-1 text-[10px] text-blue-700 whitespace-nowrap">
                                              <span>{selectedDataSets[0]}</span>
                                              <i 
                                                className="fas fa-times text-[8px] text-blue-400 hover:text-blue-600 transition-colors"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedDataSets(selectedDataSets.filter(d => d !== selectedDataSets[0]));
                                                }}
                                              ></i>
                                            </div>
                                            {selectedDataSets.length > 1 && (
                                              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 py-0.5 rounded border border-blue-100 flex-shrink-0">
                                                +{selectedDataSets.length - 1}
                                              </span>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-[10px] text-gray-400">请选择</span>
                                        )}
                                      </div>
                                      <i className="fas fa-caret-down absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none"></i>
                                      
                                      <AnimatePresence>
                                        {isDataSetSelectDropdownOpen && (
                                          <motion.div 
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1"
                                          >
                                            <div className="px-2 py-1.5 border-b border-gray-100 mb-1">
                                              <div className="relative">
                                                <i className="fas fa-search absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-[8px]"></i>
                                                <input 
                                                  type="text"
                                                  value={datasetSelectSearch}
                                                  onChange={(e) => setDatasetSelectSearch(e.target.value)}
                                                  placeholder="搜索数据集..."
                                                  className="w-full pl-6 pr-2 py-1 text-[10px] border border-gray-100 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                                                />
                                              </div>
                                            </div>
                                            {['油气田产量记录表', '油气田分布表', '井筒信息表', '施工记录表'].filter(dataset => dataset.includes(datasetSelectSearch)).map(dataset => (
                                              <div 
                                                key={dataset}
                                                onClick={() => {
                                                  if (selectedDataSets.includes(dataset)) {
                                                    setSelectedDataSets(selectedDataSets.filter(d => d !== dataset));
                                                  } else {
                                                    setSelectedDataSets([...selectedDataSets, dataset]);
                                                  }
                                                }}
                                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                              >
                                                <span className={`text-[10px] ${selectedDataSets.includes(dataset) ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>{dataset}</span>
                                                {selectedDataSets.includes(dataset) && <i className="fas fa-check text-[8px] text-blue-600"></i>}
                                              </div>
                                            ))}
                                            {['油气田产量记录表', '油气田分布表', '井筒信息表', '施工记录表'].filter(dataset => dataset.includes(datasetSelectSearch)).length === 0 && (
                                              <div className="px-3 py-4 text-center">
                                                <span className="text-[10px] text-gray-400">无匹配结果</span>
                                              </div>
                                            )}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => setShowDataItemValueConstraint(!showDataItemValueConstraint)}
                                className="text-[10px] text-blue-600 font-bold hover:underline whitespace-nowrap"
                              >
                                {showDataItemValueConstraint ? '取消变量值约束' : '添加变量值约束'}
                              </button>
                            </div>
                          </div>

                          {showDataItemValueConstraint && (
                            <div className="bg-blue-50/30 rounded-xl border border-blue-50/50 p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-3 bg-blue-400 rounded-full"></div>
                                  <span className="text-xs font-bold text-gray-700">变量值约束</span>
                                </div>
                                <div className="flex items-center gap-8">
                                  <div className="flex items-center gap-3">
                                    <label className="text-[10px] text-gray-400 font-medium">约束模式：</label>
                                    <div className="flex p-0.5 bg-gray-100 rounded-md">
                                      <button 
                                        onClick={() => setDataItemConstraintMode('include')}
                                        className={`px-3 py-1 rounded-[4px] text-[10px] font-bold transition-all ${dataItemConstraintMode === 'include' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                      >
                                        包含
                                      </button>
                                      <button 
                                        onClick={() => setDataItemConstraintMode('exclude')}
                                        className={`px-3 py-1 rounded-[4px] text-[10px] font-bold transition-all ${dataItemConstraintMode === 'exclude' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                      >
                                        不包含
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <label className="text-[10px] text-gray-400 font-medium">配置方式：</label>
                                    <div className="flex p-0.5 bg-gray-100 rounded-md">
                                      <button 
                                        onClick={() => setDataItemConfigMode('dropdown')}
                                        className={`px-3 py-1 rounded-[4px] text-[10px] font-bold transition-all ${dataItemConfigMode === 'dropdown' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                      >
                                        下拉选择
                                      </button>
                                      <button 
                                        onClick={() => setDataItemConfigMode('regex')}
                                        className={`px-3 py-1 rounded-[4px] text-[10px] font-bold transition-all ${dataItemConfigMode === 'regex' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                      >
                                        正则匹配
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                            {dataItemConfigMode === 'dropdown' ? (
                              <div className="space-y-3">
                                <div className="relative">
                                  <div 
                                    onClick={() => setIsDataItemDropdownOpen(!isDataItemDropdownOpen)}
                                    className="h-9 w-full px-3 border border-gray-200 rounded bg-white flex items-center gap-1.5 pr-8 cursor-pointer hover:border-blue-400 transition-colors overflow-hidden shrink-0"
                                  >
                                    {[ '压力指标', '地层描述' ].length > 0 ? (
                                      <div className="flex items-center gap-1.5 overflow-hidden">
                                        <div className="px-1.5 py-0.5 bg-blue-50 border border-blue-100 rounded flex items-center gap-1 text-[10px] text-blue-700 whitespace-nowrap">
                                          <span>压力指标</span>
                                          <i className="fas fa-times text-[8px] text-blue-400 hover:text-blue-600 transition-colors"></i>
                                        </div>
                                        <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 py-0.5 rounded border border-blue-100 flex-shrink-0">
                                          +1
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-400">请选择...</span>
                                    )}
                                  </div>
                                  <i className="fas fa-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none"></i>
                                  
                                  <AnimatePresence>
                                    {isDataItemDropdownOpen && (
                                      <motion.div 
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1"
                                      >
                                        <div className="px-2 py-1.5 border-b border-gray-100 mb-1">
                                          <div className="relative">
                                            <i className="fas fa-search absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-[8px]"></i>
                                            <input 
                                              type="text"
                                              value={dataItemValueSearch}
                                              onChange={(e) => setDataItemValueSearch(e.target.value)}
                                              placeholder="搜索变量值..."
                                              className="w-full pl-6 pr-2 py-1 text-[10px] border border-gray-100 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                                            />
                                          </div>
                                        </div>
                                        {['压力指标', '地层描述', '开工日期', '温度指示', '深度参数'].filter(item => item.includes(dataItemValueSearch)).map(item => (
                                          <div 
                                            key={item}
                                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                          >
                                            <span className={`text-[10px] ${['压力指标', '地层描述'].includes(item) ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>{item}</span>
                                            {['压力指标', '地层描述'].includes(item) && <i className="fas fa-check text-[8px] text-blue-600"></i>}
                                          </div>
                                        ))}
                                        {['压力指标', '地层描述', '开工日期', '温度指示', '深度参数'].filter(item => item.includes(dataItemValueSearch)).length === 0 && (
                                          <div className="px-3 py-4 text-center">
                                            <span className="text-[10px] text-gray-400">无匹配结果</span>
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-[10px] text-gray-400 font-medium ml-1">正则表达式 <span className="text-red-500">*</span></label>
                                    <input 
                                      type="text" 
                                      value={dataItemRegex}
                                      onChange={(e) => setDataItemRegex(e.target.value)}
                                      placeholder="例如：/^.*(温度|压力).*$/"
                                      className="w-full h-9 px-3 border border-gray-200 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[10px] text-gray-400 font-medium ml-1">常用正则模版</label>
                                    <div className="flex flex-wrap gap-2">
                                      {[
                                        { label: '以XX开头', value: '/^XX/' },
                                        { label: '以XX结尾', value: '/XX$/' },
                                        { label: '包含XX', value: '/.*XX.*/' },
                                        { label: '纯数字', value: '/^[0-9]+$/' }
                                      ].map((p, i) => (
                                        <button 
                                          key={i} 
                                          onClick={() => setDataItemRegex(p.value)}
                                          className="px-2.5 py-1.5 bg-white border border-gray-200 rounded text-[10px] text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
                                        >
                                          {p.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            </div>
                          )}
                        </div>
                        </div>
                      );})()}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 bg-white border-t border-gray-100 flex justify-end gap-3 px-8">
                <button 
                  onClick={closeAddModal}
                  className="px-6 py-2 text-xs text-gray-700 font-bold border border-gray-200 hover:bg-gray-50 rounded transition-all shadow-sm"
                >
                  取消
                </button>
                <button 
                    onClick={() => {
                      if (!newTemplateName || !newTemplateRaw) {
                        setAlertMessage('请填写完整模板信息');
                        return;
                      }
                      const newT: CorpusTemplate = {
                        id: `t-${Date.now()}`,
                        name: newTemplateName,
                        rawTemplate: newTemplateRaw,
                        varCount: (newTemplateRaw.match(/\{([^}]+)\}/g) || []).length,
                        genCount: 10, // Mock
                        tagTypes: ['井名', '工具'], // Mock
                        updateTime: new Date().toISOString().slice(0, 16).replace('T', ' ')
                      };
                      setTemplates([newT, ...templates]);
                      setIsAddingTemplate(false);
                      setNewTemplateName('');
                      setNewTemplateRaw('');
                      setTemplateFilters({
                        '对象名称': { type: '全部', regex: '' },
                        '数据集名称': { type: '全部', regex: '' },
                        '数据项': { type: '全部', regex: '' }
                      });
                      setAlertMessage('模板已保存');
                    }}
                  className="px-8 py-2 bg-[#2563eb] text-xs text-white font-bold rounded hover:bg-blue-700 transition-all shadow-md"
                >
                  保存
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Version Selection Modal */}
      <AnimatePresence>
        {isSelectingVersion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSelectingVersion(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">{t.addToTraining}</h2>
                <button onClick={() => setIsSelectingVersion(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-500">请选择要将生成的样本添加到的训练集版本：</p>
                <div className="grid grid-cols-1 gap-2">
                  {['v1.0', 'v1.1', 'v2.0', 'v2.1-beta'].map(version => (
                    <button 
                      key={version}
                      onClick={() => {
                        // Mock success
                        setAlertMessage(`成功将样本添加到训练集版本: ${version}`);
                        setIsSelectingVersion(false);
                      }}
                      className="w-full p-4 text-left border border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all flex justify-between items-center group"
                    >
                      <span className="font-bold text-gray-700">{version}</span>
                      <i className="fas fa-chevron-right text-gray-300 group-hover:text-blue-500 transition-colors"></i>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setIsSelectingVersion(false)}
                  className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
                >
                  {t.cancel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Alert Modal */}
        <AnimatePresence>
          {alertMessage && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAlertMessage(null)}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-xs w-full text-center"
              >
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl mx-auto mb-4">
                  <i className="fas fa-check"></i>
                </div>
                <p className="text-gray-800 font-medium mb-6">{alertMessage}</p>
                <button 
                  onClick={() => setAlertMessage(null)}
                  className="w-full py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors"
                >
                  确定
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
    </div>
  );
};
