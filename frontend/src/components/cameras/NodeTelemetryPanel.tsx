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
      <div className="bg-[#28142E] rounded-2xl p-5 text-[#F8F5EE] shadow-xl space-y-4">
        {/* Header */}
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#A690AC]">
          Node Telemetry
        </div>

        {/* Key-Value Telemetry Rows matching reference */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#A690AC]">Designation</span>
            <span className="font-bold text-[#F8F5EE] text-right">{camera.designation}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#A690AC]">Coordinates</span>
            <span className="font-mono text-[#D8C8DC] text-right">
              {camera.latitude.toFixed(4)}° N, {Math.abs(camera.longitude).toFixed(4)}° W
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#A690AC]">Status</span>
            <span className="flex items-center gap-1.5 font-semibold text-[#F8F5EE]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E86A67]" />
              Nominal
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#A690AC]">Throughput</span>
            <span className="font-mono font-semibold text-[#F8F5EE]">{camera.throughput_mbps} Mbps</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#A690AC]">Uptime</span>
            <span className="font-mono text-[#D8C8DC]">{camera.uptime_str}</span>
          </div>
        </div>

        {/* 2x2 Dark Plum Control Action Grid matching reference */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onExport}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#3D1E47] hover:bg-[#4D2659] text-[#F8F5EE] transition border border-[#4F2B5B]/50"
          >
            <Download className="w-4 h-4 mb-1 text-[#D8C8DC]" />
            <span className="text-[11px] font-semibold">Export</span>
          </button>

          <button
            onClick={onToggleOverlay}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition border ${
              showOverlay
                ? 'bg-[#E8A8BF] text-[#28142E] border-[#E8A8BF] font-bold'
                : 'bg-[#3D1E47] hover:bg-[#4D2659] text-[#F8F5EE] border-[#4F2B5B]/50'
            }`}
          >
            <Layers className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-semibold">AI Overlay</span>
          </button>

          <button
            onClick={onTriggerOCR}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#3D1E47] hover:bg-[#4D2659] text-[#F8F5EE] transition border border-[#4F2B5B]/50"
          >
            <Scan className="w-4 h-4 mb-1 text-[#D8C8DC]" />
            <span className="text-[11px] font-semibold">Plate OCR</span>
          </button>

          <button
            onClick={onTrackJourney}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#3D1E47] hover:bg-[#4D2659] text-[#F8F5EE] transition border border-[#4F2B5B]/50"
          >
            <Crosshair className="w-4 h-4 mb-1 text-[#D8C8DC]" />
            <span className="text-[11px] font-semibold">Tracking</span>
          </button>
        </div>

        {/* Big Pastel Pink Highlight Button: MODULATE TRAINING DATA */}
        <button
          onClick={onModulateData}
          className="w-full py-3 px-4 rounded-xl bg-[#F3B6CA] hover:bg-[#F8C6D6] text-[#28142E] font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
        >
          <Sliders className="w-4 h-4" />
          <span>Modulate Training Data</span>
        </button>
      </div>

      {/* GIS Context Card in Light Cream matching reference */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8E0D2] shadow-md space-y-2">
        <div className="text-[10px] font-black uppercase tracking-wider text-[#786C7C]">
          GIS Context
        </div>

        <div className="relative w-full h-44 rounded-xl bg-[#EDE7DC] overflow-hidden border border-[#DED3C4] flex items-center justify-center">
          {/* Light Tactical Intersection Roads Grid */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Diagonal road strips matching mockup */}
            <div className="w-full h-8 bg-[#DCD3C4] absolute rotate-45 transform" />
            <div className="w-full h-8 bg-[#DCD3C4] absolute -rotate-45 transform" />
            <div className="w-8 h-full bg-[#DCD3C4] absolute" />
            <div className="h-8 w-full bg-[#DCD3C4] absolute" />
          </div>

          {/* Center Dark Node Point matching mockup */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#28142E] border-2 border-white shadow-lg" />
            <span className="text-[9px] font-mono font-bold text-[#28142E] bg-white/90 px-1.5 py-0.2 rounded mt-1 shadow-sm border border-[#E2D6C6]">
              {camera.id}
            </span>
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-2 right-2 flex bg-white/90 rounded border border-[#DED3C4] text-[10px] text-[#28142E] shadow-sm">
            <button className="px-2 py-0.5 font-bold hover:bg-[#EDE7DC] border-r border-[#DED3C4]">+</button>
            <button className="px-2 py-0.5 font-bold hover:bg-[#EDE7DC]">-</button>
          </div>
        </div>
      </div>
    </div>
  );
};
