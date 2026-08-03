import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  department: string;
}

interface Department {
  id: string;
  name: string;
  count: number;
}

interface ShareWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
  lang: Language;
  initialSelectedUserIds?: Set<string>;
  initialUserPermissions?: Record<string, 'edit' | 'view'>;
  onSave?: (selectedUserIds: Set<string>, userPermissions: Record<string, 'edit' | 'view'>) => void;
}

const DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: '钻井技术部', count: 12 },
  { id: 'dept-2', name: '采油工程部', count: 8 },
  { id: 'dept-3', name: '勘探开发研究院', count: 24 },
  { id: 'dept-4', name: '安全环保部', count: 5 },
  { id: 'dept-5', name: '生产协调指挥中心', count: 15 },
];

export const ALL_USERS: User[] = [
  { id: 'u-1', name: '张伟', role: '高级工程师', department: 'dept-1' },
  { id: 'u-2', name: '王芳', role: '钻井专家', department: 'dept-1' },
  { id: 'u-3', name: '李强', role: '技术员', department: 'dept-1' },
  { id: 'u-4', name: '赵敏', role: '生产主管', department: 'dept-2' },
  { id: 'u-5', name: '孙平', role: '采油技师', department: 'dept-2' },
  { id: 'u-6', name: '刘洋', role: '地质分析师', department: 'dept-3' },
  { id: 'u-7', name: '陈诚', role: '开发专家', department: 'dept-3' },
  { id: 'u-8', name: '周华', role: '研究员', department: 'dept-3' },
];

