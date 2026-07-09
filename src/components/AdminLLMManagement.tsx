import React, { useState } from 'react';
import { translations } from '../i18n';
import { Language } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AdminLLMManagementProps {
  lang: Language;
}

interface LLMModel {
  id: string;
  code: string;        // 模型编码 (模型的真实名称)
  maxTokens: number;   // 最大输入 Token
  enabled: boolean;    // 启用状态
  configJson: string;  // 模型的配置信息, json输入
  type: 'Chat' | 'Embedding' | 'Image';
  status: 'Online' | 'Offline';
}

const MOCK_LLMS: LLMModel[] = [
  { id: '1', code: 'qwen-max', maxTokens: 128000, enabled: true, configJson: '{\n  "api_key": "sk-qwen...",\n  "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1"\n}', type: 'Chat', status: 'Online' },
  { id: '2', code: 'gemini-2.5-pro', maxTokens: 2000000, enabled: false, configJson: '{\n  "api_key": "AIzaSy...",\n  "base_url": "https://generativelanguage.googleapis.com"\n}', type: 'Chat', status: 'Online' },
  { id: '3', code: 'gpt-4o', maxTokens: 128000, enabled: false, configJson: '{\n  "api_key": "sk-proj-...",\n  "base_url": "https://api.openai.com/v1"\n}', type: 'Chat', status: 'Online' },
  { id: '4', code: 'claude-3-5-sonnet', maxTokens: 200000, enabled: false, configJson: '{\n  "api_key": "sk-ant-...",\n  "base_url": "https://api.anthropic.com/v1"\n}', type: 'Chat', status: 'Online' },
];

