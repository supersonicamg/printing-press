'use client';
import React, { useState } from 'react';
import {
  Card, Row, Col, Avatar, Typography, Form, Input, Button, Divider, Space, Tag, message,
  Tabs, Switch, List, Progress, Upload, Statistic, Timeline, Badge
} from 'antd';
import {
  UserOutlined, MailOutlined, PhoneOutlined, EditOutlined, SaveOutlined, CameraOutlined,
  LockOutlined, BellOutlined, HistoryOutlined, TrophyOutlined, FileTextOutlined,
  CheckCircleOutlined, ClockCircleOutlined, SettingOutlined, SafetyOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useEstimate } from '../../context/EstimateContext';

const { Title, Text, Paragraph } = Typography;

const Profile = () => {
  const { currentUser } = useAuth();
  const { estimates } = useEstimate();
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const roleColors = {
    ADMIN: 'red',
    ESTIMATOR: 'blue',
    SALES: 'green',
    VIEWER: 'default'
  };

  const roleDescriptions = {
    ADMIN: 'Full system access',
    ESTIMATOR: 'Create & manage estimates',
    SALES: 'View estimates & generate quotes',
    VIEWER: 'Read-only access'
  };

  // Calculate user stats
  const userStats = {
    estimatesCreated: estimates.filter(e => e.jobDetails.salesPerson === currentUser.name || currentUser.role === 'ADMIN').length,
    quotesGenerated: estimates.filter(e => e.quotationGenerated).length,
    approvedEstimates: estimates.filter(e => e.status === 'approved').length,
    totalRevenue: estimates.reduce((sum, e) => sum + (e.summary?.sellingPrice || 0), 0)
  };

  const handleSave = (values) => {
    console.log('Saving:', values);
    message.success('Profile updated successfully!');
    setEditing(false);
  };

  const handlePasswordChange = (values) => {
    console.log('Password change:', values);
    message.success('Password updated successfully!');
    passwordForm.resetFields();
  };

  const activityHistory = [
    { action: 'Created estimate EST-2024-006', time: '2 hours ago', icon: <FileTextOutlined style={{ color: 'hsl(var(--primary))' }} /> },
    { action: 'Generated quotation for Acme Corp', time: '5 hours ago', icon: <CheckCircleOutlined style={{ color: 'hsl(var(--success))' }} /> },
    { action: 'Updated paper master rates', time: '1 day ago', icon: <SettingOutlined style={{ color: 'hsl(var(--warning))' }} /> },
    { action: 'Logged in from Chrome on Windows', time: '2 days ago', icon: <SafetyOutlined style={{ color: 'hsl(var(--info))' }} /> },
    { action: 'Changed password', time: '1 week ago', icon: <LockOutlined style={{ color: 'hsl(var(--destructive))' }} /> }
  ];

  return (
    <div className="profile-page animate-fade-in">
      <Title level={3} style={{ marginBottom: 24 }}>My Profile</Title>

      <Row gutter={[24, 24]}>
        {/* Profile Card */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Main Profile Card */}
            <Card className="profile-card">
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    size={120}
                    icon={<UserOutlined />}
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.7) 100%)',
                      fontSize: 48,
                      boxShadow: '0 8px 24px hsl(var(--primary) / 0.3)'
                    }}
                  />
                  <Upload showUploadList={false}>
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<CameraOutlined />}
                      size="small"
                      style={{
                        position: 'absolute',
                        bottom: 4,
                        right: 4,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                    />
                  </Upload>
                </div>
                
                <Title level={4} style={{ marginTop: 20, marginBottom: 4 }}>
                  {currentUser.name}
                </Title>
                <Text type="secondary">{currentUser.email}</Text>
                
                <div style={{ marginTop: 16 }}>
                  <Tag 
                    color={roleColors[currentUser.role]} 
                    style={{ fontSize: 14, padding: '6px 16px', borderRadius: 20 }}
                  >
                    {currentUser.role}
                  </Tag>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {roleDescriptions[currentUser.role]}
                    </Text>
                  </div>
                </div>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0' }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'hsl(var(--primary) / 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MailOutlined style={{ color: 'hsl(var(--primary))', fontSize: 18 }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Email Address</Text>
                    <Paragraph style={{ margin: 0, fontWeight: 500 }}>{currentUser.email}</Paragraph>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0' }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'hsl(var(--success) / 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <PhoneOutlined style={{ color: 'hsl(var(--success))', fontSize: 18 }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Phone Number</Text>
                    <Paragraph style={{ margin: 0, fontWeight: 500 }}>+91 98765 43210</Paragraph>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0' }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'hsl(var(--warning) / 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <HistoryOutlined style={{ color: 'hsl(var(--warning))', fontSize: 18 }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Member Since</Text>
                    <Paragraph style={{ margin: 0, fontWeight: 500 }}>January 2024</Paragraph>
                  </div>
                </div>
              </Space>
            </Card>

            {/* Stats Card */}
            <Card>
              <Title level={5} style={{ marginBottom: 16 }}>
                <TrophyOutlined style={{ marginRight: 8, color: 'hsl(var(--warning))' }} />
                Your Performance
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small" style={{ background: 'hsl(var(--primary) / 0.05)', border: 'none', textAlign: 'center' }}>
                    <Statistic 
                      value={userStats.estimatesCreated} 
                      title={<Text style={{ fontSize: 11 }}>Estimates</Text>}
                      valueStyle={{ color: 'hsl(var(--primary))', fontSize: 28 }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" style={{ background: 'hsl(var(--success) / 0.05)', border: 'none', textAlign: 'center' }}>
                    <Statistic 
                      value={userStats.approvedEstimates} 
                      title={<Text style={{ fontSize: 11 }}>Approved</Text>}
                      valueStyle={{ color: 'hsl(var(--success))', fontSize: 28 }}
                    />
                  </Card>
                </Col>
              </Row>
            </Card>
          </Space>
        </Col>

        {/* Details Tabs */}
        <Col xs={24} lg={16}>
          <Card>
            <Tabs
              defaultActiveKey="details"
              items={[
                {
                  key: 'details',
                  label: (
                    <Space>
                      <UserOutlined />
                      Personal Details
                    </Space>
                  ),
                  children: (
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleSave}
                      initialValues={{
                        firstName: currentUser.name.split(' ')[0],
                        lastName: currentUser.name.split(' ')[1] || '',
                        email: currentUser.email,
                        phone: '+91 98765 43210',
                        department: 'Production',
                        designation: 'Senior Estimator',
                        employeeId: 'EMP-001'
                      }}
                    >
                      <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                          <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                            <Input disabled={!editing} prefix={<UserOutlined />} size="large" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item name="lastName" label="Last Name">
                            <Input disabled={!editing} size="large" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item name="email" label="Email Address">
                            <Input disabled prefix={<MailOutlined />} size="large" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item name="phone" label="Phone Number">
                            <Input disabled={!editing} prefix={<PhoneOutlined />} size="large" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item name="employeeId" label="Employee ID">
                            <Input disabled size="large" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item name="department" label="Department">
                            <Input disabled={!editing} size="large" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item name="designation" label="Designation">
                            <Input disabled={!editing} size="large" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider />

                      <Space>
                        {editing ? (
                          <>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
                              Save Changes
                            </Button>
                            <Button onClick={() => setEditing(false)} size="large">Cancel</Button>
                          </>
                        ) : (
                          <Button icon={<EditOutlined />} onClick={() => setEditing(true)} size="large">
                            Edit Profile
                          </Button>
                        )}
                      </Space>
                    </Form>
                  )
                },
                {
                  key: 'security',
                  label: (
                    <Space>
                      <LockOutlined />
                      Security
                    </Space>
                  ),
                  children: (
                    <div>
                      <Title level={5}>Change Password</Title>
                      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                        Ensure your account is using a strong password for security
                      </Text>
                      
                      <Form 
                        form={passwordForm}
                        layout="vertical" 
                        style={{ maxWidth: 400 }}
                        onFinish={handlePasswordChange}
                      >
                        <Form.Item 
                          name="currentPassword" 
                          label="Current Password"
                          rules={[{ required: true, message: 'Enter current password' }]}
                        >
                          <Input.Password prefix={<LockOutlined />} placeholder="Enter current password" size="large" />
                        </Form.Item>
                        <Form.Item 
                          name="newPassword" 
                          label="New Password"
                          rules={[
                            { required: true, message: 'Enter new password' },
                            { min: 8, message: 'Password must be at least 8 characters' }
                          ]}
                        >
                          <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" size="large" />
                        </Form.Item>
                        <Form.Item 
                          name="confirmPassword" 
                          label="Confirm New Password"
                          dependencies={['newPassword']}
                          rules={[
                            { required: true, message: 'Confirm your password' },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(new Error('Passwords do not match'));
                              },
                            }),
                          ]}
                        >
                          <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" size="large" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" icon={<LockOutlined />} size="large">
                          Update Password
                        </Button>
                      </Form>

                      <Divider style={{ margin: '32px 0' }} />

                      <Title level={5}>Two-Factor Authentication</Title>
                      <Card size="small" style={{ background: 'hsl(var(--muted))', border: 'none', maxWidth: 400 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Text strong>Enable 2FA</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Add an extra layer of security
                            </Text>
                          </div>
                          <Switch />
                        </div>
                      </Card>
                    </div>
                  )
                },
                {
                  key: 'notifications',
                  label: (
                    <Space>
                      <BellOutlined />
                      Notifications
                    </Space>
                  ),
                  children: (
                    <div>
                      <Title level={5}>Notification Preferences</Title>
                      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                        Choose what notifications you receive
                      </Text>
                      
                      <Space direction="vertical" style={{ width: '100%', maxWidth: 500 }} size="large">
                        {[
                          { title: 'Email Notifications', desc: 'Receive email updates about estimates', default: true },
                          { title: 'Quote Approvals', desc: 'Get notified when quotes are approved', default: true },
                          { title: 'Daily Summary', desc: 'Receive daily summary of activities', default: false },
                          { title: 'New Estimate Alerts', desc: 'Alert when new estimate is created', default: true },
                          { title: 'System Updates', desc: 'Receive system maintenance notifications', default: false }
                        ].map((item, index) => (
                          <Card key={index} size="small" style={{ background: 'hsl(var(--muted))', border: 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <Text strong>{item.title}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text>
                              </div>
                              <Switch defaultChecked={item.default} />
                            </div>
                          </Card>
                        ))}
                      </Space>
                    </div>
                  )
                },
                {
                  key: 'activity',
                  label: (
                    <Space>
                      <HistoryOutlined />
                      Activity
                    </Space>
                  ),
                  children: (
                    <div>
                      <Title level={5}>Recent Activity</Title>
                      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                        Your latest actions in the system
                      </Text>
                      
                      <Timeline
                        items={activityHistory.map((item, index) => ({
                          dot: item.icon,
                          children: (
                            <div>
                              <Text strong>{item.action}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                            </div>
                          )
                        }))}
                      />
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;

