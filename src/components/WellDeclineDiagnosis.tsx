import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

interface WellDeclineDiagnosisProps {
  lang: Language;
  onClose: () => void;
}

export const WellDeclineDiagnosis: React.FC<WellDeclineDiagnosisProps> = ({ lang, onClose }) => {
  const [activeTab, setActiveTab] = useState(1);
  const [selectedWell, setSelectedWell] = useState<string | null>(null);

  const tabs = [
    { id: 1, name: lang === 'zh' ? '全局总览' : 'Global Overview', icon: 'fa-globe' },
    { id: 2, name: lang === 'zh' ? '单井诊断' : 'Single Well Diagnosis', icon: 'fa-microscope' },
    { id: 3, name: lang === 'zh' ? '措施建议' : 'Recommended Measures', icon: 'fa-lightbulb' },
    { id: 4, name: lang === 'zh' ? '成果中心' : 'Outcome Center', icon: 'fa-folder-open' },
  ];

  // Mock Data
  const stats = [
    { label: '总井数', value: 248, icon: 'fa-oil-well', color: 'text-slate-600', bg: 'bg-slate-50' },
    { label: '下降井数', value: 36, icon: 'fa-chart-line-down', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: '严重下降井', value: 8, icon: 'fa-exclamation-triangle', color: 'text-red-600', bg: 'bg-red-50' },
    { label: '损失产量', value: '142.5', unit: 'm³/d', icon: 'fa-droplet-slash', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const reasonData = [
    { name: '地层压力下降', value: 45 },
    { name: '含水上升', value: 25 },
    { name: '泵效下降', value: 15 },
    { name: '管柱积砂', value: 10 },
    { name: '其他', value: 5 },
  ];

  const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

  const trendData = [
    { time: '1月', production: 120, baseline: 125 },
    { time: '2月', production: 118, baseline: 124 },
    { time: '3月', production: 115, baseline: 124 },
    { time: '4月', production: 110, baseline: 123 },
    { time: '5月', production: 105, baseline: 122 },
    { time: '6月', production: 98, baseline: 122 },
  ];

  const wellDetails = [
    { id: 'X-102', area: 'A区', currentProd: 12.5, lastProd: 18.2, declineRate: '31.3%', status: '严重', reason: '含水上升' },
    { id: 'B-5', area: 'B区', currentProd: 8.4, lastProd: 11.0, declineRate: '23.6%', status: '一般', reason: '压力下降' },
    { id: 'A-22', area: 'A区', currentProd: 15.1, lastProd: 19.5, declineRate: '22.5%', status: '一般', reason: '泵效下降' },
    { id: 'X-88', area: 'C区', currentProd: 5.2, lastProd: 9.8, declineRate: '46.9%', status: '严重', reason: '管柱积砂' },
  ];

  const renderTab1 = () => (
    <div className="space-y-6 h-full p-4 overflow-y-auto custom-scrollbar">
      {/* Indicator Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center text-xl`}>
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                {stat.unit && <span className="text-xs font-bold text-slate-400">{stat.unit}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Decline Trend */}
        <div className="col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <i className="fas fa-chart-area text-blue-500"></i>
              产量下降趋势分析
            </h3>
            <div className="flex gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> 实际产量</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-300"></div> 基准产量</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="production" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProd)" />
                <Line type="monotone" dataKey="baseline" stroke="#cbd5e1" strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reason Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-chart-pie text-orange-500"></i>
            下降主因分布
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reasonData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {reasonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{fontSize: 10, fontWeight: 'bold'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Decline Detail Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-list text-indigo-500"></i>
            Top下降井明细
          </h3>
          <button className="text-xs font-bold text-blue-600 hover:underline">查看全部 36 口井</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">井号</th>
                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">井区</th>
                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">当前产量</th>
                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">下降幅度</th>
                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">状态</th>
                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">主因</th>
                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {wellDetails.map((well, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-bold text-slate-700 text-sm">{well.id}</td>
                  <td className="py-4 text-xs text-slate-500">{well.area}</td>
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{well.currentProd}</span>
                      <span className="text-[10px] text-slate-400 font-medium">基准: {well.lastProd}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-red-500 font-bold text-sm">↓ {well.declineRate}</span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${well.status === '严重' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                      {well.status}
                    </span>
                  </td>
                  <td className="py-4 text-xs font-medium text-slate-600">{well.reason}</td>
                  <td className="py-4">
                    <button 
                      onClick={() => {
                        setSelectedWell(well.id);
                        setActiveTab(2);
                      }}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all"
                    >
                      诊断分析
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTab2 = () => (
    <div className="flex h-full overflow-hidden bg-slate-50/50">
      {/* Left: Info & Curves */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Info Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-3xl shadow-lg shadow-blue-200">
               <i className="fas fa-oil-well"></i>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-black text-slate-800">{selectedWell || 'X-102'}</h2>
                <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold border border-red-100">严重下降</span>
              </div>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <i className="fas fa-location-dot"></i> A1区块 • 目的层: 砂岩S2 • 开发年限: 12年
              </p>
            </div>
          </div>
          <div className="flex gap-8 text-right pr-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">当前日产能</p>
              <p className="text-xl font-black text-slate-800">12.5 <span className="text-xs text-slate-400">m³/d</span></p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">对比上月</p>
              <p className="text-xl font-black text-red-500">-5.7 <span className="text-xs text-red-400">m³/d</span></p>
            </div>
          </div>
        </div>

        {/* Prod Curves */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-800 flex items-center gap-2 underline decoration-blue-200 decoration-4 underline-offset-4">
               生产多参数综合曲线
             </h3>
             <div className="flex gap-3">
               {['产量', '含水', '压力', '工况'].map(it => (
                 <button key={it} className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${it === '产量' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>
                   {it}
                 </button>
               ))}
             </div>
           </div>
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="time" hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="production" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} />
                  <Line type="monotone" dataKey="baseline" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Evidence Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/50 rounded-bl-full flex items-center justify-end pr-3 pt-3 text-blue-100 text-3xl transition-all group-hover:scale-110">
              <i className="fas fa-droplet"></i>
            </div>
            <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
              <i className="fas fa-fingerprint text-blue-500"></i> 关键证据: 含水突升
            </h4>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              5月12日含水由 <span className="text-blue-600 font-bold">22.5%</span> 突跳至 <span className="text-blue-600 font-bold">45.8%</span>，伴随产油减半，符合典型的底水锥进特征。
            </p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50/50 rounded-bl-full flex items-center justify-end pr-3 pt-3 text-orange-100 text-3xl transition-all group-hover:scale-110">
              <i className="fas fa-gauge"></i>
            </div>
            <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
              <i className="fas fa-fingerprint text-orange-500"></i> 关键证据: 泵效异常
            </h4>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              示功图显示电流波动率超过 <span className="text-orange-600 font-bold">15%</span>，推断泵筒可能存在漏失或结蜡积。
            </p>
          </div>
        </div>
      </div>

      {/* Right: Diagnosis Steps */}
      <div className="w-80 border-l border-slate-200 bg-white p-6 overflow-y-auto custom-scrollbar">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <i className="fas fa-tasks text-emerald-500"></i>
          诊断链条与步骤
        </h3>
        <div className="space-y-8 relative">
           <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-100"></div>
           {[
             { title: '下降特征', status: 'completed', icon: 'fa-search' },
             { title: '生产制度', status: 'completed', icon: 'fa-cogs' },
             { title: '含水分析', status: 'completed', icon: 'fa-tint' },
             { title: '压力平衡', status: 'processing', icon: 'fa-tachometer-alt' },
             { title: '井筒健康', status: 'pending', icon: 'fa-bore-hole' },
             { title: '邻井干扰', status: 'pending', icon: 'fa-oil-well' },
             { title: '增产措施', status: 'pending', icon: 'fa-magic' },
             { title: '因果总结', status: 'pending', icon: 'fa-flag-checkered' },
           ].map((step, i) => (
             <div key={i} className="relative pl-8 flex items-center gap-4">
               <div className={`absolute left-0 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
                 step.status === 'completed' ? 'border-emerald-500 text-emerald-500' :
                 step.status === 'processing' ? 'border-blue-500 text-blue-500 animate-pulse' :
                 'border-slate-200 text-slate-300'
               }`}>
                 {step.status === 'completed' && <i className="fas fa-check text-[8px]"></i>}
                 {step.status === 'processing' && <div className="w-1 h-1 rounded-full bg-blue-500"></div>}
               </div>
               <div className="flex-1">
                 <p className={`text-xs font-bold ${
                   step.status === 'completed' ? 'text-slate-700' :
                   step.status === 'processing' ? 'text-blue-600' :
                   'text-slate-400'
                 }`}>{step.title}</p>
                 {step.status === 'processing' && <span className="text-[10px] text-blue-400 font-medium">正在计算地层压力响应...</span>}
               </div>
               <i className={`fas ${step.icon} text-xs ${
                  step.status === 'completed' ? 'text-emerald-300' :
                  step.status === 'processing' ? 'text-blue-300' :
                  'text-slate-100'
               }`}></i>
             </div>
           ))}
        </div>

        <div className="mt-12 bg-slate-50 p-4 rounded-2xl border border-slate-100">
           <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">多维原因排序</h4>
           <div className="space-y-3">
              {[
                { name: '底水锥进', prob: 88, color: 'bg-emerald-500' },
                { name: '压力亏空', prob: 64, color: 'bg-blue-500' },
                { name: '泵效下降', prob: 25, color: 'bg-orange-500' },
              ].map(r => (
                <div key={r.name}>
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span>{r.name}</span>
                    <span>{r.prob}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                    <div className={`h-full ${r.color}`} style={{ width: `${r.prob}%` }}></div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );

  const renderTab3 = () => (
    <div className="p-6 space-y-6 h-full overflow-y-auto custom-scrollbar">
       <div className="flex items-center justify-between mb-2">
         <div>
            <h2 className="text-xl font-bold text-slate-800">措施建议与技术方案</h2>
            <p className="text-sm text-slate-400">基于诊断结论自动生成的治理对策</p>
         </div>
         <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center gap-2">
           <i className="fas fa-file-export"></i> 生成措施建议书
         </button>
       </div>

       <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <i className="fas fa-map-signs text-blue-500"></i>
                  原因 - 措施 专家知识映射
                </h3>
                <div className="space-y-4">
                  {[
                    { reason: '底水锥进 (概率 88%)', measures: ['堵水控水调剖工程', '下入PCP抽油泵', '控制排量开采'], level: '高' },
                    { reason: '地层压力亏空 (概率 64%)', measures: ['增加注水强度', '优化注采连通关系'], level: '中' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-slate-700">{item.reason}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.level === '高' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                          推荐等级: {item.level}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.measures.map(m => (
                          <span key={m} className="px-3 py-1 bg-white rounded-lg text-xs font-bold text-blue-600 border border-blue-100 shadow-sm">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <i className="fas fa-tasks text-emerald-500"></i>
                  措施优先级与增产预估
                </h3>
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left border-b border-slate-50">
                      <th className="pb-3 px-4">建议措施</th>
                      <th className="pb-3 px-4">周期</th>
                      <th className="pb-3 px-4">成本</th>
                      <th className="pb-3 px-4">预估增产</th>
                      <th className="pb-3 px-4">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { name: '堵水作业', period: '7天', cost: '12万', growth: '+5.2t/d', roi: '3.5x' },
                      { name: '泵型替换', period: '3天', cost: '5万', growth: '+2.1t/d', roi: '1.8x' },
                      { name: '注水调节', period: '长期', cost: '低', growth: '+1.5t/d', roi: '5.2x' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 text-sm font-bold text-slate-700">{row.name}</td>
                        <td className="py-4 px-4 text-sm text-slate-500">{row.period}</td>
                        <td className="py-4 px-4 text-sm font-medium text-slate-600">{row.cost}</td>
                        <td className="py-4 px-4 text-sm font-bold text-emerald-600">{row.growth}</td>
                        <td className="py-4 px-4 font-black text-blue-600">{row.roi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>

          <div className="space-y-6">
             <div className="bg-gradient-to-br from-red-500 to-rose-600 p-6 rounded-3xl text-white shadow-xl shadow-red-200 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-white/10 text-8xl rotate-12">
                   <i className="fas fa-shield-virus"></i>
                </div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <i className="fas fa-exclamation-triangle"></i>
                  作业风险提示
                </h3>
                <ul className="space-y-3 relative z-10 text-sm font-medium text-red-50/90">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"></span>
                    <span>层间交叉干扰可能导致新水层的激活风险。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"></span>
                    <span>大修作业可能对当前井筒套管完整性造成二次损伤。</span>
                  </li>
                </ul>
             </div>

             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 text-sm">诊断结论草案</h3>
                <div className="p-4 bg-slate-50 rounded-2xl text-xs font-medium text-slate-600 leading-relaxed italic">
                  "X-102井近期产量大幅下滑，主要原因为底水沿高屏层位快速锥进。建议立即采取化学堵水措施，结合排量控制，减缓水锥速度，同时关注地层压力的后期维持。"
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderTab4 = () => (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{lang === 'zh' ? '成果报告与数据中心' : 'Outcome & Data Center'}</h2>
          <p className="text-sm text-slate-400">{lang === 'zh' ? '诊断全周期产生的文件与数据归档' : 'Archived documents and data from the diagnosis cycle'}</p>
        </div>
        <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all">
          <i className="fas fa-save"></i> {lang === 'zh' ? '一键保存成果' : 'Save All Outcomes'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { title: '诊断报告', type: 'PDF', icon: 'fa-file-pdf', color: 'text-red-500', bg: 'bg-red-50' },
          { title: '措施建议书', type: 'DOCX', icon: 'fa-file-word', color: 'text-blue-500', bg: 'bg-blue-50' },
          { title: '全景图件包', type: 'ZIP', icon: 'fa-file-archive', color: 'text-amber-500', bg: 'bg-amber-50' },
          { title: '特征数据表', type: 'XLSX', icon: 'fa-file-excel', color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { title: '原始证据文件', type: 'PATH', icon: 'fa-folder-tree', color: 'text-slate-500', bg: 'bg-slate-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group text-center">
            <div className={`w-16 h-16 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform`}>
              <i className={`fas ${item.icon}`}></i>
            </div>
            <h4 className="font-black text-slate-800 mb-1">{item.title}</h4>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase tracking-widest">{item.type}</span>
            <div className="mt-6 flex gap-2">
              <button className="flex-1 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold hover:bg-slate-100">浏览</button>
              <button className="flex-1 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all">下载</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white relative animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white z-10 sticky top-0 font-sans">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-200">
            <i className="fas fa-stethoscope text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">
              {lang === 'zh' ? '单井产量下降诊断' : 'Single Well Decline Diagnosis'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }`}
            >
              <i className={`fas ${tab.icon}`}></i>
              {tab.name}
            </button>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all"
        >
          <i className="fas fa-times text-lg"></i>
        </button>
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 1 && renderTab1()}
            {activeTab === 2 && renderTab2()}
            {activeTab === 3 && renderTab3()}
            {activeTab === 4 && renderTab4()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
