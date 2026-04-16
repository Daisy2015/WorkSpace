
import React, { useState, useEffect, useMemo } from 'react';
import { WorkspaceList } from './components/WorkspaceList';
import { FactsPanel } from './components/FactsPanel';
import { DirectoryTree } from './components/DirectoryTree';
import { ResourceTree } from './components/ResourceTree';
import { ChatPanel } from './components/ChatPanel';
import { TracePanel } from './components/TracePanel';
import { AddResourcePage } from './components/AddResourcePage';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { KnowledgeBase } from './components/KnowledgeBase';
import { DocumentEditor } from './components/DocumentEditor';
import { IntegratedSearchPanel } from './components/IntegratedSearchPanel';
import { WorkspaceTemplates } from './components/WorkspaceTemplates';
import { MultiAgentChatPanel } from './components/MultiAgentChatPanel';
import { AgentsPanel } from './components/AgentsPanel';
import { IntelligentConstruction } from './components/IntelligentConstruction';
import { MbuExplorer } from './components/MbuExplorer';
import { VersionComparisonModal } from './components/VersionComparisonModal';
import { ReportTemplateModal } from './components/ReportTemplateModal';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { MOCK_RESOURCE_TREE, MOCK_WORKSPACES, EMPTY_RESOURCE_TREE, DRILLING_RESOURCE_TREE, MOCK_TEMPLATES } from './constants';
import { Message, ResourceNode, Language, Workspace, KnowledgeItem, WorkspaceStatus, WorkspaceTemplate, Agent } from './types';
import { translations } from './i18n';

type MainTab = 'dashboard' | 'workspaces' | 'admin' | 'knowledge' | 'integration' | 'templates' | 'construction' | 'construction-completion';

