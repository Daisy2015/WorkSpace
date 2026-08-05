import React, { useState, useRef, useEffect } from 'react';
import { Message, ResourceNode, Language, Workspace, Agent } from '../types';
import { translations } from '../i18n';
import { UserMessageCard, UnifiedResponseCard } from './MultiAgentCards';
import { MOCK_SKILLS } from './AdminSkillManagement';

interface MultiAgentChatPanelProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  selectedResources: Set<string>;
  allResources: ResourceNode[];
  onSelectMessage: (msg: Message | null) => void;
  onChatStart: () => void;
  onAddResource: (parentId: string, node: ResourceNode) => void;
  currentWorkspace: Workspace | null;
  onUpdateWorkspaceName: (name: string) => void;
  lang: Language;
  onEditReport: (content: string, id: string) => void;
  onToggleTracePanel: () => void;
  isTracePanelOpen: boolean;
  agents: Agent[];
  workspaceVersion?: 'foundation' | 'professional' | 'enterprise';
  onSaveOutcome?: (name: string) => void;
  isMiniAssistant?: boolean;
  onViewEvidence?: () => void;
}

export const MultiAgentChatPanel: React.FC<MultiAgentChatPanelProps> = ({
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
  isTracePanelOpen,
  agents,
  workspaceVersion = 'foundation',
  onSaveOutcome,
  isMiniAssistant = false,
  onViewEvidence
}) => {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSkillMenu, setShowSkillMenu] = useState(false);
  const [skillFilter, setSkillFilter] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string; size: string; file: File }[]>([]);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [sessionActionOpen, setSessionActionOpen] = useState<string | null>(null);
  const [historySessions, setHistorySessions] = useState([
    { id: 'h1', title: 'X-1井产量下降分析', date: '2026-05-19 14:30', preview: '分析 X-1井近7天产量下降原因...', isPinned: false },
    { id: 'h2', title: '日产量变化统计', date: '2026-05-18 10:15', preview: '请统计 X-1井近7天日产量变化...', isPinned: true },
    { id: 'h3', title: '压力与含水率诊断', date: '2026-05-10 16:45', preview: '为什么 X-1井近7天日产量下降？请结合压力...', isPinned: false },
    { id: 'h4', title: '井位优选建议', date: '2026-04-20 09:20', preview: '针对区块-X，请给出井位优选建议...', isPinned: false },
  ]);

  const groupHistoryByTime = (sessions: any[]) => {
    const sorted = [...sessions].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const grouped: { label: string; items: any[], isPinned?: boolean }[] = [];
    
    // Separate Pinned
    const pinnedItems = sorted.filter(s => s.isPinned && (s.title.includes(historySearchQuery) || s.preview.includes(historySearchQuery)));
    if (pinnedItems.length > 0) {
      grouped.push({ label: lang === 'zh' ? '置顶' : 'Pinned', items: pinnedItems, isPinned: true });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(today.getDate() - 30);

    const categories = [
      { label: lang === 'zh' ? '今天' : 'Today', filter: (d: Date) => d >= today },
      { label: lang === 'zh' ? '近一周' : 'Last Week', filter: (d: Date) => d >= lastWeek && d < today },
      { label: lang === 'zh' ? '近一个月' : 'Last Month', filter: (d: Date) => d >= lastMonth && d < lastWeek },
      { label: lang === 'zh' ? '更早' : 'Earlier', filter: (d: Date) => d < lastMonth },
    ];

    categories.forEach(cat => {
      const items = sorted.filter(s => !s.isPinned && cat.filter(new Date(s.date)) && (s.title.includes(historySearchQuery) || s.preview.includes(historySearchQuery)));
      if (items.length > 0) {
        grouped.push({ label: cat.label, items });
      }
    });

    return grouped;
  };

  const leaderAgent = agents.find(a => a.isLeader) || agents[0];

  const groupedMessages = React.useMemo(() => {
    const groups: { type: 'user' | 'model', messages: Message[] }[] = [];
    messages.forEach(msg => {
      if (msg.role === 'user') {
        groups.push({ type: 'user', messages: [msg] });
      } else {
        let lastGroup = groups[groups.length - 1];
        if (lastGroup && lastGroup.type === 'model') {
          lastGroup.messages.push(msg);
        } else {
          groups.push({ type: 'model', messages: [msg] });
        }
      }
    });
    return groups;
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    // Check for / or \ slash skill trigger
    const lastSlashPos = Math.max(value.lastIndexOf('/'), value.lastIndexOf('\\'));
    if (lastSlashPos !== -1) {
      const textAfterSlash = value.substring(lastSlashPos + 1);
      if (!textAfterSlash.includes(' ') && !textAfterSlash.includes('\n')) {
        setShowSkillMenu(true);
        setSkillFilter(textAfterSlash);
      } else {
        setShowSkillMenu(false);
      }
    } else {
      setShowSkillMenu(false);
    }

    // Auto resize
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleSkillSelect = (skill: any) => {
    const lastSlashPos = Math.max(input.lastIndexOf('/'), input.lastIndexOf('\\'));
    let newValue = '';
    if (lastSlashPos !== -1) {
      newValue = input.substring(0, lastSlashPos) + `/${skill.name} `;
    } else {
      newValue = input ? `${input} /${skill.name} ` : `/${skill.name} `;
    }
    setInput(newValue);
    setShowSkillMenu(false);
    inputRef.current?.focus();
  };

  const handleSkillClick = () => {
    if (!showSkillMenu) {
      setShowSkillMenu(true);
      setSkillFilter('');
      if (!input.endsWith('/')) {
        setInput(prev => prev ? (prev.endsWith(' ') ? `${prev}/` : `${prev} /`) : '/');
      }
    } else {
      setShowSkillMenu(false);
    }
    inputRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).map(file => {
        let sizeStr = '';
        if (file.size < 1024) sizeStr = `${file.size} B`;
        else if (file.size < 1024 * 1024) sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
        else sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

        return {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: file.name,
          size: sizeStr,
          file
        };
      });
      setAttachedFiles(prev => [...prev, ...filesArray]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isGenerating) return;

    let finalContent = input;
    if (attachedFiles.length > 0) {
      const fileListStr = attachedFiles.map(f => `📎 ${f.name} (${f.size})`).join('\n');
      finalContent = input ? `${input}\n\n${fileListStr}` : fileListStr;
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: finalContent,
      attachments: attachedFiles.map(f => ({ name: f.name, size: f.size })),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachedFiles([]);
    setShowSkillMenu(false);
    setIsGenerating(true);
    onChatStart();

    if (workspaceVersion === 'professional') {
      if (input.includes('压裂设计参数')) {
        const offsetWellAgent = agents.find(a => a.id === 'agent-pro-4') || agents[1];
        try {
          // 1. Thought
          const thoughtId = `msg-thought-${Date.now()}`;
          setMessages(prev => [...prev, {
            id: thoughtId,
            role: 'model',
            agentId: leaderAgent.id,
            content: `**问题理解**：用户需要针对 X-1 井推荐压裂设计参数。
**意图识别**：
- 核心任务：邻井压裂参数优选。
- 业务逻辑：通过同区块同层位筛选、空间距离计算、储层属性匹配及生产表现评价，定位最优参考井并抽取参数。

**调度计划**：
- 启动 **邻井压裂参数优选** 场景智能体。
- 执行标准 6 步 Workflow 流程。`,
            timestamp: Date.now(),
            status: 'completed'
          }]);
          await new Promise(resolve => setTimeout(resolve, 1000));

          // 2. Workflow Card
          const workflowId = `msg-wf-${Date.now()}`;
          const steps = [
            { name: 'Step 1: 区块 + 层位初筛', details: { thought: '先保证候选井在地质大背景上可参考。', action: ['过滤规则：区块=目标区块 AND 层位=目标层位'], observation: '初步筛选出 12 口同区块同层位候选井。' } },
            { name: 'Step 2: 距离相近筛选', details: { thought: '在同区块同层位井中找到真正具有空间参考价值的井。', action: ['计算井间距离', 'Top-5 最近邻推荐'], observation: '识别出 5 口空间邻近井，最近距离 450m。' } },
            { name: 'Step 3: 储层属性相似匹配', details: { thought: '保证参考井与目标井储层品质一致。', action: ['匹配渗透率、孔隙度、含油饱和度', '误差控制在 ±10%'], observation: '3 口井满足储层相似性要求，GeoScore 最高 0.92。' } },
            { name: 'Step 4: 生产有效性过滤', details: { thought: '去掉没有实际生产验证价值的井。', action: ['剔除未投产井'], observation: '剔除 1 口未投产井，剩余 2 口有效参考井。' } },
            { name: 'Step 5: 生产表现优选', details: { thought: '从有效井中找到生产效果最好的参考井。', action: ['按达产年产量、累计产量排序'], observation: '确定最优参考井：X-10 井，ProdScore 0.88。' } },
            { name: 'Step 6: 最佳井分段压裂参数抽取', details: { thought: '沉淀真正可复用的压裂设计参数。', action: ['按“段级”抽取分段数、液量、加砂强度等'], observation: '成功抽取 X-10 井 12 段压裂施工参数。' } }
          ];

          setMessages(prev => [...prev, {
            id: workflowId,
            role: 'model',
            agentId: offsetWellAgent.id,
            content: '',
            timestamp: Date.now(),
            status: 'processing',
            cardType: 'workflow',
            payload: {
              title: '邻井压裂参数优选',
              category: '场景智能体',
              steps: steps,
              currentStep: 1,
              status: '正在进行区块层位初筛...'
            }
          }]);

          for (let i = 2; i <= 6; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessages(prev => prev.map(msg => 
              msg.id === workflowId ? {
                ...msg,
                payload: {
                  ...msg.payload,
                  currentStep: i,
                  status: `正在执行 ${steps[i-1].name}...`
                }
              } : msg
            ));
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
          setMessages(prev => prev.map(msg => 
            msg.id === workflowId ? {
              ...msg,
              status: 'completed',
              payload: { ...msg.payload, currentStep: 7, status: 'Workflow 执行完成' }
            } : msg
          ));

          // 3. Final Result
          const finalId = `msg-final-${Date.now()}`;
          setMessages(prev => [...prev, {
            id: finalId,
            role: 'model',
            agentId: leaderAgent.id,
            content: '推荐完成',
            timestamp: Date.now(),
            status: 'completed',
            payload: {
              conclusion: `经过邻井压裂参数优选智能体的深度分析，我为您推荐 **X-10 井** 作为最优参考井。该井与 X-1 井空间距离仅 450m，储层属性相似度达 92%，且达产年产量处于区块领先水平。`,
              recommendations: [
                '① 建议直接采用 X-10 井的加砂强度模板',
                '② 针对 X-1 井局部高应力区，建议排量提升至 13m³/min',
                '③ 压裂液建议采用低伤害降阻水体系'
              ],
              outputs: ['压裂设计参数推荐表', '参考井对比图', '储层相似度矩阵']
            }
          }]);
        } catch (e) {
          console.error(e);
        } finally {
          setIsGenerating(false);
        }
        return;
      } else if (input.includes('产量下降进行深度归因诊断')) {
        const diagnosticAgent = agents.find(a => a.id === 'agent-pro-1') || agents[1];
        try {
          // 1. Thought
          const thoughtId = `msg-thought-${Date.now()}`;
          setMessages(prev => [...prev, {
            id: thoughtId,
            role: 'model',
            agentId: leaderAgent.id,
            content: `**问题理解**：用户需要针对 X-1 井近期产量下降进行深度归因诊断。
**意图识别**：
- 核心任务：产量递减原因分析与对策。
- 业务逻辑：结合生产动态数据（流压、含水、产量）、防砂历史及最新静态资料，进行漏失分析、地层伤害识别及管柱结垢判断。

**调度计划**：
- 启动 **单井产量归因诊断** 场景智能体。
- 执行标准 5 步 Workflow 流程。`,
            timestamp: Date.now(),
            status: 'completed'
          }]);
          await new Promise(resolve => setTimeout(resolve, 1000));

          // 2. Workflow Card
          const workflowId = `msg-wf-${Date.now()}`;
          const steps = [
            { name: 'Step 1: 异常波动自动预警', details: { thought: '识别产量的具体异常起始时间点。', action: ['扫描近30天生产曲线', '识别拐点'], observation: '识别出 5月12日 产量突降 15%，伴随流压下降。' } },
            { name: 'Step 2: 关联动静态数据融合', details: { thought: '拉取周边井及当前井的压力、含水及维护历史。', action: ['提取：井史、检泵资料、地面压力'], observation: '发现由于近期地层亏空导致井底流压接近饱和压力。' } },
            { name: 'Step 3: 多维度归因算法计算', details: { thought: '通过专家权重模型对漏失、结垢、供求不足等进行打分。', action: ['执行：不确定性归因引擎'], observation: '地层供能不足得分 0.82，结垢得分 0.15。' } },
            { name: 'Step 4: 逻辑闭环冲突检测', details: { thought: '验证归因结果是否符合物理规律。', action: ['流体模拟校核'], observation: '校核通过，产量下降主因为动压下降过快。' } },
            { name: 'Step 5: 诊断结论与建议生成', details: { thought: '沉淀最终诊断报告。', action: ['模板填充', '生成报告'], observation: '生产干预报告已生成。' } }
          ];

          setMessages(prev => [...prev, {
            id: workflowId,
            role: 'model',
            agentId: diagnosticAgent.id,
            content: '',
            timestamp: Date.now(),
            status: 'processing',
            cardType: 'workflow',
            payload: {
              title: '单井产量归因诊断',
              category: '场景智能体',
              steps: steps,
              currentStep: 1,
              status: '正在进行异常波动自动预警...'
            }
          }]);

          for (let i = 2; i <= 5; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessages(prev => prev.map(msg => 
              msg.id === workflowId ? {
                ...msg,
                payload: {
                  ...msg.payload,
                  currentStep: i,
                  status: `正在执行 ${steps[i-1].name}...`
                }
              } : msg
            ));
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
          setMessages(prev => prev.map(msg => 
            msg.id === workflowId ? {
              ...msg,
              status: 'completed',
              payload: { ...msg.payload, currentStep: 6, status: 'Workflow 执行完成' }
            } : msg
          ));

          // 3. Final Result
          const finalId = `msg-final-${Date.now()}`;
          setMessages(prev => [...prev, {
            id: finalId,
            role: 'model',
            agentId: leaderAgent.id,
            content: '诊断完成',
            timestamp: Date.now(),
            status: 'completed',
            payload: {
              conclusion: `根据深度归因分析，X-1 井产量下降的 **核心原因（置信度 82%）** 是动压下降过快导致地层能量不足。伴随流感分析显示，目前工作制度下地层供给无法满足采油速度需求。`,
              recommendations: [
                '① 建议下调泵速至 3 次/min 以稳定液面',
                '② 建议进行地层补能潜力评估并考虑注水吞吐',
                '③ 建议在下次检泵时安装实时井底压力传感器'
              ],
              outputs: ['产量归因诊断报告', '压力-产量关联分析图', '专家逻辑树结论']
            }
          }]);
        } catch (e) {
          console.error(e);
        } finally {
          setIsGenerating(false);
        }
        return;
      }
    }

    if (workspaceVersion === 'foundation') {
      if (input.includes('生成本周生产运行简报')) {
        const dataAgent = agents.find(a => a.name === '智能问数') || agents[1];
        const reportAgent = agents.find(a => a.name === '智能报告') || agents[3];

        try {
          // 1. Leader Breakdown
          const leaderBreakdownId = `msg-leader-brief-${Date.now()}`;
          setMessages(prev => [...prev, {
            id: leaderBreakdownId,
            role: 'model',
            agentId: leaderAgent.id,
            content: `**问题理解**：用户需要生成本周生产运行简报。
  
  **意图识别**：
  - 数据查询：获取本周全区及重点井的产量、压力、开采效率等核心生产数据。
  - 报告生成：对数据进行整合分析，识别本周生产亮点与异常，生成规范的 Word 运行简报。
  
  **调用计划**：
  1. 调用 **智能问数**：检索本周生产运行指标及异常变动情况。
  2. 调用 **智能报告**：基于检索到的多维数据，自动撰写并汇总生成《本周生产运行简报》。`,
            timestamp: Date.now(),
            status: 'processing',
            subTasks: [
              { id: 't1', agentId: dataAgent.id, task: `调用：${dataAgent.name}`, status: 'processing' }
            ]
          }]);
          await new Promise(resolve => setTimeout(resolve, 1500));

          // 2. Data Retrieval Loop (Smart Q&A)
          const loop1Id = `msg-loop-brief-data-${Date.now()}`;
          setMessages(prev => [...prev, {
            id: loop1Id,
            role: 'model',
            agentId: dataAgent.id,
            content: '',
            timestamp: Date.now(),
            status: 'processing',
            cardType: 'loop',
            payload: {
              title: '第1轮｜智能问数 - 检索生产动态',
              status: 'running',
              thought: '正在检索全区本周平均产量、含水率、注水压力等核心指标，并对比上周波动。',
              action: ['正在检索表：production_summary_daily', '正在分析产量波动趋势'],
              observation: '正在读取数据流...',
              plan: '获取核心指标后，下钻检索产量波动超过±5%的异常井。'
            }
          }]);
          await new Promise(resolve => setTimeout(resolve, 2000));
          setMessages(prev => prev.map(msg => msg.id === loop1Id ? {
            ...msg,
            status: 'completed',
            payload: {
              ...msg.payload,
              status: 'completed',
              thought: '数据检索已完成。本周平均日产油 1.25 万吨，进度达成率 102.5%；识别出 A1、B5 两口井由于管线维护导致短时减产。',
              observation: '已获得完整生产报表数据及单井产量下降诊断信息。',
              plan: '将数据结果传递给智能报告。'
            }
          } : msg));

          // UPDATE Leader Task status
          setMessages(prev => prev.map(msg => msg.id === leaderBreakdownId ? {
            ...msg,
            subTasks: [
              { id: 't1', agentId: dataAgent.id, task: `调用：${dataAgent.name}`, status: 'completed' },
              { id: 't2', agentId: reportAgent.id, task: `调用：${reportAgent.name}`, status: 'processing' }
            ]
          } : msg));
          await new Promise(resolve => setTimeout(resolve, 1000));

          // 3. Report Generation Loop
          const loop2Id = `msg-loop-brief-report-${Date.now()}`;
          setMessages(prev => [...prev, {
            id: loop2Id,
            role: 'model',
            agentId: reportAgent.id,
            content: '',
            timestamp: Date.now(),
            status: 'processing',
            cardType: 'loop',
            payload: {
              title: '第2轮｜智能报告 - 自动化撰写',
              status: 'running',
              thought: '正在根据检索到的生产数据填充《生产运行简报》模板，包括生产概况、动态分析、异常说明及对策建议。',
              action: ['内容结构化', '自动化文案生成', '格式排版校对'],
              observation: '正在生成章节：2.1 产量达成详情...',
              plan: '生成 Word 文档占位符及预览摘要。'
            }
          }]);
          await new Promise(resolve => setTimeout(resolve, 2500));
          setMessages(prev => prev.map(msg => msg.id === loop2Id ? {
            ...msg,
            status: 'completed',
            payload: {
              ...msg.payload,
              status: 'completed',
              observation: '简报撰写已完成，已成功导出为 Word 文档。',
              plan: '反馈最终成果给用户。'
            }
          } : msg));

          // 4. Final Result
          const finalId = `msg-final-brief-${Date.now()}`;
          setMessages(prev => [...prev, {
            id: finalId,
            role: 'model',
            agentId: leaderAgent.id,
            content: '周报生成完成',
            timestamp: Date.now(),
            status: 'completed',
            payload: {
              conclusion: '本周（2024年4月10日-4月16日）生产运行简报已生成。全区整体生产稳中有升，日产达成率超计划 2.5%。A1井管线异常已在4月14日修复并恢复满产，预计下周产量将持续稳定。',
              recommendations: [
                '① 关注 A1 井修复后的压力波动情况',
                '② 建议下周加大对老井递减区的稳产注水监控',
                '③ 准备下月产量计划的提前滚动预测'
              ],
              wordReport: {
                id: 'report-weekly-001',
                title: '本周生产运行简报_20240416.docx',
                size: '1.4 MB',
                time: '14:25:36',
                data: {
                  content: '这是本周生产运行简报的详细内容...',
                  author: '智能助手',
                  createdAt: '2024-04-16'
                }
              }
            }
          }]);

          setMessages(prev => prev.map(msg => msg.id === leaderBreakdownId ? {
            ...msg,
            status: 'completed',
            subTasks: [
              { id: 't1', agentId: dataAgent.id, task: `调用：${dataAgent.name}`, status: 'completed' },
              { id: 't2', agentId: reportAgent.id, task: `调用：${reportAgent.name}`, status: 'completed' }
            ]
          } : msg));

        } catch (e) {
          console.error(e);
        } finally {
          setIsGenerating(false);
        }
        return;
      }

      const dataAgent = agents.find(a => a.name === '智能问数') || agents[1];
      const chartAgent = agents.find(a => a.name === '数据成图') || agents[2];

      try {
        const leaderBreakdownId = `msg-leader-breakdown-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: leaderBreakdownId,
          role: 'model',
          agentId: leaderAgent.id,
          content: `**问题理解**：用户希望分析 X-1 井近 7 天的日产量变化趋势，并以可视化图表形式呈现。

**意图识别**：
- 数据查询：获取历史日产量数值。
- 数据可视化：生成趋势折线图。

**调用计划**：
1. 调用 **智能问数**：执行 NL2SQL 获取结构化数据。
2. 调用 **数据成图**：对获取的数据进行 ECharts 可视化处理。`,
          timestamp: Date.now(),
          status: 'processing',
          subTasks: [
            { id: 't1', agentId: dataAgent.id, task: `调用：${dataAgent.name}`, status: 'processing' }
          ]
        }]);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMessages(prev => prev.map(msg => msg.id === leaderBreakdownId ? {
          ...msg,
          status: 'completed',
          subTasks: [{ id: 't1', agentId: dataAgent.id, task: `调用：${dataAgent.name}`, status: 'completed' }]
        } : msg));

        const loop1Id = `msg-loop1-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: loop1Id,
          role: 'model',
          agentId: dataAgent.id,
          content: '',
          timestamp: Date.now(),
          status: 'processing',
          cardType: 'loop',
          payload: {
            title: '第1轮｜智能问数',
            status: 'running',
            thought: '需要先获取 X-1井近7天日产量数据。',
            action: ['正在调用工具：NL2SQL'],
            observation: '正在生成 SQL 并查询...',
            plan: '获取数据后进行分析'
          }
        }]);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setMessages(prev => prev.map(msg => msg.id === loop1Id ? {
          ...msg,
          status: 'completed',
          payload: {
            ...msg.payload,
            status: 'completed',
            action: ['调用工具：NL2SQL', '生成 SQL：SELECT date, daily_output FROM production_daily WHERE well_name = "X-1" AND date >= CURRENT_DATE - 7 ORDER BY date'],
            observation: '已返回数据：4月4日：102.3, 4月5日：101.8, 4月6日：99.5, 4月7日：98.7, 4月8日：97.6, 4月9日：96.8, 4月10日：95.9',
            plan: '基于结果生成日产量趋势图。'
          }
        } : msg));

        const stageId = `msg-stage-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: stageId,
          role: 'model',
          agentId: leaderAgent.id,
          content: '',
          timestamp: Date.now(),
          status: 'completed',
          cardType: 'stage_result',
          payload: { title: '阶段结论', finding: 'X-1井近7日产量呈持续小幅下降趋势。', points: [] }
        }]);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const loop2Id = `msg-loop2-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: loop2Id,
          role: 'model',
          agentId: chartAgent.id,
          content: '',
          timestamp: Date.now(),
          status: 'processing',
          cardType: 'loop',
          payload: {
            title: '第2轮｜趋势成图',
            status: 'running',
            thought: '需要将日产量变化趋势可视化。',
            action: ['正在调用工具：ECharts MCP'],
            observation: '正在生成图表...',
            plan: '完成可视化输出'
          }
        }]);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setMessages(prev => prev.map(msg => msg.id === loop2Id ? {
          ...msg,
          status: 'completed',
          payload: { ...msg.payload, status: 'completed', observation: '图表已生成。', plan: '等待用户继续追问。' }
        } : msg));

        const chartId = `msg-chart-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: chartId,
          role: 'model',
          agentId: chartAgent.id,
          content: '',
          timestamp: Date.now(),
          status: 'completed',
          cardType: 'chart',
          payload: { 
            title: 'X-1井近7天日产量趋势图', 
            observation: '日产量由 102.3 持续下降至 95.9，累计降幅约 6.3%。',
            type: 'bar',
            data: [{ label: '日产量 (m³/d)', values: [102.3, 101.8, 99.5, 98.7, 97.6, 96.8, 95.9], color: '#4f46e5' }]
          }
        }]);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const finalId = `msg-final-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: finalId,
          role: 'model',
          agentId: leaderAgent.id,
          content: '查询完成',
          timestamp: Date.now(),
          status: 'completed',
          payload: {
            conclusion: 'X-1井近7天日产量由 102.3 → 95.9，整体呈稳定下降趋势。建议继续关注压力变化。',
            recommendations: ['继续分析含水率', '加入井底压力', '生成日报摘要'],
            outputs: ['查询结果表', '趋势柱状图']
          }
        }]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    if (workspaceVersion === 'enterprise') {
      const productionAgent = agents.find(a => a.name === '生产管理专家') || agents[1];

      try {
        if (input.includes('复盘本月全区稳产情况')) {
          // Comprehensive Enterprise Review
          const thoughtId = `msg-thought-${Date.now()}`;
          setMessages(prev => [...prev, {
            id: thoughtId,
            role: 'model',
            agentId: leaderAgent.id,
            content: `**问题理解**：针对全区本月稳产情况进行深度复盘。涉及产量达成率、异常损耗分析、重点措施井贡献及下月稳产风险预警。
  
**意图识别**：
- 岗位职责：全区生产分析与辅助协调。
- 业务闭环：从“现状分析”到“归因诊断”再到“措施指导”。

**调度计划**：
- 调度 **生产管理专家** 岗位智能体协同 **产量波动归因**、**措施有效性评估** 等场景智能体开展全区复盘工作。`,
            timestamp: Date.now(),
            status: 'completed'
          }]);
          await new Promise(resolve => setTimeout(resolve, 1500));

          const positionDecompId = `msg-pos-decomp-${Date.now()}`;
          const scenarios = [
            { 
              name: '场景1: 全区产量达成分析 Agent', 
              task: '计算计划完成率', 
              status: 'completed',
              workflow: {
                steps: [
                  { 
                    name: '指标获取', 
                    details: {
                      thought: '汇总全区 A、B、C 三个子区块的月度累计产量。',
                      action: ['提取统计：SELECT area, SUM(daily) FROM prod'],
                      observation: '本月累计产油 42.5 万吨，进度达成率 98.2%。',
                      plan: '分析未达标缺口来源。'
                    }
                  }
                ],
                currentStep: 1
              }
            },
            { name: '场景2: 关停井归因统计 Agent', task: '量化停产损失', status: 'processing' },
            { name: '场景3: 重点稳产措施评估 Agent', task: '评价增产有效性', status: 'idle' },
            { name: '场景4: 跨岗位协同预警 Agent', task: '识别供应链/设备风险', status: 'idle' }
          ];

          setMessages(prev => [...prev, {
            id: positionDecompId,
            role: 'model',
            agentId: productionAgent.id,
            content: '已启动岗位协同复盘流程。正在整合多场景智能体分析结果...',
            timestamp: Date.now(),
            status: 'completed',
            payload: {
              scenes: scenarios,
              interimAnswer: '全区本月生产整体稳定，但 B 区块由于管网维护导致 3.5% 的产量缺口。'
            }
          }]);
          await new Promise(resolve => setTimeout(resolve, 2000));

          const finalId = `msg-final-${Date.now()}`;
          setMessages(prev => [...prev, {
            id: finalId,
            role: 'model',
            agentId: leaderAgent.id,
            content: '复盘完成',
            timestamp: Date.now(),
            status: 'completed',
            payload: {
              conclusion: '本月全区稳产态势良好，累计产量达成率 98.2%。主要影响因素为 B 区中旬的管网例行停产维护。东部新区新井投产贡献超预期，抵消了由于 X 区块老井自然递减带来的压力。',
              recommendations: [
                '① 【调控】下月建议加大东部新区排采强度，冲刺 105% 目标',
                '② 【维护】B 区管网已恢复，建议下周补齐缺失产量',
                '③ 【预警】关注 C 区高含水井组，预防突发性淹没风险'
              ],
              outputs: ['月度生产复盘周报.pdf', '全区产量贡献矩阵图', '下月潜力井排名清单']
            }
          }]);
        } else {
          // General Enterprise Handler (X-1 Default)
          const thoughtId = `msg-thought-${Date.now()}`;
          setMessages(prev => [...prev, {
            id: thoughtId,
            role: 'model',
            agentId: leaderAgent.id,
            content: `**问题理解**：作为岗位数字员工，我将针对 X-1 井的生产异常进行全方位的岗位级复盘与优化建议。

**意图识别**：
- 岗位职责：生产管理与稳产优化。
- 任务拆解：并行调度归因、诊断、评估、预测四个专业场景。

**调用计划**：
1. 调度 **生产管理专家** 岗位智能体.
2. 岗位智能体将协同 4 个场景智能体并行 work。`,
            timestamp: Date.now(),
            status: 'completed'
          }]);
          await new Promise(resolve => setTimeout(resolve, 1500));

          const positionDecompId = `msg-pos-decomp-${Date.now()}`;
          const initialScenarios = [
            { 
              name: '场景1: 产量波动归因 Agent', 
              task: '找下降原因', 
              status: 'processing',
              workflow: {
                steps: [
                  { 
                    name: '生产数据提取', 
                    details: {
                      thought: '从生产日报数据库中提取 X-1 井近 7 天的产量、含水、压力数据。',
                      action: ['调用：NL2SQL 工具', '执行：SELECT * FROM prod_daily WHERE well="X-1"'],
                      observation: '成功提取 7 条记录，产量呈递减趋势。',
                      plan: '进行产量递减率计算。'
                    }
                  },
                  { name: '递减特征识别', details: null },
                  { name: '关联因素分析', details: null }
                ],
                currentStep: 1
              }
            },
            { name: '场景2: 压力系统诊断 Agent', task: '看压力是否异常', status: 'idle' },
            { name: '场景3: 措施有效性评估 Agent', task: '历史措施是否失效', status: 'idle' },
            { name: '场景4: 未来稳产预测 Agent', task: '未来3天产量预测', status: 'idle' }
          ];

          setMessages(prev => [...prev, {
            id: positionDecompId,
            role: 'model',
            agentId: productionAgent.id,
            content: '正在通过岗位智能体协同多个场景进行并行分析。',
            timestamp: Date.now(),
            status: 'completed',
            payload: {
              scenes: initialScenarios,
              interimAnswer: '正在汇总各场景分析结果...'
            }
          }]);
          await new Promise(resolve => setTimeout(resolve, 2000));

          const finalId = `msg-final-${Date.now()}`;
          setMessages(prev => [...prev, {
            id: finalId,
            role: 'model',
            agentId: leaderAgent.id,
            content: '分析完成',
            timestamp: Date.now(),
            status: 'completed',
            payload: {
              conclusion: '分析显示该井目前处于酸化措施衰减期，伴随井底流压异常下降，建议立即实施稳产干预。',
              recommendations: [
                '① 【立即】实施补充酸化措施',
                '② 【优化】调整生产压差至 3.5MPa',
                '③ 【监控】加密含水率监测频率'
              ],
              outputs: ['诊断报告.pdf', '优化建议单.docx', '产量预测图.png']
            }
          }]);
        }
      } catch (error) {
        console.error('Error in Agentic flow:', error);
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // Default mock response if not handled above
    setTimeout(() => {
      const mockId = `msg-mock-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: mockId,
        role: 'model',
        agentId: leaderAgent.id,
        content: '好的，我已经收到您的请求，正在为您处理相关工作。',
        timestamp: Date.now(),
        status: 'completed'
      }]);
      setIsGenerating(false);
    }, 1000);
  };

  const getAgent = (agentId?: string) => agents.find(a => a.id === agentId) || leaderAgent;

  const getVersionSummary = () => {
    if (workspaceVersion === 'foundation') {
      return lang === 'zh' 
        ? '当前为基础版空间，已连接生产数据库。支持通过自然语言进行数据查询、趋势分析及可视化成图。' 
        : 'Current: Foundation version. Connected to production database. Supports NL data query, trend analysis, and visualization.';
    }
    if (workspaceVersion === 'professional') {
      return lang === 'zh'
        ? '当前为专业版空间，已集成生产分析、勘探评价等专业场景智能体。支持复杂业务流编排与多维度联动单井产量下降诊断。'
        : 'Current: Professional version. Integrated with production analysis and exploration agents. Supports workflow orchestration and multi-dimensional production decline diagnosis.';
    }
    return lang === 'zh'
      ? '当前为企业版空间，已部署岗位数字员工。支持跨学科并行协同、岗位级业务闭环及全生命周期决策辅助。'
      : 'Current: Enterprise version. Deployed digital employees. Supports cross-disciplinary collaboration and post-level business closure.';
  };

  const getRecommendedQuestions = () => {
    if (workspaceVersion === 'foundation') {
      return [
        { text: lang === 'zh' ? '查询 X-1 井近 7 天的日产量趋势' : 'Query daily production trend of Well X-1 for last 7 days', icon: 'fa-chart-line' },
        { text: lang === 'zh' ? '对比 A 区和 B 区上个月的产液量' : 'Compare liquid production of Area A and B last month', icon: 'fa-balance-scale' },
        { text: lang === 'zh' ? '生成本周生产运行简报' : 'Generate weekly production operation brief', icon: 'fa-file-alt' }
      ];
    }
    if (workspaceVersion === 'professional') {
      return [
        { text: lang === 'zh' ? '针对 X-1 井产量下降进行深度归因诊断' : 'Deep attribution diagnosis for production decline of Well X-1', icon: 'fa-stethoscope' },
        { text: lang === 'zh' ? '评估区块-X 近期的酸化措施有效性' : 'Evaluate effectiveness of recent acidification in Block-X', icon: 'fa-vial' },
        { text: lang === 'zh' ? '为我推荐 X-1 井的压裂设计参数' : 'Recommend fracturing design parameters for Well X-1', icon: 'fa-oil-well' }
      ];
    }
    return [
      { text: lang === 'zh' ? '作为生产管理专家，请复盘本月全区稳产情况' : 'As production manager, review the monthly stable production', icon: 'fa-user-tie' },
      { text: lang === 'zh' ? '协同勘探与钻井专家，评估区块-Y 的扩边潜力' : 'Collaborate with exploration & drilling experts to evaluate Block-Y', icon: 'fa-users-cog' },
      { text: lang === 'zh' ? '分析当前油价波动对全生命周期开发效益的影响' : 'Analyze impact of oil price fluctuations on life-cycle benefits', icon: 'fa-chart-pie' }
    ];
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] relative">
      {/* Mini Assistant Header REMOVED */}

      {/* Top Right Session Actions */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button 
          onClick={() => {
            setMessages([]);
            onSelectMessage(null);
            setInput('');
          }}
          title={lang === 'zh' ? '新建会话' : 'New Chat'}
          className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all group"
        >
          <i className="fas fa-plus text-sm group-hover:scale-110 transition-transform"></i>
        </button>
        <button 
          onClick={() => setIsHistoryModalOpen(true)}
          title={lang === 'zh' ? '历史记录' : 'History'}
          className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 transition-all group"
        >
          <i className="fas fa-history text-sm group-hover:rotate-[-45deg] transition-transform"></i>
        </button>
      </div>

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <i className="fas fa-history text-indigo-600"></i>
                {lang === 'zh' ? '历史会话' : 'History Sessions'}
              </h3>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input 
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder={lang === 'zh' ? '搜索历史会话...' : 'Search history...'}
                  className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <button 
                onClick={() => {
                  setMessages([]);
                  onSelectMessage(null);
                  setInput('');
                  setIsHistoryModalOpen(false);
                }}
                className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-plus"></i>
                {lang === 'zh' ? '新建会话' : 'New Chat'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {groupHistoryByTime(historySessions).length > 0 ? (
                groupHistoryByTime(historySessions).map((group, gIdx) => (
                  <div key={group.label} className={gIdx > 0 ? "mt-4" : ""}>
                    <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{group.label}</div>
                    <div className="space-y-1">
                      {group.items.map(session => (
                        <div 
                          key={session.id} 
                          className={`group p-3 rounded-xl cursor-pointer transition-all border border-transparent relative flex items-center justify-between gap-3 ${group.isPinned ? 'bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-100' : 'hover:bg-gray-50 hover:border-gray-100'}`}
                          onClick={() => {
                            if (window.confirm(lang === 'zh' ? '切换会话将清空当前内容，是否继续？' : 'Switching sessions will clear current content. Continue?')) {
                              setMessages([]);
                              setIsHistoryModalOpen(false);
                            }
                          }}
                        >
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            {session.isPinned && <i className="fas fa-thumbtack text-[10px] text-indigo-500 transform -rotate-45"></i>}
                            <div className="font-bold text-gray-800 text-sm truncate">{session.title}</div>
                          </div>
                          
                          <div className="relative flex-shrink-0">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSessionActionOpen(sessionActionOpen === session.id ? null : session.id);
                              }}
                              className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-gray-400 transition-all border border-transparent hover:border-gray-200"
                            >
                              <i className="fas fa-ellipsis-v text-[10px]"></i>
                            </button>

                              {sessionActionOpen === session.id && (
                                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-[110] py-1 overflow-hidden animate-in fade-in zoom-in duration-100">
                                  <button 
                                    className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newTitle = window.prompt(lang === 'zh' ? '重命名会话' : 'Rename Session', session.title);
                                      if (newTitle) {
                                        setHistorySessions(prev => prev.map(s => s.id === session.id ? { ...s, title: newTitle } : s));
                                      }
                                      setSessionActionOpen(null);
                                    }}
                                  >
                                    <i className="far fa-edit w-4"></i> {lang === 'zh' ? '重命名' : 'Rename'}
                                  </button>
                                  <button 
                                    className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setHistorySessions(prev => prev.map(s => s.id === session.id ? { ...s, isPinned: !s.isPinned } : s));
                                      setSessionActionOpen(null);
                                    }}
                                  >
                                    <i className={`fas fa-thumbtack w-4 ${session.isPinned ? 'text-indigo-500' : ''}`}></i> 
                                    {session.isPinned ? (lang === 'zh' ? '取消置顶' : 'Unpin') : (lang === 'zh' ? '置顶' : 'Pin')}
                                  </button>
                                  <div className="h-px bg-gray-50 my-1"></div>
                                  <button 
                                    className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (window.confirm(lang === 'zh' ? '确定删除该会话吗？' : 'Are you sure you want to delete this session?')) {
                                        setHistorySessions(prev => prev.filter(s => s.id !== session.id));
                                      }
                                      setSessionActionOpen(null);
                                    }}
                                  >
                                    <i className="far fa-trash-alt w-4"></i> {lang === 'zh' ? '删除' : 'Delete'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                  <i className="fas fa-search text-3xl mb-3 opacity-20"></i>
                  <p className="text-sm">{lang === 'zh' ? '未找到相关会话' : 'No sessions found'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className={`flex-1 ${messages.length === 0 ? 'overflow-hidden' : 'overflow-y-auto'} ${isMiniAssistant ? 'p-4 space-y-4' : 'p-6 space-y-6'}`}>
        {messages.length === 0 ? (
          <div className={`h-full flex flex-col items-center justify-center ${isMiniAssistant ? 'w-full' : 'max-w-3xl mx-auto py-2'}`}>
            {!isMiniAssistant && (
              <>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg shadow-indigo-100 animate-pulse">
                  <i className="fas fa-sparkles text-xl"></i>
                </div>
                
                <div className={`text-center mb-5 w-full`}>
                  <h2 className={`text-xl font-bold text-gray-900 mb-3 tracking-tight`}>
                    {lang === 'zh' ? '欢迎使用智能协作空间' : 'Welcome to AI Workspace'}
                  </h2>
                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm max-w-2xl mx-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lang === 'zh' ? '空间总结' : 'Space Summary'}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed text-left">
                      {getVersionSummary()}
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="w-full space-y-2">
              {!isMiniAssistant && (
                <div className={`flex items-center gap-2 px-1 mb-1`}>
                  <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {lang === 'zh' ? '推荐问题示例' : 'Recommended Questions'}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 gap-2">
                {(isMiniAssistant ? getRecommendedQuestions() : getRecommendedQuestions()).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(q.text);
                      inputRef.current?.focus();
                    }}
                    className={`flex items-center gap-3 ${isMiniAssistant ? 'py-2 px-3' : 'py-2.5 px-4'} bg-white border border-gray-100 rounded-xl text-left hover:border-indigo-300 hover:shadow-md transition-all group relative overflow-hidden`}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex-1 min-w-0">
                      <div className={`${isMiniAssistant ? 'text-xs' : 'text-sm'} font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors`}>{q.text}</div>
                    </div>
                    <div className={`${isMiniAssistant ? 'w-5 h-5' : 'w-6 h-6'} rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all flex-shrink-0`}>
                      <i className="fas fa-arrow-right text-[10px]"></i>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          groupedMessages.map((group, gIndex) => {
            if (group.type === 'user') {
              return <UserMessageCard key={group.messages[0].id} message={group.messages[0]} />;
            }

            return <UnifiedResponseCard key={`group-${gIndex}`} messages={group.messages} agents={agents} version={workspaceVersion} onSaveOutcome={onSaveOutcome} onViewEvidence={onViewEvidence} />;
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 relative">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          className="hidden"
          id="hidden-chat-file-input"
        />

        {/* Skills Menu (Triggered by / or Skill Button) */}
        {showSkillMenu && (
          <div className="absolute bottom-full left-4 mb-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
            <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <i className="fas fa-wand-magic-sparkles text-indigo-500"></i>
                <span>{lang === 'zh' ? '工作空间技能列表' : 'Workspace Skills'}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {lang === 'zh' ? '使用 / 快速唤起' : 'Type / to trigger'}
              </span>
            </div>
            <div className="max-h-56 overflow-y-auto p-1">
              {MOCK_SKILLS.filter(s => s.name.toLowerCase().includes(skillFilter.toLowerCase()) || s.description.toLowerCase().includes(skillFilter.toLowerCase())).map(skill => (
                <div
                  key={skill.id}
                  onClick={() => handleSkillSelect(skill)}
                  className="p-2.5 hover:bg-indigo-50/80 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xs mt-0.5 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <i className="fas fa-bolt"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                        {skill.name}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase flex-shrink-0">
                        {skill.category === 'Business' ? (lang === 'zh' ? '业务' : 'Business') : (lang === 'zh' ? '通用' : 'General')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {skill.description}
                    </p>
                  </div>
                </div>
              ))}
              {MOCK_SKILLS.filter(s => s.name.toLowerCase().includes(skillFilter.toLowerCase()) || s.description.toLowerCase().includes(skillFilter.toLowerCase())).length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">
                  {lang === 'zh' ? '未找到相关技能' : 'No matching skills found'}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto flex flex-col gap-2">
          {isGenerating && (
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg w-fit">
              <i className="fas fa-circle-notch fa-spin"></i> {lang === 'zh' ? '多智能体协作执行中...' : 'Multi-Agent Collab Running...'}
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all flex flex-col p-3 gap-2.5">
            {/* Attached Files List - Rendered inside the input box card top */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100">
                {attachedFiles.map(fileItem => (
                  <div
                    key={fileItem.id}
                    className="flex items-center gap-2 px-2.5 py-1 bg-indigo-50/90 border border-indigo-100/80 rounded-xl text-xs text-indigo-900 shadow-2xs"
                  >
                    <i className="fas fa-file-lines text-indigo-500 text-xs"></i>
                    <span className="font-semibold truncate max-w-[200px]">{fileItem.name}</span>
                    <span className="text-[10px] text-indigo-400 font-mono">({fileItem.size})</span>
                    <button
                      type="button"
                      onClick={() => removeAttachedFile(fileItem.id)}
                      className="ml-1 w-4 h-4 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-600 flex items-center justify-center transition-colors cursor-pointer"
                      title={lang === 'zh' ? '移除文件' : 'Remove file'}
                    >
                      <i className="fas fa-times text-[9px]"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Center Input Textarea - Expanded Height */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={lang === 'zh' ? (isRecording ? '正在录音...' : '输入问题，可用 / 唤起技能...') : (isRecording ? 'Recording...' : 'Type message, use / for skills...')}
              className="w-full bg-transparent border-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none min-h-[56px] max-h-36 py-1 px-1 leading-relaxed"
              rows={2}
            />

            {/* Bottom Controls Bar inside Card */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {/* Left Side Tools: Resource Badge + File Upload + Skill List Button */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 text-slate-600 transition-colors">
                  <i className="fas fa-database text-[10px] text-indigo-500"></i>
                  <span className="text-[11px] font-bold">
                    {selectedResources.size} {lang === 'zh' ? '资源' : 'Resources'}
                  </span>
                </div>

                {/* File Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-2.5 rounded-xl flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 border border-transparent hover:border-indigo-100 transition-all cursor-pointer font-medium"
                  title={lang === 'zh' ? '上传文件' : 'Upload File'}
                  id="btn-chat-upload-file"
                >
                  <i className="fas fa-paperclip text-xs"></i>
                  <span className="hidden sm:inline text-[11px]">{lang === 'zh' ? '附件' : 'Attach'}</span>
                </button>

                {/* Skill List Slash Button */}
                <button
                  type="button"
                  onClick={handleSkillClick}
                  className={`h-8 px-2.5 rounded-xl flex items-center gap-1.5 text-xs transition-all cursor-pointer font-medium border ${
                    showSkillMenu 
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-200 font-bold' 
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 border-transparent hover:border-indigo-100'
                  }`}
                  title={lang === 'zh' ? '技能列表 (按 / 唤起)' : 'Skills List (Type /)'}
                  id="btn-chat-skills"
                >
                  <i className="fas fa-wand-magic-sparkles text-xs text-indigo-500"></i>
                  <span className="hidden sm:inline text-[11px]">{lang === 'zh' ? '技能' : 'Skills'}</span>
                </button>
              </div>

              {/* Right Side Actions: Voice Recording + Send Button */}
              <div className="flex items-center gap-2">
                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={() => setIsRecording(!isRecording)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isRecording 
                      ? 'bg-red-500 text-white animate-pulse shadow-xs' 
                      : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                  title={lang === 'zh' ? (isRecording ? '点击停止录音' : '语音输入') : (isRecording ? 'Stop Recording' : 'Voice Input')}
                  id="btn-voice-input"
                >
                  <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'} text-xs`}></i>
                </button>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={(!input.trim() && attachedFiles.length === 0) || isGenerating}
                  className={`h-8 px-3.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                    (!input.trim() && attachedFiles.length === 0) || isGenerating 
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xs'
                  }`}
                  id="btn-send-chat"
                >
                  {isGenerating ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <>
                      <span>{lang === 'zh' ? '发送' : 'Send'}</span>
                      <i className="fas fa-paper-plane text-[10px]"></i>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
