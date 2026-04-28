
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { translations } from '../i18n';
import { Language, ResourceNode } from '../types';
import { DirectoryTree } from './DirectoryTree';
import { DRILLING_RESOURCE_TREE } from '../constants';
import { ObjectScopeSelector } from './ObjectScopeSelector';

// --- MOCK DATA ---
const DOMAINS = {
  object: [
    '井', '区块', '组织机构', '管线', '盆地', '油气藏', '油气田'
  ],
  business: ['勘探', '开发', '上游 – 钻井工程', '生产', '安环', '经营', '综合研究'],
  work: ['科研', '生产', '管理', '决策', '设计', '施工', '钻井作业'],
  professional: ['地质', '物探', '测井', '录井', '钻井', '钻井工程', '油藏', '采油', '地面工程']
};

interface SystemFile {
  name: string;
  type: string;
  missing?: boolean;
}

// 3. MBU Data Structure (Instance + Template)
interface MBUNode {
    uniqueId: string;
    name: string; // The MBU Title
    files: SystemFile[];
    // Domain Attributes for Filtering
    objectDomain: string;
    businessDomain: string;
    workDomain: string;
    professionalDomain: string;
}

interface Fragment {
    id: string;
    content: string;
    page: number;
    selected: boolean;
    targetMbuId?: string; // The MBU this fragment belongs to
}

// Helper to generate mock files for a given MBU
const generateMockFiles = (mbuTitle: string): SystemFile[] => {
    if (mbuTitle.includes('参数图')) return [{ name: `参数图_v1.pdf`, type: 'doc' }, { name: `原始数据.las`, type: 'data', missing: true }];
    if (mbuTitle.includes('取心')) return [{ name: `取心表.xlsx`, type: 'xls' }];
    if (mbuTitle.includes('测斜')) return [{ name: `测斜轨迹.png`, type: 'img' }, { name: `测斜数据.csv`, type: 'data' }];
    if (mbuTitle.includes('钻具')) return [{ name: `BHA组合.xlsx`, type: 'xls' }];
    if (mbuTitle.includes('人员')) return [{ name: `班组资质.pdf`, type: 'doc' }];
    if (mbuTitle.includes('构造演化')) return [{ name: `区域构造演化报告.pdf`, type: 'doc' }, { name: `构造图.png`, type: 'img' }];
    if (mbuTitle.includes('烃源岩')) return [{ name: `烃源岩热演化分析.xlsx`, type: 'xls' }];
    if (mbuTitle.includes('砂体预测')) return [{ name: `砂体预测成果图.png`, type: 'img' }];
    if (mbuTitle.includes('泥岩厚度')) return [{ name: `盖层泥岩厚度数据.csv`, type: 'data' }];
    if (mbuTitle.includes('闭合属性')) return [{ name: `地震闭合属性表.xlsx`, type: 'xls' }];
    if (mbuTitle.includes('试油结果')) return [{ name: `邻井试油结果汇总.pdf`, type: 'doc' }];
    if (mbuTitle.includes('失利井')) return [{ name: `历史失利井原因分析.docx`, type: 'doc' }];
    if (mbuTitle.includes('资源量')) return [{ name: `资源量参数计算表.xlsx`, type: 'xls' }];
    return [{ name: `通用附件.docx`, type: 'doc' }];
};

// Generate a rich set of Mock System MBUs
const generateSystemMBUs = (): MBUNode[] => {
    const mbus: MBUNode[] = [];
    const instances = [
        { name: 'X-1 井', object: '井', business: '上游 – 钻井工程', work: '钻井作业', professional: '钻井工程' },
        { name: 'X-2 井', object: '井', business: '开发', work: '生产', professional: '采油' },
        { name: 'A 区块', object: '区块', business: '勘探', work: '科研', professional: '物探' },
        { name: 'B 区块', object: '区块', business: '综合研究', work: '科研', professional: '地质' },
        { name: '钻井作业队-001', object: '组织机构', business: '经营', work: '管理', professional: '钻井' }
    ];

    const templates = [
        '岩心录井钻井参数图绘制',
        '岩心录井钻井取心基础数据记录',
        '钻井定向测斜成果记录',
        '钻井钻具组合基本信息记录',
        '钻井作业人员信息记录',
        '区域构造演化',
        '烃源岩热演化',
        '砂体预测成果',
        '盖层泥岩厚度',
        '地震闭合属性',
        '邻井试油结果',
        '历史失利井报告',
        '资源量参数表'
    ];

    instances.forEach((inst, i) => {
        templates.forEach((tmpl, j) => {
            mbus.push({
                uniqueId: `sys-mbu-${i}-${j}`,
                name: tmpl,
                files: generateMockFiles(tmpl),
                objectDomain: inst.object,
                businessDomain: inst.business,
                workDomain: inst.work,
                professionalDomain: inst.professional
            });
        });
    });
    
    return mbus;
};

