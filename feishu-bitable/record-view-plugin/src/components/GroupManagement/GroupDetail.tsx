// 群聊详情组件
import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Avatar,
  Tag,
  Button,
  Space,
  Table,
  Tabs,
  TabPane,
  Timeline,
  Empty,
  Badge,
  Typography,
  Row,
  Col,
  Divider,
  Modal,
  Form,
  Input,
  Select,
  Message,
  Popconfirm,
  List,
  Tooltip
} from '@douyinfe/semi-ui';
import {
  IconUsers,
  IconMessage,
  IconSetting,
  IconEdit,
  IconPlus,
  IconDelete,
  IconRefresh,
  IconClock,
  IconUser,
  IconMail,
  IconPhone,
  IconBuilding
} from '@douyinfe/semi-icons';
import {
  Group,
  GroupMember,
  GroupMessage,
  GroupLog,
  GroupStatus,
  GroupType,
  MemberRole
} from '../../types/group';
import groupService from '../../services/groupService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface GroupDetailProps {
  group: Group;
  onUpdate: () => void;
}

const GroupDetail: React.FC<GroupDetailProps> = ({ group, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [logs, setLogs] = useState<GroupLog[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    loadGroupData();
  }, [group.id]);

  // 加载群聊数据
  const loadGroupData = async () => {
    setLoading(true);
    try {
      // 加载群聊消息
      const messagesResponse = await groupService.getMessages(group.id);
      setMessages(messagesResponse.items);

      // 加载群聊日志
      const logsData = await groupService.getGroupLogs(group.id);
      setLogs(logsData);
    } catch (error) {
      console.error('加载群聊数据失败:', error);
      Message.error('加载群聊数据失败');
    } finally {
      setLoading(false);
    }
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

  // 获取角色标签
  const getRoleTag = (role: MemberRole) => {
    const roleConfig = {
      [MemberRole.OWNER]: { color: 'red', text: '群主' },
      [MemberRole.ADMIN]: { color: 'orange', text: '管理员' },
      [MemberRole.MEMBER]: { color: 'blue', text: '成员' },
      [MemberRole.GUEST]: { color: 'grey', text: '访客' }
    };
    
    const config = roleConfig[role];
    return <Tag color={config.color} size="small">{config.text}</Tag>;
  };

  // 成员表格列定义
  const memberColumns = [
    {
      title: '成员信息',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: GroupMember) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small" src={record.avatar}>
            {record.name.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {record.isInternal ? (
                <Tag color="blue" size="small">内部员工</Tag>
              ) : (
                <Tag color="green" size="small">外部客户</Tag>
              )}
              {getRoleTag(record.role)}
            </div>
          </div>
        </div>
      )
    },
    {
      title: '联系方式',
      key: 'contact',
      render: (_, record: GroupMember) => (
        <div>
          {record.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
              <IconMail size="small" />
              <Text size="small">{record.email}</Text>
            </div>
          )}
          {record.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <IconPhone size="small" />
              <Text size="small">{record.phone}</Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: '部门/职位',
      key: 'position',
      render: (_, record: GroupMember) => (
        <div>
          {record.department && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
              <IconBuilding size="small" />
              <Text size="small">{record.department}</Text>
            </div>
          )}
          {record.position && (
            <Text size="small" type="tertiary">{record.position}</Text>
          )}
        </div>
      )
    },
    {
      title: '加入时间',
      dataIndex: 'joinTime',
      key: 'joinTime',
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
      render: (_, record: GroupMember) => (
        <Space>
          <Button size="small" onClick={() => handleEditMember(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要移除这个成员吗？"
            onConfirm={() => handleRemoveMember(record.id)}
          >
            <Button size="small" type="danger">
              移除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 处理编辑成员
  const handleEditMember = (member: GroupMember) => {
    // 实现编辑成员逻辑
    console.log('编辑成员:', member);
  };

  // 处理移除成员
  const handleRemoveMember = async (memberId: string) => {
    try {
      await groupService.removeMembers(group.id, [memberId]);
      Message.success('成员移除成功');
      onUpdate();
    } catch (error) {
      console.error('移除成员失败:', error);
      Message.error('移除成员失败');
    }
  };

  // 处理添加成员
  const handleAddMembers = async (memberIds: string[]) => {
    try {
      await groupService.addMembers(group.id, memberIds);
      Message.success('成员添加成功');
      setShowAddMemberModal(false);
      onUpdate();
    } catch (error) {
      console.error('添加成员失败:', error);
      Message.error('添加成员失败');
    }
  };

  // 渲染群聊信息
  const renderGroupInfo = () => (
    <Card title="群聊信息" extra={
      <Button icon={<IconEdit />} onClick={() => setShowSettingsModal(true)}>
        编辑设置
      </Button>
    }>
      <Descriptions data={[
        {
          key: 'name',
          label: '群聊名称',
          value: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar src={group.avatar}>{group.name.charAt(0)}</Avatar>
              <Text strong>{group.name}</Text>
            </div>
          )
        },
        {
          key: 'type',
          label: '群聊类型',
          value: getTypeTag(group.type)
        },
        {
          key: 'status',
          label: '群聊状态',
          value: getStatusTag(group.status)
        },
        {
          key: 'memberCount',
          label: '成员数量',
          value: (
            <Badge count={group.memberCount} overflowCount={999}>
              <IconUsers size="large" />
            </Badge>
          )
        },
        {
          key: 'createdAt',
          label: '创建时间',
          value: (
            <div>
              <div>{group.createdAt.toLocaleDateString()}</div>
              <Text type="tertiary" size="small">
                {group.createdAt.toLocaleTimeString()}
              </Text>
            </div>
          )
        },
        {
          key: 'lastMessageTime',
          label: '最后活跃',
          value: group.lastMessageTime ? (
            <div>
              <div>{group.lastMessageTime.toLocaleDateString()}</div>
              <Text type="tertiary" size="small">
                {group.lastMessageTime.toLocaleTimeString()}
              </Text>
            </div>
          ) : (
            <Text type="tertiary">暂无消息</Text>
          )
        },
        {
          key: 'description',
          label: '群聊描述',
          value: group.description || <Text type="tertiary">暂无描述</Text>
        },
        {
          key: 'tags',
          label: '群聊标签',
          value: group.tags.length > 0 ? (
            <div>
              {group.tags.map(tag => (
                <Tag key={tag} style={{ marginBottom: 4, marginRight: 4 }}>
                  {tag}
                </Tag>
              ))}
            </div>
          ) : (
            <Text type="tertiary">暂无标签</Text>
          )
        },
        {
          key: 'settings',
          label: '群聊设置',
          value: (
            <div>
              <Row gutter={16}>
                <Col span={12}>
                  <Text size="small">
                    允许成员邀请: {group.settings.allowMemberInvite ? '是' : '否'}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text size="small">
                    允许@所有人: {group.settings.allowMemberAtAll ? '是' : '否'}
                  </Text>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Text size="small">
                    全员禁言: {group.settings.muteAll ? '是' : '否'}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text size="small">
                    自动回复: {group.settings.autoReply ? '是' : '否'}
                  </Text>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Text size="small">
                    最大成员数: {group.settings.maxMembers}人
                  </Text>
                </Col>
                <Col span={12}>
                  <Text size="small">
                    自动归档: {group.settings.autoArchiveDays}天
                  </Text>
                </Col>
              </Row>
            </div>
          )
        }
      ]} />
    </Card>
  );

  // 渲染成员列表
  const renderMembers = () => (
    <Card 
      title={`群聊成员 (${group.members.length})`}
      extra={
        <Button 
          icon={<IconPlus />} 
          onClick={() => setShowAddMemberModal(true)}
        >
          添加成员
        </Button>
      }
    >
      <Table
        columns={memberColumns}
        dataSource={group.members}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: false
        }}
      />
    </Card>
  );

  // 渲染消息列表
  const renderMessages = () => (
    <Card 
      title="群聊消息"
      extra={
        <Button icon={<IconRefresh />} onClick={loadGroupData} loading={loading}>
          刷新
        </Button>
      }
    >
      {messages.length > 0 ? (
        <List
          dataSource={messages}
          renderItem={(message: GroupMessage) => (
            <List.Item
              main={
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Avatar size="small" src={message.senderAvatar}>
                      {message.senderName.charAt(0)}
                    </Avatar>
                    <Text strong>{message.senderName}</Text>
                    {message.isFromBot && <Tag color="blue" size="small">机器人</Tag>}
                    <Text type="tertiary" size="small">
                      {message.timestamp.toLocaleString()}
                    </Text>
                  </div>
                  <div style={{ marginLeft: 32 }}>
                    <Paragraph>{message.content}</Paragraph>
                    {message.attachments && message.attachments.length > 0 && (
                      <div>
                        {message.attachments.map(attachment => (
                          <Tag key={attachment.id} style={{ marginRight: 4 }}>
                            {attachment.name}
                          </Tag>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              }
            />
          )}
          style={{ maxHeight: 400, overflow: 'auto' }}
        />
      ) : (
        <Empty description="暂无消息" />
      )}
    </Card>
  );

  // 渲染操作日志
  const renderLogs = () => (
    <Card title="操作日志">
      {logs.length > 0 ? (
        <Timeline>
          {logs.map((log: GroupLog) => (
            <Timeline.Item
              key={log.id}
              time={log.timestamp.toLocaleString()}
              type={log.action === 'create' ? 'success' : 'primary'}
            >
              <div>
                <Text strong>{log.operatorName}</Text>
                <Text> {log.description}</Text>
              </div>
              {log.details && (
                <Text type="tertiary" size="small">
                  {JSON.stringify(log.details)}
                </Text>
              )}
            </Timeline.Item>
          ))}
        </Timeline>
      ) : (
        <Empty description="暂无操作日志" />
      )}
    </Card>
  );

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="基本信息" itemKey="info">
          <Space vertical style={{ width: '100%' }} spacing={16}>
            {renderGroupInfo()}
          </Space>
        </TabPane>
        
        <TabPane tab="群聊成员" itemKey="members">
          {renderMembers()}
        </TabPane>
        
        <TabPane tab="群聊消息" itemKey="messages">
          {renderMessages()}
        </TabPane>
        
        <TabPane tab="操作日志" itemKey="logs">
          {renderLogs()}
        </TabPane>
      </Tabs>

      {/* 添加成员模态框 */}
      <Modal
        title="添加群聊成员"
        visible={showAddMemberModal}
        onCancel={() => setShowAddMemberModal(false)}
        footer={null}
        width={600}
      >
        <div style={{ padding: 16 }}>
          <Text>添加成员功能开发中...</Text>
          {/* 这里可以添加成员选择组件 */}
        </div>
      </Modal>

      {/* 群聊设置模态框 */}
      <Modal
        title="群聊设置"
        visible={showSettingsModal}
        onCancel={() => setShowSettingsModal(false)}
        footer={null}
        width={800}
      >
        <div style={{ padding: 16 }}>
          <Text>群聊设置功能开发中...</Text>
          {/* 这里可以添加群聊设置表单 */}
        </div>
      </Modal>
    </div>
  );
};

export default GroupDetail;