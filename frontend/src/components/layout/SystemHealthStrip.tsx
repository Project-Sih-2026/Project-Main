import React from 'react';
import { Wifi, Cpu, Activity, Database, FileText } from 'lucide-react';
import { SystemHealth } from '../../types';

interface HealthStripProps {
  health: SystemHealth | null;
  onNavigate: (tab: string) => void;
}

export const SystemHealthStrip: React.FC<HealthStripProps> = ({ health, onNavigate }) => {
  return (
    <footer className="h-8 bg-[#0B2545] text-[#C2D3E8] px-8 flex items-center justify-between text-xs fixed bottom-0 left-60 right-0 z-20 select-none shadow-md">
      {/* Left Status matching reference */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#6FA8DC] animate-pulse" />
        <span className="font-mono text-[11px] text-[#F4F7FB]">
          System Connectivity: <strong className="text-[#56D6B0] font-bold">{health?.connectivity_status || 'Optimal'}</strong>
        </span>
        <span className="text-[#644B69]">•</span>
        <span className="text-[10px] text-[#8FA6C4] font-mono">Ping: {health?.network_ping_ms || 18}ms</span>
      </div>

      {/* Right Action Links matching reference */}
      <div className="flex items-center gap-6 text-[11px] text-[#C2D3E8]">
        <button 
          onClick={() => onNavigate('audit')}
          className="hover:text-[#8FBCE6] transition cursor-pointer"
        >
          Logs
        </button>

        <button 
          onClick={() => onNavigate('cameras')}
          className="hover:text-[#8FBCE6] transition cursor-pointer"
        >
          Network Ping
        </button>

        <button 
          onClick={() => onNavigate('operations')}
          className="hover:text-[#8FBCE6] transition cursor-pointer font-semibold text-[#F4F7FB]"
        >
          Detections
        </button>
      </div>
    </footer>
  );
};
