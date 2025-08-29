// 群聊管理相关类型定义

// 群聊状态枚举
export enum GroupStatus {
  ACTIVE = 'active',           // 活跃
  INACTIVE = 'inactive',       // 不活跃
  ARCHIVED = 'archived',       // 已归档
  DISBANDED = 'disbanded'       // 已解散
}

// 群聊类型枚举
export enum GroupType {
  CUSTOMER_SERVICE = 'customer_service',  // 客服群
  SALES = 'sales',                       // 销售群
  SUPPORT = 'support',                   // 技术支持群
  GENERAL = 'general'                    // 通用群
}

// 成员角色枚举
export enum MemberRole {
  OWNER = 'owner',           // 群主
  ADMIN = 'admin',           // 管理员
  MEMBER = 'member',         // 普通成员
  GUEST = 'guest'            // 访客
}

// 群聊成员接口
export interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  role: MemberRole;
  joinTime: Date;
  isInternal: boolean;       // 是否为内部员工
  userId?: string;           // 飞书用户ID
  email?: string;
  phone?: string;
  department?: string;       // 部门（内部员工）
  position?: string;         // 职位（内部员工）
}

// 群聊信息接口
export interface Group {
  id: string;
  chatId: string;            // 飞书群聊ID
  name: string;
  description?: string;
  avatar?: string;
  type: GroupType;
  status: GroupStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;         // 创建者ID
  customerIds: string[];     // 关联的客户ID列表
  members: GroupMember[];
  memberCount: number;
  lastMessageTime?: Date;
  lastMessage?: string;
  isAutoManaged: boolean;    // 是否自动管理
  tags: string[];            // 群聊标签
  settings: GroupSettings;
}

// 群聊设置接口
export interface GroupSettings {
  allowMemberInvite: boolean;      // 允许成员邀请
  allowMemberAtAll: boolean;       // 允许成员@所有人
  muteAll: boolean;                // 全员禁言
  autoReply: boolean;              // 自动回复
  autoReplyMessage?: string;       // 自动回复消息
  welcomeMessage?: string;         // 欢迎消息
  maxMembers: number;              // 最大成员数
  autoArchiveDays?: number;        // 自动归档天数
}

// 创建群聊表单数据
export interface CreateGroupFormData {
  name: string;
  description?: string;
  type: GroupType;
  customerIds: string[];           // 要邀请的客户ID
  internalMemberIds: string[];     // 要邀请的内部员工ID
  settings: Partial<GroupSettings>;
  tags?: string[];
}

// 群聊查询参数
export interface GroupQueryParams {
  status?: GroupStatus;
  type?: GroupType;
  createdBy?: string;
  customerId?: string;
  keyword?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'memberCount' | 'lastMessageTime';
  sortOrder?: 'asc' | 'desc';
}

// 群聊统计信息
export interface GroupStats {
  totalGroups: number;
  activeGroups: number;
  inactiveGroups: number;
  archivedGroups: number;
  totalMembers: number;
  averageMembersPerGroup: number;
  groupsByType: Record<GroupType, number>;
  dailyMessageCount: number;
  weeklyMessageCount: number;
  monthlyMessageCount: number;
}

// 群聊消息接口
export interface GroupMessage {
  id: string;
  messageId: string;         // 飞书消息ID
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'card' | 'system';
  timestamp: Date;
  isFromBot: boolean;
  replyToMessageId?: string;
  mentions?: string[];       // @的用户ID列表
  attachments?: MessageAttachment[];
}

// 消息附件接口
export interface MessageAttachment {
  id: string;
  name: string;
  type: 'image' | 'file' | 'video' | 'audio';
  url: string;
  size: number;
  mimeType: string;
}

// 群聊操作日志
export interface GroupLog {
  id: string;
  groupId: string;
  action: 'create' | 'update' | 'add_member' | 'remove_member' | 'archive' | 'disband';
  operatorId: string;
  operatorName: string;
  description: string;
  timestamp: Date;
  details?: Record<string, any>;
}

// 自动拉群规则
export interface AutoGroupRule {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  conditions: GroupCondition[];
  actions: GroupAction[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  executionCount: number;
  lastExecutionTime?: Date;
}

// 拉群条件
export interface GroupCondition {
  field: 'customerStatus' | 'intentionLevel' | 'source' | 'tags' | 'assignedTo';
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains';
  value: any;
}

// 拉群动作
export interface GroupAction {
  type: 'create_group' | 'add_to_existing_group' | 'notify_sales';
  config: Record<string, any>;
}

// API响应类型
export interface GroupApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

// 分页响应类型
export interface PaginatedGroupResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 群聊服务接口
export interface GroupService {
  // 群聊管理
  getGroups(params?: GroupQueryParams): Promise<PaginatedGroupResponse<Group>>;
  getGroupById(id: string): Promise<Group | null>;
  createGroup(data: CreateGroupFormData): Promise<Group>;
  updateGroup(id: string, data: Partial<Group>): Promise<Group>;
  deleteGroup(id: string): Promise<boolean>;
  archiveGroup(id: string): Promise<boolean>;
  
  // 成员管理
  addMembers(groupId: string, memberIds: string[]): Promise<boolean>;
  removeMembers(groupId: string, memberIds: string[]): Promise<boolean>;
  updateMemberRole(groupId: string, memberId: string, role: MemberRole): Promise<boolean>;
  
  // 消息管理
  getMessages(groupId: string, params?: any): Promise<PaginatedGroupResponse<GroupMessage>>;
  sendMessage(groupId: string, content: string, messageType?: string): Promise<GroupMessage>;
  
  // 统计信息
  getGroupStats(): Promise<GroupStats>;
  getGroupLogs(groupId: string): Promise<GroupLog[]>;
  
  // 自动拉群
  getAutoGroupRules(): Promise<AutoGroupRule[]>;
  createAutoGroupRule(rule: Omit<AutoGroupRule, 'id' | 'createdAt' | 'updatedAt' | 'executionCount'>): Promise<AutoGroupRule>;
  updateAutoGroupRule(id: string, rule: Partial<AutoGroupRule>): Promise<AutoGroupRule>;
  deleteAutoGroupRule(id: string): Promise<boolean>;
  executeAutoGroupRule(ruleId: string, customerIds: string[]): Promise<boolean>;
}

// 飞书API相关类型
export interface FeishuChatInfo {
  chat_id: string;
  name: string;
  description?: string;
  avatar?: string;
  owner_id: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface FeishuMemberInfo {
  member_id: string;
  member_type: 'user' | 'bot';
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
}

export interface FeishuCreateChatRequest {
  name: string;
  description?: string;
  user_id_list?: string[];
  bot_id_list?: string[];
  group_mode?: 'p2p' | 'group';
  chat_mode?: 'private' | 'public';
}

export interface FeishuCreateChatResponse {
  code: number;
  msg: string;
  data?: {
    chat_id: string;
    invalid_user_id_list?: string[];
    invalid_bot_id_list?: string[];
  };
}

export interface FeishuAddMembersRequest {
  id_list: string[];
  member_type: 'user_id' | 'open_id' | 'union_id';
}

export interface FeishuAddMembersResponse {
  code: number;
  msg: string;
  data?: {
    invalid_id_list?: string[];
  };
}