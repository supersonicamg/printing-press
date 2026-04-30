'use client';
import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Tabs,
  Space,
  Divider,
  message,
  Row,
  Col,
  Select
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  LoginOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth, ROLES } from '../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;

const Login = () => {
  const router = useRouter();
  const { switchUser } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm();
  const [signupForm] = Form.useForm();

  const handleLogin = async (values) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Static role-based login
      const roleMap = {
        'admin@printpress.com': 'admin',
        'estimator@printpress.com': 'estimator',
        'sales@printpress.com': 'sales',
        'viewer@printpress.com': 'viewer'
      };
      
      const userType = roleMap[values.email.toLowerCase()];
      if (userType) {
        switchUser(userType);
        message.success(`Welcome back! Logged in as ${userType.toUpperCase()}`);
        router.push('/');
      } else {
        // Default to viewer for any other email
        switchUser('viewer');
        message.success('Logged in successfully!');
        router.push('/');
      }
      setLoading(false);
    }, 1000);
  };

  const handleSignup = async (values) => {
    setLoading(true);
    setTimeout(() => {
      const roleKey = values.role.toLowerCase();
      switchUser(roleKey);
      message.success('Account created successfully!');
      router.push('/');
      setLoading(false);
    }, 1000);
  };

  const demoLogins = [
    { email: 'admin@printpress.com', role: 'Admin', desc: 'Full access' },
    { email: 'estimator@printpress.com', role: 'Estimator', desc: 'Create estimates' },
    { email: 'sales@printpress.com', role: 'Sales', desc: 'View & quote' },
    { email: 'viewer@printpress.com', role: 'Viewer', desc: 'Read only' }
  ];

  const handleDemoLogin = (email) => {
    loginForm.setFieldsValue({ email, password: 'demo123' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, hsl(210 30% 12%) 0%, hsl(210 35% 20%) 50%, hsl(210 30% 12%) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Row style={{ width: '100%', maxWidth: 1000 }} gutter={[32, 32]} align="middle">
        {/* Left side - Branding */}
        <Col xs={24} lg={12}>
          <div style={{ textAlign: 'center', color: 'white', padding: '20px' }}>
            <div style={{
              width: 80,
              height: 80,
              background: 'linear-gradient(135deg, hsl(210 100% 50%) 0%, hsl(180 60% 45%) 100%)',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 36,
              fontWeight: 'bold',
              color: 'white',
              boxShadow: '0 10px 40px rgba(24, 144, 255, 0.4)'
            }}>
              PP
            </div>
            <Title level={2} style={{ color: 'white', marginBottom: 8 }}>
              PrintMaster Press
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>
              Professional Printing Estimation System
            </Paragraph>
            
            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '32px 0' }} />
            
            <div style={{ textAlign: 'left' }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                Demo Accounts
              </Text>
              <Space direction="vertical" style={{ width: '100%', marginTop: 12 }}>
                {demoLogins.map((demo) => (
                  <Button
                    key={demo.email}
                    type="text"
                    block
                    onClick={() => handleDemoLogin(demo.email)}
                    style={{
                      textAlign: 'left',
                      color: 'rgba(255,255,255,0.8)',
                      height: 'auto',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        <strong>{demo.role}</strong>
                        <Text style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 8, fontSize: 12 }}>
                          {demo.desc}
                        </Text>
                      </span>
                      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{demo.email}</Text>
                    </div>
                  </Button>
                ))}
              </Space>
            </div>
          </div>
        </Col>

        {/* Right side - Login Form */}
        <Col xs={24} lg={12}>
          <Card
            style={{
              borderRadius: 16,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              border: 'none'
            }}
            bodyStyle={{ padding: '32px' }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              centered
              items={[
                {
                  key: 'login',
                  label: (
                    <span>
                      <LoginOutlined />
                      Login
                    </span>
                  ),
                  children: (
                    <Form
                      form={loginForm}
                      layout="vertical"
                      onFinish={handleLogin}
                      requiredMark={false}
                      size="large"
                    >
                      <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                          { required: true, message: 'Please enter your email' },
                          { type: 'email', message: 'Please enter a valid email' }
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined style={{ color: 'rgba(0,0,0,0.3)' }} />}
                          placeholder="Enter your email"
                        />
                      </Form.Item>

                      <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true, message: 'Please enter your password' }]}
                      >
                        <Input.Password
                          prefix={<LockOutlined style={{ color: 'rgba(0,0,0,0.3)' }} />}
                          placeholder="Enter your password"
                        />
                      </Form.Item>

                      <Form.Item style={{ marginBottom: 16 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          block
                          loading={loading}
                          icon={<LoginOutlined />}
                        >
                          Sign In
                        </Button>
                      </Form.Item>

                      <div style={{ textAlign: 'center' }}>
                        <Button type="link" size="small">
                          Forgot Password?
                        </Button>
                      </div>
                    </Form>
                  )
                },
                {
                  key: 'signup',
                  label: (
                    <span>
                      <UserAddOutlined />
                      Sign Up
                    </span>
                  ),
                  children: (
                    <Form
                      form={signupForm}
                      layout="vertical"
                      onFinish={handleSignup}
                      requiredMark={false}
                      size="large"
                    >
                      <Row gutter={12}>
                        <Col span={12}>
                          <Form.Item
                            name="firstName"
                            label="First Name"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input
                              prefix={<UserOutlined style={{ color: 'rgba(0,0,0,0.3)' }} />}
                              placeholder="First name"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="lastName"
                            label="Last Name"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input placeholder="Last name" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                          { required: true, message: 'Please enter your email' },
                          { type: 'email', message: 'Please enter a valid email' }
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined style={{ color: 'rgba(0,0,0,0.3)' }} />}
                          placeholder="Enter your email"
                        />
                      </Form.Item>

                      <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[{ required: true, message: 'Please enter phone number' }]}
                      >
                        <Input
                          prefix={<PhoneOutlined style={{ color: 'rgba(0,0,0,0.3)' }} />}
                          placeholder="+91 98765 43210"
                        />
                      </Form.Item>

                      <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select a role' }]}
                        initialValue="VIEWER"
                      >
                        <Select
                          placeholder="Select your role"
                          options={[
                            { value: 'ADMIN', label: 'Admin - Full Access' },
                            { value: 'ESTIMATOR', label: 'Estimator - Create Estimates' },
                            { value: 'SALES', label: 'Sales - View & Quotation' },
                            { value: 'VIEWER', label: 'Viewer - Read Only' }
                          ]}
                        />
                      </Form.Item>

                      <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                          { required: true, message: 'Please create a password' },
                          { min: 6, message: 'Password must be at least 6 characters' }
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined style={{ color: 'rgba(0,0,0,0.3)' }} />}
                          placeholder="Create a password"
                        />
                      </Form.Item>

                      <Form.Item style={{ marginBottom: 0 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          block
                          loading={loading}
                          icon={<UserAddOutlined />}
                        >
                          Create Account
                        </Button>
                      </Form.Item>
                    </Form>
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

export default Login;

