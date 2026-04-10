

import React, { useState, useRef } from 'react';
import { translations } from '../i18n';
import { Language, KnowledgeItem, Workspace } from '../types';
import { MOCK_KNOWLEDGE_ITEMS } from '../constants';

interface KnowledgeBaseProps {
  lang: Language;
  workspaces: Workspace[];
  onAddToWorkspace: (workspaceId: string, items: KnowledgeItem[]) => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ lang, workspaces, onAddToWorkspace }) => {
  const t = translations[lang];
  
  // State
  const [items, setItems] = useState<KnowledgeItem[]>(MOCK_KNOWLEDGE_ITEMS);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [sourceFilter, setSourceFilter] = useState<'all' | 'workspace' | 'upload'>('all');
  
  // Selection & Modals
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null); // For detail drawer
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddToWsModalOpen, setIsAddToWsModalOpen] = useState(false);
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string>('');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter Logic
  const filteredItems = items.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.mbuTag && item.mbuTag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchSource = sourceFilter === 'all' || item.source === sourceFilter;
      return matchSearch && matchSource;
  });

  // Stats
  const stats = {
      total: items.length,
      uploaded: items.filter(i => i.source === 'upload').length,
      outcome: items.filter(i => i.source === 'workspace').length
  };

  // --- Handlers ---

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const ext = file.name.split('.').pop()?.toLowerCase();
          let type: any = 'doc';
          if (['jpg','png','jpeg'].includes(ext||'')) type = 'img';
          if (['xls','xlsx','csv'].includes(ext||'')) type = 'xls';
          if (['pdf'].includes(ext||'')) type = 'pdf';

          const newItem: KnowledgeItem = {
              id: `kb-new-${Date.now()}`,
              title: file.name,
              type: type,
              source: 'upload',
              createdAt: new Date().toLocaleString(),
              size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              mbuTag: '未分类',
              description: '个人上传资料',
              isPublic: false
          };
          setItems(prev => [newItem, ...prev]);
          setIsUploadModalOpen(false);
      }
  };

  const handleConfirmAddToWorkspace = () => {
      if (!targetWorkspaceId || !selectedItem) return;
      onAddToWorkspace(targetWorkspaceId, [selectedItem]);
      alert(`${t.addedToWorkspace}: ${workspaces.find(w => w.id === targetWorkspaceId)?.name}`);
      setIsAddToWsModalOpen(false);
      setSelectedItem(null);
  };

  const deleteItem = (id: string) => {
      if (confirm(t.confirmDelete)) {
          setItems(prev => prev.filter(i => i.id !== id));
          if (selectedItem?.id === id) setSelectedItem(null);
      }
  };

  const handleToggleVisibility = (e: React.MouseEvent, item: KnowledgeItem) => {
      e.stopPropagation();
      const newVisibility = !item.isPublic;
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isPublic: newVisibility } : i));
      if (selectedItem?.id === item.id) {
          setSelectedItem(prev => prev ? { ...prev, isPublic: newVisibility } : null);
      }
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'doc': return 'fa-file-word text-blue-600';
          case 'pdf': return 'fa-file-pdf text-red-600';
          case 'xls': return 'fa-file-excel text-green-600';
          case 'img': return 'fa-image text-purple-600';
          case 'outcome': return 'fa-lightbulb text-yellow-500';
          default: return 'fa-file text-gray-400';
      }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden relative">
      
      {/* 1. Top Bar */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center">
                  <i className="fas fa-book-reader text-indigo-600 mr-2"></i>
                  {t.kbTitle}
              </h1>
              <p className="text-xs text-gray-500 hidden md:block">{t.kbSubtitle}</p>
          </div>
          
          <div className="flex items-center gap-4">
               {/* Stats (Mini) */}
               <div className="hidden lg:flex gap-4 text-xs text-gray-500 mr-4 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                   <span><strong className="text-gray-800">{stats.total}</strong> {t.statsAssets}</span>
                   <span className="w-px h-3 bg-gray-300"></span>
                   <span><strong className="text-blue-600">{stats.outcome}</strong> {t.statsOutcomes}</span>
                   <span className="w-px h-3 bg-gray-300"></span>
                   <span><strong className="text-orange-600">{stats.uploaded}</strong> {t.statsUploads}</span>
               </div>

               {/* Search */}
               <div className="relative">
                   <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                   <input 
                      type="text" 
                      placeholder={t.kbSearchPlaceholder}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-8 pr-4 py-1.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
                   />
               </div>

               {/* Upload Button */}
               <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center"
               >
                   <i className="fas fa-cloud-upload-alt mr-2"></i> {t.uploadAsset}
               </button>
          </div>
      </div>

      {/* 2. Main Layout (Left Filter + Right Content) */}
      <div className="flex-1 flex overflow-hidden">
          
          {/* Left Sidebar Filter */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col p-4 flex-shrink-0">
               <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">{t.filterSource}</h3>
               <div className="space-y-1">
                   {[
                       { id: 'all', label: t.filterAll, icon: 'fa-layer-group' },
                       { id: 'workspace', label: t.sourceWorkspace, icon: 'fa-project-diagram' },
                       { id: 'upload', label: t.sourceUpload, icon: 'fa-user-upload' }
                   ].map(opt => (
                       <button
                          key={opt.id}
                          onClick={() => setSourceFilter(opt.id as any)}
                          className={`w-full flex items-center px-3 py-2 rounded text-sm font-medium transition-colors ${
                              sourceFilter === opt.id 
                              ? 'bg-indigo-50 text-indigo-700' 
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                       >
                           <i className={`fas ${opt.icon} w-5 text-center mr-2 opacity-70`}></i>
                           {opt.label}
                       </button>
                   ))}
               </div>

               <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="text-blue-800 font-bold text-xs mb-2"><i className="fas fa-info-circle mr-1"></i> {t.knowledgeLoopTitle}</h4>
                        <p className="text-[10px] text-blue-600 leading-relaxed">
                            {t.knowledgeLoopDesc}
                        </p>
                    </div>
               </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col bg-gray-50/50">
              {/* View Toggles */}
              <div className="h-10 px-6 flex items-center justify-between mt-4">
                  <h2 className="text-sm font-bold text-gray-700">
                      {sourceFilter === 'all' ? t.allAssets : sourceFilter === 'workspace' ? t.workspaceOutcomes : t.personalUploads} ({filteredItems.length})
                  </h2>
                  <div className="flex bg-white rounded-lg border border-gray-200 p-0.5">
                      <button 
                        onClick={() => setViewMode('card')}
                        className={`px-3 py-1 rounded text-xs transition-colors ${viewMode === 'card' ? 'bg-gray-100 text-gray-800 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                          <i className="fas fa-th-large"></i>
                      </button>
                      <button 
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1 rounded text-xs transition-colors ${viewMode === 'table' ? 'bg-gray-100 text-gray-800 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                          <i className="fas fa-list"></i>
                      </button>
                  </div>
              </div>

              {/* Content Grid/Table */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  {filteredItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                          <i className="fas fa-folder-open text-5xl mb-4"></i>
                          <p>{t.emptyKb}</p>
                      </div>
                  ) : viewMode === 'card' ? (
                      /* Card View */
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {filteredItems.map(item => (
                              <div 
                                key={item.id} 
                                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-indigo-300 transition-all group relative flex flex-col"
                              >
                                  <div className="flex justify-between items-start mb-3">
                                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl">
                                          <i className={`fas ${getIcon(item.type)}`}></i>
                                      </div>
                                      <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wide ${
                                          item.source === 'workspace' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                      }`}>
                                          {item.source === 'workspace' ? 'WS' : 'UP'}
                                      </span>
                                  </div>
                                  
                                  <div className="absolute top-4 right-12">
                                      <button 
                                          onClick={(e) => handleToggleVisibility(e, item)}
                                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all ${
                                              item.isPublic 
                                              ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                          }`}
                                          title={item.isPublic ? t.publicTooltip : t.privateTooltip}
                                      >
                                          <i className={`fas ${item.isPublic ? 'fa-globe' : 'fa-lock'}`}></i>
                                      </button>
                                  </div>

                                  <h3 className="font-bold text-gray-800 text-sm mb-1 leading-snug line-clamp-2 min-h-[2.5em] group-hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => setSelectedItem(item)}>
                                      {item.title}
                                  </h3>
                                  
                                  <p className="text-xs text-gray-500 mb-4 line-clamp-2 h-8">
                                      {item.description || "No description"}
                                  </p>
                                  
                                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                                      <span>{item.size}</span>
                                      <span>{item.createdAt.split(' ')[0]}</span>
                                  </div>

                                  {/* Hover Actions */}
                                  <div className="absolute inset-x-0 bottom-0 bg-white/95 border-t border-gray-100 p-3 flex justify-around opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl backdrop-blur-sm">
                                      <button onClick={() => setSelectedItem(item)} className="text-gray-500 hover:text-indigo-600" title={t.view}><i className="fas fa-eye"></i></button>
                                      <button 
                                        onClick={() => { setSelectedItem(item); setIsAddToWsModalOpen(true); }}
                                        className="text-gray-500 hover:text-green-600" title={t.addToWorkspace}
                                      >
                                          <i className="fas fa-plus-square"></i>
                                      </button>
                                      <button className="text-gray-500 hover:text-blue-600" title={t.download}><i className="fas fa-download"></i></button>
                                      <button onClick={() => deleteItem(item.id)} className="text-gray-500 hover:text-red-600"><i className="fas fa-trash"></i></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      /* Table View */
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                          <table className="w-full text-sm text-left">
                               <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200 text-xs uppercase">
                                   <tr>
                                       <th className="px-6 py-3">{t.colTitle}</th>
                                       <th className="px-6 py-3">{t.kbColType}</th>
                                       <th className="px-6 py-3">{t.colSource}</th>
                                       <th className="px-6 py-3">{t.visibility}</th>
                                       <th className="px-6 py-3">{t.colMbuTag}</th>
                                       <th className="px-6 py-3">{t.colDate}</th>
                                       <th className="px-6 py-3 text-right">{t.colAction}</th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-gray-100">
                                   {filteredItems.map(item => (
                                       <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                                           <td className="px-6 py-4 font-bold text-gray-800 cursor-pointer hover:text-indigo-600" onClick={() => setSelectedItem(item)}>
                                               {item.title}
                                           </td>
                                           <td className="px-6 py-4">
                                               <i className={`fas ${getIcon(item.type)} mr-2`}></i>
                                               <span className="text-xs text-gray-500 uppercase">{item.type}</span>
                                           </td>
                                           <td className="px-6 py-4">
                                               <span className={`text-[10px] px-2 py-1 rounded border ${
                                                   item.source === 'workspace' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-orange-50 border-orange-100 text-orange-600'
                                               }`}>
                                                   {item.source === 'workspace' ? t.sourceWorkspace : t.sourceUpload}
                                               </span>
                                           </td>
                                           <td className="px-6 py-4">
                                               <button 
                                                   onClick={(e) => handleToggleVisibility(e, item)}
                                                   className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                                       item.isPublic 
                                                       ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' 
                                                       : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                                   }`}
                                                   title={item.isPublic ? t.publicTooltip : t.privateTooltip}
                                               >
                                                   <i className={`fas ${item.isPublic ? 'fa-globe' : 'fa-lock'}`}></i>
                                                   {item.isPublic ? t.public : t.private}
                                               </button>
                                           </td>
                                           <td className="px-6 py-4 text-xs text-gray-600">{item.mbuTag || '-'}</td>
                                           <td className="px-6 py-4 text-xs text-gray-500 font-mono">{item.createdAt.split(' ')[0]}</td>
                                           <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                               <button onClick={() => { setSelectedItem(item); setIsAddToWsModalOpen(true); }} className="text-green-600 hover:bg-green-50 px-2 py-1 rounded mr-2" title={t.addToWorkspace}><i className="fas fa-plus-square"></i></button>
                                               <button onClick={() => deleteItem(item.id)} className="text-red-500 hover:bg-red-50 px-2 py-1 rounded"><i className="fas fa-trash"></i></button>
                                           </td>
                                       </tr>
                                   ))}
                               </tbody>
                          </table>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* --- Detail Drawer --- */}
      {selectedItem && !isAddToWsModalOpen && (
          <div className="absolute inset-0 z-20 flex justify-end bg-gray-900/10 backdrop-blur-[1px]">
              <div className="w-[400px] bg-white h-full shadow-2xl flex flex-col animate-[slideInRight_0.2s_ease-out] border-l border-gray-200">
                  <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-gray-50">
                       <div>
                           <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">{t.kbDetail}</h3>
                           <span className={`text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded ${
                               selectedItem.source === 'workspace' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                           }`}>
                               {selectedItem.source === 'workspace' ? t.workspaceAsset : t.manualUpload}
                           </span>
                       </div>
                       <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-lg"></i></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {/* Visibility Toggle */}
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedItem.isPublic ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                  <i className={`fas ${selectedItem.isPublic ? 'fa-globe' : 'fa-lock'}`}></i>
                              </div>
                              <div>
                                  <h4 className="text-sm font-bold text-gray-800">{t.visibility}</h4>
                                  <p className="text-[10px] text-gray-500">{selectedItem.isPublic ? t.publicTooltip : t.privateTooltip}</p>
                              </div>
                          </div>
                          <button 
                              onClick={(e) => handleToggleVisibility(e, selectedItem)}
                              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                                  selectedItem.isPublic 
                                  ? 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' 
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              }`}
                          >
                              {selectedItem.isPublic ? t.setPrivate : t.setPublic}
                          </button>
                      </div>

                      {/* Preview Placeholder */}
                      <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center border border-gray-200 text-gray-400 mb-4">
                          <i className={`fas ${getIcon(selectedItem.type)} text-4xl mb-2 opacity-50`}></i>
                          <span className="text-xs font-mono">{t.previewNotAvailable}</span>
                      </div>

                      <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">{t.assetInfo}</h4>
                          <h2 className="font-bold text-gray-800 mb-2">{selectedItem.title}</h2>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 leading-relaxed">
                              {selectedItem.description}
                          </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs text-gray-400 block mb-1">{t.size}</label>
                              <span className="text-sm font-mono text-gray-700">{selectedItem.size}</span>
                          </div>
                          <div>
                              <label className="text-xs text-gray-400 block mb-1">{t.created}</label>
                              <span className="text-sm font-mono text-gray-700">{selectedItem.createdAt}</span>
                          </div>
                          <div>
                              <label className="text-xs text-gray-400 block mb-1">{t.mbuTag}</label>
                              <span className="text-sm text-indigo-600 font-bold">{selectedItem.mbuTag}</span>
                          </div>
                          <div>
                              <label className="text-xs text-gray-400 block mb-1">{t.createdMethod}</label>
                              <span className="text-sm text-gray-700">{selectedItem.source === 'workspace' ? t.aiGenerated : t.userUpload}</span>
                          </div>
                      </div>

                      {selectedItem.refWorkspaceName && (
                          <div className="bg-blue-50 p-3 rounded border border-blue-100">
                              <label className="text-xs text-blue-400 block mb-1 uppercase font-bold">{t.fromWorkspace}</label>
                              <span className="text-sm text-blue-800 font-bold"><i className="fas fa-project-diagram mr-1"></i> {selectedItem.refWorkspaceName}</span>
                          </div>
                      )}
                  </div>

                  <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
                      <button 
                        onClick={() => setIsAddToWsModalOpen(true)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                      >
                          <i className="fas fa-plus-square mr-2"></i> {t.addToWorkspace}
                      </button>
                      <button className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg text-gray-600 font-bold transition-colors">
                          <i className="fas fa-download"></i>
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- Upload Modal --- */}
      {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-[500px] animate-[fadeIn_0.2s_ease-out]">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">{t.uploadAsset}</h3>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-40 border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all"
                  >
                      <i className="fas fa-cloud-upload-alt text-4xl text-indigo-300 mb-3"></i>
                      <p className="text-indigo-600 font-medium">{t.clickToUpload}</p>
                      <p className="text-xs text-indigo-400 mt-1">{t.supportsFiles}</p>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                      <button onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded">{t.cancel}</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- Add To Workspace Modal --- */}
      {isAddToWsModalOpen && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-[500px] animate-[fadeIn_0.2s_ease-out]">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{t.addToWorkspace}</h3>
                  <p className="text-xs text-gray-500 mb-6">Asset: <span className="font-bold text-gray-700">{selectedItem.title}</span></p>
                  
                  <div className="mb-6">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.selectTargetWorkspace}</label>
                      <select 
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={targetWorkspaceId}
                        onChange={e => setTargetWorkspaceId(e.target.value)}
                      >
                          <option value="">-- Select Workspace --</option>
                          {workspaces.map(w => (
                              <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                      </select>
                  </div>

                  <div className="bg-blue-50 p-3 rounded border border-blue-100 flex items-start mb-6">
                      <i className="fas fa-info-circle text-blue-500 mt-0.5 mr-2"></i>
                      <p className="text-xs text-blue-700 leading-relaxed">
                          {t.joinTip}
                      </p>
                  </div>

                  <div className="flex justify-end gap-3">
                      <button onClick={() => setIsAddToWsModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded">{t.cancel}</button>
                      <button 
                        onClick={handleConfirmAddToWorkspace}
                        disabled={!targetWorkspaceId}
                        className={`px-6 py-2 text-white font-bold rounded shadow-sm transition-colors ${!targetWorkspaceId ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                      >
                          {t.confirmJoin}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};