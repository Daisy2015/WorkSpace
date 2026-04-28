import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Info, Sparkles } from 'lucide-react';

export interface StrategyConfig {
  // 对象范围策略
  objectScope: {
    neighbor: {
      distanceMode: 'preset' | 'custom';
      distance: number;
      count: 'top3' | 'top5' | 'all';
      priority: 'distance' | 'production' | 'completion';
    };
    similar: {
      enabled: boolean;
      dimensions: string[];
      threshold: number;
    };
    autoExpand: {
      neighborWells: boolean;
      historicalWells: boolean;
      failureCases: boolean;
    };
  };
  // 资源构建策略
  resourceBuild: {
    dataRange: {
      timeRange: '1year' | '3years' | 'all';
      types: {
        report: boolean;
        drawing: boolean;
        rawData: boolean;
      };
    };
    quality: {
      finalVersionOnly: boolean;
      excludeDraft: boolean;
      preferExpertReview: boolean;
    };
    quantityControl: {
      maxPerType: number;
      deduplicate: boolean;
      mergeVersions: boolean;
    };
    preference: {
      recency: 'latest' | 'bestPractice';
      source: 'current' | 'neighbor';
      caseType: 'success' | 'all';
    };
  };
}

const defaultStrategy: StrategyConfig = {
  objectScope: {
    neighbor: {
      distanceMode: 'preset',
      distance: 1000,
      count: 'top3',
      priority: 'distance'
    },
    similar: {
      enabled: true,
      dimensions: ['地层', '压裂规模'],
      threshold: 0.8
    },
    autoExpand: {
      neighborWells: true,
      historicalWells: true,
      failureCases: false
    }
  },
  resourceBuild: {
    dataRange: {
      timeRange: '3years',
      types: {
        report: true,
        drawing: true,
        rawData: false
      }
    },
    quality: {
      finalVersionOnly: true,
      excludeDraft: true,
      preferExpertReview: true
    },
    quantityControl: {
      maxPerType: 50,
      deduplicate: true,
      mergeVersions: true
    },
    preference: {
      recency: 'bestPractice',
      source: 'current',
      caseType: 'success'
    }
  }
};

