'use client';
import React from 'react';
import {
  Row, Col, Card, Statistic, Table, Tag, Typography, Space, Button, Progress, Grid
} from 'antd';
import {
  FileTextOutlined, ClockCircleOutlined, DollarOutlined, RiseOutlined,
  ArrowRightOutlined, CheckCircleOutlined, SyncOutlined, PlusOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useEstimate } from '../context/EstimateContext';
import { formatCurrency } from '../utils/calculations';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Status tag configuration
const STATUS_CONFIG = {
  draft: { color: 'default', icon: <ClockCircleOutlined />, label: 'Draft' },
  pending: { color: 'processing', icon: <SyncOutlined spin />, label: 'Pending' },
  approved: { color: 'success', icon: <CheckCircleOutlined />, label: 'Approved' },
  completed: { color: 'blue', icon: <CheckCircleOutlined />, label: 'Completed' }
};

const Dashboard = () => {
  const router = useRouter();
  const screens = useBreakpoint();
  const { hasPermission } = useAuth();
  const { estimates, getDashboardStats } = useEstimate();
  const isMobile = !screens.md;

  // Get dynamic stats from context
  const stats = getDashboardStats();

  // Statistics cards data
  const statsCards = [
    {
      title: 'Total Estimates',
      value: stats.totalEstimates,
      icon: <FileTextOutlined />,
      color: '#1890ff',
      suffix: null,
      trend: `${estimates.filter(e => {
        const created = new Date(e.createdAt);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length} this month`
    },
    {
      title: 'Pending Quotes',
      value: stats.pendingQuotes,
      icon: <ClockCircleOutlined />,
      color: '#faad14',
      suffix: null,
      trend: 'Awaiting approval'
    },
    {
      title: 'Avg. Cost / Job',
      value: stats.avgCostPerJob,
      icon: <DollarOutlined />,
      color: '#52c41a',
      prefix: '₹',
      trend: 'Based on all estimates'
    },
    {
      title: 'Conversion Rate',
      value: stats.totalEstimates > 0 ? Math.round((stats.approvedEstimates / stats.totalEstimates) * 100) : 0,
      icon: <RiseOutlined />,
      color: '#722ed1',
      suffix: '%',
      trend: `${stats.approvedEstimates} approved`
    }
  ];

  // Table columns for recent estimates
  const columns = [
    {
      title: 'Estimate ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text strong style={{ color: '#1890ff' }}>{id}</Text>,
      responsive: ['md']
    },
    {
      title: 'Job Details',
      key: 'job',
      render: (_, record) => (
        <div>
          <Text strong>{record.jobDetails.jobName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.jobDetails.customerName}
          </Text>
        </div>
      )
    },
    {
      title: 'Product',
      dataIndex: ['jobDetails', 'productType'],
      key: 'product',
      responsive: ['lg']
    },
    {
      title: 'Quantity',
      dataIndex: ['jobDetails', 'quantity'],
      key: 'quantity',
      render: (qty) => qty?.toLocaleString(),
      responsive: ['md']
    },
    {
      title: 'Total Cost',
      dataIndex: ['summary', 'sellingPrice'],
      key: 'cost',
      render: (cost) => (
        <Text strong style={{ color: '#52c41a' }}>
          {formatCurrency(cost || 0)}
        </Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.label}
          </Tag>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => router.push(`/quotation/${record.id}`)}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>Dashboard</Title>
            <Text type="secondary">Welcome back! Here's your printing press overview.</Text>
          </Col>
          {hasPermission('canCreateEstimate') && (
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/estimates/create')}>
                New Estimate
              </Button>
            </Col>
          )}
        </Row>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statsCards.map((stat, index) => (
          <Col xs={12} sm={12} md={6} key={index}>
            <Card
              className="stat-card hover-scale"
              style={{ height: '100%' }}
              styles={{ body: { padding: isMobile ? 16 : 24 } }}
            >
              <Space
                direction={isMobile ? 'vertical' : 'horizontal'}
                align="start"
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <div>
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    valueStyle={{
                      fontSize: isMobile ? 24 : 32,
                      fontWeight: 700,
                      color: stat.color
                    }}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {stat.trend}
                  </Text>
                </div>
                <div
                  style={{
                    width: isMobile ? 40 : 56,
                    height: isMobile ? 40 : 56,
                    borderRadius: 12,
                    background: `${stat.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? 20 : 24,
                    color: stat.color
                  }}
                >
                  {stat.icon}
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content Row */}
      <Row gutter={[16, 16]}>
        {/* Recent Estimates */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <span>Recent Estimates</span>
              </Space>
            }
            extra={
              <Button type="link" onClick={() => router.push('/estimates')}>
                View All <ArrowRightOutlined />
              </Button>
            }
          >
            {isMobile ? (
              // Mobile Card View
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {estimates.slice(0, 5).map((estimate) => {
                  const config = STATUS_CONFIG[estimate.status];
                  return (
                    <Card
                      key={estimate.id}
                      size="small"
                      style={{ cursor: 'pointer' }}
                      onClick={() => router.push(`/quotation/${estimate.id}`)}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                          <Text strong>{estimate.jobDetails.jobName}</Text>
                          <Tag icon={config.icon} color={config.color}>
                            {config.label}
                          </Tag>
                        </Space>
                        <Text type="secondary">{estimate.jobDetails.customerName}</Text>
                        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                          <Text type="secondary">
                            Qty: {estimate.jobDetails.quantity?.toLocaleString()}
                          </Text>
                          <Text strong style={{ color: '#52c41a' }}>
                            {formatCurrency(estimate.summary?.sellingPrice || 0)}
                          </Text>
                        </Space>
                      </Space>
                    </Card>
                  );
                })}
              </Space>
            ) : (
              // Desktop Table View
              <Table
                columns={columns}
                dataSource={estimates.slice(0, 5)}
                rowKey="id"
                pagination={false}
                size="middle"
              />
            )}
          </Card>
        </Col>

        {/* Quick Stats & Actions */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* Quick Actions */}
            {hasPermission('canCreateEstimate') && (
              <Card title="Quick Actions">
                <Button
                  type="primary"
                  icon={<FileTextOutlined />}
                  block
                  size="large"
                  onClick={() => router.push('/estimates/create')}
                  style={{ marginBottom: 12 }}
                >
                  Create New Estimate
                </Button>
                <Button
                  icon={<FileTextOutlined />}
                  block
                  onClick={() => router.push('/estimates')}
                >
                  View All Estimates
                </Button>
              </Card>
            )}

            {/* Monthly Progress */}
            <Card title="Performance Overview">
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
                    <Text>Estimates Created</Text>
                    <Text strong>{stats.totalEstimates}</Text>
                  </Space>
                  <Progress
                    percent={Math.min((stats.totalEstimates / 50) * 100, 100)}
                    showInfo={false}
                    strokeColor="#1890ff"
                  />
                </div>
                <div>
                  <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
                    <Text>Approved</Text>
                    <Text strong>{stats.approvedEstimates}</Text>
                  </Space>
                  <Progress
                    percent={stats.totalEstimates > 0 ? (stats.approvedEstimates / stats.totalEstimates) * 100 : 0}
                    showInfo={false}
                    strokeColor="#52c41a"
                  />
                </div>
                <div>
                  <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
                    <Text>Completed Jobs</Text>
                    <Text strong>{stats.completedJobs}</Text>
                  </Space>
                  <Progress
                    percent={stats.totalEstimates > 0 ? (stats.completedJobs / stats.totalEstimates) * 100 : 0}
                    showInfo={false}
                    strokeColor="#722ed1"
                  />
                </div>
              </Space>
            </Card>

            {/* Revenue Card */}
            <Card>
              <Statistic
                title="Total Revenue"
                value={stats.monthlyRevenue}
                prefix="₹"
                valueStyle={{ color: '#52c41a', fontSize: 28, fontWeight: 700 }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                <RiseOutlined style={{ color: '#52c41a' }} /> From all estimates
              </Text>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

