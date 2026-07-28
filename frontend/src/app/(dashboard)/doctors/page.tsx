'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Shield, Edit, Trash2, CheckCircle2, UserCheck, Stethoscope, Award, Mail, Phone } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';

type StaffMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'SUPER_ADMIN' | 'DENTIST' | 'ASSOCIATE_DENTIST' | 'RECEPTIONIST' | 'DENTAL_ASSISTANT' | 'ACCOUNTANT' | 'LAB_TECHNICIAN';
  regNumber?: string;
  specialization?: string;
  status: 'ACTIVE' | 'INACTIVE';
};

const INITIAL_STAFF: StaffMember[] = [
  { id: '1', name: 'Dr. Iswariya', email: 'admin@lakshmidental.com', phone: '9840001111', role: 'SUPER_ADMIN', regNumber: '1463', specialization: 'Chief Dental Surgeon', status: 'ACTIVE' },
  { id: '2', name: 'Dr. Ramana Krishnamurthy', email: 'ramana@lakshmidental.com', phone: '9840002222', role: 'DENTIST', regNumber: 'DENT-TN-9912', specialization: 'Endodontist (Root Canal Specialist)', status: 'ACTIVE' },
  { id: '3', name: 'Dr. Shruti Viswanathan', email: 'shruti@lakshmidental.com', phone: '9840003333', role: 'ASSOCIATE_DENTIST', regNumber: 'DENT-TN-1045', specialization: 'Pediatric & Orthodontic Specialist', status: 'ACTIVE' },
  { id: '4', name: 'Ananya Sundaram', email: 'reception@lakshmidental.com', phone: '9840004444', role: 'RECEPTIONIST', specialization: 'Front Desk Operations', status: 'ACTIVE' },
  { id: '5', name: 'Kavitha Nathan', email: 'assistant@lakshmidental.com', phone: '9840005555', role: 'DENTAL_ASSISTANT', specialization: 'Clinical Assistant', status: 'ACTIVE' },
  { id: '6', name: 'Suresh Kumar', email: 'accounts@lakshmidental.com', phone: '9840006666', role: 'ACCOUNTANT', specialization: 'Finance & Billing Manager', status: 'ACTIVE' },
  { id: '7', name: 'Venkatesh Rao', email: 'lab@lakshmidental.com', phone: '9840007777', role: 'LAB_TECHNICIAN', specialization: 'Ceramic Crown & Bridge Prosthetics', status: 'ACTIVE' },
];

export default function DoctorsStaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const [formData, setFormData] = useState<Partial<StaffMember>>({
    name: '',
    email: '',
    phone: '',
    role: 'DENTIST',
    regNumber: '',
    specialization: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('LDC_STAFF');
      if (saved) {
        setStaffList(JSON.parse(saved));
      } else {
        localStorage.setItem('LDC_STAFF', JSON.stringify(INITIAL_STAFF));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveStaffToStorage = (updated: StaffMember[]) => {
    setStaffList(updated);
    try {
      localStorage.setItem('LDC_STAFF', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenCreate = () => {
    setSelectedStaff(null);
    setFormData({ name: '', email: '', phone: '', role: 'DENTIST', regNumber: '', specialization: '', status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setFormData(staff);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Please fill in Staff Name and Email Address.');
      return;
    }

    if (selectedStaff) {
      const updated = staffList.map(s => s.id === selectedStaff.id ? { ...s, ...formData } as StaffMember : s);
      saveStaffToStorage(updated);
    } else {
      const newStaff: StaffMember = {
        id: 'stf-' + Date.now(),
        name: formData.name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        role: formData.role || 'DENTIST',
        regNumber: formData.regNumber || 'DENT-TN-' + Math.floor(1000 + Math.random() * 9000),
        specialization: formData.specialization || 'General Dentistry',
        status: 'ACTIVE'
      };
      saveStaffToStorage([newStaff, ...staffList]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      const updated = staffList.filter(s => s.id !== id);
      saveStaffToStorage(updated);
    }
  };

  const handleExportCSV = () => {
    const data = staffList.map(s => ({
      'Full Name': s.name,
      'Email': s.email,
      'Phone': s.phone,
      'Role': s.role,
      'Registration #': s.regNumber || 'N/A',
      'Specialization': s.specialization || 'N/A',
      'Status': s.status
    }));
    exportToCSV('Lakshmi_Dental_Staff', data);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-16">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-brand-600" />
            Doctors & Staff Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Add, edit, or manage clinic dentists, administrators, receptionists, and assistants.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportCSV}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center shadow-sm transition-all"
          >
            Export Staff Roster
          </button>
          
          <button 
            onClick={handleOpenCreate}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center shadow-md shadow-brand-500/20 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Doctor / Staff
          </button>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffList.map((staff) => (
          <div key={staff.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                  {staff.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">{staff.name}</h3>
                  <p className="text-xs text-brand-700 font-semibold">{staff.specialization || 'General Dentistry'}</p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                staff.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                staff.role.includes('DENTIST') ? 'bg-brand-100 text-brand-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {staff.role.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {staff.email}</p>
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {staff.phone}</p>
              {staff.regNumber && (
                <p className="flex items-center gap-2 text-slate-400 font-mono text-[11px]"><Award className="w-3.5 h-3.5 text-slate-400" /> Reg: {staff.regNumber}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="flex items-center text-[11px] font-bold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" /> Active Member
              </span>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleOpenEdit(staff)} className="p-2 text-slate-400 hover:text-brand-600 rounded-xl hover:bg-slate-50 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(staff.id)} className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-100">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-extrabold text-slate-900">
                {selectedStaff ? 'Edit Staff Details' : 'Add New Doctor / Staff Member'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Dr. Rajesh Kumar" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Role / Designation *</label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value as any})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                >
                  <option value="SUPER_ADMIN">Clinic Super Admin</option>
                  <option value="DENTIST">Senior Dentist</option>
                  <option value="ASSOCIATE_DENTIST">Associate Dentist</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="DENTAL_ASSISTANT">Dental Assistant</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="LAB_TECHNICIAN">Lab Technician</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Specialization / Department</label>
                <input 
                  type="text" 
                  value={formData.specialization} 
                  onChange={e => setFormData({...formData, specialization: e.target.value})}
                  placeholder="Orthodontics, Endodontics, Front Office" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="doctor@lakshmidental.com" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="98400xxxx" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Dental Registration Number</label>
                <input 
                  type="text" 
                  value={formData.regNumber} 
                  onChange={e => setFormData({...formData, regNumber: e.target.value})}
                  placeholder="DENT-TN-8827" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold">Cancel</button>
                <button type="submit" className="bg-brand-600 text-white font-bold px-5 py-2 rounded-xl shadow-md">Save Staff Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
