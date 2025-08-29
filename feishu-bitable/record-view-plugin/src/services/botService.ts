// 飞书机器人服务实现
import { bitable } from '@lark-opdev/block-bitable-api';
import {
  BotService,
  BotConfig,
  EventHandler,
  MessageReceiveEvent,
  ChatCreatedEvent,
  ChatMemberEvent,
  SendMessageRequest,
  SendMessageResponse,
  BatchSendMessageRequest,
  MessageCard,
  MessageType,
  EventType,
  AutoReplyRule,
  Message,
  ApiResponse,
  SenderType,
  ChatType
} from '../types/bot';

class FeishuBotService implements BotService {
  private config: BotConfig | null = null;
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;
  private eventHandler: EventHandler | null = null;
  private autoReplyRules: AutoReplyRule[] = [];
  
  // 飞书API基础URL
  private readonly baseUrl = 'https://open.feishu.cn/open-apis';

  /**
   * 初始化机器人服务
   */
  async initialize(config: BotConfig): Promise<void> {
    this.config = config;
    await this.refreshAccessToken();
    await this.loadAutoReplyRules();
  }

  /**
   * 获取访问令牌
   */
  async getAccessToken(): Promise<string> {
    if (!this.accessToken || Date.now() >= this.tokenExpireTime) {
      await this.refreshAccessToken();
    }
    return this.accessToken!;
  }

  /**
   * 刷新访问令牌
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.config) {
      throw new Error('机器人配置未初始化');
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/v3/tenant_access_token/internal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app_id: this.config.app_id,
          app_secret: this.config.app_secret
        })
      });

      const data: ApiResponse<{
        tenant_access_token: string;
        expire: number;
      }> = await response.json();

      if (data.code === 0 && data.data) {
        this.accessToken = data.data.tenant_access_token;
        this.tokenExpireTime = Date.now() + (data.data.expire - 60) * 1000; // 提前60秒刷新
      } else {
        throw new Error(`获取访问令牌失败: ${data.msg}`);
      }
    } catch (error) {
      console.error('刷新访问令牌失败:', error);
      throw error;
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(chatId: string, msgType: MessageType, content: string): Promise<SendMessageResponse> {
    const token = await this.getAccessToken();
    
    const request: SendMessageRequest = {
      receive_id: chatId,
      msg_type: msgType,
      content: content,
      uuid: this.generateUUID()
    };

    try {
      const response = await fetch(`${this.baseUrl}/im/v1/messages?receive_id_type=chat_id`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      const data: SendMessageResponse = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`发送消息失败: ${data.msg}`);
      }

      return data;
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  }

  /**
   * 批量发送消息
   */
  async batchSendMessage(request: BatchSendMessageRequest): Promise<any> {
    const token = await this.getAccessToken();

    try {
      const response = await fetch(`${this.baseUrl}/im/v1/batch_messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`批量发送消息失败: ${data.msg}`);
      }

      return data;
    } catch (error) {
      console.error('批量发送消息失败:', error);
      throw error;
    }
  }

  /**
   * 发送卡片消息
   */
  async sendCardMessage(chatId: string, card: MessageCard): Promise<SendMessageResponse> {
    const content = JSON.stringify(card);
    return this.sendMessage(chatId, MessageType.INTERACTIVE, content);
  }

  /**
   * 回复消息
   */
  async replyMessage(messageId: string, msgType: MessageType, content: string): Promise<SendMessageResponse> {
    const token = await this.getAccessToken();
    
    const request = {
      msg_type: msgType,
      content: content,
      uuid: this.generateUUID()
    };

    try {
      const response = await fetch(`${this.baseUrl}/im/v1/messages/${messageId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      const data: SendMessageResponse = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`回复消息失败: ${data.msg}`);
      }

      return data;
    } catch (error) {
      console.error('回复消息失败:', error);
      throw error;
    }
  }

