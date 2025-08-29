import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Tag,
  Space,
  Modal,
  Message,
  Popconfirm,
  Tooltip,
  Badge,
  Avatar,
  Typography,
  Card,
  Row,
  Col,
  Divider,
} from '@douyinfe/semi-ui';
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconDelete,
  IconExport,
  IconImport,
  IconRefresh,
  IconFilter,
  IconUser,
  IconPhone,
  IconMail,
  IconBuilding,
} from '@douyinfe/semi-icons';
import {
  Customer,
  CustomerFilter,
  CustomerQueryParams,
  CustomerStatus,
  IntentionLevel,
  CustomerSource,
  PaginatedResponse,
} from '../../types/customer';
import customerService from '../../services/customerService';
import CustomerForm from './CustomerForm';
import CustomerDetail from './CustomerDetail';

const { Text, Title } = Typography;
const { Option } = Select;

// 状态颜色映射
const STATUS_COLORS = {
  [CustomerStatus.NEW]: 'blue',
  [CustomerStatus.CONTACTED]: 'cyan',
  [CustomerStatus.INTERESTED]: 'green',
  [CustomerStatus.NEGOTIATING]: 'orange',
  [CustomerStatus.CLOSED_WON]: 'green',
  [CustomerStatus.CLOSED_LOST]: 'red',
  [CustomerStatus.INACTIVE]: 'grey',
};

// 状态标签映射
const STATUS_LABELS = {
  [CustomerStatus.NEW]: '新客户',
  [CustomerStatus.CONTACTED]: '已联系',
  [CustomerStatus.INTERESTED]: '有意向',
  [CustomerStatus.NEGOTIATING]: '洽谈中',
  [CustomerStatus.CLOSED_WON]: '已成交',
  [CustomerStatus.CLOSED_LOST]: '已流失',
  [CustomerStatus.INACTIVE]: '不活跃',
};

// 意向等级颜色映射
const INTENTION_COLORS = {
  [IntentionLevel.HIGH]: 'red',
  [IntentionLevel.MEDIUM]: 'orange',
  [IntentionLevel.LOW]: 'blue',
  [IntentionLevel.UNKNOWN]: 'grey',
};

// 意向等级标签映射
const INTENTION_LABELS = {
  [IntentionLevel.HIGH]: '高意向',
  [IntentionLevel.MEDIUM]: '中意向',
  [IntentionLevel.LOW]: '低意向',
  [IntentionLevel.UNKNOWN]: '未知',
};

// 来源标签映射
const SOURCE_LABELS = {
  [CustomerSource.WEBSITE]: '官网',
  [CustomerSource.SOCIAL_MEDIA]: '社交媒体',
  [CustomerSource.REFERRAL]: '推荐',
  [CustomerSource.ADVERTISEMENT]: '广告',
  [CustomerSource.EXHIBITION]: '展会',
  [CustomerSource.COLD_CALL]: '电话营销',
  [CustomerSource.OTHER]: '其他',
};

