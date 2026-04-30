'use client';
import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Space, Tag, Typography, Row, Col, message, Grid } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useMasterData } from '../../context/MasterDataContext';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const MasterPage = ({ type }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const {
    paperTypes, machines, inks, processes,
    addPaperType, addMachine, addInk, addProcess,
    updatePaperType, updateMachine, updateInk, updateProcess,
    deletePaperType, deleteMachine, deleteInk, deleteProcess,
  } = useMasterData();

  const currentData = { paper: paperTypes, machine: machines, ink: inks, process: processes };
  const addFn = { paper: addPaperType, machine: addMachine, ink: addInk, process: addProcess };
  const updateFn = { paper: updatePaperType, machine: updateMachine, ink: updateInk, process: updateProcess };
  const deleteFn = { paper: deletePaperType, machine: deleteMachine, ink: deleteInk, process: deleteProcess };

  const configs = {
    paper: {
      title: 'Paper Master',
      description: 'Manage paper types, GSM, and pricing',
      columns: [
        { title: 'Name', dataIndex: 'name', key: 'name', ellipsis: true },
        { title: 'GSM Range', dataIndex: 'gsmRange', key: 'gsmRange', responsive: ['md'] },
        { title: 'Rate/Kg', dataIndex: 'ratePerKg', key: 'ratePerKg', render: (v) => `₹${v}` },
        { title: 'Stock', dataIndex: 'stock', key: 'stock', render: (v) => <Tag color={v === 'Available' ? 'green' : 'orange'}>{v}</Tag> }
      ],
      formFields: [
        { name: 'name', label: 'Paper Name', type: 'input', rules: [{ required: true }] },
        { name: 'gsmRange', label: 'GSM Range', type: 'input', placeholder: 'e.g., 70-90' },
        { name: 'ratePerKg', label: 'Rate per Kg (₹)', type: 'number', min: 0 },
        { name: 'stock', label: 'Stock Status', type: 'select', options: ['Available', 'Low Stock', 'Out of Stock'] }
      ]
    },
    machine: {
      title: 'Machine Master',
      description: 'Manage printing machines and rates',
      columns: [
        { title: 'Name', dataIndex: 'name', key: 'name', ellipsis: true },
        { title: 'Type', dataIndex: 'type', key: 'type', responsive: ['sm'] },
        { title: 'Max Size', dataIndex: 'maxSize', key: 'maxSize', responsive: ['lg'] },
        { title: 'Colors', dataIndex: 'colors', key: 'colors', responsive: ['md'] },
        { title: 'Rate/Imp', dataIndex: 'ratePerImpression', key: 'rate', render: (v) => `₹${v}` }
      ],
      formFields: [
        { name: 'name', label: 'Machine Name', type: 'input', rules: [{ required: true }] },
        { name: 'type', label: 'Machine Type', type: 'select', options: ['Offset', 'Digital', 'Flexo', 'Letterpress'] },
        { name: 'maxSize', label: 'Max Sheet Size', type: 'input', placeholder: 'e.g., 20x30"' },
        { name: 'colors', label: 'Max Colors', type: 'number', min: 1, max: 10 },
        { name: 'ratePerImpression', label: 'Rate per Impression (₹)', type: 'number', min: 0, step: 0.01 }
      ]
    },
    ink: {
      title: 'Ink Master',
      description: 'Manage ink types and costs',
      columns: [
        { title: 'Name', dataIndex: 'name', key: 'name', ellipsis: true },
        { title: 'Type', dataIndex: 'type', key: 'type', responsive: ['sm'] },
        { title: 'Brand', dataIndex: 'brand', key: 'brand', responsive: ['md'] },
        { title: 'Rate/Kg', dataIndex: 'ratePerKg', key: 'ratePerKg', render: (v) => `₹${v}` }
      ],
      formFields: [
        { name: 'name', label: 'Ink Name', type: 'input', rules: [{ required: true }] },
        { name: 'type', label: 'Ink Type', type: 'select', options: ['Process', 'Spot', 'Metallic', 'Fluorescent'] },
        { name: 'brand', label: 'Brand', type: 'input' },
        { name: 'ratePerKg', label: 'Rate per Kg (₹)', type: 'number', min: 0 }
      ]
    },
    process: {
      title: 'Process Master',
      description: 'Manage finishing processes and pricing',
      columns: [
        { title: 'Name', dataIndex: 'name', key: 'name', ellipsis: true },
        { title: 'Type', dataIndex: 'type', key: 'type', responsive: ['sm'] },
        { title: 'Rate Type', dataIndex: 'rateType', key: 'rateType', responsive: ['lg'] },
        { title: 'Rate', dataIndex: 'rate', key: 'rate', render: (v) => `₹${v}` },
        { title: 'Min', dataIndex: 'minCharge', key: 'minCharge', render: (v) => `₹${v}`, responsive: ['md'] }
      ],
      formFields: [
        { name: 'name', label: 'Process Name', type: 'input', rules: [{ required: true }] },
        { name: 'type', label: 'Process Type', type: 'select', options: ['Pre-Press', 'Post-Press', 'Finishing'] },
        { name: 'rateType', label: 'Rate Type', type: 'select', options: ['Per Sheet', 'Per Unit', 'Fixed', 'Per Sqft'] },
        { name: 'rate', label: 'Rate (₹)', type: 'number', min: 0 },
        { name: 'minCharge', label: 'Minimum Charge (₹)', type: 'number', min: 0 }
      ]
    }
  };

  const config = configs[type];

  // Filter data based on search
  const filteredData = (currentData[type] || []).filter(item =>
    item.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingItem) {
        updateFn[type](editingItem.id, values);
      } else {
        addFn[type](values);
      }
      message.success(editingItem ? 'Item updated successfully!' : 'Item added successfully!');
      setIsModalOpen(false);
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Item',
      content: `Are you sure you want to delete "${record.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        deleteFn[type](record.id);
        message.success('Item deleted successfully!');
      }
    });
  };

  const columns = [
    ...config.columns,
    {
      title: 'Actions',
      key: 'actions',
      width: isMobile ? 80 : 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small" />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} size="small" />
        </Space>
      )
    }
  ];

  // Render form field based on type
  const renderFormField = (field) => {
    const commonProps = {
      style: { width: '100%' },
      size: isMobile ? 'large' : 'middle',
      placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`
    };

    switch (field.type) {
      case 'number':
        return <InputNumber {...commonProps} min={field.min} max={field.max} step={field.step || 1} />;
      case 'select':
        return (
          <Select {...commonProps} placeholder={`Select ${field.label.toLowerCase()}`}>
            {field.options?.map(opt => (
              <Select.Option key={opt} value={opt}>{opt}</Select.Option>
            ))}
          </Select>
        );
      default:
        return <Input {...commonProps} />;
    }
  };

  // Mobile card view
  const MobileCardView = () => (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {filteredData.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Text type="secondary">No items found</Text>
          </div>
        </Card>
      ) : (
        filteredData.map((item, index) => (
          <Card 
            key={item.id || index} 
            size="small"
            actions={[
              <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(item)} key="edit">Edit</Button>,
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item)} key="delete">Delete</Button>
            ]}
          >
            <Text strong style={{ fontSize: 15 }}>{item.name}</Text>
            <div style={{ marginTop: 8 }}>
              {config.columns.slice(1, 3).map(col => (
                <div key={col.key} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>{col.title}:</Text>
                  <Text style={{ fontSize: 12 }}>
                    {col.render ? col.render(item[col.dataIndex], item) : item[col.dataIndex]}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}
    </Space>
  );

  return (
    <div>
      <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Title level={3} style={{ margin: 0 }}>{config.title}</Title>
          <Text type="secondary">{config.description}</Text>
        </Col>
        <Col xs={24} md={12} style={{ textAlign: isMobile ? 'left' : 'right' }}>
          <Space wrap>
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: isMobile ? '100%' : 200 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add New
            </Button>
          </Space>
        </Col>
      </Row>
      
      <Card>
        {isMobile ? (
          <MobileCardView />
        ) : (
          <Table 
            columns={columns} 
            dataSource={filteredData} 
            rowKey="id" 
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 600 }}
          />
        )}
      </Card>

      <Modal 
        title={editingItem ? `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}` : `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`}
        open={isModalOpen} 
        onOk={handleSave} 
        onCancel={() => setIsModalOpen(false)}
        okText={editingItem ? 'Update' : 'Add'}
        width={isMobile ? '95%' : 520}
        centered
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {config.formFields?.map(field => (
            <Form.Item 
              key={field.name}
              name={field.name} 
              label={field.label} 
              rules={field.rules}
            >
              {renderFormField(field)}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </div>
  );
};

export const PaperMaster = () => <MasterPage type="paper" />;
export const MachineMaster = () => <MasterPage type="machine" />;
export const InkMaster = () => <MasterPage type="ink" />;
export const ProcessMaster = () => <MasterPage type="process" />;

