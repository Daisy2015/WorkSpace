import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  icon?: string;
  children?: FileItem[];
  content?: string;
  language?: string;
}

interface HarnessFileExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'zh' | 'en';
}

export const HarnessFileExplorer: React.FC<HarnessFileExplorerProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const isZh = lang === 'zh';

  // Construct Mock File System for the Harness Project
  const fileSystemData = useMemo<FileItem[]>(() => [
    {
      name: 'README.md',
      type: 'file',
      path: 'README.md',
      icon: 'fa-file-alt text-emerald-500',
      language: 'markdown',
      content: `# 🚀 Harness 评测与闭环控制工程 (Harness Evaluation & Control)

本工作空间是一个完整的 **Agent 智能闭环评测与工程控制台**。它提供了对地质设计专家、产量诊断、专业成图等 Agent 的运行、监控、评测一体化能力。

## 📂 核心目录结构
- **\`/app\`** — 核心业务画布与前端节点流程拓扑图。
- **\`/agent\`** — 智能体大脑，包含系统级 Prompt 策略、流程编排、工具注册等。
- **\`/datasets\`** — 用于评测智能体精度的回归数据集和标注金标准。
- **\`/results\`** — 运行审计日志，以及全量评测精度、鲁棒性对比报告。

---

## 🛠 快速上手
1. 选择目标对象（例如 \`X-1井\`），在平台启动 **专业版 Agent**。
2. 运行自动生成链，输出成果物文件。
3. 在左侧资源树中查看输出，并在本控制台的 \`results/\` 目录下查看最新诊断与评测成果。
`,
    },
    {
      name: 'harness_config.json',
      type: 'file',
      path: 'harness_config.json',
      icon: 'fa-cog text-slate-500',
      language: 'json',
      content: `{
  "project_name": "mbu-geodesign-harness",
  "target_agent": "DrillingGeoDesignExpert",
  "eval_metrics": [
    "completeness",
    "depth_accuracy",
    "robustness",
    "no_hallucination"
  ],
  "runner_settings": {
    "concurrency": 4,
    "timeout_seconds": 180,
    "retry_attempts": 2
  }
}`,
    },
    {
      name: 'app',
      type: 'folder',
      path: 'app',
      children: [
        {
          name: 'workflow.json',
          type: 'file',
          path: 'app/workflow.json',
          icon: 'fa-project-diagram text-indigo-500',
          language: 'json',
          content: `{
  "workflow_id": "construction-v2-main",
  "name": "地质设计自动化智能装配流程",
  "version": "2.1.0",
  "nodes": [
    { "id": "node-1", "type": "input", "label": "录井设计数据源导入" },
    { "id": "node-2", "type": "agent", "label": "地层专家智能分析" },
    { "id": "node-3", "type": "agent", "label": "工程参数自动推荐" },
    { "id": "node-4", "type": "output", "label": "生成标准地质设计书" }
  ],
  "edges": [
    { "source": "node-1", "target": "node-2" },
    { "source": "node-2", "target": "node-3" },
    { "source": "node-3", "target": "node-4" }
  ]
}`,
        },
      ],
    },
    {
      name: 'agent',
      type: 'folder',
      path: 'agent',
      children: [
        {
          name: 'agent_prompts.md',
          type: 'file',
          path: 'agent/agent_prompts.md',
          icon: 'fa-robot text-purple-500',
          language: 'markdown',
          content: `# 🤖 钻井地质设计专家 - System Prompts

你是一名资深的地层和地质工程设计专家、智能体助手。你的主要任务是根据输入的录井、地层、钻头和邻井历史资料，自动编写高效、安全的钻井地质设计书。

## 📋 执行准则
1. **地层预测**：必须对比至少 3 口邻井的标志层深度，使用厚度比例法进行预测。
2. **风险预警**：对浅层气、漏失、断层和高压层进行明确标记与风险评估。
3. **钻井参数建议**：提供基于岩性硬度特征的钻压、转速、排量参考区间。

## 📝 输出要求
必须生成完整的地质设计 Markdown 报告，包含地质基本特征预测、工程安全措施等。
`,
        },
        {
          name: 'tools.json',
          type: 'file',
          path: 'agent/tools.json',
          icon: 'fa-tools text-amber-500',
          language: 'json',
          content: `{
  "tools": [
    {
      "name": "query_geological_knowledge",
      "description": "查询地质知识库以获取地层参数与同地区地质异常记录",
      "parameters": {
        "type": "object",
        "properties": {
          "region": { "type": "string", "description": "目标油田或区块名称" },
          "formation_name": { "type": "string", "description": "目标地层层位名称" }
        },
        "required": ["region"]
      }
    },
    {
      "name": "calculate_three_pressures",
      "description": "输入声波时差与密度数据，自动计算孔隙压力、破裂压力与上覆岩层压力",
      "parameters": {
        "type": "object",
        "properties": {
          "well_id": { "type": "string" },
          "intervals": { "type": "array", "items": { "type": "number" } }
        }
      }
    }
  ]
}`,
        },
        {
          name: 'runtime.ts',
          type: 'file',
          path: 'agent/runtime.ts',
          icon: 'fa-code text-blue-500',
          language: 'typescript',
          content: `import { GoogleGenAI } from '@google/genai';

export async function runAgentExecutor(wellId: string, inputData: any) {
  console.log('[Harness] Executing Geo-Design Agent for well:', wellId);
  
  const ai = new GoogleGenAI();
  const systemPrompt = await loadPrompt('agent/agent_prompts.md');
  
  // Call model with tools and structured system prompt
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: systemPrompt + '\\n\\n' + JSON.stringify(inputData),
    config: {
      temperature: 0.1,
    }
  });

  return response.text;
}`,
        },
      ],
    },
    {
      name: 'datasets',
      type: 'folder',
      path: 'datasets',
      children: [
        {
          name: 'golden_cases.json',
          type: 'file',
          path: 'datasets/golden_cases.json',
          icon: 'fa-database text-rose-500',
          language: 'json',
          content: `[
  {
    "case_id": "GOLD-001",
    "well_name": "Well X-1",
    "target_depth": 3500,
    "stratigraphy": {
      "Sha-3": 2100,
      "Sha-4": 2850,
      "Kongdian": 3210
    },
    "golden_design_outline": [
      "1. 预测三压力曲线",
      "2. 录井工程方案设计",
      "3. 溢流漏失应急预案"
    ]
  },
  {
    "case_id": "GOLD-002",
    "well_name": "Jinzhou 25-1 South",
    "target_depth": 4200,
    "stratigraphy": {
      "Dongying": 1800,
      "Shahejie": 2600
    },
    "golden_design_outline": [
      "1. 海底地层浅气层预警",
      "2. 井身结构三开优化建议"
    ]
  }
]`,
        },
      ],
    },
    {
      name: 'results',
      type: 'folder',
      path: 'results',
      children: [
        {
          name: 'diagnostic_report.md',
          type: 'file',
          path: 'results/diagnostic_report.md',
          icon: 'fa-chart-line text-cyan-500',
          language: 'markdown',
          content: `# 📊 智能体自动评测与效果诊断报告

- **评估时间**: 2026-07-09
- **测试批次**: V2.4-Enterprise
- **基准数据集**: \`datasets/golden_cases.json\`
- **总评测例数**: 50

## 📈 核心指标看板
| 评测维度 | 指标值 | 目标值 | 达标状态 | 细节说明 |
| :--- | :--- | :--- | :--- | :--- |
| **任务完成度** | 98.0% | >95.0% | ✅ 达标 | 绝大部分地质设计能够顺利产出成果 |
| **地层深度预测精度** | ±2.4m | <±5.0m | ✅ 达标 | 预测偏差大幅度优于传统人工估算 |
| **逻辑调用鲁棒性** | 96.0% | >90.0% | ✅ 达标 | 工具异常调用自修复率 100% |
| **幻觉发生率** | 0.8% | <1.0% | ✅ 达标 | 已结合 RAG 知识检索实现事实对齐 |

---

## ⚠️ 潜在缺陷与优化建议
1. **复杂断裂层处理**: 在断层破碎带等复杂区域，部分地层深度预测存在 8 米以上的偏差，建议后续在 \`datasets/\` 中增加相应断层发育区的样本。
2. **工具链调用延迟**: \`SQLRunner\` 与地层物理模型交互工具的平均耗时在 1.2 秒左右，可考虑加入查询结果缓存。
`,
        },
      ],
    },
  ], []);

  // Track expanded folder paths
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'app': true,
    'agent': true,
    'datasets': true,
    'results': true,
  });

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Track selected file
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(fileSystemData[0]);

  if (!isOpen) return null;

  // Render the File Tree recursively
  const renderTree = (items: FileItem[], level = 0) => {
    return items.map((item) => {
      const isFolder = item.type === 'folder';
      const isExpanded = expandedFolders[item.path];
      const isSelected = selectedFile?.path === item.path;

      if (isFolder) {
        return (
          <div key={item.path} className="flex flex-col">
            <button
              onClick={() => toggleFolder(item.path)}
              className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-50 rounded-lg text-slate-700 text-left transition-colors"
              style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
              <i className={`fas ${isExpanded ? 'fa-chevron-down text-slate-400' : 'fa-chevron-right text-slate-400'} text-[9px] w-3`}></i>
              <i className={`fas ${isExpanded ? 'fa-folder-open' : 'fa-folder'} text-amber-400 text-sm`}></i>
              <span className="text-xs font-semibold truncate">{item.name}</span>
            </button>
            {isExpanded && item.children && (
              <div className="flex flex-col relative before:absolute before:left-[17px] before:top-0 before:bottom-3 before:w-px before:bg-slate-100">
                {renderTree(item.children, level + 1)}
              </div>
            )}
          </div>
        );
      }

      // It's a file
      return (
        <button
          key={item.path}
          onClick={() => setSelectedFile(item)}
          className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-left transition-all ${
            isSelected 
              ? 'bg-indigo-50 border border-indigo-100/60 text-indigo-700 font-semibold shadow-xs shadow-indigo-50/40' 
              : 'hover:bg-slate-50 text-slate-600'
          }`}
          style={{ paddingLeft: `${level * 16 + 22}px` }}
        >
          <i className={`fas ${item.icon || 'fa-file-code text-slate-400'} text-xs w-3.5 text-center`}></i>
          <span className="text-xs truncate">{item.name}</span>
        </button>
      );
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div 
        className="fixed inset-y-0 right-0 w-full max-w-4xl bg-slate-50 shadow-2xl border-l border-slate-200 z-50 flex flex-col h-full overflow-hidden transform transition-transform duration-300 ease-out select-none"
        id="harness-file-explorer-drawer"
      >
        {/* Header */}
        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-xs">
              <i className="fas fa-cubes text-sm"></i>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 tracking-tight">
                {isZh ? '工作空间目录与配置文件' : 'Harness Configuration & Files'}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                {isZh ? '当前工作空间评测工程 Harness 文件结构' : 'Harness project structure and logs in active workspace'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
            id="btn-close-harness-drawer"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Content Body (Split view) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: File list / tree */}
          <div className="w-72 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto custom-scrollbar p-3 gap-1">
            <div className="px-2 py-1 mb-2">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">
                {isZh ? '工程目录' : 'Harness Directory'}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              {renderTree(fileSystemData)}
            </div>
          </div>

          {/* Right Panel: File viewer */}
          <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden relative">
            {selectedFile ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* File Info Bar */}
                <div className="h-11 bg-white border-b border-slate-200 px-5 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <i className={`fas ${selectedFile.icon || 'fa-file'} text-xs`}></i>
                    <span className="text-xs font-bold text-slate-700 tracking-tight">{selectedFile.path}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                      {selectedFile.language}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (selectedFile.content) {
                        navigator.clipboard.writeText(selectedFile.content);
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-all"
                  >
                    <i className="fas fa-copy"></i>
                    <span>{isZh ? '复制内容' : 'Copy'}</span>
                  </button>
                </div>

                {/* Document Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50">
                  {selectedFile.language === 'markdown' ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-none">
                      <div className="markdown-body">
                        <ReactMarkdown>{selectedFile.content || ''}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-300 shadow-sm overflow-x-auto whitespace-pre leading-relaxed relative">
                      <div className="absolute right-3 top-3 text-[10px] text-slate-600 font-bold tracking-wider select-none uppercase">
                        {selectedFile.language}
                      </div>
                      <code>{selectedFile.content}</code>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 select-none">
                <div className="w-16 h-16 bg-white border border-slate-100 shadow-lg rounded-2xl flex items-center justify-center text-slate-300 mb-4 animate-bounce duration-1000">
                  <i className="fas fa-file-alt text-2xl"></i>
                </div>
                <h4 className="text-sm font-black text-slate-800 tracking-tight">
                  {isZh ? '请选择一个文件' : 'Select a File to Preview'}
                </h4>
                <p className="text-xs text-slate-400 font-medium max-w-[280px] mt-1">
                  {isZh ? '在左侧工程目录中点击任意文件，即可在此处查看其代码结构或 Markdown 渲染预览' : 'Click any file in the harness workspace tree on the left to view its structured content.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 bg-white border-t border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isZh ? '自动化评测评判引擎 Ready' : 'Auto Eval Grader Engine Ready'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            {isZh ? '关闭面板' : 'Close'}
          </button>
        </div>
      </div>
    </>
  );
};
