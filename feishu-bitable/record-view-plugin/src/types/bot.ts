// 飞书机器人API相关类型定义

// 机器人基本信息
export interface BotInfo {
  app_id: string;
  app_name: string;
  avatar_url: string;
  description: string;
  help_desk_url?: string;
  primary_language: string;
  app_type: number;
  status: number;
}

// 事件类型枚举
export enum EventType {
  // 消息事件
  MESSAGE_RECEIVED = 'im.message.receive_v1',
  MESSAGE_READ = 'im.message.message_read_v1',
  
  // 群聊事件
  CHAT_CREATED = 'im.chat.created_v1',
  CHAT_UPDATED = 'im.chat.updated_v1',
  CHAT_DISBANDED = 'im.chat.disbanded_v1',
  CHAT_MEMBER_BOT_ADDED = 'im.chat.member.bot_added_v1',
  CHAT_MEMBER_BOT_DELETED = 'im.chat.member.bot_deleted_v1',
  CHAT_MEMBER_USER_ADDED = 'im.chat.member.user_added_v1',
  CHAT_MEMBER_USER_WITHDRAWN = 'im.chat.member.user_withdrawn_v1',
  CHAT_MEMBER_USER_DELETED = 'im.chat.member.user_deleted_v1',
  
  // 应用事件
  APP_OPENED = 'application.bot.menu_v6',
  
  // 审批事件
  APPROVAL_INSTANCE = 'approval.instance',
  
  // 日历事件
  CALENDAR_EVENT_CHANGED = 'calendar.calendar.event_changed_v4',
  
  // 通讯录事件
  CONTACT_USER_CREATED = 'contact.user.created_v3',
  CONTACT_USER_UPDATED = 'contact.user.updated_v3',
  CONTACT_USER_DELETED = 'contact.user.deleted_v3',
  
  // 云文档事件
  DRIVE_FILE_CREATED = 'drive.file.created_v1',
  DRIVE_FILE_UPDATED = 'drive.file.updated_v1',
  DRIVE_FILE_DELETED = 'drive.file.deleted_v1'
}

// 消息类型
export enum MessageType {
  TEXT = 'text',
  POST = 'post',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  MEDIA = 'media',
  STICKER = 'sticker',
  INTERACTIVE = 'interactive',
  SHARE_CHAT = 'share_chat',
  SHARE_USER = 'share_user',
  SYSTEM = 'system'
}

// 聊天类型
export enum ChatType {
  P2P = 'p2p',
  GROUP = 'group'
}

// 发送者类型
export enum SenderType {
  USER = 'user',
  APP = 'app',
  SYSTEM = 'system'
}

// 消息内容接口
export interface MessageContent {
  text?: string;
  post?: any;
  image?: {
    image_key: string;
  };
  file?: {
    file_key: string;
    file_name: string;
    file_size: number;
  };
  audio?: {
    file_key: string;
    duration: number;
  };
  media?: {
    file_key: string;
    image_key: string;
    duration: number;
  };
  sticker?: {
    file_key: string;
  };
  interactive?: any;
  share_chat?: {
    chat_id: string;
  };
  share_user?: {
    user_id: string;
  };
}

// 发送者信息
export interface Sender {
  sender_id: {
    union_id?: string;
    user_id?: string;
    open_id?: string;
  };
  sender_type: SenderType;
  tenant_key: string;
}

// 消息体
export interface Message {
  message_id: string;
  root_id?: string;
  parent_id?: string;
  thread_id?: string;
  chat_id: string;
  chat_type: ChatType;
  message_type: MessageType;
  content: string;
  mentions?: Mention[];
  sender: Sender;
  create_time: string;
  update_time: string;
}

// @提及信息
export interface Mention {
  key: string;
  id: {
    union_id?: string;
    user_id?: string;
    open_id?: string;
  };
  name: string;
  tenant_key: string;
}

// 事件头信息
export interface EventHeader {
  event_id: string;
  event_type: EventType;
  create_time: string;
  token: string;
  app_id: string;
  tenant_key: string;
}

// 事件体基础接口
export interface BaseEvent {
  schema: string;
  header: EventHeader;
}

// 消息接收事件
export interface MessageReceiveEvent extends BaseEvent {
  event: {
    sender: Sender;
    message: Message;
  };
}

// 群聊创建事件
export interface ChatCreatedEvent extends BaseEvent {
  event: {
    chat_id: string;
    operator: {
      operator_id: {
        union_id?: string;
        user_id?: string;
        open_id?: string;
      };
      operator_type: string;
    };
  };
}

