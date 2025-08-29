import { bitable } from '@lark-opdev/block-bitable-api';
import {
  AnalyticsService,
  OverallStats,
  CustomerAcquisitionStats,
  ChannelStats,
  GroupChatStats,
  GroupActivityStats,
  AgentWorkStats,
  BotStats,
  TimeSeriesData,
  RankingData,
  AnalyticsQuery,
  ExportConfig,
  DashboardConfig,
  ReportConfig,
  AlertRule,
  AlertRecord,
  TimeRange,
  StatsDimension,
  ChartType,
  TimeSeriesDataPoint,
  ApiResponse,
  PaginatedResponse
} from '../types/analytics';

class AnalyticsServiceImpl implements AnalyticsService {
  private baseUrl = 'https://open.feishu.cn/open-apis';
  private accessToken: string | null = null;
  private appId: string | null = null;
  private appSecret: string | null = null;

  constructor() {
    this.loadConfig();
  }

  // 加载配置
  private loadConfig() {
    this.appId = localStorage.getItem('feishu_app_id');
    this.appSecret = localStorage.getItem('feishu_app_secret');
    this.accessToken = localStorage.getItem('feishu_access_token');
  }

  // 保存配置
  saveConfig(appId: string, appSecret: string) {
    this.appId = appId;
    this.appSecret = appSecret;
    localStorage.setItem('feishu_app_id', appId);
    localStorage.setItem('feishu_app_secret', appSecret);
  }

