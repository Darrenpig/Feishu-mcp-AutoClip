import React, { useState, useEffect } from 'react';
import {
  Card,
  Avatar,
  Typography,
  Tag,
  Space,
  Button,
  Divider,
  Row,
  Col,
  Timeline,
  Empty,
  Spin,
  Descriptions,
  Badge,
  Tooltip,
  Message,
} from '@douyinfe/semi-ui';
import {
  IconUser,
  IconPhone,
  IconMail,
  IconBuilding,
  IconGlobe,
  IconCalendar,
  IconEdit,
  IconPlus,
  IconMessage,
  IconRefresh,
  IconLocation,
} from '@douyinfe/semi-icons';
import {
  Customer,
  CustomerLog,
  CustomerStatus,
  IntentionLevel,
  CustomerSource,
} from '../../types/customer';
import customerService from '../../services/customerService';

const { Text, Title, Paragraph } = Typography;

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

interface CustomerDetailProps {
  customer: Customer;
  onEdit: () => void;
  onCreateGroup: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onEdit, onCreateGroup }) => {
  const [logs, setLogs] = useState<CustomerLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // 加载客户日志
  const loadCustomerLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await customerService.getCustomerLogs(customer.id);
      if (response.success && response.data) {
        setLogs(response.data);
      } else {
        Message.error(response.message || '加载客户日志失败');
      }
    } catch (error) {
      Message.error('加载客户日志失败');
      console.error('Load customer logs error:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerLogs();
  }, [customer.id]);

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  // 获取日志类型颜色
  const getLogTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      create: 'blue',
      update: 'orange',
      contact: 'green',
      note: 'purple',
      status_change: 'red',
    };
    return colorMap[type] || 'grey';
  };

  // 获取日志类型标签
  const getLogTypeLabel = (type: string) => {
    const labelMap: Record<string, string> = {
      create: '创建',
      update: '更新',
      contact: '联系',
      note: '备注',
      status_change: '状态变更',
    };
    return labelMap[type] || type;
  };

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={24}>
        {/* 左侧：基本信息 */}
        <Col span={16}>
          <Card title="基本信息" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar
                    size="large"
                    src={customer.avatar}
                    style={{ marginBottom: 8 }}
                  >
                    {!customer.avatar && customer.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <Title heading={5} style={{ margin: 0 }}>
                      {customer.name}
                    </Title>
                    {customer.position && (
                      <Text type="tertiary" size="small">
                        {customer.position}
                      </Text>
                    )}
                  </div>
                </div>
              </Col>
              <Col span={18}>
                <Descriptions
                  data={[
                    {
                      key: 'phone',
                      label: '手机号码',
                      value: customer.phone ? (
                        <Space>
                          <IconPhone size="small" />
                          <Text copyable>{customer.phone}</Text>
                        </Space>
                      ) : (
                        <Text type="tertiary">未填写</Text>
                      ),
                    },
                    {
                      key: 'email',
                      label: '邮箱地址',
                      value: customer.email ? (
                        <Space>
                          <IconMail size="small" />
                          <Text copyable>{customer.email}</Text>
                        </Space>
                      ) : (
                        <Text type="tertiary">未填写</Text>
                      ),
                    },
                    {
                      key: 'company',
                      label: '公司名称',
                      value: customer.company ? (
                        <Space>
                          <IconBuilding size="small" />
                          <Text>{customer.company}</Text>
                        </Space>
                      ) : (
                        <Text type="tertiary">未填写</Text>
                      ),
                    },
                    {
                      key: 'website',
                      label: '公司网站',
                      value: customer.website ? (
                        <Space>
                          <IconGlobe size="small" />
                          <Text link={{ href: customer.website, target: '_blank' }}>
                            {customer.website}
                          </Text>
                        </Space>
                      ) : (
                        <Text type="tertiary">未填写</Text>
                      ),
                    },
                    {
                      key: 'address',
                      label: '地址',
                      value: customer.address ? (
                        <Space>
                          <IconLocation size="small" />
                          <Text>{customer.address}</Text>
                        </Space>
                      ) : (
                        <Text type="tertiary">未填写</Text>
                      ),
                    },
                  ]}
                  row
                  size="small"
                />
              </Col>
            </Row>
          </Card>

          <Card title="销售信息" style={{ marginBottom: 16 }}>
            <Descriptions
              data={[
                {
                  key: 'status',
                  label: '客户状态',
                  value: (
                    <Tag color={STATUS_COLORS[customer.status]} size="large">
                      {STATUS_LABELS[customer.status]}
                    </Tag>
                  ),
                },
                {
                  key: 'intentionLevel',
                  label: '意向等级',
                  value: (
                    <Tag color={INTENTION_COLORS[customer.intentionLevel]} size="large">
                      {INTENTION_LABELS[customer.intentionLevel]}
                    </Tag>
                  ),
                },
                {
                  key: 'source',
                  label: '来源渠道',
                  value: <Text>{SOURCE_LABELS[customer.source]}</Text>,
                },
                {
                  key: 'assignedSales',
                  label: '分配销售',
                  value: customer.assignedSales ? (
                    <Space>
                      <IconUser size="small" />
                      <Text>{customer.assignedSales}</Text>
                    </Space>
                  ) : (
                    <Text type="tertiary">未分配</Text>
                  ),
                },
                {
                  key: 'lastContactTime',
                  label: '最后联系时间',
                  value: customer.lastContactTime ? (
                    <Space>
                      <IconCalendar size="small" />
                      <Text>{formatTime(customer.lastContactTime)}</Text>
                    </Space>
                  ) : (
                    <Text type="tertiary">未联系</Text>
                  ),
                },
                {
                  key: 'nextFollowUpTime',
                  label: '下次跟进时间',
                  value: customer.nextFollowUpTime ? (
                    <Space>
                      <IconCalendar size="small" />
                      <Text
                        type={customer.nextFollowUpTime < Date.now() ? 'danger' : 'primary'}
                      >
                        {formatTime(customer.nextFollowUpTime)}
                      </Text>
                      {customer.nextFollowUpTime < Date.now() && (
                        <Badge dot type="danger" />
                      )}
                    </Space>
                  ) : (
                    <Text type="tertiary">未设置</Text>
                  ),
                },
              ]}
              row
              size="small"
            />
          </Card>

          {customer.tags && customer.tags.length > 0 && (
            <Card title="客户标签" style={{ marginBottom: 16 }}>
              <Space wrap>
                {customer.tags.map(tag => (
                  <Tag key={tag} color="blue">
                    {tag}
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          {customer.notes && (
            <Card title="备注信息" style={{ marginBottom: 16 }}>
              <Paragraph>{customer.notes}</Paragraph>
            </Card>
          )}
        </Col>

        {/* 右侧：操作和日志 */}
        <Col span={8}>
          <Card title="快速操作" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<IconEdit />}
                block
                onClick={onEdit}
              >
                编辑客户信息
              </Button>
              <Button
                type="secondary"
                icon={<IconMessage />}
                block
                onClick={onCreateGroup}
              >
                创建群聊
              </Button>
              <Button
                icon={<IconPlus />}
                block
                onClick={() => {
                  // TODO: 添加跟进记录
                  Message.info('功能开发中');
                }}
              >
                添加跟进记录
              </Button>
            </Space>
          </Card>

          <Card
            title={
              <Space>
                <span>操作日志</span>
                <Button
                  theme="borderless"
                  type="tertiary"
                  icon={<IconRefresh />}
                  size="small"
                  onClick={loadCustomerLogs}
                  loading={logsLoading}
                />
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {logsLoading ? (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <Spin />
                </div>
              ) : logs.length > 0 ? (
                <Timeline>
                  {logs.map(log => (
                    <Timeline.Item
                      key={log.id}
                      time={formatTime(log.createTime)}
                      type={getLogTypeColor(log.type) as any}
                    >
                      <div>
                        <Space>
                          <Tag
                            color={getLogTypeColor(log.type)}
                            size="small"
                          >
                            {getLogTypeLabel(log.type)}
                          </Tag>
                          {log.operator && (
                            <Text size="small" type="tertiary">
                              {log.operator}
                            </Text>
                          )}
                        </Space>
                        <div style={{ marginTop: 4 }}>
                          <Text size="small">{log.content}</Text>
                        </div>
                        {log.details && (
                          <div style={{ marginTop: 4 }}>
                            <Text size="small" type="tertiary">
                              {log.details}
                            </Text>
                          </div>
                        )}
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  title="暂无操作日志"
                  description="客户的操作记录将在这里显示"
                />
              )}
            </div>
          </Card>

          <Card title="客户统计">
            <Descriptions
              data={[
                {
                  key: 'createTime',
                  label: '创建时间',
                  value: formatTime(customer.createTime),
                },
                {
                  key: 'updateTime',
                  label: '更新时间',
                  value: formatTime(customer.updateTime),
                },
                {
                  key: 'contactCount',
                  label: '联系次数',
                  value: (
                    <Badge
                      count={logs.filter(log => log.type === 'contact').length}
                      type="primary"
                    />
                  ),
                },
                {
                  key: 'daysSinceCreate',
                  label: '创建天数',
                  value: Math.floor((Date.now() - customer.createTime) / (1000 * 60 * 60 * 24)),
                },
              ]}
              row
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerDetail;