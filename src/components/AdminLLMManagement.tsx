
import React, { useState } from 'react';
import { translations } from '../i18n';
import { Language } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AdminLLMManagementProps {
  lang: Language;
}

interface LLMModel {
  id: string;
  name: string;
  provider: string;
  type: 'Chat' | 'Embedding' | 'Image';
  endpoint: string;
  enabled: boolean;
  status: 'Online' | 'Offline';
}

const MOCK_LLMS: LLMModel[] = [
  { id: '1', name: 'qwen3-max', provider: 'Alibaba', type: 'Chat', endpoint: 'https://api.aliyun.com/v1/...', enabled: true, status: 'Online' },
  { id: '2', name: 'gemini-2.5-pro', provider: 'Google', type: 'Chat', endpoint: 'https://generativelanguage.googleapis.com/...', enabled: true, status: 'Online' },
  { id: '3', name: 'GPT-4o', provider: 'OpenAI', type: 'Chat', endpoint: 'https://api.openai.com/v1/...', enabled: false, status: 'Online' },
  { id: '4', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', type: 'Chat', endpoint: 'https://api.anthropic.com/v1/...', enabled: true, status: 'Online' },
  { id: '5', name: 'Text-Embedding-004', provider: 'Google', type: 'Embedding', endpoint: 'https://generativelanguage.googleapis.com/...', enabled: true, status: 'Online' },
];

export const AdminLLMManagement: React.FC<AdminLLMManagementProps> = ({ lang }) => {
  const t = translations[lang];
  const [llms, setLlms] = useState<LLMModel[]>(MOCK_LLMS);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState<LLMModel | null>(null);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const toggleEnabled = (id: string) => {
    setLlms(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const handleOpenTest = (llm: LLMModel) => {
    setSelectedLLM(llm);
    setTestInput('');
    setTestOutput('');
    setIsTestModalOpen(true);
  };

  const handleRunTest = async () => {
    if (!testInput.trim()) return;
    setIsTesting(true);
    setTestOutput('');
    
    // Simulate API call
    setTimeout(() => {
      setTestOutput(`[Mock Response from ${selectedLLM?.name}]\n\n这是一条模拟的测试响应内容。大模型已经成功接收到您的输入：“${testInput}”。\n\n在实际环境中，这里将展示模型通过 API 返回的真实推理结果。`);
      setIsTesting(false);
    }, 1500);
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
            <p className="text-sm text-gray-500 mt-1">管理系统接入的大语言模型及其调用配置</p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 flex items-center">
            <i className="fas fa-plus mr-2"></i> {t.newLLM}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">{t.llmName}</th>
                <th className="px-6 py-4">{t.colProvider}</th>
                <th className="px-6 py-4">{t.colModelType}</th>
                <th className="px-6 py-4">{t.colEndpoint}</th>
                <th className="px-6 py-4">{t.llmStatus}</th>
                <th className="px-6 py-4">{t.colEnabled}</th>
                <th className="px-6 py-4 text-right">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {llms.map(llm => (
                <tr key={llm.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{llm.name}</td>
                  <td className="px-6 py-4 text-gray-600">{llm.provider}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      llm.type === 'Chat' ? 'bg-blue-100 text-blue-700' : 
                      llm.type === 'Embedding' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {llm.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs max-w-xs truncate">{llm.endpoint}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center text-xs font-medium text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      {llm.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleEnabled(llm.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${llm.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${llm.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleOpenTest(llm)}
                      className="text-blue-500 hover:text-blue-700 mr-3" 
                      title="测试模型"
                    >
                      <i className="fas fa-vial"></i>
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 mr-3">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="text-red-400 hover:text-red-600">
                      <i className="fas fa-trash"></i>
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
              onClick={() => setIsTestModalOpen(false)}
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
                    <p className="text-xs text-gray-500 mt-0.5">{t.llmTesting}: <span className="font-bold text-blue-600">{selectedLLM.name}</span></p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsTestModalOpen(false)}
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
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-all text-sm"
                >
                  {t.cancel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
