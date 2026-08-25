import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Video, 
  FileText, 
  ShieldCheck, 
  HelpCircle, 
  LogOut,
  UserCheck
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: User | null;
  onRoleSwitch: (role: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onTabChange, 
  currentUser, 
  onRoleSwitch 
}) => {
  const navItems = [
    { id: 'operations', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'Map', icon: Map },
    { id: 'cameras', label: 'Cameras', icon: Video },
    { id: 'analytics', label: 'Reports', icon: FileText },
    { id: 'audit', label: 'System Health', icon: ShieldCheck },
  ];

  return (
    <aside className="w-60 bg-[#F8F5EE] border-r border-[#E8E0D2] flex flex-col justify-between select-none h-screen fixed left-0 top-0 z-30">
      {/* Brand Header matching reference image */}
      <div>
        <div className="pt-8 px-7 pb-6">
          <h1 className="text-2xl font-black tracking-tight text-[#221526] font-sans">
            City Traffic
          </h1>
          <p className="text-xs text-[#786C7C] font-medium tracking-normal mt-0.5">
            In Motion
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="px-4 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#EFE4D6] text-[#221526] shadow-sm'
                    : 'text-[#56495A] hover:text-[#221526] hover:bg-[#EFE7DC]/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#221526]' : 'text-[#786C7C]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Role Switcher & Bottom Utility matching reference */}
      <div className="p-4 space-y-3 pb-12">
        {/* Persona Switcher for Evaluation */}
        <div className="bg-[#EFE7DC]/60 p-2.5 rounded-xl border border-[#E2D6C6]">
          <div className="flex items-center justify-between text-[11px] text-[#786C7C] mb-1.5">
            <span className="flex items-center gap-1 font-medium">
              <UserCheck className="w-3 h-3 text-[#32193A]" />
              Persona:
            </span>
            <span className="text-[#32193A] font-bold">
              {currentUser?.role === 'ROLE_ADMIN' ? 'Admin' : currentUser?.role === 'ROLE_OPERATOR' ? 'Operator' : 'Analyst'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[10px]">
            <button
              onClick={() => onRoleSwitch('ROLE_OPERATOR')}
              className={`py-1 rounded font-bold transition ${
                currentUser?.role === 'ROLE_OPERATOR'
                  ? 'bg-[#32193A] text-white shadow'
                  : 'bg-white/70 text-[#56495A] hover:bg-white'
              }`}
            >
              Operator
            </button>
            <button
              onClick={() => onRoleSwitch('ROLE_ADMIN')}
              className={`py-1 rounded font-bold transition ${
                currentUser?.role === 'ROLE_ADMIN'
                  ? 'bg-[#32193A] text-white shadow'
                  : 'bg-white/70 text-[#56495A] hover:bg-white'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => onRoleSwitch('ROLE_ANALYST')}
              className={`py-1 rounded font-bold transition ${
                currentUser?.role === 'ROLE_ANALYST'
                  ? 'bg-[#32193A] text-white shadow'
                  : 'bg-white/70 text-[#56495A] hover:bg-white'
              }`}
            >
              Analyst
            </button>
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-[#56495A] hover:text-[#221526] transition rounded-lg font-medium">
            <HelpCircle className="w-4 h-4 text-[#786C7C]" />
            <span>Support</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-[#56495A] hover:text-red-700 transition rounded-lg font-medium">
            <LogOut className="w-4 h-4 text-[#786C7C]" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
