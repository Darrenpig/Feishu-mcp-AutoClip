// 智能客服对话模块类型定义

// 对话状态枚举
export enum ChatStatus {
  WAITING = 'waiting',        // 等待中
  ACTIVE = 'active',          // 进行中
  TRANSFERRED = 'transferred', // 已转人工
  CLOSED = 'closed',          // 已关闭
  TIMEOUT = 'timeout'         // 超时
}

// 消息发送者类型
export enum SenderType {
  CUSTOMER = 'customer',      // 客户
  BOT = 'bot',               // 机器人
  AGENT = 'agent'            // 人工客服
}

// 消息类型
export enum MessageType {
  TEXT = 'text',             // 文本消息
  IMAGE = 'image',           // 图片消息
  FILE = 'file',             // 文件消息
  CARD = 'card',             // 卡片消息
  SYSTEM = 'system'          // 系统消息
}

// 对话优先级
export enum ChatPriority {
  LOW = 'low',               // 低优先级
  NORMAL = 'normal',         // 普通优先级
  HIGH = 'high',             // 高优先级
  URGENT = 'urgent'          // 紧急
}

// 客服状态
export enum AgentStatus {
  ONLINE = 'online',         // 在线
  BUSY = 'busy',             // 忙碌
  AWAY = 'away',             // 离开
  OFFLINE = 'offline'        // 离线
}

// 消息接口
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderType: SenderType;
  senderName: string;
  senderAvatar?: string;
  messageType: MessageType;
  content: string;
  attachments?: MessageAttachment[];
  timestamp: string;
  isRead: boolean;
  metadata?: Record<string, any>;
}

// 消息附件
export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

// 对话会话
export interface ChatSession {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  customerPhone?: string;
  customerEmail?: string;
  agentId?: string;
  agentName?: string;
  agentAvatar?: string;
  status: ChatStatus;
  priority: ChatPriority;
  subject?: string;
  tags: string[];
  startTime: string;
  endTime?: string;
  lastMessageTime: string;
  lastMessage?: string;
  messageCount: number;
  unreadCount: number;
  satisfaction?: number; // 满意度评分 1-5
  notes?: string;
  metadata?: Record<string, any>;
}

// 客服代理
export interface ChatAgent {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  phone?: string;
  status: AgentStatus;
  department: string;
  skills: string[];
  maxConcurrentChats: number;
  currentChatCount: number;
  totalChats: number;
  averageResponseTime: number; // 平均响应时间（秒）
  satisfactionRating: number; // 满意度评分
  lastActiveTime: string;
  workingHours: WorkingHours;
}

// 工作时间
export interface WorkingHours {
  monday: TimeRange;
  tuesday: TimeRange;
  wednesday: TimeRange;
  thursday: TimeRange;
  friday: TimeRange;
  saturday: TimeRange;
  sunday: TimeRange;
}

// 时间范围
export interface TimeRange {
  start: string; // HH:mm
  end: string;   // HH:mm
  enabled: boolean;
}

// 快捷回复
export interface QuickReply {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 知识库条目
export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  keywords: string[];
  attachments?: MessageAttachment[];
  viewCount: number;
  useCount: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 对话统计
export interface ChatStats {
  totalChats: number;
  activeChats: number;
  waitingChats: number;
  closedChats: number;
  averageWaitTime: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  customerSatisfaction: number;
  botResolutionRate: number;
  transferRate: number;
}

// 客服工作量统计
export interface AgentWorkload {
  agentId: string;
  agentName: string;
  totalChats: number;
  activeChats: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  workingHours: number;
  efficiency: number; // 效率评分
}

// 对话查询参数
export interface ChatQueryParams {
  status?: ChatStatus[];
  agentId?: string;
  customerId?: string;
  priority?: ChatPriority[];
  startDate?: string;
  endDate?: string;
  keyword?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 消息查询参数
export interface MessageQueryParams {
  chatId: string;
  senderType?: SenderType[];
  messageType?: MessageType[];
  startDate?: string;
  endDate?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

// 对话分配规则
export interface ChatAssignmentRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number;
  conditions: AssignmentCondition[];
  actions: AssignmentAction[];
  createdAt: string;
  updatedAt: string;
}

// 分配条件
export interface AssignmentCondition {
  type: 'customer_tag' | 'chat_priority' | 'time_range' | 'agent_skill' | 'workload';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range';
  value: any;
}

// 分配动作
export interface AssignmentAction {
  type: 'assign_to_agent' | 'assign_to_department' | 'set_priority' | 'add_tag';
  value: any;
}

// 对话服务接口
export interface ChatService {
  // 对话管理
  getChats(params?: ChatQueryParams): Promise<PaginatedResponse<ChatSession>>;
  getChatById(id: string): Promise<ChatSession>;
  createChat(customerId: string, initialMessage?: string): Promise<ChatSession>;
  updateChat(id: string, updates: Partial<ChatSession>): Promise<ChatSession>;
  closeChat(id: string, reason?: string): Promise<void>;
  transferChat(id: string, agentId: string, reason?: string): Promise<void>;
  assignChat(id: string, agentId: string): Promise<void>;
  
