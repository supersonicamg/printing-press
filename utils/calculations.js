/**
 * Printing Press Cost Calculation Utilities
 * All calculations are mock implementations for UI demonstration
 */

// Paper size dimensions in mm
const PAPER_SIZES = {
  'A4': { width: 210, height: 297 },
  'A3': { width: 297, height: 420 },
  'A2': { width: 420, height: 594 },
  'A1': { width: 594, height: 841 },
  'Letter': { width: 216, height: 279 },
  'Legal': { width: 216, height: 356 },
  'Tabloid': { width: 279, height: 432 },
  '20x30': { width: 508, height: 762 },
  '23x36': { width: 584, height: 914 },
  '25x36': { width: 635, height: 914 }
};

/**
 * Calculate paper cost based on quantity, GSM, size, and wastage
 */
export const calculatePaperCost = ({
  quantity = 1000,
  gsm = 80,
  sheetSize = 'A4',
  ups = 1,
  wastagePercent = 5,
  ratePerKg = 85
}) => {
  const size = PAPER_SIZES[sheetSize] || PAPER_SIZES['A4'];
  
  // Calculate total sheets needed
  const sheetsNeeded = Math.ceil(quantity / ups);
  const wastageSheets = Math.ceil(sheetsNeeded * (wastagePercent / 100));
  const totalSheets = sheetsNeeded + wastageSheets;
  
  // Calculate paper weight in kg
  // Formula: area_m² = (width_mm × height_mm) / 1,000,000
  //          weight_kg/sheet = area_m² × gsm / 1000
  const sheetAreaSqM = (size.width * size.height) / 1000000;
  const weightPerSheet = sheetAreaSqM * gsm / 1000;
  const paperWeight = totalSheets * weightPerSheet;
  
  // Calculate cost
  const paperCost = paperWeight * ratePerKg;
  
  return {
    totalSheets: Math.round(totalSheets),
    paperWeight: parseFloat(paperWeight.toFixed(2)),
    paperCost: parseFloat(paperCost.toFixed(2))
  };
};

/**
 * Calculate printing cost based on machine, colors, and impressions
 */
export const calculatePrintingCost = ({
  quantity = 1000,
  colorsFront = 4,
  colorsBack = 0,
  ratePerImpression = 0.15,
  setupCost = 500,
  ups = 1
}) => {
  // Calculate impressions
  const sheetsNeeded = Math.ceil(quantity / ups);
  const totalColors = colorsFront + colorsBack;
  const impressions = sheetsNeeded * totalColors;
  
  // Calculate printing cost
  const impressionCost = impressions * ratePerImpression;
  const printingCost = impressionCost + setupCost;
  
  return {
    impressions: Math.round(impressions),
    printingCost: parseFloat(printingCost.toFixed(2))
  };
};

/**
 * Calculate pre-press and post-press process costs
 */
export const calculateProcessCost = ({
  plateCost = 0,
  designCost = 0,
  processes = {}
}) => {
  let processCost = plateCost + designCost;
  
  Object.values(processes).forEach(process => {
    if (process.enabled) {
      processCost += process.cost || 0;
    }
  });
  
  return {
    processCost: parseFloat(processCost.toFixed(2))
  };
};

/**
 * Calculate total cost and selling price
 */
export const calculateTotalCost = (estimateData, profitPercent = 20) => {
  const paperCost = estimateData.paperEstimation?.paperCost || 0;
  const printingCost = estimateData.printingEstimation?.printingCost || 0;
  const processCost = estimateData.prePostPress?.processCost || 0;
  
  const totalCost = paperCost + printingCost + processCost;
  const profitAmount = totalCost * (profitPercent / 100);
  const sellingPrice = totalCost + profitAmount;
  
  const quantity = estimateData.jobDetails?.quantity || 1;
  const costPerUnit = sellingPrice / quantity;
  
  return {
    paperCost: parseFloat(paperCost.toFixed(2)),
    printingCost: parseFloat(printingCost.toFixed(2)),
    processCost: parseFloat(processCost.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    profitPercent,
    profitAmount: parseFloat(profitAmount.toFixed(2)),
    sellingPrice: parseFloat(sellingPrice.toFixed(2)),
    costPerUnit: parseFloat(costPerUnit.toFixed(4))
  };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount, currency = '₹') => {
  return `${currency}${amount.toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  return num.toLocaleString('en-IN');
};
