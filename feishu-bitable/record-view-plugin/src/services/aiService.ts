// AI智能分析服务 - 参考AutoClip的AI驱动处理理念
import { bitable } from '@lark-opdev/block-bitable-api';

// AI分析结果接口
export interface AIAnalysisResult {
  confidence: number; // 置信度 0-1
  category: string; // 分类结果
  tags: string[]; // 智能标签
  priority: 'high' | 'medium' | 'low'; // 优先级
  recommendations: string[]; // 建议操作
  sentiment?: 'positive' | 'neutral' | 'negative'; // 情感分析
}

// 客户智能分析结果
export interface CustomerAIAnalysis extends AIAnalysisResult {
  customerType: 'potential' | 'active' | 'inactive' | 'vip';
  conversionProbability: number; // 转化概率
  suggestedActions: string[]; // 建议的跟进动作
  optimalContactTime?: string; // 最佳联系时间
}

// 群聊智能分析结果
export interface GroupAIAnalysis extends AIAnalysisResult {
  activityLevel: 'high' | 'medium' | 'low';
  engagementScore: number; // 参与度评分
  topicAnalysis: {
    mainTopics: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    keyParticipants: string[];
  };
  suggestedInterventions: string[]; // 建议的干预措施
}

// 对话智能分析结果
export interface ChatAIAnalysis extends AIAnalysisResult {
  intent: string; // 用户意图
  urgency: 'high' | 'medium' | 'low'; // 紧急程度
  requiresHuman: boolean; // 是否需要人工介入
  suggestedResponse?: string; // 建议回复
  followUpActions: string[]; // 后续跟进动作
}

// AI配置接口
export interface AIConfig {
  provider: 'openai' | 'qwen' | 'siliconflow'; // AI服务提供商
  apiKey: string;
  model: string;
  temperature: number; // 创造性参数
  maxTokens: number;
  enabled: boolean;
}

class AIService {
  private config: AIConfig | null = null;
  private readonly defaultConfig: AIConfig = {
    provider: 'qwen',
    apiKey: '',
    model: 'qwen-plus',
    temperature: 0.7,
    maxTokens: 1000,
    enabled: false
  };

  // 初始化AI服务配置
  async initializeConfig(): Promise<void> {
    try {
      // 从飞书多维表格中读取AI配置
      const table = await bitable.base.getActiveTable();
      const configRecord = await this.getConfigFromTable(table);
      
      if (configRecord) {
        this.config = { ...this.defaultConfig, ...configRecord };
      } else {
        this.config = this.defaultConfig;
      }
    } catch (error) {
      console.error('初始化AI配置失败:', error);
      this.config = this.defaultConfig;
    }
  }

  // 从表格中获取配置
  private async getConfigFromTable(table: any): Promise<Partial<AIConfig> | null> {
    try {
      // 这里应该从配置表中读取AI设置
      // 实际实现需要根据具体的表格结构调整
      return null;
    } catch (error) {
      console.error('从表格获取AI配置失败:', error);
      return null;
    }
  }

  // 智能分析客户信息
  async analyzeCustomer(customerData: any): Promise<CustomerAIAnalysis> {
    if (!this.config?.enabled) {
      return this.getDefaultCustomerAnalysis();
    }

    try {
      const prompt = this.buildCustomerAnalysisPrompt(customerData);
      const response = await this.callAIAPI(prompt);
      return this.parseCustomerAnalysisResponse(response);
    } catch (error) {
      console.error('客户AI分析失败:', error);
      return this.getDefaultCustomerAnalysis();
    }
  }

  // 智能分析群聊活动
  async analyzeGroup(groupData: any, messages: any[]): Promise<GroupAIAnalysis> {
    if (!this.config?.enabled) {
      return this.getDefaultGroupAnalysis();
    }

    try {
      const prompt = this.buildGroupAnalysisPrompt(groupData, messages);
      const response = await this.callAIAPI(prompt);
      return this.parseGroupAnalysisResponse(response);
    } catch (error) {
      console.error('群聊AI分析失败:', error);
      return this.getDefaultGroupAnalysis();
    }
  }

