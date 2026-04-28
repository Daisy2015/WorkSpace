
import React, { useState, useMemo } from 'react';
import { translations } from '../i18n';
import { Language, TrainingSet, TrainingSample } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AdminTrainingSetManagementProps {
  lang: Language;
  onTrainRequest: (version: string) => void;
}

const MOCK_TRAINING_SETS: TrainingSet[] = [
  { 
    id: 'ds-1', name: 'NER_Dataset_v1', source: 'Template', sampleCount: 1250, 
    entityTypes: ['井名', '工序', '工具'], 
    splitRatio: { train: 80, val: 10, test: 10 },
    quality: { completeness: 98, duplication: 2, score: 92 },
    version: 'v1', updateTime: '2024-05-20 10:00' 
  },
  { 
    id: 'ds-2', name: 'NER_Dataset_v2', source: 'Manual', sampleCount: 1500, 
    entityTypes: ['井名', '组件', '成果'], 
    splitRatio: { train: 70, val: 15, test: 15 },
    quality: { completeness: 95, duplication: 5, score: 88 },
    version: 'v2', updateTime: '2024-05-25 14:30' 
  },
  { 
    id: 'ds-3', name: 'NER_Dataset_v3', source: 'Template', sampleCount: 800, 
    entityTypes: ['井名', '工具'], 
    splitRatio: { train: 80, val: 10, test: 10 },
    quality: { completeness: 99, duplication: 1, score: 96 },
    version: 'v3', updateTime: '2024-04-15 09:00' 
  },
];

const MOCK_SAMPLES: TrainingSample[] = [
  { id: 's-1', text: 'A1井在钻井阶段使用PDC钻头进行施工。', tags: ['井名', '工序', '工具'], sourceTemplate: '施工记录模板', status: 'Audited' },
  { id: 's-2', text: 'B2井的套管产生了测井曲线。', tags: ['井名', '组件', '成果'], sourceTemplate: '成果产出模板', status: 'Pending' },
  { id: 's-3', text: 'C3井使用牙轮钻头进行完井作业。', tags: ['井名', '工具', '工序'], sourceTemplate: '施工记录模板', status: 'Audited' },
  { id: 's-4', text: 'D4井的井口装置产生了录井报告。', tags: ['井名', '组件', '成果'], sourceTemplate: '成果产出模板', status: 'Pending' },
];

