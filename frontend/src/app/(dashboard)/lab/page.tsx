'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Activity, Box, Truck, CheckCircle2, Download, X } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import { Patient } from '../patients/page';
import { syncSaveToCloud, syncLoadFromCloud } from '@/utils/cloudSync';

type LabCase = {
  id: string;
  caseNumber: string;
  caseType: string;
  patientName: string;
  patientCode: string;
  labName: string;
  expectedDate: string;
  status: 'SENT' | 'IN_TRANSIT' | 'DELIVERED' | 'FITTED';
  cost: number;
};

const INITIAL_LAB_CASES: LabCase[] = [
  { id: 'lab-1', caseNumber: 'LAB-2026-001', caseType: 'Monolithic Zirconia Crown (#46)', patientName: 'Rahul Sharma', patientCode: 'LDC-P-001', labName: 'DentCare Prosthetic Lab', expectedDate: '2026-08-02', status: 'IN_TRANSIT', cost: 2500 },
  { id: 'lab-2', caseNumber: 'LAB-2026-002', caseType: 'Complete Upper Acrylic Denture', patientName: 'Meena Sundaram', patientCode: 'LDC-P-004', labName: 'Apex Dental Craft', expectedDate: '2026-08-05', status: 'SENT', cost: 4000 },
  { id: 'lab-3', caseNumber: 'LAB-2026-003', caseType: 'Clear Aligner Series 1-5', patientName: 'Priya Nair', patientCode: 'LDC-P-002', labName: 'Illusion Aligners Lab', expectedDate: '2026-07-30', status: 'DELIVERED', cost: 12000 },
];