  /**
   * 获取消息历史
   */
  async getMessageHistory(chatId: string, pageToken?: string, pageSize: number = 20): Promise<any> {
    const token = await this.getAccessToken();
    
    const params = new URLSearchParams({
      container_id_type: 'chat_id',
      container_id: chatId,
      page_size: pageSize.toString()
    });
    
    if (pageToken) {
      params.append('page_token', pageToken);
    }

    try {
      const response = await fetch(`${this.baseUrl}/im/v1/messages?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`获取消息历史失败: ${data.msg}`);
      }

      return data;
    } catch (error) {
      console.error('获取消息历史失败:', error);
      throw error;
    }
  }

  /**
   * 获取群聊信息
   */
  async getChatInfo(chatId: string): Promise<any> {
    const token = await this.getAccessToken();

    try {
      const response = await fetch(`${this.baseUrl}/im/v1/chats/${chatId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`获取群聊信息失败: ${data.msg}`);
      }

      return data;
    } catch (error) {
      console.error('获取群聊信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取群聊成员列表
   */
  async getChatMembers(chatId: string): Promise<any> {
    const token = await this.getAccessToken();

    try {
      const response = await fetch(`${this.baseUrl}/im/v1/chats/${chatId}/members`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`获取群聊成员失败: ${data.msg}`);
      }

      return data;
    } catch (error) {
      console.error('获取群聊成员失败:', error);
      throw error;
    }
  }

  /**
   * 处理事件
   */
  async handleEvent(eventData: any): Promise<void> {
    try {
      // 验证事件
      if (!this.verifyEvent(eventData)) {
        console.warn('事件验证失败');
        return;
      }

      const eventType = eventData.header?.event_type;
      
      switch (eventType) {
        case EventType.MESSAGE_RECEIVED:
          await this.handleMessageReceive(eventData as MessageReceiveEvent);
          break;
        case EventType.CHAT_CREATED:
          await this.handleChatCreated(eventData as ChatCreatedEvent);
          break;
        case EventType.CHAT_MEMBER_USER_ADDED:
          await this.handleChatMemberAdded(eventData as ChatMemberEvent);
          break;
        case EventType.CHAT_MEMBER_USER_DELETED:
        case EventType.CHAT_MEMBER_USER_WITHDRAWN:
          await this.handleChatMemberRemoved(eventData as ChatMemberEvent);
          break;
        default:
          console.log(`未处理的事件类型: ${eventType}`);
      }
    } catch (error) {
      console.error('处理事件失败:', error);
    }
  }

  /**
   * 验证事件
   */
  private verifyEvent(eventData: any): boolean {
    if (!this.config) return false;
    
    // 验证token
    const token = eventData.header?.token;
    if (token !== this.config.verification_token) {
      return false;
    }

    // TODO: 如果配置了加密密钥，需要解密验证
    
    return true;
  }

  /**
   * 处理消息接收事件
   */
  private async handleMessageReceive(event: MessageReceiveEvent): Promise<void> {
    const message = event.event.message;
    
    // 忽略机器人自己发送的消息
    if (message.sender.sender_type === SenderType.APP) {
      return;
    }

    // 处理自动回复
    await this.processAutoReply(message);

    // 调用外部事件处理器
    if (this.eventHandler?.handleMessageReceive) {
      await this.eventHandler.handleMessageReceive(event);
    }
  }

  /**
   * 处理群聊创建事件
   */
  private async handleChatCreated(event: ChatCreatedEvent): Promise<void> {
    if (this.eventHandler?.handleChatCreated) {
      await this.eventHandler.handleChatCreated(event);
    }
  }

  /**
   * 处理群聊成员添加事件
   */
  private async handleChatMemberAdded(event: ChatMemberEvent): Promise<void> {
    if (this.eventHandler?.handleChatMemberAdded) {
      await this.eventHandler.handleChatMemberAdded(event);
    }
  }

  /**
   * 处理群聊成员移除事件
   */
  private async handleChatMemberRemoved(event: ChatMemberEvent): Promise<void> {
    if (this.eventHandler?.handleChatMemberRemoved) {
      await this.eventHandler.handleChatMemberRemoved(event);
    }
  }

  /**
   * 注册事件处理器
   */
  registerEventHandler(handler: EventHandler): void {
    this.eventHandler = handler;
  }

  /**
   * 获取自动回复规则
   */
  async getAutoReplyRules(): Promise<AutoReplyRule[]> {
    return this.autoReplyRules;
  }

  /**
   * 创建自动回复规则
   */
  async createAutoReplyRule(rule: Omit<AutoReplyRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AutoReplyRule> {
    const newRule: AutoReplyRule = {
      ...rule,
      id: this.generateUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.autoReplyRules.push(newRule);
    await this.saveAutoReplyRules();
    
    return newRule;
  }

  /**
   * 更新自动回复规则
   */
  async updateAutoReplyRule(id: string, rule: Partial<AutoReplyRule>): Promise<AutoReplyRule> {
    const index = this.autoReplyRules.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('规则不存在');
    }

    const updatedRule = {
      ...this.autoReplyRules[index],
      ...rule,
      updatedAt: new Date().toISOString()
    };

    this.autoReplyRules[index] = updatedRule;
    await this.saveAutoReplyRules();
    
    return updatedRule;
  }

  /**
   * 删除自动回复规则
   */
  async deleteAutoReplyRule(id: string): Promise<void> {
    const index = this.autoReplyRules.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('规则不存在');
    }

    this.autoReplyRules.splice(index, 1);
    await this.saveAutoReplyRules();
  }

  /**
   * 处理自动回复
   */
  async processAutoReply(message: Message): Promise<void> {
    // 按优先级排序规则
    const sortedRules = this.autoReplyRules
      .filter(rule => rule.isActive)
      .sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      if (await this.matchRule(rule, message)) {
        await this.executeReplyAction(rule, message);
        break; // 只执行第一个匹配的规则
      }
    }
  }

  /**
   * 匹配规则
   */
  private async matchRule(rule: AutoReplyRule, message: Message): Promise<boolean> {
    const conditions = rule.conditions;

    // 检查消息类型
    if (conditions.messageType && !conditions.messageType.includes(message.message_type)) {
      return false;
    }

    // 检查聊天类型
    if (conditions.chatType && !conditions.chatType.includes(message.chat_type)) {
      return false;
    }

    // 检查发送者类型
    if (conditions.senderType && !conditions.senderType.includes(message.sender.sender_type)) {
      return false;
    }

    // 检查关键词
    if (conditions.keywords && conditions.keywords.length > 0) {
      const content = this.extractTextContent(message.content);
      const hasKeyword = conditions.keywords.some(keyword => 
        content.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!hasKeyword) {
        return false;
      }
    }

    // 检查时间范围
    if (conditions.timeRange) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startHour, startMin] = conditions.timeRange.start.split(':').map(Number);
      const [endHour, endMin] = conditions.timeRange.end.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      
      if (currentTime < startTime || currentTime > endTime) {
        return false;
      }
    }

