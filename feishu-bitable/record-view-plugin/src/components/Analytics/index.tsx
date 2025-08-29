import React, { useState, useEffect } from 'react';
import {
  Layout,
  Nav,
  Card,
  Button,
  Space,
  Typography,
  Badge,
  Notification,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Table,
  Tag,
  Popconfirm,
  message
} from '@douyinfe/semi-ui';
import {
  IconChartPie,
  IconFile,
  IconBell,
  IconSetting,
  IconPlus,
  IconEdit,
  IconDelete,
  IconPlay,
  IconPause,
  IconEye
} from '@douyinfe/semi-icons';
import Dashboard from './Dashboard';
import analyticsService from '../../services/analyticsService';
import {
  ReportConfig,
  AlertRule,
  AlertRecord
} from '../../types/analytics';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

interface AnalyticsProps {}

const Analytics: React.FC<AnalyticsProps> = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState<ReportConfig[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertRecords, setAlertRecords] = useState<AlertRecord[]>([]);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [editingReport, setEditingReport] = useState<ReportConfig | null>(null);
  const [editingAlert, setEditingAlert] = useState<AlertRule | null>(null);
  const [loading, setLoading] = useState(false);

  // 导航菜单项
  const navItems = [
    {
      itemKey: 'dashboard',
      text: '数据仪表板',
      icon: <IconChartPie />
    },
    {
      itemKey: 'reports',
      text: '报告管理',
      icon: <IconFile />
    },
    {
      itemKey: 'alerts',
      text: '预警管理',
      icon: <IconBell />
    },
    {
      itemKey: 'settings',
      text: '系统设置',
      icon: <IconSetting />
    }
  ];

  // 加载数据
  const loadData = async () => {
    try {
      const [reportList, alertRuleList, alertRecordList] = await Promise.all([
        analyticsService.getReports(),
        analyticsService.getAlertRules(),
        analyticsService.getAlertRecords()
      ]);
      
      setReports(reportList);
      setAlertRules(alertRuleList);
      setAlertRecords(alertRecordList);
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 渲染报告管理
  const renderReports = () => {
    const columns = [
      {
        title: '报告名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description'
      },
      {
        title: '频率',
        dataIndex: 'schedule',
        key: 'schedule',
        render: (schedule: any) => {
          const frequencyMap: { [key: string]: string } = {
            daily: '每日',
            weekly: '每周',
            monthly: '每月'
          };
          return `${frequencyMap[schedule.frequency] || schedule.frequency} ${schedule.time}`;
        }
      },
      {
        title: '状态',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (isActive: boolean) => (
          <Tag color={isActive ? 'green' : 'grey'}>
            {isActive ? '启用' : '禁用'}
          </Tag>
        )
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (date: string) => new Date(date).toLocaleDateString('zh-CN')
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, record: ReportConfig) => (
          <Space>
            <Button
              icon={<IconEye />}
              size="small"
              onClick={() => handleViewReport(record)}
            >
              预览
            </Button>
            <Button
              icon={<IconEdit />}
              size="small"
              onClick={() => {
                setEditingReport(record);
                setReportModalVisible(true);
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定要删除这个报告吗？"
              onConfirm={() => handleDeleteReport(record.id)}
            >
              <Button
                icon={<IconDelete />}
                size="small"
                type="danger"
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    ];

    return (
      <div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Title heading={4}>报告管理</Title>
          <Button
            icon={<IconPlus />}
            type="primary"
            onClick={() => {
              setEditingReport(null);
              setReportModalVisible(true);
            }}
          >
            新建报告
          </Button>
        </div>
        
        <Card>
          <Table
            columns={columns}
            dataSource={reports}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    );
  };

  // 渲染预警管理
  const renderAlerts = () => {
    const ruleColumns = [
      {
        title: '规则名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description'
      },
      {
        title: '指标',
        dataIndex: 'metric',
        key: 'metric'
      },
      {
        title: '阈值',
        dataIndex: 'threshold',
        key: 'threshold'
      },
      {
        title: '严重程度',
        dataIndex: 'severity',
        key: 'severity',
        render: (severity: string) => {
          const colorMap: { [key: string]: string } = {
            low: 'blue',
            medium: 'orange',
            high: 'red',
            critical: 'purple'
          };
          const textMap: { [key: string]: string } = {
            low: '低',
            medium: '中',
            high: '高',
            critical: '严重'
          };
          return (
            <Tag color={colorMap[severity]}>
              {textMap[severity] || severity}
            </Tag>
          );
        }
      },
      {
        title: '状态',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (isActive: boolean) => (
          <Tag color={isActive ? 'green' : 'grey'}>
            {isActive ? '启用' : '禁用'}
          </Tag>
        )
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, record: AlertRule) => (
          <Space>
            <Button
              icon={record.isActive ? <IconPause /> : <IconPlay />}
              size="small"
              onClick={() => handleToggleAlert(record.id, !record.isActive)}
            >
              {record.isActive ? '禁用' : '启用'}
            </Button>
            <Button
              icon={<IconEdit />}
              size="small"
              onClick={() => {
                setEditingAlert(record);
                setAlertModalVisible(true);
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定要删除这个预警规则吗？"
              onConfirm={() => handleDeleteAlert(record.id)}
            >
              <Button
                icon={<IconDelete />}
                size="small"
                type="danger"
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    ];

    const recordColumns = [
      {
        title: '规则名称',
        dataIndex: 'ruleName',
        key: 'ruleName'
      },
      {
        title: '触发值',
        dataIndex: 'value',
        key: 'value'
      },
      {
        title: '阈值',
        dataIndex: 'threshold',
        key: 'threshold'
      },
      {
        title: '严重程度',
        dataIndex: 'severity',
        key: 'severity',
        render: (severity: string) => {
          const colorMap: { [key: string]: string } = {
            low: 'blue',
            medium: 'orange',
            high: 'red',
            critical: 'purple'
          };
          const textMap: { [key: string]: string } = {
            low: '低',
            medium: '中',
            high: '高',
            critical: '严重'
          };
          return (
            <Tag color={colorMap[severity]}>
              {textMap[severity] || severity}
            </Tag>
          );
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => {
          const colorMap: { [key: string]: string } = {
            triggered: 'red',
            acknowledged: 'orange',
            resolved: 'green'
          };
          const textMap: { [key: string]: string } = {
            triggered: '已触发',
            acknowledged: '已确认',
            resolved: '已解决'
          };
          return (
            <Tag color={colorMap[status]}>
              {textMap[status] || status}
            </Tag>
          );
        }
      },
      {
        title: '触发时间',
        dataIndex: 'triggeredAt',
        key: 'triggeredAt',
        render: (date: string) => new Date(date).toLocaleString('zh-CN')
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, record: AlertRecord) => (
          <Space>
            {record.status === 'triggered' && (
              <Button
                size="small"
                onClick={() => handleAcknowledgeAlert(record.id)}
              >
                确认
              </Button>
            )}
          </Space>
        )
      }
    ];

    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <Title heading={4}>预警规则</Title>
            <Button
              icon={<IconPlus />}
              type="primary"
              onClick={() => {
                setEditingAlert(null);
                setAlertModalVisible(true);
              }}
            >
              新建预警
            </Button>
          </div>
          
          <Card>
            <Table
              columns={ruleColumns}
              dataSource={alertRules}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </div>

        <div>
          <Title heading={4} style={{ marginBottom: 16 }}>预警记录</Title>
          <Card>
            <Table
              columns={recordColumns}
              dataSource={alertRecords}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </div>
      </div>
    );
  };

  // 渲染系统设置
  const renderSettings = () => {
    return (
      <div>
        <Title heading={4} style={{ marginBottom: 16 }}>系统设置</Title>
        
        <Card title="飞书应用配置" style={{ marginBottom: 16 }}>
          <Form
            onSubmit={(values) => {
              analyticsService.saveConfig(values.appId, values.appSecret);
              message.success('配置保存成功');
            }}
          >
            <Form.Input
              field="appId"
              label="App ID"
              placeholder="输入飞书应用的App ID"
              rules={[{ required: true, message: '请输入App ID' }]}
            />
            
            <Form.Input
              field="appSecret"
              label="App Secret"
              placeholder="输入飞书应用的App Secret"
              mode="password"
              rules={[{ required: true, message: '请输入App Secret' }]}
            />
            
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Space>
                <Button
                  onClick={async () => {
                    try {
                      const success = await analyticsService.testConnection();
                      if (success) {
                        message.success('连接测试成功');
                      } else {
                        message.error('连接测试失败');
                      }
                    } catch (error) {
                      message.error('连接测试失败');
                    }
                  }}
                >
                  测试连接
                </Button>
                <Button type="primary" htmlType="submit">
                  保存配置
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
        
        <Card title="数据同步设置">
          <Form>
            <Form.Switch
              field="autoSync"
              label="自动同步数据"
              extraText="启用后将定期从飞书同步最新数据"
            />
            
            <Form.InputNumber
              field="syncInterval"
              label="同步间隔（分钟）"
              min={5}
              max={1440}
              defaultValue={30}
            />
            
            <Form.Switch
              field="enableNotifications"
              label="启用通知"
              extraText="接收预警和报告通知"
            />
          </Form>
        </Card>
      </div>
    );
  };

  // 处理报告操作
  const handleViewReport = (report: ReportConfig) => {
    message.info(`预览报告: ${report.name}`);
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await analyticsService.deleteReport(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSaveReport = async (values: any) => {
    try {
      if (editingReport) {
        await analyticsService.updateReport(editingReport.id, values);
        message.success('报告更新成功');
      } else {
        await analyticsService.createReport({
          ...values,
          schedule: {
            frequency: values.frequency,
            time: values.time,
            timezone: 'Asia/Shanghai'
          },
          recipients: values.recipients ? values.recipients.split(',').map((r: string) => r.trim()) : [],
          template: 'default',
          dataQuery: {
            timeRange: values.timeRange,
            dimensions: []
          },
          isActive: values.isActive !== false
        });
        message.success('报告创建成功');
      }
      
      setReportModalVisible(false);
      setEditingReport(null);
      loadData();
    } catch (error) {
      message.error('保存失败');
    }
  };

  // 处理预警操作
  const handleToggleAlert = async (id: string, isActive: boolean) => {
    try {
      await analyticsService.updateAlertRule(id, { isActive });
      message.success(isActive ? '预警已启用' : '预警已禁用');
      loadData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      await analyticsService.deleteAlertRule(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleAcknowledgeAlert = async (id: string) => {
    try {
      await analyticsService.acknowledgeAlert(id, '当前用户');
      message.success('预警已确认');
      loadData();
    } catch (error) {
      message.error('确认失败');
    }
  };

  const handleSaveAlert = async (values: any) => {
    try {
      const alertData = {
        ...values,
        condition: {
          operator: values.operator,
          timeWindow: values.timeWindow
        },
        recipients: values.recipients ? values.recipients.split(',').map((r: string) => r.trim()) : [],
        isActive: values.isActive !== false
      };
      
      if (editingAlert) {
        await analyticsService.updateAlertRule(editingAlert.id, alertData);
        message.success('预警规则更新成功');
      } else {
        await analyticsService.createAlertRule(alertData);
        message.success('预警规则创建成功');
      }
      
      setAlertModalVisible(false);
      setEditingAlert(null);
      loadData();
    } catch (error) {
      message.error('保存失败');
    }
  };

  // 渲染内容
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'reports':
        return renderReports();
      case 'alerts':
        return renderAlerts();
      case 'settings':
        return renderSettings();
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider style={{ backgroundColor: 'var(--semi-color-bg-1)' }}>
        <div style={{ padding: '20px 0' }}>
          <Title heading={5} style={{ textAlign: 'center', margin: 0 }}>数据分析</Title>
        </div>
        <Nav
          items={navItems}
          selectedKeys={[activeTab]}
          onSelect={({ itemKey }) => setActiveTab(itemKey as string)}
          style={{ maxWidth: 220, height: '100%' }}
        />
      </Sider>
      
      <Content style={{ padding: 0, backgroundColor: 'var(--semi-color-bg-0)' }}>
        {renderContent()}
      </Content>

      {/* 报告配置对话框 */}
      <Modal
        title={editingReport ? '编辑报告' : '新建报告'}
        visible={reportModalVisible}
        onCancel={() => {
          setReportModalVisible(false);
          setEditingReport(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          onSubmit={handleSaveReport}
          initValues={editingReport || {}}
        >
          <Form.Input
            field="name"
            label="报告名称"
            placeholder="输入报告名称"
            rules={[{ required: true, message: '请输入报告名称' }]}
          />
          
          <Form.TextArea
            field="description"
            label="描述"
            placeholder="输入报告描述"
            rows={3}
          />
          
          <Form.Select
            field="frequency"
            label="生成频率"
            placeholder="选择生成频率"
            rules={[{ required: true, message: '请选择生成频率' }]}
          >
            <Option value="daily">每日</Option>
            <Option value="weekly">每周</Option>
            <Option value="monthly">每月</Option>
          </Form.Select>
          
          <Form.TimePicker
            field="time"
            label="生成时间"
            format="HH:mm"
            rules={[{ required: true, message: '请选择生成时间' }]}
          />
          
          <Form.Input
            field="recipients"
            label="接收人邮箱"
            placeholder="多个邮箱用逗号分隔"
            rules={[{ required: true, message: '请输入接收人邮箱' }]}
          />
          
          <Form.Switch
            field="isActive"
            label="启用报告"
          />
          
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => {
                setReportModalVisible(false);
                setEditingReport(null);
              }}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* 预警配置对话框 */}
      <Modal
        title={editingAlert ? '编辑预警规则' : '新建预警规则'}
        visible={alertModalVisible}
        onCancel={() => {
          setAlertModalVisible(false);
          setEditingAlert(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          onSubmit={handleSaveAlert}
          initValues={editingAlert || {}}
        >
          <Form.Input
            field="name"
            label="规则名称"
            placeholder="输入规则名称"
            rules={[{ required: true, message: '请输入规则名称' }]}
          />
          
          <Form.TextArea
            field="description"
            label="描述"
            placeholder="输入规则描述"
            rows={3}
          />
          
          <Form.Input
            field="metric"
            label="监控指标"
            placeholder="如：avg_response_time"
            rules={[{ required: true, message: '请输入监控指标' }]}
          />
          
          <Form.Select
            field="operator"
            label="比较操作符"
            placeholder="选择比较操作符"
            rules={[{ required: true, message: '请选择比较操作符' }]}
          >
            <Option value=">">大于</Option>
            <Option value="<">小于</Option>
            <Option value=">=">大于等于</Option>
            <Option value="<=">小于等于</Option>
            <Option value="==">等于</Option>
          </Form.Select>
          
          <Form.InputNumber
            field="threshold"
            label="阈值"
            placeholder="输入阈值"
            rules={[{ required: true, message: '请输入阈值' }]}
          />
          
          <Form.InputNumber
            field="timeWindow"
            label="时间窗口（分钟）"
            placeholder="统计时间窗口"
            min={1}
            max={1440}
            defaultValue={30}
          />
          
          <Form.Select
            field="severity"
            label="严重程度"
            placeholder="选择严重程度"
            rules={[{ required: true, message: '请选择严重程度' }]}
          >
            <Option value="low">低</Option>
            <Option value="medium">中</Option>
            <Option value="high">高</Option>
            <Option value="critical">严重</Option>
          </Form.Select>
          
          <Form.Input
            field="recipients"
            label="通知人邮箱"
            placeholder="多个邮箱用逗号分隔"
            rules={[{ required: true, message: '请输入通知人邮箱' }]}
          />
          
          <Form.Switch
            field="isActive"
            label="启用规则"
          />
          
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => {
                setAlertModalVisible(false);
                setEditingAlert(null);
              }}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Analytics;