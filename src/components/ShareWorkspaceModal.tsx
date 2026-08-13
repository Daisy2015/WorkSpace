import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  department: string;
  positionName?: string;
  roleName?: string;
  deptId?: string;
  subDeptId?: string;
  positionId?: string;
  roleGroupId?: string;
  roleId?: string;
  deptPath?: string;
}

export interface PositionNode {
  id: string;
  name: string;
  type: 'position';
}

export interface SubDepartmentNode {
  id: string;
  name: string;
  type: 'sub_department';
  children: PositionNode[];
}

export interface DepartmentNode {
  id: string;
  name: string;
  type: 'department';
  children: SubDepartmentNode[];
}

export interface SpecificRoleNode {
  id: string;
  name: string;
  type: 'role';
}

export interface RoleGroupNode {
  id: string;
  name: string;
  type: 'role_group';
  children: SpecificRoleNode[];
}

export const DEPARTMENT_TREE: DepartmentNode[] = [
  {
    id: 'dept-research',
    name: '勘探开发研究院',
    type: 'department',
    children: [
      {
        id: 'sub-logging',
        name: '测井技术研究所',
        type: 'sub_department',
        children: [
          { id: 'pos-log-interp', name: '测井解释工程师', type: 'position' },
          { id: 'pos-log-instrument', name: '测井仪器研发岗位', type: 'position' },
        ],
      },
      {
        id: 'sub-geology',
        name: '地质综合研究所',
        type: 'sub_department',
        children: [
          { id: 'pos-structural-geo', name: '构造地质分析岗位', type: 'position' },
          { id: 'pos-reservoir-model', name: '油藏三维建模岗位', type: 'position' },
        ],
      },
    ],
  },
  {
    id: 'dept-drilling',
    name: '钻井工程事业部',
    type: 'department',
    children: [
      {
        id: 'sub-drilling-tech',
        name: '钻井技术工程科',
        type: 'sub_department',
        children: [
          { id: 'pos-drilling-eng', name: '钻井工艺工程师岗位', type: 'position' },
          { id: 'pos-mud-fluid', name: '钻井液体系工程师岗位', type: 'position' },
        ],
      },
      {
        id: 'sub-well-control',
        name: '井控HSE监督科',
        type: 'sub_department',
        children: [
          { id: 'pos-well-control-sup', name: '现场井控监督岗位', type: 'position' },
        ],
      },
    ],
  },
  {
    id: 'dept-production',
    name: '采油气生产指挥中心',
    type: 'department',
    children: [
      {
        id: 'sub-prod-ops',
        name: '生产动态分析科',
        type: 'sub_department',
        children: [
          { id: 'pos-dynamic-eval', name: '产能递减诊断岗位', type: 'position' },
          { id: 'pos-prod-tech', name: '采油高级技师岗位', type: 'position' },
        ],
      },
    ],
  },
];

export const ROLE_TREE: RoleGroupNode[] = [
  {
    id: 'rolegroup-expert',
    name: '专家决策组',
    type: 'role_group',
    children: [
      { id: 'role-chief-geo', name: '首席地质专家', type: 'role' },
      { id: 'role-senior-drilling', name: '钻完井资深专家', type: 'role' },
      { id: 'role-reservoir-chief', name: '油藏首席工程师', type: 'role' },
    ],
  },
  {
    id: 'rolegroup-pm',
    name: '项目管理组',
    type: 'role_group',
    children: [
      { id: 'role-pm-lead', name: '项目总负责人', type: 'role' },
      { id: 'role-task-lead', name: '课题研究组长', type: 'role' },
    ],
  },
  {
    id: 'rolegroup-tech',
    name: '技术业务组',
    type: 'role_group',
    children: [
      { id: 'role-geo-analyst', name: '地质分析工程师', type: 'role' },
      { id: 'role-logging-spec', name: '测井解释专员', type: 'role' },
      { id: 'role-data-eng', name: '数据挖掘工程师', type: 'role' },
    ],
  },
  {
    id: 'rolegroup-collab',
    name: '团队协作组',
    type: 'role_group',
    children: [
      { id: 'role-ws-admin', name: '空间联合管理员', type: 'role' },
      { id: 'role-team-member', name: '标准研究员', type: 'role' },
      { id: 'role-viewer', name: '外部评阅人员', type: 'role' },
    ],
  },
];

export const ALL_USERS: User[] = [
  {
    id: 'u-1',
    name: '张伟',
    role: '首席地质专家',
    department: '勘探开发研究院',
    positionName: '测井解释工程师',
    roleName: '首席地质专家',
    deptId: 'dept-research',
    subDeptId: 'sub-logging',
    positionId: 'pos-log-interp',
    roleGroupId: 'rolegroup-expert',
    roleId: 'role-chief-geo',
    deptPath: '勘探开发研究院 / 测井技术研究所',
  },
  {
    id: 'u-2',
    name: '王芳',
    role: '测井解释专员',
    department: '勘探开发研究院',
    positionName: '测井仪器研发岗位',
    roleName: '测井解释专员',
    deptId: 'dept-research',
    subDeptId: 'sub-logging',
    positionId: 'pos-log-instrument',
    roleGroupId: 'rolegroup-tech',
    roleId: 'role-logging-spec',
    deptPath: '勘探开发研究院 / 测井技术研究所',
  },
  {
    id: 'u-3',
    name: '李强',
    role: '地质分析工程师',
    department: '勘探开发研究院',
    positionName: '构造地质分析岗位',
    roleName: '地质分析工程师',
    deptId: 'dept-research',
    subDeptId: 'sub-geology',
    positionId: 'pos-structural-geo',
    roleGroupId: 'rolegroup-tech',
    roleId: 'role-geo-analyst',
    deptPath: '勘探开发研究院 / 地质综合研究所',
  },
  {
    id: 'u-4',
    name: '赵敏',
    role: '课题研究组长',
    department: '勘探开发研究院',
    positionName: '油藏三维建模岗位',
    roleName: '课题研究组长',
    deptId: 'dept-research',
    subDeptId: 'sub-geology',
    positionId: 'pos-reservoir-model',
    roleGroupId: 'rolegroup-pm',
    roleId: 'role-task-lead',
    deptPath: '勘探开发研究院 / 地质综合研究所',
  },
  {
    id: 'u-5',
    name: '孙平',
    role: '钻完井资深专家',
    department: '钻井工程事业部',
    positionName: '钻井工艺工程师岗位',
    roleName: '钻完井资深专家',
    deptId: 'dept-drilling',
    subDeptId: 'sub-drilling-tech',
    positionId: 'pos-drilling-eng',
    roleGroupId: 'rolegroup-expert',
    roleId: 'role-senior-drilling',
    deptPath: '钻井工程事业部 / 钻井技术工程科',
  },
  {
    id: 'u-6',
    name: '刘洋',
    role: '数据挖掘工程师',
    department: '钻井工程事业部',
    positionName: '钻井液体系工程师岗位',
    roleName: '数据挖掘工程师',
    deptId: 'dept-drilling',
    subDeptId: 'sub-drilling-tech',
    positionId: 'pos-mud-fluid',
    roleGroupId: 'rolegroup-tech',
    roleId: 'role-data-eng',
    deptPath: '钻井工程事业部 / 钻井技术工程科',
  },
  {
    id: 'u-7',
    name: '陈诚',
    role: '项目总负责人',
    department: '钻井工程事业部',
    positionName: '现场井控监督岗位',
    roleName: '项目总负责人',
    deptId: 'dept-drilling',
    subDeptId: 'sub-well-control',
    positionId: 'pos-well-control-sup',
    roleGroupId: 'rolegroup-pm',
    roleId: 'role-pm-lead',
    deptPath: '钻井工程事业部 / 井控HSE监督科',
  },
  {
    id: 'u-8',
    name: '周华',
    role: '油藏首席工程师',
    department: '采油气生产指挥中心',
    positionName: '产能递减诊断岗位',
    roleName: '油藏首席工程师',
    deptId: 'dept-production',
    subDeptId: 'sub-prod-ops',
    positionId: 'pos-dynamic-eval',
    roleGroupId: 'rolegroup-expert',
    roleId: 'role-reservoir-chief',
    deptPath: '采油气生产指挥中心 / 生产动态分析科',
  },
  {
    id: 'u-9',
    name: '郑明',
    role: '标准研究员',
    department: '采油气生产指挥中心',
    positionName: '采油高级技师岗位',
    roleName: '标准研究员',
    deptId: 'dept-production',
    subDeptId: 'sub-prod-ops',
    positionId: 'pos-prod-tech',
    roleGroupId: 'rolegroup-collab',
    roleId: 'role-team-member',
    deptPath: '采油气生产指挥中心 / 生产动态分析科',
  },
  {
    id: 'u-10',
    name: '钱伟',
    role: '空间联合管理员',
    department: '勘探开发研究院',
    positionName: '测井解释工程师',
    roleName: '空间联合管理员',
    deptId: 'dept-research',
    subDeptId: 'sub-logging',
    positionId: 'pos-log-interp',
    roleGroupId: 'rolegroup-collab',
    roleId: 'role-ws-admin',
    deptPath: '勘探开发研究院 / 测井技术研究所',
  },
  {
    id: 'u-11',
    name: '孙丽',
    role: '外部评阅人员',
    department: '采油气生产指挥中心',
    positionName: '产能递减诊断岗位',
    roleName: '外部评阅人员',
    deptId: 'dept-production',
    subDeptId: 'sub-prod-ops',
    positionId: 'pos-dynamic-eval',
    roleGroupId: 'rolegroup-collab',
    roleId: 'role-viewer',
    deptPath: '采油气生产指挥中心 / 生产动态分析科',
  },
];

