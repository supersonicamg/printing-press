'use client';
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getRecommendationsFromDimensions, STANDARD_SIZES, DEFAULT_MARGINS } from '../utils/paperSizeOptimizer';
import PaperLayoutVisualizer from './PaperLayoutVisualizer';

const PRESETS = [
  { label: '1/4 Size', w: 8.5, h: 11, unit: 'inch' },
  { label: '1/8 Size', w: 5.5, h: 8.5, unit: 'inch' },
];

// Which smaller working sheets can be cut from a parent sheet, and how many
// e.g. one 23×36 sheet cut in half along the 36" side → 2× 18×23
const CUT_SOURCES = {
  '18x23': { parent: '23x36', qty: 2, note: 'cut 23×36 in half' },
  '18x25': { parent: '25x36', qty: 2, note: 'cut 25×36 in half' },
  '15x30': { parent: '20x30', qty: 2, note: 'cut 20×30 in half' },
  '17x24': { parent: '23x36', qty: 1, note: 'trim from 23×36' },
};

export function PaperSizeCalculatorModal({ open, onClose, onApply, calcMargins = DEFAULT_MARGINS }) {
  const [calcWidth, setCalcWidth] = useState('');
  const [calcHeight, setCalcHeight] = useState('');
  const [calcUnit, setCalcUnit] = useState('inch');
  const [calcResults, setCalcResults] = useState(null);
  const [selectedCalcRec, setSelectedCalcRec] = useState(null);
  const [willCut, setWillCut] = useState(false);

  const handleClose = () => {
    setCalcResults(null);
    setSelectedCalcRec(null);
    onClose();
  };

  const handleCalculate = () => {
    const w = parseFloat(calcWidth);
    const h = parseFloat(calcHeight);
    if (!w || !h || w <= 0 || h <= 0) return;
    const result = getRecommendationsFromDimensions(w, h, calcUnit, calcMargins);
    setCalcResults(result);
    // auto-select best rec based on cut mode
    const recs = result.recommendations ?? [];
    const sorted = willCut
      ? [...recs].sort((a, b) => {
          const sa = STANDARD_SIZES.find(s => s.name === a.size);
          const sb = STANDARD_SIZES.find(s => s.name === b.size);
          return (sa?.width ?? 0) * (sa?.height ?? 0) - (sb?.width ?? 0) * (sb?.height ?? 0);
        })
      : recs;
    setSelectedCalcRec(sorted[0] ?? null);
  };

  // Sorted display list — cut mode prefers smallest fitting sheet
  const displayRecs = useMemo(() => {
    const recs = calcResults?.recommendations ?? [];
    if (!willCut) return recs;
    return [...recs].sort((a, b) => {
      const sa = STANDARD_SIZES.find(s => s.name === a.size);
      const sb = STANDARD_SIZES.find(s => s.name === b.size);
      return (sa?.width ?? 0) * (sa?.height ?? 0) - (sb?.width ?? 0) * (sb?.height ?? 0);
    });
  }, [calcResults, willCut]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCalculate();
  };

  const handleApply = () => {
    if (!selectedCalcRec) return;
    onApply(selectedCalcRec.size, selectedCalcRec.ups, calcWidth, calcHeight, calcUnit, calcResults, selectedCalcRec);
    handleClose();
  };

  const sheet = selectedCalcRec
    ? STANDARD_SIZES.find((s) => s.name === selectedCalcRec.size)
    : null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="p-0 rounded-2xl sm:rounded-2xl border border-gray-100 max-w-[min(92vw,860px)] gap-0 font-manrope overflow-hidden">

        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <p className="text-base font-bold text-foreground">Paper Size Calculator</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Enter finished size to find the optimal press sheet with minimum waste
          </p>
        </div>

        {/* ── Scrollable body ── */}
        <div className="px-5 py-4 space-y-3 overflow-y-auto max-h-[70vh]">

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground shrink-0">Presets:</span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setCalcWidth(String(preset.w));
                    setCalcHeight(String(preset.h));
                    setCalcUnit(preset.unit);
                  }}
                  className="px-3 py-1.5 text-sm font-semibold text-muted-foreground rounded-md hover:bg-gray-100 hover:text-foreground border border-border transition-colors"
                >
                  {preset.label}
                  <span className="ml-2 font-normal opacity-60">
                    ({preset.w} × {preset.h} {preset.unit})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Input row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Width</label>
              <input
                type="number"
                value={calcWidth}
                onChange={(e) => setCalcWidth(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={calcUnit === 'inch' ? '5.5' : calcUnit === 'cm' ? '14' : '140'}
                min="0"
                step="0.1"
                className="w-full px-4 py-2.5 rounded-md border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Height</label>
              <input
                type="number"
                value={calcHeight}
                onChange={(e) => setCalcHeight(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={calcUnit === 'inch' ? '8.5' : calcUnit === 'cm' ? '21' : '210'}
                min="0"
                step="0.1"
                className="w-full px-4 py-2.5 rounded-md border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Unit</label>
              <Select value={calcUnit} onValueChange={setCalcUnit}>
                <SelectTrigger className="w-full h-10.5 rounded-md border-border focus:ring-2 focus:ring-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inch">Inch</SelectItem>
                  <SelectItem value="mm">mm</SelectItem>
                  <SelectItem value="cm">cm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              {/* invisible label to align button with inputs */}
              <label className="text-sm font-semibold text-foreground opacity-0 select-none" aria-hidden="true">Find</label>
              <button
                type="button"
                onClick={handleCalculate}
                className="w-full px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-md hover:bg-[hsl(202,60%,38%)] transition-colors"
              >
                Find Best Size
              </button>
            </div>
          </div>

          {/* Customer size info bar */}
          {calcResults?.customerSize && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Finished size:</span>
              <span className="text-sm font-semibold text-foreground">
                {calcResults.customerSize.width} × {calcResults.customerSize.height} mm
              </span>
              <span className="text-sm text-muted-foreground">{calcResults.customerSize.inInches}</span>
            </div>
          )}

          {/* Results: recommendation cards + visualizer */}
          {calcResults?.recommendations && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

              {/* Recommendation cards */}
              <div className="md:col-span-3 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Recommendations — click to preview:
                </p>
                {calcResults.recommendations.map((rec, i) => (
                  <div
                    key={rec.size}
                    onClick={() => setSelectedCalcRec(rec)}
                    className={[
                      'bg-white border rounded-xl p-3 cursor-pointer transition-colors',
                      selectedCalcRec?.size === rec.size
                        ? 'border-primary/40 ring-1 ring-primary/10 bg-primary/5'
                        : i === 0
                          ? 'border-primary/40 ring-1 ring-primary/10'
                          : 'border-gray-100 hover:border-primary/30',
                    ].join(' ')}
                  >
                    {/* Card header row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {i === 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600">
                            Best
                          </span>
                        )}
                        {selectedCalcRec?.size === rec.size && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary">
                            Selected
                          </span>
                        )}
                        <p className="text-sm font-semibold text-foreground">{rec.size}</p>
                        {rec.layout && (
                          <p className="text-xs text-muted-foreground">
                            {rec.layout.orientation} · {rec.layout.cols}×{rec.layout.rows}
                          </p>
                        )}
                      </div>
                      {/* Inline stats */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">UPS</p>
                          <p className="text-sm font-bold text-foreground">{rec.ups}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Eff.</p>
                          <p className="text-sm font-bold text-emerald-600">{rec.efficiency}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Waste</p>
                          <p className="text-sm font-bold text-amber-600">{rec.wastePercent}%</p>
                        </div>
                      </div>
                    </div>
                    {/* Dimensions */}
                    <p className="text-xs text-muted-foreground mt-1">{rec.dimensions}{rec.dimensionsInch ? ` · ${rec.dimensionsInch}` : ''}</p>
                  </div>
                ))}
              </div>

              {/* Visualizer */}
              <div className="md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Layout Preview:</p>
                {selectedCalcRec && sheet ? (
                  <PaperLayoutVisualizer
                    sheetWidth={sheet.width}
                    sheetHeight={sheet.height}
                    gridLayout={selectedCalcRec.gridLayout}
                    itemWidth={selectedCalcRec.layout?.itemWidth || 0}
                    itemHeight={selectedCalcRec.layout?.itemHeight || 0}
                    ups={selectedCalcRec.ups}
                    wastePercent={selectedCalcRec.wastePercent}
                  />
                ) : (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center h-full min-h-24 gap-2">
                    <p className="text-xs text-muted-foreground text-center">Select a recommendation to preview</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error / no-result state */}
          {calcResults?.error && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-sm text-amber-700">{calcResults.error}</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground min-w-0">
            {selectedCalcRec ? (
              <>
                Selected:{' '}
                <span className="font-semibold text-foreground">{selectedCalcRec.size}</span>
                {' · '}
                {selectedCalcRec.ups} up{selectedCalcRec.ups !== 1 ? 's' : ''}
                {' · '}
                <span className="text-amber-600 font-semibold">{selectedCalcRec.wastePercent}% waste</span>
                {' · '}
                <span className="text-emerald-600 font-semibold">{selectedCalcRec.efficiency}% eff.</span>
                <span className="block text-xs text-muted-foreground mt-0.5">Applies sheet size, ups &amp; wastage to the estimate</span>
              </>
            ) : (
              <span>Enter a size and click &quot;Find Best Size&quot; to get recommendations</span>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 bg-white text-foreground text-sm font-semibold rounded-md border border-border hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!selectedCalcRec}
              className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-md hover:bg-[hsl(202,60%,38%)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Selected Size
            </button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
