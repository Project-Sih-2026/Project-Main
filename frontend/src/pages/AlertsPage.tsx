import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Shield
} from 'lucide-react';
import { AlertItem, WatchlistItem } from '../types';
import { WatchlistManagerModal } from '../components/alerts/WatchlistManagerModal';

interface AlertsPageProps {
  alerts: AlertItem[];
  watchlists: WatchlistItem[];
  onTriageAlert: (alert: AlertItem) => void;
  onRefreshAlerts: () => void;
  onRefreshWatchlists: () => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  watchlists,
  onTriageAlert,
  onRefreshAlerts,
  onRefreshWatchlists
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showWatchlistModal, setShowWatchlistModal] = useState<boolean>(false);

  const filteredAlerts = alerts.filter((a) => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4.5rem-2rem)] select-none">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8E0D2] flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-base font-black text-[#221526] uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#E86A67]" />
            Watchlist Alerts & Operational Triage Queue
          </h1>
          <p className="text-xs text-[#786C7C]">
            Review and dispatch automated watchlist match advisories
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWatchlistModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#28142E] hover:bg-[#3D1E47] text-white text-xs font-bold transition shadow-sm"
          >
            <Shield className="w-4 h-4 text-[#F3B6CA]" />
            <span>Manage Watchlists ({watchlists.filter(w => w.is_active).length})</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="text-[#786C7C] font-bold">Filter Status:</span>
          <div className="flex bg-white rounded-xl p-1 border border-[#E8E0D2] shadow-sm">
            {['all', 'NEW', 'ACKNOWLEDGED', 'ASSIGNED', 'ESCALATED', 'RESOLVED', 'DISMISSED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  filterStatus === st ? 'bg-[#28142E] text-white shadow' : 'text-[#56495A] hover:text-[#221526]'
                }`}
              >
                {st === 'all' ? 'All Alerts' : st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#786C7C] font-bold">Severity:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-white border border-[#E8E0D2] text-xs font-semibold rounded-xl px-3 py-1.5 text-[#221526] focus:border-[#28142E] focus:outline-none cursor-pointer shadow-sm"
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white border border-[#E8E0D2] rounded-2xl overflow-hidden shadow-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF7F2] text-[#786C7C] font-mono uppercase text-[10px] border-b border-[#E8E0D2]">
            <tr>
              <th className="p-4">Alert ID</th>
              <th className="p-4">Matched Plate</th>
              <th className="p-4">Advisory Category</th>
              <th className="p-4">Camera Node</th>
              <th className="p-4">Severity</th>
              <th className="p-4">Triage Status</th>
              <th className="p-4">Timestamp</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E0D2]/70 text-[#56495A]">
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[#786C7C]">
                  No alerts match current filter criteria.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alt) => (
                <tr key={alt.id} className="hover:bg-[#FAF7F2] transition">
                  <td className="p-4 font-mono text-[#786C7C]">{alt.id}</td>
                  <td className="p-4">
                    <span className="font-mono font-bold text-sm text-[#28142E] bg-[#FAF7F2] px-2.5 py-1 rounded border border-[#DED3C4]">
                      {alt.plate_matched}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-[#221526]">
                    {alt.category.replace(/_/g, ' ')}
                  </td>
                  <td className="p-4 font-mono text-[#56495A]">{alt.camera_id}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                      alt.severity === 'CRITICAL'
                        ? 'bg-[#E86A67]/20 text-[#E86A67] border border-[#E86A67]/30'
                        : alt.severity === 'HIGH'
                        ? 'bg-[#F3B6CA] text-[#28142E]'
                        : 'bg-[#56D6B0]/20 text-[#28142E]'
                    }`}>
                      {alt.severity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-bold font-mono text-xs ${
                      alt.status === 'NEW'
                        ? 'text-[#E86A67]'
                        : alt.status === 'ACKNOWLEDGED' || alt.status === 'ASSIGNED'
                        ? 'text-[#28142E]'
                        : alt.status === 'RESOLVED'
                        ? 'text-[#42C98A]'
                        : 'text-[#786C7C]'
                    }`}>
                      {alt.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[#786C7C]">
                    {new Date(alt.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onTriageAlert(alt)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#28142E] hover:bg-[#3D1E47] text-white font-bold transition shadow-sm"
                    >
                      Triage &rarr;
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Watchlist Manager Modal */}
      {showWatchlistModal && (
        <WatchlistManagerModal
          watchlists={watchlists}
          onClose={() => setShowWatchlistModal(false)}
          onRefresh={() => {
            onRefreshWatchlists();
            onRefreshAlerts();
          }}
        />
      )}
    </div>
  );
};
