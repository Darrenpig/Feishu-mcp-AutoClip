import {
  bitable,
  IOpenCellValue,
  FieldType,
  IWidgetTable,
  IFieldMeta,
} from '@lark-opdev/block-bitable-api';
import {
  Customer,
  CustomerFormData,
  CustomerFilter,
  CustomerQueryParams,
  CustomerStats,
  CustomerLog,
  CustomerTag,
  SalesAgent,
  CustomerImportData,
  CustomerImportResult,
  CustomerExportConfig,
  ApiResponse,
  PaginatedResponse,
  CustomerService as ICustomerService,
  CustomerStatus,
  IntentionLevel,
  CustomerSource,
} from '../types/customer';

// 客户表字段映射
const CUSTOMER_FIELD_MAP = {
  id: 'ID',
  name: '客户姓名',
  phone: '联系电话',
  email: '邮箱地址',
  company: '公司名称',
  position: '职位',
  source: '来源渠道',
  status: '客户状态',
  intentionLevel: '意向等级',
  tags: '标签',
  openId: '飞书OpenID',
  createTime: '创建时间',
  updateTime: '更新时间',
  lastContactTime: '最后联系时间',
  assignedSales: '分配销售',
  notes: '备注信息',
  avatar: '头像',
  wechat: '微信号',
  address: '地址',
  industry: '行业',
  companySize: '公司规模',
  budget: '预算',
  decisionMaker: '是否决策者',
};

class CustomerService implements ICustomerService {
  private table: IWidgetTable | null = null;
  private fieldMetaMap: Map<string, IFieldMeta> = new Map();

  // 初始化服务
  async initialize(): Promise<void> {
    try {
      const selection = await bitable.base.getSelection();
      if (!selection.tableId) {
        throw new Error('未选择表格');
      }
      
      this.table = await bitable.base.getTableById(selection.tableId);
      
      // 获取字段元数据
      const fieldMetas = await this.table.getFieldMetaList();
      fieldMetas.forEach(meta => {
        this.fieldMetaMap.set(meta.name, meta);
      });
      
      // 确保必要字段存在
      await this.ensureRequiredFields();
    } catch (error) {
      console.error('客户服务初始化失败:', error);
      throw error;
    }
  }

  // 确保必要字段存在
  private async ensureRequiredFields(): Promise<void> {
    if (!this.table) return;

    const requiredFields = [
      { name: CUSTOMER_FIELD_MAP.name, type: FieldType.Text },
      { name: CUSTOMER_FIELD_MAP.phone, type: FieldType.Text },
      { name: CUSTOMER_FIELD_MAP.email, type: FieldType.Text },
      { name: CUSTOMER_FIELD_MAP.company, type: FieldType.Text },
      { name: CUSTOMER_FIELD_MAP.status, type: FieldType.SingleSelect },
      { name: CUSTOMER_FIELD_MAP.intentionLevel, type: FieldType.SingleSelect },
      { name: CUSTOMER_FIELD_MAP.source, type: FieldType.SingleSelect },
      { name: CUSTOMER_FIELD_MAP.tags, type: FieldType.MultiSelect },
      { name: CUSTOMER_FIELD_MAP.createTime, type: FieldType.DateTime },
      { name: CUSTOMER_FIELD_MAP.updateTime, type: FieldType.DateTime },
    ];

    for (const field of requiredFields) {
      if (!this.fieldMetaMap.has(field.name)) {
        try {
          await this.table.addField({
            type: field.type,
            name: field.name,
          });
          console.log(`已创建字段: ${field.name}`);
        } catch (error) {
          console.warn(`创建字段失败: ${field.name}`, error);
        }
      }
    }
  }

