'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '../lib/supabase/client';

const MasterDataContext = createContext(null);

export const useMasterData = () => {
  const context = useContext(MasterDataContext);
  if (!context) {
    throw new Error('useMasterData must be used within a MasterDataProvider');
  }
  return context;
};

export const MasterDataProvider = ({ children }) => {
  const supabase = createClient();

  const [paperTypes, setPaperTypes] = useState([]);
  const [machines, setMachines] = useState([]);
  const [inks, setInks] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [gsmOptions, setGsmOptions] = useState([]);
  const [printTypes, setPrintTypes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Convert snake_case DB row to camelCase for app compatibility
  const toCamelPaperType = (row) => ({
    id: row.id, name: row.name, gsmRange: row.gsm_range,
    ratePerKg: row.rate_per_kg, stock: row.stock
  });
  const toCamelMachine = (row) => ({
    id: row.id, name: row.name, type: row.type, maxSize: row.max_size,
    colors: row.colors, speedPerHour: row.speed_per_hour, ratePerImpression: row.rate_per_impression
  });
  const toCamelInk = (row) => ({
    id: row.id, name: row.name, type: row.type, brand: row.brand,
    ratePerKg: row.rate_per_kg, coverage: row.coverage
  });
  const toCamelProcess = (row) => ({
    id: row.id, name: row.name, type: row.type, rateType: row.rate_type,
    rate: row.rate, minCharge: row.min_charge
  });
  const toCamelCustomer = (row) => ({
    id: row.id, name: row.name, phone: row.phone, email: row.email
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [pt, mc, ik, pr, prt, gsm, prtypes, cust] = await Promise.all([
      supabase.from('paper_types').select('*').order('id'),
      supabase.from('machines').select('*').order('id'),
      supabase.from('inks').select('*').order('id'),
      supabase.from('processes').select('*').order('id'),
      supabase.from('product_types').select('*').order('name'),
      supabase.from('gsm_options').select('*').order('value'),
      supabase.from('print_types').select('*').order('id'),
      supabase.from('customers').select('*').order('name'),
    ]);
    if (pt.data) setPaperTypes(pt.data.map(toCamelPaperType));
    if (mc.data) setMachines(mc.data.map(toCamelMachine));
    if (ik.data) setInks(ik.data.map(toCamelInk));
    if (pr.data) setProcesses(pr.data.map(toCamelProcess));
    if (prt.data) setProductTypes(prt.data.map(r => r.name));
    if (gsm.data) setGsmOptions(gsm.data.map(r => r.value));
    if (prtypes.data) setPrintTypes(prtypes.data.map(r => r.name));
    if (cust.data) setCustomers(cust.data.map(toCamelCustomer));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ---- Paper Types ----
  const addPaperType = async (item) => {
    const { data, error } = await supabase
      .from('paper_types')
      .insert({ name: item.name, gsm_range: item.gsmRange, rate_per_kg: item.ratePerKg, stock: item.stock })
      .select().single();
    if (error) throw error;
    const newItem = toCamelPaperType(data);
    setPaperTypes(prev => [...prev, newItem]);
    return newItem;
  };

  const updatePaperType = async (id, updates) => {
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.gsmRange !== undefined) dbUpdates.gsm_range = updates.gsmRange;
    if (updates.ratePerKg !== undefined) dbUpdates.rate_per_kg = updates.ratePerKg;
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
    const { error } = await supabase.from('paper_types').update(dbUpdates).eq('id', id);
    if (error) throw error;
    setPaperTypes(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deletePaperType = async (id) => {
    const { error } = await supabase.from('paper_types').delete().eq('id', id);
    if (error) throw error;
    setPaperTypes(prev => prev.filter(item => item.id !== id));
  };

  // ---- Machines ----
  const addMachine = async (item) => {
    const { data, error } = await supabase
      .from('machines')
      .insert({ name: item.name, type: item.type, max_size: item.maxSize, colors: item.colors, speed_per_hour: item.speedPerHour, rate_per_impression: item.ratePerImpression })
      .select().single();
    if (error) throw error;
    const newItem = toCamelMachine(data);
    setMachines(prev => [...prev, newItem]);
    return newItem;
  };

  const updateMachine = async (id, updates) => {
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.maxSize !== undefined) dbUpdates.max_size = updates.maxSize;
    if (updates.colors !== undefined) dbUpdates.colors = updates.colors;
    if (updates.speedPerHour !== undefined) dbUpdates.speed_per_hour = updates.speedPerHour;
    if (updates.ratePerImpression !== undefined) dbUpdates.rate_per_impression = updates.ratePerImpression;
    const { error } = await supabase.from('machines').update(dbUpdates).eq('id', id);
    if (error) throw error;
    setMachines(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteMachine = async (id) => {
    const { error } = await supabase.from('machines').delete().eq('id', id);
    if (error) throw error;
    setMachines(prev => prev.filter(item => item.id !== id));
  };

  // ---- Inks ----
  const addInk = async (item) => {
    const { data, error } = await supabase
      .from('inks')
      .insert({ name: item.name, type: item.type, brand: item.brand, rate_per_kg: item.ratePerKg, coverage: item.coverage })
      .select().single();
    if (error) throw error;
    const newItem = toCamelInk(data);
    setInks(prev => [...prev, newItem]);
    return newItem;
  };

  const updateInk = async (id, updates) => {
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
    if (updates.ratePerKg !== undefined) dbUpdates.rate_per_kg = updates.ratePerKg;
    if (updates.coverage !== undefined) dbUpdates.coverage = updates.coverage;
    const { error } = await supabase.from('inks').update(dbUpdates).eq('id', id);
    if (error) throw error;
    setInks(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteInk = async (id) => {
    const { error } = await supabase.from('inks').delete().eq('id', id);
    if (error) throw error;
    setInks(prev => prev.filter(item => item.id !== id));
  };

  // ---- Processes ----
  const addProcess = async (item) => {
    const { data, error } = await supabase
      .from('processes')
      .insert({ name: item.name, type: item.type, rate_type: item.rateType, rate: item.rate, min_charge: item.minCharge })
      .select().single();
    if (error) throw error;
    const newItem = toCamelProcess(data);
    setProcesses(prev => [...prev, newItem]);
    return newItem;
  };

  const updateProcess = async (id, updates) => {
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.rateType !== undefined) dbUpdates.rate_type = updates.rateType;
    if (updates.rate !== undefined) dbUpdates.rate = updates.rate;
    if (updates.minCharge !== undefined) dbUpdates.min_charge = updates.minCharge;
    const { error } = await supabase.from('processes').update(dbUpdates).eq('id', id);
    if (error) throw error;
    setProcesses(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteProcess = async (id) => {
    const { error } = await supabase.from('processes').delete().eq('id', id);
    if (error) throw error;
    setProcesses(prev => prev.filter(item => item.id !== id));
  };

  // ---- Product Types ----
  const addProductType = async (name) => {
    const { error } = await supabase.from('product_types').insert({ name });
    if (error) throw error;
    setProductTypes(prev => [...prev, name]);
  };

  const deleteProductType = async (name) => {
    const { error } = await supabase.from('product_types').delete().eq('name', name);
    if (error) throw error;
    setProductTypes(prev => prev.filter(item => item !== name));
  };

  // ---- GSM Options ----
  const addGsmOption = async (gsm) => {
    const { error } = await supabase.from('gsm_options').insert({ value: gsm });
    if (error) throw error;
    setGsmOptions(prev => [...prev, gsm].sort((a, b) => a - b));
  };

  const deleteGsmOption = async (gsm) => {
    const { error } = await supabase.from('gsm_options').delete().eq('value', gsm);
    if (error) throw error;
    setGsmOptions(prev => prev.filter(item => item !== gsm));
  };

  // ---- Print Types ----
  const addPrintType = async (name) => {
    const { error } = await supabase.from('print_types').insert({ name });
    if (error) throw error;
    setPrintTypes(prev => [...prev, name]);
  };

  const deletePrintType = async (name) => {
    const { error } = await supabase.from('print_types').delete().eq('name', name);
    if (error) throw error;
    setPrintTypes(prev => prev.filter(item => item !== name));
  };

  // ---- Customers ----
  const addCustomer = async (item) => {
    const { data, error } = await supabase
      .from('customers')
      .insert({ name: item.name, phone: item.phone || null, email: item.email || null })
      .select().single();
    if (error) throw error;
    const newItem = toCamelCustomer(data);
    setCustomers(prev => [newItem, ...prev]);
    return newItem;
  };

  const updateCustomer = async (id, updates) => {
    const { error } = await supabase.from('customers').update(updates).eq('id', id);
    if (error) throw error;
    setCustomers(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteCustomer = async (id) => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
    setCustomers(prev => prev.filter(item => item.id !== id));
  };

  return (
    <MasterDataContext.Provider value={{
      // Data
      paperTypes,
      machines,
      inks,
      processes,
      productTypes,
      gsmOptions,
      printTypes,
      customers,
      loading,
      // Add
      addPaperType,
      addMachine,
      addInk,
      addProcess,
      addProductType,
      addGsmOption,
      addPrintType,
      addCustomer,
      // Update
      updatePaperType,
      updateMachine,
      updateInk,
      updateProcess,
      // Delete
      deletePaperType,
      deleteMachine,
      deleteInk,
      deleteProcess,
      deleteProductType,
      deleteGsmOption,
      deletePrintType,
      updateCustomer,
      deleteCustomer,
      // Refresh
      refetch: fetchAll
    }}>
      {children}
    </MasterDataContext.Provider>
  );
};

export default MasterDataContext;

