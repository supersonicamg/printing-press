'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getRecommendationsFromDimensions, STANDARD_SIZES, DEFAULT_MARGINS } from '../utils/paperSizeOptimizer';
import PaperLayoutVisualizer from './PaperLayoutVisualizer';

const PRESETS = [
  { label: '1/4 Size', w: 8.5, h: 11,  unit: 'inch' },
  { label: '1/8 Size', w: 5.5, h: 8.5, unit: 'inch' },
];

const STANDARD_PRESS_SHEET = '18x23';

export function PaperSizeCalculatorModal({ open, onClose, onApply, calcMargins = DEFAULT_MARGINS }) {
  const [calcWidth, setCalcWidth]     = useState('');
  const [calcHeight, setCalcHeight]   = useState('');
  const [calcUnit, setCalcUnit]       = useState('inch');
  const [calcResults, setCalcResults] = useState(null);
  const [selectedRec, setSelectedRec] = useState(null);
  const [willCut, setWillCut]         = useState(false);

  const handleClose = () => {
    setCalcResults(null);
    setSelectedRec(null);
    onClose();
  };

  const runCalc = (cut) => {
    const w = parseFloat(calcWidth);
    const h = parseFloat(calcHeight);
    if (!w || !h || w <= 0 || h <= 0) return;
    const result = getRecommendationsFromDimensions(w, h, calcUnit, calcMargins, cut);
    setCalcResults(result);
    setSelectedRec(result.recommendations?.[0] ?? null);
  };

  const handleCalculate = () => runCalc(willCut);

  const handleToggleCut = () => {
    const next = !willCut;
    setWillCut(next);
    if (calcWidth && calcHeight) runCalc(next);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleCalculate(); };

  const handleApply = () => {
    if (!selectedRec) return;
    onApply(selectedRec.size, selectedRec.ups, calcWidth, calcHeight, calcUnit, calcResults, selectedRec);
    handleClose();
  };

  const previewSheet = selectedRec ? STANDARD_SIZES.find(s => s.name === selectedRec.size) : null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="p-0 rounded-2xl border border-border max-w-[min(92vw,880px)] gap-0 overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border">
          <p className="text-[15px] font-semibold tracking-tight text-foreground">Paper Size Calculator</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Enter the finished print size to find the most efficient press sheet.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6 overflow-y-auto max-h-[72vh]">

          {/* Press feeding method */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
              Press feeding method
            </p>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => { if (willCut) handleToggleCut(); }}
                className={[
                  'flex-1 px-4 py-2.5 text-sm font-medium text-center transition-colors duration-150',
                  !willCut
                    ? 'bg-primary text-white'
                    : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50',
                ].join(' ')}
              >
                Direct — Full Sheet
              </button>
              <div className="w-px bg-border shrink-0" />
              <button
                type="button"
                onClick={() => { if (!willCut) handleToggleCut(); }}
                className={[
                  'flex-1 px-4 py-2.5 text-sm font-medium text-center transition-colors duration-150',
                  willCut
                    ? 'bg-primary text-white'
                    : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50',
                ].join(' ')}
              >
                Buy &amp; Cut in Half
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {willCut
                ? 'Buy a larger parent sheet (23×36 or 25×36) and cut it in half before printing. Lower cost per kg when the finished size fits a half sheet.'
                : 'Print directly on the full press sheet (e.g. 25×36). Best for multi-up jobs where you print many copies then cut.'}
            </p>
          </div>

          {/* Finished print size */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
              Finished print size
            </p>

            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => { setCalcWidth(String(p.w)); setCalcHeight(String(p.h)); setCalcUnit(p.unit); }}
                  className="px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-background hover:bg-muted/50 transition-colors duration-150"
                >
                  {p.label}
                  <span className="ml-1.5 text-muted-foreground font-normal">
                    {p.w}×{p.h} {p.unit}
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">Width</label>
                <input
                  type="number" value={calcWidth}
                  onChange={(e) => setCalcWidth(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={calcUnit === 'inch' ? '8.5' : calcUnit === 'cm' ? '21' : '210'}
                  min="0" step="0.1"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-150"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">Height</label>
                <input
                  type="number" value={calcHeight}
                  onChange={(e) => setCalcHeight(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={calcUnit === 'inch' ? '11' : calcUnit === 'cm' ? '29.7' : '297'}
                  min="0" step="0.1"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-150"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">Unit</label>
                <Select value={calcUnit} onValueChange={setCalcUnit}>
                  <SelectTrigger className="w-full rounded-lg border-border focus:ring-2 focus:ring-primary/30">
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
                <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground opacity-0 select-none" aria-hidden="true">—</label>
                <button
                  type="button" onClick={handleCalculate}
                  className="w-full px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-150"
                >
                  Find Best Size
                </button>
              </div>
            </div>
          </div>

          {/* Resolved print size */}
          {calcResults?.customerSize && !calcResults.error && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm py-2 border-t border-border">
              <span className="text-muted-foreground text-xs">Resolved size:</span>
              <span className="font-semibold text-foreground tabular-nums text-xs">
                {calcResults.customerSize.width} × {calcResults.customerSize.height} mm
              </span>
              <span className="text-muted-foreground text-xs opacity-70">({calcResults.customerSize.inInches})</span>
            </div>
          )}

          {/* Results */}
          {calcResults?.recommendations && (
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
                {willCut ? 'Best parent sheets to buy and cut' : 'Best matching press sheets'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

                <div className="md:col-span-3 space-y-2">
                  {calcResults.recommendations.map((rec, i) => (
                    <RecCard
                      key={rec.size}
                      rec={rec}
                      index={i}
                      isSelected={selectedRec?.size === rec.size}
                      willCut={willCut}
                      onClick={() => setSelectedRec(rec)}
                    />
                  ))}
                </div>

                <div className="md:col-span-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-2">Layout Preview</p>
                  {selectedRec && previewSheet ? (
                    <PaperLayoutVisualizer
                      sheetWidth={previewSheet.width}
                      sheetHeight={previewSheet.height}
                      gridLayout={selectedRec.gridLayout}
                      itemWidth={selectedRec.layout?.itemWidth || 0}
                      itemHeight={selectedRec.layout?.itemHeight || 0}
                      ups={selectedRec.ups}
                      wastePercent={selectedRec.wastePercent}
                    />
                  ) : (
                    <div className="border border-dashed border-border rounded-xl flex items-center justify-center min-h-32 bg-muted/20">
                      <p className="text-xs text-muted-foreground text-center px-4">
                        Select a size to preview layout
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {calcResults?.error && (
            <div className="border border-amber-200 rounded-xl px-4 py-3 bg-amber-50/60">
              <p className="text-sm text-amber-700">{calcResults.error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            {selectedRec ? (
              <>
                <p className="text-sm font-medium text-foreground leading-snug tabular-nums">
                  {selectedRec.isCut
                    ? <>{selectedRec.parentSheet} <span className="text-muted-foreground font-normal">→ cut →</span> {selectedRec.cuts}× {selectedRec.size}</>
                    : selectedRec.size
                  }
                  <span className="text-muted-foreground mx-1.5">·</span>
                  <span className="font-semibold">{selectedRec.ups} ups</span>
                  {selectedRec.isCut && (
                    <><span className="text-muted-foreground mx-1.5">·</span><span>{selectedRec.effectiveUps} total/sheet</span></>
                  )}
                  <span className="text-muted-foreground mx-1.5">·</span>
                  <span className="text-emerald-600">{selectedRec.efficiency}% eff.</span>
                  <span className="text-muted-foreground mx-1.5">·</span>
                  <span className="text-amber-600">{selectedRec.wastePercent}% waste</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Applies sheet size, ups and wastage to the estimate</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Enter a size above and click &quot;Find Best Size&quot;</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button" onClick={handleClose}
              className="px-4 py-2 bg-background text-foreground text-sm font-medium rounded-lg border border-border hover:bg-muted/50 transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="button" onClick={handleApply} disabled={!selectedRec}
              className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Apply Selected Size
            </button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Recommendation card                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
function RecCard({ rec, index, isSelected, willCut, onClick }) {
  const base = 'rounded-xl border px-4 py-3.5 cursor-pointer transition-all duration-150';
  const style = isSelected
    ? `${base} border-primary bg-primary/[0.04] ring-1 ring-primary/20`
    : index === 0
      ? `${base} border-emerald-200 bg-emerald-50/30 hover:border-emerald-300`
      : `${base} border-border bg-background hover:border-primary/40 hover:bg-muted/30`;

  return (
    <div className={style} onClick={onClick}>

      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {willCut ? (
            <p className="text-sm font-semibold text-foreground leading-snug">
              {rec.parentSheet}
              <span className="mx-1.5 text-muted-foreground font-normal text-xs">→ cut →</span>
              {rec.cuts}× {rec.size}
            </p>
          ) : (
            <p className="text-sm font-semibold text-foreground">{rec.size}</p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            {rec.dimensions}
            {rec.dimensionsInch && <span className="ml-1 opacity-60">· {rec.dimensionsInch}</span>}
            {!willCut && rec.layout && (
              <span className="ml-1 opacity-60">· {rec.layout.orientation} · {rec.layout.cols}×{rec.layout.rows}</span>
            )}
          </p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end pt-0.5">
          {index === 0 && (
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700">
              Best match
            </span>
          )}
          {rec.size === STANDARD_PRESS_SHEET && (
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
              Your standard
            </span>
          )}
          {isSelected && (
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary">
              Selected
            </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 mt-3 text-xs flex-wrap">
        {willCut ? (
          <>
            <span className="text-muted-foreground">
              Per half: <span className="font-semibold text-foreground tabular-nums">{rec.ups} ups</span>
            </span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground">
              Per sheet: <span className="font-semibold text-foreground tabular-nums">{rec.effectiveUps} ups</span>
            </span>
            <span className="text-border">|</span>
            <span className="font-semibold tabular-nums text-emerald-600">{rec.efficiency}% eff.</span>
            <span className="text-border">|</span>
            <span className="font-semibold tabular-nums text-amber-600">{rec.wastePercent}% waste</span>
          </>
        ) : (
          <>
            <span className="font-semibold text-foreground tabular-nums">{rec.ups} ups</span>
            <span className="text-border">|</span>
            <span className="font-semibold tabular-nums text-emerald-600">{rec.efficiency}% eff.</span>
            <span className="text-border">|</span>
            <span className="font-semibold tabular-nums text-amber-600">{rec.wastePercent}% waste</span>
          </>
        )}
      </div>
    </div>
  );
}