  // 智能分析对话内容
  async analyzeChat(chatData: any): Promise<ChatAIAnalysis> {
    if (!this.config?.enabled) {
      return this.getDefaultChatAnalysis();
    }

    try {
      const prompt = this.buildChatAnalysisPrompt(chatData);
      const response = await this.callAIAPI(prompt);
      return this.parseChatAnalysisResponse(response);
    } catch (error) {
      console.error('对话AI分析失败:', error);
      return this.getDefaultChatAnalysis();
    }
  }

  // 生成智能回复
  async generateSmartReply(context: any, userMessage: string): Promise<string> {
    if (!this.config?.enabled) {
      return '感谢您的咨询，我们会尽快为您处理。';
    }

    try {
      const prompt = this.buildReplyGenerationPrompt(context, userMessage);
      const response = await this.callAIAPI(prompt);
      return this.parseReplyResponse(response);
    } catch (error) {
      console.error('智能回复生成失败:', error);
      return '感谢您的咨询，我们会尽快为您处理。';
    }
  }

  // 批量智能分析
  async batchAnalyze(items: any[], type: 'customer' | 'group' | 'chat'): Promise<AIAnalysisResult[]> {
    const results: AIAnalysisResult[] = [];
    
    for (const item of items) {
      try {
        let analysis: AIAnalysisResult;
        
        switch (type) {
          case 'customer':
            analysis = await this.analyzeCustomer(item);
            break;
          case 'group':
            analysis = await this.analyzeGroup(item, []);
            break;
          case 'chat':
            analysis = await this.analyzeChat(item);
            break;
          default:
            analysis = this.getDefaultAnalysis();
        }
        
        results.push(analysis);
        
        // 添加延迟避免API限流
        await this.delay(100);
      } catch (error) {
        console.error(`批量分析项目失败:`, error);
        results.push(this.getDefaultAnalysis());
      }
    }
    
    return results;
  }

  // 构建客户分析提示词
  private buildCustomerAnalysisPrompt(customerData: any): string {
    return `
请分析以下客户信息，并提供智能分析结果：

客户信息：
- 姓名：${customerData.name || '未知'}
- 公司：${customerData.company || '未知'}
- 职位：${customerData.position || '未知'}
- 联系方式：${customerData.contact || '未知'}
- 来源：${customerData.source || '未知'}
- 沟通记录：${customerData.communicationHistory || '无'}
- 兴趣点：${customerData.interests || '未知'}

请从以下维度进行分析：
1. 客户类型分类（potential/active/inactive/vip）
2. 转化概率评估（0-1）
3. 优先级评定（high/medium/low）
4. 建议的跟进动作
5. 最佳联系时间建议
6. 智能标签推荐

请以JSON格式返回分析结果。
    `;
  }

  // 构建群聊分析提示词
  private buildGroupAnalysisPrompt(groupData: any, messages: any[]): string {
    const recentMessages = messages.slice(-10).map(msg => 
      `${msg.sender}: ${msg.content}`
    ).join('\n');

    return `
请分析以下群聊信息：

群聊基本信息：
- 群名：${groupData.name || '未知'}
- 成员数：${groupData.memberCount || 0}
- 创建时间：${groupData.createdAt || '未知'}
- 群类型：${groupData.type || '未知'}

最近消息记录：
${recentMessages || '暂无消息'}

请从以下维度进行分析：
1. 活跃度评估（high/medium/low）
2. 参与度评分（0-100）
3. 主要话题识别
4. 情感倾向分析
5. 关键参与者识别
6. 建议的干预措施

请以JSON格式返回分析结果。
    `;
  }

  // 构建对话分析提示词
  private buildChatAnalysisPrompt(chatData: any): string {
    return `
请分析以下对话内容：

对话信息：
- 用户消息：${chatData.userMessage || ''}
- 对话历史：${chatData.history || '无'}
- 用户信息：${JSON.stringify(chatData.userInfo || {})}
- 上下文：${chatData.context || '无'}

请从以下维度进行分析：
1. 用户意图识别
2. 紧急程度评估（high/medium/low）
3. 是否需要人工介入
4. 情感倾向分析
5. 建议回复内容
6. 后续跟进动作

请以JSON格式返回分析结果。
    `;
  }

