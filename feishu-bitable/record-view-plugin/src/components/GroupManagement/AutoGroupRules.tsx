// 自动拉群规则管理组件
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Typography,
  Space,
  Tag,
  Popconfirm,
  Toast,
  Row,
  Col,
  Divider,
  InputNumber,
  TextArea,
  Badge
} from '@douyinfe/semi-ui';
import {
  IconPlus,
  IconEdit,
  IconDelete,
  IconPlay,
  IconPause,
  IconSetting,
  IconRefresh
} from '@douyinfe/semi-icons';
import { AutoGroupRule, GroupCondition, GroupAction, GroupType } from '../../types/group';
import { CustomerStatus, IntentionLevel, CustomerSource } from '../../types/customer';
import groupService from '../../services/groupService';

const { Title, Text } = Typography;
const { Option } = Select;

const AutoGroupRules: React.FC = () => {
  const [rules, setRules] = useState<AutoGroupRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoGroupRule | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadRules();
  }, []);

  // 加载规则列表
  const loadRules = async () => {
    setLoading(true);
    try {
      // TODO: 实现获取自动拉群规则的API
      // const rulesData = await groupService.getAutoGroupRules();
      // setRules(rulesData);
      
      // 模拟数据
      const mockRules: AutoGroupRule[] = [
        {
          id: '1',
          name: '高意向客户自动拉群',
          description: '当客户意向等级为高时，自动创建销售群',
          isActive: true,
          priority: 1,
          conditions: [
            {
              field: 'intentionLevel',
              operator: 'equals',
              value: 'high'
            }
          ],
          actions: [
            {
              type: 'create_group',
              config: {
                groupType: 'sales',
                groupName: '销售群-{customerName}',
                addCustomer: true,
                addSalesAgent: true,
                autoReply: true
              }
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: '技术咨询客户拉群',
          description: '技术咨询类客户自动创建技术支持群',
          isActive: true,
          priority: 2,
          conditions: [
            {
              field: 'tags',
              operator: 'contains',
              value: '技术咨询'
            }
          ],
          actions: [
            {
              type: 'create_group',
              config: {
                groupType: 'support',
                groupName: '技术支持-{customerName}',
                addCustomer: true,
                addTechSupport: true,
                autoReply: true
              }
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setRules(mockRules);
    } catch (error) {
      console.error('加载规则失败:', error);
      Toast.error('加载规则失败');
    } finally {
      setLoading(false);
    }
  };

  // 打开创建/编辑模态框
  const openModal = (rule?: AutoGroupRule) => {
    setEditingRule(rule || null);
    if (rule) {
      form.setFieldsValue({
        ...rule,
        conditions: rule.conditions || [],
        actions: rule.actions || []
      });
    } else {
      form.reset();
    }
    setModalVisible(true);
  };

  // 保存规则
  const saveRule = async () => {
    try {
      const values = await form.validate();
      
      const ruleData: Partial<AutoGroupRule> = {
        ...values,
        updatedAt: new Date().toISOString()
      };

      if (editingRule) {
        // 更新规则
        // await groupService.updateAutoGroupRule(editingRule.id, ruleData);
        Toast.success('规则更新成功');
      } else {
        // 创建规则
        ruleData.createdAt = new Date().toISOString();
        // await groupService.createAutoGroupRule(ruleData);
        Toast.success('规则创建成功');
      }

      setModalVisible(false);
      loadRules();
    } catch (error) {
      console.error('保存规则失败:', error);
      Toast.error('保存规则失败');
    }
  };

  // 删除规则
  const deleteRule = async (ruleId: string) => {
    try {
      // await groupService.deleteAutoGroupRule(ruleId);
      Toast.success('规则删除成功');
      loadRules();
    } catch (error) {
      console.error('删除规则失败:', error);
      Toast.error('删除规则失败');
    }
  };

  // 切换规则状态
  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      // await groupService.updateAutoGroupRule(ruleId, { isActive });
      Toast.success(`规则已${isActive ? '启用' : '禁用'}`);
      loadRules();
    } catch (error) {
      console.error('切换规则状态失败:', error);
      Toast.error('操作失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AutoGroupRule) => (
        <div>
          <Text strong>{text}</Text>
          {record.description && (
            <>
              <br />
              <Text type="tertiary" size="small">{record.description}</Text>
            </>
          )}
        </div>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: number) => (
        <Badge count={priority} style={{ backgroundColor: '#1890ff' }} />
      )
    },
    {
      title: '条件数量',
      dataIndex: 'conditions',
      key: 'conditions',
      width: 100,
      render: (conditions: GroupCondition[]) => (
        <Badge count={conditions?.length || 0} style={{ backgroundColor: '#52c41a' }} />
      )
    },
    {
      title: '动作数量',
      dataIndex: 'actions',
      key: 'actions',
      width: 100,
      render: (actions: GroupAction[]) => (
        <Badge count={actions?.length || 0} style={{ backgroundColor: '#722ed1' }} />
      )
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean, record: AutoGroupRule) => (
        <Switch
          checked={isActive}
          onChange={(checked) => toggleRuleStatus(record.id, checked)}
          checkedText="启用"
          uncheckedText="禁用"
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record: AutoGroupRule) => (
        <Space>
          <Button
            type="tertiary"
            icon={<IconEdit />}
            size="small"
            onClick={() => openModal(record)}
          />
          <Popconfirm
            title="确定要删除这个规则吗？"
            content="删除后无法恢复"
            onConfirm={() => deleteRule(record.id)}
          >
            <Button
              type="danger"
              theme="borderless"
              icon={<IconDelete />}
              size="small"
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 页面标题和操作 */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title heading={3}>自动拉群规则</Title>
          <Text type="tertiary">配置自动创建群聊的触发条件和执行动作</Text>
        </div>
        <Space>
          <Button
            icon={<IconRefresh />}
            onClick={loadRules}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            type="primary"
            icon={<IconPlus />}
            onClick={() => openModal()}
          >
            创建规则
          </Button>
        </Space>
      </div>

      {/* 规则列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
        />
      </Card>

      {/* 创建/编辑规则模态框 */}
      <Modal
        title={editingRule ? '编辑规则' : '创建规则'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={saveRule}
        width={800}
        bodyStyle={{ maxHeight: '70vh', overflow: 'auto' }}
      >
        <Form
          form={form}
          labelPosition="top"
          style={{ padding: '0 24px' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Field
                field="name"
                label="规则名称"
                rules={[{ required: true, message: '请输入规则名称' }]}
              >
                <Input placeholder="请输入规则名称" />
              </Form.Field>
            </Col>
            <Col span={12}>
              <Form.Field
                field="priority"
                label="优先级"
                rules={[{ required: true, message: '请设置优先级' }]}
              >
                <InputNumber
                  placeholder="数字越小优先级越高"
                  min={1}
                  max={100}
                  style={{ width: '100%' }}
                />
              </Form.Field>
            </Col>
          </Row>

          <Form.Field
            field="description"
            label="规则描述"
          >
            <TextArea
              placeholder="请输入规则描述"
              rows={2}
            />
          </Form.Field>

          <Divider>触发条件</Divider>
          
          <Form.Field
            field="conditions"
            label="条件配置"
            rules={[{ required: true, message: '请至少配置一个条件' }]}
          >
            <Form.ArrayField field="conditions">
              {({ add, arrayFields, addWithInitValue }) => (
                <>
                  {arrayFields.map(({ field, key, remove }, i) => (
                    <Card key={key} style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col span={6}>
                          <Form.Field
                            field={`${field}[field]`}
                            label="字段"
                            rules={[{ required: true, message: '请选择字段' }]}
                          >
                            <Select placeholder="选择字段">
                              <Option value="intentionLevel">意向等级</Option>
                              <Option value="status">客户状态</Option>
                              <Option value="source">客户来源</Option>
                              <Option value="tags">标签</Option>
                              <Option value="contactMethod">联系方式</Option>
                            </Select>
                          </Form.Field>
                        </Col>
                        <Col span={6}>
                          <Form.Field
                            field={`${field}[operator]`}
                            label="操作符"
                            rules={[{ required: true, message: '请选择操作符' }]}
                          >
                            <Select placeholder="选择操作符">
                              <Option value="equals">等于</Option>
                              <Option value="not_equals">不等于</Option>
                              <Option value="contains">包含</Option>
                              <Option value="not_contains">不包含</Option>
                              <Option value="in">在列表中</Option>
                              <Option value="not_in">不在列表中</Option>
                            </Select>
                          </Form.Field>
                        </Col>
                        <Col span={8}>
                          <Form.Field
                            field={`${field}[value]`}
                            label="值"
                            rules={[{ required: true, message: '请输入值' }]}
                          >
                            <Input placeholder="请输入条件值" />
                          </Form.Field>
                        </Col>
                        <Col span={4}>
                          <div style={{ paddingTop: 30 }}>
                            <Button
                              type="danger"
                              theme="borderless"
                              icon={<IconDelete />}
                              onClick={remove}
                            />
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button
                    onClick={() => addWithInitValue({ field: '', operator: 'equals', value: '' })}
                    icon={<IconPlus />}
                    style={{ width: '100%' }}
                  >
                    添加条件
                  </Button>
                </>
              )}
            </Form.ArrayField>
          </Form.Field>

          <Divider>执行动作</Divider>
          
          <Form.Field
            field="actions"
            label="动作配置"
            rules={[{ required: true, message: '请至少配置一个动作' }]}
          >
            <Form.ArrayField field="actions">
              {({ add, arrayFields, addWithInitValue }) => (
                <>
                  {arrayFields.map(({ field, key, remove }, i) => (
                    <Card key={key} style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col span={6}>
                          <Form.Field
                            field={`${field}[type]`}
                            label="动作类型"
                            rules={[{ required: true, message: '请选择动作类型' }]}
                          >
                            <Select placeholder="选择动作类型">
                              <Option value="create_group">创建群聊</Option>
                              <Option value="add_to_group">加入群聊</Option>
                              <Option value="send_message">发送消息</Option>
                              <Option value="assign_agent">分配客服</Option>
                            </Select>
                          </Form.Field>
                        </Col>
                        <Col span={14}>
                          <Form.Field
                            field={`${field}[config]`}
                            label="配置"
                          >
                            <TextArea
                              placeholder="请输入JSON格式的配置"
                              rows={3}
                            />
                          </Form.Field>
                        </Col>
                        <Col span={4}>
                          <div style={{ paddingTop: 30 }}>
                            <Button
                              type="danger"
                              theme="borderless"
                              icon={<IconDelete />}
                              onClick={remove}
                            />
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button
                    onClick={() => addWithInitValue({ type: 'create_group', config: {} })}
                    icon={<IconPlus />}
                    style={{ width: '100%' }}
                  >
                    添加动作
                  </Button>
                </>
              )}
            </Form.ArrayField>
          </Form.Field>

          <Form.Field
            field="isActive"
            label="启用状态"
          >
            <Switch
              checkedText="启用"
              uncheckedText="禁用"
            />
          </Form.Field>
        </Form>
      </Modal>
    </div>
  );
};

export default AutoGroupRules;