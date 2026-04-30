'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '../lib/supabase/client';
import { calculatePaperCost, calculatePrintingCost, calculateProcessCost, calculateTotalCost } from '../utils/calculations';

const EstimateContext = createContext(null);

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
  const supabase = createClient();
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentEstimate, setCurrentEstimate] = useState({ ...initialEstimateData });
  const [currentStep, setCurrentStep] = useState(0);

  // Convert DB row to app shape
  const fromDb = (row) => ({
    id: row.estimate_number,
    dbId: row.id,
    jobDetails: row.job_details,
    paperEstimation: row.paper_estimation,
    printingEstimation: row.printing_estimation,
    prePostPress: row.pre_post_press,
    summary: row.summary,
    status: row.status,
    quotationGenerated: row.quotation_generated,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by
  });

  const fetchEstimates = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setEstimates(data.map(fromDb));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

  // Generate unique estimate number
  const generateEstimateNumber = async () => {
    const year = new Date().getFullYear();
    const { data } = await supabase
      .from('estimates')
      .select('estimate_number')
      .like('estimate_number', `EST-${year}-%`);
    const nums = (data || []).map(r => parseInt(r.estimate_number.split('-')[2]) || 0);
    const next = Math.max(0, ...nums) + 1;
    return `EST-${year}-${String(next).padStart(3, '0')}`;
  };

  // Update specific step data (in-memory only, saved on submit)
  const updateStepData = (step, data) => {
    setCurrentEstimate(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data }
    }));
  };

  const recalculatePaper = (paperData) => {
    const quantity = currentEstimate.jobDetails.quantity || 1000;
    const result = calculatePaperCost({ ...currentEstimate.paperEstimation, ...paperData, quantity });
    updateStepData('paperEstimation', { ...paperData, ...result });
    return result;
  };

  const recalculatePrinting = (printData) => {
    const quantity = currentEstimate.jobDetails.quantity || 1000;
    const result = calculatePrintingCost({ ...currentEstimate.printingEstimation, ...printData, quantity });
    updateStepData('printingEstimation', { ...printData, ...result });
    return result;
  };

  const recalculateProcess = (processData) => {
    const result = calculateProcessCost({ ...currentEstimate.prePostPress, ...processData });
    updateStepData('prePostPress', { ...processData, ...result });
    return result;
  };

  const recalculateSummary = (profitPercent = 20) => {
    const result = calculateTotalCost(currentEstimate, profitPercent);
    updateStepData('summary', result);
    return result;
  };

  const resetEstimate = () => {
    setCurrentEstimate({ ...initialEstimateData });
    setCurrentStep(0);
  };

  // Save new estimate to Supabase
  const saveEstimate = async (estimateData) => {
    const { data: { user } } = await supabase.auth.getUser();
    const estimateNumber = await generateEstimateNumber();
    const { data, error } = await supabase
      .from('estimates')
      .insert({
        estimate_number: estimateNumber,
        job_details: estimateData.jobDetails,
        paper_estimation: estimateData.paperEstimation,
        printing_estimation: estimateData.printingEstimation,
        pre_post_press: estimateData.prePostPress,
        summary: estimateData.summary,
        status: 'draft',
        quotation_generated: false,
        created_by: user?.id ?? null
      })
      .select()
      .single();
    if (error) throw error;
    const newEstimate = fromDb(data);
    setEstimates(prev => [newEstimate, ...prev]);
    return newEstimate;
  };

  // Update existing estimate in Supabase
  const updateEstimate = async (estimateId, updatedData) => {
    const estimate = estimates.find(e => e.id === estimateId);
    if (!estimate) return;
    const dbUpdate = {};
    if (updatedData.jobDetails) dbUpdate.job_details = updatedData.jobDetails;
    if (updatedData.paperEstimation) dbUpdate.paper_estimation = updatedData.paperEstimation;
    if (updatedData.printingEstimation) dbUpdate.printing_estimation = updatedData.printingEstimation;
    if (updatedData.prePostPress) dbUpdate.pre_post_press = updatedData.prePostPress;
    if (updatedData.summary) dbUpdate.summary = updatedData.summary;
    if (updatedData.status) dbUpdate.status = updatedData.status;
    if (updatedData.quotationGenerated !== undefined) dbUpdate.quotation_generated = updatedData.quotationGenerated;
    const { error } = await supabase.from('estimates').update(dbUpdate).eq('id', estimate.dbId);
    if (error) throw error;
    setEstimates(prev =>
      prev.map(est => est.id === estimateId ? { ...est, ...updatedData } : est)
    );
  };

  const loadEstimate = (estimateId) => {
    const estimate = estimates.find(e => e.id === estimateId);
    if (estimate) {
      setCurrentEstimate(estimate);
      return estimate;
    }
    return null;
  };

  const updateEstimateStatus = async (estimateId, status) => {
    await updateEstimate(estimateId, { status });
  };

  const deleteEstimate = async (estimateId) => {
    const estimate = estimates.find(e => e.id === estimateId);
    if (!estimate) return;
    const { error } = await supabase.from('estimates').delete().eq('id', estimate.dbId);
    if (error) throw error;
    setEstimates(prev => prev.filter(est => est.id !== estimateId));
  };

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
    loading,
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
    getDashboardStats,
    refetch: fetchEstimates
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