  // 获取访问令牌
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    if (!this.appId || !this.appSecret) {
      throw new Error('请先配置应用ID和密钥');
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/v3/tenant_access_token/internal`, {
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
        localStorage.setItem('feishu_access_token', this.accessToken!);
        return this.accessToken!;
      } else {
        throw new Error(data.msg || '获取访问令牌失败');
      }
    } catch (error) {
      console.error('获取访问令牌失败:', error);
      throw error;
    }
  }

  // 生成模拟数据的辅助函数
  private generateTimeSeriesData(days: number, baseValue: number, variance: number): TimeSeriesDataPoint[] {
    const data: TimeSeriesDataPoint[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const value = baseValue + (Math.random() - 0.5) * variance;
      data.push({
        timestamp: date.toISOString(),
        value: Math.max(0, Math.round(value)),
        label: date.toLocaleDateString('zh-CN')
      });
    }
    
    return data;
  }

  private getDateRangeDays(timeRange: TimeRange): number {
    switch (timeRange) {
      case TimeRange.TODAY: return 1;
      case TimeRange.YESTERDAY: return 1;
      case TimeRange.LAST_7_DAYS: return 7;
      case TimeRange.LAST_30_DAYS: return 30;
      case TimeRange.LAST_90_DAYS: return 90;
      default: return 30;
    }
  }

  // 获取综合统计
  async getOverallStats(query: AnalyticsQuery): Promise<OverallStats> {
    // 模拟数据，实际应用中应该调用真实API
    const customerAcquisition: CustomerAcquisitionStats = {
      totalCustomers: 1250,
      newCustomers: 85,
      activeCustomers: 892,
      conversionRate: 0.68,
      avgAcquisitionCost: 125.5,
      customerLifetimeValue: 2850.0,
      retentionRate: 0.85,
      churnRate: 0.15
    };

    const groupChat: GroupChatStats = {
      totalGroups: 156,
      activeGroups: 134,
      avgMembersPerGroup: 8.5,
      totalMessages: 12450,
      avgMessagesPerGroup: 79.8,
      memberEngagementRate: 0.72,
      groupRetentionRate: 0.89,
      autoGroupSuccessRate: 0.94
    };

    const bot: BotStats = {
      totalMessages: 8920,
      autoReplies: 6450,
      autoReplyRate: 0.72,
      handoverCount: 245,
      handoverRate: 0.03,
      avgResponseTime: 1.2,
      accuracyRate: 0.89,
      userSatisfaction: 4.3
    };

    const channels: ChannelStats[] = [
      {
        channelId: 'wechat',
        channelName: '微信',
        customerCount: 450,
        conversionCount: 320,
        conversionRate: 0.71,
        cost: 15600,
        roi: 2.8,
        avgResponseTime: 2.1
      },
      {
        channelId: 'website',
        channelName: '官网',
        customerCount: 380,
        conversionCount: 245,
        conversionRate: 0.64,
        cost: 8900,
        roi: 3.2,
        avgResponseTime: 1.8
      },
      {
        channelId: 'phone',
        channelName: '电话',
        customerCount: 280,
        conversionCount: 210,
        conversionRate: 0.75,
        cost: 12400,
        roi: 2.1,
        avgResponseTime: 0.5
      }
    ];

    const agents: AgentWorkStats[] = [
      {
        agentId: 'agent_001',
        agentName: '张小明',
        totalChats: 145,
        resolvedChats: 132,
        avgResponseTime: 1.8,
        avgResolutionTime: 15.2,
        customerSatisfaction: 4.6,
        workingHours: 8.5,
        efficiency: 0.91
      },
      {
        agentId: 'agent_002',
        agentName: '李小红',
        totalChats: 128,
        resolvedChats: 115,
        avgResponseTime: 2.1,
        avgResolutionTime: 18.7,
        customerSatisfaction: 4.4,
        workingHours: 8.0,
        efficiency: 0.87
      }
    ];

    return {
      customerAcquisition,
      groupChat,
      bot,
      channels,
      agents,
      timeRange: query.timeRange,
      lastUpdated: new Date().toISOString()
    };
  }

  // 获取客户获取统计
  async getCustomerAcquisitionStats(query: AnalyticsQuery): Promise<CustomerAcquisitionStats> {
    const stats = await this.getOverallStats(query);
    return stats.customerAcquisition;
  }

  // 获取渠道统计
  async getChannelStats(query: AnalyticsQuery): Promise<ChannelStats[]> {
    const stats = await this.getOverallStats(query);
    return stats.channels;
  }

  // 获取群聊统计
  async getGroupChatStats(query: AnalyticsQuery): Promise<GroupChatStats> {
    const stats = await this.getOverallStats(query);
    return stats.groupChat;
  }

  // 获取群聊活跃度
  async getGroupActivityStats(query: AnalyticsQuery): Promise<GroupActivityStats[]> {
    // 模拟数据
    return [
      {
        groupId: 'group_001',
        groupName: '产品咨询群',
        memberCount: 12,
        messageCount: 245,
        activeMembers: 9,
        lastActivityTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        engagementScore: 0.85,
        status: 'active'
      },
      {
        groupId: 'group_002',
        groupName: '技术支持群',
        memberCount: 8,
        messageCount: 156,
        activeMembers: 6,
        lastActivityTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        engagementScore: 0.72,
        status: 'active'
      },
      {
        groupId: 'group_003',
        groupName: '售后服务群',
        memberCount: 15,
        messageCount: 89,
        activeMembers: 4,
        lastActivityTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        engagementScore: 0.35,
        status: 'inactive'
      }
    ];
  }

  // 获取客服工作统计
  async getAgentWorkStats(query: AnalyticsQuery): Promise<AgentWorkStats[]> {
    const stats = await this.getOverallStats(query);
    return stats.agents;
  }

  // 获取机器人统计
  async getBotStats(query: AnalyticsQuery): Promise<BotStats> {
    const stats = await this.getOverallStats(query);
    return stats.bot;
  }

  // 获取时间序列数据
  async getTimeSeriesData(metric: string, query: AnalyticsQuery): Promise<TimeSeriesData[]> {
    const days = this.getDateRangeDays(query.timeRange);
    
    switch (metric) {
      case 'customer_acquisition':
        return [
          {
            name: '新增客户',
            data: this.generateTimeSeriesData(days, 25, 10),
            color: '#1890ff',
            type: ChartType.LINE
          },
          {
            name: '活跃客户',
            data: this.generateTimeSeriesData(days, 180, 30),
            color: '#52c41a',
            type: ChartType.LINE
          }
        ];
      
      case 'group_activity':
        return [
          {
            name: '群聊消息',
            data: this.generateTimeSeriesData(days, 450, 100),
            color: '#fa8c16',
            type: ChartType.BAR
          },
          {
            name: '活跃群聊',
            data: this.generateTimeSeriesData(days, 35, 8),
            color: '#722ed1',
            type: ChartType.LINE
          }
        ];
      
      case 'bot_performance':
        return [
          {
            name: '机器人回复',
            data: this.generateTimeSeriesData(days, 280, 50),
            color: '#13c2c2',
            type: ChartType.AREA
          },
          {
            name: '人工接管',
            data: this.generateTimeSeriesData(days, 15, 5),
            color: '#f5222d',
            type: ChartType.BAR
          }
        ];
      
      default:
        return [];
    }
  }

  // 获取排行榜数据
  async getRankingData(metric: string, query: AnalyticsQuery): Promise<RankingData[]> {
    switch (metric) {
      case 'top_agents':
        return [
          { rank: 1, name: '张小明', value: 145, change: 12, trend: 'up' },
          { rank: 2, name: '李小红', value: 128, change: -3, trend: 'down' },
          { rank: 3, name: '王小强', value: 115, change: 8, trend: 'up' },
          { rank: 4, name: '赵小美', value: 98, change: 0, trend: 'stable' },
          { rank: 5, name: '陈小华', value: 87, change: 5, trend: 'up' }
        ];
      
      case 'top_channels':
        return [
          { rank: 1, name: '微信', value: 450, change: 25, trend: 'up' },
          { rank: 2, name: '官网', value: 380, change: -8, trend: 'down' },
          { rank: 3, name: '电话', value: 280, change: 15, trend: 'up' },
          { rank: 4, name: 'APP', value: 140, change: 3, trend: 'up' }
        ];
      
      case 'top_groups':
        return [
          { rank: 1, name: '产品咨询群', value: 245, change: 18, trend: 'up' },
          { rank: 2, name: '技术支持群', value: 156, change: -5, trend: 'down' },
          { rank: 3, name: '售后服务群', value: 89, change: 2, trend: 'up' }
        ];
      
      default:
        return [];
    }
  }

  // 导出数据
  async exportData(config: ExportConfig): Promise<string> {
    // 模拟导出过程
    return new Promise((resolve) => {
      setTimeout(() => {
        const filename = `analytics_export_${Date.now()}.${config.format}`;
        const downloadUrl = `https://example.com/downloads/${filename}`;
        resolve(downloadUrl);
      }, 2000);
    });
  }

  // 仪表板管理
  async getDashboards(): Promise<DashboardConfig[]> {
    // 模拟数据
    return [
      {
        id: 'dashboard_001',
        name: '客户获取概览',
        description: '展示客户获取相关的关键指标',
        widgets: [],
        layout: { columns: 12, rowHeight: 150, margin: [10, 10], containerPadding: [20, 20] },
        filters: [],
        refreshInterval: 300,
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'dashboard_002',
        name: '群聊活跃度分析',
        description: '分析群聊的活跃度和参与情况',
        widgets: [],
        layout: { columns: 12, rowHeight: 150, margin: [10, 10], containerPadding: [20, 20] },
        filters: [],
        refreshInterval: 600,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async getDashboard(id: string): Promise<DashboardConfig> {
    const dashboards = await this.getDashboards();
    const dashboard = dashboards.find(d => d.id === id);
    if (!dashboard) {
      throw new Error('仪表板不存在');
    }
    return dashboard;
  }

  async createDashboard(config: Omit<DashboardConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<DashboardConfig> {
    const dashboard: DashboardConfig = {
      ...config,
      id: `dashboard_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return dashboard;
  }

  async updateDashboard(id: string, config: Partial<DashboardConfig>): Promise<DashboardConfig> {
    const dashboard = await this.getDashboard(id);
    const updated = {
      ...dashboard,
      ...config,
      updatedAt: new Date().toISOString()
    };
    return updated;
  }

  async deleteDashboard(id: string): Promise<void> {
    // 模拟删除操作
    console.log(`删除仪表板: ${id}`);
  }

  // 报告管理
  async getReports(): Promise<ReportConfig[]> {
    return [
      {
        id: 'report_001',
        name: '每日运营报告',
        description: '每日客户获取和群聊活跃度报告',
        schedule: {
          frequency: 'daily',
          time: '09:00',
          timezone: 'Asia/Shanghai'
        },
        recipients: ['admin@example.com'],
        template: 'daily_operations',
        dataQuery: {
          timeRange: TimeRange.YESTERDAY,
          dimensions: [StatsDimension.TIME]
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async createReport(config: Omit<ReportConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportConfig> {
    const report: ReportConfig = {
      ...config,
      id: `report_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return report;
  }

  async updateReport(id: string, config: Partial<ReportConfig>): Promise<ReportConfig> {
    const reports = await this.getReports();
    const report = reports.find(r => r.id === id);
    if (!report) {
      throw new Error('报告不存在');
    }
    const updated = {
      ...report,
      ...config,
      updatedAt: new Date().toISOString()
    };
    return updated;
  }

  async deleteReport(id: string): Promise<void> {
    console.log(`删除报告: ${id}`);
  }

  // 预警管理
  async getAlertRules(): Promise<AlertRule[]> {
    return [
      {
        id: 'alert_001',
        name: '客户响应时间过长',
        description: '当平均响应时间超过5分钟时触发预警',
        metric: 'avg_response_time',
        condition: {
          operator: '>',
          timeWindow: 30
        },
        threshold: 300,
        severity: 'high',
        recipients: ['admin@example.com'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AlertRule> {
    const alertRule: AlertRule = {
      ...rule,
      id: `alert_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return alertRule;
  }

  async updateAlertRule(id: string, rule: Partial<AlertRule>): Promise<AlertRule> {
    const rules = await this.getAlertRules();
    const alertRule = rules.find(r => r.id === id);
    if (!alertRule) {
      throw new Error('预警规则不存在');
    }
    const updated = {
      ...alertRule,
      ...rule,
      updatedAt: new Date().toISOString()
    };
    return updated;
  }

  async deleteAlertRule(id: string): Promise<void> {
    console.log(`删除预警规则: ${id}`);
  }

  async getAlertRecords(query?: { ruleId?: string; status?: string; limit?: number }): Promise<AlertRecord[]> {
    return [
      {
        id: 'alert_record_001',
        ruleId: 'alert_001',
        ruleName: '客户响应时间过长',
        metric: 'avg_response_time',
        value: 320,
        threshold: 300,
        severity: 'high',
        message: '平均响应时间为320秒，超过阈值300秒',
        status: 'triggered',
        triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  async acknowledgeAlert(id: string, acknowledgedBy: string): Promise<void> {
    console.log(`确认预警 ${id}，确认人: ${acknowledgedBy}`);
  }

  // 测试连接
  async testConnection(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      console.error('连接测试失败:', error);
      return false;
    }
  }
}

// 创建单例实例
const analyticsService = new AnalyticsServiceImpl();
export default analyticsService;