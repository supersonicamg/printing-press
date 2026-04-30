/**
 * Mock Data for Printing Press Estimator
 * All data is static for UI demonstration purposes
 */

// Paper Master Data
export const paperTypes = [
  { id: 1, name: 'Art Paper', gsmRange: '90-300', ratePerKg: 95, stock: 'Available' },
  { id: 2, name: 'Maplitho', gsmRange: '60-120', ratePerKg: 72, stock: 'Available' },
  { id: 3, name: 'Chromo Paper', gsmRange: '80-150', ratePerKg: 88, stock: 'Low Stock' },
  { id: 4, name: 'Bond Paper', gsmRange: '60-100', ratePerKg: 68, stock: 'Available' },
  { id: 5, name: 'Duplex Board', gsmRange: '200-450', ratePerKg: 55, stock: 'Available' },
  { id: 6, name: 'Grey Board', gsmRange: '250-600', ratePerKg: 42, stock: 'Available' },
  { id: 7, name: 'Kraft Paper', gsmRange: '80-200', ratePerKg: 48, stock: 'Available' },
  { id: 8, name: 'Newsprint', gsmRange: '45-52', ratePerKg: 38, stock: 'Available' }
];

// Machine Master Data
export const machines = [
  { id: 1, name: 'Heidelberg SM 74', type: 'Offset', maxSize: '52x74 cm', colors: 4, speedPerHour: 15000, ratePerImpression: 0.12 },
  { id: 2, name: 'Heidelberg SM 102', type: 'Offset', maxSize: '72x102 cm', colors: 5, speedPerHour: 13000, ratePerImpression: 0.18 },
  { id: 3, name: 'Komori LS 440', type: 'Offset', maxSize: '62x90 cm', colors: 4, speedPerHour: 14000, ratePerImpression: 0.14 },
  { id: 4, name: 'Roland 700', type: 'Offset', maxSize: '70x100 cm', colors: 6, speedPerHour: 12000, ratePerImpression: 0.22 },
  { id: 5, name: 'HP Indigo 12000', type: 'Digital', maxSize: '31x46 cm', colors: 7, speedPerHour: 4600, ratePerImpression: 0.85 },
  { id: 6, name: 'Xerox iGen 5', type: 'Digital', maxSize: '32x48 cm', colors: 6, speedPerHour: 6000, ratePerImpression: 0.65 }
];

// Ink Master Data
export const inks = [
  { id: 1, name: 'Process Cyan', type: 'CMYK', brand: 'Sun Chemical', ratePerKg: 850, coverage: '4 gm/1000 imp' },
  { id: 2, name: 'Process Magenta', type: 'CMYK', brand: 'Sun Chemical', ratePerKg: 920, coverage: '3.5 gm/1000 imp' },
  { id: 3, name: 'Process Yellow', type: 'CMYK', brand: 'Sun Chemical', ratePerKg: 780, coverage: '3 gm/1000 imp' },
  { id: 4, name: 'Process Black', type: 'CMYK', brand: 'Sun Chemical', ratePerKg: 650, coverage: '3.5 gm/1000 imp' },
  { id: 5, name: 'Pantone 485 Red', type: 'Spot', brand: 'Toyo', ratePerKg: 1200, coverage: '4 gm/1000 imp' },
  { id: 6, name: 'Metallic Gold', type: 'Special', brand: 'Eckart', ratePerKg: 2800, coverage: '5 gm/1000 imp' },
  { id: 7, name: 'UV Coating', type: 'Special', brand: 'Actega', ratePerKg: 450, coverage: '8 gm/1000 imp' }
];

