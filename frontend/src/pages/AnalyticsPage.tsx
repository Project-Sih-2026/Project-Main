import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download,
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { AnalyticsKPIs, VolumeTrendPoint, HotspotIntersection } from '../types';
import { KPICardsRow } from '../components/analytics/KPICardsRow';
import { api } from '../services/api';

interface AnalyticsPageProps {
  kpis: AnalyticsKPIs | null;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ kpis }) => {
  const [volumeTrends, setVolumeTrends] = useState<VolumeTrendPoint[]>([]);
  const [hotspots, setHotspots] = useState<HotspotIntersection[]>([]);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    api.getVolumeTrends().then(setVolumeTrends).catch(() => {});
    api.getHotspots().then(setHotspots).catch(() => {});
  }, [timeRange]);

  const vehicleDistribution = [
    { type: 'Sedans', count: 48, pct: '48%' },
    { type: 'SUVs', count: 26, pct: '26%' },
    { type: 'Transit Vans', count: 12, pct: '12%' },
    { type: 'Commercial Trucks', count: 10, pct: '10%' },
    { type: 'Motorcycles', count: 4, pct: '4%' },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4.5rem-2rem)] select-none">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8E0D2] flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-base font-black text-[#221526] uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#28142E]" />
            Civic Traffic Volume & Vehicle Movement Analytics
          </h1>
          <p className="text-xs text-[#786C7C]">
            Aggregated vehicle flow metrics across city sectors (no individualized profiling)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#FAF7F2] border border-[#DED3C4] text-xs font-bold text-[#221526] rounded-xl px-3.5 py-2 focus:border-[#28142E] focus:outline-none cursor-pointer shadow-sm"
          >
            <option value="24h">Past 24 Hours</option>
            <option value="7d">Past 7 Days</option>
            <option value="30d">Past 30 Days</option>
          </select>

          <a
            href={api.getExportDetectionsUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#28142E] hover:bg-[#3D1E47] text-white font-bold text-xs transition shadow-sm"
          >
            <Download className="w-4 h-4 text-[#F3B6CA]" />
            <span>Export Analytics CSV</span>
          </a>
        </div>
      </div>

      {/* KPI Cards Row */}
      <KPICardsRow kpis={kpis} />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left 2 Cols: 24h Volume Trends Chart */}
        <div className="col-span-2 bg-white border border-[#E8E0D2] rounded-2xl p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E0D2] pb-3">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#221526]">
                Volume vs Time Distribution (Events vs Unique Vehicles)
              </h2>
              <p className="text-[11px] text-[#786C7C]">
                Strict metric distinction: Total detection observations vs unique normalized plates
              </p>
            </div>
            <span className="text-xs font-mono text-[#28142E] font-bold">24-Hour Cycle</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalEventsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#28142E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#28142E" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="uniquePlatesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8A8BF" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#E8A8BF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="timestamp_hour" stroke="#786C7C" tick={{ fontSize: 10, fill: '#786C7C' }} />
                <YAxis stroke="#786C7C" tick={{ fontSize: 10, fill: '#786C7C' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#28142E', borderColor: '#E8A8BF', borderRadius: '8px', color: '#F8F5EE' }}
                  labelStyle={{ color: '#F8F5EE', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="detection_count" name="Total Detection Events" stroke="#28142E" strokeWidth={2} fillOpacity={1} fill="url(#totalEventsGrad)" />
                <Area type="monotone" dataKey="unique_plates" name="Unique Normalized Plates" stroke="#E8A8BF" strokeWidth={2} fillOpacity={1} fill="url(#uniquePlatesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Vehicle Type Breakdown */}
        <div className="bg-white border border-[#E8E0D2] rounded-2xl p-5 shadow-md space-y-4">
          <div className="border-b border-[#E8E0D2] pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#221526]">
              Observed Vehicle Classification
            </h2>
            <p className="text-[11px] text-[#786C7C]">Distribution by vehicle physical profile</p>
          </div>

          <div className="space-y-3">
            {vehicleDistribution.map((item) => (
              <div key={item.type} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-[#221526]">
                  <span>{item.type}</span>
                  <span className="font-mono text-[#28142E]">{item.pct}</span>
                </div>
                <div className="w-full bg-[#FAF7F2] h-2.5 rounded-full overflow-hidden border border-[#E8E0D2]">
                  <div
                    className="h-full bg-gradient-to-r from-[#28142E] to-[#E8A8BF] rounded-full"
                    style={{ width: item.pct }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Busiest Intersections Congestion Breakdown */}
      <div className="bg-white border border-[#E8E0D2] rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8E0D2] pb-3">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#221526]">
              Busiest Intersection Hotspots & Camera Activity
            </h2>
            <p className="text-[11px] text-[#786C7C]">Traffic flow density ranked by camera detections</p>
          </div>
          <span className="text-xs font-mono text-[#28142E] font-bold">Live Real-time Metrics</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {hotspots.map((h) => (
            <div key={h.camera_id} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E0D2] space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-[#28142E] text-sm">{h.camera_id}</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                  h.congestion_index > 0.7 ? 'bg-[#E86A67]/20 text-[#E86A67]' : 'bg-[#EFE7DC] text-[#28142E]'
                }`}>
                  {h.congestion_index > 0.7 ? 'HEAVY LOAD' : 'NOMINAL FLOW'}
                </span>
              </div>
              <div className="font-bold text-[#221526]">{h.designation}</div>
              <div className="text-[#786C7C] text-[11px] truncate">{h.location_address}</div>
              <div className="flex justify-between items-center pt-2 border-t border-[#E8E0D2] font-mono text-[11px]">
                <span className="text-[#786C7C]">Activity Count:</span>
                <span className="text-[#28142E] font-bold">{h.detection_count} vehicles/hr</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
