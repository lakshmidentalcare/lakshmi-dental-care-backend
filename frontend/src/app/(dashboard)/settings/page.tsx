'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Database, Shield, Building, CreditCard, CheckCircle2, Download, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const [clinicConfig, setClinicConfig] = useState({
    clinicName: 'Lakshmi Dental Care',
    regNumber: 'DENT-TN-8827',
    phone: '+91 86808 55897',
    email: 'lakshmidentalcare5@gmail.com',
    address: 'No.72, Barathipuram Main Road, Govindasalai, Puducherry-605011',
    gstRate: 18,
    currencySymbol: '₹',
    invoicePrefix: 'INV-2026-',
    chair1Name: 'Chair 1 (Premium Operatory)',
    chair2Name: 'Chair 2 (Surgical Suite)',
    chair3Name: 'Chair 3 (Orthodontics & Hygiene)',
    autoBackup: true,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('LDC_CLINIC_CONFIG');
      if (saved) setClinicConfig(JSON.parse(saved));
    } catch (e) { console.error(e); }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('LDC_CLINIC_CONFIG', JSON.stringify(clinicConfig));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      alert('Failed to save settings to storage.');
    }
  };

  const handleExportFullDatabaseBackup = () => {
    const backupData = {
      patients: JSON.parse(localStorage.getItem('LDC_PATIENTS') || '[]'),
      appointments: JSON.parse(localStorage.getItem('LDC_APPOINTMENTS') || '[]'),
      invoices: JSON.parse(localStorage.getItem('LDC_INVOICES') || '[]'),
      staff: JSON.parse(localStorage.getItem('LDC_STAFF') || '[]'),
      config: clinicConfig,
      exportedAt: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `LDC_Clinic_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-600" />
            Clinic Master Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">Configure clinic profile, billing GST rates, chair allocations, and automated database backups.</p>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Settings Saved Successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        
        {/* Section 1: Clinic Identity */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-5 h-5 text-brand-600" />
            Clinic Identity & Registration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1.5">Clinic Name</label>
              <input 
                type="text" 
                value={clinicConfig.clinicName} 
                onChange={e => setClinicConfig({...clinicConfig, clinicName: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 outline-none focus:bg-white focus:border-brand-500" 
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1.5">State Dental Registration No.</label>
              <input 
                type="text" 
                value={clinicConfig.regNumber} 
                onChange={e => setClinicConfig({...clinicConfig, regNumber: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono font-bold text-brand-700 outline-none" 
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1.5">Official Phone Number</label>
              <input 
                type="text" 
                value={clinicConfig.phone} 
                onChange={e => setClinicConfig({...clinicConfig, phone: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-700 outline-none" 
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1.5">Official Email</label>
              <input 
                type="email" 
                value={clinicConfig.email} 
                onChange={e => setClinicConfig({...clinicConfig, email: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-700 outline-none" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1.5">Clinic Address (Appears on Invoices & Prescriptions)</label>
              <input 
                type="text" 
                value={clinicConfig.address} 
                onChange={e => setClinicConfig({...clinicConfig, address: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-700 outline-none" 
              />
            </div>
          </div>
        </div>

        {/* Section 2: Billing & Tax Settings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Tax & Financial Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1.5">Default GST Tax Rate (%)</label>
              <input 
                type="number" 
                value={clinicConfig.gstRate} 
                onChange={e => setClinicConfig({...clinicConfig, gstRate: Number(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 outline-none" 
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1.5">Currency Symbol</label>
              <input 
                type="text" 
                value={clinicConfig.currencySymbol} 
                onChange={e => setClinicConfig({...clinicConfig, currencySymbol: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 outline-none" 
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1.5">Invoice Prefix Format</label>
              <input 
                type="text" 
                value={clinicConfig.invoicePrefix} 
                onChange={e => setClinicConfig({...clinicConfig, invoicePrefix: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono font-bold text-slate-800 outline-none" 
              />
            </div>
          </div>
        </div>

        {/* Section 3: Data Security & Backup */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database className="w-5 h-5 text-indigo-600" />
            Database & Data Security
          </h3>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Download Complete Clinic Data Backup</h4>
              <p className="text-[11px] text-slate-500">Exports all patients, appointments, billing invoices, staff records, and settings into a JSON backup file.</p>
            </div>

            <button 
              type="button"
              onClick={handleExportFullDatabaseBackup}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shrink-0 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup</span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-8 rounded-2xl text-sm transition-all shadow-lg shadow-brand-500/20 flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save All Settings</span>
          </button>
        </div>

      </form>
    </div>
  );
}
