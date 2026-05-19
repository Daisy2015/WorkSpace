import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

interface User {
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
}

const DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: '钻井技术部', count: 12 },
  { id: 'dept-2', name: '采油工程部', count: 8 },
  { id: 'dept-3', name: '勘探开发研究院', count: 24 },
  { id: 'dept-4', name: '安全环保部', count: 5 },
  { id: 'dept-5', name: '生产协调指挥中心', count: 15 },
];

const ALL_USERS: User[] = [
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
}) => {
  const [activeDeptId, setActiveDeptId] = useState<string>(DEPARTMENTS[0].id);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredUsers = ALL_USERS.filter(u => 
    u.department === activeDeptId && 
    (u.name.includes(searchQuery) || u.role.includes(searchQuery))
  );

  const toggleUser = (userId: string) => {
    const next = new Set(selectedUserIds);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    setSelectedUserIds(next);
  };

  const selectedUsers = ALL_USERS.filter(u => selectedUserIds.has(u.id));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://aunit.app/share/ws-${Math.random().toString(36).substr(2, 9)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    // Logic for actual sharing would go here
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
                  {lang === 'zh' ? '共享工作空间' : 'Share Workspace'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'zh' ? `正在分享：${workspaceName}` : `Sharing: ${workspaceName}`}
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
                  {lang === 'zh' ? '按部门选择' : 'Select by Department'}
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

            {/* Selected Summary & Invite Section */}
            <div className="p-6 bg-gray-50/80 border-t border-gray-100 space-y-4">
              {/* Profile Link Section */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-link text-xs"></i>
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-bold text-gray-900">
                    {lang === 'zh' ? '通过链接邀请' : 'Invite via Link'}
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
                    {lang === 'zh' ? '已选择：' : 'Selected: '}
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
                    disabled={selectedUserIds.size === 0}
                    className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                  >
                    {lang === 'zh' ? '确定共享' : 'Share Now'}
                    <i className="fas fa-paper-plane text-xs"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Users Avatars (Floating mini-scroll if many) */}
            {selectedUserIds.size > 0 && (
              <div className="px-6 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
                {selectedUsers.map(u => (
                  <div key={u.id} className="relative group flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-white">
                      {u.name.charAt(0)}
                    </div>
                    <button 
                      onClick={() => toggleUser(u.id)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900 text-white rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