export default function LabManagementPage() {
  const [labCases, setLabCases] = useState<LabCase[]>(INITIAL_LAB_CASES);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<LabCase | null>(null);

  // Modal Form
  const [patientId, setPatientId] = useState('');
  const [caseType, setCaseType] = useState('Monolithic Zirconia Crown');
  const [labName, setLabName] = useState('DentCare Prosthetic Lab');
  const [expectedDate, setExpectedDate] = useState('2026-08-05');
  const [status, setStatus] = useState<'SENT' | 'IN_TRANSIT' | 'DELIVERED' | 'FITTED'>('SENT');
  const [cost, setCost] = useState(2500);

  useEffect(() => {
    async function loadData() {
      const loadedLab = await syncLoadFromCloud('LDC_LAB_CASES', INITIAL_LAB_CASES);
      setLabCases(loadedLab);

      const loadedPatients = await syncLoadFromCloud('LDC_PATIENTS', []);
      setPatients(loadedPatients);
    loadData();

    if (typeof window !== 'undefined') {
      window.addEventListener('ldc_settings_updated', loadData);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ldc_settings_updated', loadData);
      }
    };
  }, []);

  const saveLabCasesToStorage = async (updated: LabCase[]) => {
    setLabCases(updated);
    await syncSaveToCloud('LDC_LAB_CASES', updated);
  };

  const handleOpenCreate = () => {
    setSelectedCase(null);
    setPatientId(patients[0]?.id || '');
    setCaseType('Monolithic Zirconia Crown');
    setLabName('DentCare Prosthetic Lab');
    setExpectedDate('2026-08-05');
    setStatus('SENT');
    setCost(2500);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: LabCase) => {
    setSelectedCase(c);
    setCaseType(c.caseType);
    setLabName(c.labName);
    setExpectedDate(c.expectedDate);
    setStatus(c.status);
    setCost(c.cost);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const selPatient = patients.find(p => p.id === patientId);

    if (selectedCase) {
      const updated = labCases.map(c => c.id === selectedCase.id ? { ...c, caseType, labName, expectedDate, status, cost } : c);
      saveLabCasesToStorage(updated);
    } else {
      const newCase: LabCase = {
        id: 'lab-' + Date.now(),
        caseNumber: `LAB-2026-00${labCases.length + 1}`,
        caseType,
        patientName: selPatient ? selPatient.name : 'Rahul Sharma',
        patientCode: selPatient ? selPatient.patientCode : 'LDC-P-001',
        labName,
        expectedDate,
        status,
        cost: Number(cost) || 0
      };
      saveLabCasesToStorage([newCase, ...labCases]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this lab tracking record?')) {
      const updated = labCases.filter(c => c.id !== id);
      saveLabCasesToStorage(updated);
    }
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    const updated = labCases.map(c => c.id === id ? { ...c, status: newStatus } : c);
    saveLabCasesToStorage(updated);
  };

  const handleExportCSV = () => {
    const data = labCases.map(c => ({
      'Case #': c.caseNumber,
      'Case Type': c.caseType,
      'Patient Name': c.patientName,
      'Patient Code': c.patientCode,
      'Laboratory': c.labName,
      'Expected Delivery': c.expectedDate,
      'Status': c.status,
      'Lab Cost (₹)': c.cost
    }));
    exportToCSV('Lakshmi_Dental_Lab_Tracking', data);
  };

  const filteredCases = labCases.filter(c => 
    c.caseType.toLowerCase().includes(search.toLowerCase()) || 
    c.patientName.toLowerCase().includes(search.toLowerCase()) ||
    c.labName.toLowerCase().includes(search.toLowerCase())
  );

  const activeCases = labCases.filter(c => c.status === 'SENT' || c.status === 'IN_TRANSIT');
  const inTransitCases = labCases.filter(c => c.status === 'IN_TRANSIT');

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-600" />
            Lab Case Tracking & Dental Prosthetics
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track outgoing prosthetics, zirconia crowns, aligners, and lab partner deliveries.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportCSV}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center shadow-sm transition-all"
          >
            <Download className="w-4 h-4 mr-2 text-slate-500" />
            Export CSV
          </button>
          
          <button 
            onClick={handleOpenCreate}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center shadow-md shadow-brand-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Lab Case
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Total Sent Cases</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{labCases.length}</h3>
          </div>
          <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
            <Box className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Active Pending</span>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{activeCases.length}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">In Transit</span>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{inTransitCases.length}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Truck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Main Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lab cases by patient, crown type, or lab name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-brand-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Case #</th>
                <th className="py-3.5 px-6">Restoration Type</th>
                <th className="py-3.5 px-6">Patient Name</th>
                <th className="py-3.5 px-6">Dental Laboratory</th>
                <th className="py-3.5 px-6">Expected Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-brand-700">{c.caseNumber}</td>
                  <td className="py-4 px-6 font-bold text-slate-900">{c.caseType}</td>
                  <td className="py-4 px-6 text-slate-700 font-medium">{c.patientName} <span className="text-slate-400 text-[10px]">({c.patientCode})</span></td>
                  <td className="py-4 px-6 text-slate-600">{c.labName}</td>
                  <td className="py-4 px-6 text-slate-500 font-mono">{c.expectedDate}</td>
                  <td className="py-4 px-6">
                    <select 
                      value={c.status} 
                      onChange={(e) => handleStatusChange(c.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold outline-none cursor-pointer ${
                        c.status === 'FITTED' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'DELIVERED' ? 'bg-blue-100 text-blue-800' :
                        c.status === 'IN_TRANSIT' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <option value="SENT">SENT TO LAB</option>
                      <option value="IN_TRANSIT">IN TRANSIT</option>
                      <option value="DELIVERED">DELIVERED TO CLINIC</option>
                      <option value="FITTED">FITTED IN PATIENT</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => handleOpenEdit(c)} className="p-1.5 text-slate-400 hover:text-brand-600 rounded-xl hover:bg-slate-50 mr-1">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-100">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-extrabold text-slate-900">
                {selectedCase ? 'Edit Lab Case' : 'Create New Dental Lab Case'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Select Patient *</label>
                <select 
                  value={patientId} 
                  onChange={e => setPatientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-800"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.patientCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Restoration / Prosthetic Type *</label>
                <input 
                  type="text" 
                  value={caseType} 
                  onChange={e => setCaseType(e.target.value)}
                  placeholder="e.g. Monolithic Zirconia Crown (#46)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Dental Laboratory Partner</label>
                <input 
                  type="text" 
                  value={labName} 
                  onChange={e => setLabName(e.target.value)}
                  placeholder="e.g. DentCare Prosthetic Lab"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Expected Delivery</label>
                  <input 
                    type="date" 
                    value={expectedDate} 
                    onChange={e => setExpectedDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Lab Fee (₹)</label>
                  <input 
                    type="number" 
                    value={cost} 
                    onChange={e => setCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold">Cancel</button>
                <button type="submit" className="bg-brand-600 text-white font-bold px-5 py-2 rounded-xl shadow-md">Save Lab Case</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
