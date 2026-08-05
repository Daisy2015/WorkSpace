import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ResourceNode, Language } from '../types';

interface SaveOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    name: string;
    isPublic: boolean;
    mbuId?: string;
    outcomeType?: string;
    objectId?: string;
    isArtifactOutcome?: boolean;
  }) => void;
  resourceTree?: ResourceNode[];
  initialName?: string;
  lang: Language;
  objectScope?: { id: string; label: string; items: string[] }[];
}

export const SaveOutcomeModal: React.FC<SaveOutcomeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialName = '',
  lang,
}) => {
  const isZh = lang === 'zh';
  const [name, setName] = useState(initialName);
  const [isPublic, setIsPublic] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <i className="fas fa-save text-sm"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-800">{isZh ? '保存为成果' : 'Save as Outcome'}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {isZh ? '成果名称' : 'Outcome Name'}
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isZh ? '请输入成果名称' : 'Enter outcome name'}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium text-slate-800"
              autoFocus
            />
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">{isZh ? '公开设置' : 'Public Setting'}</span>
              <span className="text-[10px] text-slate-500">{isZh ? '公开后其他团队成员可见' : 'Visible to other team members'}</span>
            </div>
            <button 
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${isPublic ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isZh ? '取消' : 'Cancel'}
          </button>
          <button 
            type="button"
            disabled={!name.trim()}
            onClick={() => onConfirm({ 
              name: name.trim(), 
              isPublic, 
              isArtifactOutcome: true
            })}
            className={`flex-1 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all cursor-pointer ${
              !name.trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 active:scale-95'
            }`}
          >
            {isZh ? '完成保存' : 'Confirm Save'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

