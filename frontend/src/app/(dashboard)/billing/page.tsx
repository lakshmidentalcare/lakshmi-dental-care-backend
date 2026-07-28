'use client';

import { useState, useEffect } from 'react';
import { Printer, Download, Plus, Trash2, CheckCircle2, Image as ImageIcon, FileText } from 'lucide-react';
import { exportToCSV, exportElementAsImage } from '@/utils/exportUtils';
import { MASTER_DENTAL_TREATMENTS } from '@/data/treatmentsData';
import { Patient } from '../patients/page';
import { syncSaveToCloud, syncLoadFromCloud } from '@/utils/cloudSync';

type BillingItem = {
  id?: string;
  description: string;
  cost: number;
  qty: number;
};

type Invoice = {
  id: string;
  billNumber: string;
  patientName: string;
  patientCode: string;
  items: BillingItem[];
  subtotal: number;
  discountAmount: number;
  gstAmount: number;
  total: number;
  paymentMethod: string;
  status: 'PAID' | 'PENDING';
  date: string;
};

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    billNumber: 'INV-2026-001',
    patientName: 'Rahul Sharma',
    patientCode: 'LDC-P-001',
    items: [{ description: 'Full Mouth Scaling & Polishing', cost: 1200, qty: 1 }],
    subtotal: 1200,
    discountAmount: 0,
    gstAmount: 216,
    total: 1416,
    paymentMethod: 'UPI / QR',
    status: 'PAID',
    date: '2026-07-28'
  }
];

