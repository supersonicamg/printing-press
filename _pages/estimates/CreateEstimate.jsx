'use client';
import React, { useState, useEffect } from 'react';
import {
  Card, Form, Input, Select, InputNumber, DatePicker, Row, Col, Typography, Space,
  Checkbox, Divider, message, Button, Collapse, Tag, Modal, Alert, Grid, Tooltip, Badge
} from 'antd';
import {
  SaveOutlined, FileTextOutlined, UserOutlined, PlusOutlined, SearchOutlined,
  ScissorOutlined, PrinterOutlined, ToolOutlined, CalculatorOutlined, BulbOutlined,
  PhoneOutlined, InfoCircleOutlined, CheckCircleOutlined, ReloadOutlined, MailOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useEstimate } from '../../context/EstimateContext';
import { useMasterData } from '../../context/MasterDataContext';
import { formatCurrency } from '../../utils/calculations';
import { getRecommendationsFromDimensions, STANDARD_SIZES, UNIT_CONVERSIONS, convertToMm, DEFAULT_MARGINS } from '../../utils/paperSizeOptimizer';
import PaperLayoutVisualizer from '../../components/PaperLayoutVisualizer';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

const CreateEstimate = () => {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [form] = Form.useForm();
  const { saveEstimate, estimates, generateEstimateId } = useEstimate();
  const { 
    paperTypes, machines, productTypes, gsmOptions, printTypes,
    addProductType, addGsmOption, addPrintType, addPaperType 
  } = useMasterData();
  
  // Auto-generate estimate number
  const [estimateNo, setEstimateNo] = useState('');
  
  useEffect(() => {
    const newId = generateEstimateId ? generateEstimateId() : `EST-${Date.now()}`;
    setEstimateNo(newId);
  }, []);
  
  // Customer state - persist across sessions
  const [customerList, setCustomerList] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('printmaster_customers');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return [
      { id: 1, name: 'Acme Corporation', phone: '+91 98765 43210', email: 'john@acme.com' },
      { id: 2, name: 'TechStart India', phone: '+91 87654 32109', email: 'priya@techstart.in' },
      { id: 3, name: 'Global Traders', phone: '+91 76543 21098', email: 'ahmed@globaltraders.com' }
    ];
  });
  
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  
  // Unit selection state
  const [sizeUnit, setSizeUnit] = useState('inch');
  
  // Paper size recommendation
  const [sizeRecommendations, setSizeRecommendations] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcWidth, setCalcWidth] = useState('');
  const [calcHeight, setCalcHeight] = useState('');
  const [calcUnit, setCalcUnit] = useState('inch');
  const [calcResults, setCalcResults] = useState(null);
  const [selectedCalcRec, setSelectedCalcRec] = useState(null);
  
  // Add new modals
  const [showAddProductType, setShowAddProductType] = useState(false);
  const [newProductType, setNewProductType] = useState('');
  const [showAddPaperType, setShowAddPaperType] = useState(false);
  const [newPaperName, setNewPaperName] = useState('');
  const [newPaperRate, setNewPaperRate] = useState(80);
  const [showAddGsm, setShowAddGsm] = useState(false);
  const [newGsm, setNewGsm] = useState('');
  const [showAddPrintType, setShowAddPrintType] = useState(false);
  const [newPrintType, setNewPrintType] = useState('');

  // Calculator margins — user-adjustable, defaults from the optimizer
  const [calcMargins, setCalcMargins] = useState({ ...DEFAULT_MARGINS });
  const [showMarginsPanel, setShowMarginsPanel] = useState(false);

  // Summary state
  const [profitPercent, setProfitPercent] = useState(20);
  const [summary, setSummary] = useState({ 
    paperCost: 0, printingCost: 0, processCost: 0, totalCost: 0, sellingPrice: 0, costPerUnit: 0, profitAmount: 0 
  });
  const [isCalculated, setIsCalculated] = useState(false);

  // Sales persons (static for now)
  const salesPersons = [
    { id: 1, name: 'Rahul Verma' },
    { id: 2, name: 'Anita Desai' },
    { id: 3, name: 'Kiran Rao' },
    { id: 4, name: 'Suresh Menon' }
  ];

  // Save customers to localStorage
  useEffect(() => {
    localStorage.setItem('printmaster_customers', JSON.stringify(customerList));
  }, [customerList]);

  const handleAddCustomer = () => {
    if (newCustomerName.trim()) {
      const newCustomer = { 
        id: Date.now(), 
        name: newCustomerName.trim(), 
        phone: newCustomerPhone.trim(),
        email: newCustomerEmail.trim()
      };
      const updatedList = [newCustomer, ...customerList];
      setCustomerList(updatedList);
      form.setFieldValue('customerName', newCustomerName.trim());
      setShowAddCustomer(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerEmail('');
      message.success('Customer added successfully!');
    }
  };

  const handleSizeCheck = () => {
    const width = form.getFieldValue('customWidth');
    const height = form.getFieldValue('customHeight');
    if (width && height) {
      const result = getRecommendationsFromDimensions(width, height, sizeUnit);
      setSizeRecommendations(result);
      if (result.error) {
        message.warning(result.error);
      }
    } else {
      message.warning('Please enter both width and height');
    }
  };

  const applyRecommendedSize = (sizeName) => {
    form.setFieldValue('sheetSize', sizeName);
    if (sizeRecommendations?.recommendations) {
      const rec = sizeRecommendations.recommendations.find(r => r.size === sizeName);
      if (rec) {
        form.setFieldValue('ups', rec.ups);
        message.success(`Applied ${sizeName} with ${rec.ups} ups - ${rec.wastePercent}% waste`);
      }
    }
  };

  // Calculator Modal Functions
  const handleCalculate = () => {
    if (!calcWidth || !calcHeight) {
      message.warning('Please enter both dimensions');
      return;
    }
    const result = getRecommendationsFromDimensions(
      parseFloat(calcWidth), parseFloat(calcHeight), calcUnit, calcMargins
    );
    setCalcResults(result);
    if (result.recommendations?.length > 0) {
      setSelectedCalcRec(result.recommendations[0]);
    } else {
      setSelectedCalcRec(null);
    }
  };

  const applyFromCalculator = (sizeName, ups) => {
    form.setFieldValue('sheetSize', sizeName);
    form.setFieldValue('ups', ups);
    // Convert calc dimensions to current form unit
    const widthMm = convertToMm(parseFloat(calcWidth), calcUnit);
    const heightMm = convertToMm(parseFloat(calcHeight), calcUnit);
    const factor = UNIT_CONVERSIONS[sizeUnit] || 25.4;
    form.setFieldValue('customWidth', Math.round((widthMm / factor) * 100) / 100);
    form.setFieldValue('customHeight', Math.round((heightMm / factor) * 100) / 100);
    setSizeRecommendations(calcResults);
    setShowCalculator(false);
    message.success(`Applied ${sizeName} — ${ups} up${ups !== 1 ? 's' : ''}`);
    // Recalculate costs immediately with updated size/ups
    setTimeout(() => recalculateAll(), 0);
  };

  // Calculate all costs
  const recalculateAll = () => {
    const values = form.getFieldsValue();
    const quantity = values.quantity || 1000;
    const ups = values.ups || 1;
    const wastagePercent = values.wastagePercent || 5;
    const gsm = values.gsm || 80;
    const ratePerKg = values.ratePerKg || 85;
    const sheetsPerReam = values.sheetsPerReam || 500;
    
    // Get sheet size dimensions
    const selectedSize = STANDARD_SIZES.find(s => s.name === values.sheetSize);
    const sheetWidth = selectedSize?.width || 210;
    const sheetHeight = selectedSize?.height || 297;
    
    // Paper calculations - CORRECTED
    const baseSheets = Math.ceil(quantity / ups);
    const wastageSheets = Math.ceil(baseSheets * (wastagePercent / 100));
    const totalSheets = baseSheets + wastageSheets;
    const totalReams = Math.ceil(totalSheets / sheetsPerReam);
    
    // Paper weight: (width mm × height mm × GSM) / 1,000,000 = kg per sheet
    const sheetAreaSqM = (sheetWidth * sheetHeight) / 1000000;
    const weightPerSheet = sheetAreaSqM * gsm / 1000; // Convert g to kg
    const paperWeight = totalSheets * weightPerSheet;
    const paperCost = paperWeight * ratePerKg;
    
    // Printing calculations - CORRECTED (impression per sheet)
    const colorsFront = values.colorsFront || 0;
    const colorsBack = values.colorsBack || 0;
    const impressionPerSheet = values.impressionPerSheet || 1;
    const totalColors = colorsFront + colorsBack;
    const impressions = totalSheets * totalColors * impressionPerSheet;
    const ratePerImpression = values.ratePerImpression || 0.15;
    const setupCost = values.setupCost || 0;
    const printingCost = (impressions * ratePerImpression) + setupCost;
    
    // Plate calculations - CORRECTED
    const platesFront = values.platesFront || 0;
    const platesBack = values.platesBack || 0;
    const plateCostPerPlate = values.plateCostPerPlate || 0;
    const totalPlates = platesFront + platesBack;
    const totalPlateCost = totalPlates * plateCostPerPlate;
    
    // Process calculations - all per job
    const designCost = values.designCost || 0;
    const cuttingCost = values.cutting ? (values.cuttingCost || 0) : 0;
    const foldingCost = values.folding ? (values.foldingCost || 0) : 0;
    const laminationCost = values.lamination ? (values.laminationCost || 0) : 0;
    const bindingCost = values.binding ? (values.bindingCost || 0) : 0;
    const numberingCost = values.numbering ? (values.numberingCost || 0) : 0;
    const perforationCost = values.perforation ? (values.perforationCost || 0) : 0;
    const uvCost = values.uv ? (values.uvCost || 0) : 0;
    const embossingCost = values.embossing ? (values.embossingCost || 0) : 0;
    const dieCuttingCost = values.dieCutting ? (values.dieCuttingCost || 0) : 0;
    
    const processCost = totalPlateCost + designCost + cuttingCost + foldingCost + 
                       laminationCost + bindingCost + numberingCost + perforationCost +
                       uvCost + embossingCost + dieCuttingCost;
    
    // Total calculations
    const totalCost = paperCost + printingCost + processCost;
    const profitAmount = totalCost * (profitPercent / 100);
    const sellingPrice = totalCost + profitAmount;
    const costPerUnit = quantity > 0 ? sellingPrice / quantity : 0;
    
    setSummary({
      paperCost: Math.round(paperCost * 100) / 100,
      printingCost: Math.round(printingCost * 100) / 100,
      processCost: Math.round(processCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      profitAmount: Math.round(profitAmount * 100) / 100,
      sellingPrice: Math.round(sellingPrice * 100) / 100,
      costPerUnit: Math.round(costPerUnit * 100) / 100,
      totalSheets,
      totalReams,
      paperWeight: Math.round(paperWeight * 100) / 100,
      impressions,
      totalPlates,
      totalPlateCost: Math.round(totalPlateCost * 100) / 100
    });
    
    setIsCalculated(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (!isCalculated) {
        message.warning('Please calculate estimate first');
        return;
      }
      
      // Build estimate object
      const estimateData = {
        estimateNo: estimateNo,
        jobDetails: {
          customerName: values.customerName,
          jobName: values.jobName,
          productType: values.productType,
          quantity: values.quantity,
          deliveryDate: values.deliveryDate?.format('YYYY-MM-DD'),
          salesPerson: values.salesPerson,
          remarks: values.remarks
        },
        paperEstimation: {
          paperType: values.paperType,
          gsm: values.gsm,
          sheetSize: values.sheetSize,
          ups: values.ups,
          wastagePercent: values.wastagePercent,
          ratePerKg: values.ratePerKg,
          sheetsPerReam: values.sheetsPerReam,
          customWidth: values.customWidth,
          customHeight: values.customHeight,
          sizeUnit: sizeUnit,
          totalSheets: summary.totalSheets,
          totalReams: summary.totalReams,
          paperWeight: summary.paperWeight,
          paperCost: summary.paperCost
        },
        printingEstimation: {
          machine: values.machine,
          printType: values.printType,
          colorsFront: values.colorsFront,
          colorsBack: values.colorsBack,
          impressionPerSheet: values.impressionPerSheet,
          impressions: summary.impressions,
          setupCost: values.setupCost,
          ratePerImpression: values.ratePerImpression,
          printingCost: summary.printingCost
        },
        prePostPress: {
          platesFront: values.platesFront,
          platesBack: values.platesBack,
          plateCostPerPlate: values.plateCostPerPlate,
          totalPlates: summary.totalPlates,
          totalPlateCost: summary.totalPlateCost,
          designCost: values.designCost,
          processes: {
            cutting: { enabled: values.cutting, cost: values.cuttingCost },
            folding: { enabled: values.folding, cost: values.foldingCost },
            lamination: { enabled: values.lamination, cost: values.laminationCost },
            binding: { enabled: values.binding, cost: values.bindingCost },
            numbering: { enabled: values.numbering, cost: values.numberingCost },
            perforation: { enabled: values.perforation, cost: values.perforationCost },
            uv: { enabled: values.uv, cost: values.uvCost },
            embossing: { enabled: values.embossing, cost: values.embossingCost },
            dieCutting: { enabled: values.dieCutting, cost: values.dieCuttingCost }
          },
          processCost: summary.processCost
        },
        summary: {
          paperCost: summary.paperCost,
          printingCost: summary.printingCost,
          processCost: summary.processCost,
          totalCost: summary.totalCost,
          profitPercent: profitPercent,
          profitAmount: summary.profitAmount,
          sellingPrice: summary.sellingPrice,
          costPerUnit: summary.costPerUnit
        }
      };
      
      const savedEstimate = saveEstimate(estimateData);
      message.success(`Estimate ${savedEstimate.id} saved successfully!`);
      router.push('/estimates');
    } catch (err) {
      console.error(err);
      message.error('Please fill all required fields');
    }
  };

  const filteredCustomers = customerList.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const sheetSizeOptions = STANDARD_SIZES.map(s => ({ 
    value: s.name, 
    label: `${s.name} (${s.width}×${s.height}mm)` 
  }));

  const unitOptions = [
    { value: 'inch', label: 'Inch' },
    { value: 'mm', label: 'mm' },
    { value: 'cm', label: 'cm' }
  ];

  // Summary Card Component
  const SummaryCard = ({ sticky = true }) => (
    <Card 
      title={
        <Space>
          <CalculatorOutlined />
          <span>Cost Summary</span>
          {isCalculated && <CheckCircleOutlined style={{ color: 'hsl(var(--success))' }} />}
        </Space>
      }
      style={sticky ? { position: 'sticky', top: 16 } : {}}
      className="summary-card"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* Estimate Number */}
        <div style={{ 
          textAlign: 'center', 
          padding: '8px 12px', 
          background: 'hsl(var(--primary) / 0.1)', 
          borderRadius: 8,
          marginBottom: 8
        }}>
          <Text type="secondary" style={{ fontSize: 11 }}>ESTIMATE NO.</Text>
          <Title level={5} style={{ margin: 0, color: 'hsl(var(--primary))' }}>{estimateNo}</Title>
        </div>

        <Row justify="space-between">
          <Text type="secondary">Paper Cost:</Text>
          <Text strong>{formatCurrency(summary.paperCost)}</Text>
        </Row>
        <Row justify="space-between">
          <Text type="secondary">Printing Cost:</Text>
          <Text strong>{formatCurrency(summary.printingCost)}</Text>
        </Row>
        <Row justify="space-between">
          <Text type="secondary">Process Cost:</Text>
          <Text strong>{formatCurrency(summary.processCost)}</Text>
        </Row>
        
        <Divider style={{ margin: '12px 0' }} />
        
        <Row justify="space-between">
          <Text strong style={{ fontSize: 15 }}>Total Cost:</Text>
          <Text strong style={{ fontSize: 15 }}>{formatCurrency(summary.totalCost)}</Text>
        </Row>
        
        <Divider style={{ margin: '12px 0' }} />
        
        <Row justify="space-between" align="middle">
          <Text type="secondary">Profit %:</Text>
          <InputNumber 
            min={0} 
            max={100} 
            value={profitPercent} 
            onChange={(val) => {
              setProfitPercent(val || 0);
              if (isCalculated) recalculateAll();
            }}
            style={{ width: 90 }} 
            addonAfter="%" 
            size="small" 
          />
        </Row>
        <Row justify="space-between">
          <Text type="secondary">Profit Amount:</Text>
          <Text type="success" strong>{formatCurrency(summary.profitAmount)}</Text>
        </Row>
        
        <Divider style={{ margin: '12px 0' }} />
        
        <div style={{ 
          textAlign: 'center', 
          padding: '16px', 
          background: 'linear-gradient(135deg, hsl(var(--success) / 0.1) 0%, hsl(var(--success) / 0.05) 100%)', 
          borderRadius: 12,
          border: '1px solid hsl(var(--success) / 0.2)'
        }}>
          <Text type="secondary" style={{ fontSize: 12 }}>SELLING PRICE</Text>
          <Title level={2} style={{ margin: '8px 0', color: 'hsl(var(--success))' }}>
            {formatCurrency(summary.sellingPrice)}
          </Title>
          <Tag color="green">Per unit: {formatCurrency(summary.costPerUnit)}</Tag>
        </div>

        {summary.totalSheets > 0 && (
          <div style={{ marginTop: 12, padding: 12, background: 'hsl(var(--muted))', borderRadius: 8 }}>
            <Row justify="space-between">
              <Text type="secondary" style={{ fontSize: 12 }}>Total Sheets:</Text>
              <Text style={{ fontSize: 12 }}>{summary.totalSheets?.toLocaleString()}</Text>
            </Row>
            <Row justify="space-between">
              <Text type="secondary" style={{ fontSize: 12 }}>Total Reams:</Text>
              <Text style={{ fontSize: 12 }}>{summary.totalReams}</Text>
            </Row>
            <Row justify="space-between">
              <Text type="secondary" style={{ fontSize: 12 }}>Paper Weight:</Text>
              <Text style={{ fontSize: 12 }}>{summary.paperWeight} kg</Text>
            </Row>
            <Row justify="space-between">
              <Text type="secondary" style={{ fontSize: 12 }}>Impressions:</Text>
              <Text style={{ fontSize: 12 }}>{summary.impressions?.toLocaleString()}</Text>
            </Row>
            {summary.totalPlates > 0 && (
              <Row justify="space-between">
                <Text type="secondary" style={{ fontSize: 12 }}>Total Plates:</Text>
                <Text style={{ fontSize: 12 }}>{summary.totalPlates} ({formatCurrency(summary.totalPlateCost)})</Text>
              </Row>
            )}
          </div>
        )}
      </Space>
    </Card>
  );

  return (
    <div className="create-estimate-page animate-fade-in">
      {/* Header */}
      <div className="page-header" style={{ 
        marginBottom: 24, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Create New Estimate</Title>
          <Text type="secondary">Fill in the details to generate cost estimate</Text>
        </div>
        <Space wrap>
          <Button onClick={() => router.push('/estimates')}>Cancel</Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSave}
            disabled={!isCalculated}
          >
            Save Estimate
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Form Section */}
        <Col xs={24} lg={16}>
          <div style={{ 
            maxHeight: isMobile ? 'none' : 'calc(100vh - 200px)', 
            overflowY: isMobile ? 'visible' : 'auto',
            paddingRight: isMobile ? 0 : 8
          }}>
            <Form 
              form={form} 
              layout="vertical" 
              requiredMark="optional"
              initialValues={{
                quantity: 1000,
                gsm: 80,
                ups: 1,
                wastagePercent: 5,
                ratePerKg: 85,
                sheetsPerReam: 500,
                colorsFront: 4,
                colorsBack: 0,
                impressionPerSheet: 1,
                ratePerImpression: 0.15,
                setupCost: 500,
                platesFront: 0,
                platesBack: 0,
                plateCostPerPlate: 150,
                designCost: 0
              }}
            >
              <Collapse 
                defaultActiveKey={['job', 'paper', 'printing', 'process']} 
                expandIconPosition="end"
                className="estimate-collapse"
              >
                {/* Job Details */}
                <Panel 
                  header={
                    <Space>
                      <Badge count={<FileTextOutlined style={{ color: 'hsl(var(--primary))' }} />} />
                      <Text strong>Job Details</Text>
                    </Space>
                  } 
                  key="job"
                >
                  <Row gutter={[16, 0]}>
                    {/* Estimate Number - Auto Generated */}
                    <Col xs={24} md={8}>
                      <Form.Item label="Estimate No.">
                        <Input 
                          value={estimateNo} 
                          disabled 
                          style={{ background: 'hsl(var(--muted))', fontWeight: 600 }}
                          size={isMobile ? 'large' : 'middle'}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={16}>
                      <Form.Item 
                        name="customerName" 
                        label={
                          <Space>
                            Customer Name
                            <Tooltip title="Select existing customer or add new">
                              <InfoCircleOutlined style={{ color: 'hsl(var(--muted-foreground))' }} />
                            </Tooltip>
                          </Space>
                        }
                        rules={[{ required: true, message: 'Please select customer' }]}
                      >
                        <Select
                          showSearch
                          placeholder="Search or add customer..."
                          filterOption={false}
                          onSearch={setCustomerSearch}
                          size={isMobile ? 'large' : 'middle'}
                          dropdownRender={(menu) => (
                            <div>
                              <div style={{ padding: '8px 12px' }}>
                                <Input 
                                  prefix={<SearchOutlined />} 
                                  placeholder="Search customers..." 
                                  value={customerSearch} 
                                  onChange={e => setCustomerSearch(e.target.value)}
                                  allowClear
                                />
                              </div>
                              <Divider style={{ margin: '8px 0' }} />
                              <div style={{ padding: '4px 12px 8px' }}>
                                <Button 
                                  type="primary" 
                                  ghost 
                                  block 
                                  icon={<PlusOutlined />} 
                                  onClick={() => setShowAddCustomer(true)}
                                >
                                  Add New Customer
                                </Button>
                              </div>
                              <Divider style={{ margin: '0' }} />
                              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                                {menu}
                              </div>
                            </div>
                          )}
                          options={filteredCustomers.map(c => ({ 
                            value: c.name, 
                            label: (
                              <div>
                                <div>{c.name}</div>
                                {c.phone && <Text type="secondary" style={{ fontSize: 12 }}>{c.phone}</Text>}
                              </div>
                            )
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item 
                        name="jobName" 
                        label="Job Name / Description"
                        rules={[{ required: true, message: 'Please enter job name' }]}
                      >
                        <Input 
                          placeholder="e.g., Annual Report 2024, Wedding Cards" 
                          size={isMobile ? 'large' : 'middle'} 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item 
                        name="productType" 
                        label="Product Type"
                        rules={[{ required: true, message: 'Please select product type' }]}
                      >
                        <Select 
                          placeholder="Select product type..." 
                          size={isMobile ? 'large' : 'middle'}
                          showSearch
                          dropdownRender={(menu) => (
                            <div>
                              {menu}
                              <Divider style={{ margin: '8px 0' }} />
                              <div style={{ padding: '4px 12px 8px' }}>
                                <Button 
                                  type="dashed" 
                                  block 
                                  icon={<PlusOutlined />} 
                                  onClick={() => setShowAddProductType(true)}
                                  size="small"
                                >
                                  Add New Type
                                </Button>
                              </div>
                            </div>
                          )}
                          options={productTypes.map(p => ({ value: p, label: p }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item 
                        name="quantity" 
                        label="Quantity (pcs)"
                        rules={[{ required: true, message: 'Enter quantity' }]}
                      >
                        <InputNumber 
                          min={1} 
                          style={{ width: '100%' }} 
                          formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                          parser={v => v.replace(/,/g, '')} 
                          size={isMobile ? 'large' : 'middle'} 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item name="deliveryDate" label="Delivery Date">
                        <DatePicker 
                          style={{ width: '100%' }} 
                          size={isMobile ? 'large' : 'middle'}
                          format="DD-MM-YYYY"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                      <Form.Item name="salesPerson" label="Sales Person">
                        <Select 
                          placeholder="Select sales person..." 
                          options={salesPersons.map(s => ({ value: s.name, label: s.name }))} 
                          size={isMobile ? 'large' : 'middle'}
                          allowClear
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                      <Form.Item name="remarks" label="Remarks / Notes">
                        <Input 
                          placeholder="Any special instructions..."
                          size={isMobile ? 'large' : 'middle'}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>

                {/* Paper Estimation */}
                <Panel 
                  header={
                    <Space>
                      <Badge count={<ScissorOutlined style={{ color: 'hsl(var(--warning))' }} />} />
                      <Text strong>Paper Estimation</Text>
                    </Space>
                  } 
                  key="paper"
                >
                  {/* Size Recommendation */}
                  <Card 
                    size="small" 
                    style={{ 
                      marginBottom: 16, 
                      background: 'linear-gradient(135deg, hsl(var(--primary) / 0.05) 0%, hsl(var(--primary) / 0.02) 100%)',
                      border: '1px solid hsl(var(--primary) / 0.15)'
                    }}
                  >
                    <Row align="middle" gutter={[12, 12]}>
                      <Col flex="auto">
                        <Space size={4}>
                          <BulbOutlined style={{ color: 'hsl(var(--primary))' }} />
                          <Text strong style={{ color: 'hsl(var(--primary))' }}>Smart Size Finder</Text>
                        </Space>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Enter customer's finished size to find the optimal paper sheet with minimum wastage
                        </Text>
                      </Col>
                      <Col>
                        <Button 
                          type="primary"
                          ghost
                          icon={<CalculatorOutlined />} 
                          onClick={() => setShowCalculator(true)}
                        >
                          Open Size Calculator
                        </Button>
                      </Col>
                    </Row>
                  </Card>

                  {sizeRecommendations?.recommendations && (
                    <Alert
                      type="success"
                      style={{ marginBottom: 16 }}
                      message={
                        <div>
                          <Text strong style={{ color: 'hsl(var(--success))' }}>
                            Applied Size — Top Options (click to switch):
                          </Text>
                          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {sizeRecommendations.recommendations.slice(0, 3).map((rec, i) => (
                              <Tag 
                                key={rec.size} 
                                color={i === 0 ? 'success' : i === 1 ? 'processing' : 'default'} 
                                style={{ cursor: 'pointer', padding: '6px 12px', fontSize: 13 }} 
                                onClick={() => applyRecommendedSize(rec.size)}
                              >
                                {i === 0 && '⭐ '}{rec.size} • {rec.ups} up{rec.ups !== 1 ? 's' : ''} • {rec.wastePercent}% waste
                              </Tag>
                            ))}
                          </div>
                        </div>
                      }
                    />
                  )}

                  <Divider orientation="left" plain style={{ marginTop: 8 }}>Paper Selection</Divider>

                  <Row gutter={[16, 0]}>
                    <Col xs={24} md={8}>
                      <Form.Item 
                        name="paperType" 
                        label="Paper Type"
                        rules={[{ required: true, message: 'Select paper type' }]}
                      >
                        <Select 
                          placeholder="Select paper..." 
                          size={isMobile ? 'large' : 'middle'}
                          showSearch
                          dropdownRender={(menu) => (
                            <div>
                              {menu}
                              <Divider style={{ margin: '8px 0' }} />
                              <div style={{ padding: '4px 12px 8px' }}>
                                <Button 
                                  type="dashed" 
                                  block 
                                  icon={<PlusOutlined />} 
                                  onClick={() => setShowAddPaperType(true)}
                                  size="small"
                                >
                                  Add New Paper
                                </Button>
                              </div>
                            </div>
                          )}
                          options={paperTypes.map(p => ({ 
                            value: p.name, 
                            label: `${p.name} (₹${p.ratePerKg}/kg)` 
                          }))}
                          onChange={(val) => {
                            const paper = paperTypes.find(p => p.name === val);
                            if (paper) {
                              form.setFieldValue('ratePerKg', paper.ratePerKg);
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Item 
                        name="gsm" 
                        label="GSM"
                        rules={[{ required: true }]}
                      >
                        <Select 
                          size={isMobile ? 'large' : 'middle'}
                          showSearch
                          dropdownRender={(menu) => (
                            <div>
                              {menu}
                              <Divider style={{ margin: '8px 0' }} />
                              <div style={{ padding: '4px 12px 8px' }}>
                                <Button 
                                  type="dashed" 
                                  block 
                                  icon={<PlusOutlined />} 
                                  onClick={() => setShowAddGsm(true)}
                                  size="small"
                                >
                                  Add GSM
                                </Button>
                              </div>
                            </div>
                          )}
                          options={gsmOptions.map(g => ({ value: g, label: `${g} GSM` }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item 
                        name="sheetSize" 
                        label="Sheet Size"
                        rules={[{ required: true, message: 'Select sheet size' }]}
                      >
                        <Select 
                          placeholder="Select size..." 
                          options={sheetSizeOptions} 
                          size={isMobile ? 'large' : 'middle'} 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={8} md={3}>
                      <Form.Item name="ups" label="Ups">
                        <InputNumber 
                          min={1} 
                          max={100} 
                          style={{ width: '100%' }} 
                          size={isMobile ? 'large' : 'middle'} 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={8} md={3}>
                      <Form.Item name="sheetsPerReam" label="Sheets/Ream">
                        <InputNumber 
                          min={1} 
                          style={{ width: '100%' }} 
                          size={isMobile ? 'large' : 'middle'} 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={8} md={3}>
                      <Form.Item name="wastagePercent" label="Wastage %">
                        <InputNumber 
                          min={0} 
                          max={50} 
                          style={{ width: '100%' }} 
                          size={isMobile ? 'large' : 'middle'} 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Item name="ratePerKg" label="Rate/Kg (₹)">
                        <InputNumber 
                          min={0} 
                          style={{ width: '100%' }} 
                          size={isMobile ? 'large' : 'middle'} 
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>

                {/* Printing */}
                <Panel 
                  header={
                    <Space>
                      <Badge count={<PrinterOutlined style={{ color: 'hsl(var(--info))' }} />} />
                      <Text strong>Printing Details</Text>
                    </Space>
                  } 
                  key="printing"
                >
                  <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item 
                        name="machine" 
                        label="Printing Machine"
                        rules={[{ required: true, message: 'Select machine' }]}
                      >
                        <Select 
                          placeholder="Select machine..." 
                          size={isMobile ? 'large' : 'middle'}
                          showSearch
                          options={machines.map(m => ({ 
                            value: m.name, 
                            label: (
                              <div>
                                <div>{m.name}</div>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  {m.type} • {m.colors} Colors • ₹{m.ratePerImpression}/imp
                                </Text>
                              </div>
                            )
                          }))}
                          onChange={(val) => {
                            const machine = machines.find(m => m.name === val);
                            if (machine) {
                              form.setFieldValue('ratePerImpression', machine.ratePerImpression);
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item 
                        name="printType" 
                        label="Print Type"
                        rules={[{ required: true, message: 'Select print type' }]}
                      >
                        <Select 
                          placeholder="Select..." 
                          size={isMobile ? 'large' : 'middle'}
                          dropdownRender={(menu) => (
                            <div>
                              {menu}
                              <Divider style={{ margin: '8px 0' }} />
                              <div style={{ padding: '4px 12px 8px' }}>
                                <Button 
                                  type="dashed" 
                                  block 
                                  icon={<PlusOutlined />} 
                                  onClick={() => setShowAddPrintType(true)}
                                  size="small"
                                >
                                  Add Print Type
                                </Button>
                              </div>
                            </div>
                          )}
                          options={printTypes.map(p => ({ value: p, label: p }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={8} md={4}>
                      <Form.Item name="colorsFront" label="Colors - Front">
                        <Select 
                          options={[0,1,2,3,4,5,6,7].map(c => ({ 
                            value: c, 
                            label: c === 0 ? 'None' : c === 4 ? '4 (CMYK)' : `${c} Color${c>1?'s':''}`
                          }))} 
                          size={isMobile ? 'large' : 'middle'} 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={8} md={4}>
                      <Form.Item name="colorsBack" label="Colors - Back">
                        <Select 
                          options={[0,1,2,3,4,5,6,7].map(c => ({ 
                            value: c, 
                            label: c === 0 ? 'None' : c === 4 ? '4 (CMYK)' : `${c} Color${c>1?'s':''}`
                          }))} 
                          size={isMobile ? 'large' : 'middle'} 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={8} md={4}>
                      <Form.Item 
                        name="impressionPerSheet" 
                        label={
                          <Tooltip title="Number of impressions per sheet">
                            <Space>Imp/Sheet <InfoCircleOutlined /></Space>
                          </Tooltip>
                        }
                      >
                        <InputNumber 
                          min={1} 
                          style={{ width: '100%' }} 
                          size={isMobile ? 'large' : 'middle'} 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item name="ratePerImpression" label="Rate/Impression (₹)">
                        <InputNumber 
                          min={0} 
                          step={0.01} 
                          style={{ width: '100%' }} 
                          size={isMobile ? 'large' : 'middle'} 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item name="setupCost" label="Setup Cost (₹)">
                        <InputNumber 
                          min={0} 
                          style={{ width: '100%' }} 
                          size={isMobile ? 'large' : 'middle'} 
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>

                {/* Post Press */}
                <Panel 
                  header={
                    <Space>
                      <Badge count={<ToolOutlined style={{ color: 'hsl(var(--destructive))' }} />} />
                      <Text strong>Pre-Press & Post-Press</Text>
                    </Space>
                  } 
                  key="process"
                >
                  <Divider orientation="left" plain style={{ marginTop: 0 }}>Plate Details</Divider>
                  
                  <Row gutter={[16, 0]}>
                    <Col xs={8} md={4}>
                      <Form.Item name="platesFront" label="Plates (Front)">
                        <InputNumber min={0} style={{ width: '100%' }} size={isMobile ? 'large' : 'middle'} />
                      </Form.Item>
                    </Col>
                    <Col xs={8} md={4}>
                      <Form.Item name="platesBack" label="Plates (Back)">
                        <InputNumber min={0} style={{ width: '100%' }} size={isMobile ? 'large' : 'middle'} />
                      </Form.Item>
                    </Col>
                    <Col xs={8} md={4}>
                      <Form.Item name="plateCostPerPlate" label="Cost/Plate (₹)">
                        <InputNumber min={0} style={{ width: '100%' }} size={isMobile ? 'large' : 'middle'} />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item name="designCost" label="Design Cost (₹)">
                        <InputNumber min={0} style={{ width: '100%' }} size={isMobile ? 'large' : 'middle'} />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Divider orientation="left" plain>Finishing Processes (Cost Per Job)</Divider>
                  
                  <Row gutter={[16, 8]}>
                    {[
                      { key: 'cutting', label: 'Cutting' },
                      { key: 'folding', label: 'Folding' },
                      { key: 'lamination', label: 'Lamination' },
                      { key: 'binding', label: 'Binding' },
                      { key: 'numbering', label: 'Numbering' },
                      { key: 'perforation', label: 'Perforation' },
                      { key: 'uv', label: 'UV Coating' },
                      { key: 'embossing', label: 'Embossing' },
                      { key: 'dieCutting', label: 'Die Cutting' }
                    ].map(proc => (
                      <React.Fragment key={proc.key}>
                        <Col xs={12} sm={8} md={4}>
                          <Form.Item name={proc.key} valuePropName="checked" style={{ marginBottom: 8 }}>
                            <Checkbox>{proc.label}</Checkbox>
                          </Form.Item>
                        </Col>
                        <Col xs={12} sm={4} md={4}>
                          <Form.Item name={`${proc.key}Cost`} style={{ marginBottom: 8 }}>
                            <InputNumber 
                              min={0} 
                              placeholder="₹ Cost" 
                              style={{ width: '100%' }} 
                              size="small" 
                            />
                          </Form.Item>
                        </Col>
                      </React.Fragment>
                    ))}
                  </Row>
                </Panel>
              </Collapse>

              {/* Calculate Button */}
              <div style={{ 
                marginTop: 24, 
                padding: 16, 
                background: 'hsl(var(--muted))', 
                borderRadius: 12,
                textAlign: 'center'
              }}>
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<CalculatorOutlined />}
                  onClick={recalculateAll}
                  style={{ minWidth: 200 }}
                >
                  Calculate Estimate
                </Button>
                {isCalculated && (
                  <Button 
                    type="link" 
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      form.resetFields();
                      setIsCalculated(false);
                      setSummary({ paperCost: 0, printingCost: 0, processCost: 0, totalCost: 0, sellingPrice: 0, costPerUnit: 0, profitAmount: 0 });
                      const newId = generateEstimateId ? generateEstimateId() : `EST-${Date.now()}`;
                      setEstimateNo(newId);
                    }}
                    style={{ marginLeft: 12 }}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </Form>
          </div>
        </Col>

        {/* Summary Sidebar */}
        <Col xs={24} lg={8}>
          {isMobile ? (
            isCalculated && <SummaryCard sticky={false} />
          ) : (
            <SummaryCard sticky={true} />
          )}
        </Col>
      </Row>

      {/* Add Customer Modal */}
      <Modal 
        title={<Space><UserOutlined /> Add New Customer</Space>}
        open={showAddCustomer} 
        onOk={handleAddCustomer} 
        onCancel={() => {
          setShowAddCustomer(false);
          setNewCustomerName('');
          setNewCustomerPhone('');
          setNewCustomerEmail('');
        }}
        okText="Add Customer"
        okButtonProps={{ disabled: !newCustomerName.trim() }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Customer Name *</Text>
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Enter customer name" 
              value={newCustomerName} 
              onChange={e => setNewCustomerName(e.target.value)} 
              size="large"
              style={{ marginTop: 4 }}
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Mobile Number *</Text>
            <Input 
              prefix={<PhoneOutlined />} 
              placeholder="+91 98765 43210" 
              value={newCustomerPhone} 
              onChange={e => setNewCustomerPhone(e.target.value)} 
              size="large"
              style={{ marginTop: 4 }}
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Email Address</Text>
            <Input 
              prefix={<MailOutlined />} 
              placeholder="customer@email.com" 
              value={newCustomerEmail} 
              onChange={e => setNewCustomerEmail(e.target.value)} 
              size="large"
              style={{ marginTop: 4 }}
            />
          </div>
        </Space>
      </Modal>

      {/* Add Product Type Modal */}
      <Modal
        title="Add New Product Type"
        open={showAddProductType}
        onOk={() => {
          if (newProductType.trim()) {
            addProductType(newProductType.trim());
            form.setFieldValue('productType', newProductType.trim());
            setNewProductType('');
            setShowAddProductType(false);
            message.success('Product type added!');
          }
        }}
        onCancel={() => { setShowAddProductType(false); setNewProductType(''); }}
        okButtonProps={{ disabled: !newProductType.trim() }}
      >
        <Input
          placeholder="e.g., Visiting Card, Pamphlet"
          value={newProductType}
          onChange={e => setNewProductType(e.target.value)}
          size="large"
        />
      </Modal>

      {/* Add Paper Type Modal */}
      <Modal
        title="Add New Paper Type"
        open={showAddPaperType}
        onOk={() => {
          if (newPaperName.trim()) {
            addPaperType({ name: newPaperName.trim(), ratePerKg: newPaperRate, gsmRange: '60-300', stock: 'Available' });
            form.setFieldValue('paperType', newPaperName.trim());
            form.setFieldValue('ratePerKg', newPaperRate);
            setNewPaperName('');
            setNewPaperRate(80);
            setShowAddPaperType(false);
            message.success('Paper type added!');
          }
        }}
        onCancel={() => { setShowAddPaperType(false); setNewPaperName(''); }}
        okButtonProps={{ disabled: !newPaperName.trim() }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="Paper name (e.g., Glossy Art Paper)"
            value={newPaperName}
            onChange={e => setNewPaperName(e.target.value)}
            size="large"
          />
          <InputNumber
            placeholder="Rate per Kg"
            value={newPaperRate}
            onChange={setNewPaperRate}
            min={0}
            style={{ width: '100%' }}
            size="large"
            addonBefore="₹"
            addonAfter="/kg"
          />
        </Space>
      </Modal>

      {/* Add GSM Modal */}
      <Modal
        title="Add New GSM"
        open={showAddGsm}
        onOk={() => {
          const gsmVal = parseInt(newGsm);
          if (gsmVal > 0) {
            addGsmOption(gsmVal);
            form.setFieldValue('gsm', gsmVal);
            setNewGsm('');
            setShowAddGsm(false);
            message.success('GSM added!');
          }
        }}
        onCancel={() => { setShowAddGsm(false); setNewGsm(''); }}
        okButtonProps={{ disabled: !newGsm || isNaN(parseInt(newGsm)) }}
      >
        <InputNumber
          placeholder="e.g., 120"
          value={newGsm}
          onChange={setNewGsm}
          min={1}
          style={{ width: '100%' }}
          size="large"
          addonAfter="GSM"
        />
      </Modal>

      {/* Add Print Type Modal */}
      <Modal
        title="Add New Print Type"
        open={showAddPrintType}
        onOk={() => {
          if (newPrintType.trim()) {
            addPrintType(newPrintType.trim());
            form.setFieldValue('printType', newPrintType.trim());
            setNewPrintType('');
            setShowAddPrintType(false);
            message.success('Print type added!');
          }
        }}
        onCancel={() => { setShowAddPrintType(false); setNewPrintType(''); }}
        okButtonProps={{ disabled: !newPrintType.trim() }}
      >
        <Input
          placeholder="e.g., Front + Back (2 Color)"
          value={newPrintType}
          onChange={e => setNewPrintType(e.target.value)}
          size="large"
        />
      </Modal>

      {/* Paper Size Calculator Modal */}
      <Modal
        title={<Space><CalculatorOutlined /> Paper Size Calculator</Space>}
        open={showCalculator}
        onCancel={() => {
          setShowCalculator(false);
          setCalcResults(null);
          setSelectedCalcRec(null);
          setShowMarginsPanel(false);
        }}
        footer={
          selectedCalcRec ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Selected: <Text strong>{selectedCalcRec.size}</Text>
                {' · '}{selectedCalcRec.ups} up{selectedCalcRec.ups !== 1 ? 's' : ''}
                {' · '}<Text style={{ color: 'hsl(var(--success))' }}>{selectedCalcRec.efficiency}% eff.</Text>
                {' · '}<Text style={{ color: 'hsl(var(--warning))' }}>{selectedCalcRec.wastePercent}% waste</Text>
              </Text>
              <Space>
                <Button onClick={() => { setShowCalculator(false); setCalcResults(null); setSelectedCalcRec(null); }}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => applyFromCalculator(selectedCalcRec.size, selectedCalcRec.ups)}
                >
                  Apply Selected Size
                </Button>
              </Space>
            </div>
          ) : (
            <Button onClick={() => { setShowCalculator(false); setCalcResults(null); setSelectedCalcRec(null); }}>
              Close
            </Button>
          )
        }
        width="min(92vw, 860px)"
        styles={{ body: { padding: '16px 0 4px' } }}
      >
        <div>
          <Alert 
            message="Enter the customer's finished size. We'll find which standard paper sheet fits best with the least waste."
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
          />

          {/* ── Print Margins Settings ── */}
          {(() => {
            const MARGIN_PRESETS = [
              {
                key: 'standard',
                label: 'Standard',
                values: { bleed: 3, gutter: 3, gripperLeft: 10, gripperRight: 10, gripperTop: 0, gripperBottom: 10 },
              },
              {
                key: 'tight',
                label: 'Tight',
                values: { bleed: 2, gutter: 2, gripperLeft: 8, gripperRight: 8, gripperTop: 0, gripperBottom: 8 },
              },
              {
                key: 'loose',
                label: 'Loose',
                values: { bleed: 5, gutter: 5, gripperLeft: 12, gripperRight: 12, gripperTop: 0, gripperBottom: 12 },
              },
              {
                key: 'booklet',
                label: 'Booklet',
                values: { bleed: 3, gutter: 6, gripperLeft: 10, gripperRight: 10, gripperTop: 0, gripperBottom: 10 },
              },
            ];

            const activePreset = MARGIN_PRESETS.find(p =>
              p.values.gripperLeft === calcMargins.gripperLeft &&
              p.values.gripperRight === calcMargins.gripperRight &&
              p.values.gripperBottom === calcMargins.gripperBottom
            );

            return (
              <div style={{
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                marginBottom: 16,
                overflow: 'hidden',
              }}>
                {/* Toggle header */}
                <div
                  onClick={() => setShowMarginsPanel(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 14px', cursor: 'pointer',
                    background: showMarginsPanel ? 'hsl(var(--primary) / 0.06)' : 'hsl(var(--muted))',
                    transition: 'background 0.15s',
                    userSelect: 'none',
                  }}
                >
                  <Space size={6}>
                    <ToolOutlined style={{ color: 'hsl(var(--primary))' }} />
                    <Text strong style={{ fontSize: 13 }}>Print Margins</Text>
                    <Tag style={{ margin: 0, fontSize: 11 }}>
                      {activePreset ? activePreset.label : 'Standard'}
                    </Tag>
                  </Space>
                  <Space size={6}>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {calcMargins.bleed}mm
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {showMarginsPanel ? '▲' : '▼'}
                    </Text>
                  </Space>
                </div>

                {/* Expanded panel */}
                {showMarginsPanel && (
                  <div style={{ padding: '12px 14px 14px', background: '#fff' }}>
                    {/* Preset pills */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                      {MARGIN_PRESETS.map(preset => {
                        const isSelected = activePreset?.key === preset.key;
                        return (
                          <div
                            key={preset.key}
                            onClick={() => setCalcMargins({ ...preset.values })}
                            style={{
                              padding: '5px 16px',
                              borderRadius: 20,
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: isSelected ? 600 : 400,
                              border: isSelected
                                ? '2px solid hsl(var(--primary))'
                                : '1.5px solid hsl(var(--border))',
                              background: isSelected ? 'hsl(var(--primary) / 0.08)' : '#fafafa',
                              color: isSelected ? 'hsl(var(--primary))' : 'inherit',
                              transition: 'all 0.15s',
                              userSelect: 'none',
                            }}
                          >
                            {preset.label}
                          </div>
                        );
                      })}
                    </div>

                    {/* Single margin value stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>Margin (mm)</Text>
                      <InputNumber
                        value={calcMargins.bleed}
                        min={1}
                        max={20}
                        step={0.5}
                        size="small"
                        style={{ width: 110 }}
                        onChange={v => {
                          const val = v ?? calcMargins.bleed;
                          const base = MARGIN_PRESETS.find(p => activePreset?.key === p.key) ?? MARGIN_PRESETS[0];
                          const ratio = base.values.bleed > 0 ? base.values.gutter / base.values.bleed : 1;
                          setCalcMargins(m => ({
                            ...m,
                            bleed: val,
                            gutter: Math.round(val * ratio * 2) / 2,
                          }));
                        }}
                      />
                      <Button
                        size="small"
                        type="link"
                        style={{ padding: 0, fontSize: 11, height: 'auto' }}
                        onClick={() => setCalcMargins({ ...DEFAULT_MARGINS })}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Input row */}
          <Row gutter={[12, 12]} align="bottom">
            <Col xs={11} sm={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Width</Text>
              <InputNumber
                value={calcWidth}
                onChange={setCalcWidth}
                placeholder="5.5"
                style={{ width: '100%', marginTop: 4 }}
                size="large"
                min={0}
                step={0.1}
              />
            </Col>
            <Col xs={11} sm={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Height</Text>
              <InputNumber
                value={calcHeight}
                onChange={setCalcHeight}
                placeholder="8.5"
                style={{ width: '100%', marginTop: 4 }}
                size="large"
                min={0}
                step={0.1}
              />
            </Col>
            <Col xs={8} sm={5}>
              <Text type="secondary" style={{ fontSize: 12 }}>Unit</Text>
              <Select
                value={calcUnit}
                onChange={setCalcUnit}
                style={{ width: '100%', marginTop: 4 }}
                size="large"
                options={[
                  { value: 'inch', label: 'Inch' },
                  { value: 'mm', label: 'mm' },
                  { value: 'cm', label: 'cm' }
                ]}
              />
            </Col>
            <Col xs={16} sm={7}>
              <Button 
                type="primary" 
                size="large" 
                block 
                icon={<CalculatorOutlined />}
                onClick={handleCalculate}
                style={{ marginTop: 20 }}
              >
                Find Best Size
              </Button>
            </Col>
          </Row>

          {/* Customer size info bar */}
          {calcResults?.customerSize && (
            <Card size="small" style={{ background: 'hsl(var(--muted))', marginTop: 16, marginBottom: 0 }}>
              <Text type="secondary">Finished size: </Text>
              <Text strong>
                {calcResults.customerSize.width} × {calcResults.customerSize.height} mm
              </Text>
              <Text type="secondary"> ({calcResults.customerSize.inInches})</Text>
            </Card>
          )}

          {/* Recommendations + Visualizer */}
          {calcResults?.recommendations && (
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              {/* Recommendations list */}
              <Col xs={24} md={14}>
                <Text strong style={{ marginBottom: 10, display: 'block' }}>
                  Recommendations — click a card to preview:
                </Text>
                <Space direction="vertical" style={{ width: '100%' }} size={8}>
                  {calcResults.recommendations.map((rec, i) => (
                    <Card 
                      key={rec.size} 
                      size="small" 
                      hoverable
                      style={{ 
                        cursor: 'pointer',
                        border: selectedCalcRec?.size === rec.size 
                          ? '2px solid hsl(var(--primary))' 
                          : i === 0 
                            ? '1.5px solid hsl(var(--success))' 
                            : '1px solid hsl(var(--border))',
                        background: selectedCalcRec?.size === rec.size 
                          ? 'hsl(var(--primary) / 0.06)'
                          : i === 0 
                            ? 'hsl(var(--success) / 0.04)' 
                            : 'transparent',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                      onClick={() => setSelectedCalcRec(rec)}
                    >
                      <Row justify="space-between" align="middle" wrap={false}>
                        <Col flex="auto" style={{ minWidth: 0 }}>
                          <Space size={6} wrap>
                            {i === 0 && <Tag color="success" style={{ margin: 0 }}>Best</Tag>}
                            {selectedCalcRec?.size === rec.size && (
                              <Tag color="blue" style={{ margin: 0 }}>Selected</Tag>
                            )}
                            <Text strong style={{ fontSize: 15 }}>{rec.size}</Text>
                          </Space>
                          <div>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {rec.dimensions} · {rec.dimensionsInch}
                            </Text>
                          </div>
                          {rec.layout && (
                            <div>
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                {rec.layout.orientation} · {rec.layout.cols}×{rec.layout.rows} grid
                              </Text>
                            </div>
                          )}
                        </Col>
                        <Col style={{ flexShrink: 0, paddingLeft: 12 }}>
                          <Row gutter={12} wrap={false}>
                            <Col style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>{rec.ups}</div>
                              <Text type="secondary" style={{ fontSize: 10 }}>UPS</Text>
                            </Col>
                            <Col style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2, color: 'hsl(var(--success))' }}>
                                {rec.efficiency}%
                              </div>
                              <Text type="secondary" style={{ fontSize: 10 }}>Eff.</Text>
                            </Col>
                            <Col style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2, color: 'hsl(var(--warning))' }}>
                                {rec.wastePercent}%
                              </div>
                              <Text type="secondary" style={{ fontSize: 10 }}>Waste</Text>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </Space>
              </Col>

              {/* Visualizer */}
              <Col xs={24} md={10}>
                <Text strong style={{ marginBottom: 10, display: 'block' }}>Layout Preview:</Text>
                {selectedCalcRec ? (
                  <PaperLayoutVisualizer
                    sheetWidth={STANDARD_SIZES.find(s => s.name === selectedCalcRec.size)?.width || 210}
                    sheetHeight={STANDARD_SIZES.find(s => s.name === selectedCalcRec.size)?.height || 297}
                    gridLayout={selectedCalcRec.gridLayout}
                    itemWidth={selectedCalcRec.layout?.itemWidth || 0}
                    itemHeight={selectedCalcRec.layout?.itemHeight || 0}
                    ups={selectedCalcRec.ups}
                    wastePercent={selectedCalcRec.wastePercent}
                  />
                ) : (
                  <div style={{
                    height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'hsl(var(--muted))', borderRadius: 12,
                    color: 'hsl(var(--muted-foreground))', fontSize: 13
                  }}>
                    Select a recommendation to preview
                  </div>
                )}
              </Col>
            </Row>
          )}

          {calcResults?.error && (
            <Alert 
              type="warning" 
              message={calcResults.error} 
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CreateEstimate;

