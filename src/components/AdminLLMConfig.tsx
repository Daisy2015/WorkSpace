
import React, { useState } from 'react';
import { translations } from '../i18n';
import { Language } from '../types';
import { motion } from 'motion/react';

interface AdminLLMConfigProps {
  lang: Language;
}

export const AdminLLMConfig: React.FC<AdminLLMConfigProps> = ({ lang }) => {
  const t = translations[lang];
  
  // Mock models from AdminLLMManagement
  const models = ['qwen3-max', 'gemini-2.5-pro', 'GPT-4o', 'Claude 3.5 Sonnet'];

  const [configs, setConfigs] = useState({
    oilGas: 'qwen3-max',
    keyword: 'qwen3-max',
    agent: 'qwen3-max',
    nl2sql: 'qwen3-max',
    assembly: 'gemini-2.5-pro',
    mcp: 'qwen3-max'
  });

  const scenarios = [
    { id: 'oilGas', title: t.scenarioOilGas, icon: 'fa-oil-can' },
    { id: 'keyword', title: t.scenarioKeyword, icon: 'fa-tags' },
    { id: 'agent', title: t.scenarioAgent, icon: 'fa-robot' },
    { id: 'nl2sql', title: t.scenarioNL2SQL, icon: 'fa-database' },
    { id: 'assembly', title: t.scenarioAssembly, icon: 'fa-cubes' },
    { id: 'mcp', title: t.scenarioMCP, icon: 'fa-plug' }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <i className="fas fa-sliders-h text-blue-600 mr-3"></i>
          {t.llmConfig}
        </h1>
        <p className="text-sm text-gray-500 mt-1">针对不同场景和工具配置专用的调用模型</p>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <motion.div 
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mr-3">
                  <i className={`fas ${scenario.icon}`}></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{scenario.title}</h3>
              </div>
              
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.selectModel}</label>
                <div className="relative">
                  <select 
                    value={configs[scenario.id as keyof typeof configs]}
                    onChange={(e) => setConfigs(prev => ({ ...prev, [scenario.id]: e.target.value }))}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none"
                  >
                    {models.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <i className="fas fa-chevron-down text-xs"></i>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-12 pb-12">
          <button className="px-8 py-3 border border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all">
            {t.cancel}
          </button>
          <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};
