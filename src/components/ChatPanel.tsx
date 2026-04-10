
import React, { useState, useRef, useEffect } from 'react';
import { Message, ResourceNode, Language, Workspace } from '../types';
import { generateResponse, initializeGemini } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { translations } from '../i18n';

// --- Subcomponent for rendering individual messages ---
const ChatMessageItem = ({ 
  msg, 
  onSelectMessage, 
  t, 
  onEditReport, 
  handleDownload, 
  handleCopy, 
  copiedId, 
  handleRegenerate, 
  getLastUserQuery, 
  handleFeedback, 
  feedbackState, 
  handleSaveArtifact, 
  savedArtifactIds, 
  processContent, 
  flatResources 
}: any) => {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(true);

  if (msg.role === 'user') {
    return (
      <div 
        onClick={() => onSelectMessage(msg)}
        className="flex justify-end group cursor-pointer mb-8"
      >
        <div className="max-w-3xl bg-[#E8F0FE] text-slate-800 px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm border border-[#D2E3FC]">
          <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onSelectMessage(msg)}
      className="flex justify-start group cursor-pointer mb-8 w-full"
    >
      {/* Avatar */}
      <div className="w-8 h-8 mr-4 flex-shrink-0 mt-1">
        <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 font-bold text-lg border border-slate-200">
          <i className="fas fa-times"></i>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 max-w-4xl">
        {/* Reasoning Section (Collapsible) */}
        <div className="mb-3">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsReasoningExpanded(!isReasoningExpanded); }}
            className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors border border-slate-200"
          >
            <i className="fas fa-shield-alt text-indigo-400"></i>
            <span>思考推理已完成</span>
            <i className={`fas fa-chevron-down text-[10px] text-slate-400 ml-1 transition-transform ${isReasoningExpanded ? 'rotate-180' : ''}`}></i>
          </button>
          
          {/* Expanded Reasoning Steps (Mock) */}
          {isReasoningExpanded && (
            <div className="mt-4 ml-3 border-l-2 border-indigo-100 pl-5 space-y-5 pb-2">
              <div className="relative">
                <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-4 ring-[#F4F7FC]"></div>
                <h4 className="text-sm font-bold text-slate-700 mb-2">问题理解</h4>
                <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-100 shadow-sm leading-relaxed">
                  识别到以下关键信息：<br/>
                  <div className="mt-2 mb-2">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded mr-2 border border-indigo-100">EB-1</span>
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">日产油量</span>
                  </div>
                  你要查找的是：EB-1在2023-05-01到2023-05-31日产油量的最大值，最小值，平均值
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-4 ring-[#F4F7FC]"></div>
                <h4 className="text-sm font-bold text-slate-700 mb-2">问题处理</h4>
                <div className="text-xs text-slate-600 space-y-2">
                  <div className="flex items-start gap-2">
                    <i className="fas fa-check-circle text-indigo-500 mt-0.5"></i>
                    <span>选择【NL2SQL数据查询】智能体处理问题。</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="fas fa-check-circle text-indigo-500 mt-0.5"></i>
                    <span>执行【查询数据集】工具。找到多个可能的数据项，请选择：<span className="text-indigo-600 font-medium">勘探开发部油井汇总数据表_日产油量</span></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="fas fa-check-circle text-indigo-500 mt-0.5"></i>
                    <span>执行【组装sql】工具。</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="fas fa-check-circle text-indigo-500 mt-0.5"></i>
                    <span>执行【sql查询数据】工具。</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-4 ring-[#F4F7FC]"></div>
                <h4 className="text-sm font-bold text-slate-700">完成思考推理，回答如下</h4>
              </div>
            </div>
          )}
        </div>

        {/* Final Answer Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative">
          {msg.contentType === 'report' && (
              <div className="mb-4 bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center text-slate-600 text-xs font-bold uppercase tracking-wide">
                      <i className="fas fa-file-alt mr-2 text-indigo-500"></i> Generated Report
                  </div>
                  <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); onEditReport(msg.content, msg.id); }} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold bg-white border border-indigo-100 px-3 py-1.5 rounded-md hover:bg-indigo-50 transition-colors shadow-sm">
                          <i className="fas fa-edit mr-1"></i> {t.edit || 'Edit'}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDownload(msg.content, msg.id); }} className="text-slate-500 hover:text-slate-700 text-xs bg-white border border-slate-200 px-2 py-1.5 rounded-md hover:bg-slate-50 transition-colors shadow-sm">
                          <i className="fas fa-download"></i>
                      </button>
                  </div>
              </div>
          )}

          <div className="prose prose-sm max-w-none text-slate-800 prose-headings:text-slate-900 prose-a:text-indigo-600">
            <ReactMarkdown
                components={{
                    a: ({node, href, children, ...props}) => {
                        if (href?.startsWith('source:')) {
                            const fileName = href.replace('source:', '');
                            let index = -1;
                            if (msg.relatedSources) {
                                const relatedNodes = msg.relatedSources.map((id: string) => flatResources.current.find((r: any) => r.id === id));
                                index = relatedNodes.findIndex((r: any) => r?.name.trim() === fileName.trim());
                            }
                            const displayNum = index !== -1 ? index + 1 : '?';
                            return (
                                <span 
                                className="text-indigo-600 font-bold text-xs cursor-help mx-0.5 select-none hover:underline bg-indigo-50 px-1 rounded border border-indigo-100" 
                                title={`来源: ${fileName}`}
                                >
                                    [{displayNum}]
                                </span>
                            );
                        }
                        return <a href={href} className="text-indigo-600 underline hover:text-indigo-800" {...props}>{children}</a>
                    },
                    code: ({node, className, children, ...props}) => {
                        return <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
                    }
                }}
            >
                {processContent(msg.content)}
            </ReactMarkdown>
          </div>

          {/* Mock Result UI */}
          {msg.isMockResult && (
            <div className="mt-6">
              <h4 className="font-bold text-slate-800 mb-4">查询到的结果：</h4>
              <div className="border border-slate-100 rounded-lg p-6 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">最大行数</span>
                    <input type="number" value="50" className="border border-slate-200 rounded px-2 py-1 w-16 text-sm text-slate-600 outline-none" readOnly />
                  </div>
                  <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <button className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-white rounded-md transition-colors">SQL语句</button>
                    <button className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-white rounded-md transition-colors">数据</button>
                    <button className="px-4 py-1.5 text-xs font-bold text-blue-600 bg-white shadow-sm rounded-md border border-slate-100">可视化</button>
                  </div>
                </div>
                <div className="flex justify-end mb-6">
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <i className="fas fa-download"></i>
                  </button>
                </div>
                <div className="grid grid-cols-3 divide-x divide-slate-100 py-4">
                  <div className="text-center">
                    <div className="text-sm text-slate-600 mb-3">日产油量平均值</div>
                    <div className="text-[14px] text-blue-500 font-bold">655.19</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-600 mb-3">日产油量最大值</div>
                    <div className="text-[14px] text-blue-500 font-bold">934.08</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-600 mb-3">日产油量最小值</div>
                    <div className="text-[14px] text-blue-500 font-bold">459.28</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Bar */}
          <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center select-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center gap-2">
                 <button 
                    onClick={(e) => { e.stopPropagation(); handleSaveArtifact(msg); }}
                    disabled={savedArtifactIds.has(msg.id)}
                    className={`text-[10px] px-2.5 py-1.5 rounded-md transition-colors flex items-center font-medium ${
                        savedArtifactIds.has(msg.id) 
                        ? 'bg-green-100 text-green-700 cursor-default border border-green-200'
                        : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm'
                    }`}
                 >
                    <i className={`fas ${savedArtifactIds.has(msg.id) ? 'fa-check-circle' : 'fa-save'} mr-1.5`}></i> 
                    {savedArtifactIds.has(msg.id) ? '已保存' : t.saveArtifact}
                 </button>
            </div>
            <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleCopy(msg.content, msg.id); }}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded hover:bg-slate-100 transition-colors"
                  title="复制"
                >
                   <i className={`fas ${copiedId === msg.id ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
                </button>
                <button 
                   onClick={(e) => { e.stopPropagation(); handleRegenerate(getLastUserQuery()); }}
                   className="text-slate-400 hover:text-slate-600 p-1.5 rounded hover:bg-slate-100 transition-colors"
                   title="重新生成"
                >
                   <i className="fas fa-redo-alt"></i>
                </button>
                <button 
                   onClick={(e) => { e.stopPropagation(); handleFeedback(msg.id, 'like'); }}
                   className={`p-1.5 rounded transition-colors ${feedbackState[msg.id] === 'like' ? 'text-green-500 bg-green-50' : 'text-slate-400 hover:text-green-500 hover:bg-slate-100'}`}
                   title="有帮助"
                >
                   <i className="fas fa-thumbs-up"></i>
                </button>
                <button 
                   onClick={(e) => { e.stopPropagation(); handleFeedback(msg.id, 'dislike'); }}
                   className={`p-1.5 rounded transition-colors ${feedbackState[msg.id] === 'dislike' ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-500 hover:bg-slate-100'}`}
                   title="无帮助"
                >
                   <i className="fas fa-thumbs-down"></i>
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ChatPanelProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  selectedResources: Set<string>;
  allResources: ResourceNode[];
  onSelectMessage: (msg: Message) => void;
  onChatStart: () => void; // Callback to open trace panel
  onAddResource: (parentId: string, resource: ResourceNode) => void;
  currentWorkspace?: Workspace;
  onUpdateWorkspaceName?: (name: string) => void;
  lang: Language;
  onEditReport: (content: string, msgId: string) => void;
  onToggleTracePanel?: () => void;
  isTracePanelOpen?: boolean;
}

// Flatten for context lookup
const flattenTree = (nodes: ResourceNode[]): ResourceNode[] => {
  let flat: ResourceNode[] = [];
  nodes.forEach(node => {
    flat.push(node);
    if (node.children) {
      flat = flat.concat(flattenTree(node.children));
    }
  });
  return flat;
};

export const ChatPanel: React.FC<ChatPanelProps> = ({ 
  messages, 
  setMessages, 
  selectedResources, 
  allResources,
  onSelectMessage,
  onChatStart,
  onAddResource,
  currentWorkspace,
  onUpdateWorkspaceName,
  lang,
  onEditReport,
  onToggleTracePanel,
  isTracePanelOpen
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [savedArtifactIds, setSavedArtifactIds] = useState<Set<string>>(new Set());

  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  // Save Outcome Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [targetMbuId, setTargetMbuId] = useState<string>('');
  const [isPublicOutcome, setIsPublicOutcome] = useState(false);
  const [messageToSave, setMessageToSave] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const flatResources = useRef<ResourceNode[]>(flattenTree(allResources));
  const t = translations[lang];

  // Get MBU List for Selection
  const mbuList = React.useMemo(() => {
      const getMbus = (nodes: ResourceNode[]): ResourceNode[] => {
          let mbus: ResourceNode[] = [];
          nodes.forEach(node => {
              if (node.type === 'mbu') mbus.push(node);
              if (node.children) mbus = mbus.concat(getMbus(node.children));
          });
          return mbus;
      };
      return getMbus(allResources);
  }, [allResources]);

  useEffect(() => {
    initializeGemini();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (currentWorkspace) {
        setTempName(currentWorkspace.name);
    }
  }, [currentWorkspace]);

  const saveName = () => {
      if (tempName.trim() && onUpdateWorkspaceName) {
          onUpdateWorkspaceName(tempName.trim());
      } else {
          setTempName(currentWorkspace?.name || '');
      }
      setIsEditingName(false);
  };

  const generateAIResponse = async (history: Message[], userInput: string, forceReport = false) => {
    setIsLoading(true);

    // Prepare Context from selected resources
    const contextStrings = flatResources.current
      .filter(r => selectedResources.has(r.id))
      .map(r => `[Type: ${r.type}] Name: ${r.name} ${r.meta ? JSON.stringify(r.meta) : ''}`)
      .join('\n');

    const responseText = await generateResponse(
      history, 
      contextStrings || "No specific MBU resources selected.",
      t.systemInstruction
    );

    const usedSourceIds = flatResources.current
      .filter(r => selectedResources.has(r.id))
      .map(r => r.id);
    
    // Auto-detect report type from keywords if not forced (simple heuristic)
    const isReport = forceReport || userInput.includes('report') || userInput.includes('报告');

    const aiMsg: Message = {
      id: Date.now().toString(),
      role: 'model',
      content: responseText,
      timestamp: Date.now(),
      isTemp: true,
      relatedSources: usedSourceIds,
      contentType: isReport ? 'report' : 'text'
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
    onSelectMessage(aiMsg);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    onChatStart();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    onSelectMessage(userMsg);
    
    await generateAIResponse([...messages, userMsg], input);
  };

  const handleRegenerate = async (originalQuery: string) => {
    if (!originalQuery) return;
    await generateAIResponse(messages, originalQuery);
  };

  const getLastUserQuery = (): string => {
      const userMsgs = messages.filter(m => m.role === 'user');
      return userMsgs.length > 0 ? userMsgs[userMsgs.length - 1].content : '';
  };

  const handleCopy = (content: string, id: string) => {
      navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (content: string, id: string) => {
     const blob = new Blob([content], { type: 'text/markdown' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `report-${id}.md`;
     a.click();
     URL.revokeObjectURL(url);
  };

  const handleFeedback = (id: string, type: 'like' | 'dislike') => {
      setFeedbackState(prev => ({
          ...prev,
          [id]: prev[id] === type ? null : type
      }));
  };

  const handleSaveArtifact = (msg: Message) => {
      if (savedArtifactIds.has(msg.id)) return;
      setMessageToSave(msg);
      setIsSaveModalOpen(true);
      if (mbuList.length > 0) {
          setTargetMbuId(mbuList[0].id);
      }
      setIsPublicOutcome(false); // Default private
  };

  const handleConfirmSave = () => {
      if (!messageToSave || !targetMbuId) return;

      const title = `AI Outcome - ${new Date(messageToSave.timestamp).toLocaleTimeString()}`;
      const newArtifact: ResourceNode = {
          id: `gen-out-${messageToSave.id}`,
          name: `${title}.md`,
          type: 'artifact',
          meta: {
              sourceType: 'local',
              fileType: 'Outcome',
              date: new Date().toISOString(),
              isPublic: isPublicOutcome,
              content: messageToSave.content
          }
      };

      // Add to selected MBU
      onAddResource(targetMbuId, newArtifact);
      
      setSavedArtifactIds(prev => {
          const next = new Set(prev);
          next.add(messageToSave.id);
          return next;
      });

      setIsSaveModalOpen(false);
      setMessageToSave(null);
  };

  const handleShortcut = (type: string) => {
    onChatStart(); 
    let prompt = "";
    switch(type) {
      case 'summary': prompt = lang === 'zh' ? "请提供所选资源的摘要。" : "Please provide a summary of the selected resources."; break;
      case 'report': prompt = lang === 'zh' ? "根据所选发现起草正式报告。" : "Draft a formal report based on the selected findings."; break;
      case 'chart': prompt = lang === 'zh' ? "描述所选 Excel 文件中适合制作图表的数据趋势。" : "Describe the data trends in the selected Excel files suitable for a chart."; break;
    }
    // Directly generate for report
    if (type === 'report') {
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: prompt, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        onSelectMessage(userMsg);
        generateAIResponse([...messages, userMsg], prompt, true); // Force report type
    } else {
        setInput(prompt);
    }
  };

  // Helper: Pre-process content to turn custom citation syntax [[Source: name]] into Markdown links
  const processContent = (content: string) => {
      return content.replace(/\[\[Source: (.*?)\]\]/g, '[$1](source:$1)');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="h-16 border-b border-slate-200 bg-white flex items-center px-6 justify-between shadow-sm z-10">
        <div className="flex items-center group">
          {isEditingName ? (
              <input 
                autoFocus
                type="text"
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                onBlur={saveName}
                onKeyDown={e => e.key === 'Enter' && saveName()}
                className="text-lg font-bold text-slate-800 border-b-2 border-indigo-500 focus:outline-none px-1 bg-transparent"
              />
          ) : (
             <div 
                onClick={() => setIsEditingName(true)}
                className="flex items-center cursor-pointer hover:bg-slate-50 px-2 py-1.5 -ml-2 rounded-lg transition-colors"
                title="点击修改名称"
             >
                 <h1 className="text-lg font-bold text-slate-800">{currentWorkspace?.name || t.newWorkspace}</h1>
                 <i className="fas fa-pencil-alt ml-2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
             </div>
          )}
          
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <div className="w-20 h-20 bg-slate-200 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-robot text-4xl text-slate-400"></i>
            </div>
            <p className="text-xl font-bold text-slate-600">{t.emptyChatTitle}</p>
            <p className="text-sm text-slate-400 mt-2">{t.emptyChatSubtitle}</p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessageItem 
            key={msg.id}
            msg={msg}
            onSelectMessage={onSelectMessage}
            t={t}
            onEditReport={onEditReport}
            handleDownload={handleDownload}
            handleCopy={handleCopy}
            copiedId={copiedId}
            handleRegenerate={handleRegenerate}
            getLastUserQuery={getLastUserQuery}
            handleFeedback={handleFeedback}
            feedbackState={feedbackState}
            handleSaveArtifact={handleSaveArtifact}
            savedArtifactIds={savedArtifactIds}
            processContent={processContent}
            flatResources={flatResources}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start ml-2">
             <div className="bg-white rounded-2xl rounded-bl-none p-4 shadow-sm border border-slate-100 flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] z-20">
        
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t.chatPlaceholder}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none shadow-inner transition-all"
            rows={1}
            style={{ minHeight: '3.5rem' }}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 top-2 bottom-2 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
              input.trim() && !isLoading ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transform hover:scale-105' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-3">
          {t.aiDisclaimer}
        </p>
      </div>

      {/* Save Outcome Modal */}
      {isSaveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-[400px] animate-[fadeIn_0.2s_ease-out]">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <i className="fas fa-save text-indigo-600 mr-2"></i>
                      {t.saveOutcomeTitle}
                  </h3>
                  
                  <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.selectMbu}</label>
                      <select 
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={targetMbuId}
                          onChange={e => setTargetMbuId(e.target.value)}
                      >
                          {mbuList.length === 0 && <option value="">{t.noMbuSelected}</option>}
                          {mbuList.map(mbu => (
                              <option key={mbu.id} value={mbu.id}>{mbu.name}</option>
                          ))}
                      </select>
                  </div>

                  <div className="mb-6">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.outcomeVisibility}</label>
                      <div className="flex gap-4">
                          <label className={`flex-1 flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${!isPublicOutcome ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                              <input 
                                  type="radio" 
                                  name="visibility" 
                                  className="hidden" 
                                  checked={!isPublicOutcome} 
                                  onChange={() => setIsPublicOutcome(false)} 
                              />
                              <i className="fas fa-lock text-gray-500 mr-2"></i>
                              <span className={`text-sm font-medium ${!isPublicOutcome ? 'text-indigo-700' : 'text-gray-600'}`}>{t.privateOutcome}</span>
                          </label>
                          <label className={`flex-1 flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${isPublicOutcome ? 'bg-green-50 border-green-200 ring-1 ring-green-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                              <input 
                                  type="radio" 
                                  name="visibility" 
                                  className="hidden" 
                                  checked={isPublicOutcome} 
                                  onChange={() => setIsPublicOutcome(true)} 
                              />
                              <i className="fas fa-globe text-green-500 mr-2"></i>
                              <span className={`text-sm font-medium ${isPublicOutcome ? 'text-green-700' : 'text-gray-600'}`}>{t.publicOutcome}</span>
                          </label>
                      </div>
                  </div>

                  <div className="flex justify-end gap-3">
                      <button onClick={() => setIsSaveModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded">{t.cancel}</button>
                      <button 
                          onClick={handleConfirmSave}
                          disabled={!targetMbuId}
                          className={`px-6 py-2 text-white font-bold rounded shadow-sm transition-colors ${!targetMbuId ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                      >
                          {t.confirmSave}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
