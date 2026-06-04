import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Template {
  id: string;
  name: string;
  category: string;
  image: string;
}

interface SmartProChartCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: { object: string; chartType: string; template: string }) => void;
  lang: 'zh' | 'en';
}

export const SmartProChartCreateModal: React.FC<SmartProChartCreateModalProps> = ({ 
  isOpen, 
  onClose, 
  onGenerate, 
  lang 
}) => {
  const [object, setObject] = useState('');
  const [chartType, setChartType] = useState(lang === 'zh' ? '单井柱状图' : 'Well Log');
  const [selectedTemplate, setSelectedTemplate] = useState('1');
  const [activeCategory, setActiveCategory] = useState(lang === 'zh' ? '单井柱状图' : 'Well Log');

  const categories = lang === 'zh' 
    ? ['单井柱状图', '平面图', '统计图', '工程管柱图', '三维图']
    : ['Well Log', 'Map', 'Stats', 'Engineering', '3D'];

  const templates: Template[] = [
    { id: '1', name: lang === 'zh' ? '层序地层与沉积微相综合柱状图' : 'Sequence Stratigraphy Column', category: lang === 'zh' ? '单井柱状图' : 'Well Log', image: 'https://images.unsplash.com/photo-1590212151175-e58edd96185b?w=400&auto=format&fit=crop&q=80' },
    { id: '2', name: lang === 'zh' ? '碳酸盐岩屑录井图' : 'Carbonate Cutting Log', category: lang === 'zh' ? '单井柱状图' : 'Well Log', image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80' },
    { id: '3', name: lang === 'zh' ? '层序旋回划分柱状图' : 'Sequence Cycle Column', category: lang === 'zh' ? '单井柱状图' : 'Well Log', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&auto=format&fit=crop&q=80' },
    { id: '4', name: lang === 'zh' ? '碎屑岩岩心综合图' : 'Clastic Rock Core Chart', category: lang === 'zh' ? '单井柱状图' : 'Well Log', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&auto=format&fit=crop&q=80' },
    { id: '5', name: lang === 'zh' ? '测井解释和测试成果综合图' : 'Logging & Testing Result Chart', category: lang === 'zh' ? '单井柱状图' : 'Well Log', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80' },
    { id: '6', name: lang === 'zh' ? '综合录井图' : 'Comprehensive Well Log', category: lang === 'zh' ? '单井柱状图' : 'Well Log', image: 'https://images.unsplash.com/photo-1551288049-bbbda5366391?w=400&auto=format&fit=crop&q=80' },
  ];

  const filteredTemplates = templates.filter(t => t.category === activeCategory);

  const handleGenerate = () => {
    if (!object.trim()) return;
    const templateName = templates.find(t => t.id === selectedTemplate)?.name || '';
    onGenerate({ object, chartType, template: templateName });
    onClose();
    setObject('');
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
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <i className="fas fa-globe"></i>
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  {lang === 'zh' ? '智能图件生成' : 'Smart Pro Charts'}
                </h2>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {lang === 'zh' ? '智能成图描述' : 'Smart Plot Description'}
                </label>
                <textarea 
                  value={object}
                  onChange={(e) => setObject(e.target.value)}
                  placeholder={lang === 'zh' ? '请描述您想生成的图件，例如：生成X-1井的长序地层与沉积微相综合柱状图，包含GR、LLS和LLD三条曲线...' : 'Describe what you want to plot...'}
                  className="w-full h-28 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  {lang === 'zh' ? '已有图件模版' : 'Existing Chart Templates'}
                </label>
                
                {/* Tabs */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl w-fit mb-4">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        activeCategory === cat ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {filteredTemplates.length > 0 ? filteredTemplates.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`group relative flex flex-col rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        selectedTemplate === t.id ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                        <img 
                          referrerPolicy="no-referrer"
                          src={`https://images.unsplash.com/photo-${t.id === '1' ? '1581091226825-a6a2a5aee158' : t.id === '2' ? '1504917595217-101a396dae70' : t.id === '3' ? '1513828581220-382a2d9c490a' : t.id === '4' ? '1581092160205-567b5871f36e' : t.id === '5' ? '1518709268808-63955fdb50c5' : '1551288049-bbbda5366391'}?w=400&auto=format&fit=crop&q=80`} 
                          alt={t.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                        />
                        {selectedTemplate === t.id && (
                          <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                              <i className="fas fa-check"></i>
                            </div>
                          </div>
                        )}
                        <button className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm text-red-500 text-[10px] flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          <i className="fas fa-heart"></i>
                        </button>
                      </div>
                      <div className="p-3 bg-white">
                        <p className={`text-[10px] font-bold leading-tight ${selectedTemplate === t.id ? 'text-indigo-600' : 'text-slate-600'}`}>
                          {t.name}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-3 py-12 flex flex-col items-center justify-center text-slate-300">
                      <i className="fas fa-layer-group text-4xl mb-4"></i>
                      <p className="text-sm font-medium">{lang === 'zh' ? '该分类下暂无模版' : 'No templates in this category'}</p>
                    </div>
                  )}
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
                disabled={!object.trim()}
                onClick={handleGenerate}
                className="px-8 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
              >
                <i className="fas fa-magic text-xs"></i>
                {lang === 'zh' ? '开始生成' : 'Generate'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
