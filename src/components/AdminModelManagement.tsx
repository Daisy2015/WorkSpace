
import React, { useState, useMemo, useEffect } from 'react';
import { translations } from '../i18n';
import { Language, NERModel, ModelStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AdminModelManagementProps {
  lang: Language;
  pendingTrainingSet?: string | null;
  onClearPending?: () => void;
}

// --- Mock Data ---

const MOCK_MODELS: NERModel[] = [
  {
    id: 'NER_v20260330_003',
    name: 'NER_v20260330_003',
    baseModel: 'RoBERTa-wwm-ext',
    dataset: 'PetroNER-v2.1 (50k samples)',
    sampleCount: 50000,
    startTime: '2026-03-30 09:00',
    status: 'Success',
    progress: { epoch: 10, totalEpoch: 10, loss: 0.082, f1: 94.5 },
    metrics: { precision: 93.8, recall: 95.2, f1: 94.5 },
    isActive: true,
    config: {
      training: { baseModel: 'RoBERTa-wwm-ext', learningRate: 2e-5, batchSize: 32, epoch: 10, maxLength: 512, optimizer: 'AdamW' },
      data: { source: 'Internal Labeling System', tagSystem: 'BIO', tagCount: 12, sampleDistribution: 'Balanced', version: 'v2.1' },
      deployment: { inferenceUrl: 'https://api.jura.ai/ner/v3', gpuQuota: '1x A100', maxConcurrency: 100, timeout: 500 },
    }
  },
  {
    id: 'NER_v20260329_002',
    name: 'NER_v20260329_002',
    baseModel: 'BERT-base-chinese',
    dataset: 'PetroNER-v2.0 (40k samples)',
    sampleCount: 40000,
    startTime: '2026-03-29 14:30',
    status: 'Success',
    progress: { epoch: 10, totalEpoch: 10, loss: 0.115, f1: 92.1 },
    metrics: { precision: 91.5, recall: 92.7, f1: 92.1 },
    isActive: false,
    config: {
      training: { baseModel: 'BERT-base-chinese', learningRate: 3e-5, batchSize: 32, epoch: 10, maxLength: 512, optimizer: 'AdamW' },
      data: { source: 'Internal Labeling System', tagSystem: 'BIO', tagCount: 12, sampleDistribution: 'Balanced', version: 'v2.0' },
      deployment: { inferenceUrl: 'https://api.jura.ai/ner/v2', gpuQuota: '1x V100', maxConcurrency: 80, timeout: 800 },
    }
  },
  {
    id: 'NER_v20260328_001',
    name: 'NER_v20260328_001',
    baseModel: 'BERT-base-chinese',
    dataset: 'PetroNER-v1.8 (30k samples)',
    sampleCount: 30000,
    startTime: '2026-03-28 10:15',
    status: 'Failed',
    progress: { epoch: 4, totalEpoch: 10, loss: 0.450, f1: 65.2 },
    metrics: { precision: 0, recall: 0, f1: 0 },
    isActive: false,
    config: {
      training: { baseModel: 'BERT-base-chinese', learningRate: 5e-5, batchSize: 16, epoch: 10, maxLength: 512, optimizer: 'SGD' },
      data: { source: 'Public Dataset', tagSystem: 'BIO', tagCount: 10, sampleDistribution: 'Skewed', version: 'v1.8' },
      deployment: { inferenceUrl: '', gpuQuota: 'None', maxConcurrency: 0, timeout: 0 },
    }
  }
];

export const AdminModelManagement: React.FC<AdminModelManagementProps> = ({ lang, pendingTrainingSet, onClearPending }) => {
  const t = translations[lang];
  const [models, setModels] = useState<NERModel[]>(MOCK_MODELS);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Drawer/Modal States
  const [selectedModelForConfig, setSelectedModelForConfig] = useState<NERModel | null>(null);
  const [selectedModelForTest, setSelectedModelForTest] = useState<NERModel | null>(null);
  const [modelToSetActive, setModelToSetActive] = useState<NERModel | null>(null);
  const [activeConfigTab, setActiveConfigTab] = useState<'training' | 'data' | 'deploy' | 'metrics'>('training');

  // Test States
  const [testText, setTestText] = useState('A1井在钻井设计阶段使用PDC钻头进行三开井段施工。');
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{ text: string; type: string; start: number; end: number; conf: number }[]>([]);

  const activeModel = useMemo(() => models.find(m => m.isActive), [models]);

  const filteredModels = useMemo(() => {
    return models.filter(m => {
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'Active' && m.isActive) ||
                           (filterStatus === m.status);
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [models, filterStatus, searchQuery]);

  // Simulation: Training Progress
  useEffect(() => {
    if (pendingTrainingSet) {
      handleTrainNewModel(pendingTrainingSet);
      onClearPending?.();
    }
  }, [pendingTrainingSet]);

  useEffect(() => {
    const timer = setInterval(() => {
      setModels(prev => prev.map(m => {
        if (m.status === 'Training' || m.status === 'Preparing' || m.status === 'Evaluating') {
          // Simulate progress
          const newEpoch = m.progress.epoch + (Math.random() > 0.7 ? 1 : 0);
          if (newEpoch > m.progress.totalEpoch) {
             return { ...m, status: 'Success', progress: { ...m.progress, epoch: m.progress.totalEpoch } };
          }
          return { 
            ...m, 
            progress: { 
                ...m.progress, 
                epoch: newEpoch, 
                loss: Math.max(0.05, m.progress.loss - 0.001),
                f1: Math.min(95, m.progress.f1 + 0.1)
            } 
          };
        }
        return m;
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleTrainNewModel = (datasetVersion?: string) => {
    const now = new Date();
    const version = `NER_v${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${(models.length + 1).toString().padStart(3, '0')}`;
    const newModel: NERModel = {
      id: version,
      name: version,
      baseModel: 'RoBERTa-wwm-ext',
      dataset: datasetVersion ? `PetroNER-${datasetVersion}` : 'PetroNER-v2.2 (New)',
      sampleCount: 55000,
      startTime: now.toLocaleString(),
      status: 'Queued',
      progress: { epoch: 0, totalEpoch: 10, loss: 1.5, f1: 0, remainingTime: '15min' },
      metrics: { precision: 0, recall: 0, f1: 0 },
      isActive: false,
      config: {
        training: { baseModel: 'RoBERTa-wwm-ext', learningRate: 2e-5, batchSize: 32, epoch: 10, maxLength: 512, optimizer: 'AdamW' },
        data: { source: 'Internal Labeling System', tagSystem: 'BIO', tagCount: 12, sampleDistribution: 'Balanced', version: datasetVersion || 'v2.2' },
        deployment: { inferenceUrl: '', gpuQuota: '1x A100', maxConcurrency: 100, timeout: 500 },
      }
    };
    setModels([newModel, ...models]);
    
    // Simulate status transition
    setTimeout(() => {
        setModels(prev => prev.map(m => m.id === version ? { ...m, status: 'Preparing' } : m));
        setTimeout(() => {
            setModels(prev => prev.map(m => m.id === version ? { ...m, status: 'Training' } : m));
        }, 3000);
    }, 2000);
  };

  const handleSetActive = (model: NERModel) => {
    setModels(prev => prev.map(m => ({
      ...m,
      isActive: m.id === model.id
    })));
    setModelToSetActive(null);
    setAlertMessage(t.modelActivated);
  };

  const handleDeleteModel = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      setModels(prev => prev.filter(m => m.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  const runTest = () => {
    setIsTesting(true);
    setTestResults([]);
    setTimeout(() => {
      setIsTesting(false);
      setTestResults([
        { text: 'A1井', type: '井名', start: 0, end: 3, conf: 0.992 },
        { text: '钻井设计', type: '工序', start: 4, end: 8, conf: 0.961 },
        { text: 'PDC钻头', type: '工具', start: 12, end: 18, conf: 0.984 },
      ]);
    }, 8000);
  };

  const getStatusColor = (status: ModelStatus, isActive: boolean) => {
    if (isActive) return 'bg-purple-100 text-purple-700 border-purple-200';
    switch (status) {
      case 'Queued': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'Preparing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Training': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Evaluating': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Success': return 'bg-green-100 text-green-700 border-green-200';
      case 'Failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-microchip text-blue-600 mr-3"></i>
              {t.modelManagement}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {t.activeModel}: <span className="font-mono font-bold text-purple-600">{activeModel?.name || 'None'}</span>
              {activeModel && (
                <span className="ml-4 text-xs text-gray-400">
                  F1: {activeModel.metrics.f1}% | {t.colTime}: {activeModel.startTime}
                </span>
              )}
            </p>
          </div>
          <button 
            onClick={() => handleTrainNewModel()}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 flex items-center"
          >
            <i className="fas fa-plus mr-2"></i> {t.trainNewModel}
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t.allStatuses}</option>
            <option value="Training">{t.statusTraining}</option>
            <option value="Success">{t.statusSuccess}</option>
            <option value="Failed">{t.statusFailed}</option>
            <option value="Active">{t.statusActive}</option>
          </select>
        </div>
      </div>

      {/* Main Content: Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">{t.colModelName}</th>
                <th className="px-6 py-4">{t.colBaseModel}</th>
                <th className="px-6 py-4">{t.colDataset}</th>
                <th className="px-6 py-4">{t.colTime}</th>
                <th className="px-6 py-4">{t.colModelStatus}</th>
                <th className="px-6 py-4">{t.colProgress}</th>
                <th className="px-6 py-4">{t.colMetrics} (F1)</th>
                <th className="px-6 py-4 text-right">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence initial={false}>
                {filteredModels.map(model => (
                  <motion.tr 
                    key={model.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`hover:bg-blue-50/50 transition-colors ${model.isActive ? 'bg-purple-50/30' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="font-mono font-bold text-gray-900">{model.name}</span>
                        {model.isActive && (
                          <span className="ml-2 px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                            {t.statusActive}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{model.baseModel}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-[150px] truncate" title={model.dataset}>{model.dataset}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{model.startTime}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(model.status, model.isActive)}`}>
                        {model.isActive ? t.statusActive : t[`status${model.status}` as keyof typeof t]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {model.status === 'Training' || model.status === 'Preparing' || model.status === 'Evaluating' ? (
                        <div className="w-32">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span>Epoch {model.progress.epoch}/{model.progress.totalEpoch}</span>
                            <span>{Math.round((model.progress.epoch / model.progress.totalEpoch) * 100)}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-blue-500"
                                animate={{ width: `${(model.progress.epoch / model.progress.totalEpoch) * 100}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1">Loss: {model.progress.loss.toFixed(3)}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {model.status === 'Success' ? (
                        <div className="font-bold text-blue-600">{model.metrics.f1}%</div>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {model.status === 'Success' && !model.isActive && (
                          <button 
                            onClick={() => setModelToSetActive(model)}
                            className="text-purple-600 hover:text-purple-800 text-xs font-bold px-2 py-1 border border-purple-200 rounded hover:bg-purple-50"
                          >
                            {t.useModel}
                          </button>
                        )}
                        {model.status === 'Success' && (
                          <button 
                            onClick={() => setSelectedModelForTest(model)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-bold px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                          >
                            {t.testModel}
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedModelForConfig(model)}
                          className="text-gray-600 hover:text-gray-800 text-xs font-bold px-2 py-1 border border-gray-200 rounded hover:bg-gray-50"
                        >
                          {t.viewConfig}
                        </button>
                        {!model.isActive && (
                           <button 
                            onClick={() => handleDeleteModel(model.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 border border-red-100 rounded hover:bg-red-50"
                           >
                             <i className="fas fa-trash"></i>
                           </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer: Config */}
      <AnimatePresence>
        {selectedModelForConfig && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedModelForConfig(null)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-[600px] bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{t.viewConfig}</h3>
                    <p className="text-xs text-gray-500 font-mono">{selectedModelForConfig.name}</p>
                </div>
                <button onClick={() => setSelectedModelForConfig(null)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="flex border-b border-gray-200 px-6 bg-white">
                {[
                  { id: 'training', label: t.configTraining },
                  { id: 'data', label: t.configData },
                  { id: 'deploy', label: t.configDeploy },
                  { id: 'metrics', label: t.configMetrics },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveConfigTab(tab.id as any)}
                    className={`px-4 py-3 text-sm font-bold transition-all relative ${activeConfigTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab.label}
                    {activeConfigTab === tab.id && (
                      <motion.div layoutId="configTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {activeConfigTab === 'training' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <ConfigItem label="Base Model" value={selectedModelForConfig.config.training.baseModel} />
                      <ConfigItem label="Learning Rate" value={selectedModelForConfig.config.training.learningRate.toString()} />
                      <ConfigItem label="Batch Size" value={selectedModelForConfig.config.training.batchSize.toString()} />
                      <ConfigItem label="Epoch" value={selectedModelForConfig.config.training.epoch.toString()} />
                      <ConfigItem label="Max Length" value={selectedModelForConfig.config.training.maxLength.toString()} />
                      <ConfigItem label="Optimizer" value={selectedModelForConfig.config.training.optimizer} />
                    </div>
                  </div>
                )}
                {activeConfigTab === 'data' && (
                  <div className="space-y-6">
                    <ConfigItem label="Dataset Source" value={selectedModelForConfig.config.data.source} />
                    <ConfigItem label="Tag System" value={selectedModelForConfig.config.data.tagSystem} />
                    <ConfigItem label="Tag Count" value={selectedModelForConfig.config.data.tagCount.toString()} />
                    <ConfigItem label="Sample Distribution" value={selectedModelForConfig.config.data.sampleDistribution} />
                    <ConfigItem label="Data Version" value={selectedModelForConfig.config.data.version} />
                  </div>
                )}
                {activeConfigTab === 'deploy' && (
                  <div className="space-y-6">
                    <ConfigItem label="Inference URL" value={selectedModelForConfig.config.deployment.inferenceUrl || 'N/A'} />
                    <ConfigItem label="GPU Quota" value={selectedModelForConfig.config.deployment.gpuQuota} />
                    <ConfigItem label="Max Concurrency" value={selectedModelForConfig.config.deployment.maxConcurrency.toString()} />
                    <ConfigItem label="Timeout (ms)" value={selectedModelForConfig.config.deployment.timeout.toString()} />
                  </div>
                )}
                {activeConfigTab === 'metrics' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-3 gap-4">
                        <MetricCard label="Precision" value={selectedModelForConfig.metrics.precision} color="blue" />
                        <MetricCard label="Recall" value={selectedModelForConfig.metrics.recall} color="indigo" />
                        <MetricCard label="F1-Score" value={selectedModelForConfig.metrics.f1} color="purple" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 mb-4">Confusion Matrix (Sample)</h4>
                        <div className="aspect-video bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 italic">
                            Heatmap Visualization Placeholder
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Test */}
      <AnimatePresence>
        {selectedModelForTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedModelForTest(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <i className="fas fa-vial text-blue-600 mr-3"></i>
                  {t.testModel} - {selectedModelForTest.name}
                </h3>
                <button onClick={() => setSelectedModelForTest(null)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Input Area */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-3 block uppercase tracking-wider">{t.inputText}</label>
                  <div className="relative">
                    <textarea 
                      value={testText}
                      onChange={(e) => setTestText(e.target.value)}
                      placeholder={t.testInputPlaceholder}
                      className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800 resize-none"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <button 
                            onClick={() => setTestText('')}
                            className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700"
                        >
                            {t.clear}
                        </button>
                        <button 
                            onClick={runTest}
                            disabled={isTesting || !testText}
                            className="bg-blue-600 text-white px-6 py-1.5 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 shadow-md"
                        >
                            {isTesting ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-play mr-2"></i>}
                            {t.executeTest}
                        </button>
                    </div>
                  </div>
                </div>

                {/* Results Area */}
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{t.testResult}</h4>
                  
                  {isTesting ? (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="text-4xl mb-4"
                        >
                            <i className="fas fa-circle-notch"></i>
                        </motion.div>
                        <p className="text-sm animate-pulse">{t.analyzing.replace('{model}', selectedModelForTest.baseModel)}</p>
                    </div>
                  ) : testResults.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Highlighted Text */}
                        <div className="p-6 bg-gray-900 rounded-xl text-gray-100 leading-loose font-medium">
                            {testText.split('').map((char, i) => {
                                const entity = testResults.find(r => i >= r.start && i < r.end);
                                if (entity) {
                                    const isStart = i === entity.start;
                                    return (
                                        <span 
                                            key={i} 
                                            className={`${isStart ? 'rounded-l-md' : ''} ${i === entity.end - 1 ? 'rounded-r-md' : ''} bg-blue-500/30 text-blue-300 border-b-2 border-blue-500`}
                                            title={`${entity.type} (${(entity.conf * 100).toFixed(1)}%)`}
                                        >
                                            {char}
                                            {isStart && (
                                                <span className="absolute -top-6 left-0 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {entity.type}
                                                </span>
                                            )}
                                        </span>
                                    );
                                }
                                return <span key={i}>{char}</span>;
                            })}
                        </div>

                        {/* Entity Table */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3">{t.entityText}</th>
                                        <th className="px-4 py-3">{t.entityType}</th>
                                        <th className="px-4 py-3">{t.entityPos}</th>
                                        <th className="px-4 py-3">{t.entityConf}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {testResults.map((res, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-bold text-gray-900">{res.text}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-bold">{res.type}</span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 font-mono">{res.start}-{res.end}</td>
                                            <td className="px-4 py-3 text-green-600 font-bold">{(res.conf * 100).toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                  ) : (
                    <div className="py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 italic">
                        <i className="fas fa-keyboard text-3xl mb-3 opacity-20"></i>
                        {lang === 'zh' ? `输入文本并点击“${t.executeTest}”查看结果` : `Enter text and click "${t.executeTest}" to see results`}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Set Active Confirmation */}
      <AnimatePresence>
        {modelToSetActive && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModelToSetActive(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                    <i className="fas fa-exchange-alt"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t.confirmSetActive}</h3>
                <p className="text-sm text-gray-500 mt-2">{t.setActiveDesc}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-400 uppercase font-bold mb-2">Current Active</div>
                    <div className="flex justify-between items-center">
                        <span className="font-mono text-gray-700">{activeModel?.name || 'None'}</span>
                        <span className="font-bold text-gray-900">{activeModel?.metrics.f1 || 0}%</span>
                    </div>
                </div>
                <div className="flex justify-center">
                    <i className="fas fa-arrow-down text-gray-300"></i>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="text-xs text-purple-400 uppercase font-bold mb-2">New Target</div>
                    <div className="flex justify-between items-center">
                        <span className="font-mono text-purple-700 font-bold">{modelToSetActive.name}</span>
                        <span className="font-bold text-purple-900">{modelToSetActive.metrics.f1}%</span>
                    </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                    onClick={() => setModelToSetActive(null)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg font-bold hover:bg-gray-50"
                >
                    {t.cancel}
                </button>
                <button 
                    onClick={() => handleSetActive(modelToSetActive)}
                    className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 shadow-lg shadow-purple-200"
                >
                    {t.confirm}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* Custom Modals */}
        <AnimatePresence>
          {confirmDeleteId && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmDeleteId(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
              >
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  <i className="fas fa-trash-alt"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t.confirmDelete}</h3>
                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setConfirmDeleteId(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-bold hover:bg-gray-50"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-100"
                  >
                    {t.confirm}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

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
                  {t.confirm}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
};

const ConfigItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <label className="text-xs font-bold text-gray-400 uppercase block mb-1 tracking-wider">{label}</label>
    <div className="text-sm font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded border border-gray-100">{value}</div>
  </div>
);

const MetricCard: React.FC<{ label: string; value: number; color: 'blue' | 'indigo' | 'purple' }> = ({ label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };
  return (
    <div className={`p-4 rounded-xl border ${colors[color]} text-center`}>
      <div className="text-xs font-bold uppercase mb-1 opacity-70">{label}</div>
      <div className="text-2xl font-bold">{value}%</div>
    </div>
  );
};
