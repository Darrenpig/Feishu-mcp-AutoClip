// 数据统计和分析相关类型定义

// 时间范围枚举
export enum TimeRange {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  CUSTOM = 'custom'
}

// 统计维度枚举
export enum StatsDimension {
  TIME = 'time',
  CHANNEL = 'channel',
  AGENT = 'agent',
  CUSTOMER_TYPE = 'customer_type',
  GROUP_TYPE = 'group_type'
}

// 图表类型枚举
export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
  SCATTER = 'scatter'
}

// 客户获取统计
export interface CustomerAcquisitionStats {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  conversionRate: number;
  avgAcquisitionCost: number;
  customerLifetimeValue: number;
  retentionRate: number;
  churnRate: number;
}

// 渠道统计
export interface ChannelStats {
  channelId: string;
  channelName: string;
  customerCount: number;
  conversionCount: number;
  conversionRate: number;
  cost: number;
  roi: number;
  avgResponseTime: number;
}

// 群聊统计
export interface GroupChatStats {
  totalGroups: number;
  activeGroups: number;
  avgMembersPerGroup: number;
  totalMessages: number;
  avgMessagesPerGroup: number;
  memberEngagementRate: number;
  groupRetentionRate: number;
  autoGroupSuccessRate: number;
}

// 群聊活跃度统计
export interface GroupActivityStats {
  groupId: string;
  groupName: string;
  memberCount: number;
  messageCount: number;
  activeMembers: number;
  lastActivityTime: string;
  engagementScore: number;
  status: 'active' | 'inactive' | 'archived';
}

// 客服工作统计
export interface AgentWorkStats {
  agentId: string;
  agentName: string;
  totalChats: number;
  resolvedChats: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  customerSatisfaction: number;
  workingHours: number;
  efficiency: number;
}

// 机器人统计
export interface BotStats {
  totalMessages: number;
  autoReplies: number;
  autoReplyRate: number;
  handoverCount: number;
  handoverRate: number;
  avgResponseTime: number;
  accuracyRate: number;
  userSatisfaction: number;
}

// 时间序列数据点
export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  label?: string;
  category?: string;
}

// 时间序列数据
export interface TimeSeriesData {
  name: string;
  data: TimeSeriesDataPoint[];
  color?: string;
  type?: ChartType;
}

// 饼图数据
export interface PieChartData {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

// 排行榜数据
export interface RankingData {
  rank: number;
  name: string;
  value: number;
  change?: number; // 相比上期的变化
  trend?: 'up' | 'down' | 'stable';
}

// 对比数据
export interface ComparisonData {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

// 综合统计数据
export interface OverallStats {
  customerAcquisition: CustomerAcquisitionStats;
  groupChat: GroupChatStats;
  bot: BotStats;
  channels: ChannelStats[];
  agents: AgentWorkStats[];
  timeRange: TimeRange;
  lastUpdated: string;
}

// 仪表板配置
export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  filters: DashboardFilter[];
  refreshInterval: number; // 刷新间隔（秒）
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// 仪表板组件
export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'text';
  title: string;
  description?: string;
  dataSource: string;
  chartType?: ChartType;
  config: Record<string, any>;
  position: WidgetPosition;
  size: WidgetSize;
}

// 组件位置
export interface WidgetPosition {
  x: number;
  y: number;
}

// 组件大小
export interface WidgetSize {
  width: number;
  height: number;
}

// 仪表板布局
export interface DashboardLayout {
  columns: number;
  rowHeight: number;
  margin: [number, number];
  containerPadding: [number, number];
}

// 仪表板过滤器
export interface DashboardFilter {
  id: string;
  name: string;
  type: 'date' | 'select' | 'multiSelect' | 'input';
  options?: FilterOption[];
  defaultValue?: any;
  required: boolean;
}

// 过滤器选项
export interface FilterOption {
  label: string;
  value: any;
}

// 数据查询参数
export interface AnalyticsQuery {
  timeRange: TimeRange;
  startDate?: string;
  endDate?: string;
  dimensions?: StatsDimension[];
  filters?: Record<string, any>;
  groupBy?: string[];
  orderBy?: string;
  limit?: number;
  offset?: number;
}

// 数据导出配置
export interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeCharts: boolean;
  dateRange: TimeRange;
  customDateRange?: {
    startDate: string;
    endDate: string;
  };
  sections: string[]; // 要导出的数据部分
}

