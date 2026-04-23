
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, SemanticEntry } from '../types';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface AdminSemanticManagementProps {
  lang: Language;
}

const MOCK_DATA: SemanticEntry[] = [
  { id: '1', name: '油井开井时率', module: 'JuraSearch', type: '指定定义', content: '等于油井开井数和油井总井数的比值，开井数是工作时长>0的井筒数量，总数就是工作时长为任意值的井筒数量', isEnabled: true },
  { id: '2', name: '开井数', module: 'JuraSearch', type: '规则定义', content: '工作时长>0的井筒数量', isEnabled: true },
  { id: '3', name: '注水井', module: 'JuraSearch', type: '指定定义', content: '在给定时间范围实际注入量不为空的井', isEnabled: true },
  { id: '4', name: '油田气油比', module: 'JuraSearch', type: '规则定义', content: '油田气油比=日产气量/日产油量', isEnabled: true },
  { id: '5', name: '产量完成率', module: 'JuraSearch', type: '规则定义', content: '1.获取油田年产量：给定时间范围的最大时间对应的年产油量 2.获取油田计划年产量：给定时间范围的最大时间对应的年度计划总产量 3.计算产量完成率：油田年产/油田计划年产*100', isEnabled: true },
  { id: '6', name: '油田计划年产量', module: 'JuraSearch', type: '指定定义', content: '给定时间范围的最大时间对应的年度计划总产量', isEnabled: true },
  { id: '7', name: '油田年产量', module: 'JuraSearch', type: '指定定义', content: '在给定时间范围的最大值对应的年产油量', isEnabled: true },
  { id: '8', name: '总进尺数', module: 'JuraSearch', type: '指定定义', content: '完钻斜深求和', isEnabled: true },
  { id: '9', name: '转注井', module: 'JuraSearch', type: '规则定义', content: '"现井别"为注水井', isEnabled: true },
  { id: '10', name: '电泵井', module: 'JuraSearch', type: '规则定义', content: '泵深 >0', isEnabled: true },
  { id: '11', name: '生产井', module: 'JuraSearch', type: '指定定义', content: '勘探开发油井汇总目录报表中给定时间范围内的所有井筒名称去重后的数量。如果没有给定时间范围，获取全部的井筒名称去重后的数量', isEnabled: true },
  { id: '12', name: '老井', module: 'JuraSearch', type: '指定定义', content: '投产日期在给定时间范围的最小值之前，如果没有给定时间，默认当前前年。', isEnabled: true },
  { id: '13', name: '新井', module: 'JuraSearch', type: '规则定义', content: '投产日期在给定时间范围以内，如果没有给定时间，默认当前前年。', isEnabled: true },
  { id: '14', name: '已钻井', module: 'JuraSearch', type: '规则定义', content: '完钻时间在给定时间范围内，如果没有给定时间则按照今年时间官，其中完钻时间指的是结束钻井的时间对应的字段名称为: finish_drill_time。注意不要选择: complete drill time', isEnabled: true },
];

export const AdminSemanticManagement: React.FC<AdminSemanticManagementProps> = ({ lang }) => {
  const isZh = lang === 'zh';
  const [data, setData] = useState<SemanticEntry[]>(MOCK_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('全部');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SemanticEntry | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = searchCategory === '全部' || item.type === searchCategory || item.module === searchCategory;
      return matchQuery && matchCategory;
    });
  }, [data, searchQuery, searchCategory]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleStatus = (id: string) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, isEnabled: !item.isEnabled } : item));
  };

  const handleDelete = (id: string) => {
    if (confirm(isZh ? '确定删除该语义定义吗？' : 'Are you sure you want to delete this semantic definition?')) {
      setData(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden relative">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800">
            {isZh ? '语义管理' : 'Semantic Management'}
          </h2>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <div className="flex border border-gray-200 rounded-xl overflow-hidden h-9 shadow-sm bg-slate-100">
            <select 
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="bg-slate-50 px-3 text-[10px] font-bold text-slate-500 border-r border-gray-200 outline-none focus:bg-white transition-colors cursor-pointer"
            >
              <option value="全部">{isZh ? '全部' : 'All'}</option>
              <option value="指定定义">{isZh ? '指定定义' : 'Direct'}</option>
              <option value="规则定义">{isZh ? '规则定义' : 'Rule'}</option>
            </select>
            <div className="relative flex-1 flex items-center min-w-[240px]">
              <i className="fas fa-search absolute left-3 text-[10px] text-slate-400"></i>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isZh ? '搜索语义定义...' : 'Search semantics...'}
                className="w-full pl-8 pr-4 text-xs h-full outline-none bg-transparent"
              />
            </div>
          </div>
          
          <button 
            onClick={() => {
              setEditingEntry(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-3 h-3" />
            {isZh ? '新增语义' : 'Add Semantic'}
          </button>
        </div>
      </header>

      {/* Table Area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4 w-48">{isZh ? '名称' : 'Name'} <i className="fas fa-sort ml-1 opacity-40"></i></th>
                <th className="px-6 py-4 w-40">{isZh ? '适用模块' : 'App Module'}</th>
                <th className="px-6 py-4 w-40">{isZh ? '适用类型' : 'App Type'} <i className="fas fa-sort ml-1 opacity-40"></i></th>
                <th className="px-6 py-4">{isZh ? '定义内容' : 'Definition Content'}</th>
                <th className="px-6 py-4 w-24">{isZh ? '状态' : 'Status'}</th>
                <th className="px-6 py-4 w-24 text-center">{isZh ? '操作' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedData.map((item, idx) => (
                <tr key={item.id} className="group hover:bg-indigo-50/30 transition-all">
                  <td className="px-6 py-4 font-bold text-slate-800 text-sm">{item.name}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{item.module}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{item.type}</td>
                  <td className="px-6 py-4">
                    <div className="max-w-2xl text-xs text-slate-600 line-clamp-2 leading-relaxed" title={item.content}>
                      {item.content}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(item.id)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                        item.isEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          item.isEnabled ? 'translate-x-[22px]' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                        title={isZh ? '编辑' : 'Edit'}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                        title={isZh ? '删除' : 'Delete'}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="px-8 py-4 bg-white border-t border-slate-200 flex items-center justify-end gap-4 text-xs text-slate-400 font-bold">
        <div>共 {filteredData.length} 条</div>
        
        <div className="flex items-center gap-1">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-30 transition-all font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {[...Array(totalPages)].map((_, i) => (
             <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 flex items-center justify-center border transition-all font-bold rounded ${
                currentPage === i + 1 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'border-slate-200 text-slate-400 hover:border-indigo-500 hover:text-indigo-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-30 transition-all font-bold"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border border-slate-200 rounded-xl px-3 py-1 bg-white shadow-sm font-bold text-slate-500 text-[10px]">
          20条/页 <i className="fas fa-chevron-down ml-2 scale-75 opacity-40"></i>
        </div>
      </div>
    </div>
  );
};