export const AdminTrainingSetManagement: React.FC<AdminTrainingSetManagementProps> = ({ lang, onTrainRequest }) => {
  const t = translations[lang];
  const [trainingSets, setTrainingSets] = useState<TrainingSet[]>(MOCK_TRAINING_SETS);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(trainingSets[0].id);
  const [samples, setSamples] = useState<TrainingSample[]>(MOCK_SAMPLES);
  const [selectedSampleIds, setSelectedSampleIds] = useState<Set<string>>(new Set());
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isAddSampleModalOpen, setIsAddSampleModalOpen] = useState(false);
  const [newSampleText, setNewSampleText] = useState('');
  const [newSampleTags, setNewSampleTags] = useState('');
  const [sampleFilter, setSampleFilter] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const filteredSamples = useMemo(() => {
    if (!sampleFilter) return samples;
    return samples.filter(s => s.text.includes(sampleFilter) || s.tags.some(t => t.includes(sampleFilter)));
  }, [samples, sampleFilter]);

  const selectedSet = useMemo(() => 
    trainingSets.find(s => s.id === selectedSetId) || null
  , [trainingSets, selectedSetId]);

  const toggleSelectAll = () => {
    if (selectedSampleIds.size === filteredSamples.length) {
      setSelectedSampleIds(new Set());
    } else {
      setSelectedSampleIds(new Set(filteredSamples.map(s => s.id)));
    }
  };

  const toggleSelectSample = (id: string) => {
    const newSelected = new Set(selectedSampleIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSampleIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedSampleIds.size === 0) return;
    if (window.confirm(`确定要删除选中的 ${selectedSampleIds.size} 个样本吗？`)) {
      setSamples(samples.filter(s => !selectedSampleIds.has(s.id)));
      setSelectedSampleIds(new Set());
      setAlertMessage('已成功删除选中的样本');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Statistics Bar */}
      <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-layer-group text-blue-600 mr-3"></i>
              {t.trainingSetManagement}
            </h1>
            <p className="text-sm text-gray-500 mt-1">统一管理训练集资产，支持版本化、质检与模型训练闭环</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all flex items-center text-sm">
              <i className="fas fa-plus mr-2"></i> {t.newTrainingSet}
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all flex items-center text-sm">
              <i className="fas fa-file-import mr-2"></i> {t.manualImport}
            </button>
            <button 
              onClick={() => {
                setAlertMessage('正在导出训练样本为 JSON 格式...');
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(samples));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href",     dataStr);
                downloadAnchorNode.setAttribute("download", `training_samples_${selectedSet?.version || 'export'}.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
              }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all flex items-center text-sm"
            >
              <i className="fas fa-file-export mr-2"></i> 一键导出
            </button>
            <button 
              onClick={() => selectedSet && onTrainRequest(selectedSet.version)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 flex items-center text-sm"
            >
              <i className="fas fa-play mr-2"></i> {t.trainNerWithCurrent}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Two Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Training Set List */}
        <div className="w-[240px] bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              {t.versionList}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {trainingSets.map(set => (
              <div 
                key={set.id}
                onClick={() => setSelectedSetId(set.id)}
                className={`p-4 border-b border-gray-50 cursor-pointer transition-all ${selectedSetId === set.id ? 'bg-indigo-50/50 border-r-2 border-r-indigo-600' : 'hover:bg-gray-50'}`}
              >
                <div className="flex justify-end items-center mb-1.5">
                  <span className="text-[10px] text-slate-400">{set.updateTime.split(' ')[0]}</span>
                </div>
                <h4 className={`font-bold text-sm truncate ${selectedSetId === set.id ? 'text-indigo-600' : 'text-slate-700'}`}>{set.name}</h4>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center text-[10px] text-slate-400 font-medium">
                    <i className="fas fa-database mr-1.5 opacity-50"></i>
                    <span>{set.sampleCount.toLocaleString()} 样本</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(lang === 'zh' ? '确定要删除该训练集吗？' : 'Are you sure you want to delete this training set?')) {
                        setTrainingSets(prev => prev.filter(s => s.id !== set.id));
                        if (selectedSetId === set.id) {
                          setSelectedSetId(null);
                        }
                      }
                    }}
                    className="text-[10px] font-bold text-red-500 hover:text-red-700"
                  >
                    {lang === 'zh' ? '删除' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sample Details */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-bold text-gray-700 flex items-center">
                <i className="fas fa-file-alt text-blue-500 mr-2"></i>
                {t.sampleDetails}
              </h3>
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]"></i>
                <input 
                  type="text" 
                  value={sampleFilter}
                  onChange={(e) => setSampleFilter(e.target.value)}
                  placeholder="搜索样本或标签..."
                  className="pl-8 pr-4 py-1 bg-white border border-gray-200 rounded-full text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-600 hover:bg-gray-50">{t.duplicateDetection}</button>
                <button className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-600 hover:bg-gray-50">{t.classBalanceAnalysis}</button>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsAddSampleModalOpen(true)}
                className="text-xs text-green-600 font-bold hover:underline"
              >
                <i className="fas fa-plus mr-1"></i> 手动添加样本
              </button>
              <button 
                onClick={handleBulkDelete}
                disabled={selectedSampleIds.size === 0}
                className={`text-xs font-bold hover:underline ${selectedSampleIds.size > 0 ? 'text-red-500' : 'text-gray-300 cursor-not-allowed'}`}
              >
                批量删除 ({selectedSampleIds.size})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={filteredSamples.length > 0 && selectedSampleIds.size === filteredSamples.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3">样本文本</th>
                  <th className="px-6 py-3">来源模板</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSamples.map(sample => (
                  <tr key={sample.id} className={`hover:bg-gray-50 transition-colors ${selectedSampleIds.has(sample.id) ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedSampleIds.has(sample.id)}
                        onChange={() => toggleSelectSample(sample.id)}
                      />
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="text-xs text-gray-800 leading-relaxed">{sample.text}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">{sample.sourceTemplate || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button className="text-blue-600 hover:text-blue-800 transition-colors" title="修正标签">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="text-red-500 hover:text-red-700 transition-colors" title="删除">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Split Configuration Modal */}
      <AnimatePresence>
        {isSplitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSplitModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">数据集切分管理</h2>
                <button onClick={() => setIsSplitModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-700">切分方式</label>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-bold">自动随机切分</button>
                      <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold hover:bg-gray-200">分层切分</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Train (%)</label>
                      <input type="number" defaultValue={80} className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Val (%)</label>
                      <input type="number" defaultValue={10} className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Test (%)</label>
                      <input type="number" defaultValue={10} className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700 flex items-center justify-between">
                    <span>固定随机种子</span>
                    <span className="text-[10px] text-gray-400 font-normal">开启后可复现切分结果</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input type="number" defaultValue={42} className="w-32 p-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500" />
                    <button className="text-[10px] text-blue-600 font-bold hover:underline">重新生成种子</button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <div className="flex gap-3">
                    <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                    <p className="text-[10px] text-blue-800 leading-relaxed">
                      分层切分将根据标签分布进行等比例划分，确保各子集在实体覆盖度上保持一致，适用于长尾标签较多的数据集。
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => setIsSplitModalOpen(false)}
                  className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all text-sm"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={() => setIsSplitModalOpen(false)}
                  className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-sm"
                >
                  确认切分
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Sample Modal */}
      <AnimatePresence>
        {isAddSampleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddSampleModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">手动添加训练样本</h2>
                <button onClick={() => setIsAddSampleModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{t.corpusText}</label>
                  <textarea 
                    rows={4}
                    value={newSampleText}
                    onChange={(e) => setNewSampleText(e.target.value)}
                    placeholder="请输入样本文本..."
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => setIsAddSampleModalOpen(false)}
                  className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all text-sm"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={() => {
                    if (!newSampleText.trim()) return;
                    const newSample: TrainingSample = {
                      id: `manual-${Date.now()}`,
                      text: newSampleText,
                      tags: [],
                      sourceTemplate: '手动添加',
                      status: 'Audited'
                    };
                    setSamples([newSample, ...samples]);
                    setIsAddSampleModalOpen(false);
                    setNewSampleText('');
                    setNewSampleTags('');
                  }}
                  className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-sm"
                >
                  确认添加
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