export default function BillingPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);

  // Form states
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedProcedureName, setSelectedProcedureName] = useState(MASTER_DENTAL_TREATMENTS[0].name);
  const [customDescription, setCustomDescription] = useState('');
  const [procedureCost, setProcedureCost] = useState<number>(MASTER_DENTAL_TREATMENTS[0].defaultCost);
  const [discountPct, setDiscountPct] = useState(0);
  const [gstPct, setGstPct] = useState(18);
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR');
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);

  useEffect(() => {
    async function loadData() {
      const loadedInvoices = await syncLoadFromCloud('LDC_INVOICES', INITIAL_INVOICES);
      setInvoices(loadedInvoices);

      const loadedPatients = await syncLoadFromCloud('LDC_PATIENTS', []);
      setPatients(loadedPatients);
    }
    loadData();

    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const saveInvoicesToStorage = async (updated: Invoice[]) => {
    setInvoices(updated);
    await syncSaveToCloud('LDC_INVOICES', updated);
  };

  const handleProcedureSelect = (procName: string) => {
    setSelectedProcedureName(procName);
    const proc = MASTER_DENTAL_TREATMENTS.find(p => p.name === procName);
    if (proc) setProcedureCost(proc.defaultCost);
  };

  const addItemToBill = () => {
    let desc = selectedProcedureName === 'Custom Treatment Procedure' 
      ? (customDescription.trim() || 'Custom Treatment') 
      : selectedProcedureName;

    setBillingItems([...billingItems, { description: desc, cost: Number(procedureCost) || 0, qty: 1 }]);
    setCustomDescription('');
  };

  const removeItem = (idx: number) => {
    const updated = [...billingItems];
    updated.splice(idx, 1);
    setBillingItems(updated);
  };

  const updateItemQty = (idx: number, qty: number) => {
    const updated = [...billingItems];
    updated[idx].qty = qty;
    setBillingItems(updated);
  };

  const updateItemCost = (idx: number, cost: number) => {
    const updated = [...billingItems];
    updated[idx].cost = cost;
    setBillingItems(updated);
  };

  const subtotal = billingItems.reduce((acc, curr) => acc + (curr.cost * curr.qty), 0);
  const discountAmt = subtotal * (discountPct / 100);
  const gstAmt = (subtotal - discountAmt) * (gstPct / 100);
  const grandTotal = subtotal - discountAmt + gstAmt;

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const handleSaveInvoice = () => {
    if (!selectedPatientId || billingItems.length === 0) {
      alert('Please select a patient and add at least one item to the invoice.');
      return;
    }

    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      billNumber: `INV-2026-00${invoices.length + 1}`,
      patientName: selectedPatient?.name || 'Patient',
      patientCode: selectedPatient?.patientCode || 'LDC-P-000',
      items: billingItems,
      subtotal,
      discountAmount: discountAmt,
      gstAmount: gstAmt,
      total: grandTotal,
      paymentMethod,
      status: 'PAID',
      date: new Date().toISOString().slice(0, 10)
    };

    saveInvoicesToStorage([newInvoice, ...invoices]);
    alert('Invoice Posted and Saved Successfully!');
    setBillingItems([]);
  };

  const handleExportInvoicesCSV = () => {
    const data = invoices.map(i => ({
      'Invoice #': i.billNumber,
      'Patient': i.patientName,
      'Patient Code': i.patientCode,
      'Date': i.date,
      'Payment Method': i.paymentMethod,
      'Total Amount (₹)': i.total,
      'Status': i.status
    }));
    exportToCSV('Lakshmi_Dental_Invoices', data);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Billing & Invoice Generator</h1>
          <p className="text-sm text-slate-500 mt-1">Generate printable PDF & JPG invoices with editable treatment costs, GST, and background logo watermark.</p>
        </div>

        <button 
          onClick={handleExportInvoicesCSV}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center shadow-sm transition-all"
        >
          <Download className="w-4 h-4 mr-2 text-slate-500" />
          Export Invoices CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Procedure & Cost Entry */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
          <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3">Create Billing Entry</h4>
          
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wide mb-1">Select Patient *</label>
              <select 
                value={selectedPatientId} 
                onChange={(e) => setSelectedPatientId(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 outline-none"
              >
                <option value="">-- Select Registered Patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.patientCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wide mb-1">Dental Treatment Procedure</label>
              {/* Clean procedure dropdown showing ONLY procedure name (price removed from dropdown label) */}
              <select 
                value={selectedProcedureName}
                onChange={(e) => handleProcedureSelect(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 outline-none"
              >
                {MASTER_DENTAL_TREATMENTS.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
                <option value="Custom Treatment Procedure">Custom Treatment Procedure</option>
              </select>
            </div>

            {selectedProcedureName === 'Custom Treatment Procedure' && (
              <div>
                <label className="block text-slate-500 font-bold mb-1">Custom Procedure Description</label>
                <input 
                  type="text" 
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Enter treatment details..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium" 
                />
              </div>
            )}

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wide mb-1">Treatment Cost (Editable ₹)</label>
              <input 
                type="number" 
                value={procedureCost} 
                onChange={(e) => setProcedureCost(Number(e.target.value))}
                min="0" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-brand-500" 
              />
            </div>

            <button 
              onClick={addItemToBill} 
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md shadow-brand-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Procedure to Invoice</span>
            </button>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Discount (%)</label>
                  <input 
                    type="number" 
                    value={discountPct}
                    onChange={(e) => setDiscountPct(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">GST Tax (%)</label>
                  <input 
                    type="number" 
                    value={gstPct}
                    onChange={(e) => setGstPct(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Payment Method</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none"
                >
                  <option value="UPI / QR">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Credit/Debit Card">Credit/Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Insurance Claim">Insurance Claim</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Printable Invoice Sheet */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          
          {/* Top Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <h4 className="font-extrabold text-slate-900 text-sm">Invoice Document Preview</h4>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => exportElementAsImage('invoice-printable-area', 'LDC_Invoice')} 
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all"
              >
                <ImageIcon className="w-4 h-4 text-brand-600" />
                <span>Export JPG Image</span>
              </button>

              <button 
                onClick={() => window.print()} 
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print PDF</span>
              </button>

              <button 
                onClick={handleSaveInvoice}
                disabled={billingItems.length === 0 || !selectedPatientId}
                className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-brand-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Post & Save Bill</span>
              </button>
            </div>
          </div>

          {/* Printable Invoice Container with Logo Background Watermark */}
          <div id="invoice-printable-area" className="border border-slate-200 p-8 rounded-3xl bg-white shadow-sm space-y-6 max-w-2xl mx-auto text-xs text-slate-800 relative overflow-hidden">
            
            {/* Background Watermark Logo */}
            <div 
              className="absolute inset-0 pointer-events-none bg-center bg-no-repeat bg-contain opacity-[0.035]"
              style={{ backgroundImage: `url('/logo.png')` }}
            />

            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-5 relative z-10">
              <div className="flex items-center space-x-3 text-left">
                <img src="/logo.png" className="w-14 h-14 object-cover rounded-xl border border-slate-100 shadow-sm" alt="Logo" />
                <div>
                  <h2 className="text-xl font-black text-brand-800 uppercase tracking-wide">Lakshmi Dental Care</h2>
                  <p className="text-[10px] text-slate-500 font-medium">NO.72, BARATHIPURAM MAIN ROAD, GOVINDASALAI, PUDUCHERRY-605011</p>
                  <p className="text-[10px] text-slate-500 font-bold">Phone: +91 86808 55897 | Reg No: 1463</p>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-extrabold text-slate-900">INVOICE</h3>
                <p className="text-[10px] font-mono font-bold text-brand-700">INV-2026-00{invoices.length + 1}</p>
                <p className="text-[10px] text-slate-500 font-medium">Date: {new Date().toLocaleDateString('en-GB')}</p>
              </div>
            </div>

            {/* Billed To */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 relative z-10">
              <div>
                <h4 className="font-extrabold text-slate-400 uppercase text-[9px] mb-1">Billed To Patient</h4>
                <p className="font-extrabold text-slate-900 text-sm">{selectedPatient ? selectedPatient.name : 'Select Patient'}</p>
                <p className="text-[10px] text-slate-500">
                  {selectedPatient ? `Code: ${selectedPatient.patientCode} | Phone: ${selectedPatient.phone}` : '...'}
                </p>
              </div>
              <div className="text-right">
                <h4 className="font-extrabold text-slate-400 uppercase text-[9px] mb-1">Attending Clinician</h4>
                <p className="font-bold text-slate-900">Dr. Iswariya, BDS</p>
                <p className="text-[10px] text-slate-500 font-semibold">Chief Dental Surgeon</p>
              </div>
            </div>

            {/* Treatment Items Table */}
            <table className="w-full text-left border-collapse relative z-10">
              <thead>
                <tr className="bg-slate-50 font-bold border-y border-slate-200 text-slate-500 text-[10px] uppercase">
                  <th className="py-2 px-3">Dental Treatment Description</th>
                  <th className="py-2 px-3 text-right">Unit Cost (₹)</th>
                  <th className="py-2 px-3 text-right font-mono">Qty</th>
                  <th className="py-2 px-3 text-right">Total (₹)</th>
                  <th className="py-2 px-3 text-center no-print">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {billingItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                      No treatments added to invoice. Select procedure on left to add.
                    </td>
                  </tr>
                ) : (
                  billingItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-bold text-slate-800">{item.description}</td>
                      <td className="py-3 px-3 text-right">
                        <input 
                          type="number" 
                          value={item.cost}
                          onChange={(e) => updateItemCost(idx, Number(e.target.value))}
                          className="w-20 text-right font-mono bg-transparent border-b border-slate-200 outline-none focus:border-brand-500"
                        />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <input 
                          type="number" 
                          value={item.qty}
                          onChange={(e) => updateItemQty(idx, Number(e.target.value))}
                          min="1"
                          className="w-12 text-right font-mono bg-transparent border-b border-slate-200 outline-none"
                        />
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-slate-900 font-mono">
                        ₹{(item.cost * item.qty).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center no-print">
                        <button onClick={() => removeItem(idx)} className="text-rose-400 hover:text-rose-600 transition-colors p-1">
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Financial Summary */}
            <div className="flex justify-end pt-4 relative z-10">
              <div className="w-64 space-y-2 text-right text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1.5 text-slate-500 font-medium">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5 text-slate-500 font-medium">
                  <span>Discount ({discountPct}%):</span>
                  <span className="font-mono text-emerald-600">-₹{discountAmt.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5 text-slate-500 font-medium">
                  <span>GST Tax ({gstPct}%):</span>
                  <span className="font-mono">₹{gstAmt.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1">
                  <span>Grand Total:</span>
                  <span className="font-mono text-brand-700">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer QR & Signature */}
            <div className="border-t border-slate-200 pt-5 flex justify-between items-center bg-slate-50/70 p-4 rounded-2xl relative z-10">
              <div>
                <h5 className="font-extrabold text-slate-900 text-[10px] uppercase">UPI Payment Accepted</h5>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Scan QR using GPay / PhonePe / Paytm</p>
              </div>
              <div className="flex items-center space-x-3">
                <img src="/qr.png" className="w-14 h-14 object-contain rounded-lg border border-slate-200 bg-white p-1 shadow-sm" alt="QR" />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-4">Recent Clinic Invoices</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-brand-700">{inv.billNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{inv.patientName}</td>
                  <td className="py-3 px-4 text-slate-500">{inv.date}</td>
                  <td className="py-3 px-4 text-slate-600 font-semibold">{inv.paymentMethod}</td>
                  <td className="py-3 px-4 text-right font-extrabold font-mono text-slate-900">₹{inv.total.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                      PAID ✓
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