  // 将记录转换为客户对象
  private recordToCustomer(record: Record<string, IOpenCellValue>): Customer {
    const getFieldValue = (fieldName: string, defaultValue: any = null) => {
      const fieldMeta = this.fieldMetaMap.get(fieldName);
      if (!fieldMeta) return defaultValue;
      return record[fieldMeta.id] || defaultValue;
    };

    return {
      id: record.recordId as string,
      name: getFieldValue(CUSTOMER_FIELD_MAP.name, ''),
      phone: getFieldValue(CUSTOMER_FIELD_MAP.phone),
      email: getFieldValue(CUSTOMER_FIELD_MAP.email),
      company: getFieldValue(CUSTOMER_FIELD_MAP.company),
      position: getFieldValue(CUSTOMER_FIELD_MAP.position),
      source: getFieldValue(CUSTOMER_FIELD_MAP.source, CustomerSource.OTHER),
      status: getFieldValue(CUSTOMER_FIELD_MAP.status, CustomerStatus.NEW),
      intentionLevel: getFieldValue(CUSTOMER_FIELD_MAP.intentionLevel, IntentionLevel.UNKNOWN),
      tags: Array.isArray(getFieldValue(CUSTOMER_FIELD_MAP.tags)) 
        ? getFieldValue(CUSTOMER_FIELD_MAP.tags).map((tag: any) => tag.text || tag)
        : [],
      openId: getFieldValue(CUSTOMER_FIELD_MAP.openId),
      createTime: getFieldValue(CUSTOMER_FIELD_MAP.createTime, Date.now()),
      updateTime: getFieldValue(CUSTOMER_FIELD_MAP.updateTime, Date.now()),
      lastContactTime: getFieldValue(CUSTOMER_FIELD_MAP.lastContactTime),
      assignedSales: getFieldValue(CUSTOMER_FIELD_MAP.assignedSales),
      notes: getFieldValue(CUSTOMER_FIELD_MAP.notes),
      avatar: getFieldValue(CUSTOMER_FIELD_MAP.avatar),
      wechat: getFieldValue(CUSTOMER_FIELD_MAP.wechat),
      address: getFieldValue(CUSTOMER_FIELD_MAP.address),
      industry: getFieldValue(CUSTOMER_FIELD_MAP.industry),
      companySize: getFieldValue(CUSTOMER_FIELD_MAP.companySize),
      budget: getFieldValue(CUSTOMER_FIELD_MAP.budget),
      decisionMaker: getFieldValue(CUSTOMER_FIELD_MAP.decisionMaker, false),
    };
  }

  // 将客户对象转换为记录
  private customerToRecord(customer: CustomerFormData): Record<string, IOpenCellValue> {
    const record: Record<string, IOpenCellValue> = {};
    
    const setFieldValue = (fieldName: string, value: any) => {
      const fieldMeta = this.fieldMetaMap.get(fieldName);
      if (fieldMeta && value !== undefined && value !== null) {
        record[fieldMeta.id] = value;
      }
    };

    setFieldValue(CUSTOMER_FIELD_MAP.name, customer.name);
    setFieldValue(CUSTOMER_FIELD_MAP.phone, customer.phone);
    setFieldValue(CUSTOMER_FIELD_MAP.email, customer.email);
    setFieldValue(CUSTOMER_FIELD_MAP.company, customer.company);
    setFieldValue(CUSTOMER_FIELD_MAP.position, customer.position);
    setFieldValue(CUSTOMER_FIELD_MAP.source, customer.source);
    setFieldValue(CUSTOMER_FIELD_MAP.intentionLevel, customer.intentionLevel);
    setFieldValue(CUSTOMER_FIELD_MAP.assignedSales, customer.assignedSales);
    setFieldValue(CUSTOMER_FIELD_MAP.notes, customer.notes);
    setFieldValue(CUSTOMER_FIELD_MAP.wechat, customer.wechat);
    setFieldValue(CUSTOMER_FIELD_MAP.address, customer.address);
    setFieldValue(CUSTOMER_FIELD_MAP.industry, customer.industry);
    setFieldValue(CUSTOMER_FIELD_MAP.companySize, customer.companySize);
    setFieldValue(CUSTOMER_FIELD_MAP.budget, customer.budget);
    setFieldValue(CUSTOMER_FIELD_MAP.decisionMaker, customer.decisionMaker);
    
    // 处理标签
    if (customer.tags && customer.tags.length > 0) {
      setFieldValue(CUSTOMER_FIELD_MAP.tags, customer.tags.map(tag => ({ text: tag })));
    }

    return record;
  }

