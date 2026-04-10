import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Workspace, WorkspaceStatus, Language, WorkspaceTemplate } from '../types';
import { WorkspaceConstructionLoading } from './WorkspaceConstructionLoading';

interface WorkspaceBuilderProps {
  workspaceName: string;
  workspaceDescription?: string;
  workspaceObjects?: string[];
  onClose: () => void;
  lang: Language;
}

enum BuilderState {
  NORMAL = 'NORMAL',
  COMPLETING = 'COMPLETING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

const MOCK_MBU_TREE = [
  { id: '1', name: '资料准备', status: 'completed' },
  { id: '2', name: '测井解释', status: 'completed' },
  { id: '3', name: '层位划分', status: 'warning', children: [
    { id: '3-1', name: '地层对比', status: 'completed' },
    { id: '3-2', name: '层位标定', status: 'warning' }
  ]},
  { id: '4', name: '储量计算', status: 'completed' },
  { id: '5', name: '方案设计', status: 'warning' }
];

export const WorkspaceBuilder: React.FC<WorkspaceBuilderProps> = ({ 
  workspaceName, 
  workspaceDescription, 
  workspaceObjects, 
  onClose,
  lang
}) => {
  const [state, setState] = useState<BuilderState>(BuilderState.NORMAL);
  const [selectedNode, setSelectedNode] = useState(MOCK_MBU_TREE[2]);
  const [completeness, setCompleteness] = useState(72);
  const [completingStep, setCompletingStep] = useState(0);
  const [isSmartModalOpen, setIsSmartModalOpen] = useState(false);

  const completingSteps = [
    "正在识别缺失内容...",
    "正在为你补充关键成果...",
    "正在优化整体流程结构..."
  ];

  const handleOneClickComplete = () => {
    setState(BuilderState.COMPLETING);
    setCompletingStep(0);
    
    // Simulate steps
    setTimeout(() => setCompletingStep(1), 1500);
    setTimeout(() => setCompletingStep(2), 3000);
    setTimeout(() => {
      setState(BuilderState.COMPLETED);
      setCompleteness(100);
    }, 4500);
  };

  const renderNormalState = () => (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Process Tree */}
      <div className="w-1/4 border-r border-gray-200 p-4 overflow-y-auto bg-gray-50/30">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <i className="fas fa-sitemap text-blue-500"></i> 流程树 (MBU结构)
        </h3>
        <div className="space-y-1">
          {MOCK_MBU_TREE.map(node => (
            <div key={node.id} className="mb-1">
              <div 
                className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${selectedNode.id === node.id ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100' : 'hover:bg-gray-100 text-gray-600'}`} 
                onClick={() => setSelectedNode(node)}
              >
                <div className="flex items-center gap-2">
                  {node.status === 'completed' ? (
                    <i className="fas fa-check-circle text-green-500 text-xs"></i>
                  ) : (
                    <i className="fas fa-exclamation-circle text-orange-400 text-xs"></i>
                  )}
                  <span className="text-sm">{node.name}</span>
                </div>
                {node.status === 'warning' && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">⚠</span>}
              </div>
              {node.children?.map(child => (
                <div 
                  key={child.id} 
                  className={`ml-6 mt-1 p-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${selectedNode.id === child.id ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100' : 'hover:bg-gray-100 text-gray-500'}`} 
                  onClick={() => setSelectedNode(child as any)}
                >
                  <div className="flex items-center gap-2">
                    {child.status === 'completed' ? (
                      <i className="fas fa-check text-green-400 text-[10px]"></i>
                    ) : (
                      <i className="fas fa-circle text-gray-300 text-[8px]"></i>
                    )}
                    <span className="text-xs">{child.name}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Center: Outcomes */}
      <div className="w-1/4 border-r border-gray-200 p-5 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">当前节点</h3>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <span className="font-bold text-blue-800">{selectedNode.name}</span>
          </div>
        </div>
        
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <i className="fas fa-file-alt text-green-500"></i> 已完成成果
        </h3>
        <div className="space-y-3">
          <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-between group hover:border-green-200 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <i className="fas fa-check text-sm"></i>
              </div>
              <span className="text-sm font-medium text-gray-700">层位划分报告</span>
            </div>
            <button className="opacity-0 group-hover:opacity-100 text-xs font-bold text-blue-600 hover:underline">查看</button>
          </div>
          <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-between group hover:border-green-200 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <i className="fas fa-check text-sm"></i>
              </div>
              <span className="text-sm font-medium text-gray-700">地层对比图</span>
            </div>
            <button className="opacity-0 group-hover:opacity-100 text-xs font-bold text-blue-600 hover:underline">查看</button>
          </div>
        </div>
      </div>

      {/* Right: Missing Outcomes */}
      <div className="w-1/4 border-r border-gray-200 p-5 overflow-y-auto bg-orange-50/10">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <i className="fas fa-exclamation-triangle text-orange-500"></i> 缺少成果
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-white border border-orange-100 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-orange-500 font-bold text-sm">⚠ 岩石力学参数</span>
            </div>
            <button className="w-full py-2 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm">
              一键添加
            </button>
          </div>
          <div className="p-4 bg-white border border-orange-100 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-orange-500 font-bold text-sm">⚠ 地应力分析报告</span>
            </div>
            <button className="w-full py-2 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm">
              一键添加
            </button>
          </div>
        </div>
      </div>

      {/* Far Right: Recommended */}
      <div className="w-1/4 p-5 overflow-y-auto bg-gray-50/50">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <i className="fas fa-lightbulb text-amber-500"></i> 推荐成果 (AI)
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-all group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-bold text-gray-800">地应力模型</span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">匹配 92%</span>
            </div>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">基于相似地质背景推荐得到，可补充当前节点缺失参数。</p>
            <button className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">
              插入流程
            </button>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-all group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-bold text-gray-800">邻井A-2地层数据</span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">相似 87%</span>
            </div>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">空间距离邻近，地层特征具有高度参考价值。</p>
            <button className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">
              插入流程
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompletingState = () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-white p-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <i className="fas fa-sync fa-spin text-xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">正在完善你的Workspace...</h2>
            <p className="text-gray-500">正在进行全局智能化补全</p>
          </div>
        </div>

        <div className="space-y-6 mb-10">
          <div className={`flex items-center gap-4 transition-opacity ${completingStep >= 0 ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${completingStep > 0 ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
              {completingStep > 0 ? <i className="fas fa-check text-xs"></i> : <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>}
            </div>
            <span className="font-medium text-gray-700">补充流程步骤（地应力分析）</span>
          </div>
          <div className={`flex items-center gap-4 transition-opacity ${completingStep >= 1 ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${completingStep > 1 ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
              {completingStep > 1 ? <i className="fas fa-check text-xs"></i> : completingStep === 1 ? <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div> : null}
            </div>
            <span className="font-medium text-gray-700">补充成果（岩石力学参数）</span>
          </div>
          <div className={`flex items-center gap-4 transition-opacity ${completingStep >= 2 ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${completingStep > 2 ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
              {completingStep > 2 ? <i className="fas fa-check text-xs"></i> : completingStep === 2 ? <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div> : null}
            </div>
            <span className="font-medium text-gray-700">优化流程结构</span>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
          <i className="fas fa-info-circle text-blue-500"></i>
          <span className="text-sm text-blue-700 font-medium">{completingSteps[completingStep]}</span>
        </div>
      </div>
    </div>
  );

  const renderCompletedState = () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-white p-12 text-center">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-5xl mb-8"
      >
        🎉
      </motion.div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Workspace 已准备完成！</h2>
      <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
        <span className="font-bold text-blue-600">{workspaceName}</span> 已具备完整研究条件
      </p>
      
      <div className="w-full max-w-md bg-gray-50 rounded-2xl p-6 mb-10 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-gray-700">完整度：100%</span>
          <span className="text-green-600 font-bold">READY</span>
        </div>
        <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: '72%' }}
            animate={{ width: '100%' }}
            className="h-full bg-green-500"
          ></motion.div>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button className="py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
          开始分析
        </button>
        <div className="grid grid-cols-2 gap-4">
          <button className="py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">
            生成报告
          </button>
          <button className="py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">
            继续优化
          </button>
        </div>
      </div>

      <div className="mt-12 text-left w-full max-w-md">
        <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">你现在可以：</h4>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 text-gray-700">
            <i className="fas fa-chevron-right text-blue-500 text-xs"></i>
            <span>进行地质分析</span>
          </li>
          <li className="flex items-center gap-3 text-gray-700">
            <i className="fas fa-chevron-right text-blue-500 text-xs"></i>
            <span>生成钻井地质设计报告</span>
          </li>
          <li className="flex items-center gap-3 text-gray-700">
            <i className="fas fa-chevron-right text-blue-500 text-xs"></i>
            <span>查看关键结论</span>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-[1280px] h-[850px] flex flex-col overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">Workspace</span>
                <h2 className="text-2xl font-bold text-gray-800">{workspaceName}</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-500">完整度：{completeness}%</span>
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${completeness === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${completeness}%` }}></div>
                  </div>
                </div>
                {workspaceObjects && workspaceObjects.length > 0 && (
                  <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>
                )}
                <div className="flex gap-2">
                  {workspaceObjects?.map(obj => (
                    <span key={obj} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">{obj}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            {state === BuilderState.NORMAL && (
              <>
                <button 
                  onClick={() => setIsSmartModalOpen(true)}
                  className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 flex items-center gap-2 transition-all border border-indigo-100"
                >
                  <i className="fas fa-robot"></i> 智能创建
                </button>
                <button 
                  onClick={handleOneClickComplete}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 transition-all shadow-lg shadow-blue-100"
                >
                  <i className="fas fa-magic"></i> 一键补全 Workspace 🔥
                </button>
              </>
            )}
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Status Bar (Normal State Only) */}
        {state === BuilderState.NORMAL && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-4 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex-shrink-0">流程概览:</span>
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="text-green-600 flex items-center gap-1 flex-shrink-0">资料准备 <i className="fas fa-check-circle"></i></span>
              <i className="fas fa-chevron-right text-gray-300 text-[10px]"></i>
              <span className="text-green-600 flex items-center gap-1 flex-shrink-0">测井解释 <i className="fas fa-check-circle"></i></span>
              <i className="fas fa-chevron-right text-gray-300 text-[10px]"></i>
              <span className="text-orange-500 flex items-center gap-1 flex-shrink-0">层位划分 <i className="fas fa-exclamation-circle"></i></span>
              <i className="fas fa-chevron-right text-gray-300 text-[10px]"></i>
              <span className="text-green-600 flex items-center gap-1 flex-shrink-0">储量计算 <i className="fas fa-check-circle"></i></span>
              <i className="fas fa-chevron-right text-gray-300 text-[10px]"></i>
              <span className="text-orange-500 flex items-center gap-1 flex-shrink-0">方案设计 <i className="fas fa-exclamation-circle"></i></span>
            </div>
          </div>
        )}

        {/* Content Area */}
        {state === BuilderState.NORMAL && renderNormalState()}
        {state === BuilderState.COMPLETING && renderCompletingState()}
        {state === BuilderState.COMPLETED && renderCompletedState()}

        {/* Footer Info (Normal State Only) */}
        {state === BuilderState.NORMAL && workspaceDescription && (
          <div className="px-6 py-3 bg-white border-t border-gray-100 flex items-center gap-3">
            <i className="fas fa-info-circle text-blue-400"></i>
            <p className="text-sm text-gray-500 truncate">{workspaceDescription}</p>
          </div>
        )}
      </div>

      {/* Smart Workspace Construction Loading */}
      {isSmartModalOpen && (
        <WorkspaceConstructionLoading 
          workspaceName={workspaceName} 
          lang={lang}
          onComplete={() => {
            setIsSmartModalOpen(false);
            // After smart creation, we might want to refresh or just show normal state
            setState(BuilderState.NORMAL);
          }} 
        />
      )}
    </div>
  );
};
