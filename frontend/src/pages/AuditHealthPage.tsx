import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  Download, 
  Activity,
  UserCheck
} from 'lucide-react';
import { AuditLog, RetentionPolicy, SystemHealth } from '../types';
import { api } from '../services/api';

interface AuditPageProps {
  health: SystemHealth | null;
}

export const AuditHealthPage: React.FC<AuditPageProps> = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>([]);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [purgeStatus, setPurgeStatus] = useState<string | null>(null);

  const fetchLogs = () => {
    api.getAuditLogs(actionFilter).then(setAuditLogs).catch(() => {});
  };

  const fetchPolicies = () => {
    api.getRetentionPolicies().then(setRetentionPolicies).catch(() => {});
  };

  useEffect(() => {
    fetchLogs();
    fetchPolicies();
  }, [actionFilter]);

  const handlePurge = async (policyId: string) => {
    try {
      const res = await api.triggerPurge(policyId);
      setPurgeStatus(res.message);
      fetchPolicies();
      fetchLogs();
      setTimeout(() => setPurgeStatus(null), 4000);
    } catch (e) {
      setPurgeStatus('Purge execution error');
      setTimeout(() => setPurgeStatus(null), 4000);
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4.5rem-2rem)] select-none">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E3EAF3] flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-base font-black text-[#081A33] uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0B2545]" />
            System Governance, Audit Trails & Data Retention Policies
          </h1>
          <p className="text-xs text-[#5B6E8C]">
            Complete immutable accountability logging for searches, corrections, alerts, and exports
          </p>
        </div>

        {/* Exports */}
        <div className="flex items-center gap-3">
          <a
            href={api.getExportDetectionsUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-[#12335C] text-white font-bold text-xs transition shadow-sm"
          >
            <Download className="w-4 h-4 text-[#8FBCE6]" />
            <span>Export Detections CSV</span>
          </a>

          <a
            href={api.getExportAlertsUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E86A67] hover:bg-red-600 text-white font-bold text-xs transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Alerts CSV</span>
          </a>
        </div>
      </div>

      {purgeStatus && (
        <div className="p-3 bg-[#E8EEF6] border border-[#D2DEEC] rounded-xl text-[#0B2545] text-xs font-bold flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0B2545] animate-pulse" />
          <span>{purgeStatus}</span>
        </div>
      )}

      {/* Data Retention Policies Card */}
      <div className="bg-white border border-[#E3EAF3] rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-[#E3EAF3] pb-3">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#081A33]">
              Civic Data Lifecycle & Retention Windows
            </h2>
            <p className="text-[11px] text-[#5B6E8C]">
              Enforce statutory privacy retention limits with automatic or manual scheduled purging
            </p>
          </div>
          <span className="text-xs font-mono text-[#0B2545] font-bold">Policy Governance Active</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {retentionPolicies.map((pol) => (
            <div key={pol.id} className="p-4 rounded-xl bg-[#F6F8FB] border border-[#E3EAF3] space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#081A33]">{pol.name}</span>
                <span className="font-mono text-[#0B2545] font-bold px-2 py-0.5 rounded bg-white border border-[#D2DEEC]">
                  {pol.retention_days} Days
                </span>
              </div>

              <div className="text-[#5B6E8C] text-[11px]">
                Data Target: <strong className="text-[#0B2545] font-mono">{pol.data_type}</strong>
              </div>

              <div className="text-[#5B6E8C] text-[11px]">
                Auto Purge: <span className={pol.auto_purge_enabled ? 'text-[#42C98A] font-bold' : 'text-[#5B6E8C]'}>{pol.auto_purge_enabled ? 'Enabled (Daily 00:00 UTC)' : 'Manual Override'}</span>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#E3EAF3]">
                <span className="text-[10px] text-[#5B6E8C]">
                  {pol.last_purged_at ? `Purged: ${new Date(pol.last_purged_at).toLocaleDateString()}` : 'Never purged'}
                </span>
                <button
                  onClick={() => handlePurge(pol.id)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#0B2545] hover:text-white border border-[#D2DEEC] text-[#0B2545] font-bold text-[11px] transition flex items-center gap-1 shadow-sm"
                >
                  <Trash2 className="w-3 h-3" />
                  Execute Purge
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Audit Logs Table */}
      <div className="bg-white border border-[#E3EAF3] rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-[#E3EAF3] pb-3">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#081A33]">
              Immutable Operator Audit Logs
            </h2>
            <p className="text-[11px] text-[#5B6E8C]">
              Detailed access records for sensitive plate searches, OCR adjustments, and alert resolutions
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#5B6E8C] font-bold">Action Filter:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-[#F6F8FB] border border-[#D2DEEC] rounded-xl px-3 py-1.5 text-[#081A33] focus:border-[#0B2545] focus:outline-none cursor-pointer font-semibold shadow-sm"
            >
              <option value="all">All Actions</option>
              <option value="AUTH_LOGIN">User Logins</option>
              <option value="PLATE_SEARCH">Plate Searches</option>
              <option value="OCR_CORRECTION">OCR Corrections</option>
              <option value="ALERT_STATE_CHANGE">Alert Triage Changes</option>
              <option value="DATA_EXPORT">Data Exports</option>
              <option value="RETENTION_PURGE">Retention Purges</option>
            </select>
          </div>
        </div>

        <div className="border border-[#E3EAF3] rounded-xl overflow-hidden bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8FB] text-[#5B6E8C] font-mono uppercase text-[10px] border-b border-[#E3EAF3]">
              <tr>
                <th className="p-3.5">Log ID</th>
                <th className="p-3.5">Timestamp (UTC)</th>
                <th className="p-3.5">Operator</th>
                <th className="p-3.5">Action Type</th>
                <th className="p-3.5">Target</th>
                <th className="p-3.5">Structured Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EAF3]/70 text-[#334E73]">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[#5B6E8C]">
                    No audit records match current filter.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F6F8FB] transition">
                    <td className="p-3.5 font-mono text-[#5B6E8C]">{log.id}</td>
                    <td className="p-3.5 font-mono text-[#5B6E8C]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-bold text-[#081A33] flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#0B2545]" />
                      {log.username}
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-[#0B2545] px-2 py-0.5 rounded bg-[#F6F8FB] border border-[#D2DEEC] text-[10px]">
                        {log.action_type}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[#334E73]">
                      {log.target_type ? `${log.target_type}: ${log.target_id || ''}` : 'SYSTEM'}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#5B6E8C] truncate max-w-md">
                      {log.details_json || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