// Process Master Data
export const processes = [
  { id: 1, name: 'Cutting', type: 'Post-Press', rateType: 'Per 100 sheets', rate: 5, minCharge: 100 },
  { id: 2, name: 'Folding', type: 'Post-Press', rateType: 'Per 1000 sheets', rate: 80, minCharge: 200 },
  { id: 3, name: 'Lamination (Gloss)', type: 'Post-Press', rateType: 'Per sq.ft', rate: 2.5, minCharge: 500 },
  { id: 4, name: 'Lamination (Matte)', type: 'Post-Press', rateType: 'Per sq.ft', rate: 3.0, minCharge: 500 },
  { id: 5, name: 'Perfect Binding', type: 'Binding', rateType: 'Per book', rate: 15, minCharge: 300 },
  { id: 6, name: 'Saddle Stitch', type: 'Binding', rateType: 'Per book', rate: 5, minCharge: 150 },
  { id: 7, name: 'Spiral Binding', type: 'Binding', rateType: 'Per book', rate: 25, minCharge: 100 },
  { id: 8, name: 'Numbering', type: 'Post-Press', rateType: 'Per 1000', rate: 150, minCharge: 300 },
  { id: 9, name: 'Perforation', type: 'Post-Press', rateType: 'Per 1000', rate: 100, minCharge: 200 },
  { id: 10, name: 'UV Spot', type: 'Finishing', rateType: 'Per sq.ft', rate: 8, minCharge: 1000 },
  { id: 11, name: 'Embossing', type: 'Finishing', rateType: 'Per sq.ft', rate: 12, minCharge: 1500 },
  { id: 12, name: 'Die Cutting', type: 'Post-Press', rateType: 'Per 100 sheets', rate: 25, minCharge: 500 }
];

// Product Types
export const productTypes = [
  'Business Cards',
  'Letterhead',
  'Envelope',
  'Brochure',
  'Flyer',
  'Poster',
  'Catalog',
  'Magazine',
  'Book',
  'Calendar',
  'Packaging Box',
  'Label/Sticker',
  'Invoice/Bill Book',
  'Visiting Card',
  'Wedding Card',
  'Carry Bag',
  'Other'
];

// Sheet Sizes
export const sheetSizes = [
  // 'A4',
  // 'A3',
  // 'A2',
  // 'A1',
  // 'Letter',
  // 'Legal',
  // 'Tabloid',
 
  '18x24',
  '18x25',
  '20x30',
  '17x24',
  '20x30',
  '23x36',
  '25x36'
];

// Print Types
export const printTypes = [
  'Single Side',
  'Both Side',
  'Front Only',
  'Front + Back (1 Color)',
  'Front + Back (4 Color)'
];

// GSM Options
export const gsmOptions = [45, 52, 60, 70, 80, 90, 100, 105, 115, 130, 150, 170, 200, 210, 250, 300, 350, 400, 450];

// Customers (mock)
export const customers = [
  { id: 1, name: 'Acme Corporation', contact: 'John Smith', phone: '+91 98765 43210', email: 'john@acme.com' },
  { id: 2, name: 'TechStart India', contact: 'Priya Sharma', phone: '+91 87654 32109', email: 'priya@techstart.in' },
  { id: 3, name: 'Global Traders', contact: 'Ahmed Khan', phone: '+91 76543 21098', email: 'ahmed@globaltraders.com' },
  { id: 4, name: 'Fashion Hub', contact: 'Sneha Patel', phone: '+91 65432 10987', email: 'sneha@fashionhub.in' },
  { id: 5, name: 'Sunrise Publishers', contact: 'Rajesh Kumar', phone: '+91 54321 09876', email: 'rajesh@sunrise.com' },
  { id: 6, name: 'Metro Pharmaceuticals', contact: 'Dr. Meera Nair', phone: '+91 43210 98765', email: 'meera@metropharma.com' }
];

// Sales Persons
export const salesPersons = [
  { id: 1, name: 'Rahul Verma', target: 500000, achieved: 380000 },
  { id: 2, name: 'Anita Desai', target: 450000, achieved: 420000 },
  { id: 3, name: 'Kiran Rao', target: 400000, achieved: 310000 },
  { id: 4, name: 'Suresh Menon', target: 550000, achieved: 490000 }
];

