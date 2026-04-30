/**
 * Paper Size Optimization Utility
 * Suggests the best standard paper size based on customer requirements
 * to minimize wastage
 */

// Standard paper sizes in mm
export const STANDARD_SIZES = [
  // { name: 'A5', width: 148, height: 210, category: 'A Series' },
  // { name: 'A4', width: 210, height: 297, category: 'A Series' },
  // { name: 'A3', width: 297, height: 420, category: 'A Series' },
  // { name: 'A2', width: 420, height: 594, category: 'A Series' },
  // { name: 'A1', width: 594, height: 841, category: 'A Series' },
  // { name: 'Letter', width: 216, height: 279, category: 'US' },
  // { name: 'Legal', width: 216, height: 356, category: 'US' },
  // { name: 'Tabloid', width: 279, height: 432, category: 'US' },
  // { name: '18x23', width: 457, height: 584, category: 'Indian' },
  { name: '15x30', width: 381, height: 762, category: 'Indian' },
  { name: '17x24', width: 432, height: 610, category: 'Indian' },
  { name: '18x23', width: 457, height: 584, category: 'Indian' },  // 23" = 584mm (was wrongly 610)
  { name: '18x25', width: 457, height: 635, category: 'Indian' },
  { name: '20x30', width: 508, height: 762, category: 'Indian' },
  { name: '23x36', width: 584, height: 914, category: 'Indian' },
  { name: '25x36', width: 635, height: 914, category: 'Indian' }
];

// Unit conversion factors to mm
export const UNIT_CONVERSIONS = {
  mm: 1,
  cm: 10,
  inch: 25.4,
  m: 1000
};

// Default print imposition margins (all in mm).
// Indian offset press industry-standard defaults; users can override in the UI.
export const DEFAULT_MARGINS = {
  bleed: 3,           // mm — standard 3mm bleed on each side of the item
  gutter: 3,          // mm — 3mm gap between items on the sheet
  gripperLeft: 10,    // mm — lead edge gripper (mechanical clamp area)
  gripperRight: 5,    // mm — trail edge margin
  gripperTop: 5,      // mm — top edge margin
  gripperBottom: 5,   // mm — bottom edge margin
};

/**
 * Convert any unit to mm
 */
export const convertToMm = (value, unit = 'mm') => {
  const factor = UNIT_CONVERSIONS[unit] || 1;
  return value * factor;
};

/**
 * Convert mm to any unit
 */
export const convertFromMm = (mm, unit = 'mm') => {
  const factor = UNIT_CONVERSIONS[unit] || 1;
  return mm / factor;
};

/**
 * Convert inches to mm
 */
export const inchesToMm = (inches) => inches * 25.4;

/**
 * Convert mm to inches
 */
export const mmToInches = (mm) => mm / 25.4;

/**
 * Parse size input (can be in inches like "5.5x8.5" or mm like "140x216")
 * Returns dimensions in mm
 */
export const parseSize = (input) => {
  if (!input) return null;
  
  // Clean the input
  const cleaned = input.toString().toLowerCase().trim();
  
  // Try to match patterns like "5.5x8.5", "5.5 x 8.5", "5.5*8.5"
  const match = cleaned.match(/(\d+\.?\d*)\s*[x*×]\s*(\d+\.?\d*)/);
  
  if (!match) return null;
  
  let width = parseFloat(match[1]);
  let height = parseFloat(match[2]);
  
  // If dimensions are small (likely inches), convert to mm
  // Assume anything under 50 is in inches
  if (width < 50 && height < 50) {
    width = inchesToMm(width);
    height = inchesToMm(height);
  }
  
  // Ensure width is always the smaller dimension
  if (width > height) {
    [width, height] = [height, width];
  }
  
  return { width, height };
};

/**
 * Calculate how many items can fit on a sheet with detailed layout.
 * @param {number} itemWidth  - finished item width in mm
 * @param {number} itemHeight - finished item height in mm
 * @param {number} sheetWidth - sheet width in mm
 * @param {number} sheetHeight - sheet height in mm
 * @param {object} [margins]  - optional margin overrides (keys from DEFAULT_MARGINS)
 * Returns { ups, wastePercent, layout, gridLayout }
 */