  // 消息管理
  getMessages(params: MessageQueryParams): Promise<PaginatedResponse<ChatMessage>>;
  sendMessage(chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage>;
  markAsRead(chatId: string, messageIds: string[]): Promise<void>;
  
  // 客服管理
  getAgents(): Promise<ChatAgent[]>;
  getAgentById(id: string): Promise<ChatAgent>;
  updateAgentStatus(id: string, status: AgentStatus): Promise<void>;
  getAgentWorkload(id: string, startDate: string, endDate: string): Promise<AgentWorkload>;
  
  // 快捷回复
  getQuickReplies(category?: string): Promise<QuickReply[]>;
  createQuickReply(reply: Omit<QuickReply, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuickReply>;
  updateQuickReply(id: string, updates: Partial<QuickReply>): Promise<QuickReply>;
  deleteQuickReply(id: string): Promise<void>;
  
  // 知识库
  searchKnowledge(keyword: string, category?: string): Promise<KnowledgeItem[]>;
  getKnowledgeItem(id: string): Promise<KnowledgeItem>;
  createKnowledgeItem(item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeItem>;
  updateKnowledgeItem(id: string, updates: Partial<KnowledgeItem>): Promise<KnowledgeItem>;
  deleteKnowledgeItem(id: string): Promise<void>;
  
  // 统计分析
  getChatStats(startDate: string, endDate: string): Promise<ChatStats>;
  getAgentStats(startDate: string, endDate: string): Promise<AgentWorkload[]>;
  
  // 分配规则
  getAssignmentRules(): Promise<ChatAssignmentRule[]>;
  createAssignmentRule(rule: Omit<ChatAssignmentRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChatAssignmentRule>;
  updateAssignmentRule(id: string, updates: Partial<ChatAssignmentRule>): Promise<ChatAssignmentRule>;
  deleteAssignmentRule(id: string): Promise<void>;
}

// API响应接口
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

// 分页响应接口
export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// WebSocket消息类型
export enum WSMessageType {
  CHAT_MESSAGE = 'chat_message',
  CHAT_STATUS_CHANGE = 'chat_status_change',
  AGENT_STATUS_CHANGE = 'agent_status_change',
  TYPING_START = 'typing_start',
  TYPING_END = 'typing_end',
  CHAT_ASSIGNED = 'chat_assigned',
  CHAT_TRANSFERRED = 'chat_transferred'
}

// WebSocket消息接口
export interface WSMessage {
  type: WSMessageType;
  data: any;
  timestamp: string;
}

// 打字状态
export interface TypingStatus {
  chatId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

// 对话评价
export interface ChatRating {
  id: string;
  chatId: string;
  customerId: string;
  agentId?: string;
  rating: number; // 1-5星
  comment?: string;
  tags: string[];
  createdAt: string;
}

// 自动回复配置
export interface AutoReplyConfig {
  id: string;
  name: string;
  isActive: boolean;
  triggerConditions: {
    keywords: string[];
    timeRange?: TimeRange;
    customerTags?: string[];
    chatPriority?: ChatPriority[];
  };
  replyContent: {
    type: MessageType;
    content: string;
    delay?: number; // 延迟回复时间（毫秒）
  };
  actions: {
    transferToAgent?: boolean;
    setPriority?: ChatPriority;
    addTags?: string[];
    closeChat?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}