// 群聊数据统计组件
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Typography,
  Space,
  Button,
  DatePicker,
  Select,
  Spin,
  Empty,
  Badge,
  Divider,
  Tag
} from '@douyinfe/semi-ui';
import {
  IconUsers,
  IconMessage,
  IconTrendingUp,
  IconRefresh,
  IconDownload,
  IconCalendar
} from '@douyinfe/semi-icons';
import { GroupStats as GroupStatsType, Group } from '../../types/group';
import groupService from '../../services/groupService';

const { Title, Text } = Typography;
const { Option } = Select;

interface GroupStatsProps {
  selectedGroupId?: string;
}

const GroupStats: React.FC<GroupStatsProps> = ({ selectedGroupId }) => {
  const [stats, setStats] = useState<GroupStatsType | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()]);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadStats();
    loadGroups();
  }, [dateRange, selectedType]);

  // 加载统计数据
  const loadStats = async () => {
    setLoading(true);
    try {
      const statsData = await groupService.getGroupStats();
      setStats(statsData);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载群聊列表
  const loadGroups = async () => {
    try {
      const response = await groupService.getGroups({ page: 1, pageSize: 100 });
      setGroups(response.data);
    } catch (error) {
      console.error('加载群聊列表失败:', error);
    }
  };

  // 导出统计数据
  const exportStats = () => {
    // TODO: 实现导出功能
    console.log('导出统计数据');
  };

  // 群聊表格列定义
  const groupColumns = [
    {
      title: '群聊名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Group) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="tertiary" size="small">{record.description}</Text>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap = {
          customer_service: { text: '客服群', color: 'blue' },
          sales: { text: '销售群', color: 'green' },
          support: { text: '技术支持', color: 'orange' },
          general: { text: '通用群', color: 'purple' }
        };
        const config = typeMap[type as keyof typeof typeMap] || { text: type, color: 'grey' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '成员数',
      dataIndex: 'memberCount',
      key: 'memberCount',
      render: (count: number) => (
        <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          active: { text: '活跃', color: 'green' },
          inactive: { text: '不活跃', color: 'orange' },
          archived: { text: '已归档', color: 'grey' }
        };
        const config = statusMap[status as keyof typeof statusMap] || { text: status, color: 'grey' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActiveAt',
      key: 'lastActiveAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-'
    }
  ];

  if (loading && !stats) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>加载统计数据中...</Text>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: 24 }}>
        <Empty
          title="暂无数据"
          description="暂时没有群聊统计数据"
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 页面标题和操作 */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title heading={3}>群聊数据统计</Title>
          <Text type="tertiary">查看群聊活跃度和成员分析</Text>
        </div>
        <Space>
          <DatePicker
            type="dateRange"
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Date, Date])}
            prefix={<IconCalendar />}
          />
          <Select
            value={selectedType}
            onChange={setSelectedType}
            style={{ width: 120 }}
          >
            <Option value="all">全部类型</Option>
            <Option value="customer_service">客服群</Option>
            <Option value="sales">销售群</Option>
            <Option value="support">技术支持</Option>
            <Option value="general">通用群</Option>
          </Select>
          <Button
            icon={<IconRefresh />}
            onClick={loadStats}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            type="primary"
            icon={<IconDownload />}
            onClick={exportStats}
          >
            导出数据
          </Button>
        </Space>
      </div>

      {/* 总体统计 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总群聊数"
              value={stats.totalGroups}
              prefix={<IconUsers />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃群聊"
              value={stats.activeGroups}
              prefix={<IconTrendingUp />}
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${stats.totalGroups}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总成员数"
              value={stats.totalMembers}
              prefix={<IconUsers />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均成员数"
              value={Math.round(stats.averageMembersPerGroup)}
              suffix="人/群"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 消息统计 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日消息数"
              value={stats.dailyMessageCount}
              prefix={<IconMessage />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="本周消息数"
              value={stats.weeklyMessageCount}
              prefix={<IconMessage />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="本月消息数"
              value={stats.monthlyMessageCount}
              prefix={<IconMessage />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 群聊类型和状态分布 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="群聊类型分布">
            <Space vertical style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>客服群</Text>
                <Badge count={stats.groupsByType.customer_service} style={{ backgroundColor: '#1890ff' }} />
              </div>
              <Progress
                percent={stats.totalGroups > 0 ? (stats.groupsByType.customer_service / stats.totalGroups) * 100 : 0}
                showInfo={false}
                stroke="#1890ff"
              />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>销售群</Text>
                <Badge count={stats.groupsByType.sales} style={{ backgroundColor: '#52c41a' }} />
              </div>
              <Progress
                percent={stats.totalGroups > 0 ? (stats.groupsByType.sales / stats.totalGroups) * 100 : 0}
                showInfo={false}
                stroke="#52c41a"
              />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>技术支持群</Text>
                <Badge count={stats.groupsByType.support} style={{ backgroundColor: '#fa8c16' }} />
              </div>
              <Progress
                percent={stats.totalGroups > 0 ? (stats.groupsByType.support / stats.totalGroups) * 100 : 0}
                showInfo={false}
                stroke="#fa8c16"
              />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>通用群</Text>
                <Badge count={stats.groupsByType.general} style={{ backgroundColor: '#722ed1' }} />
              </div>
              <Progress
                percent={stats.totalGroups > 0 ? (stats.groupsByType.general / stats.totalGroups) * 100 : 0}
                showInfo={false}
                stroke="#722ed1"
              />
            </Space>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="群聊状态分布">
            <Space vertical style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>活跃群聊</Text>
                <Badge count={stats.activeGroups} style={{ backgroundColor: '#52c41a' }} />
              </div>
              <Progress
                percent={stats.totalGroups > 0 ? (stats.activeGroups / stats.totalGroups) * 100 : 0}
                showInfo={false}
                stroke="#52c41a"
              />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>不活跃群聊</Text>
                <Badge count={stats.inactiveGroups} style={{ backgroundColor: '#fa8c16' }} />
              </div>
              <Progress
                percent={stats.totalGroups > 0 ? (stats.inactiveGroups / stats.totalGroups) * 100 : 0}
                showInfo={false}
                stroke="#fa8c16"
              />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>已归档群聊</Text>
                <Badge count={stats.archivedGroups} style={{ backgroundColor: '#8c8c8c' }} />
              </div>
              <Progress
                percent={stats.totalGroups > 0 ? (stats.archivedGroups / stats.totalGroups) * 100 : 0}
                showInfo={false}
                stroke="#8c8c8c"
              />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 群聊详细列表 */}
      <Card title="群聊详细信息">
        <Table
          columns={groupColumns}
          dataSource={groups}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default GroupStats;