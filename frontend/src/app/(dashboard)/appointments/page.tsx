'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, User, Stethoscope, CheckCircle2, Download, Trash2 } from 'lucide-react';
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

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 'app-1', patientName: 'Rahul Sharma', patientPhone: '9840112233', dentistName: 'Dr. Iswariya', chairName: 'Chair 1 (Premium)', treatment: 'Full Mouth Scaling & Polishing', date: '2026-07-28', time: '10:00 AM', status: 'IN_CHAIR' },
  { id: 'app-2', patientName: 'Priya Nair', patientPhone: '9840223344', dentistName: 'Dr. Ramana', chairName: 'Chair 2 (Surgical)', treatment: 'Root Canal Therapy', date: '2026-07-28', time: '11:30 AM', status: 'SCHEDULED' },
  { id: 'app-3', patientName: 'Rajesh Kannan', patientPhone: '9840334455', dentistName: 'Dr. Shruti', chairName: 'Chair 3 (Ortho)', treatment: 'Ceramic Braces Adjustments', date: '2026-07-28', time: '02:00 PM', status: 'SCHEDULED' },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [patientId, setPatientId] = useState('');
  const [dentistName, setDentistName] = useState('Dr. Iswariya');
  const [chairName, setChairName] = useState('Chair 1 (Premium Operatory)');
  const [treatment, setTreatment] = useState('General Dental Consultation');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('10:00 AM');

  useEffect(() => {
    async function loadData() {
      const loadedAppts = await syncLoadFromCloud('LDC_APPOINTMENTS', INITIAL_APPOINTMENTS);
      setAppointments(loadedAppts);

      const loadedPatients = await syncLoadFromCloud('LDC_PATIENTS', []);
      setPatients(loadedPatients);
    }
    loadData();

    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const saveAppointmentsToStorage = async (updated: Appointment[]) => {
    setAppointments(updated);
    await syncSaveToCloud('LDC_APPOINTMENTS', updated);
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPatient = patients.find(p => p.id === patientId);

    const newAppt: Appointment = {
      id: 'app-' + Date.now(),
      patientName: selectedPatient ? selectedPatient.name : 'Walk-in Patient',
      patientPhone: selectedPatient ? selectedPatient.phone : '9840000000',
      dentistName,
      chairName,
      treatment,
      date,
      time,
      status: 'SCHEDULED'
    };

    await saveAppointmentsToStorage([newAppt, ...appointments]);
    setIsModalOpen(false);
    alert('Appointment booked successfully!');
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
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-brand-600" />
            Smart Appointment Scheduler & Chair Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">Book patient visits, allocate dental chairs (1, 2, 3), and manage real-time queues.</p>
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
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center shadow-md shadow-brand-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            Book New Appointment
          </button>
        </div>
      </div>

      {/* Appointments List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((appt) => (
          <div key={appt.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wide">{appt.chairName}</span>
                <h3 className="font-extrabold text-slate-900 text-base">{appt.patientName}</h3>
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

            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
              <p className="font-bold text-brand-700">{appt.treatment}</p>
              <p className="text-slate-500 font-medium">Clinician: {appt.dentistName}</p>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <div className="flex items-center text-slate-500 font-mono font-bold">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {appt.date} • {appt.time}
              </div>

              <button onClick={() => handleDelete(appt.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-100">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                Book Clinic Appointment
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleBookAppointment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Select Patient *</label>
                <select 
                  value={patientId} 
                  onChange={e => setPatientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-800"
                  required
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.patientCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Dental Chair Allocation *</label>
                <select 
                  value={chairName} 
                  onChange={e => setChairName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold"
                >
                  <option value="Chair 1 (Premium Operatory)">Chair 1 (Premium Operatory)</option>
                  <option value="Chair 2 (Surgical Suite)">Chair 2 (Surgical Suite)</option>
                  <option value="Chair 3 (Orthodontics & Hygiene)">Chair 3 (Orthodontics & Hygiene)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Attending Clinician *</label>
                <select 
                  value={dentistName} 
                  onChange={e => setDentistName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold"
                >
                  <option value="Dr. Iswariya">Dr. Iswariya (Senior Dentist)</option>
                  <option value="Dr. Ramana Krishnamurthy">Dr. Ramana Krishnamurthy (Endodontist)</option>
                  <option value="Dr. Shruti Viswanathan">Dr. Shruti Viswanathan (Associate Dentist)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Treatment Procedure</label>
                <input 
                  type="text" 
                  value={treatment} 
                  onChange={e => setTreatment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Time Slot</label>
                  <select 
                    value={time} 
                    onChange={e => setTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold"
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
                <button type="submit" className="bg-brand-600 text-white font-bold px-5 py-2 rounded-xl shadow-md">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