const App: React.FC = () => {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<MainTab>('dashboard');
  
  // Workspace Detail State (if ID exists, we are in detail view)
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  
  const [lang, setLang] = useState<Language>('zh');
  
  // Shared Workspace State
  const [workspaces, setWorkspaces] = useState<Workspace[]>(MOCK_WORKSPACES);
  const [templates, setTemplates] = useState<WorkspaceTemplate[]>(MOCK_TEMPLATES);
  
  // Detail View Specific State
  const [resourceTree, setResourceTree] = useState<ResourceNode[]>(DRILLING_RESOURCE_TREE);
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Message[]>([]);
  const [multiAgentMessages, setMultiAgentMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isAddResourcePageOpen, setIsAddResourcePageOpen] = useState(false);
  const [isTracePanelOpen, setIsTracePanelOpen] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // MBU Explorer State (for construction completion)
  const [constructionTreeNode, setConstructionTreeNode] = useState<ResourceNode | null>(null);
  const [constructionMbuIds, setConstructionMbuIds] = useState<Set<string>>(new Set());
  const [constructionWorkspaceName, setConstructionWorkspaceName] = useState<string>('');
  const [isObjectScopeExpanded, setIsObjectScopeExpanded] = useState(false);
  const [constructionObjectScope, setConstructionObjectScope] = useState([
    { id: 'filled', label: lang === 'zh' ? '填写的对象' : 'Filled Objects', items: ['A1井', 'B2井'], color: 'blue', deletable: false },
    { id: 'neighbors', label: lang === 'zh' ? '推荐邻近对象' : 'Recommended Neighbors', items: ['A2', 'A3', 'B1'], color: 'emerald', deletable: true },
    { id: 'similar', label: lang === 'zh' ? '相似对象' : 'Similar Objects', items: ['C1', 'D4'], color: 'purple', deletable: true },
    { id: 'associated', label: lang === 'zh' ? '关联对象' : 'Associated Objects', items: ['区块-X', '断层-F1'], color: 'amber', deletable: true },
  ]);

  // Document Editor State
  const [editingDoc, setEditingDoc] = useState<{ content: string, msgId: string } | null>(null);
  
  const [workspaceVersion, setWorkspaceVersion] = useState<'foundation' | 'professional' | 'enterprise' | 'flagship'>('foundation');
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const versions = useMemo(() => [
    { id: 'foundation', name: '基础版', enName: 'Foundation', desc: '通用智能助手', icon: 'fa-bolt', tagClass: 'bg-slate-100 text-slate-700' },
    { id: 'professional', name: '专业版', enName: 'Professional', desc: '场景闭环 Agent', icon: 'fa-cube', tagClass: 'bg-blue-100 text-blue-700' },
    { id: 'enterprise', name: '企业版', enName: 'Enterprise', desc: '岗位数字员工', icon: 'fa-users', tagClass: 'bg-purple-100 text-purple-700' },
    { id: 'flagship', name: '旗舰版', enName: 'Flagship', desc: 'Agent 生态系统', icon: 'fa-gem', tagClass: 'bg-violet-600 text-white' },
  ], []);

  const currentVersionData = versions.find(v => v.id === workspaceVersion) || versions[0];

  const [agents, setAgents] = useState<Agent[]>([
    { id: 'agent-1', name: 'Leader', role: '需求理解与任务调度', avatar: '👑', description: '负责理解用户意图，拆解任务并分发给对应的数字专家，最后汇总答案。', isLeader: true },
    { id: 'agent-2', name: '数据分析专家', role: '数据查询与统计', avatar: '📊', description: '精通SQL和数据分析，能够快速从海量数据中提取关键指标。' },
    { id: 'agent-3', name: '文档检索专家', role: '知识库问答', avatar: '📚', description: '熟悉各类技术文档和规范，能够准确回答专业问题。' },
    { id: 'agent-4', name: '报告生成专家', role: '内容总结与排版', avatar: '📝', description: '擅长将零散的信息整理成结构清晰、格式规范的报告。' },
    { id: 'agent-5', name: '圈闭有效性评价专家', role: '圈闭有效性评价', avatar: '🎯', description: '负责对圈闭的构造、储层、盖层及保存条件进行综合评价，确定圈闭的有效性。' },
    { id: 'agent-6', name: '主控风险识别专家', role: '主控风险识别', avatar: '🔍', description: '识别影响勘探成功率的关键风险因素，分析风险来源及影响程度。' },
    { id: 'agent-7', name: '风险消减方案专家', role: '风险消减方案', avatar: '🛡️', description: '针对识别出的主控风险，制定科学合理的风险消减措施与应对预案。' },
    { id: 'agent-8', name: '井位优选专家', role: '井位优选', avatar: '📍', description: '综合地质、工程及经济因素，从多个候选井位中优选出最佳钻探位置。' },
    { id: 'agent-9', name: '钻后复盘专家', role: '钻后复盘', avatar: '🔄', description: '对已钻井的实钻资料进行系统梳理，对比设计与实钻差异，总结经验教训。' }
  ]);

  const displayAgents = useMemo(() => {
    if (workspaceVersion === 'foundation') {
      return [
        { id: 'agent-1', name: 'Leader', role: '需求理解与任务调度', avatar: '👑', description: '负责理解用户意图，拆解任务并分发给对应的数字专家，最后汇总答案。', isLeader: true },
        { id: 'agent-2', name: '智能问数', role: '数据查询与统计', avatar: <i className="fas fa-robot"></i>, description: '精通SQL和数据分析，能够快速从海量数据中提取关键指标。' },
        { id: 'agent-chart', name: '数据成图', role: '可视化成图', avatar: <i className="fas fa-robot"></i>, description: '擅长将数据转化为直观的图表和可视化看板。' },
        { id: 'agent-3', name: '文档检索专家', role: '知识库问答', avatar: '📚', description: '熟悉各类技术文档和规范，能够准确回答专业问题。' },
        { id: 'agent-4', name: '报告生成专家', role: '内容总结与排版', avatar: '📝', description: '擅长将零散的信息整理成结构清晰、格式规范的报告。' },
      ];
    }
    if (workspaceVersion === 'professional') {
      return [
        { id: 'agent-1', name: 'Leader', role: '需求理解与任务调度', avatar: '👑', description: '负责理解用户意图，拆解任务并分发给对应的数字专家，最后汇总答案。', isLeader: true },
        { id: 'agent-pro-1', name: '生产分析岗', role: '场景智能体', avatar: '🏭', description: '专注于生产动态分析、产量波动诊断及稳产方案建议。' },
        { id: 'agent-pro-2', name: '勘探评价岗', role: '场景智能体', avatar: '🔍', description: '负责圈闭评价、资源量估算及勘探风险识别。' },
        { id: 'agent-pro-3', name: '钻井工程岗', role: '场景智能体', avatar: '🏗️', description: '提供钻井设计优化、复杂情况预警及提速提效建议。' },
        { id: 'agent-pro-4', name: '邻井压裂参数优选', role: '场景智能体', avatar: '🧪', description: '针对新井自动筛选最优邻井，继承最佳历史分段压裂参数，输出推荐参数包。' },
      ];
    }
    if (workspaceVersion === 'enterprise' || workspaceVersion === 'flagship') {
      return [
        { id: 'agent-1', name: 'Leader', role: '需求理解与任务调度', avatar: '👑', description: '负责理解用户意图，拆解任务并分发给对应的数字专家，最后汇总答案。', isLeader: true },
        { id: 'agent-ent-1', name: '生产管理专家', role: '岗位数字员工', avatar: '👨‍💼', description: '全面负责生产管理业务，协同多个场景智能体完成复杂任务。' },
        { id: 'agent-ent-2', name: '勘探决策专家', role: '岗位数字员工', avatar: '🧠', description: '辅助勘探决策，集成地质、物探、钻井多学科分析能力。' },
        { id: 'agent-ent-3', name: '钻井指挥专家', role: '岗位数字员工', avatar: '📡', description: '实时指挥钻井作业，确保安全高效，实现岗位级业务闭环。' },
      ];
    }
    return agents;
  }, [workspaceVersion, agents]);

  const t = translations[lang];

  // Listen for bulk select events
  useEffect(() => {
    const handleBulkSelect = (e: any) => {
      const ids: string[] = e.detail;
      setSelectedResources(prev => {
        const next = new Set(prev);
        const allAreSelected = ids.every(id => next.has(id));
        if (allAreSelected) {
          ids.forEach(id => next.delete(id));
        } else {
          ids.forEach(id => next.add(id));
        }
        return next;
      });
    };
    window.addEventListener('bulk-select', handleBulkSelect);
    return () => window.removeEventListener('bulk-select', handleBulkSelect);
  }, []);

  // Navigation Handlers
  const handleTabChange = (tab: MainTab) => {
      setCurrentTab(tab);
      if (tab === 'dashboard' || tab === 'admin' || tab === 'knowledge' || tab === 'integration' || tab === 'construction') {
          setActiveWorkspaceId(null);
      }
  };

  const handleSelectWorkspace = (id: string, name?: string, description?: string, objects?: any[]) => {
    let finalId = id;
    
    if (id === 'new-demo') {
        const newId = `ws-${Date.now()}`;
        const newWorkspace: Workspace = {
            id: newId,
            name: name || (lang === 'zh' ? '新工作空间' : 'New Workspace'),
            description: description || '',
            objects: objects || [],
            mbuCount: 0,
            createdAt: new Date().toISOString().split('T')[0],
            status: WorkspaceStatus.DRAFT,
            owner: '当前用户',
        };
        setWorkspaces(prev => [newWorkspace, ...prev]);
        finalId = newId;
    } else if (name && description) {
        // Update the workspace with name, description, objects if provided
        setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, name, description, objects: objects || [] } : w));
    }

    setActiveWorkspaceId(finalId);
    setCurrentTab('workspaces'); 
    setWorkspaceVersion('foundation'); // Default to Basic Edition
    
    // Reset state for new workspace
    if (id === 'new-demo') {
        setResourceTree(JSON.parse(JSON.stringify(EMPTY_RESOURCE_TREE)));
        setMessages([]); // Empty messages to show summary/recommendations
        setIsAddResourcePageOpen(false);
    } else {
        setResourceTree(JSON.parse(JSON.stringify(DRILLING_RESOURCE_TREE)));
        setMessages([]); // Empty messages to show summary/recommendations
        setIsAddResourcePageOpen(false);
    }
    setSelectedMessage(null);
    setIsTracePanelOpen(true);
    setEditingDoc(null);
  };

  const handleBackToList = () => {
    setActiveWorkspaceId(null);
    setIsAddResourcePageOpen(false);
    setEditingDoc(null);
  };

  useEffect(() => {
    setMultiAgentMessages([]);
    setMessages([]);
  }, [workspaceVersion]);

  // Global Workspace Handlers
  const handleUpdateWorkspace = (id: string, data: Partial<Workspace>) => {
    setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
  };

  const handleDeleteWorkspace = (id: string) => {
    setWorkspaces(prev => prev.filter(w => w.id !== id));
  };

  const handleToggleResource = (id: string, node: ResourceNode) => {
    const newSelected = new Set(selectedResources);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedResources(newSelected);
  };

  const handleTogglePublic = (id: string, node: ResourceNode) => {
      const updateNode = (nodes: ResourceNode[]): ResourceNode[] => {
          return nodes.map(n => {
              if (n.id === id) {
                  return {
                      ...n,
                      meta: { ...n.meta, isPublic: !n.meta?.isPublic }
                  };
              }
              if (n.children) {
                  return { ...n, children: updateNode(n.children) };
              }
              return n;
          });
      };
      setResourceTree(prev => updateNode(prev));
  };

  const handleAddResource = (parentId: string, newResource: ResourceNode) => {
    const addNode = (nodes: ResourceNode[]): ResourceNode[] => {
      return nodes.map(node => {
        if (node.id === parentId) return { ...node, children: [...(node.children || []), newResource] };
        if (node.children) return { ...node, children: addNode(node.children) };
        return node;
      });
    };
    setResourceTree(prev => addNode(prev));
  };

  const detectFileType = (name: string): string => {
      const lowerName = name.toLowerCase();
      if (lowerName.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/)) return 'Image';
      if (lowerName.match(/\.(xlsx|xls|csv|numbers)$/)) return 'Table';
      if (lowerName.match(/\.(pdf|doc|docx|ppt|pptx|txt|md)$/)) return 'Document';
      if (lowerName.match(/\.(segy|las|dlis)$/)) return 'Data';
      return 'File';
  };

  const [saveTemplateId, setSaveTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleSaveAsTemplate = (workspaceId: string) => {
    const ws = workspaces.find(w => w.id === workspaceId);
    if (!ws) return;
    setSaveTemplateId(workspaceId);
    setTemplateName(ws.name + ' Template');
    setTemplateDesc(ws.description || '');
  };

  const confirmSaveTemplate = () => {
    if (saveTemplateId) {
      const ws = workspaces.find(w => w.id === saveTemplateId);
      if (!ws) return;
      
      const newTemplate: WorkspaceTemplate = {
        id: `tpl-${Date.now()}`,
        name: templateName,
        description: templateDesc || '',
        mbuCount: ws.mbuCount,
        usageCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        owner: ws.owner,
        category: '全部类型', // Default category
        tags: ['User Generated']
      };
      setTemplates(prev => [newTemplate, ...prev]);
      setSaveTemplateId(null);
      setAlertMessage('Template saved successfully!');
    }
  };

  const handleCreateFromTemplate = (template: WorkspaceTemplate, name?: string, description?: string, objects?: any[]) => {
    const newWorkspace: Workspace = {
      id: `ws-${Date.now()}`,
      name: name || `${template.name} (Copy)`,
      mbuCount: template.mbuCount,
      createdAt: new Date().toISOString().split('T')[0],
      status: WorkspaceStatus.DRAFT,
      owner: '当前用户',
      description: description || template.description,
      objects: objects || []
    };

    setWorkspaces(prev => [newWorkspace, ...prev]);
    
    // Increment usage count
    setTemplates(prev => prev.map(t => 
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
    ));

    handleSelectWorkspace(newWorkspace.id, name, description, objects);
  };

  // Knowledge Base Integration Handler
  const handleAddToWorkspaceFromKB = (workspaceId: string, items: KnowledgeItem[]) => {
      // In a real app, we would update the backend.
      // Here, if the active workspace is the target, we update the live tree.
      
      if (activeWorkspaceId === workspaceId) {
          const newResources: ResourceNode[] = items.map(item => ({
              id: `kb-import-${Date.now()}-${item.id}`,
              name: item.title,
              type: 'artifact',
              meta: {
                  sourceType: 'local', // Treated as user upload/local for now
                  fileType: detectFileType(item.title),
                  date: new Date().toISOString()
              }
          }));

          setResourceTree(prev => {
              const newTree = JSON.parse(JSON.stringify(prev));
              // Find or create a "Local Resources" domain for KB imports
              let localDomain = newTree.find((n: ResourceNode) => n.name === '本地资源' && n.type === 'domain');
              if (!localDomain) {
                  localDomain = { id: 'dom-local-auto', name: '本地资源', type: 'domain', children: [] };
                  newTree.push(localDomain);
              }
              localDomain.children = [...(localDomain.children || []), ...newResources];
              return newTree;
          });
      }
      
      // Update mbuCount mock
      handleUpdateWorkspace(workspaceId, { 
          mbuCount: (workspaces.find(w => w.id === workspaceId)?.mbuCount || 0) + items.length 
      });
  };

  const handleConfirmAddResource = (data: { mbus: any[], resources: any[], sourceType: string, selectedObjects?: any[] }) => {
     const newSystemMbusCount = data.mbus.filter(m => m.id !== 'local-mbu').length;
     if (activeWorkspaceId) {
        setWorkspaces(prev => prev.map(w => {
            if (w.id === activeWorkspaceId) {
                const updatedObjects = data.selectedObjects && data.selectedObjects.length > 0 
                    ? [...(w.objects || []), ...data.selectedObjects.filter(newObj => !(w.objects || []).some((oldObj: any) => oldObj.id === newObj.id))]
                    : w.objects;
                return { ...w, mbuCount: w.mbuCount + newSystemMbusCount, objects: updatedObjects };
            }
            return w;
        }));
     }
     setResourceTree(prevTree => {
         const newTree = JSON.parse(JSON.stringify(prevTree)) as ResourceNode[];

         data.mbus.forEach((mbu: any) => {
             if (mbu.id === 'local-mbu') {
                 const localResources = data.resources.filter((r: any) => r.parentMbuId === mbu.id);
                 if (localResources.length > 0) {
                     // Find or create a "Local Uploads" domain
                     let localDomain = newTree.find(n => n.name === '本地资源' && n.type === 'domain');
                     if (!localDomain) {
                         localDomain = { id: 'dom-local-uploads', name: '本地资源', type: 'domain', children: [] };
                         newTree.push(localDomain);
                     }
                     
                     localResources.forEach((res: any, idx: number) => {
                         const newResource: ResourceNode = {
                             id: `res-local-${Date.now()}-${idx}`,
                             name: res.name,
                             type: 'artifact',
                             meta: { sourceType: 'local', fileType: detectFileType(res.name) },
                             children: []
                         };

                         if (res.fragments && res.fragments.length > 0) {
                             newResource.children = res.fragments.map((frag: any, fIdx: number) => ({
                                 id: `frag-${Date.now()}-${idx}-${fIdx}`,
                                 name: frag.name,
                                 type: 'artifact',
                                 meta: { 
                                     sourceType: 'local', 
                                     fileType: 'Fragment',
                                     content: frag.content,
                                     page: frag.page
                                 }
                             }));
                         }

                         localDomain!.children?.push(newResource);
                     });
                 }
             } else {
                 const workDomainName = mbu.workDomain || '未分类域';
                 let domainNode = newTree.find(c => c.name === workDomainName && c.type === 'domain');
                 if (!domainNode) {
                     domainNode = { id: `dom-${workDomainName}-${Date.now()}`, name: workDomainName, type: 'domain', children: [] };
                     newTree.push(domainNode);
                 }
                 let targetMbuNode = domainNode.children?.find(c => c.id === mbu.id);
                 if (!targetMbuNode) {
                     targetMbuNode = { id: mbu.id, name: mbu.name, type: 'mbu', children: [] };
                     if (!domainNode.children) domainNode.children = [];
                     domainNode.children.push(targetMbuNode);
                 }
                 const mbuResources = data.resources.filter((r: any) => r.parentMbuId === mbu.id);
                 mbuResources.forEach((res: any, idx: number) => {
                     if (!targetMbuNode!.children?.some(c => c.name === res.name)) {
                         const meta: any = { 
                             sourceType: res.sourceType || 'system', 
                             fileType: res.fileType || detectFileType(res.name) 
                         };
                         if (res.content) meta.content = res.content;
                         if (res.page) meta.page = res.page;

                         targetMbuNode!.children?.push({
                             id: `res-sys-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
                             name: res.name,
                             type: 'artifact',
                             meta: meta
                         });
                     }
                 });
             }
         });
         return newTree;
     });
     setIsAddResourcePageOpen(false);
  };

  const handleDeleteResources = (idsToDelete: string[]) => {
    const idsSet = new Set(idsToDelete);
    // No protected IDs anymore as we removed the root wrappers
    const deleteNodes = (nodes: ResourceNode[]): ResourceNode[] => {
      return nodes.filter(node => !idsSet.has(node.id)).map(node => ({
        ...node,
        children: node.children ? deleteNodes(node.children) : undefined
      }));
    };
    setResourceTree(prev => deleteNodes(prev));
    setSelectedResources(prev => {
        const next = new Set(prev);
        idsToDelete.forEach(id => next.delete(id));
        return next;
    });
  };

  const handleAddIntegratedResource = (newResource: ResourceNode) => {
      setResourceTree(prev => {
          const newTree = JSON.parse(JSON.stringify(prev));
          // Find or create "Web Resources" domain if needed, or just add to a general one
          // Since user asked to remove Web Resources, we might just skip or add to a "External" domain
          let webDomain = newTree.find((n: ResourceNode) => n.name === '网络资源' && n.type === 'domain');
          if (!webDomain) {
              webDomain = { id: 'dom-web-auto', name: '网络资源', type: 'domain', children: [] };
              newTree.push(webDomain);
          }
          webDomain.children = [...(webDomain.children || []), newResource];
          return newTree;
      });
  };

  const handleEditReport = (content: string, msgId: string) => {
      setEditingDoc({ content, msgId });
  };

  const handleSaveDoc = (newContent: string) => {
      if (editingDoc) {
          setMessages(prev => prev.map(m => m.id === editingDoc.msgId ? { ...m, content: newContent } : m));
          setEditingDoc(null);
      }
  };

  const currentWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  // Fallback for new-demo workspace if not found in mock list
  const activeWorkspaceData = currentWorkspace || (activeWorkspaceId === 'new-demo' ? {
      id: 'new-demo',
      name: 'New Workspace',
      mbuCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'DRAFT',
      owner: '当前用户',
      description: ''
  } as Workspace : undefined);

  return (
    <div className="h-screen w-screen bg-slate-50 flex overflow-hidden text-slate-900 font-sans">
      
      {/* LEFT SIDEBAR - Global Navigation */}
      <div className={`${isSidebarExpanded ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 z-50 shadow-sm`}>
          
          {/* Logo & Toggle */}
          <div className="h-16 flex items-center justify-between px-3 mb-6 mt-2">
              <div className="flex items-center gap-3 cursor-pointer overflow-hidden" onClick={() => handleTabChange('dashboard')}>
                  <div className="w-10 h-10 min-w-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="font-bold text-white text-lg">J</span>
                  </div>
                  {isSidebarExpanded && (
                      <span className="font-bold text-gray-800 text-xl tracking-tight whitespace-nowrap opacity-100 transition-opacity duration-300">
                          JuraWorkSpace
                      </span>
                  )}
              </div>
          </div>

          {/* Nav Items */}
          <div className="flex flex-col gap-2 w-full px-2 flex-1">
              <button 
                onClick={() => handleTabChange('dashboard')}
                className={`w-full h-10 rounded-lg flex items-center transition-all ${currentTab === 'dashboard' ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'} ${isSidebarExpanded ? 'px-3 justify-start' : 'justify-center'}`}
                title={isSidebarExpanded ? '' : t.dashboard}
              >
                  <i className="fas fa-chart-pie text-lg min-w-[1.25rem] text-center"></i>
                  {isSidebarExpanded && <span className="ml-3 text-sm font-medium truncate">{t.dashboard}</span>}
              </button>
              <button 
                onClick={() => handleTabChange('templates')}
                className={`w-full h-10 rounded-lg flex items-center transition-all ${currentTab === 'templates' ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'} ${isSidebarExpanded ? 'px-3 justify-start' : 'justify-center'}`}
                title={isSidebarExpanded ? '' : t.templates}
              >
                  <i className="fas fa-layer-group text-lg min-w-[1.25rem] text-center"></i>
                  {isSidebarExpanded && <span className="ml-3 text-sm font-medium truncate">{t.templates}</span>}
              </button>
              <button 
                onClick={() => handleTabChange('workspaces')}
                className={`w-full h-10 rounded-lg flex items-center transition-all ${currentTab === 'workspaces' ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'} ${isSidebarExpanded ? 'px-3 justify-start' : 'justify-center'}`}
                title={isSidebarExpanded ? '' : t.workspaceManagement}
              >
                  <i className="fas fa-project-diagram text-lg min-w-[1.25rem] text-center"></i>
                  {isSidebarExpanded && <span className="ml-3 text-sm font-medium truncate">{t.workspaceManagement}</span>}
              </button>
              <button 
                onClick={() => handleTabChange('knowledge')}
                className={`w-full h-10 rounded-lg flex items-center transition-all ${currentTab === 'knowledge' ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'} ${isSidebarExpanded ? 'px-3 justify-start' : 'justify-center'}`}
                title={isSidebarExpanded ? '' : t.kbTab}
              >
                  <i className="fas fa-book text-lg min-w-[1.25rem] text-center"></i>
                  {isSidebarExpanded && <span className="ml-3 text-sm font-medium truncate">{t.kbTab}</span>}
              </button>
              <button 
                onClick={() => handleTabChange('admin')}
                className={`w-full h-10 rounded-lg flex items-center transition-all ${currentTab === 'admin' ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'} ${isSidebarExpanded ? 'px-3 justify-start' : 'justify-center'}`}
                title={isSidebarExpanded ? '' : t.adminPanel}
              >
                  <i className="fas fa-shield-alt text-lg min-w-[1.25rem] text-center"></i>
                  {isSidebarExpanded && <span className="ml-3 text-sm font-medium truncate">{t.adminPanel}</span>}
              </button>
              <button 
                onClick={() => handleTabChange('integration')}
                className={`w-full h-10 rounded-lg flex items-center transition-all ${currentTab === 'integration' ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'} ${isSidebarExpanded ? 'px-3 justify-start' : 'justify-center'}`}
                title={isSidebarExpanded ? '' : t.integrationDemo}
              >
                  <i className="fas fa-puzzle-piece text-lg min-w-[1.25rem] text-center"></i>
                  {isSidebarExpanded && <span className="ml-3 text-sm font-medium truncate">{t.integrationDemo}</span>}
              </button>
              <button 
                onClick={() => handleTabChange('construction')}
                className={`w-full h-10 rounded-lg flex items-center transition-all ${currentTab === 'construction' ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'} ${isSidebarExpanded ? 'px-3 justify-start' : 'justify-center'}`}
                title={isSidebarExpanded ? '' : t.intelligentConstruction}
              >
                  <i className="fas fa-magic text-lg min-w-[1.25rem] text-center"></i>
                  {isSidebarExpanded && <span className="ml-3 text-sm font-medium truncate">{t.intelligentConstruction}</span>}
              </button>
          </div>

          {/* Bottom Actions */}
          <div className="mt-auto flex flex-col gap-3 w-full px-2 mb-4">
             {/* Toggle Button */}
             <button 
                 onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                 className="w-full h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
             >
                 <i className={`fas fa-chevron-${isSidebarExpanded ? 'left' : 'right'} text-sm`}></i>
             </button>

             <div className="h-px bg-gray-200 w-full my-1"></div>

             <button 
                 onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
                 className={`w-full h-10 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-gray-200 ${isSidebarExpanded ? 'px-3 justify-between' : ''}`}
             >
                 {isSidebarExpanded ? (
                     <>
                        <span>{lang === 'zh' ? 'Language' : '语言'}</span>
                        <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-[10px] text-gray-600">{lang === 'zh' ? 'EN' : '中'}</span>
                     </>
                 ) : (
                     lang === 'zh' ? 'EN' : '中'
                 )}
             </button>

             <div className={`w-full rounded-xl bg-gray-50 border border-gray-200 flex items-center cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden ${isSidebarExpanded ? 'p-2 gap-3' : 'aspect-square justify-center p-0'}`} title="当前用户: 李明">
                 <div className="w-8 h-8 min-w-[2rem] rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    李
                 </div>
                 {isSidebarExpanded && (
                     <div className="flex flex-col overflow-hidden">
                         <span className="text-sm font-bold text-gray-800 truncate">李明</span>
                         <span className="text-[10px] text-gray-500 truncate">Drilling Engineer</span>
                     </div>
                 )}
             </div>
          </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 relative">
        
        {/* Scenario 1: Dashboard View */}
        {currentTab === 'dashboard' && (
            <Dashboard 
                workspaces={workspaces} 
                onNavigateToWorkspace={() => handleTabChange('workspaces')} 
                lang={lang} 
            />
        )}

        {/* Scenario 2: Admin View */}
        {currentTab === 'admin' && (
            <AdminPanel lang={lang} />
        )}

        {/* Scenario 3: Knowledge Base View */}
        {currentTab === 'knowledge' && (
            <KnowledgeBase 
                lang={lang} 
                workspaces={workspaces}
                onAddToWorkspace={handleAddToWorkspaceFromKB}
            />
        )}

        {/* Scenario 6: Templates View */}
        {currentTab === 'templates' && (
            <WorkspaceTemplates 
                templates={templates}
                onCreateFromTemplate={handleCreateFromTemplate}
                lang={lang}
            />
        )}

        {/* Scenario 7: Intelligent Construction View */}
        {currentTab === 'construction' && (
            <IntelligentConstruction 
                lang={lang}
                workspaceName={constructionWorkspaceName}
                onComplete={() => handleTabChange('construction-completion')}
            />
        )}

        {/* Scenario 8: Construction Completion / Confirmation View */}
        {currentTab === 'construction-completion' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
                {/* Header for Construction Result */}
                <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {lang === 'zh' ? '空间资源构建完成' : 'Space Resources Constructed'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {lang === 'zh' ? '请预览并确认生成的业务节点与资源结构' : 'Please preview and confirm the generated business nodes and resource structure'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => handleTabChange('workspaces')}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {lang === 'zh' ? '取消' : 'Cancel'}
                        </button>
                        <button 
                            onClick={() => {
                                // Flatten the object scope into the format expected by Workspace
                                const flattenedObjects = constructionObjectScope.flatMap(group => 
                                    group.items.map((item: string, idx: number) => ({
                                        id: `${group.id}-${idx}`,
                                        label: item,
                                        type: 'Object',
                                        category: group.label
                                    }))
                                );

                                // Mock creating a new workspace from the result
                                const newWsId = `ws-${Date.now()}`;
                                const newWs: Workspace = {
                                    id: newWsId,
                                    name: constructionWorkspaceName || (lang === 'zh' ? '新构建的钻井空间' : 'New Drilling Workspace'),
                                    description: lang === 'zh' ? '由智能构建生成的空间' : 'Workspace generated by intelligent construction',
                                    status: WorkspaceStatus.DRAFT,
                                    owner: '李明',
                                    createdAt: new Date().toLocaleDateString(),
                                    lastModified: new Date().toISOString(),
                                    resourceCount: 42,
                                    mbuCount: 156,
                                    objects: flattenedObjects
                                };
                                
                                setWorkspaces(prev => [newWs, ...prev]);
                                handleSelectWorkspace(newWsId, newWs.name, newWs.description, flattenedObjects);
                            }}
                            className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
                        >
                            {lang === 'zh' ? '确认并进入空间' : 'Confirm & Enter Workspace'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Generated Tree */}
                    <div className="w-80 h-full border-r border-gray-200 overflow-y-auto">
                        <DirectoryTree 
                            treeData={DRILLING_RESOURCE_TREE}
                            selectedResources={new Set()} 
                            onToggleResource={() => {}} 
                            onSelectNode={setConstructionTreeNode}
                            selectedNodeId={constructionTreeNode?.id}
                            lang={lang}
                            maxLevel={4}
                        />
                    </div>

                    {/* Right: MBU Explorer */}
                    <div className="flex-1 h-full bg-gray-50 overflow-hidden">
                        <MbuExplorer 
                            lang={lang}
                            selectedNode={constructionTreeNode}
                            onSelectMbus={(ids) => setConstructionMbuIds(new Set(ids))}
                            selectedMbuIds={constructionMbuIds}
                            objectScope={constructionObjectScope}
                            setObjectScope={setConstructionObjectScope}
                        />
                    </div>
                </div>
            </div>
        )}

        {/* Scenario 5: Integration Demo View */}
        {currentTab === 'integration' && (
            <div className="h-full relative flex flex-col">
                {/* Top Bar for Integration Demo */}
                <nav className="h-12 bg-white border-b border-gray-200 flex items-center px-4 justify-between flex-shrink-0 z-40">
                    <div className="flex items-center">
                        <span className="font-bold text-gray-700">{t.integrationDemo}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                        {t.appTitle} Integration
                    </div>
                </nav>
                
                {/* CONTENT CONTAINER */}
                <div className="flex-1 flex flex-row overflow-hidden relative">
                    {/* Left Panel: Integrated Search */}
                    <div className="w-96 h-full flex-shrink-0 z-20 shadow-lg bg-white border-r border-gray-200 flex flex-col">
                        <IntegratedSearchPanel 
                            lang={lang} 
                            onAddResource={handleAddIntegratedResource}
                        />
                    </div>

                    {/* Center Panel: Chat */}
                    <div className="flex-1 h-full min-w-0 z-0 bg-gray-50">
                        <ChatPanel 
                            messages={messages}
                            setMessages={setMessages}
                            selectedResources={selectedResources}
                            allResources={resourceTree}
                            onSelectMessage={setSelectedMessage}
                            onChatStart={() => setIsTracePanelOpen(true)}
                            onAddResource={handleAddResource}
                            currentWorkspace={activeWorkspaceData || {
                                id: 'demo-integration',
                                name: 'Integration Demo Workspace',
                                mbuCount: 0,
                                createdAt: new Date().toISOString(),
                                status: WorkspaceStatus.DRAFT,
                                owner: 'Demo User',
                                description: 'Temporary workspace for integration demo'
                            }}
                            onUpdateWorkspaceName={() => {}}
                            lang={lang}
                            onEditReport={handleEditReport}
                        />
                    </div>

                    {/* Right Panel: Trace & Audit */}
                    <div className={`${isTracePanelOpen ? 'w-80 border-l' : 'w-0 border-none'} h-full flex-shrink-0 border-gray-200 z-10 bg-white transition-all duration-300 ease-in-out overflow-hidden`}>
                        <div className="w-80 h-full">
                            <TracePanel 
                                selectedMessage={selectedMessage} 
                                resourceTree={resourceTree} 
                                lang={lang} 
                                onCreateReport={() => setIsReportModalOpen(true)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Scenario 4: Workspaces View */}
        {currentTab === 'workspaces' && (
            <>
                {activeWorkspaceId ? (
                    // Workspace Detail View (Editor Mode)
                    <div className="h-full relative flex flex-col">
                        {/* Top Bar for Workspace Detail */}
                        <nav className="h-14 bg-white border-b border-slate-200 flex items-center px-6 justify-between flex-shrink-0 z-40 shadow-sm">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={handleBackToList} 
                                    className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                                >
                                    <i className="fas fa-arrow-left text-sm"></i>
                                </button>
                                <div className="h-6 w-px bg-slate-200"></div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900 tracking-tight">{activeWorkspaceData?.name}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-600 uppercase tracking-wider border border-blue-100">
                                            {activeWorkspaceData?.status || 'DRAFT'}
                                        </span>
                                    </div>
                                    {activeWorkspaceData?.description && (
                                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[300px]">{activeWorkspaceData.description}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <button 
                                        onClick={() => setIsVersionDropdownOpen(!isVersionDropdownOpen)}
                                        className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors"
                                    >
                                        <div className="w-6 h-6 rounded flex items-center justify-center bg-white border border-slate-200 shadow-sm text-slate-600">
                                            <i className={`fas ${currentVersionData.icon} text-xs`}></i>
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs font-bold text-slate-800 leading-tight">{currentVersionData.name}</span>
                                            <span className="text-[10px] text-slate-500 leading-tight">{currentVersionData.desc}</span>
                                        </div>
                                        <i className={`fas fa-chevron-down text-[10px] text-slate-400 ml-2 transition-transform duration-200 ${isVersionDropdownOpen ? 'rotate-180' : ''}`}></i>
                                    </button>

                                    {isVersionDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsVersionDropdownOpen(false)}></div>
                                            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                                                    <h4 className="text-sm font-bold text-slate-800">切换版本</h4>
                                                    <p className="text-xs text-slate-500 mt-0.5">体验不同版本的能力差异</p>
                                                </div>
                                                <div className="p-2 flex flex-col gap-1">
                                                    {versions.map(v => (
                                                        <button
                                                            key={v.id}
                                                            onClick={() => {
                                                                setWorkspaceVersion(v.id as any);
                                                                setIsVersionDropdownOpen(false);
                                                            }}
                                                            className={`flex items-center gap-3 p-2 rounded-lg transition-all text-left ${workspaceVersion === v.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50 border border-transparent'}`}
                                                        >
                                                            <div className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap ${v.tagClass}`}>
                                                                {v.name}
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className={`text-sm font-bold truncate ${workspaceVersion === v.id ? 'text-blue-700' : 'text-slate-700'}`}>{v.enName}</span>
                                                                <span className="text-[10px] text-slate-500 truncate">{v.desc}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                                <div 
                                                    onClick={() => {
                                                        setIsVersionModalOpen(true);
                                                        setIsVersionDropdownOpen(false);
                                                    }}
                                                    className="p-3 border-t border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-2"
                                                >
                                                    <span className="text-xs font-medium text-blue-600">查看版本对比详情</span>
                                                    <i className="fas fa-arrow-right text-[10px] text-blue-600"></i>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-slate-400">
                                    <button className="hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors" title="分享">
                                        <i className="fas fa-share-alt"></i>
                                    </button>
                                    <button className="hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors" title="设置">
                                        <i className="fas fa-cog"></i>
                                    </button>
                                    <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                    <button 
                                        onClick={() => setIsTracePanelOpen(!isTracePanelOpen)}
                                        className={`p-2 rounded-lg transition-colors ${isTracePanelOpen ? 'text-indigo-600 bg-indigo-50' : 'hover:text-slate-600 hover:bg-slate-100'}`}
                                        title={isTracePanelOpen ? "收起侧边栏" : "展开侧边栏"}
                                    >
                                        <i className="fas fa-columns"></i>
                                    </button>
                                </div>
                            </div>
                        </nav>
                        
                        {/* CONTENT CONTAINER */}
                        <div className="flex-1 flex flex-row overflow-hidden relative">
                            {/* Left Panel: Facts & Resources */}
                            <div className="w-96 h-full flex-shrink-0 z-20 shadow-lg bg-white border-r border-gray-200 flex flex-col">
                                <div className="flex-1 overflow-hidden">
                                    <ResourceTree 
                                        treeData={resourceTree}
                                        selectedResources={selectedResources} 
                                        onToggleResource={handleToggleResource} 
                                        onSelectNode={() => {}}
                                        onAddResource={handleAddResource}
                                        onDeleteResources={handleDeleteResources}
                                        onTogglePublic={handleTogglePublic}
                                        onOpenAddResourcePage={() => setIsAddResourcePageOpen(true)}
                                        lang={lang}
                                    />
                                </div>
                                
                                {/* Selected Object Scope Section */}
                                <div className={`border-t border-slate-200 flex flex-col bg-white overflow-hidden transition-all duration-300 ${isObjectScopeExpanded ? 'h-1/3' : 'h-10'}`}>
                                    <div 
                                        className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                                        onClick={() => setIsObjectScopeExpanded(!isObjectScopeExpanded)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] font-mono">
                                                {lang === 'zh' ? '已选对象范围' : 'Selected Objects'}
                                            </h3>
                                            <span className="ml-1 text-[10px] font-mono text-slate-400">
                                                [{activeWorkspaceData?.objects?.length || 0}]
                                            </span>
                                        </div>
                                        <i className={`fas fa-chevron-down text-[10px] text-slate-400 transition-transform duration-300 ${isObjectScopeExpanded ? 'rotate-180' : ''}`}></i>
                                    </div>
                                    
                                    {isObjectScopeExpanded && (
                                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            {activeWorkspaceData?.objects && activeWorkspaceData.objects.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-2">
                                                    {activeWorkspaceData.objects.map((obj: any) => (
                                                        <div 
                                                            key={obj.id}
                                                            className="group flex items-center justify-between p-2 rounded border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all duration-200"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="w-8 h-8 rounded bg-white border border-slate-100 flex items-center justify-center text-blue-500 group-hover:text-blue-600 transition-colors">
                                                                    <i className="fas fa-cube text-xs"></i>
                                                                </div>
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="text-xs font-medium text-slate-700 truncate">{obj.label}</span>
                                                                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tight">ID: {obj.id.split('-').pop()}</span>
                                                                </div>
                                                            </div>
                                                            <button className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all">
                                                                <i className="fas fa-times text-[10px]"></i>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-8">
                                                    <div className="w-12 h-12 rounded-full border border-dashed border-slate-200 flex items-center justify-center mb-2">
                                                        <i className="fas fa-layer-group text-lg opacity-40"></i>
                                                    </div>
                                                    <p className="text-[10px] font-medium uppercase tracking-wider">{lang === 'zh' ? '暂未选择对象' : 'No objects selected'}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Center Panel: Chat */}
                            <div className="flex-1 h-full min-w-0 z-0 bg-gray-50">
                                <MultiAgentChatPanel 
                                    messages={multiAgentMessages}
                                    setMessages={setMultiAgentMessages}
                                    selectedResources={selectedResources}
                                    allResources={resourceTree}
                                    onSelectMessage={setSelectedMessage}
                                    onChatStart={() => setIsTracePanelOpen(true)}
                                    onAddResource={handleAddResource}
                                    currentWorkspace={activeWorkspaceData}
                                    onUpdateWorkspaceName={(name) => activeWorkspaceId && handleUpdateWorkspace(activeWorkspaceId, { name })}
                                    lang={lang}
                                    onEditReport={handleEditReport}
                                    onToggleTracePanel={() => setIsTracePanelOpen(!isTracePanelOpen)}
                                    isTracePanelOpen={isTracePanelOpen}
                                    agents={displayAgents}
                                    workspaceVersion={workspaceVersion}
                                />
                            </div>

                            {/* Right Panel: Trace & Audit or Agents Panel */}
                            {workspaceVersion === 'foundation' || workspaceVersion === 'professional' || workspaceVersion === 'enterprise' || workspaceVersion === 'flagship' ? (
                                <div className={`${isTracePanelOpen ? 'w-96 border-l' : 'w-0 border-none'} h-full flex-shrink-0 border-gray-200 z-10 bg-white transition-all duration-300 ease-in-out overflow-hidden`}>
                                    <div className="w-96 h-full">
                                        <TracePanel 
                                            selectedMessage={selectedMessage} 
                                            resourceTree={resourceTree} 
                                            lang={lang} 
                                            onToggle={() => setIsTracePanelOpen(!isTracePanelOpen)}
                                            workspaceVersion={workspaceVersion}
                                            onCreateReport={() => setIsReportModalOpen(true)}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className={`${isTracePanelOpen ? 'w-96 border-l' : 'w-0 border-none'} h-full flex-shrink-0 border-gray-200 z-10 bg-white transition-all duration-300 ease-in-out overflow-hidden`}>
                                    <div className="w-96 h-full">
                                        <AgentsPanel 
                                            agents={displayAgents}
                                            onAddAgent={() => alert(lang === 'zh' ? '添加智能体功能开发中...' : 'Add agent feature in development...')}
                                            lang={lang}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Overlay for Add Resource */}
                        {isAddResourcePageOpen && (
                            <AddResourcePage 
                                onClose={() => setIsAddResourcePageOpen(false)} 
                                onConfirm={handleConfirmAddResource}
                                lang={lang}
                                initialTree={resourceTree}
                                workspaceId={activeWorkspaceId}
                            />
                        )}

                        {/* Full Screen Document Editor */}
                        {editingDoc && (
                            <DocumentEditor
                                initialContent={editingDoc.content}
                                onSave={handleSaveDoc}
                                onCancel={() => setEditingDoc(null)}
                                lang={lang}
                            />
                        )}
                    </div>
                ) : (
                    // Workspace List View
                    <div className="h-full overflow-y-auto bg-gray-50">
                        <WorkspaceList 
                            workspaces={workspaces}
                            templates={templates}
                            onSelectWorkspace={handleSelectWorkspace} 
                            onUpdateWorkspace={handleUpdateWorkspace}
                            onDeleteWorkspace={handleDeleteWorkspace}
                            onSaveAsTemplate={handleSaveAsTemplate}
                            onCreateFromTemplate={handleCreateFromTemplate}
            onStartIntelligentConstruction={(name) => {
                setConstructionWorkspaceName(name);
                handleTabChange('construction');
            }}
                            lang={lang} 
                        />
                    </div>
                )}
            </>
        )}
        <AnimatePresence>
          {saveTemplateId && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSaveTemplateId(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">{t.saveAsTemplate}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t.templateNamePlaceholder}</label>
                    <input 
                      type="text" 
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t.templateDescPlaceholder}</label>
                    <textarea 
                      value={templateDesc}
                      onChange={(e) => setTemplateDesc(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => setSaveTemplateId(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-bold hover:bg-gray-50"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    onClick={confirmSaveTemplate}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-100"
                  >
                    {t.save}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
          {alertMessage && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAlertMessage(null)}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-xs w-full text-center"
              >
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl mx-auto mb-4">
                  <i className="fas fa-check"></i>
                </div>
                <p className="text-gray-800 font-medium mb-6">{alertMessage}</p>
                <button 
                  onClick={() => setAlertMessage(null)}
                  className="w-full py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors"
                >
                  {t.confirm}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Version Comparison Modal */}
        <VersionComparisonModal 
            isOpen={isVersionModalOpen}
            onClose={() => setIsVersionModalOpen(false)}
            currentVersion={workspaceVersion}
        />

        {/* Report Template Modal */}
        <ReportTemplateModal 
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            lang={lang}
        />
      </div>
    </div>
  );
};

export default App;
