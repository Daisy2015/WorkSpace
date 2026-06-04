import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SmartChartCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: { topic: string; chartType: string; resources: string[] }) => void;
  lang: 'zh' | 'en';
  availableResources: string[];
}

export const SmartChartCreateModal: React.FC<SmartChartCreateModalProps> = ({ 
  isOpen, 
  onClose, 
  onGenerate, 
  lang,
  availableResources 
}) => {
  const [query, setQuery] = useState('');
  const [chartType, setChartType] = useState('line');
  const [selectedResources, setSelectedResources] = useState<string[]>(availableResources.slice(0, 2));
  const [activeTab, setActiveTab] = useState<'ai' | 'upload' | 'raw'>('ai');

  const chartTypes = [
    { id: 'line', name: lang === 'zh' ? '折线图' : 'Line', icon: 'fa-chart-line' },
    { id: 'bar', name: lang === 'zh' ? '柱状图' : 'Bar', icon: 'fa-chart-bar' },
    { id: 'pie', name: lang === 'zh' ? '饼图' : 'Pie', icon: 'fa-chart-pie' },
    { id: 'scatter', name: lang === 'zh' ? '散点图' : 'Scatter', icon: 'fa-braille' },
  ];

  const handleGenerate = () => {
    if (activeTab === 'ai' && !query.trim()) return;
    onGenerate({ 
      topic: query || (lang === 'zh' ? '未命名图表' : 'Untitled Chart'), 
      chartType, 
      resources: selectedResources 
    });
    onClose();
    setQuery('');
  };

  const toggleResource = (name: string) => {
    setSelectedResources(prev => 
      prev.includes(name) ? prev.filter(r => r !== name) : [...prev, name]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
                  <i className="fas fa-chart-area"></i>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {lang === 'zh' ? '智能数据成图' : 'Smart Data Plotting'}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {lang === 'zh' ? '通过对话或上传数据快速生成可视化图表' : 'Create visualizations via chat or data upload'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Resource Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  {lang === 'zh' ? '已选关联资源' : 'Linked Resources'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableResources.map(res => (
                    <button
                      key={res}
                      onClick={() => toggleResource(res)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-2 ${
                        selectedResources.includes(res) 
                        ? 'bg-blue-50 border-blue-200 text-blue-600' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <i className={`fas ${selectedResources.includes(res) ? 'fa-check-circle' : 'fa-plus'}`}></i>
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Source Tabs */}
              <div className="space-y-4">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                  {[
                    { id: 'ai', name: lang === 'zh' ? '智能查数' : 'AI Query', icon: 'fa-magic' },
                    { id: 'upload', name: lang === 'zh' ? '上传文档' : 'Upload', icon: 'fa-upload' },
                    { id: 'raw', name: lang === 'zh' ? '手动输入' : 'Raw Data', icon: 'fa-keyboard' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                        activeTab === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <i className={`fas ${tab.icon} opacity-70`}></i>
                      {tab.name}
                    </button>
                  ))}
                </div>

                <div className="min-h-[120px]">
                  {activeTab === 'ai' && (
                    <textarea 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={lang === 'zh' ? '请描述你想展示的数据，例如：提取近一年的日产量并对比...' : 'Describe what you want to plot...'}
                      className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all resize-none"
                    />
                  )}
                  {activeTab === 'upload' && (
                    <div className="w-full h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm group-hover:text-blue-500 mb-2">
                        <i className="fas fa-cloud-upload-alt"></i>
                      </div>
                      <p className="text-xs font-bold text-slate-500">{lang === 'zh' ? '拖拽或点击上传本地文档 (CSV, XLSX, PDF)' : 'Drag or click to upload files'}</p>
                    </div>
                  )}
                  {activeTab === 'raw' && (
                    <textarea 
                      placeholder={lang === 'zh' ? '请输入CSV或JSON格式的原始数据...' : 'Enter raw CSV or JSON data...'}
                      className="w-full h-32 px-4 py-3 font-mono text-[10px] bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all resize-none"
                    />
                  )}
                </div>
              </div>

              {/* Chart Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  {lang === 'zh' ? '选择图表类型' : 'Select Chart Type'}
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {chartTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setChartType(type.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                        chartType === type.id 
                        ? 'bg-pink-50 border-pink-200 text-pink-600 ring-2 ring-pink-500/10' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <i className={`fas ${type.icon} text-lg`}></i>
                      <span className="text-[10px] font-bold">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-5 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button 
                disabled={activeTab === 'ai' && !query.trim()}
                onClick={handleGenerate}
                className="px-8 py-2 bg-pink-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-pink-600/20 hover:bg-pink-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
              >
                <i className="fas fa-magic text-xs"></i>
                {lang === 'zh' ? '开始分析生成' : 'Generate Chart'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
