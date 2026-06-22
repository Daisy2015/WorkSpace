import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfessionalReportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: any) => void;
  lang: 'zh' | 'en';
}

type Step = 1 | 2 | 3 | 4;

interface OutlineNode {
  id: string;
  title: string;
  level: number;
  isOpen: boolean;
  objectScope: {
    wells: string[];
    blocks: string[];
    structures: string[];
    horizons: string[];
    reservoirUnits: string[];
  };
  selectedMBUs: {
    id: string;
    categories: {
      inputs: string[];
      process: string[];
      outcome: string[];
      management: string[];
      standards: string[];
      questions: string[];
    };
  }[];
}

interface BasisItem {
  id: string;
  name: string;
  checked: boolean;
  version?: string;
  source?: string;
}

export const ProfessionalReportWizard: React.FC<ProfessionalReportWizardProps> = ({ 
  isOpen, 
  onClose, 
  onGenerate, 
  lang 
}) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedWell, setSelectedWell] = useState<any>(null);
  
  // Step 2: Design Basis
  const [coreBasis, setCoreBasis] = useState<BasisItem[]>([
    { id: 'cb1', name: lang === 'zh' ? '钻井基础设计报告' : 'Drilling Base Design', version: 'V3.0', source: lang === 'zh' ? '钻井设计库' : 'Drilling Library', checked: true }
  ]);
  const [extraBasis, setExtraBasis] = useState<BasisItem[]>([
    { id: 'eb1', name: lang === 'zh' ? '区块部署方案' : 'Block Deployment Plan', checked: true },
    { id: 'eb2', name: lang === 'zh' ? '地质综合研究报告' : 'Integrated Geo Report', checked: false },
    { id: 'eb3', name: lang === 'zh' ? '储量评价报告' : 'Reserve Evaluation Report', checked: false },
    { id: 'eb4', name: lang === 'zh' ? '邻井钻井总结报告' : 'Offset Well Summary', checked: false },
    { id: 'eb5', name: lang === 'zh' ? '开发调整方案' : 'Development Adjustment Plan', checked: false },
  ]);

  // Step 3: Report Outline
  const [outlineNodes, setOutlineNodes] = useState<OutlineNode[]>([
    { 
      id: '1', 
      title: lang === 'zh' ? '前言' : 'Preface', 
      level: 1, 
      isOpen: true, 
      objectScope: { wells: ['井：长庆XX-1井'], blocks: [], structures: [], horizons: [], reservoirUnits: [] },
      selectedMBUs: []
    },
    { 
      id: '2', 
      title: lang === 'zh' ? '区域地质概况' : 'Regional Geology', 
      level: 1, 
      isOpen: true, 
      objectScope: { wells: ['井：长庆XX-1井'], blocks: [], structures: [], horizons: [], reservoirUnits: [] },
      selectedMBUs: []
    },
    { 
      id: '2.1', 
      title: lang === 'zh' ? '区域地层' : 'Regional Stratigraphy', 
      level: 2, 
      isOpen: true, 
      objectScope: { wells: ['井：长庆XX-1井'], blocks: [], structures: [], horizons: [], reservoirUnits: [] },
      selectedMBUs: []
    },
    { 
      id: '2.2', 
      title: lang === 'zh' ? '构造特征' : 'Structural Features', 
      level: 2, 
      isOpen: true, 
      objectScope: { wells: ['井：长庆XX-1井'], blocks: [], structures: [], horizons: [], reservoirUnits: [] },
      selectedMBUs: []
    },
    { 
      id: '3', 
      title: lang === 'zh' ? '邻井地质特征' : 'Offset Well Features', 
      level: 1, 
      isOpen: true, 
      objectScope: { wells: ['井：长庆XX-1井', '井：长庆XX-2井'], blocks: [], structures: [], horizons: [], reservoirUnits: [] },
      selectedMBUs: []
    },
    { 
      id: '3.1', 
      title: lang === 'zh' ? '邻井基本情况' : 'Basic Well Info', 
      level: 2, 
      isOpen: true, 
      objectScope: { wells: ['井：长庆XX-1井', '井：长庆XX-2井'], blocks: [], structures: [], horizons: [], reservoirUnits: [] },
      selectedMBUs: []
    },
    { 
      id: '4', 
      title: lang === 'zh' ? '地层预测' : 'Stratigraphic Prediction', 
      level: 1, 
      isOpen: true, 
      objectScope: { wells: ['井：长庆XX-1井'], blocks: ['XX区块'], structures: ['XX背斜'], horizons: ['长6'], reservoirUnits: [] },
      selectedMBUs: [
        {
          id: 'MBU-01',
          categories: {
            inputs: ['地震解释资料', '邻井测井曲线'],
            process: ['地层划分流程'],
            outcome: ['地层分层结果'],
            management: ['专家审核记录'],
            standards: ['地层划分规范'],
            questions: []
          }
        },
        {
          id: 'MBU-02',
          categories: {
            inputs: [],
            process: ['构造解释算法'],
            outcome: ['构造底图'],
            management: [],
            standards: ['绘图标准'],
            questions: ['解释争议点']
          }
        },
        {
          id: 'MBU-03',
          categories: {
            inputs: ['历史试油数据'],
            process: [],
            outcome: [],
            management: [],
            standards: [],
            questions: ['资料缺失说明']
          }
        }
      ]
    },
  ]);

  // Step 4: UI state
  const [activeChapterId, setActiveChapterId] = useState<string>('4');
  const [expandedMBUId, setExpandedMBUId] = useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [isAddMbuOpen, setIsAddMbuOpen] = useState(false);

  const handleAddMbu = (mbuDef: any) => {
    setOutlineNodes(prev => prev.map(n => {
      if (n.id === activeChapterId) {
        return {
          ...n,
          selectedMBUs: [
            ...n.selectedMBUs,
            {
              id: mbuDef.id,
              categories: { inputs: [], process: [], outcome: [], management: [], standards: [], questions: [] }
            }
          ]
        };
      }
      return n;
    }));
  };

  // Mock Resource Database
  const resourceDatabase: any = {
    '地震解释资料': {
      name: lang === 'zh' ? 'XX区块三维地震解释成果' : 'XX Block 3D Seismic Interpretation',
      type: lang === 'zh' ? '地震成果' : 'Seismic Outcome',
      time: '2025-03-15',
      objects: lang === 'zh' ? 'XX区块、长6层' : 'XX Block, Chang 6',
      summary: lang === 'zh' ? '包含主要断层解释、层位构造图和目标层预测结果。' : 'Includes major fault interpretation, horizon maps and target layer predictions.'
    },
    '邻井测井曲线': {
      name: lang === 'zh' ? '长庆XX-2井测井原始曲线' : 'Changqing XX-2 Original Logs',
      type: lang === 'zh' ? '测井资料' : 'Well Log',
      time: '2024-11-20',
      objects: 'XX-2井',
      summary: lang === 'zh' ? 'XX-2井全井段常规测井曲线。' : 'Standard logs for the entire well XX-2.'
    }
  };

  const mbuDefinitions = [
    { id: 'MBU-01', name: lang === 'zh' ? '地层资料' : 'Stratigraphic Data' },
    { id: 'MBU-02', name: lang === 'zh' ? '构造资料' : 'Structural Data' },
    { id: 'MBU-03', name: lang === 'zh' ? '储层资料' : 'Reservoir Data' }
  ];

  const [isFinalConfirmOpen, setIsFinalConfirmOpen] = useState(false);

  const handleSearch = (query?: string) => {
    const q = query ?? searchQuery;
    if (!q.trim()) return;
    // Mock robust search for demo
    const resultName = q.includes('井') ? q : q + '1井';
    setSearchResults([
      { id: 'w1', name: resultName, type: lang === 'zh' ? '评价井' : 'Appraisal Well', block: lang === 'zh' ? 'XX区块' : 'XX Block', targetLayer: '长6', wellType: lang === 'zh' ? '定向井' : 'Directional', structure: lang === 'zh' ? 'XX背斜' : 'XX Anticline', depth: '3200m' }
    ]);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    } else {
      setIsFinalConfirmOpen(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const startGeneration = () => {
    onGenerate({
      well: selectedWell,
      basis: [...coreBasis, ...extraBasis].filter(b => b.checked),
      outline: outlineNodes
    });
    onClose();
  };

  // Outline helpers
  const moveNode = (id: string, direction: 'up' | 'down') => {
    const index = outlineNodes.findIndex(n => n.id === id);
    if (index === -1) return;
    const newNodes = [...outlineNodes];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newNodes.length) return;
    [newNodes[index], newNodes[targetIndex]] = [newNodes[targetIndex], newNodes[index]];
    setOutlineNodes(newNodes);
  };

  const changeLevel = (id: string, delta: number) => {
    setOutlineNodes(prev => prev.map(n => {
      if (n.id === id) {
        const newLevel = Math.max(1, Math.min(3, n.level + delta));
        return { ...n, level: newLevel };
      }
      return n;
    }));
  };

  const addNode = (id: string, type: 'sibling' | 'child') => {
    const index = outlineNodes.findIndex(n => n.id === id);
    if (index === -1) return;
    const refNode = outlineNodes[index];
    const newNode: OutlineNode = {
      id: Math.random().toString(36).substr(2, 9),
      title: lang === 'zh' ? '新章节' : 'New Chapter',
      level: type === 'sibling' ? refNode.level : refNode.level + 1,
      isOpen: true,
      objectScope: { wells: [], blocks: [], structures: [], horizons: [], reservoirUnits: [] },
      selectedMBUs: []
    };
    const newNodes = [...outlineNodes];
    newNodes.splice(index + 1, 0, newNode);
    setOutlineNodes(newNodes);
  };

  const deleteNode = (id: string) => {
    setOutlineNodes(prev => prev.filter(n => n.id !== id));
  };

  const renameNode = (id: string) => {
    const title = prompt(lang === 'zh' ? '输入新名称' : 'Enter new name');
    if (title) {
      setOutlineNodes(prev => prev.map(n => n.id === id ? { ...n, title } : n));
    }
  };

  const renderStep1 = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{lang === 'zh' ? '井名称' : 'Well Name'}</label>
          <div className="relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'zh' ? '请输入井名称进行搜索' : 'Enter well name...'}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 pr-12"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={() => handleSearch()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2 px-1">
            <span className="text-[10px] text-slate-400 font-bold self-center mr-1">{lang === 'zh' ? '为你推荐：' : 'Recommended:'}</span>
            {['长庆XX-1井', '长庆XX-2井', 'XX-3井'].map(well => (
              <button 
                key={well}
                onClick={() => {
                  setSearchQuery(well);
                  handleSearch(well);
                }}
                className="px-2 py-1 text-[10px] bg-slate-50 text-slate-500 rounded-lg border border-slate-100 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all font-bold"
              >
                {well}
              </button>
            ))}
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{lang === 'zh' ? '搜索结果' : 'Results'}</h4>
            {searchResults.map(well => (
              <div key={well.id} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm flex justify-between items-center">
                <div className="space-y-1">
                  <h5 className="text-sm font-bold text-slate-800">{well.name}</h5>
                  <div className="flex gap-4 text-[10px] text-slate-400 font-bold">
                    <span>井别：{well.type}</span>
                    <span>区块：{well.block}</span>
                    <span>目标层：{well.targetLayer}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedWell(well)}
                  className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedWell?.id === well.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {selectedWell?.id === well.id ? (lang === 'zh' ? '已选择' : 'Selected') : (lang === 'zh' ? '选择' : 'Select')}
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedWell && (
          <div className="mt-6 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
              <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">{lang === 'zh' ? '当前设计对象' : 'Selected Object'}</h4>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'zh' ? '井名称' : 'Well Name'}</p>
                  <p className="text-sm font-bold text-slate-800">{selectedWell.name}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'zh' ? '井别' : 'Type'}</p>
                  <p className="text-sm font-bold text-slate-800">{selectedWell.type}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'zh' ? '井型' : 'Borehole'}</p>
                  <p className="text-sm font-bold text-slate-800">{selectedWell.wellType}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'zh' ? '目的层' : 'Target Layer'}</p>
                  <p className="text-sm font-bold text-slate-800">{selectedWell.targetLayer}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'zh' ? '所属区块' : 'Block'}</p>
                  <p className="text-sm font-bold text-slate-800">{selectedWell.block}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'zh' ? '设计井深' : 'Design Depth'}</p>
                  <p className="text-sm font-bold text-slate-800">{selectedWell.depth}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 mt-auto px-1 border-t border-slate-100 bg-[#f8f9fa] sticky bottom-0">
        <p className="text-xs text-slate-400">{lang === 'zh' ? '明确当前需要编制的钻井地质设计对象' : 'Confirm the target well for report'}</p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6">
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 mb-3">{lang === 'zh' ? '核心设计依据（必选）' : 'Core Basis (Mandatory)'}</h4>
          {coreBasis.map(item => (
            <div key={item.id} className="p-4 bg-white border border-indigo-200 rounded-xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center text-white text-[10px]">
                  <i className="fas fa-check"></i>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800">{item.name}</h5>
                  <p className="text-[10px] text-slate-400 font-bold">版本：{item.version} | 来源：{item.source}</p>
                </div>
              </div>
              <button className="text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all">{lang === 'zh' ? '查看文档' : 'View'}</button>
            </div>
          ))}
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 mb-3">{lang === 'zh' ? '补充依据' : 'Supplemental Basis'}</h4>
          <div className="grid grid-cols-2 gap-3">
            {extraBasis.map(item => (
              <div 
                key={item.id} 
                onClick={() => setExtraBasis(prev => prev.map(b => b.id === item.id ? { ...b, checked: !b.checked } : b))}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${item.checked ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-slate-200'}`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'}`}>
                  {item.checked && <i className="fas fa-check text-[8px]"></i>}
                </div>
                <span className={`text-xs font-bold ${item.checked ? 'text-indigo-800' : 'text-slate-600'}`}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '当前已选择汇总' : 'Selected Summary'}</h5>
          <div className="space-y-1.5">
            {[...coreBasis, ...extraBasis].filter(b => b.checked).map((b, i) => (
              <div key={b.id} className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <span className="text-slate-300 font-mono">{i + 1}.</span>
                {b.name} {b.version && <span className="text-[10px] text-slate-400">({b.version})</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 mt-auto px-1 border-t border-slate-100 bg-[#f8f9fa] sticky bottom-0">
        <p className="text-xs text-slate-400">{lang === 'zh' ? '确定本次钻井地质设计编写所依据的设计文件和研究成果' : 'Select basis documents for the report'}</p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">{lang === 'zh' ? '报告大纲结构' : 'Report Structure'}</h4>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold shadow-sm hover:shadow-md hover:border-indigo-200 hover:text-indigo-600 transition-all">
            {lang === 'zh' ? '从模板导入' : 'Import'}
          </button>
          <button 
            onClick={() => {
              const newNode: OutlineNode = {
                id: Math.random().toString(36).substr(2, 9),
                title: lang === 'zh' ? '新增一级章节' : 'New Main Chapter',
                level: 1,
                isOpen: true,
                objectScope: { wells: [], blocks: [], structures: [], horizons: [], reservoirUnits: [] },
                selectedMBUs: []
              };
              setOutlineNodes([...outlineNodes, newNode]);
            }}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
            <i className="fas fa-plus"></i>
            {lang === 'zh' ? '新增一级章节' : 'Add Level 1'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white border border-slate-100 rounded-2xl shadow-sm p-4 space-y-1.5 custom-scrollbar mb-4">
        {outlineNodes.map((node, index) => (
          <div 
            key={node.id} 
            className="group flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
            style={{ marginLeft: `${(node.level - 1) * 32}px` }}
          >
            <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-400">
               <i className="fas fa-bars text-sm"></i>
            </div>
            
            <div className="flex-1 flex items-center gap-3">
              <span className="text-xs font-mono text-slate-300">{index + 1}</span>
              <input 
                type="text"
                value={node.title}
                onChange={(e) => setOutlineNodes(prev => prev.map(n => n.id === node.id ? { ...n, title: e.target.value } : n))}
                className="flex-1 h-8 bg-transparent border-none outline-none text-sm font-bold text-slate-700 focus:text-indigo-600"
              />
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => moveNode(node.id, 'up')}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-all"
              >
                <i className="fas fa-arrow-up text-[10px]"></i>
              </button>
              <button 
                onClick={() => moveNode(node.id, 'down')}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-all"
              >
                <i className="fas fa-arrow-down text-[10px]"></i>
              </button>
              <button 
                onClick={() => changeLevel(node.id, 1)}
                title={lang === 'zh' ? '降级' : 'Indent'}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-all"
              >
                <i className="fas fa-indent text-[10px]"></i>
              </button>
              <button 
                onClick={() => changeLevel(node.id, -1)}
                title={lang === 'zh' ? '升级' : 'Outdent'}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-all"
              >
                <i className="fas fa-outdent text-[10px]"></i>
              </button>
              <div className="w-px h-4 bg-slate-100 mx-1"></div>
              
              <div className="relative group/menu">
                <button className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-all">
                  <i className="fas fa-ellipsis-v text-[10px]"></i>
                </button>
                <div className="absolute top-full right-0 mt-1 w-36 bg-white border border-slate-100 shadow-xl rounded-xl p-1 z-20 hidden group-hover/menu:block animate-in fade-in zoom-in-95 duration-150">
                  <button 
                    onClick={() => addNode(node.id, 'sibling')}
                    className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg flex items-center gap-2"
                  >
                    <i className="fas fa-plus"></i> {lang === 'zh' ? '新增同级章节' : 'Add Sibling'}
                  </button>
                  <button 
                    onClick={() => addNode(node.id, 'child')}
                    className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg flex items-center gap-2"
                  >
                    <i className="fas fa-level-down-alt"></i> {lang === 'zh' ? '新增子章节' : 'Add Child'}
                  </button>
                  <button 
                    onClick={() => renameNode(node.id)}
                    className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg flex items-center gap-2"
                  >
                    <i className="fas fa-edit"></i> {lang === 'zh' ? '重命名' : 'Rename'}
                  </button>
                  <button 
                    onClick={() => {
                        const copy: OutlineNode = { ...node, id: Math.random().toString(36).substr(2, 9), title: node.title + ' (Copy)' };
                        const newNodes = [...outlineNodes];
                        newNodes.splice(index + 1, 0, copy);
                        setOutlineNodes(newNodes);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg flex items-center gap-2"
                  >
                    <i className="fas fa-copy"></i> {lang === 'zh' ? '复制' : 'Duplicate'}
                  </button>
                  <div className="h-px bg-slate-50 my-1 mx-2"></div>
                  <button 
                    onClick={() => deleteNode(node.id)}
                    className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2"
                  >
                    <i className="fas fa-trash-alt"></i> {lang === 'zh' ? '删除' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 mt-auto px-1 border-t border-slate-100 bg-[#f8f9fa] sticky bottom-0">
        <p className="text-xs text-slate-400">{lang === 'zh' ? '确定最终的多层级报告目录结构' : 'Plan the multi-level structure of the report'}</p>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const activeNode = outlineNodes.find(n => n.id === activeChapterId) || outlineNodes[0];
    const selectedResource = selectedResourceId ? resourceDatabase[selectedResourceId] : null;

    const toggleObject = (category: keyof typeof activeNode.objectScope, value: string) => {
      setOutlineNodes(prev => prev.map(n => {
        if (n.id === activeChapterId) {
          const arr = n.objectScope[category];
          const newValue = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
          return { ...n, objectScope: { ...n.objectScope, [category]: newValue } };
        }
        return n;
      }));
    };

    return (
      <div className="flex flex-col h-full relative">
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Left: Chapter list */}
          <div className="w-64 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">{lang === 'zh' ? '章节列表' : 'Chapters'}</h4>
            <div className="flex-1 overflow-y-auto bg-white border border-slate-100 rounded-2xl shadow-sm p-3 space-y-1 custom-scrollbar">
              {outlineNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => setActiveChapterId(node.id)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all ${
                    activeChapterId === node.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  style={{ paddingLeft: `${node.level * 12}px` }}
                >
                  {node.title}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Workspace */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {lang === 'zh' ? '资源配置工作区' : 'Resource Workspace'}
                <span className="ml-2 text-indigo-500 font-bold">{activeNode.title}</span>
              </h4>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              {/* Object Scope */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-1.5 h-4 bg-slate-300 rounded-full"></div>
                  <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider">{lang === 'zh' ? '对象范围' : 'Object Scope'}</h5>
                </div>
                
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    {[
                      ...(activeNode.objectScope.wells.length > 0 ? activeNode.objectScope.wells : [selectedWell?.name || '长庆XX-1井']).map(w => ({ type: lang === 'zh' ? '井' : 'Well', name: w.replace(/^井：/, '') })),
                      ...activeNode.objectScope.blocks.map(b => ({ type: lang === 'zh' ? '区块' : 'Block', name: b })),
                      ...activeNode.objectScope.structures.map(s => ({ type: lang === 'zh' ? '构造' : 'Structure', name: s })),
                      ...activeNode.objectScope.horizons.map(h => ({ type: lang === 'zh' ? '层位' : 'Horizon', name: h })),
                      ...activeNode.objectScope.reservoirUnits.map(r => ({ type: lang === 'zh' ? '单元' : 'Unit', name: r }))
                    ].map((obj, idx) => (
                      <div 
                        key={`${obj.name}-${idx}`}
                        className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-sm"
                      >
                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded text-[9px] font-black uppercase">{obj.type}</span>
                        {obj.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MBU Resource Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-slate-300 rounded-full"></div>
                    <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider">{lang === 'zh' ? 'MBU 资源内容' : 'MBU Resources'}</h5>
                  </div>
                  <button 
                    onClick={() => setIsAddMbuOpen(!isAddMbuOpen)}
                    className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg font-bold hover:bg-indigo-100 relative"
                  >
                    {lang === 'zh' ? '+ 添加 MBU' : '+ Add MBU'}
                    {isAddMbuOpen && (
                        <div className="absolute right-0 top-7 z-50 bg-white shadow-xl rounded-xl border border-slate-100 p-2 w-48">
                          {mbuDefinitions.filter(m => !activeNode.selectedMBUs.find(s => s.id === m.id)).map(m => (
                            <button key={m.id} onClick={(e) => {
                                e.stopPropagation();
                                handleAddMbu(m);
                                setIsAddMbuOpen(false);
                            }} className="w-full text-left text-xs p-2 hover:bg-slate-50 font-bold text-slate-700">{m.name}</button>
                          ))}
                        </div>
                    )}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {activeNode.selectedMBUs.map(mbuEntry => {
                    const mbuDef = mbuDefinitions.find(d => d.id === mbuEntry.id) || { id: mbuEntry.id, name: 'Unknown' };
                    const isExpanded = expandedMBUId === mbuEntry.id;
                    
                    const mbuData = mbuEntry.categories;

                    const ipomsq = [
                      { key: 'I', val: mbuData.inputs.length > 0 },
                      { key: 'P', val: mbuData.process.length > 0 },
                      { key: 'O', val: mbuData.outcome.length > 0 },
                      { key: 'M', val: mbuData.management.length > 0 },
                      { key: 'S', val: mbuData.standards.length > 0 },
                      { key: 'Q', val: mbuData.questions.length > 0 },
                    ];

                    return (
                      <div key={mbuEntry.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden transition-all">
                        <div 
                          className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all ${isExpanded ? 'bg-slate-50/50' : ''}`}
                          onClick={() => setExpandedMBUId(isExpanded ? null : mbuEntry.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400">
                              {mbuEntry.id.split('-')[1]}
                            </div>
                            <div>
                               <h6 className="text-sm font-bold text-slate-800">{mbuEntry.id} {mbuDef.name}</h6>
                               <div className="flex gap-4 mt-1">
                                  {ipomsq.map(cat => (
                                    <div key={cat.key} className="flex items-center gap-1.5">
                                      <div className={`w-2 h-2 rounded-full ${cat.val ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'border border-slate-300'}`}></div>
                                      <span className={`text-[10px] font-black ${cat.val ? 'text-slate-600' : 'text-slate-300'}`}>{cat.key}</span>
                                    </div>
                                  ))}
                               </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-slate-300">
                            <button onClick={(e) => {
                                e.stopPropagation();
                                setOutlineNodes(prev => prev.map(n => {
                                    if(n.id === activeChapterId) {
                                        return {...n, selectedMBUs: n.selectedMBUs.filter(m => m.id !== mbuEntry.id)}
                                    }
                                    return n;
                                }));
                            }} className="text-red-400 hover:text-red-600">
                                <i className="fas fa-trash-alt text-[10px]"></i>
                            </button>
                            <i className={`fas fa-chevron-down transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-slate-50 bg-white"
                            >
                              <div className="p-6 space-y-8">
                                {[
                                  { key: 'inputs', label: lang === 'zh' ? 'Inputs（输入依据）' : 'Inputs' },
                                  { key: 'process', label: lang === 'zh' ? 'Process（处理过程）' : 'Process' },
                                  { key: 'outcome', label: lang === 'zh' ? 'Outcome（输出成果）' : 'Outcome' },
                                  { key: 'management', label: lang === 'zh' ? 'Management（管理确认）' : 'Management' },
                                  { key: 'standards', label: lang === 'zh' ? 'Standards（标准规则）' : 'Standards' },
                                  { key: 'questions', label: lang === 'zh' ? 'Questions（缺陷不确定）' : 'Questions' }
                                ].map(cat => {
                                  const items = mbuEntry.categories[cat.key as keyof typeof mbuEntry.categories] || [];
                                  if (items.length === 0) return null; // Show only existing
                                  
                                  return (
                                    <div key={cat.key} className="space-y-4">
                                      <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                        <h6 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{cat.label}</h6>
                                        <span className="text-[10px] font-black text-slate-400">{items.length}</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        {items.map(item => (
                                          <div 
                                            key={item} 
                                            className="group flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-white cursor-pointer transition-all"
                                            onClick={() => setSelectedResourceId(item)}
                                          >
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                                            <span className="flex-1 text-xs font-bold text-slate-600 group-hover:text-indigo-600">{item}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Detail Side Panel */}
        <AnimatePresence>
          {selectedResource && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute top-0 right-0 w-80 h-full bg-white shadow-2xl border-l border-slate-100 z-50 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h5 className="text-sm font-black text-slate-800">{lang === 'zh' ? '资源详情' : 'Resource Detail'}</h5>
                <button 
                  onClick={() => setSelectedResourceId(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-50 text-slate-400 transition-all"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{lang === 'zh' ? '资源名称' : 'Resource Name'}</label>
                  <p className="text-sm font-bold text-slate-800">{selectedResource.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{lang === 'zh' ? '资源类型' : 'Type'}</label>
                    <p className="text-xs font-bold text-slate-600">{selectedResource.type}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{lang === 'zh' ? '创建时间' : 'Created'}</label>
                    <p className="text-xs font-bold text-slate-600">{selectedResource.time}</p>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{lang === 'zh' ? '关联对象' : 'Related Objects'}</label>
                  <p className="text-xs font-bold text-slate-600">{selectedResource.objects}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{lang === 'zh' ? '摘要' : 'Summary'}</label>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">{selectedResource.summary}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <button className="w-full py-3 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  <i className="fas fa-external-link-alt"></i>
                  {lang === 'zh' ? '查看原始资料' : 'View Original'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      <div className="pt-4 mt-auto px-1 border-t border-slate-100 bg-[#f8f9fa] sticky bottom-0 z-10 w-full">
        <p className="text-xs text-slate-400">{lang === 'zh' ? '为每个章节原子化配置所需的各类地质对象和MBU数字化成果资源' : 'Review and verify geological objects and MBU resources for the report chapter.'}</p>
      </div>
      </div>
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
            className="relative w-full max-w-5xl bg-gray-50 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-file-contract text-indigo-600"></i>
                {lang === 'zh' ? '钻井地质设计报告编制准备' : 'Preparation for Drilling Geological Design Report'}
              </h2>
              <button 
                onClick={onClose} 
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Stepper */}
            <div className="px-12 py-6 bg-white border-b border-slate-100">
              <div className="flex items-center justify-between relative max-w-3xl mx-auto">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2"></div>
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      currentStep === step ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 
                      currentStep > step ? 'bg-indigo-100 text-indigo-600' : 'bg-white border-2 border-slate-100 text-slate-300'
                    }`}>
                      {currentStep > step ? <i className="fas fa-check"></i> : step}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${currentStep >= step ? 'text-indigo-600' : 'text-slate-300'}`}>
                      {step === 1 ? (lang === 'zh' ? '设计对象' : 'Target') : 
                       step === 2 ? (lang === 'zh' ? '设计依据' : 'Basis') : 
                       step === 3 ? (lang === 'zh' ? '报告大纲' : 'Outline') : 
                       (lang === 'zh' ? '章节资料' : 'Appendix')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-8 flex-1 overflow-hidden bg-[#f8f9fa] flex flex-col">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-white border-t border-slate-100 flex justify-between items-center shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all flex items-center gap-2"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <div className="flex gap-4">
                {currentStep > 1 && (
                  <button 
                    onClick={handleBack}
                    className="px-8 py-2.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"
                  >
                    <i className="fas fa-arrow-left"></i>
                    {lang === 'zh' ? '上一步' : 'Back'}
                  </button>
                )}
                <button 
                  disabled={currentStep === 1 && !selectedWell}
                  onClick={handleNext}
                  className="px-10 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
                >
                  {currentStep === 4 ? (lang === 'zh' ? '生成报告' : 'Next') : 
                   currentStep === 1 ? (lang === 'zh' ? '确认对象并下一步' : 'Confirm & Next') :
                   (lang === 'zh' ? '确认并下一步' : 'Confirm & Next')}
                  {currentStep < 4 && <i className="fas fa-arrow-right"></i>}
                </button>
              </div>
            </div>

            {/* Final Confirmation Modal */}
            <AnimatePresence>
              {isFinalConfirmOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                  />
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-lg bg-white rounded-[32px] p-8 shadow-2xl space-y-8"
                  >
                    <div className="text-center space-y-3">
                       <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-inner">
                         <i className="fas fa-clipboard-list"></i>
                       </div>
                       <h3 className="text-2xl font-black text-slate-800 tracking-tight">{lang === 'zh' ? '钻井地质设计报告编制任务确认' : 'Confirm Report Generation Task'}</h3>
                       <p className="text-sm text-slate-400">{lang === 'zh' ? '请核对以下任务配置信息' : 'Please check the following configuration'}</p>
                    </div>

                    <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 space-y-5">
                       <div className="flex justify-between items-center group">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '设计对象' : 'Design Object'}</span>
                          <span className="text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-100">{selectedWell?.name}（{selectedWell?.type}）</span>
                       </div>
                       <div className="flex justify-between items-center group">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '设计依据' : 'Basis'}</span>
                          <span className="text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-100">{[...coreBasis, ...extraBasis].filter(b => b.checked).length}项</span>
                       </div>
                       <div className="flex justify-between items-center group">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '报告大纲' : 'Outline'}</span>
                          <span className="text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-100">
                             {outlineNodes.filter(n => n.level === 1).length}个一级章节 | {outlineNodes.filter(n => n.level > 1).length}个子章节
                          </span>
                       </div>
                       <div className="flex justify-between items-center group">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '章节资料' : 'Data Resources'}</span>
                          <span className="text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-100">
                             共配置 {outlineNodes.reduce((acc, curr) => acc + curr.selectedMBUs.length, 0)} 个MBU
                          </span>
                       </div>
                    </div>

                    <div className="flex flex-col gap-4">
                       <button 
                        onClick={startGeneration}
                        className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center gap-1"
                       >
                         <span className="text-base">{lang === 'zh' ? '启动报告生成' : 'Launch Generation'}</span>
                         <span className="text-[10px] opacity-60 font-medium tracking-widest">{lang === 'zh' ? '预计生成时间：约5~10分钟' : 'Est. time: 5-10 mins'}</span>
                       </button>
                       <button 
                        onClick={() => setIsFinalConfirmOpen(false)}
                        className="w-full py-3 bg-white text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                       >
                         {lang === 'zh' ? '返回修改' : 'Back to Edit'}
                       </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