export const calculateFit = (itemWidth, itemHeight, sheetWidth, sheetHeight, margins = {}) => {
  // Resolve margins — fall back to DEFAULT_MARGINS for any key not supplied.
  const bleed   = margins.bleed         ?? DEFAULT_MARGINS.bleed;
  const gutter  = margins.gutter        ?? DEFAULT_MARGINS.gutter;
  const gLeft   = margins.gripperLeft   ?? DEFAULT_MARGINS.gripperLeft;
  const gRight  = margins.gripperRight  ?? DEFAULT_MARGINS.gripperRight;
  const gTop    = margins.gripperTop    ?? DEFAULT_MARGINS.gripperTop;
  const gBottom = margins.gripperBottom ?? DEFAULT_MARGINS.gripperBottom;

  // Add bleed on each side to get the cell footprint
  const itemW = itemWidth  + 2 * bleed;
  const itemH = itemHeight + 2 * bleed;

  // Reserve gripper margins to get the usable print area
  const printWidth  = sheetWidth  - gLeft - gRight;
  const printHeight = sheetHeight - gTop  - gBottom;

  if (printWidth <= 0 || printHeight <= 0) {
    return { ups: 0, wastePercent: 100, layout: null, gridLayout: null };
  }

  // Gutter-aware packing tried in both orientations.
  const fitFor = (w, h) => {
    let cols = Math.floor((printWidth  + gutter) / (w + gutter));
    let rows = Math.floor((printHeight + gutter) / (h + gutter));
    cols = Math.max(0, cols);
    rows = Math.max(0, rows);
    // Gutter applies only BETWEEN items — validate and shrink if needed.
    while (cols > 0 && cols * w + (cols - 1) * gutter > printWidth)  cols -= 1;
    while (rows > 0 && rows * h + (rows - 1) * gutter > printHeight) rows -= 1;
    return { cols, rows, total: cols * rows };
  };

  const a = fitFor(itemW, itemH);             // portrait (as-is)
  const b = fitFor(itemH, itemW);             // landscape (rotated)

  const useB = b.total > a.total;
  const chosen = useB ? b : a;
  const ups = chosen.total;
  const cols = chosen.cols;
  const rows = chosen.rows;
  const usedItemWidth = useB ? itemH : itemW;
  const usedItemHeight = useB ? itemW : itemH;

  if (ups === 0) {
    return { ups: 0, wastePercent: 100, layout: null, gridLayout: null };
  }

  // Rule 9 + 10 + 11: area calculations use FULL item size (with bleed),
  // total area is the printable area only.
  const itemAreaWithBleed = usedItemWidth * usedItemHeight;
  const usedArea = ups * itemAreaWithBleed;
  const totalArea = printWidth * printHeight;
  const wastage = Math.max(0, totalArea - usedArea);
  const wastePercent = (wastage / totalArea) * 100;

  // The actual item dimensions without bleed (for content-area visualization)
  const contentW = useB ? itemHeight : itemWidth;
  const contentH = useB ? itemWidth : itemHeight;

  // Build grid layout for visualization (positions on the full sheet)
  const gridLayout = {
    sheetWidth,
    sheetHeight,
    printAreaX: gLeft,
    printAreaY: gTop,
    gripperLeft: gLeft,
    gripperRight: gRight,
    gripperTop: gTop,
    gripperBottom: gBottom,
    printWidth,
    printHeight,
    bleed,
    gutter,
    cells: []
  };

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cellX = gLeft + col * (usedItemWidth  + gutter);
      const cellY = gTop  + row * (usedItemHeight + gutter);
      gridLayout.cells.push({
        x: cellX,
        y: cellY,
        width: usedItemWidth,
        height: usedItemHeight,
        // Content area (inner rect, excluding bleed)
        contentX: cellX + bleed,
        contentY: cellY + bleed,
        contentWidth: contentW,
        contentHeight: contentH,
      });
    }
  }

  return {
    ups,
    wastePercent: Math.round(wastePercent * 10) / 10,
    usedArea: Math.round(usedArea),
    totalArea: Math.round(totalArea),
    wasteArea: Math.round(wastage),
    layout: {
      cols,
      rows,
      orientation: useB ? 'Rotated (H×W)' : 'Normal (W×H)',
      itemWidth: Math.round(itemWidth * 10) / 10,
      itemHeight: Math.round(itemHeight * 10) / 10,
      itemWidthWithBleed:  Math.round(itemW * 10) / 10,
      itemHeightWithBleed: Math.round(itemH * 10) / 10,
      printWidth:  Math.round(printWidth  * 10) / 10,
      printHeight: Math.round(printHeight * 10) / 10,
      bleed,
      gutter,
      gripper: { left: gLeft, right: gRight, top: gTop, bottom: gBottom }
    },
    gridLayout
  };
};

/**
 * Get all valid paper size options with their efficiency.
 * @param {number} customerWidth  - finished item width in mm
 * @param {number} customerHeight - finished item height in mm
 * @param {object} [margins]      - optional margin overrides
 */
export const getSizeOptions = (customerWidth, customerHeight, margins = {}) => {
  const results = [];
  
  for (const size of STANDARD_SIZES) {
    const fit = calculateFit(customerWidth, customerHeight, size.width, size.height, margins);
    
    if (fit.ups > 0) {
      results.push({
        ...size,
        ups: fit.ups,
        wastePercent: fit.wastePercent,
        layout: fit.layout,
        gridLayout: fit.gridLayout,
        usedArea: fit.usedArea,
        totalArea: fit.totalArea,
        wasteArea: fit.wasteArea,
        efficiency: 100 - fit.wastePercent
      });
    }
  }
  
  // Final Selection Rule:
  //  Priority 1: Lowest wastage %
  //  Priority 2 (tiebreaker): Higher UPS (more pieces per sheet)
  results.sort((a, b) => {
    if (a.wastePercent !== b.wastePercent) {
      return a.wastePercent - b.wastePercent;
    }
    return b.ups - a.ups;
  });
  
  return results;
};

