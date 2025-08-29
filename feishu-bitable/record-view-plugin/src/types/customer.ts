// 客户管理相关类型定义

// 客户状态枚举
export enum CustomerStatus {
  NEW = 'new',                    // 新客户
  CONTACTED = 'contacted',        // 已联系
  INTERESTED = 'interested',      // 有意向
  NEGOTIATING = 'negotiating',    // 洽谈中
  CLOSED_WON = 'closed_won',      // 成交
  CLOSED_LOST = 'closed_lost',    // 流失
  INACTIVE = 'inactive'           // 不活跃
}

// 意向等级枚举
export enum IntentionLevel {
  HIGH = 'high',        // 高意向
  MEDIUM = 'medium',    // 中意向
  LOW = 'low',          // 低意向
  UNKNOWN = 'unknown'   // 未知
}

// 客户来源枚举
export enum CustomerSource {
  WEBSITE = 'website',           // 官网
  SOCIAL_MEDIA = 'social_media', // 社交媒体
  REFERRAL = 'referral',         // 推荐
  ADVERTISEMENT = 'advertisement', // 广告
  EXHIBITION = 'exhibition',     // 展会
  COLD_CALL = 'cold_call',       // 电话营销
  OTHER = 'other'                // 其他
}

// 客户信息接口
export interface Customer {
  id: string;                    // 客户ID
  name: string;                  // 客户姓名
  phone?: string;                // 联系电话
  email?: string;                // 邮箱地址
  company?: string;              // 公司名称
  position?: string;             // 职位
  source: CustomerSource;        // 来源渠道
  status: CustomerStatus;        // 客户状态
  intentionLevel: IntentionLevel; // 意向等级
  tags: string[];                // 标签
  openId?: string;               // 飞书OpenID
  createTime: number;            // 创建时间
  updateTime: number;            // 更新时间
  lastContactTime?: number;      // 最后联系时间
  assignedSales?: string;        // 分配销售
  notes?: string;                // 备注信息
  avatar?: string;               // 头像URL
  wechat?: string;               // 微信号
  address?: string;              // 地址
  industry?: string;             // 行业
  companySize?: string;          // 公司规模
  budget?: number;               // 预算
  decisionMaker?: boolean;       // 是否决策者
}

// 客户创建/更新表单接口
export interface CustomerFormData {
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  position?: string;
  source: CustomerSource;
  intentionLevel: IntentionLevel;
  tags: string[];
  assignedSales?: string;
  notes?: string;
  wechat?: string;
  address?: string;
  industry?: string;
  companySize?: string;
  budget?: number;
  decisionMaker?: boolean;
}

// 客户查询过滤条件
export interface CustomerFilter {
  status?: CustomerStatus[];
  source?: CustomerSource[];
  intentionLevel?: IntentionLevel[];
  assignedSales?: string[];
  tags?: string[];
  createTimeRange?: [number, number];
  lastContactTimeRange?: [number, number];
  keyword?: string; // 搜索关键词
}

// 客户列表查询参数
export interface CustomerQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: keyof Customer;
  sortOrder?: 'asc' | 'desc';
  filter?: CustomerFilter;
}

// 客户统计数据
export interface CustomerStats {
  total: number;
  newCount: number;
  contactedCount: number;
  interestedCount: number;
  negotiatingCount: number;
  closedWonCount: number;
  closedLostCount: number;
  conversionRate: number;
  avgResponseTime: number;
}

// 客户操作日志
export interface CustomerLog {
  id: string;
  customerId: string;
  action: string;
  description: string;
  operatorId: string;
  operatorName: string;
  createTime: number;
  metadata?: Record<string, any>;
}

// 客户标签
export interface CustomerTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createTime: number;
  usageCount: number;
}

// 销售人员信息
export interface SalesAgent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  department?: string;
  isActive: boolean;
  customerCount: number;
}

// 客户导入数据
export interface CustomerImportData {
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  position?: string;
  source?: string;
  notes?: string;
  [key: string]: any;
}

// 客户导入结果
export interface CustomerImportResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
    data: CustomerImportData;
  }>;
}

// 客户导出配置
export interface CustomerExportConfig {
  fields: (keyof Customer)[];
  filter?: CustomerFilter;
  format: 'csv' | 'excel';
  includeHeaders: boolean;
}

// API响应基础接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}

// 分页响应接口
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 客户服务接口
export interface CustomerService {
  // 获取客户列表
  getCustomers(params?: CustomerQueryParams): Promise<ApiResponse<PaginatedResponse<Customer>>>;
  
  // 获取客户详情
  getCustomer(id: string): Promise<ApiResponse<Customer>>;
  
  // 创建客户
  createCustomer(data: CustomerFormData): Promise<ApiResponse<Customer>>;
  
  // 更新客户
  updateCustomer(id: string, data: Partial<CustomerFormData>): Promise<ApiResponse<Customer>>;
  
  // 删除客户
  deleteCustomer(id: string): Promise<ApiResponse<void>>;
  
  // 批量删除客户
  batchDeleteCustomers(ids: string[]): Promise<ApiResponse<void>>;
  
  // 获取客户统计
  getCustomerStats(filter?: CustomerFilter): Promise<ApiResponse<CustomerStats>>;
  
  // 获取客户操作日志
  getCustomerLogs(customerId: string): Promise<ApiResponse<CustomerLog[]>>;
  
  // 导入客户
  importCustomers(data: CustomerImportData[]): Promise<ApiResponse<CustomerImportResult>>;
  
  // 导出客户
  exportCustomers(config: CustomerExportConfig): Promise<ApiResponse<string>>; // 返回下载URL
  
  // 获取标签列表
  getTags(): Promise<ApiResponse<CustomerTag[]>>;
  
  // 创建标签
  createTag(name: string, color: string, description?: string): Promise<ApiResponse<CustomerTag>>;
  
  // 获取销售人员列表
  getSalesAgents(): Promise<ApiResponse<SalesAgent[]>>;
}