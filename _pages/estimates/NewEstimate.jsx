'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Plus, Search, Check, FileText,
  Printer, Scissors, IndianRupee, Phone, Mail, RotateCcw, ChevronDown,
} from 'lucide-react';
import { useEstimate } from '../../context/EstimateContext';
import { useMasterData } from '../../context/MasterDataContext';
import { STANDARD_SIZES, DEFAULT_MARGINS } from '../../utils/paperSizeOptimizer';
import { formatCurrency } from '../../utils/calculations';
import { PaperSizeCalculatorModal } from '../../components/PaperSizeCalculatorModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/* ─── Primitive: NumInput ─── */
const NumInput = ({ value, onChange, min = 0, step = 1, placeholder, className, ...rest }) => (
  <input
    type="number" min={min} step={step} value={value ?? ''}
    placeholder={placeholder}
    onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
    className={cn(
      'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm',
      'ring-offset-background placeholder:text-muted-foreground',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none',
      '[&::-webkit-inner-spin-button]:appearance-none',
      className,
    )}
    {...rest}
  />
);

/* ─── Primitive: NativeSelect ─── */
const NativeSelect = ({ value, onChange, children, className, placeholder }) => (
  <select
    value={value ?? ''}
    onChange={e => onChange(e.target.value)}
    className={cn(
      'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm',
      'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      !value && 'text-muted-foreground',
      className,
    )}
  >
    {placeholder && <option value="" disabled>{placeholder}</option>}
    {children}
  </select>
);

/* ─── FieldLabel ─── */
const FieldLabel = ({ children, required, hint }) => (
  <div className="flex items-center justify-between mb-1.5">
    <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
      {children}{required && <span className="text-destructive ml-0.5">*</span>}
    </label>
    {hint && <span className="text-[11px] text-muted-foreground/60 normal-case">{hint}</span>}
  </div>
);

/* ─── Section Card ─── */
const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-background rounded-xl border border-border overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm font-semibold text-foreground">{title}</span>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

/* ─── Segmented Control ─── */
const SegmentedControl = ({ options, value, onChange, className }) => (
  <div className={cn('flex rounded-lg border border-border overflow-hidden', className)}>
    {options.map((opt, i) => {
      const val = typeof opt === 'object' ? opt.value : opt;
      const label = typeof opt === 'object' ? opt.label : opt;
      return (
        <React.Fragment key={val}>
          {i > 0 && <div className="w-px bg-border shrink-0" />}
          <button
            type="button"
            onClick={() => onChange(val)}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium text-center transition-colors duration-150',
              val === value
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50',
            )}
          >
            {label}
          </button>
        </React.Fragment>
      );
    })}
  </div>
);

/* ─── Toggle Switch ─── */
const Toggle = ({ checked, onChange, label, sublabel }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="min-w-0">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
    </div>
    <button
      type="button" onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        checked ? 'bg-primary' : 'bg-muted',
      )}
    >
      <span className={cn(
        'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
        checked ? 'translate-x-5' : 'translate-x-0',
      )} />
    </button>
  </div>
);

/* ─── Summary cost row ─── */
const CostRow = ({ label, value, sub }) => (
  <div className="flex items-center justify-between gap-2">
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground truncate">{label}</p>
      {sub && <p className="text-[10px] font-semibold leading-none mt-0.5 text-amber-600">{sub}</p>}
    </div>
    <p className="text-sm font-medium tabular-nums shrink-0">{value}</p>
  </div>
);

