import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ReportTemplate {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  categoryEn: string;
  pages: number;
  date: string;
  description: string;
  descriptionEn: string;
  defaultTopic: string;
  defaultTopicEn: string;
  defaultRequirements: string;
  defaultRequirementsEn: string;
  defaultCoreContent: string;
  defaultCoreContentEn: string;
}

const getChapters = (id: string, pages: number): number => {
  const chapterMap: Record<string, number> = {
    A1: 6, A2: 5, A3: 8,
    B1: 7, B2: 5, B3: 6,
    C1: 6, C2: 4, C3: 5,
    D1: 8, D2: 9, D3: 4,
    E1: 6, E2: 5, E3: 6
  };
  return chapterMap[id] || Math.max(3, Math.round(pages / 15));
};

const getUsageCount = (id: string): number => {
  const usageMap: Record<string, number> = {
    A1: 128, A2: 95, A3: 142,
    B1: 210, B2: 184, B3: 115,
    C1: 156, C2: 88, C3: 74,
    D1: 165, D2: 230, D3: 112,
    E1: 148, E2: 92, E3: 83
  };
  return usageMap[id] || 100;
};

interface SmartReportCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: { topic: string; outline: boolean; language: string; template?: string; requirements?: string; focusPoints?: string }) => void;
  lang: 'zh' | 'en';
}

