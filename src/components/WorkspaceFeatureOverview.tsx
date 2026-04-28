import React from 'react';
import { motion } from 'motion/react';
import { 
  Database, 
  Bot, 
  Workflow, 
  Zap, 
  Share2, 
  Layers, 
  CheckCircle2, 
  FileSearch,
  Settings2,
  Users2,
  ClipboardCheck,
  TrendingUp
} from 'lucide-react';
import { Language } from '../types';

interface FeatureGroup {
  title: string;
  enTitle: string;
  icon: any;
  color: string;
  features: {
    name: string;
    enName: string;
    desc: string;
    enDesc: string;
  }[];
}

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    title: '资源管理与挂载',
    enTitle: 'Resource Management',
    icon: Database,
    color: 'blue',
    features: [
      { name: '多源成果自动化挂载', enName: 'Auto Resource Mounting', desc: '支持勘探、开发、钻井等多源数据库的一键关联与挂载。', enDesc: 'Support one-click association of multi-source databases.' },
      { name: 'MBU结构化业务树', enName: 'Structured MBU Tree', desc: '根据业务逻辑自动化构建最小业务单元（MBU）层级。', enDesc: 'Auto-build MBU hierarchy based on business logic.' },
      { name: '本地/系统资源融合', enName: 'Resource Fusion', desc: '实现云端系统资产与本地专家文件的无缝集成。', enDesc: 'Seamless integration of cloud assets and local files.' }
    ]
  },
  {
    title: '数字员工协同',
    enTitle: 'Digital Employee Collab',
    icon: Bot,
    color: 'indigo',
    features: [
      { name: '多智能体任务并行调度', enName: 'Multi-Agent Scheduling', desc: '场景员工、角色员工针对复杂业务目标自主分工协同。', enDesc: 'Digital employees collaborate on complex business goals.' },
      { name: '交互式知识库分析', enName: 'Interactive KB Analysis', desc: '基于挂载资源的实时语义检索与逻辑问答。', enDesc: 'Real-time semantic search and Logical QA.' },
      { name: '执行过程全轨迹溯源', enName: 'Full Traceability', desc: '记录AI思考与计算过程，支持中间结果审计与复核。', enDesc: 'Trace AI reasoning and audit intermediate results.' }
    ]
  },
  {
    title: '智能构建与生产',
    enTitle: 'Smart Construction',
    icon: Zap,
    color: 'amber',
    features: [
      { name: '相似/邻近对象资产推荐', enName: 'Asset Recommendation', desc: '基于空间与属性相关性，自动补全缺失的研究资料。', enDesc: 'Auto-complete research data based on similarity.' },
      { name: '业务流程自动演化', enName: 'Process Evolution', desc: '根据构建策略，动态生成最优的研究路径与节点。', enDesc: 'Dynamically generate research paths based on strategies.' },
      { name: '标准化报告一键成稿', enName: 'One-click Reporting', desc: '一键生成钻井设计、地质总结等标准业务文档。', enDesc: 'Generate standard business documents with one click.' }
    ]
  }
];

export const WorkspaceFeatureOverview: React.FC<{ lang: Language }> = ({ lang }) => {
  const isZh = lang === 'zh';

  return (
    <div className="flex flex-col gap-8 p-1">
      {FEATURE_GROUPS.map((group, idx) => (
        <motion.div 
          key={group.enTitle}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="group"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-8 h-8 rounded-lg bg-${group.color}-50 flex items-center justify-center text-${group.color}-600 shadow-sm border border-${group.color}-100`}>
              <group.icon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
              {isZh ? group.title : group.enTitle}
            </h3>
          </div>

          <div className="space-y-3">
            {group.features.map((feature, fIdx) => (
              <div 
                key={fIdx}
                className="relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-slate-200 group-hover:before:bg-indigo-400 before:transition-colors"
              >
                <div className="text-xs font-bold text-slate-700 mb-0.5">{isZh ? feature.name : feature.enName}</div>
                <div className="text-[10px] text-slate-500 leading-relaxed italic">{isZh ? feature.desc : feature.enDesc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