const MOCK_SYSTEM_MBUS = generateSystemMBUs();

// Helper to remove extension for display
const removeExtension = (filename: string) => {
    return filename.replace(/\.[^/.]+$/, "");
};

// --- Custom MultiSelect Component ---
const MultiSelectDropdown: React.FC<{
  label: string;
  options: { label: string, value: string }[];
  selected: string[]; // array of values
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}> = ({ label, options, selected, onChange, disabled = false, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter(s => s !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Display selected labels instead of count
  const displayValue = selected.length > 0
    ? options.filter(o => selected.includes(o.value)).map(o => o.label).join(', ')
    : (placeholder || '请选择...');

  return (
    <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={containerRef}>
      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-0.5">{label}</label>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full text-xs border rounded p-2.5 bg-white cursor-pointer flex justify-between items-center transition-all min-h-[38px] ${
            isOpen ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm' : 'border-gray-200 hover:border-gray-300'
        }`}
        title={displayValue}
      >
        <span className={`truncate mr-2 ${selected.length === 0 ? 'text-gray-400' : 'text-gray-800 font-medium'}`}>
          {displayValue}
        </span>
        <i className={`fas fa-chevron-down text-gray-400 text-[10px] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col">
           {options.length > 5 && (
               <div className="p-2 border-b border-gray-100 bg-gray-50">
                   <input 
                      className="w-full text-xs border border-gray-200 rounded p-1.5 focus:outline-none focus:border-blue-500" 
                      placeholder="搜索..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      autoFocus
                   />
               </div>
           )}
           <div className="overflow-y-auto custom-scrollbar flex-1 p-1">
               {filteredOptions.length === 0 ? (
                   <div className="p-3 text-center text-gray-400 text-xs">无匹配项</div>
               ) : (
                   filteredOptions.map(opt => {
                       const isSelected = selected.includes(opt.value);
                       return (
                        <div 
                            key={opt.value} 
                            onClick={() => toggleOption(opt.value)}
                            className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors ${
                                isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                            }`}
                        >
                        <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center mr-2.5 flex-shrink-0 transition-colors ${
                            isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                        }`}>
                            {isSelected && <i className="fas fa-check text-white text-[8px]"></i>}
                        </div>
                        <span className="text-xs">{opt.label}</span>
                        </div>
                       );
                   })
               )}
           </div>
        </div>
      )}
    </div>
  );
};

interface AddResourcePageProps {
  onClose: () => void;
  onConfirm: (data: any) => void;
  lang: Language;
  initialTree?: ResourceNode[];
  workspaceId?: string | null;
}

