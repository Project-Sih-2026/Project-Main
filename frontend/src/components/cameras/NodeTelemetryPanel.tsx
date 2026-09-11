import React from 'react';
import { 
  Download, 
  Layers, 
  Scan, 
  Crosshair,
  Compass,
  Sliders
} from 'lucide-react';
import { Camera } from '../../types';

interface TelemetryProps {
  camera: Camera | null;
  onExport: () => void;
  onToggleOverlay: () => void;
  showOverlay: boolean;
  onTriggerOCR: () => void;
  onTrackJourney: () => void;
  onModulateData: () => void;
}

export const NodeTelemetryPanel: React.FC<TelemetryProps> = ({
  camera,
  onExport,
  onToggleOverlay,
  showOverlay,
  onTriggerOCR,
  onTrackJourney,
  onModulateData
}) => {
  if (!camera) return null;

  return (
    <div className="w-80 p-4 pl-0 select-none flex flex-col gap-4">
      {/* Top Node Telemetry Card in Deep Plum matching reference */}
      <div className="bg-[#0B2545] rounded-2xl p-5 text-[#F4F7FB] shadow-xl space-y-4">
        {/* Header */}
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#8FA6C4]">
          Node Telemetry
        </div>

        {/* Key-Value Telemetry Rows matching reference */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#8FA6C4]">Designation</span>
            <span className="font-bold text-[#F4F7FB] text-right">{camera.designation}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#8FA6C4]">Coordinates</span>
            <span className="font-mono text-[#C2D3E8] text-right">
              {camera.latitude.toFixed(4)}° N, {Math.abs(camera.longitude).toFixed(4)}° W
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#8FA6C4]">Status</span>
            <span className="flex items-center gap-1.5 font-semibold text-[#F4F7FB]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E86A67]" />
              Nominal
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#8FA6C4]">Throughput</span>
            <span className="font-mono font-semibold text-[#F4F7FB]">{camera.throughput_mbps} Mbps</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#8FA6C4]">Uptime</span>
            <span className="font-mono text-[#C2D3E8]">{camera.uptime_str}</span>
          </div>
        </div>

        {/* 2x2 Dark Plum Control Action Grid matching reference */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onExport}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#12335C] hover:bg-[#4D2659] text-[#F4F7FB] transition border border-[#1B4577]/50"
          >
            <Download className="w-4 h-4 mb-1 text-[#C2D3E8]" />
            <span className="text-[11px] font-semibold">Export</span>
          </button>

          <button
            onClick={onToggleOverlay}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition border ${
              showOverlay
                ? 'bg-[#6FA8DC] text-[#0B2545] border-[#6FA8DC] font-bold'
                : 'bg-[#12335C] hover:bg-[#4D2659] text-[#F4F7FB] border-[#1B4577]/50'
            }`}
          >
            <Layers className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-semibold">AI Overlay</span>
          </button>

          <button
            onClick={onTriggerOCR}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#12335C] hover:bg-[#4D2659] text-[#F4F7FB] transition border border-[#1B4577]/50"
          >
            <Scan className="w-4 h-4 mb-1 text-[#C2D3E8]" />
            <span className="text-[11px] font-semibold">Plate OCR</span>
          </button>

          <button
            onClick={onTrackJourney}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#12335C] hover:bg-[#4D2659] text-[#F4F7FB] transition border border-[#1B4577]/50"
          >
            <Crosshair className="w-4 h-4 mb-1 text-[#C2D3E8]" />
            <span className="text-[11px] font-semibold">Tracking</span>
          </button>
        </div>

        {/* Big Pastel Pink Highlight Button: MODULATE TRAINING DATA */}
        <button
          onClick={onModulateData}
          className="w-full py-3 px-4 rounded-xl bg-[#8FBCE6] hover:bg-[#A9CDF0] text-[#0B2545] font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
        >
          <Sliders className="w-4 h-4" />
          <span>Modulate Training Data</span>
        </button>
      </div>

      {/* GIS Context Card in Light Cream matching reference */}
      <div className="bg-white rounded-2xl p-4 border border-[#E3EAF3] shadow-md space-y-2">
        <div className="text-[10px] font-black uppercase tracking-wider text-[#5B6E8C]">
          GIS Context
        </div>

        <div className="relative w-full h-44 rounded-xl bg-[#EDE7DC] overflow-hidden border border-[#D2DEEC] flex items-center justify-center">
          {/* Light Tactical Intersection Roads Grid */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Diagonal road strips matching mockup */}
            <div className="w-full h-8 bg-[#D2DEEC] absolute rotate-45 transform" />
            <div className="w-full h-8 bg-[#D2DEEC] absolute -rotate-45 transform" />
            <div className="w-8 h-full bg-[#D2DEEC] absolute" />
            <div className="h-8 w-full bg-[#D2DEEC] absolute" />
          </div>

          {/* Center Dark Node Point matching mockup */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#0B2545] border-2 border-white shadow-lg" />
            <span className="text-[9px] font-mono font-bold text-[#0B2545] bg-white/90 px-1.5 py-0.2 rounded mt-1 shadow-sm border border-[#E2D6C6]">
              {camera.id}
            </span>
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-2 right-2 flex bg-white/90 rounded border border-[#D2DEEC] text-[10px] text-[#0B2545] shadow-sm">
            <button className="px-2 py-0.5 font-bold hover:bg-[#EDE7DC] border-r border-[#D2DEEC]">+</button>
            <button className="px-2 py-0.5 font-bold hover:bg-[#EDE7DC]">-</button>
          </div>
        </div>
      </div>
    </div>
  );
};