// 群聊成员变更事件
export interface ChatMemberEvent extends BaseEvent {
  event: {
    chat_id: string;
    operator: {
      operator_id: {
        union_id?: string;
        user_id?: string;
        open_id?: string;
      };
      operator_type: string;
    };
    users?: Array<{
      name: string;
      user_id: {
        union_id?: string;
        user_id?: string;
        open_id?: string;
      };
    }>;
  };
}

// 发送消息请求
export interface SendMessageRequest {
  receive_id: string;
  msg_type: MessageType;
  content: string;
  uuid?: string;
}

// 发送消息响应
export interface SendMessageResponse {
  code: number;
  msg: string;
  data?: {
    message_id: string;
    root_id?: string;
    parent_id?: string;
    thread_id?: string;
    msg_type: MessageType;
    create_time: string;
    update_time: string;
    deleted: boolean;
    updated: boolean;
    chat_id: string;
    sender: Sender;
    body: {
      content: string;
    };
    mentions?: Mention[];
    upper_message_id?: string;
  };
}

// 批量发送消息请求
export interface BatchSendMessageRequest {
  department_ids?: string[];
  open_ids?: string[];
  user_ids?: string[];
  union_ids?: string[];
  msg_type: MessageType;
  content: string;
}

// 消息卡片元素
export interface CardElement {
  tag: string;
  text?: {
    tag: string;
    content: string;
  };
  fields?: Array<{
    is_short: boolean;
    text: {
      tag: string;
      content: string;
    };
  }>;
  actions?: Array<{
    tag: string;
    text: {
      tag: string;
      content: string;
    };
    type?: string;
    value?: any;
    url?: string;
  }>;
}

// 消息卡片
export interface MessageCard {
  config?: {
    wide_screen_mode?: boolean;
    enable_forward?: boolean;
  };
  header?: {
    title: {
      tag: string;
      content: string;
    };
    template?: string;
  };
  elements: CardElement[];
}

// 机器人配置
export interface BotConfig {
  app_id: string;
  app_secret: string;
  verification_token: string;
  encrypt_key?: string;
  webhook_url?: string;
  event_types: EventType[];
}

// 事件处理器接口
export interface EventHandler {
  handleMessageReceive?: (event: MessageReceiveEvent) => Promise<void>;
  handleChatCreated?: (event: ChatCreatedEvent) => Promise<void>;
  handleChatMemberAdded?: (event: ChatMemberEvent) => Promise<void>;
  handleChatMemberRemoved?: (event: ChatMemberEvent) => Promise<void>;
}

// 自动回复规则
export interface AutoReplyRule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number;
  conditions: {
    keywords?: string[];
    messageType?: MessageType[];
    chatType?: ChatType[];
    senderType?: SenderType[];
    timeRange?: {
      start: string;
      end: string;
    };
  };
  actions: {
    replyType: 'text' | 'card' | 'template';
    content: string | MessageCard;
    delay?: number; // 延迟回复时间（毫秒）
    transferToHuman?: boolean; // 是否转人工
  };
  createdAt: string;
  updatedAt: string;
}

// 机器人服务接口
export interface BotService {
  // 初始化
  initialize(config: BotConfig): Promise<void>;
  
  // 获取访问令牌
  getAccessToken(): Promise<string>;
  
  // 发送消息
  sendMessage(chatId: string, msgType: MessageType, content: string): Promise<SendMessageResponse>;
  
  // 批量发送消息
  batchSendMessage(request: BatchSendMessageRequest): Promise<any>;
  
  // 发送卡片消息
  sendCardMessage(chatId: string, card: MessageCard): Promise<SendMessageResponse>;
  
  // 回复消息
  replyMessage(messageId: string, msgType: MessageType, content: string): Promise<SendMessageResponse>;
  
  // 获取消息历史
  getMessageHistory(chatId: string, pageToken?: string, pageSize?: number): Promise<any>;
  
  // 获取群聊信息
  getChatInfo(chatId: string): Promise<any>;
  
  // 获取群聊成员列表
  getChatMembers(chatId: string): Promise<any>;
  
  // 事件处理
  handleEvent(eventData: any): Promise<void>;
  
  // 注册事件处理器
  registerEventHandler(handler: EventHandler): void;
  
  // 自动回复管理
  getAutoReplyRules(): Promise<AutoReplyRule[]>;
  createAutoReplyRule(rule: Omit<AutoReplyRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AutoReplyRule>;
  updateAutoReplyRule(id: string, rule: Partial<AutoReplyRule>): Promise<AutoReplyRule>;
  deleteAutoReplyRule(id: string): Promise<void>;
  
  // 处理自动回复
  processAutoReply(message: Message): Promise<void>;
}

// API响应基础接口
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data?: T;
}

// 分页响应接口
export interface PaginatedResponse<T> {
  has_more: boolean;
  page_token?: string;
  items: T[];
}