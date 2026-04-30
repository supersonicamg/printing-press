'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculatePaperCost, calculatePrintingCost, calculateProcessCost, calculateTotalCost } from '../utils/calculations';

const EstimateContext = createContext(null);

// Default mock estimates for initial load
const defaultEstimates = [
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
  }
];

const initialEstimateData = {
  jobDetails: {
    customerName: '',
    jobName: '',
    productType: '',
    quantity: 1000,
    deliveryDate: null,
    salesPerson: ''
  },
  paperEstimation: {
    paperType: '',
    gsm: 80,
    sheetSize: '',
    ups: 1,
    wastagePercent: 5,
    ratePerKg: 0,
    totalSheets: 0,
    paperWeight: 0,
    paperCost: 0
  },
  printingEstimation: {
    machine: '',
    printType: '',
    colorsFront: 4,
    colorsBack: 0,
    impressions: 0,
    setupCost: 0,
    ratePerImpression: 0,
    printingCost: 0
  },
  prePostPress: {
    plateCost: 0,
    designCost: 0,
    processes: {
      cutting: { enabled: false, cost: 0 },
      folding: { enabled: false, cost: 0 },
      lamination: { enabled: false, cost: 0 },
      binding: { enabled: false, cost: 0 },
      numbering: { enabled: false, cost: 0 },
      perforation: { enabled: false, cost: 0 },
      uv: { enabled: false, cost: 0 },
      embossing: { enabled: false, cost: 0 }
    },
    processCost: 0
  },
  summary: {
    paperCost: 0,
    printingCost: 0,
    processCost: 0,
    totalCost: 0,
    profitPercent: 20,
    profitAmount: 0,
    sellingPrice: 0,
    costPerUnit: 0
  }
};

export const EstimateProvider = ({ children }) => {
  // Load estimates from localStorage or use defaults
  const [estimates, setEstimates] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem('printmaster_estimates') : null;
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultEstimates;
      }
    }
    return defaultEstimates;
  });
  
  const [currentEstimate, setCurrentEstimate] = useState({ ...initialEstimateData });
  const [currentStep, setCurrentStep] = useState(0);

  // Persist estimates to localStorage
  useEffect(() => {
    localStorage.setItem('printmaster_estimates', JSON.stringify(estimates));
  }, [estimates]);

  // Generate unique estimate ID
  const generateEstimateId = () => {
    const year = new Date().getFullYear();
    const existingIds = estimates
      .filter(e => e.id.startsWith(`EST-${year}`))
      .map(e => parseInt(e.id.split('-')[2]) || 0);
    const nextNum = Math.max(0, ...existingIds) + 1;
    return `EST-${year}-${String(nextNum).padStart(3, '0')}`;
  };

  // Update specific step data
  const updateStepData = (step, data) => {
    setCurrentEstimate(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data }
    }));
  };

  // Calculate paper estimation
  const recalculatePaper = (paperData) => {
    const quantity = currentEstimate.jobDetails.quantity || 1000;
    const result = calculatePaperCost({
      ...currentEstimate.paperEstimation,
      ...paperData,
      quantity
    });
    
    updateStepData('paperEstimation', {
      ...paperData,
      ...result
    });

    return result;
  };

  // Calculate printing estimation
  const recalculatePrinting = (printData) => {
    const quantity = currentEstimate.jobDetails.quantity || 1000;
    const result = calculatePrintingCost({
      ...currentEstimate.printingEstimation,
      ...printData,
      quantity
    });

    updateStepData('printingEstimation', {
      ...printData,
      ...result
    });

    return result;
  };

  // Calculate process costs
  const recalculateProcess = (processData) => {
    const result = calculateProcessCost({
      ...currentEstimate.prePostPress,
      ...processData
    });

    updateStepData('prePostPress', {
      ...processData,
      ...result
    });

    return result;
  };

  // Calculate final summary
  const recalculateSummary = (profitPercent = 20) => {
    const result = calculateTotalCost(currentEstimate, profitPercent);
    updateStepData('summary', result);
    return result;
  };

  // Reset current estimate
  const resetEstimate = () => {
    setCurrentEstimate({ ...initialEstimateData });
    setCurrentStep(0);
  };

  // Save estimate to list
  const saveEstimate = (estimateData) => {
    const newEstimate = {
      id: generateEstimateId(),
      ...estimateData,
      createdAt: new Date().toISOString(),
      status: 'draft',
      quotationGenerated: false
    };
    setEstimates(prev => [newEstimate, ...prev]);
    return newEstimate;
  };

  // Update existing estimate
  const updateEstimate = (estimateId, updatedData) => {
    setEstimates(prev => 
      prev.map(est => 
        est.id === estimateId 
          ? { ...est, ...updatedData, updatedAt: new Date().toISOString() }
          : est
      )
    );
  };

  // Load estimate for editing
  const loadEstimate = (estimateId) => {
    const estimate = estimates.find(e => e.id === estimateId);
    if (estimate) {
      setCurrentEstimate(estimate);
      return estimate;
    }
    return null;
  };

  // Update estimate status
  const updateEstimateStatus = (estimateId, status) => {
    setEstimates(prev => 
      prev.map(est => 
        est.id === estimateId ? { ...est, status } : est
      )
    );
  };

  // Delete estimate
  const deleteEstimate = (estimateId) => {
    setEstimates(prev => prev.filter(est => est.id !== estimateId));
  };

  // Get dashboard stats
  const getDashboardStats = () => {
    const total = estimates.length;
    const pending = estimates.filter(e => e.status === 'pending').length;
    const approved = estimates.filter(e => e.status === 'approved').length;
    const completed = estimates.filter(e => e.status === 'completed').length;
    const totalRevenue = estimates.reduce((sum, e) => sum + (e.summary?.sellingPrice || 0), 0);
    const avgCost = total > 0 ? totalRevenue / total : 0;
    
    return {
      totalEstimates: total,
      pendingQuotes: pending,
      approvedEstimates: approved,
      completedJobs: completed,
      avgCostPerJob: Math.round(avgCost),
      monthlyRevenue: totalRevenue
    };
  };

  const value = {
    estimates,
    currentEstimate,
    currentStep,
    setCurrentStep,
    updateStepData,
    recalculatePaper,
    recalculatePrinting,
    recalculateProcess,
    recalculateSummary,
    resetEstimate,
    saveEstimate,
    updateEstimate,
    loadEstimate,
    updateEstimateStatus,
    deleteEstimate,
    getDashboardStats
  };

  return (
    <EstimateContext.Provider value={value}>
      {children}
    </EstimateContext.Provider>
  );
};

export const useEstimate = () => {
  const context = useContext(EstimateContext);
  if (!context) {
    throw new Error('useEstimate must be used within an EstimateProvider');
  }
  return context;
};

