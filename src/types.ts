
import React from 'react';

export type Language = 'zh' | 'en';

export enum WorkspaceStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export interface Workspace {
  id: string;
  name: string;
  mbuCount: number;
  createdAt: string;
  lastModified?: string;
  resourceCount?: number;
  status: WorkspaceStatus;
  owner: string;
  description: string;
  objects?: any[];
}

export type ResourceType = 'domain' | 'mbu' | 'artifact' | 'folder';

export interface ResourceNode {
  id: string;
  name: string;
  type: ResourceType;
  children?: ResourceNode[];
  meta?: {
    sourceType?: 'system' | 'local' | 'web';
    date?: string;
    fileType?: string;
    url?: string;
    content?: string;
    page?: number;
    isPublic?: boolean;
    outcomeName?: string;
    outcomeType?: string;
    objectId?: string;
    isArtifactOutcome?: boolean;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isTemp?: boolean; // Is it a temporary result?
  relatedSources?: string[]; // IDs of resources used
  contentType?: 'text' | 'report'; // Content type
  isMockResult?: boolean;
  agentId?: string; // Which agent sent this message
  status?: 'processing' | 'completed' | 'error'; // For agent processing status
  subTasks?: { id: string; agentId: string; task: string; status: 'pending' | 'processing' | 'completed'; result?: string }[]; // For leader agent task breakdown
  cardType?: 'loop' | 'stage_result' | 'chart' | 'workflow' | 'position';
  payload?: any;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string | React.ReactNode;
  description: string;
  isLeader?: boolean;
  isEnabled?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ChatSession {
  id: string;
  workspaceId: string;
  messages: Message[];
}

// --- Admin Module Types ---

export interface SemanticEntry {
  id: string;
  name: string;
  module: string;
  type: string;
  content: string;
  isEnabled: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export type ModelStatus = 'Queued' | 'Preparing' | 'Training' | 'Evaluating' | 'Success' | 'Failed';

export interface NERModel {
  id: string;
  name: string;
  baseModel: string;
  dataset: string;
  sampleCount: number;
  startTime: string;
  status: ModelStatus;
  progress: {
    epoch: number;
    totalEpoch: number;
    loss: number;
    f1: number;
    remainingTime?: string;
  };
  metrics: {
    precision: number;
    recall: number;
    f1: number;
  };
  isActive: boolean;
  config: {
    training: {
      baseModel: string;
      learningRate: number;
      batchSize: number;
      epoch: number;
      maxLength: number;
      optimizer: string;
    };
    data: {
      source: string;
      tagSystem: string;
      tagCount: number;
      sampleDistribution: string;
      version: string;
    };
    deployment: {
      inferenceUrl: string;
      gpuQuota: string;
      maxConcurrency: number;
      timeout: number;
    };
  };
}

export interface WorkflowEntry {
  id: string;
  name: string;
  type: 'Report' | 'Business' | 'SOP' | 'Collaboration' | 'Batch';
  applicableAgent: string;
  nodeCount: number;
  skillRefs: number;
  toolRefs: number;
  successRate: string;
  avgDuration: string;
  workspaceRefs: number;
  packageScope: string[];
  status: 'Draft' | 'Testing' | 'Production';
  description: string;
  updatedAt?: string;
  isEnabled?: boolean;
  updatedBy?: string;
}

export interface ToolEntry {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  authType: 'API Key' | 'OAuth2' | 'None' | 'Bearer';
  skillRefs: number;
  workflowRefs: number;
  successRate: string;
  p95Latency: string;
  costPerCall: string;
  status: 'Active' | 'Inactive' | 'Degraded';
  description: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
  isEnabled?: boolean;
  inputSchema?: string;
  outputSchema?: string;
}

export interface SkillEntry {
  id: string;
  name: string;
  scope: 'Global' | 'Project';
  description: string;
  instructions: string;
  isEnabled: boolean;
  updatedAt: string;
  updatedBy?: string;
  category?: string;
  version?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  mbu: string;
  type: 'QA' | 'StatusChange' | 'Generate' | 'Save' | 'ResourceEdit' | 'Export' | 'Archive';
  object: 'Workspace' | 'Resource' | 'Analysis' | 'Outcome' | 'Report' | 'Notebook';
  summary: string;
  details: {
    input: string;
    output: string;
    evidence: { name: string; type: string; source: string }[];
    runRecord: { step: string; io: string; duration: string }[];
  };
}

export interface FeedbackEntry {
  id: string;
  timestamp: string;
  user: string;
  mbu: string;
  notebookName: string;
  type: 'Useful' | 'Error' | 'WrongScope';
  status: 'Pending' | 'Resolved';
  content: string;
  processor?: string; // New field
  result?: string; // New field
}

export interface OutcomeEntry {
  id: string;
  title: string;
  mbu: string;
  submitter: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  contentSnippet: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  lastUpdated: string;
  status: 'Active' | 'Draft' | 'Deprecated';
  structure: string;
}

// --- Knowledge Base Types ---

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  mbuCount: number;
  usageCount: number;
  createdAt: string;
  owner: string;
  category: string;
  tags?: string[];
  icon?: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  type: 'doc' | 'pdf' | 'xls' | 'img' | 'outcome';
  source: 'workspace' | 'upload';
  mbuTag?: string;
  createdAt: string;
  size: string;
  description?: string;
  tags?: string[];
  refWorkspaceName?: string; // If source is workspace
  isPublic?: boolean;
}

// --- Corpus Management Types ---

export interface CorpusTemplate {
  id: string;
  name: string;
  rawTemplate: string;
  varCount: number;
  genCount: number;
  tagTypes: string[];
  updateTime: string;
}

export interface VariablePool {
  [key: string]: string[];
}

export interface GeneratedSample {
  id: string;
  text: string;
  sourceTemplateId: string;
  tags: string[];
}

export interface TrainingSet {
  id: string;
  name: string;
  source: 'Template' | 'Manual';
  sampleCount: number;
  entityTypes: string[];
  splitRatio: { train: number; val: number; test: number };
  quality: { completeness: number; duplication: number; score: number };
  version: string;
  updateTime: string;
}

export interface TrainingSample {
  id: string;
  text: string;
  tags: string[];
  sourceTemplate?: string;
  status: 'Audited' | 'Pending';
}
