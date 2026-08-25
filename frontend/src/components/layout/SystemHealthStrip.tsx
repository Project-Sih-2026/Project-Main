import React from 'react';
import { Wifi, Cpu, Activity, Database, FileText } from 'lucide-react';
import { SystemHealth } from '../../types';

interface HealthStripProps {
  health: SystemHealth | null;
  onNavigate: (tab: string) => void;
}

export const SystemHealthStrip: React.FC<HealthStripProps> = ({ health, onNavigate }) => {
  return (
    <footer className="h-8 bg-[#28142E] text-[#D8C8DC] px-8 flex items-center justify-between text-xs fixed bottom-0 left-60 right-0 z-20 select-none shadow-md">
      {/* Left Status matching reference */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E8A8BF] animate-pulse" />
        <span className="font-mono text-[11px] text-[#F8F5EE]">
          System Connectivity: <strong className="text-[#56D6B0] font-bold">{health?.connectivity_status || 'Optimal'}</strong>
        </span>
        <span className="text-[#644B69]">•</span>
        <span className="text-[10px] text-[#A690AC] font-mono">Ping: {health?.network_ping_ms || 18}ms</span>
      </div>

      {/* Right Action Links matching reference */}
      <div className="flex items-center gap-6 text-[11px] text-[#D8C8DC]">
        <button 
          onClick={() => onNavigate('audit')}
          className="hover:text-[#F3B6CA] transition cursor-pointer"
        >
          Logs
        </button>

        <button 
          onClick={() => onNavigate('cameras')}
          className="hover:text-[#F3B6CA] transition cursor-pointer"
        >
          Network Ping
        </button>

        <button 
          onClick={() => onNavigate('operations')}
          className="hover:text-[#F3B6CA] transition cursor-pointer font-semibold text-[#F8F5EE]"
        >
          Detections
        </button>
      </div>
    </footer>
  );
};
