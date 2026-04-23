import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  PlayCircle, 
  AlertCircle, 
  Clock, 
  Plus, 
  FileUp, 
  LayoutTemplate, 
  Search, 
  FileText, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Users,
  Database,
  Bot,
  Presentation,
  History,
  AlertTriangle,
  Zap,
  MousePointerClick,
  Compass,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { Workspace, Language } from '../types';

interface DashboardProps {
  workspaces: Workspace[];
  onNavigateToWorkspace: () => void;
  lang: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({ workspaces, onNavigateToWorkspace, lang }) => {
  const isZh = lang === 'zh';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F8FAFC] custom-scrollbar font-sans text-slate-900">
      {/* Background Decor - Subtle Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#6366f1 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full relative z-10 min-h-screen pb-20"
      >
        {/* Top Toolbar / Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 backdrop-blur-md bg-white/80">
          <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Jura<span className="text-indigo-600">WorkSpace</span>
              </h1>
              <p className="text-gray-500 text-sm">
                {isZh ? '个人工作台' : 'Personal Hub'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
               {/* Search placeholder similar to templates */}
               <div className="relative hidden md:block">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder={isZh ? "搜索我的空间..." : "Search my workspaces..."}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64 bg-gray-50/50"
                  />
               </div>

               <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-500">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date().toLocaleDateString(isZh ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
               </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-8">
          <div className="flex flex-col gap-8">
            {/* ① 整体运行概览 - High-Impact Hero Card */}
            <motion.section 
              variants={itemVariants}
              className="relative overflow-hidden bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
            >
              {/* Decorative elements */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 p-10 lg:p-12">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-slate-100 rounded-3xl overflow-hidden border border-slate-100">
                  {[
                    { label: isZh ? '活跃空间数量' : 'Active Spaces', value: '08', icon: Compass, color: 'indigo' },
                    { label: isZh ? '智能体数量' : 'AI Agents', value: '12', icon: Bot, color: 'blue' },
                    { label: isZh ? '今日AI调用次数' : 'Today AI Calls', value: '458', icon: Sparkles, color: 'sky' },
                    { label: isZh ? 'MBU激活数量' : 'MBU Activations', value: '156', icon: Activity, color: 'amber' },
                    { label: isZh ? '成果生成数量' : 'Outputs Generated', value: '34', icon: FileText, color: 'emerald' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 flex flex-col gap-4 group transition-colors hover:bg-slate-50/50">
                      <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className="text-4xl font-black text-slate-900 font-mono tracking-tighter">{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Middle Grid - Task & Process Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               {/* ② 运行周期监控 */}
               <motion.section 
                variants={itemVariants}
                className="lg:col-span-8 bg-white border border-slate-200/60 rounded-[2rem] p-10 shadow-sm"
               >
                 <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                        <Activity className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">{isZh ? '正在运行的任务' : 'Ongoing Fracking Jobs'}</h3>
                    </div>
                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">{isZh ? '管理队列' : 'Manage Queue'}</button>
                 </div>

                 <div className="space-y-4">
                    {[
                      { name: isZh ? 'X-1 井压裂方案撰写' : 'Well X-1 Frac Scheme Design', percent: 75, status: isZh ? '方案编制' : 'In Design', time: '10:30' },
                      { name: isZh ? '区块 A 压裂参数优选计算' : 'Block A Parameter Opt', percent: 45, status: isZh ? '参数优选' : 'Optimization', time: '14:20' },
                      { name: isZh ? '昨日压裂日报自动生成' : 'Frac Daily Report Gen', percent: 90, status: isZh ? '日报生成' : 'Summary', time: '08:00' },
                    ].map((task, i) => (
                      <div key={i} className="group flex items-center justify-between p-5 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100/50 rounded-[1.25rem] transition-all">
                        <div className="flex-1 pr-8">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-black text-slate-800">{task.name}</span>
                            <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded">{task.status}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${task.percent}%` }} className="h-full bg-gradient-to-r from-orange-400 to-amber-500" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                          <span className="text-xs font-mono font-bold text-slate-400">{task.time}</span>
                          <button className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-colors">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                 </div>

                 <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                      <span>{isZh ? '待执行队列' : 'FRACKING UPCOMING QUEUE'}</span>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-6">
                       {[
                         { name: isZh ? '施工日报复核' : 'Report Review', time: '15:00' },
                         { name: isZh ? '参数优选方案发布' : 'Opt Release', time: '17:30' },
                         { name: isZh ? '下步压裂模拟' : 'Nex-Step Sim', time: '09:00' },
                       ].map((q, i) => (
                         <div key={i} className="flex flex-col gap-1">
                           <span className="text-xs font-black text-slate-700">{q.name}</span>
                           <span className="text-[10px] font-bold text-slate-400 tracking-tighter">Scheduled @ {q.time}</span>
                         </div>
                       ))}
                    </div>
                 </div>
               </motion.section>

               {/* ③ 快速开始与关键提醒 */}
               <div className="lg:col-span-4 flex flex-col gap-8">
                  <motion.section 
                    variants={itemVariants} 
                    className="p-8 bg-slate-900 rounded-[2rem] text-white flex flex-col items-center text-center justify-center gap-6 shadow-2xl shadow-indigo-200/20"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                      <Plus className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-2xl font-black tracking-tight">{isZh ? '开启新项目' : 'New Project'}</h3>
                       <p className="text-xs text-indigo-200/60 font-bold uppercase tracking-widest leading-relaxed">
                         {isZh ? '智能构建属于你的协作研究空间' : 'SMARTLY BUILD YOUR WORKSPACE'}
                       </p>
                    </div>
                    <button 
                      onClick={onNavigateToWorkspace}
                      className="w-full py-4 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {isZh ? '开始空间构建' : 'START CORE BUILD'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.section>

                  {/* 异常警示 */}
                  <motion.section 
                    variants={itemVariants}
                    className="flex-1 bg-white border border-red-100 rounded-[2rem] p-8"
                  >
                    <div className="flex items-center gap-2 mb-6 text-red-500">
                      <AlertCircle className="w-5 h-5" />
                      <h4 className="text-xs font-black uppercase tracking-widest">{isZh ? '风险预警' : 'FRAC RISK ALERTS'}</h4>
                    </div>
                    <div className="space-y-4">
                       {[
                         { title: isZh ? 'X-10 井施工压力异常' : 'Well X-10 Press Anomaly', meta: 'ALERT > 45MPa' },
                         { title: isZh ? '参数集未完全解析' : 'Paras Not Parsed', meta: 'BLOCK B-4' },
                       ].map((alert, i) => (
                         <div key={i} className="group p-4 bg-red-50/30 border border-red-50 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-red-50 transition-colors">
                           <div>
                             <div className="text-sm font-bold text-slate-800">{alert.title}</div>
                             <div className="text-[10px] font-black text-red-400 mt-1 uppercase tracking-tighter">{alert.meta}</div>
                           </div>
                           <ArrowRight className="w-4 h-4 text-red-300 group-hover:translate-x-1 transition-transform" />
                         </div>
                       ))}
                    </div>
                  </motion.section>
               </div>
            </div>

            {/* Bottom Section - Content Focus & Product Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               {/* 推荐空间 */}
               <motion.section 
                 variants={itemVariants}
                 className="lg:col-span-12 bg-white border border-slate-200/60 rounded-[2rem] p-10"
               >
                 <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                      <Compass className="w-5 h-5 text-indigo-500" />
                      {isZh ? '推荐空间' : 'Recommended Spaces'}
                    </h3>
                    <div className="flex items-center gap-4">
                       <button className="text-[10px] font-bold text-slate-400 hover:text-slate-900 tracking-widest uppercase">{isZh ? '查看更多' : 'VIEW MORE'}</button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { 
                        name: isZh ? '川西区块超深井压裂攻关' : 'Chuanxi Ultra-deep Wells', 
                        nodes: 12, 
                        persons: 8, 
                        desc: isZh ? '针对超高温高压地层的压裂工艺优化研究。' : 'Optimization research on fracking technology for ultra-high temperature and high-pressure formations.' 
                      },
                      { 
                        name: isZh ? '2024 全局压裂施工日报汇总' : '2024 Fracking Reports', 
                        nodes: 4, 
                        persons: 15, 
                        desc: isZh ? '自动化汇总各工区日报，实时提取关键参数。' : 'Automate the summary of daily reports from various work areas and extract key parameters.' 
                      },
                    ].map((space, i) => (
                      <div key={i} className="group p-8 rounded-3xl bg-slate-50/50 border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/5 transition-all flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                           <h4 className="text-lg font-black text-slate-800 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors uppercase">{space.name}</h4>
                           <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition-colors">
                              {isZh ? '申请加入' : 'APPLY JOIN'}
                           </button>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{space.desc}</p>
                        <div className="flex items-center gap-6 pt-6 border-t border-slate-100">
                           <div className="flex items-center gap-2">
                             <Database className="w-4 h-4 text-slate-400" />
                             <span className="text-xs font-black text-slate-600">{space.nodes} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">mbu 节点</span></span>
                           </div>
                           <div className="flex items-center gap-2">
                             <Users className="w-4 h-4 text-slate-400" />
                             <span className="text-xs font-black text-slate-600">{space.persons} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">人员</span></span>
                           </div>
                        </div>
                      </div>
                    ))}
                 </div>
               </motion.section>

               {/* 全链路产品矩阵 */}
               <motion.section 
                 variants={itemVariants}
                 className="lg:col-span-12 bg-slate-50/50 border border-slate-200/60 rounded-[2rem] p-10 mt-4"
               >
                 <div className="flex items-center gap-4 mb-12">
                   <div className="w-1.5 h-6 bg-indigo-500"></div>
                   <h3 className="text-xl font-bold text-slate-900 tracking-tight">{isZh ? '全链路能力矩阵' : 'Full Capability Matrix'}</h3>
                 </div>

                 <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
                    {[
                      { name: '智能问数', icon: Search, color: 'indigo' },
                      { name: '数据分析', icon: Database, color: 'blue' },
                      { name: '智能诊断', icon: Activity, color: 'sky' },
                      { name: '智能轻应用', icon: Zap, color: 'indigo' },
                      { name: '智能成图', icon: Compass, color: 'emerald' },
                      { name: '智能报告', icon: FileText, color: 'blue' },
                      { name: '智能PPT', icon: Presentation, color: 'amber' },
                    ].map((tool, i) => (
                      <button key={i} className="group bg-white border border-slate-100 p-6 rounded-2xl flex flex-col items-center gap-4 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                        <div className={`w-12 h-12 rounded-xl bg-${tool.color}-50 flex items-center justify-center text-${tool.color}-500 group-hover:scale-110 transition-transform`}>
                          <tool.icon className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[11px] font-black text-slate-800 tracking-tighter uppercase">{tool.name}</span>
                        </div>
                      </button>
                    ))}
                 </div>
               </motion.section>
            </div>
          </div>
        </div>

        {/* Decorative Footer Detail */}
        <footer className="px-8 pb-12 pt-4 flex items-center justify-between border-t border-slate-50 mt-12">
           <div className="text-[9px] font-black text-slate-200 uppercase tracking-[0.5em]">JURA WORKSPACE OPERATIONAL TERMINAL V4.2</div>
           <div className="flex gap-8">
             <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{isZh ? '系统正常运行' : 'SYSTEM STATUS: OPTIMAL'}</span>
             <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">© 2026 JURATECH</span>
           </div>
        </footer>
      </motion.div>
    </div>
  );
};
