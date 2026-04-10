
import React, { useState, useMemo } from 'react';
import { translations } from '../i18n';
import { Language, CorpusTemplate, VariablePool, GeneratedSample } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AdminCorpusManagementProps {
  lang: Language;
}

const MOCK_VARIABLE_POOL: VariablePool = {
  '对象名称': ['A1井', 'B2井', 'C3井', 'D4井'],
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
  const [newTemplateRaw, setNewTemplateRaw] = useState('');
  const [newTemplateName, setNewTemplateName] = useState('');

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
    setNewTemplateRaw(prev => prev + `{${varName}}`);
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
                  <th className="px-4 py-3 text-center">{t.colVarCount}</th>
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
                    <td className="px-4 py-4 text-center text-blue-600 font-bold">{template.varCount}</td>
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
                <p className="text-xs text-gray-800 leading-relaxed mb-2">{sample.text}</p>
                <div className="flex flex-wrap gap-1">
                  {sample.tags.map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold border border-blue-100">
                      {tag}
                    </span>
                  ))}
                </div>
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
              onClick={() => setIsAddingTemplate(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">{t.newTemplate}</h2>
                <button onClick={() => setIsAddingTemplate(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{t.colTemplateName}</label>
                  <input 
                    type="text" 
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="例如：井位施工记录模板"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" 
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-700">{t.colRawTemplate}</label>
                    <div className="flex gap-2">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">快捷插入变量</span>
                    </div>
                  </div>
                  
                  {/* Quick Insert Area */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[t.objName, t.objType, t.compName, t.resultName, t.itemType].map(label => (
                      <button 
                        key={label}
                        onClick={() => handleInsertVar(label)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-all"
                      >
                        + {label}
                      </button>
                    ))}
                    <button className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold border border-gray-200 hover:bg-gray-200 transition-all">
                      {t.insertVar} <i className="fas fa-chevron-down ml-1 text-[8px]"></i>
                    </button>
                  </div>

                  <textarea 
                    rows={4}
                    value={newTemplateRaw}
                    onChange={(e) => setNewTemplateRaw(e.target.value)}
                    placeholder="输入自然语言，点击上方标签插入变量，例如：{对象名称}正在进行{工序}。"
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-mono text-sm"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <div className="flex gap-3">
                    <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                    <div>
                      <p className="text-xs text-blue-800 font-bold mb-1">变量生成逻辑</p>
                      <p className="text-[10px] text-blue-600 leading-relaxed">
                        系统将基于模板中的变量占位符，自动做笛卡尔组合生成训练样本。例如 2 个井名 × 3 个工序将自动生成 6 条语料。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => setIsAddingTemplate(false)}
                  className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
                >
                  {t.cancel}
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
                      setAlertMessage('模板已保存');
                    }}
                  className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  {t.save}
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
      </AnimatePresence>
    </div>
  );
};
