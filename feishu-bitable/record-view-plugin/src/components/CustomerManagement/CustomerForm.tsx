import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Row,
  Col,
  TextArea,
  TagInput,
  Upload,
  Avatar,
  Message,
  Divider,
  Typography,
} from '@douyinfe/semi-ui';
import {
  IconUpload,
  IconUser,
  IconPhone,
  IconMail,
  IconBuilding,
  IconGlobe,
  IconCalendar,
} from '@douyinfe/semi-icons';
import {
  Customer,
  CustomerFormData,
  CustomerStatus,
  IntentionLevel,
  CustomerSource,
} from '../../types/customer';

const { Text, Title } = Typography;
const { Option } = Select;

// 状态选项
const STATUS_OPTIONS = [
  { value: CustomerStatus.NEW, label: '新客户' },
  { value: CustomerStatus.CONTACTED, label: '已联系' },
  { value: CustomerStatus.INTERESTED, label: '有意向' },
  { value: CustomerStatus.NEGOTIATING, label: '洽谈中' },
  { value: CustomerStatus.CLOSED_WON, label: '已成交' },
  { value: CustomerStatus.CLOSED_LOST, label: '已流失' },
  { value: CustomerStatus.INACTIVE, label: '不活跃' },
];

// 意向等级选项
const INTENTION_OPTIONS = [
  { value: IntentionLevel.HIGH, label: '高意向' },
  { value: IntentionLevel.MEDIUM, label: '中意向' },
  { value: IntentionLevel.LOW, label: '低意向' },
  { value: IntentionLevel.UNKNOWN, label: '未知' },
];

// 来源选项
const SOURCE_OPTIONS = [
  { value: CustomerSource.WEBSITE, label: '官网' },
  { value: CustomerSource.SOCIAL_MEDIA, label: '社交媒体' },
  { value: CustomerSource.REFERRAL, label: '推荐' },
  { value: CustomerSource.ADVERTISEMENT, label: '广告' },
  { value: CustomerSource.EXHIBITION, label: '展会' },
  { value: CustomerSource.COLD_CALL, label: '电话营销' },
  { value: CustomerSource.OTHER, label: '其他' },
];

interface CustomerFormProps {
  customer?: Customer | null;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // 初始化表单数据
  useEffect(() => {
    if (customer) {
      form.setValues({
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        company: customer.company,
        position: customer.position,
        website: customer.website,
        address: customer.address,
        status: customer.status,
        intentionLevel: customer.intentionLevel,
        source: customer.source,
        assignedSales: customer.assignedSales,
        tags: customer.tags,
        notes: customer.notes,
        lastContactTime: customer.lastContactTime ? new Date(customer.lastContactTime) : undefined,
        nextFollowUpTime: customer.nextFollowUpTime ? new Date(customer.nextFollowUpTime) : undefined,
      });
      setAvatarUrl(customer.avatar || '');
    } else {
      // 新建客户时的默认值
      form.setValues({
        status: CustomerStatus.NEW,
        intentionLevel: IntentionLevel.UNKNOWN,
        source: CustomerSource.OTHER,
        tags: [],
      });
    }
  }, [customer, form]);

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const formData: CustomerFormData = {
        ...values,
        avatar: avatarUrl,
        lastContactTime: values.lastContactTime?.getTime(),
        nextFollowUpTime: values.nextFollowUpTime?.getTime(),
      };
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理头像上传
  const handleAvatarUpload = (fileList: any[]) => {
    if (fileList.length > 0) {
      const file = fileList[0];
      if (file.status === 'success' && file.response?.url) {
        setAvatarUrl(file.response.url);
      } else if (file.url) {
        setAvatarUrl(file.url);
      }
    } else {
      setAvatarUrl('');
    }
  };

  // 验证规则
  const validateRules = {
    name: [
      { required: true, message: '请输入客户姓名' },
      { min: 2, max: 50, message: '姓名长度应在2-50个字符之间' },
    ],
    phone: [
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
    ],
    email: [
      { type: 'email', message: '请输入正确的邮箱地址' },
    ],
    website: [
      { type: 'url', message: '请输入正确的网址' },
    ],
  };

