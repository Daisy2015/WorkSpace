import React, { useState, useMemo } from 'react';
import { Language } from '../types';

interface NewResourceTreeProps {
  lang: Language;
  onOpenAddResourcePage: () => void;
}

// Model Definitions according to the specification
interface Resource {
  id: string;
  name: string;
  type: 'doc' | 'data' | 'image' | 'pdf' | 'word';
  mbuId: string;
  ipomsqType: 'I' | 'P' | 'O' | 'M' | 'S' | 'Q';
  required: boolean;
  status: 'READY' | 'MISSING' | 'INVALID' | 'GENERATED';
  tags: string[];
}

interface ResourceGroup {
  id: string;
  name: string;
  resources: Resource[];
}

interface Task {
  id: string;
  name: string;
  order: number;
  icon?: string;
  groups: ResourceGroup[];
}

export const NewResourceTree: React.FC<NewResourceTreeProps> = ({ lang, onOpenAddResourcePage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMbu, setSelectedMbu] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({
    'prepare': true,
    'outline': true,
    'write': true,
    'check': true,
    'output': true,
  });

  // Raw mock dataset driven by configuration (Agent Manifest MetaModel)
  const tasksData: Task[] = useMemo(() => [
    {
      id: 'prepare',
      name: lang === 'zh' ? '资料准备' : 'Data Preparation',
      order: 1,
      groups: [
        {
          id: 'group-prepare',
          name: lang === 'zh' ? '准备组' : 'Prep Group',
          resources: [
            { id: 'p1', name: lang === 'zh' ? '行业标准规范' : 'Industry Standards & Specs', type: 'doc', mbuId: 'MBU4', ipomsqType: 'S', required: true, status: 'READY', tags: ['标准', '地层专业'] },
            { id: 'p2', name: lang === 'zh' ? '邻井地质资料' : 'Offset Well Geo Data', type: 'doc', mbuId: 'MBU1', ipomsqType: 'I', required: true, status: 'READY', tags: ['输入', '地层专业'] },
            { id: 'p3', name: lang === 'zh' ? '地层压力数据' : 'Formation Pressure Data', type: 'data', mbuId: 'MBU1', ipomsqType: 'I', required: true, status: 'READY', tags: ['输入', '钻井液专业'] },
            { id: 'p4', name: lang === 'zh' ? '钻井液性能数据' : 'Drilling Fluid Properties', type: 'data', mbuId: 'MBU2', ipomsqType: 'I', required: true, status: 'READY', tags: ['输入', '钻井液专业'] },
            { id: 'p5', name: lang === 'zh' ? '井控安全要求' : 'Well Control Safety Req', type: 'doc', mbuId: 'MBU4', ipomsqType: 'S', required: true, status: 'READY', tags: ['标准', '井控安全专业'] },
            { id: 'p6', name: lang === 'zh' ? '地层裂缝发育数据' : 'Formation Fracture Data', type: 'data', mbuId: 'MBU1', ipomsqType: 'I', required: true, status: 'MISSING', tags: ['输入', '储层专业'] },
          ]
        }
      ]
    },
    {
      id: 'outline',
      name: lang === 'zh' ? '大纲生成' : 'Outline Generation',
      order: 2,
      groups: [
        {
          id: 'group-outline',
          name: lang === 'zh' ? '大纲组' : 'Outline Group',
          resources: [
            { id: 'o1', name: lang === 'zh' ? '报告模板' : 'Report Template', type: 'doc', mbuId: 'MBU5', ipomsqType: 'M', required: true, status: 'READY', tags: ['方法', '地层专业'] },
            { id: 'o2', name: lang === 'zh' ? '章节规则' : 'Chapter Rules', type: 'doc', mbuId: 'MBU5', ipomsqType: 'M', required: true, status: 'READY', tags: ['方法', '地层专业'] },
          ]
        }
      ]
    },
    {
      id: 'write',
      name: lang === 'zh' ? '内容撰写' : 'Content Drafting',
      order: 3,
      groups: [
        {
          id: 'group-write',
          name: lang === 'zh' ? '撰写组' : 'Drafting Group',
          resources: [
            { id: 'w1', name: lang === 'zh' ? '地层综合柱状图' : 'Comprehensive Columnar Map', type: 'image', mbuId: 'MBU1', ipomsqType: 'O', required: true, status: 'READY', tags: ['输出', '地层专业'] },
            { id: 'w2', name: lang === 'zh' ? '井身结构图' : 'Wellbore Schematic Diagram', type: 'image', mbuId: 'MBU3', ipomsqType: 'O', required: true, status: 'READY', tags: ['输出', '井身结构专业'] },
            { id: 'w3', name: lang === 'zh' ? '岩屑分析结果' : 'Cuttings Analysis Results', type: 'data', mbuId: 'MBU1', ipomsqType: 'O', required: true, status: 'READY', tags: ['输出', '储层专业'] },
            { id: 'w4', name: lang === 'zh' ? '测井曲线图' : 'Well Log Curves Chart', type: 'image', mbuId: 'MBU1', ipomsqType: 'O', required: true, status: 'READY', tags: ['输出', '地层专业'] },
            { id: 'w5', name: lang === 'zh' ? '取心描述' : 'Core Descriptions Document', type: 'doc', mbuId: 'MBU1', ipomsqType: 'I', required: true, status: 'MISSING', tags: ['输入', '地层专业'] },
          ]
        }
      ]
    },
    {
      id: 'check',
      name: lang === 'zh' ? '校核' : 'Checking & Verification',
      order: 4,
      groups: [
        {
          id: 'group-check',
          name: lang === 'zh' ? '校核组' : 'Verification Group',
          resources: [
            { id: 'c1', name: lang === 'zh' ? '校核规则' : 'Checking Rules', type: 'data', mbuId: 'MBU4', ipomsqType: 'Q', required: true, status: 'READY', tags: ['质量', '井控安全专业'] },
            { id: 'c2', name: lang === 'zh' ? '标准规范' : 'Standard Norms', type: 'doc', mbuId: 'MBU4', ipomsqType: 'S', required: true, status: 'READY', tags: ['标准', '地层专业'] },
            { id: 'c3', name: lang === 'zh' ? '审查意见记录' : 'Audit Review Comments Log', type: 'doc', mbuId: 'MBU4', ipomsqType: 'Q', required: true, status: 'MISSING', tags: ['质量', '井控安全专业'] },
          ]
        }
      ]
    },
    {
      id: 'output',
      name: lang === 'zh' ? '输出' : 'Output Deliverables',
      order: 5,
      groups: [
        {
          id: 'group-output',
          name: lang === 'zh' ? '输出组' : 'Deliverables Group',
          resources: [
            { id: 'u1', name: lang === 'zh' ? '钻井地质设计报告 (Word)' : 'Drilling Geo-Design Report (Word)', type: 'word', mbuId: 'MBU5', ipomsqType: 'O', required: true, status: 'GENERATED', tags: ['输出', '地层专业'] },
            { id: 'u2', name: lang === 'zh' ? '钻井地质设计报告 (PDF)' : 'Drilling Geo-Design Report (PDF)', type: 'pdf', mbuId: 'MBU5', ipomsqType: 'O', required: true, status: 'GENERATED', tags: ['输出', '地层专业'] },
          ]
        }
      ]
    }
  ], [lang]);

  // Filtering Logic
  const filteredTasks = useMemo(() => {
    return tasksData.map(task => {
      const filteredGroups = task.groups.map(group => {
        const filteredResources = group.resources.filter(res => {
          // Search Name filter
          if (searchTerm && !res.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
          }
          // MBU filter
          if (selectedMbu !== 'all' && res.mbuId !== selectedMbu) {
            return false;
          }
          // IPOMSQ Type filter
          if (selectedType !== 'all' && res.ipomsqType !== selectedType) {
            return false;
          }
          // Status filter
          if (selectedStatus !== 'all') {
            if (selectedStatus === 'READY' && res.status !== 'READY') return false;
            if (selectedStatus === 'MISSING' && res.status !== 'MISSING') return false;
            if (selectedStatus === 'INVALID' && res.status !== 'INVALID') return false;
            if (selectedStatus === 'GENERATED' && res.status !== 'GENERATED') return false;
          }
          return true;
        });
        return { ...group, resources: filteredResources };
      });
      return { ...task, groups: filteredGroups };
    });
  }, [tasksData, searchTerm, selectedMbu, selectedType, selectedStatus]);

  // Helper to get resources counts
  const getTaskCount = (task: Task) => {
    return task.groups.reduce((acc, g) => acc + g.resources.length, 0);
  };

  const getFilteredTaskCount = (task: any) => {
    return task.groups.reduce((acc: number, g: any) => acc + g.resources.length, 0);
  };

  const toggleTask = (taskId: string) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const getIpomsqBadgeStyles = (type: 'I' | 'P' | 'O' | 'M' | 'S' | 'Q') => {
    switch (type) {
      case 'I': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'P': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'O': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'M': return 'text-green-600 bg-green-50 border-green-200';
      case 'S': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Q': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    }
  };

  const getStatusColor = (status: 'READY' | 'MISSING' | 'INVALID' | 'GENERATED') => {
    switch (status) {
      case 'READY': return 'bg-emerald-500';
      case 'MISSING': return 'bg-amber-500';
      case 'INVALID': return 'bg-red-500';
      case 'GENERATED': return 'bg-slate-300'; // matching the grey status in the screenshot for output items
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'data': return 'far fa-file-excel text-emerald-500';
      case 'image': return 'far fa-file-image text-emerald-500';
      case 'pdf': return 'far fa-file-pdf text-red-500';
      case 'word': return 'far fa-file-word text-blue-500';
      default: return 'far fa-file-alt text-slate-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 text-[13px] relative select-none">
      
      {/* Top Header & Search Area */}
      <div className="p-3 border-b border-slate-100 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-[12px]"></i>
            <input 
              type="text" 
              placeholder={lang === 'zh' ? "搜索资源名称" : "Search resource name"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-500 transition-all text-slate-600"
            />
          </div>
          <button className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
            <i className="fas fa-sliders-h text-[13px]"></i>
          </button>
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          <button 
            onClick={onOpenAddResourcePage}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-between px-4 py-2 rounded-lg text-[13px] font-bold transition-all shadow-sm active:scale-98"
          >
            <div className="flex items-center gap-1.5">
              <i className="fas fa-plus text-[11px]"></i>
              <span>{lang === 'zh' ? '添加资源' : 'Add Resource'}</span>
            </div>
            <i className="fas fa-chevron-down text-[10px]"></i>
          </button>
        </div>

        {/* Dropdown Filters row */}
        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
          <select 
            value={selectedMbu}
            onChange={(e) => setSelectedMbu(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] outline-none text-slate-600 cursor-pointer"
          >
            <option value="all">{lang === 'zh' ? '全部MBU' : 'All MBUs'}</option>
            <option value="MBU1">MBU1</option>
            <option value="MBU2">MBU2</option>
            <option value="MBU3">MBU3</option>
            <option value="MBU4">MBU4</option>
            <option value="MBU5">MBU5</option>
          </select>

          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] outline-none text-slate-600 cursor-pointer"
          >
            <option value="all">{lang === 'zh' ? '全部类型' : 'All Types'}</option>
            <option value="I">{lang === 'zh' ? '输入 (I)' : 'Input (I)'}</option>
            <option value="P">{lang === 'zh' ? '处理 (P)' : 'Process / Procedure (P)'}</option>
            <option value="O">{lang === 'zh' ? '输出 (O)' : 'Output (O)'}</option>
            <option value="M">{lang === 'zh' ? '管理 (M)' : 'Management (M)'}</option>
            <option value="S">{lang === 'zh' ? '标准 (S)' : 'Standard (S)'}</option>
            <option value="Q">{lang === 'zh' ? '问题 (Q)' : 'Question / Qualifier (Q)'}</option>
          </select>

          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] outline-none text-slate-600 cursor-pointer"
          >
            <option value="all">{lang === 'zh' ? '全部状态' : 'All Status'}</option>
            <option value="READY">{lang === 'zh' ? '已准备' : 'Ready'}</option>
            <option value="MISSING">{lang === 'zh' ? '缺失' : 'Missing'}</option>
            <option value="INVALID">{lang === 'zh' ? '已失效' : 'Invalid'}</option>
            <option value="GENERATED">{lang === 'zh' ? '智能生成' : 'Generated'}</option>
          </select>
        </div>
      </div>

      {/* Task Tree List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-5">
        {filteredTasks.map((task) => {
          const isExpanded = !!expandedTasks[task.id];
          const actualCount = getFilteredTaskCount(task);
          
          return (
            <div key={task.id} className="flex flex-col">
              {/* Task Header */}
              <div 
                onClick={() => toggleTask(task.id)}
                className="group flex items-center justify-between py-1 px-1 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <i className={`fas fa-chevron-right text-[10px] text-slate-400 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}></i>
                  <span className="w-[18px] h-[18px] flex items-center justify-center bg-blue-600 text-white rounded text-[11px] font-bold">
                    {task.order}
                  </span>
                  <span className="font-bold text-slate-800 text-[13px]">{task.name}</span>
                  <span className="text-slate-400 text-xs">({actualCount})</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                    <i className="fas fa-cog text-[11px]"></i>
                  </button>
                </div>
              </div>

              {/* Task Child Resources */}
              {isExpanded && (
                <div className="ml-[15px] border-l border-slate-100 pl-4 mt-2 space-y-3 relative">
                  {task.groups.flatMap(g => g.resources).map((res) => (
                    <div 
                      key={res.id}
                      className="group flex items-center justify-between py-1 px-1 rounded hover:bg-slate-50/50 transition-colors cursor-pointer text-slate-700"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Resource File Icon */}
                        <i className={`fas ${getResourceIcon(res.type)} text-[13px] flex-shrink-0`}></i>
                        
                        {/* Resource Name */}
                        <span className="truncate text-[12.5px] font-medium text-slate-700 max-w-[140px]" title={res.name}>
                          {res.name}
                        </span>
                      </div>

                      {/* Right Tags and Status Indicator */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* IPOMSQ Letter Badge */}
                        <span className={`w-4 h-4 border rounded flex items-center justify-center text-[10px] font-bold ${getIpomsqBadgeStyles(res.ipomsqType)} shadow-sm`}>
                          {res.ipomsqType}
                        </span>

                        {/* MBU Tag */}
                        <span className="bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight">
                          {res.mbuId}
                        </span>

                        {/* Status Dot */}
                        <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(res.status)} shadow-sm`}></span>
                      </div>
                    </div>
                  ))}

                  {/* Empty state per task */}
                  {actualCount === 0 && (
                    <div className="text-slate-400 text-xs py-2 pl-2 italic">
                      {lang === 'zh' ? '暂无资源符合筛选条件' : 'No matching resources'}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend Block (Right above bottom tags panel) */}
      <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-2 items-center justify-center">
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
          <span className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-bold">I</span>
          <span>{lang === 'zh' ? '输入' : 'Input'}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
          <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold">P</span>
          <span>{lang === 'zh' ? '处理' : 'Process / Procedure'}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
          <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-bold">O</span>
          <span>{lang === 'zh' ? '输出' : 'Output'}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
          <span className="px-1.5 py-0.5 rounded bg-green-50 border border-green-200 text-green-600 text-[10px] font-bold">M</span>
          <span>{lang === 'zh' ? '管理' : 'Management'}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
          <span className="px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-600 text-[10px] font-bold">S</span>
          <span>{lang === 'zh' ? '标准' : 'Standard'}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
          <span className="px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-600 text-[10px] font-bold">Q</span>
          <span>{lang === 'zh' ? '问题' : 'Question / Qualifier'}</span>
        </div>
      </div>

    </div>
  );
};
