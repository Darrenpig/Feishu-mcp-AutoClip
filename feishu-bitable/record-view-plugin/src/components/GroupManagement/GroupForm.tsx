// 群聊表单组件
import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  TextArea,
  Button,
  Space,
  Card,
  Divider,
  Switch,
  InputNumber,
  TagInput,
  Transfer,
  Typography,
  Row,
  Col,
  Message
} from '@douyinfe/semi-ui';
import {
  GroupType,
  CreateGroupFormData,
  GroupSettings
} from '../../types/group';
import { Customer } from '../../types/customer';

const { Title, Text } = Typography;
const { Option } = Select;

interface GroupFormProps {
  initialData?: CreateGroupFormData;
  customers: Customer[];
  onSubmit: (data: CreateGroupFormData) => Promise<void>;
  onCancel: () => void;
}

// 模拟内部员工数据
const mockInternalMembers = [
  { key: 'emp001', label: '张三 - 销售部', value: 'emp001' },
  { key: 'emp002', label: '李四 - 客服部', value: 'emp002' },
  { key: 'emp003', label: '王五 - 技术部', value: 'emp003' },
  { key: 'emp004', label: '赵六 - 市场部', value: 'emp004' },
  { key: 'emp005', label: '钱七 - 运营部', value: 'emp005' },
  { key: 'emp006', label: '孙八 - 产品部', value: 'emp006' },
  { key: 'emp007', label: '周九 - 人事部', value: 'emp007' },
  { key: 'emp008', label: '吴十 - 财务部', value: 'emp008' }
];