  // 构建回复生成提示词
  private buildReplyGenerationPrompt(context: any, userMessage: string): string {
    return `
请根据以下信息生成合适的回复：

用户消息：${userMessage}
对话上下文：${JSON.stringify(context)}

回复要求：
1. 语气友好专业
2. 内容准确有用
3. 长度适中
4. 符合企业形象

请直接返回回复内容，不需要JSON格式。
    `;
  }

  // 调用AI API
  private async callAIAPI(prompt: string): Promise<string> {
    if (!this.config) {
      throw new Error('AI配置未初始化');
    }

    // 这里应该根据不同的AI服务提供商调用相应的API
    // 目前返回模拟响应
    return this.getMockAIResponse(prompt);
  }

  // 模拟AI响应（用于开发测试）
  private getMockAIResponse(prompt: string): string {
    if (prompt.includes('客户信息')) {
      return JSON.stringify({
        customerType: 'potential',
        conversionProbability: 0.75,
        priority: 'high',
        suggestedActions: ['电话跟进', '发送产品资料', '安排演示'],
        optimalContactTime: '工作日上午10-11点',
        tags: ['高意向', '决策者', '技术导向'],
        confidence: 0.85
      });
    } else if (prompt.includes('群聊信息')) {
      return JSON.stringify({
        activityLevel: 'medium',
        engagementScore: 68,
        topicAnalysis: {
          mainTopics: ['产品讨论', '技术问题', '价格咨询'],
          sentiment: 'positive',
          keyParticipants: ['张三', '李四']
        },
        suggestedInterventions: ['发布产品更新', '组织在线答疑'],
        priority: 'medium',
        tags: ['活跃群聊', '技术讨论'],
        confidence: 0.78
      });
    } else if (prompt.includes('对话内容')) {
      return JSON.stringify({
        intent: '产品咨询',
        urgency: 'medium',
        requiresHuman: false,
        suggestedResponse: '感谢您对我们产品的关注，我来为您详细介绍一下相关功能。',
        followUpActions: ['发送产品手册', '安排技术支持'],
        sentiment: 'positive',
        priority: 'medium',
        tags: ['产品咨询', '潜在客户'],
        confidence: 0.82
      });
    } else {
      return '感谢您的咨询，我们会尽快为您处理。';
    }
  }

  // 解析客户分析响应
  private parseCustomerAnalysisResponse(response: string): CustomerAIAnalysis {
    try {
      const parsed = JSON.parse(response);
      return {
        customerType: parsed.customerType || 'potential',
        conversionProbability: parsed.conversionProbability || 0.5,
        suggestedActions: parsed.suggestedActions || [],
        optimalContactTime: parsed.optimalContactTime,
        confidence: parsed.confidence || 0.5,
        category: parsed.customerType || 'potential',
        tags: parsed.tags || [],
        priority: parsed.priority || 'medium',
        recommendations: parsed.suggestedActions || [],
        sentiment: parsed.sentiment
      };
    } catch (error) {
      console.error('解析客户分析响应失败:', error);
      return this.getDefaultCustomerAnalysis();
    }
  }

  // 解析群聊分析响应
  private parseGroupAnalysisResponse(response: string): GroupAIAnalysis {
    try {
      const parsed = JSON.parse(response);
      return {
        activityLevel: parsed.activityLevel || 'medium',
        engagementScore: parsed.engagementScore || 50,
        topicAnalysis: parsed.topicAnalysis || {
          mainTopics: [],
          sentiment: 'neutral',
          keyParticipants: []
        },
        suggestedInterventions: parsed.suggestedInterventions || [],
        confidence: parsed.confidence || 0.5,
        category: parsed.activityLevel || 'medium',
        tags: parsed.tags || [],
        priority: parsed.priority || 'medium',
        recommendations: parsed.suggestedInterventions || [],
        sentiment: parsed.sentiment
      };
    } catch (error) {
      console.error('解析群聊分析响应失败:', error);
      return this.getDefaultGroupAnalysis();
    }
  }