export default function WorkspaceStrategyConfig({
  value = defaultStrategy,
  onChange
}: {
  value?: StrategyConfig;
  onChange: (config: StrategyConfig) => void;
}) {
  const [config, setConfig] = useState<StrategyConfig>(value);

  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  const toggleDetails = (id: string) => {
    setExpandedDetails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderDetails = (id: string, content: string) => {
    if (!expandedDetails[id]) return null;
    return (
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mt-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[11px] text-indigo-700 leading-relaxed italic"
      >
        <div className="flex gap-2">
          <Info className="w-3 h-3 mt-0.5 shrink-0" />
          <span>{content}</span>
        </div>
      </motion.div>
    );
  };

  const updateConfig = (path: string[], newValue: any) => {
    const newConfig = { ...config };
    let current: any = newConfig;
    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        current[key] = { ...current[key] };
        current = current[key];
    }
    current[path[path.length - 1]] = newValue;
    setConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="object" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="object">对象范围策略</TabsTrigger>
          <TabsTrigger value="resource">资源构建策略</TabsTrigger>
        </TabsList>

        {/* 对象范围策略 */}
        <TabsContent value="object" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base text-slate-800">邻井选择规则</CardTitle>
                  <CardDescription>定义如何选择邻井对象</CardDescription>
                </div>
                <button 
                  onClick={() => toggleDetails('neighbor')}
                  className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all ${expandedDetails['neighbor'] ? 'bg-indigo-600 text-white' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
                >
                  细节
                </button>
              </div>
              {renderDetails('neighbor', '系统将根据填写的地理坐标，计算当前井位与全库井位的空间距离。预设范围通常基于区域地质规律（如500m常用于加密井对比，2000m用于区域概查）。优先级可根据业务需求调整，例如产量优先将选择在该层位表现最佳的生产井。')}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700">距离范围</Label>
                <RadioGroup
                  value={config.objectScope.neighbor.distanceMode}
                  onValueChange={(value) => updateConfig(['objectScope', 'neighbor', 'distanceMode'], value)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="preset" id="distance-preset" />
                      <Label htmlFor="distance-preset" className="cursor-pointer text-slate-600">预设范围</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="custom" id="distance-custom" />
                      <Label htmlFor="distance-custom" className="cursor-pointer text-slate-600">自定义</Label>
                    </div>
                  </div>
                </RadioGroup>
                <div className="flex items-center gap-3">
                  {config.objectScope.neighbor.distanceMode === 'preset' ? (
                    <div className="flex gap-2">
                      {[500, 1000, 2000].map(dist => (
                        <button
                          key={dist}
                          onClick={() => updateConfig(['objectScope', 'neighbor', 'distance'], dist)}
                          className={`
                            px-4 py-2 border rounded-lg transition-colors text-sm font-medium
                            ${config.objectScope.neighbor.distance === dist
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }
                          `}
                        >
                          {dist}m
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="w-32"
                        value={config.objectScope.neighbor.distance}
                        onChange={(e) => updateConfig(['objectScope', 'neighbor', 'distance'], parseInt(e.target.value) || 0)}
                      />
                      <span className="text-sm text-slate-500">米</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">数量限制</Label>
                <Select
                  value={config.objectScope.neighbor.count}
                  onValueChange={(value) => updateConfig(['objectScope', 'neighbor', 'count'], value)}
                >
                  <SelectTrigger className="text-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top3">Top 3 邻井</SelectItem>
                    <SelectItem value="top5">Top 5 邻井</SelectItem>
                    <SelectItem value="all">全部邻井</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">优先级排序</Label>
                <Select
                  value={config.objectScope.neighbor.priority}
                  onValueChange={(value) => updateConfig(['objectScope', 'neighbor', 'priority'], value)}
                >
                  <SelectTrigger className="text-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">距离优先</SelectItem>
                    <SelectItem value="production">产量优先</SelectItem>
                    <SelectItem value="completion">完井方式优先</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base text-slate-800">相似井规则</CardTitle>
                  <CardDescription>基于多维度特征推荐相似井</CardDescription>
                </div>
                <button 
                  onClick={() => toggleDetails('similar')}
                  className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all ${expandedDetails['similar'] ? 'bg-indigo-600 text-white' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
                >
                  细节
                </button>
              </div>
              {renderDetails('similar', '相似度算法采用余弦相似度与欧式距离加权计算。维度选择越多，计算精度越高，但可能由于数据缺失导致推荐结果较少。建议至少勾选「地层」和「完井方式」以确保地质背景的一致性。')}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-700">启用相似井推荐</Label>
                  <p className="text-xs text-slate-500">基于地质和工程特征匹配</p>
                </div>
                <Switch
                  checked={config.objectScope.similar.enabled}
                  onCheckedChange={(checked) => updateConfig(['objectScope', 'similar', 'enabled'], checked)}
                />
              </div>

              {config.objectScope.similar.enabled && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-slate-700">相似维度</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {['地层', '压裂规模', '产量', '井深', '完井方式'].map(dim => (
                        <div key={dim} className="flex items-center gap-2">
                          <Checkbox
                            id={`dim-${dim}`}
                            checked={config.objectScope.similar.dimensions.includes(dim)}
                            onCheckedChange={(checked) => {
                              const dimensions = checked
                                ? [...config.objectScope.similar.dimensions, dim]
                                : config.objectScope.similar.dimensions.filter(d => d !== dim);
                              updateConfig(['objectScope', 'similar', 'dimensions'], dimensions);
                            }}
                          />
                          <Label htmlFor={`dim-${dim}`} className="cursor-pointer text-sm text-slate-600">
                            {dim}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Label className="text-slate-700">相似度阈值</Label>
                        <span className="text-sm font-bold text-blue-600">{config.objectScope.similar.threshold}</span>
                    </div>
                    <Slider
                      value={[config.objectScope.similar.threshold]}
                      onValueChange={([value]) => updateConfig(['objectScope', 'similar', 'threshold'], value)}
                      min={0.5}
                      max={1}
                      step={0.05}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
                      <span>0.5 (宽松)</span>
                      <span>1.0 (严格)</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base text-slate-800">自动扩展选项</CardTitle>
                  <CardDescription>系统自动扩展对象范围</CardDescription>
                </div>
                <button 
                  onClick={() => toggleDetails('expand')}
                  className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all ${expandedDetails['expand'] ? 'bg-indigo-600 text-white' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
                >
                  细节
                </button>
              </div>
              {renderDetails('expand', '自动化知识图谱推演逻辑。当选中某口邻井时，系统会自动挖掘该邻井曾参与过的相似研究项目、涉及的邻近井位以及对应的失败/成功作业案例，从而为您构建一个更完整的数据上下文环境。')}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-700">自动扩展邻井</Label>
                  <p className="text-xs text-slate-500">基于邻井推荐相关井</p>
                </div>
                <Switch
                  checked={config.objectScope.autoExpand.neighborWells}
                  onCheckedChange={(checked) => updateConfig(['objectScope', 'autoExpand', 'neighborWells'], checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-700">自动加入历史井</Label>
                  <p className="text-xs text-slate-500">包含历史相关井数据</p>
                </div>
                <Switch
                  checked={config.objectScope.autoExpand.historicalWells}
                  onCheckedChange={(checked) => updateConfig(['objectScope', 'autoExpand', 'historicalWells'], checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-700">自动加入失败案例</Label>
                  <p className="text-xs text-slate-500">包含失败案例用于对比</p>
                </div>
                <Switch
                  checked={config.objectScope.autoExpand.failureCases}
                  onCheckedChange={(checked) => updateConfig(['objectScope', 'autoExpand', 'failureCases'], checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 资源构建策略 */}
        <TabsContent value="resource" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base text-slate-800">数据范围控制</CardTitle>
                  <CardDescription>限定资源的时间和类型范围</CardDescription>
                </div>
                <button 
                  onClick={() => toggleDetails('dataRange')}
                  className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all ${expandedDetails['dataRange'] ? 'bg-indigo-600 text-white' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
                >
                  细节
                </button>
              </div>
              {renderDetails('dataRange', '定义抓取成果资料的时间边界。近1年数据通常包含最新的施工技术与工艺，适合由于技术更新快而需要参考最新成果的场景；「全部」则适用于建立完整的地质背景认知。')}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-slate-700">时间范围</Label>
                <RadioGroup
                  value={config.resourceBuild.dataRange.timeRange}
                  onValueChange={(value) => updateConfig(['resourceBuild', 'dataRange', 'timeRange'], value)}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="1year" id="time-1year" />
                      <Label htmlFor="time-1year" className="cursor-pointer text-slate-600">近1年</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="3years" id="time-3years" />
                      <Label htmlFor="time-3years" className="cursor-pointer text-slate-600">近3年</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="all" id="time-all" />
                      <Label htmlFor="time-all" className="cursor-pointer text-slate-600">全部</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-slate-700">数据类型</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="type-report" className="cursor-pointer text-slate-600">报告文档</Label>
                    <Switch
                      id="type-report"
                      checked={config.resourceBuild.dataRange.types.report}
                      onCheckedChange={(checked) => updateConfig(['resourceBuild', 'dataRange', 'types', 'report'], checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="type-drawing" className="cursor-pointer text-slate-600">图件资料</Label>
                    <Switch
                      id="type-drawing"
                      checked={config.resourceBuild.dataRange.types.drawing}
                      onCheckedChange={(checked) => updateConfig(['resourceBuild', 'dataRange', 'types', 'drawing'], checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="type-rawdata" className="cursor-pointer text-slate-600">原始数据</Label>
                    <Switch
                      id="type-rawdata"
                      checked={config.resourceBuild.dataRange.types.rawData}
                      onCheckedChange={(checked) => updateConfig(['resourceBuild', 'dataRange', 'types', 'rawData'], checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base text-slate-800">质量过滤规则</CardTitle>
                  <CardDescription>控制资源质量和版本</CardDescription>
                </div>
                <button 
                  onClick={() => toggleDetails('quality')}
                  className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all ${expandedDetails['quality'] ? 'bg-indigo-600 text-white' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
                >
                  细节
                </button>
              </div>
              {renderDetails('quality', '多维度质量筛选机制。启用「仅最终版」将过滤掉所有Alpha、Beta、专家初核等中间环节产生的草稿成果。优先选择专家审核成果将通过权限标签筛选出在企业知识库中具有「权威」标识的数据集。')}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-700">仅选择最终版</Label>
                  <p className="text-xs text-slate-500">排除中间版本</p>
                </div>
                <Switch
                  checked={config.resourceBuild.quality.finalVersionOnly}
                  onCheckedChange={(checked) => updateConfig(['resourceBuild', 'quality', 'finalVersionOnly'], checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-700">排除草稿文档</Label>
                  <p className="text-xs text-slate-500">仅包含正式文档</p>
                </div>
                <Switch
                  checked={config.resourceBuild.quality.excludeDraft}
                  onCheckedChange={(checked) => updateConfig(['resourceBuild', 'quality', 'excludeDraft'], checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-700">优先专家审核</Label>
                  <p className="text-xs text-slate-500">优先选择专家审核通过的资源</p>
                </div>
                <Switch
                  checked={config.resourceBuild.quality.preferExpertReview}
                  onCheckedChange={(checked) => updateConfig(['resourceBuild', 'quality', 'preferExpertReview'], checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base text-slate-800">资源数量控制</CardTitle>
                  <CardDescription>限制资源数量和去重策略</CardDescription>
                </div>
                <button 
                  onClick={() => toggleDetails('quantity')}
                  className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all ${expandedDetails['quantity'] ? 'bg-indigo-600 text-white' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
                >
                  细节
                </button>
              </div>
              {renderDetails('quantity', '防止信息过载的自动裁剪逻辑。去重策略会对比文件MD5值与摘要内容，移除相同成果。版本合并则会将历次修订版本的文档以「历史版本」形式归集至同一个资源卡片内，保持工作空间清爽。')}
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <Label className="text-slate-700">每类资源数量上限</Label>
                    <span className="text-sm font-bold text-blue-600">{config.resourceBuild.quantityControl.maxPerType}</span>
                </div>
                <Slider
                  value={[config.resourceBuild.quantityControl.maxPerType]}
                  onValueChange={([value]) => updateConfig(['resourceBuild', 'quantityControl', 'maxPerType'], value)}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
                  <span>10</span>
                  <span>100</span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-700">自动去重</Label>
                  <p className="text-xs text-slate-500">移除重复资源</p>
                </div>
                <Switch
                  checked={config.resourceBuild.quantityControl.deduplicate}
                  onCheckedChange={(checked) => updateConfig(['resourceBuild', 'quantityControl', 'deduplicate'], checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-700">合并版本</Label>
                  <p className="text-xs text-slate-500">同一资源多版本合并</p>
                </div>
                <Switch
                  checked={config.resourceBuild.quantityControl.mergeVersions}
                  onCheckedChange={(checked) => updateConfig(['resourceBuild', 'quantityControl', 'mergeVersions'], checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base text-slate-800">推荐偏好</CardTitle>
                  <CardDescription>定义资源推荐的优先级</CardDescription>
                </div>
                <button 
                  onClick={() => toggleDetails('preference')}
                  className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all ${expandedDetails['preference'] ? 'bg-indigo-600 text-white' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
                >
                  细节
                </button>
              </div>
              {renderDetails('preference', '资源权重分配算法。最佳实践偏好将引导系统优先挂载那些曾在省部级评审中获得优等、或被标记为「典型范例」的成果。来源偏好则决定了在数据冲突时，是倾向于本井历史还是邻近成功案例。')}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-slate-700">时效性偏好</Label>
                <RadioGroup
                  value={config.resourceBuild.preference.recency}
                  onValueChange={(value) => updateConfig(['resourceBuild', 'preference', 'recency'], value)}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="latest" id="recency-latest" />
                      <Label htmlFor="recency-latest" className="cursor-pointer text-slate-600">优先最新资源</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="bestPractice" id="recency-best" />
                      <Label htmlFor="recency-best" className="cursor-pointer text-slate-600">优先最佳实践</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-slate-700">来源偏好</Label>
                <RadioGroup
                  value={config.resourceBuild.preference.source}
                  onValueChange={(value) => updateConfig(['resourceBuild', 'preference', 'source'], value)}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="current" id="source-current" />
                      <Label htmlFor="source-current" className="cursor-pointer text-slate-600">优先本井资源</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="neighbor" id="source-neighbor" />
                      <Label htmlFor="source-neighbor" className="cursor-pointer text-slate-600">优先邻井资源</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-slate-700">案例类型</Label>
                <RadioGroup
                  value={config.resourceBuild.preference.caseType}
                  onValueChange={(value) => updateConfig(['resourceBuild', 'preference', 'caseType'], value)}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="success" id="case-success" />
                      <Label htmlFor="case-success" className="cursor-pointer text-slate-600">仅成功案例</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="all" id="case-all" />
                      <Label htmlFor="case-all" className="cursor-pointer text-slate-600">全部案例（含失败）</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
