'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Plus, Search, ChevronDown, ChevronUp,
  Phone, Mail, Check, FileText, Layers, Printer, Scissors,
  Sparkles, RotateCcw, TrendingUp
} from 'lucide-react';
import { useEstimate } from '../../context/EstimateContext';
import { useMasterData } from '../../context/MasterDataContext';
import { formatCurrency } from '../../utils/calculations';
import { STANDARD_SIZES, DEFAULT_MARGINS } from '../../utils/paperSizeOptimizer';
import { PaperSizeCalculatorModal } from '../../components/PaperSizeCalculatorModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/* ─── NumInput: styled number input ─── */
const NumInput = ({ value, onChange, min = 0, step = 1, placeholder, className, ...props }) => (
  <input
    type="number" min={min} step={step} value={value ?? ''}
    placeholder={placeholder}
    onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
    className={cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
      'ring-offset-background placeholder:text-muted-foreground',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
      className,
    )}
    {...props}
  />
);

/* ─── NativeSelect: styled native select ─── */
const NativeSelect = ({ value, onChange, children, className, placeholder }) => (
  <select
    value={value ?? ''}
    onChange={e => onChange(e.target.value)}
    className={cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
      'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
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
    <label className="text-sm font-semibold text-foreground">
      {children}{required && <span className="text-destructive ml-0.5">*</span>}
    </label>
    {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
  </div>
);

/* ─── SectionCard: numbered collapsible card ─── */
const SectionCard = ({ number, label, icon: Icon, color, open, onToggle, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
    <button
      type="button" onClick={onToggle}
      className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/70 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none mb-0.5">{number}</p>
          <p className="text-base font-bold text-foreground">{label}</p>
        </div>
      </div>
      {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
    </button>
    {open && (
      <div className="px-6 pb-6 pt-2 border-t border-gray-100">
        {children}
      </div>
    )}
  </div>
);

/* ─── CustomerCombobox ─── */
const CustomerCombobox = ({ value, onChange, customers, onAddNew }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const selected = customers.find(c => c.name === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button" onClick={() => setOpen(o => !o)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          !value && 'text-muted-foreground',
        )}
      >
        <span className="truncate">{selected ? selected.name : 'Search or select customer…'}</span>
        <ChevronDown className="w-4 h-4 opacity-50 shrink-0 ml-2" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <input autoFocus placeholder="Search customers…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No customers found</p>}
            {filtered.map(c => (
              <button key={c.id} type="button"
                onClick={() => { onChange(c.name); setOpen(false); setSearch(''); }}
                className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                </div>
                {value === c.name && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-gray-100">
            <button type="button" onClick={() => { setOpen(false); onAddNew(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-primary rounded-md hover:bg-primary/5 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add new customer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── ProcessToggle: finishing process row ─── */
const ProcessToggle = ({ label, checked, cost, onToggle, onCostChange }) => (
  <div className={cn(
    'flex items-center gap-3 rounded-xl border p-3 transition-all duration-150',
    checked ? 'border-primary/25 bg-primary/5' : 'border-gray-100 bg-white hover:border-gray-200',
  )}>
    <button type="button" onClick={onToggle}
      className={cn(
        'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
        checked ? 'bg-primary border-primary' : 'border-gray-300 hover:border-gray-400',
      )}>
      {checked && <Check className="w-3 h-3 text-white" />}
    </button>
    <span className={cn('text-sm flex-1 select-none', checked ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
      {label}
    </span>
    {checked && (
      <div className="relative w-24">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">₹</span>
        <NumInput value={cost} onChange={onCostChange} placeholder="0" className="h-8 pl-6 text-sm" />
      </div>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
const CreateEstimate = () => {
  const router = useRouter();
  const { saveEstimate, generateEstimateId } = useEstimate();
  const { paperTypes, productTypes, gsmOptions, addProductType, addGsmOption, addPaperType, customers, addCustomer } = useMasterData();

  /* estimate number */
  const [estimateNo, setEstimateNo] = useState('');
  useEffect(() => { setEstimateNo(generateEstimateId ? generateEstimateId() : `EST-${Date.now()}`); }, []);

  /* open sections */
  const [openSections, setOpenSections] = useState({ job: true, paper: true, printing: true, process: true });
  const toggleSection = (k) => setOpenSections(s => ({ ...s, [k]: !s[k] }));

  /* form state */
  const DEFAULTS = {
    customerName: '', jobName: '', productType: '', quantity: 1000, deliveryDate: '', salesPerson: '', remarks: '',
    paperType: '', gsm: 80, sheetSize: '', ups: 1, wastagePercent: 5, ratePerKg: 85, sheetsPerReam: 500,
    printType: 'Single Side', isCut: false, ratePerImpression: 0.15, setupCost: 500,
    platesFront: 0, platesBack: 0, plateCostPerPlate: 150, designCost: 0,
    cutting: false, cuttingCost: 0, folding: false, foldingCost: 0, lamination: false, laminationCost: 0,
    binding: false, bindingCost: 0, numbering: false, numberingCost: 0, perforation: false, perforationCost: 0,
    uv: false, uvCost: 0, embossing: false, embossingCost: 0, dieCutting: false, dieCuttingCost: 0,
  };
  const [f, setF] = useState(DEFAULTS);
  const set = (field, val) => setF(prev => ({ ...prev, [field]: val }));

  /* summary */
  const [profitPercent, setProfitPercent] = useState(20);
  const [summary, setSummary] = useState({
    paperCost: 0, printingCost: 0, processCost: 0, totalCost: 0,
    sellingPrice: 0, costPerUnit: 0, profitAmount: 0,
    totalSheets: 0, totalReams: 0, paperWeight: 0, impressions: 0, totalPlates: 0, totalPlateCost: 0,
    weightPerSheet_g: 0, weightPerRam_kg: 0, pricePerRam: 0,
  });

  /* dialogs */
  const [dlg, setDlg] = useState({ customer: false, product: false, paper: false, gsm: false });
  const openDlg = (k) => setDlg(d => ({ ...d, [k]: true }));
  const closeDlg = (k) => setDlg(d => ({ ...d, [k]: false }));
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
  const [newProductType, setNewProductType] = useState('');
  const [newPaperName, setNewPaperName] = useState('');
  const [newPaperRate, setNewPaperRate] = useState(80);
  const [newGsm, setNewGsm] = useState('');


  /* calculator */
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcMargins, setCalcMargins] = useState({ ...DEFAULT_MARGINS });
  const [sizeRecommendations, setSizeRecommendations] = useState(null);

  /* validation */
  const [errors, setErrors] = useState({});

  const salesPersons = ['Rahul Verma', 'Anita Desai', 'Kiran Rao', 'Suresh Menon'];

  /* ── recalculate ── */
  const recalculate = useCallback((fields, profit) => {
    const qty = Number(fields.quantity) || 1000;
    const ups = Number(fields.ups) || 1;
    const gsm = Number(fields.gsm) || 80;
    const rateKg = Number(fields.ratePerKg) || 85;
    const ream = Number(fields.sheetsPerReam) || 500;
    const sz = STANDARD_SIZES.find(s => s.name === fields.sheetSize);
    const sw = sz?.width || 210, sh = sz?.height || 297;
    // Wastage = margin/border area lost on each sheet — already paid for in full sheet cost.
    // It does NOT add extra sheets; sheet count is purely qty ÷ ups.
    const totalSheets = Math.ceil(qty / ups);
    const totalReams = Math.ceil(totalSheets / ream);
    // Spreadsheet-accurate per-ream formula:
    // Weight/Sheet (g) = (w_mm × h_mm / 1,000,000) × GSM
    // Weight/Ream (kg) = (weightPerSheet_g × sheetsPerReam) / 1000
    // Price/Ream (₹)  = weightPerRam_kg × ratePerKg
    const weightPerSheet_g = Math.round((sw * sh / 1e6) * gsm * 10000) / 10000;
    const weightPerRam_kg  = Math.round((weightPerSheet_g * ream) / 1000 * 10000) / 10000;
    const pricePerRam      = Math.round(weightPerRam_kg * rateKg * 100) / 100;
    const paperWeight      = Math.round(weightPerRam_kg * totalReams * 100) / 100;
    const paperCost        = Math.round(pricePerRam * totalReams * 100) / 100;
    const isCut = !!fields.isCut;
    const printType = fields.printType || 'Single Side';
    const printMultiplier = isCut ? (printType === 'Both Side' ? 4 : 2) : (printType === 'Both Side' ? 2 : 1);
    const impressions = totalSheets * printMultiplier;
    const printingCost = Math.round((impressions * (Number(fields.ratePerImpression) || 0) + (Number(fields.setupCost) || 0)) * 100) / 100;
    const pf = Number(fields.platesFront) || 0, pb = Number(fields.platesBack) || 0;
    const totalPlates = pf + pb;
    const totalPlateCost = Math.round(totalPlates * (Number(fields.plateCostPerPlate) || 0) * 100) / 100;
    const processCost = Math.round((
      totalPlateCost + (Number(fields.designCost) || 0) +
      ['cutting','folding','lamination','binding','numbering','perforation','uv','embossing','dieCutting']
        .reduce((sum, k) => sum + (fields[k] ? Number(fields[`${k}Cost`]) || 0 : 0), 0)
    ) * 100) / 100;
    const totalCost = Math.round((paperCost + printingCost + processCost) * 100) / 100;
    const profitAmount = Math.round(totalCost * (profit / 100) * 100) / 100;
    const sellingPrice = Math.round((totalCost + profitAmount) * 100) / 100;
    const costPerUnit = Math.round((qty > 0 ? sellingPrice / qty : 0) * 100) / 100;
    setSummary({ paperCost, printingCost, processCost, totalCost, profitAmount, sellingPrice, costPerUnit, totalSheets, totalReams, paperWeight, impressions, totalPlates, totalPlateCost, weightPerSheet_g, weightPerRam_kg, pricePerRam });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => recalculate(f, profitPercent), 300);
    return () => clearTimeout(t);
  }, [f, profitPercent, recalculate]);

  /* ── save ── */
  const validate = () => {
    const e = {};
    if (!f.customerName) e.customerName = 'Required';
    if (!f.jobName) e.jobName = 'Required';
    if (!f.productType) e.productType = 'Required';
    if (!f.quantity) e.quantity = 'Required';
    if (!f.paperType) e.paperType = 'Required';
    if (!f.sheetSize) e.sheetSize = 'Required';
    setErrors(e);
    if (Object.keys(e).length > 0) setOpenSections({ job: true, paper: true, printing: true, process: true });
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    saveEstimate({
      estimateNo,
      jobDetails: { customerName: f.customerName, jobName: f.jobName, productType: f.productType, quantity: f.quantity, deliveryDate: f.deliveryDate, salesPerson: f.salesPerson, remarks: f.remarks },
      paperEstimation: { paperType: f.paperType, gsm: f.gsm, sheetSize: f.sheetSize, ups: f.ups, wastagePercent: f.wastagePercent, ratePerKg: f.ratePerKg, sheetsPerReam: f.sheetsPerReam, ...{ totalSheets: summary.totalSheets, totalReams: summary.totalReams, paperWeight: summary.paperWeight, paperCost: summary.paperCost } },
      printingEstimation: { printType: f.printType, isCut: f.isCut, impressions: summary.impressions, setupCost: f.setupCost, ratePerImpression: f.ratePerImpression, printingCost: summary.printingCost },
      prePostPress: { platesFront: f.platesFront, platesBack: f.platesBack, plateCostPerPlate: f.plateCostPerPlate, totalPlates: summary.totalPlates, totalPlateCost: summary.totalPlateCost, designCost: f.designCost, processes: Object.fromEntries(['cutting','folding','lamination','binding','numbering','perforation','uv','embossing','dieCutting'].map(k => [k, { enabled: f[k], cost: f[`${k}Cost`] }])), processCost: summary.processCost },
      summary: { paperCost: summary.paperCost, printingCost: summary.printingCost, processCost: summary.processCost, totalCost: summary.totalCost, profitPercent, profitAmount: summary.profitAmount, sellingPrice: summary.sellingPrice, costPerUnit: summary.costPerUnit },
    });
    router.push('/estimates');
  };

  const handleReset = () => {
    setF(DEFAULTS);
    setErrors({});
    setEstimateNo(generateEstimateId ? generateEstimateId() : `EST-${Date.now()}`);
  };

  const applyFromCalculator = (sizeName, ups, _cw, _ch, _cu, calcResults, rec) => {
    setF(prev => ({
      ...prev,
      sheetSize: sizeName,
      ups,
      wastagePercent: rec?.wastePercent ?? prev.wastagePercent,
    }));
    setSizeRecommendations(calcResults);
  };

  const sheetSizeOptions = STANDARD_SIZES.map(s => ({ value: s.name, label: `${s.name} (${s.width}×${s.height}mm)` }));

  const finishingProcesses = [
    { key: 'cutting', label: 'Cutting' }, { key: 'folding', label: 'Folding' },
    { key: 'lamination', label: 'Lamination' }, { key: 'binding', label: 'Binding' },
    { key: 'numbering', label: 'Numbering' }, { key: 'perforation', label: 'Perforation' },
    { key: 'uv', label: 'UV Coating' }, { key: 'embossing', label: 'Embossing' },
    { key: 'dieCutting', label: 'Die Cutting' },
  ];

  const tot = summary.totalCost || 1;
  const paperPct = Math.round((summary.paperCost / tot) * 100) || 0;
  const printPct = Math.round((summary.printingCost / tot) * 100) || 0;
  const procPct = Math.max(100 - paperPct - printPct, 0);

  /* ═══ RENDER ═══ */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => router.push('/estimates')}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Estimates
            </button>
            <Separator orientation="vertical" className="h-5" />
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight leading-tight">Create New Estimate</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">Fill in job details to generate a cost estimate</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold">
              <FileText className="w-3.5 h-3.5" />{estimateNo || '—'}
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/estimates')}>Cancel</Button>
            <Button size="sm" onClick={handleSave} className="gap-1.5">
              <Save className="w-3.5 h-3.5" />Save Estimate
            </Button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ═══ Form column ═══ */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* 01 Job Details */}
            <SectionCard number="01" label="Job Details" icon={FileText} color="bg-sky-50 text-sky-600"
              open={openSections.job} onToggle={() => toggleSection('job')}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 mt-3">
                <div className="sm:col-span-2">
                  <FieldLabel required>Customer Name</FieldLabel>
                  <CustomerCombobox value={f.customerName} onChange={v => { set('customerName', v); setErrors(e => ({ ...e, customerName: undefined })); }}
                    customers={customers} onAddNew={() => openDlg('customer')} />
                  {errors.customerName && <p className="text-xs text-destructive mt-1">{errors.customerName}</p>}
                </div>

                <div>
                  <FieldLabel required>Job Name / Description</FieldLabel>
                  <Input placeholder="e.g. Annual Report 2025" value={f.jobName}
                    onChange={e => { set('jobName', e.target.value); setErrors(er => ({ ...er, jobName: undefined })); }}
                    className={errors.jobName ? 'border-destructive' : ''} />
                  {errors.jobName && <p className="text-xs text-destructive mt-1">{errors.jobName}</p>}
                </div>

                <div>
                  <FieldLabel required>Product Type</FieldLabel>
                  <div className="flex gap-2">
                    <NativeSelect value={f.productType} onChange={v => { set('productType', v); setErrors(e => ({ ...e, productType: undefined })); }}
                      placeholder="Select product…" className={cn('flex-1', errors.productType ? 'border-destructive' : '')}>
                      {productTypes.map(p => <option key={p} value={p}>{p}</option>)}
                    </NativeSelect>
                    <Button type="button" variant="outline" size="icon" onClick={() => openDlg('product')}><Plus className="w-4 h-4" /></Button>
                  </div>
                  {errors.productType && <p className="text-xs text-destructive mt-1">{errors.productType}</p>}
                </div>

                <div>
                  <FieldLabel required>Quantity (pcs)</FieldLabel>
                  <NumInput value={f.quantity} onChange={v => set('quantity', v)} min={1} placeholder="1000" />
                </div>

                <div>
                  <FieldLabel>Delivery Date</FieldLabel>
                  <input type="date" value={f.deliveryDate} onChange={e => set('deliveryDate', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
                </div>

                <div>
                  <FieldLabel>Sales Person</FieldLabel>
                  <NativeSelect value={f.salesPerson} onChange={v => set('salesPerson', v)} placeholder="Select…">
                    {salesPersons.map(s => <option key={s} value={s}>{s}</option>)}
                  </NativeSelect>
                </div>

                <div>
                  <FieldLabel hint="Optional">Remarks</FieldLabel>
                  <Input placeholder="Special instructions…" value={f.remarks} onChange={e => set('remarks', e.target.value)} />
                </div>
              </div>
            </SectionCard>

            {/* 02 Paper Estimation */}
            <SectionCard number="02" label="Paper Estimation" icon={Scissors} color="bg-amber-50 text-amber-600"
              open={openSections.paper} onToggle={() => toggleSection('paper')}>
              {/* Smart Size banner */}
              <div className="mt-3 flex items-center justify-between gap-4 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />Smart Size Finder
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Enter finished size — get optimal sheet with minimum wastage</p>
                </div>
                <button type="button" onClick={() => setShowCalculator(true)}
                  className="shrink-0 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-[hsl(202,60%,38%)] transition-colors whitespace-nowrap">
                  Open Calculator
                </button>
              </div>

              {sizeRecommendations?.recommendations && (
                <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-2">Smart Size Recommendations — click to apply</p>
                  <div className="flex flex-col gap-2">
                    {sizeRecommendations.recommendations.slice(0, 3).map((rec, i) => (
                      <button key={rec.size} type="button"
                        onClick={() => { set('sheetSize', rec.size); set('ups', rec.ups); set('wastagePercent', rec.wastePercent); }}
                        className={cn(
                          'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-colors text-left',
                          f.sheetSize === rec.size
                            ? 'border-emerald-400 bg-emerald-100 text-emerald-800'
                            : i === 0
                              ? 'border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50'
                              : 'border-gray-200 bg-white text-foreground hover:bg-gray-50'
                        )}>
                        <div className="flex items-center gap-2">
                          {i === 0 && <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Best</span>}
                          {f.sheetSize === rec.size && <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-1.5 py-0.5 rounded">Applied</span>}
                          <span className="text-sm font-semibold">{rec.size}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-xs">
                          <span className="font-semibold">{rec.ups} up{rec.ups !== 1 ? 's' : ''}</span>
                          <span className="text-amber-600 font-semibold">{rec.wastePercent}% waste</span>
                          <span className="text-emerald-600 font-semibold">{rec.efficiency}% eff.</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-emerald-600 mt-2">Applies sheet size and ups</p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4 mt-4">
                <div className="col-span-2">
                  <FieldLabel required>Paper Type</FieldLabel>
                  <div className="flex gap-2">
                    <NativeSelect value={f.paperType} placeholder="Select paper type…"
                      onChange={v => { const p = paperTypes.find(x => x.name === v); setF(prev => ({ ...prev, paperType: v, ratePerKg: p?.ratePerKg ?? prev.ratePerKg })); setErrors(e => ({ ...e, paperType: undefined })); }}
                      className={cn('flex-1', errors.paperType ? 'border-destructive' : '')}>
                      {paperTypes.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </NativeSelect>
                    <Button type="button" variant="outline" size="icon" onClick={() => openDlg('paper')}><Plus className="w-4 h-4" /></Button>
                  </div>
                  {errors.paperType && <p className="text-xs text-destructive mt-1">{errors.paperType}</p>}
                </div>

                <div>
                  <FieldLabel required>GSM</FieldLabel>
                  <div className="flex gap-2">
                    <NativeSelect value={f.gsm} onChange={v => set('gsm', Number(v))} className="flex-1">
                      {gsmOptions.map(g => <option key={g} value={g}>{g} GSM</option>)}
                    </NativeSelect>
                    <Button type="button" variant="outline" size="icon" onClick={() => openDlg('gsm')}><Plus className="w-4 h-4" /></Button>
                  </div>
                </div>

                <div>
                  <FieldLabel hint={f.paperType ? `auto from paper type` : undefined}>Rate / Kg (₹)</FieldLabel>
                  <NumInput value={f.ratePerKg} onChange={v => set('ratePerKg', v)} min={0} />
                </div>

                <div className="col-span-2">
                  <FieldLabel required>Sheet Size</FieldLabel>
                  <NativeSelect value={f.sheetSize} placeholder="Select sheet size…"
                    onChange={v => { set('sheetSize', v); setErrors(e => ({ ...e, sheetSize: undefined })); }}
                    className={errors.sheetSize ? 'border-destructive' : ''}>
                    {sheetSizeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </NativeSelect>
                  {errors.sheetSize && <p className="text-xs text-destructive mt-1">{errors.sheetSize}</p>}
                </div>

                <div>
                  <FieldLabel hint="per sheet">Ups</FieldLabel>
                  <NumInput value={f.ups} onChange={v => set('ups', v)} min={1} max={100} />
                </div>

                <div>
                  <FieldLabel>Sheets / Ream</FieldLabel>
                  <NumInput value={f.sheetsPerReam} onChange={v => set('sheetsPerReam', v)} min={1} />
                </div>

                <div>
                  <FieldLabel hint="margin area — info only">Area Waste %</FieldLabel>
                  <NumInput value={f.wastagePercent} onChange={v => set('wastagePercent', v)} min={0} max={50} />
                </div>
              </div>

              {/* Paper computation stats strip */}
              {summary.weightPerSheet_g > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Weight / Sheet', value: `${summary.weightPerSheet_g} g`, hint: 'per sheet' },
                    { label: 'Weight / Ream',  value: `${summary.weightPerRam_kg} kg`, hint: `${f.sheetsPerReam || 500} sheets` },
                    { label: 'Price / Ream',   value: formatCurrency(summary.pricePerRam), hint: 'at ₹' + (f.ratePerKg || 0) + '/kg' },
                    { label: 'Total Reams',    value: summary.totalReams, hint: `${summary.totalSheets.toLocaleString()} sheets` },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-xl bg-amber-50/60 border border-amber-100 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700/70 leading-none">{stat.label}</p>
                      <p className="text-base font-bold text-foreground tabular-nums mt-1 leading-none">{stat.value}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{stat.hint}</p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* 03 Printing Details */}
            <SectionCard number="03" label="Printing Details" icon={Printer} color="bg-violet-50 text-violet-600"
              open={openSections.printing} onToggle={() => toggleSection('printing')}>

              {/* Sheets / Prints */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sheets</p>
                  <p className="text-2xl font-bold tabular-nums mt-1">{summary.totalSheets > 0 ? summary.totalSheets.toLocaleString() : '—'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">going through press</p>
                </div>
                <div className="rounded-xl bg-violet-50 border border-violet-200 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500">Prints</p>
                  <p className="text-2xl font-bold text-violet-700 tabular-nums mt-1">
                    {f.quantity > 0 ? Number(f.quantity).toLocaleString() : '—'}
                  </p>
                  <p className="text-xs text-violet-400 mt-0.5">client's order qty</p>
                </div>
              </div>

              {/* Print Type */}
              <div className="mt-4">
                <p className="text-sm font-semibold text-foreground mb-2">Print Type</p>
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1">
                  {['Single Side', 'Both Side'].map(opt => (
                    <button key={opt} type="button" onClick={() => set('printType', opt)}
                      className={cn(
                        'px-4 py-1.5 rounded-md text-sm font-semibold transition-all',
                        f.printType === opt
                          ? 'bg-white shadow-sm text-violet-700 border border-violet-200'
                          : 'text-muted-foreground hover:text-foreground',
                      )}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cut Job */}
              <div className="mt-4 flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-semibold text-foreground">Cut Job</p>
                  <p className="text-xs text-muted-foreground">Each sheet is cut into 2 pieces</p>
                </div>
                <button type="button" onClick={() => set('isCut', !f.isCut)}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                    f.isCut ? 'bg-violet-500' : 'bg-gray-200',
                  )}>
                  <span className={cn(
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                    f.isCut ? 'translate-x-5' : 'translate-x-0',
                  )} />
                </button>
              </div>

              {/* Impressions result */}
              {summary.totalSheets > 0 && (
                <div className="mt-4 flex items-center justify-between rounded-lg bg-violet-600 px-4 py-3">
                  <span className="text-sm font-semibold text-violet-100">Total Impressions</span>
                  <span className="text-xl font-bold text-white tabular-nums">{summary.impressions.toLocaleString()}</span>
                </div>
              )}

              {/* Rate Inputs */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <FieldLabel>Rate / Impression (₹)</FieldLabel>
                  <NumInput value={f.ratePerImpression} onChange={v => set('ratePerImpression', v)} min={0} step={0.01} />
                </div>
                <div>
                  <FieldLabel>Setup Cost (₹)</FieldLabel>
                  <NumInput value={f.setupCost} onChange={v => set('setupCost', v)} min={0} />
                </div>
              </div>
            </SectionCard>

            {/* 04 Pre-Press & Finishing */}
            <SectionCard number="04" label="Pre-Press & Finishing" icon={Layers} color="bg-rose-50 text-rose-600"
              open={openSections.process} onToggle={() => toggleSection('process')}>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-3 mb-3">Plate Details</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
                <div><FieldLabel>Plates — Front</FieldLabel><NumInput value={f.platesFront} onChange={v => set('platesFront', v)} min={0} /></div>
                <div><FieldLabel>Plates — Back</FieldLabel><NumInput value={f.platesBack} onChange={v => set('platesBack', v)} min={0} /></div>
                <div><FieldLabel>Cost / Plate (₹)</FieldLabel><NumInput value={f.plateCostPerPlate} onChange={v => set('plateCostPerPlate', v)} min={0} /></div>
                <div><FieldLabel>Design Cost (₹)</FieldLabel><NumInput value={f.designCost} onChange={v => set('designCost', v)} min={0} /></div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Finishing Processes
                  <span className="ml-2 normal-case font-normal">— toggle to include, enter cost per job</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {finishingProcesses.map(proc => (
                    <ProcessToggle key={proc.key} label={proc.label} checked={!!f[proc.key]} cost={f[`${proc.key}Cost`]}
                      onToggle={() => set(proc.key, !f[proc.key])} onCostChange={v => set(`${proc.key}Cost`, v)} />
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* Reset */}
            <div className="flex justify-end pb-4">
              <button type="button" onClick={handleReset}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                <RotateCcw className="w-3.5 h-3.5" />Reset form
              </button>
            </div>
          </div>

          {/* ═══ Summary column ═══ */}
          <div className="w-full lg:w-80 xl:w-88 shrink-0">
            <div className="sticky top-6 space-y-4">

              {/* Estimate badge */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estimate No.</p>
                  <p className="text-base font-bold text-primary mt-0.5">{estimateNo || '—'}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold">
                  <Check className="w-3 h-3" />Live
                </div>
              </div>

              {/* Cost panel */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Cost Breakdown</p>

                {/* Stacked bar */}
                <div className="mb-4">
                  <div className="flex rounded-full overflow-hidden h-2.5 bg-gray-100">
                    <div className="bg-sky-400 transition-all duration-500" style={{ width: `${paperPct}%` }} />
                    <div className="bg-violet-400 transition-all duration-500" style={{ width: `${printPct}%` }} />
                    <div className="bg-rose-400 transition-all duration-500" style={{ width: `${procPct}%` }} />
                  </div>
                  <div className="flex gap-3 mt-2">
                    {[['Sky','Paper',paperPct],['Violet','Print',printPct],['Rose','Process',procPct]].map(([c,l,p]) => (
                      <span key={l} className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className={`w-2 h-2 rounded-full bg-${c.toLowerCase()}-400 inline-block`} />
                        {l} {p}%
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    { label: 'Paper', color: 'bg-sky-400', val: summary.paperCost },
                    { label: 'Printing', color: 'bg-violet-400', val: summary.printingCost },
                    { label: 'Process', color: 'bg-rose-400', val: summary.processCost },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <span className={cn('w-2 h-2 rounded-full shrink-0', row.color)} />{row.label}
                      </span>
                      <span className="text-sm font-semibold tabular-nums">{formatCurrency(row.val)}</span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Total Cost</span>
                  <span className="text-base font-bold tabular-nums">{formatCurrency(summary.totalCost)}</span>
                </div>

                <Separator className="my-4" />

                {/* Profit */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">Profit %</span>
                    <div className="relative w-24">
                      <NumInput value={profitPercent} onChange={v => setProfitPercent(v === '' ? 0 : Number(v))} min={0} max={100} className="h-8 pr-7 text-sm text-right" />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Profit Amount</span>
                    <span className="text-sm font-semibold text-emerald-600 tabular-nums">{formatCurrency(summary.profitAmount)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Selling price hero */}
                <div className="rounded-xl bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-100 px-4 py-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Selling Price</p>
                  <p className="text-3xl font-bold text-emerald-700 tabular-nums leading-none">{formatCurrency(summary.sellingPrice)}</p>
                  <div className="mt-2.5 inline-flex items-center gap-1 bg-white/80 rounded-full px-3 py-1 text-xs font-semibold text-emerald-700">
                    <TrendingUp className="w-3 h-3" />Per unit: {formatCurrency(summary.costPerUnit)}
                  </div>
                </div>

                {/* Stats */}
                {summary.totalSheets > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ['Total Sheets', summary.totalSheets?.toLocaleString()],
                        ['Total Reams', summary.totalReams],
                        ['Paper Weight', `${summary.paperWeight} kg`],
                        ['Impressions', summary.impressions?.toLocaleString()],
                        ...(summary.totalPlates > 0 ? [['Plates', `${summary.totalPlates}`]] : []),
                      ].map(([label, val]) => (
                        <div key={label} className="rounded-lg bg-gray-50 px-3 py-2">
                          <p className="text-[11px] text-muted-foreground">{label}</p>
                          <p className="text-sm font-semibold mt-0.5 tabular-nums">{val}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Save button */}
              <Button onClick={handleSave} className="w-full gap-2" size="lg">
                <Save className="w-4 h-4" />Save Estimate
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Dialogs ═══ */}

      <Dialog open={dlg.customer} onOpenChange={o => { if (!o) closeDlg('customer'); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add New Customer</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><FieldLabel required>Customer Name</FieldLabel>
              <Input placeholder="Company or person name" value={newCustomer.name} onChange={e => setNewCustomer(c => ({ ...c, name: e.target.value }))} /></div>
            <div><FieldLabel>Mobile Number</FieldLabel>
              <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input className="pl-9" placeholder="+91 98765 43210" value={newCustomer.phone} onChange={e => setNewCustomer(c => ({ ...c, phone: e.target.value }))} /></div></div>
            <div><FieldLabel>Email Address</FieldLabel>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input className="pl-9" placeholder="customer@email.com" value={newCustomer.email} onChange={e => setNewCustomer(c => ({ ...c, email: e.target.value }))} /></div></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeDlg('customer')}>Cancel</Button>
            <Button disabled={!newCustomer.name.trim()} onClick={async () => {
              try {
                const nc = await addCustomer(newCustomer);
                set('customerName', nc.name);
              } catch (e) {
                console.error('Failed to add customer', e);
              }
              setNewCustomer({ name: '', phone: '', email: '' }); closeDlg('customer');
            }}>Add Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dlg.product} onOpenChange={o => { if (!o) closeDlg('product'); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Product Type</DialogTitle></DialogHeader>
          <div className="py-2"><FieldLabel required>Name</FieldLabel>
            <Input placeholder="e.g. Carry Bag" value={newProductType} onChange={e => setNewProductType(e.target.value)} /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeDlg('product')}>Cancel</Button>
            <Button disabled={!newProductType.trim()} onClick={() => { addProductType(newProductType.trim()); set('productType', newProductType.trim()); setNewProductType(''); closeDlg('product'); }}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dlg.paper} onOpenChange={o => { if (!o) closeDlg('paper'); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Paper Type</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><FieldLabel required>Paper Name</FieldLabel><Input placeholder="e.g. Glossy Art Paper" value={newPaperName} onChange={e => setNewPaperName(e.target.value)} /></div>
            <div><FieldLabel required>Rate / Kg (₹)</FieldLabel><NumInput value={newPaperRate} onChange={setNewPaperRate} min={0} placeholder="80" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeDlg('paper')}>Cancel</Button>
            <Button disabled={!newPaperName.trim()} onClick={() => {
              addPaperType({ name: newPaperName.trim(), ratePerKg: newPaperRate, gsmRange: '60-300', stock: 'Available' });
              setF(prev => ({ ...prev, paperType: newPaperName.trim(), ratePerKg: newPaperRate }));
              setNewPaperName(''); setNewPaperRate(80); closeDlg('paper');
            }}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dlg.gsm} onOpenChange={o => { if (!o) closeDlg('gsm'); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add GSM Option</DialogTitle></DialogHeader>
          <div className="py-2"><FieldLabel required>GSM Value</FieldLabel><NumInput value={newGsm} onChange={setNewGsm} min={1} placeholder="e.g. 120" /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeDlg('gsm')}>Cancel</Button>
            <Button disabled={!newGsm || isNaN(parseInt(newGsm))} onClick={() => {
              const g = parseInt(newGsm); addGsmOption(g); set('gsm', g); setNewGsm(''); closeDlg('gsm');
            }}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <PaperSizeCalculatorModal
        open={showCalculator} onClose={() => setShowCalculator(false)}
        onApply={applyFromCalculator} calcMargins={calcMargins} setCalcMargins={setCalcMargins}
      />
    </div>
  );
};

export default CreateEstimate;
