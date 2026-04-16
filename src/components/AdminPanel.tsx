
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../i18n';
import { Language, AuditLogEntry, FeedbackEntry } from '../types';
import { AdminModelManagement } from './AdminModelManagement';
import { AdminLLMManagement } from './AdminLLMManagement';
import { AdminLLMConfig } from './AdminLLMConfig';
import { AdminCorpusManagement } from './AdminCorpusManagement';
import { AdminTrainingSetManagement } from './AdminTrainingSetManagement';
import { AdminAgentManagement } from './AdminAgentManagement';
import { AdminSkillManagement } from './AdminSkillManagement';
import { AdminToolManagement } from './AdminToolManagement';
import { AdminWorkflowManagement } from './AdminWorkflowManagement';

interface AdminPanelProps {
  lang: Language;
}

// --- Mock Data ---

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    { 
        id: 'log-1', timestamp: '2024-05-20 14:30', user: '李明', mbu: '北海油田分析', type: 'QA', object: 'Notebook', summary: '查询孔隙度数据',
        details: {
            input: '请分析 A 区块 3 号井的孔隙度变化趋势。',
            output: '根据测井数据，A 区块 3 号井孔隙度随深度增加而降低...',
            evidence: [{ name: 'A-3-Log.las', type: 'Data', source: 'System' }, { name: 'A-3-Report.pdf', type: 'Doc', source: 'System' }],
            runRecord: [
                { step: 'Retrieval', io: 'Found 12 chunks', duration: '120ms' },
                { step: 'Reasoning', io: 'Chain-of-Thought', duration: '1.2s' },
                { step: 'Generation', io: 'Stream End', duration: '2.1s' }
            ]
        }
    },
    { 
        id: 'log-2', timestamp: '2024-05-20 15:15', user: '陈莎拉', mbu: '钻井优化', type: 'StatusChange', object: 'Workspace', summary: '变更工作空间状态',
        details: { input: 'Status: Draft', output: 'Status: Completed', evidence: [], runRecord: [
            { step: 'Validation', io: 'MBU Integrity Check Passed', duration: '0.5s'}
        ] }
    },
    { 
        id: 'log-3', timestamp: '2024-05-20 16:00', user: '王建国', mbu: '地震解释', type: 'ResourceEdit', object: 'Resource', summary: '上传新地震数据',
        details: { input: 'Upload: B-Block-Seismic-v2.segy', output: 'File Indexed', evidence: [], runRecord: [
            { step: 'Upload', io: '250MB', duration: '5s'},
            { step: 'Indexing', io: 'Vector DB Updated', duration: '1.2s'}
        ] }
    },
    { 
        id: 'log-4', timestamp: '2024-05-20 16:30', user: '李明', mbu: '北海油田分析', type: 'Save', object: 'Outcome', summary: '保存分析成果',
        details: { input: 'Save Message ID: msg-123 as Artifact', output: 'Artifact: gen-out-msg-123.md created', evidence: [], runRecord: [] }
    },
    { 
        id: 'log-5', timestamp: '2024-05-20 17:00', user: '赵丽', mbu: '油藏模拟', type: 'Generate', object: 'Report', summary: '生成季度模拟报告',
        details: { 
            input: 'Generate Report from Session', 
            output: 'Report Generated: Q1_Sim_Report.pdf', 
            evidence: [{ name: 'Sim-Data.xlsx', type: 'Table', source: 'Local'}], 
            runRecord: [{ step: 'Compilation', io: 'Merged 3 threads', duration: '3.5s'}] 
        }
    },
];

const MOCK_FEEDBACK: FeedbackEntry[] = [
    { id: 'fb-1', timestamp: '2024-05-19 09:00', user: '张伟', mbu: '南海勘探', notebookName: '风险评估 NB-01', type: 'Error', status: 'Pending', content: 'AI 对断层封闭性的判断与实际地震剖面不符，建议重新检索。', processor: '', result: '' },
    { id: 'fb-2', timestamp: '2024-05-19 11:20', user: '赵丽', mbu: '油藏模拟', notebookName: '注水方案 NB-03', type: 'Useful', status: 'Resolved', content: '本次模拟参数推荐非常准确，已采纳。', processor: '系统自动', result: '已记录评价' },
    { id: 'fb-3', timestamp: '2024-05-18 16:45', user: '李明', mbu: '北海油田', notebookName: '产量回顾 NB-02', type: 'WrongScope', status: 'Pending', content: '引用的数据包含未授权的 B 区块数据。', processor: '', result: '' },
    { id: 'fb-4', timestamp: '2024-05-17 14:00', user: '王建国', mbu: '地震解释', notebookName: '构造解释 NB-04', type: 'Error', status: 'Resolved', content: '层位追踪出现明显偏差。', processor: '管理员', result: '已修正知识库索引' },
];