/* ─── Customer Combobox ─── */
const CustomerCombobox = ({ value, onChange, customers, onAddNew }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const filtered = customers.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div ref={ref} className="relative">
      <button
        type="button" onClick={() => setOpen(o => !o)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          !value && 'text-muted-foreground',
        )}
      >
        <span className="truncate">{value || 'Search or select customer…'}</span>
        <ChevronDown className="w-4 h-4 opacity-40 shrink-0 ml-2" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-background shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <input autoFocus placeholder="Search customers…" value={q} onChange={e => setQ(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0
              ? <p className="py-5 text-center text-sm text-muted-foreground">No customers found</p>
              : filtered.map(c => (
                <button key={c.id} type="button"
                  onClick={() => { onChange(c.name); setOpen(false); setQ(''); }}
                  className="w-full text-left px-3 py-2.5 hover:bg-muted/50 flex items-center justify-between transition-colors duration-150">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                  </div>
                  {value === c.name && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              ))
            }
          </div>
          <div className="p-2 border-t border-border">
            <button type="button" onClick={() => { setOpen(false); onAddNew(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary rounded-md hover:bg-primary/5 transition-colors duration-150">
              <Plus className="w-3.5 h-3.5" />Add new customer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Sheet size options ─── */
const SHEET_SIZE_OPTIONS = STANDARD_SIZES.map(s => ({
  value: s.name,
  label: `${s.name}  (${s.width} × ${s.height} mm)`,
  width: s.width,
  height: s.height,
}));

/* ─── Form defaults ─── */
const DEFAULTS = {
  customerName: '', salesPerson: '', quantity: 500,
  paperType: '', gsm: 100, ratePerKg: 78, sheetSize: '25x36',
  paperSupply: 'DP',
  printType: 'Single Side',
  cut: false, colors: 4,
  plateCostPerPlate: 220, inkRatePerImpression: 0.06,
  recPayment: 0, paymentMode: 'ONLINE', receivedBy: '',
};

const SALES_PERSONS = ['Rahul Verma', 'Anita Desai', 'Kiran Rao', 'Suresh Menon', 'Sajid', 'Ismail', 'Self'];

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const NewEstimate = () => {
  const router = useRouter();
  const { saveEstimate, generateEstimateId } = useEstimate();
  const { paperTypes, gsmOptions, addGsmOption, addPaperType } = useMasterData();

  const [estimateNo, setEstimateNo] = useState('');
  useEffect(() => {
    setEstimateNo(generateEstimateId ? generateEstimateId() : `EST-${Date.now()}`);
  }, []);

  /* ── Customers ── */
  const [customers, setCustomers] = useState(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('printmaster_customers');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, name: 'AR Printers', phone: '+91 98765 43210' },
      { id: 2, name: 'Colorpix', phone: '+91 87654 32109' },
      { id: 3, name: 'Sudarshan Press', phone: '+91 76543 21098' },
    ];
  });
  useEffect(() => { localStorage.setItem('printmaster_customers', JSON.stringify(customers)); }, [customers]);

  /* ── Form state ── */
  const [f, setF] = useState(DEFAULTS);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  /* ── Profit (fixed ₹) ── */
  const [profit, setProfit] = useState(0);

  /* ── Computed values ── */
  const [calc, setCalc] = useState({
    impressions: 0, paperCost: 0, plateCost: 0, inkCost: 0,
    productionCost: 0, billAmount: 0, paperCostPerSheet: 0,
    totalSheets: 0,
  });

  /* ── Recalculate (debounced 200ms) ── */
  useEffect(() => {
    const t = setTimeout(() => {
      const quantity = Number(f.quantity) || 0;
      // quantity = sheets of paper entering the press (matches Excel QTY column)
      const totalSheets = quantity;
      const gsm = Number(f.gsm) || 0;
      const ratePerKg = Number(f.ratePerKg) || 0;
      const isBothSide = f.printType === 'Both Side';
      const colors = Number(f.colors) || 0;
      const plateCostPerPlate = Number(f.plateCostPerPlate) || 0;
      const inkRate = Number(f.inkRatePerImpression) || 0;

      // Sheet size dimensions
      const sz = SHEET_SIZE_OPTIONS.find(s => s.value === f.sheetSize);
      const wMm = sz?.width || 0;
      const hMm = sz?.height || 0;

      // Impressions = sheets × cutFactor × sideFactor
      // cut=yes → 23×36 sheet cut in half → each sheet yields 2 pieces → cutFactor=2
      // BNB (both side) → each piece printed front+back → sideFactor=2
      // e.g. qty=500, cut=yes, SS → impressions = 500 × 2 × 1 = 1000
      // e.g. qty=750, cut=yes, BNB → impressions = 750 × 2 × 2 = 3000
      const cutFactor = f.cut ? 2 : 1;
      const sideMult = isBothSide ? 2 : 1;
      const impressions = quantity * cutFactor * sideMult;

      // Paper cost — weight/sheet (kg) = (w × h / 1,000,000) × gsm / 1000
      const weightPerSheetKg = (wMm * hMm / 1e6) * gsm / 1000;
      const paperCost = f.paperSupply === 'PP'
        ? 0
        : Math.round(weightPerSheetKg * totalSheets * ratePerKg * 100) / 100;

      // Plate & ink costs
      const plateCost = Math.round(colors * plateCostPerPlate * 100) / 100;
      const inkCost = Math.round(impressions * inkRate * 100) / 100;

      // Production & bill
      const productionCost = Math.round((paperCost + plateCost + inkCost) * 100) / 100;
      const billAmount = Math.round((productionCost + (Number(profit) || 0)) * 100) / 100;
      const paperCostPerSheet = totalSheets > 0 ? Math.round((paperCost / totalSheets) * 10000) / 10000 : 0;

      setCalc({ impressions, paperCost, plateCost, inkCost, productionCost, billAmount, paperCostPerSheet, totalSheets });
    }, 200);
    return () => clearTimeout(t);
  }, [f, profit]);

  /* ── Smart Size Finder ── */
  const [showCalc, setShowCalc] = useState(false);
  const [calcMargins] = useState({ ...DEFAULT_MARGINS });
  const [appliedUps, setAppliedUps] = useState(null); // informational badge only

  const handleCalcApply = (sizeName, ups) => {
    set('sheetSize', sizeName);
    setAppliedUps(ups);
    setErrors(e => ({ ...e, sheetSize: undefined }));
  };

  /* ── Errors ── */
  const [errors, setErrors] = useState({});

  /* ── Dialogs ── */
  const [dlg, setDlg] = useState({ customer: false, paper: false, gsm: false });
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
  const [newPaperName, setNewPaperName] = useState('');
  const [newPaperRate, setNewPaperRate] = useState(80);
  const [newGsm, setNewGsm] = useState('');

  /* ── Work type (auto-derived) ── */
  const workType = f.paperSupply === 'DP' ? 'PAPER + PRINT + CUT' : 'PRINT + CUT';

  /* ── Per piece cost ── */
  const outputPieces = (Number(f.quantity) || 0) * (f.cut ? 2 : 1);
  const perPiece = outputPieces > 0 && calc.billAmount > 0
    ? Math.round((calc.billAmount / outputPieces) * 100) / 100
    : 0;

  /* ── Validate & Save ── */
  const validate = () => {
    const e = {};
    if (!f.customerName) e.customerName = 'Required';
    if (!f.quantity || Number(f.quantity) <= 0) e.quantity = 'Required';
    if (!f.paperType) e.paperType = 'Required';
    if (!f.sheetSize) e.sheetSize = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const profitAmt = Number(profit) || 0;
    const qty = Number(f.quantity) || 0;
    const isBothSide = f.printType === 'Both Side';
    const recPaymentAmt = Number(f.recPayment) || 0;
    const balPayment = Math.round((calc.billAmount - recPaymentAmt) * 100) / 100;
    saveEstimate({
      estimateNo,
      model: 'excel-v1',
      jobDetails: {
        customerName: f.customerName, salesPerson: f.salesPerson,
        quantity: qty,
        type: isBothSide ? 'BNB' : 'SS',
        cut: f.cut,
      },
      paperEstimation: {
        paperType: f.paperType, gsm: f.gsm, sheetSize: f.sheetSize,
        ratePerKg: f.ratePerKg, paperSupply: f.paperSupply,
        sheets: calc.totalSheets,
        paperCost: calc.paperCost,
        paperCostPerSheet: calc.paperCostPerSheet,
      },
      printingEstimation: {
        printType: f.printType, colors: f.colors,
        cut: f.cut,
        impressions: calc.impressions,
      },
      costing: {
        plateCostPerPlate: f.plateCostPerPlate,
        inkRatePerImpression: f.inkRatePerImpression,
        plateCost: calc.plateCost, inkCost: calc.inkCost,
      },
      payment: {
        recPayment: recPaymentAmt,
        balPayment,
        paymentMode: recPaymentAmt > 0 ? f.paymentMode : null,
        receivedBy: recPaymentAmt > 0 ? f.receivedBy : null,
      },
      summary: {
        workType,
        paperCost: calc.paperCost, plateCost: calc.plateCost,
        inkCost: calc.inkCost, productionCost: calc.productionCost,
        profit: profitAmt, billAmount: calc.billAmount,
        recPayment: recPaymentAmt, balPayment,
        paperCostPerSheet: calc.paperCostPerSheet,
        // Legacy compatibility so EstimateList still renders correctly
        printingCost: calc.plateCost + calc.inkCost,
        processCost: 0,
        totalCost: calc.productionCost,
        profitPercent: calc.productionCost > 0 ? Math.round((profitAmt / calc.productionCost) * 100) : 0,
        profitAmount: profitAmt,
        sellingPrice: calc.billAmount,
        costPerUnit: qty > 0 ? Math.round((calc.billAmount / qty) * 100) / 100 : 0,
      },
    });
    router.push('/estimates');
  };

  const handleReset = () => {
    setF(DEFAULTS);
    setProfit(0);
    setErrors({});
    setAppliedUps(null);
    setEstimateNo(generateEstimateId ? generateEstimateId() : `EST-${Date.now()}`);
  };

  /* ═══ RENDER ═══ */
  return (
    <div className="min-h-screen bg-muted/20 pb-20 xl:pb-6">

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button type="button" onClick={() => router.push('/estimates')}
              className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-foreground leading-tight">New Estimate</h1>
              <p className="text-xs font-mono text-primary leading-tight">{estimateNo || '...'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={handleReset}
              className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted/50">
              <RotateCcw className="w-3 h-3" />Reset
            </button>
            <Button variant="outline" size="sm" onClick={() => router.push('/estimates')}>Cancel</Button>
            <Button size="sm" onClick={handleSave} className="gap-1.5">
              <Save className="w-3.5 h-3.5" />Save
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col xl:flex-row gap-5 items-start">

          {/* Form Column */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* 1. Job Details */}
            <SectionCard title="Job Details" icon={FileText}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Customer</FieldLabel>
                    <CustomerCombobox
                      value={f.customerName}
                      onChange={v => { set('customerName', v); setErrors(e => ({ ...e, customerName: undefined })); }}
                      customers={customers}
                      onAddNew={() => setDlg(d => ({ ...d, customer: true }))}
                    />
                    {errors.customerName && <p className="text-xs text-destructive mt-1">{errors.customerName}</p>}
                  </div>
                  <div>
                    <FieldLabel>Sales Person</FieldLabel>
                    <NativeSelect value={f.salesPerson} onChange={v => set('salesPerson', v)} placeholder="Select…">
                      {SALES_PERSONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </NativeSelect>
                  </div>
                </div>

                <div>
                  <FieldLabel required hint="sheets entering the press">Quantity</FieldLabel>
                  <NumInput
                    value={f.quantity}
                    onChange={v => { set('quantity', v); setErrors(e => ({ ...e, quantity: undefined })); }}
                    min={1} placeholder="500"
                    className={errors.quantity ? 'border-destructive' : ''} />
                  {errors.quantity && <p className="text-xs text-destructive mt-1">{errors.quantity}</p>}
                  {calc.totalSheets > 0 && f.cut && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {calc.totalSheets.toLocaleString()} sheets cut in half
                      <span className="mx-1.5 text-border">·</span>
                      <span className="font-medium text-foreground">{calc.impressions.toLocaleString()} impressions</span>
                    </p>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* 2. Paper Setup */}
            <SectionCard title="Paper Setup" icon={Scissors}>
              <div className="space-y-4">

                <div>
                  <FieldLabel>Paper Supply</FieldLabel>
                  <SegmentedControl
                    options={[
                      { value: 'DP', label: 'DP — Our paper' },
                      { value: 'PP', label: 'PP — Customer supplies' },
                    ]}
                    value={f.paperSupply}
                    onChange={v => set('paperSupply', v)}
                  />
                  {f.paperSupply === 'PP' && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Paper cost will be ₹0.00 — customer is supplying the paper.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <FieldLabel required>Paper Type</FieldLabel>
                    <div className="flex gap-2">
                      <NativeSelect value={f.paperType} placeholder="Select paper…"
                        onChange={v => {
                          const p = paperTypes.find(x => x.name === v);
                          setF(prev => ({ ...prev, paperType: v, ratePerKg: p?.ratePerKg ?? prev.ratePerKg }));
                          setErrors(e => ({ ...e, paperType: undefined }));
                        }}
                        className={cn('flex-1', errors.paperType ? 'border-destructive' : '')}>
                        {paperTypes.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                      </NativeSelect>
                      <Button type="button" variant="outline" size="icon"
                        onClick={() => setDlg(d => ({ ...d, paper: true }))}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {errors.paperType && <p className="text-xs text-destructive mt-1">{errors.paperType}</p>}
                  </div>

                  <div>
                    <FieldLabel>GSM</FieldLabel>
                    <div className="flex gap-1.5">
                      <NativeSelect value={f.gsm} onChange={v => set('gsm', Number(v))} className="flex-1">
                        {gsmOptions.map(g => <option key={g} value={g}>{g}</option>)}
                      </NativeSelect>
                      <Button type="button" variant="outline" size="icon"
                        onClick={() => setDlg(d => ({ ...d, gsm: true }))}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <FieldLabel hint="₹/kg">Rate / Kg</FieldLabel>
                    <NumInput value={f.ratePerKg} onChange={v => set('ratePerKg', v)} min={0} step={0.5}
                      className={f.paperSupply === 'PP' ? 'opacity-40' : ''} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <FieldLabel required>Sheet Size</FieldLabel>
                    <button
                      type="button"
                      onClick={() => setShowCalc(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary border border-primary/30 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors duration-150">
                      Smart Size Finder
                    </button>
                  </div>
                  <NativeSelect value={f.sheetSize} placeholder="Select sheet size…"
                    onChange={v => { set('sheetSize', v); setErrors(e => ({ ...e, sheetSize: undefined })); setAppliedUps(null); }}
                    className={errors.sheetSize ? 'border-destructive' : ''}>
                    {SHEET_SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </NativeSelect>
                  {errors.sheetSize && <p className="text-xs text-destructive mt-1">{errors.sheetSize}</p>}
                  {appliedUps !== null && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      <p className="text-xs text-foreground">
                        Smart Size applied — <span className="font-semibold">{appliedUps} up{appliedUps !== 1 ? 's' : ''}</span> per sheet
                        {calc.totalSheets > 0 && <> · {calc.totalSheets.toLocaleString()} sheets</>}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </SectionCard>

            {/* 3. Print & Rates */}
            <SectionCard title="Print & Rates" icon={Printer}>
              <div className="space-y-5">

                <div>
                  <FieldLabel>Print Type</FieldLabel>
                  <SegmentedControl
                    options={['Single Side', 'Both Side']}
                    value={f.printType}
                    onChange={v => set('printType', v)}
                    className="max-w-xs"
                  />
                </div>

                <div>
                  <FieldLabel hint="sheet cut in half → pieces × 2">Cut Sheet</FieldLabel>
                  <Toggle
                    checked={f.cut}
                    onChange={v => set('cut', v)}
                    label="Cut in half"
                    sublabel={f.cut ? 'Each sheet yields 2 pieces — impressions doubled' : 'No cut — 1 sheet = 1 piece'}
                  />
                </div>

                <div>
                  <FieldLabel hint="e.g. 4 for CMYK">Colors</FieldLabel>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 4].map(n => (
                      <button key={n} type="button" onClick={() => set('colors', n)}
                        className={cn(
                          'w-12 h-10 rounded-lg text-sm font-semibold border transition-colors duration-150',
                          f.colors === n
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/40',
                        )}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Rate Configuration</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel hint={`${f.colors} color${f.colors !== 1 ? 's' : ''} × rate`}>
                        Plate Cost / Plate (₹)
                      </FieldLabel>
                      <NumInput value={f.plateCostPerPlate} onChange={v => set('plateCostPerPlate', v)} min={0} />
                    </div>
                    <div>
                      <FieldLabel hint="₹/impression">Ink Rate (₹)</FieldLabel>
                      <NumInput value={f.inkRatePerImpression} onChange={v => set('inkRatePerImpression', v)}
                        min={0} step={0.01} />
                    </div>
                  </div>
                </div>

              </div>
            </SectionCard>

            {/* 4. Payment Details */}
            <SectionCard title="Payment Details" icon={IndianRupee}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel hint="₹ received so far">Received Payment</FieldLabel>
                    <NumInput value={f.recPayment} onChange={v => set('recPayment', v)} min={0} placeholder="0" />
                  </div>
                  <div>
                    <FieldLabel>Received By</FieldLabel>
                    <NativeSelect value={f.receivedBy} onChange={v => set('receivedBy', v)} placeholder="Select…">
                      {SALES_PERSONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </NativeSelect>
                  </div>
                </div>

                <div>
                  <FieldLabel>Payment Mode</FieldLabel>
                  <SegmentedControl
                    options={['ONLINE', 'CASH', 'CHEQUE']}
                    value={f.paymentMode}
                    onChange={v => set('paymentMode', v)}
                    className="max-w-xs"
                  />
                </div>
              </div>
            </SectionCard>

          </div>

          {/* Summary Panel (sticky) */}
          <div className="w-full xl:w-80 shrink-0">
            <div className="sticky top-14 space-y-3">

              {/* Estimate meta */}
              <div className="bg-background rounded-xl border border-border px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Estimate</p>
                    <p className="text-sm font-semibold font-mono text-primary mt-0.5">{estimateNo || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Work Type</p>
                    <p className="text-xs font-medium text-foreground mt-0.5">{workType}</p>
                  </div>
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="bg-background rounded-xl border border-border px-5 py-5 space-y-4">

                {/* Sheets + Impressions */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-0.5">Sheets</p>
                    <p className="text-2xl font-bold tabular-nums text-foreground leading-none">
                      {calc.totalSheets > 0 ? calc.totalSheets.toLocaleString() : '—'}
                    </p>
                    {f.cut && <p className="text-[11px] text-muted-foreground mt-1">cut in half</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-0.5">Impressions</p>
                    <p className="text-2xl font-bold tabular-nums text-foreground leading-none">
                      {calc.impressions > 0 ? calc.impressions.toLocaleString() : '—'}
                    </p>
                    {f.printType === 'Both Side' && <p className="text-[11px] text-muted-foreground mt-1">both sides</p>}
                  </div>
                </div>

                <Separator />

                {/* Cost rows */}
                <div className="space-y-2.5">
                  <CostRow
                    label="Paper"
                    value={f.paperSupply === 'PP' ? '₹0.00' : formatCurrency(calc.paperCost)}
                    sub={f.paperSupply === 'PP' ? 'Customer supplied' : null}
                  />
                  <CostRow label={`Plates (${f.colors} colors)`} value={formatCurrency(calc.plateCost)} />
                  <CostRow label="Ink" value={formatCurrency(calc.inkCost)} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Production Cost</p>
                  <p className="text-sm font-semibold tabular-nums">{formatCurrency(calc.productionCost)}</p>
                </div>

                <Separator />

                {/* Profit input */}
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground shrink-0">Profit (₹)</p>
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">₹</span>
                    <NumInput
                      value={profit} onChange={v => setProfit(v === '' ? 0 : Number(v))}
                      min={0} placeholder="0"
                      className="h-8 pl-6 text-right text-sm" />
                  </div>
                </div>

                {/* Bill Amount */}
                <div className="rounded-xl bg-primary px-4 py-4 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/70 mb-1">Bill Amount</p>
                  <p className="text-3xl font-bold text-primary-foreground tabular-nums leading-none">
                    {formatCurrency(calc.billAmount)}
                  </p>
                </div>

                {/* Received / Balance */}
                {(Number(f.recPayment) || 0) > 0 && (
                  <div className="space-y-1.5 rounded-lg bg-muted/30 border border-border px-3 py-2.5">
                    <CostRow label="Received" value={formatCurrency(Number(f.recPayment) || 0)} />
                    <CostRow
                      label="Balance Due"
                      value={formatCurrency(Math.max(0, Math.round((calc.billAmount - (Number(f.recPayment) || 0)) * 100) / 100))}
                    />
                  </div>
                )}

                {/* Per-piece metrics */}
                {(calc.paperCostPerSheet > 0 || perPiece > 0) && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    {calc.paperCostPerSheet > 0 && (
                      <div>
                        <p className="text-muted-foreground">Paper / sheet</p>
                        <p className="font-semibold tabular-nums mt-0.5">₹{calc.paperCostPerSheet.toFixed(2)}</p>
                      </div>
                    )}
                    {perPiece > 0 && (
                      <div className="text-right">
                        <p className="text-muted-foreground">Cost / piece</p>
                        <p className="font-semibold tabular-nums mt-0.5">₹{perPiece.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Save CTA */}
              <Button
                onClick={handleSave}
                className="w-full gap-2 h-11"
                size="lg">
                <Save className="w-4 h-4" />Save Estimate
              </Button>

            </div>
          </div>

        </div>
      </div>

      {/* Mobile sticky footer */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Bill Amount</p>
            <p className="text-xl font-bold text-primary tabular-nums leading-tight">{formatCurrency(calc.billAmount)}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Sheets</p>
              <p className="text-sm font-semibold tabular-nums">{calc.totalSheets > 0 ? calc.totalSheets.toLocaleString() : '—'}</p>
            </div>
            <Button onClick={handleSave} className="gap-1.5">
              <Save className="w-3.5 h-3.5" />Save
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ Smart Size Calculator ═══ */}
      <PaperSizeCalculatorModal
        open={showCalc}
        onClose={() => setShowCalc(false)}
        onApply={(sizeName, ups) => {
          set('sheetSize', sizeName);
          setAppliedUps(ups);
          setErrors(e => ({ ...e, sheetSize: undefined }));
        }}
        calcMargins={calcMargins}
      />
      <Dialog open={dlg.customer} onOpenChange={o => setDlg(d => ({ ...d, customer: o }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add New Customer</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <FieldLabel required>Customer Name</FieldLabel>
              <Input placeholder="Company or person name" value={newCustomer.name}
                onChange={e => setNewCustomer(c => ({ ...c, name: e.target.value }))} />
            </div>
            <div>
              <FieldLabel>Mobile Number</FieldLabel>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input className="pl-9" placeholder="+91 98765 43210" value={newCustomer.phone}
                  onChange={e => setNewCustomer(c => ({ ...c, phone: e.target.value }))} />
              </div>
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input className="pl-9" placeholder="customer@email.com" value={newCustomer.email}
                  onChange={e => setNewCustomer(c => ({ ...c, email: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDlg(d => ({ ...d, customer: false }))}>Cancel</Button>
            <Button disabled={!newCustomer.name.trim()} onClick={() => {
              const nc = { id: Date.now(), ...newCustomer };
              setCustomers(l => [nc, ...l]);
              set('customerName', nc.name);
              setNewCustomer({ name: '', phone: '', email: '' });
              setDlg(d => ({ ...d, customer: false }));
            }}>Add Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Add Paper Type Dialog ═══ */}
      <Dialog open={dlg.paper} onOpenChange={o => setDlg(d => ({ ...d, paper: o }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Paper Type</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <FieldLabel required>Paper Name</FieldLabel>
              <Input placeholder="e.g. Glossy Art Paper" value={newPaperName}
                onChange={e => setNewPaperName(e.target.value)} />
            </div>
            <div>
              <FieldLabel required>Rate / Kg (₹)</FieldLabel>
              <NumInput value={newPaperRate} onChange={setNewPaperRate} min={0} placeholder="80" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDlg(d => ({ ...d, paper: false }))}>Cancel</Button>
            <Button disabled={!newPaperName.trim()} onClick={() => {
              addPaperType({ name: newPaperName.trim(), ratePerKg: newPaperRate, gsmRange: '60-300', stock: 'Available' });
              setF(prev => ({ ...prev, paperType: newPaperName.trim(), ratePerKg: newPaperRate }));
              setNewPaperName('');
              setNewPaperRate(80);
              setDlg(d => ({ ...d, paper: false }));
            }}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Add GSM Dialog ═══ */}
      <Dialog open={dlg.gsm} onOpenChange={o => setDlg(d => ({ ...d, gsm: o }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add GSM Option</DialogTitle></DialogHeader>
          <div className="py-2">
            <FieldLabel required>GSM Value</FieldLabel>
            <NumInput value={newGsm} onChange={setNewGsm} min={1} placeholder="e.g. 120" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDlg(d => ({ ...d, gsm: false }))}>Cancel</Button>
            <Button disabled={!newGsm || isNaN(parseInt(newGsm))} onClick={() => {
              const g = parseInt(newGsm);
              addGsmOption(g);
              set('gsm', g);
              setNewGsm('');
              setDlg(d => ({ ...d, gsm: false }));
            }}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default NewEstimate;