interface CustomerListProps {
  onCustomerSelect?: (customer: Customer) => void;
  onCreateGroup?: (customer: Customer) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ onCustomerSelect, onCreateGroup }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filter, setFilter] = useState<CustomerFilter>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  // 加载客户数据
  const loadCustomers = useCallback(async (params?: Partial<CustomerQueryParams>) => {
    setLoading(true);
    try {
      const queryParams: CustomerQueryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        filter,
        ...params,
      };

      const response = await customerService.getCustomers(queryParams);
      if (response.success && response.data) {
        setCustomers(response.data.items);
        setPagination(prev => ({
          ...prev,
          total: response.data!.total,
          current: response.data!.page,
        }));
      } else {
        Message.error(response.message || '加载客户数据失败');
      }
    } catch (error) {
      Message.error('加载客户数据失败');
      console.error('Load customers error:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filter]);

  // 初始化加载
  useEffect(() => {
    loadCustomers();
  }, []);

  // 处理分页变化
  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
    loadCustomers({ page, pageSize });
  };

  // 处理搜索
  const handleSearch = (keyword: string) => {
    const newFilter = { ...filter, keyword };
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, current: 1 }));
    loadCustomers({ page: 1, filter: newFilter });
  };

  // 处理过滤
  const handleFilter = (newFilter: CustomerFilter) => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, current: 1 }));
    loadCustomers({ page: 1, filter: newFilter });
    setShowFilter(false);
  };

  // 处理创建客户
  const handleCreate = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  // 处理编辑客户
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  // 处理查看详情
  const handleViewDetail = (customer: Customer) => {
    setDetailCustomer(customer);
    setShowDetail(true);
    if (onCustomerSelect) {
      onCustomerSelect(customer);
    }
  };

  // 处理删除客户
  const handleDelete = async (customer: Customer) => {
    try {
      const response = await customerService.deleteCustomer(customer.id);
      if (response.success) {
        Message.success('删除成功');
        loadCustomers();
      } else {
        Message.error(response.message || '删除失败');
      }
    } catch (error) {
      Message.error('删除失败');
      console.error('Delete customer error:', error);
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      Message.warning('请选择要删除的客户');
      return;
    }

    try {
      const response = await customerService.batchDeleteCustomers(selectedRowKeys);
      if (response.success) {
        Message.success(`成功删除 ${selectedRowKeys.length} 个客户`);
        setSelectedRowKeys([]);
        loadCustomers();
      } else {
        Message.error(response.message || '批量删除失败');
      }
    } catch (error) {
      Message.error('批量删除失败');
      console.error('Batch delete error:', error);
    }
  };

  // 处理创建群聊
  const handleCreateGroup = (customer: Customer) => {
    if (onCreateGroup) {
      onCreateGroup(customer);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '客户信息',
      dataIndex: 'name',
      width: 200,
      render: (text: string, record: Customer) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small" color={record.avatar ? undefined : 'blue'}>
            {record.avatar ? (
              <img src={record.avatar} alt={record.name} />
            ) : (
              record.name.charAt(0).toUpperCase()
            )}
          </Avatar>
          <div>
            <div>
              <Text strong>{record.name}</Text>
            </div>
            {record.company && (
              <div>
                <Text size="small" type="tertiary">{record.company}</Text>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '联系方式',
      dataIndex: 'contact',
      width: 180,
      render: (text: string, record: Customer) => (
        <div>
          {record.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
              <IconPhone size="small" />
              <Text size="small">{record.phone}</Text>
            </div>
          )}
          {record.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <IconMail size="small" />
              <Text size="small">{record.email}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: CustomerStatus) => (
        <Tag color={STATUS_COLORS[status]} size="small">
          {STATUS_LABELS[status]}
        </Tag>
      ),
    },
    {
      title: '意向等级',
      dataIndex: 'intentionLevel',
      width: 100,
      render: (level: IntentionLevel) => (
        <Tag color={INTENTION_COLORS[level]} size="small">
          {INTENTION_LABELS[level]}
        </Tag>
      ),
    },
    {
      title: '来源',
      dataIndex: 'source',
      width: 100,
      render: (source: CustomerSource) => (
        <Text size="small">{SOURCE_LABELS[source]}</Text>
      ),
    },
    {
      title: '分配销售',
      dataIndex: 'assignedSales',
      width: 120,
      render: (sales: string) => (
        sales ? <Text size="small">{sales}</Text> : <Text type="tertiary" size="small">未分配</Text>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <div>
          {tags.slice(0, 2).map(tag => (
            <Tag key={tag} size="small" style={{ marginRight: 4, marginBottom: 2 }}>
              {tag}
            </Tag>
          ))}
          {tags.length > 2 && (
            <Tooltip content={tags.slice(2).join(', ')}>
              <Tag size="small">+{tags.length - 2}</Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 120,
      render: (time: number) => (
        <Text size="small">{new Date(time).toLocaleDateString()}</Text>
      ),
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 150,
      render: (text: string, record: Customer) => (
        <Space>
          <Tooltip content="查看详情">
            <Button
              theme="borderless"
              type="primary"
              icon={<IconUser />}
              size="small"
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip content="编辑">
            <Button
              theme="borderless"
              type="secondary"
              icon={<IconEdit />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip content="创建群聊">
            <Button
              theme="borderless"
              type="warning"
              icon={<IconBuilding />}
              size="small"
              onClick={() => handleCreateGroup(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个客户吗？"
            content="删除后无法恢复"
            onConfirm={() => handleDelete(record)}
          >
            <Tooltip content="删除">
              <Button
                theme="borderless"
                type="danger"
                icon={<IconDelete />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title heading={4} style={{ margin: 0 }}>客户管理</Title>
            </Col>
            <Col>
              <Space>
                <Input
                  prefix={<IconSearch />}
                  placeholder="搜索客户姓名、公司、电话、邮箱"
                  style={{ width: 300 }}
                  onEnterPress={(e) => handleSearch((e.target as HTMLInputElement).value)}
                  onChange={(value) => !value && handleSearch('')}
                />
                <Button
                  icon={<IconFilter />}
                  onClick={() => setShowFilter(true)}
                >
                  筛选
                </Button>
                <Button
                  icon={<IconRefresh />}
                  onClick={() => loadCustomers()}
                >
                  刷新
                </Button>
                <Button
                  type="primary"
                  icon={<IconPlus />}
                  onClick={handleCreate}
                >
                  新建客户
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {selectedRowKeys.length > 0 && (
          <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 6 }}>
            <Space>
              <Text>已选择 {selectedRowKeys.length} 个客户</Text>
              <Popconfirm
                title={`确定要删除选中的 ${selectedRowKeys.length} 个客户吗？`}
                content="删除后无法恢复"
                onConfirm={handleBatchDelete}
              >
                <Button type="danger" size="small" icon={<IconDelete />}>
                  批量删除
                </Button>
              </Popconfirm>
              <Button
                size="small"
                onClick={() => setSelectedRowKeys([])}
              >
                取消选择
              </Button>
            </Space>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={customers}
          loading={loading}
          rowKey="id"
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: handlePageChange,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 客户表单弹窗 */}
      <Modal
        title={editingCustomer ? '编辑客户' : '新建客户'}
        visible={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
        width={800}
      >
        <CustomerForm
          customer={editingCustomer}
          onSubmit={async (data) => {
            try {
              const response = editingCustomer
                ? await customerService.updateCustomer(editingCustomer.id, data)
                : await customerService.createCustomer(data);
              
              if (response.success) {
                Message.success(editingCustomer ? '更新成功' : '创建成功');
                setShowForm(false);
                loadCustomers();
              } else {
                Message.error(response.message || '操作失败');
              }
            } catch (error) {
              Message.error('操作失败');
              console.error('Submit error:', error);
            }
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* 客户详情弹窗 */}
      <Modal
        title="客户详情"
        visible={showDetail}
        onCancel={() => setShowDetail(false)}
        footer={null}
        width={1000}
      >
        {detailCustomer && (
          <CustomerDetail
            customer={detailCustomer}
            onEdit={() => {
              setShowDetail(false);
              handleEdit(detailCustomer);
            }}
            onCreateGroup={() => handleCreateGroup(detailCustomer)}
          />
        )}
      </Modal>

      {/* 筛选弹窗 */}
      <Modal
        title="筛选条件"
        visible={showFilter}
        onCancel={() => setShowFilter(false)}
        footer={null}
        width={600}
      >
        <CustomerFilterForm
          filter={filter}
          onFilter={handleFilter}
          onCancel={() => setShowFilter(false)}
        />
      </Modal>
    </div>
  );
};

// 筛选表单组件
interface CustomerFilterFormProps {
  filter: CustomerFilter;
  onFilter: (filter: CustomerFilter) => void;
  onCancel: () => void;
}

const CustomerFilterForm: React.FC<CustomerFilterFormProps> = ({ filter, onFilter, onCancel }) => {
  const [formData, setFormData] = useState<CustomerFilter>(filter);

  const handleSubmit = () => {
    onFilter(formData);
  };

  const handleReset = () => {
    setFormData({});
    onFilter({});
  };

  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>客户状态</Text>
            <Select
              multiple
              placeholder="选择状态"
              style={{ width: '100%', marginTop: 8 }}
              value={formData.status}
              onChange={(status) => setFormData({ ...formData, status })}
            >
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>意向等级</Text>
            <Select
              multiple
              placeholder="选择意向等级"
              style={{ width: '100%', marginTop: 8 }}
              value={formData.intentionLevel}
              onChange={(intentionLevel) => setFormData({ ...formData, intentionLevel })}
            >
              {Object.entries(INTENTION_LABELS).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>来源渠道</Text>
            <Select
              multiple
              placeholder="选择来源"
              style={{ width: '100%', marginTop: 8 }}
              value={formData.source}
              onChange={(source) => setFormData({ ...formData, source })}
            >
              {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>创建时间</Text>
            <DatePicker
              type="dateRange"
              placeholder={['开始日期', '结束日期']}
              style={{ width: '100%', marginTop: 8 }}
              onChange={(dates) => {
                if (dates && dates.length === 2) {
                  setFormData({
                    ...formData,
                    createTimeRange: [dates[0].getTime(), dates[1].getTime()],
                  });
                } else {
                  const { createTimeRange, ...rest } = formData;
                  setFormData(rest);
                }
              }}
            />
          </div>
        </Col>
      </Row>

      <Divider />
      
      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button onClick={handleReset}>重置</Button>
          <Button type="primary" onClick={handleSubmit}>确定</Button>
        </Space>
      </div>
    </div>
  );
};

export default CustomerList;