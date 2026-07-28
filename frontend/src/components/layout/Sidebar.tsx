'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  Settings, 
  LogOut,
  Stethoscope,
  Package,
  Activity,
  BarChart3,
  BrainCircuit,
  UserCog
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'X-Ray & AI Diagnostic', href: '/xrays', icon: BrainCircuit },
  { name: 'Treatments Catalog', href: '/treatments', icon: Stethoscope },
  { name: 'Prescriptions', href: '/prescriptions', icon: FileText },
  { name: 'Lab Tracking', href: '/lab', icon: Activity },
  { name: 'Billing & Invoices', href: '/billing', icon: CreditCard },
  { name: 'Inventory Supplies', href: '/inventory', icon: Package },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Doctors & Staff', href: '/doctors', icon: UserCog },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-full shadow-xl text-white">
      {/* Branding Header with Logo */}
      <div className="h-18 flex items-center px-5 py-4 border-b border-slate-800/80 bg-slate-950/40">
        <img src="/logo.png" className="w-10 h-10 object-cover rounded-xl border border-slate-700 shadow-lg mr-3 shrink-0" alt="Logo" />
        <div className="overflow-hidden">
          <h1 className="text-sm font-bold text-brand-300 tracking-wider uppercase truncate">Lakshmi</h1>
          <p className="text-xs text-slate-300 font-semibold truncate">Dental Care</p>
        </div>
      </div>
      
      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-lg shadow-brand-600/30' 
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'}
              `}
            >
              <Icon className={`w-4 h-4 mr-3 shrink-0 ${isActive ? 'text-white' : 'text-brand-300'}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center px-3 py-2 mb-2 rounded-xl bg-slate-850 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
            I
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-xs font-bold text-slate-100 truncate">{session?.user?.name || 'Dr. Iswariya'}</p>
            <p className="text-[10px] text-brand-300 truncate capitalize font-medium">{(session?.user as any)?.role || 'Super Admin'}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center px-3 py-2 text-xs font-bold text-rose-400 rounded-xl hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