/**
 * Get the best paper size recommendation.
 * @param {number} customerWidth  - finished item width in mm
 * @param {number} customerHeight - finished item height in mm
 * @param {object} [margins]      - optional margin overrides
 */
export const getBestSize = (customerWidth, customerHeight, margins = {}) => {
  const options = getSizeOptions(customerWidth, customerHeight, margins);
  if (options.length === 0) return null;
  return options[0];
};

/**
 * Get top 3 recommendations with reasons
 */
export const getRecommendations = (inputSize, unit = 'inch') => {
  const parsed = parseSize(inputSize);
  
  if (!parsed) {
    return { error: 'Invalid size format. Use format like "5.5x8.5" or "140x210"' };
  }
  
  const { width, height } = parsed;
  const options = getSizeOptions(width, height);
  
  if (options.length === 0) {
    return { 
      error: 'No suitable standard sizes found. Item may be too large.',
      customerSize: { width, height }
    };
  }
  
  // Get top 5 options
  const recommendations = options.slice(0, 5).map((opt, index) => ({
    rank: index + 1,
    size: opt.name,
    dimensions: `${opt.width} × ${opt.height} mm`,
    dimensionsInch: `${mmToInches(opt.width).toFixed(1)} × ${mmToInches(opt.height).toFixed(1)} inch`,
    ups: opt.ups,
    wastePercent: opt.wastePercent,
    efficiency: opt.efficiency.toFixed(1),
    layout: opt.layout,
    gridLayout: opt.gridLayout,
    usedArea: opt.usedArea,
    totalArea: opt.totalArea,
    wasteArea: opt.wasteArea,
    reason: index === 0 
      ? 'Best efficiency - Minimum wastage' 
      : index === 1 
        ? 'Alternative option'
        : 'Other option'
  }));
  
  return {
    customerSize: {
      width: Math.round(width * 10) / 10,
      height: Math.round(height * 10) / 10,
      widthInch: mmToInches(width).toFixed(2),
      heightInch: mmToInches(height).toFixed(2),
      inInches: `${mmToInches(width).toFixed(2)} × ${mmToInches(height).toFixed(2)} inches`
    },
    recommendations,
    best: recommendations[0]
  };
};

/**
 * Get recommendations from width/height values directly.
 * @param {number} width    - finished item width in the given unit
 * @param {number} height   - finished item height in the given unit
 * @param {string} [unit]   - 'mm' | 'cm' | 'inch' | 'm'
 * @param {object} [margins] - optional margin overrides (keys from DEFAULT_MARGINS)
 */
export const getRecommendationsFromDimensions = (width, height, unit = 'mm', margins = {}) => {
  const widthMm  = convertToMm(width,  unit);
  const heightMm = convertToMm(height, unit);
  
  const options = getSizeOptions(widthMm, heightMm, margins);
  
  if (options.length === 0) {
    return { 
      error: 'No suitable standard sizes found. Item may be too large.',
      customerSize: { width: widthMm, height: heightMm }
    };
  }
  
  // Get top 5 options
  const recommendations = options.slice(0, 5).map((opt, index) => ({
    rank: index + 1,
    size: opt.name,
    dimensions: `${opt.width} × ${opt.height} mm`,
    dimensionsInch: `${mmToInches(opt.width).toFixed(1)} × ${mmToInches(opt.height).toFixed(1)} inch`,
    ups: opt.ups,
    wastePercent: opt.wastePercent,
    efficiency: opt.efficiency.toFixed(1),
    layout: opt.layout,
    gridLayout: opt.gridLayout,
    usedArea: opt.usedArea,
    totalArea: opt.totalArea,
    wasteArea: opt.wasteArea,
    reason: index === 0 
      ? 'Best efficiency - Minimum wastage' 
      : index === 1 
        ? 'Alternative option'
        : 'Other option'
  }));
  
  return {
    customerSize: {
      width: Math.round(widthMm * 10) / 10,
      height: Math.round(heightMm * 10) / 10,
      widthInch: mmToInches(widthMm).toFixed(2),
      heightInch: mmToInches(heightMm).toFixed(2),
      inInches: `${mmToInches(widthMm).toFixed(2)} × ${mmToInches(heightMm).toFixed(2)} inches`
    },
    recommendations,
    best: recommendations[0]
  };
};

export default {
  parseSize,
  getSizeOptions,
  getBestSize,
  getRecommendations,
  getRecommendationsFromDimensions,
  convertToMm,
  convertFromMm,
  STANDARD_SIZES,
  UNIT_CONVERSIONS,
  DEFAULT_MARGINS,
  inchesToMm,
  mmToInches
};
