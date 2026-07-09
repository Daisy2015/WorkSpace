import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, LLMLogEntry } from '../types';

interface AdminLLMLogsProps {
  lang: Language;
}

const INITIAL_LOGS: LLMLogEntry[] = [
  {
    id: 'log-llm-101',
    modelCode: 'qwen-max',
    modelName: '通义千问-Max',
    startTime: '2026-07-08 20:45:12',
    durationMs: 1680,
    inputTokens: 124,
    outputTokens: 485,
    totalTokens: 609,
    status: 'success',
    input: '请写一篇关于油田注水开采技术的简短总结。',
    output: '油田注水开采技术是保持油层压力、提高油田采收率的重要手段。该方法通过注水井向油层注入高压水，补充油层能量，驱动原油向生产井流动。核心环节包括：\n1. 注水水源与水质控制：需经过除砂、除氧、杀菌等处理防止堵塞与腐蚀。\n2. 注水工艺：可采用分层注水技术以解决油层非均质性问题。\n3. 注水方案优化：通过数值模拟动态调整注采比。',
    caller: 'JuraWorkSpace'
  },
  {
    id: 'log-llm-102',
    modelCode: 'gpt-4o',
    modelName: 'GPT-4o',
    startTime: '2026-07-08 20:30:45',
    durationMs: 2240,
    inputTokens: 45,
    outputTokens: 312,
    totalTokens: 357,
    status: 'success',
    input: 'Explain the concept of Reservoir Simulation.',
    output: 'Reservoir simulation is an area of reservoir engineering in which computer models are used to predict the flow of fluids (typically, oil, gas, and water) through porous media. It combines physics, mathematics, and computer science to help engineers understand how a reservoir will perform under various development strategies.',
    caller: '动态分析APP'
  },
  {
    id: 'log-llm-103',
    modelCode: 'deepseek-chat',
    modelName: 'DeepSeek-V3',
    startTime: '2026-07-08 20:12:03',
    durationMs: 1450,
    inputTokens: 250,
    outputTokens: 618,
    totalTokens: 868,
    status: 'success',
    input: '对以下地震解释异常数据进行初步诊断，给出可能的物性解释：低阻、中高声波时差、中子-密度交叉。',
    output: '根据您提供的异常段测井响应（低阻、中高声波时差、中子-密度交叉明显）：\n1. 可能是由于断层带泥质填充或局部裂缝带高含水引起。\n2. 建议核对该异常段在过井地震剖面上的振幅响应是否呈强振幅、低频的“亮点”特征。',
    caller: '智能成图APP'
  },
  {
    id: 'log-llm-104',
    modelCode: 'ernie-4.0',
    modelName: '文心一言 4.0',
    startTime: '2026-07-08 19:58:14',
    durationMs: 3100,
    inputTokens: 110,
    outputTokens: 0,
    totalTokens: 110,
    status: 'failed',
    errorMsg: 'API Connection Timeout. Please check your server base_url configuration or check the service provider status.',
    input: '分析钻井液密度对井壁稳定性的影响机制。',
    output: '',
    caller: 'JuraWorkSpace'
  },
  {
    id: 'log-llm-105',
    modelCode: 'qwen-max',
    modelName: '通义千问-Max',
    startTime: '2026-07-08 18:22:41',
    durationMs: 1850,
    inputTokens: 88,
    outputTokens: 352,
    totalTokens: 440,
    status: 'success',
    input: '总结水平井在油田开发中的核心优势。',
    output: '水平井在油田开发中的核心优势主要体现在：\n1. 增大油层泄油面积：水平段可以长达数百至上千米，显著提高单井产能（通常是直井的3-5倍）。\n2. 延缓底水锥进：对底水油藏能实现更加平稳的驱动。',
    caller: '动态分析APP'
  }
];

