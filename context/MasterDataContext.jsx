'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { paperTypes as defaultPaperTypes, machines as defaultMachines, inks as defaultInks, processes as defaultProcesses, productTypes as defaultProductTypes, gsmOptions as defaultGsmOptions, printTypes as defaultPrintTypes } from '../data/mockData';

const MasterDataContext = createContext(null);

export const useMasterData = () => {
  const context = useContext(MasterDataContext);
  if (!context) {
    throw new Error('useMasterData must be used within a MasterDataProvider');
  }
  return context;
};

export const MasterDataProvider = ({ children }) => {
  // Paper Types
  const [paperTypes, setPaperTypes] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem('printmaster_paper_types') : null;
    return saved ? JSON.parse(saved) : defaultPaperTypes;
  });

  // Machines
  const [machines, setMachines] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem('printmaster_machines') : null;
    return saved ? JSON.parse(saved) : defaultMachines;
  });

  // Inks
  const [inks, setInks] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem('printmaster_inks') : null;
    return saved ? JSON.parse(saved) : defaultInks;
  });

  // Processes
  const [processes, setProcesses] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem('printmaster_processes') : null;
    return saved ? JSON.parse(saved) : defaultProcesses;
  });

  // Product Types
  const [productTypes, setProductTypes] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem('printmaster_product_types') : null;
    return saved ? JSON.parse(saved) : defaultProductTypes;
  });

  // GSM Options
  const [gsmOptions, setGsmOptions] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem('printmaster_gsm_options') : null;
    return saved ? JSON.parse(saved) : defaultGsmOptions;
  });

  // Print Types
  const [printTypes, setPrintTypes] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem('printmaster_print_types') : null;
    return saved ? JSON.parse(saved) : defaultPrintTypes;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('printmaster_paper_types', JSON.stringify(paperTypes));
  }, [paperTypes]);

  useEffect(() => {
    localStorage.setItem('printmaster_machines', JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    localStorage.setItem('printmaster_inks', JSON.stringify(inks));
  }, [inks]);

  useEffect(() => {
    localStorage.setItem('printmaster_processes', JSON.stringify(processes));
  }, [processes]);

  useEffect(() => {
    localStorage.setItem('printmaster_product_types', JSON.stringify(productTypes));
  }, [productTypes]);

  useEffect(() => {
    localStorage.setItem('printmaster_gsm_options', JSON.stringify(gsmOptions));
  }, [gsmOptions]);

  useEffect(() => {
    localStorage.setItem('printmaster_print_types', JSON.stringify(printTypes));
  }, [printTypes]);

  // Add functions
  const addPaperType = (item) => {
    const newItem = { ...item, id: Date.now() };
    setPaperTypes(prev => [...prev, newItem]);
    return newItem;
  };

  const addMachine = (item) => {
    const newItem = { ...item, id: Date.now() };
    setMachines(prev => [...prev, newItem]);
    return newItem;
  };

  const addInk = (item) => {
    const newItem = { ...item, id: Date.now() };
    setInks(prev => [...prev, newItem]);
    return newItem;
  };

  const addProcess = (item) => {
    const newItem = { ...item, id: Date.now() };
    setProcesses(prev => [...prev, newItem]);
    return newItem;
  };

  const addProductType = (name) => {
    if (!productTypes.includes(name)) {
      setProductTypes(prev => [...prev, name]);
    }
  };

  const addGsmOption = (gsm) => {
    if (!gsmOptions.includes(gsm)) {
      setGsmOptions(prev => [...prev, gsm].sort((a, b) => a - b));
    }
  };

  const addPrintType = (name) => {
    if (!printTypes.includes(name)) {
      setPrintTypes(prev => [...prev, name]);
    }
  };

  // Update functions
  const updatePaperType = (id, updates) => {
    setPaperTypes(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const updateMachine = (id, updates) => {
    setMachines(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const updateInk = (id, updates) => {
    setInks(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const updateProcess = (id, updates) => {
    setProcesses(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  // Delete functions
  const deletePaperType = (id) => {
    setPaperTypes(prev => prev.filter(item => item.id !== id));
  };

  const deleteMachine = (id) => {
    setMachines(prev => prev.filter(item => item.id !== id));
  };

  const deleteInk = (id) => {
    setInks(prev => prev.filter(item => item.id !== id));
  };

  const deleteProcess = (id) => {
    setProcesses(prev => prev.filter(item => item.id !== id));
  };

  const deleteProductType = (name) => {
    setProductTypes(prev => prev.filter(item => item !== name));
  };

  const deleteGsmOption = (gsm) => {
    setGsmOptions(prev => prev.filter(item => item !== gsm));
  };

  const deletePrintType = (name) => {
    setPrintTypes(prev => prev.filter(item => item !== name));
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
      // Add
      addPaperType,
      addMachine,
      addInk,
      addProcess,
      addProductType,
      addGsmOption,
      addPrintType,
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
      deletePrintType
    }}>
      {children}
    </MasterDataContext.Provider>
  );
};

export default MasterDataContext;