    return true;
  }

  /**
   * 执行回复动作
   */
  private async executeReplyAction(rule: AutoReplyRule, message: Message): Promise<void> {
    const action = rule.actions;

    // 延迟回复
    if (action.delay && action.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, action.delay));
    }

    try {
      switch (action.replyType) {
        case 'text':
          await this.replyMessage(message.message_id, MessageType.TEXT, action.content as string);
          break;
        case 'card':
          await this.sendCardMessage(message.chat_id, action.content as MessageCard);
          break;
        case 'template':
          // TODO: 处理模板回复
          break;
      }

      // 转人工处理
      if (action.transferToHuman) {
        // TODO: 实现转人工逻辑
        console.log('转人工处理:', message.message_id);
      }
    } catch (error) {
      console.error('执行回复动作失败:', error);
    }
  }

  /**
   * 提取文本内容
   */
  private extractTextContent(content: string): string {
    try {
      const parsed = JSON.parse(content);
      if (parsed.text) {
        return parsed.text;
      }
      return content;
    } catch {
      return content;
    }
  }

  /**
   * 加载自动回复规则
   */
  private async loadAutoReplyRules(): Promise<void> {
    try {
      // TODO: 从存储中加载规则
      // 这里可以从本地存储、数据库或配置文件中加载
      const stored = localStorage.getItem('feishu_auto_reply_rules');
      if (stored) {
        this.autoReplyRules = JSON.parse(stored);
      } else {
        // 默认规则
        this.autoReplyRules = [
          {
            id: '1',
            name: '欢迎消息',
            description: '新用户加入群聊时的欢迎消息',
            isActive: true,
            priority: 1,
            conditions: {
              keywords: ['你好', 'hello', '在吗'],
              messageType: [MessageType.TEXT],
              chatType: [ChatType.GROUP, ChatType.P2P]
            },
            actions: {
              replyType: 'text',
              content: '您好！欢迎咨询，我是智能客服助手，有什么可以帮助您的吗？',
              delay: 1000
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
      }
    } catch (error) {
      console.error('加载自动回复规则失败:', error);
      this.autoReplyRules = [];
    }
  }

  /**
   * 保存自动回复规则
   */
  private async saveAutoReplyRules(): Promise<void> {
    try {
      localStorage.setItem('feishu_auto_reply_rules', JSON.stringify(this.autoReplyRules));
    } catch (error) {
      console.error('保存自动回复规则失败:', error);
    }
  }

  /**
   * 生成UUID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// 导出单例实例
const botService = new FeishuBotService();
export default botService;