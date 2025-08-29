// 群聊列表组件
import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Avatar,
  Tooltip,
  Modal,
  Form,
  Message,
  Popconfirm,
  Badge,
  Typography,
  Card,
  Row,
  Col,
  Divider
} from '@douyinfe/semi-ui';
import {
  IconSearch,
  IconPlus,
  IconRefresh,
  IconEdit,
  IconDelete,
  IconArchive,
  IconUsers,
  IconMessage,
  IconSetting,
  IconEye
} from '@douyinfe/semi-icons';
import {
  Group,
  GroupStatus,
  GroupType,
  GroupQueryParams,
  CreateGroupFormData,
  PaginatedGroupResponse
} from '../../types/group';
import { Customer } from '../../types/customer';
import groupService from '../../services/groupService';
import customerService from '../../services/customerService';
import GroupForm from './GroupForm';
import GroupDetail from './GroupDetail';

const { Text, Title } = Typography;
const { Option } = Select;

interface GroupListProps {
  onGroupSelect?: (group: Group) => void;
}

const GroupList: React.FC<GroupListProps> = ({ onGroupSelect }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchParams, setSearchParams] = useState<GroupQueryParams>({});
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  // 初始化
  useEffect(() => {
    initializeServices();
    loadGroups();
    loadCustomers();
  }, []);

  // 初始化服务
  const initializeServices = async () => {
    try {
      await groupService.initialize();
      await customerService.initialize();
    } catch (error) {
      console.error('服务初始化失败:', error);
      Message.error('服务初始化失败');
    }
  };

  // 加载群聊列表
  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const params: GroupQueryParams = {
        ...searchParams,
        page: currentPage,
        pageSize,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      };
      
      const response: PaginatedGroupResponse<Group> = await groupService.getGroups(params);
      setGroups(response.items);
      setTotal(response.total);
    } catch (error) {
      console.error('加载群聊列表失败:', error);
      Message.error('加载群聊列表失败');
    } finally {
      setLoading(false);
    }
  }, [searchParams, currentPage, pageSize]);

  // 加载客户列表
  const loadCustomers = async () => {
    try {
      const response = await customerService.getCustomers({ pageSize: 1000 });
      setCustomers(response.items);
    } catch (error) {
      console.error('加载客户列表失败:', error);
    }
  };

  // 搜索参数变化时重新加载
  useEffect(() => {
    setCurrentPage(1);
    loadGroups();
  }, [searchParams]);

  // 页码变化时重新加载
  useEffect(() => {
    loadGroups();
  }, [currentPage, pageSize]);

  // 处理搜索
  const handleSearch = (field: keyof GroupQueryParams, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value || undefined
    }));
  };

  // 重置搜索
  const handleResetSearch = () => {
    setSearchParams({});
  };

  // 创建群聊
  const handleCreateGroup = async (data: CreateGroupFormData) => {
    try {
      await groupService.createGroup(data);
      Message.success('群聊创建成功');
      setShowCreateModal(false);
      loadGroups();
    } catch (error) {
      console.error('创建群聊失败:', error);
      Message.error('创建群聊失败');
    }
  };

  // 编辑群聊
  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setShowCreateModal(true);
  };

  // 更新群聊
  const handleUpdateGroup = async (data: CreateGroupFormData) => {
    if (!editingGroup) return;
    
    try {
      await groupService.updateGroup(editingGroup.id, {
        name: data.name,
        description: data.description,
        type: data.type,
        tags: data.tags,
        settings: data.settings
      });
      Message.success('群聊更新成功');
      setShowCreateModal(false);
      setEditingGroup(null);
      loadGroups();
    } catch (error) {
      console.error('更新群聊失败:', error);
      Message.error('更新群聊失败');
    }
  };

  // 删除群聊
  const handleDeleteGroup = async (groupId: string) => {
    try {
      await groupService.deleteGroup(groupId);
      Message.success('群聊删除成功');
      loadGroups();
    } catch (error) {
      console.error('删除群聊失败:', error);
      Message.error('删除群聊失败');
    }
  };

  // 归档群聊
  const handleArchiveGroup = async (groupId: string) => {
    try {
      await groupService.archiveGroup(groupId);
      Message.success('群聊归档成功');
      loadGroups();
    } catch (error) {
      console.error('归档群聊失败:', error);
      Message.error('归档群聊失败');
    }
  };

  // 查看群聊详情
  const handleViewGroup = (group: Group) => {
    setSelectedGroup(group);
    setShowDetailModal(true);
    onGroupSelect?.(group);
  };

  // 获取状态标签
  const getStatusTag = (status: GroupStatus) => {
    const statusConfig = {
      [GroupStatus.ACTIVE]: { color: 'green', text: '活跃' },
      [GroupStatus.INACTIVE]: { color: 'orange', text: '不活跃' },
      [GroupStatus.ARCHIVED]: { color: 'grey', text: '已归档' },
      [GroupStatus.DISBANDED]: { color: 'red', text: '已解散' }
    };
    
    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取类型标签
  const getTypeTag = (type: GroupType) => {
    const typeConfig = {
      [GroupType.CUSTOMER_SERVICE]: { color: 'blue', text: '客服群' },
      [GroupType.SALES]: { color: 'green', text: '销售群' },
      [GroupType.SUPPORT]: { color: 'orange', text: '技术支持群' },
      [GroupType.GENERAL]: { color: 'grey', text: '通用群' }
    };
    
    const config = typeConfig[type];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列定义
  const columns = [
    {
      title: '群聊信息',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text: string, record: Group) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small" src={record.avatar}>
            {record.name.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            {record.description && (
              <Text type="tertiary" size="small">{record.description}</Text>
            )}
          </div>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: GroupType) => getTypeTag(type)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: GroupStatus) => getStatusTag(status)
    },
    {
      title: '成员数量',
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 100,
      render: (count: number) => (
        <Badge count={count} overflowCount={999}>
          <IconUsers size="large" />
        </Badge>
      )
    },
    {
      title: '关联客户',
      dataIndex: 'customerIds',
      key: 'customerIds',
      width: 120,
      render: (customerIds: string[]) => (
        <div>
          <Text>{customerIds.length} 个客户</Text>
          {customerIds.length > 0 && (
            <Tooltip content={customerIds.map(id => {
              const customer = customers.find(c => c.id === id);
              return customer?.name || id;
            }).join(', ')}>
              <IconEye style={{ marginLeft: 4, cursor: 'pointer' }} />
            </Tooltip>
          )}
        </div>
      )
    },
    {
      title: '最后活跃',
      dataIndex: 'lastMessageTime',
      key: 'lastMessageTime',
      width: 150,
      render: (time: Date) => (
        <div>
          {time ? (
            <>
              <div>{time.toLocaleDateString()}</div>
              <Text type="tertiary" size="small">
                {time.toLocaleTimeString()}
              </Text>
            </>
          ) : (
            <Text type="tertiary">暂无消息</Text>
          )}
        </div>
      )
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <div>
          {tags.slice(0, 2).map(tag => (
            <Tag key={tag} size="small" style={{ marginBottom: 2 }}>
              {tag}
            </Tag>
          ))}
          {tags.length > 2 && (
            <Tooltip content={tags.slice(2).join(', ')}>
              <Tag size="small">+{tags.length - 2}</Tag>
            </Tooltip>
          )}
        </div>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: Date) => (
        <div>
          <div>{date.toLocaleDateString()}</div>
          <Text type="tertiary" size="small">
            {date.toLocaleTimeString()}
          </Text>
        </div>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_, record: Group) => (
        <Space>
          <Tooltip content="查看详情">
            <Button
              icon={<IconEye />}
              size="small"
              onClick={() => handleViewGroup(record)}
            />
          </Tooltip>
          <Tooltip content="编辑">
            <Button
              icon={<IconEdit />}
              size="small"
              onClick={() => handleEditGroup(record)}
            />
          </Tooltip>
          {record.status === GroupStatus.ACTIVE && (
            <Tooltip content="归档">
              <Popconfirm
                title="确定要归档这个群聊吗？"
                onConfirm={() => handleArchiveGroup(record.id)}
              >
                <Button
                  icon={<IconArchive />}
                  size="small"
                  type="warning"
                />
              </Popconfirm>
            </Tooltip>
          )}
          <Tooltip content="删除">
            <Popconfirm
              title="确定要删除这个群聊吗？此操作不可恢复。"
              onConfirm={() => handleDeleteGroup(record.id)}
            >
              <Button
                icon={<IconDelete />}
                size="small"
                type="danger"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 页面标题和操作 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title heading={3}>群聊管理</Title>
          <Space>
            <Button
              icon={<IconRefresh />}
              onClick={loadGroups}
              loading={loading}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<IconPlus />}
              onClick={() => setShowCreateModal(true)}
            >
              创建群聊
            </Button>
          </Space>
        </div>

        {/* 搜索筛选 */}
        <Card>
          <Row gutter={16}>
            <Col span={6}>
              <Input
                prefix={<IconSearch />}
                placeholder="搜索群聊名称或描述"
                value={searchParams.keyword || ''}
                onChange={(value) => handleSearch('keyword', value)}
                showClear
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="群聊类型"
                value={searchParams.type}
                onChange={(value) => handleSearch('type', value)}
                showClear
              >
                <Option value={GroupType.CUSTOMER_SERVICE}>客服群</Option>
                <Option value={GroupType.SALES}>销售群</Option>
                <Option value={GroupType.SUPPORT}>技术支持群</Option>
                <Option value={GroupType.GENERAL}>通用群</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="群聊状态"
                value={searchParams.status}
                onChange={(value) => handleSearch('status', value)}
                showClear
              >
                <Option value={GroupStatus.ACTIVE}>活跃</Option>
                <Option value={GroupStatus.INACTIVE}>不活跃</Option>
                <Option value={GroupStatus.ARCHIVED}>已归档</Option>
                <Option value={GroupStatus.DISBANDED}>已解散</Option>
              </Select>
            </Col>
            <Col span={5}>
              <DatePicker
                type="dateRange"
                placeholder={['开始日期', '结束日期']}
                onChange={(dates) => {
                  if (dates && dates.length === 2) {
                    handleSearch('startDate', dates[0]);
                    handleSearch('endDate', dates[1]);
                  } else {
                    handleSearch('startDate', undefined);
                    handleSearch('endDate', undefined);
                  }
                }}
              />
            </Col>
            <Col span={5}>
              <Space>
                <Button onClick={handleResetSearch}>重置</Button>
              </Space>
            </Col>
          </Row>
        </Card>
      </div>

      {/* 群聊列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={groups}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 20);
            }
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 创建/编辑群聊模态框 */}
      <Modal
        title={editingGroup ? '编辑群聊' : '创建群聊'}
        visible={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          setEditingGroup(null);
        }}
        footer={null}
        width={800}
      >
        <GroupForm
          initialData={editingGroup ? {
            name: editingGroup.name,
            description: editingGroup.description,
            type: editingGroup.type,
            customerIds: editingGroup.customerIds,
            internalMemberIds: [], // 需要从成员列表中提取
            settings: editingGroup.settings,
            tags: editingGroup.tags
          } : undefined}
          customers={customers}
          onSubmit={editingGroup ? handleUpdateGroup : handleCreateGroup}
          onCancel={() => {
            setShowCreateModal(false);
            setEditingGroup(null);
          }}
        />
      </Modal>

      {/* 群聊详情模态框 */}
      <Modal
        title="群聊详情"
        visible={showDetailModal}
        onCancel={() => {
          setShowDetailModal(false);
          setSelectedGroup(null);
        }}
        footer={null}
        width={1000}
      >
        {selectedGroup && (
          <GroupDetail
            group={selectedGroup}
            onUpdate={loadGroups}
          />
        )}
      </Modal>
    </div>
  );
};

export default GroupList;