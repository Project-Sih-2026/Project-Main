import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { Camera, Detection, AlertItem, AnalyticsKPIs } from '../types';
import { KPICardsRow } from '../components/analytics/KPICardsRow';

interface OperationsPageProps {
  cameras: Camera[];
  selectedCamera: Camera | null;
  onSelectCamera: (cam: Camera) => void;
  detections: Detection[];
  alerts: AlertItem[];
  kpis: AnalyticsKPIs | null;
  onReviewDetection: (det: Detection) => void;
  onTriageAlert: (alert: AlertItem) => void;
  onSearchPlate: (plate: string) => void;
  onSimulateDetection: (cameraId: string) => void;
}

export const OperationsPage: React.FC<OperationsPageProps> = ({
  cameras,
  selectedCamera,
  detections,
  alerts,
  kpis,
  onReviewDetection,
  onTriageAlert,
  onSimulateDetection
}) => {
  const [filterCamera, setFilterCamera] = useState('all');
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await onSimulateDetection(selectedCamera?.id || 'CAM-022');
    } finally {
      setIsSimulating(false);
    }
  };

  const filteredDetections = detections.filter(d => {
    if (filterCamera !== 'all' && d.camera_id !== filterCamera) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4.5rem-2rem)] select-none">
      {/* KPI Overview Row */}
      <KPICardsRow kpis={kpis} />

      {/* Main Operations Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Observation Stream & Quick Detections */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[#221526] uppercase tracking-wider">
                Live Camera Detections & AI Feed
              </h2>
              <p className="text-xs text-[#786C7C]">
                Real-time plate OCR extractions from active municipal nodes
              </p>
            </div>

            {/* Quick Actions & Filters */}
            <div className="flex items-center gap-3">
              <select
                value={filterCamera}
                onChange={(e) => setFilterCamera(e.target.value)}
                aria-label="Filter detections by camera node"
                className="bg-white border border-[#DED3C4] text-xs font-semibold text-[#221526] rounded-xl px-3 py-1.5 focus:border-[#28142E] focus:outline-none cursor-pointer shadow-sm"
              >
                <option value="all">All Camera Nodes</option>
                {cameras.map(c => (
                  <option key={c.id} value={c.id}>{c.id} - {c.designation}</option>
                ))}
              </select>

              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#28142E] text-white hover:bg-[#3D1E47] text-xs font-bold transition shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F3B6CA]" />
                <span>{isSimulating ? 'Processing Frame...' : 'Simulate Live Detection'}</span>
              </button>
            </div>
          </div>

          {/* Detections Feed Table */}
          <div className="bg-white border border-[#E8E0D2] rounded-2xl overflow-hidden shadow-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#786C7C] font-mono uppercase text-[10px] border-b border-[#E8E0D2]">
                <tr>
                  <th className="p-3.5">Camera Node</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Raw OCR</th>
                  <th className="p-3.5">Normalized / Verified</th>
                  <th className="p-3.5">Confidence</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E0D2]/70 text-[#56495A]">
                {filteredDetections.slice(0, 10).map((d) => (
                  <tr key={d.id} className="hover:bg-[#FAF7F2] transition">
                    <td className="p-3.5 font-mono text-[#221526] font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#28142E]" />
                      {d.camera_id}
                    </td>
                    <td className="p-3.5 font-mono text-[#786C7C]">
                      {new Date(d.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-3.5 font-mono text-[#221526] font-semibold">
                      {d.raw_plate_text}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-[#28142E]">
                      {d.corrected_plate_text || d.normalized_plate_text}
                    </td>
                    <td className="p-3.5 font-mono">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-[#EFE7DC] text-[#221526] font-bold">
                        {(d.confidence_score * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3.5">
                      {d.has_alert ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E86A67]/15 text-[#E86A67] border border-[#E86A67]/30">
                          <AlertTriangle className="w-3 h-3" />
                          Possible Match
                        </span>
                      ) : d.is_corrected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#56D6B0]/20 text-[#28142E]">
                          <CheckCircle2 className="w-3 h-3" />
                          Corrected
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#786C7C] font-semibold">Observed</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onReviewDetection(d)}
                        className="px-3 py-1 rounded-lg bg-[#EFE7DC] hover:bg-[#28142E] hover:text-white text-[#221526] font-bold transition shadow-sm"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Operational Alerts Queue Snapshot */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[#28142E] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#E86A67]" />
                Alert Queue ({alerts.filter(a => a.status !== 'DISMISSED' && a.status !== 'RESOLVED').length})
              </h2>
              <p className="text-xs text-[#786C7C]">Possible watchlist matches requiring review</p>
            </div>
          </div>

          <div className="bg-white border border-[#E8E0D2] rounded-2xl p-3 space-y-3 shadow-md max-h-[520px] overflow-y-auto">
            {alerts.filter(a => a.status !== 'DISMISSED' && a.status !== 'RESOLVED').length === 0 ? (
              <div className="text-center py-12 text-[#786C7C] text-xs">
                No active critical alerts in queue.
              </div>
            ) : (
              alerts.filter(a => a.status !== 'DISMISSED' && a.status !== 'RESOLVED').map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => onTriageAlert(alt)}
                  className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E0D2] hover:border-[#28142E] transition cursor-pointer space-y-2 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-[#28142E] bg-white px-2 py-0.5 rounded border border-[#DED3C4]">
                      {alt.plate_matched}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      alt.severity === 'CRITICAL' ? 'bg-[#E86A67]/20 text-[#E86A67]' : 'bg-[#F3B6CA] text-[#28142E]'
                    }`}>
                      {alt.severity}
                    </span>
                  </div>

                  <div className="text-xs text-[#221526] font-bold">
                    {alt.category.replace(/_/g, ' ')}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#786C7C] font-mono">
                    <span>Node: {alt.camera_id}</span>
                    <span>Status: <strong className="text-[#28142E]">{alt.status}</strong></span>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-[#28142E] font-bold group-hover:underline transition">
                    <span>Review required &rarr;</span>
                    <span>{new Date(alt.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