export const AdminLLMLogs: React.FC<AdminLLMLogsProps> = ({ lang }) => {
  const isZh = lang === 'zh';

  const [logs, setLogs] = useState<LLMLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedCaller, setSelectedCaller] = useState('all');
  const [selectedLog, setSelectedLog] = useState<LLMLogEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Time range filters
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Helper for model english names
  const getModelEnglishName = (code: string) => {
    const mapping: Record<string, string> = {
      'qwen-max': 'Qwen Max',
      'gemini-2.5-pro': 'Gemini 2.5 Pro',
      'gpt-4o': 'GPT-4o',
      'claude-3-5-sonnet': 'Claude 3.5 Sonnet',
      'deepseek-chat': 'DeepSeek-V3',
      'ernie-4.0': 'ERNIE 4.0'
    };
    return mapping[code] || code;
  };

  // Load from localStorage or seed
  useEffect(() => {
    const stored = localStorage.getItem('llm_call_logs');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const hasCaller = parsed.length > 0 && parsed.some((x: any) => 'caller' in x);
        if (!hasCaller) {
          localStorage.setItem('llm_call_logs', JSON.stringify(INITIAL_LOGS));
          setLogs(INITIAL_LOGS);
        } else {
          setLogs(parsed);
        }
      } catch (e) {
        setLogs(INITIAL_LOGS);
      }
    } else {
      localStorage.setItem('llm_call_logs', JSON.stringify(INITIAL_LOGS));
      setLogs(INITIAL_LOGS);
    }
  }, []);

  // Save back on changes (for deletions or clears)
  const updateLogsStateAndStorage = (newLogs: LLMLogEntry[]) => {
    setLogs(newLogs);
    localStorage.setItem('llm_call_logs', JSON.stringify(newLogs));
  };

  // Get unique model codes for filter dropdown
  const uniqueModels = Array.from(new Set(logs.map(log => JSON.stringify({ code: log.modelCode, name: log.modelName }))));

  // Clear all logs removed

  // Export logs to JSON
  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `llm_call_logs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle individual deletion
  const handleDeleteLog = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(isZh ? '确定要删除这条日志吗？' : 'Are you sure you want to delete this log?')) {
      const filtered = logs.filter(log => log.id !== id);
      updateLogsStateAndStorage(filtered);
      if (selectedLog?.id === id) {
        setSelectedLog(null);
      }
    }
  };

  // Get unique callers for filter dropdown
  const uniqueCallers = Array.from(new Set(logs.map(log => log.caller || (isZh ? '模型测试' : 'Admin Test'))));

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const callerStr = log.caller || (isZh ? '模型测试' : 'Admin Test');
    const matchesSearch = 
      getModelEnglishName(log.modelCode).toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.modelCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.output.toLowerCase().includes(searchTerm.toLowerCase()) ||
      callerStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.errorMsg && log.errorMsg.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesModel = selectedModel === 'all' || log.modelCode === selectedModel;
    const matchesCaller = selectedCaller === 'all' || (log.caller || (isZh ? '模型测试' : 'Admin Test')) === selectedCaller;

    // Time filter
    let matchesTime = true;
    if (selectedTimeRange === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      matchesTime = log.startTime.startsWith(todayStr);
    } else if (selectedTimeRange === '24h') {
      const logTime = new Date(log.startTime.replace(/-/g, '/')).getTime();
      const nowTime = new Date().getTime();
      matchesTime = (nowTime - logTime) <= 24 * 60 * 60 * 1000;
    } else if (selectedTimeRange === '7d') {
      const logTime = new Date(log.startTime.replace(/-/g, '/')).getTime();
      const nowTime = new Date().getTime();
      matchesTime = (nowTime - logTime) <= 7 * 24 * 60 * 60 * 1000;
    } else if (selectedTimeRange === '30d') {
      const logTime = new Date(log.startTime.replace(/-/g, '/')).getTime();
      const nowTime = new Date().getTime();
      matchesTime = (nowTime - logTime) <= 30 * 24 * 60 * 60 * 1000;
    } else if (selectedTimeRange === 'custom') {
      const logDateStr = log.startTime.split(' ')[0]; // YYYY-MM-DD
      const matchesStart = !startDate || logDateStr >= startDate;
      const matchesEnd = !endDate || logDateStr <= endDate;
      matchesTime = matchesStart && matchesEnd;
    }

    return matchesSearch && matchesModel && matchesCaller && matchesTime;
  });

  // Pagination calculation
  const totalLogsCount = filteredLogs.length;
  const totalPages = Math.ceil(totalLogsCount / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedLogs = filteredLogs.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  // Calculate Aggregates
  const totalCalls = filteredLogs.length;
  const averageDuration = totalCalls > 0 ? Math.round(filteredLogs.reduce((acc, l) => acc + l.durationMs, 0) / totalCalls) : 0;
  const totalTokens = filteredLogs.reduce((acc, l) => acc + l.totalTokens, 0);

  // Copy text utility
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(type);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden" id="llm-logs-container">
      {/* Header Banner */}
      <div className="p-6 border-b border-gray-200 bg-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <i className="fas fa-list-alt text-indigo-600 mr-2.5"></i>
            {isZh ? '日志管理' : 'Log Management'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isZh ? '实时记录并监控大语言模型 API 调用的耗时、Token消耗及响应内容。' : 'Monitor LLM API calls, token costs, response durations, and payloads in real time.'}
          </p>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={handleExportLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-40"
          >
            <i className="fas fa-download"></i>
            {isZh ? '导出 JSON' : 'Export JSON'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/40 border-b border-gray-200">
        {/* Total Calls Card */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-lg">
            <i className="fas fa-network-wired"></i>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">
              {isZh ? '总调用次数' : 'Total Calls'}
            </span>
            <span className="text-2xl font-bold font-mono text-gray-800">{totalCalls}</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">{isZh ? '当前筛选下' : 'Current filter'}</span>
          </div>
        </div>

        {/* Avg Duration Card */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-lg">
            <i className="fas fa-history"></i>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">
              {isZh ? '平均响应耗时' : 'Avg Duration'}
            </span>
            <span className="text-2xl font-bold font-mono text-gray-800">{(averageDuration / 1000).toFixed(2)}s</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">{averageDuration} ms</span>
          </div>
        </div>

        {/* Total Tokens Card */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg">
            <i className="fas fa-coins"></i>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">
              {isZh ? '累计消耗 Tokens' : 'Total Tokens'}
            </span>
            <span className="text-2xl font-bold font-mono text-gray-800">{totalTokens.toLocaleString()}</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">{isZh ? '包含输入与输出' : 'Input & Output'}</span>
          </div>
        </div>
      </div>

      {/* Filter and Tool Bar */}
      <div className="p-4 bg-white border-b border-gray-200 flex flex-row items-center justify-between gap-4 overflow-x-auto whitespace-nowrap scrollbar-thin">
        {/* Search Input */}
        <div className="relative w-72 shrink-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400 text-xs">
            <i className="fas fa-search"></i>
          </span>
          <input
            type="text"
            placeholder={isZh ? "搜索模型、输入、输出..." : "Search model, prompt, response..."}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-row items-center gap-4 shrink-0">
          {/* Model Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{isZh ? '模型' : 'Model'}:</span>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                setCurrentPage(1);
              }}
              className="w-40 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white cursor-pointer font-medium text-gray-700"
            >
              <option value="all">{isZh ? '全部模型' : 'All Models'}</option>
              {uniqueModels.map(mStr => {
                const item = JSON.parse(mStr);
                return (
                  <option key={item.code} value={item.code}>
                    {getModelEnglishName(item.code)} ({item.code})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Caller Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{isZh ? '调用方' : 'Caller'}:</span>
            <select
              value={selectedCaller}
              onChange={(e) => {
                setSelectedCaller(e.target.value);
                setCurrentPage(1);
              }}
              className="w-36 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white cursor-pointer font-medium text-gray-700"
            >
              <option value="all">{isZh ? '全部调用方' : 'All Callers'}</option>
              {uniqueCallers.map(caller => (
                <option key={caller} value={caller}>
                  {caller}
                </option>
              ))}
            </select>
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{isZh ? '时间' : 'Time'}:</span>
            <select
              value={selectedTimeRange}
              onChange={(e) => {
                setSelectedTimeRange(e.target.value);
                setCurrentPage(1);
              }}
              className="w-36 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white cursor-pointer font-medium text-gray-700"
            >
              <option value="all">{isZh ? '全部时间' : 'All Time'}</option>
              <option value="today">{isZh ? '今天' : 'Today'}</option>
              <option value="24h">{isZh ? '最近24小时' : 'Last 24h'}</option>
              <option value="7d">{isZh ? '最近7天' : 'Last 7 Days'}</option>
              <option value="30d">{isZh ? '最近30天' : 'Last 30 Days'}</option>
              <option value="custom">{isZh ? '自定义范围...' : 'Custom Range...'}</option>
            </select>
          </div>

          {/* Custom Date Inputs */}
          {selectedTimeRange === 'custom' && (
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-1 animate-fade-in">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs focus:outline-none px-1.5 py-1 text-gray-700 cursor-pointer"
              />
              <span className="text-[10px] text-gray-400 font-bold px-0.5">{isZh ? '至' : 'to'}</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs focus:outline-none px-1.5 py-1 text-gray-700 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main content grid/table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-w-[700px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-bold">
                <th className="px-6 py-4">{isZh ? '开始时间' : 'Start Time'}</th>
                <th className="px-6 py-4">{isZh ? '调用模型' : 'Model'}</th>
                <th className="px-6 py-4">{isZh ? '模型调用方' : 'Caller'}</th>
                <th className="px-6 py-4">{isZh ? '耗时' : 'Duration'}</th>
                <th className="px-6 py-4">{isZh ? 'Token 消耗' : 'Tokens'}</th>
                <th className="px-6 py-4">{isZh ? '输入/输出概要' : 'Payload Summary'}</th>
                <th className="px-6 py-4 text-right">{isZh ? '操作' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
              {paginatedLogs.map(log => {
                const isSuccess = log.status === 'success';
                return (
                  <tr 
                    key={log.id} 
                    onClick={() => setSelectedLog(log)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedLog?.id === log.id ? 'bg-indigo-50/50' : ''}`}
                  >
                    {/* Timestamp */}
                    <td className="px-6 py-4 font-mono text-gray-400 whitespace-nowrap">
                      {log.startTime}
                    </td>

                    {/* Model Info */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{getModelEnglishName(log.modelCode)}</span>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5">{log.modelCode}</span>
                      </div>
                    </td>

                    {/* Model Caller */}
                    <td className="px-6 py-4 font-medium text-gray-700 whitespace-nowrap">
                      <span className="px-2 py-1 rounded bg-indigo-50/50 border border-indigo-100/80 text-indigo-700 text-[11px] font-semibold">
                        {log.caller || (isZh ? '模型测试' : 'Admin Test')}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-4 font-mono text-gray-700 whitespace-nowrap">
                      {(log.durationMs / 1000).toFixed(2)}s
                    </td>

                    {/* Tokens */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col font-mono text-gray-700">
                        <span className="font-bold">{log.totalTokens}</span>
                        <span className="text-[9px] text-gray-400 mt-0.5">
                          In: {log.inputTokens} | Out: {log.outputTokens}
                        </span>
                      </div>
                    </td>

                    {/* Payload Summary */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[10px]">
                          <span className="text-indigo-600 font-bold bg-indigo-50 px-1 py-0.2 rounded">Prompt</span>
                          <span className="text-gray-500 truncate block max-w-[180px]" title={log.input}>{log.input}</span>
                        </div>
                        {isSuccess ? (
                          <div className="flex items-center gap-1 text-[10px]">
                            <span className="text-emerald-600 font-bold bg-emerald-50 px-1 py-0.2 rounded">Response</span>
                            <span className="text-gray-500 truncate block max-w-[180px]" title={log.output}>{log.output}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px]">
                            <span className="text-red-600 font-bold bg-red-50 px-1 py-0.2 rounded">Error</span>
                            <span className="text-red-500 truncate block max-w-[180px]" title={log.errorMsg}>{log.errorMsg}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-lg transition-all"
                        >
                          {isZh ? '查看详情' : 'Detail'}
                        </button>
                        <button
                          onClick={(e) => handleDeleteLog(log.id, e)}
                          className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-all"
                          title={isZh ? '删除' : 'Delete'}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {totalLogsCount === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <i className="fas fa-search text-3xl opacity-20"></i>
                      <span>{isZh ? '没有找到符合条件的日志记录' : 'No matching log entries found'}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {totalLogsCount > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">
                {isZh 
                  ? `显示第 ${Math.min((safeCurrentPage - 1) * pageSize + 1, totalLogsCount)} 至 ${Math.min(safeCurrentPage * pageSize, totalLogsCount)} 条，共 ${totalLogsCount} 条日志` 
                  : `Showing ${Math.min((safeCurrentPage - 1) * pageSize + 1, totalLogsCount)} to ${Math.min(safeCurrentPage * pageSize, totalLogsCount)} of ${totalLogsCount} entries`}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={safeCurrentPage === 1}
                    className="px-3 py-1.5 border border-gray-200 rounded-xl bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
                  >
                    {isZh ? '上一页' : 'Previous'}
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    const isActive = page === safeCurrentPage;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isActive 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                            : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={safeCurrentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-200 rounded-xl bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
                  >
                    {isZh ? '下一页' : 'Next'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail Slide-Over Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="absolute inset-0 z-40 flex justify-end bg-gray-900/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="absolute inset-0"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-50 border-l border-gray-200"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <i className="fas fa-receipt text-indigo-600"></i>
                    {isZh ? '大模型调用详情' : 'LLM Call Details'}
                  </h3>
                  <span className="text-[10px] font-mono text-gray-400 block mt-0.5">ID: {selectedLog.id}</span>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-400"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 1. Basic Info Section */}
                <section className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {isZh ? '基本信息' : 'Basic Info'}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold block mb-0.5">{isZh ? '模型名称' : 'Model Name'}</span>
                      <span className="text-xs font-bold text-gray-800 block">{getModelEnglishName(selectedLog.modelCode)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold block mb-0.5">{isZh ? '模型标识' : 'Model ID'}</span>
                      <span className="text-xs font-mono text-gray-600 block">{selectedLog.modelCode}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold block mb-0.5">{isZh ? '开始时间' : 'Start Time'}</span>
                      <span className="text-xs font-mono text-gray-600 block">{selectedLog.startTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold block mb-0.5">{isZh ? '总响应耗时' : 'Total Latency'}</span>
                      <span className="text-xs text-gray-800 block font-bold font-mono">
                        {(selectedLog.durationMs / 1000).toFixed(2)}s <span className="text-[10px] text-gray-400 font-normal">({selectedLog.durationMs}ms)</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold block mb-0.5">{isZh ? '模型调用方' : 'Caller'}</span>
                      <span className="text-xs font-bold text-indigo-600 block">
                        {selectedLog.caller || (isZh ? '模型测试' : 'Admin Test')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold block mb-0.5">{isZh ? '消耗 Tokens' : 'Tokens Cost'}</span>
                      <span className="text-xs text-gray-800 font-mono block font-bold">{selectedLog.totalTokens}</span>
                    </div>
                  </div>
                </section>

                {/* 2. Token Details with visual bar */}
                <section className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {isZh ? 'Tokens 消耗占比' : 'Tokens Breakdown'}
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-indigo-600 font-bold">{isZh ? `输入: ${selectedLog.inputTokens} tks` : `Input: ${selectedLog.inputTokens} tks`}</span>
                      <span className="text-emerald-600 font-bold">{isZh ? `输出: ${selectedLog.outputTokens} tks` : `Output: ${selectedLog.outputTokens} tks`}</span>
                    </div>
                    {/* Visual Segmented Progress Bar */}
                    <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-indigo-500" 
                        style={{ width: `${selectedLog.totalTokens > 0 ? (selectedLog.inputTokens / selectedLog.totalTokens) * 100 : 50}%` }}
                      />
                      <div 
                        className="h-full bg-emerald-500" 
                        style={{ width: `${selectedLog.totalTokens > 0 ? (selectedLog.outputTokens / selectedLog.totalTokens) * 100 : 50}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {isZh ? '蓝色表示输入提示词消耗，绿色表示模型输出回答消耗。' : 'Blue indicates input tokens, green indicates output tokens.'}
                    </p>
                  </div>
                </section>

                {/* 3. Input Prompt Detail */}
                <section className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {isZh ? '完整的输入内容 (Prompt)' : 'Complete Input (Prompt)'}
                    </h4>
                    <button
                      onClick={() => copyToClipboard(selectedLog.input, 'input')}
                      className="text-[10px] text-indigo-600 hover:underline font-bold"
                    >
                      {copiedId === 'input' ? (isZh ? '已复制！' : 'Copied!') : (isZh ? '复制内容' : 'Copy Content')}
                    </button>
                  </div>
                  <div className="bg-slate-900 text-indigo-100 p-4 rounded-2xl text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-auto max-h-52 shadow-inner border border-slate-800">
                    {selectedLog.input}
                  </div>
                </section>

                {/* 4. Output Response or Error Detail */}
                {selectedLog.status === 'success' ? (
                  <section className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {isZh ? '完整的输出内容 (Response)' : 'Complete Output (Response)'}
                      </h4>
                      <button
                        onClick={() => copyToClipboard(selectedLog.output, 'output')}
                        className="text-[10px] text-emerald-600 hover:underline font-bold"
                      >
                        {copiedId === 'output' ? (isZh ? '已复制！' : 'Copied!') : (isZh ? '复制内容' : 'Copy Content')}
                      </button>
                    </div>
                    <div className="bg-white text-gray-800 p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap border border-gray-200 shadow-sm max-h-60 overflow-y-auto">
                      {selectedLog.output}
                    </div>
                  </section>
                ) : (
                  <section className="space-y-3">
                    <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider">
                      {isZh ? '错误报错信息 (Error Message)' : 'Error Message'}
                    </h4>
                    <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-mono leading-relaxed border border-red-200">
                      <div className="flex items-start gap-2">
                        <i className="fas fa-exclamation-triangle mt-0.5 text-red-500"></i>
                        <span>{selectedLog.errorMsg}</span>
                      </div>
                    </div>
                  </section>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end rounded-b-2xl">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold rounded-xl text-xs transition-all shadow-sm"
                >
                  {isZh ? '关闭' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