  return (
    <div>
      <Form
        form={form}
        onSubmit={handleSubmit}
        labelPosition="left"
        labelWidth={100}
        style={{ padding: '0 16px' }}
      >
        {/* 基本信息 */}
        <Title heading={5} style={{ marginBottom: 16 }}>基本信息</Title>
        
        <Row gutter={24}>
          <Col span={16}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  field="name"
                  label="客户姓名"
                  rules={validateRules.name}
                >
                  <Input
                    prefix={<IconUser />}
                    placeholder="请输入客户姓名"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item field="phone" label="手机号码" rules={validateRules.phone}>
                  <Input
                    prefix={<IconPhone />}
                    placeholder="请输入手机号码"
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item field="email" label="邮箱地址" rules={validateRules.email}>
                  <Input
                    prefix={<IconMail />}
                    placeholder="请输入邮箱地址"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item field="company" label="公司名称">
                  <Input
                    prefix={<IconBuilding />}
                    placeholder="请输入公司名称"
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item field="position" label="职位">
                  <Input placeholder="请输入职位" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item field="website" label="公司网站" rules={validateRules.website}>
                  <Input
                    prefix={<IconGlobe />}
                    placeholder="请输入公司网站"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          
          <Col span={8}>
            <Form.Item label="头像">
              <div style={{ textAlign: 'center' }}>
                <Avatar
                  size="large"
                  src={avatarUrl}
                  style={{ marginBottom: 8 }}
                >
                  {!avatarUrl && form.getValues().name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <div>
                  <Upload
                    action="/api/upload"
                    accept="image/*"
                    limit={1}
                    showUploadList={false}
                    onChange={handleAvatarUpload}
                  >
                    <Button icon={<IconUpload />} size="small">
                      上传头像
                    </Button>
                  </Upload>
                </div>
              </div>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item field="address" label="地址">
          <Input placeholder="请输入详细地址" />
        </Form.Item>

        <Divider />
        
        {/* 销售信息 */}
        <Title heading={5} style={{ marginBottom: 16 }}>销售信息</Title>
        
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item field="status" label="客户状态" rules={[{ required: true, message: '请选择客户状态' }]}>
              <Select placeholder="请选择客户状态">
                {STATUS_OPTIONS.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item field="intentionLevel" label="意向等级" rules={[{ required: true, message: '请选择意向等级' }]}>
              <Select placeholder="请选择意向等级">
                {INTENTION_OPTIONS.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item field="source" label="来源渠道" rules={[{ required: true, message: '请选择来源渠道' }]}>
              <Select placeholder="请选择来源渠道">
                {SOURCE_OPTIONS.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item field="assignedSales" label="分配销售">
          <Input placeholder="请输入分配的销售人员" />
        </Form.Item>
        
        <Form.Item field="tags" label="客户标签">
          <TagInput
            placeholder="输入标签后按回车添加"
            separator={[',', '，', ';', '；']}
            maxTagCount={10}
            showRestTagsPopover
            restTagsPopoverProps={{
              content: '更多标签',
            }}
          />
        </Form.Item>

        <Divider />
        
        {/* 跟进信息 */}
        <Title heading={5} style={{ marginBottom: 16 }}>跟进信息</Title>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item field="lastContactTime" label="最后联系时间">
              <DatePicker
                type="dateTime"
                placeholder="选择最后联系时间"
                style={{ width: '100%' }}
                prefix={<IconCalendar />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item field="nextFollowUpTime" label="下次跟进时间">
              <DatePicker
                type="dateTime"
                placeholder="选择下次跟进时间"
                style={{ width: '100%' }}
                prefix={<IconCalendar />}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item field="notes" label="备注信息">
          <TextArea
            placeholder="请输入备注信息"
            rows={4}
            maxCount={500}
            showClear
          />
        </Form.Item>

        <Divider />
        
        {/* 操作按钮 */}
        <div style={{ textAlign: 'right', paddingTop: 16 }}>
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              {customer ? '更新' : '创建'}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default CustomerForm;