type AdminModule = 'audit' | 'feedback' | 'agentManagement' | 'toolManagement' | 'skillManagement' | 'workflowManagement' | 'semanticManagement' | 'nerModelManagement' | 'llmManagement' | 'llmConfig' | 'corpusManagement' | 'trainingSetManagement';

export const AdminPanel: React.FC<AdminPanelProps> = ({ lang }) => {
  const t = translations[lang];
  const [activeModule, setActiveModule] = useState<AdminModule>('agentManagement');
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(true);
  const [pendingTrainingSet, setPendingTrainingSet] = useState<string | null>(null);
  
  // Drawer/Modal States
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackEntry | null>(null);

  // Feedback States
  const [feedbackStatusTab, setFeedbackStatusTab] = useState<'Pending' | 'Resolved'>('Pending');
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<string>('all');

  // --- Render Functions ---

  const renderSidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
        <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <i className="fas fa-shield-alt text-blue-600 mr-2"></i> {t.adminPanel}
            </h2>
            <p className="text-xs text-gray-500 mt-1">{t.adminSubtitle}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {[
                { id: 'agentManagement', label: lang === 'zh' ? '智能体管理' : 'Agent Management', icon: 'fa-robot' },
                { id: 'toolManagement', label: t.toolManagement, icon: 'fa-tools' },
                { id: 'skillManagement', label: t.skillsManagement, icon: 'fa-toolbox' },
                { id: 'workflowManagement', label: lang === 'zh' ? '模板管理' : 'Template Management', icon: 'fa-project-diagram' },
                { id: 'semanticManagement', label: t.semanticManagement, icon: 'fa-brain' },
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id as AdminModule)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        activeModule === item.id 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    <i className={`fas ${item.icon} w-6 text-center mr-2 ${activeModule === item.id ? 'text-blue-600' : 'text-gray-400'}`}></i>
                    {item.label}
                </button>
            ))}

            {/* Nested Model Management */}
            <div className="space-y-1">
                <button
                    onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900`}
                >
                    <div className="flex items-center">
                        <i className={`fas fa-microchip w-6 text-center mr-2 text-gray-400`}></i>
                        {t.modelManagement}
                    </div>
                    <i className={`fas fa-chevron-${isModelMenuOpen ? 'down' : 'right'} text-[10px] text-gray-400`}></i>
                </button>
                
                <AnimatePresence>
                    {isModelMenuOpen && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-8 space-y-1"
                        >
                            {[
                                { id: 'nerModelManagement', label: t.nerModelManagement, icon: 'fa-tags' },
                                { id: 'corpusManagement', label: t.corpusManagement, icon: 'fa-database' },
                                { id: 'trainingSetManagement', label: t.trainingSetManagement, icon: 'fa-layer-group' },
                                { id: 'llmManagement', label: t.llmManagement, icon: 'fa-brain' },
                                { id: 'llmConfig', label: t.llmConfig, icon: 'fa-sliders-h' },
                            ].map((sub) => (
                                <button
                                    key={sub.id}
                                    onClick={() => setActiveModule(sub.id as AdminModule)}
                                    className={`w-full flex items-center px-4 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                                        activeModule === sub.id 
                                        ? 'bg-blue-50 text-blue-700' 
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <i className={`fas ${sub.icon} w-5 text-center mr-2 ${activeModule === sub.id ? 'text-blue-600' : 'text-gray-400'}`}></i>
                                    {sub.label}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-1 bg-gray-50/50">
            {[
                { id: 'audit', label: t.userQaLogs, icon: 'fa-history' },
                { id: 'feedback', label: t.feedbackProcessing, icon: 'fa-comments' },
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id as AdminModule)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        activeModule === item.id 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    <i className={`fas ${item.icon} w-6 text-center mr-2 ${activeModule === item.id ? 'text-blue-600' : 'text-gray-400'}`}></i>
                    {item.label}
                </button>
            ))}
        </div>

    </div>
  );

  const renderAuditLogs = () => (
    <div className="h-full flex flex-col bg-gray-50 relative">
        <div className="p-6 border-b border-gray-200 bg-white shadow-sm flex justify-between items-center">
             <h2 className="text-xl font-bold text-gray-800">{t.auditLogs}</h2>
             <div className="flex gap-2">
                 <input type="text" placeholder="Search logs..." className="border rounded px-3 py-1.5 text-sm w-64" />
                 <button className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded text-sm hover:bg-gray-200"><i className="fas fa-filter"></i></button>
             </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3">{t.colTime}</th>
                            <th className="px-6 py-3">{t.colUser}</th>
                            <th className="px-6 py-3">{t.colMbu}</th>
                            <th className="px-6 py-3">{t.colType}</th>
                            <th className="px-6 py-3">{t.colObject}</th>
                            <th className="px-6 py-3">{t.colSummary}</th>
                            <th className="px-6 py-3 text-right">{t.colAction}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {MOCK_AUDIT_LOGS.map(log => (
                            <tr key={log.id} className="hover:bg-blue-50 transition-colors">
                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{log.timestamp}</td>
                                <td className="px-6 py-4 font-medium text-gray-800">{log.user}</td>
                                <td className="px-6 py-4 text-gray-600">{log.mbu}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        log.type === 'QA' ? 'bg-blue-100 text-blue-700' : 
                                        log.type === 'StatusChange' ? 'bg-purple-100 text-purple-700' :
                                        log.type === 'ResourceEdit' ? 'bg-orange-100 text-orange-700' :
                                        log.type === 'Save' ? 'bg-green-100 text-green-700' :
                                        log.type === 'Generate' ? 'bg-teal-100 text-teal-700' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {log.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{log.object}</td>
                                <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{log.summary}</td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => setSelectedLog(log)}
                                        className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 px-3 py-1 rounded hover:bg-blue-50"
                                    >
                                        {t.viewDetail}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Drawer */}
        {selectedLog && (
            <div className="absolute inset-0 z-20 overflow-hidden flex justify-end bg-gray-900/20 backdrop-blur-sm">
                <div className="w-[600px] bg-white h-full shadow-2xl flex flex-col animate-[slideInRight_0.3s_ease-out]">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-800">{t.auditDetail}</h3>
                        <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-lg"></i></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Block 1: Basic Info */}
                        <section>
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">{t.basicInfo}</h4>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div><span className="text-gray-500 text-xs block mb-1">ID</span><span className="text-sm font-mono">{selectedLog.id}</span></div>
                                <div><span className="text-gray-500 text-xs block mb-1">{t.colTime}</span><span className="text-sm">{selectedLog.timestamp}</span></div>
                                <div><span className="text-gray-500 text-xs block mb-1">{t.colUser}</span><span className="text-sm font-bold">{selectedLog.user}</span></div>
                                <div><span className="text-gray-500 text-xs block mb-1">{t.colMbu}</span><span className="text-sm text-blue-600">{selectedLog.mbu}</span></div>
                                <div><span className="text-gray-500 text-xs block mb-1">{t.colType}</span><span className="text-sm font-bold">{selectedLog.type}</span></div>
                                <div><span className="text-gray-500 text-xs block mb-1">{t.colObject}</span><span className="text-sm">{selectedLog.object}</span></div>
                            </div>
                        </section>

                        {/* Block 2: Input / Action */}
                        <section>
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">{t.originalInput} / Action Data</h4>
                            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900 border border-blue-100">
                                {selectedLog.details.input}
                            </div>
                        </section>

                        {/* Block 3: Output / Result */}
                        {selectedLog.details.output && (
                            <section>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">{t.aiOutput} / Result</h4>
                                <div className="bg-white p-4 rounded-lg text-sm text-gray-800 border border-gray-200 shadow-sm">
                                    {selectedLog.details.output}
                                </div>
                            </section>
                        )}

                        {/* Block 4: Evidence */}
                        {selectedLog.details.evidence.length > 0 && (
                             <section>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">{t.evidenceCited}</h4>
                                <div className="space-y-2">
                                    {selectedLog.details.evidence.map((ev, i) => (
                                        <div key={i} className="flex items-center p-2 bg-white border border-gray-200 rounded text-sm">
                                            <span className="w-5 h-5 bg-green-100 text-green-600 rounded flex items-center justify-center text-xs mr-3 font-bold">{i+1}</span>
                                            <span className="flex-1 font-medium text-gray-700">{ev.name}</span>
                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{ev.type}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Block 5: RunRecord */}
                        {selectedLog.details.runRecord.length > 0 && (
                             <section>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">{t.runRecord}</h4>
                                <div className="relative pl-4 border-l-2 border-gray-200 space-y-4">
                                    {selectedLog.details.runRecord.map((run, i) => (
                                        <div key={i} className="relative">
                                            <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-300 border-2 border-white"></div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-bold text-gray-800">{run.step}</span>
                                                <span className="text-xs font-mono text-gray-400">{run.duration}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-mono">{run.io}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );

  const renderFeedback = () => {
    // Filter logic
    const filteredFeedback = MOCK_FEEDBACK.filter(fb => {
        const matchesStatus = fb.status === feedbackStatusTab;
        const matchesType = feedbackTypeFilter === 'all' || fb.type === feedbackTypeFilter;
        return matchesStatus && matchesType;
    });

    return (
    <div className="h-full flex flex-col bg-gray-50">
        <div className="p-6 border-b border-gray-200 bg-white shadow-sm flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">{t.feedbackGov}</h2>
        </div>
        
        {/* Toolbar: Tabs & Filters */}
        <div className="px-6 py-4 flex justify-between items-center bg-white border-b border-gray-100">
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                    onClick={() => setFeedbackStatusTab('Pending')}
                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${feedbackStatusTab === 'Pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {t.tabPending}
                </button>
                <button 
                    onClick={() => setFeedbackStatusTab('Resolved')}
                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${feedbackStatusTab === 'Resolved' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {t.tabResolved}
                </button>
            </div>
            
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">{t.colFeedbackType}:</span>
                <select 
                    value={feedbackTypeFilter}
                    onChange={(e) => setFeedbackTypeFilter(e.target.value)}
                    className="border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                    <option value="all">{t.filterAllTypes}</option>
                    <option value="Useful">Useful</option>
                    <option value="Error">Error</option>
                    <option value="WrongScope">WrongScope</option>
                </select>
            </div>
        </div>

        <div className="flex-1 p-6 overflow-hidden flex gap-6">
            {/* List */}
            <div className={`flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col transition-all ${selectedFeedback ? 'w-1/2' : 'w-full'}`}>
                 <div className="overflow-y-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">{t.colTime}</th>
                                <th className="px-6 py-3">{t.colFeedbackType}</th>
                                <th className="px-6 py-3">{t.colNotebook}</th>
                                {feedbackStatusTab === 'Resolved' && <th className="px-6 py-3">{t.colProcessor}</th>}
                                {feedbackStatusTab === 'Resolved' && <th className="px-6 py-3">{t.colResult}</th>}
                                {feedbackStatusTab === 'Pending' && <th className="px-6 py-3">{t.colStatus}</th>}
                                <th className="px-6 py-3 text-right">{t.colAction}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFeedback.map(fb => (
                                <tr key={fb.id} className={`hover:bg-blue-50 transition-colors cursor-pointer ${selectedFeedback?.id === fb.id ? 'bg-blue-50' : ''}`} onClick={() => setSelectedFeedback(fb)}>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{fb.timestamp}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${fb.type === 'Error' ? 'bg-red-100 text-red-700' : fb.type === 'Useful' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {fb.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">{fb.notebookName}</td>
                                    {feedbackStatusTab === 'Resolved' && (
                                        <>
                                            <td className="px-6 py-4 text-gray-700">{fb.processor || '-'}</td>
                                            <td className="px-6 py-4 text-gray-600 truncate max-w-[120px]" title={fb.result}>{fb.result || '-'}</td>
                                        </>
                                    )}
                                    {feedbackStatusTab === 'Pending' && (
                                        <td className="px-6 py-4">
                                            <span className={`text-xs flex items-center ${fb.status === 'Pending' ? 'text-orange-500' : 'text-green-500'}`}>
                                                <i className={`fas ${fb.status === 'Pending' ? 'fa-clock' : 'fa-check-circle'} mr-1`}></i>
                                                {fb.status}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">{t.process}</button>
                                    </td>
                                </tr>
                            ))}
                            {filteredFeedback.length === 0 && (
                                <tr>
                                    <td colSpan={feedbackStatusTab === 'Resolved' ? 6 : 5} className="px-6 py-8 text-center text-gray-400 italic">
                                        {t.noFeedbackRecords}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
            </div>

            {/* Processing Detail */}
            {selectedFeedback && (
                <div className="w-[500px] bg-white rounded-lg border border-gray-200 shadow-lg flex flex-col animate-[fadeIn_0.2s_ease-out]">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <h3 className="font-bold text-gray-800">{t.feedbackProcessing}</h3>
                        <button onClick={() => setSelectedFeedback(null)} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times"></i></button>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                         {/* User Feedback */}
                         <div>
                            <label className="text-xs font-bold text-red-500 uppercase mb-2 block">{t.userFeedback}</label>
                            <div className="bg-red-50 p-3 rounded border border-red-100 text-sm text-red-900 leading-relaxed">
                                {selectedFeedback.content}
                            </div>
                         </div>

                         {/* Context / Original (Mocked) */}
                         <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">{t.originalConclusion}</label>
                            <div className="bg-gray-50 p-3 rounded border border-gray-100 text-sm text-gray-600 leading-relaxed">
                                (AI 原始回答内容片段...) <br/>
                                根据地震剖面解释，断层 F1 具有良好的封闭性，未见明显的油气渗漏迹象...
                            </div>
                         </div>

                         {/* Revision Input */}
                         <div>
                            <label className="text-xs font-bold text-blue-500 uppercase mb-2 block">{t.revisionSuggestion}</label>
                            <textarea className="w-full h-32 border border-gray-300 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={t.enterRevision}></textarea>
                         </div>
                    </div>
                    <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex gap-3">
                         <button onClick={() => alert('已写入知识库')} className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-bold hover:bg-blue-700 shadow-sm">{t.writeToKb}</button>
                         <button onClick={() => alert('已转入成果审核')} className="flex-1 bg-indigo-500 text-white py-2 rounded text-sm font-bold hover:bg-indigo-600 shadow-sm">{t.convertToOutcome}</button>
                         <button onClick={() => setSelectedFeedback(null)} className="px-4 py-2 border border-gray-300 text-gray-600 rounded text-sm hover:bg-gray-100">{t.ignore}</button>
                    </div>
                </div>
            )}
        </div>
    </div>
    );
  };

  const renderPlaceholder = (title: string, icon: string) => (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
        <i className={`fas ${icon} text-6xl mb-4 opacity-20`}></i>
        <h2 className="text-xl font-bold text-gray-600 mb-2">{title}</h2>
        <p className="text-sm">{t.underConstruction}</p>
    </div>
  );

  const renderSemanticManagement = () => (
    <div className="h-full p-6 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t.semanticManagement}</h2>
        <p className="text-gray-600">{t.semanticManagementDesc}</p>
    </div>
  );

  const renderNERModelManagement = () => (
    <AdminModelManagement 
      lang={lang} 
      pendingTrainingSet={pendingTrainingSet} 
      onClearPending={() => setPendingTrainingSet(null)}
    />
  );

  const renderLLMManagement = () => (
    <AdminLLMManagement lang={lang} />
  );

  const renderLLMConfig = () => (
    <AdminLLMConfig lang={lang} />
  );

  const renderCorpusManagement = () => (
    <AdminCorpusManagement lang={lang} />
  );

  const renderTrainingSetManagement = () => (
    <AdminTrainingSetManagement 
      lang={lang} 
      onTrainRequest={(version) => {
        setPendingTrainingSet(version);
        setActiveModule('nerModelManagement');
      }}
    />
  );

  return (
    <div className="flex h-full w-full">
      {renderSidebar()}
      <div className="flex-1 min-w-0">
         {activeModule === 'audit' && renderAuditLogs()}
         {activeModule === 'feedback' && renderFeedback()}
         {activeModule === 'agentManagement' && <AdminAgentManagement lang={lang} />}
         {activeModule === 'skillManagement' && <AdminSkillManagement lang={lang} />}
         {activeModule === 'toolManagement' && <AdminToolManagement lang={lang} />}
         {activeModule === 'workflowManagement' && <AdminWorkflowManagement lang={lang} />}
         {activeModule === 'semanticManagement' && renderSemanticManagement()}
         {activeModule === 'nerModelManagement' && renderNERModelManagement()}
         {activeModule === 'llmManagement' && renderLLMManagement()}
         {activeModule === 'llmConfig' && renderLLMConfig()}
         {activeModule === 'corpusManagement' && renderCorpusManagement()}
         {activeModule === 'trainingSetManagement' && renderTrainingSetManagement()}
      </div>
    </div>
  );
};
