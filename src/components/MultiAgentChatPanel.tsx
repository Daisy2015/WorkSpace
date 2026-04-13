import React, { useState, useRef, useEffect } from 'react';
import { Message, ResourceNode, Language, Workspace, Agent } from '../types';
import { generateResponse, initializeGemini } from '../services/geminiService';
import { translations } from '../i18n';
import { UserMessageCard, LeaderCard, FinalResultCard, LoopCard, StageResultCard, ChartCard, WorkflowCard, AgentExecutionCard, UnifiedResponseCard } from './MultiAgentCards';

interface MultiAgentChatPanelProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  selectedResources: Set<string>;
  allResources: ResourceNode[];
  onSelectMessage: (msg: Message) => void;
  onChatStart: () => void;
  onAddResource: (parentId: string, node: ResourceNode) => void;
  currentWorkspace: Workspace | null;
  onUpdateWorkspaceName: (name: string) => void;
  lang: Language;
  onEditReport: (content: string, id: string) => void;
  onToggleTracePanel: () => void;
  isTracePanelOpen: boolean;
  agents: Agent[];
  workspaceVersion?: 'foundation' | 'professional' | 'enterprise' | 'flagship';
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
  workspaceVersion = 'foundation'
}) => {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historySessions, setHistorySessions] = useState([
    { id: 'h1', title: 'X-1井产量下降分析', date: '2024-04-09 14:30', preview: '分析 X-1井近7天产量下降原因...' },
    { id: 'h2', title: '日产量变化统计', date: '2024-04-08 10:15', preview: '请统计 X-1井近7天日产量变化...' },
    { id: 'h3', title: '压力与含水率诊断', date: '2024-04-07 16:45', preview: '为什么 X-1井近7天日产量下降？请结合压力...' },
    { id: 'h4', title: '井位优选建议', date: '2024-04-06 09:20', preview: '针对区块-X，请给出井位优选建议...' },
  ]);

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
    if (messages.length === 0) {
      if (workspaceVersion === 'enterprise') {
        const enterpriseMockMessages: Message[] = [
          {
            id: `msg-ent-1`,
            role: 'user',
            content: '请分析 X-1井近7天产量下降原因，并给出未来3天稳产优化建议。',
            timestamp: Date.now() - 10000
          },
          {
            id: `msg-ent-2`,
            role: 'model',
            agentId: leaderAgent.id,
            content: '已识别任务目标：产量下降归因 + 风险趋势预测 + 稳产优化建议',
            timestamp: Date.now() - 9000,
            status: 'completed',
            subTasks: [
              { id: 't1', agentId: agents.find(a => a.name === '生产分析岗')?.id || agents[1].id, task: '正在调度：生产分析岗智能体', status: 'completed' },
              { id: 't2', agentId: leaderAgent.id, task: '由岗位智能体拆分多个分析场景并并行执行', status: 'completed' }
            ]
          },
          {
            id: `msg-ent-3`,
            role: 'model',
            agentId: agents.find(a => a.name === '生产分析岗')?.id || agents[1].id,
            content: '任务拆解中',
            timestamp: Date.now() - 8000,
            status: 'completed',
            payload: {
              scenes: [
                { name: '场景1: 产量波动归因 Agent', task: '找下降原因', status: '已完成' },
                { name: '场景2: 压力系统诊断 Agent', task: '看压力是否异常', status: '已完成' },
                { name: '场景3: 措施有效性评估 Agent', task: '历史措施是否失效', status: '已完成' },
                { name: '场景4: 未来稳产预测 Agent', task: '未来3天产量预测', status: '已完成' }
              ],
              interimAnswer: '当前怀疑：压力递减异常 + 含水上升'
            }
          },
          {
            id: `msg-ent-4`,
            role: 'model',
            agentId: agents.find(a => a.name === '生产分析岗')?.id || agents[1].id,
            content: '',
            timestamp: Date.now() - 7000,
            status: 'completed',
            cardType: 'loop',
            payload: {
              title: '第1轮｜产量波动归因 Agent',
              status: 'completed',
              thought: '需要确认产量下降是地层原因还是措施衰减。',
              action: ['调用：趋势分析通用智能体', '时序取数工具', '曲线平滑工具', '异常点检测工具', '邻井对比工具'],
              observation: '近7日产量下降 18%，含水率同步上升 9%。',
              plan: '进一步调用压力诊断场景智能体确认系统影响。'
            }
          },
          {
            id: `msg-ent-5`,
            role: 'model',
            agentId: agents.find(a => a.name === '生产分析岗')?.id || agents[1].id,
            content: '',
            timestamp: Date.now() - 6000,
            status: 'completed',
            cardType: 'loop',
            payload: {
              title: '第2轮｜压力系统诊断 Agent',
              status: 'completed',
              thought: '压力递减速率异常，需要定位是否为井底供液不足。',
              action: ['调用：诊断推理通用智能体', '实时压力取数工具', '历史井底流压工具', '压降速率计算工具', '阈值规则库工具'],
              observation: '井底流压近48小时下降超经验阈值 15%。',
              plan: '验证最近酸化措施效果衰减情况。'
            }
          },
          {
            id: `msg-ent-6`,
            role: 'model',
            agentId: leaderAgent.id,
            content: '',
            timestamp: Date.now() - 5000,
            status: 'completed',
            cardType: 'stage_result',
            payload: {
              title: '阶段结论 1',
              finding: '供液能力下降为一级主因',
              points: ['井底流压48小时下降超阈值 15%', '产量下降与压力下降趋势高度相关', '含水率上升加剧供液压力']
            }
          },
          {
            id: `msg-ent-7`,
            role: 'model',
            agentId: agents.find(a => a.name === '生产分析岗')?.id || agents[1].id,
            content: '',
            timestamp: Date.now() - 4000,
            status: 'completed',
            cardType: 'loop',
            payload: {
              title: '第3轮｜措施有效性评估 Agent',
              status: 'completed',
              thought: '需要判断最近酸化措施有效期是否结束。',
              action: ['调用：经验评估通用智能体', '措施记录检索工具', '历史类比井工具', '措施寿命预测工具', '经验知识库工具'],
              observation: '上次酸化措施有效周期预计 18 天，当前已进入衰减尾期。',
              plan: '汇总诊断结果，生成优化建议。'
            }
          },
          {
            id: `msg-ent-8`,
            role: 'model',
            agentId: leaderAgent.id,
            content: '',
            timestamp: Date.now() - 3000,
            status: 'completed',
            cardType: 'stage_result',
            payload: {
              title: '阶段结论 2',
              finding: '措施衰减与供液不足共同导致产量下降',
              points: ['酸化措施已进入衰减尾期（第18天）', '历史类比井在相同周期出现类似下降', '供液能力与措施效果存在强耦合关系']
            }
          },
          {
            id: `msg-ent-9`,
            role: 'model',
            agentId: agents.find(a => a.name === '生产分析岗')?.id || agents[1].id,
            content: '',
            timestamp: Date.now() - 2000,
            status: 'completed',
            cardType: 'loop',
            payload: {
              title: '第4轮｜未来稳产预测 Agent',
              status: 'completed',
              thought: '需要预测未来3天自然递减趋势。',
              action: ['调用：时序预测通用智能体', 'Prophet预测工具', '邻井模式工具', '递减曲线工具', '风险阈值告警工具'],
              observation: '若不采取措施，未来3日产量预计继续下降 6~8%。',
              plan: '汇总所有场景结果，生成稳产建议。'
            }
          },
          {
            id: `msg-ent-10`,
            role: 'model',
            agentId: leaderAgent.id,
            content: '综合各位专家的分析结果',
            timestamp: Date.now() - 1000,
            status: 'completed',
            payload: {
              conclusion: 'X-1井产量下降主要由以下因素共同导致：井底供液能力下降、含水率持续上升、酸化措施进入衰减尾期',
              recommendations: [
                '① 【一级动作·立即】48小时内实施补充酸化',
                '② 【二级动作·优化】调整生产压差控制策略',
                '③ 【三级动作·监控】提升含水率监控频率至 2h/次'
              ],
              outputs: ['稳产优化日报', '未来3天预测图', '措施建议单', '风险预警卡']
            }
          }
        ];
        setMessages(enterpriseMockMessages);
      } else if (workspaceVersion === 'foundation') {
        const foundationMockMessages: Message[] = [
          {
            id: `msg-fnd-1`,
            role: 'user',
            content: '请统计 X-1井近7天日产量变化，并生成趋势图。',
            timestamp: Date.now() - 5000
          },
          {
            id: `msg-fnd-2`,
            role: 'model',
            agentId: leaderAgent.id,
            content: '已识别任务目标：获取 X-1井近7天日产量 + 输出趋势图',
            timestamp: Date.now() - 4000,
            status: 'completed',
            subTasks: [
              { id: 't1', agentId: agents.find(a => a.name === '数据分析专家')?.id || agents[1].id, task: '调用：数据分析通用智能体', status: 'completed' }
            ]
          },
          {
            id: `msg-fnd-3`,
            role: 'model',
            agentId: agents.find(a => a.name === '数据分析专家')?.id || agents[1].id,
            content: '',
            timestamp: Date.now() - 3000,
            status: 'completed',
            cardType: 'loop',
            payload: {
              title: '第1轮｜智能问数',
              status: 'completed',
              thought: '需要先获取 X-1井近7天日产量数据。',
              action: ['调用工具：NL2SQL', '生成 SQL：SELECT date, daily_output FROM production_daily WHERE well_name = "X-1" AND date >= CURRENT_DATE - 7 ORDER BY date'],
              observation: '已返回数据：4月4日：102.3, 4月5日：101.8, 4月6日：99.5, 4月7日：98.7, 4月8日：97.6, 4月9日：96.8, 4月10日：95.9',
              plan: '基于结果生成日产量趋势图。'
            }
          },
          {
            id: `msg-fnd-4`,
            role: 'model',
            agentId: leaderAgent.id,
            content: '',
            timestamp: Date.now() - 2500,
            status: 'completed',
            cardType: 'stage_result',
            payload: {
              title: '阶段结论',
              finding: 'X-1井近7日产量呈持续小幅下降趋势。',
              points: []
            }
          },
          {
            id: `msg-fnd-5`,
            role: 'model',
            agentId: agents.find(a => a.name === '数据分析专家')?.id || agents[2].id,
            content: '',
            timestamp: Date.now() - 2000,
            status: 'completed',
            cardType: 'loop',
            payload: {
              title: '第2轮｜趋势成图',
              status: 'completed',
              thought: '需要将日产量变化趋势可视化。',
              action: ['调用工具：ECharts MCP'],
              observation: '正在生成图表...',
              plan: '等待用户继续追问或追加分析维度。'
            }
          },
          {
            id: `msg-fnd-6`,
            role: 'model',
            agentId: agents.find(a => a.name === '数据分析专家')?.id || agents[1].id,
            content: '',
            timestamp: Date.now() - 1500,
            status: 'completed',
            cardType: 'chart',
            payload: {
              title: 'X-1井近7天日产量趋势图',
              observation: '近7日产量累计下降约 6.3%。'
            }
          },
          {
            id: `msg-fnd-7`,
            role: 'model',
            agentId: leaderAgent.id,
            content: '查询完成',
            timestamp: Date.now() - 1000,
            status: 'completed',
            payload: {
              conclusion: 'X-1井近7天日产量由 102.3 → 95.9，整体呈稳定下降趋势。',
              recommendations: [
                '继续分析含水率',
                '加入井底压力',
                '生成日报摘要'
              ],
              outputs: ['查询结果表', '趋势折线图']
            }
          }
        ];
        setMessages(foundationMockMessages);
      } else if (workspaceVersion === 'professional') {
        const professionalMockMessages: Message[] = [
          {
            id: `msg-pro-1`,
            role: 'user',
            content: '为什么 X-1井近7天日产量下降？请结合压力和含水率进行诊断，并生成分析图。',
            timestamp: Date.now() - 8000
          },
          {
            id: `msg-pro-2`,
            role: 'model',
            agentId: leaderAgent.id,
            content: '已识别任务目标：诊断产量下降原因 + 联合分析压力与含水率 + 输出诊断图件',
            timestamp: Date.now() - 7000,
            status: 'completed',
            subTasks: [
              { id: 't1', agentId: agents.find(a => a.name === '生产分析岗')?.id || agents[1].id, task: '调用：产量下降诊断场景智能体', status: 'completed' }
            ]
          },
          {
            id: `msg-pro-3`,
            role: 'model',
            agentId: agents.find(a => a.name === '生产分析岗')?.id || agents[1].id,
            content: '',
            timestamp: Date.now() - 6500,
            status: 'completed',
            cardType: 'workflow',
            payload: {
              title: '产量下降诊断',
              steps: ['产量趋势分析', '压力变化诊断', '含水率异常检测', '多指标联动归因', '诊断图件生成'],
              currentStep: 1,
              status: '正在执行：步骤 1 / 5'
            }
          },
          {
            id: `msg-pro-4`,
            role: 'model',
            agentId: agents.find(a => a.name === '生产分析岗')?.id || agents[1].id,
            content: '',
            timestamp: Date.now() - 6000,
            status: 'completed',
            cardType: 'loop',
            payload: {
              title: '第1轮｜产量趋势分析',
              status: 'completed',
              thought: '先确认近7日产量是否为持续下降，而非偶发波动。',
              action: ['调用：趋势分析通用智能体', 'NL2SQL', '递减率计算工具'],
              observation: '近7日产量由 102.3 下降至 95.9，累计下降 6.3%。',
              plan: '下一步联合分析井底压力变化。'
            }
          },
          {
            id: `msg-pro-5`,
            role: 'model',
            agentId: leaderAgent.id,
            content: '',
            timestamp: Date.now() - 5500,
            status: 'completed',
            cardType: 'stage_result',
            payload: {
              title: '阶段结论',
              finding: '存在稳定递减趋势',
              points: []
            }
          },
          {
            id: `msg-pro-6`,
            role: 'model',
            agentId: agents.find(a => a.name === '生产分析岗')?.id || agents[1].id,
            content: '',
            timestamp: Date.now() - 5000,
            status: 'completed',
            cardType: 'loop',
            payload: {
              title: '第2轮｜压力变化诊断',
              status: 'completed',
              thought: '需要判断产量递减是否由供液压力下降导致。',
              action: ['调用：压力诊断通用智能体', 'NL2CQL', '压降速率工具', '阈值规则库'],
              observation: '井底压力近7天下降 8.1%，与产量递减同步。',
              plan: '继续验证含水率变化是否叠加影响。'
            }
          },
          {
            id: `msg-pro-7`,
            role: 'model',
            agentId: leaderAgent.id,
            content: '',
            timestamp: Date.now() - 4500,
            status: 'completed',
            cardType: 'stage_result',
            payload: {
              title: '阶段结论',
              finding: '压力下降为一级影响因子',
              points: []
            }
          },
          {
            id: `msg-pro-8`,
            role: 'model',
            agentId: agents.find(a => a.name === '生产分析岗')?.id || agents[1].id,
            content: '',
            timestamp: Date.now() - 4000,
            status: 'completed',
            cardType: 'loop',
            payload: {
              title: '第3轮｜含水率异常检测',
              status: 'completed',
              thought: '需要判断是否存在含水抬升导致有效产液下降。',
              action: ['调用：异常检测通用智能体', 'NL2SQL', '含水率异常点检测', '邻井类比工具'],
              observation: '含水率由 32% 上升至 37%。',
              plan: '汇总多指标归因并生成诊断图。'
            }
          },
          {
            id: `msg-pro-9`,
            role: 'model',
            agentId: leaderAgent.id,
            content: '',
            timestamp: Date.now() - 3500,
            status: 'completed',
            cardType: 'stage_result',
            payload: {
              title: '阶段结论',
              finding: '含水率抬升加剧了有效产量下降。',
              points: []
            }
          },
          {
            id: `msg-pro-10`,
            role: 'model',
            agentId: agents.find(a => a.name === '生产分析岗')?.id || agents[1].id,
            content: '',
            timestamp: Date.now() - 3000,
            status: 'completed',
            cardType: 'loop',
            payload: {
              title: '第4轮｜多指标联动成图',
              status: 'completed',
              thought: '需要直观展示产量、压力、含水率联动关系。',
              action: ['调用：ECharts MCP'],
              observation: '三指标变化趋势高度同步。',
              plan: '生成最终诊断结论。'
            }
          },
          {
            id: `msg-pro-11`,
            role: 'model',
            agentId: agents.find(a => a.name === '生产分析岗')?.id || agents[1].id,
            content: '',
            timestamp: Date.now() - 2500,
            status: 'completed',
            cardType: 'chart',
            payload: {
              title: 'X-1井产量-压力-含水率联动诊断图',
              observation: '三指标变化趋势高度同步。'
            }
          },
          {
            id: `msg-pro-12`,
            role: 'model',
            agentId: leaderAgent.id,
            content: '诊断完成',
            timestamp: Date.now() - 1000,
            status: 'completed',
            payload: {
              conclusion: 'X-1井近7日产量下降主要由井底压力持续下降（一级主因）和含水率持续抬升（二级叠加因素）共同导致。',
              recommendations: [
                '调整生产压差',
                '关注供液能力',
                '优化注采参数',
                '提升含水监测频率'
              ],
              outputs: ['三指标联动诊断图', '原因分析摘要', '异常诊断报告']
            }
          }
        ];
        setMessages(professionalMockMessages);
      } else {
        const initialMessages: Message[] = [
          {
            id: `msg-init-1`,
            role: 'user',
            content: '你有哪些能力',
            timestamp: Date.now() - 2000
          },
          {
            id: `msg-init-2`,
            role: 'model',
            agentId: leaderAgent.id,
            content: `您好！我是当前工作空间的 Leader Agent。在这个空间中，我协调了一支专业的数字专家团队来为您服务：\n\n${agents.filter(a => !a.isLeader).map(a => `- **${a.name}**：${a.description}`).join('\n')}\n\n您可以直接提问，我会为您分配最合适的专家；或者您也可以使用 \`@\` 符号直接呼叫特定的专家。请问有什么我可以帮您的吗？`,
            timestamp: Date.now() - 1000,
            status: 'completed'
          }
        ];
        setMessages(initialMessages);
      }
    }
  }, [workspaceVersion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    // Check for @ mention
    const lastAtPos = value.lastIndexOf('@');
    if (lastAtPos !== -1) {
      const textAfterAt = value.substring(lastAtPos + 1);
      if (!textAfterAt.includes(' ')) {
        setShowMentionMenu(true);
        setMentionFilter(textAfterAt);
      } else {
        setShowMentionMenu(false);
      }
    } else {
      setShowMentionMenu(false);
    }
  };

  const handleMentionSelect = (agent: Agent) => {
    const lastAtPos = input.lastIndexOf('@');
    const newValue = input.substring(0, lastAtPos) + `@${agent.name} ` + input.substring(lastAtPos + mentionFilter.length + 1);
    setInput(newValue);
    setShowMentionMenu(false);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowMentionMenu(false);
    setIsGenerating(true);
    onChatStart();

    if (workspaceVersion === 'professional') {
      const scenarioAgent = agents.find(a => a.name === '生产分析岗') || agents[1];
      try {
        // 1. Thought (思考)
        const thoughtId = `msg-thought-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: thoughtId,
          role: 'model',
          agentId: leaderAgent.id,
          content: `**问题理解**：针对 X-1 井近 7 天的产量下降情况进行深度诊断，并输出归因分析及优化建议。

**意图识别**：
- 场景识别：产量下降诊断场景。
- 执行链路：产量趋势 -> 压力诊断 -> 含水异常 -> 联动归因 -> 图件生成。

**调用计划**：
1. 启动 **产量下降诊断** 场景智能体。
2. 按照标准 Workflow 执行 5 个关键节点的分析。`,
          timestamp: Date.now(),
          status: 'completed'
        }]);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 2. Workflow Card
        const workflowId = `msg-workflow-${Date.now()}`;
        const initialSteps = [
          { name: '产量趋势分析', details: null },
          { name: '压力变化诊断', details: null },
          { name: '含水率异常检测', details: null },
          { name: '多指标联动归因', details: null },
          { name: '诊断图件生成', details: null }
        ];

        setMessages(prev => [...prev, {
          id: workflowId,
          role: 'model',
          agentId: scenarioAgent.id,
          content: '',
          timestamp: Date.now(),
          status: 'processing',
          cardType: 'workflow',
          payload: {
            title: '产量下降模版',
            category: '异常诊断',
            steps: initialSteps,
            currentStep: 1,
            status: '正在执行：步骤 1 / 5'
          }
        }]);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Update Step 1 details
        setMessages(prev => prev.map(msg => msg.id === workflowId ? {
          ...msg,
          payload: {
            ...msg.payload,
            steps: msg.payload.steps.map((s: any, i: number) => i === 0 ? {
              ...s,
              details: {
                thought: '先确认近7日产量是否为持续下降。',
                action: ['调用：趋势分析通用智能体', 'NL2SQL', '递减率计算工具'],
                observation: '近7日产量由 102.3 下放至 95.9，累计下降 6.3%。'
              }
            } : s),
            currentStep: 2,
            status: '正在执行：步骤 2 / 5'
          }
        } : msg));
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Update Step 2 details
        setMessages(prev => prev.map(msg => msg.id === workflowId ? {
          ...msg,
          payload: {
            ...msg.payload,
            steps: msg.payload.steps.map((s: any, i: number) => i === 1 ? {
              ...s,
              details: {
                thought: '判断产量递减是否由供液压力下降导致。',
                action: ['调用：压力诊断通用智能体', 'NL2CQL', '压降速率工具'],
                observation: '井底压力近7天下降 8.1%，与产量递减同步。'
              }
            } : s),
            currentStep: 3,
            status: '正在执行：步骤 3 / 5'
          }
        } : msg));
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update Step 5 details
        setMessages(prev => prev.map(msg => msg.id === workflowId ? {
          ...msg,
          payload: {
            ...msg.payload,
            steps: msg.payload.steps.map((s: any, i: number) => i === 4 ? {
              ...s,
              details: {
                thought: '将归因分析结果可视化，生成多指标联动诊断图。',
                action: ['调用：数据成图通用智能体', 'ECharts 渲染引擎'],
                observation: '多指标联动归因诊断图已生成，包含产量、压力、含水率三曲线对比。',
                plan: '输出最终诊断报告。'
              }
            } : s),
            currentStep: 5,
            status: '正在执行：步骤 5 / 5'
          }
        } : msg));
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Complete Workflow
        setMessages(prev => prev.map(msg => msg.id === workflowId ? {
          ...msg,
          status: 'completed',
          payload: {
            ...msg.payload,
            currentStep: 6,
            status: '执行完成'
          }
        } : msg));

        // 3. Stage Result
        const stageId = `msg-stage-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: stageId,
          role: 'model',
          agentId: leaderAgent.id,
          content: '',
          timestamp: Date.now(),
          status: 'completed',
          cardType: 'stage_result',
          payload: { 
            title: '阶段结论', 
            finding: 'X-1井产量下降主因为井底压力不足，次因为含水率波动。',
            points: ['压力递减率 1.2%/天', '含水率上升 0.5%']
          }
        }]);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 4. Chart Card (Integrated into flow)
        const chartId = `msg-chart-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: chartId,
          role: 'model',
          agentId: agents.find(a => a.name === '数据成图')?.id || 'agent-chart',
          content: '',
          timestamp: Date.now(),
          status: 'completed',
          cardType: 'chart',
          payload: { 
            title: '多指标联动归因诊断图', 
            observation: '图中清晰显示产量下降（蓝线）与压力下降（红线）的正相关性，同时含水率（绿线）呈缓慢上升趋势。',
            data: [
              { label: '产量 (m³/d)', values: [102, 101.5, 99.8, 98.2, 97.5, 96.8, 95.9], color: '#4f46e5' },
              { label: '压力 (MPa)', values: [25.2, 24.8, 24.1, 23.5, 23.2, 22.8, 22.5], color: '#ef4444' },
              { label: '含水率 (%)', values: [14.8, 15.1, 15.4, 15.9, 16.3, 16.7, 17.2], color: '#10b981' }
            ]
          }
        }]);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 5. Final Result
        const finalId = `msg-final-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: finalId,
          role: 'model',
          agentId: leaderAgent.id,
          content: '诊断完成',
          timestamp: Date.now(),
          status: 'completed',
          payload: {
            conclusion: 'X-1井近7日产量下降主要由井底压力持续下降（一级主因）和含水率持续抬升（二级叠加因素）共同导致。',
            recommendations: ['调整生产压差', '关注供液能力', '优化注采参数'],
            outputs: ['多指标联动归因诊断图', '原因分析摘要']
          }
        }]);

      } catch (e) { console.error(e); } finally { setIsGenerating(false); }
      return;
    }

    if (workspaceVersion === 'foundation') {
      const dataAgent = agents.find(a => a.name === '智能问数') || agents[1];
      const chartAgent = agents.find(a => a.name === '数据成图') || agents[2] ;
      
      try {
        // 1. Leader Breakdown
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

        // 2. Loop 1: NL2SQL
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

        // 3. Stage Result
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

        // 4. Loop 2: ECharts
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

        // 5. Chart Card
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

        // 6. Final Result
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
      } catch (e) { console.error(e); } finally { setIsGenerating(false); }
      return;
    }

    if (workspaceVersion === 'enterprise' || workspaceVersion === 'flagship') {
      const productionAgent = agents.find(a => a.name === '生产管理专家') || agents[1];

      try {
        // 1. Thought (思考)
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
1. 调度 **生产管理专家** 岗位智能体。
2. 岗位智能体将协同 4 个场景智能体并行工作。`,
          timestamp: Date.now(),
          status: 'completed'
        }]);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 2. Position Agent Task Decomposition
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
          { 
            name: '场景2: 压力系统诊断 Agent', 
            task: '看压力是否异常', 
            status: 'pending',
            workflow: {
              steps: [
                { name: '压力剖面分析', details: null },
                { name: '供液能力评估', details: null }
              ],
              currentStep: 0
            }
          },
          { name: '场景3: 措施有效性评估 Agent', task: '历史措施是否失效', status: 'pending' },
          { name: '场景4: 未来稳产预测 Agent', task: '未来3天产量预测', status: 'pending' }
        ];

        setMessages(prev => [...prev, {
          id: positionDecompId,
          role: 'model',
          agentId: productionAgent.id,
          content: '',
          timestamp: Date.now(),
          status: 'processing',
          cardType: 'position',
          payload: {
            title: '生产管理专家',
            scenarios: initialScenarios
          }
        }]);

        await new Promise(resolve => setTimeout(resolve, 2000));

        setMessages(prev => prev.map(msg => 
          msg.id === positionDecompId ? {
            ...msg,
            status: 'completed',
            payload: {
              ...msg.payload,
              scenarios: msg.payload.scenarios.map((s: any, i: number) => ({ 
                ...s, 
                status: 'completed',
                workflow: s.workflow ? { ...s.workflow, currentStep: s.workflow.steps.length } : undefined
              }))
            }
          } : msg
        ));

        // 3. Stage Result 1
        const stageResult1Id = `msg-stage1-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: stageResult1Id,
          role: 'model',
          agentId: leaderAgent.id,
          content: '',
          timestamp: Date.now(),
          status: 'completed',
          cardType: 'stage_result',
          payload: {
            title: '阶段结论 1',
            finding: '供液能力下降为一级主因',
            points: ['井底流压48小时下降超阈值 15%', '产量下降与压力下降趋势高度相关', '含水率上升加剧供液压力']
          }
        }]);

        await new Promise(resolve => setTimeout(resolve, 1500));

        // 4. Final Result
        const finalResultId = `msg-final-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: finalResultId,
          role: 'model',
          agentId: leaderAgent.id,
          content: '综合各位专家的分析结果',
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

      } catch (error) {
        console.error('Error in Agentic flow:', error);
      } finally {
        setIsGenerating(false);
      }
      return;
    }
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
        ? '当前为专业版空间，已集成生产分析、勘探评价等专业场景智能体。支持复杂业务流编排与多维度联动诊断。'
        : 'Current: Professional version. Integrated with production analysis and exploration agents. Supports workflow orchestration and multi-dimensional diagnosis.';
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
        { text: lang === 'zh' ? '预测 A2 井未来 15 天的含水率变化' : 'Predict water cut change of Well A2 for next 15 days', icon: 'fa-crystal-ball' }
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
      {/* Top Right History Button */}
      <div className="absolute top-4 right-6 z-20">
        <button 
          onClick={() => setIsHistoryModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:bg-white text-gray-600 hover:text-indigo-600 transition-all text-xs font-medium"
        >
          <i className="fas fa-history"></i>
          {lang === 'zh' ? '历史记录' : 'History'}
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
            
            <div className="p-4 border-b border-gray-100">
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
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {historySessions.filter(s => s.title.includes(historySearchQuery) || s.preview.includes(historySearchQuery)).length > 0 ? (
                historySessions.filter(s => s.title.includes(historySearchQuery) || s.preview.includes(historySearchQuery)).map(session => (
                  <div key={session.id} className="group p-3 hover:bg-indigo-50 rounded-xl cursor-pointer transition-all border border-transparent hover:border-indigo-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-800 text-sm truncate mb-0.5">{session.title}</div>
                        <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
                          <i className="far fa-clock"></i> {session.date}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{session.preview}</div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setHistorySessions(prev => prev.filter(s => s.id !== session.id));
                        }}
                        className="w-8 h-8 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-gray-400 transition-all"
                      >
                        <i className="far fa-trash-alt"></i>
                      </button>
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
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-500 shadow-sm">
              <i className="fas fa-sparkles text-2xl"></i>
            </div>
            
            <div className="text-center mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                {lang === 'zh' ? '欢迎使用智能协作空间' : 'Welcome to AI Workspace'}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed px-4">
                {getVersionSummary()}
              </p>
            </div>

            <div className="w-full grid grid-cols-1 gap-3">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">
                {lang === 'zh' ? '推荐问题示例' : 'Recommended Questions'}
              </div>
              {getRecommendedQuestions().map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(q.text);
                    inputRef.current?.focus();
                  }}
                  className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl text-left hover:border-indigo-300 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                    <i className={`fas ${q.icon}`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">{q.text}</div>
                  </div>
                  <i className="fas fa-chevron-right text-gray-300 text-xs group-hover:text-indigo-400 transition-colors"></i>
                </button>
              ))}
            </div>
          </div>
        ) : (
          groupedMessages.map((group, gIndex) => {
            if (group.type === 'user') {
              return <UserMessageCard key={group.messages[0].id} message={group.messages[0]} />;
            }

            // Use UnifiedResponseCard for all versions to group model messages into a single card
            return <UnifiedResponseCard key={`group-${gIndex}`} messages={group.messages} agents={agents} version={workspaceVersion} />;
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 relative">
        {/* Mention Menu */}
        {showMentionMenu && (
          <div className="absolute bottom-full left-4 mb-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500">
              {lang === 'zh' ? '选择智能体' : 'Select Agent'}
            </div>
            <div className="max-h-48 overflow-y-auto">
              {agents.filter(a => a.name.toLowerCase().includes(mentionFilter.toLowerCase())).map(agent => (
                <div 
                  key={agent.id} 
                  onClick={() => handleMentionSelect(agent)}
                  className="px-3 py-2 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm border border-gray-200">
                    {agent.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">{agent.name}</div>
                    <div className="text-[10px] text-gray-500">{agent.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto flex flex-col gap-2">
          {isGenerating && (
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg w-fit">
              <i className="fas fa-circle-notch fa-spin"></i> {lang === 'zh' ? '多智能体协作执行中...' : 'Multi-Agent Collab Running...'}
            </div>
          )}
          <div className="relative flex items-end gap-2">
            <div className="flex-1 relative bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all flex items-end p-1">
              <button className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex-shrink-0">
                <i className="fas fa-paperclip"></i>
              </button>
              <button 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex-shrink-0"
                onClick={() => {
                  setInput(prev => prev + '@');
                  setShowMentionMenu(true);
                  setMentionFilter('');
                  inputRef.current?.focus();
                }}
              >
                <i className="fas fa-at"></i>
              </button>
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
                placeholder={lang === 'zh' ? '输入问题，输入 @ 呼叫专家...' : 'Type a message, use @ to mention...'}
                className="flex-1 bg-transparent border-none px-2 py-2.5 text-sm focus:outline-none resize-none min-h-[40px] max-h-32"
                rows={1}
                style={{ height: 'auto' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all shadow-sm ${
                !input.trim() || isGenerating 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
              }`}
            >
              {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