  // 获取客户列表
  async getCustomers(params?: CustomerQueryParams): Promise<ApiResponse<PaginatedResponse<Customer>>> {
    try {
      if (!this.table) {
        await this.initialize();
      }

      const records = await this.table!.getRecords();
      const customers = records.map(record => this.recordToCustomer(record));
      
      // 应用过滤条件
      let filteredCustomers = customers;
      if (params?.filter) {
        filteredCustomers = this.applyFilter(customers, params.filter);
      }
      
      // 应用排序
      if (params?.sortBy) {
        filteredCustomers.sort((a, b) => {
          const aValue = a[params.sortBy!];
          const bValue = b[params.sortBy!];
          const order = params.sortOrder === 'desc' ? -1 : 1;
          
          if (aValue < bValue) return -1 * order;
          if (aValue > bValue) return 1 * order;
          return 0;
        });
      }
      
      // 应用分页
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 20;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: {
          items: paginatedCustomers,
          total: filteredCustomers.length,
          page,
          pageSize,
          totalPages: Math.ceil(filteredCustomers.length / pageSize),
        },
      };
    } catch (error) {
      console.error('获取客户列表失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '获取客户列表失败',
      };
    }
  }

  // 应用过滤条件
  private applyFilter(customers: Customer[], filter: CustomerFilter): Customer[] {
    return customers.filter(customer => {
      // 状态过滤
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(customer.status)) return false;
      }
      
      // 来源过滤
      if (filter.source && filter.source.length > 0) {
        if (!filter.source.includes(customer.source)) return false;
      }
      
      // 意向等级过滤
      if (filter.intentionLevel && filter.intentionLevel.length > 0) {
        if (!filter.intentionLevel.includes(customer.intentionLevel)) return false;
      }
      
      // 销售人员过滤
      if (filter.assignedSales && filter.assignedSales.length > 0) {
        if (!customer.assignedSales || !filter.assignedSales.includes(customer.assignedSales)) {
          return false;
        }
      }
      
      // 标签过滤
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => customer.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }
      
      // 创建时间范围过滤
      if (filter.createTimeRange) {
        const [start, end] = filter.createTimeRange;
        if (customer.createTime < start || customer.createTime > end) return false;
      }
      
      // 最后联系时间范围过滤
      if (filter.lastContactTimeRange && customer.lastContactTime) {
        const [start, end] = filter.lastContactTimeRange;
        if (customer.lastContactTime < start || customer.lastContactTime > end) return false;
      }
      
      // 关键词搜索
      if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase();
        const searchFields = [customer.name, customer.company, customer.phone, customer.email, customer.notes];
        const hasMatch = searchFields.some(field => 
          field && field.toLowerCase().includes(keyword)
        );
        if (!hasMatch) return false;
      }
      
      return true;
    });
  }

  // 获取客户详情
  async getCustomer(id: string): Promise<ApiResponse<Customer>> {
    try {
      if (!this.table) {
        await this.initialize();
      }

      const record = await this.table!.getRecordById(id);
      const customer = this.recordToCustomer(record);
      
      return {
        success: true,
        data: customer,
      };
    } catch (error) {
      console.error('获取客户详情失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '获取客户详情失败',
      };
    }
  }

  // 创建客户
  async createCustomer(data: CustomerFormData): Promise<ApiResponse<Customer>> {
    try {
      if (!this.table) {
        await this.initialize();
      }

      const record = this.customerToRecord(data);
      
      // 设置创建时间和更新时间
      const now = Date.now();
      const createTimeField = this.fieldMetaMap.get(CUSTOMER_FIELD_MAP.createTime);
      const updateTimeField = this.fieldMetaMap.get(CUSTOMER_FIELD_MAP.updateTime);
      const statusField = this.fieldMetaMap.get(CUSTOMER_FIELD_MAP.status);
      
      if (createTimeField) record[createTimeField.id] = now;
      if (updateTimeField) record[updateTimeField.id] = now;
      if (statusField && !record[statusField.id]) {
        record[statusField.id] = CustomerStatus.NEW;
      }

      const recordId = await this.table!.addRecord(record);
      const newRecord = await this.table!.getRecordById(recordId);
      const customer = this.recordToCustomer(newRecord);
      
      return {
        success: true,
        data: customer,
      };
    } catch (error) {
      console.error('创建客户失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '创建客户失败',
      };
    }
  }

  // 更新客户
  async updateCustomer(id: string, data: Partial<CustomerFormData>): Promise<ApiResponse<Customer>> {
    try {
      if (!this.table) {
        await this.initialize();
      }

      const record = this.customerToRecord(data as CustomerFormData);
      
      // 设置更新时间
      const updateTimeField = this.fieldMetaMap.get(CUSTOMER_FIELD_MAP.updateTime);
      if (updateTimeField) {
        record[updateTimeField.id] = Date.now();
      }

      await this.table!.setRecord(id, record);
      const updatedRecord = await this.table!.getRecordById(id);
      const customer = this.recordToCustomer(updatedRecord);
      
      return {
        success: true,
        data: customer,
      };
    } catch (error) {
      console.error('更新客户失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '更新客户失败',
      };
    }
  }

  // 删除客户
  async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    try {
      if (!this.table) {
        await this.initialize();
      }

      await this.table!.deleteRecord(id);
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('删除客户失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '删除客户失败',
      };
    }
  }

  // 批量删除客户
  async batchDeleteCustomers(ids: string[]): Promise<ApiResponse<void>> {
    try {
      if (!this.table) {
        await this.initialize();
      }

      await this.table!.deleteRecords(ids);
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('批量删除客户失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '批量删除客户失败',
      };
    }
  }

  // 获取客户统计
  async getCustomerStats(filter?: CustomerFilter): Promise<ApiResponse<CustomerStats>> {
    try {
      const response = await this.getCustomers({ filter });
      if (!response.success || !response.data) {
        throw new Error('获取客户数据失败');
      }

      const customers = response.data.items;
      const total = customers.length;
      
      const stats: CustomerStats = {
        total,
        newCount: customers.filter(c => c.status === CustomerStatus.NEW).length,
        contactedCount: customers.filter(c => c.status === CustomerStatus.CONTACTED).length,
        interestedCount: customers.filter(c => c.status === CustomerStatus.INTERESTED).length,
        negotiatingCount: customers.filter(c => c.status === CustomerStatus.NEGOTIATING).length,
        closedWonCount: customers.filter(c => c.status === CustomerStatus.CLOSED_WON).length,
        closedLostCount: customers.filter(c => c.status === CustomerStatus.CLOSED_LOST).length,
        conversionRate: total > 0 ? (customers.filter(c => c.status === CustomerStatus.CLOSED_WON).length / total) * 100 : 0,
        avgResponseTime: 0, // 需要根据实际对话数据计算
      };
      
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error('获取客户统计失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '获取客户统计失败',
      };
    }
  }

  // 获取客户操作日志
  async getCustomerLogs(customerId: string): Promise<ApiResponse<CustomerLog[]>> {
    // 这里需要实现日志记录功能，暂时返回空数组
    return {
      success: true,
      data: [],
    };
  }

  // 导入客户
  async importCustomers(data: CustomerImportData[]): Promise<ApiResponse<CustomerImportResult>> {
    const result: CustomerImportResult = {
      total: data.length,
      success: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < data.length; i++) {
      try {
        const customerData: CustomerFormData = {
          name: data[i].name,
          phone: data[i].phone,
          email: data[i].email,
          company: data[i].company,
          position: data[i].position,
          source: (data[i].source as CustomerSource) || CustomerSource.OTHER,
          intentionLevel: IntentionLevel.UNKNOWN,
          tags: [],
          notes: data[i].notes,
        };

        const response = await this.createCustomer(customerData);
        if (response.success) {
          result.success++;
        } else {
          result.failed++;
          result.errors.push({
            row: i + 1,
            error: response.message || '创建失败',
            data: data[i],
          });
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : '未知错误',
          data: data[i],
        });
      }
    }

    return {
      success: true,
      data: result,
    };
  }

  // 导出客户
  async exportCustomers(config: CustomerExportConfig): Promise<ApiResponse<string>> {
    // 这里需要实现导出功能，暂时返回空字符串
    return {
      success: true,
      data: '',
      message: '导出功能待实现',
    };
  }

  // 获取标签列表
  async getTags(): Promise<ApiResponse<CustomerTag[]>> {
    // 这里需要实现标签管理功能，暂时返回空数组
    return {
      success: true,
      data: [],
    };
  }

  // 创建标签
  async createTag(name: string, color: string, description?: string): Promise<ApiResponse<CustomerTag>> {
    // 这里需要实现标签创建功能
    const tag: CustomerTag = {
      id: Date.now().toString(),
      name,
      color,
      description,
      createTime: Date.now(),
      usageCount: 0,
    };

    return {
      success: true,
      data: tag,
    };
  }

  // 获取销售人员列表
  async getSalesAgents(): Promise<ApiResponse<SalesAgent[]>> {
    // 这里需要实现销售人员管理功能，暂时返回空数组
    return {
      success: true,
      data: [],
    };
  }
}

// 导出单例实例
export const customerService = new CustomerService();
export default customerService;