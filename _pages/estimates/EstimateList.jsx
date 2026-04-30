'use client';
import React, { useState } from 'react';
import {
  Card, Table, Input, Select, Button, Space, Tag, Typography, Row, Col, DatePicker,
  Dropdown, Grid, Modal, Descriptions, Divider, message, Popconfirm
} from 'antd';
import {
  SearchOutlined, FilterOutlined, PlusOutlined, EyeOutlined, EditOutlined,
  FileTextOutlined, MoreOutlined, CheckCircleOutlined, ClockCircleOutlined,
  SyncOutlined, DeleteOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useEstimate } from '../../context/EstimateContext';
import { formatCurrency, formatNumber } from '../../utils/calculations';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

// Status configuration
const STATUS_CONFIG = {
  draft: { color: 'default', icon: <ClockCircleOutlined />, label: 'Draft' },
  pending: { color: 'processing', icon: <SyncOutlined spin />, label: 'Pending' },
  approved: { color: 'success', icon: <CheckCircleOutlined />, label: 'Approved' },
  completed: { color: 'blue', icon: <CheckCircleOutlined />, label: 'Completed' }
};

const EstimateList = () => {
  const router = useRouter();
  const screens = useBreakpoint();
  const { hasPermission } = useAuth();
  const { estimates, deleteEstimate, updateEstimateStatus } = useEstimate();
  const isMobile = !screens.md;

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  // Filter estimates
  const filteredEstimates = estimates.filter((est) => {
    const matchesSearch =
      est.jobDetails.jobName.toLowerCase().includes(searchText.toLowerCase()) ||
      est.jobDetails.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      est.id.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || est.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle view estimate
  const handleView = (estimate) => {
    setSelectedEstimate(estimate);
    setViewModalVisible(true);
  };

  // Handle delete
  const handleDelete = (estimateId) => {
    deleteEstimate(estimateId);
    message.success('Estimate deleted successfully');
  };

  // Handle status change
  const handleStatusChange = (estimateId, newStatus) => {
    updateEstimateStatus(estimateId, newStatus);
    message.success(`Status updated to ${newStatus}`);
  };

  // Action menu items
  const getActionMenuItems = (record) => {
    const items = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'View Details',
        onClick: () => handleView(record)
      },
      {
        key: 'quote',
        icon: <FileTextOutlined />,
        label: 'View Quotation',
        onClick: () => router.push(`/quotation/${record.id}`)
      }
    ];

    if (hasPermission('canEditEstimate')) {
      items.push({
        type: 'divider'
      });
      items.push({
        key: 'approve',
        icon: <CheckCircleOutlined />,
        label: 'Mark as Approved',
        onClick: () => handleStatusChange(record.id, 'approved'),
        disabled: record.status === 'approved'
      });
      items.push({
        key: 'complete',
        icon: <CheckCircleOutlined />,
        label: 'Mark as Completed',
        onClick: () => handleStatusChange(record.id, 'completed'),
        disabled: record.status === 'completed'
      });
    }

    if (hasPermission('canDeleteEstimate')) {
      items.push({ type: 'divider' });
      items.push({
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        danger: true,
        onClick: () => {
          Modal.confirm({
            title: 'Delete Estimate',
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to delete ${record.id}?`,
            okText: 'Delete',
            okType: 'danger',
            onOk: () => handleDelete(record.id)
          });
        }
      });
    }

    return items;
  };

  // Table columns
  const columns = [
    {
      title: 'Estimate ID',
      dataIndex: 'id',
      key: 'id',
      width: 140,
      render: (id) => (
        <Text strong style={{ color: 'hsl(var(--primary))' }}>
          {id}
        </Text>
      ),
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
      width: 120,
      responsive: ['lg']
    },
    {
      title: 'Quantity',
      dataIndex: ['jobDetails', 'quantity'],
      key: 'quantity',
      width: 100,
      render: (qty) => formatNumber(qty),
      responsive: ['md']
    },
    {
      title: 'Total Cost',
      dataIndex: ['summary', 'totalCost'],
      key: 'totalCost',
      width: 120,
      render: (cost) => formatCurrency(cost || 0),
      responsive: ['lg']
    },
    {
      title: 'Selling Price',
      dataIndex: ['summary', 'sellingPrice'],
      key: 'sellingPrice',
      width: 130,
      render: (price) => (
        <Text strong style={{ color: 'hsl(var(--success))' }}>
          {formatCurrency(price || 0)}
        </Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
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
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  // Mobile Card View
  const MobileEstimateCard = ({ estimate }) => {
    const config = STATUS_CONFIG[estimate.status];
    return (
      <Card
        size="small"
        style={{ marginBottom: 12 }}
        actions={[
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(estimate)}
            key="view"
          >
            View
          </Button>,
          <Button
            type="text"
            icon={<FileTextOutlined />}
            onClick={() => router.push(`/quotation/${estimate.id}`)}
            key="quote"
          >
            Quote
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <Text strong style={{ color: 'hsl(var(--primary))' }}>{estimate.id}</Text>
            <Tag icon={config.icon} color={config.color}>
              {config.label}
            </Tag>
          </Space>
          <Text strong>{estimate.jobDetails.jobName}</Text>
          <Text type="secondary">{estimate.jobDetails.customerName}</Text>
          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <Text type="secondary">Qty: {formatNumber(estimate.jobDetails.quantity)}</Text>
            <Text strong style={{ color: 'hsl(var(--success))', fontSize: 16 }}>
              {formatCurrency(estimate.summary?.sellingPrice || 0)}
            </Text>
          </Space>
        </Space>
      </Card>
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>Estimates</Title>
          <Text type="secondary">Manage all your printing estimates ({filteredEstimates.length} total)</Text>
        </Col>
        <Col>
          {hasPermission('canCreateEstimate') && (
            <Space wrap>
              <Button
                icon={<PlusOutlined />}
                onClick={() => router.push('/estimates/create')}
                size={isMobile ? 'middle' : 'large'}
              >
                {isMobile ? 'Old' : 'Old Form'}
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => router.push('/estimates/new')}
                size={isMobile ? 'middle' : 'large'}
              >
                {isMobile ? 'New' : 'New Estimate'}
              </Button>
            </Space>
          )}
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={10}>
            <Input
              placeholder="Search by job name, customer, or ID..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="large"
            />
          </Col>
          <Col xs={12} md={6}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              size="large"
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'draft', label: 'Draft' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'completed', label: 'Completed' }
              ]}
            />
          </Col>
          {!isMobile && (
            <Col xs={12} md={6}>
              <RangePicker style={{ width: '100%' }} size="large" placeholder={['Start Date', 'End Date']} />
            </Col>
          )}
        </Row>
      </Card>

      {/* Content */}
      <Card>
        {isMobile ? (
          // Mobile Card List
          <div>
            {filteredEstimates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <FileTextOutlined style={{ fontSize: 64, color: 'hsl(var(--muted-foreground))' }} />
                <Title level={5} style={{ marginTop: 16, color: 'hsl(var(--muted-foreground))' }}>
                  No estimates found
                </Title>
                <Text type="secondary">Try adjusting your search or filters</Text>
              </div>
            ) : (
              filteredEstimates.map((estimate) => (
                <MobileEstimateCard key={estimate.id} estimate={estimate} />
              ))
            )}
          </div>
        ) : (
          // Desktop Table
          <Table
            columns={columns}
            dataSource={filteredEstimates}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} estimates`
            }}
            scroll={{ x: 900 }}
          />
        )}
      </Card>

      {/* View Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            Estimate Details - {selectedEstimate?.id}
          </Space>
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="quote"
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => {
              setViewModalVisible(false);
              router.push(`/quotation/${selectedEstimate?.id}`);
            }}
          >
            View Quotation
          </Button>
        ]}
      >
        {selectedEstimate && (
          <div>
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Customer">
                {selectedEstimate.jobDetails.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Job Name">
                {selectedEstimate.jobDetails.jobName}
              </Descriptions.Item>
              <Descriptions.Item label="Product Type">
                {selectedEstimate.jobDetails.productType}
              </Descriptions.Item>
              <Descriptions.Item label="Quantity">
                {formatNumber(selectedEstimate.jobDetails.quantity)}
              </Descriptions.Item>
              <Descriptions.Item label="Sales Person">
                {selectedEstimate.jobDetails.salesPerson || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={STATUS_CONFIG[selectedEstimate.status].color}>
                  {STATUS_CONFIG[selectedEstimate.status].label}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider>Cost Breakdown</Divider>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Paper Cost">
                {formatCurrency(selectedEstimate.summary?.paperCost || 0)}
              </Descriptions.Item>
              <Descriptions.Item label="Printing Cost">
                {formatCurrency(selectedEstimate.summary?.printingCost || 0)}
              </Descriptions.Item>
              <Descriptions.Item label="Process Cost">
                {formatCurrency(selectedEstimate.summary?.processCost || 0)}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Total Cost</Text>}>
                <Text strong>{formatCurrency(selectedEstimate.summary?.totalCost || 0)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Profit">
                <Text type="success">
                  {selectedEstimate.summary?.profitPercent}% ({formatCurrency(selectedEstimate.summary?.profitAmount || 0)})
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Selling Price</Text>}>
                <Text strong style={{ color: 'hsl(var(--success))', fontSize: 18 }}>
                  {formatCurrency(selectedEstimate.summary?.sellingPrice || 0)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Cost per Unit">
                {formatCurrency(selectedEstimate.summary?.costPerUnit || 0)}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EstimateList;