// Mock Estimates
export const mockEstimates = [
  {
    id: 'EST-2024-001',
    jobDetails: {
      customerName: 'Acme Corporation',
      jobName: 'Annual Report 2024',
      productType: 'Catalog',
      quantity: 5000,
      deliveryDate: '2024-02-15',
      salesPerson: 'Rahul Verma'
    },
    paperEstimation: {
      paperType: 'Art Paper',
      gsm: 130,
      sheetSize: 'A3',
      ups: 2,
      wastagePercent: 8,
      ratePerKg: 95,
      totalSheets: 2700,
      paperWeight: 45.2,
      paperCost: 4294
    },
    printingEstimation: {
      machine: 'Heidelberg SM 74',
      printType: 'Both Side',
      colorsFront: 4,
      colorsBack: 4,
      impressions: 21600,
      setupCost: 1500,
      ratePerImpression: 0.12,
      printingCost: 4092
    },
    prePostPress: {
      plateCost: 2400,
      designCost: 5000,
      processes: {
        cutting: { enabled: true, cost: 500 },
        folding: { enabled: true, cost: 800 },
        lamination: { enabled: true, cost: 3500 },
        binding: { enabled: true, cost: 7500 }
      },
      processCost: 19700
    },
    summary: {
      paperCost: 4294,
      printingCost: 4092,
      processCost: 19700,
      totalCost: 28086,
      profitPercent: 25,
      profitAmount: 7021.5,
      sellingPrice: 35107.5,
      costPerUnit: 7.02
    },
    createdAt: '2024-01-20T10:30:00Z',
    status: 'approved',
    quotationGenerated: true
  },
  {
    id: 'EST-2024-002',
    jobDetails: {
      customerName: 'TechStart India',
      jobName: 'Product Brochure',
      productType: 'Brochure',
      quantity: 10000,
      deliveryDate: '2024-02-10',
      salesPerson: 'Anita Desai'
    },
    paperEstimation: {
      paperType: 'Art Paper',
      gsm: 170,
      sheetSize: 'A4',
      ups: 4,
      wastagePercent: 5,
      ratePerKg: 95,
      totalSheets: 2625,
      paperWeight: 27.8,
      paperCost: 2641
    },
    printingEstimation: {
      machine: 'Heidelberg SM 74',
      printType: 'Both Side',
      colorsFront: 4,
      colorsBack: 4,
      impressions: 21000,
      setupCost: 1200,
      ratePerImpression: 0.12,
      printingCost: 3720
    },
    prePostPress: {
      plateCost: 1600,
      designCost: 3000,
      processes: {
        cutting: { enabled: true, cost: 300 },
        folding: { enabled: true, cost: 500 },
        lamination: { enabled: true, cost: 2000 }
      },
      processCost: 7400
    },
    summary: {
      paperCost: 2641,
      printingCost: 3720,
      processCost: 7400,
      totalCost: 13761,
      profitPercent: 22,
      profitAmount: 3027.42,
      sellingPrice: 16788.42,
      costPerUnit: 1.68
    },
    createdAt: '2024-01-18T14:20:00Z',
    status: 'pending',
    quotationGenerated: false
  },
  {
    id: 'EST-2024-003',
    jobDetails: {
      customerName: 'Fashion Hub',
      jobName: 'Business Cards Premium',
      productType: 'Business Cards',
      quantity: 2000,
      deliveryDate: '2024-01-30',
      salesPerson: 'Kiran Rao'
    },
    paperEstimation: {
      paperType: 'Art Paper',
      gsm: 350,
      sheetSize: 'A4',
      ups: 12,
      wastagePercent: 10,
      ratePerKg: 95,
      totalSheets: 184,
      paperWeight: 4.02,
      paperCost: 382
    },
    printingEstimation: {
      machine: 'HP Indigo 12000',
      printType: 'Both Side',
      colorsFront: 4,
      colorsBack: 4,
      impressions: 1472,
      setupCost: 800,
      ratePerImpression: 0.85,
      printingCost: 2051.2
    },
    prePostPress: {
      plateCost: 0,
      designCost: 1500,
      processes: {
        cutting: { enabled: true, cost: 200 },
        lamination: { enabled: true, cost: 500 },
        uv: { enabled: true, cost: 800 }
      },
      processCost: 3000
    },
    summary: {
      paperCost: 382,
      printingCost: 2051.2,
      processCost: 3000,
      totalCost: 5433.2,
      profitPercent: 30,
      profitAmount: 1629.96,
      sellingPrice: 7063.16,
      costPerUnit: 3.53
    },
    createdAt: '2024-01-15T09:45:00Z',
    status: 'completed',
    quotationGenerated: true
  },
  {
    id: 'EST-2024-004',
    jobDetails: {
      customerName: 'Sunrise Publishers',
      jobName: 'Monthly Magazine - Feb',
      productType: 'Magazine',
      quantity: 25000,
      deliveryDate: '2024-02-01',
      salesPerson: 'Suresh Menon'
    },
    paperEstimation: {
      paperType: 'Maplitho',
      gsm: 70,
      sheetSize: '23x36',
      ups: 8,
      wastagePercent: 6,
      ratePerKg: 72,
      totalSheets: 3313,
      paperWeight: 123.8,
      paperCost: 8914
    },
    printingEstimation: {
      machine: 'Heidelberg SM 102',
      printType: 'Both Side',
      colorsFront: 4,
      colorsBack: 4,
      impressions: 26504,
      setupCost: 2500,
      ratePerImpression: 0.18,
      printingCost: 7270.72
    },
    prePostPress: {
      plateCost: 3200,
      designCost: 0,
      processes: {
        cutting: { enabled: true, cost: 800 },
        folding: { enabled: true, cost: 1500 },
        binding: { enabled: true, cost: 12500 }
      },
      processCost: 18000
    },
    summary: {
      paperCost: 8914,
      printingCost: 7270.72,
      processCost: 18000,
      totalCost: 34184.72,
      profitPercent: 18,
      profitAmount: 6153.25,
      sellingPrice: 40337.97,
      costPerUnit: 1.61
    },
    createdAt: '2024-01-22T16:00:00Z',
    status: 'approved',
    quotationGenerated: true
  },
  {
    id: 'EST-2024-005',
    jobDetails: {
      customerName: 'Global Traders',
      jobName: 'Invoice Books (Triplicate)',
      productType: 'Invoice/Bill Book',
      quantity: 500,
      deliveryDate: '2024-02-20',
      salesPerson: 'Rahul Verma'
    },
    paperEstimation: {
      paperType: 'Bond Paper',
      gsm: 60,
      sheetSize: 'A4',
      ups: 2,
      wastagePercent: 8,
      ratePerKg: 68,
      totalSheets: 810,
      paperWeight: 3.03,
      paperCost: 206
    },
    printingEstimation: {
      machine: 'Komori LS 440',
      printType: 'Single Side',
      colorsFront: 2,
      colorsBack: 0,
      impressions: 1620,
      setupCost: 600,
      ratePerImpression: 0.14,
      printingCost: 826.8
    },
    prePostPress: {
      plateCost: 800,
      designCost: 800,
      processes: {
        cutting: { enabled: true, cost: 150 },
        numbering: { enabled: true, cost: 500 },
        perforation: { enabled: true, cost: 300 },
        binding: { enabled: true, cost: 1000 }
      },
      processCost: 3550
    },
    summary: {
      paperCost: 206,
      printingCost: 826.8,
      processCost: 3550,
      totalCost: 4582.8,
      profitPercent: 20,
      profitAmount: 916.56,
      sellingPrice: 5499.36,
      costPerUnit: 11.0
    },
    createdAt: '2024-01-19T11:15:00Z',
    status: 'draft',
    quotationGenerated: false
  }
];

// Dashboard Statistics
export const dashboardStats = {
  totalEstimates: 156,
  pendingQuotes: 23,
  avgCostPerJob: 18500,
  monthlyRevenue: 2850000,
  estimatesThisMonth: 34,
  quotesGenerated: 128,
  completedJobs: 112,
  conversionRate: 72
};

// Company Info for Quotation
export const companyInfo = {
  name: 'PrintMaster Press Pvt. Ltd.',
  address: '42, Industrial Estate, Sector 5',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  phone: '+91 22 2345 6789',
  email: 'info@printmaster.com',
  gstin: '27AABCP1234A1ZS',
  website: 'www.printmaster.com'
};
