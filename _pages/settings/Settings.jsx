'use client';
import React from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Form,
  Input,
  Button,
  Divider,
  Space,
  Switch,
  Select,
  InputNumber,
  Tabs,
  message,
  Upload
} from 'antd';
import {
  SettingOutlined,
  BankOutlined,
  PrinterOutlined,
  DollarOutlined,
  UploadOutlined,
  SaveOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { companyInfo } from '../../data/mockData';

const { Title, Text, Paragraph } = Typography;

const Settings = () => {
  const [companyForm] = Form.useForm();
  const [pricingForm] = Form.useForm();

  const handleCompanySave = (values) => {
    message.success('Company settings saved successfully!');
  };

  const handlePricingSave = (values) => {
    message.success('Pricing settings saved successfully!');
  };

  return (
    <div className="animate-fade-in">
      <Title level={3} style={{ marginBottom: 24 }}>
        <SettingOutlined style={{ marginRight: 12 }} />
        Settings
      </Title>

      <Tabs
        defaultActiveKey="company"
        tabPosition="left"
        style={{ minHeight: 500 }}
        items={[
          {
            key: 'company',
            label: (
              <Space>
                <BankOutlined />
                Company
              </Space>
            ),
            children: (
              <Card title="Company Information">
                <Form
                  form={companyForm}
                  layout="vertical"
                  onFinish={handleCompanySave}
                  initialValues={companyInfo}
                >
                  <Row gutter={[24, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="name" label="Company Name" rules={[{ required: true }]}>
                        <Input prefix={<BankOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="gstin" label="GSTIN" rules={[{ required: true }]}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item name="address" label="Address">
                        <Input.TextArea rows={2} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="city" label="City">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="state" label="State">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="pincode" label="Pincode">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="phone" label="Phone">
                        <Input prefix={<PhoneOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="email" label="Email">
                        <Input prefix={<MailOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="website" label="Website">
                        <Input prefix={<GlobalOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Company Logo">
                        <Upload>
                          <Button icon={<UploadOutlined />}>Upload Logo</Button>
                        </Upload>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    Save Company Settings
                  </Button>
                </Form>
              </Card>
            )
          },
          {
            key: 'pricing',
            label: (
              <Space>
                <DollarOutlined />
                Pricing
              </Space>
            ),
            children: (
              <Card title="Default Pricing Settings">
                <Form
                  form={pricingForm}
                  layout="vertical"
                  onFinish={handlePricingSave}
                  initialValues={{
                    defaultProfitMargin: 20,
                    defaultWastage: 5,
                    taxRate: 18,
                    currency: 'INR',
                    roundOff: true
                  }}
                >
                  <Row gutter={[24, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="defaultProfitMargin" label="Default Profit Margin (%)">
                        <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="defaultWastage" label="Default Wastage (%)">
                        <InputNumber min={0} max={50} style={{ width: '100%' }} addonAfter="%" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="taxRate" label="GST Rate (%)">
                        <Select
                          options={[
                            { value: 0, label: 'No Tax' },
                            { value: 5, label: '5% GST' },
                            { value: 12, label: '12% GST' },
                            { value: 18, label: '18% GST' },
                            { value: 28, label: '28% GST' }
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="currency" label="Currency">
                        <Select
                          options={[
                            { value: 'INR', label: '₹ Indian Rupee (INR)' },
                            { value: 'USD', label: '$ US Dollar (USD)' },
                            { value: 'EUR', label: '€ Euro (EUR)' }
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item name="roundOff" valuePropName="checked" label="Round Off Final Amount">
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    Save Pricing Settings
                  </Button>
                </Form>
              </Card>
            )
          },
          {
            key: 'printing',
            label: (
              <Space>
                <PrinterOutlined />
                Printing
              </Space>
            ),
            children: (
              <Card title="Printing Defaults">
                <Form layout="vertical">
                  <Row gutter={[24, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="defaultMachine" label="Default Machine">
                        <Select
                          placeholder="Select default machine"
                          options={[
                            { value: 'heidelberg-74', label: 'Heidelberg SM 74' },
                            { value: 'heidelberg-102', label: 'Heidelberg SM 102' },
                            { value: 'komori-440', label: 'Komori LS 440' }
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="defaultPaperType" label="Default Paper Type">
                        <Select
                          placeholder="Select default paper"
                          options={[
                            { value: 'art', label: 'Art Paper' },
                            { value: 'maplitho', label: 'Maplitho' },
                            { value: 'bond', label: 'Bond Paper' }
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="defaultColors" label="Default Colors (Front)">
                        <Select
                          options={[
                            { value: 1, label: '1 Color' },
                            { value: 2, label: '2 Colors' },
                            { value: 4, label: '4 Colors (CMYK)' }
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="minOrderQty" label="Minimum Order Quantity">
                        <InputNumber min={1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Button type="primary" icon={<SaveOutlined />}>
                    Save Printing Settings
                  </Button>
                </Form>
              </Card>
            )
          },
          {
            key: 'notifications',
            label: (
              <Space>
                <MailOutlined />
                Notifications
              </Space>
            ),
            children: (
              <Card title="Notification Settings">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Email on New Estimate</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Send email when new estimate is created
                      </Text>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Divider style={{ margin: 0 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Quote Approval Alerts</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Notify when quotation is approved/rejected
                      </Text>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Divider style={{ margin: 0 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Low Stock Alerts</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Alert when paper stock is running low
                      </Text>
                    </div>
                    <Switch />
                  </div>
                  <Divider style={{ margin: 0 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Daily Summary Report</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Receive daily summary of all estimates
                      </Text>
                    </div>
                    <Switch />
                  </div>
                </Space>
              </Card>
            )
          }
        ]}
      />
    </div>
  );
};

export default Settings;