export const SmartReportCreateModal: React.FC<SmartReportCreateModalProps> = ({ isOpen, onClose, onGenerate, lang }) => {
  const [topic, setTopic] = useState('');
  const [requirements, setRequirements] = useState('');
  const [coreContent, setCoreContent] = useState('');
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('A1');
  const [activeCategory, setActiveCategory] = useState(lang === 'zh' ? '钻井地质' : 'Drilling & Geology');
  const [outline, setOutline] = useState(true);
  const [language, setLanguage] = useState(lang === 'zh' ? '中文' : 'English');

  const categories = lang === 'zh' 
    ? ['钻井地质', '开发方案', '工程设计', '动态分析', '储量评估']
    : ['Drilling & Geology', 'Development Scheme', 'Engineering Design', 'Dynamic Analysis', 'Reserve Assessment'];

  const templates: ReportTemplate[] = [
    // 钻井地质
    {
      id: 'A1',
      name: '浅海大位移井钻井地质设计模板',
      nameEn: 'Shallow Water Extended Reach Well Geological Design',
      category: '钻井地质',
      categoryEn: 'Drilling & Geology',
      pages: 48,
      date: '2026-04',
      description: '适用于浅海环境，针对高摩阻、轨迹控制难的大位移井，深度融合地质特征与工程设计。',
      descriptionEn: 'Suitable for shallow water environments with high friction and difficult trajectory control.',
      defaultTopic: 'X-101井浅海大位移水平井钻井地质设计',
      defaultTopicEn: 'Drilling Geological Design for Well X-101 Shallow Water ERW',
      defaultRequirements: '1. 精细刻画靶区断裂带发育特征\n2. 推荐合理的井身结构与安全窗口范围\n3. 制定轨迹碰撞预防与纠偏策略',
      defaultRequirementsEn: '1. Fine characterization of faults in targets\n2. Recommend casing program and window\n3. Track anti-collision strategy',
      defaultCoreContent: '主要地质靶点坐标、目的层流体性质预测、断裂破碎带深度预测、地层孔隙压力/破裂压力梯度剖面。',
      defaultCoreContentEn: 'Target coordinates, fluid property forecast, fault fracture zones, pore pressure and fracture gradients.'
    },
    {
      id: 'A2',
      name: '复杂断块油藏水平井地质设计规范',
      nameEn: 'Fault-Block Horizontal Well Geological Design',
      category: '钻井地质',
      categoryEn: 'Drilling & Geology',
      pages: 55,
      date: '2026-05',
      description: '面向断裂高度发育、含油地层破碎的多断块油藏，侧重于断层识别、随钻储层导向及入靶追踪。',
      descriptionEn: 'Designed for highly fractured fault-block reservoirs, focusing on fault identification and geo-steering.',
      defaultTopic: 'XX断块高倾角复杂层序水平井地质设计',
      defaultTopicEn: 'Geological Design for Horizontal Well in High-dip XX Fault Block',
      defaultRequirements: '1. 落实水平段过断层轨迹校正方案\n2. 设计高精度储层随钻追踪指标\n3. 预测砂体边界与含油性变化',
      defaultRequirementsEn: '1. Implement horizontal section track fault calibration\n2. Design high precision geosteering indicators\n3. Predict sand body boundary',
      defaultCoreContent: '小断层微调模型、地层对比标准曲线、入靶倾角与导向靶窗选择。',
      defaultCoreContentEn: 'Minor fault models, stratigraphy correlation standard logs, target dip angle and landing window.'
    },
    {
      id: 'A3',
      name: '深层页岩气井钻井地质设计指南',
      nameEn: 'Deep Shale Gas Drilling Geological Design Guide',
      category: '钻井地质',
      categoryEn: 'Drilling & Geology',
      pages: 62,
      date: '2026-03',
      description: '聚焦超深、高温高压页岩储层，强调裂缝发育度、岩石力学脆性指数及高压应力导向。',
      descriptionEn: 'Focused on ultra-deep, HPHT shale reservoirs, emphasizing fractures, rock brittleness, and stresses.',
      defaultTopic: '龙马溪组深层页岩气水平井钻井地质方案',
      defaultTopicEn: 'Drilling Geological Scheme for Deep Shale Gas in Longmaxi Formation',
      defaultRequirements: '1. 评估超深段脆性岩石地应力方向\n2. 规划天然裂缝避让与穿透方案\n3. 提供溢流与井漏双向安全阈值',
      defaultRequirementsEn: '1. Evaluate stress azimuths in deep sections\n2. Plan natural fracture crossing and evasion\n3. Provide kick and loss thresholds',
      defaultCoreContent: 'TOC纵向分布、优质页岩连续段脆性解析、最大主应力方位、优质气层段井漏预警指标。',
      defaultCoreContentEn: 'Vertical TOC distribution, brittleness of sweet spots, max horizontal stress azimuth, loss warnings.'
    },

    // 开发方案
    {
      id: 'B1',
      name: '整装砂岩油藏注水开发调整方案',
      nameEn: 'Sandstone Waterflooding Development Adjustment',
      category: '开发方案',
      categoryEn: 'Development Scheme',
      pages: 120,
      date: '2026-06',
      description: '针对高含水期大中型整装砂岩油田，包含精细注水调整、井网细分和重构方案。',
      descriptionEn: 'For large/medium sandstone fields in high water cut stage, including fine flooding and well pattern refitting.',
      defaultTopic: '柳源油田东区高含水期注水网细分开发调整方案',
      defaultTopicEn: 'Waterflooding Network Sub-division Scheme for East Liuyuan Field',
      defaultRequirements: '1. 论证层系细分可行性与剩余油主控因素\n2. 优化注采井网间距与压力配置\n3. 预测开发调整后的高含水降速指标',
      defaultRequirementsEn: '1. Demonstrate layers subdivision feasibility and main controls\n2. Optimize well spacing and pressure profiles\n3. Predict water-cut reduction rate',
      defaultCoreContent: '细分井网设计参数、采油/注水对应关系、调剖及堵水层位选择、预测五年产能递减与累产曲线。',
      defaultCoreContentEn: 'Subdivision pattern specs, injector-producer match, profile control zones, 5-yr oil recovery forecasts.'
    },
    {
      id: 'B2',
      name: '致密气藏多阶段压裂水平井开发设计',
      nameEn: 'Tight Gas Multi-Stage Fracturing Development Design',
      category: '开发方案',
      categoryEn: 'Development Scheme',
      pages: 88,
      date: '2026-05',
      description: '多层、致密非均质气田专用，融合分段多级压裂部署与产能产能释放优化。',
      descriptionEn: 'Specialized for multi-layer tight heterogeneous reservoirs, integrating staged fracturing deployment.',
      defaultTopic: '苏里格致密砂岩气田高效分段压裂水平井开发方案',
      defaultTopicEn: 'Development Scheme for Efficient Fractured Horizontal Wells in Sulige Tight Gas',
      defaultRequirements: '1. 设计高效压裂裂缝网络主几何参数\n2. 优化水平段合理长度及井排距\n3. 评估单井稳产期与气藏动态采出程度',
      defaultRequirementsEn: '1. Design fracture network geometric parameters\n2. Optimize horizontal section length and rows\n3. Assess stable production lifespan',
      defaultCoreContent: '压裂级数与级距分布、每级排量与支撑剂配比、单井日产量峰值与后续递减数学模拟模型。',
      defaultCoreContentEn: 'Fracturing stages, spacing, pumping rate, proppant schedule, peak daily rates and decline models.'
    },
    {
      id: 'B3',
      name: '稠油热采及化学驱提高采收率方案',
      nameEn: 'Heavy Oil Thermal & Chemical EOR Scheme',
      category: '开发方案',
      categoryEn: 'Development Scheme',
      pages: 105,
      date: '2026-01',
      description: '超粘、普通稠油油田提高采收率（EOR）部署，包括蒸汽驱、SAGD及三元复合驱。',
      descriptionEn: 'EOR deployment for heavy oil, including steam flooding, SAGD, and ASP chemical flooding.',
      defaultTopic: '辽河油田齐块高凝超稠油蒸汽辅助重力泄油开发调整',
      defaultTopicEn: 'Steam Assisted Gravity Drainage Development Adjustment for Qi Block',
      defaultRequirements: '1. 测算高温高压状态下蒸汽腔扩展路径\n2. 优化合理油汽比（OSR）与汽水循环边界\n3. 设计采油井与热源井合理间距及轨迹',
      defaultRequirementsEn: '1. Calculate steam chamber path under HPHT\n2. Optimize oil-steam ratio (OSR) and boundary\n3. Design distance and trajectories of wells',
      defaultCoreContent: '蒸汽室纵向扩展图件、注入循环压力界限、伴随化学表活剂配比指标、热损失及耗热平衡剖面。',
      defaultCoreContentEn: 'Steam chamber expansions, injection pressure limit, chemical surfactant formula, thermal loss balance.'
    },

    // 工程设计
    {
      id: 'C1',
      name: '高压超深井钻井液与固井工程方案',
      nameEn: 'HPHT Ultra-deep Cementing & Fluid Design',
      category: '工程设计',
      categoryEn: 'Engineering Design',
      pages: 94,
      date: '2026-06',
      description: '针对7000米以上超深地层，克服超高温高压、窄安全窗口带来的固井和流体难题。',
      descriptionEn: 'For ultra-deep wells (>7000m), overcoming high temperature/pressure and narrow safety margins.',
      defaultTopic: '塔里木超深超高压水平井钻完井液与固井完整设计',
      defaultTopicEn: 'Drilling Fluids & Cementing Design for Tarim Ultra-Deep HPHT Well',
      defaultRequirements: '1. 推荐抗200℃高温合成基钻井液体系\n2. 制定抗盐、抗钙超深水泥浆配方\n3. 细化钻井溢流漏失协同预防程序',
      defaultRequirementsEn: '1. Recommend synthetic drilling fluid up to 200C\n2. Anti-salt and anti-calcium cement slurry formula\n3. Collaborative kick and loss mitigation',
      defaultCoreContent: '钻井液粘度切力参数、固井浆凝结特性指标、顶替效率数值分析、井底当量循环密度 (ECD) 控制限。',
      defaultCoreContentEn: 'Fluid mud rheology, slurry hardening profiles, cement displacement rate, ECD control parameters.'
    },
    {
      id: 'C2',
      name: '套管穿孔与压裂酸化完井设计方案',
      nameEn: 'Casing Perforating & Acidizing Completion',
      category: '工程设计',
      categoryEn: 'Engineering Design',
      pages: 76,
      date: '2026-04',
      description: '储层改造、解堵及完井联动方案，提供射孔弹选型、液量配合及酸化工艺参数。',
      descriptionEn: 'Reservoir stimulation and completion, offering perforating gun options, fluid matching and acidizing parameters.',
      defaultTopic: '苏-10井致密砂岩段套管分段射孔与酸化完井设计',
      defaultTopicEn: 'Staged Perforation & Acidizing Completion for Well Su-10 Tight Sandstone',
      defaultRequirements: '1. 优选耐高温压裂酸化管柱与射孔器规格\n2. 确定高效转向酸化液排量与反应速率控制\n3. 评估射孔段层位力学剪切破裂破坏界限',
      defaultRequirementsEn: '1. Select high-temp strings and perforator specs\n2. Determine divert acid pumping rate and reaction control\n3. Assess mechanical shear failure thresholds',
      defaultCoreContent: '射孔深度与孔眼分布图、酸化液化学主剂成分、酸化酸洗级联步骤、酸化后残液返排与除残环境流程。',
      defaultCoreContentEn: 'Perforating depth charts, acid chemicals, cascading acidizing sequences, flowback cleanup flows.'
    },
    {
      id: 'C3',
      name: '深水钻井管柱安全性与完整性评估',
      nameEn: 'Deepwater Drilling String Safety & Integrity',
      category: '工程设计',
      categoryEn: 'Engineering Design',
      pages: 82,
      date: '2026-02',
      description: '深水半潜式平台及钻井船专用，防范波浪弯矩、洋流共振及大吨位悬挂带来的断裂风险。',
      descriptionEn: 'For deepwater rigs/drilling ships, avoiding drill pipe failures caused by wave bending and ocean currents.',
      defaultTopic: '深水X-1超深气井双重管柱动力学应力与防断裂安全评估',
      defaultTopicEn: 'Dynamic Stress & Fatigue Anti-fracture Safety Assessment for Deepwater Drill String',
      defaultRequirements: '1. 分析波浪及海流对大直径钻井隔水管弯矩影响\n2. 测算复杂海底地形导致的井口回转应力\n3. 推荐疲劳极限防断卡扣规格与管材壁厚',
      defaultRequirementsEn: '1. Analyze wave/current bending moments on marine risers\n2. Compute wellhead fatigue stress from seabed morphology\n3. Recommend drill string connection types and wall thickness',
      defaultCoreContent: '隔水管挠曲变形轨迹、井口疲劳寿命估算表、钻具扭振失稳临界临界转速表、高应力危险截面断裂韧性临界点。',
      defaultCoreContentEn: 'Riser deflection trajectories, fatigue life estimations, critical RPM speeds, fracture toughness of sections.'
    },

    // 动态分析
    {
      id: 'D1',
      name: '盆地构造演化与成藏动态评价报告',
      nameEn: 'Basin Tectonic Evolution & Accumulation Report',
      category: '动态分析',
      categoryEn: 'Dynamic Analysis',
      pages: 135,
      date: '2026-05',
      description: '用于勘探早期到中期的远景带、圈闭精细分析。侧重烃源岩生排烃及通道网络评估。',
      descriptionEn: 'For early/mid exploration prospect mapping, focusing on source rocks and migration pathways.',
      defaultTopic: 'XX坳陷三叠系延长组主生烃期圈闭发育与动态成藏评价',
      defaultTopicEn: 'Tectonic History & Accumulation Evaluation for Triassic Reservoirs in XX Basin',
      defaultRequirements: '1. 重塑烃源岩成熟（Ro值）历史变迁曲线\n2. 解析深浅断裂断层与不整合面三维输导通道\n3. 指明有利断块油气动态充注时限与次序',
      defaultRequirementsEn: '1. Reconstruct source rock maturation (Ro) curves\n2. Map faults and unconformity migration pathways\n3. Pinpoint oil charging times and sequence',
      defaultCoreContent: '古剥蚀厚度拟合曲线、盆地热压裂烃历史剖面、主运移断层面阻隔性分化系数、圈闭含油气概率评价矩阵。',
      defaultCoreContentEn: 'Erosion restorations, thermal history paths, fault sealing coefficients, trap charging probability matrices.'
    },
    {
      id: 'D2',
      name: '老区注水精细描绘与剩余油动态分析',
      nameEn: 'Mature Field Fine Mapping & Remaining Oil Analysis',
      category: '动态分析',
      categoryEn: 'Dynamic Analysis',
      pages: 145,
      date: '2026-06',
      description: '解决老区特高含水、储层强非均质性导致剩余油分布零散、控水采油决策难的棘手难题。',
      descriptionEn: 'Solving high water cut reservoir remaining oil distribution tracking and control challenges.',
      defaultTopic: '白源油田XX断块微观剩余油分布规律与精细挖潜分析',
      defaultTopicEn: 'Microscopic Remaining Oil Distribution Rules for Mature Block in Baiyuan',
      defaultRequirements: '1. 基于动态压力追踪剖面解析驱替高含水水淹流道\n2. 构建多维度微观剩余油分布定性及定量判定体系\n3. 规划转注、提液或封堵等精准针对性挖潜排查方案',
      defaultRequirementsEn: '1. Map high velocity thief zones through dynamic pressure profiles\n2. Establish multi-dimensional microscopic remaining oil metrics\n3. Route customized production/injection adjustment plans',
      defaultCoreContent: '网状剩余油富集地质描述、层间非均质吸水剖面、优势主导通道孔道结构改变测算、剩余油饱水状态色谱分级。',
      defaultCoreContentEn: 'Residual oil cluster maps, water injection profiles, pore channel shearing effects, oil saturation grading.'
    },
    {
      id: 'D3',
      name: '单井试油试采动态诊断与产能评估',
      nameEn: 'Single Well Test & Production Dynamic Diagnosis',
      category: '动态分析',
      categoryEn: 'Dynamic Analysis',
      pages: 68,
      date: '2026-03',
      description: '对完井后的新井进行短期试采、稳定流动和变排量测试，诊断流体边界与导流能力。',
      descriptionEn: 'Diagnosis of fluid boundaries and conductivity via short-term flow tests and variable rate tests.',
      defaultTopic: 'X-101探井测试期井下不稳定压力变化动态分析',
      defaultTopicEn: 'Unstable Bottom-hole Pressure Dynamic Analysis for Exploration Well X-101',
      defaultRequirements: '1. 拟合不规则压力恢复双对数特征曲线以判断裂缝\n2. 计算地层原始稳定储层压力及单井表皮系数（Skin）\n3. 测算生产边界无偏递减产能，提出合理采油压差',
      defaultRequirementsEn: '1. Match pressure derivative log-log curves to analyze fracture networks\n2. Compute initial reservoir pressure and Skin factor\n3. Estimate dynamic production boundaries and drawdowns',
      defaultCoreContent: '压力倒数特征导数图件、井筒孔储效应界限时间、渗流阻力微观表观指数、中远期流体相流动变化安全预测值。',
      defaultCoreContentEn: 'Derivative matching curves, wellbore storage cutoff times, flow resistance skin index, fluid phase transitions.'
    },

    // 储量评估
    {
      id: 'E1',
      name: '油藏新增探明储量计算与评估报告',
      nameEn: 'New Proved Reserves Calculation & Evaluation',
      category: '储量评估',
      categoryEn: 'Reserve Assessment',
      pages: 110,
      date: '2026-05',
      description: '遵循国家能源局或SPE-PRMS国际储量准则，计算新发现圈闭、新增区块的探明地质储量。',
      descriptionEn: 'Calculate proved reserves in new traps according to SPE-PRMS and state standards.',
      defaultTopic: '柳北三叠系新发现构造带地质探明储量计算与申报',
      defaultTopicEn: 'New Proved Oil Reserves Calculation & Declaration for North Liu Fault Zone',
      defaultRequirements: '1. 采用高精度等值线法和容积法精确测定含油气面积\n2. 刻画并标定断块边界与各小层接触过渡段范围\n3. 科学确定孔隙度、饱和度、原油密度等核心地质采收参数',
      defaultRequirementsEn: '1. Determine oil-bearing area using high-precision contour volumetric methods\n2. Delineate fault block boundary and transition zones of sand layers\n3. Scientifically determine porosity, saturation, and oil density parameters',
      defaultCoreContent: '计算网格储量分布图表、关键测试井核心测试数据汇总、容积计算因子离散范围敏感度分析。',
      defaultCoreContentEn: 'Grid-based reserves distribution sheet, core properties summary, volumetric parameter sensitivity analysis.'
    },
    {
      id: 'E2',
      name: '页岩气技术可采储量 (EUR) 预测与评价',
      nameEn: 'Shale Gas EUR Prediction & Evaluation',
      category: '储量评估',
      categoryEn: 'Reserve Assessment',
      pages: 85,
      date: '2026-04',
      description: '融合Arps、Duong、Meehan等特种气藏递减计算方法，分析极低渗储层长周期采收率。',
      descriptionEn: 'Utilizing specialized gas decline models (Arps, Duong) to analyze long-term recovery of ultra-low perm formations.',
      defaultTopic: 'XX页岩气田多段水平井长期稳产后EUR衰减曲线预测',
      defaultTopicEn: 'Long-term Production EUR Prediction and Decline Analysis for XX Shale Gas Field',
      defaultRequirements: '1. 拟合长达三年生产期的单井压后不规则非稳态流流道\n2. 精细诊断由于套管变形及裂缝闭合导致的突发非线性产衰\n3. 预测气藏5年、10年及终极可采气量，给出不确定性误差条',
      defaultRequirementsEn: '1. Fit transient flow curves during three years of erratic shale gas output\n2. Diagnose sudden production steps from casing deformation or fracture closure\n3. Forecast 5, 10, and ultimate gas recovery with uncertainty margins',
      defaultCoreContent: 'Duong-Arps联合曲线拟合图、裂缝动态应力闭合常数、各不确定置信水平 (P90/P50/P10) 的累产对比。',
      defaultCoreContentEn: 'Duong-Arps joint curve matching charts, fracture closing factors, comparison of P90/P50/P10 cumulative gas.'
    },
    {
      id: 'E3',
      name: '开发晚期油田经济可采储量精细标定',
      nameEn: 'Late-Stage Field Economic Reserves Calibration',
      category: '储量评估',
      categoryEn: 'Reserve Assessment',
      pages: 95,
      date: '2025-12',
      description: '解决老油田高含水、多措井并存、高井均维护成本下面临的经济开采寿命评价。',
      descriptionEn: 'Evaluating economic limit lifespan of high water cut reservoirs under high maintenance costs.',
      defaultTopic: 'XX主力高含水低产区停产经济极限界定与储量核减报告',
      defaultTopicEn: 'Economic Limit Definition & Reserves Calibration for Late Stage High-Water Block XX',
      defaultRequirements: '1. 构建全周期低产能状态下的原油操作性边际成本（OPEX）模型\n2. 预测后续二次/三次采油措施能耗与折旧平衡点界限\n3. 分井段标定经济极限含水率，计算并扣除边际无效核减储量',
      defaultRequirementsEn: '1. Establish life-cycle OPEX models under extremely low low-productivity ranges\n2. Predict energy consumption break-evens of dynamic EOR schemes\n3. Calibrate water cut limit thresholds per zone to define non-economic reserve cuts',
      defaultCoreContent: '单井日产平衡极限指标对照表、五年期维护性投资现金流模拟曲线、无效生产层段核减明细汇总表。',
      defaultCoreContentEn: 'Daily margin limit per well, 5-yr cash flow curves, detailed list of written-off uneconomic reserves.'
    }
  ];

  // Pick default template on mount
  React.useEffect(() => {
    if (selectedTemplateId) {
      const t = templates.find(item => item.id === selectedTemplateId);
      if (t) {
        setTopic(lang === 'zh' ? t.defaultTopic : t.defaultTopicEn);
        setRequirements(lang === 'zh' ? t.defaultRequirements : t.defaultRequirementsEn);
        setCoreContent(lang === 'zh' ? t.defaultCoreContent : t.defaultCoreContentEn);
      }
    }
  }, [selectedTemplateId, lang]);

  const handleTemplateClick = (t: ReportTemplate) => {
    setSelectedTemplateId(t.id);
    setTopic(lang === 'zh' ? t.defaultTopic : t.defaultTopicEn);
    setRequirements(lang === 'zh' ? t.defaultRequirements : t.defaultRequirementsEn);
    setCoreContent(lang === 'zh' ? t.defaultCoreContent : t.defaultCoreContentEn);
  };

  const filteredTemplates = templates.filter(t => {
    if (lang === 'zh') {
      return t.category === activeCategory;
    } else {
      const idx = categories.indexOf(activeCategory);
      const zhCat = ['钻井地质', '开发方案', '工程设计', '动态分析', '储量评估'][idx];
      return t.category === zhCat;
    }
  });

  const handleGenerate = () => {
    if (!topic.trim()) return;
    const t = templates.find(item => item.id === selectedTemplateId);
    onGenerate({
      topic,
      outline,
      language,
      template: t ? (lang === 'zh' ? t.name : t.nameEn) : undefined,
      requirements: requirements || undefined,
      focusPoints: coreContent || undefined
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <i className="fas fa-file-invoice text-base"></i>
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  {lang === 'zh' ? '智能报告编写' : 'Smart Report Assistant'}
                </h2>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* TOP SECTION: Natural Language Inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {lang === 'zh' ? '编写需求描述' : 'Report Requirements Description'}
                </label>
                <textarea 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={lang === 'zh' ? '请描述您的编写需求，例如：生成X-101井浅海大位移水平井钻井地质设计，重点刻画靶区断裂带发育特征，并提供合理的井身结构与安全窗口范围...' : 'Describe what you want to write...'}
                  className="w-full h-20 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none shadow-inner leading-relaxed"
                />
              </div>

              {/* BOTTOM SECTION: Existing Templates */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  {lang === 'zh' ? '已有报告模板' : 'Existing Report Templates'}
                </label>
                
                {/* Tabs */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl w-fit mb-4">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        activeCategory === cat ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Templates Grid (Bento Style) */}
                <div className="grid grid-cols-3 gap-4">
                  {filteredTemplates.map(t => {
                    const isSelected = selectedTemplateId === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleTemplateClick(t)}
                        className={`group relative flex flex-col justify-between p-4 rounded-xl bg-white border-2 transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-indigo-500 ring-4 ring-indigo-500/10' 
                            : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] shadow-sm">
                            <i className="fas fa-check"></i>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] ${
                              isSelected ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-500'
                            } transition-colors`}>
                              <i className="fas fa-file-alt"></i>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <h4 className={`text-xs font-black tracking-tight leading-snug ${isSelected ? 'text-indigo-600' : 'text-slate-800'}`}>
                              {lang === 'zh' ? t.name : t.nameEn}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed line-clamp-2">
                              {lang === 'zh' ? t.description : t.descriptionEn}
                            </p>
                          </div>
                        </div>

                        {/* Metadata Footer */}
                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            <i className="fas fa-list-ol text-slate-300"></i>
                            <span>{getChapters(t.id, t.pages)} {lang === 'zh' ? '章' : 'Chapters'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="fas fa-chart-line text-slate-300"></i>
                            <span>{getUsageCount(t.id)} {lang === 'zh' ? '次使用' : 'Uses'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="fas fa-calendar-alt text-slate-300"></i>
                            <span>{t.date}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* OUTLINE SETTING */}
              <div className="flex items-center justify-between p-4 bg-white border border-slate-200/60 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${outline ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-400 border border-slate-200/50'}`}>
                    <i className="fas fa-list-ul text-xs"></i>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      {lang === 'zh' ? '是否需要先进行大纲和编写素材确认' : 'Confirm outline and writing materials first'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {lang === 'zh' ? '开启后，系统在开始正式编写前，会先生成详细的大纲与参考素材供您确认和微调' : 'The system will generate a detailed outline and source materials for you to verify first'}
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setOutline(!outline)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${outline ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${outline ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
              <button 
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button 
                type="button"
                disabled={!topic.trim()}
                onClick={handleGenerate}
                className="px-8 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
              >
                <i className="fas fa-magic text-xs"></i>
                {lang === 'zh' ? '开始编写' : 'Start Writing'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
