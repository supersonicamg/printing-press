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
  Select,
  Alert
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
import { useAuth } from '../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;

const Login = () => {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [loginForm] = Form.useForm();
  const [signupForm] = Form.useForm();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      await signIn(values.email, values.password);
      message.success('Welcome back!');
      router.push('/');
    } catch (err) {
      message.error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (values) => {
    setLoading(true);
    try {
      const name = `${values.firstName} ${values.lastName}`.trim();
      await signUp(values.email, values.password, name, values.role);
      setSignupSuccess(true);
      message.success('Account created! Please check your email to confirm your account.');
    } catch (err) {
      message.error(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
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

            <Space direction="vertical" style={{ width: '100%', textAlign: 'left' }}>
              {[
                { icon: '📋', text: 'Multi-step printing estimates' },
                { icon: '📊', text: 'Real-time cost calculations' },
                { icon: '📄', text: 'Professional quotation generation' },
                { icon: '🔒', text: 'Role-based access control' }
              ].map((item) => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <Text style={{ color: 'rgba(255,255,255,0.8)' }}>{item.text}</Text>
                </div>
              ))}
            </Space>
          </div>
        </Col>

        {/* Right side - Login Form */}
        <Col xs={24} lg={12}>
          <Card
            style={{ borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: 'none' }}
            styles={{ body: { padding: '32px' } }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              centered
              items={[
                {
                  key: 'login',
                  label: <span><LoginOutlined /> Login</span>,
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
                    </Form>
                  )
                },
                {
                  key: 'signup',
                  label: <span><UserAddOutlined /> Sign Up</span>,
                  children: (
                    <>
                      {signupSuccess ? (
                        <Alert
                          message="Account Created!"
                          description="Please check your email inbox and click the confirmation link before logging in."
                          type="success"
                          showIcon
                          style={{ marginBottom: 16 }}
                        />
                      ) : (
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
                              placeholder="Create a password (min 6 chars)"
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
                      )}
                    </>
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