export const AddResourcePage: React.FC<AddResourcePageProps> = ({ onClose, onConfirm, lang, initialTree, workspaceId }) => {
  const t = translations[lang];
  
  // Scoping Filters
  const [filters, setFilters] = useState<{
    business: string[];
    work: string[];
    object: string[];
    professional: string[];
  }>({ business: [], work: [], object: [], professional: [] });
  
  const [selectedTreeIds, setSelectedTreeIds] = useState<Set<string>>(new Set());
  
  // Generated MBU List (The "System Context")
  const [mbuList, setMbuList] = useState<MBUNode[]>([]);

  // Resource Selection State
  const [activeTab, setActiveTab] = useState<'system' | 'local'>('system');
  
  // Accordion State for Sidebar
  const [expandedSection, setExpandedSection] = useState<'mbu' | 'object'>('mbu');
  
  // Selected Files: Set<"mbuUniqueId-fileIdx">
  const [selectedFileKeys, setSelectedFileKeys] = useState<Set<string>>(new Set());
  
  // Upload State for Missing System Files
  const [uploadedSystemFiles, setUploadedSystemFiles] = useState<Record<string, File>>({});

  // Local Files State
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  
  // Parsing State
  const [parsingStatus, setParsingStatus] = useState<Record<string, 'idle' | 'parsing' | 'done'>>({});
  const [parsedFragments, setParsedFragments] = useState<Record<string, Fragment[]>>({});
  const [viewingFileIndex, setViewingFileIndex] = useState<number | null>(null); // Index of file currently viewing fragments for
  
  // Default Target MBUs for Local Files
  const [defaultTargetMbuIds, setDefaultTargetMbuIds] = useState<string[]>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const missingFileInputRef = useRef<HTMLInputElement>(null);
  const [pendingUploadKey, setPendingUploadKey] = useState<string | null>(null);

  // HYDRATION LOGIC: Populate state from existing tree
  useEffect(() => {
      // 1. Pre-fill Filters for specific Drilling scenario
      if (workspaceId === 'ws-drilling-x1') {
          setFilters({
              object: ['井'],
              business: ['上游 – 钻井工程'],
              work: ['钻井作业'],
              professional: ['钻井工程']
          });
          // Auto-load for this preset
          const presetMBUs = MOCK_SYSTEM_MBUS.filter(m => 
              m.objectDomain === '井' && 
              m.businessDomain === '上游 – 钻井工程' && 
              m.workDomain === '钻井作业' && 
              m.professionalDomain === '钻井工程'
          );
          setMbuList(presetMBUs);
      }

      // 2. Parse Existing Resources
      if (initialTree) {
          // A. Parse Local Resources
          const localRoot = initialTree.find(n => n.name === '本地资源' && n.type === 'domain');
          if (localRoot && localRoot.children) {
              const existingLocal = localRoot.children.map(n => {
                  const f = new File([], n.name); 
                  return f;
              });
              setLocalFiles(existingLocal);
          }

          // B. Parse System Resources to Hydrate MBU List
          const systemDomains = initialTree.filter(n => n.type === 'domain' && n.name !== '本地资源' && n.name !== '网络资源');
          
          if (systemDomains.length > 0) {
              const hydratedMBUs: MBUNode[] = [];
              const hydratedKeys = new Set<string>();

              const findMBUs = (nodes: ResourceNode[]) => {
                  for (const node of nodes) {
                      if (node.type === 'mbu') {
                          const uniqueId = node.id;
                          const files = node.children?.map(c => ({
                              name: c.name,
                              type: c.meta?.fileType === 'Excel' ? 'xls' : c.meta?.fileType === 'PDF' ? 'doc' : 'doc',
                              missing: false
                          })) || [];

                          // Try to find matching mock MBU to recover domains, otherwise use defaults
                          const mockMatch = MOCK_SYSTEM_MBUS.find(m => m.name === node.name);

                          hydratedMBUs.push({
                              uniqueId: uniqueId,
                              name: node.name,
                              files: files,
                              objectDomain: mockMatch?.objectDomain || '未知',
                              businessDomain: mockMatch?.businessDomain || '未知',
                              workDomain: mockMatch?.workDomain || '未知',
                              professionalDomain: mockMatch?.professionalDomain || '未知'
                          });

                          files.forEach((_, idx) => {
                              hydratedKeys.add(`${uniqueId}-${idx}`);
                          });
                      }
                      if (node.children) findMBUs(node.children);
                  }
              };
              
              systemDomains.forEach(domain => {
                  if (domain.children) findMBUs(domain.children);
              });

              if (hydratedMBUs.length > 0) {
                  setMbuList(prev => {
                      // Merge hydrated with current (if any)
                      // For simplicity, just use hydrated if we haven't loaded anything else
                      return prev.length === 0 ? hydratedMBUs : prev; 
                  });
                  setSelectedFileKeys(hydratedKeys);
              }
          }
      }
  }, [initialTree, workspaceId]);

  // Handle "Confirm/Load" Click - Filter MOCK_SYSTEM_MBUS
  useEffect(() => {
    // Get names of selected nodes from the tree
    const getSelectedNames = (nodes: ResourceNode[]): string[] => {
        let names: string[] = [];
        nodes.forEach(node => {
            if (selectedTreeIds.has(node.id)) {
                // Strip count like " (6903)"
                names.push(node.name.replace(/\s\(\d+\)$/, ''));
            }
            if (node.children) {
                names = [...names, ...getSelectedNames(node.children)];
            }
        });
        return names;
    };

    const selectedNames = getSelectedNames(DRILLING_RESOURCE_TREE);

    const filtered = MOCK_SYSTEM_MBUS.filter(mbu => {
        // Match Tree Selection (Business, Work, Professional)
        // If nothing selected in tree, allow all (or maybe allow none? Let's say allow all if empty for better UX)
        const noTreeSelection = selectedTreeIds.size === 0;
        const matchTree = noTreeSelection || selectedNames.some(name => 
            mbu.businessDomain.includes(name) || 
            mbu.workDomain.includes(name) || 
            mbu.professionalDomain.includes(name) ||
            name.includes(mbu.businessDomain) ||
            name.includes(mbu.workDomain) ||
            name.includes(mbu.professionalDomain)
        );

        return matchTree;
    });
    
    setMbuList(filtered);
    // Note: We don't auto-switch tab here to avoid jarring UX during tree selection
  }, [selectedTreeIds, filters.object]);

  // Global "Select All" Logic across all visible MBUs
  const allSelectableFileKeys = useMemo(() => {
      const keys: string[] = [];
      mbuList.forEach(mbu => {
          mbu.files.forEach((file, idx) => {
              const key = `${mbu.uniqueId}-${idx}`;
              // Only include if not missing OR if missing but uploaded
              if (!file.missing || uploadedSystemFiles[key]) {
                  keys.push(key);
              }
          });
      });
      return keys;
  }, [mbuList, uploadedSystemFiles]);

  const isGlobalAllSelected = allSelectableFileKeys.length > 0 && allSelectableFileKeys.every(k => selectedFileKeys.has(k));

  const toggleGlobalSelectAll = () => {
      if (allSelectableFileKeys.length === 0) return;

      if (isGlobalAllSelected) {
          setSelectedFileKeys(new Set());
      } else {
          setSelectedFileKeys(new Set(allSelectableFileKeys));
      }
  };

  const toggleSystemFile = (mbuUniqueId: string, fileIdx: number, isMissing: boolean) => {
    const key = `${mbuUniqueId}-${fileIdx}`;
    if (isMissing && !uploadedSystemFiles[key]) return;
    
    const next = new Set(selectedFileKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedFileKeys(next);
  };

  const removeMBU = (uniqueId: string) => {
      setMbuList(prev => prev.filter(m => m.uniqueId !== uniqueId));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (activeTab === 'local') {
      const files = Array.from(e.dataTransfer.files);
      setLocalFiles(prev => [...prev, ...files]);
    }
  };

  // Parsing Simulation
  const simulateParsing = (fileIndex: number) => {
      const file = localFiles[fileIndex];
      const fileId = `local-${fileIndex}`; // Simple ID for this session
      
      setParsingStatus(prev => ({ ...prev, [fileId]: 'parsing' }));

      // Simulate API delay
      setTimeout(() => {
          // Generate mock fragments
          // Assign default MBU if available (Round Robin or Random)
          const assignMbu = (idx: number) => {
              if (defaultTargetMbuIds.length === 0) return undefined;
              return defaultTargetMbuIds[idx % defaultTargetMbuIds.length];
          };

          const fragments: Fragment[] = [
              { id: `frag-${fileId}-1`, content: `...${file.name} 摘要部分...\n这是文档的第一部分内容，包含了主要的项目背景和目标设定。`, page: 1, selected: true, targetMbuId: assignMbu(0) },
              { id: `frag-${fileId}-2`, content: `...技术规格说明...\n详细列出了本次钻井作业的技术参数要求，包括钻头选型、泥浆比重等关键指标。`, page: 3, selected: true, targetMbuId: assignMbu(1) },
              { id: `frag-${fileId}-3`, content: `...风险评估报告...\n针对可能出现的地质风险进行了定性与定量分析，并提出了相应的缓解措施。`, page: 5, selected: false, targetMbuId: assignMbu(2) },
              { id: `frag-${fileId}-4`, content: `...附录数据表...\n包含了历史井的对比数据和地层压力预测曲线。`, page: 8, selected: false, targetMbuId: assignMbu(3) },
          ];

          setParsedFragments(prev => ({ ...prev, [fileId]: fragments }));
          setParsingStatus(prev => ({ ...prev, [fileId]: 'done' }));
      }, 2000);
  };

  const toggleFragmentSelection = (fileId: string, fragmentId: string) => {
      setParsedFragments(prev => {
          const frags = prev[fileId] || [];
          return {
              ...prev,
              [fileId]: frags.map(f => f.id === fragmentId ? { ...f, selected: !f.selected } : f)
          };
      });
  };

  const changeFragmentMbu = (fileId: string, fragmentId: string, mbuId: string) => {
      setParsedFragments(prev => {
          const frags = prev[fileId] || [];
          return {
              ...prev,
              [fileId]: frags.map(f => f.id === fragmentId ? { ...f, targetMbuId: mbuId } : f)
          };
      });
  };

  const initiateMissingUpload = (key: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setPendingUploadKey(key);
      missingFileInputRef.current?.click();
  };

  const handleMissingFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && pendingUploadKey) {
          const file = e.target.files[0];
          setUploadedSystemFiles(prev => ({ ...prev, [pendingUploadKey]: file }));
          setSelectedFileKeys(prev => {
              const next = new Set(prev);
              next.add(pendingUploadKey);
              return next;
          });
      }
      setPendingUploadKey(null);
      if (missingFileInputRef.current) missingFileInputRef.current.value = '';
  };

  const handleConfirm = () => {
    let allResources: any[] = [];
    let allMbus: any[] = [];

    // 1. Aggregate System Resources
    const selectedSystemMBUs = mbuList.filter(mbu => {
        return mbu.files.some((_, idx) => selectedFileKeys.has(`${mbu.uniqueId}-${idx}`));
    });

    if (selectedSystemMBUs.length > 0) {
        const systemMbusPayload = selectedSystemMBUs.map(mbu => ({
           id: mbu.uniqueId,
           name: mbu.name, // Only the MBU name (template), excluding object instance name
           type: 'mbu',
           workDomain: mbu.workDomain // Pass the work domain to parent
       }));
       allMbus = [...allMbus, ...systemMbusPayload];

       selectedSystemMBUs.forEach(mbu => {
           mbu.files.forEach((f, idx) => {
               const key = `${mbu.uniqueId}-${idx}`;
               if (selectedFileKeys.has(key)) {
                   const resPayload = {
                       name: f.name,
                       sourceType: uploadedSystemFiles[key] ? 'local' : 'system',
                       fileObj: uploadedSystemFiles[key], // undefined if not uploaded
                       parentMbuId: mbu.uniqueId,
                       fileType: f.type
                   };
                   allResources.push(resPayload);
               }
           });
       });
    }

    // 2. Aggregate Local Resources
    if (localFiles.length > 0) {
       const dummyMbu = { id: 'local-mbu', name: '本地上传 (Local Uploads)', type: 'mbu' };
       // Only add dummy MBU if we have files that are NOT assigned to system MBUs
       // OR if we just want to keep the file record there.
       // Strategy: Always add file to local-mbu (as source), but fragments might go elsewhere.
       
       // Actually, if we want fragments to appear under System MBUs, we should add them as resources to those MBUs.
       // But the `allResources` payload structure expects `parentMbuId`.
       
       let hasUnassignedLocal = false;

       localFiles.forEach((f, idx) => {
           const fileId = `local-${idx}`;
           const fragments = parsedFragments[fileId];
           const selectedFrags = fragments?.filter(fr => fr.selected);

           // 1. Add the main file to 'local-mbu' (or maybe we don't if all fragments are assigned?)
           // Let's keep the main file in 'local-mbu' as the "Source Document".
           hasUnassignedLocal = true; // For now, always keep source file in local
           
           const sourceFilePayload = { 
               name: f.name, 
               sourceType: 'local', 
               fileObj: f, 
               parentMbuId: dummyMbu.id,
               // Attach fragments that are NOT assigned to specific MBUs here?
               // Or just attach all fragments here as children?
               // If we attach all here, they won't show up under System MBUs in the tree.
               
               // Let's attach UNASSIGNED fragments here.
               fragments: selectedFrags?.filter(fr => !fr.targetMbuId).map(fr => ({
                   id: fr.id,
                   name: `片段 P${fr.page}: ${fr.content.substring(0, 10)}...`,
                   content: fr.content,
                   page: fr.page
               }))
           };
           allResources.push(sourceFilePayload);

           // 2. Distribute Assigned Fragments to System MBUs
           selectedFrags?.filter(fr => fr.targetMbuId).forEach(fr => {
               // We need to create a "Resource" for this fragment to attach to the System MBU
               // It's effectively a "Snippet" resource.
               const fragmentPayload = {
                   name: `${f.name} - P${fr.page} 片段`,
                   sourceType: 'local',
                   fileObj: null, // It's a virtual resource derived from local file
                   parentMbuId: fr.targetMbuId,
                   fileType: 'Fragment',
                   content: fr.content,
                   page: fr.page,
                   isFragment: true // Marker
               };
               allResources.push(fragmentPayload);
           });
       });

       if (hasUnassignedLocal) {
           allMbus.push(dummyMbu);
       }
    }

    onConfirm({ 
        mbus: allMbus, 
        resources: allResources, 
        sourceType: 'mixed',
        selectedObjects: filters.object.map(obj => ({ id: `obj-${obj}`, label: obj }))
    });
  };

  const systemCount = selectedFileKeys.size;
  const localCount = localFiles.length;
  
  // Calculate distinct System MBUs involved
  const systemMbuIds = new Set<string>();
  selectedFileKeys.forEach(k => {
      const idx = k.lastIndexOf('-');
      if (idx > -1) systemMbuIds.add(k.substring(0, idx));
  });
  
  const totalMbuCount = systemMbuIds.size + (localCount > 0 ? 1 : 0);
  const totalResourceCount = systemCount + localCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm transition-opacity">
      {/* Width 70% (w-[70vw]) */}
      <div className="bg-white w-[70vw] h-[90vh] min-w-[800px] min-h-[650px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex justify-between items-center px-8 bg-white flex-shrink-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{t.addResource}</h2>
            <p className="text-xs text-gray-500">MBU 最小业务单元资源配置</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Main Body - Split Layout */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT SIDEBAR: Scope & Object Instance Selection (30%) */}
            <div className="w-[30%] bg-slate-50 border-r border-gray-200 flex flex-col flex-shrink-0 z-10">
                <div className="flex-1 flex flex-col overflow-hidden">
                    
                    {/* MBU Scope Accordion */}
                    <div className={`flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${expandedSection === 'mbu' ? 'flex-1' : 'h-14'}`}>
                        <div 
                            onClick={() => setExpandedSection('mbu')}
                            className={`p-4 border-b border-gray-200 cursor-pointer flex items-center justify-between transition-colors ${expandedSection === 'mbu' ? 'bg-white' : 'bg-slate-50 hover:bg-slate-100'}`}
                        >
                            <div className="flex items-center">
                                <div className={`w-1 h-4 mr-2 rounded ${expandedSection === 'mbu' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                <h3 className={`text-sm font-bold ${expandedSection === 'mbu' ? 'text-gray-800' : 'text-gray-500'}`}>{t.mbuScope}</h3>
                            </div>
                            <i className={`fas fa-chevron-down text-xs transition-transform duration-300 ${expandedSection === 'mbu' ? 'rotate-180 text-blue-600' : 'text-gray-400'}`}></i>
                        </div>
                        
                        {expandedSection === 'mbu' && (
                            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500">
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <DirectoryTree 
                                        treeData={DRILLING_RESOURCE_TREE}
                                        selectedResources={selectedTreeIds}
                                        onToggleResource={(id) => {
                                            setSelectedTreeIds(prev => {
                                                const next = new Set(prev);
                                                if (next.has(id)) next.delete(id);
                                                else next.add(id);
                                                return next;
                                            });
                                        }}
                                        onSelectNode={() => {}}
                                        lang={lang}
                                        maxLevel={4}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Object Scope Accordion */}
                    <div className={`flex flex-col transition-all duration-300 ease-in-out overflow-hidden border-t border-gray-200 ${expandedSection === 'object' ? 'flex-1' : 'h-14'}`}>
                        <div 
                            onClick={() => setExpandedSection('object')}
                            className={`p-4 border-b border-gray-200 cursor-pointer flex items-center justify-between transition-colors ${expandedSection === 'object' ? 'bg-white' : 'bg-slate-50 hover:bg-slate-100'}`}
                        >
                            <div className="flex items-center">
                                <div className={`w-1 h-4 mr-2 rounded ${expandedSection === 'object' ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                <h3 className={`text-sm font-bold ${expandedSection === 'object' ? 'text-gray-800' : 'text-gray-500'}`}>对象范围</h3>
                            </div>
                            <i className={`fas fa-chevron-down text-xs transition-transform duration-300 ${expandedSection === 'object' ? 'rotate-180 text-indigo-600' : 'text-gray-400'}`}></i>
                        </div>

                        {expandedSection === 'object' && (
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-white animate-in fade-in duration-500">
                                <ObjectScopeSelector 
                                    selectedObjects={filters.object}
                                    onChange={(s) => setFilters(p => ({...p, object: s}))}
                                    lang={lang}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT CONTENT: System / Local / Web (70%) */}
            <div className="w-[70%] flex flex-col bg-white min-w-0">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-6 pt-4 bg-white flex-shrink-0 gap-6">
                    {[
                        { id: 'system', label: t.system, icon: 'fa-server' },
                        { id: 'local', label: t.local, icon: 'fa-desktop' }
                    ].map(tab => (
                        <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`pb-3 text-sm font-bold flex items-center border-b-[3px] transition-colors ${
                            activeTab === tab.id 
                            ? 'border-blue-600 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                        >
                        <i className={`fas ${tab.icon} mr-2`}></i> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative bg-gray-50/50">
                    {activeTab === 'system' && (
                        <div className="h-full flex flex-col">
                            {/* Toolbar */}
                            <div className="px-6 py-3 bg-white flex justify-between items-center shadow-sm z-10">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-gray-700">
                                        已选 MBU 清单 ({mbuList.length})
                                    </span>
                                    {mbuList.length > 0 && (
                                        <button 
                                            onClick={toggleGlobalSelectAll}
                                            disabled={allSelectableFileKeys.length === 0}
                                            className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors border border-blue-200"
                                        >
                                            <i className={`fas ${isGlobalAllSelected ? 'fa-check-square' : 'fa-square'} mr-1.5`}></i>
                                            {isGlobalAllSelected ? '取消全选' : '全选所有成果'}
                                        </button>
                                    )}
                                </div>
                                <div className="text-xs text-gray-400">
                                    <i className="fas fa-info-circle mr-1"></i>
                                    勾选 MBU 内的成果文件以加入工作空间
                                </div>
                            </div>

                            {/* Table Header */}
                            <div className="flex items-center px-4 py-2 bg-gray-100 border-y border-gray-200 text-xs font-bold text-gray-500 flex-shrink-0">
                                <div className="w-10 text-center flex-shrink-0">选择</div>
                                <div className="w-[35%] px-3">MBU 节点名称</div>
                                <div className="flex-1 px-3">成果名称</div>
                                <div className="w-[140px] text-right px-3">操作</div>
                            </div>
                            
                            {/* MBU List - FLATTENED VIEW */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {mbuList.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                                        <i className="fas fa-cubes text-4xl mb-3"></i>
                                        <p className="text-sm">请在左侧选择对象并点击“加载”</p>
                                    </div>
                                ) : (
                                    mbuList.flatMap((mbu) => 
                                        mbu.files.map((file, idx) => {
                                            const fileKey = `${mbu.uniqueId}-${idx}`;
                                            const isUploaded = !!uploadedSystemFiles[fileKey];
                                            const isMissingAndEmpty = file.missing && !isUploaded;
                                            const isSelected = selectedFileKeys.has(fileKey);

                                            return (
                                                <div 
                                                    key={fileKey}
                                                    onClick={() => toggleSystemFile(mbu.uniqueId, idx, !!file.missing)}
                                                    className={`group flex items-center px-3 py-3 rounded-lg border transition-all ${
                                                        isMissingAndEmpty 
                                                            ? 'bg-gray-50 border-gray-100 cursor-default' 
                                                            : 'bg-white border-gray-200 cursor-pointer hover:border-blue-300 hover:shadow-sm'
                                                    } ${isSelected ? 'ring-1 ring-blue-500 border-blue-500 bg-blue-50/20' : ''}`}
                                                >
                                                    {/* Checkbox Column */}
                                                    <div className="w-10 flex justify-center flex-shrink-0">
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                                            isSelected 
                                                            ? 'bg-blue-600 border-blue-600 text-white' 
                                                            : (isMissingAndEmpty ? 'bg-gray-100 border-gray-300' : 'border-gray-300 bg-white')
                                                        }`}>
                                                            {isSelected && <i className="fas fa-check text-[10px]"></i>}
                                                        </div>
                                                    </div>

                                                    {/* MBU Name Column */}
                                                    <div className="w-[35%] px-3 min-w-0">
                                                        <div className="font-bold text-gray-700 text-sm truncate" title={mbu.name}>
                                                            {mbu.name}
                                                        </div>
                                                    </div>

                                                    {/* Artifact Name + Icon Column */}
                                                    <div className="flex-1 px-3 min-w-0 flex items-center">
                                                        <i className={`fas ${file.type === 'doc' ? 'fa-file-word text-blue-500' : file.type === 'xls' ? 'fa-file-excel text-green-600' : file.type === 'img' ? 'fa-image text-purple-500' : 'fa-file text-gray-400'} text-lg mr-2 flex-shrink-0`}></i>
                                                        <span className={`text-sm truncate ${isMissingAndEmpty ? 'text-gray-400 italic' : 'text-gray-600'}`} title={file.name}>
                                                            {removeExtension(file.name)}
                                                        </span>
                                                    </div>

                                                    {/* Actions Column */}
                                                    <div className="w-[140px] px-3 flex items-center justify-end gap-2 flex-shrink-0">
                                                        {isUploaded && (
                                                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">已上传</span>
                                                        )}
                                                        {file.missing && !isUploaded && (
                                                            <button 
                                                                onClick={(e) => initiateMissingUpload(fileKey, e)}
                                                                className="text-xs border border-blue-200 text-blue-600 px-2 py-0.5 rounded hover:bg-blue-50 transition-colors flex-shrink-0"
                                                            >
                                                                上传
                                                            </button>
                                                        )}
                                                        
                                                        {/* Delete MBU Node Button */}
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeMBU(mbu.uniqueId);
                                                            }}
                                                            className="text-gray-300 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors ml-1"
                                                            title="移除此 MBU"
                                                        >
                                                            <i className="fas fa-trash-alt"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )
                                )}
                            </div>
                            <input type="file" ref={missingFileInputRef} className="hidden" onChange={handleMissingFileChange} />
                        </div>
                    )}

                    {activeTab === 'local' && (
                        <div className="h-full flex flex-col p-8 items-center" onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
                            {/* Default MBU Selector */}
                            <div className="w-full max-w-2xl mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        默认挂载 MBU (可选)
                                    </label>
                                    <span className="text-[10px] text-gray-400">
                                        从已选系统 MBU 中选择，解析后的片段将默认分配给这些节点
                                    </span>
                                </div>
                                <MultiSelectDropdown 
                                    label=""
                                    options={Array.from(systemMbuIds).map(id => {
                                        const mbu = mbuList.find(m => m.uniqueId === id);
                                        return { label: mbu?.name || id, value: id };
                                    })}
                                    selected={defaultTargetMbuIds}
                                    onChange={setDefaultTargetMbuIds}
                                    placeholder="选择默认挂载的 MBU..."
                                    disabled={systemMbuIds.size === 0}
                                />
                            </div>

                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full max-w-2xl h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-400 cursor-pointer transition-colors flex-shrink-0"
                            >
                                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                <p className="text-gray-600 font-medium text-sm">拖拽或点击上传文件</p>
                                <input type="file" multiple ref={fileInputRef} className="hidden" onChange={e => e.target.files && setLocalFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
                            </div>
                            
                            <div className="w-full max-w-2xl mt-6 space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                {localFiles.length === 0 && (
                                    <div className="text-center text-gray-400 text-sm mt-10">
                                        暂无上传文件
                                    </div>
                                )}
                                {localFiles.map((f, i) => {
                                    const fileId = `local-${i}`;
                                    const status = parsingStatus[fileId] || 'idle';
                                    const fragments = parsedFragments[fileId] || [];
                                    const selectedCount = fragments.filter(fr => fr.selected).length;

                                    return (
                                        <div key={i} className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center text-sm flex-1 min-w-0 mr-4">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mr-3 flex-shrink-0">
                                                    <i className="fas fa-file-alt text-lg"></i>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-gray-800 truncate" title={f.name}>{f.name}</span>
                                                    <span className="text-xs text-gray-400">{(f.size / 1024).toFixed(1)} KB</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                {/* Status Indicator */}
                                                {status === 'parsing' && (
                                                    <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                        <i className="fas fa-spinner fa-spin mr-1.5"></i> 解析中...
                                                    </div>
                                                )}
                                                {status === 'done' && (
                                                    <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                                        <i className="fas fa-check-circle mr-1.5"></i> 
                                                        已解析 ({selectedCount}/{fragments.length})
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                {status === 'idle' && (
                                                    <button 
                                                        onClick={() => simulateParsing(i)}
                                                        className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors shadow-sm"
                                                    >
                                                        <i className="fas fa-magic mr-1"></i> 智能解析
                                                    </button>
                                                )}
                                                
                                                {status === 'done' && (
                                                    <button 
                                                        onClick={() => setViewingFileIndex(i)}
                                                        className="text-xs border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded hover:bg-indigo-50 transition-colors"
                                                    >
                                                        查看结果
                                                    </button>
                                                )}

                                                <button 
                                                    onClick={() => setLocalFiles(p => p.filter((_, idx) => idx !== i))} 
                                                    className="w-8 h-8 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center"
                                                    title="删除"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="h-16 border-t border-gray-200 px-8 flex justify-between items-center bg-white z-10 flex-shrink-0">
          <div className="flex gap-4 text-xs font-medium text-gray-600">
             <div className="flex items-center bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full">
                <i className="fas fa-cubes mr-2 text-gray-500"></i>
                <span className="mr-1">MBU</span>
                <span className="font-bold text-gray-800">{totalMbuCount}</span>
             </div>
             {systemCount > 0 && (
                 <div className="flex items-center bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
                    <i className="fas fa-server mr-2 text-indigo-500"></i>
                    <span className="mr-1">{t.system}</span>
                    <span className="font-bold text-indigo-700">{systemCount}</span>
                 </div>
             )}
             {localCount > 0 && (
                 <div className="flex items-center bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full">
                    <i className="fas fa-desktop mr-2 text-orange-500"></i>
                    <span className="mr-1">{t.local}</span>
                    <span className="font-bold text-orange-700">{localCount}</span>
                 </div>
             )}
          </div>
          <div className="flex gap-3">
             <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded transition-colors">{t.cancel}</button>
             <button 
                onClick={handleConfirm}
                disabled={totalResourceCount === 0}
                className={`px-6 py-2 text-sm font-bold text-white rounded shadow-md transition-all ${
                    totalResourceCount === 0 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                }`}
             >
                {t.confirm}
             </button>
          </div>
        </div>

        {/* Fragment Viewer Modal (Nested) */}
        {viewingFileIndex !== null && (
            <div className="absolute inset-0 z-50 bg-white flex flex-col animate-[fadeIn_0.2s_ease-out]">
                <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-slate-50">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setViewingFileIndex(null)} className="text-gray-500 hover:text-gray-800 mr-2">
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <h3 className="font-bold text-gray-800">解析结果: {localFiles[viewingFileIndex].name}</h3>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                            {parsedFragments[`local-${viewingFileIndex}`]?.length || 0} 个片段
                        </span>
                    </div>
                    <button 
                        onClick={() => setViewingFileIndex(null)}
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-indigo-700"
                    >
                        确认选择
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <div className="max-w-4xl mx-auto space-y-4">
                        {parsedFragments[`local-${viewingFileIndex}`]?.map((frag) => (
                            <div 
                                key={frag.id} 
                                className={`p-4 rounded-xl border transition-all ${
                                    frag.selected 
                                    ? 'bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500' 
                                    : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleFragmentSelection(`local-${viewingFileIndex}`, frag.id)}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                            frag.selected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'
                                        }`}>
                                            {frag.selected && <i className="fas fa-check text-white text-xs"></i>}
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Page {frag.page}</span>
                                    </div>
                                    
                                    {/* MBU Assignment Dropdown */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">挂载至:</span>
                                        <select 
                                            className="text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50 focus:outline-none focus:border-indigo-500 max-w-[200px]"
                                            value={frag.targetMbuId || ''}
                                            onChange={(e) => changeFragmentMbu(`local-${viewingFileIndex}`, frag.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <option value="">未指定 (本地上传)</option>
                                            {Array.from(systemMbuIds).map(id => {
                                                const mbu = mbuList.find(m => m.uniqueId === id);
                                                return <option key={id} value={id}>{mbu?.name}</option>;
                                            })}
                                        </select>
                                    </div>
                                </div>
                                <p 
                                    className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-mono cursor-pointer"
                                    onClick={() => toggleFragmentSelection(`local-${viewingFileIndex}`, frag.id)}
                                >
                                    {frag.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