const GroupForm: React.FC<GroupFormProps> = ({
  initialData,
  customers,
  onSubmit,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>(
    initialData?.customerIds || []
  );
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    initialData?.internalMemberIds || []
  );

  // 初始化表单数据
  useEffect(() => {
    if (initialData) {
      form.setValues({
        name: initialData.name,
        description: initialData.description,
        type: initialData.type,
        tags: initialData.tags || [],
        settings: {
          allowMemberInvite: initialData.settings?.allowMemberInvite ?? true,
          allowMemberAtAll: initialData.settings?.allowMemberAtAll ?? false,
          muteAll: initialData.settings?.muteAll ?? false,
          autoReply: initialData.settings?.autoReply ?? false,
          autoReplyMessage: initialData.settings?.autoReplyMessage || '',
          welcomeMessage: initialData.settings?.welcomeMessage || '',
          maxMembers: initialData.settings?.maxMembers || 500,
          autoArchiveDays: initialData.settings?.autoArchiveDays || 30
        }
      });
    }
  }, [initialData, form]);

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    if (selectedCustomers.length === 0 && selectedMembers.length === 0) {
      Message.warning('请至少选择一个客户或内部员工');
      return;
    }

    setLoading(true);
    try {
      const formData: CreateGroupFormData = {
        name: values.name,
        description: values.description,
        type: values.type,
        customerIds: selectedCustomers,
        internalMemberIds: selectedMembers,
        settings: values.settings,
        tags: values.tags || []
      };

      await onSubmit(formData);
    } catch (error) {
      console.error('提交表单失败:', error);
      Message.error('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 准备客户数据用于Transfer组件
  const customerDataSource = customers.map(customer => ({
    key: customer.id,
    label: `${customer.name} - ${customer.company || '个人客户'}`,
    value: customer.id,
    disabled: false
  }));

  // 获取群聊类型选项
  const getGroupTypeOptions = () => [
    { value: GroupType.CUSTOMER_SERVICE, label: '客服群', description: '用于客户服务和支持' },
    { value: GroupType.SALES, label: '销售群', description: '用于销售沟通和跟进' },
    { value: GroupType.SUPPORT, label: '技术支持群', description: '用于技术问题解答' },
    { value: GroupType.GENERAL, label: '通用群', description: '用于一般性沟通' }
  ];

  return (
    <Form
      form={form}
      onSubmit={handleSubmit}
      labelPosition="top"
      style={{ maxWidth: '100%' }}
    >
      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Input
              field="name"
              label="群聊名称"
              placeholder="请输入群聊名称"
              rules={[
                { required: true, message: '请输入群聊名称' },
                { min: 2, max: 50, message: '群聊名称长度为2-50个字符' }
              ]}
            />
          </Col>
          <Col span={12}>
            <Form.Select
              field="type"
              label="群聊类型"
              placeholder="请选择群聊类型"
              rules={[{ required: true, message: '请选择群聊类型' }]}
            >
              {getGroupTypeOptions().map(option => (
                <Option key={option.value} value={option.value}>
                  <div>
                    <div>{option.label}</div>
                    <Text type="tertiary" size="small">{option.description}</Text>
                  </div>
                </Option>
              ))}
            </Form.Select>
          </Col>
        </Row>
        
        <Form.TextArea
          field="description"
          label="群聊描述"
          placeholder="请输入群聊描述（可选）"
          maxCount={200}
          showClear
        />
        
        <Form.TagInput
          field="tags"
          label="群聊标签"
          placeholder="输入标签后按回车添加"
          max={10}
          showClear
        />
      </Card>

      <Card title="成员配置" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Title heading={5}>选择客户</Title>
          <Text type="tertiary">选择要邀请加入群聊的客户</Text>
        </div>
        
        <Transfer
          dataSource={customerDataSource}
          value={selectedCustomers}
          onChange={setSelectedCustomers}
          style={{ width: '100%', height: 300 }}
          inputProps={{ placeholder: '搜索客户' }}
          emptyContent={{
            left: '暂无可选客户',
            right: '暂未选择客户',
            search: '无搜索结果'
          }}
        />

        <Divider />

        <div style={{ marginBottom: 16 }}>
          <Title heading={5}>选择内部员工</Title>
          <Text type="tertiary">选择要邀请加入群聊的内部员工</Text>
        </div>
        
        <Transfer
          dataSource={mockInternalMembers}
          value={selectedMembers}
          onChange={setSelectedMembers}
          style={{ width: '100%', height: 300 }}
          inputProps={{ placeholder: '搜索员工' }}
          emptyContent={{
            left: '暂无可选员工',
            right: '暂未选择员工',
            search: '无搜索结果'
          }}
        />
      </Card>

      <Card title="群聊设置" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Switch
              field="settings.allowMemberInvite"
              label="允许成员邀请"
              checkedText="开启"
              uncheckedText="关闭"
            />
          </Col>
          <Col span={12}>
            <Form.Switch
              field="settings.allowMemberAtAll"
              label="允许成员@所有人"
              checkedText="开启"
              uncheckedText="关闭"
            />
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Switch
              field="settings.muteAll"
              label="全员禁言"
              checkedText="开启"
              uncheckedText="关闭"
            />
          </Col>
          <Col span={12}>
            <Form.Switch
              field="settings.autoReply"
              label="自动回复"
              checkedText="开启"
              uncheckedText="关闭"
            />
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.InputNumber
              field="settings.maxMembers"
              label="最大成员数"
              min={10}
              max={1000}
              step={10}
              suffix="人"
            />
          </Col>
          <Col span={12}>
            <Form.InputNumber
              field="settings.autoArchiveDays"
              label="自动归档天数"
              min={7}
              max={365}
              step={1}
              suffix="天"
            />
          </Col>
        </Row>
        
        <Form.TextArea
          field="settings.welcomeMessage"
          label="欢迎消息"
          placeholder="新成员加入时的欢迎消息（可选）"
          maxCount={500}
          showClear
        />
        
        <Form.Slot label="自动回复消息">
          {({ formState }) => {
            const autoReplyEnabled = formState.values?.settings?.autoReply;
            return (
              <Form.TextArea
                field="settings.autoReplyMessage"
                placeholder={autoReplyEnabled ? "请输入自动回复消息" : "请先开启自动回复功能"}
                disabled={!autoReplyEnabled}
                maxCount={500}
                showClear
              />
            );
          }}
        </Form.Slot>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Button onClick={onCancel}>取消</Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
        >
          {initialData ? '更新群聊' : '创建群聊'}
        </Button>
      </div>
    </Form>
  );
};

export default GroupForm;