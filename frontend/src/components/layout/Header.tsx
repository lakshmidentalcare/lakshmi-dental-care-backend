'use client';

import { useState, useEffect } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { syncLoadFromCloud } from '@/utils/cloudSync';

export default function Header() {
  const { data: session } = useSession();
  const [doctorName, setDoctorName] = useState('Dr. Iswariya');
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshName = async () => {
    setIsSyncing(true);
    try {
      const config = await syncLoadFromCloud('LDC_CLINIC_CONFIG', { superAdminName: 'Dr. Iswariya' });
      if (config && config.superAdminName) {
        setDoctorName(config.superAdminName);
      } else {
        setDoctorName('Dr. Iswariya');
      }
    } catch (e) {
      setDoctorName('Dr. Iswariya');
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  useEffect(() => {
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
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-8 shadow-sm relative z-10">
      
      {/* Left Logo + Clinic Badge */}
      <div className="flex items-center space-x-3">
        <img src="/logo.png" className="w-9 h-9 object-cover rounded-xl border border-slate-100 shadow-sm" alt="Logo" />
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            Lakshmi Dental Care
            <span className="bg-brand-50 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-200/60">
              PRO CLINIC
            </span>
          </h2>
          <p className="text-[10px] text-slate-500 font-medium">Puducherry • Reg: 1463</p>
        </div>
      </div>

      {/* Right Actions & User Profile */}
      <div className="flex items-center space-x-5">
        
        {/* Manual Cloud Sync Button */}
        <button 
          onClick={refreshName}
          title="Force Cloud Sync Now"
          className="bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 border border-brand-200/60 transition-all active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-brand-600' : ''}`} />
          <span className="hidden sm:inline">Sync Cloud</span>
        </button>

        {/* Chair Indicators */}
        <div className="hidden md:flex items-center space-x-3 text-xs border-r border-slate-200 pr-5">
          <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Chairs: 3 Active</span>
          </div>
        </div>

        {/* Notifications Button */}
        <button className="p-2 text-slate-400 hover:text-slate-600 relative rounded-xl hover:bg-slate-100 transition-colors">
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          <Bell className="w-5 h-5" />
        </button>

        {/* User Badge */}
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-5">
          <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
            {doctorName.charAt(0) || 'I'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-extrabold text-slate-900">{doctorName}</p>
            <p className="text-[10px] text-brand-700 font-semibold uppercase">Super Admin</p>
          </div>
        </div>

      </div>
    </header>
  );
}
