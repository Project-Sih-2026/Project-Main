import React, { useState } from 'react';
import { X, Plus, Trash2, Shield } from 'lucide-react';
import { WatchlistItem } from '../../types';
import { api } from '../../services/api';

interface WatchlistModalProps {
  watchlists: WatchlistItem[];
  onClose: () => void;
  onRefresh: () => void;
}

export const WatchlistManagerModal: React.FC<WatchlistModalProps> = ({
  watchlists,
  onClose,
  onRefresh
}) => {
  const [plate, setPlate] = useState('');
  const [category, setCategory] = useState('STOLEN_VEHICLE_REPORT');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [description, setDescription] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await api.addWatchlist({
        normalized_plate: plate.trim(),
        category,
        severity,
        description: description.trim(),
        case_number: caseNumber.trim() || undefined,
        is_active: true
      });
      setPlate('');
      setDescription('');
      setCaseNumber('');
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await api.deactivateWatchlist(id);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-white border border-[#E3EAF3] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E3EAF3] flex items-center justify-between bg-[#F6F8FB]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0B2545] flex items-center justify-center text-[#8FBCE6] shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#081A33]">Watchlist & Blacklist Registry</h2>
              <p className="text-xs text-[#5B6E8C]">Configure monitored license plates and investigative advisories</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-[#5B6E8C] hover:text-[#081A33] hover:bg-[#E8EEF6] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Add New Watchlist Form */}
          <form onSubmit={handleAdd} className="bg-[#F6F8FB] p-5 rounded-2xl border border-[#E3EAF3] space-y-3 shadow-sm">
            <h3 className="font-black text-[#0B2545] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#0B2545]" /> Add Vehicle To Watchlist
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[#5B6E8C] mb-1 font-bold">Plate Number:</label>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="e.g. MH12DE5678"
                  className="w-full font-mono bg-white border border-[#D2DEEC] rounded-xl p-2.5 text-[#0B2545] font-black uppercase focus:border-[#0B2545] focus:outline-none shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-[#5B6E8C] mb-1 font-bold">Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-[#D2DEEC] rounded-xl p-2.5 text-[#081A33] font-semibold focus:border-[#0B2545] focus:outline-none cursor-pointer"
                >
                  <option value="STOLEN_VEHICLE_REPORT">Stolen Vehicle Report</option>
                  <option value="WARRANT_ADVISORY">Municipal Warrant Advisory</option>
                  <option value="TRAFFIC_VIOLATION">Traffic Violation Advisory</option>
                  <option value="AMBER_ALERT_ASSIST">Amber Alert Assistance</option>
                  <option value="GENERAL_INVESTIGATION">General Investigation</option>
                </select>
              </div>

              <div>
                <label className="block text-[#5B6E8C] mb-1 font-bold">Severity:</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full bg-white border border-[#D2DEEC] rounded-xl p-2.5 text-[#081A33] focus:border-[#0B2545] focus:outline-none cursor-pointer font-bold"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[#5B6E8C] mb-1 font-bold">Advisory Description:</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Reason for surveillance and dispatcher instructions..."
                  className="w-full bg-white border border-[#D2DEEC] rounded-xl p-2.5 text-[#081A33] focus:border-[#0B2545] focus:outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[#5B6E8C] mb-1 font-bold">Case Reference #:</label>
                <input
                  type="text"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  placeholder="e.g. POL-2026-904"
                  className="w-full font-mono bg-white border border-[#D2DEEC] rounded-xl p-2.5 text-[#0B2545] focus:border-[#0B2545] focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#0B2545] text-white font-black hover:bg-[#12335C] transition shadow-md"
              >
                {isSubmitting ? 'Registering...' : 'Register Plate to Watchlist'}
              </button>
            </div>
          </form>

          {/* Active Watchlists Table */}
          <div className="space-y-3">
            <h3 className="font-black text-[#081A33] uppercase tracking-wider text-[11px]">
              Active Monitored Watchlist Entries ({watchlists.filter(w => w.is_active).length})
            </h3>
            
            <div className="border border-[#E3EAF3] rounded-2xl overflow-hidden bg-white shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-[#F6F8FB] text-[#5B6E8C] font-mono uppercase text-[10px] border-b border-[#E3EAF3]">
                  <tr>
                    <th className="p-3.5">Plate</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Severity</th>
                    <th className="p-3.5">Case #</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EAF3]/70 text-[#334E73]">
                  {watchlists.filter(w => w.is_active).map((w) => (
                    <tr key={w.id} className="hover:bg-[#F6F8FB] transition">
                      <td className="p-3.5 font-mono font-black text-[#0B2545]">{w.normalized_plate}</td>
                      <td className="p-3.5 font-bold text-[#081A33]">{w.category.replace(/_/g, ' ')}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                          w.severity === 'CRITICAL' ? 'bg-[#E86A67]/20 text-[#E86A67]' : 'bg-[#8FBCE6] text-[#0B2545]'
                        }`}>
                          {w.severity}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono">{w.case_number || '—'}</td>
                      <td className="p-3.5 truncate max-w-xs">{w.description}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeactivate(w.id)}
                          className="p-1.5 text-[#5B6E8C] hover:text-[#E86A67] transition"
                          title="Deactivate Watchlist Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
