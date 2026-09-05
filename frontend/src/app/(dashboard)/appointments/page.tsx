'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, User, Stethoscope, CheckCircle2, Download, Trash2, UserPlus, RefreshCw, Check } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import { Patient } from '../patients/page';
import { syncSaveToCloud, syncLoadFromCloud } from '@/utils/cloudSync';

type Appointment = {
  id: string;
  patientName: string;
  patientPhone: string;
  dentistName: string;
  chairName: string;
  treatment: string;
  date: string;
  time: string;
  status: 'SCHEDULED' | 'IN_CHAIR' | 'COMPLETED' | 'CANCELLED';
};

const DEFAULT_PATIENTS: Patient[] = [
  { id: '1', patientCode: 'LDC-P-001', name: 'Rahul Sharma', phone: '9840112233', gender: 'MALE', age: 34, lastVisit: '2026-07-28', medicalHistory: 'Hypertension' },
  { id: '2', patientCode: 'LDC-P-002', name: 'Priya Nair', phone: '9840223344', gender: 'FEMALE', age: 29, lastVisit: '2026-07-27', medicalHistory: 'None' },
  { id: '3', patientCode: 'LDC-P-003', name: 'Rajesh Kannan', phone: '9840334455', gender: 'MALE', age: 45, lastVisit: '2026-07-25', medicalHistory: 'Diabetes Type 2' },
  { id: '4', patientCode: 'LDC-P-004', name: 'Meena Sundaram', phone: '9840445566', gender: 'FEMALE', age: 52, lastVisit: '2026-07-20', medicalHistory: 'Penicillin Allergy' },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 'app-1', patientName: 'Rahul Sharma', patientPhone: '9840112233', dentistName: 'Dr. Iswariya', chairName: 'Chair 1 (Premium Operatory)', treatment: 'Full Mouth Scaling & Polishing', date: new Date().toISOString().slice(0, 10), time: '10:00 AM', status: 'IN_CHAIR' },
  { id: 'app-2', patientName: 'Priya Nair', patientPhone: '9840223344', dentistName: 'Dr. Ramana Krishnamurthy', chairName: 'Chair 2 (Surgical Suite)', treatment: 'Root Canal Therapy', date: new Date().toISOString().slice(0, 10), time: '11:30 AM', status: 'SCHEDULED' },
  { id: 'app-3', patientName: 'Rajesh Kannan', patientPhone: '9840334455', dentistName: 'Dr. Shruti Viswanathan', chairName: 'Chair 3 (Orthodontics & Hygiene)', treatment: 'Ceramic Braces Adjustments', date: new Date().toISOString().slice(0, 10), time: '02:00 PM', status: 'SCHEDULED' },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [patients, setPatients] = useState<Patient[]>(DEFAULT_PATIENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form State
  const [patientId, setPatientId] = useState('1');
  const [customPatientName, setCustomPatientName] = useState('');
  const [customPatientPhone, setCustomPatientPhone] = useState('');
  const [dentistName, setDentistName] = useState('Dr. Iswariya');
  const [chairName, setChairName] = useState('Chair 1 (Premium Operatory)');
  const [treatment, setTreatment] = useState('General Dental Consultation & Cleaning');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('10:00 AM');

  const loadData = async () => {
    try {
      const loadedAppts = await syncLoadFromCloud('LDC_APPOINTMENTS', INITIAL_APPOINTMENTS);
      setAppointments(Array.isArray(loadedAppts) && loadedAppts.length > 0 ? loadedAppts : INITIAL_APPOINTMENTS);

      const loadedPatients = await syncLoadFromCloud('LDC_PATIENTS', DEFAULT_PATIENTS);
      setPatients(Array.isArray(loadedPatients) && loadedPatients.length > 0 ? loadedPatients : DEFAULT_PATIENTS);
    } catch (e) {}
  };

  useEffect(() => {
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

  const handleManualSync = async () => {
    setIsSyncing(true);
    await loadData();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const saveAppointmentsToStorage = async (updated: Appointment[]) => {
    setAppointments(updated);
    await syncSaveToCloud('LDC_APPOINTMENTS', updated);
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalPatientName = '';
    let finalPatientPhone = '';

    if (patientId === 'NEW') {
      finalPatientName = customPatientName.trim() || 'Walk-in Patient';
      finalPatientPhone = customPatientPhone.trim() || '9840000000';

      // Auto add new patient to CRM
      const newP: Patient = {
        id: 'p-' + Date.now(),
        patientCode: `LDC-P-00${patients.length + 1}`,
        name: finalPatientName,
        phone: finalPatientPhone,
        gender: 'MALE',
        age: 30,
        lastVisit: date,
        medicalHistory: 'None'
      };
      const updatedP = [newP, ...patients];
      setPatients(updatedP);
      await syncSaveToCloud('LDC_PATIENTS', updatedP);
    } else {
      const selectedPatient = patients.find(p => p.id === patientId) || patients[0];
      finalPatientName = selectedPatient ? selectedPatient.name : (customPatientName || 'Walk-in Patient');
      finalPatientPhone = selectedPatient ? selectedPatient.phone : '9840000000';
    }

    const newAppt: Appointment = {
      id: 'app-' + Date.now(),
      patientName: finalPatientName,
      patientPhone: finalPatientPhone,
      dentistName,
      chairName,
      treatment,
      date,
      time,
      status: 'SCHEDULED'
    };

    await saveAppointmentsToStorage([newAppt, ...appointments]);
    setIsModalOpen(false);
    setCustomPatientName('');
    setCustomPatientPhone('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Cancel and remove this appointment?')) {
      const updated = appointments.filter(a => a.id !== id);
      await saveAppointmentsToStorage(updated);
    }
  };

  const handleStatusToggle = async (id: string) => {
    const updated = appointments.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'SCHEDULED' ? 'IN_CHAIR' : a.status === 'IN_CHAIR' ? 'COMPLETED' : 'SCHEDULED';
        return { ...a, status: nextStatus as any };
      }
      return a;
    });
    await saveAppointmentsToStorage(updated);
  };

  const handleExportCSV = () => {
    const data = appointments.map(a => ({
      'Patient Name': a.patientName,
      'Phone': a.patientPhone,
      'Dentist': a.dentistName,
      'Chair': a.chairName,
      'Treatment': a.treatment,
      'Date': a.date,
      'Time': a.time,
      'Status': a.status
    }));
    exportToCSV('Lakshmi_Dental_Appointments', data);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-brand-600" />
            Smart Appointment Scheduler & Chair Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Book patient visits, allocate operatory chairs, and sync in real-time across devices.</p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
          <button 
            onClick={handleManualSync}
            className="bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-extrabold py-2.5 px-3.5 rounded-xl text-xs flex items-center justify-center shadow-md shadow-brand-500/30 transition-all active:scale-95"
            title="Sync Cloud Data Now"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Cloud</span>
          </button>

          <button 
            onClick={handleExportCSV}
            className="hidden sm:flex bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-2.5 px-4 rounded-xl text-xs items-center shadow-sm transition-all"
          >
            <Download className="w-4 h-4 mr-1.5 text-slate-500" />
            Export CSV
          </button>
          
          <button 
            onClick={() => {
              if (patients.length > 0) setPatientId(patients[0].id);
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Book Appointment
          </button>
        </div>
      </div>

      {/* Appointments List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {appointments.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl text-center text-slate-400 text-xs border border-slate-100">
            No appointments scheduled yet. Click <strong className="text-brand-600">"Book Appointment"</strong> above to schedule a visit.
          </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt.id} className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase text-brand-700 tracking-wide bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                    {appt.chairName}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base pt-1">{appt.patientName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{appt.patientPhone}</p>
                </div>

                <button 
                  onClick={() => handleStatusToggle(appt.id)}
                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all ${
                    appt.status === 'IN_CHAIR' ? 'bg-purple-100 text-purple-800 animate-pulse' :
                    appt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {appt.status.replace('_', ' ')}
                </button>
              </div>

              <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs text-slate-700">
                <p className="font-bold text-brand-700">{appt.treatment}</p>
                <p className="text-slate-500 font-medium">Clinician: {appt.dentistName}</p>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <div className="flex items-center text-slate-500 font-mono font-bold text-[11px]">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {appt.date} • {appt.time}
                </div>

                <button onClick={() => handleDelete(appt.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-100">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                Book Clinic Appointment
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
            </div>

            <form onSubmit={handleBookAppointment} className="p-6 space-y-4 text-xs">
              
              {/* Select Patient Section */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Select Patient *</label>
                
                {/* Mobile Quick Selection Chips (Tap to select patient instantly) */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {patients.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPatientId(p.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center space-x-1 border transition-all ${
                        patientId === p.id 
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm scale-105' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{p.name}</span>
                      {patientId === p.id && <Check className="w-3 h-3 ml-1" />}
                    </button>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => setPatientId('NEW')}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] border transition-all ${
                      patientId === 'NEW'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <span>➕ New / Walk-in</span>
                  </button>
                </div>

                {/* Dropdown fallback */}
                <select 
                  value={patientId} 
                  onChange={e => setPatientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.patientCode || p.phone})
                    </option>
                  ))}
                  <option value="NEW">➕ Add New / Walk-in Patient</option>
                </select>
              </div>

              {/* Custom New Patient Fields if NEW is selected */}
              {patientId === 'NEW' && (
                <div className="p-3.5 bg-brand-50/60 rounded-2xl border border-brand-200/60 space-y-3 animate-in fade-in duration-200">
                  <div>
                    <label className="block font-bold text-brand-900 mb-1">Patient Full Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Anitha Ramesh"
                      value={customPatientName} 
                      onChange={e => setCustomPatientName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-900 mb-1">Phone Number *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="e.g. 9840123456"
                      value={customPatientPhone} 
                      onChange={e => setCustomPatientPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Chair Allocation */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dental Chair Allocation *</label>
                <select 
                  value={chairName} 
                  onChange={e => setChairName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none font-bold text-slate-900"
                >
                  <option value="Chair 1 (Premium Operatory)">Chair 1 (Premium Operatory)</option>
                  <option value="Chair 2 (Surgical Suite)">Chair 2 (Surgical Suite)</option>
                  <option value="Chair 3 (Orthodontics & Hygiene)">Chair 3 (Orthodontics & Hygiene)</option>
                </select>
              </div>

              {/* Attending Clinician */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Attending Clinician *</label>
                <select 
                  value={dentistName} 
                  onChange={e => setDentistName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none font-bold text-slate-900"
                >
                  <option value="Dr. Iswariya">Dr. Iswariya (Chief Dental Surgeon)</option>
                  <option value="Dr. Ramana Krishnamurthy">Dr. Ramana Krishnamurthy (Endodontist)</option>
                  <option value="Dr. Shruti Viswanathan">Dr. Shruti Viswanathan (Associate Dentist)</option>
                </select>
              </div>

              {/* Treatment Procedure */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Treatment Procedure</label>
                <input 
                  type="text" 
                  value={treatment} 
                  onChange={e => setTreatment(e.target.value)}
                  placeholder="e.g. Scaling & Polishing, Root Canal"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium text-slate-900"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                  <select 
                    value={time} 
                    onChange={e => setTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-900"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold">Cancel</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
