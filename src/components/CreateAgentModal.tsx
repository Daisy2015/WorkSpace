import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ isOpen, onClose, lang }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mcpAddress: '',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header - Sticky */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <i className="fas fa-robot text-sm"></i>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">{lang === 'zh' ? '注册智能体' : 'Register Agent'}</h3>
                  <p className="text-[10px] font-bold text-slate-400">
                    {lang === 'zh' ? '配置智能体基本信息' : 'Basic Configuration'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
              <div className="space-y-4">
                {/* Basic Info Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-indigo-600 rounded-full"></div>
                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{lang === 'zh' ? '基本信息' : 'Basic Info'}</h4>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-500 ml-1">
                        {lang === 'zh' ? '智能体名称' : 'Agent Name'} <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder={lang === 'zh' ? '请输入智能体名称' : 'Please enter agent name'}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-xl p-2.5 px-4 text-xs font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 bg-white outline-none transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-500 ml-1">
                        {lang === 'zh' ? '智能体描述' : 'Agent Description'} <span className="text-rose-500">*</span>
                      </label>
                      <textarea 
                        placeholder={lang === 'zh' ? '请描述该智能体解决什么业务问题，服务于哪些用户，适用场景是什么...' : 'Please describe what business problem this agent solves...'}
                        className="w-full h-20 bg-slate-50/50 border border-slate-100 rounded-xl p-2.5 px-4 text-xs font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 bg-white outline-none transition-all resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* MCP Service Config Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-indigo-600 rounded-full"></div>
                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{lang === 'zh' ? 'MCP服务地址配置' : 'MCP Config'}</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="https://api.example.com/mcp/service"
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-xl p-2.5 px-4 text-xs font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 bg-white outline-none transition-all"
                      value={formData.mcpAddress}
                      onChange={(e) => setFormData({ ...formData, mcpAddress: e.target.value })}
                    />
                    <p className="text-[9px] font-bold text-slate-400 ml-1">
                      {lang === 'zh' ? '配置该智能体封装的MCP服务访问地址' : 'Configure the MCP service access address'}
                    </p>
                  </div>
                </div>

                {/* Skill Package Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-indigo-600 rounded-full"></div>
                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{lang === 'zh' ? '技能包配置' : 'Skills'} <span className="text-rose-500">*</span></h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-slate-100 bg-slate-50/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-indigo-200 transition-all group">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 mb-3 group-hover:scale-105 transition-transform">
                        <i className="fas fa-cloud-upload-alt text-xl"></i>
                      </div>
                      <span className="text-xs font-black text-slate-700">{lang === 'zh' ? '点击上传技能包' : 'Click to upload'}</span>
                      <span className="text-[9px] font-bold text-slate-400 mt-1">
                        {lang === 'zh' ? '支持 .zip、.tar.gz 格式，最大 50MB' : '.zip, .tar.gz, max 50MB'}
                      </span>
                    </div>

                    <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-3">
                      <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">
                        {lang === 'zh' ? '包含内容要求：' : 'Requirements:'}
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { icon: 'fa-file-alt', color: 'text-blue-500', bg: 'bg-blue-100/50', title: lang === 'zh' ? '运行描述文档' : 'Runtime Doc' },
                          { icon: 'fa-database', color: 'text-sky-500', bg: 'bg-sky-100/50', title: lang === 'zh' ? '数据模型描述' : 'Data Model' },
                          { icon: 'fa-box', color: 'text-indigo-500', bg: 'bg-indigo-100/50', title: lang === 'zh' ? '资源包描述' : 'Resources' },
                          { icon: 'fa-project-diagram', color: 'text-blue-600', bg: 'bg-blue-100/50', title: lang === 'zh' ? '对象类型定义' : 'Object types' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/50 border border-slate-50 shadow-sm">
                            <div className={`w-7 h-7 ${item.bg} ${item.color} rounded-md flex items-center justify-center flex-shrink-0 text-[10px]`}>
                              <i className={`fas ${item.icon}`}></i>
                            </div>
                            <span className="text-[10px] font-black text-slate-700 truncate">{item.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Sticky */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 z-10">
              <button 
                onClick={onClose}
                className="px-6 py-2 rounded-xl text-[11px] font-black text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-all"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button 
                className="px-8 py-2 rounded-xl text-[11px] font-black text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
              >
                <i className="fas fa-check text-[10px]"></i>
                {lang === 'zh' ? '注册智能体' : 'Register'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