export const AdminLLMManagement: React.FC<AdminLLMManagementProps> = ({ lang }) => {
  const t = translations[lang];
  const [llms, setLlms] = useState<LLMModel[]>(MOCK_LLMS);
  
  // Test modal states
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState<LLMModel | null>(null);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isStream, setIsStream] = useState(true);
  const [testCaller, setTestCaller] = useState('模型测试');
  const streamIntervalRef = React.useRef<any>(null);

  // Form (Add / Edit) modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<LLMModel>>({
    code: '',
    maxTokens: 128000,
    enabled: false,
    configJson: '{\n  "api_key": "",\n  "base_url": ""\n}',
    type: 'Chat',
    status: 'Online'
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const toggleEnabled = (id: string) => {
    setLlms(prev => {
      const isEnabling = !prev.find(m => m.id === id)?.enabled;
      return prev.map(m => {
        if (m.id === id) {
          return { ...m, enabled: isEnabling };
        } else if (isEnabling) {
          return { ...m, enabled: false };
        }
        return m;
      });
    });
  };

  const handleOpenTest = (llm: LLMModel) => {
    setSelectedLLM(llm);
    setTestInput('');
    setTestOutput('');
    setIsStream(true);
    setTestCaller('模型测试');
    setIsTestModalOpen(true);
  };

  const handleCloseTestModal = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    setIsTestModalOpen(false);
  };

  const handleRunTest = async () => {
    if (!testInput.trim()) return;
    setIsTesting(true);
    setTestOutput('');
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }

    const isZh = lang === 'zh';
    const baseText = isZh
      ? `[来自 ${selectedLLM?.code} 的模拟响应]\n\n这是一条模拟的测试响应内容。大模型已经成功接收到您的输入：“${testInput}”。\n\n在实际环境中，这里将展示模型通过 API 返回的真实推理结果。`
      : `[Mock Response from ${selectedLLM?.code}]\n\nThis is a mock test response. The LLM has successfully received your input: "${testInput}".\n\nIn a real production environment, this area will display the actual model inference results returned via API.`;

    const writeLog = () => {
      const inTokens = Math.max(12, Math.round(testInput.length * 0.7));
      const outTokens = Math.max(24, Math.round(baseText.length * 0.75));
      const dur = isStream ? Math.round(500 + baseText.length * 15) : 1000;
      
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const getModelName = (code: string) => {
        const mapping: Record<string, string> = {
          'qwen-max': '通义千问-Max',
          'gemini-2.5-pro': 'Gemini 2.5 Pro',
          'gpt-4o': 'GPT-4o',
          'claude-3-5-sonnet': 'Claude 3.5 Sonnet',
          'deepseek-chat': 'DeepSeek-V3',
          'ernie-4.0': '文心一言 4.0'
        };
        return mapping[code] || code;
      };

      const newLog = {
        id: `log-llm-${Date.now()}`,
        modelCode: selectedLLM?.code || 'unknown',
        modelName: getModelName(selectedLLM?.code || 'unknown'),
        startTime: timeStr,
        durationMs: dur,
        inputTokens: inTokens,
        outputTokens: outTokens,
        totalTokens: inTokens + outTokens,
        status: 'success',
        input: testInput,
        output: baseText,
        caller: testCaller
      };

      try {
        const stored = localStorage.getItem('llm_call_logs');
        const logs = stored ? JSON.parse(stored) : [];
        logs.unshift(newLog);
        localStorage.setItem('llm_call_logs', JSON.stringify(logs));
      } catch (e) {
        console.error('Failed to save log', e);
      }
    };

    if (isStream) {
      let index = 0;
      setTimeout(() => {
        streamIntervalRef.current = setInterval(() => {
          setTestOutput(prev => prev + baseText.charAt(index));
          index++;
          if (index >= baseText.length) {
            clearInterval(streamIntervalRef.current);
            streamIntervalRef.current = null;
            setIsTesting(false);
            writeLog();
          }
        }, 15);
      }, 500);
    } else {
      setTimeout(() => {
        setTestOutput(baseText);
        setIsTesting(false);
        writeLog();
      }, 1000);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      code: '',
      maxTokens: 128000,
      enabled: false,
      configJson: '{\n  "api_key": "",\n  "base_url": ""\n}',
      type: 'Chat',
      status: 'Online'
    });
    setJsonError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (llm: LLMModel) => {
    setEditingId(llm.id);
    setFormData({ ...llm });
    setJsonError(null);
    setIsFormModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const text = lang === 'zh' ? '确认要删除该大模型吗？' : 'Are you sure you want to delete this LLM model?';
    if (window.confirm(text)) {
      setLlms(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleSave = () => {
    // Validate fields
    if (!formData.code?.trim()) {
      setJsonError(lang === 'zh' ? '模型编码不能为空' : 'Model Code cannot be empty');
      return;
    }

    // Validate JSON
    try {
      JSON.parse(formData.configJson || '{}');
      setJsonError(null);
    } catch (err: any) {
      setJsonError((lang === 'zh' ? '配置信息必须是合法的 JSON 格式: ' : 'Configuration must be a valid JSON format: ') + err.message);
      return;
    }

    const isEnabling = !!formData.enabled;

    if (editingId) {
      // Edit mode
      setLlms(prev => {
        let updated = prev.map(m => m.id === editingId ? { ...m, ...formData as LLMModel } : m);
        if (isEnabling) {
          updated = updated.map(m => m.id === editingId ? m : { ...m, enabled: false });
        }
        return updated;
      });
    } else {
      // Add mode
      const newLlm: LLMModel = {
        id: Date.now().toString(),
        code: formData.code.trim(),
        maxTokens: formData.maxTokens || 128000,
        enabled: isEnabling,
        configJson: formData.configJson || '{}',
        type: formData.type || 'Chat',
        status: formData.status || 'Online'
      };
      setLlms(prev => {
        let updated = [...prev, newLlm];
        if (isEnabling) {
          updated = updated.map(m => m.id === newLlm.id ? m : { ...m, enabled: false });
        }
        return updated;
      });
    }
    setIsFormModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-brain text-purple-600 mr-3"></i>
              {t.llmManagement}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {lang === 'zh' ? '管理系统接入的大语言模型、模型编码、Token及调用配置' : 'Manage system large language models, codes, token limits and API configurations'}
            </p>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 flex items-center"
          >
            <i className="fas fa-plus mr-2"></i> {t.newLLM}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">{lang === 'zh' ? '模型编码 (真实名称)' : 'Model Code (Real Name)'}</th>
                <th className="px-6 py-4">{lang === 'zh' ? '最大输入 Token' : 'Max Input Token'}</th>
                <th className="px-6 py-4">{lang === 'zh' ? '启用状态' : 'Status'}</th>
                <th className="px-6 py-4 text-right">{lang === 'zh' ? '操作' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {llms.map(llm => (
                <tr key={llm.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 font-bold">
                      {llm.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-gray-700">
                    {llm.maxTokens.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleEnabled(llm.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${llm.enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${llm.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className={`text-xs font-bold ${llm.enabled ? 'text-indigo-600 font-black' : 'text-gray-450'}`}>
                        {llm.enabled ? (lang === 'zh' ? '已启用' : 'Enabled') : (lang === 'zh' ? '已停用' : 'Disabled')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleOpenTest(llm)}
                      className="text-indigo-500 hover:text-indigo-700 mr-3.5 transition-colors" 
                      title={lang === 'zh' ? '测试模型' : 'Test Model'}
                    >
                      <i className="fas fa-vial text-base"></i>
                    </button>
                    <button 
                      onClick={() => handleOpenEdit(llm)}
                      className="text-gray-450 hover:text-gray-700 mr-3.5 transition-colors"
                      title={lang === 'zh' ? '编辑模型' : 'Edit Model'}
                    >
                      <i className="fas fa-edit text-base"></i>
                    </button>
                    <button 
                      onClick={() => handleDelete(llm.id)}
                      className="text-red-450 hover:text-red-600 transition-colors"
                      title={lang === 'zh' ? '删除模型' : 'Delete Model'}
                    >
                      <i className="fas fa-trash text-base"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Modal */}
      <AnimatePresence>
        {isTestModalOpen && selectedLLM && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseTestModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mr-4">
                    <i className="fas fa-vial text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{t.llmTest}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{t.llmTesting}: <span className="font-bold text-blue-600 font-mono">{selectedLLM.code}</span></p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseTestModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-400"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Input Section */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                    <span>{t.llmTestInput}</span>
                    <span className={testInput.length > 500 ? 'text-red-500' : ''}>{testInput.length}/1000</span>
                  </label>
                  <textarea 
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder={t.llmTestInputPlaceholder}
                    className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none outline-none"
                  />
                </div>

                {/* Stream Configuration Switch */}
                <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="max-w-[75%]">
                    <span className="text-xs font-bold text-gray-800 block">
                      {lang === 'zh' ? '是否流式输出' : 'Stream Output'}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {lang === 'zh' ? '开启后，模型生成的测试结果将以打字机流式效果逐步动态呈现' : 'When enabled, responses will stream dynamically in typewriter style.'}
                    </span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsStream(!isStream)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isStream ? 'bg-blue-600' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isStream ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                  <button 
                    onClick={handleRunTest}
                    disabled={isTesting || !testInput.trim()}
                    className={`px-8 py-3 rounded-xl font-bold flex items-center transition-all shadow-lg ${
                      isTesting || !testInput.trim() 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                    }`}
                  >
                    {isTesting ? (
                      <>
                        <i className="fas fa-circle-notch fa-spin mr-2"></i>
                        {t.llmRunningTest}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        {t.llmRunTest}
                      </>
                    )}
                  </button>
                </div>

                {/* Output Section */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.llmTestOutput}</label>
                  <div className={`w-full min-h-[160px] p-4 rounded-xl border border-gray-200 text-sm font-mono whitespace-pre-wrap transition-all ${
                    testOutput ? 'bg-blue-50/30 border-blue-100 text-gray-800' : 'bg-gray-50 text-gray-400 italic flex items-center justify-center'
                  }`}>
                    {testOutput || (isTesting ? t.llmWaitingResponse : t.llmTestOutputPlaceholder)}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={handleCloseTestModal}
                  className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-all text-sm"
                >
                  {t.cancel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mr-4">
                    <i className={`fas ${editingId ? 'fa-edit' : 'fa-plus'} text-lg`}></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingId ? '编辑大模型' : '新增大模型'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {editingId ? '修改当前大模型的底层配置与属性' : '在智能平台中接入并配置新的大语言模型'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsFormModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-400"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Form fields */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Code */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">模型编码 (真实名称)</label>
                    <input 
                      type="text"
                      value={formData.code || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="如：qwen-max"
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono"
                    />
                  </div>

                  {/* Max Tokens */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">最大输入 Token</label>
                    <input 
                      type="number"
                      value={formData.maxTokens || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 0 }))}
                      placeholder="如：128000"
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Switch for Enabled */}
                <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="max-w-[75%]">
                    <span className="text-xs font-bold text-gray-800 block">设为当前启用模型</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">同一时间有且仅能启用一个大模型。如果启用，其他模型将被自动禁用。</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Config JSON text field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-700 block">配置信息 (JSON 格式)</label>
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, configJson: '{\n  "api_key": "sk-...",\n  "base_url": "https://api.example.com/v1"\n}' }))}
                      className="text-[10px] text-indigo-600 hover:underline font-bold"
                    >
                      填充模板
                    </button>
                  </div>
                  <textarea 
                    value={formData.configJson || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, configJson: e.target.value }))}
                    placeholder={`{\n  "api_key": "your-api-key",\n  "base_url": "https://api.openai.com/v1"\n}`}
                    className="w-full h-40 p-3.5 bg-slate-900 text-indigo-100 border border-slate-800 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none shadow-inner"
                  />
                </div>

                {/* JSON Validation / Error Message */}
                {jsonError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-start gap-2 animate-pulse">
                    <i className="fas fa-exclamation-circle mt-0.5"></i>
                    <span>{jsonError}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-all text-sm"
                >
                  取消
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-xl transition-all text-sm shadow-md cursor-pointer"
                >
                  确认保存
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
