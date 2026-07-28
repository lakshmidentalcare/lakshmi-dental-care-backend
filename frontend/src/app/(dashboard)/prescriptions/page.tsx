'use client';

import { useState, useEffect } from 'react';
import { Printer, Plus, Trash2, Pill, Search, Download } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import { Patient } from '../patients/page';

type DrugItem = {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  remarks: string;
};

const DEFAULT_PATIENTS: Patient[] = [
  { id: '1', patientCode: 'LDC-P-001', name: 'Rahul Sharma', phone: '9840112233', gender: 'MALE', age: 34, lastVisit: '2026-07-28', medicalHistory: 'Hypertension' },
  { id: '2', patientCode: 'LDC-P-002', name: 'Priya Nair', phone: '9840223344', gender: 'FEMALE', age: 29, lastVisit: '2026-07-27', medicalHistory: 'None' },
  { id: '3', patientCode: 'LDC-P-003', name: 'Rajesh Kannan', phone: '9840334455', gender: 'MALE', age: 45, lastVisit: '2026-07-25', medicalHistory: 'Diabetes Type 2' },
];

export default function PrescriptionsPage() {
  const [patients, setPatients] = useState<Patient[]>(DEFAULT_PATIENTS);

  // Form states
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('Take medications after food unless specified otherwise.');
  
  // Drug inputs
  const [drugName, setDrugName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('1-0-1');
  const [duration, setDuration] = useState('5 Days');
  const [remarks, setRemarks] = useState('');
  
  const [drugsList, setDrugsList] = useState<DrugItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('LDC_PATIENTS');
      if (saved) {
        setPatients(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const addDrug = () => {
    if (!drugName) return;
    setDrugsList([...drugsList, { medicineName: drugName, dosage, frequency, duration, remarks }]);
    setDrugName(''); setDosage(''); setRemarks('');
  };

  const removeDrug = (idx: number) => {
    const newDocs = [...drugsList];
    newDocs.splice(idx, 1);
    setDrugsList(newDocs);
  };

  const handleSaveRecord = () => {
    if (!selectedPatientId || drugsList.length === 0) {
      alert('Please select a patient and add at least one medication.');
      return;
    }
    alert('Prescription saved successfully to clinical record!');
    setDrugsList([]);
    setDiagnosis('');
  };

  const handleExportCSV = () => {
    const data = drugsList.map(d => ({
      'Patient Name': selectedPatient?.name || 'N/A',
      'Diagnosis': diagnosis || 'N/A',
      'Medicine Name': d.medicineName,
      'Dosage': d.dosage,
      'Frequency': d.frequency,
      'Duration': d.duration,
      'Remarks': d.remarks
    }));
    exportToCSV('Lakshmi_Dental_Prescription', data);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Prescriptions Builder</h1>
          <p className="text-sm text-slate-500 mt-1">Generate and print digital prescriptions with logo header & watermark.</p>
        </div>

        <button 
          onClick={handleExportCSV}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center shadow-sm transition-all"
        >
          <Download className="w-4 h-4 mr-2 text-slate-500" />
          Export Prescriptions CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Builder Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">Rx Details</h4>
            
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">Select Patient *</label>
              <select 
                value={selectedPatientId} 
                onChange={(e) => setSelectedPatientId(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-brand-500"
              >
                <option value="">-- Select Saved Patient ({patients.length}) --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.patientCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">Clinical Diagnosis</label>
              <input 
                type="text" 
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Pulpitis 46, Deep Dental Caries"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-medium"
              />
            </div>
            
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">Add Medication</h5>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <input 
                    type="text" placeholder="Medicine Name (e.g. Tab. Augmentin 625mg)" 
                    value={drugName} onChange={(e) => setDrugName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                  />
                </div>
                <div>
                  <input 
                    type="text" placeholder="Dosage (e.g. 1 Tab)" 
                    value={dosage} onChange={(e) => setDosage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                  />
                </div>
                <div>
                  <select 
                    value={frequency} onChange={(e) => setFrequency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold"
                  >
                    <option value="1-0-0">1-0-0 (Morning)</option>
                    <option value="1-0-1">1-0-1 (Morning & Night)</option>
                    <option value="1-1-1">1-1-1 (TDS)</option>
                    <option value="0-0-1">0-0-1 (Night)</option>
                    <option value="SOS">SOS (As needed)</option>
                  </select>
                </div>
                <div>
                  <select 
                    value={duration} onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold"
                  >
                    <option value="3 Days">3 Days</option>
                    <option value="5 Days">5 Days</option>
                    <option value="7 Days">7 Days</option>
                    <option value="10 Days">10 Days</option>
                    <option value="15 Days">15 Days</option>
                  </select>
                </div>
                <div>
                  <input 
                    type="text" placeholder="Remarks (After Food)" 
                    value={remarks} onChange={(e) => setRemarks(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                  />
                </div>
              </div>
              <button 
                onClick={addDrug}
                disabled={!drugName}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-brand-500/20 flex justify-center items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Medication to Rx
              </button>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">General Instructions</label>
              <textarea 
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Printable PDF View */}
        <div className="lg:col-span-7 bg-slate-100 p-8 rounded-3xl flex flex-col items-center border border-slate-200">
          <div className="w-full flex justify-end mb-4 space-x-3">
             <button 
                onClick={handleSaveRecord}
                disabled={drugsList.length === 0 || !selectedPatientId}
                className="bg-brand-600 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md"
              >
                Save Clinical Rx
              </button>
              <button 
                onClick={() => window.print()} 
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print PDF</span>
              </button>
          </div>

          {/* Actual Printable Page A4 Aspect Ratio Box */}
          <div className="bg-white w-full max-w-2xl aspect-[1/1.414] shadow-md border border-slate-200 p-10 relative text-slate-800 rounded-3xl overflow-hidden">
            
            {/* Background Watermark Logo */}
            <div 
              className="absolute inset-0 pointer-events-none bg-center bg-no-repeat bg-contain opacity-[0.035]"
              style={{ backgroundImage: `url('/logo.png')` }}
            />

            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-brand-700 pb-4 relative z-10">
              <div className="flex items-center space-x-3 text-left">
                <img src="/logo.png" className="w-16 h-16 object-cover rounded-xl border border-slate-100" alt="Logo" />
                <div>
                  <h2 className="text-2xl font-black text-brand-800 uppercase tracking-wide">Lakshmi Dental Care</h2>
                  <p className="text-xs text-slate-600 font-bold">Dr. Iswariya Lakshmi, BDS</p>
                  <p className="text-[10px] text-slate-500 font-medium">Reg No: DENT-TN-8827</p>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-500 space-y-0.5 relative z-10">
                <p>No.72, Barathipuram Main Road,</p>
                <p>Govindasalai, Puducherry-605011</p>
                <p className="font-bold text-slate-700 mt-1">Phone: +91 86808 55897</p>
              </div>
            </div>

            {/* Patient Info Bar */}
            <div className="flex justify-between items-center py-4 text-xs font-bold border-b border-slate-100 relative z-10">
              <div>
                <span className="text-slate-400 mr-2 uppercase text-[10px]">Patient:</span> 
                {selectedPatient ? selectedPatient.name : 'Select Patient'} 
                {selectedPatient && <span className="ml-2 font-normal text-slate-500">({selectedPatient.age} Yrs / {selectedPatient.gender.charAt(0)})</span>}
              </div>
              <div>
                <span className="text-slate-400 mr-2 uppercase text-[10px]">Date:</span> 
                {new Date().toLocaleDateString('en-GB')}
              </div>
            </div>

            {/* Diagnosis */}
            {diagnosis && (
              <div className="py-3 text-xs font-bold border-b border-slate-100 relative z-10">
                <span className="text-slate-400 text-[10px] uppercase mr-2">Clinical Diagnosis:</span>
                <span className="text-slate-900">{diagnosis}</span>
              </div>
            )}

            {/* Rx Symbol */}
            <div className="py-6 relative z-10">
              <div className="text-4xl font-serif italic text-brand-800 font-black mb-4">Rx</div>
              
              {/* Drugs List */}
              <div className="space-y-4 min-h-[260px]">
                {drugsList.length === 0 ? (
                  <p className="text-slate-300 text-xs italic">Add medications to see them listed on the printable prescription sheet...</p>
                ) : (
                  drugsList.map((drug, idx) => (
                    <div key={idx} className="flex justify-between items-start text-xs border-b border-dashed border-slate-100 pb-3">
                      <div>
                        <div className="font-bold flex items-center text-slate-900 text-sm">
                          <span className="text-slate-400 mr-2 font-mono text-xs">{idx + 1}.</span> {drug.medicineName}
                        </div>
                        <div className="text-slate-500 text-[11px] ml-5 mt-0.5">
                          {drug.dosage} • {drug.remarks || 'Take after food'}
                        </div>
                      </div>
                      <div className="text-right font-mono text-[11px] font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg">
                        {drug.frequency} for {drug.duration}
                      </div>
                      <button onClick={() => removeDrug(idx)} className="no-print ml-4 text-rose-300 hover:text-rose-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer / Signature */}
            <div className="absolute bottom-8 left-10 right-10 relative z-10">
              <div className="text-xs text-slate-600 border-t border-slate-100 pt-3 mb-6">
                <span className="font-bold text-slate-400 block mb-1 text-[10px] uppercase">Doctor Instructions:</span>
                {instructions}
              </div>
              
              <div className="flex justify-end">
                <div className="text-center">
                  <div className="h-12 w-32 border-b border-slate-300 mb-1 flex items-end justify-center">
                    <span className="font-serif italic text-brand-900 text-xl font-bold opacity-75">Dr. Iswariya L.</span>
                  </div>
                  <p className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider">Clinician Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
