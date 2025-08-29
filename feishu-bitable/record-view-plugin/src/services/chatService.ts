import {
  ChatSession,
  ChatMessage,
  ChatAgent,
  QuickReply,
  KnowledgeItem,
  ChatStats,
  AgentWorkload,
  ChatAssignmentRule,
  ChatQueryParams,
  MessageQueryParams,
  ChatStatus,
  SenderType,
  MessageType,
  AgentStatus,
  ChatPriority,
  PaginatedResponse,
  ApiResponse,
  AutoReplyConfig,
  ChatRating,
  WSMessage,
  WSMessageType,
  TypingStatus
} from '../types/chat';
import { bitable } from '@lark-opdev/block-bitable-api';

class ChatService {
  private accessToken: string = '';
  private appId: string = '';
  private appSecret: string = '';
  private wsConnection: WebSocket | null = null;
  private eventHandlers: Map<WSMessageType, Function[]> = new Map();
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();

  // 表格ID映射
  private tableIds = {
    chats: '',
    messages: '',
    agents: '',
    quickReplies: '',
    knowledge: '',
    ratings: '',
    autoReplies: '',
    assignmentRules: ''
  };

  constructor() {
    this.initializeService();
  }

  // 初始化服务
  private async initializeService(): Promise<void> {
    try {
      await this.initializeTables();
      await this.loadConfiguration();
      this.setupWebSocket();
    } catch (error) {
      console.error('Failed to initialize chat service:', error);
    }
  }

  // 初始化数据表
  private async initializeTables(): Promise<void> {
    const tableNames = {
      chats: '对话会话',
      messages: '对话消息',
      agents: '客服代理',
      quickReplies: '快捷回复',
      knowledge: '知识库',
      ratings: '对话评价',
      autoReplies: '自动回复',
      assignmentRules: '分配规则'
    };

    for (const [key, tableName] of Object.entries(tableNames)) {
      try {
        const tables = await bitable.base.getTableList();
        let table = tables.find(t => t.name === tableName);
        
        if (!table) {
          table = await bitable.base.addTable({ name: tableName });
          await this.createTableFields(key as keyof typeof this.tableIds, table.id);
        }
        
        this.tableIds[key as keyof typeof this.tableIds] = table.id;
      } catch (error) {
        console.error(`Failed to initialize table ${tableName}:`, error);
      }
    }
  }

  // 创建表格字段
  private async createTableFields(tableType: keyof typeof this.tableIds, tableId: string): Promise<void> {
    const table = await bitable.base.getTable(tableId);
    
    const fieldConfigs = {
      chats: [
        { name: '对话ID', type: 1 }, // 单行文本
        { name: '客户ID', type: 1 },
        { name: '客户姓名', type: 1 },
        { name: '客服ID', type: 1 },
        { name: '客服姓名', type: 1 },
        { name: '状态', type: 3 }, // 单选
        { name: '优先级', type: 3 },
        { name: '主题', type: 1 },
        { name: '标签', type: 4 }, // 多选
        { name: '开始时间', type: 5 }, // 日期时间
        { name: '结束时间', type: 5 },
        { name: '最后消息时间', type: 5 },
        { name: '最后消息', type: 1 },
        { name: '消息数量', type: 2 }, // 数字
        { name: '未读数量', type: 2 },
        { name: '满意度', type: 2 },
        { name: '备注', type: 1 }
      ],
      messages: [
        { name: '消息ID', type: 1 },
        { name: '对话ID', type: 1 },
        { name: '发送者ID', type: 1 },
        { name: '发送者类型', type: 3 },
        { name: '发送者姓名', type: 1 },
        { name: '消息类型', type: 3 },
        { name: '消息内容', type: 1 },
        { name: '时间戳', type: 5 },
        { name: '是否已读', type: 7 }, // 复选框
        { name: '附件', type: 1 }
      ],
      agents: [
        { name: '客服ID', type: 1 },
        { name: '姓名', type: 1 },
        { name: '邮箱', type: 15 }, // 邮箱
        { name: '电话', type: 13 }, // 电话号码
        { name: '状态', type: 3 },
        { name: '部门', type: 1 },
        { name: '技能标签', type: 4 },
        { name: '最大并发对话', type: 2 },
        { name: '当前对话数', type: 2 },
        { name: '总对话数', type: 2 },
        { name: '平均响应时间', type: 2 },
        { name: '满意度评分', type: 2 },
        { name: '最后活跃时间', type: 5 }
      ],
      quickReplies: [
        { name: '回复ID', type: 1 },
        { name: '标题', type: 1 },
        { name: '内容', type: 1 },
        { name: '分类', type: 1 },
        { name: '标签', type: 4 },
        { name: '使用次数', type: 2 },
        { name: '是否启用', type: 7 },
        { name: '创建时间', type: 5 },
        { name: '更新时间', type: 5 }
      ],
      knowledge: [
        { name: '知识ID', type: 1 },
        { name: '标题', type: 1 },
        { name: '内容', type: 1 },
        { name: '分类', type: 1 },
        { name: '标签', type: 4 },
        { name: '关键词', type: 4 },
        { name: '查看次数', type: 2 },
        { name: '使用次数', type: 2 },
        { name: '是否公开', type: 7 },
        { name: '创建者', type: 1 },
        { name: '创建时间', type: 5 },
        { name: '更新时间', type: 5 }
      ],
      ratings: [
        { name: '评价ID', type: 1 },
        { name: '对话ID', type: 1 },
        { name: '客户ID', type: 1 },
        { name: '客服ID', type: 1 },
        { name: '评分', type: 2 },
        { name: '评价内容', type: 1 },
        { name: '标签', type: 4 },
        { name: '创建时间', type: 5 }
      ],
      autoReplies: [
        { name: '规则ID', type: 1 },
        { name: '规则名称', type: 1 },
        { name: '是否启用', type: 7 },
        { name: '触发条件', type: 1 },
        { name: '回复内容', type: 1 },
        { name: '执行动作', type: 1 },
        { name: '创建时间', type: 5 },
        { name: '更新时间', type: 5 }
      ],
      assignmentRules: [
        { name: '规则ID', type: 1 },
        { name: '规则名称', type: 1 },
        { name: '描述', type: 1 },
        { name: '是否启用', type: 7 },
        { name: '优先级', type: 2 },
        { name: '条件配置', type: 1 },
        { name: '动作配置', type: 1 },
        { name: '创建时间', type: 5 },
        { name: '更新时间', type: 5 }
      ]
    };

    const fields = fieldConfigs[tableType] || [];
    for (const field of fields) {
      try {
        await table.addField(field);
      } catch (error) {
        console.warn(`Field ${field.name} might already exist:`, error);
      }
    }
  }

