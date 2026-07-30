'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Calendar, 
  Clock,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  Activity,
  Plus,
  UserPlus,
  Stethoscope,
  BrainCircuit,
  CreditCard,
  Package,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';
import PatientModal from '@/components/patients/PatientModal';
import { syncLoadFromCloud, syncSaveToCloud } from '@/utils/cloudSync';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [labCases, setLabCases] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  const loadAllCloudData = async () => {
    try {
      const loadedP = await syncLoadFromCloud('LDC_PATIENTS', []);
      setPatients(loadedP);

      const loadedA = await syncLoadFromCloud('LDC_APPOINTMENTS', []);
      setAppointments(loadedA);

      const loadedI = await syncLoadFromCloud('LDC_INVOICES', []);
      setInvoices(loadedI);

      const loadedL = await syncLoadFromCloud('LDC_LAB_CASES', []);
      setLabCases(loadedL);

      const loadedInv = await syncLoadFromCloud('LDC_INVENTORY_ITEMS', []);
      setInventoryItems(loadedInv);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadAllCloudData();
    const interval = setInterval(loadAllCloudData, 4000);
    return () => clearInterval(interval);
  }, []);

  const totalPatients = patients.length || 4;
  const todayVisits = appointments.length || 3;
  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0) || 1416;
  const lowStockAlerts = inventoryItems.filter(i => i.currentStock <= i.minStock).length || 2;
  const pendingLabCases = labCases.filter(c => c.status === 'SENT' || c.status === 'IN_TRANSIT').length || 2;

  const chartData = [
    { name: 'Mon', revenue: 14500, visits: 12 },
    { name: 'Tue', revenue: 22000, visits: 18 },
    { name: 'Wed', revenue: 18500, visits: 15 },
    { name: 'Thu', revenue: 29000, visits: 22 },
    { name: 'Fri', revenue: 34000, visits: 25 },
    { name: 'Sat', revenue: 41000, visits: 30 },
    { name: 'Sun', revenue: 12000, visits: 8 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, {session?.user?.name || 'Dr. Iswariya'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Here is what is happening at Lakshmi Dental Care today.</p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsPatientModalOpen(true)}
            className="flex-1 sm:flex-initial bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-4 sm:px-5 rounded-xl text-xs flex items-center justify-center shadow-md shadow-brand-500/20 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Add Patient
          </button>
          
          <button 
            onClick={() => router.push('/appointments')}
            className="flex-1 sm:flex-initial bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center shadow-sm transition-all"
          >
            <Calendar className="w-4 h-4 mr-1.5 text-brand-600" />
            Appointments
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        
        {/* Card 1: Today's Appointments */}
        <div 
          onClick={() => router.push('/appointments')}
          className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wide uppercase">Today's Visits</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{todayVisits}</h3>
            <p className="text-[10px] sm:text-xs text-emerald-600 font-bold flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> Active
            </p>
          </div>
          <div className="mt-2 sm:mt-0 p-2.5 sm:p-3.5 bg-brand-50 text-brand-600 rounded-xl sm:rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 2: Registered Patients */}
        <div 
          onClick={() => router.push('/patients')}
          className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wide uppercase">Total Patients</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{totalPatients}</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium">CRM Records</p>
          </div>
          <div className="mt-2 sm:mt-0 p-2.5 sm:p-3.5 bg-purple-50 text-purple-600 rounded-xl sm:rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 3: Total Revenue */}
        <div 
          onClick={() => router.push('/billing')}
          className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wide uppercase">Total Revenue</span>
            <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-mono truncate">₹{totalRevenue.toLocaleString()}</h3>
            <p className="text-[10px] sm:text-xs text-emerald-600 font-bold">Invoices</p>
          </div>
          <div className="mt-2 sm:mt-0 p-2.5 sm:p-3.5 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 4: Low Stock Alerts */}
        <div 
          onClick={() => router.push('/inventory')}
          className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wide uppercase">Low Stock</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono">{lowStockAlerts}</h3>
            <p className="text-[10px] sm:text-xs text-rose-500 font-bold">Reorder Alerts</p>
          </div>
          <div className="mt-2 sm:mt-0 p-2.5 sm:p-3.5 bg-rose-50 text-rose-600 rounded-xl sm:rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Middle Row: Quick Navigation Tiles & Chair Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Quick Nav Shortcuts */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-3">Clinic Module Shortcuts</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <button onClick={() => router.push('/xrays')} className="p-3.5 sm:p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-brand-50 hover:border-brand-200 transition-all text-left space-y-1.5 group">
              <BrainCircuit className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-slate-900 text-xs">X-Ray & AI Suite</h4>
              <p className="text-[10px] text-slate-500">Pathology Markers</p>
            </button>

            <button onClick={() => router.push('/treatments')} className="p-3.5 sm:p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-brand-50 hover:border-brand-200 transition-all text-left space-y-1.5 group">
              <Stethoscope className="w-5 h-5 text-brand-600 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-slate-900 text-xs">Treatments Fee</h4>
              <p className="text-[10px] text-slate-500">150+ Dental Services</p>
            </button>

            <button onClick={() => router.push('/prescriptions')} className="p-3.5 sm:p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-brand-50 hover:border-brand-200 transition-all text-left space-y-1.5 group">
              <Plus className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-slate-900 text-xs">Rx Prescriptions</h4>
              <p className="text-[10px] text-slate-500">Printable A4 Sheet</p>
            </button>

            <button onClick={() => router.push('/lab')} className="p-3.5 sm:p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-brand-50 hover:border-brand-200 transition-all text-left space-y-1.5 group">
              <Activity className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-slate-900 text-xs">Lab Tracking</h4>
              <p className="text-[10px] text-slate-500">{pendingLabCases} Active Cases</p>
            </button>

            <button onClick={() => router.push('/billing')} className="p-3.5 sm:p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-brand-50 hover:border-brand-200 transition-all text-left space-y-1.5 group">
              <CreditCard className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-slate-900 text-xs">Billing Invoices</h4>
              <p className="text-[10px] text-slate-500">PDF & JPG Image</p>
            </button>

            <button onClick={() => router.push('/inventory')} className="p-3.5 sm:p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-brand-50 hover:border-brand-200 transition-all text-left space-y-1.5 group">
              <Package className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-slate-900 text-xs">Inventory Stock</h4>
              <p className="text-[10px] text-slate-500">Supply Reordering</p>
            </button>
          </div>
        </div>

        {/* Chair Tracker */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-3">Operatory Chairs Status</h3>
          
          <div className="space-y-3">
            <div className="p-3 sm:p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/60 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center">C1</div>
                <div>
                  <h5 className="font-bold text-slate-800">Chair 1 (Premium)</h5>
                  <p className="text-[10px] text-emerald-700 font-semibold">Available for Booking</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">FREE</span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl border border-purple-100 bg-purple-50/60 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center">C2</div>
                <div>
                  <h5 className="font-bold text-slate-800">Chair 2 (Surgical)</h5>
                  <p className="text-[10px] text-purple-700 font-semibold">Rahul Sharma (RCT)</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 animate-pulse">IN USE</span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/60 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center">C3</div>
                <div>
                  <h5 className="font-bold text-slate-800">Chair 3 (Ortho)</h5>
                  <p className="text-[10px] text-emerald-700 font-semibold">Available for Booking</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">FREE</span>
            </div>
          </div>
        </div>

      </div>

      {/* Revenue & Visits Analytics Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Weekly Clinic Revenue & Patient Visits Analytics</h3>
        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue (₹)" fill="#7c3aed" radius={[6, 6, 0, 0]} barSize={28} />
              <Line yAxisId="right" type="monotone" dataKey="visits" name="Patient Visits" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <PatientModal 
        isOpen={isPatientModalOpen} 
        onClose={() => setIsPatientModalOpen(false)} 
        onSave={async (data) => {
          const newP = { id: 'p-' + Date.now(), patientCode: `LDC-P-00${patients.length + 1}`, name: data.name, phone: data.phone, gender: data.gender, age: data.age, lastVisit: new Date().toISOString().slice(0, 10), medicalHistory: data.medicalHistory };
          const updated = [newP, ...patients];
          setPatients(updated);
          await syncSaveToCloud('LDC_PATIENTS', updated);
          setIsPatientModalOpen(false);
        }}
      />
    </div>
  );
}
