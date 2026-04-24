import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, HelpCircle, ArrowRight, Zap, Shield, Globe, Gem, Users, Briefcase, BarChart3, FileText, Layout, MessageSquare, Plus } from 'lucide-react';

interface VersionComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion?: 'foundation' | 'professional' | 'enterprise';
}

interface VersionData {
  id: 'foundation' | 'professional' | 'enterprise';
  name: string;
  enName: string;
  badge: string;
  agentCount: number | '不限';
  features: string[];
  agentSplit: string;
  suitable: string;
  color: string;
  gradient: string;
  border: string;
  icon: React.ReactNode;
  scene: string;
}

export const VersionComparisonModal: React.FC<VersionComparisonModalProps> = ({ isOpen, onClose, currentVersion = 'foundation' }) => {
  const [selectedVersion, setSelectedVersion] = useState<'foundation' | 'professional' | 'enterprise'>(currentVersion);
  const [hoveredVersion, setHoveredVersion] = useState<string | null>(null);

  const versions: VersionData[] = useMemo(() => [
    {
      id: 'foundation',
      name: '基础版',
      enName: 'Foundation',
      badge: '轻量起步',
      agentCount: 5,
      features: ['智能问数', '数据成图', '总结摘要', '动态报表'],
      agentSplit: '集成 5 个专业智能体',
      suitable: '个人分析与办公汇报',
      color: 'indigo',
      gradient: 'from-gray-50 to-slate-50',
      border: 'border-gray-200',
      icon: <Zap className="w-6 h-6 text-slate-600" />,
      scene: '分析数据，快速成图'
    },
    {
      id: 'professional',
      name: '专业版',
      enName: 'Professional',
      badge: '推荐升级',
      agentCount: 20,
      features: ['场景辅助', '联动归因', '优化方案', '专业诊断'],
      agentSplit: '集成 20 个专业智能体',
      suitable: '部门级专业闭环诊断',
      color: 'blue',
      gradient: 'from-blue-50 to-cyan-50',
      border: 'border-blue-200',
      icon: <Layout className="w-6 h-6 text-blue-600" />,
      scene: '多维诊断，提供方案'
    },
    {
      id: 'enterprise',
      name: '企业版',
      enName: 'Enterprise',
      badge: '岗位数字员工',
      agentCount: 100,
      features: ['岗位智能', '自动流程', '知识中台', '协同管理'],
      agentSplit: '集成 100 个专业智能体',
      suitable: '中大型企业全流程提效',
      color: 'purple',
      gradient: 'from-purple-50 to-fuchsia-50',
      border: 'border-purple-200',
      icon: <Users className="w-6 h-6 text-purple-600" />,
      scene: '岗位闭环，流程自动'
    }
  ], []);

  const comparisonItems = [
    { label: '能力继承关系', values: ['起始版本', '包含基础版全部能力', '包含专业版全部能力'] },
    { label: '通用智能体', values: [true, true, true] },
    { label: '智能问数', values: [true, true, true] },
    { label: '数据成图', values: [true, true, true] },
    { label: '摘要生成', values: [true, true, true] },
    { label: '报告/PPT基础生成', values: [true, true, true] },
    { label: '场景智能体', values: [false, true, true] },
    { label: '多指标联动归因', values: [false, true, true] },
    { label: '自动化优化方案', values: [false, true, true] },
    { label: '岗位智能体', values: [false, false, true] },
    { label: '全流程自动化', values: [false, false, true] },
    { label: '企业级知识库集成', values: [false, false, true] },
    { label: '私有化部署', values: ['不支持', '不支持', '支持'] },
    { label: '专属算力保障', values: ['共享', '共享', '优先'] },
  ];

  const getAgentBarWidth = (count: number | string) => {
    if (count === '不限') return '100%';
    return `${Math.min(((count as number) / 100) * 100, 100)}%`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal Body */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-[960px] h-[680px] rounded-[24px] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">选择适合你的智能体版本</h2>
            <p className="text-sm text-gray-500">所有高版本完整包含低版本能力，按可用智能体数量灵活计费</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6 space-y-8">
          {/* Version Cards */}
          <div className="grid grid-cols-3 gap-4">
            {versions.map((v) => (
              <motion.div
                key={v.id}
                onMouseEnter={() => setHoveredVersion(v.id)}
                onMouseLeave={() => setHoveredVersion(null)}
                onClick={() => setSelectedVersion(v.id)}
                className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col h-full bg-gradient-to-br ${v.gradient} ${
                  selectedVersion === v.id ? v.border + ' shadow-lg scale-[1.02]' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Badges */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    v.id === 'professional' ? 'bg-blue-100 text-blue-700' :
                    v.id === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {v.badge}
                  </span>
                  {currentVersion === v.id && (
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">当前</span>
                  )}
                  {v.id === 'professional' && currentVersion === 'foundation' && (
                    <div className="relative">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping absolute inset-0"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full relative"></div>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center`}>
                    {v.icon}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{v.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono uppercase">{v.enName}</div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6 flex-1">
                  {v.features.slice(0, 5).map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-gray-600">
                      <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Agent Visual */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">智能体数量</span>
                    <span className="text-xs font-bold text-gray-900">{v.agentCount}{v.agentCount !== '不限' ? '个' : ''}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: getAgentBarWidth(v.agentCount) }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className={`h-full rounded-full ${
                        v.id === 'foundation' ? 'bg-gray-400' :
                        v.id === 'professional' ? 'bg-blue-500' :
                        'bg-purple-500'
                      }`}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 whitespace-pre-line leading-relaxed">
                    {v.agentSplit}
                  </div>
                </div>

                {/* Suitable */}
                <div className="mt-auto">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">适合人群</div>
                  <div className="text-[11px] text-gray-700 leading-relaxed">{v.suitable}</div>
                </div>

                {/* Hover Overlay */}
                <AnimatePresence>
                  {hoveredVersion === v.id && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-indigo-600/90 rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10"
                    >
                      <div className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">典型应用场景</div>
                      <div className="text-white text-sm font-medium leading-relaxed">
                        {v.scene}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
              详细功能对比
            </h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-200">
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-1/4">对比项</th>
                    {versions.map(v => (
                      <th key={v.id} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-center ${v.id === 'professional' ? 'bg-blue-50/50 text-blue-700' : 'text-gray-500'}`}>
                        {v.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {comparisonItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white transition-colors group">
                      <td className="px-4 py-3 text-xs font-medium text-gray-700">{item.label}</td>
                      {item.values.map((val, vIdx) => (
                        <td key={vIdx} className={`px-4 py-3 text-xs text-center ${vIdx === 1 ? 'bg-blue-50/30' : ''}`}>
                          {typeof val === 'boolean' ? (
                            val ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>
                          ) : (
                            <span className={vIdx === 1 ? 'text-blue-700 font-medium' : 'text-gray-600'}>{val}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button className="text-xs font-medium text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
              查看能力清单 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right mr-2">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">💡 能力跃迁</div>
              <div className="text-xs text-gray-600">从个人助手到组织级智能协同</div>
            </div>
            <button className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition-all">
              增购智能体
            </button>
            <button 
              className={`px-8 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg transition-all flex items-center gap-2 ${
                selectedVersion === currentVersion 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:shadow-indigo-200'
              }`}
            >
              {selectedVersion === currentVersion ? '当前已是该版本' : (
                <>
                  立即升级到 {versions.find(v => v.id === selectedVersion)?.name}
                  <Zap className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