export const ShareWorkspaceModal: React.FC<ShareWorkspaceModalProps> = ({
  isOpen,
  onClose,
  workspaceName,
  lang,
  initialSelectedUserIds,
  initialUserPermissions,
  onSave,
}) => {
  const [activeDeptId, setActiveDeptId] = useState<string>(DEPARTMENTS[0].id);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [userPermissions, setUserPermissions] = useState<Record<string, 'edit' | 'view'>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedUserIds(initialSelectedUserIds ? new Set(initialSelectedUserIds) : new Set());
      setUserPermissions(initialUserPermissions || {});
    }
  }, [isOpen, initialSelectedUserIds, initialUserPermissions]);

  const filteredUsers = ALL_USERS.filter(u => 
    u.department === activeDeptId && 
    (u.name.includes(searchQuery) || u.role.includes(searchQuery))
  );

  const toggleUser = (userId: string) => {
    const next = new Set(selectedUserIds);
    if (next.has(userId)) {
      next.delete(userId);
      setUserPermissions(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    } else {
      next.add(userId);
      setUserPermissions(prev => ({
        ...prev,
        [userId]: 'view' // default permission is 'view' (可查看)
      }));
    }
    setSelectedUserIds(next);
  };

  const selectedUsers = ALL_USERS.filter(u => selectedUserIds.has(u.id));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://aunit.app/share/ws-${Math.random().toString(36).substr(2, 9)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (onSave) {
      onSave(selectedUserIds, userPermissions);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {lang === 'zh' ? '工作空间成员管理' : 'Workspace Member Management'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'zh' ? `成员管理：${workspaceName}` : `Members: ${workspaceName}`}
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Left: Department List */}
              <div className="w-1/3 bg-gray-50/50 border-r border-gray-100 overflow-y-auto p-4 custom-scrollbar">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                  {lang === 'zh' ? '按部门筛选' : 'Filter by Department'}
                </div>
                <div className="space-y-1">
                  {DEPARTMENTS.map(dept => (
                    <button
                      key={dept.id}
                      onClick={() => setActiveDeptId(dept.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group ${
                        activeDeptId === dept.id 
                          ? 'bg-white shadow-sm ring-1 ring-black/5 text-blue-600' 
                          : 'text-gray-600 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <span className="text-sm font-medium truncate">{dept.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                        activeDeptId === dept.id ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {dept.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: People Selection */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-50">
                  <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                    <input 
                      type="text"
                      placeholder={lang === 'zh' ? "搜索姓名或职位..." : "Search name or role..."}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-1 focus:ring-blue-500/20 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                {/* User List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <div className="space-y-1">
                    {filteredUsers.map(user => (
                      <button
                        key={user.id}
                        onClick={() => toggleUser(user.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                          selectedUserIds.has(user.id) 
                            ? 'bg-blue-50/50' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div className="text-left flex-1">
                          <div className="text-sm font-bold text-gray-900">{user.name}</div>
                          <div className="text-[11px] text-gray-500">{user.role}</div>
                        </div>
                        
                        {/* Inline permission setting */}
                        {selectedUserIds.has(user.id) && (
                          <div 
                            className="relative mr-1" 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={userPermissions[user.id] || 'view'}
                              onChange={(e) => {
                                const val = e.target.value as 'edit' | 'view';
                                setUserPermissions(prev => ({ ...prev, [user.id]: val }));
                              }}
                              className="text-[11px] bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            >
                              <option value="view">{lang === 'zh' ? '可查看' : 'Can View'}</option>
                              <option value="edit">{lang === 'zh' ? '可编辑' : 'Can Edit'}</option>
                            </select>
                          </div>
                        )}

                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          selectedUserIds.has(user.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-200 bg-white'
                        }`}>
                          {selectedUserIds.has(user.id) && (
                            <motion.i 
                              initial={{ scale: 0 }} 
                              animate={{ scale: 1 }} 
                              className="fas fa-check text-white text-[10px]"
                            />
                          )}
                        </div>
                      </button>
                    ))}
                    {filteredUsers.length === 0 && (
                      <div className="py-12 text-center text-gray-400 flex flex-col items-center">
                        <i className="fas fa-user-slash text-2xl mb-2 opacity-20"></i>
                        <p className="text-xs">{lang === 'zh' ? '暂无匹配人员' : 'No users found'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Members with Permission Settings List */}
            {selectedUserIds.size > 0 && (
              <div className="px-8 py-4 bg-gray-50/40 border-t border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                  {lang === 'zh' ? '已选成员权限清单' : 'Member Permissions List'}
                </div>
                <div className="max-h-[130px] overflow-y-auto space-y-2 custom-scrollbar">
                  {selectedUsers.map(u => {
                    const perm = userPermissions[u.id] || 'view';
                    return (
                      <div key={u.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-gray-200/60 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-800">{u.name}</span>
                            <span className="text-[10px] text-gray-400 ml-2">{u.role}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Permission Selector buttons */}
                          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200/20">
                            <button
                              type="button"
                              onClick={() => setUserPermissions(prev => ({ ...prev, [u.id]: 'view' }))}
                              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                                perm === 'view'
                                  ? 'bg-white text-blue-600 shadow-2xs'
                                  : 'text-gray-500 hover:text-gray-950'
                              }`}
                            >
                              {lang === 'zh' ? '可查看' : 'Viewer'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setUserPermissions(prev => ({ ...prev, [u.id]: 'edit' }))}
                              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                                perm === 'edit'
                                  ? 'bg-white text-blue-600 shadow-2xs'
                                  : 'text-gray-500 hover:text-gray-950'
                              }`}
                            >
                              {lang === 'zh' ? '可编辑' : 'Editor'}
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => toggleUser(u.id)}
                            className="w-6 h-6 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all"
                            title={lang === 'zh' ? '移除' : 'Remove'}
                          >
                            <i className="fas fa-trash-alt text-[10px]"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Link invite & Save Section */}
            <div className="p-6 bg-gray-50/80 border-t border-gray-100 space-y-4">
              {/* Profile Link Section */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-link text-xs"></i>
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-bold text-gray-900">
                    {lang === 'zh' ? '通过专属邀请链接分配成员' : 'Assign Members via Invitation Link'}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    https://aunit.app/share/ws-a9k2l9m...
                  </div>
                </div>
                <button 
                  onClick={handleCopyLink}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {copied ? (lang === 'zh' ? '已复制' : 'Copied') : (lang === 'zh' ? '复制' : 'Copy')}
                </button>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500">
                    {lang === 'zh' ? '已选定成员数：' : 'Selected Members: '}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {selectedUserIds.size} {lang === 'zh' ? '人' : 'people'}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={onClose}
                    className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {lang === 'zh' ? '取消' : 'Cancel'}
                  </button>
                  <button 
                    onClick={handleShare}
                    className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                  >
                    {lang === 'zh' ? '保存更改' : 'Save Changes'}
                    <i className="fas fa-save text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