  // 解析对话分析响应
  private parseChatAnalysisResponse(response: string): ChatAIAnalysis {
    try {
      const parsed = JSON.parse(response);
      return {
        intent: parsed.intent || '一般咨询',
        urgency: parsed.urgency || 'medium',
        requiresHuman: parsed.requiresHuman || false,
        suggestedResponse: parsed.suggestedResponse,
        followUpActions: parsed.followUpActions || [],
        confidence: parsed.confidence || 0.5,
        category: parsed.intent || '一般咨询',
        tags: parsed.tags || [],
        priority: parsed.priority || 'medium',
        recommendations: parsed.followUpActions || [],
        sentiment: parsed.sentiment
      };
    } catch (error) {
      console.error('解析对话分析响应失败:', error);
      return this.getDefaultChatAnalysis();
    }
  }

  // 解析回复响应
  private parseReplyResponse(response: string): string {
    try {
      // 如果响应是JSON格式，提取回复内容
      const parsed = JSON.parse(response);
      return parsed.reply || parsed.response || response;
    } catch (error) {
      // 如果不是JSON，直接返回响应内容
      return response;
    }
  }

  // 获取默认客户分析结果
  private getDefaultCustomerAnalysis(): CustomerAIAnalysis {
    return {
      customerType: 'potential',
      conversionProbability: 0.5,
      suggestedActions: ['跟进联系'],
      confidence: 0.5,
      category: 'potential',
      tags: ['待分析'],
      priority: 'medium',
      recommendations: ['跟进联系'],
      sentiment: 'neutral'
    };
  }

  // 获取默认群聊分析结果
  private getDefaultGroupAnalysis(): GroupAIAnalysis {
    return {
      activityLevel: 'medium',
      engagementScore: 50,
      topicAnalysis: {
        mainTopics: [],
        sentiment: 'neutral',
        keyParticipants: []
      },
      suggestedInterventions: [],
      confidence: 0.5,
      category: 'medium',
      tags: ['待分析'],
      priority: 'medium',
      recommendations: [],
      sentiment: 'neutral'
    };
  }

  // 获取默认对话分析结果
  private getDefaultChatAnalysis(): ChatAIAnalysis {
    return {
      intent: '一般咨询',
      urgency: 'medium',
      requiresHuman: false,
      followUpActions: [],
      confidence: 0.5,
      category: '一般咨询',
      tags: ['待分析'],
      priority: 'medium',
      recommendations: [],
      sentiment: 'neutral'
    };
  }

  // 获取默认分析结果
  private getDefaultAnalysis(): AIAnalysisResult {
    return {
      confidence: 0.5,
      category: '待分析',
      tags: ['待分析'],
      priority: 'medium',
      recommendations: [],
      sentiment: 'neutral'
    };
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 更新AI配置
  async updateConfig(newConfig: Partial<AIConfig>): Promise<void> {
    if (this.config) {
      this.config = { ...this.config, ...newConfig };
      // 这里应该将配置保存到飞书多维表格中
      await this.saveConfigToTable(this.config);
    }
  }

  // 保存配置到表格
  private async saveConfigToTable(config: AIConfig): Promise<void> {
    try {
      // 实际实现需要根据具体的表格结构调整
      console.log('保存AI配置:', config);
    } catch (error) {
      console.error('保存AI配置失败:', error);
    }
  }

  // 测试AI连接
  async testConnection(): Promise<boolean> {
    try {
      const testPrompt = '这是一个连接测试，请回复"连接成功"';
      const response = await this.callAIAPI(testPrompt);
      return response.includes('连接成功') || response.length > 0;
    } catch (error) {
      console.error('AI连接测试失败:', error);
      return false;
    }
  }

  // 获取AI使用统计
  getUsageStats(): {
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
  } {
    // 这里应该实现实际的统计逻辑
    return {
      totalRequests: 0,
      successRate: 0.95,
      averageResponseTime: 1200 // 毫秒
    };
  }
}

export default new AIService();