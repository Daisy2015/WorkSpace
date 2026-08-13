import React, { useState, useRef } from 'react';

interface ContractItem {
  id: string;
  name: string;
  type: 'docx' | 'pdf';
  status: 'parsed' | 'processing' | 'error';
  supplier: string;
  uploadDate: string;
  pages: number;
  chapters: number;
  content: React.ReactNode;
  currentPage: number;
}

export const ContractDocPreviewPane: React.FC<{ lang: 'zh' | 'en' }> = ({ lang }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['contract-1']));
  const [activeContractId, setActiveContractId] = useState('contract-1');
  const [zoomLevel, setZoomLevel] = useState('100%');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core Contract Database with preview renderings
  const [contracts, setContracts] = useState<ContractItem[]>([
    {
      id: 'contract-1',
      name: '原油采购合同.docx',
      type: 'docx',
      status: 'parsed',
      supplier: '中石油国际贸易有限公司',
      uploadDate: '2024-11-20',
      pages: 32,
      chapters: 8,
      currentPage: 12,
      content: (
        <div className="space-y-6 text-slate-800 text-[13px] leading-relaxed select-text">
          <div className="text-center font-bold text-xl text-slate-900 mb-6 tracking-wide">原油采购合同</div>
          
          <div className="space-y-2 font-medium">
            <p>甲方：中海石油（中国）有限公司（以下简称“买方”）</p>
            <p>乙方：中石油国际贸易有限公司（以下简称“卖方”）</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1 mt-6">4 付款条件</h3>
            
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900">4.1 付款方式</h4>
              <p className="pl-4 text-slate-600">（1）本合同项下的货款采用电汇方式支付。</p>
            </div>

            <div className="space-y-2 mt-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="bg-amber-100 border border-amber-300 text-amber-800 text-[11px] px-1.5 py-0.5 rounded-sm">4.2</span>
                <span>付款期限</span>
              </h4>
              <div className="pl-4 relative">
                <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-lg text-slate-700 font-medium relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-amber-400">
                  买方应在收到卖方提交的符合合同约定的发票后30个工作日内完成付款。
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <h4 className="font-bold text-slate-900">4.3 结算币种</h4>
              <div className="pl-4 flex items-center justify-between">
                <p className="text-slate-600">本合同采用美元（USD）结算。</p>
                <button className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-600 rounded-full text-[11px] font-bold transition-all shadow-2xs">
                  <i className="fas fa-link text-[10px]"></i>
                  <span>关联业务：付款管理</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1 mt-6">5 交货与运输</h3>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900">5.1 交货时间</h4>
              <p className="pl-4 text-slate-600">卖方应按照合同约定的交货计划，在2024年12月31日前完成原油交付。</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'contract-2',
      name: '设备采购合同.pdf',
      type: 'pdf',
      status: 'parsed',
      supplier: '华东机械制造有限公司',
      uploadDate: '2024-10-15',
      pages: 58,
      chapters: 10,
      currentPage: 5,
      content: (
        <div className="space-y-6 text-slate-800 text-[13px] leading-relaxed select-text">
          <div className="text-center font-bold text-xl text-slate-900 mb-6 tracking-wide">设备采购合同</div>
          
          <div className="space-y-2 font-medium">
            <p>甲方：中石化华东分公司（以下简称“买方”）</p>
            <p>乙方：华东机械制造有限公司（以下简称“卖方”）</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1 mt-6">5 验收条款</h3>
            
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="bg-amber-100 border border-amber-300 text-amber-800 text-[11px] px-1.5 py-0.5 rounded-sm">5.1</span>
                <span>验收标准</span>
              </h4>
              <div className="pl-4 relative">
                <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-lg text-slate-700 font-medium relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-amber-400">
                  设备到场后需进行24小时连续无故障试运行，各项运行参数需完全符合技术附件规范要求，方可签署最终验收单。
                </div>
              </div>
            </div>

            <div className="space-y-1 mt-4">
              <h4 className="font-bold text-slate-900">5.2 验收时限</h4>
              <p className="pl-4 text-slate-600">买方应在设备到货后15个工作日内组织初验，并在初验合格后30日内完成终验。</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'contract-3',
      name: '服务采购合同.docx',
      type: 'docx',
      status: 'parsed',
      supplier: '蓝海服务集团',
      uploadDate: '2024-09-10',
      pages: 26,
      chapters: 6,
      currentPage: 3,
      content: (
        <div className="space-y-6 text-slate-800 text-[13px] leading-relaxed select-text">
          <div className="text-center font-bold text-xl text-slate-900 mb-6 tracking-wide">技术服务采购合同</div>
          
          <div className="space-y-2 font-medium">
            <p>甲方：国家能源开发部（以下简称“发包方”）</p>
            <p>乙方：蓝海服务集团（以下简称“服务方”）</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1 mt-6">3 服务内容与交付</h3>
            
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900">3.1 交付节点</h4>
              <p className="pl-4 text-slate-600">服务方需在合同签订之日起90日内完成全部技术分析报告的编制、校核及交付工作。</p>
            </div>

            <div className="space-y-2 mt-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="bg-amber-100 border border-amber-300 text-amber-800 text-[11px] px-1.5 py-0.5 rounded-sm">3.2</span>
                <span>服务质量考核标准</span>
              </h4>
              <div className="pl-4 relative">
                <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-lg text-slate-700 font-medium relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-amber-400">
                  报告校核正确率需达到99.8%以上，关键地质及工程数据引用必须提供可追溯的印证证据链，并接受第三方专家审核。
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'contract-4',
      name: '原材料采购合同.docx',
      type: 'docx',
      status: 'parsed',
      supplier: '金属材料有限公司',
      uploadDate: '2024-08-28',
      pages: 40,
      chapters: 9,
      currentPage: 15,
      content: (
        <div className="space-y-6 text-slate-800 text-[13px] leading-relaxed select-text">
          <div className="text-center font-bold text-xl text-slate-900 mb-6 tracking-wide">特种金属原材料采购合同</div>
          
          <div className="space-y-2 font-medium">
            <p>甲方：物资供应总站（以下简称“买方”）</p>
            <p>乙方：金属材料有限公司（以下简称“卖方”）</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1 mt-6">2 价格与结算</h3>
            
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="bg-amber-100 border border-amber-300 text-amber-800 text-[11px] px-1.5 py-0.5 rounded-sm">2.1</span>
                <span>暂定价与结算价差</span>
              </h4>
              <div className="pl-4 relative">
                <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-lg text-slate-700 font-medium relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-amber-400">
                  本合同所定暂定价为不含税单价15,800元/吨，最终结算总价以第三方质检及磅单实收数乘以上海有色网当日结算均价加差价公式为准。
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'contract-5',
      name: '软件采购合同.pdf',
      type: 'pdf',
      status: 'parsed',
      supplier: '航天软件公司',
      uploadDate: '2024-07-16',
      pages: 47,
      chapters: 11,
      currentPage: 8,
      content: (
        <div className="space-y-6 text-slate-800 text-[13px] leading-relaxed select-text">
          <div className="text-center font-bold text-xl text-slate-900 mb-6 tracking-wide">智能管控软件许可采购合同</div>
          
          <div className="space-y-2 font-medium">
            <p>甲方：数智化发展有限公司（以下简称“买方”）</p>
            <p>乙方：航天软件公司（以下简称“卖方”）</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1 mt-6">6 知识产权与保密</h3>
            
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="bg-amber-100 border border-amber-300 text-amber-800 text-[11px] px-1.5 py-0.5 rounded-sm">6.1</span>
                <span>软件永久授权保障</span>
              </h4>
              <div className="pl-4 relative">
                <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-lg text-slate-700 font-medium relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-amber-400">
                  卖方应向买方授予以企业为授权主体的永久无限制授权，并不受后续版本合并、公司分立及母公司重组等法律架构变动的影响。
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'contract-6',
      name: '物流采购合同.docx',
      type: 'docx',
      status: 'parsed',
      supplier: '顺丰速运物流公司',
      uploadDate: '2024-06-05',
      pages: 15,
      chapters: 4,
      currentPage: 2,
      content: (
        <div className="space-y-6 text-slate-800 text-[13px] leading-relaxed select-text">
          <div className="text-center font-bold text-xl text-slate-900 mb-6 tracking-wide">框架物流快递承运采购合同</div>
          
          <div className="space-y-2 font-medium">
            <p>甲方：大中华商贸联运有限公司（以下简称“发包方”）</p>
            <p>乙方：顺丰速运物流公司（以下简称“承包方”）</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1 mt-6">4 运损赔偿与时效责任</h3>
            
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="bg-amber-100 border border-amber-300 text-amber-800 text-[11px] px-1.5 py-0.5 rounded-sm">4.1</span>
                <span>限时未达及运损认定</span>
              </h4>
              <div className="pl-4 relative">
                <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-lg text-slate-700 font-medium relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-amber-400">
                  若承运过程中因不可抗力以外事件导致时效延误超24小时，或发生货物机械挤压变形，将直接扣减该批次运费的30%并支持等额追偿。
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]);

  const activeContract = contracts.find(c => c.id === activeContractId) || contracts[0];

  // Search logic
  const filteredContracts = contracts.filter(c => {
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.supplier.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Toggle single item checkbox selection
  const toggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) {
          next.delete(id);
        }
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredContracts.length) {
      setSelectedIds(new Set([activeContractId]));
    } else {
      setSelectedIds(new Set(filteredContracts.map(c => c.id)));
    }
  };

  // Upload handle
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const isPdf = file.name.endsWith('.pdf');
      
      const newContract: ContractItem = {
        id: `contract-${Date.now()}`,
        name: file.name,
        type: isPdf ? 'pdf' : 'docx',
        status: 'parsed',
        supplier: '新进供应商（请核实）',
        uploadDate: new Date().toISOString().split('T')[0],
        pages: Math.floor(Math.random() * 30) + 10,
        chapters: Math.floor(Math.random() * 5) + 5,
        currentPage: 1,
        content: (
          <div className="space-y-6 text-slate-800 text-[13px] leading-relaxed select-text">
            <div className="text-center font-bold text-xl text-slate-900 mb-6 tracking-wide">{file.name.replace(/\.[^/.]+$/, "")}</div>
            <div className="p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg text-xs flex items-center gap-2 font-medium">
              <i className="fas fa-check-circle text-teal-600 text-sm"></i>
              <span>文档解析成功！该自定义合同已安全载入本地内存空间。</span>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-900">1 合同标的</p>
              <p className="pl-4 text-slate-600">经友好协商，甲乙双方自愿订立本采购许可协议。</p>
            </div>
            <div className="space-y-2 mt-4">
              <p className="font-bold text-slate-900">2 质量条款</p>
              <p className="pl-4 text-slate-600">交付物应当符合行业技术要求及甲方既定验收规范。</p>
            </div>
          </div>
        )
      };

      setContracts(prev => [newContract, ...prev]);
      setActiveContractId(newContract.id);
      setSelectedIds(prev => new Set(prev).add(newContract.id));
    }
  };

  return (
    <div className="flex-1 h-full flex flex-row bg-slate-50 overflow-hidden" id="contract-doc-preview-pane">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".docx,.pdf,.doc"
      />

      {/* LEFT LIST PANEL */}
      <div className="w-[320px] bg-white border-r border-slate-200/90 flex flex-col flex-shrink-0 h-full overflow-hidden">
        {/* Header Title & Upload Button */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <span className="font-bold text-sm text-slate-800 tracking-tight">文档目录</span>
          <button 
            onClick={handleUploadClick}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <i className="fas fa-plus text-[10px]"></i>
            <span>上传</span>
          </button>
        </div>

        {/* Search Contract Bar */}
        <div className="px-3.5 pt-3.5 pb-2 flex-shrink-0 space-y-2">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input 
              type="text" 
              placeholder="搜索合同名称、供应商、内容..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/80 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs pl-8 pr-3 py-1.5 rounded-xl transition-all outline-none"
            />
          </div>

          {/* Multi-selection controller header bar */}
          <div className="flex items-center justify-between text-[11px] px-1 text-slate-500 font-medium">
            <button 
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <input 
                type="checkbox" 
                checked={selectedIds.size === filteredContracts.length && filteredContracts.length > 0}
                onChange={() => {}}
                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
              />
              <span>全选</span>
            </button>
            <span>已选择 <strong className="text-blue-600 font-bold">{selectedIds.size}</strong> 项</span>
          </div>
        </div>

        {/* Scrollable Contracts List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-3 space-y-2">
          {filteredContracts.map((contract) => {
            const isActive = contract.id === activeContractId;
            const isChecked = selectedIds.has(contract.id);

            return (
              <div 
                key={contract.id}
                onClick={() => {
                  setActiveContractId(contract.id);
                  if (!isChecked) {
                    setSelectedIds(prev => new Set(prev).add(contract.id));
                  }
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer select-none relative group flex items-start gap-2.5 ${
                  isActive 
                    ? 'border-blue-500/80 bg-blue-50/30 shadow-2xs' 
                    : isChecked
                    ? 'border-blue-200 bg-blue-50/10'
                    : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50'
                }`}
              >
                {/* Checkbox for multi-selection */}
                <div 
                  onClick={(e) => toggleSelect(contract.id, e)}
                  className="pt-1 flex-shrink-0 cursor-pointer p-0.5 hover:opacity-80"
                >
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                  />
                </div>

                {/* Contract Icon / Info */}
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 shadow-sm mt-0.5 ${
                    contract.type === 'docx' 
                      ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                      : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}>
                    {contract.type === 'docx' ? 'W' : 'A'}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`font-bold text-xs truncate ${isActive ? 'text-blue-700' : 'text-slate-800 group-hover:text-slate-900'}`}>
                        {contract.name}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-600 flex-shrink-0 scale-90 border border-emerald-100">
                        已解析
                      </span>
                    </div>

                    <div className="mt-1.5 text-[10px] text-slate-400 space-y-0.5 font-medium">
                      <p>上传日期：{contract.uploadDate}</p>
                      <div className="flex items-center gap-1.5 pt-1 text-[9px] text-slate-400">
                        <span>页数: {contract.pages}页</span>
                        <span className="text-slate-200">|</span>
                        <span>章节: {contract.chapters}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredContracts.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              <i className="fas fa-file-excel text-lg block mb-2 text-slate-300"></i>
              <span>未搜索到匹配的文档</span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PREVIEW WORKSPACE */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        {/* Document Meta Header info */}
        <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-sm ${
              activeContract.type === 'docx' 
                ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                : 'bg-rose-50 text-rose-600 border border-rose-100'
            }`}>
              {activeContract.type === 'docx' ? 'W' : 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-800">{activeContract.name}</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100 animate-pulse">
                  已解析
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 space-x-2">
                <span>{activeContract.pages}页</span>
                <span>|</span>
                <span>{activeContract.chapters}章</span>
                <span>|</span>
                <span>供应商：{activeContract.supplier}</span>
                <span>|</span>
                <span>上传日期：{activeContract.uploadDate}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Document Action / Tool Menu Bar */}
        <div className="px-6 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between flex-shrink-0 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
              <i className="fas fa-list"></i>
              <span>目录</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
              <i className="fas fa-search"></i>
              <span>文中搜索</span>
            </button>
          </div>

          {/* Navigation and Zoom tools */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2.5">
              <button className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded transition-colors">
                <i className="fas fa-chevron-left text-[10px]"></i>
              </button>
              <span className="text-slate-800 font-bold">{activeContract.currentPage} / {activeContract.pages}</span>
              <button className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded transition-colors">
                <i className="fas fa-chevron-right text-[10px]"></i>
              </button>
            </div>

            <div className="h-4 w-px bg-slate-200"></div>

            <div className="relative">
              <button 
                onClick={() => setZoomLevel(zoomLevel === '100%' ? '125%' : zoomLevel === '125%' ? '150%' : '100%')}
                className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-slate-200 text-slate-700 rounded font-bold"
              >
                <span>{zoomLevel}</span>
                <i className="fas fa-chevron-down text-[8px] text-slate-400"></i>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors" title="下载原文件">
              <i className="fas fa-download"></i>
              <span>下载</span>
            </button>
            <button className="text-slate-400 hover:text-amber-500 transition-colors">
              <i className="far fa-star"></i>
            </button>
          </div>
        </div>

        {/* ACTUAL VIEWPORT PAGE BACKGROUND SCROLL */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex justify-center bg-slate-100/50">
          <div className="w-[680px] bg-white rounded-xl shadow-md border border-slate-200/60 p-10 h-fit min-h-[750px] relative flex flex-col justify-between">
            
            {/* Page main rich layout */}
            <div className="flex-1">
              {activeContract.content}
            </div>

            {/* Footer page identifier */}
            <div className="pt-8 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
              第{activeContract.currentPage}页 / 共{activeContract.pages}页
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
