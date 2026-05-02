'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Plus, Search, Check, FileText,
  Printer, Scissors, IndianRupee, Phone, Mail, RotateCcw, ChevronDown, ChevronUp,
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

/* ─── Primitive: FieldLabel ─── */
const FieldLabel = ({ children, required, hint }) => (
  <div className="flex items-center justify-between mb-1.5">
    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}{required && <span className="text-destructive ml-0.5">*</span>}
    </label>
    {hint && <span className="text-xs text-muted-foreground/70 normal-case">{hint}</span>}
  </div>
);

/* ─── Section Card ─── */
const SectionCard = ({ title, icon: Icon, accent, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
      <div className={cn('w-1.5 h-5 rounded-full shrink-0', accent)} />
      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
      <span className="text-sm font-semibold text-gray-700">{title}</span>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

/* ─── Toggle Switch ─── */
const Toggle = ({ checked, onChange, label, sublabel, activeColor = 'bg-violet-500' }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="min-w-0">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
    </div>
    <button
      type="button" onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        checked ? activeColor : 'bg-gray-200',
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
      <p className="text-sm text-gray-500 truncate">{label}</p>
      {sub && <p className="text-[10px] font-semibold leading-none mt-0.5 text-amber-600">{sub}</p>}
    </div>
    <p className="text-sm font-semibold tabular-nums shrink-0">{value}</p>
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
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
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
                  className="w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-center justify-between transition-colors">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                  </div>
                  {value === c.name && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              ))
            }
          </div>
          <div className="p-2 border-t border-gray-100">
            <button type="button" onClick={() => { setOpen(false); onAddNew(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-primary rounded-md hover:bg-primary/5 transition-colors">
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
  ups: 1, colors: 4,
  plateCostPerPlate: 220, inkRatePerImpression: 0.06,
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
  const [showMore, setShowMore] = useState(false);

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
      const ups = Math.max(1, Number(f.ups) || 1);
      // quantity = sheets of paper (matches Excel QTY column)
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

      // Impressions = sheets × UPS × sides (Excel: IMPR = QTY × UPS × sideMult)
      // e.g. 500 sheets × 2 UPS × 1 side = 1000 impressions
      const sideMult = isBothSide ? 2 : 1;
      const impressions = quantity * ups * sideMult;

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
  const outputPieces = (Number(f.quantity) || 0) * Math.max(1, Number(f.ups) || 1);
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
    const ups = Math.max(1, Number(f.ups) || 1);
    saveEstimate({
      estimateNo,
      model: 'excel-v1',
      jobDetails: {
        customerName: f.customerName, salesPerson: f.salesPerson,
        quantity: qty,
      },
      paperEstimation: {
        paperType: f.paperType, gsm: f.gsm, sheetSize: f.sheetSize,
        ratePerKg: f.ratePerKg, paperSupply: f.paperSupply,
        ups, sheets: calc.totalSheets,
        paperCost: calc.paperCost,
      },
      printingEstimation: {
        printType: f.printType, ups, colors: f.colors,
        impressions: calc.impressions,
      },
      costing: {
        plateCostPerPlate: f.plateCostPerPlate,
        inkRatePerImpression: f.inkRatePerImpression,
        plateCost: calc.plateCost, inkCost: calc.inkCost,
      },
      summary: {
        workType,
        paperCost: calc.paperCost, plateCost: calc.plateCost,
        inkCost: calc.inkCost, productionCost: calc.productionCost,
        profit: profitAmt, billAmount: calc.billAmount,
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
    setShowMore(false);
    setAppliedUps(null);
    setEstimateNo(generateEstimateId ? generateEstimateId() : `EST-${Date.now()}`);
  };

  /* ═══ RENDER ═══ */
  return (
    <div className="min-h-screen bg-slate-50/80 pb-20 xl:pb-6">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button type="button" onClick={() => router.push('/estimates')}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-bold leading-tight">New Estimate</h1>
              <p className="text-xs font-mono font-semibold text-indigo-600 leading-tight">{estimateNo || '...'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={handleReset}
              className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-100">
              <RotateCcw className="w-3 h-3" />Reset
            </button>
            <Button variant="outline" size="sm" onClick={() => router.push('/estimates')}>Cancel</Button>
            <Button size="sm" onClick={handleSave} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Save className="w-3.5 h-3.5" />Save
            </Button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col xl:flex-row gap-5 items-start">

          {/* ═══ Form Column ═══ */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* ── 1. Job Details ── */}
            <SectionCard title="Job Details" icon={FileText} accent="bg-sky-400">
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
                    <FieldLabel>R By (Sales Person)</FieldLabel>
                    <NativeSelect value={f.salesPerson} onChange={v => set('salesPerson', v)} placeholder="Select…">
                      {SALES_PERSONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </NativeSelect>
                  </div>
                </div>

                <div>
                  <FieldLabel required hint="sheets of paper going into the press">Quantity (Sheets)</FieldLabel>
                  <NumInput
                    value={f.quantity}
                    onChange={v => { set('quantity', v); setErrors(e => ({ ...e, quantity: undefined })); }}
                    min={1} placeholder="500"
                    className={errors.quantity ? 'border-destructive' : ''} />
                  {errors.quantity && <p className="text-xs text-destructive mt-1">{errors.quantity}</p>}
                  {calc.totalSheets > 0 && Number(f.ups) > 1 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-semibold text-foreground">{calc.totalSheets.toLocaleString()}</span> sheets
                      {' × '}{f.ups} ups = <span className="font-semibold text-violet-600">{calc.impressions.toLocaleString()} impressions</span>
                    </p>
                  )}
                </div>

              </div>
            </SectionCard>

            {/* ── 2. Paper Setup ── */}
            <SectionCard title="Paper Setup" icon={Scissors} accent="bg-amber-400">
              <div className="space-y-4">

                {/* Supply toggle */}
                <div>
                  <FieldLabel>Paper Supply</FieldLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: 'DP', label: 'DP', sub: 'Our paper' },
                      { val: 'PP', label: 'PP', sub: 'Customer supplies' },
                    ].map(opt => (
                      <button key={opt.val} type="button"
                        onClick={() => set('paperSupply', opt.val)}
                        className={cn(
                          'flex flex-col items-center py-3 px-4 rounded-xl border-2 transition-all',
                          f.paperSupply === opt.val
                            ? 'border-amber-500 bg-amber-50 text-amber-800'
                            : 'border-gray-200 bg-white text-muted-foreground hover:border-gray-300',
                        )}>
                        <span className="text-base font-black">{opt.label}</span>
                        <span className="text-xs font-normal mt-0.5 opacity-70">{opt.sub}</span>
                      </button>
                    ))}
                  </div>
                  {f.paperSupply === 'PP' && (
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                      Paper cost = ₹0.00 — customer is supplying the paper.
                    </p>
                  )}
                </div>

                {/* Paper Type + GSM + Rate */}
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
                      className={f.paperSupply === 'PP' ? 'opacity-50' : ''} />
                  </div>
                </div>

                {/* Sheet Size */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <FieldLabel required>Sheet Size</FieldLabel>
                    <button
                      type="button"
                      onClick={() => setShowCalc(true)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
                      <span>&#9728;</span> Smart Size Finder
                    </button>
                  </div>
                  <NativeSelect value={f.sheetSize} placeholder="Select sheet size…"
                    onChange={v => { set('sheetSize', v); setErrors(e => ({ ...e, sheetSize: undefined })); setAppliedUps(null); }}
                    className={errors.sheetSize ? 'border-destructive' : ''}>
                    {SHEET_SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </NativeSelect>
                  {errors.sheetSize && <p className="text-xs text-destructive mt-1">{errors.sheetSize}</p>}

                  {/* UPS info badge shown after calculator is applied */}
                  {appliedUps !== null && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <p className="text-xs text-emerald-800">
                        Smart Size applied · <span className="font-bold">{appliedUps} up{appliedUps !== 1 ? 's' : ''}</span> per sheet
                        {calc.totalSheets > 0 && <> · <span className="font-bold">{calc.totalSheets.toLocaleString()}</span> sheets to print</>}
                      </p>
                    </div>
                  )}
                </div>


              </div>
            </SectionCard>

            {/* ── 3. Print & Rates ── */}
            <SectionCard title="Print & Rates" icon={Printer} accent="bg-violet-400">
              <div className="space-y-5">

                {/* Print Type */}
                <div>
                  <FieldLabel>Print Type</FieldLabel>
                  <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50/80 p-1 gap-1">
                    {['Single Side', 'Both Side'].map(opt => (
                      <button key={opt} type="button" onClick={() => set('printType', opt)}
                        className={cn(
                          'px-5 py-2 rounded-lg text-sm font-semibold transition-all',
                          f.printType === opt
                            ? 'bg-white shadow-sm text-violet-700 border border-violet-200'
                            : 'text-muted-foreground hover:text-foreground',
                        )}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* UPS selector */}
                <div>
                  <FieldLabel hint="pieces printed per sheet">Up on Sheet (UPS)</FieldLabel>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[1, 2, 4, 6].map(n => (
                      <button key={n} type="button"
                        onClick={() => { set('ups', n); setAppliedUps(null); }}
                        className={cn(
                          'w-12 h-10 rounded-lg text-sm font-bold border-2 transition-all',
                          f.ups === n
                            ? 'border-violet-500 bg-violet-50 text-violet-700'
                            : 'border-gray-200 bg-white text-muted-foreground hover:border-gray-300',
                        )}>
                        {n}
                      </button>
                    ))}
                    {calc.totalSheets > 0 && calc.impressions > calc.totalSheets && (
                      <p className="text-xs text-muted-foreground ml-1">
                        → <span className="font-semibold text-violet-600">{calc.impressions.toLocaleString()} impressions</span>
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Use <button type="button" onClick={() => setShowCalc(true)} className="text-violet-600 font-semibold hover:underline">Smart Size</button> to auto-calculate based on finished piece dimensions.
                  </p>
                </div>

                {/* Colors */}
                <div>
                  <FieldLabel hint="e.g. 4 for CMYK, 1 for black only">No. of Colors</FieldLabel>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 4].map(n => (
                      <button key={n} type="button" onClick={() => set('colors', n)}
                        className={cn(
                          'w-12 h-10 rounded-lg text-sm font-bold border-2 transition-all',
                          f.colors === n
                            ? 'border-violet-500 bg-violet-50 text-violet-700'
                            : 'border-gray-200 bg-white text-muted-foreground hover:border-gray-300',
                        )}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rate Configuration */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Rate Configuration</span>
                    <div className="flex-1 h-px bg-gray-100" />
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

          </div>

          {/* ═══ Summary Panel (sticky) ═══ */}
          <div className="w-full xl:w-80 shrink-0">
            <div className="sticky top-15.25 space-y-3">

              {/* Estimate badge + Work type */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Estimate No.</p>
                    <p className="text-sm font-bold text-indigo-600 font-mono mt-0.5">{estimateNo || '—'}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold">Live</span>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Work Type</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">{workType}</p>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5 space-y-4">

                {/* Sheets + Impressions stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600/70">Sheets</p>
                    <p className="text-xl font-black text-amber-700 tabular-nums mt-0.5 leading-none">
                      {calc.totalSheets > 0 ? calc.totalSheets.toLocaleString() : '—'}
                    </p>
                    {Number(f.ups) > 1 && <p className="text-[9px] text-amber-600 mt-0.5">{f.ups} ups</p>}
                  </div>
                  <div className="rounded-xl bg-violet-50 border border-violet-100 px-3 py-2.5 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-violet-600/70">Impressions</p>
                    <p className="text-xl font-black text-violet-700 tabular-nums mt-0.5 leading-none">
                      {calc.impressions > 0 ? calc.impressions.toLocaleString() : '—'}
                    </p>
                    {f.printType === 'Both Side' && <p className="text-[9px] text-violet-600 mt-0.5">Both Side</p>}
                  </div>
                </div>

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
                  <p className="text-sm font-bold text-foreground">Production Cost</p>
                  <p className="text-base font-bold tabular-nums">{formatCurrency(calc.productionCost)}</p>
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

                {/* Bill Amount hero */}
                <div className="rounded-xl bg-linear-to-br from-indigo-600 to-indigo-700 px-4 py-4 text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-indigo-300 mb-1">Bill Amount</p>
                  <p className="text-3xl font-black text-white tabular-nums leading-none">
                    {formatCurrency(calc.billAmount)}
                  </p>
                </div>

                {/* Per-piece metrics */}
                {(calc.paperCostPerSheet > 0 || perPiece > 0) && (
                  <div className="grid grid-cols-2 gap-2">
                    {calc.paperCostPerSheet > 0 && (
                      <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 text-center">
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">Paper/Sheet</p>
                        <p className="text-sm font-bold tabular-nums mt-0.5">₹{calc.paperCostPerSheet.toFixed(2)}</p>
                      </div>
                    )}
                    {perPiece > 0 && (
                      <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2.5 text-center">
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-indigo-400">Cost/Piece</p>
                        <p className="text-sm font-bold tabular-nums mt-0.5 text-indigo-700">₹{perPiece.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Save CTA */}
              <Button
                onClick={handleSave}
                className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-11"
                size="lg">
                <Save className="w-4 h-4" />Save Estimate
              </Button>

            </div>
          </div>

        </div>
      </div>

      {/* ── Mobile sticky footer ── */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs text-gray-400 font-medium">Bill Amount</p>
            <p className="text-xl font-black text-indigo-600 tabular-nums leading-tight">{formatCurrency(calc.billAmount)}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-gray-400">Sheets</p>
              <p className="text-sm font-bold text-amber-600">{calc.totalSheets > 0 ? calc.totalSheets.toLocaleString() : '—'}</p>
            </div>
            <Button onClick={handleSave} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
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
          set('ups', ups);
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
