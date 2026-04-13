import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ReportTemplate {
  id: string;
  title: string;
  desc: string;
}

interface Category {
  title: string;
  icon: string;
  templates: ReportTemplate[];
}

interface ReportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'zh' | 'en';
}

export const ReportTemplateModal: React.FC<ReportTemplateModalProps> = ({ isOpen, onClose, lang }) => {
  const templates: ReportTemplate[] = [
    { id: 'd1', title: lang === 'zh' ? '产量下降原因诊断' : 'Production Decline Diagnosis', desc: lang === 'zh' ? '深度分析产量波动主控因素，识别地层及设备原因' : 'Deep analysis of production fluctuations and identification of causes' },
    { id: 'd2', title: lang === 'zh' ? '井下工况智能诊断' : 'Downhole Condition Diagnosis', desc: lang === 'zh' ? '实时识别泵效异常及漏失风险，保障作业安全' : 'Real-time identification of pump efficiency anomalies and leakage risks' },
    { id: 's1', title: lang === 'zh' ? '增产措施优化方案' : 'STIM Optimization Proposal', desc: lang === 'zh' ? '量化评估压裂、酸化等增产效果，优选作业参数' : 'Quantitative assessment of stimulation effects and optimization of parameters' },
    { id: 's2', title: lang === 'zh' ? '注采系统调整方案' : 'I-P System Adjustment', desc: lang === 'zh' ? '优化注采比，提升水驱波及效率，改善开发效果' : 'Optimization of injection-production ratio and improvement of sweep efficiency' },
    { id: 'e1', title: lang === 'zh' ? '圈闭有效性评价报告' : 'Trap Effectiveness Report', desc: lang === 'zh' ? '多维度评估含油气性及保存条件，降低勘探风险' : 'Multi-dimensional assessment of oil and gas bearing and preservation conditions' },
    { id: 'e2', title: lang === 'zh' ? '油藏开发动态评价' : 'Reservoir Development Evaluation', desc: lang === 'zh' ? '评价采收率及剩余油分布规律，指导后期开发' : 'Evaluation of recovery factor and residual oil distribution' },
    { id: 'de1', title: lang === 'zh' ? '井身结构优化设计' : 'Well Structure Design', desc: lang === 'zh' ? '满足复杂地层钻进及后期作业需求，降低钻井风险' : 'Meeting the needs of complex formation drilling and later operations' },
    { id: 'de2', title: lang === 'zh' ? '完井工艺集成设计' : 'Completion Process Design', desc: lang === 'zh' ? '匹配储层特性，保障长期稳定产出，延长油井寿命' : 'Matching reservoir characteristics to ensure long-term stable output' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                  <i className="fas fa-file-signature text-xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{lang === 'zh' ? '创建专业报告' : 'Create Professional Report'}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{lang === 'zh' ? '选择专业模版快速生成行业深度诊断与设计报告' : 'Select a professional template to generate in-depth industry reports'}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(tpl => (
                  <div 
                    key={tpl.id}
                    className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer relative flex flex-col h-full"
                  >
                    <div className="flex-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <i className={`fas ${tpl.id.startsWith('d') ? 'fa-stethoscope' : tpl.id.startsWith('s') ? 'fa-lightbulb' : tpl.id.startsWith('e') ? 'fa-chart-bar' : 'fa-drafting-compass'} text-sm`}></i>
                      </div>
                      <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-3 leading-snug text-base">
                        {tpl.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {tpl.desc}
                      </p>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">
                        {tpl.id.startsWith('d') ? (lang === 'zh' ? '诊断' : 'DIAGNOSIS') : 
                         tpl.id.startsWith('s') ? (lang === 'zh' ? '方案' : 'PROPOSAL') : 
                         tpl.id.startsWith('e') ? (lang === 'zh' ? '评价' : 'EVALUATION') : 
                         (lang === 'zh' ? '设计' : 'DESIGN')}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        <i className="fas fa-arrow-right text-[10px]"></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-slate-100 bg-white flex justify-end items-center gap-4">
              <div className="mr-auto text-xs text-slate-400 flex items-center gap-2">
                <i className="fas fa-info-circle"></i>
                <span>{lang === 'zh' ? '模版将根据当前工作空间资源自动填充基础数据' : 'Templates will auto-fill basic data based on current workspace resources'}</span>
              </div>
              <button 
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button 
                className="px-8 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
              >
                <span>{lang === 'zh' ? '开始创作' : 'Start Creating'}</span>
                <i className="fas fa-magic text-xs"></i>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
