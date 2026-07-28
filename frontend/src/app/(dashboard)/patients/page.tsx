'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Download, UserPlus, Phone, Calendar, HeartPulse } from 'lucide-react';
import PatientModal from '@/components/patients/PatientModal';
import { exportToCSV } from '@/utils/exportUtils';

export type Patient = {
  id: string;
  patientCode: string;
  name: string;
  phone: string;
  gender: string;
  age: number;
  lastVisit?: string;
  medicalHistory?: string;
};

const INITIAL_PATIENTS: Patient[] = [
  { id: '1', patientCode: 'LDC-P-001', name: 'Rahul Sharma', phone: '9840112233', gender: 'MALE', age: 34, lastVisit: '2026-07-28', medicalHistory: 'Hypertension' },
  { id: '2', patientCode: 'LDC-P-002', name: 'Priya Nair', phone: '9840223344', gender: 'FEMALE', age: 29, lastVisit: '2026-07-27', medicalHistory: 'None' },
  { id: '3', patientCode: 'LDC-P-003', name: 'Rajesh Kannan', phone: '9840334455', gender: 'MALE', age: 45, lastVisit: '2026-07-25', medicalHistory: 'Diabetes Type 2' },
  { id: '4', patientCode: 'LDC-P-004', name: 'Meena Sundaram', phone: '9840445566', gender: 'FEMALE', age: 52, lastVisit: '2026-07-20', medicalHistory: 'Penicillin Allergy' },
];

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('LDC_PATIENTS');
      if (saved) {
        setPatients(JSON.parse(saved));
      } else {
        localStorage.setItem('LDC_PATIENTS', JSON.stringify(INITIAL_PATIENTS));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save changes to LocalStorage
  const savePatientsToStorage = (updated: Patient[]) => {
    setPatients(updated);
    try {
      localStorage.setItem('LDC_PATIENTS', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePatient = (patientData: Partial<Patient>) => {
    if (selectedPatient) {
      // Edit
      const updated = patients.map(p => 
        p.id === selectedPatient.id ? { ...p, ...patientData } as Patient : p
      );
      savePatientsToStorage(updated);
    } else {
      // Create New
      const newPatient: Patient = {
        id: 'p-' + Date.now(),
        patientCode: `LDC-P-00${patients.length + 1}`,
        name: patientData.name || 'New Patient',
        phone: patientData.phone || '',
        gender: patientData.gender || 'MALE',
        age: Number(patientData.age) || 30,
        lastVisit: new Date().toISOString().slice(0, 10),
        medicalHistory: patientData.medicalHistory || 'None'
      };
      savePatientsToStorage([newPatient, ...patients]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this patient record?')) {
      const updated = patients.filter(p => p.id !== id);
      savePatientsToStorage(updated);
    }
  };

  const handleExportCSV = () => {
    const exportData = patients.map(p => ({
      'Patient ID': p.patientCode,
      'Full Name': p.name,
      'Phone': p.phone,
      'Gender': p.gender,
      'Age': p.age,
      'Last Visit': p.lastVisit || 'N/A',
      'Medical History': p.medicalHistory || 'None'
    }));
    exportToCSV('Lakshmi_Dental_Patients', exportData);
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.phone.includes(search) ||
    p.patientCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-16">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Patients CRM Database
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage patient medical histories, clinical records, and contact info.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportCSV}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center shadow-sm transition-all"
          >
            <Download className="w-4 h-4 mr-2 text-slate-500" />
            Export Excel / CSV
          </button>
          
          <button 
            onClick={() => { setSelectedPatient(null); setIsModalOpen(true); }}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center shadow-md shadow-brand-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Patient
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Search & Counter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patients by name, phone, or ID (e.g. LDC-P-001)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Total Registered Patients: <span className="font-extrabold text-brand-700">{filteredPatients.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Patient ID</th>
                <th className="px-6 py-3.5">Patient Name</th>
                <th className="px-6 py-3.5">Phone Number</th>
                <th className="px-6 py-3.5">Age / Gender</th>
                <th className="px-6 py-3.5">Medical History</th>
                <th className="px-6 py-3.5">Last Visit</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No patients found. Click <strong className="text-brand-600">"Add New Patient"</strong> to register a record.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-brand-700">{patient.patientCode}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-800 font-extrabold flex items-center justify-center text-xs">
                        {patient.name.charAt(0)}
                      </div>
                      {patient.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{patient.phone}</td>
                    <td className="px-6 py-4 text-slate-600">{patient.age} Yrs / <span className="capitalize">{patient.gender.toLowerCase()}</span></td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold text-[10px]">
                        {patient.medicalHistory || 'None'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{patient.lastVisit || 'Today'}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedPatient(patient); setIsModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-brand-600 rounded-xl hover:bg-brand-50 transition-colors mr-1"
                        title="Edit Patient"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(patient.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                        title="Delete Patient"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Modal */}
      <PatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={selectedPatient}
        onSave={handleSavePatient}
      />
    </div>
  );
}