interface ShareWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
  lang: Language;
  initialSelectedUserIds?: Set<string>;
  initialUserPermissions?: Record<string, 'edit' | 'view'>;
  onSave?: (selectedUserIds: Set<string>, userPermissions: Record<string, 'edit' | 'view'>) => void;
}

export const ShareWorkspaceModal: React.FC<ShareWorkspaceModalProps> = ({
  isOpen,
  onClose,
  workspaceName,
  lang,
  initialSelectedUserIds,
  initialUserPermissions,
  onSave,
}) => {
  const [filterTab, setFilterTab] = useState<'department' | 'role'>('department');
  const [selectedFilter, setSelectedFilter] = useState<{ id: string; type: string } | null>({ id: DEPARTMENT_TREE[0].id, type: 'department' });
  const [leftSearchQuery, setLeftSearchQuery] = useState('');
  
  // Expanded node IDs for trees
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set([
      'dept-research', 'dept-drilling', 'dept-production',
      'sub-logging', 'sub-geology', 'sub-drilling-tech', 'sub-well-control', 'sub-prod-ops',
      'rolegroup-expert', 'rolegroup-pm', 'rolegroup-tech', 'rolegroup-collab'
    ])
  );

  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [userPermissions, setUserPermissions] = useState<Record<string, 'edit' | 'view'>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedUserIds(initialSelectedUserIds ? new Set(initialSelectedUserIds) : new Set());
      setUserPermissions(initialUserPermissions || {});
      setSelectedFilter({ id: DEPARTMENT_TREE[0].id, type: 'department' });
      setSearchQuery('');
      setLeftSearchQuery('');
      setFilterTab('department');
    }
  }, [isOpen, initialSelectedUserIds, initialUserPermissions]);

  const toggleNodeExpansion = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const filteredDepartmentTree = useMemo(() => {
    const query = leftSearchQuery.trim().toLowerCase();
    if (!query) return DEPARTMENT_TREE;
    return DEPARTMENT_TREE.map(dept => {
      const deptMatches = dept.name.toLowerCase().includes(query);
      const filteredSubDepts = dept.children.map(sub => {
        const subMatches = sub.name.toLowerCase().includes(query);
        const filteredPositions = sub.children.filter(pos => pos.name.toLowerCase().includes(query));
        if (subMatches || filteredPositions.length > 0) {
          return {
            ...sub,
            children: subMatches ? sub.children : filteredPositions
          };
        }
        return null;
      }).filter(Boolean) as SubDepartmentNode[];

      if (deptMatches || filteredSubDepts.length > 0) {
        return {
          ...dept,
          children: deptMatches ? dept.children : filteredSubDepts
        };
      }
      return null;
    }).filter(Boolean) as DepartmentNode[];
  }, [leftSearchQuery]);

  const filteredRoleTree = useMemo(() => {
    const query = leftSearchQuery.trim().toLowerCase();
    if (!query) return ROLE_TREE;
    return ROLE_TREE.map(group => {
      const groupMatches = group.name.toLowerCase().includes(query);
      const filteredRoles = group.children.filter(role => role.name.toLowerCase().includes(query));
      if (groupMatches || filteredRoles.length > 0) {
        return {
          ...group,
          children: groupMatches ? group.children : filteredRoles
        };
      }
      return null;
    }).filter(Boolean) as RoleGroupNode[];
  }, [leftSearchQuery]);

  // Filtered Users based on left side selection & search query
  const filteredUsers = useMemo(() => {
    return ALL_USERS.filter(user => {
      // 1. Text Search Filter (Right side: Name search only)
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matchesName = user.name.toLowerCase().includes(query);
        if (!matchesName) {
          return false;
        }
      }

      // 2. Tab & Tree Selection Filter
      if (!selectedFilter) {
        return true;
      }

      if (filterTab === 'department') {
        if (selectedFilter.type === 'department') {
          return user.deptId === selectedFilter.id;
        }
        if (selectedFilter.type === 'sub_department') {
          return user.subDeptId === selectedFilter.id;
        }
        if (selectedFilter.type === 'position') {
          return user.positionId === selectedFilter.id;
        }
      } else if (filterTab === 'role') {
        if (selectedFilter.type === 'role_group') {
          return user.roleGroupId === selectedFilter.id;
        }
        if (selectedFilter.type === 'role') {
          return user.roleId === selectedFilter.id;
        }
      }

      return true;
    });
  }, [searchQuery, filterTab, selectedFilter]);

  // Select All state calculations
  const isAllFilteredSelected = useMemo(() => {
    if (filteredUsers.length === 0) return false;
    return filteredUsers.every(u => selectedUserIds.has(u.id));
  }, [filteredUsers, selectedUserIds]);

  const isSomeFilteredSelected = useMemo(() => {
    if (filteredUsers.length === 0) return false;
    return filteredUsers.some(u => selectedUserIds.has(u.id)) && !isAllFilteredSelected;
  }, [filteredUsers, selectedUserIds, isAllFilteredSelected]);

  const handleToggleSelectAll = () => {
    const nextSelected = new Set(selectedUserIds);
    const nextPermissions = { ...userPermissions };

    if (isAllFilteredSelected) {
      filteredUsers.forEach(u => {
        nextSelected.delete(u.id);
        delete nextPermissions[u.id];
      });
    } else {
      filteredUsers.forEach(u => {
        nextSelected.add(u.id);
        if (!nextPermissions[u.id]) {
          nextPermissions[u.id] = 'view';
        }
      });
    }

    setSelectedUserIds(nextSelected);
    setUserPermissions(nextPermissions);
  };

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
        [userId]: 'view'
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

  // Helper count getters for tree nodes
  const getDeptNodeCount = (nodeId: string, type: string) => {
    if (type === 'department') return ALL_USERS.filter(u => u.deptId === nodeId).length;
    if (type === 'sub_department') return ALL_USERS.filter(u => u.subDeptId === nodeId).length;
    if (type === 'position') return ALL_USERS.filter(u => u.positionId === nodeId).length;
    return 0;
  };

  const getRoleNodeCount = (nodeId: string, type: string) => {
    if (type === 'role_group') return ALL_USERS.filter(u => u.roleGroupId === nodeId).length;
    if (type === 'role') return ALL_USERS.filter(u => u.roleId === nodeId).length;
    return 0;
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
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[88vh]"
          >
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-sm">
                  <i className="fas fa-users-gear"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {lang === 'zh' ? '工作空间成员管理' : 'Workspace Member Management'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {lang === 'zh' ? `成员协同与权限分配：${workspaceName}` : `Members & Permissions: ${workspaceName}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Panel: Filter Mode Tabs + Department / Role Tree */}
              <div className="w-80 bg-gray-50/70 border-r border-gray-100 overflow-y-auto p-4 custom-scrollbar flex flex-col">
                
                {/* Tab Switcher: 按部门 vs 按角色 */}
                <div className="flex bg-gray-200/60 p-1 rounded-2xl mb-3 border border-gray-200/30">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterTab('department');
                      setSelectedFilter({ id: DEPARTMENT_TREE[0].id, type: 'department' });
                      setLeftSearchQuery('');
                    }}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      filterTab === 'department'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <i className="fas fa-sitemap text-[11px]"></i>
                    <span>{lang === 'zh' ? '按部门筛选' : 'By Department'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFilterTab('role');
                      setSelectedFilter({ id: ROLE_TREE[0].id, type: 'role' });
                      setLeftSearchQuery('');
                    }}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      filterTab === 'role'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <i className="fas fa-user-shield text-[11px]"></i>
                    <span>{lang === 'zh' ? '按角色筛选' : 'By Role'}</span>
                  </button>
                </div>

                {/* Left Search Input for Departments/Roles */}
                <div className="relative mb-2.5">
                  <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]"></i>
                  <input 
                    type="text"
                    placeholder={filterTab === 'department' ? (lang === 'zh' ? '搜索部门、科室或岗位...' : 'Search dept or position...') : (lang === 'zh' ? '搜索角色组或角色...' : 'Search role group or role...')}
                    value={leftSearchQuery}
                    onChange={e => setLeftSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200/80 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                  {leftSearchQuery && (
                    <button 
                      onClick={() => setLeftSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[11px]"
                    >
                      <i className="fas fa-times-circle"></i>
                    </button>
                  )}
                </div>

                {/* Subtitle Indicator */}
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-2 flex items-center justify-between">
                  <span>
                    {filterTab === 'department' 
                      ? (lang === 'zh' ? '部门 / 科室 / 岗位架构树' : 'Department & Position Tree') 
                      : (lang === 'zh' ? '角色组 / 具体角色架构树' : 'Role Group & Role Tree')}
                  </span>
                  <span className="text-gray-400 text-[10px]">
                    {ALL_USERS.length} {lang === 'zh' ? '人' : 'members'}
                  </span>
                </div>

                {/* Tree View Container */}
                <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
                  
                  {/* DEPARTMENT TREE MODE */}
                  {filterTab === 'department' && (
                    <div className="space-y-1 mt-1">
                      {filteredDepartmentTree.map(dept => {
                        const isDeptExpanded = expandedNodes.has(dept.id);
                        const isDeptSelected = selectedFilter?.id === dept.id && selectedFilter?.type === 'department';
                        const deptCount = getDeptNodeCount(dept.id, 'department');

                        return (
                          <div key={dept.id} className="space-y-1">
                            {/* Level 1: Department (部门) */}
                            <div
                              onClick={() => setSelectedFilter({ id: dept.id, type: 'department' })}
                              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                                isDeptSelected
                                  ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 shadow-2xs'
                                  : 'text-gray-800 hover:bg-white hover:shadow-2xs'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <button
                                  type="button"
                                  onClick={(e) => toggleNodeExpansion(dept.id, e)}
                                  className="w-5 h-5 rounded hover:bg-gray-200/60 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                                >
                                  <i className={`fas fa-chevron-right text-[10px] transition-transform duration-200 ${isDeptExpanded ? 'rotate-90' : ''}`}></i>
                                </button>
                                <i className="fas fa-building text-blue-500 text-xs"></i>
                                <span className="truncate">{dept.name}</span>
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                                isDeptSelected ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-gray-200/60 text-gray-500'
                              }`}>
                                {deptCount}
                              </span>
                            </div>

                            {/* Level 2: Sub-departments */}
                            {isDeptExpanded && (
                              <div className="pl-4 space-y-1 border-l-2 border-gray-200/60 ml-3.5 my-1">
                                {dept.children.map(subDept => {
                                  const isSubExpanded = expandedNodes.has(subDept.id);
                                  const isSubSelected = selectedFilter?.id === subDept.id && selectedFilter?.type === 'sub_department';
                                  const subCount = getDeptNodeCount(subDept.id, 'sub_department');

                                  return (
                                    <div key={subDept.id} className="space-y-1">
                                      <div
                                        onClick={() => setSelectedFilter({ id: subDept.id, type: 'sub_department' })}
                                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                                          isSubSelected
                                            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 font-bold shadow-2xs'
                                            : 'text-gray-700 hover:bg-white hover:shadow-2xs'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <button
                                            type="button"
                                            onClick={(e) => toggleNodeExpansion(subDept.id, e)}
                                            className="w-4 h-4 rounded hover:bg-gray-200/60 flex items-center justify-center text-gray-400 hover:text-gray-700"
                                          >
                                            <i className={`fas fa-chevron-right text-[9px] transition-transform duration-200 ${isSubExpanded ? 'rotate-90' : ''}`}></i>
                                          </button>
                                          <i className="fas fa-sitemap text-amber-500 text-[11px]"></i>
                                          <span className="truncate">{subDept.name}</span>
                                        </div>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                                          isSubSelected ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-gray-200/50 text-gray-500'
                                        }`}>
                                          {subCount}
                                        </span>
                                      </div>

                                      {/* Level 3: Position (岗位 - 末级) */}
                                      {isSubExpanded && (
                                        <div className="pl-5 space-y-1 border-l border-gray-200/50 ml-2.5 my-1">
                                          {subDept.children.map(pos => {
                                            const isPosSelected = selectedFilter?.id === pos.id && selectedFilter?.type === 'position';
                                            const posCount = getDeptNodeCount(pos.id, 'position');

                                            return (
                                              <div
                                                key={pos.id}
                                                onClick={() => setSelectedFilter({ id: pos.id, type: 'position' })}
                                                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                                                  isPosSelected
                                                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                                                    : 'text-gray-600 hover:bg-white hover:text-gray-900'
                                                }`}
                                              >
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                  <i className={`fas fa-id-badge text-[10px] ${isPosSelected ? 'text-white' : 'text-indigo-400'}`}></i>
                                                  <span className="truncate">{pos.name}</span>
                                                  <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase tracking-wider ${
                                                    isPosSelected ? 'bg-blue-700 text-white' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                                  }`}>
                                                    岗位
                                                  </span>
                                                </div>
                                                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                                                  isPosSelected ? 'bg-blue-800 text-white' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                  {posCount}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ROLE TREE MODE */}
                  {filterTab === 'role' && (
                    <div className="space-y-1 mt-1">
                      {filteredRoleTree.map(group => {
                        const isGroupExpanded = expandedNodes.has(group.id);
                        const isGroupSelected = selectedFilter?.id === group.id && selectedFilter?.type === 'role_group';
                        const groupCount = getRoleNodeCount(group.id, 'role_group');

                        return (
                          <div key={group.id} className="space-y-1">
                            {/* Level 1: Role Group (角色组) */}
                            <div
                              onClick={() => setSelectedFilter({ id: group.id, type: 'role_group' })}
                              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                                isGroupSelected
                                  ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 shadow-2xs'
                                  : 'text-gray-800 hover:bg-white hover:shadow-2xs'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <button
                                  type="button"
                                  onClick={(e) => toggleNodeExpansion(group.id, e)}
                                  className="w-5 h-5 rounded hover:bg-gray-200/60 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                                >
                                  <i className={`fas fa-chevron-right text-[10px] transition-transform duration-200 ${isGroupExpanded ? 'rotate-90' : ''}`}></i>
                                </button>
                                <i className="fas fa-users-rectangle text-purple-500 text-xs"></i>
                                <span className="truncate">{group.name}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-600 border border-purple-100 font-bold">
                                  角色组
                                </span>
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                                isGroupSelected ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-gray-200/60 text-gray-500'
                              }`}>
                                {groupCount}
                              </span>
                            </div>

                            {/* Level 2: Specific Roles (具体角色) */}
                            {isGroupExpanded && (
                              <div className="pl-4 space-y-1 border-l-2 border-purple-200/50 ml-3.5 my-1">
                                {group.children.map(role => {
                                  const isRoleSelected = selectedFilter?.id === role.id && selectedFilter?.type === 'role';
                                  const roleCount = getRoleNodeCount(role.id, 'role');

                                  return (
                                    <div
                                      key={role.id}
                                      onClick={() => setSelectedFilter({ id: role.id, type: 'role' })}
                                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                                        isRoleSelected
                                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                                          : 'text-gray-700 hover:bg-white hover:text-gray-900'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <i className={`fas fa-user-shield text-[10px] ${isRoleSelected ? 'text-white' : 'text-purple-400'}`}></i>
                                        <span className="truncate">{role.name}</span>
                                      </div>
                                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                                        isRoleSelected ? 'bg-blue-800 text-white' : 'bg-gray-100 text-gray-500'
                                      }`}>
                                        {roleCount}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              </div>

              {/* Right Panel: Search, Select All, People List */}
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                
                {/* Search & Select All Top Bar */}
                <div className="p-4 border-b border-gray-100 space-y-3 bg-white">
                  {/* Search Input (Name search only) */}
                  <div className="relative">
                    <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                    <input 
                      type="text"
                      placeholder={lang === 'zh' ? "搜索姓名..." : "Search name..."}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200/80 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                      >
                        <i className="fas fa-times-circle"></i>
                      </button>
                    )}
                  </div>

                  {/* List Header & Select All Control */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-800">
                        {lang === 'zh' ? '候选人员列表' : 'Candidate List'}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">
                        ({lang === 'zh' ? `共 ${filteredUsers.length} 人` : `${filteredUsers.length} total`})
                      </span>
                    </div>

                    {/* SELECT ALL BUTTON / TOGGLE (全选按钮) */}
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      disabled={filteredUsers.length === 0}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        isAllFilteredSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                          : isSomeFilteredSelected
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isAllFilteredSelected
                          ? 'bg-white border-white text-blue-600'
                          : isSomeFilteredSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300'
                      }`}>
                        {isAllFilteredSelected && <i className="fas fa-check text-[10px]"></i>}
                        {isSomeFilteredSelected && <i className="fas fa-minus text-[10px]"></i>}
                      </div>
                      <span>{lang === 'zh' ? '全选' : 'Select All'}</span>
                      {filteredUsers.length > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isAllFilteredSelected ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {filteredUsers.filter(u => selectedUserIds.has(u.id)).length}/{filteredUsers.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* User Cards List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
                  <div className="space-y-2">
                    {filteredUsers.map(user => {
                      const isSelected = selectedUserIds.has(user.id);

                      return (
                        <div
                          key={user.id}
                          onClick={() => toggleUser(user.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-50/60 border-blue-200/80 shadow-2xs' 
                              : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold border-2 transition-all flex-shrink-0 ${
                              isSelected 
                                ? 'bg-blue-600 text-white border-blue-400 shadow-sm' 
                                : 'bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 border-white shadow-2xs'
                            }`}>
                              {user.name.charAt(0)}
                            </div>

                            {/* Info: Avatar & Name ONLY */}
                            <div className="text-left min-w-0 flex-1 flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-900 truncate">{user.name}</span>
                            </div>
                          </div>

                          {/* Permission dropdown & checkbox */}
                          <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                            {/* Inline permission setting */}
                            {isSelected && (
                              <div 
                                className="relative" 
                                onClick={(e) => e.stopPropagation()}
                              >
                                <select
                                  value={userPermissions[user.id] || 'view'}
                                  onChange={(e) => {
                                    const val = e.target.value as 'edit' | 'view';
                                    setUserPermissions(prev => ({ ...prev, [user.id]: val }));
                                  }}
                                  className="text-[11px] bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs cursor-pointer"
                                >
                                  <option value="view">{lang === 'zh' ? '可查看' : 'Can View'}</option>
                                  <option value="edit">{lang === 'zh' ? '可编辑' : 'Can Edit'}</option>
                                </select>
                              </div>
                            )}

                            {/* Custom Checkbox Box */}
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 shadow-2xs'
                                : 'border-gray-300 bg-white hover:border-blue-400'
                            }`}>
                              {isSelected && (
                                <motion.i 
                                  initial={{ scale: 0 }} 
                                  animate={{ scale: 1 }} 
                                  className="fas fa-check text-white text-[10px]"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {filteredUsers.length === 0 && (
                      <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 mb-3 text-lg">
                          <i className="fas fa-user-slash"></i>
                        </div>
                        <p className="text-xs font-bold text-gray-500 mb-1">
                          {lang === 'zh' ? '暂无匹配的人员' : 'No matching members found'}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {lang === 'zh' ? '尝试切换部门或角色树节点，或清空搜索关键字' : 'Try switching tree nodes or clearing search'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Bar 1: Selected Members with Permission Settings */}
            {selectedUserIds.size > 0 && (
              <div className="px-8 py-3.5 bg-gray-50/80 border-t border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>{lang === 'zh' ? '已选成员及分配权限清单' : 'Selected Members & Permissions'}</span>
                  <span className="text-blue-600 font-bold text-xs">{selectedUserIds.size} {lang === 'zh' ? '人' : 'selected'}</span>
                </div>
                <div className="max-h-[110px] overflow-y-auto space-y-2 custom-scrollbar pr-1">
                  {selectedUsers.map(u => {
                    const perm = userPermissions[u.id] || 'view';
                    return (
                      <div key={u.id} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-gray-200/60 shadow-2xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-gray-900 truncate">{u.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200/20">
                            <button
                              type="button"
                              onClick={() => setUserPermissions(prev => ({ ...prev, [u.id]: 'view' }))}
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                                perm === 'view'
                                  ? 'bg-white text-blue-600 shadow-2xs'
                                  : 'text-gray-500 hover:text-gray-900'
                              }`}
                            >
                              {lang === 'zh' ? '可查看' : 'Viewer'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setUserPermissions(prev => ({ ...prev, [u.id]: 'edit' }))}
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                                perm === 'edit'
                                  ? 'bg-white text-blue-600 shadow-2xs'
                                  : 'text-gray-500 hover:text-gray-900'
                              }`}
                            >
                              {lang === 'zh' ? '可编辑' : 'Editor'}
                            </button>
                          </div>

                          <button
                            onClick={() => toggleUser(u.id)}
                            className="w-5 h-5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all"
                            title={lang === 'zh' ? '移除' : 'Remove'}
                          >
                            <i className="fas fa-times text-[10px]"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Bar 2: Link invite & Action Bar */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 space-y-3">
              {/* Profile Link Section */}
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-gray-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-link text-xs"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-gray-900">
                    {lang === 'zh' ? '通过专属链接快捷分配/邀请' : 'Invite / Assign via Unique Workspace Link'}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    https://aunit.app/share/ws-a9k2l9m-jura-workspace
                  </div>
                </div>
                <button 
                  onClick={handleCopyLink}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    copied 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {copied ? (lang === 'zh' ? '已复制' : 'Copied') : (lang === 'zh' ? '复制链接' : 'Copy Link')}
                </button>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs text-gray-500">
                    {lang === 'zh' ? '已选定协同成员：' : 'Selected Members: '}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {selectedUserIds.size} {lang === 'zh' ? '人' : 'people'}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={onClose}
                    className="px-5 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {lang === 'zh' ? '取消' : 'Cancel'}
                  </button>
                  <button 
                    onClick={handleShare}
                    className="px-7 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                  >
                    {lang === 'zh' ? '保存成员变更' : 'Save Changes'}
                    <i className="fas fa-check text-[10px]"></i>
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
