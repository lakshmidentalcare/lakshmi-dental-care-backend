'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Receipt, 
  Stethoscope, 
  FileText, 
  FlaskConical, 
  Package, 
  Settings, 
  LogOut,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { syncLoadFromCloud } from '@/utils/cloudSync';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Patients CRM', href: '/patients', icon: Users },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Billing & Invoices', href: '/billing', icon: Receipt },
  { name: 'Treatments Catalog', href: '/treatments', icon: Stethoscope },
  { name: 'Prescriptions', href: '/prescriptions', icon: FileText },
  { name: 'Dental Lab Cases', href: '/lab', icon: FlaskConical },
  { name: 'Inventory Supplies', href: '/inventory', icon: Package },
  { name: 'Doctors & Staff', href: '/doctors', icon: UserCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [doctorName, setDoctorName] = useState('Dr. Iswariya');

  useEffect(() => {
    async function refreshName() {
      try {
        const config = await syncLoadFromCloud('LDC_CLINIC_CONFIG', { superAdminName: 'Dr. Iswariya' });
        if (config && config.superAdminName) {
          setDoctorName(config.superAdminName);
        } else {
          setDoctorName('Dr. Iswariya');
        }
      } catch (e) {
        setDoctorName('Dr. Iswariya');
      }
    }

    refreshName();
    const interval = setInterval(refreshName, 3000);

    if (typeof window !== 'undefined') {
      window.addEventListener('ldc_settings_updated', refreshName);
    }
    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('ldc_settings_updated', refreshName);
      }
    };
  }, []);

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 shadow-2xl relative z-20">
      <div>
        
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3 bg-slate-950/60">
          <img src="/logo.png" className="w-8 h-8 rounded-xl object-cover border border-slate-700 shadow-md" alt="Logo" />
          <span className="font-extrabold text-sm tracking-tight text-white">Lakshmi Dental</span>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 font-extrabold scale-[1.02]'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-extrabold text-xs shadow-md shrink-0">
              {doctorName.charAt(0) || 'I'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-extrabold text-white truncate">{doctorName}</p>
              <p className="text-[10px] text-brand-400 font-semibold uppercase">Super Admin</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
