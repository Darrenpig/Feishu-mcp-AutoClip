import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Select,
  DatePicker,
  Button,
  Space,
  Typography,
  Tag,
  Empty,
  Spin,
  Message,
} from '@douyinfe/semi-ui';
import {
  IconRefresh,
  IconTrendingUp,
  IconTrendingDown,
  IconUser,
  IconUserGroup,
  IconPhone,
  IconMail,
} from '@douyinfe/semi-icons';
import {
  CustomerStats as CustomerStatsType,
  CustomerStatus,
  IntentionLevel,
  CustomerSource,
} from '../../types/customer';
import customerService from '../../services/customerService';

const { Title, Text } = Typography;
const { Option } = Select;

// 状态颜色映射
const STATUS_COLORS = {
  [CustomerStatus.NEW]: '#1890ff',
  [CustomerStatus.CONTACTED]: '#13c2c2',
  [CustomerStatus.INTERESTED]: '#52c41a',
  [CustomerStatus.NEGOTIATING]: '#fa8c16',
  [CustomerStatus.CLOSED_WON]: '#52c41a',
  [CustomerStatus.CLOSED_LOST]: '#f5222d',
  [CustomerStatus.INACTIVE]: '#8c8c8c',
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

const CustomerStats: React.FC = () => {
  const [stats, setStats] = useState<CustomerStatsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // 加载统计数据
  const loadStats = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateRange) {
        params.startTime = dateRange[0].getTime();
        params.endTime = dateRange[1].getTime();
      }

      const response = await customerService.getCustomerStats(params);
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        Message.error(response.message || '加载统计数据失败');
      }
    } catch (error) {
      Message.error('加载统计数据失败');
      console.error('Load stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    loadStats();
  }, [dateRange, refreshKey]);

  // 处理刷新
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // 处理日期范围变化
  const handleDateRangeChange = (dates: [Date, Date] | null) => {
    setDateRange(dates);
  };

  // 计算转化率
  const calculateConversionRate = (converted: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((converted / total) * 100);
  };

  // 获取状态分布数据
  const getStatusDistribution = () => {
    if (!stats) return [];
    
    return Object.entries(stats.statusDistribution).map(([status, count]) => ({
      status: status as CustomerStatus,
      label: STATUS_LABELS[status as CustomerStatus],
      count,
      percentage: stats.totalCustomers > 0 ? Math.round((count / stats.totalCustomers) * 100) : 0,
      color: STATUS_COLORS[status as CustomerStatus],
    }));
  };

  // 获取来源分布数据
  const getSourceDistribution = () => {
    if (!stats) return [];
    
    return Object.entries(stats.sourceDistribution).map(([source, count]) => ({
      source: source as CustomerSource,
      label: SOURCE_LABELS[source as CustomerSource],
      count,
      percentage: stats.totalCustomers > 0 ? Math.round((count / stats.totalCustomers) * 100) : 0,
    }));
  };

  // 获取意向等级分布数据
  const getIntentionDistribution = () => {
    if (!stats) return [];
    
    return Object.entries(stats.intentionDistribution).map(([level, count]) => ({
      level: level as IntentionLevel,
      label: INTENTION_LABELS[level as IntentionLevel],
      count,
      percentage: stats.totalCustomers > 0 ? Math.round((count / stats.totalCustomers) * 100) : 0,
    }));
  };

  if (loading && !stats) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: 24 }}>
        <Empty
          title="暂无统计数据"
          description="请先添加客户数据"
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 头部操作栏 */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title heading={4} style={{ margin: 0 }}>数据统计</Title>
          </Col>
          <Col>
            <Space>
              <DatePicker
                type="dateRange"
                placeholder={['开始日期', '结束日期']}
                onChange={handleDateRangeChange}
                style={{ width: 300 }}
              />
              <Button
                icon={<IconRefresh />}
                onClick={handleRefresh}
                loading={loading}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* 核心指标卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="客户总数"
              value={stats.totalCustomers}
              prefix={<IconUser />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="新增客户"
              value={stats.newCustomers}
              prefix={<IconTrendingUp />}
              valueStyle={{ color: '#52c41a' }}
              suffix={`(${calculateConversionRate(stats.newCustomers, stats.totalCustomers)}%)`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成交客户"
              value={stats.closedWonCustomers}
              prefix={<IconUserGroup />}
              valueStyle={{ color: '#fa8c16' }}
              suffix={`(${calculateConversionRate(stats.closedWonCustomers, stats.totalCustomers)}%)`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="转化率"
              value={calculateConversionRate(stats.closedWonCustomers, stats.totalCustomers)}
              suffix="%"
              prefix={stats.closedWonCustomers > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              valueStyle={{
                color: stats.closedWonCustomers > 0 ? '#52c41a' : '#f5222d'
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {/* 客户状态分布 */}
        <Col span={12}>
          <Card title="客户状态分布" style={{ height: 400 }}>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {getStatusDistribution().map(item => (
                <div key={item.status} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Space>
                      <Tag color={item.color} size="small">{item.label}</Tag>
                      <Text>{item.count}</Text>
                    </Space>
                    <Text type="tertiary">{item.percentage}%</Text>
                  </div>
                  <Progress
                    percent={item.percentage}
                    stroke={item.color}
                    showInfo={false}
                    size="small"
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* 来源渠道分布 */}
        <Col span={12}>
          <Card title="来源渠道分布" style={{ height: 400 }}>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {getSourceDistribution().map(item => (
                <div key={item.source} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Space>
                      <Text strong>{item.label}</Text>
                      <Text>{item.count}</Text>
                    </Space>
                    <Text type="tertiary">{item.percentage}%</Text>
                  </div>
                  <Progress
                    percent={item.percentage}
                    stroke="#1890ff"
                    showInfo={false}
                    size="small"
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {/* 意向等级分布 */}
        <Col span={12}>
          <Card title="意向等级分布" style={{ height: 300 }}>
            <div style={{ maxHeight: 220, overflowY: 'auto' }}>
              {getIntentionDistribution().map(item => (
                <div key={item.level} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Space>
                      <Text strong>{item.label}</Text>
                      <Text>{item.count}</Text>
                    </Space>
                    <Text type="tertiary">{item.percentage}%</Text>
                  </div>
                  <Progress
                    percent={item.percentage}
                    stroke={item.level === IntentionLevel.HIGH ? '#f5222d' : 
                           item.level === IntentionLevel.MEDIUM ? '#fa8c16' : '#1890ff'}
                    showInfo={false}
                    size="small"
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* 联系方式统计 */}
        <Col span={12}>
          <Card title="联系方式统计" style={{ height: 300 }}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <IconPhone size="large" style={{ color: '#1890ff', marginBottom: 8 }} />
                  <div>
                    <Text strong style={{ fontSize: 24, display: 'block' }}>
                      {stats.contactStats?.phoneCount || 0}
                    </Text>
                    <Text type="tertiary">有手机号</Text>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text size="small" type="tertiary">
                      {calculateConversionRate(stats.contactStats?.phoneCount || 0, stats.totalCustomers)}%
                    </Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <IconMail size="large" style={{ color: '#52c41a', marginBottom: 8 }} />
                  <div>
                    <Text strong style={{ fontSize: 24, display: 'block' }}>
                      {stats.contactStats?.emailCount || 0}
                    </Text>
                    <Text type="tertiary">有邮箱</Text>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text size="small" type="tertiary">
                      {calculateConversionRate(stats.contactStats?.emailCount || 0, stats.totalCustomers)}%
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 销售人员统计 */}
      {stats.salesStats && stats.salesStats.length > 0 && (
        <Row gutter={16}>
          <Col span={24}>
            <Card title="销售人员统计">
              <Table
                columns={[
                  {
                    title: '销售人员',
                    dataIndex: 'salesName',
                    width: 150,
                  },
                  {
                    title: '负责客户数',
                    dataIndex: 'customerCount',
                    width: 120,
                    sorter: (a, b) => a.customerCount - b.customerCount,
                  },
                  {
                    title: '成交客户数',
                    dataIndex: 'closedWonCount',
                    width: 120,
                    sorter: (a, b) => a.closedWonCount - b.closedWonCount,
                  },
                  {
                    title: '成交率',
                    dataIndex: 'conversionRate',
                    width: 100,
                    render: (rate: number) => `${rate}%`,
                    sorter: (a, b) => a.conversionRate - b.conversionRate,
                  },
                  {
                    title: '平均跟进天数',
                    dataIndex: 'avgFollowUpDays',
                    width: 130,
                    render: (days: number) => `${days} 天`,
                    sorter: (a, b) => a.avgFollowUpDays - b.avgFollowUpDays,
                  },
                ]}
                dataSource={stats.salesStats}
                rowKey="salesName"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default CustomerStats;