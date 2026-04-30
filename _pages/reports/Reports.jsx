'use client';
import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  DatePicker,
  Button,
  Table,
  Space,
  Select,
  Statistic,
  Progress,
  Tag
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  PrinterOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { formatCurrency } from '../../utils/calculations';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Reports = () => {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState(null);

  // Mock chart data
  const monthlyData = [
    { month: 'Jan', revenue: 285000, cost: 220000, profit: 65000 },
    { month: 'Feb', revenue: 320000, cost: 248000, profit: 72000 },
    { month: 'Mar', revenue: 290000, cost: 225000, profit: 65000 },
    { month: 'Apr', revenue: 380000, cost: 295000, profit: 85000 },
    { month: 'May', revenue: 420000, cost: 320000, profit: 100000 },
    { month: 'Jun', revenue: 350000, cost: 270000, profit: 80000 }
  ];

  const categoryData = [
    { name: 'Brochures', value: 35, color: '#1890ff' },
    { name: 'Books', value: 25, color: '#52c41a' },
    { name: 'Business Cards', value: 20, color: '#faad14' },
    { name: 'Catalogs', value: 12, color: '#eb2f96' },
    { name: 'Others', value: 8, color: '#722ed1' }
  ];

  const salesPersonData = [
    { name: 'Rahul V.', target: 500000, achieved: 380000 },
    { name: 'Anita D.', target: 450000, achieved: 420000 },
    { name: 'Kiran R.', target: 400000, achieved: 310000 },
    { name: 'Suresh M.', target: 550000, achieved: 490000 }
  ];

  const topCustomers = [
    { key: 1, customer: 'Acme Corporation', orders: 24, revenue: 485000, growth: 12 },
    { key: 2, customer: 'TechStart India', orders: 18, revenue: 320000, growth: 8 },
    { key: 3, customer: 'Sunrise Publishers', orders: 32, revenue: 680000, growth: 15 },
    { key: 4, customer: 'Fashion Hub', orders: 12, revenue: 180000, growth: -5 },
    { key: 5, customer: 'Metro Pharma', orders: 8, revenue: 95000, growth: 22 }
  ];

  const columns = [
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Orders',
      dataIndex: 'orders',
      key: 'orders',
      align: 'center'
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (val) => formatCurrency(val)
    },
    {
      title: 'Growth',
      dataIndex: 'growth',
      key: 'growth',
      render: (val) => (
        <Space>
          {val >= 0 ? <RiseOutlined style={{ color: '#52c41a' }} /> : <FallOutlined style={{ color: '#ff4d4f' }} />}
          <Text style={{ color: val >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {val >= 0 ? '+' : ''}{val}%
          </Text>
        </Space>
      )
    }
  ];

  return (
    <div className="animate-fade-in">
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            <BarChartOutlined style={{ marginRight: 12 }} />
            Reports & Analytics
          </Title>
        </Col>
        <Col>
          <Space wrap>
            <RangePicker onChange={setDateRange} />
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: 150 }}
              options={[
                { value: 'sales', label: 'Sales Report' },
                { value: 'estimates', label: 'Estimates Report' },
                { value: 'customers', label: 'Customer Report' }
              ]}
            />
            <Button icon={<DownloadOutlined />}>Export</Button>
            <Button icon={<PrinterOutlined />}>Print</Button>
          </Space>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Revenue"
              value={2045000}
              prefix="₹"
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="green" style={{ margin: 0 }}>+12% vs last month</Tag>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Estimates"
              value={156}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="blue" style={{ margin: 0 }}>34 this month</Tag>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Conversion Rate"
              value={72}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="gold" style={{ margin: 0 }}>+5% improvement</Tag>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Avg. Profit Margin"
              value={22.5}
              suffix="%"
              valueStyle={{ color: '#eb2f96' }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="purple" style={{ margin: 0 }}>Above target</Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={<><LineChartOutlined /> Revenue Trend</>}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1"
                  stroke="#1890ff" 
                  fill="#1890ff" 
                  fillOpacity={0.3}
                  name="Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stackId="2"
                  stroke="#52c41a" 
                  fill="#52c41a"
                  fillOpacity={0.3}
                  name="Profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<><PieChartOutlined /> By Category</>}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Sales Person Performance */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Sales Team Performance">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {salesPersonData.map((person) => (
                <div key={person.name}>
                  <Row justify="space-between" style={{ marginBottom: 4 }}>
                    <Text>{person.name}</Text>
                    <Text type="secondary">
                      {formatCurrency(person.achieved)} / {formatCurrency(person.target)}
                    </Text>
                  </Row>
                  <Progress 
                    percent={Math.round((person.achieved / person.target) * 100)} 
                    status={person.achieved >= person.target ? 'success' : 'active'}
                    strokeColor={person.achieved >= person.target ? '#52c41a' : '#1890ff'}
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top Customers">
            <Table
              columns={columns}
              dataSource={topCustomers}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Monthly Comparison */}
      <Card title={<><BarChartOutlined /> Monthly Comparison</>}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(val) => formatCurrency(val)} />
            <Legend />
            <Bar dataKey="revenue" name="Revenue" fill="#1890ff" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cost" name="Cost" fill="#ff7a45" radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit" name="Profit" fill="#52c41a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default Reports;

