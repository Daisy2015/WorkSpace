import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Select, { MultiValue } from 'react-select';
import { Workspace, WorkspaceStatus, Language, WorkspaceTemplate } from '../types';
import { translations } from '../i18n';
import { WorkspaceBuilder } from './WorkspaceBuilder';
import { WorkspaceConstructionLoading } from './WorkspaceConstructionLoading';

interface WorkspaceListProps {
  workspaces: Workspace[];
  templates: WorkspaceTemplate[];
  onSelectWorkspace: (id: string, name?: string, description?: string, objects?: any[]) => void;
  onUpdateWorkspace: (id: string, data: Partial<Workspace>) => void;
  onDeleteWorkspace: (id: string) => void;
  onSaveAsTemplate: (id: string) => void;
  onCreateFromTemplate: (template: WorkspaceTemplate, name?: string, description?: string, objects?: any[]) => void;
  onStartIntelligentConstruction?: (name: string, description: string, objects: any[]) => void;
  lang: Language;
}

// Mock Current User for Permission Demo
const CURRENT_USER = '李明';

export const WorkspaceList: React.FC<WorkspaceListProps> = ({ 
    workspaces, 
    templates,
    onSelectWorkspace, 
    onUpdateWorkspace,
    onDeleteWorkspace,
    onSaveAsTemplate,
    onCreateFromTemplate,
    onStartIntelligentConstruction,
    lang 
}) => {
  const t = translations[lang];
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWorkspaceBuilderOpen, setIsWorkspaceBuilderOpen] = useState(false);
  const [isConstructing, setIsConstructing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [object, setObject] = useState<MultiValue<{ value: string; label: string }>>([]);
  const [templateFilter, setTemplateFilter] = useState('');
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommended' | 'recent' | 'my' | 'all'>('all');
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'my' | 'shared' | 'all'>('all');

  const filteredTemplates = useMemo(() => {
    let result = [...templates];
    
    // Tab filtering
    if (activeTab === 'my') {
      result = result.filter(tpl => tpl.owner === '钻井专家组' || tpl.owner === '地质研究所');
    } else if (activeTab === 'recent') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeTab === 'recommended') {
      result = result.filter(tpl => tpl.usageCount > 100);
    }

    // Search Filter
    if (templateFilter) {
      const lowerFilter = templateFilter.toLowerCase();
      result = result.filter(tpl => 
        tpl.name.toLowerCase().includes(lowerFilter) || 
        tpl.description.toLowerCase().includes(lowerFilter)
      );
    }

    // Default Sort (if not recent)
    if (activeTab !== 'recent') {
      result.sort((a, b) => b.usageCount - a.usageCount);
    }

    return result;
  }, [templates, templateFilter, activeTab]);

  const displayedTemplates = showAllTemplates ? filteredTemplates : filteredTemplates.slice(0, 6);

  const filteredWorkspaces = workspaces.filter(ws => {
    const matchesName = ws.name.toLowerCase().includes(filter.toLowerCase()) || 
                        ws.owner.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ws.status === statusFilter;
    
    let matchesTab = true;
    if (activeWorkspaceTab === 'my') {
      matchesTab = ws.owner === CURRENT_USER;
    } else if (activeWorkspaceTab === 'shared') {
      matchesTab = ws.owner !== CURRENT_USER;
    }
    
    return matchesName && matchesStatus && matchesTab;
  });

  const getStatusColor = (status: WorkspaceStatus) => {
    switch (status) {
      case WorkspaceStatus.COMPLETED: return 'bg-green-100 text-green-700 border-green-200';
      case WorkspaceStatus.ARCHIVED: return 'bg-gray-100 text-gray-600 border-gray-200';
      case WorkspaceStatus.DRAFT: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100';
    }
  };

  const getStatusLabel = (status: WorkspaceStatus) => {
    switch (status) {
      case WorkspaceStatus.DRAFT: return t.statusDraft;
      case WorkspaceStatus.COMPLETED: return t.statusCompleted;
      case WorkspaceStatus.ARCHIVED: return t.statusArchived;
      default: return status;
    }
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Actions
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      onDeleteWorkspace(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const handleShare = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Mock share
    navigator.clipboard.writeText(`https://aunit.app/workspace/${id}`);
    setAlertMessage(t.shareSuccess);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>, id: string) => {
    e.stopPropagation();
    const newStatus = e.target.value as WorkspaceStatus;
    onUpdateWorkspace(id, { status: newStatus });
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking the select
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.workspaceManagement}</h1>
            <p className="text-gray-500 text-sm">{t.workspaceSubtitle}</p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-4">
             <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                />
             </div>
             
             <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <select 
                  className="bg-transparent text-xs font-medium text-gray-600 py-1.5 px-2 focus:outline-none cursor-pointer"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">{t.allStatuses}</option>
                  <option value={WorkspaceStatus.DRAFT}>{t.statusDraft}</option>
                  <option value={WorkspaceStatus.COMPLETED}>{t.statusCompleted}</option>
                  <option value={WorkspaceStatus.ARCHIVED}>{t.statusArchived}</option>
                </select>
             </div>

             <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm font-medium text-sm transition-all flex items-center"
             >
                <i className="fas fa-plus mr-2"></i> {t.newWorkspace}
             </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8">
          {[
            { id: 'my', name: t.myWorkspaces },
            { id: 'shared', name: t.sharedWithMe },
            { id: 'all', name: t.allWorkspaces },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveWorkspaceTab(tab.id as any)}
              className={`pb-3 text-sm font-bold transition-all relative ${activeWorkspaceTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {tab.name}
              {activeWorkspaceTab === tab.id && (
                <motion.div layoutId="activeWorkspaceTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWorkspaces.map(ws => {
            const isOwner = ws.owner === CURRENT_USER;
            
            return (
              <div 
                  key={ws.id}
                  onClick={() => onSelectWorkspace(ws.id)}
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group flex flex-col relative overflow-hidden"
              >
                  {/* Status Badge */}
                  <div className="absolute top-0 right-0 z-10" onClick={handleStatusClick}>
                      {isOwner ? (
                          <div className="relative inline-block">
                              <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-bl-xl flex items-center gap-1 cursor-pointer ${getStatusColor(ws.status)}`}>
                                  {getStatusLabel(ws.status)}
                                  <i className="fas fa-caret-down opacity-50 ml-1"></i>
                              </span>
                              <select 
                                  value={ws.status}
                                  onChange={(e) => handleStatusChange(e, ws.id)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  title={t.changeStatus}
                              >
                                  <option value={WorkspaceStatus.DRAFT}>{t.statusDraft}</option>
                                  <option value={WorkspaceStatus.COMPLETED}>{t.statusCompleted}</option>
                                  <option value={WorkspaceStatus.ARCHIVED}>{t.statusArchived}</option>
                              </select>
                          </div>
                      ) : (
                          <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-bl-xl ${getStatusColor(ws.status)}`}>
                              {getStatusLabel(ws.status)}
                          </span>
                      )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                      <div className="mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-3 text-blue-600">
                           <i className="fas fa-project-diagram text-lg"></i>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-700 transition-colors" title={ws.name}>{ws.name}</h3>
                      </div>
                      
                      <div className="mt-auto pt-2 text-xs text-gray-400 flex items-center gap-2">
                          <span>{ws.owner}</span>
                          <span>•</span>
                          <span>{ws.createdAt}</span>
                      </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                      <div className="text-xs text-gray-500 font-medium flex items-center" title="Linked MBUs">
                         <i className="fas fa-cubes text-indigo-400 mr-1.5"></i>
                         {ws.mbuCount} {t.mbuCount}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isOwner ? (
                              <>
                                  <button 
                                      onClick={(e) => handleShare(e, ws.id)}
                                      className="text-gray-400 hover:text-blue-600 transition-colors"
                                      title={t.share}
                                  >
                                      <i className="fas fa-share-alt text-xs"></i>
                                  </button>
                                  <button 
                                      onClick={(e) => { e.stopPropagation(); onSaveAsTemplate(ws.id); }}
                                      className="text-gray-400 hover:text-indigo-600 transition-colors"
                                      title={t.saveAsTemplate}
                                  >
                                      <i className="fas fa-save text-xs"></i>
                                  </button>
                                  <button 
                                      onClick={(e) => handleDelete(e, ws.id)}
                                      className="text-gray-400 hover:text-red-600 transition-colors"
                                      title={t.deleteWorkspace}
                                  >
                                      <i className="fas fa-trash-alt text-xs"></i>
                                  </button>
                              </>
                          ) : (
                               <div className="text-gray-300" title="Read Only">
                                  <i className="fas fa-eye"></i>
                               </div>
                          )}
                      </div>
                  </div>
              </div>
            );
          })}

          {filteredWorkspaces.length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-400 bg-white border border-dashed border-gray-300 rounded-xl">
               <p>{t.noWorkspaces}</p>
             </div>
          )}
        </div>
      </div>

      {/* Create Workspace Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{lang === 'zh' ? '新建工作空间' : 'Create New Workspace'}</h3>
                <p className="text-sm text-gray-500 mt-1">{lang === 'zh' ? '选择一个模版快速开始，或建立空白空间' : 'Choose a template to start quickly, or create a blank workspace'}</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 bg-gray-50/30">
              {/* Workspace Info Form */}
              <div className="mb-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {lang === 'zh' ? '工作空间名称' : 'Workspace Name'} <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder={lang === 'zh' ? '请输入名称' : 'Enter name'}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {lang === 'zh' ? '工作空间对象' : 'Workspace Object'}
                    </label>
                    <Select
                      isMulti
                      options={[
                        { label: lang === 'zh' ? '油气田' : 'Oil & Gas Field', options: [{ value: 'field1', label: 'Field 1' }, { value: 'field2', label: 'Field 2' }] },
                        { label: lang === 'zh' ? '区块' : 'Block', options: [{ value: 'block1', label: 'Block 1' }, { value: 'block2', label: 'Block 2' }] },
                        { label: lang === 'zh' ? '井' : 'Well', options: [{ value: 'well1', label: 'Well 1' }, { value: 'well2', label: 'Well 2' }] },
                      ]}
                      value={object}
                      onChange={setObject}
                      placeholder={lang === 'zh' ? '请选择对象' : 'Select object'}
                      className="w-full"
                      classNamePrefix="select"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === 'zh' ? '工作空间描述' : 'Workspace Description'}
                  </label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder={lang === 'zh' ? '请输入描述' : 'Enter description'}
                    rows={2}
                  />
                </div>
              </div>

              {/* Creation Options Grid */}
              <div className="mb-10">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                  <i className="fas fa-plus-circle mr-2"></i> {lang === 'zh' ? '新建工作空间' : 'Create New Workspace'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 1. Blank Workspace */}
                  <div 
                      onClick={() => {
                        if (!name.trim()) {
                          setAlertMessage(lang === 'zh' ? '请输入工作空间名称' : 'Please enter workspace name');
                          return;
                        }
                        onSelectWorkspace('new-demo', name, description, object as any[]);
                        setIsCreateModalOpen(false);
                      }}
                    className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer group flex items-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 mr-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-blue-100/50">
                      <i className="fas fa-plus text-2xl"></i>
                    </div>
                    <div>
                      <h5 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">{lang === 'zh' ? '建立空白工作空间' : 'Create Blank Workspace'}</h5>
                      <p className="text-xs text-gray-500">{lang === 'zh' ? '从零开始，自由配置' : 'Start from scratch, configure freely'}</p>
                    </div>
                  </div>

                  {/* 2. Smart Creation */}
                  <div 
                    onClick={() => {
                      if (!name.trim()) {
                        setAlertMessage(lang === 'zh' ? '请输入工作空间名称' : 'Please enter workspace name');
                        return;
                      }
                      if (onStartIntelligentConstruction) {
                        onStartIntelligentConstruction(name, description, object as any[]);
                      } else {
                        setIsConstructing(true);
                      }
                      setIsCreateModalOpen(false);
                    }}
                    className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer group flex items-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-600 mr-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-indigo-100/50">
                      <i className="fas fa-robot text-2xl"></i>
                    </div>
                    <div>
                      <h5 className="text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition-colors mb-1">{lang === 'zh' ? '智能创建工作空间' : 'Smart Workspace Creation'}</h5>
                      <p className="text-xs text-gray-500">{lang === 'zh' ? '基于描述，自动组装资源' : 'Assemble resources based on descriptions'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Templates Section */}
              <div>
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center">
                      <i className="fas fa-list mr-2"></i> {t.templates}
                    </h4>
                    <div className="relative">
                      <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      <input 
                        type="text"
                        placeholder={t.searchPlaceholder}
                        value={templateFilter}
                        onChange={e => setTemplateFilter(e.target.value)}
                        className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-6">
                      {[
                        { id: 'recommended', name: t.recommendedForYou },
                        { id: 'recent', name: t.recentlyUpdated },
                        { id: 'my', name: t.myTemplates },
                        { id: 'all', name: t.allTemplates },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`pb-2 text-xs font-bold transition-all relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          {tab.name}
                          {activeTab === tab.id && (
                            <motion.div layoutId="modalActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayedTemplates.map(tpl => (
                    <div 
                      key={tpl.id}
                      className="bg-white p-5 rounded-xl border border-gray-200 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer flex flex-col group relative h-full"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-indigo-100/50">
                          <i className={`fas ${tpl.icon || 'fa-file-alt'} text-xl`}></i>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h5 className="text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition-colors mb-2 line-clamp-1">{tpl.name}</h5>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                          <span>{tpl.owner}</span>
                          <span>•</span>
                          <span>{tpl.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <i className="fas fa-chart-line"></i>
                          <span>{tpl.usageCount}</span>
                        </div>
                      </div>

                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <button 
                          onClick={() => {
                            if (!name.trim()) {
                              setAlertMessage(lang === 'zh' ? '请输入工作空间名称' : 'Please enter workspace name');
                              return;
                            }
                            onCreateFromTemplate(tpl, name, description, object as any[]);
                            setIsCreateModalOpen(false);
                          }}
                          className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors flex items-center shadow-lg pointer-events-auto"
                        >
                          {lang === 'zh' ? '使用此模版' : 'Use Template'} <i className="fas fa-arrow-right ml-2"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                  {displayedTemplates.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                      <i className="fas fa-folder-open text-4xl mb-3 opacity-20"></i>
                      <p className="text-sm font-medium">{lang === 'zh' ? '暂无匹配模版' : 'No matching templates'}</p>
                    </div>
                  )}
                </div>
                {filteredTemplates.length > (showAllTemplates ? 0 : 6) && (
                  <div className="mt-6 text-center">
                    <button 
                      onClick={() => setShowAllTemplates(!showAllTemplates)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-bold flex items-center justify-center gap-2 mx-auto"
                    >
                      {showAllTemplates ? (
                        <>
                          {t.showLess} <i className="fas fa-chevron-up text-xs"></i>
                        </>
                      ) : (
                        <>
                          {t.showMore} <i className="fas fa-chevron-down text-xs"></i>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Custom Modals */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                <i className="fas fa-trash-alt"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.deleteWorkspaceConfirm}</h3>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-bold hover:bg-gray-50"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-100"
                >
                  {t.confirm}
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

      {/* Workspace Builder Modal */}
      {isWorkspaceBuilderOpen && (
        <WorkspaceBuilder 
          workspaceName={name}
          workspaceDescription={description}
          workspaceObjects={object.map(o => o.label)}
          onClose={() => setIsWorkspaceBuilderOpen(false)} 
          lang={lang}
        />
      )}

      {/* Smart Workspace Construction Loading View */}
      {isConstructing && (
        <WorkspaceConstructionLoading 
          workspaceName={name}
          lang={lang}
          onComplete={() => {
            setIsConstructing(false);
            setIsWorkspaceBuilderOpen(true);
          }}
        />
      )}
    </div>
  );
};