// 报告配置
export interface ReportConfig {
  id: string;
  name: string;
  description?: string;
  schedule: ReportSchedule;
  recipients: string[];
  template: string;
  dataQuery: AnalyticsQuery;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 报告调度
export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string; // HH:mm 格式
  dayOfWeek?: number; // 0-6, 0为周日
  dayOfMonth?: number; // 1-31
  timezone: string;
}

// 预警规则
export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  metric: string;
  condition: AlertCondition;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recipients: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 预警条件
export interface AlertCondition {
  operator: '>' | '<' | '>=' | '<=' | '=' | '!=';
  timeWindow: number; // 时间窗口（分钟）
  consecutiveCount?: number; // 连续触发次数
}

// 预警记录
export interface AlertRecord {
  id: string;
  ruleId: string;
  ruleName: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  status: 'triggered' | 'resolved' | 'acknowledged';
  triggeredAt: string;
  resolvedAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

// 数据分析服务接口
export interface AnalyticsService {
  // 获取综合统计
  getOverallStats(query: AnalyticsQuery): Promise<OverallStats>;
  
  // 获取客户获取统计
  getCustomerAcquisitionStats(query: AnalyticsQuery): Promise<CustomerAcquisitionStats>;
  
  // 获取渠道统计
  getChannelStats(query: AnalyticsQuery): Promise<ChannelStats[]>;
  
  // 获取群聊统计
  getGroupChatStats(query: AnalyticsQuery): Promise<GroupChatStats>;
  
  // 获取群聊活跃度
  getGroupActivityStats(query: AnalyticsQuery): Promise<GroupActivityStats[]>;
  
  // 获取客服工作统计
  getAgentWorkStats(query: AnalyticsQuery): Promise<AgentWorkStats[]>;
  
  // 获取机器人统计
  getBotStats(query: AnalyticsQuery): Promise<BotStats>;
  
  // 获取时间序列数据
  getTimeSeriesData(metric: string, query: AnalyticsQuery): Promise<TimeSeriesData[]>;
  
  // 获取排行榜数据
  getRankingData(metric: string, query: AnalyticsQuery): Promise<RankingData[]>;
  
  // 导出数据
  exportData(config: ExportConfig): Promise<string>; // 返回下载链接
  
  // 仪表板管理
  getDashboards(): Promise<DashboardConfig[]>;
  getDashboard(id: string): Promise<DashboardConfig>;
  createDashboard(config: Omit<DashboardConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<DashboardConfig>;
  updateDashboard(id: string, config: Partial<DashboardConfig>): Promise<DashboardConfig>;
  deleteDashboard(id: string): Promise<void>;
  
  // 报告管理
  getReports(): Promise<ReportConfig[]>;
  createReport(config: Omit<ReportConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportConfig>;
  updateReport(id: string, config: Partial<ReportConfig>): Promise<ReportConfig>;
  deleteReport(id: string): Promise<void>;
  
  // 预警管理
  getAlertRules(): Promise<AlertRule[]>;
  createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AlertRule>;
  updateAlertRule(id: string, rule: Partial<AlertRule>): Promise<AlertRule>;
  deleteAlertRule(id: string): Promise<void>;
  getAlertRecords(query?: { ruleId?: string; status?: string; limit?: number }): Promise<AlertRecord[]>;
  acknowledgeAlert(id: string, acknowledgedBy: string): Promise<void>;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}