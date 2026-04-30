'use client';
import React, { useRef } from 'react';
import {
  Card, Button, Typography, Space, Row, Col, Divider, Table, Tag, Grid, message,
  Descriptions, Timeline, Statistic, Badge
} from 'antd';
import {
  ArrowLeftOutlined, PrinterOutlined, DownloadOutlined, MailOutlined,
  CheckCircleOutlined, FileTextOutlined, PhoneOutlined, EnvironmentOutlined,
  CalendarOutlined, UserOutlined, CopyOutlined
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { useEstimate } from '../../context/EstimateContext';
import { companyInfo } from '../../data/mockData';
import { formatCurrency, formatNumber } from '../../utils/calculations';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const QuotationView = () => {
  const router = useRouter();
  const { id } = useParams();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const printRef = useRef(null);
  const { estimates, updateEstimateStatus } = useEstimate();

  // Find estimate by ID
  const estimate = estimates.find((est) => est.id === id);

  if (!estimate) {
    return (
      <Card className="animate-fade-in">
        <div style={{ textAlign: 'center', padding: 60 }}>
          <FileTextOutlined style={{ fontSize: 64, color: 'hsl(var(--muted-foreground))' }} />
          <Title level={4} style={{ marginTop: 24 }}>Estimate Not Found</Title>
          <Text type="secondary">The estimate you're looking for doesn't exist or has been removed.</Text>
          <br /><br />
          <Button type="primary" onClick={() => router.push('/estimates')}>
            Back to Estimates
          </Button>
        </div>
      </Card>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    message.success('PDF download initiated');
  };

  const handleEmail = () => {
    message.success('Quotation email sent to customer');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success('Link copied to clipboard');
  };

  const handleApprove = () => {
    updateEstimateStatus(estimate.id, 'approved');
    message.success('Quotation approved!');
  };

  // Get today's date for quotation
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Calculate validity date (30 days from today)
  const validityDate = new Date();
  validityDate.setDate(validityDate.getDate() + 30);
  const validity = validityDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Cost breakdown for display
  const costItems = [
    { 
      key: 'paper', 
      label: 'Paper Cost', 
      description: `${estimate.paperEstimation?.paperType || 'N/A'}, ${estimate.paperEstimation?.gsm || 'N/A'} GSM`,
      amount: estimate.summary?.paperCost || 0 
    },
    { 
      key: 'printing', 
      label: 'Printing Cost', 
      description: `${estimate.printingEstimation?.colorsFront || 0} + ${estimate.printingEstimation?.colorsBack || 0} Colors`,
      amount: estimate.summary?.printingCost || 0 
    },
    { 
      key: 'process', 
      label: 'Pre-Press & Finishing', 
      description: 'Plates, Design, Binding, etc.',
      amount: estimate.summary?.processCost || 0 
    }
  ];

  return (
    <div className="quotation-page animate-fade-in">
      {/* Action Bar - Hidden on Print */}
      <Card className="no-print" style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Space wrap>
              <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/estimates')}>
                Back
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                Quotation - {estimate.id}
              </Title>
              <Tag color={estimate.status === 'approved' ? 'success' : estimate.status === 'pending' ? 'processing' : 'default'}>
                {estimate.status?.toUpperCase()}
              </Tag>
            </Space>
          </Col>
          <Col xs={24} md={12}>
            <Space wrap style={{ justifyContent: isMobile ? 'flex-start' : 'flex-end', width: '100%' }}>
              <Button icon={<CopyOutlined />} onClick={handleCopyLink}>
                Copy Link
              </Button>
              <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                Print
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleDownload}>
                PDF
              </Button>
              <Button icon={<MailOutlined />} onClick={handleEmail}>
                Email
              </Button>
              {estimate.status !== 'approved' && (
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleApprove}>
                  Approve
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Quotation Document */}
      <Card
        ref={printRef}
        className="quotation-document"
        style={{
          maxWidth: 900,
          margin: '0 auto',
          background: '#fff',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
        }}
        styles={{
          body: { padding: isMobile ? 20 : 48 }
        }}
      >
        {/* Company Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 24px hsl(var(--primary) / 0.3)'
            }}
          >
            <PrinterOutlined style={{ fontSize: 36, color: '#fff' }} />
          </div>
          <Title level={2} style={{ margin: 0, color: 'hsl(var(--primary))' }}>
            {companyInfo.name}
          </Title>
          <Space direction="vertical" size={4} style={{ marginTop: 12 }}>
            <Text type="secondary">
              <EnvironmentOutlined /> {companyInfo.address}, {companyInfo.city}, {companyInfo.state} - {companyInfo.pincode}
            </Text>
            <Text type="secondary">
              <PhoneOutlined /> {companyInfo.phone} | ✉ {companyInfo.email}
            </Text>
            <Text type="secondary">GSTIN: {companyInfo.gstin}</Text>
          </Space>
        </div>

        <Divider style={{ margin: '24px 0' }} />

        {/* Quotation Title */}
        <div
          style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.03) 100%)',
            padding: '20px 32px',
            borderRadius: 12,
            marginBottom: 32,
            border: '1px solid hsl(var(--primary) / 0.1)'
          }}
        >
          <Title level={2} style={{ margin: 0, letterSpacing: 4 }}>
            QUOTATION
          </Title>
          <Text type="secondary">Reference: Q-{estimate.id}</Text>
        </div>

        {/* Customer & Quotation Details */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} md={12}>
            <Card 
              size="small" 
              style={{ 
                background: 'hsl(var(--muted))',
                border: 'none',
                height: '100%'
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Quote To
                </Text>
                <Title level={4} style={{ margin: '8px 0 4px' }}>
                  {estimate.jobDetails.customerName}
                </Title>
                <Text type="secondary">
                  <UserOutlined /> Accounts Department
                </Text>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card 
              size="small" 
              style={{ 
                background: 'hsl(var(--muted))',
                border: 'none',
                height: '100%'
              }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Quotation No</Text>
                  <div><Text strong>Q-{estimate.id}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Date</Text>
                  <div><Text strong>{today}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Valid Until</Text>
                  <div><Text strong style={{ color: 'hsl(var(--warning))' }}>{validity}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Sales Person</Text>
                  <div><Text strong>{estimate.jobDetails.salesPerson || 'N/A'}</Text></div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Job Specifications */}
        <Card
          size="small"
          title={
            <Space>
              <FileTextOutlined style={{ color: 'hsl(var(--primary))' }} />
              <span>Job Specifications</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
          styles={{ 
            header: { 
              background: 'hsl(var(--primary))', 
              color: '#fff',
              borderRadius: '8px 8px 0 0'
            } 
          }}
          headStyle={{ color: '#fff' }}
        >
          <Descriptions 
            column={{ xs: 1, sm: 2, md: 3 }} 
            size="small"
            labelStyle={{ color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
          >
            <Descriptions.Item label="Job Name">
              <Text strong>{estimate.jobDetails.jobName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Product Type">
              {estimate.jobDetails.productType}
            </Descriptions.Item>
            <Descriptions.Item label="Quantity">
              <Badge count={formatNumber(estimate.jobDetails.quantity)} style={{ backgroundColor: 'hsl(var(--primary))' }} showZero />
              {' pcs'}
            </Descriptions.Item>
            <Descriptions.Item label="Paper">
              {estimate.paperEstimation?.paperType || 'N/A'}, {estimate.paperEstimation?.gsm || 'N/A'} GSM
            </Descriptions.Item>
            <Descriptions.Item label="Size">
              {estimate.paperEstimation?.sheetSize || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Printing">
              {estimate.printingEstimation?.colorsFront || 0} + {estimate.printingEstimation?.colorsBack || 0} Colors ({estimate.printingEstimation?.printType || 'N/A'})
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Cost Breakdown */}
        <Card size="small" title="Cost Breakdown" style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            {costItems.map((item, index) => (
              <div 
                key={item.key}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: index < costItems.length - 1 ? '1px solid hsl(var(--border))' : 'none'
                }}
              >
                <div>
                  <Text strong>{item.label}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.description}</Text>
                </div>
                <Text strong style={{ fontSize: 16 }}>{formatCurrency(item.amount)}</Text>
              </div>
            ))}
          </div>

          <Divider style={{ margin: '16px 0' }} />

          {/* Subtotal */}
          <Row justify="space-between" style={{ padding: '8px 0' }}>
            <Text strong style={{ fontSize: 15 }}>Subtotal (Cost)</Text>
            <Text strong style={{ fontSize: 15 }}>{formatCurrency(estimate.summary?.totalCost || 0)}</Text>
          </Row>

          {/* Profit */}
          <Row 
            justify="space-between" 
            style={{ 
              padding: '8px 12px', 
              background: 'hsl(var(--success) / 0.08)',
              borderRadius: 6,
              margin: '8px 0'
            }}
          >
            <Text type="success">Margin ({estimate.summary?.profitPercent || 0}%)</Text>
            <Text type="success" strong>{formatCurrency(estimate.summary?.profitAmount || 0)}</Text>
          </Row>
        </Card>

        {/* Final Price Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, hsl(var(--success)) 0%, hsl(142 76% 36%) 100%)',
            padding: '28px 32px',
            borderRadius: 16,
            marginBottom: 32,
            textAlign: 'center',
            boxShadow: '0 8px 32px hsl(var(--success) / 0.3)'
          }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, textTransform: 'uppercase', letterSpacing: 2 }}>
            Total Quotation Amount
          </Text>
          <Title level={1} style={{ margin: '12px 0 8px', color: '#fff', fontSize: isMobile ? 36 : 48 }}>
            {formatCurrency(estimate.summary?.sellingPrice || 0)}
          </Title>
          <Space split={<Divider type="vertical" style={{ background: 'rgba(255,255,255,0.3)' }} />}>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
              Rate per unit: {formatCurrency(estimate.summary?.costPerUnit || 0)}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
              Qty: {formatNumber(estimate.jobDetails.quantity)}
            </Text>
          </Space>
        </div>

        {/* Terms & Conditions */}
        <Card 
          size="small" 
          style={{ 
            background: 'hsl(var(--muted))',
            border: 'none',
            marginBottom: 32 
          }}
        >
          <Title level={5} style={{ marginBottom: 16 }}>
            Terms & Conditions
          </Title>
          <Row gutter={[24, 8]}>
            <Col xs={24} md={12}>
              <Timeline
                items={[
                  { children: 'Quotation valid for 30 days from issue date' },
                  { children: '50% advance payment to confirm order' },
                  { children: 'Delivery: 7-10 working days from design approval' }
                ]}
              />
            </Col>
            <Col xs={24} md={12}>
              <Timeline
                items={[
                  { children: 'Prices exclusive of GST (18% applicable)' },
                  { children: 'Specification changes may affect final pricing' },
                  { children: 'Design files in print-ready format required' }
                ]}
              />
            </Col>
          </Row>
        </Card>

        {/* Signature Section */}
        <Row gutter={32}>
          <Col xs={24} md={12}>
            <div style={{ borderTop: '2px solid hsl(var(--border))', paddingTop: 20, textAlign: 'center' }}>
              <Text type="secondary">For {companyInfo.name}</Text>
              <div style={{ height: 60 }} />
              <Text strong>Authorized Signatory</Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ borderTop: '2px solid hsl(var(--border))', paddingTop: 20, marginTop: isMobile ? 32 : 0, textAlign: 'center' }}>
              <Text type="secondary">Customer Acceptance</Text>
              <div style={{ height: 60 }} />
              <Text strong>Signature & Company Stamp</Text>
            </div>
          </Col>
        </Row>

        <Divider style={{ margin: '32px 0 16px' }} />

        {/* Footer */}
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Thank you for your business! | {companyInfo.website}
          </Text>
        </div>
      </Card>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .quotation-document { 
            box-shadow: none !important; 
            max-width: 100% !important;
          }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
};

export default QuotationView;