  // 加载配置
  private async loadConfiguration(): Promise<void> {
    const config = localStorage.getItem('chat_service_config');
    if (config) {
      const { appId, appSecret } = JSON.parse(config);
      this.appId = appId;
      this.appSecret = appSecret;
      await this.refreshAccessToken();
    }
  }

  // 刷新访问令牌
  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app_id: this.appId,
          app_secret: this.appSecret
        })
      });

      const data = await response.json();
      if (data.code === 0) {
        this.accessToken = data.tenant_access_token;
      }
    } catch (error) {
      console.error('Failed to refresh access token:', error);
    }
  }

  // 设置WebSocket连接
  private setupWebSocket(): void {
    // 这里应该连接到实际的WebSocket服务器
    // 目前使用模拟实现
    console.log('WebSocket connection setup (mock)');
  }

  // 对话管理方法
  async getChats(params?: ChatQueryParams): Promise<PaginatedResponse<ChatSession>> {
    try {
      const table = await bitable.base.getTable(this.tableIds.chats);
      const records = await table.getRecords();
      
      // 转换记录为对话会话对象
      const chats: ChatSession[] = records.map(record => this.recordToChatSession(record));
      
      // 应用过滤和排序
      let filteredChats = this.applyFilters(chats, params);
      
      // 分页
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 20;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      return {
        items: filteredChats.slice(startIndex, endIndex),
        total: filteredChats.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredChats.length / pageSize)
      };
    } catch (error) {
      console.error('Failed to get chats:', error);
      throw error;
    }
  }

  async getChatById(id: string): Promise<ChatSession> {
    try {
      const table = await bitable.base.getTable(this.tableIds.chats);
      const records = await table.getRecords();
      const record = records.find(r => r.fields['对话ID'] === id);
      
      if (!record) {
        throw new Error('Chat not found');
      }
      
      return this.recordToChatSession(record);
    } catch (error) {
      console.error('Failed to get chat by id:', error);
      throw error;
    }
  }

  async createChat(customerId: string, initialMessage?: string): Promise<ChatSession> {
    try {
      const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const chatData = {
        '对话ID': chatId,
        '客户ID': customerId,
        '状态': ChatStatus.WAITING,
        '优先级': ChatPriority.NORMAL,
        '开始时间': now,
        '最后消息时间': now,
        '最后消息': initialMessage || '',
        '消息数量': initialMessage ? 1 : 0,
        '未读数量': initialMessage ? 1 : 0,
        '标签': []
      };
      
      const table = await bitable.base.getTable(this.tableIds.chats);
      const record = await table.addRecord(chatData);
      
      // 如果有初始消息，创建消息记录
      if (initialMessage) {
        await this.sendMessage(chatId, {
          chatId,
          senderId: customerId,
          senderType: SenderType.CUSTOMER,
          senderName: '客户',
          messageType: MessageType.TEXT,
          content: initialMessage,
          isRead: false
        });
      }
      
      const chat = this.recordToChatSession(record);
      
      // 触发自动分配
      await this.autoAssignChat(chat);
      
      return chat;
    } catch (error) {
      console.error('Failed to create chat:', error);
      throw error;
    }
  }

  async updateChat(id: string, updates: Partial<ChatSession>): Promise<ChatSession> {
    try {
      const table = await bitable.base.getTable(this.tableIds.chats);
      const records = await table.getRecords();
      const record = records.find(r => r.fields['对话ID'] === id);
      
      if (!record) {
        throw new Error('Chat not found');
      }
      
      const updateData: any = {};
      if (updates.status) updateData['状态'] = updates.status;
      if (updates.agentId) updateData['客服ID'] = updates.agentId;
      if (updates.agentName) updateData['客服姓名'] = updates.agentName;
      if (updates.priority) updateData['优先级'] = updates.priority;
      if (updates.subject) updateData['主题'] = updates.subject;
      if (updates.tags) updateData['标签'] = updates.tags;
      if (updates.notes) updateData['备注'] = updates.notes;
      if (updates.endTime) updateData['结束时间'] = updates.endTime;
      
      await table.updateRecord(record.recordId, updateData);
      
      return await this.getChatById(id);
    } catch (error) {
      console.error('Failed to update chat:', error);
      throw error;
    }
  }

  async closeChat(id: string, reason?: string): Promise<void> {
    try {
      await this.updateChat(id, {
        status: ChatStatus.CLOSED,
        endTime: new Date().toISOString(),
        notes: reason
      });
      
      // 发送系统消息
      await this.sendMessage(id, {
        chatId: id,
        senderId: 'system',
        senderType: SenderType.BOT,
        senderName: '系统',
        messageType: MessageType.SYSTEM,
        content: `对话已关闭${reason ? `，原因：${reason}` : ''}`,
        isRead: false
      });
    } catch (error) {
      console.error('Failed to close chat:', error);
      throw error;
    }
  }

  async transferChat(id: string, agentId: string, reason?: string): Promise<void> {
    try {
      const agent = await this.getAgentById(agentId);
      
      await this.updateChat(id, {
        status: ChatStatus.TRANSFERRED,
        agentId: agentId,
        agentName: agent.name
      });
      
      // 发送系统消息
      await this.sendMessage(id, {
        chatId: id,
        senderId: 'system',
        senderType: SenderType.BOT,
        senderName: '系统',
        messageType: MessageType.SYSTEM,
        content: `对话已转接给客服 ${agent.name}${reason ? `，原因：${reason}` : ''}`,
        isRead: false
      });
      
      // 发送WebSocket通知
      this.emitWSMessage({
        type: WSMessageType.CHAT_TRANSFERRED,
        data: { chatId: id, agentId, reason },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to transfer chat:', error);
      throw error;
    }
  }

  async assignChat(id: string, agentId: string): Promise<void> {
    try {
      const agent = await this.getAgentById(agentId);
      
      await this.updateChat(id, {
        status: ChatStatus.ACTIVE,
        agentId: agentId,
        agentName: agent.name
      });
      
      // 发送WebSocket通知
      this.emitWSMessage({
        type: WSMessageType.CHAT_ASSIGNED,
        data: { chatId: id, agentId },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to assign chat:', error);
      throw error;
    }
  }

  // 消息管理方法
  async getMessages(params: MessageQueryParams): Promise<PaginatedResponse<ChatMessage>> {
    try {
      const table = await bitable.base.getTable(this.tableIds.messages);
      const records = await table.getRecords();
      
      // 过滤指定对话的消息
      const chatMessages = records
        .filter(record => record.fields['对话ID'] === params.chatId)
        .map(record => this.recordToChatMessage(record))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      // 分页
      const page = params.page || 1;
      const pageSize = params.pageSize || 50;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      return {
        items: chatMessages.slice(startIndex, endIndex),
        total: chatMessages.length,
        page,
        pageSize,
        totalPages: Math.ceil(chatMessages.length / pageSize)
      };
    } catch (error) {
      console.error('Failed to get messages:', error);
      throw error;
    }
  }

  async sendMessage(chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    try {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();
      
      const messageData = {
        '消息ID': messageId,
        '对话ID': chatId,
        '发送者ID': message.senderId,
        '发送者类型': message.senderType,
        '发送者姓名': message.senderName,
        '消息类型': message.messageType,
        '消息内容': message.content,
        '时间戳': timestamp,
        '是否已读': message.isRead,
        '附件': message.attachments ? JSON.stringify(message.attachments) : ''
      };
      
      const table = await bitable.base.getTable(this.tableIds.messages);
      const record = await table.addRecord(messageData);
      
      // 更新对话的最后消息信息
      await this.updateChat(chatId, {
        lastMessageTime: timestamp,
        lastMessage: message.content.substring(0, 100)
      });
      
      const chatMessage: ChatMessage = {
        id: messageId,
        timestamp,
        ...message
      };
      
      // 发送WebSocket通知
      this.emitWSMessage({
        type: WSMessageType.CHAT_MESSAGE,
        data: chatMessage,
        timestamp
      });
      
      // 检查自动回复
      if (message.senderType === SenderType.CUSTOMER) {
        await this.processAutoReply(chatId, message.content);
      }
      
      return chatMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async markAsRead(chatId: string, messageIds: string[]): Promise<void> {
    try {
      const table = await bitable.base.getTable(this.tableIds.messages);
      const records = await table.getRecords();
      
      for (const messageId of messageIds) {
        const record = records.find(r => r.fields['消息ID'] === messageId);
        if (record) {
          await table.updateRecord(record.recordId, { '是否已读': true });
        }
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      throw error;
    }
  }

  // 客服管理方法
  async getAgents(): Promise<ChatAgent[]> {
    try {
      const table = await bitable.base.getTable(this.tableIds.agents);
      const records = await table.getRecords();
      
      return records.map(record => this.recordToChatAgent(record));
    } catch (error) {
      console.error('Failed to get agents:', error);
      return [];
    }
  }

  async getAgentById(id: string): Promise<ChatAgent> {
    try {
      const agents = await this.getAgents();
      const agent = agents.find(a => a.id === id);
      
      if (!agent) {
        throw new Error('Agent not found');
      }
      
      return agent;
    } catch (error) {
      console.error('Failed to get agent by id:', error);
      throw error;
    }
  }

  async updateAgentStatus(id: string, status: AgentStatus): Promise<void> {
    try {
      const table = await bitable.base.getTable(this.tableIds.agents);
      const records = await table.getRecords();
      const record = records.find(r => r.fields['客服ID'] === id);
      
      if (record) {
        await table.updateRecord(record.recordId, {
          '状态': status,
          '最后活跃时间': new Date().toISOString()
        });
        
        // 发送WebSocket通知
        this.emitWSMessage({
          type: WSMessageType.AGENT_STATUS_CHANGE,
          data: { agentId: id, status },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to update agent status:', error);
      throw error;
    }
  }

  async getAgentWorkload(id: string, startDate: string, endDate: string): Promise<AgentWorkload> {
    // 这里应该实现实际的工作量统计逻辑
    // 目前返回模拟数据
    const agent = await this.getAgentById(id);
    
    return {
      agentId: id,
      agentName: agent.name,
      totalChats: agent.totalChats,
      activeChats: agent.currentChatCount,
      averageResponseTime: agent.averageResponseTime,
      customerSatisfaction: agent.satisfactionRating,
      workingHours: 8,
      efficiency: 85
    };
  }

  // 快捷回复管理
  async getQuickReplies(category?: string): Promise<QuickReply[]> {
    try {
      const table = await bitable.base.getTable(this.tableIds.quickReplies);
      const records = await table.getRecords();
      
      let replies = records.map(record => this.recordToQuickReply(record));
      
      if (category) {
        replies = replies.filter(reply => reply.category === category);
      }
      
      return replies.filter(reply => reply.isActive);
    } catch (error) {
      console.error('Failed to get quick replies:', error);
      return [];
    }
  }

  async createQuickReply(reply: Omit<QuickReply, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuickReply> {
    try {
      const replyId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const replyData = {
        '回复ID': replyId,
        '标题': reply.title,
        '内容': reply.content,
        '分类': reply.category,
        '标签': reply.tags,
        '使用次数': reply.usageCount,
        '是否启用': reply.isActive,
        '创建时间': now,
        '更新时间': now
      };
      
      const table = await bitable.base.getTable(this.tableIds.quickReplies);
      await table.addRecord(replyData);
      
      return {
        id: replyId,
        createdAt: now,
        updatedAt: now,
        ...reply
      };
    } catch (error) {
      console.error('Failed to create quick reply:', error);
      throw error;
    }
  }

  async updateQuickReply(id: string, updates: Partial<QuickReply>): Promise<QuickReply> {
    try {
      const table = await bitable.base.getTable(this.tableIds.quickReplies);
      const records = await table.getRecords();
      const record = records.find(r => r.fields['回复ID'] === id);
      
      if (!record) {
        throw new Error('Quick reply not found');
      }
      
      const updateData: any = { '更新时间': new Date().toISOString() };
      if (updates.title) updateData['标题'] = updates.title;
      if (updates.content) updateData['内容'] = updates.content;
      if (updates.category) updateData['分类'] = updates.category;
      if (updates.tags) updateData['标签'] = updates.tags;
      if (updates.isActive !== undefined) updateData['是否启用'] = updates.isActive;
      
      await table.updateRecord(record.recordId, updateData);
      
      const updatedRecord = await table.getRecord(record.recordId);
      return this.recordToQuickReply(updatedRecord);
    } catch (error) {
      console.error('Failed to update quick reply:', error);
      throw error;
    }
  }

  async deleteQuickReply(id: string): Promise<void> {
    try {
      const table = await bitable.base.getTable(this.tableIds.quickReplies);
      const records = await table.getRecords();
      const record = records.find(r => r.fields['回复ID'] === id);
      
      if (record) {
        await table.deleteRecord(record.recordId);
      }
    } catch (error) {
      console.error('Failed to delete quick reply:', error);
      throw error;
    }
  }

  // 知识库管理
  async searchKnowledge(keyword: string, category?: string): Promise<KnowledgeItem[]> {
    try {
      const table = await bitable.base.getTable(this.tableIds.knowledge);
      const records = await table.getRecords();
      
      let items = records.map(record => this.recordToKnowledgeItem(record));
      
      // 关键词搜索
      if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        items = items.filter(item => 
          item.title.toLowerCase().includes(lowerKeyword) ||
          item.content.toLowerCase().includes(lowerKeyword) ||
          item.keywords.some(k => k.toLowerCase().includes(lowerKeyword))
        );
      }
      
      // 分类过滤
      if (category) {
        items = items.filter(item => item.category === category);
      }
      
      return items.filter(item => item.isPublic);
    } catch (error) {
      console.error('Failed to search knowledge:', error);
      return [];
    }
  }

  async getKnowledgeItem(id: string): Promise<KnowledgeItem> {
    try {
      const table = await bitable.base.getTable(this.tableIds.knowledge);
      const records = await table.getRecords();
      const record = records.find(r => r.fields['知识ID'] === id);
      
      if (!record) {
        throw new Error('Knowledge item not found');
      }
      
      // 增加查看次数
      const viewCount = (record.fields['查看次数'] as number) || 0;
      await table.updateRecord(record.recordId, { '查看次数': viewCount + 1 });
      
      return this.recordToKnowledgeItem(record);
    } catch (error) {
      console.error('Failed to get knowledge item:', error);
      throw error;
    }
  }

  async createKnowledgeItem(item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeItem> {
    try {
      const itemId = `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const itemData = {
        '知识ID': itemId,
        '标题': item.title,
        '内容': item.content,
        '分类': item.category,
        '标签': item.tags,
        '关键词': item.keywords,
        '查看次数': item.viewCount,
        '使用次数': item.useCount,
        '是否公开': item.isPublic,
        '创建者': item.createdBy,
        '创建时间': now,
        '更新时间': now
      };
      
      const table = await bitable.base.getTable(this.tableIds.knowledge);
      await table.addRecord(itemData);
      
      return {
        id: itemId,
        createdAt: now,
        updatedAt: now,
        ...item
      };
    } catch (error) {
      console.error('Failed to create knowledge item:', error);
      throw error;
    }
  }

  async updateKnowledgeItem(id: string, updates: Partial<KnowledgeItem>): Promise<KnowledgeItem> {
    try {
      const table = await bitable.base.getTable(this.tableIds.knowledge);
      const records = await table.getRecords();
      const record = records.find(r => r.fields['知识ID'] === id);
      
      if (!record) {
        throw new Error('Knowledge item not found');
      }
      
      const updateData: any = { '更新时间': new Date().toISOString() };
      if (updates.title) updateData['标题'] = updates.title;
      if (updates.content) updateData['内容'] = updates.content;
      if (updates.category) updateData['分类'] = updates.category;
      if (updates.tags) updateData['标签'] = updates.tags;
      if (updates.keywords) updateData['关键词'] = updates.keywords;
      if (updates.isPublic !== undefined) updateData['是否公开'] = updates.isPublic;
      
      await table.updateRecord(record.recordId, updateData);
      
      const updatedRecord = await table.getRecord(record.recordId);
      return this.recordToKnowledgeItem(updatedRecord);
    } catch (error) {
      console.error('Failed to update knowledge item:', error);
      throw error;
    }
  }

  async deleteKnowledgeItem(id: string): Promise<void> {
    try {
      const table = await bitable.base.getTable(this.tableIds.knowledge);
      const records = await table.getRecords();
      const record = records.find(r => r.fields['知识ID'] === id);
      
      if (record) {
        await table.deleteRecord(record.recordId);
      }
    } catch (error) {
      console.error('Failed to delete knowledge item:', error);
      throw error;
    }
  }

  // 统计分析
  async getChatStats(startDate: string, endDate: string): Promise<ChatStats> {
    try {
      const chats = await this.getChats();
      const filteredChats = chats.items.filter(chat => {
        const chatDate = new Date(chat.startTime);
        return chatDate >= new Date(startDate) && chatDate <= new Date(endDate);
      });
      
      const totalChats = filteredChats.length;
      const activeChats = filteredChats.filter(chat => chat.status === ChatStatus.ACTIVE).length;
      const waitingChats = filteredChats.filter(chat => chat.status === ChatStatus.WAITING).length;
      const closedChats = filteredChats.filter(chat => chat.status === ChatStatus.CLOSED).length;
      
      // 计算平均时间（模拟数据）
      const averageWaitTime = 120; // 2分钟
      const averageResponseTime = 30; // 30秒
      const averageResolutionTime = 600; // 10分钟
      
      // 计算满意度
      const ratedChats = filteredChats.filter(chat => chat.satisfaction);
      const customerSatisfaction = ratedChats.length > 0 
        ? ratedChats.reduce((sum, chat) => sum + (chat.satisfaction || 0), 0) / ratedChats.length
        : 0;
      
      // 计算机器人解决率和转人工率（模拟数据）
      const botResolutionRate = 0.65; // 65%
      const transferRate = 0.25; // 25%
      
      return {
        totalChats,
        activeChats,
        waitingChats,
        closedChats,
        averageWaitTime,
        averageResponseTime,
        averageResolutionTime,
        customerSatisfaction,
        botResolutionRate,
        transferRate
      };
    } catch (error) {
      console.error('Failed to get chat stats:', error);
      throw error;
    }
  }

  async getAgentStats(startDate: string, endDate: string): Promise<AgentWorkload[]> {
    try {
      const agents = await this.getAgents();
      
      return agents.map(agent => ({
        agentId: agent.id,
        agentName: agent.name,
        totalChats: agent.totalChats,
        activeChats: agent.currentChatCount,
        averageResponseTime: agent.averageResponseTime,
        customerSatisfaction: agent.satisfactionRating,
        workingHours: 8,
        efficiency: Math.floor(Math.random() * 20) + 80 // 80-100%
      }));
    } catch (error) {
      console.error('Failed to get agent stats:', error);
      return [];
    }
  }

  // 分配规则管理
  async getAssignmentRules(): Promise<ChatAssignmentRule[]> {
    try {
      const table = await bitable.base.getTable(this.tableIds.assignmentRules);
      const records = await table.getRecords();
      
      return records.map(record => this.recordToAssignmentRule(record));
    } catch (error) {
      console.error('Failed to get assignment rules:', error);
      return [];
    }
  }

  async createAssignmentRule(rule: Omit<ChatAssignmentRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChatAssignmentRule> {
    try {
      const ruleId = `ar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const ruleData = {
        '规则ID': ruleId,
        '规则名称': rule.name,
        '描述': rule.description,
        '是否启用': rule.isActive,
        '优先级': rule.priority,
        '条件配置': JSON.stringify(rule.conditions),
        '动作配置': JSON.stringify(rule.actions),
        '创建时间': now,
        '更新时间': now
      };
      
      const table = await bitable.base.getTable(this.tableIds.assignmentRules);
      await table.addRecord(ruleData);
      
      return {
        id: ruleId,
        createdAt: now,
        updatedAt: now,
        ...rule
      };
    } catch (error) {
      console.error('Failed to create assignment rule:', error);
      throw error;
    }
  }

  async updateAssignmentRule(id: string, updates: Partial<ChatAssignmentRule>): Promise<ChatAssignmentRule> {
    try {
      const table = await bitable.base.getTable(this.tableIds.assignmentRules);
      const records = await table.getRecords();
      const record = records.find(r => r.fields['规则ID'] === id);
      
      if (!record) {
        throw new Error('Assignment rule not found');
      }
      
      const updateData: any = { '更新时间': new Date().toISOString() };
      if (updates.name) updateData['规则名称'] = updates.name;
      if (updates.description) updateData['描述'] = updates.description;
      if (updates.isActive !== undefined) updateData['是否启用'] = updates.isActive;
      if (updates.priority) updateData['优先级'] = updates.priority;
      if (updates.conditions) updateData['条件配置'] = JSON.stringify(updates.conditions);
      if (updates.actions) updateData['动作配置'] = JSON.stringify(updates.actions);
      
      await table.updateRecord(record.recordId, updateData);
      
      const updatedRecord = await table.getRecord(record.recordId);
      return this.recordToAssignmentRule(updatedRecord);
    } catch (error) {
      console.error('Failed to update assignment rule:', error);
      throw error;
    }
  }

  async deleteAssignmentRule(id: string): Promise<void> {
    try {
      const table = await bitable.base.getTable(this.tableIds.assignmentRules);
      const records = await table.getRecords();
      const record = records.find(r => r.fields['规则ID'] === id);
      
      if (record) {
        await table.deleteRecord(record.recordId);
      }
    } catch (error) {
      console.error('Failed to delete assignment rule:', error);
      throw error;
    }
  }

  // 辅助方法
  private recordToChatSession(record: any): ChatSession {
    return {
      id: record.fields['对话ID'] || '',
      customerId: record.fields['客户ID'] || '',
      customerName: record.fields['客户姓名'] || '',
      agentId: record.fields['客服ID'],
      agentName: record.fields['客服姓名'],
      status: record.fields['状态'] || ChatStatus.WAITING,
      priority: record.fields['优先级'] || ChatPriority.NORMAL,
      subject: record.fields['主题'],
      tags: record.fields['标签'] || [],
      startTime: record.fields['开始时间'] || new Date().toISOString(),
      endTime: record.fields['结束时间'],
      lastMessageTime: record.fields['最后消息时间'] || new Date().toISOString(),
      lastMessage: record.fields['最后消息'],
      messageCount: record.fields['消息数量'] || 0,
      unreadCount: record.fields['未读数量'] || 0,
      satisfaction: record.fields['满意度'],
      notes: record.fields['备注']
    };
  }

  private recordToChatMessage(record: any): ChatMessage {
    return {
      id: record.fields['消息ID'] || '',
      chatId: record.fields['对话ID'] || '',
      senderId: record.fields['发送者ID'] || '',
      senderType: record.fields['发送者类型'] || SenderType.CUSTOMER,
      senderName: record.fields['发送者姓名'] || '',
      messageType: record.fields['消息类型'] || MessageType.TEXT,
      content: record.fields['消息内容'] || '',
      timestamp: record.fields['时间戳'] || new Date().toISOString(),
      isRead: record.fields['是否已读'] || false,
      attachments: record.fields['附件'] ? JSON.parse(record.fields['附件']) : undefined
    };
  }

  private recordToChatAgent(record: any): ChatAgent {
    return {
      id: record.fields['客服ID'] || '',
      name: record.fields['姓名'] || '',
      email: record.fields['邮箱'] || '',
      phone: record.fields['电话'],
      status: record.fields['状态'] || AgentStatus.OFFLINE,
      department: record.fields['部门'] || '',
      skills: record.fields['技能标签'] || [],
      maxConcurrentChats: record.fields['最大并发对话'] || 5,
      currentChatCount: record.fields['当前对话数'] || 0,
      totalChats: record.fields['总对话数'] || 0,
      averageResponseTime: record.fields['平均响应时间'] || 0,
      satisfactionRating: record.fields['满意度评分'] || 0,
      lastActiveTime: record.fields['最后活跃时间'] || new Date().toISOString(),
      workingHours: {
        monday: { start: '09:00', end: '18:00', enabled: true },
        tuesday: { start: '09:00', end: '18:00', enabled: true },
        wednesday: { start: '09:00', end: '18:00', enabled: true },
        thursday: { start: '09:00', end: '18:00', enabled: true },
        friday: { start: '09:00', end: '18:00', enabled: true },
        saturday: { start: '09:00', end: '18:00', enabled: false },
        sunday: { start: '09:00', end: '18:00', enabled: false }
      }
    };
  }

  private recordToQuickReply(record: any): QuickReply {
    return {
      id: record.fields['回复ID'] || '',
      title: record.fields['标题'] || '',
      content: record.fields['内容'] || '',
      category: record.fields['分类'] || '',
      tags: record.fields['标签'] || [],
      usageCount: record.fields['使用次数'] || 0,
      isActive: record.fields['是否启用'] || true,
      createdAt: record.fields['创建时间'] || new Date().toISOString(),
      updatedAt: record.fields['更新时间'] || new Date().toISOString()
    };
  }

  private recordToKnowledgeItem(record: any): KnowledgeItem {
    return {
      id: record.fields['知识ID'] || '',
      title: record.fields['标题'] || '',
      content: record.fields['内容'] || '',
      category: record.fields['分类'] || '',
      tags: record.fields['标签'] || [],
      keywords: record.fields['关键词'] || [],
      viewCount: record.fields['查看次数'] || 0,
      useCount: record.fields['使用次数'] || 0,
      isPublic: record.fields['是否公开'] || true,
      createdBy: record.fields['创建者'] || '',
      createdAt: record.fields['创建时间'] || new Date().toISOString(),
      updatedAt: record.fields['更新时间'] || new Date().toISOString()
    };
  }

  private recordToAssignmentRule(record: any): ChatAssignmentRule {
    return {
      id: record.fields['规则ID'] || '',
      name: record.fields['规则名称'] || '',
      description: record.fields['描述'] || '',
      isActive: record.fields['是否启用'] || true,
      priority: record.fields['优先级'] || 0,
      conditions: record.fields['条件配置'] ? JSON.parse(record.fields['条件配置']) : [],
      actions: record.fields['动作配置'] ? JSON.parse(record.fields['动作配置']) : [],
      createdAt: record.fields['创建时间'] || new Date().toISOString(),
      updatedAt: record.fields['更新时间'] || new Date().toISOString()
    };
  }

  private applyFilters(chats: ChatSession[], params?: ChatQueryParams): ChatSession[] {
    if (!params) return chats;
    
    let filtered = chats;
    
    if (params.status && params.status.length > 0) {
      filtered = filtered.filter(chat => params.status!.includes(chat.status));
    }
    
    if (params.agentId) {
      filtered = filtered.filter(chat => chat.agentId === params.agentId);
    }
    
    if (params.customerId) {
      filtered = filtered.filter(chat => chat.customerId === params.customerId);
    }
    
    if (params.priority && params.priority.length > 0) {
      filtered = filtered.filter(chat => params.priority!.includes(chat.priority));
    }
    
    if (params.startDate) {
      filtered = filtered.filter(chat => new Date(chat.startTime) >= new Date(params.startDate!));
    }
    
    if (params.endDate) {
      filtered = filtered.filter(chat => new Date(chat.startTime) <= new Date(params.endDate!));
    }
    
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filtered = filtered.filter(chat => 
        chat.customerName.toLowerCase().includes(keyword) ||
        (chat.subject && chat.subject.toLowerCase().includes(keyword)) ||
        (chat.lastMessage && chat.lastMessage.toLowerCase().includes(keyword))
      );
    }
    
    if (params.tags && params.tags.length > 0) {
      filtered = filtered.filter(chat => 
        params.tags!.some(tag => chat.tags.includes(tag))
      );
    }
    
    // 排序
    if (params.sortBy) {
      filtered.sort((a, b) => {
        const aValue = (a as any)[params.sortBy!];
        const bValue = (b as any)[params.sortBy!];
        
        if (params.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    }
    
    return filtered;
  }

  private async autoAssignChat(chat: ChatSession): Promise<void> {
    try {
      const rules = await this.getAssignmentRules();
      const activeRules = rules.filter(rule => rule.isActive)
        .sort((a, b) => b.priority - a.priority);
      
      for (const rule of activeRules) {
        if (this.matchesConditions(chat, rule.conditions)) {
          await this.executeActions(chat, rule.actions);
          break;
        }
      }
    } catch (error) {
      console.error('Failed to auto assign chat:', error);
    }
  }

  private matchesConditions(chat: ChatSession, conditions: any[]): boolean {
    // 这里应该实现条件匹配逻辑
    // 目前返回简单的模拟逻辑
    return conditions.length === 0 || Math.random() > 0.5;
  }

  private async executeActions(chat: ChatSession, actions: any[]): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'assign_to_agent':
            await this.assignChat(chat.id, action.value);
            break;
          case 'set_priority':
            await this.updateChat(chat.id, { priority: action.value });
            break;
          case 'add_tag':
            const newTags = [...chat.tags, action.value];
            await this.updateChat(chat.id, { tags: newTags });
            break;
        }
      } catch (error) {
        console.error('Failed to execute action:', error);
      }
    }
  }

  private async processAutoReply(chatId: string, message: string): Promise<void> {
    try {
      const autoReplies = await this.getAutoReplies();
      const activeReplies = autoReplies.filter(reply => reply.isActive);
      
      for (const reply of activeReplies) {
        if (this.matchesAutoReplyConditions(message, reply)) {
          // 延迟回复
          setTimeout(async () => {
            await this.sendMessage(chatId, {
              chatId,
              senderId: 'bot',
              senderType: SenderType.BOT,
              senderName: '智能客服',
              messageType: reply.replyContent.type,
              content: reply.replyContent.content,
              isRead: false
            });
            
            // 执行其他动作
            if (reply.actions.transferToAgent) {
              // 查找可用客服
              const agents = await this.getAgents();
              const availableAgent = agents.find(agent => 
                agent.status === AgentStatus.ONLINE && 
                agent.currentChatCount < agent.maxConcurrentChats
              );
              
              if (availableAgent) {
                await this.transferChat(chatId, availableAgent.id, '自动转人工');
              }
            }
            
            if (reply.actions.setPriority) {
              await this.updateChat(chatId, { priority: reply.actions.setPriority });
            }
            
            if (reply.actions.addTags && reply.actions.addTags.length > 0) {
              const chat = await this.getChatById(chatId);
              const newTags = [...chat.tags, ...reply.actions.addTags];
              await this.updateChat(chatId, { tags: newTags });
            }
            
            if (reply.actions.closeChat) {
              await this.closeChat(chatId, '自动关闭');
            }
          }, reply.replyContent.delay || 1000);
          
          break; // 只执行第一个匹配的规则
        }
      }
    } catch (error) {
      console.error('Failed to process auto reply:', error);
    }
  }

  private matchesAutoReplyConditions(message: string, reply: AutoReplyConfig): boolean {
    const lowerMessage = message.toLowerCase();
    
    // 检查关键词
    if (reply.triggerConditions.keywords.length > 0) {
      const hasKeyword = reply.triggerConditions.keywords.some(keyword => 
        lowerMessage.includes(keyword.toLowerCase())
      );
      if (!hasKeyword) return false;
    }
    
    // 检查时间范围
    if (reply.triggerConditions.timeRange) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = this.timeToMinutes(reply.triggerConditions.timeRange.start);
      const endTime = this.timeToMinutes(reply.triggerConditions.timeRange.end);
      
      if (currentTime < startTime || currentTime > endTime) {
        return false;
      }
    }
    
    return true;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private async getAutoReplies(): Promise<AutoReplyConfig[]> {
    try {
      const table = await bitable.base.getTable(this.tableIds.autoReplies);
      const records = await table.getRecords();
      
      return records.map(record => ({
        id: record.fields['规则ID'] || '',
        name: record.fields['规则名称'] || '',
        isActive: record.fields['是否启用'] || true,
        triggerConditions: record.fields['触发条件'] ? JSON.parse(record.fields['触发条件']) : { keywords: [] },
        replyContent: record.fields['回复内容'] ? JSON.parse(record.fields['回复内容']) : { type: MessageType.TEXT, content: '' },
        actions: record.fields['执行动作'] ? JSON.parse(record.fields['执行动作']) : {},
        createdAt: record.fields['创建时间'] || new Date().toISOString(),
        updatedAt: record.fields['更新时间'] || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to get auto replies:', error);
      return [];
    }
  }

  // WebSocket相关方法
  private emitWSMessage(message: WSMessage): void {
    // 触发事件处理器
    const handlers = this.eventHandlers.get(message.type) || [];
    handlers.forEach(handler => {
      try {
        handler(message.data);
      } catch (error) {
        console.error('Error in WebSocket event handler:', error);
      }
    });
  }

  // 公共方法：事件监听
  on(eventType: WSMessageType, handler: Function): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  off(eventType: WSMessageType, handler: Function): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // 打字状态管理
  startTyping(chatId: string, userId: string, userName: string): void {
    // 清除之前的超时
    const key = `${chatId}_${userId}`;
    const existingTimeout = this.typingTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // 发送开始打字事件
    this.emitWSMessage({
      type: WSMessageType.TYPING_START,
      data: { chatId, userId, userName, isTyping: true },
      timestamp: new Date().toISOString()
    });
    
    // 设置自动停止打字的超时
    const timeout = setTimeout(() => {
      this.stopTyping(chatId, userId, userName);
    }, 3000); // 3秒后自动停止
    
    this.typingTimeouts.set(key, timeout);
  }

  stopTyping(chatId: string, userId: string, userName: string): void {
    const key = `${chatId}_${userId}`;
    const existingTimeout = this.typingTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.typingTimeouts.delete(key);
    }
    
    // 发送停止打字事件
    this.emitWSMessage({
      type: WSMessageType.TYPING_END,
      data: { chatId, userId, userName, isTyping: false },
      timestamp: new Date().toISOString()
    });
  }

  // 配置管理
  async saveConfiguration(config: { appId: string; appSecret: string }): Promise<void> {
    this.appId = config.appId;
    this.appSecret = config.appSecret;
    localStorage.setItem('chat_service_config', JSON.stringify(config));
    await this.refreshAccessToken();
  }

  getConfiguration(): { appId: string; appSecret: string } {
    return {
      appId: this.appId,
      appSecret: this.appSecret
    };
  }

  // 测试连接
  async testConnection(): Promise<boolean> {
    try {
      await this.refreshAccessToken();
      return !!this.accessToken;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // 清理资源
  destroy(): void {
    // 清理所有打字超时
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
    
    // 清理事件处理器
    this.eventHandlers.clear();
    
    // 关闭WebSocket连接
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }
}

// 导出单例实例
export const chatService = new ChatService();
export default chatService;