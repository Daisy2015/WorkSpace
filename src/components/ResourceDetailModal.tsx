import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ResourceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceName: string;
  hasData?: boolean;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({ isOpen, onClose, resourceName, hasData: initialHasData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const objects = [
    { id: '1', name: 'EBST-7-5H', hasData: true },
    { id: '2', name: 'EBST-7-6H', hasData: false },
    { id: '3', name: 'EBST-8-1H', hasData: true },
    { id: '4', name: 'EBST-8-2H', hasData: false },
  ];

  const [selectedObjectId, setSelectedObjectId] = useState(objects[0].id);
  const currentObject = objects.find(o => o.id === selectedObjectId) || objects[0];
  const hasData = currentObject.hasData;

  // Mock data matching the screenshot
  const columns = [
    '序号', '井筒标识', '油气计量...', '日期', '区块名称', '井筒名称', '层位名称', '注入层位', 
    '转注开始...', '注入方式', '注入时长', '配注量', '实际注入量', '分离器压力', '井口压力', '套压'
  ];

  const data = Array.from({ length: pageSize }, (_, i) => ({
    id: i + 1,
    wellId: '',
    ogm: 'OGM2',
    date: `2024-12-${21 - i}`,
    block: 'S2',
    wellName: currentObject.name,
    strata: 'Tanuma',
    layer: 'Tanuma',
    startTime: '2024-07-22 ...',
    method: 'Commingled',
    duration: '24',
    planned: i % 2 === 0 ? '800' : '500',
    actual: i % 2 === 0 ? '799' : '509',
    pressure: i % 2 === 0 ? '14' : '29',
    wellhead: '0',
    casing: '0'
  }));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 20 }}
          className="relative w-full max-w-[1400px] h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">数据详情</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1">
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>

          {/* Sub Header / Filters */}
          <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50">
            <div className="flex items-center gap-12">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 whitespace-nowrap">对象名称</span>
                <div className="relative group">
                  <select 
                    value={selectedObjectId}
                    onChange={(e) => setSelectedObjectId(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded text-sm text-gray-700 outline-none cursor-pointer min-w-[160px] focus:border-blue-500"
                  >
                    {objects.map(obj => (
                      <option key={obj.id} value={obj.id}>{obj.name}{!obj.hasData ? " (无数据)" : ""}</option>
                    ))}
                  </select>
                  <i className="fas fa-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 text-[10px] pointer-events-none"></i>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 whitespace-nowrap">成果类型</span>
                <span className="text-sm font-bold text-gray-800">{resourceName}</span>
              </div>
            </div>

            {/* Buttons hidden as per request */}
          </div>

          {/* Table Container */}
          <div className="flex-1 p-8 overflow-hidden bg-[#f0f2f5]/30 flex flex-col">
            <div className="bg-white rounded border border-gray-200 flex flex-col h-full shadow-sm">
              {/* Toolbar */}
              <div className="px-4 py-3 flex justify-end items-center gap-3 border-b border-gray-100">
                <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded transition-colors" title="下载">
                  <i className="fas fa-download text-xs"></i>
                </button>
                <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded transition-colors" title="全屏">
                  <i className="fas fa-expand text-xs"></i>
                </button>
                <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded transition-colors" title="布局">
                  <i className="fas fa-th-large text-xs"></i>
                </button>
              </div>

              {hasData ? (
                <>
                  {/* Data Table */}
                  <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 bg-[#f8f9fb] z-10">
                        <tr>
                          {columns.map((col, idx) => (
                            <th key={idx} className="px-4 py-2.5 text-left border-r border-b border-gray-200 last:border-r-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[12px] font-bold text-gray-500 whitespace-nowrap">{col}</span>
                                {idx > 0 && (
                                  <div className="flex flex-col text-[8px] text-gray-300">
                                    <i className="fas fa-caret-up -mb-0.5"></i>
                                    <i className="fas fa-caret-down"></i>
                                  </div>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((row, ridx) => (
                          <tr key={ridx} className="hover:bg-blue-50/20 transition-colors">
                            <td className="px-4 py-2 text-[12px] text-gray-600 border-r border-b border-gray-50 text-center">{row.id}</td>
                            <td className="px-4 py-2 text-[12px] text-gray-600 border-r border-b border-gray-50">{row.wellId}</td>
                            <td className="px-4 py-2 text-[12px] text-gray-600 border-r border-b border-gray-50">{row.ogm}</td>
                            <td className="px-4 py-2 text-[12px] text-gray-600 border-r border-b border-gray-50">{row.date}</td>
                            <td className="px-4 py-2 text-[12px] text-gray-600 border-r border-b border-gray-50">{row.block}</td>
                            <td className="px-4 py-2 text-[12px] text-gray-600 border-r border-b border-gray-50">{row.wellName}</td>
                            <td className="px-4 py-2 text-[12px] text-gray-600 border-r border-b border-gray-50">{row.strata}</td>
                            <td className="px-4 py-2 text-[12px] text-gray-600 border-r border-b border-gray-50">{row.layer}</td>
                            <td className="px-4 py-2 text-[12px] text-gray-600 border-r border-b border-gray-50">{row.startTime}</td>
                            <td className="px-4 py-2 text-[12px] text-gray-600 border-r border-b border-gray-50">{row.method}</td>
                            <td className="px-4 py-2 text-[12px] text-gray-600 border-r border-b border-gray-50">{row.duration}</td>
                            <td className="px-4 py-2 text-[12px] text-gray-600 border-r border-b border-gray-50">{row.planned}</td>
                            <td className="px-4 py-2 text-[12px] text-gray-600 border-r border-b border-gray-50">{row.actual}</td>
                            <td className="px-4 py-2 text-[12px] text-gray-600 border-r border-b border-gray-50">{row.pressure}</td>
                            <td className="px-4 py-2 text-[12px] text-gray-600 border-r border-b border-gray-50">{row.wellhead}</td>
                            <td className="px-4 py-2 text-[12px] text-gray-600 border-r border-b border-gray-50 last:border-r-0">{row.casing}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="px-8 py-3 bg-white border-t border-gray-100 flex items-center justify-end gap-6 text-[12px] text-gray-500 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded text-gray-300 cursor-pointer">
                        <i className="fas fa-angle-double-left"></i>
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded text-gray-300 cursor-pointer">
                        <i className="fas fa-angle-left"></i>
                      </button>
                      <div className="flex items-center gap-2 px-2">
                        <input 
                          type="text" 
                          value={currentPage} 
                          readOnly
                          className="w-10 h-8 border border-gray-200 rounded text-center outline-none focus:border-blue-500" 
                        />
                        <span>/ 29</span>
                      </div>
                      <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded text-gray-500 cursor-pointer">
                        <i className="fas fa-angle-right"></i>
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded text-gray-500 cursor-pointer">
                        <i className="fas fa-angle-double-right"></i>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <select 
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="h-8 border border-gray-200 rounded px-2 bg-white outline-none hover:border-gray-300 cursor-pointer"
                      >
                        <option value={10}>10条/页</option>
                        <option value={20}>20条/页</option>
                        <option value={50}>50条/页</option>
                      </select>
                      <span>共 281 条记录</span>
                    </div>
                  </div>
                </>
              ) : (
                /* No Data State */
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 p-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <i className="fas fa-database text-gray-300 text-4xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-600 mb-2">暂无数据</h3>
                  <p className="text-sm text-gray-400 max-w-[300px] text-center leading-relaxed font-medium">
                    当前选中的对象 <span className="text-blue-500 font-bold">"{currentObject.name}"</span> 尚未关联成果数据。
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
