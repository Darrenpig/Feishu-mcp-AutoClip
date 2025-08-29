import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Select,
  DatePicker,
  Space,
  Typography,
  Spin,
  Table,
  Progress,
  Tag,
  Tooltip,
  Modal,
  Form,
  Input,
  Switch,
  message
} from '@douyinfe/semi-ui';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconMessage,
  IconRobot,
  IconRefresh,
  IconDownload,
  IconSetting,
  IconPlus,
  IconEdit,
  IconDelete
} from '@douyinfe/semi-icons';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import analyticsService from '../../services/analyticsService';
import {
  OverallStats,
  TimeSeriesData,
  RankingData,
  TimeRange,
  ChartType,
  ExportConfig,
  DashboardConfig
} from '../../types/analytics';

const { Title, Text } = Typography;
const { Option } = Select;

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.LAST_7_DAYS);
  const [timeSeriesData, setTimeSeriesData] = useState<{
    customerAcquisition: TimeSeriesData[];
    groupActivity: TimeSeriesData[];
    botPerformance: TimeSeriesData[];
  }>({ customerAcquisition: [], groupActivity: [], botPerformance: [] });
  const [rankingData, setRankingData] = useState<{
    topAgents: RankingData[];
    topChannels: RankingData[];
    topGroups: RankingData[];
  }>({ topAgents: [], topChannels: [], topGroups: [] });
  const [dashboards, setDashboards] = useState<DashboardConfig[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState<string>('');
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [dashboardModalVisible, setDashboardModalVisible] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState<DashboardConfig | null>(null);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const query = { timeRange };
      
      // 并行加载所有数据
      const [overallStats, customerData, groupData, botData, agentRanking, channelRanking, groupRanking] = await Promise.all([
        analyticsService.getOverallStats(query),
        analyticsService.getTimeSeriesData('customer_acquisition', query),
        analyticsService.getTimeSeriesData('group_activity', query),
        analyticsService.getTimeSeriesData('bot_performance', query),
        analyticsService.getRankingData('top_agents', query),
        analyticsService.getRankingData('top_channels', query),
        analyticsService.getRankingData('top_groups', query)
      ]);

      setStats(overallStats);
      setTimeSeriesData({
        customerAcquisition: customerData,
        groupActivity: groupData,
        botPerformance: botData
      });
      setRankingData({
        topAgents: agentRanking,
        topChannels: channelRanking,
        topGroups: groupRanking
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载仪表板列表
  const loadDashboards = async () => {
    try {
      const dashboardList = await analyticsService.getDashboards();
      setDashboards(dashboardList);
      if (dashboardList.length > 0 && !currentDashboard) {
        const defaultDashboard = dashboardList.find(d => d.isDefault) || dashboardList[0];
        setCurrentDashboard(defaultDashboard.id);
      }
    } catch (error) {
      console.error('加载仪表板失败:', error);
    }
  };

  useEffect(() => {
    loadData();
    loadDashboards();
  }, [timeRange]);

  // 渲染统计卡片
  const renderStatsCards = () => {
    if (!stats) return null;

    const cards = [
      {
        title: '总客户数',
        value: stats.customerAcquisition.totalCustomers,
        suffix: '人',
        icon: <IconUsers size="large" />,
        color: '#1890ff',
        change: '+12%'
      },
      {
        title: '新增客户',
        value: stats.customerAcquisition.newCustomers,
        suffix: '人',
        icon: <IconTrendingUp size="large" />,
        color: '#52c41a',
        change: '+8%'
      },
      {
        title: '活跃群聊',
        value: stats.groupChat.activeGroups,
        suffix: '个',
        icon: <IconMessage size="large" />,
        color: '#fa8c16',
        change: '+5%'
      },
      {
        title: '机器人回复率',
        value: (stats.bot.autoReplyRate * 100).toFixed(1),
        suffix: '%',
        icon: <IconRobot size="large" />,
        color: '#722ed1',
        change: '+2%'
      }
    ];

    return (
      <Row gutter={[16, 16]}>
        {cards.map((card, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic
                title={card.title}
                value={card.value}
                suffix={card.suffix}
                prefix={<div style={{ color: card.color }}>{card.icon}</div>}
                valueStyle={{ color: card.color }}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="success" size="small">
                  {card.change} 较上期
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // 渲染时间序列图表
  const renderTimeSeriesChart = (title: string, data: TimeSeriesData[], height: number = 300) => {
    if (!data || data.length === 0) return null;

    const colors = ['#1890ff', '#52c41a', '#fa8c16', '#722ed1', '#13c2c2', '#f5222d'];

    return (
      <Card title={title} style={{ marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="label" 
              type="category"
              allowDuplicatedCategory={false}
            />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            {data.map((series, index) => (
              <Line
                key={series.name}
                dataKey="value"
                data={series.data}
                name={series.name}
                stroke={series.color || colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>
    );
  };

  // 渲染排行榜
  const renderRankingTable = (title: string, data: RankingData[]) => {
    const columns = [
      {
        title: '排名',
        dataIndex: 'rank',
        key: 'rank',
        width: 60,
        render: (rank: number) => (
          <Tag color={rank <= 3 ? 'gold' : 'default'}>
            {rank}
          </Tag>
        )
      },
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '数值',
        dataIndex: 'value',
        key: 'value',
        render: (value: number) => value.toLocaleString()
      },
      {
        title: '变化',
        dataIndex: 'change',
        key: 'change',
        render: (change: number, record: RankingData) => {
          const icon = record.trend === 'up' ? <IconTrendingUp /> : 
                      record.trend === 'down' ? <IconTrendingDown /> : null;
          const color = record.trend === 'up' ? '#52c41a' : 
                       record.trend === 'down' ? '#f5222d' : '#8c8c8c';
          return (
            <Space>
              <span style={{ color }}>{icon}</span>
              <span style={{ color }}>{change > 0 ? '+' : ''}{change}</span>
            </Space>
          );
        }
      }
    ];

    return (
      <Card title={title} style={{ marginBottom: 16 }}>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          size="small"
          rowKey="rank"
        />
      </Card>
    );
  };

  // 渲染渠道分布饼图
  const renderChannelPieChart = () => {
    if (!stats?.channels) return null;

    const data = stats.channels.map(channel => ({
      name: channel.channelName,
      value: channel.customerCount,
      fill: ['#1890ff', '#52c41a', '#fa8c16', '#722ed1'][stats.channels.indexOf(channel) % 4]
    }));

    return (
      <Card title="渠道分布" style={{ marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <RechartsTooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    );
  };

  // 导出数据
  const handleExport = async (values: any) => {
    try {
      const config: ExportConfig = {
        format: values.format,
        timeRange,
        metrics: values.metrics,
        includeCharts: values.includeCharts
      };
      
      const downloadUrl = await analyticsService.exportData(config);
      message.success('导出成功，正在下载...');
      
      // 模拟下载
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `analytics_${Date.now()}.${config.format}`;
      link.click();
      
      setExportModalVisible(false);
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败');
    }
  };

  // 保存仪表板
  const handleSaveDashboard = async (values: any) => {
    try {
      if (editingDashboard) {
        await analyticsService.updateDashboard(editingDashboard.id, values);
        message.success('仪表板更新成功');
      } else {
        await analyticsService.createDashboard({
          ...values,
          widgets: [],
          layout: { columns: 12, rowHeight: 150, margin: [10, 10], containerPadding: [20, 20] },
          filters: [],
          refreshInterval: 300,
          isDefault: false
        });
        message.success('仪表板创建成功');
      }
      
      setDashboardModalVisible(false);
      setEditingDashboard(null);
      loadDashboards();
    } catch (error) {
      console.error('保存仪表板失败:', error);
      message.error('保存仪表板失败');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 头部工具栏 */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title heading={3} style={{ margin: 0 }}>数据分析</Title>
          <Text type="secondary">实时监控业务数据和关键指标</Text>
        </div>
        <Space>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
          >
            <Option value={TimeRange.TODAY}>今天</Option>
            <Option value={TimeRange.YESTERDAY}>昨天</Option>
            <Option value={TimeRange.LAST_7_DAYS}>最近7天</Option>
            <Option value={TimeRange.LAST_30_DAYS}>最近30天</Option>
            <Option value={TimeRange.LAST_90_DAYS}>最近90天</Option>
          </Select>
          <Button
            icon={<IconRefresh />}
            onClick={loadData}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            icon={<IconDownload />}
            onClick={() => setExportModalVisible(true)}
          >
            导出
          </Button>
          <Button
            icon={<IconPlus />}
            type="primary"
            onClick={() => {
              setEditingDashboard(null);
              setDashboardModalVisible(true);
            }}
          >
            新建仪表板
          </Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        {/* 统计卡片 */}
        {renderStatsCards()}

        {/* 图表区域 */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col span={16}>
            {renderTimeSeriesChart('客户获取趋势', timeSeriesData.customerAcquisition)}
            {renderTimeSeriesChart('群聊活跃度', timeSeriesData.groupActivity)}
            {renderTimeSeriesChart('机器人性能', timeSeriesData.botPerformance)}
          </Col>
          <Col span={8}>
            {renderChannelPieChart()}
            {renderRankingTable('客服排行榜', rankingData.topAgents)}
            {renderRankingTable('渠道排行榜', rankingData.topChannels)}
            {renderRankingTable('群聊排行榜', rankingData.topGroups)}
          </Col>
        </Row>
      </Spin>

      {/* 导出对话框 */}
      <Modal
        title="导出数据"
        visible={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={null}
      >
        <Form onSubmit={handleExport}>
          <Form.Select
            field="format"
            label="导出格式"
            placeholder="选择导出格式"
            rules={[{ required: true, message: '请选择导出格式' }]}
          >
            <Option value="xlsx">Excel (.xlsx)</Option>
            <Option value="csv">CSV (.csv)</Option>
            <Option value="pdf">PDF (.pdf)</Option>
          </Form.Select>
          
          <Form.CheckboxGroup
            field="metrics"
            label="导出指标"
            direction="vertical"
            rules={[{ required: true, message: '请选择导出指标' }]}
          >
            <Form.Checkbox value="customer_acquisition">客户获取数据</Form.Checkbox>
            <Form.Checkbox value="group_activity">群聊活跃度</Form.Checkbox>
            <Form.Checkbox value="bot_performance">机器人性能</Form.Checkbox>
            <Form.Checkbox value="agent_work">客服工作数据</Form.Checkbox>
          </Form.CheckboxGroup>
          
          <Form.Switch
            field="includeCharts"
            label="包含图表"
          />
          
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setExportModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">导出</Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* 仪表板配置对话框 */}
      <Modal
        title={editingDashboard ? '编辑仪表板' : '新建仪表板'}
        visible={dashboardModalVisible}
        onCancel={() => {
          setDashboardModalVisible(false);
          setEditingDashboard(null);
        }}
        footer={null}
      >
        <Form
          onSubmit={handleSaveDashboard}
          initValues={editingDashboard || {}}
        >
          <Form.Input
            field="name"
            label="仪表板名称"
            placeholder="输入仪表板名称"
            rules={[{ required: true, message: '请输入仪表板名称' }]}
          />
          
          <Form.TextArea
            field="description"
            label="描述"
            placeholder="输入仪表板描述"
            rows={3}
          />
          
          <Form.InputNumber
            field="refreshInterval"
            label="刷新间隔（秒）"
            placeholder="自动刷新间隔"
            min={60}
            max={3600}
            defaultValue={300}
          />
          
          <Form.Switch
            field="isDefault"
            label="设为默认仪表板"
          />
          
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => {
                setDashboardModalVisible(false);
                setEditingDashboard(null);
              }}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard;